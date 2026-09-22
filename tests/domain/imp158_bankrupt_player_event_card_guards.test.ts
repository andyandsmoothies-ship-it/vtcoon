// [TC-IMP158/MSS][UC-GAME-038..041] IMP-158: Bankrupt Player Event Card Isolation & Treasury Integrity Guards
// Traceability: docs/plans/improvements/IMP-158-bankrupt-player-event-card-guard_plan.md, .agents/audit/PLAN_AUDIT_IMP158.md

import { describe, it, expect } from 'vitest';
import { createPlayer, createRoom } from '../../src/domain/room';
import {
  MarketCardId,
  ChanceCardId,
} from '../../src/domain/event_card_types';
import { executeMarketCard, executeChanceCard } from '../../src/domain/card_handlers';
import { isEligibleForCompulsoryBuyout } from '../../src/domain/compulsory_buyout';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_data';

describe('[IMP-158: Station 1 RED] Bankrupt Player Event Card Isolation & Treasury Integrity Guards Contract', () => {
  // =========================================================================
  // FACET 1: Boundary & Range
  // =========================================================================
  describe('Facet 1: Boundary & Range', () => {
    it('[TC-IMP158.01/MSS][UC-GAME-038..041][IMP-158] CC_CONTRACT_PENALTY: all opponents bankrupt -> 1000 Tr penalty deposited to room.treasury', () => {
      const drawer = createPlayer('player_drawer');
      drawer.balance = 15000;
      const deadOpponent = createPlayer('player_dead');
      deadOpponent.balance = 0;
      deadOpponent.bankrupt = true;
      const room = createRoom('player_drawer');
      room.treasury = 5000;
      room.players = [drawer, deadOpponent];

      executeChanceCard(ChanceCardId.CC_CONTRACT_PENALTY, drawer.id, [drawer, deadOpponent], [], undefined, undefined, undefined, room);

      expect(drawer.balance).toBe(14000);
      expect(deadOpponent.balance).toBe(0);
      expect(room.treasury).toBe(6000);
    });

    it('[TC-IMP158.02/MSS][UC-GAME-038..041][IMP-158] CC_FRANCHISE: all opponents bankrupt -> drawer collects 0 Tr, zero ghost money minted', () => {
      const drawer = createPlayer('player_drawer');
      drawer.balance = 15000;
      const dead1 = createPlayer('player_dead_1');
      dead1.balance = 0;
      dead1.bankrupt = true;
      const dead2 = createPlayer('player_dead_2');
      dead2.balance = 0;
      dead2.bankrupt = true;

      executeChanceCard(ChanceCardId.CC_FRANCHISE, drawer.id, [drawer, dead1, dead2]);

      expect(drawer.balance).toBe(15000);
      expect(dead1.balance).toBe(0);
      expect(dead2.balance).toBe(0);
    });

    it('[TC-IMP158.03/MSS][UC-GAME-038..041][IMP-158] distributeCellPool: players undefined or empty -> safe exit, zero crash', () => {
      expect(() => {
        executeMarketCard(MarketCardId.MC_NIGHT_ECONOMY, [], undefined);
      }).not.toThrow();
      expect(() => {
        executeMarketCard(MarketCardId.MC_NIGHT_ECONOMY, [], []);
      }).not.toThrow();
    });

    it('[TC-IMP158.04/MSS][UC-GAME-038..041][IMP-158] handleCasinoPilot: all players bankrupt -> zero disbursement, treasury untouched', () => {
      const dead1 = createPlayer('player_dead_1');
      dead1.balance = 0;
      dead1.bankrupt = true;
      const dead2 = createPlayer('player_dead_2');
      dead2.balance = 0;
      dead2.bankrupt = true;
      const room = createRoom('player_dead_1');
      room.treasury = 10000;
      room.players = [dead1, dead2];

      executeMarketCard(MarketCardId.MC_CASINO_PILOT, [], [dead1, dead2], new Map(), new Map(), room);

      expect(dead1.balance).toBe(0);
      expect(dead2.balance).toBe(0);
      expect(room.treasury).toBe(10000);
    });

    it('[TC-IMP158.05/MSS][UC-GAME-038..041][IMP-158] isEligibleForCompulsoryBuyout: returns false if owner.bankrupt is true', () => {
      const bankruptOwner = createPlayer('player_bankrupt_owner');
      bankruptOwner.balance = 0;
      bankruptOwner.bankrupt = true;
      const registry: PropertyRegistry = new Map([[1, bankruptOwner.id]]);
      const stateMap: PropertyStateMap = new Map([[1, { level: 0 }]]);

      const result = isEligibleForCompulsoryBuyout(1, bankruptOwner.id, registry, stateMap, undefined, [bankruptOwner]);

      expect(result).toBe(false);
    });
  });

  // =========================================================================
  // FACET 2: State Reactivity & Multi-Turn Teardown
  // =========================================================================
  describe('Facet 2: State Reactivity & Flow Isolation', () => {
    it('[TC-IMP158.06/MSS][UC-GAME-038..041][IMP-158] CC_CONTRACT_PENALTY: 3-player board (1 drawer, 1 alive 5000, 1 bankrupt 0) -> alive gets 1000, bankrupt gets 0', () => {
      const drawer = createPlayer('player_drawer');
      drawer.balance = 10000;
      const alive = createPlayer('player_alive');
      alive.balance = 5000;
      const dead = createPlayer('player_dead');
      dead.balance = 0;
      dead.bankrupt = true;

      executeChanceCard(ChanceCardId.CC_CONTRACT_PENALTY, drawer.id, [drawer, alive, dead]);

      expect(drawer.balance).toBe(9000);
      expect(alive.balance).toBe(6000);
      expect(dead.balance).toBe(0);
    });

    it('[TC-IMP158.07/MSS][UC-GAME-038..041][IMP-158] CC_FRANCHISE: 4-player board (1 drawer, 1 alive, 2 bankrupt) -> drawer collects only 800 from alive', () => {
      const drawer = createPlayer('player_drawer');
      drawer.balance = 10000;
      const alive = createPlayer('player_alive');
      alive.balance = 5000;
      const dead1 = createPlayer('player_dead_1');
      dead1.balance = 0;
      dead1.bankrupt = true;
      const dead2 = createPlayer('player_dead_2');
      dead2.balance = 0;
      dead2.bankrupt = true;

      executeChanceCard(ChanceCardId.CC_FRANCHISE, drawer.id, [drawer, alive, dead1, dead2]);

      expect(drawer.balance).toBe(10800);
      expect(alive.balance).toBe(4200);
      expect(dead1.balance).toBe(0);
      expect(dead2.balance).toBe(0);
    });

    it('[TC-IMP158.08/MSS][UC-GAME-038..041][IMP-158] MC_MEGA_CONCERT: bankrupt players do not have position changed', () => {
      const alive = createPlayer('player_alive');
      alive.position = 0;
      const dead = createPlayer('player_dead');
      dead.position = 10;
      dead.bankrupt = true;
      const registry: PropertyRegistry = new Map([[6, alive.id]]);
      const stateMap: PropertyStateMap = new Map([[6, { level: 1 }]]);

      executeMarketCard(MarketCardId.MC_MEGA_CONCERT, [], [alive, dead], registry, stateMap);

      expect(alive.position).toBe(6);
      expect(dead.position).toBe(10);
    });

    it('[TC-IMP158.09/MSS][UC-GAME-038..041][IMP-158] MC_MEGA_CONCERT: bankrupt players do not pay rent to venue owner', () => {
      const owner = createPlayer('player_owner');
      owner.balance = 10000;
      const visitor = createPlayer('player_visitor');
      visitor.balance = 10000;
      const dead = createPlayer('player_dead');
      dead.balance = 0;
      dead.bankrupt = true;
      const registry: PropertyRegistry = new Map([[6, owner.id]]);
      const stateMap: PropertyStateMap = new Map([[6, { level: 1 }]]);

      // resolveRent for cell 6 at level 1 is 480
      executeMarketCard(MarketCardId.MC_MEGA_CONCERT, [], [owner, visitor, dead], registry, stateMap);

      expect(dead.balance).toBe(0);
      expect(visitor.balance).toBe(9520);
      expect(owner.balance).toBe(10480);
    });

    it('[TC-IMP158.10/MSS][UC-GAME-038..041][IMP-158] MC_MEGA_CONCERT: venue selection skips C3 property owned by bankrupt player in favor of living player property', () => {
      const aliveOwner = createPlayer('player_alive_owner');
      aliveOwner.position = 0;
      const aliveGuest = createPlayer('player_alive_guest');
      aliveGuest.position = 0;
      const deadOwner = createPlayer('player_dead_owner');
      deadOwner.position = 0;
      deadOwner.bankrupt = true;

      // deadOwner has cell 27 at level 3; aliveOwner has cell 26 at level 1
      const registry: PropertyRegistry = new Map([
        [27, deadOwner.id],
        [26, aliveOwner.id],
      ]);
      const stateMap: PropertyStateMap = new Map([
        [27, { level: 3 }],
        [26, { level: 1 }],
      ]);

      executeMarketCard(MarketCardId.MC_MEGA_CONCERT, [], [aliveOwner, aliveGuest, deadOwner], registry, stateMap);

      expect(aliveGuest.position).toBe(26);
      expect(aliveOwner.position).toBe(26);
    });

    it('[TC-IMP158.11/MSS][UC-GAME-038..041][IMP-158] MC_PUBLIC_INVEST: only pays 400 Tr base stimulus to alive players; treasury deduction matches exact sum disbursed', () => {
      const alive1 = createPlayer('player_alive_1');
      alive1.balance = 10000;
      const alive2 = createPlayer('player_alive_2');
      alive2.balance = 10000;
      const dead = createPlayer('player_dead');
      dead.balance = 0;
      dead.bankrupt = true;
      const room = createRoom('player_alive_1');
      room.treasury = 10000;
      room.players = [alive1, alive2, dead];

      executeMarketCard(MarketCardId.MC_PUBLIC_INVEST, [], [alive1, alive2, dead], new Map(), new Map(), room);

      expect(alive1.balance).toBe(10400);
      expect(alive2.balance).toBe(10400);
      expect(dead.balance).toBe(0);
      expect(room.treasury).toBe(9200);
    });

    it('[TC-IMP158.12/MSS][UC-GAME-038..041][IMP-158] MC_PUBLIC_INVEST: bankrupt player owning infra cells receives 0 Tr bonus, treasury not drained', () => {
      const alive = createPlayer('player_alive');
      alive.balance = 10000;
      const dead = createPlayer('player_dead');
      dead.balance = 0;
      dead.bankrupt = true;
      const registry: PropertyRegistry = new Map([
        [5, dead.id],
        [15, dead.id],
      ]);
      const room = createRoom('player_alive');
      room.treasury = 10000;
      room.players = [alive, dead];

      executeMarketCard(MarketCardId.MC_PUBLIC_INVEST, [], [alive, dead], registry, new Map(), room);

      expect(alive.balance).toBe(10400);
      expect(dead.balance).toBe(0);
      expect(room.treasury).toBe(9600);
    });

    it('[TC-IMP158.13/MSS][UC-GAME-038..041][IMP-158] distributeCellPool: pool scales by alive players count; bankrupt players not charged fee', () => {
      const alive1 = createPlayer('player_alive_1');
      alive1.balance = 10000;
      const alive2 = createPlayer('player_alive_2');
      alive2.balance = 10000;
      const dead = createPlayer('player_dead');
      dead.balance = 0;
      dead.bankrupt = true;

      // MC_NIGHT_ECONOMY: fee 400, dividend 100 per alive player per cell (cells: 6, 8, 26, 27)
      // alive1 owns cell 6; cells 8, 26, 27 unowned
      const registry: PropertyRegistry = new Map([[6, alive1.id]]);

      executeMarketCard(MarketCardId.MC_NIGHT_ECONOMY, [], [alive1, alive2, dead], registry);

      // 2 alive players -> fee 400 each. poolPerCell = 100 * 2 = 200.
      // alive1 pays 400 fee, gets 200 for cell 6 -> balance = 10000 - 400 + 200 = 9800
      // alive2 pays 400 fee -> balance = 10000 - 400 = 9600
      // dead pays 0 fee -> balance = 0
      expect(alive1.balance).toBe(9800);
      expect(alive2.balance).toBe(9600);
      expect(dead.balance).toBe(0);
    });

    it('[TC-IMP158.14/MSS][UC-GAME-038..041][IMP-158] distributeCellPool: bankrupt property owner does not receive pool; pool routes to treasury', () => {
      const alive1 = createPlayer('player_alive_1');
      alive1.balance = 10000;
      const alive2 = createPlayer('player_alive_2');
      alive2.balance = 10000;
      const dead = createPlayer('player_dead');
      dead.balance = 0;
      dead.bankrupt = true;

      // Dead player owns cell 6 (SERVICE_CELL). Cells 8, 26, 27 unowned.
      const registry: PropertyRegistry = new Map([[6, dead.id]]);
      const room = createRoom('player_alive_1');
      room.treasury = 5000;
      room.players = [alive1, alive2, dead];

      executeMarketCard(MarketCardId.MC_NIGHT_ECONOMY, [], [alive1, alive2, dead], registry, new Map(), room);

      // 2 alive players -> poolPerCell = 100 * 2 = 200.
      // Cell 6 owner is dead -> cell 6 pool (200) + 3 unowned cells (3 * 200 = 600) -> 800 deposited into treasury.
      expect(dead.balance).toBe(0);
      expect(room.treasury).toBe(5800);
    });

    it('[TC-IMP158.15/MSS][UC-GAME-038..041][IMP-158] handleCasinoPilot: poorest alive player receives 1000 Tr stimulus; bankrupt poorest player ignored', () => {
      const richAlive = createPlayer('player_rich_alive');
      richAlive.balance = 10000;
      const poorAlive = createPlayer('player_poor_alive');
      poorAlive.balance = 3000;
      const dead = createPlayer('player_dead');
      dead.balance = 0;
      dead.bankrupt = true;
      const room = createRoom('player_rich_alive');
      room.treasury = 5000;
      room.players = [richAlive, poorAlive, dead];

      executeMarketCard(MarketCardId.MC_CASINO_PILOT, [], [richAlive, poorAlive, dead], new Map(), new Map(), room);

      expect(poorAlive.balance).toBe(4000);
      expect(dead.balance).toBe(0);
      expect(room.treasury).toBe(4000);
    });

    it('[TC-IMP158.16/MSS][UC-GAME-038..041][IMP-158] handleFireInspection: does not penalize bankrupt players and does not credit phantom fines to treasury', () => {
      const alive = createPlayer('player_alive');
      alive.balance = 10000;
      const dead = createPlayer('player_dead');
      dead.balance = 0;
      dead.bankrupt = true;
      const registry: PropertyRegistry = new Map([
        [1, alive.id],
        [3, dead.id],
      ]);
      const stateMap: PropertyStateMap = new Map([
        [1, { level: 1 }], // penalty 200
        [3, { level: 2 }], // penalty 400 (phantom)
      ]);
      const room = createRoom('player_alive');
      room.treasury = 1000;
      room.players = [alive, dead];

      executeMarketCard(MarketCardId.MC_FIRE_INSPECTION, [], [alive, dead], registry, stateMap, room);

      expect(alive.balance).toBe(9800);
      expect(dead.balance).toBe(0);
      expect(room.treasury).toBe(1200);
    });
  });

  // =========================================================================
  // FACET 3: Resource Disposal & Cleanup
  // =========================================================================
  describe('Facet 3: Resource Disposal & Cleanup', () => {
    it('[TC-IMP158.17/MSS][UC-GAME-038..041][IMP-158] handleCoastalStormDamage: does not subtract damage from bankrupt players', () => {
      const alive = createPlayer('player_alive');
      alive.balance = 10000;
      const dead = createPlayer('player_dead');
      dead.balance = 0;
      dead.bankrupt = true;
      const registry: PropertyRegistry = new Map([
        [11, alive.id],
        [14, dead.id],
      ]);
      const stateMap: PropertyStateMap = new Map([
        [11, { level: 1 }], // damage 400
        [14, { level: 2 }], // damage 800 (phantom)
      ]);
      const room = createRoom('player_alive');
      room.treasury = 1000;
      room.players = [alive, dead];

      executeMarketCard(MarketCardId.MC_COASTAL_STORM, [], [alive, dead], registry, stateMap, room);

      expect(alive.balance).toBe(9600);
      expect(dead.balance).toBe(0);
      expect(room.treasury).toBe(1400);
    });

    it('[TC-IMP158.18/MSS][UC-GAME-038..041][IMP-158] handleAntiSpeculate: does not penalize bankrupt players', () => {
      const dead = createPlayer('player_dead');
      dead.balance = 0;
      dead.bankrupt = true;
      const registry: PropertyRegistry = new Map([
        [1, dead.id],
        [3, dead.id],
        [6, dead.id],
        [8, dead.id],
      ]);
      const room = createRoom('player_dead');
      room.treasury = 1000;
      room.players = [dead];

      executeMarketCard(MarketCardId.MC_ANTI_SPECULATE, [], [dead], registry, undefined, room);

      expect(dead.balance).toBe(0);
      expect(room.treasury).toBe(1000);
    });

    it('[TC-IMP158.19/MSS][UC-GAME-038..041][IMP-158] handleMaForce: ignores properties owned by bankrupt players, activating treasury subsidy fallback', () => {
      const buyer = createPlayer('player_buyer');
      buyer.balance = 10000;
      const deadSeller = createPlayer('player_dead_seller');
      deadSeller.balance = 0;
      deadSeller.bankrupt = true;
      const registry: PropertyRegistry = new Map([[1, deadSeller.id]]);
      const stateMap: PropertyStateMap = new Map([[1, { level: 0 }]]);
      const room = createRoom('player_buyer');
      room.treasury = 5000;
      room.players = [buyer, deadSeller];

      executeChanceCard(ChanceCardId.CC_MA_FORCE, buyer.id, [buyer, deadSeller], [], registry, stateMap, undefined, room);

      expect(buyer.balance).toBe(10800); // 10000 + 800 fallback subsidy
      expect(deadSeller.balance).toBe(0);
      expect(registry.get(1)).toBe(deadSeller.id); // Not transferred
      expect(room.treasury).toBe(4200); // 5000 - 800
    });
  });

  // =========================================================================
  // FACET 4: Error Defense & Invariant Hardening
  // =========================================================================
  describe('Facet 4: Error Defense & Invariant Hardening', () => {
    it('[TC-IMP158.20/MSS][UC-GAME-038..041][IMP-158] Error Defense: mixed alive/bankrupt setups preserve zero treasury leaks across CC_CONTRACT_PENALTY', () => {
      const drawer = createPlayer('player_drawer');
      drawer.balance = 15000;
      const dead1 = createPlayer('player_dead_1');
      dead1.balance = 0;
      dead1.bankrupt = true;
      const dead2 = createPlayer('player_dead_2');
      dead2.balance = 0;
      dead2.bankrupt = true;
      const room = createRoom('player_drawer');
      room.treasury = 5000;
      room.players = [drawer, dead1, dead2];

      const totalBefore = drawer.balance + dead1.balance + dead2.balance + room.treasury;
      executeChanceCard(ChanceCardId.CC_CONTRACT_PENALTY, drawer.id, [drawer, dead1, dead2], [], undefined, undefined, undefined, room);
      const totalAfter = drawer.balance + dead1.balance + dead2.balance + room.treasury;

      expect(totalAfter).toBe(totalBefore);
      expect(room.treasury).toBe(6000);
    });

    it('[TC-IMP158.21/MSS][UC-GAME-038..041][IMP-158] MC_CASINO_PILOT: awardServiceBonus ignores bankrupt owner of cell 27 C3 and routes stimulus to poorest alive', () => {
      const alive = createPlayer('player_alive');
      alive.balance = 2000;
      const dead = createPlayer('player_dead');
      dead.balance = 0;
      dead.bankrupt = true;
      const registry: PropertyRegistry = new Map([[27, dead.id]]);
      const stateMap: PropertyStateMap = new Map([[27, { level: 3 }]]);
      const room = createRoom('player_alive');
      room.treasury = 10000;
      room.players = [alive, dead];

      executeMarketCard(MarketCardId.MC_CASINO_PILOT, [], [alive, dead], registry, stateMap, room);

      expect(dead.balance).toBe(0);
      expect(alive.balance).toBe(3000);
      expect(room.treasury).toBe(9000);
    });

    it('[TC-IMP158.22/MSS][UC-GAME-038..041][IMP-158] isEligibleForCompulsoryBuyout: resolves owner via room.players and returns false if bankrupt', () => {
      const bankruptOwner = createPlayer('player_bankrupt_owner');
      bankruptOwner.balance = 0;
      bankruptOwner.bankrupt = true;
      const buyer = createPlayer('player_buyer');
      buyer.balance = 15000;
      const room = createRoom('player_buyer');
      room.players = [buyer, bankruptOwner];
      const registry: PropertyRegistry = new Map([[1, bankruptOwner.id]]);
      const stateMap: PropertyStateMap = new Map([[1, { level: 0 }]]);

      const result = isEligibleForCompulsoryBuyout(1, bankruptOwner.id, registry, stateMap, room);

      expect(result).toBe(false);
    });
  });
});
