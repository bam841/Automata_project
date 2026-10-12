# Architecture and Contracts

Everything here is a **contract**. Changing one requires a new entry in `DECISIONS.md`.
Values marked *(default)* are starting points the human may adjust in M1.

## 1. Repository layout
```
automata-city/
├── index.html
├── legacy/                    read-only copy of the original site (for regression compare)
├── css/    style.css (existing tokens, kept) · game.css (HUD, overlay, chalkboard/CRT skins)
├── js/
│   ├── core/     ac.js (namespace, util, bus, rng) · progress.js
│   ├── engine/   loop.js · input.js · camera.js · tilemap.js · collide.js · sprites.js · audio.js
│   ├── logic/    strings.js · sets.js · tree.js · dfa.js · exam-gen.js     (PURE)
│   ├── lessons/  shell.js · lesson-player.js · str.js · set.js · tree.js · dfa.js
│   ├── world/    tiles.js · map-data.js · entities.js · districts.js · hud.js · dialogue.js · minimap.js
│   ├── classic.js   (old home() card screen, now "Classic Mode")
│   └── main.js      (boot, state machine)
├── assets/       MANIFEST.md · sprites/ · fonts/
├── tests/        run.js (node) · index.html (browser) · *.test.js
├── tools/        contact-sheet.html (tile index viewer)
└── agent-kit/    this kit
```
Script order in `index.html` (classic scripts): `core → engine → logic → lessons → world → classic → main`.

## 2. Namespace and modules
Single global `AC`. Each file:
```js
(function (root) {
  'use strict';
  const AC = root.AC = root.AC || {};
  AC.strings = AC.strings || {};
  AC.strings.reverse = s => [...s].reverse().join('');
})(typeof globalThis !== 'undefined' ? globalThis : window);
```
Logic modules must not touch `document`/`window` so Node can run them.

## 3. Core utilities (`AC.util`, `AC.bus`, `AC.rng`)
- `AC.util.$(sel, root?)`, `AC.util.esc(str)` (HTML-escape), `AC.util.clamp(v,a,b)`.
- `AC.bus.on(evt, fn)`, `AC.bus.off(evt, fn)`, `AC.bus.emit(evt, payload)`. Events: `stamp {id}`, `shard {id}`, `lecture:open {id}`, `lecture:close {id}`, `exam:pass`, `state {from,to}`.
- `AC.rng(seed)` → function returning floats in [0,1). Reference implementation (mulberry32):
```js
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
```
All randomness in logic/lessons/exam takes an `rng` argument. `Math.random()` is allowed only to *create a seed*.

## 4. Progress (`AC.progress`)
Shape (key `automataCity.v1` in `localStorage`; every access wrapped in try/catch):
```js
{ v:1, name:'', sprite:0,
  stamps:{str:false,set:false,tree:false,dfa:false},
  shards:[],                       // shard ids collected
  exam:{passed:false,best:0},
  player:{tx:32,ty:34},
  settings:{muted:false,theme:'auto',reducedMotion:'auto'} }
```
API: `load()`, `save()`, `reset()`, `get()`, `setStamp(id)`, `addShard(id)`. Unknown/corrupt data → fall back to defaults, never throw. Version bump requires a migration function.

## 5. Game state machine (`main.js`)
States: `boot → title → world ⇄ lecture`, `world ⇄ journal`, `world ⇄ paused`, `world → ending`.
- `lecture`: world renders (dimmed) but `update()` is skipped; `AC.input.setEnabled(false)` for movement; overlay owns the keyboard.
- Only `main.js` changes state; others emit `AC.bus` events.

## 6. Engine contracts
- **Render:** internal resolution **320×180** *(default)*, tile **16 px** *(default)*; canvas scaled by an **integer** factor with letterboxing; `ctx.imageSmoothingEnabled=false`; CSS `image-rendering:pixelated`. Handle `devicePixelRatio`.
- **Loop (`AC.loop`):** fixed timestep 1/60 s with accumulator; clamp frame delta to 0.25 s; max 5 updates per frame. `start(update(dt), render(alpha))`, `stop()`. Pause when tab hidden.
- **Input (`AC.input`):** actions `up down left right interact cancel map journal mute hint`. `isDown(a)`, `pressed(a)` (true once per press, cleared each tick), `setEnabled(bool)`, `bindTouch(el)`. Ignores keys when focus is in `input/textarea/select`.
- **Tilemap (`AC.tilemap`):** `{w,h,tile, layers:{ground:Uint16Array, objects:Uint16Array, above:Uint16Array}}`; index 0 = empty. `isSolid(tx,ty)` reads `AC.tiles.solid` (a `Set` of tile ids). Out-of-bounds is solid. `draw(ctx, cam, layerName)` draws only visible tiles.
- **Collision (`AC.collide.move(map, box, dx, dy)`):** pure; AABB `{x,y,w,h}` in pixels; moves X then Y; returns `{x,y,hitX,hitY}`. Player hitbox 10×6 at the feet *(default)*.
- **Camera:** follows player with smoothing, clamped to map bounds.
- **Sprites:** `AC.sprites.load(manifest)` → Promise; frames addressed by name from a table in `tiles.js`/`entities.js` (never raw numbers in gameplay code).
- **Audio (`AC.audio`):** WebAudio synthesized; `play(name)` for `step select open close collect stamp error`; `setMuted(bool)`. `AudioContext` is created/resumed on the first user gesture (title screen).

