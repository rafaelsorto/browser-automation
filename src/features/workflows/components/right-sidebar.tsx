import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useRealtimeRun } from "@trigger.dev/react-hooks"
import { PlayIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { runWorkflowFn } from "@/features/workflows/data"
import type { helloWorldTask } from "@/trigger/example"

type RunHandle = {
  id: string
  publicAccessToken: string
}

const ACTIVE_STATUSES = new Set([
  "WAITING_FOR_DEPLOY",
  "QUEUED",
  "EXECUTING",
  "REATTEMPTING",
  "FROZEN",
  "DELAYED",
])

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function statusVariant(status: string) {
  if (status === "COMPLETED") return "default" as const
  if (
    status === "FAILED" ||
    status === "CRASHED" ||
    status === "SYSTEM_FAILURE" ||
    status === "TIMED_OUT" ||
    status === "CANCELED" ||
    status === "EXPIRED"
  ) {
    return "destructive" as const
  }
  return "secondary" as const
}

export function RightSidebar({ workflowId }: { workflowId: string }) {
  const runWorkflow = useServerFn(runWorkflowFn)
  const [handle, setHandle] = useState<RunHandle | null>(null)
  const [isTriggering, setIsTriggering] = useState(false)
  const [triggerError, setTriggerError] = useState<string | null>(null)

  const { run, error } = useRealtimeRun<typeof helloWorldTask>(handle?.id, {
    accessToken: handle?.publicAccessToken,
    enabled: !!handle,
    skipColumns: ["payload", "output"],
  })

  const isRunning = !!run && ACTIVE_STATUSES.has(run.status)

  const handleRun = async () => {
    setIsTriggering(true)
    setTriggerError(null)

    try {
      const result = await runWorkflow({ data: { workflowId } })
      setHandle({
        id: result.id,
        publicAccessToken: result.publicAccessToken,
      })
    } catch (err) {
      setTriggerError(
        err instanceof Error ? err.message : "Failed to run workflow"
      )
    } finally {
      setIsTriggering(false)
    }
  }

  return (
    <div className="flex size-full flex-col items-center justify-center gap-3 p-4">
      <Button
        onClick={() => void handleRun()}
        disabled={isTriggering || isRunning}
      >
        {isTriggering || isRunning ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <PlayIcon data-icon="inline-start" />
        )}
        {isTriggering ? "Starting…" : isRunning ? "Running…" : "Run"}
      </Button>

      {triggerError ? (
        <p className="text-center text-sm text-destructive">{triggerError}</p>
      ) : null}

      {error ? (
        <p className="text-center text-sm text-destructive">{error.message}</p>
      ) : null}

      {run ? (
        <Badge variant={statusVariant(run.status)}>
          {formatStatus(run.status)}
        </Badge>
      ) : null}
    </div>
  )
}
