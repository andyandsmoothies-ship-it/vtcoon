---
name: retro
description: "Conduct a retrospective on a coding session to improve SDLC guardrails, tools, and agent environment."
disable-model-invocation: true
---

# Session Retrospective & Guardrail Hardener

Conduct a retrospective on a completed task, ticket, or batch to evaluate friction, optimize the agent environment, and turn recurring mistakes into automated mechanical checks.

## Core Philosophy

1. **Default to Building the Check Over Writing the Rule:**
   - Classify every defect or friction:
     - **Mechanical violations** (syntactic patterns, banned APIs, bad imports, client/server bundle leaks, line squishing, file paths, uncommitted git files) get a **deterministic check** (e.g. custom rules in `scripts/audit_plan.mjs`, `scripts/check_scope.mjs`, or `npm run prefilter`).
     - Reserve `GEMINI.md` and `docs/domain/gotchas/` for genuine **domain invariants and architectural judgement calls** that no automated script can substitute for.
2. **Implementation vs Review Context Pressure:**
   - The **Implementer agent** has the highest context pressure (exploration, writing code, running tests, resolving compiler errors).
   - The **Reviewer agent** has the lowest context pressure (receives a diff, zero exploration needed).
   - Therefore, the Reviewer agent (`scout`, `spec-reviewer`, `code-reviewer`) must be responsible for strictly enforcing standards, not the Implementer.

## Retrospective Categories

When auditing a session or ticket run, look for candidates in these 7 categories:

- **1. Navigation & Hidden Dependencies:** How easy was it for the agent to find the right files? Are there hidden couplings between modules? Would a navigation pointer make it faster?
- **2. Automated Checks (Guardrails):** Are there automated checks that could catch errors the agent made? (Linting, typing, test sensitivity, scope checkers). Read the repo's existing scripts first: an unwired or broken check is a finding. An un-checked pattern is a standing missed opportunity.
- **3. Coding Standards & Review Gates:** Should the reviewer agent be given a new check to enforce? Classify violations: mechanical violations get a deterministic script; judgement calls get documented in review checklists.
- **4. Global Instructions & Harness Rules:** Are there steering instructions in `GEMINI.md` that can be automated or moved to coding standards? Prune bloat.
- **5. Tool Economy & Latency:** Did the agent make expensive or redundant tool calls? Can checks be batched into fast zero-token scripts?
- **6. No-ops & Dead Guidance:** Look for instructions in steering files that don't alter agent behavior or are never triggered.
- **7. Information Access & Ground Truth:** Did the agent lack crucial physical baseline data (DOM rects, actual test counts, exact line numbers, dev server logs)?

## Output & Integration

Feed findings directly into:
1. **The Standardized Telemetry Block** at the end of each subagent dispatch:
   ```markdown
   ### 🩺 SDLC HARNESS TELEMETRY
   - **Scripts/Tools**: [PASS | Friction description]
   - **Rules/Gotchas**: [PASS | Friction description]
   - **Skills/Context**: [PASS | Missing/Unused skill feedback]
   - **Handoff Quality**: [PASS | Upstream ambiguity or missing context]
   - **Harness Suggestion**: [1 actionable suggestion to improve SDLC process, scripts, or settings]
   ```
2. **The Ticket Completion Report:** `docs/reports/improvements/IMP-[ID]-[slug]_report.md` (§ "ĐÁNH GIÁ VẬN HÀNH & ĐỀ XUẤT CẢI TIẾN SETTING SDLC").
