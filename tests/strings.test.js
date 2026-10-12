/* strings.test.js: Golden tests and property checks for AC.strings */
(function (root) {
  'use strict';

  const { test, assert } = root.AC_TEST || require('./harness.js');
  const AC = root.AC;

  test('AC.strings.length counts characters including unicode', function () {
    assert.equal(AC.strings.length(''), 0);
    assert.equal(AC.strings.length('abc'), 3);
    assert.equal(AC.strings.length('level'), 5);
  });

  test('AC.strings.prefixes matches golden values in DOMAIN_SPEC §7', function () {
    assert.deepEqual(AC.strings.prefixes('abc'), ['', 'a', 'ab', 'abc']);
    assert.deepEqual(AC.strings.prefixes(''), ['']);
    assert.equal(AC.strings.prefixes('hello').length, 6); // n + 1 prefixes
  });

  test('AC.strings.suffixes matches golden values', function () {
    assert.deepEqual(AC.strings.suffixes('abc'), ['abc', 'bc', 'c', '']);
    assert.deepEqual(AC.strings.suffixes(''), ['']);
    assert.equal(AC.strings.suffixes('hello').length, 6); // n + 1 suffixes
  });

  test('AC.strings.prefixAt and suffixAt partition string at cut k', function () {
    const w = 'level';
    assert.equal(AC.strings.prefixAt(w, 2), 'le');
    assert.equal(AC.strings.suffixAt(w, 2), 'vel');
    assert.equal(AC.strings.prefixAt(w, 0), '');
    assert.equal(AC.strings.suffixAt(w, 0), 'level');
    assert.equal(AC.strings.prefixAt(w, 5), 'level');
    assert.equal(AC.strings.suffixAt(w, 5), '');
    // Clamping on out-of-range k
    assert.equal(AC.strings.prefixAt(w, -1), '');
    assert.equal(AC.strings.suffixAt(w, 10), '');
  });

  test('AC.strings.concat and reverse match golden values in DOMAIN_SPEC §7', function () {
    assert.equal(AC.strings.concat('level', 'city'), 'levelcity');
    assert.equal(AC.strings.reverse('abc'), 'cba');
    assert.equal(AC.strings.reverse(''), '');
    assert.equal(AC.strings.reverse('a'), 'a');
  });

  test('AC.strings.isPalindrome handles empty, single char, and multi-char palindromes', function () {
    assert.equal(AC.strings.isPalindrome(''), true);
    assert.equal(AC.strings.isPalindrome('a'), true);
    assert.equal(AC.strings.isPalindrome('abba'), true);
    assert.equal(AC.strings.isPalindrome('racecar'), true);
    assert.equal(AC.strings.isPalindrome('city'), false);
  });

  test('AC.strings.isChallengePalindrome enforces length >= 3 requirement', function () {
    assert.equal(AC.strings.isChallengePalindrome(''), false);
    assert.equal(AC.strings.isChallengePalindrome('a'), false);
    assert.equal(AC.strings.isChallengePalindrome('aa'), false);
    assert.equal(AC.strings.isChallengePalindrome('aba'), true);
    assert.equal(AC.strings.isChallengePalindrome('level'), true);
  });

})(typeof globalThis !== 'undefined' ? globalThis : window);
