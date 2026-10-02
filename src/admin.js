import './style.css';
import QRCode from 'qrcode';
import { MAP_IDS, getTeacherPin, getAllMapContent, saveAllMapContent, parseAllMapsCsv, serializeAllMapsCsv } from './data.js';
import { cloudEnabled, signIn, signUpTeacher, signOut, hasTeacherSession, listRooms, createRoom, updateRoom, deleteRoom, deleteTeacherAccount, readRoomRecords, getRoom, setRoom } from './cloud.js';
import { buildLeaderboard } from './scoring.js';
const $ = id => document.getElementById(id);
let rooms = [], records = [], busy = false, authenticating = false, recordRequest = 0, fetchingRoom = null;
const status = message => { $('save-status').textContent = message; };
const home = () => { location.href = import.meta.env.BASE_URL; };
$('back-title').onclick = home;
$('admin-home').onclick = home;
function controls() {
  for (const element of document.querySelectorAll('#admin-app button, #admin-app input, #admin-app select')) element.disabled = busy;
  for (const id of ['show-classroom-qr', 'copy-classroom-link', 'refresh-records', 'open-delete-classroom']) $(id).disabled = busy || !getRoom();
  $('content-upload').disabled = busy || (cloudEnabled && !getRoom());
  document.querySelector('.csv-upload-zone').classList.toggle('upload-disabled', $('content-upload').disabled);
}
async function action(fn) {
  if (busy) return;
  busy = true; controls();
  try { await fn(); } catch (error) { status(error.message); }
  finally { busy = false; controls(); }
}
function renderContent() {
  const maps = cloudEnabled ? getRoom()?.maps : getAllMapContent();
  const ready = MAP_IDS.filter(id => maps?.[id]?.words?.length >= 4 && maps?.[id]?.expressions?.length >= 4).length;
  $('content-summary').textContent = !maps ? '학급을 선택해 주세요.' : ready ? `${ready}/12개 맵 준비 완료 · 저장된 자료를 학생들이 자동으로 불러옵니다.` : '아직 학습자료가 없어요. CSV를 올리면 자동으로 저장됩니다.';
}
function renderRanking() {
  const rows = buildLeaderboard(records, getRoom()?.id);
  for (const [id, value, unit] of [['student-total', rows.length, '명'], ['student-active', rows.filter(row => row.active).length, '명'], ['map-total', rows.reduce((sum, row) => sum + row.completed, 0), '개']]) {
    $(id).replaceChildren(document.createTextNode(String(value)));
    const small = document.createElement('small'); small.textContent = unit; $(id).append(small);
  }
  const visible = rows.filter(row => $('ranking-filter').value !== 'active' || row.active);
  $('records-body').replaceChildren();
  for (const student of visible) {
    const row = document.createElement('tr');
    if (student.rank <= 3 && student.score > 0) row.className = `rank-top rank-${student.rank}`;
    const values = [student.rank, student.name, student.score.toLocaleString('ko-KR'), `${student.completed}/12`, student.completed ? `${Math.round(student.accuracy * 100)}%` : '—', `${student.active ? '최근 활동' : '이전 참여'} · ${student.currentMap} ${student.latestCompleted ? '완료' : '진행'}`];
    values.forEach((value, index) => { const cell = document.createElement('td'); cell.textContent = value; if (index === 5 && student.active) cell.className = 'recent-activity'; row.append(cell); });
    $('records-body').append(row);
  }
  $('ranking-empty').hidden = visible.length > 0;
  $('ranking-empty').textContent = rows.length ? '최근 1분 동안 저장된 활동 기록이 없습니다.' : 'QR로 입장한 학생들이 게임을 시작하면 여기에 표시됩니다.';
}
async function refreshRecords() {
  const room = getRoom();
  if (!room || fetchingRoom === room.id) return;
  const serial = ++recordRequest;
  fetchingRoom = room.id;
  $('records-status').textContent = '랭킹 불러오는 중…';
  try {
    const result = await readRoomRecords(room.id);
    if (serial !== recordRequest || getRoom()?.id !== room.id) return;
    records = result; renderRanking();
    $('records-status').textContent = `${new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 갱신 · 15초마다 자동 새로고침`;
  } catch (error) {
    if (serial === recordRequest) $('records-status').textContent = `${error.message} · 잠시 후 다시 시도합니다.`;
  } finally { if (serial === recordRequest) fetchingRoom = null; }
}
async function selectRoom(room) {
  recordRequest++; fetchingRoom = null; records = []; setRoom(room);
  $('classroom-select').value = room?.id || '';
  $('ranking-title').textContent = room ? `${room.name} 탐험 랭킹` : '우리 반 탐험 랭킹';
  $('classroom-info').textContent = room ? `${room.name} · 코드 ${room.code}` : '학급을 선택해 주세요.';
  const url = new URL(import.meta.env.BASE_URL, location.origin);
  if (room) url.searchParams.set('classroom', room.code);
  $('classroom-link').value = room ? url.href : '';
  $('classroom-link').hidden = true;
  $('classroom-qr').hidden = !room;
  if ($('classroom-qr-dialog').open) $('classroom-qr-dialog').close();
  status(''); renderContent(); renderRanking(); controls();
  $('records-status').textContent = '학급을 선택하면 랭킹이 표시됩니다.';
  if (room) { await QRCode.toCanvas($('classroom-qr'), url.href, { width: 180, margin: 2 }); await refreshRecords(); }
}
async function refreshRooms(selectId) {
  rooms = await listRooms();
  $('classroom-select').replaceChildren();
  for (const room of [null, ...rooms]) {
    const option = document.createElement('option'); option.value = room?.id || ''; option.textContent = room ? `${room.name} (${room.code})` : '학급을 선택하거나 새로 만드세요'; $('classroom-select').append(option);
  }
  await selectRoom(rooms.find(room => room.id === selectId) || rooms[0] || null);
  $('create-classroom-form').open = !rooms.length;
}
async function login(createAccount = false) {
  if (authenticating) return;
  authenticating = true; $('teacher-login').disabled = true; $('teacher-signup').disabled = true;
  $('login-status').textContent = createAccount ? '계정 만드는 중…' : '로그인 중…';
  let created = false;
  try {
    if (cloudEnabled) {
      const name = $('teacher-name').value.trim(), password = $('teacher-pin').value;
      if (createAccount) { await signUpTeacher(name, password); created = true; } else await signIn(name, password);
      $('teacher-pin').value = ''; await refreshRooms();
    } else if ($('teacher-pin').value !== getTeacherPin()) throw new Error('PIN이 올바르지 않습니다.');
    $('teacher-pin').value = ''; $('login-status').textContent = '';
    $('admin-login').classList.add('hidden'); $('admin-app').classList.remove('hidden');
    renderContent(); controls();
    if (createAccount) status('계정을 만들었습니다. 새 학급을 만들어 주세요.');
  } catch (error) { $('login-status').textContent = (created ? '계정은 만들어졌습니다. 다시 로그인해 주세요. ' : '') + error.message; }
  finally { authenticating = false; $('teacher-login').disabled = false; $('teacher-signup').disabled = false; }
}
$('teacher-login').onclick = () => login();
$('teacher-signup').onclick = () => login(true);
for (const id of ['teacher-name', 'teacher-pin']) $(id).onkeydown = event => { if (event.key === 'Enter') login(); };
$('teacher-logout').onclick = () => action(async () => { if (cloudEnabled) await signOut(); location.reload(); });
$('classroom-select').onchange = event => action(() => selectRoom(rooms.find(room => room.id === event.target.value) || null));
$('create-classroom').onclick = () => action(async () => {
  const name = $('classroom-name').value.trim();
  if (!name) throw new Error('학급 이름을 입력해 주세요.');
  const maps = Object.fromEntries(MAP_IDS.map(id => [id, { words: [], expressions: [] }]));
  const room = await createRoom(name, maps); await refreshRooms(room.id);
  $('classroom-name').value = ''; $('create-classroom-form').open = false;
  status('학급을 만들었습니다. CSV 파일을 올려 주세요.');
});
function validateMaps(maps) {
  for (const id of MAP_IDS) for (const section of ['words', 'expressions']) {
    const items = maps[id]?.[section];
    if (!items || items.length < 4 || items.length > 20) throw new Error(`${id}: 단어와 표현을 각각 4~20개 넣어 주세요.`);
    if (items.some(item => !item.english || !item.korean)) throw new Error(`${id}: 영어와 한국어 뜻이 모두 필요합니다.`);
    if (new Set(items.map(item => item.english.toLowerCase())).size !== items.length) throw new Error(`${id}: 중복된 영어 항목을 확인해 주세요.`);
  }
}
$('content-upload').onchange = event => action(async () => {
  const file = event.target.files?.[0]; if (!file) return;
  try {
    if (cloudEnabled && !getRoom()) throw new Error('먼저 학급을 만들어 주세요.');
    if (!/\.csv$/i.test(file.name)) throw new Error('CSV 파일을 선택해 주세요.');
    if (file.size > 1024 * 1024) throw new Error('1MB 이하 파일을 올려 주세요.');
    const maps = parseAllMapsCsv(await file.text()); validateMaps(maps);
    if (MAP_IDS.some(id => getRoom()?.maps?.[id]?.words?.length) && !confirm('현재 학급의 학습자료를 이 CSV로 교체할까요?')) return;
    status('CSV 저장 중…');
    if (cloudEnabled) {
      const saved = await updateRoom(getRoom().id, maps); setRoom(saved); rooms = rooms.map(room => room.id === saved.id ? saved : room);
    }
    saveAllMapContent(maps); renderContent();
    status('12개 맵 저장 완료! 학생들은 QR로 입장하면 됩니다.');
  } finally { event.target.value = ''; }
});
$('download-csv-template').onclick = () => {
  const items = values => values.map(value => { const [english, korean] = value.split('|'); return { english, korean }; });
  const maps = Object.fromEntries(MAP_IDS.map(id => [id, { words: items(['door|문', 'key|열쇠', 'book|책', 'desk|책상']), expressions: items(['Open the door.|문을 여세요.', 'Where is the key?|열쇠는 어디에 있나요?', 'Look at the book.|책을 보세요.', 'The key is on the desk.|열쇠는 책상 위에 있습니다.']) }]));
  const url = URL.createObjectURL(new Blob(['\uFEFF', serializeAllMapsCsv(maps)], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = 'wisdom-maze-csv-template.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
};
$('copy-classroom-link').onclick = () => action(async () => {
  try { await navigator.clipboard.writeText($('classroom-link').value); status('입장 링크를 복사했습니다.'); }
  catch { $('classroom-link').hidden = false; $('classroom-link').select(); status('Ctrl+C로 입장 링크를 복사해 주세요.'); }
});
$('show-classroom-qr').onclick = () => action(async () => {
  const room = getRoom(); if (!room) return;
  $('qr-dialog-room').textContent = room.name; $('qr-dialog-code').textContent = `교실 코드: ${room.code}`;
  await QRCode.toCanvas($('classroom-qr-large'), $('classroom-link').value, { width: 640, margin: 4, errorCorrectionLevel: 'M' });
  $('classroom-qr-dialog').showModal(); $('close-classroom-qr').focus();
});
$('close-classroom-qr').onclick = () => $('classroom-qr-dialog').close();
$('classroom-qr-dialog').addEventListener('close', () => $('show-classroom-qr').focus());
$('refresh-records').onclick = refreshRecords;
$('ranking-filter').onchange = renderRanking;
setInterval(() => { if (!document.hidden && !$('admin-app').classList.contains('hidden') && !busy) refreshRecords(); }, 15000);
document.addEventListener('visibilitychange', () => { if (!document.hidden && !$('admin-app').classList.contains('hidden')) refreshRecords(); });
if (!cloudEnabled) {
  $('login-help').textContent = '개인 연습 모드 · 교사용 PIN으로 로그인하세요.';
  $('teacher-name').hidden = true; $('name-label').hidden = true; $('teacher-signup').hidden = true;
  $('password-label').textContent = '교사용 PIN'; document.querySelector('.teacher-account-help').hidden = true;
  $('classroom-panel').hidden = true; $('records-panel').hidden = true;
}
controls();
if (cloudEnabled && hasTeacherSession()) action(async () => {
  await refreshRooms(); $('admin-login').classList.add('hidden'); $('admin-app').classList.remove('hidden');
});

let deletion = null;
function openDeletion(type) {
  const room = getRoom();
  if (type === 'room' && !room) return;
  deletion = { type, id: room?.id, code: room?.code };
  $('delete-title').textContent = type === 'room' ? `${room.name} 삭제` : '교사 계정 삭제';
  $('delete-description').textContent = type === 'room' ? '이 학급의 학습자료, 학생 입장 정보와 모든 기록을 영구 삭제합니다. 기존 QR과 링크로는 입장할 수 없습니다. 복구할 수 없습니다.' : '내 교사 계정과 내가 만든 모든 학급의 학습자료·학생 기록을 영구 삭제합니다. 복구할 수 없습니다.';
  $('delete-confirm-label').textContent = type === 'room' ? `확인을 위해 학급 코드 ${room.code}를 입력하세요.` : '확인을 위해 "계정 삭제"를 입력하세요.';
  $('delete-confirm-input').value = ''; $('delete-password').value = ''; $('delete-status').textContent = '';
  $('delete-password-section').hidden = type !== 'account';
  $('delete-dialog').showModal(); $('delete-confirm-input').focus();
}
$('open-delete-classroom').onclick = () => openDeletion('room');
$('open-delete-account').onclick = () => openDeletion('account');
$('cancel-delete').onclick = () => $('delete-dialog').close();
$('delete-dialog').addEventListener('close', () => { $('delete-password').value = ''; deletion = null; });
$('confirm-delete').onclick = async () => {
  if (!deletion || busy) return;
  const target = deletion;
  const expected = target.type === 'room' ? target.code : '계정 삭제';
  if ($('delete-confirm-input').value.trim() !== expected) { $('delete-status').textContent = '확인 문구를 정확히 입력해 주세요.'; return; }
  if (target.type === 'account' && !$('delete-password').value) { $('delete-status').textContent = '현재 비밀번호를 입력해 주세요.'; return; }
  $('confirm-delete').disabled = true; $('cancel-delete').disabled = true;
  busy = true; controls(); $('delete-status').textContent = '삭제 중…';
  try {
    if (target.type === 'room') { await deleteRoom(target.id); await refreshRooms(); $('delete-dialog').close(); status('학급과 연결된 기록을 삭제했습니다.'); }
    else { await deleteTeacherAccount($('delete-password').value); location.reload(); }
  } catch (error) { $('delete-status').textContent = error.message; }
  finally { $('delete-password').value = ''; busy = false; controls(); $('confirm-delete').disabled = false; $('cancel-delete').disabled = false; }
};
