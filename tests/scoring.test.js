import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mapScore, buildLeaderboard } from '../src/scoring.js';
const now = Date.parse('2026-10-02T00:00:00Z');
const record = overrides => ({ classroom_id: 'a', student_name: '학생', map_id: 'MAP01', completed: true, questions_shown: 4, first_try_correct: 4, wrong_attempts: 0, hints_used: 0, play_time: 60, updated_at: new Date(now).toISOString(), ...overrides });
test('score awards completion and first-try accuracy, penalizes mistakes/hints, clamps and excludes unfinished maps', () => {
  assert.equal(mapScore(record()), 1000);
  assert.equal(mapScore(record({ first_try_correct: 3, wrong_attempts: 1, hints_used: 2 })), 860);
  assert.equal(mapScore(record({ completed: false })), 0);
  assert.equal(mapScore(record({ questions_shown: 0, first_try_correct: 0 })), 600);
  assert.equal(mapScore(record({ wrong_attempts: 100 })), 0);
});
test('rankings isolate classrooms, select best attempts, normalize names, and aggregate weighted accuracy', () => {
  const rows = buildLeaderboard([
    record(), record({ student_name: ' 학생 ', first_try_correct: 1 }),
    record({ student_name: '학생', map_id: 'MAP02', questions_shown: 8, first_try_correct: 4 }),
    record({ classroom_id: 'b', student_name: '다른 반' }), record({ map_id: 'MAP13' }),
    record({ student_name: '진행 학생', completed: false })
  ], 'a', now);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].score, 1800); assert.equal(rows[0].completed, 2); assert.equal(rows[0].accuracy, 8 / 12);
  assert.equal(rows[1].score, 0); assert.equal(rows[1].completed, 0);
});
test('ties use completion, accuracy and time; identical results share rank; activity expires', () => {
  const rows = buildLeaderboard([
    record({ student_name: '가', play_time: 20 }), record({ student_name: '나', play_time: 20 }),
    record({ student_name: '다', play_time: 30, updated_at: new Date(now - 61000).toISOString() })
  ], 'a', now);
  assert.deepEqual(rows.map(row => row.rank), [1, 1, 3]);
  assert.deepEqual(rows.map(row => row.active), [true, true, false]);
});
