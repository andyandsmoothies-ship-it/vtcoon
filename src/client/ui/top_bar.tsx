// [UI-S03/MSS][UI-S05/MSS] TopBar Component — Round info, turn timer, treasury pool & audio toggle
import React from 'react';
import { TurnPhase } from '../../domain/room.js';
import { useGameStore } from '../store/game_store.js';
import { useAudioStore } from '../store/audio_store';
import { useEnvironmentStore } from '../store/environment_store';
import { useActivityStore } from '../store/activity_store';
import { useTelemetryStore } from '../telemetry/telemetry_store.js';
import { formatCurrency, formatTimeRemaining } from './ui_helpers';

export interface TopBarProps {
  readonly onLeaveRoom?: () => void;
  readonly unreadCount?: number;
  readonly isActivityFeedOpen?: boolean;
  readonly onToggleActivityFeed?: () => void;
}

function MobileFpsBadge({ onToggleConsole }: { readonly onToggleConsole: () => void }): React.ReactElement {
  const isSSR = typeof window === 'undefined';
  const storeFps = useTelemetryStore((state) => state.metrics.fps);
  const fps = isSSR ? Math.round(useTelemetryStore.getState().metrics.fps) : Math.round(storeFps);

  return (
    <>
      <div className="h-4 w-px bg-slate-300 hidden min-[360px]:block sm:hidden" aria-hidden="true" />
      <button
        type="button"
        data-testid="mobile-fps-badge"
        onClick={onToggleConsole}
        className={`hidden min-[360px]:inline-flex sm:hidden pointer-events-auto items-center gap-0.5 px-1 py-0.5 rounded-md bg-slate-900 font-mono text-[10px] font-bold border border-slate-700 shadow-2xs cursor-pointer select-none active:translate-y-px ${
          fps >= 45 ? 'text-emerald-400' : fps >= 25 ? 'text-amber-400' : 'text-rose-400'
        }`}
        title="Tốc độ khung hình (Bấm để mở hộp đen)"
        aria-label={`FPS: ${fps}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${fps >= 45 ? 'bg-emerald-400' : fps >= 25 ? 'bg-amber-400' : 'bg-rose-400'}`} aria-hidden="true" />
        <span>{fps}<span className="hidden min-[480px]:inline"> FPS</span></span>
      </button>
    </>
  );
}

