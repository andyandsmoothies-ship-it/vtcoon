# KẾ HOẠCH KỸ THUẬT: IMP-198 - KHẮC PHỤC LỖI TỤT CHỮ ACTIONDOCK & ĐỒNG BỘ LAYOUT NÚT BẤM DESKTOP
# (Ticket IMP-198: Fix Desktop ActionDock Text Drop and Responsive Button Layout)

> **Mục tiêu**: Loại bỏ triệt để lỗi tụt chữ (text drop / vertical text clipping) trên các nút bấm của thanh điều khiển tác vụ `ActionDock` khi chơi trên Web Desktop, đảm bảo các nút bấm co giãn thanh lịch, hiển thị trọn vẹn icon và nhãn tiếng Việt trên 1 dòng đơn, triệt tiêu nguy cơ đè lấn giữa chip thông báo nổi và strip giao dịch bot, đồng thời bảo toàn 100% công thái học icon-only trên Mobile 360px.

---

## I. KIỂM TOÁN TỌA ĐỘ VẬT LÝ & HIỆN TRẠNG (PHYSICAL DISK AUDIT)

### 1. Phân Tích Hiện Trạng Qua Ảnh Thực Tế (`media_1790390153734.jpg`)
- Nút 1 ("🎲 Đổ Xúc Xắc"): Có `shrink-0`, hiển thị đủ rộng (~160px).
- Nút 2 ("🏛️ Quản Lý BĐS"): Bị co cụm thành khối vuông, chữ "Quản Lý BĐS" bị bẻ thành 3 dòng, chữ "BĐS" tụt hẳn ra ngoài viền đáy của nút.
- Nút 3 ("🤝 Đàm Phán"), Nút 4 ("🗺️ Quy Hoạch"), Nút 5 ("⏭️ Hết Lượt"): Bị bẻ thành 2 dòng, chật chội, sát đáy.

### 2. Bảng Delta LOC & Ngân Sách Dự Án (LOC Tiers)
| Tệp Vật Lý | Vai Trò Kiến Trúc | LOC Hiện Tại | Delta LOC | LOC Dự Kiến | Trần Quy Định (Budget) | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/ui/action_dock.tsx` | Thanh điều khiển tác vụ cốt lõi | 397 | 0 | 397 | <= 400 LOC (Tier 1 & `imp193#L431`) | ✅ BẢO TOÀN (xóa 1 dòng trống bù) |
| `src/client/ui/hud_container.tsx` | Khung bọc HUD toàn cục | 121 | 0 | 121 | <= 500 LOC (Tier 2) | ✅ BẢO TOÀN |
| `src/client/ui/modals/bot_trade_offer_strip.tsx` | Strip giao dịch Bot 1-chạm | 208 | 0 | 208 | <= 500 LOC (Tier 2) | ✅ BẢO TOÀN |
| `tests/contracts/imp198_desktop_actiondock_layout.test.ts` | Test hợp đồng Station 1 (RED) | 0 | +220 | 220 | <= 300 LOC (Living Test) | ✅ HỢP LỆ |

*Quy tắc Readability & LOC Clean*: Tuyệt đối không gộp nhiều câu lệnh trên 1 dòng (`1-statement-per-line`). Khai báo `const pendingTradeOffer = useGameStore((state) => state.pendingTradeOffer);` trên dòng riêng biệt và loại bỏ 1 dòng trống dư thừa trong file để giữ nguyên chính xác 397 LOC <= 400 LOC.

---

## II. SƠ ĐỒ DÒNG CHẢY BỐ CỤC (LAYOUT FLOWCHART)

