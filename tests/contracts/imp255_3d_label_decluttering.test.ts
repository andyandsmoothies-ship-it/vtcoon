// ============================================================================
// [TC-IMP255.01..16][UC-IMP255] Universal 5-Facet Contract Suite:
// IMP-255: Khử Trùng Lặp Nhãn 3D Qua Va Chạm SAT & Suy Giảm Độ Đục Theo Khoảng Cách
// Reference: .agents/plans/PLAN_IMP_255_3D_LABEL_DECLUTTERING.md
// Domain Invariants: docs/domain/gotchas.md (Pillar V, Pillar VI Detroit Classical)
// ============================================================================

import { describe, it, expect, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Mock Drei components for headless SSR static rendering without dirty casts
vi.mock('@react-three/drei', () => ({
  Billboard: ({ children, ...props }: { readonly children?: React.ReactNode }) =>
    React.createElement('billboard', props, children),
  Html: ({ children }: { readonly children?: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

// Pure Math & Declutter Engine under test (Station 1 RED Contract Gate)
import {
  calculateLabelOpacity,
  checkLabelsOverlap,
  declutterLabels,
  lerpLabelOpacity,
  projectPointToScreen,
  type Label2DProjection,
} from '../../src/client/3d/label_declutter_engine.js';

// 3D View Components under test
import {
  TileEventFloatingBadge,
  TileEventAura,
  type TileEventStatus,
} from '../../src/client/3d/tile_event_aura.js';
import { useGameStore } from '../../src/client/store/game_store.js';

describe('[TC-IMP255.01..16][UC-IMP255] 3D Label Decluttering via SAT Collision & Distance Opacity Falloff', () => {
  afterEach(() => {
    useGameStore.setState({
      activeModifiers: [],
      spotlightedCellIndices: [],
    });
  });

  // ============================================================================
  // Facet 1: Distance Opacity Falloff Function (TC-IMP255.01..03)
  // ============================================================================
  describe('Facet 1: Distance Opacity Falloff Function', () => {
    it('[TC-IMP255.01/MSS][UC-IMP255/MSS] calculateLabelOpacity tính toán nhãn ở cự ly gần đạt độ đục cao (opacity >= 0.85), nhãn ở cự ly xa suy giảm theo hàm mũ về tiệm cận 0 (opacity <= 0.05)', () => {
      const nearOpacity = calculateLabelOpacity(0, 0, 35, 1.0, false);
      const farOpacity = calculateLabelOpacity(150, 0, 35, 1.0, false);

      expect(nearOpacity).toBeGreaterThanOrEqual(0.85);
      expect(farOpacity).toBeLessThanOrEqual(0.05);
    });

    it('[TC-IMP255.02/MSS][UC-IMP255/MSS] calculateLabelOpacity khi isSelected = true bảo toàn độ đục nổi bật (opacity >= 0.90) bất kể khoảng cách xa', () => {
      const selectedOpacity = calculateLabelOpacity(250, 0, 35, 1.0, true);
      const halfSelectedOpacity = calculateLabelOpacity(250, 0, 35, 0.5, true);

      expect(selectedOpacity).toBe(1.0);
      expect(halfSelectedOpacity).toBe(0.9);
    });

    it('[TC-IMP255.03/A1][UC-IMP255/A1] calculateLabelOpacity kẹp chặt đầu ra nghiêm ngặt trong khoảng [0.0, 1.0] với dữ liệu biên cực đoan (khoảng cách âm, cự ly vô cùng)', () => {
      const negOpacity = calculateLabelOpacity(-100, 0, 35, 1.0, false);
      const infOpacity = calculateLabelOpacity(Number.POSITIVE_INFINITY, 0, 35, 1.0, false);

      expect(negOpacity).toBeLessThanOrEqual(1.0);
      expect(negOpacity).toBeGreaterThanOrEqual(0.0);
      expect(infOpacity).toBe(0.0);
    });
  });

  // ============================================================================
  // Facet 2: SAT 2D Collision & Overlap Rejection (TC-IMP255.04..07)
  // ============================================================================
  describe('Facet 2: SAT 2D Collision & Overlap Rejection', () => {
    it('[TC-IMP255.04/MSS][UC-IMP255/MSS] checkLabelsOverlap trả về false ngay ở bước kiểm tra thô AABB khi hai nhãn ở hai góc xa nhau trên màn hình', () => {
      const labelX1: Label2DProjection = { id: 'x1', cellIndex: 0, x: 20, y: 100, width: 80, height: 30, distance: 10, priority: 10 };
      const labelX2: Label2DProjection = { id: 'x2', cellIndex: 1, x: 600, y: 100, width: 80, height: 30, distance: 10, priority: 10 };
      expect(checkLabelsOverlap(labelX1, labelX2, 4)).toBe(false);

      const labelY1: Label2DProjection = { id: 'y1', cellIndex: 0, x: 100, y: 20, width: 80, height: 30, distance: 10, priority: 10 };
      const labelY2: Label2DProjection = { id: 'y2', cellIndex: 1, x: 100, y: 500, width: 80, height: 30, distance: 10, priority: 10 };
      expect(checkLabelsOverlap(labelY1, labelY2, 4)).toBe(false);
    });

    it('[TC-IMP255.05/MSS][UC-IMP255/MSS] checkLabelsOverlap trả về true khi hai nhãn dạng trục song song (axis-aligned) giao cắt diện tích màn hình', () => {
      const labelA: Label2DProjection = {
        id: 'tile-1',
        cellIndex: 1,
        x: 100,
        y: 100,
        width: 80,
        height: 30,
        distance: 15,
        priority: 10,
      };
      const labelB: Label2DProjection = {
        id: 'tile-2',
        cellIndex: 2,
        x: 140,
        y: 110,
        width: 80,
        height: 30,
        distance: 16,
        priority: 20,
      };

      expect(checkLabelsOverlap(labelA, labelB, 4)).toBe(true);
    });

    it('[TC-IMP255.06/MSS][UC-IMP255/MSS] checkLabelsOverlap với hai tứ giác xoay góc có hộp AABB giao nhau nhưng đỉnh đa giác tách rời qua trục phân tách SAT trả về false (triệt tiêu báo động giả)', () => {
      const diamondA: Label2DProjection = {
        id: 'diamond-a',
        cellIndex: 3,
        x: 80,
        y: 80,
        width: 40,
        height: 40,
        polygon: [
          [100, 80],
          [120, 100],
          [100, 120],
          [80, 100],
        ],
        distance: 10,
        priority: 10,
      };
      const diamondB: Label2DProjection = {
        id: 'diamond-b',
        cellIndex: 4,
        x: 116,
        y: 116,
        width: 20,
        height: 20,
        polygon: [
          [126, 116],
          [136, 126],
          [126, 136],
          [116, 126],
        ],
        distance: 10,
        priority: 10,
      };

      // Nhãn chữ nhật không có polygon đặt ở góc AABB nhưng SAT của diamondA tách rời (x+y < 180)
      const cornerRect: Label2DProjection = {
        id: 'corner-rect',
        cellIndex: 5,
        x: 81,
        y: 81,
        width: 8,
        height: 8,
        distance: 10,
        priority: 10,
      };

      expect(checkLabelsOverlap(diamondA, diamondB, 4)).toBe(false);
      expect(checkLabelsOverlap(diamondA, cornerRect, 0)).toBe(false);
    });

    it('[TC-IMP255.07/A2][UC-IMP255/A2] checkLabelsOverlap mở rộng lề biên an toàn theo tham số padding (mặc định 4px), hai nhãn đặt sát cạnh trong phạm vi padding được xem là va chạm', () => {
      const labelA: Label2DProjection = {
        id: 'touch-a',
        cellIndex: 5,
        x: 100,
        y: 100,
        width: 50,
        height: 30,
        distance: 10,
        priority: 10,
      };
      const labelB: Label2DProjection = {
        id: 'touch-b',
        cellIndex: 6,
        x: 152,
        y: 100,
        width: 50,
        height: 30,
        distance: 10,
        priority: 10,
      };

      expect(checkLabelsOverlap(labelA, labelB, 0)).toBe(false);
      expect(checkLabelsOverlap(labelA, labelB, 4)).toBe(true);
    });
  });

  // ============================================================================
  // Facet 3: Priority-Based Declutter Pipeline (TC-IMP255.08..11)
  // ============================================================================
  describe('Facet 3: Priority-Based Declutter Pipeline', () => {
    it('[TC-IMP255.08/MSS][UC-IMP255/MSS] declutterLabels giải quyết va chạm giữa nhãn ưu tiên cao (sự kiện thị trường, priority 100) và nhãn ưu tiên thấp (khay giá, priority 10): giữ lại nhãn ưu tiên cao, ẩn nhãn thấp với cullReason = overlap', () => {
      const highPriLabel: Label2DProjection = {
        id: 'market-event-crest',
        cellIndex: 12,
        x: 200,
        y: 200,
        width: 80,
        height: 30,
        distance: 15,
        priority: 100,
        baseOpacity: 1.0,
      };
      const lowPriLabel: Label2DProjection = {
        id: 'owner-price-pill',
        cellIndex: 12,
        x: 220,
        y: 210,
        width: 80,
        height: 30,
        distance: 15,
        priority: 10,
        baseOpacity: 1.0,
      };

      const results = declutterLabels([lowPriLabel, highPriLabel]);
      const highResult = results.find((r) => r.id === 'market-event-crest');
      const lowResult = results.find((r) => r.id === 'owner-price-pill');

      expect(declutterLabels([])).toEqual([]);
      expect(highResult?.isVisible).toBe(true);
      expect(highResult?.cullReason).toBe('none');
      expect(lowResult?.isVisible).toBe(false);
      expect(lowResult?.cullReason).toBe('overlap');
    });

    it('[TC-IMP255.09/MSS][UC-IMP255/MSS] declutterLabels tự động lược bỏ các nhãn ở cự ly xa có độ đục rơi xuống dưới ngưỡng minOpacityThreshold (mặc định 0.05) với cullReason = distance', () => {
      const nearCandidate: Label2DProjection = {
        id: 'near-label',
        cellIndex: 1,
        x: 50,
        y: 50,
        width: 40,
        height: 20,
        distance: 5,
        priority: 50,
        baseOpacity: 1.0,
      };
      const farCandidate: Label2DProjection = {
        id: 'far-label',
        cellIndex: 21,
        x: 400,
        y: 400,
        width: 40,
        height: 20,
        distance: 160,
        priority: 50,
        baseOpacity: 1.0,
      };

      const results = declutterLabels([nearCandidate, farCandidate], { minOpacityThreshold: 0.05 });
      const farResult = results.find((r) => r.id === 'far-label');

      expect(farResult?.isVisible).toBe(false);
      expect(farResult?.cullReason).toBe('distance');
      expect(farResult?.opacity).toBe(0);
    });

    it('[TC-IMP255.10/A3][UC-IMP255/A3] declutterLabels áp dụng giới hạn maxVisibleLabels để khống chế trần số lượng nhãn hiển thị đồng thời trên sa bàn', () => {
      const candidates: ReadonlyArray<Label2DProjection> = [
        { id: 'c1', cellIndex: 1, x: 10, y: 10, width: 30, height: 20, distance: 10, priority: 40 },
        { id: 'c2', cellIndex: 2, x: 80, y: 10, width: 30, height: 20, distance: 10, priority: 30 },
        { id: 'c3', cellIndex: 3, x: 150, y: 10, width: 30, height: 20, distance: 10, priority: 20 },
        { id: 'c4', cellIndex: 4, x: 220, y: 10, width: 30, height: 20, distance: 10, priority: 10 },
      ];

      const results = declutterLabels(candidates, { maxVisibleLabels: 2 });

      expect(results[0]?.isVisible).toBe(true);
      expect(results[1]?.isVisible).toBe(true);
      expect(results[2]?.isVisible).toBe(false);
      expect(results[3]?.isVisible).toBe(false);
    });

    it('[TC-IMP255.11/A4][UC-IMP255/A4] declutterLabels xử lý hai nhãn có độ ưu tiên bằng nhau bằng cách ưu tiên nhãn ở khoảng cách gần camera hơn', () => {
      const closerLabel: Label2DProjection = {
        id: 'closer-label',
        cellIndex: 7,
        x: 100,
        y: 100,
        width: 70,
        height: 30,
        distance: 12,
        priority: 50,
        baseOpacity: 1.0,
      };
      const fartherLabel: Label2DProjection = {
        id: 'farther-label',
        cellIndex: 8,
        x: 120,
        y: 110,
        width: 70,
        height: 30,
        distance: 35,
        priority: 50,
        baseOpacity: 1.0,
      };

      const results = declutterLabels([fartherLabel, closerLabel]);
      const closerResult = results.find((r) => r.id === 'closer-label');
      const fartherResult = results.find((r) => r.id === 'farther-label');

      expect(closerResult?.isVisible).toBe(true);
      expect(fartherResult?.isVisible).toBe(false);
      expect(fartherResult?.cullReason).toBe('overlap');
    });
  });

  // ============================================================================
  // Facet 4: Temporal Smoothing & Screen Projection (TC-IMP255.12..14)
  // ============================================================================
  describe('Facet 4: Temporal Smoothing & Screen Projection', () => {
    it('[TC-IMP255.12/MSS][UC-IMP255/MSS] lerpLabelOpacity thực hiện nội suy mượt giữa giá trị hiện tại và giá trị đích mà không vượt ngưỡng mục tiêu', () => {
      const smoothed = lerpLabelOpacity(0.2, 0.8, 0.5);
      const clampedMax = lerpLabelOpacity(0.2, 0.8, 1.5);
      const clampedMin = lerpLabelOpacity(0.2, 0.8, -0.5);

      expect(smoothed).toBeCloseTo(0.5, 4);
      expect(clampedMax).toBeCloseTo(0.8, 4);
      expect(clampedMin).toBeCloseTo(0.2, 4);
    });

    it('[TC-IMP255.13/MSS][UC-IMP255/MSS] projectPointToScreen chuyển đổi tọa độ điểm 3D thế giới qua ma trận chiếu chuẩn về tọa độ pixel màn hình 2D hợp lệ', () => {
      const identityMatrix = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ];
      const proj = projectPointToScreen([0, 0, 0], identityMatrix, 1000, 800);

      expect(proj.x).toBe(500);
      expect(proj.y).toBe(400);
      expect(proj.inFrustum).toBe(true);
    });

    it('[TC-IMP255.14/A5][UC-IMP255/A5] projectPointToScreen đánh dấu inFrustum = false đối với các điểm nằm phía sau camera (tọa độ thuần nhất clipW <= 0)', () => {
      const matrixBehind = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, -1,
      ];
      const proj = projectPointToScreen([0, 0, 0], matrixBehind, 1000, 800);

      expect(proj.inFrustum).toBe(false);
      expect(proj.distance).toBe(0);
    });
  });

  // ============================================================================
  // Facet 5: Component Integration & Full Pipeline (TC-IMP255.15..16)
  // ============================================================================
  describe('Facet 5: Component Integration & Full Pipeline', () => {
    it('[TC-IMP255.15/MSS][UC-IMP255/MSS] TileEventFloatingBadge tiếp nhận thuộc tính opacity và áp dụng độ đục vào phần tử hiển thị hoặc ẩn hoàn toàn khi opacity <= 0.01 (sử dụng renderToStaticMarkup)', () => {
      const status: TileEventStatus = {
        isActive: true,
        type: 'MARKET_EVENT',
        icon: '🔥',
        label: 'Sốt Đất',
        color: '#F59E0B',
        remainingRounds: 2,
        isExpiringSoon: false,
      };

      const renderedVisible = renderToStaticMarkup(
        React.createElement(TileEventFloatingBadge, {
          status,
          opacity: 0.65,
        })
      );

      const renderedCulled = renderToStaticMarkup(
        React.createElement(TileEventFloatingBadge, {
          status,
          opacity: 0.005,
        })
      );

      expect(renderedVisible).toContain('opacity:0.65');
      expect(renderedCulled).toBe('');
    });

    it('[TC-IMP255.16/MSS][UC-IMP255/MSS] TileEventAura tiếp nhận thuộc tính opacity trong TileEventAuraProps và chuyển tiếp trực tiếp xuống TileEventFloatingBadge, hoàn thiện chuỗi dữ liệu đầu cuối', () => {
      useGameStore.setState({
        activeModifiers: [
          {
            type: 'MARKET_EVENT',
            remainingRounds: 2,
            affectedCells: [12],
          },
        ],
        spotlightedCellIndices: [],
      });

      const renderedAura = renderToStaticMarkup(
        React.createElement(TileEventAura, {
          cellIndex: 12,
          opacity: 0.42,
        })
      );

      const renderedAuraCulledBadge = renderToStaticMarkup(
        React.createElement(TileEventAura, {
          cellIndex: 12,
          opacity: 0.005,
        })
      );

      expect(renderedAura).toContain('opacity:0.42');
      expect(renderedAuraCulledBadge).not.toContain('tile-event-badge-pill');
      expect(renderedAuraCulledBadge).toContain('tile-event-aura-rim');
    });
  });
});
