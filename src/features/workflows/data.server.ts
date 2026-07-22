import { and, desc, eq } from "drizzle-orm"

import { db } from "@/db"
import { workflows } from "@/db/schema"
import type { Workflow, WorkflowGraph } from "@/db/schema"

export async function updateWorkflow({
  orgId,
  id,
  graph,
}: {
  orgId: string
  id: string
  graph: WorkflowGraph
}): Promise<Workflow | undefined> {
  const updated = await db
    .update(workflows)
    .set({ graph })
    .where(and(eq(workflows.orgId, orgId), eq(workflows.id, id)))
    .returning()

  return updated[0]
}

export function listWorkflows(orgId: string) {
  return db.query.workflows.findMany({
    where: eq(workflows.orgId, orgId),
    orderBy: desc(workflows.createdAt),
  })
}

export async function getWorkflow(orgId: string, id: string) {
  const workflow = await db.query.workflows.findFirst({
    where: and(eq(workflows.orgId, orgId), eq(workflows.id, id)),
  })

  return workflow
}

export async function createWorkflow(
  orgId: string,
  name: string,
): Promise<Workflow> {
  const created = await db
    .insert(workflows)
    .values({ orgId, name, graph: {} })
    .returning()

  const workflow = created[0]
  if (!workflow) {
    throw new Error("Failed to create workflow")
  }

  return workflow
}

export async function deleteWorkflow(
  orgId: string,
  id: string,
): Promise<Workflow | undefined> {
  const deleted = await db
    .delete(workflows)
    .where(and(eq(workflows.orgId, orgId), eq(workflows.id, id)))
    .returning()

  return deleted[0]
}
