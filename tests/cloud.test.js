import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SourceTextModule, createContext } from 'node:vm';
function storage() {
  const data = new Map();
  return { getItem: k => data.get(k) ?? null, setItem: (k,v) => data.set(k,String(v)), removeItem: k => data.delete(k) };
}
async function loadCloud(fetch) {
  const timers = new Map(); let serial = 0;
  const localStorage = storage();
  const context = createContext({
    localStorage, sessionStorage: storage(), fetch,
    setTimeout: fn => { timers.set(++serial,fn); return serial; }, clearTimeout: id => timers.delete(id),
    AbortController, structuredClone, Date, JSON, console,
    CustomEvent: class { constructor(type, data) { this.type = type; this.detail = data.detail; } },
    window: { addEventListener() {}, dispatchEvent() {} },
    document: { addEventListener() {}, visibilityState: 'visible' }
  });
  const cloud = new SourceTextModule(await readFile(new URL('../src/cloud.js', import.meta.url), 'utf8'), {
    context, initializeImportMeta(meta) { meta.env = { VITE_SUPABASE_URL: 'https://test.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'public-test' }; }
  });
  await cloud.link(() => { throw new Error('unexpected import'); }); await cloud.evaluate();
  return { cloud: cloud.namespace, localStorage, context };
}
const ok = body => ({ ok: true, text: async () => JSON.stringify(body) });
test('room lookup, student identity, offline queue and newer in-flight updates', async () => {
  let fail = false; const writes = []; let onWrite = null;
  const { cloud, localStorage } = await loadCloud(async (url, options) => {
    if (url.includes('get_classroom')) return ok({ id: 'room1', code: 'ABC123', maps: {}, name: '교실' });
    if (url.includes('join_classroom')) return ok({ id: 'student1', token: 'token1' });
    if (url.includes('save_play_progress')) {
      if (fail) throw new Error('offline');
      writes.push(JSON.parse(options.body));
      if (onWrite) { const callback = onWrite; onWrite = null; callback(); }
      return ok(null);
    }
    throw new Error(url);
  });
  await cloud.enterClassroom('abc123', '학생');
  assert.equal(cloud.storageScope(), 'ABC123_student1');
  const state = { wrongAttempts: 1, firstTryCorrect: 2, hintsUsed: 1, questionsShown: 3, sessionStartedAt: Date.now(), completed: false };
  fail = true;
  cloud.queueProgress('MAP01', '학생', state);
  await cloud.flushQueue();
  assert.equal(JSON.parse(localStorage.getItem('wisdom_cloud_queue_v1')).length, 1);
  fail = false;
  onWrite = () => cloud.queueProgress('MAP01', '학생', { ...state, completed: true });
  await cloud.flushQueue();
  assert.equal(JSON.parse(localStorage.getItem('wisdom_cloud_queue_v1')).length, 1);
  await cloud.flushQueue();
  assert.equal(JSON.parse(localStorage.getItem('wisdom_cloud_queue_v1')).length, 0);
  assert.equal(writes.at(-1).p_metrics.completed, true);
  cloud.resetStudentContext();
  assert.equal(cloud.storageScope(), 'local');
});
test('CSV handles quoted commas/newlines and room content wins over old device cache', async () => {
  const { cloud, context } = await loadCloud(async () => ok(null));
  const data = new SourceTextModule(await readFile(new URL('../src/data.js', import.meta.url), 'utf8'), { context });
  // The same namespace is exposed through a linked module, preserving room context.
  const { SyntheticModule } = await import('node:vm');
  const link = new SyntheticModule(['getRoom', 'storageScope', 'queueProgress'], function () {
    for (const key of ['getRoom', 'storageScope', 'queueProgress']) this.setExport(key, cloud[key]);
  }, { context });
  await data.link(() => link); await data.evaluate();
  const d = data.namespace;
  const parsed = d.parseAllMapsCsv('\uFEFFmap,type,english,korean\nMAP01,word,"hello, friend",친구\nMAP12,expression,"Line one\nline two",줄');
  assert.equal(parsed.MAP01.words[0].english, 'hello, friend');
  assert.equal(parsed.MAP12.expressions[0].english, 'Line one\nline two');
  d.saveAllMapContent(parsed);
  cloud.setRoom({ code: 'ABC123', maps: { MAP01: { words: [{ english: 'cloud', korean: '구름' }], expressions: [] } } });
  assert.equal(d.getMapContent('MAP01').words[0].english, 'cloud');
  d.saveMapProgress('MAP01', '학생', { completed: true });
  cloud.setRoom({ code: 'DEF456', maps: {} });
  assert.equal(d.loadMapProgress('MAP01', '학생'), null);
});
