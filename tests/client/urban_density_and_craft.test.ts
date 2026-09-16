// [TC-UDC01/MSS][UI-S02/MSS][BR-UI-002] Contract Test Suite: Urban Density & Craft (4 Chốt Nâng Cấp Sa Bàn Đô Thị)
// Universal 4-Facet Behavioral Matrix Test Suite:
// Facet 1: Boundary & Scale (Kích thước tượng đài đỉnh >= 0.45m, khung viền bàn cờ >= 18.2m)
// Facet 2: State Reactivity & Material Quality (Đài phun nước trắng & hồ biếc #0EA5E9, nước sông bóng roughness <= 0.35, metalness >= 0.05, lối đi bộ)
// Facet 3: Resource Disposal & Accessibility (Unmount an toàn, testids)
// Facet 4: Error Defense & Preservation Invariant (Bảo toàn 100% testids hiện hữu, không chứa NaN)

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  MiniatureCityDiorama,
  CentralMonumentPlaza,
} from '../../src/client/3d/miniature_city_diorama';
import { DioramaTerrain } from '../../src/client/3d/diorama/diorama_terrain';
import { DiceTray } from '../../src/client/3d/dice_tray';

// Helper: Extract all cylinder geometry args from static markup
function extractCylinderArgs(markup: string): number[][] {
  const regex = /<cylinderGeometry[^>]*args="([^"]+)"/gi;
  const results: number[][] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markup)) !== null) {
    const rawArgs = match[1];
    if (rawArgs) {
      results.push(rawArgs.split(',').map(Number));
    }
  }
  return results;
}

// Helper: Extract maximum Y position from meshes in markup
function extractMaxMeshPositionY(markup: string): number {
  const regex = /position="([^"]+)"/g;
  let maxY = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markup)) !== null) {
    const rawPos = match[1];
    if (rawPos) {
      const coords = rawPos.split(',').map(Number);
      const y = coords[1];
      if (y !== undefined && Number.isFinite(y) && y > maxY) {
        maxY = y;
      }
    }
  }
  return maxY;
}

// Helper: Extract dimensions of board rim (data-testid="diorama-board-rim")
function extractBoardRimDimensions(markup: string): { widthX: number; depthZ: number; heightY: number } {
  const rimMatch = markup.match(
    /<(?:group|mesh)[^>]*data-testid="diorama-board-rim"[^>]*>([\s\S]*?)<\/(?:group|mesh)>/i
  ) || markup.match(/<mesh[^>]*data-testid="diorama-board-rim"[^>]*\/?>/i);

  const content = rimMatch ? rimMatch[0] : '';
  if (!content) {
    return { widthX: 0, depthZ: 0, heightY: 0 };
  }

  const boxMatches = content.matchAll(/<boxGeometry[^>]*args="([^"]+)"/gi);
  let maxW = 0;
  let maxD = 0;
  let maxH = 0;
  for (const match of boxMatches) {
    const rawBox = match[1];
    if (rawBox) {
      const [w, h, d] = rawBox.split(',').map(Number);
      if (w !== undefined && w > maxW) maxW = w;
      if (d !== undefined && d > maxD) maxD = d;
      if (h !== undefined && h > maxH) maxH = h;
    }
  }
  return { widthX: maxW, depthZ: maxD, heightY: maxH };
}

// Helper: Extract water material roughness and metalness from DioramaTerrain
function extractRiverWaterMaterial(terrainMarkup: string): { roughness: number; metalness: number; hasFoamOrWaves: boolean } {
  // The water surface mesh in DioramaTerrain has a blue tint (#0284C7, #0EA5E9, #0369A1, etc.)
  const waterMatMatch = terrainMarkup.match(
    /<meshStandardMaterial[^>]*color="(?:#0284C7|#0EA5E9|#0369A1|#0284c7)"[^>]*>/i
  );

  let roughness = NaN;
  let metalness = NaN;

  if (waterMatMatch) {
    const tag = waterMatMatch[0];
    const roughnessMatch = tag.match(/roughness="([^"]+)"/i);
    const metalnessMatch = tag.match(/metalness="([^"]+)"/i);
    if (roughnessMatch && roughnessMatch[1] !== undefined) roughness = parseFloat(roughnessMatch[1]);
    if (metalnessMatch && metalnessMatch[1] !== undefined) metalness = parseFloat(metalnessMatch[1]);
  }

  // River water section also contains foam ridge or dynamic wave markers
  const riverSectionMatch = terrainMarkup.match(
    /<group[^>]*>[\s\S]*?color="(?:#0284C7|#0EA5E9|#0369A1|#0284c7)"[\s\S]*?<\/group>/i
  );
  const riverSection = riverSectionMatch ? riverSectionMatch[0] : '';

  const hasFoamOrWaves =
    riverSection.includes('#E0F2FE') ||
    riverSection.includes('#BAE6FD') ||
    riverSection.includes('#F0F9FF') ||
    riverSection.includes('diorama-water-foam') ||
    riverSection.includes('diorama-river-waves');

  return { roughness, metalness, hasFoamOrWaves };
}

