# KẾ HOẠCH TRIỂN KHAI [HARDENED REVISION v5]: ACTIONABLE IN-GAME FEEDBACK & DEEP CONTEXTUAL MESSAGES SYSTEM (IMP-225)

> **Mã Ticket**: IMP-225  
> **Tiêu Đề**: Actionable In-Game Feedback & Deep Contextual Messages System (Nâng Cấp Toàn Diện Hệ Thống Phản Hồi Ngữ Cảnh, Chống Silent Intent Rejection, Công Thái Học Di Động & Checklist Trái Phiếu Trực Quan).  
> **Phân Hạng**: **Tier 2 (Full Rigor)** — Network Intent Rejection Wire Gate, Universal Toast Guidance, Mobile Touch Micro-Affordance, Bond Eligibility Checklist, Subcomponent Extraction LOC Safety.  
> **Tiêu Chuẩn Thực Thi**: GEMINI.md Harness, TDD Detroit Classical (Universal 5-Facet Matrix, 16 atomic tests), Deep Modules, Zero `as any`, Ngân Sách LOC Nghiêm Ngặt.

---

## 1. BỐI CẢNH & PHÂN TÍCH NGUYÊN NHÂN CỐT LÕI (ROOT CAUSE & AUDIT RECONCILIATION)

### 1.1. Báo Cáo Sự Cố Thực Tế Từ Người Chơi
Trong trận đấu phòng `VTJ4U5`, người chơi gặp 2 sự cố gây khó hiểu:
1. **Không thể thế chấp đất**: Các ô đất Bình Dương, Đồng Nai, Vũng Tàu đã được xây dựng lên Cấp 3 (C3), trong khi luật trò chơi quy định phải hạ cấp/dỡ hết công trình về Cấp 0 mới được thế chấp quyền sử dụng đất. Nút Thế Chấp bị disabled mang nhãn `'Cần Hạ Cấp'`, nhưng trên thiết bị di động không có tooltip hover, không có ghi chú phụ giải thích tại sao bị chặn.
2. **Không thể phát hành trái phiếu**: Tab Trái Phiếu Doanh Nghiệp chỉ có một dòng chữ nhỏ báo "Chưa đủ điều kiện phát hành" chung chung, không có bảng tiêu chí trực quan hiển thị cụ thể xem người chơi đang thiếu Net Worth, thiếu BĐS sạch, hay đang ngoài lượt chơi.

### 1.2. Khắc Phục Toàn Diện 100% Các Điểm Phản Biện (C1 - C4)
1. **[C1 - Bot Filter Logic Type-Safety]**:
   - `network_types.ts#L107-L115` quy định: message `ERROR` không có `playerId`, còn `INTENT_REJECTED` có `playerId?: string`.
   - Thay vì fallback mù quáng về `ctx.playerId`, áp dụng guard chuẩn xác:
     ```typescript
     if (msg.type === 'INTENT_REJECTED' && msg.playerId !== undefined) {
       const myPlayerId = useLobbyStore.getState().myPlayerId || ctx.playerId;
       if (msg.playerId !== myPlayerId) return;
     }
     ```
   - Đảm bảo khi Bot bị reject kèm `playerId` của Bot, toast lỗi tuyệt đối không nhảy lên màn hình người chơi local.
2. **[C2 - Module-Level Singleton Flaky Test Isolation]**:
   - Bắt buộc bộ test Station 1 phải có `beforeEach(() => { resetWsErrorThrottle(); })` trước mỗi ca test để làm sạch `lastErrorTimeMap`, triệt tiêu 100% rủi ro state leak giữa các atomic tests trong Vitest.
3. **[C3 - Tọa Độ JSX Checklist Chính Xác Tuyệt Đối]**:
   - Tọa độ đĩa cứng vật lý chuẩn tại `src/client/ui/modals/bond_issuance_tab.tsx`:
     - **L64 - L75**: Đồng bộ hóa `canIssue` và `blockedReason` với `isTurnValid = Boolean(isMyTurn || isInInsolvency)`.
     - **L130 - L134**: Thay thế chính xác thẻ `<ul>...</ul>` tĩnh (chứa 3 gạch đầu dòng cũ) bằng cụm Checklist 3 tiêu chí trực quan.
