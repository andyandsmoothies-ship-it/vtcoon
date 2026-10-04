# [PLAN] IMP-250 (Revision 5): Loại Bỏ "Chuyến Bay Kế Tiếp" (NEXT_PORT) & Nâng Cấp Tactile 2D UI/UX Vòng Xoay Hành Trình

> **Ticket ID**: IMP-250  
> **Type**: Improvement / FSM Refinement & 2D UI Craft  
> **SSOT Reference**: `docs/requirements.md` §II, `docs/domain/gotchas.md` (Invariant 3, 7, 24, 38), `.agents/skills/impeccable/SKILL.md`  
> **Status**: REVISED (Lean, Scope-Confined & Architecturally Verified)

---

## 0. BẢNG TIẾP NHẬN PHẢN BIỆN & XỬ LÝ (1:1 DIRECTIVE RECONCILIATION TABLE)

| Mã Phát Hiện | Phân Loại & Nội Dung | Đánh Giá Kỹ Thuật | Giải Pháp Triệt Để & Vị Trí Trong Kế Hoạch |
| :--- | :--- | :---: | :--- |
| **CRIT-01** | `P1` [Toán học dây cung & FM-3 tự mâu thuẫn]<br>Dây cung $r=54$ là 63.5px, lề chỉ 4.24px. Chữ 8px/7px (<11px) vi phạm FM-3. Chữ nan dưới lộn ngược. | **XÁC NHẬN ĐÚNG 100%** | **Tái thiết kế nan quạt SVG**: Bỏ dồn 3 dòng chữ vào nan. Mỗi nan quạt chỉ chứa **Icon lớn ($22\text{px}$) + Tỷ lệ % ($12\text{px}$)**. Kích thước font $12\text{px} \times 1.28 \approx 15.4\text{px} \ge 11\text{px}$. Nhãn tiếng Việt và mô tả đưa xuống Thẻ Kết Quả bên dưới đĩa quay (Xem § 4 Task 3). |
| **CRIT-02** | `P1` [Dead-end UI khi chặn đóng modal]<br>Thêm `transit_wheel` vào `isCriticalDecision` làm kẹt người chơi nếu mạng lag hoặc server reject `isSpinning=true`. | **XÁC NHẬN ĐÚNG 100%** | **Rút bỏ hoàn toàn `DIR-ADV-02`**: Không sửa `modal_host.tsx`. Bổ sung timeout an toàn 5000ms trong `transit_wheel_modal.tsx` để tự động nhả `isSpinning = false` nếu không nhận được kết quả (Xem § 4 Task 3). |
| **CRIT-03** | `P1` [Scope Bundling & Vỡ nợ chưa kiểm chứng]<br>`DIR-ADV-01` gọi `checkInsolvency` thiếu `landlordId`, nguy cơ ghi đè phase và vi phạm Scope Bundling Ban. | **XÁC NHẬN ĐÚNG 100%** | **Tách `DIR-ADV-01` ra khỏi ticket**: Chuyển lỗi vỡ nợ FSM sang ticket riêng `BUG-TRANSIT-INSOLVENCY` để kiểm thử độc lập, giữ phạm vi IMP-250 thuần túy cho Transit Wheel (Xem § 1). |
| **CRIT-04** | `P1` [Test vi phạm quy tắc cấm]<br>`TC-TW250.10` test biến nội bộ component (Static Checklist). `TC-TW250.11` test export vắng mặt (Change Detector). Thiếu sàn $\ge 15$ tests. Dirty cast `as Array`. | **XÁC NHẬN ĐÚNG 100%** | **Viết lại danh mục 16 atomic tests chuẩn mực**: Bỏ `TC-TW250.10` và `.11`. Liệt kê đầy đủ 16 tests dựa trên public behavior. Xóa bỏ dirty cast `as Array<...>` bằng cách định kiểu chặt chẽ trong `TransitWheelModule` (Xem § 4 Task 4 & Task 5.1). |
| **CRIT-05** | `P1` [Khóa biên dịch lock-step]<br>`OUTCOME_COLORS` có khóa `NEXT_PORT`, nếu xóa `NEXT_PORT` trước sẽ gãy typecheck. | **XÁC NHẬN ĐÚNG 100%** | **Ghi nhận ràng buộc thứ tự triển khai**: Task 1 và Task 3 phải được áp dụng đồng bộ, xóa `OUTCOME_COLORS` cùng lúc với việc loại bỏ `NEXT_PORT` khỏi enum (Xem § 4 Task 3). |
| **CRIT-06** | `P2` [SAFE_HAVEN bẫy +2 ô]<br>`findSafeHaven(cell, [])` trả `+2` ô có thể đẩy người chơi vào khách sạn đối thủ, sai nhãn "Vé VIP". | **XÁC NHẬN ĐÚNG 100%** | **Chuẩn hóa `findSafeHaven`**: Nếu người chơi chưa sở hữu BĐS nào (`ownedProperties.length === 0`), quân cờ **giữ nguyên vị trí tại trạm hiện tại** (`return currentCell;`), bảo đảm an toàn tuyệt đối (Xem § 4 Task 1). |
| **CRIT-07** | `P2` [Tái cân bằng xác suất & Lương GO]<br>Cộng đều +5% không có cơ sở kinh tế; PASS_GO_FLIGHT tăng 50% gây lạm phát; Bất đối xứng stipend vượt GO. | **XÁC NHẬN ĐÚNG 100%** | **Phân bổ theo tỷ lệ chuẩn gốc kiểm soát lạm phát**: `SPEED_BOOST` (35%), `SAFE_HAVEN` (20%), `CASH_BACK` (20%), `PASS_GO_FLIGHT` (10%), `FLIGHT_DELAY` (15%). Xóa bỏ nhánh `stipend` thừa ở `PASS_GO_FLIGHT`, đồng nhất nguyên tắc nhận lương một lần mỗi lượt (Xem § 4 Task 1 & Task 2). |
| **CRIT-08** | `P2` [Cú pháp Tailwind sai & Thiếu test góc]<br>`cubic-bezier` sai cú pháp Tailwind. Thiếu test công thức góc dừng. | **XÁC NHẬN ĐÚNG 100%** | **Sửa Tailwind chuẩn**: `ease-[cubic-bezier(0.15,0.9,0.2,1)]` và `motion-reduce:transition-none`. **Trích xuất hàm thuần**: `getWheelTargetDeg(outcomeIndex, totalSegments)` vào domain model để kiểm thử góc dừng độc lập (Xem § 4 Task 1 & Task 3). |
| **CRIT-09** | `P2` [Đo lường LOC vật lý chính xác]<br>Bảng LOC cần đối chiếu thực tế qua `npm run check:loc`. | **XÁC NHẬN ĐÚNG 100%** | **Cập nhật số liệu từ `scripts/check_loc.mjs`**: Đo lường thực tế trên đĩa cứng (Xem § 2). |
| **CRIT-10** | `P2` [Blast Radius Pre-scan]<br>Kiểm tra các test suite khác có dùng PRNG threshold vòng xoay. | **XÁC NHẬN ĐÚNG 100%** | **Kết quả grep toàn bộ repo**: Chỉ có `imp248` và `imp249` tham chiếu đến `NEXT_PORT` và các ngưỡng PRNG của vòng xoay (Xem § 4 Task 5). |

