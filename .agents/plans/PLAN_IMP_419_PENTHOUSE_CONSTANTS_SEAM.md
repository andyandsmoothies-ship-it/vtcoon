# PLAN_IMP_419: Penthouse Lobby Theme Constants Seam & Circular Dependency Purge

## 1. Context & Architectural Goal
- **Source Strategy**: Boundary audit `npm run lint:boundaries` detected circular dependency component `[SCC-2]` (2 files in cycle): `penthouse_lobby_scene.tsx` <-> `penthouse_enclosure.tsx`.
- **Classification**: Tier 1.5 Structural Refactor (0 FSM changes, 0 economic math changes, 0 DOM layout shifts). Main Agent executes directly.
- **Subsystem Boundary Isolation**: Strictly confined to `src/client/3d/` (`client-3d` subsystem, cohesive units: `penthouse`).
- **Problems**:
  1. `penthouse_enclosure.tsx` (line 5) imports `PENTHOUSE_COLORS` and `PENTHOUSE_DIMENSIONS` from `./penthouse_lobby_scene`.
  2. `penthouse_lobby_scene.tsx` (line 4) re-exports `PenthouseEnclosure` from `./penthouse_enclosure`, forming a circular dependency cycle (`[SCC-2]`).
- **Architectural Solution & Seam Discipline**:
  1. Extract pure theme constants `PENTHOUSE_DIMENSIONS` and `PENTHOUSE_COLORS` into new leaf module `src/client/3d/penthouse_constants.ts` (Tier 1 Constants <= 40 LOC, 0 dependencies).
  2. Rewire `penthouse_enclosure.tsx` and `penthouse_lobby_scene.tsx` to import constants from `./penthouse_constants.js`.
  3. Retain re-export in `penthouse_lobby_scene.tsx` to preserve 100% backward compatibility for living test callers.
  4. Pure-Move Quarantine: Preserve 100% numerical dimensions and hex color codes.

### Principles Applied
- **View-Model Seam Extraction** -> Pure architectural dimensions and PBR colors isolated into zero-dependency constants seam.
- **Zero Circular Dependency Invariant** -> Eradicates the last circular dependency cycle in `src/client/3d/`, achieving ZERO-CYCLE (0 SCC).
- **Pure-Move Quarantine** -> Preserves 100% visual attributes across VIP lounge floor, carpet, walls, and ceiling.
- **Equivalence-Partition Testing** -> Partitioned across Tarjan SCC cycle elimination, AST import source verification, and theme value parity.
- **Relational Multi-Point Assertion** -> Verifies multi-point non-equality across distinct theme properties to prevent hardcoded returns.

---

## 2. Target Files & Honest LOC Accounting

| Target Physical File | Subsystem Tier | Baseline LOC | Expected LOC | Net Delta | Max Budget | Budget Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/penthouse_constants.ts` | Tier 1 (Constants) | 0 | 24 | +24 | 40 | Safe (New Constants Seam) |
| `src/client/3d/penthouse_lobby_scene.tsx` | Tier 2 (3D/Views) | 48 | 27 | -21 | 500 | Safe (Imports Seam & Re-exports) |
| `src/client/3d/penthouse_enclosure.tsx` | Tier 2 (3D/Views) | 216 | 216 | 0 | 500 | Safe (Decoupled to Constants Seam) |
| `tests/client/imp419_penthouse_constants_seam.test.ts` | Living Test | 0 | 85 | +85 | 600 | Safe (New Contract Suite) |

---

## 3. Drop-In Replacement Snippets & New Code Specifications

- **Target physical file**: `src/client/3d/penthouse_constants.ts` (New file)
```typescript
// [TC-P3.1/MSS] penthouse_constants.ts — Hằng số kiến trúc & Bảng màu Penthouse Lounge (IMP-419)

export const PENTHOUSE_DIMENSIONS = {
  tableRadius: 1.8,
  tableHeight: 0.95,
  carpetRadius: 3.4,
  chairDistance: 2.45,
  ceilingHeight: 4.8,
  roomRadius: 12,
} as const;

