import { useWorkspaceStore } from '../store/useWorkspaceStore';

const CASCADE_STEP = 220;
const CASCADE_WRAP = 8;

function cascadePosition(index: number) {
  const step = index % CASCADE_WRAP;
  return { x: 120 + step * CASCADE_STEP, y: 120 + step * CASCADE_STEP };
}

export default function Toolbar() {
  const view = useWorkspaceStore((s) => s.view);
  const projects = useWorkspaceStore((s) => s.projects);
  const notes = useWorkspaceStore((s) => s.notes);
  const goToRoot = useWorkspaceStore((s) => s.goToRoot);
  const addProject = useWorkspaceStore((s) => s.addProject);
  const addNote = useWorkspaceStore((s) => s.addNote);

  const currentProject =
    view.mode === 'project' ? projects.find((p) => p.id === view.projectId) : undefined;

  const projectNotesCount =
    view.mode === 'project' ? notes.filter((n) => n.projectId === view.projectId).length : 0;

  return (
    <div className="toolbar">
      <div className="toolbar-breadcrumb">
        <button
          className={`crumb${view.mode === 'root' ? ' crumb-current' : ''}`}
          onClick={goToRoot}
        >
          Workspace
        </button>
        {view.mode === 'project' && (
          <>
            <span className="crumb-sep">/</span>
            <span className="crumb crumb-current">{currentProject?.name ?? 'Project'}</span>
          </>
        )}
      </div>
      <div className="toolbar-actions">
        {view.mode === 'root' ? (
          <button
            className="toolbar-btn"
            onClick={() => {
              const { x, y } = cascadePosition(projects.length);
              addProject(x, y);
            }}
          >
            + Project
          </button>
        ) : (
          <button
            className="toolbar-btn"
            onClick={() => {
              if (view.mode !== 'project') return;
              const { x, y } = cascadePosition(projectNotesCount);
              addNote(view.projectId, x, y);
            }}
          >
            + Note
          </button>
        )}
      </div>
    </div>
  );
}
