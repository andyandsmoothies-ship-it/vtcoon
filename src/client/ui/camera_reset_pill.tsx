// [IMP-190] Camera Snap Pill — Restores default overview camera angle
import React from 'react';
import { useGameStore } from '../store/game_store';
import { HapticEngine } from '../haptics/haptic_engine';

declare global {
  interface Window {
    __resetCameraToDefault?: () => void;
  }
}

function getCameraPillState() {
  try {
    return {
      hasUserCustomCamera: useGameStore((s) => s.hasUserCustomCamera),
      activeModal: useGameStore((s) => s.activeModal),
      setHasUserCustomCamera: useGameStore((s) => s.setHasUserCustomCamera),
    };
  } catch {
    const s = useGameStore.getState();
    return {
      hasUserCustomCamera: s.hasUserCustomCamera,
      activeModal: s.activeModal,
      setHasUserCustomCamera: s.setHasUserCustomCamera,
    };
  }
}

export function CameraResetPill(): React.ReactElement | null {
  const { hasUserCustomCamera, activeModal, setHasUserCustomCamera } = getCameraPillState();
  if (!hasUserCustomCamera || activeModal !== null) return null;

  const handleClick = () => {
    try { HapticEngine.selection(); } catch {}
    if (typeof window !== 'undefined') window.__resetCameraToDefault?.();
    setHasUserCustomCamera(false);
  };

  return (
    <button
      type="button"
      data-testid="camera-reset-pill-btn"
      onClick={handleClick}
      className="pointer-events-auto min-h-[44px] px-3.5 py-2 inline-flex items-center gap-1.5 rounded-full bg-[#FFFDF8] hover:bg-amber-50 text-slate-900 border-2 border-slate-900 shadow-[0_3px_0_0_#0f172a] active:translate-y-0.5 active:shadow-[0_1px_0_0_#0f172a] transition-all text-xs font-bold cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
    >
      <span className="text-base" aria-hidden="true">🧭</span>
      <span>Góc Nhìn Chuẩn</span>
    </button>
  );
}
