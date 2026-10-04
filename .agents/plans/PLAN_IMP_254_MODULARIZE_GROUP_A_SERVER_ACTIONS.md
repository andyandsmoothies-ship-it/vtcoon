# KẾ HOẠCH KỸ THUẬT: IMP-254 BÓC TÁCH MÔ-ĐUN GIAO DỊCH P2P (P2P TRADE SUBTRACTIVE REFACTORING)

> **Ticket:** IMP-254 (Tier 2 Full Rigor - Subtractive Refactoring & Technical Debt Offload)  
> **Use Case Ref:** `UC-GAME-056` (P2P Property Trading & Asset Swap)  
> **Trọng tâm:** Bóc tách dứt điểm logic Giao dịch P2P từ `src/server/property_actions.ts` (390 dòng, cảnh báo Tier 1) sang mô-đun độc lập `src/server/p2p_trade_actions.ts`.  
> **Phạm vi phân định:**  
> - `IMP-254` (Vé hiện tại): Chỉ xử lý bóc tách `property_actions.ts` ➔ `p2p_trade_actions.ts`, đưa `property_actions.ts` từ 390 dòng xuống ~166 dòng (< 300 dòng Tier 1 Safe).  
> - `IMP-260` (Vé riêng độc lập): Tái cấu trúc bóc tách `admin_manager.ts` (410 dòng) thành `admin_vitals.ts`, `admin_cloud_sync.ts`, `admin_event_store.ts`.  
> **Cam kết cốt lõi:**  
> 1. **Pure Move 100% (Zero Semantic Mutation):** Giữ nguyên từng dòng lệnh gốc, tuyệt đối không chèn thêm guard hay đổi hợp đồng nội bộ.  
> 2. **Anti-TIDD & Zero Barrel Re-export:** Xóa sạch khối P2P trong `property_actions.ts` (không để lại pass-through barrel), cập nhật trực tiếp 1 consumer sản xuất và 10 consumer test. Tuyệt đối không tạo test-only re-export ở client (`modal_helpers.ts`).  
> 3. **SSOT Hằng Số Thuế:** Di dời `P2P_TAX_RATE` (0.05) và `P2P_ANTI_SPECULATE_TAX` (0.20) vào `src/domain/property_data.ts` làm Single Source of Truth cho cả Client và Server.

---

## 0. BẢNG ĐỐI SOÁT CHỈ THỊ PHẢN BIỆN & PLAN-GRILLER (REVISION 7)

| STT | Mã Chỉ Thị / Nguồn | Target Physical File & Line | Nội Dung Yêu Cầu & Giải Pháp Xử Lý Trong Revision 7 | Trạng Thái |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **1** | **REV7-DIR-1** (Orphan Import) | `src/server/property_actions.ts#L7` | Xóa `type PropertyState` khỏi import ở dòng 7 trong Snippet 4.1 vì sau khi bóc tách khối P2P, file không còn sử dụng kiểu này. | ✅ RESOLVED |
| **2** | **REV7-DIR-2** (Anti-TIDD Client) | `src/client/ui/modals/modal_helpers.ts#Snippet 2.1` | Bỏ `export { P2P_TAX_RATE };`. `modal_helpers.ts` chỉ import `P2P_TAX_RATE` từ `property_data.ts` và dùng nội bộ, không tạo dead export API phục vụ test. | ✅ RESOLVED |
| **3** | **REV7-DIR-3** (Outdated Header) | `src/server/property_actions.ts#L1` | Cập nhật comment đầu file thành `// [UC-GAME-020,027/MSS][UC-GAME-057/MSS] Property Actions — Buy, Upgrades, Downgrade` (loại bỏ chữ Trade). | ✅ RESOLVED |
| **4** | **REV7-DIR-4** (Static Tests) | `PLAN_IMP_254.md#Section 4 (TC-01, 02)` | Thay thế 2 static checklist tests (`typeof`) bằng 2 contract tests hành vi thực tế: verify giao dịch chuyển nhượng thành công và từ chối khi thiếu tiền. | ✅ RESOLVED |
| **5** | **REV7-DIR-5** (Tautology Fix) | `PLAN_IMP_254.md#Section 4 (TC-03)` | Sửa `TC-254.03` so sánh hằng số thuế với giá trị tuyệt đối trong `requirements.md` (0.05 và 0.20), không so sánh biến với chính nó. | ✅ RESOLVED |
| **6** | **REV7-DIR-6** (Characterization) | `PLAN_IMP_254.md#Task 8` | Bổ sung bước kiểm định characterization: chạy bộ test hiện có trên baseline trước khi di chuyển mã để khóa hành vi thực tế. | ✅ RESOLVED |
| **7** | **REV7-DIR-7** (Rounding Parity) | `PLAN_IMP_254.md#Section 4 (TC-16)` | Bổ sung `TC-254.16` khóa cứng hành vi làm tròn hiện tại (`Math.round` ở server vs `Math.floor` ở client) chống trôi dạt vô thức. | ✅ RESOLVED |
| **8** | **REV7-DIR-8** (DoD 6 Real Numbers) | `PLAN_IMP_254.md#DoD 6` | Chuẩn hóa số liệu DoD 6 theo đúng thực tế đo đạc trên đĩa vật lý: **164 test suites (3.535 tests)**. | ✅ RESOLVED |
| **9** | **REV7-DIR-9** (Tech Debt Slices) | `PLAN_IMP_254.md#DoD 5` | Gán target slice cụ thể cho từng mã nợ: `DEBT-P2P-TAX-ROUNDING-PARITY` (IMP-262), `DEBT-ROOM-PROPERTY-COORDINATOR` (IMP-263). | ✅ RESOLVED |
| **10** | **REV7-DIR-10** (LOC Baseline) | `PLAN_IMP_254.md#Section 1 & DoD 2` | Chuẩn hóa baseline trên đĩa vật lý: 390 lines (SLOC 349), delta -224, post 166 lines. | ✅ RESOLVED |

