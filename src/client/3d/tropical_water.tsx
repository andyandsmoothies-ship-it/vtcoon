// [UI-S01/MSS][IMP-220][IMP-357] TropicalWater — Interactive Island Ocean Component
import React from 'react';
import { Color, Vector3, ShaderMaterial, PlaneGeometry, type Mesh } from 'three';
import { useSafeFrame } from './safe_frame';
import { useEnvironmentStore, TIME_OF_DAY_PRESETS } from '../store/environment_store';
import { useDiagnostic3DStore } from './diagnostic_3d_store';
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
  const storeOceanVisible = useDiagnostic3DStore((s) => s.isOceanVisible);
  const isOceanVisible = useDiagnostic3DStore.getState()?.isOceanVisible ?? storeOceanVisible;

  const meshRef = React.useRef<Mesh>(null);
  // [C4] useMemo với deps [isMobile] để khởi tạo baseline màu đại dương sâu cho mobile
  const uniforms = React.useMemo(() => {
    const u = createTropicalWaterUniforms();
    if (isMobile && u.uDeepColor?.value instanceof Color) {
      u.uDeepColor.value.set('#0369A1');
    }
    return u;
  }, [isMobile]);
  const tempColor = React.useMemo(() => new Color(), []);
  const tempVec = React.useMemo(() => new Vector3(), []);

  // [C3] ShaderMaterial cưỡng chế 'highp' trên mọi nền tảng loại bỏ trôi mantissa 16-bit (IMP-357)
  const material = React.useMemo(() => {
    return new ShaderMaterial({
      uniforms,
      vertexShader: TROPICAL_WATER_VERTEX_SHADER.replace('uniform float uTime;', 'uniform highp float uTime;'),
      fragmentShader: TROPICAL_WATER_FRAGMENT_SHADER,
      precision: 'highp',
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

    // Chu kỳ sóng GPU giới hạn modulo 20*PI (LCM của 1.4, 1.1, 1.8) triệt tiêu popping đỉnh sóng (IMP-357)
    const uTime = uniforms.uTime;
    if (uTime && typeof uTime.value === 'number') {
      uTime.value = (uTime.value + dt) % (Math.PI * 20.0);
    }

    // [C4] Nội suy màu sắc mượt mà về preset hiện tại (Zero-alloc)
    if (uniforms.uShallowColor?.value instanceof Color && preset) {
      tempColor.set(preset.waterShallowColor);
      uniforms.uShallowColor.value.lerp(tempColor, lerpRate);
    }
    if (uniforms.uDeepColor?.value instanceof Color && preset) {
      const targetDeep = isMobile && phase === 'day' ? '#0369A1' : preset.waterDeepColor;
      tempColor.set(targetDeep);
      uniforms.uDeepColor.value.lerp(tempColor, lerpRate);
    }
    if (uniforms.uFoamColor?.value instanceof Color && preset) {
      tempColor.set(preset.waterFoamColor);
      uniforms.uFoamColor.value.lerp(tempColor, lerpRate);
    }
    if (uniforms.uSunColor?.value instanceof Color && preset) {
      tempColor.set(preset.sunColor);
      uniforms.uSunColor.value.lerp(tempColor, lerpRate);
    }
    if (uniforms.uSunDirection?.value instanceof Vector3 && preset) {
      tempVec.set(preset.sunPosition[0], preset.sunPosition[1], preset.sunPosition[2]).normalize();
      uniforms.uSunDirection.value.lerp(tempVec, lerpRate);
    }
  });

  if (!isOceanVisible) {
    return <group visible={false} data-testid={testId} />;
  }

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
