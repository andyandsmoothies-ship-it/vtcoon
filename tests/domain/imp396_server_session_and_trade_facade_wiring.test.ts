// [CONTRACT TEST] IMP-396: Server Session & Trade Helper Facade Wiring
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
  type PropertyRegistry,
  type PropertyStateMap,
} from '../../src/domain/index.js';
import { BotPersonality } from '../../src/domain/bot/index.js';
import { handleBotRecipientTrade } from '../../src/server/trade_coordinator_helper.js';
import { coordTrade } from '../../src/server/room_trade_coordinator.js';
import type { RoomContext } from '../../src/server/room_property_coordinator.js';
import { GameRoomSession } from '../../src/server/game_room_session.js';
import {
  createBotPersonalityMapFacade,
  createSessionFieldProxy,
} from '../../src/server/session_proxy_facade.js';
import { detectCycles } from '../../scripts/boundary_linter/boundary_rules.mjs';

const REPO_ROOT = process.cwd();

const IMP396_TARGET_SERVER_FILES = [
  'src/server/trade_coordinator_helper.ts',
  'src/server/game_room_session.ts',
  'src/server/session_proxy_facade.ts',
] as const;

const ALL_TEN_SERVER_SESSION_AND_ROOM_FILES = [
  'src/server/trade_coordinator_helper.ts',
  'src/server/game_room_session.ts',
  'src/server/session_proxy_facade.ts',
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

interface ServerImportSummary {
  readonly leafDomainImportCount: number;
  readonly domainFacadeImportCount: number;
  readonly botFacadeImportCount: number;
  readonly filesWithOnlyFacadeImports: number;
}

function inspectServerFacadeImports(relPaths: readonly string[]): ServerImportSummary {
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
      if (
        (ts.isImportDeclaration(stmt) || ts.isExportDeclaration(stmt)) &&
        stmt.moduleSpecifier &&
        ts.isStringLiteral(stmt.moduleSpecifier)
      ) {
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

function countPhysicalLines(relPath: string): number {
  const absPath = path.resolve(REPO_ROOT, relPath);
  const content = fs.readFileSync(absPath, 'utf8').replace(/\r\n/g, '\n');
  return content.endsWith('\n')
    ? content.slice(0, -1).split('\n').length
    : content.split('\n').length;
}

interface HumanAndAcceptedTradeOutcome {
  readonly humanRejectResult: ReturnType<typeof handleBotRecipientTrade>;
  readonly humanRejectionMap: Record<number, number> | undefined;
  readonly acceptedHelperReturn: ReturnType<typeof handleBotRecipientTrade>;
  readonly acceptedCoordSuccess: boolean;
  readonly roundFallbackValid: boolean;
}

function evaluateHumanAndAcceptedBotTrades(): HumanAndAcceptedTradeOutcome {
  const room = createRoom('p1', 'VT396H');
  const p1 = room.players[0]!;
  p1.isBot = false;
  p1.balance = 7000 + 2000 - 1000;

  const b1 = createPlayer('b1');
  b1.isBot = true;
  b1.personality = BotPersonality.Aggressive;
  b1.balance = 12000;
  room.players.push(b1);
  room.started = true;
  room.phase = TurnPhase.PropertyManagement;

  const reg: PropertyRegistry = new Map<number, string>([[1, 'b1']]);
  const sm: PropertyStateMap = new Map([[1, { level: 0, isMortgaged: false }]]);
  const ctx: RoomContext = {
    room,
    reg,
    sm,
    botPersonalities: new Map([['b1', BotPersonality.Balanced]]),
  };

  const humanRejectResult = handleBotRecipientTrade(ctx, b1, p1, 1, 100);
  const humanRejectionMap = p1.cellTradeRejections;

  const acceptedHelperReturn = handleBotRecipientTrade(ctx, b1, p1, 1, 1200);
  const coordRes = coordTrade(ctx, 'p1', 'b1', 'p1', 1, 1200);
  const acceptedCoordSuccess = coordRes.success === true && reg.get(1) === 'p1';

  const botBuyer = createPlayer('b2');
  botBuyer.isBot = true;
  botBuyer.balance = 5000;
  room.players.push(botBuyer);
  reg.set(1, 'b1');

  room.roundCount = undefined;
  room.round = 7;
  handleBotRecipientTrade(ctx, b1, botBuyer, 1, 100);
  const fallbackRoundSeven = botBuyer.cellLastRejectedRound?.[1] === 7;

  const botBuyerDefault = createPlayer('b3');
  botBuyerDefault.isBot = true;
  botBuyerDefault.balance = 5000;
  room.players.push(botBuyerDefault);
  room.roundCount = undefined;
  room.round = undefined;
  handleBotRecipientTrade(ctx, b1, botBuyerDefault, 1, 100);
  const fallbackRoundOne = botBuyerDefault.cellLastRejectedRound?.[1] === 1;

  return {
    humanRejectResult,
    humanRejectionMap,
    acceptedHelperReturn,
    acceptedCoordSuccess,
    roundFallbackValid: fallbackRoundSeven && fallbackRoundOne,
  };
}

describe('[IMP-396] Server Session & Trade Helper Facade Wiring Contract Suite', () => {
  it('TC-396.01 [UC-ARCH-003/MSS]: routes 100% of domain and bot imports in trade_coordinator_helper, game_room_session, session_proxy_facade, and all 7 room_*.ts coordinators via facades', () => {
    const imp396Ast = inspectServerFacadeImports(IMP396_TARGET_SERVER_FILES);
    const allTenAst = inspectServerFacadeImports(ALL_TEN_SERVER_SESSION_AND_ROOM_FILES);

    expect(imp396Ast.leafDomainImportCount).toBe(0);
    expect(imp396Ast.filesWithOnlyFacadeImports).toBe(3);
    expect(allTenAst.leafDomainImportCount).toBe(0);
    expect(allTenAst.filesWithOnlyFacadeImports).toBe(10);
  });

  it('TC-396.02 [UC-GAME-007/MSS]: rejects lowball bot-to-bot swap offer in handleBotRecipientTrade and records cellTradeRejections, cellLastRejectedRound, and swapPairLastRejectedRound', () => {
    const room = createRoom('b1', 'VT396B');
    const b1 = room.players[0]!;
    b1.isBot = true;
    b1.balance = 12000;

    const b2 = createPlayer('b2');
    b2.isBot = true;
    b2.balance = 5000 + 2000 - 500;
    room.players.push(b2);
    room.started = true;
    room.phase = TurnPhase.PropertyManagement;
    room.roundCount = 4;

    const reg: PropertyRegistry = new Map<number, string>([
      [39, 'b1'],
      [1, 'b2'],
    ]);
    const sm: PropertyStateMap = new Map([
      [39, { level: 0, isMortgaged: false }],
      [1, { level: 0, isMortgaged: false }],
    ]);
    const ctx: RoomContext = {
      room,
      reg,
      sm,
      botPersonalities: new Map([['b1', BotPersonality.Balanced]]),
    };

    const res = handleBotRecipientTrade(ctx, b1, b2, 39, 100, 1);

    expect(res).toEqual({ success: false, reason: ActionRejectReason.TRADE_REJECTED });
    expect(b2.cellTradeRejections?.[39]).toBe(1);
    expect(b2.cellLastRejectedRound?.[39]).toBe(4);
    expect(b2.swapPairLastRejectedRound?.['39_1']).toBe(4);
  });

  it('TC-396.03 [UC-GAME-007/A1]: skips rejection cooldown recording for human buyers on rejected bot trades and returns success on accepted generous buyout offers', () => {
    const outcome = evaluateHumanAndAcceptedBotTrades();

    expect(outcome.humanRejectResult).toEqual({
      success: false,
      reason: ActionRejectReason.TRADE_REJECTED,
    });
    expect(outcome.humanRejectionMap).toBeUndefined();
    expect(outcome.acceptedHelperReturn).toEqual({ success: true });
    expect(outcome.acceptedCoordSuccess && outcome.roundFallbackValid).toBe(true);
  });

  it('TC-396.04 [UC-GAME-002/MSS]: normalizes prefixed and unprefixed bot personality keys in GameRoomSession and clears session state on destroy()', () => {
    const room = createRoom('p1', 'vt396s');
    const session = new GameRoomSession(room);

    session.botPersonalities.set('VT396S:bot-1', BotPersonality.Aggressive);
    const lookupUnprefixed = session.botPersonalities.get('bot-1');
    const lookupPrefixed = session.botPersonalities.get('vt396s:bot-1');
    const contextSharesMap = session.toContext().botPersonalities === session.botPersonalities;

    session.destroy();

    expect(lookupUnprefixed).toBe(BotPersonality.Aggressive);
    expect(lookupPrefixed).toBe(BotPersonality.Aggressive);
    expect(contextSharesMap).toBe(true);
    expect(session.botPersonalities.size).toBe(0);
  });

  it('TC-396.05 [UC-GAME-008/MSS]: routes createBotPersonalityMapFacade and createSessionFieldProxy mutations directly into underlying GameRoomSession state', () => {
    const room = createRoom('p1', 'VT396P');
    const b1 = createPlayer('b1');
    b1.isBot = true;
    room.players.push(b1);

    const session = new GameRoomSession(room);
    const sessions = new Map<string, GameRoomSession>([['VT396P', session]]);
    const botFacade = createBotPersonalityMapFacade(sessions);
    const rolledProxy = createSessionFieldProxy(sessions, 'rolledThisTurn');

    botFacade.set('vt396p:b1', BotPersonality.Passive);
    rolledProxy.set('vt396p', true);

    expect(botFacade.get('b1')).toBe(BotPersonality.Passive);
    expect(botFacade.get('VT396P:b1')).toBe(BotPersonality.Passive);
    expect(Array.from(botFacade.entries())).toEqual([['VT396P:b1', BotPersonality.Passive]]);
    expect(rolledProxy.get('VT396P') === true && session.rolledThisTurn === true).toBe(true);
  });

  it('TC-396.06 [UC-ARCH-003/A2]: preserves 0 circular dependency SCCs across src/domain/** while compacting trade_coordinator_helper (<= 32 LOC) and game_room_session (<= 129 LOC)', () => {
    const domainFiles = collectDomainFiles(path.resolve(REPO_ROOT, 'src/domain'));
    const domainCycles = detectCycles(domainFiles, REPO_ROOT);
    const tradeHelperLines = countPhysicalLines('src/server/trade_coordinator_helper.ts');
    const sessionLines = countPhysicalLines('src/server/game_room_session.ts');

    expect(domainCycles).toEqual([]);
    expect(domainCycles.length).toBe(0);
    expect(tradeHelperLines).toBeLessThanOrEqual(32);
    expect(sessionLines).toBeLessThanOrEqual(129);
  });
});
