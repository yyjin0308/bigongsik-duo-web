-- Supabase SQL Editor에서 실행하세요.
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  gender text not null check (gender in ('female','male')),
  display_name text not null,
  birth_year integer check (birth_year between 1900 and 2100),
  job text, region text, height_cm integer check (height_cm between 100 and 250),
  bio text, hobbies text, ideal_type text,
  photos text[] not null default '{}',
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
 select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
alter table public.admins enable row level security;
alter table public.profiles enable row level security;
create policy "admins can view their membership" on public.admins for select to authenticated using (user_id = (select auth.uid()));
create policy "public read published profiles" on public.profiles for select to anon,authenticated using (is_published = true or public.is_admin());
create policy "admins insert profiles" on public.profiles for insert to authenticated with check (public.is_admin());
create policy "admins update profiles" on public.profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins delete profiles" on public.profiles for delete to authenticated using (public.is_admin());
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('profile-photos','profile-photos',true,5242880,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;
create policy "admin upload profile photos" on storage.objects for insert to authenticated with check (bucket_id='profile-photos' and public.is_admin());
-- 인증 메뉴에서 관리자 사용자를 생성한 다음, 아래 SQL을 별도로 실행하세요.
-- insert into public.admins(user_id) values ('관리자_AUTH_USER_UUID');
