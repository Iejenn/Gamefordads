// GFD server: the only place where game maths happens. Shared by the Supabase Edge Function and the local tests.
export const MOVE_DEADLINE = Date.parse('2026-10-20T23:59:59Z');   // old phone saves can move to the server until then
const MAX_DADS = 200;
export function normCode(c) { const x = String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); return /^GFD[A-Z0-9]{16}$/.test(x) ? x : null; }
export async function sha256hex(s) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(d), b => b.toString(16).padStart(2, '0')).join('');
}
async function newPlayer(tx, hash) {
  const [{n}] = await tx`select count(*)::int as n from public.gfd_players`;
  if (n >= MAX_DADS) return null;
  const [p] = await tx`insert into public.gfd_players (secret_hash) values (${hash})
    on conflict (secret_hash) do update set secret_hash = excluded.secret_hash returning id`;
  return p;
}
export async function handle(body, sql, createEngine) {
  const code = normCode(body && body.code);
  if (!code) return {ok: false, reason: 'bad_code'};
  const action = String((body && body.action) || 'sync').slice(0, 30);
  const args = body && typeof body.args === 'object' && body.args ? body.args : {};
  const hash = await sha256hex(code);
  return await sql.begin(async tx => {
    let [p] = await tx`select id from public.gfd_players where secret_hash = ${hash}`;
    // lock this dad's row: two phones tapping at once are handled one after the other
    const row = p ? (await tx`select state, legacy from public.gfd_state where player_id = ${p.id} for update`)[0] : null;
    const E = createEngine(null);
    if (row) {
      E.setS(E.migrate(row.state));   // every load fills in anything a newer version added (old saves, new fields like pets)
      if (!E.S) return {ok: false, reason: 'broken_save'};
      if (row.legacy) E.S.log.unshift({text: 'Your dad moved to the server: from now on every dice roll happens there. Your progress came along.', kind: 'lvl'});
    } else if (action === 'create') {
      if (!p && !(p = await newPlayer(tx, hash))) return {ok: false, reason: 'full'};
      E.setS(E.freshState(E.cleanName(args.name), E.cleanLook(args.look)));
    } else if (body.legacy && Date.now() < MOVE_DEADLINE) {         // an old phone-only save moving over (amnesty window)
      let L = body.legacy; if (typeof L === 'string') { try { L = JSON.parse(L); } catch (e) { L = null; } }
      const m = L && typeof L === 'object' ? E.migrate(L) : null;
      if (!m) return {ok: false, reason: 'no_dad'};
      if (!p && !(p = await newPlayer(tx, hash))) return {ok: false, reason: 'full'};
      E.setS(m); E.S.name = E.cleanName(E.S.name); E.S.look = E.cleanLook(E.S.look);
      E.S.log.unshift({text: 'Your dad moved to the server: from now on every dice roll happens there. Your progress came along.', kind: 'lvl'});
    } else return {ok: false, reason: 'no_dad'};

    const S = E.S;
    delete S.cloudCode; delete S.codeCopiedAt; delete S.seenVersion; delete S.savedAt;   // phone-only bits from old saves
    E.tick();                          // catch up idle + health with the SERVER clock
    S.activeAt = Date.now();
    const out = E.doAction(action === 'create' ? 'sync' : action, args);
    S.lastSeen = Date.now();
    await tx`insert into public.gfd_state (player_id, state, legacy, updated_at) values (${p.id}, ${tx.json(S)}, false, now())
      on conflict (player_id) do update set state = excluded.state, legacy = false, version = public.gfd_state.version + 1, updated_at = now()`;
    const sc = E.scoreRow();
    await tx`insert into public.gfd_scores (player_id, name, look, lv, total, combat, kills, tasks, weapon, pet, updated_at)
      values (${p.id}, ${sc.name}, ${tx.json(sc.look)}, ${tx.json(sc.lv)}, ${sc.total}, ${sc.combat}, ${sc.kills ?? 0}, ${sc.tasks ?? 0}, ${sc.weapon ?? -1}, ${sc.pet ?? null}, now())
      on conflict (player_id) do update set name = excluded.name, look = excluded.look, lv = excluded.lv, total = excluded.total,
        combat = excluded.combat, kills = excluded.kills, tasks = excluded.tasks, weapon = excluded.weapon, pet = excluded.pet, updated_at = now()`;
    // news for the other dads: rare drops, pets, badges and level milestones
    if (E.news.length) {
      await tx`insert into public.gfd_feed (player_id, name, kind, text)
        select ${p.id}, ${S.name}, x.kind, x.text from jsonb_to_recordset(${tx.json(E.news.slice(0, 10))}) as x(kind text, text text)`;
      if (Math.random() < 0.05) await tx`delete from public.gfd_feed where created_at < now() - interval '7 days'`;
    }
    const since = Math.max(0, Math.floor(+body.feedSince || 0));
    const feed = await tx`select id::int as id, player_id, name, kind, text, (extract(epoch from created_at) * 1000)::float8 as t
      from public.gfd_feed where id > ${since} and created_at > now() - interval '3 days' order by id desc limit 25`;
    const view = Object.assign({}, S); if (view.pending) view.pending = {g: view.pending.g};   // the phone never sees fights ahead of time
    return {ok: true, player_id: p.id, state: view, feed, toasts: E.toasts, arena: E.arenaMsg, pop: out.pop, fight: out.fight, serverNow: Date.now()};
  });
}
