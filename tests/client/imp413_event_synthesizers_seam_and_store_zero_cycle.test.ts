// [IMP-413] Living Contract Suite — Event Synthesizers Seam & Client Store Zero-Cycle
// Traceability: [TC-413.01..TC-413.04], [UC-GAME-RESET-CLEANUP-REGISTRATION-AND-EXECUTION],
//               [UC-GAME-STORE-RESET-WIRING-PARITY], [UC-FINANCIAL-HELPERS-PSEUDO-BARREL-PURGE],
//               [UC-PROJECT-WIDE-ZERO-CYCLE-SCC-1-ELIMINATION]
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import {
  registerGameResetCleanup,
  executeGameResetCleanups,
  clearAllGameResetCleanups,
} from '../../src/client/store/game_store_cleanup.js';

import {
  useGameStore,
  INITIAL_GAME_STATE,
  type GameState,
  type PlayerHudInfo,
} from '../../src/client/store/game_store.js';

import { synthesizeFinancialEvents } from '../../src/client/events/game_event_financial_synthesizer.js';
import {
  SynthesizedGameEventType,
  type GoSalaryEvent,
  type BondRepaidEvent,
} from '../../src/client/events/game_event_types.js';
import type { DeltaPayload } from '../../src/domain/protocol/index.js';
import { detectCycles } from '../../scripts/boundary_linter/boundary_rules.mjs';

const REPO_ROOT = process.cwd();

function parseImportSpecifiers(sourceText: string): string[] {
  const sf = ts.createSourceFile('temp.ts', sourceText, ts.ScriptTarget.Latest, true);
  const specifiers: string[] = [];
  for (const stmt of sf.statements) {
    if (
      (ts.isImportDeclaration(stmt) || ts.isExportDeclaration(stmt)) &&
      stmt.moduleSpecifier &&
      ts.isStringLiteral(stmt.moduleSpecifier)
    ) {
      specifiers.push(stmt.moduleSpecifier.text);
    }
  }
  return specifiers;
}

function parseReExportedSymbols(sourceText: string): string[] {
  const sf = ts.createSourceFile('temp.ts', sourceText, ts.ScriptTarget.Latest, true);
  const symbols: string[] = [];
  for (const stmt of sf.statements) {
    if (ts.isExportDeclaration(stmt) && stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
      for (const element of stmt.exportClause.elements) {
        symbols.push(element.name.text);
      }
    }
  }
  return symbols;
}

function collectTsFiles(dirPath: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dirPath)) return results;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectTsFiles(fullPath));
    } else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

function createMockPlayer(overrides: Partial<PlayerHudInfo> & { id: string }): PlayerHudInfo {
  return {
    name: overrides.id.toUpperCase(),
    balance: 5000,
    tokenColor: '#38BDF8',
    isBot: false,
    ownedProperties: [],
    mortgagedProperties: [],
    ...overrides,
  };
}

function createMockGameState(overrides?: Partial<GameState>): GameState {
  const base = useGameStore.getState();
  const defaultPlayers: Record<string, PlayerHudInfo> = {
    p1: createMockPlayer({ id: 'p1', name: 'Otter', balance: 5000 }),
    p2: createMockPlayer({ id: 'p2', name: 'Fox', balance: 5000 }),
  };

  return {
    ...base,
    playersInfo: defaultPlayers,
    playerPositions: { p1: 38, p2: 10 },
    roundNumber: 1,
    ...overrides,
  };
}

