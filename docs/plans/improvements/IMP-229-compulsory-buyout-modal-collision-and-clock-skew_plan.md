# KẾ HOẠCH TRIỂN KHAI (v2 HARDENED): IMP-229 — Khắc Phục Lỗi Xung Đột Modal & Tự Động Kết Thúc Của Phiếu Cơ Hội "Mua Lại Dự Án Tiềm Năng"

> **Mã Ticket**: IMP-229  
> **Phân Loại**: Tier 2 (Full Rigor — FSM, Network Timing, Modal Lifecycle)  
> **Trạng Thái Kiểm Toán**: HARDENED_APPROVED (Đã tích hợp 100% chỉ định từ `plan-griller` P1-P5)  
> **Mục Tiêu**: Loại bỏ 100% hiện tượng xung đột ghi đè modal (Modal Collision) và tự động đóng modal do lệch đồng hồ (Clock Skew Auto-Decline) khi người chơi mở trúng Thẻ cơ hội Mua Lại Dự Án Tiềm Năng (`CC_SWAP_PROJECT`).

---

## 1. BỐI CẢNH VẬT LÝ & 3 ĐIỂM MÙ ĐƯỢC PHÁT HIỆN TỪ KIỂM TOÁN

### 1.1 Hiện tượng lỗi ban đầu
1. Khi người chơi dừng chân tại ô Cơ Hội và mở trúng thẻ `CC_SWAP_PROJECT`, màn hình vừa nhấp nháy Bảng 1 (*"Phiếu Cơ Hội"*) thì ngay lập tức bị Bảng 2 (*"Quyền Mua Lại 130%"*) đè lên.
2. Bảng 2 chỉ xuất hiện trong tích tắc (~100ms) rồi tự động biến mất như máy tự chơi mà người chơi không kịp đọc hay bấm chọn bất cứ nút gì.

### 1.2 Ba điểm mù vật lý chí mạng được giải quyết
1. **P1.1 - Race Condition khi cờ đang di chuyển**:
   - Khi nhận WebSocket delta gieo xúc xắc, con cờ chưa hạ cánh nên `activeModal` vẫn là `null`.
   - Nếu `apply_delta` kiểm tra thô sơ `activeModal !== 'event'`, nó sẽ mở ngay `compulsory_buyout` khi cờ đang lăn. Sau 1.5s cờ hạ cánh lại đè `event` lên.
   - **Giải pháp**: CẤM mở modal trong `apply_delta` khi có thẻ sự kiện (`delta.lastEventCard` hoặc `state.lastEventCard?.cardId === 'CC_SWAP_PROJECT'`) hoặc cờ đang di chuyển. `apply_delta` chỉ lưu `pendingBuyout` vào store. Việc mở `compulsory_buyout` hoàn toàn do `modal_host.tsx` kích hoạt tuần tự sau khi người chơi đã xem xong và đóng thẻ `event`.
2. **P1.2 - Backdrop Dismissal Deadlock**:
   - Khi người chơi click ra ngoài backdrop hoặc bấm `Esc` trên `EventCardModal`, `handleBackdropClose` trong `modal_host.tsx` gọi thẳng `closeModal()`, bỏ qua chuyển tiếp. `pendingBuyout` bị kẹt mồ côi trên server, khóa cứng `turn_loop.ts#L242` làm người chơi không thể hết lượt.
   - **Giải pháp**: Xử lý chuyển tiếp tuần tự ngay trong `handleBackdropClose` khi `activeModal === 'event'`.
3. **P1.3 - Clock Skew & Zombie Button Khi Hết Giờ**:
   - Khử hoàn toàn lệnh gọi `onDecline()` trong client timer (tuân thủ Server-Authoritative: để server watchdog tự timeout và gửi delta null).
   - Khi `remainingMs <= 0`, bắt buộc khóa nút Mua: `disabled={!canAfford || remainingMs <= 0}` để triệt tiêu trạng thái Zombie UI.

---

## 2. KIẾN TRÚC LUỒNG DỮ LIỆU TUẦN TỰ (ORIGIN-TO-SINK)

