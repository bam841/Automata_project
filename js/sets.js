/* sets.js: Set Park. Union, intersection, difference, symmetric difference,
   complement, power set and Cartesian product on a Venn diagram. */

let A = new Set([1, 2, 3]), B = new Set([3, 4, 5]), OP = 'union';
const U = [1, 2, 3, 4, 5, 6, 7, 8];                 // the universe
const srt = s => [...s].sort((x, y) => x - y);

/* Each operation: [label, function that returns the result]. null means "too big to list". */
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

/* Add or remove number x from set n ('A' or 'B'). */
function tg(n, x) {
  const s = n == 'A' ? A : B;
  s.has(x) ? s.delete(x) : s.add(x);
  setv();
}

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
