// [TC-IMP249.01..TC-IMP249.22][UC-IMP249] Universal 5-Facet Contract Suite:
// IMP-249: PAWN PACING AND TRANSIT HOP AFFORDANCE
// Reference: .agents/plans/PLAN_IMP_249_PAWN_PACING_AND_TRANSIT_HOP_AFFORDANCE.md
// Domain Invariants: docs/domain/gotchas.md (Pillars I, II, IV, V, VI Detroit Classical)
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { TurnPhase, createRoom, createPlayer, type Room, type Player } from '../../src/domain/room.js';
import { MarketCardId, ChanceCardId } from '../../src/domain/event_card_types.js';
import { handleSpinTransitWheel } from '../../src/server/transit_wheel_handler.js';
import { handleBuyProperty } from '../../src/server/property_actions.js';
import { BuyResult, type PropertyRegistry, type PropertyStateMap } from '../../src/domain/property_manager.js';
import { TransitWheelOutcome } from '../../src/domain/transit_wheel.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import { ActionDock } from '../../src/client/ui/action_dock.js';
import { executeCellLanding } from '../../src/client/offline_landing.js';
import { DeedModalHost, canAffordDeedPurchase, type DeedModalHostProps } from '../../src/client/ui/modals/hosts/deed_modal_host.js';
import { ModalHost } from '../../src/client/ui/modals/modal_host.js';
import type { TitleDeedModalProps } from '../../src/client/ui/modals/title_deed_modal.js';
import { TransitWheelModal, getTransitWheelDismissText, type TransitWheelModalProps } from '../../src/client/ui/modals/transit_wheel_modal.js';
import { formatServerErrorMessage } from '../../src/client/ui/actionable_notification.js';
import { applyDeltaToStore } from '../../src/client/network/apply_delta.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';
import type { PlayerHudInfo, PendingPawnMove } from '../../src/client/store/game_store_types.js';

let capturedTitleDeedProps: TitleDeedModalProps | null = null;
vi.mock('../../src/client/ui/modals/title_deed_modal.js', () => ({
  TitleDeedModal: (props: TitleDeedModalProps): React.ReactElement => {
    capturedTitleDeedProps = props;
    return React.createElement('div', {
      'data-testid': 'title-deed-modal-stub',
      'data-can-buy': String(props.canBuy ?? false),
    });
  },
}));



function createTestPlayer(id: string, name: string, balance = 5000): Player {
  const p = createPlayer(id);
  p.name = name;
  p.balance = balance;
  p.position = 0;
  p.ownedProperties = [];
  p.mortgagedProperties = [];
  p.hand = [];
  return p;
}

function createTestHudPlayer(id: string, name: string, balance = 5000): PlayerHudInfo {
  return {
    id, name, balance, tokenColor: '#38BDF8',
    ownedProperties: [], mortgagedProperties: [], mortgageLoans: {},
    isBot: false, bankrupt: false, inAudit: false, auditTurnsLeft: 0,
    consecutiveDoubles: 0, skipNextTurn: false,
  };
}

