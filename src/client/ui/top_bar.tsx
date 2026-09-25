// [UI-S03/MSS][UI-S05/MSS] TopBar Component — Round info, turn timer, treasury pool & audio toggle
import React from 'react';
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

export function TopBar(props: TopBarProps): React.ReactElement {
  const { onLeaveRoom } = props;
  const storeRoundNumber = useGameStore((state) => state.roundNumber);
  const storeMaxRounds = useGameStore((state) => state.maxRounds);
  const storeTurnTimeRemaining = useGameStore((state) => state.turnTimeRemaining);
  const storeCurrentTurnPlayerId = useGameStore((state) => state.currentTurnPlayerId);
  const storePlayersInfo = useGameStore((state) => state.playersInfo);
  const storeTreasuryPool = useGameStore((state) => state.treasuryPool);

  const isSSR = typeof window === 'undefined';
  const live = isSSR ? useGameStore.getState() : null;

  const roundNumber = live ? live.roundNumber : storeRoundNumber;
  const maxRounds = live ? live.maxRounds : storeMaxRounds;
  const turnTimeRemaining = live ? live.turnTimeRemaining : storeTurnTimeRemaining;
  const currentTurnPlayerId = live ? live.currentTurnPlayerId : storeCurrentTurnPlayerId;
  const playersInfo = live ? live.playersInfo : storePlayersInfo;
  const treasuryPool = live ? live.treasuryPool : storeTreasuryPool;
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

  const storeFps = useTelemetryStore((state) => state.metrics.fps);
  const toggleConsole = useTelemetryStore((state) => state.toggleConsole);
  const fps = isSSR ? Math.round(useTelemetryStore.getState().metrics.fps) : Math.round(storeFps);

  const timeOfDayIcon = timeOfDayMode === 'auto'
    ? '🌤️'
    : timeOfDayPhase === 'night'
    ? '🌙'
    : timeOfDayPhase === 'sunset'
    ? '🌅'
    : '☀️';

  const timeOfDayLabel = timeOfDayMode === 'auto'
    ? 'Ánh Sáng: Tự Động'
    : timeOfDayPhase === 'night'
    ? 'Đêm'
    : timeOfDayPhase === 'sunset'
    ? 'Hoàng Hôn'
    : 'Ngày';

  const currentTurnPlayer = currentTurnPlayerId ? playersInfo[currentTurnPlayerId] : undefined;
  const isBotTurn = Boolean(currentTurnPlayer?.isBot);
  const isLowTime = !isBotTurn && turnTimeRemaining <= 10;
  const timerColorClass = isBotTurn
    ? 'text-amber-700 font-semibold'
    : isLowTime
    ? 'text-rose-600 font-extrabold animate-pulse'
    : 'text-emerald-700 font-bold';

  const displayMaxRounds = roundNumber > maxRounds ? (roundNumber <= 40 ? 40 : roundNumber) : maxRounds;

  return (
    <header className="w-full max-w-full overflow-hidden flex justify-between items-center pointer-events-none px-0.5 min-[360px]:px-1 sm:px-4 pt-[calc(0.375rem+env(safe-area-inset-top))] sm:pt-3">
      {/* Cụm bên trái: Thông tin trận đấu */}
      <div
        data-testid="match-info-capsule"
        className="pointer-events-auto flex items-center gap-1 min-[360px]:gap-1 sm:gap-3 md:gap-4 bg-[#FFFDF8] border-2 border-slate-900 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-1 sm:py-2.5 shadow-[0_4px_0_0_#0f172a] text-slate-900 text-xs md:text-sm font-medium"
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

        {/* Đồng hồ đếm ngược */}
        <div className="flex items-center gap-1 sm:gap-2" role="timer" aria-live="polite">
          <span className="text-sm sm:text-base" aria-hidden="true">⏱️</span>
          <span className="hidden sm:inline text-xs text-slate-600 font-semibold">Thời gian:</span>
          <span className={`tabular-nums font-mono text-xs sm:text-base whitespace-nowrap ${timerColorClass}`}>
            {isBotTurn ? (
              <>
                <span className="sm:hidden" aria-hidden="true">🤖</span>
                <span className="hidden sm:inline">🤖 Đang tính...</span>
              </>
            ) : (
              formatTimeRemaining(turnTimeRemaining)
            )}
          </span>
        </div>

        <div className="h-4 w-px bg-slate-300" aria-hidden="true" />

        {/* Quỹ Kho Bạc */}
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-sm sm:text-base" aria-hidden="true">🏦</span>
          <span className="hidden sm:inline text-xs text-slate-600 font-semibold">Kho Bạc:</span>
          <span className="font-bold text-amber-700 whitespace-nowrap tabular-nums shrink-0 text-xs sm:text-sm">
            {formatCurrency(treasuryPool)}
          </span>
        </div>

        {/* Huy hiệu FPS di động */}
        <div className="h-4 w-px bg-slate-300 hidden min-[360px]:block sm:hidden" aria-hidden="true" />
        <button
          type="button"
          data-testid="mobile-fps-badge"
          onClick={() => toggleConsole()}
          className="hidden min-[360px]:inline-flex sm:hidden pointer-events-auto items-center gap-0.5 px-1 py-0.5 rounded-md bg-slate-900 text-emerald-400 font-mono text-[10px] font-bold border border-slate-700 shadow-2xs cursor-pointer select-none active:translate-y-px"
          title="Tốc độ khung hình (Bấm để mở hộp đen)"
          aria-label={`FPS: ${fps}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
          <span>{fps}<span className="hidden min-[400px]:inline"> FPS</span></span>
        </button>
      </div>

      {/* Cụm bên phải: Tiện ích HUD */}
      <div
        data-testid="hud-utilities-cluster"
        className="pointer-events-auto flex items-center gap-1 sm:gap-2 bg-[#FFFDF8] border-2 border-slate-900 rounded-xl sm:rounded-2xl p-1 sm:p-2 px-1 min-[360px]:px-1 sm:px-3.5 shadow-[0_4px_0_0_#0f172a]"
      >
        {/* Nút Chu kỳ Thời gian Ngày - Hoàng Hôn - Đêm */}
        <button
          type="button"
          onClick={toggleNextTimeOfDay}
          className="hidden min-[390px]:inline-flex sm:inline-flex w-9 h-9 min-h-[36px] min-w-[36px] sm:w-auto sm:min-h-[44px] sm:min-w-[44px] items-center justify-center gap-1.5 p-0 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#F7F2E7] hover:bg-amber-100 text-slate-900 transition-colors cursor-pointer text-xs font-semibold border border-slate-900 shadow-[0_2px_0_0_#0f172a] active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          title={`Thời gian: ${timeOfDayLabel} (Bấm để đổi)`}
          aria-label={`Chuyển chu kỳ thời gian (Hiện tại: ${timeOfDayLabel})`}
          data-testid="time-of-day-toggle-button"
        >
          <span className="text-sm" aria-hidden="true">{timeOfDayIcon}</span>
          <span className="hidden sm:inline">{timeOfDayLabel}</span>
        </button>

        {/* Nút Bật / Tắt âm thanh đạt chuẩn công thái học */}
        <button
          type="button"
          onClick={toggleMute}
          className="w-9 h-9 min-h-[36px] min-w-[36px] sm:w-auto sm:min-h-[44px] sm:min-w-[44px] inline-flex items-center justify-center gap-1.5 p-0 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#F7F2E7] hover:bg-amber-100 text-slate-900 transition-colors cursor-pointer text-xs font-semibold border border-slate-900 shadow-[0_2px_0_0_#0f172a] active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          aria-label={isMuted ? 'Bật âm thanh trò chơi' : 'Tắt âm thanh trò chơi'}
          data-testid="mute-toggle-button"
        >
          <span className="text-sm" aria-hidden="true">{isMuted ? '🔇' : '🔊'}</span>
          <span className="hidden sm:inline">{isMuted ? 'Tắt' : 'Bật'}</span>
        </button>

        {/* Nút Bật / Tắt Nhật Ký Hành Động */}
        <button
          type="button"
          onClick={toggleActivityFeed}
          className="relative w-9 h-9 min-h-[36px] min-w-[36px] sm:w-auto sm:min-h-[44px] sm:min-w-[44px] inline-flex items-center justify-center gap-1.5 p-0 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#F7F2E7] hover:bg-amber-100 text-slate-900 transition-colors cursor-pointer text-xs font-semibold border border-slate-900 shadow-[0_2px_0_0_#0f172a] active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          title={isActivityFeedOpen ? 'Đóng nhật ký' : 'Mở nhật ký hoạt động'}
          aria-label={`Nhật ký hoạt động${unreadCount > 0 ? ` (${unreadCount} mới)` : ''}`}
          data-testid="activity-feed-toggle-button"
        >
          <span className="text-sm" aria-hidden="true">📜</span>
          <span className="hidden sm:inline">Nhật Ký</span>
          {unreadCount > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-md border border-slate-900"
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
              className="w-9 h-9 min-h-[44px] min-w-[44px] sm:w-auto inline-flex items-center justify-center gap-1.5 p-0 sm:px-3.5 sm:py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 transition-colors cursor-pointer text-xs font-bold border border-rose-400 shadow-[0_2px_0_0_#9f1239] active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
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
    </header>
  );
}
