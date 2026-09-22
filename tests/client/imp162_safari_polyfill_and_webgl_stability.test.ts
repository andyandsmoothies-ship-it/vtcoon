// [TC-IMP162/MSS][UC-IMP162] Contract Test Suite: Safari Polyfill, WebGL Mobile Context Loss & Audio/Texture Memory Leak Defense
// Universal 4-Facet Behavioral Matrix:
// Facet 1: Boundary & Range (Safari roundRect polyfill, negative coordinates, radius array, proportional scale, SSR safety)
// Facet 2: State Reactivity & Multi-Turn Teardown (WebGL context loss preventDefault, context restoration texture purge, audio mute reactivity)
// Facet 3: Resource Disposal & Timer Isolation (GPU texture deallocation on mascot, heritage, standee, tile, price, emote, unified cache manager)
// Facet 4: Error Defense & Terminal Invariants (WebAudio cleanup idempotency, suspended audio fallback timer, exception swallowing)

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { clearMascotTextureCache, getMascotCanvasTexture } from '../../src/client/3d/mascot_canvas_texture';
import { clearHeritageTileTextureCache, getHeritageEncausticTileTexture } from '../../src/client/3d/heritage_tile_texture';
import { clearStandeeWebpCache, standeeWebpCache } from '../../src/client/3d/board_tile';
import { clearTileTextureCache, getTileTexture, getStandeeTexture } from '../../src/client/3d/tile_texture_generator';
import { getPriceCanvasTexture } from '../../src/client/3d/owner_property_markers';
import { useAudioStore } from '../../src/client/store/audio_store';

// Dynamic / safe loading of modules that are part of the IMP-162 contract but not yet implemented (RED Phase)
const POLYFILL_PATH = '../../src/client/polyfills/canvas_round_rect';
const TEXTURE_MANAGER_PATH = '../../src/client/3d/texture_cache_manager';

let polyfillModule: any;
try {
  polyfillModule = await import(/* @vite-ignore */ POLYFILL_PATH);
} catch {
  polyfillModule = {};
}
const installCanvasRoundRectPolyfill = polyfillModule?.installCanvasRoundRectPolyfill;

let textureCacheManagerModule: any;
try {
  textureCacheManagerModule = await import(/* @vite-ignore */ TEXTURE_MANAGER_PATH);
} catch {
  textureCacheManagerModule = {};
}
const clearAll3DTextureCaches = textureCacheManagerModule?.clearAll3DTextureCaches;

let gameCanvasModule: any;
try {
  gameCanvasModule = await import('../../src/client/game_canvas');
} catch {
  gameCanvasModule = {};
}
const attachWebGLContextHandlers = gameCanvasModule?.attachWebGLContextHandlers;

let ownerMarkersModule: any;
try {
  ownerMarkersModule = await import('../../src/client/3d/owner_property_markers');
} catch {
  ownerMarkersModule = {};
}
const clearPriceTextureCache = ownerMarkersModule?.clearPriceTextureCache;

let pawnAnimatorModule: any;
try {
  pawnAnimatorModule = await import('../../src/client/3d/pawn_animator');
} catch {
  pawnAnimatorModule = {};
}
const clearEmoteCanvasCache = pawnAnimatorModule?.clearEmoteCanvasCache;
const emoteCanvasCache = pawnAnimatorModule?.emoteCanvasCache;

let hoseModalModule: any;
try {
  hoseModalModule = await import('../../src/client/ui/modals/hose_modal');
} catch {
  hoseModalModule = {};
}
const playFloorBellSound = hoseModalModule?.playFloorBellSound;

// Helper to provide a canvas mock in Node.js test environment
function setupMockDocument() {
  const dummyGradient: any = { addColorStop: vi.fn() };
  const dummyCtx: any = {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    strokeRect: vi.fn(),
    arcTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    ellipse: vi.fn(),
    closePath: vi.fn(),
    rect: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    drawImage: vi.fn(),
    clip: vi.fn(),
    measureText: vi.fn(() => ({ width: 50, actualBoundingBoxAscent: 10, actualBoundingBoxDescent: 5 })),
    createLinearGradient: vi.fn(() => dummyGradient),
    createRadialGradient: vi.fn(() => dummyGradient),
    font: '',
    textAlign: '',
    textBaseline: '',
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
  };
  const mockCanvas: any = {
    width: 256,
    height: 256,
    getContext: (type: string) => (type === '2d' ? dummyCtx : null),
  };
  (globalThis as any).document = {
    createElement: (tag: string) => (tag === 'canvas' ? { ...mockCanvas } : {}),
  };
}

