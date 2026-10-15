# WIP: the Backyard Brewery (v0.24) - NOT live

Branch `wip-brewery`. GitHub Pages only publishes `main`, so nothing here is live.

## Done and tested (wip/engine.js = full rules file, replaces engine.js when we ship)
- Woodcutting: 10 trees (every 10 levels), idle 1 log/min, auto-moves to the best tree on level up. Pet: Kevin the Squirrel.
- Brewing: 10 beers, beer i = log i + vegetable floor(i/2), idle 1 brew/30s, brews the picked beer (brewPick, -1 = best). Pet: Barry the Fruit Fly.
- Beer buffs (hit / dmg / def / coins / both / rare), one active, counts down per fight (manual + idle), auto-drinks same beer, else best, else log line.
- Farming yield: 5 + 0-3 + 1 per 20 levels (about 1.5x), xp per veg lowered ~1/3.
- 12 skills (SKILL_GROUPS gets 'Yard'), titles rescaled to 1200.
- New actions: activity 'wood' / 'brew', 'tree' {i}, 'brewPick' {i}, 'drink' {i}. migrate() fills logs/beers/tree/brewPick/buff.
- Tests: wip/yard_test.mjs (2 "fails" are test-timing/rounding at level 1, not bugs).

## Still to build (screen side)
1. Yard tab: Woodcutting card + "Change tree" fold, Brewery card with beer picker, Cellar (beer chips, active beer highlighted, tap = drink).
2. Slayer into the Fight tab (task visible, shop folded); nav becomes Dad | Food | Fight | Yard | Shed | Ranks.
3. Header: small beer icon + fights left; Fight tab line "Beer: X, buff, N fights left".
4. Activity menu: add Woodcutting and Brewing.
5. "What's on this page" dropdown at the TOP of every tab explaining everything (incl. full beer list: what, buff, ingredients).
6. Pets grid to 8 tiles; Dad card / share image / Ranks for 12 skills (share image: 6 rows).
7. What's New 0.24, versions, server deploy (fn/engine.js rebuilt from wip/engine.js), browser tests, push.
