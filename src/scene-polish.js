import { planPointerPath } from './pointer-path.js';
import { playShard, reducedMotion } from './feedback.js';
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const modalOpen = () => !document.getElementById('modal')?.classList.contains('hidden');
function blocked(scene) { return scene.inputLocked || scene.interactionRunning || modalOpen() || ['boss', 'ending'].includes(scene.state.phase) || scene.bossBattleRunning; }
function manualInput(scene) {
  const touch = window.WisdomTouchInput || {};
  return ['up', 'down', 'left', 'right'].some(key => scene.keys?.[key]?.isDown || scene.cursors?.[key]?.isDown || touch[key]) || scene.keys?.interact?.isDown || scene.keys?.enter?.isDown || scene.keys?.space?.isDown || touch.interactPressed;
}
function colliderRects(scene) {
  const body = scene.player.body, dx = body.center.x - scene.player.x, dy = body.center.y - scene.player.y;
  const halfWidth = body.width / 2 + 3, halfHeight = body.height / 2 + 3;
  const bounds = scene.physics.world.bounds;
  const rects = (scene.obstacles || []).filter(object => object.body?.enable !== false).map(object => ({
    left: object.body.left - halfWidth - dx, right: object.body.right + halfWidth - dx,
    top: object.body.top - halfHeight - dy, bottom: object.body.bottom + halfHeight - dy
  }));
  rects.push({ left: -100, right: bounds.x + halfWidth - dx, top: -100, bottom: bounds.bottom + 100 }, { left: bounds.right - halfWidth - dx, right: bounds.right + 100, top: -100, bottom: bounds.bottom + 100 }, { left: -100, right: bounds.right + 100, top: -100, bottom: bounds.y + halfHeight - dy }, { left: -100, right: bounds.right + 100, top: bounds.bottom - halfHeight - dy, bottom: bounds.bottom + 100 });
  return rects;
}
export function installScenePolish(scene) {
  scene.polishCleanup?.();
  const original = { update: scene.update, updatePrompt: scene.updatePrompt, interact: scene.interact, save: scene.save, updateHUD: scene.updateHUD, nearestObject: scene.nearestObject };
  const ring = scene.add.ellipse(0, 0, 48, 28, 0xe6c477, .1).setStrokeStyle(2, 0xe6c477, .8).setDepth(90).setVisible(false);
  const destination = scene.add.circle(0, 0, 9, 0xa6dce3, .12).setStrokeStyle(2, 0xa6dce3, .8).setDepth(60).setVisible(false);
  const checks = new Map(), flying = new Set();
  const visited = scene.state.investigatedObjects ||= {};
  let path = null, target = null, requestedObject = null, previousShards = Number(scene.state.shards) || 0, lastObject = null, stuckAt = 0, lastPosition = null, alive = true;
  const stop = () => { path = null; target = null; requestedObject = null; destination.setVisible(false); };
  const hud = () => {
    const element = document.getElementById('hud-shards'); if (!element) return;
    const count = Math.min(3, Math.max(0, Number(scene.state.shards) || 0));
    element.textContent = `${[1, 2, 3].map(value => count >= value ? '◆' : '◇').join(' ')}  ${count}/3`;
    element.setAttribute('aria-label', `말의 조각 3개 중 ${count}개 획득`);
  };
  const animateShards = (count) => {
    playShard();
    const element = document.getElementById('hud-shards'); if (!element) return;
    element.classList.remove('shard-received'); void element.offsetWidth; element.classList.add('shard-received');
    if (reducedMotion()) return;
    const canvas = scene.game.canvas.getBoundingClientRect(), box = element.getBoundingClientRect(), camera = scene.cameras.main;
    const source = lastObject || scene.player;
    const x = canvas.left + (source.x - camera.worldView.x) * camera.zoom * canvas.width / scene.game.scale.width;
    const y = canvas.top + (source.y - camera.worldView.y) * camera.zoom * canvas.height / scene.game.scale.height;
    for (let index = 0; index < Math.min(3, count); index++) {
      const shard = document.createElement('span'); shard.className = 'flying-shard'; shard.textContent = '◆'; shard.setAttribute('aria-hidden', 'true');
      shard.style.left = `${x}px`; shard.style.top = `${y}px`; shard.style.setProperty('--flight-x', `${box.left + box.width / 2 - x}px`); shard.style.setProperty('--flight-y', `${box.top + box.height / 2 - y}px`); shard.style.animationDelay = `${index * 90}ms`;
      document.body.append(shard); flying.add(shard); shard.addEventListener('animationend', () => { shard.remove(); flying.delete(shard); }, { once: true });
    }
  };
  scene.nearestObject = function () { return requestedObject && distance(this.player, requestedObject) <= requestedObject.radius ? requestedObject : original.nearestObject.call(this); };
  scene.interact = async function () {
    if (blocked(this)) return;
    const object = this.nearestObject(); if (!object) return;
    stop(); lastObject = object; visited[object.id] = true;
    // Keep the specifically clicked object during the original method's synchronous dispatch.
    requestedObject = object;
    try { const pending = original.interact.call(this); requestedObject = null; await pending; }
    finally { requestedObject = null; }
  };
  scene.updateHUD = function (...args) { original.updateHUD.apply(this, args); hud(); };
  scene.save = function (...args) {
    const result = original.save.apply(this, args), count = Number(this.state.shards) || 0;
    if (alive && count > previousShards) animateShards(count - previousShards);
    previousShards = count; return result;
  };
  const onPointer = pointer => {
    if (pointer.button !== 0 || blocked(scene)) return;
    const point = { x: pointer.worldX, y: pointer.worldY };
    const objects = scene.interactables.filter(object => distance(point, object) <= Math.min(42, object.radius * .55));
    const object = objects.sort((a, b) => distance(point, a) - distance(point, b))[0] || null;
    if (object && distance(scene.player, object) <= object.radius) {
      requestedObject = object; scene.interact(); return;
    }
    const goal = object || point, bounds = scene.physics.world.bounds;
    const route = planPointerPath(scene.player, goal, colliderRects(scene), { width: bounds.width, height: bounds.height, radius: object ? Math.max(12, object.radius - 14) : 0 });
    stop(); if (!route) return;
    path = route; target = object; stuckAt = scene.time.now; lastPosition = { x: scene.player.x, y: scene.player.y };
    const end = route.at(-1); destination.setPosition(end.x, end.y).setVisible(true);
  };
  scene.input.on('pointerdown', onPointer);
  scene.updatePrompt = function () {
    original.updatePrompt.call(this);
    const object = this.nearestObject();
    ring.setVisible(Boolean(object) && !blocked(this));
    if (object && !blocked(this)) {
      ring.setPosition(object.x, object.y).setAlpha(reducedMotion() ? .8 : .65 + Math.sin(this.time.now / 280) * .2);
      this.prompt?.setText(`${visited[object.id] ? '✓ 살펴봄 · ' : ''}${object.label}  [Space / 클릭·터치]`);
    }
  };
  scene.update = function (...args) {
    if (blocked(this) || manualInput(this)) stop();
    original.update.apply(this, args);
    for (const object of this.interactables) {
      if (visited[object.id] && !checks.has(object.id)) checks.set(object.id, this.add.text(object.x + 15, object.y - 24, '✓', { fontSize: '15px', color: '#b9e9ce', backgroundColor: '#102c29cc', padding: { x: 3, y: 1 } }).setDepth(95));
    }
    if (blocked(this)) { ring.setVisible(false); return; }
    if (!path) return;
    if (target && distance(this.player, target) <= target.radius - 8) {
      const object = target; stop(); this.player.body.setVelocity(0, 0); requestedObject = object; this.interact(); return;
    }
    while (path.length && distance(this.player, path[0]) <= 4) path.shift();
    if (!path.length) { stop(); this.player.body.setVelocity(0, 0); return; }
    if (distance(this.player, lastPosition) > 2) { stuckAt = this.time.now; lastPosition = { x: this.player.x, y: this.player.y }; }
    else if (this.time.now - stuckAt > 700) { stop(); this.player.body.setVelocity(0, 0); return; }
    const point = path[0], dx = point.x - this.player.x, dy = point.y - this.player.y, length = Math.hypot(dx, dy);
    const speed = Math.min(145, length * 20), vx = dx / length * speed, vy = dy / length * speed;
    this.player.body.setVelocity(vx, vy); this.updateDirection(vx, vy);
  };
  hud();
  const cleanup = () => {
    if (!alive) return; alive = false; stop();
    scene.input.off('pointerdown', onPointer); scene.events.off('shutdown', cleanup);
    ring.destroy(); destination.destroy(); checks.forEach(check => check.destroy()); flying.forEach(shard => shard.remove());
    document.getElementById('hud-shards')?.classList.remove('shard-received');
    Object.assign(scene, original); scene.polishCleanup = null;
  };
  scene.polishCleanup = cleanup; scene.events.once('shutdown', cleanup);
}
