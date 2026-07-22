import toposort from "toposort"

import type { WorkflowGraph } from "@/db/schema"

export function validateGraph({
  nodes,
  edges,
}: WorkflowGraph): string[] {
  const problems: string[] = []

  const triggers = nodes.filter(
    (node) => node.data.kind === "trigger"
  ).length

  if (triggers !== 1) {
    problems.push(
      `A workflow needs exactly one Start trigger (found ${triggers})`
    )
  }

  if (edges.length === 0) {
    problems.push("Connect your nodes before running.")
  } else {
    try {
      toposort(edges.map((edge) => [edge.source, edge.target]))
    } catch {
      problems.push(
        "Wokflow has a cycle -- remove the loop before running."
      )
    }
  }

  return problems
}
