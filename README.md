# Boards

A desktop notes app for organizing projects: an Obsidian-style infinite canvas combined
with Notion-style structure. Each project is a folder icon on the main canvas; opening
one takes you into its own canvas where you drop, edit, resize, and connect markdown
note cards. A persistent sidebar also gives each project a Notion-style tree of nested
pages, folders, and kanban boards.

Built with Electron, React, TypeScript, [@xyflow/react](https://reactflow.dev/) (canvas),
and [dnd-kit](https://dndkit.com/) (kanban drag-and-drop).

## Features (current)

- Infinite pan/zoom canvas at the workspace root, with each project shown as a folder node
- Double-click empty canvas (or the "+ Project" button) to create a project
- Open a project to get its own canvas of note cards
- Note cards: markdown editing with a live preview toggle, resizable, connectable with edges
- Drag to reposition, connect any node to any other with edges (loose connection mode)
- Persistent sidebar: nested pages and folders per project, arbitrarily deep, with
  rename/reorder/delete (folder delete cascades to its contents)
- Full-page markdown documents (Notion-style pages) with an edit/preview toggle
- Kanban boards: add/rename/delete columns and cards, drag cards within and across
  columns, drag to reorder columns
- Everything autosaves to disk (via Electron's userData directory) or localStorage when
  run as a plain web app

## Development

```bash
npm install

# Run as a plain web app in the browser (fastest iteration)
npm run dev

# Run inside Electron
npm run dev:electron
```

## Building

```bash
# Type-check + bundle the renderer
npm run build

# Also compile the Electron main/preload processes
npm run build:electron

# Package a macOS app (.dmg/.zip) — must be run on macOS
npm run dist:mac
```

## Architecture

- `electron/` — Electron main process and preload script; persists the workspace to a
  JSON file under the OS user-data directory via IPC
- `src/store/useWorkspaceStore.ts` — zustand store holding projects, notes, canvas edges,
  the page tree, kanban columns/cards, and the current view (root canvas, a project's
  canvas, a page, or a kanban board)
- `src/components/RootCanvas.tsx` / `ProjectCanvas.tsx` — the two canvas modes, both
  built on the shared `BoardCanvas` wrapper around React Flow
- `src/components/nodes/` — the custom canvas node renderers (project folder, note card)
- `src/components/Sidebar.tsx` / `PageTreeItem.tsx` — the persistent sidebar and its
  recursive folder/page/kanban tree
- `src/components/PageView.tsx` — full-page markdown document view
- `src/components/KanbanBoard.tsx` / `KanbanColumnView.tsx` / `KanbanCardView.tsx` — the
  kanban board, built on dnd-kit

## Roadmap

Possible next steps: reordering pages via drag instead of up/down buttons, and
reparenting pages by dragging them onto a different folder in the sidebar.
