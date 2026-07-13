import '@xyflow/react/dist/style.css';
import { useEffect } from 'react';
import Toolbar from './components/Toolbar';
import RootCanvas from './components/RootCanvas';
import ProjectCanvas from './components/ProjectCanvas';
import { useWorkspaceStore } from './store/useWorkspaceStore';
import './App.css';

function App() {
  const loaded = useWorkspaceStore((s) => s.loaded);
  const init = useWorkspaceStore((s) => s.init);
  const view = useWorkspaceStore((s) => s.view);

  useEffect(() => {
    void init();
  }, [init]);

  if (!loaded) return <div className="app-loading">Loading workspace…</div>;

  return (
    <div className="app">
      <Toolbar />
      <div className="app-canvas">
        {view.mode === 'root' ? (
          <RootCanvas />
        ) : (
          <ProjectCanvas key={view.projectId} projectId={view.projectId} />
        )}
      </div>
    </div>
  );
}

export default App;
