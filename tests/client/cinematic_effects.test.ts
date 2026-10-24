import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  calculateBeaconRotation,
  calculateSpirePulse,
  CinematicLightingAccents,
  CinematicOverlay,
} from '../../src/client/3d/cinematic_effects';
import { CoastalIslandEnvironment } from '../../src/client/3d/coastal_island_environment';

describe('[UI-S04/MSS] Cinematic Effects — Mathematical Helpers & Rendering Stability', () => {
  it('calculateBeaconRotation xoay tuyến tính theo thời gian', () => {
    expect(calculateBeaconRotation(0)).toBe(0);
    expect(calculateBeaconRotation(2, 1.5)).toBeCloseTo(3.0);
    expect(calculateBeaconRotation(NaN)).toBe(0);
    expect(calculateBeaconRotation(Infinity)).toBe(0);
  });

  it('calculateSpirePulse dao động điều hòa an toàn trong biên độ [0.7, 1.0]', () => {
    expect(calculateSpirePulse(0)).toBeCloseTo(0.85);
    expect(calculateSpirePulse(1.5)).toBeGreaterThanOrEqual(0.69);
    expect(calculateSpirePulse(3.0)).toBeLessThanOrEqual(1.01);
    expect(calculateSpirePulse(NaN)).toBe(1.0);
  });

  it('CinematicLightingAccents render an toàn ngoài Canvas không quăng lỗi', () => {
    expect(() => {
      const html = renderToStaticMarkup(React.createElement(CinematicLightingAccents));
      expect(html).toContain('sphereGeometry');
      expect(html).toContain('coneGeometry');
    }).not.toThrow();
  });

  it('CinematicOverlay render HTML với đầy đủ lớp phủ Lens Vignette, Tilt-Shift và Golden Hour', () => {
    const html = renderToStaticMarkup(React.createElement(CinematicOverlay));
    expect(html).toContain('radial-gradient');
    expect(html).toContain('linear-gradient');
    expect(html).toContain('pointer-events-none');
    expect(html).toContain('aria-hidden="true"');
  });

  it('CoastalIslandEnvironment render dai duong, bai cat vang va loai bo dia co cu', () => {
    const html = renderToStaticMarkup(React.createElement(CoastalIslandEnvironment, { streamlined: false }));
    expect(html).toContain('boxGeometry');
    expect(html).toContain('#0284C7'); // Đại dương ngọc bích
    expect(html).toContain('#EFE5D8'); // Bãi cát nhiệt đới ngà mịn
    expect(html).not.toContain('args="15.6,17.6,0.26,64"');
  });
});
