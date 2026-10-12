# Copy-paste Prompts

Replace `<…>` placeholders. Paste the **Session start** prompt first in every new chat, then
one of the others.

---
## 1. Session start (every new session)
```
You are building "Automata City", an open-world browser game, from an existing vanilla-JS site.

Read, in this order: AGENTS.md, docs/PROGRESS.md, workflows/01_session-lifecycle.md,
workflows/00_anti-hallucination.md, workflows/02_task-loop.md.

Then run Section A of the session lifecycle (inspect the repo, run tests if they exist) and
post a Start report. Rules for this whole session:
- Tag every claim [VERIFIED], [READ], [ASSUMED] or [UNKNOWN].
- Never use an identifier, file, tile id, or asset you have not opened or confirmed.
- If something is not in the repo, the docs, or my messages, say UNKNOWN and ask.
- Do not start coding until you have posted the Start report.
```

---
## 2. Start a milestone
```
Current milestone: <M0 | M1 | … | M6>.
Read workflows/<M#_name>.md and every doc listed under "Load".
Do the tasks IN ORDER, ONE at a time, following workflows/02_task-loop.md.
After each task: post the task report, update docs/PROGRESS.md, commit, then STOP and wait
for my "continue". Do not begin the next task on your own.
Begin with task <M#.1>.
```

---
## 3. M0 first prompt (ground truth, no code changes)
```
Task M0.1 only. Do not modify any existing file. Copy the original site into legacy/ and
write docs/GROUND_TRUTH.md exactly as specified in workflows/M0_refactor.md.
Every entry needs path:line. Open every file in js/, css/ and index.html; do not rely on
docs/DOCUMENTATION.md, which may be outdated (list any disagreements you find between the
code and DOCUMENTATION.md). When finished, post the task report and wait.
```

---
## 4. Single task
```
Do task <M#.#> from workflows/<file>.md and nothing else.
First post: (a) the Done-when criteria, (b) your Grounding list with path:line for every
existing identifier you will use, (c) the files you will touch (max 5), (d) the tests you
will add. Wait for my "go" only if you listed UNKNOWN items; otherwise proceed.
Finish with the task report template and the identifier audit.
```

---
## 5. Bug fix
```
Follow workflows/03_fix-and-review.md §A.
Bug: <what happens>. Expected: <what should happen>. Steps: <how to reproduce>.
First reproduce it and show evidence. Add a failing test (or a manual check if visual).
Explain the root cause with path:line evidence before changing code. Smallest fix only.
If two attempts fail, stop and report what you observed.
```

---
## 6. Review (use a fresh chat; do not reuse the author's session)
```
You are a strict reviewer. Read AGENTS.md, docs/ARCHITECTURE.md, docs/CONVENTIONS.md,
docs/DOMAIN_SPEC.md, and workflows/03_fix-and-review.md §B.
Review the changes on branch <branch> against main (git diff main...<branch>).
Perform the hallucination audit first: for every identifier, asset, tile id, event and API
call, find where it is defined (path:line) or flag it. Then check contracts, theory
correctness, constraints, lifecycle, performance, accessibility, scope and docs.
Output findings by severity with path:line and finish with a verdict (Accept / Accept after
fixes / Reject). Do not fix anything.
```

---
## 7. Hallucination audit (any time, quick)
```
Pause. Produce a table of every function, variable, CSS class, DOM id, file path, asset,
tile id, event name and browser API you used in your last change that is defined outside the
file you edited. For each, give path:line (or the doc section) proving it exists, and run
grep to confirm. Mark anything you cannot prove as HALLUCINATED and fix it. Then list every
claim in your last report that lacks a [VERIFIED] or [READ] tag.
```

---
## 8. Write a lesson (M3.4)
```
Write the <str | set | tree | dfa> lesson following workflows/M3_blackboard-lessons.md §M3.4.
Use only facts from docs/DOMAIN_SPEC.md. Each step: title ≤ 6 words, say ≤ 30 words,
a draw() that calls AC logic for every displayed value. Do not hard-code results.
Also produce the test that (1) checks the word limit and step count, and (2) replays the
steps and compares computed values with the golden values in DOMAIN_SPEC.md §7 where they
exist. Finally list any fact you wanted to state that is NOT in DOMAIN_SPEC.md (do not write
it into the lesson).
```

---
## 9. Asset picks (M4.1)
```
I have put the asset packs in assets/sprites/ and filled assets/MANIFEST.md.
Build tools/contact-sheet.html for <file> with tile size <16>. Do not guess any tile id.
After I fill docs/ASSET_PICKS.md, convert it into js/world/tiles.js named constants and
replace placeholders only for entries I filled. Entries marked ?? stay placeholders.
```

---
## 10. Handoff (end of session)
```
Run Section C of workflows/01_session-lifecycle.md: update docs/PROGRESS.md (done with
evidence, not done, exact next task, files changed, decisions, open questions, surprises),
append any new decisions to docs/DECISIONS.md, and commit "chore: handoff after <task>".
Then print the "Last session summary" so I can paste it into the next session.
```

---
## 11. Recovery after a context reset
```
New session. Assume you remember nothing. Run the Session start prompt steps, trust the repo
over docs/PROGRESS.md if they disagree (and fix PROGRESS.md), and tell me the next task.
Last session summary (from PROGRESS.md): <paste>
```

---
## 12. Correction prompts
**Claimed "done" without evidence**
```
You reported success without [VERIFIED] evidence. Run the verification steps now, paste the
real output, and re-issue the task report. If you cannot run something, mark it
[NOT VERIFIED] and give me the exact manual check.
```
**Invented an API / identifier**
```
<name> does not exist in this repo (I could not find it). Per the anti-hallucination
protocol, find the real definition with grep or create it according to the contract in
docs/ARCHITECTURE.md. Then re-run the identifier audit for the whole task.
```
**Scope creep**
```
Your diff touches files outside the task's file list: <files>. Revert those changes unless
you can show why the task cannot be completed without them, and then ask me first.
```
**Theory doubt**
```
Check your statement "<claim>" against docs/DOMAIN_SPEC.md. Quote the section. If it is not
there, remove the claim from the content and list it under Open questions.
```
