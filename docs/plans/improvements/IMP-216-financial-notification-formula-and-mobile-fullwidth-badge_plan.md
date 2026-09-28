# KẾ HOẠCH TRIỂN KHAI (IMPLEMENTATION PLAN) — REVISION 2
## TICKET: IMP-216 — Financial Notification Formula Transparency & Mobile Full-Width Badge

> **Mục tiêu**: Nâng cấp toàn diện hệ thống thông báo biến động tài chính (`FloatingBadge` & `FloatingNumbersOverlay`) trên mobile và desktop:
> 1. Xóa bỏ giới hạn co cụm 1/2 màn hình mobile (`max-w-[calc(100vw-11.5rem)]`), mở rộng ra gần trọn bề ngang màn hình (`w-[calc(100vw-1.5rem)] max-w-sm sm:max-w-md`), căn giữa cân đối với z-index 30.
> 2. Tái cấu trúc thẻ thành 3 tầng phân cấp thị giác rõ rệt:
>    - **Header**: Icon danh mục + Tên nghiệp vụ viết hoa + Nút đóng `✕` (tap target an toàn).
>    - **Dòng 1 (Lý do / Công thức)**: Rõ nghĩa, súc tích (dưới 50 ký tự), giải thích chính xác điều kiện kích hoạt hoặc công thức tính toán.
>    - **Dòng 2 (Dòng tiền & Đối tượng)**: Câu văn tự nhiên chuẩn công thái học không bị nghịch đảo dòng tiền và không bị ép bẹp tên người chơi trên mobile 360px.
> 3. Khóa chặt tính nhất quán với Single Source of Truth (SSOT):
>    - Di chuyển `TELECOM_DATA_FEE = 150` và `MIN_BAIL_AMOUNT = 500` vào `src/domain/property_rent.ts`.
>    - Tách module `src/client/ui/transaction_formula.ts` độc lập để bảo toàn ngân sách LOC của `transaction_narrative.ts` <= 280 LOC (`TC-194.18`).
>    - Vá lỗ hổng Data Lifecycle trong `src/client/store/game_store.ts` (`formula` không bị drop).
> 
> **Quy trình áp dụng**: Tier 2 (Full Rigor) — 3-Station Pipeline (Station 1 RED -> Station 2 GREEN -> Station 2.5 Scout -> Station 3 Review).

---

## 1. TỌA ĐỘ MÃ NGUỒN VẬT LÝ & NGÂN SÁCH LOC

