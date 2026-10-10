/* tree.js: Tree Forest. Preorder, inorder and postorder on a random binary tree. */

let T,            // the current tree
    TO = 'pre',   // chosen traversal: 'pre' | 'in' | 'post'
    TM = 'watch', // mode: 'watch' (animation) or 'turn' (you click)
    TS = [],      // the correct visiting order
    TP = 0,       // how many nodes have been visited so far
    TI,           // animation timer (home() in core.js clears it)
    TG = '';      // feedback message

const NM = {pre: 'Preorder', in: 'Inorder', post: 'Postorder'};
const RL = {pre: 'root, left, right', in: 'left, root, right', post: 'left, right, root'};

/* Returns the values of tree n in traversal order o. */
const wk = (n, o, a = []) => {
  if (!n) return a;
  o == 'pre' && a.push(n.v);
  wk(n.l, o, a);
  o == 'in' && a.push(n.v);
  wk(n.r, o, a);
  o == 'post' && a.push(n.v);
  return a;
};

/* Builds a random binary search tree with 7 values, and gives each node a position (x, d). */
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

/* Draws the tree and the order visited so far. */
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

/* "Watch the walk": animate one visit every 0.8 seconds. */
function wt() {
  clearInterval(TI);
  TM = 'watch'; TP = 0; TG = '';
  trr();
  TI = setInterval(() => { TP++; trr(); if (TP >= TS.length) clearInterval(TI); }, 800);
}

/* "Your turn": you click the nodes. */
function yt() {
  clearInterval(TI);
  TM = 'turn'; TP = 0;
  TG = `Click the first node to visit in ${NM[TO].toLowerCase()}.`;
  trr();
}

/* A node was clicked. */
function tc(v) {
  if (TM != 'turn') { TG = 'Press Your turn first, then click the nodes.'; return trr(); }
  if (TP >= TS.length) return;
  if (v == TS[TP]) { TP++; TG = TP == TS.length ? 'Correct, the whole walk is done!' : 'Correct. Keep going.'; }
  else TG = `Not ${v}. For ${NM[TO].toLowerCase()}, go ${RL[TO]}.`;
  trr();
}
