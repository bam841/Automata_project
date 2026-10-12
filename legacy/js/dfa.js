/* dfa.js: DFA Station. Build a DFA, step a string through it, flip it to its complement,
   and test it against a goal on every string up to length 6. */

/* The goals you can pick. Predicate p(s) returns true if binary string s should be accepted by the language. */
const CH = [
  // Goal 0: Language of strings ending in substring "01"
  {n: 'Strings that end in 01',    p: s => s.endsWith('01')},

  // Goal 1: Language of strings with an even number of '1' symbols (modulo 2 == 0)
  {n: 'An even number of 1s',      p: s => (s.match(/1/g) || []).length % 2 == 0},

  // Goal 2: Language of strings avoiding consecutive zeros (no "00" substring)
  {n: 'No two 0s in a row',        p: s => !s.includes('00')}
];

/* The machine configuration object:
   - n: number of states in the DFA (default 3: q0, q1, q2)
   - t: transition table array where t[state][symbol] gives the target state index
   - f: Set storing accepting (final) state indices
   - c: selected goal index in CH (default 0) */
let X = {n: 3, t: [0, 1, 2, 3, 4].map(() => ({0: 0, 1: 0})), f: new Set(), c: 0};

// Renders the DFA Station view
function dfav() {
  // Read current number of states n
  const n = X.n;
  // Create an array of active state indices [0, 1, ..., n-1]
  const ks = [...Array(n).keys()];

  // Build screen HTML:
  // - District header
  // - Goal selection dropdown
  // - Transition table with input dropdowns for symbol 0 and 1, plus accepting checkboxes
  // - State management buttons ("Remove state", "Add state", "Flip accepting states")
  // - SVG state diagram container #sv
  // - Custom string tester with path output #tr
  // - "Run all tests" button and feedback message container #msg
  // - Challenge status banner #ch
  app.innerHTML = head('DFA Station') + `<p>q0 is the start state. Choose where each symbol leads, tick the accepting states, then test your machine.</p>
  <label class="f">Goal <select onchange="X.c=+this.value;dfav()">${CH.map((c, i) => `<option value="${i}" ${i == X.c ? 'selected' : ''}>${c.n}</option>`).join('')}</select></label>
  <div class="sc"><table><tr><th>δ</th><th>0</th><th>1</th><th>Accept</th></tr>${ks.map(i => `<tr><th>q${i}</th>${[0, 1].map(c => `<td><select aria-label="q${i} on ${c}" onchange="X.t[${i}][${c}]=+this.value;dd()">${ks.map(j => `<option value="${j}" ${X.t[i][c] == j ? 'selected' : ''}>q${j}</option>`).join('')}</select></td>`).join('')}<td><input type="checkbox" aria-label="q${i} accepting" ${X.f.has(i) ? 'checked' : ''} onchange="this.checked?X.f.add(${i}):X.f.delete(${i});dd()"></td></tr>`).join('')}</table></div>
  <button onclick="rs(-1)">Remove state</button><button onclick="rs(1)">Add state</button><button onclick="X.f=new Set(ks.filter(i=>!X.f.has(i)));dfav()">Flip accepting states (complement)</button>
  <div id="sv"></div>
  <div class="f"><label>Try a string <input id="ts" value="1001" maxlength="16" oninput="tr()"></label></div>
  <p id="tr"></p><button class="pri" onclick="rt()">Run all tests</button><p id="msg"></p><p id="ch"></p>`;

  // Draw the SVG state diagram
  dd();
  // Trace the sample string through the machine
  tr();
  // Initialize challenge status
  chal('dfa', false, 'Build a DFA that passes every test for any goal.');
}

/* Add (d = 1) or remove (d = -1) a state, bounded between 2 and 5 states. */
function rs(d) {
  // Update state count, keeping it clamped within [2, 5]
  X.n = Math.max(2, Math.min(5, X.n + d));

  // Sanitize transitions: if any transition pointed to a removed state index >= X.n, redirect it to q0
  X.t.forEach(r => [0, 1].forEach(c => { if (r[c] >= X.n) r[c] = 0; }));

  // Remove any deleted states from the accepting set
  X.f = new Set([...X.f].filter(i => i < X.n));

  // Re-render the DFA view
  dfav();
}

