// [TC-IMP80/MSS][UC-IMP80] Contract Test Suite: Daylight Zoom Illumination, Retropoly Natural Island Palette & Unified Title Deed Typography
// Universal 4-Facet Behavioral Matrix Verification:
// Facet 1: Title Deed Typography Unification (White text & dark outline across all properties)
// Facet 2: Balanced Daylight Atmosphere & Fill Light System
// Facet 3: Retropoly Natural Island Palette (Fine Ivory Sand & Lush Green Lawn)
// Facet 4: Post-Processing Anti-Black-Crush (Soft AO & Film Tone)

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  getTileTexture,
  getBannerTextColor,
  clearTileTextureCache,
} from '../../src/client/3d/tile_texture_generator';
import { TIME_OF_DAY_PRESETS } from '../../src/client/store/environment_store';
import { DEFAULT_PIPELINE_CONFIG } from '../../src/client/3d/post_processing_pipeline';

interface RecordedFillText {
  text: string;
  x: number;
  y: number;
  font: string;
  fillStyle: string;
}

interface RecordedStrokeText {
  text: string;
  x: number;
  y: number;
  font: string;
  strokeStyle: string;
  lineWidth: number;
}

interface MockCanvasRenderingContext2D {
  canvas: { width: number; height: number };
  save: ReturnType<typeof vi.fn>;
  restore: ReturnType<typeof vi.fn>;
  beginPath: ReturnType<typeof vi.fn>;
  closePath: ReturnType<typeof vi.fn>;
  clip: ReturnType<typeof vi.fn>;
  fill: ReturnType<typeof vi.fn>;
  stroke: ReturnType<typeof vi.fn>;
  scale: ReturnType<typeof vi.fn>;
  translate: ReturnType<typeof vi.fn>;
  moveTo: ReturnType<typeof vi.fn>;
  lineTo: ReturnType<typeof vi.fn>;
  drawImage: ReturnType<typeof vi.fn>;
  rect: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
  strokeRect: ReturnType<typeof vi.fn>;
  roundRect: ReturnType<typeof vi.fn>;
  arc: ReturnType<typeof vi.fn>;
  quadraticCurveTo: ReturnType<typeof vi.fn>;
  bezierCurveTo: ReturnType<typeof vi.fn>;
  ellipse: ReturnType<typeof vi.fn>;
  clearRect: ReturnType<typeof vi.fn>;
  fillStyle: string;
  strokeStyle: string;
  lineWidth: number;
  font: string;
  textAlign: string;
  textBaseline: string;
  fillText: ReturnType<typeof vi.fn>;
  strokeText: ReturnType<typeof vi.fn>;
}

interface MockCanvasElement {
  width: number;
  height: number;
  getContext: (type: string) => MockCanvasRenderingContext2D | null;
}

interface MockDocument {
  createElement: (tagName: string) => MockCanvasElement | Record<string, unknown>;
}

interface MockGlobal {
  document?: unknown;
}

const mockEnv = globalThis as MockGlobal;

