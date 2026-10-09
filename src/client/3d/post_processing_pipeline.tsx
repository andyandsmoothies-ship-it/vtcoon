import React, { useState, useMemo, useEffect } from 'react';
import {
  EffectComposer,
  Bloom,
  SelectiveBloom,
  DepthOfField,
  N8AO,
  Vignette,
  ToneMapping,
  SMAA,
} from '@react-three/postprocessing';
import {
  SELECTIVE_BLOOM_LAYER,
  SELECTIVE_BLOOM_DEFAULTS,
  calculateSelectiveBloomThreshold,
  calculateSelectiveBloomIntensity,
} from './selective_bloom_registry';
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
  enableSelectiveBloom?: boolean;
  selectiveBloomIntensity?: number;
  selectiveBloomThreshold?: number;
  vignetteDarkness?: number;
  aoIntensity?: number;
  aoRadius?: number;
  aoHalfRes?: boolean;
  multisampling?: number;
  fps?: number;
  isBloomActive?: boolean;
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
  enableSelectiveBloom: false,
  selectiveBloomIntensity: SELECTIVE_BLOOM_DEFAULTS.intensity,
  selectiveBloomThreshold: SELECTIVE_BLOOM_DEFAULTS.luminanceThreshold,
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

function useSafeTelemetryFps(): number {
  if (typeof window === 'undefined') {
    return useTelemetryStore.getState().metrics.fps;
  }
  return useTelemetryStore((s) => s.metrics.fps);
}

export function renderPostProcessingPasses(
  props: PostProcessingPipelineProps,
  targetVector: Vector3,
  isBloomActive: boolean = true
): React.ReactElement[] {
  const {
    isAuctionActive = false,
    enableDof = DEFAULT_PIPELINE_CONFIG.enableDof,
    enableBloom = DEFAULT_PIPELINE_CONFIG.enableBloom,
    enableAo = DEFAULT_PIPELINE_CONFIG.enableAo,
    isMobile = false,
    disableAoOnMobile = false,
    enableVignette = DEFAULT_PIPELINE_CONFIG.enableVignette,
    enableToneMapping = DEFAULT_PIPELINE_CONFIG.enableToneMapping,
    enableSmaa = DEFAULT_PIPELINE_CONFIG.enableSmaa,
    dofFocusRange = DEFAULT_PIPELINE_CONFIG.dofFocusRange,
    dofBokehScale: propDofBokehScale,
    bloomIntensity = DEFAULT_PIPELINE_CONFIG.bloomIntensity,
    bloomThreshold: propBloomThreshold,
    enableSelectiveBloom = DEFAULT_PIPELINE_CONFIG.enableSelectiveBloom,
    selectiveBloomIntensity: propSelectiveBloomIntensity,
    selectiveBloomThreshold: propSelectiveBloomThreshold,
    vignetteDarkness: propVignetteDarkness,
    aoIntensity = DEFAULT_PIPELINE_CONFIG.aoIntensity,
    aoRadius = DEFAULT_PIPELINE_CONFIG.aoRadius,
    aoHalfRes = DEFAULT_PIPELINE_CONFIG.aoHalfRes,
    fps,
  } = props;

  const resolvedBokehScale = propDofBokehScale !== undefined
    ? propDofBokehScale
    : DEFAULT_PIPELINE_CONFIG.dofBokehScale;

  const adaptiveAo = resolveAdaptivePostProcessing({
    fps: fps ?? 60,
    isMobile: Boolean(isMobile || disableAoOnMobile),
    enableAo,
  });
  const resolvedEnableAo = adaptiveAo.enableAo;
  const resolvedAoQuality = adaptiveAo.aoQuality;
  const resolvedAoHalfRes = aoHalfRes !== undefined ? aoHalfRes : adaptiveAo.aoHalfRes;
  const resolvedEnableSmaa = enableSmaa && !isMobile;

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

  const passes: React.ReactElement[] = [];

  if (resolvedEnableAo) {
    passes.push(
      <N8AO
        key="ao"
        aoRadius={aoRadius}
        intensity={aoIntensity}
        distanceFalloff={DEFAULT_PIPELINE_CONFIG.aoDistanceFalloff}
        halfRes={resolvedAoHalfRes}
        quality={resolvedAoQuality}
        color="#1E293B"
      />
    );
  }

  passes.push(
    <DepthOfField
      key="dof"
      target={targetVector}
      focusRange={dofFocusRange}
      bokehScale={enableDof ? resolvedBokehScale : 0}
    />
  );

  if (resolvedEnableBloom) {
    passes.push(
      enableSelectiveBloom ? (
        <SelectiveBloom
          key="bloom"
          selectionLayer={SELECTIVE_BLOOM_LAYER}
          luminanceThreshold={
            propSelectiveBloomThreshold !== undefined
              ? propSelectiveBloomThreshold
              : calculateSelectiveBloomThreshold(Boolean(isAuctionActive))
          }
          luminanceSmoothing={DEFAULT_PIPELINE_CONFIG.bloomSmoothing}
          intensity={
            propSelectiveBloomIntensity !== undefined
              ? propSelectiveBloomIntensity
              : calculateSelectiveBloomIntensity(Boolean(isMobile), Boolean(isAuctionActive))
          }
          mipmapBlur={!isMobile}
          radius={DEFAULT_PIPELINE_CONFIG.bloomRadius}
        />
      ) : (
        <Bloom
          key="bloom"
          luminanceThreshold={resolvedBloomThreshold}
          luminanceSmoothing={DEFAULT_PIPELINE_CONFIG.bloomSmoothing}
          intensity={isMobile ? 0.12 : (isAuctionActive ? 0.30 : bloomIntensity)}
          mipmapBlur={!isMobile}
          radius={DEFAULT_PIPELINE_CONFIG.bloomRadius}
        />
      )
    );
  }

  if (enableToneMapping) {
    passes.push(
      <ToneMapping key="tonemapping" mode={ToneMappingMode.AGX} />
    );
  }

  if (enableVignette) {
    passes.push(
      <Vignette
        key="vignette"
        offset={DEFAULT_PIPELINE_CONFIG.vignetteOffset}
        darkness={resolvedVignetteDarkness}
        eskil={false}
      />
    );
  }

  if (resolvedEnableSmaa) {
    passes.push(
      <SMAA key="smaa" />
    );
  }

  return passes;
}

