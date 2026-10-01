import './style.css';
import QRCode from 'qrcode';
import {
  MAP_IDS, MAP_NAMES, getTeacherPin, getAllMapContent, getMapContent,
  saveAllMapContent, parseAllMapsCsv, parseAllMapsTxt,
  serializeAllMapsCsv, serializeAllMapsTxt
} from './data.js';
import {
  cloudEnabled, signIn, signUpTeacher, signOut, hasTeacherSession, listRooms, createRoom,
  updateRoom, readRoomRecords, getRoom, setRoom
} from './cloud.js';

const $ = id => document.getElementById(id);
let currentMap = 'MAP01';
let rooms = [];
let records = [];
let busy = false;
let dirty = false;
const goHome = () => { location.href = import.meta.env.BASE_URL; };
$('back-title').onclick = goHome;
$('admin-home').onclick = goHome;
for (const id of MAP_IDS) {
  const option = document.createElement('option');
  option.value = id;
  option.textContent = `${id} · ${MAP_NAMES[id]}`;
  $('map-select').append(option);
}
if (!cloudEnabled) {
  $('login-help').textContent = '개인 연습 모드입니다. Supabase 설정 후 교실 저장을 사용할 수 있습니다. PIN 기본값: 1234';
  $('teacher-name').hidden = true;
  $('name-label').hidden = true;
  $('password-label').textContent = '교사용 PIN';
  $('teacher-signup').hidden = true;
  document.querySelector('.teacher-account-help').hidden = true;
  $('classroom-panel').hidden = true;
  $('records-panel').hidden = true;
}
function status(message) { $('save-status').textContent = message; }
async function action(fn) {
  if (busy) return;
  busy = true;
  const controls = [...document.querySelectorAll('#admin-app input, #admin-app select, #admin-app textarea, #admin-app button')];
  const disabled = controls.map(x => x.disabled);
  controls.forEach(x => { x.disabled = true; });
  try { await fn(); }
  catch (error) { status(error.message); alert(error.message); }
  finally {
    controls.forEach((x, i) => { x.disabled = disabled[i]; });
    busy = false;
    $('show-classroom-qr').disabled = !getRoom();
  }
}
let authenticating = false;
async function login(createAccount = false) {
  if (authenticating) return;
  authenticating = true;
  $('teacher-login').disabled = true;
  $('teacher-signup').disabled = true;
  $('login-status').textContent = createAccount ? '교사 계정 만드는 중…' : '로그인 중…';
  let accountCreated = false;
  try {
    if (cloudEnabled) {
      const name = $('teacher-name').value.trim();
      const password = $('teacher-pin').value;
      if (createAccount) { await signUpTeacher(name, password); accountCreated = true; }
      else await signIn(name, password);
      $('teacher-pin').value = '';
      await refreshRooms();
    } else if ($('teacher-pin').value !== getTeacherPin()) {
      throw new Error('PIN이 올바르지 않습니다.');
    }
    $('teacher-pin').value = '';
    $('login-status').textContent = '';
    $('admin-login').classList.add('hidden');
    $('admin-app').classList.remove('hidden');
    renderEditor();
    if (createAccount) status('교사 계정을 만들었습니다. 이제 교실을 만들어 주세요.');
  } catch (error) {
    $('login-status').textContent = (accountCreated ? '계정은 만들어졌습니다. 다시 만들지 말고 로그인해 주세요. 교실 조회 오류: ' : '') + error.message;
  } finally {
    $('teacher-login').disabled = false;
    $('teacher-signup').disabled = false;
    authenticating = false;
  }
}
$('teacher-login').onclick = () => login(false);
$('teacher-signup').onclick = () => login(true);
for (const id of ['teacher-name', 'teacher-pin']) $(id).onkeydown = e => { if (e.key === 'Enter') login(false); };
$('teacher-logout').onclick = () => action(async () => {
  if (dirty && !confirm('저장하지 않은 편집 내용이 있습니다. 로그아웃할까요?')) return;
  if (cloudEnabled) await signOut();
  location.reload();
});
async function refreshRooms(selectId = null) {
  rooms = await listRooms();
  $('classroom-select').replaceChildren();
  const empty = document.createElement('option');
  empty.value = '';
  empty.textContent = '교실을 선택하거나 새로 만드세요';
  $('classroom-select').append(empty);
  for (const r of rooms) {
    const option = document.createElement('option');
    option.value = r.id;
    option.textContent = `${r.name} (${r.code})`;
    $('classroom-select').append(option);
  }
  await selectRoom(rooms.find(r => r.id === selectId) || rooms[0] || null);
}
async function selectRoom(room) {
  setRoom(room);
  $('classroom-select').value = room?.id || '';
  $('classroom-info').textContent = room ? `${room.name} · 교실 코드: ${room.code}` : '먼저 교실을 만들어 주세요.';
  const url = new URL(import.meta.env.BASE_URL, location.origin);
  if (room) url.searchParams.set('classroom', room.code);
  $('classroom-link').value = room ? url.href : '';
  $('classroom-qr').hidden = !room;
  $('show-classroom-qr').disabled = !room;
  if ($('classroom-qr-dialog').open) $('classroom-qr-dialog').close();
  if (room) await QRCode.toCanvas($('classroom-qr'), url.href, { width: 220, margin: 2 });
  dirty = false;
  records = [];
  $('records-body').replaceChildren();
  $('records-status').textContent = '새로고침을 누르면 이 교실의 기록을 확인할 수 있습니다.';
  renderEditor();
}
$('classroom-select').onchange = event => action(async () => {
  if (dirty && !confirm('저장하지 않은 편집 내용이 있습니다. 교실을 바꿀까요?')) {
    event.target.value = getRoom()?.id || ''; return;
  }
  await selectRoom(rooms.find(r => r.id === event.target.value) || null);
});
$('create-classroom').onclick = () => action(async () => {
  const name = $('classroom-name').value.trim();
  if (!name) throw new Error('새 교실 이름을 입력해 주세요.');
  if (dirty && !confirm('저장하지 않은 편집 내용이 있습니다. 새 교실을 만들까요?')) return;
  const created = await createRoom(name, getAllMapContent());
  await refreshRooms(created.id);
  $('classroom-name').value = '';
  status('교실을 만들었습니다. CSV를 업로드해 학생용 학습자료를 저장하세요.');
});
$('copy-classroom-link').onclick = () => action(async () => {
  if (!getRoom()) throw new Error('먼저 교실을 선택해 주세요.');
  try { await navigator.clipboard.writeText($('classroom-link').value); status('학생 입장 링크를 복사했습니다.'); }
  catch { $('classroom-link').select(); status('입장 링크를 선택했습니다. Ctrl+C로 복사해 주세요.'); }
});
function parseEditor(id) {
  const lines = $(id).value.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  if (lines.length > 20) throw new Error('각 맵의 단어와 표현은 각각 최대 20개입니다.');
  return lines.map(line => {
    const separator = line.indexOf('|');
    return { english: separator < 0 ? line : line.slice(0, separator).trim(), korean: separator < 0 ? '' : line.slice(separator + 1).trim() };
  });
}
function validateMap(id, map) {
  for (const section of ['words', 'expressions']) {
    if (map[section].length < 4 || map[section].length > 20) throw new Error(`${id}: 단어와 표현을 각각 4~20개 입력해 주세요.`);
    if (map[section].some(x => !x.english || !x.korean)) throw new Error(`${id}: 영어와 한국어 뜻을 모두 입력해 주세요.`);
    if (new Set(map[section].map(x => x.english.toLowerCase())).size !== map[section].length) throw new Error(`${id}: 중복된 영어 항목을 확인해 주세요.`);
  }
}
function renderEditor() {
  const map = getMapContent(currentMap);
  $('words-editor').value = map.words.map(x => `${x.english} | ${x.korean}`).join('\n');
  $('expressions-editor').value = map.expressions.map(x => `${x.english} | ${x.korean}`).join('\n');
  $('save-title').textContent = `${currentMap} 저장`;
  $('map-select').value = currentMap;
  updateCounts();
  dirty = false;
}
function updateCounts() {
  for (const [editor, count] of [['words-editor', 'word-count'], ['expressions-editor', 'expression-count']]) {
    $(count).textContent = $(editor).value.split(/\r?\n/).filter(x => x.trim()).length;
  }
}
for (const id of ['words-editor', 'expressions-editor']) $(id).oninput = () => { dirty = true; updateCounts(); };
$('map-select').onchange = event => {
  if (dirty && !confirm('저장하지 않은 편집 내용이 있습니다. 맵을 바꿀까요?')) { event.target.value = currentMap; return; }
  currentMap = event.target.value;
  renderEditor();
};
async function persist(maps) {
  if (cloudEnabled) {
    if (!getRoom()) throw new Error('먼저 교실을 선택하거나 만들어 주세요.');
    const saved = await updateRoom(getRoom().id, maps);
    setRoom(saved);
    rooms = rooms.map(r => r.id === saved.id ? saved : r);
  }
  saveAllMapContent(maps);
  dirty = false;
}
$('save-content').onclick = () => action(async () => {
  const map = { words: parseEditor('words-editor'), expressions: parseEditor('expressions-editor') };
  validateMap(currentMap, map);
  const maps = structuredClone(getAllMapContent());
  maps[currentMap] = map;
  status('저장 중…');
  await persist(maps);
  status(`${currentMap} ${cloudEnabled ? '교실에 저장 완료' : '이 기기에 저장 완료'}`);
});
$('content-upload').onchange = event => action(async () => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    if (file.size > 1024 * 1024) throw new Error('학습자료 파일은 1MB 이하로 업로드해 주세요.');
    const text = await file.text();
    const maps = /\.csv$/i.test(file.name) ? parseAllMapsCsv(text) : parseAllMapsTxt(text);
    // Incomplete imports must not replace a working classroom with empty later maps.
    for (const id of MAP_IDS) validateMap(id, maps[id]);
    if (!confirm('선택한 교실의 MAP01~MAP12 학습자료를 이 파일로 교체할까요?')) return;
    status('전체 학습자료 저장 중…');
    await persist(maps);
    renderEditor();
    status(`전체 학습자료 ${cloudEnabled ? '교실에 저장 완료. 학생들은 입장 링크로 불러올 수 있습니다.' : '이 기기에 저장 완료.'}`);
  } finally { event.target.value = ''; }
});
function download(filename, text, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob(['\uFEFF', text], { type }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function exportMaps() {
  const maps = structuredClone(getAllMapContent());
  maps[currentMap] = { words: parseEditor('words-editor'), expressions: parseEditor('expressions-editor') };
  return maps;
}
$('download-csv').onclick = () => action(() => download('wisdom-maze-map01-map12.csv', serializeAllMapsCsv(exportMaps())));
$('download-txt').onclick = () => action(() => download('wisdom-maze-map01-map12.txt', serializeAllMapsTxt(exportMaps()), 'text/plain;charset=utf-8'));
$('download-csv-template').onclick = () => {
  const maps = {};
  for (const id of MAP_IDS) maps[id] = {
    words: ['door|문', 'key|열쇠', 'book|책', 'desk|책상'].map(x => { const [english, korean] = x.split('|'); return { english, korean }; }),
    expressions: ['Open the door.|문을 여세요.', 'Where is the key?|열쇠는 어디에 있나요?', 'Look at the book.|책을 보세요.', 'The key is on the desk.|열쇠는 책상 위에 있습니다.'].map(x => { const [english, korean] = x.split('|'); return { english, korean }; })
  };
  download('wisdom-maze-csv-template.csv', serializeAllMapsCsv(maps));
};
async function refreshRecords() {
  if (!getRoom()) throw new Error('먼저 교실을 선택해 주세요.');
  records = await readRoomRecords(getRoom().id);
  $('records-body').replaceChildren();
  for (const record of records) {
    const row = document.createElement('tr');
    for (const value of [record.student_name, record.map_id, record.play_time, record.first_try_correct, record.wrong_attempts, record.hints_used, record.completed ? '완료' : '진행 중']) {
      const cell = document.createElement('td'); cell.textContent = value; row.append(cell);
    }
    $('records-body').append(row);
  }
  $('records-status').textContent = `최근 ${records.length}개 기록 · 같은 학생의 맵별 최신 상태를 표시합니다 (최대 1,000개). 첫 시도 정답은 재시도 정답을 제외합니다.`;
}
$('refresh-records').onclick = () => action(refreshRecords);
$('download-records').onclick = () => action(async () => {
  await refreshRecords();
  const fields = ['student_name', 'map_id', 'play_time', 'questions_shown', 'first_try_correct', 'wrong_attempts', 'hints_used', 'completed', 'updated_at'];
  const escape = x => {
    const text = String(x ?? '');
    // Prevent spreadsheet formula execution when students choose their own names.
    return `"${(/^[=+@-]/.test(text) ? "'" : '') + text.replaceAll('"', '""')}"`;
  };
  download(`records-${getRoom().code}.csv`, [fields, ...records.map(r => fields.map(f => r[f]))].map(row => row.map(escape).join(',')).join('\r\n'));
});
window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
if (cloudEnabled && hasTeacherSession()) {
  action(async () => {
    await refreshRooms();
    $('admin-login').classList.add('hidden');
    $('admin-app').classList.remove('hidden');
  });
}
renderEditor();

$('show-classroom-qr').onclick = () => action(async () => {
  const room = getRoom();
  if (!room) throw new Error('먼저 교실을 선택하거나 만들어 주세요.');
  $('qr-dialog-room').textContent = room.name;
  $('qr-dialog-code').textContent = `교실 코드: ${room.code}`;
  await QRCode.toCanvas($('classroom-qr-large'), $('classroom-link').value, { width: 640, margin: 4, errorCorrectionLevel: 'M' });
  $('classroom-qr-dialog').showModal();
  $('close-classroom-qr').focus();
});
$('close-classroom-qr').onclick = () => $('classroom-qr-dialog').close();
$('classroom-qr-dialog').addEventListener('close', () => $('show-classroom-qr').focus());
