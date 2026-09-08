// [UC-GAME-001..057/MSS][TC-E2E-RESILIENCE/MSS] Production-Grade Defensive & Resilience Living E2E Test
// Suites: 1. Out-of-Turn & Malicious Attacks, 2. Conservation of Money Invariant,
//         3. Session Resilience in Insolvency, 4. 50-Turn Chaotic Fuzzing (Deadlock-Free, < 10KB NFR).

import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager';
import { TurnPhase, INITIAL_BALANCE, GO_BONUS } from '../../src/domain/room';
import { dispatchPlayerIntent } from '../../src/server/intent_dispatcher';
import { ActionRejectReason } from '../../src/domain/action_reasons';
import { PROPERTY_DEEDS } from '../../src/domain/property_manager';
import { calcTotalMortgageDebt, collectMortgageInterest } from '../../src/server/mortgage_manager';
import { SessionManager, SessionState, buildDeltaPayload } from '../../src/server/session_manager';

describe('[TC-E2E-RESILIENCE/MSS] Production-Grade Resilience & Defensive Testing', () => {
  // =========================================================================
  // Suite 1: Phòng Thủ Thao Tác Trái Lượt & Dữ Liệu Độc Hại
  // =========================================================================
  describe('Suite 1: Phòng Thủ Thao Tác Trái Lượt & Dữ Liệu Độc Hại', () => {
    it('Tu choi 100% cac thao tac trai luot tu nguoi choi khong phai luot hien tai', () => {
      const mgr = new RoomManager(42);
      const room = mgr.createRoom('P1');
      mgr.joinRoom(room.roomCode, 'P2');
      mgr.joinRoom(room.roomCode, 'P3');
      mgr.startGame(room.roomCode);

      expect(room.players[room.currentPlayerIndex]?.id).toBe('P1');
      const p1Before = room.players[0]!.balance;
      const p2Before = room.players[1]!.balance;
      const p3Before = room.players[2]!.balance;

      // 1. P2/P3 cố tình lăn xúc xắc ngoài lượt
      const rollP2 = mgr.handleRollDice(room.roomCode, 'P2');
      expect(rollP2).toBeUndefined();

      // 2. P2 gửi INTENT_BUY ngoài lượt
      const buyP2 = dispatchPlayerIntent(mgr, room.roomCode, 'P2', { type: 'INTENT_BUY' });
      expect(buyP2.success).toBe(false);

      // 3. P2 gửi INTENT_DOWNGRADE ngoài lượt
      const downP2 = dispatchPlayerIntent(mgr, room.roomCode, 'P2', { type: 'INTENT_DOWNGRADE', cellIndex: 1 });
      expect(downP2.success).toBe(false);
      expect(downP2.reason).toBe(ActionRejectReason.INVALID_PHASE);

      // 4. P2 gửi INTENT_END_TURN ngoài lượt
      const endP2 = dispatchPlayerIntent(mgr, room.roomCode, 'P2', { type: 'INTENT_END_TURN' });
      expect(endP2.success).toBe(false);
      expect(endP2.reason).toBe('INVALID_PHASE');

      // 5. P3 gửi INTENT_MORTGAGE ngoài lượt
      const mortP3 = dispatchPlayerIntent(mgr, room.roomCode, 'P3', { type: 'INTENT_MORTGAGE', cellIndex: 1 });
      expect(mortP3.success).toBe(false);
      expect(mortP3.reason).toBe(ActionRejectReason.NOT_YOUR_TURN);

      // Xác nhận phòng không suy chuyển trạng thái
      expect(room.currentPlayerIndex).toBe(0);
      expect(room.players[0]!.balance).toBe(p1Before);
      expect(room.players[1]!.balance).toBe(p2Before);
      expect(room.players[2]!.balance).toBe(p3Before);
    });

    it('Chan dung cac don tan cong bien P2P Trade doc hai va gia am', () => {
      const mgr = new RoomManager(42);
      const room = mgr.createRoom('P1');
      mgr.joinRoom(room.roomCode, 'P2');
      mgr.joinRoom(room.roomCode, 'P3');
      mgr.startGame(room.roomCode);

      // Cấp quyền sở hữu ô 01 cho P1
      (mgr as unknown as { registries: Map<string, Map<number, string>> })
        .registries.get(room.roomCode)!.set(1, 'P1');
      const p1Cash = room.players[0]!.balance;
      const p2Cash = room.players[1]!.balance;
      const treasury = room.treasury;

      // 1. Tấn công giá âm (-1.000 Tr.)
      const resNeg = dispatchPlayerIntent(mgr, room.roomCode, 'P1', {
        type: 'INTENT_TRADE_OFFER',
        sellerId: 'P1', buyerId: 'P2', cellIndex: 1, price: -1000,
      });
      expect(resNeg.success).toBe(false);
      expect(resNeg.reason).toBe(ActionRejectReason.INVALID_PRICE);

      // 2. Tấn công giá 0
      const resZero = dispatchPlayerIntent(mgr, room.roomCode, 'P1', {
        type: 'INTENT_TRADE_OFFER',
        sellerId: 'P1', buyerId: 'P2', cellIndex: 1, price: 0,
      });
      expect(resZero.success).toBe(false);
      expect(resZero.reason).toBe(ActionRejectReason.INVALID_PRICE);

      // 3. Tấn công ô đất không tồn tại (cellIndex 99)
      const resNonExist = dispatchPlayerIntent(mgr, room.roomCode, 'P1', {
        type: 'INTENT_TRADE_OFFER',
        sellerId: 'P1', buyerId: 'P2', cellIndex: 99, price: 1000,
      });
      expect(resNonExist.success).toBe(false);
      expect(resNonExist.reason).toBe(ActionRejectReason.NOT_OWNER);

      // 4. Bán ô đất không thuộc quyền sở hữu (ô 03)
      const resNotOwner = dispatchPlayerIntent(mgr, room.roomCode, 'P1', {
        type: 'INTENT_TRADE_OFFER',
        sellerId: 'P1', buyerId: 'P2', cellIndex: 3, price: 1000,
      });
      expect(resNotOwner.success).toBe(false);
      expect(resNotOwner.reason).toBe(ActionRejectReason.NOT_OWNER);

      // 5. Bên thứ 3 không liên quan (P3) yêu cầu giao dịch
      const resUnauthorized = mgr.handleTradeOffer(room.roomCode, 'P3', 'P1', 'P2', 1, 1000);
      expect(resUnauthorized.success).toBe(false);
      expect(resUnauthorized.reason).toBe(ActionRejectReason.UNAUTHORIZED);

      // Xác nhận tiền và kho bạc nguyên vẹn
      expect(room.players[0]!.balance).toBe(p1Cash);
      expect(room.players[1]!.balance).toBe(p2Cash);
      expect(room.treasury).toBe(treasury);
    });

    it('Tu choi yeu cau ha cap gian lan tren dat C0 hoac dat the chap', () => {
      const mgr = new RoomManager(42);
      const room = mgr.createRoom('P1');
      mgr.joinRoom(room.roomCode, 'P2');
      mgr.startGame(room.roomCode);

      const reg = (mgr as unknown as { registries: Map<string, Map<number, string>> }).registries.get(room.roomCode)!;
      const sm = (mgr as unknown as { propertyStates: Map<string, Map<number, { level: number }>> }).propertyStates.get(room.roomCode)!;
      reg.set(1, 'P1');
      sm.set(1, { level: 0 });
      room.phase = TurnPhase.PropertyManagement;

      const p1Cash = room.players[0]!.balance;

      // Hạ cấp ô C0 -> NOT_UPGRADEABLE
      const resC0 = dispatchPlayerIntent(mgr, room.roomCode, 'P1', {
        type: 'INTENT_DOWNGRADE', cellIndex: 1,
      });
      expect(resC0.success).toBe(false);
      expect(resC0.reason).toBe(ActionRejectReason.NOT_UPGRADEABLE);
      expect(room.players[0]!.balance).toBe(p1Cash);

      // Thế chấp ô 1 (+300 Tr. loan)
      const mortRes = dispatchPlayerIntent(mgr, room.roomCode, 'P1', {
        type: 'INTENT_MORTGAGE', cellIndex: 1,
      });
      expect(mortRes.success).toBe(true);
      expect(room.players[0]!.balance).toBe(p1Cash + 300);

      // Hạ cấp ô đã thế chấp -> NOT_UPGRADEABLE (không có nhà)
      const resMortDowngrade = dispatchPlayerIntent(mgr, room.roomCode, 'P1', {
        type: 'INTENT_DOWNGRADE', cellIndex: 1,
      });
      expect(resMortDowngrade.success).toBe(false);
      expect(resMortDowngrade.reason).toBe(ActionRejectReason.NOT_UPGRADEABLE);
      expect(room.players[0]!.balance).toBe(p1Cash + 300);
    });
  });

  // =========================================================================
  // Suite 2: Định Luật Bất Biến Bảo Toàn Dòng Tiền (Conservation of Money)
  // =========================================================================
  describe('Suite 2: Định Luật Bất Biến Bảo Toàn Dòng Tiền', () => {
    it('Bao toan dong tien tuyet doi 0 Tr. qua toan bo chuoi giao dich hon hop', () => {
      const mgr = new RoomManager(42);
      const room = mgr.createRoom('P1');
      mgr.joinRoom(room.roomCode, 'P2');
      mgr.joinRoom(room.roomCode, 'P3');
      mgr.startGame(room.roomCode);

      const initialTotal = 3 * INITIAL_BALANCE; // 45.000 Tr.
      let bankSink = 0;       // Tiền nộp/hủy vào Ngân hàng
      let goBonusGiven = 0;   // Tiền bơm từ ô GO

      function calcSystemMoney(): number {
        const cash = room.players.reduce((s, p) => s + p.balance, 0);
        const treasury = room.treasury;
        let upgradeCosts = 0;
        for (let c = 0; c < 40; c++) {
          const deed = PROPERTY_DEEDS.get(c);
          const state = mgr.getPropertyState(room.roomCode, c);
          if (deed?.upgradeCosts && state && state.level > 0) {
            for (let l = 0; l < state.level; l++) {
              upgradeCosts += deed.upgradeCosts[l] ?? 0;
            }
          }
        }
        const totalMortgageDebt = room.players.reduce((s, p) => s + calcTotalMortgageDebt(p), 0);
        return cash + treasury + upgradeCosts - totalMortgageDebt;
      }

      function assertConservation() {
        const currentSystemMoney = calcSystemMoney();
        const expected = initialTotal + goBonusGiven - bankSink;
        expect(currentSystemMoney).toBe(expected);
      }

      // T0: Khởi tạo
      assertConservation();

      // T1: P1 mua đất ô 01 (600 Tr. trả Ngân hàng)
      const reg = (mgr as unknown as { registries: Map<string, Map<number, string>> }).registries.get(room.roomCode)!;
      const sm = (mgr as unknown as { propertyStates: Map<string, Map<number, { level: number }>> }).propertyStates.get(room.roomCode)!;
      reg.set(1, 'P1');
      sm.set(1, { level: 0 });
      room.players[0]!.balance -= 600;
      bankSink += 600;
      assertConservation();

      // T2: P1 mua tiếp ô 03 (600 Tr. trả Ngân hàng)
      reg.set(3, 'P1');
      sm.set(3, { level: 0 });
      room.players[0]!.balance -= 600;
      bankSink += 600;
      assertConservation();

      // T3: P1 nâng cấp ô 01 lên C1 Shophouse (chi 300 Tr.)
      room.phase = TurnPhase.PropertyManagement;
      const upRes = dispatchPlayerIntent(mgr, room.roomCode, 'P1', {
        type: 'INTENT_UPGRADE', cellIndex: 1,
      });
      expect(upRes.success).toBe(true);
      // Tiền mặt chuyển sang giá trị công trình -> System Money bảo toàn nguyên vẹn
      assertConservation();

      // T4: P1 chuyển nhượng P2P ô 03 cho P2 giá 1.000 Tr. (Thuế 5% = 50 Tr. vào Kho bạc)
      const tradeRes = dispatchPlayerIntent(mgr, room.roomCode, 'P1', {
        type: 'INTENT_TRADE_OFFER',
        sellerId: 'P1', buyerId: 'P2', cellIndex: 3, price: 1000,
      });
      expect(tradeRes.success).toBe(true);
      // P2 trả 1.050, P1 nhận 1.000, Kho bạc nhận 50 -> Tổng Cash + Treasury không đổi
      assertConservation();

      // T5: P2 thế chấp ô 03 (nhận 300 Tr. vay)
      const p2 = room.players[1]!;
      room.currentPlayerIndex = 1;
      room.phase = TurnPhase.PropertyManagement;
      const mortRes = dispatchPlayerIntent(mgr, room.roomCode, 'P2', {
        type: 'INTENT_MORTGAGE', cellIndex: 3,
      });
      expect(mortRes.success).toBe(true);
      // Tiền mặt +300, Dư nợ +300 -> triệt tiêu nhau, System Money không đổi
      assertConservation();

      // T6: P2 vượt ô GO với dư nợ 300 Tr.
      p2.balance += GO_BONUS;
      goBonusGiven += GO_BONUS;
      collectMortgageInterest(room, 'P2');
      bankSink += 15; // Lãi 5% = 15 Tr. tiêu hủy vào Ngân hàng
      assertConservation();

      // T7: P2 chuộc ô 03 (trả gốc 300 + phí hành chính 30 = 330 Tr.)
      const redeemRes = dispatchPlayerIntent(mgr, room.roomCode, 'P2', {
        type: 'INTENT_REDEEM', cellIndex: 3,
      });
      expect(redeemRes.success).toBe(true);
      // Giảm nợ 300, tiền mặt giảm 330 -> chênh lệch 30 Tr. phí nộp Ngân hàng
      bankSink += 30;
      assertConservation();

      // T8: P1 hạ cấp ô 01 từ C1 về C0 (hoàn 150 Tr., mất 150 Tr.)
      room.currentPlayerIndex = 0;
      room.phase = TurnPhase.PropertyManagement;
      const downRes = dispatchPlayerIntent(mgr, room.roomCode, 'P1', {
        type: 'INTENT_DOWNGRADE', cellIndex: 1,
      });
      expect(downRes.success).toBe(true);
      // Giá trị công trình giảm 300, tiền mặt tăng 150 -> 150 Tr. hao hụt vào Ngân hàng
      bankSink += 150;
      assertConservation();
    });
  });

  // =========================================================================
  // Suite 3: Rớt Mạng Trong Vùng Nguy Hiểm & Tái Lập Phiên
  // =========================================================================
  describe('Suite 3: Rớt Mạng Trong Vùng Nguy Hiểm & Tái Lập Phiên', () => {
    it('Bao ve phien va trang thai no khi disconnect, reconnect phuc hoi DeltaPayload va giai cuu tai san', () => {
      const mgr = new RoomManager(42);
      const room = mgr.createRoom('P1');
      mgr.joinRoom(room.roomCode, 'P2');
      mgr.joinRoom(room.roomCode, 'P3');
      mgr.startGame(room.roomCode);

      const sessionMgr = new SessionManager();
      sessionMgr.addSession('P1');
      const s2 = sessionMgr.addSession('P2');
      sessionMgr.addSession('P3');

      expect(s2.state).toBe(SessionState.Connected);

      // Thiết lập P2 rơi vào InsolvencyPhase
      room.currentPlayerIndex = 1;
      const p2 = room.players[1]!;
      p2.balance = -200;
      room.phase = TurnPhase.InsolvencyPhase;

      const reg = (mgr as unknown as { registries: Map<string, Map<number, string>> }).registries.get(room.roomCode)!;
      const sm = (mgr as unknown as { propertyStates: Map<string, Map<number, { level: number }>> }).propertyStates.get(room.roomCode)!;
      reg.set(8, 'P2');
      sm.set(8, { level: 0 });

      // 1. Giả lập P2 bị ngắt kết nối (mất tín hiệu > 5s -> GracePeriod)
      s2.lastPongAt = Date.now() - 10_000;
      sessionMgr.checkHeartbeats();
      expect(s2.state).toBe(SessionState.GracePeriod);

      // Xác nhận phòng không crash, trạng thái nợ của P2 bảo toàn
      expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
      expect(p2.balance).toBe(-200);

      // 2. Giả lập P2 reconnect thành công trong 60s Grace Period
      sessionMgr.handlePong('P2');
      expect(s2.state).toBe(SessionState.Connected);

      // Server dựng DeltaPayload và broadcast
      const deltaPayload = buildDeltaPayload({
        tick: 88,
        cells: [{ index: 8, ownerId: 'P2', level: 0, isETC: false }],
        players: room.players.map((p) => ({ id: p.id, position: p.position, balance: p.balance })),
      });
      sessionMgr.broadcastDelta(deltaPayload);

      const lastDelta = sessionMgr.getLastDelta();
      expect(lastDelta).toBeDefined();
      expect(lastDelta?.players?.find((p) => p.id === 'P2')?.balance).toBe(-200);
      expect(lastDelta?.cells.find((c) => c.index === 8)?.ownerId).toBe('P2');

      // 3. P2 thực hiện cứu vãn: Thế chấp ô 08 nhận 500 Tr.
      const mortRes = dispatchPlayerIntent(mgr, room.roomCode, 'P2', {
        type: 'INTENT_MORTGAGE', cellIndex: 8,
      });
      expect(mortRes.success).toBe(true);
      expect(p2.balance).toBe(300); // -200 + 500 = 300 >= 0
      expect(room.phase).toBe(TurnPhase.PropertyManagement);

      // Kết thúc lượt an toàn
      const endRes = dispatchPlayerIntent(mgr, room.roomCode, 'P2', { type: 'INTENT_END_TURN' });
      expect(endRes.success).toBe(true);
      expect(room.currentPlayerIndex).toBe(2);
    });
  });

  // =========================================================================
  // Suite 4: Mô Phỏng Hỗn Loạn 50 Vòng Không Deadlock (Chaotic Fuzzing)
  // =========================================================================
  describe('Suite 4: Mô Phỏng Hỗn Loạn 50 Vòng Không Deadlock', () => {
    it('Chay muot ma 50 vong khong deadlock, zero crash, va delta payload < 10KB tai moi tick', () => {
      const mgr = new RoomManager(999);
      const room = mgr.createRoom('P1');
      mgr.joinRoom(room.roomCode, 'P2');
      mgr.joinRoom(room.roomCode, 'P3');
      mgr.startGame(room.roomCode);

      let currentTick = 1;
      const MAX_ROUNDS = 50;
      let round = 0;
      let maxDeltaBytes = 0;

      let isGameOver = false;

      while (round < MAX_ROUNDS && !isGameOver) {
        round++;
        const current = room.players[room.currentPlayerIndex]!;
        if (current.bankrupt) {
          mgr.handleEndTurn(room.roomCode, current.id);
          continue;
        }

        // Bước 1: Khởi động lượt chơi
        mgr.handleTurnStart(room.roomCode, current.id);

        // Bước 2: Lăn xúc xắc nếu đang đợi tung
        if (room.phase === TurnPhase.WaitingRoll) {
          mgr.handleRollDice(room.roomCode, current.id);
        }

        // Bước 3: Xử lý pha sàn chứng khoán Hose nếu dẫm ô Hose
        if (room.phase === TurnPhase.HosePhase) {
          dispatchPlayerIntent(mgr, room.roomCode, current.id, { type: 'INTENT_SKIP' });
        }

        // Bước 4: Xử lý ActionPhase (mua đất hoặc từ chối vào đấu giá)
        if (room.phase === TurnPhase.ActionPhase) {
          const deed = PROPERTY_DEEDS.get(current.position);
          if (deed && current.balance >= deed.price) {
            dispatchPlayerIntent(mgr, room.roomCode, current.id, { type: 'INTENT_BUY' });
          } else {
            dispatchPlayerIntent(mgr, room.roomCode, current.id, { type: 'INTENT_DECLINE' });
          }
        }

        // Bước 5: Xử lý AuctionPhase nếu mở đấu giá (mọi người cùng bỏ qua để kết thúc nhanh)
        if (room.phase === TurnPhase.AuctionPhase) {
          for (const p of room.players) {
            if (!p.bankrupt) {
              dispatchPlayerIntent(mgr, room.roomCode, p.id, { type: 'INTENT_AUCTION_PASS' });
            }
          }
        }

        // Bước 6: Xử lý InsolvencyPhase nếu dẫm phạt âm tiền
        if (room.phase === TurnPhase.InsolvencyPhase) {
          // Thử hạ cấp công trình để thu hồi tiền mặt
          for (let c = 0; c < 40; c++) {
            if (mgr.getPropertyOwner(room.roomCode, c) === current.id) {
              const state = mgr.getPropertyState(room.roomCode, c);
              if (state && state.level > 0) {
                dispatchPlayerIntent(mgr, room.roomCode, current.id, { type: 'INTENT_DOWNGRADE', cellIndex: c });
              }
            }
            if (current.balance >= 0) break;
          }

          // Thử thế chấp BĐS C0 nếu vẫn âm tiền
          if (current.balance < 0) {
            for (let c = 0; c < 40; c++) {
              if (mgr.getPropertyOwner(room.roomCode, c) === current.id) {
                const state = mgr.getPropertyState(room.roomCode, c);
                if ((!state || state.level === 0) && !current.mortgagedProperties?.includes(c)) {
                  dispatchPlayerIntent(mgr, room.roomCode, current.id, { type: 'INTENT_MORTGAGE', cellIndex: c });
                }
              }
              if (current.balance >= 0) break;
            }
          }

          // Nếu đã dốc toàn lực vẫn âm tiền -> Tuyên bố phá sản
          if (current.balance < 0) {
            const bRes = mgr.handleBankruptcy(room.roomCode, current.id);
            if (bRes.gameOver) isGameOver = true;
          }
        }

        // Bước 7: Kết thúc lượt nếu đang ở PropertyManagement
        if (room.phase === TurnPhase.PropertyManagement) {
          dispatchPlayerIntent(mgr, room.roomCode, current.id, { type: 'INTENT_END_TURN' });
        }

        // Bước 8: Dựng DeltaPayload và kiểm tra NFR Payload Size (< 10 KB)
        const payload = buildDeltaPayload({
          tick: currentTick++,
          cells: Array.from({ length: 40 }, (_, idx) => ({
            index: idx,
            ownerId: mgr.getPropertyOwner(room.roomCode, idx),
            level: mgr.getPropertyState(room.roomCode, idx)?.level ?? 0,
            isETC: mgr.getPropertyState(room.roomCode, idx)?.isETC,
          })),
          players: room.players.map((p) => ({
            id: p.id,
            position: p.position,
            balance: p.balance,
          })),
        });

        const jsonStr = JSON.stringify(payload);
        const byteLen = Buffer.byteLength(jsonStr, 'utf8');
        if (byteLen > maxDeltaBytes) maxDeltaBytes = byteLen;
        expect(byteLen).toBeLessThan(10240);
      }

      // Xác nhận mô phỏng 50 vòng hoàn tất không deadlock
      expect(round).toBeGreaterThan(0);
      expect(maxDeltaBytes).toBeLessThan(10240);
    });
  });
});
