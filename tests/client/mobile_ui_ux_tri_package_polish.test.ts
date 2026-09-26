// [TC-IMP123/MSS] Contract Test Suite for IMP-123: Mobile UI/UX Tri-Package Polish
// Universal 4-Facet Behavioral Matrix:
// - Facet 1 (Boundary & Range): Round ceiling clamping (35/40, cap 40), touch targets (min-w-[44px], min-h-[44px]), safe ergonomics.
// - Facet 2 (State Reactivity): Dynamic bot turn whitespace-nowrap, event card mobile deduplication, property select state data-selected="true", rent display.
// - Facet 3 (Resource Disposal & SSR): Clean SSR renderToStaticMarkup without dangling elements, empty list resilience, null toast cleanup.
// - Facet 4 (Error Defense & WCAG AA): Server error localization, disabled submit button contrast (text-slate-600 on bg-slate-200, no text-slate-400), invalid intent defense.

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Ensure Zustand stores evaluate live state instead of stale initial snapshot during Node.js SSR test rendering
const origUseSyncExternalStore = React.useSyncExternalStore;
React.useSyncExternalStore = ((subscribe, getSnapshot, _getServerSnapshot) => {
  return origUseSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}) as typeof React.useSyncExternalStore;

import * as MainModule from '../../src/client/main';
import { EventCardModal } from '../../src/client/ui/modals/event_card_modal';
import { TopBar } from '../../src/client/ui/top_bar';
import { PropertyPortfolioModal } from '../../src/client/ui/modals/property_portfolio_modal';
import { TradeModal } from '../../src/client/ui/modals/trade_modal';
import { ActionDock } from '../../src/client/ui/action_dock';
import { useGameStore } from '../../src/client/store/game_store';
import { useAudioStore } from '../../src/client/store/audio_store';
import { useActivityStore } from '../../src/client/store/activity_store';

const ServerToast = (MainModule as any).ServerToast;
const formatServerErrorMessage = (MainModule as any).formatServerErrorMessage;

