// Only a publishable/anon key belongs in this browser bundle.
const env = import.meta.env || {};
const URL_BASE = (env.VITE_SUPABASE_URL || 'https://ufpsyzoxggmxnwalrmff.supabase.co').replace(/\/$/, '');
const API_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_xyPDyPHupbs3gcpupjUODg__ybeolMM';
const SESSION_KEY = 'wisdom_teacher_session_v1';
const QUEUE_KEY = 'wisdom_cloud_queue_v1';
export const cloudEnabled = Boolean(URL_BASE && API_KEY);
let session = null;
try { session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch {}
let room = null;
let student = null;
let flushing = false;
let retryTimer;

async function request(path, { method = 'GET', body, teacher = false, headers = {} } = {}) {
  if (!cloudEnabled) throw new Error('Supabase 연결 설정이 필요합니다. README의 최초 설정을 확인해 주세요.');
  if (teacher) {
    if (!session) throw new Error('교사 로그인이 필요합니다.');
    if (Date.now() / 1000 >= session.expires_at - 60) {
      try {
        session = await request('/auth/v1/token?grant_type=refresh_token', {
          method: 'POST', body: { refresh_token: session.refresh_token }
        });
        session.expires_at = session.expires_at || Math.floor(Date.now() / 1000) + session.expires_in;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      } catch {
        session = null;
        sessionStorage.removeItem(SESSION_KEY);
        throw new Error('로그인이 만료되었습니다. 다시 로그인해 주세요.');
      }
    }
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${URL_BASE}${path}`, {
      method, signal: controller.signal,
      headers: {
        apikey: API_KEY,
        ...(teacher ? { Authorization: `Bearer ${session.access_token}` } : API_KEY.startsWith('eyJ') ? { Authorization: `Bearer ${API_KEY}` } : {}),
        'Content-Type': 'application/json', ...headers
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
    const text = await response.text();
    let result;
    try { result = text ? JSON.parse(text) : null; } catch { result = null; }
    if (!response.ok) throw new Error(result?.message || result?.msg || result?.error_description || `서버 요청 실패 (${response.status})`);
    return result;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('연결 시간이 초과되었습니다. 인터넷 연결을 확인해 주세요.');
    throw error;
  } finally { clearTimeout(timeout); }
}
export const rpc = (name, body) => request(`/rest/v1/rpc/${name}`, { method: 'POST', body });
export async function signIn(email, password) {
  session = await request('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } });
  session.expires_at = session.expires_at || Math.floor(Date.now() / 1000) + session.expires_in;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}
export async function signOut() {
  try { if (session) await request('/auth/v1/logout', { method: 'POST', teacher: true }); }
  finally { session = null; sessionStorage.removeItem(SESSION_KEY); room = null; }
}
export const hasTeacherSession = () => Boolean(session);
export const listRooms = () => request('/rest/v1/classrooms?select=id,code,name,maps&order=created_at.desc', { teacher: true });
export async function createRoom(name, maps) {
  const rows = await request('/rest/v1/classrooms', {
    method: 'POST', teacher: true, headers: { Prefer: 'return=representation' },
    body: { name, maps, owner_id: session.user.id }
  });
  return rows[0];
}
export async function updateRoom(id, maps) {
  const rows = await request(`/rest/v1/classrooms?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH', teacher: true, headers: { Prefer: 'return=representation' }, body: { maps }
  });
  if (rows?.length !== 1) throw new Error('교실 저장 권한이 없거나 교실이 삭제되었습니다.');
  return rows[0];
}
export const readRoomRecords = id => request(`/rest/v1/play_records?classroom_id=eq.${encodeURIComponent(id)}&select=id,student_name,map_id,play_time,questions_shown,first_try_correct,wrong_attempts,hints_used,completed,updated_at&order=updated_at.desc&limit=1000`, { teacher: true });
export const getRoom = () => room;
export const setRoom = value => { room = value; };
export const storageScope = () => room ? `${room.code}_${student?.id || 'teacher'}` : 'local';
export function resetStudentContext() { room = null; student = null; }
export async function enterClassroom(code, name, { fresh = false } = {}) {
  code = String(code).trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code)) throw new Error('교실 코드는 영문/숫자 6자리입니다.');
  const fetched = await rpc('get_classroom', { p_code: code });
  if (!fetched) throw new Error('교실 코드를 찾을 수 없습니다.');
  const key = `wisdom_student_${code}_${encodeURIComponent(name)}`;
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(key) || 'null'); } catch {}
  if (fresh || !saved) {
    saved = await rpc('join_classroom', { p_code: code, p_name: name });
    localStorage.setItem(key, JSON.stringify(saved));
  }
  room = fetched;
  student = saved;
  flushQueue();
  return { classroomCode: code, studentId: saved.id };
}

function queue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch { return []; }
}
function notifyStatus(message) {
  window.dispatchEvent(new CustomEvent('wisdom-cloud-status', { detail: message }));
}
export function queueProgress(mapId, name, state, record = null) {
  if (!room || !student) return;
  const playTime = record?.playTime ?? Math.max(0, Math.floor((Date.now() - (state.sessionStartedAt || Date.now())) / 1000));
  const item = {
    p_student_id: student.id, p_token: student.token, p_map_id: mapId,
    p_state: structuredClone(state),
    p_metrics: {
      play_time: playTime, questions_shown: record?.questionsShown ?? state.questionsShown ?? 0,
      first_try_correct: record?.firstTryCorrect ?? state.firstTryCorrect ?? 0,
      wrong_attempts: record?.wrongAttempts ?? state.wrongAttempts ?? 0,
      hints_used: record?.hintsUsed ?? state.hintsUsed ?? 0,
      completed: Boolean(record?.completed ?? state.completed)
    }
  };
  const items = queue().filter(x => x.p_student_id !== item.p_student_id || x.p_map_id !== mapId);
  items.push(item);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
  notifyStatus('기록 저장 중…');
  clearTimeout(retryTimer);
  retryTimer = setTimeout(flushQueue, 800);
}
export async function flushQueue() {
  if (flushing || !cloudEnabled) return;
  flushing = true;
  try {
    for (const item of queue()) {
      await rpc('save_play_progress', item);
      // Do not remove a newer update that arrived during the request.
      const items = queue().filter(x => JSON.stringify(x) !== JSON.stringify(item));
      localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
    }
    notifyStatus(queue().length ? '기록 저장 중…' : '기록 저장 완료');
  } catch {
    notifyStatus('기록을 기기에 보관했습니다. 연결되면 다시 저장합니다.');
  } finally {
    flushing = false;
    if (queue().length) { clearTimeout(retryTimer); retryTimer = setTimeout(flushQueue, 15000); }
  }
}
if (cloudEnabled) setTimeout(flushQueue, 0);
window.addEventListener('online', flushQueue);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushQueue(); });
