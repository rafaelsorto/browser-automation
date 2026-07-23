import { createContext, useContext, type ReactNode } from "react"
import { useRealtimeRunsWithTag } from "@trigger.dev/react-hooks"

import type {
  RunStep,
  runWorkflowTask,
} from "@/features/workflows/tasks/run-workflow"

type LatestRunSteps = {
  steps: RunStep[] | undefined
  isLive: boolean
}

const WorkflowRunsContext = createContext<LatestRunSteps | null>(null)

const LIVE_STATUSES = new Set(["QUEUED", "EXECUTING"])

export function WorkflowRunsProvider({
  workflowId,
  accessToken,
  children,
}: {
  workflowId: string
  accessToken: string
  children: ReactNode
}) {
  const { runs } = useRealtimeRunsWithTag<typeof runWorkflowTask>(
    `workflow:${workflowId}`,
    { accessToken }
  )

  const latest = runs.reduce<(typeof runs)[number] | undefined>(
    (best, run) =>
      !best || new Date(run.createdAt) > new Date(best.createdAt)
        ? run
        : best,
    undefined
  )

  const steps =
    latest?.output?.steps ??
    (latest?.metadata?.steps as RunStep[] | undefined)

  const value: LatestRunSteps = {
    steps,
    isLive: !!latest && LIVE_STATUSES.has(latest.status),
  }

  return (
    <WorkflowRunsContext.Provider value={value}>
      {children}
    </WorkflowRunsContext.Provider>
  )
}

export function useLatestRunSteps() {
  const context = useContext(WorkflowRunsContext)

  if (!context) {
    throw new Error(
      "useLatestRunSteps must be used within a WorkflowRunsProvider"
    )
  }

  return context
}
