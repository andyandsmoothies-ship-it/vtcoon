// [IMP-127][Trạm 1] Contract Test Suite: Tile Orientation Standardization, Bailout Sync, and ActionPhase Liquidity
// Universal 4-Facet Behavioral Matrix:
// Facet 1 (Boundary & Range): tileRotation angles across 4 sides, corner zero-protrusion, pitch/roll flatness
// Facet 2 (State Reactivity): buildIntentTelemetryContext sync for dice & doubles follow-up rolls
// Facet 3 (Resource Disposal & Liquidity): mortgageProperty and handleDowngrade unlocked in TurnPhase.ActionPhase
// Facet 4 (Error Defense & Invariants): out-of-bounds rotation fallbacks, TurnPhase.WaitingRoll rejections, unauthorized guards

import { describe, it, expect } from 'vitest';
import { tileRotation } from '../../src/client/3d/board_layout';
import { buildIntentTelemetryContext } from '../../src/client/ui/ui_helpers';
import { RoomManager } from '../../src/server/room_manager';
import { TurnPhase } from '../../src/domain/room';
import { mortgageProperty } from '../../src/server/mortgage_manager';
import { handleDowngrade } from '../../src/server/property_actions';
import { ActionRejectReason } from '../../src/domain/action_reasons';

function createTestRoom(phase: TurnPhase = TurnPhase.ActionPhase) {
  const mgr = new RoomManager(() => 0);
  const room = mgr.createRoom('p1');
  mgr.joinRoom(room.roomCode, 'p2');
  mgr.startGame(room.roomCode);
  room.phase = phase;
  const reg = (mgr as any).registries.get(room.roomCode) as Map<number, string>;
  const sm = (mgr as any).propertyStates.get(room.roomCode) as Map<number, { level: number; isMortgaged?: boolean }>;
  return {
    mgr,
    room,
    reg,
    sm,
    p1: room.players[0]!,
    p2: room.players[1]!,
  };
}

// ============================================================================
// CHỐT 1: Chuẩn Hóa Vector Góc Xoay Ô Cờ (tileRotation) — Facet 1 (Boundary & Range)
// ============================================================================
describe('[IMP-127] Chốt 1: Chuẩn Hóa Vector Góc Xoay Ô Cờ (tileRotation)', () => {
  it('[TC-IMP127.01/MSS][UC-BOARD-ROT] Ô 0 (Khởi Hành): góc xoay [0, Math.PI / 4, 0] đối diện camera Overview', () => {
    const rot = tileRotation(0);
    expect(rot).toEqual([0, Math.PI / 4, 0]);
  });

  it.each([1, 5, 9])(
    '[TC-IMP127.02/MSS][UC-BOARD-ROT] Cạnh 0 (ô index %i): góc xoay chuẩn hóa [0, 0, 0]',
    (cellIndex) => {
      const rot = tileRotation(cellIndex);
      expect(rot).toEqual([0, 0, 0]);
    },
  );

  it.each([10, 15, 19])(
    '[TC-IMP127.03/MSS][UC-BOARD-ROT] Cạnh 1 (ô index %i, kể cả góc 10): góc xoay chuẩn hóa [0, -Math.PI / 2, 0]',
    (cellIndex) => {
      const rot = tileRotation(cellIndex);
      expect(rot).toEqual([0, -Math.PI / 2, 0]);
    },
  );

  it.each([20, 25, 29])(
    '[TC-IMP127.04/MSS][UC-BOARD-ROT] Cạnh 2 (ô index %i, kể cả góc 20): góc xoay chuẩn hóa [0, Math.PI, 0]',
    (cellIndex) => {
      const rot = tileRotation(cellIndex);
      expect(rot).toEqual([0, Math.PI, 0]);
    },
  );

  it.each([30, 35, 39])(
    '[TC-IMP127.05/MSS][UC-BOARD-ROT] Cạnh 3 (ô index %i, kể cả góc 30): góc xoay chuẩn hóa [0, Math.PI / 2, 0]',
    (cellIndex) => {
      const rot = tileRotation(cellIndex);
      expect(rot).toEqual([0, Math.PI / 2, 0]);
    },
  );

  it.each([0, 10, 20, 30])(
    '[TC-IMP127.06/MSS][UC-BOARD-ROT] Facet 1 (Boundary): Góc pitch (x) và roll (z) luôn bằng 0 tại ô góc %i',
    (cornerIndex) => {
      const rot = tileRotation(cornerIndex);
      expect(rot[0]).toBe(0);
      expect(rot[2]).toBe(0);
    },
  );
});

