# Automata City — Complete Technical Documentation & Codebase Walkthrough

This document provides a comprehensive technical guide to the **Automata City** codebase. It covers the system architecture, component relationships, data flow, and provides an **exhaustive line-by-line explanation of every function in every JavaScript file**.

---

## Table of Contents

1. [Architectural Overview](#architectural-overview)
2. [File Inventory & Load Hierarchy](#file-inventory--load-hierarchy)
3. [Module Walkthrough & Line-by-Line Code Explanations](#module-walkthrough--line-by-line-code-explanations)
   - [1. `js/core.js` — Foundation, Navigation & Stamps](#1-jscorejs--foundation-navigation--stamps)
   - [2. `js/app.js` — Bootstrap & Application Start](#2-jsappjs--bootstrap--application-start)
   - [3. `js/strings.js` — String Street Playground](#3-jsstringsjs--string-street-playground)
   - [4. `js/sets.js` — Set Park & Venn Diagram Simulator](#4-jssetsjs--set-park--venn-diagram-simulator)
   - [5. `js/tree.js` — Tree Forest & Traversal Walks](#5-jstreejs--tree-forest--traversal-walks)
   - [6. `js/dfa.js` — DFA Station Simulator & Automated Verifier](#6-jsdfajs--dfa-station-simulator--automated-verifier)
4. [HTML Structure & CSS Design System](#html-structure--css-design-system)
   - [`index.html`](#indexhtml)
   - [`css/style.css`](#cssstylecss)
5. [Summary of Theoretical Computer Science Concepts Implemented](#summary-of-theoretical-computer-science-concepts-implemented)

---

## Architectural Overview

**Automata City** is built entirely using vanilla modern JavaScript (ES6+), HTML5, and CSS3 without external dependencies, build pipelines, or bundling tools.

### Core Architecture Patterns:
1. **Zero-Dependency Single Page Application (SPA):** Screen transitions are performed by clearing and rewriting the `innerHTML` of the mount container `#app`.
2. **Shared Global Namespace State:** The scripts share a global execution context in the browser window. Because there are no module loaders, execution relies strictly on the script tag ordering defined in `index.html`.
3. **Reactive View Pattern via Full Redraw:** Whenever user input or state changes (e.g., typing a character, moving a slider, adding a node, or clicking an interactive state), the active view's rendering function is re-invoked to re-generate the DOM and SVG elements.
4. **Declarative Vector Graphics (SVG):** Mathematical concepts such as Venn diagrams, binary trees, and finite automata transition graphs are calculated geometrically and rendered into responsive `<svg>` viewports.

---

## File Inventory & Load Hierarchy

In `index.html`, scripts are intentionally included in the following order:

```html
<script src="js/core.js"></script>    <!-- 1. Utility functions, state ST, district registry D, home screen -->
<script src="js/strings.js"></script> <!-- 2. String operations module -->
<script src="js/sets.js"></script>    <!-- 3. Set operations and Venn diagram module -->
<script src="js/tree.js"></script>    <!-- 4. Binary Search Tree generation and walk module -->
<script src="js/dfa.js"></script>     <!-- 5. DFA simulator, SVG state graph, and test engine -->
<script src="js/app.js"></script>     <!-- 6. Startup script: calls home() to render the initial screen -->
```

---

## Module Walkthrough & Line-by-Line Code Explanations

---

### 1. `js/core.js` — Foundation, Navigation & Stamps

`core.js` defines shared DOM helpers, global challenge progression state, district definitions, and home view rendering.

#### Global Declarations (Lines 4–17):
```javascript
const $ = s => document.querySelector(s);
```
- **Line 4:** A shorthand selector helper that delegates to `document.querySelector(s)`. Reduces DOM query verbosity throughout all modules.

```javascript
const app = $('#app');
```
- **Line 5:** Caches a reference to the main container element (`<div id="app"></div>`). All district views update this element's `innerHTML`.

```javascript
const esc = s => s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
```
- **Line 6:** An HTML sanitizer function. It uses a regular expression matching `&`, `<`, `>`, and `"`, replacing each matching character with its corresponding HTML entity (`&amp;`, `&lt;`, `&gt;`, `&quot;`). This prevents XSS attacks and rendering artifacts when users enter arbitrary characters.

```javascript
let ST = {};
```
- **Line 9:** The challenge stamp tracking object. When a user completes a district challenge, a key matching that district's identifier (e.g., `ST['str'] = 1`) is recorded here.

```javascript
const D = [
  {id:'str',  n:'String Street', c:'#e0663f', s:'Length, prefix, suffix, concat and reverse, with strings as trains.', f:() => strv()},
  {id:'set',  n:'Set Park',      c:'#1f9d8a', s:'Union, intersection, difference, complement, power set and more on a live Venn diagram.', f:() => setv()},
  {id:'tree', n:'Tree Forest',   c:'#4c8c3a', s:'Walk a random tree in preorder, inorder or postorder, then try it yourself.', f:() => treev()},
  {id:'dfa',  n:'DFA Station',   c:'#6f55e0', s:'Build a DFA, step through a string and flip it into its complement.', f:() => dfav()}
];
```
- **Lines 12–17:** The central registry array `D` containing metadata for the four districts:
  - `id`: Unique identifier key (`'str'`, `'set'`, `'tree'`, `'dfa'`).
  - `n`: Human-readable district title.
  - `c`: Theme color in hex used for border accents on the home screen cards.
  - `s`: Descriptive summary subtitle displayed on each card.
  - `f`: Zero-argument navigation callback function that executes the district's view function (`strv()`, `setv()`, `treev()`, `dfav()`).

---

#### Function: `head(t)`
```javascript
const head = t => `<button onclick="home()">Back to the map</button><h2>${t}</h2>`;
```
- **Line 20:**
  - **Purpose:** Produces the standard top banner HTML for all district views.
  - **Line Breakdown:**
    - `<button onclick="home()">Back to the map</button>`: A button that invokes `home()` to return the user to the city map view.
    - `<h2>${t}</h2>`: An `<h2>` header displaying the passed title string `t`.

---

#### Function: `chal(id, ok, t)`
```javascript
const chal = (id, ok, t) => {
  if (ok) ST[id] = 1;
  const e = $('#ch');
  e.className = 'ch' + (ST[id] ? ' done' : '');
  e.textContent = (ST[id] ? 'Stamp earned. ' : 'Challenge: ') + t;
};
```
- **Lines 23–28:**
  - **Purpose:** Updates the challenge status banner element (`#ch`) on the current screen and records achievement stamps.
  - **Parameters:**
    - `id`: The string ID of the district (`'str'`, `'set'`, `'tree'`, `'dfa'`).
    - `ok`: Boolean indicating whether the challenge completion condition was satisfied during the current evaluation.
    - `t`: The challenge prompt / description text.
  - **Line Breakdown:**
    - **Line 24 (`if (ok) ST[id] = 1;`):** If `ok` is `true`, flags this district as stamped in the global `ST` record.
    - **Line 25 (`const e = $('#ch');`):** Retrieves the DOM element with ID `ch`.
    - **Line 26 (`e.className = 'ch' + (ST[id] ? ' done' : '');`):** Appends CSS class `done` if a stamp has been earned for this district, enabling green styling and borders.
    - **Line 27 (`e.textContent = (ST[id] ? 'Stamp earned. ' : 'Challenge: ') + t;`):** Updates the visible label to either `"Stamp earned. "` or `"Challenge: "` followed by the description `t`.

---

#### Function: `home()`
```javascript
function home() {
  clearInterval(TI); // stop the tree animation if it was running (TI lives in tree.js)
  const n = Object.keys(ST).length;
  app.innerHTML = `<h1>Automata City</h1>
  <p class="mut">Explore four districts and earn a stamp in each by finishing its challenge. Stamps: ${n} of 4.</p>
  <div class="map">${D.map(d => `<button class="dist ${ST[d.id] ? 'st' : ''}" style="--c:${d.c}" onclick="D.find(x=>x.id=='${d.id}').f()"><b>${d.n}</b><span>${d.s}</span><em>${ST[d.id] ? 'Stamped' : 'Not stamped yet'}</em></button>`).join('')}</div>`;
}
```
- **Lines 31–37:**
  - **Purpose:** Renders the main home screen (City Map) showing the four district portals and stamp progress.
  - **Line Breakdown:**
    - **Line 32 (`clearInterval(TI);`):** Clears any active animation timer from the Tree Forest district (`TI` declared in `tree.js`) to prevent memory leaks or background state conflicts when navigating back to the map.
    - **Line 33 (`const n = Object.keys(ST).length;`):** Calculates how many distinct stamps have been earned so far (0 to 4).
    - **Line 34–35:** Writes the main heading and progress text (`Stamps: n of 4`) into `#app`.
    - **Line 36:** Maps over each district object `d` in array `D`, producing a `<button class="dist">`:
      - `${ST[d.id] ? 'st' : ''}`: Adds class `st` if stamped (turns stamp status text green).
      - `style="--c:${d.c}"`: Sets CSS custom property `--c` to the district's accent color for the left border strip.
      - `onclick="D.find(x=>x.id=='${d.id}').f()"`: When clicked, locates the matching district object and executes its view launcher `f()`.
      - `<b>${d.n}</b><span>${d.s}</span><em>...</em>`: Displays the title, description, and stamp status.

---

### 2. `js/app.js` — Bootstrap & Application Start

```javascript
/* app.js: starts the site. Loaded last, after every district file is ready. */
home();
```
- **Line 2 (`home();`):**
  - **Purpose:** Serves as the application entry point. Because `app.js` is loaded after `core.js`, `strings.js`, `sets.js`, `tree.js`, and `dfa.js`, calling `home()` here guarantees that all global variables, event handlers, and district renderers are fully initialized before rendering the initial view.

---

### 3. `js/strings.js` — String Street Playground

`strings.js` implements string manipulation concepts: length $|w|$, prefixes, suffixes, concatenation $wv$, reversal $w^R$, empty string $\varepsilon$, and palindrome checking.

#### Global State (Line 3):
```javascript
let W = 'level', V = 'city', K = 2; // W = string w, V = string v, K = where the cut is
```
- `W`: The primary string $w$.
- `V`: The secondary string $v$ used for concatenation.
- `K`: Integer index indicating where the cut is placed between prefix and suffix (splits $w$ into $w[0..K-1]$ and $w[K..|w|-1]$).

---

#### Function: `strv()`
```javascript
function strv() {
  app.innerHTML = head('String Street') + `<p>A string is a train and each letter is a car. Edit the trains, then slide the cut to split w into a prefix and a suffix.</p>
  <div class="f"><label>w <input id="w" value="${esc(W)}" maxlength="14" oninput="su()"></label><label>v <input id="v" value="${esc(V)}" maxlength="14" oninput="su()"></label></div>
  <div id="trk"></div>
  <label class="f">Cut after letter <input type="range" id="k" min="0" max="${W.length}" value="${K}" oninput="su()"> <b id="kv"></b></label>
  <div id="out"></div><p id="ch"></p>`;
  su();
}
```
- **Lines 5–12:**
  - **Purpose:** Constructs the DOM layout for the String Street view and triggers the initial calculation.
  - **Line Breakdown:**
    - **Line 6:** Injects the header (`head('String Street')`) and district intro paragraph.
    - **Line 7:** Renders two text `<input>` fields: `#w` with current value `W`, and `#v` with current value `V`. Both have `maxlength="14"` and listen to `oninput="su()"`.
    - **Line 8:** Adds `<div id="trk"></div>` as the mount target for the visual train car display.
    - **Line 9:** Renders a range slider `<input type="range" id="k">` with bounds from `0` to `W.length` and initial value `K`, followed by `<b id="kv"></b>` for the numeric cut index.
    - **Line 10:** Adds `<div id="out"></div>` for the results table and `<p id="ch"></p>` for the challenge banner.
    - **Line 11:** Invokes `su()` to compute initial calculations and draw the UI.

---

#### Function: `su()`
```javascript
function su() {
  W = $('#w').value;
  V = $('#v').value;
  const r = $('#k');
  r.max = W.length;
  K = Math.min(+r.value, W.length);

  const a = [...W], b = [...V], n = a.length, rv = [...a].reverse();
  // tr: draw a list of letters as train cars (f = a class name, or a function of the index)
  const tr = (x, f) => x.length ? x.map((c, i) => `<i class="car ${typeof f == 'function' ? f(i) : f}">${esc(c)}</i>`).join('') : '<i class="car e">ε</i>';
  // li: build the comma-separated list of all prefixes or suffixes
  const li = f => [...Array(n + 1).keys()].map(f).join(', ');

  $('#kv').textContent = K;
  $('#trk').innerHTML = `<div class="row">${tr(a, i => i < K ? 'p' : 's')}</div>`;
  $('#out').innerHTML = `<table class="ot">
    <tr><th>Length |w|</th><td>${n}</td></tr>
    <tr><th>Prefix (first ${K})</th><td><div class="row">${tr(a.slice(0, K), 'p')}</div></td></tr>
    <tr><th>Suffix (last ${n - K})</th><td><div class="row">${tr(a.slice(K), 's')}</div></td></tr>
    <tr><th>Concat wv</th><td><div class="row">${[...a.map(c => `<i class="car p">${esc(c)}</i>`), ...b.map(c => `<i class="car s">${esc(c)}</i>`)].join('') || '<i class="car e">ε</i>'}</div>Length ${n + b.length}</td></tr>
    <tr><th>Reverse wᴿ</th><td><div class="row">${tr(rv, 'p')}</div></td></tr>
    <tr><th>All prefixes</th><td>${li(i => esc(a.slice(0, i).join('')) || 'ε')}</td></tr>
    <tr><th>All suffixes</th><td>${li(i => esc(a.slice(i).join('')) || 'ε')}</td></tr></table>`;

  chal('str', n >= 3 && a.join('') == rv.join(''), 'Type a word of 3 or more letters that reads the same reversed (wᴿ = w).');
}
```
- **Lines 15–40:**
  - **Purpose:** Core computation and redraw routine for string operations. Runs on every keystroke or slider movement.
  - **Line Breakdown:**
    - **Line 16–17 (`W = $('#w').value; V = $('#v').value;`):** Reads the current string values from the text inputs.
    - **Line 18–19 (`const r = $('#k'); r.max = W.length;`):** Obtains the slider element and updates its maximum boundary to match current length $|w|$.
    - **Line 20 (`K = Math.min(+r.value, W.length);`):** Parses the slider value as a number (`+r.value`) and clamps it to ensure $K \le |w|$.
    - **Line 22 (`const a = [...W], b = [...V], n = a.length, rv = [...a].reverse();`):**
      - `a`: Array of characters in $W$ (spread operator safely handles Unicode characters).
      - `b`: Array of characters in $V$.
      - `n`: Length $|w|$.
      - `rv`: Array of characters of $w$ reversed.
    - **Line 24 (`const tr = (x, f) => ...`):**
      - Helper function to format an array of characters `x` into train car HTML tags `<i class="car ...">`.
      - If `x` is empty (`x.length == 0`), returns the empty string symbol `<i class="car e">ε</i>`.
      - Otherwise, maps each character `c` at index `i` into `<i class="car ${...}">${esc(c)}</i>`, where the class is determined dynamically by `f(i)` if `f` is a callback, or static string `f` if not.
    - **Line 26 (`const li = f => [...Array(n + 1).keys()].map(f).join(', ');`):**
      - Helper function generating indices `0, 1, ..., n`, mapping each index using transform `f`, and joining with `", "` to generate prefix/suffix lists.
    - **Line 28 (`$('#kv').textContent = K;`):** Updates the visible number next to the cut slider.
    - **Line 29 (`$('#trk').innerHTML = ...`):** Renders the full train for $w$, applying class `'p'` (prefix color, teal) if index $i < K$, or `'s'` (suffix color, coral) if $i \ge K$.
    - **Lines 30–37 (`$('#out').innerHTML = ...`):** Renders the properties table:
      - **Length $|w|$:** Displays `n`.
      - **Prefix:** Characters `a.slice(0, K)` styled with class `'p'`.
      - **Suffix:** Characters `a.slice(K)` styled with class `'s'`.
      - **Concatenation $wv$:** Train cars for $a$ (prefix style) directly followed by train cars for $b$ (suffix style), with total length $n + |b|$.
      - **Reverse $w^R$:** Characters from `rv`.
      - **All prefixes:** Evaluates `a.slice(0, i)` for $0 \le i \le n$. When $i=0$, outputs $\varepsilon$.
      - **All suffixes:** Evaluates `a.slice(i)` for $0 \le i \le n$. When $i=n$, outputs $\varepsilon$.
    - **Line 39 (`chal('str', ...)`):** Tests the palindrome condition: length must be at least 3 (`n >= 3`) and the forward string must equal the reversed string (`a.join('') == rv.join('')`).

---

### 4. `js/sets.js` — Set Park & Venn Diagram Simulator

`sets.js` models finite set operations over a discrete universe $U = \{1, 2, 3, 4, 5, 6, 7, 8\}$ and renders them geometrically onto a two-set Venn diagram.

#### Global State & Constants (Lines 4–20):
```javascript
let A = new Set([1, 2, 3]), B = new Set([3, 4, 5]), OP = 'union';
const U = [1, 2, 3, 4, 5, 6, 7, 8];                 // the universe
const srt = s => [...s].sort((x, y) => x - y);
```
- **Line 4:** Sets $A$ and $B$ stored as native ES6 `Set` instances. `OP` tracks the active operation key (`'union'`).
- **Line 5:** The fixed universe array $U = [1, 2, 3, 4, 5, 6, 7, 8]$.
- **Line 6:** `srt`: Helper that converts an iterable or `Set` `s` into an array and sorts elements in ascending numerical order.

```javascript
const OPS = {
  union: ['Union A ∪ B',                 () => U.filter(x => A.has(x) || B.has(x))],
  inter: ['Intersection A ∩ B',          () => U.filter(x => A.has(x) && B.has(x))],
  diff:  ['Difference A − B',            () => U.filter(x => A.has(x) && !B.has(x))],
  sym:   ['Symmetric difference A Δ B',  () => U.filter(x => A.has(x) != B.has(x))],
  comp:  ['Complement A′',               () => U.filter(x => !A.has(x))],
  pow:   ['Power set P(A)',              () => {
    const a = srt(A);
    return a.length > 4 ? null : a.reduce((s, x) => [...s, ...s.map(t => [...t, x])], [[]]).map(t => '{' + t.join(', ') + '}');
  }],
  cart:  ['Cartesian product A × B',     () => A.size * B.size > 20 ? null : srt(A).flatMap(x => srt(B).map(y => `(${x}, ${y})`))]
};
```
- **Lines 9–20 (`OPS` dictionary):** Maps operation keys to a tuple `[label, computeFunction]`:
  - **`union` (Line 10):** Filters $U$ for elements in $A \lor B$.
  - **`inter` (Line 11):** Filters $U$ for elements in $A \land B$.
  - **`diff` (Line 12):** Filters $U$ for elements in $A \land \neg B$.
  - **`sym` (Line 13):** Symmetric difference: evaluates $A.has(x) \ne B.has(x)$ (elements in exactly one set).
  - **`comp` (Line 14):** Complement $A'$: elements in $U$ not in $A$.
  - **`pow` (Lines 15–18):**
    - Calculates the power set $\mathcal{P}(A)$ using `.reduce()` starting from `[[]]`. For each element $x$, duplicates all existing subsets and appends $x$.
    - Returns `null` if $|A| > 4$ to prevent DOM overload ($2^5 = 32$ subsets).
    - Formats subsets as strings e.g. `"{1, 2}"`.
  - **`cart` (Line 19):**
    - Calculates $A \times B = \{(x, y) \mid x \in A, y \in B\}$ using `.flatMap()`.
    - Returns `null` if $|A| \times |B| > 20$ to maintain UI clarity.

---

#### Function: `tg(n, x)`
```javascript
function tg(n, x) {
  const s = n == 'A' ? A : B;
  s.has(x) ? s.delete(x) : s.add(x);
  setv();
}
```
- **Lines 23–27:**
  - **Purpose:** Toggles membership of element $x$ in set $A$ or set $B$.
  - **Line Breakdown:**
    - **Line 24:** Selects target set `s` based on whether `n == 'A'`.
    - **Line 25:** If `s.has(x)` is true, deletes $x$; otherwise adds $x$.
    - **Line 26:** Re-runs `setv()` to re-render the view with the updated set contents.

---

#### Function: `setv()`
```javascript
function setv() {
  const o = OPS[OP], r = o[1](), el = OP != 'pow' && OP != 'cart', hl = new Set(el ? r : []);

  // Sort the numbers into Venn regions: only A, both, only B, neither
  const reg = {a: [], b: [], ab: [], n: []};
  U.forEach(x => reg[A.has(x) && B.has(x) ? 'ab' : A.has(x) ? 'a' : B.has(x) ? 'b' : 'n'].push(x));
  const pl = (l, cx) => l.map((x, i) => [x, cx + (i % 2 - .5) * 28, 52 + Math.floor(i / 2) * 26]);
  const pts = [...pl(reg.a, 98), ...pl(reg.ab, 170), ...pl(reg.b, 242), ...reg.n.map((x, i) => [x, 24 + i * 34, 190])];
  const eq = (x, y) => x.join() == y.join();

  app.innerHTML = head('Set Park') + `<p>The universe is U = {1, …, 8}. Tap numbers to put them in A or B, then pick an operation.</p>
  ${['A', 'B'].map(n => `<div class="f"><b>${n}</b>${U.map(x => `<button class="chip ${(n == 'A' ? A : B).has(x) ? 'on' : ''}" aria-pressed="${(n == 'A' ? A : B).has(x)}" onclick="tg('${n}',${x})">${x}</button>`).join('')}</div>`).join('')}
  <div class="f">${Object.keys(OPS).map(k => `<button class="${k == OP ? 'pri' : ''}" onclick="OP='${k}';setv()">${OPS[k][0]}</button>`).join('')}</div>
  <svg viewBox="0 0 340 210" width="100%" role="img" aria-label="Venn diagram of A and B"><circle class="vc" cx="130" cy="90" r="70"/><circle class="vc" cx="210" cy="90" r="70"/><text class="lb" x="62" y="28">A</text><text class="lb" x="272" y="28">B</text>${pts.map(([x, cx, cy]) => `<circle class="el ${hl.has(x) ? 'hl' : ''}" cx="${cx}" cy="${cy}" r="11"/><text class="qn" x="${cx}" y="${cy + 4}" text-anchor="middle">${x}</text>`).join('')}</svg>
  <div>${r == null
    ? `<p class="bad">${OP == 'pow' ? 'Keep A to 4 numbers or fewer to list its power set.' : 'Pick fewer numbers so that |A| × |B| is 20 or less.'}</p>`
    : el
      ? `<p><b>${o[0]}</b> = {${r.join(', ')}}</p>`
      : `<p><b>${o[0]}</b>: ${r.length} ${OP == 'pow' ? 'subsets (2<sup>|A|</sup>)' : 'pairs (|A| × |B|)'}</p><div class="f">${r.map(t => `<span class="car p" style="padding:0 8px">${t}</span>`).join('')}</div>`}</div>
  <p id="ch"></p>`;

  chal('set', eq(OPS.sym[1](), [1, 2, 7, 8]) && eq(OPS.inter[1](), [4]), 'Choose A and B so that A Δ B = {1, 2, 7, 8} and A ∩ B = {4}.');
}
```
- **Lines 29–51:**
  - **Purpose:** Renders the interactive Set Park screen, calculating partition regions and plotting numbers on the SVG Venn diagram.
  - **Line Breakdown:**
    - **Line 30:**
      - `o = OPS[OP]`: Retrieves the active operation tuple.
      - `r = o[1]()`: Executes the computation function to get the result list.
      - `el = OP != 'pow' && OP != 'cart'`: Boolean indicating whether the result consists of elements of $U$ (as opposed to compound subsets or ordered pairs).
      - `hl = new Set(el ? r : [])`: Creates a fast-lookup `Set` of numbers to highlight on the Venn diagram.
    - **Line 33–34:** Partitions all numbers in $U$ into four disjoint geometric zones:
      - `'ab'`: in both $A$ and $B$ (intersection region).
      - `'a'`: in $A$ only.
      - `'b'`: in $B$ only.
      - `'n'`: in neither (outside the circles, complement region).
    - **Line 35 (`const pl = ...`):** Helper that assigns 2D coordinates `[value, cx, cy]` to numbers within a circle region, arranging them in a 2-column grid around center x `cx`.
    - **Line 36 (`const pts = ...`):** Collects all element positions:
      - `reg.a` centered at $x = 98$.
      - `reg.ab` centered at $x = 170$ (overlap).
      - `reg.b` centered at $x = 242$.
      - `reg.n` horizontally distributed at the bottom ($y = 190$).
    - **Line 37 (`const eq = (x, y) => x.join() == y.join();`):** Array equality helper by comparing serialized comma-separated strings.
    - **Line 40:** Renders circular chip buttons for 1..8 for both set $A$ and set $B$. The active chips get class `'on'`.
    - **Line 41:** Renders buttons for all operations in `OPS`, highlighting the currently selected operation with class `'pri'`.
    - **Line 42:** Renders the `<svg>`:
      - Two overlapping circles representing sets $A$ and $B$ (`cx="130"` and `cx="210"`, radius 70).
      - Text labels "A" and "B".
      - Element circles and text labels; circles matching numbers in `hl` receive the `.hl` class (blue fill).
    - **Lines 43–47:** Displays the textual result: shows a warning if `r == null`, standard set notation if `el` is true, or formatted subsets/pairs if computing power sets or Cartesian products.
    - **Line 50:** Evaluates the challenge criteria: $A \Delta B = \{1, 2, 7, 8\}$ and $A \cap B = \{4\}$.

---

### 5. `js/tree.js` — Tree Forest & Traversal Walks

`tree.js` implements a randomized Binary Search Tree (BST) and the three classical depth-first tree traversal algorithms: Preorder, Inorder, and Postorder.

#### Global State & Constants (Lines 3–12):
```javascript
let T,            // the current tree
    TO = 'pre',   // chosen traversal: 'pre' | 'in' | 'post'
    TM = 'watch', // mode: 'watch' (animation) or 'turn' (you click)
    TS = [],      // the correct visiting order
    TP = 0,       // how many nodes have been visited so far
    TI,           // animation timer (home() in core.js clears it)
    TG = '';      // feedback message

const NM = {pre: 'Preorder', in: 'Inorder', post: 'Postorder'};
const RL = {pre: 'root, left, right', in: 'left, root, right', post: 'left, right, root'};
```
- `T`: The current BST object containing `{root, md}` (root node and maximum tree depth `md`).
- `TO`: Active traversal algorithm key (`'pre'`, `'in'`, or `'post'`).
- `TM`: Current mode: `'watch'` (automatic animated stepping) or `'turn'` (interactive user clicking).
- `TS`: Array storing the target traversal sequence of node values.
- `TP`: Progress index counter indicating how many nodes have been visited so far.
- `TI`: Timer handle returned by `setInterval` for step animations.
- `TG`: Feedback string shown below the tree (e.g., instructions or validation errors).
- `NM` / `RL`: Dictionaries defining the names and visit rules (e.g., Preorder = "root, left, right").

---

#### Function: `wk(n, o, a = [])`
```javascript
const wk = (n, o, a = []) => {
  if (!n) return a;
  o == 'pre' && a.push(n.v);
  wk(n.l, o, a);
  o == 'in' && a.push(n.v);
  wk(n.r, o, a);
  o == 'post' && a.push(n.v);
  return a;
};
```
- **Lines 15–23:**
  - **Purpose:** Recursive tree walker implementing Preorder, Inorder, and Postorder traversals.
  - **Parameters:**
    - `n`: Current node pointer (`{v: value, l: leftChild, r: rightChild}`).
    - `o`: Traversal order code (`'pre'`, `'in'`, `'post'`).
    - `a`: Accumulator array collecting visited values.
  - **Line Breakdown:**
    - **Line 16 (`if (!n) return a;`):** Base case: if current node is null/undefined, return accumulated array.
    - **Line 17 (`o == 'pre' && a.push(n.v);`):** Preorder: visit root *before* subtrees.
    - **Line 18 (`wk(n.l, o, a);`):** Recurse on left subtree.
    - **Line 19 (`o == 'in' && a.push(n.v);`):** Inorder: visit root *between* left and right subtrees.
    - **Line 20 (`wk(n.r, o, a);`):** Recurse on right subtree.
    - **Line 21 (`o == 'post' && a.push(n.v);`):** Postorder: visit root *after* both subtrees.
    - **Line 22 (`return a;`):** Returns the populated sequence array.

---

#### Function: `mk()`
```javascript
function mk() {
  const v = [];
  while (v.length < 7) {
    const x = 1 + Math.floor(Math.random() * 99);
    if (!v.includes(x)) v.push(x);
  }
  const ins = (n, x) => !n ? {v: x} : (x < n.v ? (n.l = ins(n.l, x), n) : (n.r = ins(n.r, x), n));
  let root = null, i = 0, md = 0;
  v.forEach(x => root = ins(root, x));
  const lay = (n, d) => { if (!n) return; lay(n.l, d + 1); n.x = i++; n.d = d; md = Math.max(md, d); lay(n.r, d + 1); };
  lay(root, 0);
  T = {root, md};
}
```
- **Lines 26–38:**
  - **Purpose:** Generates a random 7-node Binary Search Tree (BST) and calculates 2D geometric coordinates for planar SVG layout.
  - **Line Breakdown:**
    - **Lines 27–31:** Generates an array `v` of 7 unique integers chosen uniformly from $1$ to $99$.
    - **Line 32 (`const ins = ...`):** Standard recursive binary search tree insertion function:
      - If node `n` is empty, creates `{v: x}`.
      - If $x < n.v$, recursively inserts into left child `n.l`.
      - If $x > n.v$, recursively inserts into right child `n.r`.
    - **Line 33 (`let root = null, i = 0, md = 0;`):** Initializes empty root, inorder counter `i`, and maximum depth tracker `md`.
    - **Line 34:** Inserts all 7 random numbers into the tree sequentially.
    - **Line 35 (`const lay = (n, d) => ...`):**
      - Computes tree layout using an **inorder geometric projection**:
      - Visiting nodes in inorder traversal order (`lay(n.l, d + 1)` then `n.x = i++` then `lay(n.r, d + 1)`) guarantees that every node's x-coordinate is strictly greater than all nodes in its left subtree and strictly less than all nodes in its right subtree, preventing overlapping nodes or edge crossings.
      - Stores depth `d` on `n.d` and updates maximum tree depth `md`.
    - **Line 36 (`lay(root, 0);`):** Executes the layout starting at root depth 0.
    - **Line 37 (`T = {root, md};`):** Stores the generated tree and depth into global `T`.

---

#### Function: `treev()`
```javascript
function treev() {
  clearInterval(TI);
  if (!T) mk();
  app.innerHTML = head('Tree Forest') + `<p>Pick a traversal. Watch it walk the tree, or try it yourself by clicking the nodes in the right order.</p>
  <div class="f">${Object.keys(NM).map(k => `<button class="${k == TO ? 'pri' : ''}" onclick="TO='${k}';treev()">${NM[k]}</button>`).join('')}</div>
  <div class="f"><button onclick="wt()">Watch the walk</button><button onclick="yt()">Your turn</button><button onclick="mk();treev()">New tree</button></div>
  <div id="tv"></div><p id="ch"></p>`;
  TS = wk(T.root, TO);
  TP = 0;
  TM = 'watch';
  TG = '';
  trr();
}
```
- **Lines 40–52:**
  - **Purpose:** Initializes and renders the Tree Forest district view.
  - **Line Breakdown:**
    - **Line 41 (`clearInterval(TI);`):** Stops any pending animation interval.
    - **Line 42 (`if (!T) mk();`):** If no tree has been built yet, generates one via `mk()`.
    - **Lines 43–46:** Writes HTML containing traversal selector buttons (Preorder, Inorder, Postorder), control buttons ("Watch the walk", "Your turn", "New tree"), and output containers `#tv` and `#ch`.
    - **Line 47 (`TS = wk(T.root, TO);`):** Pre-computes the full expected traversal visiting sequence using `wk()`.
    - **Lines 48–50:** Resets progress `TP = 0`, switches mode to `'watch'`, clears status message `TG`.
    - **Line 51 (`trr();`):** Draws the SVG tree and status texts.

---

#### Function: `trr()`
```javascript
function trr() {
  const W = 340, H = T.md * 54 + 52, X = i => 24 + i * (W - 48) / 6, Y = d => 26 + d * 54, ns = [];
  const col = n => { if (n) { ns.push(n); col(n.l); col(n.r); } };
  col(T.root);

  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Binary tree">`;
  ns.forEach(n => [n.l, n.r].forEach(c => { if (c) s += `<line class="ed" x1="${X(n.x)}" y1="${Y(n.d)}" x2="${X(c.x)}" y2="${Y(c.d)}"/>`; }));
  ns.forEach(n => {
    const k = TS.indexOf(n.v), seen = k < TP;
    s += `<g class="tn" tabindex="0" role="button" aria-label="Node ${n.v}" onclick="tc(${n.v})" onkeydown="if(event.key=='Enter')tc(${n.v})"><circle class="el ${seen ? 'hl' : ''} ${k == TP - 1 ? 'cur' : ''}" cx="${X(n.x)}" cy="${Y(n.d)}" r="15"/><text class="qn" x="${X(n.x)}" y="${Y(n.d) + 4}" text-anchor="middle">${n.v}</text>${seen ? `<text class="lb" x="${X(n.x) + 14}" y="${Y(n.d) - 12}">${k + 1}</text>` : ''}</g>`;
  });

  $('#tv').innerHTML = s + `</svg><p><b>${NM[TO]}</b> visits ${RL[TO]}.</p><p>Order so far: <b>${TS.slice(0, TP).join(', ') || 'none yet'}</b></p><p class="${/^Not/.test(TG) ? 'bad' : ''}">${TG}</p>`;
  chal('tree', TM == 'turn' && TP == TS.length, 'Press Your turn and click every node in the correct order for the traversal you picked.');
}
```
- **Lines 55–69:**
  - **Purpose:** Renders the SVG tree visualization, including branches, node states, sequence order badges, and traversal breadcrumbs.
  - **Line Breakdown:**
    - **Line 56:**
      - Defines viewport dimensions: width $W = 340$, height $H = md \times 54 + 52$.
      - Coordinate projection functions: `X(i)` maps inorder index $0..6$ horizontally, `Y(d)` maps depth $d$ vertically.
      - `ns`: Flattened array of all node objects.
    - **Lines 57–58 (`col(T.root)`):** Recursively traverses tree and populates array `ns`.
    - **Line 60:** Begins SVG string with accessible roles.
    - **Line 61:** Renders connecting tree branch lines (`<line class="ed">`) between each node $n$ and its existing children $c$.
    - **Lines 62–65:** For each node $n$:
      - Finds its index $k$ in the target sequence `TS`.
      - `seen = k < TP`: True if this node has already been visited.
      - Constructs an interactive `<g>` element with click (`onclick="tc(...)"`) and keyboard accessibility handlers.
      - Applies class `.hl` (blue fill) if `seen` is true, and `.cur` (green outline) if it is the most recently visited node (`k == TP - 1`).
      - Renders the node value text inside the circle.
      - If visited (`seen`), appends a superscript sequence badge showing its 1-indexed order (`${k + 1}`).
    - **Line 67:** Injects the completed SVG alongside traversal explanation texts and feedback string `TG`.
    - **Line 68:** Evaluates the challenge: checks if user is in `'turn'` mode and has successfully visited all nodes (`TP == TS.length`).

---

#### Function: `wt()`
```javascript
function wt() {
  clearInterval(TI);
  TM = 'watch'; TP = 0; TG = '';
  trr();
  TI = setInterval(() => { TP++; trr(); if (TP >= TS.length) clearInterval(TI); }, 800);
}
```
- **Lines 72–77:**
  - **Purpose:** Starts the automated animation for "Watch the walk".
  - **Line Breakdown:**
    - **Line 73:** Clears any existing interval to prevent overlapping timers.
    - **Line 74:** Sets mode to `'watch'`, resets progress `TP = 0`, clears feedback `TG`.
    - **Line 75:** Re-renders tree with 0 nodes visited.
    - **Line 76:** Creates an 800ms timer interval that increments `TP`, re-renders via `trr()`, and calls `clearInterval(TI)` once all nodes in `TS` have been highlighted.

---

#### Function: `yt()`
```javascript
function yt() {
  clearInterval(TI);
  TM = 'turn'; TP = 0;
  TG = `Click the first node to visit in ${NM[TO].toLowerCase()}.`;
  trr();
}
```
- **Lines 80–85:**
  - **Purpose:** Switches to interactive test mode ("Your turn") where the user must click nodes in traversal order.
  - **Line Breakdown:**
    - **Line 81:** Stops any running animation interval.
    - **Line 82:** Sets mode to `'turn'` and resets progress `TP = 0`.
    - **Line 83:** Sets instruction message prompting the user for the first node.
    - **Line 84:** Re-renders the tree view.

---

#### Function: `tc(v)`
```javascript
function tc(v) {
  if (TM != 'turn') { TG = 'Press Your turn first, then click the nodes.'; return trr(); }
  if (TP >= TS.length) return;
  if (v == TS[TP]) { TP++; TG = TP == TS.length ? 'Correct, the whole walk is done!' : 'Correct. Keep going.'; }
  else TG = `Not ${v}. For ${NM[TO].toLowerCase()}, go ${RL[TO]}.`;
  trr();
}
```
- **Lines 88–94:**
  - **Purpose:** Handles node click events during interactive tree traversal.
  - **Parameters:**
    - `v`: The numerical value of the clicked node.
  - **Line Breakdown:**
    - **Line 89:** If not in `'turn'` mode, prompts user to activate "Your turn" mode and refreshes view.
    - **Line 90:** If already completed (`TP >= TS.length`), ignores further clicks.
    - **Line 91:** If clicked value `v` matches the expected next node `TS[TP]`:
      - Advances pointer `TP++`.
      - If all nodes visited, sets congratulatory message; otherwise encourages continuation.
    - **Line 92:** If incorrect: provides hint reminding user of the traversal order rule (`RL[TO]`).
    - **Line 93:** Calls `trr()` to update node colors, order text, and challenge stamp.

---

### 6. `js/dfa.js` — DFA Station Simulator & Automated Verifier

`dfa.js` models a Deterministic Finite Automaton (DFA) defined as a 5-tuple $(Q, \Sigma, \delta, q_0, F)$ over binary alphabet $\Sigma = \{0, 1\}$. It includes an interactive transition table, dynamic SVG state diagram rendering, step-by-step string simulation, and exhaustive test suite verification across all $2^0 + 2^1 + \dots + 2^6 = 127$ binary strings of length $\le 6$.

#### Global State & Goal Specifications (Lines 5–12):
```javascript
const CH = [
  {n: 'Strings that end in 01',    p: s => s.endsWith('01')},
  {n: 'An even number of 1s',      p: s => (s.match(/1/g) || []).length % 2 == 0},
  {n: 'No two 0s in a row',        p: s => !s.includes('00')}
];
```
- **Lines 5–9 (`CH` array):** Defines the three target regular language goals:
  - **Goal 0:** Language $L = \{w \in \{0, 1\}^* \mid w \text{ ends with } 01\}$. Predicate uses `s.endsWith('01')`.
  - **Goal 1:** Language $L = \{w \in \{0, 1\}^* \mid \text{count}_1(w) \equiv 0 \pmod 2\}$. Predicate counts `'1'`s using regex and checks modulo 2.
  - **Goal 2:** Language $L = \{w \in \{0, 1\}^* \mid 00 \text{ is not a substring of } w\}$. Predicate checks `!s.includes('00')`.

```javascript
let X = {n: 3, t: [0, 1, 2, 3, 4].map(() => ({0: 0, 1: 0})), f: new Set(), c: 0};
```
- **Line 12 (`X` state machine configuration):**
  - `n`: Current number of active states (defaults to 3: $q_0, q_1, q_2$).
  - `t`: Transition table $\delta$. An array of 5 state mapping objects where `t[i][symbol]` gives the next state index.
  - `f`: Set of accepting (final) states $F \subseteq Q$.
  - `c`: Index of the selected goal in `CH` (default 0).

---

#### Function: `dfav()`
```javascript
function dfav() {
  const n = X.n, ks = [...Array(n).keys()];
  app.innerHTML = head('DFA Station') + `<p>q0 is the start state. Choose where each symbol leads, tick the accepting states, then test your machine.</p>
  <label class="f">Goal <select onchange="X.c=+this.value;dfav()">${CH.map((c, i) => `<option value="${i}" ${i == X.c ? 'selected' : ''}>${c.n}</option>`).join('')}</select></label>
  <div class="sc"><table><tr><th>δ</th><th>0</th><th>1</th><th>Accept</th></tr>${ks.map(i => `<tr><th>q${i}</th>${[0, 1].map(c => `<td><select aria-label="q${i} on ${c}" onchange="X.t[${i}][${c}]=+this.value;dd()">${ks.map(j => `<option value="${j}" ${X.t[i][c] == j ? 'selected' : ''}>q${j}</option>`).join('')}</select></td>`).join('')}<td><input type="checkbox" aria-label="q${i} accepting" ${X.f.has(i) ? 'checked' : ''} onchange="this.checked?X.f.add(${i}):X.f.delete(${i});dd()"></td></tr>`).join('')}</table></div>
  <button onclick="rs(-1)">Remove state</button><button onclick="rs(1)">Add state</button><button onclick="X.f=new Set(ks.filter(i=>!X.f.has(i)));dfav()">Flip accepting states (complement)</button>
  <div id="sv"></div>
  <div class="f"><label>Try a string <input id="ts" value="1001" maxlength="16" oninput="tr()"></label></div>
  <p id="tr"></p><button class="pri" onclick="rt()">Run all tests</button><p id="msg"></p><p id="ch"></p>`;
  dd();
  tr();
  chal('dfa', false, 'Build a DFA that passes every test for any goal.');
}
```
- **Lines 14–26:**
  - **Purpose:** Renders the DFA Station interface including goal selection, transition table grid, complement action, string test input, and automated test trigger.
  - **Line Breakdown:**
    - **Line 15 (`const n = X.n, ks = [...Array(n).keys()];`):** Generates active state indices array `ks = [0, 1, ..., n-1]`.
    - **Line 16:** Renders header and intro.
    - **Line 17:** Renders `<select>` dropdown for choosing one of the three goals from `CH`.
    - **Line 18:** Renders transition table:
      - Header: $\delta$, input $0$, input $1$, and Accept checkbox.
      - For each state $q_i$: renders two dropdowns allowing selection of target state $\delta(q_i, 0)$ and $\delta(q_i, 1)$, updating `X.t[i][c]` and triggering `dd()`.
      - Renders checkbox for accepting state: updates `X.f` Set and re-renders diagram via `dd()`.
    - **Line 19:**
      - "Remove state" (`rs(-1)`) and "Add state" (`rs(1)`).
      - "Flip accepting states (complement)": Inverts $F$ to $Q \setminus F$ by filtering indices not in `X.f` and re-renders view. This demonstrates the closure property of regular languages under complementation.
    - **Line 20:** Container `<div id="sv"></div>` for SVG state diagram.
    - **Line 21–22:** Input box `#ts` for testing custom strings, step trace output `#tr`, and "Run all tests" button invoking `rt()`.
    - **Lines 23–25:** Draws state diagram (`dd()`), traces string (`tr()`), and initializes challenge status.

---

#### Function: `rs(d)`
```javascript
function rs(d) {
  X.n = Math.max(2, Math.min(5, X.n + d));
  X.t.forEach(r => [0, 1].forEach(c => { if (r[c] >= X.n) r[c] = 0; }));
  X.f = new Set([...X.f].filter(i => i < X.n));
  dfav();
}
```
- **Lines 29–34:**
  - **Purpose:** Adds or removes a state from the machine within bounds $[2, 5]$.
  - **Parameters:**
    - `d`: Delta integer (+1 to add state, -1 to remove state).
  - **Line Breakdown:**
    - **Line 30 (`X.n = Math.max(2, Math.min(5, X.n + d));`):** Updates state count `X.n`, clamping value between 2 and 5.
    - **Line 31:** Sanitizes existing transitions: if any transition points to a state index $\ge X.n$ that was just removed, resets that transition to $q_0$ to prevent out-of-bounds references.
    - **Line 32:** Filters out any accepting state indices $\ge X.n$ from `X.f`.
    - **Line 33:** Re-renders the DFA station view via `dfav()`.

---

#### Function: `dd()`
```javascript
function dd() {
  const n = X.n, W = 340, H = 210, R = 17, ed = {};
  const P = [...Array(n)].map((_, i) => { const a = Math.PI + 2 * Math.PI * i / n; return [W / 2 + 110 * Math.cos(a), H / 2 + 70 * Math.sin(a)]; });
  for (let r = 0; r < n; r++) [0, 1].forEach(c => (ed[r + '>' + X.t[r][c]] ??= []).push(c));

  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="State diagram"><defs><marker id="ah" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8z" class="ar"/></marker></defs>`;
  for (const k in ed) {
    const [a, b] = k.split('>').map(Number), lb = ed[k].join(','), [x, y] = P[a];
    if (a == b) { // loop on the same state
      s += `<path class="ed" d="M${x - 9} ${y - R + 2}C${x - 30} ${y - 55} ${x + 30} ${y - 55} ${x + 9} ${y - R + 2}" marker-end="url(#ah)"/><text class="lb" x="${x}" y="${y - 48}" text-anchor="middle">${lb}</text>`;
    } else {      // curved arrow between two states
      const [u, v] = P[b], d = Math.hypot(u - x, v - y), ux = (u - x) / d, uy = (v - y) / d;
      const cx = (x + u) / 2 - uy * 24, cy = (y + v) / 2 + ux * 24, p1 = [x + ux * R, y + uy * R], p2 = [u - ux * R, v - uy * R];
      s += `<path class="ed" d="M${p1} Q${cx} ${cy} ${p2}" marker-end="url(#ah)"/><text class="lb" x="${.25 * p1[0] + .5 * cx + .25 * p2[0]}" y="${.25 * p1[1] + .5 * cy + .25 * p2[1] - 3}" text-anchor="middle">${lb}</text>`;
    }
  }
  s += `<path class="ed" d="M${P[0][0] - R - 28} ${P[0][1]}L${P[0][0] - R} ${P[0][1]}" marker-end="url(#ah)"/>`; // start arrow
  P.forEach(([x, y], i) => s += `<circle class="nd" cx="${x}" cy="${y}" r="${R}"/>${X.f.has(i) ? `<circle class="nd" cx="${x}" cy="${y}" r="${R - 4}"/>` : ''}<text class="qn" x="${x}" y="${y + 4}" text-anchor="middle">q${i}</text>`);
  $('#sv').innerHTML = s + '</svg>';
  tr();
}
```
- **Lines 37–57:**
  - **Purpose:** Generates the state diagram SVG, rendering states arranged in an ellipse, self-loop transitions, curved transition arrows, arrowhead markers, and accepting double circles.
  - **Line Breakdown:**
    - **Line 38:**
      - Viewport dimensions $W = 340$, $H = 210$, state circle radius $R = 17$.
      - `ed`: Dictionary grouping edge labels by directed pair `"from>to"`.
    - **Line 39 (`const P = ...`):**
      - Computes 2D coordinates for states evenly distributed along an ellipse of horizontal radius 110 and vertical radius 70 centered at $(W/2, H/2)$ using angle $\alpha = \pi + \frac{2\pi i}{n}$.
    - **Line 40:** Groups transitions: if transitions for both 0 and 1 exist between state $r$ and $t$, they are merged into a single edge labeled `"0,1"`.
    - **Line 42:** Declares SVG definitions with arrowhead marker `#ah`.
    - **Lines 43–52 (Transition rendering loop):**
      - **Lines 45–46 (Self-loops $a = b$):** Draws a cubic Bézier curve (`<path d="M... C...">`) looping above the state circle with edge label centered above it.
      - **Lines 47–51 (Inter-state transitions $a \ne b$):**
        - Calculates unit vector $(ux, uy)$ along the line connecting state $a$ and state $b$.
        - Computes perpendicular offset to find quadratic Bézier control point $(cx, cy) = (\frac{x+u}{2} - 24 \cdot uy, \frac{y+v}{2} + 24 \cdot ux)$.
        - Offsets endpoints $p_1$ and $p_2$ by radius $R$ so arrow starts and ends precisely on circle boundaries.
        - Renders quadratic Bézier arc `<path d="M${p1} Q${cx} ${cy} ${p2}" marker-end="url(#ah)"/>`.
        - Calculates curve midpoint via Bézier formula $B(0.5) = 0.25 p_1 + 0.5 c + 0.25 p_2$ to place edge label text.
    - **Line 53:** Draws the initial start state arrow pointing into $q_0$ from the left.
    - **Line 54:** Renders state circles:
      - `<circle class="nd" ... r="${R}">`: Outer state circle.
      - If state $i \in F$ (`X.f.has(i)`): draws a second concentric circle with radius $R - 4$ (standard formal representation for accepting states).
      - Renders state name text `"qi"`.
    - **Line 55–56:** Injects SVG into `#sv` and re-runs string tracer `tr()`.

---

#### Function: `run(s)`
```javascript
const run = s => { let q = 0; for (const c of s) q = X.t[q][c]; return q; };
```
- **Line 60:**
  - **Purpose:** Pure simulation function that evaluates string $s \in \{0, 1\}^*$ through the DFA and returns the final state index $q \in Q$.
  - **Line Breakdown:**
    - Initializes start state $q = 0$ ($q_0$).
    - Iterates sequentially through each symbol $c$ of string $s$.
    - Updates $q = \delta(q, c) =$ `X.t[q][c]`.
    - Returns final state $q$.

---

#### Function: `tr()`
```javascript
function tr() {
  const e = $('#tr');
  if (!e) return;
  const s = $('#ts').value.replace(/[^01]/g, '');
  let q = 0, p = 'q0';
  for (const c of s) { q = X.t[q][c]; p += ` →(${c}) q${q}`; }
  e.textContent = `${p}: ${X.f.has(q) ? 'accepted' : 'rejected'}`;
}
```
- **Lines 63–70:**
  - **Purpose:** Traces input string step-by-step and displays the execution path.
  - **Line Breakdown:**
    - **Line 64–65:** Finds container `#tr`. If not currently in DOM, returns early.
    - **Line 66:** Reads input from `#ts` and strips any non-binary characters via regex `.replace(/[^01]/g, '')`.
    - **Line 67:** Initializes start state $q = 0$ and path string $p = \text{'q0'}$.
    - **Line 68:** Iterates over each binary digit $c$, appending transition step e.g. `" →(1) q2"`.
    - **Line 69:** Appends final verdict: `"accepted"` if $q \in F$, otherwise `"rejected"`.

---

#### Function: `rt()`
```javascript
function rt() {
  let all = [''];
  for (let k = 0; k < 6; k++) all.push(...all.filter(s => s.length == k).flatMap(s => [s + '0', s + '1']));
  const g = CH[X.c].p, bad = all.filter(s => X.f.has(run(s)) != g(s));
  $('#msg').className = bad.length ? 'bad' : 'ok';
  $('#msg').textContent = bad.length
    ? `${bad.length} of ${all.length} test strings failed. For example: ${bad.slice(0, 3).map(s => `"${s || 'ε'}" should be ${g(s) ? 'accepted' : 'rejected'}`).join('; ')}.`
    : `All ${all.length} test strings pass.`;
  chal('dfa', !bad.length, 'Build a DFA that passes every test for any goal.');
}
```
- **Lines 73–82:**
  - **Purpose:** Automated verification test engine. Generates all 127 binary strings of length 0 through 6 and validates the DFA against the formal language specification.
  - **Line Breakdown:**
    - **Line 74:** Seeds array `all` with the empty string $\varepsilon$ (`['']`).
    - **Line 75:** Generates all binary strings up to length 6:
      - Loops for $k = 0, \dots, 5$.
      - Takes strings of length $k$ and branches each into two new strings: $s + '0'$ and $s + '1'$.
      - Total strings generated: $2^0 + 2^1 + 2^2 + 2^3 + 2^4 + 2^5 + 2^6 = 1 + 2 + 4 + 8 + 16 + 32 + 64 = 127$.
    - **Line 76:**
      - `g = CH[X.c].p`: Retrieves goal predicate function.
      - `bad = all.filter(...)`: Filters for failing strings where DFA result (`X.f.has(run(s))`) does not match formal specification (`g(s)`).
    - **Line 77:** Sets feedback container class to `'bad'` (red) if failures exist, or `'ok'` (green) if all pass.
    - **Lines 78–80:** Formats summary text:
      - If failures exist: displays failure count and up to 3 concrete counterexamples (substituting $\varepsilon$ for empty string).
      - If no failures: displays `"All 127 test strings pass."`.
    - **Line 81:** Awards district stamp if `bad.length == 0`.

---

## HTML Structure & CSS Design System

### `index.html`
- **DOCTYPE & Viewport Setup (Lines 1–9):** Declares HTML5 document with `utf-8` encoding and responsive `viewport-fit=cover` settings for mobile screen compatibility.
- **Mount Container (Line 11):** `<div id="app"></div>` acts as the root node into which views are rendered dynamically by JavaScript.
- **Script Sequencing (Lines 14–19):** Loads modules in order of dependency (`core.js` -> `strings.js` -> `sets.js` -> `tree.js` -> `dfa.js` -> `app.js`).

---

### `css/style.css` — Exhaustive CSS Class & Selector Directory

Below is the complete dictionary explaining what every CSS class, variable, and selector does in `style.css`:

#### 1. CSS Custom Properties (Theme Design Tokens)
- `:root`: Declares default light-theme palette variables:
  - `--bg` (`#eef5fa`): Light ice-blue background for the entire page.
  - `--card` (`#fff`): Pure white surface background for cards, tables, inputs, and SVG canvases.
  - `--ink` (`#16222e`): Deep navy-black body text color for high contrast readability.
  - `--mut` (`#5a6b7a`): Muted slate gray for secondary labels, descriptions, and arrow connectors.
  - `--ln` (`#cfdbe6`): Soft gray-blue border line color for tables, inputs, and card dividers.
  - `--ac` (`#2f5fd0`): Royal blue primary accent color for active buttons, highlights, and Venn circles.
  - `--onac` (`#fff`): Text color on accent backgrounds (pure white).
  - `--ok` (`#0d7a52`): Deep emerald green for passing tests, completed stamps, and active tree nodes.
  - `--bad` (`#c93434`): Crimson red for error messages, hints, and failed test cases.
  - `--pa` (`#127a6b`): Teal green for prefix train wagons and set element highlights.
  - `--sa` (`#c4492a`): Burnt orange/coral for suffix train wagons and diagram edge text.
  - `--oncar` (`#fff`): Text color inside train wagons.
- `@media(prefers-color-scheme:dark)` & `:root[data-theme="dark"]`:
  - Automatically switches all tokens to modern dark-mode equivalents (deep obsidian backgrounds, bright readable pastels for text and indicators).

#### 2. Base & Layout Selectors
- `*`: Enforces `box-sizing: border-box` across all elements so padding and borders are included in total width and height.
- `body`: Resets margin to 0, sets system font family (`system-ui, sans-serif`), font size to 16px, line height to 1.55, and applies `--bg` and `--ink`.
- `#app`: Centers the main container, bounds max width to `720px`, and adds responsive padding (`18px 16px 40px`).
- `h1, h2`: Traditional serif typography (`Georgia, serif`) with balanced margins for clear hierarchy.
- `.mut`: Applies `--mut` color for secondary, subtle descriptive text.
- `.bad`: Applies `--bad` crimson red text color for error feedback and test failures.
- `.ok`: Applies `--ok` green text color for successful test confirmations.
- `.f`: Flexbox utility container (`display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin: 8px 0;`). Used for grouping buttons, chips, and input fields neatly.

#### 3. Interactive Controls
- `button, select`: Rounded modern controls with card backgrounds, subtle borders, and smooth pointer cursors.
- `button:focus-visible, input:focus-visible, select:focus-visible, .tn:focus-visible`: High-visibility 3px blue outline with 2px offset for keyboard accessibility (WCAG compliant).
- `.pri`: Primary button styling (`background: var(--ac); color: var(--onac); border-color: var(--ac)`). Highlights selected operation tabs or primary action triggers.
- `.chip`: Circular button (`width: 40px; height: 40px; border-radius: 50%`) representing numbers 1 through 8 in Set Park.
- `.chip.on`: Active chip state indicating that number is currently in set $A$ or set $B$ (turns blue with white text).
- `input:not([type])`: Clean text input styling for strings $w$, $v$, and DFA test strings.

#### 4. Home Screen City Map
- `.map`: CSS Grid layout (`grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px;`) that arranges district cards in a clean, responsive grid.
- `.dist`: Individual district card button. Has a thick, color-coded left border (`border-left: 12px solid var(--c)`) unique to each district, rounded corners, and column alignment.
- `.dist em`: Status label at the bottom of the card (`"Not stamped yet"` or `"Stamped"`).
- `.dist.st em`: Stamped district card status; shifts text color to `--ok` green with bold font weight.

#### 5. Challenge Banner
- `.ch`: Dashed rectangular card (`border: 2px dashed var(--ln)`) displaying district challenge instructions.
- `.ch.done`: Challenge completed state; transitions border to solid `--ok` green with bold text.

#### 6. String Street (Train Visuals)
- `.row`: Flex container displaying train wagons horizontally in a continuous sequence.
- `.car`: A single train wagon element (`<i class="car">`). Uses bold Georgia serif lettering, rounded edges, centered letter alignment, and fixed height (34px).
- `.car.p`: Prefix wagon styled in teal green (`--pa`).
- `.car.s`: Suffix wagon styled in coral orange (`--sa`).
- `.car.e`: Empty string wagon ($\varepsilon$) styled in subtle border gray (`--ln`).

#### 7. Tables
- `table`: Full-width data table with collapsed borders.
- `th, td`: Clean padding (6px 8px) with subtle gridlines.
- `.ot`: Output properties table (`background: var(--card)`).
- `.ot th, .ot td`: Left-aligned headers and cells with vertically centered alignment.
- `.sc`: Horizontal scroll wrapper with rounded borders (`overflow-x: auto`) ensuring transition tables never overflow mobile screens.

#### 8. SVG Visualizations (Venn Diagram, Tree, DFA)
- `svg`: Rounded card canvas with 1px border.
- `.vc`: Venn circle styling with semi-transparent fill (`color-mix(in srgb, var(--ac) 14%, transparent)`) and royal blue perimeter outline.
- `.el, .nd`: SVG element circle / state node base styling (white fill, dark ink border).
- `.el.hl`: Highlighted element or visited tree node (solid blue fill `--ac`).
- `.el.cur`: Current active tree node being visited (prominent 4px green border `--ok`).
- `.el.hl + .qn`: Text number inside a highlighted circle (switches fill to pure white `--onac`).
- `.qn`: Numerical node label text styled in sans-serif with vertical alignment.
- `.ed`: Connecting edges (tree branches and DFA transition arrows) styled in subtle gray-blue with 1.5px stroke width.
- `.ar`: Arrowhead polygon marker fill for DFA transitions.
- `.lb`: Transition edge label text and tree sequence number badges styled in bold coral orange (`--sa`).
- `.tn`: Tree node SVG group `<g class="tn">` with `cursor: pointer` for interactive clicking.

#### 9. Accessibility
- `@media(prefers-reduced-motion: reduce)`: Disables transitions and animations for users with motion sensitivity.

---

## Defense & Presentation Guide: How to Explain This Project to Professors

When presenting or answering questions during your project defense, use this structured explanation formula:

### 1. High-Level Summary
> *"Automata City is an interactive educational web platform built to demonstrate four fundamental pillars of Automata Theory and Formal Languages: Formal String Operations, Set Theory over a discrete universe, Binary Search Tree traversals, and Deterministic Finite Automata (DFA) state machines. It requires zero libraries or frameworks and is built completely in pure ES6 JavaScript, HTML5, and vector SVG."*

### 2. Architecture & Design Pattern
> *"Rather than relying on bulky external dependencies or heavy frontend frameworks, the system uses a reactive vanilla single-page architecture. All screens mount dynamically into a single root `<div id="app"></div>`. When the user triggers an event—such as typing a character, moving a cut slider, toggling a set element, or modifying a transition table—the corresponding district function re-evaluates the mathematical models and immediately redraws the DOM and SVG coordinates."*

### 3. District-by-District Defense Points
- **String Street:**
  > *"We visualize strings formally as trains of lettered wagons over an alphabet $\Sigma$. Slicing at position $k$ decomposes $w$ into prefix $w[0..k-1]$ and suffix $w[k..|w|-1]$. We also demonstrate string concatenation $wv$, string reversal $w^R$, the empty string $\varepsilon$, and the palindrome condition $w = w^R$."*
- **Set Park:**
  > *"We model a universe $U = \{1..8\}$ using JavaScript Sets. We compute union, intersection, relative difference, symmetric difference, and absolute complement. To visualize this geometrically, our algorithm calculates the Venn partition region for every number and projects each element to precise 2D coordinates inside or outside the SVG circles."*
- **Tree Forest:**
  > *"We dynamically construct a Binary Search Tree from 7 unique random keys. Using recursion, we demonstrate the three canonical depth-first tree traversals: Preorder ($NLR$), Inorder ($LNR$), and Postorder ($LRN$). The layout uses an inorder geometric projection, guaranteeing that horizontal coordinates never collide or cross. Users can watch an animated walk or test their knowledge in interactive quiz mode."*
- **DFA Station:**
  > *"We implement the formal 5-tuple $M = (Q, \Sigma, \delta, q_0, F)$ over binary alphabet $\{0, 1\}$. Users can configure 2 to 5 states, modify transition matrix $\delta$, toggle accepting states $F$, and invert the machine into its complement $\overline{M} = (Q, \Sigma, \delta, q_0, Q \setminus F)$. Furthermore, we built an automated validation engine that generates all 127 binary strings of length 0 to 6 and checks the DFA's output against the regular language specification."*

---

## Summary of Theoretical Computer Science Concepts Implemented

| Topic | Computer Science / Mathematical Concept | Implementation Detail |
|---|---|---|
| **Alphabets & Strings** | String operations over alphabet $\Sigma$ | Length $|w|$, prefixes, suffixes, concatenation $wv$, string reversal $w^R$, empty string $\varepsilon$, and palindromes ($w = w^R$). |
| **Set Theory** | Set algebra over universe $U = \{1..8\}$ | Union $A \cup B$, intersection $A \cap B$, relative complement $A \setminus B$, symmetric difference $A \Delta B$, absolute complement $A'$, power set $\mathcal{P}(A)$ with cardinality $2^{\|A\|}$, Cartesian product $A \times B$. |
| **Data Structures** | Binary Search Trees & Tree Traversals | Dynamic random BST generation with coordinate assignment; recursive implementations of Preorder ($NLR$), Inorder ($LNR$), and Postorder ($LRN$). |
| **Automata Theory** | Deterministic Finite Automata (DFA) | 5-tuple $(Q, \Sigma, \delta, q_0, F)$ simulation, state transition table, language complementation via final state flipping, and automated property verification over $\Sigma^{\le 6}$. |

