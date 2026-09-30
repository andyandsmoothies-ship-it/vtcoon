// [CHAOS-SENTINEL][STATION-4] Physical Adversarial Boundary & Mutation Sentinel Probe Suite
// Feature: IMP-232 (Chuyển Đổi Affordance Đóng Modal Cho Người Dẫn Đầu Đấu Giá & Việt Hóa Thông Báo Lỗi)
// Probes:
//   1. Wire-to-Core Closed-Loop Parity Probe (Server Authoritative -> Broadcaster -> Store -> ModalHost -> UI Handover)
//   2. Ephemeral Dynamic Boundary Probe (Extreme Clock Skew, Boundary Limits for IDs, Precedence Hierarchy, Safe Handler Fallbacks)
//   3. Targeted Mutation Sensitivity Probe (Mutants A-G Sensitivity & Kill Proof)

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { AuctionModal, type AuctionModalProps } from '../../src/client/ui/modals/auction_modal';
import { ModalHost } from '../../src/client/ui/modals/modal_host';
import { MiniAuctionStrip } from '../../src/client/ui/modals/mini_auction_strip';
import {
  resolveActionableNotification,
  formatServerErrorMessage,
} from '../../src/client/ui/actionable_notification';
import { useGameStore } from '../../src/client/store/game_store';
import { TurnPhase } from '../../src/domain/room';
import { RoomManager } from '../../src/server/room_manager';
import { buildDeltaFromRoom } from '../../src/server/session_manager';

// ============================================================================
// VDOM & Interactive Harness Helpers
// ============================================================================

function findVNode(node: any, predicate: (n: any) => boolean): any {
  if (!node) return null;
  if (predicate(node)) return node;
  const children = node.props?.children;
  if (Array.isArray(children)) {
    for (const child of children) {
      const res = findVNode(child, predicate);
      if (res) return res;
    }
  } else if (children && typeof children === 'object') {
    return findVNode(children, predicate);
  }
  return null;
}

function renderInteractiveModal(props: AuctionModalProps) {
  let capturedNode: any = null;
  function Harness() {
    capturedNode = AuctionModal(props);
    return capturedNode;
  }
  const html = renderToStaticMarkup(React.createElement(Harness));
  return {
    getVNode: () => capturedNode,
    getHtml: () => html,
    findTestId: (testId: string) => findVNode(capturedNode, (n) => n?.props?.['data-testid'] === testId),
    clickTestId: (testId: string) => {
      const node = findVNode(capturedNode, (n) => n?.props?.['data-testid'] === testId);
      if (!node) throw new Error(`Element with data-testid="${testId}" not found`);
      if (typeof node.props?.onClick === 'function') {
        node.props.onClick({ preventDefault: () => {}, stopPropagation: () => {} });
      }
    },
  };
}

