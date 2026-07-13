import '@xyflow/react/dist/style.css';
import { useEffect } from 'react';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import RootCanvas from './components/RootCanvas';
import ProjectCanvas from './components/ProjectCanvas';
import ProjectGrid from './components/ProjectGrid';
import NotesTabView from './components/NotesTabView';
import GraphView from './components/GraphView';
import PageView from './components/PageView';
import KanbanBoard from './components/KanbanBoard';
import NoteSidePanel from './components/NoteSidePanel';
import { useWorkspaceStore } from './store/useWorkspaceStore';
import './App.css';

function App() {
  const loaded = useWorkspaceStore((s) => s.loaded);
  const init = useWorkspaceStore((s) => s.init);
  const view = useWorkspaceStore((s) => s.view);
  const openNoteId = useWorkspaceStore((s) => s.openNoteId);

  useEffect(() => {
    void init();
  }, [init]);

  if (!loaded) return <div className="app-loading">Loading workspace…</div>;

  return (
    <div className="app">
      <div className="app-body">
        <Sidebar />
        <div className="app-main">
          <Toolbar />
          <div className="app-content">
            {view.mode === 'dashboard' && <Dashboard />}
            {view.mode === 'root' && <RootCanvas />}
            {view.mode === 'project' && view.tab === 'canvas' && (
              <ProjectCanvas key={view.projectId} projectId={view.projectId} />
            )}
            {view.mode === 'project' && view.tab === 'grid' && (
              <ProjectGrid key={view.projectId} projectId={view.projectId} />
            )}
            {view.mode === 'project' && view.tab === 'notes' && (
              <NotesTabView
                key={view.projectId}
                projectId={view.projectId}
                selectedNoteId={view.selectedNoteId}
              />
            )}
            {view.mode === 'project' && view.tab === 'graph' && <GraphView />}
            {view.mode === 'page' && <PageView key={view.pageId} pageId={view.pageId} />}
            {view.mode === 'kanban' && <KanbanBoard key={view.pageId} pageId={view.pageId} />}
            {openNoteId && view.mode === 'project' && (view.tab === 'canvas' || view.tab === 'grid') && (
              <NoteSidePanel key={openNoteId} noteId={openNoteId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
