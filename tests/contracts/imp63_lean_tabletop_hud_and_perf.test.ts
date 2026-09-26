// [TC-63/MSS][UC-IMP63] Contract Test Suite: Lean Tabletop HUD & GPU Optimization
// Specification: IMP-63 Lean & High-Performance Tabletop HUD
// Universal 4-Facet Behavioral Matrix:
// Facet 1 (Boundary): GPU Backdrop Blur Purge (Zero framebuffer copy overhead)
// Facet 2 (State Reactivity): Tabletop Solid Ivory (#FFFDF8) & Ink Contrast (border-slate-900)
// Facet 3 (Semantics & Defense): Tactile Toy Buttons & Accessibility Contract (WCAG / Aria)
// Facet 4 (Resource Disposal & Stability): PreMatchDeck & Lobby Clean Tabletop Alignment

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TopBar } from '../../src/client/ui/top_bar';
import { ActionDock } from '../../src/client/ui/action_dock';
import { PlayerCard } from '../../src/client/ui/player_card';
import { SocialEmotesTray } from '../../src/client/ui/social_emotes_tray';
import { ModalBackdrop } from '../../src/client/ui/modals/modal_backdrop';
import { FloatingBadge } from '../../src/client/ui/floating_numbers';
import { PreMatchDeck } from '../../src/client/ui/lobby/pre_match_deck';
import { PlayerSlotCard } from '../../src/client/ui/lobby/player_slot_card';
import { QrCodeCard } from '../../src/client/ui/lobby/qr_code_card';
import {
  useGameStore,
  FloatingTextType,
  type PlayerHudInfo,
  type FloatingTextItem,
} from '../../src/client/store/game_store';
import { useLobbyStore } from '../../src/client/store/lobby_store';
import { createEmptySlot, type LobbySlot } from '../../src/client/store/lobby_types';
import { SOCIAL_EMOTES } from '../../src/domain/emotes';

const samplePlayer: PlayerHudInfo = {
  id: 'p1',
  name: 'Đại Gia Phố Cổ',
  balance: 15000,
  tokenColor: '#EF4444',
  ownedProperties: [1, 3],
  mortgagedProperties: [],
  mortgageLoans: {},
  isBot: false,
  bankrupt: false,
  inAudit: false,
};

const sampleRewardItem: FloatingTextItem = {
  id: 'flt_reward_1',
  playerId: 'p1',
  text: '+2.000 Tr.',
  type: FloatingTextType.Reward,
  timestamp: Date.now(),
};

const sampleTaxItem: FloatingTextItem = {
  id: 'flt_tax_1',
  playerId: 'p1',
  text: '-1.000 Tr.',
  type: FloatingTextType.Penalty,
  timestamp: Date.now(),
};

const sampleOccupiedSlot: LobbySlot = {
  ...createEmptySlot(0),
  playerId: 'p1',
  playerName: 'Chủ Sảnh VIP',
  isHost: true,
  isOccupied: true,
  isReady: true,
  tokenColor: '#EF4444',
};

const sampleEmptySlot: LobbySlot = createEmptySlot(1);

const sampleLobbySlots: readonly LobbySlot[] = [
  sampleOccupiedSlot,
  sampleEmptySlot,
  createEmptySlot(2),
  createEmptySlot(3),
];

