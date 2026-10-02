import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { installScenePolish } from '../src/scene-polish.js';
function fixture() {
  let modal = false;
  globalThis.window = { WisdomTouchInput: {} };
  globalThis.document = { getElementById: id => id === 'modal' ? { classList: { contains: () => !modal } } : null };
  const graphics = [];
  const shape = () => {
    const graphic = { visible: false, destroyed: false, setStrokeStyle() { return this; }, setDepth() { return this; }, setVisible(value) { this.visible = value; return this; }, setPosition(x,y) { this.x=x;this.y=y;return this; }, setAlpha() { return this; }, destroy() { this.destroyed=true; } };
    graphics.push(graphic); return graphic;
  };
  const body = { width: 12, height: 12, center: { x: 48, y: 80 }, velocity: { x: 0, y: 0 }, setVelocity(x,y) { this.velocity = { x,y }; } };
  const scene = {
    state: { phase: 'puzzle', shards: 2 }, player: { x: 48, y: 80, body }, physics: { world: { bounds: { x: 0, y: 0, width: 768, height: 576, right: 768, bottom: 576 } } },
    add: { ellipse: shape, circle: shape, text: shape }, interactables: [], input: new EventEmitter(), events: new EventEmitter(), time: { now: 0 }, keys: { right: { isDown: false } },
    update() { this.player.body.setVelocity(0,0); this.updatePrompt(); }, updateDirection() {}, updatePrompt() {}, updateHUD() {}, save() { this.updateHUD(); },
    nearestObject() { return this.interactables.find(object => Math.hypot(object.x-this.player.x, object.y-this.player.y) <= object.radius) || null; },
    interact() { this.calls = (this.calls || 0) + 1; }
  };
  return { scene, graphics, setModal: value => { modal = value; } };
}
test('scene pointer movement advances at game speed, keyboard overrides it, and shutdown removes handlers', () => {
  const { scene, graphics } = fixture(), originalUpdate = scene.update;
  installScenePolish(scene);
  scene.input.emit('pointerdown', { button: 0, worldX: 200, worldY: 160 });
  for (let frame = 0; frame < 220; frame++) {
    scene.time.now += 16; scene.update();
    assert.ok(Math.hypot(scene.player.body.velocity.x,scene.player.body.velocity.y)<=145.001);
    scene.player.x += scene.player.body.velocity.x*.016; scene.player.y += scene.player.body.velocity.y*.016;
    scene.player.body.center = { x: scene.player.x, y: scene.player.y };
  }
  assert.ok(Math.hypot(scene.player.x-200,scene.player.y-160)<5);
  scene.input.emit('pointerdown', { button: 0, worldX: 300, worldY: 160 }); scene.keys.right.isDown=true; scene.update();
  assert.equal(graphics[1].visible,false);
  scene.events.emit('shutdown'); assert.equal(scene.input.listenerCount('pointerdown'),0); assert.equal(scene.update,originalUpdate); assert.ok(graphics.every(graphic=>graphic.destroyed));
});
test('near object taps investigate once, remember visits, and modal/locked/boss states block map clicks', async () => {
  const { scene, setModal } = fixture(); scene.interactables=[{ id:'book', label:'책', x:80,y:80,radius:60 }];
  installScenePolish(scene);
  scene.input.emit('pointerdown', { button:0, worldX:80,worldY:80 }); await Promise.resolve();
  assert.equal(scene.calls,1); assert.equal(scene.state.investigatedObjects.book,true);
  setModal(true); scene.input.emit('pointerdown',{button:0,worldX:80,worldY:80});
  setModal(false); scene.inputLocked=true; scene.input.emit('pointerdown',{button:0,worldX:80,worldY:80});
  scene.inputLocked=false; scene.state.phase='boss';scene.input.emit('pointerdown',{button:0,worldX:80,worldY:80});
  assert.equal(scene.calls,1); scene.events.emit('shutdown');
});