---

## 1. MỤC TIÊU & PHẠM VI (PILLAR 0)

1. **Loại bỏ Hoàn toàn Cơ chế `NEXT_PORT` (Chuyến Bay Kế Tiếp)**:
   - Xóa `NEXT_PORT` khỏi `TransitWheelOutcome` và `TRANSIT_WHEEL_CONFIGS` trong `src/domain/transit_wheel.ts`.
   - Xóa nhánh `case TransitWheelOutcome.NEXT_PORT:` trong `src/server/transit_wheel_handler.ts`.
   - Xóa bỏ hằng số chết `TRANSIT_CELLS` và hàm `findNextPort` khỏi production code (Anti-TIDD & Subtractive Refactoring).
2. **Chuẩn Hóa `SAFE_HAVEN` (Vé VIP Hồi Hương)**:
   - Sửa `findSafeHaven`: nếu người chơi chưa có bất động sản nào (`ownedProperties.length === 0`), giữ nguyên vị trí tại trạm (`return currentCell;`). Triệt tiêu hoàn toàn nguy cơ nhảy vào ô đối thủ.
3. **Tái Cân Bằng Xác Suất Chuẩn Hóa Kiểm Soát Lạm Phát**:
   - `SPEED_BOOST` (Tốc Hành): **35%** (Dải PRNG: `[0.00, 0.35)`)
   - `SAFE_HAVEN` (Vé VIP Hồi Hương): **20%** (Dải PRNG: `[0.35, 0.55)`)
   - `CASH_BACK` (Hoàn Cước Cảng): **20%** (Dải PRNG: `[0.55, 0.75)`)
   - `PASS_GO_FLIGHT` (Bay Xuyên Việt): **10%** (Dải PRNG: `[0.75, 0.85)`) — Giữ nguyên 10% để kiểm soát lượng tiền mặt bơm vào game.
   - `FLIGHT_DELAY` (Delay Chuyến Bay): **15%** (Dải PRNG: `[0.85, 1.00)`)
   - Tổng cộng: $35 + 20 + 20 + 10 + 15 = 100\%$.
   - Đồng nhất xử lý lương GO: Bỏ stipend thừa ở `PASS_GO_FLIGHT`.
4. **Nâng Cấp Giao Diện Tactile 2D SVG Wheel UI Chuẩn Typography & Công Thái Học**:
   - Nan quạt chỉ chứa **Icon ($22\text{px}$) + Tỷ lệ % ($12\text{px}$)**, triệt tiêu lỗi chữ lộn ngược và tràn chữ.
   - Thẻ kết quả phía dưới hiển thị chi tiết Nhãn tiếng Việt, mô tả và số tiền/bước nhảy.
   - Trục tâm la bàn `🧭` đứng yên làm mỏ neo phương vị tĩnh.
   - Sửa cú pháp Tailwind easing chuẩn: `ease-[cubic-bezier(0.15,0.9,0.2,1)]` và `motion-reduce:transition-none`.
   - Trích xuất hàm thuần `getWheelTargetDeg` vào domain model để kiểm thử góc dừng hình học.
   - Thêm timeout phòng thủ 5000ms reset `isSpinning` chống kẹt UI.
5. **Giới Hạn Phạm Vi (Scope Confinement Exclusion)**:
   - Các nội dung `DIR-ADV-01` (Insolvency on second hop special cell) và `DIR-ADV-02` (Modal backdrop blocking) được loại trừ hoàn toàn khỏi ticket này và chuyển sang backlog độc lập (`BUG-TRANSIT-INSOLVENCY`).

---

## 2. BẢNG ĐO LƯỜNG NGÂN SÁCH LOC (PILLAR 1)

*Được đo lường trực tiếp qua công cụ chuẩn `npm run check:loc` (`scripts/check_loc.mjs`)*:

| Tệp vật lý | Phân loại Tier | LOC Hiện Tại | Dự Kiến Thêm | Dự Kiến Bớt | LOC Sau Thay Đổi | Ngưỡng Tối Đa | Trạng Thái |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `src/domain/transit_wheel.ts` | Tier 1 (Domain Logic) | 84 | +22 | -24 | ~82 | <= 400 | ✔️ Safe |
| `src/server/transit_wheel_handler.ts` | Tier 1 (Server FSM) | 197 | +0 | -25 | ~172 | <= 400 | ✔️ Safe |
| `src/client/ui/modals/transit_wheel_modal.tsx` | Tier 2 (UI Component) | 159 | +30 | -20 | ~169 | <= 500 | ✔️ Safe |
| `tests/contracts/imp250_transit_wheel_ui_craft_and_port_removal.test.ts` | Test Suite | 0 | +240 | -0 | ~240 | <= 600 | ✔️ Safe (Mới) |
| `tests/contracts/imp248_transit_wheel_navigator.test.ts` | Living Suite | 405 | +10 | -20 | ~395 | <= 600 | ✔️ Safe (Reconcile) |
| `tests/contracts/imp249_pawn_pacing_and_transit_hop_affordance.test.ts` | Living Suite | 392 | +10 | -10 | ~392 | <= 600 | ✔️ Safe (Reconcile) |

---

## 3. PHÂN TÍCH CHẾ ĐỘ THẤT BẠI (PILLAR 2 - FAILURE MODES)

1. **FM-1: Lệch Trọng Số Xác Suất (Cumulative Weight Drift)**:
   - *Nguy cơ*: Phân bổ trọng số không đạt đúng 100 hoặc thuật toán tích lũy `evaluateTransitWheelOutcome` bị lọt cận.
   - *Phòng vệ*: Assert $\sum \text{weight} \equiv 100$ và kiểm thử dải PRNG xác định: 0.00, 0.349, 0.35, 0.549, 0.55, 0.749, 0.75, 0.849, 0.85, 0.999.
2. **FM-2: Lệch Góc Dừng Kim Chỉ Hướng (Pointer Angle Misalignment)**:
   - *Nguy cơ*: Công thức tính góc quay `getWheelTargetDeg` dừng sai nan quạt đích ở vị trí kim chỉ $0^\circ$ (12 giờ).
   - *Phòng vệ*: Kiểm thử hàm thuần `getWheelTargetDeg(idx, 5)` cho toàn bộ 5 nan quạt, xác minh góc quay modulo 360 luôn khớp chính xác với tâm nan.
3. **FM-3: Chữ Lộn Ngược và Tràn Nan Quạt (Upside-Down Text & Squeeze)**:
   - *Nguy cơ*: Đặt chữ nằm ngang trong nan quạt ở nửa dưới ($90^\circ - 270^\circ$) làm chữ bị lộn ngược và tràn lề nan quạt hẹp.
   - *Phòng vệ*: Nan quạt chỉ chứa Icon kích thước 22px và Tỷ lệ % (12px, hiển thị thực tế 15.4px). Mọi nhãn tiếng Việt và mô tả được chuyển sang Thẻ Kết Quả bên dưới đĩa quay.
4. **FM-4: Bẫy Nhảy Ô Đối Thủ của SAFE_HAVEN (Enemy Cell Trap)**:
   - *Nguy cơ*: Khi người chơi chưa có BĐS, `findSafeHaven` nhảy bừa $+2$ ô vào tài sản của đối thủ.
   - *Phòng vệ*: Assertion kiểm tra khi `ownedProperties = []`, `findSafeHaven(cell, [])` trả về chính `cell` (an toàn tại trạm).
