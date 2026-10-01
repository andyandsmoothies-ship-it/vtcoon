# IMPLEMENTATION PLAN (REVISION 5): IMP-VISUAL-METADATA-DESYNC
## Chuẩn Hóa Kiến Trúc Trực Quan & Khắc Phục Lệch Pha Dữ Liệu Hiển Thị UI/3D vs Domain SSOT

> **Ticket ID**: `IMP-VISUAL-METADATA-DESYNC`  
> **Revision**: 5 (Production-Ready Architecture — Pure Type Guards & Zero Magic Strings)  
> **Classification**: Tier 2 (Full Rigor — Cross-module UI/3D Engine Refactor, >50 LOC)  
> **Target Files (10 files)**:
> 1. `src/client/domain_visual_bridge.ts` (NEW — Single Source of Truth Bridge)
> 2. `src/client/3d/tile_event_aura.tsx` (Subtractive Refactor — Verbatim `matchingModifier`)
> 3. `src/client/ui/modals/event_card_visuals.ts` (Subtractive Deletion of `THEMED_EMOJIS` & Pure Type Guard)
> 4. `src/client/ui/market_event_ticker.tsx` (Verbatim Import, Icon & Text Standardize)
> 5. `src/client/ui/modals/title_deed_modal.tsx` (Verbatim 7-item Base & Enum Imports: `MacroCycleType`, `ChanceCardId`)
> 6. `src/client/ui/event_card_punchy_summaries.ts` (Verbatim Prepend Macro & Sync Summaries)
> 7. `src/domain/event_card_metadata.ts` (Verbatim Schema Alignment: description, targetScope, effectDetail, duration, destination)
> 8. `tests/contracts/imp234_dynamic_board_cell_event_highlights.test.ts` (Verbatim `TC-234.02` Reconciliation)
> 9. `tests/client/imp141_market_card_clarity_and_notification_rules.test.ts` (Verbatim `TC-141.05` Reconciliation)
> 10. `tests/contracts/visual_metadata_parity.test.ts` (NEW Contract Suite, >= 15 Atomic tests without loops)  

---

### 1. BẢNG ĐỐI CHIẾU CHỈ THỊ THẨM ĐỊNH (1:1 GRILLER & AUDIT CLOSURE TABLE)

#### 1.1. Bảng Khắc Phục Các Chỉ Thị Từ Review Revision 4 (N+4 Pure Type Safety & Enum Standard)
| Mã Chỉ Thị | Nội Dung Chỉ Thị Thẩm Định (Revision 4) | Vị Trí Xử Lý Trong Revision 5 | Giải Pháp Kỹ Thuật Cụ Thể |
| :--- | :--- | :--- | :--- |
| **R4-DIR-1** | `cardId as EventIdentifiable` là dirty cast, cần type guard an toàn. | `domain_visual_bridge.ts` (L98-106) & `event_card_visuals.ts` (Bước 3.3) | Bổ sung Type Predicate `isEventIdentifiable(id: string): id is EventIdentifiable` và helper `resolveEventIcon(id)`. Loại bỏ 100% từ khóa `as`. |
| **R4-DIR-2** | Bảng LOC delta của `title_deed_modal.tsx` (+6 thay vì -10) và `market_event_ticker.tsx` (-19 thay vì -22). | Section 3 (Bảng LOC Budget) | Đo đạc chính xác tuyệt đối từng dòng. Xác nhận 369 LOC và 269 LOC nằm an toàn sâu dưới trần 500 LOC. |
| **R4-DIR-3** | `title_deed_modal.tsx` dùng string literal `'MACRO_LAND_FEVER'`, thiếu import `MacroCycleType`. | Section 4, Bước 5.1 & 5.2 | Import `MacroCycleType` từ domain, thay thế toàn bộ string literal bằng `[MacroCycleType.MACRO_LAND_FEVER]`. |
| **R4-DIR-4** | Facet-3 duyệt vòng lặp `forEach` trong test là Banned Static Checklist Test. | Section 4, Bước 10 | Tách Facet-3 thành các ca kiểm thử hành vi nguyên tử (Atomic Tests), mỗi ca test 1 kịch bản độc lập, zero loops trong `it()`. |
| **R4-DIR-5** | Làm rõ chủ đích thiết kế đổi Fallback sang Slate `#94A3B8` (Neutral) `isBuff: false`. | Section 2 (Kiến trúc mục tiêu) | Ghi nhận chính thức: Đây là Fail-Safe Default chống lỗi "bão lũ hiển thị cờ buff vàng". |

#### 1.2. Bảng Khắc Phục Các Chỉ Thị Từ Revision 3 (Verbatim Physical Disk Parity)
| Mã Chỉ Thị | Nội Dung Khắc Phục | Trạng Thái |
| :--- | :--- | :---: |
| **R3-DIR-1** | Khôi phục chính xác dòng 74-76 `tile_event_aura.tsx` trên đĩa (`matchingModifier`). | ✅ ĐÃ ĐÓNG VERBATIM |
| **R3-DIR-2** | Khớp chính xác dòng 72 `event_card_visuals.ts` trên đĩa (`label: 'SỐT ĐẤT VÙNG VEN'`). | ✅ ĐÃ ĐÓNG VERBATIM |
| **R3-DIR-3** | Khớp chính xác chuỗi cuối dòng `"cho nhóm màu."` tại dòng 80-81 `market_event_ticker.tsx`. | ✅ ĐÃ ĐÓNG VERBATIM |
| **R3-DIR-4** | Copy chính xác bảng 7 phần tử tại dòng 49-57 của `title_deed_modal.tsx` vào khối `<<<<`. | ✅ ĐÃ ĐÓNG VERBATIM |
| **R3-DIR-5** | Chèn thêm 2 thẻ Macro trước `MC_MEGA_CONCERT` tại dòng 6-8 `event_card_punchy_summaries.ts`. | ✅ ĐÃ ĐÓNG VERBATIM |
| **R3-DIR-6** | Đồng bộ đúng 5 trường schema vật lý trên đĩa (`description, targetScope, effectDetail, duration, destination`) tại `event_card_metadata.ts`. | ✅ ĐÃ ĐÓNG VERBATIM |
| **R3-DIR-7** | Khôi phục test `TC-234.02` tại dòng 166-176 `imp234_dynamic_board_cell_event_highlights.test.ts` với chữ ký `(8, modifiers)`. | ✅ ĐÃ ĐÓNG VERBATIM |

