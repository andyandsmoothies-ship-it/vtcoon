// [TC-IMP154/MSS][UC-IMP154]
// Contract Test Suite for IMP-154: Đàm Phán Thông Minh Với 3 Bot AI - Smart Bot Tabs & AI Acceptance Sentiment Meter
// Enforces Universal 4-Facet Behavioral Matrix & Atomic Test Mandate (1-4 asserts/test, zero loops in it(), no static checklist tests)

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as TradeModalExports from '../../src/client/ui/modals/trade_modal';
import * as ModalHelperExports from '../../src/client/ui/modals/modal_helpers';
import * as BotTradeExports from '../../src/domain/bot/bot_trade';

const TradeModal = TradeModalExports.TradeModal;

const getResolveBotPersonality = () =>
  (TradeModalExports as any).resolveBotPersonality ??
  (ModalHelperExports as any).resolveBotPersonality ??
  (BotTradeExports as any).resolveBotPersonality;

const getGetBotNeedBadge = () =>
  (TradeModalExports as any).getBotNeedBadge ??
  (ModalHelperExports as any).getBotNeedBadge ??
  (BotTradeExports as any).getBotNeedBadge;

const getEvaluateBotTradeSentiment = () =>
  (TradeModalExports as any).evaluateBotTradeSentiment ??
  (ModalHelperExports as any).evaluateBotTradeSentiment ??
  (BotTradeExports as any).evaluateBotTradeSentiment;

const getGetPropertySynergyTag = () =>
  (TradeModalExports as any).getPropertySynergyTag ??
  (ModalHelperExports as any).getPropertySynergyTag ??
  (BotTradeExports as any).getPropertySynergyTag;

