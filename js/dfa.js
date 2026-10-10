/* dfa.js: DFA Station. Build a DFA, step a string through it, flip it to its complement,
   and test it against a goal on every string up to length 6. */

/* The goals you can pick. p(s) says whether string s should be accepted. */
const CH = [
  {n: 'Strings that end in 01',    p: s => s.endsWith('01')},
  {n: 'An even number of 1s',      p: s => (s.match(/1/g) || []).length % 2 == 0},
  {n: 'No two 0s in a row',        p: s => !s.includes('00')}
];

/* The machine: n states, t[state][symbol] = next state, f = accepting states, c = chosen goal. */
let X = {n: 3, t: [0, 1, 2, 3, 4].map(() => ({0: 0, 1: 0})), f: new Set(), c: 0};

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

/* Add (d = 1) or remove (d = -1) a state, between 2 and 5 states. */
function rs(d) {
  X.n = Math.max(2, Math.min(5, X.n + d));
  X.t.forEach(r => [0, 1].forEach(c => { if (r[c] >= X.n) r[c] = 0; }));
  X.f = new Set([...X.f].filter(i => i < X.n));
  dfav();
}

/* Draws the state diagram. */
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

/* Runs string s through the machine and returns the final state. */
const run = s => { let q = 0; for (const c of s) q = X.t[q][c]; return q; };

/* Shows the step-by-step path for the string in the "Try a string" box. */
function tr() {
  const e = $('#tr');
  if (!e) return;
  const s = $('#ts').value.replace(/[^01]/g, '');
  let q = 0, p = 'q0';
  for (const c of s) { q = X.t[q][c]; p += ` →(${c}) q${q}`; }
  e.textContent = `${p}: ${X.f.has(q) ? 'accepted' : 'rejected'}`;
}

/* Tests the machine against the chosen goal on every string up to length 6. */
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
