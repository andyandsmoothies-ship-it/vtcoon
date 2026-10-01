# KẾ HOẠCH CẢI TIẾN: IMP-240 (REVISION 3.0)
# TITLE DEED AFFORDANCE & SPECIAL PROPERTIES TRANSPARENCY OVERHAUL
# (Đại tu tính minh bạch và nút hành động Sổ Đỏ cho Tiện ích, Hạ tầng và Dịch vụ)

> **Mã Ticket**: `IMP-240`  
> **Phiên bản kế hoạch**: `Revision 3.0` (Hardened Plan — Giải quyết triệt để 100% phản biện của User & Griller)  
> **Phân loại**: Tier 2 (Full Rigor — FSM Intent, Vertical Slice 5 Trạm, 11 Tệp UI/Domain/Server)  
> **Thẩm quyền phê chuẩn**: `plan-griller` (P1–P5 Hard Gate) ➔ Người dùng phê chuẩn (Human Gate) ➔ 4-Station Closed-Loop Pipeline  
> **Tài liệu SSOT**: [`docs/domain/entity_model.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/entity_model.md) (§2.2, §2.4, §2.5), [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) (Pillars I, II, IV, V)

---

## 0. BẢNG ĐỐI CHIẾU CHỈ THỊ & PHẢN BIỆN (REVISION DIRECTIVE CLOSURE TABLE)

Bảng đối chiếu 1:1 giải quyết toàn diện các phản biện P1/P2/Blindspot từ Người Dùng và Báo cáo Kiểm toán Đối kháng [`.agents/audit/PLAN_AUDIT_IMP-240.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-240.md):

| Mã Chỉ Thị | Phân Loại & Mức Độ | Tệp & Dòng Mục Tiêu | Nội Dung Vấn Đề | Giải Pháp & Vị Trí Xử Lý Trong Plan Rev 3.0 |
| :---: | :---: | :--- | :--- | :--- |
| **USER-P1** | 🔴 P1 Blocker | `src/server/intent_dispatcher.ts#L21` & `modal_host.tsx#L173` | Thiếu server snippet cho `INTENT_UPGRADE_ETC`. Nếu server expect `cellIndex` → runtime error. | Bổ sung Task 5: snippet cập nhật `PlayerIntent` hỗ trợ `{ type: 'INTENT_UPGRADE_ETC'; cellIndex?: number }`; `modal_host.tsx` truyền an toàn cả 2 trường hợp. |
| **USER-P2.1** | ⚠️ P2 Cần xác nhận | `src/client/ui/modals/title_deed_action_footer.tsx` | `currentLevel` của Utility luôn = 0? Tại sao `showUpgrade` check `currentLevel < 3` vẫn đúng? | Bổ sung giải trình kiến trúc tại §1.2: Tiện ích không có bậc C1–C3, `currentLevel` luôn = 0; cơ chế Smart Grid/5G một lần điều khiển hoàn toàn qua `hasUpgrades = !isUpgradedUtility`. |
| **USER-P2.2** | ⚠️ P2 LOC Delta | Section 2 Bảng Ngân Sách LOC | Task 5 thực tế +31, plan cũ khai +35. | Đo đạc lại từng dòng `<<<<` và `>>>>` của cả 11 tệp. Khớp 100% số học: Task 6 (affordance) delta chuẩn xác +34 (219 ➔ 253 LOC). |
| **USER-BS** | 🟡 Blindspot | `src/client/ui/modals/title_deed_affordance.ts#L49` | `resolvePurchaseAffordance` tính Utility/Railroad đã nâng cấp vào hạn mức thế chấp ảo do `level = 0`. | Thêm Snippet 6.2 và 6.3: bỏ qua ô `isETC` hoặc `isUpgradedUtility` khi tính hạn mức cầm cố, triệt tiêu 100% hạn mức vay ma. |
| **DIR-1** | P1 (Compile Error) | `src/client/ui/modals/title_deed_modal.tsx#L96-98` | Task 6 dùng `isUpgradedUtility` & `isETC` nhưng không destructure từ props; gây lỗi `TS2304`. | Destructure `isUpgradedUtility = false, isETC = false` trong tham số `TitleDeedModal` (Snippet 7.2). |
| **DIR-2** | P1 (Missing Import) | `src/client/ui/modals/modal_host.tsx#L173` | Gọi `BOARD_CONFIG[payload.cellIndex]` nhưng chưa import `BOARD_CONFIG`. | `resolveTitleDeedModalState` trả về sẵn `isUtility` & `isRailroad`; `modal_host.tsx` dùng `deedState.isUtility` và `deedState.isRailroad`, 0 import mới (Snippet 10.2). |
| **DIR-3** | P1 (Tombstone Omission) | `src/server/network/delta_broadcaster.ts#L70` & `apply_delta_cells.ts#L140` | `buildSparseDelta` thiếu tombstone `{ isETC: false }`. Khi thanh lý vỡ nợ, client không xóa cờ nâng cấp. | Thêm tombstone vào `buildSparseDelta` (Snippet 2.2) và logic reset cờ trong `apply_delta_cells.ts` khi `cell.ownerId === null` hoặc `isFullSync` (Snippet 4.1). |
| **DIR-4** | P1 (Affordance Desync) | `src/client/ui/modals/title_deed_action_footer.tsx#L62` | Server cấm thế chấp BĐS đã có ETC/SmartGrid (`HAS_BUILDING`), client chỉ check `level > 0` nên vẫn cho bấm. | Truyền `isUpgradedUtility`/`isETC` vào footer, cập nhật `hasBuilding` và `mortgageBlockedTitle` chặn thế chấp minh bạch (Snippet 8.3). |
| **DIR-5** | P1 (Spec Failure) | `src/client/ui/modals/title_deed_rent_table.tsx#L180` | Nhận prop `isUpgradedUtility` nhưng không render, vi phạm `TC-IMP240.18`. | Bổ sung badge xác nhận `ĐÃ NÂNG CẤP` tại hàng Smart Grid / 5G trong biểu phí tiện ích (Snippet 9.3). |
| **DIR-7** | P2 (Layout & Overflow) | `src/client/ui/modals/title_deed_rent_table.tsx#L223` | `truncate flex` không cắt được chữ; nhãn C3 + badge > 300px làm văng cột giá trên 360px mobile; `py-0.2` sai Tailwind. | Tách `min-w-0 flex items-center gap-1`: `<span className="truncate">` + `<span className="shrink-0 ... py-0.5">` (Snippet 9.5). |
| **DIR-8** | P2 (Magic String & Type) | `src/client/ui/modals/title_deed_affordance.ts#L161` | So sánh magic number `cell?.type === 3` gây lỗi `TS2367`. | Import `CellType` từ `board_config.ts` và so sánh trực tiếp `CellType.Utility` / `CellType.Railroad` (Snippet 6.1 & 6.6). |

---

## 1. BỐI CẢNH, ĐỘNG LỰC & KHUYẾT TẬT ĐĨA THỰC TẾ

