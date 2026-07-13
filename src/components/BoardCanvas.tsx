import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  ConnectionMode,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type NodeTypes,
} from '@xyflow/react';
import { useCallback, useEffect, useState } from 'react';

interface BoardCanvasProps {
  nodes: Node[];
  edges: Edge[];
  nodeTypes: NodeTypes;
  onNodeMove: (id: string, x: number, y: number) => void;
  onNodeDelete: (id: string) => void;
  onConnect: (source: string, target: string) => void;
  onEdgeDelete: (id: string) => void;
  onPaneDoubleClick: (x: number, y: number) => void;
  onNodeDoubleClick?: (id: string) => void;
}

export default function BoardCanvas({
  nodes: sourceNodes,
  edges: sourceEdges,
  nodeTypes,
  onNodeMove,
  onNodeDelete,
  onConnect,
  onEdgeDelete,
  onPaneDoubleClick,
  onNodeDoubleClick,
}: BoardCanvasProps) {
  const [nodes, setNodes] = useState(sourceNodes);
  const [edges, setEdges] = useState(sourceEdges);
  const { screenToFlowPosition } = useReactFlow();

  useEffect(() => setNodes(sourceNodes), [sourceNodes]);
  useEffect(() => setEdges(sourceEdges), [sourceEdges]);

  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
    for (const change of changes) {
      if (change.type === 'remove') onNodeDelete(change.id);
    }
  }, [onNodeDelete]);

  const handleNodeDragStop = useCallback(
    (_event: unknown, node: Node) => {
      onNodeMove(node.id, node.position.x, node.position.y);
    },
    [onNodeMove],
  );

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
    for (const change of changes) {
      if (change.type === 'remove') onEdgeDelete(change.id);
    }
  }, [onEdgeDelete]);

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) onConnect(connection.source, connection.target);
    },
    [onConnect],
  );

  const handlePaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('.react-flow__node') || target.closest('.react-flow__controls')) return;
      const { x, y } = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      onPaneDoubleClick(x, y);
    },
    [onPaneDoubleClick, screenToFlowPosition],
  );

  return (
    <div className="board-canvas-wrapper" onDoubleClickCapture={handlePaneDoubleClick}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onNodeDragStop={handleNodeDragStop}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeDoubleClick={(_e, node) => onNodeDoubleClick?.(node.id)}
        connectionMode={ConnectionMode.Loose}
        zoomOnDoubleClick={false}
        minZoom={0.2}
        maxZoom={2}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
        proOptions={{ hideAttribution: true }}
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