export function PostProcessingPipeline(
  props: PostProcessingPipelineProps
): React.ReactElement<{ children?: React.ReactNode }> | null {
  if (props.enabled === false) {
    return null;
  }

  const dofTarget = props.dofTarget ?? DEFAULT_PIPELINE_CONFIG.dofTarget;
  const targetVector = new Vector3(dofTarget[0], dofTarget[1], dofTarget[2]);
  const defaultBloomActive = props.fps !== undefined
    ? props.fps >= (props.isMobile ? 28 : 42)
    : true;
  const initialBloom = props.isBloomActive ?? defaultBloomActive;

  return (
    <ActivePostProcessingPipeline
      multisampling={props.multisampling ?? DEFAULT_PIPELINE_CONFIG.multisampling}
      {...props}
    >
      {renderPostProcessingPasses(props, targetVector, initialBloom)}
    </ActivePostProcessingPipeline>
  );
}

export function ActivePostProcessingPipeline(
  props: PostProcessingPipelineProps & { children?: React.ReactNode }
): React.ReactElement<{ children?: React.ReactNode }> {
  const {
    multisampling = DEFAULT_PIPELINE_CONFIG.multisampling,
    dofTarget = DEFAULT_PIPELINE_CONFIG.dofTarget,
    isMobile = false,
    fps,
    children,
  } = props;

  const telemetryFps = useSafeTelemetryFps();
  const currentFps = fps !== undefined ? fps : telemetryFps;
  const targetVector = new Vector3(dofTarget[0], dofTarget[1], dofTarget[2]);

  const [isBloomActive, setIsBloomActive] = useState(true);

  useEffect(() => {
    const lowThreshold = isMobile ? 28 : 42;
    const highThreshold = isMobile ? 35 : 48;
    if (currentFps < lowThreshold && isBloomActive) {
      setIsBloomActive(false);
    } else if (currentFps >= highThreshold && !isBloomActive) {
      setIsBloomActive(true);
    }
  }, [currentFps, isMobile, isBloomActive]);

  const passes = renderPostProcessingPasses({ ...props, fps: currentFps }, targetVector, isBloomActive);

  return (
    <EffectComposer multisampling={multisampling} autoClear={false}>
      {children ?? passes}
    </EffectComposer>
  );
}