| Tệp Vật Lý | Phân Loại | Hiện Tại | Dự Kiến | Trần Cho Phép | Trạng Thái & Nhiệm Vụ |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/domain/property_rent.ts` | Tier 1 (Domain SSOT) | 183 LOC | 190 LOC | <= 400 LOC | Xuất khẩu `TELECOM_DATA_FEE = 150`, `MIN_BAIL_AMOUNT = 500`, `BAIL_NET_WORTH_RATIO = 0.10` |
| `src/server/special_cell_handler.ts` | Tier 1 (Server Logic) | 72 LOC | 72 LOC | <= 400 LOC | Import `TELECOM_DATA_FEE` từ `src/domain/property_rent.js` (xóa code trùng) |
| `src/server/audit_manager.ts` | Tier 1 (Server Logic) | 150 LOC | 150 LOC | <= 400 LOC | Import `MIN_BAIL_AMOUNT`, `BAIL_NET_WORTH_RATIO` từ `src/domain/property_rent.js` |
| `src/client/store/game_store_types.ts` | Tier 1 (Domain State) | 379 LOC | 380 LOC | <= 400 LOC | Thêm `readonly formula?: string;` vào `FloatingTextItem` (bảo toàn `timestamp`, `durationMs`) |
| `src/client/store/game_store.ts` | Tier 1 (Client Store) | 487 LOC | 490 LOC | <= 500 LOC | Vá `addFloatingText`: copy `formula` vào `newItem` |
| `src/client/ui/transaction_formula.ts` | Tier 2 (UI Submodule) | 0 LOC (Mới) | ~110 LOC | <= 300 LOC | Tách riêng hàm `resolveFormulaText` từ Domain SSOT, bảo vệ LOC của `transaction_narrative.ts` |
| `src/client/ui/transaction_narrative.ts` | Tier 2 (UI/Narrative) | 255 LOC | ~265 LOC | <= 280 LOC | Nhúng `formula` vào `TransactionNarrative`, gọi `resolveFormulaText` |
| `src/client/ui/floating_numbers.tsx` | Tier 2 (UI Component) | 282 LOC | ~310 LOC | <= 500 LOC | Layout 3 tầng + Full-width mobile + Dòng 2 công thái học (padding `py-1.5 sm:py-2.5`) |
| `src/client/network/activity_financial_tracker.ts` | Tier 1 (Tracker) | 310 LOC | ~325 LOC | <= 400 LOC | Bóc tách bảo lãnh 10% (không so sánh cứng 500), gắn nhãn điện EVN & cước Viettel |
| `src/client/network/activity_badge_dispatcher.ts` | Tier 1 (Dispatcher) | 232 LOC | ~240 LOC | <= 400 LOC | Truyền `formula` qua `addFloatingText` |
| `tests/contracts/imp216_financial_notification_formula_and_badge.test.ts` | Living Suite | 0 LOC (Mới) | ~400 LOC | <= 600 LOC | 16 atomic tests theo 5 facet |

---

## 2. MA TRẬN 5-FACET KIỂM THỬ HỢP ĐỒNG (STATION 1 RED CONTRACT)

Tệp: `tests/contracts/imp216_financial_notification_formula_and_badge.test.ts` (16 atomic tests, 1-4 asserts/test, 0 loops trong `it()`):

### Facet 1: Phân giải Công thức SSOT (Audit Jail & Bail - Tự nguyện vs Cưỡng chế vs Gieo đôi)
- `[TC-216.01/MSS][UC-IMP216]` Tự nguyện nộp bảo lãnh sớm (`actionType: 'bail'`): Dòng 1 sinh công thức `Bảo lãnh sớm: 10% tài sản ròng (Sàn 500 Tr.)`.
- `[TC-216.02/MSS][UC-IMP216]` Hết 3 lượt cưỡng chế phạt (`isTimeout: true` hoặc title chứa bắt buộc): Dòng 1 sinh `Hết 3 lượt không ra đôi: Phạt bảo lãnh bắt buộc`.
- `[TC-216.03/MSS][UC-IMP216]` Gieo xúc xắc đôi thoát kiểm toán (`actionType: 'audit_jail'`, title chứa xúc xắc đôi): Dòng 1 sinh `Gieo xúc xắc đôi: Thoát kiểm toán miễn phí`, số tiền `0 Tr.`.
- `[TC-216.04/MSS][UC-IMP216]` Tự động cập nhật theo hằng số SSOT: Chuỗi công thức nhập trực tiếp `MIN_BAIL_AMOUNT` từ `src/domain/property_rent.ts`.

### Facet 2: Tiện ích & Hạ tầng (Điện EVN qua GO & Cước data Viettel)
- `[TC-216.05/MSS][UC-IMP216]` Tiền điện EVN khi đối thủ qua GO (`actionType: 'rent_pay'`, cell 12 hoặc title chứa điện EVN): Dòng 1 sinh `Hóa đơn tiền điện EVN khi qua ô Khởi Hành`.
- `[TC-216.06/MSS][UC-IMP216]` Cước data Viettel khi vào ô Thị Trường/Cơ Hội: Dòng 1 sinh `Cước data viễn thông Viettel (150 Tr.)`, nhập từ `TELECOM_DATA_FEE`.
- `[TC-216.07/MSS][UC-IMP216]` Chủ EVN hoặc Viettel tự qua GO/dừng ô: Không sinh badge trừ tiền cho chính chủ (Self-exemption).

### Facet 3: Thuế & Lệ phí Tài chính Vĩ mô (Ô 04 & Thuế vượt GO)
- `[TC-216.08/MSS][UC-IMP216]` Lệ phí Đất đai (Ô 04): Dòng 1 sinh `Lệ phí trước bạ: 10% tiền mặt (Tối đa 2.000 Tr.)`.
- `[TC-216.09/MSS][UC-IMP216]` Thuế tài sản vượt GO: Dòng 1 sinh `Thuế tài sản qua GO (Tối đa 2.000 Tr.)`, nhập từ `GO_PROPERTY_TAX_CAP`.
- `[TC-216.10/MSS][UC-IMP216]` Lương qua ô Khởi Hành (`actionType: 'salary'`): Dòng 1 sinh `Hoàn thành 1 vòng: Thưởng lương qua ô Khởi Hành`.

### Facet 4: Bất Động Sản Độc Quyền & Thẻ Đặc Quyền Ngoại Giao (Bilateral Parity)
- `[TC-216.11/MSS][UC-IMP216]` Tiền thuê BĐS có Độc Quyền (Monopoly x2): Dòng 1 sinh `Độc quyền nhóm màu (x2 tiền thuê): [Tên ô]`.
- `[TC-216.12/MSS][UC-IMP216]` Thẻ Ngoại Giao đối xứng 2 chiều:
  - Phía khách thuê (`isPositive: false`): `Đặc quyền ngoại giao: Miễn 100% tiền thuê`.
  - Phía chủ nhà hụt thu (`isPositive: false`, title chứa Hụt thu): `Khách dùng Thẻ Ngoại Giao: Hụt thu tiền thuê`.
- `[TC-216.13/MSS][UC-IMP216]` Thế chấp & Giải chấp ngân hàng: Dòng 1 sinh `Vay vốn tín dụng ngân hàng (50% giá trị đất)` và `Chuộc lại đất thế chấp (Gốc + 10% phí Kho Bạc)`.

### Facet 5: Công thái học Mobile Full-Width, Data Lifecycle & Cấu trúc 3 Tầng DOM
- `[TC-216.14/MSS][UC-IMP216]` `FloatingNumbersOverlay` trên mobile render `w-[calc(100vw-1.5rem)]` và `left-1/2 -translate-x-1/2`, KHÔNG còn chứa `max-w-[calc(100vw-11.5rem)]`.
- `[TC-216.15/MSS][UC-IMP216]` `FloatingBadge` render đúng cấu trúc 3 tầng:
  - Header: chứa `narrative.category`, icon và nút `✕` `aria-label="Đóng thông báo"`.
  - Dòng 1: phần tử `data-testid="transaction-formula-line"` chứa `narrative.formula`.
  - Dòng 2: phần tử `data-testid="transaction-flow-line"` chứa câu văn tự nhiên, không làm co bẹp tên người chơi dưới 40px.
- `[TC-216.16/MSS][UC-IMP216]` Data Lifecycle Invariant: Gọi `state.addFloatingText({ formula: '...' })` thì `state.floatingTexts[0].formula` được lưu trữ toàn vẹn, không bị nuốt chửng bởi store.

---

## 3. DROP-IN CODE SNIPPETS CHO TỪNG TẦNG

### 3.1. Layer 1: Domain SSOT Constants (`src/domain/property_rent.ts`)
Thêm các hằng số SSOT dùng chung cho toàn bộ hệ thống:
```typescript
// [IMP-216] SSOT Constants for Special Fees & Bail
export const TELECOM_DATA_FEE = 150;
export const MIN_BAIL_AMOUNT = 500;
export const BAIL_NET_WORTH_RATIO = 0.10;
```
Cập nhật `src/server/special_cell_handler.ts`:
```typescript
import { TELECOM_DATA_FEE } from '../domain/property_rent';
```
Cập nhật `src/server/audit_manager.ts`:
```typescript
import { MIN_BAIL_AMOUNT, BAIL_NET_WORTH_RATIO } from '../domain/property_rent';
// Sử dụng Math.max(MIN_BAIL_AMOUNT, Math.floor(netWorth * BAIL_NET_WORTH_RATIO))
```

### 3.2. Layer 2: Data Model & Store Lifecycle
**Trong `src/client/store/game_store_types.ts`**:
Bảo lưu 100% các trường hiện hữu, chỉ bổ sung `readonly formula?: string;`:
```typescript
export interface FloatingTextItem {
  readonly id: string;
  readonly text: string;
  readonly type?: FloatingTextType;
  readonly playerId: string;
  readonly timestamp: number;
  readonly durationMs?: number;
  readonly actionType?: FloatingActionType;
  readonly title?: string;
  readonly cellIndex?: number;
  readonly targetPlayerId?: string;
  readonly targetPlayerName?: string;
  readonly formula?: string; // [IMP-216] Dòng 1: Lý do / công thức rõ nghĩa, súc tích
}
```

**Trong `src/client/store/game_store.ts` (L342-L354)**:
Bổ sung sao chép `formula` vào `newItem`:
```typescript
  const newItem: FloatingTextItem = {
    id,
    text: item.text,
    type: item.type,
    playerId: item.playerId,
    timestamp,
    durationMs: duration,
    ...(item.actionType ? { actionType: item.actionType } : {}),
    ...(item.title ? { title: item.title } : {}),
    ...(item.cellIndex !== undefined ? { cellIndex: item.cellIndex } : {}),
    ...(item.targetPlayerName ? { targetPlayerName: item.targetPlayerName } : {}),
    ...(item.targetPlayerId ? { targetPlayerId: item.targetPlayerId } : {}),
    ...(item.formula ? { formula: item.formula } : {}), // [IMP-216] Bảo toàn dữ liệu formula
  };