---

## 1. BẢNG ĐO LƯỜNG ĐỊNH LƯỢNG NGÂN SÁCH LOC (PHYSICAL DISK BASELINE)

*Đo đạc tự động qua công cụ chính thức của dự án: `node scripts/check_loc.mjs`*

| File vật lý | Phân loại Tier | Baseline Hiện Tại | Non-Empty SLOC | Est. Delta | Post LOC | Trần Budget | Trạng thái sau Refactor |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `src/server/property_actions.ts` | Tier 1 (Logic) | **390** | 349 | -224 | **166** | <= 400 | ✔️ Safe (< 300) |
| `src/server/p2p_trade_actions.ts` (Mới) | Tier 1 (Logic) | **0** | 0 | +230 | **230** | <= 400 | ✔️ Safe (< 300) |
| `src/domain/property_data.ts` | Tier 3 (Data) | **93** | 80 | +5 | **98** | <= 800 | ✔️ Safe (< 650) |
| `src/client/ui/modals/modal_helpers.ts` | Tier 2 (UI) | **371** | 332 | 0 | **371** | <= 500 | ✔️ Safe (< 400) |
| `src/server/room_property_coordinator.ts` | Tier 1 (Logic) | **361** | 326 | +1 | **362** | <= 400 | ⚠️ Warning (> 300, nợ `DEBT-ROOM-PROPERTY-COORDINATOR`) |
| `tests/contracts/imp254_p2p_trade_actions_boundary.test.ts` (Mới) | Living Test Suite | **0** | 0 | +240 | **240** | <= 600 | ✔️ Safe (< 600) |

---

## 2. THIẾT KẾ KIẾN TRÚC & DÒNG DỮ LIỆU (ARCHITECTURE & DATA FLOW)

### 2.1. Sơ Đồ Kiến Trúc Trước & Sau Refactor

```
[TRƯỚC REFACTOR]
src/server/room_property_coordinator.ts
        │
        ▼ (Gộp lẫn cả BĐS Nhà Cái lẫn Giao Thương P2P)
src/server/property_actions.ts (390 LOC ⚠️ Báo Động Trần)
  ├── Mua đất, nâng cấp nhà/ETC/tiện ích, hạ cấp
  └── P2P Trading (Thuế, đóng băng, đổi chủ, nợ thế chấp, trái phiếu...)

[SAU REFACTOR]
src/server/room_property_coordinator.ts
        │
        ├──► src/server/property_actions.ts (166 LOC ✔️ Safe)
        │      └── Mua đất, nâng cấp nhà/ETC/tiện ích, hạ cấp
        │
        └──► src/server/p2p_trade_actions.ts (230 LOC ✔️ Safe)
               ├── validateP2PTrade
               └── executeP2PTrade
                     └── P2P_TAX_RATE & P2P_ANTI_SPECULATE_TAX (from src/domain/property_data.ts)
```

---

## 3. CÁC BƯỚC THI CÔNG & MÃ NGUỒN DROP-IN SNIPPETS (IMPLEMENTATION TASKS)

### Task 1: Bổ Sung Hằng Số SSOT Trong `src/domain/property_data.ts`
**Target physical file**: `src/domain/property_data.ts`

Snippet 1.1: Bổ sung 2 hằng số thuế P2P:
```typescript
<<<<
export const PROPERTY_DEEDS: ReadonlyMap<number, PropertyDeed> = new Map([
====
export const P2P_TAX_RATE = 0.05;
export const P2P_ANTI_SPECULATE_TAX = 0.20;

export const PROPERTY_DEEDS: ReadonlyMap<number, PropertyDeed> = new Map([
>>>>
```

---

### Task 2: Chuẩn Hóa SSOT Trong `src/client/ui/modals/modal_helpers.ts`
**Target physical file**: `src/client/ui/modals/modal_helpers.ts`

Snippet 2.1: Thay thế hằng số hardcode bằng import từ domain (không export để tránh Anti-TIDD):
```typescript
<<<<
import { PROPERTY_DEEDS, RAILROAD_FEES } from '../../../domain/property_data';
import { BOARD_CONFIG, ColorGroup, CellType } from '../../../domain/board_config';
import type { ModalPayloadMap, PlayerInfo } from '../../store/game_store_types.js';

export const P2P_TAX_RATE = 0.05;
====
import { PROPERTY_DEEDS, RAILROAD_FEES, P2P_TAX_RATE } from '../../../domain/property_data';
import { BOARD_CONFIG, ColorGroup, CellType } from '../../../domain/board_config';
import type { ModalPayloadMap, PlayerInfo } from '../../store/game_store_types.js';
>>>>
```

