import { auth } from "@clerk/tanstack-react-start/server"
import { redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { tasks } from "@trigger.dev/sdk"

import {
  createWorkflow,
  deleteWorkflow,
  getWorkflow,
  listWorkflows,
} from "@/features/workflows/data.server"
import {
  serializeWorkflow,
  serializeWorkflows,
} from "@/features/workflows/lib/serialize-workflow"
import {
  deleteWorkflowRoom,
  ensureWorkflowRoom,
} from "@/lib/liveblocks.server"
import type { helloWorldTask } from "@/trigger/example"

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

    if (!workflow) {
      return null
    }

    await ensureWorkflowRoom(workflow.id, orgId, workflow.name)
    return serializeWorkflow(workflow)
  })

export const createWorkflowFn = createServerFn({ method: "POST" })
  .validator((data: { name: string }) => data)
  .handler(async ({ data }) => {
    const { orgId } = await auth()

    if (!orgId) {
      throw new Error("No active organization")
    }

    const workflow = await createWorkflow(orgId, data.name)
    await ensureWorkflowRoom(workflow.id, orgId, workflow.name)

    throw redirect({
      href: `/workflows/${workflow.id}`,
    })
  })

export const runWorkflowFn = createServerFn({ method: "POST" })
  .validator((data: { workflowId: string }) => data)
  .handler(async ({ data }) => {
    const { orgId } = await auth()

    if (!orgId) {
      throw new Error("No active organization")
    }

    const workflow = await getWorkflow(orgId, data.workflowId)

    if (!workflow) {
      throw new Error("Workflow not found")
    }

    const handle = await tasks.trigger<typeof helloWorldTask>("hello-world", {
      message: `Run workflow ${workflow.id}`,
    })

    return handle
  })

export const deleteWorkflowFn = createServerFn({ method: "POST" })
  .validator((data: { workflowId: string }) => data)
  .handler(async ({ data }) => {
    const { orgId } = await auth()

    if (!orgId) {
      throw new Error("No active organization")
    }

    const workflow = await deleteWorkflow(orgId, data.workflowId)

    if (!workflow) {
      throw new Error("Workflow not found")
    }

    await deleteWorkflowRoom(workflow.id)

    throw redirect({
      href: "/",
    })
  })
