---
name: session-resume
description: Universal context recovery skill to cleanly inspect physical workspace state, latest plan, and test outcomes after session interruption, context compaction, or machine restart.
---

# SESSION RESUME SKILL (PICKUP PROTOCOL)

## 1. PURPOSE & APPLICABILITY
Activate when starting a new session or waking from context interruption on an ongoing ticket across any project.

- **Objective**: Re-anchor physical reality in under 30 seconds with zero hallucinations.

---

## 2. THE 4-STEP RECONCILIATION PROTOCOL

### Step 1: Physical Git Inspection
Run non-destructively:
```bash
git status --porcelain
```
- Identify unstaged modifications, staged commits, and untracked files.
- Verify if the branch is dirty or clean.

### Step 2: Plan State Recovery
1. Locate the newest plan in `.agents/plans/` (or project ticket directory):
   - Check ticket ID and title.
   - Check plan approval status (`status: APPROVED` or pending approval).
2. Identify the active Station:
   - **Station 1 / 1.8**: Plan drafting or awaiting human gate.
   - **Station 2**: Contract tests scaffolded (RED).
   - **Station 2.5**: Implementation in progress (GREEN).
   - **Station 3 / 3.5**: Mechanical verification, sentinel, or review.
   - **Station 4**: Ready for report synthesis.

### Step 3: Fast Test Reality Check
Run the project's fast test suite (e.g. `npm test`, `pytest`, `cargo test`, `go test`):
- Do existing contract tests pass or fail?
- Are we in Semantic RED or has code broken regressions?

### Step 4: Output Concise Pickup Brief
Present exactly 4 bullet points to the user/session:
- **Active Ticket & Scope**: `[ID] - [Title] (Scope: Express / Refactor / Feature)`
- **Current Physical Station**: E.g. `Station 2.5 GREEN (Implementation)`
- **Working Tree Delta**: Count of modified files and test suite pass/fail state.
- **Immediate Next Action**: The exact command or edit required to proceed.
