import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { loadWorkspace, saveWorkspace } from '../lib/storage';
import type {
  CanvasEdge,
  KanbanCard,
  KanbanColumn,
  Note,
  PageNode,
  PageType,
  Project,
} from '../lib/types';

export type View =
  | { mode: 'root' }
  | { mode: 'project'; projectId: string }
  | { mode: 'page'; projectId: string; pageId: string }
  | { mode: 'kanban'; projectId: string; pageId: string };

const PROJECT_COLORS = ['#e8a33d', '#5b8def', '#5bc4a0', '#d16ba5', '#8d7ae0', '#e0625b'];

interface WorkspaceState {
  loaded: boolean;
  projects: Project[];
  notes: Note[];
  edges: CanvasEdge[];
  pages: PageNode[];
  kanbanColumns: KanbanColumn[];
  kanbanCards: KanbanCard[];
  view: View;

  init: () => Promise<void>;

  addProject: (x: number, y: number) => Project;
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  moveProject: (id: string, x: number, y: number) => void;

  addNote: (projectId: string, x: number, y: number) => Note;
  updateNote: (id: string, patch: Partial<Pick<Note, 'title' | 'content' | 'width' | 'height'>>) => void;
  deleteNote: (id: string) => void;
  moveNote: (id: string, x: number, y: number) => void;

  addEdge: (scope: string, source: string, target: string) => void;
  deleteEdge: (id: string) => void;

  addPage: (projectId: string, parentId: string | null, type: PageType, title?: string) => PageNode;
  renamePage: (id: string, title: string) => void;
  updatePageContent: (id: string, content: string) => void;
  deletePage: (id: string) => void;
  moveSiblingPage: (id: string, direction: 'up' | 'down') => void;

  addKanbanColumn: (pageId: string, title: string) => KanbanColumn;
  renameKanbanColumn: (id: string, title: string) => void;
  deleteKanbanColumn: (id: string) => void;
  reorderKanbanColumns: (pageId: string, orderedIds: string[]) => void;

  addKanbanCard: (columnId: string, title: string) => KanbanCard;
  updateKanbanCard: (id: string, patch: Partial<Pick<KanbanCard, 'title' | 'description'>>) => void;
  deleteKanbanCard: (id: string) => void;
  moveKanbanCard: (cardId: string, toColumnId: string, toIndex: number) => void;

  enterProject: (id: string) => void;
  openPage: (projectId: string, pageId: string) => void;
  openKanban: (projectId: string, pageId: string) => void;
  goToRoot: () => void;
}

type PersistSlice = Pick<
  WorkspaceState,
  'projects' | 'notes' | 'edges' | 'pages' | 'kanbanColumns' | 'kanbanCards'
>;

function persist(state: PersistSlice) {
  saveWorkspace({
    version: 1,
    projects: state.projects,
    notes: state.notes,
    edges: state.edges,
    pages: state.pages,
    kanbanColumns: state.kanbanColumns,
    kanbanCards: state.kanbanCards,
  });
}

function reindex<T extends { order: number }>(items: T[]): T[] {
  return items.map((item, index) => ({ ...item, order: index }));
}

