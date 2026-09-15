// [TC-IMP29.3/MSS] Test Suite: 3D Building Models Overhaul & SafeGLTFModel Integration
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import path from 'node:path';
import fs from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  ProceduralBuilding,
  BUILDING_MODEL_URLS,
} from '../../src/client/3d/procedural_building';
import { analyzeModelFile, ASSET_BUDGETS } from '../../scripts/optimize_assets.mjs';

describe('[TC-IMP29.3/MSS] 3D Building Models Overhaul (C1-C3) & SafeGLTFModel Integration', () => {
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

  it('BUILDING_MODEL_URLS cấu hình đúng 3 cấp công trình C1-C3', () => {
    expect(BUILDING_MODEL_URLS).toBeDefined();
    expect(BUILDING_MODEL_URLS[1]).toBe('/models/buildings/building_c1.glb');
    expect(BUILDING_MODEL_URLS[2]).toBe('/models/buildings/building_c2.glb');
    expect(BUILDING_MODEL_URLS[3]).toBe('/models/buildings/building_c3.glb');
  });

  it('ProceduralBuilding render an toàn trong môi trường test/headless cho toàn bộ các cấp 0, 1, 2, 3', () => {
    for (const lvl of [0, 1, 2, 3] as const) {
      const element = React.createElement(ProceduralBuilding, { level: lvl, groupColor: '#3B82F6' });
      const html = renderToStaticMarkup(element);
      expect(html).toBeDefined();
      expect(html).toMatch(/position="0,(?:0\.22|0\.16),(?:-0\.42|0\.58|-0\.58|-1\.58|-1\.35|-1\.38)"/);
    }
  });

  it('3 tệp mô hình .glb công trình C1-C3 tồn tại trong public/models/buildings và đạt chuẩn ngân sách kỹ thuật', () => {
    const buildingsDir = path.resolve(process.cwd(), 'public/models/buildings');
    const buildingFiles = [
      'building_c1.glb',
      'building_c2.glb',
      'building_c3.glb',
    ];

    for (const file of buildingFiles) {
      const fullPath = path.join(buildingsDir, file);
      expect(fs.existsSync(fullPath), `Tệp mô hình ${file} phải tồn tại trên đĩa`).toBe(true);

      const analysis = analyzeModelFile(fullPath, buildingsDir);
      expect(analysis.category).toBe('buildings');
      expect(analysis.sizeBytes).toBeLessThanOrEqual(ASSET_BUDGETS.CATEGORIES.buildings.maxBytes);
      if (analysis.triangles !== null) {
        expect(analysis.triangles).toBeLessThanOrEqual(ASSET_BUDGETS.CATEGORIES.buildings.maxTriangles);
      }
      expect(analysis.passed).toBe(true);
    }
  });
});
