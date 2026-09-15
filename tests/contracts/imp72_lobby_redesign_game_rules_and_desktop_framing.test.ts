// [TC-72/MSS][IMP-72] Contract Test Suite: Desktop Camera Framing, Clean Lobby & Game Rules Modal
// Traceability: docs/epics/networking/_epic_ledger.md § IMP-72
import { describe, it, expect, beforeAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CAMERA_CONFIG } from '../../src/client/3d/camera_state_machine';
import { PreMatchDeck } from '../../src/client/ui/lobby/pre_match_deck';
import { PlayerSlotCard } from '../../src/client/ui/lobby/player_slot_card';
import { createEmptySlot, BotPersonality, type LobbySlot } from '../../src/client/store/lobby_types';

type RulesModalProps = {
  readonly isOpen: boolean;
  readonly onClose?: () => void;
  readonly initialTab?: 'core' | 'cards' | 'mechanics';
};

type RulesModalComponent = React.ComponentType<RulesModalProps>;

let GameRulesModal: RulesModalComponent | null = null;

const renderRulesModal = (props: Partial<RulesModalProps> = {}): string => {
  if (!GameRulesModal) return '';
  return renderToStaticMarkup(React.createElement(GameRulesModal, { isOpen: true, ...props }));
};

const emptySlot: LobbySlot = createEmptySlot(1);
const occupiedBotSlot: LobbySlot = {
  ...createEmptySlot(2),
  playerId: 'bot_2',
  playerName: 'Bot AI 2',
  isBot: true,
  isOccupied: true,
  botPersonality: BotPersonality.Balanced,
};

const testSlots: readonly LobbySlot[] = [
  { ...createEmptySlot(0), playerId: 'p1', playerName: 'Chủ Phòng', isHost: true, isOccupied: true, isReady: true },
  emptySlot,
  occupiedBotSlot,
  createEmptySlot(3),
];

