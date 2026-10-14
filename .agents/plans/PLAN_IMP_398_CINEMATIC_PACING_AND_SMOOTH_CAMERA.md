# Plan IMP-398: Cinematic Pacing & Smooth Camera Restoration (Ticket IMP-398)

## 0. Auto-Slicing Roadmap & Context
- **Ticket Objective**: Khắc phục hiện tượng chuyển cảnh quá nhanh, giật góc máy và con cờ nhảy dồn dập (theo phản hồi người dùng & 5 chỉ thị tại `.agents/audit/PLAN_CHALLENGE_IMP-398.md`):
  1. *Pawn Hop & Pacing SSOT*: Nâng thời lượng bước nhảy người chơi từ 0.15s lên 0.22s (`HOP_DURATION`), tổng bước 0.30s (`HOP_DURATION + LANDING_DURATION`); nâng bước nhảy Bot từ 0.13s lên 0.18s (`BOT_HOP_DURATION`), `BOT_STEP_DURATION` lên 0.26s. Đồng bộ `DEFAULT_PACING_CONFIG` tại `pacing_context.ts` thành `{ stepMs: 300, botStepMs: 260, rollLeadMs: 1200 }` (giải quyết [ADV-01]).
  2. *Camera Glide & Frustum Guard*: Giảm `CAMERA_CONFIG.pawn_chase.speed` từ 5.2 xuống 3.2. Giảm bot chase speed từ 7.2 xuống 3.8 trên Desktop/Landscape, kích hoạt 5.2 trên Mobile Portrait (`aspect < 1.0`) chống rớt frustum ([ADV-04]). Cinematic chase camera speed giảm xuống 3.8 tại điểm gọi `calculateStreetChaseCameraState` trong `camera_state_machine.ts`.
  3. *Bot Soft Return Grace*: Nâng thời gian chuyển cảnh overview của Bot từ 650ms lên 950ms (`resolveSoftReturnDuration = 950`), thư thái mà không chạm ngưỡng 1200ms của người chơi.
  4. *Server Scheduler Boundary*: `turn_bot_timer_scheduler.ts` nằm ở `server-network`. Dwell buffer 1200ms đủ bù đắp độ lệch 720ms, bảo toàn Boundary Invariant ([ADV-05]).
- **Tech Debt Registry**: `camera_state_machine.ts` (303 LOC) tăng +4 dòng (307 LOC), tuân thủ trần Tier 1 (<= 400 LOC).

## 1. Physical Target Files & Honest LOC Accounting
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| `src/client/3d/pawn_path.ts` | Tier 1 (Domain/Server/Logic) | 210 | 210 | 0 | <= 400 | Safe (< 400 LOC) |
| `src/client/3d/camera_state_machine.ts` | Tier 1 (Domain/Server/Logic) | 303 | 307 | +4 | <= 400 | Warning (>= 300 LOC, Tech Debt logged) |
| `src/client/events/pacing_context.ts` | Tier 1 (Domain/Server/Logic) | 122 | 123 | +1 | <= 400 | Safe (< 400 LOC) |
| `tests/client/imp398_cinematic_pacing_and_smooth_camera.test.ts` | Living Test | 0 | 120 | +120 | <= 600 | Contract Test Suite |
| `tests/client/pawn_jump_and_camera_smoothness.test.ts` | Living Test | 71 | 71 | 0 | <= 600 | Migration TC-IMP42.1..3 |
| `tests/client/pawn_bot_movement_lifecycle.test.ts` | Living Test | 474 | 474 | 0 | <= 600 | Migration TC-TURBO-01 |
| `tests/client/cinematic_chase_camera.test.ts` | Living Test | 188 | 188 | 0 | <= 600 | Migration TC-263.15 |
| `tests/client/imp354_bot_camera_stabilization.test.ts` | Living Test | 214 | 214 | 0 | <= 600 | Migration TC-354.07 |
| `tests/client/pawn_juice.test.ts` | Living Test | 220 | 220 | 0 | <= 600 | Migration TC-JUICE.6d |
| `tests/client/imp358_bot_camera_lead_and_mobile_framing.test.ts` | Living Test | 176 | 176 | 0 | <= 600 | Migration TC-358.02, 09 |
| `tests/client/imp356_android_depth_and_dice_landing.test.ts` | Living Test | 334 | 334 | 0 | <= 600 | Migration TC-356.08 |
| `tests/contracts/imp201_topbar_overflow_and_hud_fixes.test.ts` | Living Test | 454 | 454 | 0 | <= 600 | Migration TC-201.10 |
| `tests/client/imp333_audio_and_pacing_subscribers.test.ts` | Living Test | 290 | 290 | 0 | <= 600 | Migration TC-333.10 |
| `tests/contracts/imp230_pass_go_salary_and_rent_subtractive_clean.test.ts` | Living Test | 424 | 424 | 0 | <= 600 | Migration TC-230.09..12 |
| `docs/FEATURE_MAP.md` | SSOT Matrix | 92 | 93 | +1 | N/A | Cập nhật Section Gotchas Pillar 13 |

