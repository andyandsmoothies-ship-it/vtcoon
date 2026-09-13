// [TC-NET02.1/MSS][TC-NET02.2/MSS][IMP-22] PreMatchDeck — Thẻ VIP Chuẩn Bị Phòng Tabletop-First
// Thiết kế Glassmorphism nổi tinh tế trên nền sa bàn 3D Đảo Ngọc Nhiệt Đới chuẩn Retropoly
import React, { useState } from 'react';
import { useLobbyStore } from '../../store/lobby_store';
import { PlayerSlotCard } from './player_slot_card';
import { QrCodeCard } from './qr_code_card';
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
            onClick={() => setIsPanelCollapsed((prev) => !prev)}
            className="min-h-[44px] inline-flex items-center justify-center text-[11px] px-3.5 py-2 rounded-xl bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-amber-950 border border-amber-200 font-black cursor-pointer transition-all shadow-[0_2px_0_0_#78350f] active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            data-testid="toggle-lobby-panel-btn"
            aria-label={isPanelCollapsed ? 'Mở bảng điều khiển' : 'Thu gọn bảng điều khiển'}
          >
            {isPanelCollapsed ? '📋 Bảng' : '🏙️ Ngắm 3D'}
          </button>
        </div>
      </header>

      {/* Thẻ PreMatchDeck Glassmorphism nổi bên cánh phải giải phóng >=85% sa bàn đảo ngọc */}
      <aside
        className="pointer-events-auto absolute top-4 md:top-6 right-3 md:right-6 w-[calc(100%-1.5rem)] sm:w-[400px] max-w-[400px] max-h-[calc(100vh-3rem)] z-20 flex flex-col justify-between p-4 md:p-5 bg-[#0A1628]/80 backdrop-blur-2xl border-2 border-amber-400/40 ring-1 ring-amber-300/25 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_35px_rgba(245,158,11,0.18),inset_0_1px_1px_rgba(251,191,36,0.3)] text-slate-100 overflow-hidden gap-3 transition-transform duration-300"
        style={{ transform: isPanelCollapsed ? 'translateX(calc(100% + 2rem))' : undefined }}
        data-testid="pre-match-deck"
      >
        {/* Tiêu đề & Mã phòng 6 ký tự */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black tracking-wider uppercase text-amber-300 flex items-center gap-1.5 drop-shadow-sm">
              <span>🏝️</span> SẢNH CHỜ: ĐẢO NGỌC NHIỆT ĐỚI
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/25 to-amber-600/25 text-amber-200 border border-amber-400/40 font-black tracking-wide shadow-sm">
              {occupiedCount === 4 && slots.every((s) => !s.isOccupied || s.isReady)
                ? 'ALL READY (4/4)'
                : `ĐANG CHỜ (${occupiedCount}/4)`}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2.5 rounded-2xl border border-amber-400/35 bg-gradient-to-r from-[#0F223D]/80 via-[#182F52]/80 to-[#0F223D]/80 shadow-[inset_0_1px_1px_rgba(251,191,36,0.2),0_4px_12px_rgba(0,0,0,0.25)] px-3.5 py-2.5">
            <span className="text-[11px] font-bold text-amber-200/80 uppercase tracking-wider">Mã Phòng:</span>
            <span className="text-2xl font-black font-mono tracking-[0.25em] text-amber-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]" data-testid="lobby-room-code">
              {roomCode}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                copiedCode
                  ? 'bg-amber-500/30 text-amber-200 border-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.5)]'
                  : 'bg-gradient-to-b from-[#1E375B] to-[#142640] hover:from-[#25446F] hover:to-[#193052] text-amber-100 border-amber-400/30 shadow-[0_2px_0_0_#0A1628]'
              }`}
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
            <h2 className="text-xs font-black uppercase tracking-wider text-amber-200/90">
              Danh Sách Người Chơi ({occupiedCount}/4)
            </h2>
            <span className="text-[10px] text-slate-300">Tối đa 4 người/bàn</span>
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
          className="w-full bg-gradient-to-b from-[#0D1D33]/80 to-[#091526]/80 border border-amber-400/30 ring-1 ring-amber-300/15 rounded-2xl p-3 shadow-md text-left"
          data-testid="lobby-rules-card"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-400/15">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-300 text-sm font-black" aria-hidden="true">📜</span>
              <h3 className="text-[11px] font-black uppercase tracking-wider text-amber-200">
                Tóm Tắt Thể Lệ Thi Đấu
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowQr((prev) => !prev)}
              className="text-[10px] text-amber-300 hover:text-amber-200 cursor-pointer font-bold underline flex items-center gap-1"
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
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-[#11233D]/80 border border-amber-400/20 shadow-sm">
              <span className="text-xl mb-1" aria-hidden="true">💰</span>
              <span className="text-[11px] font-black text-amber-300">15.000 Tr. VNĐ</span>
              <span className="text-[10px] text-slate-300 mt-0.5 leading-tight">Vốn 15 Tỷ VNĐ</span>
              <span className="text-[10px] font-bold text-emerald-300 mt-0.5 leading-tight">+2.000 Tr. VNĐ</span>
            </div>

            {/* Huy hiệu 2: Thời lượng ván đấu */}
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-[#11233D]/80 border border-amber-400/20 shadow-sm">
              <span className="text-xl mb-1" aria-hidden="true">⏳</span>
              <span className="text-[11px] font-black text-amber-300">30 vòng</span>
              <span className="text-[10px] text-slate-300 mt-0.5 leading-tight">30 Vòng Đấu</span>
              <span className="text-[10px] font-medium text-amber-200/70 mt-0.5 leading-tight">Bàn cờ 40 ô</span>
            </div>

            {/* Huy hiệu 3: Điều kiện thắng */}
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-[#11233D]/80 border border-amber-400/20 shadow-sm">
              <span className="text-xl mb-1" aria-hidden="true">🏆</span>
              <span className="text-[11px] font-black text-amber-300">Điều kiện thắng</span>
              <span className="text-[10px] text-slate-300 mt-0.5 leading-tight">Đại Gia Vô Địch</span>
              <span className="text-[10px] font-medium text-amber-200/70 mt-0.5 leading-tight">Tài sản cực đại</span>
            </div>
          </div>
        </div>

        {/* Phân cách đường kẻ trang nhã */}
        <div className="h-px w-full bg-amber-400/20" aria-hidden="true" />

        {/* Footer / Action Bar với nút 3D xúc giác */}
        <footer className="pt-0.5 flex flex-col gap-2">
          {/* Hộp hướng dẫn điều kiện bắt đầu trận đấu nổi bật */}
          <div
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0F223D]/95 via-[#182F52]/95 to-[#0F223D]/95 border border-amber-400/35 shadow-sm text-center"
            aria-live="polite"
          >
            <span className="text-amber-300 text-xs shrink-0" aria-hidden="true">ℹ️</span>
            <span className="text-[11px] font-bold text-amber-100/95 leading-tight">
              {getStartButtonHint()}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={resetLobby}
              className="min-h-[46px] px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-rose-300 bg-[#11233D]/60 hover:bg-rose-950/40 border border-amber-400/25 hover:border-rose-400/40 transition-all cursor-pointer shadow-[0_2px_0_0_#07101C] active:translate-y-0.5 active:shadow-none shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              data-testid="leave-lobby-btn"
              aria-label="Rời phòng chờ"
            >
              ← Rời Phòng
            </button>

            {isHost ? (
              <button
                type="button"
                disabled={!canStartCheck.canStart}
                onClick={handleStartGame}
                className={`flex-1 min-h-[46px] py-2.5 px-4 rounded-xl font-black text-xs tracking-wider uppercase transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  canStartCheck.canStart
                    ? 'cursor-pointer bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 text-amber-950 shadow-[0_5px_0_0_#92400e,0_10px_20px_rgba(245,158,11,0.4)] hover:shadow-[0_2px_0_0_#92400e] hover:translate-y-[3px] active:shadow-none active:translate-y-[5px] ring-2 ring-amber-200/70 border border-amber-200'
                    : 'cursor-not-allowed bg-gradient-to-b from-[#2a3f5f] via-[#1c2e47] to-[#122033] text-amber-100/80 border-2 border-amber-400/35 ring-1 ring-amber-300/20 shadow-[0_4px_0_0_#0a1420,0_6px_14px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.25)]'
                }`}
                data-testid="start-game-btn"
              >
                BẮT ĐẦU TRẬN ĐẤU
              </button>
            ) : (
              <button
                type="button"
                onClick={toggleMyReady}
                className={`flex-1 min-h-[46px] py-2.5 px-4 rounded-xl font-black text-xs tracking-wide transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  isReady
                    ? 'bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white shadow-[0_4px_0_0_#064e3b,0_8px_16px_rgba(16,185,129,0.3)] hover:shadow-[0_2px_0_0_#064e3b] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] ring-1 ring-emerald-300/40'
                    : 'bg-gradient-to-b from-[#1C3250] to-[#0E1E33] hover:from-[#233F64] hover:to-[#132742] text-amber-100 border border-amber-400/40 shadow-[0_4px_0_0_#07111D] ring-1 ring-amber-300/20 hover:shadow-[0_2px_0_0_#07111D] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]'
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
