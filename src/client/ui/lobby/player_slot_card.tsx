// [TC-NET02.1/MSS][IMP-20] PlayerSlotCard — Thẻ hiển thị vị trí 4 người chơi trong sảnh chờ
import React from 'react';
import { BotPersonality, type LobbySlot } from '../../store/lobby_types';

export interface PlayerSlotCardProps {
  readonly slot: LobbySlot;
  readonly isHostViewer: boolean;
  readonly onToggleBot?: (slotIndex: number) => void;
  readonly onCycleBotPersonality?: (slotIndex: number) => void;
}

export function PlayerSlotCard({
  slot,
  isHostViewer,
  onToggleBot,
  onCycleBotPersonality,
}: PlayerSlotCardProps): React.ReactElement {
  const slotNumber = slot.slotIndex + 1;

  if (!slot.isOccupied) {
    return (
      <div
        className="flex flex-col justify-between p-3 rounded-2xl border border-amber-400/25 bg-[#0A1628]/55 backdrop-blur-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] text-slate-300 hover:border-amber-400/45 transition-all min-h-[92px]"
        data-testid={`lobby-slot-${slot.slotIndex}-empty`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full opacity-60 shadow-sm ring-1 ring-white/20"
              style={{ backgroundColor: slot.tokenColor }}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-200/80">
              Vị Trí {slotNumber}
            </span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-lg bg-[#10233B]/80 border border-amber-400/20 text-slate-400 font-medium">
            Trống
          </span>
        </div>

        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs italic text-slate-400">Đang đợi người chơi...</span>
          {isHostViewer && slot.slotIndex > 0 && onToggleBot && (
            <button
              type="button"
              onClick={() => onToggleBot(slot.slotIndex)}
              className="min-h-[40px] inline-flex items-center justify-center text-xs px-3.5 py-1.5 rounded-xl bg-gradient-to-b from-cyan-600/30 to-cyan-800/40 hover:from-cyan-600/50 hover:to-cyan-800/60 text-cyan-200 border border-cyan-400/50 transition-all cursor-pointer shadow-[0_2px_0_0_#083344] active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 font-bold"
              data-testid={`add-bot-slot-${slot.slotIndex}-btn`}
            >
              + Thêm Bot AI
            </button>
          )}
        </div>
      </div>
    );
  }

  const personalityLabel =
    slot.botPersonality === BotPersonality.Aggressive
      ? 'Hiếu Chiến'
      : slot.botPersonality === BotPersonality.Passive
        ? 'Phòng Thủ'
        : 'Cân Bằng';

  return (
    <div
      className="flex flex-col justify-between p-3 rounded-2xl border border-amber-400/35 bg-gradient-to-b from-[#11233B]/80 to-[#0A182B]/80 backdrop-blur-md hover:border-amber-400/60 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] min-h-[92px]"
      data-testid={`lobby-slot-${slot.slotIndex}-occupied`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="w-3.5 h-3.5 rounded-full shadow-md ring-1 ring-white/30"
            style={{ backgroundColor: slot.tokenColor }}
          />
          <span className="text-xs font-black uppercase tracking-wider text-amber-200">
            Vị Trí {slotNumber}
          </span>
        </div>

        {slot.isHost ? (
          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-amber-500/30 to-amber-600/30 border border-amber-400/60 text-amber-200 flex items-center gap-1 shadow-sm">
            <span>👑</span> Chủ Phòng
          </span>
        ) : slot.isBot ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 flex items-center gap-1 shadow-sm">
              <span>🤖</span> Bot AI
            </span>
            {isHostViewer && onCycleBotPersonality && (
              <button
                type="button"
                onClick={() => onCycleBotPersonality(slot.slotIndex)}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#0F2D4A] hover:bg-[#153D66] text-cyan-200 border border-cyan-400/50 shadow-[0_2px_0_0_#083344] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                title="Nhấn để đổi tính cách Bot (Cân Bằng / Hiếu Chiến / Phòng Thủ)"
                data-testid={`cycle-bot-${slot.slotIndex}-btn`}
              >
                {personalityLabel}
              </button>
            )}
          </div>
        ) : slot.isReady ? (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 flex items-center gap-1 shadow-sm">
            <span>✓</span> Đã Sẵn Sàng
          </span>
        ) : (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-amber-950/70 border border-amber-500/50 text-amber-200 flex items-center gap-1 shadow-sm">
            <span>⏳</span> Chưa Sẵn Sàng
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-1.5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-white shadow-md ring-1 ring-white/30"
            style={{ backgroundColor: slot.tokenColor }}
          >
            {slot.isBot ? '🤖' : (slot.playerName || `P${slotNumber}`).charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-bold text-slate-100 truncate max-w-[170px] drop-shadow-sm">
            {slot.playerName || `Người chơi ${slotNumber}`}
          </span>
        </div>

        {isHostViewer && slot.isBot && onToggleBot && (
          <button
            type="button"
            onClick={() => onToggleBot(slot.slotIndex)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-gradient-to-b from-rose-900/60 to-rose-950/80 hover:from-rose-800/80 hover:to-rose-900/90 text-rose-200 border border-rose-500/50 shadow-[0_2px_0_0_#4c0519] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            data-testid={`remove-bot-slot-${slot.slotIndex}-btn`}
          >
            Xóa Bot
          </button>
        )}
      </div>
    </div>
  );
}
