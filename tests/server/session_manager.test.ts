import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SessionManager, SessionState } from '../../src/server/session_manager';

describe('SessionManager — Heartbeat & Grace Period', () => {
  let manager: SessionManager;

  beforeEach(() => {
    vi.useFakeTimers();
    manager = new SessionManager();
  });

  it('[TC-00.1/MSS] [UC-GAME-004/MSS] them phien → trang thai Connected', () => {
    const session = manager.addSession('player-1');
    expect(session.state).toBe(SessionState.Connected);
  });

  it('[TC-00.3/A1] [UC-GAME-006/A1] qua 5s khong pong → chuyen GracePeriod', () => {
    manager.addSession('player-1');
    vi.advanceTimersByTime(6_000);
    manager.checkHeartbeats();
    expect(manager.getSession('player-1')?.state).toBe(SessionState.GracePeriod);
  });

  it('[TC-00.4/A2] [UC-GAME-006/A2] qua 60s khong pong → chuyen Disconnected', () => {
    manager.addSession('player-1');
    vi.advanceTimersByTime(61_000);
    manager.checkHeartbeats();
    expect(manager.getSession('player-1')).toBeUndefined();
  });

  it('[TC-00.1/MSS] [UC-GAME-004/MSS] nhan pong trong an han → phuc hoi Connected', () => {
    manager.addSession('player-1');
    vi.advanceTimersByTime(6_000);
    manager.checkHeartbeats();
    manager.handlePong('player-1');
    expect(manager.getSession('player-1')?.state).toBe(SessionState.Connected);
  });

  it('[TC-00.4/A2] [UC-GAME-006/A2] qua 60s → state Disconnected truoc khi xoa phien', () => {
    const session = manager.addSession('player-1');
    vi.advanceTimersByTime(61_000);
    manager.checkHeartbeats();
    expect(session.state).toBe(SessionState.Disconnected);
    expect(manager.getSession('player-1')).toBeUndefined();
  });
});
