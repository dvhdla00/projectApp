# Boards

A desktop notes app for organizing projects: an Obsidian-style infinite canvas combined
with Notion-style structure. Each project is a folder icon; opening one takes you into
its own canvas where you drop, edit, resize, and connect markdown note cards, or switch
to a grid view of the same notes. A persistent sidebar gives each project a Notion-style
tree of nested pages, folders, and kanban boards, and a dashboard landing page shows an
overview of the whole workspace.

Built with Electron, React, TypeScript, [@xyflow/react](https://reactflow.dev/) (canvas),
and [dnd-kit](https://dndkit.com/) (kanban drag-and-drop).

## Features (current)

- **Dashboard** — the landing view: a greeting, stat tiles (projects/notes/pages/boards),
  a grid of project folder cards, and a list of recently edited items
- **Projects** — created via a dialog where you pick the name and folder color; shown as
  folder cards on the dashboard and as folder nodes on the workspace canvas
- **Canvas** — infinite pan/zoom board (root: project folders; inside a project: note
  cards). Notes are markdown with a live preview toggle, resizable, draggable, and
  connectable to each other or to project folders with edges
- **Grid view** — an alternate, non-canvas way to browse and edit a project's notes,
  toggled from the toolbar
- **Sidebar** — persistent, with search across projects/pages/notes, and a nested
  folder/page/kanban tree per project (arbitrarily deep, with rename/reorder/delete —
  folder delete cascades to its contents)
- **Pages** — Notion-style block editor: paragraphs, headings, bulleted/numbered lists,
  to-dos, quotes, callouts, and dividers, with per-block type switching, reordering, and
  Notion-like Enter/Backspace behavior
- **Kanban boards** — add/rename/delete columns and cards, drag cards within and across
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
  the page tree (with block content), kanban columns/cards, and the current view
  (dashboard, root canvas, a project's canvas/grid, a page, or a kanban board)
- `src/components/Dashboard.tsx` — the landing page
- `src/components/RootCanvas.tsx` / `ProjectCanvas.tsx` / `ProjectGrid.tsx` — the three
  ways to browse projects/notes; the canvases are built on the shared `BoardCanvas`
  wrapper around React Flow
- `src/components/nodes/` — the custom canvas node renderers (project folder, note card)
- `src/components/Sidebar.tsx` / `PageTreeItem.tsx` — the persistent sidebar and its
  recursive folder/page/kanban tree
- `src/components/PageView.tsx` / `BlockRow.tsx` / `BlockTypeMenu.tsx` — the block-based
  page editor
- `src/components/KanbanBoard.tsx` / `KanbanColumnView.tsx` / `KanbanCardView.tsx` — the
  kanban board, built on dnd-kit
- `src/lib/storage.ts` — persistence, including migration of pages saved before the
  block editor existed (a plain markdown string) into blocks

## Roadmap

Possible next steps: reordering pages/blocks via drag instead of up/down buttons, and
reparenting pages by dragging them onto a different folder in the sidebar.
