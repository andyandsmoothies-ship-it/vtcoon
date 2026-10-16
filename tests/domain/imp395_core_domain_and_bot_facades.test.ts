// [CONTRACT TEST] IMP-395: Core Domain Public Facade, Autonomous Bot Brain Facade & Room Coordinator Encapsulation
// Universal 5-Facet Behavioral Matrix & Adversarial Inversion Verification
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { describe, it, expect } from 'vitest';
import {
  ActionRejectReason,
  TurnPhase,
  createPlayer,
  createRoom,
  calculateCellNetWorth,
  calculateGoSalary,
  type PropertyRegistry,
  type PropertyStateMap,
} from '../../src/domain/index.js';
import {
  BotPersonality,
  decideBotIntent,
  evaluatePlayerNetWorth,
} from '../../src/domain/bot/index.js';
import { getBotConfig } from '../../src/server/room_bot_manager.js';
import { coordTrade } from '../../src/server/room_trade_coordinator.js';
import type { RoomContext } from '../../src/server/room_property_coordinator.js';
import {
  calcPropertyRent,
  calcRankings,
  calculateNetWorth,
  calculateRankings,
} from '../../src/server/room_manager_queries.js';
import { detectCycles } from '../../scripts/boundary_linter/boundary_rules.mjs';

const REPO_ROOT = process.cwd();

const ROOM_COORDINATOR_FILES = [
  'src/server/room_manager.ts',
  'src/server/room_bot_coordinator.ts',
  'src/server/room_bot_manager.ts',
  'src/server/room_manager_lifecycle.ts',
  'src/server/room_property_coordinator.ts',
  'src/server/room_trade_coordinator.ts',
  'src/server/room_manager_queries.ts',
] as const;

function collectDomainFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectDomainFiles(fullPath));
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      results.push(fullPath);
    }
  }
  return results;
}

interface DomainFacadeAstSummary {
  readonly presentRequiredSymbolCount: number;
  readonly missingRequiredSymbolCount: number;
  readonly leakedInternalModuleCount: number;
  readonly hasFakeViMessagesAlias: boolean;
}

function inspectDomainFacadeAst(): DomainFacadeAstSummary {
  const facadePath = path.resolve(REPO_ROOT, 'src/domain/index.ts');
  const content = fs.readFileSync(facadePath, 'utf8');
  const sf = ts.createSourceFile(facadePath, content, ts.ScriptTarget.Latest, true);

  const exportedNames = new Set<string>();
  const moduleSpecifiers: string[] = [];

  for (const stmt of sf.statements) {
    if (ts.isExportDeclaration(stmt)) {
      if (stmt.moduleSpecifier && ts.isStringLiteral(stmt.moduleSpecifier)) {
        moduleSpecifiers.push(stmt.moduleSpecifier.text);
      }
      if (stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
        for (const el of stmt.exportClause.elements) {
          exportedNames.add(el.name.text);
        }
      }
    } else if (ts.isFunctionDeclaration(stmt) && stmt.name) {
      exportedNames.add(stmt.name.text);
    }
  }

  const requiredSymbols = [
    'BOARD_CONFIG',
    'PROPERTY_DEEDS',
    'LEVEL_MULTIPLIER',
    'COLOR_GROUP_HEX',
    'BOND_TRANCHES',
    'TRANSIT_WHEEL_CONFIGS',
    'vi',
    'calculateUpgradeCost',
    'calculateBailAmount',
    'evaluateMacroCycle',
  ];
  let presentRequiredSymbolCount = 0;
  for (const sym of requiredSymbols) {
    if (exportedNames.has(sym)) {
      presentRequiredSymbolCount++;
    }
  }

  const forbiddenInternalModules = [
    'card_handlers',
    'chance_card_handlers',
    'chance_ma_handlers',
    'market_card_handlers',
    'compulsory_buyout',
    './types',
  ];
  let leakedInternalModuleCount = 0;
  for (const spec of moduleSpecifiers) {
    for (const forbidden of forbiddenInternalModules) {
      if (spec.includes(forbidden)) {
        leakedInternalModuleCount++;
      }
    }
  }

  return {
    presentRequiredSymbolCount,
    missingRequiredSymbolCount: requiredSymbols.length - presentRequiredSymbolCount,
    leakedInternalModuleCount,
    hasFakeViMessagesAlias: exportedNames.has('VI_MESSAGES'),
  };
}

