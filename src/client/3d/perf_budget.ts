// [TC-IMP10.3/MSS] PerfBudget — 60 FPS Performance Budget Controller & Adaptive LOD System
// Enforces Draw Call Budget (<85 calls), triangle count (<150k), and target frame time (16.6ms)

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

export interface PerfBudgetReport {
  drawCalls: number;
  triangles: number;
  isWithinDrawCallBudget: boolean;
  isWithinTriangleBudget: boolean;
  usageRatio: number;
  status: 'optimal' | 'warning' | 'critical';
  recommendedLod: LODLevel;
  averageFps: number;
}

export class PerfBudgetController {
  private frameTimes: number[] = [];
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
      isWithinBudget: safeCalls <= PERF_BUDGET_LIMITS.targetMaxDrawCalls,
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
    if (!Number.isFinite(frameTimeMs) || frameTimeMs <= 0) return;
    this.frameTimes.push(frameTimeMs);
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }
  }

  /**
   * Tính FPS trung bình trong cửa sổ trượt 60 frames gần nhất
   */
  public getAverageFps(): number {
    if (this.frameTimes.length === 0) return PERF_BUDGET_LIMITS.targetFps;
    const sum = this.frameTimes.reduce((acc, val) => acc + val, 0);
    const avgMs = sum / this.frameTimes.length;
    if (avgMs <= 0) return PERF_BUDGET_LIMITS.targetFps;
    const fps = 1000 / avgMs;
    return Math.min(60, Math.max(1, Number(fps.toFixed(1))));
  }

  /**
   * Tự động điều chỉnh cấp độ phân giải LOD theo chỉ số FPS thực tế
   */
  public calculateAdaptiveLOD(averageFps?: number): LODLevel {
    const fps = averageFps ?? this.getAverageFps();

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
  public getBudgetReport(glInfo?: {
    render: { calls: number; triangles: number };
  }): PerfBudgetReport {
    const drawCalls = glInfo?.render.calls ?? 0;
    const triangles = glInfo?.render.triangles ?? 0;

    const dcEval = this.evaluateDrawCallBudget(drawCalls);
    const triEval = this.evaluateTriangleBudget(triangles);
    const avgFps = this.getAverageFps();
    const recommendedLod = this.calculateAdaptiveLOD(avgFps);

    return {
      drawCalls,
      triangles,
      isWithinDrawCallBudget: dcEval.isWithinBudget,
      isWithinTriangleBudget: triEval.isWithinBudget,
      usageRatio: dcEval.usageRatio,
      status: dcEval.status,
      recommendedLod,
      averageFps: avgFps,
    };
  }

  public reset(): void {
    this.frameTimes = [];
    this.currentLod = LODLevel.HIGH;
  }
}

export const perfBudget = new PerfBudgetController();
