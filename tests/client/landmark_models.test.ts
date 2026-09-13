// [TC-IMP29.5/MSS] [UC-IMP29] Test Suite: Vietnamese Heritage & Landmarks 3D Overhaul
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import path from 'node:path';
import fs from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { DioramaHeritageDistrict } from '../../src/client/3d/diorama/diorama_heritage_district';
import * as heritageDistrictModule from '../../src/client/3d/diorama/diorama_heritage_district';
import { generateEventCardBackTexture } from '../../src/client/3d/event_card_texture';
import { analyzeModelFile, ASSET_BUDGETS } from '../../scripts/optimize_assets.mjs';

describe('[TC-IMP29.5/MSS] [UC-IMP29] Vietnamese Heritage & Landmarks 3D Overhaul', () => {
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

  it('[TC-IMP29.5/MSS-01] LANDMARK_MODEL_URLS được xuất bản từ src/client/3d/diorama/diorama_heritage_district.tsx gồm đúng 2 danh thắng Bến Thành và Nhà Thờ Cổ', () => {
    const urls = (heritageDistrictModule as Record<string, any>).LANDMARK_MODEL_URLS;
    expect(urls, 'LANDMARK_MODEL_URLS phải được export từ diorama_heritage_district.tsx').toBeDefined();
    expect(urls?.benThanh).toBe('/models/landmarks/landmark_ben_thanh.glb');
    expect(urls?.cathedral).toBe('/models/landmarks/landmark_cathedral.glb');
  });

  it('[TC-IMP29.5/MSS-02] DioramaHeritageDistrict render an toàn trong headless/SSR qua SafeGLTFModel bảo toàn đầy đủ màu sắc đặc trưng (#FDE047, #DC2626, #B45309)', () => {
    const html = renderToStaticMarkup(React.createElement(DioramaHeritageDistrict));
    expect(html).toBeDefined();
    expect(html).toContain('data-testid="diorama-heritage-district"');
    // Chợ Bến Thành: Tháp vàng kem (#FDE047), Mái ngói đỏ tam giác (#DC2626)
    expect(html).toContain('#FDE047');
    expect(html).toContain('#DC2626');
    // Nhà Thờ Cổ: Gian thánh đường gạch nung đỏ Đông Dương (#B45309)
    expect(html).toContain('#B45309');
  });

  it('[TC-IMP29.5/MSS-03] Ngân sách kỹ thuật ASSET_BUDGETS cấu hình danh mục landmarks đúng định mức (<= 200 KB, <= 1.500 triangles)', () => {
    expect(ASSET_BUDGETS.CATEGORIES.landmarks).toBeDefined();
    expect(ASSET_BUDGETS.CATEGORIES.landmarks.maxBytes).toBe(200 * 1024);
    expect(ASSET_BUDGETS.CATEGORIES.landmarks.maxTriangles).toBe(1500);
  });

  it('[TC-IMP29.5/MSS-04] 2 tệp mô hình .glb danh thắng (landmark_ben_thanh.glb và landmark_cathedral.glb) tồn tại trên đĩa và tuân thủ ngân sách kỹ thuật', () => {
    const landmarksDir = path.resolve(process.cwd(), 'public/models/landmarks');
    const landmarkFiles = [
      'landmark_ben_thanh.glb',
      'landmark_cathedral.glb',
    ];

    for (const file of landmarkFiles) {
      const fullPath = path.join(landmarksDir, file);
      expect(fs.existsSync(fullPath), `Tệp mô hình ${file} phải tồn tại trên đĩa`).toBe(true);

      const analysis = analyzeModelFile(fullPath, landmarksDir);
      expect(analysis.category).toBe('landmarks');
      expect(analysis.sizeBytes).toBeLessThanOrEqual(ASSET_BUDGETS.CATEGORIES.landmarks.maxBytes);
      if (analysis.triangles !== null) {
        expect(analysis.triangles).toBeLessThanOrEqual(ASSET_BUDGETS.CATEGORIES.landmarks.maxTriangles);
      }
      expect(analysis.passed).toBe(true);
    }
  });

  it('[TC-IMP29.5/MSS-05] Hàm createHeritageEncausticTileTexture được xuất bản từ src/client/3d/heritage_tile_texture.ts và trả về texture hợp lệ hoặc null trong headless', async () => {
    let heritageTileModule: any = null;
    try {
      heritageTileModule = await import('../../src/client/3d/heritage_tile_texture');
    } catch {
      heritageTileModule = null;
    }

    expect(heritageTileModule, 'Module src/client/3d/heritage_tile_texture.ts phải được tạo và xuất bản').not.toBeNull();
    expect(
      heritageTileModule?.createHeritageEncausticTileTexture,
      'Hàm createHeritageEncausticTileTexture phải được xuất bản từ src/client/3d/heritage_tile_texture.ts'
    ).toBeTypeOf('function');

    const texture = heritageTileModule.createHeritageEncausticTileTexture();
    expect(texture === null || (typeof texture === 'object' && texture !== null)).toBe(true);
  });

  it('[TC-IMP29.5/MSS-06] createHeritageEncausticTileTexture sinh hoa văn gạch bông Đông Dương khi có canvas context', async () => {
    let heritageTileModule: any = null;
    try {
      heritageTileModule = await import('../../src/client/3d/heritage_tile_texture');
    } catch {
      heritageTileModule = null;
    }

    expect(
      heritageTileModule?.createHeritageEncausticTileTexture,
      'Hàm createHeritageEncausticTileTexture phải sẵn sàng để kiểm thử hoa văn canvas'
    ).toBeDefined();

    let drawCalls = 0;
    const mockCtx: Record<string, any> = {
      save: () => { drawCalls++; },
      restore: () => { drawCalls++; },
      beginPath: () => { drawCalls++; },
      arc: () => { drawCalls++; },
      stroke: () => { drawCalls++; },
      fill: () => { drawCalls++; },
      moveTo: () => { drawCalls++; },
      lineTo: () => { drawCalls++; },
      strokeRect: () => { drawCalls++; },
      fillRect: () => { drawCalls++; },
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
    };

    const mockCanvas = {
      width: 256,
      height: 256,
      getContext: () => mockCtx,
    };

    (globalThis as any).document = {
      createElement: (tag: string) => (tag === 'canvas' ? mockCanvas : {}),
    };

    try {
      const texture = heritageTileModule.createHeritageEncausticTileTexture();
      expect(texture).toBeDefined();
      expect(drawCalls).toBeGreaterThan(0);
    } finally {
      delete (globalThis as any).document;
    }
  });

  it('[TC-IMP29.5/MSS-07] Hàm generateEventCardBackTexture tạo texture Trống đồng Đông Sơn mạ vàng hoàng gia cho thẻ chance và market', () => {
    const filledTexts: string[] = [];
    let arcCalls = 0;
    let strokeRectCalls = 0;

    const mockCtx: Record<string, any> = {
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      arc: () => { arcCalls++; },
      stroke: () => {},
      fill: () => {},
      moveTo: () => {},
      lineTo: () => {},
      quadraticCurveTo: () => {},
      translate: () => {},
      rotate: () => {},
      scale: () => {},
      strokeRect: () => { strokeRectCalls++; },
      fillRect: () => {},
      fillText: (text: string) => { filledTexts.push(text); },
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
    };

    const mockCanvas = {
      width: 1024,
      height: 1426,
      getContext: () => mockCtx,
    };

    (globalThis as any).document = {
      createElement: (tag: string) => (tag === 'canvas' ? mockCanvas : {}),
    };

    try {
      const chanceTexture = generateEventCardBackTexture('chance');
      expect(chanceTexture).toBeDefined();
      expect(chanceTexture).not.toBeNull();
      expect(filledTexts).toContain('★ VIỆT NAM THỊNH VƯỢNG ★');
      expect(filledTexts).toContain('✦ VẬN KHÍ KHỞI SINH ✦');
      expect(arcCalls).toBeGreaterThanOrEqual(14); // Mặt trời 14 tia + các vành tròn đồng tâm
      expect(strokeRectCalls).toBeGreaterThanOrEqual(2); // Khung viền đôi mạ vàng

      filledTexts.length = 0;
      const marketTexture = generateEventCardBackTexture('market');
      expect(marketTexture).toBeDefined();
      expect(marketTexture).not.toBeNull();
      expect(filledTexts).toContain('★ VIỆT NAM THỊNH VƯỢNG ★');
      expect(filledTexts).toContain('✦ THỊ TRƯỜNG BIẾN ĐỘNG ✦');
    } finally {
      delete (globalThis as any).document;
    }
  });

  it('[TC-IMP29.5/MSS-08] generateEventCardBackTexture trả về null an toàn trong môi trường headless không có DOM', () => {
    expect(generateEventCardBackTexture('chance')).toBeNull();
    expect(generateEventCardBackTexture('market')).toBeNull();
  });
});