interface CoordinatorImportSummary {
  readonly leafDomainImportCount: number;
  readonly domainFacadeImportCount: number;
  readonly botFacadeImportCount: number;
  readonly filesWithOnlyFacadeImports: number;
}

function inspectCoordinatorImports(relPaths: readonly string[]): CoordinatorImportSummary {
  let leafDomainImportCount = 0;
  let domainFacadeImportCount = 0;
  let botFacadeImportCount = 0;
  let filesWithOnlyFacadeImports = 0;

  for (const relPath of relPaths) {
    const absPath = path.resolve(REPO_ROOT, relPath);
    const content = fs.readFileSync(absPath, 'utf8');
    const sf = ts.createSourceFile(absPath, content, ts.ScriptTarget.Latest, true);
    let fileLeafImports = 0;
    let fileFacadeImports = 0;

    for (const stmt of sf.statements) {
      if ((ts.isImportDeclaration(stmt) || ts.isExportDeclaration(stmt)) && stmt.moduleSpecifier && ts.isStringLiteral(stmt.moduleSpecifier)) {
        const spec = stmt.moduleSpecifier.text;
        if (spec.startsWith('../domain/')) {
          if (spec === '../domain/index.js' || spec === '../domain/index') {
            domainFacadeImportCount++;
            fileFacadeImports++;
          } else if (spec === '../domain/bot/index.js' || spec === '../domain/bot/index') {
            botFacadeImportCount++;
            fileFacadeImports++;
          } else if (!spec.startsWith('../domain/protocol/')) {
            leafDomainImportCount++;
            fileLeafImports++;
          }
        }
      }
    }

    if (fileLeafImports === 0 && fileFacadeImports > 0) {
      filesWithOnlyFacadeImports++;
    }
  }

  return {
    leafDomainImportCount,
    domainFacadeImportCount,
    botFacadeImportCount,
    filesWithOnlyFacadeImports,
  };
}

interface BotFacadeAstSummary {
  readonly fakeAliasCount: number;
  readonly missingRequiredBotExports: number;
}

function inspectBotFacadeAst(): BotFacadeAstSummary {
  const botFacadePath = path.resolve(REPO_ROOT, 'src/domain/bot/index.ts');
  const content = fs.readFileSync(botFacadePath, 'utf8');
  const sf = ts.createSourceFile(botFacadePath, content, ts.ScriptTarget.Latest, true);

  const exportedNames = new Set<string>();
  for (const stmt of sf.statements) {
    if (ts.isExportDeclaration(stmt) && stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
      for (const el of stmt.exportClause.elements) {
        exportedNames.add(el.name.text);
      }
    } else if (ts.isFunctionDeclaration(stmt) && stmt.name) {
      exportedNames.add(stmt.name.text);
    }
  }

  const fakeAliases = [
    'decideBotAction',
    'decideBotAuctionAction',
    'decideBotProactiveTrade',
    'evaluateBotTradeOffer',
  ];
  let fakeAliasCount = 0;
  for (const alias of fakeAliases) {
    if (exportedNames.has(alias)) {
      fakeAliasCount++;
    }
  }

  const requiredBotExports = [
    'BotPersonality',
    'BotPosture',
    'decideBotIntent',
    'decideAuctionPhaseIntent',
    'evaluateBotTradeDecision',
    'evaluateBotTradeAcceptance',
    'findEligibleBotTrade',
    'recordTradeRejection',
    'clearTradeRejectionForCell',
    'BotEngine',
    'takeover',
    'evaluatePlayerNetWorth',
  ];
  let missingRequiredBotExports = 0;
  for (const req of requiredBotExports) {
    if (!exportedNames.has(req)) {
      missingRequiredBotExports++;
    }
  }

  return { fakeAliasCount, missingRequiredBotExports };
}

