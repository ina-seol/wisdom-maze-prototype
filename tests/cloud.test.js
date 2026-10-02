import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SourceTextModule, createContext } from 'node:vm';
import { webcrypto } from 'node:crypto';
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
    AbortController, structuredClone, Date, JSON, console, crypto: webcrypto, TextEncoder,
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

test('teacher names map consistently; signup signs in without an email field', async () => {
  const calls = [];
  const { cloud } = await loadCloud(async (url, options) => {
    calls.push({ url, body: options.body && JSON.parse(options.body) });
    if (url.includes('/settings')) return ok({ disable_signup: false, mailer_autoconfirm: true });
    return ok({ access_token: 'test-access', refresh_token: 'test-refresh', expires_in: 3600, user: { id: 'teacher-1' } });
  });
  const id = await cloud.teacherLoginId('  한나＿Ａ  ');
  assert.equal(id, await cloud.teacherLoginId('한나_a'));
  assert.match(id, /^[a-f0-9]{64}@teachers\.wisdom-maze\.invalid$/);
  assert.notEqual(id, await cloud.teacherLoginId('다른 교사'));
  await cloud.signUpTeacher('한나_a', 'test-password');
  assert(cloud.hasTeacherSession());
  await cloud.signIn('한나_a', 'test-password');
  const signup = calls.find(c => c.url.includes('/signup'));
  const login = calls.find(c => c.url.includes('grant_type=password'));
  assert.equal(signup.body.email, login.body.email);
  assert.equal(signup.body.data.teacher_name, '한나_a');
});
test('signup configuration errors are shown before creating an account', async () => {
  for (const settings of [ { disable_signup: true, mailer_autoconfirm: true }, { disable_signup: false, mailer_autoconfirm: false } ]) {
    let writes = 0;
    const { cloud } = await loadCloud(async (url, options) => {
      if (options.method === 'POST') writes++;
      return ok(settings);
    });
    await assert.rejects(cloud.signUpTeacher('교사', 'test-password'), /Supabase/);
    assert.equal(writes, 0);
    assert.equal(cloud.hasTeacherSession(), false);
  }
});

test('teacher leaderboard paginates records and deletion uses authenticated requests with password reauthentication', async () => {
  const calls = [];
  const session = { access_token: 'test-access', refresh_token: 'test-refresh', expires_in: 3600, user: { id: 'teacher1', email: 'teacher@example.invalid' } };
  const { cloud } = await loadCloud(async (url, options) => {
    calls.push({ url, ...options });
    if (url.includes('grant_type=password')) return ok(session);
    if (url.includes('play_records')) return ok(url.includes('offset=0') ? Array.from({ length: 1000 }, (_, id) => ({ id, classroom_id: 'room1' })) : [{ id: 1000, classroom_id: 'room1' }]);
    if (url.includes('classrooms')) return ok([{ id: 'room1' }]);
    if (url.includes('delete_teacher_account')) return ok(null);
    throw new Error(url);
  });
  await cloud.signIn('teacher@example.invalid', 'test-password');
  assert.equal((await cloud.readRoomRecords('room1')).length, 1001);
  await cloud.deleteRoom('room1');
  assert.equal(calls.at(-1).method, 'DELETE'); assert.equal(calls.at(-1).headers.Authorization, 'Bearer test-access');
  await cloud.deleteTeacherAccount('test-password');
  assert.match(calls.at(-2).url, /grant_type=password/);
  assert.match(calls.at(-1).url, /delete_teacher_account/); assert.equal(calls.at(-1).headers.Authorization, 'Bearer test-access');
  assert.equal(cloud.hasTeacherSession(), false);
});
