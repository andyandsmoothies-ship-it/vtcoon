// [TC-IMP29.1/MSS] safe_gltf_model.tsx — Robust GLTF Loader with Headless Guard & Zero-Crash Fallback
// Enforces Headless Guard for 122 Vitest test suites, Suspense wrapper, and procedural fallback

import React, { Suspense, useMemo, useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export type GLTFResult = ReturnType<typeof useGLTF<string>>;

export interface SafeGLTFModelProps {
  readonly url: string;
  readonly fallback?: React.ReactNode;
  readonly scale?: [number, number, number] | number;
  readonly position?: [number, number, number];
  readonly rotation?: [number, number, number];
  readonly castShadow?: boolean;
  readonly receiveShadow?: boolean;
  readonly visible?: boolean;
  readonly forceFallback?: boolean;
  readonly onLoad?: (gltf: GLTFResult, durationMs: number) => void;
  readonly onError?: (error: Error, durationMs: number) => void;
}

export interface DefaultModelFallbackProps {
  readonly scale?: [number, number, number] | number;
  readonly position?: [number, number, number];
  readonly rotation?: [number, number, number];
  readonly color?: string;
  readonly castShadow?: boolean;
  readonly receiveShadow?: boolean;
  readonly visible?: boolean;
}

let headlessGuardOverride: boolean | null = null;
let cachedHasWebGL: boolean | null = null;

/**
 * Overrides headless guard behavior for unit and adversarial testing.
 */
export function setHeadlessGuardOverride(override: boolean | null): void {
  headlessGuardOverride = override;
  cachedHasWebGL = null;
}

/**
 * Determines whether execution is in headless, SSR, or Vitest testing environment.
 * Prevents WebGL loader invocation during headless unit testing.
 * Results are cached to prevent WebGL context exhaustion on repeated renders.
 */
export function isHeadlessOrTestEnv(): boolean {
  if (headlessGuardOverride !== null) {
    return headlessGuardOverride;
  }
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return true;
  }
  if (typeof process !== 'undefined') {
    if (process.env?.NODE_ENV === 'test' || process.env?.VITEST === 'true') {
      return true;
    }
  }
  if (cachedHasWebGL !== null) {
    return !cachedHasWebGL;
  }
  try {
    if (!window.WebGLRenderingContext) {
      cachedHasWebGL = false;
      return true;
    }
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    cachedHasWebGL = Boolean(gl);
    return !cachedHasWebGL;
  } catch (err) {
    // Canvas context retrieval failed in restricted environment; safely treat as headless
    console.warn(`[SafeGLTF] WebGL context check failed: ${err instanceof Error ? err.message : String(err)}`);
    cachedHasWebGL = false;
    return true;
  }
}

/**
 * Default procedural mesh fallback when model is loading or missing.
 */
export function DefaultModelFallback({
  scale,
  position,
  rotation,
  color = '#94A3B8',
  castShadow = true,
  receiveShadow = true,
  visible = true,
}: DefaultModelFallbackProps): React.ReactElement {
  return (
    <group position={position} rotation={rotation} scale={scale} visible={visible}>
      <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
      </mesh>
    </group>
  );
}

interface SafeModelErrorBoundaryProps {
  readonly fallback: React.ReactNode;
  readonly onError?: (error: Error, durationMs: number) => void;
  readonly startTime: number;
  readonly url: string;
  readonly children: React.ReactNode;
}

interface SafeModelErrorBoundaryState {
  readonly hasError: boolean;
  readonly error?: Error;
  readonly prevUrl?: string;
}

/**
 * Error boundary catching GLTF fetch, parse, and network failures.
 */
export class SafeModelErrorBoundary extends React.Component<
  SafeModelErrorBoundaryProps,
  SafeModelErrorBoundaryState
