// [UC-GAME-028/MSS][UC-GAME-047/MSS][UI-S04/MSS] Phase 4: FSM Micro-States, Auction & Upgrades
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RoomManager } from '../../src/server/room_manager';
import { TurnPhase, createRoom, createPlayer } from '../../src/domain/room';
import { handleAuctionBid, type AuctionSession } from '../../src/server/auction_manager';
import { handleAuditTurnTransition } from '../../src/server/audit_manager';
import { SessionManager, type AuctionPayload, type DeltaPayload } from '../../src/server/session_manager';
import { buildSparseDelta } from '../../src/server/network/delta_broadcaster';
import { applyDeltaToStore } from '../../src/client/network/apply_delta';
import { useGameStore } from '../../src/client/store/game_store';
import { TitleDeedModal } from '../../src/client/ui/modals/title_deed_modal';
import { ModalHost } from '../../src/client/ui/modals/modal_host';

describe('[UC-GAME-028/MSS] Đấu Giá BĐS & INTENT_DECLINE', () => {
  it('người chơi gửi INTENT_DECLINE -> khởi tạo AuctionSession với endTime 15s và chuyển sang AuctionPhase', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);

    // p1 dừng ở ô 1 (Cần Thơ, ActionPhase)
    room.players[0]!.position = 1;
    room.phase = TurnPhase.ActionPhase;

    const res = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_DECLINE' });

    expect(res.success).toBe(true);
    expect(room.phase).toBe(TurnPhase.AuctionPhase);

    // Delta broadcast chứa thông tin auction
    const delta = mgr.createDelta(room.roomCode, 1);
    expect(delta?.auction).toBeDefined();
    expect(delta?.auction?.cellIndex).toBe(1);
    expect(delta?.auction?.currentBid).toBe(300); // 50% của 600
    expect(delta?.auction?.highestBidderId).toBeNull();
    expect(delta?.auction?.timeRemaining).toBeGreaterThanOrEqual(14);
    expect(delta?.auction?.timeRemaining).toBeLessThanOrEqual(15);
  });
});

describe('[EC-13/MSS] Cơ Chế Anti-Sniping Trong Đấu Giá BĐS', () => {
  it('tự động cộng thêm +3 giây (+3000ms) nếu có lệnh đặt giá hợp lệ khi thời gian còn lại <= 3 giây', () => {
    const session: AuctionSession = {
      cellIndex: 1,
      declinedPlayerId: 'p1',
      highestBid: 300,
      endTime: Date.now() + 2_000, // 2s còn lại (<= 3s)
    };
    const room = createRoom('p1');
    const p2 = createPlayer('p2');
    p2.balance = 5000;
    room.players.push(p2);
    room.started = true;
    room.phase = TurnPhase.AuctionPhase;

    const initialEndTime = session.endTime!;
    const res = handleAuctionBid(room, session, 'p2', 400);

    expect(res.success).toBe(true);
    expect(session.highestBid).toBe(400);
    expect(session.highestBidder).toBe('p2');
    // Đã được cộng thêm 3000ms
    expect(session.endTime).toBe(initialEndTime + 3_000);
  });

  it('không gia hạn thêm thời gian nếu thời gian còn lại > 3 giây', () => {
    const session: AuctionSession = {
      cellIndex: 1,
      declinedPlayerId: 'p1',
      highestBid: 300,
      endTime: Date.now() + 10_000, // 10s còn lại (> 3s)
    };
    const room = createRoom('p1');
    const p2 = createPlayer('p2');
    p2.balance = 5000;
    room.players.push(p2);
    room.started = true;
    room.phase = TurnPhase.AuctionPhase;

    const initialEndTime = session.endTime!;
    const res = handleAuctionBid(room, session, 'p2', 400);

    expect(res.success).toBe(true);
    expect(session.endTime).toBe(initialEndTime);
  });
  it('từ chối lệnh đặt giá khi phiên đấu giá đã hết hạn (remainingSec <= 0)', () => {
    const session: AuctionSession = {
      cellIndex: 1,
      declinedPlayerId: 'p1',
      highestBid: 300,
      endTime: Date.now() - 1_000, // Đã hết hạn 1s trước
    };
    const room = createRoom('p1');
    const p2 = createPlayer('p2');
    p2.balance = 5000;
    room.players.push(p2);
    room.started = true;
    room.phase = TurnPhase.AuctionPhase;

    const res = handleAuctionBid(room, session, 'p2', 400);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('AUCTION_EXPIRED');
  });
});

