import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { loadWorkspace, saveWorkspace } from '../lib/storage';
import type { CanvasEdge, Note, Project } from '../lib/types';

export type View = { mode: 'root' } | { mode: 'project'; projectId: string };

const PROJECT_COLORS = ['#e8a33d', '#5b8def', '#5bc4a0', '#d16ba5', '#8d7ae0', '#e0625b'];

interface WorkspaceState {
  loaded: boolean;
  projects: Project[];
  notes: Note[];
  edges: CanvasEdge[];
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

  enterProject: (id: string) => void;
  goToRoot: () => void;
}

function persist(state: Pick<WorkspaceState, 'projects' | 'notes' | 'edges'>) {
  saveWorkspace({ version: 1, projects: state.projects, notes: state.notes, edges: state.edges });
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  loaded: false,
  projects: [],
  notes: [],
  edges: [],
  view: { mode: 'root' },

  init: async () => {
    const workspace = await loadWorkspace();
    set({
      projects: workspace.projects,
      notes: workspace.notes,
      edges: workspace.edges,
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
      const next = { ...state, projects, notes, edges };
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

  enterProject: (id) => set({ view: { mode: 'project', projectId: id } }),
  goToRoot: () => set({ view: { mode: 'root' } }),
}));
