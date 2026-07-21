import { createFileRoute, notFound } from "@tanstack/react-router"
import type { ErrorComponentProps } from "@tanstack/react-router"
import { ReactFlowProvider } from "@xyflow/react"
import { AlertCircleIcon, SearchXIcon } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { WorkflowShell } from "@/features/workflows/components/workflow-shell"
import { getWorkflowFn } from "@/features/workflows/data"
import { Room } from "@/features/workflows/components/room"

export const Route = createFileRoute("/_dashboard/workflows/$id")({
  loader: async ({ params }) => {
    const workflow = await getWorkflowFn({ data: { id: params.id } })

    if (!workflow) {
      throw notFound()
    }

    return { workflow }
  },
  pendingMs: 0,
  pendingComponent: WorkflowPending,
  errorComponent: WorkflowError,
  notFoundComponent: WorkflowNotFound,
  component: WorkflowPage,
})

function WorkflowPending() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <Spinner className="size-6" />
    </div>
  )
}

function WorkflowError({ error }: ErrorComponentProps) {
  return (
    <div className="flex min-h-svh">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircleIcon />
          </EmptyMedia>
          <EmptyTitle className="text-base font-semibold">
            Something went wrong
          </EmptyTitle>
          <EmptyDescription>
            {error.message ||
              "Failed to load this workflow. Please try again."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}

function WorkflowNotFound() {
  return (
    <div className="flex min-h-svh">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon />
          </EmptyMedia>
          <EmptyTitle className="text-base font-semibold">
            Workflow not found
          </EmptyTitle>
          <EmptyDescription>
            This workflow does not exist or you do not have access to
            it.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}

function WorkflowPage() {
  const { workflow } = Route.useLoaderData()

  return (
    <Room id={workflow.id}>
      <ReactFlowProvider>
        <WorkflowShell workflowId={workflow.id} />
      </ReactFlowProvider>
    </Room>
  )
}
