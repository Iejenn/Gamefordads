import { createEngine } from './engine_wip.mjs';
let ok = true; const check = (n, c, x = '') => { console.log((c ? 'PASS ' : 'FAIL ') + n, x); if (!c) ok = false; };
const mk = (p) => { const E = createEngine(null); const s = E.freshState('T', {}); Object.assign(s, p); E.setS(s); return E; };
// woodcutting
{ const E = mk({activity: 'wood', actAt: Date.now() - 5 * 60000 - 500, activeAt: Date.now()}); E.tick();
  check('5 minutes of chopping = 5 hedge logs', E.S.logs[0] === 5 && E.S.xp.woodcutting === 50, `logs=${E.S.logs[0]} xp=${E.S.xp.woodcutting}`); }
// brewing: log + veg -> beer, picks the best you can make, back to fishing when out
{ const E = mk({activity: 'brew', actAt: Date.now() - 95000, activeAt: Date.now(), logs: [2,1,0,0,0,0,0,0,0,0], veg: [5,0,0,0,0]}); E.S.xp.brewing = 5000; E.tick();
  check('brews Potato Lager first, then Hedge Shandy', E.S.beers[1] === 1 && E.S.beers[0] === 2 && E.S.veg[0] === 2, `beers=${E.S.beers.slice(0,2)} veg=${E.S.veg[0]} act=${E.S.activity}`);
  check('out of logs -> back to fishing', E.S.activity === 'fish'); }
// picked beer: only that one
{ const E = mk({logs: [3,3,0,0,0,0,0,0,0,0], veg: [9,0,0,0,0], activity: 'brew', actAt: Date.now() - 31000, activeAt: Date.now()}); E.S.xp.brewing = 5000;
  E.doAction('brewPick', {i: 0}); E.tick(); check('brews the picked beer', E.S.beers[0] === 1 && E.S.beers[1] === 0); }
// drinking, countdown per fight, auto-drink the same kind, then the best one left, then empty
{ const E = mk({hp: 1e6, beers: [0,2,0,0,0,0,0,0,0,0]}); E.S.xp.hitpoints = 1e6; E.CONFIG.beerFights = 3;
  E.doAction('drink', {i: 1}); check('drinking starts the buff', E.S.buff && E.S.buff.b === 1 && E.S.buff.left === 3 && E.S.beers[1] === 1);
  for (let i = 0; i < 3; i++) { E.doAction('fight'); E.doAction('fightEnd'); }
  check('auto-drinks the same beer', E.S.buff && E.S.buff.b === 1 && E.S.buff.left === 3 && E.S.beers[1] === 0, JSON.stringify(E.S.buff));
  for (let i = 0; i < 3; i++) { E.doAction('fight'); E.doAction('fightEnd'); }
  check('empty cellar: buff ends with a log line', E.S.buff === null && E.S.log.some(l => /cellar is empty/.test(l.text))); }
// buffs actually change fights
{ const avg = (beer) => { let d = 0, n = 0, c = 0, k = 0; for (let i = 0; i < 1500; i++) { const E = mk({hp: 1e6, beers: Array(10).fill(0)}); if (beer >= 0) { E.S.beers[beer] = 1; E.doAction('drink', {i: beer}); }
    const ev = E.doAction('fight').fight.ev; for (const [w, x] of ev) if (w === 'p') { d += x; n++; } E.doAction('fightEnd'); if (E.S.stats.kills) { c += E.S.coins; k++; } } return [d / n, c / k]; };
  const [d0, c0] = avg(-1), [d1] = avg(1), [, c3] = avg(3);
  check('Potato Lager hits harder', d1 > d0 * 1.03, `${d0.toFixed(2)} -> ${d1.toFixed(2)}`); check('Scrumpy Cider pays more', c3 > c0 * 1.15, `${c0.toFixed(2)} -> ${c3.toFixed(2)}`); }
// bigger harvests
{ const E = mk({seeds: [5,0,0,0,0]}); E.S.xp.farming = 25333; E.S.plots = [{c: 0, at: 0}]; E.doAction('plot', {i: 0});
  check('harvest at Farming 50 = 7 to 10 potatoes', E.S.veg[0] >= 7 && E.S.veg[0] <= 10, `veg=${E.S.veg[0]}`); }
// a dad saved before the yard existed
{ const E = createEngine(null); const old = E.freshState('Old', {}); for (const k of ['logs', 'beers', 'tree', 'brewPick', 'buff']) delete old[k]; delete old.xp.woodcutting; delete old.xp.brewing;
  const m = E.migrate(old); E.setS(m); for (const a of ['sync', 'fight', 'fightEnd', 'drink', 'tree', 'brewPick']) E.doAction(a, {i: 0});
  check('old dad survives', m.logs.length === 10 && m.buff === null && Object.keys(E.scoreRow().lv).length === 12); }
console.log(ok ? 'ALL PASS' : 'SOME FAILED');