```

### 3.3. Layer 3: Network Tracker & Dispatcher
**Trong `src/client/network/activity_financial_tracker.ts`**:
Cập nhật nhận diện bảo lãnh kiểm toán không so sánh cứng 500, và gắn tiêu đề rõ ràng cho cước Viettel / tiền điện EVN:
```typescript
  // [IMP-79][IMP-216] Nhận diện Tiền Bảo Lãnh Kiểm Toán (Ô 10)
  const prevP = prevState?.playersInfo[payer.id];
  const wasInAudit = Boolean(prevP?.inAudit || (prevP?.auditTurnsLeft && prevP.auditTurnsLeft > 0));
  if (wasInAudit && absDiff >= 500) {
    const isTimeout = prevP?.auditTurnsLeft === 1 || prevP?.auditTurnsLeft === 0;
    const bailDesc = isTimeout
      ? 'Hết 3 lượt không ra đôi: Phạt bảo lãnh bắt buộc'
      : 'Bảo Lãnh Kiểm Toán để rời Trạm';
    return {
      id: `bail_${Date.now()}_${payer.id}`,
      timestamp: Date.now(),
      type: 'bail',
      message: `⚖️ ${pName} đã nộp phí / nộp thuế ${formatCurrency(absDiff)} (${bailDesc})`,
      playerId: payer.id,
      playerName: pName,
      cellIndex: 10,
      amount: payer.diff,
      ...(payer.pInfo?.tokenColor ? { playerTokenColor: payer.pInfo.tokenColor } : {}),
    };
  }