describe('[TC-63/MSS][UC-IMP63] Lean Tabletop HUD & GPU Optimization Contract Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      playersInfo: {
        p1: samplePlayer,
      },
      currentTurnPlayerId: 'p1',
      turnTimeRemaining: 45,
      treasuryPool: 10000,
      roundNumber: 2,
      maxRounds: 30,
      isRolling: false,
      activePawnAnimation: null,
      pawnAnimationQueue: [],
      dice: [2, 4],
      hasRolledThisTurn: false,
      playerPositions: { p1: 0 },
    });

    useLobbyStore.getState().initLobby('VT8888', 'p1', true, 'Chủ Sảnh VIP');
  });

  // =========================================================================
  // FACET 1: GPU Backdrop Blur Purge (Boundary & Zero Framebuffer Copy)
  // =========================================================================
  describe('[TC-63.1/MSS][UC-IMP63] Facet 1: GPU Backdrop Blur Purge', () => {
    const componentsForBlurPurge = [
      {
        name: 'TopBar',
        render: () => renderToStaticMarkup(React.createElement(TopBar)),
      },
      {
        name: 'PlayerCard',
        render: () =>
          renderToStaticMarkup(
            React.createElement(PlayerCard, {
              player: samplePlayer,
              isCurrentTurn: true,
              levelMap: {},
            })
          ),
      },
      {
        name: 'SocialEmotesTray',
        render: () => renderToStaticMarkup(React.createElement(SocialEmotesTray)),
      },
      {
        name: 'ModalBackdrop',
        render: () =>
          renderToStaticMarkup(
            React.createElement(
              ModalBackdrop,
              {
                title: 'Xác Nhận',
                children: React.createElement('div', null, 'Nội dung modal'),
              }
            )
          ),
      },
      {
        name: 'FloatingBadge',
        render: () =>
          renderToStaticMarkup(
            React.createElement(FloatingBadge, { item: sampleRewardItem })
          ),
      },
    ];

    it.each(componentsForBlurPurge)(
      '[TC-63.1/MSS] %s không được chứa backdrop-blur để loại bỏ overhead copy framebuffer GPU',
      ({ render }) => {
        const html = render();
        expect(html).not.toContain('backdrop-blur');
      }
    );
  });

  // =========================================================================
  // FACET 2: Tabletop Solid Ivory & Ink Contrast (State Reactivity)
  // =========================================================================
  describe('[TC-63.2/MSS][UC-IMP63] Facet 2: Tabletop Solid Ivory & Ink Contrast', () => {
    it('[TC-63.2/MSS] TopBar sử dụng nền giấy ngà sáng #FFFDF8 và viền mực đen border-slate-900', () => {
      const html = renderToStaticMarkup(React.createElement(TopBar));
      expect(html).toContain('bg-[#FFFDF8]');
      expect(html).toContain('border-slate-900');
    });

    it('[TC-63.2/MSS] ActionDock sử dụng nền giấy ngà sáng #FFFDF8 và viền border-slate-300/80', () => {
      const html = renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p1' }));
      expect(html).toContain('bg-[#FFFDF8]');
      expect(html).toContain('border-slate-300/80');
    });

    it('[TC-63.2/MSS] PlayerCard (lượt hiện tại) sử dụng nền giấy ngà sáng #FFFDF8 và viền mực đen border-slate-900', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: samplePlayer,
          isCurrentTurn: true,
          levelMap: {},
        })
      );
      expect(html).toContain('bg-[#FFFDF8]');
      expect(html).toContain('border-slate-900');
    });

    it('[TC-63.2/MSS] PlayerCard (lượt chờ) sử dụng nền giấy ngà sáng #FFFDF8 và viền mực đen border-slate-900', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: samplePlayer,
          isCurrentTurn: false,
          levelMap: {},
        })
      );
      expect(html).toContain('bg-[#FFFDF8]');
      expect(html).toContain('border-slate-900');
    });

    it('[TC-63.2/MSS] SocialEmotesTray sử dụng nền giấy ngà sáng #FFFDF8 và viền mực đen border-slate-900', () => {
      const html = renderToStaticMarkup(React.createElement(SocialEmotesTray));
      expect(html).toContain('bg-[#FFFDF8]');
      expect(html).toContain('border-slate-900');
    });

    it('[TC-63.2/MSS] FloatingBadge tem thưởng dùng viền đen sắc nét và loại bỏ glow mờ nhạt', () => {
      const html = renderToStaticMarkup(
        React.createElement(FloatingBadge, { item: sampleRewardItem })
      );
      expect(html).toMatch(/border-slate-900|border-black|border-slate-300/);
      expect(html).not.toContain('shadow-emerald-500/40');
    });

    it('[TC-63.2/MSS] FloatingBadge tem phạt dùng viền đen sắc nét và loại bỏ glow mờ nhạt', () => {
      const html = renderToStaticMarkup(
        React.createElement(FloatingBadge, { item: sampleTaxItem })
      );
      expect(html).toMatch(/border-slate-900|border-black|border-slate-300/);
      expect(html).not.toContain('shadow-rose-500/40');
    });
  });

  // =========================================================================
  // FACET 3: Tactile Toy Buttons & Accessibility Contract (Semantics & Defense)
  // =========================================================================
  describe('[TC-63.3/MSS][UC-IMP63] Facet 3: Tactile Toy Buttons & Accessibility Contract', () => {
    it('[TC-63.3/MSS] ActionDock duy trì aria-label="Thanh điều khiển tác vụ"', () => {
      const html = renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p1' }));
      expect(html).toContain('aria-label="Thanh điều khiển tác vụ"');
    });

    it('[TC-63.3/MSS] ActionDock duy trì nút đổ xúc xắc với aria-label="Đổ xúc xắc"', () => {
      const html = renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p1' }));
      expect(html).toContain('aria-label="Đổ xúc xắc"');
    });

    it('[TC-63.3/MSS] TopBar duy trì bộ đếm thời gian với role="timer"', () => {
      const html = renderToStaticMarkup(React.createElement(TopBar));
      expect(html).toContain('role="timer"');
    });

    it('[TC-63.3/MSS] TopBar duy trì nút đổi chu kỳ thời gian với data-testid="time-of-day-toggle-button"', () => {
      const html = renderToStaticMarkup(React.createElement(TopBar));
      expect(html).toContain('data-testid="time-of-day-toggle-button"');
    });

    it('[TC-63.3/MSS] SocialEmotesTray duy trì container với role="toolbar"', () => {
      const html = renderToStaticMarkup(React.createElement(SocialEmotesTray));
      expect(html).toContain('role="toolbar"');
    });

    it.each(SOCIAL_EMOTES)(
      '[TC-63.3/MSS] SocialEmotesTray duy trì icon biểu cảm "%s" kèm title chuẩn',
      (emote) => {
        const html = renderToStaticMarkup(React.createElement(SocialEmotesTray));
        expect(html).toContain(`title="${emote.label}"`);
        expect(html).toContain(emote.icon);
      }
    );
  });

  // =========================================================================
  // FACET 4: PreMatchDeck & Lobby Clean Tabletop Alignment (Disposal & Stability)
  // =========================================================================
  describe('[TC-63.4/MSS][UC-IMP63] Facet 4: PreMatchDeck & Lobby Clean Tabletop Alignment', () => {
    it('[TC-63.4/MSS] PreMatchDeck loại bỏ nền tối bg-[#0A1628]/80 của container chính', () => {
      const html = renderToStaticMarkup(
        React.createElement(PreMatchDeck, {
          roomCode: 'VT8888',
          isHost: true,
          slots: sampleLobbySlots,
        })
      );
      expect(html).not.toContain('bg-[#0A1628]/80');
    });

    it('[TC-63.4/MSS] PreMatchDeck loại bỏ lớp làm mờ nặng backdrop-blur-2xl của container chính', () => {
      const html = renderToStaticMarkup(
        React.createElement(PreMatchDeck, {
          roomCode: 'VT8888',
          isHost: true,
          slots: sampleLobbySlots,
        })
      );
      expect(html).not.toContain('backdrop-blur-2xl');
    });

    it('[TC-63.4/MSS] PlayerSlotCard slot trống loại bỏ nền tối bg-[#0A1628]/55', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerSlotCard, {
          slot: sampleEmptySlot,
          isHostViewer: true,
        })
      );
      expect(html).not.toContain('bg-[#0A1628]/55');
    });

    it('[TC-63.4/MSS] PlayerSlotCard slot trống loại bỏ badge nền tối bg-[#10233B]/80', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerSlotCard, {
          slot: sampleEmptySlot,
          isHostViewer: true,
        })
      );
      expect(html).not.toContain('bg-[#10233B]/80');
    });

    it('[TC-63.4/MSS] PlayerSlotCard slot có người loại bỏ dải màu nền tối bg-[#11233B]/80', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerSlotCard, {
          slot: sampleOccupiedSlot,
          isHostViewer: true,
        })
      );
      expect(html).not.toContain('bg-[#11233B]/80');
    });

    it('[TC-63.4/MSS] QrCodeCard loại bỏ khung nền đen tối bg-slate-900/90', () => {
      const html = renderToStaticMarkup(
        React.createElement(QrCodeCard, { roomCode: 'VT8888' })
      );
      expect(html).not.toContain('bg-slate-900/90');
    });

    it('[TC-63.4/MSS] PreMatchDeck loại bỏ data-testid="toggle-lobby-panel-btn" dư thừa', () => {
      const html = renderToStaticMarkup(
        React.createElement(PreMatchDeck, {
          roomCode: 'VT8888',
          isHost: true,
          slots: sampleLobbySlots,
        })
      );
      expect(html).not.toContain('data-testid="toggle-lobby-panel-btn"');
    });

    it('[TC-63.4/MSS] PreMatchDeck duy trì 100% data-testid="lobby-room-code"', () => {
      const html = renderToStaticMarkup(
        React.createElement(PreMatchDeck, {
          roomCode: 'VT8888',
          isHost: true,
          slots: sampleLobbySlots,
        })
      );
      expect(html).toContain('data-testid="lobby-room-code"');
    });

    it('[TC-63.4/MSS] PreMatchDeck duy trì 100% data-testid="start-game-btn"', () => {
      const html = renderToStaticMarkup(
        React.createElement(PreMatchDeck, {
          roomCode: 'VT8888',
          isHost: true,
          slots: sampleLobbySlots,
        })
      );
      expect(html).toContain('data-testid="start-game-btn"');
    });
  });
});
