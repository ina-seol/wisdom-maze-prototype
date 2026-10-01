import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('schema runs; RLS isolates teachers and student credentials protect records', async () => {
  const db = new PGlite();
  await db.exec(`
    create role anon;
    create role authenticated;
    create schema auth;
    create table auth.users(id uuid primary key, email text);
    create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth, public to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
  `);
  await db.exec(await readFile(new URL('../supabase/schema.sql', import.meta.url), 'utf8'));
  await db.exec(await readFile(new URL('../supabase/security-check.sql', import.meta.url), 'utf8'));
  assert.equal((await db.query('select count(*)::int as count from public.classrooms')).rows[0].count, 0);
  await db.exec(`insert into auth.users values ('10000000-0000-0000-0000-000000000003','test@example.invalid');
    insert into public.classrooms(owner_id,name,maps) values ('10000000-0000-0000-0000-000000000003','교실','{"MAP01":{"words":[]}}');`);
  const { rows: [room] } = await db.query('select * from public.classrooms');
  assert.match(room.code, /^[A-Z0-9]{6}$/);
  await db.exec('set role anon');
  const { rows: [{ room: fetched }] } = await db.query('select public.get_classroom($1) as room', [room.code.toLowerCase()]);
  assert.equal(fetched.name, '교실');
  assert.equal(fetched.owner_id, undefined);
  const { rows: [{ s }] } = await db.query("select public.join_classroom($1, '학생') as s", [room.code]);
  const metrics = { play_time: 12, questions_shown: 3, first_try_correct: 2, wrong_attempts: 1, hints_used: 1, completed: true };
  const save = (m, map = 'MAP01') => db.query('select public.save_play_progress($1,$2,$3,$4,$5)', [s.id, s.token, map, '{}', JSON.stringify(m)]);
  await save(metrics);
  await save({ ...metrics, play_time: 2, completed: false });
  await assert.rejects(save({ ...metrics, wrong_attempts: -1 }));
  await assert.rejects(save(metrics, 'MAP13'));
  await assert.rejects(db.query("select public.get_classroom('XXXXXX')"));
  await db.exec('reset role');
  const record = (await db.query('select * from public.play_records')).rows[0];
  assert.equal(record.play_time, 12);
  assert.equal(record.completed, true);
  assert.equal(record.student_name, '학생');
  assert.equal((await db.query('select count(*)::int as count from public.play_records')).rows[0].count, 1);
  await db.close();
});
