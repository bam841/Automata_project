/* sets.js: Set Park. Union, intersection, difference, symmetric difference,
   complement, power set and Cartesian product on a Venn diagram. */

// Global set instances and active operation state:
// A: primary set containing active numbers (default {1, 2, 3})
// B: secondary set containing active numbers (default {3, 4, 5})
// OP: currently selected set operation key (default 'union')
let A = new Set([1, 2, 3]), B = new Set([3, 4, 5]), OP = 'union';

// The fixed universal set U containing integers 1 through 8
const U = [1, 2, 3, 4, 5, 6, 7, 8];

// Helper to convert any Set or iterable `s` into an array sorted in ascending numerical order
const srt = s => [...s].sort((x, y) => x - y);

/* Each operation in OPS maps a key to a 2-element tuple:
   [0] Human-readable operation label
   [1] Function computing the mathematical result from universe U, A, and B. Returns null if result is too large to render safely. */
const OPS = {
  // Union (A ∪ B): All elements belonging to A, B, or both
  union: ['Union A ∪ B',                 () => U.filter(x => A.has(x) || B.has(x))],

  // Intersection (A ∩ B): Only elements present in both A and B simultaneously
  inter: ['Intersection A ∩ B',          () => U.filter(x => A.has(x) && B.has(x))],

  // Difference (A − B): Elements belonging to A that are NOT in B
  diff:  ['Difference A − B',            () => U.filter(x => A.has(x) && !B.has(x))],

  // Symmetric Difference (A Δ B): Elements belonging to either A or B, but not both
  sym:   ['Symmetric difference A Δ B',  () => U.filter(x => A.has(x) != B.has(x))],

  // Complement (A′): Elements in the universe U that are NOT in set A
  comp:  ['Complement A′',               () => U.filter(x => !A.has(x))],

  // Power set P(A): The set of all 2^|A| subsets of A
  pow:   ['Power set P(A)',              () => {
    // Sort elements of A for consistent subset ordering
    const a = srt(A);
    // Limit to |A| <= 4 (max 16 subsets) to avoid flooding the DOM interface; return null if larger
    return a.length > 4 ? null : a.reduce((s, x) => [...s, ...s.map(t => [...t, x])], [[]]).map(t => '{' + t.join(', ') + '}');
  }],

  // Cartesian product (A × B): The set of all ordered pairs (x, y) where x ∈ A and y ∈ B
  cart:  ['Cartesian product A × B',     () => A.size * B.size > 20 ? null : srt(A).flatMap(x => srt(B).map(y => `(${x}, ${y})`))]
};

/* Add or remove number x from set n ('A' or 'B'). */
function tg(n, x) {
  // Select the appropriate Set instance based on whether caller passed 'A' or 'B'
  const s = n == 'A' ? A : B;
  // If set already contains x, remove it via delete(); otherwise insert it via add()
  s.has(x) ? s.delete(x) : s.add(x);
  // Re-run the Set Park view function to recalculate operations and redraw diagram
  setv();
}

// Renders the Set Park interactive playground and SVG Venn diagram
function setv() {
  // Retrieve the active operation descriptor tuple [label, computeFn]
  const o = OPS[OP];
  // Calculate the operation's mathematical result array
  const r = o[1]();
  // Boolean flag: true if result contains individual numbers in U (false for power sets & Cartesian pairs)
  const el = OP != 'pow' && OP != 'cart';
  // Fast-lookup Set of numbers to highlight with colored circles in the Venn diagram
  const hl = new Set(el ? r : []);

  // Partition all numbers in universe U into the four mutually exclusive Venn regions:
  // - 'a': numbers strictly in A only
  // - 'b': numbers strictly in B only
  // - 'ab': numbers in the intersection (both A and B)
  // - 'n': numbers outside both circles (neither A nor B)
  const reg = {a: [], b: [], ab: [], n: []};
  // Classify each number in U according to its set memberships
  U.forEach(x => reg[A.has(x) && B.has(x) ? 'ab' : A.has(x) ? 'a' : B.has(x) ? 'b' : 'n'].push(x));

  // Helper pl(l, cx): maps a list of numbers into SVG (x, y) coordinates within a circle region
  // Distributes numbers in a 2-column grid around horizontal center cx
  const pl = (l, cx) => l.map((x, i) => [x, cx + (i % 2 - .5) * 28, 52 + Math.floor(i / 2) * 26]);

  // Combine coordinate mappings:
  // - Region A placed around cx = 98
  // - Overlap region AB placed around cx = 170
  // - Region B placed around cx = 242
  // - Outside region N placed in a row at bottom (y = 190)
  const pts = [...pl(reg.a, 98), ...pl(reg.ab, 170), ...pl(reg.b, 242), ...reg.n.map((x, i) => [x, 24 + i * 34, 190])];

  // Helper to compare two arrays for equality by serializing them to comma-separated strings
  const eq = (x, y) => x.join() == y.join();

  // Construct view HTML:
  // - Back button & header
  // - Chip buttons for sets A and B allowing user to toggle numbers 1..8
  // - Buttons for selecting the active set operation
  // - SVG Venn diagram with circles for A and B and plotted number chips
  // - Text results block showing computed sets, power set list, or Cartesian pairs
  // - Challenge status banner
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

  // Evaluate challenge:
  // User earns stamp 'set' when A Δ B equals {1, 2, 7, 8} AND A ∩ B equals {4}
  chal('set', eq(OPS.sym[1](), [1, 2, 7, 8]) && eq(OPS.inter[1](), [4]), 'Choose A and B so that A Δ B = {1, 2, 7, 8} and A ∩ B = {4}.');
}
