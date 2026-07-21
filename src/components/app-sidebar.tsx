import {
  OrganizationSwitcher,
  UserButton,
} from "@clerk/tanstack-react-start"
import { Link, useMatchRoute, useRouter } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { PlusIcon, WorkflowIcon } from "lucide-react"
import type { ComponentProps } from "react"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { createWorkflowFn } from "@/features/workflows/data"
import { generateSlug } from "@/features/workflows/lib/generate-slug"
import type { SerializedWorkflow } from "@/features/workflows/lib/serialize-workflow"
import { Route } from "@/routes/_dashboard"

function WorkflowNav({
  workflows,
}: {
  workflows: SerializedWorkflow[]
}) {
  const { state, isMobile } = useSidebar()
  const matchRoute = useMatchRoute()
  const router = useRouter()
  const createWorkflow = useServerFn(createWorkflowFn)

  const handleCreateWorkflow = () => {
    void createWorkflow({ data: { name: generateSlug() } }).then(() =>
      router.invalidate(),
    )
  }

  if (state === "collapsed" && !isMobile) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Popover>
                <PopoverTrigger asChild>
                  <SidebarMenuButton>
                    <WorkflowIcon />
                    <span className="sr-only">Workflows</span>
                  </SidebarMenuButton>
                </PopoverTrigger>
                <PopoverContent side="right" align="start">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={handleCreateWorkflow}
                  >
                    <PlusIcon />
                    New workflow
                  </Button>
                  <Separator />
                  {workflows.map((workflow) => (
                    <Button
                      key={workflow.id}
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link
                        to="/workflows/$id"
                        params={{ id: workflow.id }}
                      >
                        {workflow.name}
                      </Link>
                    </Button>
                  ))}
                </PopoverContent>
              </Popover>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workflows</SidebarGroupLabel>
      <SidebarGroupAction
        title="New workflow"
        onClick={handleCreateWorkflow}
      >
        <PlusIcon />
        <span className="sr-only">New workflow</span>
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu>
          {workflows.map((workflow) => (
            <SidebarMenuItem key={workflow.id}>
              <SidebarMenuButton
                asChild
                isActive={
                  !!matchRoute({
                    to: "/workflows/$id",
                    params: { id: workflow.id },
                  })
                }
              >
                <Link to="/workflows/$id" params={{ id: workflow.id }}>
                  <span>{workflow.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AppSidebar({
  ...props
}: ComponentProps<typeof Sidebar>) {
  const { workflows } = Route.useLoaderData()

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-1 group-data-[collapsible=icon]:justify-center">
          <div className="mb-[-3px] min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <OrganizationSwitcher
              hidePersonal
              appearance={{
                elements: {
                  rootBox: "w-full",
                  organizationSwitcherTrigger:
                    "w-full justify-start gap-2 rounded-md px-2 py-1.5 hover:bg-sidebar-accent",
                  organizationSwitcherTriggerIcon: "opacity-60",
                  organizationPreviewAvatarBox: "size-6",
                  organizationSwitcherPopoverRootBox: {
                    pointerEvents: "auto",
                  },
                },
              }}
            />
          </div>
          <SidebarTrigger className="shrink-0" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <WorkflowNav workflows={workflows} />
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center justify-between gap-1 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:justify-center">
          <UserButton
            appearance={{
              elements: {
                userButtonPopoverRootBox: {
                  pointerEvents: "auto",
                },
              },
            }}
          />
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
