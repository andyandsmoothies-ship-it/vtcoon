// [TC-IMP10.3/MSS] PerfBudget — 60 FPS Performance Budget Controller & Adaptive LOD System
// Enforces Draw Call Budget (<85 calls), triangle count (<150k), and target frame time (16.6ms)

export function validateDrawCallsBudget(calls: number, limit = 85): boolean {
  if (!Number.isFinite(calls)) return false;
  if (!Number.isFinite(limit)) return false;
  return calls >= 0 && calls <= limit;
}

export enum LODLevel {
  HIGH = 'HIGH',       // Full PBR detail, full particles, 512px reflections
  MEDIUM = 'MEDIUM',   // Optimized geometry, 36 particles, 256px reflections
  LOW = 'LOW',         // Instanced only, 18 particles, 128px reflections
}

export const PERF_BUDGET_LIMITS = {
  targetMaxDrawCalls: 85,
  targetMaxTriangles: 150_000,
  targetFrameTimeMs: 16.67, // 60 FPS target
  targetFps: 60,
  minAcceptableFps: 30,
} as const;

export const LOD_CONFIGS: Record<
  LODLevel,
  {
    particleBudget: number;
    reflectionResolution: number;
    shadowMapSize: number;
    enableReflections: boolean;
  }
> = {
  [LODLevel.HIGH]: {
    particleBudget: 72,
    reflectionResolution: 512,
    shadowMapSize: 1024,
    enableReflections: true,
  },
  [LODLevel.MEDIUM]: {
    particleBudget: 36,
    reflectionResolution: 256,
    shadowMapSize: 512,
    enableReflections: true,
  },
  [LODLevel.LOW]: {
    particleBudget: 18,
    reflectionResolution: 128,
    shadowMapSize: 256,
    enableReflections: false,
  },
};

export const DPR_BOUNDS = {
  MOBILE_MIN: 0.85,
  MOBILE_MAX: 1.0,
  DESKTOP_MIN: 1.0,
  DESKTOP_MAX: 1.5,
  STEP_DOWN_DELAY_MS: 1500,
  STEP_UP_DELAY_MS: 3000,
  FPS_DOWN_THRESHOLD: 45,
  FPS_UP_THRESHOLD: 55,
} as const;

export interface AdaptiveDprParams {
  readonly isMobile: boolean;
  readonly currentFps: number;
  readonly currentDpr: number;
  readonly isMotionActive?: boolean;
  readonly degradedDurationMs: number;
  readonly optimalDurationMs: number;
}

export interface AdaptiveDprResult {
  readonly targetDpr: number;
  readonly shouldUpdate: boolean;
  readonly reason: 'MAINTAIN' | 'STEP_DOWN' | 'STEP_UP';
}

export interface PerfBudgetReport {
  drawCalls: number;
  triangles: number;
  isWithinDrawCallBudget: boolean;
  isWithinTriangleBudget: boolean;
  usageRatio: number;
  status: 'optimal' | 'warning' | 'critical';
  recommendedLod: LODLevel;
  averageFps: number;
  recommendedDpr?: number;
}

export class PerfBudgetController {
  private frameTimes: number[] = [];
  private frameIndex = 0;
  private readonly maxSamples = 60;
  private currentLod: LODLevel = LODLevel.HIGH;

  /**
   * Đánh giá ngân sách Draw Calls hiện tại của WebGL Renderer
   */
  public evaluateDrawCallBudget(currentDrawCalls: number): {
    isWithinBudget: boolean;
    usageRatio: number;
    status: 'optimal' | 'warning' | 'critical';
  } {
    const safeCalls = Number.isFinite(currentDrawCalls)
      ? Math.max(0, Math.floor(currentDrawCalls))
      : 0;
    const ratio = safeCalls / PERF_BUDGET_LIMITS.targetMaxDrawCalls;

    let status: 'optimal' | 'warning' | 'critical' = 'optimal';
    if (safeCalls > PERF_BUDGET_LIMITS.targetMaxDrawCalls * 1.4) {
      status = 'critical';
    } else if (safeCalls > PERF_BUDGET_LIMITS.targetMaxDrawCalls) {
      status = 'warning';
    }

    return {
      isWithinBudget: validateDrawCallsBudget(safeCalls, PERF_BUDGET_LIMITS.targetMaxDrawCalls),
      usageRatio: Number(ratio.toFixed(2)),
      status,
    };
  }

  /**
   * Đánh giá ngân sách số lượng tam giác (Triangles)
   */
  public evaluateTriangleBudget(currentTriangles: number): {
    isWithinBudget: boolean;
    usageRatio: number;
  } {
    const safeTriangles = Number.isFinite(currentTriangles)
      ? Math.max(0, Math.floor(currentTriangles))
      : 0;
    const ratio = safeTriangles / PERF_BUDGET_LIMITS.targetMaxTriangles;

    return {
      isWithinBudget: safeTriangles <= PERF_BUDGET_LIMITS.targetMaxTriangles,
      usageRatio: Number(ratio.toFixed(2)),
    };
  }

  /**
   * Ghi nhận frame time (ms) từ vòng lặp requestAnimationFrame hoặc useFrame
   */
  public recordFrameTime(frameTimeMs: number): void {
    if (!Number.isFinite(frameTimeMs) || frameTimeMs <= 0 || frameTimeMs > 1000) return;
    const clampedMs = Math.min(frameTimeMs, 250);
    const times = this.frameTimes;
    if (times.length < this.maxSamples) {
      times.push(clampedMs);
    } else {
      times[this.frameIndex] = clampedMs;
      this.frameIndex = (this.frameIndex + 1) % this.maxSamples;
    }
  }

