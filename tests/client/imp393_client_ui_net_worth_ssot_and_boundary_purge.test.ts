// [CONTRACT TEST] IMP-393: Client UI Net Worth SSOT, Closed-Loop mortgageLoans Wire & 100% Boundary Purge
// Universal 5-Facet Behavioral Matrix & Adversarial Inversion Verification
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, beforeEach } from 'vitest';
import * as uiHelpers from '../../src/client/ui/ui_helpers.js';
import {
  LEVEL_MULTIPLIER,
  calculateCellNetWorth,
  type PropertyRegistry,
  type PropertyStateMap,
} from '../../src/domain/property_data.js';
import { TurnPhase, type Player, type Room } from '../../src/domain/room.js';
import type { PendingTradeOfferDelta } from '../../src/domain/protocol/index.js';
import { evaluatePlayerNetWorth } from '../../src/domain/bot/bot_posture.js';
import { calculateNetWorth } from '../../src/server/room_manager_queries.js';
import { buildDeltaFromRoom } from '../../src/server/delta_mapper.js';
import { PendingTradeManager } from '../../src/server/pending_trade_manager.js';
import { buildSparseDelta, isPlayerEqual } from '../../src/server/network/delta_broadcaster.js';
import { applyDeltaToStore } from '../../src/client/network/apply_delta.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { PortfolioModalHost } from '../../src/client/ui/modals/hosts/portfolio_modal_host.js';
import { PropertyPortfolioModal } from '../../src/client/ui/modals/property_portfolio_modal.js';
import { resolvePlayerTradingCells } from '../../src/client/ui/player_card_helpers.js';
import {
  BOUNDARY_RULES,
  KNOWN_LEGACY_CLIENT_SERVER_VIOLATIONS,
} from '../../scripts/boundary_linter/boundary_constants.mjs';
import { lintFileBoundaries } from '../../scripts/boundary_linter/boundary_rules.mjs';

const REPO_ROOT = process.cwd();

interface BoundaryScanSummary {
  readonly serverImportCount: number;
  readonly protocolImportCount: number;
  readonly clientServerWarningCount: number;
  readonly strictErrorCount: number;
}

function inspectUiModuleBoundaries(relPaths: readonly string[]): BoundaryScanSummary {
  let serverImportCount = 0;
  let protocolImportCount = 0;
  let clientServerWarningCount = 0;
  let strictErrorCount = 0;

  for (const relPath of relPaths) {
    const absPath = path.resolve(REPO_ROOT, relPath);
    const content = fs.readFileSync(absPath, 'utf8');
    const sourceFile = ts.createSourceFile(absPath, content, ts.ScriptTarget.Latest, true);

    for (const stmt of sourceFile.statements) {
      if ((ts.isImportDeclaration(stmt) || ts.isExportDeclaration(stmt)) && stmt.moduleSpecifier && ts.isStringLiteral(stmt.moduleSpecifier)) {
        const spec = stmt.moduleSpecifier.text;
        if (spec.includes('server/')) {
          serverImportCount++;
        }
        if (spec.endsWith('domain/protocol/index.js') || spec.endsWith('domain/protocol')) {
          protocolImportCount++;
        }
      }
    }

    const defaultLint = lintFileBoundaries(absPath, content, REPO_ROOT, false);
    const strictLint = lintFileBoundaries(absPath, content, REPO_ROOT, true);
    clientServerWarningCount += defaultLint.warnings.filter(
      (w: { readonly rule: string }) => w.rule === BOUNDARY_RULES.CLIENT_IMPORTS_SERVER,
    ).length;
    strictErrorCount += strictLint.errors.length;
  }

  return {
    serverImportCount,
    protocolImportCount,
    clientServerWarningCount,
    strictErrorCount,
  };
}

function createFixturePlayer(id: string, overrides: Partial<Player> = {}): Player {
  return {
    id,
    position: 0,
    balance: 0,
    skipNextTurn: false,
    auditTurnsLeft: 0,
    consecutiveDoubles: 0,
    hand: [],
    pendingDebts: [],
    extraTurns: 0,
    doubleNextDice: false,
    mortgagedProperties: [],
    bankrupt: false,
    ...overrides,
  };
}

function createFixtureRoom(players: Player[]): Room {
  return {
    roomCode: 'R393',
    hostId: players[0]?.id ?? 'p1',
    players,
    currentPlayerIndex: 0,
    phase: TurnPhase.PropertyManagement,
    started: true,
    activeModifiers: [],
    marketDeck: [],
    marketDiscard: [],
    chanceDeck: [],
    chanceDiscard: [],
    permanentRentBonus: {},
    treasury: 10000,
    roundCount: 1,
  };
}

interface PortfolioModalSnapshot {
  readonly playerNetWorth?: number;
  readonly unmortgagedPropertiesCount?: number;
}

