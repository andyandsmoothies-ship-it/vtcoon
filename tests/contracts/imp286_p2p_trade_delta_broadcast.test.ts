import { describe, it, expect } from 'vitest';
import { createRoom, createPlayer, TurnPhase, ActionRejectReason } from '../../src/domain/room.js';
import type { Room, Player } from '../../src/domain/room.js';
import { buildDeltaFromRoom, buildDeltaPayload } from '../../src/server/delta_mapper.js';
import type { DeltaPayload, DeltaPayloadOptions } from '../../src/server/delta_types.js';
import { executeP2PTrade } from '../../src/server/p2p_trade_actions.js';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_data.js';

// Station 1 Domain Model Augmentation for IMP-286
export interface TradeResultInfo {
  readonly sellerId: string;
  readonly buyerId: string;
  readonly cellIndex: number;
  readonly price: number;
  readonly offeredCellIndex?: number;
  readonly taxAmount: number;
  readonly timestamp: number;
}

declare module '../../src/domain/room.js' {
  interface Room {
    lastTradeResult?: TradeResultInfo | null;
  }
}

declare module '../../src/server/delta_types.js' {
  interface DeltaPayload {
    readonly lastTradeResult?: TradeResultInfo | null;
  }
  interface DeltaPayloadOptions {
    lastTradeResult?: TradeResultInfo | null;
  }
}

function setupTradeScenario(): {
  room: Room;
  seller: Player;
  buyer: Player;
  registry: PropertyRegistry;
  stateMap: PropertyStateMap;
} {
  const room = createRoom('seller');
  const seller = room.players[0]!;
  const buyer = createPlayer('buyer');
  room.players.push(buyer);
  room.started = true;
  room.phase = TurnPhase.PropertyManagement;

  seller.balance = 10_000;
  buyer.balance = 10_000;

  const registry: PropertyRegistry = new Map();
  const stateMap: PropertyStateMap = new Map();

  registry.set(1, 'seller');
  stateMap.set(1, { level: 0, isMortgaged: false });

  return { room, seller, buyer, registry, stateMap };
}

