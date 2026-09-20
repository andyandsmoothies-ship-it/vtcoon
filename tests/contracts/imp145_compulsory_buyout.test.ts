// [CONTRACT TEST] IMP-145: Quyền Ưu Tiên Mua Lại Dự Án C0 (Compulsory Buyout Đền Bù 130% & Quyền Tự Quyết)
// Universal 4-Facet Behavioral Matrix & Adversarial Inversion Verification
// Traceability Tags: [TC-145.01..16] & [UC-IMP145]
import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager.js';
import { TurnPhase, type Player, type Room } from '../../src/domain/room.js';
import { BotPersonality } from '../../src/domain/bot/bot_types.js';
import { ChanceCardId } from '../../src/domain/event_card_types.js';
import { executeChanceCard } from '../../src/domain/chance_card_handlers.js';
import * as propertyCoordinator from '../../src/server/room_property_coordinator.js';
import * as chanceHandlers from '../../src/domain/chance_card_handlers.js';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_data.js';

export interface PendingBuyoutSession {
  readonly buyerId: string;
  readonly sellerId: string;
  readonly cellIndex: number;
  readonly cost: number;
  readonly basePrice: number;
  readonly createdAt: number;
  readonly expiresAt: number;
}

declare module '../../src/domain/room.js' {
  interface Room {
    pendingBuyout?: PendingBuyoutSession | null;
  }
}

declare module '../../src/server/room_manager.js' {
  interface RoomManager {
    hasPendingBuyout(roomCode: string): boolean;
    getPendingBuyout(roomCode: string): PendingBuyoutSession | undefined;
    checkPendingBuyoutTimeout(
      roomCode: string,
      currentTime?: number,
    ): { timeout: boolean; session?: PendingBuyoutSession };
    declineCompulsoryBuyout(
      roomCode: string,
      playerId: string,
    ): { success: boolean; reason?: string };
    executeCompulsoryBuyout(
      roomCode: string,
      playerId: string,
      cellIndex: number,
    ): { success: boolean; reason?: string };
  }
}

let buyoutDomain: any = null;
try {
  buyoutDomain = await import(/* @vite-ignore */ '../../src/domain/compulsory_buyout.js');
} catch {
  buyoutDomain = null;
}

const calculateCompulsoryBuyoutCost: (cellIndexOrPrice: number) => number =
  buyoutDomain?.calculateCompulsoryBuyoutCost ??
  (chanceHandlers as any).calculateCompulsoryBuyoutCost;

const isEligibleForCompulsoryBuyout: (
  cellIndex: number,
  ownerId: string,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  room?: Room,
  players?: Player[],
) => boolean =
  buyoutDomain?.isEligibleForCompulsoryBuyout ??
  (chanceHandlers as any).isEligibleForCompulsoryBuyout;

const coordDeclineCompulsoryBuyout: (
  ctx: any,
  playerId: string,
) => { success: boolean; reason?: string } =
  (propertyCoordinator as any).coordDeclineCompulsoryBuyout;

const coordExecuteCompulsoryBuyout: (
  ctx: any,
  playerId: string,
  cellIndex: number,
) => { success: boolean; reason?: string } =
  (propertyCoordinator as any).coordExecuteCompulsoryBuyout;

function setupBuyoutRoom(opts?: {
  humanBalance?: number;
  opponentBalance?: number;
  roundCount?: number;
}) {
  const mgr = new RoomManager(14501);
  const room = mgr.createRoom('human_p1');
  mgr.addBot(room.roomCode, 'opponent_p2', BotPersonality.Balanced);
  mgr.startGame(room.roomCode);

  room.roundCount = opts?.roundCount ?? 5;
  room.phase = TurnPhase.PropertyManagement;

  const human = room.players.find((p) => p.id === 'human_p1')!;
  const opponent = room.players.find((p) => p.id === 'opponent_p2')!;
  human.isBot = false;
  human.balance = opts?.humanBalance ?? 10_000;
  opponent.isBot = true;
  opponent.balance = opts?.opponentBalance ?? 5_000;

  const reg = mgr.getRegistry(room.roomCode)!;
  const sm = mgr.getPropertyStates(room.roomCode)!;

  return { mgr, room, human, opponent, reg, sm };
}

