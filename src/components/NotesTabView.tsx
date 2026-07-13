import { useEffect, useMemo, useState } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { computeBacklinks, computeOutgoingLinks, extractOutline } from '../lib/wikiLinks';
import NoteMarkdown from './NoteMarkdown';
import NoteComments from './NoteComments';
import TagPills from './TagPills';

const CASCADE_STEP = 220;
function cascadePosition(index: number) {
  const step = index % 8;
  return { x: 120 + step * CASCADE_STEP, y: 120 + step * CASCADE_STEP };
}

export default function NotesTabView({
  projectId,
  selectedNoteId,
}: {
  projectId: string;
  selectedNoteId: string | null;
}) {
  const allNotes = useWorkspaceStore((s) => s.notes);
  const updateNote = useWorkspaceStore((s) => s.updateNote);
  const deleteNote = useWorkspaceStore((s) => s.deleteNote);
  const addNote = useWorkspaceStore((s) => s.addNote);
  const selectNoteInProject = useWorkspaceStore((s) => s.selectNoteInProject);
  const [mode, setMode] = useState<'edit' | 'preview'>('preview');

  const projectNotes = useMemo(
    () => allNotes.filter((n) => n.projectId === projectId).sort((a, b) => a.createdAt - b.createdAt),
    [allNotes, projectId],
  );

  const selected =
    (selectedNoteId && projectNotes.find((n) => n.id === selectedNoteId)) || projectNotes[0];

  useEffect(() => {
    setMode(selected?.content ? 'preview' : 'edit');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  if (!selected) {
    return (
      <div className="notes-tab-empty">
        <div>No notes in this project yet</div>
        <button
          className="btn-primary"
          onClick={() => {
            const note = addNote(projectId, 120, 120);
            selectNoteInProject(note.id, 'notes');
          }}
        >
          + Add note
        </button>
      </div>
    );
  }

  const outline = extractOutline(selected.content);
  const outgoingLinks = computeOutgoingLinks(selected, allNotes);
  const backlinks = computeBacklinks(selected, allNotes);

  return (
    <div className="notes-tab">
      <div className="notes-tab-list">
        {projectNotes.map((n) => (
          <button
            key={n.id}
            className={`notes-tab-list-item${n.id === selected.id ? ' notes-tab-list-item-active' : ''}`}
            onClick={() => selectNoteInProject(n.id, 'notes')}
          >
            {n.title || 'Untitled'}
          </button>
        ))}
        <button
          className="notes-tab-list-add"
          onClick={() => {
            const { x, y } = cascadePosition(projectNotes.length);
            const note = addNote(projectId, x, y);
            selectNoteInProject(note.id, 'notes');
          }}
        >
          + Add note
        </button>
      </div>

      <div className="notes-tab-content">
        <input
          className="notes-tab-title"
          value={selected.title}
          placeholder="Untitled"
          onChange={(e) => updateNote(selected.id, { title: e.target.value })}
        />
        <div className="notes-tab-tags-row">
          <TagPills tags={selected.tags} />
          <button
            className="notes-tab-mode-btn"
            onClick={() => setMode((m) => (m === 'edit' ? 'preview' : 'edit'))}
          >
            {mode === 'edit' ? 'Preview' : 'Edit'}
          </button>
          <button
            className="notes-tab-delete-btn"
            onClick={() => deleteNote(selected.id)}
            title="Delete note"
          >
            Delete
          </button>
        </div>
        {mode === 'edit' ? (
          <textarea
            className="notes-tab-textarea"
            value={selected.content}
            placeholder="Write in markdown… link other notes with [[Note Title]]"
            onChange={(e) => updateNote(selected.id, { content: e.target.value })}
            autoFocus
          />
        ) : (
          <div className="notes-tab-markdown" onDoubleClick={() => setMode('edit')}>
            {selected.content ? (
              <NoteMarkdown content={selected.content} />
            ) : (
              <span className="note-empty-hint">Empty — double-click to edit</span>
            )}
          </div>
        )}

        <div className="notes-tab-comments">
          <NoteComments noteId={selected.id} comments={selected.comments} />
        </div>
      </div>

      <div className="notes-tab-side">
        <div className="notes-tab-side-section">
          <span className="modal-label">Outline</span>
          {outline.length === 0 && <div className="notes-tab-side-empty">No headings yet</div>}
          {outline.map((h, i) => (
            <div key={i} className="notes-tab-outline-item" style={{ paddingLeft: (h.level - 1) * 10 }}>
              {h.text}
            </div>
          ))}
        </div>
        <div className="notes-tab-side-section">
          <span className="modal-label">Links to</span>
          {outgoingLinks.length === 0 && (
            <div className="notes-tab-side-empty">No outgoing links</div>
          )}
          {outgoingLinks.map((n) => (
            <button
              key={n.id}
              className="notes-tab-link-item"
              onClick={() => selectNoteInProject(n.id, 'notes')}
            >
              {n.title || 'Untitled'}
            </button>
          ))}
        </div>
        <div className="notes-tab-side-section">
          <span className="modal-label">Backlinks</span>
          {backlinks.length === 0 && <div className="notes-tab-side-empty">No backlinks yet</div>}
          {backlinks.map((n) => (
            <button
              key={n.id}
              className="notes-tab-link-item"
              onClick={() => selectNoteInProject(n.id, 'notes')}
            >
              {n.title || 'Untitled'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
