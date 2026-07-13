import { useState } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import type { Note } from '../lib/types';
import TagPills from './TagPills';
import NoteMarkdown from './NoteMarkdown';
import NoteComments from './NoteComments';

export default function GridNoteCard({ note }: { note: Note }) {
  const updateNote = useWorkspaceStore((s) => s.updateNote);
  const deleteNote = useWorkspaceStore((s) => s.deleteNote);
  const openNotePanel = useWorkspaceStore((s) => s.openNotePanel);
  const [mode, setMode] = useState<'edit' | 'preview'>(note.content ? 'preview' : 'edit');

  return (
    <div className="grid-note-card">
      <div className="grid-note-card-header">
        <input
          className="note-title-input"
          value={note.title}
          placeholder="Untitled"
          onChange={(e) => updateNote(note.id, { title: e.target.value })}
        />
        <button
          className="note-mode-toggle"
          onClick={() => setMode((m) => (m === 'edit' ? 'preview' : 'edit'))}
          title={mode === 'edit' ? 'Preview' : 'Edit'}
        >
          {mode === 'edit' ? '👁' : '✎'}
        </button>
        <button
          className="note-mode-toggle"
          onClick={() => openNotePanel(note.id)}
          title="Open in side panel"
        >
          ⤢
        </button>
        <button className="node-delete" onClick={() => deleteNote(note.id)} title="Delete note">
          ×
        </button>
      </div>
      {note.tags.length > 0 && (
        <div className="note-tags-row">
          <TagPills tags={note.tags} />
        </div>
      )}
      <div className="grid-note-card-body">
        {mode === 'edit' ? (
          <textarea
            className="note-textarea"
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
      <div className="note-comments-wrap">
        <NoteComments noteId={note.id} comments={note.comments} compact />
      </div>
    </div>
  );
}