describe('[TC-IMP249][UC-IMP249] Pawn Pacing & Transit Hop Affordance Contract Suite', () => {
  beforeEach(() => {
    capturedTitleDeedProps = null;
    useGameStore.getState().resetGameState();
    useLobbyStore.setState({ myPlayerId: 'p1' });
  });

  // FACET 1: Khóa Nhịp Độ Quân Cờ 3D & Action Dock (Pawn Pacing Lock)
  describe('Facet 1: Khóa Nhịp Độ Quân Cờ 3D & Action Dock (Pawn Pacing Lock)', () => {
    it('[UC-IMP249/A1] [TC-IMP249.01] isStandingOnBuyable trả về false khi isPawnMoving === true ngay cả khi turnPhase === ActionPhase và ô đất chưa có chủ', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'p1', playerPositions: { p1: 1 },
        turnPhase: TurnPhase.ActionPhase, hasRolledThisTurn: true,
        playersInfo: { p1: createTestHudPlayer('p1', 'Chủ Tịch Hưng') },
      });
      const html = renderToStaticMarkup(React.createElement(ActionDock, {
        localPlayerId: 'p1', isMyTurn: true, isPawnMoving: true, hasRolledThisTurn: true, canRollAgain: false,
      }));
      expect(html).not.toContain('Mua Đất');
    });

    it('[UC-IMP249/A2] [TC-IMP249.02] isStandingOnBuyable trả về false khi isRolling === true', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'p1', playerPositions: { p1: 1 },
        turnPhase: TurnPhase.ActionPhase, hasRolledThisTurn: false, isRolling: true,
        playersInfo: { p1: createTestHudPlayer('p1', 'Chủ Tịch Hưng') },
      });
      const html = renderToStaticMarkup(React.createElement(ActionDock, {
        localPlayerId: 'p1', isMyTurn: true, isPawnMoving: false, hasRolledThisTurn: false, canRollAgain: false,
      }));
      expect(html).not.toContain('Mua Đất');
    });

    it('[UC-IMP249/A3] [TC-IMP249.03] isStandingOnBuyable trả về false khi activePawnAnimation !== null', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'p1', playerPositions: { p1: 1 },
        turnPhase: TurnPhase.ActionPhase, hasRolledThisTurn: true,
        activePawnAnimation: { playerId: 'p1', fromCell: 0, targetCell: 1, waypoints: [1], isAnimating: true },
        playersInfo: { p1: createTestHudPlayer('p1', 'Chủ Tịch Hưng') },
      });
      const html = renderToStaticMarkup(React.createElement(ActionDock, {
        localPlayerId: 'p1', isMyTurn: true, hasRolledThisTurn: true, canRollAgain: false,
      }));
      expect(html).not.toContain('Mua Đất');
    });

    it('[UC-IMP249/MSS] [TC-IMP249.04] isStandingOnBuyable chuyển thành true ngay khi isPawnMoving === false và quân cờ đã chạm đất ô đất trống trong ActionPhase', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'p1', playerPositions: { p1: 1 },
        turnPhase: TurnPhase.ActionPhase, hasRolledThisTurn: true,
        isRolling: false, activePawnAnimation: null,
        playersInfo: { p1: createTestHudPlayer('p1', 'Chủ Tịch Hưng') },
      });
      const html = renderToStaticMarkup(React.createElement(ActionDock, {
        localPlayerId: 'p1', isMyTurn: true, isPawnMoving: false, hasRolledThisTurn: true, canRollAgain: false,
      }));
      expect(html).toContain('Mua Đất');
    });
  });

  // FACET 2: Chống Mở Đúp Modal Hạ Cánh (Duplicate Modal Suppression)
  describe('Facet 2: Chống Mở Đúp Modal Hạ Cánh (Duplicate Modal Suppression)', () => {
    it('[UC-IMP249/A4] [TC-IMP249.05] executeCellLanding không mở lại modal deed nếu đang mở modal deed của chính ô đó (cellIndex === targetCell)', () => {
      useGameStore.setState({
        activeModal: 'deed', modalPayload: { cellIndex: 15, isBuyOpportunity: true },
        playersInfo: { p1: createTestHudPlayer('p1', 'Chủ Tịch Hưng') },
      });
      const openModalSpy = vi.fn();
      useGameStore.setState({ openModal: openModalSpy });
      executeCellLanding('p1', 15, 'p1', false);
      expect(openModalSpy).not.toHaveBeenCalled();
    });

    it('[UC-IMP249/A5] [TC-IMP249.06] executeCellLanding không mở đè modal deed nếu activeModal === transit_wheel', () => {
      useGameStore.setState({
        activeModal: 'transit_wheel', modalPayload: { cellIndex: 15 },
        playersInfo: { p1: createTestHudPlayer('p1', 'Chủ Tịch Hưng') },
      });
      const openModalSpy = vi.fn();
      useGameStore.setState({ openModal: openModalSpy });
      executeCellLanding('p1', 25, 'p1', false);
      expect(openModalSpy).not.toHaveBeenCalled();
    });

    it('[UC-IMP249/MSS] [TC-IMP249.07] executeCellLanding mở modal deed của ô đích nếu người chơi đang mở xem một ô đất khác (cellIndex !== targetCell)', () => {
      useGameStore.setState({
        activeModal: 'deed', modalPayload: { cellIndex: 9, isBuyOpportunity: false },
        playersInfo: { p1: createTestHudPlayer('p1', 'Chủ Tịch Hưng') },
      });
      const openModalSpy = vi.fn();
      useGameStore.setState({ openModal: openModalSpy });
      executeCellLanding('p1', 15, 'p1', false);
      expect(openModalSpy).toHaveBeenCalledWith('deed', { cellIndex: 15, isBuyOpportunity: true });
    });
  });

  // FACET 3: Khóa Nguyên Tử Đang Gửi (Buy Button Submitting Mutex)
  describe('Facet 3: Khóa Nguyên Tử Đang Gửi (Buy Button Submitting Mutex)', () => {
    it('[UC-IMP249/MSS] [TC-IMP249.08] Trong DeedModalHost, bấm onBuy lần đầu kích hoạt onIntent, các lần click liên tiếp ngay sau đó bị chặn khi submittingRef.current === true', () => {
      const intentMock = vi.fn();
      const p1Hud = createTestHudPlayer('p1', 'Chủ Tịch Hưng', 5000);
      useGameStore.setState({ turnPhase: TurnPhase.ActionPhase, currentTurnPlayerId: 'p1', playersInfo: { p1: p1Hud } });
      const hostProps: DeedModalHostProps = {
        payload: { cellIndex: 1, isBuyOpportunity: true }, myId: 'p1', myPlayer: p1Hud,
        playersInfo: { p1: p1Hud }, onIntent: intentMock, closeModal: vi.fn(), updateModalPayload: vi.fn(),
      };
      renderToStaticMarkup(React.createElement(DeedModalHost, hostProps));
      expect(capturedTitleDeedProps).not.toBeNull();
      capturedTitleDeedProps?.onBuy?.();
      capturedTitleDeedProps?.onBuy?.();
      expect(intentMock).toHaveBeenCalledTimes(1);
    });

    it('[UC-IMP249/A6] [TC-IMP249.09] canAffordDeedPurchase vô hiệu hóa canBuy khi isSubmitting === true và cho phép khi isSubmitting === false', () => {
      expect(canAffordDeedPurchase(true, true)).toBe(false);
      expect(canAffordDeedPurchase(false, false)).toBe(false);
      expect(canAffordDeedPurchase(true, false)).toBe(true);
    });
  });

  // FACET 4: Chuẩn Hóa FSM Bước Nhảy Thứ Hai & Sự Kiện Ngoại Giao
  describe('Facet 4: Chuẩn Hóa FSM Bước Nhảy Thứ Hai & Sự Kiện Ngoại Giao', () => {
    it('[UC-IMP249/MSS] [TC-IMP249.10] Khi quay trúng SPEED_BOOST nhảy sang ô đất trống chưa có chủ, resolveSecondHopLanding chuyển room.phase = TurnPhase.ActionPhase', () => {
      const room: Room = createRoom('ROOM_249', 'p1');
      room.started = true;
      room.phase = TurnPhase.PropertyManagement;
      const p1 = createTestPlayer('p1', 'P1', 5000);
      p1.position = 25;
      room.players = [p1, createTestPlayer('p2', 'P2', 5000)];
      room.currentPlayerIndex = 0;
      room.pendingTransitWheel = { playerId: 'p1', cellIndex: 25, timestamp: Date.now() };
      let step = 0;
      // SPEED_BOOST (0.15) gieo xúc xắc 1D6 ra 1 (0.0) -> pos = 26 (ô đất trống)
      const res = handleSpinTransitWheel(room, 'p1', new Map(), new Map(), () => (++step === 1 ? 0.15 : 0.0));
      expect(res.outcome).toBe(TransitWheelOutcome.SPEED_BOOST);
      expect(room.phase).toBe(TurnPhase.ActionPhase);
    });

    it('[UC-IMP249/MSS] [TC-IMP249.11] Khi quay trúng SPEED_BOOST nhảy sang ô đất trống chưa có chủ, resolveSecondHopLanding chuyển room.phase = TurnPhase.ActionPhase', () => {
      const room: Room = createRoom('ROOM_249', 'p1');
      room.started = true;
      room.phase = TurnPhase.PropertyManagement;
      const p1 = createTestPlayer('p1', 'P1', 5000);
      p1.position = 5;
      room.players = [p1, createTestPlayer('p2', 'P2', 5000)];
      room.currentPlayerIndex = 0;
      room.pendingTransitWheel = { playerId: 'p1', cellIndex: 5, timestamp: Date.now() };
      let step = 0;
      const res = handleSpinTransitWheel(room, 'p1', new Map(), new Map(), () => (++step === 1 ? 0.15 : 0.0));
      expect(res.outcome).toBe(TransitWheelOutcome.SPEED_BOOST);
      expect(p1.position).toBe(6);
      expect(room.phase).toBe(TurnPhase.ActionPhase);
    });

    it('[UC-IMP249/MSS] [TC-IMP249.12] Sau khi bước nhảy thứ hai chuyển sang ActionPhase, người chơi gọi handleBuyProperty tại ô mới thành công mua đất (BuyResult.Success)', () => {
      const room: Room = createRoom('ROOM_249', 'p1');
      room.started = true;
      room.phase = TurnPhase.PropertyManagement;
      const p1 = createTestPlayer('p1', 'P1', 5000);
      p1.position = 15;
      room.players = [p1, createTestPlayer('p2', 'P2', 5000)];
      room.currentPlayerIndex = 0;
      room.pendingTransitWheel = { playerId: 'p1', cellIndex: 15, timestamp: Date.now() };
      const reg: PropertyRegistry = new Map();
      const sm: PropertyStateMap = new Map();
      let step12 = 0;
      handleSpinTransitWheel(room, 'p1', reg, sm, () => (++step12 === 1 ? 0.15 : 0.0)); // SPEED_BOOST +1 ô -> ô 16 (Bến Tre)
      const buyRes = handleBuyProperty(room, p1, reg);
      expect(buyRes?.result).toBe(BuyResult.Success);
    });

    it('[UC-IMP249/A7] [TC-IMP249.13] Tại bước nhảy thứ hai, nếu ô đất đã có chủ, người chơi nộp tiền thuê và room.phase giữ nguyên ở TurnPhase.PropertyManagement', () => {
      const room: Room = createRoom('ROOM_249', 'p1');
      room.started = true;
      room.phase = TurnPhase.PropertyManagement;
      const p1 = createTestPlayer('p1', 'P1', 5000);
      p1.position = 5;
      const p2 = createTestPlayer('p2', 'P2', 5000);
      p2.ownedProperties = [6];
      room.players = [p1, p2];
      room.currentPlayerIndex = 0;
      room.pendingTransitWheel = { playerId: 'p1', cellIndex: 5, timestamp: Date.now() };
      let step = 0;
      handleSpinTransitWheel(room, 'p1', new Map([[6, 'p2']]), new Map(), () => (++step === 1 ? 0.15 : 0.0));
      expect(p1.balance).toBeLessThan(5000);
      expect(room.phase).toBe(TurnPhase.PropertyManagement);
    });

    it('[UC-IMP249/A8] [TC-IMP249.14] Nếu thị trường đang đóng băng giao dịch (MC_FREEZE_TRADE), bước nhảy thứ hai không chuyển sang ActionPhase', () => {
      const room: Room = createRoom('ROOM_249', 'p1');
      room.started = true;
      room.phase = TurnPhase.PropertyManagement;
      room.activeModifiers = [{ type: MarketCardId.MC_FREEZE_TRADE, affectedCells: [], remainingRounds: 2 }];
      const p1 = createTestPlayer('p1', 'P1', 5000);
      p1.position = 15;
      room.players = [p1, createTestPlayer('p2', 'P2', 5000)];
      room.currentPlayerIndex = 0;
      room.pendingTransitWheel = { playerId: 'p1', cellIndex: 15, timestamp: Date.now() };
      let step14 = 0;
      handleSpinTransitWheel(room, 'p1', new Map(), new Map(), () => (++step14 === 1 ? 0.15 : 0.0)); // SPEED_BOOST +1 ô -> ô 16
      expect(room.phase).toBe(TurnPhase.PropertyManagement);
    });

    it('[UC-IMP249/A9] [TC-IMP249.15] Mua đất thành công tại bước nhảy thứ hai không kích hoạt đệ quy vòng xoay lần 2 vì hasSpunTransitThisTurn === true', () => {
      const room: Room = createRoom('ROOM_249', 'p1');
      room.started = true;
      room.phase = TurnPhase.PropertyManagement;
      const p1 = createTestPlayer('p1', 'P1', 5000);
      p1.position = 15;
      room.players = [p1, createTestPlayer('p2', 'P2', 5000)];
      room.currentPlayerIndex = 0;
      room.pendingTransitWheel = { playerId: 'p1', cellIndex: 15, timestamp: Date.now() };
      let step15 = 0;
      handleSpinTransitWheel(room, 'p1', new Map(), new Map(), () => (++step15 === 1 ? 0.15 : 0.0)); // SPEED_BOOST +1 ô -> ô 16
      expect(p1.hasSpunTransitThisTurn).toBe(true);
      expect(room.pendingTransitWheel).toBeNull();
    });

    it('[UC-IMP249/A10] [TC-IMP249.21] Tại bước nhảy thứ hai, nếu kích hoạt thẻ Ngoại Giao miễn tiền thuê, resolveSecondHopLanding gán chuẩn xác room.lastDiplomaticEvent', () => {
      const room: Room = createRoom('ROOM_249', 'p1');
      room.started = true;
      room.phase = TurnPhase.PropertyManagement;
      const p1 = createTestPlayer('p1', 'P1', 5000);
      p1.position = 5;
      p1.hand = [ChanceCardId.CC_DIPLOMATIC];
      const p2 = createTestPlayer('p2', 'P2', 5000);
      p2.ownedProperties = [6];
      room.players = [p1, p2];
      room.currentPlayerIndex = 0;
      room.pendingTransitWheel = { playerId: 'p1', cellIndex: 5, timestamp: Date.now() };
      let step = 0;
      handleSpinTransitWheel(room, 'p1', new Map([[6, 'p2']]), new Map(), () => (++step === 1 ? 0.15 : 0.0));
      expect(room.lastDiplomaticEvent?.landlordId).toBe('p2');
    });

    it('[UC-IMP249/A14] [TC-IMP249.23] Tại bước nhảy thứ hai rơi vào ô Cơ Hội, resolveSecondHopLanding tiêu thụ luồng deckRng độc lập và không làm ô nhiễm luồng xúc xắc rng', () => {
      const room: Room = createRoom('ROOM_249', 'p1');
      room.started = true;
      room.phase = TurnPhase.PropertyManagement;
      const p1 = createTestPlayer('p1', 'P1', 5000);
      p1.position = 5;
      room.players = [p1, createTestPlayer('p2', 'P2', 5000)];
      room.currentPlayerIndex = 0;
      room.pendingTransitWheel = { playerId: 'p1', cellIndex: 5, timestamp: Date.now() };
      let rngCalls = 0;
      const diceRng = () => {
        rngCalls++;
        return rngCalls === 1 ? 0.15 : 0.2; // 0.15 -> SPEED_BOOST, 0.2 -> boost = floor(0.2*6)+1 = 2 -> pos = 7 (Chance)
      };
      let deckRngCalls = 0;
      const deckRng = () => {
        deckRngCalls++;
        return 0.5;
      };
      handleSpinTransitWheel(room, 'p1', new Map(), new Map(), diceRng, deckRng);
      expect(p1.position).toBe(7); // Cell 7 = Chance
      expect(deckRngCalls).toBeGreaterThan(0); // deckRng was consumed to draw card!
      expect(rngCalls).toBe(2); // exactly 2 diceRng calls: 1 for outcome, 1 for boost amount!
    });
  });

  // FACET 5: Chỉ Dẫn UX, Bản Đồ Lỗi & Dọn Dẹp Trạng Thái
  describe('Facet 5: Chỉ Dẫn UX, Bản Đồ Lỗi & Dọn Dẹp Trạng Thái', () => {
    it('[UC-IMP249/MSS] [TC-IMP249.16] Action dock kích hoạt shouldPulseEndTurn === true khi đã đổ xúc xắc, không thể mua đất và quân cờ đã dừng lại', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'p1', playerPositions: { p1: 0 },
        turnPhase: TurnPhase.ActionPhase, hasRolledThisTurn: true,
        isRolling: false, activePawnAnimation: null,
        playersInfo: { p1: createTestHudPlayer('p1', 'Chủ Tịch Hưng') },
      });
      const html = renderToStaticMarkup(React.createElement(ActionDock, {
        localPlayerId: 'p1', isMyTurn: true, isPawnMoving: false, hasRolledThisTurn: true, canRollAgain: false,
      }));
      expect(html).toContain('ring-emerald-400/90');
    });

    it('[UC-IMP249/MSS] [TC-IMP249.17] formatServerErrorMessage("INTENT_REJECTED") trả về thông báo tiếng Việt có nghĩa và hành động chỉ dẫn rõ ràng', () => {
      const expected = 'Hành Động Chưa Thể Thực Hiện: Thao tác không phù hợp với giai đoạn lượt chơi hiện tại hoặc tài sản không khả dụng. 👉 Vui lòng kiểm tra trạng thái lượt chơi hoặc bấm Kết Thúc Lượt.';
      expect(formatServerErrorMessage('INTENT_REJECTED')).toBe(expected);
      expect(formatServerErrorMessage('intent_rejected')).toBe(expected);
      expect(formatServerErrorMessage('IntentRejected')).toBe(expected);
    });

    it('[UC-IMP249/A11] [TC-IMP249.18] apply_delta không đóng modal transit_wheel khi delta.turnPhase === TurnPhase.ActionPhase', () => {
      useGameStore.setState({ activeModal: 'transit_wheel', modalPayload: { cellIndex: 15 } });
      const delta: DeltaPayload = { roomCode: 'VTTEST', tick: 2, cells: [], turnPhase: TurnPhase.ActionPhase };
      applyDeltaToStore(delta);
      expect(useGameStore.getState().activeModal).toBe('transit_wheel');
    });

    it('[UC-IMP249/A12] [TC-IMP249.19] Action dock không nhấp nháy đèn xanh shouldPulseEndTurn trong AuctionPhase hoặc HosePhase', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'p1', playerPositions: { p1: 0 },
        turnPhase: TurnPhase.AuctionPhase, hasRolledThisTurn: true,
        isRolling: false, activePawnAnimation: null,
        playersInfo: { p1: createTestHudPlayer('p1', 'Chủ Tịch Hưng') },
      });
      const htmlAuction = renderToStaticMarkup(React.createElement(ActionDock, {
        localPlayerId: 'p1', isMyTurn: true, isPawnMoving: false, hasRolledThisTurn: true, canRollAgain: false,
      }));
      useGameStore.setState({ turnPhase: TurnPhase.HosePhase });
      const htmlHose = renderToStaticMarkup(React.createElement(ActionDock, {
        localPlayerId: 'p1', isMyTurn: true, isPawnMoving: false, hasRolledThisTurn: true, canRollAgain: false,
      }));
      expect(htmlAuction).not.toContain('ring-emerald-400/90');
      expect(htmlHose).not.toContain('ring-emerald-400/90');
    });

    it('[UC-IMP249/MSS] [TC-IMP249.20] getTransitWheelDismissText hiển thị "Xác Nhận & Ở Lại Trạm" cho CASH_BACK/FLIGHT_DELAY và "Tiếp Tục Di Chuyển Đến Ô Mới" cho di chuyển', () => {
      expect(getTransitWheelDismissText(TransitWheelOutcome.CASH_BACK)).toBe('Xác Nhận & Ở Lại Trạm');
      expect(getTransitWheelDismissText(TransitWheelOutcome.FLIGHT_DELAY)).toBe('Xác Nhận & Ở Lại Trạm');
      expect(getTransitWheelDismissText(TransitWheelOutcome.PASS_GO_FLIGHT)).toBe('Tiếp Tục Di Chuyển Đến Ô Mới');
      expect(getTransitWheelDismissText(TransitWheelOutcome.SPEED_BOOST)).toBe('Tiếp Tục Di Chuyển Đến Ô Mới');
    });

    it('[UC-IMP249/MSS] [TC-IMP249.21] getTransitWheelDismissText hiển thị "Xác Nhận & Ở Lại Trạm" khi targetCell trùng cellIndex (SAFE_HAVEN không có đất)', () => {
      expect(getTransitWheelDismissText(TransitWheelOutcome.SAFE_HAVEN, 5, 5)).toBe('Xác Nhận & Ở Lại Trạm');
      expect(getTransitWheelDismissText(TransitWheelOutcome.SAFE_HAVEN, 12, 5)).toBe('Tiếp Tục Di Chuyển Đến Ô Mới');
    });

    it('[UC-IMP249/A13] [TC-IMP249.22] Khi cưỡng chế đóng modal transit_wheel do đổi pha/hết giờ, apply_delta giải phóng hoàn toàn pendingPawnMove = null', () => {
      const initialPendingMove: PendingPawnMove = { playerId: 'p1', fromCell: 5, targetCell: 25 };
      useGameStore.setState({ activeModal: 'transit_wheel', modalPayload: { cellIndex: 5 }, pendingPawnMove: initialPendingMove });
      const delta: DeltaPayload = { roomCode: 'VTTEST', tick: 3, cells: [], turnPhase: TurnPhase.WaitingRoll };
      applyDeltaToStore(delta);
      expect(useGameStore.getState().pendingPawnMove).toBeNull();
    });

    it('[UC-IMP249/A15] [TC-IMP249.24] ModalHost bọc DeedModalHost dưới dạng JSX Component Element để cô lập Hook dispatcher và ngăn ngừa React Error #310', () => {
      useGameStore.setState({
        activeModal: 'deed',
        modalPayload: { cellIndex: 1, canBuy: true },
        playersInfo: { p1: createTestHudPlayer('p1', 'Chủ Tịch Hưng') },
      });
      const html = renderToStaticMarkup(React.createElement(ModalHost, {
        activeModal: 'deed',
        modalPayload: { cellIndex: 1, canBuy: true },
        localPlayerId: 'p1',
      }));
      expect(html).toContain('title-deed-modal-stub');
    });
  });
});
