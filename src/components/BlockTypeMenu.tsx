import { useState } from 'react';
import type { BlockType } from '../lib/types';

const BLOCK_OPTIONS: { type: BlockType; label: string; icon: string }[] = [
  { type: 'paragraph', label: 'Text', icon: '¶' },
  { type: 'heading1', label: 'Heading 1', icon: 'H1' },
  { type: 'heading2', label: 'Heading 2', icon: 'H2' },
  { type: 'heading3', label: 'Heading 3', icon: 'H3' },
  { type: 'bulleted', label: 'Bulleted list', icon: '•' },
  { type: 'numbered', label: 'Numbered list', icon: '1.' },
  { type: 'todo', label: 'To-do', icon: '☑' },
  { type: 'quote', label: 'Quote', icon: '❝' },
  { type: 'callout', label: 'Callout', icon: '◆' },
  { type: 'divider', label: 'Divider', icon: '—' },
];

export default function BlockTypeMenu({
  onSelect,
  trigger,
}: {
  onSelect: (type: BlockType) => void;
  trigger: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="add-menu-wrap">
      <button
        className="tree-icon-btn"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        title="Block type"
      >
        {trigger}
      </button>
      {open && (
        <div className="add-menu block-type-menu" onMouseLeave={() => setOpen(false)}>
          {BLOCK_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(opt.type);
                setOpen(false);
              }}
            >
              <span className="block-type-menu-icon">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