---

### Task 3: Tạo Module Mới `src/server/p2p_trade_actions.ts` (Pure Move 100%)
**Target physical file**: `src/server/p2p_trade_actions.ts` (Tệp mới)

```typescript
// [UC-GAME-056/MSS] P2P Property Trading & Asset Swap Action Handlers
import type { Room, Player } from '../domain/room.js';
import type { PropertyRegistry, PropertyStateMap, PropertyState } from '../domain/property_data.js';
import { PROPERTY_DEEDS, P2P_TAX_RATE, P2P_ANTI_SPECULATE_TAX } from '../domain/property_data.js';
import { MarketCardId } from '../domain/event_card_types.js';
import { ActionRejectReason } from '../domain/action_reasons.js';

type P2PTradeValidation =
  | {
      valid: false;
      reason: ActionRejectReason;
      taxRate?: undefined;
      totalCost?: undefined;
      taxAmount?: undefined;
      sellerNet?: undefined;
      buyer?: undefined;
      seller?: undefined;
    }
  | {
      valid: true;
      reason?: undefined;
      taxRate: number;
      totalCost: number;
      taxAmount: number;
      sellerNet: number;
      buyer: Player;
      seller: Player;
    };

function calcP2PTax(room: Room, price: number): { taxRate: number; totalCost: number; taxAmount: number; sellerNet: number } {
  const antiSpeculate = (room.activeModifiers ?? []).some(
    (m) => m.type === MarketCardId.MC_ANTI_SPECULATE && m.remainingRounds > 0,
  );
  const taxRate = antiSpeculate ? P2P_ANTI_SPECULATE_TAX : P2P_TAX_RATE;
  const absPrice = Math.abs(price);
  const taxAmount = Math.round(absPrice * taxRate);
  return {
    taxRate,
    totalCost: absPrice,
    taxAmount,
    sellerNet: absPrice - taxAmount,
  };
}

function isTradeFrozen(room: Room): boolean {
  return (room.activeModifiers ?? []).some(
    (m) => m.type === MarketCardId.MC_FREEZE_TRADE && m.remainingRounds > 0,
  );
}

function isInvalidPrice(price: number, isSwap = false): boolean {
  if (isSwap) {
    return !Number.isInteger(price);
  }
  return !Number.isInteger(price) || price <= 0;
}

function hasBuildingOrUpgrade(state?: PropertyState): boolean {
  return Boolean(state && (state.houses > 0 || state.hasHotel || state.hasStation || state.hasUtilityFull));
}

function transferMortgageDebt(from: Player, to: Player, cell: number, state?: PropertyState): void {
  if (!state?.isMortgaged) return;
  from.mortgagedProperties = (from.mortgagedProperties ?? []).filter((c) => c !== cell);
  (to.mortgagedProperties ??= []).push(cell);

  const loanAmount = from.mortgageLoans?.[cell] ?? 0;
  if (loanAmount > 0) {
    delete from.mortgageLoans?.[cell];
    (to.mortgageLoans ??= {})[cell] = loanAmount;
  }
}

function checkPropertyEligibility(
  sellerId: string,
  cellIndex: number,
  price: number,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  isSwap = false,
): ActionRejectReason | undefined {
  if (registry.get(cellIndex) !== sellerId) return ActionRejectReason.NOT_OWNER;
  const deed = PROPERTY_DEEDS.get(cellIndex);
  if (!deed) return ActionRejectReason.NOT_PURCHASABLE;
  if (hasBuildingOrUpgrade(stateMap.get(cellIndex))) return ActionRejectReason.PROPERTY_HAS_BUILDING;
  if (!isSwap) {
    const isMort = Boolean(stateMap?.get(cellIndex)?.isMortgaged);
    const floorRate = isMort ? 0.35 : 0.70;
    const floorPrice = Math.max(100, Math.floor(deed.price * floorRate));
    if (price < floorPrice) {
      return ActionRejectReason.PRICE_BELOW_FLOOR;
    }
  }
  return undefined;
}

function checkPartyStatus(buyer?: Player, seller?: Player): ActionRejectReason | undefined {
  if (!buyer || !seller) return ActionRejectReason.PLAYER_NOT_FOUND;
  if (buyer.bankrupt || seller.bankrupt) return ActionRejectReason.PLAYER_BANKRUPT;
  return undefined;
}

function checkTradeParties(
  room: Room,
  sellerId: string,
  buyerId: string,
  cellIndex: number,
  price: number,
  offeredCellIndex?: number,
  registry?: PropertyRegistry,
  stateMap?: PropertyStateMap,
): P2PTradeValidation {
  const buyer = room.players.find((p) => p.id === buyerId);
  const seller = room.players.find((p) => p.id === sellerId);
  const partyErr = checkPartyStatus(buyer, seller);
  if (partyErr) return { valid: false, reason: partyErr };

  if (buyer!.balance < 0) {
    return { valid: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };
  }
  if (seller!.balance < 0 && price <= 0) {
    return { valid: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };
  }

  if (seller!.bondContract?.isActive && seller!.bondContract.collateralCells.includes(cellIndex)) {
    return { valid: false, reason: ActionRejectReason.BOND_COLLATERAL_LOCKED };
  }

  if (offeredCellIndex !== undefined) {
    if (registry && registry.get(offeredCellIndex) !== buyerId) {
      return { valid: false, reason: ActionRejectReason.NOT_OWNER };
    }
    const offeredDeed = PROPERTY_DEEDS.get(offeredCellIndex);
    if (!offeredDeed) {
      return { valid: false, reason: ActionRejectReason.NOT_PURCHASABLE };
    }
    if (stateMap && hasBuildingOrUpgrade(stateMap.get(offeredCellIndex))) {
      return { valid: false, reason: ActionRejectReason.PROPERTY_HAS_BUILDING };
    }
    if (buyer!.bondContract?.isActive && buyer!.bondContract.collateralCells.includes(offeredCellIndex)) {
      return { valid: false, reason: ActionRejectReason.BOND_COLLATERAL_LOCKED };
    }
  }

  const { taxRate, totalCost, taxAmount, sellerNet } = calcP2PTax(room, price);
  if (price > 0 && buyer!.balance < totalCost) {
    return { valid: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };
  }
  if (price < 0 && seller!.balance < totalCost) {
    return { valid: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };
  }

  return {
    valid: true,
    taxRate,
    totalCost,
    taxAmount,
    sellerNet,
    buyer: buyer!,
    seller: seller!,
  };
}

export function validateP2PTrade(
  room: Room,
  sellerId: string,
  buyerId: string,
  cellIndex: number,
  price: number,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  offeredCellIndex?: number,
): P2PTradeValidation {
  if (!room.started) return { valid: false, reason: ActionRejectReason.GAME_NOT_STARTED };
  if (sellerId === buyerId) return { valid: false, reason: ActionRejectReason.INVALID_TRADE };
  const isSwap = offeredCellIndex !== undefined;
  if (isInvalidPrice(price, isSwap)) return { valid: false, reason: ActionRejectReason.INVALID_PRICE };
  if (isTradeFrozen(room)) return { valid: false, reason: ActionRejectReason.FREEZE_ACTIVE };

  const propErr = checkPropertyEligibility(sellerId, cellIndex, price, registry, stateMap, isSwap);
  if (propErr) return { valid: false, reason: propErr };

  return checkTradeParties(room, sellerId, buyerId, cellIndex, price, offeredCellIndex, registry, stateMap);
}

export function executeP2PTrade(
  room: Room,
  sellerId: string,
  buyerId: string,
  cellIndex: number,
  price: number,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  offeredCellIndex?: number,
): { success: boolean; reason?: ActionRejectReason } {
  const v = validateP2PTrade(room, sellerId, buyerId, cellIndex, price, registry, stateMap, offeredCellIndex);
  if (!v.valid) {
    return { success: false, reason: v.reason };
  }

  if (price > 0) {
    v.buyer.balance -= v.totalCost;
    v.seller.balance += v.sellerNet;
  } else if (price < 0) {
    v.seller.balance -= v.totalCost;
    v.buyer.balance += v.sellerNet;
  }
  room.treasuryBalance = (room.treasuryBalance ?? 0) + v.taxAmount;

  registry.set(cellIndex, buyerId);
  delete v.buyer.cellTradeRejections?.[cellIndex];
  delete v.buyer.cellLastRejectedRound?.[cellIndex];

  if (offeredCellIndex !== undefined) {
    registry.set(offeredCellIndex, sellerId);
    delete v.seller.cellTradeRejections?.[offeredCellIndex];
    delete v.seller.cellLastRejectedRound?.[offeredCellIndex];
  }

  transferMortgageDebt(v.seller, v.buyer, cellIndex, stateMap.get(cellIndex));
  if (offeredCellIndex !== undefined) {
    transferMortgageDebt(v.buyer, v.seller, offeredCellIndex, stateMap.get(offeredCellIndex));
  }

  console.info(JSON.stringify({
    event: offeredCellIndex !== undefined ? 'P2P_TRADE_SWAP' : 'P2P_TRADE',
    correlationId: room.roomCode,
    timestamp: Date.now(),
    delta: { sellerId, buyerId, cellIndex, offeredCellIndex, price, taxAmount: v.taxAmount },
  }));
  return { success: true };
}
```

