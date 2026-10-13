-- GFD v0.16: the server owns every dad. Run once (applied via the GFD Supabase connector).
begin;

-- the real state of each dad, written only by the "gfd" Edge Function
create table if not exists public.gfd_state (
  player_id  uuid primary key references public.gfd_players(id) on delete cascade,
  state      jsonb not null,
  legacy     boolean not null default false,   -- true = an old phone save the server hasn't converted yet
  version    int not null default 1,
  updated_at timestamptz not null default now()
);
alter table public.gfd_state enable row level security;
revoke all on table public.gfd_state from anon, authenticated;

-- amnesty: everyone's current cloud save becomes their starting point (converted on first visit)
insert into public.gfd_state (player_id, state, legacy)
select player_id, data::jsonb, true from public.gfd_saves
on conflict (player_id) do nothing;

-- the old door where a phone could upload its own save is closed for good
revoke execute on function public.gfd_save(text, text, bigint, bigint, jsonb) from anon, authenticated;

-- the board only shows dads the server has verified
create or replace function public.gfd_leaderboard()
returns jsonb
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select jsonb_build_object('ok', true, 'rows', coalesce(jsonb_agg(to_jsonb(r) order by r.total desc), '[]'::jsonb))
  from (
    select s.player_id, s.name, s.look, s.lv, s.total, s.combat, s.kills, s.tasks, s.weapon,
           (extract(epoch from s.updated_at) * 1000)::bigint as at
    from public.gfd_scores s
    join public.gfd_state st on st.player_id = s.player_id and st.legacy = false
    order by s.total desc
    limit 100
  ) r;
$$;

commit;
