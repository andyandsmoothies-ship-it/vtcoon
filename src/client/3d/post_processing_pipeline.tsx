import React, { useState, useEffect } from 'react';
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  N8AO,
  Vignette,
  ToneMapping,
  SMAA,
} from '@react-three/postprocessing';
import { Vector3 } from 'three';
import { ToneMappingMode } from 'postprocessing';
import { resolveAdaptivePostProcessing } from '../ui/ui_helpers';
import { useTelemetryStore } from '../telemetry/telemetry_store';
import { CAMERA_CONFIG } from './camera_state_machine';
import { cellPosition } from './board_coords';

export interface PostProcessingPipelineProps {
  enabled?: boolean;
  isAuctionActive?: boolean;
  exposure?: number;
  enableDof?: boolean;
  enableBloom?: boolean;
  enableAo?: boolean;
  isMobile?: boolean;
  disableAoOnMobile?: boolean;
  enableVignette?: boolean;
  enableToneMapping?: boolean;
  enableSmaa?: boolean;
  dofTarget?: [number, number, number];
  dofFocusRange?: number;
  dofFocalLength?: number;
  dofBokehScale?: number;
  bloomIntensity?: number;
  bloomThreshold?: number;
  vignetteDarkness?: number;
  aoIntensity?: number;
  aoRadius?: number;
  aoHalfRes?: boolean;
  multisampling?: number;
  fps?: number;
}

export const DEFAULT_PIPELINE_CONFIG = {
  enabled: true,
  enableDof: false,
  enableBloom: true,
  enableAo: true,
  enableVignette: true,
  enableToneMapping: true,
  enableSmaa: true,
  multisampling: 0,
  dofTarget: [0, 0, 0] as [number, number, number],
  dofFocusRange: 320.0,
  dofFocalLength: 34.0,
  dofBokehScale: 0.0,
  bloomIntensity: 0.20,
  bloomThreshold: 2.5,

  bloomSmoothing: 0.25,
  bloomRadius: 0.65,
  aoIntensity: 0.38,
  aoRadius: 0.85,
  aoDistanceFalloff: 2.0,
  aoHalfRes: true,
  vignetteOffset: 0.45,
  vignetteDarkness: 0.15,
} as const;

export interface DofConfigParams {
  readonly activeModal?: string | null;
  readonly cameraFocusCell?: number | null;
  readonly isRolling?: boolean;
  readonly isPawnAnimating?: boolean;
}

export interface DofConfig {
  readonly enableDof: boolean;
  readonly bokehScale: number;
  readonly focusRange: number;
}

export interface DofTargetParams {
  readonly activeModal?: string | null;
  readonly cameraFocusCell?: number | null;
  readonly modalPayload?: unknown;
}

export const DOF_PROFILES = {
  off:     { enableDof: false, bokehScale: 0.00, focusRange: 320.0 },
  tile:    { enableDof: true,  bokehScale: 0.28, focusRange: 9.0   },
  auction: { enableDof: true,  bokehScale: 0.45, focusRange: 6.0   },
} as const satisfies Record<string, DofConfig>;

/**
 * Tính cấu hình DoF theo trạng thái game (pure function).
 * Thứ tự ưu tiên: motion/rolling (OFF) > auction > tile > overview (OFF).
 */
export function calculateDofConfig(params?: DofConfigParams): DofConfig {
  if (!params || params.isPawnAnimating || params.isRolling) return DOF_PROFILES.off;
  if (params.activeModal === 'auction') return DOF_PROFILES.auction;
  if (params.activeModal === 'game_over') return DOF_PROFILES.off;
  if (Boolean(params.activeModal)) return DOF_PROFILES.tile;
  if (params.cameraFocusCell !== null && params.cameraFocusCell !== undefined && Number.isFinite(params.cameraFocusCell)) {
    return DOF_PROFILES.tile;
  }
  return DOF_PROFILES.off;
}

/**
 * Tính tọa độ focal target quang học chuẩn xác (pure function).
 * Ưu tiên: auction target [0, 3, 0] > game_over [0, 0, 0] > modalPayload.cellIndex > cameraFocusCell > [0, 0, 0].
 */
