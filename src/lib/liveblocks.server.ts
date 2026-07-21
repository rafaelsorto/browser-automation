import { Liveblocks, LiveblocksError } from "@liveblocks/node"

export const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
})

export async function ensureWorkflowRoom(
  roomId: string,
  orgId: string,
  title: string
) {
  try {
    return await liveblocks.getOrCreateRoom(roomId, {
      defaultAccesses: [],
      groupsAccesses: {
        [orgId]: ["room:write"],
      },
      organizationId: orgId,
      metadata: {
        title,
      },
    })
  } catch (error) {
    if (error instanceof LiveblocksError) {
      console.error(
        `Error getting or creating room: ${error.status} - ${error.message}`
      )
    } else {
      console.error(
        `Unexpected error ensuring Liveblocks room:`,
        error
      )
    }
    throw error
  }
}
