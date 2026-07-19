import { and, desc, eq } from "drizzle-orm"

import { db } from "@/db"
import { workflows } from "@/db/schema"

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

export async function createWorkflow(orgId: string, name: string) {
  const [workflow] = await db
    .insert(workflows)
    .values({ orgId, name, graph: {} })
    .returning()

  return workflow
}
