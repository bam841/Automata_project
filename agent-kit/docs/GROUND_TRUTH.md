# GROUND_TRUTH.md — Automata City Baseline Analysis

This document records the exact state of the existing codebase prior to M0 refactoring. Every identifier, handler, and anomaly is grounded with `path:line` citations.

---

## 1. Top-Level Identifiers per File

### `js/core.js`
- `$` (`js/core.js:5`) — `const`: Shorthand query selector (`s => document.querySelector(s)`).
- `app` (`js/core.js:8`) — `const`: Cached DOM reference to `#app` mount element (`$('#app')`).
- `esc` (`js/core.js:12`) — `const`: HTML sanitization helper replacing `&`, `<`, `>`, `"` with HTML entities.
- `ST` (`js/core.js:16`) — `let`: Stamp completion record object (`{ [id]: 1 }`).
- `D` (`js/core.js:25`) — `const`: Array of 4 district descriptors (`{id, n, c, s, f}`).
- `head` (`js/core.js:38`) — `const`: Function generating HTML string for district header with "Back to the map" button.
- `chal` (`js/core.js:45`) — `const`: Function evaluating challenge state, updating `ST[id]`, and rendering status banner `#ch`.
- `home` (`js/core.js:57`) — `function`: Renders the main City Map view with 4 district cards into `app.innerHTML`.

### `js/strings.js`
- `W` (`js/strings.js:7`) — `let`: Primary test string $w$ (default `'level'`).
- `V` (`js/strings.js:7`) — `let`: Secondary test string $v$ (default `'city'`).
- `K` (`js/strings.js:7`) — `let`: Cut position index in string $w$ (default `2`).
- `strv` (`js/strings.js:10`) — `function`: Renders String Street UI scaffold into `app.innerHTML` and calls `su()`.
- `su` (`js/strings.js:24`) — `function`: Reads inputs `#w`, `#v`, `#k`, computes string properties, updates `#trk` and `#out`, and evaluates palindrome challenge.

### `js/sets.js`
- `A` (`js/sets.js:8`) — `let`: Set instance for group A (default `{1, 2, 3}`).
- `B` (`js/sets.js:8`) — `let`: Set instance for group B (default `{3, 4, 5}`).
- `OP` (`js/sets.js:8`) — `let`: Active operation key string (default `'union'`).
- `U` (`js/sets.js:11`) — `const`: Array containing universe numbers `[1, 2, 3, 4, 5, 6, 7, 8]`.
- `srt` (`js/sets.js:14`) — `const`: Utility function sorting iterable numerically ascending (`s => [...s].sort((x, y) => x - y)`).
- `OPS` (`js/sets.js:19`) — `const`: Dictionary mapping operation keys to `[label, computeFn]`.
- `tg` (`js/sets.js:48`) — `function`: Toggles number `x` in set `n` ('A' or 'B') and triggers `setv()`.
- `setv` (`js/sets.js:58`) — `function`: Renders Set Park UI, Venn diagram SVG, and operation results into `app.innerHTML`, and tests challenge condition.