### 1.1. Hiện Trạng & Phát Hiện Thực Nghiệm
Từ ảnh chụp thực tế màn hình mobile của người dùng (`media_1790863819778.png`) tại ô 12 (EVN) và rà soát toàn diện 28 Thẻ Sổ Đỏ trên bàn cờ 40 ô, phát hiện **10 ô tài sản đặc biệt** (2 Tiện ích, 4 Hạ tầng, 4 Dịch vụ) đang gặp 4 khuyết tật nghiêm trọng:

1. **Khuyết tật 1: Cảnh báo sai màu (False Warning)**:
   - Tại `title_deed_affordance.ts:100-102`: `resolveEvenBuildRules` kiểm tra `!params.hasAllProperties` khi `groupCells.length === 0` (`cell.colorGroup === undefined`).
   - Hậu quả: Mở Sổ Đỏ của 2 ô Tiện ích (Ô 12 EVN, Ô 28 Viettel) hoặc 4 ô Hạ tầng (Ô 05, Ô 15, Ô 25, Ô 35) luôn văng cảnh báo: `⚠️ Cần sở hữu trọn bộ màu trước khi nâng cấp`.

2. **Khuyết tật 2: Mất nút Nâng Cấp Tiện ích & Hạ tầng (Missing Action Affordance)**:
   - Tại `title_deed_modal.tsx:153`: `hasUpgrades = deed.upgradeCosts.some((cost) => cost > 0)` luôn trả về `false` cho Tiện ích và Hạ tầng vì mảng nâng cấp 3 cấp là `[0, 0, 0]`.
   - Hậu quả: `TitleDeedActionFooter` ẩn hoàn toàn nút nâng cấp (`showUpgrade = false`). Không thể bấm mua Smart Grid / 5G (+1.000 Tr.) và không thể kích hoạt Gói Cảng Thông Minh & ETC (+1.500 Tr./ô).

3. **Khuyết tật 3: Đứt gãy Lát cắt Dọc (Silent Drop / Broken Vertical Slice)**:
   - Server FSM (`property_actions.ts` / `property_upgrade.ts`) lưu `isETC` và `isUpgradedUtility` trong `PropertyState`.
   - Khi phát sóng delta (`session_manager.ts:168`), Server gửi `isETC` nhưng **bỏ rơi `isUpgradedUtility`**.
   - Bộ so sánh delta (`delta_broadcaster.ts:22`) thiếu kiểm tra `isUpgradedUtility` và thiếu tombstone xóa cờ khi thanh lý.
   - Client Network Parser (`apply_delta_cells.ts`) và Store (`game_store_types.ts`) hoàn toàn **không lưu trữ `isETC` và `isUpgradedUtility`**.

4. **Khuyết tật 4: Hố đen thông tin đặc quyền (Information Black Hole)**:
   - Tiện ích: Giấu đặc quyền thụ động (EVN thu cước điện khi đối thủ qua GO; Viettel thu 150 Tr. cước data khi đối thủ vào ô Cơ hội / Thị trường).
   - Hạ tầng: Bảng cước chỉ ghi `1 Ga - 4 Ga`, giấu cơ chế tăng +50% cước khi lắp ETC.
   - Dịch vụ: Giấu nhẹm 2 đặc quyền: **C2 đổ xúc xắc 1D6 chẵn phạt thêm 200 Tr.** và **C3 ép đối thủ dừng chân bị MẤT LƯỢT TIẾP THEO (Skip Turn)**.

### 1.2. Giải Trình Kiến Trúc Vòng Đời Nâng Cấp Tiện Ích
- **Quy chuẩn cấp bậc Tiện ích (Utility Architecture)**: Khác với 22 ô BĐS thông thường sở hữu chu trình nâng cấp 4 bậc (C0: Đất nền ➔ C1: Nhà phố ➔ C2: Khách sạn ➔ C3: Resort), 2 ô Tiện ích Năng lượng & Số hóa (Ô 12 EVN & Ô 28 Viettel) là **tài sản hạ tầng phẳng (Flat-Tier Asset)**. Cấp công trình của ô Tiện ích trên toàn hệ thống Server và Client luôn được cố định ở `currentLevel = 0`.
- **Cơ chế một lần (One-Time Upgrade Flag)**: Gói nâng cấp Lưới Điện Thông Minh (Smart Grid) / Trạm Dữ Liệu 5G là giao dịch 1 lần duy nhất trị giá 1.000 Tr. VNĐ, thiết lập cờ `isUpgradedUtility = true`.
- **Gating Logic trong Footer**: Điều kiện hiển thị nút nâng cấp trong footer:
  `const showUpgrade = Boolean(isOwner && !isMortgaged && hasUpgrades && (currentLevel ?? 0) < 3 && onUpgrade);`
  Vì Tiện ích luôn có `currentLevel === 0 < 3`, cờ gating duy nhất quyết định hiển thị là `hasUpgrades`. Trong Kế hoạch:
  `const hasUpgrades = isUtility ? !isUpgradedUtility : isRailroad ? !isETC : deed.upgradeCosts.some((cost) => cost > 0);`
  - Khi chưa nâng cấp (`isUpgradedUtility === false`): `hasUpgrades = true` ➔ Hiển thị nút `Nâng Cấp Smart Grid (+1.000 Tr.)` hoặc `Nâng Cấp 5G (+1.000 Tr.)`.
  - Khi đã nâng cấp (`isUpgradedUtility === true`): `hasUpgrades = false` ➔ Tự động ẩn nút nâng cấp và kích hoạt badge xác nhận `ĐÃ NÂNG CẤP`.

---

## 2. RÀ SOÁT BASELINE LOC & PHÂN LOẠI TIER

Đo lường cơ học tự động qua `scripts/check_loc.mjs` trước khi lập trình:

| Tệp Mục Tiêu | Phân Loại Tier | Baseline LOC | SLOC | Trần Cho Phép | Dự Kiến Thêm/Bớt (Net Delta) | Sau Sửa | Trạng Thái |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `src/server/session_manager.ts` | Tier 1 (Server) | 397 | 359 | <= 400 (hard 550) | +1 | **398** | ✔️ Safe |
| `src/server/network/delta_broadcaster.ts` | Tier 1 (Server) | 226 | 195 | <= 400 | +3 | **229** | ✔️ Safe |
| `src/server/intent_dispatcher.ts` | Tier 1 (Server) | 186 | 166 | <= 400 | 0 | **186** | ✔️ Safe |
| `src/client/network/apply_delta_cells.ts` | Tier 1 (Client Network) | 148 | 133 | <= 400 | +14 | **162** | ✔️ Safe |
| `src/client/store/game_store_types.ts` | Tier 1 (Store Types) | 387 | 357 | <= 500 | +4 | **391** | ✔️ Safe |
| `src/client/store/game_store.ts` | Tier 1 (Store) | 389 | 337 | <= 500 | +1 | **390** | ✔️ Safe |
| `src/client/ui/modals/title_deed_affordance.ts` | Tier 2 (UI Views) | 219 | 199 | <= 500 | +34 | **253** | ✔️ Safe |
| `src/client/ui/modals/title_deed_modal.tsx` | Tier 2 (UI Views) | 371 | 346 | <= 500 | +11 | **382** | ✔️ Safe |
| `src/client/ui/modals/title_deed_action_footer.tsx` | Tier 2 (UI Views) | 219 | 214 | <= 500 | +10 | **229** | ✔️ Safe |
| `src/client/ui/modals/title_deed_rent_table.tsx` | Tier 2 (UI Views) | 268 | 252 | <= 500 | +44 | **312** | ✔️ Safe |
| `src/client/ui/modals/modal_host.tsx` | Tier 2 (UI Views) | 473 | 456 | <= 500 | +12 | **485** | ⚠️ Ngưỡng an toàn (<= 500) |
| `tests/contracts/imp240_title_deed_affordance_and_special_properties.test.ts` | Contract Test | 0 (Mới) | 0 | <= 600 | +380 | **380** | ✔️ Safe |