```

**Trong `src/client/network/activity_badge_dispatcher.ts`**:
Cập nhật `handleBailBadge`:
```typescript
function handleBailBadge(act: ActivityLogEntry, state: GameState): void {
  const amount = act.amount !== undefined ? -Math.abs(act.amount) : -500;
  const isTimeout = act.message.includes('Hết 3 lượt') || act.message.includes('bắt buộc');
  const formula = isTimeout
    ? 'Hết 3 lượt không ra đôi: Phạt bảo lãnh bắt buộc'
    : 'Bảo lãnh sớm: 10% tài sản ròng (Sàn 500 Tr.)';
  state.addFloatingText({
    text: formatCurrency(amount),
    type: FloatingTextType.Penalty,
    playerId: act.playerId ?? '',
    actionType: 'bail',
    title: isTimeout ? 'Cưỡng chế kiểm toán ➔ Nộp Kho Bạc' : 'Bảo lãnh kiểm toán (Ô 10) ➔ Nộp Kho Bạc',
    cellIndex: act.cellIndex ?? 10,
    formula,
  });
}
```

### 3.4. Layer 4: Tách Submodule `src/client/ui/transaction_formula.ts`
Tạo mới tệp `src/client/ui/transaction_formula.ts` (~100 LOC) để giữ `src/client/ui/transaction_narrative.ts` <= 280 LOC:
```typescript
// [IMP-216] Transaction Formula Descriptor Submodule
import type { FloatingTextItem } from '../store/game_store.js';
import {
  TELECOM_DATA_FEE,
  MIN_BAIL_AMOUNT,
  GO_PROPERTY_TAX_CAP,
} from '../../domain/property_rent.js';

