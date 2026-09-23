// [TC-186/MSS][UC-IMP186] Contract Test Suite: iOS WebKit Jetsam Defense, Mobile Texture LOD Budget & Direct Canvas Optimization
// Universal 4-Facet Behavioral Matrix Verification:
// Facet 1: Boundary & LOD Scaling (TC-186.01 to TC-186.05)
// Facet 2: State Reactivity & Device Detection (TC-186.06 to TC-186.09)
// Facet 3: Resource Disposal & Context Restoration (TC-186.10 to TC-186.11)
// Facet 4: Error Defense & Node/SSR Safety (TC-186.12 to TC-186.14)
//
// Rules enforced:
// - Atomic Test Mandate: 1-4 asserts/test, zero loops in it()
// - Consumer-side assertions at point of execution
// - Traceability tags on every test

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { CanvasTexture } from 'three';
import * as tileTextureGen from '../../src/client/3d/tile_texture_generator';
import * as textureCacheManager from '../../src/client/3d/texture_cache_manager';

// ============================================================================
// DYNAMIC IMPORT HARNESS (Station 1 RED Contract Gate)
// Dynamically resolves Station 2 modules to assert clean Business RED
// ============================================================================
const DEVICE_DETECT_PATH = '../../src/client/3d/device_detect';
const TEXTURE_REVISION_PATH = '../../src/client/3d/texture_revision';

let deviceDetectMod: any = null;
try {
  deviceDetectMod = await import(/* @vite-ignore */ DEVICE_DETECT_PATH);
} catch {
  try {
    deviceDetectMod = await import(/* @vite-ignore */ `${DEVICE_DETECT_PATH}.js`);
  } catch {
    deviceDetectMod = null;
  }
}

let textureRevisionMod: any = null;
try {
  textureRevisionMod = await import(/* @vite-ignore */ TEXTURE_REVISION_PATH);
} catch {
  try {
    textureRevisionMod = await import(/* @vite-ignore */ `${TEXTURE_REVISION_PATH}.js`);
  } catch {
    textureRevisionMod = null;
  }
}

// Function accessors from Station 2 modules
const isMobileHardware: () => boolean =
  deviceDetectMod?.isMobileHardware ??
  (() => {
    throw new TypeError('isMobileHardware is not implemented');
  });

const isIOSDevice: () => boolean =
  deviceDetectMod?.isIOSDevice ??
  (() => {
    throw new TypeError('isIOSDevice is not implemented');
  });

const isIPadOS: () => boolean =
  deviceDetectMod?.isIPadOS ??
  (() => {
    throw new TypeError('isIPadOS is not implemented');
  });

const getRecommendedDpr: (isMobile: boolean) => number | [number, number] =
  deviceDetectMod?.getRecommendedDpr ??
  (() => {
    throw new TypeError('getRecommendedDpr is not implemented');
  });

const getTextureRevision: () => number =
  textureRevisionMod?.getTextureRevision ??
  (() => {
    throw new TypeError('getTextureRevision is not implemented');
  });

const bumpTextureRevision: () => void =
  textureRevisionMod?.bumpTextureRevision ??
  (() => {
    throw new TypeError('bumpTextureRevision is not implemented');
  });

const subscribeTextureRevision: (subscriber: (revision: number) => void) => () => void =
  textureRevisionMod?.subscribeTextureRevision ??
  (() => {
    throw new TypeError('subscribeTextureRevision is not implemented');
  });

// Typed bindings for existing modules with enhanced IMP-186 parameters
const getTileTexture = tileTextureGen.getTileTexture as (
  index: number,
  isMobile?: boolean,
) => CanvasTexture | null;

const getStandeeTexture = tileTextureGen.getStandeeTexture as (
  index: number,
  isMobile?: boolean,
) => CanvasTexture | null;

const clearTileTextureCache = tileTextureGen.clearTileTextureCache;

const clearAll3DTextureCaches = textureCacheManager.clearAll3DTextureCaches;

// ============================================================================
// MOCK HARNESS (Headless Canvas & Web APIs)
// ============================================================================
interface RecordedScale {
  x: number;
  y: number;
}

let recordedScales: RecordedScale[] = [];
let lastCreatedImage: any = null;

class MockImage {
  crossOrigin = '';
  src = '';
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  complete = false;
  naturalWidth = 100;
  naturalHeight = 100;

  constructor() {
    lastCreatedImage = this;
  }
}

function createMock2dContext(): any {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn((x: number, y: number) => {
      recordedScales.push({ x, y });
    }),
    translate: vi.fn(),
    rotate: vi.fn(),
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    rect: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    arcTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    ellipse: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    roundRect: vi.fn(),
    drawImage: vi.fn(),
    clip: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    measureText: vi.fn(() => ({ width: 50, actualBoundingBoxAscent: 10, actualBoundingBoxDescent: 5 })),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: '',
    textBaseline: '',
  };
}

