// [TC-NET02.1/MSS][TC-NET02.2/MSS][IMP-20] LobbyView — Màn hình Sảnh Chờ chính của VTCoOn
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
    <div className="relative w-full h-full min-h-screen text-slate-100 select-none pointer-events-none overflow-hidden">
      {/* Huy hiệu thương hiệu tinh tế góc trên bên trái */}
      <header className="pointer-events-auto absolute top-4 left-4 md:top-6 md:left-6 z-30 flex items-center gap-3 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2.5 shadow-2xl">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-black text-amber-950 text-sm shadow">
          VT
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-amber-300 drop-shadow">
            VTCOON
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">
            Sảnh Chờ Đảo Ngọc Nhiệt Đới • Bến Cảng Du Thuyền
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

      {/* Thẻ Glassmorphism mỏng nổi bên cánh phải theo Chuẩn Ảnh Concept 3 (Khắc phục P1 & P8) */}
      <aside className="pointer-events-auto absolute top-[74px] sm:top-6 bottom-6 right-3 md:right-6 w-[calc(100%-1.5rem)] sm:w-[380px] max-w-[380px] z-20 flex flex-col justify-between p-4 md:p-5 bg-slate-900/85 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl text-slate-100 overflow-hidden gap-3.5 transition-transform duration-300" style={{ transform: isPanelCollapsed ? 'translateX(calc(100% + 2rem))' : undefined }}>
        {/* Tiêu đề & Mã phòng 6 ký tự (Khắc phục P7 & P6) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black tracking-wider uppercase text-amber-400 flex items-center gap-1.5">
              <span>🏝️</span> SẢNH CHỜ: ĐẢO NGỌC NHIỆT ĐỚI
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              {occupiedCount === 4 && slots.every((s) => !s.isOccupied || s.isReady)
                ? 'ALL READY (4/4)'
                : `ĐANG CHỜ (${occupiedCount}/4)`}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2.5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-slate-950/90 via-amber-950/20 to-slate-950/90 shadow-[inset_0_1px_0_rgba(251,191,36,0.15)] px-3.5 py-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mã Phòng:</span>
            <span className="text-2xl font-black font-mono tracking-[0.25em] text-amber-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]" data-testid="lobby-room-code">
              {roomCode}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className={`min-h-[38px] px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                copiedCode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                  : 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border-slate-700/80'
              }`}
              data-testid="copy-room-code-btn"
              aria-label="Sao chép mã phòng"
            >
              {copiedCode ? '✓ Đã chép' : 'Sao chép'}
            </button>
          </div>
        </div>

        {/* Danh sách 4 vị trí người chơi (Khử bẫy cuộn lồng nhau P8) */}
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

        {/* Thẻ Thể Lệ Thi Đấu & Mã QR Mời Bạn Bè (Khắc phục P5) */}
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
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-900/90 border border-slate-800/90 shadow-sm">
              <span className="text-xl mb-1" aria-hidden="true">💰</span>
              <span className="text-[11px] font-bold text-amber-300">15.000 Tr. VNĐ</span>
              <span className="text-[10px] text-slate-300 mt-0.5 leading-tight">Vốn 15 Tỷ VNĐ</span>
              <span className="text-[10px] font-semibold text-emerald-400 mt-0.5 leading-tight">+2.000 Tr. VNĐ</span>
            </div>

            {/* Huy hiệu 2: Thời lượng ván đấu */}
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-900/90 border border-slate-800/90 shadow-sm">
              <span className="text-xl mb-1" aria-hidden="true">⏳</span>
              <span className="text-[11px] font-bold text-amber-300">30 vòng</span>
              <span className="text-[10px] text-slate-300 mt-0.5 leading-tight">30 Vòng Đấu</span>
              <span className="text-[10px] font-medium text-slate-400 mt-0.5 leading-tight">Bàn cờ 40 ô</span>
            </div>

            {/* Huy hiệu 3: Điều kiện thắng */}
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-900/90 border border-slate-800/90 shadow-sm">
              <span className="text-xl mb-1" aria-hidden="true">🏆</span>
              <span className="text-[11px] font-bold text-amber-300">Điều kiện thắng</span>
              <span className="text-[10px] text-slate-300 mt-0.5 leading-tight">Đại Gia Vô Địch</span>
              <span className="text-[10px] font-medium text-slate-400 mt-0.5 leading-tight">Tài sản cực đại</span>
            </div>
          </div>
        </div>

        {/* Footer / Action Bar (Khắc phục P3 Tactile 3D Button) */}
        <footer className="pt-2 pb-1 border-t border-slate-800/80 flex items-center justify-between gap-2">
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
                className={`min-h-[44px] py-2.5 px-6 rounded-xl font-black text-xs tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  canStartCheck.canStart
                    ? 'cursor-pointer bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-amber-950 shadow-[0_4px_0_0_#b45309,0_8px_16px_rgba(245,158,11,0.25)] hover:shadow-[0_2px_0_0_#b45309] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] ring-1 ring-amber-300/50'
                    : 'cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-700/50'
                }`}
                data-testid="start-game-btn"
              >
                BẮT ĐẦU TRẬN ĐẤU
              </button>
            ) : (
              <button
                type="button"
                onClick={toggleMyReady}
                className={`min-h-[44px] py-2.5 px-6 rounded-xl font-bold text-xs tracking-wide transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  isReady
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_4px_0_0_#047857,0_8px_16px_rgba(16,185,129,0.25)] hover:shadow-[0_2px_0_0_#047857] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-[0_4px_0_0_#334155] hover:shadow-[0_2px_0_0_#334155] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]'
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