```
[Server: chance_card_handlers]
   └── Bốc trúng CC_SWAP_PROJECT ➔ Gửi lastEventCard + pendingBuyout
         │ (WebSocket Delta)
         ▼
[Client: apply_delta.ts]
   ├── Lưu state.setPendingBuyout(delta.pendingBuyout)
   └── Cờ đang chạy hoặc có thẻ sự kiện ➔ TUYỆT ĐỐI KHÔNG mở modal 'compulsory_buyout'
         │
         ▼ (Sau 1.5s hoạt cảnh kết thúc, cờ chạm đất)
[Người Chơi Xem Bảng 1: EventCardModal]
   ├── Hiển thị chi tiết thẻ Mua Lại Dự Án Tiềm Năng (Đền bù 130%)
   └── Người chơi bấm "Chốt Mua Dự Án 🤝" HOẶC click Backdrop / Esc
         │
         ▼ (modal_host.tsx: handleEventModalClose / handleBackdropClose)
[Chuyển Tiếp Tuần Tự: modal_host.tsx]
   └── Đóng 'event' ➔ Nhận diện pendingBuyout trong store ➔ Mở 'compulsory_buyout'
         │
         ▼
[Bảng 2: CompulsoryBuyoutModal An Toàn & Vững Chắc]
   ├── Bộ đếm nhịp tương đối: Giảm 100ms mỗi tick, không phụ thuộc Date.now()
   ├── Dự phòng an toàn: Nếu expiresAt <= Date.now(), fallback 15.000ms
   ├── Triệt tiêu Auto-Decline: Khi hết giờ ở UI (remainingMs <= 0), khóa nút Mua, chờ Server delta null
   └── Quyền tự quyết: Người chơi bấm [💰 Mua Lại] hoặc [✕ Từ Chối Mua]
```

---

## 3. DROP-IN CODE SNIPPETS CỤ THỂ

### Task 1: Ngăn Chặn Mở Sớm Trong `src/client/network/apply_delta.ts`
- **Tệp mục tiêu**: [`src/client/network/apply_delta.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta.ts)
- **Hàm bao quanh**: `apply_delta(delta: DeltaPayload)` (dòng 201-212)
- **Ngân sách LOC**: Hiện tại 347 lines -> sau sửa ~351 lines (Trần Tier 1: 400 lines)

```ts
  // [IMP-145][IMP-229] Compulsory Buyout Modal — Lưu store, chỉ mở ngay trên FullSync/Reconnect nếu không có hoạt cảnh
  if (delta.pendingBuyout !== undefined) {
    state.setPendingBuyout(delta.pendingBuyout);
    if (delta.pendingBuyout) {
      const myPid = useLobbyStore.getState().myPlayerId;
      const isCardFlow = Boolean(delta.lastEventCard || state.lastEventCard?.cardId === 'CC_SWAP_PROJECT');
      const isMoving = Boolean(state.activePawnAnimation?.isAnimating || state.isRolling);
      if (delta.pendingBuyout.buyerId === myPid && !isCardFlow && !isMoving && state.activeModal === null) {
        state.openModal('compulsory_buyout', delta.pendingBuyout);
      }
    } else if (delta.pendingBuyout === null && state.activeModal === 'compulsory_buyout') {
      state.closeModal();
    }
  }
```

---

### Task 2: Chuyển Tiếp Tuần Tự Cả Nút Bấm & Backdrop Trong `src/client/ui/modals/modal_host.tsx`
- **Tệp mục tiêu**: [`src/client/ui/modals/modal_host.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/modal_host.tsx)
- **Vị trí 1 (Backdrop Close)**: `handleBackdropClose` (dòng 110-116)
- **Vị trí 2 (Event Card Close)**: Nhánh `activeModal === 'event'` (dòng 371-385)
- **Ngân sách LOC**: Hiện tại 474 lines -> sau sửa ~482 lines (Trần Tier 2: 500 lines)

**Vị trí 1: Cập nhật `handleBackdropClose`**:
```tsx
  const handleBackdropClose = () => {
    if (isAuctionActive && modalPayload && 'cellIndex' in modalPayload) {
      useGameStore.getState().dismissAuction((modalPayload as ModalPayloadMap['auction']).cellIndex);
    } else if (activeModal === 'event') {
      const pb = useGameStore.getState().pendingBuyout;
      const myPid = useLobbyStore.getState().myPlayerId;
      if (pb && pb.buyerId === myPid) {
        useGameStore.getState().openModal('compulsory_buyout', pb);
      } else {
        closeModal();
      }
    } else {
      closeModal();
    }
  };
```

**Vị trí 2: Cập nhật nhánh `activeModal === 'event'`**:
```tsx
      {activeModal === 'event' && (() => {
        const handleEventModalClose = () => {
          const pb = useGameStore.getState().pendingBuyout;
          const myPid = useLobbyStore.getState().myPlayerId;
          if (pb && pb.buyerId === myPid) {
            useGameStore.getState().openModal('compulsory_buyout', pb);
          } else {
            closeModal();
          }
        };

        return (
          <EventCardModal
            cardType={(modalPayload as ModalPayloadMap['event']).cardType}
            cardId={(modalPayload as ModalPayloadMap['event']).cardId}
            title={(modalPayload as ModalPayloadMap['event']).title}
            description={(modalPayload as ModalPayloadMap['event']).description}
            effectDelta={(modalPayload as ModalPayloadMap['event']).effectDelta}
            targetScope={(modalPayload as ModalPayloadMap['event']).targetScope}
            effectDetail={(modalPayload as ModalPayloadMap['event']).effectDetail}
            duration={(modalPayload as ModalPayloadMap['event']).duration}
            destination={(modalPayload as ModalPayloadMap['event']).destination}
            onConfirm={handleEventModalClose}
            onClose={handleEventModalClose}
          />
        );
      })()}
```