describe('[TC-186/MSS][UC-IMP186] IMP-186 iOS WebKit Jetsam Defense & Mobile Texture LOD Contract Suite', () => {
  let originalDocument: any;
  let originalWindow: any;
  let originalNavigator: any;
  let originalImage: any;

  beforeEach(() => {
    recordedScales = [];
    lastCreatedImage = null;

    originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
    originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
    originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
    originalImage = Object.getOwnPropertyDescriptor(globalThis, 'Image');

    Object.defineProperty(globalThis, 'Image', {
      value: MockImage,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, 'window', {
      value: {},
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36',
        maxTouchPoints: 0,
      },
      configurable: true,
      writable: true,
    });

    Object.defineProperty(globalThis, 'document', {
      value: {
        createElement: (tag: string) => {
          if (tag === 'canvas') {
            const ctx = createMock2dContext();
            return {
              width: 0,
              height: 0,
              getContext: (contextId: string) => (contextId === '2d' ? ctx : null),
            };
          }
          return {};
        },
      },
      configurable: true,
      writable: true,
    });

    clearTileTextureCache();
  });

  afterEach(() => {
    clearTileTextureCache();
    if (originalDocument) {
      Object.defineProperty(globalThis, 'document', originalDocument);
    } else {
      delete (globalThis as any).document;
    }
    if (originalWindow) {
      Object.defineProperty(globalThis, 'window', originalWindow);
    } else {
      delete (globalThis as any).window;
    }
    if (originalNavigator) {
      Object.defineProperty(globalThis, 'navigator', originalNavigator);
    } else {
      delete (globalThis as any).navigator;
    }
    if (originalImage) {
      Object.defineProperty(globalThis, 'Image', originalImage);
    } else {
      delete (globalThis as any).Image;
    }
  });

  // ==========================================================================
  // FACET 1: BOUNDARY & LOD SCALING (TC-186.01 to TC-186.05)
  // ==========================================================================

  it('[TC-186.01/MSS][UC-IMP186] getTileTexture(1, true) creates a canvas of exactly 512 x 680 on mobile', () => {
    const tex = getTileTexture(1, true);
    expect(tex).not.toBeNull();
    expect(tex?.image.width).toBe(512);
    expect(tex?.image.height).toBe(680);
  });

  it('[TC-186.02/MSS][UC-IMP186] getTileTexture(1, false) creates a canvas of exactly 1024 x 1360 on desktop', () => {
    const tex = getTileTexture(1, false);
    expect(tex).not.toBeNull();
    expect(tex?.image.width).toBe(1024);
    expect(tex?.image.height).toBe(1360);
  });

  it('[TC-186.03/MSS][UC-IMP186] Corner tile (index 0) creates 512 x 512 canvas when isMobile=true and 1024 x 1024 when isMobile=false', () => {
    const texMobile = getTileTexture(0, true);
    const texDesktop = getTileTexture(0, false);
    expect(texMobile?.image.width).toBe(512);
    expect(texMobile?.image.height).toBe(512);
    expect(texDesktop?.image.width).toBe(1024);
    expect(texDesktop?.image.height).toBe(1024);
  });

  it('[TC-186.04/Adversarial][UC-IMP186] Mobile corner tile (512x512) img.onload scales by (512 / 384) and NEVER (1024 / 384)', () => {
    getTileTexture(0, true);
    expect(lastCreatedImage).not.toBeNull();

    recordedScales = [];
    lastCreatedImage.onload?.();

    const matchedMobileScale = recordedScales.some(
      (s) => Math.abs(s.x - 512 / 384) < 0.001 && Math.abs(s.y - 512 / 384) < 0.001,
    );
    const matchedDesktopScale = recordedScales.some(
      (s) => Math.abs(s.x - 1024 / 384) < 0.001 || Math.abs(s.y - 1024 / 384) < 0.001,
    );

    expect(matchedMobileScale).toBe(true);
    expect(matchedDesktopScale).toBe(false);
  });

  it('[TC-186.05/MSS][UC-IMP186] Mobile tile and Standee assign anisotropy = 2, while desktop assigns anisotropy = 16', () => {
    const tileMob = getTileTexture(1, true);
    const tileDesk = getTileTexture(1, false);
    const standeeMob = getStandeeTexture(1, true);
    const standeeDesk = getStandeeTexture(1, false);

    expect(tileMob?.anisotropy).toBe(2);
    expect(tileDesk?.anisotropy).toBe(16);
    expect(standeeMob?.anisotropy).toBe(2);
    expect(standeeDesk?.anisotropy).toBe(16);
  });

  // ==========================================================================
  // FACET 2: STATE REACTIVITY & DEVICE DETECTION (TC-186.06 to TC-186.09)
  // ==========================================================================

  it('[TC-186.06/MSS][UC-IMP186] isMobileHardware() correctly identifies iPhone and Android phone via navigator.userAgent', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
        maxTouchPoints: 5,
      },
      configurable: true,
      writable: true,
    });
    expect(isMobileHardware()).toBe(true);

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        userAgent:
          'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36',
        maxTouchPoints: 5,
      },
      configurable: true,
      writable: true,
    });
    expect(isMobileHardware()).toBe(true);
  });

  it('[TC-186.07/MSS][UC-IMP186] isMobileHardware() correctly identifies iPadOS (Macintosh UA with maxTouchPoints = 5)', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        maxTouchPoints: 5,
      },
      configurable: true,
      writable: true,
    });
    expect(isMobileHardware()).toBe(true);
    expect(isIPadOS()).toBe(true);
    expect(isIOSDevice()).toBe(true);
  });

  it('[TC-186.08/MSS][UC-IMP186] isMobileHardware() returns false on Desktop Windows/macOS even when viewport is resized to 500px', () => {
    Object.defineProperty(globalThis, 'window', {
      value: { innerWidth: 500, innerHeight: 800 },
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        maxTouchPoints: 0,
      },
      configurable: true,
      writable: true,
    });
    expect(isMobileHardware()).toBe(false);

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        maxTouchPoints: 0,
      },
      configurable: true,
      writable: true,
    });
    expect(isMobileHardware()).toBe(false);
  });

  it('[TC-186.09/MSS][UC-IMP186] getRecommendedDpr(true) returns 1 and getRecommendedDpr(false) returns [1, 1.5]', () => {
    expect(getRecommendedDpr(true)).toBe(1);
    expect(getRecommendedDpr(false)).toEqual([1, 1.5]);
  });

  // ==========================================================================
  // FACET 3: RESOURCE DISPOSAL & CONTEXT RESTORATION (TC-186.10 to TC-186.11)
  // ==========================================================================

  it('[TC-186.10/MSS][UC-IMP186] clearTileTextureCache() zeroes canvas width and height before calling dispose()', () => {
    const tex = getTileTexture(1, true);
    expect(tex).not.toBeNull();
    const canvas = tex!.image;
    const disposeSpy = vi.spyOn(tex!, 'dispose');

    clearTileTextureCache();

    expect(canvas.width).toBe(0);
    expect(canvas.height).toBe(0);
    expect(disposeSpy).toHaveBeenCalled();
  });

  it('[TC-186.11/MSS][UC-IMP186] clearAll3DTextureCaches() triggers bumpTextureRevision(), incrementing revision and notifying subscribers', () => {
    const subscriber = vi.fn();
    const unsubscribe = subscribeTextureRevision(subscriber);
    const initialRev = getTextureRevision();

    clearAll3DTextureCaches();

    expect(getTextureRevision()).toBe(initialRev + 1);
    expect(subscriber).toHaveBeenCalledWith(initialRev + 1);
    unsubscribe();
  });

  // ==========================================================================
  // FACET 4: ERROR DEFENSE & NODE/SSR SAFETY (TC-186.12 to TC-186.14)
  // ==========================================================================

  it('[TC-186.12/MSS][UC-IMP186] isMobileHardware(), isIOSDevice(), and isIPadOS() return false cleanly in SSR/Node.js environment', () => {
    Object.defineProperty(globalThis, 'window', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, 'navigator', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    expect(isMobileHardware()).toBe(false);
    expect(isIOSDevice()).toBe(false);
    expect(isIPadOS()).toBe(false);
  });

  it('[TC-186.13/MSS][UC-IMP186] Cache isolation: getTileTexture(1, true) and getTileTexture(1, false) return distinct CanvasTextures without collision', () => {
    const texMobile = getTileTexture(1, true);
    const texDesktop = getTileTexture(1, false);

    expect(texMobile).not.toBe(texDesktop);
    expect(texMobile?.image.width).toBe(512);
    expect(texDesktop?.image.width).toBe(1024);
  });

  it('[TC-186.14/MSS][UC-IMP186] getTileTexture(1) returns null cleanly and does not throw when document is undefined', () => {
    clearTileTextureCache();
    Object.defineProperty(globalThis, 'document', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    expect(() => getTileTexture(1)).not.toThrow();
    expect(getTileTexture(1)).toBeNull();
  });
});
