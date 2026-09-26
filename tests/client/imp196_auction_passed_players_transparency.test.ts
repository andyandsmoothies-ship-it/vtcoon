// [TC-IMP196/MSS][UC-IMP196] Station 1 Contract Tests:
// Auction Passed Players Transparency, Competing Headcount Counter, Foreclosure Role Symmetry & apply_delta Reset
// Universal 5-Facet Behavioral Matrix & Atomic Test Mandate (1-4 asserts/test, zero loops in it())

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'fs';
import path from 'path';
import { AuctionModal } from '../../src/client/ui/modals/auction_modal';
import { ModalHost } from '../../src/client/ui/modals/modal_host';
import { useGameStore } from '../../src/client/store/game_store';
import { useLobbyStore } from '../../src/client/store/lobby_store';
import { applyDeltaToStore } from '../../src/client/network/apply_delta';
import type { PlayerInfo } from '../../src/client/store/game_store_types';

// Realistic investor test fixtures
const MOCK_INVESTORS: Record<string, Partial<PlayerInfo>> = {
  p1: {
    id: 'p1',
    name: 'Đại Gia Sài Gòn',
    tokenColor: '#e11d48',
    avatar: '🦁',
    balance: 5000,
    ownedProperties: [1, 3],
    mortgagedProperties: [],
    bankrupt: false,
    isBankrupt: false,
  },
  p2: {
    id: 'p2',
    name: 'Tỷ Phú Hà Thành',
    tokenColor: '#2563eb',
    avatar: '🦅',
    balance: 6000,
    ownedProperties: [6],
    mortgagedProperties: [],
    bankrupt: false,
    isBankrupt: false,
  },
  p3: {
    id: 'p3',
    name: 'Công Tử Bạc Liêu',
    tokenColor: '#059669',
    avatar: '🐯',
    balance: 4000,
    ownedProperties: [],
    mortgagedProperties: [],
    bankrupt: false,
    isBankrupt: false,
  },
};

