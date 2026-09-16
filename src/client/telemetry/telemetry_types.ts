// [IMP-24/MSS] Telemetry & Flight Recorder Type Definitions

export interface TelemetryMetric {
  readonly fps: number;
  readonly frameTimeMs: number;
  readonly drawCalls: number;
  readonly triangles: number;
  readonly pingRttMs: number;
  readonly deltaBytes: number;
  readonly tickRate: number;
}

type AuditLogSource = 'SERVER' | 'PLAYER' | 'BOT' | 'SYSTEM';

export interface AuditLogEntry {
  readonly id: string;
  readonly timestamp: number;
  readonly tick: number;
  readonly source: AuditLogSource;
  readonly action: string;
  readonly payloadSummary: string;
  readonly deltaBytes?: number;
}

type InvariantViolationType =
  | 'TREASURY_INVARIANT_VIOLATED'
  | 'INVALID_POSITION_STEP'
  | 'NEGATIVE_BALANCE_OUTSIDE_INSOLVENCY'
  | 'PROPERTY_OWNERSHIP_CORRUPTED'
  | 'TURN_STALLED'
  | 'BOT_INFINITE_LOOP'
  | 'FSM_ANIMATION_STALLED';

type InvariantSeverity = 'WARNING' | 'CRITICAL';

export interface InvariantViolation {
  readonly id: string;
  readonly timestamp: number;
  readonly tick: number;
  readonly type: InvariantViolationType;
  readonly severity: InvariantSeverity;
  readonly message: string;
  readonly details: Record<string, unknown>;
}

export interface ForensicSnapshot {
  readonly tick: number;
  readonly timestamp: number;
  readonly preStateSummary: Record<string, unknown>;
  readonly postStateSummary: Record<string, unknown>;
  readonly triggerDelta?: unknown;
}

export interface RecordedIntent {
  readonly playerId: string;
  readonly intent: unknown;
  readonly timestamp: number;
}

export interface FlightRecorderDump {
  readonly exportedAt: number;
  readonly roomCode: string;
  readonly seed: number;
  readonly metrics: TelemetryMetric;
  readonly violations: readonly InvariantViolation[];
  readonly snapshots: readonly ForensicSnapshot[];
  readonly auditLogs: readonly AuditLogEntry[];
  readonly recordedIntents: readonly RecordedIntent[];
}
