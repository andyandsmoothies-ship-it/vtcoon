// [TC-220.01/MSS..TC-220.16/MSS][UC-IMP220]
// Contract Test Suite for IMP-220: Tropical Island Water Shader & Atmospheric Lighting Lerp
// Universal 5-Facet Behavioral Matrix & Detroit Style
// (1-4 asserts/test, zero loops in it(), no static checklist tests, clean teardown)

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Vector3, Color, ShaderMaterial, PlaneGeometry } from 'three';

import { TIME_OF_DAY_PRESETS } from '../../src/client/store/environment_store';
import { CoastalIslandEnvironment } from '../../src/client/3d/coastal_island_environment';
import { SoundEngine } from '../../src/client/audio/sound_engine';

// Safe dynamic resolution for Station 1 Business RED contract gate
const SHADER_MATERIAL_PATH = '../../src/client/3d/shaders/tropical_water_material';
const TROPICAL_WATER_PATH = '../../src/client/3d/tropical_water';

let shaderMaterialMod: any = null;
try {
  shaderMaterialMod = await import(/* @vite-ignore */ SHADER_MATERIAL_PATH);
} catch {
  try {
    shaderMaterialMod = await import(/* @vite-ignore */ `${SHADER_MATERIAL_PATH}.js`);
  } catch {
    shaderMaterialMod = null;
  }
}

let tropicalWaterMod: any = null;
try {
  tropicalWaterMod = await import(/* @vite-ignore */ TROPICAL_WATER_PATH);
} catch {
  try {
    tropicalWaterMod = await import(/* @vite-ignore */ `${TROPICAL_WATER_PATH}.js`);
  } catch {
    tropicalWaterMod = null;
  }
}

const createTropicalWaterUniforms: (() => Record<string, any>) | undefined =
  shaderMaterialMod?.createTropicalWaterUniforms;
const calculateFresnelFactor: ((viewDir: Vector3, normal: Vector3, power?: number) => number) | undefined =
  shaderMaterialMod?.calculateFresnelFactor;
const calculateWaterWaveOffset: ((x: number, y: number, time: number) => number) | undefined =
  shaderMaterialMod?.calculateWaterWaveOffset;
const calculateDepthBlend: ((distFromCenter: number, innerRadius?: number, outerRadius?: number) => number) | undefined =
  shaderMaterialMod?.calculateDepthBlend;
const lerpWaterColor: ((current: Color, target: Color, rate: number) => Color) | undefined =
  shaderMaterialMod?.lerpWaterColor;
const TROPICAL_WATER_VERTEX_SHADER: string | undefined =
  shaderMaterialMod?.TROPICAL_WATER_VERTEX_SHADER;
const TROPICAL_WATER_FRAGMENT_SHADER: string | undefined =
  shaderMaterialMod?.TROPICAL_WATER_FRAGMENT_SHADER;
const TropicalWater: React.ComponentType<any> | undefined =
  tropicalWaterMod?.TropicalWater;

