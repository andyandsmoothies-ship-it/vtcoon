// [UI-S01/MSS][UI-S04/MSS][TC-FLY/MSS][UC-FLY] IMP-293: Cinematic Flight & Macro Pacing Contract Suite
// Traceability: docs/domain/gotchas/3d_cinematics.md (Gotcha 15, Gotcha 63), .agents/plans/PLAN_IMP_293_CINEMATIC_FLIGHT_AND_MACRO_PACING.md
// Universal 5-Facet Behavioral Matrix:
//   Facet 1: Boundary & Range — Seaward Outward Arc (|Z| >= 22.0m) & Mobile Aspect FOV Expansion (TC-FLY.01, TC-FLY.03)
//   Facet 2: State Reactivity & Pacing — Monotonic 3-Phase Dynamic Scaling & Skip-Phase Triggers (TC-FLY.05, 06, 07, 09)
//   Facet 3: Settle & Resource Isolation — Boundary Continuity (t=0, t=1) Anti-Whiplash Preservation (TC-FLY.04)
//   Facet 4: Error Defense & Invariants — Monotonic Phase Retention & Scenic Dip Coast Guard (TC-FLY.02, TC-FLY.08)
//   Facet 5: Cross-Coupling Blast Radius — Jail Flight Duration Parity (670ms human / 570ms bot) with pawn_path (TC-FLY.10)
//
// Dynamic Triad Mandate:
//   (1) Re-entrant storm: Flight progress calculations clamp safely within [0, 1] without NaN or infinity
//   (2) Phase boundary rejection: Monotonic phase resolution strictly rejects backward degradation
//   (3) Unmount / teardown cleanup: Stateless pure kinematics without frame leaks or unmanaged timers
//
// Acceptance Criteria & Contract Definitions:
//   TC-FLY.01: Given bay giữa 2 cạnh đối diện ô 30 sang 10 qua mạn Bắc, When gọi calculateSplineArcCameraState({ startCell: 30, targetCell: 10, progress: 0.5 }), Then camera bẻ cong ra biển (|position[2]| >= 22.0m, position[2] <= -22.0).
//   TC-FLY.02: Given đường bay đi qua mạn Nam/Tây Nam với Z > 0 (startCell: 5, targetCell: 15, progress: 0.5), When gọi calculateSplineArcCameraState, Then kích hoạt Scenic Dip hạ cao độ 1.5m (position[1] <= 14.5m).
//   TC-FLY.03: Given màn hình Mobile Portrait aspect 0.48, When gọi calculateSplineArcCameraState({ startCell: 30, targetCell: 10, progress: 0.5, aspect: 0.48 }), Then mở rộng FOV linh hoạt >= 38 độ chống cắt xén.
//   TC-FLY.04: Given thời điểm biên t = 0 hoặc t = 1, When gọi calculateSplineArcCameraState, Then camera khớp chuẩn với vị trí xuất phát (t=0) hoặc đích đến (t=1).
//   TC-FLY.05: Given vòng 1 không có nhà, When gọi resolveDynamicGamePhase(1, 0), Then trả về Hồi 1 với cao độ Overview Y = 25.3m và FOV 24 độ.
//   TC-FLY.06: Given vòng 5 có 4 nhà, When gọi resolveDynamicGamePhase(5, 4), Then trả về Hồi 2 với góc nghiêng Tilt-Shift diorama Y = 22.0m và FOV 26 độ.
//   TC-FLY.07: Given vòng 10 có 12 nhà, When gọi resolveDynamicGamePhase(10, 12), Then trả về Hồi 3 với góc cận kịch tính Y = 18.5m và FOV 28 độ.
//   TC-FLY.08: Given ván đấu đã đạt Hồi 3, When vòng 11 người chơi giải chấp hết nhà (previousPhase: 3, roundNumber: 11, totalBuildings: 0), Then resolveDynamicGamePhase bảo toàn Hồi 3.
//   TC-FLY.09: Given người chơi xây thần tốc 6 nhà ở vòng 2, When gọi resolveDynamicGamePhase(2, 6), Then kích hoạt Monotonic Hybrid Trigger nhảy cóc thẳng lên Hồi 2.
//   TC-FLY.10: Given kiểm tra thời lượng bay tù, When gọi resolveJailFlightDuration, Then trả về chính xác 670ms cho người chơi (isBot: false) và 570ms cho Bot (isBot: true).

