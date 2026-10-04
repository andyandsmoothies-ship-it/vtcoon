// [TC-IMP252.01..28][UC-IMP252] Financial Notification De-duplication Contract Suite
// Facet 1: groupId lifecycle in store (01..03)
// Facet 2: dispatcher groupId tagging (04..06, 26..28)
// Facet 3: local-player perspective de-duplication (07..09, 16..24)
// Facet 4: mobile/desktop card display (10..12)
// Facet 5: bankrupt milestone and pass-through (13..15, 25)

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  useGameStore,
  FloatingTextType,
  EVENT_BANNER_DURATION_MS,
  type FloatingTextItem,
} from '../../src/client/store/game_store';
import { useLobbyStore } from '../../src/client/store/lobby_store';
import type { ActivityLogEntry } from '../../src/client/store/activity_store';
import { FloatingNumbersOverlay } from '../../src/client/ui/floating_numbers';
import {
  handleRentBadge,
  handleTradeBadge,
  handleDiplomaticEventBadge,
  dispatchActivityFloatingBadges,
  clearPendingBadgeTimers,
} from '../../src/client/network/activity_badge_dispatcher';
import { deduplicateFloatingTexts as dedup } from '../../src/client/ui/notification_deduplicator';

/** Splits overlay markup into per-card wrapper segments (wrapper div opens with class="w-full "), banner excluded. */
function cardWrappers(html: string): string[] {
  return html.split('class="w-full ').slice(1).filter((w) => w.includes('contextual-transaction-badge'));
}

function makeItem(id: string, playerId: string, type: FloatingTextType, extra: Partial<FloatingTextItem> = {}): FloatingTextItem {
  return { id, text: id, type, playerId, timestamp: 0, durationMs: 3600, ...extra };
}

function seedPlayers(): void {
  useGameStore.setState({
    playersInfo: {
      p1: { id: 'p1', name: 'Andy', balance: 1500, tokenColor: '#f00', ownedProperties: [] },
      p2: { id: 'p2', name: 'Bob', balance: 1500, tokenColor: '#0f0', ownedProperties: [] },
    },
    floatingTexts: [],
    activeModal: null,
    pendingPawnMove: null,
    isRolling: false,
  });
}

function rentAct(): ActivityLogEntry {
  return {
    id: 'rent_act_1', type: 'rent', message: 'Andy trả Bob', timestamp: 1,
    playerId: 'p1', playerName: 'Andy', targetPlayerId: 'p2', targetPlayerName: 'Bob', amount: 1000, cellIndex: 3,
  };
}

function maBuyoutAct(): ActivityLogEntry {
  return {
    id: 'ma_buyout_1', type: 'card', message: 'Thâu tóm từ Bob', timestamp: 1,
    playerId: 'p1', playerName: 'Andy', amount: -500, cellIndex: 5,
  };
}

function diploEvent(): { playerId: string; landlordId: string; cellIndex: number; savedRent: number } {
  return { playerId: 'p1', landlordId: 'p2', cellIndex: 3, savedRent: 100 };
}

function renderOverlay(): string {
  return renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
}

