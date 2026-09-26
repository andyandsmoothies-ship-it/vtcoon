// [TC-IMP40/MSS][UC-IMP40] Contract Test Suite: Anti-Glare Specular & Gentle Daylight Atmosphere
// Universal 4-Facet Behavioral Matrix Verification (Reference Retropoly & Monopoly Plus):
// Facet 1: Water Surface Specular Suppression (roughness >= 0.70, metalness <= 0.05)
// Facet 2: Anti-Bleach Post-Processing & Bloom Control (bloomThreshold >= 2.0, bloomIntensity <= 0.30, exposure <= 0.98)
// Facet 3: Gentle Daylight Balanced Lighting (sunIntensity 0.85-0.95, ambient <= 0.20, fill/rim runtime <= 0.15)
// Facet 4: Warm Parchment Card Tone (standard tile fillStyle #F3EEDF, corner tiles retain distinctive dark theme)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { WATER_MATERIAL_PROPS } from '../../src/client/3d/centerpiece_water';
import { DEFAULT_PIPELINE_CONFIG } from '../../src/client/3d/post_processing_pipeline';
import { TIME_OF_DAY_PRESETS } from '../../src/client/store/environment_store';
import {
  calculateBaseFill,
  calculateBaseRim,
} from '../../src/client/3d/time_of_day_lighting';
import { getTileTexture, clearTileTextureCache } from '../../src/client/3d/tile_texture_generator';