---

### Task 4: Thu Gom Mã (Subtractive Purge) Trong `src/server/property_actions.ts`
**Target physical file**: `src/server/property_actions.ts`

Snippet 4.1: Xóa bỏ comment lỗi thời, `type PropertyState`, và `MarketCardId`:
```typescript
<<<<
// [UC-GAME-020,027/MSS][UC-GAME-056/MSS][UC-GAME-057/MSS] Property Actions — Buy, Upgrades, Trade, Downgrade
import type { Room, Player, MarketModifier } from '../domain/room';
import { TurnPhase } from '../domain/room';
import {
  buyProperty, BuyResult, upgradeProperty, upgradeETC, upgradeUtilityFull,
  downgradeProperty,
  type PropertyRegistry, type PropertyStateMap, type PropertyState,
} from '../domain/property_manager';
import { MarketCardId } from '../domain/event_card_types';
import { PROPERTY_DEEDS } from '../domain/property_manager';
====
// [UC-GAME-020,027/MSS][UC-GAME-057/MSS] Property Actions — Buy, Upgrades, Downgrade
import type { Room, Player, MarketModifier } from '../domain/room';
import { TurnPhase } from '../domain/room';
import {
  buyProperty, BuyResult, upgradeProperty, upgradeETC, upgradeUtilityFull,
  downgradeProperty,
  type PropertyRegistry, type PropertyStateMap,
} from '../domain/property_manager';
import { PROPERTY_DEEDS } from '../domain/property_manager';
>>>>
```

