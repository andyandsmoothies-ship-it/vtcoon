// [TC-IMP10.3/MSS] PerfBudget & 60 FPS Polish Tests — Draw Call Budgets & Adaptive LOD
import { describe, it, expect, beforeEach } from 'vitest';
import {
  PerfBudgetController,
  LODLevel,
  PERF_BUDGET_LIMITS,
  LOD_CONFIGS,
} from '../../src/client/3d/perf_budget';

describe('[TC-IMP10.3/MSS] PerfBudgetController — Draw Call Budgets & Limits', () => {
  let controller: PerfBudgetController;

  beforeEach(() => {
    controller = new PerfBudgetController();
  });

  it('Bảo đảm các hằng số ngân sách kỹ thuật tuân thủ ràng buộc 60 FPS', () => {
    expect(PERF_BUDGET_LIMITS.targetMaxDrawCalls).toBe(85);
    expect(PERF_BUDGET_LIMITS.targetMaxTriangles).toBe(150_000);
    expect(PERF_BUDGET_LIMITS.targetFrameTimeMs).toBeCloseTo(16.67, 2);
    expect(PERF_BUDGET_LIMITS.targetFps).toBe(60);
    expect(PERF_BUDGET_LIMITS.minAcceptableFps).toBe(30);
  });

  it('evaluateDrawCallBudget đánh giá trạng thái optimal khi draw calls <= 85', () => {
    const result = controller.evaluateDrawCallBudget(42);
    expect(result.isWithinBudget).toBe(true);
    expect(result.usageRatio).toBe(0.49);
    expect(result.status).toBe('optimal');
  });

  it('evaluateDrawCallBudget cảnh báo warning khi vượt 85 nhưng <= 119', () => {
    const result = controller.evaluateDrawCallBudget(95);
    expect(result.isWithinBudget).toBe(false);
    expect(result.usageRatio).toBe(1.12);
    expect(result.status).toBe('warning');
  });

  it('evaluateDrawCallBudget báo động critical khi vượt quá 140% ngân sách (>119)', () => {
    const result = controller.evaluateDrawCallBudget(130);
    expect(result.isWithinBudget).toBe(false);
    expect(result.usageRatio).toBe(1.53);
    expect(result.status).toBe('critical');
  });

  it('evaluateTriangleBudget kiểm soát số tam giác dưới ngưỡng 150k', () => {
    const pass = controller.evaluateTriangleBudget(75_000);
    expect(pass.isWithinBudget).toBe(true);
    expect(pass.usageRatio).toBe(0.5);

    const fail = controller.evaluateTriangleBudget(180_000);
    expect(fail.isWithinBudget).toBe(false);
    expect(fail.usageRatio).toBe(1.2);
  });

  it('[Adversarial Inversion] kháng lỗi an toàn khi tham số âm, NaN hoặc Infinity', () => {
    const resNegative = controller.evaluateDrawCallBudget(-15);
    expect(resNegative.isWithinBudget).toBe(true);
    expect(resNegative.usageRatio).toBe(0);
    expect(resNegative.status).toBe('optimal');

    const resNaN = controller.evaluateDrawCallBudget(Number.NaN);
    expect(resNaN.isWithinBudget).toBe(true);
    expect(resNaN.usageRatio).toBe(0);
  });
});

describe('[TC-IMP10.4/MSS] PerfBudgetController — Adaptive LOD & Frame Time Tracking', () => {
  let controller: PerfBudgetController;

  beforeEach(() => {
    controller = new PerfBudgetController();
  });

  it('Đo lường FPS trung bình từ chuỗi frame time và tự động phân tầng LOD', () => {
    // 60 frame lý tưởng (16.67ms = 60 FPS)
    for (let i = 0; i < 60; i++) {
      controller.recordFrameTime(16.67);
    }
    expect(controller.getAverageFps()).toBe(60);
    expect(controller.calculateAdaptiveLOD()).toBe(LODLevel.HIGH);

    // Drop frame xuống ~45 FPS (22.2ms)
    controller.reset();
    for (let i = 0; i < 60; i++) {
      controller.recordFrameTime(22.2);
    }
    expect(controller.getAverageFps()).toBeCloseTo(45, 0);
    expect(controller.calculateAdaptiveLOD()).toBe(LODLevel.MEDIUM);

    // Drop frame nặng xuống ~25 FPS (40ms)
    controller.reset();
    for (let i = 0; i < 60; i++) {
      controller.recordFrameTime(40.0);
    }
    expect(controller.getAverageFps()).toBeCloseTo(25, 0);
    expect(controller.calculateAdaptiveLOD()).toBe(LODLevel.LOW);
  });

  it('Cấu hình LOD phân bổ đúng ngân sách hạt particle và độ phân giải phản chiếu', () => {
    expect(LOD_CONFIGS[LODLevel.HIGH].particleBudget).toBe(72);
    expect(LOD_CONFIGS[LODLevel.HIGH].reflectionResolution).toBe(512);
    expect(LOD_CONFIGS[LODLevel.HIGH].enableReflections).toBe(true);

    expect(LOD_CONFIGS[LODLevel.MEDIUM].particleBudget).toBe(36);
    expect(LOD_CONFIGS[LODLevel.MEDIUM].reflectionResolution).toBe(256);
    expect(LOD_CONFIGS[LODLevel.MEDIUM].enableReflections).toBe(true);

    expect(LOD_CONFIGS[LODLevel.LOW].particleBudget).toBe(18);
    expect(LOD_CONFIGS[LODLevel.LOW].reflectionResolution).toBe(128);
    expect(LOD_CONFIGS[LODLevel.LOW].enableReflections).toBe(false);
  });

  it('getBudgetReport tổng hợp đầy đủ báo cáo WebGL cho chẩn đoán hiệu năng', () => {
    const report = controller.getBudgetReport({
      render: { calls: 64, triangles: 82000 },
    });

    expect(report.drawCalls).toBe(64);
    expect(report.triangles).toBe(82000);
    expect(report.isWithinDrawCallBudget).toBe(true);
    expect(report.isWithinTriangleBudget).toBe(true);
    expect(report.status).toBe('optimal');
    expect(report.recommendedLod).toBe(LODLevel.HIGH);
    expect(report.averageFps).toBe(60);
  });
});
