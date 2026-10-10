/* strings.js: String Street. Length, prefix, suffix, concatenation, reverse. */

let W = 'level', V = 'city', K = 2; // W = string w, V = string v, K = where the cut is

function strv() {
  app.innerHTML = head('String Street') + `<p>A string is a train and each letter is a car. Edit the trains, then slide the cut to split w into a prefix and a suffix.</p>
  <div class="f"><label>w <input id="w" value="${esc(W)}" maxlength="14" oninput="su()"></label><label>v <input id="v" value="${esc(V)}" maxlength="14" oninput="su()"></label></div>
  <div id="trk"></div>
  <label class="f">Cut after letter <input type="range" id="k" min="0" max="${W.length}" value="${K}" oninput="su()"> <b id="kv"></b></label>
  <div id="out"></div><p id="ch"></p>`;
  su();
}

/* Redraws everything whenever w, v or the cut changes. */
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
