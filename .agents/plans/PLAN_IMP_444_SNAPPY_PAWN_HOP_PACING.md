# PLAN_IMP_444: Snappy Pawn Hop Pacing & Dead Air Dwell Reduction

## 1. Context & Architectural Root-Cause
- **Problem**: In bot and human gameplay, the turn flow feels sluggish, slow, and contains frustrating dead air:
  1. *Pawn Hop Sluggishness*: Each pawn step takes 300ms (human: 0.22s hop + 0.08s landing) and 260ms (bot: 0.18s hop + 0.08s landing). Over 10-12 steps, this creates 3.0s-3.6s of tedious watching.
  2. *Dead Air Dwell (1200ms wasted per turn)*:
     - `DICE_SETTLE_DWELL_MS = 600` in `dice_tray.tsx` stalls execution for 0.6s after the dice stop rolling before pawn hops start.
     - `PAWN_LANDING_SETTLE_MS = 600` in `pawn_animator.tsx` stalls execution for 0.6s after pawn landing before turn evaluation/modal triggers.
     Total dead air: 1.2s per turn where nothing moves.
- **Physical Root-Cause**:
  1. `src/client/3d/pawn_path.ts`: `HOP_DURATION` (0.22), `LANDING_DURATION` (0.08), `BOT_HOP_DURATION` (0.18), `BOT_LANDING_DURATION` (0.08), `BOT_STEP_DURATION` (0.26) anchor slow movement.
  2. `src/client/events/pacing_context.ts`: `DEFAULT_HUMAN_STEP_MS` (300), `DEFAULT_BOT_STEP_MS` (260), and `DEFAULT_ROLL_LEAD_MS` (1200) mirror this baseline.
  3. `src/client/3d/dice_tray.tsx`: Hardcoded 600ms settle delay before firing `onRest()`.
  4. `src/client/3d/pawn_animator.tsx`: Hardcoded 600ms settle delay before firing `onComplete()`.
- **Engineering Solution & Adversarial Hardening**:
  - Accelerate pawn flight physics: Human hop duration $0.14\text{s} + 0.06\text{s} = 0.20\text{s}$ (200ms); Bot hop duration $0.10\text{s} + 0.05\text{s} = 0.15\text{s}$ (150ms).
  - Eliminate dead air: Cut `DICE_SETTLE_DWELL_MS` from 600ms to 250ms; cut `PAWN_LANDING_SETTLE_MS` from 600ms to 250ms (saving 700ms dead air per turn).
  - Synchronize presentation timing ([ADV-02]): Align `DEFAULT_ROLL_LEAD_MS` to 1350ms ($1100\text{ms spring} + 250\text{ms dwell} = 1350\text{ms}$), with `DEFAULT_HUMAN_STEP_MS = 200` and `DEFAULT_BOT_STEP_MS = 150`.
  - Self-Healing Unmount Flush ([ADV-03]): Equip `SingleDie` in `dice_tray.tsx` with `[FLUSH-ON-UNMOUNT]` pattern to prevent trapped `isRolling: true` state on unmount.
  - Living Contract Migration ([ADV-01]): Explicitly modernize `imp230`, `imp333`, `imp398`, `pawn_bot_movement_lifecycle`, `pawn_juice`, `pawn_jump_and_camera_smoothness`, and `imp201`.

## 2. Explicitly Dropped Requirements (Sean Goedecke Invariant)
- ❌ **NO Dynamic Speed Sliders**: Will NOT add user-facing settings UI for adjusting pawn animation speeds.
- ❌ **NO Variable Velocity Curves**: Will NOT scale pawn speed based on player balance or board quadrant.
- ❌ **NO Frame Skipping / Teleportation**: Will NOT drop waypoints or skip hop frames; all hops remain visually continuous with full squash-and-stretch.
- ❌ **NO Server Protocol Changes**: Client-side presentation timing only; server-side turn timeout budgets remain unchanged.

## 3. Principles Applied
- `(1) View-Model Seam Extraction` -> Pure math in `pawn_path.ts` remains decoupled from Three.js frame loops.
- `(2) Equivalence-Partition Testing` -> QA contract tests verify human vs bot hop, settle delays, and pacing delays across equivalence boundaries.
- `(3) Relational Multi-Point Assertion` -> Verifies $(HOP + LANDING) = STEP$ and $DEFAULT\_BOT\_STEP\_MS < DEFAULT\_HUMAN\_STEP\_MS$.
- `(4) Ephemeral TTL / Dead Man's Switch` -> Flush-on-unmount in both `pawn_animator.tsx` and `dice_tray.tsx` prevents store lock.
- `(10) Dropped Requirements & Anti-Phantom Complexity` -> No speculative pacing state machines or config sliders.

