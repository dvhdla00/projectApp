import { useWorkspaceStore } from '../store/useWorkspaceStore';
import type { PageNode } from '../lib/types';

const CASCADE_STEP = 220;
const CASCADE_WRAP = 8;

function cascadePosition(index: number) {
  const step = index % CASCADE_WRAP;
  return { x: 120 + step * CASCADE_STEP, y: 120 + step * CASCADE_STEP };
}

function pageAncestorChain(pages: PageNode[], pageId: string): PageNode[] {
  const chain: PageNode[] = [];
  let current = pages.find((p) => p.id === pageId);
  while (current) {
    chain.unshift(current);
    const parentId: string | null = current.parentId;
    current = parentId ? pages.find((p) => p.id === parentId) : undefined;
  }
  return chain;
}

export default function Toolbar() {
  const view = useWorkspaceStore((s) => s.view);
  const projects = useWorkspaceStore((s) => s.projects);
  const pages = useWorkspaceStore((s) => s.pages);
  const notes = useWorkspaceStore((s) => s.notes);
  const goToRoot = useWorkspaceStore((s) => s.goToRoot);
  const enterProject = useWorkspaceStore((s) => s.enterProject);
  const addProject = useWorkspaceStore((s) => s.addProject);
  const addNote = useWorkspaceStore((s) => s.addNote);
  const openPage = useWorkspaceStore((s) => s.openPage);
  const openKanban = useWorkspaceStore((s) => s.openKanban);

  const currentProject =
    view.mode !== 'root' ? projects.find((p) => p.id === view.projectId) : undefined;

  const pageChain =
    view.mode === 'page' || view.mode === 'kanban' ? pageAncestorChain(pages, view.pageId) : [];

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
        {currentProject && (
          <>
            <span className="crumb-sep">/</span>
            <button
              className={`crumb${view.mode === 'project' ? ' crumb-current' : ''}`}
              onClick={() => enterProject(currentProject.id)}
            >
              {currentProject.name}
            </button>
          </>
        )}
        {pageChain.map((page, index) => {
          const isLast = index === pageChain.length - 1;
          const clickable = page.type !== 'folder';
          return (
            <span key={page.id} className="crumb-part">
              <span className="crumb-sep">/</span>
              {clickable ? (
                <button
                  className={`crumb${isLast ? ' crumb-current' : ''}`}
                  onClick={() =>
                    page.type === 'kanban'
                      ? openKanban(page.projectId, page.id)
                      : openPage(page.projectId, page.id)
                  }
                >
                  {page.title}
                </button>
              ) : (
                <span className={`crumb${isLast ? ' crumb-current' : ''}`}>{page.title}</span>
              )}
            </span>
          );
        })}
      </div>
      <div className="toolbar-actions">
        {view.mode === 'root' && (
          <button
            className="toolbar-btn"
            onClick={() => {
              const { x, y } = cascadePosition(projects.length);
              addProject(x, y);
            }}
          >
            + Project
          </button>
        )}
        {view.mode === 'project' && (
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
