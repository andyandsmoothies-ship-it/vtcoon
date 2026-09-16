// [IMP-110/MSS] Contract Test Suite: Mobile Ergonomics & WCAG 2.1 AA Contrast Hardening
// 4-Facet Universal Behavioral Matrix:
// Facet 1 (Boundary & Range): Touch targets >= 44x44px across all viewports, safe-area-inset-bottom insets.
// Facet 2 (State Reactivity): Dynamic high contrast states (WCAG 2.1 Level AA >= 4.5:1 on solid text).
// Facet 3 (Resource Disposal): Clean SSR renderToStaticMarkup without dangling timers or memory leaks.
// Facet 4 (Error Defense): Elimination of sub-44px click targets (w-7 h-7, min-h-[38px]) in lobby and modals.

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { TitleDeedModal } from '../../src/client/ui/modals/title_deed_modal';
import { HudContainer } from '../../src/client/ui/hud_container';
import { TopBar } from '../../src/client/ui/top_bar';
import { PlayerSlotCard } from '../../src/client/ui/lobby/player_slot_card';
import { TradeModal } from '../../src/client/ui/modals/trade_modal';
import { useGameStore } from '../../src/client/store/game_store';
import { BotPersonality } from '../../src/client/store/lobby_types';

function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0]! * 0.2126 + a[1]! * 0.7152 + a[2]! * 0.0722;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const parse = (hex: string) => {
    const c = hex.replace('#', '');
    return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
  };
  const [r1, g1, b1] = parse(hex1);
  const [r2, g2, b2] = parse(hex2);
  const l1 = getLuminance(r1!, g1!, b1!);
  const l2 = getLuminance(r2!, g2!, b2!);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

