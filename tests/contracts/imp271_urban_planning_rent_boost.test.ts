import { describe, it, expect } from 'vitest';
import { executeMarketCard } from '../../src/domain/market_card_handlers';
import { MarketCardId, HANOI_HCMC_CELLS } from '../../src/domain/event_card_types';
import { getMarketCardInfo } from '../../src/domain/event_card_metadata';
import { calculateRent, resolveRent } from '../../src/domain/property_rent';
import { handleLanding, LandingResult } from '../../src/domain/property_manager';
import { getEffectiveMortgageRate } from '../../src/server/mortgage_manager';
import { BOARD_CONFIG } from '../../src/domain/board_config';
import { createRoom, createPlayer, type MarketModifier } from '../../src/domain/room';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_data';

describe('[TC-271/MSS][UC-IMP271] IMP-271 MC_URBAN_PLANNING Rent Boost & Mortgage Parity Contract', () => {
  it('[TC-271.01/MSS][UC-IMP271] executeMarketCard kích hoạt modifier với remainingRounds = 2, multiplier = 1.5, affectedCells = HANOI_HCMC_CELLS', () => {
    const mods: MarketModifier[] = [];
    executeMarketCard(MarketCardId.MC_URBAN_PLANNING, mods);

    expect(mods).toHaveLength(1);
    expect(mods[0]?.remainingRounds).toBe(2);
    expect(mods[0]?.multiplier).toBe(1.5);
    expect(mods[0]?.affectedCells).toEqual(HANOI_HCMC_CELLS);
  });

  it('[TC-271.02/MSS][UC-IMP271] calculateRent cho ô Hà Nội cell 32 cấp 0 nhân 1.5x tiền thuê (300 -> 450)', () => {
    const mods: MarketModifier[] = [];
    executeMarketCard(MarketCardId.MC_URBAN_PLANNING, mods);
    const rent = calculateRent(300, 32, mods);

    expect(rent).toBe(450);
  });

  it('[TC-271.03/MSS][UC-IMP271] calculateRent cho ô TP.HCM cell 39 cấp 0 nhân 1.5x tiền thuê (400 -> 600)', () => {
    const mods: MarketModifier[] = [];
    executeMarketCard(MarketCardId.MC_URBAN_PLANNING, mods);
    const rent = calculateRent(400, 39, mods);

    expect(rent).toBe(600);
  });

  it('[TC-271.04/MSS][UC-IMP271] calculateRent cho ô Hưng Yên cell 31 cấp 0 nhân 1.5x tiền thuê (300 -> 450)', () => {
    const mods: MarketModifier[] = [];
    executeMarketCard(MarketCardId.MC_URBAN_PLANNING, mods);
    const rent = calculateRent(300, 31, mods);

    expect(rent).toBe(450);
  });

  it('[TC-271.05/MSS][UC-IMP271] calculateRent cho ô Thừa Thiên Huế cell 18 ngoài nhóm HANOI_HCMC_CELLS giữ nguyên tiền thuê (180)', () => {
    const mods: MarketModifier[] = [];
    executeMarketCard(MarketCardId.MC_URBAN_PLANNING, mods);
    const rent = calculateRent(180, 18, mods);

    expect(rent).toBe(180);
  });

  it('[TC-271.06/MSS][UC-IMP271] calculateRent cho ô Hà Nội cell 32 cấp 2 nhân 1.5x tiền thuê (2700 -> 4050)', () => {
    const mods: MarketModifier[] = [];
    executeMarketCard(MarketCardId.MC_URBAN_PLANNING, mods);
    const rent = calculateRent(2700, 32, mods);

    expect(rent).toBe(4050);
  });

  it('[TC-271.07/MSS][UC-IMP271] handleLanding với ô Hà Nội cell 32 đang thế chấp isMortgaged true trả về rentAmount = 0', () => {
    const landlord = createPlayer('landlord_32');
    const tenant = createPlayer('tenant_32');
    const registry: PropertyRegistry = new Map([[32, landlord.id]]);
    const stateMap: PropertyStateMap = new Map([[32, { level: 0, isMortgaged: true }]]);
    const mods: MarketModifier[] = [];
    executeMarketCard(MarketCardId.MC_URBAN_PLANNING, mods);

    const res = handleLanding(tenant, 32, registry, [landlord, tenant], stateMap, undefined, mods);

    expect(res.rentAmount).toBe(0);
    expect(res.result).toBe(LandingResult.RentPaid);
  });

  it('[TC-271.08/MSS][UC-IMP271] getEffectiveMortgageRate trả về 0.6 cho ô cell 32 khi MC_URBAN_PLANNING có remainingRounds = 2', () => {
    const room = createRoom('host_room_32');
    executeMarketCard(MarketCardId.MC_URBAN_PLANNING, room.activeModifiers);

    const rate = getEffectiveMortgageRate(room, 32);

    expect(room.activeModifiers[0]?.remainingRounds).toBe(2);
    expect(rate).toBe(0.6);
  });

  it('[TC-271.09a/A1][UC-IMP271] calculateRent giữ nguyên 1.0x khi modifier MC_URBAN_PLANNING đã hết hạn (remainingRounds = 0)', () => {
    const mods: MarketModifier[] = [
      { type: MarketCardId.MC_URBAN_PLANNING, affectedCells: HANOI_HCMC_CELLS, remainingRounds: 0, multiplier: 1.5 },
    ];
    const rent = calculateRent(300, 32, mods);

    expect(rent).toBe(300);
  });

  it('[TC-271.09b/A1][UC-IMP271] getEffectiveMortgageRate hoàn nguyên về 0.5 khi modifier MC_URBAN_PLANNING đã hết hạn (remainingRounds = 0)', () => {
    const room = createRoom('host_room_expired');
    room.activeModifiers = [
      { type: MarketCardId.MC_URBAN_PLANNING, affectedCells: HANOI_HCMC_CELLS, remainingRounds: 0, multiplier: 1.5 },
    ];
    const rate = getEffectiveMortgageRate(room, 32);

    expect(rate).toBe(0.5);
  });

  it('[TC-271.10/MSS][UC-IMP271] getMarketCardInfo trả về duration 2 vòng chơi, effectDetail phản ánh 1.5x tiền thuê và 60% thế chấp', () => {
    const info = getMarketCardInfo(MarketCardId.MC_URBAN_PLANNING);

    expect(info.duration).toBe('2 vòng chơi');
    expect(info.effectDetail).toContain('1.5x tiền thuê');
    expect(info.effectDetail).toContain('60% thay vì 50%');
    expect(info.destination).toBe('Chủ sở hữu BĐS Hà Nội/TP.HCM & Ngân sách người chơi');
  });

  it('[TC-271.11/MSS][UC-IMP271] resolveRent xếp chồng an toàn giữa độc quyền nhóm Tím hasMonopoly (x1.5) và MC_URBAN_PLANNING (x1.5) đạt 19800', () => {
    const landlord = createPlayer('landlord_purple');
    const registry: PropertyRegistry = new Map([[37, landlord.id], [39, landlord.id]]);
    const stateMap: PropertyStateMap = new Map([[37, { level: 3 }], [39, { level: 3 }]]);
    const mods: MarketModifier[] = [];
    executeMarketCard(MarketCardId.MC_URBAN_PLANNING, mods);
    const cell39 = BOARD_CONFIG[39];

    const rent = resolveRent(cell39, 39, landlord.id, registry, stateMap, undefined, mods);

    expect(rent).toBe(19800);
  });
});
