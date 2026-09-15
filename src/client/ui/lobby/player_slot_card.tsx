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
        className="flex flex-col justify-between p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 text-slate-700 hover:border-slate-400 transition-all min-h-[92px]"
        data-testid={`lobby-slot-${slot.slotIndex}-empty`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full opacity-60 shadow-sm ring-1 ring-slate-400"
              style={{ backgroundColor: slot.tokenColor }}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Vị Trí {slotNumber}
            </span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-200 border border-slate-300 text-slate-600 font-medium">
            Trống
          </span>
        </div>

        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs italic text-slate-500">Đang đợi người chơi...</span>
          {isHostViewer && slot.slotIndex > 0 && onToggleBot && (
            <button
              type="button"
              onClick={() => onToggleBot(slot.slotIndex)}
              className="min-h-[36px] inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm active:translate-y-px transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              data-testid={`add-bot-slot-${slot.slotIndex}-btn`}
            >
              + Thêm Bot AI
            </button>
          )}
        </div>
      </div>
    );
  }

  const personality = String(slot.botPersonality || '').toLowerCase();
  const personalityLabel =
    personality === 'aggressive'
      ? 'Hiếu Chiến'
      : personality === 'passive'
        ? 'Phòng Thủ'
        : 'Cân Bằng';

  return (
    <div
      className="flex flex-col justify-between p-3 rounded-xl border border-slate-200 bg-white shadow-xs text-slate-900 transition-all min-h-[92px]"
      data-testid={`lobby-slot-${slot.slotIndex}-occupied`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="w-3.5 h-3.5 rounded-full shadow-md ring-1 ring-slate-400"
            style={{ backgroundColor: slot.tokenColor }}
          />
          <span className="text-xs font-black uppercase tracking-wider text-slate-700">
            Vị Trí {slotNumber}
          </span>
        </div>

        {slot.isHost ? (
          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 flex items-center gap-1 shadow-xs">
            <span>👑</span> Chủ Phòng
          </span>
        ) : slot.isBot ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 shadow-xs">
              <span>🤖</span> Bot AI
            </span>
            {isHostViewer && onCycleBotPersonality && (
              <button
                type="button"
                onClick={() => onCycleBotPersonality(slot.slotIndex)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white active:translate-y-px transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                title="Nhấn để đổi tính cách Bot (Cân Bằng / Hiếu Chiến / Phòng Thủ)"
                data-testid={`cycle-bot-${slot.slotIndex}-btn`}
              >
                {personalityLabel}
              </button>
            )}
          </div>
        ) : slot.isReady ? (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center gap-1 shadow-xs">
            <span>✓</span> Đã Sẵn Sàng
          </span>
        ) : (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-amber-100 border border-amber-300 text-amber-800 flex items-center gap-1 shadow-xs">
            <span>⏳</span> Chưa Sẵn Sàng
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-1.5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-white shadow-sm ring-1 ring-slate-300"
            style={{ backgroundColor: slot.tokenColor }}
          >
            {slot.isBot ? '🤖' : (slot.playerName || `P${slotNumber}`).charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-bold text-slate-900 truncate max-w-[170px]">
            {slot.playerName || `Người chơi ${slotNumber}`}
          </span>
        </div>

        {isHostViewer && slot.isBot && onToggleBot && (
          <button
            type="button"
            onClick={() => onToggleBot(slot.slotIndex)}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 active:translate-y-px transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            data-testid={`remove-bot-slot-${slot.slotIndex}-btn`}
          >
            Xóa Bot
          </button>
        )}
      </div>
    </div>
  );
}
