-- GFD v0.20: a shared news feed (rare drops, pets, badges, level milestones), written only by the "gfd" Edge Function.
create table if not exists public.gfd_feed (
  id         bigserial primary key,
  player_id  uuid not null references public.gfd_players(id) on delete cascade,
  name       text not null,
  kind       text not null,
  text       text not null,
  created_at timestamptz not null default now()
);
create index if not exists gfd_feed_created_at_idx on public.gfd_feed (created_at);
alter table public.gfd_feed enable row level security;
revoke all on table public.gfd_feed from anon, authenticated;
revoke all on sequence public.gfd_feed_id_seq from anon, authenticated;
