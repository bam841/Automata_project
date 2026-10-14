/* exam-gen.js: Final Exam Generator for the Exam Tower. Pure logic with seeded RNG. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  /**
   * Generates an 8-question comprehensive final exam (2 per district topic: str, set, tree, dfa)
   * conforming to DOMAIN_SPEC.md §8 and ARCHITECTURE.md §11.
   *
   * @param {Function} rng - Seeded pseudo-random number generator returning [0, 1)
   * @returns {Array<Object>} Array of exactly 8 question objects:
   *   { id, topic, prompt, visual, options, answerIndex, explain }
   */
  AC.examGen = function (rng) {
    const r = rng || (AC.rng ? AC.rng(42) : Math.random);
    if (AC.quiz && typeof AC.quiz.generateExam === 'function') {
      return AC.quiz.generateExam(r);
    }
    throw new Error('AC.quiz engine must be loaded to generate the exam');
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
