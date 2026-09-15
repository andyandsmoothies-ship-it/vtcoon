// [UI-S03/MSS][UI-S05/MSS] TopBar Component — Round info, turn timer, treasury pool & audio toggle
import React from 'react';
import { useGameStore } from '../store/game_store';
import { useAudioStore } from '../store/audio_store';
import { useEnvironmentStore } from '../store/environment_store';
import { useActivityStore } from '../store/activity_store';
import { formatCurrency, formatTimeRemaining } from './ui_helpers';

export interface TopBarProps {
  readonly onLeaveRoom?: () => void;
  readonly unreadCount?: number;
  readonly isActivityFeedOpen?: boolean;
  readonly onToggleActivityFeed?: () => void;
}

export function TopBar(props: TopBarProps): React.ReactElement {
  const { onLeaveRoom } = props;
  const roundNumber = useGameStore((state) => state.roundNumber);
  const maxRounds = useGameStore((state) => state.maxRounds);
  const turnTimeRemaining = useGameStore((state) => state.turnTimeRemaining);
  const treasuryPool = useGameStore((state) => state.treasuryPool);
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

  const isLowTime = turnTimeRemaining <= 10;
  const timerColorClass = isLowTime
    ? 'text-rose-600 font-extrabold animate-pulse'
    : 'text-emerald-700 font-bold';

  return (
    <header className="w-full flex justify-center items-center pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-6 bg-[#FFFDF8] border-2 border-slate-900 rounded-2xl px-6 py-2.5 shadow-[0_4px_0_0_#0f172a] text-slate-900 text-sm md:text-base font-medium">
        {/* Vòng đấu */}
        <div className="flex items-center gap-2">
          <span className="text-slate-600 text-xs uppercase tracking-wider font-bold">Vòng</span>
          <span className="font-bold text-amber-700">
            {roundNumber}
            <span className="text-slate-500 text-xs font-normal">/{maxRounds}</span>
          </span>
        </div>

        <div className="h-4 w-px bg-slate-300" aria-hidden="true" />

        {/* Đồng hồ đếm ngược */}
        <div className="flex items-center gap-2" role="timer" aria-live="polite">
          <span className="text-base" aria-hidden="true">⏱️</span>
          <span className="text-xs text-slate-600 font-semibold">Thời gian:</span>
          <span className={`tabular-nums font-mono text-base ${timerColorClass}`}>
            {formatTimeRemaining(turnTimeRemaining)}
          </span>
        </div>

        <div className="h-4 w-px bg-slate-300" aria-hidden="true" />

        {/* Quỹ Kho Bạc */}
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden="true">🏦</span>
          <span className="text-xs text-slate-600 font-semibold">Kho Bạc:</span>
          <span className="font-bold text-amber-700">
            {formatCurrency(treasuryPool)}
          </span>
        </div>

        <div className="h-4 w-px bg-slate-300" aria-hidden="true" />

        {/* Nút Chu kỳ Thời gian Ngày - Hoàng Hôn - Đêm */}
        <button
          type="button"
          onClick={toggleNextTimeOfDay}
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#F7F2E7] hover:bg-amber-100 text-slate-900 transition-colors cursor-pointer text-xs font-semibold border border-slate-900 shadow-[0_2px_0_0_#0f172a] active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          title={`Thời gian: ${timeOfDayLabel} (Bấm để đổi)`}
          aria-label={`Chuyển chu kỳ thời gian (Hiện tại: ${timeOfDayLabel})`}
          data-testid="time-of-day-toggle-button"
        >
          <span className="text-sm" aria-hidden="true">{timeOfDayIcon}</span>
          <span className="hidden sm:inline">{timeOfDayLabel}</span>
        </button>

        {/* Nút Bật / Tắt âm thanh đạt chuẩn công thái học >= 44px */}
        <button
          type="button"
          onClick={toggleMute}
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#F7F2E7] hover:bg-amber-100 text-slate-900 transition-colors cursor-pointer text-xs font-semibold border border-slate-900 shadow-[0_2px_0_0_#0f172a] active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
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
          className="relative min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#F7F2E7] hover:bg-amber-100 text-slate-900 transition-colors cursor-pointer text-xs font-semibold border border-slate-900 shadow-[0_2px_0_0_#0f172a] active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
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
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 transition-colors cursor-pointer text-xs font-bold border border-rose-400 shadow-[0_2px_0_0_#9f1239] active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
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
