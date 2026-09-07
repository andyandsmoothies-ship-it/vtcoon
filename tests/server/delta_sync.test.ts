import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../src/server/session_manager';
import type { DeltaPayload } from '../../src/server/session_manager';

describe('[TC-00.2/MSS] [UC-GAME-009/MSS] Delta State Sync', () => {
  let manager: SessionManager;

  beforeEach(() => {
    manager = new SessionManager();
    manager.addSession('player-1');
  });

  it('broadcastDelta lưu delta payload', () => {
    const delta: DeltaPayload = {
      tick: 1,
      cells: [{ index: 0, ownerId: null }],
    };
    manager.broadcastDelta(delta);
    expect(manager.getLastDelta()).toEqual(delta);
  });

  it('delta payload serialized < 10KB', () => {
    const delta: DeltaPayload = {
      tick: 1,
      cells: Array.from({ length: 40 }, (_, i) => ({
        index: i,
        ownerId: null,
      })),
    };
    const sizeBytes = new TextEncoder().encode(JSON.stringify(delta)).length;
    expect(sizeBytes).toBeLessThan(10_240);
  });

  it('getLastDelta trả undefined trước khi chưa gọi broadcastDelta', () => {
    const freshManager = new SessionManager();
    expect(freshManager.getLastDelta()).toBeUndefined();
  });
});