4. **[C4 - Thay Thế Test Tautological [TC-225.16]]**:
   - Loại bỏ hoàn toàn mô tả tautological checklist test ("Tất cả suite kế thừa pass").
   - Thay bằng test hành vi hợp đồng thực tế: Kiểm tra thẻ `<button>` trong `PropertyCardActions` render đầy đủ class `col-span-2` cho nút Thế Chấp và `col-span-1` cho nút Hạ Cấp theo đúng regex của hợp đồng IMP-208.

---

## 2. KIẾN TRÚC HỆ THỐNG PHẢN HỒI (SYSTEM ARCHITECTURE)

```
[Server Intent Rejection]
  Server từ chối intent ➔ Gửi WsServerMessage: { type: 'INTENT_REJECTED', reasonCode: '...', playerId: '...' }
           │
           ▼
[ws_message_handler.ts]
  ├── [Guard C1]: msg.type === 'INTENT_REJECTED' && msg.playerId !== undefined && msg.playerId !== myPlayerId ➔ Bỏ qua lỗi Bot
  ├── [Throttle]: Date.now() - lastErrorTime > 1500ms (Chống spam click)
  ├── [Bảo Toàn]: Floating text cho TradeFrozen & LIQUIDITY_FROZEN (IMP-128)
  └── ctx.onError(reasonCode)
           │
           ▼
[use_app_session.ts ➔ handleSessionServerError]
  ├── formatServerErrorMessage(reasonCode)
  │     ➔ Ghép: "${notif.title}: ${notif.description} 👉 ${notif.actionHint}"
  └── setErrorMessage(formattedText)
           │
           ▼
[ServerToast (z-50) trên main.tsx]
  Hiển thị banner nổi phía trên tất cả Modals & Canvas 3D (Tự tắt sau 6s)

[Danh Mục BĐS: property_card_actions.tsx (Subcomponent mới trích xuất)]
  ├── Nút Thế Chấp C1-C3: Label "Cần Hạ Cấp" + Hint "⚠️ Phải hạ cấp hết nhà về Cấp 0 trước khi thế chấp"
  ├── BĐS Đã Thế Chấp: Huy hiệu "🔒 ĐÃ THẾ CHẤP" + Nút Giải Chấp
  └── Nút Hạ Cấp (khi bị chặn): Hint lý do dỡ nhà đều tay (Even Downgrading)

[Tab Trái Phiếu: bond_issuance_tab.tsx]
  └── Checklist 3 Tiêu Chí Đồng Bộ:
        ✓/✗ Tài sản ròng (Net Worth) ≥ 3.000: [Giá trị thực tế] / 3.000
        ✓/✗ BĐS sạch chưa thế chấp ≥ 2 ô: [Số lượng thực tế] / 2
        ✓/✗ Lượt chơi hợp lệ: Trong lượt của bạn hoặc đang giải cứu nợ (Insolvency)
```

---

## 3. ĐO LƯỜNG NGÂN SÁCH LOC (CHÍNH XÁC 100% ĐĨA CỨNG)

| Tệp Vật Lý | Phân Loại Tier | LOC Hiện Tại | Delta Dự Kiến | LOC Sau Cùng | Đánh Giá Ngân Sách |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/network/ws_message_handler.ts` | Tier 1 (Logic/Net) | **166** | +18 | **184** | ✔️ An toàn ($\le 400$ LOC) |
| `src/client/ui/actionable_notification.ts` | Tier 2 (UI/Views) | **357** | +15 | **372** | ✔️ An toàn ($\le 500$ LOC) |
| `src/client/ui/modals/portfolio_monopoly_analytics.ts` | Tier 2 (UI/Views) | **215** | +12 | **227** | ✔️ An toàn ($\le 500$ LOC) |
| `src/client/ui/modals/property_card_actions.tsx` | Tier 2 (UI Subcomponent) | **0** (Mới) | +95 | **95** | ✔️ An toàn ($\le 500$ LOC) |
| `src/client/ui/modals/property_portfolio_modal.tsx` | Tier 2 (UI Modal) | **472** | -85 | **387** | ✔️ An toàn ($\le 500$ LOC) |
| `src/client/ui/modals/bond_issuance_tab.tsx` | Tier 2 (UI/Views) | **179** | +30 | **209** | ✔️ An toàn ($\le 500$ LOC) |
| `tests/client/actionable_feedback_and_messaging.test.ts` | Test Suite | 0 | +240 | **240** | ✔️ An toàn ($\le 600$ LOC) |

---

## 4. MA TRẬN KIỂM THỬ HỢP ĐỒNG 5 MẶT (16 ATOMIC TESTS — STATION 1)

**Tệp kiểm thử**: [`tests/client/actionable_feedback_and_messaging.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/actionable_feedback_and_messaging.test.ts)  
**Quy tắc cô lập trạng thái (C2 Isolation Mandate)**:
```typescript
beforeEach(() => {
  resetWsErrorThrottle();
});
```