export function resolveFormulaText(
  item: FloatingTextItem,
  cellName: string,
  isPositive: boolean,
): string {
  if (item.formula) return item.formula;

  switch (item.actionType) {
    case 'bail':
      if (item.title?.includes('Hết 3 lượt') || item.title?.includes('bắt buộc') || item.title?.includes('Cưỡng chế')) {
        return 'Hết 3 lượt không ra đôi: Phạt bảo lãnh bắt buộc';
      }
      return `Bảo lãnh sớm: 10% tài sản ròng (Sàn ${MIN_BAIL_AMOUNT} Tr.)`;
    case 'audit_jail':
      if (item.title?.includes('đôi') || item.text === '0 Tr.' || item.text === '+0 Tr.') {
        return 'Gieo xúc xắc đôi: Thoát kiểm toán miễn phí';
      }
      return 'Bị tạm giữ tại Trạm Kiểm Toán';
    case 'tax':
      if (item.cellIndex === 4 || item.title?.includes('Đất Đai')) {
        return 'Lệ phí trước bạ: 10% tiền mặt (Tối đa 2.000 Tr.)';
      }
      if (item.title?.includes('vượt GO') || item.title?.includes('tài sản')) {
        return `Thuế tài sản qua GO (Tối đa ${GO_PROPERTY_TAX_CAP.toLocaleString('vi-VN')} Tr.)`;
      }
      return 'Nộp ngân sách theo quy định Kho Bạc';
    case 'rent_pay':
    case 'rent_receive':
      if (item.cellIndex === 12 || item.title?.includes('EVN') || item.title?.includes('điện')) {
        return 'Hóa đơn tiền điện EVN khi qua ô Khởi Hành';
      }
      if (item.cellIndex === 28 || item.title?.includes('Viettel') || item.title?.includes('viễn thông') || item.title?.includes('data')) {
        return `Cước data viễn thông Viettel (${TELECOM_DATA_FEE} Tr.)`;
      }
      if (item.title?.includes('Độc quyền') || item.title?.includes('x2')) {
        return `Độc quyền nhóm màu (x2 tiền thuê): ${cellName || 'BĐS'}`;
      }
      return cellName ? `Tiền thuê lưu trú tại ${cellName}` : 'Phí thuê mặt bằng';
    case 'salary':
      return 'Hoàn thành 1 vòng: Thưởng lương qua ô Khởi Hành';
    case 'buy':
      return `Đầu tư mua quyền sử dụng đất: ${cellName || 'BĐS'}`;
    case 'upgrade':
      return `Xây dựng phát triển dự án tại ${cellName || 'BĐS'}`;
    case 'mortgage':
      return 'Vay vốn tín dụng ngân hàng (50% giá trị đất)';
    case 'unmortgage':
      return 'Chuộc lại đất thế chấp (Gốc + 10% phí Kho Bạc)';
    case 'diplomatic':
      if (item.title?.includes('Hụt thu') || item.title?.includes('Khách dùng')) {
        return 'Khách dùng Thẻ Ngoại Giao: Hụt thu tiền thuê';
      }
      return 'Đặc quyền ngoại giao: Miễn 100% tiền thuê BĐS';
    case 'auction_win':
      return 'Thắng phiên đấu giá công khai BĐS';
    case 'hose':
      return isPositive ? 'Chi trả cổ tức từ sàn HOSE' : 'Đầu tư mua chứng khoán HOSE';
    case 'stimulus':
      return 'Nhận gói trợ cấp an sinh từ Quỹ Kho Bạc';
    case 'debt_relief':
      return 'Hoàn tất thanh toán nợ: Thoát bờ vực phá sản';
    default:
      return item.title || 'Biến động tài chính theo quy định';
  }
}
```

**Trong `src/client/ui/transaction_narrative.ts`**:
- Mở rộng interface `TransactionNarrative` thêm `readonly formula: string;`.
- Import `resolveFormulaText` từ `./transaction_formula.js`.
- Gọi `const formula = resolveFormulaText(item, cellName, isPositive);` và trả về trong kết quả.

### 3.5. Layer 5: UI Components (`src/client/ui/floating_numbers.tsx`)
1. **Container `FloatingNumbersOverlay`**:
```tsx
<div
  className={
    "fixed " + stackTopClass +
    " left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 w-[calc(100vw-1.5rem)] max-w-sm sm:max-w-md px-1 z-30 pointer-events-none"
  }