Snippet 4.2: Xóa bỏ sạch sẽ toàn bộ khối P2P (từ dòng 167 đến hết file, dòng 391), KHÔNG để lại bất kỳ re-export mỏng nào:
```typescript
<<<<
// --- DEBT-01: P2P Trading (UC-GAME-056) ---

const P2P_TAX_RATE          = 0.05;
const P2P_ANTI_SPECULATE_TAX = 0.20;

type P2PTradeValidation =
  | {
      valid: false;
      reason: ActionRejectReason;
      taxRate?: undefined;
      totalCost?: undefined;
      taxAmount?: undefined;
      sellerNet?: undefined;
      buyer?: undefined;
      seller?: undefined;
    }
  | {
      valid: true;
      reason?: undefined;
      taxRate: number;
      totalCost: number;
      taxAmount: number;
      sellerNet: number;
      buyer: Player;
      seller: Player;
    };

function calcP2PTax(room: Room, price: number): { taxRate: number; totalCost: number; taxAmount: number; sellerNet: number } {
  const antiSpeculate = (room.activeModifiers ?? []).some(
    (m) => m.type === MarketCardId.MC_ANTI_SPECULATE && m.remainingRounds > 0,
  );
  const taxRate = antiSpeculate ? P2P_ANTI_SPECULATE_TAX : P2P_TAX_RATE;
  const absPrice = Math.abs(price);
  const taxAmount = Math.round(absPrice * taxRate);
  return {
    taxRate,
    totalCost: absPrice,
    taxAmount,
    sellerNet: absPrice - taxAmount,
  };
}

function isTradeFrozen(room: Room): boolean {
  return (room.activeModifiers ?? []).some(
    (m) => m.type === MarketCardId.MC_FREEZE_TRADE && m.remainingRounds > 0,
  );
}

function isInvalidPrice(price: number, isSwap = false): boolean {
  if (isSwap) {
    return !Number.isInteger(price);
  }
  return !Number.isInteger(price) || price <= 0;
}

function hasBuildingOrUpgrade(state?: PropertyState): boolean {
  return Boolean(state && (state.houses > 0 || state.hasHotel || state.hasStation || state.hasUtilityFull));
}

function transferMortgageDebt(from: Player, to: Player, cell: number, state?: PropertyState): void {
  if (!state?.isMortgaged) return;
  from.mortgagedProperties = (from.mortgagedProperties ?? []).filter((c) => c !== cell);
  (to.mortgagedProperties ??= []).push(cell);

  const loanAmount = from.mortgageLoans?.[cell] ?? 0;
  if (loanAmount > 0) {
    delete from.mortgageLoans?.[cell];
    (to.mortgageLoans ??= {})[cell] = loanAmount;
  }
}

function checkPropertyEligibility(
  sellerId: string,
  cellIndex: number,
  price: number,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  isSwap = false,
): ActionRejectReason | undefined {
  if (registry.get(cellIndex) !== sellerId) return ActionRejectReason.NOT_OWNER;
  const deed = PROPERTY_DEEDS.get(cellIndex);
  if (!deed) return ActionRejectReason.NOT_PURCHASABLE;
  if (hasBuildingOrUpgrade(stateMap.get(cellIndex))) return ActionRejectReason.PROPERTY_HAS_BUILDING;
  if (!isSwap) {
    const isMort = Boolean(stateMap?.get(cellIndex)?.isMortgaged);
    const floorRate = isMort ? 0.35 : 0.70;
    const floorPrice = Math.max(100, Math.floor(deed.price * floorRate));
    if (price < floorPrice) {
      return ActionRejectReason.PRICE_BELOW_FLOOR;
    }
  }
  return undefined;
}

function checkPartyStatus(buyer?: Player, seller?: Player): ActionRejectReason | undefined {
  if (!buyer || !seller) return ActionRejectReason.PLAYER_NOT_FOUND;
  if (buyer.bankrupt || seller.bankrupt) return ActionRejectReason.PLAYER_BANKRUPT;
  return undefined;
}

function checkTradeParties(
  room: Room,
  sellerId: string,
  buyerId: string,
  cellIndex: number,
  price: number,
  offeredCellIndex?: number,
  registry?: PropertyRegistry,
  stateMap?: PropertyStateMap,
): P2PTradeValidation {
  const buyer = room.players.find((p) => p.id === buyerId);
  const seller = room.players.find((p) => p.id === sellerId);
  const partyErr = checkPartyStatus(buyer, seller);
  if (partyErr) return { valid: false, reason: partyErr };

  if (buyer!.balance < 0) {
    return { valid: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };
  }
  if (seller!.balance < 0 && price <= 0) {
    return { valid: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };
  }

  if (seller!.bondContract?.isActive && seller!.bondContract.collateralCells.includes(cellIndex)) {
    return { valid: false, reason: ActionRejectReason.BOND_COLLATERAL_LOCKED };
  }

  if (offeredCellIndex !== undefined) {
    if (registry && registry.get(offeredCellIndex) !== buyerId) {
      return { valid: false, reason: ActionRejectReason.NOT_OWNER };
    }
    const offeredDeed = PROPERTY_DEEDS.get(offeredCellIndex);
    if (!offeredDeed) {
      return { valid: false, reason: ActionRejectReason.NOT_PURCHASABLE };
    }
    if (stateMap && hasBuildingOrUpgrade(stateMap.get(offeredCellIndex))) {
      return { valid: false, reason: ActionRejectReason.PROPERTY_HAS_BUILDING };
    }
    if (buyer!.bondContract?.isActive && buyer!.bondContract.collateralCells.includes(offeredCellIndex)) {
      return { valid: false, reason: ActionRejectReason.BOND_COLLATERAL_LOCKED };
    }
  }

  const { taxRate, totalCost, taxAmount, sellerNet } = calcP2PTax(room, price);
  if (price > 0 && buyer!.balance < totalCost) {
    return { valid: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };
  }
  if (price < 0 && seller!.balance < totalCost) {
    return { valid: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };
  }

  return {
    valid: true,
    taxRate,
    totalCost,
    taxAmount,
    sellerNet,
    buyer: buyer!,
    seller: seller!,
  };
}

export function validateP2PTrade(
  room: Room,
  sellerId: string,
  buyerId: string,
  cellIndex: number,
  price: number,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  offeredCellIndex?: number,
): P2PTradeValidation {
  if (!room.started) return { valid: false, reason: ActionRejectReason.GAME_NOT_STARTED };
  if (sellerId === buyerId) return { valid: false, reason: ActionRejectReason.INVALID_TRADE };
  const isSwap = offeredCellIndex !== undefined;
  if (isInvalidPrice(price, isSwap)) return { valid: false, reason: ActionRejectReason.INVALID_PRICE };
  if (isTradeFrozen(room)) return { valid: false, reason: ActionRejectReason.FREEZE_ACTIVE };

  const propErr = checkPropertyEligibility(sellerId, cellIndex, price, registry, stateMap, isSwap);
  if (propErr) return { valid: false, reason: propErr };

  return checkTradeParties(room, sellerId, buyerId, cellIndex, price, offeredCellIndex, registry, stateMap);
}

export function executeP2PTrade(
  room: Room,
  sellerId: string,
  buyerId: string,
  cellIndex: number,
  price: number,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  offeredCellIndex?: number,
): { success: boolean; reason?: ActionRejectReason } {
  const v = validateP2PTrade(room, sellerId, buyerId, cellIndex, price, registry, stateMap, offeredCellIndex);
  if (!v.valid) {
    return { success: false, reason: v.reason };
  }

  if (price > 0) {
    v.buyer.balance -= v.totalCost;
    v.seller.balance += v.sellerNet;
  } else if (price < 0) {
    v.seller.balance -= v.totalCost;
    v.buyer.balance += v.sellerNet;
  }
  room.treasuryBalance = (room.treasuryBalance ?? 0) + v.taxAmount;

  registry.set(cellIndex, buyerId);
  delete v.buyer.cellTradeRejections?.[cellIndex];
  delete v.buyer.cellLastRejectedRound?.[cellIndex];

  if (offeredCellIndex !== undefined) {
    registry.set(offeredCellIndex, sellerId);
    delete v.seller.cellTradeRejections?.[offeredCellIndex];
    delete v.seller.cellLastRejectedRound?.[offeredCellIndex];
  }

  transferMortgageDebt(v.seller, v.buyer, cellIndex, stateMap.get(cellIndex));
  if (offeredCellIndex !== undefined) {
    transferMortgageDebt(v.buyer, v.seller, offeredCellIndex, stateMap.get(offeredCellIndex));
  }

  console.info(JSON.stringify({
    event: offeredCellIndex !== undefined ? 'P2P_TRADE_SWAP' : 'P2P_TRADE',
    correlationId: room.roomCode,
    timestamp: Date.now(),
    delta: { sellerId, buyerId, cellIndex, offeredCellIndex, price, taxAmount: v.taxAmount },
  }));
  return { success: true };
}
====
>>>>
```