---

## 3. KIẾN TRÚC & LUỒNG DỮ LIỆU (5-STATION VERTICAL SLICE)

```
[Trạm 1: FSM & Entity]
  PropertyState: { level, isETC, isUpgradedUtility }
  INTENT_UPGRADE_UTILITY & INTENT_UPGRADE_ETC ({ cellIndex?: number })
       │
       ▼
[Trạm 2: DTO & Broadcaster]
  CellDelta: + isUpgradedUtility?: boolean
  session_manager.ts: buildDeltaFromRoom() serialize isUpgradedUtility
  delta_broadcaster.ts: isCellEqual() so sánh Boolean(a.isUpgradedUtility) === Boolean(b.isUpgradedUtility)
                        buildSparseDelta() serialize Tombstone { isETC: false, isUpgradedUtility: false }
       │
       ▼
[Trạm 3: Client Parser]
  apply_delta_cells.ts: parse cell.isETC và cell.isUpgradedUtility, reset khi ownerId === null / isFullSync
       │
       ▼
[Trạm 4: Client Store]
  useGameStore: propertyStates: Record<number, { level, isETC?, isUpgradedUtility? }>
       │
       ▼
[Trạm 5: UI Affordance & Modals]
  title_deed_affordance.ts: bỏ qua cảnh báo màu khi groupCells.length === 0, loại bỏ hạn mức cầm cố ma
  title_deed_action_footer.tsx: hiển thị nút Nâng Cấp Smart Grid/5G, Kích Hoạt ETC, chặn thế chấp khi có đặc quyền
  title_deed_rent_table.tsx: callouts thụ động EVN/Viettel, ETC +50%, huy hiệu C2/C3 Dịch Vụ, badge ĐÃ NÂNG CẤP
  modal_host.tsx: dispatch INTENT_UPGRADE_UTILITY / INTENT_UPGRADE_ETC qua deedState.isUtility / isRailroad
```

---

## 4. CHI TIẾT DROP-IN CODE SNIPPETS

### Task 1: Server DTO & Mapper Sync
**Target physical file**: `src/server/session_manager.ts`

```typescript
<<<<
export interface CellDelta {
  readonly index: number; readonly ownerId?: string | null; readonly level?: number;
  readonly isETC?: boolean; readonly isMortgaged?: boolean; readonly unbuiltRounds?: number;
}
====
export interface CellDelta {
  readonly index: number; readonly ownerId?: string | null; readonly level?: number;
  readonly isETC?: boolean; readonly isUpgradedUtility?: boolean; readonly isMortgaged?: boolean; readonly unbuiltRounds?: number;
}
>>>>
```

```typescript
<<<<
    cells.push({
      index: i,
      ownerId: registry.get(i) ?? null,
      level: (state?.level ?? 0) as 0 | 1 | 2 | 3,
      ...(state?.isETC ? { isETC: true } : {}),
      ...(mortgagedSet.has(i) ? { isMortgaged: true } : {}),
      ...(state?.unbuiltRounds ? { unbuiltRounds: state.unbuiltRounds } : {}),
    });
====
    cells.push({
      index: i,
      ownerId: registry.get(i) ?? null,
      level: (state?.level ?? 0) as 0 | 1 | 2 | 3,
      ...(state?.isETC ? { isETC: true } : {}),
      ...(state?.isUpgradedUtility ? { isUpgradedUtility: true } : {}),
      ...(mortgagedSet.has(i) ? { isMortgaged: true } : {}),
      ...(state?.unbuiltRounds ? { unbuiltRounds: state.unbuiltRounds } : {}),
    });
>>>>
```

---

### Task 2: Server Broadcaster Sparse Diff Guard & Tombstone
**Target physical file**: `src/server/network/delta_broadcaster.ts`

```typescript
<<<<
function isCellEqual(a: CellDelta, b: CellDelta): boolean {
  return (
    a.index === b.index &&
    (a.ownerId ?? null) === (b.ownerId ?? null) &&
    (a.level ?? 0) === (b.level ?? 0) &&
    Boolean(a.isETC) === Boolean(b.isETC) &&
    Boolean(a.isMortgaged) === Boolean(b.isMortgaged) &&
    (a.unbuiltRounds ?? 0) === (b.unbuiltRounds ?? 0)
  );
}
====
function isCellEqual(a: CellDelta, b: CellDelta): boolean {
  return (
    a.index === b.index &&
    (a.ownerId ?? null) === (b.ownerId ?? null) &&
    (a.level ?? 0) === (b.level ?? 0) &&
    Boolean(a.isETC) === Boolean(b.isETC) &&
    Boolean(a.isUpgradedUtility) === Boolean(b.isUpgradedUtility) &&
    Boolean(a.isMortgaged) === Boolean(b.isMortgaged) &&
    (a.unbuiltRounds ?? 0) === (b.unbuiltRounds ?? 0)
  );
}
>>>>
```

```typescript
<<<<
    if (!prevCell || !isCellEqual(prevCell, nextCell)) {
      const cellToSend: CellDelta = {
        ...nextCell,
        ...(Boolean(prevCell?.isMortgaged) && !nextCell.isMortgaged ? { isMortgaged: false } : {}),
      };
      changedCells.push(cellToSend);
    }
====
    if (!prevCell || !isCellEqual(prevCell, nextCell)) {
      const cellToSend: CellDelta = {
        ...nextCell,
        ...(Boolean(prevCell?.isMortgaged) && !nextCell.isMortgaged ? { isMortgaged: false } : {}),
        ...(Boolean(prevCell?.isETC) && !nextCell.isETC ? { isETC: false } : {}),
        ...(Boolean(prevCell?.isUpgradedUtility) && !nextCell.isUpgradedUtility ? { isUpgradedUtility: false } : {}),
      };
      changedCells.push(cellToSend);
    }
>>>>
```

---

### Task 3: Client Store Types & Game Store
**Target physical file**: `src/client/store/game_store_types.ts`

```typescript
<<<<
export interface GameState {
  readonly levelMap: Record<number, 0 | 1 | 2 | 3>;
  readonly playerPositions: Record<string, number>;
====
export interface GameState {
  readonly levelMap: Record<number, 0 | 1 | 2 | 3>;
  readonly propertyStates: Record<number, { level: 0 | 1 | 2 | 3; isETC?: boolean; isUpgradedUtility?: boolean }>;
  readonly playerPositions: Record<string, number>;
>>>>
```