### `js/tree.js`
- `T` (`js/tree.js:4`) — `let`: Current binary search tree object `{ root, md }`.
- `TO` (`js/tree.js:5`) — `let`: Active traversal order key (`'pre' | 'in' | 'post'`).
- `TM` (`js/tree.js:6`) — `let`: Active traversal interaction mode (`'watch' | 'turn'`).
- `TS` (`js/tree.js:7`) — `let`: Target visiting sequence array of tree values for active traversal order.
- `TP` (`js/tree.js:8`) — `let`: Count index of visited nodes in current traversal.
- `TI` (`js/tree.js:9`) — `let`: Active `setInterval` timer ID for automated walk animation.
- `TG` (`js/tree.js:10`) — `let`: Traversal feedback message string.
- `NM` (`js/tree.js:13`) — `const`: Traversal order label map (`{pre: 'Preorder', in: 'Inorder', post: 'Postorder'}`).
- `RL` (`js/tree.js:16`) — `const`: Traversal rule explanation map (`{pre: 'root, left, right', ...}`).
- `wk` (`js/tree.js:19`) — `const`: Recursive traversal walker returning array of visited node values.
- `mk` (`js/tree.js:43`) — `function`: Generates 7 unique random numbers (1..99), inserts them into a BST, and computes 2D inorder layout coordinates `{x, d}`.
- `treev` (`js/tree.js:89`) — `function`: Renders Tree Forest view scaffold into `app.innerHTML` and calls `trr()`.
- `trr` (`js/tree.js:121`) — `function`: Renders tree SVG and traversal status into `#tv`, and evaluates challenge condition.
- `wt` (`js/tree.js:162`) — `function`: Initializes automated traversal walk animation.
- `yt` (`js/tree.js:174`) — `function`: Switches to interactive traversal test mode ("Your turn").
- `tc` (`js/tree.js:186`) — `function`: Node click handler checking if clicked node `v` matches next expected node in `TS[TP]`.

### `js/dfa.js`
- `CH` (`js/dfa.js:5`) — `const`: Array of 3 goal presets `{ n, p }` (Ends in 01, Even 1s, No two 0s in a row).
- `X` (`js/dfa.js:21`) — `let`: DFA machine state `{ n: 3, t: [...], f: new Set(), c: 0 }`.
- `dfav` (`js/dfa.js:24`) — `function`: Renders DFA Station scaffold into `app.innerHTML`, calls `dd()`, `tr()`, and initializes challenge.
- `rs` (`js/dfa.js:56`) — `function`: Adjusts state count by `d` (+1 or -1, clamped within 2..5) and calls `dfav()`.
- `dd` (`js/dfa.js:71`) — `function`: Computes SVG state diagram layout and renders into `#sv`, then calls `tr()`.
- `run` (`js/dfa.js:125`) — `const`: Executes binary string `s` through DFA machine `X` and returns final resting state index.
- `tr` (`js/dfa.js:135`) — `function`: Traces input string from `#ts` step-by-step and writes result into `#tr`.
- `rt` (`js/dfa.js:155`) — `function`: Evaluates machine on all 127 binary strings of length 0..6 against goal predicate `CH[X.c].p`, outputs results to `#msg`, and awards stamp on full pass.

### `js/app.js`
- `home()` (`js/app.js:5`) — Invokes `home()` to render the initial view upon script load.

---

## 2. Inline Event Handlers

| File & Line | Event | Handler Code | Target Function / Action |
|---|---|---|---|
| `js/core.js:38` | `onclick` | `home()` | Navigates back to home map |
| `js/core.js:67` | `onclick` | `D.find(x=>x.id=='${d.id}').f()` | Opens selected district view |
| `js/strings.js:14` | `oninput` | `su()` | Recalculates and updates string view when `#w` changes |
| `js/strings.js:14` | `oninput` | `su()` | Recalculates and updates string view when `#v` changes |
| `js/strings.js:16` | `oninput` | `su()` | Updates cut position $K$ and view when `#k` changes |
| `js/sets.js:99` | `onclick` | `tg('${n}',${x})` | Toggles element $x$ in set A or B |
| `js/sets.js:100` | `onclick` | `OP='${k}';setv()` | Changes active set operation |
| `js/tree.js:103` | `onclick` | `TO='${k}';treev()` | Switches tree traversal order |
| `js/tree.js:104` | `onclick` | `wt()` | Starts automated walk animation |
| `js/tree.js:104` | `onclick` | `yt()` | Starts interactive node clicking mode |
| `js/tree.js:104` | `onclick` | `mk();treev()` | Generates a new random tree and redraws |
| `js/tree.js:150` | `onclick` | `tc(${n.v})` | Clicks node with value $n.v$ |
| `js/tree.js:150` | `onkeydown` | `if(event.key=='Enter')tc(${n.v})` | Keyboard selection of node |
| `js/dfa.js:40` | `onchange` | `X.c=+this.value;dfav()` | Changes target language goal |
| `js/dfa.js:41` | `onchange` | `X.t[${i}][${c}]=+this.value;dd()` | Updates transition delta $\delta(q_i, c)$ |
| `js/dfa.js:41` | `onchange` | `this.checked?X.f.add(${i}):X.f.delete(${i});dd()` | Toggles accepting state $q_i$ |
| `js/dfa.js:42` | `onclick` | `rs(-1)` | Removes a state |
| `js/dfa.js:42` | `onclick` | `rs(1)` | Adds a state |
| `js/dfa.js:42` | `onclick` | `X.f=new Set(ks.filter(i=>!X.f.has(i)));dfav()` | Inverts accepting states (DFA complement) |
| `js/dfa.js:44` | `oninput` | `tr()` | Retraces test string input in real time |
| `js/dfa.js:45` | `onclick` | `rt()` | Runs full 127-string test suite |

