// [UI-S01/MSS][IMP-365] Living Contract Tests for Mobile Water Shader LOD & ALU Optimization
import { describe, it, expect } from 'vitest';
import React, { isValidElement, type ReactElement } from 'react';
import {
  TROPICAL_WATER_MOBILE_VERTEX_SHADER,
  TROPICAL_WATER_MOBILE_FRAGMENT_SHADER,
  getTropicalWaterShaders,
} from '../../src/client/3d/shaders/tropical_water_material';
import { TropicalWater } from '../../src/client/3d/tropical_water';

import { renderToStaticMarkup } from 'react-dom/server';

type ElementWithChildren = ReactElement<{ children?: React.ReactNode; [key: string]: unknown }>;

function captureTree<P extends object>(
  Component: (props: P) => React.ReactElement | null,
  props: P
): ElementWithChildren | null {
  let captured: ElementWithChildren | null = null;
  function Spy(): React.ReactElement {
    const result = Component(props);
    if (isValidElement<ElementWithChildren['props']>(result)) {
      captured = result;
    }
    return React.createElement('div');
  }
  renderToStaticMarkup(React.createElement(Spy));
  return captured;
}

describe('IMP-365: Mobile Water Shader LOD & ALU Optimization', () => {
  it('TC-365.01 [UC-WATER-SHADER-BRANCH/MSS] getTropicalWaterShaders(true) returns mobile shaders with depthWrite=false and pre-baked highp uTime', () => {
    const config = getTropicalWaterShaders(true);
    expect(config.depthWrite).toBe(false);
    expect(config.vertexShader).toContain('uniform highp float uTime;');
    expect(config.fragmentShader).toContain('precision mediump float;');
  });

  it('TC-365.02 [UC-WATER-DESKTOP-PARITY/MSS] getTropicalWaterShaders(false) returns canonical desktop shaders with depthWrite=false', () => {
    const config = getTropicalWaterShaders(false);
    expect(config.depthWrite).toBe(false);
    expect(config.vertexShader).toContain('uTime');
    expect(config.fragmentShader).toContain('uFresnelPower');
  });

  it('TC-365.03 [UC-VERTEX-EVALUATED-FRESNEL/MSS] TROPICAL_WATER_MOBILE_VERTEX_SHADER evaluates vFresnel and completely elides unused vUv', () => {
    expect(TROPICAL_WATER_MOBILE_VERTEX_SHADER).toContain('varying float vFresnel;');
    expect(TROPICAL_WATER_MOBILE_VERTEX_SHADER).toContain('varying vec2 vWorldPosXZ;');
    expect(TROPICAL_WATER_MOBILE_VERTEX_SHADER).not.toContain('varying vec2 vUv;');
  });

  it('TC-365.04 [UC-FRAGMENT-ALU-ELISION/MSS] TROPICAL_WATER_MOBILE_FRAGMENT_SHADER elides normalize and specular pow calls', () => {
    expect(TROPICAL_WATER_MOBILE_FRAGMENT_SHADER).toContain('length(vWorldPosXZ)');
    expect(TROPICAL_WATER_MOBILE_FRAGMENT_SHADER).not.toContain('pow(');
    expect(TROPICAL_WATER_MOBILE_FRAGMENT_SHADER).not.toContain('normalize(');
  });

  it('TC-365.05 [UC-TROPICAL-WATER-MOBILE-PROPS/MSS] TropicalWater rendered with isMobile=true retains valid DOM/R3F mesh', () => {
    const node = captureTree(TropicalWater, { isMobile: true, testId: 'mobile-ocean' });
    expect(node?.props['data-testid']).toBe('mobile-ocean');
  });

  it('TC-365.06 [UC-TROPICAL-WATER-DESKTOP-DEFAULT/MSS] TropicalWater rendered with default props preserves desktop ocean mesh markup', () => {
    const node = captureTree(TropicalWater, {});
    expect(node?.props['data-testid']).toBe('living-ocean-water');
  });
});
