import { auth, clerkClient } from "@clerk/tanstack-react-start/server"
import { createServerFn } from "@tanstack/react-start"

function toUserInfo(user: {
  fullName: string | null
  firstName: string | null
  username: string | null
  imageUrl: string
}) {
  return {
    name: user.fullName ?? user.firstName ?? user.username ?? "Anonymous",
    avatar: user.imageUrl,
  }
}

export const resolveLiveblocksUsersFn = createServerFn({ method: "POST" })
  .validator((data: { userIds: string[] }) => data)
  .handler(async ({ data }) => {
    const { userId } = await auth()

    if (!userId) {
      throw new Error("Unauthorized")
    }

    if (data.userIds.length === 0) {
      return []
    }

    const { data: users } = await clerkClient().users.getUserList({
      userId: data.userIds,
      limit: data.userIds.length,
    })

    const usersById = new Map(users.map((user) => [user.id, user]))

    return data.userIds.map((id) => {
      const user = usersById.get(id)
      return user
        ? toUserInfo(user)
        : { name: "Unknown", avatar: "" }
    })
  })
