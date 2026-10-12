# Automata City — AI Agent Kit

A set of markdown files that prepare an AI coding agent to turn **Automata City** (the
automata-theory learning site) into an **open-world browser game** without guessing,
inventing APIs, or drifting from the plan.

## Why this exists

AI agents hallucinate in predictable ways: invented function names, invented asset or tile
IDs, invented library APIs, wrong theory facts, silently changed architecture, and
"it works" claims that were never run. This kit counters each one:

| Failure | Countermeasure (file) |
|---|---|
| Invents function/variable names from the old code | Ground-truth pass before any edit (`workflows/M0_refactor.md`, `workflows/00_anti-hallucination.md`) |
| Invents tile/asset IDs and file names | Asset manifest + tile contact sheet; placeholder-first art (`docs/ASSETS.md`) |
| Gets automata/sets/tree facts wrong | Authoritative facts + verified golden tests (`docs/DOMAIN_SPEC.md`) |
| Changes architecture mid-way | Module contracts + decision log (`docs/ARCHITECTURE.md`, `docs/DECISIONS.md`) |
| Claims success without running anything | Evidence tags + task report template (`workflows/02_task-loop.md`) |
| Loses context between sessions | Session lifecycle + progress file (`workflows/01_session-lifecycle.md`, `docs/PROGRESS.md`) |

## Install

1. Copy this folder into the project root as `agent-kit/`.
2. Copy `AGENTS.md` to the project root. Many agent tools read `AGENTS.md`; for Claude Code
   also copy it to `CLAUDE.md`. For other tools, paste it into their rules/custom-instructions
   file.
3. Commit everything. Create a git branch per milestone (`m0-refactor`, `m1-walking`, ...).

## How to run a session

1. Open a **fresh** chat/session with the agent.
2. Paste the **Session start** prompt from `prompts/PROMPTS.md`.
3. Paste the prompt for the current milestone (also in `prompts/PROMPTS.md`).
4. Review the agent's task reports. Do not accept "done" without evidence tags.
5. End with the **Handoff** prompt so `docs/PROGRESS.md` is updated.

**One milestone per session** (or per chat). Long chats degrade; the files carry the memory.

## What to load when

| Situation | Load |
|---|---|
| Every session | `AGENTS.md`, `docs/PROGRESS.md` |
| Writing code | + `docs/ARCHITECTURE.md`, `docs/CONVENTIONS.md`, the milestone workflow |
| Anything with theory content (lessons, exam, tests) | + `docs/DOMAIN_SPEC.md` |
| Anything with art/sound/fonts | + `docs/ASSETS.md` |
| Design questions | + `docs/PROJECT_BRIEF.md`, `docs/DECISIONS.md` |
| Fixing a bug / reviewing | + `workflows/03_fix-and-review.md` |

## Order of work

`M0 refactor → M1 walking prototype → M2 stations wired → M3 blackboard lessons →
M4 world and feel → M5 minigames (optional) → M6 finale and ship`

Do not start a milestone until the previous one's acceptance criteria are all checked in
`docs/PROGRESS.md`.

## Status of facts in this kit

The kit was written from the project's README, DOCUMENTATION.md and CSS. The `js/*.js`
files were **not** available to the author, so every statement about existing function
names is marked **UNVERIFIED** until the agent completes the ground-truth pass in M0.
Coordinates, speeds and sizes in `docs/ARCHITECTURE.md` are **defaults**, adjustable in M1
through a new entry in `docs/DECISIONS.md`.