```
[Màn Hình Desktop Web >= 640px (sm:)]
                 │
                 ▼
[hud_container.tsx: L85-L92]
 ├── Cụm Trái: <TelemetryBadge /> ──► Bổ sung shrink-0 (chống bẹp trên tablet 768px)
 └── Cụm Phải: flex-col items-end
       ├── Cũ: sm:max-w-md (448px) ──► Gây nghẽn bình
       └── Mới: sm:max-w-none sm:min-w-0 ──► Giải phóng không gian tự nhiên
                 │
                 ▼
[InlineBotTradeStrip: L134] (nếu có đề xuất trade từ Bot)
  └── Độc lập gán sm:max-w-md (giữ thẻ trade gọn gàng)
                 │
                 ▼
[ActionDock: L210]
  flex items-center gap-2 md:gap-3 px-5
  Tổng bề rộng tự nhiên: ~730px
                 │
  ┌──────────────┴─────────────────────────────────────────────┐
  ▼                                                            ▼
[Nút Primary: Đổ Xúc Xắc]                  [4 Nút Secondary: Quản Lý BĐS, Đàm Phán, Quy Hoạch, Hết Lượt]
- shrink-0                                 - Cũ: w-11 h-11 sm:w-auto (khóa h-11, thiếu shrink-0, thiếu nowrap)
- whitespace-nowrap (bổ sung)              - Mới: w-11 h-11 sm:w-auto sm:h-auto shrink-0 whitespace-nowrap
- Chiều cao min-h-[44px]                   - Chiều cao min-h-[44px], khớp chuẩn py-2.5
- Hiển thị 1 hàng: "🎲 Đổ Xúc Xắc"          - Hiển thị 1 hàng: "🏛️ Quản Lý BĐS" (KHÔNG BẺ DÒNG)
```

---

## III. MA TRẬN BÁN KÍNH ẢNH HƯỞNG (3-WAY BLAST RADIUS AUDIT - KÈM TIẾP THU PHẢN BIỆN P1-P5)

### 1. Downstream Consumers (Trục 1: Thành Phần Tiêu Thụ Phía Dưới)
- `hud_container.tsx#L87`: Khối bọc `<TelemetryBadge />` được bổ sung `shrink-0`. Điều này đảm bảo trên màn hình Tablet 768px (hoặc cửa sổ thu nhỏ 640px - 880px), `TelemetryBadge` không bao giờ bị flexbox bóp nghẹt vỡ chữ khi ActionDock mở rộng.
- `hud_container.tsx#L92`: Container bọc ActionDock được bổ sung `sm:min-w-0`. Thuộc tính này cho phép `ActionDock` kích hoạt cơ chế cuộn ngang `overflow-x-auto no-scrollbar` nội tại nếu tổng bề rộng của 2 bên vượt quá chiều ngang màn hình.
- `InlineBotTradeStrip#L134`: Được gán `sm:max-w-md` riêng biệt để giữ thẻ đề xuất trade gọn gàng ở góc phải, không bị kéo bè theo ActionDock. Xác thực tính tương thích qua Browser Testing.

### 2. Upstream Environmental Modifiers (Trục 2: Trạng Thái Môi Trường & Trò Chơi)
- **Triệt tiêu xung đột đè lấn giữa `actionDockNotice` và `InlineBotTradeStrip` (Phản biện P1 & P2)**:
  - Khai báo rõ ràng biến trạng thái tự mô tả:
    ```ts
    const isTradeStripActive = Boolean(pendingTradeOffer && pendingTradeOffer.sellerId === actingPlayerId);
    ```
  - Tại L214, điều kiện hiển thị chip là:
    ```tsx
    {actionDockNotice && !isTradeStripActive && (
    ```
    Khi Bot gửi đề xuất trade (`isTradeStripActive = true`), chip thông báo nổi tự động ẩn đi, nhường toàn bộ không gian cho `InlineBotTradeStrip` hiển thị rõ ràng, không bị đè lấn bất kỳ pixel nào.
- `inAudit = true`: Nút `⚖️ Bảo Lãnh (500)` hiển thị. Bổ sung `shrink-0 whitespace-nowrap` để nút bảo lãnh không bị bẹp méo khi xuất hiện.
- `isStandingOnBuyable = true`: Nút `🏷️ Mua Đất` xuất hiện thay nút đổ xúc xắc. Nút này đã có sẵn `shrink-0 whitespace-nowrap` (L237), được bảo toàn.
- `isTradeFrozen = true`: Nút Đàm Phán chuyển trạng thái disabled, giữ nguyên kích thước và cấu trúc.

### 3. Exceptional Lifecycle Modes (Trục 3: Vòng Đời & Kích Thước Viewport Ngoại Lệ)
- **Mobile Cực Nhỏ (360px - 390px)**:
  - 4 nút phụ bảo toàn 100% `w-11 h-11 min-w-[44px] min-h-[44px] p-0` và `hidden sm:inline` cho nhãn chữ.
  - Khi ở trạm kiểm toán (`inAudit = true`), thanh ActionDock có `overflow-x-auto no-scrollbar` cho phép cuộn ngang mượt mà, không vỡ layout bàn cờ.