export function TopBar(props: TopBarProps): React.ReactElement {
  const { onLeaveRoom } = props;
  const storeRoundNumber = useGameStore((state) => state.roundNumber);
  const storeMaxRounds = useGameStore((state) => state.maxRounds);
  const storeTurnTimeRemaining = useGameStore((state) => state.turnTimeRemaining);
  const storeIsPlayerHudVisible = useGameStore((state) => state.isPlayerHudVisible);
  const togglePlayerHudVisibility = useGameStore((state) => state.togglePlayerHudVisibility);

  const isSSR = typeof window === 'undefined';
  const live = isSSR ? useGameStore.getState() : null;

  const roundNumber = live ? live.roundNumber : storeRoundNumber;
  const maxRounds = live ? live.maxRounds : storeMaxRounds;
  const turnTimeRemaining = live ? live.turnTimeRemaining : storeTurnTimeRemaining;
  const isPlayerHudVisible = live ? live.isPlayerHudVisible : storeIsPlayerHudVisible;

  const storeAuction = useGameStore((state) => state.auction);
  const storePendingTradeOffer = useGameStore((state) => state.pendingTradeOffer);
  const storePendingBuyout = useGameStore((state) => state.pendingBuyout);
  const storeTurnPhase = useGameStore((state) => state.turnPhase);

  const auction = live ? live.auction : storeAuction;
  const pendingTradeOffer = live ? live.pendingTradeOffer : storePendingTradeOffer;
  const pendingBuyout = live ? live.pendingBuyout : storePendingBuyout;
  const turnPhase = live ? live.turnPhase : storeTurnPhase;

  const isAuctionActive = Boolean(auction && !auction.isConcluded && turnPhase === TurnPhase.AuctionPhase);
  const isTradeActive = Boolean(pendingTradeOffer);
  const isBuyoutActive = Boolean(pendingBuyout);
  const isSubPhaseActive = isAuctionActive || isTradeActive || isBuyoutActive;
  const isMuted = useAudioStore((state) => state.isMuted);
  const toggleMute = useAudioStore((state) => state.toggleMute);
  const timeOfDayMode = useEnvironmentStore((state) => state.mode);
  const timeOfDayPhase = useEnvironmentStore((state) => state.phase);
  const toggleNextTimeOfDay = useEnvironmentStore((state) => state.toggleNextMode);
  const storeIsActivityFeedOpen = useActivityStore((state) => state.isActivityFeedOpen);
  const storeUnreadCount = useActivityStore((state) => state.unreadCount);
  const storeToggleActivityFeed = useActivityStore((state) => state.toggleOpen);

  const isActivityFeedOpen = props.isActivityFeedOpen ?? storeIsActivityFeedOpen;
  const unreadCount = props.unreadCount ?? storeUnreadCount;
  const toggleActivityFeed = props.onToggleActivityFeed ?? storeToggleActivityFeed;

  const toggleConsole = useTelemetryStore((state) => state.toggleConsole);

  const timeOfDayIcon = timeOfDayMode === 'auto' ? '🌤️' : timeOfDayPhase === 'night' ? '🌙' : timeOfDayPhase === 'sunset' ? '🌅' : '☀️';
  const timeOfDayLabel = timeOfDayMode === 'auto' ? 'Ánh Sáng: Tự Động' : timeOfDayPhase === 'night' ? 'Đêm' : timeOfDayPhase === 'sunset' ? 'Hoàng Hôn' : 'Ngày';

  const isLowTime = turnTimeRemaining <= 10;
  const timerColorClass = isLowTime
    ? 'text-rose-600 font-extrabold animate-pulse'
    : 'text-emerald-700 font-bold';

  const displayMaxRounds = roundNumber > maxRounds ? (roundNumber <= 40 ? 40 : roundNumber) : maxRounds;

  return (
    <header
      data-testid="top-bar"
      className="w-full max-w-full overflow-hidden flex justify-center items-center pointer-events-none px-1 sm:px-4 pt-[calc(0.375rem+env(safe-area-inset-top))] sm:pt-3"
    >
      <div
        className="pointer-events-auto relative flex items-center justify-between gap-1 min-[360px]:gap-1.5 sm:gap-3 md:gap-4 bg-[#FFFDF8] border border-slate-300/80 shadow-lg shadow-slate-900/10 rounded-2xl p-1.5 sm:p-2 pl-1.5 pr-3 min-[360px]:pl-2 min-[360px]:pr-3.5 sm:px-4 w-full sm:w-auto max-w-[calc(100vw-0.75rem)] sm:max-w-4xl text-slate-900 select-none"
      >
        {/* Cụm bên trái: Thông tin trận đấu */}
        <div
          data-testid="match-info-capsule"
          className="flex items-center gap-1 min-[360px]:gap-1 sm:gap-2.5 text-xs md:text-sm font-medium shrink-0 px-2 min-[360px]:px-2.5 sm:px-4"
        >
          {/* Vòng đấu */}
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-slate-600 text-xs uppercase tracking-wider font-bold hidden sm:inline">Vòng</span>
            <span className="font-bold text-amber-700 pl-0.5">
              {roundNumber}
              <span className="text-slate-500 text-xs font-normal">/{displayMaxRounds}</span>
            </span>
          </div>

          <div className="h-4 w-px bg-slate-300" aria-hidden="true" />

          {/* Đồng hồ đếm ngược hoặc Huy hiệu Subphase */}
          {isSubPhaseActive ? (
            <div
              data-testid="topbar-subphase-indicator"
              className="flex items-center gap-1 sm:gap-1.5 px-1.5 min-[360px]:px-1.5 sm:px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 select-none animate-in fade-in duration-150"
            >
              <span className="text-xs sm:text-sm" aria-hidden="true">
                {isAuctionActive ? '🏛️' : isTradeActive ? '🤝' : '🏢'}
              </span>
              <span className="text-xs font-semibold whitespace-nowrap">
                <span className="hidden min-[380px]:inline sm:hidden">
                  {isAuctionActive ? 'Đấu giá' : isTradeActive ? 'Thương lượng' : 'Mua đứt'}
                </span>
                <span className="hidden sm:inline">
                  {isAuctionActive ? 'Đang đấu giá' : isTradeActive ? 'Đang thương lượng' : 'Mua đứt cưỡng chế'}
                </span>
              </span>
            </div>
          ) : (
            <div
              className="flex items-center gap-1 sm:gap-2 isolate [transform:translateZ(0)] [backface-visibility:hidden]"
              role="timer"
              aria-live="polite"
            >
              <span className="text-sm sm:text-base" aria-hidden="true">⏱️</span>
              <span className="hidden sm:inline text-xs text-slate-600 font-semibold">Thời gian:</span>
              <span
                key={turnTimeRemaining}
                className={`tabular-nums font-mono text-xs sm:text-base whitespace-nowrap antialiased [transform:translateZ(0)] [backface-visibility:hidden] ${timerColorClass}`}
              >
                {formatTimeRemaining(turnTimeRemaining)}
              </span>
            </div>
          )}

          {/* Huy hiệu FPS di động (được cô lập trong subcomponent để tránh re-render toàn bộ TopBar) */}
          <MobileFpsBadge onToggleConsole={toggleConsole} />
        </div>

        {/* Vách ngăn trung tâm phân định giữa Thông Tin Trận Đấu và Cụm Tiện Ích */}
        <div className="h-5 sm:h-6 w-px bg-slate-300 rounded-full shrink-0" aria-hidden="true" />

        {/* Cụm bên phải: Tiện ích HUD */}
        <div
          data-testid="hud-utilities-cluster"
          className="flex items-center gap-1 sm:gap-1.5 shrink-0"
        >
          {/* Nút Bật / Tắt Bảng Điểm người chơi */}
          <button
            type="button"
            onClick={togglePlayerHudVisibility}
            className={`shrink-0 relative w-8 h-8 min-h-[36px] min-w-[36px] sm:w-auto sm:h-8 sm:min-w-[36px] inline-flex items-center justify-center gap-1.5 p-0 sm:px-3 rounded-xl transition-all cursor-pointer text-xs font-semibold border shadow-xs active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 after:absolute after:-inset-1.5 after:content-[''] ${
              isPlayerHudVisible
                ? 'bg-amber-100 text-amber-900 border-amber-400 ring-1 ring-amber-400/50'
                : 'bg-[#F7F2E7] hover:bg-amber-100 text-slate-900 border-slate-300/80'
            }`}
            title={isPlayerHudVisible ? 'Ẩn Bảng Điểm' : 'Hiện Bảng Điểm'}
            aria-label={isPlayerHudVisible ? 'Ẩn Bảng Điểm người chơi' : 'Hiện Bảng Điểm người chơi'}
            data-testid="toggle-hud-topbar-btn"
          >
            <span className="text-sm" aria-hidden="true">👥</span>
            <span className="hidden sm:inline">Bảng Điểm</span>
          </button>

          {/* Nút Chu kỳ Thời gian Ngày - Hoàng Hôn - Đêm */}
          <button
            type="button"
            onClick={toggleNextTimeOfDay}
            className="shrink-0 hidden min-[440px]:inline-flex sm:inline-flex relative w-8 h-8 min-h-[36px] min-w-[36px] sm:w-auto sm:h-8 sm:min-w-[36px] items-center justify-center gap-1.5 p-0 sm:px-3 rounded-xl bg-[#F7F2E7] hover:bg-amber-100 text-slate-900 transition-all cursor-pointer text-xs font-semibold border border-slate-300/80 shadow-xs active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 after:absolute after:-inset-1.5 after:content-['']"
            title={`Ánh sáng: ${timeOfDayLabel} (Bấm để đổi)`}
            aria-label={`Chuyển chu kỳ ánh sáng (Hiện tại: ${timeOfDayLabel})`}
            data-testid="time-of-day-toggle-button"
          >
            <span className="text-sm" aria-hidden="true">{timeOfDayIcon}</span>
            <span className="hidden sm:inline">{timeOfDayLabel}</span>
          </button>

          {/* Nút Bật / Tắt âm thanh */}
          <button
            type="button"
            onClick={toggleMute}
            className="shrink-0 relative w-8 h-8 min-h-[36px] min-w-[36px] sm:w-auto sm:h-8 sm:min-w-[36px] inline-flex items-center justify-center gap-1.5 p-0 sm:px-3 rounded-xl bg-[#F7F2E7] hover:bg-amber-100 text-slate-900 transition-all cursor-pointer text-xs font-semibold border border-slate-300/80 shadow-xs active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 after:absolute after:-inset-1.5 after:content-['']"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            aria-label={isMuted ? 'Bật âm thanh trò chơi' : 'Tắt âm thanh trò chơi'}
            data-testid="mute-toggle-button"
          >
            <span className="text-sm" aria-hidden="true">{isMuted ? '🔇' : '🔊'}</span>
            <span className="hidden sm:inline">{isMuted ? 'Tắt' : 'Bật'}</span>
          </button>

          {/* Nút Hướng Dẫn & Thể Lệ Trò Chơi */}
          <button
            type="button"
            onClick={() => useGameStore.getState().openModal('rules', { initialTab: 'mechanics' })}
            className="shrink-0 relative w-8 h-8 min-h-[36px] min-w-[36px] sm:w-auto sm:h-8 sm:min-w-[36px] inline-flex items-center justify-center gap-1.5 p-0 sm:px-3 rounded-xl bg-[#F7F2E7] hover:bg-amber-100 text-slate-900 transition-all cursor-pointer text-xs font-semibold border border-slate-300/80 shadow-xs active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 after:absolute after:-inset-1.5 after:content-['']"
            title="Xem Luật Chơi & Cơ Chế Game"
            aria-label="Xem Luật Chơi & Cơ Chế Game"
            data-testid="quick-rules-topbar-btn"
          >
            <span className="text-sm" aria-hidden="true">📖</span>
            <span className="hidden sm:inline">Luật Chơi</span>
          </button>

          {/* Nút Bật / Tắt Nhật Ký Hành Động */}
          <button
            type="button"
            onClick={toggleActivityFeed}
            className="shrink-0 relative w-8 h-8 min-h-[36px] min-w-[36px] sm:w-auto sm:h-8 sm:min-w-[36px] inline-flex items-center justify-center gap-1.5 p-0 sm:px-3 rounded-xl bg-[#F7F2E7] hover:bg-amber-100 text-slate-900 transition-all cursor-pointer text-xs font-semibold border border-slate-300/80 shadow-xs active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 after:absolute after:-inset-1.5 after:content-['']"
            title={isActivityFeedOpen ? 'Đóng nhật ký' : 'Mở nhật ký hoạt động'}
            aria-label={`Nhật ký hoạt động${unreadCount > 0 ? ` (${unreadCount} mới)` : ''}`}
            data-testid="activity-feed-toggle-button"
          >
            <span className="text-sm" aria-hidden="true">📜</span>
            <span className="hidden sm:inline">Nhật Ký</span>
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 right-0 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-rose-600 px-0.5 text-[8px] font-black text-white shadow-md border border-slate-900 pointer-events-none"
                data-testid="activity-unread-badge"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Nút Thoát Bàn / Về Sảnh Chờ */}
          {onLeaveRoom && (
            <>
              <div className="h-4 w-px bg-slate-300" aria-hidden="true" />
              <button
                type="button"
                onClick={onLeaveRoom}
                className="shrink-0 relative w-8 h-8 min-h-[36px] min-w-[36px] sm:w-auto sm:h-8 sm:min-w-[36px] inline-flex items-center justify-center gap-1.5 p-0 sm:px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 transition-all cursor-pointer text-xs font-bold border border-rose-300 shadow-xs active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 after:absolute after:-inset-1.5 after:content-['']"
                title="Thoát bàn và trở về sảnh chờ"
                aria-label="Thoát bàn và trở về sảnh chờ"
                data-testid="leave-room-button"
              >
                <span className="text-sm" aria-hidden="true">🚪</span>
                <span className="hidden sm:inline">Thoát</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
