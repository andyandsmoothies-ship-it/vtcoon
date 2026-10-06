# AGENTS CONSTITUTION (PROJECT HARNESS)

> Precedence: This project harness specializes Global AG OS Rules. Project rules strictly override global rules in case of conflict.
> Language Policy: All settings, instructions, and harness files must be in concise English. User-facing reports (`docs/reports/**`) and game artifacts must be in Vietnamese.

## 1. MANDATORY MECHANICAL GATES
Every ticket must pass 100% of automated gates before handoff:
1. **Plan Audit & Signoff**: `node scripts/audit_plan.mjs <plan_path> [--auto-sign]`
2. **Scope Confinement**: `node scripts/check_scope.mjs [plan_path]`
3. **Fast Pre-Filter (Type, LOC, Linters, Assert Density)**: `npm run prefilter -- <files>`
4. **Live Socket Port 0 & Mutation**: `npm run sentinel -- --ticket <id> --test <test_path>`
5. **Comprehensive Evidence Audit**: `node scripts/check_evidence.mjs <ticket>`

## 2. IRON LAWS (NEGATIVE CONSTRAINTS - VIOLATION = EXIT 1)
- **Zero Dirty Casts**: FORBIDDEN `as any`, `as unknown as T` across `src/**` and `tests/**`.
- **Anti-TIDD**: FORBIDDEN test-only exports, props, methods (`ForTesting`). All new exports in `src/**` must have consumers outside `tests/**`.
- **Seam Discipline**: Interface is the test boundary. FORBIDDEN monkey-patching frameworks (`spyOn(React)`, `__CLIENT_INTERNALS_*`, `Object.prototype`).
- **LOC Ceilings**: Tier 1 (Domain/FSM/Server) <= 400 LOC; Tier 2 (UI/3D/Views) <= 500 LOC; Tier 3 (Static Config) <= 800 LOC; Living Tests <= 600 LOC. Measure via `npm run check:loc`. Code-golfing banned.
- **Assertion Density**: 1-4 asserts (`expect`) per atomic test. FORBIDDEN loops (`for`, `forEach`) in `it()`.
- **Fast & Deterministic Testing**: Use seeded PRNG, zero-delay sockets, fake timers. FORBIDDEN unseeded `Math.random()` and arbitrary sleeps (>= 3000ms).
- **Non-Interactive CLI Guard**: FORBIDDEN naked `npx <pkg>` without `--yes` in subshells. FORBIDDEN inline multiline PowerShell in `-e "..."`.
- **Client/Server Boundary**: FORBIDDEN importing Node runtime built-ins (`node:*`, ws) into client bundles. Sockets must use dynamic `port: 0`.
- **Pure-Move Quarantine**: Refactors must preserve 100% behavior. No semantic changes, no error swallowing (`try...catch`).
- **Poka-Yoke UI Affordance**: Button enabled/disabled states and displayed costs MUST derive directly from Domain Validators (`canDo`, `evaluation`), never recalculated independently.
- **i18n Exhaustiveness**: Every `ActionRejectReason` code must map 100% in `src/domain/i18n/vi.ts` typed `Record<ActionRejectReason, string>`.

## 3. LEAN PIPELINE
- **Tier 1 (Fast-Track)**: < 50 LOC, visual/CSS/spacing, copy, isolated fix (0 Schema, 0 FSM, 0 Net). Main Agent executes directly in 1-2 min, 0 subagents, 0 plan.
- **Micro-Slice (<= 50 LOC, 1 subsystem)**:
  1. Draft Lean Plan: `.agents/plans/PLAN_[ID].md` (<= 200 lines, 0 code-dump).
  2. Machine Plan Audit: `node scripts/audit_plan.mjs <plan> --auto-sign` (0 defects auto-signs `HARDENED_APPROVED`).
  3. Human Gate: User approves ("đồng ý").
  4. Station 1 (RED): `qa-tester` writes contract tests in `tests/**` (Adversarial Inversion: fails on runtime assertions).
  5. Station 2 (GREEN): `implementer` writes minimal code in `src/**`.
  6. Mechanical Gates: Run `npm run prefilter -- <files>` and `npm run check:scope`.
  7. Audit & Delivery Reports: Main Agent runs `npm run report -- [ID]` to synthesize physical station audits (`.agents/audit/SPEC_REVIEW_[ID].md`, `CODE_REVIEW_[ID].md`) and the comprehensive acceptance report (`docs/reports/improvements/IMP-[ID]-[slug]_report.md`) embedding all subagent comments/verdicts, captures Dual-Viewport (for UI changes), and delivers to User.
- **Epic / Large Feature (> 50 LOC, > 2-3 files)**:
  - Must run **Auto-Slicing Protocol** emitting Micro-Slices Roadmap (< 10 lines) before planning.
  - Must run 1 adversarial round (`adversarial-challenger`) writing to `.agents/audit/PLAN_CHALLENGE_[TICKET].md` to block game design / economic exploits.

## 4. SSOT DOMAIN GOTCHAS (docs/domain/gotchas/)
Consult the respective pillar before planning or modifying code:
- FSM & Game Lifecycle: [`fsm_lifecycle.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/fsm_lifecycle.md)
- Economy & Treasury: [`economy_treasury.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/economy_treasury.md)
- Bot AI Negotiation: [`bot_negotiation.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/bot_negotiation.md)
- Network & Live Sockets: [`network_delta.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/network_delta.md)
- UI & Touch Ergonomics: [`ui_ergonomics.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/ui_ergonomics.md)
- 3D Graphics & Mobile: [`3d_cinematics.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/3d_cinematics.md)
- Testing Traps: [`testing_traps.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/testing_traps.md)
- Deep Module Design: [`deep_modules.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/deep_modules.md)
