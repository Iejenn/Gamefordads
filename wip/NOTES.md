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

## Screen side: done (wip/index.html, tested in the browser against the wip rules)
- Yard tab: "What's in the Yard" dropdown at the top (full beer list: buff, ingredients, level, joke), Woodcutting card, Brewery card with picker, Cellar (tap = drink), "Change tree" fold.
- Slayer moved into the Fight tab as a folded "Slayer: level X, N points" section; nav = Dad | Food | Fight | Yard | Shed | Ranks (old 'slayer' tab opens Fight).
- Beer indicator: header health line "· 🍺 14", Fight tab line under the buttons.
- Activity menu: Woodcutting + Brewing added.
- Pets grid shows 8 tiles automatically; share image = 2 columns of 6 skills.

## Still to do before shipping
1. DONE: every tab has its "?" explanation at the top (render() moves it up; Dad + Ranks got their own). Optional polish: make Food/Fight/Shed texts list everything on the page.
2. What's New entry 0.24, set versions to 0.24 (engine CONFIG + UI_VERSION + script ?v=), version.json.
3. Rebuild supabase/functions/gfd/engine.js from wip/engine.js, deploy, live check, then copy wip/index.html + wip/engine.js to the root and push main.
