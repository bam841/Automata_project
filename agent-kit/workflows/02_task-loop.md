# Task Loop (repeat for every task)

A **task** = one numbered item in a milestone workflow. Never batch several tasks.

## Step 1 — Restate
Copy the task's "Done when" criteria. Add the relevant acceptance criteria. State what is
**out of scope**.

## Step 2 — Ground
Open every file you will touch or depend on. Write the **Grounding list**:
```
- AC.input.pressed — js/engine/input.js:41 [READ]
- contract: Trigger shape — docs/ARCHITECTURE.md §5b [READ]
- UNKNOWN: name of the old tree-layout function → will find via grep
```

## Step 3 — Plan
List files to create/change (≤ 5), the order, and the test(s) you will add or run. If a
contract must change, stop and ask (see `AGENTS.md` → Stop and ask).

## Step 4 — Implement the smallest slice
- Make the minimal change that satisfies the criteria.
- Write/update the test first when the task adds or changes logic.
- No drive-by edits.

## Step 5 — Verify
- Run `node tests/run.js`; open `tests/index.html` if you can.
- Run the task's **Verification** steps from the milestone workflow.
- Open `index.html` via `file://` if you can; check the console is clean.
- Anything you could not run → `[NOT VERIFIED]` + exact manual steps for the human.

## Step 6 — Self-audit
Run the identifier audit and the self-check questions from `workflows/00_anti-hallucination.md`.

## Step 7 — Report (use this template)
```
## Task report: <milestone>.<task>
**Goal / Done-when:** …
**Files changed:** path (created|modified), …
**What I did:** 2–5 lines.
**Verification:**
- [VERIFIED] <command> → <real output summary>
- [NOT VERIFIED] <what> — human check: <steps + expected result>
**Identifier audit:** (table or "no new cross-file identifiers")
**Assumptions:** [ASSUMED] …   (or none)
**Open questions:** [UNKNOWN] …   (or none)
**Risks / follow-ups:** …
**Next task:** <id>
```

## Step 8 — Update and commit
Tick the sub-task in `docs/PROGRESS.md`, append evidence, commit `M<n>: <summary>`.

## Quality gates between tasks
- All earlier tests still pass.
- No new console errors.
- No new global besides `AC`.
- Diff contains only what the task needs.
