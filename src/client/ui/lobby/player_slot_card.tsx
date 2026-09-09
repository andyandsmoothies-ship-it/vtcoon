// [TC-NET02.1/MSS] PlayerSlotCard — Thẻ hiển thị vị trí 4 người chơi trong sảnh chờ
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
        className="flex flex-col justify-between p-4 rounded-xl border-2 border-dashed border-slate-800 bg-slate-950/40 text-slate-500 hover:border-slate-700 transition-all min-h-[110px]"
        data-testid={`lobby-slot-${slot.slotIndex}-empty`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full opacity-40"
              style={{ backgroundColor: slot.tokenColor }}
            />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Vị Trí {slotNumber}
            </span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-500">
            Trống
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs italic text-slate-500">Đang đợi người chơi...</span>
          {isHostViewer && slot.slotIndex > 0 && onToggleBot && (
            <button
              type="button"
              onClick={() => onToggleBot(slot.slotIndex)}
              className="text-xs px-3 py-1 rounded-lg bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 border border-indigo-700/50 transition-all cursor-pointer shadow"
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
      className="flex flex-col justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all shadow-md min-h-[110px]"
      data-testid={`lobby-slot-${slot.slotIndex}-occupied`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full shadow-sm"
            style={{ backgroundColor: slot.tokenColor }}
          />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Vị Trí {slotNumber}
          </span>
        </div>

        {slot.isHost ? (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1">
            <span>👑</span> Chủ Phòng
          </span>
        ) : slot.isBot ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-700/50 text-cyan-300 flex items-center gap-1">
              <span>🤖</span> Bot AI
            </span>
            {isHostViewer && onCycleBotPersonality && (
              <button
                type="button"
                onClick={() => onCycleBotPersonality(slot.slotIndex)}
                className="text-[11px] px-2 py-0.5 rounded bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 border border-cyan-700/50 transition-all cursor-pointer"
                title="Nhấn để đổi tính cách Bot (Cân Bằng / Hiếu Chiến / Phòng Thủ)"
                data-testid={`cycle-bot-${slot.slotIndex}-btn`}
              >
                {personalityLabel}
              </button>
            )}
          </div>
        ) : slot.isReady ? (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 flex items-center gap-1">
            <span>✓</span> Đã Sẵn Sàng
          </span>
        ) : (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-950/70 border border-amber-600/50 text-amber-300 flex items-center gap-1">
            <span>⏳</span> Chưa Sẵn Sàng
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white shadow"
            style={{ backgroundColor: slot.tokenColor }}
          >
            {slot.isBot ? '🤖' : slot.playerName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-semibold text-slate-100 truncate max-w-[170px]">
            {slot.playerName}
          </span>
        </div>

        {isHostViewer && slot.isBot && onToggleBot && (
          <button
            type="button"
            onClick={() => onToggleBot(slot.slotIndex)}
            className="text-xs px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50 transition-all cursor-pointer"
            data-testid={`remove-bot-slot-${slot.slotIndex}-btn`}
          >
            Xóa Bot
          </button>
        )}
      </div>
    </div>
  );
}
