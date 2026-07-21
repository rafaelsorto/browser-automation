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

export async function deleteWorkflowRoom(roomId: string) {
  try {
    await liveblocks.deleteRoom(roomId)
  } catch (error) {
    if (error instanceof LiveblocksError) {
      // Room may never have been created, or was already removed.
      if (error.status === 404) {
        return
      }
      console.error(
        `Error deleting room: ${error.status} - ${error.message}`
      )
    } else {
      console.error(`Unexpected error deleting Liveblocks room:`, error)
    }
    throw error
  }
}
