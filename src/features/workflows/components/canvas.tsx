import { useEffect, useState } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  ConnectionLineType,
  Panel,
} from "@xyflow/react"
import type { Edge, ColorMode, NodeTypes } from "@xyflow/react"
import { Cursors, useLiveblocksFlow } from "@liveblocks/react-flow"
import { useTheme } from "next-themes"
import { AvatarStack } from "@liveblocks/react-ui"
import "@xyflow/react/dist/style.css"
import "@liveblocks/react-flow/styles.css"
import "@liveblocks/react-ui/styles.css"

import { StepNode } from "@/features/workflows/components/step-node"
import type { StepNodeType } from "@/features/workflows/nodes/node-registry"

const nodeTypes: NodeTypes = {
  step: StepNode,
}

const initialNodes: StepNodeType[] = [
  {
    id: "start",
    type: "step",
    position: { x: 0, y: 0 },
    data: {
      type: "start",
      kind: "trigger",
      title: "Start",
      values: {},
    },
  },
]

const initialEdges: Edge[] = []

export function Canvas() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Keep SSR and the first client render on the same colorMode so React Flow
  // doesn't hydrate with a different light/dark class than the server HTML.
  const colorMode: ColorMode =
    mounted && resolvedTheme === "dark" ? "dark" : "light"

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDelete,
  } = useLiveblocksFlow({
    suspense: true,
    nodes: {
      initial: initialNodes,
    },
    edges: {
      initial: initialEdges,
    },
  })

  return (
    <div className="size-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        colorMode={colorMode}
        fitView
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: "var(--border)" }}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { stroke: "var(--border)" },
        }}
        style={
          {
            "--xy-background-color": "var(--background)",
            "--xy-edge-stroke-width": 2,
            "--xy-connectionline-stroke-width": 2,
          } as React.CSSProperties
        }
        maxZoom={1}
      >
        <Background />
        <Controls />
        <Cursors />
        <Panel position="top-right">
          <AvatarStack />
        </Panel>
      </ReactFlow>
    </div>
  )
}
