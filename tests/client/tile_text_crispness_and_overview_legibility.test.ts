// [TC-IMP38/MSS][UC-IMP38] Contract Test Suite: Tile Text Crispness & Overview Legibility
// Universal 4-Facet Behavioral Matrix Verification:
// Facet 1: Crisp Title, Subtitle & Price Tray Typography (tile_texture_generator.ts)
// Facet 2: Hardware Anisotropy & Mipmap Filtering (LinearMipmapLinearFilter & anisotropy 16)
// Facet 3: Post-Processing Pipeline DoF Overview Crispness (post_processing_pipeline.tsx)
// Facet 4: Overview & Pre-Match Camera Legibility (camera_state_machine.ts & game_canvas.tsx)

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LinearFilter, LinearMipmapLinearFilter } from 'three';
import {
  getTileTexture,
  getStandeeTexture,
  clearTileTextureCache,
} from '../../src/client/3d/tile_texture_generator';
import { DEFAULT_PIPELINE_CONFIG } from '../../src/client/3d/post_processing_pipeline';
import {
  CAMERA_CONFIG,
  calculateTargetCameraState,
} from '../../src/client/3d/camera_state_machine';

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

interface RecordedRoundRect {
  x: number;
  y: number;
  w: number;
  h: number;
  radii?: number | number[];
}

