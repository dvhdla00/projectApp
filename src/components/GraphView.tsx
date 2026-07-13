import { useMemo } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { computeForceLayout } from '../lib/graphLayout';
import { extractWikiLinkTitles, resolveNoteByTitle } from '../lib/wikiLinks';

export default function GraphView() {
  const notes = useWorkspaceStore((s) => s.notes);
  const projects = useWorkspaceStore((s) => s.projects);
  const selectNoteInProject = useWorkspaceStore((s) => s.selectNoteInProject);

  const projectColor = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of projects) map.set(p.id, p.color);
    return map;
  }, [projects]);

  const edges = useMemo(() => {
    const seen = new Set<string>();
    const result: [string, string][] = [];
    for (const note of notes) {
      for (const title of extractWikiLinkTitles(note.content)) {
        const target = resolveNoteByTitle(title, notes);
        if (!target || target.id === note.id) continue;
        const key = [note.id, target.id].sort().join('::');
        if (seen.has(key)) continue;
        seen.add(key);
        result.push([note.id, target.id]);
      }
    }
    return result;
  }, [notes]);

  const noteIds = useMemo(() => notes.map((n) => n.id), [notes]);
  const positions = useMemo(() => computeForceLayout(noteIds, edges), [noteIds, edges]);

  if (notes.length === 0) {
    return (
      <div className="graph-view graph-view-empty">
        <div>No notes to graph yet</div>
      </div>
    );
  }

  return (
    <div className="graph-view">
      <svg className="graph-svg">
        {edges.map(([s, t]) => {
          const a = positions.get(s);
          const b = positions.get(t);
          if (!a || !b) return null;
          return (
            <line
              key={`${s}-${t}`}
              x1={`${a.x}%`}
              y1={`${a.y}%`}
              x2={`${b.x}%`}
              y2={`${b.y}%`}
              className="graph-edge"
            />
          );
        })}
      </svg>
      {notes.map((note) => {
        const pos = positions.get(note.id);
        if (!pos) return null;
        return (
          <button
            key={note.id}
            className="graph-node"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              background: projectColor.get(note.projectId) ?? 'var(--accent)',
            }}
            onClick={() => selectNoteInProject(note.id, 'notes')}
            title={note.title || 'Untitled'}
          />
        );
      })}
      {notes.map((note) => {
        const pos = positions.get(note.id);
        if (!pos) return null;
        return (
          <div
            key={`label-${note.id}`}
            className="graph-node-label"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            {note.title || 'Untitled'}
          </div>
        );
      })}
      <div className="graph-hint">Click a node to open its note</div>
    </div>
  );
}