interface QueriesAndNetWorthSnapshot {
  readonly serverNetWorth: number;
  readonly botNetWorth: number;
  readonly rentAndRankingValid: boolean;
  readonly roomManagerLineCount: number;
}

function evaluateQueriesAndNetWorthSnapshot(): QueriesAndNetWorthSnapshot {
  const room = createRoom('p1', 'VT395Q');
  const p1 = room.players[0]!;
  p1.balance = 3000 + 2000 - 1000;
  p1.mortgagedProperties = [1];
  p1.mortgageLoans = { 1: 360 };

  const p2 = createPlayer('p2');
  p2.balance = 1000;
  p2.bankrupt = true;
  const p3 = createPlayer('p3');
  p3.balance = 1000;
  p3.bankrupt = false;
  const p4 = createPlayer('p4');
  p4.balance = 25000;
  room.players.push(p2, p3, p4);

  const registry: PropertyRegistry = new Map<number, string>([
    [1, 'p1'],
    [39, 'p1'],
  ]);
  const stateMap: PropertyStateMap = new Map([
    [1, { level: 0, isMortgaged: true }],
    [39, { level: 1, isMortgaged: false }],
  ]);

  const serverNetWorth = calculateNetWorth('p1', registry, stateMap, room.players);
  const botNetWorth = evaluatePlayerNetWorth('p1', room.players, registry, stateMap);
  const missingNetWorth = calculateNetWorth('missing', registry, stateMap, room.players);
  const ownedCellRent = calcPropertyRent(registry, stateMap, 39, 7);
  const unownedCellRent = calcPropertyRent(registry, stateMap, 3, 7);
  const undefinedRegRent = calcPropertyRent(undefined, undefined, 1, 7);
  const rankings = calculateRankings(room, registry, stateMap);
  const aliasRankings = calcRankings(room, registry, stateMap);

  const rentAndRankingValid =
    missingNetWorth === 0 &&
    ownedCellRent === 1400 &&
    unownedCellRent === 0 &&
    undefinedRegRent === 0 &&
    rankings.length === 4 &&
    rankings[0]?.id === 'p4' &&
    rankings[1]?.id === 'p1' &&
    rankings[1]?.netWorth === 10240 &&
    rankings[2]?.id === 'p3' &&
    rankings[3]?.id === 'p2' &&
    aliasRankings[0]?.id === 'p4';

  const roomMgrPath = path.resolve(REPO_ROOT, 'src/server/room_manager.ts');
  const roomMgrContent = fs.readFileSync(roomMgrPath, 'utf8').replace(/\r\n/g, '\n');
  const roomManagerLineCount = roomMgrContent.endsWith('\n')
    ? roomMgrContent.slice(0, -1).split('\n').length
    : roomMgrContent.split('\n').length;

  return {
    serverNetWorth,
    botNetWorth,
    rentAndRankingValid,
    roomManagerLineCount,
  };
}