---

### 2. KIẾN TRÚC MỤC TIÊU (TARGET ARCHITECTURE)

```
[Domain SSOT Layer]
  ├── src/domain/macro_cycle_types.ts (MACRO_FEVER_RENT_MULT = 2.5, MACRO_FREEZE = 0.5)
  ├── src/domain/market_card_handlers.ts (multiplier = 2, affectedCells, remainingRounds)
  └── src/domain/event_card_metadata.ts (văn bản mô tả chuẩn hóa)
               │
               ▼
[src/client/domain_visual_bridge.ts] (CẦU NỐI DUY NHẤT)
  ├── EVENT_ICON_REGISTRY: Readonly<Record<EventIdentifiable, string>> (Strict Exhaustive)
  ├── isEventIdentifiable(id: string): id is EventIdentifiable (Type Predicate Guard)
  ├── resolveEventIcon(id: string): string (Pure Safe Resolver)
  └── deriveModifierVisual(modifier: ClientMarketModifier): EventVisualMeta (Dynamic Derivation)
               │
               ├─────────────────────────┬─────────────────────────┬─────────────────────────┐
               ▼                         ▼                         ▼                         ▼
   [tile_event_aura.tsx]     [market_event_ticker.tsx]   [title_deed_modal.tsx]    [event_card_visuals.ts]
   (Nhãn động: x2.5 Thuê)     (resolveEventIcon)         (MODIFIER_DESCS kế thừa)  (isEventIdentifiable)
```

> **Ghi chú kiến trúc về Fallback Neutral (Fail-Safe Default)**:  
> Fallback cuối cùng của `deriveModifierVisual` trả về `{ icon: '🎴', label: 'Hiệu lực', color: '#94A3B8', isBuff: false }`.  
> *Lý do*: Thay thế hoàn toàn cơ chế mặc định cũ vốn gán `isBuff: true` màu vàng `#F59E0B`. Trong hệ thống tài chính, một hiệu ứng lạ hoặc chưa phân loại không được phép giả định là có lợi (Buff), giúp ngăn chặn triệt để lỗi visual desync từng khiến thiên tai `MC_COASTAL_STORM` hiển thị thành cờ Buff màu vàng.

---

### 3. ĐỊNH MỨC NGÂN SÁCH DÒNG MÃ (PHYSICAL LOC BUDGET REPORT)

Đo đạc vật lý độc quyền qua `node scripts/check_loc.mjs` đối chiếu với trần định mức:

| Tệp Vật Lý Trên Đĩa | Phân Tầng (Tier) | Baseline Vật Lý | Dự Báo Delta | LOC Sau Sửa | Trạng Thái Ngân Sách |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/domain_visual_bridge.ts` | Tier 1 (Logic Bridge) | **0** (Mới) | +130 | 130 | ✔️ An Toàn (Ceiling 400) |
| `src/client/3d/tile_event_aura.tsx` | Tier 2 (3D Component) | **224** | -18 | 206 | ✔️ An Toàn (Ceiling 500) |
| `src/client/ui/modals/event_card_visuals.ts` | Tier 2 (UI Visuals) | **341** | -26 | 315 | ✔️ An Toàn (Ceiling 500) |
| `src/client/ui/market_event_ticker.tsx` | Tier 2 (UI Component) | **288** | -19 | 269 | ✔️ An Toàn (Ceiling 500) |
| `src/client/ui/modals/title_deed_modal.tsx` | Tier 2 (UI Modal) | **363** | +6 | 369 | ✔️ An Toàn (Ceiling 500) |
| `src/client/ui/event_card_punchy_summaries.ts` | Tier 2 (UI Summaries) | **98** | +4 | 102 | ✔️ An Toàn (Ceiling 500) |
| `src/domain/event_card_metadata.ts` | Tier 1 (Domain Config) | **322** | 0 | 322 | ⚠️ Cảnh báo an toàn (322 <= 400) |
| `tests/contracts/imp234_dynamic_board_cell_event_highlights.test.ts` | Test Suite | **394** | +2 | 396 | ✔️ An Toàn (Ceiling 600) |
| `tests/client/imp141_market_card_clarity_and_notification_rules.test.ts` | Test Suite | **198** | 0 | 198 | ✔️ An Toàn (Ceiling 600) |
| `tests/contracts/visual_metadata_parity.test.ts` | Test Suite (Mới) | **0** (Mới) | +180 | 180 | ✔️ An Toàn (Ceiling 600) |

---

### 4. BẢN ĐẶC TẢ THỰC THI CHI TIẾT (DROP-IN IMPLEMENTATION SNIPPETS)

#### BƯỚC 1: Tạo Module Cầu Nối SSOT `src/client/domain_visual_bridge.ts`
Tệp mới: `src/client/domain_visual_bridge.ts`
```ts
import { MarketCardId, ChanceCardId } from '../domain/event_card_types.js';
import { MacroCycleType } from '../domain/macro_cycle_types.js';
import type { ClientMarketModifier } from './store/game_store_types.js';

// [DIR-3]: Mở rộng kiểu nghiêm ngặt, triệt tiêu hoàn toàn dirty cast 'as any'
export type EventIdentifiable = MarketCardId | MacroCycleType | ChanceCardId | 'BUILD_HALT';

export interface EventVisualMeta {
  readonly icon: string;
  readonly label: string;
  readonly color: string;
  readonly isBuff: boolean;
}