### Facet 1: Server Intent Rejection Wire & Format Message ([TC-225.01] - [TC-225.04])
- `[TC-225.01/MSS][UC-IMP225]` `formatServerErrorMessage('HAS_BUILDING')` trả về chuỗi chứa đầy đủ tiêu đề, mô tả và hướng dẫn hành động (`actionHint`).
- `[TC-225.02/MSS][UC-IMP225]` `formatServerErrorMessage('BOND_NOT_ELIGIBLE')` trả về hướng dẫn chi tiết về Net Worth 3.000 và 2 BĐS sạch.
- `[TC-225.03/MSS][UC-IMP225]` `formatServerErrorMessage('ALREADY_MORTGAGED')` trả về thông báo BĐS đã thế chấp và hướng dẫn chuộc lại.
- `[TC-225.04/MSS][UC-IMP225]` `formatServerErrorMessage('NOT_YOUR_TURN')` và `'INVALID_PHASE'` trả về hướng dẫn giai đoạn lượt chơi rõ ràng.

### Facet 2: Chống Ô Nhiễm Lỗi Của Bot & Throttle Anti-Spam ([TC-225.05] - [TC-225.07])
- `[TC-225.05/MSS][UC-IMP225]` `handleWsError` với `msg.type === 'INTENT_REJECTED'` và `msg.playerId === 'bot_1'` khác `myPlayerId` $\rightarrow$ Không kích hoạt `ctx.onError`, không hiển thị toast nhầm cho người chơi local (Guard C1).
- `[TC-225.06/MSS][UC-IMP225]` `handleWsError` với `msg.type === 'ERROR'` (không có `playerId`) hoặc `msg.playerId === myPlayerId` $\rightarrow$ Kích hoạt `ctx.onError` chuẩn xác.
- `[TC-225.07/MSS][UC-IMP225]` Gọi `handleWsError` liên tục với cùng `reasonCode` trong vòng 1500ms $\rightarrow$ Chỉ kích hoạt `ctx.onError` 1 lần (Throttle Anti-Spam cô lập qua `beforeEach`).

### Facet 3: Gợi Ý Trực Quan Nút Thế Chấp & Dỡ Nhà ([TC-225.08] - [TC-225.10])
- `[TC-225.08/MSS][UC-IMP225]` Ô đất cấp C1–C3 $\rightarrow$ `resolvePropertyCardActionState` trả về `mortgageButtonLabel: 'Cần Hạ Cấp'` (bảo toàn IMP-208) và `mortgageSubHint: 'Phải hạ cấp hết nhà về Cấp 0 trước khi thế chấp'`.
- `[TC-225.09/MSS][UC-IMP225]` Ô đất đã thế chấp $\rightarrow$ Trả về `canMortgage: false`, `mortgageBlockedReason: 'Bất động sản đã được thế chấp'`.
- `[TC-225.10/MSS][UC-IMP225]` Ô đất vi phạm quy tắc dỡ nhà đều tay (Even Downgrading) $\rightarrow$ Trả về `canDowngrade: false` và `downgradeBlockedReason` giải thích rõ ô nào cần dỡ trước.

