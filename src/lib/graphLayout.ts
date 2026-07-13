interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/**
 * Lightweight force-directed layout: repulsion between all nodes, spring attraction
 * along edges, gentle centering. Returns positions as percentages (0-100) suitable
 * for absolute positioning within a container.
 */
export function computeForceLayout(
  nodeIds: string[],
  edges: [string, string][],
): Map<string, { x: number; y: number }> {
  const n = nodeIds.length;
  const positions = new Map<string, Point>();
  nodeIds.forEach((id, i) => {
    const angle = (i / Math.max(n, 1)) * Math.PI * 2;
    positions.set(id, {
      x: 50 + 30 * Math.cos(angle),
      y: 50 + 30 * Math.sin(angle),
      vx: 0,
      vy: 0,
    });
  });

  const k = 100 / Math.sqrt(Math.max(n, 1));
  const iterations = n > 150 ? 80 : 220;

  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < n; i++) {
      const a = positions.get(nodeIds[i])!;
      let fx = 0;
      let fy = 0;
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const b = positions.get(nodeIds[j])!;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const force = (k * k) / dist;
        fx += (dx / dist) * force;
        fy += (dy / dist) * force;
      }
      a.vx += fx * 0.01;
      a.vy += fy * 0.01;
    }

    for (const [s, t] of edges) {
      const a = positions.get(s);
      const b = positions.get(t);
      if (!a || !b) continue;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const force = (dist * dist) / k;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx -= fx * 0.01;
      a.vy -= fy * 0.01;
      b.vx += fx * 0.01;
      b.vy += fy * 0.01;
    }

    for (let i = 0; i < n; i++) {
      const a = positions.get(nodeIds[i])!;
      a.vx += (50 - a.x) * 0.006;
      a.vy += (50 - a.y) * 0.006;
      a.vx *= 0.85;
      a.vy *= 0.85;
      a.x += a.vx;
      a.y += a.vy;
    }
  }

  const result = new Map<string, { x: number; y: number }>();
  for (const id of nodeIds) {
    const p = positions.get(id)!;
    result.set(id, {
      x: Math.max(6, Math.min(94, p.x)),
      y: Math.max(6, Math.min(94, p.y)),
    });
  }
  return result;
}