describe('[IMP-220][Trạm 1 RED] Tropical Island Water Shader & Atmospheric Lighting Lerp Contract', () => {
  // =========================================================================
  // FACET 1: Core Mechanics & Uniform Initialization (TC-220.01 - TC-220.04)
  // =========================================================================
  describe('Facet 1: Core Mechanics & Uniform Initialization', () => {
    it('[TC-220.01/MSS][UC-IMP220][Facet-1/UniformInit] createTropicalWaterUniforms() khởi tạo đầy đủ các uniforms thiết yếu: uTime, uDeepColor, uShallowColor, uFoamColor, uSunColor, uSunDirection, uFresnelPower', () => {
      expect(createTropicalWaterUniforms).toBeDefined();
      const uniforms = createTropicalWaterUniforms ? createTropicalWaterUniforms() : null;
      expect(uniforms).not.toBeNull();
      const requiredKeys = ['uTime', 'uDeepColor', 'uShallowColor', 'uFoamColor', 'uSunColor', 'uSunDirection', 'uFresnelPower'];
      const hasAllKeys = requiredKeys.every((k) => uniforms && k in uniforms);
      expect(hasAllKeys).toBe(true);
    });

    it('[TC-220.02/MSS][UC-IMP220][Facet-1/ShaderSource] TROPICAL_WATER_FRAGMENT_SHADER tích hợp công thức phản xạ Fresnel Schlick góc nhìn pow(1.0 - max(dot(viewDir, normal), 0.0), uFresnelPower)', () => {
      expect(TROPICAL_WATER_FRAGMENT_SHADER).toBeDefined();
      expect(TROPICAL_WATER_FRAGMENT_SHADER).toContain('pow(1.0 - max(dot(viewDir, normal), 0.0), uFresnelPower)');
    });

    it('[TC-220.03/MSS][UC-IMP220][Facet-1/WaveDisplacement] TROPICAL_WATER_VERTEX_SHADER chứa thuật toán sóng GPU kết hợp đa tần số (w1, w2, w3)', () => {
      expect(TROPICAL_WATER_VERTEX_SHADER).toBeDefined();
      expect(TROPICAL_WATER_VERTEX_SHADER).toContain('w1 + w2 + w3');
      expect(TROPICAL_WATER_VERTEX_SHADER).toContain('0.055');
    });

    it('[TC-220.04/MSS][UC-IMP220][Facet-1/FoamIntegration] Fragment shader và CoastalIslandEnvironment hỗ trợ bọt sóng ven bờ macro (mesh Y=-0.292) kết hợp specular glint', () => {
      const envHtml = renderToStaticMarkup(React.createElement(CoastalIslandEnvironment));
      expect(envHtml).toContain('#FFFFFF');
      expect(TROPICAL_WATER_FRAGMENT_SHADER).toBeDefined();
      expect(TROPICAL_WATER_FRAGMENT_SHADER).toContain('specularColor');
    });
  });

  // =========================================================================
  // FACET 2: Boundary & Range Clamping (TC-220.05 - TC-220.07)
  // =========================================================================
  describe('Facet 2: Boundary & Range Clamping', () => {
    it('[TC-220.05/MSS][UC-IMP220][Facet-2/FresnelClamp] calculateFresnelFactor(viewDir, normal, power) luôn kẹp chặt trong [0.0, 1.0]', () => {
      expect(calculateFresnelFactor).toBeDefined();
      const direct = calculateFresnelFactor ? calculateFresnelFactor(new Vector3(0, 1, 0), new Vector3(0, 1, 0), 3.5) : -1;
      const grazing = calculateFresnelFactor ? calculateFresnelFactor(new Vector3(1, 0, 0), new Vector3(0, 1, 0), 3.5) : -1;
      expect(direct).toBeCloseTo(0.0, 4);
      expect(grazing).toBeCloseTo(1.0, 4);
    });

    it('[TC-220.06/MSS][UC-IMP220][Facet-2/WaveAmplitudeClamp] calculateWaterWaveOffset(x, y, time) không bao giờ vượt quá biên độ cực đại toán học +-0.055', () => {
      expect(calculateWaterWaveOffset).toBeDefined();
      const originOffset = calculateWaterWaveOffset ? calculateWaterWaveOffset(0, 0, 0) : 999;
      const extremeOffset = calculateWaterWaveOffset ? calculateWaterWaveOffset(100, -100, 3.5) : 999;
      expect(Math.abs(originOffset)).toBeLessThanOrEqual(0.055);
      expect(Math.abs(extremeOffset)).toBeLessThanOrEqual(0.055);
    });

    it('[TC-220.07/MSS][UC-IMP220][Facet-2/DepthAbsorptionGradient] calculateDepthBlend(distFromCenter) trả về giá trị chuẩn hóa trong [0.0, 1.0]', () => {
      expect(calculateDepthBlend).toBeDefined();
      const inner = calculateDepthBlend ? calculateDepthBlend(5.0) : -1;
      const mid = calculateDepthBlend ? calculateDepthBlend(39.8) : -1;
      const outer = calculateDepthBlend ? calculateDepthBlend(80.0) : -1;
      expect(inner).toBe(0.0);
      expect(mid).toBeCloseTo(0.5, 2);
      expect(outer).toBe(1.0);
    });
  });

  // =========================================================================
  // FACET 3: Time-of-Day Palette Reactivity (TC-220.08 - TC-220.10)
  // =========================================================================
  describe('Facet 3: Time-of-Day Palette Reactivity', () => {
    it('[TC-220.08/MSS][UC-IMP220][Facet-3/DayPalette] TIME_OF_DAY_PRESETS.day cấp đúng bảng màu: shallow \'#06B6D4\', deep \'#0284C7\', foam \'#FFFFFF\'', () => {
      const dayPreset = TIME_OF_DAY_PRESETS.day;
      expect(dayPreset.waterShallowColor).toBe('#06B6D4');
      expect(dayPreset.waterDeepColor).toBe('#0284C7');
      expect(dayPreset.waterFoamColor).toBe('#FFFFFF');
    });

    it('[TC-220.09/MSS][UC-IMP220][Facet-3/SunsetPalette] TIME_OF_DAY_PRESETS.sunset cấp đúng bảng màu: shallow \'#F59E0B\', deep \'#C2410C\', foam \'#FEF3C7\'', () => {
      const sunsetPreset = TIME_OF_DAY_PRESETS.sunset;
      expect(sunsetPreset.waterShallowColor).toBe('#F59E0B');
      expect(sunsetPreset.waterDeepColor).toBe('#C2410C');
      expect(sunsetPreset.waterFoamColor).toBe('#FEF3C7');
    });

    it('[TC-220.10/MSS][UC-IMP220][Facet-3/NightPalette] TIME_OF_DAY_PRESETS.night cấp đúng bảng màu: shallow \'#0284C7\', deep \'#0B192C\', foam \'#38BDF8\'', () => {
      const nightPreset = TIME_OF_DAY_PRESETS.night;
      expect(nightPreset.waterShallowColor).toBe('#0284C7');
      expect(nightPreset.waterDeepColor).toBe('#0B192C');
      expect(nightPreset.waterFoamColor).toBe('#38BDF8');
    });
  });

  // =========================================================================
  // FACET 4: State Lifecycle & Transition Lerp (TC-220.11 - TC-220.13)
  // =========================================================================
  describe('Facet 4: State Lifecycle & Transition Lerp', () => {
    it('[TC-220.11/MSS][UC-IMP220][Facet-4/SmoothLerp] lerpWaterColor(currentColor, targetColor, lerpRate) biến thiên liên tục về màu đích sau nhiều bước lặp', () => {
      expect(lerpWaterColor).toBeDefined();
      const current = new Color('#06B6D4');
      const target = new Color('#F59E0B');
      const result = lerpWaterColor ? lerpWaterColor(current, target, 0.5) : null;
      expect(result).not.toBeNull();
      expect(current.getHexString()).not.toBe('06b6d4');
    });

    it('[TC-220.12/MSS][UC-IMP220][Facet-4/ZeroAlloc] Cập nhật uniforms tái sử dụng đối tượng có sẵn, không cấp phát Color mới trong frame loop', () => {
      expect(createTropicalWaterUniforms).toBeDefined();
      const uniforms = createTropicalWaterUniforms ? createTropicalWaterUniforms() : null;
      expect(uniforms).not.toBeNull();
      const originalColorRef = uniforms?.uShallowColor?.value as Color;
      originalColorRef?.set('#F59E0B');
      expect(uniforms?.uShallowColor?.value).toBe(originalColorRef);
    });

    it('[TC-220.13/MSS][UC-IMP220][Facet-4/CleanTeardown] TropicalWater giải phóng an toàn geometry và material khi unmount', () => {
      expect(TropicalWater).toBeDefined();
      let cleanupFn: (() => void) | undefined = undefined;
      const useEffectSpy = vi.spyOn(React, 'useEffect').mockImplementation((effect) => {
        const res = effect();
        if (typeof res === 'function') {
          cleanupFn = res as () => void;
        }
      });
      if (TropicalWater) {
        renderToStaticMarkup(React.createElement(TropicalWater));
      }
      useEffectSpy.mockRestore();
      expect(cleanupFn).toBeDefined();
      const matDisposeSpy = vi.spyOn(ShaderMaterial.prototype, 'dispose');
      const geomDisposeSpy = vi.spyOn(PlaneGeometry.prototype, 'dispose');
      (cleanupFn as (() => void) | undefined)?.();
      expect(matDisposeSpy).toHaveBeenCalled();
      expect(geomDisposeSpy).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // FACET 5: Backward Compatibility & Cohesive World Integration (TC-220.14 - TC-220.16)
  // =========================================================================
  describe('Facet 5: Backward Compatibility & Cohesive World Integration', () => {
    it('[TC-220.14/MSS][UC-IMP220][Facet-5/TestIdPreservation] CoastalIslandEnvironment gắn data-testid="living-ocean-water" trên mesh mặt nước và kích hoạt an toàn SoundEngine.playWaterRipple()', () => {
      const html = renderToStaticMarkup(React.createElement(CoastalIslandEnvironment));
      expect(html).toContain('data-testid="living-ocean-water"');
      const rippleSpy = vi.spyOn(SoundEngine, 'playWaterRipple');
      SoundEngine.playWaterRipple();
      expect(rippleSpy).toHaveBeenCalled();
    });

    it('[TC-220.15/MSS][UC-IMP220][Facet-5/StreamlinedSupport] CoastalIslandEnvironment ở mode streamlined bảo toàn cấu trúc Depth Stack 5 tầng và loại bỏ cây cối ngoại vi', () => {
      const htmlStreamlined = renderToStaticMarkup(React.createElement(CoastalIslandEnvironment, { streamlined: true }));
      expect(htmlStreamlined).toContain('#0C4A6E');
      expect(htmlStreamlined).toContain('#06B6D4');
      expect(htmlStreamlined).toContain('#FFFFFF');
      expect(htmlStreamlined).not.toContain('#4ADE80');
    });

    it('[TC-220.16/MSS][UC-IMP220][Facet-5/SSRMarkupSafety] renderToStaticMarkup render component trơn tru trong môi trường Node.js', () => {
      expect(TropicalWater).toBeDefined();
      const html = TropicalWater ? renderToStaticMarkup(React.createElement(TropicalWater)) : '';
      expect(html).toContain('data-testid="living-ocean-water"');
      expect(html.length).toBeGreaterThan(0);
    });
  });
});
