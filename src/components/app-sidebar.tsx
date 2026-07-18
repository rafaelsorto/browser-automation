import { OrganizationSwitcher, UserButton } from "@clerk/tanstack-react-start"
import { PlusIcon, WorkflowIcon } from "lucide-react"
import type { ComponentProps } from "react"

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
                  <SidebarMenuButton isActive={index === 0} tooltip={workflow}>
                    <WorkflowIcon />
                    <span>{workflow}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
