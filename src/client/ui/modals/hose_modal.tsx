import React, { useState, useRef, useEffect } from 'react';
import { HOSE_OUTCOMES } from '../../../domain/event_card_types';
import { formatCurrency } from '../ui_helpers';

export interface HoseModalProps {
  readonly myBalance?: number;
  readonly defaultStake?: number;
  readonly lastDiceRoll?: number;
  readonly lastPayout?: number;
  readonly onInvest: (stake: number) => void;
  readonly onSkip: () => void;
  readonly onClose: () => void;
}

const STAKE_PRESETS = [500, 1000, 2000, 3000] as const;
const DICE_ICONS = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'] as const;

let sharedAudioCtx: AudioContext | null = null;
function playFloorBellSound(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') sharedAudioCtx = new AudioCtx();
    if (sharedAudioCtx.state === 'suspended') sharedAudioCtx.resume().catch(() => {});
    const now = sharedAudioCtx.currentTime;
    const osc1 = sharedAudioCtx.createOscillator(), osc2 = sharedAudioCtx.createOscillator();
    const gain = sharedAudioCtx.createGain();
    osc1.type = 'triangle';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    osc2.frequency.setValueAtTime(1760, now);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
    gain.connect(sharedAudioCtx.destination);
    [osc1, osc2].forEach((osc) => { osc.connect(gain); osc.start(now); osc.stop(now + 0.8); });
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
  onInvest,
  onSkip,
  onClose,
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
      if (count >= 6) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsRolling(false);
        onInvest(stake);
      }
    }, 50);
  };

  const isProfit = (lastPayout ?? 0) > stake;
  const isEven = (lastPayout ?? 0) === stake;
  const outcomeLabel = isProfit ? 'Khớp Lệnh Lãi' : isEven ? 'Khớp Lệnh Hòa' : 'Khớp Lệnh Lỗ';
  const payoutColor = isProfit ? 'text-emerald-400' : isEven ? 'text-amber-300' : 'text-rose-400';
  const badgeClass = isProfit ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40' : isEven ? 'bg-amber-950/80 text-amber-300 border-amber-600/40' : 'bg-rose-950/80 text-rose-300 border-rose-600/40';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sàn Giao Dịch Chứng Khoán HOSE"
      className="relative bg-slate-950 border-2 border-emerald-500/60 rounded-2xl shadow-[0_0_35px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/30 p-5 w-full max-w-md text-white select-none flex flex-col gap-3.5 overflow-hidden"
    >
      {/* Thanh Ticker Bảng Điện Tử LED Trực Tuyến */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1 flex items-center justify-between text-[11px] font-mono tracking-wider overflow-hidden">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          <span className="text-emerald-400 font-bold">VN-INDEX</span>
          <span className="text-emerald-300 font-extrabold">1,288.6 ▲ +15.2</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <span className="text-amber-400 font-semibold">VN30: 1,320.5 ▲</span>
          <span className="text-slate-500">|</span>
          <span className="text-purple-400 font-bold">HOSE LIVE</span>
        </div>
      </div>

      {/* Tiêu đề & Thông tin Sàn */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-lg shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            📈
          </div>
          <div>
            <h2 className="text-lg font-black text-amber-300 tracking-wide font-mono drop-shadow">
              SÀN CHỨNG KHOÁN HOSE
            </h2>
            <p className="text-xs text-slate-400">Ô 38 — Đầu tư lướt sóng theo xúc xắc 1D6</p>
          </div>
        </div>
        <button
          onClick={onClose}
          disabled={isRolling}
          aria-label="Đóng sàn HOSE"
          className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-slate-400 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed text-xl font-bold rounded-lg cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          ✕
        </button>
      </div>

      {/* Animation Xúc Xắc Đang Quay Nảy */}
      {isRolling && (
        <div className="p-3 bg-slate-900/90 rounded-xl border border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3 animate-pulse">
          <span className="text-3xl animate-dice-shake" aria-hidden="true">{DICE_ICONS[animatedFace - 1] ?? '🎲'}</span>
          <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider">
            ĐANG KHỚP LỆNH 1D6... [MẶT {animatedFace}]
          </span>
        </div>
      )}

      {/* Kết quả ván trước nếu có */}
      {lastDiceRoll !== undefined && (
        <div className="p-3 bg-slate-900/90 rounded-xl border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">{DICE_ICONS[lastDiceRoll - 1] ?? '🎲'}</span>
            <span className="text-xs text-slate-300">
              Điểm xúc xắc 1D6: <strong className="text-amber-400">{lastDiceRoll}</strong>
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className={`text-xs font-semibold font-mono ${payoutColor}`}>
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
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
          Bảng Tỷ Lệ Khớp Lệnh (1D6)
        </span>
        <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-mono">
          {Object.entries(HOSE_OUTCOMES).map(([face, mult]) => {
            const isTargetProfit = mult > 1;
            const isTargetLoss = mult < 1;
            const isSelected = lastDiceRoll === Number(face);
            const colorClass = isTargetProfit ? 'text-emerald-400 bg-emerald-950/50 border-emerald-700/50 shadow-[0_0_8px_rgba(16,185,129,0.15)]' : isTargetLoss ? 'text-rose-400 bg-rose-950/50 border-rose-700/50 shadow-[0_0_8px_rgba(244,63,94,0.15)]' : 'text-amber-300 bg-amber-950/50 border-amber-700/50 shadow-[0_0_8px_rgba(245,158,11,0.15)]';
            const label = isTargetProfit ? `+${Math.round((mult - 1) * 100)}%` : isTargetLoss ? `${Math.round((mult - 1) * 100)}%` : 'Hoà';
            return (
              <div
                key={face}
                className={`p-1.5 rounded-lg border flex flex-col items-center transition-all ${colorClass} ${isSelected ? 'ring-2 ring-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)]' : ''}`}
              >
                <span className="font-extrabold flex items-center gap-1">
                  <span>{DICE_ICONS[Number(face) - 1]}</span>
                  <span>Mặt {face}</span>
                </span>
                <span className="text-[10px] font-semibold">{mult.toFixed(2)}x ({label})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chọn mức cược */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-300 font-medium">Hạn mức cược:</span>
          <span className="text-slate-400">
            Số dư: <strong className="text-amber-300">{formatCurrency(myBalance)}</strong>
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2 font-mono">
          {STAKE_PRESETS.map((amount) => {
            const isSelected = stake === amount;
            const disabled = !Number.isFinite(myBalance) || myBalance < amount;
            const btnColor = isSelected
              ? 'bg-amber-500 text-amber-950 border border-amber-600 shadow-[0_4px_0_0_#b45309] active:shadow-[0_1px_0_0_#b45309] active:translate-y-[3px]'
              : disabled
              ? 'bg-slate-800 text-slate-600 border border-slate-700/40 cursor-not-allowed'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 shadow-[0_4px_0_0_#020617] active:shadow-[0_1px_0_0_#020617] active:translate-y-[3px]';
            return (
              <button
                key={amount}
                disabled={disabled}
                onClick={() => setStake(amount)}
                className={`min-h-[44px] py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${btnColor}`}
              >
                {formatCurrency(amount)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Nút hành động 3D tactile vật lý */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onSkip}
          disabled={isRolling}
          className={`flex-1 min-h-[44px] py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-sm transition-all shadow-[0_4px_0_0_#020617] active:shadow-[0_1px_0_0_#020617] active:translate-y-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            isRolling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          Bỏ Qua
        </button>
        <button
          disabled={!canAfford || isRolling}
          onClick={handleInvestClick}
          className={`flex-1 min-h-[44px] py-2.5 rounded-xl font-black text-sm cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            canAfford && !isRolling
              ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-amber-950 border border-amber-600 shadow-[0_4px_0_0_#b45309] active:shadow-[0_1px_0_0_#b45309] active:translate-y-[3px]'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
        >
          {isRolling ? 'Đang Khớp Lệnh...' : `Đặt Cược ${formatCurrency(stake)}`}
        </button>
      </div>
    </div>
  );
}
