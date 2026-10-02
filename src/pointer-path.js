// Find a walkable route on the same map coordinates used by Arcade Physics.
export function planPointerPath(start, goal, obstacles = [], { width = 768, height = 576, step = 16, radius = 0 } = {}) {
  const cols = Math.floor(width / step), rows = Math.floor(height / step);
  const point = index => ({ x: (index % cols + .5) * step, y: (Math.floor(index / cols) + .5) * step });
  const blocked = point => obstacles.some(rect => point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom);
  const free = Array.from({ length: cols * rows }, (_, index) => !blocked(point(index)));
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const freeIndices = free.flatMap((value, index) => value ? [index] : []);
  if (!freeIndices.length) return null;
  const first = freeIndices.reduce((best, index) => distance(point(index), start) < distance(point(best), start) ? index : best);
  // Object clicks stop within reach. Floor clicks require a nearby free tile.
  const candidates = new Set(freeIndices.filter(index => distance(point(index), goal) <= (radius || step * .8)));
  if (!candidates.size) return null;
  const parent = new Int32Array(cols * rows).fill(-1), queue = [first]; parent[first] = first;
  let last = null;
  for (let head = 0; head < queue.length; head++) {
    const index = queue[head];
    if (candidates.has(index)) { last = index; break; }
    const col = index % cols, row = Math.floor(index / cols);
    for (const next of [col > 0 ? index - 1 : -1, col < cols - 1 ? index + 1 : -1, row > 0 ? index - cols : -1, row < rows - 1 ? index + cols : -1]) {
      if (next < 0 || !free[next] || parent[next] !== -1) continue;
      parent[next] = index; queue.push(next);
    }
  }
  if (last === null) return null;
  const path = [];
  for (let index = last; ; index = parent[index]) { path.unshift(point(index)); if (index === first) break; }
  if (radius === 0 && !blocked(goal)) path.push({ x: Math.max(step / 2, Math.min(width - step / 2, goal.x)), y: Math.max(step / 2, Math.min(height - step / 2, goal.y)) });
  // Remove only collinear intermediate nodes; never cut a corner through a collider.
  return path.filter((p, index) => index === 0 || index === path.length - 1 || (p.x - path[index - 1].x) * (path[index + 1].y - p.y) !== (p.y - path[index - 1].y) * (path[index + 1].x - p.x));
}