### Facet 4: Checklist Điều Kiện Phát Hành Trái Phiếu Đồng Bộ ([TC-225.11] - [TC-225.13])
- `[TC-225.11/MSS][UC-IMP225]` `playerNetWorth < 3000` $\rightarrow$ Checklist trả về trạng thái thiếu Net Worth, format đúng số tiền hiện có.
- `[TC-225.12/MSS][UC-IMP225]` `unmortgagedPropertiesCount < 2` $\rightarrow$ Checklist trả về trạng thái thiếu BĐS sạch (< 2 BĐS).
- `[TC-225.13/MSS][UC-IMP225]` Đủ 3 điều kiện trong lượt hoặc trong pha giải cứu nợ (`isInInsolvency = true`) $\rightarrow$ Cả 3 tiêu chí đạt (✓), `canIssue === true`, `blockedReason === undefined`, nút phát hành active.

### Facet 5: Phòng Vệ Ngoại Lệ & Hợp Đồng Giao Diện ([TC-225.14] - [TC-225.16])
- `[TC-225.14/MSS][UC-IMP225]` Gọi `formatServerErrorMessage` với mã lỗi lạ hoặc `null/undefined` $\rightarrow$ Fallback an toàn về thông báo chung, không ném ngoại lệ.
- `[TC-225.15/MSS][UC-IMP225]` `PropertyCardActions` render đầy đủ `mortgageSubHint` dưới nút thế chấp khi `canMortgage === false`, bảo toàn nhãn `'Sổ Đỏ ↗'`.
- `[TC-225.16/MSS][UC-IMP225]` Thẻ `<button>` của nút Thế Chấp sở hữu class `col-span-2` và nút Hạ Cấp sở hữu class `col-span-1` khi `level > 0 && !isMort && onDowngrade` (bảo vệ hợp đồng regex của IMP-208, thay thế tautological assertion cũ).

---

## 5. ĐOẠN MÃ THAY THẾ CHÍNH XÁC (EXACT DROP-IN SNIPPETS)

### Snippet 5.1: `src/client/ui/actionable_notification.ts`
Nâng cấp `formatServerErrorMessage` để cung cấp cả Tiêu Đề, Mô Tả và Hướng Dẫn Hành Động:
```typescript
export function formatServerErrorMessage(reasonCode?: string | null): string {
  if (!reasonCode || typeof reasonCode !== 'string') {
    return 'Hướng dẫn trò chơi: Thao tác tạm thời chưa thể thực hiện. Vui lòng kiểm tra lại tình trạng lượt chơi!';
  }
  const match = ACTIONABLE_NOTIFICATIONS_MAP[reasonCode];
  if (!match) {
    return `Hướng dẫn trò chơi: Thao tác tạm thời chưa thể thực hiện (${reasonCode}). Vui lòng kiểm tra lại tình trạng lượt chơi!`;
  }
  if (match.actionHint) {
    return `${match.title}: ${match.description} 👉 ${match.actionHint}`;
  }
  return `${match.title}: ${match.description}`;
}
```

