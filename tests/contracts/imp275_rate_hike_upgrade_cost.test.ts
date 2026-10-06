import { describe, it, expect } from 'vitest';
import { executeMarketCard } from '../../src/domain/market_card_handlers';
import { calculateUpgradeCost, upgradeProperty } from '../../src/domain/property_upgrade';
import { getMarketCardInfo } from '../../src/domain/event_card_metadata';
import { getMortgageInterestRate } from '../../src/server/mortgage_manager';
import { MarketCardId } from '../../src/domain/event_card_types';
import { ActionRejectReason } from '../../src/domain/action_reasons';
import { createPlayer, createRoom, type MarketModifier } from '../../src/domain/room';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_data';

describe('[TC-275/MSS][UC-IMP275] IMP-275 Market Card MC_RATE_HIKE Upgrade Cost & Mortgage Rate Contract Suite', () => {
  it('[TC-275.01/MSS][UC-IMP275] executeMarketCard(MC_RATE_HIKE) đẩy modifier có remainingRounds = 2 và affectedCells = []', () => {
    const mods: MarketModifier[] = [];
    executeMarketCard(MarketCardId.MC_RATE_HIKE, mods);

    expect(mods).toHaveLength(1);
    expect(mods[0]?.remainingRounds).toBe(2);
    expect(mods[0]?.affectedCells).toEqual([]);
  });

  it('[TC-275.02/MSS][UC-IMP275] calculateUpgradeCost(19, 0, mods) với MC_RATE_HIKE trả về 1200 (floor 1000 * 1.2)', () => {
    const mods: MarketModifier[] = [
      { type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 2 },
    ];
    const cost = calculateUpgradeCost(19, 0, mods);

    expect(cost).toBe(1200);
  });

  it('[TC-275.03/MSS][UC-IMP275] calculateUpgradeCost(39, 1, mods) với MC_RATE_HIKE trả về 3600 (floor 3000 * 1.2)', () => {
    const mods: MarketModifier[] = [
      { type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 2 },
    ];
    const cost = calculateUpgradeCost(39, 1, mods);

    expect(cost).toBe(3600);
  });

  it('[TC-275.04/MSS][UC-IMP275] calculateUpgradeCost(39, 2, mods) với MC_RATE_HIKE trả về 4800 (floor 4000 * 1.2)', () => {
    const mods: MarketModifier[] = [
      { type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 2 },
    ];
    const cost = calculateUpgradeCost(39, 2, mods);

    expect(cost).toBe(4800);
  });

  it('[TC-275.05/MSS][UC-IMP275] upgradeProperty cho ô 19 với balance 1100 thất bại với reason INSUFFICIENT_FUNDS dưới MC_RATE_HIKE', () => {
    const player = createPlayer('p1');
    player.balance = 1100;
    const registry: PropertyRegistry = new Map([[16, 'p1'], [18, 'p1'], [19, 'p1']]);
    const stateMap: PropertyStateMap = new Map([[19, { level: 0 }]]);
    const mods: MarketModifier[] = [
      { type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 2 },
    ];

    const res = upgradeProperty(player, 19, registry, stateMap, mods);

    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.INSUFFICIENT_FUNDS);
  });

  it('[TC-275.06/MSS][UC-IMP275] upgradeProperty cho ô 19 cấp 0 với balance 2000 thành công, balance trừ đúng 1200 còn 800 dưới MC_RATE_HIKE', () => {
    const player = createPlayer('p1');
    player.balance = 2000;
    const registry: PropertyRegistry = new Map([[16, 'p1'], [18, 'p1'], [19, 'p1']]);
    const stateMap: PropertyStateMap = new Map([[19, { level: 0 }]]);
    const mods: MarketModifier[] = [
      { type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 2 },
    ];

    const res = upgradeProperty(player, 19, registry, stateMap, mods);

    expect(res.success).toBe(true);
    expect(player.balance).toBe(800);
  });

  it('[TC-275.07/MSS][UC-IMP275] getMortgageInterestRate(room) với MC_RATE_HIKE remainingRounds 2 trả về 0.10', () => {
    const room = createRoom('host');
    room.activeModifiers = [
      { type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 2 },
    ];

    const rate = getMortgageInterestRate(room);

    expect(rate).toBe(0.10);
  });

  it('[TC-275.08a/A1][UC-IMP275] calculateUpgradeCost(19, 0, mods) khi MC_RATE_HIKE hết hạn remainingRounds = 0 hoàn nguyên về 1000', () => {
    const mods: MarketModifier[] = [
      { type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 0 },
    ];
    const cost = calculateUpgradeCost(19, 0, mods);

    expect(cost).toBe(1000);
  });

  it('[TC-275.08b/A1][UC-IMP275] getMortgageInterestRate(room) khi MC_RATE_HIKE hết hạn remainingRounds = 0 hoàn nguyên về 0.05', () => {
    const room = createRoom('host');
    room.activeModifiers = [
      { type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 0 },
    ];

    const rate = getMortgageInterestRate(room);

    expect(rate).toBe(0.05);
  });

  it('[TC-275.09/MSS][UC-IMP275] getMarketCardInfo(MC_RATE_HIKE) duration là 2 vòng chơi, effectDetail chứa 20% chi phí xây dựng và 10% khi vượt GO', () => {
    const info = getMarketCardInfo(MarketCardId.MC_RATE_HIKE);

    expect(info.duration).toBe('2 vòng chơi');
    expect(info.effectDetail).toContain('20% chi phí xây dựng');
    expect(info.effectDetail).toContain('10% khi vượt GO');
  });

  it('[TC-275.10/MSS][UC-IMP275] calculateUpgradeCost(19, 0, mods) khi có cả MC_CREDIT_STIMULUS và MC_RATE_HIKE trả về 960 (floor 1000 * 0.8 = 800 * 1.2 = 960)', () => {
    const mods: MarketModifier[] = [
      { type: MarketCardId.MC_CREDIT_STIMULUS, affectedCells: [], remainingRounds: 2 },
      { type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 2 },
    ];
    const cost = calculateUpgradeCost(19, 0, mods);

    expect(cost).toBe(960);
  });

  it('[TC-275.11/MSS][UC-IMP275] getMortgageInterestRate(room) khi có cả MC_CREDIT_STIMULUS và MC_RATE_HIKE trả về 0% do Kích Cầu chiếm ưu tiên', () => {
    const room = createRoom('host');
    room.activeModifiers = [
      { type: MarketCardId.MC_CREDIT_STIMULUS, affectedCells: [], remainingRounds: 2 },
      { type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 2 },
    ];

    const rate = getMortgageInterestRate(room);

    expect(rate).toBe(0);
  });
});