  /**
   * Tính FPS trung bình trong cửa sổ trượt 60 frames gần nhất
   */
  public getAverageFps(): number {
    const len = this.frameTimes.length;
    if (len === 0) return PERF_BUDGET_LIMITS.targetFps;
    let sum = 0;
    for (let i = 0; i < len; i++) {
      const val = this.frameTimes[i];
      if (val !== undefined) {
        sum += val;
      }
    }
    const avgMs = sum / len;
    if (avgMs <= 0) return PERF_BUDGET_LIMITS.targetFps;
    const fps = 1000 / avgMs;
    return Math.min(60, Math.max(1, Number(fps.toFixed(1))));
  }

  /**
   * Tự động điều chỉnh cấp độ phân giải LOD theo chỉ số FPS thực tế
   */
  public calculateAdaptiveLOD(averageFps?: number, isMobile?: boolean): LODLevel {
    const fps = averageFps ?? this.getAverageFps();

    if (isMobile) {
      if (fps >= 50) {
        this.currentLod = LODLevel.MEDIUM;
      } else {
        this.currentLod = LODLevel.LOW;
      }
      return this.currentLod;
    }

    if (fps >= 54) {
      this.currentLod = LODLevel.HIGH;
    } else if (fps >= 38) {
      this.currentLod = LODLevel.MEDIUM;
    } else {
      this.currentLod = LODLevel.LOW;
    }

    return this.currentLod;
  }

  public getCurrentLOD(): LODLevel {
    return this.currentLod;
  }

  public setCurrentLOD(level: LODLevel): void {
    this.currentLod = level;
  }

  public getParticleBudget(level: LODLevel = this.currentLod): number {
    return LOD_CONFIGS[level].particleBudget;
  }

  public getReflectionResolution(level: LODLevel = this.currentLod): number {
    return LOD_CONFIGS[level].reflectionResolution;
  }

  public isReflectionEnabled(level: LODLevel = this.currentLod): boolean {
    return LOD_CONFIGS[level].enableReflections;
  }

  /**
   * Trích xuất báo cáo toàn diện chỉ số hiệu năng WebGL
   */
  public getBudgetReport(
    glInfo?: {
      render: { calls: number; triangles: number };
    },
    deviceContext?: {
      isMobile?: boolean;
      currentDpr?: number;
      degradedDurationMs?: number;
      optimalDurationMs?: number;
    }
  ): PerfBudgetReport {
    const drawCalls = glInfo?.render.calls ?? 0;
    const triangles = glInfo?.render.triangles ?? 0;

    const dcEval = this.evaluateDrawCallBudget(drawCalls);
    const triEval = this.evaluateTriangleBudget(triangles);
    const avgFps = this.getAverageFps();

    const isMobile = deviceContext?.isMobile ?? false;
    const currentDpr = deviceContext?.currentDpr ?? (isMobile ? 1.0 : 1.5);
    const recommendedLod = this.calculateAdaptiveLOD(avgFps, isMobile);

    const dprEval = this.calculateAdaptiveDpr({
      isMobile,
      currentFps: avgFps,
      currentDpr,
      degradedDurationMs: deviceContext?.degradedDurationMs ?? 0,
      optimalDurationMs: deviceContext?.optimalDurationMs ?? 0,
    });

    return {
      drawCalls,
      triangles,
      isWithinDrawCallBudget: dcEval.isWithinBudget,
      isWithinTriangleBudget: triEval.isWithinBudget,
      usageRatio: dcEval.usageRatio,
      status: dcEval.status,
      recommendedLod,
      averageFps: avgFps,
      recommendedDpr: dprEval.targetDpr,
    };
  }

  /**
   * Tính toán độ phân giải kết xuất (DPR) thích ứng dựa trên FPS thực tế
   */
  public calculateAdaptiveDpr(params: AdaptiveDprParams): AdaptiveDprResult {
    const {
      isMobile,
      currentFps,
      currentDpr,
      isMotionActive = false,
      degradedDurationMs,
      optimalDurationMs,
    } = params;

    const minDpr = isMobile ? DPR_BOUNDS.MOBILE_MIN : DPR_BOUNDS.DESKTOP_MIN;
    const maxDpr = isMobile ? DPR_BOUNDS.MOBILE_MAX : DPR_BOUNDS.DESKTOP_MAX;

    // Trường hợp cần hạ DPR (FPS thấp kéo dài)
    if (currentFps < DPR_BOUNDS.FPS_DOWN_THRESHOLD && currentDpr > minDpr) {
      if (degradedDurationMs >= DPR_BOUNDS.STEP_DOWN_DELAY_MS) {
        const nextDpr = isMobile ? DPR_BOUNDS.MOBILE_MIN : Math.max(minDpr, Number((currentDpr - 0.25).toFixed(2)));
        return { targetDpr: nextDpr, shouldUpdate: true, reason: 'STEP_DOWN' };
      }
    }

    // Trường hợp có thể nâng DPR (FPS cao kéo dài và không có hoạt ảnh chuyển động)
    if (currentFps >= DPR_BOUNDS.FPS_UP_THRESHOLD && currentDpr < maxDpr && !isMotionActive) {
      if (optimalDurationMs >= DPR_BOUNDS.STEP_UP_DELAY_MS) {
        const nextDpr = isMobile ? DPR_BOUNDS.MOBILE_MAX : Math.min(maxDpr, Number((currentDpr + 0.25).toFixed(2)));
        return { targetDpr: nextDpr, shouldUpdate: true, reason: 'STEP_UP' };
      }
    }

    return { targetDpr: currentDpr, shouldUpdate: false, reason: 'MAINTAIN' };
  }

  public reset(): void {
    this.frameTimes = [];
    this.frameIndex = 0;
    this.currentLod = LODLevel.HIGH;
  }
}

export const perfBudget = new PerfBudgetController();