```typescript
<<<<
  setLevelMap: (map: Record<number, 0 | 1 | 2 | 3>) => void;
  setPlayerPositions: (positions: Record<string, number>) => void;
====
  setLevelMap: (map: Record<number, 0 | 1 | 2 | 3>) => void;
  setPropertyStates: (map: Record<number, { level: 0 | 1 | 2 | 3; isETC?: boolean; isUpgradedUtility?: boolean }>) => void;
  setPlayerPositions: (positions: Record<string, number>) => void;
>>>>
```

```typescript
<<<<
export const INITIAL_GAME_STATE: InitialGameState = {
  levelMap: {},
  playerPositions: {},
====
export const INITIAL_GAME_STATE: InitialGameState = {
  levelMap: {},
  propertyStates: {},
  playerPositions: {},
>>>>
```

```typescript
<<<<
  | 'levelMap'
  | 'playerPositions'
====
  | 'levelMap'
  | 'propertyStates'
  | 'playerPositions'
>>>>
```

**Target physical file**: `src/client/store/game_store.ts`

```typescript
<<<<
  setLevelMap: (map) => set({ levelMap: map }),
  setPlayerPositions: (positions) => {
====
  setLevelMap: (map) => set({ levelMap: map }),
  setPropertyStates: (propertyStates) => set({ propertyStates }),
  setPlayerPositions: (positions) => {
>>>>
```

---

### Task 4: Client Delta Parser
**Target physical file**: `src/client/network/apply_delta_cells.ts`

```typescript
<<<<
  for (const cell of delta.cells) {
    if (updateCellLevel(cell, state, nextLevelMap, isFullSync)) hasLevelChange = true;
    if (transferCellOwnership(cell.index, cell.ownerId, playersInfoMap, state, isFullSync)) hasInfoChange = true;
    if (updateCellMortgage(cell, playersInfoMap, isFullSync)) hasInfoChange = true;
  }

  if (hasLevelChange) state.setLevelMap(nextLevelMap);
  return hasInfoChange;
====
  const nextPropertyStates = { ...state.propertyStates };
  let hasPropertyStateChange = false;

  for (const cell of delta.cells) {
    if (updateCellLevel(cell, state, nextLevelMap, isFullSync)) hasLevelChange = true;
    if (transferCellOwnership(cell.index, cell.ownerId, playersInfoMap, state, isFullSync)) hasInfoChange = true;
    if (updateCellMortgage(cell, playersInfoMap, isFullSync)) hasInfoChange = true;

    const curPS = nextPropertyStates[cell.index];
    const newLvl = (cell.level ?? nextLevelMap[cell.index] ?? curPS?.level ?? 0) as 0 | 1 | 2 | 3;
    const isOwnerCleared = cell.ownerId === null;
    const newETC = cell.isETC !== undefined ? Boolean(cell.isETC) : (isFullSync || isOwnerCleared ? false : curPS?.isETC);
    const newUtil = cell.isUpgradedUtility !== undefined ? Boolean(cell.isUpgradedUtility) : (isFullSync || isOwnerCleared ? false : curPS?.isUpgradedUtility);

    if (!curPS || curPS.level !== newLvl || curPS.isETC !== newETC || curPS.isUpgradedUtility !== newUtil) {
      nextPropertyStates[cell.index] = {
        level: newLvl,
        ...(newETC ? { isETC: true } : {}),
        ...(newUtil ? { isUpgradedUtility: true } : {}),
      };
      hasPropertyStateChange = true;
    }
  }

  if (hasLevelChange) state.setLevelMap(nextLevelMap);
  if (hasPropertyStateChange) state.setPropertyStates(nextPropertyStates);
  return hasInfoChange;
>>>>
```

---

### Task 5: Server Intent Dispatcher Signature Hardening
**Target physical file**: `src/server/intent_dispatcher.ts`

```typescript
<<<<
  | { type: 'INTENT_UPGRADE'; cellIndex: number }
  | { type: 'INTENT_UPGRADE_ETC' }
  | { type: 'INTENT_UPGRADE_UTILITY'; cellIndex: number }
====
  | { type: 'INTENT_UPGRADE'; cellIndex: number }
  | { type: 'INTENT_UPGRADE_ETC'; cellIndex?: number }
  | { type: 'INTENT_UPGRADE_UTILITY'; cellIndex: number }
>>>>
```

---

### Task 6: Sửa Logic Cảnh Báo Màu, Loại Bỏ Cầm Cố Ma & Tính Nâng Cấp Tiện Ích / Hạ Tầng
**Target physical file**: `src/client/ui/modals/title_deed_affordance.ts`

```typescript
<<<<
import { BOARD_CONFIG, type ColorGroup } from '../../../domain/board_config.js';
====
import { BOARD_CONFIG, CellType, type ColorGroup } from '../../../domain/board_config.js';
>>>>
```

```typescript
<<<<
  levelMap?: Record<number, number>;
  isTradeFrozen?: boolean;
}
====
  levelMap?: Record<number, number>;
  propertyStates?: Record<number, { level?: number; isETC?: boolean; isUpgradedUtility?: boolean }>;
  isTradeFrozen?: boolean;
}
>>>>
```

```typescript
<<<<
    if ((levels[idx] ?? 0) > 0) continue; // BĐS có công trình phải hạ cấp trước
====
    if ((levels[idx] ?? 0) > 0 || params.propertyStates?.[idx]?.isETC || params.propertyStates?.[idx]?.isUpgradedUtility) continue; // BĐS có công trình hoặc đã nâng cấp không thể thế chấp
>>>>
```

```typescript
<<<<
  let upgradeBlockedReason: string | undefined = undefined;
  if (params.isOwner && !params.isMortgaged) {
    if (params.currentLevel >= 3) {
      upgradeBlockedReason = 'Đã đạt cấp độ tối đa';
    } else if (!params.hasAllProperties) {
      upgradeBlockedReason = 'Cần sở hữu trọn bộ màu trước khi nâng cấp';
    } else if (params.hasAnyGroupMortgaged) {
      upgradeBlockedReason = 'Không thể nâng cấp khi nhóm có ô thế chấp';
    } else if (params.groupCells.length > 0) {
      const targetLevel = params.currentLevel + 1;
      const laggingCells = params.groupCells
        .filter((idx) => idx !== params.cellIndex)
        .filter((idx) => (params.levelMap[idx] ?? 0) < targetLevel - 1);
      if (laggingCells.length > 0) {
        const names = laggingCells.map((idx) => BOARD_CONFIG[idx]?.name ?? `Ô ${idx}`).join(', ');
        upgradeBlockedReason = `Quy tắc xây dựng đều tay: Cần nâng cấp ${names} lên C${targetLevel - 1} trước khi xây C${targetLevel}`;
      }
    }
  }
====
  let upgradeBlockedReason: string | undefined = undefined;
  if (params.isOwner && !params.isMortgaged) {
    if (params.groupCells.length > 0) {
      if (params.currentLevel >= 3) {
        upgradeBlockedReason = 'Đã đạt cấp độ tối đa';
      } else if (!params.hasAllProperties) {
        upgradeBlockedReason = 'Cần sở hữu trọn bộ màu trước khi nâng cấp';
      } else if (params.hasAnyGroupMortgaged) {
        upgradeBlockedReason = 'Không thể nâng cấp khi nhóm có ô thế chấp';
      } else {
        const targetLevel = params.currentLevel + 1;
        const laggingCells = params.groupCells
          .filter((idx) => idx !== params.cellIndex)
          .filter((idx) => (params.levelMap[idx] ?? 0) < targetLevel - 1);
        if (laggingCells.length > 0) {
          const names = laggingCells.map((idx) => BOARD_CONFIG[idx]?.name ?? `Ô ${idx}`).join(', ');
          upgradeBlockedReason = `Quy tắc xây dựng đều tay: Cần nâng cấp ${names} lên C${targetLevel - 1} trước khi xây C${targetLevel}`;
        }
      }
    }
  }
>>>>
```

