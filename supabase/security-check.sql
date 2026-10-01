-- Run in a test project's SQL Editor AFTER schema.sql. Everything rolls back.
begin;
insert into auth.users(id,email) values
 ('10000000-0000-0000-0000-000000000001','maze-test-a@example.invalid'),
 ('10000000-0000-0000-0000-000000000002','maze-test-b@example.invalid');
insert into public.classrooms(id,owner_id,code,name) values
 ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','TESTA1','A'),
 ('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','TESTB2','B');
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000001',true);
select set_config('request.jwt.claims','{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
do $$ begin
 if (select count(*) from public.classrooms) <> 1 then raise exception 'FAIL: cross-classroom read'; end if;
 update public.classrooms set name='unauthorized' where code='TESTB2';
 if found then raise exception 'FAIL: cross-classroom write'; end if;
 begin
   insert into public.classrooms(owner_id,code,name) values ('10000000-0000-0000-0000-000000000002','FAIL01','bad');
   raise exception 'FAIL: owner impersonation';
 exception when insufficient_privilege then null; end;
end $$;
set local role anon;
do $$ declare s jsonb; begin
 begin perform * from public.play_records; raise exception 'FAIL: student record disclosure';
 exception when insufficient_privilege then null; end;
 begin perform * from public.classroom_students; raise exception 'FAIL: student token disclosure';
 exception when insufficient_privilege then null; end;
 s := public.join_classroom('TESTA1','닉네임');
 perform public.save_play_progress((s->>'id')::uuid,(s->>'token')::uuid,'MAP01','{}',
   '{"play_time":10,"questions_shown":3,"first_try_correct":2,"wrong_attempts":1,"hints_used":1,"completed":false}');
 begin
   perform public.save_play_progress((s->>'id')::uuid,gen_random_uuid(),'MAP01','{}','{}');
   raise exception 'FAIL: student impersonation';
 exception when raise_exception then
   if sqlerrm = 'FAIL: student impersonation' then raise; end if;
 end;
end $$;
reset role;
do $$ begin
 if (select count(*) from public.play_records where classroom_id='20000000-0000-0000-0000-000000000001') <> 1
 then raise exception 'FAIL: progress write'; end if;
end $$;
rollback;