---

### Task 3: Khử Lỗi Clock Skew, Triệt Tiêu Auto-Decline & Khóa Nút Hết Giờ Trong `src/client/ui/modals/compulsory_buyout_modal.tsx`
- **Tệp mục tiêu**: [`src/client/ui/modals/compulsory_buyout_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/compulsory_buyout_modal.tsx)
- **Vị trí 1 (Countdown Timer)**: dòng 40-53
- **Vị trí 2 (Nút Mua Lại Disabled)**: dòng 168-175
- **Ngân sách LOC**: Hiện tại 193 lines -> sau sửa ~198 lines (Trần Tier 2: 500 lines)

**Vị trí 1: Đếm ngược tương đối an toàn**:
```tsx
  // [IMP-229] Relative Countdown & Zero Auto-Decline (Server Authoritative)
  const initialTimeLeft = Math.max(0, expiresAt - Date.now());
  const safeInitialMs = initialTimeLeft > 0 ? initialTimeLeft : 15_000;
  const [remainingMs, setRemainingMs] = useState(safeInitialMs);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingMs((prev) => {
        const next = Math.max(0, prev - 100);
        if (next <= 0) {
          clearInterval(timer);
          // TUYỆT ĐỐI KHÔNG tự gọi onDecline() tại client!
          // Server là authoritative và đã có checkPendingBuyoutTimeout để tự hủy session và gửi delta.pendingBuyout = null.
          // Client chỉ hiển thị 0s và chờ server delta, ngăn chặn 100% lỗi tự động bỏ cuộc chớp nhoáng.
        }
        return next;
      });
    }, 100);
    return () => clearInterval(timer);
  }, []);
```

**Vị trí 2: Khóa nút Mua Lại khi hết giờ hoặc thiếu tiền**:
```tsx
          <button
            type="button"
            data-testid="buyout-confirm-btn"
            onClick={() => canAfford && remainingMs > 0 && onBuyout(cellIndex)}
            disabled={!canAfford || remainingMs <= 0}
            className={`h-full min-h-[48px] px-3 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              canAfford && remainingMs > 0
                ? 'text-white bg-emerald-600 hover:bg-emerald-700 border-2 border-emerald-800 shadow-[0_4px_0_0_#065f46] active:translate-y-[3px] cursor-pointer'
                : 'bg-slate-200 text-slate-400 border border-slate-300 shadow-none cursor-not-allowed'
            }`}
          >
            <span>💰</span>
            <span>{remainingMs <= 0 ? 'Hết Thời Gian Mua' : `Mua Lại (${formatCurrency(cost)})`}</span>
          </button>
