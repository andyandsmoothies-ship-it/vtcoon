# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE 3A: CINEMATIC FLIGHT & MACRO PACING (IMP-293) - REVISION 3 (HARDENED)
> **Phân hệ mục tiêu:** `client-3d`
> **Phạm vi kỹ thuật:** Hạng mục 3.1 (Spline Arc Flyby) & Hạng mục 3.2 (Dynamic Monotonic Game Phase Scaling).
> **Scope Conservation**: [DEFERRED TO IMP-294: Hạng mục 3.3 OrbitControls Soft Return và Hạng mục 3.4 Decoupled Free-Roam Lock theo lộ trình Auto-Slicing]
> **Baseline Living Tests & Camera Dependencies:** `src/client/3d/cinematic_chase_camera.ts`, `tests/client/dramatic_pacing_camera.test.ts`, `tests/client/spatial_kinematics_camera.test.ts`
> **Adversarial Hardening Directives Incorporated**: Khắc phục triệt để 6 lỗ hổng từ `.agents/audit/PLAN_CHALLENGE_IMP-293.md` (Revision 3 Audit: [ADV-01] đến [ADV-06]).

---

### Bảng 1: Phân bổ Ranh giới Phân hệ (Subsystem Boundary Alignment)
| Tệp Mã Nguồn | Phân Hệ | Vai Trò Kiến Trúc |
| :--- | :--- | :--- |
| `src/client/3d/cinematic_spline_flyby.ts` | `client-3d` | **MỚI**: Đường cong Bézier ngoài biển 2D XZ, Scenic Dip mạn Nam, tính thời lượng bay chuẩn 670ms/570ms, và Monotonic Phase Scaling |
| `src/client/3d/camera_state_machine.ts` | `client-3d` | **SỬA**: Điều phối option `gamePhase` cho góc nhìn Overview theo 3 Hồi |
| `src/client/3d/adaptive_cinematic_camera.tsx` | `client-3d` | **SỬA**: Kết nối mạch bay Spline Arc trong useFrame (chỉ cho isJailFlight), tính toán Phase đơn điệu không GC churn và neo refPos chống kẹt custom camera |
| `tests/client/cinematic_spline_flyby.test.ts` | Living Test | **MỚI**: Hợp đồng kiểm thử 10 ca kiểm tra chuyển động bay, đồng bộ thời lượng 670ms/570ms và co dãn 3 Hồi |

---

