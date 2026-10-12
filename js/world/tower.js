/* tower.js: Exam Tower interactive controller and final exam modal. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  let modalEl = null;
  let activeExam = null;
  let currentIndex = 0;
  let answered = false;
  let userAnswers = [];
  let score = 0;

  const TOPIC_NAMES = {
    str: 'String Street',
    set: 'Set Park',
    tree: 'Tree Forest',
    dfa: 'DFA Station'
  };

  const TOPIC_COLORS = {
    str: '#e0663f',
    set: '#1f9d8a',
    tree: '#4c8c3a',
    dfa: '#6f55e0'
  };

  function getModal() {
    if (!modalEl && typeof document !== 'undefined') {
      modalEl = document.getElementById('exam-modal');
    }
    return modalEl;
  }

  function renderLockedView(host, missingCount) {
    const stamps = AC.progress ? AC.progress.get().stamps : {};
    const stampList = [
      { id: 'str', name: 'String Street', ok: !!stamps.str, col: '#e0663f' },
      { id: 'set', name: 'Set Park', ok: !!stamps.set, col: '#1f9d8a' },
      { id: 'tree', name: 'Tree Forest', ok: !!stamps.tree, col: '#4c8c3a' },
      { id: 'dfa', name: 'DFA Station', ok: !!stamps.dfa, col: '#6f55e0' }
    ];

    host.innerHTML = `
      <div class="exam-card exam-locked">
        <div class="exam-header">
          <div class="exam-badge" style="background:#b91c1c;">SEALED</div>
          <h2 class="exam-title">The Grand Exam Tower</h2>
          <button class="exam-close-btn" data-act="exam-close" aria-label="Close dialog">×</button>
        </div>
        <div class="exam-body">
          <div class="exam-locked-icon">🔒</div>
          <p class="exam-locked-msg">
            The grand entrance to the Exam Tower is sealed with ancient automata magic.
            You must collect all <strong>4 district stamps</strong> to unseal the doors.
          </p>
          <div class="exam-stamps-status">
            ${stampList.map(s => `
              <div class="exam-stamp-pill ${s.ok ? 'unlocked' : 'locked'}" style="--st-col:${s.col}">
                <span class="st-icon">${s.ok ? '✓' : '✗'}</span>
                <span class="st-name">${s.name}</span>
              </div>
            `).join('')}
          </div>
          <p class="exam-hint">
            Missing <strong>${missingCount}</strong> more stamp${missingCount === 1 ? '' : 's'}. Visit the district lecture boards to practice and pass their challenges!
          </p>
        </div>
        <div class="exam-footer">
          <button class="btn btn-secondary" data-act="exam-close">Return to City</button>
        </div>
      </div>
    `;
  }

  function renderQuestionView(host) {
    if (!activeExam || currentIndex >= activeExam.length) return;
    const q = activeExam[currentIndex];
    const topicName = TOPIC_NAMES[q.topic] || q.topic;
    const topicColor = TOPIC_COLORS[q.topic] || '#6366f1';

    host.innerHTML = `
      <div class="exam-card exam-playing">
        <div class="exam-header">
          <div class="exam-badge" style="background:${topicColor}">${topicName.toUpperCase()}</div>
          <span class="exam-progress-label">Question ${currentIndex + 1} of ${activeExam.length}</span>
          <button class="exam-close-btn" data-act="exam-close" aria-label="Close dialog">×</button>
        </div>
        <div class="exam-progress-bar">
          <div class="exam-progress-fill" style="width:${((currentIndex) / activeExam.length) * 100}%;"></div>
        </div>
        <div class="exam-body">
          <h3 class="exam-prompt">${AC.util ? AC.util.esc(q.prompt) : q.prompt}</h3>
          ${q.visual ? `<div class="exam-visual">${q.visual}</div>` : ''}

          <div class="exam-options" role="radiogroup" aria-label="Exam options">
            ${q.options.map((opt, idx) => `
              <button class="exam-option-btn ${answered ? (idx === q.answerIndex ? 'opt-correct' : (idx === userAnswers[currentIndex] ? 'opt-incorrect' : '')) : ''}"
                      data-act="exam-pick" data-idx="${idx}" ${answered ? 'disabled' : ''}>
                <span class="opt-letter">${['A', 'B', 'C', 'D'][idx]}</span>
                <span class="opt-text">${AC.util ? AC.util.esc(opt) : opt}</span>
              </button>
            `).join('')}
          </div>

          ${answered ? `
            <div class="exam-explain ${userAnswers[currentIndex] === q.answerIndex ? 'explain-success' : 'explain-fail'}">
              <div class="explain-title">
                ${userAnswers[currentIndex] === q.answerIndex ? '✓ Correct Answer!' : '✗ Incorrect'}
              </div>
              <p class="explain-body">${AC.util ? AC.util.esc(q.explain) : q.explain}</p>
            </div>
          ` : ''}
        </div>
        <div class="exam-footer">
          ${answered ? `
            <button class="btn btn-primary" data-act="${currentIndex === activeExam.length - 1 ? 'exam-finish' : 'exam-next'}">
              ${currentIndex === activeExam.length - 1 ? 'Calculate Final Score →' : 'Next Question →'}
            </button>
          ` : `
            <div class="exam-hint-text">Choose the correct answer above to proceed.</div>
          `}
        </div>
      </div>
    `;
  }

  function renderResultsView(host) {
    const total = activeExam.length;
    const passed = score >= 6;
    const pct = Math.round((score / total) * 100);

    host.innerHTML = `
      <div class="exam-card exam-results ${passed ? 'results-passed' : 'results-failed'}">
        <div class="exam-header">
          <div class="exam-badge" style="background:${passed ? '#10b981' : '#ef4444'}">
            ${passed ? 'EXAM PASSED' : 'NOT PASSED'}
          </div>
          <h2 class="exam-title">Official Evaluation Result</h2>
          <button class="exam-close-btn" data-act="exam-close" aria-label="Close dialog">×</button>
        </div>
        <div class="exam-body text-center">
          <div class="exam-score-circle">
            <span class="score-number">${score}</span>
            <span class="score-total">/ ${total}</span>
          </div>
          <div class="exam-score-pct">${pct}% Correct</div>

          <h3 class="exam-result-title">
            ${passed ? 'Congratulations, Scholar!' : 'Study and Try Again!'}
          </h3>
          <p class="exam-result-desc">
            ${passed
              ? 'You have successfully proven mastery across the foundations of Theoretical Computer Science: Alphabets & Languages, Set Operations, Tree Traversal Invariants, and Deterministic Finite Automata!'
              : 'You need at least 6 out of 8 correct answers to pass. Review the lessons at each district station and attempt the exam again with a fresh set of questions.'}
          </p>
        </div>
        <div class="exam-footer">
          ${passed ? `
            <button class="btn btn-primary" data-act="exam-certificate">🎓 View Official Diploma</button>
            <button class="btn btn-secondary" data-act="exam-retry">Retake Exam</button>
          ` : `
            <button class="btn btn-primary" data-act="exam-retry">Try Again (New Exam)</button>
            <button class="btn btn-secondary" data-act="exam-close">Return to City</button>
          `}
        </div>
      </div>
    `;
  }

  AC.tower = {
    isOpen() {
      const modal = getModal();
      return modal && modal.classList.contains('active');
    },

    interact() {
      const modal = getModal();
      if (!modal) return;

      const stampsCount = AC.progress ? AC.progress.stampCount() : 0;
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');

      if (AC.setState) {
        AC.setState('exam');
      }

      if (stampsCount < 4) {
        if (AC.audio) AC.audio.play('error');
        renderLockedView(modal, 4 - stampsCount);
      } else {
        if (AC.audio) AC.audio.play('open');
        this.startNewExam();
      }
    },

    startNewExam() {
      const modal = getModal();
      if (!modal) return;

      const rng = AC.rng ? AC.rng(Date.now() & 0xffffff) : Math.random;
      activeExam = AC.examGen ? AC.examGen(rng) : [];
      currentIndex = 0;
      answered = false;
      userAnswers = [];
      score = 0;

      renderQuestionView(modal);
    },

    pickAnswer(idx) {
      if (answered || !activeExam || currentIndex >= activeExam.length) return;
      answered = true;
      userAnswers[currentIndex] = idx;

      const q = activeExam[currentIndex];
      const isCorrect = idx === q.answerIndex;
      if (isCorrect) {
        score++;
        if (AC.audio) AC.audio.play('select');
      } else {
        if (AC.audio) AC.audio.play('error');
      }

      const modal = getModal();
      if (modal) renderQuestionView(modal);
    },

    nextQuestion() {
      if (!answered || !activeExam) return;
      currentIndex++;
      answered = false;

      const modal = getModal();
      if (!modal) return;

      if (currentIndex < activeExam.length) {
        if (AC.audio) AC.audio.play('select');
        renderQuestionView(modal);
      } else {
        this.finishExam();
      }
    },

    finishExam() {
      const modal = getModal();
      if (!modal) return;

      const passed = score >= 6;
      if (passed) {
        if (AC.audio) AC.audio.play('stamp');
        if (AC.progress) {
          const p = AC.progress.get();
          p.exam = p.exam || {};
          p.exam.passed = true;
          p.exam.best = Math.max(p.exam.best || 0, score);
          AC.progress.save();
        }
        if (AC.bus && typeof AC.bus.emit === 'function') {
          AC.bus.emit('exam:pass', { score, total: activeExam.length });
        }
      } else {
        if (AC.audio) AC.audio.play('error');
      }

      renderResultsView(modal);
    },

    close() {
      const modal = getModal();
      if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        modal.innerHTML = '';
      }
      if (AC.audio) AC.audio.play('close');
      if (AC.setState) {
        AC.setState('world');
      }
      const canvas = document.getElementById('game');
      if (canvas) canvas.focus();
    },

    initEvents() {
      const modal = getModal();
      if (!modal) return;

      modal.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-act]');
        if (!btn) return;

        const act = btn.getAttribute('data-act');
        if (act === 'exam-close') {
          this.close();
        } else if (act === 'exam-pick') {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          this.pickAnswer(idx);
        } else if (act === 'exam-next') {
          this.nextQuestion();
        } else if (act === 'exam-finish') {
          this.finishExam();
        } else if (act === 'exam-retry') {
          this.startNewExam();
        } else if (act === 'exam-certificate') {
          this.close();
          if (AC.certificate) {
            AC.certificate.open(score, activeExam ? activeExam.length : 8);
          }
        }
      });
    },

    initTrigger() {
      if (AC.triggers && typeof AC.triggers.register === 'function') {
        AC.triggers.register({
          id: 'exam-tower',
          rect: { x: 37 * 16, y: 28 * 16, w: 16, h: 16 },
          get prompt() {
            const stamps = AC.progress ? AC.progress.stampCount() : 0;
            return stamps >= 4 ? 'E  Challenge Exam Tower' : 'E  Inspect Exam Tower (Sealed)';
          },
          onInteract(game) {
            AC.tower.interact();
          }
        });
      }
    }
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => AC.tower.initEvents());
    } else {
      AC.tower.initEvents();
    }
  }

})(typeof globalThis !== 'undefined' ? globalThis : window);
