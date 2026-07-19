import { auth } from "@clerk/tanstack-react-start/server"
import { redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import {
  createWorkflow,
  getWorkflow,
  listWorkflows,
} from "@/features/workflows/data.server"
import {
  serializeWorkflow,
  serializeWorkflows,
} from "@/features/workflows/lib/serialize-workflow"

export const listWorkflowsFn = createServerFn().handler(async () => {
  const { orgId } = await auth()
  const workflows = orgId ? await listWorkflows(orgId) : []
  return serializeWorkflows(workflows)
})

export const getWorkflowFn = createServerFn()
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { orgId } = await auth()

    if (!orgId) {
      return null
    }

    const workflow = await getWorkflow(orgId, data.id)
    return workflow ? serializeWorkflow(workflow) : null
  })

export const createWorkflowFn = createServerFn({ method: "POST" })
  .validator((data: { name: string }) => data)
  .handler(async ({ data }) => {
    const { orgId } = await auth()

    if (!orgId) {
      throw new Error("No active organization")
    }

    const workflow = await createWorkflow(orgId, data.name)

    throw redirect({
      href: `/workflows/${workflow.id}`,
    })
  })
