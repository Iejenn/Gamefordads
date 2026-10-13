# GFD - Game for Dads

A tiny idle RPG for working dads. Fish, cook, fight geese, level up while you're at work.

**Play:** https://iejenn.github.io/Gamefordads/

On your phone: open the link, then "Install GFD as an app" on the Dad tab (Android/Chrome),
or Share > Add to Home Screen (iPhone/Safari).

## How it's built
- `engine.js`: ALL the game rules and balance (`CONFIG` at the top). The server runs it to decide what happens;
  the phone loads it only to show numbers.
- `index.html`: the screens. Every button sends an action ("fight", "eat", "start cooking") to the server.
- `supabase/functions/gfd/`: the Supabase Edge Function. `engine.js` there is generated from the root `engine.js`
  (wrapped so every request gets a fresh copy). Change the root file, regenerate, redeploy.
- `supabase/migrations/`: database history. Tables are locked; only the Edge Function writes dads and scores.

A dad's cloud code (Dad tab) is his only key. The server stores just a hash of it.
