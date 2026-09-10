// [TC-NET02.1/MSS][TC-NET02.2/MSS] LobbyView — Màn hình Sảnh Chờ chính của VTCoOn
// Nguồn: docs/epics/networking/_epic_ledger.md § Slice NET-02
import React, { useState } from 'react';
import { useLobbyStore } from '../../store/lobby_store';
import { PlayerSlotCard } from './player_slot_card';
import { QrCodeCard } from './qr_code_card';
import { BotPersonality, type LobbySlot } from '../../store/lobby_types';
import { AudioEngine } from '../../audio/audio_engine';
import type { WsClientMessage } from '../../../server/network/network_types';

export interface LobbyViewProps {
  readonly onStartGame?: () => void;
  readonly sendWsMessage?: (msg: WsClientMessage) => void;
  readonly roomCode?: string;
  readonly isHost?: boolean;
  readonly slots?: readonly LobbySlot[];
}

export function LobbyView({
  onStartGame,
  sendWsMessage,
  roomCode: propRoomCode,
  isHost: propIsHost,
  slots: propSlots,
}: LobbyViewProps): React.ReactElement {
  const storeRoomCode = useLobbyStore((s) => s.roomCode);
  const storeIsHost = useLobbyStore((s) => s.isHost);
  const storeIsReady = useLobbyStore((s) => s.isReady);
  const storeSlots = useLobbyStore((s) => s.slots);
  const storeMyPlayerId = useLobbyStore((s) => s.myPlayerId);

  const roomCode = propRoomCode ?? storeRoomCode ?? 'VTCOON';
  const isHost = propIsHost ?? storeIsHost;
  const isReady = storeIsReady;
  const slots = propSlots ?? storeSlots;
  const playerId = storeMyPlayerId || 'p1';

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

  const handleToggleBot = (slotIndex: number, personality?: BotPersonality) => {
    AudioEngine.resumeAudioContext();
    toggleBotSlot(slotIndex, personality);
  };

  const handleCycleBotPersonality = (slotIndex: number) => {
    AudioEngine.resumeAudioContext();
    cycleBotPersonality(slotIndex);
  };

  const handleStartGame = () => {
    AudioEngine.resumeAudioContext();
    const check = canStartGame();
    if (!check.canStart) return;

    if (sendWsMessage) {
      const botSlots = slots.filter((s) => s.isOccupied && s.isBot);
      const bots = botSlots.map((s) => ({
        id: s.playerId ?? `bot_${s.slotIndex + 1}`,
        name: s.playerName,
        personality: s.botPersonality ?? BotPersonality.Balanced,
      }));
      sendWsMessage({
        type: 'START_GAME',
        roomCode,
        playerId,
        ...(bots.length > 0 ? { bots } : {}),
      });
    } else {
      startGame();
    }
    if (onStartGame) {
      onStartGame();
    }
  };

  const getStartButtonHint = (): string => {
    if (!canStartCheck.canStart) {
      if (canStartCheck.reasonCode === 'ROOM_STARTED') return 'Trận đấu đang diễn ra';
      if (canStartCheck.reasonCode === 'NOT_ENOUGH_PLAYERS') return 'Cần tối thiểu 2 người chơi (hoặc thêm Bot AI) để bắt đầu';
      if (canStartCheck.reasonCode === 'PLAYERS_NOT_READY') return 'Đang chờ tất cả người chơi sẵn sàng...';
      if (canStartCheck.reasonCode === 'NOT_HOST') return 'Chỉ Chủ Phòng mới có quyền bắt đầu trận đấu';
    }
    return 'Tất cả đã sẵn sàng! Nhấn để bước vào Sa bàn 3D.';
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 bg-radial from-slate-900 to-slate-950 text-slate-100 flex flex-col items-center justify-between p-4 md:p-8 select-none overflow-y-auto">
      {/* Phông nền Skyline Silhouette mờ 15% chiều sâu */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 md:h-80 opacity-15 overflow-hidden flex items-end justify-center z-0 text-slate-400" aria-hidden="true">
        <svg viewBox="0 0 1200 260" className="w-full h-full object-cover" preserveAspectRatio="none" fill="currentColor">
          <path d="M0,260 L0,180 L40,180 L40,130 L70,130 L70,190 L110,190 L110,100 L140,100 L140,80 L150,50 L160,80 L160,100 L180,100 L180,210 L220,210 L220,150 L260,150 L260,260 L310,260 L310,120 L350,120 L350,70 L360,70 L360,30 L370,70 L380,70 L380,120 L410,120 L410,170 L450,170 L450,260 L510,260 L510,130 L550,130 L550,80 L590,80 L590,260 L650,260 L650,150 L690,150 L690,60 L700,30 L710,60 L710,150 L750,150 L750,260 L810,260 L810,110 L850,110 L850,170 L890,170 L890,260 L950,260 L950,120 L990,120 L990,70 L1030,70 L1030,200 L1070,200 L1070,260 L1130,260 L1130,140 L1170,140 L1170,190 L1200,190 L1200,260 Z" />
        </svg>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 py-3 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
            VTCOON
          </h1>
          <p className="text-xs text-slate-400">Sảnh Chờ Đại Gia Địa Ốc Việt Nam</p>
        </div>

        {/* 6-character room code */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 shadow-inner">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mã Phòng:</span>
          <span className="text-xl md:text-2xl font-mono font-extrabold tracking-widest text-amber-400" data-testid="lobby-room-code">
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

      {/* Main Grid: Slots (Left) & QR Code + Rules (Right) */}
      <main className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto items-center justify-center flex-1">
        <section className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Danh Sách Người Chơi ({occupiedCount}/4)
            </h2>
            <span className="text-xs text-slate-400">Tối đa 4 người/bàn</span>
          </div>

          {/* Căn giữa đối xứng 4 slot người chơi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 justify-center" data-testid="lobby-slots-grid">
            {slots.map((slot) => (
              <PlayerSlotCard
                key={slot.slotIndex}
                slot={slot}
                isHostViewer={isHost}
                onToggleBot={handleToggleBot}
                onCycleBotPersonality={handleCycleBotPersonality}
              />
            ))}
          </div>
        </section>

        <section className="lg:col-span-5 flex flex-col items-center gap-4">
          <div className="w-full max-w-sm">
            <QrCodeCard roomCode={roomCode} />
          </div>

          {/* Thẻ Thể Lệ Thi Đấu: Cụm 3 huy hiệu đồ họa trực quan nằm ngang */}
          <div
            className="w-full max-w-sm bg-slate-900/90 backdrop-blur-sm border border-slate-800/90 rounded-2xl p-4 shadow-xl text-left"
            data-testid="lobby-rules-card"
          >
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-800">
              <span className="text-amber-400 text-base font-black" aria-hidden="true">📜</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Tóm Tắt Thể Lệ Thi Đấu
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Huy hiệu 1: Vốn khởi điểm */}
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-amber-400/30 transition-colors">
                <span className="text-2xl mb-1" aria-hidden="true">💰</span>
                <span className="text-[11px] font-black text-amber-300">Vốn 15 Tỷ VNĐ</span>
                <span className="text-[9px] text-slate-400 mt-0.5 leading-tight">15.000 Tr. VNĐ</span>
                <span className="text-[8px] text-emerald-400 mt-0.5 leading-tight">+2.000 Tr. VNĐ qua GO</span>
              </div>

              {/* Huy hiệu 2: Thời lượng ván đấu */}
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-amber-400/30 transition-colors">
                <span className="text-2xl mb-1" aria-hidden="true">⏳</span>
                <span className="text-[11px] font-black text-amber-300">30 Vòng Đấu</span>
                <span className="text-[9px] text-slate-400 mt-0.5 leading-tight">Tối đa 30 vòng</span>
                <span className="text-[8px] text-slate-500 mt-0.5 leading-tight">Bàn cờ 40 ô</span>
              </div>

              {/* Huy hiệu 3: Điều kiện thắng */}
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-amber-400/30 transition-colors">
                <span className="text-2xl mb-1" aria-hidden="true">🏆</span>
                <span className="text-[11px] font-black text-amber-300">Đại Gia Vô Địch</span>
                <span className="text-[9px] text-slate-400 mt-0.5 leading-tight">Điều kiện thắng</span>
                <span className="text-[8px] text-slate-500 mt-0.5 leading-tight">Tài sản cực đại</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer / Action Bar */}
      <footer className="relative z-10 w-full max-w-5xl pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
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
