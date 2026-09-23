// [TC-74/MSS][IMP-74] Contract Test Suite: Purge Leave Lobby CTA from PreMatchDeck
// Traceability: docs/epics/networking/_epic_ledger.md § IMP-74
import { describe, it, expect, beforeAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PreMatchDeck } from '../../src/client/ui/lobby/pre_match_deck';
import { createEmptySlot, BotPersonality, type LobbySlot } from '../../src/client/store/lobby_types';

const hostSlot: LobbySlot = {
  ...createEmptySlot(0),
  playerId: 'p1',
  playerName: 'Chủ Phòng VIP',
  isHost: true,
  isOccupied: true,
  isReady: true,
};

const guestSlot: LobbySlot = {
  ...createEmptySlot(1),
  playerId: 'p2',
  playerName: 'Khách VIP 2',
  isHost: false,
  isOccupied: true,
  isReady: true,
};

const botSlot1: LobbySlot = {
  ...createEmptySlot(2),
  playerId: 'bot_2',
  playerName: 'Bot Shark',
  isBot: true,
  isOccupied: true,
  isReady: true,
  botPersonality: BotPersonality.Aggressive,
};

const botSlot2: LobbySlot = {
  ...createEmptySlot(3),
  playerId: 'bot_3',
  playerName: 'Bot Guardian',
  isBot: true,
  isOccupied: true,
  isReady: true,
  botPersonality: BotPersonality.Passive,
};

const partialSlots: readonly LobbySlot[] = [
  hostSlot,
  { ...guestSlot, isReady: false },
  createEmptySlot(2),
  createEmptySlot(3),
];

const allReadySlots: readonly LobbySlot[] = [
  hostSlot,
  guestSlot,
  botSlot1,
  botSlot2,
];