>
```

2. **Component `FloatingBadge`**:
Bảo toàn padding `py-1.5 sm:py-2.5` (`TC-194.20`), áp dụng layout 3 tầng và câu văn tự nhiên công thái học:
```tsx
export function FloatingBadge({ item }: { readonly item: FloatingTextItem }): React.ReactElement {
  const isSSR = typeof window === 'undefined';
  const storePlayersInfo = useGameStore((state) => state.playersInfo);
  const playersInfo = isSSR ? useGameStore.getState().playersInfo : storePlayersInfo;
  const storeMyPlayerId = useLobbyStore((state) => state.myPlayerId);
  const myPlayerId = isSSR ? useLobbyStore.getState().myPlayerId : storeMyPlayerId;

  const player = playersInfo[item.playerId];
  const narrative = resolveTransactionNarrative(item, player, playersInfo, myPlayerId);

  const handleDismiss = () => {
    useGameStore.getState().removeFloatingText(item.id);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDismiss();
    }
  };

  return (
    <div
      role="status"
      tabIndex={0}
      aria-label={`${narrative.category}: nhấn để đóng`}
      aria-live="polite"
      data-testid="contextual-transaction-badge"
      onClick={handleDismiss}
      onKeyDown={handleKeyDown}
      className="pointer-events-auto cursor-pointer flex flex-col gap-1 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-2xl border border-slate-300 bg-[#FFFDF8] select-none shadow-md shadow-slate-900/10 active:scale-95 animate-in fade-in duration-200 w-full min-w-0"
    >
      {/* Tầng 1: Header định danh danh mục & nút đóng */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-0.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm shrink-0" aria-hidden="true">{narrative.icon}</span>
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500 truncate">
            {narrative.category}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="text-slate-400 hover:text-slate-700 text-xs font-bold leading-none p-1 cursor-pointer focus-visible:outline-none"
          aria-label="Đóng thông báo"
        >
          ✕
        </button>
      </div>

      {/* Tầng 2 (Dòng 1): Lý do / Công thức rõ nghĩa, súc tích */}
      <div
        data-testid="transaction-formula-line"
        className="text-[11px] sm:text-xs font-medium text-slate-600 text-left leading-tight truncate flex items-center gap-1"
        title={narrative.formula}
      >
        <span className="text-slate-400 text-[10px]" aria-hidden="true">📐</span>
        <span className="truncate">{narrative.formula}</span>
      </div>

      {/* Tầng 3 (Dòng 2): Biến động tài chính & Dòng tiền tự nhiên */}
      <div
        data-testid="transaction-flow-line"
        className="text-xs sm:text-[13px] font-semibold text-slate-800 text-left leading-snug break-words"
        title={item.title}
      >
        <span className="font-bold text-slate-900">{narrative.subject}</span>{' '}
        <span className="text-slate-600 font-medium">{narrative.verb}</span>{' '}
        <span
          data-testid="floating-amount-pill"
          title={item.text}
          className={`px-1.5 py-0.5 rounded-lg text-xs font-extrabold font-mono tabular-nums border inline-block ${
            narrative.isPositive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-rose-50 text-rose-700 border-rose-300'
          }`}
        >
          {item.text}
        </span>{' '}
        <span className="font-bold text-slate-800">{narrative.target}</span>
      </div>
    </div>
  );
}
```

### 3.6. Layer 6: Reconcile Specification Evolution
Cập nhật assertions trong các file kiểm thử cũ theo quy tắc tiến hóa giao diện:
1. `tests/contracts/imp194_natural_narrative_floating_badges.test.ts`:
   - `TC-194.17`: Thay thế kiểm tra `max-w-[82vw]` thành kiểm tra sự hiện diện của `data-testid="transaction-formula-line"`.
   - `TC-194.18`: Do đã tách module `src/client/ui/transaction_formula.ts`, `transaction_narrative.ts` vẫn duy trì ~265 LOC <= 280 LOC, assertion được bảo toàn xanh 100%.
2. `tests/contracts/imp193_mobile_ergonomics_auction_and_copy_polish.test.ts`:
   - `TC-193.04`: Cập nhật container `FloatingBadge` từ `max-w-[82vw]` thành `w-full min-w-0`.
   - `TC-193.05`: Cập nhật regex selector container từ `left-3` sang pattern `fixed.*top-` và assert `w-[calc(100vw-1.5rem)]`.

---

## 4. KẾ HOẠCH BÀN GIAO 3 TRẠM (STATION EXECUTION)

1. **Station 1 (RED Contract Test)**: `qa-tester` tạo `tests/contracts/imp216_financial_notification_formula_and_badge.test.ts` gồm 16 atomic tests thuần túy kiểm tra runtime contract (zero checklist static tests) và chứng minh FAIL.
2. **Station 2 (GREEN Implementation)**: `implementer` cập nhật mã nguồn theo đúng các drop-in snippets ở Mục 3, chuyển 16 tests sang PASS, bảo đảm 100% test suites hiện hữu không bị hồi quy.
3. **Station 2.5 (Sweeping Scout Audit)**: `scout` rà quét toàn diện các file vật lý đối chiếu 5 universal defect archetypes.
4. **Station 3 (Independent Review)**: `spec-reviewer`, `code-reviewer`, `ui-craft-reviewer` kiểm tra độc lập và phê duyệt.
5. Thu thập bằng chứng nghiệm thu (`scripts/collect_evidence.mjs`) và cập nhật Epic Ledger.
