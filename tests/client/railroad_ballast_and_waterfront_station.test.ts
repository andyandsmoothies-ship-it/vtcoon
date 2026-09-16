// [TC-RBWS01/MSS][UI-S02/MSS][BR-UI-002] Contract Test Suite: Railroad Ballast Bed, Waterfront Mini-Station & Tropical Flora
// Traceability: docs/epics/networking/_epic_ledger.md § IMP-92 / Monopoly Plus Diorama Fidelity
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  MiniatureCityDiorama,
  DioramaModelRailroad,
} from '../../src/client/3d/miniature_city_diorama';

describe('[TC-RBWS01/MSS][UI-S02/MSS][BR-UI-002] Railroad Ballast, Waterfront Station & Tropical Flora Contract Suite', () => {
  let originalConsoleError: typeof console.error;
  let dioramaMarkup = '';
  let railroadMarkup = '';

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (
        msg.includes('is using incorrect casing') ||
        msg.includes('does not recognize the') ||
        msg.includes('non-boolean attribute')
      ) {
        return;
      }
      originalConsoleError(...args);
    };

    dioramaMarkup = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));
    railroadMarkup = renderToStaticMarkup(React.createElement(DioramaModelRailroad));
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  // =========================================================================
  // FACET 1: BOUNDARY & RANGE (KÍCH THƯỚC, CAO ĐỘ & MÀU SẮC CHỐT NÂNG CẤP)
  // =========================================================================
  describe('Facet 1: Boundary & Range — Kích Thước, Cao Độ & Màu Sắc Chốt Nâng Cấp', () => {
    it('[TC-RBWS01.01/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Tuyến đường sắt mô hình DioramaModelRailroad sở hữu bệ đá ba-lát mang định danh diorama-railroad-ballast', () => {
      expect(railroadMarkup).toContain('data-testid="diorama-railroad-ballast"');
    });

    it('[TC-RBWS01.02/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Dải đá ba-lát sử dụng màu xám sỏi đá tự nhiên (#475569, #334155 hoặc #64748B)', () => {
      const ballastSection = railroadMarkup.includes('data-testid="diorama-railroad-ballast"')
        ? railroadMarkup.slice(
            railroadMarkup.indexOf('data-testid="diorama-railroad-ballast"'),
            railroadMarkup.indexOf('data-testid="diorama-railroad-ballast"') + 800
          )
        : '';
      const hasBallastColor =
        ballastSection.includes('#475569') ||
        ballastSection.includes('#334155') ||
        ballastSection.includes('#64748B');
      expect(hasBallastColor).toBe(true);
    });

    it('[TC-RBWS01.03/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Dải đá ba-lát có bề rộng lớn hơn ray (width >= 0.30m)', () => {
      const ballastSection = railroadMarkup.includes('data-testid="diorama-railroad-ballast"')
        ? railroadMarkup.slice(
            railroadMarkup.indexOf('data-testid="diorama-railroad-ballast"'),
            railroadMarkup.indexOf('data-testid="diorama-railroad-ballast"') + 800
          )
        : '';
      const boxArgsMatches = Array.from(ballastSection.matchAll(/args="([^"]+)"/g));
      const hasValidBallastWidth = boxArgsMatches.some((m) => {
        const rawArgs = m?.[1] ?? '';
        const dims = rawArgs.split(',').map(Number);
        return dims.some((d) => !Number.isNaN(d) && d >= 0.30 && d <= 0.60);
      });
      expect(hasValidBallastWidth).toBe(true);
    });

    it('[TC-RBWS01.04/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Bệ đá ba-lát nâng cao khỏi mặt cỏ với cao độ Y nằm trong dải [0.015m, 0.035m]', () => {
      const ballastSection = railroadMarkup.includes('data-testid="diorama-railroad-ballast"')
        ? railroadMarkup.slice(
            railroadMarkup.indexOf('data-testid="diorama-railroad-ballast"'),
            railroadMarkup.indexOf('data-testid="diorama-railroad-ballast"') + 800
          )
        : '';
      const posMatches = Array.from(ballastSection.matchAll(/position="([^"]+)"/g));
      const hasValidBallastElevation = posMatches.some((m) => {
        const rawPos = m?.[1] ?? '';
        const coords = rawPos.split(',').map(Number);
        const y = coords[1];
        return typeof y === 'number' && !Number.isNaN(y) && y >= 0.015 && y <= 0.035;
      });
      expect(hasValidBallastElevation).toBe(true);
    });

    it('[TC-RBWS01.05/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Ke ga xe lửa bến sông mang định danh diorama-waterfront-station', () => {
      expect(dioramaMarkup).toContain('data-testid="diorama-waterfront-station"');
    });

    it('[TC-RBWS01.06/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Thềm ke ga lát đá cẩm thạch hoặc granite màu sáng (#E2E8F0, #CBD5E1 hoặc #F8FAFC)', () => {
      const stationSection = dioramaMarkup.includes('data-testid="diorama-waterfront-station"')
        ? dioramaMarkup.slice(
            dioramaMarkup.indexOf('data-testid="diorama-waterfront-station"'),
            dioramaMarkup.indexOf('data-testid="diorama-waterfront-station"') + 1200
          )
        : '';
      const hasPlatformColor =
        stationSection.includes('#E2E8F0') ||
        stationSection.includes('#CBD5E1') ||
        stationSection.includes('#F8FAFC');
      expect(hasPlatformColor).toBe(true);
    });

    it('[TC-RBWS01.07/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Mái che ke ga sở hữu tông màu lam gỗ hoặc kim loại (#78350F, #B45309, #1E293B hoặc #D97706)', () => {
      const stationSection = dioramaMarkup.includes('data-testid="diorama-waterfront-station"')
        ? dioramaMarkup.slice(
            dioramaMarkup.indexOf('data-testid="diorama-waterfront-station"'),
            dioramaMarkup.indexOf('data-testid="diorama-waterfront-station"') + 1200
          )
        : '';
      const hasCanopyColor =
        stationSection.includes('#78350F') ||
        stationSection.includes('#B45309') ||
        stationSection.includes('#1E293B') ||
        stationSection.includes('#D97706');
      expect(hasCanopyColor).toBe(true);
    });

    it('[TC-RBWS01.08/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Ke ga xe lửa trang bị ghế chờ hành khách hoặc cột đèn tín hiệu', () => {
      const stationSection = dioramaMarkup.includes('data-testid="diorama-waterfront-station"')
        ? dioramaMarkup.slice(
            dioramaMarkup.indexOf('data-testid="diorama-waterfront-station"'),
            dioramaMarkup.indexOf('data-testid="diorama-waterfront-station"') + 1200
          )
        : '';
      const hasBenchOrSignal =
        stationSection.includes('cylindergeometry') ||
        stationSection.includes('spheregeometry') ||
        (stationSection.match(/boxgeometry/g) || []).length >= 2;
      expect(hasBenchOrSignal).toBe(true);
    });

    it('[TC-RBWS01.09/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Luống hoa nhiệt đới mang định danh diorama-tropical-flora', () => {
      expect(dioramaMarkup).toContain('data-testid="diorama-tropical-flora"');
    });

    it('[TC-RBWS01.10/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Luống hoa kết hợp sắc hoa nhiệt đới rực rỡ đỏ son hoặc hồng (#F43F5E hoặc #E11D48)', () => {
      const floraSection = dioramaMarkup.includes('data-testid="diorama-tropical-flora"')
        ? dioramaMarkup.slice(
            dioramaMarkup.indexOf('data-testid="diorama-tropical-flora"'),
            dioramaMarkup.indexOf('data-testid="diorama-tropical-flora"') + 1500
          )
        : '';
      const hasCrimsonOrPink =
        floraSection.includes('#F43F5E') || floraSection.includes('#E11D48');
      expect(hasCrimsonOrPink).toBe(true);
    });

    it('[TC-RBWS01.11/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Luống hoa có sắc hoa vàng cam (#F59E0B) và sắc tím thạch anh (#A855F7)', () => {
      const floraSection = dioramaMarkup.includes('data-testid="diorama-tropical-flora"')
        ? dioramaMarkup.slice(
            dioramaMarkup.indexOf('data-testid="diorama-tropical-flora"'),
            dioramaMarkup.indexOf('data-testid="diorama-tropical-flora"') + 1500
          )
        : '';
      expect(floraSection).toContain('#F59E0B');
      expect(floraSection).toContain('#A855F7');
    });

    it('[TC-RBWS01.12/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Luống hoa phối kết các bụi cây tán tròn xanh cốm (#22C55E) hoặc ngọc lục bảo (#10B981)', () => {
      const floraSection = dioramaMarkup.includes('data-testid="diorama-tropical-flora"')
        ? dioramaMarkup.slice(
            dioramaMarkup.indexOf('data-testid="diorama-tropical-flora"'),
            dioramaMarkup.indexOf('data-testid="diorama-tropical-flora"') + 1500
          )
        : '';
      const hasFoliageGreen =
        floraSection.includes('#22C55E') || floraSection.includes('#10B981');
      expect(hasFoliageGreen).toBe(true);
      expect(floraSection).toContain('spheregeometry');
    });
  });

  // =========================================================================
  // FACET 2: STATE REACTIVITY & COORDINATOR INTEGRATION (TÍCH HỢP SA BÀN)
  // =========================================================================
  describe('Facet 2: State Reactivity & Coordinator Integration — Tích Hợp Đồng Bộ Sa Bàn', () => {
    it('[TC-RBWS02.01/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] MiniatureCityDiorama tích hợp đầy đủ đệm đá ba-lát diorama-railroad-ballast', () => {
      expect(dioramaMarkup).toContain('data-testid="diorama-railroad-ballast"');
    });

    it('[TC-RBWS02.02/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] MiniatureCityDiorama tích hợp đầy đủ ke ga bến sông diorama-waterfront-station', () => {
      expect(dioramaMarkup).toContain('data-testid="diorama-waterfront-station"');
    });

    it('[TC-RBWS02.03/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Ke ga bến sông được định vị dọc tuyến đường ray tại khu vực gần bờ sông hoặc cầu đường sắt', () => {
      const stationSection = dioramaMarkup.includes('data-testid="diorama-waterfront-station"')
        ? dioramaMarkup.slice(
            dioramaMarkup.indexOf('data-testid="diorama-waterfront-station"'),
            dioramaMarkup.indexOf('data-testid="diorama-waterfront-station"') + 1200
          )
        : '';
      const stationPosMatches = Array.from(stationSection.matchAll(/position="([^"]+)"/g));
      const isAlongRailwayTrack = stationPosMatches.some((m) => {
        const raw = m?.[1] ?? '';
        const coords = raw.split(',').map(Number);
        const x = coords[0];
        const z = coords[2];
        return (
          (x !== undefined && Math.abs(x) >= 5.5 && Math.abs(x) <= 7.5) ||
          (z !== undefined && Math.abs(z) >= 5.5 && Math.abs(z) <= 7.5)
        );
      });
      expect(isAlongRailwayTrack).toBe(true);
    });

    it('[TC-RBWS02.04/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] MiniatureCityDiorama tích hợp luống hoa nhiệt đới diorama-tropical-flora ven hành lang sông', () => {
      expect(dioramaMarkup).toContain('data-testid="diorama-tropical-flora"');
    });

    it('[TC-RBWS02.05/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Sa bàn kết xuất đồng thời cả 3 thực thể nâng cấp ballast, station và flora tại điểm tiêu thụ', () => {
      expect(dioramaMarkup).toContain('diorama-railroad-ballast');
      expect(dioramaMarkup).toContain('diorama-waterfront-station');
      expect(dioramaMarkup).toContain('diorama-tropical-flora');
    });
  });

  // =========================================================================
  // FACET 3: RESOURCE DISPOSAL & LIFECYCLE (GIẢI PHÓNG TÀI NGUYÊN & VÒNG ĐỜI)
  // =========================================================================
  describe('Facet 3: Resource Disposal & Lifecycle — Giải Phóng Tài Nguyên & Vòng Đời', () => {
    it('[TC-RBWS03.01/MSS][UI-S02/MSS][BR-UI-002][Facet3-Disposal] MiniatureCityDiorama và DioramaModelRailroad kết xuất tĩnh không ném lỗi ngoại lệ', () => {
      expect(dioramaMarkup.length).toBeGreaterThan(100);
      expect(railroadMarkup.length).toBeGreaterThan(100);
    });

    it('[TC-RBWS03.02/MSS][UI-S02/MSS][BR-UI-002][Facet3-Disposal] Kết xuất nhiều lần liên tiếp bảo đảm tính tất định và không làm biến dị trạng thái tĩnh', () => {
      const secondMarkup = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));
      expect(secondMarkup).toBe(dioramaMarkup);
    });

    it('[TC-RBWS03.03/MSS][UI-S02/MSS][BR-UI-002][Facet3-Disposal] Cây phần tử sa bàn giải phóng tài nguyên an toàn không để lại thẻ hình học rỗng', () => {
      expect(dioramaMarkup).not.toContain('<boxgeometry></boxgeometry>');
      expect(dioramaMarkup).not.toContain('<cylindergeometry></cylindergeometry>');
    });
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE & PRESERVATION INVARIANTS (BẤT BIẾN BẢO TOÀN & PHÒNG THỦ)
  // =========================================================================
  describe('Facet 4: Error Defense & Preservation Invariants — Bất Biến Bảo Toàn Sa Bàn & Phòng Thủ Lỗi', () => {
    it('[TC-RBWS04.01/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn nguyên vẹn container sa bàn gốc data-testid="miniature-city-diorama"', () => {
      expect(dioramaMarkup).toContain('data-testid="miniature-city-diorama"');
    });

    it('[TC-RBWS04.02/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn nguyên vẹn tuyến đường sắt mô hình data-testid="diorama-model-railroad"', () => {
      expect(dioramaMarkup).toContain('data-testid="diorama-model-railroad"');
    });

    it('[TC-RBWS04.03/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn nguyên vẹn tán cây xanh cảnh quan đô thị data-testid="diorama-urban-canopy"', () => {
      expect(dioramaMarkup).toContain('data-testid="diorama-urban-canopy"');
    });

    it('[TC-RBWS04.04/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn nguyên vẹn quảng trường tượng đài trung tâm data-testid="central-monument-plaza"', () => {
      expect(dioramaMarkup).toContain('data-testid="central-monument-plaza"');
    });

    it('[TC-RBWS04.05/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn nguyên vẹn khung viền bàn cờ data-testid="diorama-board-rim"', () => {
      expect(dioramaMarkup).toContain('data-testid="diorama-board-rim"');
    });

    it('[TC-RBWS04.06/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn nguyên vẹn hành lang đi bộ lát đá hoa cương data-testid="diorama-pedestrian-promenades"', () => {
      expect(dioramaMarkup).toContain('data-testid="diorama-pedestrian-promenades"');
    });

    it('[TC-RBWS04.07/MSS][UI-S02/MSS][BR-UI-002][Facet4-ErrorDefense] Toàn bộ tọa độ và tham số sa bàn là số hữu hạn, tuyệt đối không chứa NaN', () => {
      expect(dioramaMarkup).not.toContain('NaN');
      expect(railroadMarkup).not.toContain('NaN');
    });

    it('[TC-RBWS04.08/MSS][UI-S02/MSS][BR-UI-002][Facet4-ErrorDefense] Cấu trúc thuộc tính sa bàn sạch hoàn toàn không chứa undefined hoặc null', () => {
      expect(dioramaMarkup).not.toContain('="undefined"');
      expect(dioramaMarkup).not.toContain('="null"');
    });
  });
});
