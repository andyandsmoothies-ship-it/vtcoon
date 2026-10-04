// [IMP-255] 3D Label Decluttering Engine via SAT Collision & Distance Opacity Falloff
// Pure mathematical functions and spatial projection algorithms for billboard clarity.

export interface Label2DProjection {
  readonly id: string;
  readonly cellIndex: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly polygon?: ReadonlyArray<readonly [number, number]>;
  readonly distance: number;
  readonly priority: number;
  readonly baseOpacity?: number;
  readonly isSelected?: boolean;
}

export interface DeclutterResultItem {
  readonly id: string;
  readonly cellIndex: number;
  readonly isVisible: boolean;
  readonly opacity: number;
  readonly cullReason?: 'overlap' | 'distance' | 'none';
}

export interface DeclutterOptions {
  readonly padding?: number;
  readonly minOpacityThreshold?: number;
  readonly sceneExtent?: number;
  readonly maxVisibleLabels?: number;
}

export interface ScreenProjectionResult {
  readonly x: number;
  readonly y: number;
  readonly distance: number;
  readonly inFrustum: boolean;
}

/**
 * Tính toán độ đục suy giảm theo khoảng cách camera dựa trên hàm mũ tự nhiên.
 * Giữ nguyên 100% độ rõ ràng cho các ô đang được chọn hoặc tương tác (isSelected = true).
 * Suy giảm tiệm cận 0 khi khoảng cách lớn để hỗ trợ culling cự ly xa sạch sẽ.
 */
export function calculateLabelOpacity(
  distance: number,
  nearest: number,
  sceneExtent: number,
  baseOpacity = 1.0,
  isSelected = false
): number {
  if (isSelected) {
    return Math.min(1.0, Math.max(0.9, baseOpacity));
  }
  const validDist = Math.max(0, distance);
  const validNearest = Math.max(0, nearest);
  const scale = Math.max(15, sceneExtent * 0.85);
  const relative = Math.min(1.0, (validNearest + scale * 0.1) / (validDist + scale * 0.1));
  const alpha = baseOpacity * Math.exp(-validDist / scale) * Math.pow(relative, 1.5);
  return Math.max(0.0, Math.min(1.0, Number.isFinite(alpha) ? alpha : 0.0));
}

/**
 * Kiểm tra va chạm giao cắt giữa 2 nhãn 2D trên màn hình bằng AABB và Định lý Trục Phân Tách (SAT).
 */
