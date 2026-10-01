import { buildDeltaPayload, type DeltaPayload } from './delta_mapper.js';
export * from './delta_mapper.js';

export const HEARTBEAT_INTERVAL_MS = 5_000;
export const GRACE_PERIOD_MS       = 60_000;

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

export class SessionManager {
  private readonly sessions = new Map<string, Session>();
  private lastDelta: DeltaPayload | undefined = undefined;

  addSession(id: string): Session {
    const session: Session = { id, state: SessionState.Connected, lastPongAt: Date.now() };
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
    this.lastDelta = buildDeltaPayload(payload);
  }

  getLastDelta(): DeltaPayload | undefined { return this.lastDelta; }
}