---

### Task 5: Cập Nhật Consumer Sản Xuất `src/server/room_property_coordinator.ts`
**Target physical file**: `src/server/room_property_coordinator.ts`

Snippet 5.1: Chuyển hướng import từ `property_actions` sang `p2p_trade_actions`:
```typescript
<<<<
import { handleDowngrade, executeP2PTrade } from './property_actions.js';
====
import { handleDowngrade } from './property_actions.js';
import { executeP2PTrade } from './p2p_trade_actions.js';
>>>>
```

---

### Task 6: Cập Nhật 10 Consumer Tests Thuộc Blast Radius
Cập nhật import trực tiếp từ `./p2p_trade_actions.js`:
1. `tests/server/p2p_trade.test.ts`
2. `tests/contracts/imp204_mortgaged_property_p2p_trading.test.ts`
3. `tests/contracts/imp203_bot_hybrid_trade_offers.test.ts`
4. `tests/contracts/imp217_corporate_bond_tranches_and_pipeline.test.ts`
5. `tests/contracts/imp247_utility_monopoly_upgrade_requirement.test.ts`
6. `tests/domain/event_card_rebalance_high_impact.test.ts`
7. `tests/server/room_manager_s05.test.ts`
8. `tests/contracts/imp144_bot_trade_cooldown_and_escalation.test.ts`
9. `tests/contracts/imp146_p2p_property_swap_and_negotiation_parity.test.ts`
10. `tests/contracts/imp192c_corporate_bond_fire_sale.test.ts`