### Snippet 5.2: `src/client/network/ws_message_handler.ts`
Thêm bộ lọc Bot Error (C1 Guard) và Throttle Anti-Spam (tận dụng `useLobbyStore` có sẵn từ L8):
```typescript
const lastErrorTimeMap = new Map<string, number>();
const ERROR_THROTTLE_MS = 1500;

export function resetWsErrorThrottle(): void {
  lastErrorTimeMap.clear();
}

function handleWsError(
  msg: Extract<WsServerMessage, { type: 'ERROR' | 'INTENT_REJECTED' }>,
  ctx: WsMessageHandlerContext
): void {
  // 1. Giữ nguyên toàn bộ logic xử lý token / room_started hiện tại (L86 - L112)
  if (msg.type === 'ERROR' && (msg.reasonCode === 'TOKEN_INVALID' || msg.reasonCode === 'TOKEN_EXPIRED' || (msg.reasonCode === 'ROOM_NOT_FOUND' && ctx.isHost))) {
    clearReconnectToken(ctx.roomCode);
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const isExplicitGuest = Boolean(params?.has('room')) && params?.get('host') !== 'true';
    const isHost = ctx.isHost !== undefined ? ctx.isHost : !isExplicitGuest;
    const fallbackMsg: WsClientMessage = isHost
      ? { type: 'CREATE_ROOM', roomCode: ctx.roomCode, playerId: ctx.playerId }
      : { type: 'JOIN_ROOM', roomCode: ctx.roomCode, playerId: ctx.playerId };
    try {
      ctx.socket.send(JSON.stringify(fallbackMsg));
    } catch {
      /* safe-ignore: socket may be closing */
    }
  }
  if (msg.reasonCode === 'ROOM_STARTED') {
    ctx.onRoomStarted?.();
    try {
      const resyncMsg: WsClientMessage = {
        type: 'INTENT_REQUEST_RESYNC',
        roomCode: ctx.roomCode,
        playerId: ctx.playerId,
      };
      ctx.socket.send(JSON.stringify(resyncMsg));
    } catch {
      /* safe-ignore: socket may be disconnected or buffered */
    }
  }

  // 2. Chặn lỗi của Bot (C1 Guard): Chỉ lọc khi msg.type === 'INTENT_REJECTED' && msg.playerId !== undefined
  if (msg.type === 'INTENT_REJECTED' && msg.playerId !== undefined) {
    const myPlayerId = useLobbyStore.getState().myPlayerId || ctx.playerId;
    if (msg.playerId !== myPlayerId) {
      return;
    }
  }

  // 3. Throttle chống spam click liên tục
  const now = Date.now();
  const lastTime = lastErrorTimeMap.get(msg.reasonCode) ?? 0;
  if (now - lastTime < ERROR_THROTTLE_MS) {
    return;
  }
  lastErrorTimeMap.set(msg.reasonCode, now);

  // 4. Bảo toàn thông báo nổi đóng băng thị trường (IMP-128)
  if (msg.reasonCode === 'TradeFrozen' || msg.reasonCode === 'FREEZE_ACTIVE') {
    useGameStore.getState().addFloatingText({
      playerId: ctx.playerId,
      text: 'Thị trường đang đóng băng: Tạm ngưng mua bán, thế chấp & chuyển nhượng!',
      type: FloatingTextType.Penalty,
      title: '❄️ Đóng Băng Giao Dịch',
    });
  }
  if (msg.reasonCode === 'LIQUIDITY_FROZEN') {
    useGameStore.getState().addFloatingText({
      playerId: ctx.playerId,
      text: 'Bất động sản đang trong chu kỳ đóng băng thanh khoản, không thể thế chấp!',
      type: FloatingTextType.Penalty,
      title: '🧊 Đóng Băng Thanh Khoản',
    });
  }

  ctx.setErrorReason?.(msg.reasonCode);
  ctx.onError?.(msg.reasonCode);
}
```

### Snippet 5.3: `src/client/ui/modals/portfolio_monopoly_analytics.ts`
Thêm `mortgageSubHint` bảo toàn hợp đồng IMP-208 và trả về đầy đủ object:
```typescript
export interface PropertyCardActionState {
  readonly canMortgage: boolean;
  readonly mortgageBlockedReason?: string;
  readonly mortgageButtonLabel: string;
  readonly mortgageSubHint?: string;
  readonly canDowngrade: boolean;
  readonly downgradeBlockedReason?: string;
}

// Trong resolvePropertyCardActionState:
  let canMortgage = false;
  let mortgageBlockedReason: string | undefined = undefined;
  let mortgageButtonLabel = 'Thế Chấp';
  let mortgageSubHint: string | undefined = undefined;

  if (isMortgaged) {
    canMortgage = false;
    mortgageBlockedReason = 'Bất động sản đã được thế chấp';
    mortgageButtonLabel = 'Thế Chấp';
    mortgageSubHint = 'Cần chuộc nợ để khôi phục quyền thế chấp';
  } else if (level > 0) {
    canMortgage = false;
    mortgageBlockedReason = 'Phải hạ cấp hết nhà về Cấp 0 trước khi thế chấp';
    mortgageButtonLabel = 'Cần Hạ Cấp'; // BẢO TOÀN HỢP ĐỒNG IMP-208!
    mortgageSubHint = 'Phải hạ cấp hết nhà về Cấp 0 trước khi thế chấp';
  } else if (isLiquidityFrozen) {
    canMortgage = false;
    mortgageBlockedReason = 'Bất động sản đang bị đóng băng thanh khoản';
    mortgageButtonLabel = 'Đóng Băng';
    mortgageSubHint = 'Đang trong chu kỳ đóng băng thanh khoản';
  } else if (isTradeFrozen) {
    canMortgage = false;
    mortgageBlockedReason = 'Thị trường đang đóng băng giao dịch & thế chấp';
    mortgageButtonLabel = 'Đóng Băng';
    mortgageSubHint = 'Thị trường đang đóng băng giao dịch & thế chấp';
  } else {
    canMortgage = true;
  }

  // ... (khối 2 phân giải Hạ Cấp giữ nguyên)

  return {
    canMortgage,
    mortgageBlockedReason,
    mortgageButtonLabel,
    mortgageSubHint,
    canDowngrade,
    downgradeBlockedReason,
  };
```