describe('[TC-IMP80/MSS][UC-IMP80] Daylight Zoom Illumination & Unified Tile Art Suite', () => {
  let originalDocument: unknown;
  let recordedFillText: RecordedFillText[] = [];
  let recordedStrokeText: RecordedStrokeText[] = [];
  let currentFont = '';
  let currentFillStyle = '';
  let currentStrokeStyle = '';
  let currentLineWidth = 1;

  beforeEach(() => {
    originalDocument = mockEnv.document;
    recordedFillText = [];
    recordedStrokeText = [];
    clearTileTextureCache();

    const mockCtx: MockCanvasRenderingContext2D = {
      canvas: { width: 1024, height: 1360 },
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      clip: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      scale: vi.fn(),
      translate: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      drawImage: vi.fn(),
      rect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      roundRect: vi.fn(),
      arc: vi.fn(),
      quadraticCurveTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      ellipse: vi.fn(),
      clearRect: vi.fn(),
      set fillStyle(val: string) {
        currentFillStyle = val;
      },
      get fillStyle() {
        return currentFillStyle;
      },
      set strokeStyle(val: string) {
        currentStrokeStyle = val;
      },
      get strokeStyle() {
        return currentStrokeStyle;
      },
      set lineWidth(val: number) {
        currentLineWidth = val;
      },
      get lineWidth() {
        return currentLineWidth;
      },
      set font(val: string) {
        currentFont = val;
      },
      get font() {
        return currentFont;
      },
      textAlign: 'center',
      textBaseline: 'middle',
      fillText: vi.fn((text: string, x: number, y: number) => {
        recordedFillText.push({
          text,
          x,
          y,
          font: currentFont,
          fillStyle: currentFillStyle,
        });
      }),
      strokeText: vi.fn((text: string, x: number, y: number) => {
        recordedStrokeText.push({
          text,
          x,
          y,
          font: currentFont,
          strokeStyle: currentStrokeStyle,
          lineWidth: currentLineWidth,
        });
      }),
    };

    const mockCanvas: MockCanvasElement = {
      width: 1024,
      height: 1360,
      getContext: vi.fn((type: string) => {
        if (type === '2d') return mockCtx;
        return null;
      }),
    };

    const mockDoc: MockDocument = {
      createElement: vi.fn((tagName: string) => {
        if (tagName === 'canvas') return mockCanvas;
        return {};
      }),
    };

    mockEnv.document = mockDoc;
  });

  afterEach(() => {
    mockEnv.document = originalDocument;
    clearTileTextureCache();
  });

  // =========================================================================
  // FACET 1: TITLE DEED TYPOGRAPHY UNIFICATION (WHITE TEXT ON ALL PROPERTIES)
  // =========================================================================
  describe('Facet 1: Title Deed Typography Unification', () => {
    it('[TC-80.01/MSS][IMP-80] Tile 16 Bình Định (Orange #FF8C42) renders unified bold white title #FFFFFF', () => {
      getTileTexture(16);
      const titleEntry = recordedFillText.find((t) => t.y === 28);
      expect(titleEntry).toBeDefined();
      expect(titleEntry?.fillStyle).toBe('#FFFFFF');
    });

    it('[TC-80.02/MSS][IMP-80] Tile 26 Hải Phòng (Yellow #F1C40F) renders unified bold white title #FFFFFF', () => {
      getTileTexture(26);
      const titleEntry = recordedFillText.find((t) => t.y === 28);
      expect(titleEntry).toBeDefined();
      expect(titleEntry?.fillStyle).toBe('#FFFFFF');
    });

    it('[TC-80.03/MSS][IMP-80] Tile 18 Thanh Hóa (Pink #EC4899) renders bold white title #FFFFFF', () => {
      getTileTexture(18);
      const titleEntry = recordedFillText.find((t) => t.y === 28);
      expect(titleEntry).toBeDefined();
      expect(titleEntry?.fillStyle).toBe('#FFFFFF');
    });

    it('[TC-80.04/MSS][IMP-80] Tile 1 Cần Thơ (Brown #8B5A2B) renders bold white title #FFFFFF', () => {
      getTileTexture(1);
      const titleEntry = recordedFillText.find((t) => t.y === 28);
      expect(titleEntry).toBeDefined();
      expect(titleEntry?.fillStyle).toBe('#FFFFFF');
    });

    it('[TC-80.05/MSS][IMP-80] Tile 6 Đà Nẵng (Cyan #38BDF8) renders bold white title #FFFFFF', () => {
      getTileTexture(6);
      const titleEntry = recordedFillText.find((t) => t.y === 28);
      expect(titleEntry).toBeDefined();
      expect(titleEntry?.fillStyle).toBe('#FFFFFF');
    });

    it('[TC-80.06/MSS][IMP-80] Tile 11 Huế (Magenta #D946EF) renders bold white title #FFFFFF', () => {
      getTileTexture(11);
      const titleEntry = recordedFillText.find((t) => t.y === 28);
      expect(titleEntry).toBeDefined();
      expect(titleEntry?.fillStyle).toBe('#FFFFFF');
    });

    it('[TC-80.07/MSS][IMP-80] Tile 21 Quảng Ninh (Red #EF4444) renders bold white title #FFFFFF', () => {
      getTileTexture(21);
      const titleEntry = recordedFillText.find((t) => t.y === 28);
      expect(titleEntry).toBeDefined();
      expect(titleEntry?.fillStyle).toBe('#FFFFFF');
    });

    it('[TC-80.08/MSS][IMP-80] Tile 39 Tràng Tiền (Dark Blue #1D4ED8) renders bold white title #FFFFFF', () => {
      getTileTexture(39);
      const titleEntry = recordedFillText.find((t) => t.y === 28);
      expect(titleEntry).toBeDefined();
      expect(titleEntry?.fillStyle).toBe('#FFFFFF');
    });

    it('[TC-80.09/MSS][IMP-80] Property title text stroke uses dark charcoal outline to ensure contrast on bright banners', () => {
      getTileTexture(16); // Bình Định
      const strokeEntry = recordedStrokeText.find((t) => t.y === 28);
      expect(strokeEntry).toBeDefined();
      expect(strokeEntry?.lineWidth).toBeGreaterThanOrEqual(2.5);
    });

    it('[TC-80.10/MSS][IMP-80] getBannerTextColor retains dark charcoal #090D1A exclusively for ivory white #FFFDF5', () => {
      expect(getBannerTextColor('#FFFDF5')).toBe('#090D1A');
      expect(getBannerTextColor('#FF8C42')).toBe('#FFFFFF');
      expect(getBannerTextColor('#F1C40F')).toBe('#FFFFFF');
    });
  });

  // =========================================================================
  // FACET 2: BALANCED DAYLIGHT ATMOSPHERE & FILL LIGHT SYSTEM
  // =========================================================================
  describe('Facet 2: Balanced Daylight Atmosphere & Fill Light System', () => {
    it('[TC-80.11/MSS][IMP-80] TIME_OF_DAY_PRESETS.day.ambientIntensity is calibrated at 0.20 for illuminated midtones', () => {
      expect(TIME_OF_DAY_PRESETS.day.ambientIntensity).toBe(0.20);
    });

    it('[TC-80.12/MSS][IMP-80] TIME_OF_DAY_PRESETS.day.hemiIntensity is calibrated at 0.14 for soft sky fill', () => {
      expect(TIME_OF_DAY_PRESETS.day.hemiIntensity).toBe(0.14);
    });

    it('[TC-80.13/MSS][IMP-80] TIME_OF_DAY_PRESETS.day.hemiGroundColor uses coastal lawn reflection without yellow hue', () => {
      expect(TIME_OF_DAY_PRESETS.day.hemiGroundColor).toBe('#DCFCE7');
    });

    it('[TC-80.14/MSS][IMP-80] TimeOfDayLighting source code contains daylight top-down fill light for zoom clarity', () => {
      const filePath = path.resolve('src/client/3d/time_of_day_lighting.tsx');
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('position={[0, 30, 0]}');
    });

    it('[TC-80.15/MSS][IMP-80] TimeOfDayLighting daytime rim light uses cool crisp sun-rim color #F8FAFC', () => {
      const filePath = path.resolve('src/client/3d/time_of_day_lighting.tsx');
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain("phase === 'night' ? '#38BDF8' : phase === 'sunset' ? '#EA580C' : '#F8FAFC'");
    });
  });

  // =========================================================================
  // FACET 3: RETROPOLY NATURAL ISLAND PALETTE (FINE IVORY SAND & LUSH GREEN LAWN)
  // =========================================================================
  describe('Facet 3: Retropoly Natural Island Palette', () => {
    it('[TC-80.16/MSS][IMP-80] CoastalIslandEnvironment uses fine natural ivory sand #EFE5D8 for shoreline', () => {
      const filePath = path.resolve('src/client/3d/coastal_island_environment.tsx');
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('color="#EFE5D8"');
    });

    it('[TC-80.17/MSS][IMP-80] CoastalIslandEnvironment completely eliminates artificial mustard yellow #FDE68A', () => {
      const filePath = path.resolve('src/client/3d/coastal_island_environment.tsx');
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).not.toContain('#FDE68A');
    });

    it('[TC-80.18/MSS][IMP-80] CoastalIslandEnvironment renders lush tropical green lawn plateau #22C55E around board', () => {
      const filePath = path.resolve('src/client/3d/coastal_island_environment.tsx');
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('color="#22C55E"');
    });

    it('[TC-80.19/MSS][IMP-80] CoastalIslandEnvironment uses soft ivory sand #F3EBE1 for upper shoreline accents', () => {
      const filePath = path.resolve('src/client/3d/coastal_island_environment.tsx');
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('color="#F3EBE1"');
    });
  });

  // =========================================================================
  // FACET 4: POST-PROCESSING ANTI-BLACK-CRUSH (SOFT AO & FILM TONE)
  // =========================================================================
  describe('Facet 4: Post-Processing Anti-Black-Crush', () => {
    it('[TC-80.20/MSS][IMP-80] DEFAULT_PIPELINE_CONFIG.aoIntensity is softened to <= 0.40 to prevent close-up shadow crush', () => {
      expect(DEFAULT_PIPELINE_CONFIG.aoIntensity).toBeLessThanOrEqual(0.40);
      expect(DEFAULT_PIPELINE_CONFIG.aoIntensity).toBe(0.38);
    });

    it('[TC-80.21/MSS][IMP-80] PostProcessingPipeline N8AO uses soft slate tone #1E293B instead of pitch black #0B0F19', () => {
      const filePath = path.resolve('src/client/3d/post_processing_pipeline.tsx');
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('color="#1E293B"');
      expect(content).not.toContain('color="#0B0F19"');
    });
  });
});