### Bảng 2: Ngân Sách Dòng Mã (LOC Accounting)
| Tệp Mã Nguồn | Phân Tầng / Tier | LOC Hiện Tại | LOC Dự Kiến | Biến Động (Delta) | Trần Ngân Sách | Trạng Thái Rủi Ro |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/cinematic_spline_flyby.ts` | Tier 1 (Domain/Server/Logic) | 0 | 145 | +145 | <= 400 | ✔️ Safe |
| `src/client/3d/camera_state_machine.ts` | Tier 1 (Domain/Server/Logic) | 383 | 388 | +5 | <= 400 | ⚠️ Warning (388 > 300) |
| `src/client/3d/adaptive_cinematic_camera.tsx` | Tier 2 (UI/3D/Views) | 385 | 418 | +33 | <= 500 | ⚠️ Warning (418 > 400) |
| `tests/client/cinematic_spline_flyby.test.ts` | Living Test | 0 | 195 | +195 | <= 600 | ✔️ Safe |

*Sổ Theo Dõi Nợ Kỹ Thuật*: `camera_state_machine.ts` (388/400) và `adaptive_cinematic_camera.tsx` (418/500) được kiểm soát nghiêm ngặt; toàn bộ logic toán học được chuyển vào `cinematic_spline_flyby.ts`.

---

### Trạm 1: Hợp Đồng Kiểm Thử Độc Lập (RED Contract Tests)
**Tệp kiểm thử**: `tests/client/cinematic_spline_flyby.test.ts`
1. **TC-FLY.01 [UC-FLY/MSS]**: Given bay giữa 2 cạnh đối diện ô 30 sang 10 qua mạn Bắc, When gọi `calculateSplineArcCameraState`, Then tọa độ camera bẻ cong ra ngoài chu vi biển ($|Z| \ge 22.0\text{m}$) thay vì cắt tâm.
2. **TC-FLY.02 [UC-FLY/A1]**: Given đường bay đi qua mạn Nam/Tây Nam với $Z > 0$, When gọi `calculateSplineArcCameraState`, Then kích hoạt Scenic Dip hạ cao độ $1.5\text{m}$ ($Y \le 14.5\text{m}$) đón tiền cảnh hải âu `CoastalSeagulls`.
3. **TC-FLY.03 [UC-FLY/MSS]**: Given màn hình Mobile Portrait aspect 0.48, When gọi `calculateSplineArcCameraState`, Then mở rộng FOV linh hoạt $\ge 38^\circ$ chống cắt xén sa bàn.
4. **TC-FLY.04 [UC-FLY/A2]**: Given thời điểm biên t = 0 hoặc t = 1, When gọi `calculateSplineArcCameraState`, Then camera khớp chuẩn với vị trí xuất phát hoặc đích đến không bị giật whiplash.
5. **TC-FLY.05 [UC-FLY/MSS]**: Given vòng 1 không có nhà, When gọi `resolveDynamicGamePhase`, Then trả về Hồi 1 với cao độ Overview $Y = 25.3\text{m}$ và FOV $24^\circ$.
6. **TC-FLY.06 [UC-FLY/A3]**: Given vòng 5 có 4 nhà, When gọi `resolveDynamicGamePhase`, Then trả về Hồi 2 với góc nghiêng Tilt-Shift diorama $Y = 22.0\text{m}$ và FOV $26^\circ$.
7. **TC-FLY.07 [UC-FLY/MSS]**: Given vòng 10 có 12 nhà, When gọi `resolveDynamicGamePhase`, Then trả về Hồi 3 với góc cận kịch tính $Y = 18.5\text{m}$ và FOV $28^\circ$.
8. **TC-FLY.08 [UC-FLY/A4]**: Given ván đấu đã đạt Hồi 3, When vòng 11 người chơi giải chấp hết nhà, Then `resolveDynamicGamePhase` bảo toàn bất biến đơn điệu giữ nguyên Hồi 3 không tụt lùi.
9. **TC-FLY.09 [UC-FLY/A5]**: Given người chơi xây thần tốc 6 nhà ở vòng 2, When gọi `resolveDynamicGamePhase`, Then kích hoạt Monotonic Hybrid Trigger nhảy cóc thẳng lên Hồi 2.
10. **TC-FLY.10 [UC-FLY/A6]**: Given kiểm tra thời lượng bay tù, When gọi `resolveJailFlightDuration`, Then trả về chính xác 670ms cho người chơi và 570ms cho Bot đồng bộ với pawn_path.

---

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (GREEN Implementation)

#### Task 2.1: Tạo mới Module Động học Bay & Co dãn Tiến trình `cinematic_spline_flyby.ts`
**Target physical file**: `src/client/3d/cinematic_spline_flyby.ts` (mới)

```typescript
import { type TargetCameraState, calculateTileFocusCameraPosition } from './camera_state_machine';
import { cellPosition } from './board_coords';

export interface SplineArcParams {
  readonly startCell: number;
  readonly targetCell: number;
  readonly progress: number;
  readonly aspect?: number;
}

export interface BaseCameraConfig {
  readonly position: readonly [number, number, number];
  readonly target: readonly [number, number, number];
  readonly fov: number;
  readonly speed: number;
}

export function resolveJailFlightDuration(isBot?: boolean): number {
  return isBot ? 570 : 670;
}

export function resolveJailFlightProgress(flightStartTime: number | null, now: number, isBot?: boolean): number {
  if (flightStartTime === null || !Number.isFinite(flightStartTime)) return 0;
  const durationMs = resolveJailFlightDuration(isBot);
  const elapsed = now - flightStartTime;
  return Math.min(1, Math.max(0, elapsed / durationMs));
}

