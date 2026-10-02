import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planPointerPath } from '../src/pointer-path.js';
const intersects = (a, b, rect) => {
  for (let t = 0; t <= 1; t += .01) {
    const x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) return true;
  }
  return false;
};
test('pointer route reaches open floor and goes around colliders without cutting corners', () => {
  const start = { x: 40, y: 104 }, goal = { x: 216, y: 104 }, wall = { left: 96, right: 144, top: 48, bottom: 176 };
  const path = planPointerPath(start, goal, [wall], { width: 256, height: 224 });
  assert.ok(path.length > 2); assert.deepEqual(path.at(-1), goal);
  const points = [start, ...path];
  for (let index = 1; index < points.length; index++) assert.equal(intersects(points[index - 1], points[index], wall), false);
});
test('object taps stop within reach and unreachable floor does not move through walls', () => {
  const path = planPointerPath({ x: 40, y: 104 }, { x: 152, y: 104 }, [{ left: 128, right: 176, top: 80, bottom: 128 }], { width: 256, height: 224, radius: 48 });
  assert.ok(path); assert.ok(Math.hypot(path.at(-1).x - 152, path.at(-1).y - 104) <= 48);
  assert.equal(planPointerPath({ x: 40, y: 104 }, { x: 216, y: 104 }, [{ left: 96, right: 144, top: 0, bottom: 224 }], { width: 256, height: 224 }), null);
});
