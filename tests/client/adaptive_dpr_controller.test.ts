// [TC-DPR01.01/MSS..TC-DPR05.02/MSS][UC-DPR-01..UC-DPR-05]
// Ma Trận Kiểm Thử Hợp Đồng 5 Mặt (Universal 5-Facet Matrix - 17 Atomic Tests)
// Đặc tả: IMP-219 Adaptive Resolution & Dynamic DPR Controller
// Quy định: Detroit Style, 1-4 expect/test, zero loop trong it(), fresh controller instance (C2)

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRecommendedDpr } from '../../src/client/3d/device_detect';
import { PerfBudgetController } from '../../src/client/3d/perf_budget';
import { AdaptiveDprController } from '../../src/client/3d/adaptive_dpr_controller';
import { useTelemetryStore } from '../../src/client/telemetry/telemetry_store';
import { useGameStore } from '../../src/client/store/game_store';

// ============================================================================
// R3F MOCK HARNESS (Capture useFrame callback for headless testing)
// ============================================================================
type FrameCallback = (state: { gl?: { getPixelRatio: () => number } | null; setDpr?: (dpr: number) => void }, delta: number) => void;
let capturedFrameCallback: FrameCallback | null = null;
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn((cb: FrameCallback) => {
    capturedFrameCallback = cb;
  }),
}));

// Helper ngoài it() để tránh vi phạm quy tắc cấm loop trong it()
function feedFrames(controller: PerfBudgetController, count: number, frameTimeMs: number): void {
  for (let i = 0; i < count; i++) {
    controller.recordFrameTime(frameTimeMs);
  }
}

