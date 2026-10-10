import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
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

function Diagnostic3DContent(): React.ReactElement | null {
  const isDebugEnabled = useDiagnostic3DStore((s) => s.isDebugEnabled);
  const isOpen = useDiagnostic3DStore((s) => s.isOpen);
  const isOceanVisible = useDiagnostic3DStore((s) => s.isOceanVisible);
  const isTableVisible = useDiagnostic3DStore((s) => s.isTableVisible);
  const isCityVisible = useDiagnostic3DStore((s) => s.isCityVisible);
  const gpuRenderer = useDiagnostic3DStore((s) => s.gpuRenderer);
  const depthBits = useDiagnostic3DStore((s) => s.depthBits);
  const toggleOcean = useDiagnostic3DStore((s) => s.toggleOcean);
  const toggleTable = useDiagnostic3DStore((s) => s.toggleTable);
  const toggleCity = useDiagnostic3DStore((s) => s.toggleCity);
  const toggleOpen = useDiagnostic3DStore((s) => s.toggleOpen);
  const setHardwareMetrics = useDiagnostic3DStore((s) => s.setHardwareMetrics);

  const three = useThree();
  const glContext = resolveGlContext(three?.gl);

  useEffect(() => {
    if (!glContext) return;
    setHardwareMetrics(queryHardwareMetrics(glContext));
  }, [glContext, setHardwareMetrics]);

  if (!isDebugEnabled || typeof document === 'undefined') return null;

  return createPortal(
    React.createElement('div', {
      className: 'fixed top-2 left-2 z-[9999] pointer-events-auto font-mono text-xs select-none',
    },
      !isOpen ? (
        React.createElement('button', {
          onClick: toggleOpen,
          className: 'px-2 py-1 bg-slate-900/80 text-cyan-400 border border-cyan-500/40 rounded shadow backdrop-blur cursor-pointer',
        }, '🛠️ 3D DEBUG')
      ) : (
        React.createElement('div', {
          className: 'p-3 bg-slate-950/95 text-slate-200 border border-cyan-500/60 rounded-lg shadow-2xl backdrop-blur max-w-xs space-y-2',
        },
          React.createElement('div', { className: 'flex justify-between items-center border-b border-slate-800 pb-1' },
            React.createElement('span', { className: 'font-bold text-cyan-400' }, '3D DIAGNOSTICS'),
            React.createElement('button', { onClick: toggleOpen, className: 'text-slate-400 hover:text-white px-1 cursor-pointer' }, '✕')
          ),
          React.createElement('div', { className: 'text-[10px] text-slate-400 space-y-0.5' },
            React.createElement('div', null, `GPU: ${gpuRenderer}`),
            React.createElement('div', null, `Depth: ${depthBits}-bit | Highp: Enforced`)
          ),
          React.createElement('div', { className: 'grid grid-cols-1 gap-1.5 pt-1' },
            React.createElement('button', {
              onClick: toggleOcean,
              className: `px-2 py-1 rounded border text-left flex justify-between cursor-pointer ${isOceanVisible ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300' : 'bg-red-950/40 border-red-500/40 text-red-400'}`,
            }, React.createElement('span', null, 'Ocean & Waves'), React.createElement('span', null, isOceanVisible ? 'ON' : 'OFF')),
            React.createElement('button', {
              onClick: toggleTable,
              className: `px-2 py-1 rounded border text-left flex justify-between cursor-pointer ${isTableVisible ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300' : 'bg-red-950/40 border-red-500/40 text-red-400'}`,
            }, React.createElement('span', null, 'Walnut Table'), React.createElement('span', null, isTableVisible ? 'ON' : 'OFF')),
            React.createElement('button', {
              onClick: toggleCity,
              className: `px-2 py-1 rounded border text-left flex justify-between cursor-pointer ${isCityVisible ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300' : 'bg-red-950/40 border-red-500/40 text-red-400'}`,
            }, React.createElement('span', null, 'City Diorama'), React.createElement('span', null, isCityVisible ? 'ON' : 'OFF'))
          )
        )
      )
    ),
    document.body
  );
}

export function Diagnostic3DPanel(): React.ReactElement | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;
  return <Diagnostic3DContent />;
}
