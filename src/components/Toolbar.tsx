import { useMemo, useState } from 'react';
import { useWorkspaceStore, type ProjectTab } from '../store/useWorkspaceStore';
import type { PageNode } from '../lib/types';
import NewProjectModal from './NewProjectModal';
import TagFilterMenu from './TagFilterMenu';

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

const TABS: { id: ProjectTab; label: string }[] = [
  { id: 'canvas', label: 'Canvas' },
  { id: 'grid', label: 'Grid' },
  { id: 'notes', label: 'Notes' },
  { id: 'graph', label: 'Graph' },
];

export default function Toolbar() {
  const view = useWorkspaceStore((s) => s.view);
  const projects = useWorkspaceStore((s) => s.projects);
  const pages = useWorkspaceStore((s) => s.pages);
  const notes = useWorkspaceStore((s) => s.notes);
  const goToDashboard = useWorkspaceStore((s) => s.goToDashboard);
  const enterProject = useWorkspaceStore((s) => s.enterProject);
  const setProjectTab = useWorkspaceStore((s) => s.setProjectTab);
  const selectNoteInProject = useWorkspaceStore((s) => s.selectNoteInProject);
  const addNote = useWorkspaceStore((s) => s.addNote);
  const openPage = useWorkspaceStore((s) => s.openPage);
  const openKanban = useWorkspaceStore((s) => s.openKanban);

  const [showNewProject, setShowNewProject] = useState(false);

  const hasProjectContext = view.mode !== 'root' && view.mode !== 'dashboard';
  const currentProject = hasProjectContext
    ? projects.find((p) => p.id === view.projectId)
    : undefined;

  const pageChain =
    view.mode === 'page' || view.mode === 'kanban' ? pageAncestorChain(pages, view.pageId) : [];

  const projectNotesCount =
    view.mode === 'project' ? notes.filter((n) => n.projectId === view.projectId).length : 0;

  const filterableTags = useMemo(() => {
    if (view.mode === 'root') {
      return Array.from(new Set(projects.flatMap((p) => p.tags))).sort();
    }
    if (view.mode === 'project' && (view.tab === 'canvas' || view.tab === 'grid')) {
      return Array.from(
        new Set(notes.filter((n) => n.projectId === view.projectId).flatMap((n) => n.tags)),
      ).sort();
    }
    return [];
  }, [view, projects, notes]);

  return (
    <div className="toolbar">
      <div className="toolbar-breadcrumb">
        <button
          className={`crumb${view.mode === 'dashboard' ? ' crumb-current' : ''}`}
          onClick={goToDashboard}
        >
          Dashboard
        </button>
        {view.mode === 'root' && (
          <>
            <span className="crumb-sep">/</span>
            <span className="crumb crumb-current">Canvas</span>
          </>
        )}
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
        <TagFilterMenu availableTags={filterableTags} />
        {(view.mode === 'dashboard' || view.mode === 'root') && (
          <button className="btn-primary" onClick={() => setShowNewProject(true)}>
            + New Project
          </button>
        )}
        {view.mode === 'project' && (
          <div className="toolbar-view-toggle">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`view-toggle-btn${view.tab === tab.id ? ' view-toggle-active' : ''}`}
                onClick={() => setProjectTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
        {view.mode === 'project' && view.tab !== 'graph' && (
          <button
            className="btn-primary"
            onClick={() => {
              if (view.mode !== 'project') return;
              const { x, y } = cascadePosition(projectNotesCount);
              const note = addNote(view.projectId, x, y);
              if (view.tab === 'notes') selectNoteInProject(note.id, 'notes');
            }}
          >
            + Note
          </button>
        )}
        <span className="avatar toolbar-avatar">U</span>
      </div>
      {showNewProject && (
        <NewProjectModal x={120} y={120} onClose={() => setShowNewProject(false)} />
      )}
    </div>
  );
}