describe('[TC-DPR/MSS][UC-DPR] Ma Trận Kiểm Thử Hợp Đồng Adaptive DPR Controller', () => {
  beforeEach(() => {
    capturedFrameCallback = null;
    useGameStore.setState({
      activePawnAnimation: null,
    });
  });

  // ==========================================================================
  // FACET 1: Boundary & Range Clamping (4 tests)
  // ==========================================================================
  describe('Facet 1: Boundary & Range Clamping', () => {
    it('[TC-DPR01.01/MSS][UC-DPR-01] getRecommendedDpr(true) trả về [0.85, 1.0] cho Mobile (C1)', () => {
      const dprRange = getRecommendedDpr(true);
      expect(dprRange).toEqual([0.85, 1.0]);
    });

    it('[TC-DPR01.02/MSS][UC-DPR-01] getRecommendedDpr(false) trả về [1.0, 1.5] cho Desktop (C1)', () => {
      const dprRange = getRecommendedDpr(false);
      expect(dprRange).toEqual([1.0, 1.5]);
    });

    it('[TC-DPR01.03/MSS][UC-DPR-01] calculateAdaptiveDpr không bao giờ trả về DPR < 0.85 trên mobile hoặc > 1.5 trên desktop', () => {
      const controller = new PerfBudgetController();
      const mobileClamped = controller.calculateAdaptiveDpr({
        isMobile: true,
        currentFps: 10,
        currentDpr: 0.85,
        degradedDurationMs: 5000,
        optimalDurationMs: 0,
      });
      expect(mobileClamped.targetDpr).toBeGreaterThanOrEqual(0.85);
      expect(mobileClamped.shouldUpdate).toBe(false);

      const desktopClamped = controller.calculateAdaptiveDpr({
        isMobile: false,
        currentFps: 60,
        currentDpr: 1.5,
        degradedDurationMs: 0,
        optimalDurationMs: 5000,
      });
      expect(desktopClamped.targetDpr).toBeLessThanOrEqual(1.5);
      expect(desktopClamped.shouldUpdate).toBe(false);
    });

    it('[TC-DPR01.04/MSS][UC-DPR-01] DPR tính toán luôn làm tròn đến 2 chữ số thập phân (0.85, 1.0, 1.25, 1.5)', () => {
      const controller = new PerfBudgetController();
      const result = controller.calculateAdaptiveDpr({
        isMobile: false,
        currentFps: 40,
        currentDpr: 1.5,
        degradedDurationMs: 1500,
        optimalDurationMs: 0,
      });
      expect(result.targetDpr).toBe(1.25);
      expect(Number.isInteger(result.targetDpr * 100)).toBe(true);
    });
  });

  // ==========================================================================
  // FACET 2: State Reactivity & Step-Down (4 tests - Fresh Instance C2)
  // ==========================================================================
  describe('Facet 2: State Reactivity & Step-Down (Fresh Instance C2)', () => {
    it('[TC-DPR02.01/MSS][UC-DPR-02] Khi FPS < 45 duy trì >= 1.500ms trên mobile, DPR hạ từ 1.0 xuống 0.85', () => {
      const controller = new PerfBudgetController();
      const result = controller.calculateAdaptiveDpr({
        isMobile: true,
        currentFps: 42,
        currentDpr: 1.0,
        degradedDurationMs: 1500,
        optimalDurationMs: 0,
      });
      expect(result.shouldUpdate).toBe(true);
      expect(result.targetDpr).toBe(0.85);
      expect(result.reason).toBe('STEP_DOWN');
    });

    it('[TC-DPR02.02/MSS][UC-DPR-02] Khi FPS < 45 duy trì >= 1.500ms trên desktop, DPR hạ từ 1.5 xuống 1.25', () => {
      const controller = new PerfBudgetController();
      const result = controller.calculateAdaptiveDpr({
        isMobile: false,
        currentFps: 44,
        currentDpr: 1.5,
        degradedDurationMs: 1500,
        optimalDurationMs: 0,
      });
      expect(result.shouldUpdate).toBe(true);
      expect(result.targetDpr).toBe(1.25);
      expect(result.reason).toBe('STEP_DOWN');
    });

    it('[TC-DPR02.03/MSS][UC-DPR-02] Khi FPS < 35 duy trì >= 1.500ms trên desktop (tải nặng), DPR hạ tiếp từ 1.25 xuống 1.0', () => {
      const controller = new PerfBudgetController();
      const result = controller.calculateAdaptiveDpr({
        isMobile: false,
        currentFps: 32,
        currentDpr: 1.25,
        degradedDurationMs: 1500,
        optimalDurationMs: 0,
      });
      expect(result.shouldUpdate).toBe(true);
      expect(result.targetDpr).toBe(1.0);
      expect(result.reason).toBe('STEP_DOWN');
    });

    it('[TC-DPR02.04/MSS][UC-DPR-02] PerfBudgetReport phản ánh đúng trạng thái DPR khuyến nghị hoặc usage ratio', () => {
      const controller = new PerfBudgetController();
      feedFrames(controller, 60, 33.33); // ~30 FPS
      const report = controller.getBudgetReport();
      const adaptiveResult = controller.calculateAdaptiveDpr({
        isMobile: false,
        currentFps: report.averageFps,
        currentDpr: 1.5,
        degradedDurationMs: 1500,
        optimalDurationMs: 0,
      });
      expect(report.averageFps).toBeLessThan(45);
      expect(adaptiveResult.shouldUpdate).toBe(true);
      expect(adaptiveResult.targetDpr).toBe(1.25);
    });
  });

  // ==========================================================================
  // FACET 3: Hysteresis, Anti-Jitter & Reset Verification (4 tests - Bổ sung C5)
  // ==========================================================================
  describe('Facet 3: Hysteresis, Anti-Jitter & Reset Verification', () => {
    it('[TC-DPR03.01/MSS][UC-DPR-03] Khi FPS tụt xuống 40 nhưng chỉ kéo dài 500ms rồi phục hồi, DPR KHÔNG đổi (chưa đủ 1.500ms)', () => {
      const controller = new PerfBudgetController();
      const result = controller.calculateAdaptiveDpr({
        isMobile: false,
        currentFps: 40,
        currentDpr: 1.5,
        degradedDurationMs: 500,
        optimalDurationMs: 0,
      });
      expect(result.shouldUpdate).toBe(false);
      expect(result.targetDpr).toBe(1.5);
      expect(result.reason).toBe('MAINTAIN');
    });

    it('[TC-DPR03.02/MSS][UC-DPR-03] Khi DPR đang ở mức thấp và FPS phục hồi >= 55, DPR chỉ nâng sau đủ 3.000ms', () => {
      const controller = new PerfBudgetController();
      const underThreshold = controller.calculateAdaptiveDpr({
        isMobile: true,
        currentFps: 58,
        currentDpr: 0.85,
        degradedDurationMs: 0,
        optimalDurationMs: 2500,
      });
      expect(underThreshold.shouldUpdate).toBe(false);

      const atThreshold = controller.calculateAdaptiveDpr({
        isMobile: true,
        currentFps: 58,
        currentDpr: 0.85,
        degradedDurationMs: 0,
        optimalDurationMs: 3000,
      });
      expect(atThreshold.shouldUpdate).toBe(true);
      expect(atThreshold.targetDpr).toBe(1.0);
    });

    it('[TC-DPR03.03/MSS][UC-DPR-03] Không có hiện tượng dao động DPR liên tiếp giữa các frame (Zero Thrashing)', () => {
      const controller = new PerfBudgetController();
      const frameLow = controller.calculateAdaptiveDpr({
        isMobile: false,
        currentFps: 40,
        currentDpr: 1.5,
        degradedDurationMs: 16,
        optimalDurationMs: 0,
      });
      const frameHigh = controller.calculateAdaptiveDpr({
        isMobile: false,
        currentFps: 58,
        currentDpr: 1.5,
        degradedDurationMs: 0,
        optimalDurationMs: 16,
      });
      expect(frameLow.shouldUpdate).toBe(false);
      expect(frameHigh.shouldUpdate).toBe(false);
      expect(frameHigh.targetDpr).toBe(1.5);
    });

    it('[TC-DPR03.04/MSS][UC-DPR-03] [C5 Check] Sau khi thực thi STEP_DOWN hoặc STEP_UP, các bộ đếm được reset về 0 ngăn oscillation tức thì', () => {
      const controller = new PerfBudgetController();
      const stepDown = controller.calculateAdaptiveDpr({
        isMobile: true,
        currentFps: 40,
        currentDpr: 1.0,
        degradedDurationMs: 1500,
        optimalDurationMs: 0,
      });
      expect(stepDown.reason).toBe('STEP_DOWN');

      // Sau khi step-down, controller reset degradedDurationMs về 0
      const frameAfterReset = controller.calculateAdaptiveDpr({
        isMobile: true,
        currentFps: 40,
        currentDpr: stepDown.targetDpr,
        degradedDurationMs: 0,
        optimalDurationMs: 0,
      });
      expect(frameAfterReset.shouldUpdate).toBe(false);
      expect(frameAfterReset.reason).toBe('MAINTAIN');
    });
  });

  // ==========================================================================
  // FACET 4: Motion Lockout Defense (3 tests)
  // ==========================================================================
  describe('Facet 4: Motion Lockout Defense', () => {
    it('[TC-DPR04.01/MSS][UC-DPR-04] Khi quân cờ đang nhảy (isMotionActive: true), khóa nâng DPR (Freeze Step-Up, MAINTAIN)', () => {
      const controller = new PerfBudgetController();
      const result = controller.calculateAdaptiveDpr({
        isMobile: true,
        currentFps: 60,
        currentDpr: 0.85,
        isMotionActive: true,
        degradedDurationMs: 0,
        optimalDurationMs: 4000,
      });
      expect(result.shouldUpdate).toBe(false);
      expect(result.targetDpr).toBe(0.85);
      expect(result.reason).toBe('MAINTAIN');
    });

    it('[TC-DPR04.02/MSS][UC-DPR-04] Khi quân cờ đang nhảy nhưng FPS bị tụt nặng (< 45 kéo dài >= 1500ms), VẪN CHO PHÉP hạ DPR', () => {
      const controller = new PerfBudgetController();
      const result = controller.calculateAdaptiveDpr({
        isMobile: true,
        currentFps: 38,
        currentDpr: 1.0,
        isMotionActive: true,
        degradedDurationMs: 1500,
        optimalDurationMs: 0,
      });
      expect(result.shouldUpdate).toBe(true);
      expect(result.targetDpr).toBe(0.85);
      expect(result.reason).toBe('STEP_DOWN');
    });

    it('[TC-DPR04.03/MSS][UC-DPR-04] Khi hoạt ảnh di chuyển kết thúc (isMotionActive: false), cho phép STEP_UP khi đủ 3000ms', () => {
      const controller = new PerfBudgetController();
      const result = controller.calculateAdaptiveDpr({
        isMobile: true,
        currentFps: 60,
        currentDpr: 0.85,
        isMotionActive: false,
        degradedDurationMs: 0,
        optimalDurationMs: 3000,
      });
      expect(result.shouldUpdate).toBe(true);
      expect(result.targetDpr).toBe(1.0);
      expect(result.reason).toBe('STEP_UP');
    });
  });

  // ==========================================================================
  // FACET 5: Telemetry Observability & Live Context Sync (2 tests - C3, C4)
  // ==========================================================================
  describe('Facet 5: Telemetry Observability & Live Context Sync (C3, C4)', () => {
    it('[TC-DPR05.01/MSS][UC-DPR-05] Thay đổi DPR lập tức đồng bộ lên useTelemetryStore.getState().metrics.dpr', () => {
      capturedFrameCallback = null;
      const mockSetDpr = vi.fn();
      const mockGl = { getPixelRatio: vi.fn(() => 1.5) };

      renderToStaticMarkup(React.createElement(AdaptiveDprController, { isMobile: false }));
      expect(capturedFrameCallback).toBeTypeOf('function');

      capturedFrameCallback!({ gl: mockGl, setDpr: mockSetDpr }, 0.016);
      expect(useTelemetryStore.getState().metrics.dpr).toBe(1.5);
    });

    it('[TC-DPR05.02/MSS][UC-DPR-05] Component AdaptiveDprController đọc chính xác initialDpr từ gl.getPixelRatio() (C4) và fallback an toàn', () => {
      capturedFrameCallback = null;
      const mockSetDpr = vi.fn();
      const mockGl = { getPixelRatio: vi.fn(() => 1.25) };

      renderToStaticMarkup(React.createElement(AdaptiveDprController, { isMobile: false }));
      capturedFrameCallback!({ gl: mockGl, setDpr: mockSetDpr }, 0.016);
      expect(mockGl.getPixelRatio).toHaveBeenCalled();
      expect(useTelemetryStore.getState().metrics.dpr).toBe(1.25);

      expect(() => {
        capturedFrameCallback!({ gl: null, setDpr: mockSetDpr }, 0.016);
      }).not.toThrow();
    });
  });
});