describe('[TC-145][UC-IMP145] Compulsory Buyout C0 Contract Suite', () => {
  // =========================================================================
  // FACET 1: Boundary & Monopoly Immunity
  // =========================================================================
  describe('Facet 1: Boundary & Monopoly Immunity', () => {
    it('[TC-145.01/MSS][UC-IMP145] Chi phí mua lại được tính đúng bằng Math.floor(basePrice * 1.3) (đền bù 130% giá gốc)', () => {
      // Ô 1 (Cần Thơ) giá gốc 600 Tr. -> 130% = 780 Tr.
      const costCell1 = calculateCompulsoryBuyoutCost(1);
      expect(costCell1).toBe(Math.floor(600 * 1.3));

      // Ô 6 (Bình Dương) giá gốc 1.000 Tr. -> 130% = 1.300 Tr.
      const costCell6 = calculateCompulsoryBuyoutCost(6);
      expect(costCell6).toBe(Math.floor(1000 * 1.3));
    });

    it('[TC-145.02/MSS][UC-IMP145] Tuyệt đối CẤM mua lại ô đất thuộc nhóm màu đối thủ đã độc quyền trọn bộ (kể cả khi có ô đang thế chấp)', () => {
      const { room, opponent, reg, sm } = setupBuyoutRoom();
      // Đối thủ sở hữu trọn vẹn bộ Nâu (ô 1 & 3), trong đó ô 3 đang thế chấp
      reg.set(1, opponent.id);
      sm.set(1, { level: 0, isMortgaged: false });
      reg.set(3, opponent.id);
      sm.set(3, { level: 0, isMortgaged: true });

      const eligible = isEligibleForCompulsoryBuyout(1, opponent.id, reg, sm, room);
      expect(eligible).toBe(false);
    });

    it('[TC-145.03/MSS][UC-IMP145] CẤM mua lại ô đất đã xây dựng công trình C1-C3 (level >= 1)', () => {
      const { room, opponent, reg, sm } = setupBuyoutRoom();
      // Ô 1 đã xây dựng nhà C1 (level = 1)
      reg.set(1, opponent.id);
      sm.set(1, { level: 1, isMortgaged: false });

      const eligible = isEligibleForCompulsoryBuyout(1, opponent.id, reg, sm, room);
      expect(eligible).toBe(false);
    });

    it('[TC-145.04/MSS][UC-IMP145] CẤM mua lại ô đất đang trong tình trạng thế chấp (isMortgaged = true)', () => {
      const { room, opponent, reg, sm } = setupBuyoutRoom();
      // Ô 1 là đất trống C0 nhưng đang bị thế chấp
      reg.set(1, opponent.id);
      sm.set(1, { level: 0, isMortgaged: true });

      const eligible = isEligibleForCompulsoryBuyout(1, opponent.id, reg, sm, room);
      expect(eligible).toBe(false);
    });

    it('[TC-145.05/MSS][UC-IMP145] CẤM mua lại các ô không có nhóm màu (như Ga tàu, Tiện ích)', () => {
      const { room, opponent, reg, sm } = setupBuyoutRoom();
      // Ô 5 (Cảng HKQT Long Thành - Railroad) và Ô 12 (EVN - Utility)
      reg.set(5, opponent.id);
      sm.set(5, { level: 0, isMortgaged: false });
      reg.set(12, opponent.id);
      sm.set(12, { level: 0, isMortgaged: false });

      const eligibleRailroad = isEligibleForCompulsoryBuyout(5, opponent.id, reg, sm, room);
      const eligibleUtility = isEligibleForCompulsoryBuyout(12, opponent.id, reg, sm, room);

      expect(eligibleRailroad).toBe(false);
      expect(eligibleUtility).toBe(false);
    });
  });

  // =========================================================================
  // FACET 2: Reactivity & Financial Flows
  // =========================================================================
  describe('Facet 2: Reactivity & Financial Flows', () => {
    it('[TC-145.06/MSS][UC-IMP145] Khi mua lại thành công: Người mua bị trừ đúng 130% giá gốc, Người bán nhận đủ 130% giá gốc (+30% lãi)', () => {
      const { mgr, room, human, opponent, reg, sm } = setupBuyoutRoom();
      reg.set(1, opponent.id);
      sm.set(1, { level: 0, isMortgaged: false });
      human.balance = 10_000;
      opponent.balance = 5_000;
      room.treasury = 2_000;

      room.pendingBuyout = {
        buyerId: human.id,
        sellerId: opponent.id,
        cellIndex: 1,
        cost: 780,
        basePrice: 600,
        createdAt: Date.now(),
        expiresAt: Date.now() + 15_000,
      };

      coordExecuteCompulsoryBuyout(mgr.getContext(room.roomCode), human.id, 1);

      expect(human.balance).toBe(10_000 - 780);
      expect(opponent.balance).toBe(5_000 + 780);
      expect(room.treasury).toBe(2_000);
    });

    it('[TC-145.07/MSS][UC-IMP145] Khi Người chơi rút thẻ và đủ tiền: Hệ thống tạo phiên pendingBuyout (15s) hiển thị lựa chọn cho người chơi, KHÔNG tự ý trừ tiền đổi đất ngầm', () => {
      const { room, human, opponent, reg, sm } = setupBuyoutRoom();
      reg.set(1, opponent.id);
      sm.set(1, { level: 0, isMortgaged: false });
      human.balance = 10_000;
      opponent.balance = 5_000;

      executeChanceCard(
        ChanceCardId.CC_SWAP_PROJECT,
        human.id,
        room.players,
        room.activeModifiers,
        reg,
        sm,
        undefined,
        room,
      );

      expect(room.pendingBuyout).toBeDefined();
      expect(room.pendingBuyout?.cellIndex).toBe(1);
      expect(human.balance).toBe(10_000);
      expect(reg.get(1)).toBe(opponent.id);
    });

    it('[TC-145.08/MSS][UC-IMP145] Khi Người chơi bấm [BỎ QUA] (coordDeclineCompulsoryBuyout): Tiền và đất của cả 2 bên giữ nguyên 100%', () => {
      const { mgr, room, human, opponent, reg } = setupBuyoutRoom();
      reg.set(1, opponent.id);
      human.balance = 10_000;
      opponent.balance = 5_000;

      room.pendingBuyout = {
        buyerId: human.id,
        sellerId: opponent.id,
        cellIndex: 1,
        cost: 780,
        basePrice: 600,
        createdAt: Date.now(),
        expiresAt: Date.now() + 15_000,
      };

      const res = coordDeclineCompulsoryBuyout(mgr.getContext(room.roomCode), human.id);

      expect(res.success).toBe(true);
      expect(human.balance).toBe(10_000);
      expect(opponent.balance).toBe(5_000);
      expect(reg.get(1)).toBe(opponent.id);
    });

    it('[TC-145.09/MSS][UC-IMP145] Khi Người chơi bấm [MUA LẠI] (coordExecuteCompulsoryBuyout): Tiền được chuyển, ô đất đổi chủ trong registry', () => {
      const { mgr, room, human, opponent, reg } = setupBuyoutRoom();
      reg.set(1, opponent.id);
      human.balance = 10_000;
      opponent.balance = 5_000;

      room.pendingBuyout = {
        buyerId: human.id,
        sellerId: opponent.id,
        cellIndex: 1,
        cost: 780,
        basePrice: 600,
        createdAt: Date.now(),
        expiresAt: Date.now() + 15_000,
      };

      const res = coordExecuteCompulsoryBuyout(mgr.getContext(room.roomCode), human.id, 1);

      expect(res.success).toBe(true);
      expect(human.balance).toBe(9_220);
      expect(opponent.balance).toBe(5_780);
      expect(reg.get(1)).toBe(human.id);
    });

    it('[TC-145.10/MSS][UC-IMP145] Khi Bot rút thẻ và đủ tiền (>= 130% + safetyBuffer): Mua lại thành công, người chơi bị mua nhận đủ 130% tiền mặt', () => {
      const { room, human, opponent: bot, reg, sm } = setupBuyoutRoom();
      reg.set(1, human.id);
      sm.set(1, { level: 0, isMortgaged: false });
      bot.balance = 15_000;
      human.balance = 5_000;

      // Bot có số dư 15.000 >= 780 + 1.000 (safetyBuffer) -> Tự động mua lại thành công
      executeChanceCard(
        ChanceCardId.CC_SWAP_PROJECT,
        bot.id,
        room.players,
        room.activeModifiers,
        reg,
        sm,
        undefined,
        room,
      );

      expect(bot.balance).toBe(15_000 - 780);
      expect(human.balance).toBe(5_000 + 780);
      expect(reg.get(1)).toBe(bot.id);
      expect(room.pendingBuyout).toBeNull();
    });
  });

  // =========================================================================
  // FACET 3: Disposal & Timeout
  // =========================================================================
  describe('Facet 3: Disposal & Timeout', () => {
    it('[TC-145.11/MSS][UC-IMP145] Hết 15s timeout: Hệ thống tự động hủy phiên mua lại, tiền và đất giữ nguyên', () => {
      const { mgr, room, human, opponent, reg } = setupBuyoutRoom();
      reg.set(1, opponent.id);
      human.balance = 10_000;
      opponent.balance = 5_000;

      room.pendingBuyout = {
        buyerId: human.id,
        sellerId: opponent.id,
        cellIndex: 1,
        cost: 780,
        basePrice: 600,
        createdAt: 1000,
        expiresAt: 16_000,
      };

      const timeoutRes = mgr.checkPendingBuyoutTimeout(room.roomCode, 16_001);

      expect(timeoutRes.timeout).toBe(true);
      expect(room.pendingBuyout).toBeNull();
      expect(human.balance).toBe(10_000);
      expect(reg.get(1)).toBe(opponent.id);
    });

    it('[TC-145.12/MSS][UC-IMP145] Sau khi xử lý mua lại hoặc bỏ qua, room.pendingBuyout được dọn dẹp sạch sẽ về null', () => {
      const { mgr, room, human, opponent, reg } = setupBuyoutRoom();
      reg.set(1, opponent.id);

      room.pendingBuyout = {
        buyerId: human.id,
        sellerId: opponent.id,
        cellIndex: 1,
        cost: 780,
        basePrice: 600,
        createdAt: Date.now(),
        expiresAt: Date.now() + 15_000,
      };

      coordDeclineCompulsoryBuyout(mgr.getContext(room.roomCode), human.id);

      expect(room.pendingBuyout).toBeNull();
    });

    it('[TC-145.13/MSS][UC-IMP145] FSM duy trì pha TurnPhase.PropertyManagement sau khi phiên kết thúc để người chơi tiếp tục lượt', () => {
      const { mgr, room, human, opponent, reg } = setupBuyoutRoom();
      reg.set(1, opponent.id);
      room.phase = TurnPhase.PropertyManagement;

      room.pendingBuyout = {
        buyerId: human.id,
        sellerId: opponent.id,
        cellIndex: 1,
        cost: 780,
        basePrice: 600,
        createdAt: Date.now(),
        expiresAt: Date.now() + 15_000,
      };

      coordDeclineCompulsoryBuyout(mgr.getContext(room.roomCode), human.id);

      expect(room.phase).toBe(TurnPhase.PropertyManagement);
    });
  });

  // =========================================================================
  // FACET 4: Error Defense & Fallbacks
  // =========================================================================
  describe('Facet 4: Error Defense & Fallbacks', () => {
    it('[TC-145.14/MSS][UC-IMP145] Khi người rút không đủ tiền (< 130% giá đất): Không kích hoạt mua lại, tự động nhận trợ cấp +800 Tr. từ Kho Bạc (không bị âm tiền)', () => {
      const { mgr, room, human, opponent, reg, sm } = setupBuyoutRoom();
      reg.set(1, opponent.id);
      sm.set(1, { level: 0, isMortgaged: false });
      human.balance = 500; // Cần 780 Tr., chỉ có 500 Tr. -> không đủ
      room.treasury = 3_000;

      executeChanceCard(
        ChanceCardId.CC_SWAP_PROJECT,
        human.id,
        room.players,
        room.activeModifiers,
        reg,
        sm,
        undefined,
        room,
      );

      expect(mgr.hasPendingBuyout(room.roomCode)).toBe(false);
      expect(human.balance).toBe(500 + 800);
      expect(room.treasury).toBe(3_000 - 800);
      expect(reg.get(1)).toBe(opponent.id);
    });

    it('[TC-145.15/MSS][UC-IMP145] Khi đối thủ không có ô C0 hợp lệ nào: Nhận trợ cấp quy hoạch +1.000 Tr. từ Kho Bạc', () => {
      const { room, human, opponent, reg, sm } = setupBuyoutRoom();
      // Đối thủ chỉ sở hữu ô độc quyền (1 & 3) nên không ô nào hợp lệ để mua lại
      reg.set(1, opponent.id);
      sm.set(1, { level: 0, isMortgaged: false });
      reg.set(3, opponent.id);
      sm.set(3, { level: 0, isMortgaged: false });

      human.balance = 10_000;
      room.treasury = 5_000;

      executeChanceCard(
        ChanceCardId.CC_SWAP_PROJECT,
        human.id,
        room.players,
        room.activeModifiers,
        reg,
        sm,
        undefined,
        room,
      );

      expect(human.balance).toBe(10_000 + 1000);
      expect(room.treasury).toBe(5_000 - 1000);
      expect(reg.get(1)).toBe(opponent.id);
    });

    it('[TC-145.16/MSS][UC-IMP145] Bot pacing freeze: roomManager.hasPendingBuyout(roomCode) trả về true khi phiên đang mở, ngăn bot tự kết thúc lượt', () => {
      const { mgr, room, human, opponent } = setupBuyoutRoom();

      room.pendingBuyout = {
        buyerId: human.id,
        sellerId: opponent.id,
        cellIndex: 1,
        cost: 780,
        basePrice: 600,
        createdAt: Date.now(),
        expiresAt: Date.now() + 15_000,
      };

      expect(mgr.hasPendingBuyout(room.roomCode)).toBe(true);

      room.pendingBuyout = null;
      expect(mgr.hasPendingBuyout(room.roomCode)).toBe(false);
    });
  });
});