## 2. In-Action Visual Capture Registration
- Scenario: Client 3D Camera & Pawn Hop Kinematics. Visual observation verified via mechanical test suite `imp398_cinematic_pacing_and_smooth_camera.test.ts`, scenario `--scenario camera_chase_cinematic`, and automated gate `node scripts/check_evidence.mjs IMP-398`.

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- **TC-398.01 [UC-PAWN-HOP-DURATION/MSS]:** Given pawn path constants, When inspecting HOP_DURATION, Then returns exactly 0.22s.
- **TC-398.02 [UC-PAWN-STEP-DURATION/MSS]:** Given pawn path constants, When summing HOP_DURATION and LANDING_DURATION, Then returns exactly 0.30s.
- **TC-398.03 [UC-PAWN-BOT-STEP-DURATION/MSS]:** Given pawn path constants, When inspecting BOT_HOP_DURATION and BOT_STEP_DURATION, Then returns 0.18s and 0.26s respectively.
- **TC-398.04 [UC-CAM-CHASE-SPEED/MSS]:** Given CAMERA_CONFIG.pawn_chase, When checking speed, Then returns exactly 3.2.
- **TC-398.05 [UC-CAM-BOT-CHASE-SPEED/MSS]:** Given calculateTargetCameraState with pawn_chase and isBotTurn true without aspect, When evaluating speed, Then returns exactly 3.8; When aspect < 1.0 (Mobile Portrait), Then returns 5.2.
- **TC-398.06 [UC-CAM-CINEMATIC-STREET-SPEED/MSS]:** Given calculateTargetCameraState with cinematicChase true, When evaluating speed, Then returns exactly 3.8.
- **TC-398.07 [UC-CAM-BOT-SOFT-RETURN/MSS]:** Given resolveSoftReturnDuration with isBot true, When evaluating return duration, Then returns exactly 950ms.
- **TC-398.08 [UC-PACING-CONTEXT-SSOT/MSS]:** Given DEFAULT_PACING_CONFIG, When inspecting stepMs and botStepMs, Then returns 300 and 260 respectively.

### Station 2: Implementation (GREEN)

#### Task 1: Cân chỉnh hằng số bước nhảy quân cờ Pawn Hop Durations
**Target physical file**: `src/client/3d/pawn_path.ts`
```typescript
<<<<
export const HOP_DURATION = 0.15 as const;
export const LANDING_DURATION = 0.08 as const;
export const BOT_HOP_DURATION = 0.13 as const;
export const BOT_LANDING_DURATION = 0.07 as const;
export const BOT_STEP_DURATION = 0.20 as const;
====
export const HOP_DURATION = 0.22 as const;
export const LANDING_DURATION = 0.08 as const;
export const BOT_HOP_DURATION = 0.18 as const;
export const BOT_LANDING_DURATION = 0.08 as const;
export const BOT_STEP_DURATION = 0.26 as const;
>>>>
```

#### Task 2: Làm dịu tốc độ bám đuổi Camera & Nâng thời gian Soft Return của Bot
**Target physical file**: `src/client/3d/camera_state_machine.ts`
```typescript
<<<<
  pawn_chase: {
    fov: 38,
    speed: 5.2,
    offset: [3.6, 4.2, 3.6] as const,
  },
====
  pawn_chase: {
    fov: 38,
    speed: 3.2,
    offset: [3.6, 4.2, 3.6] as const,
  },
>>>>
```

```typescript
<<<<
export function resolveSoftReturnDuration(isBot?: boolean): number {
  return isBot ? 650 : 1200;
}
====
export function resolveSoftReturnDuration(isBot: boolean = false): number {
  const isBotTarget = Boolean(isBot);
  return isBotTarget ? 950 : 1200;
}
>>>>
```

```typescript
<<<<
      if (options?.cinematicChase) {
        return calculateStreetChaseCameraState({
          pawnPosition: pawnPosition ?? [0, 0, 0],
          cellIndex: options.cellIndex,
          aspect: options.aspect,
          isHighStakesRoll: options.isHighStakesRoll,
          isJailFlight: options.isJailFlight,
          isTransientTurnCorner: options.isTransientTurnCorner,
          enableNorthFraming: options.enableNorthFraming,
        });
      }
====
      if (options?.cinematicChase) {
        return calculateStreetChaseCameraState({
          pawnPosition: pawnPosition ?? [0, 0, 0],
          cellIndex: options.cellIndex,
          aspect: options.aspect,
          isHighStakesRoll: options.isHighStakesRoll,
          isJailFlight: options.isJailFlight,
          isTransientTurnCorner: options.isTransientTurnCorner,
          enableNorthFraming: options.enableNorthFraming,
          speed: 3.8,
        });
      }
>>>>
```