---

## 3. DOM Selectors and `innerHTML` Sinks

### DOM IDs
- `#app`: Mount container, written in `core.js:8,65`, `strings.js:13`, `sets.js:98`, `tree.js:102`, `dfa.js:39`.
- `#ch`: Challenge banner, updated in `core.js:49`.
- `#w`: String $w$ text input, read in `strings.js:26`.
- `#v`: String $v$ text input, read in `strings.js:28`.
- `#k`: Cut slider, read and configured in `strings.js:31,33,35`.
- `#kv`: Cut indicator badge, written in `strings.js:57`.
- `#trk`: Train cars track container, written in `strings.js:61`.
- `#out`: String properties table container, written in `strings.js:71`.
- `#tv`: Tree SVG container, written in `tree.js:153`.
- `#sv`: DFA SVG container, written in `dfa.js:119`.
- `#ts`: DFA test string input, read in `dfa.js:142`.
- `#tr`: DFA trace output paragraph, updated in `dfa.js:137,151`.
- `#msg`: DFA test suite output paragraph, updated in `dfa.js:170,175`.

### CSS Classes Read/Written
- `.ch`, `.ch.done`: Challenge banner styling (`core.js:51`).
- `.map`, `.dist`, `.dist.st`: Home district grid and cards (`core.js:67`).
- `.f`: Flex wrapper (`strings.js:14,16`, `sets.js:99,100,106`, `dfa.js:40,44`).
- `.row`: Train car row layout (`strings.js:61,73,74,75,76`).
- `.car`, `.car.p`, `.car.s`, `.car.e`: Train car elements (`strings.js:50,75`).
- `.ot`: Output properties table (`strings.js:71`).
- `.chip`, `.chip.on`: Set element toggles (`sets.js:99`).
- `.pri`: Primary button highlight (`sets.js:100`, `tree.js:103`, `dfa.js:45`).
- `.vc`: Venn circle SVG class (`sets.js:101`).
- `.lb`: SVG labels (`sets.js:101`, `tree.js:150`, `dfa.js:114`).
- `.el`, `.el.hl`, `.el.cur`: Venn & Tree node circles (`sets.js:101`, `tree.js:150`).
- `.qn`: Node value text (`sets.js:101`, `tree.js:150`, `dfa.js:113`).
- `.sc`: Table scroll container (`dfa.js:41`).
- `.tn`: Tree interactive node group (`tree.js:150`).
- `.ed`: Tree edge line (`tree.js:137`).
- `.bad`, `.ok`: Status messages (`sets.js:103`, `tree.js:154`, `dfa.js:170`).
- `.nd`: DFA state circle (`dfa.js:109`).
- `.ar`: DFA arrow marker (`dfa.js:74`).

