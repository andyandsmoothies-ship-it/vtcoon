// [IMP-248] Tactile 2D SVG/CSS Modal: Transit Wheel / Flight Navigator
import React, { useState, useEffect } from 'react';
import type { ModalPayloadMap } from '../../store/game_store_types';
import { TRANSIT_WHEEL_CONFIGS, TransitWheelOutcome, getWheelTargetDeg } from '../../../domain/transit_wheel';
import { AudioEngine } from '../../audio/audio_engine';
import { SoundEffect } from '../../audio/audio_types';
import { useGameStore } from '../../store/game_store';

export interface TransitWheelModalProps {
  readonly cellIndex: number;
  readonly payload?: ModalPayloadMap['transit_wheel'];
  readonly onSpin: () => void;
  readonly onClose: () => void;
}

export function getTransitWheelDismissText(outcome?: TransitWheelOutcome | string): string {
  const isStationaryOutcome = outcome === TransitWheelOutcome.CASH_BACK || outcome === TransitWheelOutcome.FLIGHT_DELAY;
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

  const handleStartSpin = () => {
    if (isSpinning || hasFinished) return;
    setIsSpinning(true);
    try { AudioEngine.playSfx(SoundEffect.DICE_ROLL); } catch { /* Ignore */ }
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
      setRotation(getWheelTargetDeg(outcomeIndex, TRANSIT_WHEEL_CONFIGS.length));

      const timer = setTimeout(() => {
        setIsSpinning(false);
        setHasFinished(true);
        try { AudioEngine.playSfx(SoundEffect.CARD_DRAW); } catch { /* Ignore */ }
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [outcome, hasFinished]);

  const activeConfig = TRANSIT_WHEEL_CONFIGS.find((c) => c.outcome === outcome);
  const dismissButtonText = getTransitWheelDismissText(outcome);

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
          Vòng Xoay Hành Trình
        </h2>
        <p className="text-xs text-slate-400 mt-1">Trạm Hạ Tầng #{cellIndex} — Chuyển Tiếp Chiến Thuật</p>
      </div>

      {/* Đĩa xoay cơ học 2D SVG với kim chỉ hướng */}
      <div className="relative w-64 h-64 my-4 flex items-center justify-center">
        {/* Kim chỉ hướng */}
        <div className="absolute -top-3 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 drop-shadow" />

        <svg
          role="img"
          aria-label="Vòng xoay chuyển tiếp hành trình"
          viewBox="0 0 200 200"
          className="w-full h-full"
        >
          {/* Nhóm nan quạt xoay động */}
          <g
            className="transition-transform duration-[3500ms] ease-[cubic-bezier(0.15,0.9,0.2,1)]"
            style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '100px 100px', transformBox: 'view-box' }}
          >
            {TRANSIT_WHEEL_CONFIGS.map((cfg, idx) => {
              const step = (2 * Math.PI) / TRANSIT_WHEEL_CONFIGS.length;
              const startAngle = idx * step;
              const endAngle = (idx + 1) * step;
              const x1 = 100 + 95 * Math.sin(startAngle);
              const y1 = 100 - 95 * Math.cos(startAngle);
              const x2 = 100 + 95 * Math.sin(endAngle);
              const y2 = 100 - 95 * Math.cos(endAngle);
              const pathData = `M 100 100 L ${x1} ${y1} A 95 95 0 0 1 ${x2} ${y2} Z`;
              const midDeg = (idx + 0.5) * (360 / TRANSIT_WHEEL_CONFIGS.length);
              return (
                <g key={cfg.outcome}>
                  <path d={pathData} fill={cfg.color} stroke="#0f172a" strokeWidth="2" />
                  <g transform={`rotate(${midDeg} 100 100)`}>
                    <text
                      x="100"
                      y="36"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="22"
                      className="select-none pointer-events-none drop-shadow"
                    >
                      {cfg.icon}
                    </text>
                    <text
                      x="100"
                      y="64"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="12"
                      fontWeight="bold"
                      fill="#ffffff"
                      stroke="#0f172a"
                      strokeWidth="0.5"
                      className="select-none pointer-events-none font-mono tracking-tight"
                    >
                      {cfg.weight}%
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* Trục xoay trung tâm tĩnh (Center Hub) */}
          <circle cx="100" cy="100" r="23" fill="#0f172a" stroke="#f59e0b" strokeWidth="2.5" />
          <circle cx="100" cy="100" r="17" fill="#1e293b" stroke="#d97706" strokeWidth="1" />
          <text
            x="100"
            y="101"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="13"
            className="select-none pointer-events-none"
          >
            🧭
          </text>
        </svg>
      </div>

      {/* Thẻ hiển thị kết quả chi tiết */}
      {hasFinished && activeConfig && (
        <div className="w-full mt-2 p-3 bg-slate-800/90 border border-amber-500/40 rounded-xl text-center animate-fade-in">
          <div className="text-sm font-semibold text-amber-400">{activeConfig.labelVi}</div>
          <div className="text-xs text-slate-300 mt-1">{activeConfig.descriptionVi}</div>
        </div>
      )}

      {/* Nút hành động */}
      <div className="mt-5 w-full flex justify-center">
        {!isSpinning && !hasFinished ? (
          <button
            onClick={handleStartSpin}
            className="w-full min-h-[44px] py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-bold rounded-xl shadow-lg active:scale-95 transition-all text-sm uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Quay Vòng Xoay
          </button>
        ) : hasFinished ? (
          <button
            onClick={handleDismiss}
            className="w-full min-h-[44px] py-3 bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold rounded-xl border border-amber-500/40 active:scale-95 transition-all text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
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
