import { useEffect, useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useRealtimeRun } from "@trigger.dev/react-hooks"
import { useReactFlow, useStore, useStoreApi } from "@xyflow/react"
import { MoreHorizontal, Play, Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { runWorkflowFn } from "@/features/workflows/data"
import { nodeRegistry } from "@/features/workflows/nodes/node-registry"
import { cn } from "@/lib/utils"

import type { ReactNode } from "react"
import type {
  NodeDefinition,
  NodeField,
  NodeType,
  StepNodeKind,
  StepNodeType,
} from "@/features/workflows/nodes/node-registry"
import type { helloWorldTask } from "@/trigger/example"

// This file builds up to the RightSidebar component exported at the bottom: a
// header with workflow actions (delete, run), then two tabs — a Toolbar for
// adding nodes and an Editor for tweaking the selected node. Each helper below is
// defined just above the block that uses it.

type RunHandle = {
  id: string
  publicAccessToken: string
}

const ACTIVE_STATUSES = new Set([
  "WAITING_FOR_DEPLOY",
  "QUEUED",
  "EXECUTING",
  "REATTEMPTING",
  "FROZEN",
  "DELAYED",
])

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function statusVariant(status: string) {
  if (status === "COMPLETED") return "default" as const
  if (
    status === "FAILED" ||
    status === "CRASHED" ||
    status === "SYSTEM_FAILURE" ||
    status === "TIMED_OUT" ||
    status === "CANCELED" ||
    status === "EXPIRED"
  ) {
    return "destructive" as const
  }
  return "secondary" as const
}

// ---------------------------------------------------------------------------
// Shared pieces — used by both the Toolbar and the Editor.
// ---------------------------------------------------------------------------

// The accent-colored icon chip, mirroring the node on the canvas.
function NodeIcon({
  type,
  className,
}: {
  type: NodeType
  className?: string
}) {
  const def = nodeRegistry[type]
  const Icon = def.icon
  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-md",
        def.accent,
        className
      )}
    >
      <Icon className="size-3.5" />
    </span>
  )
}

// A titled, scrollable panel. Each tab renders its content inside one.
function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-y border-border bg-card px-3 py-1.5 text-sm font-semibold">
        {icon}
        {title}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Editor tab — edits the fields of the selected node.
// ---------------------------------------------------------------------------