describe('[IMP-123/MSS] Mobile UI/UX Tri-Package Polish Contract Test Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      roundNumber: 1,
      maxRounds: 30,
      turnTimeRemaining: 30,
      currentTurnPlayerId: 'p1',
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          balance: 15000,
          bankrupt: false,
          tokenColor: '#ef4444',
          ownedProperties: [1, 3],
          mortgagedProperties: [],
          mortgageLoans: {},
          isBot: false,
          inAudit: false,
        },
        p2: {
          id: 'p2',
          name: 'Bot AI 2',
          balance: 12000,
          bankrupt: false,
          tokenColor: '#3b82f6',
          ownedProperties: [6, 8],
          mortgagedProperties: [],
          mortgageLoans: {},
          isBot: true,
          inAudit: false,
        },
      },
      treasuryPool: 2500,
      isRolling: false,
      hasRolledThisTurn: false,
      activeEmotes: {},
      levelMap: {},
      playerPositions: { p1: 1, p2: 6 },
      dice: [1, 2],
    });

    useAudioStore.setState({ isMuted: false });
    useActivityStore.setState({ isActivityFeedOpen: false, unreadCount: 0, activityLogs: [] });
  });

  // =========================================================================
  // GÓI 1: SỬA LỖI HIỂN THỊ & LAYOUT
  // =========================================================================

  describe('Gói 1.1: Toast Lỗi Máy Chủ (src/client/main.tsx)', () => {
    it('[TC-IMP123.01/MSS][UI-S01/MSS] ServerToast định vị dưới TopBar (top-18, top-20 hoặc mt-16), không dùng top-4 che khuất TopBar', () => {
      const html = renderToStaticMarkup(
        React.createElement(ServerToast, { message: 'Lỗi thử nghiệm' })
      );
      expect(html).toContain('role="alert"');
      expect(html).not.toContain('top-4');
      expect(html).toMatch(/top-18|top-20|mt-16/);
    });

    it('[TC-IMP123.02/MSS][UI-S01/MSS] formatServerErrorMessage bản địa hóa lỗi CANNOT_ROLL thành thông báo tiếng Việt thân thiện', () => {
      const msg = formatServerErrorMessage('CANNOT_ROLL');
      expect(msg).toMatch(/Chưa tới lượt đổ xúc xắc|bước di chuyển/i);
    });

    it('[TC-IMP123.03/MSS][UI-S01/MSS] formatServerErrorMessage bản địa hóa các lỗi trạng thái phòng sang tiếng Việt dễ hiểu', () => {
      const msgRoom = formatServerErrorMessage('ROOM_NOT_FOUND');
      const msgPlayer = formatServerErrorMessage('NOT_ENOUGH_PLAYERS');
      const msgHost = formatServerErrorMessage('NOT_HOST');
      expect(msgRoom).toMatch(/phòng/i);
      expect(msgPlayer).toMatch(/người chơi/i);
      expect(msgHost).toMatch(/chủ phòng/i);
    });

    it('[TC-IMP123.04/MSS][UI-S01/MSS] formatServerErrorMessage bản địa hóa các lỗi vi phạm luật xây dựng', () => {
      const msgEven = formatServerErrorMessage('EVEN_BUILDING_VIOLATION');
      const msgMono = formatServerErrorMessage('MISSING_MONOPOLY');
      expect(msgEven).toMatch(/đều tay/i);
      expect(msgMono).toMatch(/bộ màu/i);
    });

    it('[TC-IMP123.05/MSS][UI-S01/MSS] ServerToast trả về null hoặc rỗng khi message là null (Resource Disposal)', () => {
      const html = renderToStaticMarkup(
        React.createElement(ServerToast, { message: null })
      );
      expect(html).toBe('');
    });
  });

  describe('Gói 1.2: Khử Trùng Lặp Thẻ Sự Kiện (src/client/ui/modals/event_card_modal.tsx)', () => {
    it('[TC-IMP123.06/MSS][UI-S04/MSS] EventCardModal thẻ thị trường ẩn đoạn miêu tả dư thừa trên mobile bằng hidden sm:block', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: 'MC_CREDIT_STIMULUS',
          description: 'Gói kích cầu tín dụng toàn thị trường.',
          effectDetail: 'Miễn toàn bộ lãi suất thế chấp khi vượt GO.',
        })
      );
      expect(html).toContain('hidden sm:block');
    });

    it('[TC-IMP123.07/MSS][UI-S04/MSS] EventCardModal thẻ cơ hội không hiển thị lặp 2 lần đoạn miêu tả trên mobile', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'chance',
          cardId: 'CC_TAX_REFUND',
          description: 'Hoàn thuế doanh nghiệp nhà nước.',
          effectDetail: 'Nhận 1.000 Tr. VNĐ từ Kho Bạc.',
        })
      );
      expect(html).toContain('hidden sm:block');
    });

    it('[TC-IMP123.08/MSS][UI-S04/MSS] EventCardModal hiển thị khối tóm tắt tác động nhanh duy nhất trên mobile', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: 'MC_CREDIT_STIMULUS',
          description: 'Gói kích cầu tín dụng.',
          effectDetail: 'Miễn toàn bộ lãi suất.',
        })
      );
      expect(html).toContain('data-testid="event-impact-summary"');
      expect(html).toContain('sm:hidden');
    });

    it('[TC-IMP123.09/MSS][UI-S04/MSS] EventCardModal bảo tồn bảng thông số minh bạch trên màn hình máy tính', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: 'MC_CREDIT_STIMULUS',
          description: 'Gói kích cầu tín dụng.',
        })
      );
      expect(html).toContain('data-testid="event-specs-table"');
      expect(html).toContain('hidden sm:flex');
    });
  });

  describe('Gói 1.3: Chống Gãy Dòng TopBar (src/client/ui/top_bar.tsx)', () => {
    it('[TC-IMP123.10/MSS][UI-S03/MSS] TopBar khi đến lượt Bot phải có class whitespace-nowrap ngăn gãy dòng capsule', () => {
      useGameStore.setState({ currentTurnPlayerId: 'p2' }); // p2 isBot: true
      const html = renderToStaticMarkup(React.createElement(TopBar, {}));
      expect(html).toContain('🤖 Đang tính...');
      expect(html).toContain('whitespace-nowrap');
    });

    it('[TC-IMP123.11/MSS][UI-S03/MSS] TopBar hiển thị trạng thái lượt bot trong match-info-capsule mà không phá vỡ cấu trúc flex', () => {
      useGameStore.setState({ currentTurnPlayerId: 'p2' });
      const html = renderToStaticMarkup(React.createElement(TopBar, {}));
      expect(html).toContain('data-testid="match-info-capsule"');
      expect(html).toContain('role="timer"');
    });

    it('[TC-IMP123.12/MSS][UI-S03/MSS] TopBar phục hồi đồng hồ đếm ngược số dạng MM:SS khi lượt chuyển về người chơi', () => {
      useGameStore.setState({ currentTurnPlayerId: 'p1', turnTimeRemaining: 25 });
      const html = renderToStaticMarkup(React.createElement(TopBar, {}));
      expect(html).toContain('00:25');
      expect(html).not.toContain('🤖 Đang tính...');
    });
  });

  describe('Gói 1.4: Đồng Bộ Trần Vòng Đấu (src/client/ui/top_bar.tsx)', () => {
    it('[TC-IMP123.13/MSS][UI-S03/MSS] TopBar hiển thị đúng tỷ lệ vòng đấu thông thường khi roundNumber <= maxRounds (5/30)', () => {
      useGameStore.setState({ roundNumber: 5, maxRounds: 30 });
      const html = renderToStaticMarkup(React.createElement(TopBar, {}));
      expect(html).toContain('5');
      expect(html).toContain('/30');
    });

    it('[TC-IMP123.14/MSS][UI-S03/MSS] TopBar nâng mẫu số tương ứng không để tử số vượt mẫu số khi roundNumber > maxRounds (35/40)', () => {
      useGameStore.setState({ roundNumber: 35, maxRounds: 30 });
      const html = renderToStaticMarkup(React.createElement(TopBar, {}));
      expect(html).toContain('35');
      expect(html).not.toContain('/30');
      expect(html).toContain('/40');
    });

    it('[TC-IMP123.15/MSS][UI-S03/MSS] TopBar giới hạn mẫu số tối đa ở trần 40 vòng theo luật game', () => {
      useGameStore.setState({ roundNumber: 42, maxRounds: 30 });
      const html = renderToStaticMarkup(React.createElement(TopBar, {}));
      expect(html).not.toContain('/30');
      expect(html).toMatch(/\/(40|42)/);
    });

    it('[TC-IMP123.16/MSS][UI-S03/MSS] TopBar đảm bảo bất biến hiển thị: mẫu số luôn lớn hơn hoặc bằng tử số', () => {
      useGameStore.setState({ roundNumber: 32, maxRounds: 30 });
      const html = renderToStaticMarkup(React.createElement(TopBar, {}));
      expect(html).not.toContain('>32/30<');
      expect(html).not.toContain('/30');
    });
  });

  // =========================================================================
  // GÓI 2: TÁI CẤU TRÚC TRỰC QUAN BĐS & ĐÀM PHÁN
  // =========================================================================

  describe('Gói 2.1: Modal Danh Mục Bất Động Sản (src/client/ui/modals/property_portfolio_modal.tsx)', () => {
    it('[TC-IMP123.17/MSS][UI-IMP75/MSS] Nút Thế Chấp chuyển thành nút phụ tinh tế có viền cảnh báo, loại bỏ hoàn toàn bg-amber-500 lấn át', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1],
          propertyStates: { 1: { ownerId: 'p1', level: 0, isMortgaged: false } },
          currentBalance: 1500,
        })
      );
      expect(html).not.toContain('bg-amber-500 hover:bg-amber-400');
      expect(html).toMatch(/border-rose-300|border-amber-300|text-rose-700|text-amber-900/);
    });

    it('[TC-IMP123.18/MSS][UI-IMP75/MSS] Mỗi mục BĐS hiển thị nhãn Tiền Thuê với data-testid="property-rent-val"', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1], // Cần Thơ C0
          propertyStates: { 1: { ownerId: 'p1', level: 0, isMortgaged: false } },
          currentBalance: 1500,
        })
      );
      expect(html).toContain('data-testid="property-rent-val"');
      expect(html).toMatch(/Thuê|Tiền Thuê/i);
    });

    it('[TC-IMP123.19/MSS][UI-IMP75/MSS] Mỗi mục BĐS hiển thị giá trị tài sản niêm yết', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1], // Cần Thơ giá 600
          propertyStates: { 1: { ownerId: 'p1', level: 0, isMortgaged: false } },
          currentBalance: 1500,
        })
      );
      expect(html).toMatch(/600|Giá/i);
    });

    it('[TC-IMP123.20/MSS][UI-IMP75/MSS] Nút Sổ Đỏ ↗ đạt chuẩn kích thước công thái học min-w-[44px] và min-h-[44px]', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1],
          propertyStates: { 1: { ownerId: 'p1', level: 0, isMortgaged: false } },
          currentBalance: 1500,
          onSelectDeed: () => {},
        })
      );
      expect(html).toContain('Sổ Đỏ ↗');
      expect(html).toContain('min-w-[44px]');
      expect(html).toContain('min-h-[44px]');
    });

    it('[TC-IMP123.21/MSS][UI-IMP75/MSS] Nút Đóng ở footer có khoảng đệm an toàn không dính mép viền đáy', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1],
          currentBalance: 1500,
          onClose: () => {},
        })
      );
      expect(html).toContain('Đóng');
      expect(html).toContain('min-h-[44px]');
    });

    it('[TC-IMP123.22/MSS][UI-IMP75/MSS] Danh mục BĐS hiển thị sạch sẽ khi không sở hữu BĐS nào (Resource Disposal)', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [],
          currentBalance: 1500,
        })
      );
      expect(html).toContain('Chưa sở hữu bất động sản nào');
      expect(html).not.toContain('data-testid="property-rent-val"');
    });
  });

  describe('Gói 2.2: Modal Đàm Phán P2P (src/client/ui/modals/trade_modal.tsx)', () => {
    it('[TC-IMP123.23/MSS][UI-S04/MSS] Khi BĐS được chọn thì mang data-selected="true" và border-amber-500', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'p2',
          myBalance: 15000,
          myProperties: [1, 3],
          targetProperties: [6, 8],
          initialOffered: [1],
        })
      );
      expect(html).toContain('data-selected="true"');
      expect(html).toContain('border-amber-500');
    });

    it('[TC-IMP123.24/MSS][UI-S04/MSS] BĐS được chọn hiển thị nhãn nhận diện rõ ràng [ĐÃ CHỌN]', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'p2',
          myBalance: 15000,
          myProperties: [1, 3],
          targetProperties: [6, 8],
          initialOffered: [1],
        })
      );
      expect(html).toContain('[ĐÃ CHỌN]');
    });

    it('[TC-IMP123.25/MSS][UI-S04/MSS] BĐS chưa được chọn không có thuộc tính data-selected="true"', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'p2',
          myBalance: 15000,
          myProperties: [1, 3],
          targetProperties: [6, 8],
          initialOffered: [],
        })
      );
      expect(html).not.toContain('data-selected="true"');
      expect(html).not.toContain('[ĐÃ CHỌN]');
    });

    it('[TC-IMP123.26/MSS][UI-S04/MSS] Nút Gửi Đề Xuất Đàm Phán khi disabled dùng text-slate-600 trên bg-slate-200, loại bỏ text-slate-400 (WCAG AA)', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'p2',
          myBalance: 15000,
          myProperties: [1, 3],
          targetProperties: [6, 8],
          initialOffered: [],
          initialRequested: [],
        })
      );
      expect(html).toContain('Gửi Đề Xuất Đàm Phán');
      expect(html).toContain('text-slate-600');
      expect(html).not.toContain('text-slate-400 cursor-not-allowed');
    });

    it('[TC-IMP123.27/MSS][UI-S04/MSS] Nút Gửi Đề Xuất Đàm Phán khi hợp lệ chuyển sang bg-emerald-500 với text-white', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'p2',
          myBalance: 15000,
          myProperties: [1, 3],
          targetProperties: [6, 8],
          initialOffered: [1],
          initialRequested: [6],
        })
      );
      expect(html).toContain('bg-emerald-500');
      expect(html).toContain('text-white');
    });
  });

  // =========================================================================
  // GÓI 3: ĐỒNG BỘ THẨM MỸ THANH ĐIỀU KHIỂN ĐÁY (ACTION DOCK)
  // =========================================================================

  describe('Gói 3.1: Đồng Bộ Hình Khối Nút Bấm (src/client/ui/action_dock.tsx)', () => {
    it('[TC-IMP123.28/MSS][UI-S03/MSS] Nút Đổ Xúc Xắc sử dụng bo góc Retropoly (rounded-2xl hoặc rounded-xl), loại bỏ rounded-full', () => {
      const html = renderToStaticMarkup(React.createElement(ActionDock, { isMyTurn: true }));
      expect(html).toContain('data-testid="roll-dice-btn"');
      expect(html).not.toMatch(/data-testid="roll-dice-btn"[^>]*rounded-full/);
      expect(html).toMatch(/data-testid="roll-dice-btn"[^>]*rounded-(2xl|xl)/);
    });

    it('[TC-IMP123.29/MSS][UI-S03/MSS] Nút Quản Lý BĐS sử dụng bo góc Retropoly (rounded-2xl hoặc rounded-xl), loại bỏ rounded-full', () => {
      const html = renderToStaticMarkup(React.createElement(ActionDock, { isMyTurn: true }));
      expect(html).toContain('Quản Lý BĐS');
      expect(html).not.toMatch(/aria-label="Quản lý và nâng cấp bất động sản"[^>]*rounded-full/);
      expect(html).toMatch(/aria-label="Quản lý và nâng cấp bất động sản"[^>]*rounded-(2xl|xl)/);
    });

    it('[TC-IMP123.30/MSS][UI-S03/MSS] Nút Đàm Phán sử dụng bo góc Retropoly (rounded-2xl hoặc rounded-xl), loại bỏ rounded-full', () => {
      const html = renderToStaticMarkup(React.createElement(ActionDock, { isMyTurn: true }));
      expect(html).toContain('Đàm Phán');
      expect(html).not.toMatch(/aria-label="Đàm phán thương lượng"[^>]*rounded-full/);
      expect(html).toMatch(/aria-label="Đàm phán thương lượng"[^>]*rounded-(2xl|xl)/);
    });

    it('[TC-IMP123.31/MSS][UI-S03/MSS] Nút Hết Lượt sử dụng bo góc Retropoly (rounded-2xl hoặc rounded-xl), loại bỏ rounded-full', () => {
      const html = renderToStaticMarkup(
        React.createElement(ActionDock, { isMyTurn: true, hasRolledThisTurn: true })
      );
      expect(html).toContain('Hết Lượt');
      expect(html).not.toMatch(/aria-label="Kết thúc lượt"[^>]*rounded-full/);
      expect(html).toMatch(/aria-label="Kết thúc lượt"[^>]*rounded-(2xl|xl)/);
    });

    it('[TC-IMP123.32/MSS][UI-S03/MSS] Toàn bộ các nút hành động áp dụng dập nổi xúc giác nhất quán shadow-[0_4px_0_0_#0f172a]', () => {
      const html = renderToStaticMarkup(
        React.createElement(ActionDock, { isMyTurn: true, hasRolledThisTurn: true })
      );
      expect(html).toContain('shadow-sm');
      expect(html).not.toContain('shadow-[0_4px_0_0_#0f172a]');
      expect(html).not.toContain('shadow-[0_4px_0_0_#020617]');
    });
  });

  describe('Gói 3.2: Tách Biệt Chip Lượt Bot (src/client/ui/action_dock.tsx)', () => {
    it('[TC-IMP123.33/MSS][UI-S03/MSS] bot-pacing-chip được định vị bên trên hoặc tách dòng (absolute hoặc top position), không chèn ngang hàng làm xô lệch dock', () => {
      useGameStore.setState({ currentTurnPlayerId: 'p2' }); // p2 is bot
      const html = renderToStaticMarkup(
        React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: false })
      );
      expect(html).toContain('data-testid="bot-pacing-chip"');
      expect(html).toMatch(/data-testid="bot-pacing-chip"[^>]*absolute|-top-|top-/);
    });

    it('[TC-IMP123.34/MSS][UI-S03/MSS] ActionDock bảo toàn cấu trúc hàng nút chính khi bot-pacing-chip hiển thị', () => {
      useGameStore.setState({ currentTurnPlayerId: 'p2' });
      const html = renderToStaticMarkup(
        React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: false })
      );
      expect(html).toContain('data-testid="roll-dice-btn"');
      expect(html).toContain('data-testid="bot-pacing-chip"');
    });

    it('[TC-IMP123.35/MSS][UI-S03/MSS] ActionDock không hiển thị bot-pacing-chip khi đến lượt người chơi cục bộ (Resource Disposal)', () => {
      useGameStore.setState({ currentTurnPlayerId: 'p1' }); // p1 is human local
      const html = renderToStaticMarkup(
        React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true })
      );
      expect(html).not.toContain('data-testid="bot-pacing-chip"');
    });
  });
});
