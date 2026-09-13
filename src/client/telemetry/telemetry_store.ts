// [IMP-24/MSS] Telemetry & Flight Recorder Zustand Store
import { create } from 'zustand';
import type {
  TelemetryMetric,
  AuditLogEntry,
  InvariantViolation,
  ForensicSnapshot,
  RecordedIntent,
  FlightRecorderDump,
} from './telemetry_types.js';

export const MAX_AUDIT_ENTRIES = 100;
export const MAX_SNAPSHOT_ENTRIES = 20;
export const MAX_RECORDED_INTENTS = 100;

export type TelemetryConsoleTab = 'perf' | 'audit' | 'invariants' | 'trace';

export interface TelemetryState {
  readonly metrics: TelemetryMetric;
  readonly auditLogs: readonly AuditLogEntry[];
  readonly snapshots: readonly ForensicSnapshot[];
  readonly violations: readonly InvariantViolation[];
  readonly recordedIntents: readonly RecordedIntent[];
  readonly autoFreezeEnabled: boolean;
  readonly isFrozen: boolean;
  readonly isConsoleOpen: boolean;
  readonly activeTab: TelemetryConsoleTab;
  readonly roomCode: string;
  readonly seed: number;

  updateMetrics: (partial: Partial<TelemetryMetric>) => void;
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: number }) => void;
  addSnapshot: (snapshot: ForensicSnapshot) => void;
  recordIntent: (playerId: string, intent: unknown) => void;
  reportViolation: (violation: Omit<InvariantViolation, 'id' | 'timestamp'> & { id?: string; timestamp?: number }) => void;
  clearViolations: () => void;
  setAutoFreezeEnabled: (enabled: boolean) => void;
  setIsFrozen: (frozen: boolean) => void;
  toggleConsole: (force?: boolean) => void;
  setActiveTab: (tab: TelemetryConsoleTab) => void;
  setSessionMetadata: (meta: { roomCode?: string; seed?: number }) => void;
  exportFlightRecorderDump: () => FlightRecorderDump;
  reset: () => void;
}

const DEFAULT_METRICS: TelemetryMetric = {
  fps: 60,
  frameTimeMs: 16.6,
  drawCalls: 0,
  triangles: 0,
  pingRttMs: 14,
  deltaBytes: 0,
  tickRate: 0,
};

export const useTelemetryStore = create<TelemetryState>((set, get) => ({
  metrics: DEFAULT_METRICS,
  auditLogs: [],
  snapshots: [],
  violations: [],
  recordedIntents: [],
  autoFreezeEnabled: false,
  isFrozen: false,
  isConsoleOpen: false,
  activeTab: 'perf',
  roomCode: 'VTCOON',
  seed: 12345,

  updateMetrics: (partial) => {
    set((state) => ({
      metrics: { ...state.metrics, ...partial },
    }));
  },

  addAuditLog: (entry) => {
    const fullEntry: AuditLogEntry = {
      id: entry.id ?? `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: entry.timestamp ?? Date.now(),
      tick: entry.tick,
      source: entry.source,
      action: entry.action,
      payloadSummary: entry.payloadSummary,
      deltaBytes: entry.deltaBytes,
    };
    set((state) => ({
      auditLogs: [fullEntry, ...state.auditLogs.slice(0, MAX_AUDIT_ENTRIES - 1)],
    }));
  },

  addSnapshot: (snapshot) => {
    set((state) => ({
      snapshots: [snapshot, ...state.snapshots.slice(0, MAX_SNAPSHOT_ENTRIES - 1)],
    }));
  },

  recordIntent: (playerId, intent) => {
    const record: RecordedIntent = {
      playerId,
      intent,
      timestamp: Date.now(),
    };
    set((state) => ({
      recordedIntents: [...state.recordedIntents.slice(-(MAX_RECORDED_INTENTS - 1)), record],
    }));
  },

  reportViolation: (violation) => {
    const fullViolation: InvariantViolation = {
      id: violation.id ?? `viol_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: violation.timestamp ?? Date.now(),
      tick: violation.tick,
      type: violation.type,
      severity: violation.severity,
      message: violation.message,
      details: violation.details,
    };
    set((state) => {
      const shouldFreeze = state.autoFreezeEnabled && fullViolation.severity === 'CRITICAL';
      return {
        violations: [fullViolation, ...state.violations],
        isFrozen: shouldFreeze ? true : state.isFrozen,
      };
    });
  },

  clearViolations: () => {
    set({ violations: [], isFrozen: false });
  },

  setAutoFreezeEnabled: (enabled) => {
    set({ autoFreezeEnabled: enabled });
  },

  setIsFrozen: (frozen) => {
    set({ isFrozen: frozen });
  },

  toggleConsole: (force) => {
    set((state) => ({
      isConsoleOpen: force !== undefined ? force : !state.isConsoleOpen,
    }));
  },

  setActiveTab: (activeTab) => {
    set({ activeTab });
  },

  setSessionMetadata: (meta) => {
    set((state) => ({
      roomCode: meta.roomCode ?? state.roomCode,
      seed: meta.seed ?? state.seed,
    }));
  },

  exportFlightRecorderDump: () => {
    const state = get();
    return {
      exportedAt: Date.now(),
      roomCode: state.roomCode,
      seed: state.seed,
      metrics: state.metrics,
      violations: state.violations,
      snapshots: state.snapshots,
      auditLogs: state.auditLogs,
      recordedIntents: state.recordedIntents,
    };
  },

  reset: () => {
    set({
      metrics: DEFAULT_METRICS,
      auditLogs: [],
      snapshots: [],
      violations: [],
      recordedIntents: [],
      isFrozen: false,
    });
  },
}));
