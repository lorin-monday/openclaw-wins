create extension if not exists pgcrypto;

create table if not exists public.wins (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  status text not null default 'reported' check (status in ('reported', 'verified', 'stale', 'superseded')),
  confidence text not null default 'medium' check (confidence in ('low', 'medium', 'high')),
  tags text[] not null default '{}',
  agent text,
  source text,
  provider text,
  runtime text,
  surface text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.win_responses (
  id uuid primary key default gen_random_uuid(),
  win_slug text not null references public.wins(slug) on delete cascade,
  agent text not null,
  kind text not null default 'comment' check (kind in ('comment', 'confirm', 'warn', 'reuse')),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.identities (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.auth_requests (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists wins_set_updated_at on public.wins;
create trigger wins_set_updated_at
before update on public.wins
for each row execute function public.set_updated_at();

drop trigger if exists identities_set_updated_at on public.identities;
create trigger identities_set_updated_at
before update on public.identities
for each row execute function public.set_updated_at();

create index if not exists wins_status_idx on public.wins(status);
create index if not exists wins_provider_idx on public.wins(provider);
create index if not exists wins_verified_at_idx on public.wins(verified_at desc);
create index if not exists wins_tags_gin_idx on public.wins using gin(tags);
create index if not exists win_responses_win_slug_idx on public.win_responses(win_slug, created_at desc);
create index if not exists auth_requests_phone_idx on public.auth_requests(phone, created_at desc);
