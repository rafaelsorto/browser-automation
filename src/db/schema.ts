import {
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

import type { StepNodeType } from "@/features/workflows/nodes/node-registry"

// JSON-safe edge snapshot. Do not use React Flow's `Edge` here — its
// `label?: ReactNode` (and related style props) fail TanStack Start's
// createServerFn serializability check even though runtime payloads are plain JSON.
export type WorkflowEdge = {
  id: string
  source: string
  target: string
  sourceHandle?: string | null
  targetHandle?: string | null
  type?: string
  animated?: boolean
  selected?: boolean
  hidden?: boolean
  deletable?: boolean
  selectable?: boolean
  zIndex?: number
  ariaLabel?: string
  interactionWidth?: number
  label?: string
  data?: Record<string, string | number | boolean | null>
}

// Canonical, server-readable snapshot of the flow. Mirrors React Flow's own
// shape so a future executor can read it without remapping. Persisted by the
// run action; the live editing copy still lives in the Liveblocks room.
export type WorkflowGraph = {
  nodes: StepNodeType[]
  edges: WorkflowEdge[]
}

export const workflows = pgTable("workflows", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: text("org_id").notNull(),
  name: text("name").notNull(),
  graph: jsonb("graph").$type<WorkflowGraph>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export type Workflow = typeof workflows.$inferSelect
export type NewWorkflow = typeof workflows.$inferInsert
