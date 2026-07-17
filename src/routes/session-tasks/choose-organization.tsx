import { TaskChooseOrganization } from "@clerk/tanstack-react-start"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/session-tasks/choose-organization")({
  component: Page,
})

function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <TaskChooseOrganization redirectUrlComplete="/" />
    </div>
  )
}
