// [TC-290.01/MSS..TC-290.08/MSS][UC-IMP290] IMP-290 Synchronize Diplomatic Card Notification Contract Suite
// Strict Iron Laws Conformance: Zero dirty casts, 1-4 asserts per test, living tests <= 600 LOC.
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  useGameStore,
  type GameState,
  type PlayerHudInfo,
  type FloatingTextItem,
  FloatingTextType,
} from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import {
  handleDiplomaticEventBadge,
  clearPendingBadgeTimers,
} from '../../src/client/network/activity_badge_dispatcher.js';
import { resolveTransactionNarrative } from '../../src/client/ui/transaction_narrative.js';
import { FloatingBadge } from '../../src/client/ui/floating_numbers.js';

function createMockGameState(overrides?: Partial<GameState>): GameState {
  const base = useGameStore.getState();
  return {
    ...base,
    ...overrides,
  };
}

const mockTenant: PlayerHudInfo = {
  id: 'bot_1',
  name: 'bot_1',
  balance: 10_000,
  tokenColor: '#38BDF8',
  ownedProperties: [],
};

const mockLandlord: PlayerHudInfo = {
  id: 'bot_2',
  name: 'bot_2',
  balance: 10_000,
  tokenColor: '#F59E0B',
  ownedProperties: [14],
};

const mockPlayersInfo: Record<string, PlayerHudInfo> = {
  bot_1: mockTenant,
  bot_2: mockLandlord,
};