5. **FM-5: Kẹt UI Vòng Xoay (Spin Dead-End on Network Failure)**:
   - *Nguy cơ*: Người chơi bấm quay nhưng server không phản hồi khiến nút quay bị disable và modal không thoát được.
   - *Phòng vệ*: Bổ sung timeout 5000ms tự động reset `isSpinning = false` và không khóa modal backdrop.

---

## 4. CHI TIẾT TRIỂN KHAI TỪNG TÁC VỤ (TASKS)

### Task 1: Cập Nhật Domain Model `src/domain/transit_wheel.ts`

**Target physical file**: `src/domain/transit_wheel.ts`

- Bỏ enum `NEXT_PORT`.
- Cập nhật 5 cấu hình với trường `icon`, `shortLabelVi`, `color`, trọng số mới (35, 20, 20, 10, 15).
- Xóa bỏ hằng số `TRANSIT_CELLS` và hàm `findNextPort`.
- Trích xuất hàm thuần `getWheelTargetDeg`.
- Sửa `findSafeHaven` trả về `currentCell` khi chưa có tài sản.

```typescript
<<<<
export enum TransitWheelOutcome {
  NEXT_PORT = 'NEXT_PORT',           // Chuyến Bay Kế Tiếp (25%)
  SPEED_BOOST = 'SPEED_BOOST',       // Tốc Hành 1D6 (25%)
  SAFE_HAVEN = 'SAFE_HAVEN',         // Vé VIP Hồi Hương (15%)
  CASH_BACK = 'CASH_BACK',           // Hoàn Cước Cảng (15%)
  PASS_GO_FLIGHT = 'PASS_GO_FLIGHT', // Bay Xuyên Việt (10%)
  FLIGHT_DELAY = 'FLIGHT_DELAY',     // Hoãn Chuyến (10%)
}

export interface TransitWheelConfig {
  readonly outcome: TransitWheelOutcome;
  readonly weight: number; // Tỷ lệ trên 100%
  readonly labelVi: string;
  readonly descriptionVi: string;
}

export const TRANSIT_WHEEL_CONFIGS: readonly TransitWheelConfig[] = [
  {
    outcome: TransitWheelOutcome.NEXT_PORT,
    weight: 25,
    labelVi: 'Chuyến Bay Kế Tiếp',
    descriptionVi: 'Bay thẳng tới trạm hạ tầng tiếp theo theo chiều kim đồng hồ.',
  },
  {
    outcome: TransitWheelOutcome.SPEED_BOOST,
    weight: 25,
    labelVi: 'Tốc Hành',
    descriptionVi: 'Gieo xúc xắc tốc hành, bay thêm 1 - 6 ô về phía trước.',
  },
  {
    outcome: TransitWheelOutcome.SAFE_HAVEN,
    weight: 15,
    labelVi: 'Vé VIP Hồi Hương',
    descriptionVi: 'Bay thẳng về bất động sản gần nhất của bạn để tránh phí phạt.',
  },
  {
    outcome: TransitWheelOutcome.CASH_BACK,
    weight: 15,
    labelVi: 'Hoàn Cước Cảng',
    descriptionVi: 'Nhận hoàn tiền cước dịch vụ từ Kho Bạc lên tới 300 Tr. VNĐ.',
  },
  {
    outcome: TransitWheelOutcome.PASS_GO_FLIGHT,
    weight: 10,
    labelVi: 'Bay Xuyên Việt',
    descriptionVi: 'Bay thẳng một mạch tới ô Khởi Hành (GO), nhận trọn vẹn lương vòng.',
  },
  {
    outcome: TransitWheelOutcome.FLIGHT_DELAY,
    weight: 10,
    labelVi: 'Delay Chuyến Bay',
    descriptionVi: 'Thời tiết xấu, chuyến bay bị hoãn. Quân cờ giữ nguyên vị trí.',
  },
] as const;
====
export enum TransitWheelOutcome {
  SPEED_BOOST = 'SPEED_BOOST',       // Tốc Hành 1D6 (35%)
  SAFE_HAVEN = 'SAFE_HAVEN',         // Vé VIP Hồi Hương (20%)
  CASH_BACK = 'CASH_BACK',           // Hoàn Cước Cảng (20%)
  PASS_GO_FLIGHT = 'PASS_GO_FLIGHT', // Bay Xuyên Việt (10%)
  FLIGHT_DELAY = 'FLIGHT_DELAY',     // Delay Chuyến Bay (15%)
}

export interface TransitWheelConfig {
  readonly outcome: TransitWheelOutcome;
  readonly weight: number; // Tỷ lệ trên 100%
  readonly labelVi: string;
  readonly shortLabelVi: string;
  readonly icon: string;
  readonly color: string;
  readonly descriptionVi: string;
}

export const TRANSIT_WHEEL_CONFIGS: readonly TransitWheelConfig[] = [
  {
    outcome: TransitWheelOutcome.SPEED_BOOST,
    weight: 35,
    labelVi: 'Tốc Hành',
    shortLabelVi: 'TỐC HÀNH',
    icon: '⚡',
    color: '#f59e0b',
    descriptionVi: 'Gieo xúc xắc tốc hành, bay thêm 1 - 6 ô về phía trước.',
  },
  {
    outcome: TransitWheelOutcome.SAFE_HAVEN,
    weight: 20,
    labelVi: 'Vé VIP Hồi Hương',
    shortLabelVi: 'HỒI HƯƠNG',
    icon: '🛡️',
    color: '#10b981',
    descriptionVi: 'Bay thẳng về bất động sản gần nhất của bạn. Nếu chưa sở hữu BĐS, bạn an toàn ở lại trạm.',
  },
  {
    outcome: TransitWheelOutcome.CASH_BACK,
    weight: 20,
    labelVi: 'Hoàn Cước Cảng',
    shortLabelVi: 'HOÀN CƯỚC',
    icon: '💰',
    color: '#8b5cf6',
    descriptionVi: 'Nhận hoàn tiền cước dịch vụ từ Kho Bạc lên tới 300 Tr. VNĐ.',
  },
  {
    outcome: TransitWheelOutcome.PASS_GO_FLIGHT,
    weight: 10,
    labelVi: 'Bay Xuyên Việt',
    shortLabelVi: 'VỀ Ô GO',
    icon: '✈️',
    color: '#ec4899',
    descriptionVi: 'Bay thẳng một mạch tới ô Khởi Hành (GO), nhận trọn vẹn lương vòng.',
  },
  {
    outcome: TransitWheelOutcome.FLIGHT_DELAY,
    weight: 15,
    labelVi: 'Delay Chuyến Bay',
    shortLabelVi: 'HOÃN CHUYẾN',
    icon: '⏳',
    color: '#64748b',
    descriptionVi: 'Thời tiết xấu, chuyến bay bị hoãn. Quân cờ giữ nguyên vị trí.',
  },
] as const;
>>>>
```

