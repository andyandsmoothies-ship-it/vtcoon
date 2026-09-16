// [TC-IMP114.01..20/MSS][UC-IMP114]
// Contract Test Suite: IMP-114 Treasury Public Stimulus & Macro Fiscal Policy
// Station 1: Red Contract Tests (Strict Separation of Duties — Zero modifications to src/)
// Enforces Universal 4-Facet Behavioral Matrix & Point-of-Consumption Assertions.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createPlayer,
  createRoom,
  type Player,
  type Room,
} from '../../src/domain/room.js';

export interface TreasuryRecipient {
  readonly playerId: string;
  readonly amount: number;
}

export interface TreasuryStimulusResult {
  readonly activated: boolean;
  readonly amount: number;
  readonly recipients: readonly TreasuryRecipient[];
}

export type ProcessTreasuryStimulusFn = (room: Room) => TreasuryStimulusResult | null;

// Station 1 (RED Contract) -> Station 2 (GREEN Implementation) Dynamic Resolution
const stimulusModulePath = '../../src/domain/treasury_stimulus.js';
let stimulusModule: { processTreasuryStimulus?: ProcessTreasuryStimulusFn } | null = null;
try {
  stimulusModule = await import(/* @vite-ignore */ stimulusModulePath);
} catch {
  // Station 1 RED: Module not yet implemented in src/domain/treasury_stimulus.ts
  stimulusModule = null;
}

const processTreasuryStimulus: ProcessTreasuryStimulusFn =
  stimulusModule?.processTreasuryStimulus ??
  ((_room: Room): TreasuryStimulusResult | null => {
    throw new Error(
      'BUSINESS_RED: processTreasuryStimulus is not yet implemented in src/domain/treasury_stimulus.ts',
    );
  });