export function calculateSplineArcCameraState(params: SplineArcParams, aspect?: number): TargetCameraState {
  const t = Math.max(0, Math.min(1, Number.isFinite(params.progress) ? params.progress : 0));
  const safeAspect = typeof (params.aspect ?? aspect) === 'number' && Number.isFinite(params.aspect ?? aspect) ? (params.aspect ?? aspect)! : 1.77;
  const fov = safeAspect < 1.0 ? Math.min(46, Math.max(30, Math.round(30 / Math.max(0.60, safeAspect)))) : 30;

  const startPos = cellPosition(params.startCell);
  const destPos = cellPosition(params.targetCell);
  const startCamPos = calculateTileFocusCameraPosition(startPos);
  const destCamPos = calculateTileFocusCameraPosition(destPos);

  const baseCamX = (1 - t) * startCamPos[0] + t * destCamPos[0];
  const baseCamY = (1 - t) * startCamPos[1] + t * destCamPos[1];
  const baseCamZ = (1 - t) * startCamPos[2] + t * destCamPos[2];

  // Outward displacement: vector from start to dest in XZ
  const dx = destPos[0] - startPos[0];
  const dz = destPos[2] - startPos[2];
  const dist = Math.hypot(dx, dz);
  const isNorthArc = params.startCell >= 20 || params.targetCell >= 20;

  // Target peak Z for North or South seaward trajectory
  const targetPeakZ = isNorthArc ? -24.0 : 24.0;
  const midCamZ = (startCamPos[2] + destCamPos[2]) / 2;
  const deltaZ = targetPeakZ - midCamZ;
  const arcZ = baseCamZ + deltaZ * Math.sin(Math.PI * t);

  // Smooth arc on X as well (avoiding 1D flat interpolation)
  const outwardX = dist > 0.1 ? (dx !== 0 ? (Math.sign(dx) * 4.0 * Math.sin(Math.PI * t)) : 0) : 0;
  const posX = baseCamX + outwardX;

  // Scenic Dip: Only dip when the arc actually curves towards the South bay (arcZ > 0)
  const isSouthFlightArc = arcZ > 0;
  const dip = isSouthFlightArc ? 1.5 * Math.sin(Math.PI * t) : 0;

  // Altitude peak reaches 16.0m (or 14.5m with Scenic Dip)
  const midCamY = (startCamPos[1] + destCamPos[1]) / 2;
  const deltaY = 16.0 - midCamY;
  const posY = baseCamY + deltaY * Math.sin(Math.PI * t) - dip;

  // LookAt target tracks pawn 3D parabolic flight
  const targetX = (1 - t) * startPos[0] + t * destPos[0];
  const targetY = 0.2 + 2.2 * Math.sin(Math.PI * t);
  const targetZ = (1 - t) * startPos[2] + t * destPos[2];

  return {
    position: [posX, posY, arcZ],
    target: [targetX, targetY, targetZ],
    fov,
    speed: 4.5,
  };
}

export function resolveDynamicGamePhase(
  roundNumber: number,
  totalBuildings: number,
  previousPhase?: 1 | 2 | 3
): 1 | 2 | 3 {
  const safeRound = Number.isFinite(roundNumber) ? roundNumber : 1;
  const safeBuildings = Number.isFinite(totalBuildings) ? totalBuildings : 0;
  const rPhase: 1 | 2 | 3 = safeRound <= 3 ? 1 : (safeRound <= 8 ? 2 : 3);
  const bPhase: 1 | 2 | 3 = safeBuildings <= 3 ? 1 : (safeBuildings <= 8 ? 2 : 3);
  const calculatedPhase = Math.max(rPhase, bPhase) as 1 | 2 | 3;
  return Math.max(previousPhase ?? 1, calculatedPhase) as 1 | 2 | 3;
}

