// [TC-194.01/MSS..TC-194.18/MSS][UC-IMP194] Natural Narrative Floating Badges Contract Suite
// Universal 5-Facet Behavioral Matrix:
// Facet 1: Boundary & Range (Interface Contracts, Amount Parsing & Sentence Bounds)
// Facet 2: State Reactivity & Bilateral Symmetries (P2P Rent & M&A Buyout Anti-Inversion)
// Facet 3: Resource Disposal & Regulatory/Treasury Flows (Auction, Tax, Bail & Audit Jail)
// Facet 4: Error Defense, Terminal Invariants & Banking Operations (Mortgage, Unmortgage, Buy, Upgrade, Salary, HOSE)
// Facet 5: Cross-Coupling Blast Radius, UI Markup & Codebase Hygiene (FloatingBadge Rendering, Pill Titles, LOC Budgets)

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  FloatingBadge,
  resolveFriendlyReason,
} from '../../src/client/ui/floating_numbers';
import {
  useGameStore,
  FloatingTextType,
  type FloatingTextItem,
  type PlayerHudInfo,
} from '../../src/client/store/game_store';

// ============================================================================
// DYNAMIC IMPORT HARNESS (Station 1 RED Contract Gate)
// Dynamically resolves Station 2 transaction_narrative module to assert clean Business RED
// ============================================================================
const NARRATIVE_MODULE_PATH = '../../src/client/ui/transaction_narrative';

let narrativeMod: any = null;
try {
  narrativeMod = await import(/* @vite-ignore */ NARRATIVE_MODULE_PATH);
} catch {
  try {
    narrativeMod = await import(/* @vite-ignore */ `${NARRATIVE_MODULE_PATH}.js`);
  } catch {
    narrativeMod = null;
  }
}

export interface TransactionNarrative {
  readonly category: string;
  readonly icon: string;
  readonly subject: string;
  readonly verb: string;
  readonly amountText: string;
  readonly isPositive: boolean;
  readonly target: string;
  readonly detail?: string;
}

export const resolveTransactionNarrative: (
  item: FloatingTextItem,
  player?: PlayerHudInfo,
  playersInfo?: Record<string, PlayerHudInfo>,
  myPlayerId?: string
) => TransactionNarrative =
  narrativeMod?.resolveTransactionNarrative ??
  (() => {
    throw new TypeError(
      'resolveTransactionNarrative is not implemented (Station 1 RED: src/client/ui/transaction_narrative.ts pending)'
    );
  });

export const extractCleanAmount: (
  rawText: string
) => { amountText: string; isTextual: boolean } | string =
  narrativeMod?.extractCleanAmount ??
  (() => {
    throw new TypeError(
      'extractCleanAmount is not implemented (Station 1 RED: src/client/ui/transaction_narrative.ts pending)'
    );
  });

// ============================================================================
// REALISTIC MOCK DATA FIXTURES
// ============================================================================
const mockPlayerPayer: PlayerHudInfo = {
  id: 'player-1',
  name: 'Đại Gia Sài Gòn',
  balance: 5000,
  tokenColor: '#3B82F6',
  ownedProperties: [3],
  isBankrupt: false,
};

const mockPlayerReceiver: PlayerHudInfo = {
  id: 'player-2',
  name: 'Tỷ Phú Hà Thành',
  balance: 8000,
  tokenColor: '#EF4444',
  ownedProperties: [],
  isBankrupt: false,
};

