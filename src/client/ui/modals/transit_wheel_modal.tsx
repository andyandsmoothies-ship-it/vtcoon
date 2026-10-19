// [IMP-248] Tactile 2D SVG/CSS Modal: Transit Wheel / Flight Navigator
import React, { useState, useEffect } from 'react';
import type { ModalPayloadMap } from '../../store/game_store_types';
import { TRANSIT_WHEEL_CONFIGS, TransitWheelOutcome } from '../../../domain/index.js';
import { audio, SoundEffect } from '../../audio/index.js';
import { useGameStore } from '../../store/game_store';
import {
  getTransitWheelSectorAngles,
  getProportionalWheelTargetDeg,
} from './transit_wheel_visuals.js';

export interface TransitWheelModalProps {
  readonly cellIndex: number;
  readonly payload?: ModalPayloadMap['transit_wheel'];
  readonly onSpin: () => void;
  readonly onClose: () => void;
}

export function getTransitWheelDismissText(
  outcome?: TransitWheelOutcome | string,
  targetCell?: number,
  cellIndex?: number,
): string {
  const isStationaryOutcome =
    outcome === TransitWheelOutcome.CASH_BACK ||
    outcome === TransitWheelOutcome.FLIGHT_DELAY ||
    (targetCell !== undefined && cellIndex !== undefined && targetCell === cellIndex);
  return isStationaryOutcome ? 'Xác Nhận & Ở Lại Trạm' : 'Tiếp Tục Di Chuyển Đến Ô Mới';
}

