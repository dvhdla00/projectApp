import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import type { KanbanCard } from '../lib/types';

export default function KanbanCardView({
  card,
  overlay,
}: {
  card: KanbanCard;
  overlay?: boolean;
}) {
  const updateKanbanCard = useWorkspaceStore((s) => s.updateKanbanCard);
  const deleteKanbanCard = useWorkspaceStore((s) => s.deleteKanbanCard);
  const [expanded, setExpanded] = useState(false);

  const sortable = useSortable({
    id: card.id,
    data: { type: 'card', columnId: card.columnId },
    disabled: overlay,
  });
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = sortable;

  const style = overlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      };

  return (
    <div ref={overlay ? undefined : setNodeRef} style={style} className="kanban-card">
      <div className="kanban-card-header">
        <span
          ref={overlay ? undefined : setActivatorNodeRef}
          className="kanban-drag-handle"
          {...(overlay ? {} : attributes)}
          {...(overlay ? {} : listeners)}
        >
          ⠿
        </span>
        <input
          className="kanban-card-title"
          value={card.title}
          onChange={(e) => updateKanbanCard(card.id, { title: e.target.value })}
        />
        <button
          className="tree-icon-btn"
          onClick={() => setExpanded((e) => !e)}
          title={expanded ? 'Collapse' : 'Add description'}
        >
          {expanded ? '▾' : '▸'}
        </button>
        <button
          className="tree-icon-btn"
          onClick={() => deleteKanbanCard(card.id)}
          title="Delete card"
        >
          ×
        </button>
      </div>
      {expanded && (
        <textarea
          className="kanban-card-description"
          value={card.description}
          placeholder="Add a description…"
          onChange={(e) => updateKanbanCard(card.id, { description: e.target.value })}
        />
      )}
    </div>
  );
}