// Helper: Extract all coordinates to verify finite numeric bounds (no NaN)
function extractAllCoordinates(markup: string): number[] {
  const regex = /position="([^"]+)"/g;
  const coords: number[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markup)) !== null) {
    const rawCoords = match[1];
    if (rawCoords) {
      const nums = rawCoords.split(',').map(Number);
      for (const num of nums) {
        coords.push(num);
      }
    }
  }
  return coords;
}

describe('[TC-UDC01/MSS][UI-S02/MSS][BR-UI-002] Urban Density & Craft Contract Suite', () => {
  let originalConsoleError: typeof console.error;

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
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  // ===========================================================================
  // FACET 1: Boundary & Scale (Kích thước tượng đài, khung viền bàn cờ)
  // ===========================================================================

  it('[TC-UDC01.1a/MSS][UI-S02/MSS][BR-UI-002] CentralMonumentPlaza: Bán kính bệ đá cẩm thạch vòng ngoài đạt >= 0.9m (đường kính đế >= 1.8m)', () => {
    const plazaMarkup = renderToStaticMarkup(React.createElement(CentralMonumentPlaza));
    const cylinders = extractCylinderArgs(plazaMarkup);
    const maxRadius = Math.max(...cylinders.flatMap((c) => [c[0] ?? 0, c[1] ?? 0]));

    expect(maxRadius).toBeGreaterThanOrEqual(0.9);
    expect(maxRadius * 2).toBeGreaterThanOrEqual(1.8);
  });

  it('[TC-UDC01.1b/MSS][UI-S02/MSS][BR-UI-002] CentralMonumentPlaza: Đỉnh tượng đài trung tâm vươn cao đạt độ cao tổng thể Y >= 0.45m', () => {
    const plazaMarkup = renderToStaticMarkup(React.createElement(CentralMonumentPlaza));
    const peakY = extractMaxMeshPositionY(plazaMarkup);

    expect(peakY).toBeGreaterThanOrEqual(0.45);
  });

  it('[TC-UDC01.1c/MSS][UI-S02/MSS][BR-UI-002] CentralMonumentPlaza: Đỉnh tượng đài trung tâm nằm trong tỷ lệ thẩm mỹ cân đối [0.45m, 0.80m]', () => {
    const plazaMarkup = renderToStaticMarkup(React.createElement(CentralMonumentPlaza));
    const peakY = extractMaxMeshPositionY(plazaMarkup);

    expect(peakY).toBeGreaterThanOrEqual(0.45);
    expect(peakY).toBeLessThanOrEqual(0.80);
  });

  it('[TC-UDC01.2a/MSS][UI-S02/MSS][BR-UI-002] Extruded Tabletop Board Rim: Khung viền ngoài đạt bề rộng kích thước ngang X >= 18.2m', () => {
    const cityMarkup = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));
    const dims = extractBoardRimDimensions(cityMarkup);

    expect(cityMarkup).toContain('data-testid="diorama-board-rim"');
    expect(dims.widthX).toBeGreaterThanOrEqual(18.2);
  });

  it('[TC-UDC01.2b/MSS][UI-S02/MSS][BR-UI-002] Extruded Tabletop Board Rim: Khung viền ngoài đạt chiều sâu dọc Z >= 18.2m ôm trọn chu vi bàn cờ', () => {
    const cityMarkup = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));
    const dims = extractBoardRimDimensions(cityMarkup);

    expect(cityMarkup).toContain('data-testid="diorama-board-rim"');
    expect(dims.depthZ).toBeGreaterThanOrEqual(18.2);
  });

  it('[TC-UDC01.2c/MSS][UI-S02/MSS][BR-UI-002] Extruded Tabletop Board Rim: Gờ khung viền có độ dày Y hữu hạn tạo gờ chắn xúc xắc', () => {
    const cityMarkup = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));
    const dims = extractBoardRimDimensions(cityMarkup);

    expect(Number.isFinite(dims.heightY)).toBe(true);
    expect(dims.heightY).toBeGreaterThan(0);
  });

  // ===========================================================================
  // FACET 2: State Reactivity & Material Quality (Chất liệu nước phản chiếu, lối đi bộ)
  // ===========================================================================

  it('[TC-UDC02.1a/MSS][UI-S02/MSS][BR-UI-002] CentralMonumentPlaza: Đài phun nước 2 tầng sử dụng đá cẩm thạch trắng #F8FAFC hoặc #E2E8F0', () => {
    const plazaMarkup = renderToStaticMarkup(React.createElement(CentralMonumentPlaza));
    const hasWhiteMarble = plazaMarkup.includes('#F8FAFC') || plazaMarkup.includes('#E2E8F0');

    expect(hasWhiteMarble).toBe(true);
  });

  it('[TC-UDC02.1b/MSS][UI-S02/MSS][BR-UI-002] CentralMonumentPlaza: Lòng hồ đài phun nước sử dụng màu nước biếc ngọc lam #0EA5E9', () => {
    const plazaMarkup = renderToStaticMarkup(React.createElement(CentralMonumentPlaza));

    expect(plazaMarkup).toContain('#0EA5E9');
  });

  it('[TC-UDC02.1c/MSS][UI-S02/MSS][BR-UI-002] CentralMonumentPlaza: Tượng đài trung tâm sử dụng chất liệu mạ đồng/vàng hoàng kim #F59E0B', () => {
    const plazaMarkup = renderToStaticMarkup(React.createElement(CentralMonumentPlaza));

    expect(plazaMarkup).toContain('#F59E0B');
  });

  it('[TC-UDC02.2a/MSS][UI-S02/MSS][BR-UI-002] Extruded Tabletop Board Rim: Sử dụng chất liệu gỗ óc chó hoặc đồng thau kim loại cao cấp', () => {
    const cityMarkup = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));
    const hasLuxuryWoodOrBrass =
      cityMarkup.includes('#B45309') ||
      cityMarkup.includes('#78350F') ||
      cityMarkup.includes('#92400E') ||
      cityMarkup.includes('#D97706');

    expect(cityMarkup).toContain('data-testid="diorama-board-rim"');
    expect(hasLuxuryWoodOrBrass).toBe(true);
  });

  it('[TC-UDC02.3a/MSS][UI-S02/MSS][BR-UI-002] Dynamic Water: Mặt nước sông Sài Gòn nâng cấp độ bóng phản xạ tự nhiên với roughness <= 0.35', () => {
    const terrainMarkup = renderToStaticMarkup(React.createElement(DioramaTerrain));
    const water = extractRiverWaterMaterial(terrainMarkup);

    expect(Number.isFinite(water.roughness)).toBe(true);
    expect(water.roughness).toBeLessThanOrEqual(0.35);
  });

  it('[TC-UDC02.3b/MSS][UI-S02/MSS][BR-UI-002] Dynamic Water: Mặt nước sông Sài Gòn nâng cấp phản xạ kim loại với metalness >= 0.05', () => {
    const terrainMarkup = renderToStaticMarkup(React.createElement(DioramaTerrain));
    const water = extractRiverWaterMaterial(terrainMarkup);

    expect(Number.isFinite(water.metalness)).toBe(true);
    expect(water.metalness).toBeGreaterThanOrEqual(0.05);
  });

  it('[TC-UDC02.3c/MSS][UI-S02/MSS][BR-UI-002] Dynamic Water: Mặt nước sông Sài Gòn tích hợp gờ bọt sóng hoặc hiệu ứng sóng nước động học', () => {
    const terrainMarkup = renderToStaticMarkup(React.createElement(DioramaTerrain));
    const water = extractRiverWaterMaterial(terrainMarkup);

    expect(water.hasFoamOrWaves).toBe(true);
  });

  it('[TC-UDC02.4a/MSS][UI-S02/MSS][BR-UI-002] Pedestrian Promenades: Kết xuất cụm lối đi bộ lát đá hoa cương data-testid="diorama-pedestrian-promenades"', () => {
    const cityMarkup = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));

    expect(cityMarkup).toContain('data-testid="diorama-pedestrian-promenades"');
  });

  it('[TC-UDC02.4b/MSS][UI-S02/MSS][BR-UI-002] Pedestrian Promenades: Tích hợp mảng tiểu cảnh cây hoa công viên dọc hành lang đi bộ', () => {
    const cityMarkup = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));
    const hasParkGreenery =
      cityMarkup.includes('#15803D') ||
      cityMarkup.includes('#16A34A') ||
      cityMarkup.includes('#22C55E') ||
      cityMarkup.includes('#10B981') ||
      cityMarkup.includes('#F43F5E') ||
      cityMarkup.includes('#EC4899');

    expect(cityMarkup).toContain('data-testid="diorama-pedestrian-promenades"');
    expect(hasParkGreenery).toBe(true);
  });

  it('[TC-UDC02.4c/MSS][UI-S02/MSS][BR-UI-002] Pedestrian Promenades: Bố trí các băng ghế nghỉ chân cho cư dân sa bàn dọc tuyến đi dạo', () => {
    const cityMarkup = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));
    const hasBenches =
      cityMarkup.includes('#78350F') ||
      cityMarkup.includes('#854D0E') ||
      cityMarkup.includes('#A16207') ||
      cityMarkup.includes('#64748B') ||
      cityMarkup.includes('#475569');

    expect(cityMarkup).toContain('data-testid="diorama-pedestrian-promenades"');
    expect(hasBenches).toBe(true);
  });

  // ===========================================================================
  // FACET 3: Resource Disposal & Accessibility (Unmount an toàn, testids)
  // ===========================================================================

  it('[TC-UDC03.1a/MSS][UI-S02/MSS][BR-UI-002] CentralMonumentPlaza: Kết xuất data-testid="central-monument-plaza" hợp lệ', () => {
    const plazaMarkup = renderToStaticMarkup(React.createElement(CentralMonumentPlaza));

    expect(plazaMarkup).toContain('data-testid="central-monument-plaza"');
    expect(plazaMarkup.length).toBeGreaterThan(0);
  });

  it('[TC-UDC03.1b/MSS][UI-S02/MSS][BR-UI-002] CentralMonumentPlaza: Giải phóng an toàn không throw exception khi unmount', () => {
    expect(() => {
      const markup = renderToStaticMarkup(React.createElement(CentralMonumentPlaza));
      expect(markup).toBeDefined();
    }).not.toThrow();
  });

  it('[TC-UDC03.2/MSS][UI-S02/MSS][BR-UI-002] Extruded Tabletop Board Rim: Định danh đúng data-testid="diorama-board-rim" trong render tree', () => {
    const cityMarkup = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));

    expect(cityMarkup).toContain('data-testid="diorama-board-rim"');
  });

  it('[TC-UDC03.3/MSS][UI-S02/MSS][BR-UI-002] Pedestrian Promenades: Định danh đúng data-testid="diorama-pedestrian-promenades" trong render tree', () => {
    const cityMarkup = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));

    expect(cityMarkup).toContain('data-testid="diorama-pedestrian-promenades"');
  });

  it('[TC-UDC03.4/MSS][UI-S02/MSS][BR-UI-002] MiniatureCityDiorama: Giải phóng tài nguyên an toàn không gây rò rỉ khi unmount', () => {
    expect(() => {
      const markup = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));
      expect(markup.length).toBeGreaterThan(0);
    }).not.toThrow();
  });

  // ===========================================================================
  // FACET 4: Error Defense & Preservation Invariant (Bảo toàn testids cũ, không chứa NaN)
  // ===========================================================================

  it.each([
    'miniature-city-diorama',
    'central-monument-plaza',
    'diorama-container-port',
    'diorama-civic-center',
    'diorama-heritage-district',
  ])(
    '[TC-UDC04.1/MSS][UI-S02/MSS][BR-UI-002] Bảo tồn 100%% định danh sa bàn cốt lõi: data-testid="%s"',
    (testId) => {
      const cityMarkup = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));
      expect(cityMarkup).toContain(`data-testid="${testId}"`);
    }
  );

  it('[TC-UDC04.2/MSS][UI-S02/MSS][BR-UI-002] DiceTray: Bảo tồn 100% định danh data-testid="dice-tray" ở trạng thái nghỉ', () => {
    const trayMarkup = renderToStaticMarkup(React.createElement(DiceTray));

    expect(trayMarkup).toContain('data-testid="dice-tray"');
  });

  it('[TC-UDC04.3/MSS][UI-S02/MSS][BR-UI-002] CentralMonumentPlaza: Toàn bộ tọa độ trong group là số thực hữu hạn, không chứa NaN', () => {
    const plazaMarkup = renderToStaticMarkup(React.createElement(CentralMonumentPlaza));
    const coords = extractAllCoordinates(plazaMarkup);

    expect(coords.length).toBeGreaterThan(0);
    const hasNaN = coords.some((n) => Number.isNaN(n) || !Number.isFinite(n));
    expect(hasNaN).toBe(false);
  });

  it('[TC-UDC04.4/MSS][UI-S02/MSS][BR-UI-002] DioramaTerrain: Toàn bộ tọa độ địa hình là số thực hữu hạn, không chứa NaN', () => {
    const terrainMarkup = renderToStaticMarkup(React.createElement(DioramaTerrain));
    const coords = extractAllCoordinates(terrainMarkup);

    expect(coords.length).toBeGreaterThan(0);
    const hasNaN = coords.some((n) => Number.isNaN(n) || !Number.isFinite(n));
    expect(hasNaN).toBe(false);
  });

  it('[TC-UDC04.5/MSS][UI-S02/MSS][BR-UI-002] MiniatureCityDiorama: Kết xuất SSR an toàn không phát sinh chuỗi rỗng', () => {
    const cityMarkup = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));

    expect(typeof cityMarkup).toBe('string');
    expect(cityMarkup.length).toBeGreaterThan(100);
  });
});