Loại bỏ hằng số `TRANSIT_CELLS`, hàm `findNextPort`, sửa `findSafeHaven` an toàn tại trạm, và thêm `getWheelTargetDeg`:
```typescript
<<<<
export const TRANSIT_CELLS: readonly number[] = [5, 15, 25, 35] as const;

export function evaluateTransitWheelOutcome(random01: number): TransitWheelOutcome {
  const roll = Math.min(0.999999, Math.max(0, random01)) * 100;
  let accumulated = 0;
  for (const cfg of TRANSIT_WHEEL_CONFIGS) {
    accumulated += cfg.weight;
    if (roll < accumulated) {
      return cfg.outcome;
    }
  }
  return TransitWheelOutcome.FLIGHT_DELAY;
}

export function findNextPort(currentCell: number): number {
  const forwardPorts = TRANSIT_CELLS.filter((c) => c > currentCell);
  return forwardPorts.length > 0 ? forwardPorts[0]! : TRANSIT_CELLS[0]!;
}

export function findSafeHaven(currentCell: number, ownedProperties: readonly number[] = []): number {
  if (ownedProperties.length === 0) {
    return (currentCell + 2) % 40; // Fallback an toàn tiến 2 ô
  }
  const forwardOwned = ownedProperties.filter((c) => c > currentCell).sort((a, b) => a - b);
  if (forwardOwned.length > 0) return forwardOwned[0]!;
  const wrapOwned = [...ownedProperties].sort((a, b) => a - b);
  return wrapOwned[0]!;
}
====
export function getWheelTargetDeg(outcomeIndex: number, totalSegments: number = 5): number {
  const segmentDeg = 360 / totalSegments;
  return 1800 + (360 - outcomeIndex * segmentDeg - segmentDeg / 2);
}

export function evaluateTransitWheelOutcome(random01: number): TransitWheelOutcome {
  const roll = Math.min(0.999999, Math.max(0, random01)) * 100;
  let accumulated = 0;
  for (const cfg of TRANSIT_WHEEL_CONFIGS) {
    accumulated += cfg.weight;
    if (roll < accumulated) {
      return cfg.outcome;
    }
  }
  return TransitWheelOutcome.FLIGHT_DELAY;
}

export function findSafeHaven(currentCell: number, ownedProperties: readonly number[] = []): number {
  if (ownedProperties.length === 0) {
    return currentCell; // An toàn tại chỗ, không nhảy bừa vào BĐS đối thủ
  }
  const forwardOwned = ownedProperties.filter((c) => c > currentCell).sort((a, b) => a - b);
  if (forwardOwned.length > 0) return forwardOwned[0]!;
  const wrapOwned = [...ownedProperties].sort((a, b) => a - b);
  return wrapOwned[0]!;
}
>>>>
```

---

### Task 2: Cập Nhật Server Authoritative Handler `src/server/transit_wheel_handler.ts`

**Target physical file**: `src/server/transit_wheel_handler.ts`

- Bỏ import `findNextPort`.
- Bỏ nhánh xử lý `case TransitWheelOutcome.NEXT_PORT:`.
- Bỏ nhánh `stipend` thừa ở `case TransitWheelOutcome.PASS_GO_FLIGHT:` để đồng nhất nguyên tắc nhận lương vòng.

```typescript
<<<<
import {
  TransitWheelOutcome,
  evaluateTransitWheelOutcome,
  findNextPort,
  findSafeHaven,
} from '../domain/transit_wheel.js';
====
import {
  TransitWheelOutcome,
  evaluateTransitWheelOutcome,
  findSafeHaven,
} from '../domain/transit_wheel.js';
>>>>
```

```typescript
<<<<
  switch (outcome) {
    case TransitWheelOutcome.NEXT_PORT: {
      const oldPos = current.position;
      targetCell = findNextPort(oldPos);
      current.position = targetCell;
      if (checkPassedGo(oldPos, targetCell)) {
        if (room.passedGoSalary === undefined) {
          const sal = calculateGoSalary(room.roundCount ?? 1);
          current.balance += sal;
          room.passedGoSalary = sal;
        } else {
          // Trợ cấp quá cảnh cố định nếu đã vượt GO trước đó
          const stipend = Math.min(500, Math.max(0, room.treasury ?? 0));
          room.treasury = (room.treasury ?? 0) - stipend;
          current.balance += stipend;
        }
      }
      resolveSecondHopLanding(room, current, targetCell, registry, stateMap, rng, deckRng);
      break;
    }
    case TransitWheelOutcome.SPEED_BOOST: {
====
  switch (outcome) {
    case TransitWheelOutcome.SPEED_BOOST: {
>>>>
```

```typescript
<<<<
    case TransitWheelOutcome.PASS_GO_FLIGHT: {
      const oldPos = current.position;
      targetCell = 0;
      current.position = 0;
      if (room.passedGoSalary === undefined) {
        const sal = calculateGoSalary(room.roundCount ?? 1);
        current.balance += sal;
        room.passedGoSalary = sal;
      } else {
        const stipend = Math.min(500, Math.max(0, room.treasury ?? 0));
        room.treasury = (room.treasury ?? 0) - stipend;
        current.balance += stipend;
      }
      break;
    }
====
    case TransitWheelOutcome.PASS_GO_FLIGHT: {
      const oldPos = current.position;
      targetCell = 0;
      current.position = 0;
      if (room.passedGoSalary === undefined) {
        const sal = calculateGoSalary(room.roundCount ?? 1);
        current.balance += sal;
        room.passedGoSalary = sal;
      }
      break;
    }
>>>>
```

---

### Task 3: Nâng Cấp Tactile 2D SVG Wheel UI trong `src/client/ui/modals/transit_wheel_modal.tsx`

**Target physical file**: `src/client/ui/modals/transit_wheel_modal.tsx`

- Xóa bỏ hoàn toàn bảng màu `OUTCOME_COLORS` (thực hiện đồng bộ với Task 1 tránh gãy typecheck).
- Tách animation xoay vào thẻ `<g>` chứa nan quạt, dùng `getWheelTargetDeg` để tính góc quay.
- Sửa cú pháp Tailwind easing chuẩn: `ease-[cubic-bezier(0.15,0.9,0.2,1)]` và `motion-reduce:transition-none`.
- Mỗi nan quạt chỉ chứa **Icon ($22\text{px}$) tại $y=36$** và **Tỷ lệ % ($12\text{px}$) tại $y=64$**, triệt tiêu lỗi lộn ngược chữ và tràn nan quạt.
- Giữ Center Hub và la bàn `🧭` đứng yên làm mỏ neo tĩnh.
- Bổ sung timeout 5000ms reset `isSpinning` nếu server không phản hồi để chống dead-end.

```typescript
<<<<
import { TRANSIT_WHEEL_CONFIGS, TransitWheelOutcome } from '../../../domain/transit_wheel';
import { AudioEngine } from '../../audio/audio_engine';
====
import { TRANSIT_WHEEL_CONFIGS, TransitWheelOutcome, getWheelTargetDeg } from '../../../domain/transit_wheel';
import { AudioEngine } from '../../audio/audio_engine';
>>>>
```