describe('[UC-IMP196/MSS] Station 1 RED: Auction Passed Players Transparency Contract Suite', () => {
  beforeEach(() => {
    useLobbyStore.setState({
      myPlayerId: 'p1',
      roomCode: 'VTK196',
      gameStarted: true,
    });
    useGameStore.setState({
      activeModal: null,
      modalPayload: null,
      playersInfo: MOCK_INVESTORS as any,
    });
  });

  // =========================================================================
  // FACET 1: BOUNDARY & COMPACTNESS (BADGES & STYLING)
  // =========================================================================
  describe('Facet 1: Boundary & Compactness (Nhãn trạng thái & Bảng màu quy chuẩn)', () => {
    it('[TC-196.01/MSS][UC-IMP196] Badge [✕ Rút lui] hiển thị chính xác text "✕ Rút lui" khi người chơi có trong passedPlayerIds', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal as any, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          playersInfo: MOCK_INVESTORS,
          passedPlayerIds: ['p2'],
        })
      );
      expect(html).toContain('✕ Rút lui');
    });

    it('[TC-196.02/MSS][UC-IMP196] Badge [✕ Rút lui] tuân thủ đúng bảng màu trung tính bg-slate-200 text-slate-600 border-slate-300', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal as any, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          playersInfo: MOCK_INVESTORS,
          passedPlayerIds: ['p2'],
        })
      );
      expect(html).toMatch(/bg-slate-200.*text-slate-600.*border-slate-300|border-slate-300.*text-slate-600.*bg-slate-200/);
    });

    it('[TC-196.03/MSS][UC-IMP196] Badge [⚖️ Phát mãi] hiển thị chính xác khi là phiên phát mãi cưỡng chế (isForeclosure = true) và người chơi là con nợ', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal as any, {
          cellIndex: 1,
          currentBid: 420,
          highestBidderId: null,
          timeRemaining: 15,
          isForeclosure: true,
          insolvencyPlayerId: 'p3',
          playersInfo: MOCK_INVESTORS,
        })
      );
      expect(html).toContain('⚖️ Phát mãi');
    });

    it('[TC-196.04/MSS][UC-IMP196] Badge [⚖️ Phát mãi] tuân thủ bảng màu cảnh báo đỏ bg-rose-100 text-rose-700 border-rose-200', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal as any, {
          cellIndex: 1,
          currentBid: 420,
          highestBidderId: null,
          timeRemaining: 15,
          isForeclosure: true,
          insolvencyPlayerId: 'p3',
          playersInfo: MOCK_INVESTORS,
        })
      );
      expect(html).toMatch(/bg-rose-100.*text-rose-700.*border-rose-200|border-rose-200.*text-rose-700.*bg-rose-100/);
    });

    it('[TC-196.05/MSS][UC-IMP196] Badge [🚫 Bỏ qua] hiển thị chính xác text "🚫 Bỏ qua" khi người chơi từ chối mua ô đất (declinedPlayerId)', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal as any, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          declinedPlayerId: 'p2',
          playersInfo: MOCK_INVESTORS,
          isForeclosure: false,
        })
      );
      expect(html).toContain('🚫 Bỏ qua');
    });

    it('[TC-196.06/MSS][UC-IMP196] Badge [🚫 Bỏ qua] tuân thủ bảng màu vàng hổ phách bg-amber-100 text-amber-800 border-amber-300', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal as any, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          declinedPlayerId: 'p2',
          playersInfo: MOCK_INVESTORS,
          isForeclosure: false,
        })
      );
      expect(html).toMatch(/bg-amber-100.*text-amber-800.*border-amber-300|border-amber-300.*text-amber-800.*bg-amber-100/);
    });

    it('[TC-196.06B/MSS][UC-IMP196] Header hợp nhất tinh gọn: Loại bỏ hoàn toàn text thừa "SÀN ĐẤU GIÁ TRỰC TUYẾN", "LIVE TABLETOP ARENA" và badge "ĐANG MỞ", tích hợp nút đóng vào auction-hero-header', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal as any, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          playersInfo: MOCK_INVESTORS,
          onClose: () => {},
        })
      );
      expect(html).not.toContain('SÀN ĐẤU GIÁ TRỰC TUYẾN');
      expect(html).not.toContain('LIVE TABLETOP ARENA');
      expect(html).not.toContain('>ĐANG MỞ<');
      expect(html).toContain('data-testid="auction-hero-header"');
      expect(html).toContain('aria-label="Đóng sàn đấu giá"');
    });
  });

  // =========================================================================
  // FACET 2: LAYOUT & COUNTER (COMPETING VS TOTAL INVESTOR COUNT)
  // =========================================================================
  describe('Facet 2: Layout & Counter (Bộ đếm đại gia cạnh tranh)', () => {
    it('[TC-196.07/MSS][UC-IMP196] Tiêu đề hiển thị (3/3) khi tất cả 3 đại gia đều đang tham gia cạnh tranh', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal as any, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          playersInfo: MOCK_INVESTORS,
          passedPlayerIds: [],
        })
      );
      expect(html).toMatch(/ĐẠI GIA THAM GIA.*\(3\/3\)/);
    });

    it('[TC-196.08/MSS][UC-IMP196] Tiêu đề hiển thị (2/3) khi có 1 người chơi đã rút lui', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal as any, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          playersInfo: MOCK_INVESTORS,
          passedPlayerIds: ['p2'],
        })
      );
      expect(html).toMatch(/ĐẠI GIA THAM GIA.*\(2\/3\)/);
    });

    it('[TC-196.09/MSS][UC-IMP196] Tiêu đề hiển thị (1/3) khi có 1 người rút lui và 1 người từ chối mua', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal as any, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          playersInfo: MOCK_INVESTORS,
          passedPlayerIds: ['p2'],
          declinedPlayerId: 'p3',
        })
      );
      expect(html).toMatch(/ĐẠI GIA THAM GIA.*\(1\/3\)/);
    });

    it('[TC-196.10/MSS][UC-IMP196] Tiêu đề hiển thị (0/3) khi cả 3 người chơi đều không còn cạnh tranh', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal as any, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          playersInfo: MOCK_INVESTORS,
          passedPlayerIds: ['p1', 'p2'],
          declinedPlayerId: 'p3',
        })
      );
      expect(html).toMatch(/ĐẠI GIA THAM GIA.*\(0\/3\)/);
    });

    it('[TC-196.11/MSS][UC-IMP196] Người chơi đã phá sản (bankrupt: true) không được tính vào tổng số đại gia totalCount', () => {
      const playersWithBankrupt: Record<string, Partial<PlayerInfo>> = {
        ...MOCK_INVESTORS,
        p3: {
          ...MOCK_INVESTORS.p3,
          bankrupt: true,
          isBankrupt: true,
        },
      };
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal as any, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          playersInfo: playersWithBankrupt,
          passedPlayerIds: ['p2'],
        })
      );
      expect(html).toMatch(/ĐẠI GIA THAM GIA.*\(1\/2\)/);
    });
  });

  // =========================================================================
  // FACET 3: DATA LIFECYCLE & PROPS (AUCTION MODAL PROPS & MODAL HOST)
  // =========================================================================
  describe('Facet 3: Data Lifecycle & Props (Hợp đồng Props & Tích hợp ModalHost)', () => {
    it('[TC-196.12/MSS][UC-IMP196] AuctionModal nhận prop passedPlayerIds và render đồng thời nhiều badge rút lui cho các đối thủ', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal as any, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          playersInfo: MOCK_INVESTORS,
          passedPlayerIds: ['p2', 'p3'],
        })
      );
      const matches = html.match(/✕ Rút lui/g);
      expect(matches).not.toBeNull();
      expect(matches?.length).toBe(2);
    });

    it('[TC-196.13/MSS][UC-IMP196] AuctionModal nhận prop declinedPlayerId và chỉ dán nhãn bỏ qua cho đúng người chơi chỉ định', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal as any, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          playersInfo: MOCK_INVESTORS,
          declinedPlayerId: 'p2',
        })
      );
      expect(html).toContain('Tỷ Phú Hà Thành');
      expect(html).toContain('🚫 Bỏ qua');
      expect(html.match(/🚫 Bỏ qua/g)?.length).toBe(1);
    });

    it('[TC-196.14/MSS][UC-IMP196] ModalHost chuyển tiếp đầy đủ passedPlayerIds từ modalPayload sang AuctionModal', () => {
      useGameStore.setState({
        activeModal: 'auction',
        modalPayload: {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          passedPlayerIds: ['p2'],
        } as any,
        playersInfo: MOCK_INVESTORS as any,
      });

      const html = renderToStaticMarkup(
        React.createElement(ModalHost, { localPlayerId: 'p1' })
      );
      expect(html).toContain('✕ Rút lui');
    });

    it('[TC-196.15/MSS][UC-IMP196] ModalHost chuyển tiếp đầy đủ declinedPlayerId từ modalPayload sang AuctionModal', () => {
      useGameStore.setState({
        activeModal: 'auction',
        modalPayload: {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          declinedPlayerId: 'p3',
        } as any,
        playersInfo: MOCK_INVESTORS as any,
      });

      const html = renderToStaticMarkup(
        React.createElement(ModalHost, { localPlayerId: 'p1' })
      );
      expect(html).toContain('🚫 Bỏ qua');
    });
  });

  // =========================================================================
  // FACET 4: ACTOR INVERSION & ROLE SYMMETRY
  // =========================================================================
  describe('Facet 4: Actor Inversion & Role Symmetry (Phát mãi đối xứng & Miễn nhiễm dẫn đầu)', () => {
    it('[TC-196.16/MSS][UC-IMP196] Khi isForeclosure = true, con nợ mang nhãn [⚖️ Phát mãi], tuyệt đối không bị dán nhãn nhầm [🚫 Bỏ qua]', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal as any, {
          cellIndex: 1,
          currentBid: 420,
          highestBidderId: null,
          timeRemaining: 15,
          isForeclosure: true,
          insolvencyPlayerId: 'p3',
          declinedPlayerId: 'p3',
          playersInfo: MOCK_INVESTORS,
        })
      );
      expect(html).toContain('⚖️ Phát mãi');
      expect(html).not.toContain('🚫 Bỏ qua');
    });

    it('[TC-196.17/MSS][UC-IMP196] Khi myId rút lui (hasPassed = true hoặc có trong passedPlayerIds), dòng người chơi có (Bạn) + [✕ Rút lui] và bị gạch ngang line-through', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal as any, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          myId: 'p1',
          hasPassed: true,
          passedPlayerIds: ['p1'],
          playersInfo: MOCK_INVESTORS,
        })
      );
      expect(html).toContain('(Bạn)');
      expect(html).toContain('✕ Rút lui');
      expect(html).toContain('line-through');
    });

    it('[TC-196.18/MSS][UC-IMP196] Người dẫn đầu (highestBidderId === p.id) luôn giữ nhãn 👑 Dẫn đầu, không bị ghi đè bởi nhãn rút lui (phòng thủ server glitch)', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal as any, {
          cellIndex: 1,
          currentBid: 800,
          highestBidderId: 'p2',
          timeRemaining: 10,
          passedPlayerIds: ['p2'], // Giả lập server glitch đồng thời gửi p2 trong passedPlayerIds
          playersInfo: MOCK_INVESTORS,
        })
      );
      expect(html).toContain('👑 Dẫn đầu');
      // Tỷ Phú Hà Thành là người dẫn đầu, không được mang nhãn rút lui
      expect(html).not.toMatch(/Tỷ Phú Hà Thành.*✕ Rút lui/);
    });
  });

  // =========================================================================
  // FACET 5: TRANSIENT TEARDOWN & APPLY_DELTA
  // =========================================================================
  describe('Facet 5: Transient Teardown & apply_delta (Dọn dẹp trạng thái & Khử rò rỉ phiên)', () => {
    it('[TC-196.19/MSS][UC-IMP196] applyDelta không kế thừa hasPassed: true từ phiên cũ khi delta.auction.cellIndex khác với prevPayload.cellIndex', () => {
      useLobbyStore.setState({ myPlayerId: 'p1' });
      useGameStore.setState({
        activeModal: 'auction',
        modalPayload: {
          cellIndex: 5,
          currentBid: 500,
          highestBidderId: null,
          timeRemaining: 10,
          hasPassed: true,
        },
      });

      // Phiên đấu giá mới cho ô đất khác (cellIndex = 8)
      applyDeltaToStore({
        auction: {
          cellIndex: 8,
          currentBid: 700,
          highestBidderId: null,
          timeRemaining: 15,
          passedPlayerIds: [],
        },
      } as any);

      const payload = useGameStore.getState().modalPayload as any;
      expect(payload.cellIndex).toBe(8);
      expect(payload.hasPassed).toBeFalsy();
    });

    it('[TC-196.20/MSS][UC-IMP196] applyDelta giữ nguyên hasPassed: true nếu cùng một phiên đấu giá (delta.auction.cellIndex === prevPayload.cellIndex)', () => {
      useLobbyStore.setState({ myPlayerId: 'p1' });
      useGameStore.setState({
        activeModal: 'auction',
        modalPayload: {
          cellIndex: 5,
          currentBid: 500,
          highestBidderId: null,
          timeRemaining: 10,
          hasPassed: true,
        },
      });

      // Cập nhật giá thầu mới của phiên hiện tại (cùng cellIndex = 5)
      applyDeltaToStore({
        auction: {
          cellIndex: 5,
          currentBid: 600,
          highestBidderId: 'p2',
          timeRemaining: 12,
          passedPlayerIds: [],
        },
      } as any);

      const payload = useGameStore.getState().modalPayload as any;
      expect(payload.cellIndex).toBe(5);
      expect(payload.hasPassed).toBe(true);
    });

    it('[TC-196.21/MSS][UC-IMP196] applyDelta tự động đồng bộ hasPassed: true khi delta.auction.passedPlayerIds chứa myPlayerId', () => {
      useLobbyStore.setState({ myPlayerId: 'p1' });
      useGameStore.setState({
        activeModal: 'auction',
        modalPayload: {
          cellIndex: 5,
          currentBid: 500,
          highestBidderId: null,
          timeRemaining: 10,
          hasPassed: false,
        },
      });

      // Máy chủ thông báo p1 đã rút lui
      applyDeltaToStore({
        auction: {
          cellIndex: 5,
          currentBid: 600,
          highestBidderId: 'p2',
          timeRemaining: 12,
          passedPlayerIds: ['p1'],
        },
      } as any);

      const payload = useGameStore.getState().modalPayload as any;
      expect(payload.cellIndex).toBe(5);
      expect(payload.hasPassed).toBe(true);
    });
  });

  // =========================================================================
  // FACET 6: LOC BUDGET (NGÂN SÁCH DÒNG MÃ)
  // =========================================================================
  describe('Facet 6: LOC Budget (Ngân sách dòng mã)', () => {
    it('[TC-196.22/MSS][UC-IMP196] Ngân sách LOC: auction_modal.tsx <= 480 LOC, modal_host.tsx <= 480 LOC, apply_delta.ts <= 300 LOC', () => {
      const auctionModalPath = path.resolve(process.cwd(), 'src/client/ui/modals/auction_modal.tsx');
      const modalHostPath = path.resolve(process.cwd(), 'src/client/ui/modals/modal_host.tsx');
      const applyDeltaPath = path.resolve(process.cwd(), 'src/client/network/apply_delta.ts');

      const locAuctionModal = fs.readFileSync(auctionModalPath, 'utf-8').split('\n').length;
      const locModalHost = fs.readFileSync(modalHostPath, 'utf-8').split('\n').length;
      const locApplyDelta = fs.readFileSync(applyDeltaPath, 'utf-8').split('\n').length;

      expect(locAuctionModal).toBeLessThanOrEqual(480);
      expect(locModalHost).toBeLessThanOrEqual(480);
      expect(locApplyDelta).toBeLessThanOrEqual(300);
    });
  });
});