- **Tablet & Màn Hình Thu Nhỏ (640px - 880px)**:
  - Nhờ `shrink-0` trên TelemetryBadge và `sm:min-w-0` trên cụm ActionDock, thanh ActionDock mở rộng đầy đủ chữ mà không chèn ép TelemetryBadge; nếu không gian hẹp hơn 870px, thanh dock tự động cuộn ngang trơn tru.

---

## IV. ĐẶC TẢ CHI TIẾT CÁC THAY ĐỔI MÃ NGUỒN (MAPPING ĐĨA VẬT LÝ)

### 1. `src/client/ui/hud_container.tsx`
- **Tọa độ Dòng 87**: Thêm `shrink-0` cho khối bọc `TelemetryBadge`.
```tsx
// Cũ (L87):
<div className="pointer-events-auto hidden sm:block">

// Mới (L87):
<div className="pointer-events-auto hidden sm:block shrink-0">
```

- **Tọa độ Dòng 92**: Đổi `sm:max-w-md` thành `sm:max-w-none sm:min-w-0`.
```tsx
// Cũ (L92):
<div className="flex flex-col items-center sm:items-end gap-1.5 w-full sm:w-auto max-w-[96vw] sm:max-w-md pointer-events-none">

// Mới (L92):
<div className="flex flex-col items-center sm:items-end gap-1.5 w-full sm:w-auto max-w-[96vw] sm:max-w-none sm:min-w-0 pointer-events-none">
```

### 2. `src/client/ui/modals/bot_trade_offer_strip.tsx`
- **Tọa độ Dòng 134**: Thêm `sm:max-w-md` vào container của strip đề xuất trade.
```tsx
// Cũ (L134):
className="w-full flex items-center justify-between gap-1.5 sm:gap-2 px-2.5 py-1.5 bg-[#FFFDF8] border-2 border-amber-500 rounded-xl shadow-[0_3px_0_0_#d97706] text-slate-900 pointer-events-auto select-none animate-in fade-in slide-in-from-bottom-2 duration-150"

// Mới (L134):
className="w-full sm:max-w-md flex items-center justify-between gap-1.5 sm:gap-2 px-2.5 py-1.5 bg-[#FFFDF8] border-2 border-amber-500 rounded-xl shadow-[0_3px_0_0_#d97706] text-slate-900 pointer-events-auto select-none animate-in fade-in slide-in-from-bottom-2 duration-150"
```

### 3. `src/client/ui/action_dock.tsx` (Tuân thủ Readability, Delta LOC = 0)
- **Tọa độ Dòng 61-62**: Thêm selector `pendingTradeOffer` trên dòng riêng:
```tsx
  const toggleHeatmap = useGameStore((state) => state.toggleHeatmap);
  const pendingTradeOffer = useGameStore((state) => state.pendingTradeOffer);
```
  *(Đồng thời xóa 1 dòng trống thừa tại dòng 296 để giữ nguyên chính xác 397 LOC)*.

- **Tọa độ Dòng 83-84**: Khai báo cờ tự mô tả `isTradeStripActive`:
```tsx
  const actingPlayerId = localPlayerId ?? currentTurnPlayerId;
  const isTradeStripActive = Boolean(pendingTradeOffer && pendingTradeOffer.sellerId === actingPlayerId);
```

- **Tọa độ Dòng 214**: Ẩn chip nổi `actionDockNotice` khi `isTradeStripActive`:
```tsx
// Cũ:
      {actionDockNotice && (

// Mới:
      {actionDockNotice && !isTradeStripActive && (
```

