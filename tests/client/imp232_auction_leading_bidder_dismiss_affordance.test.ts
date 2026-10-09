/**
 * IMP-232: Chuyển Đổi Affordance Đóng Modal Cho Người Dẫn Đầu Đấu Giá & Việt Hóa Thông Báo Lỗi
 * Suite: tests/client/imp232_auction_leading_bidder_dismiss_affordance.test.ts
 *
 * Universal 5-Facet Behavioral Matrix & Detroit Style Classical ATDD:
 * - Facet 1: Phân Định Nút Bấm Chân Trang Theo Trạng Thái Dẫn Đầu (TC-232.01 - 04)
 * - Facet 2: Chuyển Đổi Trạng Thái Động Khi Bị Vượt Giá (TC-232.05 - 07)
 * - Facet 3: Khép Kín Với ModalHost & MiniAuctionStrip (TC-232.08 - 10)
 * - Facet 4: Việt Hóa Thông Báo Lỗi Server (TC-232.11 - 13)
 * - Facet 5: Độ Bền Vững & Hồi Quy (TC-232.14 - 16)
 */

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

// ============================================================================
// VDOM & Interactive Harness Helpers
// ============================================================================

function findVNode(node: any, predicate: (n: any) => boolean): any {
  if (!node) return null;
  if (predicate(node)) return node;
  if (typeof node?.type === 'function') {
    try {
      let unrolled: any = null;
      renderToStaticMarkup(
        React.createElement(() => {
          unrolled = node.type(node.props);
          return null;
        })
      );
      const res = findVNode(unrolled, predicate);
      if (res) return res;
    } catch {}
  }
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

describe('IMP-232: Auction Leading Bidder Dismiss Affordance Contract Suite', () => {
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
  // FACET 1: Phân Định Nút Bấm Chân Trang Theo Trạng Thái Dẫn Đầu
  // ==========================================================================
  describe('Facet 1: Phân Định Nút Bấm Chân Trang Theo Trạng Thái Dẫn Đầu (Footer Button Affordance)', () => {
    it('[TC-232.01/MSS][UC-IMP232][Facet-1/LeadingRendersCloseButton] Khi highestBidderId === myId, Footer render nút data-testid="auction-leading-close-btn" mang nhãn "✕ Đóng / Xem Bàn Cờ", không render nút auction-pass-btn', () => {
      const vnode = renderInteractiveModal({
        cellIndex: 1,
        currentBid: 1200,
        highestBidderId: 'player_alpha',
        myId: 'player_alpha',
        timeRemaining: 15,
      });

      const leadingCloseBtn = vnode.findTestId('auction-leading-close-btn');
      expect(leadingCloseBtn).not.toBeNull();
      expect(leadingCloseBtn.props.children).toContain('✕ Đóng / Xem Bàn Cờ');
      expect(vnode.findTestId('auction-pass-btn')).toBeNull();
    });

    it('[TC-232.02/MSS][UC-IMP232][Facet-1/NonLeadingRendersPassButton] Khi highestBidderId !== myId (hoặc null), Footer render nút data-testid="auction-pass-btn" mang nhãn "✕ Rút Lui"', () => {
      const vnode = renderInteractiveModal({
        cellIndex: 1,
        currentBid: 1200,
        highestBidderId: 'player_beta',
        myId: 'player_alpha',
        timeRemaining: 15,
      });

      const passBtn = vnode.findTestId('auction-pass-btn');
      expect(passBtn).not.toBeNull();
      expect(passBtn.props.children).toContain('✕ Rút Lui');
      expect(vnode.findTestId('auction-leading-close-btn')).toBeNull();
    });

    it('[TC-232.03/MSS][UC-IMP232][Facet-1/LeadingClickCallsOnCloseNotOnPass] Khi người chơi đang dẫn đầu click auction-leading-close-btn, hàm onClose được gọi đúng 1 lần, onPass tuyệt đối KHÔNG được gọi', () => {
      const onClose = vi.fn();
      const onPass = vi.fn();
      const vnode = renderInteractiveModal({
        cellIndex: 1,
        currentBid: 1500,
        highestBidderId: 'player_alpha',
        myId: 'player_alpha',
        timeRemaining: 12,
        onClose,
        onPass,
      });

      vnode.clickTestId('auction-leading-close-btn');
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onPass).not.toHaveBeenCalled();
    });

    it('[TC-232.04/MSS][UC-IMP232][Facet-1/NonLeadingClickCallsOnPass] Khi người chơi không dẫn đầu click auction-pass-btn, hàm onPass được gọi đúng 1 lần', () => {
      const onClose = vi.fn();
      const onPass = vi.fn();
      const vnode = renderInteractiveModal({
        cellIndex: 1,
        currentBid: 1200,
        highestBidderId: 'player_beta',
        myId: 'player_alpha',
        timeRemaining: 15,
        onClose,
        onPass,
      });

      vnode.clickTestId('auction-pass-btn');
      expect(onPass).toHaveBeenCalledTimes(1);
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // FACET 2: Chuyển Đổi Trạng Thái Động Khi Bị Vượt Giá
  // ==========================================================================
  describe('Facet 2: Chuyển Đổi Trạng Thái Động Khi Bị Vượt Giá (Dynamic Role Transition)', () => {
    it('[TC-232.05/MSS][UC-IMP232][Facet-2/OutbidSwitchesCloseToPass] Khi đối thủ đặt giá cao hơn (highestBidderId đổi từ myId sang opponentId), nút Footer tự động chuyển từ auction-leading-close-btn sang auction-pass-btn', () => {
      const vnodeLeading = renderInteractiveModal({
        cellIndex: 1,
        currentBid: 1000,
        highestBidderId: 'player_alpha',
        myId: 'player_alpha',
        timeRemaining: 15,
      });
      const vnodeOutbid = renderInteractiveModal({
        cellIndex: 1,
        currentBid: 1200,
        highestBidderId: 'player_beta',
        myId: 'player_alpha',
        timeRemaining: 14,
      });

      expect(vnodeLeading.findTestId('auction-leading-close-btn')).not.toBeNull();
      expect(vnodeOutbid.findTestId('auction-leading-close-btn')).toBeNull();
      expect(vnodeOutbid.findTestId('auction-pass-btn')).not.toBeNull();
    });

    it('[TC-232.06/MSS][UC-IMP232][Facet-2/RebiddingRestoresCloseButton] Sau khi bị vượt giá, người chơi đặt giá cao hơn tiếp (highestBidderId quay lại myId), nút Footer lập tức phục hồi lại thành auction-leading-close-btn', () => {
      const vnodeRebid = renderInteractiveModal({
        cellIndex: 1,
        currentBid: 1500,
        highestBidderId: 'player_alpha',
        myId: 'player_alpha',
        timeRemaining: 10,
      });

      const leadingBtn = vnodeRebid.findTestId('auction-leading-close-btn');
      expect(leadingBtn).not.toBeNull();
      expect(leadingBtn.props.children).toContain('✕ Đóng / Xem Bàn Cờ');
      expect(vnodeRebid.findTestId('auction-pass-btn')).toBeNull();
    });

    it('[TC-232.07/MSS][UC-IMP232][Facet-2/PassedPlayerPrecedenceOverLeading] Nếu người chơi đã có cờ hasPassed = true, luôn hiển thị auction-passed-close-btn ("✕ Đã Rút Lui • Đóng") kể cả khi props dữ liệu có highestBidderId === myId', () => {
      const vnode = renderInteractiveModal({
        cellIndex: 1,
        currentBid: 1200,
        highestBidderId: 'player_alpha',
        myId: 'player_alpha',
        hasPassed: true,
        timeRemaining: 8,
      });

      const passedBtn = vnode.findTestId('auction-passed-close-btn');
      expect(passedBtn).not.toBeNull();
      expect(passedBtn.props.children).toContain('✕ Đã Rút Lui • Đóng');
      expect(vnode.findTestId('auction-leading-close-btn')).toBeNull();
      expect(vnode.findTestId('auction-pass-btn')).toBeNull();
    });
  });

  // ==========================================================================
  // FACET 3: Khép Kín Với ModalHost & MiniAuctionStrip
  // ==========================================================================
  describe('Facet 3: Khép Kín Với ModalHost & MiniAuctionStrip (Host & Strip Integration)', () => {
    it('[TC-232.08/MSS][UC-IMP232][Facet-3/CloseDismissesAuctionModal] Bấm auction-leading-close-btn trong ModalHost kích hoạt dismissAuction(cellIndex), đóng modal khỏi màn hình chính (activeModal = null)', () => {
      useGameStore.setState({
        activeModal: 'auction',
        modalPayload: {
          cellIndex: 5,
          currentBid: 1000,
          highestBidderId: 'player_alpha',
          timeRemaining: 15,
        },
        playersInfo: {
          player_alpha: {
            id: 'player_alpha',
            name: 'Chủ Tịch Hải Phòng',
            balance: 10000,
            tokenColor: '#ef4444',
            ownedProperties: [],
          },
        },
      });

      let hostVNode: any = null;
      renderToStaticMarkup(
        React.createElement(() => {
          hostVNode = ModalHost({ localPlayerId: 'player_alpha' });
          return hostVNode;
        })
      );

      const auctionEl = findVNode(hostVNode, (n) => n?.type === AuctionModal);
      expect(auctionEl).not.toBeNull();

      const innerModal = renderInteractiveModal(auctionEl.props);
      const leadingCloseBtn = innerModal.findTestId('auction-leading-close-btn');
      expect(leadingCloseBtn).not.toBeNull();

      leadingCloseBtn.props.onClick();
      expect(useGameStore.getState().activeModal).toBeNull();
      expect(useGameStore.getState().dismissedAuctionCellIndex).toBe(5);
    });

    it('[TC-232.09/MSS][UC-IMP232][Facet-3/MiniAuctionStripVisibleWhenDismissed] Khi AuctionModal bị dismiss và người chơi đang là highest bidder, MiniAuctionStrip hiển thị 👑 ${playerName} (tên người dẫn đầu lấy từ playersInfo) và giá thầu hiện tại', () => {
      useGameStore.setState({
        auction: {
          cellIndex: 1,
          currentBid: 1600,
          highestBidderId: 'player_alpha',
          timeRemaining: 10,
          isConcluded: false,
        },
        activeModal: null,
        dismissedAuctionCellIndex: 1,
        turnPhase: TurnPhase.AuctionPhase,
        playersInfo: {
          player_alpha: {
            id: 'player_alpha',
            name: 'Chủ Tịch',
            balance: 25000,
            tokenColor: '#ef4444',
            ownedProperties: [],
          },
        },
      });

      const stripHtml = renderToStaticMarkup(React.createElement(MiniAuctionStrip));
      expect(stripHtml).toContain('data-testid="mini-auction-strip"');
      expect(stripHtml).toContain('👑 Chủ Tịch');
      expect(stripHtml).toContain('1.600');
    });

    it('[TC-232.10/MSS][UC-IMP232][Facet-3/RestoreAuctionBringsBackLeadingModal] Bấm nút [👁️ Mở Lại] trên MiniAuctionStrip phục hồi AuctionModal với đúng trạng thái isLeading = true', () => {
      useGameStore.setState({
        auction: {
          cellIndex: 1,
          currentBid: 1600,
          highestBidderId: 'player_alpha',
          timeRemaining: 10,
          isConcluded: false,
        },
        activeModal: null,
        dismissedAuctionCellIndex: 1,
        turnPhase: TurnPhase.AuctionPhase,
        playersInfo: {
          player_alpha: {
            id: 'player_alpha',
            name: 'Chủ Tịch',
            balance: 25000,
            tokenColor: '#ef4444',
            ownedProperties: [],
          },
        },
      });

      let stripVNode: any = null;
      renderToStaticMarkup(
        React.createElement(() => {
          stripVNode = MiniAuctionStrip();
          return stripVNode;
        })
      );

      const restoreBtn = findVNode(
        stripVNode,
        (n) => n?.type === 'button' && typeof n?.props?.onClick === 'function' && renderToStaticMarkup(n).includes('Mở Lại')
      );
      expect(restoreBtn).not.toBeNull();
      restoreBtn.props.onClick();

      expect(useGameStore.getState().activeModal).toBe('auction');
      const restoredPayload = useGameStore.getState().modalPayload as AuctionModalProps | null;
      expect(restoredPayload?.highestBidderId).toBe('player_alpha');
      expect(restoredPayload).not.toBeNull();

      const restoredVNode = renderInteractiveModal({
        ...restoredPayload!,
        myId: 'player_alpha',
      });
      expect(restoredVNode.findTestId('auction-leading-close-btn')).not.toBeNull();
    });
  });

  // ==========================================================================
  // FACET 4: Việt Hóa Thông Báo Lỗi Server
  // ==========================================================================
  describe('Facet 4: Việt Hóa Thông Báo Lỗi Server (Actionable Notification Dictionary)', () => {
    it('[TC-232.11/MSS][UC-IMP232][Facet-4/ResolveHighestBidderNotification] resolveActionableNotification("HIGHEST_BIDDER_CANNOT_PASS") trả về đầy đủ icon 👑, tiêu đề "Đang Dẫn Đầu Đấu Giá", thông điệp và hướng dẫn hành động cụ thể', () => {
      const notif = resolveActionableNotification('HIGHEST_BIDDER_CANNOT_PASS');
      expect(notif.icon).toBe('👑');
      expect(notif.title).toBe('Đang Dẫn Đầu Đấu Giá');
      expect(notif.description).toContain('Bạn đang là người trả giá cao nhất nên không thể rút lui');
      expect(notif.actionHint).toContain('✕ Đóng / Xem Bàn Cờ');
    });

    it('[TC-232.12/MSS][UC-IMP232][Facet-4/FormatServerErrorMessageHighestBidder] formatServerErrorMessage("HIGHEST_BIDDER_CANNOT_PASS") định dạng chuỗi tiếng Việt thân thiện, không chứa mã lỗi tiếng Anh thô', () => {
      const msg = formatServerErrorMessage('HIGHEST_BIDDER_CANNOT_PASS');
      expect(msg).toContain('Đang Dẫn Đầu Đấu Giá: Bạn đang là người trả giá cao nhất');
      expect(msg).toContain('👉 Bạn có thể nhấn "✕ Đóng / Xem Bàn Cờ"');
      expect(msg).not.toContain('HIGHEST_BIDDER_CANNOT_PASS');
    });

    it('[TC-232.13/MSS][UC-IMP232][Facet-4/CaseInsensitiveAliasSupport] Hỗ trợ đầy đủ bộ alias "highest_bidder cannot pass", "highest_bidder_cannot_pass", "HighestBidderCannotPass", trả về cùng đối tượng thông báo chuẩn mực', () => {
      const alias1 = resolveActionableNotification('highest_bidder cannot pass');
      const alias2 = resolveActionableNotification('highest_bidder_cannot_pass');
      const alias3 = resolveActionableNotification('HighestBidderCannotPass');

      expect(alias1.title).toBe('Đang Dẫn Đầu Đấu Giá');
      expect(alias2.title).toBe('Đang Dẫn Đầu Đấu Giá');
      expect(alias3.title).toBe('Đang Dẫn Đầu Đấu Giá');
      expect(alias1.icon).toBe('👑');
    });
  });

  // ==========================================================================
  // FACET 5: Độ Bền Vững & Hồi Quy
  // ==========================================================================
  describe('Facet 5: Độ Bền Vững & Hồi Quy (Robustness & Regression Guard)', () => {
    it('[TC-232.14/MSS][UC-IMP232][Facet-5/ServerAuthoritativeRejectionRemainsSafe] Hàm server handleAuctionPass vẫn duy trì kiểm tra session.highestBidder === playerId trả về HIGHEST_BIDDER_CANNOT_PASS, bảo vệ vững chắc quy tắc đấu giá', () => {
      const mgr = new RoomManager(23201);
      const room = mgr.createRoom('player_1');
      mgr.addBot(room.roomCode, 'player_2');
      mgr.addBot(room.roomCode, 'player_3');
      mgr.startGame(room.roomCode);
      room.currentPlayerIndex = 0;
      room.players[0]!.position = 12;
      room.phase = TurnPhase.ActionPhase;

      mgr.handleDecline(room.roomCode, 'player_1');
      expect(room.phase).toBe(TurnPhase.AuctionPhase);

      const bidRes = mgr.handleAuctionBid(room.roomCode, 'player_2', 1000);
      expect(bidRes.success).toBe(true);
      expect(room.phase).toBe(TurnPhase.AuctionPhase);

      const passRes = mgr.handleAuctionPass(room.roomCode, 'player_2');
      expect(passRes.success).toBe(false);
      expect(passRes.reason).toBe('HIGHEST_BIDDER_CANNOT_PASS');
    });

    it('[TC-232.15/MSS][UC-IMP232][Facet-5/SSRHeadlessRenderSafety] Kết xuất SSR headless của AuctionModal khi isLeading = true chạy trơn tru 100% không văng ngoại lệ', () => {
      expect(() => {
        const html = renderToStaticMarkup(
          React.createElement(AuctionModal, {
            cellIndex: 3,
            currentBid: 2400,
            highestBidderId: 'player_alpha',
            myId: 'player_alpha',
            timeRemaining: 15,
            myBalance: 20000,
          })
        );
        expect(html).toContain('data-testid="auction-modal"');
        expect(html).toContain('Bạn đang dẫn đầu mức giá cao nhất!');
      }).not.toThrow();
    });

    it('[TC-232.16/MSS][UC-IMP232][Facet-5/AuctionConcludedStateTakesPrecedence] Khi phiên kết thúc (isConcluded = true), luôn hiển thị auction-concluded-close-btn bất kể ai là người dẫn đầu', () => {
      const vnode = renderInteractiveModal({
        cellIndex: 1,
        currentBid: 1200,
        highestBidderId: 'player_alpha',
        myId: 'player_alpha',
        isConcluded: true,
        winnerId: 'player_alpha',
        timeRemaining: 0,
      });

      expect(vnode.findTestId('auction-concluded-close-btn')).not.toBeNull();
      expect(vnode.findTestId('auction-leading-close-btn')).toBeNull();
      expect(vnode.findTestId('auction-pass-btn')).toBeNull();
    });
  });
});
