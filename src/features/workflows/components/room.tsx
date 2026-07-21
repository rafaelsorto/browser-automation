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
      publicApiKey={
        "pk_dev_D43pSoKUSBc5NO1DTZ4lwOiDqwacV4V_iMYAf24ta_smcfEEG9ZueYmQ8l79sRG-"
      }
    >
      <RoomProvider id={id}>
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