- **Tọa độ Dòng 255 (Nút Đổ Xúc Xắc)**: Thêm `whitespace-nowrap`.
```tsx
// Cũ:
          className={`min-h-[44px] flex items-center justify-center gap-1.5 sm:gap-2 px-5 sm:px-6 py-2.5 shrink-0 rounded-2xl font-black text-white shadow-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 ${

// Mới:
          className={`min-h-[44px] shrink-0 whitespace-nowrap flex items-center justify-center gap-1.5 sm:gap-2 px-5 sm:px-6 py-2.5 rounded-2xl font-black text-white shadow-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 ${
```

- **Tọa độ Dòng 304 (Nút Bảo Lãnh)**: Thêm `shrink-0 whitespace-nowrap`.
```tsx
// Cũ:
          className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-white font-bold bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-amber-800 shadow-[0_4px_0_0_#0f172a] active:shadow-none active:translate-y-[3px] transition-all text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"

// Mới:
          className="min-h-[44px] shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-white font-bold bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-amber-800 shadow-[0_4px_0_0_#0f172a] active:shadow-none active:translate-y-[3px] transition-all text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
```

- **Tọa độ Dòng 321 (Nút Quản Lý BĐS)**: Thêm `sm:h-auto shrink-0 whitespace-nowrap`.
```tsx
// Cũ:
        className="w-11 h-11 min-w-[44px] min-h-[44px] sm:w-auto flex items-center justify-center p-0 sm:px-4 sm:py-2.5 gap-1.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold border-2 border-blue-800 shadow-[0_4px_0_0_#0f172a] active:translate-y-[3px] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"

// Mới:
        className="w-11 h-11 min-w-[44px] min-h-[44px] sm:w-auto sm:h-auto shrink-0 whitespace-nowrap flex items-center justify-center p-0 sm:px-4 sm:py-2.5 gap-1.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold border-2 border-blue-800 shadow-[0_4px_0_0_#0f172a] active:translate-y-[3px] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
```

- **Tọa độ Dòng 334 (Nút Đàm Phán)**: Thêm `sm:h-auto shrink-0 whitespace-nowrap`.
```tsx
// Cũ:
        className={`w-11 h-11 min-w-[44px] min-h-[44px] sm:w-auto flex items-center justify-center p-0 sm:px-4 sm:py-2.5 gap-1.5 rounded-2xl font-bold border-2 transition-all text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${

// Mới:
        className={`w-11 h-11 min-w-[44px] min-h-[44px] sm:w-auto sm:h-auto shrink-0 whitespace-nowrap flex items-center justify-center p-0 sm:px-4 sm:py-2.5 gap-1.5 rounded-2xl font-bold border-2 transition-all text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
```

- **Tọa độ Dòng 358 (Nút Quy Hoạch)**: Thêm `sm:h-auto shrink-0 whitespace-nowrap`.
```tsx
// Cũ:
        className={`w-11 h-11 min-w-[44px] min-h-[44px] sm:w-auto flex items-center justify-center p-0 sm:px-4 sm:py-2.5 gap-1.5 rounded-2xl bg-[#F7F2E7] hover:bg-amber-100 text-slate-900 font-bold border-2 border-slate-900 shadow-[0_4px_0_0_#0f172a] active:translate-y-[3px] transition-all text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${

// Mới:
        className={`w-11 h-11 min-w-[44px] min-h-[44px] sm:w-auto sm:h-auto shrink-0 whitespace-nowrap flex items-center justify-center p-0 sm:px-4 sm:py-2.5 gap-1.5 rounded-2xl bg-[#F7F2E7] hover:bg-amber-100 text-slate-900 font-bold border-2 border-slate-900 shadow-[0_4px_0_0_#0f172a] active:translate-y-[3px] transition-all text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
```

- **Tọa độ Dòng 379 (Nút Hết Lượt)**: Thêm `sm:h-auto shrink-0 whitespace-nowrap`.
```tsx
// Cũ:
        className={`w-11 h-11 min-w-[44px] min-h-[44px] sm:w-auto flex items-center justify-center p-0 sm:px-4 sm:py-2.5 gap-1.5 rounded-2xl transition-all text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${

// Mới:
        className={`w-11 h-11 min-w-[44px] min-h-[44px] sm:w-auto sm:h-auto shrink-0 whitespace-nowrap flex items-center justify-center p-0 sm:px-4 sm:py-2.5 gap-1.5 rounded-2xl transition-all text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
```

---

## V. KẾ HOẠCH KIỂM THỬ HỢP ĐỒNG (STATION 1: RED CONTRACT TESTS)

Tạo tệp: `tests/contracts/imp198_desktop_actiondock_layout.test.ts` gồm 16 atomic tests phân bố qua 5 Facets, tuân thủ nghiêm ngặt Michigan/Detroit style (render React thực tế, BANNED static source checklist):

- **Facet 1: Khung Bọc Desktop Không Bị Bóp Nghẹt & An Toàn Tablet (Boundary & Container Layout)**
  - `[TC-198.01/MSS]`: `HudContainer` render DOM không chứa class `sm:max-w-md` trên container bọc ActionDock.
  - `[TC-198.02/MSS]`: `HudContainer` render container với `sm:max-w-none` và `sm:min-w-0` để ActionDock mở rộng tự nhiên.
  - `[TC-198.03/MSS]`: `HudContainer` khối bọc `TelemetryBadge` render class `shrink-0`.
  - `[TC-198.04/MSS]`: `InlineBotTradeStrip` render container với `sm:max-w-md` độc lập.

- **Facet 2: Bất Biến Chữ 1 Hàng Đơn (Single-Line Text & Anti-Wrap Invariant)**
  - `[TC-198.05/MSS]`: Nút Quản Lý BĐS render có `whitespace-nowrap` và `shrink-0`.
  - `[TC-198.06/MSS]`: Nút Đàm Phán render có `whitespace-nowrap` và `shrink-0`.
  - `[TC-198.07/MSS]`: Nút Quy Hoạch render có `whitespace-nowrap` và `shrink-0`.
  - `[TC-198.08/MSS]`: Nút Hết Lượt render có `whitespace-nowrap` và `shrink-0`.

- **Facet 3: Chiều Cao Linh Hoạt & Đồng Bộ Chân Đáy (Height Adaptability & Alignment)**
  - `[TC-198.09/MSS]`: Nút Quản Lý BĐS render có `sm:h-auto`.
  - `[TC-198.10/MSS]`: Nút Đàm Phán và Quy Hoạch render có `sm:h-auto`.
  - `[TC-198.11/MSS]`: Nút Hết Lượt render có `sm:h-auto`.
  - `[TC-198.12/MSS]`: Nút Đổ Xúc Xắc và Nút Bảo Lãnh Kiểm Toán render có `whitespace-nowrap` và `shrink-0`.

- **Facet 4: Bảo Toàn Công Thái Học Mobile & Triệt Tiêu Đè Lấn DOM (Observable Behavior)**
  - `[TC-198.13/MSS]`: 4 nút phụ bảo toàn `w-11 h-11 min-w-[44px] min-h-[44px]` và `hidden sm:inline` cho nhãn chữ trên mobile.
  - `[TC-198.14/MSS]`: **Observable DOM Assertion**: Khi `useGameStore.pendingTradeOffer` có `sellerId === 'p1'`, render `<ActionDock localPlayerId="p1" />` và assert DOM không chứa `bot-pacing-chip` hay `notice-chip` (triệt tiêu đè lấn 183px). Ngược lại, khi không có offer, chip render bình thường.

- **Facet 5: Tuân Thủ Tiêu Chuẩn Nghệ Thuật 2D & Ngân Sách LOC (Craft & Budget Gate)**
  - `[TC-198.15/MSS]`: `action_dock.tsx` và `hud_container.tsx` đạt 0 vi phạm 4 anti-patterns Impeccable.
  - `[TC-198.16/MSS]`: `action_dock.tsx` duy trì nghiêm ngặt `<= 400 LOC` (chính xác 397 LOC).

---

## VI. QUY TRÌNH THỰC THI 3 TRẠM (STATION PIPELINE)

1. **Trạm 1 (Station 1: QA RED)**: `qa-tester` tạo `tests/contracts/imp198_desktop_actiondock_layout.test.ts` và chạy vitest chứng minh fail (Inversion Gate).
2. **Trạm 2 (Station 2: GREEN)**: `implementer` chỉnh sửa clean code trên `action_dock.tsx`, `hud_container.tsx`, `bot_trade_offer_strip.tsx`:
   - Xác thực 16/16 test trong `imp198_desktop_actiondock_layout.test.ts` PASS 100%.
   - Chạy `npx vitest run tests/contracts/imp193_mobile_ergonomics_auction_and_copy_polish.test.ts` xác thực trần 400 LOC không bị vượt.
   - Chạy toàn bộ 329 test suites repo PASS 100%.
   - Chạy `npm run lint:ui` đạt 0 vi phạm.
3. **Trạm 2.5 (Station 2.5: Sweeping Scout Audit)**: `scout` quét đĩa vật lý kiểm tra 5 universal defect archetypes.
4. **Visual Spot-Inspection (Browser Testing)**: Chụp screenshot desktop và mobile, gọi `view_file` kiểm tra trực tiếp tọa độ ActionDock và nút bấm.
5. **Trạm 3 (Station 3: Review)**: `spec-reviewer`, `code-reviewer`, `ui-craft-reviewer` kiểm tra đĩa vật lý độc lập và phê duyệt.