describe('[UC-GAME-047/MSS] Chu Trình 3 Vòng Tại Trạm Kiểm Toán Ô 10 (Full Jail Lifecycle)', () => {
  it('người chơi ở Ô 10 gieo không ra đôi -> trả về RollResult hợp lệ, không bị CANNOT_ROLL, giữ nguyên vị trí ô 10', () => {
    const mgr = new RoomManager(42); // Seed 42 không ra đôi
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);

    room.players[0]!.position = 10;
    room.players[0]!.auditTurnsLeft = 2;

    const intentRes = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_ROLL' });
    expect(intentRes.success).toBe(true);
    expect(intentRes.reason).toBeUndefined();
    expect(room.players[0]!.position).toBe(10);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
  });

  it('thụ án đủ 3 lượt không ra đôi -> tự động trừ 500 Tr. tiền bảo lãnh vào Kho Bạc và cho phép ra tù', () => {
    const room = createRoom('p1');
    const p1 = room.players[0]!;
    p1.position = 10;
    p1.balance = 2000;
    p1.auditTurnsLeft = 1; // Lượt cuối cùng trong 3 lượt
    room.treasury = 100;

    handleAuditTurnTransition(room, p1);

    expect(p1.auditTurnsLeft).toBe(0);
    expect(p1.balance).toBe(1500); // 2000 - 500
    expect(room.treasury).toBe(600); // 100 + 500
  });

  it('chu trình hoàn chỉnh 3 vòng thụ án: vào tù vòng 0 không bị trừ lượt ngay, đủ 3 vòng gieo không đôi mới nộp bảo lãnh và thoát', () => {
    // Seed 42: không đổ đôi
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    room.treasury = 0;

    // Giả lập p1 vừa bị tống vào tù trong lượt này (Vòng 0)
    room.players[0]!.position = 10;
    room.players[0]!.auditTurnsLeft = 3;
    const initialBalance = room.players[0]!.balance;

    // Vòng 0 kết thúc lượt -> auditTurnsLeft VẪN GIỮ NGUYÊN là 3 (vì lượt này vào tù, chưa thụ án)
    mgr.handleEndTurn(room.roomCode, 'p1');
    expect(room.players[0]!.auditTurnsLeft).toBe(3);
    expect(room.players[0]!.balance).toBe(initialBalance);

    // p2 chơi và kết thúc lượt
    mgr.handleRollDice(room.roomCode, 'p2');
    mgr.handleEndTurn(room.roomCode, 'p2');
    expect(room.currentPlayerIndex).toBe(0);

    // --- VÒNG THỤ ÁN 1 của p1 ---
    const roll1 = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_ROLL' });
    expect(roll1.success).toBe(true);
    expect(room.players[0]!.position).toBe(10);
    mgr.handleEndTurn(room.roomCode, 'p1');
    expect(room.players[0]!.auditTurnsLeft).toBe(2); // Giảm xuống 2

    // p2 chơi
    mgr.handleRollDice(room.roomCode, 'p2');
    mgr.handleEndTurn(room.roomCode, 'p2');
    expect(room.currentPlayerIndex).toBe(0);

    // --- VÒNG THỤ ÁN 2 của p1 ---
    const roll2 = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_ROLL' });
    expect(roll2.success).toBe(true);
    expect(room.players[0]!.position).toBe(10);
    mgr.handleEndTurn(room.roomCode, 'p1');
    expect(room.players[0]!.auditTurnsLeft).toBe(1); // Giảm xuống 1

    // p2 chơi
    mgr.handleRollDice(room.roomCode, 'p2');
    mgr.handleEndTurn(room.roomCode, 'p2');
    expect(room.currentPlayerIndex).toBe(0);

    // --- VÒNG THỤ ÁN 3 của p1 (vòng cuối) ---
    const roll3 = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_ROLL' });
    expect(roll3.success).toBe(true);
    expect(room.players[0]!.position).toBe(10);
    mgr.handleEndTurn(room.roomCode, 'p1');
    // Hết 3 vòng: auditTurnsLeft = 0, nộp 500 Tr. bảo lãnh vào Kho Bạc
    expect(room.players[0]!.auditTurnsLeft).toBe(0);
    expect(room.players[0]!.balance).toBe(initialBalance - 500);
    expect(room.treasury).toBe(500);

    // p2 chơi
    mgr.handleRollDice(room.roomCode, 'p2');
    mgr.handleEndTurn(room.roomCode, 'p2');
    expect(room.currentPlayerIndex).toBe(0);

    // --- VÒNG 4: p1 đã tự do, tung xúc xắc và di chuyển bình thường khỏi ô 10 ---
    const roll4 = mgr.handleRollDice(room.roomCode, 'p1');
    expect(roll4).toBeDefined();
    expect(room.players[0]!.position).not.toBe(10);
  });
});