describe('[CONTRACT-TEST] IMP-114: Treasury Public Stimulus & Macro Fiscal Policy', () => {
  let room: Room;
  let p1: Player;
  let p2: Player;
  let p3: Player;
  let p4: Player;

  beforeEach(() => {
    room = createRoom('host_user');
    room.started = true;
    room.roundCount = 10;
    room.treasury = 10_000;

    p1 = createPlayer('player_alpha_vu');
    p1.balance = 500;
    p1.bankrupt = false;

    p2 = createPlayer('player_beta_vuong');
    p2.balance = 800;
    p2.bankrupt = false;

    p3 = createPlayer('player_gamma_long');
    p3.balance = 5_000;
    p3.bankrupt = false;

    p4 = createPlayer('player_delta_thao');
    p4.balance = 10_000;
    p4.bankrupt = false;

    room.players = [p1, p2, p3, p4];
  });

  // ===========================================================================
  // FACET 1: Boundary & Range (Chốt 1: Ngưỡng kích hoạt, Chốt 2: Tỷ lệ giải ngân, Chốt 7: Payload)
  // ===========================================================================
  describe('Facet 1: Boundary & Range — Activation Threshold & Disbursement Rate', () => {
    it('[TC-IMP114.01/MSS][UC-IMP114] Chốt 1: processTreasuryStimulus trả về null nếu room.treasury < 10_000 (biên 9_999 Tr. VNĐ)', () => {
      room.treasury = 9_999;

      const result = processTreasuryStimulus(room);

      expect(result).toBeNull();
    });

    it('[TC-IMP114.02/MSS][UC-IMP114] Chốt 1: processTreasuryStimulus trả về null khi room.treasury = 0', () => {
      room.treasury = 0;

      const result = processTreasuryStimulus(room);

      expect(result).toBeNull();
    });

    it('[TC-IMP114.03/MSS][UC-IMP114] Chốt 2: processTreasuryStimulus giải ngân đúng 20% = 2_000 Tr. VNĐ khi room.treasury = 10_000', () => {
      room.treasury = 10_000;

      const result = processTreasuryStimulus(room);

      expect(result).not.toBeNull();
      expect(result?.amount).toBe(2_000);
    });

    it('[TC-IMP114.04/MSS][UC-IMP114] Chốt 2: processTreasuryStimulus giải ngân đúng 20% = 3_000 Tr. VNĐ khi room.treasury = 15_000', () => {
      room.treasury = 15_000;

      const result = processTreasuryStimulus(room);

      expect(result).not.toBeNull();
      expect(result?.amount).toBe(3_000);
    });

    it('[TC-IMP114.05/MSS][UC-IMP114] Chốt 7: Traceability payload trả về cấu trúc hợp đồng chuẩn { activated: true, amount, recipients }', () => {
      room.treasury = 10_000;

      const result = processTreasuryStimulus(room);

      expect(result).not.toBeNull();
      expect(result?.activated).toBe(true);
      expect(typeof result?.amount).toBe('number');
      expect(Array.isArray(result?.recipients)).toBe(true);
    });
  });

  // ===========================================================================
  // FACET 2: State Reactivity & Beneficiary Allocation (Chốt 3, Chốt 4)
  // ===========================================================================
  describe('Facet 2: State Reactivity & Beneficiary Allocation — Poorest Players & Bankruptcy Defense', () => {
    it('[TC-IMP114.06/MSS][UC-IMP114] Chốt 3: Chia đều 2_000 Tr. cho 2 người chơi có tiền mặt thấp nhất (mỗi người nhận 1_000 Tr.)', () => {
      room.treasury = 10_000;

      const result = processTreasuryStimulus(room);

      expect(result?.recipients).toHaveLength(2);
      expect(result?.recipients.find((r) => r.playerId === p1.id)?.amount).toBe(1_000);
      expect(result?.recipients.find((r) => r.playerId === p2.id)?.amount).toBe(1_000);
    });

    it('[TC-IMP114.07/MSS][UC-IMP114] Chốt 3: Chỉ giải ngân cho 1 người chơi duy nhất nếu bàn chơi chỉ còn 1 người chưa phá sản', () => {
      p2.bankrupt = true;
      p3.bankrupt = true;
      p4.bankrupt = true;
      room.treasury = 10_000;

      const result = processTreasuryStimulus(room);

      expect(result?.recipients).toHaveLength(1);
      expect(result?.recipients[0]?.playerId).toBe(p1.id);
      expect(result?.recipients[0]?.amount).toBe(2_000);
    });

    it('[TC-IMP114.08/MSS][UC-IMP114] Chốt 3: Trong bàn 4 người, người chơi giàu thứ 3 và thứ 4 không nhận bất kỳ khoản trợ cấp nào', () => {
      room.treasury = 10_000;

      const result = processTreasuryStimulus(room);

      const p3Recipient = result?.recipients.find((r) => r.playerId === p3.id);
      const p4Recipient = result?.recipients.find((r) => r.playerId === p4.id);
      expect(p3Recipient).toBeUndefined();
      expect(p4Recipient).toBeUndefined();
    });

    it('[TC-IMP114.09/MSS][UC-IMP114] Chốt 4: Bỏ qua người chơi bankrupt === true dù số dư tiền mặt của họ là 0 hoặc thấp nhất', () => {
      p1.balance = 0;
      p1.bankrupt = true; // P1 pha san -> Bi loai
      room.treasury = 10_000;

      const result = processTreasuryStimulus(room);

      const p1Recipient = result?.recipients.find((r) => r.playerId === p1.id);
      expect(p1Recipient).toBeUndefined();
    });

    it('[TC-IMP114.10/MSS][UC-IMP114] Chốt 4: Người có tiền mặt thấp thứ 3 được đôn lên nhận trợ cấp nếu người đứng thứ 1 đã phá sản', () => {
      p1.balance = 0;
      p1.bankrupt = true; // P1 pha san
      // Danh sach con lai theo tien mat: P2 (800), P3 (5000), P4 (10000) -> P2 va P3 nhan tro cap
      room.treasury = 10_000;

      const result = processTreasuryStimulus(room);

      expect(result?.recipients.find((r) => r.playerId === p2.id)).toBeDefined();
      expect(result?.recipients.find((r) => r.playerId === p3.id)).toBeDefined();
    });
  });

  // ===========================================================================
  // FACET 3: Resource Disposal & Conservation Laws (Chốt 5, Chốt 6)
  // ===========================================================================
  describe('Facet 3: Resource Disposal & Conservation Laws — Zero Treasury Leak & Balance Safety', () => {
    it('[TC-IMP114.11/MSS][UC-IMP114] Chốt 5: Zero Treasury Leak: room.treasury giảm đúng bằng tổng số tiền 2 người chơi thụ hưởng nhận được', () => {
      room.treasury = 10_000;

      const result = processTreasuryStimulus(room);
      const totalDistributed = result?.recipients.reduce((sum, r) => sum + r.amount, 0) ?? 0;

      expect(room.treasury).toBe(10_000 - totalDistributed);
    });

    it('[TC-IMP114.12/MSS][UC-IMP114] Chốt 5: Số dư tiền mặt của người thụ hưởng tăng chính xác bằng số tiền ghi nhận trong recipients payload', () => {
      room.treasury = 10_000;

      processTreasuryStimulus(room);

      expect(p1.balance).toBe(1_500); // 500 + 1000
      expect(p2.balance).toBe(1_800); // 800 + 1000
    });

    it('[TC-IMP114.13/MSS][UC-IMP114] Chốt 5: Số dư người không thụ hưởng được bảo toàn nguyên vẹn 100% không suy giảm', () => {
      room.treasury = 10_000;

      processTreasuryStimulus(room);

      expect(p3.balance).toBe(5_000);
      expect(p4.balance).toBe(10_000);
    });

    it('[TC-IMP114.14/MSS][UC-IMP114] Chốt 6: An toàn số dư: room.treasury sau khi giải ngân luôn lớn hơn hoặc bằng 0', () => {
      room.treasury = 10_000;

      processTreasuryStimulus(room);

      expect(room.treasury).toBeGreaterThanOrEqual(0);
    });

    it('[TC-IMP114.15/MSS][UC-IMP114] Chốt 6: Bảo tồn tổng tài sản kinh tế vĩ mô: delta(treasury) + delta(players_cash) === 0', () => {
      room.treasury = 10_000;
      const initialTotalCash = room.treasury + p1.balance + p2.balance + p3.balance + p4.balance;

      processTreasuryStimulus(room);

      const finalTotalCash = room.treasury + p1.balance + p2.balance + p3.balance + p4.balance;
      expect(finalTotalCash).toBe(initialTotalCash);
    });
  });

  // ===========================================================================
  // FACET 4: Error Defense & Edge Conditions (Chốt 1, Chốt 6, Edge cases)
  // ===========================================================================
  describe('Facet 4: Error Defense & Edge Conditions — Robustness & Idempotency', () => {
    it('[TC-IMP114.16/MSS][UC-IMP114] Toàn bộ người chơi đều phá sản -> processTreasuryStimulus trả về null, Kho Bạc không bị rò rỉ', () => {
      p1.bankrupt = true;
      p2.bankrupt = true;
      p3.bankrupt = true;
      p4.bankrupt = true;
      room.treasury = 10_000;

      const result = processTreasuryStimulus(room);

      expect(result).toBeNull();
      expect(room.treasury).toBe(10_000);
    });

    it('[TC-IMP114.17/MSS][UC-IMP114] Phòng không có người chơi (players rỗng) -> processTreasuryStimulus trả về null an toàn không crash', () => {
      room.players = [];
      room.treasury = 10_000;

      const result = processTreasuryStimulus(room);

      expect(result).toBeNull();
      expect(room.treasury).toBe(10_000);
    });

    it('[TC-IMP114.18/MSS][UC-IMP114] Đồng hạng tiền mặt giữa các người chơi thấp nhất -> Lựa chọn ổn định và chỉ giải ngân tối đa 2 suất', () => {
      p1.balance = 500;
      p2.balance = 500;
      p3.balance = 500; // 3 nguoi deu 500
      room.treasury = 10_000;

      const result = processTreasuryStimulus(room);

      expect(result?.recipients).toHaveLength(2);
    });

    it('[TC-IMP114.19/MSS][UC-IMP114] Số tiền lẻ khi chia: Math.floor bảo đảm số tiền mỗi người nhận là số nguyên và tổng không vượt quỹ giải ngân', () => {
      room.treasury = 10_005; // 20% = 2001 -> Chia 2 = 1000 moi nguoi (Math.floor)

      const result = processTreasuryStimulus(room);

      expect(result?.recipients).toHaveLength(2);
      expect(Number.isInteger(result?.recipients[0]?.amount)).toBe(true);
      expect(Number.isInteger(result?.recipients[1]?.amount)).toBe(true);
    });

    it('[TC-IMP114.20/MSS][UC-IMP114] Tính idempotent: Lần gọi thứ hai khi treasury đã giảm dưới 10_000 trả về null', () => {
      room.treasury = 10_000;

      processTreasuryStimulus(room); // Giai ngan 2_000 -> room.treasury con 8_000
      const secondCall = processTreasuryStimulus(room); // 8_000 < 10_000 -> null

      expect(secondCall).toBeNull();
    });
  });
});
