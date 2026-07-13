import { useMemo, useState } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import type { PageNode, PageType } from '../lib/types';
import AddPageMenu from './AddPageMenu';

const TYPE_ICON: Record<PageType, string> = {
  folder: '📁',
  page: '📄',
  kanban: '📋',
};

export default function PageTreeItem({ page, depth }: { page: PageNode; depth: number }) {
  const allPages = useWorkspaceStore((s) => s.pages);
  const view = useWorkspaceStore((s) => s.view);
  const addPage = useWorkspaceStore((s) => s.addPage);
  const renamePage = useWorkspaceStore((s) => s.renamePage);
  const deletePage = useWorkspaceStore((s) => s.deletePage);
  const moveSiblingPage = useWorkspaceStore((s) => s.moveSiblingPage);
  const openPage = useWorkspaceStore((s) => s.openPage);
  const openKanban = useWorkspaceStore((s) => s.openKanban);

  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(page.title);

  const children = useMemo(
    () =>
      allPages
        .filter((p) => p.parentId === page.id)
        .sort((a, b) => a.order - b.order),
    [allPages, page.id],
  );

  const isActive =
    (view.mode === 'page' || view.mode === 'kanban') && view.pageId === page.id;

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== page.title) renamePage(page.id, trimmed);
    else setDraft(page.title);
  };

  const handleSelect = () => {
    if (page.type === 'folder') {
      setExpanded((e) => !e);
    } else if (page.type === 'kanban') {
      openKanban(page.projectId, page.id);
    } else {
      openPage(page.projectId, page.id);
    }
  };

  return (
    <div className="tree-item">
      <div
        className={`tree-row${isActive ? ' tree-row-active' : ''}`}
        style={{ paddingLeft: 8 + depth * 16 }}
        onClick={handleSelect}
      >
        {children.length > 0 ? (
          <button
            className="tree-chevron"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((x) => !x);
            }}
          >
            {expanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="tree-chevron-spacer" />
        )}
        <span className="tree-icon">{TYPE_ICON[page.type]}</span>
        {editing ? (
          <input
            className="tree-rename-input"
            autoFocus
            value={draft}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') {
                setDraft(page.title);
                setEditing(false);
              }
            }}
          />
        ) : (
          <span className="tree-label">{page.title}</span>
        )}
        <span className="tree-row-actions">
          <button
            className="tree-icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              moveSiblingPage(page.id, 'up');
            }}
            title="Move up"
          >
            ↑
          </button>
          <button
            className="tree-icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              moveSiblingPage(page.id, 'down');
            }}
            title="Move down"
          >
            ↓
          </button>
          <button
            className="tree-icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              setDraft(page.title);
              setEditing(true);
            }}
            title="Rename"
          >
            ✎
          </button>
          <AddPageMenu onAdd={(type) => addPage(page.projectId, page.id, type)} />
          <button
            className="tree-icon-btn tree-delete"
            onClick={(e) => {
              e.stopPropagation();
              deletePage(page.id);
            }}
            title="Delete"
          >
            ×
          </button>
        </span>
      </div>
      {expanded && children.length > 0 && (
        <div className="tree-children">
          {children.map((child) => (
            <PageTreeItem key={child.id} page={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
