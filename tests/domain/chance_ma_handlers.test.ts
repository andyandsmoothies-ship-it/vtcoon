// [IMP-309] Living Contract Tests: Corporate M&A and Compulsory Buyout Handlers
import { describe, it, expect } from 'vitest';
import {
  handleMaForce,
  handleSwapProject,
  applyCompensatorySubsidy,
} from '../../src/domain/chance_ma_handlers.js';
import { createPlayer, createRoom } from '../../src/domain/room.js';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_data.js';
import { PROPERTY_DEEDS } from '../../src/domain/property_data.js';

describe('Station 1 Contract Tests: Corporate M&A & Compulsory Buyout Handlers', () => {
  it('TC-CMA-SUB.01 [UC-CMA-SUB/MSS] applyCompensatorySubsidy awards default 800 Tr. subsidy and deducts from room treasury', () => {
    const player = createPlayer('p-sub-1');
    player.balance = 1000;
    const room = createRoom('R-SUB-1', player.id);
    room.treasury = 2000;

    applyCompensatorySubsidy(player, room);

    expect(player.balance).toBe(1800);
    expect(room.treasury).toBe(1200);
  });

  it('TC-CMA-SUB.02 [UC-CMA-SUB/MSS] applyCompensatorySubsidy handles missing room safely without crashing', () => {
    const player = createPlayer('p-sub-2');
    player.balance = 500;

    applyCompensatorySubsidy(player, undefined, 1000);

    expect(player.balance).toBe(1500);
  });

  it('TC-CMA-SUB.03 [UC-CMA-SUB/MSS] applyCompensatorySubsidy clamps room treasury at zero when subsidy exceeds treasury balance', () => {
    const player = createPlayer('p-sub-3');
    player.balance = 1000;
    const room = createRoom('R-SUB-2', player.id);
    room.treasury = 300;

    applyCompensatorySubsidy(player, room, 800);

    expect(player.balance).toBe(1800);
    expect(room.treasury).toBe(0);
  });

  it('TC-CMA-MAF.01 [UC-CMA-MAF/MSS] handleMaForce acquires unmortgaged C0 property at 1.2x deed price and transfers ownership', () => {
    const buyer = createPlayer('buyer-1');
    buyer.balance = 10000;
    const seller = createPlayer('seller-1');
    seller.balance = 2000;
    const cellIndex = 1; // Standard C0 property
    const deedPrice = PROPERTY_DEEDS.get(cellIndex)?.price ?? 1000;
    const expectedCost = Math.floor(deedPrice * 1.2);

    const registry: PropertyRegistry = new Map([[cellIndex, seller.id]]);
    const stateMap: PropertyStateMap = new Map([[cellIndex, { level: 0 }]]);
    const room = createRoom('R-MAF-1', buyer.id);
    room.players = [buyer, seller];

    handleMaForce(buyer, [buyer, seller], registry, stateMap, room);

    expect(registry.get(cellIndex)).toBe(buyer.id);
    expect(buyer.balance).toBe(10000 - expectedCost);
    expect(seller.balance).toBe(2000 + expectedCost);
    expect(room.lastMaBuyout?.cellIndex).toBe(cellIndex);
  });

  it('TC-CMA-MAF.02 [UC-CMA-MAF/A1] handleMaForce skips mortgaged property in stateMap and falls back to treasury subsidy', () => {
    const buyer = createPlayer('buyer-2');
    buyer.balance = 5000;
    const seller = createPlayer('seller-2');
    seller.balance = 1000;
    const cellIndex = 1;

    const registry: PropertyRegistry = new Map([[cellIndex, seller.id]]);
    const stateMap: PropertyStateMap = new Map([[cellIndex, { level: 0, isMortgaged: true }]]);
    const room = createRoom('R-MAF-2', buyer.id);
    room.treasury = 3000;
    room.players = [buyer, seller];

    handleMaForce(buyer, [buyer, seller], registry, stateMap, room);

    expect(registry.get(cellIndex)).toBe(seller.id);
    expect(buyer.balance).toBe(5800);
    expect(room.treasury).toBe(2200);
    expect(room.lastMaBuyout).toBeUndefined();
  });

  it('TC-CMA-MAF.03 [UC-CMA-MAF/A2] handleMaForce skips upgraded level > 0 property and provides treasury subsidy', () => {
    const buyer = createPlayer('buyer-3');
    buyer.balance = 5000;
    const seller = createPlayer('seller-3');
    const cellIndex = 1;

    const registry: PropertyRegistry = new Map([[cellIndex, seller.id]]);
    const stateMap: PropertyStateMap = new Map([[cellIndex, { level: 1 }]]);
    const room = createRoom('R-MAF-3', buyer.id);
    room.treasury = 1500;
    room.players = [buyer, seller];

    handleMaForce(buyer, [buyer, seller], registry, stateMap, room);

    expect(registry.get(cellIndex)).toBe(seller.id);
    expect(buyer.balance).toBe(5800);
    expect(room.treasury).toBe(700);
  });

  it('TC-CMA-MAF.04 [UC-CMA-MAF/A3] handleMaForce grants subsidy when buyer balance is insufficient for 1.2x deed price', () => {
    const buyer = createPlayer('buyer-4');
    buyer.balance = 100; // Not enough for cell 1 (price 1000 * 1.2 = 1200)
    const seller = createPlayer('seller-4');
    const cellIndex = 1;

    const registry: PropertyRegistry = new Map([[cellIndex, seller.id]]);
    const stateMap: PropertyStateMap = new Map([[cellIndex, { level: 0 }]]);
    const room = createRoom('R-MAF-4', buyer.id);
    room.treasury = 2000;
    room.players = [buyer, seller];

    handleMaForce(buyer, [buyer, seller], registry, stateMap, room);

    expect(registry.get(cellIndex)).toBe(seller.id);
    expect(buyer.balance).toBe(900);
    expect(room.treasury).toBe(1200);
  });

  it('TC-CMA-MAF.05 [UC-CMA-MAF/A4] handleMaForce returns early when registry is undefined', () => {
    const buyer = createPlayer('buyer-5');
    buyer.balance = 5000;
    const seller = createPlayer('seller-5');

    handleMaForce(buyer, [buyer, seller], undefined);

    expect(buyer.balance).toBe(5000);
  });

  it('TC-CMA-SWAP.01 [UC-CMA-SWAP/MSS] handleSwapProject stages pendingBuyout on room for human player with eligible targets', () => {
    const humanBuyer = createPlayer('human-buyer');
    humanBuyer.isBot = false;
    humanBuyer.balance = 5000;
    const seller = createPlayer('seller-swap-1');
    seller.balance = 1000;
    const cellIndex = 1; // Eligible C0 property

    const registry: PropertyRegistry = new Map([[cellIndex, seller.id]]);
    const stateMap: PropertyStateMap = new Map([[cellIndex, { level: 0 }]]);
    const room = createRoom('R-SWAP-1', humanBuyer.id);
    room.players = [humanBuyer, seller];

    handleSwapProject(humanBuyer, registry, stateMap, room, [humanBuyer, seller]);

    expect(room.pendingBuyout).not.toBeNull();
    expect(room.pendingBuyout?.buyerId).toBe(humanBuyer.id);
    expect(room.pendingBuyout?.sellerId).toBe(seller.id);
    expect(room.pendingBuyout?.cellIndex).toBe(cellIndex);
  });

  it('TC-CMA-SWAP.02 [UC-CMA-SWAP/A1] handleSwapProject falls back to 1000 Tr. subsidy when no opponent C0 cells exist', () => {
    const humanBuyer = createPlayer('human-buyer-2');
    humanBuyer.isBot = false;
    humanBuyer.balance = 3000;
    const room = createRoom('R-SWAP-2', humanBuyer.id);
    room.treasury = 2500;
    const registry: PropertyRegistry = new Map(); // No cells owned by anyone

    handleSwapProject(humanBuyer, registry, undefined, room);

    expect(humanBuyer.balance).toBe(4000);
    expect(room.treasury).toBe(1500);
    expect(room.pendingBuyout).toBeUndefined();
  });

  it('TC-CMA-SWAP.03 [UC-CMA-SWAP/A2] handleSwapProject grants 800 Tr. subsidy to human player if balance is below minCost', () => {
    const humanBuyer = createPlayer('human-buyer-3');
    humanBuyer.isBot = false;
    humanBuyer.balance = 100; // Far below buyout cost
    const seller = createPlayer('seller-swap-3');
    const cellIndex = 1;

    const registry: PropertyRegistry = new Map([[cellIndex, seller.id]]);
    const stateMap: PropertyStateMap = new Map([[cellIndex, { level: 0 }]]);
    const room = createRoom('R-SWAP-3', humanBuyer.id);
    room.treasury = 2000;
    room.players = [humanBuyer, seller];

    handleSwapProject(humanBuyer, registry, stateMap, room, [humanBuyer, seller]);

    expect(humanBuyer.balance).toBe(900);
    expect(room.treasury).toBe(1200);
    expect(room.pendingBuyout).toBeUndefined();
  });

  it('TC-CMA-SWAP.04 [UC-CMA-SWAP/MSS] handleSwapProject buys immediately and transfers ownership for bot player', () => {
    const botBuyer = createPlayer('bot-buyer-1');
    botBuyer.isBot = true;
    botBuyer.balance = 10000;
    const seller = createPlayer('seller-swap-4');
    seller.balance = 2000;
    const cellIndex = 1;

    const registry: PropertyRegistry = new Map([[cellIndex, seller.id]]);
    const stateMap: PropertyStateMap = new Map([[cellIndex, { level: 0 }]]);
    const room = createRoom('R-SWAP-4', botBuyer.id);
    room.players = [botBuyer, seller];

    handleSwapProject(botBuyer, registry, stateMap, room, [botBuyer, seller]);

    expect(registry.get(cellIndex)).toBe(botBuyer.id);
    expect(botBuyer.balance).toBeLessThan(10000);
    expect(seller.balance).toBeGreaterThan(2000);
    expect(room.pendingBuyout).toBeNull();
  });

  it('TC-CMA-SWAP.05 [UC-CMA-SWAP/A3] handleSwapProject provides subsidy to bot when no target leaves safe buffer (1000 Tr.)', () => {
    const botBuyer = createPlayer('bot-buyer-2');
    botBuyer.isBot = true;
    botBuyer.balance = 1500; // Cost is ~1300, 1500 - 1300 = 200 < 1000 safety buffer
    const seller = createPlayer('seller-swap-5');
    const cellIndex = 1;

    const registry: PropertyRegistry = new Map([[cellIndex, seller.id]]);
    const stateMap: PropertyStateMap = new Map([[cellIndex, { level: 0 }]]);
    const room = createRoom('R-SWAP-5', botBuyer.id);
    room.treasury = 2000;
    room.players = [botBuyer, seller];

    handleSwapProject(botBuyer, registry, stateMap, room, [botBuyer, seller]);

    expect(registry.get(cellIndex)).toBe(seller.id);
    expect(botBuyer.balance).toBe(2300);
    expect(room.treasury).toBe(1200);
  });

  it('TC-CMA-SWAP.06 [UC-CMA-SWAP/MSS] handleSwapProject human player without room executes buyout directly without modal', () => {
    const humanBuyer = createPlayer('human-buyer-4');
    humanBuyer.isBot = false;
    humanBuyer.balance = 10000;
    const seller = createPlayer('seller-swap-6');
    seller.balance = 1000;
    const cellIndex = 1;

    const registry: PropertyRegistry = new Map([[cellIndex, seller.id]]);
    const stateMap: PropertyStateMap = new Map([[cellIndex, { level: 0 }]]);

    handleSwapProject(humanBuyer, registry, stateMap, undefined, [humanBuyer, seller]);

    expect(registry.get(cellIndex)).toBe(humanBuyer.id);
    expect(humanBuyer.balance).toBeLessThan(10000);
    expect(seller.balance).toBeGreaterThan(1000);
  });

  it('TC-CMA-SWAP.07 [UC-CMA-SWAP/A4] handleSwapProject returns early when registry is undefined', () => {
    const player = createPlayer('p-no-reg');
    player.balance = 5000;

    handleSwapProject(player, undefined);

    expect(player.balance).toBe(5000);
  });
});
