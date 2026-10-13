-- =====================================================================
-- GFD (Game for Dads): cloud saves + highscores
-- Run ONCE in the SQL Editor of the NEW "gfd" Supabase project (NOT Soccer RPG!).
-- Safe on a fresh project: it only creates new things. Nothing is dropped or deleted.
--
-- How it's locked down:
--   * The 3 tables have row level security ON with NO policies and no table grants,
--     so the game can't read or write them directly.
--   * The game only talks to 3 SECURITY DEFINER functions: gfd_save, gfd_load, gfd_leaderboard.
--   * A dad proves who he is with his secret cloud code. We only store its sha256 hash.
--   * Unlike Soccer RPG, the functions are granted to "anon" on purpose: GFD has no logins,
--     the cloud code is the login.
-- =====================================================================
begin;

-- one row per dad. Only the HASH of the cloud code is stored, never the code itself
create table if not exists public.gfd_players (
  id          uuid primary key default gen_random_uuid(),
  secret_hash text not null unique,
  created_at  timestamptz not null default now()
);

-- the full save (the game's JSON as text), one per dad
create table if not exists public.gfd_saves (
  player_id  uuid primary key references public.gfd_players(id) on delete cascade,
  data       text   not null,
  saved_at   bigint not null,   -- game clock (ms) when this save was made: newer wins
  started    bigint not null,   -- when this dad was created: tells two different dads apart
  updated_at timestamptz not null default now()
);

-- highscore row, one per dad: only what the board shows
create table if not exists public.gfd_scores (
  player_id  uuid primary key references public.gfd_players(id) on delete cascade,
  name       text   not null,
  look       jsonb  not null default '{}'::jsonb,
  lv         jsonb  not null default '{}'::jsonb,
  total      int    not null default 8,
  combat     int    not null default 1,
  kills      bigint not null default 0,
  tasks      int    not null default 0,
  weapon     int    not null default -1,
  updated_at timestamptz not null default now()
);

-- lock the tables: no direct access from the game, only through the functions below
alter table public.gfd_players enable row level security;
alter table public.gfd_saves   enable row level security;
alter table public.gfd_scores  enable row level security;
revoke all on table public.gfd_players, public.gfd_saves, public.gfd_scores from anon, authenticated;

-- turns any text into a whole number within [lo, hi], or the fallback if it isn't a number
create or replace function public.gfd_int(p_val text, p_lo bigint, p_hi bigint, p_fallback bigint)
returns bigint
language sql
immutable
set search_path = pg_catalog, public
as $$
  select case when p_val ~ '^-?[0-9]{1,15}$' then least(p_hi, greatest(p_lo, p_val::bigint)) else p_fallback end;
$$;
revoke execute on function public.gfd_int(text, bigint, bigint, bigint) from public, anon, authenticated;

-- cloud code -> hash. Ignores dashes/spaces and upper/lower case, so "gfd-k7qm-..." works too
create or replace function public.gfd_code_hash(p_code text)
returns text
language sql
immutable
set search_path = pg_catalog, public
as $$
  select case
    when length(upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'))) = 19   -- "GFD" + 16 chars
     and upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g')) like 'GFD%'
    then encode(sha256(convert_to(upper(regexp_replace(p_code, '[^A-Za-z0-9]', '', 'g')), 'UTF8')), 'hex')
    else null
  end;
$$;
revoke execute on function public.gfd_code_hash(text) from public, anon, authenticated;

-- SAVE: stores the dad's save and his highscore row. Creates the dad the first time.
create or replace function public.gfd_save(p_code text, p_data text, p_saved_at bigint, p_started bigint, p_score jsonb)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_hash  text := public.gfd_code_hash(p_code);
  v_id    uuid;
  v_old   public.gfd_saves%rowtype;
  v_lv    jsonb := '{}'::jsonb;
  v_total int := 0;
  v_key   text;
  v_look  jsonb := '{}'::jsonb;
begin
  if v_hash is null then
    return jsonb_build_object('ok', false, 'reason', 'bad_code');
  end if;
  if p_data is null or length(p_data) > 300000 or p_saved_at is null or p_started is null then
    return jsonb_build_object('ok', false, 'reason', 'bad_save');
  end if;

  select id into v_id from public.gfd_players where secret_hash = v_hash;
  if v_id is null then
    -- a game for a few dads: cap sign-ups so nobody can flood the free project
    if (select count(*) from public.gfd_players) >= 200 then
      return jsonb_build_object('ok', false, 'reason', 'full');
    end if;
    insert into public.gfd_players (secret_hash) values (v_hash) on conflict (secret_hash) do nothing;
    select id into v_id from public.gfd_players where secret_hash = v_hash;
  end if;

  -- an older copy of the SAME dad (a stale phone) may never overwrite a newer save
  select * into v_old from public.gfd_saves where player_id = v_id;
  if found and v_old.started = p_started and v_old.saved_at > p_saved_at then
    return jsonb_build_object('ok', false, 'reason', 'stale', 'saved_at', v_old.saved_at);
  end if;

  insert into public.gfd_saves (player_id, data, saved_at, started, updated_at)
  values (v_id, p_data, p_saved_at, p_started, now())
  on conflict (player_id) do update
    set data = excluded.data, saved_at = excluded.saved_at, started = excluded.started, updated_at = now();

  -- highscore row: every number is cleaned here, the server works out total and combat itself
  if p_score is not null and jsonb_typeof(p_score) = 'object' then
    foreach v_key in array array['fishing','cooking','attack','strength','defence','hitpoints','slayer','trading'] loop
      v_lv := v_lv || jsonb_build_object(v_key, public.gfd_int(p_score -> 'lv' ->> v_key, 1, 100, 1));
      v_total := v_total + (v_lv ->> v_key)::int;
    end loop;
    if jsonb_typeof(p_score -> 'look') = 'object' and length((p_score -> 'look')::text) < 400 then
      v_look := p_score -> 'look';
    end if;
    insert into public.gfd_scores (player_id, name, look, lv, total, combat, kills, tasks, weapon, updated_at)
    values (
      v_id,
      coalesce(nullif(left(regexp_replace(coalesce(p_score ->> 'name', ''), '[[:cntrl:]<>]', '', 'g'), 16), ''), 'Dad'),
      v_look, v_lv, v_total,
      ((v_lv->>'attack')::int + (v_lv->>'strength')::int + (v_lv->>'defence')::int + (v_lv->>'hitpoints')::int) / 4,
      public.gfd_int(p_score ->> 'kills', 0, 1000000000000, 0),
      public.gfd_int(p_score ->> 'tasks', 0, 1000000, 0),
      case when public.gfd_int(p_score ->> 'weapon', -1000, 1000, -1) between -1 and 9
           then public.gfd_int(p_score ->> 'weapon', -1, 9, -1) else -1 end,   -- an invalid weapon = no weapon
      now()
    )
    on conflict (player_id) do update
      set name = excluded.name, look = excluded.look, lv = excluded.lv, total = excluded.total,
          combat = excluded.combat, kills = excluded.kills, tasks = excluded.tasks,
          weapon = excluded.weapon, updated_at = now();
  end if;

  return jsonb_build_object('ok', true, 'player_id', v_id, 'saved_at', p_saved_at);
end;
$$;

-- LOAD: gives a dad his save back with his cloud code (new phone, wiped browser)
create or replace function public.gfd_load(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_hash text := public.gfd_code_hash(p_code);
  v_id   uuid;
  v_save public.gfd_saves%rowtype;
begin
  if v_hash is null then
    return jsonb_build_object('ok', false, 'reason', 'bad_code');
  end if;
  select id into v_id from public.gfd_players where secret_hash = v_hash;
  if v_id is null then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;
  select * into v_save from public.gfd_saves where player_id = v_id;
  if not found then
    return jsonb_build_object('ok', true, 'player_id', v_id, 'data', null);
  end if;
  return jsonb_build_object('ok', true, 'player_id', v_id, 'data', v_save.data,
                            'saved_at', v_save.saved_at, 'started', v_save.started);
end;
$$;

-- LEADERBOARD: the top 100 dads. Public by design: names, looks and levels only
create or replace function public.gfd_leaderboard()
returns jsonb
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select jsonb_build_object('ok', true, 'rows', coalesce(jsonb_agg(to_jsonb(r) order by r.total desc), '[]'::jsonb))
  from (
    select player_id, name, look, lv, total, combat, kills, tasks, weapon,
           (extract(epoch from updated_at) * 1000)::bigint as at
    from public.gfd_scores
    order by total desc
    limit 100
  ) r;
$$;

-- who may call what: only the 3 game functions, and (no logins in GFD) anon is allowed on purpose
revoke execute on function public.gfd_save(text, text, bigint, bigint, jsonb) from public;
revoke execute on function public.gfd_load(text) from public;
revoke execute on function public.gfd_leaderboard() from public;
grant  execute on function public.gfd_save(text, text, bigint, bigint, jsonb) to anon, authenticated;
grant  execute on function public.gfd_load(text) to anon, authenticated;
grant  execute on function public.gfd_leaderboard() to anon, authenticated;

commit;
