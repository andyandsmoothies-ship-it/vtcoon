// [UC-PDS] Property Purchase Decision Support Contract Suite
// Traceability: [TC-PDS.01/MSS..TC-PDS.16/MSS]
import { describe, it, expect } from 'vitest';
import {
  resolveMonopolyRadar,
  resolveCashBufferSafety,
  resolvePurchaseDecisionInsight,
} from '../../src/client/ui/modals/purchase_decision_logic';

describe('[UC-PDS] Property Purchase Decision Support Contract Suite', () => {
  // Mock dữ liệu người chơi theo đúng cấu trúc chuẩn của hệ thống
  const createBasePlayers = () => ({
    p1: {
      id: 'p1',
      name: 'Hoàng Nam',
      balance: 10000,
      tokenColor: '#3B82F6',
      ownedProperties: [] as number[],
    },
    bot1: {
      id: 'bot1',
      name: 'Bot 1 (Aggressive)',
      balance: 8500,
      tokenColor: '#EF4444',
      isBot: true,
      ownedProperties: [] as number[],
    },
    bot2: {
      id: 'bot2',
      name: 'Bot 2 (Cautious)',
      balance: 6000,
      tokenColor: '#10B981',
      isBot: true,
      ownedProperties: [] as number[],
    },
  });

  // =========================================================================
  // FACET 1: Radar Bộ Màu & Tiến Độ Độc Quyền (Monopoly & Synergy Radar)
  // =========================================================================
  describe('FACET 1: Radar Bộ Màu & Tiến Độ Độc Quyền (Monopoly & Synergy Radar)', () => {
    it('[TC-PDS.01/MSS][UC-PDS] Hoàn tất độc quyền khi người chơi đã sở hữu (N-1) ô và đứng tại ô cuối cùng (nhóm 3 ô màu)', () => {
      const players = createBasePlayers();
      players.p1.ownedProperties = [31, 32]; // Hưng Yên, Cầu Giấy (nhóm Xanh Lá gồm 31, 32, 34)

      const radar = resolveMonopolyRadar({
        cellIndex: 34, // Hoàn Kiếm (ô cuối cùng)
        buyerId: 'p1',
        allPlayers: players,
      });

      expect(radar.strategicHint).toBe('complete_monopoly');
      expect(radar.badge).toBe('🎯 Độc Quyền');
      expect(radar.totalCells).toBe(3);
      expect(radar.ownedCount).toBe(2);
    });

    it('[TC-PDS.02/MSS][UC-PDS] Chặn đối thủ khi một đối thủ sở hữu (N-1) ô và người chơi đứng tại ô cuối cùng', () => {
      const players = createBasePlayers();
      players.bot1.ownedProperties = [31, 32]; // bot1 sắp độc quyền nhóm Xanh Lá

      const radar = resolveMonopolyRadar({
        cellIndex: 34,
        buyerId: 'p1',
        allPlayers: players,
      });

      expect(radar.strategicHint).toBe('block_opponent');
      expect(radar.badge).toBe('🛡️ Chặn Đối Thủ');
      expect(radar.opponentName).toBe('Bot 1 (Aggressive)');
    });

    it('[TC-PDS.03/MSS][UC-PDS] Mảnh đầu tiên khi người chơi chưa có ô nào trong nhóm và không có đối thủ nào cận độc quyền', () => {
      const players = createBasePlayers();

      const radar = resolveMonopolyRadar({
        cellIndex: 16, // Bình Định (nhóm Cam gồm 16, 18, 19, chưa ai sở hữu ô nào)
        buyerId: 'p1',
        allPlayers: players,
      });

      expect(radar.strategicHint).toBe('first_piece');
      expect(radar.badge).toBe('🧩 Khởi Đầu');
      expect(radar.ownedCount).toBe(0);
    });

    it('[TC-PDS.04/MSS][UC-PDS] Tiến tới độc quyền khi nhóm có 3 ô, người chơi đã có 1 ô, ô đang đứng là ô thứ 2, ô còn lại trống', () => {
      const players = createBasePlayers();
      players.p1.ownedProperties = [16]; // Đã có Bình Định (1/3 nhóm Cam)

      const radar = resolveMonopolyRadar({
        cellIndex: 18, // Thừa Thiên Huế (ô thứ 2)
        buyerId: 'p1',
        allPlayers: players,
      });

      expect(radar.strategicHint).toBe('progress_monopoly');
      expect(radar.badge).toBe('🚀 Tiến Tới (2/3)');
      expect(radar.ownedCount).toBe(1);
    });

    it('[TC-PDS.05/MSS][UC-PDS] Nhóm Hạ tầng giao thông (Railroad, 4 ô) nhận diện đúng số ô đã sở hữu', () => {
      const players = createBasePlayers();
      players.p1.ownedProperties = [5, 15]; // Đã có Long Thành và Cái Mép

      const radar = resolveMonopolyRadar({
        cellIndex: 25, // Cao Tốc Bắc - Nam
        buyerId: 'p1',
        allPlayers: players,
      });

      expect(radar.totalCells).toBe(4);
      expect(radar.ownedCount).toBe(2);
      expect(radar.isRailroad).toBe(true);
    });

    it('[TC-PDS.06/MSS][UC-PDS] Nhóm Tiện ích (Utility, 2 ô) nhận diện đúng hoàn tất độc quyền khi người chơi đã có 1/2 ô', () => {
      const players = createBasePlayers();
      players.p1.ownedProperties = [12]; // Đã có EVN (12), đứng tại Viettel (28)

      const radar = resolveMonopolyRadar({
        cellIndex: 28,
        buyerId: 'p1',
        allPlayers: players,
      });

      expect(radar.totalCells).toBe(2);
      expect(radar.ownedCount).toBe(1);
      expect(radar.strategicHint).toBe('complete_monopoly');
      expect(radar.badge).toBe('🎯 Độc Quyền');
    });

    it('[TC-PDS.07/MSS][UC-PDS] Tranh chấp khi cả 2 người chơi khác đều sở hữu ô trong cùng nhóm (không ai có thể độc quyền tự nhiên)', () => {
      const players = createBasePlayers();
      players.bot1.ownedProperties = [31]; // bot1 sở hữu Hưng Yên
      players.bot2.ownedProperties = [32]; // bot2 sở hữu Cầu Giấy

      const radar = resolveMonopolyRadar({
        cellIndex: 34, // Hoàn Kiếm
        buyerId: 'p1',
        allPlayers: players,
      });

      expect(radar.strategicHint).toBe('contested');
    });

    it('[TC-PDS.08/MSS][UC-PDS] Danh sách chip các ô trong phân khu (groupCells) trả về đúng thứ tự, đúng trạng thái', () => {
      const players = createBasePlayers();
      players.p1.ownedProperties = [31];   // p1 sở hữu Hưng Yên
      players.bot1.ownedProperties = [32]; // bot1 sở hữu Cầu Giấy

      const radar = resolveMonopolyRadar({
        cellIndex: 34, // Đang đứng tại Hoàn Kiếm (ô trống mục tiêu)
        buyerId: 'p1',
        allPlayers: players,
      });

      expect(radar.groupCells).toHaveLength(3);
      expect(radar.groupCells[0]).toMatchObject({
        cellIndex: 31,
        isMine: true,
        isTarget: false,
        isOpponent: false,
        isVacant: false,
      });
      expect(radar.groupCells[1]).toMatchObject({
        cellIndex: 32,
        isMine: false,
        isTarget: false,
        isOpponent: true,
        isVacant: false,
      });
      expect(radar.groupCells[2]).toMatchObject({
        cellIndex: 34,
        isMine: false,
        isTarget: true,
        isOpponent: false,
        isVacant: true,
      });
    });
  });

  // =========================================================================
  // FACET 2: Đệm Tiền Mặt & An Toàn Thanh Khoản Sau Mua (Cash Buffer & Liquidity Safety)
  // =========================================================================
  describe('FACET 2: Đệm Tiền Mặt & An Toàn Thanh Khoản Sau Mua (Cash Buffer & Liquidity Safety)', () => {
    it('[TC-PDS.09/MSS][UC-PDS] balanceAfterBuy = buyerBalance - deedPrice tính chính xác số dư còn lại', () => {
      const buffer = resolveCashBufferSafety({
        buyerBalance: 5000,
        deedPrice: 3000,
      });

      expect(buffer.balanceAfterBuy).toBe(2000);
    });

    it('[TC-PDS.10/MSS][UC-PDS] Mức thanh khoản 🟢 Dư Dả khi balanceAfterBuy >= 1500 Tr., trả về tone emerald, label Dư Dả', () => {
      const buffer = resolveCashBufferSafety({
        buyerBalance: 4500,
        deedPrice: 3000, // balanceAfterBuy = 1500 Tr.
      });

      expect(buffer.tone).toBe('emerald');
      expect(buffer.label).toBe('Dư Dả');
      expect(buffer.canAfford).toBe(true);
    });

    it('[TC-PDS.11/MSS][UC-PDS] Mức thanh khoản 🟡 Cẩn Trọng khi 500 <= balanceAfterBuy < 1500 Tr., trả về tone amber, label Cẩn Trọng', () => {
      const buffer = resolveCashBufferSafety({
        buyerBalance: 3800,
        deedPrice: 3000, // balanceAfterBuy = 800 Tr.
      });

      expect(buffer.tone).toBe('amber');
      expect(buffer.label).toBe('Cẩn Trọng');
      expect(buffer.canAfford).toBe(true);
    });

    it('[TC-PDS.12/MSS][UC-PDS] Mức thanh khoản 🔴 Rủi Ro Cao khi 0 <= balanceAfterBuy < 500 Tr., trả về tone rose, label Rủi Ro Cao', () => {
      const buffer = resolveCashBufferSafety({
        buyerBalance: 3200,
        deedPrice: 3000, // balanceAfterBuy = 200 Tr.
      });

      expect(buffer.tone).toBe('rose');
      expect(buffer.label).toBe('Rủi Ro Cao');
      expect(buffer.canAfford).toBe(true);
    });

    it('[TC-PDS.13/MSS][UC-PDS] Giá trị thế chấp khẩn cấp: mortgageValue = Math.floor(deedPrice * 0.5) làm phao cứu sinh an toàn', () => {
      const buffer = resolveCashBufferSafety({
        buyerBalance: 5000,
        deedPrice: 3200,
      });

      expect(buffer.mortgageValue).toBe(1600);
    });

    it('[TC-PDS.14/MSS][UC-PDS] Trường hợp không đủ tiền mua (buyerBalance < deedPrice): balanceAfterBuy < 0, cờ canAfford: false', () => {
      const buffer = resolveCashBufferSafety({
        buyerBalance: 2000,
        deedPrice: 3000, // balanceAfterBuy = -1000 Tr.
      });

      expect(buffer.balanceAfterBuy).toBe(-1000);
      expect(buffer.canAfford).toBe(false);
    });

    it('[TC-PDS.15/MSS][UC-PDS] Đệm tiền mặt khi buyerBalance bị âm hoặc bằng 0: xử lý an toàn không NaN', () => {
      const buffer = resolveCashBufferSafety({
        buyerBalance: -500,
        deedPrice: 1000,
      });

      expect(Number.isNaN(buffer.balanceAfterBuy)).toBe(false);
      expect(Number.isNaN(buffer.mortgageValue)).toBe(false);
      expect(buffer.canAfford).toBe(false);
    });
  });

  // =========================================================================
  // FACET 3: Tổng Hợp Insight Toàn Diện (Purchase Decision Insight)
  // =========================================================================
  describe('FACET 3: Tổng Hợp Insight Toàn Diện (Purchase Decision Insight)', () => {
    it('[TC-PDS.16/MSS][UC-PDS] Hàm tổng hợp resolvePurchaseDecisionInsight trả về đầy đủ cả thông tin Radar bộ màu và Đệm tiền mặt sau mua cho một ô đất cụ thể', () => {
      const players = createBasePlayers();
      players.p1.ownedProperties = [31, 32]; // p1 đã có 2/3 ô nhóm Xanh Lá

      const insight = resolvePurchaseDecisionInsight({
        cellIndex: 34, // Hà Nội (Hoàn Kiếm) - giá 3.200 Tr.
        buyerId: 'p1',
        buyerBalance: 5000,
        allPlayers: players,
      });

      expect(insight.cellIndex).toBe(34);
      expect(insight.radar.strategicHint).toBe('complete_monopoly');
      expect(insight.cashBuffer.balanceAfterBuy).toBe(1800);
      expect(insight.cashBuffer.tone).toBe('emerald');
    });
  });
});
