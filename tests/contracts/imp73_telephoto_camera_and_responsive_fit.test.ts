// [TC-73/MSS][IMP-73] Contract Test Suite: Telephoto Camera, Responsive Aspect Fit & Reset CTA
// Traceability: docs/epics/networking/_epic_ledger.md § IMP-73
import { describe, it, expect, beforeAll } from 'vitest';
import * as THREE from 'three';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CAMERA_CONFIG } from '../../src/client/3d/camera_state_machine';
import * as CamStateMachine from '../../src/client/3d/camera_state_machine';
import { PreMatchDeck } from '../../src/client/ui/lobby/pre_match_deck';

type ResponsiveDistFn = (aspect: number, baseDist?: number) => number;
const calculateResponsiveCameraDistance = (
  CamStateMachine as { calculateResponsiveCameraDistance?: ResponsiveDistFn }
).calculateResponsiveCameraDistance;

const createCamera = (
  fov: number,
  aspect: number,
  pos: readonly [number, number, number],
  target: readonly [number, number, number]
): THREE.PerspectiveCamera => {
  const cam = new THREE.PerspectiveCamera(fov, aspect, 0.5, 200);
  cam.position.set(pos[0], pos[1], pos[2]);
  cam.lookAt(target[0], target[1], target[2]);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  return cam;
};

const project = (cam: THREE.PerspectiveCamera, coords: readonly [number, number, number]): { x: number; y: number } => {
  const v = new THREE.Vector3(coords[0], coords[1], coords[2]);
  v.project(cam);
  return { x: v.x, y: v.y };
};

const CORNER_TILES: readonly (readonly [number, number, number])[] = [
  [9, 0, 9],   // Ô 00 Khởi Hành
  [-9, 0, 9],  // Ô 10 Trạm Kiểm Toán
  [-9, 0, -9], // Ô 20 Đảo Quân Sự
  [9, 0, -9],  // Ô 30 Lệnh Thu Thuế
];

