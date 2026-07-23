import toposort from "toposort"
import { logger, task } from "@trigger.dev/sdk"
import { Stagehand } from "@browserbasehq/stagehand"
import { nodeExecutors } from "@/features/workflows/nodes/node-executors"
import { getWorkflow } from "@/features/workflows/data.server"
import { interpolate } from "@/features/workflows/lib/interpolate"

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

      logger.log(`Running step: ${node.data.title}`)

      const executor = nodeExecutors[node.data.type]

      const values = Object.fromEntries(
        Object.entries(node.data.values).map(([key, value]) => [
          key,
          interpolate(value, outputs),
        ])
      )

      outputs[id] = await executor({
        values,
        getStagehand,
      })
    }

    await stagehand?.close()

    return { steps: order.length }
  },
})