> {
  constructor(props: SafeModelErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, prevUrl: props.url };
  }

  static getDerivedStateFromProps(
    props: SafeModelErrorBoundaryProps,
    state: SafeModelErrorBoundaryState
  ): Partial<SafeModelErrorBoundaryState> | null {
    if (props.url !== state.prevUrl) {
      return {
        hasError: false,
        error: undefined,
        prevUrl: props.url,
      };
    }
    return null;
  }

  static getDerivedStateFromError(error: Error): Partial<SafeModelErrorBoundaryState> {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error): void {
    const durationMs = Math.max(0, performance.now() - this.props.startTime);
    console.warn(`[SafeGLTF] Failed to load model "${this.props.url}" (${durationMs.toFixed(1)}ms): ${error.message}`);
    this.props.onError?.(error, durationMs);
  }

  override render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface InnerGLTFLoaderProps {
  readonly url: string;
  readonly onLoad?: (gltf: GLTFResult, durationMs: number) => void;
  readonly castShadow?: boolean;
  readonly receiveShadow?: boolean;
  readonly scale?: [number, number, number] | number;
  readonly position?: [number, number, number];
  readonly rotation?: [number, number, number];
  readonly startTime: number;
  readonly visible?: boolean;
}

function InnerGLTFLoader({
  url,
  onLoad,
  castShadow = true,
  receiveShadow = true,
  scale,
  position,
  rotation,
  startTime,
  visible = true,
}: InnerGLTFLoaderProps): React.ReactElement {
  const gltf = useGLTF(url);

  // Deep clone scene to prevent multi-instance material/geometry mutation conflicts
  const clonedScene = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloned.traverse((child) => {
      if ('isMesh' in child && child.isMesh) {
        child.castShadow = castShadow;
        child.receiveShadow = receiveShadow;
      }
    });
    return cloned;
  }, [gltf.scene, castShadow, receiveShadow]);

  useEffect(() => {
    const durationMs = Math.max(0, performance.now() - startTime);
    onLoad?.(gltf, durationMs);
  }, [gltf, onLoad, startTime]);

  return (
    <primitive
      object={clonedScene}
      scale={scale}
      position={position}
      rotation={rotation}
      visible={visible}
    />
  );
}

/**
 * Hook for consuming GLTF models safely with headless awareness.
 */
export function useSafeGLTF(
  url: string,
  options?: { readonly forceFallback?: boolean }
): {
  readonly scene: THREE.Group | null;
  readonly gltf: GLTFResult | null;
  readonly isFallback: boolean;
} {
  const isHeadless = options?.forceFallback ?? isHeadlessOrTestEnv();
  if (isHeadless) {
    return { scene: null, gltf: null, isFallback: true };
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const gltf = useGLTF(url);
  return { scene: gltf.scene, gltf, isFallback: false };
}

/**
 * SafeGLTFModel component with Headless Guard, Suspense, and Fallback rendering.
 */
export function SafeGLTFModel({
  url,
  fallback,
  scale,
  position,
  rotation,
  castShadow = true,
  receiveShadow = true,
  visible = true,
  forceFallback,
  onLoad,
  onError,
}: SafeGLTFModelProps): React.ReactElement {
  const startTimeRef = useRef(performance.now());
  const prevUrlRef = useRef(url);

  if (prevUrlRef.current !== url) {
    prevUrlRef.current = url;
    startTimeRef.current = performance.now();
  }

  const isHeadless = forceFallback ?? isHeadlessOrTestEnv();
  const effectiveFallback = fallback ?? (
    <DefaultModelFallback
      scale={scale}
      position={position}
      rotation={rotation}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      visible={visible}
    />
  );

  if (isHeadless) {
    return <>{effectiveFallback}</>;
  }

  return (
    <SafeModelErrorBoundary
      fallback={effectiveFallback}
      onError={onError}
      startTime={startTimeRef.current}
      url={url}
    >
      <Suspense fallback={effectiveFallback}>
        <InnerGLTFLoader
          url={url}
          onLoad={onLoad}
          castShadow={castShadow}
          receiveShadow={receiveShadow}
          scale={scale}
          position={position}
          rotation={rotation}
          startTime={startTimeRef.current}
          visible={visible}
        />
      </Suspense>
    </SafeModelErrorBoundary>
  );
}

SafeGLTFModel.preload = (url: string): void => {
  if (!isHeadlessOrTestEnv()) {
    useGLTF.preload(url);
  }
};

SafeGLTFModel.clear = (url: string): void => {
  if (!isHeadlessOrTestEnv()) {
    useGLTF.clear(url);
  }
};
