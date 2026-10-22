import { describe, it, expect } from 'vitest';
import { getRecommendedGlProfile, getRecommendedDpr } from '../../src/client/3d/device_detect';
import { DPR_BOUNDS } from '../../src/client/3d/perf_budget';
import { resolveCanvasGlConfig, DEFAULT_CANVAS_CAMERA_CONFIG } from '../../src/client/game_canvas';
import { ACESFilmicToneMapping, NoToneMapping } from 'three';

describe('IMP-452: iOS WebKit Early-Z Restoration & Thermal Pacing Contract Suite', () => {
  it('[TC-452.01/MSS][UC-GL-EARLY-Z/MSS][Facet-1/Profile]: Given mobile device environment (isMobile: true), When calling getRecommendedGlProfile(true), Then returns logarithmicDepthBuffer: false, antialias: true, and precision: highp', () => {
    const profile = getRecommendedGlProfile(true);
    expect(profile.logarithmicDepthBuffer).toBe(false);
    expect(profile.antialias).toBe(true);
    expect(profile.precision).toBe('highp');
    expect(profile.powerPreference).toBe('high-performance');
  });

  it('[TC-452.02/MSS][UC-DPR-BOUNDS/MSS][Facet-1/Profile]: Given iOS phone configuration, When inspecting DPR_BOUNDS.IOS_PHONE_MAX, Then value strictly equals 1.35', () => {
    expect(DPR_BOUNDS.IOS_PHONE_MAX).toBe(1.35);
  });

  it('[TC-452.03a/MSS][UC-CANVAS-GL-DELEGATION-MOBILE/MSS][Facet-2/Wiring]: Given pure helper resolveCanvasGlConfig, When called with mobile profile, Then preserves logarithmicDepthBuffer: false and injects ACESFilmicToneMapping', () => {
    const mobileGl = resolveCanvasGlConfig(
      {
        antialias: false,
        powerPreference: 'high-performance',
        precision: 'mediump',
        logarithmicDepthBuffer: false,
      },
      true
    );

    expect(mobileGl.logarithmicDepthBuffer).toBe(false);
    expect(mobileGl.antialias).toBe(false);
    expect(mobileGl.precision).toBe('mediump');
    expect(mobileGl.toneMapping).toBe(ACESFilmicToneMapping);
  });

  it('[TC-452.03b/MSS][UC-CANVAS-GL-DELEGATION-DESKTOP/MSS][Facet-2/Wiring]: Given pure helper resolveCanvasGlConfig, When called with desktop profile, Then preserves logarithmicDepthBuffer: true and injects NoToneMapping', () => {
    const desktopGl = resolveCanvasGlConfig(
      {
        antialias: true,
        powerPreference: 'high-performance',
        precision: 'highp',
        logarithmicDepthBuffer: true,
      },
      false
    );

    expect(desktopGl.logarithmicDepthBuffer).toBe(true);
    expect(desktopGl.antialias).toBe(true);
    expect(desktopGl.precision).toBe('highp');
    expect(desktopGl.toneMapping).toBe(NoToneMapping);
  });

  it('[TC-452.04/MSS][UC-DESKTOP-GL-PARITY/MSS][Facet-1/Profile]: Given desktop environment (isMobile: false), When calling getRecommendedGlProfile(false), Then preserves antialias: true, precision: highp, and logarithmicDepthBuffer: true', () => {
    const profile = getRecommendedGlProfile(false);
    expect(profile.logarithmicDepthBuffer).toBe(true);
    expect(profile.antialias).toBe(true);
    expect(profile.precision).toBe('highp');
    expect(profile.powerPreference).toBe('high-performance');
  });

  it('[TC-452.05a/MSS][UC-FIRST-FRAME-DPR-IOS/MSS][Facet-1/Profile]: Given iOS phone environment, When calling getRecommendedDpr(true, true), Then returns [1.0, 1.35] sweet-spot crisp range', () => {
    const dprRange = getRecommendedDpr(true, true);
    expect(dprRange).toEqual([1.0, 1.35]);
  });

  it('[TC-452.05b/MSS][UC-FIRST-FRAME-DPR-OTHER/MSS][Facet-1/Profile]: Given Android mobile or desktop environment, When calling getRecommendedDpr, Then returns calibrated platform baselines', () => {
    const androidDprRange = getRecommendedDpr(true, false);
    expect(androidDprRange).toEqual([1.0, 1.35]);

    const desktopDprRange = getRecommendedDpr(false, false);
    expect(desktopDprRange).toEqual([1.0, 1.5]);
  });

  it('[TC-452.06/MSS][UC-FRUSTUM-RATIO-COMPRESSION/MSS][Facet-3/Frustum]: Given DEFAULT_CANVAS_CAMERA_CONFIG, When inspecting camera near and far planes, Then near is 2.0 and far is 140.0, achieving far/near ratio of 70:1 for anti-z-fighting precision', () => {
    expect(DEFAULT_CANVAS_CAMERA_CONFIG.near).toBe(2.0);
    expect(DEFAULT_CANVAS_CAMERA_CONFIG.far).toBe(140.0);
    expect(DEFAULT_CANVAS_CAMERA_CONFIG.fov).toBe(24);
    expect(DEFAULT_CANVAS_CAMERA_CONFIG.far / DEFAULT_CANVAS_CAMERA_CONFIG.near).toBe(70);
  });
});