### `innerHTML` Sinks
- `app.innerHTML` in `core.js:65`, `strings.js:13`, `sets.js:98`, `tree.js:102`, `dfa.js:39`.
- `$('#trk').innerHTML` in `strings.js:61`.
- `$('#out').innerHTML` in `strings.js:71`.
- `$('#tv').innerHTML` in `tree.js:153`.
- `$('#sv').innerHTML` in `dfa.js:119`.

---

## 4. Separation of Concerns: Logic vs Rendering vs State

### Pure Computation (Extractable to `js/logic/`)
- `esc(s)` (`core.js:12`)
- `srt(s)` (`sets.js:14`)
- `OPS.*[1]()` (`sets.js:21-44`) — mathematical set operations
- `wk(n, o, a)` (`tree.js:19`) — tree traversals
- `ins(n, x)` (`tree.js:55`) — BST insertion
- `lay(n, d)` (`tree.js:66`) — tree 2D coordinate calculation
- `run(s)` (`dfa.js:125`) — DFA string simulation
- Goal predicates `CH[i].p(s)` (`dfa.js:7,10,13`)

### DOM Rendering (Extractable to `js/lessons/` or `js/world/`)
- `head(t)` (`core.js:38`)
- `home()` (`core.js:57`)
- `strv()` (`strings.js:10`)
- `su()` (`strings.js:24`)
- `setv()` (`sets.js:58`)
- `treev()` (`tree.js:89`)
- `trr()` (`tree.js:121`)
- `dfav()` (`dfa.js:24`)
- `dd()` (`dfa.js:71`)
- `tr()` (`dfa.js:135`)
- `rt()` (`dfa.js:155`)

### State Variables (To be managed via `AC.progress` or module contexts)
- `ST` (`core.js:16`)
- `W, V, K` (`strings.js:7`)
- `A, B, OP` (`sets.js:8`)
- `T, TO, TM, TS, TP, TI, TG` (`tree.js:4-10`)
- `X` (`dfa.js:21`)

---

## 5. Global Dependency Audit: `ST`, `app`, `D`, `head`, `home`

- `ST`: Defined in `core.js:16`; accessed in `core.js:47,51,53,62,67`.
- `app`: Defined in `core.js:8`; accessed across `core.js:65`, `strings.js:13`, `sets.js:98`, `tree.js:102`, `dfa.js:39`.
- `D`: Defined in `core.js:25`; accessed in `core.js:67`.
- `head`: Defined in `core.js:38`; called in `strings.js:13`, `sets.js:98`, `tree.js:102`, `dfa.js:39`.
- `home`: Defined in `core.js:57`; called in `core.js:38` and `app.js:5`.

---

## 6. Logic API Mapping Table

