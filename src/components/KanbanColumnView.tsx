import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import type { KanbanCard, KanbanColumn } from '../lib/types';
import KanbanCardView from './KanbanCardView';

export default function KanbanColumnView({
  column,
  cards,
}: {
  column: KanbanColumn;
  cards: KanbanCard[];
}) {
  const renameKanbanColumn = useWorkspaceStore((s) => s.renameKanbanColumn);
  const deleteKanbanColumn = useWorkspaceStore((s) => s.deleteKanbanColumn);
  const addKanbanCard = useWorkspaceStore((s) => s.addKanbanCard);
  const [newCardTitle, setNewCardTitle] = useState('');

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id, data: { type: 'column' } });

  const { setNodeRef: setDropEndRef, isOver } = useDroppable({
    id: `column-end-${column.id}`,
    data: { type: 'column', columnId: column.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const submitNewCard = () => {
    const trimmed = newCardTitle.trim();
    if (!trimmed) return;
    addKanbanCard(column.id, trimmed);
    setNewCardTitle('');
  };

  return (
    <div ref={setNodeRef} style={style} className="kanban-column">
      <div className="kanban-column-header">
        <span
          ref={setActivatorNodeRef}
          className="kanban-drag-handle"
          {...attributes}
          {...listeners}
        >
          ⠿
        </span>
        <input
          className="kanban-column-title"
          value={column.title}
          onChange={(e) => renameKanbanColumn(column.id, e.target.value)}
        />
        <button
          className="tree-icon-btn"
          onClick={() => deleteKanbanColumn(column.id)}
          title="Delete column"
        >
          ×
        </button>
      </div>

      <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="kanban-card-list">
          {cards.map((card) => (
            <KanbanCardView key={card.id} card={card} />
          ))}
          <div ref={setDropEndRef} className={`kanban-drop-end${isOver ? ' kanban-drop-over' : ''}`} />
        </div>
      </SortableContext>

      <div className="kanban-add-card">
        <input
          value={newCardTitle}
          placeholder="+ Add a card"
          onChange={(e) => setNewCardTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submitNewCard();
          }}
        />
      </div>
    </div>
  );
}
