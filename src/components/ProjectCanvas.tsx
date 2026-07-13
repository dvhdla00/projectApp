import { ReactFlowProvider, type Edge, type Node } from '@xyflow/react';
import { useMemo } from 'react';
import BoardCanvas from './BoardCanvas';
import NoteNode from './nodes/NoteNode';
import { useWorkspaceStore } from '../store/useWorkspaceStore';

const nodeTypes = { note: NoteNode };

export default function ProjectCanvas({ projectId }: { projectId: string }) {
  const notes = useWorkspaceStore((s) => s.notes);
  const storeEdges = useWorkspaceStore((s) => s.edges);
  const activeTagFilter = useWorkspaceStore((s) => s.activeTagFilter);
  const addNote = useWorkspaceStore((s) => s.addNote);
  const moveNote = useWorkspaceStore((s) => s.moveNote);
  const deleteNote = useWorkspaceStore((s) => s.deleteNote);
  const addEdge = useWorkspaceStore((s) => s.addEdge);
  const deleteEdge = useWorkspaceStore((s) => s.deleteEdge);

  const projectNotes = useMemo(
    () =>
      notes.filter(
        (n) =>
          n.projectId === projectId &&
          (activeTagFilter.length === 0 || n.tags.some((tag) => activeTagFilter.includes(tag))),
      ),
    [notes, projectId, activeTagFilter],
  );

  const nodes: Node[] = useMemo(
    () =>
      projectNotes.map((note) => ({
        id: note.id,
        type: 'note',
        position: { x: note.x, y: note.y },
        style: { width: note.width, height: note.height },
        data: { note },
      })),
    [projectNotes],
  );

  const edges: Edge[] = useMemo(() => {
    const visibleIds = new Set(projectNotes.map((n) => n.id));
    return storeEdges
      .filter(
        (e) => e.scope === projectId && visibleIds.has(e.source) && visibleIds.has(e.target),
      )
      .map((e) => ({ id: e.id, source: e.source, target: e.target }));
  }, [storeEdges, projectId, projectNotes]);

  return (
    <ReactFlowProvider>
      <BoardCanvas
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeMove={moveNote}
        onNodeDelete={deleteNote}
        onConnect={(source, target) => addEdge(projectId, source, target)}
        onEdgeDelete={deleteEdge}
        onPaneDoubleClick={(x, y) => addNote(projectId, x, y)}
      />
    </ReactFlowProvider>
  );
}
