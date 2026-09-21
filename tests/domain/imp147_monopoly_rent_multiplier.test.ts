// [TC-147][UC-IMP-147] Contract Tests: Cân Bằng Hệ Số Cước Độc Quyền x1.5 cho C3 & Tính Quyết Đoán Ván Đấu
// SSOT: docs/plans/improvements/IMP-147-monopoly-rent-multiplier-and-pacing_plan.md
import { describe, it, expect } from 'vitest';
import { BOARD_CONFIG } from '../../src/domain/board_config';
import {
  PROPERTY_DEEDS,
  RAILROAD_CELLS,
  UTILITY_CELLS,
  type PropertyRegistry,
  type PropertyStateMap,
} from '../../src/domain/property_data';
import { resolveRent } from '../../src/domain/property_rent';
import { calculateThreatHorizon } from '../../src/domain/bot/threat_forecaster';
import { BotPersonality, DEFAULT_MIN_SAFETY_BUFFER } from '../../src/domain/bot/bot_types';
import { createPlayer, createRoom } from '../../src/domain/room';

describe('[TC-147][UC-IMP-147] Cân Bằng Hệ Số Cước Độc Quyền x1.5 cho C3 & Pacing Contract Suite', () => {
  const OWNER_ID = 'player_monopoly_king';
  const OPPONENT_ID = 'player_rival';

  // ==========================================================================
  // FACET 1: Boundary & Range — 8 Color Groups C3 Monopoly x1.5 Multiplier
  // ==========================================================================
  describe('Facet 1: Boundary & Range — 8 Color Groups C3 Monopoly x1.5', () => {
    it('[TC-147.01/MSS][UC-IMP-147] Ô 1 Nâu (Cần Thơ) C3: deed.rent3 = 1320 -> khi có monopoly cước = 1980 Tr.', () => {
      const registry: PropertyRegistry = new Map([
        [1, OWNER_ID],
        [3, OWNER_ID],
      ]);
      const stateMap: PropertyStateMap = new Map([
        [1, { level: 3 }],
        [3, { level: 0 }],
      ]);

      const rent = resolveRent(BOARD_CONFIG[1], 1, OWNER_ID, registry, stateMap);
      expect(rent).toBe(1980);
    });

    it('[TC-147.02/MSS][UC-IMP-147] Ô 6 Xanh Da Trời (Bình Dương) C3: deed.rent3 = 2500 -> khi có monopoly cước = 3750 Tr.', () => {
      const registry: PropertyRegistry = new Map([
        [6, OWNER_ID],
        [8, OWNER_ID],
        [9, OWNER_ID],
      ]);
      const stateMap: PropertyStateMap = new Map([
        [6, { level: 3 }],
        [8, { level: 0 }],
        [9, { level: 0 }],
      ]);

      const rent = resolveRent(BOARD_CONFIG[6], 6, OWNER_ID, registry, stateMap);
      expect(rent).toBe(3750);
    });

    it('[TC-147.03/MSS][UC-IMP-147] Ô 9 Xanh Da Trời (Vũng Tàu) C3: deed.rent3 = 3000 -> khi có monopoly cước = 4500 Tr.', () => {
      const registry: PropertyRegistry = new Map([
        [6, OWNER_ID],
        [8, OWNER_ID],
        [9, OWNER_ID],
      ]);
      const stateMap: PropertyStateMap = new Map([
        [6, { level: 0 }],
        [8, { level: 0 }],
        [9, { level: 3 }],
      ]);

      const rent = resolveRent(BOARD_CONFIG[9], 9, OWNER_ID, registry, stateMap);
      expect(rent).toBe(4500);
    });

    it('[TC-147.04/MSS][UC-IMP-147] Ô 11 Hồng (Đà Lạt) C3: deed.rent3 = 3500 -> khi có monopoly cước = 5250 Tr.', () => {
      const registry: PropertyRegistry = new Map([
        [11, OWNER_ID],
        [13, OWNER_ID],
        [14, OWNER_ID],
      ]);
      const stateMap: PropertyStateMap = new Map([
        [11, { level: 3 }],
        [13, { level: 0 }],
        [14, { level: 0 }],
      ]);

      const rent = resolveRent(BOARD_CONFIG[11], 11, OWNER_ID, registry, stateMap);
      expect(rent).toBe(5250);
    });

    it('[TC-147.05/MSS][UC-IMP-147] Ô 16 Cam (Mũi Né) C3: deed.rent3 = 4500 -> khi có monopoly cước = 6750 Tr.', () => {
      const registry: PropertyRegistry = new Map([
        [16, OWNER_ID],
        [18, OWNER_ID],
        [19, OWNER_ID],
      ]);
      const stateMap: PropertyStateMap = new Map([
        [16, { level: 3 }],
        [18, { level: 0 }],
        [19, { level: 0 }],
      ]);

      const rent = resolveRent(BOARD_CONFIG[16], 16, OWNER_ID, registry, stateMap);
      expect(rent).toBe(6750);
    });

    it('[TC-147.06/MSS][UC-IMP-147] Ô 21 Đỏ (Huế) C3: deed.rent3 = 5500 -> khi có monopoly cước = 8250 Tr.', () => {
      const registry: PropertyRegistry = new Map([
        [21, OWNER_ID],
        [23, OWNER_ID],
        [24, OWNER_ID],
      ]);
      const stateMap: PropertyStateMap = new Map([
        [21, { level: 3 }],
        [23, { level: 0 }],
        [24, { level: 0 }],
      ]);

      const rent = resolveRent(BOARD_CONFIG[21], 21, OWNER_ID, registry, stateMap);
      expect(rent).toBe(8250);
    });

    it('[TC-147.07/MSS][UC-IMP-147] Ô 26 Vàng (Hải Phòng) C3: deed.rent3 = 6500 -> khi có monopoly cước = 9750 Tr.', () => {
      const registry: PropertyRegistry = new Map([
        [26, OWNER_ID],
        [27, OWNER_ID],
        [29, OWNER_ID],
      ]);
      const stateMap: PropertyStateMap = new Map([
        [26, { level: 3 }],
        [27, { level: 0 }],
        [29, { level: 0 }],
      ]);

      const rent = resolveRent(BOARD_CONFIG[26], 26, OWNER_ID, registry, stateMap);
      expect(rent).toBe(9750);
    });

    it('[TC-147.08/MSS][UC-IMP-147] Ô 31 Xanh Lá C3: deed.rent3 = 7200 -> khi có monopoly cước = 10800 Tr.', () => {
      const registry: PropertyRegistry = new Map([
        [31, OWNER_ID],
        [32, OWNER_ID],
        [34, OWNER_ID],
      ]);
      const stateMap: PropertyStateMap = new Map([
        [31, { level: 3 }],
        [32, { level: 0 }],
        [34, { level: 0 }],
      ]);

      const rent = resolveRent(BOARD_CONFIG[31], 31, OWNER_ID, registry, stateMap);
      expect(rent).toBe(10800);
    });

    it('[TC-147.09/MSS][UC-IMP-147] Ô 39 Tím (Lê Lợi) C3: deed.rent3 = 8800 -> khi có monopoly cước = 13200 Tr.', () => {
      const registry: PropertyRegistry = new Map([
        [37, OWNER_ID],
        [39, OWNER_ID],
      ]);
      const stateMap: PropertyStateMap = new Map([
        [37, { level: 0 }],
        [39, { level: 3 }],
      ]);

      const rent = resolveRent(BOARD_CONFIG[39], 39, OWNER_ID, registry, stateMap);
      expect(rent).toBe(13200);
    });
  });

  // ==========================================================================
  // FACET 2: State Reactivity — Loss of Monopoly & Unowned Neighbor
  // ==========================================================================
  describe('Facet 2: State Reactivity — Loss of Monopoly & Unowned Neighbor', () => {
    it('[TC-147.10/MSS][UC-IMP-147] Ô C3 khi đối thủ sở hữu 1 ô cùng nhóm màu -> mất độc quyền -> cước lập tức trở về 1.0x deed.rent3 gốc', () => {
      const registry: PropertyRegistry = new Map([
        [1, OWNER_ID],
        [3, OPPONENT_ID], // Đối thủ chiếm ô 3
      ]);
      const stateMap: PropertyStateMap = new Map([
        [1, { level: 3 }],
        [3, { level: 0 }],
      ]);

      const rent = resolveRent(BOARD_CONFIG[1], 1, OWNER_ID, registry, stateMap);
      const originalRent3 = PROPERTY_DEEDS.get(1)!.rent3!;

      expect(rent).toBe(originalRent3);
      expect(rent).toBe(1320);
    });

    it('[TC-147.11/MSS][UC-IMP-147] Ô C3 khi 1 ô cùng nhóm còn vô chủ -> chưa có độc quyền -> cước giữ nguyên deed.rent3 gốc', () => {
      const registry: PropertyRegistry = new Map([
        [1, OWNER_ID],
        // Ô 3 còn vô chủ (không có trong registry)
      ]);
      const stateMap: PropertyStateMap = new Map([
        [1, { level: 3 }],
      ]);

      const rent = resolveRent(BOARD_CONFIG[1], 1, OWNER_ID, registry, stateMap);
      const originalRent3 = PROPERTY_DEEDS.get(1)!.rent3!;

      expect(rent).toBe(originalRent3);
      expect(rent).toBe(1320);
    });
  });

  // ==========================================================================
  // FACET 3: Resource Disposal & Mortgage Defense
  // ==========================================================================
  describe('Facet 3: Resource Disposal & Mortgage Defense', () => {
    it('[TC-147.12/MSS][UC-IMP-147] Nhóm màu đủ sở hữu nhưng có 1 ô bị thế chấp (isMortgaged: true) -> ô C3 mất bonus x1.5, trở về 1.0x deed.rent3', () => {
      const registry: PropertyRegistry = new Map([
        [1, OWNER_ID],
        [3, OWNER_ID],
      ]);
      const stateMap: PropertyStateMap = new Map([
        [1, { level: 3, isMortgaged: false }],
        [3, { level: 0, isMortgaged: true }], // Ô 3 đang bị thế chấp
      ]);

      const rent = resolveRent(BOARD_CONFIG[1], 1, OWNER_ID, registry, stateMap);
      const originalRent3 = PROPERTY_DEEDS.get(1)!.rent3!;

      expect(rent).toBe(originalRent3);
      expect(rent).toBe(1320);
    });

    it('[TC-147.13/MSS][UC-IMP-147] Khi chuộc thế chấp (isMortgaged: false) -> ô C3 kích hoạt lại bonus x1.5 độc quyền', () => {
      const registry: PropertyRegistry = new Map([
        [1, OWNER_ID],
        [3, OWNER_ID],
      ]);
      const stateMap: PropertyStateMap = new Map([
        [1, { level: 3, isMortgaged: false }],
        [3, { level: 0, isMortgaged: false }], // Chuộc xong, phục hồi độc quyền
      ]);

      const rent = resolveRent(BOARD_CONFIG[1], 1, OWNER_ID, registry, stateMap);
      expect(rent).toBe(1980);
    });
  });

  // ==========================================================================
  // FACET 4: Error Defense, Non-interference & Late-game Surge Compounding
  // ==========================================================================
  describe('Facet 4: Error Defense, Non-interference & Late-game Surge Compounding', () => {
    it('[TC-147.14/MSS][UC-IMP-147] C0, C1, C2 không bị ảnh hưởng sai lệch (C0 vẫn x2 khi độc quyền, C1 và C2 giữ nguyên rent1 và rent2)', () => {
      const registry: PropertyRegistry = new Map([
        [1, OWNER_ID],
        [3, OWNER_ID],
      ]);

      // C0 có độc quyền -> deed.rent0 * 2 = 60 * 2 = 120
      const stateMapC0: PropertyStateMap = new Map([
        [1, { level: 0 }],
        [3, { level: 0 }],
      ]);
      const rentC0 = resolveRent(BOARD_CONFIG[1], 1, OWNER_ID, registry, stateMapC0);
      expect(rentC0).toBe(120);

      // C1 có độc quyền -> giữ nguyên deed.rent1 = 210
      const stateMapC1: PropertyStateMap = new Map([
        [1, { level: 1 }],
        [3, { level: 0 }],
      ]);
      const rentC1 = resolveRent(BOARD_CONFIG[1], 1, OWNER_ID, registry, stateMapC1);
      expect(rentC1).toBe(210);

      // C2 có độc quyền -> giữ nguyên deed.rent2 = 540
      const stateMapC2: PropertyStateMap = new Map([
        [1, { level: 2 }],
        [3, { level: 0 }],
      ]);
      const rentC2 = resolveRent(BOARD_CONFIG[1], 1, OWNER_ID, registry, stateMapC2);
      expect(rentC2).toBe(540);
    });

    it('[TC-147.15/MSS][UC-IMP-147] Hạ tầng (Ga Tàu) và Tiện ích (EVN/Viettel) hoàn toàn miễn nhiễm với hệ số x1.5 C3', () => {
      // 4 Ga tàu đều thuộc sở hữu của OWNER_ID
      const railroadRegistry: PropertyRegistry = new Map(
        RAILROAD_CELLS.map((cell) => [cell, OWNER_ID]),
      );
      const rrRent = resolveRent(BOARD_CONFIG[5], 5, OWNER_ID, railroadRegistry);
      expect(rrRent).toBe(4000); // 4 ga = 4000, không bị nhân 1.5

      // 2 Tiện ích đều thuộc sở hữu của OWNER_ID, xúc xắc 7 -> 7 * 100 = 700
      const utilityRegistry: PropertyRegistry = new Map(
        UTILITY_CELLS.map((cell) => [cell, OWNER_ID]),
      );
      const diceTotal = 7;
      const utilRent = resolveRent(BOARD_CONFIG[12], 12, OWNER_ID, utilityRegistry, undefined, diceTotal);
      expect(utilRent).toBe(700); // 7 * 100 = 700, không bị nhân 1.5
    });

    it('[TC-147.16/MSS][UC-IMP-147] Late-game Surge Compounding: Ô 39 C3 độc quyền ở roundCount = 20 đạt 13200 * 1.2 = 15840 Tr.', () => {
      const registry: PropertyRegistry = new Map([
        [37, OWNER_ID],
        [39, OWNER_ID],
      ]);
      const stateMap: PropertyStateMap = new Map([
        [37, { level: 0 }],
        [39, { level: 3 }],
      ]);

      const roundCount = 20;
      const rent = resolveRent(BOARD_CONFIG[39], 39, OWNER_ID, registry, stateMap, undefined, undefined, roundCount);
      expect(rent).toBe(15840);
    });

    it('[TC-147.17/MSS][UC-IMP-147] Late-game Surge Compounding: Ô 39 C3 độc quyền ở roundCount = 30 đạt 13200 * 1.5 = 19800 Tr.', () => {
      const registry: PropertyRegistry = new Map([
        [37, OWNER_ID],
        [39, OWNER_ID],
      ]);
      const stateMap: PropertyStateMap = new Map([
        [37, { level: 0 }],
        [39, { level: 3 }],
      ]);

      const roundCount = 30;
      const rent = resolveRent(BOARD_CONFIG[39], 39, OWNER_ID, registry, stateMap, undefined, undefined, roundCount);
      expect(rent).toBe(19800);
    });

    it('[TC-147.18/MSS][UC-IMP-147] Bot Threat Horizon: calculateThreatHorizon nhận diện cước C3 độc quyền 4500 Tr. thay vì 3000 Tr. khi đối thủ có trọn bộ', () => {
      const room = createRoom('room-threat-test');
      const bot = createPlayer('bot_agent');
      bot.isBot = true;
      bot.position = 1; // Đứng tại ô 1

      const opponent = createPlayer('monopoly_tycoon');
      opponent.position = 20;

      room.players = [bot, opponent];

      // Đối thủ sở hữu toàn bộ nhóm Xanh Da Trời: ô 6 (C1), ô 8 (C2), ô 9 (C3)
      const registry: PropertyRegistry = new Map([
        [6, opponent.id],
        [8, opponent.id],
        [9, opponent.id],
      ]);
      const stateMap: PropertyStateMap = new Map([
        [6, { level: 1 }],
        [8, { level: 2 }],
        [9, { level: 3 }],
      ]);

      const horizon = calculateThreatHorizon(bot, room, registry, stateMap, BotPersonality.Balanced);

      // Ô 9 (Vũng Tàu C3 có độc quyền) có cước mới là 3000 * 1.5 = 4500 Tr.
      expect(horizon.maxSingleDanger).toBe(4500);

      // expectedCalc = (4/36)*400 + (6/36)*1000 + (5/36)*4500
      const expectedLossCalc = (4 / 36) * 400 + (6 / 36) * 1000 + (5 / 36) * 4500;
      expect(horizon.expectedLoss).toBeCloseTo(expectedLossCalc, 2);
      expect(horizon.safetyBuffer).toBe(Math.max(DEFAULT_MIN_SAFETY_BUFFER, Math.round(expectedLossCalc * 1.0)));
    });
  });
});
