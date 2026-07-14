create table if not exists public.beta_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  role text not null default 'student' check (role in ('student', 'instructor', 'admin')),
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.beta_lesson_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  completed boolean not null default false,
  note text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.beta_challenge_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_id text not null,
  draft text not null default '',
  submissions jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, challenge_id)
);

alter table public.beta_members enable row level security;
alter table public.beta_lesson_state enable row level security;
alter table public.beta_challenge_state enable row level security;

create policy "members_select_own"
  on public.beta_members for select
  using ((select auth.uid()) = user_id);
create policy "members_insert_own"
  on public.beta_members for insert
  with check ((select auth.uid()) = user_id);
create policy "members_update_own"
  on public.beta_members for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "lesson_state_select_own"
  on public.beta_lesson_state for select
  using ((select auth.uid()) = user_id);
create policy "lesson_state_insert_own"
  on public.beta_lesson_state for insert
  with check ((select auth.uid()) = user_id);
create policy "lesson_state_update_own"
  on public.beta_lesson_state for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "challenge_state_select_own"
  on public.beta_challenge_state for select
  using ((select auth.uid()) = user_id);
create policy "challenge_state_insert_own"
  on public.beta_challenge_state for insert
  with check ((select auth.uid()) = user_id);
create policy "challenge_state_update_own"
  on public.beta_challenge_state for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.protect_beta_member_role()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.role() <> 'service_role' then
    if tg_op = 'INSERT' then
      new.role := 'student';
    else
      new.role := old.role;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_beta_member_role on public.beta_members;
create trigger protect_beta_member_role
before insert or update on public.beta_members
for each row execute function public.protect_beta_member_role();

grant select, insert, update on public.beta_members to authenticated;
grant select, insert, update on public.beta_lesson_state to authenticated;
grant select, insert, update on public.beta_challenge_state to authenticated;
