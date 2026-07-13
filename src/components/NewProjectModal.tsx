import { useMemo, useState } from 'react';
import { PROJECT_COLORS, useWorkspaceStore } from '../store/useWorkspaceStore';
import TagEditor from './TagEditor';

export default function NewProjectModal({
  x,
  y,
  onClose,
}: {
  x: number;
  y: number;
  onClose: () => void;
}) {
  const addProject = useWorkspaceStore((s) => s.addProject);
  const addProjectTag = useWorkspaceStore((s) => s.addProjectTag);
  const allProjects = useWorkspaceStore((s) => s.projects);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [tags, setTags] = useState<string[]>([]);

  const tagSuggestions = useMemo(
    () => Array.from(new Set(allProjects.flatMap((p) => p.tags))).sort(),
    [allProjects],
  );

  const submit = () => {
    const project = addProject(x, y, name.trim() || undefined, color);
    for (const tag of tags) addProjectTag(project.id, tag);
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">New Project</div>
        <input
          className="modal-input"
          autoFocus
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
        />
        <span className="modal-label">Folder color</span>
        <div className="modal-swatches">
          {PROJECT_COLORS.map((c) => (
            <button
              key={c}
              className={`modal-swatch${c === color ? ' modal-swatch-selected' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
              title={c}
            />
          ))}
        </div>
        <span className="modal-label">Tags (optional)</span>
        <div className="modal-tag-editor">
          <TagEditor
            tags={tags}
            suggestions={tagSuggestions}
            onAdd={(tag) => setTags((t) => (t.includes(tag) ? t : [...t, tag]))}
            onRemove={(tag) => setTags((t) => t.filter((existing) => existing !== tag))}
          />
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={submit}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