import { describe, it, expect, vi } from 'vitest';
import {
  CAMERA_CONFIG,
  calculateTileFocusCameraPosition,
  calculateTargetCameraState,
  type TargetCameraState,
} from '../../src/client/3d/camera_state_machine';
import { cellPosition } from '../../src/client/3d/board_coords';

import {
  calculateSplineArcCameraState,
  resolveDynamicGamePhase,
  resolveOverviewConfigByPhase,
  resolveJailFlightDuration,
  resolveJailFlightProgress,
} from '../../src/client/3d/cinematic_spline_flyby';

describe('[UC-FLY] Cinematic Flight & Macro Pacing Contract Suite', () => {
  it('[TC-FLY.01/MSS][UC-FLY] Bay giua 2 canh doi dien o 30 sang 10 qua man Bac be cong ra ngoai bien (|Z| >= 22.0m, Z <= -22.0)', () => {
    const state = calculateSplineArcCameraState({
      startCell: 30,
      targetCell: 10,
      progress: 0.5,
    });
    expect(state).toBeDefined();
    expect(Math.abs(state.position[2])).toBeGreaterThanOrEqual(22.0);
    expect(state.position[2]).toBeLessThanOrEqual(-22.0);
    expect(state.speed).toBe(4.5);
  });

  it('[TC-FLY.02/A1][UC-FLY] Duong bay qua man Nam voi Z > 0 kich hoat Scenic Dip ha cao do 1.5m (Y <= 14.5m)', () => {
    const state = calculateSplineArcCameraState({
      startCell: 5,
      targetCell: 15,
      progress: 0.5,
    });
    expect(state.position[1]).toBeLessThanOrEqual(14.5);
    expect(state.position[2]).toBeGreaterThan(0);
  });

  it('[TC-FLY.03/MSS][UC-FLY] Man hinh Mobile Portrait aspect 0.48 mo rong FOV linh hoat >= 38 do', () => {
    const state = calculateSplineArcCameraState({
      startCell: 30,
      targetCell: 10,
      progress: 0.5,
      aspect: 0.48,
    });
    expect(state.fov).toBeGreaterThanOrEqual(38);
  });

  it('[TC-FLY.04/A2][UC-FLY] Thoi diem bien t = 0 va t = 1 khop chuan voi vi tri xuat phat va dich den khong bi whiplash', () => {
    const startExpected = calculateTileFocusCameraPosition(cellPosition(30));
    const destExpected = calculateTileFocusCameraPosition(cellPosition(10));

    const stateAtStart = calculateSplineArcCameraState({
      startCell: 30,
      targetCell: 10,
      progress: 0.0,
    });
    const stateAtEnd = calculateSplineArcCameraState({
      startCell: 30,
      targetCell: 10,
      progress: 1.0,
    });

    expect(stateAtStart.position[0]).toBeCloseTo(startExpected[0], 2);
    expect(stateAtStart.position[2]).toBeCloseTo(startExpected[2], 2);
    expect(stateAtEnd.position[0]).toBeCloseTo(destExpected[0], 2);
    expect(stateAtEnd.position[2]).toBeCloseTo(destExpected[2], 2);
  });

  it('[TC-FLY.05/MSS][UC-FLY] Vong 1 khong co nha tra ve Hoi 1 voi cao do Overview Y = 25.3m va FOV 24 do', () => {
    const phase = resolveDynamicGamePhase(1, 0);
    const config = resolveOverviewConfigByPhase(phase, CAMERA_CONFIG.overview);

    expect(phase).toBe(1);
    expect(config.position[1]).toBe(25.3);
    expect(config.fov).toBe(24);
    expect(config.speed).toBe(3.2);
  });

  it('[TC-FLY.06/A3][UC-FLY] Vong 5 co 4 nha tra ve Hoi 2 voi goc nghieng Tilt-Shift Y = 22.0m va FOV 26 do', () => {
    const phase = resolveDynamicGamePhase(5, 4);
    const config = resolveOverviewConfigByPhase(phase, CAMERA_CONFIG.overview);

    expect(phase).toBe(2);
    expect(config.position[1]).toBe(22.0);
    expect(config.fov).toBe(26);
  });

  it('[TC-FLY.07/MSS][UC-FLY] Vong 10 co 12 nha tra ve Hoi 3 voi goc can kich tinh Y = 18.5m va FOV 28 do', () => {
    const phase = resolveDynamicGamePhase(10, 12);
    const config = resolveOverviewConfigByPhase(phase, CAMERA_CONFIG.overview);

    expect(phase).toBe(3);
    expect(config.position[1]).toBe(18.5);
    expect(config.fov).toBe(28);
  });

  it('[TC-FLY.08/A4][UC-FLY] Van dau da dat Hoi 3 bao toan bat bien don dieu khi giai chap het nha o vong 11', () => {
    const phaseRound11 = resolveDynamicGamePhase(11, 0, 3);
    const phaseDemolish = resolveDynamicGamePhase(5, 0, 3);

    expect(phaseRound11).toBe(3);
    expect(phaseDemolish).toBe(3);
  });

  it('[TC-FLY.09/A5][UC-FLY] Xay than toc 6 nha o vong 2 kich hoat Monotonic Hybrid Trigger nhay coc len Hoi 2', () => {
    const phase = resolveDynamicGamePhase(2, 6);
    expect(phase).toBe(2);
  });

  it('[TC-FLY.10/A6][UC-FLY] Thoi luong bay tu tra ve chinh xac 670ms cho nguoi choi va 570ms cho Bot dong bo pawn_path', () => {
    const humanDuration = resolveJailFlightDuration(false);
    const botDuration = resolveJailFlightDuration(true);
    const progressFull = resolveJailFlightProgress(1000, 1670, false);
    const progressZero = resolveJailFlightProgress(null, 1670, false);

    expect(humanDuration).toBe(670);
    expect(botDuration).toBe(570);
    expect(progressFull).toBe(1.0);
    expect(progressZero).toBe(0);
  });

  it('[TC-FLY.11/A7][UC-FLY] Duong bay o 2 sang o 18 huong ve man Nam be cong arcZ > 0 va Scenic Dip', () => {
    const state = calculateSplineArcCameraState({
      startCell: 2,
      targetCell: 18,
      progress: 0.5,
    });
    expect(state.position[2]).toBeGreaterThan(0);
    expect(state.position[1]).toBeLessThanOrEqual(14.5);
  });

  it('[TC-FLY.12/A8][UC-FLY] Man hinh Desktop widescreen aspect 1.77 giu nguyen FOV tieu chuan 30 do', () => {
    const state = calculateSplineArcCameraState({
      startCell: 30,
      targetCell: 10,
      progress: 0.5,
      aspect: 1.77,
    });
    expect(state.fov).toBe(30);
  });

  it('[TC-FLY.13/A9][UC-FLY] Tien trinh am hoac vuot qua 1.0 tu dong clamp an toan trong khoang 0 den 1', () => {
    const stateUnder = calculateSplineArcCameraState({ startCell: 30, targetCell: 10, progress: -0.5 });
    const stateOver = calculateSplineArcCameraState({ startCell: 30, targetCell: 10, progress: 1.5 });
    const stateStart = calculateSplineArcCameraState({ startCell: 30, targetCell: 10, progress: 0.0 });
    const stateEnd = calculateSplineArcCameraState({ startCell: 30, targetCell: 10, progress: 1.0 });

    expect(stateUnder.position[0]).toBeCloseTo(stateStart.position[0], 2);
    expect(stateOver.position[0]).toBeCloseTo(stateEnd.position[0], 2);
  });

  it('[TC-FLY.14/A10][UC-FLY] calculateTargetCameraState overview voi gamePhase = 2 tra ve dung goc nhin Hoi 2', () => {
    const state = calculateTargetCameraState('overview', undefined, undefined, { gamePhase: 2 });
    expect(state.position[1]).toBe(22.0);
    expect(state.fov).toBe(26);
    expect(state.speed).toBe(3.8);
  });

  it('[TC-FLY.15/A11][UC-FLY] calculateTargetCameraState overview voi gamePhase = 3 tra ve dung goc nhin Hoi 3', () => {
    const state = calculateTargetCameraState('overview', undefined, undefined, { gamePhase: 3 });
    expect(state.position[1]).toBe(18.5);
    expect(state.fov).toBe(28);
    expect(state.speed).toBe(4.2);
  });
});
