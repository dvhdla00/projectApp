import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useState } from 'react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import type { Project } from '../../lib/types';
import FolderIcon from '../FolderIcon';

export type ProjectNodeType = { id: string; type: 'project'; data: { project: Project } };

export default function ProjectNode({ data, selected }: NodeProps) {
  const project = data.project as Project;
  const renameProject = useWorkspaceStore((s) => s.renameProject);
  const deleteProject = useWorkspaceStore((s) => s.deleteProject);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(project.name);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== project.name) renameProject(project.id, trimmed);
    else setDraft(project.name);
  };

  return (
    <div className={`project-node${selected ? ' selected' : ''}`}>
      <Handle type="target" position={Position.Top} id="t" />
      <Handle type="source" position={Position.Right} id="r" />
      <Handle type="source" position={Position.Bottom} id="b" />
      <Handle type="target" position={Position.Left} id="l" />

      <button
        className="node-delete nodrag"
        onClick={(e) => {
          e.stopPropagation();
          deleteProject(project.id);
        }}
        title="Delete project"
      >
        ×
      </button>

      <div className="project-folder-icon">
        <FolderIcon color={project.color} size={56} />
      </div>

      {editing ? (
        <input
          className="project-name-input nodrag"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') {
              setDraft(project.name);
              setEditing(false);
            }
          }}
        />
      ) : (
        <div className="project-name-row nodrag">
          <span className="project-name">{project.name}</span>
          <button
            className="project-rename-btn"
            onClick={() => {
              setDraft(project.name);
              setEditing(true);
            }}
            title="Rename project"
          >
            ✎
          </button>
        </div>
      )}
      <div className="project-hint">double-click icon to open</div>
    </div>
  );
}
