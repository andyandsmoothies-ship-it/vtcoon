// [TC-200.01/MSS..TC-200.17/MSS][UC-IMP200] Non-Involved Player Auction Modal Dismissal & Mini Auction Floating Widget Contract Suite
// Universal 5-Facet Behavioral Matrix:
// Facet 1: Store Lifecycle & User Dismiss State (TC-200.01 - 04)
// Facet 2: apply_delta Idempotence & Anti-Popup Invariant (TC-200.05 - 08)
// Facet 3: Transient Teardown & Fire Sale Safety (TC-200.09 - 11)
// Facet 4: ModalHost Backdrop & Non-Involved Dismissibility (TC-200.12 - 14)
// Facet 5: MiniAuctionStrip Visual Projection & Authoritative Resync (TC-200.15 - 17)

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { useGameStore } from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import { TurnPhase } from '../../src/domain/room.js';
import { applyDeltaToStore } from '../../src/client/network/apply_delta.js';
import * as ModalHelpers from '../../src/client/ui/modals/modal_helpers.js';

// Safe dynamic resolution for Station 1 Business RED contract gate
const isAuctionDismissible = (ModalHelpers as Record<string, any>).isAuctionDismissible;

const MINI_AUCTION_STRIP_PATH = '../../src/client/ui/modals/mini_auction_strip';
let miniAuctionStripMod: any = null;
try {
  miniAuctionStripMod = await import(/* @vite-ignore */ MINI_AUCTION_STRIP_PATH);
} catch {
  try {
    miniAuctionStripMod = await import(/* @vite-ignore */ `${MINI_AUCTION_STRIP_PATH}.js`);
  } catch {
    miniAuctionStripMod = null;
  }
}
const MiniAuctionStrip = miniAuctionStripMod?.MiniAuctionStrip;