## 4. Physical Scope & LOC Accounting
| File | Tier | Current LOC | Expected LOC | Net Delta | Max Ceiling | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/pawn_path.ts` | Tier 1 (Logic) | 211 | 211 | ~0 | <= 400 | Safe |
| `src/client/3d/pawn_animator.tsx` | Tier 2 (UI/3D) | 344 | 344 | ~0 | <= 500 | Safe |
| `src/client/3d/dice_tray.tsx` | Tier 2 (UI/3D) | 286 | 290 | +4 | <= 500 | Safe |
| `src/client/events/pacing_context.ts` | Tier 1 (Logic) | 137 | 137 | ~0 | <= 400 | Safe |

> [!NOTE] Harness Authorization
> `[HARNESS_MUTATION_AUTHORIZED]`: Retained SDLC pre-flight auditor upgrades from Sean Goedecke Rule in `scripts/audit_plan.mjs` and `scripts/plan_audit/rules_architecture.mjs`, and probe file `scripts/sentinel_probes/IMP-443.json`.

## 5. Core Contract Invariants
- **INV-444.1 (Human Hop & Step Duration)**: In `pawn_path.ts`, `HOP_DURATION = 0.14` and `LANDING_DURATION = 0.06`, resulting in an exact 200ms step duration ($0.14 + 0.06 = 0.20$).
- **INV-444.2 (Bot Hop & Step Duration)**: In `pawn_path.ts`, `BOT_HOP_DURATION = 0.10`, `BOT_LANDING_DURATION = 0.05`, and `BOT_STEP_DURATION = 0.15`, resulting in an exact 150ms step duration ($0.10 + 0.05 = 0.15$).
- **INV-444.3 (Pacing Context SSOT Alignment)**: In `pacing_context.ts`, `DEFAULT_HUMAN_STEP_MS = 200`, `DEFAULT_BOT_STEP_MS = 150`, and `DEFAULT_ROLL_LEAD_MS = 1350`, keeping the event adapter in 1:1 mathematical synchronization with physical pawn hop and dice settle duration.
- **INV-444.4 (Dead Air Dwell Elimination)**: `DICE_SETTLE_DWELL_MS = 250` in `dice_tray.tsx` and `PAWN_LANDING_SETTLE_MS = 250` in `pawn_animator.tsx`.
- **INV-444.5 (Squash & Stretch Integrity)**: `calculateKineticSquashStretch` and `calculatePawnLandingImpact` maintain dynamic compression curves regardless of duration.
- **INV-444.6 (Flush-on-Unmount Pattern)**: `SingleDie` in `dice_tray.tsx` invokes `onRest?.()` if unmounted while `isRolling` is true to prevent trapped state.

## 6. Implementation Specification (Drop-in Replacements)

### Task 1: Update Kinematic Durations in `pawn_path.ts`
**Target physical file**: `src/client/3d/pawn_path.ts`
```typescript
<<<<
export const HOP_DURATION = 0.22 as const;
export const LANDING_DURATION = 0.08 as const;
export const BOT_HOP_DURATION = 0.18 as const;
export const BOT_LANDING_DURATION = 0.08 as const;
export const BOT_STEP_DURATION = 0.26 as const;
====
export const HOP_DURATION = 0.14 as const;
export const LANDING_DURATION = 0.06 as const;
export const BOT_HOP_DURATION = 0.10 as const;
export const BOT_LANDING_DURATION = 0.05 as const;
export const BOT_STEP_DURATION = 0.15 as const;
>>>>
```

### Task 2: Synchronize Pacing Context in `pacing_context.ts`
**Target physical file**: `src/client/events/pacing_context.ts`
```typescript
<<<<
export const DEFAULT_HUMAN_STEP_MS = 300;
export const DEFAULT_BOT_STEP_MS = 260;
export const DEFAULT_ROLL_LEAD_MS = 1200;
====
export const DEFAULT_HUMAN_STEP_MS = 200;
export const DEFAULT_BOT_STEP_MS = 150;
export const DEFAULT_ROLL_LEAD_MS = 1350;
>>>>
```

### Task 3: Reduce Dice Settle Dwell & Add Flush-On-Unmount in `dice_tray.tsx`
**Target physical file**: `src/client/3d/dice_tray.tsx`
```typescript
<<<<
const DICE_SETTLE_DWELL_MS = 600;
====
const DICE_SETTLE_DWELL_MS = 250;
>>>>
```

```typescript
<<<<
  useEffect(() => {
    return () => {
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
      }
    };
  }, []);
====
  useEffect(() => {
    return () => {
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
        if (useGameStore.getState().isRolling) {
          onRest?.();
        }
      }
    };
  }, [onRest]);