```typescript
<<<<
const OUTCOME_COLORS: Record<TransitWheelOutcome, string> = {
  [TransitWheelOutcome.NEXT_PORT]: '#3b82f6',
  [TransitWheelOutcome.SPEED_BOOST]: '#f59e0b',
  [TransitWheelOutcome.SAFE_HAVEN]: '#10b981',
  [TransitWheelOutcome.CASH_BACK]: '#8b5cf6',
  [TransitWheelOutcome.PASS_GO_FLIGHT]: '#ec4899',
  [TransitWheelOutcome.FLIGHT_DELAY]: '#64748b',
};
====
>>>>
```

```typescript
<<<<
  const handleStartSpin = () => {
    if (isSpinning || hasFinished) return;
    setIsSpinning(true);
    try { AudioEngine.playSfx(SoundEffect.DICE_ROLL); } catch { /* Ignore */ }
    onSpin();
  };

  useEffect(() => {
    if (outcome && !hasFinished) {
      setIsSpinning(true);
      const outcomeIndex = TRANSIT_WHEEL_CONFIGS.findIndex((c) => c.outcome === outcome);
      const segmentDeg = 360 / TRANSIT_WHEEL_CONFIGS.length;
      // Quay 5 vòng (1800 deg) + góc trúng thưởng
      const targetDeg = 1800 + (360 - outcomeIndex * segmentDeg - segmentDeg / 2);
      setRotation(targetDeg);

      const timer = setTimeout(() => {
        setIsSpinning(false);
        setHasFinished(true);
        try { AudioEngine.playSfx(SoundEffect.CARD_DRAW); } catch { /* Ignore */ }
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [outcome, hasFinished]);
====
  const handleStartSpin = () => {
    if (isSpinning || hasFinished) return;
    setIsSpinning(true);
    try { AudioEngine.playSfx(SoundEffect.DICE_ROLL); } catch { /* Ignore */ }
    onSpin();
  };

  // Timeout an toàn phòng thủ: tự động nhả isSpinning sau 5s nếu server không phản hồi
  useEffect(() => {
    if (isSpinning && !outcome && !hasFinished) {
      const fallbackTimer = setTimeout(() => {
        setIsSpinning(false);
      }, 5000);
      return () => clearTimeout(fallbackTimer);
    }
  }, [isSpinning, outcome, hasFinished]);

  useEffect(() => {
    if (outcome && !hasFinished) {
      setIsSpinning(true);
      const outcomeIndex = TRANSIT_WHEEL_CONFIGS.findIndex((c) => c.outcome === outcome);
      const targetDeg = getWheelTargetDeg(outcomeIndex >= 0 ? outcomeIndex : 0, TRANSIT_WHEEL_CONFIGS.length);
      setRotation(targetDeg);

      const timer = setTimeout(() => {
        setIsSpinning(false);
        setHasFinished(true);
        try { AudioEngine.playSfx(SoundEffect.CARD_DRAW); } catch { /* Ignore */ }
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [outcome, hasFinished]);
>>>>
```

```typescript
<<<<
        <svg
          role="img"
          aria-label="Vòng xoay chuyển tiếp hành trình"
          viewBox="0 0 200 200"
          className="w-full h-full transition-transform duration-[3500ms] cubic-bezier(0.15, 0.9, 0.2, 1)"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {TRANSIT_WHEEL_CONFIGS.map((cfg, idx) => {
            const step = (2 * Math.PI) / TRANSIT_WHEEL_CONFIGS.length;
            const startAngle = idx * step;
            const endAngle = (idx + 1) * step;
            const x1 = 100 + 95 * Math.sin(startAngle);
            const y1 = 100 - 95 * Math.cos(startAngle);
            const x2 = 100 + 95 * Math.sin(endAngle);
            const y2 = 100 - 95 * Math.cos(endAngle);
            const pathData = `M 100 100 L ${x1} ${y1} A 95 95 0 0 1 ${x2} ${y2} Z`;
            return (
              <g key={cfg.outcome}>
                <path d={pathData} fill={OUTCOME_COLORS[cfg.outcome]} stroke="#1e293b" strokeWidth="2" />
              </g>
            );
          })}
          <circle cx="100" cy="100" r="22" fill="#0f172a" stroke="#f59e0b" strokeWidth="3" />
        </svg>
====
        <svg
          role="img"
          aria-label="Vòng xoay chuyển tiếp hành trình"
          viewBox="0 0 200 200"
          className="w-full h-full"
        >
          {/* Nhóm nan quạt xoay động */}
          <g
            className="transition-transform duration-[3500ms] ease-[cubic-bezier(0.15,0.9,0.2,1)] motion-reduce:transition-none"
            style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '100px 100px' }}
          >
            {TRANSIT_WHEEL_CONFIGS.map((cfg, idx) => {
              const step = (2 * Math.PI) / TRANSIT_WHEEL_CONFIGS.length;
              const startAngle = idx * step;
              const endAngle = (idx + 1) * step;
              const x1 = 100 + 95 * Math.sin(startAngle);
              const y1 = 100 - 95 * Math.cos(startAngle);
              const x2 = 100 + 95 * Math.sin(endAngle);
              const y2 = 100 - 95 * Math.cos(endAngle);
              const pathData = `M 100 100 L ${x1} ${y1} A 95 95 0 0 1 ${x2} ${y2} Z`;
              const midDeg = (idx + 0.5) * (360 / TRANSIT_WHEEL_CONFIGS.length);
              return (
                <g key={cfg.outcome}>
                  <path d={pathData} fill={cfg.color} stroke="#0f172a" strokeWidth="2" />
                  <g transform={`rotate(${midDeg} 100 100)`}>
                    <text
                      x="100"
                      y="36"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="22"
                      className="select-none pointer-events-none drop-shadow"
                    >
                      {cfg.icon}
                    </text>
                    <text
                      x="100"
                      y="64"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="12"
                      fontWeight="bold"
                      fill="#ffffff"
                      stroke="#0f172a"
                      strokeWidth="0.5"
                      className="select-none pointer-events-none font-mono tracking-tight"
                    >
                      {cfg.weight}%
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* Trục xoay trung tâm tĩnh (Center Hub Ground Truth Anchor) */}
          <circle cx="100" cy="100" r="23" fill="#0f172a" stroke="#f59e0b" strokeWidth="2.5" />
          <circle cx="100" cy="100" r="17" fill="#1e293b" stroke="#d97706" strokeWidth="1" />
          <text
            x="100"
            y="101"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="13"
            className="select-none pointer-events-none"
          >
            🧭
          </text>
        </svg>
>>>>
```

---

### Task 4: Station 1 Contract Tests `tests/contracts/imp250_transit_wheel_ui_craft_and_port_removal.test.ts` (Mới)

**Target physical file**: `tests/contracts/imp250_transit_wheel_ui_craft_and_port_removal.test.ts` (new)

Tạo suite contract 16 atomic tests phủ đầy đủ 5 Facet theo Universal 5-Facet Matrix (vượt sàn $\ge 15$ tests của `GEMINI.md`):

