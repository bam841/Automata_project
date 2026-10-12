/* lesson-player.js: Interactive chalkboard lesson player with step controls and quiz engine. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};
  AC.lessons = AC.lessons || {};

  let currentHost = null;
  let currentLesson = null;
  let currentCtx = null;
  let currentStepIdx = 0;
  let isPlaying = false;
  let playTimer = null;
  let inQuiz = false;
  let quizQuestions = [];
  let quizIdx = 0;
  let selectedOption = null;
  let quizAnswered = false;
  let listeners = [];

  function addListener(target, event, handler) {
    target.addEventListener(event, handler);
    listeners.push({ target, event, handler });
  }

  function clearListeners() {
    for (const l of listeners) {
      if (typeof l.target.removeEventListener === 'function') {
        l.target.removeEventListener(l.event, l.handler);
      }
    }
    listeners = [];
  }

  function stopAutoplay() {
    if (playTimer) {
      clearInterval(playTimer);
      playTimer = null;
    }
    isPlaying = false;
  }

  function startAutoplay() {
    if (currentCtx && currentCtx.reducedMotion) return;
    isPlaying = true;
    if (playTimer) clearInterval(playTimer);
    playTimer = setInterval(() => {
      if (!currentLesson || inQuiz) {
        stopAutoplay();
        return;
      }
      if (currentStepIdx < currentLesson.steps.length - 1) {
        setStep(currentStepIdx + 1);
      } else {
        stopAutoplay();
        renderControls();
      }
    }, 4500);
  }

  function toggleAutoplay() {
    if (isPlaying) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
    renderControls();
  }

  function renderStep() {
    if (!currentHost || !currentLesson) return;
    const step = currentLesson.steps[currentStepIdx];
    if (!step) return;

    const board = currentHost.querySelector('#lesson-board');
    if (!board) return;

    const skinClass = currentLesson.skin === 'crt' ? 'board-crt' : 'board-chalk';
    board.className = `lesson-board ${skinClass}`;

    board.innerHTML = `
      <div class="lesson-stage">
        <div class="lesson-header-bar">
          <span class="lesson-step-badge">Step ${currentStepIdx + 1} of ${currentLesson.steps.length}</span>
          <h3 class="lesson-step-title">${AC.util.esc(step.title)}</h3>
        </div>
        <div id="lesson-canvas-container" class="lesson-canvas-container"></div>
        <div class="lesson-narration">
          <p class="lesson-say-text">${AC.util.esc(step.say)}</p>
        </div>
      </div>
    `;

    const canvasContainer = board.querySelector('#lesson-canvas-container');
    if (canvasContainer && typeof step.draw === 'function') {
      step.draw(canvasContainer, step.state || {});
    }

    renderControls();
  }

  function renderControls() {
    if (!currentHost || !currentLesson) return;
    const ctrlEl = currentHost.querySelector('#lesson-controls');
    if (!ctrlEl) return;

    if (inQuiz) {
      ctrlEl.innerHTML = '';
      return;
    }

    const total = currentLesson.steps.length;
    const isFirst = currentStepIdx === 0;
    const isLast = currentStepIdx === total - 1;

    let dotsHtml = '<div class="lesson-dots" role="tablist" aria-label="Lesson steps">';
    for (let i = 0; i < total; i++) {
      const active = i === currentStepIdx ? 'active' : '';
      dotsHtml += `<button class="lesson-dot ${active}" data-act="dot" data-step="${i}" aria-label="Step ${i + 1}" aria-current="${i === currentStepIdx}"></button>`;
    }
    dotsHtml += '</div>';

    ctrlEl.innerHTML = `
      <div class="lesson-nav-bar">
        <button class="sec" data-act="prev" ${isFirst ? 'disabled' : ''} aria-label="Previous step">◀ Prev</button>
        <button class="sec" data-act="play" aria-label="${isPlaying ? 'Pause' : 'Autoplay'}">${isPlaying ? '⏸ Pause' : '▶ Play'}</button>
        ${dotsHtml}
        ${isLast
          ? '<button class="pri" data-act="start-quiz">Quick Check ➔</button>'
          : '<button class="pri" data-act="next" aria-label="Next step">Next ▶</button>'
        }
      </div>
    `;
  }

  function setStep(idx) {
    if (!currentLesson) return;
    const total = currentLesson.steps.length;
    currentStepIdx = Math.max(0, Math.min(idx, total - 1));
    inQuiz = false;
    renderStep();
  }

  function renderQuizQuestion() {
    if (!currentHost || !currentLesson) return;
    const board = currentHost.querySelector('#lesson-board');
    if (!board) return;

    const q = quizQuestions[quizIdx];
    if (!q) {
      renderQuizSummary();
      return;
    }

    const skinClass = currentLesson.skin === 'crt' ? 'board-crt' : 'board-chalk';
    board.className = `lesson-board ${skinClass}`;

    let optionsHtml = '<div class="quiz-options-list">';
    for (let i = 0; i < q.options.length; i++) {
      let optClass = 'quiz-option-btn';
      if (quizAnswered) {
        if (i === q.answerIndex) optClass += ' correct';
        else if (i === selectedOption) optClass += ' incorrect';
      } else if (i === selectedOption) {
        optClass += ' selected';
      }
      optionsHtml += `
        <button class="${optClass}" data-act="choose-opt" data-idx="${i}" ${quizAnswered ? 'disabled' : ''}>
          <span class="opt-letter">${String.fromCharCode(65 + i)}.</span>
          <span class="opt-label">${AC.util.esc(String(q.options[i]))}</span>
        </button>
      `;
    }
    optionsHtml += '</div>';

    let feedbackHtml = '';
    if (quizAnswered) {
      const isCorrect = selectedOption === q.answerIndex;
      feedbackHtml = `
        <div class="quiz-feedback ${isCorrect ? 'pass' : 'retry'}">
          <strong>${isCorrect ? '✓ Correct!' : '✗ Not quite.'}</strong>
          <p>${AC.util.esc(q.explain)}</p>
          <div class="quiz-action-bar">
            ${isCorrect
              ? `<button class="pri" data-act="next-quiz">${quizIdx < quizQuestions.length - 1 ? 'Next Question ➔' : 'Complete Lesson ➔'}</button>`
              : `<button class="sec" data-act="retry-quiz">Try Again</button>`
            }
          </div>
        </div>
      `;
    }

    board.innerHTML = `
      <div class="lesson-stage quiz-stage">
        <div class="lesson-header-bar">
          <span class="lesson-step-badge">Quick Check ${quizIdx + 1} of ${quizQuestions.length}</span>
          <h3 class="lesson-step-title">${AC.util.esc(currentLesson.title)}</h3>
        </div>
        <div class="quiz-prompt-box">
          <p class="quiz-prompt-text">${AC.util.esc(q.prompt)}</p>
          ${q.visual ? `<div class="quiz-visual-box">${q.visual}</div>` : ''}
        </div>
        ${optionsHtml}
        ${feedbackHtml}
      </div>
    `;

    renderControls();
  }

  function renderQuizSummary() {
    if (!currentHost || !currentLesson) return;
    const board = currentHost.querySelector('#lesson-board');
    if (!board) return;

    if (AC.progress && typeof AC.progress.setLessonSeen === 'function') {
      AC.progress.setLessonSeen(currentLesson.id);
    }

    board.innerHTML = `
      <div class="lesson-stage quiz-stage quiz-complete">
        <div class="chalk-symbol-large">✓</div>
        <h2>Lesson Complete!</h2>
        <p>You've mastered the concepts of <b>${AC.util.esc(currentLesson.title)}</b>.</p>
        <p>Now test your skills on the <b>Practice</b> and <b>Challenge</b> boards to claim your station stamp!</p>
        <div class="quiz-action-bar" style="margin-top: 1.5rem;">
          <button class="sec" data-act="review-lesson">Review Lesson</button>
          <button class="pri" data-act="go-practice">Open Practice Board ➔</button>
        </div>
      </div>
    `;

    renderControls();
  }

  function handleKeydown(e) {
    if (!currentHost || !currentLesson) return;
    if (inQuiz) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (currentStepIdx < currentLesson.steps.length - 1) {
        setStep(currentStepIdx + 1);
      } else {
        startQuiz();
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (currentStepIdx > 0) {
        setStep(currentStepIdx - 1);
      }
    } else if (e.key === ' ') {
      // Space toggles autoplay if not typing in form
      const tag = document.activeElement ? document.activeElement.tagName : '';
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        toggleAutoplay();
      }
    }
  }

  function handleClick(e) {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;

    if (act === 'prev') {
      stopAutoplay();
      if (currentStepIdx > 0) setStep(currentStepIdx - 1);
    } else if (act === 'next') {
      stopAutoplay();
      if (currentStepIdx < currentLesson.steps.length - 1) setStep(currentStepIdx + 1);
    } else if (act === 'play') {
      toggleAutoplay();
    } else if (act === 'dot') {
      stopAutoplay();
      const step = parseInt(btn.dataset.step, 10);
      if (!isNaN(step)) setStep(step);
    } else if (act === 'start-quiz') {
      stopAutoplay();
      startQuiz();
    } else if (act === 'choose-opt') {
      if (quizAnswered) return;
      const idx = parseInt(btn.dataset.idx, 10);
      selectedOption = idx;
      quizAnswered = true;
      renderQuizQuestion();
    } else if (act === 'next-quiz') {
      quizIdx++;
      selectedOption = null;
      quizAnswered = false;
      renderQuizQuestion();
    } else if (act === 'retry-quiz') {
      selectedOption = null;
      quizAnswered = false;
      renderQuizQuestion();
    } else if (act === 'review-lesson') {
      setStep(0);
    } else if (act === 'go-practice') {
      if (AC.lessons.shell && typeof AC.lessons.shell.switchTab === 'function') {
        AC.lessons.shell.switchTab('practice');
      }
    }
  }

  function startQuiz() {
    inQuiz = true;
    quizIdx = 0;
    selectedOption = null;
    quizAnswered = false;
    stopAutoplay();

    if (typeof currentLesson.quickCheck === 'function') {
      const rng = currentCtx && currentCtx.rng ? currentCtx.rng : Math.random;
      quizQuestions = currentLesson.quickCheck(rng);
    } else {
      quizQuestions = [];
    }

    renderQuizQuestion();
  }

  AC.lessons.lessonPlayer = {
    mount(host, lesson, ctx) {
      this.unmount();
      currentHost = host;
      currentLesson = lesson;
      currentCtx = ctx || {};
      currentStepIdx = 0;
      isPlaying = false;
      inQuiz = false;

      currentHost.innerHTML = `
        <div class="lesson-player-wrapper">
          <div id="lesson-board" class="lesson-board"></div>
          <div id="lesson-controls" class="lesson-controls"></div>
        </div>
      `;

      addListener(currentHost, 'click', handleClick);
      if (typeof root.addEventListener !== 'undefined') {
        addListener(root, 'keydown', handleKeydown);
      }

      renderStep();
    },

    unmount() {
      stopAutoplay();
      clearListeners();
      if (currentHost) {
        currentHost.innerHTML = '';
        currentHost = null;
      }
      currentLesson = null;
      currentCtx = null;
      currentStepIdx = 0;
      inQuiz = false;
      quizQuestions = [];
    },

    setStep(idx) {
      setStep(idx);
    },

    getStep() {
      return currentStepIdx;
    },

    isPlaying() {
      return isPlaying;
    },

    startQuiz() {
      startQuiz();
    },

    isQuizActive() {
      return inQuiz;
    }
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
