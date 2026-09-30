# KẾ HOẠCH TRIỂN KHAI (v3 HARDENED): IMP-231 — Mua Lại Dự Án Tiềm Năng: Chọn Ô Đất Mục Tiêu, Xếp Hàng Tuần Tự & Server-Authoritative Clock

> **Mã Ticket**: IMP-231  
> **Phân Loại**: Tier 2 (Full Rigor — Server FSM, Wire Protocol, Domain Logic & Tactile UI)  
> **Trạng Thái Kiểm Toán**: HARDENED_APPROVED (Tích hợp 100% 5 phản biện chuyên sâu: Phản Biện 1 LOC baseline, Phản Biện 2 Hooks rules, Phản Biện 3 Bot Treasury parity, Phản Biện 4 Headless vs Interactive DOM testing, Phản Biện 5 Dynamic Progress Bar)  
> **Mục Tiêu**: Trao trọn quyền tự quyết (Player Agency) cho người chơi khi mở Thẻ cơ hội Mua Lại Dự Án Tiềm Năng (`CC_SWAP_PROJECT`):
> 1. **Xếp hàng tuần tự**: Bảng 1 dừng lại cho người chơi đọc thoải mái; chỉ mở Bảng 2 khi người chơi bấm nút "Tiến Hành Mua Lại 🤝".
> 2. **Đồng hồ Server-Authoritative (Gia hạn 30s)**: Triệt tiêu lỗi Watchdog xóa phiên khi người chơi đọc Bảng 1; quyền hết giờ do Server Watchdog kiểm soát.
> 3. **Affordance Lựa chọn Ô đất**: Nếu đối thủ có nhiều ô C0 hợp lệ, cho phép người chơi xem danh sách và click chọn ô đất muốn mua trước khi xuống tiền. Lọc đất khóa thế chấp trái phiếu và chọn ô vừa túi tiền làm mặc định.

---

## 1. NĂM ĐIỂM SỬA ĐỔI NÂNG CAO ĐÃ ĐƯỢC TÍCH HỢP

1. **Hiệu Chuẩn Baseline LOC `src/domain/compulsory_buyout.ts`**:
   - Khảo sát thực tế: **39 dòng** (SLOC 32). Delta dự kiến: +1 dòng (thêm điều kiện trái phiếu) -> SLOC sau: **40 dòng** (Trần Tier 1 <= 400). Triệt tiêu sai lệch 39% của bản dự thảo cũ.
2. **Khử Anti-Pattern `useGameStore.getState()` Trong Render**:
   - Thay thế biểu thức ternary lồng `getState()` bằng hook reactive trực tiếp: `const playersInfo = useGameStore((state) => state.playersInfo) ?? {};` tuân thủ nghiêm ngặt Rules of Hooks.
3. **Đồng Bộ Tính Nhất Quán Cho Bot & Bảo Toàn Kho Bạc (Treasury Conservation)**:
   - Áp dụng `minCost` cho cả Human và Bot.
   - Nếu `player.balance - minCost < 1000`: Bot nhận trợ cấp an ủi 800 (Kho Bạc trừ 800).
   - Nếu Bot có ô thỏa mãn an toàn (`player.balance - t.cost >= 1000`): Bot chọn ô đất đó và thực hiện chuyển nhượng chuẩn xác, không bị early-abort oan uổng khi ô đầu tiên đắt tiền.
4. **Phân Định Rõ Ràng Môi Trường Test (Headless SSR vs Interactive DOM)**:
   - Các test kiểm thử hiển thị tĩnh (Facet 1, 3, 5): dùng `renderToStaticMarkup`.
   - Các test kiểm thử tương tác hành vi (Backdrop click, chọn ô, bấm mua - `TC-231.07`, `TC-231.10`, `TC-231.13`): BẮT BUỘC mount vào jsdom container với `renderWithEffects` / `act()` / `fireEvent`, không dùng SSR tĩnh để tránh pass giả tạo.
5. **Thanh Tiến Trình Động (Dynamic Progress Bar)**:
   - Thay thế hardcode `15_000` bằng `totalMs`: `const [totalMs] = useState(safeInitialMs);` bắt dính một lần lúc mount.
   - `const progressPercent = totalMs > 0 ? Math.min(100, Math.max(0, (remainingMs / totalMs) * 100)) : 0;` giúp thanh tiến trình giảm đều đặn từ 100% về 0% cho bất kỳ thời lượng nào (15s hay 30s).

