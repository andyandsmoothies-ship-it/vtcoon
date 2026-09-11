// [UI-S04/MSS] PostProcessingPipeline — Cinematic Macro Tilt-Shift DoF, Champagne Bloom, Screen-space Ambient Occlusion & Film Tone
import React from 'react';
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  N8AO,
  Vignette,
  ToneMapping,
} from '@react-three/postprocessing';
import { Vector3 } from 'three';
import { ToneMappingMode } from 'postprocessing';

export interface PostProcessingPipelineProps {
  enabled?: boolean;
  enableDof?: boolean;
  enableBloom?: boolean;
  enableAo?: boolean;
  enableVignette?: boolean;
  enableToneMapping?: boolean;
  dofTarget?: [number, number, number];
  dofFocusRange?: number;
  dofFocalLength?: number;
  dofBokehScale?: number;
  bloomIntensity?: number;
  bloomThreshold?: number;
  aoIntensity?: number;
  aoRadius?: number;
}

export const DEFAULT_PIPELINE_CONFIG = {
  enabled: true,
  enableDof: true,
  enableBloom: true,
  enableAo: true,
  enableVignette: true,
  enableToneMapping: true,
  dofTarget: [0, 0, 0] as [number, number, number],
  dofFocusRange: 34.0,
  dofFocalLength: 34.0,
  dofBokehScale: 1.3,
  bloomIntensity: 0.55,
  bloomThreshold: 0.90,
  bloomSmoothing: 0.25,
  bloomRadius: 0.65,
  aoIntensity: 1.25,
  aoRadius: 1.0,
  aoDistanceFalloff: 2.0,
  vignetteOffset: 0.32,
  vignetteDarkness: 0.48,
} as const;

export function PostProcessingPipeline({
  enabled = DEFAULT_PIPELINE_CONFIG.enabled,
  enableDof = DEFAULT_PIPELINE_CONFIG.enableDof,
  enableBloom = DEFAULT_PIPELINE_CONFIG.enableBloom,
  enableAo = DEFAULT_PIPELINE_CONFIG.enableAo,
  enableVignette = DEFAULT_PIPELINE_CONFIG.enableVignette,
  enableToneMapping = DEFAULT_PIPELINE_CONFIG.enableToneMapping,
  dofTarget = DEFAULT_PIPELINE_CONFIG.dofTarget,
  dofFocusRange = DEFAULT_PIPELINE_CONFIG.dofFocusRange,
  dofBokehScale = DEFAULT_PIPELINE_CONFIG.dofBokehScale,
  bloomIntensity = DEFAULT_PIPELINE_CONFIG.bloomIntensity,
  bloomThreshold = DEFAULT_PIPELINE_CONFIG.bloomThreshold,
  aoIntensity = DEFAULT_PIPELINE_CONFIG.aoIntensity,
  aoRadius = DEFAULT_PIPELINE_CONFIG.aoRadius,
}: PostProcessingPipelineProps): React.ReactElement | null {
  if (!enabled) {
    return null;
  }

  const targetVector = new Vector3(dofTarget[0], dofTarget[1], dofTarget[2]);

  return (
    <EffectComposer multisampling={4} autoClear={false}>
      {/* 1. SSAO / Contact AO: Khóa chặt chân cọc C0, nhà C1-C3, xúc xắc và viền sa bàn */}
      {enableAo && (
        <N8AO
          aoRadius={aoRadius}
          intensity={aoIntensity}
          distanceFalloff={DEFAULT_PIPELINE_CONFIG.aoDistanceFalloff}
          quality="medium"
          color="#0B0F19"
        />
      )}

      {/* 2. Bloom: Ánh kim vàng champagne, đèn đỉnh tháp Landmark Bitexco, đèn ngọn hải đăng */}
      {enableBloom && (
        <Bloom
          luminanceThreshold={bloomThreshold}
          luminanceSmoothing={DEFAULT_PIPELINE_CONFIG.bloomSmoothing}
          intensity={bloomIntensity}
          mipmapBlur
          radius={DEFAULT_PIPELINE_CONFIG.bloomRadius}
        />
      )}

      {/* 3. Depth of Field (Tilt-Shift Macro sa bàn): Tiêu cự lấy nét trung tâm bàn cờ [0, 0, 0] */}
      {enableDof && (
        <DepthOfField
          target={targetVector}
          focusRange={dofFocusRange}
          bokehScale={dofBokehScale}
        />
      )}

      {/* 4. Lens Vignette: Tối góc quang học điện ảnh nhẹ nhàng */}
      {enableVignette && (
        <Vignette
          offset={DEFAULT_PIPELINE_CONFIG.vignetteOffset}
          darkness={DEFAULT_PIPELINE_CONFIG.vignetteDarkness}
          eskil={false}
        />
      )}

      {/* 5. Tone Mapping: Chuẩn ACES Filmic dải tương phản điện ảnh cao cấp */}
      {enableToneMapping && (
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      )}
    </EffectComposer>
  );
}
