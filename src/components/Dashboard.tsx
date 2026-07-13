import { useMemo, useState } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import FolderIcon from './FolderIcon';
import NewProjectModal from './NewProjectModal';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function timeAgo(ts: number) {
  const diffMs = Date.now() - ts;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

const CASCADE_STEP = 220;
const CASCADE_WRAP = 8;
function cascadePosition(index: number) {
  const step = index % CASCADE_WRAP;
  return { x: 120 + step * CASCADE_STEP, y: 120 + step * CASCADE_STEP };
}

type RecentItem = {
  id: string;
  icon: string;
  title: string;
  projectName: string;
  updatedAt: number;
  onOpen: () => void;
};

export default function Dashboard() {
  const projects = useWorkspaceStore((s) => s.projects);
  const notes = useWorkspaceStore((s) => s.notes);
  const pages = useWorkspaceStore((s) => s.pages);
  const kanbanColumns = useWorkspaceStore((s) => s.kanbanColumns);
  const kanbanCards = useWorkspaceStore((s) => s.kanbanCards);
  const enterProject = useWorkspaceStore((s) => s.enterProject);
  const openPage = useWorkspaceStore((s) => s.openPage);
  const openKanban = useWorkspaceStore((s) => s.openKanban);
  const goToRoot = useWorkspaceStore((s) => s.goToRoot);
  const [showNewProject, setShowNewProject] = useState(false);

  const pageCount = pages.filter((p) => p.type === 'page').length;
  const boardCount = pages.filter((p) => p.type === 'kanban').length;

  const projectNoteCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const note of notes) counts.set(note.projectId, (counts.get(note.projectId) ?? 0) + 1);
    return counts;
  }, [notes]);

  const recentItems = useMemo<RecentItem[]>(() => {
    const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? '';
    const items: RecentItem[] = [];

    for (const note of notes) {
      items.push({
        id: `note-${note.id}`,
        icon: '🗒',
        title: note.title || 'Untitled note',
        projectName: projectName(note.projectId),
        updatedAt: note.updatedAt,
        onOpen: () => enterProject(note.projectId),
      });
    }
    for (const page of pages) {
      if (page.type === 'folder') continue;
      items.push({
        id: `page-${page.id}`,
        icon: page.type === 'kanban' ? '📋' : '📄',
        title: page.title || 'Untitled',
        projectName: projectName(page.projectId),
        updatedAt: page.updatedAt,
        onOpen: () =>
          page.type === 'kanban' ? openKanban(page.projectId, page.id) : openPage(page.projectId, page.id),
      });
    }
    for (const card of kanbanCards) {
      const column = kanbanColumns.find((c) => c.id === card.columnId);
      if (!column) continue;
      const page = pages.find((p) => p.id === column.pageId);
      if (!page) continue;
      items.push({
        id: `card-${card.id}`,
        icon: '🗂',
        title: card.title || 'Untitled card',
        projectName: projectName(page.projectId),
        updatedAt: card.updatedAt,
        onOpen: () => openKanban(page.projectId, page.id),
      });
    }

    return items.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 8);
  }, [notes, pages, kanbanCards, kanbanColumns, projects, enterProject, openPage, openKanban]);

  return (
    <div className="dashboard">
      <div className="dashboard-greeting">
        <h1>{greeting()}!</h1>
        <p>Here&rsquo;s what&rsquo;s happening across your workspace.</p>
      </div>

      <div className="stat-tiles">
        <button className="stat-tile" onClick={goToRoot}>
          <span className="stat-tile-icon pill-blue">🗺</span>
          <span className="stat-tile-value">{projects.length}</span>
          <span className="stat-tile-label">Active Projects</span>
        </button>
        <div className="stat-tile">
          <span className="stat-tile-icon pill-green">🗒</span>
          <span className="stat-tile-value">{notes.length}</span>
          <span className="stat-tile-label">Canvas Notes</span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile-icon pill-purple">📄</span>
          <span className="stat-tile-value">{pageCount}</span>
          <span className="stat-tile-label">Pages</span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile-icon pill-orange">📋</span>
          <span className="stat-tile-value">{boardCount}</span>
          <span className="stat-tile-label">Kanban Boards</span>
        </div>
      </div>

      <div className="dashboard-section-header">
        <h2>Projects</h2>
      </div>
      <div className="project-grid">
        {projects.map((project) => (
          <button
            key={project.id}
            className="project-grid-card"
            onClick={() => enterProject(project.id)}
          >
            <FolderIcon color={project.color} size={48} />
            <span className="project-grid-card-title">{project.name}</span>
            <span className="project-grid-card-sub">
              {projectNoteCounts.get(project.id) ?? 0} notes
            </span>
          </button>
        ))}
        <button className="project-grid-card project-grid-card-new" onClick={() => setShowNewProject(true)}>
          <span className="project-grid-card-plus">+</span>
          <span className="project-grid-card-title">New Project</span>
        </button>
      </div>

      {recentItems.length > 0 && (
        <>
          <div className="dashboard-section-header">
            <h2>Recent</h2>
          </div>
          <div className="card recent-list">
            {recentItems.map((item) => (
              <button key={item.id} className="recent-row" onClick={item.onOpen}>
                <span className="tree-icon">{item.icon}</span>
                <span className="recent-row-title">{item.title}</span>
                <span className="recent-row-project">{item.projectName}</span>
                <span className="recent-row-time">{timeAgo(item.updatedAt)}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {showNewProject && (
        <NewProjectModal
          x={cascadePosition(projects.length).x}
          y={cascadePosition(projects.length).y}
          onClose={() => setShowNewProject(false)}
        />
      )}
    </div>
  );
}
