// [UC-GAME-020/MSS][UC-GAME-027/MSS][UC-GAME-028/MSS] Tests Slice 02
import { describe, it, expect } from 'vitest';
import { createPlayer } from '../../src/domain/room';
import {
  handleLanding,
  buyProperty,
  LandingResult,
  BuyResult,
} from '../../src/domain/property_manager';
import type { PropertyRegistry } from '../../src/domain/property_manager';

describe('property_manager', () => {
  // TC-02.1/MSS — Mua dat nen Cap 0
  it('[TC-02.1/MSS] buyProperty dat trong -> tru balance, gan ownerId', () => {
    const player = createPlayer('A');          // balance = 15_000
    const registry: PropertyRegistry = new Map();

    const result = buyProperty(player, 1, registry); // o 01 Can Tho, gia 600

    expect(result.result, `Ky vong Success nhung nhan: ${result.result}`)
      .toBe(BuyResult.Success);
    expect(player.balance, `balance phai la 14_400 nhung nhan: ${player.balance}`)
      .toBe(15_000 - 600);
    expect(registry.get(1), `ownerId phai la 'A' nhung nhan: ${registry.get(1)}`)
      .toBe('A');
  });

  // TC-02.2/MSS — Thu tien thue Cap 0
  it('[TC-02.2/MSS] handleLanding dat co chu -> tru tenant, cong owner dung phi Cap 0', () => {
    const owner  = createPlayer('A');          // balance = 15_000
    const tenant = createPlayer('B');          // balance = 15_000
    const registry: PropertyRegistry = new Map([[1, 'A']]); // o 01 thuoc A
    const ownerBalanceBefore = owner.balance;

    const landing = handleLanding(tenant, 1, registry, [owner, tenant]);

    expect(landing.result, `Ky vong RentPaid nhung nhan: ${landing.result}`)
      .toBe(LandingResult.RentPaid);
    expect(landing.rentAmount, `Phi Cap 0 o Can Tho phai la 60 nhung nhan: ${landing.rentAmount}`)
      .toBe(60);
    expect(tenant.balance, `Tenant balance phai la 14_940 nhung nhan: ${tenant.balance}`)
      .toBe(15_000 - 60);
    expect(owner.balance, `Owner balance phai la ownerBalanceBefore + 60 nhung nhan: ${owner.balance}`)
      .toBe(ownerBalanceBefore + 60);
  });

  // TC-02.3/MSS — Khong du tien mua
  it('[TC-02.3/MSS] buyProperty khi balance < gia -> InsufficientFunds, state khong doi', () => {
    const player = createPlayer('C');
    player.balance = 500;                      // Co tinh duoi muc gia 600
    const registry: PropertyRegistry = new Map();

    const result = buyProperty(player, 1, registry); // gia 600

    expect(result.result, `Ky vong InsufficientFunds nhung nhan: ${result.result}`)
      .toBe(BuyResult.InsufficientFunds);
    expect(player.balance, `balance khong duoc thay doi, phai la 500 nhung nhan: ${player.balance}`)
      .toBe(500);
    expect(registry.has(1), 'Registry khong duoc ghi owner khi giao dich that bai')
      .toBe(false);
  });

  // TC-02.4/MSS — Dam vao dat cua chinh minh
  it('[TC-02.4/MSS] handleLanding dat minh -> OwnProperty, balance khong doi', () => {
    const owner = createPlayer('A');
    const registry: PropertyRegistry = new Map([[1, 'A']]);
    const balanceBefore = owner.balance;

    const landing = handleLanding(owner, 1, registry, [owner]);

    expect(landing.result, `Ky vong OwnProperty nhung nhan: ${landing.result}`)
      .toBe(LandingResult.OwnProperty);
    expect(owner.balance, `Balance phai giu nguyen ${balanceBefore} nhung nhan: ${owner.balance}`)
      .toBe(balanceBefore);
  });

  // TC-02.5/MSS — O khong phai tai san
  it('[TC-02.5/MSS] o Go hoac Jail -> NotPurchasable', () => {
    const player = createPlayer('A');
    const registry: PropertyRegistry = new Map();

    // o 0 = Go
    const landingGo = handleLanding(player, 0, registry, [player]);
    expect(landingGo.result, `O Go (0) phai la NotPurchasable nhung nhan: ${landingGo.result}`)
      .toBe(LandingResult.NotPurchasable);

    // o 10 = Jail
    const landingJail = handleLanding(player, 10, registry, [player]);
    expect(landingJail.result, `O Jail (10) phai la NotPurchasable nhung nhan: ${landingJail.result}`)
      .toBe(LandingResult.NotPurchasable);

    // buyProperty cung phai tu choi o Go
    const buyGo = buyProperty(player, 0, registry);
    expect(buyGo.result, `buyProperty o Go phai la NotPurchasable nhung nhan: ${buyGo.result}`)
      .toBe(BuyResult.NotPurchasable);
  });
});
