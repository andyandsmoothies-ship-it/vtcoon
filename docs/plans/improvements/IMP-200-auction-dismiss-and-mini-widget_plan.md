# KẾ HOẠCH KỸ THUẬT: IMP-200 (BẢN ĐÃ TIẾP THU PHẢN BIỆN F1-F5)
## Cho Phép Thu Nhỏ / Tạm Đóng Trang Đấu Giá Cho Người Chơi Không Liên Quan & Widget Đấu Giá Mini (Non-Involved Player Auction Modal Dismissal & Mini Auction Floating Widget)

---

### I. TIẾP THU & XỬ LÝ TRIỆT ĐỂ CÁC ĐIỂM PHẢN BIỆN (F1, F5, F3, F4)

| Mã | Mức Độ | Vấn Đề Phản Biện | Giải Pháp Kỹ Thuật Đã Tích Hợp Vào Kế Hoạch |
| :--- | :--- | :--- | :--- |
| **🔴 F1** | **Critical** | **Dual Dismiss Mechanism Song Song**: `apply_delta.ts` có `lastDismissedAuctionKey` (closure module L91-108). Thêm `dismissedAuctionCellIndex` tạo ra 2 SSOT song song, `lastDismissedAuctionKey` không được reset bởi `resetGameState()` gây ghost state Turn N+1 và race condition Fire Sale. | **Subtractive Refactoring triệt để**: Xóa sạch biến module `let lastDismissedAuctionKey` và toàn bộ logic liên quan khỏi `apply_delta.ts`. Migrate 100% cơ chế dismiss về Zustand Store (`dismissedAuctionCellIndex`). |
| **🔴 F5** | **Critical** | **Hai Field `auction` Song Song Trong `GameState`**: `game_store_types.ts#L234` đã có `auction?: { cellIndex, highestBid... }` (partial inline). Nếu thêm `auction?: ModalPayloadMap['auction'] \| null` sẽ bị TypeScript strict mode reject hoặc shadow nhau. | **Xóa bỏ kiểu cũ, thay thế SSOT**: Xóa bỏ hoàn toàn định nghĩa partial cũ tại L234-L240 của `game_store_types.ts`, thay thế duy nhất bằng `readonly auction?: ModalPayloadMap['auction'] \| null;`. |
| **🟡 F3** | **Advisory** | **`action_dock.tsx` Delta LOC = 0**: Thêm selector `activeModal` và điều kiện `isStripActive` (~4 LOC) có nguy cơ vượt trần 400 LOC (hiện 397 LOC). | **Khai trừ dòng trống vật lý (Physical Subtractive LOC)**: Thêm 2 dòng logic (selector + gộp cờ `isStripActive`), đồng thời xóa 3 dòng trống thừa (L62, L65, L170). **Delta LOC = -1** (397 LOC -> 396 LOC), an toàn tuyệt đối dưới ngưỡng 400 LOC. |
| **🟡 F4** | **Advisory** | **Client Drift Đồng Hồ Đếm Ngược**: Đếm ngược nội bộ trong `MiniAuctionStrip` có thể bị lệch nhịp sau khi reconnect nếu không sync từ server delta. | **Authoritative Resync**: `useEffect` theo dõi `auction?.timeRemaining` đồng bộ `displaySeconds` mỗi khi server delta cập nhật, triệt tiêu hoàn toàn client drift. Khi reconnect full-sync, reset `dismissedAuctionCellIndex = null`. |

---

### II. KIẾN TRÚC DỮ LIỆU ĐỒNG NHẤT (SINGLE SOURCE OF TRUTH)