---

## 2. KIẾN TRÚC TOÀN PHẦN & TEXT TREE LOGIC

```
[Người Chơi Dừng Chân Ô Cơ Hội (Chance Cell)]
  │
  ▼
[Server: chance_card_handlers.ts]
  ├── Rút thẻ: CC_SWAP_PROJECT
  ├── Quét registry & lọc đất thế chấp trái phiếu ➔ Tạo eligibleTargets: BuyoutTargetOption[]
  ├── Tính minCost = Math.min(...costs).
  ├── [HUMAN PATH]:
  │     ├── Nếu balance < minCost ➔ Trợ cấp +800 (Kho Bạc -800) & dừng
  │     └── Nếu đủ tiền mua >= 1 ô:
  │           ├── defaultTarget = ô vừa túi tiền nhất (player.balance >= cost)
  │           └── room.pendingBuyout = { buyerId, cellIndex, cost, expiresAt (+30s), eligibleTargets }
  └── [BOT PATH]:
        ├── Nếu balance - minCost < 1000 ➔ Trợ cấp +800 (Kho Bạc -800) & dừng
        └── Nếu có ô an toàn: Bot mua ô đó, trừ tiền bot, cộng tiền đối thủ, đổi chủ ô đất
              │ (WebSocket Delta gửi về cho Human)
              ▼
[Client: apply_delta.ts]
  ├── Lưu pendingBuyout vào Zustand store SSOT
  └── KHÔNG cướp modal khi quân cờ đang di chuyển hoặc có thẻ sự kiện
        │ (Hoạt cảnh kết thúc, cờ dừng tại ô đích)
        ▼
[BẢNG 1: EventCardModal (Phiếu Cơ Hội)]
  ├── Hiển thị thẻ: "MUA LẠI DỰ ÁN TIỀM NĂNG - Mua lại dự án đối thủ đền bù 130%"
  ├── Nút CTA chính thức: [Tiến Hành Mua Lại 🤝]
  └── Người chơi đọc thoải mái (không đếm ngược giục giã ở bảng này)
        │ (Người chơi bấm "Tiến Hành Mua Lại 🤝" hoặc đóng thẻ / click backdrop)
        ▼
[Chuyển Tiếp Tuần Tự: modal_host.tsx]
  └── Đóng Bảng 1 ➔ Mở Bảng 2 với payload pendingBuyout
        │
        ▼
[BẢNG 2: CompulsoryBuyoutModal (Quyền Ưu Tiên Mua Lại 130%)]
  ├── Đếm ngược tương đối (totalMs = safeInitialMs, progressPercent mượt mà)
  ├── Bộ Chọn Ô Đất Mục Tiêu:
  │     ├── Nếu đối thủ có >= 2 ô C0: Hiển thị danh sách ô đất dạng lưới
  │     └── Click chọn ô ➔ Tự động cập nhật tên, màu sắc, tên chủ sở hữu & giá 130%
  ├── Hết giờ ở UI: Khóa nút Mua thành "Hết Thời Gian Mua", TUYỆT ĐỐI KHÔNG tự gọi onDecline()
  └── Người chơi quyết định:
        ├── Bấm [💰 Mua Lại (Giá 130%)]: Gửi INTENT_EXECUTE_COMPULSORY_BUYOUT kèm selectedCell
        └── Bấm [✕ Từ Chối Mua]: Gửi INTENT_DECLINE_COMPULSORY_BUYOUT
```

---

## 3. DROP-IN CODE SNIPPETS CỤ THỂ

### Task 1: Lọc Đất Thế Chấp Trái Phiếu Trong `src/domain/compulsory_buyout.ts`
- **Tệp mục tiêu**: [`src/domain/compulsory_buyout.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/compulsory_buyout.ts)
- **Hàm bao quanh**: `isEligibleForCompulsoryBuyout` (dòng 31-38)
- **Baseline LOC**: 39 lines -> sau sửa: 40 lines (Tier 1 <= 400 lines)

```ts
  const owner = room?.players.find((p) => p.id === ownerId) ?? players?.find((p) => p.id === ownerId);
  if (owner?.bankrupt) return false;
  if (owner?.mortgagedProperties?.includes(cellIndex)) return false;
  if (owner?.bondContract?.isActive && owner.bondContract.collateralCells?.includes(cellIndex)) return false;

  if (hasMonopoly(ownerId, cellIndex, registry)) return false;

  return true;
```

---

### Task 2: Mở Rộng Interface Trong `src/domain/room.ts`
- **Tệp mục tiêu**: [`src/domain/room.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts)
- **Vị trí**: dòng 127-136
- **Baseline LOC**: 265 lines -> sau sửa: 273 lines (Tier 1 <= 400 lines)