describe('[TC-73/MSS][IMP-73] Telephoto Camera & Responsive Aspect Fit Contract Suite', () => {
  let preMatchHtml = '';
  const cam1024 = createCamera(CAMERA_CONFIG.pre_match.fov, 1024 / 554, CAMERA_CONFIG.pre_match.position, CAMERA_CONFIG.pre_match.target);
  const cam1920 = createCamera(CAMERA_CONFIG.pre_match.fov, 1920 / 1080, CAMERA_CONFIG.pre_match.position, CAMERA_CONFIG.pre_match.target);
  const cam1440 = createCamera(CAMERA_CONFIG.pre_match.fov, 1440 / 900, CAMERA_CONFIG.pre_match.position, CAMERA_CONFIG.pre_match.target);

  beforeAll(() => {
    preMatchHtml = renderToStaticMarkup(React.createElement(PreMatchDeck, { isHost: true, roomCode: 'VT7300' }));
  });

  // =========================================================================
  // FACET 1: TELEPHOTO CAMERA OPTICAL PROJECTION CONTRACTS
  // =========================================================================
  describe('Facet 1: Telephoto Camera Optical Projection Contracts', () => {
    it('[TC-73.01/MSS][IMP-73] CAMERA_CONFIG.pre_match.fov adopts architectural telephoto 24°', () => {
      expect(CAMERA_CONFIG.pre_match.fov).toBe(24);
    });

    it('[TC-73.02/MSS][IMP-73] CAMERA_CONFIG.overview.fov adopts architectural telephoto 24°', () => {
      expect(CAMERA_CONFIG.overview.fov).toBe(24);
    });

    it('[TC-73.03/MSS][IMP-73] CAMERA_CONFIG.pre_match.position scales back along diagonal vector to [30, 33, 30]', () => {
      expect(CAMERA_CONFIG.pre_match.position).toEqual([30.0, 33.0, 30.0]);
    });

    it('[TC-73.04/MSS][IMP-73] CAMERA_CONFIG.pre_match.target centers optical compensation at [1.5, 0.0, 1.5]', () => {
      expect(CAMERA_CONFIG.pre_match.target).toEqual([1.5, 0.0, 1.5]);
    });

    it('[TC-73.05/MSS][IMP-73] CAMERA_CONFIG.pre_match target compensates towards corner 00 (X >= 1.2 and Z >= 1.2)', () => {
      expect(CAMERA_CONFIG.pre_match.target[0]).toBeGreaterThanOrEqual(1.2);
      expect(CAMERA_CONFIG.pre_match.target[2]).toBeGreaterThanOrEqual(1.2);
    });

    it('[TC-73.06/MSS][IMP-73] Viewport 1024x554: Corner 00 [9, 0, 9] projects safely inside lower screen bounds', () => {
      const p = project(cam1024, [9, 0, 9]);
      expect(p.y).toBeGreaterThanOrEqual(-0.85);
      expect(p.y).toBeLessThanOrEqual(-0.55);
    });

    it('[TC-73.07/MSS][IMP-73] Viewport 1024x554: Corner 20 [-9, 0, -9] projects safely inside upper screen bounds', () => {
      const p = project(cam1024, [-9, 0, -9]);
      expect(p.y).toBeLessThanOrEqual(0.85);
      expect(p.y).toBeGreaterThanOrEqual(0.55);
    });

    it('[TC-73.08/MSS][IMP-73] Viewport 1024x554: Corner 10 [-9, 0, 9] projects safely inside left screen bounds', () => {
      const p = project(cam1024, [-9, 0, 9]);
      expect(p.x).toBeGreaterThanOrEqual(-0.85);
      expect(p.x).toBeLessThanOrEqual(-0.45);
    });

    it('[TC-73.09/MSS][IMP-73] Viewport 1024x554: Corner 30 [9, 0, -9] projects safely inside right screen bounds', () => {
      const p = project(cam1024, [9, 0, -9]);
      expect(p.x).toBeLessThanOrEqual(0.85);
      expect(p.x).toBeGreaterThanOrEqual(0.45);
    });

    it.each(CORNER_TILES)(
      '[TC-73.10/MSS][IMP-73] Desktop 1920x1080 keeps corner [%i, %i, %i] within safe margin (|x| <= 0.85, |y| <= 0.85)',
      (x, y, z) => {
        const p = project(cam1920, [x, y, z]);
        expect(Math.abs(p.x)).toBeLessThanOrEqual(0.85);
        expect(Math.abs(p.y)).toBeLessThanOrEqual(0.85);
      }
    );

    it.each(CORNER_TILES)(
      '[TC-73.11/MSS][IMP-73] Laptop 1440x900 keeps corner [%i, %i, %i] within safe margin (|x| <= 0.85, |y| <= 0.85)',
      (x, y, z) => {
        const p = project(cam1440, [x, y, z]);
        expect(Math.abs(p.x)).toBeLessThanOrEqual(0.85);
        expect(Math.abs(p.y)).toBeLessThanOrEqual(0.85);
      }
    );
  });

  // =========================================================================
  // FACET 2: RESPONSIVE ASPECT-RATIO FUNCTION (CALCULATERESPONSIVECAMERADISTANCE)
  // =========================================================================
  describe('Facet 2: Responsive Aspect-Ratio Function', () => {
    it('[TC-73.12/MSS][IMP-73] calculateResponsiveCameraDistance(1.85) yields distance in sweet spot [30, 34]', () => {
      const d = calculateResponsiveCameraDistance!(1.85);
      expect(d).toBeGreaterThanOrEqual(30);
      expect(d).toBeLessThanOrEqual(34);
    });

    it.each([1.85, 1.77, 1.6, 1.33, 1.0])(
      '[TC-73.13/MSS][IMP-73] calculateResponsiveCameraDistance(%f) returns positive finite number',
      (aspect) => {
        const d = calculateResponsiveCameraDistance!(aspect);
        expect(Number.isFinite(d)).toBe(true);
        expect(d).toBeGreaterThan(0);
      }
    );

    it('[TC-73.14/MSS][IMP-73] Monotonicity: Narrow aspect ratio 1.33 pulls camera further back than wide 1.77', () => {
      const dNarrow = calculateResponsiveCameraDistance!(1.33);
      const dWide = calculateResponsiveCameraDistance!(1.77);
      expect(dNarrow).toBeGreaterThanOrEqual(dWide);
    });
  });

  // =========================================================================
  // FACET 3: UI HEADER RESET CAMERA CTA
  // =========================================================================
  describe('Facet 3: UI Header Camera Controls Cleanliness', () => {
    it('[TC-73.15/MSS][IMP-73] PreMatchDeck header purges redundant reset-camera-btn container', () => {
      expect(preMatchHtml).not.toContain('data-testid="reset-camera-btn"');
    });

    it('[TC-73.16/MSS][IMP-73] PreMatchDeck does not leak obsolete camera reset icon', () => {
      expect(preMatchHtml).not.toContain('title="Đặt lại góc chuẩn 4 góc"');
    });

    it('[TC-73.17/MSS][IMP-73] PreMatchDeck maintains clean non-cluttered header controls', () => {
      expect(preMatchHtml).not.toMatch(/aria-label=".*(?:góc chuẩn|đặt lại).*"/i);
    });
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE & HEADLESS SAFETY
  // =========================================================================
  describe('Facet 4: Error Defense & Headless Safety', () => {
    it('[TC-73.18/MSS][IMP-73] Headless Three.js projection completes without WebGL canvas or crash', () => {
      const testCam = createCamera(24, 1.77, [30, 33, 30], [1.5, 0, 1.5]);
      const p = project(testCam, [0, 0, 0]);
      expect(Number.isFinite(p.x)).toBe(true);
      expect(Number.isFinite(p.y)).toBe(true);
    });

    it('[TC-73.19/MSS][IMP-73] calculateResponsiveCameraDistance safely handles degenerate aspect ratio 0', () => {
      const d = calculateResponsiveCameraDistance!(0);
      expect(Number.isFinite(d)).toBe(true);
      expect(d).toBeGreaterThan(0);
    });

    it('[TC-73.20/MSS][IMP-73] calculateResponsiveCameraDistance respects custom baseDistance input', () => {
      const dCustom = calculateResponsiveCameraDistance!(1.85, 40);
      expect(dCustom).toBeGreaterThanOrEqual(38);
    });
  });
});
