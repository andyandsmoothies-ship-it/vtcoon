// [TC-NET02.1/MSS][TC-NET02.2/MSS][IMP-22] PreMatchDeck — Thẻ VIP Chuẩn Bị Phòng Tabletop-First
// Thiết kế Glassmorphism nổi tinh tế trên nền sa bàn 3D Đảo Ngọc Nhiệt Đới chuẩn Retropoly
import React, { useState } from 'react';
import { useLobbyStore } from '../../store/lobby_store';
import { PlayerSlotCard } from './player_slot_card';
import { QrCodeCard } from './qr_code_card';
import { GameRulesModal } from '../modals/game_rules_modal';
import { BotPersonality, type LobbySlot } from '../../store/lobby_types';
import { useAudioStore } from '../../store/audio_store';
import { AudioEngine } from '../../audio/audio_engine';
import { SoundEffect } from '../../audio/audio_types';
import type { WsClientMessage } from '../../../server/network/network_types';

export interface PreMatchDeckProps {
  readonly onStartGame?: () => void;
  readonly sendWsMessage?: (msg: WsClientMessage) => void;
  readonly roomCode?: string;
  readonly isHost?: boolean;
  readonly slots?: readonly LobbySlot[];
}

export function PreMatchDeck({
  onStartGame,
  sendWsMessage,
  roomCode: propRoomCode,
  isHost: propIsHost,
  slots: propSlots,
}: PreMatchDeckProps): React.ReactElement {
  const storeRoomCode = useLobbyStore((s) => s.roomCode);
  const storeIsHost = useLobbyStore((s) => s.isHost);
  const storeIsReady = useLobbyStore((s) => s.isReady);
  const storeSlots = useLobbyStore((s) => s.slots);
  const storeMyPlayerId = useLobbyStore((s) => s.myPlayerId);

  const roomCode = propRoomCode ?? storeRoomCode ?? 'VT8888';
  const isHost = propIsHost ?? storeIsHost;
  const isReady = storeIsReady;
  const slots = propSlots ?? storeSlots;
  const playerId = storeMyPlayerId || 'p1';

  const toggleMyReady = useLobbyStore((s) => s.toggleMyReady);
  const toggleBotSlot = useLobbyStore((s) => s.toggleBotSlot);
  const cycleBotPersonality = useLobbyStore((s) => s.cycleBotPersonality);
  const startGame = useLobbyStore((s) => s.startGame);
  const canStartGame = useLobbyStore((s) => s.canStartGame);
  const isMuted = useAudioStore((s) => s.isMuted);
  const toggleMute = useAudioStore((s) => s.toggleMute);

  const canStartCheck = canStartGame();
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
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
    const targetSlot = slots[slotIndex];
    if (targetSlot && !targetSlot.isOccupied) {
      try {
        AudioEngine.handlePawnLanded(0);
      } catch {
        /* safe-ignore */
      }
    } else {
      try {
        AudioEngine.playSfx(SoundEffect.CARD_FLIP);
      } catch {
        /* safe-ignore */
      }
    }
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

    try {
      AudioEngine.playSfx(SoundEffect.DICE_ROLL);
    } catch {
      /* safe-ignore */
    }

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
      {/* Huy hiệu thương hiệu 3D dập nổi đỏ - vàng hoàng gia chuẩn Retropoly */}
      <header className="pointer-events-auto absolute top-4 left-4 md:top-6 md:left-6 z-30 inline-flex items-center gap-3.5 bg-gradient-to-b from-[#B91C1C] via-[#991B1B] to-[#700A0A] border-[2.5px] border-amber-300 ring-2 ring-amber-500/50 rounded-2xl px-5 py-3 shadow-[0_6px_0_0_#450a0a,0_12px_28px_rgba(0,0,0,0.65),inset_0_1px_2px_rgba(255,255,255,0.45)] overflow-hidden w-fit">
        {/* Lớp phủ vệt bóng bề mặt (Juicy Gloss Specular Highlight) */}
        <div className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/30 via-white/10 to-transparent pointer-events-none rounded-t-2xl" />

        {/* Huy hiệu kim loại mạ vàng dập nổi 3D */}
        <div className="relative z-10 w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-300 to-yellow-100 flex items-center justify-center font-black text-amber-950 text-lg shadow-[0_3px_0_0_#78350f,0_4px_10px_rgba(0,0,0,0.45),inset_0_1px_2px_rgba(255,255,255,0.9)] border-2 border-amber-100 ring-1 ring-amber-700/60 shrink-0">
          <span className="drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">VT</span>
        </div>

        {/* Tiêu đề thương hiệu VTCOON dập nổi 3D sắc nét */}
        <div className="relative z-10 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-wider text-white [text-shadow:_0_3px_0_#450a0a,_0_6px_12px_rgba(0,0,0,0.85)] leading-none">
              VTCOON
            </h1>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-amber-950 font-black uppercase tracking-wider shadow-[0_2px_0_0_#78350f] border border-amber-100 leading-none">
              3D
            </span>
          </div>
          <p className="text-[11px] font-bold text-amber-200 uppercase tracking-widest drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] mt-1">
            Sảnh Chờ Đảo Ngọc • Bến Cảng Du Thuyền
          </p>
        </div>

        {/* Nút Bật / Tắt âm thanh & Thu gọn bảng trong thanh huy hiệu */}
        <div className="relative z-10 flex items-center gap-2 pl-3 border-l-2 border-amber-400/40">
          <button
            type="button"
            onClick={() => {
              AudioEngine.resumeAudioContext();
              toggleMute();
            }}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-b from-[#1E375B] to-[#0F223D] hover:from-[#25446F] hover:to-[#162F52] text-amber-200 border border-amber-400/60 transition-all cursor-pointer text-xs font-bold shadow-[0_2px_0_0_#07101C] active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            title={isMuted ? 'Bật âm thanh sảnh chờ' : 'Tắt âm thanh sảnh chờ'}
            aria-label={isMuted ? 'Bật âm thanh sảnh chờ' : 'Tắt âm thanh sảnh chờ'}
            data-testid="lobby-mute-toggle-button"
          >
            <span className="text-sm" aria-hidden="true">{isMuted ? '🔇' : '🔊'}</span>
            <span className="hidden md:inline text-[11px] font-black">{isMuted ? 'Tắt âm' : 'Bật âm'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && typeof window.__resetCameraToDefault === 'function') {
                window.__resetCameraToDefault();
              }
            }}
            className="min-h-[44px] inline-flex items-center justify-center gap-1 text-[11px] px-3 py-2 rounded-xl bg-gradient-to-b from-[#1E375B] to-[#0F223D] hover:from-[#25446F] hover:to-[#162F52] text-amber-200 border border-amber-400/60 font-bold cursor-pointer transition-all shadow-[0_2px_0_0_#07101C] active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            data-testid="reset-camera-btn"
            aria-label="Đặt lại góc chuẩn"
            title="Đặt lại góc chuẩn 4 góc"
          >
            <span className="text-sm" aria-hidden="true">🎯</span>
            <span className="hidden md:inline text-[11px] font-black">Góc Chuẩn</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPanelCollapsed((prev) => !prev)}
            className="min-h-[44px] inline-flex items-center justify-center text-[11px] px-3.5 py-2 rounded-xl bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-amber-950 border border-amber-200 font-black cursor-pointer transition-all shadow-[0_2px_0_0_#78350f] active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            data-testid="toggle-lobby-panel-btn"
            aria-label={isPanelCollapsed ? 'Mở bảng điều khiển' : 'Thu gọn bảng điều khiển'}
          >
            {isPanelCollapsed ? '📋 Bảng' : '🏙️ Ngắm 3D'}
          </button>
        </div>
      </header>

      {/* Thẻ PreMatchDeck Clean & Modern nổi bên cánh phải */}
      <aside
        className="pointer-events-auto absolute top-4 md:top-6 right-3 md:right-6 w-[calc(100%-1.5rem)] sm:w-[350px] max-w-[350px] max-h-[calc(100vh-3rem)] z-20 flex flex-col justify-between p-4 bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xl rounded-2xl text-slate-900 overflow-hidden gap-3 transition-transform duration-300"
        style={{ transform: isPanelCollapsed ? 'translateX(calc(100% + 2rem))' : undefined }}
        data-testid="pre-match-deck"
      >
        {/* Tiêu đề & Trạng thái phòng */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <span>🏝️</span> Sảnh Chờ
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold tracking-wide">
                {occupiedCount === 4 && slots.every((s) => !s.isOccupied || s.isReady)
                  ? 'SẴN SÀNG (4/4)'
                  : `ĐANG CHỜ (${occupiedCount}/4)`}
              </span>
            </div>
          </div>

          {/* Hộp Mã phòng & Nút Thao tác */}
          <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mã Phòng:</span>
                <span className="text-lg font-black font-mono tracking-widest text-slate-900" data-testid="lobby-room-code">
                  {roomCode}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                  copiedCode
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900 shadow-xs'
                }`}
                data-testid="copy-room-code-btn"
                aria-label="Sao chép mã phòng"
              >
                {copiedCode ? '✓ Đã chép' : 'Sao chép'}
              </button>
            </div>

            {/* Thao tác Nhanh: Hướng Dẫn & Mã QR */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-200/80">
              <button
                type="button"
                onClick={() => setShowRulesModal(true)}
                className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                data-testid="open-game-rules-btn"
                aria-label="Xem hướng dẫn game"
              >
                <span>📖</span> Hướng Dẫn
              </button>
              <button
                type="button"
                onClick={() => setShowQr((prev) => !prev)}
                className="inline-flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                aria-label={showQr ? 'Ẩn mã QR' : 'Hiện mã QR'}
              >
                <span>📱</span> {showQr ? 'Ẩn QR' : 'Mã QR'}
              </button>
            </div>

            {showQr && (
              <div className="mt-1">
                <QrCodeCard roomCode={roomCode} />
              </div>
            )}
          </div>
        </div>

        {/* Danh sách 4 vị trí người chơi */}
        <section className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto pr-0.5">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Danh Sách Người Chơi ({occupiedCount}/4)
            </h2>
            <span className="text-[10px] text-slate-500">Tối đa 4 người/bàn</span>
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

        {/* Footer / Action Bar */}
        <footer className="pt-1 flex flex-col gap-2 border-t border-slate-200">
          {/* Hộp hướng dẫn điều kiện bắt đầu trận đấu */}
          <div
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center"
            aria-live="polite"
          >
            <span className="text-slate-500 text-xs shrink-0" aria-hidden="true">ℹ️</span>
            <span className="text-[11px] font-medium text-slate-600 leading-tight">
              {getStartButtonHint()}
            </span>
          </div>

          {isHost ? (
            <button
              type="button"
              disabled={!canStartCheck.canStart}
              onClick={handleStartGame}
              className={`w-full min-h-[44px] py-3 px-4 rounded-xl font-bold text-sm tracking-wide uppercase transition-all shadow-sm ${
                canStartCheck.canStart
                  ? 'cursor-pointer bg-blue-600 hover:bg-blue-700 text-white active:translate-y-px'
                  : 'cursor-not-allowed bg-slate-200 text-slate-400'
              }`}
              data-testid="start-game-btn"
            >
              BẮT ĐẦU TRẬN ĐẤU
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleMyReady}
              className={`w-full min-h-[44px] py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-sm cursor-pointer active:translate-y-px ${
                isReady
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              data-testid="toggle-ready-btn"
            >
              {isReady ? '✓ ĐÃ SẴN SÀNG' : 'SẴN SÀNG'}
            </button>
          )}
        </footer>
      </aside>

      {/* Modal Hướng Dẫn & Thể Lệ Game Chuyên Biệt */}
      <GameRulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />
    </div>
  );
}
