# Plan IMP-325: Deactivate Treasury Public Stimulus in Domain & Server Loop

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-325`
- **Subsystem**: `domain-core, server-network` (Tier 1 Domain & Server Economic Engine)
- **Problem Statement**:
  1. **Unwanted Capital Injection & Bailout Distortion**: The game engine currently invokes `processTreasuryStimulus(room)` at every round boundary (`advanceRoundBoundary` in `src/server/turn_loop.ts`). When `room.treasury >= 10,000`, 20% of the public treasury is automatically disbursed to the poorest players. This acts as an unearned dividend/stimulus payout that diminishes the stakes of tactical financial management and distorts end-game competitive dynamics.
  2. **Player Confusion Regarding Dividend Payouts**: The user observed during play that the state ("nhà nước") automatically issues dividend/stimulus payouts when the treasury accumulates funds, and requested to deactivate/remove this mechanism: *"Tôi thấy chức năng nhà nước khi có trên 20k sẽ phát tiền lợi tức nên bỏ hoặc deactivate đi"*.
  3. **Architectural Purity**: By deactivating this feature via an authoritative SSOT toggle, the Treasury acts as a true repository (absorbing taxes, fines, bailouts, and auction revenue) without arbitrarily pumping money back into player balances, preserving macro-economic conservation invariants.
- **Architectural Solution**:
  1. In `src/domain/treasury_stimulus.ts`, introduce the SSOT feature toggle `ENABLE_TREASURY_STIMULUS = false;`.
  2. In `src/server/turn_loop.ts:advanceRoundBoundary`, guard the execution of `processTreasuryStimulus(room)` with `if (ENABLE_TREASURY_STIMULUS)`. This cleanly halts automatic treasury distributions during gameplay without mutating pure domain calculation math.
  3. In `tests/server/imp325_treasury_stimulus_deactivation.test.ts`, write contract test suite verifying that round transitions do not touch treasury balances or distribute funds.
- **Direct Scope**:
  - `src/domain/treasury_stimulus.ts`
  - `src/server/turn_loop.ts`
  - `tests/server/imp325_treasury_stimulus_deactivation.test.ts`
- **Baseline Working Tree Dependencies**:
  - `src/client/ui/modals/game_rules_modal.tsx`
  - `src/client/3d/luxury_pawn_models.tsx`
  - `src/client/3d/adaptive_cinematic_camera.tsx`
  - `src/client/3d/dice_tray.tsx`
  - `src/client/3d/pawn_animator.tsx`
  - `src/client/ui/floating_numbers.tsx`
  - `src/client/ui/notification_deduplicator.ts`
  - `src/domain/pawn_assignment.ts`
  - `src/domain/pawn_configs.ts`
  - `src/server/insolvency_manager.ts`
  - `src/server/room_manager_queries.ts`
  - `tests/client/imp128_desktop_ui_ticker_and_toast_sync.test.ts`
  - `tests/client/imp324_minimum_dwell_and_desktop_ceiling.test.ts`
  - `tests/client/imp326_smooth_pacing_and_cinematic_camera_transitions.test.ts`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/domain/treasury_stimulus.ts` | Tier 1 (Domain/FSM) | 42 | 44 | +2 | <= 400 | ✔️ Safe |
| `src/server/turn_loop.ts` | Tier 1 (Domain/FSM) | 286 | 288 | +2 | <= 400 | ✔️ Safe |
| `tests/server/imp325_treasury_stimulus_deactivation.test.ts` | Living Test | 0 | 149 | +149 | <= 600 | ✔️ Safe |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
**Target physical file**: `tests/server/imp325_treasury_stimulus_deactivation.test.ts` (Tệp mới)

Test Specifications:
- TC-325.01 [UC-TREAS-DEACT/MSS]: Given ENABLE_TREASURY_STIMULUS imported from domain, When inspected, Then equals false confirming deactivation.
- TC-325.02 [UC-TREAS-DEACT/MSS]: Given room at round boundary with treasury 50,000 and poor players, When advanceRoundBoundary is executed, Then treasury balance remains exactly 50,000 without deduction.
- TC-325.03 [UC-TREAS-DEACT/MSS]: Given room at round boundary with active players, When advanceRoundBoundary is executed, Then all player balances remain strictly unchanged.
- TC-325.04 [UC-TREAS-DEACT/A1]: Given processTreasuryStimulus invoked directly in isolation, When room has sufficient treasury, Then underlying calculation logic executes properly.

### Station 2: Implementation (GREEN)

#### Task 2.1: SSOT Toggle in `treasury_stimulus.ts`
**Target physical file**: `src/domain/treasury_stimulus.ts`

```typescript
<<<<
export const TREASURY_STIMULUS_THRESHOLD = 10_000;
export const TREASURY_STIMULUS_RATE = 0.2;
====
export const TREASURY_STIMULUS_THRESHOLD = 10_000;
export const TREASURY_STIMULUS_RATE = 0.2;
export const ENABLE_TREASURY_STIMULUS = false;
>>>>
```

#### Task 2.2: Guard in `turn_loop.ts`
**Target physical file**: `src/server/turn_loop.ts`

```typescript
<<<<
import { processTreasuryStimulus } from '../domain/treasury_stimulus';
====
import { processTreasuryStimulus, ENABLE_TREASURY_STIMULUS } from '../domain/treasury_stimulus';
>>>>
```

```typescript
<<<<
  evaluateMacroCycle(room, rng);
  processTreasuryStimulus(room);
}
====
  evaluateMacroCycle(room, rng);
  if (ENABLE_TREASURY_STIMULUS) {
    processTreasuryStimulus(room);
  }
}
>>>>
```

## 4. Mechanical Verification & Gate Compliance
1. Plan Audit: `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_325_DEACTIVATE_TREASURY_STIMULUS.md --auto-sign`
2. Scope Check: `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_325_DEACTIVATE_TREASURY_STIMULUS.md`
3. Adversarial Challenger: Conduct adversarial gate writing to `.agents/audit/PLAN_CHALLENGE_IMP-325.md`
4. Prefilter: `npm run prefilter -- src/domain/treasury_stimulus.ts src/server/turn_loop.ts tests/server/imp325_treasury_stimulus_deactivation.test.ts`
5. Vitest: `npx vitest run tests/server/imp325_treasury_stimulus_deactivation.test.ts tests/domain/imp114_treasury_public_stimulus.test.ts`
