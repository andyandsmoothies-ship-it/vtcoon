// [IMP-214] Minh Bạch Hóa Kết Quả Thâu Tóm M&A & Cải Thiện Affordance Thẻ Sự Kiện
// Universal 4-Facet Behavioral Matrix Contract Test Suite (16 Atomic Tests)
// Traceability: docs/requirements.md | implementation_plan.md §4

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createPlayer, createRoom, type Player, type Room } from '../../src/domain/room';
import { ChanceCardId } from '../../src/domain/event_card_types';
import { drawChanceCard } from '../../src/domain/event_card_engine';
import { type PropertyRegistry, type PropertyStateMap } from '../../src/domain/property_manager';
import {
  getCardCtaButtonText,
  getCardHeroStat,
  isFinancialDestination,
} from '../../src/client/ui/modals/event_card_visuals';
import { EventCardModal } from '../../src/client/ui/modals/event_card_modal';

/**
 * Helper tìm kiếm ReactElement con theo thuộc tính/predicate để kiểm tra handler ở điểm tiêu thụ
 */
function findElementByProp(node: any, predicate: (props: any) => boolean): any {
  if (!node || typeof node !== 'object') return null;
  if (node.props && predicate(node.props)) return node;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findElementByProp(child, predicate);
      if (found) return found;
    }
  }
  if (node.props && node.props.children) {
    return findElementByProp(node.props.children, predicate);
  }
  return null;
}

function createTestPlayer(id: string, name: string): Player {
  const p = createPlayer(id);
  p.name = name;
  return p;
}