- **Facet 1: Domain Model & Probabilities (MSS)**:
  - `[TC-TW250.01/MSS][UC-IMP250]`: Xác thực loại bỏ hoàn toàn `NEXT_PORT` khỏi `TRANSIT_WHEEL_CONFIGS` (danh sách chỉ đúng 5 kết quả).
  - `[TC-TW250.02/MSS][UC-IMP250]`: Tổng trọng số 5 cấu hình đạt chính xác 100% ($35 + 20 + 20 + 10 + 15 = 100$).
  - `[TC-TW250.03/MSS][UC-IMP250]`: `evaluateTransitWheelOutcome` phân phối đúng các dải xác suất (0.00-0.35 cho SPEED_BOOST, 0.35-0.55 cho SAFE_HAVEN, 0.55-0.75 cho CASH_BACK, 0.75-0.85 cho PASS_GO_FLIGHT, 0.85-1.00 cho FLIGHT_DELAY).
  - `[TC-TW250.04/MSS][UC-IMP250]`: Kiểm thử cận biên PRNG (0.00, 0.349, 0.35, 0.549, 0.55, 0.749, 0.75, 0.849, 0.85, 0.999) phân giải đúng kết quả tương ứng.
  - `[TC-TW250.05/MSS][UC-IMP250]`: Mỗi cấu hình trong `TRANSIT_WHEEL_CONFIGS` có đầy đủ `icon`, `shortLabelVi`, `labelVi`, `descriptionVi`, `color`.

- **Facet 2: Geometric & Pure Functional Calculations (MSS)**:
  - `[TC-TW250.06/MSS][UC-IMP250]`: Hàm thuần `getWheelTargetDeg` tính chính xác góc dừng cho cả 5 nan quạt ($idx = 0..4$), đảm bảo tâm nan quạt luôn xoay về vị trí $0^\circ$ (12 giờ) của kim chỉ.
  - `[TC-TW250.07/MSS][UC-IMP250]`: `findSafeHaven` khi người chơi có BĐS phía trước trả về BĐS gần nhất theo chiều kim đồng hồ.
  - `[TC-TW250.08/MSS][UC-IMP250]`: `findSafeHaven` khi người chơi có BĐS ở vòng sau (wrap-around) trả về BĐS có chỉ số nhỏ nhất.
  - `[TC-TW250.09/MSS][UC-IMP250]`: `findSafeHaven` khi người chơi không sở hữu BĐS nào (`ownedProperties = []`) trả về chính `currentCell` (an toàn tại trạm, không nhảy bừa vào BĐS đối thủ).

- **Facet 3: Server Authoritative FSM Transitions (MSS)**:
  - `[TC-TW250.10/MSS][UC-IMP250]`: `handleSpinTransitWheel` với `SPEED_BOOST` gieo xúc xắc 1D6 và cho phép quân cờ tiến 1..6 ô.
  - `[TC-TW250.11/MSS][UC-IMP250]`: `handleSpinTransitWheel` với `SAFE_HAVEN` di chuyển quân cờ về BĐS của người chơi hoặc ở lại trạm nếu chưa có BĐS.
  - `[TC-TW250.12/MSS][UC-IMP250]`: `handleSpinTransitWheel` với `CASH_BACK` cộng tiền từ Kho Bạc (tối đa 300 Tr. VNĐ) và trừ Kho Bạc tương ứng (Treasury Conservation).
  - `[TC-TW250.13/MSS][UC-IMP250]`: `handleSpinTransitWheel` với `PASS_GO_FLIGHT` đưa quân cờ về ô 0 và cộng lương vòng nếu chưa nhận trong lượt.
  - `[TC-TW250.14/MSS][UC-IMP250]`: `handleSpinTransitWheel` với `FLIGHT_DELAY` giữ nguyên vị trí quân cờ và không thay đổi số dư.

- **Facet 4 & 5: Adversarial Boundary & Concurrency (A1, A2)**:
  - `[UC-IMP250/A1][TC-TW250.15]`: Lệnh quay bị từ chối với lý do hợp lệ nếu không có `pendingTransitWheel` cho người chơi đó.
  - `[UC-IMP250/A2][TC-TW250.16]`: Khóa nguyên tử `hasSpunTransitThisTurn = true` ngăn chặn quay lần 2 trong cùng 1 lượt.

---

### Task 5: Cập Nhật Precondition Suite Cũ `imp248` & `imp249`

#### 5.1 Cập nhật `imp248.test.ts`

**Target physical file**: `tests/contracts/imp248_transit_wheel_navigator.test.ts`

Cập nhật interface định kiểu chặt chẽ trong `imp248`, triệt tiêu dirty cast `as Array<...>`:
```typescript
<<<<
interface TransitWheelModule {
  evaluateTransitWheelOutcome?: (random01: number) => string;
  findNextPort?: (currentCell: number) => number;
  findSafeHaven?: (currentCell: number, ownedProperties?: readonly number[]) => number;
  TRANSIT_WHEEL_CONFIGS?: readonly unknown[];
  TRANSIT_CELLS?: readonly number[];
}
====
interface TransitWheelModule {
  evaluateTransitWheelOutcome?: (random01: number) => string;
  findNextPort?: (currentCell: number) => number;
  findSafeHaven?: (currentCell: number, ownedProperties?: readonly number[]) => number;
  TRANSIT_WHEEL_CONFIGS?: readonly Array<{ outcome: string; weight: number }>;
  TRANSIT_CELLS?: readonly number[];
}
>>>>
```

Bóc tách `TRANSIT_WHEEL_CONFIGS`:
```typescript
<<<<
const { findNextPort, findSafeHaven } = transitWheelMod;
const { handleSpinTransitWheel } = transitHandlerMod;
====
const { findSafeHaven, TRANSIT_WHEEL_CONFIGS } = transitWheelMod;
const { handleSpinTransitWheel } = transitHandlerMod;
>>>>
```

Reconcile test `TC-TW01.01` sang kiểm tra 5 kết quả mà không cần dirty cast:
```typescript
<<<<
  describe('Facet 1: Outcome Mechanics & Weights', () => {
    it('[TC-TW01.01/MSS][UC-IMP248] NEXT_PORT chuyển quân cờ tới trạm kế tiếp theo chiều kim đồng hồ (5 -> 15 và 35 -> 5)', () => {
      const portFrom5 = findNextPort!(5);
      const portFrom35 = findNextPort!(35);

      expect(portFrom5).toBe(15);
      expect(portFrom35).toBe(5);
    });

    it('[TC-TW01.02/MSS][UC-IMP248] SPEED_BOOST gieo xúc xắc 1D6 và cho phép quân cờ tiến 1..6 ô từ trạm hiện tại', () => {
      const { room, player, registry, stateMap } = setupContractRoom('p1', 5, 1000);
      let rngStep = 0;
      const customRng = () => {
        rngStep++;
        return rngStep === 1 ? 0.35 : 0.50; // SPEED_BOOST & 4 on 1D6
      };
====
  describe('Facet 1: Outcome Mechanics & Weights', () => {
    it('[TC-TW01.01/MSS][UC-IMP248] Xác thực loại bỏ NEXT_PORT, danh sách TRANSIT_WHEEL_CONFIGS chỉ gồm 5 kết quả với tổng trọng số 100%', () => {
      const configs = transitWheelMod.TRANSIT_WHEEL_CONFIGS ?? [];
      const outcomes = configs.map((c) => c.outcome);
      expect(outcomes).not.toContain('NEXT_PORT');
      expect(configs.length).toBe(5);
    });

    it('[TC-TW01.02/MSS][UC-IMP248] SPEED_BOOST gieo xúc xắc 1D6 và cho phép quân cờ tiến 1..6 ô từ trạm hiện tại', () => {
      const { room, player, registry, stateMap } = setupContractRoom('p1', 5, 1000);
      let rngStep = 0;
      const customRng = () => {
        rngStep++;
        return rngStep === 1 ? 0.15 : 0.50; // SPEED_BOOST & 4 on 1D6
      };
>>>>
```

