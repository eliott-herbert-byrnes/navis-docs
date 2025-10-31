// src/features/processes/components/editors/flow-editor.tsx

"use client";

import { useCallback, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
  Edge,
  useReactFlow,
  getRectOfNodes,
  getTransformForBounds,
} from "reactflow";
import { toPng } from "html-to-image";
import "reactflow/dist/style.css";
import { ProcessContent } from "./form/utils/process-edit-utils";
import { FlowToolbar } from "./editors/components/flow-toolbar";
import { StartNode } from "./editors/components/flow-node-start";
import { StepNode } from "./editors/components/flow-node-step";
import { DecisionNode } from "./editors/components/flow-node-decision";
import { EndNode } from "./editors/components/flow-node-end";
import { getLayoutedElements } from "./editors/utils/flow-layout";
import { toast } from "sonner";

export type FlowNodeType = "start" | "step" | "decision" | "end";

export type FlowNode = {
  id: string;
  type: FlowNodeType;
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
  };
};

export type FlowEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
};

export type FlowContent = {
  nodes: FlowNode[];
  edges: FlowEdge[];
};

type FlowEditorProps = {
  content: ProcessContent;
  onChange: (content: ProcessContent) => void;
  isPreview: boolean;
};

const nodeTypes = {
  start: StartNode,
  step: StepNode,
  decision: DecisionNode,
  end: EndNode,
};

export function FlowEditor({ content, onChange, isPreview }: FlowEditorProps) {
  const { fitView, getNodes } = useReactFlow();

  const updateNodeData = useCallback(
    (
      nodeId: string,
      newData: Partial<FlowNode["data"]>,
      currentNodes: Node[],
      currentEdges: Edge[]
    ) => {
      const newNodes = currentNodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      );
      return newNodes;
    },
    []
  );

  const initialFlow = content?.flow || {
    nodes: [
      {
        id: "start-1",
        type: "start",
        position: { x: 250, y: 0 },
        data: { label: "Start" },
      },
    ],
    edges: [],
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(initialFlow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlow.edges);

  const syncToParent = useCallback(
    (newNodes: Node[], newEdges: Edge[]) => {
      onChange({
        ...content,
        flow: {
          nodes: newNodes as FlowNode[],
          edges: newEdges as FlowEdge[],
        },
      });
    },
    [content, onChange]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      let label = "";

      if (sourceNode?.type === "decision") {
        label = connection.sourceHandle === "yes" ? "Yes" : "No";
      }

      const newEdge = {
        ...connection,
        label,
        style: {
          stroke: sourceNode?.type === "decision" ? "#eab308" : "#94a3b8",
        },
      };

      const newEdges = addEdge(newEdge, edges);
      setEdges(newEdges);
      syncToParent(nodes, newEdges);
    },
    [edges, nodes, setEdges, syncToParent]
  );

  const addNode = useCallback(
    (type: FlowNodeType) => {
      const newNode: FlowNode = {
        id: `${type}-${Date.now()}`,
        type,
        position: {
          x: Math.random() * 400 + 100,
          y: Math.random() * 400 + 100,
        },
        data: {
          label: type === "decision" ? "Decision?" : `New ${type}`,
        },
      };
      const newNodes = [...nodes, newNode];
      setNodes(newNodes);
      syncToParent(newNodes, edges);
    },
    [nodes, edges, setNodes, syncToParent]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      const newNodes = nodes.filter((n) => n.id !== nodeId);
      const newEdges = edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      );
      setNodes(newNodes);
      setEdges(newEdges);
      syncToParent(newNodes, newEdges);
    },
    [nodes, edges, setNodes, setEdges, syncToParent]
  );

  const handleNodeDataUpdate = useCallback(
    (nodeId: string, newData: Partial<FlowNode["data"]>) => {
      const updatedNodes = updateNodeData(nodeId, newData, nodes, edges);
      setNodes(updatedNodes);
      syncToParent(updatedNodes, edges);
    },
    [nodes, edges, setNodes, syncToParent, updateNodeData]
  );

  const handleAutoLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      "TB"
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    syncToParent(layoutedNodes, layoutedEdges);

    setTimeout(() => fitView(), 0);
    toast.success("Nodes arranged automatically");
  }, [nodes, edges, setNodes, setEdges, syncToParent, fitView]);

  const handleValidate = useCallback(() => {
    const issues: string[] = [];

    const connectedNodeIds = new Set<string>();
    edges.forEach((edge) => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });

    const disconnectedNodes = nodes.filter(
      (node) => !connectedNodeIds.has(node.id) && nodes.length > 1
    );

    if (disconnectedNodes.length > 0) {
      issues.push(`${disconnectedNodes.length} disconnected node(s) found`);
    }

    const startNodes = nodes.filter((n) => n.type === "start");
    if (startNodes.length === 0) {
      issues.push("No start node found");
    } else if (startNodes.length > 1) {
      issues.push(`${startNodes.length} start nodes found (should be 1)`);
    }

    const endNodes = nodes.filter((n) => n.type === "end");
    if (endNodes.length === 0) {
      issues.push("No end node found");
    }

    const unlabeledNodes = nodes.filter(
      (n) => !n.data.label || n.data.label.trim() === ""
    );
    if (unlabeledNodes.length > 0) {
      issues.push(`${unlabeledNodes.length} node(s) without labels`);
    }

    if (issues.length === 0) {
      toast.success("✓ No issues found!");
    } else {
      toast.error(
        <div>
          <div className="font-semibold">Flow validation issues:</div>
          <ul className="list-disc pl-4 mt-1">
            {issues.map((issue, i) => (
              <li key={i}>{issue}</li>
            ))}
          </ul>
        </div>,
        { duration: 5000 }
      );
    }
  }, [nodes, edges]);

  const handleExport = useCallback(() => {
    const nodesBounds = getRectOfNodes(getNodes());
    const transform = getTransformForBounds(
      nodesBounds,
      nodesBounds.width,
      nodesBounds.height,
      0.5,
      2
    );

    const viewport = document.querySelector(
      ".react-flow__viewport"
    ) as HTMLElement;

    if (!viewport) {
      toast.error("Could not export flow");
      return;
    }

    toPng(viewport, {
      backgroundColor: "#ffffff",
      width: nodesBounds.width,
      height: nodesBounds.height,
      style: {
        width: `${nodesBounds.width}px`,
        height: `${nodesBounds.height}px`,
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    })
      .then((dataUrl: string) => {
        const a = document.createElement("a");
        a.setAttribute("download", "flow-diagram.png");
        a.setAttribute("href", dataUrl);
        a.click();
        toast.success("Flow exported successfully!");
      })
      .catch(() => {
        toast.error("Failed to export flow");
      });
  }, [getNodes]);

  const nodesWithCallbacks = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onUpdateData: (newData: Partial<FlowNode["data"]>) =>
        handleNodeDataUpdate(node.id, newData),
      onDelete: () => deleteNode(node.id),
    },
  }));

  return (
    <div className="h-[600px] w-full relative">
      {!isPreview && (
        <FlowToolbar
          onAddNode={addNode}
          onAutoLayout={handleAutoLayout}
          onValidate={handleValidate}
          onExport={handleExport}
          className="absolute top-4 left-4 z-10"
        />
      )}

      <ReactFlow
        nodes={nodesWithCallbacks}
        edges={edges}
        onNodesChange={(changes) => {
          onNodesChange(changes);
          const updatedNodes = nodes;
          syncToParent(updatedNodes, edges);
        }}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={!isPreview}
        nodesConnectable={!isPreview}
        elementsSelectable={!isPreview}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
