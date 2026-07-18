import type { Workflow } from "@/db/schema"

type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json | undefined }

export type SerializedWorkflow = Omit<Workflow, "graph"> & {
  graph: Json
}

export function serializeWorkflow(
  workflow: Workflow,
): SerializedWorkflow {
  return {
    ...workflow,
    graph: workflow.graph as Json,
  }
}

export function serializeWorkflows(
  workflows: Workflow[],
): SerializedWorkflow[] {
  return workflows.map(serializeWorkflow)
}
