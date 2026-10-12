# Session Lifecycle (start → work → handoff)

## A. Session start (always, in this order)
1. Read `AGENTS.md`.
2. Read `docs/PROGRESS.md`: current milestone, what's done, known issues, last session summary.
3. Read the current milestone workflow (`workflows/M<n>_*.md`) and the docs it lists under **Load**.
4. Inspect the repo: list files (`find . -maxdepth 3 -not -path './.git/*'`), `git status`, `git log --oneline -10`.
5. Run the baseline: `node tests/run.js` (if it exists) and note the result.
6. Post a **Start report**:
   - Milestone and the next unchecked task.
   - Baseline test result `[VERIFIED]` (or "tests not yet created").
   - Any mismatch between `PROGRESS.md` and the actual repo (e.g., a box checked but file missing).
   - Questions you must ask before starting (max 3).
7. Wait for the human's go-ahead only if you listed blocking questions; otherwise proceed.

## B. During the session
Follow `workflows/02_task-loop.md` for each task. After each task: update `PROGRESS.md`, commit.

## C. Handoff (end of session, or when context feels long)
Write into `docs/PROGRESS.md` → "Last session summary":
- Done (with evidence), not done, and exact next task.
- Files changed this session.
- Decisions made (also appended to `docs/DECISIONS.md`).
- Open questions for the human.
- Anything surprising in the code (with `path:line`).
Then commit: `chore: handoff after <task id>`.

## D. Recovering after a context reset or a new agent
Treat the repo and `PROGRESS.md` as truth, your memory as nothing. Run section A. If the
repo and `PROGRESS.md` disagree, trust the repo and fix `PROGRESS.md`.

## E. When to end a session early
- The agent has re-asked or contradicted itself.
- It starts "remembering" file contents that it has not re-opened.
- Two consecutive tasks fail verification.
→ Do a handoff, open a fresh session.