// ============================================================================
// CHỐT 2: Đồng Bộ Telemetry Context & Quyền Đổ Tiếp — Facet 2 (State Reactivity)
// ============================================================================
describe('[IMP-127] Chốt 2: Đồng Bộ Telemetry Context & Quyền Đổ Tiếp', () => {
  it('[TC-IMP127.07/MSS][UC-TELEMETRY-SYNC] Khi consecutiveDoubles = 0 và dice = [6, 6], isDoublesRoll phải là false', () => {
    const ctx = buildIntentTelemetryContext({
      intentType: 'INTENT_ROLL',
      dice: [6, 6],
      consecutiveDoubles: 0,
      balance: 10_000,
      position: 0,
      currentTurnPlayerId: 'p1',
      localPlayerId: 'p1',
    });
    expect(ctx.isDoublesRoll).toBe(false);
  });

  it('[TC-IMP127.08/MSS][UC-TELEMETRY-SYNC] Khi consecutiveDoubles = 0 và dice = [6, 6], buttonLabel phải là "Đổ Xúc Xắc"', () => {
    const ctx = buildIntentTelemetryContext({
      intentType: 'INTENT_ROLL',
      dice: [6, 6],
      consecutiveDoubles: 0,
      balance: 10_000,
      position: 0,
      currentTurnPlayerId: 'p1',
      localPlayerId: 'p1',
    });
    expect(ctx.buttonLabel).toBe('Đổ Xúc Xắc');
  });

  it('[TC-IMP127.09/MSS][UC-TELEMETRY-SYNC] Khi consecutiveDoubles = 0 và dice = [6, 6], note phải là undefined', () => {
    const ctx = buildIntentTelemetryContext({
      intentType: 'INTENT_ROLL',
      dice: [6, 6],
      consecutiveDoubles: 0,
      balance: 10_000,
      position: 0,
      currentTurnPlayerId: 'p1',
      localPlayerId: 'p1',
    });
    expect(ctx.note).toBeUndefined();
  });

  it('[TC-IMP127.10/MSS][UC-TELEMETRY-SYNC] Khi consecutiveDoubles = 1 và dice = [6, 6], isDoublesRoll phải là true', () => {
    const ctx = buildIntentTelemetryContext({
      intentType: 'INTENT_ROLL',
      dice: [6, 6],
      consecutiveDoubles: 1,
      balance: 10_000,
      position: 0,
      currentTurnPlayerId: 'p1',
      localPlayerId: 'p1',
    });
    expect(ctx.isDoublesRoll).toBe(true);
  });

  it('[TC-IMP127.11/MSS][UC-TELEMETRY-SYNC] Khi consecutiveDoubles = 1 và dice = [6, 6], buttonLabel phải là "Đổ Tiếp (Đôi)"', () => {
    const ctx = buildIntentTelemetryContext({
      intentType: 'INTENT_ROLL',
      dice: [6, 6],
      consecutiveDoubles: 1,
      balance: 10_000,
      position: 0,
      currentTurnPlayerId: 'p1',
      localPlayerId: 'p1',
    });
    expect(ctx.buttonLabel).toBe('Đổ Tiếp (Đôi)');
  });

  it('[TC-IMP127.12/MSS][UC-TELEMETRY-SYNC] Khi consecutiveDoubles = 1 và dice = [6, 6], note phải là "DOUBLES_FOLLOWUP_ROLL"', () => {
    const ctx = buildIntentTelemetryContext({
      intentType: 'INTENT_ROLL',
      dice: [6, 6],
      consecutiveDoubles: 1,
      balance: 10_000,
      position: 0,
      currentTurnPlayerId: 'p1',
      localPlayerId: 'p1',
    });
    expect(ctx.note).toBe('DOUBLES_FOLLOWUP_ROLL');
  });

  it('[TC-IMP127.13/MSS][UC-TELEMETRY-SYNC] Khi consecutiveDoubles = 2 và dice = [4, 4], tiếp tục kích hoạt quyền đổ tiếp đôi', () => {
    const ctx = buildIntentTelemetryContext({
      intentType: 'INTENT_ROLL',
      dice: [4, 4],
      consecutiveDoubles: 2,
      balance: 10_000,
      position: 10,
      currentTurnPlayerId: 'p1',
      localPlayerId: 'p1',
    });
    expect(ctx.isDoublesRoll).toBe(true);
    expect(ctx.buttonLabel).toBe('Đổ Tiếp (Đôi)');
  });

  it.each([
    'INTENT_BAIL_OUT',
    'INTENT_END_TURN',
  ] as const)(
    '[TC-IMP127.14/MSS][UC-TELEMETRY-SYNC] Intent phi xúc xắc (%s) không gán buttonLabel và note của đổ xúc xắc',
    (intentType) => {
      const ctx = buildIntentTelemetryContext({
        intentType,
        dice: [6, 6],
        consecutiveDoubles: 1,
        balance: 5_000,
        position: 10,
        currentTurnPlayerId: 'p1',
        localPlayerId: 'p1',
      });
      expect(ctx.buttonLabel).toBeUndefined();
      expect(ctx.note).toBeUndefined();
    },
  );
});

