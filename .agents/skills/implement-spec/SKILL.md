---
name: implement-spec
description: "Coordinate and implement tickets from an implementation plan using the Task Graph Frontier model."
---

# Implement Spec (Task Graph Frontier Coordinator)

Coordinate execution of implementation plans (`.agents/plans/PLAN_[TICKET].md`) or epic slices using a **Task Graph with blocking relationships** and an active **Frontier**.

## Core Philosophy

1. **Tickets are a Task Graph, not a flat list:** Tickets have dependency and blocking relationships. There is always a **Frontier** of tickets that are currently unblocked and ready to be implemented.
2. **Sequential or Branch Isolation:**
   - **Source Control Safety Guard:** Git commands are strictly human-controlled. AI agents must not execute autonomous git checkout/worktree/merge commands.
   - In the shared workspace, tickets on the Frontier are executed sequentially through the 4-Station Pipeline to prevent file locks and test port collisions.
   - If isolated branch workspaces are configured via subagent harness, subagents work within their designated worktrees and report diffs back.
3. **Sparse Communication via Context Pointers:** Communicate primarily through links and pointers (`file:///...` links to plans, epics, specs, tests). Do not dump verbose files into context.

## Workflow

### 1. Map the Task Graph & Identify the Frontier
- Inspect the plan or epic ledger (`docs/epics/[epic]/_epic_ledger.md`).
- Identify the dependency tree: Which tickets are prerequisites for others?
- Extract the **Active Frontier**: The subset of tickets whose prerequisites are 100% completed.

### 2. Execute Tickets on the Frontier
For each ticket on the Frontier, execute the **4-Station Closed-Loop Pipeline** (mandated by `GEMINI.md`):
- **Station 1 (RED Contract Test):** `qa-tester` writes failing contract tests (`tests/**`). Strict Adversarial Inversion.
- **Station 2 (GREEN Implementation):** `implementer` writes minimum production code (`src/**`) to pass tests. Zero bug-codification.
- **Station 2.5 (Fast Pre-Filter):** `scout` runs `tsc --noEmit`, `check:loc`, dirty cast check (`as any`), and console.log purge.
- **Station 3 (Independent Review Funnel):**
  - Phase 3.0: Physical visual evidence capture (Dual-viewport 1280x800 & 360x740) or explicit Pure Logic Waiver.
  - Phase 3.1: `spec-reviewer` verifies 100% spec fidelity and zero scope drift.
  - Phase 3.2: `code-reviewer` audits deep architecture, anti-slop, and memory/socket leaks; visual critics audit aesthetics.
- **Station 4 (Adversarial Boundary & Mutation Sentinel):** `chaos-sentinel` executes 3 physical probes (closed-loop parity, ephemeral port: 0 probe, mutation sensitivity probe).

### 3. Advance the Frontier
- Once a ticket signs off DoD 1-6 and passes Station 4, update the ledger (`_epic_ledger.md`) and generate the completion report (`docs/reports/..._report.md`).
- Re-evaluate the Task Graph: Mark the ticket as RESOLVED.
- Identify new tickets whose dependencies are now cleared, adding them to the new **Frontier**.
- Repeat until the entire graph is resolved.

### 4. Final Review & Presentation
- Run global regression checks: full test suite and typecheck.
- Present the final completion report to the user using the concise `pr` skill format (`## Summary`, `## Evidence`, `## Merge Danger`).