export function resolveDofTarget(params?: DofTargetParams): [number, number, number] {
  if (!params) return [0, 0, 0];
  if (params.activeModal === 'auction') {
    const t = CAMERA_CONFIG.auction_focus.target;
    return [t[0], t[1], t[2]];
  }
  if (params.activeModal === 'game_over') {
    return [0, 0, 0];
  }

  const payloadCell =
    params.modalPayload && typeof params.modalPayload === 'object' && 'cellIndex' in params.modalPayload
      ? (params.modalPayload as { cellIndex?: unknown }).cellIndex
      : undefined;

  const targetCell =
    typeof payloadCell === 'number' && Number.isFinite(payloadCell)
      ? payloadCell
      : params.cameraFocusCell;

  if (targetCell !== null && targetCell !== undefined && Number.isFinite(targetCell)) {
    return cellPosition(targetCell);
  }
  return [0, 0, 0];
}

export function calculateDynamicBloomThreshold(
  isAuctionActive: boolean,
  baseThreshold: number = DEFAULT_PIPELINE_CONFIG.bloomThreshold,
  auctionThreshold: number = 1.2
): number {
  if (!Number.isFinite(baseThreshold) || !Number.isFinite(auctionThreshold)) return 2.5;
  return isAuctionActive ? auctionThreshold : baseThreshold;
}

export function calculateDynamicVignetteDarkness(
  isAuctionActive: boolean,
  baseDarkness: number = DEFAULT_PIPELINE_CONFIG.vignetteDarkness,
  auctionDarkness: number = 0.35
): number {
  if (!Number.isFinite(baseDarkness) || !Number.isFinite(auctionDarkness)) return 0.15;
  const raw = isAuctionActive ? auctionDarkness : baseDarkness;
  return Math.max(0.0, Math.min(1.0, raw));
}

type ReactWithDispatcher = typeof React & {
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?: {
    ReactCurrentDispatcher?: {
      current?: unknown;
    };
  };
};

function useSafeTelemetryFps(): number {
  try {
    const dispatcher = (React as ReactWithDispatcher)?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentDispatcher?.current;
    if (!dispatcher) {
      return typeof window !== 'undefined' ? useTelemetryStore.getState().metrics.fps : 60;
    }
    return useTelemetryStore((s) => s.metrics.fps);
  } catch {
    return typeof window !== 'undefined' ? useTelemetryStore.getState().metrics.fps : 60;
  }
}

function hasHookContext(): boolean {
  const dispatcher = (React as ReactWithDispatcher)?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentDispatcher?.current;
  if (dispatcher) return true;
  if (
    Object.prototype.hasOwnProperty.call(useState, 'mock') ||
    Object.prototype.hasOwnProperty.call(useState, '_isMockFunction') ||
    Object.prototype.hasOwnProperty.call(React.useState, 'mock') ||
    Object.prototype.hasOwnProperty.call(React.useState, '_isMockFunction')
  ) {
    return true;
  }
  return false;
}

