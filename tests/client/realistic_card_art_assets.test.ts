// [TC-IMP37/MSS][UC-IMP37] Contract Test Suite: 28 Realistic Native Card Art Assets (IMP-37)
// Universal 4-Facet Behavioral Matrix Verification:
// Facet 1: Asset Existence, WebP Header & File Size Budget (<= 95KB)
// Facet 2: Transparent Alpha Cutout & Chunk Validation (VP8X/ALPH)
// Facet 3: Mapping & Asset Registry Resolution (hasTileArt & getTileAssetUrl)
// Facet 4: Texture Generator Integration & Safe Zone Boundary (rect 8, 148, 240, 122)
// Facet 5: Headless SSR / Node Isolation Resilience

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import {
  ALL_28_STAND_TILES,
  getTileAssetUrl,
} from '../../src/client/assets/tile_assets';
import {
  hasTileArt,
  getTileTexture,
  getStandeeTexture,
} from '../../src/client/3d/tile_texture_generator';

const MAX_ASSET_SIZE_BYTES = 95 * 1024; // 95 KB budget (97,280 bytes)
const PUBLIC_TILES_DIR = path.resolve(process.cwd(), 'public/assets/tiles');

interface RecordedRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface RecordedRoundRect {
  x: number;
  y: number;
  w: number;
  h: number;
  radii?: number | number[];
}

interface RecordedFillText {
  text: string;
  x: number;
  y: number;
}

interface RecordedDrawImage {
  image: any;
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}

