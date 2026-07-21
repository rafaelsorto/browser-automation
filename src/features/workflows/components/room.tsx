import { useRef, type ReactNode } from "react"
import { useNavigate, useRouter } from "@tanstack/react-router"
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useErrorListener,
  useEventListener,
  useSelf,
} from "@liveblocks/react/suspense"
import { toast } from "sonner"

import { Spinner } from "@/components/ui/spinner"
import { resolveLiveblocksUsersFn } from "@/features/workflows/liveblocks"

// Listens for workflow deletion (and room loss) so other editors leave cleanly.
function WorkflowDeletedListener() {
  const navigate = useNavigate()
  const router = useRouter()
  const self = useSelf()
  const handled = useRef(false)

  const leave = (message: string) => {
    if (handled.current) return
    handled.current = true
    toast.error(message)
    void navigate({ to: "/" }).then(() => router.invalidate())
  }

  useEventListener(({ event }) => {
    if (event.type !== "WORKFLOW_DELETED") return
    // The deleter already redirects via the server function — mark handled so
    // the connection-error fallback below does not also toast/navigate.
    if (event.deletedBy === self.id) {
      handled.current = true
      return
    }
    leave("This workflow was deleted")
  })

  useErrorListener((error) => {
    if (error.context.type !== "ROOM_CONNECTION_ERROR") return
    // Fallback when the room is deleted before the broadcast is received.
    leave("This workflow is no longer available")
  })

  return null
}

export function Room({
  id,
  children,
}: {
  id: string
  children: ReactNode
}) {
  return (
    <LiveblocksProvider
      throttle={16}
      authEndpoint="/api/auth/liveblocks"
      resolveUsers={async ({ userIds }) =>
        resolveLiveblocksUsersFn({ data: { userIds } })
      }
    >
      <RoomProvider id={id}>
        <ClientSideSuspense
          fallback={
            <div className="flex min-h-svh items-center justify-center">
              <Spinner className="size-6" />
            </div>
          }
        >
          <WorkflowDeletedListener />
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
