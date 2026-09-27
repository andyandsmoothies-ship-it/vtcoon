import { describe, it, expect } from 'vitest';
import { createRoom, createPlayer, TurnPhase, type Room, type Player, type MarketModifier } from '../../src/domain/room';
import { handleLanding } from '../../src/domain/property_manager';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_data';
import { calcUtilityFee, calculateElectricBill } from '../../src/domain/property_rent';
import { CellType } from '../../src/domain/board_config';
import { MarketCardId, ChanceCardId } from '../../src/domain/event_card_types';
import { executeTurnRoll } from '../../src/server/turn_loop';
import { handleSpecialCell } from '../../src/server/special_cell_handler';

function mockDiceRng(die1: number, die2: number): () => number {
  let count = 0;
  return () => {
    count++;
    return count % 2 === 1 ? (die1 - 1) / 6 + 0.01 : (die2 - 1) / 6 + 0.01;
  };
}

describe('[TC-IMP214/CONTRACT][UC-GAME-020] IMP-214 Utility Mechanics Revamp Contract Suite', () => {
  describe('Facet 1: Phí dừng chân phẳng bỏ xúc xắc 2D6 ([TC-IMP214.01] - [TC-IMP214.04])', () => {
    it('[TC-IMP214.01/MSS][UC-GAME-020] Phí dừng chân phẳng 1.000 Tr. khi sở hữu 1 tiện ích bất kể xúc xắc là 2 hay 12', () => {
      const landlord = createPlayer('landlord_evn');
      const tenant = createPlayer('tenant_visitor');
      const registry: PropertyRegistry = new Map([[12, landlord.id]]);
      const stateMap: PropertyStateMap = new Map();

      expect(calcUtilityFee(landlord.id, 2, registry)).toBe(1_000);
      expect(calcUtilityFee(landlord.id, 12, registry)).toBe(1_000);

      const res = handleLanding(tenant, 12, registry, [landlord, tenant], stateMap, 2);
      expect(res.rentAmount).toBe(1_000);
    });

    it('[TC-IMP214.02/MSS][UC-GAME-020] Phí dừng chân phẳng 2.500 Tr. khi sở hữu trọn bộ 2 tiện ích (EVN + Viettel)', () => {
      const landlord = createPlayer('landlord_monopoly_util');
      const tenant = createPlayer('tenant_visitor');
      const registry: PropertyRegistry = new Map([
        [12, landlord.id],
        [28, landlord.id],
      ]);
      const stateMap: PropertyStateMap = new Map();

      expect(calcUtilityFee(landlord.id, 7, registry)).toBe(2_500);

      const res = handleLanding(tenant, 12, registry, [landlord, tenant], stateMap, 7);
      expect(res.rentAmount).toBe(2_500);
    });

    it('[TC-IMP214.03/MSS][UC-GAME-020] Phí dừng chân phẳng 3.500 Tr. khi tiện ích đã nâng cấp Smart Grid hoặc 5G (isUpgradedUtility)', () => {
      const landlord = createPlayer('landlord_smart_grid');
      const tenant = createPlayer('tenant_visitor');
      const registry: PropertyRegistry = new Map([[12, landlord.id]]);
      const stateMap: PropertyStateMap = new Map([[12, { level: 0, isUpgradedUtility: true }]]);

      expect(calcUtilityFee(landlord.id, 7, registry, stateMap, 12)).toBe(3_500);

      const res = handleLanding(tenant, 12, registry, [landlord, tenant], stateMap, 7);
      expect(res.rentAmount).toBe(3_500);
    });

    it('[TC-IMP214.04/MSS][UC-GAME-020] Thẻ MC_UTILITY_DOUBLE nhân đôi phí phẳng thành 2.000 Tr. (1 trạm) và 5.000 Tr. (2 trạm)', () => {
      const landlord = createPlayer('landlord_util_double');
      const tenant = createPlayer('tenant_visitor');
      const registry: PropertyRegistry = new Map([[12, landlord.id]]);
      const stateMap: PropertyStateMap = new Map();
      const modifiers: MarketModifier[] = [
        { type: MarketCardId.MC_UTILITY_DOUBLE, remainingRounds: 2, affectedCells: [12, 28] },
      ];

      const resSingle = handleLanding(tenant, 12, registry, [landlord, tenant], stateMap, 8, modifiers);
      expect(resSingle.rentAmount).toBe(2_000);

      registry.set(28, landlord.id);
      const resDouble = handleLanding(tenant, 12, registry, [landlord, tenant], stateMap, 8, modifiers);
      expect(resDouble.rentAmount).toBe(5_000);
    });
  });

  describe('Facet 2: Hóa đơn tiền điện EVN khi qua GO ([TC-IMP214.05] - [TC-IMP214.08])', () => {
    it('[TC-IMP214.05/MSS][UC-GAME-020] Đối thủ sở hữu 1 nhà C1: qua GO nộp 100 Tr. tiền điện chuyển cho chủ EVN', () => {
      const room = createRoom('host_evn_owner');
      room.started = true;
      room.roundCount = 1;
      const evnOwner = room.players[0]!;
      evnOwner.balance = 5_000;

      const opponent = createPlayer('opponent_c1');
      opponent.balance = 5_000;
      opponent.position = 38;
      room.players.push(opponent);

      const registry: PropertyRegistry = new Map([
        [12, evnOwner.id],
        [1, opponent.id],
      ]);
      const stateMap: PropertyStateMap = new Map([[1, { level: 1 }]]);
      const rolledThisTurn = new Map<string, boolean>();
      const rng = mockDiceRng(1, 1); // dice total = 2 (lands on 0, GO)
      const deckRng = () => 0.5;

      expect(calculateElectricBill(opponent.id, registry, stateMap)).toBe(100);

      executeTurnRoll(room, opponent, registry, stateMap, rng, deckRng, rolledThisTurn, room.roomCode);

      expect(opponent.balance).toBe(5_000 + 2_000 - 100);
      expect(evnOwner.balance).toBe(5_000 + 100);
    });

    it('[TC-IMP214.06/MSS][UC-GAME-020] Đối thủ sở hữu 2 nhà C2 và 1 nhà C3: qua GO nộp 700 Tr. cho chủ EVN', () => {
      const room = createRoom('host_evn_owner_heavy');
      room.started = true;
      room.roundCount = 1;
      const evnOwner = room.players[0]!;
      evnOwner.balance = 10_000;

      const opponent = createPlayer('opponent_heavy_buildings');
      opponent.balance = 10_000;
      opponent.position = 38;
      room.players.push(opponent);

      const registry: PropertyRegistry = new Map([
        [12, evnOwner.id],
        [1, opponent.id],
        [3, opponent.id],
        [6, opponent.id],
      ]);
      const stateMap: PropertyStateMap = new Map([
        [1, { level: 2 }],
        [3, { level: 2 }],
        [6, { level: 3 }],
      ]);
      const rolledThisTurn = new Map<string, boolean>();
      const rng = mockDiceRng(1, 1);
      const deckRng = () => 0.5;

      expect(calculateElectricBill(opponent.id, registry, stateMap)).toBe(700);

      executeTurnRoll(room, opponent, registry, stateMap, rng, deckRng, rolledThisTurn, room.roomCode);

      expect(opponent.balance).toBe(10_000 + 2_000 - 700);
      expect(evnOwner.balance).toBe(10_000 + 700);
    });

    it('[TC-IMP214.07/MSS][UC-GAME-020] Đối thủ chỉ sở hữu ô C0 đất trống: tiền điện = 0 Tr. (Level-0 Unbuilt Exemption)', () => {
      const room = createRoom('host_evn_owner_unbuilt');
      room.started = true;
      room.roundCount = 1;
      const evnOwner = room.players[0]!;
      evnOwner.balance = 5_000;

      const opponent = createPlayer('opponent_unbuilt');
      opponent.balance = 5_000;
      opponent.position = 38;
      room.players.push(opponent);

      const registry: PropertyRegistry = new Map([
        [12, evnOwner.id],
        [1, opponent.id],
        [3, opponent.id],
      ]);
      const stateMap: PropertyStateMap = new Map([
        [1, { level: 0 }],
        [3, { level: 0 }],
      ]);
      const rolledThisTurn = new Map<string, boolean>();
      const rng = mockDiceRng(1, 1);
      const deckRng = () => 0.5;

      expect(calculateElectricBill(opponent.id, registry, stateMap)).toBe(0);

      executeTurnRoll(room, opponent, registry, stateMap, rng, deckRng, rolledThisTurn, room.roomCode);

      expect(opponent.balance).toBe(5_000 + 2_000);
      expect(evnOwner.balance).toBe(5_000);
    });

    it('[TC-IMP214.08/MSS][UC-GAME-020] Tiền điện EVN trừ cùng lúc với lương GO và thuế tài sản mà không gây race condition', () => {
      const room = createRoom('host_evn_tax_room');
      room.started = true;
      room.roundCount = 1;
      room.treasury = 1_000;
      const evnOwner = room.players[0]!;
      evnOwner.balance = 5_000;

      const opponent = createPlayer('opponent_taxable');
      opponent.balance = 5_000;
      opponent.position = 38;
      room.players.push(opponent);

      const registry: PropertyRegistry = new Map([
        [12, evnOwner.id],
        [1, opponent.id],
        [3, opponent.id],
        [6, opponent.id],
        [8, opponent.id],
      ]);
      const stateMap: PropertyStateMap = new Map([[1, { level: 1 }]]); // 1 C1 (100) + 3 C0 (0), total 4 properties = 600 tax
      const rolledThisTurn = new Map<string, boolean>();
      const rng = mockDiceRng(1, 1);
      const deckRng = () => 0.5;

      executeTurnRoll(room, opponent, registry, stateMap, rng, deckRng, rolledThisTurn, room.roomCode);

      expect(opponent.balance).toBe(5_000 + 2_000 - 600 - 100);
      expect(evnOwner.balance).toBe(5_000 + 100);
      expect(room.treasury).toBe(1_000 + 600);
    });
  });

  describe('Facet 3: Cước viễn thông Viettel khi rút thẻ sự kiện ([TC-IMP214.09] - [TC-IMP214.12])', () => {
    it('[TC-IMP214.09/MSS][UC-GAME-020] Dừng chân tại ô Thị Trường (Market): trừ 150 Tr. cước data chuyển cho chủ Viettel', () => {
      const room = createRoom('host_viettel_market');
      room.started = true;
      const viettelOwner = room.players[0]!;
      viettelOwner.balance = 5_000;

      const visitor = createPlayer('visitor_market');
      visitor.balance = 5_000;
      room.players.push(visitor);

      const registry: PropertyRegistry = new Map([[28, viettelOwner.id]]);
      const stateMap: PropertyStateMap = new Map();
      room.marketDeck = [MarketCardId.MC_PEAK_TOURISM];
      const deckRng = () => 0.5;

      handleSpecialCell(room, visitor, CellType.Market, registry, stateMap, deckRng);

      expect(visitor.balance).toBe(5_000 - 150);
      expect(viettelOwner.balance).toBe(5_000 + 150);
    });

    it('[TC-IMP214.10/MSS][UC-GAME-020] Dừng chân tại ô Cơ Hội (Chance): trừ 150 Tr. cước data chuyển cho chủ Viettel', () => {
      const room = createRoom('host_viettel_chance');
      room.started = true;
      const viettelOwner = room.players[0]!;
      viettelOwner.balance = 5_000;

      const visitor = createPlayer('visitor_chance');
      visitor.balance = 5_000;
      room.players.push(visitor);

      const registry: PropertyRegistry = new Map([[28, viettelOwner.id]]);
      const stateMap: PropertyStateMap = new Map();
      room.chanceDeck = [ChanceCardId.CC_DIPLOMATIC];
      const deckRng = () => 0.5;

      handleSpecialCell(room, visitor, CellType.Chance, registry, stateMap, deckRng);

      expect(visitor.balance).toBe(5_000 - 150);
      expect(viettelOwner.balance).toBe(5_000 + 150);
    });

    it('[TC-IMP214.11/MSS][UC-GAME-020] Dừng chân tại các ô đặc biệt khác (FreeParking, Tax, Audit, Hose): không trừ cước Viettel', () => {
      const room = createRoom('host_viettel_other_cells');
      room.started = true;
      const viettelOwner = room.players[0]!;
      viettelOwner.balance = 5_000;

      const visitor = createPlayer('visitor_neutral');
      visitor.balance = 5_000;
      room.players.push(visitor);

      const registry: PropertyRegistry = new Map([[28, viettelOwner.id]]);
      const stateMap: PropertyStateMap = new Map();
      const deckRng = () => 0.5;

      // When landing on Market, telecom fee is charged
      room.marketDeck = [MarketCardId.MC_PEAK_TOURISM];
      handleSpecialCell(room, visitor, CellType.Market, registry, stateMap, deckRng);
      expect(visitor.balance).toBe(5_000 - 150);

      // When landing on FreeParking, no telecom fee is charged
      handleSpecialCell(room, visitor, CellType.FreeParking, registry, stateMap, deckRng);
      expect(visitor.balance).toBe(4_850);
      expect(viettelOwner.balance).toBe(5_000 + 150);
    });

    it('[TC-IMP214.12/MSS][UC-GAME-020] Cước Viettel kích hoạt trước khi bốc bài sự kiện (Pre-Draw Execution)', () => {
      const room = createRoom('host_viettel_predraw');
      room.started = true;
      const viettelOwner = room.players[0]!;
      viettelOwner.balance = 1_000;

      const visitor = createPlayer('visitor_tight_cash');
      visitor.balance = 200;
      room.players.push(visitor);

      const registry: PropertyRegistry = new Map([[28, viettelOwner.id]]);
      const stateMap: PropertyStateMap = new Map();
      room.marketDeck = [MarketCardId.MC_PEAK_TOURISM];
      const deckRng = () => 0.5;

      handleSpecialCell(room, visitor, CellType.Market, registry, stateMap, deckRng);

      expect(visitor.balance).toBe(200 - 150);
      expect(viettelOwner.balance).toBe(1_000 + 150);
    });
  });

  describe('Facet 4: Biên thế chấp, Kiểm toán & Tự cung tự cấp ([TC-IMP214.13] - [TC-IMP214.16])', () => {
    it('[TC-IMP214.13/MSS][UC-GAME-020] Chính chủ EVN qua GO có nhiều nhà C3: tiền điện = 0 (tự cung tự cấp)', () => {
      const room = createRoom('host_evn_self_billing');
      room.started = true;
      room.roundCount = 1;
      const evnOwner = room.players[0]!;
      evnOwner.balance = 5_000;
      evnOwner.position = 38;

      const registry: PropertyRegistry = new Map([
        [12, evnOwner.id],
        [1, evnOwner.id],
        [3, evnOwner.id],
      ]);
      const stateMap: PropertyStateMap = new Map([
        [1, { level: 3 }],
        [3, { level: 3 }],
      ]);
      const rolledThisTurn = new Map<string, boolean>();
      const rng = mockDiceRng(1, 1);
      const deckRng = () => 0.5;

      // Potential bill for 2 C3 properties is 600 Tr., but self is exempt
      expect(calculateElectricBill(evnOwner.id, registry, stateMap)).toBe(600);

      executeTurnRoll(room, evnOwner, registry, stateMap, rng, deckRng, rolledThisTurn, room.roomCode);

      expect(evnOwner.balance).toBe(5_000 + 2_000);
    });

    it('[TC-IMP214.14/MSS][UC-GAME-020] Chính chủ Viettel rút thẻ sự kiện: cước viễn thông = 0 (tự cung tự cấp)', () => {
      const room = createRoom('host_viettel_self_draw');
      room.started = true;
      const viettelOwner = room.players[0]!;
      viettelOwner.balance = 5_000;

      const visitor = createPlayer('visitor_data_client');
      visitor.balance = 5_000;
      room.players.push(visitor);

      const registry: PropertyRegistry = new Map([[28, viettelOwner.id]]);
      const stateMap: PropertyStateMap = new Map();
      room.marketDeck = [MarketCardId.MC_PEAK_TOURISM, MarketCardId.MC_PEAK_TOURISM];
      const deckRng = () => 0.5;

      // Visitor pays 150 Tr. data fee to Viettel owner
      handleSpecialCell(room, visitor, CellType.Market, registry, stateMap, deckRng);
      expect(visitor.balance).toBe(5_000 - 150);
      expect(viettelOwner.balance).toBe(5_000 + 150);

      // Viettel owner drawing own card pays 0 Tr. data fee
      handleSpecialCell(room, viettelOwner, CellType.Market, registry, stateMap, deckRng);
      expect(viettelOwner.balance).toBe(5_150);
    });

    it('[TC-IMP214.15/MSS][UC-GAME-020] EVN hoặc Viettel bị thế chấp theo owner.mortgagedProperties: đối thủ được miễn 100% tiền điện / cước viễn thông', () => {
      const room = createRoom('host_util_mortgaged');
      room.started = true;
      room.roundCount = 1;
      const landlord = room.players[0]!;
      landlord.balance = 5_000;

      const opponent = createPlayer('opponent_exempt_mortgage');
      opponent.balance = 5_000;
      opponent.position = 38;
      room.players.push(opponent);

      const registry: PropertyRegistry = new Map([
        [12, landlord.id],
        [28, landlord.id],
        [1, opponent.id],
      ]);
      const stateMap: PropertyStateMap = new Map([[1, { level: 2 }]]); // C2 -> 200 Tr. electric
      const rolledThisTurn = new Map<string, boolean>();
      const rng = mockDiceRng(1, 1);
      const deckRng = () => 0.5;

      // When unmortgaged, electric bill is 200 Tr.
      expect(calculateElectricBill(opponent.id, registry, stateMap)).toBe(200);

      // Landlord mortgages both utilities
      landlord.mortgagedProperties = [12, 28];

      // Opponent passes GO: 100% electric bill waived due to mortgaged EVN
      executeTurnRoll(room, opponent, registry, stateMap, rng, deckRng, rolledThisTurn, room.roomCode);
      expect(opponent.balance).toBe(5_000 + 2_000);

      // Opponent draws Market card: 100% telecom fee waived due to mortgaged Viettel
      room.marketDeck = [MarketCardId.MC_PEAK_TOURISM];
      handleSpecialCell(room, opponent, CellType.Market, registry, stateMap, deckRng);
      expect(opponent.balance).toBe(7_000);
    });

    it('[TC-IMP214.16/MSS][UC-GAME-020] Chủ sở hữu đang ở Trạm Kiểm Toán (inAudit hoặc auditTurnsLeft > 0): bị khóa thu tiền điện và cước viễn thông (Anti-Camping Guard)', () => {
      const room = createRoom('host_util_in_audit');
      room.started = true;
      room.roundCount = 1;
      const landlord = room.players[0]!;
      landlord.balance = 5_000;
      landlord.inAudit = true;
      landlord.auditTurnsLeft = 2;

      const opponent = createPlayer('opponent_audit_protected');
      opponent.balance = 5_000;
      opponent.position = 38;
      room.players.push(opponent);

      const registry: PropertyRegistry = new Map([
        [12, landlord.id],
        [28, landlord.id],
        [1, opponent.id],
      ]);
      const stateMap: PropertyStateMap = new Map([[1, { level: 2 }]]);
      const rolledThisTurn = new Map<string, boolean>();
      const rng = mockDiceRng(1, 1);
      const deckRng = () => 0.5;

      // Electric bill for C2 is 200 Tr.
      expect(calculateElectricBill(opponent.id, registry, stateMap)).toBe(200);

      // Audit lock blocks electric billing on GO
      executeTurnRoll(room, opponent, registry, stateMap, rng, deckRng, rolledThisTurn, room.roomCode);
      expect(opponent.balance).toBe(5_000 + 2_000);
      expect(landlord.balance).toBe(5_000);

      // Audit lock blocks telecom billing on Market card
      room.marketDeck = [MarketCardId.MC_PEAK_TOURISM];
      handleSpecialCell(room, opponent, CellType.Market, registry, stateMap, deckRng);
      expect(opponent.balance).toBe(7_000);
    });
  });

  describe('Facet 5: Bảo toàn dòng tiền & Xử lý mất thanh khoản ([TC-IMP214.17] - [TC-IMP214.18])', () => {
    it('[TC-IMP214.17/MSS][UC-GAME-020] Người chơi có tiền mặt ít hơn tiền điện: người nợ bị âm tiền, chủ EVN chỉ nhận số tiền mặt thực tế tối đa của con nợ (Non-inflationary Sink)', () => {
      const room = createRoom('host_evn_insolvent_sink');
      room.started = true;
      room.roundCount = 35; // round >= 31: salary = 1000
      const evnOwner = room.players[0]!;
      evnOwner.balance = 5_000;

      const debtor = createPlayer('debtor_cash_strapped');
      debtor.balance = 40;
      debtor.position = 38;
      room.players.push(debtor);

      // Debtor owns 7 properties: tax = min(400 * 7, 1000) = 1000 -> net salary = 1000 - 1000 = 0
      const registry: PropertyRegistry = new Map([
        [12, evnOwner.id],
        [1, debtor.id],
        [3, debtor.id],
        [6, debtor.id],
        [8, debtor.id],
        [9, debtor.id],
        [11, debtor.id],
        [13, debtor.id],
      ]);
      const stateMap: PropertyStateMap = new Map([[1, { level: 1 }]]); // 1 C1 (100 Tr.), rest C0
      const rolledThisTurn = new Map<string, boolean>();
      const rng = mockDiceRng(1, 1);
      const deckRng = () => 0.5;

      executeTurnRoll(room, debtor, registry, stateMap, rng, deckRng, rolledThisTurn, room.roomCode);

      expect(debtor.balance).toBe(40 - 100);
      expect(evnOwner.balance).toBe(5_000 + 40);
      expect(debtor.balance + evnOwner.balance - (40 + 5_000)).toBeLessThanOrEqual(0);
    });

    it('[TC-IMP214.18/MSS][UC-GAME-020] Người chơi đủ tiền thanh toán: Tổng tiền hệ thống được bảo toàn nguyên vẹn (Zero-sum delta)', () => {
      const room = createRoom('host_evn_zerosum');
      room.started = true;
      room.roundCount = 35; // salary = 1000
      const evnOwner = room.players[0]!;
      evnOwner.balance = 5_000;

      const debtor = createPlayer('debtor_solvent');
      debtor.balance = 5_000;
      debtor.position = 38;
      room.players.push(debtor);

      // Debtor owns 7 properties: tax = 1000, net salary = 0
      const registry: PropertyRegistry = new Map([
        [12, evnOwner.id],
        [1, debtor.id],
        [3, debtor.id],
        [6, debtor.id],
        [8, debtor.id],
        [9, debtor.id],
        [11, debtor.id],
        [13, debtor.id],
      ]);
      const stateMap: PropertyStateMap = new Map([[6, { level: 3 }]]); // 1 C3 (300 Tr.)
      const rolledThisTurn = new Map<string, boolean>();
      const rng = mockDiceRng(1, 1);
      const deckRng = () => 0.5;

      const preSystemTotal = debtor.balance + evnOwner.balance;

      executeTurnRoll(room, debtor, registry, stateMap, rng, deckRng, rolledThisTurn, room.roomCode);

      expect(debtor.balance).toBe(5_000 - 300);
      expect(evnOwner.balance).toBe(5_000 + 300);
      expect(debtor.balance + evnOwner.balance).toBe(preSystemTotal);
    });
  });
});
