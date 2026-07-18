import { auth } from "@clerk/tanstack-react-start/server"
import { redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { desc, eq } from "drizzle-orm"

import { db } from "@/db"
import { workflows } from "@/db/schema"

export function listWorkflows(orgId: string) {
  return db
    .select()
    .from(workflows)
    .where(eq(workflows.orgId, orgId))
    .orderBy(desc(workflows.createdAt))
}

export async function createWorkflow(orgId: string, name: string) {
  const [workflow] = await db
    .insert(workflows)
    .values({ orgId, name, graph: {} })
    .returning()

  return workflow
}

export const createWorkflowFn = createServerFn({ method: "POST" })
  .validator((data: { name: string }) => data)
  .handler(async ({ data }) => {
    const { orgId } = await auth()

    if (!orgId) {
      throw new Error("No active organization")
    }

    const workflow = await createWorkflow(orgId, data.name)

    throw redirect({
      href: `/workflows/${workflow.id}`,
    })
  })