>>>>
```

### Task 4: Reduce Pawn Landing Settle in `pawn_animator.tsx`
**Target physical file**: `src/client/3d/pawn_animator.tsx`
```typescript
<<<<
const PAWN_LANDING_SETTLE_MS = 600;
====
const PAWN_LANDING_SETTLE_MS = 250;
>>>>
```

## 7. Station 1 Test Contracts (`tests/client/imp444_snappy_pawn_hop_pacing.test.ts`)
- `TC-444.01` `[UC-PACE-HUMAN/MSS]`: Given human pawn jump timing, When inspecting `HOP_DURATION` and `LANDING_DURATION`, Then returns `0.14` and `0.06` respectively with exact sum `0.20`.
- `TC-444.02` `[UC-PACE-BOT/MSS]`: Given bot pawn jump timing, When inspecting `BOT_HOP_DURATION`, `BOT_LANDING_DURATION`, and `BOT_STEP_DURATION`, Then returns `0.10`, `0.05`, and `0.15` respectively.
- `TC-444.03` `[UC-PACE-CONTEXT/MSS]`: Given default pacing context configuration, When evaluating `DEFAULT_HUMAN_STEP_MS`, `DEFAULT_BOT_STEP_MS`, and `DEFAULT_ROLL_LEAD_MS`, Then returns exactly `200`, `150`, and `1350`.
- `TC-444.04` `[UC-PACE-SQUASH/MSS]`: Given kinetic squash-stretch function, When evaluating jump progress at intervals [0, 0.1, 0.5, 1.0], Then returns expected deformation scales preserving volume.
- `TC-444.05` `[UC-PACE-LANDING-IMPACT/MSS]`: Given pawn landing impact function, When evaluating progress past 1.0, Then returns restored scale [1, 1, 1].
- `TC-444.06` `[UC-PACE-RELATIONAL/MSS]`: Given human and bot step durations, When comparing execution times, Then bot step is strictly faster than human step ($BOT\_STEP\_DURATION < HOP\_DURATION + LANDING\_DURATION$).

## 8. Living Contract Migration Protocol ([ADV-01])
Existing living test suites asserting old constants will be modernized:
1. `tests/contracts/imp230_pass_go_salary_and_rent_subtractive_clean.test.ts`: Modernize 2-step delay from 600ms to 400ms, 8-step landing delay from 2400ms to 1600ms, and pre-trigger timer threshold from 599ms to 399ms (`#L244-L245, L264, L279, L290, L310-L315`).
2. `tests/client/imp333_audio_and_pacing_subscribers.test.ts`: Modernize `p1LandingDelay` expectation from 2700ms to 2350ms ($1350 + 5 \times 200 = 2350$) (`#L204`).
3. `tests/client/imp398_cinematic_pacing_and_smooth_camera.test.ts`: Update expectations for `HOP_DURATION` (0.14), `BOT_HOP_DURATION` (0.10), `BOT_STEP_DURATION` (0.15), `DEFAULT_HUMAN_STEP_MS` (200), `DEFAULT_BOT_STEP_MS` (150), `DEFAULT_ROLL_LEAD_MS` (1350), derived delay assertions: `humanDelay` (600), `botDelay` (450), `humanPassGoDelay` (400), and `botPassGoDelay` (300).
4. `tests/contracts/imp201_topbar_overflow_and_hud_fixes.test.ts`: Update `expectedDelay` formula to $1350 + 4 \times \text{humanStepMs}$ (`#L260`).
5. `tests/client/pawn_bot_movement_lifecycle.test.ts`: Update expectations for `BOT_STEP_DURATION` (0.15) and `BOT_HOP_DURATION + BOT_LANDING_DURATION` (0.15).
6. `tests/client/pawn_juice.test.ts`: Update expectations for `HOP_DURATION` (0.14) and sum (0.20).
7. `tests/client/pawn_jump_and_camera_smoothness.test.ts`: Update expectations for `HOP_DURATION` (0.14) and sum (0.20).

## 9. Station 3 Verification & Evidence
- Fast Pre-Filter: `npm run prefilter -- src/client/3d/pawn_path.ts src/client/events/pacing_context.ts src/client/3d/dice_tray.tsx src/client/3d/pawn_animator.tsx tests/client/imp444_snappy_pawn_hop_pacing.test.ts`
- Scope Check: `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_444_SNAPPY_PAWN_HOP_PACING.md`
- Chaos Sentinel: `npm run sentinel -- --ticket IMP-444 --test tests/client/imp444_snappy_pawn_hop_pacing.test.ts`
- Evidence Check: `node scripts/check_evidence.mjs IMP-444`

## 10. Definition of Done (DoD)
- Mechanical plan audit passes exit 0 (`node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_444_SNAPPY_PAWN_HOP_PACING.md`).
- Adversarial challenge brief `.agents/audit/PLAN_CHALLENGE_IMP-444.md` addressed and signed.
- 100% contract tests in `imp444_snappy_pawn_hop_pacing.test.ts` pass GREEN.
- All 7 living test suites updated and passing 100%.
- Pre-filter and Chaos Sentinel pass with 100% mutants killed.
- `docs/FEATURE_MAP.md` updated and <= 30 KB.
