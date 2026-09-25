import { describe, it, expect, beforeAll } from 'vitest';
import { createRoom, createPlayer, TurnPhase, type Room, type Player, type MarketModifier } from '../../src/domain/room';
import { ColorGroup } from '../../src/domain/board_config';
import { MarketCardId } from '../../src/domain/event_card_types';
import { PROPERTY_DEEDS, type PropertyRegistry, type PropertyStateMap } from '../../src/domain/property_data';
import { calculateRent } from '../../src/domain/property_rent';
import { mortgageProperty, redeemProperty } from '../../src/server/mortgage_manager';
import { resolveInsolvencyStep } from '../../src/domain/bot/solvency_solver';
import { findEligibleProactiveMortgage } from '../../src/domain/bot/bot_posture';
import { ActionRejectReason } from '../../src/domain/action_reasons';

async function safeImport<T = Record<string, any>>(modulePath: string): Promise<T> {
  try {
    return await import(/* @vite-ignore */ modulePath);
  } catch {
    return {} as T;
  }
}

describe('[TC-192B/MSS][UC-IMP192B] IMP-192B Macro Cycle Economic Engine Contract Suite', () => {
  let macroTypes: any;
  let macroEngine: any;
  let propUpgrade: any;
  let botEngine: any;
  let turnLoop: any;
  let insolvencyMgr: any;

  beforeAll(async () => {
    macroTypes = await safeImport('../../src/domain/macro_cycle_types');
    macroEngine = await safeImport('../../src/domain/macro_cycle_engine');
    propUpgrade = await safeImport('../../src/domain/property_upgrade');
    botEngine = await safeImport('../../src/domain/bot/bot_engine');
    turnLoop = await safeImport('../../src/server/turn_loop');
    insolvencyMgr = await safeImport('../../src/server/insolvency_manager');
  });

  // =========================================================================
  // Facet 1: Boundary & Range — Enums, Constants & Deck Separation
  // =========================================================================
  describe('Facet 1: Boundary & Range — MacroCycleType Enums & Deck Independence', () => {
    it('[TC-192B.01/MSS][UC-IMP192B] MacroCycleType enum values are independent and do NOT pollute 16-card MarketCardId', () => {
      expect(macroTypes.MacroCycleType?.MACRO_LAND_FEVER).toBe('MACRO_LAND_FEVER');
      expect(macroTypes.MacroCycleType?.MACRO_LIQUIDITY_FREEZE).toBe('MACRO_LIQUIDITY_FREEZE');
      expect((Object.values(MarketCardId) as string[]).includes('MACRO_LAND_FEVER')).toBe(false);
      expect(Object.values(MarketCardId).length).toBe(16);
    });
  });

  // =========================================================================
  // Facet 2: State Reactivity & Multi-Turn — Land Fever Activation & Idempotency
  // =========================================================================
  describe('Facet 2: State Reactivity — Land Fever Activation (Rounds 1-3)', () => {
    it('[TC-192B.02/MSS][UC-IMP192B] evaluateMacroCycle at cycleStep === 1 activates MACRO_LAND_FEVER for 3 rounds on a ColorGroup', () => {
      expect(macroEngine.evaluateMacroCycle).toBeDefined();
      const room = createRoom('ROOM01', 'p1');
      room.roundCount = 1;
      room.activeModifiers = [];

      macroEngine.evaluateMacroCycle?.(room, () => 0);

      const feverMod = room.activeModifiers.find(
        (m: MarketModifier) => m.type === macroTypes.MacroCycleType?.MACRO_LAND_FEVER,
      );
      expect(feverMod).toBeDefined();
      expect(feverMod?.remainingRounds).toBe(3);
    });

    it('[TC-192B.03/MSS][UC-IMP192B] evaluateMacroCycle at cycleStep === 1 assigns multiplier 2.5 and records room.activeMacroGroup', () => {
      expect(macroEngine.evaluateMacroCycle).toBeDefined();
      const room = createRoom('ROOM02', 'p1');
      room.roundCount = 1;
      room.activeModifiers = [];

      macroEngine.evaluateMacroCycle?.(room, () => 0);

      const feverMod = room.activeModifiers.find(
        (m: MarketModifier) => m.type === macroTypes.MacroCycleType?.MACRO_LAND_FEVER,
      );
      expect(feverMod?.multiplier).toBe(2.5);
      expect(room.activeMacroGroup).toBeDefined();
      expect(room.activeMacroGroup).toBe(feverMod?.colorGroup);
    });

    it('[TC-192B.04/MSS][UC-IMP192B] evaluateMacroCycle is idempotent during fever phase and does not duplicate modifiers', () => {
      expect(macroEngine.evaluateMacroCycle).toBeDefined();
      const room = createRoom('ROOM03', 'p1');
      room.roundCount = 2;
      room.activeMacroGroup = ColorGroup.Nau;
      room.activeModifiers = [
        {
          type: macroTypes.MacroCycleType?.MACRO_LAND_FEVER ?? 'MACRO_LAND_FEVER',
          affectedCells: [1, 3],
          remainingRounds: 2,
          multiplier: 2.5,
          colorGroup: ColorGroup.Nau,
        } as any,
      ];

      macroEngine.evaluateMacroCycle?.(room, () => 0);

      const count = room.activeModifiers.filter(
        (m: MarketModifier) => m.type === (macroTypes.MacroCycleType?.MACRO_LAND_FEVER ?? 'MACRO_LAND_FEVER'),
      ).length;
      expect(count).toBe(1);
    });
  });

  // =========================================================================
  // Facet 3: Consumer-Side Assertion — Upgrade Cost Discount & Bot Parity
  // =========================================================================
  describe('Facet 3: Upgrade Cost Calculation & Bot Parity', () => {
    it('[TC-192B.05/MSS][UC-IMP192B] calculateUpgradeCost applies 25% discount (MACRO_FEVER_UPGRADE_COST_MULT = 0.75) in fever group', () => {
      expect(propUpgrade.calculateUpgradeCost).toBeDefined();
      const cellIndex = 1; // Do Son (Nau), level 0 upgradeCost: 300
      const modifiers: MarketModifier[] = [
        {
          type: macroTypes.MacroCycleType?.MACRO_LAND_FEVER ?? 'MACRO_LAND_FEVER',
          affectedCells: [1, 3],
          remainingRounds: 3,
          multiplier: 2.5,
          colorGroup: ColorGroup.Nau,
        } as any,
      ];

      const cost = propUpgrade.calculateUpgradeCost?.(cellIndex, 0, modifiers);
      expect(cost).toBe(225); // Math.floor(300 * 0.75)
    });

    it('[TC-192B.06/MSS][UC-IMP192B] calculateUpgradeCost preserves 100% base price for properties outside fever group', () => {
      expect(propUpgrade.calculateUpgradeCost).toBeDefined();
      const cellIndex = 3; // Cat Ba (Nau), base upgradeCost: 300
      const modifiers: MarketModifier[] = [
        {
          type: macroTypes.MacroCycleType?.MACRO_LAND_FEVER ?? 'MACRO_LAND_FEVER',
          affectedCells: [6, 8, 9], // XanhDaTroi
          remainingRounds: 3,
          multiplier: 2.5,
          colorGroup: ColorGroup.XanhDaTroi,
        } as any,
      ];

      const cost = propUpgrade.calculateUpgradeCost?.(cellIndex, 0, modifiers);
      expect(cost).toBe(300);
    });

    it('[TC-192B.07/MSS][UC-IMP192B] bot_engine.ts#getUpgradeCost matches calculateUpgradeCost identically under land fever', () => {
      const cellIndex = 1;
      const stateMap: PropertyStateMap = new Map([[cellIndex, { level: 0 }]]);
      const modifiers: MarketModifier[] = [
        {
          type: macroTypes.MacroCycleType?.MACRO_LAND_FEVER ?? 'MACRO_LAND_FEVER',
          affectedCells: [1, 3],
          remainingRounds: 3,
          multiplier: 2.5,
          colorGroup: ColorGroup.Nau,
        } as any,
      ];

      const botCost = botEngine.getUpgradeCost?.(cellIndex, stateMap, modifiers);
      const sharedCost = propUpgrade.calculateUpgradeCost?.(cellIndex, 0, modifiers);
      expect(botCost).toBe(225);
      expect(botCost).toBe(sharedCost);
    });
  });

  // =========================================================================
  // Facet 4: Error Defense & Floor Guard — Synergistic Stacking & Floor Guard
  // =========================================================================
  describe('Facet 4: Synergistic Stacking & Anti-Exploit Floor Guard', () => {
    it('[TC-192B.08/MSS][UC-IMP192B] MC_CREDIT_STIMULUS (0.8) and MACRO_LAND_FEVER (0.75) stack synergistically to 40% discount', () => {
      expect(propUpgrade.calculateUpgradeCost).toBeDefined();
      const cellIndex = 19; // Da Nang (Cam), base upgradeCost: 1000
      const modifiers: MarketModifier[] = [
        {
          type: MarketCardId.MC_CREDIT_STIMULUS,
          affectedCells: [],
          remainingRounds: 2,
        },
        {
          type: macroTypes.MacroCycleType?.MACRO_LAND_FEVER ?? 'MACRO_LAND_FEVER',
          affectedCells: [16, 18, 19],
          remainingRounds: 2,
          multiplier: 2.5,
          colorGroup: ColorGroup.Cam,
        } as any,
      ];

      const cost = propUpgrade.calculateUpgradeCost?.(cellIndex, 0, modifiers);
      expect(cost).toBe(600); // Math.floor(1000 * 0.8 * 0.75)
    });

    it('[TC-192B.09/MSS][UC-IMP192B] Anti-exploit floor guard ensures calculateUpgradeCost never drops below 50% base cost', () => {
      expect(propUpgrade.calculateUpgradeCost).toBeDefined();
      const cellIndex = 1; // Do Son, base upgradeCost: 300
      const baseCost = PROPERTY_DEEDS.get(cellIndex)!.upgradeCosts![0]!;
      const floor50 = Math.floor(baseCost * (macroTypes.MACRO_UPGRADE_COST_FLOOR ?? 0.50));

      const modifiers: MarketModifier[] = [
        {
          type: MarketCardId.MC_CREDIT_STIMULUS,
          affectedCells: [],
          remainingRounds: 2,
        },
        {
          type: macroTypes.MacroCycleType?.MACRO_LAND_FEVER ?? 'MACRO_LAND_FEVER',
          affectedCells: [1, 3],
          remainingRounds: 2,
          multiplier: 2.5,
          colorGroup: ColorGroup.Nau,
        } as any,
      ];

      const cost = propUpgrade.calculateUpgradeCost?.(cellIndex, 0, modifiers);
      expect(cost).toBeGreaterThanOrEqual(floor50);
      expect(cost).toBe(180); // Math.max(150, 180)
    });
  });

  // =========================================================================
  // Facet 5: Rent Calculation Point of Consumption (x2.5 Land Fever Rent)
  // =========================================================================
  describe('Facet 5: Rent Calculation under Macro Land Fever', () => {
    it('[TC-192B.10/MSS][UC-IMP192B] calculateRent multiplies rent by 2.5x for properties inside land fever ColorGroup', () => {
      expect(macroTypes.MacroCycleType?.MACRO_LAND_FEVER).toBe('MACRO_LAND_FEVER');
      const baseRent = 400;
      const cellIndex = 6; // Binh Duong (XanhDaTroi)
      const modifiers: MarketModifier[] = [
        {
          type: macroTypes.MacroCycleType.MACRO_LAND_FEVER,
          affectedCells: [6, 8, 9],
          remainingRounds: 3,
          multiplier: 2.5,
          colorGroup: ColorGroup.XanhDaTroi,
        } as any,
      ];

      const effectiveRent = calculateRent(baseRent, cellIndex, modifiers);
      expect(effectiveRent).toBe(1000); // 400 * 2.5
    });

    it('[TC-192B.11/MSS][UC-IMP192B] calculateRent leaves unaffected cell rent at 100% normal base rent', () => {
      expect(macroTypes.MacroCycleType?.MACRO_LAND_FEVER).toBe('MACRO_LAND_FEVER');
      const baseRent = 400;
      const cellIndex = 1; // Can Tho (Nau) not in XanhDaTroi
      const modifiers: MarketModifier[] = [
        {
          type: macroTypes.MacroCycleType.MACRO_LAND_FEVER,
          affectedCells: [6, 8, 9],
          remainingRounds: 3,
          multiplier: 2.5,
          colorGroup: ColorGroup.XanhDaTroi,
        } as any,
      ];

      const effectiveRent = calculateRent(baseRent, cellIndex, modifiers);
      expect(effectiveRent).toBe(400);
    });
  });

  // =========================================================================
  // Facet 6: Phase Transition to Liquidity Freeze (Rounds 4-5)
  // =========================================================================
  describe('Facet 6: Transition to Liquidity Freeze (Rounds 4-5)', () => {
    it('[TC-192B.12/MSS][UC-IMP192B] evaluateMacroCycle at cycleStep === 4 activates MACRO_LIQUIDITY_FREEZE on exact fever group', () => {
      expect(macroEngine.evaluateMacroCycle).toBeDefined();
      const room = createRoom('ROOM04', 'p1');
      room.roundCount = 4;
      room.activeMacroGroup = ColorGroup.Cam;
      room.activeModifiers = [];

      macroEngine.evaluateMacroCycle?.(room);

      const freezeMod = room.activeModifiers.find(
        (m: MarketModifier) => m.type === macroTypes.MacroCycleType?.MACRO_LIQUIDITY_FREEZE,
      );
      expect(freezeMod).toBeDefined();
      expect(freezeMod?.colorGroup).toBe(ColorGroup.Cam);
    });

    it('[TC-192B.13/MSS][UC-IMP192B] evaluateMacroCycle at cycleStep === 4 sets freeze duration to 2 rounds and multiplier 0.5', () => {
      expect(macroEngine.evaluateMacroCycle).toBeDefined();
      const room = createRoom('ROOM05', 'p1');
      room.roundCount = 4;
      room.activeMacroGroup = ColorGroup.Cam;
      room.activeModifiers = [];

      macroEngine.evaluateMacroCycle?.(room);

      const freezeMod = room.activeModifiers.find(
        (m: MarketModifier) => m.type === macroTypes.MacroCycleType?.MACRO_LIQUIDITY_FREEZE,
      );
      expect(freezeMod?.remainingRounds).toBe(2);
      expect(freezeMod?.multiplier).toBe(0.5);
    });

    it('[TC-192B.14/MSS][UC-IMP192B] evaluateMacroCycle at cycleStep === 4 safely no-ops if activeMacroGroup is undefined', () => {
      expect(macroEngine.evaluateMacroCycle).toBeDefined();
      const room = createRoom('ROOM06', 'p1');
      room.roundCount = 4;
      room.activeMacroGroup = undefined;
      room.activeModifiers = [];

      macroEngine.evaluateMacroCycle?.(room);

      const count = room.activeModifiers.filter(
        (m: MarketModifier) => m.type === macroTypes.MacroCycleType?.MACRO_LIQUIDITY_FREEZE,
      ).length;
      expect(count).toBe(0);
    });
  });

  // =========================================================================
  // Facet 7: Mortgage Rejection & Redemption Invariant
  // =========================================================================
  describe('Facet 7: Mortgage Rejection & Redemption Invariant during Freeze', () => {
    it('[TC-192B.15/MSS][UC-IMP192B] mortgageProperty rejects mortgage with ActionRejectReason.LIQUIDITY_FROZEN on frozen cell', () => {
      const room = createRoom('ROOM07', 'p1');
      room.started = true;
      room.phase = TurnPhase.PropertyManagement;
      const player = room.players[0]!;
      const cellIndex = 6;

      const registry: PropertyRegistry = new Map([[cellIndex, player.id]]);
      const stateMap: PropertyStateMap = new Map([[cellIndex, { level: 0 }]]);
      room.activeModifiers = [
        {
          type: macroTypes.MacroCycleType?.MACRO_LIQUIDITY_FREEZE ?? 'MACRO_LIQUIDITY_FREEZE',
          affectedCells: [6, 8, 9],
          remainingRounds: 2,
          multiplier: 0.5,
          colorGroup: ColorGroup.XanhDaTroi,
        } as any,
      ];

      const res = mortgageProperty(room, player.id, cellIndex, registry, stateMap);
      expect(res.success).toBe(false);
      expect(res.reason).toBe((ActionRejectReason as any).LIQUIDITY_FROZEN);
      expect((ActionRejectReason as any).LIQUIDITY_FROZEN).toBe('LIQUIDITY_FROZEN');
    });

    it('[TC-192B.16/MSS][UC-IMP192B] mortgageProperty permits mortgaging non-frozen properties in the same room', () => {
      expect(macroTypes.MacroCycleType?.MACRO_LIQUIDITY_FREEZE).toBe('MACRO_LIQUIDITY_FREEZE');
      const room = createRoom('ROOM08', 'p1');
      room.started = true;
      room.phase = TurnPhase.PropertyManagement;
      const player = room.players[0]!;
      const cellIndex = 1; // Can Tho (Nau) - not frozen

      const registry: PropertyRegistry = new Map([
        [6, player.id],
        [cellIndex, player.id],
      ]);
      const stateMap: PropertyStateMap = new Map([
        [6, { level: 0 }],
        [cellIndex, { level: 0 }],
      ]);
      room.activeModifiers = [
        {
          type: macroTypes.MacroCycleType.MACRO_LIQUIDITY_FREEZE,
          affectedCells: [6, 8, 9],
          remainingRounds: 2,
          multiplier: 0.5,
          colorGroup: ColorGroup.XanhDaTroi,
        } as any,
      ];

      const res = mortgageProperty(room, player.id, cellIndex, registry, stateMap);
      expect(res.success).toBe(true);
      expect(player.mortgagedProperties.includes(cellIndex)).toBe(true);
    });

    it('[TC-192B.17/MSS][UC-IMP192B] redeemProperty succeeds normally on frozen property without being blocked', () => {
      expect(macroTypes.MacroCycleType?.MACRO_LIQUIDITY_FREEZE).toBe('MACRO_LIQUIDITY_FREEZE');
      const room = createRoom('ROOM09', 'p1');
      room.started = true;
      room.phase = TurnPhase.PropertyManagement;
      const player = room.players[0]!;
      player.balance = 50_000;
      const cellIndex = 6;
      player.mortgagedProperties = [cellIndex];

      const registry: PropertyRegistry = new Map([[cellIndex, player.id]]);
      const stateMap: PropertyStateMap = new Map([[cellIndex, { level: 0, isMortgaged: true }]]);
      room.activeModifiers = [
        {
          type: macroTypes.MacroCycleType.MACRO_LIQUIDITY_FREEZE,
          affectedCells: [6, 8, 9],
          remainingRounds: 2,
          multiplier: 0.5,
          colorGroup: ColorGroup.XanhDaTroi,
        } as any,
      ];

      const res = redeemProperty(room, player.id, cellIndex, registry, stateMap);
      expect(res.success).toBe(true);
      expect(player.mortgagedProperties.includes(cellIndex)).toBe(false);
    });
  });

  // =========================================================================
  // Facet 8: Bot Solvency Solver & Posture Defense
  // =========================================================================
  describe('Facet 8: Bot Solver & Posture Defense against Frozen Collateral', () => {
    it('[TC-192B.18/MSS][UC-IMP192B] resolveInsolvencyStep filters out frozen properties from mortgage candidate selection', () => {
      const room = createRoom('ROOM10', 'bot1');
      room.started = true;
      const bot = room.players[0]!;
      bot.balance = -500;

      // Cell 1 (Nau, rent 60) is FROZEN; Cell 6 (XanhDaTroi, rent 120) is NOT frozen.
      // Without freeze filter, bot picks Cell 1 (rent 60 < 120).
      // With freeze filter, bot must skip Cell 1 and pick Cell 6.
      const registry: PropertyRegistry = new Map([
        [1, bot.id],
        [6, bot.id],
      ]);
      const stateMap: PropertyStateMap = new Map([
        [1, { level: 0 }],
        [6, { level: 0 }],
      ]);
      room.activeModifiers = [
        {
          type: macroTypes.MacroCycleType?.MACRO_LIQUIDITY_FREEZE ?? 'MACRO_LIQUIDITY_FREEZE',
          affectedCells: [1, 3],
          remainingRounds: 2,
          multiplier: 0.5,
          colorGroup: ColorGroup.Nau,
        } as any,
      ];

      const intent = resolveInsolvencyStep(bot, room, registry, stateMap);
      expect(intent.type).toBe('INTENT_MORTGAGE');
      expect((intent as any).cellIndex).toBe(6);
    });

    it('[TC-192B.19/MSS][UC-IMP192B] findEligibleProactiveMortgage excludes frozen properties from proactive mortgage candidates', () => {
      const room = createRoom('ROOM11', 'bot1');
      room.started = true;
      const bot = room.players[0]!;
      const opponent = createPlayer('opp1');
      room.players.push(opponent);

      // Bot has monopoly on Nau [1, 3] and two singles:
      // Cell 11 (Hong, price 1400) is FROZEN.
      // Cell 6 (XanhDaTroi, price 1000) is NOT frozen.
      // Without freeze filter, bot sorts by price desc and picks Cell 11 (1400 > 1000).
      // With freeze filter, bot must skip Cell 11 and pick Cell 6.
      const registry: PropertyRegistry = new Map([
        [1, bot.id],
        [3, bot.id],
        [11, bot.id],
        [13, opponent.id], // opponent in Hong enables proactive mortgage
        [6, bot.id],
        [8, opponent.id],  // opponent in XanhDaTroi enables proactive mortgage
      ]);
      const stateMap: PropertyStateMap = new Map([
        [1, { level: 0 }],
        [3, { level: 0 }],
        [11, { level: 0 }],
        [13, { level: 0 }],
        [6, { level: 0 }],
        [8, { level: 0 }],
      ]);
      room.activeModifiers = [
        {
          type: macroTypes.MacroCycleType?.MACRO_LIQUIDITY_FREEZE ?? 'MACRO_LIQUIDITY_FREEZE',
          affectedCells: [11, 13, 14],
          remainingRounds: 2,
          multiplier: 0.5,
          colorGroup: ColorGroup.Hong,
        } as any,
      ];

      const candidate = findEligibleProactiveMortgage(bot, room, registry, stateMap);
      expect(candidate).toBe(6);
    });
  });

  // =========================================================================
  // Facet 9: Exceptional Lifecycles — Bankruptcy Boundary & Cascade
  // =========================================================================
  describe('Facet 9: Round Boundary & Bankruptcy Cascade Integration', () => {
    it('[TC-192B.20/MSS][UC-IMP192B] advanceTurnAfterBankruptcy increments roundCount via advanceRoundBoundary when next wraps to 0', () => {
      expect(insolvencyMgr.advanceTurnAfterBankruptcy).toBeDefined();
      const room = createRoom('ROOM12', 'p1');
      room.started = true;
      const p2 = createPlayer('p2');
      room.players.push(p2);
      room.currentPlayerIndex = 1;
      room.roundCount = 1;

      // Turn wraps from player 1 back to player 0
      const advanceFn = insolvencyMgr.advanceTurnAfterBankruptcy;
      advanceFn?.(room);

      expect(room.roundCount).toBe(2);
    });

    it('[TC-192B.21/MSS][UC-IMP192B] advanceTurnAfterBankruptcy triggers macro freeze at Round 4 boundary with deterministic rng', () => {
      expect(insolvencyMgr.advanceTurnAfterBankruptcy).toBeDefined();
      const room = createRoom('ROOM13', 'p1');
      room.started = true;
      const p2 = createPlayer('p2');
      room.players.push(p2);
      room.currentPlayerIndex = 1;
      room.roundCount = 3; // advances to round 4
      room.activeMacroGroup = ColorGroup.Cam;
      room.activeModifiers = [];

      const advanceFn = insolvencyMgr.advanceTurnAfterBankruptcy;
      advanceFn?.(room, () => 0);

      const hasFreeze = room.activeModifiers.some(
        (m: MarketModifier) => m.type === macroTypes.MacroCycleType?.MACRO_LIQUIDITY_FREEZE,
      );
      expect(hasFreeze).toBe(true);
    });
  });

  // =========================================================================
  // Facet 10: Equilibrium / Cooldown Phase (Round 6)
  // =========================================================================
  describe('Facet 10: Equilibrium / Cooldown Phase (Round 6)', () => {
    it('[TC-192B.22/MSS][UC-IMP192B] evaluateMacroCycle at cycleStep === 6 resets room.activeMacroGroup to undefined', () => {
      expect(macroEngine.evaluateMacroCycle).toBeDefined();
      const room = createRoom('ROOM14', 'p1');
      room.roundCount = 6;
      room.activeMacroGroup = ColorGroup.Cam;
      room.activeModifiers = [];

      macroEngine.evaluateMacroCycle?.(room);

      expect(room.activeMacroGroup).toBeUndefined();
      const freezeCount = room.activeModifiers.filter(
        (m: MarketModifier) => m.type === macroTypes.MacroCycleType?.MACRO_LIQUIDITY_FREEZE,
      ).length;
      expect(freezeCount).toBe(0);
    });
  });
});