// ============================================================================
// CHỐT 3 & CHỐT 4: Mở Quyền Thanh Khoản Trong ActionPhase — Facet 3 (Resource Disposal & Liquidity)
// ============================================================================
describe('[IMP-127] Chốt 3 & Chốt 4: Mở Quyền Thanh Khoản Trong ActionPhase', () => {
  it('[TC-IMP127.15/MSS][UC-LIQUIDITY-ACT] Cho phép mortgageProperty thành công ngay trong TurnPhase.ActionPhase', () => {
    const { room, reg, sm } = createTestRoom(TurnPhase.ActionPhase);
    reg.set(1, 'p1');
    const res = mortgageProperty(room, 'p1', 1, reg, sm);
    expect(res.success).toBe(true);
    expect(res.reason).toBeUndefined();
  });

  it('[TC-IMP127.16/MSS][UC-LIQUIDITY-ACT] Consumer-Side: Tiền vay thế chấp (50% giá đất) được cộng chính xác vào số dư tiền mặt của người chơi', () => {
    const { room, reg, sm, p1 } = createTestRoom(TurnPhase.ActionPhase);
    reg.set(1, 'p1');
    const initialBalance = p1.balance;
    const res = mortgageProperty(room, 'p1', 1, reg, sm);
    expect(res.success).toBe(true);
    expect(p1.balance).toBe(initialBalance + 300);
  });

  it('[TC-IMP127.17/MSS][UC-LIQUIDITY-ACT] Consumer-Side: Trạng thái ô đất được cập nhật isMortgaged = true và player.mortgagedProperties ghi nhận ô đất', () => {
    const { room, reg, sm, p1 } = createTestRoom(TurnPhase.ActionPhase);
    reg.set(1, 'p1');
    mortgageProperty(room, 'p1', 1, reg, sm);
    expect(sm.get(1)?.isMortgaged).toBe(true);
    expect(p1.mortgagedProperties).toContain(1);
  });

  it('[TC-IMP127.18/MSS][UC-LIQUIDITY-ACT] Cho phép hạ cấp bán nhà handleDowngrade thành công ngay trong TurnPhase.ActionPhase', () => {
    const { room, reg, sm, p1 } = createTestRoom(TurnPhase.ActionPhase);
    reg.set(1, 'p1');
    sm.set(1, { level: 1 });
    const res = handleDowngrade(p1, TurnPhase.ActionPhase, 1, reg, sm, room.roomCode);
    expect(res.success).toBe(true);
    expect(res.reason).toBeUndefined();
  });

  it('[TC-IMP127.19/MSS][UC-LIQUIDITY-ACT] Consumer-Side: Tiền hoàn lại khi hạ cấp nhà (50% chi phí xây) được hoàn trả vào số dư người chơi tại điểm tiêu thụ', () => {
    const { room, reg, sm, p1 } = createTestRoom(TurnPhase.ActionPhase);
    reg.set(1, 'p1');
    sm.set(1, { level: 1 });
    const initialBalance = p1.balance;
    handleDowngrade(p1, TurnPhase.ActionPhase, 1, reg, sm, room.roomCode);
    expect(p1.balance).toBe(initialBalance + 150);
  });

  it('[TC-IMP127.20/MSS][UC-LIQUIDITY-ACT] Consumer-Side: Cấp độ nhà trên ô đất được hạ từ level 1 về level 0 sau khi bán nhà trong ActionPhase', () => {
    const { room, reg, sm, p1 } = createTestRoom(TurnPhase.ActionPhase);
    reg.set(1, 'p1');
    sm.set(1, { level: 1 });
    const res = handleDowngrade(p1, TurnPhase.ActionPhase, 1, reg, sm, room.roomCode);
    expect(res.newLevel).toBe(0);
    expect(sm.get(1)?.level).toBe(0);
  });
});