export const EVENT_ICON_REGISTRY: Readonly<Record<EventIdentifiable, string>> = Object.freeze({
  // 16 Market Cards
  [MarketCardId.MC_FUEL_SURGE]: '⛽',
  [MarketCardId.MC_ALCOHOL_CHECK]: '🚨',
  [MarketCardId.MC_PEAK_TOURISM]: '🏖️',
  [MarketCardId.MC_NIGHT_ECONOMY]: '🌙',
  [MarketCardId.MC_MEGA_CONCERT]: '🎤',
  [MarketCardId.MC_CASINO_PILOT]: '🎰',
  [MarketCardId.MC_RATE_HIKE]: '📈',
  [MarketCardId.MC_CREDIT_STIMULUS]: '📉',
  [MarketCardId.MC_LAND_FEVER]: '🔥',
  [MarketCardId.MC_FIRE_INSPECTION]: '🧯',
  [MarketCardId.MC_PUBLIC_INVEST]: '🏗️',
  [MarketCardId.MC_ANTI_SPECULATE]: '⚖️',
  [MarketCardId.MC_FREEZE_TRADE]: '❄️',
  [MarketCardId.MC_URBAN_PLANNING]: '📐',
  [MarketCardId.MC_UTILITY_DOUBLE]: '⚡',
  [MarketCardId.MC_COASTAL_STORM]: '🌀',

  // 2 Macro Cycles
  [MacroCycleType.MACRO_LAND_FEVER]: '🌋',
  [MacroCycleType.MACRO_LIQUIDITY_FREEZE]: '🧊',

  // 20 Chance Cards & Aliases
  [ChanceCardId.CC_PORT_EXCLUSIVE]: '🚢',
  [ChanceCardId.CC_BUILD_HALT]: '🚧',
  BUILD_HALT: '🚧',
  [ChanceCardId.CC_MEDIA_CRISIS]: '📢',
  [ChanceCardId.CC_PLATE_AUCTION]: '🚘',
  [ChanceCardId.CC_TAX_AUDIT]: '📋',
  [ChanceCardId.CC_STOCK_PROFIT]: '📈',
  [ChanceCardId.CC_DIPLOMATIC]: '🤝',
  [ChanceCardId.CC_CONTRACT_PENALTY]: '📑',
  [ChanceCardId.CC_LAND_CHANGE]: '📜',
  [ChanceCardId.CC_MA_FORCE]: '🏢',
  [ChanceCardId.CC_COPYRIGHT]: '⚖️',
  [ChanceCardId.CC_OVERDRAFT]: '💳',
  [ChanceCardId.CC_JUNK_STOCK]: '📉',
  [ChanceCardId.CC_FRANCHISE]: '🏪',
  [ChanceCardId.CC_LAND_RECLAIM]: '🏗️',
  [ChanceCardId.CC_VENUE_INCIDENT]: '🚨',
  [ChanceCardId.CC_CONCERT_SPONSOR]: '🎵',
  [ChanceCardId.CC_FREE_CREDIT]: '🎁',
  [ChanceCardId.CC_SLOW_BUILD]: '⏳',
  [ChanceCardId.CC_SWAP_PROJECT]: '🔄',
});

// [R4-DIR-1]: Type Predicate Guard & Safe Resolver (Zero Dirty Casts)
export function isEventIdentifiable(id: string): id is EventIdentifiable {
  return Object.prototype.hasOwnProperty.call(EVENT_ICON_REGISTRY, id);
}

export function resolveEventIcon(id: string): string {
  return isEventIdentifiable(id) ? EVENT_ICON_REGISTRY[id] : '🎴';
}

// [DIR-2]: Bổ sung đầy đủ canonical multiplier fallback cho toàn bộ thẻ có tác động tiền thuê
export const CANONICAL_MULTIPLIERS: Partial<Record<EventIdentifiable, number>> = Object.freeze({
  [MacroCycleType.MACRO_LAND_FEVER]: 2.5,
  [MacroCycleType.MACRO_LIQUIDITY_FREEZE]: 0.5,
  [MarketCardId.MC_LAND_FEVER]: 2,
  [MarketCardId.MC_PEAK_TOURISM]: 2,
  [MarketCardId.MC_PUBLIC_INVEST]: 2,
  [MarketCardId.MC_UTILITY_DOUBLE]: 2,
  [MarketCardId.MC_NIGHT_ECONOMY]: 2,
  [MarketCardId.MC_ALCOHOL_CHECK]: 0.5,
  [MarketCardId.MC_COASTAL_STORM]: 0,
});

export function deriveModifierVisual(modifier: ClientMarketModifier): EventVisualMeta {
  const cardType = String(modifier.type ?? '');
  const icon = resolveEventIcon(cardType);

  // [DIR-1]: Đưa 100% các nhánh kiểm tra thẻ đặc thù lên trước khối multiplier tổng quát!
  // 1.1. Cước cảng: Quyền lợi thụ hưởng 50% phí cảng (KHÔNG ĐƯỢC tính thành giảm tiền thuê)
  if (cardType === ChanceCardId.CC_PORT_EXCLUSIVE || modifier.beneficiaryId !== undefined) {
    return { icon, label: 'Hưởng 50%', color: '#F59E0B', isBuff: true };
  }

  // 1.2. Đóng băng thanh khoản vĩ mô: Sắc xanh băng giá #06B6D4
  if (cardType === MacroCycleType.MACRO_LIQUIDITY_FREEZE) {
    return { icon, label: 'Thuê -50%', color: '#06B6D4', isBuff: false };
  }

  // 1.3. Phụ phí xăng dầu hạ tầng
  if (cardType === MarketCardId.MC_FUEL_SURGE) {
    return { icon, label: '+500 Phí', color: '#EF4444', isBuff: false };
  }

  // 1.4. Đô thị trung tâm thế chấp ưu đãi
  if (cardType === MarketCardId.MC_URBAN_PLANNING) {
    return { icon, label: 'Thế chấp 60%', color: '#F59E0B', isBuff: true };
  }

  // 1.5. Đình chỉ công trình
  if (cardType === ChanceCardId.CC_BUILD_HALT || cardType === 'BUILD_HALT') {
    return { icon: '🚧', label: 'Đình chỉ', color: '#EF4444', isBuff: false };
  }

  // 1.6. Khủng hoảng truyền thông
  if (cardType === ChanceCardId.CC_MEDIA_CRISIS) {
    return { icon: '📢', label: 'Đình chỉ', color: '#EF4444', isBuff: false };
  }

  // 2. Suy diễn động theo hệ số multiplier tiền thuê thực tế
  const mult = typeof modifier.multiplier === 'number' 
    ? modifier.multiplier 
    : (isEventIdentifiable(cardType) ? CANONICAL_MULTIPLIERS[cardType] : undefined);

  if (typeof mult === 'number') {
    if (mult === 0) {
      return { icon, label: 'Miễn thuê', color: '#EF4444', isBuff: false };
    }
    if (mult < 1) {
      const discountPct = Math.round((1 - mult) * 100);
      return { icon, label: `-${discountPct}%`, color: '#EF4444', isBuff: false };
    }
    if (mult > 1) {
      const formattedMult = Number.isInteger(mult) ? mult.toString() : mult.toFixed(1);
      return { icon, label: `x${formattedMult} Thuê`, color: '#F59E0B', isBuff: true };
    }
  }

  // 3. Fallback an toàn trung tính: Màu xám slate #94A3B8, isBuff: false
  return { icon, label: 'Hiệu lực', color: '#94A3B8', isBuff: false };
}
```

---

#### BƯỚC 2: Subtractive Refactoring `src/client/3d/tile_event_aura.tsx`
Tệp: `src/client/3d/tile_event_aura.tsx`  

**Bước 2.1: Xóa bỏ `EVENT_VISUAL_MAP` và import Bridge (Dòng 21-51)**
```tsx
<<<<
interface EventVisualMeta {
  readonly icon: string;
  readonly label: string;
  readonly color: string;
  readonly isBuff: boolean;
}

