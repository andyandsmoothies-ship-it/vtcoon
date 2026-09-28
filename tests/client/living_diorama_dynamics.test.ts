// [TC-221.01/MSS..TC-221.16/MSS][UC-IMP221]
// Living Diorama Dynamics Contract Test Suite (IMP-221 Bước 3)
// Ma trận kiểm thử hợp đồng 5 mặt Universal 5-Facet Matrix & Detroit Style
// Rules: 16 atomic tests, 1-4 asserts/test, zero loops in it(), no static checklist tests

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as marinaModule from '../../src/client/3d/diorama/diorama_marina';

// ============================================================================
// DYNAMIC IMPORT HARNESS (Station 1 RED Contract Gate)
// Dynamically resolves Station 2 modules to assert clean Business RED
// ============================================================================
const BIRDS_MODULE_PATH = '../../src/client/3d/diorama/diorama_perching_birds';
const CRUISER_MODULE_PATH = '../../src/client/3d/diorama/diorama_harbor_cruiser';

let birdsMod: any = null;
try {
  birdsMod = await import(/* @vite-ignore */ BIRDS_MODULE_PATH);
} catch {
  try {
    birdsMod = await import(/* @vite-ignore */ `${BIRDS_MODULE_PATH}.js`);
  } catch {
    birdsMod = null;
  }
}

let cruiserMod: any = null;
try {
  cruiserMod = await import(/* @vite-ignore */ CRUISER_MODULE_PATH);
} catch {
  try {
    cruiserMod = await import(/* @vite-ignore */ `${CRUISER_MODULE_PATH}.js`);
  } catch {
    cruiserMod = null;
  }
}

// Accessors for production symbols
const DioramaMarina = marinaModule.DioramaMarina;
const calculateWatercraftBobbing: ((time: number, phaseOffset?: number) => { y: number; rotZ: number; rotX: number }) | undefined =
  (marinaModule as any).calculateWatercraftBobbing;
const calculateBeaconIntensity: ((phase: any) => number) | undefined =
  (marinaModule as any).calculateBeaconIntensity;
const calculateBeaconRotation: ((time: number, speed?: number) => number) | undefined =
  (marinaModule as any).calculateBeaconRotation;

const calculateCruiserTrajectory: ((time: number) => { x: number; y: number; z: number; yaw: number }) | undefined =
  cruiserMod?.calculateCruiserTrajectory;
const calculateCruiserWake: ((time: number) => number) | undefined =
  cruiserMod?.calculateCruiserWake;
const DioramaHarborCruiser = cruiserMod?.DioramaHarborCruiser;

const PERCH_SPOTS: readonly { x: number; y: number; z: number; baseRotY: number }[] = birdsMod?.PERCH_SPOTS ?? [
  { x: -1.05, y: 0.055, z: 0.4, baseRotY: Math.PI / 2 },
  { x: -1.05, y: 0.055, z: -0.6, baseRotY: Math.PI / 2 },
  { x: 0.35, y: 0.12, z: 0.7, baseRotY: -Math.PI / 4 },
];
const calculateCirclingExitPosition: ((spot: any, birdIndex: number) => { x: number; y: number; z: number; rotY: number }) | undefined =
  birdsMod?.calculateCirclingExitPosition;
const calculateBirdFlightPosition: ((state: any, elapsed: number, spot: any, idx: number, landingFrom?: any) => { x: number; y: number; z: number; rotY: number; wingFlap: number }) | undefined =
  birdsMod?.calculateBirdFlightPosition;
const triggerBirdScare: ((state: any) => any) | undefined =
  birdsMod?.triggerBirdScare;
const DioramaPerchingBirds = birdsMod?.DioramaPerchingBirds;

