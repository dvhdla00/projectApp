export interface Project {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  createdAt: number;
}

export interface Note {
  id: string;
  projectId: string;
  title: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  createdAt: number;
  updatedAt: number;
}

export interface CanvasEdge {
  id: string;
  /** 'root' for edges between project folders, otherwise a projectId for edges between that project's notes */
  scope: string;
  source: string;
  target: string;
}

export type PageType = 'folder' | 'page' | 'kanban';

export interface PageNode {
  id: string;
  projectId: string;
  parentId: string | null;
  type: PageType;
  title: string;
  /** markdown body, only meaningful when type === 'page' */
  content: string;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface KanbanColumn {
  id: string;
  pageId: string;
  title: string;
  order: number;
}

export interface KanbanCard {
  id: string;
  columnId: string;
  title: string;
  description: string;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface Workspace {
  version: 1;
  projects: Project[];
  notes: Note[];
  edges: CanvasEdge[];
  pages: PageNode[];
  kanbanColumns: KanbanColumn[];
  kanbanCards: KanbanCard[];
}

export function emptyWorkspace(): Workspace {
  return {
    version: 1,
    projects: [],
    notes: [],
    edges: [],
    pages: [],
    kanbanColumns: [],
    kanbanCards: [],
  };
}

declare global {
  interface Window {
    workspaceApi?: {
      load: () => Promise<string | null>;
      save: (json: string) => Promise<void>;
    };
  }
}