const EVENT_VISUAL_MAP: Record<string, EventVisualMeta> = {
  [MarketCardId.MC_NIGHT_ECONOMY]: { icon: '🌙', label: 'x2 Thuê', color: '#F59E0B', isBuff: true },
  [MarketCardId.MC_LAND_FEVER]: { icon: '🔥', label: '+50%', color: '#F59E0B', isBuff: true },
  [MarketCardId.MC_PEAK_TOURISM]: { icon: '🏖️', label: '+50%', color: '#F59E0B', isBuff: true },
  [MarketCardId.MC_ALCOHOL_CHECK]: { icon: '🚨', label: '-50%', color: '#EF4444', isBuff: false },
  [MarketCardId.MC_FREEZE_TRADE]: { icon: '❄️', label: 'Đóng băng', color: '#06B6D4', isBuff: false },
  [MarketCardId.MC_PUBLIC_INVEST]: { icon: '🏗️', label: '+30%', color: '#F59E0B', isBuff: true },
  [MarketCardId.MC_URBAN_PLANNING]: { icon: '📐', label: 'Quy hoạch', color: '#F59E0B', isBuff: true },
  [MarketCardId.MC_UTILITY_DOUBLE]: { icon: '⚡', label: 'x2 Tiện ích', color: '#F59E0B', isBuff: true },
  [MarketCardId.MC_FIRE_INSPECTION]: { icon: '🧯', label: 'Thanh tra', color: '#EF4444', isBuff: false },
  [MarketCardId.MC_ANTI_SPECULATE]: { icon: '⚖️', label: 'Bình ổn', color: '#F59E0B', isBuff: true },
  [MarketCardId.MC_FUEL_SURGE]: { icon: '⛽', label: 'Phí cao', color: '#EF4444', isBuff: false },
  [ChanceCardId.CC_BUILD_HALT]: { icon: '🚧', label: 'Đình chỉ', color: '#EF4444', isBuff: false },
  BUILD_HALT: { icon: '🚧', label: 'Đình chỉ', color: '#EF4444', isBuff: false },
  MACRO_LAND_FEVER: { icon: '🌋', label: '+50%', color: '#F59E0B', isBuff: true },
  MACRO_LIQUIDITY_FREEZE: { icon: '🧊', label: 'Khóa', color: '#06B6D4', isBuff: false },
};

const DEFAULT_EVENT_META: EventVisualMeta = {
  icon: '🎴',
  label: 'Hiệu lực',
  color: '#F59E0B',
  isBuff: true,
};
====
import { deriveModifierVisual } from '../domain_visual_bridge.js';
>>>>
```

**Bước 2.2: Thay thế lệnh tra cứu trong `resolveTileEventStatus` (Dòng 74-76) [R3-DIR-1]**
```tsx
<<<<
  const cardType = String(matchingModifier.type ?? '');
  const meta = EVENT_VISUAL_MAP[cardType] ?? DEFAULT_EVENT_META;
  const isSpotlighted = Boolean(spotlightedCells && spotlightedCells.includes(cellIndex));
====
  const cardType = String(matchingModifier.type ?? '');
  const meta = deriveModifierVisual(matchingModifier);
  const isSpotlighted = Boolean(spotlightedCells && spotlightedCells.includes(cellIndex));
>>>>
```

---

#### BƯỚC 3: Subtractive Refactoring & Pure Type Guard `src/client/ui/modals/event_card_visuals.ts`
Tệp: `src/client/ui/modals/event_card_visuals.ts`

**Bước 3.1: Import Bridge, MacroCycleType & Xóa 41 dòng của `THEMED_EMOJIS` (Dòng 1-60) [R2-DIR-4]**
```ts
<<<<
// [IMP-134] Event Card Visuals — Themed emojis, hero stat formatting & sanitizers for Fintech Card overhaul
import { MarketCardId, ChanceCardId } from '../../../domain/event_card_types.js';
import { formatCurrency } from '../ui_helpers.js';

export type HeroStatVariant = 'positive' | 'negative' | 'warning' | 'info';

export interface HeroStat {
  readonly label: string;
  readonly value: string;
  readonly variant: HeroStatVariant;
}

export interface HeroStatStyles {
  readonly container: string;
  readonly label: string;
  readonly value: string;
  readonly badge: string;
}