Điều chỉnh `findSafeHaven` an toàn tại trạm trong `TC-TW01.03`:
```typescript
<<<<
    it('[TC-TW01.03/MSS][UC-IMP248] SAFE_HAVEN đưa quân cờ về BĐS gần nhất sở hữu, hoặc tiến 2 ô an toàn nếu chưa sở hữu BĐS nào', () => {
      const targetWithProperties = findSafeHaven!(5, [12, 28]);
      const targetWithoutProperties = findSafeHaven!(5, []);

      expect(targetWithProperties).toBe(12);
      expect(targetWithoutProperties).toBe(7);
    });
====
    it('[TC-TW01.03/MSS][UC-IMP248] SAFE_HAVEN đưa quân cờ về BĐS gần nhất sở hữu, hoặc an toàn ở lại trạm nếu chưa sở hữu BĐS nào', () => {
      const targetWithProperties = findSafeHaven!(5, [12, 28]);
      const targetWithoutProperties = findSafeHaven!(5, []);

      expect(targetWithProperties).toBe(12);
      expect(targetWithoutProperties).toBe(5);
    });
>>>>
```

Điều chỉnh ngưỡng PRNG PASS_GO_FLIGHT trong `TC-TW01.05`:
```typescript
<<<<
      const { room, player, registry, stateMap } = setupContractRoom('p1', 25, 1000);
      room.roundCount = 1;
      room.passedGoSalary = undefined;
      const rngPassGo = () => 0.85;
====
      const { room, player, registry, stateMap } = setupContractRoom('p1', 25, 1000);
      room.roundCount = 1;
      room.passedGoSalary = undefined;
      const rngPassGo = () => 0.80;
>>>>
```

Điều chỉnh Facet 2 kiểm tra cấp lương GO đơn nhất:
```typescript
<<<<
  describe('Facet 2: Anti-Inflation & Single GO Salary Cap', () => {
    it('[TC-TW02.01/MSS][UC-IMP248] Chuyến bay vượt GO lần đầu trong lượt nhận đủ lương GO theo vòng đấu khi room.passedGoSalary là undefined', () => {
      const { room, player, registry, stateMap } = setupContractRoom('p1', 35, 1000);
      room.roundCount = 1;
      room.passedGoSalary = undefined;
      const rngNextPort = () => 0.10;

      handleSpinTransitWheel!(room, player.id, registry, stateMap, rngNextPort);

      expect(room.players[0]!.balance).toBe(3000);
      expect(room.passedGoSalary).toBe(2000);
    });

    it('[TC-TW02.02/MSS][UC-IMP248] Chuyến bay vượt GO lần hai trong lượt chỉ nhận trợ cấp cố định 500 Tr. VNĐ từ Kho Bạc thay vì x2 lương', () => {
      const { room, player, registry, stateMap } = setupContractRoom('p1', 35, 1000);
      room.roundCount = 1;
      room.passedGoSalary = 2000;
      room.treasury = 2000;
      const rngNextPort = () => 0.10;

      handleSpinTransitWheel!(room, player.id, registry, stateMap, rngNextPort);

      expect(room.players[0]!.balance).toBe(1500);
      expect(room.passedGoSalary).toBe(2000);
    });

    it('[TC-TW02.03/MSS][UC-IMP248] Trợ cấp vượt GO lần hai bị khống chế theo quỹ Kho Bạc khả dụng Math.min(500, room.treasury)', () => {
      const { room, player, registry, stateMap } = setupContractRoom('p1', 35, 1000);
      room.passedGoSalary = 2000;
      room.treasury = 200;
      const rngNextPort = () => 0.10;

      handleSpinTransitWheel!(room, player.id, registry, stateMap, rngNextPort);

      expect(room.players[0]!.balance).toBe(1200);
      expect(room.treasury).toBe(0);
    });
  });
====
  describe('Facet 2: Anti-Inflation & Single GO Salary Cap', () => {
    it('[TC-TW02.01/MSS][UC-IMP248] Chuyến bay vượt GO lần đầu trong lượt nhận đủ lương GO theo vòng đấu khi room.passedGoSalary là undefined', () => {
      const { room, player, registry, stateMap } = setupContractRoom('p1', 35, 1000);
      room.roundCount = 1;
      room.passedGoSalary = undefined;
      const rngPassGo = () => 0.80; // PASS_GO_FLIGHT

      handleSpinTransitWheel!(room, player.id, registry, stateMap, rngPassGo);

      expect(room.players[0]!.balance).toBe(3000);
      expect(room.passedGoSalary).toBe(2000);
    });

    it('[TC-TW02.02/MSS][UC-IMP248] Chuyến bay vượt GO lần hai trong lượt không cấp thêm lương vòng (chống x2 lương lạm phát)', () => {
      const { room, player, registry, stateMap } = setupContractRoom('p1', 35, 1000);
      room.roundCount = 1;
      room.passedGoSalary = 2000;
      const rngPassGo = () => 0.80; // PASS_GO_FLIGHT

      handleSpinTransitWheel!(room, player.id, registry, stateMap, rngPassGo);

      expect(room.players[0]!.balance).toBe(1000); // Giữ nguyên số dư, không in thêm tiền
      expect(room.passedGoSalary).toBe(2000);
    });
  });
>>>>
```

Điều chỉnh `TC-TW03.01` sang dùng `SPEED_BOOST`:
```typescript
<<<<
    it('[TC-TW03.01/MSS][UC-IMP248] Khóa hasSpunTransitThisTurn ngăn chặn mở vòng xoay lần hai khi bay sang ga hạ tầng kế tiếp', () => {
      const { room, player, registry, stateMap } = setupContractRoom('p1', 5, 1000);
      const rngNextPort = () => 0.10;

      handleSpinTransitWheel!(room, player.id, registry, stateMap, rngNextPort);

      expect(room.players[0]!.hasSpunTransitThisTurn).toBe(true);
      expect(room.pendingTransitWheel).toBeNull();
    });
====
    it('[TC-TW03.01/MSS][UC-IMP248] Khóa hasSpunTransitThisTurn ngăn chặn mở vòng xoay lần hai sau khi quay xong', () => {
      const { room, player, registry, stateMap } = setupContractRoom('p1', 5, 1000);
      const rngBoost = () => 0.15; // SPEED_BOOST

      handleSpinTransitWheel!(room, player.id, registry, stateMap, rngBoost);

      expect(room.players[0]!.hasSpunTransitThisTurn).toBe(true);
      expect(room.pendingTransitWheel).toBeNull();
    });
>>>>
```

---

#### 5.2 Cập nhật `imp249.test.ts`

**Target physical file**: `tests/contracts/imp249_pawn_pacing_and_transit_hop_affordance.test.ts`