function extractPortfolioModalSnapshot(hostElement: React.ReactElement): PortfolioModalSnapshot {
  const hostProps: { readonly children?: React.ReactNode } = hostElement.props ?? {};
  const children = React.Children.toArray(hostProps.children);
  for (const child of children) {
    if (React.isValidElement(child) && child.type === PropertyPortfolioModal) {
      const modalProps: PortfolioModalSnapshot = child.props ?? {};
      return {
        playerNetWorth: modalProps.playerNetWorth,
        unmortgagedPropertiesCount: modalProps.unmortgagedPropertiesCount,
      };
    }
  }
  return {};
}

describe('[IMP-393] Client UI Net Worth SSOT, Closed-Loop mortgageLoans Wire & Boundary Purge Suite', () => {
  beforeEach(() => {
    useGameStore.getState().resetGameState?.();
  });

  it('TC-393.01 [UC-UI-NETWORTH-SSOT-MORTGAGE-CLAMP/MSS]: re-exports authoritative LEVEL_MULTIPLIER in ui_helpers and clamps mortgaged property level to 0 in calculatePlayerNetWorth', () => {
    const sharesLevelMultiplierRef =
      'LEVEL_MULTIPLIER' in uiHelpers && Reflect.get(uiHelpers, 'LEVEL_MULTIPLIER') === LEVEL_MULTIPLIER;
    const defaultMortgagedNetWorth = uiHelpers.calculatePlayerNetWorth(1000, [39], { 39: 2 }, [39]);
    const customLoanMortgagedNetWorth = uiHelpers.calculatePlayerNetWorth(
      1000,
      [39],
      { 39: 2 },
      [39],
      { 39: 2400 },
    );

    expect(sharesLevelMultiplierRef).toBe(true);
    expect(defaultMortgagedNetWorth).toBe(3000);
    expect(customLoanMortgagedNetWorth).toBe(2600);
    expect(calculateCellNetWorth(39, 2, true, 2400)).toBe(1600);
  });

  it('TC-393.02 [UC-UI-NETWORTH-TRILAYER-PARITY/MSS]: guarantees 1:1:1 net worth parity (7500) across Server calculateNetWorth, Bot evaluatePlayerNetWorth, and Client calculatePlayerNetWorth', () => {
    const p1 = createFixturePlayer('p1', {
      balance: 5000,
      ownedProperties: [1, 39],
      mortgagedProperties: [39],
      mortgageLoans: { 39: 2400 },
    });
    const registry: PropertyRegistry = new Map<number, string>([
      [1, 'p1'],
      [39, 'p1'],
    ]);
    const stateMap: PropertyStateMap = new Map([
      [1, { level: 1, isMortgaged: false }],
      [39, { level: 2, isMortgaged: true }],
    ]);

    const serverNW = calculateNetWorth('p1', registry, stateMap, [p1]);
    const botNW = evaluatePlayerNetWorth('p1', [p1], registry, stateMap);
    const clientNW = uiHelpers.calculatePlayerNetWorth(5000, [1, 39], { 1: 1, 39: 2 }, [39], { 39: 2400 });

    expect(serverNW).toBe(7500);
    expect(botNW).toBe(7500);
    expect(clientNW).toBe(7500);
    expect(clientNW).toBe(serverNW);
  });

  it('TC-393.03 [UC-UI-PORTFOLIO-HOST-WIRE-SYNC/MSS]: propagates 60% MC_URBAN_PLANNING mortgageLoans through buildDeltaFromRoom, buildSparseDelta, and applyDeltaToStore into PortfolioModalHost', () => {
    const p1 = createFixturePlayer('p1', {
      balance: 2000,
      ownedProperties: [39],
      mortgagedProperties: [39],
      mortgageLoans: { 39: 2400 },
    });
    const room = createFixtureRoom([p1]);
    const registry: PropertyRegistry = new Map<number, string>([[39, 'p1']]);
    const stateMap: PropertyStateMap = new Map([[39, { level: 2, isMortgaged: true }]]);

    const fullDelta = buildDeltaFromRoom(
      room,
      registry,
      stateMap,
      1,
      undefined,
      undefined,
      undefined,
      new PendingTradeManager(),
    );
    const sparseDelta = buildSparseDelta({ tick: 0, cells: [] }, fullDelta);
    applyDeltaToStore(sparseDelta);

    const syncedPlayer = useGameStore.getState().playersInfo['p1'];
    let capturedHostElement: React.ReactElement | null = null;
    function HostHarness(): React.ReactElement {
      capturedHostElement = PortfolioModalHost({
        myId: 'p1',
        myPlayer: syncedPlayer,
        playersInfo: useGameStore.getState().playersInfo,
        closeModal: () => {},
      });
      return capturedHostElement;
    }
    renderToStaticMarkup(React.createElement(HostHarness));
    const snapshot = capturedHostElement ? extractPortfolioModalSnapshot(capturedHostElement) : {};
    const firstDeltaPlayer = fullDelta.players?.[0] ?? { id: 'p1', position: 0, balance: 2000 };

    expect(syncedPlayer?.mortgageLoans?.[39]).toBe(2400);
    expect(isPlayerEqual(firstDeltaPlayer, { ...firstDeltaPlayer, mortgageLoans: { 39: 2000 } })).toBe(false);
    expect(snapshot.playerNetWorth).toBe(3600);
    expect(snapshot.unmortgagedPropertiesCount).toBe(0);
  });

  it('TC-393.04 [UC-UI-ADMIN-BOUNDARY-PURGE/MSS]: routes all 5 Admin UI modules to src/domain/protocol/index.js with zero server imports', () => {
    const summary = inspectUiModuleBoundaries([
      'src/client/ui/admin/admin_archive_view.tsx',
      'src/client/ui/admin/admin_live_view.tsx',
      'src/client/ui/admin/admin_log_row.tsx',
      'src/client/ui/admin/admin_repro.ts',
      'src/client/ui/admin/use_admin_portal.ts',
    ]);

    expect(summary.serverImportCount).toBe(0);
    expect(summary.protocolImportCount).toBe(5);
    expect(summary.clientServerWarningCount).toBe(0);
    expect(summary.strictErrorCount).toBe(0);
  });

  it('TC-393.05 [UC-UI-MODALS-BOUNDARY-PURGE/MSS]: routes all 6 Modal Host and Strip modules to src/domain/protocol/index.js with zero server imports', () => {
    const summary = inspectUiModuleBoundaries([
      'src/client/ui/modals/hosts/auction_modal_host.tsx',
      'src/client/ui/modals/hosts/deed_modal_host.tsx',
      'src/client/ui/modals/hosts/portfolio_modal_host.tsx',
      'src/client/ui/modals/hosts/trade_modal_host.tsx',
      'src/client/ui/modals/modal_host.tsx',
      'src/client/ui/modals/bot_trade_offer_strip.tsx',
    ]);

    expect(summary.serverImportCount).toBe(0);
    expect(summary.protocolImportCount).toBe(6);
    expect(summary.clientServerWarningCount).toBe(0);
    expect(summary.strictErrorCount).toBe(0);
  });

  it('TC-393.06 [UC-UI-HUD-LOBBY-PLAYERCARD-RATCHET-LOCK/MSS]: purges remaining HUD, Lobby, and PlayerCard server imports, empties KNOWN_LEGACY_CLIENT_SERVER_VIOLATIONS, and catches .js server imports', () => {
    const summary = inspectUiModuleBoundaries([
      'src/client/ui/hud_container.tsx',
      'src/client/ui/lobby/pre_match_deck.tsx',
      'src/client/ui/player_card_helpers.ts',
    ]);
    const syntheticFile = path.resolve(REPO_ROOT, 'src/client/ui/modals/bot_trade_offer_strip.tsx');
    const syntheticResult = lintFileBoundaries(
      syntheticFile,
      "import type { PlayerIntent } from '../../../server/intent_dispatcher.js';\n",
      REPO_ROOT,
      false,
    );

    expect(summary.serverImportCount).toBe(0);
    expect(summary.protocolImportCount).toBe(3);
    expect(KNOWN_LEGACY_CLIENT_SERVER_VIOLATIONS.size).toBe(0);
    expect(syntheticResult.errors.length).toBe(1);
  });

  it('TC-393.07 [UC-UI-PLAYERCARD-HELPERS-PROTOCOL-WIRING/MSS]: resolves both seller and swap trading cells via PendingTradeOfferDelta from domain protocol facade with zero server imports in player_card_helpers', () => {
    const offer: PendingTradeOfferDelta = {
      offerId: 'o1',
      sellerId: 'p1',
      buyerId: 'p2',
      cellIndex: 12,
      offeredCellIndex: 5,
      price: 800,
      expiresAt: 9999,
    };
    const sellerCells = resolvePlayerTradingCells(
      { activeModal: 'bot_trade_offer', modalPayload: offer, pendingTradeOffer: offer },
      'p1',
    );
    const buyerCells = resolvePlayerTradingCells(
      { activeModal: 'bot_trade_offer', modalPayload: offer, pendingTradeOffer: offer },
      'p2',
    );
    const helperBoundary = inspectUiModuleBoundaries(['src/client/ui/player_card_helpers.ts']);

    expect(sellerCells.has(12)).toBe(true);
    expect(buyerCells.has(5)).toBe(true);
    expect(helperBoundary.serverImportCount).toBe(0);
    expect(helperBoundary.protocolImportCount).toBe(1);
  });
});