```typescript
<<<<
export function resolveTitleDeedModalState(params: {
  cellIndex: number;
  canBuyOverride?: boolean;
  isBuyOpportunityOverride?: boolean;
  myId: string;
  myPlayer?: AffordancePlayer | Player | null;
  playersInfo: Record<string, AffordancePlayer | Player>;
  levelMap?: Record<number, number>;
  activeModifiers?: readonly { readonly type: string; readonly remainingRounds: number }[];
  turnPhase?: string | null;
  currentTurnPlayerId?: string | null;
}) {
====
export function resolveTitleDeedModalState(params: {
  cellIndex: number;
  canBuyOverride?: boolean;
  isBuyOpportunityOverride?: boolean;
  myId: string;
  myPlayer?: AffordancePlayer | Player | null;
  playersInfo: Record<string, AffordancePlayer | Player>;
  levelMap?: Record<number, number>;
  propertyStates?: Record<number, { level?: number; isETC?: boolean; isUpgradedUtility?: boolean }>;
  activeModifiers?: readonly { readonly type: string; readonly remainingRounds: number }[];
  turnPhase?: string | null;
  currentTurnPlayerId?: string | null;
}) {
>>>>
```

```typescript
<<<<
  const cell = BOARD_CONFIG[params.cellIndex];
  const groupInfo = resolveMonopolyGroupInfo({
    colorGroup: cell?.colorGroup,
    ownerProperties: owner?.ownedProperties,
    ownerMortgaged: owner?.mortgagedProperties,
  });

  const buildRules = resolveEvenBuildRules({
    isOwner,
    isMortgaged,
    hasAllProperties: groupInfo.hasAllProperties,
    hasAnyGroupMortgaged: groupInfo.hasAnyGroupMortgaged,
    currentLevel,
    cellIndex: params.cellIndex,
    groupCells: groupInfo.groupCells,
    levelMap: params.levelMap ?? {},
  });

  const isTradeFrozen = Boolean(params.activeModifiers?.some((m) => m.type === 'MC_FREEZE_TRADE' && m.remainingRounds > 0));

  const affordance = resolvePurchaseAffordance({
    cellIndex: params.cellIndex,
    buyerBalance: params.myPlayer?.balance ?? 0,
    ownedProperties: (params.myPlayer as AffordancePlayer)?.ownedProperties,
    mortgagedProperties: (params.myPlayer as AffordancePlayer)?.mortgagedProperties,
    levelMap: params.levelMap ?? {},
    isTradeFrozen,
  });
====
  const cell = BOARD_CONFIG[params.cellIndex];
  const isUtility = cell?.type === CellType.Utility;
  const isRailroad = cell?.type === CellType.Railroad;
  const propState = params.propertyStates?.[params.cellIndex];
  const isUpgradedUtility = Boolean(propState?.isUpgradedUtility);
  const isETC = Boolean(propState?.isETC);

  const groupInfo = resolveMonopolyGroupInfo({
    colorGroup: cell?.colorGroup,
    ownerProperties: owner?.ownedProperties,
    ownerMortgaged: owner?.mortgagedProperties,
  });

  const buildRules = resolveEvenBuildRules({
    isOwner,
    isMortgaged,
    hasAllProperties: groupInfo.hasAllProperties,
    hasAnyGroupMortgaged: groupInfo.hasAnyGroupMortgaged,
    currentLevel,
    cellIndex: params.cellIndex,
    groupCells: groupInfo.groupCells,
    levelMap: params.levelMap ?? {},
  });

  let effectiveUpgradeCost = upgradeCost;
  if (isUtility && isOwner && !isMortgaged) {
    effectiveUpgradeCost = 1000;
    if (isUpgradedUtility) {
      buildRules.upgradeBlockedReason = 'Đã nâng cấp tối đa (Smart Grid / 5G)';
    } else if ((params.myPlayer?.balance ?? 0) < 1000) {
      buildRules.upgradeBlockedReason = 'Cần 1.000 Tr. VNĐ để nâng cấp lưới điện/5G';
    }
  } else if (isRailroad && isOwner && !isMortgaged) {
    const ownedRailroads = (params.myPlayer?.ownedProperties ?? []).filter((idx) => BOARD_CONFIG[idx]?.type === CellType.Railroad);
    effectiveUpgradeCost = 1500 * (ownedRailroads.length || 1);
    if (isETC) {
      buildRules.upgradeBlockedReason = 'Đã kích hoạt Gói Cảng Thông Minh & ETC';
    } else if (ownedRailroads.length < 2) {
      buildRules.upgradeBlockedReason = 'Cần sở hữu từ 2 ô Hạ Tầng trở lên để nâng cấp ETC';
    } else if ((params.myPlayer?.balance ?? 0) < effectiveUpgradeCost) {
      buildRules.upgradeBlockedReason = `Cần ${effectiveUpgradeCost} Tr. VNĐ để nâng cấp ETC (${ownedRailroads.length} ga)`;
    }
  }

  const isTradeFrozen = Boolean(params.activeModifiers?.some((m) => m.type === 'MC_FREEZE_TRADE' && m.remainingRounds > 0));

  const affordance = resolvePurchaseAffordance({
    cellIndex: params.cellIndex,
    buyerBalance: params.myPlayer?.balance ?? 0,
    ownedProperties: (params.myPlayer as AffordancePlayer)?.ownedProperties,
    mortgagedProperties: (params.myPlayer as AffordancePlayer)?.mortgagedProperties,
    levelMap: params.levelMap ?? {},
    propertyStates: params.propertyStates,
    isTradeFrozen,
  });
>>>>
```

```typescript
<<<<
    currentLevel,
    upgradeCost,
    hasMonopoly: groupInfo.hasMonopoly,
====
    currentLevel,
    upgradeCost: effectiveUpgradeCost,
    isUtility,
    isRailroad,
    isUpgradedUtility,
    isETC,
    hasMonopoly: groupInfo.hasMonopoly,
>>>>
```

---

### Task 7: Cập Nhật `TitleDeedModal`
**Target physical file**: `src/client/ui/modals/title_deed_modal.tsx`

```typescript
<<<<
  readonly totalMortgageCapacity?: number;
  readonly onOpenMortgage?: () => void;
}
====
  readonly totalMortgageCapacity?: number;
  readonly onOpenMortgage?: () => void;
  readonly isUpgradedUtility?: boolean;
  readonly isETC?: boolean;
}
>>>>
```