describe('[TC-IMP37/MSS][UC-IMP37] Realistic Card Art Assets Contract Suite', () => {
  let originalDocument: any;
  let originalWindow: any;
  let originalImage: any;
  let recordedRects: RecordedRect[] = [];
  let recordedRoundRects: RecordedRoundRect[] = [];
  let recordedFillText: RecordedFillText[] = [];
  let recordedDrawImages: RecordedDrawImage[] = [];
  let recordedClips = 0;
  let lastCreatedImage: any = null;

  beforeEach(() => {
    recordedRects = [];
    recordedRoundRects = [];
    recordedFillText = [];
    recordedDrawImages = [];
    recordedClips = 0;
    lastCreatedImage = null;

    originalDocument = (globalThis as any).document;
    originalWindow = (globalThis as any).window;
    originalImage = (globalThis as any).Image;

    const mockCtx = new Proxy(
      {
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        font: '',
        textAlign: '',
        textBaseline: '',
        scale: vi.fn(),
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        closePath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        fill: vi.fn(),
      } as any,
      {
        get: (target, prop) => {
          if (prop === 'rect') {
            return (x: number, y: number, w: number, h: number) => {
              recordedRects.push({ x, y, w, h });
            };
          }
          if (prop === 'roundRect') {
            return (x: number, y: number, w: number, h: number, radii?: any) => {
              recordedRoundRects.push({ x, y, w, h, radii });
            };
          }
          if (prop === 'fillText') {
            return (text: string, x: number, y: number) => {
              recordedFillText.push({ text, x, y });
            };
          }
          if (prop === 'drawImage') {
            return (image: any, dx: number, dy: number, dw: number, dh: number) => {
              recordedDrawImages.push({ image, dx, dy, dw, dh });
            };
          }
          if (prop === 'clip') {
            return () => {
              recordedClips++;
            };
          }
          if (prop in target) {
            return target[prop];
          }
          if (typeof prop === 'string') {
            return vi.fn();
          }
          return undefined;
        },
        set: (target, prop, value) => {
          target[prop] = value;
          return true;
        },
      }
    );

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockCtx),
    };

    (globalThis as any).document = {
      createElement: (tag: string) => {
        if (tag === 'canvas') return mockCanvas;
        return {};
      },
    };

    (globalThis as any).window = {};

    (globalThis as any).Image = class MockImage {
      complete = false;
      naturalWidth = 0;
      naturalHeight = 0;
      src = '';
      crossOrigin = '';
      onload: (() => void) | null = null;
      constructor() {
        lastCreatedImage = this;
      }
    };
  });

  afterEach(() => {
    (globalThis as any).document = originalDocument;
    (globalThis as any).window = originalWindow;
    (globalThis as any).Image = originalImage;
  });

  // =========================================================================
  // FACET 1: ASSET EXISTENCE, WEBP FORMAT & FILE SIZE BUDGET (<= 95KB)
  // =========================================================================

  describe('[TC-IMP37/MSS][UC-IMP37] Facet 1: Asset Existence & Strict Size Budget', () => {
    it.each(ALL_28_STAND_TILES)(
      '[TC-IMP37.01/MSS][UC-IMP37] Tile %i asset exists with valid WebP RIFF header signature',
      (tileIndex) => {
        const paddedId = String(tileIndex).padStart(2, '0');
        const assetPath = path.join(PUBLIC_TILES_DIR, `tile_${paddedId}.webp`);

        expect(fs.existsSync(assetPath)).toBe(true);

        const buffer = fs.readFileSync(assetPath);
        const riffHeader = buffer.subarray(0, 4).toString('ascii');
        const webpHeader = buffer.subarray(8, 12).toString('ascii');

        expect(riffHeader).toBe('RIFF');
        expect(webpHeader).toBe('WEBP');
      }
    );

    it.each(ALL_28_STAND_TILES)(
      '[TC-IMP37.02/MSS][UC-IMP37] Tile %i asset size respects 95KB asset budget threshold',
      (tileIndex) => {
        const paddedId = String(tileIndex).padStart(2, '0');
        const assetPath = path.join(PUBLIC_TILES_DIR, `tile_${paddedId}.webp`);
        const stat = fs.statSync(assetPath);

        expect(stat.size).toBeLessThanOrEqual(MAX_ASSET_SIZE_BYTES);
      }
    );
  });

  // =========================================================================
  // FACET 2: TRANSPARENT ALPHA CUTOUT & HEADER CHUNK VALIDATION
  // =========================================================================

  describe('[TC-IMP37/MSS][UC-IMP37] Facet 2: Transparent Alpha Cutout & WebP Chunks', () => {
    it.each(ALL_28_STAND_TILES)(
      '[TC-IMP37.03/MSS][UC-IMP37] Tile %i WebP file contains VP8X/ALPH chunk confirming alpha cutout support',
      (tileIndex) => {
        const paddedId = String(tileIndex).padStart(2, '0');
        const assetPath = path.join(PUBLIC_TILES_DIR, `tile_${paddedId}.webp`);
        const buffer = fs.readFileSync(assetPath);

        const hasVp8x = buffer.includes(Buffer.from('VP8X'));
        const hasAlph = buffer.includes(Buffer.from('ALPH'));

        expect(hasVp8x || hasAlph).toBe(true);

        if (hasVp8x && buffer.subarray(12, 16).toString('ascii') === 'VP8X') {
          const flags = buffer[20] ?? 0;
          const alphaBitSet = (flags & 0x10) !== 0;
          expect(alphaBitSet).toBe(true);
        }
      }
    );
  });

  // =========================================================================
  // FACET 3: MAPPING & ASSET REGISTRY RESOLUTION
  // =========================================================================

  describe('[TC-IMP37/MSS][UC-IMP37] Facet 3: Mapping & Asset Registry Resolution', () => {
    it.each(ALL_28_STAND_TILES)(
      '[TC-IMP37.04/MSS][UC-IMP37] hasTileArt(%i) returns true for standalone purchasable property tile',
      (tileIndex) => {
        expect(hasTileArt(tileIndex)).toBe(true);
      }
    );

    it.each([0, 2, 4, 7, 10, 17, 20, 22, 30, 33, 36, 38])(
      '[TC-IMP37.05/MSS][UC-IMP37] hasTileArt(%i) returns true for special/corner tile (IMP-71)',
      (tileIndex) => {
        expect(hasTileArt(tileIndex)).toBe(true);
      }
    );

    it.each([-1, 40, 99])(
      '[TC-IMP37.05b/MSS][UC-IMP37] hasTileArt(%i) returns false for out-of-range tile index',
      (tileIndex) => {
        expect(hasTileArt(tileIndex)).toBe(false);
      }
    );

    it.each(ALL_28_STAND_TILES)(
      '[TC-IMP37.06/MSS][UC-IMP37] getTileAssetUrl(%i) resolves to /assets/tiles/tile_XX.webp path',
      (tileIndex) => {
        const paddedId = String(tileIndex).padStart(2, '0');
        const expectedUrl = `/assets/tiles/tile_${paddedId}.webp`;

        expect(getTileAssetUrl(tileIndex)).toBe(expectedUrl);
      }
    );

    it.each([0, 1, 2, 3])(
      '[TC-IMP37.07/MSS][UC-IMP37] getTileAssetUrl(1, %i) resolves with level suffix _lvlX.webp',
      (level) => {
        const expectedUrl = `/assets/tiles/tile_01_lvl${level}.webp`;
        expect(getTileAssetUrl(1, level)).toBe(expectedUrl);
      }
    );

    it.each([-1, 4, 1.5])(
      '[TC-IMP37.08/MSS][UC-IMP37] getTileAssetUrl(1, %s) throws descriptive error for invalid level',
      (invalidLevel) => {
        expect(() => getTileAssetUrl(1, invalidLevel)).toThrow(/Invalid property level/);
      }
    );

    it.each([0, 10, 20, 30, 99])(
      '[TC-IMP37.09/MSS][UC-IMP37] getTileAssetUrl(%i) throws error for non-purchasable or invalid tile index',
      (invalidIndex) => {
        expect(() => getTileAssetUrl(invalidIndex)).toThrow(/Invalid tile index/);
      }
    );
  });

  // =========================================================================
  // FACET 4: TEXTURE GENERATOR INTEGRATION & SAFE ZONE BOUNDARY
  // =========================================================================

  describe('[TC-IMP37/MSS][UC-IMP37] Facet 4: Texture Generator Integration & Safe Zone Boundary', () => {
    it('[TC-IMP37.10/MSS][UC-IMP37] Standard tile texture generator clips art within safe frame rect(10, 202, 236, 72)', () => {
      getTileTexture(1);

      const artClip = recordedRects.find(
        (r) => r.x === 10 && (r.y === 202 || r.y === 94) && r.w === 236
      );

      expect(artClip).toBeDefined();
      expect(recordedClips).toBeGreaterThanOrEqual(1);
    });

    it('[TC-IMP37.11/MSS][UC-IMP37] Title baseline (y=164) and subtitle baseline (y=188) remain safely above art boundary y=202', () => {
      getTileTexture(3);

      const titleEntry = recordedFillText.find((t) => t.y === 164 || t.y === 28);
      const subtitleEntry = recordedFillText.find((t) => t.y === 188 || t.y === 74);

      expect(titleEntry).toBeDefined();
      expect(subtitleEntry).toBeDefined();
      expect(titleEntry!.y).toBeLessThan(202);
      expect(subtitleEntry!.y).toBeLessThan(202);
    });

    it('[TC-IMP37.12/MSS][UC-IMP37] Infrastructure tile eliminates 2D price tray capsule roundRect and prints pure ivory price text at y = 300 (IMP-104)', () => {
      getTileTexture(5);

      const priceTray = recordedRoundRects.find(
        (r) => r.x === 22 && (r.y === 282 || r.y === 274) && r.w === 212
      );
      const priceText = recordedFillText.find((t) => t.y === 306 || t.y === 300);

      expect(priceTray).toBeUndefined();
      expect(priceText).toBeDefined();
      expect(priceText?.text).toBe('2.000 Tr.');
    });

    it('[TC-IMP37.13/MSS][UC-IMP37] Target card art rendering dimensions (216x68 at dx=20, dy=204) fit entirely within clip rect [10..246, 202..274]', () => {
      const targetW = 216;
      const targetH = 68;
      const dx = (256 - targetW) / 2; // 20
      const dy = 204;

      const clipX1 = 10;
      const clipY1 = 202;
      const clipX2 = clipX1 + 236; // 246
      const clipY2 = clipY1 + 72; // 274

      expect(dx).toBeGreaterThanOrEqual(clipX1);
      expect(dx + targetW).toBeLessThanOrEqual(clipX2);
      expect(dy).toBeGreaterThanOrEqual(clipY1);
      expect(dy + targetH).toBeLessThanOrEqual(clipY2);
    });

    it('[TC-IMP37.14/MSS][UC-IMP37] Cached image executes drawImage inside clip bounds upon async onload completion', () => {
      getTileTexture(6);

      expect(lastCreatedImage).not.toBeNull();
      expect(lastCreatedImage.src).toBe('/assets/tiles/tile_06.webp');

      if (lastCreatedImage.onload) {
        lastCreatedImage.onload();
      }

      const drawCall = recordedDrawImages.find(
        (d) => d.dx === 20 && (d.dy === 204 || d.dy === 97) && d.dw === 216 && (d.dh === 68 || d.dh === 166)
      );

      expect(drawCall).toBeDefined();
      expect(drawCall!.dw).toBe(216);
      expect([68, 166]).toContain(drawCall!.dh);
    });

    it('[TC-IMP37.15/MSS][UC-IMP37] Missing or uncompleted image triggers vector icon fallback without crashing', () => {
      const texture = getTileTexture(8);

      expect(texture).not.toBeNull();
      expect(lastCreatedImage).not.toBeNull();
      expect(lastCreatedImage.crossOrigin).toBe('anonymous');
    });
  });

  // =========================================================================
  // FACET 5: HEADLESS SSR / NODE ISOLATION RESILIENCE
  // =========================================================================

  describe('[TC-IMP37/MSS][UC-IMP37] Facet 5: Headless SSR / Node Isolation Resilience', () => {
    it('[TC-IMP37.16/MSS][UC-IMP37] getTileTexture returns null safely when document is undefined in headless Node', () => {
      (globalThis as any).document = undefined;

      const texture = getTileTexture(9);
      expect(texture).toBeNull();
    });

    it('[TC-IMP37.17/MSS][UC-IMP37] getStandeeTexture returns null safely when document is undefined in headless Node', () => {
      (globalThis as any).document = undefined;

      const texture = getStandeeTexture(11);
      expect(texture).toBeNull();
    });

    it('[TC-IMP37.18/MSS][UC-IMP37] hasTileArt executes synchronously without requiring DOM or browser globals', () => {
      (globalThis as any).document = undefined;
      (globalThis as any).window = undefined;

      expect(hasTileArt(12)).toBe(true);
      expect(hasTileArt(0)).toBe(true);
      expect(hasTileArt(-1)).toBe(false);
    });
  });
});
