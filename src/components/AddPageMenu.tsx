import { useState } from 'react';
import type { PageType } from '../lib/types';

export default function AddPageMenu({ onAdd }: { onAdd: (type: PageType) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="add-menu-wrap">
      <button
        className="tree-icon-btn"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        title="Add"
      >
        +
      </button>
      {open && (
        <div className="add-menu" onMouseLeave={() => setOpen(false)}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd('page');
              setOpen(false);
            }}
          >
            📄 Page
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd('folder');
              setOpen(false);
            }}
          >
            📁 Folder
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd('kanban');
              setOpen(false);
            }}
          >
            📋 Kanban Board
          </button>
        </div>
      )}
    </div>
  );
}
