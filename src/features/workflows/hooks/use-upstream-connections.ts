import { useCallback } from "react"
import { useStore } from "@xyflow/react"
import type { Edge } from "@xyflow/react"

import { nodeRegistry } from "@/features/workflows/nodes/node-registry"
import type {
  NodeType,
  StepNodeType,
} from "@/features/workflows/nodes/node-registry"

export type UpstreamConnection = {
  token: string
  label: string
  type: NodeType
}

const EMPTY: UpstreamConnection[] = []

function collectUpstreamIds(nodeId: string, edges: Edge[]): string[] {
  const parentsByTarget = new Map<string, string[]>()

  for (const edge of edges) {
    const parents = parentsByTarget.get(edge.target)
    if (parents) {
      parents.push(edge.source)
    } else {
      parentsByTarget.set(edge.target, [edge.source])
    }
  }

  const upstream: string[] = []
  const seen = new Set<string>()
  const stack = [...(parentsByTarget.get(nodeId) ?? [])]

  while (stack.length > 0) {
    const id = stack.pop()
    if (!id || seen.has(id)) continue

    seen.add(id)
    upstream.push(id)

    const parents = parentsByTarget.get(id)
    if (parents) stack.push(...parents)
  }

  return upstream
}

function connectionsEqual(
  a: UpstreamConnection[],
  b: UpstreamConnection[]
): boolean {
  if (a === b) return true
  if (a.length !== b.length) return false

  return a.every(
    (connection, index) =>
      connection.token === b[index]?.token &&
      connection.label === b[index]?.label &&
      connection.type === b[index]?.type
  )
}

export function useUpstreamConnections(
  nodeId: string | undefined
): UpstreamConnection[] {
  return useStore(
    useCallback(
      (state): UpstreamConnection[] => {
        if (!nodeId) return EMPTY

        const nodes = state.nodes as StepNodeType[]
        const byId = new Map(nodes.map((node) => [node.id, node]))
        const connections: UpstreamConnection[] = []

        for (const id of collectUpstreamIds(nodeId, state.edges)) {
          const node = byId.get(id)
          if (!node) continue

          for (const output of nodeRegistry[node.data.type].outputs) {
            connections.push({
              token: `{{ ${id}.${output.path} }}`,
              label: `${node.data.title} · ${output.label}`,
              type: node.data.type,
            })
          }
        }

        return connections.length > 0 ? connections : EMPTY
      },
      [nodeId]
    ),
    connectionsEqual
  )
}