const THEMED_EMOJIS: Readonly<Record<string, string>> = {
  // Market cards
  [MarketCardId.MC_FUEL_SURGE]: '⛽',
  [MarketCardId.MC_ALCOHOL_CHECK]: '🚨',
  [MarketCardId.MC_PEAK_TOURISM]: '🏖️',
  [MarketCardId.MC_NIGHT_ECONOMY]: '🍸',
  [MarketCardId.MC_MEGA_CONCERT]: '🎤',
  [MarketCardId.MC_CASINO_PILOT]: '🎰',
  [MarketCardId.MC_RATE_HIKE]: '📈',
  [MarketCardId.MC_CREDIT_STIMULUS]: '🏦',
  [MarketCardId.MC_LAND_FEVER]: '🔥',
  [MarketCardId.MC_FIRE_INSPECTION]: '🧯',
  [MarketCardId.MC_PUBLIC_INVEST]: '🏗️',
  [MarketCardId.MC_ANTI_SPECULATE]: '🛡️',
  [MarketCardId.MC_FREEZE_TRADE]: '❄️',
  [MarketCardId.MC_URBAN_PLANNING]: '🏙️',
  [MarketCardId.MC_UTILITY_DOUBLE]: '💡',
  [MarketCardId.MC_COASTAL_STORM]: '🌪️',

  // Chance cards
  [ChanceCardId.CC_PLATE_AUCTION]: '🚘',
  [ChanceCardId.CC_TAX_AUDIT]: '📋',
  [ChanceCardId.CC_STOCK_PROFIT]: '📈',
  [ChanceCardId.CC_DIPLOMATIC]: '🤝',
  [ChanceCardId.CC_CONTRACT_PENALTY]: '📑',
  [ChanceCardId.CC_LAND_CHANGE]: '📜',
  [ChanceCardId.CC_BUILD_HALT]: '🚧',
  [ChanceCardId.CC_MA_FORCE]: '🏢',
  [ChanceCardId.CC_COPYRIGHT]: '⚖️',
  [ChanceCardId.CC_OVERDRAFT]: '💳',
  [ChanceCardId.CC_JUNK_STOCK]: '📉',
  [ChanceCardId.CC_FRANCHISE]: '🏪',
  [ChanceCardId.CC_LAND_RECLAIM]: '🏗️',
  [ChanceCardId.CC_VENUE_INCIDENT]: '🚨',
  [ChanceCardId.CC_CONCERT_SPONSOR]: '🎵',
  [ChanceCardId.CC_FREE_CREDIT]: '🎁',
  [ChanceCardId.CC_PORT_EXCLUSIVE]: '🚢',
  [ChanceCardId.CC_SLOW_BUILD]: '⏳',
  [ChanceCardId.CC_MEDIA_CRISIS]: '📢',
  [ChanceCardId.CC_SWAP_PROJECT]: '🔄',
};
====
// [IMP-134] Event Card Visuals — Themed emojis, hero stat formatting & sanitizers for Fintech Card overhaul
import { MarketCardId, ChanceCardId } from '../../../domain/event_card_types.js';
import { MacroCycleType } from '../../../domain/macro_cycle_types.js';
import { formatCurrency } from '../ui_helpers.js';
import { EVENT_ICON_REGISTRY, isEventIdentifiable } from '../domain_visual_bridge.js';

export type HeroStatVariant = 'positive' | 'negative' | 'warning' | 'info';

export interface HeroStat {
  readonly label: string;
  readonly value: string;
  readonly variant: HeroStatVariant;
}

export interface HeroStatStyles {
  readonly container: string;
  readonly label: string;
  readonly value: string;
  readonly badge: string;
}
>>>>
```

**Bước 3.2: Cập nhật `KNOWN_HERO_STATS` tại dòng 72 [R3-DIR-2]**
```ts
<<<<
  [MarketCardId.MC_LAND_FEVER]: { label: 'SỐT ĐẤT VÙNG VEN', value: '+50% THUÊ & GIÁ BÁN', variant: 'positive' },
====
  [MarketCardId.MC_LAND_FEVER]: { label: 'SỐT ĐẤT VÙNG VEN', value: 'x2 TIỀN THUÊ', variant: 'positive' },
  [MacroCycleType.MACRO_LAND_FEVER]: { label: 'SỐT ĐẤT VĨ MÔ', value: 'THUÊ x2.5 • XÂY -25%', variant: 'positive' },
  [MacroCycleType.MACRO_LIQUIDITY_FREEZE]: { label: 'ĐÓNG BĂNG THANH KHOẢN', value: 'THUÊ -50% • CẤM VAY', variant: 'warning' },
>>>>
```

**Bước 3.3: Cập nhật `getCardThemedEmoji` dùng Pure Type Guard (Dòng 167-172) [R4-DIR-1]**
```ts
<<<<
export function getCardThemedEmoji(cardId: string, cardType: 'chance' | 'market'): string {
  if (cardId && THEMED_EMOJIS[cardId]) {
    return THEMED_EMOJIS[cardId];
  }
  return cardType === 'market' ? '📰' : '⚡';
}
====
export function getCardThemedEmoji(cardId: string, cardType: 'chance' | 'market'): string {
  if (cardId && isEventIdentifiable(cardId)) {
    return EVENT_ICON_REGISTRY[cardId];
  }
  return cardType === 'market' ? '📰' : '⚡';
}
>>>>
```

---

#### BƯỚC 4: Chuẩn Hóa Ticker `src/client/ui/market_event_ticker.tsx`
Tệp: `src/client/ui/market_event_ticker.tsx`

**Bước 4.1: Import Resolver tại dòng 8-10 (Bảo tồn `MarketEventTickerProps`) [R2-DIR-1]**
```tsx
<<<<
import { vi as viTranslations } from '../../domain/i18n/vi.js';
import { getCardHeroStat, getHeroStatStyles } from './modals/event_card_visuals.js';

