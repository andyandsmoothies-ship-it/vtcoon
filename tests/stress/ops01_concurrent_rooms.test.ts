// [UC-GAME-010/MSS][TD-NET-003] OPS-01 Stress Testing 100 Concurrent Rooms & Memory Leak Audit
// TC-OPS01.1: Mô phỏng 100 phòng đồng thời, đo process.memoryUsage().heapUsed với delta < 50MB.
// TC-OPS01.5 (Adversarial): Test harness phát hiện rò rỉ bộ nhớ khi cố tình bỏ qua closeRoom().

import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager.js';
import { TurnPhase } from '../../src/domain/room.js';
import { BuyResult } from '../../src/domain/property_manager.js';

export interface SimulateOptions {
  readonly intentsPerRoom?: number;
  readonly skipCleanup?: boolean;
}

export interface SimulateResult {
  readonly delta: number;
  readonly heapBefore: number;
  readonly heapAfter: number;
  readonly activeRooms: number;
  readonly totalIntentsExecuted: number;
}

const retainedLeakedManagers: RoomManager[] = [];

export async function simulateConcurrentRooms(
  count: number,
  options?: SimulateOptions,
): Promise<SimulateResult> {
  const intentsPerRoom = options?.intentsPerRoom ?? 10;
  const skipCleanup    = options?.skipCleanup ?? false;

  const heapBefore = process.memoryUsage().heapUsed;
  const mgr = new RoomManager(42);
  const roomCodes: string[] = [];

  for (let i = 0; i < count; i++) {
    const hostId = `P_${i}_0`;
    const room = mgr.createRoom(hostId);
    mgr.joinRoom(room.roomCode, `P_${i}_1`);
    mgr.joinRoom(room.roomCode, `P_${i}_2`);
    mgr.startGame(room.roomCode);
    roomCodes.push(room.roomCode);
  }

  let totalIntents = 0;

  // Mô phỏng đồng thời 100 phòng thực thi intent qua Promise.all
  await Promise.all(
    roomCodes.map(async (rc) => {
      for (let step = 0; step < intentsPerRoom; step++) {
        const r = mgr.getRoom(rc);
        if (!r) break;
        const current = r.players[r.currentPlayerIndex];
        if (!current) break;

        if (r.phase === TurnPhase.WaitingRoll) {
          mgr.handleRollDice(rc, current.id);
          totalIntents++;
        } else if (r.phase === TurnPhase.ActionPhase) {
          const buyRes = mgr.handleBuyProperty(rc, current.id);
          if (!buyRes || buyRes.result !== BuyResult.Success) {
            mgr.handleDecline(rc, current.id);
          }
          totalIntents++;
        } else if (r.phase === TurnPhase.PropertyManagement) {
          mgr.handleEndTurn(rc, current.id);
          totalIntents++;
        } else if (r.phase === TurnPhase.InsolvencyPhase) {
          mgr.handleBankruptcy(rc, current.id);
          totalIntents++;
        } else {
          mgr.handleEndTurn(rc, current.id);
          totalIntents++;
        }
      }

      if (!skipCleanup) {
        mgr.closeRoom(rc);
      }
    }),
  );

  if (skipCleanup) {
    retainedLeakedManagers.push(mgr);
  }

  const heapAfter = process.memoryUsage().heapUsed;
  const delta = heapAfter - heapBefore;

  return {
    delta,
    heapBefore,
    heapAfter,
    activeRooms: mgr.getRoomCount(),
    totalIntentsExecuted: totalIntents,
  };
}

describe('[Slice OPS-01] Stress Testing 100 Phong Dong Thoi & Memory Leak Audit', () => {

  // =========================================================================
  // TC-OPS01.1: Mô phỏng 100 phòng đồng thời — heap delta < 50MB
  // =========================================================================
  it('[TC-OPS01.1/MSS] 100 phong dong thoi thuc hien 10 intents moi phong: heap delta < 50MB va 0 phong ton dong', async () => {
    const heapBefore = process.memoryUsage().heapUsed;
    const result = await simulateConcurrentRooms(100, { intentsPerRoom: 10 });
    const heapAfter = process.memoryUsage().heapUsed;

    const diff = heapAfter - heapBefore;
    const MAX_ALLOWED_HEAP_DELTA = 50 * 1024 * 1024; // 50MB NFR Baseline

    expect(diff, `Heap delta (${diff} bytes) phai nho hon 50MB`).toBeLessThan(MAX_ALLOWED_HEAP_DELTA);
    expect(result.activeRooms, 'Toan bo 100 phong phai duoc closeRoom() giai phong sach').toBe(0);
    expect(result.totalIntentsExecuted, 'Toan bo intents da duoc thuc thi').toBeGreaterThanOrEqual(1000);
  });

  // =========================================================================
  // TC-OPS01.5: Adversarial Inversion — Test harness phát hiện rò rỉ bộ nhớ khi bỏ qua cleanup
  // =========================================================================
  it('[TC-OPS01.5/Adversarial] Phat hien ro ri bo nho khi co tinh bo qua closeRoom()', async () => {
    const leakHeap = await simulateConcurrentRooms(10, { skipCleanup: true });

    // Khi skipCleanup = true:
    // 1. Số phòng đang hoạt động không được dọn dẹp (bằng 10)
    expect(leakHeap.activeRooms, '10 phong van ton tai trong RoomMap khi khong don dep').toBe(10);
    // 2. Test harness ghi nhận delta rò rỉ > 0
    expect(leakHeap.delta, 'Delta ro ri phai lon hon 0').toBeGreaterThan(0);
  });
});
