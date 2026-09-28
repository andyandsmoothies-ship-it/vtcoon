// [UI-S01/MSS][IMP-220] TropicalWater — Interactive Island Ocean Component
import React from 'react';
import { Color, Vector3, ShaderMaterial, PlaneGeometry, type Mesh } from 'three';
import { useSafeFrame } from './safe_frame';
import { useEnvironmentStore, TIME_OF_DAY_PRESETS } from '../store/environment_store';
import {
  createTropicalWaterUniforms,
  TROPICAL_WATER_VERTEX_SHADER,
  TROPICAL_WATER_FRAGMENT_SHADER,
} from './shaders/tropical_water_material';

export interface TropicalWaterProps {
  readonly onWaterClick?: () => void;
  readonly testId?: string;
  readonly isMobile?: boolean;
}

export function TropicalWater({
  onWaterClick,
  testId = 'living-ocean-water',
  isMobile = false,
}: TropicalWaterProps): React.ReactElement {
  const phase = useEnvironmentStore((s) => s.phase);
  const preset = TIME_OF_DAY_PRESETS[phase];

  const meshRef = React.useRef<Mesh>(null);
  // [C4] useMemo không deps, sạch 100% ESLint rule
  const uniforms = React.useMemo(() => createTropicalWaterUniforms(), []);
  const tempColor = React.useMemo(() => new Color(), []);
  const tempVec = React.useMemo(() => new Vector3(), []);

  // [C3] Gán trực tiếp Record<string, IUniform> sạch, không dirty cast
  const material = React.useMemo(() => {
    return new ShaderMaterial({
      uniforms,
      vertexShader: TROPICAL_WATER_VERTEX_SHADER,
      fragmentShader: TROPICAL_WATER_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
    });
  }, [uniforms]);

  // [I3] Phân khúc lưới thích ứng: Mobile 24x24 (1.152 tris chuẩn), Desktop 32x32
  const segments = isMobile ? 24 : 32;
  const geometry = React.useMemo(() => new PlaneGeometry(240, 240, segments, segments), [segments]);

  React.useEffect(() => {
    return () => {
      material.dispose();
      geometry.dispose();
    };
  }, [material, geometry]);

  useSafeFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const lerpRate = 1.0 - Math.exp(-dt * 3.0);

    // Chu kỳ sóng GPU
    const uTime = uniforms.uTime;
    if (uTime) {
      uTime.value = (uTime.value as number) + dt;
    }

    // [C4] Nội suy màu sắc mượt mà về preset hiện tại (Zero-alloc)
    if (uniforms.uShallowColor && preset) {
      tempColor.set(preset.waterShallowColor);
      (uniforms.uShallowColor.value as Color).lerp(tempColor, lerpRate);
    }
    if (uniforms.uDeepColor && preset) {
      tempColor.set(preset.waterDeepColor);
      (uniforms.uDeepColor.value as Color).lerp(tempColor, lerpRate);
    }
    if (uniforms.uFoamColor && preset) {
      tempColor.set(preset.waterFoamColor);
      (uniforms.uFoamColor.value as Color).lerp(tempColor, lerpRate);
    }
    if (uniforms.uSunColor && preset) {
      tempColor.set(preset.sunColor);
      (uniforms.uSunColor.value as Color).lerp(tempColor, lerpRate);
    }
    if (uniforms.uSunDirection && preset) {
      tempVec.set(preset.sunPosition[0], preset.sunPosition[1], preset.sunPosition[2]).normalize();
      (uniforms.uSunDirection.value as Vector3).lerp(tempVec, lerpRate);
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[0, -0.30, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      data-testid={testId}
      onPointerDown={onWaterClick}
    />
  );
}
