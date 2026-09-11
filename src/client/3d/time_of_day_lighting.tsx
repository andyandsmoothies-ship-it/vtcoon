// [UI-S01/MSS][UI-S04/MSS] TimeOfDayLighting — Dynamic Day-Sunset-Night Lighting & Atmosphere Coordinator
import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Color, Vector3, type DirectionalLight, type AmbientLight, type HemisphereLight, type Fog } from 'three';
import {
  useEnvironmentStore,
  TIME_OF_DAY_PRESETS,
  AUTO_CYCLE_DURATION_SECONDS,
  calculatePhaseFromProgress,
} from '../store/environment_store';

function useSafeFrame(callback: (state: Parameters<Parameters<typeof useFrame>[0]>[0], delta: number) => void): void {
  try {
    useFrame(callback);
  } catch {
    // Safe outside Canvas in test environment
  }
}

export function TimeOfDayLighting(): React.ReactElement {
  const phase = useEnvironmentStore((s) => s.phase);
  const isAuto = useEnvironmentStore((s) => s.isAuto);
  const setPhase = useEnvironmentStore((s) => s.setPhase);

  const sunRef = useRef<DirectionalLight>(null);
  const fillRef = useRef<DirectionalLight>(null);
  const rimRef = useRef<DirectionalLight>(null);
  const ambientRef = useRef<AmbientLight>(null);
  const hemiRef = useRef<HemisphereLight>(null);

  const preset = TIME_OF_DAY_PRESETS[phase];
  const initialPreset = useMemo(() => TIME_OF_DAY_PRESETS[useEnvironmentStore.getState().phase], []);

  // Temporary Three.js math objects for GC-free smooth lerp
  const tempColor = useMemo(() => new Color(), []);
  const tempVec = useMemo(() => new Vector3(), []);

  useSafeFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // 1. Quản lý chu kỳ tự động chuyển tiếp êm dịu nếu mode là 'auto'
    if (isAuto) {
      const progress = (t % AUTO_CYCLE_DURATION_SECONDS) / AUTO_CYCLE_DURATION_SECONDS;
      const computedPhase = calculatePhaseFromProgress(progress);
      if (computedPhase !== phase) {
        setPhase(computedPhase);
      }
    }

    const dt = Math.min(delta, 0.1);
    const lerpRate = 1 - Math.exp(-dt * 3.0);

    // 2. Nội suy quỹ đạo chuyển động mặt trời / mặt trăng
    if (sunRef.current) {
      tempVec.set(preset.sunPosition[0], preset.sunPosition[1], preset.sunPosition[2]);
      sunRef.current.position.lerp(tempVec, lerpRate);

      tempColor.set(preset.sunColor);
      sunRef.current.color.lerp(tempColor, lerpRate);
      sunRef.current.intensity += (preset.sunIntensity - sunRef.current.intensity) * lerpRate;
    }

    // 3. Nội suy ánh sáng khuếch tán Ambient & Hemisphere
    if (ambientRef.current) {
      tempColor.set(preset.ambientColor);
      ambientRef.current.color.lerp(tempColor, lerpRate);
      ambientRef.current.intensity += (preset.ambientIntensity - ambientRef.current.intensity) * lerpRate;
    }

    if (hemiRef.current) {
      tempColor.set(preset.hemiSkyColor);
      hemiRef.current.color.lerp(tempColor, lerpRate);

      tempColor.set(preset.hemiGroundColor);
      hemiRef.current.groundColor.lerp(tempColor, lerpRate);
      hemiRef.current.intensity += (preset.hemiIntensity - hemiRef.current.intensity) * lerpRate;
    }

    // 4. Nội suy ánh sáng phản xạ vịnh biển (Fill Light) & ánh sáng rìa ngọn sóng (Rim Light)
    if (fillRef.current) {
      const fillIntensity = phase === 'night' ? 0.22 : phase === 'sunset' ? 0.35 : 0.3;
      const fillColor = phase === 'night' ? '#38BDF8' : phase === 'sunset' ? '#FDBA74' : '#CCFBF1';
      tempColor.set(fillColor);
      fillRef.current.color.lerp(tempColor, lerpRate);
      fillRef.current.intensity += (fillIntensity - fillRef.current.intensity) * lerpRate;
    }

    if (rimRef.current) {
      const rimIntensity = phase === 'night' ? 0.25 : phase === 'sunset' ? 0.4 : 0.3;
      const rimColor = phase === 'night' ? '#38BDF8' : phase === 'sunset' ? '#EA580C' : '#FEF08A';
      tempColor.set(rimColor);
      rimRef.current.color.lerp(tempColor, lerpRate);
      rimRef.current.intensity += (rimIntensity - rimRef.current.intensity) * lerpRate;
    }

    // 5. Nội suy màu sắc vòm trời, sương mù khí quyển và cường độ IBL môi trường
    if (state.scene) {
      if (state.scene.fog && 'isFog' in state.scene.fog) {
        const fog = state.scene.fog as Fog;
        tempColor.set(preset.fogColor);
        fog.color.lerp(tempColor, lerpRate);
        fog.near += (preset.fogNear - fog.near) * lerpRate;
        fog.far += (preset.fogFar - fog.far) * lerpRate;
      }

      if (state.scene.background && 'isColor' in state.scene.background) {
        tempColor.set(preset.skyColor);
        (state.scene.background as Color).lerp(tempColor, lerpRate);
      }

      const targetEnvIntensity = phase === 'night' ? 0.16 : phase === 'sunset' ? 0.28 : 0.75;
      if (typeof (state.scene as any).environmentIntensity !== 'number') {
        (state.scene as any).environmentIntensity = 1.0;
      }
      (state.scene as any).environmentIntensity += (targetEnvIntensity - (state.scene as any).environmentIntensity) * lerpRate;
    }
  });

  return (
    <group data-testid="time-of-day-lighting">
      {/* 1. Bầu trời động (Dynamic Sky Dome Color) */}
      <color attach="background" args={[initialPreset.skyColor]} />

      {/* 2. Sương mù chân trời khí quyển (Dynamic Atmospheric Fog) */}
      <fog attach="fog" args={[initialPreset.fogColor, initialPreset.fogNear, initialPreset.fogFar]} />

      {/* 3. Ánh sáng tán xạ không gian (Ambient Light) */}
      <ambientLight ref={ambientRef} color={initialPreset.ambientColor} intensity={initialPreset.ambientIntensity} />

      {/* 4. Ánh sáng vòm trời & phản xạ mặt đất (Hemisphere Light) */}
      <hemisphereLight
        ref={hemiRef}
        color={initialPreset.hemiSkyColor}
        groundColor={initialPreset.hemiGroundColor}
        intensity={initialPreset.hemiIntensity}
      />

      {/* 5. Nguồn sáng chính: Mặt trời nhiệt đới / Mặt trăng ánh bạc (Directional Light với Shadow Mapping) */}
      <directionalLight
        ref={sunRef}
        position={initialPreset.sunPosition}
        color={initialPreset.sunColor}
        intensity={initialPreset.sunIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-32}
        shadow-camera-right={32}
        shadow-camera-top={32}
        shadow-camera-bottom={-32}
        shadow-camera-near={0.5}
        shadow-camera-far={95}
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
      />

      {/* 6. Fill Light: Ánh phản chiếu từ vịnh biển ngọc bích */}
      <directionalLight
        ref={fillRef}
        position={[20, 16, -18]}
        color="#CCFBF1"
        intensity={0.3}
      />

      {/* 7. Rim Light: Ánh nắng viền trên chóp tháp và ngọn sóng */}
      <directionalLight
        ref={rimRef}
        position={[-10, 18, -24]}
        color="#FEF08A"
        intensity={0.3}
      />
    </group>
  );
}