---

### Task 7: Tạo Bộ Contract Boundary Test `tests/contracts/imp254_p2p_trade_actions_boundary.test.ts`
**Target physical file**: `tests/contracts/imp254_p2p_trade_actions_boundary.test.ts` (Tệp mới)

Bao gồm đúng **16 atomic contract tests** kiểm tra toàn diện ranh giới module, bảo toàn SSOT và khóa cứng hành vi làm tròn thuế.

---

### Task 8: Chạy Kiểm Thử & Kiểm Tra Cơ Học (Quality Gates)
```bash
# 0. Characterization Pre-scan (chạy suite P2P trên baseline hiện tại trước khi chuyển code)
npx vitest run tests/server/p2p_trade.test.ts

# 1. Kiểm tra Contract Test mới
npx vitest run tests/contracts/imp254_p2p_trade_actions_boundary.test.ts

# 2. Kiểm tra toàn bộ 10 test suites thuộc Blast Radius
npx vitest run tests/server/p2p_trade.test.ts tests/contracts/imp204_mortgaged_property_p2p_trading.test.ts tests/contracts/imp203_bot_hybrid_trade_offers.test.ts tests/contracts/imp217_corporate_bond_tranches_and_pipeline.test.ts tests/contracts/imp247_utility_monopoly_upgrade_requirement.test.ts tests/domain/event_card_rebalance_high_impact.test.ts tests/server/room_manager_s05.test.ts tests/contracts/imp144_bot_trade_cooldown_and_escalation.test.ts tests/contracts/imp146_p2p_property_swap_and_negotiation_parity.test.ts tests/contracts/imp192c_corporate_bond_fire_sale.test.ts

# 3. Kiểm tra ngân sách LOC
node scripts/check_loc.mjs src/server/property_actions.ts src/server/p2p_trade_actions.ts src/server/room_property_coordinator.ts

# 4. Kiểm tra Typecheck và Linters
npm run typecheck
npm run lint:slop
npm run lint:ui
npm run check:i18n
```

---

## 4. MA TRẬN 16 BÀI KIỂM THỬ HỢP ĐỒNG (TEST SPECIFICATIONS - DOD #1)

Toàn bộ các ca kiểm thử tuân thủ nghiêm ngặt chuẩn Flow Taxonomy (`[UC-P2P-MOD/MSS]` và `[UC-P2P-MOD/A#]`), 1–4 asserts/test, 0 loops trong `it()`:

