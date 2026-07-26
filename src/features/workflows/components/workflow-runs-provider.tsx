import { createContext, useContext } from "react"
import type { ReactNode } from "react"
import { useRealtimeRunsWithTag } from "@trigger.dev/react-hooks"

import type {
  RunStep,
  runWorkflowTask,
} from "@/features/workflows/tasks/run-workflow"

export type WorkflowRun = {
  id: string
  status: string
  createdAt: Date
  isLive: boolean
  steps: RunStep[] | undefined
}

type WorkflowRunsValue = {
  runs: WorkflowRun[]
}

const WorkflowRunsContext = createContext<WorkflowRunsValue | null>(
  null
)

const LIVE_STATUSES = new Set(["QUEUED", "EXECUTING"])

function stepsFor(run: {
  output?: { steps?: RunStep[] }
  metadata?: Record<string, unknown>
}): RunStep[] | undefined {
  return (
    run.output?.steps ??
    (run.metadata?.steps as RunStep[] | undefined)
  )
}

export function WorkflowRunsProvider({
  workflowId,
  accessToken,
  children,
}: {
  workflowId: string
  accessToken: string
  children: ReactNode
}) {
  const { runs: realtimeRuns } = useRealtimeRunsWithTag<
    typeof runWorkflowTask
  >(`workflow:${workflowId}`, { accessToken })

  const runs: WorkflowRun[] = [...realtimeRuns]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .map((run) => ({
      id: run.id,
      status: run.status,
      createdAt: new Date(run.createdAt),
      isLive: LIVE_STATUSES.has(run.status),
      steps: stepsFor(run),
    }))

  return (
    <WorkflowRunsContext.Provider value={{ runs }}>
      {children}
    </WorkflowRunsContext.Provider>
  )
}

function useWorkflowRunsContext() {
  const context = useContext(WorkflowRunsContext)

  if (!context) {
    throw new Error(
      "Workflow runs hooks must be used within a WorkflowRunsProvider"
    )
  }

  return context
}

/** Every run for this workflow, newest first, each with its steps. */
export function useWorkflowRuns() {
  return useWorkflowRunsContext()
}

/** Steps from the most recent run — used by the canvas for live status. */
export function useLatestRunSteps() {
  const { runs } = useWorkflowRunsContext()
  const latest = runs[0]

  return {
    steps: latest?.steps,
    isLive: latest?.isLive ?? false,
  }
}
