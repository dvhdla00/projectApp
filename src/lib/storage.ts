import { nanoid } from 'nanoid';
import { emptyWorkspace, type Block, type BlockType, type Workspace } from './types';

const LOCAL_STORAGE_KEY = 'projectapp-workspace';

function textToBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  for (const rawLine of content.split('\n')) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    let type: BlockType = 'paragraph';
    let text = trimmed;
    let checked: boolean | undefined;

    if (/^### /.test(trimmed)) {
      type = 'heading3';
      text = trimmed.slice(4);
    } else if (/^## /.test(trimmed)) {
      type = 'heading2';
      text = trimmed.slice(3);
    } else if (/^# /.test(trimmed)) {
      type = 'heading1';
      text = trimmed.slice(2);
    } else if (/^- \[[ xX]\] /.test(trimmed)) {
      type = 'todo';
      checked = /^- \[[xX]\]/.test(trimmed);
      text = trimmed.replace(/^- \[[ xX]\] /, '');
    } else if (/^[-*] /.test(trimmed)) {
      type = 'bulleted';
      text = trimmed.slice(2);
    } else if (/^\d+\.\s/.test(trimmed)) {
      type = 'numbered';
      text = trimmed.replace(/^\d+\.\s/, '');
    } else if (/^> /.test(trimmed)) {
      type = 'quote';
      text = trimmed.slice(2);
    } else if (/^---+$/.test(trimmed)) {
      type = 'divider';
      text = '';
    }

    blocks.push({ id: nanoid(), type, text, ...(checked !== undefined ? { checked } : {}) });
  }
  if (blocks.length === 0) blocks.push({ id: nanoid(), type: 'paragraph', text: '' });
  return blocks;
}

/** Migrates pages saved before the block editor existed (a plain `content` markdown string). */
function migratePages(workspace: Workspace): Workspace {
  const pages = workspace.pages.map((page) => {
    const legacy = page as unknown as { content?: string; blocks?: Block[] };
    if (Array.isArray(legacy.blocks)) return page;
    return { ...page, blocks: textToBlocks(legacy.content ?? '') };
  });
  return { ...workspace, pages };
}

export async function loadWorkspace(): Promise<Workspace> {
  const raw = window.workspaceApi
    ? await window.workspaceApi.load()
    : window.localStorage.getItem(LOCAL_STORAGE_KEY);

  if (!raw) return emptyWorkspace();
  try {
    const parsed = JSON.parse(raw) as Workspace;
    return migratePages({ ...emptyWorkspace(), ...parsed });
  } catch {
    return emptyWorkspace();
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function saveWorkspace(workspace: Workspace) {
  const json = JSON.stringify(workspace);
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (window.workspaceApi) {
      void window.workspaceApi.save(json);
    } else {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, json);
    }
  }, 200);
}