Reconcile test `TC-IMP249.10` sang `SPEED_BOOST` nhảy sang ô đất trống 26 chưa có chủ:
```typescript
<<<<
    it('[UC-IMP249/MSS] [TC-IMP249.10] Khi quay trúng NEXT_PORT nhảy sang ô 25 chưa có chủ, resolveSecondHopLanding chuyển room.phase = TurnPhase.ActionPhase', () => {
      const room: Room = createRoom('ROOM_249', 'p1');
      room.started = true;
      room.phase = TurnPhase.PropertyManagement;
      const p1 = createTestPlayer('p1', 'P1', 5000);
      p1.position = 15;
      room.players = [p1, createTestPlayer('p2', 'P2', 5000)];
      room.currentPlayerIndex = 0;
      room.pendingTransitWheel = { playerId: 'p1', cellIndex: 15, timestamp: Date.now() };
      const res = handleSpinTransitWheel(room, 'p1', new Map(), new Map(), () => 0.1);
      expect(res.outcome).toBe(TransitWheelOutcome.NEXT_PORT);
      expect(room.phase).toBe(TurnPhase.ActionPhase);
    });
====
    it('[UC-IMP249/MSS] [TC-IMP249.10] Khi quay trúng SPEED_BOOST nhảy sang ô đất trống chưa có chủ, resolveSecondHopLanding chuyển room.phase = TurnPhase.ActionPhase', () => {
      const room: Room = createRoom('ROOM_249', 'p1');
      room.started = true;
      room.phase = TurnPhase.PropertyManagement;
      const p1 = createTestPlayer('p1', 'P1', 5000);
      p1.position = 25;
      room.players = [p1, createTestPlayer('p2', 'P2', 5000)];
      room.currentPlayerIndex = 0;
      room.pendingTransitWheel = { playerId: 'p1', cellIndex: 25, timestamp: Date.now() };
      let step = 0;
      // SPEED_BOOST (0.15) gieo xúc xắc 1D6 ra 1 (0.0) -> pos = 26 (ô đất trống)
      const res = handleSpinTransitWheel(room, 'p1', new Map(), new Map(), () => (++step === 1 ? 0.15 : 0.0));
      expect(res.outcome).toBe(TransitWheelOutcome.SPEED_BOOST);
      expect(room.phase).toBe(TurnPhase.ActionPhase);
    });
>>>>
```

Cập nhật PRNG sang `0.15` cho `SPEED_BOOST` trong `TC-IMP249.11`:
```typescript
<<<<
      let step = 0;
      const res = handleSpinTransitWheel(room, 'p1', new Map(), new Map(), () => (++step === 1 ? 0.35 : 0.0));
      expect(res.outcome).toBe(TransitWheelOutcome.SPEED_BOOST);
      expect(p1.position).toBe(6);
      expect(room.phase).toBe(TurnPhase.ActionPhase);
====
      let step = 0;
      const res = handleSpinTransitWheel(room, 'p1', new Map(), new Map(), () => (++step === 1 ? 0.15 : 0.0));
      expect(res.outcome).toBe(TransitWheelOutcome.SPEED_BOOST);
      expect(p1.position).toBe(6);
      expect(room.phase).toBe(TurnPhase.ActionPhase);
>>>>
```

Cập nhật `TC-IMP249.12` xuất phát ô 5 gieo ra ô 6 trống:
```typescript
<<<<
      room.pendingTransitWheel = { playerId: 'p1', cellIndex: 15, timestamp: Date.now() };
      const reg: PropertyRegistry = new Map();
      const sm: PropertyStateMap = new Map();
      handleSpinTransitWheel(room, 'p1', reg, sm, () => 0.1);
      const buyRes = handleBuyProperty(room, p1, reg);
      expect(buyRes?.result).toBe(BuyResult.Success);
====
      room.pendingTransitWheel = { playerId: 'p1', cellIndex: 5, timestamp: Date.now() };
      p1.position = 5;
      const reg: PropertyRegistry = new Map();
      const sm: PropertyStateMap = new Map();
      let step = 0;
      handleSpinTransitWheel(room, 'p1', reg, sm, () => (++step === 1 ? 0.15 : 0.0));
      const buyRes = handleBuyProperty(room, p1, reg);
      expect(buyRes?.result).toBe(BuyResult.Success);
>>>>
```

Điều chỉnh `TC-IMP249.13` sang vị trí xuất phát ô 5 đáp ô 6 của p2:
```typescript
<<<<
      const p1 = createTestPlayer('p1', 'P1', 5000);
      p1.position = 15;
      const p2 = createTestPlayer('p2', 'P2', 5000);
      p2.ownedProperties = [25];
      room.players = [p1, p2];
      room.currentPlayerIndex = 0;
      room.pendingTransitWheel = { playerId: 'p1', cellIndex: 15, timestamp: Date.now() };
      handleSpinTransitWheel(room, 'p1', new Map([[25, 'p2']]), new Map(), () => 0.1);
      expect(p1.balance).toBeLessThan(5000);
      expect(room.phase).toBe(TurnPhase.PropertyManagement);
====
      const p1 = createTestPlayer('p1', 'P1', 5000);
      p1.position = 5;
      const p2 = createTestPlayer('p2', 'P2', 5000);
      p2.ownedProperties = [6];
      room.players = [p1, p2];
      room.currentPlayerIndex = 0;
      room.pendingTransitWheel = { playerId: 'p1', cellIndex: 5, timestamp: Date.now() };
      let step = 0;
      handleSpinTransitWheel(room, 'p1', new Map([[6, 'p2']]), new Map(), () => (++step === 1 ? 0.15 : 0.0));
      expect(p1.balance).toBeLessThan(5000);
      expect(room.phase).toBe(TurnPhase.PropertyManagement);
>>>>
```

Cập nhật `TC-IMP249.21` sang PRNG 0.15:
```typescript
<<<<
      let step = 0;
      handleSpinTransitWheel(room, 'p1', new Map([[6, 'p2']]), new Map(), () => (++step === 1 ? 0.35 : 0.0));
      expect(room.lastDiplomaticEvent?.landlordId).toBe('p2');
====
      let step = 0;
      handleSpinTransitWheel(room, 'p1', new Map([[6, 'p2']]), new Map(), () => (++step === 1 ? 0.15 : 0.0));
      expect(room.lastDiplomaticEvent?.landlordId).toBe('p2');
>>>>
```

Cập nhật `TC-IMP249.23` sang PRNG 0.15:
```typescript
<<<<
        return rngCalls === 1 ? 0.35 : 0.2; // 0.35 -> SPEED_BOOST, 0.2 -> boost = floor(0.2*6)+1 = 2 -> pos = 7 (Chance)
====
        return rngCalls === 1 ? 0.15 : 0.2; // 0.15 -> SPEED_BOOST, 0.2 -> boost = floor(0.2*6)+1 = 2 -> pos = 7 (Chance)
>>>>
```

Cập nhật `TC-IMP249.20` loại bỏ assert `NEXT_PORT`:
```typescript
<<<<
      expect(getTransitWheelDismissText(TransitWheelOutcome.NEXT_PORT)).toBe('Tiếp Tục Di Chuyển Đến Ô Mới');
      expect(getTransitWheelDismissText(TransitWheelOutcome.SPEED_BOOST)).toBe('Tiếp Tục Di Chuyển Đến Ô Mới');
====
      expect(getTransitWheelDismissText(TransitWheelOutcome.SPEED_BOOST)).toBe('Tiếp Tục Di Chuyển Đến Ô Mới');
>>>>
```
