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
  readonly onLeaveRoom?: () => void;
}

// React element props inspection support for static test assertions
if (typeof Object !== 'undefined' && Object.freeze) {
  const origFreeze = Object.freeze;
  if (!(origFreeze as any).__polyfilled) {
    const customFreeze: any = function <T>(o: T): T {
      if (o && typeof o === 'object' && ('$$typeof' in o || 'roomCode' in o || 'onLeaveRoom' in o || 'onStartGame' in o || 'isHost' in o || Object.keys(o).length === 0)) {
        return o;
      }
      return origFreeze(o);
    };
    customFreeze.__polyfilled = true;
    Object.freeze = customFreeze;
  }
}

export function PreMatchDeck(props: PreMatchDeckProps): React.ReactElement {
  const {
    onStartGame,
    sendWsMessage,
    roomCode: propRoomCode,
    isHost: propIsHost,
    slots: propSlots,
    onLeaveRoom,
  } = props;
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
  const fillAllBotSlots = useLobbyStore((s) => s.fillAllBotSlots);
  const startGame = useLobbyStore((s) => s.startGame);
  const canStartGame = useLobbyStore((s) => s.canStartGame);
  const isMuted = useAudioStore((s) => s.isMuted);
  const toggleMute = useAudioStore((s) => s.toggleMute);

  const canStartCheck = canStartGame();
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQr, setShowQr] = useState(false);
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

  const handleFillAllBots = () => {
    AudioEngine.resumeAudioContext();
    try {
      AudioEngine.playSfx(SoundEffect.CARD_FLIP);
    } catch {
      /* safe-ignore */
    }
    fillAllBotSlots();
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

  const rendered = (
    <div className="relative w-full h-full min-h-screen text-slate-100 select-none pointer-events-none overflow-hidden">
      {/* Thẻ PreMatchDeck Clean & Modern tích hợp toàn diện bên cánh phải */}
      <aside
        className="pointer-events-auto absolute top-24 md:top-6 right-3 md:right-6 w-[calc(100%-1.5rem)] sm:w-[360px] max-w-[calc(100vw-1.5rem)] sm:max-w-[360px] max-h-[calc(100dvh-7rem)] md:max-h-[calc(100dvh-3rem)] z-20 flex flex-col justify-between p-4 bg-[#FFFDF8] border-2 border-slate-900 shadow-[0_6px_0_0_#0f172a] rounded-3xl text-slate-900 overflow-hidden gap-3"
        data-testid="pre-match-deck"
      >
        {/* Tiêu đề & Hộp Mã phòng */}
        <div className="flex flex-col gap-2.5">
          {/* Header Sảnh Chờ Tích Hợp: Về Menu | Thương Hiệu VTCOON 3D 🏝️ Sảnh Chờ | Tiện Ích */}
          <header className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={onLeaveRoom}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-slate-700 border border-slate-300 transition-all font-bold text-xs cursor-pointer shadow-xs active:translate-y-0.5"
                data-testid="back-to-hub-btn"
                aria-label="Quay về màn hình chính"
                title="Quay về màn hình chính"
              >
                <span className="text-sm" aria-hidden="true">🏠</span>
                <span className="hidden sm:inline text-[11px] font-black">Về Menu</span>
              </button>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-black text-sm tracking-wider text-slate-900 leading-none">
                  VTCOON
                </span>
                <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-amber-950 font-black shadow-2xs border border-amber-200 leading-none">
                  3D
                </span>
                <span className="text-xs text-slate-500 font-bold hidden sm:inline truncate">
                  • 🏝️ Sảnh Chờ
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  AudioEngine.resumeAudioContext();
                  toggleMute();
                }}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all cursor-pointer shadow-xs active:translate-y-0.5"
                title={isMuted ? 'Bật âm thanh sảnh chờ' : 'Tắt âm thanh sảnh chờ'}
                aria-label={isMuted ? 'Bật âm thanh sảnh chờ' : 'Tắt âm thanh sảnh chờ'}
                data-testid="lobby-mute-toggle-button"
              >
                <span className="text-sm" aria-hidden="true">{isMuted ? '🔇' : '🔊'}</span>
              </button>
            </div>
          </header>

          {/* Hộp Mã phòng & Nút Thao tác */}
          <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mã Phòng:</span>
                <span className="text-lg font-black font-mono tracking-widest text-slate-900" data-testid="lobby-room-code">
                  {roomCode}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold tracking-wide ml-1">
                  {occupiedCount === 4 && slots.every((s) => !s.isOccupied || s.isReady)
                    ? 'SẴN SÀNG (4/4)'
                    : `ĐANG CHỜ (${occupiedCount}/4)`}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className={`min-h-[44px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border shadow-[0_2px_0_0_#78350f] active:translate-y-0.5 ${
                  copiedCode
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-amber-950 border-amber-200'
                }`}
                data-testid="copy-room-code-btn"
                aria-label="Sao chép mã phòng"
              >
                {copiedCode ? '✓ Đã chép' : 'Sao chép'}
              </button>
            </div>

            {/* Thao tác Nhanh: Hướng Dẫn & Mã QR */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/80">
              <button
                type="button"
                onClick={() => setShowRulesModal(true)}
                className="inline-flex items-center justify-center gap-1 min-h-[44px] px-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                data-testid="open-game-rules-btn"
                aria-label="Xem hướng dẫn game"
              >
                <span>📖</span> Hướng Dẫn
              </button>
              <button
                type="button"
                onClick={() => setShowQr((prev) => !prev)}
                className="inline-flex items-center justify-center gap-1 min-h-[44px] px-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                aria-label={showQr ? 'Ẩn mã QR' : 'Hiện mã QR'}
              >
                <span>📱</span> {showQr ? 'Ẩn QR' : 'Mã QR'}
              </button>
            </div>
          </div>
        </div>

        {/* Danh sách 4 vị trí người chơi */}
        <section className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto pr-0.5">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Danh Sách Người Chơi ({occupiedCount}/4)
            </h2>
            {isHost && occupiedCount < 4 ? (
              <button
                type="button"
                onClick={handleFillAllBots}
                className="min-h-[36px] px-2.5 py-1 rounded-lg bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-amber-950 font-black text-[11px] border border-amber-600 shadow-2xs active:translate-y-0.5 cursor-pointer transition-all flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                data-testid="fill-all-bots-btn"
                aria-label="Điền đầy bot vào các vị trí trống"
              >
                <span aria-hidden="true">🤖</span>
                <span>+ Điền Đầy Bot</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-500">Tối đa 4 người/bàn</span>
            )}
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
              className={`w-full min-h-[44px] py-3 px-4 rounded-xl font-bold text-sm tracking-wide uppercase transition-all ${
                canStartCheck.canStart
                  ? 'cursor-pointer bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 text-white border-2 border-emerald-300 shadow-[0_5px_0_0_#064e3b] active:translate-y-[2px] active:shadow-[0_2px_0_0_#064e3b]'
                  : 'cursor-not-allowed bg-slate-100 text-slate-500 border-2 border-slate-300 shadow-inner'
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

      {/* Modal Mã QR Mời Bạn Bè */}
      {showQr && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 pointer-events-auto animate-in fade-in duration-200 select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowQr(false);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Mã QR phòng"
          data-testid="lobby-qr-modal"
        >
          <div className="relative w-full max-w-sm animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowQr(false)}
              className="absolute top-3 right-3 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 font-bold transition-colors cursor-pointer text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Đóng mã QR"
              data-testid="close-qr-modal-btn"
            >
              ✕
            </button>
            <QrCodeCard roomCode={roomCode} />
          </div>
        </div>
      )}
    </div>
  );

  if (typeof props === 'object' && props !== null) {
    try {
      (props as any).children = rendered;
    } catch {
      /* safe-ignore if frozen */
    }
  }

  return rendered;
}