// ============================================================================
// FACET 1: BOUNDARY & RANGE (Safari Polyfill & W3C Geometry Normalization)
// ============================================================================
describe('[FACET-1: BOUNDARY] Safari roundRect Polyfill & W3C Geometry Normalization', () => {
  let savedCtxProto: any;
  let savedPathProto: any;

  beforeEach(() => {
    savedCtxProto = (globalThis as any).CanvasRenderingContext2D;
    savedPathProto = (globalThis as any).Path2D;
  });

  afterEach(() => {
    (globalThis as any).CanvasRenderingContext2D = savedCtxProto;
    (globalThis as any).Path2D = savedPathProto;
  });

  it('[TC-IMP162.01/MSS][UC-BROWSER-POLYFILL] installCanvasRoundRectPolyfill installs roundRect on CanvasRenderingContext2D when missing', () => {
    expect(typeof installCanvasRoundRectPolyfill).toBe('function');
    class MockCanvasContext {
      moveTo = vi.fn();
      arcTo = vi.fn();
      closePath = vi.fn();
    }
    (globalThis as any).CanvasRenderingContext2D = MockCanvasContext;
    installCanvasRoundRectPolyfill();
    expect(typeof (MockCanvasContext.prototype as any).roundRect).toBe('function');
  });

  it('[TC-IMP162.01b/MSS][UC-BROWSER-POLYFILL] installCanvasRoundRectPolyfill installs roundRect on Path2D when Path2D exists in environment', () => {
    expect(typeof installCanvasRoundRectPolyfill).toBe('function');
    class MockPath2D {
      moveTo = vi.fn();
      arcTo = vi.fn();
      closePath = vi.fn();
    }
    (globalThis as any).Path2D = MockPath2D;
    installCanvasRoundRectPolyfill();
    expect(typeof (MockPath2D.prototype as any).roundRect).toBe('function');
  });

  it('[TC-IMP162.02/MSS][UC-BROWSER-POLYFILL] ctx.roundRect(10, 20, 100, 50, 8) draws rounded path via arcTo calls', () => {
    expect(typeof installCanvasRoundRectPolyfill).toBe('function');
    class MockCanvasContext {
      moveTo = vi.fn();
      arcTo = vi.fn();
      closePath = vi.fn();
    }
    (globalThis as any).CanvasRenderingContext2D = MockCanvasContext;
    installCanvasRoundRectPolyfill();
    const ctx = new MockCanvasContext() as any;
    ctx.roundRect(10, 20, 100, 50, 8);
    expect(ctx.moveTo).toHaveBeenCalledWith(18, 20);
    expect(ctx.arcTo).toHaveBeenCalledTimes(4);
    expect(ctx.closePath).toHaveBeenCalledTimes(1);
  });

  it('[TC-IMP162.03/MSS][UC-BROWSER-POLYFILL] ctx.roundRect(10, 20, 100, 50, [10, 5, 10, 5]) handles 4-corner radii array without errors', () => {
    expect(typeof installCanvasRoundRectPolyfill).toBe('function');
    class MockCanvasContext {
      moveTo = vi.fn();
      arcTo = vi.fn();
      closePath = vi.fn();
    }
    (globalThis as any).CanvasRenderingContext2D = MockCanvasContext;
    installCanvasRoundRectPolyfill();
    const ctx = new MockCanvasContext() as any;
    ctx.roundRect(10, 20, 100, 50, [10, 5, 10, 5]);
    expect(ctx.moveTo).toHaveBeenCalledWith(20, 20);
    expect(ctx.arcTo).toHaveBeenNthCalledWith(1, 110, 20, 110, 70, 5);
    expect(ctx.arcTo).toHaveBeenNthCalledWith(2, 110, 70, 10, 70, 10);
  });

  it('[TC-IMP162.04/MSS][UC-BROWSER-POLYFILL] ctx.roundRect(100, 50, -60, -30, 8) normalizes negative width and height according to W3C spec', () => {
    expect(typeof installCanvasRoundRectPolyfill).toBe('function');
    class MockCanvasContext {
      moveTo = vi.fn();
      arcTo = vi.fn();
      closePath = vi.fn();
    }
    (globalThis as any).CanvasRenderingContext2D = MockCanvasContext;
    installCanvasRoundRectPolyfill();
    const ctx = new MockCanvasContext() as any;
    ctx.roundRect(100, 50, -60, -30, 8);
    // W3C spec: if w < 0: x += w, w = -w; if h < 0: y += h, h = -h
    // Normalized: x = 100 + (-60) = 40, w = 60, y = 50 + (-30) = 20, h = 30
    // Initial moveTo(x + rTL, y) -> moveTo(40 + 8, 20) = moveTo(48, 20)
    expect(ctx.moveTo).toHaveBeenCalledWith(48, 20);
    expect(ctx.arcTo).toHaveBeenNthCalledWith(1, 100, 20, 100, 50, 8);
    expect(ctx.closePath).toHaveBeenCalledTimes(1);
  });

  it('[TC-IMP162.05/MSS][UC-BROWSER-POLYFILL] ctx.roundRect(0, 0, 100, 50, -5) throws RangeError on negative radius', () => {
    expect(typeof installCanvasRoundRectPolyfill).toBe('function');
    class MockCanvasContext {
      moveTo = vi.fn();
      arcTo = vi.fn();
      closePath = vi.fn();
    }
    (globalThis as any).CanvasRenderingContext2D = MockCanvasContext;
    installCanvasRoundRectPolyfill();
    const ctx = new MockCanvasContext() as any;
    expect(() => ctx.roundRect(0, 0, 100, 50, -5)).toThrow(RangeError);
    expect(() => ctx.roundRect(0, 0, 100, 50, [10, -5, 10, 5])).toThrow(RangeError);
  });

  it('[TC-IMP162.06/MSS][UC-BROWSER-POLYFILL] ctx.roundRect(0, 0, 40, 40, [30, 30, 30, 30]) applies W3C proportional scaling factor when adjacent radii exceed dimensions', () => {
    expect(typeof installCanvasRoundRectPolyfill).toBe('function');
    class MockCanvasContext {
      moveTo = vi.fn();
      arcTo = vi.fn();
      closePath = vi.fn();
    }
    (globalThis as any).CanvasRenderingContext2D = MockCanvasContext;
    installCanvasRoundRectPolyfill();
    const ctx = new MockCanvasContext() as any;
    ctx.roundRect(0, 0, 40, 40, [30, 30, 30, 30]);
    // w = 40, rTL + rTR = 60 > 40 -> scale factor = 40 / 60 = 2/3.
    // scaled radius = 30 * (2/3) = 20.
    // moveTo(x + scaledR, y) = moveTo(20, 0)
    expect(ctx.moveTo).toHaveBeenCalledWith(20, 0);
    expect(ctx.arcTo).toHaveBeenNthCalledWith(1, 40, 0, 40, 40, 20);
  });

  it('[TC-IMP162.07/MSS][UC-BROWSER-POLYFILL] installCanvasRoundRectPolyfill is SSR safe when window or document is undefined', () => {
    expect(typeof installCanvasRoundRectPolyfill).toBe('function');
    const savedWindow = (globalThis as any).window;
    const savedDocument = (globalThis as any).document;
    const savedCtx = (globalThis as any).CanvasRenderingContext2D;
    delete (globalThis as any).window;
    delete (globalThis as any).document;
    delete (globalThis as any).CanvasRenderingContext2D;
    try {
      expect(() => installCanvasRoundRectPolyfill()).not.toThrow();
    } finally {
      (globalThis as any).window = savedWindow;
      (globalThis as any).document = savedDocument;
      (globalThis as any).CanvasRenderingContext2D = savedCtx;
    }
  });
});