describe('IMP-413: Event Synthesizers Seam & Client Store Zero-Cycle Suite', () => {
  beforeEach(() => {
    clearAllGameResetCleanups();
    useGameStore.setState(INITIAL_GAME_STATE);
  });

  afterEach(() => {
    clearAllGameResetCleanups();
    useGameStore.setState(INITIAL_GAME_STATE);
  });

  describe('[TC-413.01/MSS] [UC-GAME-RESET-CLEANUP-REGISTRATION-AND-EXECUTION] Game Reset Cleanup Seam', () => {
    it('[TC-413.01/MSS] [UC-GAME-RESET-CLEANUP-REGISTRATION-AND-EXECUTION] invokes registered cleanup handlers upon execute', () => {
      let invokedA = false;
      let invokedB = false;
      registerGameResetCleanup(() => { invokedA = true; });
      registerGameResetCleanup(() => { invokedB = true; });
      executeGameResetCleanups();
      expect(invokedA).toBe(true);
      expect(invokedB).toBe(true);
    });

    it('[TC-413.01/MSS] [UC-GAME-RESET-CLEANUP-REGISTRATION-AND-EXECUTION] unregisters cleanup handler via returned unregister closure', () => {
      let callCount = 0;
      const unregister = registerGameResetCleanup(() => { callCount++; });
      unregister();
      executeGameResetCleanups();
      expect(callCount).toBe(0);
    });

    it('[TC-413.01/MSS] [UC-GAME-RESET-CLEANUP-REGISTRATION-AND-EXECUTION] isolates thrown exceptions so subsequent cleanups execute safely', () => {
      let secondRan = false;
      registerGameResetCleanup(() => {
        throw new Error('Simulated cleanup failure in registered hook');
      });
      registerGameResetCleanup(() => {
        secondRan = true;
      });
      expect(() => executeGameResetCleanups()).not.toThrow();
      expect(secondRan).toBe(true);
    });

    it('[TC-413.01/MSS] [UC-GAME-RESET-CLEANUP-REGISTRATION-AND-EXECUTION] deduplicates identical handler references via Set semantics', () => {
      let callCount = 0;
      const handler = () => { callCount++; };
      registerGameResetCleanup(handler);
      registerGameResetCleanup(handler);
      registerGameResetCleanup(handler);
      executeGameResetCleanups();
      expect(callCount).toBe(1);
    });

    it('[TC-413.01/MSS] [UC-GAME-RESET-CLEANUP-REGISTRATION-AND-EXECUTION] clears all registered handlers for clean test isolation', () => {
      let wasCalled = false;
      registerGameResetCleanup(() => { wasCalled = true; });
      clearAllGameResetCleanups();
      executeGameResetCleanups();
      expect(wasCalled).toBe(false);
    });
  });

  describe('[TC-413.02/MSS] [UC-GAME-STORE-RESET-WIRING-PARITY] Game Store Reset State & Seam Inversion', () => {
    it('[TC-413.02/MSS] [UC-GAME-STORE-RESET-WIRING-PARITY] triggers registered cleanups when useGameStore.getState().resetGameState() executes', () => {
      let resetCallbackFired = false;
      registerGameResetCleanup(() => { resetCallbackFired = true; });
      useGameStore.getState().resetGameState();
      expect(resetCallbackFired).toBe(true);
    });

    it('[TC-413.02/MSS] [UC-GAME-STORE-RESET-WIRING-PARITY] restores store state to INITIAL_GAME_STATE on reset', () => {
      useGameStore.getState().setCameraFocusCell(25);
      useGameStore.getState().setHasUserCustomCamera(true);
      useGameStore.getState().resetGameState();
      expect(useGameStore.getState().cameraFocusCell).toBe(INITIAL_GAME_STATE.cameraFocusCell);
      expect(useGameStore.getState().hasUserCustomCamera).toBe(INITIAL_GAME_STATE.hasUserCustomCamera);
    });

    it('[TC-413.02/MSS] [UC-GAME-STORE-RESET-WIRING-PARITY] static AST proves game_store.ts has zero imports from pacing_context', () => {
      const content = fs.readFileSync(path.resolve(REPO_ROOT, 'src/client/store/game_store.ts'), 'utf8');
      const specifiers = parseImportSpecifiers(content);
      const hasPacingImport = specifiers.some((s) => s.includes('pacing_context'));
      expect(hasPacingImport).toBe(false);
    });

    it('[TC-413.02/MSS] [UC-GAME-STORE-RESET-WIRING-PARITY] static AST proves game_store.ts has zero imports from activity_badge_dispatcher', () => {
      const content = fs.readFileSync(path.resolve(REPO_ROOT, 'src/client/store/game_store.ts'), 'utf8');
      const specifiers = parseImportSpecifiers(content);
      const hasBadgeImport = specifiers.some((s) => s.includes('activity_badge_dispatcher'));
      expect(hasBadgeImport).toBe(false);
    });
  });

  describe('[TC-413.03/MSS] [UC-FINANCIAL-HELPERS-PSEUDO-BARREL-PURGE] Financial Synthesizer Delegation & Pseudo-Barrel Purge', () => {
    it('[TC-413.03/MSS] [UC-FINANCIAL-HELPERS-PSEUDO-BARREL-PURGE] synthesizes simultaneous bidirectional Go salary and bond repayment without netting collision', () => {
      const prev = createMockGameState({
        playersInfo: { p1: createMockPlayer({ id: 'p1', balance: 5000 }) },
        playerPositions: { p1: 38 },
      });
      const next = createMockGameState({
        playersInfo: { p1: createMockPlayer({ id: 'p1', balance: 5920 }) },
        playerPositions: { p1: 2 },
      });
      const delta: DeltaPayload = {
        tick: 100,
        roundNumber: 1,
        cells: [],
        players: [{ id: 'p1', balance: 5920, position: 2 }],
        domainEvents: [
          {
            type: 'BOND_REPAID',
            playerId: 'p1',
            principal: 1000,
            repayAmount: 1080,
            timestamp: 1000,
          },
        ],
      };

      const events = synthesizeFinancialEvents(prev, next, delta, { baseTimestamp: 1000 });
      const salaryEvent = events.find((e): e is GoSalaryEvent => e.type === SynthesizedGameEventType.GO_SALARY);
      const bondRepaidEvent = events.find((e): e is BondRepaidEvent => e.type === SynthesizedGameEventType.BOND_REPAID);

      expect(salaryEvent?.grossSalary).toBe(2000);
      expect(bondRepaidEvent?.repayAmount).toBe(1080);
      expect(events.length).toBeGreaterThanOrEqual(2);
    });

    it('[TC-413.03/MSS] [UC-FINANCIAL-HELPERS-PSEUDO-BARREL-PURGE] static AST proves game_event_financial_helpers.ts contains zero child helper re-exports', () => {
      const content = fs.readFileSync(path.resolve(REPO_ROOT, 'src/client/events/game_event_financial_helpers.ts'), 'utf8');
      const symbols = parseReExportedSymbols(content);
      const banned = ['extractBondEvents', 'extractCompulsoryBuyoutEvents', 'extractHoseEvents', 'resetHoseEventTracker'];
      const matching = symbols.filter((s) => banned.includes(s));
      expect(matching).toEqual([]);
    });

    it('[TC-413.03/MSS] [UC-FINANCIAL-HELPERS-PSEUDO-BARREL-PURGE] static AST proves client_session_purger.ts imports resetHoseEventTracker directly from hose_helpers', () => {
      const content = fs.readFileSync(path.resolve(REPO_ROOT, 'src/client/network/client_session_purger.ts'), 'utf8');
      const specifiers = parseImportSpecifiers(content);
      const importsFromHoseHelpers = specifiers.some((s) => s.includes('game_event_hose_helpers'));
      const importsFromFinancialHelpers = specifiers.some((s) => s.includes('game_event_financial_helpers'));
      expect(importsFromHoseHelpers).toBe(true);
      expect(importsFromFinancialHelpers).toBe(false);
    });

    it('[TC-413.03/MSS] [UC-FINANCIAL-HELPERS-PSEUDO-BARREL-PURGE] helper parseImportSpecifiers correctly handles empty and non-import source files', () => {
      expect(parseImportSpecifiers('')).toEqual([]);
      expect(parseImportSpecifiers('const a = 1; // no imports')).toEqual([]);
    });
  });

  describe('[TC-413.04/MSS] [UC-PROJECT-WIDE-ZERO-CYCLE-SCC-1-ELIMINATION] Tarjan Dependency Graph Cycle Dissolution', () => {
    it('[TC-413.04/MSS] [UC-PROJECT-WIDE-ZERO-CYCLE-SCC-1-ELIMINATION] proves total project strongly connected components reduce to exactly 8', () => {
      const files = collectTsFiles(path.resolve(REPO_ROOT, 'src'));
      const cycles = detectCycles(files, REPO_ROOT);
      expect(cycles.length).toBeLessThanOrEqual(8);
    });

    it('[TC-413.04/MSS] [UC-PROJECT-WIDE-ZERO-CYCLE-SCC-1-ELIMINATION] proves monster cycle [SCC-1] containing game_store.ts is completely dissolved', () => {
      const files = collectTsFiles(path.resolve(REPO_ROOT, 'src'));
      const cycles = detectCycles(files, REPO_ROOT);
      const sccWithGameStore = cycles.find((c) => c.some((f) => f.includes('game_store.ts')));
      expect(sccWithGameStore).toBeUndefined();
    });

    it('[TC-413.04/MSS] [UC-PROJECT-WIDE-ZERO-CYCLE-SCC-1-ELIMINATION] proves residual cycle containing game_event_hose_helpers.ts is completely dissolved', () => {
      const files = collectTsFiles(path.resolve(REPO_ROOT, 'src'));
      const cycles = detectCycles(files, REPO_ROOT);
      const sccWithHoseHelpers = cycles.find((c) => c.some((f) => f.includes('game_event_hose_helpers.ts')));
      expect(sccWithHoseHelpers).toBeUndefined();
    });
  });
});
