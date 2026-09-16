// [TC-CPTB01/MSS][UI-S02/MSS][BR-UI-002] Contract Test Suite: Chrome Pawns, Toy Buildings & Diorama Relief
// Traceability: docs/epics/networking/_epic_ledger.md § IMP-93 / Monopoly Plus Visual Fidelity Parity
// Universal 4-Facet Behavioral Matrix:
// Facet 1: Boundary & Range (Kích Thước, Tỉ Lệ PBR Specs, Cao Độ Y & Trục Z)
// Facet 2: State Reactivity & Visual Hierarchy (Khối Nhà C1..C2, Khách Sạn C3 Ruby, Đồi Công Viên & Biển Nóc)
// Facet 3: Resource Disposal & Lifecycle Stability (Tính Tất Định, Idempotent Render & Giải Phóng Tài Nguyên)
// Facet 4: Error Defense & Preservation Invariants (Bảo Tồn 100% Cấu Trúc Gốc, Chống NaN, Slot Bounds)

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  LUXURY_PAWN_CONFIGS,
  LuxuryPawnModel,
  getPawnConfigBySlot,
  type LuxuryPawnConfig,
} from '../../src/client/3d/luxury_pawn_models';
import { LayeredDioramaTile } from '../../src/client/3d/board_tile';
import { DioramaTerrain } from '../../src/client/3d/diorama/diorama_terrain';
import { DioramaShophouseBlocks } from '../../src/client/3d/diorama/diorama_shophouse_blocks';
import { MiniatureCityDiorama } from '../../src/client/3d/miniature_city_diorama';
import { CellType, ColorGroup, type BoardCell } from '../../src/domain/board_config';

// Mock Drei components for headless SSR static rendering
vi.mock('@react-three/drei', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/drei')>();
  return {
    ...actual,
    Billboard: ({ children, follow = true, ...props }: any) =>
      React.createElement('billboard', { follow: String(follow), ...props }, children),
    RoundedBox: ({ children, ...props }: any) =>
      React.createElement('roundedbox', props, children),
    Image: ({ scale, ...props }: any) =>
      React.createElement('drei-image', {
        ...props,
        scale: Array.isArray(scale) ? scale.join(',') : scale,
      }),
  };
});

// Domain Test Fixture: Standard Property Cell
const samplePropertyCell: BoardCell = {
  index: 1,
  name: 'Cần Thơ (Cái Răng)',
  type: CellType.Property,
  colorGroup: ColorGroup.Nau,
};

// Dynamic Component Resolver for ToyPropertyBuildings (Station 1 RED -> Station 2 GREEN)
export type ToyPropertyBuildingsComponentType = React.ComponentType<{
  level: number;
  groupColor?: string;
  position?: [number, number, number];
}>;

let ToyPropertyBuildings: ToyPropertyBuildingsComponentType | null = null;

try {
  const toyModulePath = '../../src/client/3d/toy_property_buildings';
  // @ts-ignore
  const toyMod = await import(/* @vite-ignore */ toyModulePath);
  ToyPropertyBuildings = toyMod?.ToyPropertyBuildings ?? null;
} catch {
  ToyPropertyBuildings = null;
}

if (!ToyPropertyBuildings) {
  try {
    // @ts-ignore
    const boardMod = await import('../../src/client/3d/board_tile');
    ToyPropertyBuildings = (boardMod as any)?.ToyPropertyBuildings ?? null;
  } catch {
    // Implementer will provide in Station 2
  }
}