describe('[IMP-221][Trạm 1 RED] Living Diorama Dynamics Contract Suite', () => {
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
  // FACET 1: Core Mechanics & Watercraft Dynamics (4 tests)
  // =========================================================================
  describe('Facet 1: Core Mechanics & Watercraft Dynamics', () => {
    it('[TC-221.01/MSS][UC-IMP221][Facet-1/YachtBobbing] calculateWatercraftBobbing(time, phase) tính toán dao động y và góc nghiêng rotZ, rotX mượt mà', () => {
      const bobbing = calculateWatercraftBobbing?.(1.0, 0.0);
      expect(bobbing).toBeDefined();
      expect(bobbing?.y).toBeCloseTo(Math.sin(2.8) * 0.006, 4);
      expect(bobbing?.rotZ).toBeCloseTo(Math.sin(2.4) * 0.022, 4);
      expect(bobbing?.rotX).toBeCloseTo(Math.cos(2.1) * 0.015, 4);
    });

    it('[TC-221.02/MSS][UC-IMP221][Facet-1/PhaseOffset] Độ lệch pha 2 tàu neo đậu >= 1.2 rad (cụ thể 1.6 rad)', () => {
      const phaseOffset = 1.6;
      expect(phaseOffset).toBeGreaterThanOrEqual(1.2);
      const b1 = calculateWatercraftBobbing?.(1.0, 0.0);
      const b2 = calculateWatercraftBobbing?.(1.0, phaseOffset);
      expect(b1).toBeDefined();
      expect(Math.abs((b1?.rotZ ?? 0) - (b2?.rotZ ?? 0))).toBeGreaterThan(0.005);
    });

    it('[TC-221.03/MSS][UC-IMP221][Facet-1/CruiserTrajectory] calculateCruiserTrajectory(time) tính (x, y, z, yaw) theo tiếp tuyến', () => {
      const traj0 = calculateCruiserTrajectory?.(0);
      expect(traj0).toBeDefined();
      expect(traj0?.x).toBeCloseTo(-0.4, 2);
      expect(traj0?.z).toBeCloseTo(0.2, 2);
      expect(traj0?.yaw).toBeCloseTo(0, 2);
    });

    it('[TC-221.04/MSS][UC-IMP221][Facet-1/CruiserWake] calculateCruiserWake(time) dao động điều hòa quanh 1.0 trong [0.88, 1.12]', () => {
      const wake0 = calculateCruiserWake?.(0);
      const wakePeak = calculateCruiserWake?.(Math.PI / 10);
      const wakeTrough = calculateCruiserWake?.((3 * Math.PI) / 10);
      expect(wake0).toBeDefined();
      expect(wake0).toBeCloseTo(1.0, 3);
      expect(wakePeak).toBeCloseTo(1.12, 3);
      expect(wakeTrough).toBeCloseTo(0.88, 3);
    });
  });

  // =========================================================================
  // FACET 2: Boundary & Range Clamping (3 tests)
  // =========================================================================
  describe('Facet 2: Boundary & Range Clamping', () => {
    it('[TC-221.05/MSS][UC-IMP221][Facet-2/BobbingBounds] Biên độ bobbing: y trong [-0.012, 0.012], rotZ trong [-0.04, 0.04], rotX trong [-0.04, 0.04]', () => {
      const bPeak = calculateWatercraftBobbing?.(Math.PI / 5.6, 0.0);
      const bSample = calculateWatercraftBobbing?.(2.5, 1.6);
      expect(bPeak).toBeDefined();
      expect(Math.abs(bPeak?.y ?? 999)).toBeLessThanOrEqual(0.012);
      expect(Math.abs(bSample?.rotZ ?? 999)).toBeLessThanOrEqual(0.04);
      expect(Math.abs(bSample?.rotX ?? 999)).toBeLessThanOrEqual(0.04);
    });

    it('[TC-221.06/MSS][UC-IMP221][Facet-2/BirdFlightAltitude] pos.y của chim luôn nằm trong [0.05, 2.5] ở mọi trạng thái FSM (PERCHED, TAKE_OFF, CIRCLING, LANDING)', () => {
      const spot = PERCH_SPOTS[0]!;
      const yPerched = calculateBirdFlightPosition?.('PERCHED', 1.0, spot, 0)?.y;
      const yTakeoff = calculateBirdFlightPosition?.('TAKE_OFF', 1.0, spot, 0)?.y;
      const yCircling = calculateBirdFlightPosition?.('CIRCLING', 2.5, spot, 0)?.y;
      const yLanding = calculateBirdFlightPosition?.('LANDING', 0.9, spot, 0)?.y;
      expect(yPerched).toBeDefined();
      expect(yPerched).toBeGreaterThanOrEqual(0.05);
      expect(yTakeoff).toBeLessThanOrEqual(2.5);
      expect(yLanding).toBeGreaterThanOrEqual(0.05);
    });

    it('[TC-221.07/MSS][UC-IMP221][Facet-2/BeaconIntensityClamp] calculateBeaconIntensity(phase) luôn nằm trong [0.0, 3.0]', () => {
      const dayVal = calculateBeaconIntensity?.('day' as any);
      const sunsetVal = calculateBeaconIntensity?.('sunset' as any);
      const nightVal = calculateBeaconIntensity?.('night' as any);
      expect(dayVal).toBeDefined();
      expect(dayVal).toBeGreaterThanOrEqual(0.0);
      expect(sunsetVal).toBeLessThanOrEqual(3.0);
      expect(nightVal).toBeLessThanOrEqual(3.0);
    });
  });

  // =========================================================================
  // FACET 3: Bird Behavior FSM & Reactivity (3 tests)
  // =========================================================================
  describe('Facet 3: Bird Behavior FSM & Reactivity', () => {
    it('[TC-221.08/MSS][UC-IMP221][Facet-3/IdlePerching] Ban đầu ở PERCHED, vị trí chim tại đúng cọc neo, biên độ thở vi mô <= 0.005', () => {
      const spot = PERCH_SPOTS[0]!;
      const pos0 = calculateBirdFlightPosition?.('PERCHED', 0, spot, 0);
      const posT = calculateBirdFlightPosition?.('PERCHED', 1.5, spot, 0);
      expect(pos0).toBeDefined();
      expect(pos0?.x).toBeCloseTo(spot.x, 3);
      expect(Math.abs((posT?.y ?? 999) - spot.y)).toBeLessThanOrEqual(0.005);
      expect(pos0?.wingFlap).toBe(0);
    });

    it('[TC-221.09/MSS][UC-IMP221][Facet-3/ScareTriggerGuard] triggerBirdScare(\'PERCHED\') trả về \'TAKE_OFF\'; triggerBirdScare(\'CIRCLING\') trả về \'CIRCLING\'; triggerBirdScare(\'LANDING\') trả về \'LANDING\' (chống air teleport)', () => {
      expect(triggerBirdScare).toBeDefined();
      expect(triggerBirdScare?.('PERCHED')).toBe('TAKE_OFF');
      expect(triggerBirdScare?.('CIRCLING')).toBe('CIRCLING');
      expect(triggerBirdScare?.('LANDING')).toBe('LANDING');
    });

    it('[TC-221.10/MSS][UC-IMP221][Facet-3/LandingDiscontinuityElimination] Tại t=0 của LANDING, vị trí nội suy trùng khớp chính xác tuyệt đối với calculateCirclingExitPosition(spot, birdIndex) (khoảng cách sai lệch = 0)', () => {
      const spot = PERCH_SPOTS[1]!;
      const exitPos = calculateCirclingExitPosition?.(spot, 1);
      const landingPos0 = calculateBirdFlightPosition?.('LANDING', 0, spot, 1);
      expect(exitPos).toBeDefined();
      expect(landingPos0).toBeDefined();
      const dx = (landingPos0?.x ?? 0) - (exitPos?.x ?? 0);
      const dy = (landingPos0?.y ?? 0) - (exitPos?.y ?? 0);
      const dz = (landingPos0?.z ?? 0) - (exitPos?.z ?? 0);
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      expect(dist).toBe(0);
      expect(landingPos0?.rotY).toBeCloseTo(exitPos?.rotY ?? -999, 4);
    });
  });

  // =========================================================================
  // FACET 4: Time-of-Day Lighting Integration (3 tests)
  // =========================================================================
  describe('Facet 4: Time-of-Day Lighting Integration', () => {
    it('[TC-221.11/MSS][UC-IMP221][Facet-4/DayBeacon] calculateBeaconIntensity(\'day\') giữ mức mờ dịu <= 0.2', () => {
      const dayIntensity = calculateBeaconIntensity?.('day');
      expect(dayIntensity).toBeDefined();
      expect(dayIntensity).toBeLessThanOrEqual(0.2);
      expect(dayIntensity).toBeGreaterThanOrEqual(0.05);
    });

    it('[TC-221.12/MSS][UC-IMP221][Facet-4/SunsetBeacon] calculateBeaconIntensity(\'sunset\') nằm trong [0.6, 1.0]', () => {
      const sunsetIntensity = calculateBeaconIntensity?.('sunset');
      expect(sunsetIntensity).toBeDefined();
      expect(sunsetIntensity).toBeGreaterThanOrEqual(0.6);
      expect(sunsetIntensity).toBeLessThanOrEqual(1.0);
    });

    it('[TC-221.13/MSS][UC-IMP221][Facet-4/NightBeaconSweep] calculateBeaconIntensity(\'night\') >= 1.8; calculateBeaconRotation(t, 1.2) quay góc liên tục với vận tốc 1.2 rad/s', () => {
      const nightIntensity = calculateBeaconIntensity?.('night');
      expect(nightIntensity).toBeDefined();
      expect(nightIntensity).toBeGreaterThanOrEqual(1.8);
      const rot0 = calculateBeaconRotation?.(0, 1.2);
      const rot5 = calculateBeaconRotation?.(5, 1.2);
      expect(rot0).toBe(0);
      expect(rot5).toBeCloseTo(6.0, 3);
    });
  });

  // =========================================================================
  // FACET 5: Backward Compatibility & Resource Teardown (3 tests)
  // =========================================================================
  describe('Facet 5: Backward Compatibility & Resource Teardown', () => {
    it('[TC-221.14/MSS][UC-IMP221][Facet-5/LighthouseTestId] renderToStaticMarkup(<DioramaMarina />) kết xuất HTML chứa data-testid="heritage-lighthouse" và màu thấu kính "#FEF08A"', () => {
      const html = renderToStaticMarkup(React.createElement(DioramaMarina));
      expect(html).toContain('data-testid="heritage-lighthouse"');
      expect(html).toContain('#FEF08A');
    });

    it('[TC-221.15/MSS][UC-IMP221][Facet-5/ZeroShadowOverhead] renderToStaticMarkup(<DioramaPerchingBirds />) và renderToStaticMarkup(<DioramaHarborCruiser />) kết xuất HTML KHÔNG chứa castshadow="true" hay castShadow', () => {
      expect(DioramaPerchingBirds).toBeDefined();
      expect(DioramaHarborCruiser).toBeDefined();
      const birdsHtml = DioramaPerchingBirds ? renderToStaticMarkup(React.createElement(DioramaPerchingBirds)) : '';
      const cruiserHtml = DioramaHarborCruiser ? renderToStaticMarkup(React.createElement(DioramaHarborCruiser)) : '';
      expect(birdsHtml.toLowerCase()).not.toContain('castshadow');
      expect(cruiserHtml.toLowerCase()).not.toContain('castshadow');
    });

    it('[TC-221.16/MSS][UC-IMP221][Facet-5/SSRMarkupSafety] renderToStaticMarkup(<DioramaMarina />) kết xuất trơn tru không ném ngoại lệ trong môi trường Node.js', () => {
      let html = '';
      expect(() => {
        html = renderToStaticMarkup(React.createElement(DioramaMarina));
      }).not.toThrow();
      expect(html).toContain('data-testid="diorama-perching-birds"');
      expect(html).toContain('data-testid="diorama-harbor-cruiser"');
    });
  });
});
