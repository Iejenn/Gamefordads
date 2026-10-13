// GENERATED from engine.js: do not edit by hand. Every request gets its own copy of the rules.
export function createEngine(initialState) {
let S = initialState, arenaMsg = undefined;
const toasts = [];
const toast = t => { toasts.push(String(t)); };
/* ============================================================
   GFD engine: ALL the game rules. The server (supabase/functions/gfd) runs this file to decide what
   happens; the phone loads the same file only to show numbers (hit chances, timers, levels).
   Balance lives in CONFIG below.
   ============================================================ */

const CONFIG = {
  version: '0.18',
  homeUrl: 'https://iejenn.github.io/Gamefordads/',   // where the game lives
  supabaseUrl: 'https://jhgzaroxhdzglfltinjp.supabase.co',   // cloud saves + highscores. Public on purpose: the
  supabaseKey: 'sb_publishable_I_SOgLUtvSqaGqfNAOgj6w_2ccpMRH2',  // database only lets the game call 3 locked functions
  regenMs: 60000,             // +1 health every minute
  // idle: fishing and cooking always run by themselves. Fight idle is optional.
  fishSeconds: 60,            // one fishing attempt every 60 seconds
  cookSeconds: 5,             // one cooking attempt every 5 seconds (always cooks your best raw fish, then back to fishing)
  fightIdleMinutes: 5,        // Fight idle: one fight every 5 minutes
  idleBaseMinutes: 100,       // after you close the game, idle keeps going this long (1h 40m)...
  idleStepMinutes: 50,        // ...plus 50 minutes per Idle time upgrade (16h 40m when maxed)
  idleCosts: [500,780,1200,1900,3000,4700,7300,11000,18000,28000,44000,68000,110000,170000,260000,410000,640000,1000000],
  xpDivisor: 4,               // RuneScape xp curve divided by this. Lower = slower leveling
  // catch / cook success: base chance at the unlock level, +perLvl for each level above it
  catchBase: 0.55, catchPerLvl: 0.05, catchMax: 0.95,
  cookBase: 0.60,  cookPerLvl: 0.05,  cookMax: 0.98,
  // req = level needed, xp per catch/cook, heal = health per cooked fish eaten, raw/cooked = sell price
  fish: [
    {name:'Shrimp',     req:1,  xp:10,  heal:1,  raw:1,  cooked:2},
    {name:'Sardine',    req:11, xp:15,  heal:2,  raw:2,  cooked:4},
    {name:'Herring',    req:21, xp:22,  heal:4,  raw:4,  cooked:8},
    {name:'Trout',      req:31, xp:30,  heal:6,  raw:6,  cooked:12},
    {name:'Salmon',     req:41, xp:40,  heal:8,  raw:10, cooked:20},
    {name:'Tuna',       req:51, xp:52,  heal:10, raw:15, cooked:30},
    {name:'Lobster',    req:61, xp:66,  heal:12, raw:22, cooked:45},
    {name:'Swordfish',  req:71, xp:82,  heal:14, raw:32, cooked:65},
    {name:'Shark',      req:81, xp:100, heal:16, raw:45, cooked:90},
    {name:'Anglerfish', req:91, xp:120, heal:18, raw:60, cooked:120},
  ],
  // 10 areas, 5 enemies each. Each fight picks one of the 5 at random.
  // area: potion = [name, health healed] dropped here,
  //       weapon = the rare drop any enemy here can drop: dmg = bonus damage when equipped, price = sell price
  // enemy: lvl (your hit chance compares Attack to this), hp, acc = its hit chance, maxHit before your Defence,
  //        coins = average drop, xp per kill, potion = chance to drop this area's potion, junk = [name, sell price]
  areas: [
    {place:"The Backyard", req:1, tint:'#DCEBD5', potion:["Juice Box", 5], weapon:{name:"Rolled-Up Newspaper", icon:"🗞️", dmg:0.1, price:180, desc:"The original dad weapon. Wasps have feared it for generations."}, enemies:[
      {name:"Picnic Wasp", icon:"🐝", lvl:1, hp:5, acc:0.49, maxHit:1, coins:5, xp:21, potion:0.1, junk:["Half a Sausage", 2], blurb:"Uninvited. Undefeated. Wants your sausage."},
      {name:"Neighbour's Cat", icon:"🐈", lvl:3, hp:7, acc:0.5, maxHit:1, coins:5, xp:23, potion:0.12, junk:["Hairball", 2], blurb:"Uses your lawn as a toilet. Feels no shame."},
      {name:"Angry Goose", icon:"🪿", lvl:5, hp:9, acc:0.5, maxHit:1, coins:6, xp:24, potion:0.14, junk:["Goose Feather", 2], blurb:"Honks first, asks questions never."},
      {name:"Compost Rat", icon:"🐀", lvl:7, hp:10, acc:0.5, maxHit:1, coins:7, xp:25, potion:0.16, junk:["Banana Peel", 3], blurb:"Has seen things in that bin."},
      {name:"Rogue Sprinkler", icon:"💦", lvl:9, hp:11, acc:0.51, maxHit:1, coins:7, xp:27, potion:0.18, junk:["Soggy Sock", 3], blurb:"Only turns on when you walk past."},
    ]},
    {place:"The Garage", req:11, tint:'#E2E5E7', potion:["Sports Drink", 13], weapon:{name:"Trusty Wrench", icon:"🔧", dmg:0.15, price:420, desc:"Fixes everything, mostly by hitting it."}, enemies:[
      {name:"Garage Spider", icon:"🕷️", lvl:11, hp:11, acc:0.51, maxHit:1, coins:8, xp:29, potion:0.1, junk:["Cobweb", 3], blurb:"Lives in the box you swore you'd sort out."},
      {name:"Tangled Extension Cord", icon:"🔌", lvl:13, hp:13, acc:0.51, maxHit:1, coins:9, xp:30, potion:0.12, junk:["Mystery Plug", 4], blurb:"Nobody tangled it. It tangled itself."},
      {name:"Rogue Lawnmower", icon:"🚜", lvl:15, hp:13, acc:0.52, maxHit:2, coins:10, xp:32, potion:0.14, junk:["Spark Plug", 4], blurb:"Started itself. Nobody knows how."},
      {name:"Paint Tin Mimic", icon:"🪣", lvl:17, hp:15, acc:0.52, maxHit:2, coins:12, xp:34, potion:0.16, junk:["Dried Brush", 5], blurb:"Labelled magnolia. It is not magnolia."},
      {name:"Leaf Blower", icon:"💨", lvl:19, hp:15, acc:0.52, maxHit:3, coins:13, xp:36, potion:0.18, junk:["Bag of Leaves", 5], blurb:"Just moves the problem to your neighbour's yard."},
    ]},
    {place:"The Supermarket", req:21, tint:'#F7EBC8', potion:["Protein Shake", 21], weapon:{name:"Baguette of Justice", icon:"🥖", dmg:0.2, price:840, desc:"Crusty on the outside, deadly on the inside."}, enemies:[
      {name:"Reduced Banana", icon:"🍌", lvl:21, hp:15, acc:0.52, maxHit:3, coins:14, xp:38, potion:0.1, junk:["Banana Sticker", 6], blurb:"Brown, bruised and bitter about it."},
      {name:"Free Sample Swarm", icon:"🧀", lvl:23, hp:16, acc:0.53, maxHit:3, coins:16, xp:40, potion:0.12, junk:["Toothpick", 6], blurb:"Just one more. Okay, one more."},
      {name:"Runaway Trolley", icon:"🛒", lvl:25, hp:16, acc:0.53, maxHit:4, coins:18, xp:43, potion:0.14, junk:["Trolley Coin", 7], blurb:"One wonky wheel, zero mercy."},
      {name:"Self-Checkout", icon:"🖥️", lvl:27, hp:18, acc:0.53, maxHit:4, coins:20, xp:45, potion:0.16, junk:["Long Receipt", 8], blurb:"Unexpected item in the bagging area."},
      {name:"Escaped Lobster", icon:"🦞", lvl:29, hp:18, acc:0.54, maxHit:4, coins:22, xp:48, potion:0.18, junk:["Rubber Band", 9], blurb:"Broke out of the tank. Wants revenge."},
    ]},
    {place:"The Furniture Store", req:31, tint:'#D7E4F2', potion:["Meatball Plate", 29], weapon:{name:"The Hex Blade", icon:"🔩", dmg:0.25, price:1500, desc:"A legendary Allen key, sharpened by pure frustration."}, enemies:[
      {name:"Pencil Thief", icon:"✏️", lvl:31, hp:18, acc:0.54, maxHit:5, coins:25, xp:51, potion:0.1, junk:["Tiny Pencil", 10], blurb:"Steals every tiny pencil it can find."},
      {name:"Store Maze", icon:"🌀", lvl:33, hp:20, acc:0.54, maxHit:5, coins:27, xp:54, potion:0.12, junk:["Store Map", 11], blurb:"The exit is always one more room away."},
      {name:"Flatpack Golem", icon:"📦", lvl:35, hp:20, acc:0.55, maxHit:6, coins:31, xp:57, potion:0.14, junk:["Spare Allen Key", 12], blurb:"214 parts. One screw missing. Furious."},
      {name:"Haunted Sofa", icon:"🛋️", lvl:37, hp:22, acc:0.55, maxHit:6, coins:34, xp:60, potion:0.16, junk:["Lost Remote", 14], blurb:"Too comfy. You may never leave."},
      {name:"Meatball Blob", icon:"🍝", lvl:39, hp:22, acc:0.55, maxHit:7, coins:38, xp:64, potion:0.18, junk:["Lingonberry Jam", 15], blurb:"You came for one plate."},
    ]},
    {place:"The School Gate", req:41, tint:'#F2DDD3', potion:["Lunchbox Sandwich", 37], weapon:{name:"Lunchbox Flail", icon:"🍱", dmg:0.3, price:2550, desc:"Swung by the strap. Still contains Tuesday's banana."}, enemies:[
      {name:"Glitter Craft", icon:"🌟", lvl:41, hp:22, acc:0.55, maxHit:7, coins:42, xp:68, potion:0.1, junk:["Loose Glitter", 17], blurb:"You'll be finding glitter for years."},
      {name:"Parking Ticket", icon:"🎫", lvl:43, hp:24, acc:0.56, maxHit:7, coins:47, xp:72, potion:0.12, junk:["Fine Print", 19], blurb:"Already stuck to your windscreen."},
      {name:"Lost Property Mimic", icon:"🎒", lvl:45, hp:24, acc:0.56, maxHit:8, coins:53, xp:76, potion:0.14, junk:["Odd Sock", 21], blurb:"Smells like forty forgotten gym kits."},
      {name:"Head Lice Swarm", icon:"🐜", lvl:47, hp:25, acc:0.56, maxHit:8, coins:59, xp:80, potion:0.16, junk:["Nit Comb", 24], blurb:"Itchy just reading this."},
      {name:"School Run Jam", icon:"🚗", lvl:49, hp:25, acc:0.57, maxHit:9, coins:66, xp:85, potion:0.18, junk:["Cold Coffee Cup", 26], blurb:"Bumper to bumper, every single morning."},
    ]},
    {place:"The Office", req:51, tint:'#E4E0EE', potion:["Office Donut", 45], weapon:{name:"Keyboard Warhammer", icon:"⌨️", dmg:0.35, price:4200, desc:"Every key is the Caps Lock key."}, enemies:[
      {name:"Printer Jam", icon:"🖨️", lvl:51, hp:25, acc:0.57, maxHit:9, coins:73, xp:90, potion:0.1, junk:["Crumpled Page", 29], blurb:"Out of paper. Also full of paper."},
      {name:"Reply-All Storm", icon:"📧", lvl:53, hp:27, acc:0.57, maxHit:10, coins:82, xp:96, potion:0.12, junk:["Out-of-Office Reply", 33], blurb:"Please remove me from this list."},
      {name:"Meeting Goblin", icon:"👺", lvl:55, hp:27, acc:0.57, maxHit:10, coins:91, xp:101, potion:0.14, junk:["Unread Agenda", 36], blurb:"This one could have been an email."},
      {name:"Coffee Machine Golem", icon:"☕", lvl:57, hp:29, acc:0.58, maxHit:11, coins:101, xp:107, potion:0.16, junk:["Used Coffee Pod", 40], blurb:"Descale me or perish."},
      {name:"Endless Spreadsheet", icon:"📊", lvl:59, hp:29, acc:0.58, maxHit:11, coins:113, xp:114, potion:0.18, junk:["Broken Formula", 45], blurb:"Row 48,213 of infinity."},
    ]},
    {place:"Soft Play", req:61, tint:'#F6D6E4', potion:["Slushie", 53], weapon:{name:"Squeaky Hammer", icon:"🔨", dmg:0.4, price:6600, desc:"Inflatable. Squeaks on every hit. Every single one."}, enemies:[
      {name:"Lost Shoe", icon:"👟", lvl:61, hp:29, acc:0.58, maxHit:12, coins:126, xp:120, potion:0.1, junk:["Other Lost Shoe", 50], blurb:"Last seen near the ball pit."},
      {name:"Sticky Table", icon:"🍯", lvl:63, hp:31, acc:0.59, maxHit:12, coins:140, xp:127, potion:0.12, junk:["Mystery Crumbs", 56], blurb:"Nobody knows what's on it. Nobody asks."},
      {name:"Ball Pit Kraken", icon:"🐙", lvl:65, hp:31, acc:0.59, maxHit:13, coins:157, xp:135, potion:0.14, junk:["Suspiciously Sticky Ball", 63], blurb:"Lurks under ten thousand plastic balls."},
      {name:"Static Slide", icon:"⚡", lvl:67, hp:33, acc:0.59, maxHit:13, coins:175, xp:143, potion:0.16, junk:["Static Shock", 70], blurb:"Every hair on your head stands up."},
      {name:"Sugar Rush Tornado", icon:"🍭", lvl:69, hp:33, acc:0.6, maxHit:14, coins:195, xp:151, potion:0.18, junk:["Lollipop Stick", 78], blurb:"Had three slushies. Will not stop spinning."},
    ]},
    {place:"The Birthday Party", req:71, tint:'#FBE0C4', potion:["Sausage Roll", 61], weapon:{name:"Cake Knife", icon:"🔪", dmg:0.45, price:10200, desc:"Cuts cake and arguments short."}, enemies:[
      {name:"Trick Candle", icon:"🕯️", lvl:71, hp:33, acc:0.6, maxHit:14, coins:217, xp:160, potion:0.1, junk:["Melted Wax", 87], blurb:"You blew it out. It came back."},
      {name:"Party Popper Swarm", icon:"🎉", lvl:73, hp:35, acc:0.6, maxHit:15, coins:242, xp:170, potion:0.12, junk:["Confetti", 97], blurb:"Bang. Bang. Confetti in your tea."},
      {name:"Bouncy Castle Beast", icon:"🏰", lvl:75, hp:35, acc:0.6, maxHit:16, coins:270, xp:180, potion:0.14, junk:["Party Bag", 108], blurb:"Fully inflated. Fully furious."},
      {name:"Balloon Hound", icon:"🎈", lvl:77, hp:36, acc:0.61, maxHit:16, coins:301, xp:191, potion:0.16, junk:["Popped Balloon", 120], blurb:"Squeaks menacingly."},
      {name:"Pass-the-Parcel Mimic", icon:"🎁", lvl:79, hp:36, acc:0.61, maxHit:17, coins:335, xp:202, potion:0.18, junk:["Wrapping Paper", 134], blurb:"Forty layers of paper and a rubber."},
    ]},
    {place:"The Theme Park", req:81, tint:'#D5EEEA', potion:["Churro", 69], weapon:{name:"Selfie Stick Spear", icon:"🤳", dmg:0.5, price:15600, desc:"Extends to full length. Ruins every photo."}, enemies:[
      {name:"Photo Booth", icon:"📸", lvl:81, hp:36, acc:0.61, maxHit:18, coins:374, xp:214, potion:0.1, junk:["Blurry Photo", 150], blurb:"25 coins for a picture of your worst face."},
      {name:"Spinning Teacup", icon:"🫖", lvl:83, hp:38, acc:0.62, maxHit:18, coins:417, xp:227, potion:0.12, junk:["Paper Map", 167], blurb:"Round and round until lunch comes back."},
      {name:"Queue Hydra", icon:"🐍", lvl:85, hp:38, acc:0.62, maxHit:19, coins:464, xp:240, potion:0.14, junk:["Expired Fast Pass", 186], blurb:"Cut one line and two more appear."},
      {name:"Giant Mascot", icon:"🧸", lvl:87, hp:40, acc:0.62, maxHit:20, coins:518, xp:254, potion:0.16, junk:["Foam Glove", 207], blurb:"Can't see where it's going. Doesn't care."},
      {name:"Rollercoaster Lunch", icon:"🤢", lvl:89, hp:40, acc:0.63, maxHit:20, coins:577, xp:269, potion:0.18, junk:["Sick Bag", 231], blurb:"It's coming back up."},
    ]},
    {place:"The Dark Hallway", req:91, tint:'#D8D9E3', potion:["Midnight Snack", 77], weapon:{name:"The Slipper", icon:"🩴", dmg:0.6, price:24000, desc:"Every dad's final form. Even dragons fear it."}, enemies:[
      {name:"Creaky Floorboard", icon:"🪵", lvl:91, hp:40, acc:0.63, maxHit:21, coins:644, xp:285, potion:0.1, junk:["Squeaky Nail", 258], blurb:"Wakes the whole house, every time."},
      {name:"Lurking Toy Car", icon:"🚙", lvl:93, hp:42, acc:0.63, maxHit:22, coins:718, xp:302, potion:0.12, junk:["Tiny Wheel", 287], blurb:"Parked exactly where you'll step."},
      {name:"Brick Dragon", icon:"🐉", lvl:95, hp:42, acc:0.64, maxHit:23, coins:800, xp:320, potion:0.14, junk:["Loose Brick", 320], blurb:"Waits on the floor for bare feet at 3am."},
      {name:"Doorframe", icon:"🚪", lvl:97, hp:44, acc:0.64, maxHit:24, coins:892, xp:339, potion:0.16, junk:["Door Wedge", 357], blurb:"It moved. You're sure it moved."},
      {name:"Monster Under the Bed", icon:"👹", lvl:99, hp:44, acc:0.64, maxHit:25, coins:994, xp:359, potion:0.18, junk:["Dust Bunny", 398], blurb:"Grabs ankles. Mostly yours."},
    ]},
  ],
  junkChance: 0.25,           // every enemy drops its junk item this often
  rareChance: 1 / 250,        // any enemy in an area can drop that area's weapon
  // trading: sells your monster junk by itself, most valuable first
  tradeSeconds: 60,           // one sale every 60 seconds
  tradeBase: 0.75, tradePerLvl: 0.01,   // you get 75% of an item's value, +1% per Trading level (175% at 100)
  tradeXpBase: 4, tradeXpPerCoin: 0.5,  // Trading xp per sale = 4 + half the item's value
  // combat formulas, all percentages. Skills cap at 100.
  hitBase: 0.60, hitPerLvl: 0.02, hitMin: 0.10, hitMax: 0.95,  // Attack: hit chance = 60% + 2% per level above the enemy's level
  dmgBase: 4, dmgPerLvl: 0.05,                                  // Strength: max hit = 4 x (1 + 5% per level). Strength 100 = +500%
  defPerLvl: 0.005,                                             // Defence: 0.5% less damage per level. Defence 100 = 50% less
  hpXpRatio: 1/3,             // Hitpoints xp per kill = a third of the xp your combat style gets
  hpBase: 10, hpPerLvl: 2,    // max health = 10 + 2 x Hitpoints level
  restBelow: 0.35,            // Fight idle skips a turn to rest when health is below this share (and there's no food to auto-eat)
  autoEatBelow: 0.5,          // auto-eat: below this share of max health your dad eats his best fish instead of attacking
  // pets: super rare, one per non-combat skill, purely for bragging. odds = 1 in this many actions at level 0,
  // and every level makes it 1% likelier (about twice as likely at 99). Tuned so each takes ~2-3 months of normal play.
  pets: {
    fishing:  {name: 'Gulliver the Seagull', icon: '🐦', odds: 20000, per: 'cast',        hint: 'Something lurks near the fishing spots...',   desc: 'Stole your sandwich. Stayed for the company.'},
    cooking:  {name: 'Toasty',               icon: '🍞', odds: 15000, per: 'cooking try', hint: 'Something smells faintly of burnt bread...',   desc: 'A slice of toast with a face. Burnt on one side, just like your cooking.'},
    trading:  {name: 'Rocky the Raccoon',    icon: '🦝', odds: 2000,  per: 'sale',        hint: 'Someone keeps rummaging through your junk...', desc: 'Handles your sales. Definitely not skimming. Probably.'},
    slayer:   {name: 'Honkers',              icon: '🪿', odds: 200,   per: 'Slayer task', hint: 'A familiar honk echoes after every task...',  desc: 'An Angry Goose who switched sides. Still angry.'},
  },
  petPerLvl: 0.01,
  // slayer
  slayerEncounter: 0.40,      // in your task's area, the task enemy shows up this often
  slayerTaskMin: 10, slayerTaskMax: 20,
  slayerXpPerKill: 1.5,       // task done: Slayer xp = kills x enemy xp x this
  slayerDmgPerLvl: 0.005,     // +0.5% damage per Slayer level against your task enemy
  extendMult: 1.5,            // extended tasks: 50% more kills, 50% more xp, 2 points instead of 1
  slayerCancelCost: 1, slayerExtendCost: 10, slayerPotionCost: 1, slayerPotionPack: 3,
};


/* ---------- helpers ---------- */
const FISH = CONFIG.fish, AREAS = CONFIG.areas;
// flat list of all 50 enemies; enemy id g = area * 5 + slot
const ENEMIES = AREAS.flatMap((a, ri) => a.enemies.map((e, k) => Object.assign({id: ri * 5 + k, area: ri}, e)));
const SKILLS = {fishing:'Fishing', cooking:'Cooking', attack:'Attack', strength:'Strength', defence:'Defence', hitpoints:'Hitpoints', slayer:'Slayer', trading:'Trading'};
const STYLES = [['attack', 'Accurate'], ['strength', 'Aggressive'], ['defence', 'Defensive']];
const now = () => Date.now() + (typeof clockSkew === 'number' ? clockSkew : 0);   // on the phone: follow the server's clock
const fmt = n => Math.floor(n).toLocaleString('en-US');
const pct = x => Math.round(x * 100) + '%';
const pct1 = x => (Math.round(x * 1000) / 10) + '%';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plural = (name, n) => n === 1 || /s$/.test(name) ? name : name + 's';
const dur = ms => { const m = Math.round(ms / 60000); return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} min`; };
const clock = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const rate = p => p >= 1 ? 'Always' : p >= 0.1 ? pct(p) : `1 in ${Math.round(1 / p)}`;

// xp needed for each level: RuneScape formula / xpDivisor. XP_FOR[1] = 0 ... XP_FOR[100]
const XP_FOR = (() => { const t = [0, 0]; let pts = 0;
  for (let l = 1; l < 100; l++) { pts += Math.floor(l + 300 * Math.pow(2, l / 7)); t[l + 1] = Math.floor(Math.floor(pts / 4) / CONFIG.xpDivisor); }
  return t; })();
const levelOf = xp => { let l = 1; while (l < 100 && xp >= XP_FOR[l + 1]) l++; return l; };


const LOOKS = {
  skin: ['#F7D7BC','#EBBE96','#CF9468','#9C6644','#6B442C'],
  hairColor: ['#2A1D17','#6B4527','#C8963E','#A8452A','#8E8E8E','#DADADA','#2E78E0'],   // last one: blue, for the punk dads
  shirt: ['#2C6E7F','#D9483A','#3E9B4F','#E0A21E','#6C4FA3','#33393B'],
  bg: ['#BFE0E6','#F6D6A8','#CFE8C4','#F2C2BA','#D8CFEE','#DCE1E3'],
  hair: ['short','messy','mohawk','thinning','cap','bald'],
  beard: ['none','stubble','full','mustache','handlebar','walrus'],
};
const LOOK_NAMES = {
  hair: {short:'Short', messy:'Messy', mohawk:'Mohawk', thinning:'Thinning', cap:'Cap', bald:'Bald'},
  beard: {none:'None', stubble:'Stubble', full:'Full beard', mustache:'Moustache', handlebar:'Handlebar', walrus:'Walrus'},
};
const DEFAULT_LOOK = {skin:1, hair:'short', hairColor:1, beard:'stubble', glasses:false, shirt:0, bg:0};


/* ---------- state ---------- */
function freshState(name, look) {
  const t = now();
  return {
    v: 2, name: name || 'Dad', look: Object.assign({}, DEFAULT_LOOK, look || {}),
    coins: 0, capLevel: 0,
    hp: CONFIG.hpBase + CONFIG.hpPerLvl, hpAt: t,
    xp: {fishing: 0, cooking: 0, attack: 0, strength: 0, defence: 0, hitpoints: 0, slayer: 0, trading: 0}, style: 'attack',
    raw: Array(10).fill(0), cooked: Array(10).fill(0), pots: Array(10).fill(0),
    spot: 0, area: 0, tab: 'fish', lastFoe: null,
    activity: 'fish', actAt: t, paused: false,   // your dad does ONE idle thing at a time: fish, cook, trade or fight
    weapons: Array(10).fill(0), equipped: -1,
    task: null, slayerPts: 0, extendOwned: false, extendOn: false, autoEat: false,
    pets: {}, petOut: null,   // pets you've found (skill -> times found) and the one following you
    started: t, lastSeen: t, activeAt: t,
    stats: {caught: 0, cooked: 0, burnt: 0, eaten: 0, kills: 0, knockouts: 0, tasks: 0, sold: 0, tradeCoins: 0},
    loot: {}, kc: Array(50).fill(0),
    log: [{text: 'Welcome, dad. Your fishing rod is already in the water.', kind: ''}],
  };
}
const intArr = (a, n) => { const o = Array(n).fill(0); (Array.isArray(a) ? a : []).forEach((v, i) => { if (i < n) o[i] = Math.max(0, Math.floor(+v || 0)); }); return o; };
// fills in anything missing so older saves keep working after updates
function migrate(s) {
  if (!s || typeof s !== 'object' || !s.xp) return null;
  const t = now(), f = freshState(), old = !s.v || s.v < 2;
  const m = Object.assign(f, s);
  m.look = Object.assign({}, DEFAULT_LOOK, s.look || {});
  m.xp = Object.assign(freshState().xp, s.xp);
  m.stats = Object.assign(freshState().stats, s.stats || {});
  m.raw = intArr(s.raw, 10); m.cooked = intArr(s.cooked, 10);
  if (!Array.isArray(m.log)) m.log = [];
  m.capLevel = clamp(Math.floor(+m.capLevel || 0), 0, CONFIG.idleCosts.length);
  if (!['attack', 'strength', 'defence'].includes(m.style)) m.style = 'attack';
  if (m.tab === 'shop') m.tab = 'trade';
  if (s.xp.strength == null) { m.xp.strength = m.xp.attack; m.xp.defence = m.xp.attack; }   // v0.7 combat update
  if (old) {
    // v0.8: one enemy per area became five. Old enemies sit in the middle slot of their area.
    m.kc = Array(50).fill(0); intArr(s.kc, 10).forEach((v, ri) => { m.kc[ri * 5 + 2] = v; });
    m.loot = {}; for (const k in (s.loot || {})) { const n = Math.floor(+s.loot[k] || 0), ri = parseInt(k); if (!(n > 0) || !(ri >= 0 && ri < 10)) continue;
      const nk = k.endsWith('r') ? 'r' + ri : 'e' + (ri * 5 + 2); m.loot[nk] = (m.loot[nk] || 0) + n; }
    m.area = clamp(+s.region || 0, 0, 9);
    m.pots = Array(10).fill(0);
    m.fightIdle = !!(s.idle && s.idle.act === 'fight'); m.paused = false;
    delete m.energy; delete m.energyAt; delete m.idle; delete m.region; delete m.potions;
    m.v = 2;
    m.log.unshift({text: 'Big update! Energy is gone: fishing and cooking now run by themselves, and cooked fish heal you. Areas have 5 enemies each, and Slayer is here.', kind: 'lvl'});
  }
  m.kc = intArr(m.kc, 50); m.pots = intArr(m.pots, 10);
  const loot = {}; for (const k in (m.loot || {})) if (/^(e\d+|r\d)$/.test(k)) loot[k] = Math.max(0, Math.floor(+m.loot[k] || 0)); m.loot = loot;
  if (m.task && !(m.task.e >= 0 && m.task.e < 50 && m.task.n > 0)) m.task = null;
  m.slayerPts = Math.max(0, Math.floor(+m.slayerPts || 0));
  m.autoEat = !!m.autoEat;
  const pets = {}; for (const k in CONFIG.pets) { const n = Math.floor(+((m.pets || {})[k]) || 0); if (n > 0) pets[k] = n; } m.pets = pets;
  if (!pets[m.petOut]) m.petOut = null;
  // v0.10: rare items became weapons. Any old rare in your bag is now that area's weapon.
  m.weapons = intArr(m.weapons, 10); let found = 0;
  for (const k of Object.keys(m.loot)) if (k[0] === 'r') { m.weapons[+k.slice(1)] += m.loot[k]; found += m.loot[k]; delete m.loot[k]; }
  if (!(m.equipped >= 0 && m.equipped < 10 && m.weapons[m.equipped] > 0)) m.equipped = -1;
  if (found) { const best = m.weapons.reduce((b, n, i) => n ? i : b, -1); if (m.equipped < 0) m.equipped = best;
    m.log.unshift({text: `Rare drops are weapons now! Your old rare finds turned into ${found} weapon${found > 1 ? 's' : ''}. Check the Dad tab.`, kind: 'lvl'}); }
  // v0.12: one idle activity at a time instead of everything at once
  if (!['fish', 'cook', 'trade', 'fight'].includes(s.activity)) { m.activity = m.fightIdle ? 'fight' : 'fish'; m.actAt = now(); }
  if (!Number.isFinite(m.actAt)) m.actAt = now();
  delete m.fishAt; delete m.cookAt; delete m.tradeAt; delete m.fightAt; delete m.fightIdle;
  return m;
}
const ago = t => { const d = Math.floor((now() - t) / 86400000); return d < 1 ? 'today' : d === 1 ? 'yesterday' : `${d} days ago`; };

const lvl = k => levelOf(S.xp[k]);
const maxHP = () => CONFIG.hpBase + CONFIG.hpPerLvl * lvl('hitpoints');
const totalLevel = () => Object.keys(SKILLS).reduce((a, k) => a + lvl(k), 0);
const combatLevel = () => Math.floor((lvl('attack') + lvl('strength') + lvl('defence') + lvl('hitpoints')) / 4);
const idleWindowMs = () => (CONFIG.idleBaseMinutes + CONFIG.idleStepMinutes * S.capLevel) * 60000;
const unlockedAreas = () => AREAS.filter(a => a.req <= combatLevel()).length;
function dadTitle() { return titleFor(totalLevel()); }
function titleFor(t) {
  return t >= 800 ? 'Ultimate Dad' : t >= 680 ? 'Legendary Dad' : t >= 520 ? 'Veteran Dad' : t >= 360 ? 'Seasoned Dad' : t >= 200 ? 'Grill Master' : t >= 80 ? 'Weekend Warrior' : 'Rookie Dad'; }
const weapon = () => S.equipped >= 0 ? AREAS[S.equipped].weapon : null;
const weaponBonus = () => weapon() ? weapon().dmg : 0;
const tradeMult = () => CONFIG.tradeBase + CONFIG.tradePerLvl * lvl('trading');
// trading sells your most valuable junk first
const tradePick = () => { let best = null; for (const k in S.loot) if (S.loot[k] > 0 && (!best || lootInfo(k).price > lootInfo(best).price)) best = k; return best; };
const catchChance = i => Math.min(CONFIG.catchMax, CONFIG.catchBase + CONFIG.catchPerLvl * (lvl('fishing') - FISH[i].req));
const cookChance = i => Math.min(CONFIG.cookMax, CONFIG.cookBase + CONFIG.cookPerLvl * (lvl('cooking') - FISH[i].req));
const bestSpot = L => FISH.filter(f => f.req <= L).length - 1;
// cooking always picks the best raw fish you're allowed to cook
const cookPick = () => { for (let i = 9; i >= 0; i--) if (S.raw[i] > 0 && lvl('cooking') >= FISH[i].req) return i; return -1; };

function addLog(text, kind = '') { S.log.unshift({text, kind}); S.log.length = Math.min(S.log.length, 30); }

// health: +1 per minute, also while the game is closed
function regenTo(T) {
  const max = maxHP();
  if (S.hp >= max) { S.hpAt = T; return 0; }
  const n = Math.floor((T - S.hpAt) / CONFIG.regenMs); if (n <= 0) return 0;
  const add = Math.min(n, max - S.hp); S.hp += add; S.hpAt += n * CONFIG.regenMs;
  if (S.hp >= max) S.hpAt = T; return add;
}


/* ---------- pets ---------- */
const petOdds = k => Math.max(1, Math.round(CONFIG.pets[k].odds / (1 + CONFIG.petPerLvl * lvl(k))));   // "1 in N" right now
function rollPet(k) {
  if (Math.random() >= 1 / petOdds(k)) return;
  const P = CONFIG.pets[k];
  if (S.pets[k]) { S.pets[k]++; addLog(`You have a funny feeling you would have been followed... (${P.name} again)`, 'lvl'); return; }
  S.pets[k] = 1; if (!S.petOut) S.petOut = k;
  toast(`${P.icon} New pet: ${P.name}!`);
  addLog(`${P.icon} ${P.name} has started following you! ${P.desc}`, 'lvl');
}

/* ---------- idle: fishing, cooking and (optional) fighting, processed in time order ---------- */
function fishTry(r) {
  const i = S.spot, f = FISH[i]; r.fishTries++; rollPet('fishing');
  if (Math.random() < catchChance(i)) { S.raw[i]++; S.xp.fishing += f.xp; S.stats.caught++; r.caught[f.name] = (r.caught[f.name] || 0) + 1; r.fishXp += f.xp; }
}
function cookTry(r) {
  const i = cookPick(); if (i < 0) return;      // nothing to cook: the pan waits
  const f = FISH[i]; S.raw[i]--; r.cookTries++; rollPet('cooking');
  if (Math.random() < cookChance(i)) { S.cooked[i]++; S.xp.cooking += f.xp; S.stats.cooked++; r.cooked[f.name] = (r.cooked[f.name] || 0) + 1; r.cookXp += f.xp; }
  else { S.stats.burnt++; r.burnt++; }
}
function tradeTry(r) {
  const k = tradePick(); if (!k) return;        // nothing to sell: the stall waits
  const it = lootInfo(k), coins = Math.max(1, Math.round(it.price * tradeMult())), xp = Math.round(CONFIG.tradeXpBase + it.price * CONFIG.tradeXpPerCoin);
  S.loot[k]--; S.coins += coins; S.xp.trading += xp; S.stats.sold++; S.stats.tradeCoins += coins;
  rollPet('trading');
  r.tradeTries++; r.sold[it.name] = (r.sold[it.name] || 0) + 1; r.tradeCoins += coins; r.tradeXp += xp;
}
const ACT = {fish: 'fishing', cook: 'cooking', trade: 'trading', fight: 'fighting'};
const actMs = a => a === 'fish' ? CONFIG.fishSeconds * 1000 : a === 'cook' ? CONFIG.cookSeconds * 1000 : a === 'trade' ? CONFIG.tradeSeconds * 1000 : CONFIG.fightIdleMinutes * 60000;
const canDo = a => a === 'cook' ? cookPick() >= 0 : a === 'trade' ? !!tradePick() : true;
function runIdle(t) {
  const end = Math.min(t, (S.activeAt || t) + idleWindowMs());
  const before = snapLevels(), fr = newFightTally();
  const r = {fishTries: 0, caught: {}, fishXp: 0, cookTries: 0, cooked: {}, cookXp: 0, burnt: 0, tradeTries: 0, sold: {}, tradeCoins: 0, tradeXp: 0, events: 0};
  for (let guard = 0; guard < 50000; guard++) {
    const T = S.actAt + actMs(S.activity); if (T > end) break;
    S.actAt = T; r.events++;
    // ran out of raw fish or things to sell: your dad goes back to fishing instead of standing around
    if (!canDo(S.activity)) { addLog(S.activity === 'cook' ? 'Out of raw fish to cook, so your dad went back to fishing.' : 'Nothing left to sell, so your dad went back to fishing.', 'warn'); S.activity = 'fish'; continue; }
    if (S.activity === 'fish') fishTry(r);
    else if (S.activity === 'cook') cookTry(r);
    else if (S.activity === 'trade') tradeTry(r);
    else { regenTo(T); idleFight(fr); }
  }
  if (t > end) {   // past the idle window: pause, and pick up again when the game is opened
    S.actAt = t;
    if (!S.paused) { S.paused = true; addLog(`Idle paused after ${dur(idleWindowMs())} away. Everything picks up again when you open the game.`, 'warn'); }
  } else S.paused = false;
  // one quiet catch every 30 seconds isn't news, a pile of them after being away is
  if (r.fishTries > 2) addLog(`Fishing: ${r.fishTries} casts, caught ${itemsText(r.caught) || 'nothing'}. +${fmt(r.fishXp)} xp`);
  if (r.tradeTries > 2) addLog(`Trading: sold ${itemsText(r.sold)} for ${fmt(r.tradeCoins)} coins. +${fmt(r.tradeXp)} xp`);
  if (r.cookTries > 2) addLog(`Cooking: cooked ${itemsText(r.cooked) || 'nothing'}${r.burnt ? `, burnt ${r.burnt}` : ''}. +${fmt(r.cookXp)} xp`);
  if (fr.n) addLog(fightTallyText(fr, 'Fight idle'), fr.ko ? 'warn' : '');
  else if (fr.rest) addLog(`Fight idle: rested ${fr.rest} time${fr.rest > 1 ? 's' : ''} on low health${S.autoEat ? ', no fish left to auto-eat' : '. Turn on auto-eat to eat instead'}.`, 'warn');
  fr.rares.forEach(rareAlert); fr.tasksDone.forEach(taskDoneAlert);
  checkLevelUps(before);
  return r.events;
}
function tick() {
  const t = now(); const events = runIdle(t);
  const gH = regenTo(t);
  return {gH, events};
}

/* ---------- combat ---------- */
// Attack -> hit chance, Strength -> max hit, Defence -> % less damage taken, Slayer -> bonus damage on task enemy
const pHit = (A, L) => clamp(CONFIG.hitBase + CONFIG.hitPerLvl * (A - L), CONFIG.hitMin, CONFIG.hitMax);
const pMaxHit = St => Math.round(CONFIG.dmgBase * (1 + CONFIG.dmgPerLvl * St));
const defRed = D => Math.min(0.9, CONFIG.defPerLvl * D);
const slayerBonus = () => CONFIG.slayerDmgPerLvl * lvl('slayer');
const onTask = g => !!(S.task && S.task.e === g);
// random encounter: on a Slayer task, your task enemy shows up more often in its own area
function pickEnemy(ri) {
  if (S.task && ENEMIES[S.task.e].area === ri && Math.random() < CONFIG.slayerEncounter) return S.task.e;
  return ri * 5 + Math.floor(Math.random() * 5);
}
const addLoot = k => { S.loot[k] = (S.loot[k] || 0) + 1; };
const lootInfo = k => ({name: ENEMIES[+k.slice(1)].junk[0], price: ENEMIES[+k.slice(1)].junk[1]});
const itemsText = map => Object.entries(map).map(([n, c]) => c > 1 ? `${c} ${n}` : n).join(', ');
// a weapon drop: auto-equip it if it beats what you're holding
function rareAlert(ri) {
  const w = AREAS[ri].weapon; toast(`Rare drop: ${w.icon} ${w.name}!`);
  let t = `Rare drop! You found the ${w.name} (+${pct(w.dmg)} damage).`;
  if (w.dmg > weaponBonus()) { S.equipped = ri; t += ' Equipped it.'; }
  addLog(t, 'lvl');
}

// decides a whole fight against enemy g without changing anything yet.
// ev = every step as ['p', damage] (you hit), ['e', damage] (it hits), ['h', health, fish] (you ate)
function simFight(g) {
  const E = ENEMIES[g], A = lvl('attack'), St = lvl('strength'), red = defRed(lvl('defence')), mh = maxHP();
  const mult = (1 + weaponBonus()) * (1 + (onTask(g) ? slayerBonus() : 0));   // weapon and Slayer bonuses stack
  const food = S.autoEat ? S.cooked.slice() : null, heals = FISH.map(f => f.heal);
  let ehp = E.hp, hp = S.hp, taken = 0, healed = 0; const ev = [], eaten = {};
  for (let round = 0; round < 200; round++) {
    // auto-eat: below the line with food in the bag, your dad eats instead of attacking this round
    let ate = false;
    if (food && hp < mh * CONFIG.autoEatBelow) {
      const i = smartPick(food, heals, hp);
      if (i >= 0) { const h = Math.min(heals[i], mh - hp); hp += h; healed += h; food[i]--; eaten[i] = (eaten[i] || 0) + 1; ev.push(['h', h, i]); ate = true; }
    }
    if (!ate) {
      const d = Math.random() < pHit(A, E.lvl) ? Math.round((1 + Math.floor(Math.random() * pMaxHit(St))) * mult) : 0;
      ehp -= d; ev.push(['p', d]);
      if (ehp <= 0) break;
    }
    const e = Math.random() < E.acc ? Math.round((1 + Math.floor(Math.random() * E.maxHit)) * (1 - red)) : 0;  // 0 = missed or fully blocked
    if (e) { hp = Math.max(0, hp - e); taken += e; }
    ev.push(['e', e]);
    if (hp <= 0) break;
  }
  return {g, ev, taken, healed, eaten, hpStart: S.hp, hpEnd: hp, ko: hp <= 0, win: ehp <= 0 && hp > 0};
}
const fightOnce = g => applyFight(simFight(g));
// applies a decided fight: damage, then (on a win) coins, xp, drops and Slayer progress
function applyFight(sim) {
  const g = sim.g, E = ENEMIES[g], taken = sim.taken;
  const ate = useFood(sim.eaten);                     // food eaten during the fight leaves the bag
  // health = how the fight ended, plus whatever regenerated while it played (exactly what the replay showed)
  S.hp = sim.ko ? 0 : clamp((sim.hpEnd ?? S.hp - taken) + (S.hp - (sim.hpStart ?? S.hp)), 0, maxHP());
  if (!sim.win) { if (sim.ko) S.stats.knockouts++; return {g, win: false, taken, items: [], ate}; }
  const coins = Math.max(1, Math.round(E.coins * (0.6 + Math.random() * 0.8)));
  const hx = Math.round(E.xp * CONFIG.hpXpRatio);
  S.coins += coins; S.xp[S.style] += E.xp; S.xp.hitpoints += hx;   // xp goes to the chosen combat style
  const items = []; let rare = null, potion = false;
  if (Math.random() < E.potion) { S.pots[E.area]++; potion = true; items.push(AREAS[E.area].potion[0]); }
  if (Math.random() < CONFIG.junkChance) { addLoot('e' + g); items.push(E.junk[0]); }
  if (Math.random() < CONFIG.rareChance) { S.weapons[E.area]++; items.push(AREAS[E.area].weapon.name); rare = E.area; }
  S.stats.kills++; S.kc[g]++;
  let taskDone = null;
  if (onTask(g)) { S.task.done++; if (S.task.done >= S.task.n) taskDone = completeTask(); }
  return {g, win: true, taken, coins, xp: E.xp, hx, items, rare, potion, taskDone, ate};
}
// takes eaten fish out of the bag (never more than you still have) and returns {fish name: count}
function useFood(eaten) {
  const out = {}; let n = 0;
  for (const i in (eaten || {})) { const k = Math.min(eaten[i], S.cooked[i] || 0); if (k > 0) { S.cooked[i] -= k; n += k; out[FISH[i].name] = k; } }
  S.stats.eaten += n; return out;
}
const newFightTally = () => ({n: 0, w: 0, coins: 0, xp: 0, hx: 0, taken: 0, ko: 0, rest: 0, items: {}, foes: {}, rares: [], tasksDone: [], ate: {}});
function tally(fr, r) {
  fr.n++; fr.taken += r.taken; const E = ENEMIES[r.g];
  for (const k in (r.ate || {})) fr.ate[k] = (fr.ate[k] || 0) + r.ate[k];
  if (!r.win) { fr.ko++; return; }
  fr.w++; fr.coins += r.coins; fr.xp += r.xp; fr.hx += r.hx; fr.foes[E.name] = (fr.foes[E.name] || 0) + 1;
  r.items.forEach(x => { fr.items[x] = (fr.items[x] || 0) + 1; });
  if (r.rare != null) fr.rares.push(r.rare); if (r.taskDone) fr.tasksDone.push(r.taskDone);
}
function fightTallyText(fr, label) {
  let t = `${label}: won ${fr.w} of ${fr.n}${fr.w ? ` (${itemsText(fr.foes)})` : ''}. +${fmt(fr.coins)} coins, +${fmt(fr.xp)} ${SKILLS[S.style]} xp, +${fmt(fr.hx)} Hitpoints xp, -${fmt(fr.taken)} health.`;
  if (Object.keys(fr.items).length) t += ` Loot: ${itemsText(fr.items)}.`;
  if (Object.keys(fr.ate).length) t += ` Ate ${itemsText(fr.ate)}.`;
  if (fr.rest) t += ` Rested ${fr.rest} time${fr.rest > 1 ? 's' : ''} on low health.`;
  if (fr.ko) t += ` Knocked out ${fr.ko} time${fr.ko > 1 ? 's' : ''}.`;
  return t;
}
function idleFight(fr) {
  if (S.area >= unlockedAreas()) return;
  const canEat = S.autoEat && S.cooked.some(n => n > 0);   // with auto-eat and food, the fight itself eats you back up
  if (!canEat && S.hp < Math.ceil(maxHP() * CONFIG.restBelow)) { fr.rest++; return; }   // too hurt: rest this turn, health keeps coming back
  tally(fr, fightOnce(pickEnemy(S.area)));
}

// the Fight button: the fight is decided up front, replayed hit by hit, and only counts once the replay ends
function beginFight() {
  if (S.area >= unlockedAreas()) return null;
  if (S.hp <= 0) { addLog('You have no health left. Eat some fish, drink a potion or rest.', 'warn'); return null; }
  const g = pickEnemy(S.area); S.lastFoe = g;
  return simFight(g);
}
function endFight(sim) {
  const g = sim.g, E = ENEMIES[g], r = applyFight(sim);
  const loot = itemsText(r.items.reduce((m, x) => (m[x] = (m[x] || 0) + 1, m), {}));
  if (!r.win) {
    addLog(`The ${E.name} knocked you out. Eat, drink a potion or rest to heal.`, 'warn');
    arenaMsg = {area: S.area, kind: 'warn', text: `Knocked out! The ${E.name} wins this one.`};
  } else {
    addLog(`You beat the ${E.name}. +${r.coins} coins, +${r.xp} ${SKILLS[S.style]} xp, +${r.hx} Hitpoints xp, -${r.taken} health.${loot ? ` Loot: ${loot}.` : ''}${Object.keys(r.ate).length ? ` Ate ${itemsText(r.ate)}.` : ''}`);
    arenaMsg = {area: S.area, kind: '', text: `Victory! +${r.coins} coins${loot ? `, ${loot}` : ''}`};
  }
  if (r.rare != null) rareAlert(r.rare);
  if (r.taskDone) taskDoneAlert(r.taskDone);
  return r.win ? [`+${fmt(r.coins)} coins`, 'gold'] : ['KO', 'red'];
}

/* ---------- healing ---------- */
// picks the biggest heal that doesn't overheal; if every option overheals, the smallest one
function smartPick(list, heals, hp = S.hp) {
  const missing = maxHP() - hp; let best = -1, small = -1;
  list.forEach((n, i) => { if (!n) return;
    if (heals[i] <= missing && (best < 0 || heals[i] > heals[best])) best = i;
    if (small < 0 || heals[i] < heals[small]) small = i; });
  return best >= 0 ? best : small;
}
function eat(i, all) {
  const mh = maxHP(); if (S.hp >= mh) { addLog('Your health is already full.', 'warn'); return; }
  const f = FISH[i]; let n = 0, gained = 0;
  while (S.cooked[i] > 0 && S.hp < mh && (all || n < 1)) { const g = Math.min(f.heal, mh - S.hp); S.hp += g; gained += g; S.cooked[i]--; n++; }
  if (!n) return; S.stats.eaten += n;
  addLog(n === 1 ? `You ate a ${f.name}. +${gained} health` : `Ate ${n} ${f.name}. +${fmt(gained)} health`);
  return [`+${fmt(gained)} health`, 'red'];
}
const eatBest = () => { const i = smartPick(S.cooked, FISH.map(f => f.heal)); return i >= 0 ? eat(i, false) : undefined; };
function drink(ri) {
  const mh = maxHP(); if (!S.pots[ri]) return; if (S.hp >= mh) { addLog('Your health is already full.', 'warn'); return; }
  const before = S.hp; S.hp = Math.min(mh, S.hp + AREAS[ri].potion[1]); S.pots[ri]--;
  addLog(`You have a ${AREAS[ri].potion[0]}. +${S.hp - before} health`);
  return [`+${S.hp - before} health`, 'red'];
}
const drinkBest = () => { const i = smartPick(S.pots, AREAS.map(a => a.potion[1])); return i >= 0 ? drink(i) : undefined; };

function setActivity(a) {
  if (S.activity === a || !canDo(a)) return;
  S.activity = a; S.actAt = now();
  addLog(a === 'fight' ? `Your dad is now fight idling in ${AREAS[S.area].place}: one fight every ${CONFIG.fightIdleMinutes} min.` : `Your dad is now ${ACT[a]}. Everything else is on hold.`);
}
/* ---------- slayer ---------- */
function newTask() {
  if (S.task) return;
  const top = unlockedAreas() - 1, areas = [top, top - 1].filter(a => a >= 0);   // your best area and the one below
  const ri = areas[Math.floor(Math.random() * areas.length)], g = ri * 5 + Math.floor(Math.random() * 5);
  const base = CONFIG.slayerTaskMin + Math.floor(Math.random() * (CONFIG.slayerTaskMax - CONFIG.slayerTaskMin + 1));
  const ext = S.extendOwned && S.extendOn, n = Math.round(base * (ext ? CONFIG.extendMult : 1));
  S.task = {e: g, n, done: 0, ext};
  addLog(`New Slayer task: beat ${n} ${plural(ENEMIES[g].name, n)} in ${AREAS[ri].place}.${ext ? ' (extended)' : ''}`, 'lvl');
}
function completeTask() {
  const T = S.task, E = ENEMIES[T.e];
  const xp = Math.round(T.n * E.xp * CONFIG.slayerXpPerKill), pts = T.ext ? 2 : 1;
  S.xp.slayer += xp; S.slayerPts += pts; S.stats.tasks++; S.task = null; rollPet('slayer');
  return {name: E.name, n: T.n, xp, pts};
}
function taskDoneAlert(d) {
  toast('Slayer task done!');
  addLog(`Slayer task done: ${d.n} ${plural(d.name, d.n)} beaten. +${fmt(d.xp)} Slayer xp, +${d.pts} Slayer point${d.pts > 1 ? 's' : ''}.`, 'lvl');
}
function cancelTask() {
  if (!S.task || S.slayerPts < CONFIG.slayerCancelCost) return;
  S.slayerPts -= CONFIG.slayerCancelCost; addLog(`Task cancelled. -${CONFIG.slayerCancelCost} Slayer point.`); S.task = null;
}
function buyExtend() {
  if (S.extendOwned || S.slayerPts < CONFIG.slayerExtendCost) return;
  S.slayerPts -= CONFIG.slayerExtendCost; S.extendOwned = true; S.extendOn = true;
  addLog('Task extension unlocked. Your next tasks are 50% bigger.', 'lvl'); toast('Task extension unlocked');
}
function buyPotions() {
  if (S.slayerPts < CONFIG.slayerPotionCost) return;
  const ri = Math.max(0, unlockedAreas() - 1); S.slayerPts -= CONFIG.slayerPotionCost; S.pots[ri] += CONFIG.slayerPotionPack;
  addLog(`Bought ${CONFIG.slayerPotionPack} ${AREAS[ri].potion[0]} for ${CONFIG.slayerPotionCost} Slayer point.`);
  return [`+${CONFIG.slayerPotionPack} ${AREAS[ri].potion[0]}`, 'red'];
}

/* ---------- shop ---------- */
function equip(i) {
  if (!S.weapons[i]) return;
  S.equipped = S.equipped === i ? -1 : i;
  addLog(S.equipped === i ? `Equipped the ${AREAS[i].weapon.name}. +${pct(AREAS[i].weapon.dmg)} damage.` : `Put away the ${AREAS[i].weapon.name}. Bare hands it is.`);
}
function sellWeapon(i) {
  const w = AREAS[i].weapon, spare = S.weapons[i] - (S.equipped === i ? 1 : 0); if (spare < 1) return;
  S.weapons[i]--; S.coins += w.price; addLog(`Sold a ${w.name} for ${fmt(w.price)} coins.`);
  return [`+${fmt(w.price)} coins`, 'gold'];
}
function buyIdle() {
  const c = CONFIG.idleCosts[S.capLevel]; if (c == null || S.coins < c) return;
  S.coins -= c; S.capLevel++;
  addLog(`Idle time upgraded: idle now keeps going ${dur(idleWindowMs())} after you close the game.`, 'lvl'); toast(`Idle time ${dur(idleWindowMs())}!`);
  return [`-${fmt(c)} coins`, 'gold'];
}

/* ---------- level ups ---------- */
function snapLevels() { const o = {combat: combatLevel()}; for (const k in SKILLS) o[k] = lvl(k); return o; }
function checkLevelUps(before) {
  for (const k in SKILLS) { const l = lvl(k); if (l <= before[k]) continue;
    let extra = ''; const unlocks = [];
    const opened = r => r.req > before[k] && r.req <= l;
    if (k === 'fishing') {
      FISH.filter(opened).forEach(f => { extra += ` You can now catch ${f.name}.`; unlocks.push(`New fish: ${f.name}`); });
      // if you were at your best spot, move up to the new best one automatically
      if (S.spot === bestSpot(before[k]) && bestSpot(l) > S.spot) { S.spot = bestSpot(l); extra += ` Moved to the ${FISH[S.spot].name} spot.`; }
    }
    if (k === 'cooking') FISH.filter(opened).forEach(f => { extra += ` You can now cook ${f.name}.`; unlocks.push(`Can cook ${f.name}`); });
    if (k === 'hitpoints') extra = ` Max health is now ${maxHP()}.`;
    if (k === 'slayer') extra = ` +${pct1(slayerBonus())} damage against your task enemy.`;
    toast(`${SKILLS[k]} level ${l}!`); unlocks.forEach(toast);
    addLog(`${SKILLS[k]} is now level ${l}.${extra}`, 'lvl');
  }
  const c = combatLevel();
  if (before.combat != null && c > before.combat) {
    const opened = AREAS.filter(a => a.req > before.combat && a.req <= c);
    addLog(`Combat level is now ${c}.${opened.map(a => ` ${a.place} is open.`).join('')}`, 'lvl');
    opened.forEach(a => toast(`New area: ${a.place}`));
  }
}


/* ---------- the server's front door ----------
   A phone can only ASK for things through doAction. Every input is checked here, and all the dice are rolled here,
   on the server. The phone never sends numbers like coins or xp: it just says "fight", "eat", "start cooking". */
const replayStep = n => clamp(Math.round(5200 / Math.max(1, n)), 150, 320);   // ms per hit in the fight replay (phone and server agree)
function commitPending() {          // the replayed fight finished: now it counts
  const P = S.pending; if (!P) return; S.pending = null; return endFight(P);
}
// healing mid-fight: the fight stops where the replay got to (worked out from the server clock, not the phone),
// you keep that damage, the enemy gets away, no rewards
function stopPending() {
  const P = S.pending; if (!P) return;
  const shown = Math.max(2, Math.floor((now() - P.at) / replayStep(P.ev.length)));
  if (shown >= P.ev.length) return commitPending();
  S.pending = null; const mh = maxHP(), start = P.hpStart ?? S.hp, eaten = {}; let cur = start, lost = 0;
  for (let i = 0; i < shown; i++) { const [w, d, fi] = P.ev[i];
    if (w === 'e') { cur = Math.max(0, cur - d); lost += d; } else if (w === 'h') { cur = Math.min(mh, cur + d); eaten[fi] = (eaten[fi] || 0) + 1; } }
  useFood(eaten);
  S.hp = clamp(cur + (S.hp - start), 0, mh);
  const E = ENEMIES[P.g];
  addLog(`You stopped to heal. The ${E.name} got away. -${lost} health.`, 'warn');
  arenaMsg = {area: S.area, kind: 'warn', text: `Fight stopped. The ${E.name} got away.`};
}
const intIn = (v, lo, hi) => { const n = Math.floor(+v); return Number.isFinite(n) && n >= lo && n <= hi ? n : null; };
function cleanLook(L) {
  L = L && typeof L === 'object' ? L : {}; const n = (v, max, d) => intIn(v, 0, max) ?? d;
  return {skin: n(L.skin, LOOKS.skin.length - 1, 1), hair: LOOKS.hair.includes(L.hair) ? L.hair : 'short', hairColor: n(L.hairColor, LOOKS.hairColor.length - 1, 1),
    beard: LOOKS.beard.includes(L.beard) ? L.beard : 'none', glasses: !!L.glasses, shirt: n(L.shirt, LOOKS.shirt.length - 1, 0), bg: n(L.bg, LOOKS.bg.length - 1, 0)};
}
const cleanName = s => (String(s || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 16)) || 'Dad';
const HEAL_ACTS = ['eat', 'eatAll', 'eatBest', 'drinkBest'];
function doAction(action, a) {
  a = a && typeof a === 'object' ? a : {};
  // a fight that was being replayed: healing stops it, anything else lets it finish first
  if (S.pending && action !== 'fightEnd' && action !== 'fightStop') { if (HEAL_ACTS.includes(action)) stopPending(); else commitPending(); }
  const before = snapLevels(); let out = {};
  switch (action) {
    case 'sync': break;
    case 'spot': { const i = intIn(a.i, 0, bestSpot(lvl('fishing'))); if (i != null && i !== S.spot) { S.spot = i; addLog(`Now fishing at the ${FISH[i].name} spot.`); } break; }
    case 'activity': if (['fish', 'cook', 'trade'].includes(a.a)) setActivity(a.a); break;
    case 'fightIdle': setActivity(S.activity === 'fight' ? 'fish' : 'fight'); break;
    case 'area': { const i = intIn(a.i, 0, unlockedAreas() - 1); if (i != null) { S.area = i; arenaMsg = null; } break; }
    case 'style': if (STYLES.some(x => x[0] === a.s) && S.style !== a.s) { S.style = a.s; addLog(`Combat style: ${STYLES.find(x => x[0] === S.style)[1]}. Fight xp now trains ${SKILLS[S.style]}.`); } break;
    case 'eat': case 'eatAll': { const i = intIn(a.i, 0, 9); if (i != null) out.pop = eat(i, action === 'eatAll'); break; }
    case 'eatBest': out.pop = eatBest(); break;
    case 'drinkBest': out.pop = drinkBest(); break;
    case 'fight': { const sim = beginFight(); if (sim) { S.pending = Object.assign({}, sim, {at: now()}); out.fight = {g: sim.g, ev: sim.ev}; } break; }
    case 'fightEnd': out.pop = commitPending(); break;
    case 'fightStop': stopPending(); break;
    case 'newTask': newTask(); break;
    case 'cancelTask': cancelTask(); break;
    case 'buyExtend': buyExtend(); break;
    case 'toggleExtend': if (S.extendOwned) { S.extendOn = !S.extendOn; addLog(`Task extension ${S.extendOn ? 'on' : 'off'} for your next tasks.`); } break;
    case 'buyPotions': out.pop = buyPotions(); break;
    case 'buyIdle': out.pop = buyIdle(); break;
    case 'equip': { const i = intIn(a.i, 0, 9); if (i != null) equip(i); break; }
    case 'sellWeapon': { const i = intIn(a.i, 0, 9); if (i != null) out.pop = sellWeapon(i); break; }
    case 'autoEat': S.autoEat = !S.autoEat; addLog(S.autoEat ? `Auto-eat on: below ${pct(CONFIG.autoEatBelow)} health your dad eats his best fish instead of attacking, in fights and fight idle.` : 'Auto-eat off.'); break;
    case 'petOut': if (S.pets[a.k]) { S.petOut = S.petOut === a.k ? null : a.k; addLog(S.petOut ? `${CONFIG.pets[a.k].name} is following you now.` : `${CONFIG.pets[a.k].name} is taking a nap at home.`); } break;
    case 'setLook': S.name = cleanName(a.name); S.look = cleanLook(a.look); break;
    default: out.unknown = true;
  }
  checkLevelUps(before);
  return out;
}
// what the highscore board shows, worked out from the real state
function scoreRow() {
  const lv = {}; for (const k in SKILLS) lv[k] = lvl(k);
  return {name: S.name, look: S.look, lv, total: totalLevel(), combat: combatLevel(), kills: S.stats.kills, tasks: S.stats.tasks, weapon: S.equipped, pet: S.petOut};
}

return { get S() { return S; }, setS(v) { S = v; }, get arenaMsg() { return arenaMsg; }, toasts,
  tick, doAction, scoreRow, migrate, freshState, cleanName, cleanLook, CONFIG };
}
