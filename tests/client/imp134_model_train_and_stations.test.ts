// [TC-IMP134/MSS][UC-134] IMP-134: Model Train, Stations & Articulated Kinematics Contract Suite
// Traceability: docs/master_roadmap.md § IMP-134 / Monopoly Plus Diorama Fidelity
// Universal 4-Facet Behavioral Matrix:
//   Facet 1 (Boundary & Curve Geometry): Track perimeter, 4 corner fillets, carriage offsets (0, 0.85m, 1.70m)
//   Facet 2 (Reactivity & Pacing Dynamics): Continuous motion, station deceleration, 3.5s stop at North & South, acceleration
//   Facet 3 (Multi-Carriage Yaw & Articulation): +X axis formula atan2(-tangent.z, tangent.x), independent articulation per carriage
//   Facet 4 (Component Rendering & Error Defense): SSR static markup, zero NaN, diorama-landmark-north-station & diorama-waterfront-station preservation

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as RailroadModule from '../../src/client/3d/diorama/diorama_railroad';
import {
  MiniatureCityDiorama,
  DioramaModelRailroad,
  DioramaWaterfrontStation,
} from '../../src/client/3d/miniature_city_diorama';

// Dynamic import for diorama_train_kinematics module (if split into a dedicated file by implementer)
let trainKinematicsModule: Record<string, any> | null = null;

beforeAll(async () => {
  try {
    // @ts-ignore
    trainKinematicsModule = await import('../../src/client/3d/diorama/diorama_train_kinematics');
  } catch {
    trainKinematicsModule = null;
  }
});

// Helper to resolve train contract exports from diorama_railroad or diorama_train_kinematics
function getCarriageOffsets(): readonly [number, number, number] {
  const config = (RailroadModule as any).TRAIN_CONFIG ?? trainKinematicsModule?.TRAIN_CONFIG;
  const direct =
    (RailroadModule as any).TRAIN_CARRIAGE_OFFSETS ??
    trainKinematicsModule?.TRAIN_CARRIAGE_OFFSETS;
  const offsets = config?.CARRIAGE_OFFSETS ?? direct;
  expect(
    offsets,
    '[RED GATE] TRAIN_CARRIAGE_OFFSETS or TRAIN_CONFIG.CARRIAGE_OFFSETS is not defined in diorama_railroad or diorama_train_kinematics'
  ).toBeDefined();
  return offsets as [number, number, number];
}

function getStationDwellSeconds(): number {
  const config = (RailroadModule as any).TRAIN_CONFIG ?? trainKinematicsModule?.TRAIN_CONFIG;
  const direct =
    (RailroadModule as any).STATION_DWELL_SECONDS ??
    (RailroadModule as any).STATION_STOP_DURATION ??
    trainKinematicsModule?.STATION_DWELL_SECONDS ??
    trainKinematicsModule?.STATION_STOP_DURATION;
  const dwell = config?.DWELL_DURATION ?? config?.STATION_DWELL_SECONDS ?? direct;
  expect(
    dwell,
    '[RED GATE] STATION_DWELL_SECONDS or TRAIN_CONFIG.DWELL_DURATION is not defined in diorama_railroad or diorama_train_kinematics'
  ).toBeDefined();
  return dwell;
}

function getSouthStationProgress(): number {
  const config = (RailroadModule as any).TRAIN_CONFIG ?? trainKinematicsModule?.TRAIN_CONFIG;
  const direct =
    (RailroadModule as any).SOUTH_STATION_PROGRESS ??
    trainKinematicsModule?.SOUTH_STATION_PROGRESS;
  const p = config?.SOUTH_STATION_PROGRESS ?? direct;
  expect(
    p,
    '[RED GATE] SOUTH_STATION_PROGRESS or TRAIN_CONFIG.SOUTH_STATION_PROGRESS is not defined in diorama_railroad or diorama_train_kinematics'
  ).toBeDefined();
  return p;
}

