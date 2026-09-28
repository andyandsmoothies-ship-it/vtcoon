// [IMP-219/MSS] Adaptive Resolution & Dynamic DPR Controller
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { perfBudget, DPR_BOUNDS } from './perf_budget';
import { useTelemetryStore } from '../telemetry/telemetry_store';
import { useGameStore } from '../store/game_store';

export interface AdaptiveDprControllerProps {
  readonly isMobile: boolean;
}

export function AdaptiveDprController({ isMobile }: AdaptiveDprControllerProps): null {
  const currentDprRef = useRef<number | null>(null);
  const degradedTimeRef = useRef<number>(0);
  const optimalTimeRef = useRef<number>(0);

  // [C3 & C4] Trích xuất live renderer và live setDpr từ useFrame, khởi tạo initialDpr từ gl.getPixelRatio()
  useFrame(({ gl, setDpr }, delta) => {
    // [I2] Guard chống tụt FPS ảo khi tab trình duyệt chạy nền
    if (typeof document !== 'undefined' && document.hidden) return;

    // Đọc chính xác DPR ban đầu từ WebGL Renderer nếu chưa thiết lập
    if (currentDprRef.current === null && gl && typeof gl.getPixelRatio === 'function') {
      const actualDpr = Number(gl.getPixelRatio().toFixed(2));
      currentDprRef.current = actualDpr;
      useTelemetryStore.getState().updateMetrics({ dpr: actualDpr });
    }

    const currentDpr = currentDprRef.current ?? (isMobile ? DPR_BOUNDS.MOBILE_MAX : 1.0);
    const deltaMs = delta * 1000;
    const avgFps = perfBudget.getAverageFps();
    const isPawnAnimating = Boolean(useGameStore.getState().activePawnAnimation?.isAnimating);

    if (avgFps < DPR_BOUNDS.FPS_DOWN_THRESHOLD) {
      degradedTimeRef.current += deltaMs;
      optimalTimeRef.current = 0;
    } else if (avgFps >= DPR_BOUNDS.FPS_UP_THRESHOLD) {
      optimalTimeRef.current += deltaMs;
      degradedTimeRef.current = 0;
    } else {
      degradedTimeRef.current = 0;
      optimalTimeRef.current = 0;
    }

    const result = perfBudget.calculateAdaptiveDpr({
      isMobile,
      currentFps: avgFps,
      currentDpr,
      isMotionActive: isPawnAnimating,
      degradedDurationMs: degradedTimeRef.current,
      optimalDurationMs: optimalTimeRef.current,
    });

    if (result.shouldUpdate && typeof setDpr === 'function') {
      setDpr(result.targetDpr);
      currentDprRef.current = result.targetDpr;
      // [C5] Reset triệt để cả 2 bộ đếm sau step-change để ngăn chặn rung giật (anti-oscillation)
      degradedTimeRef.current = 0;
      optimalTimeRef.current = 0;
      useTelemetryStore.getState().updateMetrics({ dpr: result.targetDpr });
    }
  });

  return null;
}