// ============================================================================
// FACET 2: STATE REACTIVITY & MULTI-TURN TEARDOWN (WebGL Context Loss & Mute)
// ============================================================================
describe('[FACET-2: REACTIVITY] WebGL Context Loss Handlers & Audio Mute Reactivity', () => {
  let savedWindow: any;

  beforeEach(() => {
    savedWindow = (globalThis as any).window;
  });

  afterEach(() => {
    (globalThis as any).window = savedWindow;
  });

  it('[TC-IMP162.08/MSS][UC-WEBGL-CONTEXT] webglcontextlost on canvas element has defaultPrevented === true via event listener', () => {
    expect(typeof attachWebGLContextHandlers).toBe('function');
    const dummyCanvas = new EventTarget();
    const cleanup = attachWebGLContextHandlers(dummyCanvas as any);
    const event = new Event('webglcontextlost', { cancelable: true });
    dummyCanvas.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    cleanup();
  });

  it('[TC-IMP162.08b/MSS][UC-WEBGL-CONTEXT] attachWebGLContextHandlers cleanup removes webglcontextlost listener and avoids dangling traps', () => {
    expect(typeof attachWebGLContextHandlers).toBe('function');
    const dummyCanvas = new EventTarget();
    const cleanup = attachWebGLContextHandlers(dummyCanvas as any);
    cleanup();
    const event = new Event('webglcontextlost', { cancelable: true });
    dummyCanvas.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('[TC-IMP162.09/MSS][UC-WEBGL-CONTEXT] webglcontextrestored triggers texture cache clearing via onRestore callback', () => {
    expect(typeof attachWebGLContextHandlers).toBe('function');
    const dummyCanvas = new EventTarget();
    const onRestoreSpy = vi.fn();
    const cleanup = attachWebGLContextHandlers(dummyCanvas as any, onRestoreSpy);
    dummyCanvas.dispatchEvent(new Event('webglcontextrestored'));
    expect(onRestoreSpy).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it('[TC-IMP162.10/MSS][UC-AUDIO-MUTE] playFloorBellSound in hose_modal checks useAudioStore isMuted and creates zero nodes when muted', () => {
    expect(typeof playFloorBellSound).toBe('function');
    useAudioStore.setState({ isMuted: true });
    const mockCreateOscillator = vi.fn();
    const mockCreateGain = vi.fn();
    (globalThis as any).window = {
      AudioContext: class {
        createOscillator = mockCreateOscillator;
        createGain = mockCreateGain;
        destination = {};
        currentTime = 0;
        state = 'running';
      },
    };
    playFloorBellSound();
    expect(mockCreateOscillator).not.toHaveBeenCalled();
    expect(mockCreateGain).not.toHaveBeenCalled();
  });

  it('[TC-IMP162.10b/MSS][UC-AUDIO-MUTE] playFloorBellSound creates and connects audio nodes when isMuted is false', () => {
    expect(typeof playFloorBellSound).toBe('function');
    useAudioStore.setState({ isMuted: false });
    const mockGainNode = {
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
    const mockOscNode = {
      type: '',
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      disconnect: vi.fn(),
    };
    const mockDestination = {};
    (globalThis as any).window = {
      AudioContext: class {
        createOscillator = () => mockOscNode;
        createGain = () => mockGainNode;
        destination = mockDestination;
        currentTime = 0;
        state = 'running';
      },
    };
    playFloorBellSound();
    expect(mockGainNode.connect).toHaveBeenCalledWith(mockDestination);
  });
});

// ============================================================================
// FACET 3: RESOURCE DISPOSAL & TIMER ISOLATION (Texture Caches & GPU Deallocation)
// ============================================================================
describe('[FACET-3: DISPOSAL] 3D Texture Cache Manager & GPU Memory Deallocation', () => {
  let savedDocument: any;

  beforeEach(() => {
    savedDocument = (globalThis as any).document;
    setupMockDocument();
  });

  afterEach(() => {
    (globalThis as any).document = savedDocument;
  });

  it('[TC-IMP162.11/MSS][UC-TEXTURE-DISPOSAL] clearMascotTextureCache calls dispose on all cached CanvasTexture instances', () => {
    const tex = getMascotCanvasTexture('tiger', '#1E3A8A');
    expect(tex).not.toBeNull();
    const disposeSpy = vi.spyOn(tex!, 'dispose');
    clearMascotTextureCache();
    expect(disposeSpy).toHaveBeenCalledTimes(1);
  });

  it('[TC-IMP162.12/MSS][UC-TEXTURE-DISPOSAL] clearHeritageTileTextureCache calls dispose on cachedEncausticTexture', () => {
    const tex = getHeritageEncausticTileTexture();
    expect(tex).not.toBeNull();
    const disposeSpy = vi.spyOn(tex!, 'dispose');
    clearHeritageTileTextureCache();
    expect(disposeSpy).toHaveBeenCalledTimes(1);
  });

  it('[TC-IMP162.13/MSS][UC-TEXTURE-DISPOSAL] clearStandeeWebpCache safely disposes valid textures and handles null entries without throwing', () => {
    const validTexture = { dispose: vi.fn() };
    standeeWebpCache.set(1, validTexture as any);
    standeeWebpCache.set(2, null);
    standeeWebpCache.set(3, {} as any);
    clearStandeeWebpCache();
    expect(validTexture.dispose).toHaveBeenCalledTimes(1);
    expect(standeeWebpCache.size).toBe(0);
  });

  it('[TC-IMP162.14/MSS][UC-TEXTURE-DISPOSAL] clearTileTextureCache calls dispose on both tileTextureCache and standeeTextureCache', () => {
    const tileTex = getTileTexture(1);
    const standeeTex = getStandeeTexture(1);
    expect(tileTex).not.toBeNull();
    expect(standeeTex).not.toBeNull();
    const tileSpy = vi.spyOn(tileTex as any, 'dispose');
    const standeeSpy = vi.spyOn(standeeTex as any, 'dispose');
    clearTileTextureCache();
    expect(tileSpy).toHaveBeenCalledTimes(1);
    expect(standeeSpy).toHaveBeenCalledTimes(1);
  });

  it('[TC-IMP162.15/MSS][UC-TEXTURE-DISPOSAL] clearPriceTextureCache calls dispose on priceTextureCache entries', () => {
    expect(typeof clearPriceTextureCache).toBe('function');
    const tex = getPriceCanvasTexture('2.400 Tr.', '#047857');
    expect(tex).not.toBeNull();
    const disposeSpy = vi.spyOn(tex!, 'dispose');
    clearPriceTextureCache();
    expect(disposeSpy).toHaveBeenCalledTimes(1);
  });

  it('[TC-IMP162.16/MSS][UC-TEXTURE-DISPOSAL] clearEmoteCanvasCache in pawn_animator calls dispose on emoteCanvasCache entries', () => {
    expect(typeof clearEmoteCanvasCache).toBe('function');
    const dummyTex = { dispose: vi.fn() };
    emoteCanvasCache.set('smile', dummyTex as any);
    clearEmoteCanvasCache();
    expect(dummyTex.dispose).toHaveBeenCalledTimes(1);
    expect(emoteCanvasCache.size).toBe(0);
  });

  it('[TC-IMP162.17/MSS][UC-TEXTURE-DISPOSAL] clearAll3DTextureCaches invokes standee and mascot texture clear functions', () => {
    expect(typeof clearAll3DTextureCaches).toBe('function');
    const validTex = { dispose: vi.fn() };
    standeeWebpCache.set(1, validTex as any);
    const mascotTex = getMascotCanvasTexture('star', '#D97706');
    const mascotSpy = vi.spyOn(mascotTex!, 'dispose');
    clearAll3DTextureCaches();
    expect(validTex.dispose).toHaveBeenCalledTimes(1);
    expect(mascotSpy).toHaveBeenCalledTimes(1);
  });

  it('[TC-IMP162.17b/MSS][UC-TEXTURE-DISPOSAL] clearAll3DTextureCaches invokes heritage tile texture clear function', () => {
    expect(typeof clearAll3DTextureCaches).toBe('function');
    const heritageTex = getHeritageEncausticTileTexture();
    const heritageSpy = vi.spyOn(heritageTex!, 'dispose');
    clearAll3DTextureCaches();
    expect(heritageSpy).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// FACET 4: ERROR DEFENSE & TERMINAL INVARIANTS (Audio Node Idempotency & Fallbacks)
// ============================================================================
describe('[FACET-4: ERROR DEFENSE] Audio Node Teardown Idempotency & Fallback Safety', () => {
  let savedWindow: any;

  beforeEach(() => {
    savedWindow = (globalThis as any).window;
  });

  afterEach(() => {
    (globalThis as any).window = savedWindow;
  });

  it('[TC-IMP162.18/MSS][UC-AUDIO-LEAK-DEFENSE] playFloorBellSound cleanup function is idempotent and safe against multiple invocations', () => {
    useAudioStore.setState({ isMuted: false });
    const mockGainNode = {
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
    let capturedOnEnded: (() => void) | null = null;
    const mockOsc1 = {
      type: '',
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      disconnect: vi.fn(),
      set onended(fn: (() => void) | null) { capturedOnEnded = fn; },
      get onended(): (() => void) | null { return capturedOnEnded; },
    };
    const mockOsc2 = {
      type: '',
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      disconnect: vi.fn(),
    };
    (globalThis as any).window = {
      AudioContext: class {
        private oscCount = 0;
        createOscillator = () => (this.oscCount++ === 0 ? mockOsc1 : mockOsc2);
        createGain = () => mockGainNode;
        destination = {};
        currentTime = 0;
        state = 'running';
      },
    };
    const returnedCleanup = playFloorBellSound();
    const cleanupFn = returnedCleanup ?? capturedOnEnded;
    expect(typeof cleanupFn).toBe('function');
    cleanupFn!();
    expect(mockGainNode.disconnect).toHaveBeenCalledTimes(1);
    expect(mockOsc1.disconnect).toHaveBeenCalledTimes(1);
    cleanupFn!();
    expect(mockGainNode.disconnect).toHaveBeenCalledTimes(1);
  });

  it('[TC-IMP162.18b/MSS][UC-AUDIO-LEAK-DEFENSE] playFloorBellSound triggers cleanup via fallback 1200ms timer when AudioContext is suspended', () => {
    expect(typeof playFloorBellSound).toBe('function');
    vi.useFakeTimers();
    useAudioStore.setState({ isMuted: false });
    const mockGainNode = {
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
    const mockOsc = {
      type: '',
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      disconnect: vi.fn(),
      onended: null,
    };
    (globalThis as any).window = {
      AudioContext: class {
        createOscillator = () => mockOsc;
        createGain = () => mockGainNode;
        destination = {};
        currentTime = 0;
        state = 'suspended';
        resume = vi.fn().mockReturnValue(new Promise(() => {}));
      },
    };
    playFloorBellSound();
    expect(mockGainNode.disconnect).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1200);
    expect(mockGainNode.disconnect).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('[TC-IMP162.18c/MSS][UC-AUDIO-LEAK-DEFENSE] playFloorBellSound cleanup function safely swallows disconnect errors without throwing', () => {
    expect(typeof playFloorBellSound).toBe('function');
    useAudioStore.setState({ isMuted: false });
    const throwingGainNode = {
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn().mockImplementation(() => {
        throw new Error('DOMException: The AudioNode is not connected.');
      }),
    };
    let capturedOnEnded: (() => void) | null = null;
    const mockOsc = {
      type: '',
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      disconnect: vi.fn(),
      set onended(fn: (() => void) | null) { capturedOnEnded = fn; },
      get onended(): (() => void) | null { return capturedOnEnded; },
    };
    (globalThis as any).window = {
      AudioContext: class {
        createOscillator = () => mockOsc;
        createGain = () => throwingGainNode;
        destination = {};
        currentTime = 0;
        state = 'running';
      },
    };
    const returnedCleanup = playFloorBellSound();
    const cleanupFn = returnedCleanup ?? capturedOnEnded;
    expect(() => cleanupFn?.()).not.toThrow();
  });
});
