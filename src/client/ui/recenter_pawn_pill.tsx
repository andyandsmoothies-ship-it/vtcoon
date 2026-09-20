// [UI-S03/MSS][IMP-133] RecenterPawnPill — Floating HUD pill to return camera focus to player pawn
import React from 'react';

export interface RecenterPawnPillProps {
  readonly activeModal?: string | null;
  readonly cameraFocusCell: number | null;
  readonly pawnPosition?: number;
  readonly pawnPos?: number;
  readonly onRecenter?: () => void;
}

export function RecenterPawnPill({
  activeModal = null,
  cameraFocusCell,
  pawnPosition,
  pawnPos,
  onRecenter,
}: RecenterPawnPillProps): React.ReactElement | null {
  const currentPawnPos = pawnPosition !== undefined ? pawnPosition : (pawnPos !== undefined ? pawnPos : 0);

  if (activeModal !== null && activeModal !== undefined && activeModal !== '') {
    return null;
  }
  if (cameraFocusCell === null || cameraFocusCell === undefined) {
    return null;
  }
  if (cameraFocusCell === currentPawnPos) {
    return null;
  }

  return (
    <button
      type="button"
      data-testid="recenter-pawn-pill"
      onClick={onRecenter}
      className="min-h-[44px] bg-slate-900/95 text-amber-300 border-2 border-amber-500 shadow-[0_3px_0_0_#b45309] active:shadow-none active:translate-y-[2px] px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-slate-800 transition-all select-none"
    >
      <span>♟️ Về Quân Cờ</span>
    </button>
  );
}

export default RecenterPawnPill;
