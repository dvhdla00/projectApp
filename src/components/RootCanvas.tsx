import { ReactFlowProvider, type Edge, type Node } from '@xyflow/react';
import { useMemo, useState } from 'react';
import BoardCanvas from './BoardCanvas';
import ProjectNode from './nodes/ProjectNode';
import NewProjectModal from './NewProjectModal';
import { useWorkspaceStore } from '../store/useWorkspaceStore';

const nodeTypes = { project: ProjectNode };

export default function RootCanvas() {
  const projects = useWorkspaceStore((s) => s.projects);
  const storeEdges = useWorkspaceStore((s) => s.edges);
  const activeTagFilter = useWorkspaceStore((s) => s.activeTagFilter);
  const moveProject = useWorkspaceStore((s) => s.moveProject);
  const deleteProject = useWorkspaceStore((s) => s.deleteProject);
  const addEdge = useWorkspaceStore((s) => s.addEdge);
  const deleteEdge = useWorkspaceStore((s) => s.deleteEdge);
  const enterProject = useWorkspaceStore((s) => s.enterProject);
  const [newProjectAt, setNewProjectAt] = useState<{ x: number; y: number } | null>(null);

  const visibleProjects = useMemo(
    () =>
      activeTagFilter.length === 0
        ? projects
        : projects.filter((p) => p.tags.some((tag) => activeTagFilter.includes(tag))),
    [projects, activeTagFilter],
  );

  const nodes: Node[] = useMemo(
    () =>
      visibleProjects.map((project) => ({
        id: project.id,
        type: 'project',
        position: { x: project.x, y: project.y },
        data: { project },
      })),
    [visibleProjects],
  );

  const edges: Edge[] = useMemo(() => {
    const visibleIds = new Set(visibleProjects.map((p) => p.id));
    return storeEdges
      .filter((e) => e.scope === 'root' && visibleIds.has(e.source) && visibleIds.has(e.target))
      .map((e) => ({ id: e.id, source: e.source, target: e.target }));
  }, [storeEdges, visibleProjects]);

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
        onPaneDoubleClick={(x, y) => setNewProjectAt({ x, y })}
        onNodeDoubleClick={(id) => enterProject(id)}
      />
      {newProjectAt && (
        <NewProjectModal
          x={newProjectAt.x}
          y={newProjectAt.y}
          onClose={() => setNewProjectAt(null)}
        />
      )}
    </ReactFlowProvider>
  );
}