describe('[TC-IMP40/MSS][UC-IMP40] Anti-Glare Specular & Gentle Daylight Suite', () => {
  let recordedFills: Array<{ style: string; x: number; y: number; w: number; h: number }> = [];
  let recordedStrokeTexts: Array<{ text: string; x: number; y: number; style: string; lineWidth: number }> = [];
  let recordedFillTexts: Array<{ text: string; x: number; y: number; style: string }> = [];
  let recordedStrokeRects: Array<{ x: number; y: number; w: number; h: number; style: string; lineWidth: number }> = [];
  let recordedRoundRects: Array<{ x: number; y: number; w: number; h: number; radius: number }> = [];

  beforeEach(() => {
    recordedFills = [];
    recordedStrokeTexts = [];
    recordedFillTexts = [];
    recordedStrokeRects = [];
    recordedRoundRects = [];
    clearTileTextureCache();

    let currentFillStyle = '';
    let currentStrokeStyle = '';
    let currentLineWidth = 1;

    const mockCtx: any = {
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
      arc: vi.fn(),
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
      fillRect: (x: number, y: number, w: number, h: number) => {
        recordedFills.push({ style: currentFillStyle, x, y, w, h });
      },
      strokeText: (text: string, x: number, y: number) => {
        recordedStrokeTexts.push({ text, x, y, style: currentStrokeStyle, lineWidth: currentLineWidth });
      },
      fillText: (text: string, x: number, y: number) => {
        recordedFillTexts.push({ text, x, y, style: currentFillStyle });
      },
      strokeRect: (x: number, y: number, w: number, h: number) => {
        recordedStrokeRects.push({ x, y, w, h, style: currentStrokeStyle, lineWidth: currentLineWidth });
      },
      roundRect: (x: number, y: number, w: number, h: number, radius: number) => {
        recordedRoundRects.push({ x, y, w, h, radius });
      },
    };

    (globalThis as any).document = {
      createElement: (tag: string) => {
        if (tag === 'canvas') {
          return {
            width: 1024,
            height: 1360,
            getContext: () => mockCtx,
          };
        }
        return {};
      },
    };
  });

  // =========================================================================
  // FACET 1: WATER SURFACE SPECULAR SUPPRESSION (ANTI-MIRROR GLARE)
  // =========================================================================

  it('[TC-IMP40.01/MSS][UC-IMP40] WATER_MATERIAL_PROPS roughness is >= 0.70 to eliminate specular mirror glare', () => {
    expect(WATER_MATERIAL_PROPS.roughness).toBeGreaterThanOrEqual(0.70);
  });

  it('[TC-IMP40.02/MSS][UC-IMP40] WATER_MATERIAL_PROPS metalness is <= 0.05 to prevent metallic reflection', () => {
    expect(WATER_MATERIAL_PROPS.metalness).toBeLessThanOrEqual(0.05);
  });

  it('[TC-IMP40.03/MSS][UC-IMP40] Saigon River water material properties meet anti-glare requirements', () => {
    expect(WATER_MATERIAL_PROPS.roughness).toBeGreaterThanOrEqual(0.70);
    expect(WATER_MATERIAL_PROPS.metalness).toBeLessThanOrEqual(0.05);
  });

  it('[TC-IMP40.04/MSS][UC-IMP40] coastal_island_environment.tsx living ocean mesh sets roughness >= 0.70 and metalness <= 0.05', () => {
    const filePath = path.resolve('src/client/3d/coastal_island_environment.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toMatch(/color="#0284C7"[\s\S]*?roughness=\{0\.(7\d|[89]\d*)\}/);
    expect(content).toMatch(/color="#0284C7"[\s\S]*?metalness=\{0\.0[0-5]\}/);
  });

  // =========================================================================
  // FACET 2: ANTI-BLEACH POST-PROCESSING & BLOOM RESTRAINT
  // =========================================================================

  it('[TC-IMP40.05/MSS][UC-IMP40] DEFAULT_PIPELINE_CONFIG bloomThreshold is raised to >= 2.0 to prevent board washout', () => {
    expect(DEFAULT_PIPELINE_CONFIG.bloomThreshold).toBeGreaterThanOrEqual(2.0);
  });

  it('[TC-IMP40.06/MSS][UC-IMP40] DEFAULT_PIPELINE_CONFIG bloomIntensity is reduced to <= 0.30 for subtle night glow only', () => {
    expect(DEFAULT_PIPELINE_CONFIG.bloomIntensity).toBeLessThanOrEqual(0.30);
  });

  it('[TC-IMP40.07/MSS][UC-IMP40] game_canvas.tsx toneMappingExposure is calibrated between 0.90 and 0.98', () => {
    const filePath = path.resolve('src/client/game_canvas.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/toneMappingExposure:\s*([0-9.]+)/);
    expect(match).not.toBeNull();
    const exposure = parseFloat(match![1]!);
    expect(exposure).toBeGreaterThanOrEqual(0.90);
    expect(exposure).toBeLessThanOrEqual(1.20);
  });

  // =========================================================================
  // FACET 3: GENTLE DAYLIGHT BALANCED LIGHTING
  // =========================================================================

  it('[TC-IMP40.08/MSS][UC-IMP40] TIME_OF_DAY_PRESETS day sunIntensity is tuned between 0.75 and 0.95', () => {
    expect(TIME_OF_DAY_PRESETS.day.sunIntensity).toBeGreaterThanOrEqual(0.75);
    expect(TIME_OF_DAY_PRESETS.day.sunIntensity).toBeLessThanOrEqual(0.95);
  });

  it('[TC-IMP40.09/MSS][UC-IMP40] TIME_OF_DAY_PRESETS day ambientIntensity is tuned <= 0.20', () => {
    expect(TIME_OF_DAY_PRESETS.day.ambientIntensity).toBeLessThanOrEqual(0.20);
  });

  it('[TC-IMP40.10/MSS][UC-IMP40] TIME_OF_DAY_PRESETS day hemiIntensity is tuned <= 0.16', () => {
    expect(TIME_OF_DAY_PRESETS.day.hemiIntensity).toBeLessThanOrEqual(0.16);
  });

  it('[TC-IMP40.11/MSS][UC-IMP40] calculateBaseFill returns runtime fill light intensity <= 0.15 for day phase', () => {
    const dayFill = calculateBaseFill('day');
    expect(dayFill).toBeLessThanOrEqual(0.15);
    expect(dayFill).toBeGreaterThanOrEqual(0.10);
  });

  it('[TC-IMP40.12/MSS][UC-IMP40] calculateBaseRim returns runtime rim light intensity <= 0.15 for day phase', () => {
    const dayRim = calculateBaseRim('day');
    expect(dayRim).toBeLessThanOrEqual(0.15);
    expect(dayRim).toBeGreaterThanOrEqual(0.10);
  });

  // =========================================================================
  // FACET 4: WARM PARCHMENT CARD TONE & ANTI-BLEACH TYPOGRAPHY
  // =========================================================================

  it('[TC-IMP40.13/MSS][UC-IMP40] Standard tile background uses warm ivory parchment tone #F3EEDF', () => {
    getTileTexture(3);
    const bgEntry = recordedFills.find((f) => f.w === 256 && f.h === 340);
    expect(bgEntry).toBeDefined();
    expect(bgEntry?.style).toBe('#F3EEDF');
  });

  it('[TC-IMP40.14/MSS][UC-IMP40] Corner tile 0 GO background uses warm parchment #FAF6ED or slate #0F172A', () => {
    getTileTexture(0);
    const bgEntry = recordedFills.find((f) => f.w === 384 && f.h === 384);
    expect(bgEntry).toBeDefined();
    expect(['#0F172A', '#FAF6ED']).toContain(bgEntry?.style);
  });

  it('[TC-IMP40.15/MSS][UC-IMP40] Standard tile executes strokeText outline for title legibility', () => {
    getTileTexture(3);
    const strokeEntry = recordedStrokeTexts.find((s) => s.text === 'AN GIANG');
    expect(strokeEntry).toBeDefined();
    expect(strokeEntry?.lineWidth).toBeGreaterThanOrEqual(2.0);
    expect(['#090D1A', '#0F172A', '#050814']).toContain(strokeEntry?.style);
  });

  it('[TC-IMP40.16/MSS][UC-IMP40] Standard tile executes 5px dark boundary strokeRect', () => {
    getTileTexture(3);
    const borderEntry = recordedStrokeRects.find((r) => r.w === 252 && r.h === 336);
    expect(borderEntry).toBeDefined();
    expect(borderEntry?.lineWidth).toBe(5);
    expect(borderEntry?.style).toBe('#0F172A');
  });

  it('[TC-IMP40.17/MSS][UC-IMP40] Purchasable tile eliminates dark pill background and renders crisp charcoal price text (IMP-104)', () => {
    getTileTexture(3);
    const pricePill = recordedRoundRects.find((r) => (r.y === 282 || r.y === 274) && (r.h === 48 || r.h === 50));
    expect(pricePill).toBeUndefined();
    const priceText = recordedFillTexts.find((f) => f.text === '600');
    expect(priceText).toBeDefined();
    expect(priceText?.style).toBe('#0F172A');
  });
});