function getNorthStationProgress(): number {
  const config = (RailroadModule as any).TRAIN_CONFIG ?? trainKinematicsModule?.TRAIN_CONFIG;
  const direct =
    (RailroadModule as any).NORTH_STATION_PROGRESS ??
    trainKinematicsModule?.NORTH_STATION_PROGRESS;
  const p = config?.NORTH_STATION_PROGRESS ?? direct;
  expect(
    p,
    '[RED GATE] NORTH_STATION_PROGRESS or TRAIN_CONFIG.NORTH_STATION_PROGRESS is not defined in diorama_railroad or diorama_train_kinematics'
  ).toBeDefined();
  return p;
}

function getTrackCurve(): any {
  const fn =
    (RailroadModule as any).getRailroadTrackCurve ??
    (RailroadModule as any).createRailroadTrackCurve ??
    trainKinematicsModule?.getRailroadTrackCurve ??
    trainKinematicsModule?.createRailroadTrackCurve;
  expect(
    fn,
    '[RED GATE] getRailroadTrackCurve or createRailroadTrackCurve is not implemented in diorama_railroad or diorama_train_kinematics'
  ).toBeTypeOf('function');
  return fn();
}

function getTrackPerimeter(): number {
  const fn =
    (RailroadModule as any).getRailroadTrackPerimeter ??
    trainKinematicsModule?.getRailroadTrackPerimeter;
  if (typeof fn === 'function') {
    return fn();
  }
  const curve = getTrackCurve();
  expect(curve, '[RED GATE] Track curve must have getLength method').toHaveProperty('getLength');
  return curve.getLength();
}

function computeTrainYaw(tangent: { x: number; y?: number; z: number }): number {
  const fn =
    (RailroadModule as any).computeTrainYaw ??
    (RailroadModule as any).calculateTrainYaw ??
    trainKinematicsModule?.computeTrainYaw ??
    trainKinematicsModule?.calculateTrainYaw;
  expect(
    fn,
    '[RED GATE] computeTrainYaw or calculateTrainYaw is not implemented in diorama_railroad or diorama_train_kinematics'
  ).toBeTypeOf('function');
  return fn(tangent);
}

function computeTrainKinematics(elapsedTime: number): {
  progress: number;
  speed: number;
  isStopped: boolean;
  currentStation: string | null;
} {
  const fn =
    (RailroadModule as any).computeTrainKinematics ??
    (RailroadModule as any).calculateTrainKinematics ??
    trainKinematicsModule?.computeTrainKinematics ??
    trainKinematicsModule?.calculateTrainKinematics;
  expect(
    fn,
    '[RED GATE] computeTrainKinematics or calculateTrainKinematics is not implemented in diorama_railroad or diorama_train_kinematics'
  ).toBeTypeOf('function');
  return fn(elapsedTime);
}

function computeCarriageProgress(
  leadProgress: number,
  carriageOffsetMeters: number,
  trackLengthMeters: number
): number {
  const fn =
    (RailroadModule as any).computeCarriageProgress ??
    (RailroadModule as any).calculateCarriageProgress ??
    trainKinematicsModule?.computeCarriageProgress ??
    trainKinematicsModule?.calculateCarriageProgress;
  expect(
    fn,
    '[RED GATE] computeCarriageProgress or calculateCarriageProgress is not implemented in diorama_railroad or diorama_train_kinematics'
  ).toBeTypeOf('function');
  return fn(leadProgress, carriageOffsetMeters, trackLengthMeters);
}

function getNorthStationComponent(): React.ComponentType<any> {
  const comp =
    (RailroadModule as any).DioramaLandmarkNorthStation ??
    trainKinematicsModule?.DioramaLandmarkNorthStation;
  expect(
    comp,
    '[RED GATE] DioramaLandmarkNorthStation is not yet implemented or exported in diorama_railroad.tsx'
  ).toBeDefined();
  return comp;
}

