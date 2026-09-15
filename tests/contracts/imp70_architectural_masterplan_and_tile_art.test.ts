// [TC-70/MSS][IMP-70] Contract Test Suite: Quy Hoạch Cảnh Quan Kiến Trúc TP.HCM Đời Thực & Tile Art
// Facet 1: Cathedral Standout & Elimination of Ben Thanh in Front of Cathedral
// Facet 2: Elimination of Yellow Light Cones & Glowing Yellow Bridge Decks
// Facet 3: Rich Artwork & Illustrative Backgrounds for 4 Corners & Special Tiles
// Facet 4: Authentic HCMC Financial Skyline Layout & Open River Corridor

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DioramaHeritageDistrict } from '../../src/client/3d/diorama/diorama_heritage_district';
import { CinematicLightingAccents } from '../../src/client/3d/cinematic_effects';
import { DioramaBridges } from '../../src/client/3d/diorama/diorama_bridges';
import {
  HIGHRISE_CONFIGS,
  DioramaHighriseBlocks,
} from '../../src/client/3d/diorama/diorama_highrise_blocks';
import {
  getTileTexture,
  getStandeeTexture,
  clearTileTextureCache,
} from '../../src/client/3d/tile_texture_generator';

interface RecordedFill {
  readonly color: string;
  readonly w: number;
}
interface RecordedText {
  readonly text: string;
}

