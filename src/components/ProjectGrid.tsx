import { useMemo } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import GridNoteCard from './GridNoteCard';

const CASCADE_STEP = 220;
function cascadePosition(index: number) {
  const step = index % 8;
  return { x: 120 + step * CASCADE_STEP, y: 120 + step * CASCADE_STEP };
}

export default function ProjectGrid({ projectId }: { projectId: string }) {
  const notes = useWorkspaceStore((s) => s.notes);
  const activeTagFilter = useWorkspaceStore((s) => s.activeTagFilter);
  const addNote = useWorkspaceStore((s) => s.addNote);

  const allProjectNotes = useMemo(
    () => notes.filter((n) => n.projectId === projectId),
    [notes, projectId],
  );

  const visibleNotes = useMemo(
    () =>
      allProjectNotes
        .filter(
          (n) => activeTagFilter.length === 0 || n.tags.some((tag) => activeTagFilter.includes(tag)),
        )
        .sort((a, b) => a.createdAt - b.createdAt),
    [allProjectNotes, activeTagFilter],
  );

  return (
    <div className="project-grid-view">
      <div className="note-grid">
        {visibleNotes.map((note) => (
          <GridNoteCard key={note.id} note={note} />
        ))}
        <button
          className="note-grid-add-card"
          onClick={() => {
            const { x, y } = cascadePosition(allProjectNotes.length);
            addNote(projectId, x, y);
          }}
        >
          <span className="project-grid-card-plus">+</span>
          <span>Add note</span>
        </button>
      </div>
    </div>
  );
}
