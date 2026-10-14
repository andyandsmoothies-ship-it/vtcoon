// [CONTRACT TEST] IMP-394: Domain Zero-Cycle (SCC-1) & Room Schema Integrity
// Universal 5-Facet Behavioral Matrix & Adversarial Inversion Verification
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { describe, it, expect } from 'vitest';
import {
  TurnPhase,
  createPlayer,
  createRoom,
  type MarketModifier as RoomMarketModifier,
} from '../../src/domain/room.js';
import {
  MarketCardId,
  type MarketModifier as EventCardMarketModifier,
} from '../../src/domain/event_card_types.js';
import { checkInsolvency, declareBankruptcy } from '../../src/server/insolvency_manager.js';
import { detectCycles } from '../../scripts/boundary_linter/boundary_rules.mjs';

const REPO_ROOT = process.cwd();

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

interface MarketModifierAstSummary {
  readonly eventCardDefinesInterface: boolean;
  readonly eventCardImportsRoom: boolean;
  readonly roomReExportsFromEventCardTypes: boolean;
  readonly roomDefinesDuplicateInterface: boolean;
}

function inspectMarketModifierAst(): MarketModifierAstSummary {
  const eventCardPath = path.resolve(REPO_ROOT, 'src/domain/event_card_types.ts');
  const roomPath = path.resolve(REPO_ROOT, 'src/domain/room.ts');
  const eventCardSf = ts.createSourceFile(
    eventCardPath,
    fs.readFileSync(eventCardPath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const roomSf = ts.createSourceFile(
    roomPath,
    fs.readFileSync(roomPath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );

  let eventCardDefinesInterface = false;
  let eventCardImportsRoom = false;
  for (const stmt of eventCardSf.statements) {
    if (ts.isInterfaceDeclaration(stmt) && stmt.name.text === 'MarketModifier') {
      eventCardDefinesInterface = true;
    }
    if ((ts.isImportDeclaration(stmt) || ts.isExportDeclaration(stmt)) && stmt.moduleSpecifier && ts.isStringLiteral(stmt.moduleSpecifier)) {
      if (stmt.moduleSpecifier.text.includes('./room')) {
        eventCardImportsRoom = true;
      }
    }
  }

  let roomReExportsFromEventCardTypes = false;
  let roomDefinesDuplicateInterface = false;
  for (const stmt of roomSf.statements) {
    if (ts.isInterfaceDeclaration(stmt) && stmt.name.text === 'MarketModifier') {
      roomDefinesDuplicateInterface = true;
    }
    if (ts.isExportDeclaration(stmt) && stmt.moduleSpecifier && ts.isStringLiteral(stmt.moduleSpecifier)) {
      if (stmt.moduleSpecifier.text.includes('./event_card_types') && stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
        for (const elem of stmt.exportClause.elements) {
          if (elem.name.text === 'MarketModifier') {
            roomReExportsFromEventCardTypes = true;
          }
        }
      }
    }
  }

  return {
    eventCardDefinesInterface,
    eventCardImportsRoom,
    roomReExportsFromEventCardTypes,
    roomDefinesDuplicateInterface,
  };
}

interface RoomSchemaAstSummary {
  readonly hasCanonicalPendingInsolvencyQueue: boolean;
  readonly hasCanonicalPreInsolvencyPhase: boolean;
  readonly serverDeclareModuleCount: number;
}

function inspectRoomInsolvencySchemaAst(): RoomSchemaAstSummary {
  const roomPath = path.resolve(REPO_ROOT, 'src/domain/room.ts');
  const roomSf = ts.createSourceFile(
    roomPath,
    fs.readFileSync(roomPath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );

  let hasCanonicalPendingInsolvencyQueue = false;
  let hasCanonicalPreInsolvencyPhase = false;

  for (const stmt of roomSf.statements) {
    if (ts.isInterfaceDeclaration(stmt) && stmt.name.text === 'Room') {
      for (const member of stmt.members) {
        if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
          if (member.name.text === 'pendingInsolvencyQueue') {
            hasCanonicalPendingInsolvencyQueue = true;
          }
          if (member.name.text === 'preInsolvencyPhase') {
            hasCanonicalPreInsolvencyPhase = true;
          }
        }
      }
    }
  }

  const serverFiles = [
    'src/server/insolvency_manager.ts',
    'src/server/mortgage_manager.ts',
    'src/server/network/afk_recovery.ts',
  ];
  let serverDeclareModuleCount = 0;
  for (const relPath of serverFiles) {
    const absPath = path.resolve(REPO_ROOT, relPath);
    const sf = ts.createSourceFile(absPath, fs.readFileSync(absPath, 'utf8'), ts.ScriptTarget.Latest, true);
    for (const stmt of sf.statements) {
      if (ts.isModuleDeclaration(stmt)) {
        serverDeclareModuleCount++;
      }
    }
  }

  return {
    hasCanonicalPendingInsolvencyQueue,
    hasCanonicalPreInsolvencyPhase,
    serverDeclareModuleCount,
  };
}

describe('[IMP-394] Domain Zero-Cycle & Room Schema Integrity Contract Suite', () => {
  it('TC-394.01 [UC-ARCH-002/MSS]: eliminates SCC-1 between event_card_types.ts and room.ts leaving 0 circular dependency cycles across src/domain/**', () => {
    const domainFiles = collectDomainFiles(path.resolve(REPO_ROOT, 'src/domain'));
    const domainCycles = detectCycles(domainFiles, REPO_ROOT);
    const sampleModifier: EventCardMarketModifier = {
      type: MarketCardId.MC_LAND_FEVER,
      affectedCells: [6, 8, 31],
      remainingRounds: 2,
    };
    const roomCompatibleModifier: RoomMarketModifier = sampleModifier;

    expect(domainFiles.length).toBeGreaterThan(20);
    expect(domainCycles).toEqual([]);
    expect(domainCycles.length).toBe(0);
    expect(roomCompatibleModifier.remainingRounds).toBe(2);
  });

  it('TC-394.02 [UC-ARCH-002/A1]: defines canonical MarketModifier interface in event_card_types.ts with zero ./room imports and re-exports it from room.ts', () => {
    const astSummary = inspectMarketModifierAst();

    expect(astSummary.eventCardDefinesInterface).toBe(true);
    expect(astSummary.eventCardImportsRoom).toBe(false);
    expect(astSummary.roomReExportsFromEventCardTypes).toBe(true);
    expect(astSummary.roomDefinesDuplicateInterface).toBe(false);
  });

  it('TC-394.03 [UC-ARCH-002/A2]: declares pendingInsolvencyQueue and preInsolvencyPhase canonically on Room in room.ts and removes all declare module blocks in server managers', () => {
    const schemaSummary = inspectRoomInsolvencySchemaAst();

    expect(schemaSummary.hasCanonicalPendingInsolvencyQueue).toBe(true);
    expect(schemaSummary.hasCanonicalPreInsolvencyPhase).toBe(true);
    expect(schemaSummary.serverDeclareModuleCount).toBe(0);
  });

  it('TC-394.04 [UC-GAME-053/MSS]: transitions Room to InsolvencyPhase and records preInsolvencyPhase as ActionPhase via checkInsolvency using canonical Room schema fields', () => {
    const schemaSummary = inspectRoomInsolvencySchemaAst();
    const room = createRoom('p1', 'VT394A');
    const p2 = createPlayer('p2');
    room.players.push(p2);
    room.started = true;
    room.phase = TurnPhase.ActionPhase;
    room.players[0]!.balance = -500;

    checkInsolvency(room, 'p2', 'p1');

    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
    expect(room.preInsolvencyPhase).toBe(TurnPhase.ActionPhase);
    expect(room.pendingInsolvencyDebtorId).toBe('p1');
    expect(schemaSummary.hasCanonicalPreInsolvencyPhase).toBe(true);
  });

  it('TC-394.05 [UC-DEADLOCK/A1]: advances turn cleanly without stalling InsolvencyPhase when turn player p1 declares bankruptcy and queued p2 is solvent after composite cashflows', () => {
    const schemaSummary = inspectRoomInsolvencySchemaAst();
    const room = createRoom('p1', 'VT394B');
    const p2 = createPlayer('p2');
    const p3 = createPlayer('p3');
    p2.balance = 2000 - 500;
    p3.balance = 5000;
    room.players.push(p2, p3);
    room.started = true;
    room.currentPlayerIndex = 0;
    room.phase = TurnPhase.InsolvencyPhase;
    room.preInsolvencyPhase = TurnPhase.ActionPhase;
    room.pendingInsolvencyDebtorId = 'p1';
    room.pendingInsolvencyQueue = ['p2'];
    room.players[0]!.balance = -500;

    const result = declareBankruptcy(room, 'p1', new Map(), new Map(), 'BANK', undefined, 'VT394B', () => 0.5);

    expect(result.gameOver).toBe(false);
    expect(room.currentPlayerIndex).toBe(1);
    expect(room.phase).toBe(TurnPhase.WaitingRoll);
    expect(schemaSummary.hasCanonicalPendingInsolvencyQueue && room.pendingInsolvencyQueue === undefined).toBe(true);
  });

  it('TC-394.06 [UC-CASCADE/A2]: processes sequential cascade bankruptcy across pendingInsolvencyQueue from p1 to p2 and resolves game over with p3 as sole survivor', () => {
    const schemaSummary = inspectRoomInsolvencySchemaAst();
    const room = createRoom('p1', 'VT394C');
    const p2 = createPlayer('p2');
    const p3 = createPlayer('p3');
    p2.balance = -400;
    p3.balance = 6000;
    room.players.push(p2, p3);
    room.started = true;
    room.currentPlayerIndex = 0;
    room.phase = TurnPhase.InsolvencyPhase;
    room.preInsolvencyPhase = TurnPhase.ActionPhase;
    room.pendingInsolvencyDebtorId = 'p1';
    room.pendingInsolvencyQueue = ['p2'];
    room.players[0]!.balance = -500;

    const firstResult = declareBankruptcy(room, 'p1', new Map(), new Map(), 'BANK', undefined, 'VT394C', () => 0.5);
    const debtorAfterFirst = room.pendingInsolvencyDebtorId;
    const secondResult = declareBankruptcy(room, 'p2', new Map(), new Map(), 'BANK', undefined, 'VT394C', () => 0.5);

    expect(firstResult.gameOver).toBe(false);
    expect(debtorAfterFirst).toBe('p2');
    expect(secondResult.gameOver && secondResult.rankings?.[0]?.id === 'p3').toBe(true);
    expect(schemaSummary.serverDeclareModuleCount).toBe(0);
  });
});
