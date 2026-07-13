import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('workspaceApi', {
  load: (): Promise<string | null> => ipcRenderer.invoke('workspace:load'),
  save: (json: string): Promise<void> => ipcRenderer.invoke('workspace:save', json),
});