```

---

## 4. UNIVERSAL 5-FACET BEHAVIORAL TEST MATRIX (STATION 1)

Viết file kiểm thử hợp đồng: `tests/client/imp229_compulsory_buyout_collision_and_clock_skew.test.ts` gồm đúng 16 atomic tests tuân thủ Detroit Style (không vòng lặp trong `it()`, 1-4 asserts/test, zero static checklist):

- **Facet 1: Tuần Tự Hóa & Chống Va Chạm Modal (Modal Sequencing & Collision Defense)** (4 tests):
  - `[TC-229.01/MSS][UC-IMP229][Facet-1/NoModalCollisionOnEventCard]`: Khi nhận `delta.pendingBuyout` kèm `delta.lastEventCard`, `apply_delta` KHÔNG cướp modal, `activeModal` vẫn giữ nguyên.
  - `[TC-229.02/MSS][UC-IMP229][Facet-1/PendingBuyoutSavedToStore]`: Mặc dù không cướp modal, `pendingBuyout` vẫn được lưu đầy đủ vào `gameStore.pendingBuyout`.
  - `[TC-229.03/MSS][UC-IMP229][Facet-1/SequentialTransitionOnConfirm]`: Khi người chơi bấm xác nhận trên `EventCardModal`, modal `'event'` đóng lại và modal `'compulsory_buyout'` mở ra ngay lập tức với đúng payload.
  - `[TC-229.04/MSS][UC-IMP229][Facet-1/SequentialTransitionOnBackdrop]`: Khi người chơi click backdrop hoặc Esc trên `EventCardModal`, hệ thống chuyển tiếp mở `'compulsory_buyout'`, chống deadlock kẹt lượt.

- **Facet 2: Phòng Vệ Lệch Đồng Hồ & Đếm Ngược Tương Đối (Clock Skew Resilience)** (3 tests):
  - `[TC-229.05/MSS][UC-IMP229][Facet-2/ClockSkewFallbackTo15s]`: Khi `expiresAt <= Date.now()` (lệch giờ máy), `CompulsoryBuyoutModal` tự động fallback về 15.000ms (15s), không bị hiển thị 0s hay đóng tức thì.
  - `[TC-229.06/MSS][UC-IMP229][Facet-2/RelativeTickDecrement]`: Đếm ngược tương đối giảm chính xác theo nhịp timer mà không phụ thuộc vào `Date.now()`.
  - `[TC-229.07/MSS][UC-IMP229][Facet-2/ZeroAutoDeclineOnZero]`: Khi timer đếm về 0ms, `onDecline` TUYỆT ĐỐI KHÔNG được gọi (spy `onDecline` có `toHaveBeenCalledTimes(0)`).

- **Facet 3: Cách Ly Danh Tính Người Chơi (Buyer Identification & Attribution)** (3 tests):
  - `[TC-229.08/MSS][UC-IMP229][Facet-3/ThirdPartyPlayerNoModal]`: Người chơi khác trong phòng (`myPlayerId !== buyerId`) nhận `pendingBuyout` nhưng KHÔNG mở modal `compulsory_buyout`.
  - `[TC-229.09/MSS][UC-IMP229][Facet-3/DirectModalOpenOnReconnect]`: Khi nhận `delta.pendingBuyout` mà không có hoạt cảnh/thẻ sự kiện (`activeModal === null`, reconnect), modal `'compulsory_buyout'` mở trực tiếp bình thường.
  - `[TC-229.10/MSS][UC-IMP229][Facet-3/StandardEventModalClosesNormally]`: Thẻ sự kiện thông thường không có `pendingBuyout` đóng bình thường mà không mở modal nào khác.

- **Facet 4: Dọn Dẹp Trạng Thái & Teardown Khép Kín (Lifecycle Teardown)** (3 tests):
  - `[TC-229.11/MSS][UC-IMP229][Facet-4/ServerDeltaNullClosesModal]`: Khi server gửi `delta.pendingBuyout = null`, `apply_delta` đóng modal `compulsory_buyout` sạch sẽ.
  - `[TC-229.12/MSS][UC-IMP229][Facet-4/UnmountClearsInterval]`: Component `CompulsoryBuyoutModal` unmount dọn sạch `clearInterval` (zero timer leak).
  - `[TC-229.13/MSS][UC-IMP229][Facet-4/ManualDeclineEmitsIntent]`: Khi người chơi bấm "✕ Từ Chối Mua", `onDecline` được gọi đúng 1 lần.

- **Facet 5: Khả Năng Mua & Bảo Toàn Giao Diện (Commercial Affordance & UI)** (3 tests):
  - `[TC-229.14/MSS][UC-IMP229][Facet-5/ManualBuyoutEmitsIntent]`: Khi người chơi đủ tiền bấm "Mua Lại", `onBuyout` được gọi với đúng `cellIndex`.
  - `[TC-229.15/MSS][UC-IMP229][Facet-5/BuyoutDisabledOnTimeExpiry]`: Khi `remainingMs <= 0`, nút Mua Lại bị disabled và chuyển nhãn thành "Hết Thời Gian Mua".
  - `[TC-229.16/MSS][UC-IMP229][Facet-5/ShortfallNoticeIntegrity]`: Khi người chơi thiếu tiền, hiển thị đầy đủ thông báo thiếu tiền và vô hiệu hóa nút mua.

---

## 5. DỰ TOÁN NGÂN SÁCH LOC & ANTI-SLOP GUARD

| Tệp Vật Lý | SLOC Trước | Delta Dự Kiến | SLOC Sau | Trần Cho Phép | Kết Luận |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/network/apply_delta.ts` | 347 | +4 | 351 | <= 400 | ✔️ An toàn |
| `src/client/ui/modals/modal_host.tsx` | 474 | +8 | 482 | <= 500 | ✔️ An toàn (< 500) |
| `src/client/ui/modals/compulsory_buyout_modal.tsx` | 193 | +5 | 198 | <= 500 | ✔️ An toàn |
| `tests/client/imp229_compulsory_buyout_collision_and_clock_skew.test.ts` | 0 | +240 | 240 | <= 300 | ✔️ Đạt chuẩn Detroit |