1. `[TC-254.01/MSS][UC-P2P-MOD/MSS]` executeP2PTrade thực hiện hoán đổi quyền sở hữu BĐS và cập nhật số dư các bên chính xác.
2. `[TC-254.02/MSS][UC-P2P-MOD/MSS]` validateP2PTrade từ chối giao dịch khi người mua không đủ số dư thanh toán tiền mặt.
3. `[TC-254.03/MSS][UC-P2P-MOD/MSS]` P2P_TAX_RATE đạt 0.05 (5%) và P2P_ANTI_SPECULATE_TAX đạt 0.20 (20%) theo đúng tài liệu đặc tả requirements.md.
4. `[TC-254.04/MSS][UC-P2P-MOD/MSS]` Luồng chính MSS: executeP2PTrade chuyển quyền sở hữu ô đất, trừ tiền người mua, cộng tiền người bán (sau thuế 5%) và nạp thuế vào kho bạc.
5. `[TC-254.05/MSS][UC-P2P-MOD/MSS]` Sự kiện chống đầu cơ: Khi MC_ANTI_SPECULATE kích hoạt, thuế chuyển nhượng tự động nhảy lên 20% nộp kho bạc.
6. `[TC-254.06/MSS][UC-P2P-MOD/MSS]` Chuyển giao nợ thế chấp: Thực thi qua API công khai executeP2PTrade với ô đất có stateMap.get(cellIndex).isMortgaged = true, xác nhận nợ chuyển giao chính xác.
7. `[TC-254.07/MSS][UC-P2P-MOD/MSS]` Hoán đổi BĐS (Asset Swap): Hai ô đất đổi chủ đồng thời, xóa bản ghi từ chối giao dịch cũ của cả hai bên.
8. `[TC-254.08/A1][UC-P2P-MOD/A1]` Ngoại lệ A1: Người mua có số dư âm (buyer.balance < 0) bị từ chối với INSUFFICIENT_FUNDS.
9. `[TC-254.09/A1][UC-P2P-MOD/A1]` Ngoại lệ A1: Người bán có số dư âm (seller.balance < 0) được phép bán tài sản với price > 0 để giải cứu phá sản, nhưng bị từ chối nếu price <= 0.
10. `[TC-254.10/A2][UC-P2P-MOD/A2]` Ngoại lệ A2: Giá chuyển nhượng dưới sàn (< 70% đất thường, < 35% đất thế chấp) bị từ chối với PRICE_BELOW_FLOOR.
11. `[TC-254.11/A2][UC-P2P-MOD/A2]` Ngoại lệ A2: Bất động sản đã nâng cấp nhà/khách sạn hoặc trạm ETC bị từ chối với PROPERTY_HAS_BUILDING.
12. `[TC-254.12/A3][UC-P2P-MOD/A3]` Ngoại lệ A3: Ô đất đang bị khóa thế chấp trong hợp đồng Trái Phiếu Doanh Nghiệp bị từ chối với BOND_COLLATERAL_LOCKED.
13. `[TC-254.13/A3][UC-P2P-MOD/A3]` Ngoại lệ A3: Thẻ sự kiện MC_FREEZE_TRADE đang hiệu lực từ chối mọi giao dịch với FREEZE_ACTIVE.
14. `[TC-254.14/A4][UC-P2P-MOD/A4]` Ngoại lệ A4: Bàn chơi chưa bắt đầu (room.started === false) từ chối với GAME_NOT_STARTED.
15. `[TC-254.15/A4][UC-P2P-MOD/A4]` Ngoại lệ A4: Tự giao dịch với chính mình (sellerId === buyerId) từ chối với INVALID_TRADE.
16. `[TC-254.16/A5][UC-P2P-MOD/A5]` Ngoại lệ A5: Khóa bất biến làm tròn thuế P2P hiện tại (Server Math.round vs Client Math.floor) chống trôi dạt vô thức.

---

## 5. ĐIỀU KIỆN HOÀN THÀNH (DEFINITION OF DONE)

1. **DoD 1: TDD & Traceability:** Bộ test `tests/contracts/imp254_p2p_trade_actions_boundary.test.ts` có 16 atomic tests đạt chuẩn Flow Taxonomy, chứng minh RED trước khi triển khai và GREEN sau khi hoàn tất.
2. **DoD 2: Linter & LOC Budgets:**
   - `src/server/property_actions.ts` giảm từ 390 xuống **<= 170 LOC** (SLOC <= 150), dứt điểm cảnh báo trần Tier 1.
   - `src/server/p2p_trade_actions.ts` đạt **<= 240 LOC**, nằm trong vùng an toàn Tier 1.
   - `npm run lint:slop` báo 0 hard violations; `npm run lint:ui` báo 0 vi phạm.
3. **DoD 3: Review Funnel:** Spec Reviewer và Code Reviewer thẩm định độc lập và lưu vết tệp phê duyệt trong `.agents/audit/`.
4. **DoD 4: Chaos Sentinel:** Vượt qua Station 4 Sentinel Probes với 0 mutants sống sót trên các mutant mục tiêu: đổi `0.70` sàn thường thành `0.75`, đổi `Math.round` tính thuế, đảo điều kiện `price <= 0`.
5. **DoD 5: Quy Hoạch Mã Số & Ledger:**
   - Cập nhật Master Roadmap; đăng ký vé `IMP-260: Modularize Admin Manager Server Network Coordinator` vào sổ nợ kỹ thuật và backlog tương lai.
   - Đăng ký các nợ kỹ thuật có gán target slice cụ thể:
     - `DEBT-ROOM-PROPERTY-COORDINATOR`: Phân rã điều phối viên BĐS (Target: IMP-263).
     - `DEBT-P2P-TAX-ROUNDING-PARITY`: Đồng bộ Math.round vs Math.floor giữa client và server (Target: IMP-262).
     - `DEBT-P2P-COORDINATOR-SECURITY`: Bảo mật luồng đề nghị giao thương (Target: IMP-263).
     - `DEBT-P2P-SWAP-FLOOR`: Sàn định giá hoán đổi BĐS (Target: IMP-263).
     - `DEBT-P2P-TURN-TEARDOWN`: Dọn dẹp trạng thái pending khi sang Turn N+1 (Target: IMP-263).
     - `DEBT-P2P-ZOMBIE-LOCK`: Giải phóng khóa giao dịch khi disconnect (Target: IMP-263).
   - Xuất báo cáo nghiệm thu hoàn chỉnh tại `docs/reports/improvements/IMP-254-modularize-p2p-trade-actions_report.md`.
6. **DoD 6: Zero Regression:** Toàn bộ 164 test suites (3.535 tests) chạy xanh 100%.
