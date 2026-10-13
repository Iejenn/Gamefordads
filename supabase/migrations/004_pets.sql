-- GFD v0.18: pets. The board shows which pet follows each dad.
alter table public.gfd_scores add column if not exists pet text;

create or replace function public.gfd_leaderboard()
returns jsonb
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select jsonb_build_object('ok', true, 'rows', coalesce(jsonb_agg(to_jsonb(r) order by r.total desc), '[]'::jsonb))
  from (
    select s.player_id, s.name, s.look, s.lv, s.total, s.combat, s.kills, s.tasks, s.weapon, s.pet,
           (extract(epoch from s.updated_at) * 1000)::bigint as at
    from public.gfd_scores s
    join public.gfd_state st on st.player_id = s.player_id and st.legacy = false
    order by s.total desc
    limit 100
  ) r;
$$;
