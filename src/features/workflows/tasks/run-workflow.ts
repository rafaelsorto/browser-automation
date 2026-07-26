import toposort from "toposort"
import { logger, metadata, task } from "@trigger.dev/sdk"
import { Stagehand } from "@browserbasehq/stagehand"
import { nodeExecutors } from "@/features/workflows/nodes/node-executors"
import { getWorkflow } from "@/features/workflows/data.server"
import { interpolate } from "@/features/workflows/lib/interpolate"

import type { NodeType } from "@/features/workflows/nodes/node-registry"

/** JSON-serializable value — required for Trigger metadata + task output. */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

export type RunStep = {
  id: string
  type: NodeType
  title: string
  status: "pending" | "running" | "done" | "failed"
  durationMs?: number
  output?: JsonValue
  error?: string
}

export const runWorkflowTask = task({
  id: "run-workflow",
  run: async ({
    workflowId,
    orgId,
  }: {
    workflowId: string
    orgId: string
  }) => {
    const workflow = await getWorkflow(orgId, workflowId)

    if (!workflow || !workflow.graph) {
      throw new Error("Workflow not found or has no graph")
    }

    const { nodes, edges } = workflow.graph

    const byId = new Map(nodes.map((node) => [node.id, node]))

    const connected = new Set(
      edges.flatMap((edge) => [edge.source, edge.target])
    )

    const order = toposort
      .array(
        nodes.map((node) => node.id),
        edges.map((edge) => [edge.source, edge.target])
      )
      .filter((node) => connected.has(node))

    logger.log(`Running workflow ${workflow.name}`, {
      steps: order.length,
    })

    const steps: RunStep[] = order
      .filter((id) => byId.get(id)?.data.type !== "start")
      .map((id) => {
        const node = byId.get(id)!
        return {
          id,
          type: node.data.type,
          title: node.data.title,
          status: "pending" as const,
        }
      })

    metadata.set("steps", steps)

    let stagehand: Stagehand | undefined

    const getStagehand = async () => {
      if (stagehand) return stagehand

      stagehand = new Stagehand({
        env: "BROWSERBASE",
        apiKey: process.env.BROWSERBASE_API_KEY,
        model: "google/gemini-2.5-flash",
        disablePino: true,
      })

      await stagehand.init()

      return stagehand
    }

    const outputs: Record<string, unknown> = {}

    for (const id of order) {
      const node = byId.get(id)
      if (!node || node.data.type === "start") {
        continue
      }

      const step = steps.find((s) => s.id === id)!

      logger.log(`Running step: ${node.data.title}`)

      step.status = "running"
      metadata.set("steps", steps)
      await metadata.flush()

      const startedAt = Date.now()

      const executor = nodeExecutors[node.data.type]

      const values = Object.fromEntries(
        Object.entries(node.data.values).map(([key, value]) => [
          key,
          interpolate(value, outputs),
        ])
      )

      try {
        const output = (await executor({
          values,
          getStagehand,
        })) as JsonValue
        outputs[id] = output
        step.output = output
        step.durationMs = Date.now() - startedAt
        step.status = "done"
        metadata.set("steps", steps)
        await metadata.flush()
      } catch (error) {
        step.status = "failed"
        step.durationMs = Date.now() - startedAt
        step.error =
          error instanceof Error ? error.message : String(error)
        metadata.set("steps", steps)
        await metadata.flush()
        await stagehand?.close()
        throw error
      }
    }

    await stagehand?.close()

    return { steps }
  },
})
