// [TC-NET02.1/MSS][TC-NET02.2/MSS] LobbyView — Màn hình Sảnh Chờ chính của VTCoOn
// Nguồn: docs/epics/networking/_epic_ledger.md § Slice NET-02 & Giai đoạn 3: Penthouse Lounge
import React, { useState } from 'react';
import { useLobbyStore } from '../../store/lobby_store';
import { PlayerSlotCard } from './player_slot_card';
import { QrCodeCard } from './qr_code_card';
import { BotPersonality, type LobbySlot } from '../../store/lobby_types';
import { useAudioStore } from '../../store/audio_store';
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
  const isMuted = useAudioStore((s) => s.isMuted);
  const toggleMute = useAudioStore((s) => s.toggleMute);

  const canStartCheck = canStartGame();
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
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
    <div className="relative w-full h-full min-h-screen text-slate-100 p-4 md:p-6 select-none pointer-events-none overflow-hidden">
      {/* Huy hiệu thương hiệu tinh tế góc trên bên trái */}
      <header className="pointer-events-auto absolute top-4 left-4 md:top-6 md:left-6 z-20 flex items-center gap-3 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2.5 shadow-2xl">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-black text-amber-950 text-sm shadow">
          VT
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-amber-300 drop-shadow">
            VTCOON
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">
            Sảnh Chờ VIP Penthouse Lounge • Tầng 80
          </p>
        </div>
        {/* Nút Bật / Tắt âm thanh nhanh tại Sảnh Chờ */}
        <button
          type="button"
          onClick={() => {
            AudioEngine.resumeAudioContext();
            toggleMute();
          }}
          className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 transition-colors cursor-pointer text-xs font-medium border border-slate-700/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          title={isMuted ? 'Bật âm thanh sảnh chờ' : 'Tắt âm thanh sảnh chờ'}
          aria-label={isMuted ? 'Bật âm thanh sảnh chờ' : 'Tắt âm thanh sảnh chờ'}
          data-testid="lobby-mute-toggle-button"
        >
          <span className="text-sm" aria-hidden="true">{isMuted ? '🔇' : '🔊'}</span>
          <span className="hidden md:inline text-[11px] font-semibold">{isMuted ? 'Tắt âm' : 'Bật âm'}</span>
        </button>
        <button
          type="button"
          onClick={() => setIsPanelCollapsed((prev) => !prev)}
          className="sm:hidden ml-2 text-[11px] px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold cursor-pointer"
          data-testid="toggle-lobby-panel-btn"
          aria-label={isPanelCollapsed ? 'Mở bảng điều khiển' : 'Thu gọn bảng điều khiển'}
        >
          {isPanelCollapsed ? '📋 Bảng' : '🏙️ Ngắm 3D'}
        </button>
      </header>

      {/* Thẻ Glassmorphism mỏng nổi bên cánh phải theo Chuẩn Ảnh Concept 3 */}
      <aside className="pointer-events-auto absolute top-4 right-4 bottom-4 w-96 max-w-[calc(100vw-2rem)] z-20 flex flex-col justify-between p-4 md:p-5 bg-slate-900/85 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl text-slate-100 overflow-y-auto gap-3.5 transition-transform duration-300" style={{ transform: isPanelCollapsed ? 'translateX(calc(100% + 2rem))' : undefined }}>
        {/* Tiêu đề & Mã phòng 6 ký tự */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black tracking-wider uppercase text-amber-400 flex items-center gap-1.5">
              <span>💎</span> VIP LOBBY: PENTHOUSE LOUNGE
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              {occupiedCount === 4 && slots.every((s) => !s.isOccupied || s.isReady)
                ? 'ALL READY (4/4)'
                : `ĐANG CHỜ (${occupiedCount}/4)`}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 shadow-inner">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mã Phòng:</span>
            <span className="text-xl font-mono font-extrabold tracking-widest text-amber-400" data-testid="lobby-room-code">
              {roomCode}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="text-xs px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer border border-slate-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              data-testid="copy-room-code-btn"
              aria-label="Sao chép mã phòng"
            >
              {copiedCode ? '✓ Đã chép' : 'Sao chép'}
            </button>
          </div>
        </div>

        {/* Danh sách 4 vị trí người chơi */}
        <section className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto pr-0.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Danh Sách Người Chơi ({occupiedCount}/4)
            </h2>
            <span className="text-[10px] text-slate-400">Tối đa 4 người/bàn</span>
          </div>

          <div className="flex flex-col gap-2" data-testid="lobby-slots-grid">
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

        {/* Thẻ Thể Lệ Thi Đấu & Mã QR Mời Bạn Bè */}
        <div
          className="w-full bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 shadow-md text-left"
          data-testid="lobby-rules-card"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 text-sm font-black" aria-hidden="true">📜</span>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
                Tóm Tắt Thể Lệ Thi Đấu
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowQr((prev) => !prev)}
              className="text-[10px] text-amber-400 hover:text-amber-300 cursor-pointer underline flex items-center gap-1"
            >
              📱 {showQr ? 'Ẩn QR' : 'Mã QR Mời'}
            </button>
          </div>

          {showQr && (
            <div className="mb-2">
              <QrCodeCard roomCode={roomCode} />
            </div>
          )}

          <div className="grid grid-cols-3 gap-1.5">
            {/* Huy hiệu 1: Vốn khởi điểm */}
            <div className="flex flex-col items-center text-center p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-lg mb-0.5" aria-hidden="true">💰</span>
              <span className="text-[10px] font-black text-amber-300">Vốn 15 Tỷ VNĐ</span>
              <span className="text-[8px] text-slate-400 mt-0.5 leading-tight">15.000 Tr. VNĐ</span>
              <span className="text-[7.5px] text-emerald-400 mt-0.5 leading-tight">+2.000 Tr. VNĐ</span>
            </div>

            {/* Huy hiệu 2: Thời lượng ván đấu */}
            <div className="flex flex-col items-center text-center p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-lg mb-0.5" aria-hidden="true">⏳</span>
              <span className="text-[10px] font-black text-amber-300">30 Vòng Đấu</span>
              <span className="text-[8px] text-slate-400 mt-0.5 leading-tight">30 vòng</span>
              <span className="text-[7.5px] text-slate-500 mt-0.5 leading-tight">Bàn cờ 40 ô</span>
            </div>

            {/* Huy hiệu 3: Điều kiện thắng */}
            <div className="flex flex-col items-center text-center p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-lg mb-0.5" aria-hidden="true">🏆</span>
              <span className="text-[10px] font-black text-amber-300">Đại Gia Vô Địch</span>
              <span className="text-[8px] text-slate-400 mt-0.5 leading-tight">Điều kiện thắng</span>
              <span className="text-[7.5px] text-slate-500 mt-0.5 leading-tight">Tài sản cực đại</span>
            </div>
          </div>
        </div>

        {/* Footer / Action Bar */}
        <footer className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={resetLobby}
            className="min-h-[44px] inline-flex items-center justify-center text-xs text-slate-400 hover:text-rose-400 transition-colors py-2 px-3 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            data-testid="leave-lobby-btn"
            aria-label="Rời phòng chờ"
          >
            ← Rời Phòng
          </button>

          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] text-slate-400 text-right" aria-live="polite">{getStartButtonHint()}</span>

            {isHost ? (
              <button
                type="button"
                disabled={!canStartCheck.canStart}
                onClick={handleStartGame}
                className={`min-h-[44px] py-2.5 px-6 rounded-xl font-extrabold text-xs tracking-wide transition-all shadow-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  canStartCheck.canStart
                    ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-amber-950 font-black active:scale-95 shadow-amber-500/40 ring-2 ring-amber-300/60'
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
                className={`min-h-[44px] py-2.5 px-6 rounded-xl font-bold text-xs tracking-wide transition-all shadow-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
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
      </aside>
    </div>
  );
}
