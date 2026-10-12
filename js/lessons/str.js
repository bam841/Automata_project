/* str.js: Mountable String Street district practice view. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};
  AC.lessons = AC.lessons || {};

  let currentHost = null;
  let currentCtx = null;
  let listeners = [];

  let W = 'level';
  let V = 'city';
  let K = 2;

  function renderCars(chars, classFn) {
    if (!chars.length) return '<i class="car e">ε</i>';
    return chars.map((c, i) => {
      const cls = typeof classFn === 'function' ? classFn(i) : classFn;
      return `<i class="car ${cls}">${AC.util.esc(c)}</i>`;
    }).join('');
  }

  function updateView() {
    if (!currentHost) return;

    const wInput = currentHost.querySelector('#w');
    const vInput = currentHost.querySelector('#v');
    const kSlider = currentHost.querySelector('#k');

    if (wInput && typeof wInput.value === 'string') W = wInput.value;
    if (vInput && typeof vInput.value === 'string') V = vInput.value;
    W = W || '';
    V = V || '';

    const charsW = [...W];
    const charsV = [...V];
    const n = charsW.length;

    if (kSlider) {
      kSlider.max = n;
      K = Math.min(kSlider.value !== undefined ? +kSlider.value : K, n);
    }

    const kvEl = currentHost.querySelector('#kv');
    if (kvEl) kvEl.textContent = K;

    const trkEl = currentHost.querySelector('#trk');
    if (trkEl) {
      trkEl.innerHTML = `<div class="row">${renderCars(charsW, i => i < K ? 'p' : 's')}</div>`;
    }

    const outEl = currentHost.querySelector('#out');
    if (outEl) {
      const prefCars = renderCars(charsW.slice(0, K), 'p');
      const suffCars = renderCars(charsW.slice(K), 's');
      const concatCars = [...charsW.map(c => `<i class="car p">${AC.util.esc(c)}</i>`), ...charsV.map(c => `<i class="car s">${AC.util.esc(c)}</i>`)].join('') || '<i class="car e">ε</i>';
      const revChars = [...charsW].reverse();
      const revCars = renderCars(revChars, 'p');

      const allPrefs = AC.strings.prefixes(W).map(p => AC.util.esc(p) || 'ε').join(', ');
      const allSuffs = AC.strings.suffixes(W).map(s => AC.util.esc(s) || 'ε').join(', ');

      outEl.innerHTML = `<table class="ot">
        <tr><th>Length |w|</th><td>${n}</td></tr>
        <tr><th>Prefix (first ${K})</th><td><div class="row">${prefCars}</div></td></tr>
        <tr><th>Suffix (last ${n - K})</th><td><div class="row">${suffCars}</div></td></tr>
        <tr><th>Concat wv</th><td><div class="row">${concatCars}</div>Length ${n + charsV.length}</td></tr>
        <tr><th>Reverse wᴿ</th><td><div class="row">${revCars}</div></td></tr>
        <tr><th>All prefixes</th><td>${allPrefs}</td></tr>
        <tr><th>All suffixes</th><td>${allSuffs}</td></tr>
      </table>`;
    }

    // Challenge evaluation
    const isPal = AC.strings.isChallengePalindrome(W);
    const stamped = AC.progress.hasStamp('str');
    if (isPal && !stamped) {
      AC.progress.setStamp('str');
      if (currentCtx && currentCtx.onStamp) currentCtx.onStamp('str');
    }

    const chEl = currentHost.querySelector('#ch');
    if (chEl) {
      const done = AC.progress.hasStamp('str');
      chEl.className = 'ch' + (done ? ' done' : '');
      chEl.textContent = (done ? 'Stamp earned. ' : 'Challenge: ') + 'Type a word of 3 or more letters that reads the same reversed (wᴿ = w).';
    }
  }

  function handleInput(e) {
    if (e.target.matches('#w, #v, #k')) {
      updateView();
    }
  }

  function mount(host, ctx) {
    unmount();
    currentHost = host;
    currentCtx = ctx || {};

    const stamped = AC.progress.hasStamp('str');

    host.innerHTML = `
      <p>A string is a train and each letter is a car. Edit the trains, then slide the cut to split w into a prefix and a suffix.</p>
      <div class="f">
        <label>w <input id="w" value="${AC.util.esc(W)}" maxlength="14"></label>
        <label>v <input id="v" value="${AC.util.esc(V)}" maxlength="14"></label>
      </div>
      <div id="trk"></div>
      <label class="f">Cut after letter <input type="range" id="k" min="0" max="${W.length}" value="${K}"> <b id="kv"></b></label>
      <div id="out"></div>
      <p id="ch" class="ch${stamped ? ' done' : ''}">${stamped ? 'Stamp earned. ' : 'Challenge: '}Type a word of 3 or more letters that reads the same reversed (wᴿ = w).</p>
    `;

    host.addEventListener('input', handleInput);
    listeners.push({ target: host, type: 'input', fn: handleInput });

    updateView();
  }

  function unmount() {
    for (const l of listeners) {
      l.target.removeEventListener(l.type, l.fn);
    }
    listeners = [];
    if (currentHost) {
      currentHost.innerHTML = '';
      currentHost = null;
    }
    currentCtx = null;
  }

  AC.lessons.str = {
    id: 'str',
    title: 'String Street',
    color: '#e0663f',
    practice: { mount, unmount },
    challenge: { mount, unmount }
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