export function checkLabelsOverlap(
  a: Label2DProjection,
  b: Label2DProjection,
  padding = 4
): boolean {
  if (
    a.x > b.x + b.width + padding ||
    b.x > a.x + a.width + padding ||
    a.y > b.y + b.height + padding ||
    b.y > a.y + a.height + padding
  ) {
    return false;
  }

  // Tối ưu hóa GC Churn (Stage B ADV-PERF): Hộp chữ nhật trục song song không cần duyệt trục SAT
  if (!a.polygon && !b.polygon) {
    return true;
  }

  const getCorners = (label: Label2DProjection): ReadonlyArray<readonly [number, number]> =>
    label.polygon ?? [
      [label.x, label.y],
      [label.x + label.width, label.y],
      [label.x + label.width, label.y + label.height],
      [label.x, label.y + label.height],
    ];

  const left = getCorners(a);
  const right = getCorners(b);

  for (const polygon of [left, right]) {
    for (let i = 0; i < polygon.length; i++) {
      const [x1, y1] = polygon[i] ?? [0, 0];
      const [x2, y2] = polygon[(i + 1) % polygon.length] ?? [0, 0];
      const nx = y1 - y2;
      const ny = x2 - x1;
      const margin = padding * Math.hypot(nx, ny);
      const p = left.map(([x, y]) => x * nx + y * ny);
      const q = right.map(([x, y]) => x * nx + y * ny);
      if (Math.max(...p) + margin < Math.min(...q) || Math.max(...q) + margin < Math.min(...p)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Nội suy tuyến tính làm mịn độ đục qua thời gian (Temporal Lerp Smoothing).
 */
export function lerpLabelOpacity(current: number, target: number, speed = 0.35): number {
  const clampedSpeed = Math.max(0.0, Math.min(1.0, speed));
  return current + (target - current) * clampedSpeed;
}

/**
 * Chiếu điểm 3D thế giới về tọa độ pixel màn hình 2D qua ma trận View-Projection 4x4.
 */
export function projectPointToScreen(
  worldPos: readonly [number, number, number],
  viewProjMatrix: ReadonlyArray<number>,
  viewportWidth: number,
  viewportHeight: number
): ScreenProjectionResult {
  const [x, y, z] = worldPos;
  const m = viewProjMatrix;
  if (!m || m.length < 16) {
    return { x: 0, y: 0, distance: 0, inFrustum: false };
  }

  const clipW = x * (m[3] ?? 0) + y * (m[7] ?? 0) + z * (m[11] ?? 0) + (m[15] ?? 1);
  if (clipW <= 0.0001) {
    return { x: 0, y: 0, distance: 0, inFrustum: false };
  }

  const clipX = x * (m[0] ?? 0) + y * (m[4] ?? 0) + z * (m[8] ?? 0) + (m[12] ?? 0);
  const clipY = x * (m[1] ?? 0) + y * (m[5] ?? 0) + z * (m[9] ?? 0) + (m[13] ?? 0);
  const clipZ = x * (m[2] ?? 0) + y * (m[6] ?? 0) + z * (m[10] ?? 0) + (m[14] ?? 0);

  const ndcX = clipX / clipW;
  const ndcY = clipY / clipW;
  const ndcZ = clipZ / clipW;

  const inFrustum = ndcX >= -1.0 && ndcX <= 1.0 && ndcY >= -1.0 && ndcY <= 1.0 && ndcZ >= -1.0 && ndcZ <= 1.0;
  const screenX = ((ndcX + 1) / 2) * viewportWidth;
  const screenY = ((1 - ndcY) / 2) * viewportHeight;

  return {
    x: screenX,
    y: screenY,
    distance: clipW,
    inFrustum,
  };
}

/**
 * Quy trình lọc và khử trùng lặp toàn bộ danh sách nhãn ứng viên.
 */
export function declutterLabels(
  candidates: ReadonlyArray<Label2DProjection>,
  options: DeclutterOptions = {}
): ReadonlyArray<DeclutterResultItem> {
  const padding = options.padding ?? 4;
  const minOpacity = options.minOpacityThreshold ?? 0.05;
  const sceneExtent = options.sceneExtent ?? 35;
  const maxVisible = options.maxVisibleLabels ?? 40;

  if (candidates.length === 0) {
    return [];
  }

  // Sắp xếp theo ưu tiên giảm dần, sau đó theo cự ly gần tăng dần
  const sorted = [...candidates].sort(
    (a, b) => b.priority - a.priority || a.distance - b.distance
  );

  const nearest = sorted.reduce(
    (min, c) => Math.min(min, c.distance),
    sorted[0]?.distance ?? 0
  );

  const placed: Label2DProjection[] = [];
  const results: DeclutterResultItem[] = [];

  for (const candidate of sorted) {
    if (placed.length >= maxVisible) {
      results.push({
        id: candidate.id,
        cellIndex: candidate.cellIndex,
        isVisible: false,
        opacity: 0,
        cullReason: 'overlap',
      });
      continue;
    }

    const hasCollision = placed.some((other) =>
      checkLabelsOverlap(candidate, other, padding)
    );

    if (hasCollision) {
      results.push({
        id: candidate.id,
        cellIndex: candidate.cellIndex,
        isVisible: false,
        opacity: 0,
        cullReason: 'overlap',
      });
      continue;
    }

    const opacity = calculateLabelOpacity(
      candidate.distance,
      nearest,
      sceneExtent,
      candidate.baseOpacity ?? 1.0,
      candidate.isSelected ?? false
    );

    if (opacity < minOpacity) {
      results.push({
        id: candidate.id,
        cellIndex: candidate.cellIndex,
        isVisible: false,
        opacity: 0,
        cullReason: 'distance',
      });
      continue;
    }

    placed.push(candidate);
    results.push({
      id: candidate.id,
      cellIndex: candidate.cellIndex,
      isVisible: true,
      opacity,
      cullReason: 'none',
    });
  }

  return results;
}