// A single editor field for a node property.
function FieldInput({
  field,
  value,
  onChange,
}: {
  field: NodeField
  value: string
  onChange: (value: string) => void
}) {
  // TODO: support a multiline field variant (textarea).
  return (
    <Input
      id={field.key}
      value={value}
      placeholder={field.placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

// The Editor tab: one input per field on the selected node, or an empty state.
function Inspector({ node }: { node: StepNodeType | undefined }) {
  const { updateNodeData } = useReactFlow<StepNodeType>()

  if (!node) {
    return (
      <Section title="Editor">
        <p className="p-3 text-sm text-muted-foreground">
          No node selected
        </p>
      </Section>
    )
  }

  const { type, title, values } = node.data
  const def: NodeDefinition = nodeRegistry[type]

  return (
    <Section title={title} icon={<NodeIcon type={type} />}>
      <div className="flex flex-col gap-3 p-3">
        {def.fields.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No properties
          </p>
        ) : (
          def.fields.map((field) => (
            <div key={field.key} className="flex flex-col gap-1.5">
              <Label htmlFor={field.key} className="text-xs">
                {field.label}
              </Label>
              <FieldInput
                field={field}
                value={values[field.key] ?? ""}
                onChange={(value) => {
                  updateNodeData(node.id, {
                    values: {
                      ...values,
                      [field.key]: value,
                    },
                  })
                }}
              />
            </div>
          ))
        )}
      </div>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Toolbar tab — adds nodes to the canvas, grouped by kind.
// ---------------------------------------------------------------------------

// The Toolbar's groups, one accordion section per node kind.
const sections: { kind: StepNodeKind; label: string }[] = [
  { kind: "trigger", label: "Triggers" },
  { kind: "action", label: "Actions" },
]

// Every node type from the registry, filtered into the groups below.
const definitions = Object.values(nodeRegistry)

// The Toolbar tab: a button per node type that adds it to the canvas.
function Palette() {
  const { addNodes, getNodes, screenToFlowPosition } =
    useReactFlow<StepNodeType>()
  const store = useStoreApi()

  const add = (type: NodeType) => {
    const def = nodeRegistry[type]
    const nodes = getNodes()

    if (
      def.kind === "trigger" &&
      nodes.some((node) => node.data.kind === "trigger")
    ) {
      toast.error("Only one trigger node is allowed")
      return
    }

    const bounds = store.getState().domNode?.getBoundingClientRect()
    const position = bounds
      ? screenToFlowPosition({
          x: bounds.left + bounds.width / 2,
          y: bounds.top + bounds.height / 2,
        })
      : { x: 0, y: 0 }

    const count = nodes.filter(
      (node) => node.data.type === type
    ).length

    addNodes({
      id: crypto.randomUUID(),
      type: "step",
      position,
      data: {
        type,
        kind: def.kind,
        title: `${def.label} ${count + 1}`,
        values: {},
      },
    })
  }

  return (
    <Section title="Toolbar">
      <Accordion
        type="multiple"
        defaultValue={sections.map((s) => s.kind)}
        className="px-3 py-2"
      >
        {sections.map((section) => (
          <AccordionItem
            key={section.kind}
            value={section.kind}
            className="not-last:border-b-0"
          >
            <AccordionTrigger className="py-2 text-xs font-medium text-muted-foreground hover:no-underline">
              {section.label}
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-0.5">
              {definitions
                .filter((def) => def.kind === section.kind)
                .map((def) => (
                  <Button
                    key={def.type}
                    variant="ghost"
                    onClick={() => add(def.type as NodeType)}
                    className="justify-start gap-2.5 px-1.5 text-xs"
                  >
                    <NodeIcon type={def.type as NodeType} />
                    {def.label}
                  </Button>
                ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Header — workflow-level actions shown above the tabs.
// ---------------------------------------------------------------------------

// The "..." menu for workflow-level actions.
function ActionsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        <DropdownMenuItem
          variant="destructive"
          className="text-xs [&_svg:not([class*='size-'])]:size-3.5"
          onSelect={() => {
            // TODO: delete the workflow, then navigate away.
          }}
        >
          <Trash2 />
          Delete workflow
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Kicks off a run of the current workflow via Trigger.dev.
function RunButton({ workflowId }: { workflowId: string }) {
  const runWorkflow = useServerFn(runWorkflowFn)
  const [handle, setHandle] = useState<RunHandle | null>(null)
  const [isTriggering, setIsTriggering] = useState(false)
  const [triggerError, setTriggerError] = useState<string | null>(
    null
  )

  const { run, error } = useRealtimeRun<typeof helloWorldTask>(
    handle?.id,
    {
      accessToken: handle?.publicAccessToken,
      enabled: !!handle,
      skipColumns: ["payload", "output"],
    }
  )

  const isRunning = !!run && ACTIVE_STATUSES.has(run.status)

  const handleRun = async () => {
    setIsTriggering(true)
    setTriggerError(null)

    try {
      const result = await runWorkflow({ data: { workflowId } })
      setHandle({
        id: result.id,
        publicAccessToken: result.publicAccessToken,
      })
    } catch (err) {
      setTriggerError(
        err instanceof Error ? err.message : "Failed to run workflow"
      )
    } finally {
      setIsTriggering(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        {run ? (
          <Badge variant={statusVariant(run.status)}>
            {formatStatus(run.status)}
          </Badge>
        ) : null}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => void handleRun()}
          disabled={isTriggering || isRunning}
        >
          {isTriggering || isRunning ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Play fill="primary" />
          )}
          {isTriggering
            ? "Starting…"
            : isRunning
              ? "Running…"
              : "Run"}
        </Button>
      </div>
      {triggerError ? (
        <p className="max-w-40 text-right text-xs text-destructive">
          {triggerError}
        </p>
      ) : null}
      {error ? (
        <p className="max-w-40 text-right text-xs text-destructive">
          {error.message}
        </p>
      ) : null}
    </div>
  )
}

// ---------------------------------------------------------------------------
// The sidebar itself — header on top, then the Toolbar / Editor tabs.
// ---------------------------------------------------------------------------

export function RightSidebar({ workflowId }: { workflowId: string }) {
  const [tab, setTab] = useState("toolbar")

  const selected = useStore((s) =>
    s.nodes.find((node) => node.selected)
  ) as StepNodeType | undefined

  const [prevSelected, setPrevSelected] = useState<
    string | undefined
  >(selected?.id)

  useEffect(() => {
    if (selected?.id !== prevSelected) {
      setPrevSelected(selected?.id)
      setTab("editor")
    }
  }, [selected?.id])

  return (
    <Tabs
      value={tab}
      onValueChange={setTab}
      className="size-full gap-0"
    >
      <div className="flex items-center justify-between border-b border-border p-2">
        <ActionsMenu />
        <RunButton workflowId={workflowId} />
      </div>
      <TabsList className="m-2 w-fit bg-background">
        <TabsTrigger
          value="toolbar"
          className="flex-none rounded-sm data-active:bg-accent! data-active:text-accent-foreground! data-active:shadow-none! dark:data-active:border-transparent!"
        >
          Toolbar
        </TabsTrigger>
        <TabsTrigger
          value="editor"
          className="flex-none rounded-sm data-active:bg-accent! data-active:text-accent-foreground! data-active:shadow-none! dark:data-active:border-transparent!"
        >
          Editor
        </TabsTrigger>
      </TabsList>
      <TabsContent value="toolbar" className="flex min-h-0 flex-col">
        <Palette />
      </TabsContent>
      <TabsContent value="editor" className="flex min-h-0 flex-col">
        <Inspector node={selected} />
      </TabsContent>
    </Tabs>
  )
}