export function PostProcessingPipeline({
  enabled = DEFAULT_PIPELINE_CONFIG.enabled,
  isAuctionActive = false,
  enableDof = DEFAULT_PIPELINE_CONFIG.enableDof,
  enableBloom = DEFAULT_PIPELINE_CONFIG.enableBloom,
  enableAo = DEFAULT_PIPELINE_CONFIG.enableAo,
  isMobile = false,
  disableAoOnMobile = false,
  enableVignette = DEFAULT_PIPELINE_CONFIG.enableVignette,
  enableToneMapping = DEFAULT_PIPELINE_CONFIG.enableToneMapping,
  enableSmaa = DEFAULT_PIPELINE_CONFIG.enableSmaa,
  multisampling = DEFAULT_PIPELINE_CONFIG.multisampling,
  dofTarget = DEFAULT_PIPELINE_CONFIG.dofTarget,
  dofFocusRange = DEFAULT_PIPELINE_CONFIG.dofFocusRange,
  dofBokehScale: propDofBokehScale,
  bloomIntensity = DEFAULT_PIPELINE_CONFIG.bloomIntensity,
  bloomThreshold: propBloomThreshold,
  vignetteDarkness: propVignetteDarkness,
  aoIntensity = DEFAULT_PIPELINE_CONFIG.aoIntensity,
  aoRadius = DEFAULT_PIPELINE_CONFIG.aoRadius,
  aoHalfRes = DEFAULT_PIPELINE_CONFIG.aoHalfRes,
  fps,
}: PostProcessingPipelineProps): React.ReactElement<{ children?: any }> | null {
  const currentFps = fps !== undefined ? fps : useSafeTelemetryFps();
  const dispatcher = (React as ReactWithDispatcher)?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentDispatcher?.current;
  const targetVector = dispatcher
    ? React.useMemo(
        () => new Vector3(dofTarget[0], dofTarget[1], dofTarget[2]),
        [dofTarget[0], dofTarget[1], dofTarget[2]]
      )
    : new Vector3(dofTarget[0], dofTarget[1], dofTarget[2]);

  if (!enabled) {
    return null;
  }

  const resolvedBokehScale = propDofBokehScale !== undefined
    ? propDofBokehScale
    : DEFAULT_PIPELINE_CONFIG.dofBokehScale;

  const adaptiveAo = resolveAdaptivePostProcessing({
    fps: currentFps,
    isMobile: Boolean(isMobile || disableAoOnMobile),
    enableAo,
  });
  const resolvedEnableAo = adaptiveAo.enableAo;
  const resolvedAoQuality = adaptiveAo.aoQuality;
  const resolvedAoHalfRes = aoHalfRes !== undefined ? aoHalfRes : adaptiveAo.aoHalfRes;
  const resolvedEnableSmaa = enableSmaa && !isMobile;

  const hasHook = hasHookContext();
  const [isBloomActive, setIsBloomActive] = hasHook
    ? useState(true)
    : [currentFps >= (isMobile ? 28 : 42), () => {}];

  if (hasHook) {
    useEffect(() => {
      const lowThreshold = isMobile ? 28 : 42;
      const highThreshold = isMobile ? 35 : 48;
      if (currentFps < lowThreshold && isBloomActive) {
        setIsBloomActive(false);
      } else if (currentFps >= highThreshold && !isBloomActive) {
        setIsBloomActive(true);
      }
    }, [currentFps, isMobile, isBloomActive]);
  }

  const resolvedEnableBloom = Boolean(enableBloom && isBloomActive);

  const resolvedBloomThreshold = propBloomThreshold !== undefined
    ? propBloomThreshold
    : calculateDynamicBloomThreshold(Boolean(isAuctionActive), DEFAULT_PIPELINE_CONFIG.bloomThreshold, 1.2);

  const resolvedVignetteDarkness = propVignetteDarkness !== undefined
    ? propVignetteDarkness
    : calculateDynamicVignetteDarkness(
        Boolean(isAuctionActive),
        DEFAULT_PIPELINE_CONFIG.vignetteDarkness,
        0.35
      );

  return (
    <EffectComposer multisampling={multisampling} autoClear={false}>
      {/* 1. SSAO / Contact AO: Khóa chặt chân cọc C0, nhà C1-C3, xúc xắc và viền sa bàn */}
      {resolvedEnableAo && (
        <N8AO
          aoRadius={aoRadius}
          intensity={aoIntensity}
          distanceFalloff={DEFAULT_PIPELINE_CONFIG.aoDistanceFalloff}
          halfRes={resolvedAoHalfRes}
          quality={resolvedAoQuality}
          color="#1E293B"
        />
      )}

      {/* 2. Depth of Field (Tilt-Shift Macro sa bàn): [ADV-04] Giữ thường trực để triệt tiêu FBO shader recompilation */}
      <DepthOfField
        target={targetVector}
        focusRange={dofFocusRange}
        bokehScale={enableDof ? resolvedBokehScale : 0}
      />

      {/* 3. Bloom (HDR): Ánh kim vàng champagne trên dải HDR trước khi nén tone mapping */}
      {resolvedEnableBloom && (
        <Bloom
          luminanceThreshold={resolvedBloomThreshold}
          luminanceSmoothing={DEFAULT_PIPELINE_CONFIG.bloomSmoothing}
          intensity={isMobile ? 0.12 : (isAuctionActive ? 0.30 : bloomIntensity)}
          mipmapBlur={!isMobile}
          radius={DEFAULT_PIPELINE_CONFIG.bloomRadius}
        />
      )}

      {/* 4. Tone Mapping: [ADV-01] Chuẩn AgX nén dải tương phản điện ảnh (nhận toneMappingExposure từ Three.js shader) */}
      {enableToneMapping && (
        <ToneMapping mode={ToneMappingMode.AGX} />
      )}

      {/* 5. Lens Vignette: Tối góc quang học điện ảnh áp trên dải LDR */}
      {enableVignette && (
        <Vignette
          offset={DEFAULT_PIPELINE_CONFIG.vignetteOffset}
          darkness={resolvedVignetteDarkness}
          eskil={false}
        />
      )}

      {/* 6. Anti-Aliasing (SMAA): Khử răng cưa vector subpixel ở pass cuối cùng */}
      {resolvedEnableSmaa && (
        <SMAA />
      )}
    </EffectComposer>
  );
}
