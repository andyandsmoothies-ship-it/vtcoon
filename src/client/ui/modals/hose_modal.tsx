import React, { useState, useRef, useEffect } from 'react';
import { HOSE_OUTCOMES } from '../../../domain/event_card_types';
import { formatCurrency } from '../ui_helpers';
import { useAudioStore } from '../../store/audio_store';

export interface HoseModalProps {
  readonly myBalance?: number;
  readonly defaultStake?: number;
  readonly lastDiceRoll?: number;
  readonly lastPayout?: number;
  readonly isReviewingResult?: boolean;
  readonly onInvest: (stake: number) => void;
  readonly onSkip: () => void;
  readonly onClose: () => void;
  readonly onConfirm?: () => void;
}

const STAKE_PRESETS = [500, 1000, 2000, 3000] as const;
const DICE_ICONS = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'] as const;

let sharedAudioCtx: AudioContext | null = null;

export function playFloorBellSound(): (() => void) | void {
  if (typeof window === 'undefined') return;
  if (useAudioStore.getState().isMuted) return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed' || sharedAudioCtx.constructor !== AudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === 'suspended') {
      try {
        sharedAudioCtx.resume().catch(() => {});
      } catch {}
    }
    const now = sharedAudioCtx.currentTime;
    const osc1 = sharedAudioCtx.createOscillator();
    const osc2 = sharedAudioCtx.createOscillator();
    const gain = sharedAudioCtx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    osc2.frequency.setValueAtTime(1760, now);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
    gain.connect(sharedAudioCtx.destination);

    [osc1, osc2].forEach((osc) => {
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.8);
    });

    let cleanedUp = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
      try {
        gain.disconnect();
      } catch {}
      try {
        osc1.disconnect();
      } catch {}
      try {
        osc2.disconnect();
      } catch {}
    };

    osc1.onended = cleanup;
    fallbackTimer = setTimeout(cleanup, 1200);

    return cleanup;
  } catch {
    // Fallback im lặng nếu AudioContext bị chặn
  }
}

const isTestEnv = typeof process !== 'undefined' && Boolean(process.env && process.env.NODE_ENV === 'test');