describe('[TC-200.01/MSS..TC-200.17/MSS][UC-IMP200] Auction Dismiss & Mini Widget Contract Suite', () => {
  beforeEach(() => {
    useLobbyStore.setState({ myPlayerId: 'p1' });
    useGameStore.getState().resetGameState();
  });

  // =========================================================================
  // FACET 1: Store Lifecycle & User Dismiss State (TC-200.01 - 04)
  // =========================================================================
  describe('Facet 1: Store Lifecycle & User Dismiss State', () => {
    it('[TC-200.01/MSS][UC-IMP200] dismissAuction(14) cập nhật dismissedAuctionCellIndex = 14, đóng modal (activeModal: null, modalPayload: null)', () => {
      useGameStore.setState({
        activeModal: 'auction',
        modalPayload: { cellIndex: 14, currentBid: 1500 } as any,
      });

      const store = useGameStore.getState() as any;
      expect(typeof store.dismissAuction).toBe('function');
      store.dismissAuction(14);

      const state = useGameStore.getState() as any;
      expect(state.dismissedAuctionCellIndex).toBe(14);
      expect(state.activeModal).toBeNull();
      expect(state.modalPayload).toBeNull();
    });

    it('[TC-200.02/MSS][UC-IMP200] restoreAuction() xóa dismissedAuctionCellIndex = null và mở lại activeModal: "auction" với dữ liệu phiên đấu giá hiện tại', () => {
      const currentAuction = {
        cellIndex: 14,
        currentBid: 1500,
        timeRemaining: 12,
        isConcluded: false,
      };
      useGameStore.setState({
        activeModal: null,
        modalPayload: null,
        auction: currentAuction as any,
        dismissedAuctionCellIndex: 14,
      } as any);

      const store = useGameStore.getState() as any;
      expect(typeof store.restoreAuction).toBe('function');
      store.restoreAuction();

      const state = useGameStore.getState() as any;
      expect(state.dismissedAuctionCellIndex).toBeNull();
      expect(state.activeModal).toBe('auction');
      expect(state.modalPayload).toEqual(currentAuction);
    });

    it('[TC-200.03/MSS][UC-IMP200] setAuction(payload) cập nhật dữ liệu state.auction mà không làm thay đổi activeModal', () => {
      useGameStore.setState({
        activeModal: 'portfolio',
        modalPayload: null,
      });

      const payload = { cellIndex: 14, currentBid: 1800, timeRemaining: 9, isConcluded: false };
      const store = useGameStore.getState() as any;
      expect(typeof store.setAuction).toBe('function');
      store.setAuction(payload);

      const state = useGameStore.getState() as any;
      expect(state.auction).toEqual(payload);
      expect(state.activeModal).toBe('portfolio');
    });

    it('[TC-200.04/MSS][UC-IMP200] resetGameState() reset hoàn toàn dismissedAuctionCellIndex: null và auction: null', () => {
      useGameStore.setState({
        auction: { cellIndex: 14, currentBid: 2000 } as any,
        dismissedAuctionCellIndex: 14,
      } as any);

      useGameStore.getState().resetGameState();

      const state = useGameStore.getState() as any;
      expect(state.dismissedAuctionCellIndex).toBeNull();
      expect(state.auction).toBeNull();
    });
  });

  // =========================================================================
  // FACET 2: apply_delta Idempotence & Anti-Popup Invariant (TC-200.05 - 08)
  // =========================================================================
  describe('Facet 2: apply_delta Idempotence & Anti-Popup Invariant', () => {
    it('[TC-200.05/MSS][UC-IMP200] Khi phiên đấu giá mới bắt đầu (delta.auction.cellIndex !== dismissedAuctionCellIndex), applyDeltaToStore tự động mở modal openModal("auction")', () => {
      useGameStore.setState({
        activeModal: null,
        modalPayload: null,
        dismissedAuctionCellIndex: 5,
      } as any);

      const delta = {
        turnPhase: TurnPhase.AuctionPhase,
        auction: {
          cellIndex: 14,
          currentBid: 1000,
          timeRemaining: 15,
          isConcluded: false,
        },
      };

      applyDeltaToStore(delta as any);

      const state = useGameStore.getState() as any;
      expect(state.dismissedAuctionCellIndex).toBeNull();
      expect(state.activeModal).toBe('auction');
      expect((state.modalPayload as any)?.cellIndex).toBe(14);
    });

    it('[TC-200.06/MSS][UC-IMP200] Khi người chơi đã dismiss (dismissedAuctionCellIndex === delta.auction.cellIndex), delta tick tiếp theo (!isConcluded) KHÔNG mở lại modal activeModal: "auction"', () => {
      useGameStore.setState({
        activeModal: null,
        modalPayload: null,
        dismissedAuctionCellIndex: 14,
        auction: { cellIndex: 14, currentBid: 1000, timeRemaining: 15, isConcluded: false } as any,
      } as any);

      const delta = {
        turnPhase: TurnPhase.AuctionPhase,
        auction: {
          cellIndex: 14,
          currentBid: 1200,
          timeRemaining: 13,
          isConcluded: false,
        },
      };

      applyDeltaToStore(delta as any);

      const state = useGameStore.getState() as any;
      expect(state.activeModal).toBeNull();
      expect(state.dismissedAuctionCellIndex).toBe(14);
    });

    it('[TC-200.07/MSS][UC-IMP200] Khi người chơi đã dismiss, delta tick tiếp theo vẫn cập nhật chính xác dữ liệu state.auction (currentBid, timeRemaining) trong store', () => {
      useGameStore.setState({
        activeModal: null,
        modalPayload: null,
        dismissedAuctionCellIndex: 14,
        auction: { cellIndex: 14, currentBid: 1000, timeRemaining: 15, isConcluded: false } as any,
      } as any);

      const delta = {
        turnPhase: TurnPhase.AuctionPhase,
        auction: {
          cellIndex: 14,
          currentBid: 1600,
          highestBidderId: 'bot1',
          timeRemaining: 8,
          isConcluded: false,
        },
      };

      applyDeltaToStore(delta as any);

      const state = useGameStore.getState() as any;
      expect(state.auction?.currentBid).toBe(1600);
      expect(state.auction?.timeRemaining).toBe(8);
      expect(state.auction?.highestBidderId).toBe('bot1');
    });

    it('[TC-200.08/MSS][UC-IMP200] Khi người chơi mở modal khác (openModal("portfolio")), delta tick của phiên đấu giá đã dismiss không đè lấn hay tắt modal Portfolio', () => {
      useGameStore.setState({
        activeModal: 'portfolio',
        modalPayload: null,
        dismissedAuctionCellIndex: 14,
        auction: { cellIndex: 14, currentBid: 1000 } as any,
      } as any);

      const delta = {
        turnPhase: TurnPhase.AuctionPhase,
        auction: {
          cellIndex: 14,
          currentBid: 2000,
          timeRemaining: 5,
          isConcluded: false,
        },
      };

      applyDeltaToStore(delta as any);

      const state = useGameStore.getState() as any;
      expect(state.activeModal).toBe('portfolio');
    });
  });

  // =========================================================================
  // FACET 3: Transient Teardown & Fire Sale Safety (TC-200.09 - 11)
  // =========================================================================
  describe('Facet 3: Transient Teardown & Fire Sale Safety', () => {
    it('[TC-200.09/MSS][UC-IMP200] Khi delta.auction === null, applyDeltaToStore tự động dọn sạch state.auction = null và state.dismissedAuctionCellIndex = null', () => {
      useGameStore.setState({
        activeModal: 'auction',
        modalPayload: { cellIndex: 14 } as any,
        auction: { cellIndex: 14, currentBid: 1500 } as any,
        dismissedAuctionCellIndex: 14,
      } as any);

      const delta = {
        auction: null,
      };

      applyDeltaToStore(delta as any);

      const state = useGameStore.getState() as any;
      expect(state.auction).toBeNull();
      expect(state.dismissedAuctionCellIndex).toBeNull();
      expect(state.activeModal).toBeNull();
    });

    it('[TC-200.10/MSS][UC-IMP200] Khi chuyển sang turnPhase !== TurnPhase.AuctionPhase, dismissedAuctionCellIndex và auction bị dọn dẹp sạch sẽ', () => {
      useGameStore.setState({
        auction: { cellIndex: 14, currentBid: 1500 } as any,
        dismissedAuctionCellIndex: 14,
      } as any);

      const delta = {
        turnPhase: TurnPhase.WaitingRoll,
      };

      applyDeltaToStore(delta as any);

      const state = useGameStore.getState() as any;
      expect(state.auction).toBeNull();
      expect(state.dismissedAuctionCellIndex).toBeNull();
    });

    it('[TC-200.11/MSS][UC-IMP200] Trong hàng đợi phát mãi liên hoàn (Fire Sale), khi chuyển sang ô đất mới (cellIndex: 8 != 3), applyDeltaToStore tự động reset cờ dismiss cũ và mở sàn đấu giá ô mới', () => {
      useGameStore.setState({
        activeModal: null,
        modalPayload: null,
        dismissedAuctionCellIndex: 3,
        auction: { cellIndex: 3, currentBid: 700 } as any,
      } as any);

      const delta = {
        turnPhase: TurnPhase.AuctionPhase,
        auction: {
          cellIndex: 8,
          currentBid: 800,
          timeRemaining: 15,
          isConcluded: false,
        },
      };

      applyDeltaToStore(delta as any);

      const state = useGameStore.getState() as any;
      expect(state.dismissedAuctionCellIndex).toBeNull();
      expect(state.activeModal).toBe('auction');
      expect((state.modalPayload as any)?.cellIndex).toBe(8);
    });
  });

  // =========================================================================
  // FACET 4: ModalHost Backdrop & Non-Involved Dismissibility (TC-200.12 - 14)
  // =========================================================================
  describe('Facet 4: ModalHost Backdrop & Non-Involved Dismissibility', () => {
    it('[TC-200.12/MSS][UC-IMP200] Khi activeModal === "auction" và người chơi đã hasPassed: true, isAuctionDismissible trả về true', () => {
      expect(typeof isAuctionDismissible).toBe('function');
      const payload = {
        cellIndex: 14,
        currentBid: 1500,
        hasPassed: true,
      };
      const result = isAuctionDismissible(payload as any, 'p1', { id: 'p1', bankrupt: false });
      expect(result).toBe(true);
    });

    it('[TC-200.13/MSS][UC-IMP200] Khi activeModal === "auction" và người chơi là declinedPlayerId === myId hoặc con nợ phát mãi insolvencyPlayerId === myId, isAuctionDismissible trả về true', () => {
      expect(typeof isAuctionDismissible).toBe('function');
      const payloadDeclined = {
        cellIndex: 14,
        currentBid: 1500,
        declinedPlayerId: 'p1',
      };
      const resultDeclined = isAuctionDismissible(payloadDeclined as any, 'p1', { id: 'p1', bankrupt: false });
      expect(resultDeclined).toBe(true);

      const payloadInsolvent = {
        cellIndex: 14,
        currentBid: 1500,
        insolvencyPlayerId: 'p1',
      };
      const resultInsolvent = isAuctionDismissible(payloadInsolvent as any, 'p1', { id: 'p1', bankrupt: false });
      expect(resultInsolvent).toBe(true);
    });

    it('[TC-200.14/MSS][UC-IMP200] Khi người chơi đang là active bidder (chưa pass), isAuctionDismissible trả về false (bảo vệ miss-click)', () => {
      expect(typeof isAuctionDismissible).toBe('function');
      const activePayload = {
        cellIndex: 14,
        currentBid: 1500,
        hasPassed: false,
        declinedPlayerId: 'other_player',
        insolvencyPlayerId: undefined,
        isConcluded: false,
      };
      const result = isAuctionDismissible(activePayload as any, 'p1', { id: 'p1', bankrupt: false });
      expect(result).toBe(false);
    });
  });

  // =========================================================================
  // FACET 5: MiniAuctionStrip Visual Projection & Authoritative Resync (TC-200.15 - 17)
  // =========================================================================
  describe('Facet 5: MiniAuctionStrip Visual Projection & Authoritative Resync', () => {
    it('[TC-200.15/MSS][UC-IMP200] MiniAuctionStrip render static markup chứa tên ô đất (BOARD_CONFIG), giá thầu hiện tại, tên người dẫn đầu và đếm ngược thời gian', () => {
      expect(typeof MiniAuctionStrip).toBe('function');
      useGameStore.setState({
        activeModal: null,
        turnPhase: TurnPhase.AuctionPhase,
        auction: {
          cellIndex: 1,
          currentBid: 1500,
          highestBidderId: 'bot1',
          timeRemaining: 12,
          isConcluded: false,
        } as any,
        playersInfo: {
          bot1: {
            id: 'bot1',
            name: 'Bot Tỷ Phú',
            balance: 30000,
            tokenColor: '#F59E0B',
            ownedProperties: [],
            mortgagedProperties: [],
            mortgageLoans: {},
            isBot: true,
            bankrupt: false,
            inAudit: false,
          },
        },
      });

      const html = renderToStaticMarkup(React.createElement(MiniAuctionStrip));
      expect(html).toContain('data-testid="mini-auction-strip"');
      expect(html).toContain('Phố Đi Bộ');
      expect(html).toContain('1.500');
      expect(html).toContain('Bot Tỷ Phú');
    });

    it('[TC-200.16/MSS][UC-IMP200] Khi modal đấu giá đang mở (activeModal === "auction"), MiniAuctionStrip render ra null', () => {
      expect(typeof MiniAuctionStrip).toBe('function');
      useGameStore.setState({
        activeModal: 'auction',
        turnPhase: TurnPhase.AuctionPhase,
        auction: {
          cellIndex: 1,
          currentBid: 1500,
          highestBidderId: 'bot1',
          timeRemaining: 12,
          isConcluded: false,
        } as any,
      });

      const html = renderToStaticMarkup(React.createElement(MiniAuctionStrip));
      expect(html).toBe('');
    });

    it('[TC-200.17/MSS][UC-IMP200] Khi server delta cập nhật timeRemaining, MiniAuctionStrip đồng bộ hiển thị số giây mới nhất (Authoritative Resync)', () => {
      expect(typeof MiniAuctionStrip).toBe('function');
      useGameStore.setState({
        activeModal: null,
        turnPhase: TurnPhase.AuctionPhase,
        auction: {
          cellIndex: 1,
          currentBid: 1500,
          highestBidderId: 'bot1',
          timeRemaining: 9,
          isConcluded: false,
        } as any,
        playersInfo: {},
      });

      const html = renderToStaticMarkup(React.createElement(MiniAuctionStrip));
      expect(html).toContain('9s');
    });
  });
});
