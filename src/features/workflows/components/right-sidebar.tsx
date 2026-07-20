import { useServerFn } from "@tanstack/react-start"
import { PlayIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { runWorkflowFn } from "@/features/workflows/data"

export function RightSidebar({ workflowId }: { workflowId: string }) {
  const runWorkflow = useServerFn(runWorkflowFn)

  const handleRun = () => {
    void runWorkflow({
      data: { workflowId },
    })
  }

  return (
    <div className="flex size-full items-center justify-center">
      <Button onClick={handleRun}>
        <PlayIcon data-icon="inline-start" />
        Run
      </Button>
    </div>
  )
}
