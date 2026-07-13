import { ReactFlowProvider, type Edge, type Node } from '@xyflow/react';
import { useMemo } from 'react';
import BoardCanvas from './BoardCanvas';
import ProjectNode from './nodes/ProjectNode';
import { useWorkspaceStore } from '../store/useWorkspaceStore';

const nodeTypes = { project: ProjectNode };

export default function RootCanvas() {
  const projects = useWorkspaceStore((s) => s.projects);
  const storeEdges = useWorkspaceStore((s) => s.edges);
  const addProject = useWorkspaceStore((s) => s.addProject);
  const moveProject = useWorkspaceStore((s) => s.moveProject);
  const deleteProject = useWorkspaceStore((s) => s.deleteProject);
  const addEdge = useWorkspaceStore((s) => s.addEdge);
  const deleteEdge = useWorkspaceStore((s) => s.deleteEdge);
  const enterProject = useWorkspaceStore((s) => s.enterProject);

  const nodes: Node[] = useMemo(
    () =>
      projects.map((project) => ({
        id: project.id,
        type: 'project',
        position: { x: project.x, y: project.y },
        data: { project },
      })),
    [projects],
  );

  const edges: Edge[] = useMemo(
    () =>
      storeEdges
        .filter((e) => e.scope === 'root')
        .map((e) => ({ id: e.id, source: e.source, target: e.target })),
    [storeEdges],
  );

  return (
    <ReactFlowProvider>
      <BoardCanvas
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeMove={moveProject}
        onNodeDelete={deleteProject}
        onConnect={(source, target) => addEdge('root', source, target)}
        onEdgeDelete={deleteEdge}
        onPaneDoubleClick={(x, y) => addProject(x, y)}
        onNodeDoubleClick={(id) => enterProject(id)}
      />
    </ReactFlowProvider>
  );
}
