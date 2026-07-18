import { auth } from "@clerk/tanstack-react-start/server"
import {
  createFileRoute,
  Outlet,
  redirect,
} from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { listWorkflows } from "@/features/workflows/data"
import { serializeWorkflows } from "@/features/workflows/lib/serialize-workflow"

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

const loadWorkflows = createServerFn().handler(async () => {
  const { orgId } = await auth()
  const workflows = orgId ? await listWorkflows(orgId) : []
  return serializeWorkflows(workflows)
})

export const Route = createFileRoute("/_dashboard")({
  beforeLoad: async () => await requireAuth(),
  loader: async () => ({
    workflows: await loadWorkflows(),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <TooltipProvider>
      <SidebarProvider className="h-svh">
        <AppSidebar />
        <SidebarInset className="min-h-0 overflow-hidden border shadow-none!">
          <header className="flex h-12 shrink-0 items-center gap-2 px-3 md:hidden">
            <SidebarTrigger />
          </header>
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