describe('[IMP-395] Core Domain & Bot Facades Contract Suite', () => {
  it('TC-395.01 [UC-ARCH-003/MSS]: maintains 0 circular dependency SCCs across src/domain/** and exposes authoritative valuation helpers via src/domain/index.ts', () => {
    const domainFiles = collectDomainFiles(path.resolve(REPO_ROOT, 'src/domain'));
    const domainCycles = detectCycles(domainFiles, REPO_ROOT);

    expect(domainCycles).toEqual([]);
    expect(domainCycles.length).toBe(0);
    expect(calculateCellNetWorth(39, 2, false)).toBe(10000);
    expect(calculateGoSalary(1)).toBe(2000);
  });

  it('TC-395.02 [UC-ARCH-003/A1]: exports canonical domain entities, static ledgers, and calculators from src/domain/index.ts while hiding internal handler leaves and banning VI_MESSAGES alias', () => {
    const facadeAst = inspectDomainFacadeAst();

    expect(facadeAst.missingRequiredSymbolCount).toBe(0);
    expect(facadeAst.presentRequiredSymbolCount).toBe(10);
    expect(facadeAst.leakedInternalModuleCount).toBe(0);
    expect(facadeAst.hasFakeViMessagesAlias).toBe(false);
  });

  it('TC-395.03 [UC-BOT-01/MSS]: routes 100% of domain and bot imports across all 7 src/server/room_*.ts coordinators exclusively through ../domain/index.js and ../domain/bot/index.js', () => {
    const coordAst = inspectCoordinatorImports(ROOM_COORDINATOR_FILES);

    expect(coordAst.leafDomainImportCount).toBe(0);
    expect(coordAst.filesWithOnlyFacadeImports).toBe(7);
    expect(coordAst.domainFacadeImportCount).toBeGreaterThanOrEqual(7);
    expect(coordAst.botFacadeImportCount).toBeGreaterThanOrEqual(5);
  });

  it('TC-395.04 [UC-GAME-005/MSS]: resolves valid audit WaitingRoll bot decision via decideBotIntent from src/domain/bot/index.ts with zero fake aliases', () => {
    const room = createRoom('b1', 'VT395B');
    const b1 = room.players[0]!;
    b1.isBot = true;
    b1.auditTurnsLeft = 2;
    b1.inAudit = true;
    b1.balance = 5000;
    room.started = true;
    room.phase = TurnPhase.WaitingRoll;

    const config = getBotConfig(BotPersonality.Balanced, () => 0.5);
    const intent = decideBotIntent(b1, room, new Map(), new Map(), config);
    const botFacadeAst = inspectBotFacadeAst();
    const botCoordImports = inspectCoordinatorImports(['src/server/room_bot_coordinator.ts']);

    expect(intent?.type === 'INTENT_BAIL_OUT' || intent?.type === 'INTENT_ROLL').toBe(true);
    expect(botFacadeAst.fakeAliasCount).toBe(0);
    expect(botFacadeAst.missingRequiredBotExports).toBe(0);
    expect(botCoordImports.leafDomainImportCount).toBe(0);
  });

  it('TC-395.05 [UC-GAME-007/MSS]: rejects lowball P2P trade offer against Balanced Bot in coordTrade and increments cellTradeRejections while importing solely from domain facades', () => {
    const room = createRoom('p1', 'VT395T');
    const p1 = room.players[0]!;
    p1.isBot = true;
    p1.balance = 5000 + 2000 - 500;
    const b1 = createPlayer('b1');
    b1.isBot = true;
    b1.personality = BotPersonality.Balanced;
    b1.balance = 5000;
    room.players.push(b1);
    room.started = true;
    room.phase = TurnPhase.PropertyManagement;

    const reg: PropertyRegistry = new Map<number, string>([[1, 'b1']]);
    const sm: PropertyStateMap = new Map([[1, { level: 0, isMortgaged: false }]]);
    const ctx: RoomContext = {
      room,
      reg,
      sm,
      botPersonalities: new Map([[b1.id, BotPersonality.Balanced]]),
    };

    const res = coordTrade(ctx, 'p1', 'b1', 'p1', 1, 100);
    const tradeCoordImports = inspectCoordinatorImports(['src/server/room_trade_coordinator.ts']);

    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.TRADE_REJECTED);
    expect(p1.cellTradeRejections?.[1]).toBe(1);
    expect(
      tradeCoordImports.leafDomainImportCount === 0 &&
        tradeCoordImports.domainFacadeImportCount === 1 &&
        tradeCoordImports.botFacadeImportCount === 1,
    ).toBe(true);
  });

  it('TC-395.06 [UC-NETWORTH-SERVER-WIRING-COMPOSITE/MSS]: computes 1:1 composite net worth (10240) across room_manager_queries and bot facade while reducing room_manager.ts to <= 344 LOC', () => {
    const snapshot = evaluateQueriesAndNetWorthSnapshot();

    expect(snapshot.serverNetWorth).toBe(10240);
    expect(snapshot.botNetWorth).toBe(10240);
    expect(snapshot.rentAndRankingValid).toBe(true);
    expect(snapshot.roomManagerLineCount).toBeLessThanOrEqual(344);
  });
});
