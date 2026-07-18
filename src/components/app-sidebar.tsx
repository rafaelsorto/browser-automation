import { OrganizationSwitcher, UserButton } from "@clerk/tanstack-react-start"
import { PlusIcon, WorkflowIcon } from "lucide-react"
import type { ComponentProps } from "react"

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

const WORKFLOWS = [
  "dominant-wasp",
  "honest-reindeer",
  "expected-llama",
  "essential-ocelot",
  "creepy-echidna",
  "eastern-silkworm",
  "cultural-lion",
  "proud-weasel",
  "regional-bonobo",
] as const

function WorkflowNav() {
  const { state, isMobile } = useSidebar()

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
                  <Button variant="ghost" className="w-full justify-start">
                    <PlusIcon />
                    New workflow
                  </Button>
                  <Separator />
                  {WORKFLOWS.map((workflow) => (
                    <Button
                      key={workflow}
                      variant="ghost"
                      className="w-full justify-start"
                    >
                      {workflow}
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
      <SidebarGroupAction title="New workflow">
        <PlusIcon />
        <span className="sr-only">New workflow</span>
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu>
          {WORKFLOWS.map((workflow, index) => (
            <SidebarMenuItem key={workflow}>
              <SidebarMenuButton isActive={index === 0}>
                <span>{workflow}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
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
        <WorkflowNav />
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center group-data-[collapsible=icon]:justify-center">
          <UserButton
            appearance={{
              elements: {
                userButtonPopoverRootBox: {
                  pointerEvents: "auto",
                },
              },
            }}
          />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