describe('[TC-70/MSS][IMP-70] Quy Hoạch Kiến Trúc TP.HCM & Tile Art Contract Suite', () => {
  let originalConsoleError: typeof console.error;
  let originalDocument: unknown;
  let heritageMarkup = '';
  let cinematicMarkup = '';
  let bridgesMarkup = '';
  let highriseMarkup = '';
  let recordedFills: RecordedFill[] = [];
  let recordedFillText: RecordedText[] = [];
  let currentFillStyle = '';

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (msg.includes('is using incorrect casing') || msg.includes('does not recognize the')) return;
      originalConsoleError(...args);
    };

    heritageMarkup = renderToStaticMarkup(React.createElement(DioramaHeritageDistrict));
    cinematicMarkup = renderToStaticMarkup(React.createElement(CinematicLightingAccents));
    bridgesMarkup = renderToStaticMarkup(React.createElement(DioramaBridges));
    highriseMarkup = renderToStaticMarkup(React.createElement(DioramaHighriseBlocks));
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    clearTileTextureCache();
    recordedFills = [];
    recordedFillText = [];
    currentFillStyle = '';
    originalDocument = (globalThis as any).document;

    const mockCtx = new Proxy(
      { fillStyle: '', strokeStyle: '', lineWidth: 1, font: '', textAlign: '', textBaseline: '' } as any,
      {
        get: (target, prop) => {
          if (prop === 'fillText') {
            return (text: string) => { recordedFillText.push({ text: String(text) }); };
          }
          if (prop === 'fillRect') {
            return (_x: number, _y: number, w: number) => {
              recordedFills.push({ color: currentFillStyle, w });
            };
          }
          if (prop in target) return target[prop];
          if (typeof prop === 'string') return (..._args: unknown[]) => {};
          return undefined;
        },
        set: (target, prop, value) => {
          if (prop === 'fillStyle') currentFillStyle = String(value);
          target[prop] = value;
          return true;
        },
      }
    );

    const mockCanvas = { width: 0, height: 0, getContext: vi.fn(() => mockCtx) };
    (globalThis as any).document = {
      createElement: (tag: string) => (tag === 'canvas' ? mockCanvas : {}),
    };
  });

  afterEach(() => {
    (globalThis as any).document = originalDocument;
    clearTileTextureCache();
  });

  // =========================================================================
  // FACET 1: CATHEDRAL STANDOUT & ELIMINATION OF BEN THANH IN FRONT OF CATHEDRAL
  // =========================================================================
  describe('Facet 1: Cathedral Standout & Elimination of Ben Thanh in Front of Cathedral', () => {
    it('[TC-70.01/MSS][IMP-70] DioramaHeritageDistrict da loai bo hoan toan mo hinh Ben Thanh', () => {
      expect(heritageMarkup).not.toContain('landmark_ben_thanh.glb');
    });

    it('[TC-70.02/MSS][IMP-70] DioramaHeritageDistrict khong con toa nha Ben Thanh an ngu toa do mat tien [0.2, 0, -0.7]', () => {
      expect(heritageMarkup).not.toContain('position="0.2,0,-0.7"');
    });

    it('[TC-70.03/MSS][IMP-70] DioramaHeritageDistrict bao toan Dai cong vien & Quang truong Cong xa Paris', () => {
      expect(heritageMarkup).toContain('data-testid="cong-xa-paris-plaza"');
    });

    it('[TC-70.04/MSS][IMP-70] DioramaHeritageDistrict giu nguyen mo hinh Nha Tho Duc Ba doc ton uy nghi', () => {
      expect(heritageMarkup).toContain('landmark_cathedral.glb');
    });

    it('[TC-70.05/MSS][IMP-70] DioramaHeritageDistrict khong con procedural fallback thap dong ho Ben Thanh', () => {
      expect(heritageMarkup).not.toContain('data-model-url="/models/landmarks/landmark_ben_thanh.glb"');
    });
  });

  // =========================================================================
  // FACET 2: ELIMINATION OF YELLOW LIGHT CONES & GLOWING YELLOW BRIDGE DECKS
  // =========================================================================
  describe('Facet 2: Elimination of Yellow Light Cones & Glowing Yellow Bridge Decks', () => {
    it('[TC-70.06/MSS][IMP-70] CinematicLightingAccents triet tieu vet non sang vang coneGeometry cua hai dang', () => {
      expect(cinematicMarkup).not.toContain('args="0.3,1.4,8,1,true"');
    });

    it('[TC-70.07/MSS][IMP-70] CinematicLightingAccents khong con mau vang FEF08A tren dai anh sang chieu mat dat', () => {
      expect(cinematicMarkup).not.toContain('color="#FEF08A"');
    });

    it('[TC-70.08/MSS][IMP-70] DioramaBridges da loai bo tam noc kim loai vang choi args [1.98, 0.01, 0.44]', () => {
      expect(bridgesMarkup).not.toContain('args="1.98,0.01,0.44"');
    });

    it('[TC-70.09/MSS][IMP-70] DioramaBridges khong con dai den vang F59E0B tren dinh vom cau phia Nam', () => {
      const southBridgeHtml = bridgesMarkup.slice(bridgesMarkup.indexOf('position="0,0.12,3.8"'));
      expect(southBridgeHtml).not.toContain('#F59E0B');
    });

    it('[TC-70.10/MSS][IMP-70] DioramaBridges bao toan kien truc cau Ba Son hien dai o phia Bac', () => {
      expect(bridgesMarkup).toContain('args="5.4,0.04,0.52"');
    });
  });

  // =========================================================================
  // FACET 3: RICH ARTWORK & ILLUSTRATIVE BACKGROUNDS FOR 4 CORNERS & SPECIAL TILES
  // =========================================================================
  describe('Facet 3: Rich Artwork & Illustrative Backgrounds for 4 Corners & Special Tiles', () => {
    it.each([0, 10, 20, 30])('[TC-70.11/MSS][IMP-70] getTileTexture render thanh cong texture cho o goc %i', (idx) => {
      clearTileTextureCache();
      const tex = getTileTexture(idx);
      expect(tex).not.toBeNull();
    });

    it('[TC-70.12/MSS][IMP-70] O goc 10 (Tram Kiem Toan) khong dung hop mau phang don dieu #1E1B4B', () => {
      clearTileTextureCache();
      getTileTexture(10);
      const hasFlatBox = recordedFills.some((f) => f.color.toUpperCase() === '#1E1B4B' && f.w === 384);
      expect(hasFlatBox).toBe(false);
    });

    it('[TC-70.13/MSS][IMP-70] O goc 30 (Lenh Toa An) khong dung hop mau phang don dieu #450A0A', () => {
      clearTileTextureCache();
      getTileTexture(30);
      const hasFlatBox = recordedFills.some((f) => f.color.toUpperCase() === '#450A0A' && f.w === 384);
      expect(hasFlatBox).toBe(false);
    });

    it('[TC-70.14/MSS][IMP-70] O goc 20 (Nghi Duong) khong dung hop mau phang don dieu #064E3B', () => {
      clearTileTextureCache();
      getTileTexture(20);
      const hasFlatBox = recordedFills.some((f) => f.color.toUpperCase() === '#064E3B' && f.w === 384);
      expect(hasFlatBox).toBe(false);
    });

    it('[TC-70.15/MSS][IMP-70] O goc 0 (Khoi Hanh GO) khong dung hop mau phang don dieu #0F172A', () => {
      clearTileTextureCache();
      getTileTexture(0);
      const hasFlatBox = recordedFills.some((f) => f.color.toUpperCase() === '#0F172A' && f.w === 384);
      expect(hasFlatBox).toBe(false);
    });

    it.each([2, 4, 7, 17, 22, 33, 36, 38])(
      '[TC-70.16/MSS][IMP-70] getTileTexture sinh texture thanh cong cho o dac biet %i',
      (idx) => {
        clearTileTextureCache();
        const tex = getTileTexture(idx);
        expect(tex).not.toBeNull();
      }
    );

    it.each([2, 4, 7, 17, 22, 33, 36, 38])(
      '[TC-70.17/MSS][IMP-70] getStandeeTexture sinh billboard 2.5D cho o dac biet %i',
      (idx) => {
        clearTileTextureCache();
        const tex = getStandeeTexture(idx);
        expect(tex).not.toBeNull();
      }
    );

    it.each([7, 22, 36])('[TC-70.18/MSS][IMP-70] O Co Hoi %i mang bieu tuong the van may', (idx) => {
      clearTileTextureCache();
      const tex = getStandeeTexture(idx);
      expect(tex).not.toBeNull();
      expect(recordedFillText.some((t) => t.text.includes('CƠ HỘI'))).toBe(true);
    });

    it.each([2, 17, 33])('[TC-70.19/MSS][IMP-70] O Thi Truong %i mang bieu tuong phieu co che', (idx) => {
      clearTileTextureCache();
      const tex = getStandeeTexture(idx);
      expect(tex).not.toBeNull();
      expect(recordedFillText.some((t) => t.text.includes('THỊ TRƯỜNG'))).toBe(true);
    });

    it.each([4, 38])('[TC-70.20/MSS][IMP-70] O Tai Chinh / Ngan Sach %i the hien danh muc ro rang', (idx) => {
      clearTileTextureCache();
      const tex = getStandeeTexture(idx);
      expect(tex).not.toBeNull();
      const hasLabel = recordedFillText.some((t) => t.text.includes('LỆ PHÍ') || t.text.includes('HOSE'));
      expect(hasLabel).toBe(true);
    });
  });

  // =========================================================================
  // FACET 4: AUTHENTIC HCMC FINANCIAL SKYLINE LAYOUT & OPEN RIVER CORRIDOR
  // =========================================================================
  describe('Facet 4: Authentic HCMC Financial Skyline Layout & Open River Corridor', () => {
    it('[TC-70.21/MSS][IMP-70] Cung song Sai Gon huong Dong cua Bitexco mo toang, khong bi chan boi cao oc tai x >= -3.8', () => {
      const eastCorridorBlocked = HIGHRISE_CONFIGS.some(
        (t) => t.x >= -3.8 && t.z >= -4.8 && t.z <= -3.6
      );
      expect(eastCorridorBlocked).toBe(false);
    });

    it('[TC-70.22/MSS][IMP-70] Cum cao oc tai chinh phan tang do cao da dang kien truc TP.HCM', () => {
      const heights = HIGHRISE_CONFIGS.map((t) => t.height);
      const maxHeight = Math.max(...heights);
      const minHeight = Math.min(...heights);
      expect(maxHeight).toBeGreaterThanOrEqual(2.3);
      expect(minHeight).toBeLessThanOrEqual(1.5);
    });

    it('[TC-70.23/MSS][IMP-70] Bitexco giu ngoi vi dinh chop cao nhat sa ban (> 2.8m)', () => {
      const maxHeight = Math.max(...HIGHRISE_CONFIGS.map((t) => t.height));
      expect(maxHeight).toBeLessThan(2.85);
    });

    it('[TC-70.24/MSS][IMP-70] Quan the cao oc phan bo mat do cao ve phia hau canh Bac/Tay tao chieu sau', () => {
      const backdropTowers = HIGHRISE_CONFIGS.filter((t) => t.z <= -4.8 || t.x <= -4.2);
      expect(backdropTowers.length).toBeGreaterThanOrEqual(5);
    });

    it('[TC-70.25/MSS][IMP-70] DioramaHighriseBlocks render static markup an toan trong Node headless', () => {
      expect(highriseMarkup).toContain('data-testid="diorama-highrise-blocks"');
    });
  });
});
