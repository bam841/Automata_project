# Anti-Hallucination Protocol

Applies to every task. The goal: **nothing in the repo or in your reports exists only
because you assumed it.**

## 1. Evidence tags (use in every report)
| Tag | Meaning |
|---|---|
| `[VERIFIED]` | You ran it or observed the result yourself (state the command/steps and the output). |
| `[READ]` | You opened the file and saw it (cite `path:line`). |
| `[ASSUMED]` | Reasonable guess not checked. Must be listed under "Assumptions". |
| `[UNKNOWN]` | You do not know and could not find out. Must be listed under "Open questions". |
Untagged factual claims count as `[ASSUMED]`.

## 2. Ground-before-use rule
Before you write code that **uses** any of: an existing function, variable, CSS class, DOM id,
file path, asset, tile id, event name, or contract — you must have, in this session:
1. opened the defining location, and
2. be able to cite it as `path:line` (or the contract section in `docs/ARCHITECTURE.md`).

If you cannot, stop and look it up (`grep`/open the file). If it does not exist, either
**create it per the contract** or ask. Never "just call it and see".

## 3. Identifier audit (run before finishing any task)
List every identifier you introduced or referenced from outside the file and prove each
exists:
```
Identifier            Defined at            Used at
AC.collide.move       js/engine/collide.js:12   js/world/entities.js:88
```
Use `grep -rn "<name>" js/ css/ index.html` to confirm. Any identifier you cannot locate is
a hallucination: fix it before reporting.

## 4. The "no invention" list
Never invent: file paths · asset filenames · tile indices · function signatures of existing
code · CSS class names · event names (use `docs/ARCHITECTURE.md` §3) · library/browser API
methods · theory facts · URLs · license text · test results · performance numbers.
If you need one, **look it up in the repo/docs or write `UNKNOWN`**.

## 5. Theory-content safety
- Source = `docs/DOMAIN_SPEC.md` only.
- Displayed values are computed by `js/logic/`.
- For every lesson/exam item, run the logic function and compare with the golden values in `DOMAIN_SPEC.md` §7 where applicable.
- If a fact you want to state is not in the spec, add it to "Open questions" instead of writing it.

## 6. Running things
- If you can run code (Node, a headless browser): run it, paste the real output.
- If you cannot: write `[NOT VERIFIED]` and give the human an exact manual check (URL/file to open, keys to press, expected result).
- Never write "tests pass" without having executed them in this session.

## 7. Uncertainty behavior
- Two plausible interpretations → ask one concrete question with a recommended default.
- Docs disagree → quote both, ask which wins; do not pick silently.
- Failing test, cause unknown after two attempts → stop, report what you tried and the evidence.

## 8. Self-check questions (answer before the report)
1. Did I open every file whose contents I rely on?
2. Is every identifier I used defined somewhere I can cite?
3. Did I run what I claim works? Where is the output?
4. Did I touch anything outside the task's file list? Why?
5. Did any theory statement come from memory instead of `DOMAIN_SPEC.md`?
6. Did I add a global, a dependency, a URL, or a hard-coded result?
If any answer is bad, fix it or disclose it.

## 9. Red-flag phrases (stop and re-verify if you are about to write them)
"should work", "typically", "usually in these projects", "I assume the function is called…",
"the standard tile index for…", "this library has a method…", "all tests pass" (without output).