export const TransitWheelModal: React.FC<TransitWheelModalProps> = ({
  cellIndex,
  payload,
  onSpin,
  onClose,
}) => {
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [hasFinished, setHasFinished] = useState<boolean>(false);

  const outcome = payload?.outcome;
  const sectors = getTransitWheelSectorAngles(TRANSIT_WHEEL_CONFIGS);

  const handleStartSpin = () => {
    if (isSpinning || hasFinished) return;
    setIsSpinning(true);
    try { audio.playSfx(SoundEffect.DICE_ROLL); } catch { /* Ignore */ }
    onSpin();
  };

  useEffect(() => {
    if (isSpinning && !outcome) {
      const fallbackTimer = setTimeout(() => {
        setIsSpinning(false);
      }, 5000);
      return () => clearTimeout(fallbackTimer);
    }
  }, [isSpinning, outcome]);

  useEffect(() => {
    if (outcome && !hasFinished) {
      setIsSpinning(true);
      const outcomeIndex = TRANSIT_WHEEL_CONFIGS.findIndex((c) => c.outcome === outcome);
      setRotation(getProportionalWheelTargetDeg(outcomeIndex));

      const timer = setTimeout(() => {
        setIsSpinning(false);
        setHasFinished(true);
        try { audio.playSfx(SoundEffect.CARD_DRAW); } catch { /* Ignore */ }
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [outcome, hasFinished]);

  const activeConfig = TRANSIT_WHEEL_CONFIGS.find((c) => c.outcome === outcome);
  const dismissButtonText = getTransitWheelDismissText(outcome, payload?.targetCell, cellIndex);

  const handleDismiss = () => {
    // Giải phóng pendingPawnMove cho quân cờ chạy
    const state = useGameStore.getState();
    const pending = state.pendingPawnMove;
    if (pending) {
      state.setPendingPawnMove?.(null);
      state.startPawnMove?.(pending.playerId, pending.targetCell, pending.fromCell, Boolean(pending.isBot), pending.isJailFlight);
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="transit-wheel-title"
      className="relative w-full max-w-md p-6 bg-slate-900 border-2 border-amber-500/80 rounded-2xl shadow-2xl text-white flex flex-col items-center"
    >
      <div className="text-center mb-4">
        <h2 id="transit-wheel-title" className="text-xl font-bold tracking-wider text-amber-400 uppercase">
          Vòng Xoay Vận Tải
        </h2>
        <p className="text-xs text-slate-400 mt-1">Trạm Hạ Tầng #{cellIndex} — Chuyển Tiếp Chiến Thuật</p>
      </div>

      {/* Đĩa xoay cơ học 2D SVG với kim chỉ hướng */}
      <div className="relative w-64 h-64 my-4 flex items-center justify-center">
        {/* Kim chỉ hướng */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 drop-shadow" />

        <svg
          role="img"
          aria-label="Vòng xoay chuyển tiếp hành trình"
          viewBox="0 0 200 200"
          className="w-full h-full"
        >
          {/* Nhóm nan quạt xoay động */}
          <g
            className="transition-transform duration-[3500ms] ease-[cubic-bezier(0.15,0.9,0.2,1)]"
            style={{ transform: `rotate(${rotation}deg)`, transformOrigin: 'center' }}
          >
            {/* Transparent bounding anchor to guarantee rock-solid center in WebKit/Safari */}
            <circle cx="100" cy="100" r="95" fill="transparent" stroke="transparent" strokeWidth="1" pointerEvents="none" />
            {sectors.map((sector) => {
              if (sector.isCollapsed || !sector.pathData) return null;
              return (
                <g key={sector.outcome}>
                  <path d={sector.pathData} fill={sector.color} stroke="#0f172a" strokeWidth="2" />
                  <g transform={`rotate(${sector.midDeg} 100 100)`}>
                    <text
                      x="100"
                      y={sector.iconY}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={sector.iconSize}
                      className="select-none pointer-events-none drop-shadow"
                    >
                      {sector.icon}
                    </text>
                    <text
                      x="100"
                      y={sector.textY}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={sector.fontSize}
                      fontWeight="bold"
                      fill="#ffffff"
                      stroke="#0f172a"
                      strokeWidth="0.5"
                      className="select-none pointer-events-none font-mono tracking-tight"
                    >
                      {sector.weight}%
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* Trục xoay trung tâm tĩnh (Center Hub) - Đồng thau & Obsidian hoàng gia */}
          <circle cx="100" cy="100" r="25" fill="#0f172a" stroke="#b45309" strokeWidth="2" />
          <circle cx="100" cy="100" r="21" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="100" cy="100" r="16" fill="#0b0f19" stroke="#fbbf24" strokeWidth="1" />
          <text
            x="100"
            y="100.5"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="14"
            className="select-none pointer-events-none drop-shadow"
          >
            🧭
          </text>
        </svg>
      </div>

      {/* Thẻ hiển thị kết quả chi tiết - Tôn vinh phần thưởng tài chính */}
      {hasFinished && activeConfig && (
        <div className="w-full mt-2 p-3.5 bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-amber-500/60 rounded-xl text-center animate-fade-in flex flex-col gap-1.5 shadow-xl">
          <div className="text-base font-black text-amber-400 flex items-center justify-center gap-1.5 flex-wrap">
            <span className="text-lg">{activeConfig.icon}</span>
            <span>{activeConfig.labelVi}</span>
            {payload?.boostSteps !== undefined && payload.boostSteps > 0 && (
              <span className="text-xs bg-amber-500/25 text-amber-300 px-2 py-0.5 rounded-full font-mono font-black border border-amber-500/40 shadow-sm">
                +{payload.boostSteps} ô
              </span>
            )}
            {payload?.payout !== undefined && payload.payout > 0 && (
              <span className="text-xs bg-emerald-500/25 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-black border border-emerald-500/40 shadow-sm">
                +{payload.payout} Tr.
              </span>
            )}
          </div>
          <div className="text-xs text-slate-300 font-medium">{activeConfig.descriptionVi}</div>
          {payload?.targetCell !== undefined && payload.targetCell !== cellIndex && (
            <div className="text-[11px] font-bold text-amber-300 bg-amber-950/40 py-1 px-2 rounded-lg border border-amber-500/30 mt-0.5">
              🚀 Đích đến tiếp theo: Ô #{payload.targetCell}
            </div>
          )}
          {payload?.targetCell !== undefined && payload.targetCell === cellIndex && outcome === TransitWheelOutcome.SAFE_HAVEN && (
            <div className="text-[11px] font-bold text-emerald-300 bg-emerald-950/40 py-1 px-2 rounded-lg border border-emerald-500/30 mt-0.5">
              🛡️ Chưa sở hữu BĐS: Lưu lại an toàn tại trạm #{cellIndex}
            </div>
          )}
        </div>
      )}

      {/* Nút hành động */}
      <div className="mt-5 w-full flex justify-center">
        {!isSpinning && !hasFinished ? (
          <button
            type="button"
            onClick={handleStartSpin}
            className="w-full min-h-[48px] py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-black rounded-xl border-2 border-amber-600 shadow-[0_4px_0_0_#b45309] hover:shadow-[0_4px_0_0_#92400e] active:shadow-[0_1px_0_0_#92400e] active:translate-y-[3px] transition-all text-sm uppercase tracking-wider cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Quay Vòng Xoay
          </button>
        ) : hasFinished ? (
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full min-h-[48px] py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-black rounded-xl border-2 border-amber-600 shadow-[0_4px_0_0_#b45309] hover:shadow-[0_4px_0_0_#92400e] active:shadow-[0_1px_0_0_#92400e] active:translate-y-[3px] transition-all text-sm uppercase tracking-wider cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            {dismissButtonText}
          </button>
        ) : (
          <div className="py-2 text-xs text-amber-400 animate-pulse font-medium">
            Đang điều hướng chuyến bay...
          </div>
        )}
      </div>
    </div>
  );
};
