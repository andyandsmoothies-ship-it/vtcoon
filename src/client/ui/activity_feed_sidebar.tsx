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

  const listEndRef = useRef<HTMLDivElement>(null);

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
    if (isActivityFeedOpen && listEndRef.current) {
      listEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isActivityFeedOpen, filteredLogs.length]);

  return (
    <aside
      aria-label="Nhật ký ván đấu"
      aria-hidden={!isActivityFeedOpen}
      className={`fixed top-0 right-0 h-full w-80 md:w-96 z-30 bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/80 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
        isActivityFeedOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
      } ${className}`}
      data-testid="activity-feed-sidebar"
    >
      {/* 1. Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/80 bg-slate-900/90">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">📜</span>
          <h2 className="text-sm font-bold tracking-wider text-slate-100 uppercase">
            Nhật Ký Ván Đấu
          </h2>
          <span
            className="px-2 py-0.5 text-xs font-mono rounded-full bg-slate-800 text-amber-300 border border-slate-700"
            data-testid="activity-count"
          >
            {filteredLogs.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition-colors border border-slate-700 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          aria-label="Đóng nhật ký"
          data-testid="close-activity-feed"
        >
          ✕
        </button>
      </div>

      {/* 2. Filter Chips */}
      <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-800/80 bg-slate-950/40">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-medium transition-colors border cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border-slate-700/40'
          }`}
          data-testid="filter-all"
        >
          Tất Cả
        </button>
        <button
          type="button"
          onClick={() => setFilter('money')}
          className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-medium transition-colors border cursor-pointer ${
            activeFilter === 'money'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border-slate-700/40'
          }`}
          data-testid="filter-money"
        >
          Giao Dịch
        </button>
        <button
          type="button"
          onClick={() => setFilter('property')}
          className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-medium transition-colors border cursor-pointer ${
            activeFilter === 'property'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border-slate-700/40'
          }`}
          data-testid="filter-property"
        >
          Nhà Đất
        </button>
      </div>

      {/* 3. Danh sách nhật ký */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2" data-testid="activity-log-list">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-xs text-center px-4">
            <span className="text-2xl mb-2" aria-hidden="true">📭</span>
            <span>Chưa có hoạt động nào được ghi nhận.</span>
          </div>
        ) : (
          filteredLogs.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/80 transition-colors"
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
                  <span className="text-[11px] font-mono text-slate-400">
                    {formatLogTime(entry.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-snug break-words">
                  {entry.message}
                </p>
                {entry.amount !== undefined && (
                  <div className="mt-1 flex justify-end">
                    <span
                      className={`text-xs font-mono font-semibold ${
                        entry.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
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
        <div ref={listEndRef} />
      </div>

      {/* 4. Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/30 flex items-center justify-between">
        <span className="text-[11px] text-slate-500">Tối đa 50 sự kiện gần nhất</span>
        <button
          type="button"
          onClick={clearLogs}
          className="min-h-[36px] px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-800 cursor-pointer"
          data-testid="clear-activity-logs"
        >
          Xóa nhật ký
        </button>
      </div>
    </aside>
  );
}
