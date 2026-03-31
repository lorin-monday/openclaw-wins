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

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger wins_set_updated_at
before update on public.wins
for each row execute function public.set_updated_at();

create index if not exists wins_status_idx on public.wins(status);
create index if not exists wins_provider_idx on public.wins(provider);
create index if not exists wins_verified_at_idx on public.wins(verified_at desc);
create index if not exists wins_tags_gin_idx on public.wins using gin(tags);