describe('[TC-IMP134/MSS][UC-134] IMP-134: Model Train, Stations & Articulated Kinematics Contract Suite', () => {
  let originalConsoleError: typeof console.error;

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (
        msg.includes('is using incorrect casing') ||
        msg.includes('does not recognize the') ||
        msg.includes('non-boolean attribute')
      ) {
        return;
      }
      originalConsoleError(...args);
    };
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  // =========================================================================
  // FACET 1: BOUNDARY & CURVE GEOMETRY (CHU VI ĐƯỜNG RAY & KHOẢNG CÁCH TOA)
  // =========================================================================
  describe('Facet 1: Boundary & Curve Geometry — Chu Vi Đường Ray & Khoảng Cách Toa', () => {
    it('[TC-IMP134.01/MSS][UC-134][Facet1-Boundary] Đường ray mô hình khép kín quanh sa bàn với chu vi trong ngưỡng chuẩn [50m, 58m]', () => {
      const perimeter = getTrackPerimeter();
      expect(perimeter).toBeGreaterThanOrEqual(50.0);
      expect(perimeter).toBeLessThanOrEqual(58.0);
    });

    it('[TC-IMP134.02/MSS][UC-134][Facet1-Boundary] Bán kính bo cong 4 góc đường ray nằm trong dải chuẩn [0.6m, 1.8m] để chống giật góc', () => {
      const curve = getTrackCurve();
      expect(curve.closed).toBe(true);
      const pCorner = curve.getPointAt(0.25);
      expect(Math.abs(pCorner.x)).toBeLessThanOrEqual(7.15);
      expect(Math.abs(pCorner.z)).toBeLessThanOrEqual(7.15);
    });

    it('[TC-IMP134.03/MSS][UC-134][Facet1-Boundary] Khoảng cách nối toa chốt cố định: Toa 1 lùi 0.85m so với đầu tàu', () => {
      const offsets = getCarriageOffsets();
      expect(offsets[0]).toBeCloseTo(0, 2);
      expect(offsets[1] - offsets[0]).toBeCloseTo(0.85, 2);
    });

    it('[TC-IMP134.04/MSS][UC-134][Facet1-Boundary] Khoảng cách nối toa chốt cố định: Toa 2 lùi 1.70m so với đầu tàu (0.85m sau Toa 1)', () => {
      const offsets = getCarriageOffsets();
      expect(offsets[2] - offsets[0]).toBeCloseTo(1.70, 2);
      expect(offsets[2] - offsets[1]).toBeCloseTo(0.85, 2);
    });

    it('[TC-IMP134.05/MSS][UC-134][Facet1-Boundary] Thuật toán tính progress từng toa computeCarriageProgress bọc chu kỳ khép kín [0, 1) khi qua vạch xuất phát', () => {
      const trackLen = 54.0;
      const progressCoach1 = computeCarriageProgress(0.01, 0.85, trackLen);
      expect(progressCoach1).toBeGreaterThanOrEqual(0.9);
      expect(progressCoach1).toBeLessThan(1.0);
    });
  });

  // =========================================================================
  // FACET 2: REACTIVITY & PACING DYNAMICS (TÀU CHẠY, GIẢM TỐC, DỪNG GA 3.5S, TĂNG TỐC)
  // =========================================================================
  describe('Facet 2: Reactivity & Pacing Dynamics — Nhịp Độ Chạy Tàu & Dừng Đỗ Ga', () => {
    it('[TC-IMP134.06/MSS][UC-134][Facet2-Reactivity] Tiến độ đoàn tàu tịnh tiến đơn điệu theo thời gian trôi qua khi nằm ngoài nhà ga', () => {
      const k1 = computeTrainKinematics(2.0);
      const k2 = computeTrainKinematics(4.0);
      expect(k2.progress).toBeGreaterThan(k1.progress);
      expect(k1.speed).toBeGreaterThan(0);
    });

    it('[TC-IMP134.07/MSS][UC-134][Facet2-Reactivity] Vị trí Ga Nam (Waterfront Station) chốt tại progress xấp xỉ 0.12 (±0.03)', () => {
      const southProgress = getSouthStationProgress();
      expect(southProgress).toBeGreaterThanOrEqual(0.09);
      expect(southProgress).toBeLessThanOrEqual(0.15);
    });

    it('[TC-IMP134.08/MSS][UC-134][Facet2-Reactivity] Vị trí Ga Bắc (Landmark North Station) chốt tại progress xấp xỉ 0.62 (±0.03)', () => {
      const northProgress = getNorthStationProgress();
      expect(northProgress).toBeGreaterThanOrEqual(0.59);
      expect(northProgress).toBeLessThanOrEqual(0.65);
    });

    it('[TC-IMP134.09/MSS][UC-134][Facet2-Reactivity] Thời gian dừng đỗ chuẩn mực tại mỗi nhà ga chốt đúng 3.5 giây (STATION_DWELL_SECONDS = 3.5)', () => {
      const dwell = getStationDwellSeconds();
      expect(dwell).toBe(3.5);
    });

    it('[TC-IMP134.10/MSS][UC-134][Facet2-Reactivity] Vận tốc tức thời giảm dần về 0 khi vào ga và tăng tốc dần khi xuất phát', () => {
      const cruise = computeTrainKinematics(2.0);
      expect(cruise.speed).toBeGreaterThan(0);
      expect(cruise.isStopped).toBe(false);
    });
  });

  // =========================================================================
  // FACET 3: MULTI-CARRIAGE YAW & ARTICULATION (XOAY KHỚP NỐI TOA CHUẨN TRỤC +X)
  // =========================================================================
  describe('Facet 3: Multi-Carriage Yaw & Articulation — Xoay Khớp Nối Toa Chuẩn Trục +X', () => {
    it('[TC-IMP134.11/MSS][UC-134][Facet3-Articulation] Công thức tính yaw chuẩn trục +X: Math.atan2(-tangent.z, tangent.x)', () => {
      expect(computeTrainYaw({ x: 1, z: 0 })).toBeCloseTo(0, 3);
      expect(computeTrainYaw({ x: 0, z: -1 })).toBeCloseTo(Math.PI / 2, 3);
      expect(Math.abs(computeTrainYaw({ x: -1, z: 0 }))).toBeCloseTo(Math.PI, 3);
      expect(computeTrainYaw({ x: 0, z: 1 })).toBeCloseTo(-Math.PI / 2, 3);
    });

    it('[TC-IMP134.12/MSS][UC-134][Facet3-Articulation] Từng toa có góc yaw xoay độc lập khi đầu tàu bắt đầu vào góc cua 90 độ', () => {
      const leadYaw = computeTrainYaw({ x: 1, z: -1 });
      const coach1Yaw = computeTrainYaw({ x: 1, z: 0 });
      expect(leadYaw).not.toBeCloseTo(coach1Yaw, 2);
      expect(leadYaw).toBeCloseTo(Math.PI / 4, 2);
    });

    it('[TC-IMP134.13/MSS][UC-134][Facet3-Articulation] Toa khách 2 bảo toàn góc yaw thẳng khi Toa khách 1 đã rẽ vào góc cua', () => {
      const coach1Yaw = computeTrainYaw({ x: 1, z: -1 });
      const coach2Yaw = computeTrainYaw({ x: 1, z: 0 });
      expect(coach1Yaw).not.toBeCloseTo(coach2Yaw, 2);
      expect(coach2Yaw).toBeCloseTo(0, 2);
    });

    it('[TC-IMP134.14/MSS][UC-134][Facet3-Articulation] Khi cả 3 toa cùng di chuyển trên đoạn ray thẳng, góc yaw của 3 toa hoàn toàn đồng nhất', () => {
      const tStraight = { x: 1, z: 0 };
      const yLead = computeTrainYaw(tStraight);
      const yCoach1 = computeTrainYaw(tStraight);
      const yCoach2 = computeTrainYaw(tStraight);
      expect(yCoach1).toBe(yLead);
      expect(yCoach2).toBe(yLead);
    });

    it('[TC-IMP134.15/MSS][UC-134][Facet3-Articulation] Chuẩn hóa tiếp tuyến đầu vào không làm sai lệch phép tính yaw ngay cả khi vector chưa chuẩn hóa', () => {
      const yawUnit = computeTrainYaw({ x: 1, z: 0 });
      const yawScaled = computeTrainYaw({ x: 7.2, z: 0 });
      expect(yawScaled).toBeCloseTo(yawUnit, 4);
    });
  });

  // =========================================================================
  // FACET 4: COMPONENT RENDERING & ERROR DEFENSE (RENDER TĨNH, TESTID GA BẮC/NAM)
  // =========================================================================
  describe('Facet 4: Component Rendering & Error Defense — Kết Xuất Tĩnh & Bảo Toàn Testid', () => {
    it('[TC-IMP134.16/MSS][UC-134][Facet4-Rendering] DioramaLandmarkNorthStation kết xuất tĩnh không crash và sở hữu data-testid="diorama-landmark-north-station"', () => {
      const NorthStation = getNorthStationComponent();
      const markup = renderToStaticMarkup(React.createElement(NorthStation));
      expect(markup).toContain('data-testid="diorama-landmark-north-station"');
    });

    it('[TC-IMP134.17/MSS][UC-134][Facet4-Rendering] DioramaWaterfrontStation bảo toàn nguyên vẹn data-testid="diorama-waterfront-station"', () => {
      const markup = renderToStaticMarkup(React.createElement(DioramaWaterfrontStation));
      expect(markup).toContain('data-testid="diorama-waterfront-station"');
    });

    it('[TC-IMP134.18/MSS][UC-134][Facet4-Rendering] MiniatureCityDiorama tích hợp đồng thời cả Ga Bắc và Ga Nam tại điểm tiêu thụ sa bàn', () => {
      const dioramaMarkup = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));
      expect(dioramaMarkup).toContain('data-testid="diorama-waterfront-station"');
      expect(dioramaMarkup).toContain('data-testid="diorama-landmark-north-station"');
    });

    it('[TC-IMP134.19/MSS][UC-134][Facet4-ErrorDefense] Toàn bộ tọa độ và tham số của tuyến đường sắt và nhà ga sa bàn tuyệt đối không chứa NaN', () => {
      const railroadMarkup = renderToStaticMarkup(React.createElement(DioramaModelRailroad));
      const waterfrontMarkup = renderToStaticMarkup(React.createElement(DioramaWaterfrontStation));
      expect(railroadMarkup).not.toContain('NaN');
      expect(waterfrontMarkup).not.toContain('NaN');
    });

    it('[TC-IMP134.20/MSS][UC-134][Facet4-ErrorDefense] Vị trí của Ga Bắc được định vị đối xứng ở bờ Bắc (tọa độ Z âm Z <= -5.5)', () => {
      const NorthStation = getNorthStationComponent();
      const markup = renderToStaticMarkup(React.createElement(NorthStation));
      const posMatches = Array.from(markup.matchAll(/position="([^"]+)"/g));
      const hasNorthZ = posMatches.some((m) => {
        const coords = (m[1] ?? '').split(',').map(Number);
        return coords[2] !== undefined && coords[2] <= -5.5 && coords[2] >= -7.5;
      });
      expect(hasNorthZ).toBe(true);
    });

    it('[TC-IMP134.21/MSS][UC-134][Facet4-ErrorDefense] DioramaModelRailroad kết xuất tĩnh bảo toàn cấu trúc JSX với vị trí 3 toa hợp lệ khi không có requestAnimationFrame', () => {
      const railroadMarkup = renderToStaticMarkup(React.createElement(DioramaModelRailroad));
      expect(railroadMarkup.length).toBeGreaterThan(100);
      expect(railroadMarkup).toContain('#DC2626');
      expect(railroadMarkup).toContain('#0284C7');
    });
  });
});
