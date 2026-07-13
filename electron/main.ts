import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';

const isDev = !app.isPackaged;

function dataFilePath() {
  return path.join(app.getPath('userData'), 'workspace.json');
}

async function loadData(): Promise<string | null> {
  try {
    return await fs.readFile(dataFilePath(), 'utf-8');
  } catch {
    return null;
  }
}

async function saveData(json: string): Promise<void> {
  await fs.mkdir(path.dirname(dataFilePath()), { recursive: true });
  await fs.writeFile(dataFilePath(), json, 'utf-8');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1e1e1e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL ?? 'http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

ipcMain.handle('workspace:load', () => loadData());
ipcMain.handle('workspace:save', (_event, json: string) => saveData(json));

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