describe('[UI-S04/MSS] TitleDeedModal Nâng Cấp & Hạ Cấp BĐS', () => {
  it('hiển thị nút Nâng Cấp và Hạ Cấp khi isOwner = true, !isMortgaged và level phù hợp', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        isOwned: true,
        isOwner: true,
        isMortgaged: false,
        currentLevel: 1,
        upgradeCost: 450,
        onUpgrade: () => {},
        onDowngrade: () => {},
      })
    );
    expect(html).toContain('Nâng Cấp (+450 Tr.)');
    expect(html).toContain('Hạ Cấp (-50%)');
  });

  it('ở cấp C0 (chưa nâng cấp): chỉ hiển thị Nâng Cấp, không hiển thị Hạ Cấp', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        isOwned: true,
        isOwner: true,
        isMortgaged: false,
        currentLevel: 0,
        upgradeCost: 300,
        onUpgrade: () => {},
        onDowngrade: () => {},
      })
    );
    expect(html).toContain('Nâng Cấp (+300 Tr.)');
    expect(html).not.toContain('Hạ Cấp (-50%)');
  });

  it('ở cấp C3 (tối đa): chỉ hiển thị Hạ Cấp, không hiển thị Nâng Cấp', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        isOwned: true,
        isOwner: true,
        isMortgaged: false,
        currentLevel: 3,
        upgradeCost: 0,
        onUpgrade: () => {},
        onDowngrade: () => {},
      })
    );
    expect(html).not.toContain('Nâng Cấp');
    expect(html).toContain('Hạ Cấp (-50%)');
  });

  it('khi không phải chủ sở hữu (isOwner = false): không hiển thị Nâng Cấp hoặc Hạ Cấp', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        isOwned: true,
        isOwner: false,
        isMortgaged: false,
        currentLevel: 1,
        upgradeCost: 450,
        onUpgrade: () => {},
        onDowngrade: () => {},
      })
    );
    expect(html).not.toContain('Nâng Cấp');
    expect(html).not.toContain('Hạ Cấp');
  });

  it('khi tài sản đang thế chấp (isMortgaged = true): không hiển thị Nâng Cấp hoặc Hạ Cấp', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        isOwned: true,
        isOwner: true,
        isMortgaged: true,
        currentLevel: 1,
        upgradeCost: 450,
        onUpgrade: () => {},
        onDowngrade: () => {},
      })
    );
    expect(html).not.toContain('Nâng Cấp');
    expect(html).not.toContain('Hạ Cấp');
  });

  it('không hiển thị Nâng Cấp và Hạ Cấp đối với Bến/Ga (Railroad) và Tiện ích (Utility)', () => {
    // Ô 5: Ga Sài Gòn (Railroad)
    const railroadHtml = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 5,
        isOwned: true,
        isOwner: true,
        isMortgaged: false,
        currentLevel: 0,
        upgradeCost: 0,
        onUpgrade: () => {},
        onDowngrade: () => {},
      })
    );
    expect(railroadHtml).not.toContain('Nâng Cấp');
    expect(railroadHtml).not.toContain('Hạ Cấp');

    // Ô 12: EVN (Utility)
    const utilityHtml = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 12,
        isOwned: true,
        isOwner: true,
        isMortgaged: false,
        currentLevel: 0,
        upgradeCost: 0,
        onUpgrade: () => {},
        onDowngrade: () => {},
      })
    );
    expect(utilityHtml).not.toContain('Nâng Cấp');
    expect(utilityHtml).not.toContain('Hạ Cấp');
  });
});