```typescript
<<<<
        fov: calculateResponsiveChaseFov(options?.aspect),
        speed: options?.isBotTurn ? 7.2 : CAMERA_CONFIG.pawn_chase.speed,
      };
====
        fov: calculateResponsiveChaseFov(options?.aspect),
        speed: options?.isBotTurn
          ? (options?.aspect !== undefined && options.aspect < 1.0 ? 5.2 : 3.8)
          : CAMERA_CONFIG.pawn_chase.speed,
      };
>>>>
```

#### Task 3: Đồng bộ hằng số Pacing Context SSOT cho Badge & Âm thanh
**Target physical file**: `src/client/events/pacing_context.ts`
```typescript
<<<<
export const DEFAULT_PACING_CONFIG: PacingConfig = { stepMs: 230, botStepMs: 200, rollLeadMs: 1200 };
====
export const DEFAULT_PACING_CONFIG: PacingConfig = { stepMs: 300, botStepMs: 260, rollLeadMs: 1200 };
>>>>
```

```typescript
<<<<
function getAnimLead(anim: GameState['activePawnAnimation'], config: PacingConfig): number {
  if (!anim || !anim.waypoints?.length) return 0;
  const steps = Math.max(1, anim.waypoints.length - (anim.currentIndex ?? 0));
  const ms = anim.isBot ? (config.botStepMs ?? 200) : (config.stepMs ?? 230);
  return Math.round(steps * ms);
}
====
function getAnimLead(anim: GameState['activePawnAnimation'], config: PacingConfig): number {
  if (!anim || !anim.waypoints?.length) return 0;
  const steps = Math.max(1, anim.waypoints.length - (anim.currentIndex ?? 0));
  const isBot = Boolean(anim.isBot);
  const ms = isBot ? (config.botStepMs ?? 260) : (config.stepMs ?? 300);
  return Math.round(steps * ms);
}
>>>>
```

```typescript
<<<<
  const state = storeState ?? useGameStore.getState();
  const humanMs = config.stepMs ?? 230;
  const botMs = config.botStepMs ?? 200;
  const rollLead = config.rollLeadMs ?? 1200;
====
  const state = storeState ?? useGameStore.getState();
  const humanMs = config.stepMs ?? 300;
  const botMs = config.botStepMs ?? 260;
  const rollLead = config.rollLeadMs ?? 1200;
>>>>
```

#### Task 4: Cập nhật Migration cho các Living Test Suites kế thừa
- Cập nhật `tests/client/pawn_jump_and_camera_smoothness.test.ts` (0.22s, 0.30s).
- Cập nhật `tests/client/pawn_bot_movement_lifecycle.test.ts` (0.26s).
- Cập nhật `tests/client/cinematic_chase_camera.test.ts` (3.8 speed).
- Cập nhật `tests/client/imp354_bot_camera_stabilization.test.ts` (950ms).
- Cập nhật `tests/client/pawn_juice.test.ts` (0.22s, 0.30s).
- Cập nhật `tests/client/imp358_bot_camera_lead_and_mobile_framing.test.ts` (3.8 speed).
- Cập nhật `tests/client/imp356_android_depth_and_dice_landing.test.ts` (3.8 speed).
- Cập nhật `tests/contracts/imp201_topbar_overflow_and_hud_fixes.test.ts` (300ms / 260ms).
- Cập nhật `tests/client/imp333_audio_and_pacing_subscribers.test.ts` (2700ms).
- Cập nhật `tests/contracts/imp230_pass_go_salary_and_rent_subtractive_clean.test.ts` (600ms, 2400ms).

#### Task 5: Cập nhật Feature Map Single Source of Truth
**Target physical file**: `docs/FEATURE_MAP.md`
- Cập nhật Pillar 13 (3D Kinematics & Presentation) ghi nhận các tham số IMP-398 Golden Cinematic Pacing.

## 4. Definition of Done (DoD)
- Toàn bộ 8/8 contract tests mới trong `tests/client/imp398_cinematic_pacing_and_smooth_camera.test.ts` và 10 migration suites chuyển sang GREEN 100%.
- Kiểm tra visual capture qua `node scripts/capture_visual_evidence.mjs --scenario camera_chase_cinematic`.
- Vượt qua `npm run prefilter -- src/client/3d/pawn_path.ts src/client/3d/camera_state_machine.ts src/client/events/pacing_context.ts` với exit code 0.
- Vượt qua kiểm toán toàn diện `node scripts/check_evidence.mjs IMP-398` với 0 defects.
