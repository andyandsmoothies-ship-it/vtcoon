# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE (LEAN PLAN SPECIFICATION) — REVISION 2
# TICKET: IMP-276A — Title Deed Affordance & Anti-Ghost Upgrade (Đồng Bộ Giá Nâng Cấp, Rent Table & Turn/Phase Guard)

> **Mã Nhiệm Vụ:** IMP-276A (Micro-Slice 1 thuộc Lộ Trình Đồng Bộ Giao Diện MC_RATE_HIKE)  
> **Phân hệ mục tiêu:** `client-ui`  
> **Phân loại rủi ro:** Tier 2 Micro-Slice (Lean Plan Specification, Targeted <= 250 lines, Delta <= 50 LOC, Max 2-3 files in `src/**`)  
> **Chỉ tiêu kiểm thử:** Scaled Floor >= 12 atomic tests, >= 8 mutants killed, Pure Logic Waiver = `false` (Bắt buộc chạy Phase 3.0 Dual-Viewport Capture & UI Craft Review)

---

### BẢNG ĐÁP ỨNG CHỈ THỊ PHẢN BIỆN (REVISION DIRECTIVE COVERAGE — REVISION 2)

| Directive Code | Nguồn Chỉ Thị | Mô Tả Yêu Cầu / Rủi Ro | Vị Trí Xử Lý Trong Plan Revision 2 |
| :--- | :--- | :--- | :--- |
| **DIR-1** | User Critique #1 | Vi phạm `Pure Logic Waiver Guard` khi sửa file UI (`title_deed_affordance.ts`) đổi text nút mà tự cấp waiver = true trốn Phase 3.0. | Header & Section 1: Hủy bỏ `pureLogicWaiver: true` $\rightarrow$ Đổi thành `false`. Bắt buộc chạy Phase 3.0 chụp ảnh Dual-Viewport và dispatch `ui-craft-reviewer`. |
| **DIR-2** | User Critique #2 | Visual Split-Brain: Nút bấm hiển thị `+1.200` nhưng bảng `TitleDeedRentTable` ở trên vẫn đọc `deed.upgradeCosts` tĩnh hiển thị `+1.000`. | Section 1, Task 1, 2, 3: `resolveTitleDeedModalState` tính mảng `upgradeCosts` động và truyền qua `TitleDeedModal` $\rightarrow$ `TitleDeedRentTable`. |
| **DIR-3** | User Critique #3 | Bỏ sót Turn & Phase Guard: Mở sổ đỏ xem ngoài lượt chơi hoặc ngoài pha `PropertyManagement` nút vẫn sáng, bấm bị Server reject. | Section 1.2, Task 1: Bổ sung kiểm tra `currentTurnPlayerId` và `turnPhase !== 'PropertyManagement'` trước khi mở nút nâng cấp. |
| **DIR-4** | User Critique #4 | Copy văn bản cụt lủn `'Không đủ tiền mặt để nâng cấp'` thiếu tính công thái học và chỉ dẫn hành động. | Task 1: Chuẩn hóa thành `Cần ${effectiveUpgradeCost} Tr. VNĐ để nâng cấp`, đồng bộ với Railroad & Utility. |
| **DIR-5** | User Critique #5 | Test inflation: 4 test toán học lặp lại domain test, bỏ quên test Turn Guard, Phase Guard, Fallback undefined modifiers, và Split-Brain sync. | Section 3: Cơ cấu lại toàn bộ 12 test specs, loại bỏ test toán học thừa, tập trung 100% vào các ca test tích hợp thực tế. |

---

## 0. KHẢO SÁT BỀ MẶT MÃ NGUỒN & ĐIỂM BẮT ĐẦU (SURFACE INVENTORY & LOC BASELINE)

### 0.1 Danh Sách Tệp Mục Tiêu & Dòng Mã Thực Tế Trên Đĩa
* **Target physical file**: `src/client/ui/modals/title_deed_affordance.ts` (275 lines, Tier 2 limit: 500 lines) — **Safe**.
* **Target physical file**: `src/client/ui/modals/title_deed_modal.tsx` (386 lines, Tier 2 limit: 500 lines) — **Safe**.
* **Target physical file**: `src/client/ui/modals/hosts/deed_modal_host.tsx` (104 lines, Tier 2 limit: 500 lines) — **Safe**.
* **Target physical file**: `tests/contracts/imp276a_title_deed_affordance.test.ts` (New file to be created in Station 1/2) — **Safe**.