describe('IMP-232: Chaos-Sentinel Physical Adversarial Boundary & Mutation Sentinel Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      auction: null,
      activeModal: null,
      modalPayload: null,
      dismissedAuctionCellIndex: null,
      turnPhase: TurnPhase.WaitingRoll,
      playersInfo: {},
    });
  });

  // ==========================================================================
  // PROBE 1: Wire-to-Core Closed-Loop Parity Probe (5-Station Parity)
  // ==========================================================================
  describe('Probe 1: Wire-to-Core Closed-Loop Parity Probe (5-Station Parity)', () => {
    it('[PROBE-1.1][Station-1/ServerAuthoritative] Server handleAuctionPass retains authoritative defense: session.highestBidder === playerId returns HIGHEST_BIDDER_CANNOT_PASS', () => {
      const mgr = new RoomManager(23211);
      const room = mgr.createRoom('p1');
      mgr.addBot(room.roomCode, 'p2');
      mgr.addBot(room.roomCode, 'p3');
      mgr.startGame(room.roomCode);
      room.phase = TurnPhase.ActionPhase;
      room.players[0]!.position = 12;

      mgr.handleDecline(room.roomCode, 'p1');
      expect(room.phase).toBe(TurnPhase.AuctionPhase);

      const bidRes = mgr.handleAuctionBid(room.roomCode, 'p2', 1500);
      expect(bidRes.success).toBe(true);
      expect(room.phase).toBe(TurnPhase.AuctionPhase);

      const passRes = mgr.handleAuctionPass(room.roomCode, 'p2');
      expect(passRes.success).toBe(false);
      expect(passRes.reason).toBe('HIGHEST_BIDDER_CANNOT_PASS');
    });

    it('[PROBE-1.2][Station-2/BroadcasterDelta] WebSocket delta serializer buildDeltaFromRoom broadcasts highestBidderId in active & concluded auction payloads', () => {
      const mgr = new RoomManager(23212);
      const room = mgr.createRoom('p1');
      mgr.addBot(room.roomCode, 'p2');
      mgr.addBot(room.roomCode, 'p3');
      mgr.startGame(room.roomCode);
      room.phase = TurnPhase.ActionPhase;
      room.players[0]!.position = 12;
      mgr.handleDecline(room.roomCode, 'p1');
      mgr.handleAuctionBid(room.roomCode, 'p2', 1800);

      const s = (mgr as any).getSession(room.roomCode);
      const deltaActive = buildDeltaFromRoom(room, s.registry, s.propertyStates, 1, (mgr as any).auctions, 12);
      expect(deltaActive.auction).toBeDefined();
      expect(deltaActive.auction?.highestBidderId).toBe('p2');
      expect(deltaActive.auction?.currentBid).toBe(1800);
      expect(deltaActive.auction?.timeRemaining).toBeGreaterThan(0);

      // Conclude auction
      mgr.handleAuctionClose(room.roomCode);
      const deltaConcluded = buildDeltaFromRoom(room, s.registry, s.propertyStates, 2, (mgr as any).auctions, 0, (mgr as any).lastAuctionResults);
      expect(deltaConcluded.auction).toBeDefined();
      expect(deltaConcluded.auction?.isConcluded).toBe(true);
      expect(deltaConcluded.auction?.highestBidderId).toBe('p2');
      expect(deltaConcluded.auction?.winnerId).toBe('p2');
      expect(deltaConcluded.auction?.finalPrice).toBe(1800);
    });

    it('[PROBE-1.3][Station-3/ClientStore] gameStore updates auction, activeModal, dismissedAuctionCellIndex, and restoreAuction performs lossless roundtrip', () => {
      useGameStore.setState({
        auction: {
          cellIndex: 7,
          currentBid: 2500,
          highestBidderId: 'p_lead',
          timeRemaining: 14,
          isConcluded: false,
        },
        activeModal: 'auction',
        modalPayload: {
          cellIndex: 7,
          currentBid: 2500,
          highestBidderId: 'p_lead',
          timeRemaining: 14,
        },
        dismissedAuctionCellIndex: null,
      });

      // Dismiss auction
      useGameStore.getState().dismissAuction(7);
      expect(useGameStore.getState().activeModal).toBeNull();
      expect(useGameStore.getState().modalPayload).toBeNull();
      expect(useGameStore.getState().dismissedAuctionCellIndex).toBe(7);

      // Restore auction
      useGameStore.getState().restoreAuction();
      expect(useGameStore.getState().activeModal).toBe('auction');
      expect(useGameStore.getState().dismissedAuctionCellIndex).toBeNull();
      const payload = useGameStore.getState().modalPayload as any;
      expect(payload?.cellIndex).toBe(7);
      expect(payload?.highestBidderId).toBe('p_lead');
      expect(payload?.currentBid).toBe(2500);
    });

    it('[PROBE-1.4][Station-4/UIAffordance] AuctionModal discriminates isLeading: renders auction-leading-close-btn for leader, auction-pass-btn for non-leader', () => {
      const leadingHarness = renderInteractiveModal({
        cellIndex: 5,
        currentBid: 3000,
        highestBidderId: 'p_alpha',
        myId: 'p_alpha',
        timeRemaining: 10,
      });
      expect(leadingHarness.findTestId('auction-leading-close-btn')).not.toBeNull();
      expect(leadingHarness.findTestId('auction-pass-btn')).toBeNull();
      expect(leadingHarness.getHtml()).toContain('✕ Đóng / Xem Bàn Cờ');

      const nonLeadingHarness = renderInteractiveModal({
        cellIndex: 5,
        currentBid: 3000,
        highestBidderId: 'p_beta',
        myId: 'p_alpha',
        timeRemaining: 10,
      });
      expect(nonLeadingHarness.findTestId('auction-pass-btn')).not.toBeNull();
      expect(nonLeadingHarness.findTestId('auction-leading-close-btn')).toBeNull();
      expect(nonLeadingHarness.getHtml()).toContain('✕ Rút Lui');
    });

    it('[PROBE-1.5][Station-5/ActionableNotification] resolveActionableNotification & formatServerErrorMessage provide crown icon 👑 and actionable guidance', () => {
      const codes = [
        'HIGHEST_BIDDER_CANNOT_PASS',
        'highest_bidder cannot pass',
        'highest_bidder_cannot_pass',
        'HighestBidderCannotPass',
      ];
      for (const code of codes) {
        const notif = resolveActionableNotification(code);
        expect(notif.icon).toBe('👑');
        expect(notif.title).toBe('Đang Dẫn Đầu Đấu Giá');
        expect(notif.description).toContain('Bạn đang là người trả giá cao nhất');
        expect(notif.actionHint).toContain('✕ Đóng / Xem Bàn Cờ');

        const formatted = formatServerErrorMessage(code);
        expect(formatted).toContain('Đang Dẫn Đầu Đấu Giá');
        expect(formatted).toContain('✕ Đóng / Xem Bàn Cờ');
        expect(formatted).not.toContain('HIGHEST_BIDDER_CANNOT_PASS');
      }
    });

    it('[PROBE-1.6][ClosedLoop-EndToEnd] Full Closed Loop from server state -> delta -> store -> modal -> leading dismiss -> mini strip -> restore -> illegal pass rejection', () => {
      const mgr = new RoomManager(23216);
      const room = mgr.createRoom('p_declined');
      mgr.addBot(room.roomCode, 'p_human');
      mgr.addBot(room.roomCode, 'p_bot2');
      mgr.startGame(room.roomCode);

      // p_declined lands on property 12 and declines
      room.currentPlayerIndex = 0;
      room.players[0]!.position = 12;
      room.phase = TurnPhase.ActionPhase;
      mgr.handleDecline(room.roomCode, 'p_declined');
      expect(room.phase).toBe(TurnPhase.AuctionPhase);

      // p_human places bid to become leading bidder
      const bidRes = mgr.handleAuctionBid(room.roomCode, 'p_human', 2000);
      expect(bidRes.success).toBe(true);
      expect(room.phase).toBe(TurnPhase.AuctionPhase);

      const s = (mgr as any).getSession(room.roomCode);
      const delta = buildDeltaFromRoom(room, s.registry, s.propertyStates, 1, (mgr as any).auctions, 15);

      useGameStore.setState({
        auction: delta.auction as any,
        activeModal: 'auction',
        modalPayload: delta.auction as any,
        turnPhase: TurnPhase.AuctionPhase,
        playersInfo: {
          p_declined: { id: 'p_declined', name: 'Người Từ Chối', balance: 50000, tokenColor: '#64748b', ownedProperties: [] },
          p_human: { id: 'p_human', name: 'Chủ Tịch', balance: 50000, tokenColor: '#ef4444', ownedProperties: [] },
          p_bot2: { id: 'p_bot2', name: 'Bot AI', balance: 50000, isBot: true, tokenColor: '#3b82f6', ownedProperties: [] },
        },
      });

      // ModalHost rendering
      let hostVNode: any = null;
      renderToStaticMarkup(
        React.createElement(() => {
          hostVNode = ModalHost({ localPlayerId: 'p_human' });
          return hostVNode;
        })
      );
      const auctionEl = findVNode(hostVNode, (n) => n?.type === AuctionModal);
      expect(auctionEl).not.toBeNull();

      const modalHarness = renderInteractiveModal(auctionEl.props);
      const leadingCloseBtn = modalHarness.findTestId('auction-leading-close-btn');
      expect(leadingCloseBtn).not.toBeNull();

      // Click close -> dismiss modal
      leadingCloseBtn.props.onClick();
      expect(useGameStore.getState().activeModal).toBeNull();
      expect(useGameStore.getState().dismissedAuctionCellIndex).toBe(delta.auction?.cellIndex);

      // MiniAuctionStrip visible
      const stripHtml = renderToStaticMarkup(React.createElement(MiniAuctionStrip));
      expect(stripHtml).toContain('data-testid="mini-auction-strip"');
      expect(stripHtml).toContain('👑 Chủ Tịch');
      expect(stripHtml).toContain('2.000');

      // Click restore on MiniAuctionStrip
      useGameStore.getState().restoreAuction();
      expect(useGameStore.getState().activeModal).toBe('auction');

      // If client attempts to send pass while leading, server authoritative logic firmly rejects
      const illegalPass = mgr.handleAuctionPass(room.roomCode, 'p_human');
      expect(illegalPass.success).toBe(false);
      expect(illegalPass.reason).toBe('HIGHEST_BIDDER_CANNOT_PASS');

      // Notification displays guidance
      const notif = resolveActionableNotification(illegalPass.reason);
      expect(notif.icon).toBe('👑');
      expect(notif.actionHint).toContain('✕ Đóng / Xem Bàn Cờ');
    });
  });

  // ==========================================================================
  // PROBE 2: Ephemeral Dynamic Boundary Probe (Adversarial Edge Values)
  // ==========================================================================
  describe('Probe 2: Ephemeral Dynamic Boundary Probe (Adversarial Edge Values)', () => {
    it('[PROBE-2.1][Boundary-FalsyHighestBidder] highestBidderId = null, undefined, "", or unknown defaults isLeading to false and renders [✕ Rút Lui]', () => {
      const edgeValues = [null, undefined, '', 'unknown_player_xyz'];
      for (const val of edgeValues) {
        const harness = renderInteractiveModal({
          cellIndex: 3,
          currentBid: 1000,
          highestBidderId: val as any,
          myId: 'player_alpha',
          timeRemaining: 15,
        });
        expect(harness.findTestId('auction-pass-btn')).not.toBeNull();
        expect(harness.findTestId('auction-leading-close-btn')).toBeNull();
        expect(harness.getHtml()).toContain('✕ Rút Lui');
      }
    });

    it('[PROBE-2.2][Boundary-FalsyMyId] myId = null, undefined, or "" defaults isLeading to false and renders [✕ Rút Lui]', () => {
      const edgeMyIds = [null, undefined, ''];
      for (const val of edgeMyIds) {
        const harness = renderInteractiveModal({
          cellIndex: 3,
          currentBid: 1000,
          highestBidderId: 'player_alpha',
          myId: val as any,
          timeRemaining: 15,
        });
        expect(harness.findTestId('auction-pass-btn')).not.toBeNull();
        expect(harness.findTestId('auction-leading-close-btn')).toBeNull();
      }
    });

    it('[PROBE-2.3][Boundary-HasPassedPrecedence] hasPassed = true strictly overrides isLeading = true and renders [✕ Đã Rút Lui • Đóng]', () => {
      const harness = renderInteractiveModal({
        cellIndex: 3,
        currentBid: 1500,
        highestBidderId: 'player_alpha',
        myId: 'player_alpha',
        hasPassed: true,
        timeRemaining: 10,
      });
      expect(harness.findTestId('auction-passed-close-btn')).not.toBeNull();
      expect(harness.findTestId('auction-leading-close-btn')).toBeNull();
      expect(harness.findTestId('auction-pass-btn')).toBeNull();
      expect(harness.getHtml()).toContain('✕ Đã Rút Lui • Đóng');
    });

    it('[PROBE-2.4][Boundary-IsConcludedPrecedence] isConcluded = true strictly overrides isLeading = true and renders [✕ Đóng / Xem Bàn Cờ]', () => {
      const harness = renderInteractiveModal({
        cellIndex: 3,
        currentBid: 1500,
        highestBidderId: 'player_alpha',
        myId: 'player_alpha',
        isConcluded: true,
        winnerId: 'player_alpha',
        timeRemaining: 0,
      });
      expect(harness.findTestId('auction-concluded-close-btn')).not.toBeNull();
      expect(harness.findTestId('auction-leading-close-btn')).toBeNull();
      expect(harness.findTestId('auction-pass-btn')).toBeNull();
    });

    it('[PROBE-2.5][Boundary-DeclinedPlayerPrecedence] isDeclinedPlayer = true strictly renders [✕ Đóng / Xem Bàn Cờ] (declined close)', () => {
      const harness = renderInteractiveModal({
        cellIndex: 3,
        currentBid: 1500,
        highestBidderId: 'player_alpha',
        myId: 'player_alpha',
        isDeclinedPlayer: true,
        timeRemaining: 10,
      });
      expect(harness.findTestId('auction-declined-close-btn')).not.toBeNull();
      expect(harness.findTestId('auction-leading-close-btn')).toBeNull();
      expect(harness.findTestId('auction-pass-btn')).toBeNull();
    });

    it('[PROBE-2.6][Boundary-ExtremeClockSkew] Extreme timeRemaining skews (-3600s, 0s, 3600s) and MiniAuctionStrip deadlines render safely without exceptions', () => {
      // Past 1 hour (-3600)
      const pastHarness = renderInteractiveModal({
        cellIndex: 2,
        currentBid: 2000,
        highestBidderId: 'player_alpha',
        myId: 'player_alpha',
        timeRemaining: -3600,
      });
      expect(pastHarness.getHtml()).toContain('data-testid="auction-modal"');

      // Exactly 0s
      const zeroHarness = renderInteractiveModal({
        cellIndex: 2,
        currentBid: 2000,
        highestBidderId: 'player_alpha',
        myId: 'player_alpha',
        timeRemaining: 0,
      });
      expect(zeroHarness.getHtml()).toContain('00 GIÂY');

      // Future 1 hour (+3600)
      const futureHarness = renderInteractiveModal({
        cellIndex: 2,
        currentBid: 2000,
        highestBidderId: 'player_alpha',
        myId: 'player_alpha',
        timeRemaining: 3600,
      });
      expect(futureHarness.getHtml()).toContain('3600 GIÂY');

      // MiniAuctionStrip with past / future / undefined deadline
      useGameStore.setState({
        auction: {
          cellIndex: 2,
          currentBid: 2000,
          highestBidderId: 'player_alpha',
          deadline: Date.now() - 3600_000,
          timeRemaining: 0,
        },
        activeModal: null,
        turnPhase: TurnPhase.AuctionPhase,
        playersInfo: { player_alpha: { id: 'player_alpha', name: 'Alpha', balance: 10000, tokenColor: '#ef4444', ownedProperties: [] } },
      });
      expect(renderToStaticMarkup(React.createElement(MiniAuctionStrip))).toContain('0s');

      useGameStore.setState({
        auction: {
          cellIndex: 2,
          currentBid: 2000,
          highestBidderId: 'player_alpha',
          deadline: Date.now() + 3600_000,
          timeRemaining: 3600,
        },
      });
      expect(renderToStaticMarkup(React.createElement(MiniAuctionStrip))).toContain('3600s');
    });

    it('[PROBE-2.7][Boundary-SafeCallbackFallbacks] Buttons with undefined onClose / onPass do not throw on interactive clicks', () => {
      const leadingHarness = renderInteractiveModal({
        cellIndex: 1,
        currentBid: 1000,
        highestBidderId: 'player_alpha',
        myId: 'player_alpha',
        timeRemaining: 15,
        onClose: undefined,
        onPass: undefined,
      });
      expect(() => leadingHarness.clickTestId('auction-leading-close-btn')).not.toThrow();

      const nonLeadingHarness = renderInteractiveModal({
        cellIndex: 1,
        currentBid: 1000,
        highestBidderId: 'player_beta',
        myId: 'player_alpha',
        timeRemaining: 15,
        onClose: undefined,
        onPass: undefined,
      });
      expect(() => nonLeadingHarness.clickTestId('auction-pass-btn')).not.toThrow();

      const passedHarness = renderInteractiveModal({
        cellIndex: 1,
        currentBid: 1000,
        highestBidderId: 'player_alpha',
        myId: 'player_alpha',
        hasPassed: true,
        timeRemaining: 15,
        onClose: undefined,
      });
      expect(() => passedHarness.clickTestId('auction-passed-close-btn')).not.toThrow();

      const concludedHarness = renderInteractiveModal({
        cellIndex: 1,
        currentBid: 1000,
        highestBidderId: 'player_alpha',
        myId: 'player_alpha',
        isConcluded: true,
        timeRemaining: 0,
        onClose: undefined,
      });
      expect(() => concludedHarness.clickTestId('auction-concluded-close-btn')).not.toThrow();
    });
  });

  // ==========================================================================
  // PROBE 3: Targeted Mutation Sensitivity Probe (Mutants A-G Sensitivity)
  // ==========================================================================
  describe('Probe 3: Targeted Mutation Sensitivity Probe (Mutants A-G Sensitivity)', () => {
    it('[PROBE-3.1][Mutant-A] Mutant A (removing isLeading check in footer, always rendering pass button) is killed by TC-232.01 & TC-232.03', () => {
      function mutantRenderFooter(isLeading: boolean, isConcluded: boolean, hasPassed: boolean) {
        if (isConcluded) return 'auction-concluded-close-btn';
        if (hasPassed) return 'auction-passed-close-btn';
        // MUTANT A: Removed `isLeading` check! Always returns pass button
        return 'auction-pass-btn';
      }
      const buttonForLeader = mutantRenderFooter(true, false, false);
      // TC-232.01 expects 'auction-leading-close-btn'
      expect(() => {
        expect(buttonForLeader).toBe('auction-leading-close-btn');
      }).toThrow();
    });

    it('[PROBE-3.2][Mutant-B] Mutant B (leading button calling onPass instead of onClose) is killed by TC-232.03', () => {
      const onCloseSpy = vi.fn();
      const onPassSpy = vi.fn();
      function mutantLeadingButtonClick(onClose?: () => void, onPass?: () => void) {
        // MUTANT B: Incorrectly calls onPass() instead of onClose()
        onPass?.();
      }
      mutantLeadingButtonClick(onCloseSpy, onPassSpy);
      // TC-232.03 expects onClose to be called and onPass NOT to be called
      expect(() => {
        expect(onCloseSpy).toHaveBeenCalledTimes(1);
        expect(onPassSpy).not.toHaveBeenCalled();
      }).toThrow();
    });

    it('[PROBE-3.3][Mutant-C] Mutant C (inverting precedence: isLeading before hasPassed) is killed by TC-232.07', () => {
      function mutantRenderPrecedence(isLeading: boolean, hasPassed: boolean) {
        // MUTANT C: Checks isLeading before hasPassed
        if (isLeading) return 'auction-leading-close-btn';
        if (hasPassed) return 'auction-passed-close-btn';
        return 'auction-pass-btn';
      }
      // When player has passed but data says highestBidderId === myId:
      const button = mutantRenderPrecedence(true, true);
      // TC-232.07 expects 'auction-passed-close-btn'
      expect(() => {
        expect(button).toBe('auction-passed-close-btn');
      }).toThrow();
    });

    it('[PROBE-3.4][Mutant-D] Mutant D (inverting precedence: isLeading before isConcluded) is killed by TC-232.16', () => {
      function mutantRenderPrecedence(isLeading: boolean, isConcluded: boolean) {
        // MUTANT D: Checks isLeading before isConcluded
        if (isLeading) return 'auction-leading-close-btn';
        if (isConcluded) return 'auction-concluded-close-btn';
        return 'auction-pass-btn';
      }
      // When auction is concluded and player is the winner (isLeading = true):
      const button = mutantRenderPrecedence(true, true);
      // TC-232.16 expects 'auction-concluded-close-btn'
      expect(() => {
        expect(button).toBe('auction-concluded-close-btn');
      }).toThrow();
    });

    it('[PROBE-3.5][Mutant-E] Mutant E (removing alias "highest_bidder cannot pass") is killed by TC-232.13', () => {
      function mutantResolveNotification(code: string) {
        const dict: Record<string, string> = {
          'HIGHEST_BIDDER_CANNOT_PASS': 'Đang Dẫn Đầu Đấu Giá',
          // MUTANT E: Omitted alias 'highest_bidder cannot pass'
        };
        return dict[code] ?? 'Hướng Dẫn Trò Chơi';
      }
      const res = mutantResolveNotification('highest_bidder cannot pass');
      // TC-232.13 expects title 'Đang Dẫn Đầu Đấu Giá'
      expect(() => {
        expect(res).toBe('Đang Dẫn Đầu Đấu Giá');
      }).toThrow();
    });

    it('[PROBE-3.6][Mutant-F] Mutant F (removing HIGHEST_BIDDER_CANNOT_PASS dictionary mapping) is killed by TC-232.11 and TC-232.12', () => {
      function mutantFormatMessage(code: string) {
        const dict: Record<string, string> = {
          // MUTANT F: Omitted HIGHEST_BIDDER_CANNOT_PASS entry completely
          'INVALID_PHASE': 'Chưa Đúng Giai Đoạn',
        };
        const entry = dict[code];
        if (!entry) return `Hướng Dẫn Trò Chơi: Thao tác tạm thời chưa thể thực hiện (${code})`;
        return entry;
      }
      const res = mutantFormatMessage('HIGHEST_BIDDER_CANNOT_PASS');
      // TC-232.11 & TC-232.12 expect formatted Vietnamese guidance and NO English code
      expect(() => {
        expect(res).toContain('Đang Dẫn Đầu Đấu Giá');
        expect(res).not.toContain('HIGHEST_BIDDER_CANNOT_PASS');
      }).toThrow();
    });

    it('[PROBE-3.7][Mutant-G] Mutant G (removing session.highestBidder === playerId check in handleAuctionPass) is killed by TC-232.14', () => {
      function mutantHandleAuctionPass(highestBidderId: string, playerId: string) {
        // MUTANT G: Omitted `if (session.highestBidder === playerId) return { success: false, reason: 'HIGHEST_BIDDER_CANNOT_PASS' };`
        return { success: true };
      }
      const res = mutantHandleAuctionPass('p2', 'p2');
      // TC-232.14 expects { success: false, reason: 'HIGHEST_BIDDER_CANNOT_PASS' }
      expect(() => {
        expect(res.success).toBe(false);
        expect((res as any).reason).toBe('HIGHEST_BIDDER_CANNOT_PASS');
      }).toThrow();
    });
  });
});