describe('[TC-CPTB01/MSS][UI-S02/MSS][BR-UI-002] Chrome Pawns, Toy Buildings & Diorama Relief Contract Suite', () => {
  let originalConsoleError: typeof console.error;
  let pawnDefaultMarkup = '';
  let pawnPlayerAuraMarkup = '';
  let terrainMarkup = '';
  let shophouseMarkup = '';
  let dioramaMarkup = '';
  let tileLevel0Markup = '';
  let tileLevel1Markup = '';
  let tileLevel2Markup = '';
  let tileLevel3Markup = '';

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

    pawnDefaultMarkup = renderToStaticMarkup(
      React.createElement(LuxuryPawnModel, { slotIndex: 0 })
    );
    pawnPlayerAuraMarkup = renderToStaticMarkup(
      React.createElement(LuxuryPawnModel, { slotIndex: 0, playerColor: '#3B82F6' })
    );
    terrainMarkup = renderToStaticMarkup(React.createElement(DioramaTerrain));
    shophouseMarkup = renderToStaticMarkup(React.createElement(DioramaShophouseBlocks));
    dioramaMarkup = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));

    tileLevel0Markup = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell: samplePropertyCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: false,
        ownerColor: '#EF4444',
      })
    );
    tileLevel1Markup = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell: samplePropertyCell,
        position: [0, 0, 0],
        currentLevel: 1,
        isCornerTile: false,
        ownerColor: '#EF4444',
      })
    );
    tileLevel2Markup = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell: samplePropertyCell,
        position: [0, 0, 0],
        currentLevel: 2,
        isCornerTile: false,
        ownerColor: '#EF4444',
      })
    );
    tileLevel3Markup = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell: samplePropertyCell,
        position: [0, 0, 0],
        currentLevel: 3,
        isCornerTile: false,
        ownerColor: '#EF4444',
      })
    );
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  // =========================================================================
  // FACET 1: BOUNDARY & RANGE (PBR SPECS, TỈ LỆ SCALE & TỌA ĐỘ CAO ĐỘ)
  // =========================================================================
  describe('Facet 1: Boundary & Range — Kích Thước, Tỉ Lệ PBR & Cao Độ Tọa Độ', () => {
    it('[TC-CPTB01.01/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] LUXURY_PAWN_CONFIGS cấu hình chất liệu chrome bạc #F8FAFC cho slot 0', () => {
      const cfg = LUXURY_PAWN_CONFIGS[0];
      expect(cfg).toBeDefined();
      expect(cfg?.color).toBe('#F8FAFC');
    });

    it('[TC-CPTB01.02/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] LUXURY_PAWN_CONFIGS cấu hình chất liệu chrome bạc #F8FAFC cho slot 1, 2 và 3', () => {
      expect(LUXURY_PAWN_CONFIGS[1]?.color).toBe('#F8FAFC');
      expect(LUXURY_PAWN_CONFIGS[2]?.color).toBe('#F8FAFC');
      expect(LUXURY_PAWN_CONFIGS[3]?.color).toBe('#F8FAFC');
    });

    it('[TC-CPTB01.03/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] LUXURY_PAWN_CONFIGS đạt độ phản xạ kim loại cao metalness >= 0.90 (chuẩn 0.96)', () => {
      expect(LUXURY_PAWN_CONFIGS[0]?.metalness).toBeGreaterThanOrEqual(0.90);
      expect(LUXURY_PAWN_CONFIGS[0]?.metalness).toBe(0.96);
    });

    it('[TC-CPTB01.04/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] LUXURY_PAWN_CONFIGS đạt độ nhám siêu mịn roughness <= 0.12 (chuẩn 0.08)', () => {
      expect(LUXURY_PAWN_CONFIGS[0]?.roughness).toBeLessThanOrEqual(0.12);
      expect(LUXURY_PAWN_CONFIGS[0]?.roughness).toBe(0.08);
    });

    it('[TC-CPTB01.05/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] LuxuryPawnModel có tỉ lệ phóng to bề thế với scale tối thiểu >= 0.85 (thay vì 0.625 cũ)', () => {
      const scaleMatch = pawnDefaultMarkup.match(/scale="([^"]+)"/);
      expect(scaleMatch).not.toBeNull();
      const dims = (scaleMatch?.[1] ?? '').split(',').map(Number);
      expect(dims[0]).toBeGreaterThanOrEqual(0.85);
    });

    it('[TC-CPTB01.06/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Đĩa hào quang màu người chơi tích hợp chất liệu phát quang nhẹ emissive', () => {
      const hasAura =
        pawnPlayerAuraMarkup.includes('data-testid="pawn-aura-pedestal"') ||
        pawnPlayerAuraMarkup.includes('data-testid="pawn-enamel-ring"');
      expect(hasAura).toBe(true);

      const auraSection = pawnPlayerAuraMarkup.includes('data-testid="pawn-aura-pedestal"')
        ? pawnPlayerAuraMarkup.slice(
            pawnPlayerAuraMarkup.indexOf('data-testid="pawn-aura-pedestal"'),
            pawnPlayerAuraMarkup.indexOf('data-testid="pawn-aura-pedestal"') + 400
          )
        : pawnPlayerAuraMarkup.slice(
            pawnPlayerAuraMarkup.indexOf('data-testid="pawn-enamel-ring"'),
            pawnPlayerAuraMarkup.indexOf('data-testid="pawn-enamel-ring"') + 400
          );
      expect(auraSection).toContain('emissive');
    });

    it('[TC-CPTB01.07/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Vị trí khối nhà/khách sạn đồ chơi nằm trên dải màu đỉnh ô cờ với cao độ Y trong khoảng [0.10, 0.20]', () => {
      expect(tileLevel1Markup).toContain('data-testid="toy-house"');
      const houseIndex = tileLevel1Markup.indexOf('data-testid="toy-house"');
      const sub = tileLevel1Markup.slice(Math.max(0, houseIndex - 200), houseIndex + 200);
      const posMatch = sub.match(/position="([^"]+)"/);
      const coords = (posMatch?.[1] ?? '').split(',').map(Number);
      expect(coords[1]).toBeGreaterThanOrEqual(0.10);
      expect(coords[1]).toBeLessThanOrEqual(0.20);
    });

    it('[TC-CPTB01.08/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Vị trí khối nhà/khách sạn đồ chơi nằm trên dải màu đỉnh ô cờ với tọa độ Z trong khoảng [-0.95, -0.65]', () => {
      expect(tileLevel1Markup).toContain('data-testid="toy-house"');
      const houseIndex = tileLevel1Markup.indexOf('data-testid="toy-house"');
      const sub = tileLevel1Markup.slice(Math.max(0, houseIndex - 200), houseIndex + 200);
      const posMatch = sub.match(/position="([^"]+)"/);
      const coords = (posMatch?.[1] ?? '').split(',').map(Number);
      expect(coords[2]).toBeGreaterThanOrEqual(-0.95);
      expect(coords[2]).toBeLessThanOrEqual(-0.65);
    });

    it('[TC-CPTB01.09/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Khối đồi công viên giật cấp diorama-park-relief sở hữu bệ móng đá xám #64748B', () => {
      expect(terrainMarkup).toContain('data-testid="diorama-park-relief"');
      const reliefIndex = terrainMarkup.indexOf('data-testid="diorama-park-relief"');
      const reliefSection = terrainMarkup.slice(reliefIndex, reliefIndex + 800);
      expect(reliefSection).toContain('#64748B');
    });

    it('[TC-CPTB01.10/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Khối đồi công viên giật cấp diorama-park-relief sở hữu thảm cỏ cao tầng #15803D', () => {
      expect(terrainMarkup).toContain('data-testid="diorama-park-relief"');
      const reliefIndex = terrainMarkup.indexOf('data-testid="diorama-park-relief"');
      const reliefSection = terrainMarkup.slice(reliefIndex, reliefIndex + 800);
      expect(reliefSection).toContain('#15803D');
    });
  });

  // =========================================================================
  // FACET 2: STATE REACTIVITY & VISUAL HIERARCHY (CẤP NHÀ ĐỒ CHƠI & CẢNH QUAN SA BÀN)
  // =========================================================================
  describe('Facet 2: State Reactivity & Visual Hierarchy — Cấp Nhà Đồ Chơi & Cảnh Quan Sa Bàn', () => {
    it('[TC-CPTB02.01/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Có component ToyPropertyBuildings được định nghĩa và xuất khẩu hợp lệ', () => {
      expect(ToyPropertyBuildings).toBeDefined();
      expect(ToyPropertyBuildings).not.toBeNull();
    });

    it('[TC-CPTB02.02/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Cấp 1 (level === 1): ToyPropertyBuildings render đúng 1 khối nhà data-testid="toy-house"', () => {
      expect(ToyPropertyBuildings).not.toBeNull();
      const markup = renderToStaticMarkup(
        React.createElement(ToyPropertyBuildings!, { level: 1 })
      );
      const matches = markup.match(/data-testid="toy-house"/g);
      expect(matches).toHaveLength(1);
    });

    it('[TC-CPTB02.03/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Khối nhà cấp 1 mang màu xanh lục bảo đặc trưng (#10B981 hoặc #059669)', () => {
      expect(ToyPropertyBuildings).not.toBeNull();
      const markup = renderToStaticMarkup(
        React.createElement(ToyPropertyBuildings!, { level: 1 })
      );
      const hasEmeraldGreen = markup.includes('#10B981') || markup.includes('#059669');
      expect(hasEmeraldGreen).toBe(true);
    });

    it('[TC-CPTB02.04/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Cấp 2 (level === 2): ToyPropertyBuildings render đúng 2 khối nhà data-testid="toy-house"', () => {
      expect(ToyPropertyBuildings).not.toBeNull();
      const markup = renderToStaticMarkup(
        React.createElement(ToyPropertyBuildings!, { level: 2 })
      );
      const matches = markup.match(/data-testid="toy-house"/g);
      expect(matches).toHaveLength(2);
    });

    it('[TC-CPTB02.05/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Cấp 3 (level === 3): ToyPropertyBuildings render đúng 1 khách sạn đỏ Ruby data-testid="toy-hotel"', () => {
      expect(ToyPropertyBuildings).not.toBeNull();
      const markup = renderToStaticMarkup(
        React.createElement(ToyPropertyBuildings!, { level: 3 })
      );
      const hotelMatches = markup.match(/data-testid="toy-hotel"/g);
      expect(hotelMatches).toHaveLength(1);
    });

    it('[TC-CPTB02.06/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Khách sạn cấp 3 đỏ Ruby sử dụng tông màu đỏ đặc trưng (#DC2626 hoặc #E11D48)', () => {
      expect(ToyPropertyBuildings).not.toBeNull();
      const markup = renderToStaticMarkup(
        React.createElement(ToyPropertyBuildings!, { level: 3 })
      );
      const hasRubyRed = markup.includes('#DC2626') || markup.includes('#E11D48');
      expect(hasRubyRed).toBe(true);
    });

    it('[TC-CPTB02.07/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Khách sạn cấp 3 đỏ Ruby tích hợp chi tiết đường viền vàng #F59E0B', () => {
      expect(ToyPropertyBuildings).not.toBeNull();
      const markup = renderToStaticMarkup(
        React.createElement(ToyPropertyBuildings!, { level: 3 })
      );
      expect(markup).toContain('#F59E0B');
    });

    it('[TC-CPTB02.08/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Cấp 0 (level === 0): ToyPropertyBuildings không render bất kỳ khối nhà hay khách sạn nào', () => {
      expect(ToyPropertyBuildings).not.toBeNull();
      const markup = renderToStaticMarkup(
        React.createElement(ToyPropertyBuildings!, { level: 0 })
      );
      expect(markup).not.toContain('data-testid="toy-house"');
      expect(markup).not.toContain('data-testid="toy-hotel"');
    });

    it('[TC-CPTB02.09/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Điểm tiêu thụ LayeredDioramaTile cấp 1 kết xuất trực tiếp 1 khối nhà toy-house trên dải màu', () => {
      expect(tileLevel1Markup).toContain('data-testid="toy-house"');
      const matches = tileLevel1Markup.match(/data-testid="toy-house"/g);
      expect(matches).toHaveLength(1);
    });

    it('[TC-CPTB02.10/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Điểm tiêu thụ LayeredDioramaTile cấp 2 kết xuất trực tiếp 2 khối nhà toy-house trên dải màu', () => {
      expect(tileLevel2Markup).toContain('data-testid="toy-house"');
      const matches = tileLevel2Markup.match(/data-testid="toy-house"/g);
      expect(matches).toHaveLength(2);
    });

    it('[TC-CPTB02.11/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Điểm tiêu thụ LayeredDioramaTile cấp 3 kết xuất trực tiếp 1 khách sạn toy-hotel trên dải màu', () => {
      expect(tileLevel3Markup).toContain('data-testid="toy-hotel"');
      const matches = tileLevel3Markup.match(/data-testid="toy-hotel"/g);
      expect(matches).toHaveLength(1);
    });

    it('[TC-CPTB02.12/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Điểm tiêu thụ LayeredDioramaTile cấp 0 không kết xuất bất kỳ nhà hay khách sạn đồ chơi nào', () => {
      expect(tileLevel0Markup).not.toContain('data-testid="toy-house"');
      expect(tileLevel0Markup).not.toContain('data-testid="toy-hotel"');
    });

    it('[TC-CPTB02.13/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] DioramaTerrain tích hợp khối đồi công viên giật cấp 2 tầng data-testid="diorama-park-relief"', () => {
      expect(terrainMarkup).toContain('data-testid="diorama-park-relief"');
    });

    it('[TC-CPTB02.14/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] DioramaShophouseBlocks tích hợp cụm biển hiệu nóc nhà 3D data-testid="diorama-rooftop-signs"', () => {
      expect(shophouseMarkup).toContain('data-testid="diorama-rooftop-signs"');
    });

    it('[TC-CPTB02.15/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Cụm biển hiệu nóc nhà 3D chứa biểu trưng thương mại đặc trưng (cà phê, donut hoặc HOSE)', () => {
      expect(shophouseMarkup).toContain('data-testid="diorama-rooftop-signs"');
      const signsIndex = shophouseMarkup.indexOf('data-testid="diorama-rooftop-signs"');
      const signsSection = shophouseMarkup.slice(signsIndex, signsIndex + 800);
      const hasSignIdentity =
        signsSection.includes('cà phê') ||
        signsSection.includes('donut') ||
        signsSection.includes('HOSE') ||
        signsSection.includes('Coffee') ||
        signsSection.includes('☕') ||
        signsSection.includes('🍩');
      expect(hasSignIdentity).toBe(true);
    });
  });

  // =========================================================================
  // FACET 3: RESOURCE DISPOSAL & LIFECYCLE STABILITY (TÍNH TẤT ĐỊNH & VÒNG ĐỜI)
  // =========================================================================
  describe('Facet 3: Resource Disposal & Lifecycle Stability — Vòng Đời & Tính Tất Định', () => {
    it('[TC-CPTB03.01/MSS][UI-S02/MSS][BR-UI-002][Facet3-Disposal] LuxuryPawnModel kết xuất tĩnh ổn định và không ném ngoại lệ', () => {
      expect(pawnDefaultMarkup.length).toBeGreaterThan(50);
      expect(pawnPlayerAuraMarkup.length).toBeGreaterThan(50);
    });

    it('[TC-CPTB03.02/MSS][UI-S02/MSS][BR-UI-002][Facet3-Disposal] Kết xuất LayeredDioramaTile lặp lại nhiều lần bảo đảm tính tất định (idempotent)', () => {
      const repeatedMarkup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 1,
          isCornerTile: false,
          ownerColor: '#EF4444',
        })
      );
      expect(repeatedMarkup).toBe(tileLevel1Markup);
    });

    it('[TC-CPTB03.03/MSS][UI-S02/MSS][BR-UI-002][Facet3-Disposal] Sa bàn MiniatureCityDiorama kết xuất đồng bộ không tạo thẻ hình học rỗng', () => {
      expect(dioramaMarkup).not.toContain('<boxgeometry></boxgeometry>');
      expect(dioramaMarkup).not.toContain('<cylindergeometry></cylindergeometry>');
    });

    it('[TC-CPTB03.04/MSS][UI-S02/MSS][BR-UI-002][Facet3-Disposal] Toàn bộ cây sa bàn hoàn tất vòng đời SSR an toàn với độ dài markup phong phú', () => {
      expect(dioramaMarkup.length).toBeGreaterThan(1000);
      expect(terrainMarkup.length).toBeGreaterThan(500);
    });
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE & PRESERVATION INVARIANTS (BẤT BIẾN BẢO TOÀN & PHÒNG THỦ)
  // =========================================================================
  describe('Facet 4: Error Defense & Preservation Invariants — Bất Biến Bảo Toàn & Phòng Thủ Lỗi', () => {
    it('[TC-CPTB04.01/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn container sa bàn gốc data-testid="miniature-city-diorama"', () => {
      expect(dioramaMarkup).toContain('data-testid="miniature-city-diorama"');
    });

    it('[TC-CPTB04.02/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn tuyến đường sắt mô hình data-testid="diorama-model-railroad"', () => {
      expect(dioramaMarkup).toContain('data-testid="diorama-model-railroad"');
    });

    it('[TC-CPTB04.03/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn đệm đá ba-lát đường sắt data-testid="diorama-railroad-ballast"', () => {
      expect(dioramaMarkup).toContain('data-testid="diorama-railroad-ballast"');
    });

    it('[TC-CPTB04.04/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn ke ga xe lửa bến sông data-testid="diorama-waterfront-station"', () => {
      expect(dioramaMarkup).toContain('data-testid="diorama-waterfront-station"');
    });

    it('[TC-CPTB04.05/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn luống hoa nhiệt đới data-testid="diorama-tropical-flora"', () => {
      expect(dioramaMarkup).toContain('data-testid="diorama-tropical-flora"');
    });

    it('[TC-CPTB04.06/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn đài tượng đài biểu tượng trung tâm data-testid="central-monument-plaza"', () => {
      expect(dioramaMarkup).toContain('data-testid="central-monument-plaza"');
    });

    it('[TC-CPTB04.07/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn khung viền gỗ ôm trọn bàn cờ data-testid="diorama-board-rim"', () => {
      expect(dioramaMarkup).toContain('data-testid="diorama-board-rim"');
    });

    it('[TC-CPTB04.08/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn hành lang đi bộ lát đá hoa cương data-testid="diorama-pedestrian-promenades"', () => {
      expect(dioramaMarkup).toContain('data-testid="diorama-pedestrian-promenades"');
    });

    it('[TC-CPTB04.09/MSS][UI-S02/MSS][BR-UI-002][Facet4-ErrorDefense] Toàn bộ tọa độ và tham số kết xuất là số thực hữu hạn, tuyệt đối không chứa NaN', () => {
      expect(pawnDefaultMarkup).not.toContain('NaN');
      expect(tileLevel1Markup).not.toContain('NaN');
      expect(terrainMarkup).not.toContain('NaN');
      expect(dioramaMarkup).not.toContain('NaN');
    });

    it('[TC-CPTB04.10/MSS][UI-S02/MSS][BR-UI-002][Facet4-ErrorDefense] Thuộc tính sa bàn và quân cờ sạch sẽ, không chứa ="undefined" hoặc ="null"', () => {
      expect(pawnDefaultMarkup).not.toContain('="undefined"');
      expect(tileLevel1Markup).not.toContain('="undefined"');
      expect(terrainMarkup).not.toContain('="undefined"');
      expect(dioramaMarkup).not.toContain('="undefined"');
    });

    it('[TC-CPTB04.11/MSS][UI-S02/MSS][BR-UI-002][Facet4-ErrorDefense] LuxuryPawnModel phòng thủ giá trị slotIndex âm (-1) bằng cách fallback an toàn về slot 0', () => {
      const fallbackMarkup = renderToStaticMarkup(
        React.createElement(LuxuryPawnModel, { slotIndex: -1 })
      );
      expect(fallbackMarkup).toBe(pawnDefaultMarkup);
    });

    it('[TC-CPTB04.12/MSS][UI-S02/MSS][BR-UI-002][Facet4-ErrorDefense] LuxuryPawnModel phòng thủ giá trị slotIndex ngoài biên (99) bằng cách fallback an toàn về slot 0', () => {
      const fallbackMarkup = renderToStaticMarkup(
        React.createElement(LuxuryPawnModel, { slotIndex: 99 })
      );
      expect(fallbackMarkup).toBe(pawnDefaultMarkup);
    });
  });
});