export interface MarketEventTickerProps {
====
import { vi as viTranslations } from '../../domain/i18n/vi.js';
import { getCardHeroStat, getHeroStatStyles } from './modals/event_card_visuals.js';
import { resolveEventIcon } from '../domain_visual_bridge.js';

export interface MarketEventTickerProps {
>>>>
```

**Bước 4.2: Rút gọn `resolveMarketIcon` tại dòng 20-42 (Bảo tồn `ALL_MARKET_TITLES`) [R4-DIR-1]**
```tsx
<<<<
export function resolveMarketIcon(type: string): string {
  switch (type) {
    case MarketCardId.MC_FREEZE_TRADE: return '❄️';
    case MarketCardId.MC_COASTAL_STORM: return '🌀';
    case MarketCardId.MC_PUBLIC_INVEST: return '🏗️';
    case MarketCardId.MC_RATE_HIKE: return '📈';
    case MarketCardId.MC_CREDIT_STIMULUS: return '📉';
    case MarketCardId.MC_PEAK_TOURISM: return '🏖️';
    case MarketCardId.MC_NIGHT_ECONOMY: return '🌙';
    case MarketCardId.MC_ALCOHOL_CHECK: return '🚨';
    case MarketCardId.MC_CASINO_PILOT: return '🎰';
    case MarketCardId.MC_LAND_FEVER: return '🔥';
    case MarketCardId.MC_FIRE_INSPECTION: return '🧯';
    case MarketCardId.MC_ANTI_SPECULATE: return '⚖️';
    case MarketCardId.MC_FUEL_SURGE: return '⛽';
    case MarketCardId.MC_URBAN_PLANNING: return '📐';
    case MarketCardId.MC_UTILITY_DOUBLE: return '⚡';
    case ChanceCardId.CC_PORT_EXCLUSIVE: return '🚢';
    case 'MACRO_LAND_FEVER': return '🌋';
    case 'MACRO_LIQUIDITY_FREEZE': return '🧊';
    default: return '🎴';
  }
}
====
export function resolveMarketIcon(type: string): string {
  return resolveEventIcon(type);
}
>>>>
```

**Bước 4.3: Đồng bộ chuẩn hóa `MC_LAND_FEVER` & `MACRO_LAND_FEVER` trong Ticker (Dòng 80-81, 98-99, 148) [R3-DIR-3]**
```tsx
<<<<
  MACRO_LAND_FEVER:
    'Sốt đất vĩ mô: Tăng 250% tiền thuê và giảm 25% chi phí xây dựng cho nhóm màu.',
====
  MACRO_LAND_FEVER:
    'Sốt đất vĩ mô: Thuê x2.5 (+150%) và giảm 25% chi phí xây dựng cho nhóm màu.',
>>>>
```
và trong `ACTIVE_MARKET_EFFECT_SUMMARIES` dòng 98-99:
```tsx
<<<<
  [MarketCardId.MC_LAND_FEVER]:
    'Tăng 50% tiền thuê & giá chuyển nhượng (Bình Dương, Đồng Nai, Hưng Yên).',
====
  [MarketCardId.MC_LAND_FEVER]:
    'Nhân đôi doanh thu tiền thuê (x2) & giá chuyển nhượng (Bình Dương, Đồng Nai, Hưng Yên).',
>>>>
```
và trong `ACTIVE_MARKET_COMPACT_FORMULAS` dòng 148:
```tsx
<<<<
  [MarketCardId.MC_LAND_FEVER]: 'Ven đô: Thuê & Bán +50%',
====
  [MarketCardId.MC_LAND_FEVER]: 'Ven đô: Cước thuê x2',
>>>>
```

---

#### BƯỚC 5: Cập Nhật Sổ Đỏ `src/client/ui/modals/title_deed_modal.tsx`
Tệp: `src/client/ui/modals/title_deed_modal.tsx`

**Bước 5.1: Cập nhật dòng import số 8 bổ sung `ChanceCardId`, `MacroCycleType` & Bridge [R4-DIR-3]**
```tsx
<<<<
import { MarketCardId } from '../../../domain/event_card_types';
import type { MarketModifier } from '../../../domain/room';
====
import { MarketCardId, ChanceCardId } from '../../../domain/event_card_types';
import { MacroCycleType } from '../../../domain/macro_cycle_types';
import type { MarketModifier } from '../../../domain/room';
import { EVENT_ICON_REGISTRY } from '../domain_visual_bridge';
>>>>
```

**Bước 5.2: Chuẩn hóa `MODIFIER_DESCS` với Enum Keys (Zero Magic Strings) (Dòng 49-57) [R4-DIR-3]**
```tsx
<<<<
const MODIFIER_DESCS: Record<string, { icon: string; text: string }> = {
  [MarketCardId.MC_FUEL_SURGE]: { icon: '⚡', text: 'Biến Động Xăng Dầu: Phụ thu +500 cước vận tải' },
  [MarketCardId.MC_PEAK_TOURISM]: { icon: '🌊', text: 'Mùa Du Lịch: Nhân đôi phí thuê (x2)' },
  [MarketCardId.MC_UTILITY_DOUBLE]: { icon: '💡', text: 'Giá Điện & Viễn Thông: Nhân đôi phí dịch vụ (x2)' },
  [MarketCardId.MC_COASTAL_STORM]: { icon: '🌀', text: 'Bão Lũ Duyên Hải: Miễn 100% tiền thuê & cô lập giao thông' },
  [MarketCardId.MC_NIGHT_ECONOMY]: { icon: '🌙', text: 'Kinh Tế Ban Đêm: Nhân đôi phí dịch vụ (x2)' },
  [MarketCardId.MC_ALCOHOL_CHECK]: { icon: '🚨', text: 'Nghị Định 100: Giảm 50% tiền thuê; chốt phạt 800 & giữ xe' },
  [MarketCardId.MC_PUBLIC_INVEST]: { icon: '🏗️', text: 'Vốn Đầu Tư Công: Nhân đôi cước phí vận tải (x2)' },
};
====
const MODIFIER_DESCS: Record<string, { icon: string; text: string }> = {
  [MarketCardId.MC_FUEL_SURGE]: { icon: EVENT_ICON_REGISTRY[MarketCardId.MC_FUEL_SURGE], text: 'Biến Động Xăng Dầu: Phụ thu +500 cước vận tải' },
  [MarketCardId.MC_PEAK_TOURISM]: { icon: EVENT_ICON_REGISTRY[MarketCardId.MC_PEAK_TOURISM], text: 'Mùa Du Lịch: Nhân đôi phí thuê (x2)' },
  [MarketCardId.MC_LAND_FEVER]: { icon: EVENT_ICON_REGISTRY[MarketCardId.MC_LAND_FEVER], text: 'Sốt Đất Vệ Tinh: Nhân đôi tiền thuê (x2)' },
  [MarketCardId.MC_UTILITY_DOUBLE]: { icon: EVENT_ICON_REGISTRY[MarketCardId.MC_UTILITY_DOUBLE], text: 'Giá Điện & Viễn Thông: Nhân đôi phí dịch vụ (x2)' },
  [MarketCardId.MC_COASTAL_STORM]: { icon: EVENT_ICON_REGISTRY[MarketCardId.MC_COASTAL_STORM], text: 'Bão Lũ Duyên Hải: Miễn 100% tiền thuê & cô lập giao thông' },
  [MarketCardId.MC_NIGHT_ECONOMY]: { icon: EVENT_ICON_REGISTRY[MarketCardId.MC_NIGHT_ECONOMY], text: 'Kinh Tế Ban Đêm: Nhân đôi phí dịch vụ (x2)' },
  [MarketCardId.MC_ALCOHOL_CHECK]: { icon: EVENT_ICON_REGISTRY[MarketCardId.MC_ALCOHOL_CHECK], text: 'Nghị Định 100: Giảm 50% tiền thuê; chốt phạt 800 & giữ xe' },
  [MarketCardId.MC_PUBLIC_INVEST]: { icon: EVENT_ICON_REGISTRY[MarketCardId.MC_PUBLIC_INVEST], text: 'Vốn Đầu Tư Công: Nhân đôi cước phí vận tải (x2)' },
  [MarketCardId.MC_URBAN_PLANNING]: { icon: EVENT_ICON_REGISTRY[MarketCardId.MC_URBAN_PLANNING], text: 'Quy Hoạch Đô Thị: Thế chấp nhận 60%' },
  [MarketCardId.MC_FREEZE_TRADE]: { icon: EVENT_ICON_REGISTRY[MarketCardId.MC_FREEZE_TRADE], text: 'Đóng Băng Giao Dịch: Không thể sang tên' },
  [MacroCycleType.MACRO_LAND_FEVER]: { icon: EVENT_ICON_REGISTRY[MacroCycleType.MACRO_LAND_FEVER], text: 'Sốt Đất Vĩ Mô: Thuê x2.5, Xây nhà -25%' },
  [MacroCycleType.MACRO_LIQUIDITY_FREEZE]: { icon: EVENT_ICON_REGISTRY[MacroCycleType.MACRO_LIQUIDITY_FREEZE], text: 'Đóng Băng Thanh Khoản: Giảm 50% tiền thuê' },
  [ChanceCardId.CC_PORT_EXCLUSIVE]: { icon: EVENT_ICON_REGISTRY[ChanceCardId.CC_PORT_EXCLUSIVE], text: 'Hợp Tác Cảng: Hưởng 50% doanh thu cước' },
};
>>>>
```

---

#### BƯỚC 6: Chuẩn Hóa Tóm Tắt Nhanh `src/client/ui/event_card_punchy_summaries.ts`
Tệp: `src/client/ui/event_card_punchy_summaries.ts`

**Bước 6.1: Bổ sung 2 chu kỳ vĩ mô trước `MC_MEGA_CONCERT` tại dòng 6-8 [R3-DIR-5]**
```ts
<<<<
export const PUNCHY_EVENT_SUMMARIES: PunchyEventSummariesMap = Object.freeze({
  // 16 Market cards
  [MarketCardId.MC_MEGA_CONCERT]: 'Di chuyển đến ô Dịch Vụ cao nhất',
====
export const PUNCHY_EVENT_SUMMARIES: PunchyEventSummariesMap = Object.freeze({
  // Macro cycles
  ['MACRO_LAND_FEVER']: 'Thuê x2.5 (+150%) & giảm giá xây dựng 25%',
  ['MACRO_LIQUIDITY_FREEZE']: 'Giảm 50% tiền thuê & cấm thế chấp',

  // 16 Market cards
  [MarketCardId.MC_MEGA_CONCERT]: 'Di chuyển đến ô Dịch Vụ cao nhất',
>>>>
```

**Bước 6.2: Cập nhật `MC_LAND_FEVER` tại dòng 18 [R3-DIR-5]**
```ts
<<<<
  [MarketCardId.MC_LAND_FEVER]: 'Tăng 50% tiền thuê & sang nhượng',
====
  [MarketCardId.MC_LAND_FEVER]: 'Nhân đôi tiền thuê vùng ven (x2)',
>>>>
```

---

#### BƯỚC 7: Chuẩn Hóa Metadata `src/domain/event_card_metadata.ts`
Tệp: `src/domain/event_card_metadata.ts`  
Enclosing Range: Dòng 218-224 (đúng 100% 5 trường schema vật lý trên đĩa) [R3-DIR-6]

```ts
<<<<
  [MarketCardId.MC_LAND_FEVER]: {
    description: 'Quy hoạch hạ tầng liên vùng kích hoạt làn sóng sốt đất, tăng mạnh giá chuyển nhượng và tiền thuê.',
    targetScope: 'Đô thị vệ tinh Bình Dương, Đồng Nai, Hưng Yên (Ô 6, 8, 31)',
    effectDetail: 'Tăng 50% giá trị chuyển nhượng và tiền thuê tại các tâm điểm sốt đất vùng ven',
    duration: '1 vòng chơi',
    destination: 'Chủ sở hữu bất động sản tại vùng sốt đất',
  },
====
  [MarketCardId.MC_LAND_FEVER]: {
    description: 'Quy hoạch hạ tầng liên vùng kích hoạt làn sóng sốt đất, nhân đôi doanh thu tiền thuê (x2) và tăng giá chuyển nhượng.',
    targetScope: 'Đô thị vệ tinh Bình Dương, Đồng Nai, Hưng Yên (Ô 6, 8, 31)',
    effectDetail: 'Nhân đôi tiền thuê (x2) và tăng giá trị chuyển nhượng tại các tâm điểm sốt đất vùng ven',
    duration: '1 vòng chơi',
    destination: 'Chủ sở hữu bất động sản tại vùng sốt đất',
  },
>>>>
```

---

#### BƯỚC 8: Reconcile Bộ Test Cũ `imp234_dynamic_board_cell_event_highlights.test.ts`
Tệp: `tests/contracts/imp234_dynamic_board_cell_event_highlights.test.ts`  
Enclosing Range: Dòng 166-176 (chữ ký `resolveTileEventStatus(8, modifiers)` chuẩn đĩa) [R3-DIR-7]

```ts
<<<<
    it('[TC-234.02/MSS][UC-IMP234] resolveTileEventStatus khi có modifier MC_LAND_FEVER (affectedCells: [6, 8, 31], rounds: 1) -> trả về isActive: true, icon 🔥, label +50%, isExpiringSoon: true', () => {
      const modifiers = [
        { type: MarketCardId.MC_LAND_FEVER, remainingRounds: 1, affectedCells: [6, 8, 31] },
      ];
      const status = resolveTileEventStatus(8, modifiers);

      expect(status.isActive).toBe(true);
      expect(status.icon).toBe('🔥');
      expect(status.label).toBe('+50%');
      expect(status.isExpiringSoon).toBe(true);
    });
====
    it('[TC-234.02/MSS][UC-IMP234] resolveTileEventStatus khi có modifier MC_LAND_FEVER (affectedCells: [6, 8, 31], rounds: 1) -> trả về isActive: true, icon 🔥, label x2 Thuê theo SSOT, isExpiringSoon: true', () => {
      const modifiers = [
        { type: MarketCardId.MC_LAND_FEVER, remainingRounds: 1, affectedCells: [6, 8, 31] },
      ];
      const status = resolveTileEventStatus(8, modifiers);

      expect(status.isActive).toBe(true);
      expect(status.icon).toBe('🔥');
      expect(status.label).toBe('x2 Thuê');
      expect(status.isExpiringSoon).toBe(true);
    });
>>>>
```

---

#### BƯỚC 9: Reconcile Test Ticker `tests/client/imp141_market_card_clarity_and_notification_rules.test.ts`
Tệp: `tests/client/imp141_market_card_clarity_and_notification_rules.test.ts`  
Enclosing Range: Dòng 46-51

```ts
<<<<
    it('[TC-141.05/MSS][UC-IMP141][Facet-1/Boundary] MC_LAND_FEVER nêu rõ 50% và Bình Dương, Đồng Nai, Hưng Yên hoặc ô 6, 8, 31', () => {
      const summary = resolveMarketEffectSummary(MarketCardId.MC_LAND_FEVER);
      expect(summary).toMatch(/50%/i);
      expect(summary).toMatch(/(bình dương|đồng nai|hưng yên|6,\s*8,\s*31)/i);
    });
====
    it('[TC-141.05/MSS][UC-IMP141][Facet-1/Boundary] MC_LAND_FEVER nêu rõ Nhân đôi (x2) và Bình Dương, Đồng Nai, Hưng Yên hoặc ô 6, 8, 31', () => {
      const summary = resolveMarketEffectSummary(MarketCardId.MC_LAND_FEVER);
      expect(summary).toMatch(/(nhân đôi|x2)/i);
      expect(summary).toMatch(/(bình dương|đồng nai|hưng yên|6,\s*8,\s*31)/i);
    });
>>>>
```

---

#### BƯỚC 10: Xây Dựng Suite Test Hợp Đồng Mới `tests/contracts/visual_metadata_parity.test.ts`
Tệp mới: `tests/contracts/visual_metadata_parity.test.ts`  
Bao gồm >= 15 atomic tests, Universal 5-Facet Matrix (Tuân thủ nguyên tắc: Zero loops in `it()`, Zero static checklist tests):
- `[TC-PARITY.01/MSS][Facet-1]`: `MACRO_LAND_FEVER` suy diễn đúng `icon: 🌋`, `label: 'x2.5 Thuê'`, `color: '#F59E0B'`, `isBuff: true`.
- `[TC-PARITY.02/MSS][Facet-1]`: `MC_PEAK_TOURISM` suy diễn đúng `icon: 🏖️`, `label: 'x2 Thuê'`, `color: '#F59E0B'`, `isBuff: true`.
- `[TC-PARITY.03/MSS][Facet-1]`: `MC_PUBLIC_INVEST` suy diễn đúng `icon: 🏗️`, `label: 'x2 Thuê'`, `color: '#F59E0B'`, `isBuff: true`.
- `[TC-PARITY.04/MSS][Facet-1]`: `MC_LAND_FEVER` suy diễn đúng `icon: 🔥`, `label: 'x2 Thuê'`, `color: '#F59E0B'`, `isBuff: true`.
- `[TC-PARITY.05/MSS][Facet-1]`: `MC_ALCOHOL_CHECK` suy diễn đúng `icon: 🚨`, `label: '-50%'`, `color: '#EF4444'`, `isBuff: false`.
- `[TC-PARITY.06/MSS][Facet-1]`: `MC_COASTAL_STORM` suy diễn đúng `icon: 🌀`, `label: 'Miễn thuê'`, `color: '#EF4444'`, `isBuff: false`.
- `[TC-PARITY.07/Boundary][Facet-2]`: `CC_PORT_EXCLUSIVE` với `beneficiaryId` -> `icon: 🚢`, `label: 'Hưởng 50%'`, `color: '#F59E0B'`, `isBuff: true`.
- `[TC-PARITY.08/Boundary][Facet-2]`: `MACRO_LIQUIDITY_FREEZE` -> `icon: 🧊`, `label: 'Thuê -50%'`, `color: '#06B6D4'`, `isBuff: false`.
- `[TC-PARITY.09/Boundary][Facet-2]`: `MC_FUEL_SURGE` -> `icon: ⛽`, `label: '+500 Phí'`, `color: '#EF4444'`, `isBuff: false`.
- `[TC-PARITY.10/Boundary][Facet-2]`: `MC_URBAN_PLANNING` -> `icon: 📐`, `label: 'Thế chấp 60%'`, `color: '#F59E0B'`, `isBuff: true`.
- `[TC-PARITY.11/Boundary][Facet-2]`: `CC_BUILD_HALT` & alias `BUILD_HALT` -> `icon: 🚧`, `label: 'Đình chỉ'`, `color: '#EF4444'`, `isBuff: false`.
- `[TC-PARITY.12/MSS][Facet-3]`: `resolveEventIcon` trả về đúng emoji cho `MacroCycleType.MACRO_LAND_FEVER`.
- `[TC-PARITY.13/MSS][Facet-3]`: `resolveEventIcon` trả về đúng emoji cho `MarketCardId.MC_LAND_FEVER`.
- `[TC-PARITY.14/MSS][Facet-3]`: `resolveEventIcon` trả về đúng emoji cho `ChanceCardId.CC_PORT_EXCLUSIVE`.
- `[TC-PARITY.15/MSS][Facet-4]`: Khớp văn bản giữa `resolveMarketEffectSummary(MC_LAND_FEVER)` và `KNOWN_HERO_STATS[MC_LAND_FEVER]` (đều thể hiện x2 tiền thuê).
- `[TC-PARITY.16/MSS][Facet-4]`: Khớp văn bản giữa `resolveMarketCompactFormula(MC_LAND_FEVER)` với sa bàn 3D (`x2`).
- `[TC-PARITY.17/Fallback][Facet-5]`: Modifier lạ / không có multiplier trả về an toàn trung tính `{ icon: '🎴', label: 'Hiệu lực', color: '#94A3B8', isBuff: false }`.

---

### 5. QUY TRÌNH 4 TRẠM KHÉP KÍN (4-STATION CLOSED-LOOP PIPELINE)

```
🚦 [ACTIVATE 4-STATION CLOSED-LOOP PIPELINE]
├── Trạm 1 (Station 1 RED): qa-tester viết tests/contracts/visual_metadata_parity.test.ts (17 tests) & chứng minh fail
├── Trạm 2 (Station 2 GREEN): implementer tạo domain_visual_bridge.ts & áp dụng snippets
├── Trạm 2.5 (Fast Pre-Filter): scout quét tsc, check:loc, no dirty casts
├── Trạm 3 (Review Funnel): 
│   ├── Phase 3.1: spec-reviewer (100% Spec Reconciliation)
│   └── Phase 3.2: code-reviewer (Anti-slop, no memory leaks)
└── Trạm 4 (Adversarial Sentinel): chaos-sentinel thẩm định Wire-to-Core & Mutation Parity
```