describe('[TC-IMP38/MSS][UC-IMP38] Tile Text Crispness & Overview Legibility Suite', () => {
  let originalDocument: any;
  let recordedFillText: RecordedFillText[] = [];
  let recordedStrokeText: RecordedStrokeText[] = [];
  let recordedRoundRects: RecordedRoundRect[] = [];
  let currentFont = '';
  let currentFillStyle = '';
  let currentStrokeStyle = '';
  let currentLineWidth = 1;

  beforeEach(() => {
    originalDocument = (globalThis as any).document;
    recordedFillText = [];
    recordedStrokeText = [];
    recordedRoundRects = [];
    currentFont = '';
    currentFillStyle = '';
    currentStrokeStyle = '';
    currentLineWidth = 1;
    clearTileTextureCache();

    const targetObj: Record<string | symbol, any> = {
      canvas: { width: 1024, height: 1360 },
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      clip: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      rect: vi.fn(),
      scale: vi.fn(),
      drawImage: vi.fn(),
    };

    const mockCtx: any = new Proxy(
      targetObj,
      {
        get: (target, prop) => {
          if (prop === 'font') return currentFont;
          if (prop === 'fillStyle') return currentFillStyle;
          if (prop === 'strokeStyle') return currentStrokeStyle;
          if (prop === 'lineWidth') return currentLineWidth;
          if (prop === 'fillText') {
            return (text: string, x: number, y: number) => {
              recordedFillText.push({
                text,
                x,
                y,
                font: currentFont,
                fillStyle: currentFillStyle,
              });
            };
          }
          if (prop === 'strokeText') {
            return (text: string, x: number, y: number) => {
              recordedStrokeText.push({
                text,
                x,
                y,
                font: currentFont,
                strokeStyle: currentStrokeStyle,
                lineWidth: currentLineWidth,
              });
            };
          }
          if (prop === 'roundRect') {
            return (x: number, y: number, w: number, h: number, radii?: any) => {
              recordedRoundRects.push({ x, y, w, h, radii });
            };
          }
          if (prop in target) {
            return target[prop];
          }
          if (typeof prop === 'string') {
            return (..._args: any[]) => {};
          }
          return undefined;
        },
        set: (target, prop, value) => {
          if (prop === 'font') currentFont = value;
          if (prop === 'fillStyle') currentFillStyle = value;
          if (prop === 'strokeStyle') currentStrokeStyle = value;
          if (prop === 'lineWidth') currentLineWidth = value;
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
  });

  afterEach(() => {
    (globalThis as any).document = originalDocument;
    clearTileTextureCache();
  });

  // =========================================================================
  // FACET 1: TILE TEXT CRISPNESS & POSITIONING (tile_texture_generator.ts)
  // =========================================================================

  it('[TC-IMP38.01/MSS][UC-IMP38] Standard tile renders title with fillStyle #FFFFFF on dark banner', () => {
    getTileTexture(1); // Cần Thơ (nâu đậm)
    const titleEntry = recordedFillText.find((t) => t.y === 28);
    expect(titleEntry).toBeDefined();
    expect(titleEntry?.fillStyle).toBe('#FFFFFF');
  });

  it('[TC-IMP38.01b/MSS][UC-IMP38][IMP-80] Standard tile renders title with unified fillStyle #FFFFFF even for bright yellow banner', () => {
    getTileTexture(26); // Hải Phòng (vàng tươi)
    const titleEntry = recordedFillText.find((t) => t.y === 28);
    expect(titleEntry).toBeDefined();
    expect(titleEntry?.fillStyle).toBe('#FFFFFF');
  });

  it('[TC-IMP38.02/MSS][UC-IMP38] Standard tile renders title with bold heavy font 900 28px', () => {
    getTileTexture(1);
    const titleEntry = recordedFillText.find((t) => t.y === 28);
    expect(titleEntry).toBeDefined();
    expect(titleEntry?.font).toContain('900 28px');
  });

  it('[TC-IMP38.03/MSS][UC-IMP38] Standard tile calls fillText for title inside banner at coordinates (128, 28)', () => {
    getTileTexture(3); // An Giang
    const titleEntry = recordedFillText.find((t) => t.x === 128 && t.y === 28);
    expect(titleEntry).toBeDefined();
  });

  it('[TC-IMP38.06/MSS][UC-IMP38] Standard tile renders subtitle with high-contrast rich black fillStyle #020617', () => {
    getTileTexture(1);
    const subEntry = recordedFillText.find((t) => t.y === 74);
    expect(subEntry).toBeDefined();
    expect(subEntry?.fillStyle).toBe('#020617');
  });

  it('[TC-IMP38.07/MSS][UC-IMP38] Standard tile renders subtitle with bold heavy font 900 18px', () => {
    getTileTexture(1);
    const subEntry = recordedFillText.find((t) => t.y === 74);
    expect(subEntry).toBeDefined();
    expect(subEntry?.font).toContain('900 18px');
  });

  it('[TC-IMP38.08/MSS][UC-IMP38] Standard tile calls fillText for subtitle below banner at coordinates (128, 74)', () => {
    getTileTexture(3);
    const subEntry = recordedFillText.find((t) => t.x === 128 && t.y === 74);
    expect(subEntry).toBeDefined();
  });

  it('[TC-IMP38.09/MSS][UC-IMP38] Purchasable tile eliminates 2D price tray roundRect (22, 274, 212, 50, 12)', () => {
    getTileTexture(1);
    const tray = recordedRoundRects.find(
      (r) => r.x === 22 && r.y === 274 && r.w === 212 && r.h === 50
    );
    expect(tray).toBeUndefined();
  });

  it('[TC-IMP38.10/MSS][UC-IMP38] Purchasable tile renders pure ivory price fillText at y = 300 in charcoal #0F172A (IMP-104)', () => {
    getTileTexture(1);
    const trayFill = recordedFillText.find((t) => t.y === 300);
    expect(trayFill).toBeDefined();
    expect(trayFill?.fillStyle).toBe('#0F172A');
  });

  it('[TC-IMP38.11/MSS][UC-IMP38] Non-property action tile renders action text with fillStyle #FFFFFF', () => {
    getTileTexture(7);
    const actionText = recordedFillText.find((t) => t.y === 300);
    expect(actionText).toBeDefined();
    expect(actionText?.fillStyle).toBe('#FFFFFF');
  });

  it('[TC-IMP38.12/MSS][UC-IMP38] Non-property action tile renders action text with font 900 20px', () => {
    getTileTexture(7);
    const actionText = recordedFillText.find((t) => t.y === 300);
    expect(actionText).toBeDefined();
    expect(actionText?.font).toContain('900 20px');
  });

  it('[TC-IMP38.13/MSS][UC-IMP38] Non-property action tile renders action text centered at coordinates (128, 300)', () => {
    getTileTexture(2);
    const actionText = recordedFillText.find((t) => t.x === 128 && t.y === 300);
    expect(actionText).toBeDefined();
  });

  // =========================================================================
  // FACET 2: HARDWARE ANISOTROPY & NATIVE SAMPLING (NO MIPMAP)
  // =========================================================================

  it('[TC-IMP38.14/MSS][UC-IMP38] Standard tile texture enables mipmap generation (generateMipmaps = true)', () => {
    const texture = getTileTexture(1);
    expect(texture).not.toBeNull();
    expect(texture?.generateMipmaps).toBe(true);
  });

  it('[TC-IMP38.15/MSS][UC-IMP38] Standard tile texture sets minFilter to LinearMipmapLinearFilter', () => {
    const texture = getTileTexture(1);
    expect(texture).not.toBeNull();
    expect(texture?.minFilter).toBe(LinearMipmapLinearFilter);
  });

  it('[TC-IMP38.16/MSS][UC-IMP38] Standard tile texture sets magFilter to LinearFilter', () => {
    const texture = getTileTexture(1);
    expect(texture).not.toBeNull();
    expect(texture?.magFilter).toBe(LinearFilter);
  });

  it('[TC-IMP38.17/MSS][UC-IMP38] Standard tile texture sets anisotropy to 16', () => {
    const texture = getTileTexture(1);
    expect(texture).not.toBeNull();
    expect(texture?.anisotropy).toBe(16);
  });

  it('[TC-IMP38.18/MSS][UC-IMP38] Standee texture enables mipmap generation (generateMipmaps = true)', () => {
    const texture = getStandeeTexture(5);
    expect(texture).not.toBeNull();
    expect(texture?.generateMipmaps).toBe(true);
  });

  it('[TC-IMP38.19/MSS][UC-IMP38] Standee texture sets minFilter to LinearMipmapLinearFilter', () => {
    const texture = getStandeeTexture(5);
    expect(texture).not.toBeNull();
    expect(texture?.minFilter).toBe(LinearMipmapLinearFilter);
  });

  it('[TC-IMP38.20/MSS][UC-IMP38] Standee texture sets anisotropy to 16', () => {
    const texture = getStandeeTexture(5);
    expect(texture).not.toBeNull();
    expect(texture?.anisotropy).toBe(16);
  });

  // =========================================================================
  // FACET 3: POST-PROCESSING PIPELINE DOF & LIGHTING LEGIBILITY
  // =========================================================================

  it('[TC-IMP38.21/MSS][UC-IMP38] DEFAULT_PIPELINE_CONFIG disables DoF (enableDof = false) for crisp overview', () => {
    expect(DEFAULT_PIPELINE_CONFIG.enableDof).toBe(false);
  });

  it('[TC-IMP38.22/MSS][UC-IMP38] DEFAULT_PIPELINE_CONFIG expands dofFocusRange to 320.0', () => {
    expect(DEFAULT_PIPELINE_CONFIG.dofFocusRange).toBe(320.0);
  });

  it('[TC-IMP38.23/MSS][UC-IMP38] DEFAULT_PIPELINE_CONFIG sets dofBokehScale to 0.0', () => {
    expect(DEFAULT_PIPELINE_CONFIG.dofBokehScale).toBe(0.0);
  });

  it('[TC-IMP38.23b/MSS][UC-IMP38] DEFAULT_PIPELINE_CONFIG sets subtle vignetteDarkness <= 0.20 to prevent outer tile dimming', () => {
    expect(DEFAULT_PIPELINE_CONFIG.vignetteDarkness).toBeLessThanOrEqual(0.20);
  });

  it('[TC-IMP38.23c/MSS][UC-IMP38] DEFAULT_PIPELINE_CONFIG keeps aoIntensity <= 0.80 to avoid darkening flat tile surfaces', () => {
    expect(DEFAULT_PIPELINE_CONFIG.aoIntensity).toBeLessThanOrEqual(0.80);
  });

  // =========================================================================
  // FACET 4: OVERVIEW & PRE-MATCH CAMERA CALIBRATION (CLOSER 20% FOR RETROPOLY SCALE)
  // =========================================================================

  it('[TC-IMP38.24/MSS][UC-IMP38] CAMERA_CONFIG overview position is calibrated to [24.6, 25.3, 24.6]', () => {
    expect(CAMERA_CONFIG.overview.position).toEqual([24.6, 25.3, 24.6]);
  });

  it('[TC-IMP38.25/MSS][UC-IMP38] CAMERA_CONFIG overview target is calibrated to [2.2, 0.0, 2.2]', () => {
    expect(CAMERA_CONFIG.overview.target).toEqual([2.2, 0.0, 2.2]);
  });

  it('[TC-IMP38.26/MSS][UC-IMP38] CAMERA_CONFIG pre_match position is calibrated to [30.0, 33.0, 30.0]', () => {
    expect(CAMERA_CONFIG.pre_match.position).toEqual([30.0, 33.0, 30.0]);
  });

  it('[TC-IMP38.27/MSS][UC-IMP38] CAMERA_CONFIG pre_match target is calibrated to [1.5, 0.0, 1.5]', () => {
    expect(CAMERA_CONFIG.pre_match.target).toEqual([1.5, 0.0, 1.5]);
  });

  it('[TC-IMP38.28/MSS][UC-IMP38] calculateTargetCameraState overview returns position [24.6, 25.3, 24.6] and fov 24', () => {
    const state = calculateTargetCameraState('overview');
    expect(state.position).toEqual([24.6, 25.3, 24.6]);
    expect(state.target).toEqual([2.2, 0.0, 2.2]);
    expect(state.fov).toBe(24);
  });

  it('[TC-IMP38.29/MSS][UC-IMP38] calculateTargetCameraState pre_match returns position [30.0, 33.0, 30.0] and fov 24', () => {
    const state = calculateTargetCameraState('pre_match');
    expect(state.position).toEqual([30.0, 33.0, 30.0]);
    expect(state.target).toEqual([1.5, 0.0, 1.5]);
    expect(state.fov).toBe(24);
  });
});