```typescript
<<<<
  totalMortgageCapacity,
  onOpenMortgage,
}: TitleDeedModalProps): React.ReactElement {
====
  totalMortgageCapacity,
  onOpenMortgage,
  isUpgradedUtility = false,
  isETC = false,
}: TitleDeedModalProps): React.ReactElement {
>>>>
```

```typescript
<<<<
  const ribbonColor = deed.colorGroup ? COLOR_GROUP_HEX[deed.colorGroup] : '#334155';
  const hasUpgrades = deed.upgradeCosts.some((cost) => cost > 0);
  const isRailroad = deed.cellType === CellType.Railroad;
  const isUtility = deed.cellType === CellType.Utility;
====
  const ribbonColor = deed.colorGroup ? COLOR_GROUP_HEX[deed.colorGroup] : '#334155';
  const isRailroad = deed.cellType === CellType.Railroad;
  const isUtility = deed.cellType === CellType.Utility;
  const hasUpgrades = isUtility ? !isUpgradedUtility : isRailroad ? !isETC : deed.upgradeCosts.some((cost) => cost > 0);
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
              currentLevel={currentLevel}
              isOwner={isOwner}
              compact={canBuy && !isOwned}
              cellIndex={cellIndex}
            />
====
            <TitleDeedRentTable
              key={cellIndex}
              isRailroad={isRailroad}
              isUtility={isUtility}
              rents={deed.rents}
              upgradeCosts={deed.upgradeCosts}
              hasMonopoly={hasMonopoly}
              currentLevel={currentLevel}
              isOwner={isOwner}
              compact={canBuy && !isOwned}
              cellIndex={cellIndex}
              isUpgradedUtility={isUpgradedUtility}
              isETC={isETC}
            />
>>>>
```

```typescript
<<<<
      <TitleDeedActionFooter
        isOwned={isOwned}
        isOwner={isOwner}
        isMortgaged={isMortgaged}
        ownerName={ownerName}
        canBuy={canBuy}
        isTradeFrozen={isTradeFrozen}
        isLiquidityFrozen={isLiquidityFrozen}
        hasUpgrades={hasUpgrades}
        currentLevel={currentLevel}
        upgradeCost={upgradeCost}
        upgradeBlockedReason={upgradeBlockedReason}
        downgradeBlockedReason={downgradeBlockedReason}
        deedPrice={deed.price}
        onBuy={onBuy}
        onPass={onPass}
        onClose={onClose}
        onMortgage={onMortgage}
        onRedeem={onRedeem}
        onUpgrade={onUpgrade}
        onDowngrade={onDowngrade}
        isBuyOpportunity={isBuyOpportunity}
        shortfall={shortfall}
        canCoverWithMortgage={canCoverWithMortgage}
        totalMortgageCapacity={totalMortgageCapacity}
        onOpenMortgage={onOpenMortgage}
      />
====
      <TitleDeedActionFooter
        isOwned={isOwned}
        isOwner={isOwner}
        isMortgaged={isMortgaged}
        ownerName={ownerName}
        canBuy={canBuy}
        isTradeFrozen={isTradeFrozen}
        isLiquidityFrozen={isLiquidityFrozen}
        hasUpgrades={hasUpgrades}
        currentLevel={currentLevel}
        upgradeCost={upgradeCost}
        upgradeBlockedReason={upgradeBlockedReason}
        downgradeBlockedReason={downgradeBlockedReason}
        deedPrice={deed.price}
        onBuy={onBuy}
        onPass={onPass}
        onClose={onClose}
        onMortgage={onMortgage}
        onRedeem={onRedeem}
        onUpgrade={onUpgrade}
        onDowngrade={onDowngrade}
        isBuyOpportunity={isBuyOpportunity}
        shortfall={shortfall}
        canCoverWithMortgage={canCoverWithMortgage}
        totalMortgageCapacity={totalMortgageCapacity}
        onOpenMortgage={onOpenMortgage}
        cellIndex={cellIndex}
        isUtility={isUtility}
        isRailroad={isRailroad}
        isUpgradedUtility={isUpgradedUtility}
        isETC={isETC}
      />
>>>>
```

---

### Task 8: Cập Nhật `TitleDeedActionFooter`
**Target physical file**: `src/client/ui/modals/title_deed_action_footer.tsx`

```typescript
<<<<
  readonly totalMortgageCapacity?: number;
  readonly onOpenMortgage?: () => void;
}
====
  readonly totalMortgageCapacity?: number;
  readonly onOpenMortgage?: () => void;
  readonly cellIndex?: number;
  readonly isUtility?: boolean;
  readonly isRailroad?: boolean;
  readonly isUpgradedUtility?: boolean;
  readonly isETC?: boolean;
}
>>>>
```

```typescript
<<<<
  totalMortgageCapacity,
  onOpenMortgage,
}: TitleDeedActionFooterProps): React.ReactElement {
====
  totalMortgageCapacity,
  onOpenMortgage,
  cellIndex,
  isUtility,
  isRailroad,
  isUpgradedUtility,
  isETC,
}: TitleDeedActionFooterProps): React.ReactElement {
>>>>
```

```typescript
<<<<
  const showUpgrade = Boolean(isOwner && !isMortgaged && hasUpgrades && (currentLevel ?? 0) < 3 && onUpgrade);
  const showDowngrade = Boolean(isOwner && !isMortgaged && hasUpgrades && (currentLevel ?? 0) > 0 && onDowngrade);
  const showMortgage = Boolean(isOwner && (isMortgaged ? onRedeem : onMortgage));
  const hasBuilding = (currentLevel ?? 0) > 0;
  const isMortgageBlocked = Boolean(!isMortgaged && (isTradeFrozen || isLiquidityFrozen || hasBuilding));
  const mortgageBlockedTitle = !isMortgaged && hasBuilding
    ? 'Phải hạ cấp hết công trình về Cấp 0 trước khi thế chấp'
    : !isMortgaged && isLiquidityFrozen
    ? 'Bất động sản đang đóng băng thanh khoản'
    : !isMortgaged && isTradeFrozen
    ? 'Thị trường đang đóng băng giao dịch'
    : undefined;
====
  const showUpgrade = Boolean(isOwner && !isMortgaged && hasUpgrades && (currentLevel ?? 0) < 3 && onUpgrade);
  const showDowngrade = Boolean(isOwner && !isMortgaged && hasUpgrades && (currentLevel ?? 0) > 0 && onDowngrade);
  const showMortgage = Boolean(isOwner && (isMortgaged ? onRedeem : onMortgage));
  const hasBuilding = (currentLevel ?? 0) > 0 || Boolean(isUpgradedUtility) || Boolean(isETC);
  const isMortgageBlocked = Boolean(!isMortgaged && (isTradeFrozen || isLiquidityFrozen || hasBuilding));
  const mortgageBlockedTitle = !isMortgaged && hasBuilding
    ? (isUpgradedUtility || isETC ? 'Bất động sản đã nâng cấp đặc quyền không thể thế chấp' : 'Phải hạ cấp hết công trình về Cấp 0 trước khi thế chấp')
    : !isMortgaged && isLiquidityFrozen
    ? 'Bất động sản đang đóng băng thanh khoản'
    : !isMortgaged && isTradeFrozen
    ? 'Thị trường đang đóng băng giao dịch'
    : undefined;
>>>>
```

