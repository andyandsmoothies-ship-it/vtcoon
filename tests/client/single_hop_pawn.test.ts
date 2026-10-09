// @vitest-environment happy-dom
// [IMP-311] Living Contract Tests: Single Hop Pawn & Emote Bubble Presentation Primitives
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  SingleHopPawn,
  PawnMesh,
  PawnEmoteBubble,
  clearEmoteCanvasCache,
  emoteCanvasCache,
  computeHopFrame,
} from '../../src/client/3d/single_hop_pawn.js';
import { SoundEffect } from '../../src/client/audio/audio_types.js';
import { CanvasTexture } from 'three';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

vi.mock('@react-three/drei', () => ({
  Billboard: ({ children }: { children?: React.ReactNode }) =>
    React.createElement('billboard', null, children),
  useGLTF: Object.assign(vi.fn(), { preload: vi.fn() }),
}));

describe('Station 1 Contract Tests: Single Hop Pawn & Emote Primitives', () => {
  beforeEach(() => {
    clearEmoteCanvasCache();
  });

  it('TC-SHP-MSH.01 [UC-SHP-MSH/MSS] PawnMesh renders standard Three.js group geometry and material', () => {
    const html = renderToStaticMarkup(React.createElement(PawnMesh, { color: '#38BDF8' }));

    expect(html).toContain('cylinderGeometry');
    expect(html).toContain('coneGeometry');
    expect(html).toContain('sphereGeometry');
  });

  it('TC-SHP-MSH.02 [UC-SHP-MSH/MSS] PawnMesh applies player token color to mesh materials', () => {
    const html = renderToStaticMarkup(React.createElement(PawnMesh, { color: '#EF4444' }));

    expect(html).toContain('#EF4444');
  });

  it('TC-SHP-EMO.01 [UC-SHP-EMO/MSS] PawnEmoteBubble renders billboard with fallback material when document canvas is absent', () => {
    const html = renderToStaticMarkup(React.createElement(PawnEmoteBubble, { emoteId: 'emote_smile' }));

    expect(html).toContain('billboard');
    expect(html).toContain('planeGeometry');
  });

  it('TC-SHP-EMO.02 [UC-SHP-EMO/MSS] PawnEmoteBubble handles invalid emote IDs safely without crashing', () => {
    const html = renderToStaticMarkup(React.createElement(PawnEmoteBubble, { emoteId: 'non_existent_emote' }));

    expect(html).toContain('billboard');
  });

  it('TC-SHP-CCH.01 [UC-SHP-CCH/MSS] clearEmoteCanvasCache invokes dispose on cached CanvasTexture entries', () => {
    const canvas = document.createElement('canvas');
    const fakeTexture = new CanvasTexture(canvas);
    const mockDispose = vi.spyOn(fakeTexture, 'dispose');
    emoteCanvasCache.set('test_icon_1', fakeTexture);

    clearEmoteCanvasCache();

    expect(mockDispose).toHaveBeenCalledTimes(1);
    expect(emoteCanvasCache.size).toBe(0);
  });

  it('TC-SHP-CCH.02 [UC-SHP-CCH/MSS] clearEmoteCanvasCache handles multiple textures and clears map completely', () => {
    const canvas1 = document.createElement('canvas');
    const canvas2 = document.createElement('canvas');
    const fakeTexture1 = new CanvasTexture(canvas1);
    const fakeTexture2 = new CanvasTexture(canvas2);
    const mockDispose1 = vi.spyOn(fakeTexture1, 'dispose');
    const mockDispose2 = vi.spyOn(fakeTexture2, 'dispose');
    emoteCanvasCache.set('icon_a', fakeTexture1);
    emoteCanvasCache.set('icon_b', fakeTexture2);

    clearEmoteCanvasCache();

    expect(mockDispose1).toHaveBeenCalledTimes(1);
    expect(mockDispose2).toHaveBeenCalledTimes(1);
    expect(emoteCanvasCache.size).toBe(0);
  });

  it('TC-SHP-HOP.01 [UC-SHP-HOP/MSS] SingleHopPawn with fromCell equal to toCell immediately completes hop in effect', () => {
    let completed = false;
    const onComplete = () => {
      completed = true;
    };

    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => {
      root.render(
        React.createElement(SingleHopPawn, {
          fromCell: 5,
          toCell: 5,
          offset: [0, 0, 0],
          color: '#10B981',
          onHopComplete: onComplete,
        })
      );
    });

    expect(completed).toBe(true);
    act(() => {
      root.unmount();
    });
  });

  it('TC-SHP-HOP.02 [UC-SHP-HOP/MSS] SingleHopPawn renders LuxuryPawnModel when slotIndex is provided', () => {
    const html = renderToStaticMarkup(
      React.createElement(SingleHopPawn, {
        fromCell: 0,
        toCell: 1,
        offset: [0.2, 0, 0.2],
        color: '#6366F1',
        slotIndex: 0,
        onHopComplete: vi.fn(),
      })
    );

    expect(html).toContain('group');
    expect(html.length).toBeGreaterThan(50);
  });

  it('TC-SHP-HOP.03 [UC-SHP-HOP/MSS] SingleHopPawn renders fallback PawnMesh when slotIndex is undefined', () => {
    const html = renderToStaticMarkup(
      React.createElement(SingleHopPawn, {
        fromCell: 0,
        toCell: 1,
        offset: [-0.2, 0, -0.2],
        color: '#F43F5E',
        onHopComplete: vi.fn(),
      })
    );

    expect(html).toContain('cylinderGeometry');
    expect(html).toContain('#F43F5E');
  });

  it('TC-SHP-HOP.04 [UC-SHP-HOP/MSS] SingleHopPawn includes emote bubble when emoteId is passed', () => {
    const html = renderToStaticMarkup(
      React.createElement(SingleHopPawn, {
        fromCell: 0,
        toCell: 1,
        offset: [0, 0, 0],
        color: '#EAB308',
        onHopComplete: vi.fn(),
        emoteId: 'emote_clap',
      })
    );

    expect(html).toContain('billboard');
  });

  it('TC-SHP-HOP.05 [UC-SHP-HOP/MSS] SingleHopPawn supports jail flight motion flag without throwing', () => {
    const html = renderToStaticMarkup(
      React.createElement(SingleHopPawn, {
        fromCell: 30,
        toCell: 10,
        offset: [0, 0, 0],
        color: '#EC4899',
        isJailFlight: true,
        onHopComplete: vi.fn(),
      })
    );

    expect(html).toContain('group');
  });

  it('TC-SHP-HOP.06 [UC-SHP-HOP/MSS] SingleHopPawn supports bot motion flag without throwing', () => {
    const html = renderToStaticMarkup(
      React.createElement(SingleHopPawn, {
        fromCell: 2,
        toCell: 3,
        offset: [0, 0, 0],
        color: '#14B8A6',
        isBot: true,
        onHopComplete: vi.fn(),
      })
    );

    expect(html).toContain('group');
  });

  it('TC-SHP-HOP.07 [UC-SHP-HOP/MSS] emoteCanvasCache returns false for uncached entries', () => {
    expect(emoteCanvasCache.has('uncached_icon_id')).toBe(false);
  });

  it('TC-SHP-HOP.08 [UC-SHP-HOP/MSS] SingleHopPawn and clearEmoteCanvasCache functions are defined exports', () => {
    expect(SingleHopPawn).toBeDefined();
    expect(clearEmoteCanvasCache).toBeDefined();
  });

  it('TC-SHP-HOP.09 [UC-SHP-HOP/MSS] PawnMesh is a defined functional component', () => {
    expect(PawnMesh).toBeDefined();
  });

  it('TC-SHP-HOP.10 [UC-SHP-HOP/MSS] computeHopFrame clamps delta to 0.1 max', () => {
    const res = computeHopFrame({
      elapsed: 0,
      delta: 0.5,
      hopDuration: 0.2,
      landingDuration: 0.05,
      arcHeight: 1.0,
      fromCell: 0,
      toCell: 1,
      offset: [0, 0, 0],
      soundPlayed: false,
    });
    expect(res.elapsed).toBe(0.1);
    expect(res.isComplete).toBe(false);
  });

  it('TC-SHP-HOP.11 [UC-SHP-HOP/MSS] computeHopFrame handles jump progress when t <= hopDuration', () => {
    const res = computeHopFrame({
      elapsed: 0,
      delta: 0.05,
      hopDuration: 0.2,
      landingDuration: 0.05,
      arcHeight: 1.0,
      fromCell: 0,
      toCell: 1,
      offset: [0, 0, 0],
      soundPlayed: false,
    });
    expect(res.elapsed).toBe(0.05);
    expect(res.isComplete).toBe(false);
    expect(res.soundToPlay).toBeUndefined();
  });

  it('TC-SHP-HOP.12 [UC-SHP-HOP/MSS] computeHopFrame plays SoundEffect.PAWN_STEP during landing when not soundPlayed', () => {
    const res = computeHopFrame({
      elapsed: 0.2,
      delta: 0.02,
      hopDuration: 0.2,
      landingDuration: 0.05,
      arcHeight: 1.0,
      fromCell: 0,
      toCell: 1,
      offset: [0, 0, 0],
      soundPlayed: false,
    });
    expect(res.soundToPlay).toBe(SoundEffect.PAWN_STEP);
    expect(res.pitch).toBeDefined();
    expect(res.isComplete).toBe(false);
  });

  it('TC-SHP-HOP.13 [UC-SHP-HOP/MSS] computeHopFrame plays SoundEffect.TAX_PENALTY during jail flight landing', () => {
    const res = computeHopFrame({
      elapsed: 0.2,
      delta: 0.02,
      hopDuration: 0.2,
      landingDuration: 0.05,
      arcHeight: 1.0,
      fromCell: 0,
      toCell: 1,
      offset: [0, 0, 0],
      soundPlayed: false,
      isJailFlight: true,
    });
    expect(res.soundToPlay).toBe(SoundEffect.TAX_PENALTY);
    expect(res.pitch).toBeUndefined();
  });

  it('TC-SHP-HOP.14 [UC-SHP-HOP/MSS] computeHopFrame does not replay sound if soundPlayed is true', () => {
    const res = computeHopFrame({
      elapsed: 0.2,
      delta: 0.02,
      hopDuration: 0.2,
      landingDuration: 0.05,
      arcHeight: 1.0,
      fromCell: 0,
      toCell: 1,
      offset: [0, 0, 0],
      soundPlayed: true,
    });
    expect(res.soundToPlay).toBeUndefined();
    expect(res.isComplete).toBe(false);
  });

  it('TC-SHP-HOP.15 [UC-SHP-HOP/MSS] computeHopFrame completes hop when t > hopDuration + landingDuration', () => {
    const res = computeHopFrame({
      elapsed: 0.25,
      delta: 0.02,
      hopDuration: 0.2,
      landingDuration: 0.05,
      arcHeight: 1.0,
      fromCell: 0,
      toCell: 1,
      offset: [0, 0, 0],
      soundPlayed: true,
    });
    expect(res.isComplete).toBe(true);
    expect(res.scale).toEqual([1, 1, 1]);
  });
});