### Snippet 5.4: Tạo mới `src/client/ui/modals/property_card_actions.tsx`
Tách toàn bộ cụm nút hành động ra subcomponent độc lập (~95 LOC), bảo toàn `col-span-2` và `col-span-1` trên `<button>`:
```tsx
import React from 'react';
import { formatCurrency } from '../ui_helpers';
import type { PropertyCardActionState } from './portfolio_monopoly_analytics';

export interface PropertyCardActionsProps {
  readonly cellIndex: number;
  readonly level: number;
  readonly isMort: boolean;
  readonly mortgageVal: number;
  readonly redeemCost: number;
  readonly currentBalance: number;
  readonly actionState: PropertyCardActionState;
  readonly upgradeInfo?: {
    readonly canUpgrade: boolean;
    readonly nextLevel?: number;
    readonly upgradeCost?: number;
    readonly blockedReason?: string;
    readonly reason?: string;
  };
  readonly onUpgrade?: (cellIndex: number) => void;
  readonly onMortgage?: (cellIndex: number) => void;
  readonly onRedeem?: (cellIndex: number) => void;
  readonly onDowngrade?: (cellIndex: number) => void;
  readonly onSelectDeed?: (cellIndex: number) => void;
}

export function PropertyCardActions({
  cellIndex,
  level,
  isMort,
  mortgageVal,
  redeemCost,
  currentBalance,
  actionState,
  upgradeInfo,
  onUpgrade,
  onMortgage,
  onRedeem,
  onDowngrade,
  onSelectDeed,
}: PropertyCardActionsProps): React.ReactElement {
  return (
    <div className="space-y-2">
      {/* Cụm Nút Nâng Cấp Nhanh 1-Click */}
      {upgradeInfo && !isMort && (
        <div className="my-2">
          <button
            type="button"
            data-testid="property-quick-build-btn"
            disabled={!upgradeInfo.canUpgrade}
            title={upgradeInfo.blockedReason ?? upgradeInfo.reason}
            onClick={() => upgradeInfo.canUpgrade && onUpgrade?.(cellIndex)}
            className={`w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              upgradeInfo.canUpgrade
                ? 'bg-amber-400 hover:bg-amber-300 text-amber-950 border-2 border-amber-600 shadow-[0_3px_0_0_#d97706] active:translate-y-[2px] cursor-pointer'
                : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-70'
            }`}
          >
            <span>
              {upgradeInfo.canUpgrade
                ? `🏗️ Xây C${upgradeInfo.nextLevel} (${formatCurrency(upgradeInfo.upgradeCost ?? 0)})`
                : (level >= 3 ? 'Cấp Tối Đa' : `🏗️ Xây C${upgradeInfo.nextLevel ?? (level + 1)}`)}
            </span>
          </button>
          {!upgradeInfo.canUpgrade && (upgradeInfo.blockedReason ?? upgradeInfo.reason) && (
            <span className="text-[11px] text-slate-500 italic mt-1 block text-center truncate" title={upgradeInfo.blockedReason ?? upgradeInfo.reason}>
              {upgradeInfo.blockedReason ?? upgradeInfo.reason}
            </span>
          )}
        </div>
      )}

      {/* Cụm Nút Thế Chấp / Giải Chấp / Hạ Cấp */}
      <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-1.5 text-xs">
        {!isMort && (
          <div className="col-span-2 space-y-1">
            <button
              type="button"
              data-testid={`mortgage-btn-${cellIndex}`}
              onClick={() => actionState.canMortgage && onMortgage?.(cellIndex)}
              disabled={!actionState.canMortgage}
              title={actionState.mortgageBlockedReason}
              className={`col-span-2 w-full min-h-[44px] px-3 py-2 font-bold rounded-lg border-2 text-xs transition-all inline-flex items-center justify-center ${
                actionState.canMortgage
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300 shadow-[0_2px_0_0_#fecdd3] active:translate-y-[1px] cursor-pointer'
                  : 'bg-slate-100 text-slate-400 border-slate-200 shadow-none cursor-not-allowed opacity-75'
              }`}
            >
              {actionState.canMortgage
                ? `Thế Chấp (+${formatCurrency(mortgageVal)})`
                : `${actionState.mortgageButtonLabel} (+${formatCurrency(mortgageVal)})`}
            </button>
            {!actionState.canMortgage && (actionState.mortgageSubHint ?? actionState.mortgageBlockedReason) && (
              <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1 block text-center font-medium">
                ⚠️ {actionState.mortgageSubHint ?? actionState.mortgageBlockedReason}
              </span>
            )}
          </div>
        )}

        {isMort && (
          <button
            type="button"
            data-testid={`redeem-btn-${cellIndex}`}
            onClick={() => onRedeem?.(cellIndex)}
            disabled={currentBalance < redeemCost}
            className="col-span-2 min-h-[44px] px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg border-2 border-emerald-800 shadow-[0_3px_0_0_#065f46] active:translate-y-[2px] transition-all text-xs cursor-pointer disabled:cursor-not-allowed disabled:shadow-none inline-flex items-center justify-center"
          >
            Giải Chấp (-{formatCurrency(redeemCost)})
          </button>
        )}

        {level > 0 && !isMort && onDowngrade && (
          <div className="col-span-1 space-y-1">
            <button
              type="button"
              data-testid={`downgrade-btn-${cellIndex}`}
              onClick={() => actionState.canDowngrade && onDowngrade(cellIndex)}
              disabled={!actionState.canDowngrade}
              title={actionState.downgradeBlockedReason}
              className={`col-span-1 w-full min-h-[44px] px-3 py-2 font-bold rounded-lg border-2 text-xs transition-all inline-flex items-center justify-center ${
                actionState.canDowngrade
                  ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 border-rose-300 shadow-[0_2px_0_0_#fecdd3] active:translate-y-[1px] cursor-pointer'
                  : 'bg-slate-100 text-slate-400 border-slate-200 shadow-none cursor-not-allowed opacity-75'
              }`}
            >
              Hạ Cấp
            </button>
            {!actionState.canDowngrade && actionState.downgradeBlockedReason && (
              <span className="text-[10px] text-slate-500 italic block text-center truncate" title={actionState.downgradeBlockedReason}>
                {actionState.downgradeBlockedReason}
              </span>
            )}
          </div>
        )}

        {onSelectDeed && (
          <button
            type="button"
            onClick={() => onSelectDeed(cellIndex)}
            className={`${level > 0 && !isMort && onDowngrade ? 'col-span-1' : 'col-span-2'} min-h-[44px] px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg border-2 border-slate-300 shadow-[0_2px_0_0_#cbd5e1] active:shadow-none active:translate-y-[1px] text-xs cursor-pointer inline-flex items-center justify-center`}
          >
            Sổ Đỏ ↗
          </button>
        )}
      </div>
    </div>
  );
}
```

### Snippet 5.5: Thay thế trong `src/client/ui/modals/property_portfolio_modal.tsx`
Import và gọi `PropertyCardActions`, thay thế chính xác khối **L368 - L459**:
```tsx
import { PropertyCardActions } from './property_card_actions';