| Target Contract (`ARCHITECTURE.md` §11) | Existing Function / Implementation | Status & Transition Plan |
|---|---|---|
| `AC.strings.length(w)` | `[...W].length` in `strings.js:42` | Wrap into pure `w => [...w].length` |
| `AC.strings.prefixes(w)` | `li(i => a.slice(0, i).join(''))` in `strings.js:77` | Extract into pure returning `string[]` |
| `AC.strings.suffixes(w)` | `li(i => a.slice(i).join(''))` in `strings.js:78` | Extract into pure returning `string[]` |
| `AC.strings.prefixAt(w, k)` | `a.slice(0, K).join('')` in `strings.js:73` | Extract pure `(w, k) => [...w].slice(0, k).join('')` |
| `AC.strings.suffixAt(w, k)` | `a.slice(K).join('')` in `strings.js:74` | Extract pure `(w, k) => [...w].slice(k).join('')` |
| `AC.strings.concat(w, v)` | `w + v` in `strings.js:75` | Extract pure `(w, v) => w + v` |
| `AC.strings.reverse(w)` | `[...a].reverse().join('')` in `strings.js:44` | Extract pure `w => [...w].reverse().join('')` |
| `AC.strings.isPalindrome(w)` | `n >= 3 && a.join('') == rv.join('')` in `strings.js:82` | Extract pure `w => w.length > 0 && w === [...w].reverse().join('')` |
| `AC.sets.union(A, B)` | `OPS.union[1]()` in `sets.js:21` | Parameterize with `(A, B, U = [1..8])` returning `Set<number>` |
| `AC.sets.intersection(A, B)` | `OPS.inter[1]()` in `sets.js:24` | Parameterize with `(A, B, U)` returning `Set<number>` |
| `AC.sets.difference(A, B)` | `OPS.diff[1]()` in `sets.js:27` | Parameterize with `(A, B, U)` returning `Set<number>` |
| `AC.sets.symDiff(A, B)` | `OPS.sym[1]()` in `sets.js:30` | Parameterize with `(A, B, U)` returning `Set<number>` |
| `AC.sets.complement(A)` | `OPS.comp[1]()` in `sets.js:33` | Parameterize with `(A, U)` returning `Set<number>` |
| `AC.sets.powerSet(A)` | `OPS.pow[1]()` in `sets.js:36` | Adapt to return sorted `number[][]` |
| `AC.sets.cartesian(A, B)` | `OPS.cart[1]()` in `sets.js:44` | Adapt to return `[number, number][]` |
| `AC.tree.insert(n, x)` | `ins(n, x)` in `tree.js:55` | Extract pure BST insert function |
| `AC.tree.buildBST(keys)` | BST insertion loop in `tree.js:61` | Extract pure `keys => ...` |
| `AC.tree.randomBST(rng, n=7)` | `mk()` in `tree.js:43` | Adapt to accept seeded `rng` parameter |
| `AC.tree.preorder(tree)` | `wk(n, 'pre')` in `tree.js:19` | Extract pure traversal |
| `AC.tree.inorder(tree)` | `wk(n, 'in')` in `tree.js:19` | Extract pure traversal |
| `AC.tree.postorder(tree)` | `wk(n, 'post')` in `tree.js:19` | Extract pure traversal |
| `AC.tree.layout(tree)` | `lay(root, 0)` in `tree.js:66` | Extract pure layout engine returning coordinates |
| `AC.dfa.run(machine, s)` | `run(s)` in `dfa.js:125` | Parameterize with `(machine, s)` |
| `AC.dfa.accepts(machine, s)` | `X.f.has(run(s))` in `dfa.js:151,167` | Extract pure `(machine, s) => machine.accept.has(...)` |
| `AC.dfa.complement(machine)` | Inversion in `dfa.js:42` | Extract pure machine cloning with inverted accept set |
| `AC.dfa.allStrings(maxLen=6)` | String generation loop in `dfa.js:157` | Extract pure generator returning 127 strings |
| `AC.dfa.goals` | `CH` in `dfa.js:5` | Export immutable goal definitions `{ id, name, predicate }` |
| `AC.dfa.testAgainst(machine, goalId)` | Test loop in `dfa.js:167` | Extract pure returning `{ passed, total, failures }` |
| `AC.examGen(rng)` | `MISSING` | To be constructed in M6 per `DOMAIN_SPEC.md` §8 |

---

## 7. Anomalies and Technical Debt

1. **Duplicated HTML Document Wrapper in `index.html`:**
   - Lines 1 and 23 wrap a second complete HTML document declaration.
   - Cleaned in M0 to maintain strict single-document standards.
2. **Undeclared Global `TI` Reference:**
   - `core.js:59` invokes `clearInterval(TI)` where `TI` is only declared later in `tree.js:9`. In strict mode or when modules are loaded out of order, this is fragile.
3. **Hardcoded Monolithic DOM Mutation:**
   - Every view mutates `app.innerHTML` directly, precluding embedding inside modal lecture boards without isolation.
4. **Unseeded Randomness in Tree Generation:**
   - `tree.js:49` directly calls `Math.random()`, preventing deterministic test verification. Replaced by `AC.rng(seed)`.