describe('IMP-252 Financial Notification De-duplication', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    seedPlayers();
    useLobbyStore.setState({ myPlayerId: 'p1' });
  });

  afterEach(() => {
    clearPendingBadgeTimers();
    vi.useRealTimers();
  });

  describe('Facet 1: groupId lifecycle', () => {
    it('[UC-IMP252/MSS] TC-IMP252.01 addFloatingText preserves groupId', () => {
      useGameStore.getState().addFloatingText({ text: 'a', type: FloatingTextType.Reward, playerId: 'p1', groupId: 'g1' });
      expect(useGameStore.getState().floatingTexts.map((t) => t.groupId)).toEqual(['g1']);
    });

    it('[UC-IMP252/MSS] TC-IMP252.02 removeFloatingText removes every card in the same group', () => {
      const s = useGameStore.getState();
      s.addFloatingText({ text: 'a', type: FloatingTextType.Penalty, playerId: 'p1', groupId: 'g1' });
      s.addFloatingText({ text: 'b', type: FloatingTextType.Reward, playerId: 'p2', groupId: 'g1' });
      const firstId = useGameStore.getState().floatingTexts[0]!.id;
      useGameStore.getState().removeFloatingText(firstId);
      expect(useGameStore.getState().floatingTexts, JSON.stringify(useGameStore.getState().floatingTexts)).toHaveLength(0);
    });

    it('[UC-IMP252/A1] TC-IMP252.03 removing an ungrouped card keeps other cards', () => {
      const s = useGameStore.getState();
      s.addFloatingText({ text: 'a', type: FloatingTextType.Reward, playerId: 'p1' });
      s.addFloatingText({ text: 'b', type: FloatingTextType.Reward, playerId: 'p2' });
      const firstId = useGameStore.getState().floatingTexts[0]!.id;
      useGameStore.getState().removeFloatingText(firstId);
      expect(useGameStore.getState().floatingTexts.map((t) => t.text)).toEqual(['b']);
    });
  });

  describe('Facet 2: dispatcher groupId tagging', () => {
    it('[UC-IMP252/MSS] TC-IMP252.04 rent pay and receive share one groupId', () => {
      handleRentBadge(rentAct(), useGameStore.getState());
      vi.advanceTimersByTime(1000);
      const rentTexts = useGameStore.getState().floatingTexts.filter((t) => t.actionType?.startsWith('rent_'));
      expect(rentTexts.length).toBe(2);
      expect(rentTexts[0]!.groupId, JSON.stringify(rentTexts)).toBeTruthy();
      expect(rentTexts[0]!.groupId).toBe(rentTexts[1]!.groupId);
    });

    it('[UC-IMP252/MSS] TC-IMP252.05 M&A buyout cards share one groupId', () => {
      dispatchActivityFloatingBadges([maBuyoutAct()], useGameStore.getState());
      const texts = useGameStore.getState().floatingTexts.filter((t) => t.actionType === 'ma_buyout');
      expect(texts.length).toBe(2);
      expect(texts[0]!.groupId, JSON.stringify(texts)).toBeTruthy();
      expect(texts[0]!.groupId).toBe(texts[1]!.groupId);
    });

    it('[UC-IMP252/MSS] TC-IMP252.26 M&A buyout cards carry the counterparty targetPlayerId', () => {
      dispatchActivityFloatingBadges([maBuyoutAct()], useGameStore.getState());
      const texts = useGameStore.getState().floatingTexts.filter((t) => t.actionType === 'ma_buyout');
      expect(texts.find((t) => t.playerId === 'p1')?.targetPlayerId, JSON.stringify(texts)).toBe('p2');
      expect(texts.find((t) => t.playerId === 'p2')?.targetPlayerId).toBe('p1');
    });

    it('[UC-IMP252/MSS] TC-IMP252.06 trade pair shares one groupId', () => {
      const trade: ActivityLogEntry = {
        id: 'trade_1', type: 'trade', message: 'trade', timestamp: 1,
        playerId: 'p1', playerName: 'Andy', targetPlayerId: 'p2', targetPlayerName: 'Bob', cellIndex: 3,
      };
      handleTradeBadge(trade, useGameStore.getState());
      const tradeTexts = useGameStore.getState().floatingTexts.filter((t) => t.actionType === 'trade');
      expect(tradeTexts.length).toBe(2);
      expect(tradeTexts[0]!.groupId, JSON.stringify(tradeTexts)).toBeTruthy();
      expect(tradeTexts[0]!.groupId).toBe(tradeTexts[1]!.groupId);
    });

    it('[UC-IMP252/MSS] TC-IMP252.27 diplomatic pair shares one groupId', () => {
      handleDiplomaticEventBadge(diploEvent(), useGameStore.getState());
      const diplo = useGameStore.getState().floatingTexts.filter((t) => t.actionType === 'diplomatic');
      expect(diplo.length).toBe(2);
      expect(diplo[0]!.groupId, JSON.stringify(diplo)).toBeTruthy();
      expect(diplo[0]!.groupId).toBe(diplo[1]!.groupId);
    });

    it('[UC-IMP252/MSS] TC-IMP252.28 diplomatic events at different times get different groupIds', () => {
      handleDiplomaticEventBadge(diploEvent(), useGameStore.getState());
      vi.advanceTimersByTime(10);
      handleDiplomaticEventBadge(diploEvent(), useGameStore.getState());
      const diplo = useGameStore.getState().floatingTexts.filter((t) => t.actionType === 'diplomatic');
      expect(diplo.length).toBe(4);
      expect(diplo[0]!.groupId, JSON.stringify(diplo)).toBeTruthy();
      expect(diplo[0]!.groupId).not.toBe(diplo[2]!.groupId);
    });
  });

  describe('Facet 3: local player perspective', () => {
    it('[UC-IMP252/MSS] TC-IMP252.07 keeps only my card when I pay', () => {
      const items = [
        makeItem('a', 'p1', FloatingTextType.Penalty, { groupId: 'g' }),
        makeItem('b', 'p2', FloatingTextType.Reward, { groupId: 'g' }),
      ];
      expect(dedup(items, 'p1').map((t) => t.id)).toEqual(['a']);
    });

    it('[UC-IMP252/MSS] TC-IMP252.08 keeps only my card when I receive', () => {
      const items = [
        makeItem('a', 'p2', FloatingTextType.Penalty, { groupId: 'g' }),
        makeItem('b', 'p1', FloatingTextType.Reward, { groupId: 'g' }),
      ];
      expect(dedup(items, 'p1').map((t) => t.id)).toEqual(['b']);
    });

    it('[UC-IMP252/MSS] TC-IMP252.09 between two bots keeps the Penalty card only', () => {
      const items = [
        makeItem('a', 'p2', FloatingTextType.Reward, { groupId: 'g' }),
        makeItem('b', 'p3', FloatingTextType.Penalty, { groupId: 'g' }),
      ];
      expect(dedup(items, 'p1').map((t) => t.id)).toEqual(['b']);
    });
  });

  describe('Facet 4: card display', () => {
    it('[UC-IMP252/MSS] TC-IMP252.10 with a banner the older regular card is hidden on mobile, newest stays visible', () => {
      useGameStore.setState({
        floatingTexts: [
          makeItem('m', 'p1', FloatingTextType.Reward, { actionType: 'chance', title: 'BANNERCARD' }),
          makeItem('r1', 'p2', FloatingTextType.Penalty, { actionType: 'tax', title: 'OLDCARD' }),
          makeItem('r2', 'p2', FloatingTextType.Penalty, { actionType: 'tax', title: 'NEWCARD' }),
        ],
      });
      const html = renderOverlay();
      const wrappers = cardWrappers(html);
      const oldWrapper = wrappers.find((w) => w.includes('OLDCARD'));
      const newWrapper = wrappers.find((w) => w.includes('NEWCARD'));
      expect(wrappers, html).toHaveLength(2);
      expect(oldWrapper?.startsWith('justify-start sm:justify-center hidden md:flex"'), String(oldWrapper)).toBe(true);
      expect(newWrapper?.startsWith('flex justify-start sm:justify-center"'), String(newWrapper)).toBe(true);
    });

    it('[UC-IMP252/MSS] TC-IMP252.11 without a banner no regular card is hidden', () => {
      useGameStore.setState({
        floatingTexts: [
          makeItem('r1', 'p2', FloatingTextType.Penalty, { actionType: 'tax', title: 'OLDCARD' }),
          makeItem('r2', 'p2', FloatingTextType.Penalty, { actionType: 'tax', title: 'NEWCARD' }),
        ],
      });
      const html = renderOverlay();
      expect(cardWrappers(html), html).toHaveLength(2);
      expect(html).not.toContain('hidden md:flex');
    });

    it('[UC-IMP252/MSS] TC-IMP252.12 two consecutive own cards keep chronological order', () => {
      useGameStore.setState({
        floatingTexts: [
          makeItem('r1', 'p1', FloatingTextType.Reward, { actionType: 'tax', title: 'FIRSTCARD' }),
          makeItem('r2', 'p1', FloatingTextType.Reward, { actionType: 'tax', title: 'SECONDCARD' }),
        ],
      });
      const html = renderOverlay();
      expect(html.indexOf('FIRSTCARD'), html).toBeGreaterThan(-1);
      expect(html.indexOf('FIRSTCARD')).toBeLessThan(html.indexOf('SECONDCARD'));
    });
  });

  describe('Facet 5: bankrupt milestone and pass-through', () => {
    it('[UC-IMP252/MSS] TC-IMP252.13 bankrupt renders as milestone banner, not a regular card', () => {
      useGameStore.setState({
        floatingTexts: [makeItem('b', 'p2', FloatingTextType.Penalty, { actionType: 'bankrupt', title: 'BANKRUPTTITLE' })],
      });
      const html = renderOverlay();
      expect(html).toContain('data-testid="milestone-banner-container"');
      expect(cardWrappers(html), html).toHaveLength(0);
    });

    it('[UC-IMP252/MSS] TC-IMP252.14 bankrupt cards last EVENT_BANNER_DURATION_MS', () => {
      useGameStore.getState().addFloatingText({
        text: 'x', type: FloatingTextType.Penalty, playerId: 'p2', actionType: 'bankrupt',
      });
      expect(useGameStore.getState().floatingTexts[0]!.durationMs).toBe(EVENT_BANNER_DURATION_MS);
    });

    it('[UC-IMP252/A2] TC-IMP252.15 ungrouped cards pass through in order and count', () => {
      const items = [
        makeItem('buy', 'p1', FloatingTextType.Penalty, { actionType: 'buy' }),
        makeItem('tax', 'p1', FloatingTextType.Penalty, { actionType: 'tax' }),
        makeItem('sal', 'p2', FloatingTextType.Reward, { actionType: 'salary' }),
      ];
      expect(dedup(items, 'p1').map((t) => t.id)).toEqual(['buy', 'tax', 'sal']);
    });
  });

  describe('Facet 6: end-to-end lifecycle and ordering', () => {
    it('[UC-IMP252/MSS] TC-IMP252.16 overlay renders one card for a reciprocal rent pair seen by the payer', () => {
      useGameStore.setState({
        floatingTexts: [
          makeItem('a', 'p1', FloatingTextType.Penalty, { actionType: 'rent_pay', text: 'PAYTXT', groupId: 'g' }),
          makeItem('b', 'p2', FloatingTextType.Reward, { actionType: 'rent_receive', text: 'RECVTXT', groupId: 'g' }),
        ],
      });
      const html = renderOverlay();
      expect(cardWrappers(html), html).toHaveLength(1);
      expect(html).toContain('PAYTXT');
      expect(html).not.toContain('RECVTXT');
    });

    it('[UC-IMP252/MSS] TC-IMP252.17 expiry of the short-lived card removes its longer-lived partner', () => {
      const s = useGameStore.getState();
      s.addFloatingText({ text: 'a', type: FloatingTextType.Penalty, playerId: 'p1', groupId: 'g', durationMs: 1000 });
      s.addFloatingText({ text: 'b', type: FloatingTextType.Reward, playerId: 'p2', groupId: 'g', durationMs: 9000 });
      vi.advanceTimersByTime(1000);
      expect(useGameStore.getState().floatingTexts, JSON.stringify(useGameStore.getState().floatingTexts)).toEqual([]);
    });

    it('[UC-IMP252/MSS] TC-IMP252.18 removing a grouped card keeps cards of other groups', () => {
      const s = useGameStore.getState();
      s.addFloatingText({ text: 'a', type: FloatingTextType.Penalty, playerId: 'p1', groupId: 'g1' });
      s.addFloatingText({ text: 'b', type: FloatingTextType.Reward, playerId: 'p2', groupId: 'g1' });
      s.addFloatingText({ text: 'c', type: FloatingTextType.Reward, playerId: 'p1', groupId: 'g2' });
      useGameStore.getState().removeFloatingText(useGameStore.getState().floatingTexts[0]!.id);
      expect(useGameStore.getState().floatingTexts.map((t) => t.text)).toEqual(['c']);
    });

    it('[UC-IMP252/MSS] TC-IMP252.19 two rents with different activity ids get different groupIds', () => {
      handleRentBadge(rentAct(), useGameStore.getState());
      handleRentBadge({ ...rentAct(), id: 'rent_act_2' }, useGameStore.getState());
      vi.advanceTimersByTime(1000);
      const ids = useGameStore.getState().floatingTexts.filter((t) => t.actionType === 'rent_pay').map((t) => t.groupId);
      expect(ids.length).toBe(2);
      expect(ids[0], JSON.stringify(ids)).toBeTruthy();
      expect(ids[0]).not.toBe(ids[1]);
    });

    it('[UC-IMP252/MSS] TC-IMP252.20 dedup keeps position of the surviving card among ungrouped cards', () => {
      const items = [
        makeItem('x', 'p1', FloatingTextType.Penalty, { actionType: 'tax' }),
        makeItem('a', 'p2', FloatingTextType.Reward, { groupId: 'g' }),
        makeItem('b', 'p1', FloatingTextType.Penalty, { groupId: 'g' }),
        makeItem('y', 'p2', FloatingTextType.Reward, { actionType: 'salary' }),
      ];
      expect(dedup(items, 'p1').map((t) => t.id)).toEqual(['x', 'b', 'y']);
    });

    it('[UC-IMP252/A1] TC-IMP252.21 dedup without a local player keeps the Penalty card', () => {
      const items = [
        makeItem('a', 'p2', FloatingTextType.Reward, { groupId: 'g' }),
        makeItem('b', 'p1', FloatingTextType.Penalty, { groupId: 'g' }),
      ];
      expect(dedup(items, null).map((t) => t.id)).toEqual(['b']);
    });

    it('[UC-IMP252/A1] TC-IMP252.22 dedup does not mutate its input', () => {
      const items = [
        makeItem('a', 'p1', FloatingTextType.Penalty, { groupId: 'g' }),
        makeItem('b', 'p2', FloatingTextType.Reward, { groupId: 'g' }),
      ];
      dedup(items, 'p1');
      expect(items.map((t) => t.id)).toEqual(['a', 'b']);
    });

    it('[UC-IMP252/A1] TC-IMP252.23 dedup keeps a lone grouped card whose partner is gone', () => {
      const items = [makeItem('a', 'p2', FloatingTextType.Reward, { groupId: 'g' })];
      expect(dedup(items, 'p1').map((t) => t.id)).toEqual(['a']);
    });

    it('[UC-IMP252/MSS] TC-IMP252.24 own older card and opponent newer card are reordered so own is last', () => {
      useGameStore.setState({
        floatingTexts: [
          makeItem('r1', 'p1', FloatingTextType.Reward, { actionType: 'tax', title: 'MINECARD' }),
          makeItem('r2', 'p2', FloatingTextType.Penalty, { actionType: 'tax', title: 'OPPCARD' }),
        ],
      });
      const html = renderOverlay();
      expect(html.indexOf('OPPCARD'), html).toBeGreaterThan(-1);
      expect(html.indexOf('OPPCARD')).toBeLessThan(html.indexOf('MINECARD'));
    });

    it('[UC-IMP252/A2] TC-IMP252.25 non-bankrupt non-milestone cards keep the transaction popup duration', () => {
      useGameStore.getState().addFloatingText({ text: 'x', type: FloatingTextType.Penalty, playerId: 'p2', actionType: 'tax' });
      expect(useGameStore.getState().floatingTexts[0]!.durationMs).toBe(3600);
    });
  });
});
