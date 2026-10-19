# PLAN_IMP_443: Bot Turn Camera Stabilization & Anti-Whiplash Invariant

## 1. Context & Architectural Root-Cause
- **Problem**: During bot turns in single-player or practice matches, human players suffer from disorienting "Camera Whiplash" across two rapid transitions:
  1. *Roll-to-Hop Whiplash*: When bot rolls dice, camera pans to river dice tray ($Y = 19.8\text{m}$, FOV 28°). Immediately as dice settle, camera dives down to pawn chase ($Y = 4.2\text{m}$, FOV 38°/48°) while the bot pawn hops across the board.
  2. *Hop-to-Overview Jerk*: Once the bot finishes hopping, camera snaps back up to standard overview ($Y = 25.3\text{m}$, FOV 24°).
- **Physical Root-Cause**:
  1. In `src/client/3d/camera_state_machine.ts` (`resolveCameraMode`), `if (params.isPawnAnimating) return 'pawn_chase'` executes unconditionally before checking `isBotTurn`.
  2. In `calculateTargetCameraState`, `overview` mode branches into `calculateDicePanCameraState` whenever `options?.isRolling && !options?.isHighStakesRoll` without exempting `options?.isBotTurn`.
- **Adversarial Hardening ([ADV-02])**: When bot rolls in high-stakes mode but lands safely on an unowned property, the FSM must return to `'overview'` and not fall through to line 124 (`tile_focus` dive on empty tile).
- **Guiding Principle**: Sean Goedecke Rule (*"What requirements don't you have?"*). Drop unrequested real-time camera tracking and dice pan on routine bot turns; stabilize camera steadily at Overview ($Y = 25.3\text{m}$).

## 2. Explicitly Dropped Requirements (Sean Goedecke Invariant)
- ❌ **NO Dynamic Pawn Chase on Routine Bot Hops**: Camera does not dive down to $Y = 4.2\text{m}$ for normal bot moves; overview perspective preserves full-board visibility with 0 whiplash.
- ❌ **NO Dice Tray Pan on Bot Rolls**: Camera does not pan down to river tray ($Y = 19.8\text{m}$) when bots roll; human player views bot dice rolls from Overview.
- ❌ **NO Speculative Camera Controllers / Drivers**: 0 new wrapper classes or state machines; in-place FSM stabilization in `camera_state_machine.ts`.

## 3. Principles Applied
- `(10) Dropped Requirements & Anti-Phantom Complexity` -> Retain static Overview for routine bot turns; drop camera whiplash.
- `(2) Equivalence-Partition Testing` -> Verify bot vs human roll and hop camera states across distinct branches.
- `(6) Poka-Yoke Domain Affordance` -> Automatically focus on tile (`tile_focus`) only when bot lands on human-owned property for rent collection.

## 4. Physical Scope & LOC Accounting
| File | Tier | Current LOC | Expected LOC | Net Delta | Max Ceiling | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/camera_state_machine.ts` | Tier 1 (Logic) | 295 | 302 | +7 | <= 400 | Warning (Tech Debt) |
| `docs/FEATURE_MAP.md` | SSOT Matrix | 93 | 93 | ~0 | <= 30 KB | Safe |

> [!NOTE] Tech Debt Item
> `src/client/3d/camera_state_machine.ts` physical count is 302 LOC (>= 300 LOC Tier 1 limit). Decomposition into sub-helper modules will be performed when file approaches 350 LOC buffer zone.

> [!NOTE] Harness Authorization
> `[HARNESS_MUTATION_AUTHORIZED]`: Upgraded SDLC pre-flight auditor with Sean Goedecke Rule across `scripts/audit_plan.mjs` and `scripts/plan_audit/rules_architecture.mjs`.

## 5. Core Contract Invariants
- **INV-443.1 (Bot Routine Overview Stability)**: For bot turns (`isBotTurn === true` or `isAnimatingPawnBot === true`), when `isHighStakesRoll` is false and no modal is open (`activeModal === null`), `resolveCameraMode` returns `'overview'` throughout both dice roll and pawn hopping.
- **INV-443.2 (Bot Fee-Charging Tile Focus)**: When bot pawn finishes moving and lands on a tile owned by a human (`isTargetOwnedByHuman === true`), camera transitions to `'tile_focus'` ($Y = 6.4\text{m}$) to spotlight rent collection.
- **INV-443.3 (High-Stakes Safe Landing Overview)**: When bot rolls high-stakes but lands on unowned property (`isTargetOwnedByHuman === false`), camera returns to `'overview'` on landing without falling through to `tile_focus`.
- **INV-443.4 (Bot Rolling Dice Pan Exemption)**: In `calculateTargetCameraState`, when `mode === 'overview'` and `options?.isRolling === true`, dice pan camera state ($Y = 19.8\text{m}$) is applied ONLY for human turns; bot rolls (`isBotTurn === true`) stay at static overview ($Y = 25.3\text{m}$).

## 6. Implementation Specification (Drop-in Replacements)

### Task 1: Stabilize Bot Routine Turns in Camera State Machine
**Target physical file**: `src/client/3d/camera_state_machine.ts`

```typescript
<<<<
  // 2. Quân cờ đang di chuyển: Bám đuổi theo quân cờ (cả người chơi và Bot để khôi phục góc quay sống động)
  if (params.isPawnAnimating) {
    return 'pawn_chase';
  }
  // [IMP-354 / IMP-356] Hài hòa nhịp độ: Khi Bot hạ cánh không mở modal và không vào đất người chơi,
  // giữ overview để triệt tiêu giật cục góc máy (Camera Whiplash - Gotcha 63)
  if ((params.isBotTurn || params.isAnimatingPawnBot) && params.isTargetOwnedByHuman === false && params.activeModal === null) {
    return 'overview';
  }