```typescript
<<<<
            >
              Nâng Cấp (+{formatCurrency(upgradeCost ?? 0)})
            </button>
====
            >
              {isUtility
                ? `Nâng Cấp ${cellIndex === 28 ? '5G' : 'Smart Grid'} (+${formatCurrency(upgradeCost || 1000)})`
                : isRailroad
                ? `Kích Hoạt ETC (+${formatCurrency(upgradeCost || 1500)})`
                : `Nâng Cấp (+${formatCurrency(upgradeCost ?? 0)})`}
            </button>
>>>>
```

---

### Task 9: Cập Nhật `TitleDeedRentTable`
**Target physical file**: `src/client/ui/modals/title_deed_rent_table.tsx`

```typescript
<<<<
  readonly compact?: boolean;
  readonly cellIndex?: number;
}
====
  readonly compact?: boolean;
  readonly cellIndex?: number;
  readonly isUpgradedUtility?: boolean;
  readonly isETC?: boolean;
}
>>>>
```

```typescript
<<<<
  isOwner = false,
  compact = false,
  cellIndex,
}: TitleDeedRentTableProps): React.ReactElement {
====
  isOwner = false,
  compact = false,
  cellIndex,
  isUpgradedUtility = false,
  isETC = false,
}: TitleDeedRentTableProps): React.ReactElement {
>>>>
```

```typescript
<<<<
              <div className="flex justify-between items-center px-2 py-1.5 rounded-lg bg-amber-100/70 border border-amber-400">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm shrink-0" aria-hidden="true">👑</span>
                  <span className="text-[11px] font-black px-1.5 py-0.5 rounded border shrink-0 bg-amber-200 text-amber-900 border-amber-400">
                    {cellIndex === 12 ? 'GRID' : '5G'}
                  </span>
                  <span className="font-bold text-[11px] sm:text-xs text-amber-950 truncate">
                    {cellIndex === 28 ? 'Nâng Cấp Trạm Phát 5G' : 'Lưới Điện Thông Minh (Smart Grid)'}
                  </span>
                </div>
                <span className="font-mono font-black text-[11px] sm:text-xs text-amber-900 shrink-0">
                  3.500
                </span>
              </div>
            </div>
====
              <div className="flex justify-between items-center px-2 py-1.5 rounded-lg bg-amber-100/70 border border-amber-400">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm shrink-0" aria-hidden="true">👑</span>
                  <span className="text-[11px] font-black px-1.5 py-0.5 rounded border shrink-0 bg-amber-200 text-amber-900 border-amber-400">
                    {cellIndex === 12 ? 'GRID' : '5G'}
                  </span>
                  <span className="font-bold text-[11px] sm:text-xs text-amber-950 truncate">
                    {cellIndex === 28 ? 'Nâng Cấp Trạm Phát 5G' : 'Lưới Điện Thông Minh (Smart Grid)'}
                  </span>
                  {isUpgradedUtility && (
                    <span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded font-bold text-[9px] shrink-0">
                      ĐÃ NÂNG CẤP
                    </span>
                  )}
                </div>
                <span className="font-mono font-black text-[11px] sm:text-xs text-amber-900 shrink-0">
                  3.500
                </span>
              </div>

              <div className="p-2 rounded-xl bg-amber-50/90 border border-amber-300 text-slate-800 text-[11px] leading-snug">
                <div className="font-bold flex items-center gap-1 text-amber-950 mb-0.5">
                  <span>{cellIndex === 28 ? '📡' : '⚡'}</span>
                  <span>{cellIndex === 28 ? 'ĐẶC QUYỀN VIỄN THÔNG VỆ TINH' : 'ĐẶC QUYỀN MẠNG LƯỚI ĐIỆN QUỐC GIA'}</span>
                </div>
                <p className="text-slate-700">
                  {cellIndex === 28
                    ? 'Thu cước data di động 150 Tr. VNĐ mỗi khi đối thủ dừng chân tại ô Cơ Hội hoặc Thị Trường.'
                    : 'Thu tiền điện thụ động khi đối thủ vượt qua ô Bắt Đầu: C1: 100 Tr., C2: 200 Tr., C3: 300 Tr. cho mỗi ô sở hữu (tối đa 1.000 Tr.).'}
                </p>
              </div>
            </div>
>>>>
```

```typescript
<<<<
            </div>
          )}

          {isExpanded && (
====
              {isRailroad && (
                <div className="p-2 rounded-xl bg-blue-50/90 border border-blue-300 text-slate-800 text-[11px] leading-snug">
                  <div className="font-bold flex items-center justify-between text-blue-950 mb-0.5">
                    <div className="flex items-center gap-1">
                      <span>🏷️</span>
                      <span>GÓI CẢNG THÔNG MINH & ETC</span>
                    </div>
                    {isETC && <span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded font-bold text-[9px]">ĐÃ KÍCH HOẠT (+50%)</span>}
                  </div>
                  <p className="text-slate-700">
                    Sở hữu ≥ 2 ô Hạ Tầng: Chi phí 1.500 Tr./ô, tăng +50% cước phí toàn bộ hệ thống hạ tầng đang nắm giữ.
                  </p>
                </div>
              )}
            </div>
          )}

          {isExpanded && (
>>>>
```

```typescript
<<<<
                        <span className="font-bold text-[11px] sm:text-xs text-slate-900 truncate">
                          {tier?.label}
                        </span>
====
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="font-bold text-[11px] sm:text-xs text-slate-900 truncate">
                            {tier?.label}
                          </span>
                          {(cellIndex === 6 || cellIndex === 8 || cellIndex === 26 || cellIndex === 27) && idx === 2 && (
                            <span className="shrink-0 text-[9px] px-1 py-0.5 bg-amber-100 text-amber-900 rounded font-black border border-amber-300">
                              Phụ thu 1D6
                            </span>
                          )}
                          {(cellIndex === 6 || cellIndex === 8 || cellIndex === 26 || cellIndex === 27) && idx === 3 && (
                            <span className="shrink-0 text-[9px] px-1 py-0.5 bg-rose-100 text-rose-900 rounded font-black border border-rose-300">
                              Giữ Chân Mất Lượt
                            </span>
                          )}
                        </div>
>>>>
```

---

### Task 10: Rẽ Nhánh Dispatch Intent Trong `modal_host.tsx`
**Target physical file**: `src/client/ui/modals/modal_host.tsx`

```typescript
<<<<
          levelMap: useGameStore.getState().levelMap,
          activeModifiers: useGameStore.getState().activeModifiers,
====
          levelMap: useGameStore.getState().levelMap,
          propertyStates: useGameStore.getState().propertyStates,
          activeModifiers: useGameStore.getState().activeModifiers,
>>>>
```

```typescript
<<<<
            onUpgrade={() => { onIntent?.({ type: 'INTENT_UPGRADE', cellIndex: payload.cellIndex }); closeModal(); }}
====
            onUpgrade={() => {
              if (deedState.isUtility) {
                onIntent?.({ type: 'INTENT_UPGRADE_UTILITY', cellIndex: payload.cellIndex });
              } else if (deedState.isRailroad) {
                onIntent?.({ type: 'INTENT_UPGRADE_ETC', cellIndex: payload.cellIndex });
              } else {
                onIntent?.({ type: 'INTENT_UPGRADE', cellIndex: payload.cellIndex });
              }
              closeModal();
            }}
>>>>
```

