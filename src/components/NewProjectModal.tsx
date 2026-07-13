import { useState } from 'react';
import { PROJECT_COLORS, useWorkspaceStore } from '../store/useWorkspaceStore';

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
  const [name, setName] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);

  const submit = () => {
    addProject(x, y, name.trim() || undefined, color);
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
