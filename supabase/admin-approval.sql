-- Run AFTER schema.sql. First owner is bootstrapped manually once (see README).
create table if not exists public.admin_requests (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check (char_length(trim(display_name)) between 1 and 80),
 status text not null default 'pending' check (status in ('pending','approved','rejected')),
 role text check (role in ('owner','admin')),
 created_at timestamptz not null default now(),
 reviewed_at timestamptz,
 reviewed_by uuid references auth.users(id),
 constraint approved_role check ((status = 'approved' and role is not null) or (status <> 'approved' and role is null))
);
create or replace function public.is_owner() returns boolean language sql stable security definer set search_path = '' as $$
 select exists (select 1 from public.admin_requests where user_id = (select auth.uid()) and status = 'approved' and role = 'owner');
$$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
 select exists (select 1 from public.admin_requests where user_id = (select auth.uid()) and status = 'approved');
$$;
revoke all on function public.is_owner() from public;
revoke all on function public.is_admin() from public;
grant execute on function public.is_owner() to authenticated, anon;
grant execute on function public.is_admin() to authenticated, anon;
alter table public.admin_requests enable row level security;
create policy "read own or owner" on public.admin_requests for select to authenticated using (user_id = (select auth.uid()) or public.is_owner());
create policy "apply for access" on public.admin_requests for insert to authenticated with check (user_id = (select auth.uid()) and status = 'pending' and role is null and reviewed_at is null and reviewed_by is null);
-- No client UPDATE or DELETE policy: owner reviews via constrained RPC only.
create or replace function public.review_admin_request(target_user uuid, decision text)
returns void language plpgsql security definer set search_path = '' as $$
begin
 if not public.is_owner() then raise exception 'Owner permission required'; end if;
 if decision not in ('approved','rejected') then raise exception 'Invalid decision'; end if;
 update public.admin_requests set status = decision,
   role = case when decision = 'approved' then 'admin' else null end,
   reviewed_at = now(), reviewed_by = auth.uid()
 where user_id = target_user and status = 'pending';
 if not found then raise exception 'Pending request not found'; end if;
end; $$;
revoke all on function public.review_admin_request(uuid,text) from public;
grant execute on function public.review_admin_request(uuid,text) to authenticated;
-- Optional: remove old admins table AFTER migrating users. New is_admin uses admin_requests.
-- Bootstrap the FIRST owner only from SQL Editor, after they sign up and verify email:
-- insert into public.admin_requests(user_id,display_name,status,role)
-- values ('AUTH_USER_UUID','대표 관리자','approved','owner')
-- on conflict (user_id) do update set status='approved',role='owner';