describe('[IMP-214] Minh Bạch Hóa Thâu Tóm M&A & Affordance Thẻ Sự Kiện', () => {
  // =========================================================================
  // FACET 1: SERVER M&A EXECUTION & PAYLOAD TRANSPARENCY (TC-214.01 - TC-214.04)
  // =========================================================================
  describe('Facet 1: Server M&A Execution & Payload Transparency', () => {
    it('[TC-214.01/MSS][UC-214] Khi rút thẻ CC_MA_FORCE và có đối thủ sở hữu ô C0, server tự động chuyển nhượng quyền sở hữu ô đất sang cho người rút thẻ', () => {
      const room: Room = createRoom('room_imp214_01');
      const p1: Player = createTestPlayer('p1', 'Thương gia Alpha');
      const p2: Player = createTestPlayer('p2', 'Đối thủ Beta');
      p1.balance = 5000;
      p2.balance = 2000;
      room.players = [p1, p2];
      room.chanceDeck = [ChanceCardId.CC_MA_FORCE];

      const registry: PropertyRegistry = new Map([[3, 'p2']]);
      const stateMap: PropertyStateMap = new Map([[3, { level: 0 }]]);

      drawChanceCard(room, p1, () => 0.5, registry, stateMap);

      expect(registry.get(3)).toBe('p1');
      expect(p2.balance).toBe(2720); // Giá gốc 600 * 1.2 = 720
    });

    it('[TC-214.02/MSS][UC-214] Khi thâu tóm thành công, lastEventCard.effectDetail chứa chính xác tên ô đất đã thâu tóm và tên đối thủ bị mua lại', () => {
      const room: Room = createRoom('room_imp214_02');
      const p1: Player = createTestPlayer('p1', 'Thương gia Alpha');
      const p2: Player = createTestPlayer('p2', 'Đối thủ Beta');
      p1.balance = 5000;
      p2.balance = 2000;
      room.players = [p1, p2];
      room.chanceDeck = [ChanceCardId.CC_MA_FORCE];

      const registry: PropertyRegistry = new Map([[3, 'p2']]);
      const stateMap: PropertyStateMap = new Map([[3, { level: 0 }]]);

      drawChanceCard(room, p1, () => 0.5, registry, stateMap);

      expect(room.lastEventCard?.effectDetail).toContain('An Giang (Châu Đốc)');
      expect(room.lastEventCard?.effectDetail).toContain('Đối thủ Beta');
    });

    it('[TC-214.03/MSS][UC-214] Khi thâu tóm thành công, lastEventCard.targetScope mang tên ô đất thâu tóm và destination ghi nhận thanh toán cho đối thủ', () => {
      const room: Room = createRoom('room_imp214_03');
      const p1: Player = createTestPlayer('p1', 'Thương gia Alpha');
      const p2: Player = createTestPlayer('p2', 'Đối thủ Beta');
      p1.balance = 5000;
      p2.balance = 2000;
      room.players = [p1, p2];
      room.chanceDeck = [ChanceCardId.CC_MA_FORCE];

      const registry: PropertyRegistry = new Map([[3, 'p2']]);
      const stateMap: PropertyStateMap = new Map([[3, { level: 0 }]]);

      drawChanceCard(room, p1, () => 0.5, registry, stateMap);

      expect(room.lastEventCard?.targetScope).toBe('An Giang (Châu Đốc)');
      expect(room.lastEventCard?.destination).toBe('Thanh toán chuyển nhượng cho Đối thủ Beta');
    });

    it('[TC-214.04/MSS][UC-214] Khi thâu tóm thành công, lastEventCard.effectDelta mang giá trị âm chính xác bằng 120% giá gốc (-Math.floor(deed.price * 1.2))', () => {
      const room: Room = createRoom('room_imp214_04');
      const p1: Player = createTestPlayer('p1', 'Thương gia Alpha');
      const p2: Player = createTestPlayer('p2', 'Đối thủ Beta');
      p1.balance = 5000;
      p2.balance = 2000;
      room.players = [p1, p2];
      room.chanceDeck = [ChanceCardId.CC_MA_FORCE];

      const registry: PropertyRegistry = new Map([[3, 'p2']]);
      const stateMap: PropertyStateMap = new Map([[3, { level: 0 }]]);

      drawChanceCard(room, p1, () => 0.5, registry, stateMap);

      expect(room.lastEventCard?.effectDelta).toBe(-720);
      expect(p1.balance).toBe(4280);
    });
  });

  // =========================================================================
  // FACET 2: TREASURY FALLBACK & SUBSIDY TRANSPARENCY (TC-214.05 - TC-214.08)
  // =========================================================================
  describe('Facet 2: Treasury Fallback & Subsidy Transparency', () => {
    it('[TC-214.05/MSS][UC-214] Khi đối thủ không có ô C0 hợp lệ, người chơi nhận 800 Tr. trợ cấp từ Kho Bạc (effectDelta = +800)', () => {
      const room: Room = createRoom('room_imp214_05');
      const p1: Player = createTestPlayer('p1', 'Thương gia Alpha');
      const p2: Player = createTestPlayer('p2', 'Đối thủ Beta');
      p1.balance = 3000;
      p2.balance = 2000;
      room.players = [p1, p2];
      room.treasury = 5000;
      room.chanceDeck = [ChanceCardId.CC_MA_FORCE];

      const registry: PropertyRegistry = new Map();
      const stateMap: PropertyStateMap = new Map();

      drawChanceCard(room, p1, () => 0.5, registry, stateMap);

      expect(room.lastEventCard?.effectDelta).toBe(800);
      expect(p1.balance).toBe(3800);
    });

    it('[TC-214.06/MSS][UC-214] Khi nhận trợ cấp, lastEventCard.effectDetail nêu rõ lý do nhận trợ cấp từ Kho Bạc (không có BĐS phù hợp hoặc không đủ tiền)', () => {
      const room: Room = createRoom('room_imp214_06');
      const p1: Player = createTestPlayer('p1', 'Thương gia Alpha');
      const p2: Player = createTestPlayer('p2', 'Đối thủ Beta');
      p1.balance = 3000;
      p2.balance = 2000;
      room.players = [p1, p2];
      room.treasury = 5000;
      room.chanceDeck = [ChanceCardId.CC_MA_FORCE];

      const registry: PropertyRegistry = new Map();
      const stateMap: PropertyStateMap = new Map();

      drawChanceCard(room, p1, () => 0.5, registry, stateMap);

      expect(room.lastEventCard?.effectDetail).toContain('trợ cấp M&A từ Kho Bạc');
      expect(room.lastEventCard?.effectDetail).toMatch(/không có BĐS.*phù hợp|không đủ ngân sách/i);
    });

    it('[TC-214.07/MSS][UC-214] Khi nhận trợ cấp, destination ghi rõ Kho Bạc hỗ trợ vào Ngân sách người chơi và targetScope là Kho Bạc Nhà Nước', () => {
      const room: Room = createRoom('room_imp214_07');
      const p1: Player = createTestPlayer('p1', 'Thương gia Alpha');
      const p2: Player = createTestPlayer('p2', 'Đối thủ Beta');
      p1.balance = 3000;
      p2.balance = 2000;
      room.players = [p1, p2];
      room.treasury = 5000;
      room.chanceDeck = [ChanceCardId.CC_MA_FORCE];

      const registry: PropertyRegistry = new Map();
      const stateMap: PropertyStateMap = new Map();

      drawChanceCard(room, p1, () => 0.5, registry, stateMap);

      expect(room.lastEventCard?.destination).toBe('Kho Bạc hỗ trợ vào Ngân sách người chơi');
      expect(room.lastEventCard?.targetScope).toBe('Kho Bạc Nhà Nước');
    });

    it('[TC-214.08/MSS][UC-214] Quá trình nhận trợ cấp bảo toàn nguyên lý Treasury Conservation (Kho Bạc giảm đúng 800)', () => {
      const room: Room = createRoom('room_imp214_08');
      const p1: Player = createTestPlayer('p1', 'Thương gia Alpha');
      const p2: Player = createTestPlayer('p2', 'Đối thủ Beta');
      p1.balance = 2500;
      p2.balance = 2000;
      room.players = [p1, p2];
      room.treasury = 4000;
      room.chanceDeck = [ChanceCardId.CC_MA_FORCE];

      const registry: PropertyRegistry = new Map();
      const stateMap: PropertyStateMap = new Map();

      drawChanceCard(room, p1, () => 0.5, registry, stateMap);

      expect(room.treasury).toBe(3200);
      expect(p1.balance).toBe(3300);
    });
  });

  // =========================================================================
  // FACET 3: CLIENT CTA AFFORDANCE & ANTI-CONFUSION (TC-214.09 - TC-214.12)
  // =========================================================================
  describe('Facet 3: Client CTA Affordance & Anti-Confusion', () => {
    it('[TC-214.09/MSS][UC-214] Khi CC_MA_FORCE có effectDelta < 0, nút CTA mang nhãn rõ ràng ĐÃ THÂU TÓM BĐS • ĐÓNG (khẳng định không còn chứa KÝ HỢP ĐỒNG)', () => {
      const ctaText = (getCardCtaButtonText as (id?: string, delta?: number) => string)(ChanceCardId.CC_MA_FORCE, -720);
      expect(ctaText.toUpperCase()).toContain('ĐÃ THÂU TÓM BĐS • ĐÓNG');
      expect(ctaText.toUpperCase()).not.toContain('KÝ HỢP ĐỒNG');

      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'chance',
          cardId: ChanceCardId.CC_MA_FORCE,
          effectDelta: -720,
        })
      );
      expect(html.toUpperCase()).toContain('ĐÃ THÂU TÓM BĐS • ĐÓNG');
    });

    it('[TC-214.10/MSS][UC-214] Khi CC_MA_FORCE có effectDelta > 0, nút CTA mang nhãn NHẬN TRỢ CẤP M&A • ĐÓNG', () => {
      const ctaText = (getCardCtaButtonText as (id?: string, delta?: number) => string)(ChanceCardId.CC_MA_FORCE, 800);
      expect(ctaText.toUpperCase()).toContain('NHẬN TRỢ CẤP M&A • ĐÓNG');

      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'chance',
          cardId: ChanceCardId.CC_MA_FORCE,
          effectDelta: 800,
        })
      );
      expect(html.toUpperCase()).toContain('NHẬN TRỢ CẤP M&A • ĐÓNG');
    });

    it('[TC-214.11/MSS][UC-214] Bấm nút CTA trong EventCardModal đóng modal an toàn thông qua callback onConfirm hoặc onClose', () => {
      const onConfirm = vi.fn();
      let vdomWithConfirm: any;
      renderToStaticMarkup(
        React.createElement(() => {
          vdomWithConfirm = EventCardModal({
            cardType: 'chance',
            cardId: ChanceCardId.CC_MA_FORCE,
            effectDelta: -720,
            onConfirm,
          });
          return null;
        })
      );
      const ctaBtn1 = findElementByProp(vdomWithConfirm, (p: any) => p['data-testid'] === 'event-card-confirm-btn');
      ctaBtn1.props.onClick();
      expect(onConfirm).toHaveBeenCalledTimes(1);

      const onClose = vi.fn();
      let vdomWithClose: any;
      renderToStaticMarkup(
        React.createElement(() => {
          vdomWithClose = EventCardModal({
            cardType: 'chance',
            cardId: ChanceCardId.CC_MA_FORCE,
            effectDelta: -720,
            onClose,
          });
          return null;
        })
      );
      const ctaBtn2 = findElementByProp(vdomWithClose, (p: any) => p['data-testid'] === 'event-card-confirm-btn');
      ctaBtn2.props.onClick();
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('[TC-214.12/MSS][UC-214] Thẻ Hero Stat Box hiển thị nhãn THÂU TÓM BĐS với số tiền âm khi mua đất thành công', () => {
      const heroStat = getCardHeroStat(ChanceCardId.CC_MA_FORCE, -720);
      expect(heroStat.label).toBe('THÂU TÓM BĐS');
      expect(heroStat.value).toContain('-720');
    });
  });

  // =========================================================================
  // FACET 4: MOBILE ERGONOMICS & FINANCIAL DESTINATION PILL (TC-214.13 - TC-214.16)
  // =========================================================================
  describe('Facet 4: Mobile Ergonomics & Financial Destination Pill', () => {
    it('[TC-214.13/MSS][UC-214] Khối tóm tắt tác động trên Mobile (event-impact-summary) hiển thị đầy đủ tên ô đất thâu tóm mà không bị vỡ layout', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'chance',
          cardId: ChanceCardId.CC_MA_FORCE,
          targetScope: 'An Giang (Châu Đốc)',
          destination: 'Thanh toán chuyển nhượng cho Đối thủ Beta',
          effectDetail: 'Đã thâu tóm thành công [An Giang (Châu Đốc)] từ Đối thủ Beta với giá 120% (720).',
          effectDelta: -720,
        })
      );
      expect(html).toContain('data-testid="event-impact-summary"');
      expect(html).toContain('An Giang (Châu Đốc)');
      expect(html).toContain('Thanh toán chuyển nhượng cho Đối thủ Beta');
    });

    it('[TC-214.14/MSS][UC-214] Hàm isFinancialDestination trả về true cho chuỗi chứa chuyển nhượng hoặc thanh toán, đảm bảo pill xuất hiện trên desktop', () => {
      expect(isFinancialDestination('Thanh toán chuyển nhượng cho Đối thủ Beta')).toBe(true);
      expect(isFinancialDestination('Chuyển nhượng quyền sở hữu ô đất')).toBe(true);
    });

    it('[TC-214.15/MSS][UC-214] Sau khi drawChanceCard hoàn tất, room.lastMaBuyout được giải phóng sạch sẽ (Take-and-Clear Pattern, Zero Stale Leak)', () => {
      const room: Room = createRoom('room_imp214_15');
      const p1: Player = createTestPlayer('p1', 'Thương gia Alpha');
      const p2: Player = createTestPlayer('p2', 'Đối thủ Beta');
      p1.balance = 5000;
      p2.balance = 2000;
      room.players = [p1, p2];
      room.chanceDeck = [ChanceCardId.CC_MA_FORCE];

      const registry: PropertyRegistry = new Map([[3, 'p2']]);
      const stateMap: PropertyStateMap = new Map([[3, { level: 0 }]]);

      drawChanceCard(room, p1, () => 0.5, registry, stateMap);

      expect(room.lastEventCard?.effectDetail).toContain('An Giang (Châu Đốc)');
      expect(room.lastMaBuyout).toBeUndefined();
    });

    it('[TC-214.16/MSS][UC-214] Nút CTA trong EventCardModal đạt chuẩn touch target tối thiểu >= 44px (min-h-[46px])', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'chance',
          cardId: ChanceCardId.CC_MA_FORCE,
          effectDelta: -720,
        })
      );
      expect(html).toContain('data-testid="event-card-confirm-btn"');
      expect(html).toMatch(/data-testid="event-card-confirm-btn"[^>]*min-h-\[46px\]/);
    });
  });
});
