import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useDiagnostic3DStore, type DiagnosticHardwareMetrics } from './diagnostic_3d_store';

interface WebGLContextLike {
  getExtension?: (name: string) => { UNMASKED_RENDERER_WEBGL?: number } | null;
  getParameter?: (pname: number) => unknown;
  DEPTH_BITS?: number;
  getContext?: () => WebGLContextLike;
}

function isWebGLContextLike(obj: unknown): obj is WebGLContextLike {
  return typeof obj === 'object' && obj !== null;
}

function resolveGlContext(raw: unknown): WebGLContextLike | null {
  if (!isWebGLContextLike(raw)) return null;
  if (typeof raw.getContext === 'function') {
    const nested = raw.getContext();
    return isWebGLContextLike(nested) ? nested : raw;
  }
  return raw;
}

function queryHardwareMetrics(gl: WebGLContextLike): DiagnosticHardwareMetrics {
  try {
    const ext = typeof gl.getExtension === 'function'
      ? gl.getExtension('WEBGL_debug_renderer_info')
      : null;
    const unmaskedEnum = ext?.UNMASKED_RENDERER_WEBGL ?? 0x9246;
    const rawRenderer = ext && typeof gl.getParameter === 'function'
      ? gl.getParameter(unmaskedEnum)
      : 'Standard WebGL';
    const renderer = typeof rawRenderer === 'string' && rawRenderer.length > 0
      ? rawRenderer
      : 'Standard WebGL';

    const depthEnum = gl.DEPTH_BITS ?? 0x0D56;
    const rawBits = typeof gl.getParameter === 'function' ? gl.getParameter(depthEnum) : 24;
    const bits = typeof rawBits === 'number' && Number.isFinite(rawBits) ? rawBits : 24;

    return { gpuRenderer: renderer, depthBits: bits };
  } catch {
    return { gpuRenderer: 'WebGL Fallback', depthBits: 16 };
  }
}

export function Diagnostic3DPanel(): null {
  const isDebugEnabled = useDiagnostic3DStore((s) => s.isDebugEnabled);
  const gl = useThree((s) => s.gl);
  const glContext = resolveGlContext(gl);

  useEffect(() => {
    if (!isDebugEnabled || !glContext) return;
    useDiagnostic3DStore.getState().setHardwareMetrics(queryHardwareMetrics(glContext));
  }, [isDebugEnabled, glContext]);

  return null;
}
