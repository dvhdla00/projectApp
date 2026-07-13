# Boards

A desktop notes app for organizing projects: an Obsidian-style infinite canvas combined
with Notion-style structure. Each project is a folder icon on the main canvas; opening
one takes you into its own canvas where you drop, edit, resize, and connect markdown
note cards.

Built with Electron, React, TypeScript, and [@xyflow/react](https://reactflow.dev/).

## Features (current)

- Infinite pan/zoom canvas at the workspace root, with each project shown as a folder node
- Double-click empty canvas (or the "+ Project" button) to create a project
- Open a project to get its own canvas of note cards
- Note cards: markdown editing with a live preview toggle, resizable, connectable with edges
- Drag to reposition, connect any node to any other with edges (loose connection mode)
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
- `src/store/useWorkspaceStore.ts` — zustand store holding projects, notes, and edges,
  and the current view (workspace root vs. inside a project)
- `src/components/RootCanvas.tsx` / `ProjectCanvas.tsx` — the two canvas modes, both
  built on the shared `BoardCanvas` wrapper around React Flow
- `src/components/nodes/` — the custom node renderers (project folder, note card)

## Roadmap

Notion-style nested pages and kanban boards are planned next, alongside the canvas.
