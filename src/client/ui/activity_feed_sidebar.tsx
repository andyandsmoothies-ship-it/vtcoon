// [UI-S06/MSS] ActivityFeedSidebar — Real-time turn-by-turn game activity feed drawer
import React, { useMemo, useEffect, useRef } from 'react';
import {
  useActivityStore,
  type ActivityLogType,
  type ActivityLogEntry,
  type ActivityFilterType,
} from '../store/activity_store';
import { formatCurrency } from './ui_helpers';

export function getActivityIcon(type: ActivityLogType): string {
  switch (type) {
    case 'dice':
      return '🎲';
    case 'move':
      return '🚶';
    case 'buy':
      return '🏠';
    case 'upgrade':
      return '🏗️';
    case 'rent':
      return '💸';
    case 'tax':
      return '🏛️';
    case 'card':
      return '🎴';
    case 'auction':
      return '🔨';
    case 'mortgage':
      return '📄';
    case 'bankrupt':
      return '🚨';
    case 'system':
    default:
      return '⚙️';
  }
}

export function formatLogTime(timestamp: number): string {
  const d = new Date(timestamp);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export interface ActivityFeedSidebarProps {
  readonly className?: string;
  readonly isOpen?: boolean;
  readonly logs?: readonly ActivityLogEntry[];
  readonly filter?: ActivityFilterType;
  readonly onSetOpen?: (open: boolean) => void;
  readonly onSetFilter?: (filter: ActivityFilterType) => void;
  readonly onClearLogs?: () => void;
}

export function shouldShowScrollBottom(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
): boolean {
  return scrollHeight - (scrollTop + clientHeight) > 60;
}

export function handleActivityFeedKeyDown(
  event: { key: string },
  setOpen: (open: boolean) => void,
): boolean {
  if (event.key === 'Escape') {
    setOpen(false);
    return true;
  }
  return false;
}

export function ActivityFeedSidebar(props: ActivityFeedSidebarProps): React.ReactElement {
  const { className = '' } = props;
  const storeIsOpen = useActivityStore((state) => state.isActivityFeedOpen);
  const storeLogs = useActivityStore((state) => state.activityLogs);
  const storeFilter = useActivityStore((state) => state.activeFilter);
  const storeSetOpen = useActivityStore((state) => state.setOpen);
  const storeSetFilter = useActivityStore((state) => state.setFilter);
  const storeClearLogs = useActivityStore((state) => state.clearLogs);

  const isActivityFeedOpen = props.isOpen ?? storeIsOpen;
  const activityLogs = props.logs ?? storeLogs;
  const activeFilter = props.filter ?? storeFilter;
  const setOpen = props.onSetOpen ?? storeSetOpen;
  const setFilter = props.onSetFilter ?? storeSetFilter;
  const clearLogs = props.onClearLogs ?? storeClearLogs;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);
  const [isScrolledUp, setIsScrolledUp] = React.useState(false);

  const scrollToBottom = React.useCallback((smooth = true) => {
    if (scrollContainerRef.current) {
      if (typeof scrollContainerRef.current.scrollTo === 'function') {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto',
        });
      } else {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    } else if (listEndRef.current?.scrollIntoView) {
      listEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  }, []);

  const handleScroll = React.useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    setIsScrolledUp(shouldShowScrollBottom(scrollTop, scrollHeight, clientHeight));
  }, []);

  const filteredLogs = useMemo<readonly ActivityLogEntry[]>(() => {
    if (activeFilter === 'money') {
      return activityLogs.filter(
        (log) =>
          log.type === 'rent' ||
          log.type === 'tax' ||
          log.type === 'buy' ||
          log.type === 'auction' ||
          log.amount !== undefined,
      );
    }
    if (activeFilter === 'property') {
      return activityLogs.filter(
        (log) =>
          log.type === 'buy' ||
          log.type === 'upgrade' ||
          log.type === 'mortgage' ||
          log.cellIndex !== undefined,
      );
    }
    return activityLogs;
  }, [activityLogs, activeFilter]);

  useEffect(() => {
    if (!isActivityFeedOpen || typeof window === 'undefined') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      handleActivityFeedKeyDown(e, setOpen);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActivityFeedOpen, setOpen]);

  useEffect(() => {
    if (isActivityFeedOpen) {
      const timer = setTimeout(() => {
        if (!isScrolledUp) {
          scrollToBottom(false);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isActivityFeedOpen, filteredLogs.length, isScrolledUp, scrollToBottom]);

  return (
    <>
      {isActivityFeedOpen && (
        <div
          data-testid="activity-feed-backdrop"
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-20 md:hidden pointer-events-auto"
          aria-hidden="true"
        />
      )}
      <aside
        aria-label="Nhật ký ván đấu"
        aria-hidden={!isActivityFeedOpen}
        className={`fixed top-0 right-0 h-full w-80 md:w-96 z-30 bg-[#FBF7EE] border-l-2 border-slate-900 shadow-2xl flex flex-col transition-transform duration-300 ease-out text-slate-900 select-none ${
          isActivityFeedOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
        } ${className}`}
        data-testid="activity-feed-sidebar"
      >
      {/* 1. Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-amber-200 bg-[#F7F2E7]">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">📜</span>
          <h2 className="text-sm font-black tracking-wider text-slate-900 uppercase">
            Nhật Ký Ván Đấu
          </h2>
          <span
            className="px-2 py-0.5 text-xs font-mono rounded-full bg-white text-slate-900 font-bold border border-slate-300 shadow-sm"
            data-testid="activity-count"
          >
            {filteredLogs.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors border border-slate-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          aria-label="Đóng nhật ký"
          data-testid="close-activity-feed"
        >
          ✕
        </button>
      </div>

      {/* 2. Filter Chips */}
      <div className="flex items-center gap-1.5 px-4 py-2 border-b border-amber-200 bg-[#FBF7EE]">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors border cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-amber-500 text-slate-900 border-amber-600 shadow-sm'
              : 'bg-white text-slate-700 hover:text-slate-900 border-slate-300'
          }`}
          data-testid="filter-all"
        >
          Tất Cả
        </button>
        <button
          type="button"
          onClick={() => setFilter('money')}
          className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors border cursor-pointer ${
            activeFilter === 'money'
              ? 'bg-amber-500 text-slate-900 border-amber-600 shadow-sm'
              : 'bg-white text-slate-700 hover:text-slate-900 border-slate-300'
          }`}
          data-testid="filter-money"
        >
          Giao Dịch
        </button>
        <button
          type="button"
          onClick={() => setFilter('property')}
          className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors border cursor-pointer ${
            activeFilter === 'property'
              ? 'bg-amber-500 text-slate-900 border-amber-600 shadow-sm'
              : 'bg-white text-slate-700 hover:text-slate-900 border-slate-300'
          }`}
          data-testid="filter-property"
        >
          Nhà Đất
        </button>
      </div>

      {/* 3. Danh sách nhật ký */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 space-y-2 relative"
        data-testid="activity-log-list"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-600 text-xs text-center px-4 font-medium">
            <span className="text-2xl mb-2" aria-hidden="true">📭</span>
            <span>Chưa có hoạt động nào được ghi nhận.</span>
          </div>
        ) : (
          filteredLogs.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-amber-200/80 hover:border-amber-400 transition-colors shadow-sm"
              data-testid={`activity-entry-${entry.id}`}
            >
              <div
                className="w-1.5 self-stretch rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.playerTokenColor ?? '#38BDF8' }}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-sm flex-shrink-0" aria-hidden="true">
                    {getActivityIcon(entry.type)}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">
                    {formatLogTime(entry.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-slate-900 leading-snug break-words font-medium">
                  {entry.message}
                </p>
                {entry.amount !== undefined && (
                  <div className="mt-1 flex justify-end">
                    <span
                      className={`text-xs font-mono font-bold ${
                        entry.amount > 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                      data-testid={`activity-amount-${entry.id}`}
                    >
                      {entry.amount > 0 ? `+${formatCurrency(entry.amount)}` : formatCurrency(entry.amount)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={listEndRef} data-testid="activity-log-bottom-anchor" />
      </div>

      {/* Nút nổi cuộn xuống dòng mới nhất khi người dùng cuộn xem lịch sử */}
      {isScrolledUp && (
        <div className="absolute bottom-16 right-4 z-20">
          <button
            type="button"
            onClick={() => {
              scrollToBottom(true);
              setIsScrolledUp(false);
            }}
            className="px-3 py-1.5 rounded-full bg-amber-400 text-slate-900 font-bold text-xs shadow-lg border-2 border-slate-900 flex items-center gap-1.5 hover:bg-amber-300 transition-transform active:scale-95 cursor-pointer"
            data-testid="scroll-to-bottom-btn"
            aria-label="Cuộn xuống dòng mới nhất"
          >
            <span aria-hidden="true">⬇</span>
            <span>Dòng mới nhất</span>
          </button>
        </div>
      )}

      {/* 4. Footer */}
      <div className="p-3 border-t border-amber-200 bg-[#F7F2E7] flex items-center justify-between">
        <span className="text-[11px] text-slate-600 font-medium">Tối đa 50 sự kiện gần nhất</span>
        <button
          type="button"
          onClick={clearLogs}
          className="min-h-[36px] px-3.5 py-1.5 text-xs text-slate-700 hover:text-slate-900 font-bold transition-colors rounded-lg bg-white hover:bg-slate-100 border border-slate-300 cursor-pointer shadow-sm"
          data-testid="clear-activity-logs"
        >
          Xóa nhật ký
        </button>
      </div>
    </aside>
  </>
  );
}
