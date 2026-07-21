import { auth, clerkClient } from "@clerk/tanstack-react-start/server"
import { Liveblocks } from "@liveblocks/node"
import { createFileRoute } from "@tanstack/react-router"

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
})

export const Route = createFileRoute("/api/auth/liveblocks")({
  server: {
    handlers: {
      POST: async () => {
        const { userId, orgId } = await auth()

        if (!userId) {
          return new Response("Unauthorized", { status: 401 })
        }

        const user = await clerkClient().users.getUser(userId)

        const { status, body } = await liveblocks.identifyUser(
          {
            userId: user.id,
            groupIds: orgId ? [orgId] : [],
          },
          {
            userInfo: {
              name:
                user.fullName ??
                user.firstName ??
                user.username ??
                "Anonymous",
              avatar: user.imageUrl,
            },
          },
        )

        return new Response(body, { status })
      },
    },
  },
})
