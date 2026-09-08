// [UC-GAME-004/MSS][UC-GAME-006/A1][UC-GAME-006/A2] Session Manager

const HEARTBEAT_INTERVAL_MS = 5_000;
const GRACE_PERIOD_MS       = 60_000;

export enum SessionState {
  Connected    = 'Connected',
  GracePeriod  = 'GracePeriod',
  Disconnected = 'Disconnected',
}

export interface Session {
  readonly id: string;
  state:       SessionState;
  lastPongAt:  number;
}

export interface CellDelta {
  readonly index:    number;
  readonly ownerId?:  string | null;
  readonly level?:   number;
  readonly isETC?:   boolean;
}

export interface PlayerDelta {
  readonly id:       string;
  readonly position: number;
  readonly balance:  number;
}

export interface DeltaPayload {
  readonly tick:     number;
  readonly cells:    ReadonlyArray<CellDelta>;
  readonly players?:  ReadonlyArray<PlayerDelta>;
}

export function buildDeltaPayload(options: {
  tick: number;
  cells: ReadonlyArray<CellDelta>;
  players?: ReadonlyArray<PlayerDelta>;
}): DeltaPayload;
export function buildDeltaPayload(
  tick: number,
  cells?: ReadonlyArray<CellDelta>,
  players?: ReadonlyArray<PlayerDelta>,
): DeltaPayload;
export function buildDeltaPayload(
  tickOrOptions: number | { tick: number; cells: ReadonlyArray<CellDelta>; players?: ReadonlyArray<PlayerDelta> },
  cells?: ReadonlyArray<CellDelta>,
  players?: ReadonlyArray<PlayerDelta>,
): DeltaPayload {
  if (typeof tickOrOptions === 'object') {
    return {
      tick: tickOrOptions.tick,
      cells: tickOrOptions.cells.map((c) => ({ ...c })),
      ...(tickOrOptions.players !== undefined ? { players: tickOrOptions.players.map((p) => ({ ...p })) } : {}),
    };
  }
  return {
    tick: tickOrOptions,
    cells: (cells ?? []).map((c) => ({ ...c })),
    ...(players !== undefined ? { players: players.map((p) => ({ ...p })) } : {}),
  };
}


export class SessionManager {
  private readonly sessions = new Map<string, Session>();
  private lastDelta: DeltaPayload | undefined = undefined;

  addSession(id: string): Session {
    const session: Session = {
      id,
      state:      SessionState.Connected,
      lastPongAt: Date.now(),
    };
    this.sessions.set(id, session);
    return session;
  }

  removeSession(id: string): void {
    this.sessions.delete(id);
  }

  handlePong(id: string): void {
    const session = this.sessions.get(id);
    if (session === undefined) return;
    session.state      = SessionState.Connected;
    session.lastPongAt = Date.now();
  }

  checkHeartbeats(): void {
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      const elapsed = now - session.lastPongAt;
      if (elapsed > GRACE_PERIOD_MS) {
        session.state = SessionState.Disconnected;
        this.sessions.delete(id);
      } else if (elapsed > HEARTBEAT_INTERVAL_MS) {
        session.state = SessionState.GracePeriod;
      }
    }
  }

  getSession(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  broadcastDelta(payload: DeltaPayload): void {
    this.lastDelta = {
      tick: payload.tick,
      cells: payload.cells.map((c) => ({ ...c })),
      ...(payload.players !== undefined
        ? { players: payload.players.map((p) => ({ ...p })) }
        : {}),
    };
  }

  getLastDelta(): DeltaPayload | undefined {
    return this.lastDelta;
  }
}