describe('[TC-290.01/MSS..TC-290.08/MSS][UC-IMP290] IMP-290 Synchronize Diplomatic Card Notification Contract Suite', () => {
  beforeEach(() => {
    clearPendingBadgeTimers();
    useGameStore.setState({
      floatingTexts: [],
      playersInfo: mockPlayersInfo,
      activeModal: null,
    });
    useLobbyStore.setState({
      myPlayerId: 'bot_1',
    });
  });

  // --------------------------------------------------------------------------
  // TC-290.01 [UC-IMP290/MSS]: Tenant Event Badge Generation
  // --------------------------------------------------------------------------
  it('[TC-290.01/MSS][UC-IMP290] Given diplomatic event for tenant, When handleDiplomaticEventBadge is called, Then tenant badge is emitted with text "6.000 Tr." without plus sign and actionType "diplomatic"', () => {
    const emittedBadges: FloatingTextItem[] = [];
    const mockState = createMockGameState({
      playersInfo: mockPlayersInfo,
      addFloatingText: (item) => {
        emittedBadges.push({
          id: `ft-${emittedBadges.length}`,
          timestamp: Date.now(),
          ...item,
        });
      },
    });

    handleDiplomaticEventBadge(
      { playerId: 'bot_1', landlordId: 'bot_2', cellIndex: 14, savedRent: 6000 },
      mockState
    );

    const tenantBadge = emittedBadges.find((b) => b.playerId === 'bot_1');
    expect(tenantBadge?.text).toBe('6.000 Tr.');
    expect(tenantBadge?.text.startsWith('+')).toBe(false);
    expect(tenantBadge?.cellIndex).toBe(14);
    expect(tenantBadge?.actionType).toBe('diplomatic');
  });

  // --------------------------------------------------------------------------
  // TC-290.02 [UC-IMP290/MSS]: Landlord Event Badge Generation
  // --------------------------------------------------------------------------
  it('[TC-290.02/MSS][UC-IMP290] Given diplomatic event for landlord, When handleDiplomaticEventBadge is called, Then landlord badge is emitted with text "-6.000 Tr." and type FloatingTextType.Penalty', () => {
    const emittedBadges: FloatingTextItem[] = [];
    const mockState = createMockGameState({
      playersInfo: mockPlayersInfo,
      addFloatingText: (item) => {
        emittedBadges.push({
          id: `ft-${emittedBadges.length}`,
          timestamp: Date.now(),
          ...item,
        });
      },
    });

    handleDiplomaticEventBadge(
      { playerId: 'bot_1', landlordId: 'bot_2', cellIndex: 14, savedRent: 6000 },
      mockState
    );

    const landlordBadge = emittedBadges.find((b) => b.playerId === 'bot_2');
    expect(landlordBadge?.text).toBe('-6.000 Tr.');
    expect(landlordBadge?.type).toBe(FloatingTextType.Penalty);
    expect(landlordBadge?.cellIndex).toBe(14);
    expect(landlordBadge?.actionType).toBe('diplomatic');
  });

  // --------------------------------------------------------------------------
  // TC-290.03 [UC-IMP290/MSS]: Tenant Narrative Phrasing
  // --------------------------------------------------------------------------
  it('[TC-290.03/MSS][UC-IMP290] Given tenant floating item and player info, When resolveTransactionNarrative is executed, Then narrative returns verb "được miễn" and target containing "tiền thuê Khánh Hòa" and "của bot_2"', () => {
    const tenantItem: FloatingTextItem = {
      id: 'ft_tenant',
      text: '6.000 Tr.',
      type: FloatingTextType.Reward,
      playerId: 'bot_1',
      targetPlayerId: 'bot_2',
      targetPlayerName: 'bot_2',
      actionType: 'diplomatic',
      cellIndex: 14,
      title: 'Miễn Trừ Ngoại Giao',
      timestamp: Date.now(),
    };

    const narrative = resolveTransactionNarrative(tenantItem, mockTenant, mockPlayersInfo, 'bot_1');
    expect(narrative.verb).toBe('được miễn');
    expect(narrative.target).toContain('tiền thuê Khánh Hòa');
    expect(narrative.target).toContain('của bot_2');
    expect(narrative.isPositive).toBe(true);
  });

  // --------------------------------------------------------------------------
  // TC-290.04 [UC-IMP290/MSS]: Landlord Narrative Phrasing
  // --------------------------------------------------------------------------
  it('[TC-290.04/MSS][UC-IMP290] Given landlord floating item and player info, When resolveTransactionNarrative is executed, Then narrative returns verb "miễn thu" and target containing "tiền thuê Khánh Hòa" and "cho bot_1"', () => {
    const landlordItem: FloatingTextItem = {
      id: 'ft_landlord',
      text: '-6.000 Tr.',
      type: FloatingTextType.Penalty,
      playerId: 'bot_2',
      targetPlayerId: 'bot_1',
      targetPlayerName: 'bot_1',
      actionType: 'diplomatic',
      cellIndex: 14,
      title: 'bot_1 dùng Thẻ Ngoại Giao',
      timestamp: Date.now(),
    };

    const narrative = resolveTransactionNarrative(landlordItem, mockLandlord, mockPlayersInfo, 'bot_2');
    expect(narrative.verb).toBe('miễn thu');
    expect(narrative.target).toContain('tiền thuê Khánh Hòa');
    expect(narrative.target).toContain('cho bot_1');
    expect(narrative.isPositive).toBe(false);
  });

  // --------------------------------------------------------------------------
  // TC-290.05 [UC-IMP290/MSS]: Tenant Amount Pill Protective Color Styling
  // --------------------------------------------------------------------------
  it('[TC-290.05/MSS][UC-IMP290] Given tenant diplomatic item, When FloatingBadge is rendered, Then amount pill container contains text-sky-700 and bg-sky-50 protective styling', () => {
    const tenantItem: FloatingTextItem = {
      id: 'ft_tenant_badge',
      text: '6.000 Tr.',
      type: FloatingTextType.Reward,
      playerId: 'bot_1',
      targetPlayerId: 'bot_2',
      targetPlayerName: 'bot_2',
      actionType: 'diplomatic',
      cellIndex: 14,
      title: 'Miễn Trừ Ngoại Giao',
      timestamp: Date.now(),
    };

    const html = renderToStaticMarkup(React.createElement(FloatingBadge, { item: tenantItem }));
    expect(html).toContain('text-sky-700');
    expect(html).toContain('bg-sky-50');
    expect(html).not.toContain('text-emerald-700');
  });

  // --------------------------------------------------------------------------
  // TC-290.06 [UC-IMP290/MSS]: Leading Plus Sign Stripping for Diplomatic Pill
  // --------------------------------------------------------------------------
  it('[TC-290.06/MSS][UC-IMP290] Given legacy diplomatic item with leading plus in text, When FloatingBadge is rendered, Then amount pill text strips leading plus sign', () => {
    const legacyItem: FloatingTextItem = {
      id: 'ft_legacy_dip',
      text: '+6.000 Tr.',
      type: FloatingTextType.Reward,
      playerId: 'bot_1',
      targetPlayerId: 'bot_2',
      targetPlayerName: 'bot_2',
      actionType: 'diplomatic',
      cellIndex: 14,
      title: 'Miễn Trừ Ngoại Giao',
      timestamp: Date.now(),
    };

    const html = renderToStaticMarkup(React.createElement(FloatingBadge, { item: legacyItem }));
    const pillMatch = html.match(/data-testid="floating-amount-pill"[^>]*>([^<]+)<\/span>/);
    const pillText = pillMatch?.[1]?.trim() ?? '';

    expect(pillText).toBe('6.000 Tr.');
    expect(pillText.startsWith('+')).toBe(false);
  });

  // --------------------------------------------------------------------------
  // TC-290.07 [UC-IMP290/MSS]: Tenant Formula Consistency
  // --------------------------------------------------------------------------
  it('[TC-290.07/MSS][UC-IMP290] Given tenant diplomatic item, When FloatingBadge formula is checked, Then formula text renders "Đặc quyền ngoại giao: Miễn 100% tiền thuê BĐS"', () => {
    const tenantItem: FloatingTextItem = {
      id: 'ft_formula_tenant',
      text: '6.000 Tr.',
      type: FloatingTextType.Reward,
      playerId: 'bot_1',
      targetPlayerId: 'bot_2',
      targetPlayerName: 'bot_2',
      actionType: 'diplomatic',
      cellIndex: 14,
      title: 'Miễn Trừ Ngoại Giao',
      timestamp: Date.now(),
    };

    const html = renderToStaticMarkup(React.createElement(FloatingBadge, { item: tenantItem }));
    const formulaMatch = html.match(/data-testid="transaction-formula-line"[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/);
    const formulaText = formulaMatch?.[1]?.trim() ?? '';

    expect(formulaText).toBe('Đặc quyền ngoại giao: Miễn 100% tiền thuê BĐS');
    expect(html).toContain('data-testid="transaction-formula-line"');
  });

  // --------------------------------------------------------------------------
  // TC-290.08 [UC-IMP290/MSS]: Landlord Formula Consistency
  // --------------------------------------------------------------------------
  it('[TC-290.08/MSS][UC-IMP290] Given landlord diplomatic item, When FloatingBadge formula is checked, Then formula text renders "Khách dùng Thẻ Ngoại Giao: Hụt thu tiền thuê"', () => {
    const landlordItem: FloatingTextItem = {
      id: 'ft_formula_landlord',
      text: '-6.000 Tr.',
      type: FloatingTextType.Penalty,
      playerId: 'bot_2',
      targetPlayerId: 'bot_1',
      targetPlayerName: 'bot_1',
      actionType: 'diplomatic',
      cellIndex: 14,
      title: 'bot_1 dùng Thẻ Ngoại Giao',
      timestamp: Date.now(),
    };

    const html = renderToStaticMarkup(React.createElement(FloatingBadge, { item: landlordItem }));
    const formulaMatch = html.match(/data-testid="transaction-formula-line"[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/);
    const formulaText = formulaMatch?.[1]?.trim() ?? '';

    expect(formulaText).toBe('Khách dùng Thẻ Ngoại Giao: Hụt thu tiền thuê');
    expect(html).toContain('data-testid="transaction-formula-line"');
  });
});