/** Collects a page id and every descendant page id (for cascade delete). */
function collectDescendantIds(pages: PageNode[], rootId: string): Set<string> {
  const ids = new Set([rootId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const page of pages) {
      if (page.parentId && ids.has(page.parentId) && !ids.has(page.id)) {
        ids.add(page.id);
        grew = true;
      }
    }
  }
  return ids;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  loaded: false,
  projects: [],
  notes: [],
  edges: [],
  pages: [],
  kanbanColumns: [],
  kanbanCards: [],
  view: { mode: 'root' },

  init: async () => {
    const workspace = await loadWorkspace();
    set({
      projects: workspace.projects,
      notes: workspace.notes,
      edges: workspace.edges,
      pages: workspace.pages,
      kanbanColumns: workspace.kanbanColumns,
      kanbanCards: workspace.kanbanCards,
      loaded: true,
    });
  },

  addProject: (x, y) => {
    const project: Project = {
      id: nanoid(),
      name: 'New Project',
      color: PROJECT_COLORS[get().projects.length % PROJECT_COLORS.length],
      x,
      y,
      createdAt: Date.now(),
    };
    set((state) => {
      const next = { ...state, projects: [...state.projects, project] };
      persist(next);
      return next;
    });
    return project;
  },

  renameProject: (id, name) => {
    set((state) => {
      const projects = state.projects.map((p) => (p.id === id ? { ...p, name } : p));
      const next = { ...state, projects };
      persist(next);
      return next;
    });
  },

  deleteProject: (id) => {
    set((state) => {
      const notes = state.notes.filter((n) => n.projectId !== id);
      const projects = state.projects.filter((p) => p.id !== id);
      const edges = state.edges.filter(
        (e) => e.scope !== id && e.source !== id && e.target !== id,
      );
      const removedPageIds = new Set(
        state.pages.filter((p) => p.projectId === id).map((p) => p.id),
      );
      const pages = state.pages.filter((p) => p.projectId !== id);
      const kanbanColumns = state.kanbanColumns.filter((c) => !removedPageIds.has(c.pageId));
      const removedColumnIds = new Set(
        state.kanbanColumns.filter((c) => removedPageIds.has(c.pageId)).map((c) => c.id),
      );
      const kanbanCards = state.kanbanCards.filter((c) => !removedColumnIds.has(c.columnId));
      const next = { ...state, projects, notes, edges, pages, kanbanColumns, kanbanCards };
      persist(next);
      return next;
    });
  },

  moveProject: (id, x, y) => {
    set((state) => {
      const projects = state.projects.map((p) => (p.id === id ? { ...p, x, y } : p));
      const next = { ...state, projects };
      persist(next);
      return next;
    });
  },

  addNote: (projectId, x, y) => {
    const note: Note = {
      id: nanoid(),
      projectId,
      title: 'Untitled',
      content: '',
      x,
      y,
      width: 260,
      height: 180,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((state) => {
      const next = { ...state, notes: [...state.notes, note] };
      persist(next);
      return next;
    });
    return note;
  },

  updateNote: (id, patch) => {
    set((state) => {
      const notes = state.notes.map((n) =>
        n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n,
      );
      const next = { ...state, notes };
      persist(next);
      return next;
    });
  },

  deleteNote: (id) => {
    set((state) => {
      const notes = state.notes.filter((n) => n.id !== id);
      const edges = state.edges.filter((e) => e.source !== id && e.target !== id);
      const next = { ...state, notes, edges };
      persist(next);
      return next;
    });
  },

  moveNote: (id, x, y) => {
    set((state) => {
      const notes = state.notes.map((n) => (n.id === id ? { ...n, x, y } : n));
      const next = { ...state, notes };
      persist(next);
      return next;
    });
  },

  addEdge: (scope, source, target) => {
    if (source === target) return;
    set((state) => {
      const exists = state.edges.some(
        (e) => e.scope === scope && e.source === source && e.target === target,
      );
      if (exists) return state;
      const edge: CanvasEdge = { id: nanoid(), scope, source, target };
      const next = { ...state, edges: [...state.edges, edge] };
      persist(next);
      return next;
    });
  },

  deleteEdge: (id) => {
    set((state) => {
      const edges = state.edges.filter((e) => e.id !== id);
      const next = { ...state, edges };
      persist(next);
      return next;
    });
  },

  addPage: (projectId, parentId, type, title) => {
    const siblingCount = get().pages.filter(
      (p) => p.projectId === projectId && p.parentId === parentId,
    ).length;
    const page: PageNode = {
      id: nanoid(),
      projectId,
      parentId,
      type,
      title: title ?? (type === 'folder' ? 'New Folder' : type === 'kanban' ? 'New Board' : 'Untitled'),
      content: '',
      order: siblingCount,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((state) => {
      const next = { ...state, pages: [...state.pages, page] };
      persist(next);
      return next;
    });
    return page;
  },

  renamePage: (id, title) => {
    set((state) => {
      const pages = state.pages.map((p) =>
        p.id === id ? { ...p, title, updatedAt: Date.now() } : p,
      );
      const next = { ...state, pages };
      persist(next);
      return next;
    });
  },

  updatePageContent: (id, content) => {
    set((state) => {
      const pages = state.pages.map((p) =>
        p.id === id ? { ...p, content, updatedAt: Date.now() } : p,
      );
      const next = { ...state, pages };
      persist(next);
      return next;
    });
  },

  deletePage: (id) => {
    set((state) => {
      const removedIds = collectDescendantIds(state.pages, id);
      const pages = state.pages.filter((p) => !removedIds.has(p.id));
      const kanbanColumns = state.kanbanColumns.filter((c) => !removedIds.has(c.pageId));
      const removedColumnIds = new Set(
        state.kanbanColumns.filter((c) => removedIds.has(c.pageId)).map((c) => c.id),
      );
      const kanbanCards = state.kanbanCards.filter((c) => !removedColumnIds.has(c.columnId));
      let view = state.view;
      if ((view.mode === 'page' || view.mode === 'kanban') && removedIds.has(view.pageId)) {
        view = { mode: 'project', projectId: view.projectId };
      }
      const next = { ...state, pages, kanbanColumns, kanbanCards, view };
      persist(next);
      return next;
    });
  },

  moveSiblingPage: (id, direction) => {
    set((state) => {
      const target = state.pages.find((p) => p.id === id);
      if (!target) return state;
      const siblings = state.pages
        .filter((p) => p.projectId === target.projectId && p.parentId === target.parentId)
        .sort((a, b) => a.order - b.order);
      const index = siblings.findIndex((p) => p.id === id);
      const swapWith = direction === 'up' ? index - 1 : index + 1;
      if (swapWith < 0 || swapWith >= siblings.length) return state;
      [siblings[index], siblings[swapWith]] = [siblings[swapWith], siblings[index]];
      const reordered = reindex(siblings);
      const byId = new Map(reordered.map((p) => [p.id, p.order]));
      const pages = state.pages.map((p) => (byId.has(p.id) ? { ...p, order: byId.get(p.id)! } : p));
      const next = { ...state, pages };
      persist(next);
      return next;
    });
  },

  addKanbanColumn: (pageId, title) => {
    const siblingCount = get().kanbanColumns.filter((c) => c.pageId === pageId).length;
    const column: KanbanColumn = { id: nanoid(), pageId, title, order: siblingCount };
    set((state) => {
      const next = { ...state, kanbanColumns: [...state.kanbanColumns, column] };
      persist(next);
      return next;
    });
    return column;
  },

  renameKanbanColumn: (id, title) => {
    set((state) => {
      const kanbanColumns = state.kanbanColumns.map((c) => (c.id === id ? { ...c, title } : c));
      const next = { ...state, kanbanColumns };
      persist(next);
      return next;
    });
  },

  deleteKanbanColumn: (id) => {
    set((state) => {
      const kanbanColumns = state.kanbanColumns.filter((c) => c.id !== id);
      const kanbanCards = state.kanbanCards.filter((c) => c.columnId !== id);
      const next = { ...state, kanbanColumns, kanbanCards };
      persist(next);
      return next;
    });
  },

  reorderKanbanColumns: (pageId, orderedIds) => {
    set((state) => {
      const orderMap = new Map(orderedIds.map((id, index) => [id, index]));
      const kanbanColumns = state.kanbanColumns.map((c) =>
        c.pageId === pageId && orderMap.has(c.id) ? { ...c, order: orderMap.get(c.id)! } : c,
      );
      const next = { ...state, kanbanColumns };
      persist(next);
      return next;
    });
  },

  addKanbanCard: (columnId, title) => {
    const siblingCount = get().kanbanCards.filter((c) => c.columnId === columnId).length;
    const card: KanbanCard = {
      id: nanoid(),
      columnId,
      title,
      description: '',
      order: siblingCount,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((state) => {
      const next = { ...state, kanbanCards: [...state.kanbanCards, card] };
      persist(next);
      return next;
    });
    return card;
  },

  updateKanbanCard: (id, patch) => {
    set((state) => {
      const kanbanCards = state.kanbanCards.map((c) =>
        c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c,
      );
      const next = { ...state, kanbanCards };
      persist(next);
      return next;
    });
  },

  deleteKanbanCard: (id) => {
    set((state) => {
      const kanbanCards = state.kanbanCards.filter((c) => c.id !== id);
      const next = { ...state, kanbanCards };
      persist(next);
      return next;
    });
  },

  moveKanbanCard: (cardId, toColumnId, toIndex) => {
    set((state) => {
      const card = state.kanbanCards.find((c) => c.id === cardId);
      if (!card) return state;
      const fromColumnId = card.columnId;

      const destSiblings = state.kanbanCards
        .filter((c) => c.columnId === toColumnId && c.id !== cardId)
        .sort((a, b) => a.order - b.order);
      const clampedIndex = Math.max(0, Math.min(toIndex, destSiblings.length));
      destSiblings.splice(clampedIndex, 0, { ...card, columnId: toColumnId });
      const destReordered = reindex(destSiblings);

      let sourceReordered: KanbanCard[] = [];
      if (fromColumnId !== toColumnId) {
        const sourceSiblings = state.kanbanCards
          .filter((c) => c.columnId === fromColumnId && c.id !== cardId)
          .sort((a, b) => a.order - b.order);
        sourceReordered = reindex(sourceSiblings);
      }

      const byId = new Map([...destReordered, ...sourceReordered].map((c) => [c.id, c]));
      const kanbanCards = state.kanbanCards.map((c) => byId.get(c.id) ?? c);
      const next = { ...state, kanbanCards };
      persist(next);
      return next;
    });
  },

  enterProject: (id) => set({ view: { mode: 'project', projectId: id } }),
  openPage: (projectId, pageId) => set({ view: { mode: 'page', projectId, pageId } }),
  openKanban: (projectId, pageId) => set({ view: { mode: 'kanban', projectId, pageId } }),
  goToRoot: () => set({ view: { mode: 'root' } }),
}));
