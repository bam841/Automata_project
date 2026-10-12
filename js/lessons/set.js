/* set.js: Mountable Set Park district practice view. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};
  AC.lessons = AC.lessons || {};

  let currentHost = null;
  let currentCtx = null;
  let listeners = [];

  let A = new Set([1, 2, 3]);
  let B = new Set([3, 4, 5]);
  let OP = 'union';

  const OPS_CONFIG = {
    union: { label: 'Union A ∪ B', compute: (a, b) => AC.sets.toSortedArray(AC.sets.union(a, b)) },
    inter: { label: 'Intersection A ∩ B', compute: (a, b) => AC.sets.toSortedArray(AC.sets.intersection(a, b)) },
    diff:  { label: 'Difference A − B', compute: (a, b) => AC.sets.toSortedArray(AC.sets.difference(a, b)) },
    sym:   { label: 'Symmetric difference A Δ B', compute: (a, b) => AC.sets.toSortedArray(AC.sets.symDiff(a, b)) },
    comp:  { label: 'Complement A′', compute: (a) => AC.sets.toSortedArray(AC.sets.complement(a)) },
    pow:   { label: 'Power set P(A)', compute: (a) => a.size > 4 ? null : AC.sets.powerSet(a).map(sub => '{' + sub.join(', ') + '}') },
    cart:  { label: 'Cartesian product A × B', compute: (a, b) => a.size * b.size > 20 ? null : AC.sets.cartesian(a, b).map(([x, y]) => `(${x}, ${y})`) }
  };

  function updateView() {
    if (!currentHost) return;

    const opConfig = OPS_CONFIG[OP];
    const r = opConfig.compute(A, B);
    const isElementList = OP !== 'pow' && OP !== 'cart';
    const highlighted = new Set(isElementList && Array.isArray(r) ? r : []);

    // Partition universe U into Venn regions
    const reg = { a: [], b: [], ab: [], n: [] };
    for (const x of AC.sets.U) {
      if (A.has(x) && B.has(x)) reg.ab.push(x);
      else if (A.has(x)) reg.a.push(x);
      else if (B.has(x)) reg.b.push(x);
      else reg.n.push(x);
    }

    const plotCircle = (list, cx) => list.map((x, i) => [x, cx + (i % 2 - 0.5) * 28, 52 + Math.floor(i / 2) * 26]);
    const pts = [
      ...plotCircle(reg.a, 98),
      ...plotCircle(reg.ab, 170),
      ...plotCircle(reg.b, 242),
      ...reg.n.map((x, i) => [x, 24 + i * 34, 190])
    ];

    // Challenge evaluation
    if (AC.sets.isChallengeSatisfied(A, B)) {
      if (!AC.progress.hasStamp('set')) {
        AC.progress.setStamp('set');
        if (currentCtx && currentCtx.onStamp) currentCtx.onStamp('set');
      }
    }

    const stamped = AC.progress.hasStamp('set');

    currentHost.innerHTML = `
      <p>The universe is U = {1, …, 8}. Tap numbers to put them in A or B, then pick an operation.</p>
      ${['A', 'B'].map(name => {
        const setObj = name === 'A' ? A : B;
        return `
          <div class="f">
            <b>${name}</b>
            ${AC.sets.U.map(x => `
              <button class="chip ${setObj.has(x) ? 'on' : ''}"
                data-act="toggle" data-set="${name}" data-val="${x}"
                aria-pressed="${setObj.has(x)}">${x}</button>
            `).join('')}
          </div>
        `;
      }).join('')}
      <div class="f">
        ${Object.keys(OPS_CONFIG).map(k => `
          <button class="${k === OP ? 'pri' : ''}" data-act="set-op" data-op="${k}">${OPS_CONFIG[k].label}</button>
        `).join('')}
      </div>
      <svg viewBox="0 0 340 210" width="100%" role="img" aria-label="Venn diagram of A and B">
        <circle class="vc" cx="130" cy="90" r="70"/>
        <circle class="vc" cx="210" cy="90" r="70"/>
        <text class="lb" x="62" y="28">A</text>
        <text class="lb" x="272" y="28">B</text>
        ${pts.map(([x, cx, cy]) => `
          <circle class="el ${highlighted.has(x) ? 'hl' : ''}" cx="${cx}" cy="${cy}" r="11"/>
          <text class="qn" x="${cx}" y="${cy + 4}" text-anchor="middle">${x}</text>
        `).join('')}
      </svg>
      <div>
        ${r === null
          ? `<p class="bad">${OP === 'pow' ? 'Keep A to 4 numbers or fewer to list its power set.' : 'Pick fewer numbers so that |A| × |B| is 20 or less.'}</p>`
          : isElementList
            ? `<p><b>${opConfig.label}</b> = {${r.join(', ')}}</p>`
            : `<p><b>${opConfig.label}</b>: ${r.length} ${OP === 'pow' ? 'subsets (2<sup>|A|</sup>)' : 'pairs (|A| × |B|)'}</p><div class="f">${r.map(t => `<span class="car p" style="padding:0 8px">${t}</span>`).join('')}</div>`
        }
      </div>
      <p id="ch" class="ch${stamped ? ' done' : ''}">${stamped ? 'Stamp earned. ' : 'Challenge: '}Choose A and B so that A Δ B = {1, 2, 7, 8} and A ∩ B = {4}.</p>
    `;
  }

  function handleClick(e) {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;

    const act = btn.dataset.act;
    if (act === 'toggle') {
      const setName = btn.dataset.set;
      const val = +btn.dataset.val;
      const targetSet = setName === 'A' ? A : B;
      if (targetSet.has(val)) {
        targetSet.delete(val);
      } else {
        targetSet.add(val);
      }
      updateView();
    } else if (act === 'set-op') {
      OP = btn.dataset.op;
      updateView();
    }
  }

  function mount(host, ctx) {
    unmount();
    currentHost = host;
    currentCtx = ctx || {};

    host.addEventListener('click', handleClick);
    listeners.push({ target: host, type: 'click', fn: handleClick });

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

  AC.lessons.set = {
    id: 'set',
    title: 'Set Park',
    color: '#1f9d8a',
    practice: { mount, unmount },
    challenge: { mount, unmount }
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
