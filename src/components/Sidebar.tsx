import { useMemo, useState } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import type { Project } from '../lib/types';
import AddPageMenu from './AddPageMenu';
import PageTreeItem from './PageTreeItem';

const TYPE_ICON: Record<string, string> = { folder: '📁', page: '📄', kanban: '📋' };

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

  const canvasActive =
    (view.mode === 'project' || view.mode === 'project-grid') && view.projectId === project.id;

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
        <span className="sidebar-project-dot" style={{ background: project.color }} />
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
  const pages = useWorkspaceStore((s) => s.pages);
  const notes = useWorkspaceStore((s) => s.notes);
  const view = useWorkspaceStore((s) => s.view);
  const goToDashboard = useWorkspaceStore((s) => s.goToDashboard);
  const goToRoot = useWorkspaceStore((s) => s.goToRoot);
  const enterProject = useWorkspaceStore((s) => s.enterProject);
  const openPage = useWorkspaceStore((s) => s.openPage);
  const openKanban = useWorkspaceStore((s) => s.openKanban);
  const [query, setQuery] = useState('');

  const trimmedQuery = query.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!trimmedQuery) return null;
    const projectHits = projects
      .filter((p) => p.name.toLowerCase().includes(trimmedQuery))
      .map((p) => ({ kind: 'project' as const, id: p.id, title: p.name, project: p }));
    const pageHits = pages
      .filter((p) => p.type !== 'folder' && p.title.toLowerCase().includes(trimmedQuery))
      .map((p) => ({
        kind: 'page' as const,
        id: p.id,
        title: p.title,
        page: p,
        projectName: projects.find((pr) => pr.id === p.projectId)?.name ?? '',
      }));
    const noteHits = notes
      .filter(
        (n) =>
          n.title.toLowerCase().includes(trimmedQuery) ||
          n.content.toLowerCase().includes(trimmedQuery),
      )
      .map((n) => ({
        kind: 'note' as const,
        id: n.id,
        title: n.title || 'Untitled',
        note: n,
        projectName: projects.find((pr) => pr.id === n.projectId)?.name ?? '',
      }));
    return [...projectHits, ...pageHits, ...noteHits];
  }, [trimmedQuery, projects, pages, notes]);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">◆</span>
        <span className="sidebar-app-name">Boards</span>
      </div>

      <div className="sidebar-search">
        <span className="sidebar-search-icon">⌕</span>
        <input
          className="sidebar-search-input"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="sidebar-nav">
        <button
          className={`tree-row sidebar-nav-row${view.mode === 'dashboard' ? ' tree-row-active' : ''}`}
          onClick={goToDashboard}
        >
          <span className="tree-icon">⌂</span>
          <span className="tree-label">Dashboard</span>
        </button>
        <button
          className={`tree-row sidebar-nav-row${view.mode === 'root' ? ' tree-row-active' : ''}`}
          onClick={goToRoot}
        >
          <span className="tree-icon">🗺</span>
          <span className="tree-label">Canvas</span>
        </button>
      </div>

      {searchResults ? (
        <div className="sidebar-projects">
          <div className="sidebar-section-label">Results</div>
          {searchResults.length === 0 && (
            <div className="sidebar-empty-hint">No matches for “{query}”.</div>
          )}
          {searchResults.map((hit) => {
            if (hit.kind === 'project') {
              return (
                <div
                  key={`p-${hit.id}`}
                  className="tree-row"
                  onClick={() => enterProject(hit.id)}
                >
                  <span className="tree-chevron-spacer" />
                  <span className="sidebar-project-dot" style={{ background: hit.project.color }} />
                  <span className="tree-label">{hit.title}</span>
                </div>
              );
            }
            if (hit.kind === 'page') {
              return (
                <div
                  key={`pg-${hit.id}`}
                  className="tree-row"
                  onClick={() =>
                    hit.page.type === 'kanban'
                      ? openKanban(hit.page.projectId, hit.id)
                      : openPage(hit.page.projectId, hit.id)
                  }
                >
                  <span className="tree-chevron-spacer" />
                  <span className="tree-icon">{TYPE_ICON[hit.page.type]}</span>
                  <span className="tree-label">{hit.title}</span>
                  <span className="sidebar-result-hint">{hit.projectName}</span>
                </div>
              );
            }
            return (
              <div
                key={`n-${hit.id}`}
                className="tree-row"
                onClick={() => enterProject(hit.note.projectId)}
              >
                <span className="tree-chevron-spacer" />
                <span className="tree-icon">🗒</span>
                <span className="tree-label">{hit.title}</span>
                <span className="sidebar-result-hint">{hit.projectName}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="sidebar-projects">
          <div className="sidebar-section-label">Projects</div>
          {projects.map((project) => (
            <ProjectSection key={project.id} project={project} />
          ))}
          {projects.length === 0 && (
            <div className="sidebar-empty-hint">No projects yet — create one from the dashboard.</div>
          )}
        </div>
      )}

      <div className="sidebar-footer">
        <span className="avatar sidebar-footer-avatar">U</span>
        <div className="sidebar-footer-text">
          <div className="sidebar-footer-name">You</div>
          <div className="sidebar-footer-sub">Local workspace</div>
        </div>
      </div>
    </div>
  );
}
