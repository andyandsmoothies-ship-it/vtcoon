// [UI-S01/MSS][IMP-24][IMP-101] perf_telemetry_tracker.tsx — Frame rate, draw calls and animation stall monitor
import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { perfBudget } from '../3d/perf_budget';
import { useTelemetryStore } from './telemetry_store';
import { watchdogMonitor } from './watchdog_monitor';
import { useGameStore } from '../store/game_store';

export function PerfTelemetryTracker(): null {
  const { gl } = useThree();
  const lastUpdateRef = useRef(0);
  const animStartRef = useRef<number | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.hidden) {
        animStartRef.current = null;
      }
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, []);

  useFrame((_, delta) => {
    if (typeof document !== 'undefined' && document.hidden) {
      animStartRef.current = null;
      return;
    }
    perfBudget.recordFrameTime(delta * 1000);
    const now = performance.now();
    if (now - lastUpdateRef.current >= 250) {
      lastUpdateRef.current = now;
      const report = perfBudget.getBudgetReport(gl.info);
      useTelemetryStore.getState().updateMetrics({
        fps: report.averageFps,
        frameTimeMs: delta * 1000,
        drawCalls: report.drawCalls,
        triangles: report.triangles,
      });

      const activeAnim = useGameStore.getState().activePawnAnimation;
      if (activeAnim?.isAnimating) {
        if (animStartRef.current === null) animStartRef.current = Date.now();
        const duration = Date.now() - animStartRef.current;
        const queue = useGameStore.getState().pawnAnimationQueue;
        const totalWaypoints = (activeAnim.waypoints?.length ?? 0) + (queue?.reduce((acc, q) => acc + (q.waypoints?.length ?? 0), 0) ?? 0);
        const maxAllowedMs = Math.max(10_000, totalWaypoints * 1200 + 5000);
        const params = {
          isAnimating: true,
          animatingDurationMs: duration,
          tick: 0,
          maxAllowedMs,
        };
        const v = watchdogMonitor.checkFsmAnimationStall(params);
        if (v) {
          watchdogMonitor.recoverFsmAnimationStall(params);
          animStartRef.current = null;
          useTelemetryStore.getState().reportViolation(v);
        }
      } else {
        animStartRef.current = null;
      }
    }
    if (typeof gl?.info?.reset === 'function') {
      gl.info.reset();
    }
  });

  return null;
}