export function resolveOverviewConfigByPhase(
  phase: 1 | 2 | 3,
  baseConfig: BaseCameraConfig
): TargetCameraState {
  switch (phase) {
    case 1:
      return {
        position: [baseConfig.position[0], baseConfig.position[1], baseConfig.position[2]],
        target: [baseConfig.target[0], baseConfig.target[1], baseConfig.target[2]],
        fov: 24,
        speed: baseConfig.speed,
      };
    case 2:
      return {
        position: [21.0, 22.0, 21.0],
        target: [1.8, 0.0, 1.8],
        fov: 26,
        speed: 3.8,
      };
    case 3:
    default:
      return {
        position: [17.5, 18.5, 17.5],
        target: [1.5, 0.0, 1.5],
        fov: 28,
        speed: 4.2,
      };
  }
}
```

#### Task 2.2: Bổ sung Option Phase trong `camera_state_machine.ts`
**Target physical file**: `src/client/3d/camera_state_machine.ts`

```typescript
<<<<
import { calculateStreetChaseCameraState, resolveStandardChaseOffset, calculateDicePanCameraState } from './cinematic_chase_camera';
====
import { calculateStreetChaseCameraState, resolveStandardChaseOffset, calculateDicePanCameraState } from './cinematic_chase_camera';
import { resolveOverviewConfigByPhase } from './cinematic_spline_flyby';
>>>>
```

```typescript
<<<<
  readonly isBotTurn?: boolean;
  readonly rollingPlayerPos?: number;
}
====
  readonly isBotTurn?: boolean;
  readonly rollingPlayerPos?: number;
  readonly gamePhase?: 1 | 2 | 3;
}
>>>>
```

```typescript
<<<<
    case 'overview':
    default:
      if (options?.isRolling && !options?.isHighStakesRoll && !options?.isBotTurn) {
        return calculateDicePanCameraState(options?.rollingPlayerPos, options?.aspect);
      }
      return configToCameraState(CAMERA_CONFIG.overview);
====
    case 'overview':
    default:
      if (options?.isRolling && !options?.isHighStakesRoll && !options?.isBotTurn) {
        return calculateDicePanCameraState(options?.rollingPlayerPos, options?.aspect);
      }
      if (options?.gamePhase) {
        return resolveOverviewConfigByPhase(options.gamePhase, CAMERA_CONFIG.overview);
      }
      return configToCameraState(CAMERA_CONFIG.overview);
>>>>
```

#### Task 2.3: Đóng mạch Runtime & Ghi nhận Vòng bay trong `adaptive_cinematic_camera.tsx`
**Target physical file**: `src/client/3d/adaptive_cinematic_camera.tsx`

```typescript
<<<<
import {
  resolveCameraMode,
  calculateTargetCameraState,
  calculateScreenShake,
  checkHighStakesRoll,
  CAMERA_CONFIG,
} from './camera_state_machine';
====
import {
  resolveCameraMode,
  calculateTargetCameraState,
  calculateScreenShake,
  checkHighStakesRoll,
  CAMERA_CONFIG,
} from './camera_state_machine';
import { calculateSplineArcCameraState, resolveDynamicGamePhase, resolveOverviewConfigByPhase, resolveJailFlightProgress } from './cinematic_spline_flyby';
>>>>
```

```typescript
<<<<
  const lastSkipTimeRef = useRef<number>(0);
  const lastDestinationCellRef = useRef<number | null>(null);

  const isRolling = useGameStore((s) => s.isRolling);
====
  const lastSkipTimeRef = useRef<number>(0);
  const lastDestinationCellRef = useRef<number | null>(null);
  const gamePhaseRef = useRef<1 | 2 | 3>(1);
  const flightStartTimeRef = useRef<number | null>(null);
  const currentOverviewPosRef = useRef<[number, number, number]>([defaultCfg.position[0], defaultCfg.position[1], defaultCfg.position[2]]);
  const currentOverviewTargetRef = useRef<[number, number, number]>([defaultCfg.target[0], defaultCfg.target[1], defaultCfg.target[2]]);

  const isRolling = useGameStore((s) => s.isRolling);
>>>>
```

```typescript
<<<<
  const playersInfo = useGameStore((s) => s.playersInfo);
  const levelMap = useGameStore((s) => s.levelMap);

  const rollingPlayerId = currentTurnPlayerId ?? 'p1';
====
  const playersInfo = useGameStore((s) => s.playersInfo);
  const levelMap = useGameStore((s) => s.levelMap);
  const roundNumber = useGameStore((s) => s.roundNumber);
  const totalBuildings = React.useMemo(
    () => Object.values(levelMap ?? {}).reduce((acc, lvl) => acc + (lvl ?? 0), 0),
    [levelMap]
  );

  const rollingPlayerId = currentTurnPlayerId ?? 'p1';
