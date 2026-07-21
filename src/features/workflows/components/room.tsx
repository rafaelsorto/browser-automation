import type { ReactNode } from "react"
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense"

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
      publicApiKey={import.meta.env.VITE_LIVEBLOCKS_PUBLIC_API_KEY}
    >
      <RoomProvider id={id}>
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