// Thay thế chính xác khối L368 - L459 bằng:
                  <PropertyCardActions
                    cellIndex={cellIndex}
                    level={level}
                    isMort={isMort}
                    mortgageVal={mortgageVal}
                    redeemCost={redeemCost}
                    currentBalance={currentBalance}
                    actionState={actionState}
                    upgradeInfo={deed?.upgradeCosts ? upgradeInfo : undefined}
                    onUpgrade={onUpgrade}
                    onMortgage={onMortgage}
                    onRedeem={onRedeem}
                    onDowngrade={onDowngrade}
                    onSelectDeed={onSelectDeed}
                  />
```

### Snippet 5.6: `src/client/ui/modals/bond_issuance_tab.tsx`
Tọa độ chính xác tại `bond_issuance_tab.tsx`:
1. **L64 - L75**: Cập nhật logic `canIssue`, `blockedReason` đồng bộ với Insolvency:
```tsx
  const hasNetWorth = playerNetWorth >= 3000;
  const hasEnoughDeeds = unmortgagedPropertiesCount >= 2;
  const isTurnValid = Boolean(isMyTurn || isInInsolvency);
  const canIssue = isTurnValid && hasNetWorth && hasEnoughDeeds;

  const blockedReason = !isTurnValid
    ? 'Chỉ có thể phát hành trong lượt của bạn hoặc khi giải cứu nợ'
    : !hasNetWorth
    ? 'Cần tối thiểu 3.000 Net Worth để phát hành trái phiếu'
    : !hasEnoughDeeds
    ? 'Cần sở hữu ít nhất 2 Bất Động Sản chưa thế chấp'
    : undefined;
