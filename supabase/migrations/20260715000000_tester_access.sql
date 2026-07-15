create table if not exists public.tester_access_rate_limits (
  fingerprint text primary key,
  attempts integer not null default 0,
  window_started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tester_access_rate_limits enable row level security;
revoke all on public.tester_access_rate_limits from anon, authenticated;
grant all on public.tester_access_rate_limits to service_role;

create or replace function public.consume_tester_access_attempt(
  p_fingerprint text,
  p_limit integer default 8,
  p_window_seconds integer default 900
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_attempts integer;
begin
  insert into public.tester_access_rate_limits (
    fingerprint,
    attempts,
    window_started_at,
    updated_at
  ) values (
    p_fingerprint,
    1,
    now(),
    now()
  )
  on conflict (fingerprint) do update set
    attempts = case
      when public.tester_access_rate_limits.window_started_at
        <= now() - make_interval(secs => p_window_seconds)
      then 1
      else public.tester_access_rate_limits.attempts + 1
    end,
    window_started_at = case
      when public.tester_access_rate_limits.window_started_at
        <= now() - make_interval(secs => p_window_seconds)
      then now()
      else public.tester_access_rate_limits.window_started_at
    end,
    updated_at = now()
  returning attempts into current_attempts;

  return current_attempts <= greatest(1, least(p_limit, 20));
end;
$$;

revoke all on function public.consume_tester_access_attempt(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_tester_access_attempt(text, integer, integer)
  to service_role;
