import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  SessionManager,
  SessionState,
} from '../../src/server/session_manager';
import type { DeltaPayload } from '../../src/server/session_manager';
import { BOARD_CONFIG } from '../../src/domain/board_config';
import { cellPosition } from '../../src/client/game_canvas';

describe('Walking Skeleton - 4 Hop Dong Kiem Thu Tich Hop', () => {
  let manager: SessionManager;

  beforeEach(() => {
    vi.useFakeTimers();
    manager = new SessionManager();
  });

  it('[TC-00.1/MSS] [UC-GAME-004/MSS] Client ket noi -> Server chap thuan, heartbeat 5s duy tri', () => {
    const session = manager.addSession('player-1');
    expect(session.state).toBe(SessionState.Connected);
    for (let i = 0; i < 3; i++) {
      vi.advanceTimersByTime(4_000);
      manager.handlePong('player-1');
      manager.checkHeartbeats();
      expect(manager.getSession('player-1')?.state).toBe(SessionState.Connected);
    }
  });

  it('[TC-00.2/MSS] [UC-GAME-009/MSS] Server phat delta -> Client nhan dung trang thai', () => {
    manager.addSession('player-1');
    const delta: DeltaPayload = {
      tick: 1,
      cells: BOARD_CONFIG.map((cell) => ({
        index: cell.index,
        ownerId: null,
      })),
    };
    manager.broadcastDelta(delta);
    const received = manager.getLastDelta();
    expect(received?.tick).toBe(1);
    expect(received?.cells).toHaveLength(40);
    const sizeBytes = new TextEncoder().encode(JSON.stringify(received)).length;
    expect(sizeBytes).toBeLessThan(10_240);
  });

  it('[TC-00.3/A1] [UC-GAME-006/A1] Gan doan mang -> An han 60s, giu trang thai', () => {
    manager.addSession('player-1');
    vi.advanceTimersByTime(6_000);
    manager.checkHeartbeats();
    expect(manager.getSession('player-1')?.state).toBe(SessionState.GracePeriod);
    expect(manager.getSession('player-1')).toBeDefined();
  });

  it('[TC-00.4/A2] [UC-GAME-006/A2] Qua 60s -> Mat ket noi vinh vien, giai phong tai nguyen', () => {
    manager.addSession('player-1');
    vi.advanceTimersByTime(61_000);
    manager.checkHeartbeats();
    expect(manager.getSession('player-1')).toBeUndefined();
  });

  it('[TC-00.2/MSS] [UC-GAME-009/MSS] cellPosition tich hop voi BOARD_CONFIG -> 40 vi tri hop le', () => {
    for (const cell of BOARD_CONFIG) {
      const pos = cellPosition(cell.index);
      expect(pos).toHaveLength(3);
      expect(Number.isFinite(pos[0])).toBe(true);
      expect(Number.isFinite(pos[2])).toBe(true);
    }
  });
});