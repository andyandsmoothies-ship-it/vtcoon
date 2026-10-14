// [CONTRACT TEST] IMP-391: Domain & Bot Cycle Breaker (SCC-01..03) & Authoritative Net Worth SSOT
// Universal 5-Facet Behavioral Matrix & Adversarial Inversion Verification
import { describe, it, expect } from 'vitest';
import {
  LEVEL_MULTIPLIER,
  calculateCellNetWorth,
  type PropertyRegistry,
  type PropertyStateMap,
} from '../../src/domain/property_data.js';
import type { Player } from '../../src/domain/room.js';
import { evaluatePlayerNetWorth } from '../../src/domain/bot/bot_posture.js';
import { calculateNetWorth } from '../../src/server/room_manager_queries.js';

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

describe('[IMP-391] Authoritative Net Worth SSOT & Domain/Bot Wiring Contract Suite', () => {
  it('TC-391.01 [UC-NETWORTH-CELL-SSOT-BASE/MSS]: returns base price 4000 for unmortgaged cell 39 at level 0 and 0 for non-purchasable cell 0', () => {
    const cell39Worth = calculateCellNetWorth(39, 0, false);
    const cell39DefaultWorth = calculateCellNetWorth(39);
    const nonDeedWorth = calculateCellNetWorth(0, 0, false);

    expect(cell39Worth).toBe(4000);
    expect(cell39DefaultWorth).toBe(4000);
    expect(nonDeedWorth).toBe(0);
    expect(LEVEL_MULTIPLIER[0]).toBe(1);
  });

  it('TC-391.02 [UC-NETWORTH-CELL-SSOT-UPGRADED/MSS]: returns upgraded valuation 16000 for cell 39 at level 3 and scales across level multipliers', () => {
    const level3Worth = calculateCellNetWorth(39, 3, false);
    const level1Worth = calculateCellNetWorth(39, 1, false);
    const level2Worth = calculateCellNetWorth(39, 2, false);
    const unknownLevelFallbackWorth = calculateCellNetWorth(39, 99, false);

    expect(level3Worth).toBe(16000);
    expect(level1Worth).toBe(6000);
    expect(level2Worth).toBe(10000);
    expect(unknownLevelFallbackWorth).toBe(4000);
  });

  it('TC-391.03 [UC-NETWORTH-CELL-SSOT-MORTGAGE-DEFAULT/A1]: clamps effectiveLevel to 0 when mortgaged even if dirty state passes level 2 and deducts default 50% loan', () => {
    const dirtyMortgagedWorth = calculateCellNetWorth(39, 2, true);
    const cleanMortgagedWorth = calculateCellNetWorth(39, 0, true);
    const cell1DirtyMortgagedWorth = calculateCellNetWorth(1, 3, true);

    expect(dirtyMortgagedWorth).toBe(2000);
    expect(cleanMortgagedWorth).toBe(2000);
    expect(cell1DirtyMortgagedWorth).toBe(300);
  });

  it('TC-391.04 [UC-NETWORTH-CELL-SSOT-MORTGAGE-CUSTOM/A2]: deducts custom 60% MC_URBAN_PLANNING loan 2400 from cell 39 base price to return 1600', () => {
    const customMortgagedWorth = calculateCellNetWorth(39, 0, true, 2400);
    const customDirtyLevelWorth = calculateCellNetWorth(39, 2, true, 2400);
    const cell1CustomMortgagedWorth = calculateCellNetWorth(1, 0, true, 360);

    expect(customMortgagedWorth).toBe(1600);
    expect(customDirtyLevelWorth).toBe(1600);
    expect(cell1CustomMortgagedWorth).toBe(240);
  });

  it('TC-391.05 [UC-NETWORTH-SERVER-WIRING-COMPOSITE/MSS]: computes composite portfolio net worth 15240 via room_manager_queries honoring stateMap.isMortgaged and custom loan 360', () => {
    const p1 = createFixturePlayer('p1', {
      balance: 5000,
      mortgagedProperties: [],
      mortgageLoans: { 1: 360 },
    });
    const p2 = createFixturePlayer('p2', {
      balance: 2000,
    });
    const players: Player[] = [p1, p2];
    const registry: PropertyRegistry = new Map<number, string>([
      [1, 'p1'],
      [39, 'p1'],
      [3, 'p2'],
    ]);
    const stateMap: PropertyStateMap = new Map([
      [1, { level: 0, isMortgaged: true }],
      [39, { level: 2, isMortgaged: false }],
      [3, { level: 3, isMortgaged: false }],
    ]);

    const totalNetWorth = calculateNetWorth('p1', registry, stateMap, players);

    expect(totalNetWorth).toBe(15240);
    expect(calculateCellNetWorth(1, 0, true, 360)).toBe(240);
    expect(calculateCellNetWorth(39, 2, false)).toBe(10000);
    expect(calculateNetWorth('missing_player', registry, stateMap, players)).toBe(0);
  });

  it('TC-391.06 [UC-NETWORTH-BOT-POSTURE-WIRING/MSS]: evaluates bot player net worth 4600 via bot_posture honoring 60% MC_URBAN_PLANNING mortgageLoans in 1:1 parity with server', () => {
    const p1 = createFixturePlayer('p1', {
      balance: 3000,
      mortgagedProperties: [39],
      mortgageLoans: { 39: 2400 },
    });
    const p2Bankrupt = createFixturePlayer('p2', {
      balance: 8000,
      bankrupt: true,
    });
    const players: Player[] = [p1, p2Bankrupt];
    const registry: PropertyRegistry = new Map<number, string>([
      [39, 'p1'],
      [1, 'p2'],
    ]);
    const stateMap: PropertyStateMap = new Map([
      [39, { level: 0, isMortgaged: true }],
      [1, { level: 0, isMortgaged: false }],
    ]);

    const botNetWorth = evaluatePlayerNetWorth('p1', players, registry, stateMap);
    const serverNetWorth = calculateNetWorth('p1', registry, stateMap, players);

    expect(botNetWorth).toBe(4600);
    expect(botNetWorth).toBe(serverNetWorth);
    expect(evaluatePlayerNetWorth('p2', players, registry, stateMap)).toBe(0);
    expect(evaluatePlayerNetWorth('missing_player', players, registry, stateMap)).toBe(0);
  });
});
