---
name: retro
description: "Conduct a retrospective on a coding session to improve SDLC guardrails, tools, and agent environment."
---

# Session Retrospective & Guardrail Hardener

Conduct a retrospective on a completed task or ticket to evaluate friction, optimize the agent environment, and turn recurring mistakes into automated mechanical checks.

## Core Philosophy

1. **Default to Building the Check Over Writing the Rule:**
   - Classify every defect or friction:
     - **Mechanical violations** (syntactic patterns, banned APIs, bad imports, client/server bundle leaks, line squishing, file paths) get a **deterministic check** (e.g. custom rules in `scripts/audit_plan.mjs`, linter rules, or pre-commit checks).
     - Reserve `GEMINI.md` and `docs/domain/gotchas.md` for genuine **domain invariants and architectural judgement calls** that no automated script can substitute for.
2. **Implementation vs Review Context Pressure:**
   - The **Implementer agent** has the highest context pressure (exploration, writing code, running tests, resolving compiler errors).
   - The **Reviewer agent** has the lowest context pressure (receives a clean diff, zero exploration needed).
   - Therefore, the Reviewer agent (Station 2.5 `scout` + Station 3 `spec-reviewer` and `code-reviewer`) must be responsible for strictly enforcing coding standards, not the Implementer.

## Retrospective Categories

When auditing a session or ticket run, look for candidates in these 6 categories:

- **1. Navigation & Hidden Dependencies:** How easy was it to find the relevant code? Did a server file secretly have client consumers? Add navigation pointers or consumer scans if lookup was slow.
- **2. Automated Checks (Guardrails):** Could an automated script or linter catch the defect before review? (e.g. `scripts/audit_plan.mjs` catching bundle poisoning or code-golf). An un-checked pattern is a missed opportunity.
- **3. Coding Standards & Review Gates:** Did a reviewer miss an anti-slop or memory leak issue? Does `code-reviewer` need an explicit prompt check?
- **4. Tool Economy & Latency:** Did the agent make expensive or redundant tool calls? Can checks be batched into fast zero-token Node.js scripts?
- **5. No-Ops & Dead Guidance:** Are there instructions in `GEMINI.md` or system prompts that don't alter agent behavior or are never triggered? Prune them.
- **6. Information Access & Ground Truth:** Did the agent lack crucial physical baseline data (DOM rects, actual test counts, exact line numbers)?

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
2. **The 2-Round Adversarial Cross-Examination Gate** (Round 1: Physical Evidence Check; Round 2: Adversarial Inversion Filter).
3. **The Ticket Completion Report:** `docs/reports/improvements/IMP-[ID]-[slug]_report.md` (§ "ĐÁNH GIÁ VẬN HÀNH & ĐỀ XUẤT CẢI TIẾN SETTING SDLC").
