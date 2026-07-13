import { emptyWorkspace, type Workspace } from './types';

const LOCAL_STORAGE_KEY = 'projectapp-workspace';

export async function loadWorkspace(): Promise<Workspace> {
  const raw = window.workspaceApi
    ? await window.workspaceApi.load()
    : window.localStorage.getItem(LOCAL_STORAGE_KEY);

  if (!raw) return emptyWorkspace();
  try {
    const parsed = JSON.parse(raw) as Workspace;
    return { ...emptyWorkspace(), ...parsed };
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