```ts
export interface BuyoutTargetOption {
  readonly cellIndex: number;
  readonly sellerId: string;
  readonly cost: number;
  readonly basePrice: number;
}

export interface PendingBuyoutSession {
  readonly buyerId: string;
  readonly sellerId: string;
  readonly cellIndex: number;
  readonly cost: number;
  readonly basePrice: number;
  readonly createdAt: number;
  readonly expiresAt: number;
  readonly eligibleTargets?: readonly BuyoutTargetOption[];
}
```

---

### Task 3: Thu Thập Đa Mục Tiêu & Đồng Bộ Cả Human Lẫn Bot Trong `src/domain/chance_card_handlers.ts`
- **Tệp mục tiêu**: [`src/domain/chance_card_handlers.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/chance_card_handlers.ts)
- **Hàm bao quanh**: `handleSwapProject` (dòng 149-187)
- **Baseline LOC**: 361 lines -> sau sửa: 375 lines (Tier 1 <= 400 lines)

```ts
  const eligibleTargets: BuyoutTargetOption[] = oppC0Cells.map((opp) => {
    const basePrice = PROPERTY_DEEDS.get(opp.cell)?.price ?? 1000;
    const cost = calculateCompulsoryBuyoutCost(opp.cell);
    return {
      cellIndex: opp.cell,
      sellerId: opp.owner,
      cost,
      basePrice,
    };
  });

  const minCost = Math.min(...eligibleTargets.map((t) => t.cost));
  const defaultTarget = eligibleTargets.find((t) => player.balance >= t.cost) ?? eligibleTargets[0]!;

  if (!player.isBot) {
    if (player.balance < minCost) {
      player.balance += 800;
      if (room) room.treasury = Math.max(0, (room.treasury ?? 0) - 800);
      return;
    }
    if (!room) {
      player.balance -= defaultTarget.cost;
      const seller = players?.find((p) => p.id === defaultTarget.sellerId);
      if (seller) seller.balance += defaultTarget.cost;
      registry.set(defaultTarget.cellIndex, player.id);
      return;
    }
    room.pendingBuyout = {
      buyerId: player.id,
      sellerId: defaultTarget.sellerId,
      cellIndex: defaultTarget.cellIndex,
      cost: defaultTarget.cost,
      basePrice: defaultTarget.basePrice,
      createdAt: Date.now(),
      expiresAt: Date.now() + 30_000,
      eligibleTargets,
    };
    return;
  }

  // Bot path: Ưu tiên ô an toàn (balance - cost >= 1000)
  const botTarget = eligibleTargets.find((t) => player.balance - t.cost >= 1000);
  if (!botTarget) {
    player.balance += 800;
    if (room) room.treasury = Math.max(0, (room.treasury ?? 0) - 800);
    return;
  }
  player.balance -= botTarget.cost;
  const seller = room?.players.find((p) => p.id === botTarget.sellerId) ?? players?.find((p) => p.id === botTarget.sellerId);
  if (seller) seller.balance += botTarget.cost;
  registry.set(botTarget.cellIndex, player.id);
  if (room) room.pendingBuyout = null;
```

---

### Task 4: Xác Thực Ô Đất Được Chọn Trong `src/server/room_property_coordinator.ts`
- **Tệp mục tiêu**: [`src/server/room_property_coordinator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_property_coordinator.ts)
- **Hàm bao quanh**: `coordExecuteCompulsoryBuyout` (dòng 304-329)
- **Baseline LOC**: 344 lines -> sau sửa: 354 lines (Tier 1 <= 400 lines)

