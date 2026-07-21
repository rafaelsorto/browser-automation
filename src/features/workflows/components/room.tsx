import type { ReactNode } from "react"
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense"
import { Spinner } from "@/components/ui/spinner"

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
      authEndpoint={"/api/auth/liveblocks"}
    >
      <RoomProvider id={id}>
        <ClientSideSuspense
          fallback={
            <div className="flex min-h-svh items-center justify-center">
              <Spinner className="size-6" />
            </div>
          }
        >
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