describe('[TC-72/MSS][IMP-72] Desktop Framing, Clean Lobby & Game Rules Contract Suite', () => {
  let preMatchHtml = '';
  let emptySlotHtml = '';
  let botSlotHtml = '';

  beforeAll(async () => {
    try {
      const modalPath = '../../src/client/ui/modals/game_rules_modal';
      const mod = (await import(/* @vite-ignore */ modalPath)) as { GameRulesModal?: RulesModalComponent };
      GameRulesModal = mod?.GameRulesModal ?? null;
    } catch {
      GameRulesModal = null;
    }

    preMatchHtml = renderToStaticMarkup(
      React.createElement(PreMatchDeck, { isHost: true, roomCode: 'VT8888', slots: testSlots })
    );

    emptySlotHtml = renderToStaticMarkup(
      React.createElement(PlayerSlotCard, { slot: emptySlot, isHostViewer: true, onToggleBot: () => {} })
    );

    botSlotHtml = renderToStaticMarkup(
      React.createElement(PlayerSlotCard, {
        slot: occupiedBotSlot,
        isHostViewer: true,
        onToggleBot: () => {},
        onCycleBotPersonality: () => {},
      })
    );
  });

  // =========================================================================
  // FACET 1: DESKTOP CAMERA FRAMING OFFSET (CHỐNG CHE KHUẤT BÀN CỜ)
  // =========================================================================
  describe('Facet 1: Desktop Camera Framing Offset', () => {
    it('[TC-72.01/MSS][IMP-72] CAMERA_CONFIG.pre_match.position matches telephoto position [30.0, 33.0, 30.0]', () => {
      expect(CAMERA_CONFIG.pre_match.position).toEqual([30.0, 33.0, 30.0]);
    });

    it('[TC-72.02/MSS][IMP-72] CAMERA_CONFIG.pre_match.target shifts focal center to [1.5, 0.0, 1.5]', () => {
      expect(CAMERA_CONFIG.pre_match.target).toEqual([1.5, 0.0, 1.5]);
    });

    it('[TC-72.03/MSS][IMP-72] CAMERA_CONFIG.pre_match.fov uses architectural telephoto 24', () => {
      expect(CAMERA_CONFIG.pre_match.fov).toBe(24);
    });

    it('[TC-72.04/MSS][IMP-72] CAMERA_CONFIG.pre_match preserves 45° isometric symmetry vector', () => {
      const deltaX = CAMERA_CONFIG.pre_match.position[0] - CAMERA_CONFIG.pre_match.target[0];
      const deltaZ = CAMERA_CONFIG.pre_match.position[2] - CAMERA_CONFIG.pre_match.target[2];
      expect(deltaX).toBeCloseTo(28.5, 1);
      expect(deltaZ).toBeCloseTo(28.5, 1);
    });

    it('[TC-72.05/MSS][IMP-72] CAMERA_CONFIG.pre_match target X shifts board leftwards (target[0] >= 1.5)', () => {
      expect(CAMERA_CONFIG.pre_match.target[0]).toBeGreaterThanOrEqual(1.5);
    });

    it('[TC-72.06/MSS][IMP-72] CAMERA_CONFIG.pre_match target Z compensates towards corner 00 (target[2] >= 1.2)', () => {
      expect(CAMERA_CONFIG.pre_match.target[2]).toBeGreaterThanOrEqual(1.2);
    });
  });

  // =========================================================================
  // FACET 2: CLEAN & MODERN LOBBY PANEL (LOẠI BỎ THỂ LỆ RƯỜM RÀ & TỐI ƯU NÚT BẤM)
  // =========================================================================
  describe('Facet 2: Clean & Modern Lobby Panel', () => {
    it('[TC-72.07/MSS][IMP-72] PreMatchDeck purges cumbersome lobby-rules-card container', () => {
      expect(preMatchHtml).not.toContain('data-testid="lobby-rules-card"');
    });

    it('[TC-72.08/MSS][IMP-72] PreMatchDeck purges static header Tóm Tắt Thể Lệ Thi Đấu', () => {
      expect(preMatchHtml).not.toContain('Tóm Tắt Thể Lệ Thi Đấu');
    });

    it('[TC-72.09/MSS][IMP-72] PreMatchDeck provides dedicated open-game-rules-btn to launch modal', () => {
      expect(preMatchHtml).toContain('data-testid="open-game-rules-btn"');
    });

    it('[TC-72.10/MSS][IMP-72] PreMatchDeck purges leave-lobby-btn completely', () => {
      expect(preMatchHtml).not.toContain('data-testid="leave-lobby-btn"');
    });

    it('[TC-72.11/MSS][IMP-72] PreMatchDeck renders primary start-game-btn for room host', () => {
      expect(preMatchHtml).toContain('data-testid="start-game-btn"');
    });

    it('[TC-72.12/MSS][IMP-72] PreMatchDeck narrows panel width, purging legacy max-w-[400px]', () => {
      expect(preMatchHtml).not.toContain('max-w-[400px]');
    });
  });

  // =========================================================================
  // FACET 3: CLEAN & MODERN PLAYER SLOTS (XANH COBALT PHẲNG, LOẠI BỎ CYAN)
  // =========================================================================
  describe('Facet 3: Clean & Modern Player Slots', () => {
    it('[TC-72.13/MSS][IMP-72] PlayerSlotCard empty slot removes legacy bg-cyan-600 button background', () => {
      expect(emptySlotHtml).not.toContain('bg-cyan-600');
    });

    it('[TC-72.14/MSS][IMP-72] PlayerSlotCard empty slot removes legacy border-cyan-800 border', () => {
      expect(emptySlotHtml).not.toContain('border-cyan-800');
    });

    it('[TC-72.15/MSS][IMP-72] PlayerSlotCard empty slot adopts modern cobalt blue bg-blue-600', () => {
      expect(emptySlotHtml).toContain('bg-blue-600');
    });

    it('[TC-72.16/MSS][IMP-72] PlayerSlotCard occupied bot slot removes legacy bg-cyan-100 badge', () => {
      expect(botSlotHtml).not.toContain('bg-cyan-100');
    });

    it('[TC-72.17/MSS][IMP-72] PlayerSlotCard occupied bot slot removes legacy bg-cyan-600 cycle button', () => {
      expect(botSlotHtml).not.toContain('bg-cyan-600');
    });
  });

  // =========================================================================
  // FACET 4: COMPREHENSIVE DEDICATED GAME RULES MODAL (TOÀN BỘ QUY TẮC & THẺ BÀI)
  // =========================================================================
  describe('Facet 4: Comprehensive Dedicated Game Rules Modal', () => {
    it('[TC-72.18/MSS][IMP-72] GameRulesModal is defined and exported from modals directory', () => {
      expect(GameRulesModal).toBeDefined();
      expect(GameRulesModal).not.toBeNull();
    });

    it('[TC-72.19/MSS][IMP-72] GameRulesModal renders main container data-testid="game-rules-modal"', () => {
      expect(renderRulesModal()).toContain('data-testid="game-rules-modal"');
    });

    it.each(['rules-tab-core', 'rules-tab-cards', 'rules-tab-mechanics'])(
      '[TC-72.20/MSS][IMP-72] GameRulesModal renders navigation tab %s',
      (tabId) => {
        expect(renderRulesModal()).toContain(`data-testid="${tabId}"`);
      }
    );

    it('[TC-72.21/MSS][IMP-72] GameRulesModal core rules tab specifies 15.000 Tr. and 2.000 Tr.', () => {
      const html = renderRulesModal({ initialTab: 'core' });
      expect(html).toContain('15.000 Tr.');
      expect(html).toContain('2.000 Tr.');
    });

    it('[TC-72.22/MSS][IMP-72] GameRulesModal core rules tab specifies 30 vòng, xúc xắc đôi, điều kiện thắng', () => {
      const html = renderRulesModal({ initialTab: 'core' });
      expect(html).toContain('30 vòng');
      expect(html).toContain('xúc xắc đôi');
      expect(html).toContain('điều kiện thắng');
    });

    it('[TC-72.23/MSS][IMP-72] GameRulesModal cards tab covers 28 properties, color groups, and hotel', () => {
      const html = renderRulesModal({ initialTab: 'cards' });
      expect(html).toContain('28');
      expect(html).toContain('nhóm màu');
      expect(html).toContain('khách sạn');
    });

    it('[TC-72.24/MSS][IMP-72] GameRulesModal cards tab covers transport, utilities, Chance, Market, and HOSE', () => {
      const html = renderRulesModal({ initialTab: 'cards' });
      expect(html).toContain('sân bay');
      expect(html).toContain('tiện ích');
      expect(html).toContain('Cơ Hội');
      expect(html).toContain('HOSE');
    });

    it('[TC-72.25/MSS][IMP-72] GameRulesModal mechanics tab covers Kiểm Toán and Tạm Giam rules', () => {
      const html = renderRulesModal({ initialTab: 'mechanics' });
      expect(html).toContain('Kiểm Toán');
      expect(html).toContain('Tạm Giam');
    });

    it('[TC-72.26/MSS][IMP-72] GameRulesModal mechanics tab covers Public Auction, 50% Mortgage, and Bankruptcy', () => {
      const html = renderRulesModal({ initialTab: 'mechanics' });
      expect(html).toContain('Đấu Giá');
      expect(html).toContain('50%');
      expect(html).toContain('Thế Chấp');
      expect(html).toContain('Phá Sản');
    });
  });

  // =========================================================================
  // FACET 5: MODAL DISMISSAL & HEADLESS SAFETY
  // =========================================================================
  describe('Facet 5: Modal Dismissal & Headless Safety', () => {
    it('[TC-72.27/MSS][IMP-72] GameRulesModal when isOpen is false renders nothing to DOM', () => {
      const closedHtml = renderRulesModal({ isOpen: false });
      expect(closedHtml).not.toContain('data-testid="game-rules-modal"');
    });

    it('[TC-72.28/MSS][IMP-72] GameRulesModal provides close button data-testid="close-rules-modal-btn"', () => {
      expect(renderRulesModal()).toContain('data-testid="close-rules-modal-btn"');
    });
  });
});