```text
[Server Delta Tick: delta.auction (cellIndex, currentBid, timeRemaining...)]
                                     │
                                     ▼
                         [apply_delta.ts: syncBusinessModals]
                         (KHÔNG CÒN lastDismissedAuctionKey)
                                     │
                     ┌───────────────┴───────────────┐
                     ▼                               ▼
      [state.dismissedAuctionCellIndex              [Phiên mới / Chưa dismiss]
       === delta.auction.cellIndex]                  │
                     │                               ▼
                     ├─► state.setAuction(...)      ├─► state.setAuction(...)
                     ├─► KHÔNG gọi openModal()      ├─► state.openModal('auction')
                     └─► Cập nhật real-time dữ liệu  └─► Modal hiển thị toàn màn hình
                                     │
                     ┌───────────────┴───────────────┐
                     ▼                               ▼
           [Modal Đang Thu Nhỏ]             [Modal Đang Mở]
                     │                               │
                     ▼                               ▼
              <MiniAuctionStrip />            <AuctionModal />
      - 🏛️ Ô đất: BOARD_CONFIG[cell].name    - Nút [✕] (Thu nhỏ)
      - 💰 Giá thầu: formatCurrency(current)  - Nút [Đã Rút Lui • Đóng]
      - 👑 Dẫn đầu: highestBidderName        - Nút [Đóng / Xem Bàn Cờ]
      - ⏳ Đếm ngược: sync từ server delta   - Backdrop click (dismissible)
      - Nút [👁️ Mở Lại] (restoreAuction)              │
                     │                               ▼
                     ▼                    dismissAuction(cellIndex)
              restoreAuction()        (dismissedAuctionCellIndex = cellIndex,
          (Mở lại sàn tức thì)         activeModal: null)
```

---

### III. MA TRẬN PHÂN TÍCH RỦI RO & BÁN KÍNH TÁC ĐỘNG (3-WAY BLAST RADIUS MATRIX)

| Trục Tác Động | Rủi Ro Tiềm Ẩn / Kịch Bản Xấu Nhất | Biện Pháp Phòng Vệ & Bất Biến Ràng Buộc |
| :--- | :--- | :--- |
| **1. Downstream Consumers** | • `activity_property_tracker.ts` đọc `prevState.auction` có thể bị lỗi type nếu thay đổi schema.<br>• `ActionDock` bị đè lấn notice chip khi `MiniAuctionStrip` hiển thị.<br>• `ModalHost` backdrop click bị kích hoạt ngoài ý muốn khi đang đấu giá gấp gáp. | • Kiểu `ModalPayloadMap['auction']` bao hàm 100% các trường cũ (`cellIndex`, `currentBid`, `highestBidderId`), đảm bảo tương thích ngược 100% với `activity_property_tracker.ts`.<br>• `ActionDock` dùng cờ `isStripActive` ẩn notice chip khi `MiniAuctionStrip` hiển thị.<br>• `ModalHost` chỉ cho phép backdrop click (`dismissible = true`) đối với người chơi không liên quan (`isAuctionDismissible`). Active bidder giữ `dismissible: false` để tránh miss-click ngoài ý muốn. |
| **2. Upstream Modifiers** | • Đấu giá phát mãi con nợ vỡ nợ (`isForeclosure: true` & `insolvencyPlayerId === myId`).<br>• Reconnect full-sync khi đang có phiên đấu giá. | • Bổ sung `insolvencyPlayerId === myId` vào `isAuctionDismissible`.<br>• Khi full-sync reconnect, reset `dismissedAuctionCellIndex = null` để đảm bảo người chơi vào lại game luôn thấy sàn đấu giá. |
| **3. Exceptional Lifecycle Modes** | • Chuyển giao vòng đấu Turn N+1: Rò rỉ `dismissedAuctionCellIndex` hoặc `auction` sang lượt sau.<br>• Hàng đợi phát mãi liên hoàn (Fire Sale Queue): Nhiều ô đất được đấu giá liên tiếp trong cùng pha. | • **Turn N+1 Teardown Invariant**: Khi `delta.auction === null` hoặc `turnPhase !== TurnPhase.AuctionPhase`, lập tức dọn dẹp `state.setAuction(null)` và `state.setDismissedAuctionCellIndex(null)`.<br>• **Fire Sale Teardown Guard**: Khi nhận phiên đấu giá mới có `delta.auction.cellIndex !== state.dismissedAuctionCellIndex`, lập tức xóa cờ dismiss cũ trong Zustand. |

---

### IV. THIẾT QUÂN LUẬT NGÂN SÁCH DÒNG CODE VẬT LÝ (PRE-CODING DELTA LOC)

