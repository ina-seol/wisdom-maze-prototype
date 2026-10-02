import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Script, createContext } from 'node:vm';
test('all twelve maps investigate once with Space, Enter or E and respect locked input', async () => {
  for (let index = 1; index <= 12; index++) {
    const name = `Map${String(index).padStart(2, '0')}Scene`;
    const source = (await readFile(new URL(`../src/game/${name}.js`, import.meta.url), 'utf8'))
      .replace(/import[\s\S]*?from\s*['"][^'"]+['"];?/g, '')
      .replace('export default class', 'class').replaceAll('import.meta.env', '({ BASE_URL: "/" })');
    const context = createContext({ Phaser: { Scene: class {}, Input: { Keyboard: { JustDown: key => { const pressed = key.pressed; key.pressed = false; return pressed; } } } }, window: {} });
    new Script(`${source}\nSceneClass = ${name};`).runInContext(context);
    const scene = new context.SceneClass();
    const directionKeys = () => Object.fromEntries(['up', 'down', 'left', 'right'].map(key => [key, { isDown: false }]));
    scene.input = { keyboard: { createCursorKeys: directionKeys, addKeys: config => Object.fromEntries(Object.entries(config).map(([key, code]) => [key, { code, isDown: false, pressed: false }])) } };
    scene.createInput(); assert.equal(scene.keys.space.code, 'SPACE', name);
    scene.state = { phase: 'explore' }; scene.player = { body: { setVelocity() {} } }; scene.recoverStuckInput = () => {}; scene.updateDirection = () => {}; scene.updatePrompt = () => {};
    let interactions = 0; scene.interact = () => interactions++;
    for (const key of ['space', 'enter', 'interact']) { scene.keys[key].pressed = true; scene.update(); scene.update(); }
    assert.equal(interactions, 3, name);
    scene.inputLocked = true; scene.keys.space.pressed = true; scene.update(); assert.equal(interactions, 3, name);
  }
});