/* Draws the SVG state diagram representing the DFA. */
function dd() {
  // Number of states, viewport dimensions W x H, node radius R, and directed edge mapping dictionary ed
  const n = X.n, W = 340, H = 210, R = 17, ed = {};

  // Compute 2D coordinates (x, y) for states arranged in an ellipse centered at (W/2, H/2)
  // Angle a spaces states evenly around circle
  const P = [...Array(n)].map((_, i) => { const a = Math.PI + 2 * Math.PI * i / n; return [W / 2 + 110 * Math.cos(a), H / 2 + 70 * Math.sin(a)]; });

  // Group transitions: if transitions for symbols 0 and 1 go between the same state pair, combine them under one label
  for (let r = 0; r < n; r++) [0, 1].forEach(c => (ed[r + '>' + X.t[r][c]] ??= []).push(c));

  // Start SVG string with arrowhead marker definition #ah
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="State diagram"><defs><marker id="ah" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8z" class="ar"/></marker></defs>`;

  // Draw transition arrows
  for (const k in ed) {
    // Unpack source state a, target state b, comma-joined symbol label lb ('0', '1', or '0,1'), and origin coordinates [x, y]
    const [a, b] = k.split('>').map(Number), lb = ed[k].join(','), [x, y] = P[a];

    if (a == b) {
      // Self-loop on state a: draw a cubic Bézier loop curving upward above the state
      s += `<path class="ed" d="M${x - 9} ${y - R + 2}C${x - 30} ${y - 55} ${x + 30} ${y - 55} ${x + 9} ${y - R + 2}" marker-end="url(#ah)"/><text class="lb" x="${x}" y="${y - 48}" text-anchor="middle">${lb}</text>`;
    } else {
      // Transition between different states a and b:
      // Compute Euclidean distance d and unit direction vector (ux, uy)
      const [u, v] = P[b], d = Math.hypot(u - x, v - y), ux = (u - x) / d, uy = (v - y) / d;
      // Compute perpendicular offset control point (cx, cy) to bend the arrow curve
      const cx = (x + u) / 2 - uy * 24, cy = (y + v) / 2 + ux * 24;
      // Compute start point p1 and endpoint p2 trimmed by node radius R so arrows touch circle perimeters
      const p1 = [x + ux * R, y + uy * R], p2 = [u - ux * R, v - uy * R];
      // Draw curved quadratic Bézier path with arrowhead marker
      s += `<path class="ed" d="M${p1} Q${cx} ${cy} ${p2}" marker-end="url(#ah)"/>`;
      // Position label text along the apex of the quadratic Bézier curve
      s += `<text class="lb" x="${.25 * p1[0] + .5 * cx + .25 * p2[0]}" y="${.25 * p1[1] + .5 * cy + .25 * p2[1] - 3}" text-anchor="middle">${lb}</text>`;
    }
  }

  // Draw initial state incoming indicator arrow pointing to q0 from the left
  s += `<path class="ed" d="M${P[0][0] - R - 28} ${P[0][1]}L${P[0][0] - R} ${P[0][1]}" marker-end="url(#ah)"/>`;

  // Draw state circles:
  // - Outer circle with radius R
  // - If state i is an accepting state (X.f.has(i)), draw an inner concentric circle with radius R - 4 (formal DFA double circle)
  // - State label text 'qi' centered inside circle
  P.forEach(([x, y], i) => s += `<circle class="nd" cx="${x}" cy="${y}" r="${R}"/>${X.f.has(i) ? `<circle class="nd" cx="${x}" cy="${y}" r="${R - 4}"/>` : ''}<text class="qn" x="${x}" y="${y + 4}" text-anchor="middle">q${i}</text>`);

  // Mount SVG string into #sv
  $('#sv').innerHTML = s + '</svg>';

  // Re-run string tracer to update path text
  tr();
}

/* Runs string s through the machine and returns the final state index. */
const run = s => {
  // Start machine execution in state q0 (index 0)
  let q = 0;
  // Transition state-by-state for every character in string s
  for (const c of s) q = X.t[q][c];
  // Return final resting state
  return q;
};

/* Shows the step-by-step path for the string in the "Try a string" box. */
function tr() {
  // Find container element #tr
  const e = $('#tr');
  // Return if element is not in DOM
  if (!e) return;

  // Read string input and sanitize by removing any characters other than 0 and 1
  const s = $('#ts').value.replace(/[^01]/g, '');

  // Track state progress starting at q0
  let q = 0, p = 'q0';

  // For each symbol, transition machine and append formatted arrow step to trace string p
  for (const c of s) { q = X.t[q][c]; p += ` →(${c}) q${q}`; }

  // Output trace string and whether final state q is in accepting set X.f ('accepted' or 'rejected')
  e.textContent = `${p}: ${X.f.has(q) ? 'accepted' : 'rejected'}`;
}

/* Tests the machine against the chosen goal on every binary string up to length 6 (127 total strings). */
function rt() {
  // Initialize test string set with empty string ε
  let all = [''];

  // Iteratively generate all binary strings of length 1, 2, 3, 4, 5, and 6
  // (Total strings = 1 + 2 + 4 + 8 + 16 + 32 + 64 = 127)
  for (let k = 0; k < 6; k++) all.push(...all.filter(s => s.length == k).flatMap(s => [s + '0', s + '1']));

  // Retrieve the mathematical predicate function for the currently chosen goal
  const g = CH[X.c].p;

  // Filter test strings for failures where DFA acceptance (X.f.has(run(s))) does not match goal truth (g(s))
  const bad = all.filter(s => X.f.has(run(s)) != g(s));

  // Style message in green ('ok') if all pass, or red ('bad') if any failed
  $('#msg').className = bad.length ? 'bad' : 'ok';

  // Output test results summary:
  // If failures exist: show count of failed strings and up to 3 concrete counterexamples
  // If no failures: show "All 127 test strings pass."
  $('#msg').textContent = bad.length
    ? `${bad.length} of ${all.length} test strings failed. For example: ${bad.slice(0, 3).map(s => `"${s || 'ε'}" should be ${g(s) ? 'accepted' : 'rejected'}`).join('; ')}.`
    : `All ${all.length} test strings pass.`;

  // Award stamp 'dfa' if all test strings pass (!bad.length is true)
  chal('dfa', !bad.length, 'Build a DFA that passes every test for any goal.');
}