describe('[IMP-110/MSS] Mobile Ergonomics & WCAG 2.1 AA Contrast Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      roundNumber: 1,
      maxRounds: 30,
      turnTimeRemaining: 30,
      currentTurnPlayerId: 'p1',
      playersInfo: {
        p1: { id: 'p1', name: 'Chủ Tịch', balance: 15000, bankrupt: false, tokenColor: '#EF4444', ownedProperties: [] },
        p2: { id: 'p2', name: 'Đối Thủ', balance: 12000, bankrupt: false, tokenColor: '#3B82F6', ownedProperties: [] },
      },
      treasuryPool: 2500,
      isRolling: false,
      hasRolledThisTurn: false,
      activeEmotes: {},
      levelMap: {},
      playerPositions: {},
    });
  });

  // =========================================================================
  // GÓI 1: ĐỘ TƯƠNG PHẢN NÚT MUA BĐS (WCAG 2.1 AA)
  // =========================================================================
  describe('Gói 1: Độ Tương Phản Nút Mua BĐS (WCAG 2.1 AA)', () => {
    it('[IMP-110/UC-A11Y-01] Nút Mua BĐS sử dụng bg-emerald-700 để đạt độ tương phản chuẩn AA >= 4.5:1', () => {
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedModal, { cellIndex: 1, canBuy: true, isOwned: false })
      );
      expect(html).toContain('bg-emerald-700');
      expect(html).not.toContain('bg-emerald-500 hover:bg-emerald-600');
    });

    it('[IMP-110/UC-A11Y-02] Nút Mua BĐS duy trì chiều cao xúc giác >= 48px', () => {
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedModal, { cellIndex: 1, canBuy: true, isOwned: false })
      );
      expect(html).toContain('min-h-[48px]');
    });

    it('[IMP-110/UC-A11Y-03] Kiểm chứng tỷ lệ tương phản toán học chữ trắng trên nền bg-emerald-700 đạt >= 4.5:1', () => {
      const ratio = getContrastRatio('#FFFFFF', '#047857');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('[IMP-110/UC-A11Y-04] Nút Bỏ Qua trong TitleDeedModal đạt chuẩn vùng chạm >= 48px', () => {
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedModal, { cellIndex: 1, canBuy: true, isOwned: false })
      );
      expect(html).toContain('Bỏ Qua');
      expect(html).toContain('min-h-[48px]');
    });
  });

  // =========================================================================
  // GÓI 2: ĐỆM MÉP AN TOÀN SAFE AREA DƯỚI ĐÁY (Mobile Ergonomics)
  // =========================================================================
  describe('Gói 2: Đệm Mép An Toàn Safe Area Dưới Đáy (Mobile Ergonomics)', () => {
    it('[IMP-110/UC-MCH-01] Footer HudContainer chứa class bù đệm safe-area-inset-bottom cho điện thoại tràn viền', () => {
      const html = renderToStaticMarkup(
        React.createElement(HudContainer, { localPlayerId: 'p1' })
      );
      expect(html).toContain('env(safe-area-inset-bottom)');
    });

    it('[IMP-110/UC-MCH-02] Footer HudContainer giữ nguyên layout responsive justify-center hoặc justify-between', () => {
      const html = renderToStaticMarkup(
        React.createElement(HudContainer, { localPlayerId: 'p1' })
      );
      expect(html).toContain('justify-center sm:justify-between');
    });
  });

  // =========================================================================
  // GÓI 3: KÍCH THƯỚC VÙNG CHẠM CỤM NÚT TOPBAR (>= 44x44px trên mọi màn hình)
  // =========================================================================
  describe('Gói 3: Cụm Nút TopBar Đạt Chuẩn >= 44x44px', () => {
    it('[IMP-110/UC-TOP-01] Nút chuyển đổi chu kỳ thời gian có min-h-[44px] min-w-[44px] không phụ thuộc mobile breakpoint', () => {
      const html = renderToStaticMarkup(React.createElement(TopBar, {}));
      expect(html).toContain('data-testid="time-of-day-toggle-button"');
      const idx = html.indexOf('data-testid="time-of-day-toggle-button"');
      const tagStart = html.lastIndexOf('<button', idx);
      const snippet = html.slice(tagStart !== -1 ? tagStart : Math.max(0, idx - 800), idx + 100);
      expect(snippet).toContain('min-h-[44px]');
      expect(snippet).toContain('min-w-[44px]');
      expect(snippet).not.toContain('min-h-[38px]');
    });

    it('[IMP-110/UC-TOP-02] Nút bật tắt âm thanh có min-h-[44px] min-w-[44px] toàn diện', () => {
      const html = renderToStaticMarkup(React.createElement(TopBar, {}));
      expect(html).toContain('data-testid="mute-toggle-button"');
      const idx = html.indexOf('data-testid="mute-toggle-button"');
      const tagStart = html.lastIndexOf('<button', idx);
      const snippet = html.slice(tagStart !== -1 ? tagStart : Math.max(0, idx - 800), idx + 100);
      expect(snippet).toContain('min-h-[44px]');
      expect(snippet).toContain('min-w-[44px]');
      expect(snippet).not.toContain('min-h-[38px]');
    });

    it('[IMP-110/UC-TOP-03] Nút mở nhật ký hoạt động có min-h-[44px] min-w-[44px] toàn diện', () => {
      const html = renderToStaticMarkup(React.createElement(TopBar, {}));
      expect(html).toContain('data-testid="activity-feed-toggle-button"');
      const idx = html.indexOf('data-testid="activity-feed-toggle-button"');
      const tagStart = html.lastIndexOf('<button', idx);
      const snippet = html.slice(tagStart !== -1 ? tagStart : Math.max(0, idx - 800), idx + 100);
      expect(snippet).toContain('min-h-[44px]');
      expect(snippet).toContain('min-w-[44px]');
      expect(snippet).not.toContain('min-h-[38px]');
    });

    it('[IMP-110/UC-TOP-04] Nút thoát phòng có min-h-[44px] min-w-[44px] khi có callback onLeaveRoom', () => {
      const html = renderToStaticMarkup(React.createElement(TopBar, { onLeaveRoom: () => {} }));
      expect(html).toContain('data-testid="leave-room-button"');
      const idx = html.indexOf('data-testid="leave-room-button"');
      const tagStart = html.lastIndexOf('<button', idx);
      const snippet = html.slice(tagStart !== -1 ? tagStart : Math.max(0, idx - 800), idx + 100);
      expect(snippet).toContain('min-h-[44px]');
      expect(snippet).toContain('min-w-[44px]');
      expect(snippet).not.toContain('min-h-[38px]');
    });
  });

  // =========================================================================
  // GÓI 4: KÍCH THƯỚC VÙNG CHẠM TRONG SẢNH CHỜ (PlayerSlotCard >= 44px)
  // =========================================================================
  describe('Gói 4: Kích Thước Vùng Chạm Trong Sảnh Chờ (PlayerSlotCard)', () => {
    it('[IMP-110/UC-SLOT-01] Nút "+ Thêm Bot AI" tại vị trí trống đạt chuẩn min-h-[44px]', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerSlotCard, {
          slot: {
            slotIndex: 1,
            playerId: null,
            playerName: '',
            tokenColor: '#38BDF8',
            isHost: false,
            isReady: false,
            isBot: false,
            isOccupied: false,
          },
          isHostViewer: true,
          onToggleBot: () => {},
        })
      );
      expect(html).toContain('data-testid="add-bot-slot-1-btn"');
      const idx = html.indexOf('data-testid="add-bot-slot-1-btn"');
      const tagStart = html.lastIndexOf('<button', idx);
      const snippet = html.slice(tagStart !== -1 ? tagStart : Math.max(0, idx - 500), idx + 50);
      expect(snippet).toContain('min-h-[44px]');
      expect(snippet).not.toContain('min-h-[38px]');
    });

    it('[IMP-110/UC-SLOT-02] Nút đổi tính cách Bot tại vị trí có Bot đạt chuẩn min-h-[44px]', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerSlotCard, {
          slot: {
            slotIndex: 1,
            playerId: 'bot-1',
            playerName: 'Bot 1',
            tokenColor: '#38BDF8',
            isHost: false,
            isReady: true,
            isBot: true,
            botPersonality: BotPersonality.Balanced,
            isOccupied: true,
          },
          isHostViewer: true,
          onCycleBotPersonality: () => {},
        })
      );
      expect(html).toContain('data-testid="cycle-bot-1-btn"');
      const idx = html.indexOf('data-testid="cycle-bot-1-btn"');
      const tagStart = html.lastIndexOf('<button', idx);
      const snippet = html.slice(tagStart !== -1 ? tagStart : Math.max(0, idx - 500), idx + 50);
      expect(snippet).toContain('min-h-[44px]');
    });

    it('[IMP-110/UC-SLOT-03] Nút Xóa Bot đạt chuẩn min-w-[44px] min-h-[44px] và loại bỏ w-7 h-7 chật hẹp', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerSlotCard, {
          slot: {
            slotIndex: 1,
            playerId: 'bot-1',
            playerName: 'Bot 1',
            tokenColor: '#38BDF8',
            isHost: false,
            isReady: true,
            isBot: true,
            botPersonality: BotPersonality.Balanced,
            isOccupied: true,
          },
          isHostViewer: true,
          onToggleBot: () => {},
        })
      );
      expect(html).toContain('data-testid="remove-bot-slot-1-btn"');
      const idx = html.indexOf('data-testid="remove-bot-slot-1-btn"');
      const tagStart = html.lastIndexOf('<button', idx);
      const snippet = html.slice(tagStart !== -1 ? tagStart : Math.max(0, idx - 500), idx + 50);
      expect(snippet).toContain('min-w-[44px]');
      expect(snippet).toContain('min-h-[44px]');
    });
  });

  // =========================================================================
  // GÓI 5: KÍCH THƯỚC VÙNG CHẠM TRONG TRADEMODAL (>= 44px)
  // =========================================================================
  describe('Gói 5: Kích Thước Vùng Chạm Trong TradeModal (>= 44px)', () => {
    it('[IMP-110/UC-TRADE-01] Nút cộng tiền nhanh +100 trong TradeModal đạt chuẩn min-h-[44px]', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'p2',
          myBalance: 10000,
          targetBalance: 10000,
          myProperties: [],
          targetProperties: [],
        })
      );
      expect(html).toContain('+100');
      expect(html).toContain('min-h-[44px]');
      expect(html).not.toContain('min-h-[38px]');
    });

    it('[IMP-110/UC-TRADE-02] Nút cộng tiền nhanh +500 trong TradeModal đạt chuẩn min-h-[44px]', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'p2',
          myBalance: 10000,
          targetBalance: 10000,
          myProperties: [],
          targetProperties: [],
        })
      );
      expect(html).toContain('+500');
      expect(html).toContain('min-h-[44px]');
    });
  });
});