// ============================================================================
// FACET 4: Error Defense & Invariants
// ============================================================================
describe('[IMP-127] Facet 4: Error Defense & Invariants', () => {
  it('[TC-IMP127.21/A1][UC-ERROR-DEF] tileRotation(-1) giá trị âm fallback an toàn về [0, 0, 0]', () => {
    expect(tileRotation(-1)).toEqual([0, 0, 0]);
  });

  it('[TC-IMP127.22/A2][UC-ERROR-DEF] tileRotation(40) vượt giới hạn 39 fallback an toàn về [0, 0, 0]', () => {
    expect(tileRotation(40)).toEqual([0, 0, 0]);
  });

  it('[TC-IMP127.23/A3][UC-ERROR-DEF] tileRotation(NaN) giá trị không hợp lệ fallback an toàn về [0, 0, 0]', () => {
    expect(tileRotation(NaN)).toEqual([0, 0, 0]);
  });

  it('[TC-IMP127.24/A4][UC-ERROR-DEF] mortgageProperty trong TurnPhase.WaitingRoll tiếp tục bị từ chối với lý do INVALID_PHASE', () => {
    const { room, reg, sm } = createTestRoom(TurnPhase.WaitingRoll);
    reg.set(1, 'p1');
    const res = mortgageProperty(room, 'p1', 1, reg, sm);
    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.INVALID_PHASE);
  });

  it('[TC-IMP127.25/A5][UC-ERROR-DEF] handleDowngrade trong TurnPhase.WaitingRoll tiếp tục bị từ chối với lý do INVALID_PHASE', () => {
    const { room, reg, sm, p1 } = createTestRoom(TurnPhase.WaitingRoll);
    reg.set(1, 'p1');
    sm.set(1, { level: 1 });
    const res = handleDowngrade(p1, TurnPhase.WaitingRoll, 1, reg, sm, room.roomCode);
    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.INVALID_PHASE);
  });

  it('[TC-IMP127.26/A6][UC-ERROR-DEF] mortgageProperty trong ActionPhase bị từ chối NOT_YOUR_TURN khi người chơi không phải lượt', () => {
    const { room, reg, sm } = createTestRoom(TurnPhase.ActionPhase);
    reg.set(1, 'p2');
    const res = mortgageProperty(room, 'p2', 1, reg, sm);
    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.NOT_YOUR_TURN);
  });

  it('[TC-IMP127.27/A7][UC-ERROR-DEF] mortgageProperty trong ActionPhase bị từ chối HAS_BUILDING khi ô đất còn công trình', () => {
    const { room, reg, sm } = createTestRoom(TurnPhase.ActionPhase);
    reg.set(1, 'p1');
    sm.set(1, { level: 1 });
    const res = mortgageProperty(room, 'p1', 1, reg, sm);
    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.HAS_BUILDING);
  });

  it('[TC-IMP127.28/A8][UC-ERROR-DEF] mortgageProperty trong ActionPhase bị từ chối ALREADY_MORTGAGED khi ô đất đã thế chấp', () => {
    const { room, reg, sm, p1 } = createTestRoom(TurnPhase.ActionPhase);
    reg.set(1, 'p1');
    p1.mortgagedProperties.push(1);
    const res = mortgageProperty(room, 'p1', 1, reg, sm);
    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.ALREADY_MORTGAGED);
  });

  it('[TC-IMP127.29/A9][UC-ERROR-DEF] handleDowngrade trong ActionPhase bị từ chối NOT_OWNER khi thao tác trên đất của đối thủ', () => {
    const { room, reg, sm, p2 } = createTestRoom(TurnPhase.ActionPhase);
    reg.set(1, 'p1');
    sm.set(1, { level: 1 });
    const res = handleDowngrade(p2, TurnPhase.ActionPhase, 1, reg, sm, room.roomCode);
    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.NOT_OWNER);
  });

  it('[TC-IMP127.30/A10][UC-ERROR-DEF] handleDowngrade trong ActionPhase bị từ chối NOT_UPGRADEABLE khi ô đất chưa xây nhà (level 0)', () => {
    const { room, reg, sm, p1 } = createTestRoom(TurnPhase.ActionPhase);
    reg.set(1, 'p1');
    sm.set(1, { level: 0 });
    const res = handleDowngrade(p1, TurnPhase.ActionPhase, 1, reg, sm, room.roomCode);
    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.NOT_UPGRADEABLE);
  });
});