```ts
export function coordExecuteCompulsoryBuyout(
  ctx: RoomContext | undefined,
  playerId: string,
  cellIndex: number,
): { success: boolean; reason?: string } {
  if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
  const session = ctx.room.pendingBuyout;
  if (!session) return { success: false, reason: 'NO_PENDING_BUYOUT' };
  if (session.buyerId !== playerId) {
    return { success: false, reason: 'INVALID_BUYOUT_SESSION' };
  }

  // [IMP-231] Hỗ trợ ô đất được người chơi lựa chọn từ danh sách eligibleTargets
  const matchedTarget = session.eligibleTargets?.find((t) => t.cellIndex === cellIndex) ??
    (session.cellIndex === cellIndex ? { cellIndex: session.cellIndex, sellerId: session.sellerId, cost: session.cost } : undefined);
  if (!matchedTarget) {
    return { success: false, reason: 'INVALID_BUYOUT_SESSION' };
  }

  const targetSellerId = matchedTarget.sellerId;
  const targetCost = matchedTarget.cost;

  const buyer = ctx.room.players.find((p) => p.id === session.buyerId);
  const seller = ctx.room.players.find((p) => p.id === targetSellerId);
  if (!buyer || !seller) return { success: false, reason: 'PLAYER_NOT_FOUND' };
  if (seller.bondContract?.isActive && seller.bondContract.collateralCells.includes(cellIndex)) {
    return { success: false, reason: ActionRejectReason.BOND_COLLATERAL_LOCKED };
  }
  if (buyer.balance < targetCost) return { success: false, reason: 'INSUFFICIENT_FUNDS' };

  buyer.balance -= targetCost;
  seller.balance += targetCost;
  ctx.reg.set(cellIndex, buyer.id);
  ctx.room.pendingBuyout = null;
  ctx.room.phase = TurnPhase.PropertyManagement;
  return { success: true };
}
```

---