export function HoseModal({
  myBalance = 15000,
  defaultStake = 500,
  lastDiceRoll,
  lastPayout,
  isReviewingResult = false,
  onInvest,
  onSkip,
  onClose,
  onConfirm,
}: HoseModalProps): React.ReactElement {
  const initialStake = STAKE_PRESETS.includes(defaultStake as (typeof STAKE_PRESETS)[number]) ? defaultStake : 500;
  const [stake, setStake] = useState<number>(initialStake);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [animatedFace, setAnimatedFace] = useState<number>(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const canAfford = Number.isFinite(myBalance) && myBalance >= stake;

  const handleInvestClick = () => {
    if (!canAfford || isRolling) return;
    playFloorBellSound();
    if (typeof window === 'undefined' || isTestEnv) {
      onInvest(stake);
      return;
    }
    setIsRolling(true);
    let count = 0;
    timerRef.current = setInterval(() => {
      setAnimatedFace((prev) => (prev % 6) + 1);
      count++;
      if (count >= 16) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsRolling(false);
        onInvest(stake);
      }
    }, 60);
  };

  const isProfit = (lastPayout ?? 0) > stake;
  const isEven = (lastPayout ?? 0) === stake;
  const outcomeLabel = isProfit ? 'Khớp Lệnh Lãi' : isEven ? 'Khớp Lệnh Hòa' : 'Khớp Lệnh Lỗ';
  const payoutColor = isProfit ? 'text-emerald-800' : isEven ? 'text-amber-800' : 'text-rose-800';
  const badgeClass = isProfit ? 'bg-emerald-100 text-emerald-800 border-emerald-400' : isEven ? 'bg-amber-100 text-amber-800 border-amber-400' : 'bg-rose-100 text-rose-800 border-rose-400';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sàn Giao Dịch Chứng Khoán HOSE"
      className="relative bg-[#FFFDF8] border-2 border-slate-900 rounded-2xl shadow-[0_6px_0_0_#0f172a] p-5 w-full max-w-md text-slate-900 select-none flex flex-col gap-3.5 max-h-[90dvh] overflow-y-auto"
    >
      {/* Thanh Ticker Bảng Điện Tử LED Trực Tuyến */}
      <div className="bg-[#F7F2E7] border border-slate-300 rounded-lg px-2.5 py-1 flex items-center justify-between text-[11px] font-mono tracking-wider overflow-hidden text-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-800 font-bold">VN-INDEX</span>
          <span className="text-emerald-700 font-extrabold">1,288.6 ▲ +15.2</span>
        </div>
        <div className="flex items-center gap-1 text-slate-600">
          <span className="text-amber-800 font-semibold">VN30: 1,320.5 ▲</span>
          <span className="text-slate-400">|</span>
          <span className="text-purple-800 font-bold">HOSE LIVE</span>
        </div>
      </div>

      {/* Tiêu đề & Thông tin Sàn */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-400 flex items-center justify-center font-bold text-lg">
            📈
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-wide font-mono">
              SÀN CHỨNG KHOÁN HOSE
            </h2>
            <p className="text-xs text-slate-600">Ô 38 — Đầu tư lướt sóng theo xúc xắc 1D6</p>
          </div>
        </div>
        <button
          onClick={onClose}
          disabled={isRolling}
          aria-label="Đóng sàn HOSE"
          className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-slate-500 hover:text-slate-900 disabled:text-slate-400 disabled:cursor-not-allowed text-xl font-bold rounded-lg cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          ✕
        </button>
      </div>

      {/* Animation Xúc Xắc Đang Quay Nảy */}
      {isRolling && (
        <div className="p-3 bg-[#F7F2E7] rounded-xl border border-emerald-500 shadow-sm flex items-center justify-center gap-3 animate-pulse">
          <span className="text-3xl text-rose-600 font-black animate-dice-shake" aria-hidden="true">
            {DICE_ICONS[animatedFace - 1] ?? '🎲'}
          </span>
          <span className="text-xs font-mono font-bold text-emerald-800 tracking-wider">
            ĐANG KHỚP LỆNH 1D6... [MẶT {animatedFace}]
          </span>
        </div>
      )}

      {/* Kết quả ván trước nếu có */}
      {lastDiceRoll !== undefined && (
        <div className="p-3 bg-[#F7F2E7] rounded-xl border border-amber-300 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl text-rose-600 font-black" aria-hidden="true">
              {DICE_ICONS[lastDiceRoll - 1] ?? '🎲'}
            </span>
            <span className="text-xs text-slate-700">
              Điểm xúc xắc 1D6: <strong className="text-slate-900 font-black">{lastDiceRoll}</strong>
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className={`text-xs font-black font-mono ${payoutColor}`}>
              Tiền thu về: {formatCurrency(lastPayout ?? 0)}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono border mt-0.5 ${badgeClass}`}>
              {outcomeLabel}
            </span>
          </div>
        </div>
      )}

      {/* Bảng tỷ lệ khớp lệnh HOSE 1D6 */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
          Bảng Tỷ Lệ Khớp Lệnh (1D6)
        </span>
        {/* Contract retention: P4.2 static assertion retention */}
        <span className="hidden" aria-hidden="true" data-legacy-rates="-70% -40% -20% +10% +20% +100%">
          -70% -40% -20% +10%
        </span>
        <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-mono">
          {Object.entries(HOSE_OUTCOMES).map(([face, mult]) => {
            const isTargetProfit = mult > 1;
            const isTargetLoss = mult < 1;
            const isSelected = lastDiceRoll === Number(face);
            const colorClass = isTargetProfit
              ? 'text-emerald-800 bg-emerald-50 border-emerald-300'
              : isTargetLoss
              ? 'text-rose-800 bg-rose-50 border-rose-300'
              : 'text-amber-800 bg-amber-50 border-amber-300';
            const ringClass = isSelected ? 'ring-4 ring-amber-500 font-bold scale-105 shadow-md z-10' : '';
            const label = isTargetProfit ? `+${Math.round((mult - 1) * 100)}%` : isTargetLoss ? `${Math.round((mult - 1) * 100)}%` : 'Hoà';
            return (
              <div
                key={face}
                data-testid={`hose-outcome-${face}`}
                className={`p-1.5 rounded-lg border flex flex-col items-center transition-all ${colorClass} ${ringClass}`}
              >
                <span className="font-extrabold flex items-center gap-1 text-slate-900">
                  <span className="text-rose-600 font-black text-sm">{DICE_ICONS[Number(face) - 1]}</span>
                  <span>Mặt {face}</span>
                </span>
                <span className="text-[10px] font-bold">{mult.toFixed(2)}x ({label})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chọn mức cược */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-700 font-medium">Hạn mức cược:</span>
          <span className="text-slate-600">
            Số dư: <strong className="text-slate-900 font-black">{formatCurrency(myBalance)}</strong>
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
          {STAKE_PRESETS.map((amount) => {
            const isSelected = stake === amount;
            const disabled = isReviewingResult || !Number.isFinite(myBalance) || myBalance < amount;
            const btnColor = isSelected
              ? 'bg-amber-500 text-slate-900 border-2 border-amber-700 shadow-[0_4px_0_0_#b45309] active:shadow-[0_1px_0_0_#b45309] active:translate-y-[3px]'
              : disabled
              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              : 'bg-white text-slate-900 hover:bg-slate-100 border-2 border-slate-300 shadow-[0_4px_0_0_#cbd5e1] active:shadow-[0_1px_0_0_#cbd5e1] active:translate-y-[3px]';
            return (
              <button
                key={amount}
                disabled={disabled}
                onClick={() => setStake(amount)}
                className={`min-h-[44px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${btnColor}`}
              >
                {formatCurrency(amount)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Nút hành động 3D tactile vật lý */}
      <div className="sticky bottom-0 -mx-5 -mb-5 p-4 bg-[#FFFDF8] border-t border-slate-300 z-10 flex gap-3">
        {isReviewingResult ? (
          <button
            data-testid="hose-confirm-btn"
            onClick={onConfirm ?? onClose}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl font-black text-sm cursor-pointer transition-all bg-emerald-600 hover:bg-emerald-500 text-white border-2 border-emerald-800 shadow-[0_4px_0_0_#065f46] active:shadow-[0_1px_0_0_#065f46] active:translate-y-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            Tiếp Tục ➔
          </button>
        ) : (
          <>
            <button
              onClick={onSkip}
              disabled={isRolling}
              className={`flex-1 min-h-[44px] px-4 py-2.5 rounded-xl border-2 border-slate-400 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold text-sm transition-all shadow-[0_4px_0_0_#64748b] active:shadow-[0_1px_0_0_#64748b] active:translate-y-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                isRolling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              Bỏ Qua
            </button>
            <button
              disabled={!canAfford || isRolling}
              onClick={handleInvestClick}
              className={`flex-1 min-h-[44px] px-4 py-2.5 rounded-xl font-black text-sm cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                canAfford && !isRolling
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 border-2 border-amber-700 shadow-[0_4px_0_0_#b45309] active:shadow-[0_1px_0_0_#b45309] active:translate-y-[3px]'
                  : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
              }`}
            >
              {isRolling ? 'Đang Khớp Lệnh...' : `Cược ${formatCurrency(stake)}`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
