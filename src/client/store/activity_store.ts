// [UI-S06/MSS] ActivityStore — Real-time turn-by-turn game activity feed
import { create } from 'zustand';

export type ActivityLogType =
  | 'dice'
  | 'move'
  | 'buy'
  | 'upgrade'
  | 'rent'
  | 'tax'
  | 'card'
  | 'auction'
  | 'mortgage'
  | 'bankrupt'
  | 'system';

export type ActivityFilterType = 'all' | 'money' | 'property';

export interface ActivityLogEntry {
  readonly id: string;
  readonly timestamp: number;
  readonly type: ActivityLogType;
  readonly message: string;
  readonly playerId?: string;
  readonly playerName?: string;
  readonly playerTokenColor?: string;
  readonly amount?: number;
  readonly cellIndex?: number;
}

export interface ActivityStoreState {
  readonly activityLogs: readonly ActivityLogEntry[];
  readonly isActivityFeedOpen: boolean;
  readonly unreadCount: number;
  readonly activeFilter: ActivityFilterType;

  addActivityLog: (entry: Omit<ActivityLogEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: number }) => void;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  setFilter: (filter: ActivityFilterType) => void;
  clearLogs: () => void;
}

export const MAX_ACTIVITY_LOGS = 50;

export const useActivityStore = create<ActivityStoreState>((set) => ({
  activityLogs: [],
  isActivityFeedOpen: false,
  unreadCount: 0,
  activeFilter: 'all',

  addActivityLog: (entryInput) => {
    const entry: ActivityLogEntry = {
      id: entryInput.id ?? `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: entryInput.timestamp ?? Date.now(),
      type: entryInput.type,
      message: entryInput.message,
      ...(entryInput.playerId ? { playerId: entryInput.playerId } : {}),
      ...(entryInput.playerName ? { playerName: entryInput.playerName } : {}),
      ...(entryInput.playerTokenColor ? { playerTokenColor: entryInput.playerTokenColor } : {}),
      ...(entryInput.amount !== undefined ? { amount: entryInput.amount } : {}),
      ...(entryInput.cellIndex !== undefined ? { cellIndex: entryInput.cellIndex } : {}),
    };

    set((state) => {
      const nextLogs = [...state.activityLogs, entry];
      const trimmedLogs =
        nextLogs.length > MAX_ACTIVITY_LOGS
          ? nextLogs.slice(nextLogs.length - MAX_ACTIVITY_LOGS)
          : nextLogs;
      return {
        activityLogs: trimmedLogs,
        unreadCount: state.isActivityFeedOpen ? 0 : state.unreadCount + 1,
      };
    });
  },

  toggleOpen: () => {
    set((state) => {
      const nextOpen = !state.isActivityFeedOpen;
      return {
        isActivityFeedOpen: nextOpen,
        unreadCount: nextOpen ? 0 : state.unreadCount,
      };
    });
  },

  setOpen: (open: boolean) => {
    set((state) => ({
      isActivityFeedOpen: open,
      unreadCount: open ? 0 : state.unreadCount,
    }));
  },

  setFilter: (filter: ActivityFilterType) => {
    set({ activeFilter: filter });
  },

  clearLogs: () => {
    set({ activityLogs: [], unreadCount: 0 });
  },
}));

declare global {
  interface Window {
    __activityStore?: typeof useActivityStore;
  }
}

if (typeof window !== 'undefined') {
  window.__activityStore = useActivityStore;
}