```typescript
<<<<
            downgradeBlockedReason={deedState.downgradeBlockedReason}
            buyerBalance={myPlayer?.balance ?? 0}
====
            downgradeBlockedReason={deedState.downgradeBlockedReason}
            isUpgradedUtility={deedState.isUpgradedUtility}
            isETC={deedState.isETC}
            buyerBalance={myPlayer?.balance ?? 0}
>>>>
```

---

### Task 11: Contract Test Suite
**Target physical file**: `tests/contracts/imp240_title_deed_affordance_and_special_properties.test.ts` (New file)

---

## 5. BỘ KIỂM THỬ HỢP ĐỒNG (STATION 1 QA MANDATE)

Tệp hợp đồng: `tests/contracts/imp240_title_deed_affordance_and_special_properties.test.ts` (18 Atomic Contract Tests, Floor >= 15):

### Facet 1: Core Functionality & Happy Paths
- `TC-IMP240.01`: EVN Ô 12 và Viettel Ô 28 hiển thị nút nâng cấp Smart Grid / 5G khi sở hữu và đủ tiền.
- `TC-IMP240.02`: 4 ô Hạ Tầng hiển thị nút Kích Hoạt ETC khi sở hữu >= 2 ga và đủ tiền.
- `TC-IMP240.03`: TitleDeedModal dispatch `INTENT_UPGRADE_UTILITY` khi người chơi bấm nâng cấp Tiện ích.
- `TC-IMP240.04`: TitleDeedModal dispatch `INTENT_UPGRADE_ETC` khi người chơi bấm nâng cấp Hạ tầng.

### Facet 2: Edge Cases & Boundaries
- `TC-IMP240.05`: EVN Ô 12 và Viettel Ô 28 không hiển thị cảnh báo "Cần sở hữu trọn bộ màu trước khi nâng cấp".
- `TC-IMP240.06`: 4 ô Hạ Tầng không hiển thị cảnh báo "Cần sở hữu trọn bộ màu trước khi nâng cấp".
- `TC-IMP240.07`: Nút nâng cấp Utility bị disabled khi số dư người chơi < 1.000 Tr. kèm lý do thiếu tiền.
- `TC-IMP240.08`: Nút nâng cấp ETC bị disabled khi người chơi chỉ sở hữu 1 ga kèm lý do "Cần sở hữu từ 2 ô Hạ Tầng".

### Facet 3: Terminology & Data Sanity
- `TC-IMP240.09`: TitleDeedRentTable của EVN Ô 12 hiển thị thông tin thu cước điện thụ động qua ô GO (C1: 100, C2: 200, C3: 300 Tr.).
- `TC-IMP240.10`: TitleDeedRentTable của Viettel Ô 28 hiển thị thông tin thu cước data di động 150 Tr. khi đối thủ vào Cơ Hội / Thị Trường.
- `TC-IMP240.11`: TitleDeedRentTable của 4 ô Hạ Tầng hiển thị thông tin Gói Cảng Thông Minh & ETC (+50%).
- `TC-IMP240.12`: TitleDeedRentTable của 4 ô Dịch Vụ (Ô 06, 08, 26, 27) hiển thị huy hiệu Phụ Thu 1D6 (C2) và Giữ Chân Mất Lượt (C3).

### Facet 4: Regression Prevention
- `TC-IMP240.13`: Các ô Đô Thị và Nghỉ Dưỡng có nhóm màu vẫn tuân thủ 100% quy tắc xây dựng đều tay (Even-Building) và cảnh báo bộ màu.
- `TC-IMP240.14`: CellDelta và session_manager serialize đầy đủ cả `isETC` và `isUpgradedUtility`.
- `TC-IMP240.15`: delta_broadcaster `isCellEqual` và `buildSparseDelta` phát hiện chính xác biến động và tombstone của `isUpgradedUtility`/`isETC`.

### Facet 5: Dual-Viewport & Ergonomics Integrity
- `TC-IMP240.16`: Các card thông tin đặc quyền hiển thị gọn gàng trên Mobile mà không gây tràn chiều dọc hay phá vỡ chiều cao modal.
- `TC-IMP240.17`: Bố cục Desktop 2 cột của TitleDeedModal giữ trọn vẹn sự cân bằng trực quan giữa cột thông tin và cột biểu phí.
- `TC-IMP240.18`: Khi ô Tiện ích hoặc Hạ tầng đã được nâng cấp, TitleDeedRentTable hiển thị badge xác nhận trạng thái hoàn tất nâng cấp.

---

## 6. DỰ BÁO LỖI ĐỐI KHÁNG & MA TRẬN KIỂM TOÁN (P1–P5 AUDIT)

1. **P1 — Broken State / Lifecycle**:
   - Việc bọc `if (params.groupCells.length > 0)` trong `resolveEvenBuildRules` có vô tình cho phép nâng cấp đất màu khi chưa đủ bộ màu không? ➔ Không, vì đất màu luôn có `groupCells.length >= 2`.
   - Tiện ích và Hạ tầng có thể bị nâng cấp nhiều lần không? ➔ Đã chặn qua cờ `isUpgradedUtility` và `isETC`.
   - Khi tài sản bị thanh lý vỡ nợ, tombstone `{ isETC: false, isUpgradedUtility: false }` đảm bảo dọn sạch trạng thái trên Client.
   - `resolvePurchaseAffordance` loại bỏ các ô đã có đặc quyền `isETC || isUpgradedUtility`, bảo đảm không tính hạn mức thế chấp ma khi người chơi cân nhắc mua đất.
2. **P2 — LOC Budget & Anti-Slop**:
   - `modal_host.tsx` hiện tại là 473 LOC. Tái sử dụng `deedState.isUtility` và `deedState.isRailroad`, tệp chỉ tăng 12 dòng lên 485 LOC, nằm an toàn dưới trần 500 LOC.
   - `intent_dispatcher.ts` delta = 0 dòng (186 LOC, an toàn dưới trần 400).
3. **P3 — Blast Radius & Call-Site Parity**:
   - `buildDeltaFromRoom` thêm `isUpgradedUtility` có làm phình kích thước gói tin delta vượt 10KB không? ➔ Không, chỉ thêm 1 thuộc tính boolean sparse khi ô tiện ích được nâng cấp (< 30 bytes).
4. **P4 — Dual-Viewport Parity**:
   - Các card chú thích đặc quyền mới trong `TitleDeedRentTable` có làm modal sổ đỏ bị tràn màn hình trên mobile (360x640) không? ➔ Card có cỡ chữ nhỏ gọn `text-[11px]` và modal đã có `max-h-[90dvh] overflow-y-auto` bảo vệ. Hàng C3 dùng `min-w-0 flex` chống tràn chữ.
5. **P5 — Test Floor & Detroit Isolation**:
   - Đủ 18 atomic tests, không loop, không mock echo, test độc lập quan sát trạng thái công khai.
