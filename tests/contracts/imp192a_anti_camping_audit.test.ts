import { describe, it, expect } from 'vitest';
import { createRoom, createPlayer, TurnPhase, type Room, type Player } from '../../src/domain/room';
import { handleLanding, LandingResult } from '../../src/domain/property_manager';
import type { PropertyRegistry, PropertyStateMap, PropertyState } from '../../src/domain/property_data';
import { handleBailOut, handleAuditTurnTransition, sendToAudit } from '../../src/server/audit_manager';
import { RoomManager } from '../../src/server/room_manager';
import { executeTurnEnd } from '../../src/server/turn_loop';
import { ActionRejectReason } from '../../src/domain/action_reasons';

type DynamicBailOutFn = (room: Room | undefined, playerId: string, rolledThisTurn: boolean, registry?: PropertyRegistry, stateMap?: PropertyStateMap) => { success: boolean; reason?: string };
type DynamicAuditTurnTransitionFn = (room: Room, player: Player, registry?: PropertyRegistry, stateMap?: PropertyStateMap) => void;

const callBailOut: DynamicBailOutFn = handleBailOut;
const callAuditTurnTransition: DynamicAuditTurnTransitionFn = handleAuditTurnTransition;

describe('[TC-192A/MSS][UC-IMP192A] IMP-192A Anti-Camping Audit & Dynamic Bailout Contract', () => {
  describe('Failure Mode 1: Miễn 100% tiền thuê khi chủ đất đang ở Trạm Kiểm Toán', () => {
    it('[TC-192A.01/MSS][UC-IMP192A] handleLanding miễn 100% tiền thuê khi chủ đất có auditTurnsLeft = 3', () => {
      const landlord = Object.assign(createPlayer('player_landlord'), { balance: 10_000, auditTurnsLeft: 3, inAudit: true });
      const tenant = Object.assign(createPlayer('player_tenant'), { balance: 10_000, auditTurnsLeft: 0 });
      const registry: PropertyRegistry = new Map([[1, landlord.id]]);
      const res = handleLanding(tenant, 1, registry, [landlord, tenant]);
      expect(res.result).toBe(LandingResult.RentPaid);
      expect(res.rentAmount).toBe(0);
      expect(tenant.balance).toBe(10_000);
      expect(landlord.balance).toBe(10_000);
    });

    it('[TC-192A.02/MSS][UC-IMP192A] handleLanding miễn 100% tiền thuê khi chủ đất có auditTurnsLeft = 1 tại ô đất cấp 3', () => {
      const landlord = Object.assign(createPlayer('player_landlord'), { balance: 15_000, auditTurnsLeft: 1 });
      const tenant = Object.assign(createPlayer('player_tenant'), { balance: 20_000, auditTurnsLeft: 0 });
      const registry: PropertyRegistry = new Map([[39, landlord.id]]);
      const stateMap: PropertyStateMap = new Map([[39, { level: 3 }]]);
      const res = handleLanding(tenant, 39, registry, [landlord, tenant], stateMap);
      expect(res.rentAmount).toBe(0);
      expect(tenant.balance).toBe(20_000);
      expect(landlord.balance).toBe(15_000);
    });

    it('[TC-192A.03/MSS][UC-IMP192A] handleLanding miễn 100% tiền thuê khi chủ đất có cờ inAudit = true', () => {
      const landlord = Object.assign(createPlayer('player_landlord'), { balance: 12_000, inAudit: true, auditTurnsLeft: 0 });
      const tenant = Object.assign(createPlayer('player_tenant'), { balance: 8_000 });
      const res = handleLanding(tenant, 6, new Map([[6, landlord.id]]), [landlord, tenant]);
      expect(res.rentAmount).toBe(0);
      expect(tenant.balance).toBe(8_000);
    });
  });

  describe('Failure Mode 2: Thu tiền thuê bình thường khi chủ đất đã ra tù', () => {
    it('[TC-192A.04/MSS][UC-IMP192A] handleLanding thu tiền thuê bình thường khi chủ đất đã mãn hạn kiểm toán', () => {
      const landlord = Object.assign(createPlayer('player_landlord'), { balance: 10_000, auditTurnsLeft: 0, inAudit: false });
      const tenant = Object.assign(createPlayer('player_tenant'), { balance: 10_000 });
      const res = handleLanding(tenant, 1, new Map([[1, landlord.id]]), [landlord, tenant]);
      expect(res.result).toBe(LandingResult.RentPaid);
      expect(res.rentAmount).toBe(60);
      expect(tenant.balance).toBe(10_000 - 60);
      expect(landlord.balance).toBe(10_000 + 60);
    });

    it('[TC-192A.05/MSS][UC-IMP192A] handleLanding thu đủ tiền thuê nâng cấp khi chủ đất chưa từng vào tù', () => {
      const landlord = Object.assign(createPlayer('player_landlord'), { balance: 20_000, auditTurnsLeft: 0 });
      const tenant = Object.assign(createPlayer('player_tenant'), { balance: 15_000 });
      const res = handleLanding(tenant, 1, new Map([[1, landlord.id]]), [landlord, tenant], new Map([[1, { level: 2 }]]));
      expect(res.rentAmount).toBe(540);
      expect(tenant.balance).toBe(15_000 - 540);
      expect(landlord.balance).toBe(20_000 + 540);
    });
  });

  describe('Failure Mode 3: handleBailOut tính phí 10% Net Worth nộp Kho Bạc', () => {
    it('[TC-192A.06/MSS][UC-IMP192A] handleBailOut áp dụng mức sàn 500 Tr. khi 10% Net Worth nhỏ hơn 500 Tr.', () => {
      const room = Object.assign(createRoom('player_poor'), { started: true, treasury: 1_000 });
      const player = Object.assign(room.players[0]!, { balance: 2_000, auditTurnsLeft: 2 });
      const res = callBailOut(room, player.id, false, new Map(), new Map());
      expect(res.success).toBe(true);
      expect(player.balance).toBe(1_500);
      expect(room.treasury).toBe(1_500);
      expect(player.auditTurnsLeft).toBe(0);
    });

    it('[TC-192A.07/MSS][UC-IMP192A] handleBailOut tính phí bảo lãnh động 10% Net Worth cho tài phiệt sở hữu BĐS', () => {
      const room = Object.assign(createRoom('player_tycoon'), { started: true, treasury: 500 });
      const player = Object.assign(room.players[0]!, { balance: 5_000, auditTurnsLeft: 3 });
      const res = callBailOut(room, player.id, false, new Map([[39, player.id]]), new Map([[39, { level: 2 }]]));
      expect(res.success).toBe(true);
      expect(player.balance).toBe(5_000 - 1_500);
      expect(room.treasury).toBe(500 + 1_500);
      expect(player.auditTurnsLeft).toBe(0);
    });

    it('[TC-192A.08/MSS][UC-IMP192A] RoomManager.handleBailOut ủy quyền tính đúng 10% Net Worth và nộp vào room.treasury', () => {
      const mgr = new RoomManager(42);
      const room = mgr.createRoom('player_mgr_tycoon');
      mgr.joinRoom(room.roomCode, 'player_tenant');
      mgr.startGame(room.roomCode);
      const p1 = room.players[0]!;
      p1.position = 39;
      room.phase = TurnPhase.ActionPhase;
      mgr.handleBuyProperty(room.roomCode, p1.id);
      sendToAudit(room, p1.id);
      room.phase = TurnPhase.WaitingRoll;
      const preTreasury = room.treasury ?? 0;
      const expectedBail = Math.floor(25_000 * 0.10);
      const res = mgr.handleBailOut(room.roomCode, p1.id);
      expect(res.success).toBe(true);
      expect(p1.balance).toBe(21_000 - expectedBail);
      expect(room.treasury).toBe(preTreasury + expectedBail);
      expect(p1.auditTurnsLeft).toBe(0);
    });
  });

  describe('Failure Mode 4: handleBailOut từ chối vi phạm điều kiện tiền hoặc trạng thái', () => {
    it('[TC-192A.09/MSS][UC-IMP192A] handleBailOut từ chối khi tài phiệt không đủ tiền mặt trả 10% Net Worth', () => {
      const room = Object.assign(createRoom('player_cash_poor_tycoon'), { started: true, treasury: 0 });
      const player = Object.assign(room.players[0]!, { balance: 800, auditTurnsLeft: 2 });
      const res = callBailOut(room, player.id, false, new Map([[39, player.id]]), new Map([[39, { level: 3 }]]));
      expect(res.success).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.INSUFFICIENT_FUNDS);
      expect(player.balance).toBe(800);
      expect(player.auditTurnsLeft).toBe(2);
    });

    it('[TC-192A.10/MSS][UC-IMP192A] handleBailOut từ chối và không trừ tiền khi người chơi không ở trong tù', () => {
      const room = Object.assign(createRoom('player_free'), { started: true, treasury: 500 });
      const player = Object.assign(room.players[0]!, { auditTurnsLeft: 0, inAudit: false, balance: 10_000 });
      const res = callBailOut(room, player.id, false, new Map(), new Map());
      expect(res.success).toBe(false);
      expect(res.reason).toBe('NOT_IN_AUDIT');
      expect(player.balance).toBe(10_000);
      expect(room.treasury).toBe(500);
    });
  });

  describe('Failure Mode 5: handleAuditTurnTransition mãn hạn tự nhiên phạt 10% Net Worth nộp Kho Bạc', () => {
    it('[TC-192A.11/MSS][UC-IMP192A] handleAuditTurnTransition giảm lượt tù từ 2 về 1 không trừ tiền phạt và không tăng Kho Bạc', () => {
      const room = Object.assign(createRoom('player_in_term'), { treasury: 200 });
      const player = Object.assign(room.players[0]!, { auditTurnsLeft: 2, balance: 15_000 });
      callAuditTurnTransition(room, player, new Map(), new Map());
      expect(player.auditTurnsLeft).toBe(1);
      expect(player.balance).toBe(15_000);
      expect(room.treasury).toBe(200);
    });

    it('[TC-192A.12/MSS][UC-IMP192A] handleAuditTurnTransition khi mãn hạn tự nhiên phạt sàn 500 Tr. nếu 10% Net Worth < 500 Tr.', () => {
      const room = Object.assign(createRoom('player_poor_release'), { treasury: 100 });
      const player = Object.assign(room.players[0]!, { balance: 3_000, auditTurnsLeft: 1 });
      callAuditTurnTransition(room, player, new Map(), new Map());
      expect(player.auditTurnsLeft).toBe(0);
      expect(player.balance).toBe(2_500);
      expect(room.treasury).toBe(600);
    });

    it('[TC-192A.13/MSS][UC-IMP192A] handleAuditTurnTransition khi mãn hạn tự nhiên phạt 10% Net Worth đối với tài phiệt BĐS', () => {
      const room = Object.assign(createRoom('player_tycoon_release'), { treasury: 1_000 });
      const player = Object.assign(room.players[0]!, { balance: 10_000, auditTurnsLeft: 1 });
      const registry: PropertyRegistry = new Map([[31, player.id], [32, player.id]]);
      const stateMap: PropertyStateMap = new Map([[31, { level: 1 }], [32, { level: 1 }]]);
      callAuditTurnTransition(room, player, registry, stateMap);
      expect(player.auditTurnsLeft).toBe(0);
      expect(player.balance).toBe(10_000 - 1_900);
      expect(room.treasury).toBe(1_000 + 1_900);
    });
  });

  describe('Failure Mode 6: Xử lý âm tiền khi mãn hạn tự nhiên & Bảo toàn Kho Bạc', () => {
    it('[TC-192A.14/MSS][UC-IMP192A] handleAuditTurnTransition khi tiền mặt nhỏ hơn phạt sàn 500 Tr. làm số dư âm và nộp đủ Kho Bạc', () => {
      const room = Object.assign(createRoom('player_broke'), { treasury: 500 });
      const player = Object.assign(room.players[0]!, { balance: 200, auditTurnsLeft: 1 });
      callAuditTurnTransition(room, player, new Map(), new Map());
      expect(player.auditTurnsLeft).toBe(0);
      expect(player.balance).toBe(-300);
      expect(room.treasury).toBe(1_000);
    });

    it('[TC-192A.15/MSS][UC-IMP192A] executeTurnEnd khi mãn hạn tự nhiên làm âm số dư kích hoạt checkInsolvency chuyển phase sang InsolvencyPhase', () => {
      const room = Object.assign(createRoom('player_tycoon_insolvent'), { started: true, phase: TurnPhase.PropertyManagement });
      const player = Object.assign(room.players[0]!, { balance: 800, auditTurnsLeft: 1 });
      const registry: PropertyRegistry = new Map([[39, player.id]]);
      const stateMap: PropertyStateMap = new Map([[39, { level: 2 }]]);
      executeTurnEnd(room, player, true, false, room.roomCode, new Map(), registry, stateMap);
      expect(player.balance).toBe(800 - 1_080);
      expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
    });

    it('[TC-192A.16/MSS][UC-IMP192A] handleAuditTurnTransition bảo toàn tuyệt đối tổng tiền lưu thông giữa người chơi và Kho Bạc', () => {
      const room = Object.assign(createRoom('player_audit_conserve'), { treasury: 2_000 });
      const p1 = Object.assign(room.players[0]!, { balance: 6_000, auditTurnsLeft: 1 });
      const p2 = Object.assign(createPlayer('player_bystander'), { balance: 8_000 });
      room.players.push(p2);
      const registry: PropertyRegistry = new Map([[39, p1.id]]);
      const stateMap: PropertyStateMap = new Map([[39, { level: 2, isMortgaged: false }] as [number, PropertyState]]);
      const preTotal = p1.balance + p2.balance + (room.treasury ?? 0);
      callAuditTurnTransition(room, p1, registry, stateMap);
      const postTotal = p1.balance + p2.balance + (room.treasury ?? 0);
      expect(postTotal).toBe(preTotal);
      expect(postTotal - preTotal).toBe(0);
      expect(p1.balance).toBe(6_000 - 1_600);
      expect(room.treasury).toBe(2_000 + 1_600);
    });
  });
});