## 5b. Entities and triggers
```js
Entity  = { id, kind:'player'|'npc'|'prop'|'shard'|'companion', x, y, w, h, sprite, update(dt), draw(ctx,cam) }
Trigger = { id, rect:{x,y,w,h}, prompt:'E  Enter lecture', onInteract(game) }   // nearest in range wins
```
Draw order: ground → objects (+ entities sorted by `y+h`) → above → HUD.

## 7. Districts registry (`AC.districts`)
Extends the old `D` array. **Ids unchanged.**
```js
{ id:'str', name:'String Street', color:'#e0663f', summary:'…',
  region:{x0,y0,x1,y1}, board:{tx,ty}, shards:[{id,tx,ty}...], lesson:'str' }
```
Colors: `str #e0663f`, `set #1f9d8a`, `tree #4c8c3a`, `dfa #6f55e0`.

## 8. World layout *(default coordinates, tile units)*
| Region | x range | y range | Board tile |
|---|---|---|---|
| Hub | 24–40 | 24–40 | — (Prof. Delta at 32,35; fountain 32,32; Exam Tower 36–39 × 25–28) |
| Tree Forest (N) | 20–44 | 2–20 | 32,12 |
| String Street (W) | 2–20 | 24–40 | 12,32 |
| Set Park (E) | 44–62 | 24–40 | 52,32 |
| DFA Station (S) | 20–44 | 44–62 | 32,52 |
Roads: 3 tiles wide connecting each region to the hub. Player spawn: (32,34). Interact range: 1.5 tiles from a trigger rect.
Map is built in code with helpers (`fillRect`, `path`, `place`), deterministic, no external map files.

## 9. Lecture shell (`AC.lessons.shell`)
- `open(districtId)` / `close()`; DOM node `#lecture` with `role="dialog" aria-modal="true" aria-labelledby`; focus trap; Esc closes; restores focus to canvas.
- Tabs: Learn · Practice · Challenge. Only the active tab's module is mounted; switching calls `unmount()` then `mount()`.
- **Lesson module contract:**
```js
AC.lessons[id] = {
  id, title, color,
  learn:     { mount(host, ctx), unmount() },   // lesson-player driven
  practice:  { mount(host, ctx), unmount() },   // the refactored original district view
  challenge: { mount(host, ctx), unmount() }    // may be the same module as practice
}
// ctx = { onStamp(id), close(), theme:'light'|'dark', reducedMotion:boolean, rng }
```
- `unmount()` must remove every listener it added. Opening/closing 20× must not grow DOM node or listener counts.
- Views render into `host` only. Event handling is **delegated** on `host` using `data-act="…"` attributes.

## 10. Lesson step schema (`lesson-player.js`)
```js
Step = { title:'≤6 words', say:'≤30 words', draw(host, state), state? }
Lesson = { id, seed, steps:[Step…], quickCheck:(rng)=>[Question×3] }
```
`draw` must compute displayed values by calling `AC.logic` functions (no hard-coded results).

## 11. Logic API (`AC.strings`, `AC.sets`, `AC.tree`, `AC.dfa`)
Names are **targets**. In M0 the agent maps them onto the existing code and records the mapping in `docs/GROUND_TRUTH.md`; if the old code already has equivalents, keep behavior identical.
- `AC.strings`: `length, prefixes(w), suffixes(w), prefixAt(w,k), suffixAt(w,k), concat(w,v), reverse(w), isPalindrome(w)`.
- `AC.sets` (universe `U={1..8}`): `union, intersection, difference, symDiff, complement, powerSet, cartesian` — sets are `Set<number>`; `powerSet` returns an array of arrays sorted by size then lexicographic.
- `AC.tree`: `insert, buildBST(keys), randomBST(rng, n=7), preorder, inorder, postorder, layout(tree)`.
- `AC.dfa`: `run(machine, s)`, `accepts(machine, s)`, `complement(machine)`, `allStrings(maxLen=6)`, `goals` (3 predicates), `testAgainst(machine, goalId)` → `{passed, total, failures[]}`. Machine shape: `{n, delta:[[next0,next1],…], accept:Set<int>}` with `q0 = 0`.
- `AC.examGen(rng)` → 8 questions (see `DOMAIN_SPEC.md` §8).

## 12. Performance budget
- 60 fps; frame work < 8 ms on a mid laptop.
- No allocation of arrays/objects inside `update`/`render` hot paths.
- Pre-render static ground/objects layers to offscreen canvases per chunk (e.g., 16×16 tiles).
- Initial load < 3 MB total assets.

## 13. Accessibility
Keyboard-only playable; visible focus; overlay is a labelled dialog; `prefers-reduced-motion` disables screen transitions/shake/auto-play; color is never the only signal (labels/icons accompany district colors); text contrast ≥ 4.5:1 in lecture content.