```
2. **L130 - L134**: Thay thế cụm gạch đầu dòng tĩnh `<ul>...</ul>` bằng Checklist 3 tiêu chí chuẩn UTF-8:
```tsx
      {/* Checklist 3 Điều Kiện Phát Hành Trực Quan (Thay thế L130 - L134) */}
      <div className="p-3 bg-white/90 rounded-xl border border-amber-200 space-y-2">
        <h5 className="font-bold text-[11px] text-slate-700 uppercase tracking-wider">Điều Kiện Phát Hành Trái Phiếu</h5>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="shrink-0">{hasNetWorth ? '✔️' : '❌'}</span>
              <span className={`truncate ${hasNetWorth ? 'text-slate-800 font-medium' : 'text-rose-700 font-bold'}`}>
                Tài sản ròng (Net Worth) ≥ 3.000
              </span>
            </span>
            <span className="font-mono text-slate-600 shrink-0">{formatCurrency(playerNetWorth)}</span>
          </div>
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="shrink-0">{hasEnoughDeeds ? '✔️' : '❌'}</span>
              <span className={`truncate ${hasEnoughDeeds ? 'text-slate-800 font-medium' : 'text-rose-700 font-bold'}`}>
                BĐS sạch chưa thế chấp ≥ 2 ô
              </span>
            </span>
            <span className="font-mono text-slate-600 shrink-0">{unmortgagedPropertiesCount} / 2</span>
          </div>
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="shrink-0">{isTurnValid ? '✔️' : '❌'}</span>
              <span className={`truncate ${isTurnValid ? 'text-slate-800 font-medium' : 'text-rose-700 font-bold'}`}>
                Trong lượt hoặc giải cứu nợ
              </span>
            </span>
            <span className={`font-semibold shrink-0 ${isTurnValid ? 'text-emerald-700' : 'text-slate-500'}`}>
              {isTurnValid ? 'Hợp lệ' : 'Ngoài lượt'}
            </span>
          </div>
        </div>
      </div>
```

---

## 6. QUY TRÌNH 3 TRẠM TỰ HÀNH (3-STATION PIPELINE)

1. **Station 1 (RED Contract Test)**: `qa-tester` tạo `tests/client/actionable_feedback_and_messaging.test.ts` gồm 16 atomic tests theo 5 Facets. Bắt buộc có `beforeEach(() => resetWsErrorThrottle())`. Chạy kiểm chứng Adversarial Inversion (RED). Tuyệt đối cấm sửa `src/**`.
2. **Station 2 (GREEN Implementation)**: `implementer` trích xuất `property_card_actions.tsx`, cập nhật `property_portfolio_modal.tsx`, `ws_message_handler.ts`, `actionable_notification.ts`, `portfolio_monopoly_analytics.ts`, và `bond_issuance_tab.tsx`. Đưa 16 tests mới và 100% tests kế thừa về GREEN.
3. **Station 2.5 (Sweeping Scout Audit)**: `scout` quét 5 nguyên mẫu lỗi, đối chiếu số liệu đĩa thực tế từ `npm run check:loc`.
4. **Station 3 (Independent Reviews)**: Thẩm định độc lập song song bởi `spec-reviewer`, `code-reviewer`, và `ui-craft-reviewer` trước khi bàn giao.