export const PENTHOUSE_COLORS = {
  marbleFloor: '#0B0F19',
  carpet: '#1E293B',
  goldBezel: '#F59E0B',
  walnutTrim: '#3E2723',
  chairLeather: '#D4C5B9',
  chairLeg: '#D97706',
  hologramCyan: '#06B6D4',
  hologramAmber: '#F59E0B',
  sunsetGlow: '#FB923C',
  wallMarble: '#F1F5F9',
  coveWarm: '#FDE047',
} as const;
```

- **Target physical file**: `src/client/3d/penthouse_enclosure.tsx`
```typescript
<<<<
import { PENTHOUSE_COLORS, PENTHOUSE_DIMENSIONS } from './penthouse_lobby_scene';
====
import { PENTHOUSE_COLORS, PENTHOUSE_DIMENSIONS } from './penthouse_constants.js';
>>>>
```

- **Target physical file**: `src/client/3d/penthouse_lobby_scene.tsx`
```typescript
<<<<
export const PENTHOUSE_DIMENSIONS = {
  tableRadius: 1.8,
  tableHeight: 0.95,
  carpetRadius: 3.4,
  chairDistance: 2.45,
  ceilingHeight: 4.8,
  roomRadius: 12,
} as const;

export const PENTHOUSE_COLORS = {
  marbleFloor: '#0B0F19',
  carpet: '#1E293B',
  goldBezel: '#F59E0B',
  walnutTrim: '#3E2723',
  chairLeather: '#D4C5B9',
  chairLeg: '#D97706',
  hologramCyan: '#06B6D4',
  hologramAmber: '#F59E0B',
  sunsetGlow: '#FB923C',
  wallMarble: '#F1F5F9',
  coveWarm: '#FDE047',
} as const;
====
export * from './penthouse_constants.js';
>>>>
```

---

## 4. Station 1 Contract Test Specifications (Lean Invariants)

- **TC-419.01 [UC-PENTHOUSE-CONSTANTS-ZERO-CYCLE/MSS]**: Given penthouse modules in client-3d, When executing Tarjan SCC cycle analysis, Then proves zero circular dependency cycles exist between them.
- **TC-419.02 [UC-PENTHOUSE-CONSTANTS-AST-DECOUPLING/MSS]**: Given penthouse_enclosure.tsx and penthouse_lobby_scene.tsx, When inspecting AST import declarations, Then neither imports circularly and both import from `./penthouse_constants.js`.
- **TC-419.03 [UC-PENTHOUSE-CONSTANTS-VALUE-PARITY/MSS]**: Given theme constant objects, When asserting dimensions and colors, Then verifies exact value parity and immutability between constants seam and lobby scene re-exports.

---

## 5. Regression Verification Plan

Execute the contract test alongside living VIP lounge test suites:
```bash
npx --yes vitest run tests/client/imp419_penthouse_constants_seam.test.ts tests/client/penthouse_lobby_scene.test.ts
```

Execute evidence audit:
```bash
node scripts/check_evidence.mjs imp-419
```

---

## 6. Definition of Done (DoD) & Stopping Criteria

1. `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_419_PENTHOUSE_CONSTANTS_SEAM.md --auto-sign` passes with 0 defects.
2. `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_419_PENTHOUSE_CONSTANTS_SEAM.md` passes with 0 scope leaks.
3. `npm run lint:boundaries` confirms the circular dependency cycle is completely eradicated and client-3d reaches 0 SCC.
4. `npm run prefilter -- src/client/3d/penthouse_constants.ts src/client/3d/penthouse_enclosure.tsx src/client/3d/penthouse_lobby_scene.tsx tests/client/imp419_penthouse_constants_seam.test.ts` passes with 0 warnings/errors.
5. All living penthouse test suites pass 100% green.
6. Clean mechanical verification under check_evidence.
