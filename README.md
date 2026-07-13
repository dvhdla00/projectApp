# Waypoint

A desktop notes app for organizing projects: an Obsidian-style infinite canvas combined
with Notion-style structure. Each project is a folder icon; opening one takes you into
its own canvas where you drop, edit, resize, and connect markdown note cards, browse them
as a grid, read them as full pages with Obsidian-style backlinks, or see the whole vault
as a graph. A persistent sidebar gives each project a Notion-style tree of nested pages,
folders, and kanban boards, and a dashboard landing page shows an overview of the whole
workspace.

Built with Electron, React, TypeScript, [@xyflow/react](https://reactflow.dev/) (canvas),
and [dnd-kit](https://dndkit.com/) (kanban drag-and-drop).

## Features (current)

- **Dashboard** — the landing view: a greeting, stat tiles (projects/notes/pages/boards),
  a grid of project folder cards, a list of recently edited items, and a right-hand vault
  info panel (counts, all tags, top backlinked notes)
- **Projects** — created via a dialog where you pick the name and folder color; shown as
  folder cards on the dashboard and as folder nodes on the workspace canvas
- **Project tabs** — every project has four ways to work with its notes:
  - **Canvas** — infinite pan/zoom board of draggable, resizable, connectable note cards
  - **Grid** — the same notes as a static grid of cards
  - **Notes** — a full-page reading/editing view per note, with an outline (from markdown
    headings), outgoing wiki-links, and backlinks — type `[[Note Title]]` anywhere in a
    note body to link it to another note (workspace-wide, not just within the project)
  - **Graph** — a force-directed node-link map of every note in the workspace, connected
    by its wiki-links; click a node to open that note
- **Comments** — every note can carry a lightweight discussion thread, toggled open from
  its card (canvas/grid) or always visible in its side panel/Notes view
- **Sidebar** — persistent, with search across projects/pages/notes, and a nested
  folder/page/kanban tree per project (arbitrarily deep, with rename/reorder/delete —
  folder delete cascades to its contents)
- **Pages** — Notion-style block editor: paragraphs, headings, bulleted/numbered lists,
  to-dos, quotes, callouts, and dividers, with per-block type switching, reordering, and
  Notion-like Enter/Backspace behavior
- **Kanban boards** — add/rename/delete columns and cards, drag cards within and across
  columns, drag to reorder columns
- **Tags & filtering** — projects and notes can carry freeform tags (set at creation or
  edited anytime); the Canvas/Grid tabs get a tag filter for the current context
- **Note side panel** — open any note from the canvas or grid in a larger right-hand
  panel for editing title, tags, content, and comments
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
  (dashboard, root canvas, a project with its active tab, a page, or a kanban board)
- `src/components/Dashboard.tsx` — the landing page
- `src/components/RootCanvas.tsx` / `ProjectCanvas.tsx` / `ProjectGrid.tsx` /
  `NotesTabView.tsx` / `GraphView.tsx` — the four ways to browse a project's notes, plus
  the root canvas; the draggable canvases share the `BoardCanvas` wrapper around React
  Flow
- `src/components/nodes/` — the custom canvas node renderers (project folder, note card)
- `src/components/Sidebar.tsx` / `PageTreeItem.tsx` — the persistent sidebar and its
  recursive folder/page/kanban tree
- `src/components/PageView.tsx` / `BlockRow.tsx` / `BlockTypeMenu.tsx` — the block-based
  page editor
- `src/components/KanbanBoard.tsx` / `KanbanColumnView.tsx` / `KanbanCardView.tsx` — the
  kanban board, built on dnd-kit
- `src/components/NoteSidePanel.tsx` / `NoteMarkdown.tsx` / `NoteComments.tsx` — the note
  side panel, shared wiki-link-aware markdown renderer, and comment thread UI
- `src/components/TagEditor.tsx` / `TagPills.tsx` / `TagFilterMenu.tsx` — shared tag
  editing and filtering UI, used by notes and projects
- `src/lib/wikiLinks.ts` — parses `[[Title]]` references, resolves them workspace-wide,
  and derives outlines/backlinks from plain note text (no extra persisted fields)
- `src/lib/graphLayout.ts` — a small self-contained force-directed layout for Graph view
- `src/lib/storage.ts` — persistence, including migration of pages saved before the
  block editor existed (a plain markdown string) into blocks, and of projects/notes
  saved before tags/comments existed

## Roadmap

Possible next steps: reordering pages/blocks via drag instead of up/down buttons, and
reparenting pages by dragging them onto a different folder in the sidebar.
