// [TC-190.01/MSS..TC-190.16/MSS][UC-IMP190]
// Universal Adversarial Contract Test Suite: Specialized Devices (iPadOS/Android Tablet 1024px Texture LOD, Foldable 320px Ergonomics & Camera Orbit Snap Button)
// Traceability: docs/plans/improvements/IMP-190-specialized-devices-and-camera-snap_plan.md & .agents/audit/PLAN_AUDIT_IMP190.md

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';

// Ensure Zustand stores evaluate live state instead of stale initial snapshot during Node.js SSR test rendering
const origUseSyncExternalStore = React.useSyncExternalStore;
React.useSyncExternalStore = ((subscribe, getSnapshot, _getServerSnapshot) => {
  return origUseSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}) as typeof React.useSyncExternalStore;

// Production stores & components
import { useGameStore } from '../../src/client/store/game_store';
import { INITIAL_GAME_STATE } from '../../src/client/store/game_store_types';
import { TopBar } from '../../src/client/ui/top_bar';
import { PlayerHudList } from '../../src/client/ui/player_hud_list';
import { HapticEngine } from '../../src/client/haptics/haptic_engine';

// Modules under test
import * as deviceDetect from '../../src/client/3d/device_detect';
import * as tileTextureGen from '../../src/client/3d/tile_texture_generator';

// ============================================================================
// DYNAMIC IMPORT HARNESS (Station 1 RED Contract Gate)
// Dynamically resolves Station 2 CameraResetPill module to assert clean Business RED
// ============================================================================
const CAMERA_RESET_PILL_PATH = '../../src/client/ui/camera_reset_pill';

let cameraResetPillMod: any = null;
try {
  cameraResetPillMod = await import(/* @vite-ignore */ CAMERA_RESET_PILL_PATH);
} catch {
  try {
    cameraResetPillMod = await import(/* @vite-ignore */ `${CAMERA_RESET_PILL_PATH}.js`);
  } catch {
    cameraResetPillMod = null;
  }
}

export const CameraResetPill: React.ComponentType<any> =
  cameraResetPillMod?.CameraResetPill ??
  (() => {
    throw new TypeError('CameraResetPill is not implemented (Station 1 RED: camera_reset_pill.tsx pending)');
  });

// ============================================================================
// MOCK 2D CANVAS CONTEXT FOR HEADLESS TEXTURE RUNTIME
// ============================================================================
function createMock2dContext(): any {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    rect: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    arcTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    ellipse: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    roundRect: vi.fn(),
    drawImage: vi.fn(),
    clip: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    measureText: vi.fn(() => ({ width: 50, actualBoundingBoxAscent: 10, actualBoundingBoxDescent: 5 })),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: '',
    textBaseline: '',
  };
}

