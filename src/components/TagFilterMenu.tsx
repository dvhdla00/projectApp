import { useState } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { tagKindFor } from '../lib/tagColor';

export default function TagFilterMenu({ availableTags }: { availableTags: string[] }) {
  const activeTagFilter = useWorkspaceStore((s) => s.activeTagFilter);
  const toggleTagFilter = useWorkspaceStore((s) => s.toggleTagFilter);
  const clearTagFilter = useWorkspaceStore((s) => s.clearTagFilter);
  const [open, setOpen] = useState(false);

  if (availableTags.length === 0) return null;

  return (
    <div className="add-menu-wrap">
      <button className="btn-secondary" onClick={() => setOpen((o) => !o)}>
        Filter{activeTagFilter.length > 0 ? ` (${activeTagFilter.length})` : ''}
      </button>
      {open && (
        <div className="add-menu tag-filter-menu" onMouseLeave={() => setOpen(false)}>
          {availableTags.map((tag) => {
            const active = activeTagFilter.includes(tag);
            return (
              <button
                key={tag}
                className={`tag-filter-option${active ? ' tag-filter-option-active' : ''}`}
                onClick={() => toggleTagFilter(tag)}
              >
                <span className={`tag-pill tag-pill-${tagKindFor(tag)}`}>{tag}</span>
                {active && <span className="tag-filter-check">✓</span>}
              </button>
            );
          })}
          {activeTagFilter.length > 0 && (
            <button className="tag-filter-clear" onClick={clearTagFilter}>
              Clear filter
            </button>
          )}
        </div>
      )}
    </div>
  );
}
