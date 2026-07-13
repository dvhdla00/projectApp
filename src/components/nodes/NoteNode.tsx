import { Handle, NodeResizer, Position, type NodeProps } from '@xyflow/react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import type { Note } from '../../lib/types';
import TagPills from '../TagPills';

export default function NoteNode({ data, selected }: NodeProps) {
  const note = data.note as Note;
  const updateNote = useWorkspaceStore((s) => s.updateNote);
  const deleteNote = useWorkspaceStore((s) => s.deleteNote);
  const openNotePanel = useWorkspaceStore((s) => s.openNotePanel);
  const [mode, setMode] = useState<'edit' | 'preview'>(note.content ? 'preview' : 'edit');

  return (
    <div className="note-node">
      <NodeResizer
        isVisible={selected}
        minWidth={200}
        minHeight={120}
        onResizeEnd={(_e, params) =>
          updateNote(note.id, { width: params.width, height: params.height })
        }
      />
      <Handle type="target" position={Position.Top} id="t" />
      <Handle type="source" position={Position.Right} id="r" />
      <Handle type="source" position={Position.Bottom} id="b" />
      <Handle type="target" position={Position.Left} id="l" />

      <div className="note-toolbar nodrag">
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
        <div className="note-tags-row nodrag">
          <TagPills tags={note.tags} />
        </div>
      )}

      <div className="note-body nodrag nowheel">
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