describe('[IMP-154][Trạm 1 RED] Smart Bot Tabs & AI Acceptance Sentiment Meter', () => {
  // =========================================================================
  // FACET 1: Boundary & Range
  // =========================================================================
  describe('Facet 1: Boundary & Range', () => {
    it('[TC-154.01a/MSS][UC-IMP154][Facet-1/Boundary] resolveBotPersonality nhận đúng tính cách Aggressive từ prop partner.personality', () => {
      const fn = getResolveBotPersonality();
      const personality = fn?.({ id: 'bot_1', name: 'Bot 1', balance: 5000, personality: 'Aggressive' });
      expect(personality, '[RED GATE] resolveBotPersonality phải trả về Aggressive khi partner.personality là Aggressive').toBe('Aggressive');
    });

    it('[TC-154.01b/MSS][UC-IMP154][Facet-1/Boundary] resolveBotPersonality nhận đúng tính cách Balanced từ prop partner.personality', () => {
      const fn = getResolveBotPersonality();
      const personality = fn?.({ id: 'bot_2', name: 'Bot 2', balance: 5000, personality: 'Balanced' });
      expect(personality, '[RED GATE] resolveBotPersonality phải trả về Balanced khi partner.personality là Balanced').toBe('Balanced');
    });

    it('[TC-154.01c/MSS][UC-IMP154][Facet-1/Boundary] resolveBotPersonality nhận đúng tính cách Passive từ prop partner.personality', () => {
      const fn = getResolveBotPersonality();
      const personality = fn?.({ id: 'bot_3', name: 'Bot 3', balance: 5000, personality: 'Passive' });
      expect(personality, '[RED GATE] resolveBotPersonality phải trả về Passive khi partner.personality là Passive').toBe('Passive');
    });

    it('[TC-154.02a/MSS][UC-IMP154][Facet-1/Boundary] resolveBotPersonality fallback chuẩn theo tên đối tác chứa chuỗi tính cách', () => {
      const fn = getResolveBotPersonality();
      const pAggressive = fn?.({ id: 'bot_shark', name: 'Cá Mập (Aggressive)', balance: 5000 });
      const pPassive = fn?.({ id: 'bot_turtle', name: 'Rùa Vàng (Passive)', balance: 5000 });
      expect(pAggressive, '[RED GATE] Phải nhận diện Aggressive khi tên chứa (Aggressive)').toBe('Aggressive');
      expect(pPassive, '[RED GATE] Phải nhận diện Passive khi tên chứa (Passive)').toBe('Passive');
    });

    it('[TC-154.02b/MSS][UC-IMP154][Facet-1/Boundary] resolveBotPersonality fallback deterministic theo ID đối tác khi không có prop hay chuỗi tên', () => {
      const fn = getResolveBotPersonality();
      const p1 = fn?.({ id: 'bot_1', name: 'Bot AI 1', balance: 5000 });
      const p2 = fn?.({ id: 'bot_2', name: 'Bot AI 2', balance: 5000 });
      const p3 = fn?.({ id: 'bot_3', name: 'Bot AI 3', balance: 5000 });
      expect(p1, '[RED GATE] bot_1 phải được ánh xạ deterministically sang Aggressive').toBe('Aggressive');
      expect(p2, '[RED GATE] bot_2 phải được ánh xạ deterministically sang Balanced').toBe('Balanced');
      expect(p3, '[RED GATE] bot_3 phải được ánh xạ deterministically sang Passive').toBe('Passive');
    });

    it('[TC-154.03/MSS][UC-IMP154][Facet-1/Boundary] getBotNeedBadge nhận diện chính xác khi Bot sở hữu N-1 ô đất trong một phân khu', () => {
      const fn = getGetBotNeedBadge();
      // Nhóm Cần Thơ (Nau) gồm 2 ô: 1 (Cái Răng) và 3 (Châu Đốc). Bot sở hữu ô 1 -> N-1 ô
      const badge = fn?.({ id: 'bot_1', name: 'Bot AI 1', balance: 4000, properties: [1] }, [1]);
      expect(badge, '[RED GATE] getBotNeedBadge phải trả về chuỗi chứa biểu tượng ⚡ hoặc tên phân khu Cần Thơ').toMatch(/⚡|Cần Thơ|Tây Nam/i);
    });

    it('[TC-154.04a/MSS][UC-IMP154][Facet-1/Boundary] getBotNeedBadge phát hiện Bot dưới 1.500 Tr. là kẹt tiền và trả về biểu tượng 🧊', () => {
      const fn = getGetBotNeedBadge();
      const badge = fn?.({ id: 'bot_poor', name: 'Bot Thiếu Tiền', balance: 1200, properties: [] }, []);
      expect(badge, '[RED GATE] Bot dưới 1.500 Tr. phải hiển thị badge chứa biểu tượng 🧊').toContain('🧊');
    });

    it('[TC-154.04b/MSS][UC-IMP154][Facet-1/Boundary] getBotNeedBadge phát hiện Bot trên 8.000 Tr. là dư dả và trả về biểu tượng 💰', () => {
      const fn = getGetBotNeedBadge();
      const badge = fn?.({ id: 'bot_rich', name: 'Bot Đại Gia', balance: 9500, properties: [] }, []);
      expect(badge, '[RED GATE] Bot trên 8.000 Tr. phải hiển thị badge chứa biểu tượng 💰').toContain('💰');
    });
  });

  // =========================================================================
  // FACET 2: Actor Inversion & Sentiment State Reactivity
  // =========================================================================
  describe('Facet 2: Actor Inversion & Sentiment State Reactivity', () => {
    it('[TC-154.05/MSS][UC-IMP154][Facet-2/Reactivity] evaluateBotTradeSentiment (BUY): Người chơi trả giá hời (>= 1.4x giá gốc) mua đất lẻ từ Bot ➔ likely_accept và score >= 80', () => {
      const fn = getEvaluateBotTradeSentiment();
      // Ô 6 (Bình Dương, giá gốc 1.000 Tr.). Người chơi trả 1.500 Tr. (1.5x >= 1.4x), mua đất lẻ
      const result = fn?.({
        offeredProperties: [],
        requestedProperties: [6],
        cashOffer: 1500,
        cashRequest: 0,
        botBalance: 5000,
        botProperties: [6],
        myProperties: [],
        botPersonality: 'Balanced',
      });
      expect(result?.status, '[RED GATE] Trả giá hời >= 1.4x mua đất lẻ phải có status là likely_accept').toBe('likely_accept');
      expect(result?.score, '[RED GATE] Điểm đồng thuận khi trả giá hời phải >= 80').toBeGreaterThanOrEqual(80);
    });

    it('[TC-154.06/MSS][UC-IMP154][Facet-2/Reactivity] evaluateBotTradeSentiment (BUY): Người chơi mua ô hoàn thành độc quyền nhưng trả giá gốc 1.0x ➔ likely_reject với reasonCode PREVENT_MONOPOLY', () => {
      const fn = getEvaluateBotTradeSentiment();
      // Người chơi sở hữu ô 1, muốn mua nốt ô 3 để độc quyền Cần Thơ nhưng chỉ trả giá gốc 1.000 Tr. (1.0x)
      const result = fn?.({
        offeredProperties: [],
        requestedProperties: [3],
        cashOffer: 1000,
        cashRequest: 0,
        botBalance: 5000,
        botProperties: [3],
        myProperties: [1],
        botPersonality: 'Balanced',
      });
      expect(result?.status, '[RED GATE] Mua đất hoàn tất độc quyền với giá gốc phải bị likely_reject').toBe('likely_reject');
      expect(result?.reasonCode, '[RED GATE] Lý do từ chối phải là PREVENT_MONOPOLY').toBe('PREVENT_MONOPOLY');
    });

    it('[TC-154.07/MSS][UC-IMP154][Facet-2/Reactivity] evaluateBotTradeSentiment (SELL): Người chơi gạ bán ô đất hoàn thiện độc quyền cho Bot với giá hợp lý ➔ likely_accept và score >= 70', () => {
      const fn = getEvaluateBotTradeSentiment();
      // Bot sở hữu ô 1 (Cái Răng). Người chơi bán ô 3 (Châu Đốc, giá gốc 1.000 Tr.) cho Bot với giá 1.100 Tr. (hợp lý <= 1.3x)
      const result = fn?.({
        offeredProperties: [3],
        requestedProperties: [],
        cashOffer: 0,
        cashRequest: 1100,
        botBalance: 5000,
        botProperties: [1],
        myProperties: [3],
        botPersonality: 'Balanced',
      });
      expect(result?.status, '[RED GATE] Bán đất hoàn tất độc quyền giá hợp lý cho Bot phải likely_accept').toBe('likely_accept');
      expect(result?.score, '[RED GATE] Điểm đồng thuận khi bán độc quyền giá hợp lý phải >= 70').toBeGreaterThanOrEqual(70);
    });

    it('[TC-154.08/MSS][UC-IMP154][Facet-2/Reactivity] evaluateBotTradeSentiment (SELL): Yêu cầu tiền mặt vượt quá ngân sách an toàn của Bot ➔ likely_reject với reasonCode INSUFFICIENT_CASH', () => {
      const fn = getEvaluateBotTradeSentiment();
      // Bot có 2.000 Tr., safetyBuffer là 1.000 Tr. Người chơi yêu cầu 1.500 Tr. -> số dư còn lại 500 < 1.000 Tr.
      const result = fn?.({
        offeredProperties: [3],
        requestedProperties: [],
        cashOffer: 0,
        cashRequest: 1500,
        botBalance: 2000,
        botProperties: [1],
        myProperties: [3],
        safetyBuffer: 1000,
        botPersonality: 'Balanced',
      });
      expect(result?.status, '[RED GATE] Đòi tiền mặt xâm phạm ngân sách an toàn của Bot phải likely_reject').toBe('likely_reject');
      expect(result?.reasonCode, '[RED GATE] Lý do từ chối phải là INSUFFICIENT_CASH').toBe('INSUFFICIENT_CASH');
    });

    it('[TC-154.09/MSS][UC-IMP154][Facet-2/Reactivity] evaluateBotTradeSentiment (SWAP): Đổi 2 ô đất ngang giá trị khác bộ màu ➔ status là likely_accept hoặc borderline', () => {
      const fn = getEvaluateBotTradeSentiment();
      // Đổi ô 11 (Bình Thuận, giá gốc 1.400 Tr.) lấy ô 16 (Bình Định, giá gốc 1.400 Tr.), tiền bù 0
      const result = fn?.({
        offeredProperties: [11],
        requestedProperties: [16],
        cashOffer: 0,
        cashRequest: 0,
        botBalance: 5000,
        botProperties: [16],
        myProperties: [11],
        botPersonality: 'Balanced',
      });
      expect(['likely_accept', 'borderline'], '[RED GATE] Đổi 2 ô đất ngang giá trị phải là likely_accept hoặc borderline').toContain(result?.status);
    });

    it('[TC-154.09b/MSS][UC-IMP154][Facet-2/Reactivity] evaluateBotTradeSentiment (SWAP): Từ chối nếu đổi đất giúp người chơi độc quyền mà Bot không được độc quyền ➔ PREVENT_MONOPOLY', () => {
      const fn = getEvaluateBotTradeSentiment();
      // Người chơi có ô 1, yêu cầu ô 3 từ Bot (giúp người chơi hoàn tất độc quyền nhóm Cần Thơ)
      // Người chơi nhượng lại ô 6 (không giúp Bot độc quyền vì Bot chỉ có ô 3 và 16)
      const result = fn?.({
        offeredProperties: [6],
        requestedProperties: [3],
        cashOffer: 0,
        cashRequest: 0,
        botBalance: 5000,
        botProperties: [3, 16],
        myProperties: [1, 6],
        botPersonality: 'Balanced',
      });
      expect(result?.status, '[RED GATE] Đổi đất giúp người chơi độc quyền mà Bot không được phải bị likely_reject').toBe('likely_reject');
      expect(result?.reasonCode, '[RED GATE] Lý do từ chối phải là PREVENT_MONOPOLY').toBe('PREVENT_MONOPOLY');
    });

    it('[TC-154.10/MSS][UC-IMP154][Facet-2/Reactivity] evaluateBotTradeSentiment: Khi ở trạng thái borderline, trả về điểm số từ 40-79 và message có hướng dẫn điều chỉnh tiền mặt', () => {
      const fn = getEvaluateBotTradeSentiment();
      // Người chơi trả 1.100 Tr. mua ô 6 (giá gốc 1.000 Tr.) từ Bot -> chênh lệch thấp, thương vụ cân não borderline
      const result = fn?.({
        offeredProperties: [],
        requestedProperties: [6],
        cashOffer: 1100,
        cashRequest: 0,
        botBalance: 5000,
        botProperties: [6],
        myProperties: [],
        botPersonality: 'Balanced',
      });
      expect(result?.score, '[RED GATE] Điểm đồng thuận borderline phải nằm trong khoảng [40, 79]').toBeGreaterThanOrEqual(40);
      expect(result?.score).toBeLessThanOrEqual(79);
      expect(result?.message ?? (result as any)?.hint, '[RED GATE] Borderline phải có lời nhắn hướng dẫn thêm/bù tiền mặt').toMatch(/tiền|thêm|bù|bớt/i);
    });
  });

  // =========================================================================
  // FACET 3: Synergy Tagging & Ergonomics
  // =========================================================================
  describe('Facet 3: Synergy Tagging & Ergonomics', () => {
    it('[TC-154.11/MSS][UC-IMP154][Facet-3/Synergy] getPropertySynergyTag gắn nhãn ⚡ Mảnh Ghép Cuối cho ô đất hoàn thiện nhóm màu cho bên nhận', () => {
      const fn = getGetPropertySynergyTag();
      // Cần Thơ có 2 ô: 1 và 3. Bên nhận sở hữu ô 1. Ô 3 chính là mảnh ghép cuối
      const tagSynergy = fn?.(3, [1]);
      const tagNormal = fn?.(3, []);
      expect(tagSynergy, '[RED GATE] Ô đất hoàn tất bộ màu phải có tag ⚡ Mảnh Ghép Cuối').toContain('⚡ Mảnh Ghép Cuối');
      expect(tagNormal, '[RED GATE] Ô đất không hoàn tất bộ màu không được có tag').toBeFalsy();
    });

    it('[TC-154.12/MSS][UC-IMP154][Facet-3/Synergy] Thẻ BĐS trong TradeModal hiển thị tag ⚡ Mảnh Ghép Cuối khi thỏa mãn điều kiện hoàn tất bộ màu', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'bot_2',
          myProperties: [1],
          targetProperties: [3],
          myBalance: 5000,
        })
      );
      expect(html, '[RED GATE] Thẻ BĐS trong TradeModal phải hiển thị nhãn ⚡ Mảnh Ghép Cuối').toContain('⚡ Mảnh Ghép Cuối');
    });

    it('[TC-154.13/MSS][UC-IMP154][Facet-3/Synergy] Dải tab đối tác hiển thị icon tính cách (🔥, ⚖️, 🛡️) và badge nhu cầu của Bot', () => {
      const mockPartners = [
        { id: 'bot_1', name: 'Bot 1', balance: 1200, personality: 'Aggressive', isBot: true },
        { id: 'bot_2', name: 'Bot 2', balance: 5000, personality: 'Balanced', isBot: true },
        { id: 'bot_3', name: 'Bot 3', balance: 9000, personality: 'Passive', isBot: true },
      ];
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'bot_1',
          myProperties: [1],
          targetProperties: [3],
          myBalance: 5000,
          availablePartners: mockPartners,
        })
      );
      expect(html, '[RED GATE] Tab Bot Aggressive phải có icon 🔥').toContain('🔥');
      expect(html, '[RED GATE] Tab Bot Balanced phải có icon ⚖️').toContain('⚖️');
      expect(html, '[RED GATE] Tab Bot Passive phải có icon 🛡️').toContain('🛡️');
      expect(html, '[RED GATE] Tab Bot dưới 1.500 Tr. phải hiển thị badge kẹt tiền 🧊').toContain('🧊');
    });

    it('[TC-154.17/MSS][UC-IMP154][Facet-3/Synergy] TradeModal hiển thị đồng hồ tâm lý đồng thuận AI với thanh đo trực quan', () => {
      const mockPartners = [
        { id: 'bot_2', name: 'Bot 2', balance: 5000, personality: 'Balanced', isBot: true },
      ];
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'bot_2',
          myProperties: [1],
          targetProperties: [6],
          myBalance: 5000,
          availablePartners: mockPartners,
          initialOffered: [1],
          initialRequested: [6],
        })
      );
      expect(html, '[RED GATE] Phải có data-testid="bot-sentiment-meter" cho đồng hồ tâm lý Bot').toContain('data-testid="bot-sentiment-meter"');
      expect(html, '[RED GATE] Phải có nhãn mô tả khả năng đồng thuận của Bot').toMatch(/Đồng Thuận|Tâm Lý|Khả Năng Chấp Thuận/i);
    });
  });

  // =========================================================================
  // FACET 4: Contract Integrity & LOC Defense
  // =========================================================================
  describe('Facet 4: Contract Integrity & LOC Defense', () => {
    it('[TC-154.14/MSS][UC-IMP154][Facet-4/Integrity] Tab đối tác bảo tồn 100% class .partner-selector-tab và min-h-[44px]', () => {
      const mockPartners = [
        { id: 'bot_2', name: 'Bot 2', balance: 5000, personality: 'Balanced', isBot: true },
      ];
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'bot_2',
          myProperties: [1],
          targetProperties: [6],
          myBalance: 5000,
          availablePartners: mockPartners,
        })
      );
      expect(html, '[INTEGRITY] Bảo tồn class partner-selector-tab').toContain('partner-selector-tab');
      expect(html, '[INTEGRITY] Bảo tồn chuẩn touch target min-h-[44px]').toContain('min-h-[44px]');
    });

    it('[TC-154.15/MSS][UC-IMP154][Facet-4/Integrity] Tab đối tác bảo tồn thẻ truncate max-w-[120px] chứa tên đối tác và chuỗi tiền tệ formatCurrency', () => {
      const mockPartners = [
        { id: 'bot_2', name: 'Bot AI Trọng Tài', balance: 5000, personality: 'Balanced', isBot: true },
      ];
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'bot_2',
          myProperties: [1],
          targetProperties: [6],
          myBalance: 5000,
          availablePartners: mockPartners,
        })
      );
      expect(html, '[INTEGRITY] Bảo tồn thẻ truncate max-w-[120px]').toContain('truncate max-w-[120px]');
      expect(html, '[INTEGRITY] Bảo tồn tên đối tác').toContain('Bot AI Trọng Tài');
      expect(html, '[INTEGRITY] Bảo tồn định dạng tiền tệ').toContain('5.000 Tr.');
    });

    it('[TC-154.16/MSS][UC-IMP154][Facet-4/Integrity] Danh sách BĐS trong TradeModal áp dụng class max-h-36 sm:max-h-52 md:max-h-72 để triệt tiêu bẫy cuộn lồng nhau trên mobile', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'bot_2',
          myProperties: [1],
          targetProperties: [6],
          myBalance: 5000,
        })
      );
      expect(html, '[RED GATE] Danh sách BĐS phải có max-h-36 trên mobile').toContain('max-h-36');
      expect(html, '[RED GATE] Danh sách BĐS phải có sm:max-h-52 trên tablet').toContain('sm:max-h-52');
      expect(html, '[RED GATE] Danh sách BĐS phải có md:max-h-72 trên desktop').toContain('md:max-h-72');
    });
  });
});
