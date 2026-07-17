import { auth } from "@clerk/tanstack-react-start/server"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

const requireAuth = createServerFn().handler(async () => {
  const { isAuthenticated, userId } = await auth()

  if (!isAuthenticated) {
    throw redirect({
      to: "/sign-in/$",
      params: { _splat: "" },
    })
  }

  return { userId }
})

export const Route = createFileRoute("/test")({
  beforeLoad: async () => await requireAuth(),
  loader: async ({ context }) => ({ userId: context.userId }),
  component: TestPage,
})

function TestPage() {
  const { userId } = Route.useLoaderData()

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-2 text-sm leading-loose">
        <h1 className="font-medium">Protected test page</h1>
        <p>Redirect works — you are signed in.</p>
        <p className="text-muted-foreground">User ID: {userId}</p>
      </div>
    </div>
  )
}
