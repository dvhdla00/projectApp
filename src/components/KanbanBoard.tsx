import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove, horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { useMemo, useState } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import type { KanbanCard } from '../lib/types';
import KanbanColumnView from './KanbanColumnView';
import KanbanCardView from './KanbanCardView';

export default function KanbanBoard({ pageId }: { pageId: string }) {
  const allColumns = useWorkspaceStore((s) => s.kanbanColumns);
  const cards = useWorkspaceStore((s) => s.kanbanCards);
  const addKanbanColumn = useWorkspaceStore((s) => s.addKanbanColumn);
  const reorderKanbanColumns = useWorkspaceStore((s) => s.reorderKanbanColumns);
  const moveKanbanCard = useWorkspaceStore((s) => s.moveKanbanCard);

  const columns = useMemo(
    () =>
      allColumns.filter((c) => c.pageId === pageId).sort((a, b) => a.order - b.order),
    [allColumns, pageId],
  );

  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const cardsByColumn = useMemo(() => {
    const map = new Map<string, KanbanCard[]>();
    for (const column of columns) {
      map.set(
        column.id,
        cards.filter((c) => c.columnId === column.id).sort((a, b) => a.order - b.order),
      );
    }
    return map;
  }, [columns, cards]);

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'card') {
      setActiveCardId(event.active.id as string);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCardId(null);
    if (!over) return;

    if (active.data.current?.type === 'column') {
      if (active.id === over.id) return;
      const ids = columns.map((c) => c.id);
      const oldIndex = ids.indexOf(active.id as string);
      const newIndex = ids.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;
      reorderKanbanColumns(pageId, arrayMove(ids, oldIndex, newIndex));
      return;
    }

    if (active.data.current?.type === 'card') {
      const overData = over.data.current as { type?: string; columnId?: string } | undefined;
      const cardId = active.id as string;
      let toColumnId: string | undefined;
      let toIndex: number;

      if (overData?.type === 'card') {
        toColumnId = overData.columnId;
        const siblings = cardsByColumn.get(toColumnId ?? '') ?? [];
        const overIndex = siblings.findIndex((c) => c.id === over.id);
        toIndex = overIndex === -1 ? siblings.length : overIndex;
      } else if (overData?.type === 'column') {
        toColumnId = overData.columnId;
        toIndex = (cardsByColumn.get(toColumnId ?? '') ?? []).length;
      } else {
        return;
      }

      if (!toColumnId) return;
      moveKanbanCard(cardId, toColumnId, toIndex);
    }
  };

  const submitNewColumn = () => {
    const trimmed = newColumnTitle.trim();
    if (!trimmed) return;
    addKanbanColumn(pageId, trimmed);
    setNewColumnTitle('');
  };

  const activeCard = activeCardId ? cards.find((c) => c.id === activeCardId) : undefined;

  return (
    <div className="kanban-board">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={columns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
          <div className="kanban-columns">
            {columns.map((column) => (
              <KanbanColumnView
                key={column.id}
                column={column}
                cards={cardsByColumn.get(column.id) ?? []}
              />
            ))}
            <div className="kanban-add-column">
              <input
                value={newColumnTitle}
                placeholder="+ New column"
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitNewColumn();
                }}
              />
            </div>
          </div>
        </SortableContext>
        <DragOverlay>{activeCard ? <KanbanCardView card={activeCard} overlay /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
}