### Task 5: Bộ Chọn Ô Đất Động & Sửa Hooks Trong `src/client/ui/modals/compulsory_buyout_modal.tsx`
- **Tệp mục tiêu**: [`src/client/ui/modals/compulsory_buyout_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/compulsory_buyout_modal.tsx)
- **Baseline LOC**: 200 lines -> sau sửa: ~245 lines (Tier 2 <= 500 lines)

```tsx
import React, { useEffect, useState } from 'react';
import { BOARD_CONFIG } from '../../../domain/board_config.js';
import { COLOR_GROUP_HEX } from '../../../domain/theme.js';
import { formatCurrency } from '../ui_helpers.js';
import { useGameStore } from '../../store/game_store.js';
import type { BuyoutTargetOption } from '../../../domain/room.js';

export interface CompulsoryBuyoutModalProps {
  readonly buyerId: string;
  readonly sellerId: string;
  readonly cellIndex: number;
  readonly cost: number;
  readonly basePrice: number;
  readonly expiresAt: number;
  readonly eligibleTargets?: readonly BuyoutTargetOption[];
  readonly onBuyout: (cellIndex: number) => void;
  readonly onDecline: () => void;
  readonly onClose?: () => void;
}

export function CompulsoryBuyoutModal({
  buyerId,
  sellerId,
  cellIndex,
  cost,
  basePrice,
  expiresAt,
  eligibleTargets,
  onBuyout,
  onDecline,
}: CompulsoryBuyoutModalProps): React.ReactElement {
  const [selectedCell, setSelectedCell] = useState(cellIndex);
  // Khắc phục Phản Biện 2: Hook reactive trực tiếp, tuân thủ Rules of Hooks
  const playersInfo = useGameStore((state) => state.playersInfo) ?? {};
  const buyer = playersInfo[buyerId];

  // Khắc phục Phản Biện 1 & 2.2: Quy tụ toàn bộ thông tin về ô đất đang chọn
  const currentTarget = eligibleTargets?.find((t) => t.cellIndex === selectedCell) ?? {
    cellIndex,
    sellerId,
    cost,
    basePrice,
  };

  const seller = playersInfo[currentTarget.sellerId];
  const sellerName = seller?.name ?? 'Đối thủ';

  const cell = BOARD_CONFIG[currentTarget.cellIndex];
  const propertyName = cell?.name ?? `Ô Đất #${currentTarget.cellIndex}`;
  const cellColor = cell?.colorGroup ? COLOR_GROUP_HEX[cell.colorGroup] : '#3b82f6';

  // Khắc phục Phản Biện 5: Dynamic progress bar với totalMs bắt dính lúc mount
  const initialTimeLeft = Math.max(0, expiresAt - Date.now());
  const safeInitialMs = initialTimeLeft > 0 ? initialTimeLeft : 15_000;
  const [totalMs] = useState(safeInitialMs);
  const [remainingMs, setRemainingMs] = useState(safeInitialMs);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingMs((prev) => {
        const next = Math.max(0, prev - 100);
        if (next <= 0) {
          clearInterval(timer);
        }
        return next;
      });
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const secondsLeft = Math.ceil(remainingMs / 1000);
  const progressPercent = totalMs > 0 ? Math.min(100, Math.max(0, (remainingMs / totalMs) * 100)) : 0;
  const isUrgent = secondsLeft <= 5;
  const canAfford = (buyer?.balance ?? 0) >= currentTarget.cost;
```
*(Trong phần JSX, chèn Selector khi `eligibleTargets && eligibleTargets.length > 1`, hiển thị giá gốc `currentTarget.basePrice`, giá 130% `currentTarget.cost`, và nút Mua gọi `onBuyout(selectedCell)`).*

---

### Task 6: Cập Nhật Nhãn CTA Trong `src/client/ui/modals/event_card_visuals.ts`
- **Tệp mục tiêu**: [`src/client/ui/modals/event_card_visuals.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/event_card_visuals.ts)
- **Vị trí**: dòng 125
- Sửa từ: `[ChanceCardId.CC_SWAP_PROJECT]: 'Chốt Mua Dự Án 🤝',`
- Thành: `[ChanceCardId.CC_SWAP_PROJECT]: 'Tiến Hành Mua Lại 🤝',`

---

### Task 7: Truyền Prop Inline Trong `src/client/ui/modals/modal_host.tsx`
- **Tệp mục tiêu**: [`src/client/ui/modals/modal_host.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/modal_host.tsx)
- **Vị trí**: dòng 484
- Ghép inline: `expiresAt={p.expiresAt} eligibleTargets={p.eligibleTargets}` để bảo toàn baseline 494 dòng (delta = 0).

---

## 4. UNIVERSAL 5-FACET BEHAVIORAL TEST MATRIX (STATION 1)

Viết file test hợp đồng mới: `tests/client/imp231_compulsory_buyout_property_selection.test.ts` gồm đúng 16 atomic tests tuân thủ Detroit Style (phân định rõ ràng Headless SSR vs Interactive DOM mount):

- **Facet 1: Thu Thập & Đa Mục Tiêu Phía Server (Domain & Multi-Target Gathering)** (4 tests):
  - `[TC-231.01/MSS][UC-IMP231][Facet-1/GatherAllEligibleC0Targets]`: `handleSwapProject` thu thập đầy đủ toàn bộ các ô C0 đủ điều kiện vào mảng `eligibleTargets` (ví dụ đối thủ có 3 ô -> `eligibleTargets.length === 3`).
  - `[TC-231.02/MSS][UC-IMP231][Facet-1/DefaultTargetIsAffordable]`: `defaultTarget` ưu tiên ô vừa túi tiền của người chơi thay vì mù quáng chọn ô đắt đầu tiên.
  - `[TC-231.03/MSS][UC-IMP231][Facet-1/CoordExecutesSelectedCell]`: `coordExecuteCompulsoryBuyout` thực thi thành công việc chuyển nhượng cho ô thứ 2 hoặc thứ 3 trong `eligibleTargets`.
  - `[TC-231.04/MSS][UC-IMP231][Facet-1/CoordRejectsUnlistedCell]`: `coordExecuteCompulsoryBuyout` từ chối với `INVALID_BUYOUT_SESSION` nếu gửi lên `cellIndex` không nằm trong `eligibleTargets`.

- **Facet 2: Trải Nghiệm Xếp Hàng Tuần Tự & Nhãn CTA (Sequential Handover & CTA)** (3 tests):
  - `[TC-231.05/MSS][UC-IMP231][Facet-2/CtaButtonTextIsTienHanhMuaLai]`: Thẻ `CC_SWAP_PROJECT` hiển thị chính thức nhãn nút CTA `"Tiến Hành Mua Lại 🤝"`.
  - `[TC-231.06/MSS][UC-IMP231][Facet-2/EventModalHoldsUntilPlayerClicks]`: Bảng 1 giữ nguyên không bị đếm ngược giục giã và chỉ chuyển sang Bảng 2 khi người chơi bấm nút.
  - `[TC-231.07/MSS][UC-IMP231][Facet-2/BackdropCloseAlsoTransitions]`: (Interactive test) Bấm backdrop trên Bảng 1 trong `ModalHost` chuyển tiếp an toàn sang Bảng 2, chống deadlock kẹt lượt.

- **Facet 3: Bộ Chọn Ô Đất Trên UI (Interactive Property Selector UI)** (3 tests):
  - `[TC-231.08/MSS][UC-IMP231][Facet-3/SingleTargetHidesSelector]`: Khi `eligibleTargets.length <= 1`, không render khối selector để giữ giao diện gọn gàng.
  - `[TC-231.09/MSS][UC-IMP231][Facet-3/MultiTargetRendersSelector]`: Khi `eligibleTargets.length >= 2`, render khối selector `data-testid="buyout-cell-selector"` với đầy đủ các nút tương ứng.
  - `[TC-231.10/MSS][UC-IMP231][Facet-3/SwitchingCellUpdatesPriceAndSeller]`: (Interactive test) Click chọn ô khác lập tức cập nhật giá 130%, tên ô đất và tên chủ sở hữu tương ứng trong modal.

- **Facet 4: Khả Năng Thanh Toán Theo Từng Ô (Dynamic Solvency Affordance)** (3 tests):
  - `[TC-231.11/MSS][UC-IMP231][Facet-4/AffordanceTogglesPerCell]`: (Interactive test) Nếu người chơi đủ tiền mua ô rẻ nhưng thiếu tiền mua ô đắt, nút Mua tự động chuyển giữa enabled và disabled khi click chọn qua lại giữa 2 ô.
  - `[TC-231.12/MSS][UC-IMP231][Facet-4/ShortfallNoticeUpdatesDynamically]`: Thông báo thiếu tiền tự động cập nhật số tiền thiếu theo ô đất đang được chọn.
  - `[TC-231.13/MSS][UC-IMP231][Facet-4/BuyoutEmitsSelectedCellIndex]`: (Interactive test) Bấm nút Mua Lại kích hoạt `onBuyout` với đúng `selectedCell`.

- **Facet 5: Độ Bền Vững & Hồi Quy (Robustness & Regression Guard)** (3 tests):
  - `[TC-231.14/MSS][UC-IMP231][Facet-5/ServerAuthoritativeZeroAutoDecline]`: Khi timer đếm về 0, `onDecline` không được gọi, nút Mua bị khóa thành "Hết Thời Gian Mua".
  - `[TC-231.15/MSS][UC-IMP231][Facet-5/SSRHeadlessRenderSafety]`: Kết xuất SSR `CompulsoryBuyoutModal` với `eligibleTargets` đa dạng chạy trơn tru 100% không lỗi.
  - `[TC-231.16/MSS][UC-IMP231][Facet-5/BondCollateralFilterGuard]`: Các ô đất đang bị khóa thế chấp trái phiếu của đối thủ bị loại trừ 100% khỏi danh sách mua lại.

---

## 5. DỰ TOÁN NGÂN SÁCH LOC & ANTI-SLOP GUARD

| Tệp Vật Lý | SLOC Trước | Delta Dự Kiến | SLOC Sau | Trần Quy Định | Đánh Giá |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/domain/compulsory_buyout.ts` | 39 | +1 | 40 | <= 400 | ✔️ An toàn (hiệu chuẩn chuẩn xác) |
| `src/domain/room.ts` | 265 | +8 | 273 | <= 400 | ✔️ An toàn |
| `src/domain/chance_card_handlers.ts` | 361 | +14 | 375 | <= 400 | ✔️ An toàn (< 400) |
| `src/server/room_property_coordinator.ts` | 344 | +10 | 354 | <= 400 | ✔️ An toàn (< 400) |
| `src/client/ui/modals/compulsory_buyout_modal.tsx` | 200 | +45 | 245 | <= 500 | ✔️ An toàn (< 300) |
| `src/client/ui/modals/modal_host.tsx` | 494 | 0 | 494 | <= 500 | ✔️ An toàn (giữ nguyên 494) |
| `src/client/ui/modals/event_card_visuals.ts` | 341 | 0 | 341 | <= 500 | ✔️ An toàn |
| `tests/client/imp231_compulsory_buyout_property_selection.test.ts` | 0 | +260 | 260 | <= 600 | ✔️ Chuẩn Detroit |