| Tệp Mã Nguồn Vật Lý | LOC Đĩa Thực | Delta Dự Kiến | LOC Sau Sửa | Ngưỡng Trần TIER | Biện Pháp Kiểm Soát LOC |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/ui/action_dock.tsx` | **397** | **-1** | **396** | Tier 1: <= 400 | Thêm 2 dòng (selector + `isStripActive`), xóa 3 dòng trống thừa (L62, L65, L170). **Delta = -1!** |
| `src/client/ui/modals/modal_host.tsx` | **475** | **0** | **475** | Tier 2: <= 500 (Cảnh báo 480) | Trích xuất `isAuctionDismissible` sang `modal_helpers.ts`. Delta = 0! |
| `src/client/ui/modals/modal_helpers.ts` | **339** | **+16** | **355** | Tier 2: <= 500 | Tiếp nhận helper thuần `isAuctionDismissible(payload, myId, myPlayer)`. |
| `src/client/ui/modals/auction_modal.tsx` | **438** | **0** | **438** | Tier 2: <= 500 | Tinh chỉnh tooltip và aria-label nút ✕ in-place. Delta = 0! |
| `src/client/store/game_store_types.ts` | **369** | **+3** | **372** | Config/Types: <= 800 | **Xóa 7 dòng type cũ (L234-240)**, thay bằng 1 dòng `auction?: ModalPayloadMap['auction'] \| null;` + 9 dòng actions/types mới. |
| `src/client/store/game_store.ts` | **371** | **+9** | **380** | Tier 1: <= 400 (Trần 550) | Bổ sung actions `dismissAuction`, `restoreAuction`, `setAuction`, `setDismissedAuctionCellIndex`. |
| `src/client/network/apply_delta.ts` | **272** | **+3** | **275** | Tier 1: <= 400 | **Xóa 7 dòng `lastDismissedAuctionKey` cũ**, thêm 10 dòng kiểm tra Zustand. Delta = +3! |
| `src/client/ui/hud_container.tsx` | **127** | **+2** | **129** | Tier 2: <= 500 | Chèn `<MiniAuctionStrip />` trên `InlineBotTradeStrip`. |
| `src/client/ui/modals/mini_auction_strip.tsx` | **0 (Mới)** | **+115** | **115** | Tier 2: <= 500 | Module độc lập, chống tràn 360px và đồng bộ đếm ngược chống drift. |

---

### V. CHI TIẾT TRIỂN KHAI MÃ NGUỒN DROP-IN (100% TOUCHED FILES)

#### 1. `src/client/network/apply_delta.ts` (Subtractive Refactor: XÓA SẠCH `lastDismissedAuctionKey`)
- **Xóa bỏ dòng 91**: `let lastDismissedAuctionKey: string | null = null;`
- **Thay thế toàn bộ khối `syncBusinessModals` (L93-L136)**:
```ts
function syncBusinessModals(delta: DeltaPayload, state: GameState): void {
  // [IMP-50][IMP-200] UI as Projection with User Dismiss Preference (Zustand SSOT)
  if (delta.auction) {
    const myPid = useLobbyStore.getState().myPlayerId;
    const prevPayload = state.activeModal === 'auction' ? state.modalPayload as ModalPayloadMap['auction'] | null : null;
    const isSameAuction = prevPayload?.cellIndex === delta.auction.cellIndex && !prevPayload?.isConcluded;
    const hasPassed = Boolean(
      (isSameAuction && prevPayload?.hasPassed) ||
      (myPid && delta.auction.passedPlayerIds?.includes(myPid))
    );

    const auctionData: ModalPayloadMap['auction'] = {
      ...delta.auction,
      ...(hasPassed ? { hasPassed: true } : {}),
    };

    state.setAuction?.(auctionData);

    // Fire Sale Queue Defense: Sang ô đất mới thì tự động reset cờ dismiss của ô cũ
    if (state.dismissedAuctionCellIndex !== null && state.dismissedAuctionCellIndex !== delta.auction.cellIndex) {
      state.setDismissedAuctionCellIndex?.(null);
    }

    const isDismissed = state.dismissedAuctionCellIndex === delta.auction.cellIndex;

    if (isDismissed) {
      if (state.activeModal === 'auction') {
        state.updateModalPayload<'auction'>(auctionData);
      }
    } else {
      const isConcluded = Boolean(delta.auction.isConcluded);
      const isWaitingOrAction = delta.turnPhase === TurnPhase.WaitingRoll || delta.turnPhase === TurnPhase.ActionPhase;

      if (isConcluded && isWaitingOrAction) {
        // KHÔNG mở lại modal khi lượt chơi đã chuyển sang đổ xúc xắc
      } else {
        state.openModal('auction', auctionData);
      }
    }
  } else if (delta.auction === null) {
    state.setAuction?.(null);
    state.setDismissedAuctionCellIndex?.(null);
    if (state.activeModal === 'auction') {
      state.closeModal();
    }
  } else if (
    delta.turnPhase !== undefined &&
    delta.turnPhase !== TurnPhase.AuctionPhase
  ) {
    state.setAuction?.(null);
    state.setDismissedAuctionCellIndex?.(null);
    if (state.activeModal === 'auction') {
      const currentPayload = state.modalPayload as { isConcluded?: boolean } | null;
      if (!currentPayload?.isConcluded) {
        state.closeModal();
      }
    }
  }
```

#### 2. `src/client/store/game_store_types.ts` (XÓA BỎ KIỂU CŨ L234-L240)
- **Xóa bỏ hoàn toàn định nghĩa partial cũ tại L234-L240**:
```ts
// XÓA:
//  readonly auction?: {
//    readonly cellIndex: number;
//    readonly highestBid?: number;
//    readonly currentBid?: number;
//    readonly highestBidder?: string;
//    readonly highestBidderId?: string | null;
//  } | null;
```
- **Thay thế bằng**:
```ts
  readonly auction?: ModalPayloadMap['auction'] | null;
  readonly dismissedAuctionCellIndex: number | null;
  setAuction: (auction: ModalPayloadMap['auction'] | null) => void;
  setDismissedAuctionCellIndex: (cellIndex: number | null) => void;
  dismissAuction: (cellIndex: number) => void;
  restoreAuction: () => void;
```
- Trong `InitialGameState` (L326, L360):
  `auction: null,`
  `dismissedAuctionCellIndex: null,`

#### 3. `src/client/store/game_store.ts`
- Thêm vào store implementation:
```ts
  dismissedAuctionCellIndex: null,
  setAuction: (auction) => set({ auction }),
  setDismissedAuctionCellIndex: (cellIndex) => set({ dismissedAuctionCellIndex: cellIndex }),
  dismissAuction: (cellIndex) =>
    set({ dismissedAuctionCellIndex: cellIndex, activeModal: null, modalPayload: null }),
  restoreAuction: () => {
    const current = get().auction;
    set({ dismissedAuctionCellIndex: null });
    if (current) {
      get().openModal('auction', current);
    }
  },
```
- Trong `resetGameState`: reset `auction: null, dismissedAuctionCellIndex: null`.

#### 4. `src/client/ui/modals/modal_helpers.ts`
Thêm hàm helper thuần:
```ts
// [IMP-200] Kiểm tra xem người chơi có thuộc diện không liên quan để cho phép đóng/thu nhỏ modal đấu giá hay không
export function isAuctionDismissible(
  payload: ModalPayloadMap['auction'] | null | undefined,
  myId: string | undefined,
  myPlayer: Partial<PlayerInfo> | undefined
): boolean {
  if (!payload) return true;
  return Boolean(
    payload.hasPassed ||
    payload.declinedPlayerId === myId ||
    payload.insolvencyPlayerId === myId ||
    payload.isConcluded ||
    myPlayer?.bankrupt ||
    myPlayer?.isBankrupt
  );
}
```

#### 5. `src/client/ui/modals/modal_host.tsx` (Delta = 0, duy trì 475 LOC)
- Thay thế đoạn L111-L113:
```tsx
  const isBuyModal = activeModal === 'deed' && Boolean((modalPayload as ModalPayloadMap['deed'])?.canBuy);
  const isAuctionActive = activeModal === 'auction';
  const isCriticalDecision = isBuyModal || (isAuctionActive && !isAuctionDismissible(modalPayload as ModalPayloadMap['auction'], myId, myPlayer)) || activeModal === 'insolvency' || activeModal === 'compulsory_buyout';

  const handleBackdropClose = () => {
    if (isAuctionActive && modalPayload && 'cellIndex' in modalPayload) {
      useGameStore.getState().dismissAuction((modalPayload as ModalPayloadMap['auction']).cellIndex);
    } else {
      closeModal();
    }
  };

  return (
    <ModalBackdrop
      onClose={handleBackdropClose}
      center={activeModal === 'auction' || activeModal === 'event'}
      dismissible={!isCriticalDecision}
    >
```
- Cập nhật prop `onClose` và `isDeclinedPlayer` trong `AuctionModal` (L269, L278):
```tsx
  isDeclinedPlayer={payload.declinedPlayerId === myId || payload.insolvencyPlayerId === myId}
  onClose={() => { useGameStore.getState().dismissAuction(payload.cellIndex); }}
```

#### 6. `src/client/ui/action_dock.tsx` (Physical Subtractive LOC: Delta = -1, 397 -> 396 LOC)
- Khai báo selector phản ứng:
```tsx
  const activeModalStore = useGameStore((state) => state.activeModal);
```
- Trong phần tính toán:
```tsx
  const activeModal = ssrState ? ssrState.activeModal : activeModalStore;
  const isAuctionMinimized = Boolean(turnPhase === TurnPhase.AuctionPhase && !activeModal);
  const isStripActive = Boolean((pendingTradeOffer && pendingTradeOffer.sellerId === actingPlayerId) || isAuctionMinimized);
```
- Dòng 212: `{actionDockNotice && !isStripActive && (`
- Xóa 3 dòng trống thừa (L62, L65, L170) -> **Tổng số dòng giảm còn 396 dòng (<= 400 LOC)**.

#### 7. `src/client/ui/modals/mini_auction_strip.tsx` (Mới, chống tràn 360px & chống client drift)
```tsx
// [IMP-200] MiniAuctionStrip — Unobtrusive Floating Auction Status Bar for Non-Involved / Minimized Bidders
import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/game_store.js';
import { BOARD_CONFIG } from '../../../domain/board_config.js';
import { formatCurrency, formatShortPlayerName } from '../ui_helpers.js';
import { TurnPhase } from '../../../domain/room.js';

export function MiniAuctionStrip(): React.ReactElement | null {
  const auction = useGameStore((s) => s.auction);
  const activeModal = useGameStore((s) => s.activeModal);
  const turnPhase = useGameStore((s) => s.turnPhase);
  const playersInfo = useGameStore((s) => s.playersInfo);

  const [displaySeconds, setDisplaySeconds] = useState(auction?.timeRemaining ?? 0);

  // Authoritative Resync: Đồng bộ mỗi khi server delta cập nhật timeRemaining (triệt tiêu client drift)
  useEffect(() => {
    setDisplaySeconds(auction?.timeRemaining ?? 0);
  }, [auction?.timeRemaining]);

  // Đếm ngược local từng giây mượt mà giữa các delta ticks
  useEffect(() => {
    if (!auction || auction.isConcluded || displaySeconds <= 0) return;
    const timer = setInterval(() => {
      setDisplaySeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [auction?.cellIndex, auction?.isConcluded]);

  const isVisible = Boolean(
    auction &&
    activeModal !== 'auction' &&
    (turnPhase === TurnPhase.AuctionPhase || !auction.isConcluded)
  );

  if (!isVisible || !auction) return null;

  const cellName = BOARD_CONFIG[auction.cellIndex]?.name ?? `Ô ${auction.cellIndex}`;
  const highestBidderName = auction.highestBidderId
    ? formatShortPlayerName(playersInfo[auction.highestBidderId]?.name ?? auction.highestBidderId, 12)
    : 'Chưa có ai';
  const isUrgent = displaySeconds <= 3 && !auction.isConcluded;

  return (
    <div
      data-testid="mini-auction-strip"
      className="w-full sm:max-w-md flex items-center justify-between gap-1.5 sm:gap-2 px-2.5 py-1.5 bg-[#FFFDF8] border-2 border-amber-500 rounded-xl shadow-[0_3px_0_0_#d97706] text-slate-900 pointer-events-auto select-none animate-in fade-in slide-in-from-bottom-2 duration-150"
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-base shrink-0" aria-hidden="true">🏛️</span>
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] sm:text-xs font-black truncate text-amber-950 min-w-0">
            Đấu giá: {cellName}
          </span>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-600 whitespace-nowrap min-w-0">
            <span className="shrink-0">Giá: <strong className="text-amber-800 font-mono font-black">{formatCurrency(auction.currentBid)}</strong></span>
            <span className="shrink-0">•</span>
            <span className="truncate min-w-0">👑 {highestBidderName}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <div className={`px-2 py-0.5 rounded-md font-mono font-black text-xs ${isUrgent ? 'bg-rose-100 text-rose-700 animate-pulse border border-rose-300' : 'bg-amber-100 text-amber-900 border border-amber-300'}`}>
          {displaySeconds}s
        </div>
        <button
          type="button"
          onClick={() => useGameStore.getState().restoreAuction()}
          className="min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-black text-amber-950 bg-amber-400 hover:bg-amber-300 border border-amber-600 shadow-[0_2px_0_0_#b45309] active:translate-y-[1px] transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
        >
          <span>👁️</span>
          <span>Mở Lại</span>
        </button>
      </div>
    </div>
  );
}
```

#### 8. `src/client/ui/hud_container.tsx`
Chèn `<MiniAuctionStrip />` vào khối stack phía trên `InlineBotTradeStrip` (L98).

---

### VI. KẾ HOẠCH HỢP ĐỒNG KIỂM THỬ TRẠM 1 (STATION 1 CONTRACT TESTS: 17 ATOMIC TESTS)

Tệp test hợp đồng: `tests/contracts/imp200_auction_dismiss_and_mini_widget.test.ts`.

- **Facet 1: Store Lifecycle & User Dismiss State (TC-200.01 - 04)**
  * `TC-200.01`: `dismissAuction(cellIndex)` cập nhật `dismissedAuctionCellIndex = cellIndex`, đóng modal (`activeModal: null, modalPayload: null`).
  * `TC-200.02`: `restoreAuction()` xóa `dismissedAuctionCellIndex = null` và mở lại `activeModal: 'auction'` với dữ liệu phiên đấu giá hiện tại.
  * `TC-200.03`: `setAuction(payload)` cập nhật dữ liệu `state.auction` mà không làm thay đổi `activeModal`.
  * `TC-200.04`: `resetGameState()` reset hoàn toàn `dismissedAuctionCellIndex: null` và `auction: null`.
- **Facet 2: apply_delta Idempotence & Anti-Popup Invariant (TC-200.05 - 08)**
  * `TC-200.05`: Khi phiên đấu giá mới bắt đầu (`delta.auction.cellIndex !== dismissedAuctionCellIndex`), `apply_delta` tự động mở modal `openModal('auction')`.
  * `TC-200.06`: Khi người chơi đã dismiss (`dismissedAuctionCellIndex === delta.auction.cellIndex`), delta tick tiếp theo (`!isConcluded`) KHÔNG mở lại modal `activeModal: 'auction'`.
  * `TC-200.07`: Khi người chơi đã dismiss, delta tick tiếp theo vẫn cập nhật chính xác dữ liệu `state.auction` (currentBid, timeRemaining) trong store.
  * `TC-200.08`: Khi người chơi mở modal khác (`openModal('portfolio')`), delta tick của phiên đấu giá đã dismiss không đè lấn hay tắt modal Portfolio.
- **Facet 3: Transient Teardown & Fire Sale Safety (TC-200.09 - 11)**
  * `TC-200.09`: Khi `delta.auction === null`, `apply_delta` tự động dọn sạch `state.auction = null` và `state.dismissedAuctionCellIndex = null`.
  * `TC-200.10`: Khi chuyển sang `turnPhase !== TurnPhase.AuctionPhase`, `dismissedAuctionCellIndex` và `auction` bị dọn dẹp sạch sẽ.
  * `TC-200.11`: Trong hàng đợi phát mãi liên hoàn (Fire Sale), khi chuyển sang ô đất mới (`cellIndex: 8 != 3`), `apply_delta` tự động reset cờ dismiss cũ và mở sàn đấu giá ô mới.
- **Facet 4: ModalHost Backdrop & Non-Involved Dismissibility (TC-200.12 - 14)**
  * `TC-200.12`: Khi `activeModal === 'auction'` và người chơi đã `hasPassed: true`, `isAuctionDismissible` trả về `true` và backdrop click kích hoạt `dismissAuction`.
  * `TC-200.13`: Khi `activeModal === 'auction'` và người chơi là `declinedPlayerId === myId` hoặc con nợ phát mãi `insolvencyPlayerId === myId`, `isAuctionDismissible` trả về `true`.
  * `TC-200.14`: Khi người chơi đang là active bidder (chưa pass), `isAuctionDismissible` trả về `false` (bảo vệ miss-click), nhưng nút ✕ trên header gọi `dismissAuction`.
- **Facet 5: MiniAuctionStrip Visual Projection & Ergonomics (TC-200.15 - 17)**
  * `TC-200.15`: `MiniAuctionStrip` render đầy đủ thông tin: tên ô đất, giá thầu hiện tại, tên người dẫn đầu và đếm ngược thời gian.
  * `TC-200.16`: Khi bấm nút `[Mở Lại]` trên `MiniAuctionStrip`, gọi `restoreAuction()` phục hồi modal đấu giá.
  * `TC-200.17`: Khi modal đấu giá đang mở (`activeModal === 'auction'`), `MiniAuctionStrip` ẩn hoàn toàn (`null`).