describe('[TC-286][UC-IMP286] Server SSOT Trade Result Broadcast Contract Suite', () => {
  it('[TC-286.01/MSS][UC-IMP286/MSS] Given một phiên P2P trade hợp lệ giữa seller và buyer, When gọi executeP2PTrade với giá tiền dương, Then room.lastTradeResult được gán với đầy đủ sellerId, buyerId, cellIndex, price, taxAmount và timestamp', () => {
    const { room, registry, stateMap } = setupTradeScenario();

    const res = executeP2PTrade(room, 'seller', 'buyer', 1, 1000, registry, stateMap);

    expect(res.success).toBe(true);
    expect(room.lastTradeResult).toMatchObject({
      sellerId: 'seller',
      buyerId: 'buyer',
      cellIndex: 1,
      price: 1000,
      taxAmount: 50,
    });
    expect(typeof room.lastTradeResult?.timestamp).toBe('number');
    expect((room.lastTradeResult?.timestamp ?? 0)).toBeGreaterThan(0);
  });

  it('[TC-286.02/MSS][UC-IMP286/MSS] Given một phiên P2P trade hoán đổi BĐS kèm tiền bù, When gọi executeP2PTrade có offeredCellIndex, Then room.lastTradeResult ghi nhận chính xác offeredCellIndex', () => {
    const { room, registry, stateMap } = setupTradeScenario();
    registry.set(3, 'buyer');
    stateMap.set(3, { level: 0, isMortgaged: false });

    const res = executeP2PTrade(room, 'seller', 'buyer', 1, 500, registry, stateMap, 3);

    expect(res.success).toBe(true);
    expect(room.lastTradeResult?.offeredCellIndex).toBe(3);
    expect(room.lastTradeResult?.cellIndex).toBe(1);
  });

  it('[TC-286.03/MSS][UC-IMP286/MSS] Given một phiên P2P trade có thuế chuyển nhượng 5 phần trăm, When gọi executeP2PTrade thành công, Then room.lastTradeResult.taxAmount bằng 5 phần trăm của price', () => {
    const { room, registry, stateMap } = setupTradeScenario();

    const res = executeP2PTrade(room, 'seller', 'buyer', 1, 2000, registry, stateMap);

    expect(res.success).toBe(true);
    expect(room.lastTradeResult?.taxAmount).toBe(100);
    expect(room.lastTradeResult?.price).toBe(2000);
  });

  it('[TC-286.04/MSS][UC-IMP286/MSS] Given phòng chơi có room.lastTradeResult vừa được ghi nhận, When gọi buildDeltaFromRoom trên room, Then delta trả về chứa trường lastTradeResult khớp 100 phần trăm dữ liệu phòng', () => {
    const { room, registry, stateMap } = setupTradeScenario();
    const mockTradeResult: TradeResultInfo = {
      sellerId: 'seller',
      buyerId: 'buyer',
      cellIndex: 1,
      price: 1000,
      taxAmount: 50,
      timestamp: 1700000000000,
      offeredCellIndex: 3,
    };
    room.lastTradeResult = mockTradeResult;

    const delta = buildDeltaFromRoom(room, registry, stateMap, 10);

    expect(delta.lastTradeResult).toEqual(mockTradeResult);
    expect(delta.lastTradeResult?.sellerId).toBe('seller');
    expect(delta.lastTradeResult?.offeredCellIndex).toBe(3);
  });

  it('[TC-286.05/MSS][UC-IMP286/MSS] Given đối tượng DeltaPayloadOptions có trường lastTradeResult, When gọi buildDeltaPayload trực tiếp với options, Then DeltaPayload trả về bảo toàn trường lastTradeResult', () => {
    const mockTradeResult: TradeResultInfo = {
      sellerId: 'seller',
      buyerId: 'buyer',
      cellIndex: 5,
      price: 1500,
      taxAmount: 75,
      timestamp: 1700000000001,
    };
    const options: DeltaPayloadOptions = {
      tick: 42,
      cells: [],
      lastTradeResult: mockTradeResult,
    };

    const delta = buildDeltaPayload(options);

    expect(delta.lastTradeResult).toEqual(mockTradeResult);
    expect(delta.lastTradeResult?.price).toBe(1500);
  });

  it('[TC-286.06/A1][UC-IMP286/A1] Given giao dịch P2P thất bại do người mua không đủ tiền, When gọi executeP2PTrade với số dư không hợp lệ, Then hàm trả về false và room.lastTradeResult không bị cập nhật dữ liệu sai lệch', () => {
    const { room, registry, stateMap, buyer } = setupTradeScenario();
    buyer.balance = 100;
    const priorResult: TradeResultInfo = {
      sellerId: 'prior_seller',
      buyerId: 'prior_buyer',
      cellIndex: 6,
      price: 800,
      taxAmount: 40,
      timestamp: 1700000000000,
    };
    room.lastTradeResult = priorResult;

    const res = executeP2PTrade(room, 'seller', 'buyer', 1, 1000, registry, stateMap);

    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.INSUFFICIENT_FUNDS);
    expect(room.lastTradeResult).toEqual(priorResult);
  });

  it('[TC-286.07/A2][UC-IMP286/A2] Given giao dịch P2P thất bại do người bán không phải chủ sở hữu, When gọi executeP2PTrade với ô đất không thuộc người bán, Then hàm trả về false và room.lastTradeResult không bị gán', () => {
    const { room, registry, stateMap } = setupTradeScenario();
    registry.set(1, 'other_player');
    room.lastTradeResult = undefined;

    const res = executeP2PTrade(room, 'seller', 'buyer', 1, 1000, registry, stateMap);

    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.NOT_OWNER);
    expect(room.lastTradeResult).toBeUndefined();
  });

  it('[TC-286.08/A3][UC-IMP286/A3] Given phòng chơi chưa diễn ra giao dịch nào, When gọi buildDeltaFromRoom trên room mặc định, Then delta.lastTradeResult mang giá trị null hoặc undefined', () => {
    const freshRoom = createRoom('host_user');
    const registry: PropertyRegistry = new Map();
    const stateMap: PropertyStateMap = new Map();

    const delta = buildDeltaFromRoom(freshRoom, registry, stateMap, 0);

    expect(freshRoom.lastTradeResult).toBeUndefined();
    expect(delta.lastTradeResult).toBeNull();
  });
});
