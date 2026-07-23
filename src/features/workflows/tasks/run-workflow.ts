import toposort from "toposort"
import { logger, metadata, task } from "@trigger.dev/sdk"
import { Stagehand } from "@browserbasehq/stagehand"
import { nodeExecutors } from "@/features/workflows/nodes/node-executors"
import { getWorkflow } from "@/features/workflows/data.server"
import { interpolate } from "@/features/workflows/lib/interpolate"

export type RunStep = {
  id: string
  status: "pending" | "running" | "done" | "failed"
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
      .map((id) => ({ id, status: "pending" }))

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

      const executor = nodeExecutors[node.data.type]

      const values = Object.fromEntries(
        Object.entries(node.data.values).map(([key, value]) => [
          key,
          interpolate(value, outputs),
        ])
      )

      try {
        outputs[id] = await executor({
          values,
          getStagehand,
        })
      } catch (error) {
        step.status = "failed"
        metadata.set("steps", steps)
        await metadata.flush()
        await stagehand?.close()
        throw error
      }

      step.status = "done"
      metadata.set("steps", steps)
    }

    await stagehand?.close()

    return { steps }
  },
})
