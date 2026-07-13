import { useMemo, useState } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import type { Project } from '../lib/types';
import AddPageMenu from './AddPageMenu';
import PageTreeItem from './PageTreeItem';

function ProjectSection({ project }: { project: Project }) {
  const pages = useWorkspaceStore((s) => s.pages);
  const view = useWorkspaceStore((s) => s.view);
  const enterProject = useWorkspaceStore((s) => s.enterProject);
  const addPage = useWorkspaceStore((s) => s.addPage);
  const [expanded, setExpanded] = useState(true);

  const rootPages = useMemo(
    () =>
      pages
        .filter((p) => p.projectId === project.id && p.parentId === null)
        .sort((a, b) => a.order - b.order),
    [pages, project.id],
  );

  const canvasActive = view.mode === 'project' && view.projectId === project.id;

  return (
    <div className="sidebar-project">
      <div className="tree-row sidebar-project-row" onClick={() => setExpanded((e) => !e)}>
        <button
          className="tree-chevron"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((x) => !x);
          }}
        >
          {expanded ? '▾' : '▸'}
        </button>
        <span className="tree-icon" style={{ color: project.color }}>
          ●
        </span>
        <span className="tree-label sidebar-project-name">{project.name}</span>
        <span className="tree-row-actions">
          <AddPageMenu onAdd={(type) => addPage(project.id, null, type)} />
        </span>
      </div>
      {expanded && (
        <div className="tree-children">
          <div
            className={`tree-row${canvasActive ? ' tree-row-active' : ''}`}
            style={{ paddingLeft: 24 }}
            onClick={() => enterProject(project.id)}
          >
            <span className="tree-chevron-spacer" />
            <span className="tree-icon">🖼</span>
            <span className="tree-label">Canvas</span>
          </div>
          {rootPages.map((page) => (
            <PageTreeItem key={page.id} page={page} depth={1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const projects = useWorkspaceStore((s) => s.projects);
  const view = useWorkspaceStore((s) => s.view);
  const goToRoot = useWorkspaceStore((s) => s.goToRoot);

  return (
    <div className="sidebar">
      <button
        className={`sidebar-workspace-link${view.mode === 'root' ? ' tree-row-active' : ''}`}
        onClick={goToRoot}
      >
        🗂 Workspace
      </button>
      <div className="sidebar-projects">
        {projects.map((project) => (
          <ProjectSection key={project.id} project={project} />
        ))}
        {projects.length === 0 && (
          <div className="sidebar-empty-hint">No projects yet — add one from the workspace canvas.</div>
        )}
      </div>
    </div>
  );
}
