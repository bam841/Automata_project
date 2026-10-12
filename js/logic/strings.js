/* strings.js: Pure functions for string theory (alphabet, prefix, suffix, concat, reverse, palindrome). */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};
  const strings = AC.strings = AC.strings || {};

  /**
   * Returns length |w| of string w.
   */
  strings.length = function (w) {
    return [...String(w)].length;
  };

  /**
   * Returns all n+1 prefixes of string w, from empty string ε to w.
   */
  strings.prefixes = function (w) {
    const chars = [...String(w)];
    const n = chars.length;
    const res = [];
    for (let i = 0; i <= n; i++) {
      res.push(chars.slice(0, i).join(''));
    }
    return res;
  };

  /**
   * Returns all n+1 suffixes of string w, from w down to empty string ε.
   */
  strings.suffixes = function (w) {
    const chars = [...String(w)];
    const n = chars.length;
    const res = [];
    for (let i = 0; i <= n; i++) {
      res.push(chars.slice(i).join(''));
    }
    return res;
  };

  /**
   * Returns prefix of w with length k (clamped within [0, |w|]).
   */
  strings.prefixAt = function (w, k) {
    const chars = [...String(w)];
    const cut = Math.max(0, Math.min(chars.length, k | 0));
    return chars.slice(0, cut).join('');
  };

  /**
   * Returns suffix of w after cut position k (clamped within [0, |w|]).
   */
  strings.suffixAt = function (w, k) {
    const chars = [...String(w)];
    const cut = Math.max(0, Math.min(chars.length, k | 0));
    return chars.slice(cut).join('');
  };

  /**
   * Returns concatenation wv.
   */
  strings.concat = function (w, v) {
    return String(w) + String(v);
  };

  /**
   * Returns reverse w^R of string w.
   */
  strings.reverse = function (w) {
    return [...String(w)].reverse().join('');
  };

  /**
   * Returns true if w is a palindrome (w = w^R). Empty string and single symbols are palindromes.
   */
  strings.isPalindrome = function (w) {
    const s = String(w);
    return s === strings.reverse(s);
  };

  /**
   * Returns true if w satisfies the game challenge (palindrome and length >= 3).
   */
  strings.isChallengePalindrome = function (w) {
    return strings.length(w) >= 3 && strings.isPalindrome(w);
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