====
  // [IMP-443] Ổn định góc máy lượt Bot: Giữ Overview tĩnh cho lượt Bot thường (0 whiplash)
  // Chỉ kích hoạt pawn_chase khi thế cờ kịch tính (High-Stakes),
  // và chỉ chuyển tile_focus khi Bot hạ cánh vào đất người chơi hoặc mở modal giao dịch
  if (params.isBotTurn || params.isAnimatingPawnBot) {
    if (params.activeModal !== null) return 'tile_focus';
    if (params.isPawnAnimating) {
      return params.isHighStakesRoll ? 'pawn_chase' : 'overview';
    }
    if (params.isTargetOwnedByHuman === true) return 'tile_focus';
    return 'overview';
  }

  // 2. Quân cờ đang di chuyển: Bám đuổi theo quân cờ cho người chơi
  if (params.isPawnAnimating) {
    return 'pawn_chase';
  }
>>>>
```

```typescript
<<<<
    case 'overview':
    default:
      if (options?.isRolling && !options?.isHighStakesRoll) {
        return calculateDicePanCameraState(options?.rollingPlayerPos, options?.aspect);
      }
====
    case 'overview':
    default:
      if (options?.isRolling && !options?.isHighStakesRoll && !options?.isBotTurn) {
        return calculateDicePanCameraState(options?.rollingPlayerPos, options?.aspect);
      }
>>>>
```

## 7. Station 1 Test Contracts (`tests/client/imp443_bot_camera_stabilization.test.ts`)
- `TC-443.01` `[UC-CAM-BOT/MSS]`: Given routine bot turn with `isPawnAnimating: true` and `isTargetOwnedByHuman: false`, When calling `resolveCameraMode`, Then returns `'overview'`.
- `TC-443.02` `[UC-CAM-BOT/A1]`: Given bot turn landing on human property with `isPawnAnimating: false` and `isTargetOwnedByHuman: true`, When calling `resolveCameraMode`, Then returns `'tile_focus'`.
- `TC-443.03` `[UC-CAM-BOT/A2]`: Given bot turn with `isRolling: true` and `isBotTurn: true`, When calling `calculateTargetCameraState` in overview mode, Then returns static overview position $Y \ge 22.0\text{m}$ rather than river pan $Y = 19.8\text{m}$.
- `TC-443.04` `[UC-CAM-BOT/A3]`: Given human turn with `isPawnAnimating: true`, When calling `resolveCameraMode`, Then returns `'pawn_chase'`.
- `TC-443.05` `[UC-CAM-BOT/A4]`: Given bot turn with `isHighStakesRoll: true` and `isPawnAnimating: true`, When calling `resolveCameraMode`, Then returns `'pawn_chase'`.
- `TC-443.06` `[UC-CAM-BOT/A5]`: Given bot turn with `isHighStakesRoll: true` and `isPawnAnimating: false` landing on unowned tile, When calling `resolveCameraMode`, Then returns `'overview'`.

## 8. Living Contract Migration Protocol ([ADV-01])
To preserve continuous test integrity, living test suites asserting the superseded bot chase/pan behavior are modernized to reflect INV-443.1 & INV-443.4:
1. `tests/client/imp354_bot_camera_stabilization.test.ts`: Update `TC-354.01`, `01b`, `01c`, `02`, `05` expected return from `'pawn_chase'` to `'overview'`.
2. `tests/client/imp356_android_depth_and_dice_landing.test.ts`: Update `TC-356.07` expected return from `'pawn_chase'` to `'overview'`.
3. `tests/client/imp358_bot_camera_lead_and_mobile_framing.test.ts`: Update `TC-358.01`, `TC-358.10` expected camera state for bot roll to Overview ($Y = 25.3\text{m}$).
4. `tests/contracts/bot_pacing_and_camera_lock_contract.test.ts`: Update `TC-IMP55.10`, `TC-IMP55.15` expected return for routine bot moves to `'overview'`.
5. `tests/client/dramatic_pacing_camera.test.ts`: Update `TC-DRAMA.06` expected camera state for bot roll to Overview ($Y = 25.3\text{m}$).

## 9. Station 3 Verification & Evidence
- Fast Pre-Filter: `npm run prefilter -- src/client/3d/camera_state_machine.ts tests/client/imp443_bot_camera_stabilization.test.ts`
- Physical Visual Capture: `npm run capture:visual -- --ticket IMP-443 --scenario default`
- Chaos Sentinel: `npm run sentinel -- --ticket IMP-443 --test tests/client/imp443_bot_camera_stabilization.test.ts`
- Evidence Check: `node scripts/check_evidence.mjs IMP-443`

## 10. Definition of Done (DoD)
- Mechanical plan audit passes exit 0 (`node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_443_BOT_CAMERA_STABILIZATION.md`).
- Adversarial challenge brief `.agents/audit/PLAN_CHALLENGE_IMP-443.md` satisfied.
- All 6 contract tests and 100% existing regression tests pass.
- `docs/FEATURE_MAP.md` updated and <= 30 KB.