>>>>
```

```typescript
<<<<
    const rollingPlayerPos = currentTurnPlayerId ? playerPositions[currentTurnPlayerId] : undefined;
    const mode = resolveCameraMode({
====
    const effectivePhase = resolveDynamicGamePhase(roundNumber, totalBuildings, gamePhaseRef.current);
    gamePhaseRef.current = effectivePhase;

    const phaseOverview = resolveOverviewConfigByPhase(effectivePhase, CAMERA_CONFIG.overview);
    currentOverviewPosRef.current = [phaseOverview.position[0], phaseOverview.position[1], phaseOverview.position[2]];
    currentOverviewTargetRef.current = [phaseOverview.target[0], phaseOverview.target[1], phaseOverview.target[2]];

    const rollingPlayerPos = currentTurnPlayerId ? playerPositions[currentTurnPlayerId] : undefined;
    const mode = resolveCameraMode({
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
          isRolling,
          isBotTurn,
          rollingPlayerPos,
        });

    // [USER-BUG-02] Neu da skip luot nhay hien tai, giu chat targetState o o dich den cuoi cung tranh bi keo nguoc lai
    if (hasSkippedCurrentMoveRef.current) {
      targetState = skipTargetState;
    }
====
    let targetState = isManualOverviewResetRef.current
      ? calculateTargetCameraState('overview', undefined, undefined, { gamePhase: gamePhaseRef.current })
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
          rollingPlayerPos,
          gamePhase: effectivePhase,
        });

    if (isJailFlight && isPawnMoving) {
      if (flightStartTimeRef.current === null) flightStartTimeRef.current = performance.now();
      const flightProgress = resolveJailFlightProgress(flightStartTimeRef.current, performance.now(), isBotTurn);
      targetState = calculateSplineArcCameraState({
        startCell: activeAnimation?.fromCell ?? 30,
        targetCell: effectiveDestCell ?? 10,
        progress: flightProgress,
        aspect: cameraAspect,
      });
    } else {
      flightStartTimeRef.current = null;
    }

    // [USER-BUG-02] Neu da skip luot nhay hien tai, giu chat targetState o o dich den cuoi cung tranh bi keo nguoc lai
    if (hasSkippedCurrentMoveRef.current) {
      targetState = skipTargetState;
    }
>>>>
```

```typescript
<<<<
        const distPos = Math.hypot(camera.position.x - defaultPos[0], camera.position.y - defaultPos[1], camera.position.z - defaultPos[2]);
        const distTarget = controlsRef.current
          ? Math.hypot(controlsRef.current.target.x - defaultTarget[0], controlsRef.current.target.y - defaultTarget[1], controlsRef.current.target.z - defaultTarget[2])
          : 0;
        if (distPos > 0.8 || distTarget > 0.5) {
          useGameStore.getState().setHasUserCustomCamera?.(true);
        }
====
        const refPos = currentOverviewPosRef.current;
        const refTarget = currentOverviewTargetRef.current;
        const distPos = Math.hypot(camera.position.x - refPos[0], camera.position.y - refPos[1], camera.position.z - refPos[2]);
        const distTarget = controlsRef.current
          ? Math.hypot(controlsRef.current.target.x - refTarget[0], controlsRef.current.target.y - refTarget[1], controlsRef.current.target.z - refTarget[2])
          : 0;
        if (distPos > 0.8 || distTarget > 0.5) {
          useGameStore.getState().setHasUserCustomCamera?.(true);
        }
>>>>
```

---

### Trạm 3: Kiểm chứng Cơ học & Bằng chứng Vật lý
1. `npm run prefilter -- src/client/3d/cinematic_spline_flyby.ts src/client/3d/camera_state_machine.ts src/client/3d/adaptive_cinematic_camera.tsx tests/client/cinematic_spline_flyby.test.ts`
2. `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_293_CINEMATIC_FLIGHT_AND_MACRO_PACING.md`
3. `npm run capture:visual -- --ticket IMP-293 --scenario camera_spline_arc_flyby --dual`
4. `node scripts/check_evidence.mjs IMP-293`
