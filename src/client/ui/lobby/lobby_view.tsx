// [TC-NET02.1/MSS][TC-NET02.2/MSS] LobbyView — Màn hình Sảnh Chờ chính của VTCoOn
// Nguồn: docs/epics/networking/_epic_ledger.md § Slice NET-02
import React, { useState } from 'react';
import { useLobbyStore } from '../../store/lobby_store';
import { PlayerSlotCard } from './player_slot_card';
import { QrCodeCard } from './qr_code_card';

import { type LobbySlot } from '../../store/lobby_types';

export interface LobbyViewProps {
  readonly onStartGame?: () => void;
  readonly roomCode?: string;
  readonly isHost?: boolean;
  readonly slots?: readonly LobbySlot[];
}

export function LobbyView({
  onStartGame,
  roomCode: propRoomCode,
  isHost: propIsHost,
  slots: propSlots,
}: LobbyViewProps): React.ReactElement {
  const storeRoomCode = useLobbyStore((s) => s.roomCode);
  const storeIsHost = useLobbyStore((s) => s.isHost);
  const storeIsReady = useLobbyStore((s) => s.isReady);
  const storeSlots = useLobbyStore((s) => s.slots);

  const roomCode = propRoomCode ?? storeRoomCode ?? 'VTCOON';
  const isHost = propIsHost ?? storeIsHost;
  const isReady = storeIsReady;
  const slots = propSlots ?? storeSlots;

  const toggleMyReady = useLobbyStore((s) => s.toggleMyReady);
  const toggleBotSlot = useLobbyStore((s) => s.toggleBotSlot);
  const cycleBotPersonality = useLobbyStore((s) => s.cycleBotPersonality);
  const startGame = useLobbyStore((s) => s.startGame);
  const canStartGame = useLobbyStore((s) => s.canStartGame);
  const resetLobby = useLobbyStore((s) => s.resetLobby);

  const canStartCheck = canStartGame();
  const [copiedCode, setCopiedCode] = useState(false);
  const occupiedCount = slots.filter((s) => s.isOccupied).length;

  const handleCopyCode = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(roomCode);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }
    } catch {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleStartGame = () => {
    const res = startGame();
    if (res.success && onStartGame) {
      onStartGame();
    }
  };

  const getStartButtonHint = (): string => {
    if (!canStartCheck.canStart) {
      if (canStartCheck.reasonCode === 'ROOM_STARTED') {
        return 'Trận đấu đang diễn ra';
      }
      if (canStartCheck.reasonCode === 'NOT_ENOUGH_PLAYERS') {
        return 'Cần tối thiểu 2 người chơi (hoặc thêm Bot AI) để bắt đầu';
      }
      if (canStartCheck.reasonCode === 'PLAYERS_NOT_READY') {
        return 'Đang chờ tất cả người chơi sẵn sàng...';
      }
      if (canStartCheck.reasonCode === 'NOT_HOST') {
        return 'Chỉ Chủ Phòng mới có quyền bắt đầu trận đấu';
      }
    }
    return 'Tất cả đã sẵn sàng! Nhấn để bước vào Sa bàn 3D.';
  };

  return (
    <div className="w-full h-full min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-4 md:p-8 select-none overflow-y-auto">
      {/* Header */}
      <header className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 py-3 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
            VTCOON
          </h1>
          <p className="text-xs text-slate-400">Sảnh Chờ Đại Gia Địa Ốc Việt Nam</p>
        </div>

        {/* 6-character room code */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 shadow-inner">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mã Phòng:</span>
          <span
            className="text-xl md:text-2xl font-mono font-extrabold tracking-widest text-amber-400"
            data-testid="lobby-room-code"
          >
            {roomCode}
          </span>
          <button
            type="button"
            onClick={handleCopyCode}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-xs px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer border border-slate-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            data-testid="copy-room-code-btn"
            aria-label="Sao chép mã phòng"
          >
            {copiedCode ? '✓ Đã chép' : 'Sao chép'}
          </button>
        </div>
      </header>

      {/* Main Grid: Slots (Left) & QR Code (Right) */}
      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 flex-1 items-start">
        <section className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Danh Sách Người Chơi ({occupiedCount}/4)
            </h2>
            <span className="text-xs text-slate-400">Tối đa 4 người/bàn</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="lobby-slots-grid">
            {slots.map((slot) => (
              <PlayerSlotCard
                key={slot.slotIndex}
                slot={slot}
                isHostViewer={isHost}
                onToggleBot={toggleBotSlot}
                onCycleBotPersonality={cycleBotPersonality}
              />
            ))}
          </div>
        </section>

        <section className="lg:col-span-5 flex flex-col items-center gap-4">
          <div className="w-full max-w-sm">
            <QrCodeCard roomCode={roomCode} />
          </div>

          {/* Thẻ Tóm Tắt Thể Lệ Thi Đấu */}
          <div
            className="w-full max-w-sm bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-xl text-left"
            data-testid="lobby-rules-card"
          >
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-800">
              <span className="text-amber-400 text-base font-black" aria-hidden="true">📜</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Tóm Tắt Thể Lệ Thi Đấu
              </h3>
            </div>

            <ul className="flex flex-col gap-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">•</span>
                <span>
                  <strong className="text-amber-300">Vốn khởi điểm:</strong> 15.000 Tr. VNĐ (15 Tỷ) cho mỗi đại gia.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">•</span>
                <span>
                  <strong className="text-amber-300">Thời lượng ván đấu:</strong> Tối đa 30 vòng bàn cờ.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">•</span>
                <span>
                  <strong className="text-amber-300">Thu nhập qua GO:</strong> Nhận ngay +2.000 Tr. VNĐ mỗi khi vượt qua ô Khởi Hành.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">•</span>
                <span>
                  <strong className="text-amber-300">Điều kiện thắng:</strong> Đại gia có Tổng tài sản (Tiền mặt + Giá trị BĐS) lớn nhất sau 30 vòng, hoặc là người duy nhất không bị phá sản.
                </span>
              </li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer / Action Bar */}
      <footer className="w-full max-w-5xl pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={resetLobby}
          className="min-h-[44px] inline-flex items-center justify-center text-xs text-slate-400 hover:text-rose-400 transition-colors py-2 px-4 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          data-testid="leave-lobby-btn"
          aria-label="Rời phòng chờ"
        >
          ← Rời Phòng
        </button>

        <div className="flex flex-col items-center sm:items-end gap-1">
          <span className="text-[11px] text-slate-400" aria-live="polite">{getStartButtonHint()}</span>

          {isHost ? (
            <button
              type="button"
              disabled={!canStartCheck.canStart}
              onClick={handleStartGame}
              className={`min-h-[44px] py-3 px-8 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                canStartCheck.canStart
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              }`}
              data-testid="start-game-btn"
            >
              BẮT ĐẦU TRẬN ĐẤU
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleMyReady}
              className={`min-h-[44px] py-3 px-8 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                isReady
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95'
              }`}
              data-testid="toggle-ready-btn"
            >
              {isReady ? '✓ ĐÃ SẴN SÀNG' : 'SẴN SÀNG'}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
