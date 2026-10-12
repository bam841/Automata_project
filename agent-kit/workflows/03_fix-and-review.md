# Bug-Fix and Code-Review Workflows

## A. Bug fix
1. **Reproduce first.** Write the exact steps and expected vs actual. If you cannot reproduce, say so and stop.
2. **Failing test.** For logic bugs, add a failing test in `tests/`. For visual/behavior bugs, write a manual check with expected result.
3. **Root cause with evidence.** Cite `path:line` and the observation (log, value, trace) that proves the cause. No guessing: if you only have a hypothesis, label it `[ASSUMED]` and add a log/assert to test it.
4. **Smallest fix.** Change only what the cause requires. No refactors.
5. **Verify.** Failing test now passes; whole suite passes; the manual check passes.
6. **Regression thinking.** List what else uses the changed code (`grep`) and re-check it.
7. **Report** with the task-loop template. Add the bug and fix to `PROGRESS.md` → Known issues (closed).

Two failed attempts → stop and report evidence; don't keep trying variations.

## B. Code review (use on every milestone before the human accepts it)
Review the diff against these, in order. Output findings by severity (**Blocker / Major / Minor / Nit**) with `path:line`.

1. **Hallucination audit:** for each identifier, asset, tile id, event, and API call — does it exist? Is it in `AC` and in the contract? Any URL/CDN/library appearing?
2. **Contracts:** matches `docs/ARCHITECTURE.md` (shapes, events, module API)? Any undocumented change?
3. **Theory correctness:** every theory statement/value traceable to `docs/DOMAIN_SPEC.md`; displayed values computed by `js/logic/`; tests exist and cover edge cases.
4. **Constraints:** `file://` friendly, no modules/fetch, no new globals, no inline handlers, no dependencies.
5. **Lifecycle:** `mount`/`unmount` symmetrical; listeners/timers/rAF cleaned; open/close ×20 stable.
6. **Performance:** no per-frame allocations in hot paths; static layers pre-rendered.
7. **Accessibility:** keyboard path, focus trap/restore, reduced motion, contrast, labels.
8. **Security hygiene:** user text escaped; storage in try/catch.
9. **Scope:** only the task's changes; no drive-by edits; files ≤ ~400 lines.
10. **Docs:** `PROGRESS.md`/`DECISIONS.md` updated; manifest has license lines for new assets.

End with a verdict: *Accept*, *Accept after fixes (list)*, or *Reject (why)*. The reviewer must
not be the same chat session that wrote the code if you can avoid it — open a fresh one.