### 0.2 Bảng Thống Kê Delta LOC Dự Kiến
| File | Current LOC | Expected LOC | Delta LOC | Status |
| :--- | :---: | :---: | :---: | :---: |
| `src/client/ui/modals/title_deed_affordance.ts` | 275 | 290 | +15 lines | Safe (Tier 2 <= 500) |
| `src/client/ui/modals/title_deed_modal.tsx` | 386 | 388 | +2 lines | Safe (Tier 2 <= 500) |
| `src/client/ui/modals/hosts/deed_modal_host.tsx` | 104 | 105 | +1 line | Safe (Tier 2 <= 500) |
| `tests/contracts/imp276a_title_deed_affordance.test.ts` | 0 | ~260 | +260 lines | Safe |
| **Tổng Delta Production (`src/**`)** | — | — | **+18 net LOC** (<= 50 LOC) | **Pass Micro-Slice** |

### 0.3 Kiểm Kê Toàn Bộ Bề Mặt Điểm Gọi & Phân Định Phạm Vi (Scope Conservation Mandate)
1. [`src/client/ui/modals/title_deed_affordance.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/title_deed_affordance.ts) — **MODIFY (Target 1)**: Tích hợp `calculateUpgradeCost`, tính mảng `dynamicUpgradeCosts`, bổ sung Turn/Phase Guard và Solvency check.
2. [`src/client/ui/modals/title_deed_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/title_deed_modal.tsx) — **MODIFY (Target 2)**: Nhận prop `upgradeCosts?: readonly number[]` và truyền vào `TitleDeedRentTable`.
3. [`src/client/ui/modals/hosts/deed_modal_host.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/hosts/deed_modal_host.tsx) — **MODIFY (Target 3)**: Truyền `upgradeCosts={deedState.upgradeCosts}` từ affordance vào `TitleDeedModal`.
4. **Các tệp hoãn sang TICKET-IMP-276B (Phân hệ `client-ui`)**:
   - `src/client/ui/modals/event_card_modal.tsx#L114` (Gỡ bỏ hardcode `isDefaultMacroMarket`)
   - `src/client/ui/market_event_ticker.tsx#L75,L127` (Đồng bộ văn bản Ticker)
   - `src/client/ui/event_card_punchy_summaries.ts#L14` (Đồng bộ tóm tắt ngắn)
   - `src/client/ui/modals/event_card_visuals.ts#L26` (Đồng bộ Hero stat badge)
   - *Phân định phạm vi*: Toàn bộ 4 tệp trên được hoãn sang:  
     👉 **`[DEFERRED TO TICKET-IMP-276B: Event Card Modal, Ticker & Visual Badges Sync]`**.

### 0.4 Đăng Ký Nợ Kỹ Thuật (Tech Debt Registration)
* **Tech Debt Item `DEBT-MOBILE-TOUCH-TOOLTIP`**: Thuộc tính HTML `title={upgradeBlockedReason}` trên nút disabled không hiển thị tooltip khi tap trên màn hình cảm ứng điện thoại. Kế hoạch tương lai sẽ chuẩn hóa hệ thống tooltip/toast chạm cho toàn bộ action footer.

---

## 1. BẢN THIẾT KẾ KIẾN TRÚC & BẤT BIẾN NGHIỆP VỤ (ARCHITECTURAL INVARIANTS)

### 1.1 Mục Tiêu & Cơ Chế Nghiệp Vụ
1. **Triệt tiêu nút sáng ảo (Anti-Ghost Upgrade Rejection)**: Nút chỉ được bật khi đồng thời thỏa mãn: (a) Đúng lượt người chơi (`currentTurnPlayerId === myId`), (b) Đúng pha `PropertyManagement`, (c) Thỏa mãn luật xây dựng đều tay & Monopoly, (d) Số dư tiền mặt $\ge$ chi phí nâng cấp thực tế sau điều chỉnh.
2. **Triệt tiêu phân liệt thị giác (Anti-Visual Split-Brain)**: Cả bảng danh mục cấp nhà `TitleDeedRentTable` và nút bấm `TitleDeedActionFooter` đều nhận chung mảng giá nâng cấp động `upgradeCosts` tính từ `calculateUpgradeCost`.
3. **Tuân thủ quy chế thị giác**: Bắt buộc chụp ảnh thực địa Dual-Viewport (1280x800 và 360x740) trong Phase 3.0 và kiểm duyệt công thái học qua `ui-craft-reviewer` (Pure Logic Waiver = `false`).

### 1.2 Bất Biến Miền (Domain Invariants)
* **Bất biến 1 (Turn & Phase Precedence)**: Không thể nâng cấp ngoài lượt hoặc ngoài pha `PropertyManagement`. Khi vi phạm, affordance phải hiển thị rõ `'Chưa đến lượt của bạn'` hoặc `'Chỉ có thể nâng cấp trong giai đoạn Quản Lý Tài Sản'`.
* **Bất biến 2 (Rule & Solvency Precedence)**: Luật chơi (Monopoly, thế chấp, đều tay) luôn được ưu tiên hiển thị trước số dư tiền mặt. Khi đủ luật nhưng thiếu tiền, hiển thị `'Cần ${effectiveUpgradeCost} Tr. VNĐ để nâng cấp'`.
* **Bất biến 3 (Cross-Component Parity)**: Giá hiển thị trên `TitleDeedRentTable` phải luôn trùng khớp 1:1 với giá hiển thị trên nút bấm `TitleDeedActionFooter`.

---

## 2. NHIỆM VỤ THỰC THI CHI TIẾT (EXACT IMPLEMENTATION TASKS)

### Task 1: Cập Nhật `title_deed_affordance.ts`
* **Target physical file**: `src/client/ui/modals/title_deed_affordance.ts`
* **Mô tả**: Import domain function, tính mảng `dynamicUpgradeCosts`, bổ sung Turn/Phase Guard và Solvency check.

```typescript
<<<<
import { PROPERTY_DEEDS, UTILITY_CELLS } from '../../../domain/property_data.js';
import { BOARD_CONFIG, CellType, type ColorGroup } from '../../../domain/board_config.js';
import type { Player } from '../../../domain/types.js';
====
import { PROPERTY_DEEDS, UTILITY_CELLS } from '../../../domain/property_data.js';
import { BOARD_CONFIG, CellType, type ColorGroup } from '../../../domain/board_config.js';
import type { Player } from '../../../domain/types.js';
import { calculateUpgradeCost, type UpgradeCostModifier } from '../../../domain/property_upgrade.js';
>>>>
```

```typescript
<<<<
  activeModifiers?: readonly { readonly type: string; readonly remainingRounds: number }[];
  turnPhase?: string | null;
  currentTurnPlayerId?: string | null;
}) {
  const ownerId = Object.keys(params.playersInfo).find((id) => (params.playersInfo[id] as AffordancePlayer)?.ownedProperties?.includes(params.cellIndex));
  const owner = ownerId ? (params.playersInfo[ownerId] as AffordancePlayer) : undefined;
  const isOwner = ownerId === params.myId;
  const isMortgaged = Boolean(owner?.mortgagedProperties?.includes(params.cellIndex));
  const deed = PROPERTY_DEEDS.get(params.cellIndex);
  const currentLevel = (params.levelMap?.[params.cellIndex] ?? 0) as 0 | 1 | 2 | 3;
  const upgradeCost = deed?.upgradeCosts && currentLevel < 3 ? deed.upgradeCosts[currentLevel as 0 | 1 | 2] : 0;
====
  activeModifiers?: readonly UpgradeCostModifier[];
  turnPhase?: string | null;
  currentTurnPlayerId?: string | null;
}) {
  const ownerId = Object.keys(params.playersInfo).find((id) => (params.playersInfo[id] as AffordancePlayer)?.ownedProperties?.includes(params.cellIndex));
  const owner = ownerId ? (params.playersInfo[ownerId] as AffordancePlayer) : undefined;
  const isOwner = ownerId === params.myId;
  const isMortgaged = Boolean(owner?.mortgagedProperties?.includes(params.cellIndex));
  const deed = PROPERTY_DEEDS.get(params.cellIndex);
  const currentLevel = (params.levelMap?.[params.cellIndex] ?? 0) as 0 | 1 | 2 | 3;
  const upgradeCost = calculateUpgradeCost(params.cellIndex, currentLevel, params.activeModifiers);
  const dynamicUpgradeCosts = deed?.upgradeCosts
    ? deed.upgradeCosts.map((_, lvl) => calculateUpgradeCost(params.cellIndex, lvl, params.activeModifiers))
    : [];
>>>>
```

```typescript
<<<<
    if (isETC) {
      specialUpgradeBlockedReason = 'Đã kích hoạt Gói Cảng Thông Minh & ETC';
    } else if (ownedRailroads.length < 2) {
      specialUpgradeBlockedReason = 'Cần sở hữu từ 2 ô Hạ Tầng trở lên để nâng cấp ETC';
    } else if ((params.myPlayer?.balance ?? 0) < effectiveUpgradeCost) {
      specialUpgradeBlockedReason = `Cần ${effectiveUpgradeCost} Tr. VNĐ để nâng cấp ETC (${ownedRailroads.length} ga)`;
    }
  }

  const isTradeFrozen = Boolean(params.activeModifiers?.some((m) => m.type === 'MC_FREEZE_TRADE' && m.remainingRounds > 0));
====
    if (isETC) {
      specialUpgradeBlockedReason = 'Đã kích hoạt Gói Cảng Thông Minh & ETC';
    } else if (ownedRailroads.length < 2) {
      specialUpgradeBlockedReason = 'Cần sở hữu từ 2 ô Hạ Tầng trở lên để nâng cấp ETC';
    } else if ((params.myPlayer?.balance ?? 0) < effectiveUpgradeCost) {
      specialUpgradeBlockedReason = `Cần ${effectiveUpgradeCost} Tr. VNĐ để nâng cấp ETC (${ownedRailroads.length} ga)`;
    }
  } else if (isOwner && !isMortgaged && currentLevel < 3) {
    const playerBalance = params.myPlayer?.balance ?? owner?.balance ?? 0;
    if (params.currentTurnPlayerId && params.currentTurnPlayerId !== params.myId) {
      specialUpgradeBlockedReason = 'Chưa đến lượt của bạn';
    } else if (params.turnPhase && params.turnPhase !== 'PropertyManagement') {
      specialUpgradeBlockedReason = 'Chỉ có thể nâng cấp trong giai đoạn Quản Lý Tài Sản';
    } else if (!buildRules.upgradeBlockedReason && playerBalance < effectiveUpgradeCost) {
      specialUpgradeBlockedReason = `Cần ${effectiveUpgradeCost} Tr. VNĐ để nâng cấp`;
    }
  }

  const isTradeFrozen = Boolean(params.activeModifiers?.some((m) => m.type === 'MC_FREEZE_TRADE' && m.remainingRounds > 0));
>>>>
```

```typescript
<<<<
    currentLevel,
    upgradeCost: effectiveUpgradeCost,
    hasUpgrades,
====
    currentLevel,
    upgradeCost: effectiveUpgradeCost,
    upgradeCosts: dynamicUpgradeCosts,
    hasUpgrades,
>>>>
```

### Task 2: Cập Nhật `title_deed_modal.tsx`
* **Target physical file**: `src/client/ui/modals/title_deed_modal.tsx`
* **Mô tả**: Bổ sung `upgradeCosts` vào props và truyền vào `TitleDeedRentTable`.

```typescript
<<<<
  readonly currentLevel?: 0 | 1 | 2 | 3;
  readonly upgradeCost?: number;
  readonly hasMonopoly?: boolean;
====
  readonly currentLevel?: 0 | 1 | 2 | 3;
  readonly upgradeCost?: number;
  readonly upgradeCosts?: readonly number[];
  readonly hasMonopoly?: boolean;
>>>>
```

```typescript
<<<<
  currentLevel,
  upgradeCost,
  hasMonopoly = false,
====
  currentLevel,
  upgradeCost,
  upgradeCosts: propsUpgradeCosts,
  hasMonopoly = false,
>>>>
```

```typescript
<<<<
            <TitleDeedRentTable
              key={cellIndex}
              isRailroad={isRailroad}
              isUtility={isUtility}
              rents={deed.rents}
              upgradeCosts={deed.upgradeCosts}
              hasMonopoly={hasMonopoly}
====
            <TitleDeedRentTable
              key={cellIndex}
              isRailroad={isRailroad}
              isUtility={isUtility}
              rents={deed.rents}
              upgradeCosts={propsUpgradeCosts ?? deed.upgradeCosts}
              hasMonopoly={hasMonopoly}
>>>>
```

### Task 3: Cập Nhật `hosts/deed_modal_host.tsx`
* **Target physical file**: `src/client/ui/modals/hosts/deed_modal_host.tsx`
* **Mô tả**: Chuyển giao `upgradeCosts={deedState.upgradeCosts}` từ affordance vào modal.

```typescript
<<<<
      currentLevel={deedState.currentLevel}
      upgradeCost={deedState.upgradeCost}
      hasMonopoly={deedState.hasMonopoly}
====
      currentLevel={deedState.currentLevel}
      upgradeCost={deedState.upgradeCost}
      upgradeCosts={deedState.upgradeCosts}
      hasMonopoly={deedState.hasMonopoly}
>>>>
```

---

## 3. MA TRẬN KIỂM THỬ TDD STATION 1 (UNIVERSAL 5-FACET CONTRACT MATRIX)

* **Target physical test file**: `tests/contracts/imp276a_title_deed_affordance.test.ts`
* **Quy chuẩn**: Tối thiểu 12 atomic contract tests, 1-4 asserts/test, zero loops in `it()`.

### Danh Sách Test Scenarios (Flow Taxonomy):
1. `[TC-276A.01][UC-IMP276A/MSS]`: Given ô 19 C0 có `MC_RATE_HIKE` (remainingRounds = 2), When gọi `resolveTitleDeedModalState`, Then trả về `upgradeCost = 1200` và `upgradeCosts = [1200, 1800, 2400]`.
2. `[TC-276A.02][UC-IMP276A/MSS]`: Given ô 19 C0 khi `activeModifiers` là undefined hoặc mảng rỗng `[]`, When gọi `resolveTitleDeedModalState`, Then trả về `upgradeCost = 1000` và `upgradeCosts = [1000, 1500, 2000]`.
3. `[TC-276A.03][UC-IMP276A/MSS]`: Given ô 19 C0 người chơi sở hữu trọn bộ màu nhưng `currentTurnPlayerId !== myId`, When gọi `resolveTitleDeedModalState`, Then trả về `upgradeBlockedReason = 'Chưa đến lượt của bạn'`.
4. `[TC-276A.04][UC-IMP276A/MSS]`: Given ô 19 C0 đúng lượt chơi nhưng `turnPhase === 'WaitingRoll'`, When gọi `resolveTitleDeedModalState`, Then trả về `upgradeBlockedReason = 'Chỉ có thể nâng cấp trong giai đoạn Quản Lý Tài Sản'`.
5. `[TC-276A.05][UC-IMP276A/MSS]`: Given ô 19 C0 đúng lượt chơi, đúng pha `PropertyManagement` nhưng `balance = 1100 < 1200`, When gọi `resolveTitleDeedModalState`, Then trả về `upgradeBlockedReason = 'Cần 1200 Tr. VNĐ để nâng cấp'`.
6. `[TC-276A.06][UC-IMP276A/MSS]`: Given ô 19 C0 đúng lượt chơi, đúng pha `PropertyManagement` và `balance = 1200 >= 1200`, When gọi `resolveTitleDeedModalState`, Then trả về `upgradeBlockedReason = undefined`.
7. `[TC-276A.07][UC-IMP276A/A1]`: Given ô 19 C0 người chơi chưa sở hữu đủ nhóm màu cam (thiếu ô 16), When gọi `resolveTitleDeedModalState`, Then `upgradeBlockedReason` ưu tiên giữ nguyên `'Cần sở hữu trọn bộ màu trước khi nâng cấp'` dù balance = 0.
8. `[TC-276A.08][UC-IMP276A/A2]`: Given ô 19 C0 đủ bộ màu nhưng ô 18 bị thế chấp, When gọi `resolveTitleDeedModalState`, Then `upgradeBlockedReason` ưu tiên giữ nguyên `'Không thể nâng cấp khi nhóm có ô thế chấp'`.
9. `[TC-276A.09][UC-IMP276A/MSS]`: Given ô 19 đã đạt Cấp 3 tối đa, When gọi `resolveTitleDeedModalState`, Then trả về `upgradeCost = 0` và `upgradeBlockedReason = 'Đã đạt cấp độ tối đa'`.
10. `[TC-276A.10][UC-IMP276A/MSS]`: Given ô Utility (ô 12) và Railroad (ô 5), When gọi `resolveTitleDeedModalState`, Then bảo toàn nguyên vẹn chi phí và lý do chặn đặc quyền của Utility và Railroad.
11. `[TC-276A.11][UC-IMP276A/MSS]`: Given ô 19 C0 dưới `MC_RATE_HIKE`, When render `TitleDeedModal` với `upgradeCosts = deedState.upgradeCosts`, Then `TitleDeedRentTable` hiển thị `Nâng cấp: +1.200` và `TitleDeedActionFooter` hiển thị `(+1.200)` (đồng bộ 100%, triệt tiêu Visual Split-Brain).
12. `[TC-276A.12][UC-IMP276A/MSS]`: Given ô 19 C0 dưới `MC_RATE_HIKE` và `balance = 1100`, When render `TitleDeedActionFooter` với `deedState`, Then nút nâng cấp hiển thị `(+1.200)` và thuộc tính `disabled = true` kèm `title = 'Cần 1200 Tr. VNĐ để nâng cấp'`.
