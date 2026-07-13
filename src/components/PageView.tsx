import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useWorkspaceStore } from '../store/useWorkspaceStore';

export default function PageView({ pageId }: { pageId: string }) {
  const page = useWorkspaceStore((s) => s.pages.find((p) => p.id === pageId));
  const renamePage = useWorkspaceStore((s) => s.renamePage);
  const updatePageContent = useWorkspaceStore((s) => s.updatePageContent);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  if (!page) return null;

  return (
    <div className="page-view">
      <div className="page-view-header">
        <input
          className="page-title-input"
          value={page.title}
          placeholder="Untitled"
          onChange={(e) => renamePage(page.id, e.target.value)}
        />
        <button
          className="toolbar-btn page-mode-toggle"
          onClick={() => setMode((m) => (m === 'edit' ? 'preview' : 'edit'))}
        >
          {mode === 'edit' ? 'Preview' : 'Edit'}
        </button>
      </div>
      <div className="page-body">
        {mode === 'edit' ? (
          <textarea
            className="page-textarea"
            value={page.content}
            placeholder="Write in markdown…"
            onChange={(e) => updatePageContent(page.id, e.target.value)}
            autoFocus
          />
        ) : (
          <div className="page-markdown" onDoubleClick={() => setMode('edit')}>
            {page.content ? (
              <ReactMarkdown>{page.content}</ReactMarkdown>
            ) : (
              <span className="note-empty-hint">Empty — double-click to edit</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