describe('[TC-74/MSS][IMP-74] Purge Leave Lobby Button Contract Suite', () => {
  let hostMarkup = '';
  let guestMarkup = '';
  let fullReadyMarkup = '';
  let customRoomMarkup = '';

  beforeAll(() => {
    hostMarkup = renderToStaticMarkup(
      React.createElement(PreMatchDeck, { isHost: true, roomCode: 'VT7401', slots: partialSlots })
    );

    guestMarkup = renderToStaticMarkup(
      React.createElement(PreMatchDeck, { isHost: false, roomCode: 'VT7402', slots: partialSlots })
    );

    fullReadyMarkup = renderToStaticMarkup(
      React.createElement(PreMatchDeck, { isHost: true, roomCode: 'VT7403', slots: allReadySlots })
    );

    customRoomMarkup = renderToStaticMarkup(
      React.createElement(PreMatchDeck, { isHost: true, roomCode: 'VT9999', slots: partialSlots })
    );
  });

  // =========================================================================
  // FACET 1: PURGE OF LEAVE LOBBY CTA
  // =========================================================================
  describe('Facet 1: Purge of Leave Lobby CTA', () => {
    it('[TC-74.01/MSS][IMP-74] PreMatchDeck completely purges data-testid="leave-lobby-btn" attribute in host mode', () => {
      expect(hostMarkup).not.toContain('data-testid="leave-lobby-btn"');
    });

    it('[TC-74.02/MSS][IMP-74] PreMatchDeck purges Vietnamese label "Rời Sảnh" in host mode', () => {
      expect(hostMarkup).not.toContain('Rời Sảnh');
    });

    it('[TC-74.03/MSS][IMP-74] PreMatchDeck purges legacy Vietnamese label "Rời Phòng"', () => {
      expect(hostMarkup).not.toContain('Rời Phòng');
    });

    it('[TC-74.04/MSS][IMP-74] PreMatchDeck purges leave lobby accessibility aria-label', () => {
      expect(hostMarkup).not.toContain('aria-label="Rời sảnh chờ"');
    });
  });

  // =========================================================================
  // FACET 2: PRESERVATION OF ESSENTIAL HEADER & DECK CONTROLS
  // =========================================================================
  describe('Facet 2: Preservation of Essential Header Controls', () => {
    it('[TC-74.05/MSS][IMP-74] PreMatchDeck purges data-testid="toggle-lobby-panel-btn" to simplify lobby UX', () => {
      expect(hostMarkup).not.toContain('data-testid="toggle-lobby-panel-btn"');
    });

    it('[TC-74.06/MSS][IMP-74] PreMatchDeck purges data-testid="reset-camera-btn" to remove redundant lobby control', () => {
      expect(hostMarkup).not.toContain('data-testid="reset-camera-btn"');
    });

    it('[TC-74.07/MSS][IMP-74] PreMatchDeck preserves data-testid="lobby-mute-toggle-button" for audio toggling', () => {
      expect(hostMarkup).toContain('data-testid="lobby-mute-toggle-button"');
    });

    it('[TC-74.08/MSS][IMP-74] PreMatchDeck preserves data-testid="open-game-rules-btn" for rules modal launch', () => {
      expect(hostMarkup).toContain('data-testid="open-game-rules-btn"');
    });

    it('[TC-74.09/MSS][IMP-74] PreMatchDeck preserves data-testid="copy-room-code-btn" for code sharing', () => {
      expect(hostMarkup).toContain('data-testid="copy-room-code-btn"');
    });

    it('[TC-74.10/MSS][IMP-74] PreMatchDeck renders primary data-testid="start-game-btn" in host mode', () => {
      expect(hostMarkup).toContain('data-testid="start-game-btn"');
    });
  });

  // =========================================================================
  // FACET 3: CLEAN HEADER TITLE & STATUS BADGE ALIGNMENT
  // =========================================================================
  describe('Facet 3: Clean Header Title & Badge Alignment', () => {
    it('[TC-74.11/MSS][IMP-74] PreMatchDeck header displays tropical island icon "🏝️"', () => {
      expect(hostMarkup).toContain('🏝️');
    });

    it('[TC-74.12/MSS][IMP-74] PreMatchDeck header displays title "Sảnh Chờ"', () => {
      expect(hostMarkup).toContain('Sảnh Chờ');
    });

    it('[TC-74.13/MSS][IMP-74] PreMatchDeck displays partial waiting badge "ĐANG CHỜ (2/4)"', () => {
      expect(hostMarkup).toContain('ĐANG CHỜ (2/4)');
    });

    it('[TC-74.14/MSS][IMP-74] PreMatchDeck displays full ready badge "SẴN SÀNG (4/4)" when all slots ready', () => {
      expect(fullReadyMarkup).toContain('SẴN SÀNG (4/4)');
    });
  });

  // =========================================================================
  // FACET 4: SAFETY & EDGE CASES (GUEST MODE & CONSISTENCY)
  // =========================================================================
  describe('Facet 4: Safety & Edge Cases', () => {
    it('[TC-74.15/MSS][IMP-74] Guest mode purges data-testid="leave-lobby-btn"', () => {
      expect(guestMarkup).not.toContain('data-testid="leave-lobby-btn"');
    });

    it('[TC-74.16/MSS][IMP-74] Guest mode purges Vietnamese label "Rời Sảnh"', () => {
      expect(guestMarkup).not.toContain('Rời Sảnh');
    });

    it('[TC-74.17/MSS][IMP-74] Guest mode renders data-testid="toggle-ready-btn" instead of start-game-btn', () => {
      expect(guestMarkup).toContain('data-testid="toggle-ready-btn"');
      expect(guestMarkup).not.toContain('data-testid="start-game-btn"');
    });

    it('[TC-74.18/MSS][IMP-74] Custom roomCode VT9999 renders cleanly without leave-lobby-btn', () => {
      expect(customRoomMarkup).toContain('VT9999');
      expect(customRoomMarkup).not.toContain('data-testid="leave-lobby-btn"');
    });
  });
});
