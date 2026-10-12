/* dfa.js: Mountable DFA Station district practice view. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};
  AC.lessons = AC.lessons || {};

  let currentHost = null;
  let currentCtx = null;
  let listeners = [];

  let X = {
    n: 3,
    t: [0, 1, 2, 3, 4].map(() => ({ 0: 0, 1: 0 })),
    f: new Set(),
    c: 0
  };

  function renderDiagramSVG() {
    const n = X.n;
    const W = 340;
    const H = 210;
    const R = 17;
    const ed = {};

    const P = [...Array(n)].map((_, i) => {
      const a = Math.PI + 2 * Math.PI * i / n;
      return [W / 2 + 110 * Math.cos(a), H / 2 + 70 * Math.sin(a)];
    });

    for (let r = 0; r < n; r++) {
      [0, 1].forEach(c => {
        const key = r + '>' + X.t[r][c];
        (ed[key] = ed[key] || []).push(c);
      });
    }

    let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="State diagram">
      <defs>
        <marker id="ah" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0 0L8 4L0 8z" class="ar"/>
        </marker>
      </defs>`;

    for (const k in ed) {
      const [a, b] = k.split('>').map(Number);
      const lb = ed[k].join(',');
      const [x, y] = P[a];

      if (a === b) {
        s += `<path class="ed" d="M${x - 9} ${y - R + 2}C${x - 30} ${y - 55} ${x + 30} ${y - 55} ${x + 9} ${y - R + 2}" marker-end="url(#ah)"/>
              <text class="lb" x="${x}" y="${y - 48}" text-anchor="middle">${lb}</text>`;
      } else {
        const [u, v] = P[b];
        const d = Math.hypot(u - x, v - y);
        const ux = (u - x) / d;
        const uy = (v - y) / d;
        const cx = (x + u) / 2 - uy * 24;
        const cy = (y + v) / 2 + ux * 24;
        const p1 = [x + ux * R, y + uy * R];
        const p2 = [u - ux * R, v - uy * R];
        s += `<path class="ed" d="M${p1[0]} ${p1[1]} Q${cx} ${cy} ${p2[0]} ${p2[1]}" marker-end="url(#ah)"/>
              <text class="lb" x="${0.25 * p1[0] + 0.5 * cx + 0.25 * p2[0]}" y="${0.25 * p1[1] + 0.5 * cy + 0.25 * p2[1] - 3}" text-anchor="middle">${lb}</text>`;
      }
    }

    // Start arrow pointing to q0
    s += `<path class="ed" d="M${P[0][0] - R - 28} ${P[0][1]}L${P[0][0] - R} ${P[0][1]}" marker-end="url(#ah)"/>`;

    // State circles
    P.forEach(([x, y], i) => {
      s += `<circle class="nd" cx="${x}" cy="${y}" r="${R}"/>`;
      if (X.f.has(i)) {
        s += `<circle class="nd" cx="${x}" cy="${y}" r="${R - 4}"/>`;
      }
      s += `<text class="qn" x="${x}" y="${y + 4}" text-anchor="middle">q${i}</text>`;
    });

    s += '</svg>';
    return s;
  }

  function updateTrace() {
    if (!currentHost) return;
    const tsInput = currentHost.querySelector('#ts');
    const trEl = currentHost.querySelector('#tr');
    if (!tsInput || !trEl) return;

    const s = tsInput.value.replace(/[^01]/g, '');
    let q = 0;
    let p = 'q0';

    for (const c of s) {
      q = X.t[q][c];
      p += ` →(${c}) q${q}`;
    }

    trEl.textContent = `${p}: ${X.f.has(q) ? 'accepted' : 'rejected'}`;
  }

  function resizeStates(delta) {
    X.n = Math.max(2, Math.min(5, X.n + delta));
    X.t.forEach(row => {
      [0, 1].forEach(c => {
        if (row[c] >= X.n) row[c] = 0;
      });
    });
    X.f = new Set([...X.f].filter(i => i < X.n));
    renderAll();
  }

  function flipAccepting() {
    const ks = [...Array(X.n).keys()];
    X.f = new Set(ks.filter(i => !X.f.has(i)));
    renderAll();
  }

  function runAllTests() {
    if (!currentHost) return;
    const machine = {
      n: X.n,
      delta: X.t.slice(0, X.n).map(r => [r[0], r[1]]),
      accept: X.f
    };

    const res = AC.dfa.testAgainst(machine, X.c);
    const msgEl = currentHost.querySelector('#msg');

    if (msgEl) {
      msgEl.className = res.passed ? 'ok' : 'bad';
      if (res.passed) {
        msgEl.textContent = `All ${res.total} test strings pass.`;
      } else {
        const samples = res.failures.slice(0, 3).map(f => `"${f.s || 'ε'}" should be ${f.expected ? 'accepted' : 'rejected'}`).join('; ');
        msgEl.textContent = `${res.failures.length} of ${res.total} test strings failed. For example: ${samples}.`;
      }
    }

    if (res.passed) {
      if (!AC.progress.hasStamp('dfa')) {
        AC.progress.setStamp('dfa');
        if (currentCtx && currentCtx.onStamp) currentCtx.onStamp('dfa');
      }
    }

    const chEl = currentHost.querySelector('#ch');
    if (chEl) {
      const stamped = AC.progress.hasStamp('dfa');
      chEl.className = 'ch' + (stamped ? ' done' : '');
      chEl.textContent = (stamped ? 'Stamp earned. ' : 'Challenge: ') + 'Build a DFA that passes every test for any goal.';
    }
  }

  function renderAll() {
    if (!currentHost) return;

    const n = X.n;
    const ks = [...Array(n).keys()];
    const stamped = AC.progress.hasStamp('dfa');

    currentHost.innerHTML = `
      <p>q0 is the start state. Choose where each symbol leads, tick the accepting states, then test your machine.</p>
      <label class="f">Goal
        <select data-act="change-goal">
          ${AC.dfa.goals.map((g, i) => `
            <option value="${i}" ${i === X.c ? 'selected' : ''}>${g.name}</option>
          `).join('')}
        </select>
      </label>
      <div class="sc">
        <table>
          <tr><th>δ</th><th>0</th><th>1</th><th>Accept</th></tr>
          ${ks.map(i => `
            <tr>
              <th>q${i}</th>
              ${[0, 1].map(c => `
                <td>
                  <select aria-label="q${i} on ${c}" data-act="set-trans" data-state="${i}" data-sym="${c}">
                    ${ks.map(j => `
                      <option value="${j}" ${X.t[i][c] === j ? 'selected' : ''}>q${j}</option>
                    `).join('')}
                  </select>
                </td>
              `).join('')}
              <td>
                <input type="checkbox" aria-label="q${i} accepting" data-act="toggle-accept" data-state="${i}" ${X.f.has(i) ? 'checked' : ''}>
              </td>
            </tr>
          `).join('')}
        </table>
      </div>
      <button data-act="remove-state">Remove state</button>
      <button data-act="add-state">Add state</button>
      <button data-act="flip-accept">Flip accepting states (complement)</button>
      <div id="sv">${renderDiagramSVG()}</div>
      <div class="f">
        <label>Try a string <input id="ts" value="1001" maxlength="16"></label>
      </div>
      <p id="tr"></p>
      <button class="pri" data-act="run-tests">Run all tests</button>
      <p id="msg"></p>
      <p id="ch" class="ch${stamped ? ' done' : ''}">${stamped ? 'Stamp earned. ' : 'Challenge: '}Build a DFA that passes every test for any goal.</p>
    `;

    updateTrace();
  }

  function handleClick(e) {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;

    const act = btn.dataset.act;
    if (act === 'remove-state') resizeStates(-1);
    else if (act === 'add-state') resizeStates(1);
    else if (act === 'flip-accept') flipAccepting();
    else if (act === 'run-tests') runAllTests();
  }

  function handleChange(e) {
    const el = e.target.closest('[data-act]');
    if (!el) return;

    const act = el.dataset.act;
    if (act === 'change-goal') {
      X.c = +el.value;
      renderAll();
    } else if (act === 'set-trans') {
      const state = +el.dataset.state;
      const sym = +el.dataset.sym;
      X.t[state][sym] = +el.value;
      const svEl = currentHost.querySelector('#sv');
      if (svEl) svEl.innerHTML = renderDiagramSVG();
      updateTrace();
    } else if (act === 'toggle-accept') {
      const state = +el.dataset.state;
      if (el.checked) X.f.add(state);
      else X.f.delete(state);
      const svEl = currentHost.querySelector('#sv');
      if (svEl) svEl.innerHTML = renderDiagramSVG();
      updateTrace();
    }
  }

  function handleInput(e) {
    if (e.target.matches('#ts')) {
      updateTrace();
    }
  }

  function mount(host, ctx) {
    unmount();
    currentHost = host;
    currentCtx = ctx || {};

    host.addEventListener('click', handleClick);
    listeners.push({ target: host, type: 'click', fn: handleClick });

    host.addEventListener('change', handleChange);
    listeners.push({ target: host, type: 'change', fn: handleChange });

    host.addEventListener('input', handleInput);
    listeners.push({ target: host, type: 'input', fn: handleInput });

    renderAll();
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

  AC.lessons.dfa = {
    id: 'dfa',
    title: 'DFA Station',
    color: '#6f55e0',
    practice: { mount, unmount },
    challenge: { mount, unmount }
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
