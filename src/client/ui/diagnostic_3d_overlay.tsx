import React from 'react';
import { useDiagnostic3DStore } from '../3d/diagnostic_3d_store';

export function Diagnostic3DOverlay(): React.ReactElement | null {
  const isDebugEnabled = useDiagnostic3DStore((s) => s.isDebugEnabled);
  const isOpen = useDiagnostic3DStore((s) => s.isOpen);
  const isOceanVisible = useDiagnostic3DStore((s) => s.isOceanVisible);
  const isTableVisible = useDiagnostic3DStore((s) => s.isTableVisible);
  const isCityVisible = useDiagnostic3DStore((s) => s.isCityVisible);
  const isBoardVisible = useDiagnostic3DStore((s) => s.isBoardVisible);
  const isShadowsEnabled = useDiagnostic3DStore((s) => s.isShadowsEnabled);
  const forcedLowDpr = useDiagnostic3DStore((s) => s.forcedLowDpr);
  const gpuRenderer = useDiagnostic3DStore((s) => s.gpuRenderer);
  const depthBits = useDiagnostic3DStore((s) => s.depthBits);
  const toggleOcean = useDiagnostic3DStore((s) => s.toggleOcean);
  const toggleTable = useDiagnostic3DStore((s) => s.toggleTable);
  const toggleCity = useDiagnostic3DStore((s) => s.toggleCity);
  const toggleBoard = useDiagnostic3DStore((s) => s.toggleBoard);
  const toggleShadows = useDiagnostic3DStore((s) => s.toggleShadows);
  const toggleLowDpr = useDiagnostic3DStore((s) => s.toggleLowDpr);
  const toggleOpen = useDiagnostic3DStore((s) => s.toggleOpen);

  if (!isDebugEnabled || typeof document === 'undefined') return null;

  return (
    <div className="fixed top-2 left-2 z-[9999] pointer-events-auto font-mono text-xs select-none">
      {!isOpen ? (
        <button
          type="button"
          onClick={toggleOpen}
          className="px-2 py-1 bg-slate-900/80 text-cyan-400 border border-cyan-500/40 rounded shadow backdrop-blur cursor-pointer"
        >
          🛠️ 3D DEBUG
        </button>
      ) : (
        <div className="p-3 bg-slate-950/95 text-slate-200 border border-cyan-500/60 rounded-lg shadow-2xl backdrop-blur max-w-xs space-y-2">
          <div className="flex justify-between items-center border-b border-slate-800 pb-1">
            <span className="font-bold text-cyan-400">3D DIAGNOSTICS</span>
            <button
              type="button"
              onClick={toggleOpen}
              className="text-slate-400 hover:text-white px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="text-[10px] text-slate-400 space-y-0.5">
            <div>GPU: {gpuRenderer}</div>
            <div>Depth: {depthBits}-bit | Highp: Enforced</div>
          </div>
          <div className="grid grid-cols-1 gap-1.5 pt-1">
            <button
              type="button"
              onClick={toggleShadows}
              className={`px-2 py-1 rounded border text-left flex justify-between cursor-pointer ${
                isShadowsEnabled
                  ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300'
                  : 'bg-red-950/40 border-red-500/40 text-red-400'
              }`}
            >
              <span>Shadow Maps</span>
              <span>{isShadowsEnabled ? 'ON' : 'OFF (Pure)'}</span>
            </button>
            <button
              type="button"
              onClick={toggleLowDpr}
              className={`px-2 py-1 rounded border text-left flex justify-between cursor-pointer ${
                forcedLowDpr
                  ? 'bg-amber-950/60 border-amber-500/60 text-amber-300'
                  : 'bg-slate-900/60 border-slate-700 text-slate-300'
              }`}
            >
              <span>Force Low DPR</span>
              <span>{forcedLowDpr ? '0.5x' : 'Normal'}</span>
            </button>
            <button
              type="button"
              onClick={toggleBoard}
              className={`px-2 py-1 rounded border text-left flex justify-between cursor-pointer ${
                isBoardVisible
                  ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300'
                  : 'bg-red-950/40 border-red-500/40 text-red-400'
              }`}
            >
              <span>Board & Tiles</span>
              <span>{isBoardVisible ? 'ON' : 'OFF'}</span>
            </button>
            <button
              type="button"
              onClick={toggleCity}
              className={`px-2 py-1 rounded border text-left flex justify-between cursor-pointer ${
                isCityVisible
                  ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300'
                  : 'bg-red-950/40 border-red-500/40 text-red-400'
              }`}
            >
              <span>City Diorama</span>
              <span>{isCityVisible ? 'ON' : 'OFF'}</span>
            </button>
            <button
              type="button"
              onClick={toggleOcean}
              className={`px-2 py-1 rounded border text-left flex justify-between cursor-pointer ${
                isOceanVisible
                  ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300'
                  : 'bg-red-950/40 border-red-500/40 text-red-400'
              }`}
            >
              <span>Ocean & Waves</span>
              <span>{isOceanVisible ? 'ON' : 'OFF'}</span>
            </button>
            <button
              type="button"
              onClick={toggleTable}
              className={`px-2 py-1 rounded border text-left flex justify-between cursor-pointer ${
                isTableVisible
                  ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300'
                  : 'bg-red-950/40 border-red-500/40 text-red-400'
              }`}
            >
              <span>Walnut Table</span>
              <span>{isTableVisible ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
