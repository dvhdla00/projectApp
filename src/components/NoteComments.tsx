import { useState } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import type { NoteComment } from '../lib/types';

export default function NoteComments({
  noteId,
  comments,
  compact,
}: {
  noteId: string;
  comments: NoteComment[];
  compact?: boolean;
}) {
  const addNoteComment = useWorkspaceStore((s) => s.addNoteComment);
  const deleteNoteComment = useWorkspaceStore((s) => s.deleteNoteComment);
  const [open, setOpen] = useState(!compact);
  const [draft, setDraft] = useState('');

  const submit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    addNoteComment(noteId, trimmed);
    setDraft('');
  };

  return (
    <div className="note-comments">
      {compact ? (
        <button className="note-comments-toggle" onClick={() => setOpen((o) => !o)}>
          <span className="note-comments-dot" />
          {comments.length === 0 ? 'Add comment' : `${comments.length} comment${comments.length > 1 ? 's' : ''}`}
        </button>
      ) : (
        <span className="modal-label">Comments</span>
      )}
      {open && (
        <div className="note-comments-body">
          {comments.map((c) => (
            <div key={c.id} className="note-comment-row">
              <span className="note-comment-text">{c.text}</span>
              <button
                className="tag-pill-remove note-comment-remove"
                onClick={() => deleteNoteComment(noteId, c.id)}
                title="Delete comment"
              >
                ×
              </button>
            </div>
          ))}
          <div className="note-comments-input-row">
            <input
              value={draft}
              placeholder="Add a comment…"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
              }}
            />
            <button className="note-comments-submit" onClick={submit}>
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