describe('[TC-194.01/MSS..TC-194.18/MSS][UC-IMP194] Natural Narrative Floating Badges Contract Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      floatingTexts: [],
      activeModal: null,
      activeModifiers: [],
      playersInfo: {
        'player-1': mockPlayerPayer,
        'player-2': mockPlayerReceiver,
      },
    });
  });

  // ===========================================================================
  // FACET 1: Boundary & Range (Interface Contracts, Amount Parsing & Sentence Bounds)
  // ===========================================================================
  describe('Facet 1: Boundary & Range (Interface Contracts, Amount Parsing & Sentence Bounds)', () => {
    it('[TC-194.01/MSS][UC-IMP194] Interface TransactionNarrative: transaction_narrative.ts export hàm resolveTransactionNarrative và extractCleanAmount', () => {
      expect(typeof narrativeMod?.resolveTransactionNarrative).toBe('function');
      expect(typeof narrativeMod?.extractCleanAmount).toBe('function');
    });

    it('[TC-194.15/MSS][UC-IMP194] Fallback an toàn & Trích xuất số tiền: extractCleanAmount bóc tách an toàn và chuỗi text lạ không crash', () => {
      const cleanResult = extractCleanAmount('+1.000 Tr.');
      const cleanAmount = typeof cleanResult === 'string' ? cleanResult : cleanResult.amountText;
      expect(cleanAmount).toBe('1.000 Tr.');

      const weirdItem: FloatingTextItem = {
        id: 'badge-fallback-weird',
        text: 'Thị trường đóng băng: Tạm hoãn giao dịch',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        timestamp: Date.now(),
      };
      const fallbackNarrative = resolveTransactionNarrative(weirdItem, mockPlayerPayer);
      expect(fallbackNarrative.verb.length).toBeGreaterThan(0);
      expect(fallbackNarrative.target.length).toBeGreaterThan(0);
    });

    it('[TC-194.16/MSS][UC-IMP194] Giới hạn độ dài: Câu văn ghép đầy đủ từ resolveTransactionNarrative có độ dài <= 95 ký tự', () => {
      const item: FloatingTextItem = {
        id: 'badge-len-test',
        text: '-650 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'auction_win',
        cellIndex: 3,
        title: 'Thắng đấu giá Cần Thơ ➔ Nộp Kho Bạc',
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerPayer);
      const fullSentence = `${narrative.subject} ${narrative.verb} ${item.text} ${narrative.target}${narrative.detail ? ` ${narrative.detail}` : ''}`;
      expect(fullSentence.length).toBeLessThanOrEqual(95);
      expect(fullSentence.length).toBeGreaterThan(20);
    });
  });

  // ===========================================================================
  // FACET 2: State Reactivity & Bilateral Symmetries (P2P Rent & M&A Buyout)
  // ===========================================================================
  describe('Facet 2: State Reactivity & Bilateral Symmetries (P2P Rent & M&A Buyout)', () => {
    it('[TC-194.02/MSS][UC-IMP194] P2P Rent Pay: resolveTransactionNarrative actionType rent_pay sinh verb "trả", target chứa partner và detail chứa tiền thuê', () => {
      const item: FloatingTextItem = {
        id: 'badge-rent-pay-1',
        text: '-350 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'rent_pay',
        cellIndex: 3,
        targetPlayerName: 'Tỷ Phú Hà Thành',
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerPayer, {
        'player-1': mockPlayerPayer,
        'player-2': mockPlayerReceiver,
      });
      expect(narrative.verb).toBe('trả');
      expect(narrative.target).toContain('cho Tỷ Phú Hà Thành');
      expect(narrative.detail).toContain('Tiền thuê');
      expect(narrative.isPositive).toBe(false);
    });

    it('[TC-194.03/MSS][UC-IMP194] P2P Rent Receive: resolveTransactionNarrative actionType rent_receive sinh verb "thu", target chứa partner và detail chứa tiền thuê', () => {
      const item: FloatingTextItem = {
        id: 'badge-rent-receive-1',
        text: '+350 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'player-2',
        actionType: 'rent_receive',
        cellIndex: 3,
        targetPlayerName: 'Đại Gia Sài Gòn',
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerReceiver, {
        'player-1': mockPlayerPayer,
        'player-2': mockPlayerReceiver,
      });
      expect(narrative.verb).toBe('thu');
      expect(narrative.target).toContain('từ Đại Gia Sài Gòn');
      expect(narrative.detail).toContain('Tiền thuê');
      expect(narrative.isPositive).toBe(true);
    });

    it('[TC-194.13/MSS][UC-IMP194] M&A Buyout Anti-Inversion: Phân định rõ bên mua chi thâu tóm và bên bán nhận bồi hoàn', () => {
      const buyerItem: FloatingTextItem = {
        id: 'badge-ma-buyer',
        text: '-1.500 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'ma_buyout',
        cellIndex: 3,
        targetPlayerName: 'Tỷ Phú Hà Thành',
        timestamp: Date.now(),
      };
      const sellerItem: FloatingTextItem = {
        id: 'badge-ma-seller',
        text: '+1.500 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'player-2',
        actionType: 'ma_buyout',
        cellIndex: 3,
        targetPlayerName: 'Đại Gia Sài Gòn',
        timestamp: Date.now(),
      };

      const buyerNarrative = resolveTransactionNarrative(buyerItem, mockPlayerPayer);
      const sellerNarrative = resolveTransactionNarrative(sellerItem, mockPlayerReceiver);

      expect(buyerNarrative.verb).toBe('chi');
      expect(buyerNarrative.target).toContain('thâu tóm M&A từ');
      expect(sellerNarrative.verb).toBe('nhận');
      expect(sellerNarrative.target).toContain('bồi hoàn M&A từ');
    });
  });

  // ===========================================================================
  // FACET 3: Resource Disposal & Regulatory/Treasury Flows (Auction, Tax, Bail & Audit Jail)
  // ===========================================================================
  describe('Facet 3: Resource Disposal & Regulatory/Treasury Flows (Auction, Tax, Bail & Audit Jail)', () => {
    it('[TC-194.04/MSS][UC-IMP194] Auction Win: resolveTransactionNarrative actionType auction_win sinh category ĐẤU GIÁ, icon búa, verb nộp vào Kho Bạc', () => {
      const item: FloatingTextItem = {
        id: 'badge-auction-1',
        text: '-650 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'auction_win',
        cellIndex: 3,
        title: 'Thắng đấu giá Cần Thơ ➔ Nộp Kho Bạc',
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerPayer);
      expect(narrative.category).toBe('ĐẤU GIÁ BẤT ĐỘNG SẢN');
      expect(narrative.icon).toBe('🔨');
      expect(narrative.verb).toBe('nộp');
      expect(narrative.target).toBe('vào Kho Bạc');
    });

    it('[TC-194.05/MSS][UC-IMP194] Tax: resolveTransactionNarrative actionType tax sinh category KHO BẠC NHÀ NƯỚC, icon tòa nhà, verb nộp vào Kho Bạc', () => {
      const item: FloatingTextItem = {
        id: 'badge-tax-1',
        text: '-500 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'tax',
        cellIndex: 4,
        title: 'Nộp Lệ Phí Đất Đai (Ô 04) ➔ Kho Bạc',
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerPayer);
      expect(narrative.category).toBe('KHO BẠC NHÀ NƯỚC');
      expect(narrative.icon).toBe('🏛️');
      expect(narrative.verb).toBe('nộp');
      expect(narrative.target).toBe('vào Kho Bạc');
    });

    it('[TC-194.06/MSS][UC-IMP194] Bail: resolveTransactionNarrative actionType bail sinh category BẢO LÃNH KIỂM TOÁN, icon còi báo, verb nộp vào Kho Bạc', () => {
      const item: FloatingTextItem = {
        id: 'badge-bail-1',
        text: '-500 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'bail',
        title: 'Bảo lãnh kiểm toán (Ô 10) ➔ Nộp Kho Bạc',
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerPayer);
      expect(narrative.category).toBe('BẢO LÃNH KIỂM TOÁN');
      expect(narrative.icon).toBe('🚨');
      expect(narrative.verb).toBe('nộp');
      expect(narrative.target).toBe('vào Kho Bạc');
    });

    it('[TC-194.14/MSS][UC-IMP194] Audit Jail: resolveTransactionNarrative actionType audit_jail sinh category TRẠM KIỂM TOÁN, verb vào Trạm Kiểm Toán', () => {
      const item: FloatingTextItem = {
        id: 'badge-jail-1',
        text: '0 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'audit_jail',
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerPayer);
      expect(narrative.category).toBe('TRẠM KIỂM TOÁN');
      expect(narrative.icon).toBe('🚨');
      expect(narrative.verb).toBe('vào');
      expect(narrative.target).toBe('Trạm Kiểm Toán');
    });
  });

  // ===========================================================================
  // FACET 4: Error Defense, Terminal Invariants & Banking Operations
  // ===========================================================================
  describe('Facet 4: Error Defense, Terminal Invariants & Banking Operations', () => {
    it('[TC-194.07/MSS][UC-IMP194] Mortgage: resolveTransactionNarrative actionType mortgage sinh category TÍN DỤNG NGÂN HÀNG, icon ngân hàng, verb vay từ Ngân Hàng', () => {
      const item: FloatingTextItem = {
        id: 'badge-mortgage-1',
        text: '+800 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'player-1',
        actionType: 'mortgage',
        cellIndex: 3,
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerPayer);
      expect(narrative.category).toBe('TÍN DỤNG NGÂN HÀNG');
      expect(narrative.icon).toBe('🏦');
      expect(narrative.verb).toBe('vay');
      expect(narrative.target).toBe('từ Ngân Hàng');
    });

    it('[TC-194.08/MSS][UC-IMP194] Unmortgage: resolveTransactionNarrative actionType unmortgage sinh category GIẢI CHẤP BẤT ĐỘNG SẢN, verb trả, có phí 10%', () => {
      const item: FloatingTextItem = {
        id: 'badge-unmortgage-1',
        text: '-880 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'unmortgage',
        cellIndex: 3,
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerPayer);
      expect(narrative.category).toBe('GIẢI CHẤP BẤT ĐỘNG SẢN');
      expect(narrative.icon).toBe('🔓');
      expect(narrative.verb).toBe('trả');
      expect(narrative.target + (narrative.detail ? ` ${narrative.detail}` : '')).toMatch(/giải chấp.*10%.*Kho Bạc/i);
    });

    it('[TC-194.09/MSS][UC-IMP194] Buy: resolveTransactionNarrative actionType buy sinh category MUA ĐẤT ĐẦU TƯ, icon thẻ giá, verb thanh toán mua', () => {
      const item: FloatingTextItem = {
        id: 'badge-buy-1',
        text: '-1.000 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'buy',
        cellIndex: 3,
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerPayer);
      expect(narrative.category).toBe('MUA ĐẤT ĐẦU TƯ');
      expect(narrative.icon).toBe('🏷️');
      expect(narrative.verb).toBe('thanh toán');
      expect(narrative.target).toContain('mua');
    });

    it('[TC-194.10/MSS][UC-IMP194] Upgrade: resolveTransactionNarrative actionType upgrade sinh category NÂNG CẤP CÔNG TRÌNH, icon thi công, verb thanh toán nâng cấp nhà', () => {
      const item: FloatingTextItem = {
        id: 'badge-upgrade-1',
        text: '-600 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'upgrade',
        cellIndex: 3,
        title: 'Nâng cấp C1 tại Bến Bạch Đằng',
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerPayer);
      expect(narrative.category).toBe('NÂNG CẤP CÔNG TRÌNH');
      expect(narrative.icon).toBe('🏗️');
      expect(narrative.verb).toBe('thanh toán');
      expect(narrative.target).toContain('nâng cấp nhà');
    });

    it('[TC-194.11/MSS][UC-IMP194] Salary: resolveTransactionNarrative actionType salary sinh category LƯƠNG KHỞI HÀNH, icon cờ, verb nhận qua ô Khởi Hành', () => {
      const item: FloatingTextItem = {
        id: 'badge-salary-1',
        text: '+2.000 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'player-1',
        actionType: 'salary',
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerPayer);
      expect(narrative.category).toBe('LƯƠNG KHỞI HÀNH');
      expect(narrative.icon).toBe('🚩');
      expect(narrative.verb).toBe('nhận');
      expect(narrative.target).toBe('tiền lương qua ô Khởi Hành');
    });

    it('[TC-194.12/MSS][UC-IMP194] HOSE: resolveTransactionNarrative actionType hose sinh category THỊ TRƯỜNG CHỨNG KHOÁN, icon biểu đồ, target sàn HOSE', () => {
      const item: FloatingTextItem = {
        id: 'badge-hose-1',
        text: '+450 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'player-1',
        actionType: 'hose',
        title: 'Cổ tức Vinamilk',
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerPayer);
      expect(narrative.category).toBe('THỊ TRƯỜNG CHỨNG KHOÁN');
      expect(narrative.icon).toBe('📊');
      expect(narrative.verb).toMatch(/cổ tức|đầu tư/);
      expect(narrative.target).toContain('sàn HOSE');
    });
  });

  // ===========================================================================
  // FACET 5: Cross-Coupling Blast Radius, UI Markup & Codebase Hygiene
  // ===========================================================================
  describe('Facet 5: Cross-Coupling Blast Radius, UI Markup & Codebase Hygiene', () => {
    it('[TC-194.17/MSS][UC-IMP194] FloatingBadge Rendering: Chứa header danh mục, tên người chơi, floating-amount-pill title, và max-w-[82vw]', () => {
      useGameStore.setState({
        playersInfo: {
          'player-1': mockPlayerPayer,
        },
      });

      const item: FloatingTextItem = {
        id: 'badge-markup-1',
        text: '-650 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'auction_win',
        cellIndex: 3,
        title: 'Thắng đấu giá Cần Thơ ➔ Nộp Kho Bạc',
        timestamp: Date.now(),
      };

      const html = renderToStaticMarkup(React.createElement(FloatingBadge, { item }));

      expect(html).toContain('ĐẤU GIÁ BẤT ĐỘNG SẢN');
      expect(html).toContain('Đại Gia Sài Gòn');
      expect(html).toContain('data-testid="floating-amount-pill"');
      expect(html).toContain('max-w-[82vw] sm:max-w-[340px]');
    });

    it('[TC-194.18/MSS][UC-IMP194] Ngân sách LOC & Bảo tồn Hợp đồng cũ: floating_numbers <= 390 LOC, transaction_narrative <= 280 LOC, và export resolveFriendlyReason', () => {
      const root = path.resolve(process.cwd());
      const floatingNumbersFile = path.join(root, 'src/client/ui/floating_numbers.tsx');
      const narrativeFile = path.join(root, 'src/client/ui/transaction_narrative.ts');

      const floatingLoc = fs.readFileSync(floatingNumbersFile, 'utf8').split('\n').length;
      expect(floatingLoc).toBeLessThanOrEqual(390);

      const narrativeExists = fs.existsSync(narrativeFile);
      expect(narrativeExists).toBe(true);

      const narrativeLoc = narrativeExists
        ? fs.readFileSync(narrativeFile, 'utf8').split('\n').length
        : 999;
      expect(narrativeLoc).toBeLessThanOrEqual(280);

      expect(typeof resolveFriendlyReason).toBe('function');
    });

    it('[TC-194.19/MSS][UC-IMP194] Self-Centric Narrative: Khi playerId === myPlayerId thì subject là "Bạn", khi đối thủ giao dịch với Bạn thì target là "Bạn"', () => {
      const itemMyRentPay: FloatingTextItem = {
        id: 'badge-self-1',
        text: '-350 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'rent_pay',
        targetPlayerName: 'Tỷ Phú Hà Thành',
        cellIndex: 3,
        timestamp: Date.now(),
      };
      const narrativeSelf = resolveTransactionNarrative(itemMyRentPay, mockPlayerPayer, undefined, 'player-1');
      expect(narrativeSelf.subject).toBe('Bạn');
      expect(narrativeSelf.verb).toBe('trả');
      expect(narrativeSelf.target).toContain('cho Tỷ Phú');

      const itemPartnerRentPay: FloatingTextItem = {
        id: 'badge-self-2',
        text: '-350 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-2',
        actionType: 'rent_pay',
        targetPlayerName: 'Đại Gia Sài Gòn',
        cellIndex: 3,
        timestamp: Date.now(),
      };
      const narrativePartner = resolveTransactionNarrative(
        itemPartnerRentPay,
        mockPlayerReceiver,
        { 'player-1': mockPlayerPayer, 'player-2': mockPlayerReceiver },
        'player-1'
      );
      expect(narrativePartner.subject).toBe('Tỷ Phú Hà Thành');
      expect(narrativePartner.target).toBe('cho Bạn');
    });

    it('[TC-194.20/MSS][UC-IMP194] Streamlined FloatingBadge: Loại bỏ lặp tên ở header, dùng py-1.5 sm:py-2.5 để thu gọn chiều cao', () => {
      useGameStore.setState({
        playersInfo: {
          'player-1': mockPlayerPayer,
        },
      });

      const item: FloatingTextItem = {
        id: 'badge-compact-1',
        text: '-500 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'tax',
        title: 'Lệ Phí Đất Đai Ô 04',
        timestamp: Date.now(),
      };

      const html = renderToStaticMarkup(React.createElement(FloatingBadge, { item }));
      expect(html).toContain('py-1.5 sm:py-2.5');
      // Không còn pill tên người chơi trùng lặp ở góc trên bên phải header
      expect(html).not.toMatch(/border-b[^>]*>[^<]*<div[^>]*>.*?<\/div>\s*<span[^>]*style="background-color:/s);
    });
  });
});
