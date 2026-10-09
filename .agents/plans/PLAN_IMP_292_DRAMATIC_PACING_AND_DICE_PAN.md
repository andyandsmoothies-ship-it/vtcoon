# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE 2A: DRAMATIC PACING & DICE PAN (IMP-292) [REV-3]

> **Ticket ID**: `IMP-292`  
> **Phân hệ**: `client-3d` (Camera Kinematics & Presentation)  
> **Mục tiêu**: Hiện thực hóa Item 2.1 (Interest-Driven Framing cho Bot) và Item 2.4 (Player-Oriented Dice Pan Y=19.8m).  
> **Phạm vi hoãn**: [DEFERRED TO TICKET-IMP-293: Phase 2B Character Emotions & Pacing Dynamic (Items 2.2 & 2.3)]  
> **Tích hợp phản biện**: Đã giải quyết 100% 4 bẫy kỹ thuật (Ref crash, Frustum clipping, LOC Honest accounting, Scenario parity).

---

### Bảng 0: Phân định Trách nhiệm Kỹ thuật
- `INT-01` (Bot Interest Framing): Bot đáp đất ô Bot/vô chủ hoặc ô đang thế chấp -> Giữ camera `overview`. Bot đáp đất ô có thu tiền của người chơi -> Đổi sang `tile_focus` (Hero Cam). Tương thích ngược: Khi `isTargetOwnedByHuman` không truyền (`undefined`), bảo toàn contract cũ (`tile_focus`).
- `DICE-01` (Player Dice Pan): Lượt gieo thường của NGƯỜI CHƠI (`isRolling: true && !isBotTurn`) -> Camera hạ từ Y=25.3m xuống Y=19.8m hướng về góc sông của người chơi. Tự động mở rộng FOV lên đến 46° trên mobile portrait (aspect < 1.0) chống cắt mép. Lượt Bot gieo xúc xắc giữ nguyên Overview Y=25.3m tĩnh tại chống say xe/whiplash (Gotcha #63).
- Kế thừa bảo vệ bộ test hợp đồng: `tests/client/spatial_kinematics_camera.test.ts` (IMP-291).

---

### Bảng 2: Thống kê LOC vật lý & Ngân sách
| File | Phân tầng | Số dòng vật lý | Dự kiến sau sửa | Chênh lệch | Hạn mức còn lại | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/camera_state_machine.ts` | Tier 1 | 389 | 383 | -6 | 17 dòng | Warning (Tech Debt Watch) |
| `src/client/3d/cinematic_chase_camera.ts` | Tier 1 | 227 | 256 | +29 | 144 dòng | Safe |
| `src/client/3d/adaptive_cinematic_camera.tsx` | Tier 2 | 359 | 376 | +17 | 124 dòng | Safe |
| `tests/client/dramatic_pacing_camera.test.ts` | Living Test | 0 (New) | 160 | +160 | 440 dòng | Safe |

*Chi tiết biến động LOC trung thực trên `camera_state_machine.ts`:*
- Thêm cờ `TargetCameraStateOptions` và `CameraResolveParams`: +4 dòng
- Thêm phân nhánh interest-driven trong `resolveCameraMode`: +3 dòng
- Định nghĩa helper `configToCameraState`: +8 dòng
- Nén 5 khối case lặp lại (`pre_match`, `dice_roll`, `tension_roll`, `auction_focus`, `overview`): -21 dòng
- Tổng chênh lệch ròng: +4 + 3 + 8 - 21 = -6 dòng (File giảm từ 389 xuống 383 dòng vật lý).

---

### Trạm 1: Đặc tả Contract Test (Adversarial Inversion)
**Target physical file**: `tests/client/dramatic_pacing_camera.test.ts` (new)

- TC-DRAMA.01 [UC-DRAMA/MSS]: Given lượt đi của Bot hạ cánh ô vô chủ hoặc ô Bot sở hữu (`isTargetOwnedByHuman: false`) không có modal, When gọi `resolveCameraMode` với `isBotTurn: true`, `isTargetOwnedByHuman: false`, `hasTargetTile: true`, Then hàm trả về `'overview'` nhằm duy trì quỹ đạo bao quát ổn định và tránh zoom cận cảnh vô nghĩa.
- TC-DRAMA.02 [UC-DRAMA/MSS]: Given lượt đi của Bot hạ cánh tại ô đất thuộc sở hữu của người chơi người thật có thu phí (`isTargetOwnedByHuman: true`), When gọi `resolveCameraMode` với `isBotTurn: true`, `isTargetOwnedByHuman: true`, `hasTargetTile: true`, Then hàm trả về `'tile_focus'` để kích hoạt Dramatic Hero Cam cận cảnh nộp phạt.
- TC-DRAMA.03 [UC-DRAMA/A1]: Given Bot hạ cánh tại ô đất vô chủ nhưng có modal giao dịch đang mở, When gọi `resolveCameraMode` với `isBotTurn: true`, `isTargetOwnedByHuman: false`, `activeModal: 'buy_property'`, Then hàm trả về `'tile_focus'` đảm bảo modal được canh giữa khung hình.
- TC-DRAMA.04 [UC-DRAMA/A1]: Given caller cũ từ living tests (IMP-103) không truyền tham số `isTargetOwnedByHuman` (`undefined`), When gọi `resolveCameraMode` với `isBotTurn: true`, `hasTargetTile: true`, Then hàm duy trì tương thích ngược 100% trả về `'tile_focus'` bảo vệ các test cũ không bị gãy.
- TC-DRAMA.05 [UC-DRAMA/MSS]: Given trạng thái gieo xúc xắc thông thường của người chơi người thật (`!isBotTurn`), When gọi `calculateTargetCameraState` với chế độ `'overview'` kèm `options.isRolling: true` và `options.isBotTurn: false`, Then máy ảnh hạ độ cao xuống Y = 19.8 và FOV 28 thay vì giữ Y = 25.3.
- TC-DRAMA.06 [UC-DRAMA/A2]: Given trạng thái gieo xúc xắc trong lượt của Bot (`isBotTurn: true`), When gọi `calculateTargetCameraState` với chế độ `'overview'` kèm `options.isRolling: true` và `options.isBotTurn: true`, Then máy ảnh giữ nguyên Overview tĩnh tại Y = 25.3 chống say xe (Gotcha #63).
- TC-DRAMA.07 [UC-DRAMA/MSS]: Given người chơi đang gieo xúc xắc tại mạn Bắc bàn cờ ở ô số 25, When gọi `calculateDicePanCameraState` với tham số `rollingPos: 25`, Then trục ngắm target nghiêng về mạn Bắc lòng sông với targetZ = 0.9.
- TC-DRAMA.08 [UC-DRAMA/A3]: Given người chơi đang gieo xúc xắc tại mạn Nam bàn cờ ở ô số 5, When gọi `calculateDicePanCameraState` với tham số `rollingPos: 5`, Then trục ngắm target nghiêng về mạn Nam lòng sông với targetZ = 2.1.
- TC-DRAMA.09 [UC-DRAMA/MSS]: Given màn hình di động góc hẹp tỷ lệ dọc aspect = 0.48, When gọi `calculateDicePanCameraState` với tham số `rollingPos: 25` và `aspect: 0.48`, Then FOV tự động mở rộng lên 46 độ chống cắt xén bàn cờ trên Mobile Portrait.
- TC-DRAMA.10 [UC-DRAMA/A4]: Given trạng thái gieo xúc xắc có nguy cơ tử thần (`isHighStakesRoll: true`), When gọi `calculateTargetCameraState` với chế độ `'tension_roll'`, Then bảo toàn tọa độ cận cảnh [2.0, 2.2, 2.8] và FOV 34 mà không bị ghi đè bởi dice pan.

---

### Trạm 2: Triển khai Mã nguồn Tối thiểu

#### Task 2.1: Bổ sung `calculateDicePanCameraState` với Responsive Mobile FOV vào `cinematic_chase_camera.ts`
**Target physical file**: `src/client/3d/cinematic_chase_camera.ts`

```typescript
<<<<
export function resolvePawnTrackSide(
====
/**
 * [IMP-292] Tính toán góc nhìn hạ độ cao Y=19.8m hướng về góc sông của người chơi khi gieo xúc xắc.
 * Tự động bù trừ FOV mở rộng trên Mobile Portrait (aspect < 1.0) bảo toàn Dual-Viewport Parity.
 */
export function calculateDicePanCameraState(rollingPos?: number, aspect?: number): TargetCameraState {
  const normPos = typeof rollingPos === 'number' && Number.isFinite(rollingPos)
    ? Math.floor(((rollingPos % 40) + 40) % 40)
    : 0;
  const side = Math.floor(normPos / 10);
  let biasX = 0;
  let biasZ = 0;
  if (side === 0) biasZ = 1.0;
  else if (side === 1) biasX = -1.0;
  else if (side === 2) biasZ = -1.0;
  else biasX = 1.0;

  const safeAspect = typeof aspect === 'number' && Number.isFinite(aspect) ? aspect : 1.77;
  const fov = safeAspect < 1.0
    ? Math.min(46, Math.max(28, Math.round(28 / Math.max(0.60, safeAspect))))
    : 28;

  return {
    position: [19.5 + biasX * 0.8, 19.8, 19.5 + biasZ * 0.8],
    target: [1.5 + biasX * 0.6, 0.2, 1.5 + biasZ * 0.6],
    fov,
    speed: 4.8,
  };
}

export function resolvePawnTrackSide(
>>>>
```

#### Task 2.2: Tích hợp Dice Pan, Interest Framing & Nén LOC tại `camera_state_machine.ts`
**Target physical file**: `src/client/3d/camera_state_machine.ts`

```typescript
<<<<
import { calculateStreetChaseCameraState, resolveStandardChaseOffset } from './cinematic_chase_camera';
====
import { calculateStreetChaseCameraState, resolveStandardChaseOffset, calculateDicePanCameraState } from './cinematic_chase_camera';
>>>>
```

```typescript
<<<<
export interface TargetCameraStateOptions {
  readonly cinematicChase?: boolean;
  readonly cellIndex?: number;
  readonly aspect?: number;
  readonly isHighStakesRoll?: boolean;
  readonly isJailFlight?: boolean;
  readonly isTransientTurnCorner?: boolean;
  readonly enableNorthFraming?: boolean;
}
====
export interface TargetCameraStateOptions {
  readonly cinematicChase?: boolean;
  readonly cellIndex?: number;
  readonly aspect?: number;
  readonly isHighStakesRoll?: boolean;
  readonly isJailFlight?: boolean;
  readonly isTransientTurnCorner?: boolean;
  readonly enableNorthFraming?: boolean;
  readonly isRolling?: boolean;
  readonly isBotTurn?: boolean;
  readonly rollingPlayerPos?: number;
}
>>>>
```

```typescript
<<<<
export interface CameraResolveParams {
  readonly isRolling: boolean;
  readonly isHighStakesRoll?: boolean;
  readonly isPawnAnimating: boolean;
  readonly activeModal: string | null;
  readonly hasRolledThisTurn?: boolean;
  readonly manualMode?: CameraMode | null;
  readonly hasTargetTile?: boolean;
  readonly isPreMatch?: boolean;
  readonly isBotTurn?: boolean;
  readonly isAnimatingPawnBot?: boolean;
}
====
export interface CameraResolveParams {
  readonly isRolling: boolean;
  readonly isHighStakesRoll?: boolean;
  readonly isPawnAnimating: boolean;
  readonly activeModal: string | null;
  readonly hasRolledThisTurn?: boolean;
  readonly manualMode?: CameraMode | null;
  readonly hasTargetTile?: boolean;
  readonly isPreMatch?: boolean;
  readonly isBotTurn?: boolean;
  readonly isAnimatingPawnBot?: boolean;
  readonly isTargetOwnedByHuman?: boolean;
}
>>>>
```

```typescript
<<<<
  // 3. Mở modal tương tác hoặc dừng chân tại ô đất sau khi di chuyển
  if (params.activeModal !== null || params.hasTargetTile || params.hasRolledThisTurn) {
    return 'tile_focus';
  }
====
  // 3. Mở modal tương tác hoặc dừng chân tại ô đất sau khi di chuyển
  if (params.activeModal !== null || params.hasTargetTile || params.hasRolledThisTurn) {
    if ((params.isBotTurn || params.isAnimatingPawnBot) && params.isTargetOwnedByHuman === false && params.activeModal === null) {
      return 'overview';
    }
    return 'tile_focus';
  }
>>>>
```

```typescript
<<<<
export function calculateTargetCameraState(
====
function configToCameraState(cfg: { readonly position: readonly [number, number, number]; readonly target: readonly [number, number, number]; readonly fov: number; readonly speed: number }): TargetCameraState {
  return {
    position: [cfg.position[0], cfg.position[1], cfg.position[2]],
    target: [cfg.target[0], cfg.target[1], cfg.target[2]],
    fov: cfg.fov,
    speed: cfg.speed,
  };
}

export function calculateTargetCameraState(
>>>>
```

```typescript
<<<<
  switch (mode) {
    case 'pre_match':
      return {
        position: [CAMERA_CONFIG.pre_match.position[0], CAMERA_CONFIG.pre_match.position[1], CAMERA_CONFIG.pre_match.position[2]],
        target: [CAMERA_CONFIG.pre_match.target[0], CAMERA_CONFIG.pre_match.target[1], CAMERA_CONFIG.pre_match.target[2]],
        fov: CAMERA_CONFIG.pre_match.fov,
        speed: CAMERA_CONFIG.pre_match.speed,
      };
    case 'dice_roll':
      return {
        position: [CAMERA_CONFIG.dice_roll.position[0], CAMERA_CONFIG.dice_roll.position[1], CAMERA_CONFIG.dice_roll.position[2]],
        target: [CAMERA_CONFIG.dice_roll.target[0], CAMERA_CONFIG.dice_roll.target[1], CAMERA_CONFIG.dice_roll.target[2]],
        fov: CAMERA_CONFIG.dice_roll.fov,
        speed: CAMERA_CONFIG.dice_roll.speed,
      };
    case 'tension_roll':
      return {
        position: [CAMERA_CONFIG.tension_roll.position[0], CAMERA_CONFIG.tension_roll.position[1], CAMERA_CONFIG.tension_roll.position[2]],
        target: [CAMERA_CONFIG.tension_roll.target[0], CAMERA_CONFIG.tension_roll.target[1], CAMERA_CONFIG.tension_roll.target[2]],
        fov: CAMERA_CONFIG.tension_roll.fov,
        speed: CAMERA_CONFIG.tension_roll.speed,
      };
====
  switch (mode) {
    case 'pre_match':
      return configToCameraState(CAMERA_CONFIG.pre_match);
    case 'dice_roll':
      return configToCameraState(CAMERA_CONFIG.dice_roll);
    case 'tension_roll':
      return configToCameraState(CAMERA_CONFIG.tension_roll);
>>>>
```

```typescript
<<<<
    case 'auction_focus':
      return {
        position: [CAMERA_CONFIG.auction_focus.position[0], CAMERA_CONFIG.auction_focus.position[1], CAMERA_CONFIG.auction_focus.position[2]],
        target: [CAMERA_CONFIG.auction_focus.target[0], CAMERA_CONFIG.auction_focus.target[1], CAMERA_CONFIG.auction_focus.target[2]],
        fov: CAMERA_CONFIG.auction_focus.fov,
        speed: CAMERA_CONFIG.auction_focus.speed,
      };
    case 'overview':
    default:
      return {
        position: [CAMERA_CONFIG.overview.position[0], CAMERA_CONFIG.overview.position[1], CAMERA_CONFIG.overview.position[2]],
        target: [CAMERA_CONFIG.overview.target[0], CAMERA_CONFIG.overview.target[1], CAMERA_CONFIG.overview.target[2]],
        fov: CAMERA_CONFIG.overview.fov,
        speed: CAMERA_CONFIG.overview.speed,
      };
====
    case 'auction_focus':
      return configToCameraState(CAMERA_CONFIG.auction_focus);
    case 'overview':
    default:
      if (options?.isRolling && !options?.isHighStakesRoll && !options?.isBotTurn) {
        return calculateDicePanCameraState(options?.rollingPlayerPos, options?.aspect);
      }
      return configToCameraState(CAMERA_CONFIG.overview);
>>>>
```

#### Task 2.3: Khai báo Ref, Đóng mạch Runtime & Chống Jitter tại `adaptive_cinematic_camera.tsx`
**Target physical file**: `src/client/3d/adaptive_cinematic_camera.tsx`

```typescript
<<<<
  const hasSkippedCurrentMoveRef = useRef<boolean>(false);
  const lastSkipTimeRef = useRef<number>(0);
====
  const hasSkippedCurrentMoveRef = useRef<boolean>(false);
  const lastSkipTimeRef = useRef<number>(0);
  const lastDestinationCellRef = useRef<number | null>(null);
>>>>
```

```typescript
<<<<
    // [ADV-02] Neo su kien theo o dich den cuoi cung cua luot di thay vi o nhay trung gian
    const finalDestinationCell = activeAnimation?.waypoints?.length
      ? activeAnimation.waypoints[activeAnimation.waypoints.length - 1]
      : (activeAnimation?.targetCell ?? targetCell);
    const isJailFlight = Boolean(activeAnimation?.isJailFlight);
====
    // [ADV-02] Neo su kien theo o dich den cuoi cung cua luot di thay vi o nhay trung gian
    const finalDestinationCell = activeAnimation?.waypoints?.length
      ? activeAnimation.waypoints[activeAnimation.waypoints.length - 1]
      : (activeAnimation?.targetCell ?? targetCell);
    if (finalDestinationCell !== null && finalDestinationCell !== undefined && Number.isFinite(finalDestinationCell)) {
      lastDestinationCellRef.current = finalDestinationCell;
    }
    const isJailFlight = Boolean(activeAnimation?.isJailFlight);
>>>>
```

```typescript
<<<<
    // [USER-BUG-01] Truyen isPawnAnimating: isPawnMoving de resolveCameraMode tra ve 'pawn_chase'
    // Sau do calculateTargetCameraState voi options.cinematicChase: false se tra ve 'overview' cho 80% luot thuong
    const hasTargetTile = (activeModal !== null || hasRolledThisTurn || cameraFocusCell !== null) && targetCell !== null && targetCell !== undefined && Number.isFinite(targetCell);
    const mode = resolveCameraMode({
      isRolling,
      isHighStakesRoll,
      isPawnAnimating: isPawnMoving,
      activeModal,
      hasRolledThisTurn,
      hasTargetTile,
      isPreMatch,
      isBotTurn,
      isAnimatingPawnBot,
    });
====
    // [USER-BUG-01] Truyen isPawnAnimating: isPawnMoving de resolveCameraMode tra ve 'pawn_chase'
    // Sau do calculateTargetCameraState voi options.cinematicChase: false se tra ve 'overview' cho 80% luot thuong
    const hasTargetTile = (activeModal !== null || hasRolledThisTurn || cameraFocusCell !== null) && targetCell !== null && targetCell !== undefined && Number.isFinite(targetCell);
    const effectiveDestCell = finalDestinationCell ?? targetCell ?? lastDestinationCellRef.current;
    const isTargetOwnedByHuman = effectiveDestCell !== null && effectiveDestCell !== undefined && Number.isFinite(effectiveDestCell)
      ? Object.values(playersInfo).some((p) =>
          !p.isBot &&
          p.ownedProperties?.includes(effectiveDestCell) &&
          !p.mortgagedProperties?.includes(effectiveDestCell)
        )
      : false;
    const rollingPos = currentTurnPlayerId ? playerPositions[currentTurnPlayerId] : undefined;
    const mode = resolveCameraMode({
      isRolling,
      isHighStakesRoll,
      isPawnAnimating: isPawnMoving,
      activeModal,
      hasRolledThisTurn,
      hasTargetTile,
      isPreMatch,
      isBotTurn,
      isAnimatingPawnBot,
      isTargetOwnedByHuman,
    });
>>>>
```

```typescript
<<<<
    let targetState = isManualOverviewResetRef.current
      ? calculateTargetCameraState('overview', undefined, undefined)
      : calculateTargetCameraState(mode, cellCoords, cellCoords, {
          cinematicChase: shouldCinematic,
          cellIndex: targetCell ?? undefined,
          aspect: cameraAspect,
          isHighStakesRoll,
          isJailFlight,
          isTransientTurnCorner,
          enableNorthFraming: true,
        });
====
    let targetState = isManualOverviewResetRef.current
      ? calculateTargetCameraState('overview', undefined, undefined)
      : calculateTargetCameraState(mode, cellCoords, cellCoords, {
          cinematicChase: shouldCinematic,
          cellIndex: targetCell ?? undefined,
          aspect: cameraAspect,
          isHighStakesRoll,
          isJailFlight,
          isTransientTurnCorner,
          enableNorthFraming: true,
          isRolling,
          isBotTurn,
          rollingPlayerPos: rollingPos,
        });
>>>>
```

---

### Trạm 3: Kiểm chứng Cơ học & Bằng chứng Vật lý
1. `npm run prefilter -- src/client/3d/cinematic_chase_camera.ts src/client/3d/camera_state_machine.ts src/client/3d/adaptive_cinematic_camera.tsx tests/client/dramatic_pacing_camera.test.ts`
2. `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_292_DRAMATIC_PACING_AND_DICE_PAN.md`
3. `npm run capture:visual -- --ticket IMP-292 --scenario camera_chase_dice_pan`
4. `node scripts/check_evidence.mjs IMP-292`
