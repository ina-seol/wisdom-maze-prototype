-- Run once in the Supabase SQL Editor. No service_role key is used by the app.
begin;
create table public.classrooms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  code text not null unique check (code ~ '^[A-Z0-9]{6}$'),
  name text not null check (char_length(name) between 1 and 80),
  maps jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create function public.assign_classroom_code() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.code is null then
    loop
      new.code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
      exit when not exists (select 1 from public.classrooms where code = new.code);
    end loop;
  end if;
  return new;
end;
$$;
create trigger classroom_code before insert on public.classrooms
for each row execute function public.assign_classroom_code();

create table public.classroom_students (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  student_name text not null check (char_length(student_name) between 1 and 20),
  token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);
create table public.play_records (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  student_id uuid not null references public.classroom_students(id) on delete cascade,
  student_name text not null,
  map_id text not null check (map_id ~ '^MAP(0[1-9]|1[0-2])$'),
  play_time integer not null check (play_time >= 0),
  questions_shown integer not null check (questions_shown >= 0),
  first_try_correct integer not null check (first_try_correct >= 0),
  wrong_attempts integer not null check (wrong_attempts >= 0),
  hints_used integer not null check (hints_used >= 0),
  completed boolean not null default false,
  state jsonb not null,
  updated_at timestamptz not null default now(),
  unique (student_id, map_id)
);
create index on public.classrooms(owner_id);
create index on public.classroom_students(classroom_id);
create index on public.play_records(classroom_id, updated_at desc);

alter table public.classrooms enable row level security;
alter table public.classroom_students enable row level security;
alter table public.play_records enable row level security;
revoke all on public.classrooms, public.classroom_students, public.play_records from anon, authenticated;
grant select, insert, update, delete on public.classrooms to authenticated;
grant select on public.play_records to authenticated;
create policy teacher_classrooms on public.classrooms to authenticated
using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy teacher_records on public.play_records for select to authenticated
using (exists (select 1 from public.classrooms c where c.id = classroom_id and c.owner_id = (select auth.uid())));

-- Public callers receive learning material only; student names/records are never returned.
create function public.get_classroom(p_code text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare c public.classrooms;
begin
  select * into c from public.classrooms where code = upper(trim(p_code));
  if not found then raise exception '교실 코드를 찾을 수 없습니다.'; end if;
  return jsonb_build_object('id', c.id, 'code', c.code, 'name', c.name, 'maps', c.maps);
end;
$$;
create function public.join_classroom(p_code text, p_name text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare c uuid; s public.classroom_students;
begin
  if p_name is null or char_length(trim(p_name)) not between 1 and 20 then
    raise exception '이름은 1~20자로 입력해 주세요.';
  end if;
  select id into c from public.classrooms where code = upper(trim(p_code));
  if c is null then raise exception '교실 코드를 찾을 수 없습니다.'; end if;
  insert into public.classroom_students(classroom_id, student_name)
  values (c, trim(p_name)) returning * into s;
  return jsonb_build_object('id', s.id, 'token', s.token);
end;
$$;
-- Only the random student credential returned by join_classroom can write this student's records.
create function public.save_play_progress(
  p_student_id uuid, p_token uuid, p_map_id text, p_state jsonb, p_metrics jsonb
) returns void
language plpgsql security definer set search_path = '' as $$
declare s public.classroom_students;
begin
  select * into s from public.classroom_students where id = p_student_id and token = p_token;
  if not found then raise exception '학생 입장 정보가 유효하지 않습니다.'; end if;
  if p_state is null or jsonb_typeof(p_state) <> 'object' or octet_length(p_state::text) > 100000 then
    raise exception '진행 데이터 형식이 올바르지 않습니다.';
  end if;
  insert into public.play_records (
    classroom_id, student_id, student_name, map_id, play_time, questions_shown,
    first_try_correct, wrong_attempts, hints_used, completed, state
  ) values (
    s.classroom_id, s.id, s.student_name, p_map_id,
    (p_metrics->>'play_time')::integer, (p_metrics->>'questions_shown')::integer,
    (p_metrics->>'first_try_correct')::integer, (p_metrics->>'wrong_attempts')::integer,
    (p_metrics->>'hints_used')::integer, (p_metrics->>'completed')::boolean, p_state
  ) on conflict (student_id, map_id) do update set
    play_time = greatest(public.play_records.play_time, excluded.play_time),
    questions_shown = greatest(public.play_records.questions_shown, excluded.questions_shown),
    first_try_correct = greatest(public.play_records.first_try_correct, excluded.first_try_correct),
    wrong_attempts = greatest(public.play_records.wrong_attempts, excluded.wrong_attempts),
    hints_used = greatest(public.play_records.hints_used, excluded.hints_used),
    completed = public.play_records.completed or excluded.completed,
    state = excluded.state, updated_at = now();
end;
$$;
revoke all on function public.assign_classroom_code() from public, anon, authenticated;
revoke all on function public.get_classroom(text), public.join_classroom(text,text),
  public.save_play_progress(uuid,uuid,text,jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.get_classroom(text), public.join_classroom(text,text),
  public.save_play_progress(uuid,uuid,text,jsonb,jsonb) to anon, authenticated;
commit;