describe('[IMP-190] Specialized Devices & Camera Snap Universal Contract Suite', () => {
  let originalDocument: any;
  let originalWindow: any;
  let originalNavigator: any;

  beforeEach(() => {
    vi.restoreAllMocks();

    originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
    originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
    originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');

    Object.defineProperty(globalThis, 'window', {
      value: {
        innerWidth: 1024,
        innerHeight: 768,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
      configurable: true,
      writable: true,
    });

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36',
        maxTouchPoints: 0,
      },
      configurable: true,
      writable: true,
    });

    Object.defineProperty(globalThis, 'document', {
      value: {
        createElement: (tag: string) => {
          if (tag === 'canvas') {
            const ctx = createMock2dContext();
            return {
              width: 0,
              height: 0,
              getContext: (contextId: string) => (contextId === '2d' ? ctx : null),
            };
          }
          return {};
        },
      },
      configurable: true,
      writable: true,
    });

    tileTextureGen.clearTileTextureCache();
    useGameStore.getInitialState = useGameStore.getState;
    useGameStore.setState(INITIAL_GAME_STATE as any);
  });

  afterEach(() => {
    tileTextureGen.clearTileTextureCache();

    if (originalDocument) {
      Object.defineProperty(globalThis, 'document', originalDocument);
    } else {
      delete (globalThis as any).document;
    }
    if (originalWindow) {
      Object.defineProperty(globalThis, 'window', originalWindow);
    } else {
      delete (globalThis as any).window;
    }
    if (originalNavigator) {
      Object.defineProperty(globalThis, 'navigator', originalNavigator);
    } else {
      delete (globalThis as any).navigator;
    }
  });

  // ==========================================================================
  // FACET 1: Boundary & Range (Hardware Device Detection & Screen Dimensions)
  // ==========================================================================
  describe('Facet 1: Boundary & Range (Device Detection & Hardware Classification)', () => {
    it('[TC-190.01/MSS][UC-IMP190] device_detect.ts: isTabletDevice() trả về true cho iPadOS (Macintosh UA + maxTouchPoints > 1)', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
          maxTouchPoints: 5,
        },
        configurable: true,
        writable: true,
      });

      expect((deviceDetect as any).isTabletDevice?.()).toBe(true);
    });

    it('[TC-190.02/MSS][UC-IMP190] device_detect.ts: isTabletDevice() trả về true cho Android Tablet (Android UA không có Mobile)', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-X906B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
          maxTouchPoints: 10,
        },
        configurable: true,
        writable: true,
      });

      expect((deviceDetect as any).isTabletDevice?.()).toBe(true);
    });

    it('[TC-190.03/MSS][UC-IMP190] device_detect.ts: isTabletDevice() trả về false cho iPhone và Android Phone chuẩn (Mobile UA)', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
          maxTouchPoints: 5,
        },
        configurable: true,
        writable: true,
      });
      expect((deviceDetect as any).isTabletDevice?.()).toBe(false);

      Object.defineProperty(globalThis, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S928B Mobile) AppleWebKit/537.36',
          maxTouchPoints: 5,
        },
        configurable: true,
        writable: true,
      });
      expect((deviceDetect as any).isTabletDevice?.()).toBe(false);
    });

    it('[TC-190.04/MSS][UC-IMP190] device_detect.ts: isMobileHardware() tiếp tục trả về true cho iPadOS (Bảo tồn hợp đồng kiểm thử hồi quy TC-186.07)', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          maxTouchPoints: 5,
        },
        configurable: true,
        writable: true,
      });

      expect(deviceDetect.isMobileHardware()).toBe(true);
    });

    it('[TC-190.05/MSS][UC-IMP190] device_detect.ts: isPhoneHardware() trả về false cho Tablet/iPadOS và true cho Phone', () => {
      // Case A: iPadOS Tablet
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          maxTouchPoints: 5,
        },
        configurable: true,
        writable: true,
      });
      expect((deviceDetect as any).isPhoneHardware?.()).toBe(false);

      // Case B: iPhone
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
          maxTouchPoints: 5,
        },
        configurable: true,
        writable: true,
      });
      expect((deviceDetect as any).isPhoneHardware?.()).toBe(true);
    });
  });

  // ==========================================================================
  // FACET 2: State Reactivity & Multi-Turn Teardown (Game Store & Texture LOD)
  // ==========================================================================
  describe('Facet 2: State Reactivity & Multi-Turn Teardown (Store Invariants & Texture LOD Allocation)', () => {
    it('[TC-190.06/MSS][UC-IMP190] tile_texture_generator.ts: Hàm getTileTexture(index) nạp desktopTileTextureCache (1024x1360) khi thiết bị là iPadOS hoặc Android Tablet (isTabletDevice() === true)', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
          maxTouchPoints: 5,
        },
        configurable: true,
        writable: true,
      });

      tileTextureGen.clearTileTextureCache();
      const texture = tileTextureGen.getTileTexture(1);

      expect(texture?.image?.width).toBe(1024);
      expect(texture?.image?.height).toBe(1360);
    });

    it('[TC-190.07/MSS][UC-IMP190] game_store.ts: INITIAL_GAME_STATE chứa hasUserCustomCamera: false, cung cấp action setHasUserCustomCamera(boolean)', () => {
      expect((INITIAL_GAME_STATE as any).hasUserCustomCamera).toBe(false);
      expect(typeof (useGameStore.getState() as any).setHasUserCustomCamera).toBe('function');

      (useGameStore.getState() as any).setHasUserCustomCamera?.(true);
      expect((useGameStore.getState() as any).hasUserCustomCamera).toBe(true);
    });

    it('[TC-190.08/MSS][UC-IMP190] game_store.ts: triggerDiceRoll tự động reset hasUserCustomCamera: false để camera bám theo khay xúc xắc và quân cờ', () => {
      useGameStore.setState({
        ...INITIAL_GAME_STATE,
        hasUserCustomCamera: true,
        lastDiceSeq: 10,
      } as any);

      useGameStore.getState().triggerDiceRoll([4, 5], 11);
      expect((useGameStore.getState() as any).hasUserCustomCamera).toBe(false);
    });
  });

  // ==========================================================================
  // FACET 3: Resource Disposal & Timer Isolation (Camera Reset Pill Lifecycle & Tactile Dispatch)
  // ==========================================================================
  describe('Facet 3: Resource Disposal & Timer Isolation (Camera Reset Pill Lifecycle & Tactile Feedback)', () => {
    it('[TC-190.09/MSS][UC-IMP190] CameraResetPill: Ẩn đi (return null) khi hasUserCustomCamera === false hoặc khi có modal mở (activeModal !== null)', () => {
      // Sub-case 1: hasUserCustomCamera: false, activeModal: null
      useGameStore.setState({
        hasUserCustomCamera: false,
        activeModal: null,
      } as any);
      const htmlInactive = renderToStaticMarkup(React.createElement(CameraResetPill));
      expect(htmlInactive).toBe('');

      // Sub-case 2: hasUserCustomCamera: true, activeModal: 'title_deed'
      useGameStore.setState({
        hasUserCustomCamera: true,
        activeModal: 'title_deed',
      } as any);
      const htmlModalOpen = renderToStaticMarkup(React.createElement(CameraResetPill));
      expect(htmlModalOpen).toBe('');
    });

    it('[TC-190.10/MSS][UC-IMP190] CameraResetPill: Hiển thị nút bấm [🧭 Góc Nhìn Chuẩn] đạt chuẩn touch target >= 44px khi hasUserCustomCamera === true', () => {
      useGameStore.setState({
        hasUserCustomCamera: true,
        activeModal: null,
      } as any);

      const html = renderToStaticMarkup(React.createElement(CameraResetPill));
      expect(html).toContain('Góc Nhìn Chuẩn');
      expect(html).toMatch(/min-h-\[44px\]/);
      expect(html).toMatch(/data-testid=["']camera-reset-pill-btn["']/);
    });

    it('[TC-190.11/MSS][UC-IMP190] CameraResetPill: Khi nhấp nút, gọi window.__resetCameraToDefault(), kích hoạt HapticEngine.selection(), và gọi setHasUserCustomCamera(false)', () => {
      const resetSpy = vi.fn();
      (window as any).__resetCameraToDefault = resetSpy;
      const hapticSpy = vi.spyOn(HapticEngine, 'selection');

      useGameStore.setState({
        hasUserCustomCamera: true,
        activeModal: null,
      } as any);

      const vnode = (CameraResetPill as any)({});
      expect(vnode).not.toBeNull();
      vnode?.props?.onClick?.();

      expect(resetSpy).toHaveBeenCalledTimes(1);
      expect(hapticSpy).toHaveBeenCalledTimes(1);
      expect((useGameStore.getState() as any).hasUserCustomCamera).toBe(false);
    });
  });

  // ==========================================================================
  // FACET 4: Error Defense & Terminal Invariants (Smooth Lerp vs Hard Snap & Fold 320px Defenses)
  // ==========================================================================
  describe('Facet 4: Error Defense & Terminal Invariants (Smooth Lerp & Foldable Ergonomics)', () => {
    it('[TC-190.12/MSS][UC-IMP190] game_canvas.tsx: Khi window.__resetCameraToDefault() kích hoạt, gọi setCameraFocusCell(null) và thực hiện smooth lerp (không gọi hard camera.position.set(...))', () => {
      const canvasSrcPath = path.resolve(__dirname, '../../src/client/game_canvas.tsx');
      const canvasSrc = fs.readFileSync(canvasSrcPath, 'utf-8');

      const resetFnMatch = canvasSrc.match(/window\.__resetCameraToDefault\s*=\s*\(\)\s*=>\s*\{([\s\S]*?)\};/);
      expect(resetFnMatch, '__resetCameraToDefault must be defined in game_canvas.tsx').not.toBeNull();

      const resetFnBody = resetFnMatch![1];
      expect(resetFnBody).not.toMatch(/camera\.position\.set\(/);
      expect(resetFnBody).toMatch(/setCameraFocusCell\(null\)/);
    });

    it('[TC-190.13/MSS][UC-IMP190] top_bar.tsx: Thẻ mobile-fps-badge chứa class hidden min-[360px]:inline-flex để giải phóng 65px không gian trên màn hình gập 320px', () => {
      const html = renderToStaticMarkup(
        React.createElement(TopBar, {
          onLeaveRoom: () => {},
        })
      );

      const badgeMatch = html.match(/<button[^>]*data-testid=["']mobile-fps-badge["'][^>]*class=["']([^"']*)["']/);
      expect(badgeMatch, 'mobile-fps-badge button must exist in TopBar markup').not.toBeNull();

      const badgeClass = badgeMatch![1];
      expect(badgeClass).toContain('hidden');
      expect(badgeClass).toContain('min-[360px]:inline-flex');
    });
  });

  // ==========================================================================
  // FACET 5: Cross-Coupling Blast Radius & Layout Ergonomics (Dual-Pill Flex Container, Foldable Width & LOC Budget)
  // ==========================================================================
  describe('Facet 5: Cross-Coupling Blast Radius & Layout Ergonomics (Dual-Pill Container & File LOC Budgets)', () => {
    it('[TC-190.14/MSS][UC-IMP190] hud_container.tsx: Cụm nút nổi kép (RecenterPawnPill và CameraResetPill) được bọc trong chung một flex container có gap-2 và max-w-[95vw]', () => {
      const hudSrcPath = path.resolve(__dirname, '../../src/client/ui/hud_container.tsx');
      const hudSrc = fs.readFileSync(hudSrcPath, 'utf-8');

      expect(hudSrc).toMatch(/import\s*\{\s*CameraResetPill\s*\}\s*from\s*['"]\.\/camera_reset_pill['"]/);
      expect(hudSrc).toMatch(/fixed\s+bottom-(?:24|28)[^"']*gap-2[^"']*max-w-\[95vw\]/);
      expect(hudSrc).toMatch(/<CameraResetPill\s*\/>/);
    });

    it('[TC-190.15/MSS][UC-IMP190] player_hud_list.tsx: Sử dụng chiều rộng responsive w-40 sm:w-48 không vượt quá 50% màn hình 320px', () => {
      useGameStore.setState({
        playersInfo: {
          p1: {
            id: 'p1',
            name: 'Tester 1',
            tokenColor: '#EF4444',
            money: 10000,
            netWorth: 10000,
            position: 0,
            inJail: false,
            jailTurns: 0,
            isBot: false,
            ownedProperties: [],
          },
        },
      } as any);

      const html = renderToStaticMarkup(React.createElement(PlayerHudList));
      expect(html).toContain('<aside');
      const asideMatch = html.match(/<aside[\s\S]*?class=["']([^"']*)["']/);
      expect(asideMatch, 'PlayerHudList aside element must exist').not.toBeNull();

      const asideClass = asideMatch![1];
      expect(asideClass).toContain('w-40');
      expect(asideClass).toContain('sm:w-48');
      expect(asideClass).not.toContain('w-44');
    });

    it('[TC-190.16/MSS][UC-IMP190] Ngân sách LOC: device_detect.ts <= 80 LOC, tile_texture_generator.ts <= 240 LOC, board_tile.tsx <= 450 LOC, camera_reset_pill.tsx <= 60 LOC, game_canvas.tsx <= 450 LOC, top_bar.tsx <= 220 LOC, player_hud_list.tsx <= 55 LOC', () => {
      const getLineCount = (relPath: string) => {
        const fullPath = path.resolve(__dirname, relPath);
        return fs.readFileSync(fullPath, 'utf-8').split('\n').length;
      };

      const pillPath = path.resolve(__dirname, '../../src/client/ui/camera_reset_pill.tsx');
      expect(fs.existsSync(pillPath), 'camera_reset_pill.tsx must exist on disk').toBe(true);
      expect(getLineCount('../../src/client/ui/camera_reset_pill.tsx')).toBeLessThanOrEqual(60);

      expect(getLineCount('../../src/client/3d/device_detect.ts')).toBeLessThanOrEqual(80);
      expect(getLineCount('../../src/client/3d/tile_texture_generator.ts')).toBeLessThanOrEqual(240);
      expect(getLineCount('../../src/client/3d/board_tile.tsx')).toBeLessThanOrEqual(450);
      expect(getLineCount('../../src/client/game_canvas.tsx')).toBeLessThanOrEqual(450);
      expect(getLineCount('../../src/client/ui/top_bar.tsx')).toBeLessThanOrEqual(220);
      expect(getLineCount('../../src/client/ui/player_hud_list.tsx')).toBeLessThanOrEqual(55);
    });
  });
});
