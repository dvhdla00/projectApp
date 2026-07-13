import { useMemo, useState } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import TagEditor from './TagEditor';
import NoteMarkdown from './NoteMarkdown';
import NoteComments from './NoteComments';

export default function NoteSidePanel({ noteId }: { noteId: string }) {
  const note = useWorkspaceStore((s) => s.notes.find((n) => n.id === noteId));
  const allNotes = useWorkspaceStore((s) => s.notes);
  const updateNote = useWorkspaceStore((s) => s.updateNote);
  const addNoteTag = useWorkspaceStore((s) => s.addNoteTag);
  const removeNoteTag = useWorkspaceStore((s) => s.removeNoteTag);
  const closeNotePanel = useWorkspaceStore((s) => s.closeNotePanel);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  const allTagSuggestions = useMemo(
    () => Array.from(new Set(allNotes.flatMap((n) => n.tags))).sort(),
    [allNotes],
  );

  if (!note) return null;

  return (
    <div className="note-side-panel">
      <div className="note-side-panel-header">
        <button className="tree-icon-btn" onClick={closeNotePanel} title="Close">
          ✕
        </button>
      </div>
      <input
        className="note-side-panel-title"
        value={note.title}
        placeholder="Untitled"
        onChange={(e) => updateNote(note.id, { title: e.target.value })}
      />

      <div className="note-side-panel-section">
        <span className="modal-label">Tags</span>
        <TagEditor
          tags={note.tags}
          suggestions={allTagSuggestions}
          onAdd={(tag) => addNoteTag(note.id, tag)}
          onRemove={(tag) => removeNoteTag(note.id, tag)}
        />
      </div>

      <div className="note-side-panel-section note-side-panel-body">
        <div className="note-side-panel-body-header">
          <span className="modal-label">Content</span>
          <button
            className="btn-secondary note-side-panel-mode-btn"
            onClick={() => setMode((m) => (m === 'edit' ? 'preview' : 'edit'))}
          >
            {mode === 'edit' ? 'Preview' : 'Edit'}
          </button>
        </div>
        {mode === 'edit' ? (
          <textarea
            className="note-side-panel-textarea"
            value={note.content}
            placeholder="Write in markdown… link other notes with [[Note Title]]"
            onChange={(e) => updateNote(note.id, { content: e.target.value })}
          />
        ) : (
          <div className="note-markdown" onDoubleClick={() => setMode('edit')}>
            {note.content ? (
              <NoteMarkdown content={note.content} />
            ) : (
              <span className="note-empty-hint">Empty — double-click to edit</span>
            )}
          </div>
        )}
      </div>

      <div className="note-side-panel-section">
        <NoteComments noteId={note.id} comments={note.comments} />
      </div>
    </div>
  );
}
