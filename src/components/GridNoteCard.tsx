import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import type { Note } from '../lib/types';

export default function GridNoteCard({ note }: { note: Note }) {
  const updateNote = useWorkspaceStore((s) => s.updateNote);
  const deleteNote = useWorkspaceStore((s) => s.deleteNote);
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
        <button className="node-delete" onClick={() => deleteNote(note.id)} title="Delete note">
          ×
        </button>
      </div>
      <div className="grid-note-card-body">
        {mode === 'edit' ? (
          <textarea
            className="note-textarea"
            value={note.content}
            placeholder="Write in markdown…"
            onChange={(e) => updateNote(note.id, { content: e.target.value })}
          />
        ) : (
          <div className="note-markdown" onDoubleClick={() => setMode('edit')}>
            {note.content ? (
              <ReactMarkdown>{note.content}</ReactMarkdown>
            ) : (
              <span className="note-empty-hint">Empty — double-click to edit</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
