const count = value => Math.max(0, Number(value) || 0);
export function mapScore(record) {
  if (!record.completed) return 0;
  const shown = count(record.questions_shown);
  const correct = Math.min(shown, count(record.first_try_correct));
  const accuracy = shown ? correct / shown : 0;
  return Math.max(0, Math.min(1000, 600 + Math.round(400 * accuracy) - 20 * count(record.wrong_attempts) - 10 * count(record.hints_used)));
}
function better(a, b) {
  if (Boolean(a.completed) !== Boolean(b.completed)) return Boolean(a.completed);
  if (mapScore(a) !== mapScore(b)) return mapScore(a) > mapScore(b);
  if (count(a.play_time) !== count(b.play_time)) return count(a.play_time) < count(b.play_time);
  return Date.parse(a.updated_at) > Date.parse(b.updated_at);
}
export function buildLeaderboard(records, classroomId, now = Date.now()) {
  const students = new Map();
  for (const record of records) {
    if (record.classroom_id !== classroomId || !/^MAP(0[1-9]|1[0-2])$/.test(record.map_id)) continue;
    const key = String(record.student_name || '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
    if (!key) continue;
    if (!students.has(key)) students.set(key, { name: record.student_name, maps: new Map(), lastSeen: 0, currentMap: record.map_id });
    const student = students.get(key);
    const time = Date.parse(record.updated_at) || 0;
    if (time >= student.lastSeen) {
      student.lastSeen = time; student.currentMap = record.map_id; student.name = record.student_name;
      student.latestCompleted = record.completed;
    }
    const best = student.maps.get(record.map_id);
    if (!best || better(record, best)) student.maps.set(record.map_id, record);
  }
  const rows = [...students.values()].map(student => {
    const completed = [...student.maps.values()].filter(record => record.completed);
    const shown = completed.reduce((sum, record) => sum + count(record.questions_shown), 0);
    const correct = completed.reduce((sum, record) => sum + Math.min(count(record.first_try_correct), count(record.questions_shown)), 0);
    return {
      name: student.name, score: completed.reduce((sum, record) => sum + mapScore(record), 0),
      completed: completed.length, accuracy: shown ? correct / shown : 0,
      playTime: completed.reduce((sum, record) => sum + count(record.play_time), 0),
      lastSeen: student.lastSeen, active: student.lastSeen > 0 && now - student.lastSeen <= 60000,
      currentMap: student.currentMap, latestCompleted: student.latestCompleted
    };
  }).sort((a, b) => b.score - a.score || b.completed - a.completed || b.accuracy - a.accuracy || a.playTime - b.playTime || a.name.localeCompare(b.name, 'ko'));
  rows.forEach((row, index) => {
    const previous = rows[index - 1];
    row.rank = previous && row.score === previous.score && row.completed === previous.completed && row.accuracy === previous.accuracy && row.playTime === previous.playTime ? previous.rank : index + 1;
  });
  return rows;
}
