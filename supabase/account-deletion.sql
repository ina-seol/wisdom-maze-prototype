-- Existing and new projects: run once in Supabase SQL Editor.
-- Only the caller can delete their own Auth identity; no target user ID is accepted.
begin;
create or replace function public.delete_teacher_account() returns void
language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid();
begin
  if caller is null then raise exception '교사 로그인이 필요합니다.'; end if;
  delete from auth.users where id = caller;
  if not found then raise exception '계정을 찾을 수 없습니다.'; end if;
end;
$$;
revoke all on function public.delete_teacher_account() from public, anon, authenticated;
grant execute on function public.delete_teacher_account() to authenticated;
commit;