describe('[NET-S04/MSS] Client Sàn Đấu Giá Tự Động & Sparse Delta Sync', () => {
  it('tự động mở auction modal khi nhận delta.auction và đóng modal khi delta.auction === null', () => {
    useGameStore.getState().closeModal();

    const auctionPayload: AuctionPayload = {
      cellIndex: 1,
      currentBid: 500,
      highestBidderId: 'p2',
      timeRemaining: 12,
    };

    applyDeltaToStore({
      tick: 1,
      cells: [],
      auction: auctionPayload,
    });

    expect(useGameStore.getState().activeModal).toBe('auction');
    expect((useGameStore.getState().modalPayload as AuctionPayload).currentBid).toBe(500);

    // Phiên kết thúc: delta.auction === null
    applyDeltaToStore({
      tick: 2,
      cells: [],
      auction: null,
    });

    expect(useGameStore.getState().activeModal).toBeNull();
  });

  it('buildSparseDelta bảo toàn trường auction trong quá trình đấu giá và khi kết thúc', () => {
    const prevDelta: DeltaPayload = {
      tick: 1,
      cells: [{ index: 1, ownerId: null, level: 0 }],
      players: [{ id: 'p1', position: 1, balance: 1000 }],
      currentPlayerIndex: 0,
      currentTurnPlayerId: 'p1',
      auction: null,
    };

    const activeAuctionDelta: DeltaPayload = {
      tick: 2,
      cells: [{ index: 1, ownerId: null, level: 0 }],
      players: [{ id: 'p1', position: 1, balance: 1000 }],
      currentPlayerIndex: 0,
      currentTurnPlayerId: 'p1',
      auction: {
        cellIndex: 1,
        currentBid: 300,
        highestBidderId: null,
        timeRemaining: 15,
      },
    };

    const sparseActive = buildSparseDelta(prevDelta, activeAuctionDelta);
    expect(sparseActive.auction).toBeDefined();
    expect(sparseActive.auction?.currentBid).toBe(300);

    const closedAuctionDelta: DeltaPayload = {
      tick: 3,
      cells: [{ index: 1, ownerId: 'p2', level: 0 }],
      players: [{ id: 'p1', position: 1, balance: 1000 }],
      currentPlayerIndex: 0,
      currentTurnPlayerId: 'p1',
      auction: null,
    };

    const sparseClosed = buildSparseDelta(activeAuctionDelta, closedAuctionDelta);
    expect(sparseClosed.auction).toBeNull();
  });

  it('SessionManager.broadcastDelta bảo toàn currentPlayerIndex, currentTurnPlayerId, dice và auction', () => {
    const sessionMgr = new SessionManager();
    const payload: DeltaPayload = {
      tick: 10,
      cells: [{ index: 1, ownerId: 'p1' }],
      players: [{ id: 'p1', position: 1, balance: 5000 }],
      currentPlayerIndex: 0,
      currentTurnPlayerId: 'p1',
      dice: [3, 4],
      auction: {
        cellIndex: 1,
        currentBid: 500,
        highestBidderId: 'p2',
        timeRemaining: 10,
      },
    };

    sessionMgr.broadcastDelta(payload);
    const last = sessionMgr.getLastDelta();

    expect(last).toBeDefined();
    expect(last?.currentPlayerIndex).toBe(0);
    expect(last?.currentTurnPlayerId).toBe('p1');
    expect(last?.dice).toEqual([3, 4]);
    expect(last?.auction?.currentBid).toBe(500);
  });
});

describe('[UI-S04/MSS] ModalHost TitleDeedModal onPass Integration', () => {
  it('TitleDeedModal hiển thị nút Bỏ Qua và cho phép người chơi từ chối mua', () => {
    let passCalled = false;
    const markup = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        canBuy: true,
        isOwned: false,
        onPass: () => {
          passCalled = true;
        },
      })
    );

    expect(markup).toContain('Bỏ Qua');
    expect(markup).toContain('Mua BĐS');
  });

  it('ModalHost render TitleDeedModal với props từ store', () => {
    useGameStore.setState({
      activeModal: 'deed',
      modalPayload: { cellIndex: 1, canBuy: true },
      currentTurnPlayerId: 'p1',
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, tokenColor: 'red', ownedProperties: [] },
      },
    });

    const markup = renderToStaticMarkup(
      React.createElement(ModalHost, {
        activeModal: 'deed',
        modalPayload: { cellIndex: 1, canBuy: true },
      })
    );

    expect(markup).toContain('Bỏ Qua');
    expect(markup).toContain('Mua BĐS');
  });
});

