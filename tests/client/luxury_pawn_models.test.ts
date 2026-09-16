// [TC-IMP29.2/MSS] Test Suite: Luxury Pawns Overhaul (SafeGLTFModel & Zero-Crash Fallback)
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import path from 'node:path';
import fs from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  LuxuryPawnModel,
  LUXURY_PAWN_CONFIGS,
} from '../../src/client/3d/luxury_pawn_models';
import { analyzeModelFile, ASSET_BUDGETS } from '../../scripts/optimize_assets.mjs';

describe('[TC-IMP29.2/MSS] Luxury Pawns Overhaul & SafeGLTFModel Integration', () => {
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

  it('LUXURY_PAWN_CONFIGS định nghĩa đúng 4 quân cờ với modelUrl chuẩn', () => {
    expect(LUXURY_PAWN_CONFIGS).toHaveLength(4);

    const expectedUrls = [
      '/models/pawns/pawn_rook.glb',
      '/models/pawns/pawn_cannon.glb',
      '/models/pawns/pawn_horse.glb',
      '/models/pawns/pawn_queen.glb',
    ];

    for (let i = 0; i < 4; i++) {
      const cfg = LUXURY_PAWN_CONFIGS[i];
      expect(cfg).toBeDefined();
      expect(cfg?.slot).toBe(i);
      expect(cfg?.modelUrl).toBe(expectedUrls[i]);
    }
  });

  it('LuxuryPawnModel render an toàn trong môi trường test/headless cho toàn bộ 4 slots', () => {
    for (let slot = 0; slot < 4; slot++) {
      const element = React.createElement(LuxuryPawnModel, { slotIndex: slot });
      const html = renderToStaticMarkup(element);
      expect(html).toBeDefined();
      expect(html).toContain('scale="0.625,0.625,0.625"');
    }
  });

  it('LuxuryPawnModel xử lý an toàn các slotIndex biên ngoại lệ (undefined, số âm, vượt quá 3)', () => {
    const invalidSlots = [-1, 4, 99, NaN, Infinity];
    for (const slot of invalidSlots) {
      const element = React.createElement(LuxuryPawnModel, { slotIndex: slot });
      expect(() => renderToStaticMarkup(element)).not.toThrow();
    }
  });

  it('4 tệp mô hình .glb quân cờ tồn tại trong public/models/pawns và đạt chuẩn ngân sách kỹ thuật', () => {
    const pawnsDir = path.resolve(process.cwd(), 'public/models/pawns');
    const pawnFiles = [
      'pawn_tower.glb',
      'pawn_yacht.glb',
      'pawn_car.glb',
      'pawn_horse.glb',
    ];

    for (const file of pawnFiles) {
      const fullPath = path.join(pawnsDir, file);
      expect(fs.existsSync(fullPath), `Tệp mô hình ${file} phải tồn tại trên đĩa`).toBe(true);

      const analysis = analyzeModelFile(fullPath, pawnsDir);
      expect(analysis.category).toBe('pawns');
      expect(analysis.sizeBytes).toBeLessThanOrEqual(ASSET_BUDGETS.CATEGORIES.pawns.maxBytes);
      if (analysis.triangles !== null) {
        expect(analysis.triangles).toBeLessThanOrEqual(ASSET_BUDGETS.CATEGORIES.pawns.maxTriangles);
      }
      expect(analysis.passed).toBe(true);
    }
  });
});
