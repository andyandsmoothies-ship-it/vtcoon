# KẾ HOẠCH TRIỂN KHAI CHI TIẾT (TICKET IMP-239 — REVISION 1.2)
# TỐI ƯU CÔNG THÁI HỌC KHÔNG GIAN & ĐỒNG BỘ GIAO DIỆN DESKTOP TOÀN DIỆN
# (Desktop Full-Spectrum UI/UX & Spatial Ergonomics Harmonization)

> **Mã Ticket**: IMP-239  
> **Phiên bản**: Revision 1.2 (Re-audited per Griller & User Directives)  
> **Mức độ ưu tiên**: P1 (Cao)  
> **Phân loại rủi ro**: Tier 2 (Full Rigor — UI Components, Layout & Spatial Parity, > 50 LOC)  
> **Quy trình áp dụng**: 4-Station Closed-Loop Pipeline (`qa-tester` RED -> `implementer` GREEN -> `scout` PREFILTER -> `spec-reviewer` 3.1 -> `code-reviewer` & `ui-craft-reviewer` 3.2 -> `chaos-sentinel` Station 4).  
> **Tài liệu kiểm toán cơ sở**: [`docs/reports/uat/SLOW_GAME_DESKTOP_UIUX_AUDIT.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/SLOW_GAME_DESKTOP_UIUX_AUDIT.md) (27 ảnh chụp thực tế 1920×1080).
> **Báo cáo kiểm toán đối kháng**: [`.agents/audit/PLAN_AUDIT_IMP-239.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-239.md)

---

## 0. BẢNG ĐỐI CHIẾU CHỈ THỊ KIỂM TOÁN (REVISION DIRECTIVE CLOSURE TABLE — ANTI-SYCOPHANCY)

| Mã Chỉ Thị | Mức Độ | Nội Dung Chỉ Thị Từ Đánh Giá / Kiểm Toán | Vị Trí Xử Lý Trong Plan Rev 1.2 | Cơ Chế Khắc Phục Vật Lý |
| :---: | :---: | :--- | :--- | :--- |
| **DIR-1** | **P1** | `compulsory_buyout_modal.tsx#L16,L44-50`: Khi `eligibleTargets` là `number[]`, dòng 44 `find` thất bại khiến `currentTarget` bị kẹt ở ô 1 dù bấm chọn ô khác; prop type dòng 16 gây lỗi tsc. | **Task 7** (Snippets 7.1, 7.2, 7.3, 7.4) | Cập nhật `CompulsoryBuyoutModalProps` hỗ trợ `(BuyoutTargetOption \| number)[]`, import `useMemo`, chuẩn hóa `normalizedTargets` trước khi tìm `currentTarget`, đồng bộ cả selector. |
| **DIR-2** | **P2** | `tests/contracts/imp239_desktop_spatial_ergonomics.test.ts` (TC-DSE-05): Không thể đo lường pixel cắt chữ trong môi trường headless Vitest / JSDOM. | **Mục 5** (`TC-DSE-05`) | Quy định rõ `TC-DSE-05` kiểm tra sự hiện diện đầy đủ của 4 người chơi trong DOM/VDOM (kể cả người đã rút lui có `line-through`), phối hợp với kiểm tra CSS `sm:max-h-28 md:max-h-32` tại `TC-DSE-04`. |
| **DIR-3** | **P2** | `trade_partner_strip.tsx#L73,L79`: Nguy cơ xô lệch subpixel khi nội dung `needBadgeText` mang `md:max-w-none` trong modal 672px. | **Task 3** (Snippet 3.1) | Bổ sung `min-w-0` trên thẻ nút cha `button` để flexbox co bóp mượt mà, bảo tồn 100% test `imp236`. |
| **DIR-4** | **P1** | Toàn bộ 7 LOC baseline trong Bảng đo lường Mục 2 bị lệch +1 dòng (off-by-1) do cách đếm thô bao gồm dòng trống cuối file (trailing newline). | **Mục 2** & `scripts/audit_plan.mjs` | Điều chỉnh 7 baseline LOC về đúng chuẩn vật lý của `scripts/check_loc.mjs`: `modal_host.tsx` (493), `auction_modal.tsx` (462), `trade_partner_strip.tsx` (117), `trade_sentiment_meter.tsx` (104), `title_deed_modal.tsx` (363), `title_deed_action_footer.tsx` (219), `compulsory_buyout_modal.tsx` (257). |
| **DIR-5** | **P1** | Task 3 AFTER: `min-w-0 shrink-0` trên name container `div` là mâu thuẫn semantic (shrink-0 ngăn co lại trong khi flexbox defense cần name span shrink và truncate). | **Task 3** (Snippet 3.1) & **FM1** & `TC-DSE-07` | Loại bỏ `shrink-0` khỏi name container `div` (giữ `min-w-0`), bổ sung `shrink-0` vào `needBadgeText` span (bên cạnh balance span đã có `shrink-0`) để flexbox co bóp tên đối tác đúng chuẩn. |
| **DIR-6** | **P2** | Task 6: `shortfall ?? 0` trên L156 trở thành dead fallback sau khi đã guard `shortfall !== undefined && shortfall > 0`. | **Task 6** (Snippet 6.1) | Dọn dẹp dead fallback, đổi `{formatCurrency(shortfall ?? 0)}` thành `{formatCurrency(shortfall)}`, tận dụng TypeScript type narrowing an toàn tuyệt đối. |

---

## 1. MỤC TIÊU & BỐI CẢNH VẬT LÝ

Đợt kiểm toán vật lý 27 màn hình Desktop (1920×1080 Full HD) tại [`docs/reports/uat/SLOW_GAME_DESKTOP_UIUX_AUDIT.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/SLOW_GAME_DESKTOP_UIUX_AUDIT.md) đã xác nhận các khuyết tật hiển thị nghiêm trọng chỉ phát sinh trên màn hình lớn:
1. **Lệch phải cực đoan các Modal quyết định trọng yếu**: `GameOverModal`, `HoseModal`, `InsolvencyBanner`, `BotTradeOfferModal`, `CompulsoryBuyoutModal` bị dạt sang mép phải (`md:justify-end md:pr-10`) do `center={false}` ngầm định trong `modal_host.tsx`, để trống hơn 70% màn hình bên trái.
2. **Cắt ngang người chơi thứ 4 trong sàn đấu giá**: `auction_modal.tsx` kẹp trần `sm:max-h-20` (80px) làm đường viền cắt đứt đôi dòng chữ của người chơi thứ 4.
3. **Tên đối tác bị đè bẹp thành `Bot ...` trong dải chọn P2P**: Huy hiệu nhu cầu bung rộng trên desktop đẩy vùng tên đối tác co lại dưới 24px.
4. **Trùng lặp tính cách & lồng ngoặc kép**: `trade_sentiment_meter.tsx` hiển thị `(Bot AI 1 (Táo Bạo))` và lặp từ `Táo Bạo` 2 lần.
5. **Cắt cụt cấp C3 `Quần thể Resort...` khi có Độc Quyền**: Khung modal Sổ Đỏ hẹp (`md:max-w-2xl`) khiến huy hiệu Độc Quyền xén mất chữ của cấp C3.
6. **Thông báo mâu thuẫn "Thiếu 0"**: Footer Sổ Đỏ hiển thị `⚠️ Số dư không đủ (Thiếu 0)` khi người chơi thừa tiền mặt.
7. **Phòng vệ `Ô #undefined` & Lỗi lệch ô chọn trong Mua Lại Cưỡng Chế**: Chuẩn hóa xử lý mảng đầu vào linh hoạt và cập nhật `currentTarget`.

---

## 2. BẢNG ĐO LƯỜNG LOC BASELINE & NGÂN SÁCH (CHECK:LOC)

*Đo lường tự động qua `npm run check:loc` (xử lý chuẩn trailing newline theo quy chuẩn tệp vật lý):*

| Physical File | Tier Classification | Baseline LOC | Delta Dự Kiến | Post-LOC Dự Kiến | Trần Quy Định | Trạng Thái Ngân Sách |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| `src/client/ui/modals/modal_host.tsx` | Tier 2 (UI/Views) | **493** | 0 | 493 | <= 500 | ✔️ An toàn (Thay thế 1 dòng) |
| `src/client/ui/modals/auction_modal.tsx` | Tier 2 (UI/Views) | **462** | 0 | 462 | <= 500 | ✔️ An toàn (Thay thế 1 dòng) |
| `src/client/ui/modals/trade/trade_partner_strip.tsx` | Tier 2 (UI/Views) | **117** | 0 | 117 | <= 500 | ✔️ An toàn |
| `src/client/ui/modals/trade_sentiment_meter.tsx` | Tier 2 (UI/Views) | **104** | +1 | 105 | <= 500 | ✔️ An toàn |
| `src/client/ui/modals/title_deed_modal.tsx` | Tier 2 (UI/Views) | **363** | 0 | 363 | <= 500 | ✔️ An toàn |
| `src/client/ui/modals/title_deed_action_footer.tsx` | Tier 2 (UI/Views) | **219** | 0 | 219 | <= 500 | ✔️ An toàn |
| `src/client/ui/modals/compulsory_buyout_modal.tsx` | Tier 2 (UI/Views) | **257** | +15 | 272 | <= 500 | ✔️ An toàn (Dưới 500 LOC) |
| `tests/contracts/imp239_desktop_spatial_ergonomics.test.ts` | Test Suite | **0** | +320 | 320 | <= 600 | ✔️ An toàn (Mới) |

---

## 3. LIỆT KÊ 5 PHƯƠNG THỨC THẤT BẠI (FAILURE MODES ENUMERATION)

1. **FM1 (Hồi quy lớp CSS của `imp236`)**: Việc sửa độ rộng huy hiệu hoặc tên bot trong `trade_partner_strip.tsx` có thể phá vỡ test `[TC-DVP-08]` hoặc `[TC-DVP-09]` trong `imp236_desktop_uiux_viewport_harmonization.test.ts` vốn kiểm tra chuỗi cứng `truncate max-w-[120px]`, `sm:max-w-[180px]`, `md:max-w-none`.  
   *Phòng vệ*: Bảo tồn 100% các lớp CSS trên, bổ sung `min-w-0` tại thẻ cha `button`, giữ `min-w-0` trên thẻ `div` bọc tên đối tác (loại bỏ `shrink-0` để tránh mâu thuẫn ngữ nghĩa với `truncate`), và bổ sung `shrink-0` tại thẻ `needBadgeText` span (bên cạnh balance span) để ngăn flexbox đè bẹp các thành phần cố định.
2. **FM2 (Tràn trần LOC `modal_host.tsx`)**: File `modal_host.tsx` hiện có 493 dòng, kề cận trần 500 dòng. Nếu thêm nhiều dòng mã sẽ gây vi phạm quy tắc LOC Budget.  
   *Phòng vệ*: Sử dụng drop-in thay thế đúng 1 dòng duy nhất (`center={activeModal !== 'deed'}` thay thế dòng `center={activeModal === ...}`), giữ nguyên delta = 0 dòng, bảo đảm tổng số dòng là 493.
3. **FM3 (Căn giữa nhầm Sổ Đỏ làm che khuất ô 3D)**: Nếu vô tình căn giữa cả modal Sổ Đỏ (`deed`), người chơi trên Desktop sẽ bị che khuất ô đất 3D mà camera đang soi cận cảnh.  
   *Phòng vệ*: Điều kiện `center={activeModal !== 'deed'}` bảo đảm duy nhất modal `deed` vẫn giữ cơ chế neo phải (`center=false` kích hoạt `md:justify-end md:pr-10`).
4. **FM4 (Hồi quy kiểm tra thiếu tiền `shortfall`)**: Khi chặn cảnh báo thiếu tiền `shortfall > 0`, nếu logic làm ẩn cả trường hợp người chơi thực sự thiếu tiền sẽ gây lỗi hồi quy test `TC-209.07`.  
   *Phòng vệ*: Kết hợp chặt chẽ `!canBuy && !isTradeFrozen && shortfall !== undefined && shortfall > 0`.
5. **FM5 (Lệch trạng thái chi tiết khi đổi ô chọn trong CompulsoryBuyoutModal)**: Khi `eligibleTargets` truyền vào mảng số `[1, 6]`, nếu chỉ xử lý ở JSX `.map` mà không chuẩn hóa `currentTarget`, thẻ chi tiết bên dưới vẫn kẹt ở ô 1 dù người chơi bấm ô 6.  
   *Phòng vệ*: Chuẩn hóa `normalizedTargets` bằng `useMemo` ngay đầu component và tìm `currentTarget` từ `normalizedTargets`.

---

## 4. CHI TIẾT CÁC DROP-IN SNIPPETS (KÈM BEFORE / AFTER CHÍNH XÁC)

### Task 1: Căn giữa đối xứng toàn bộ Modal quyết định trọng yếu trên Desktop (`modal_host.tsx`)
- **Target physical file**: `src/client/ui/modals/modal_host.tsx`
- **Vị trí**: Dòng 127–131
- **Hàm bao bọc**: `ModalHost`
- **Mô tả**: Chuyển `center={activeModal !== 'deed'}` để đưa tất cả các modal quyết định (`game_over`, `hose`, `insolvency`, `bot_trade_offer`, `compulsory_buyout`, v.v.) về chính giữa màn hình Desktop, trong khi vẫn bảo tồn cơ chế neo phải cho riêng Sổ Đỏ (`deed`).

```tsx
<<<<
    <ModalBackdrop
      onClose={handleBackdropClose}
      center={activeModal === 'auction' || activeModal === 'event' || activeModal === 'portfolio'}
      dismissible={!isCriticalDecision}
    >
====
    <ModalBackdrop
      onClose={handleBackdropClose}
      center={activeModal !== 'deed'}
      dismissible={!isCriticalDecision}
    >
>>>>
```

---

### Task 2: Chống cắt ngang người chơi thứ 4 trong sàn đấu giá (`auction_modal.tsx`)
- **Target physical file**: `src/client/ui/modals/auction_modal.tsx`
- **Vị trí**: Dòng 296
- **Hàm bao bọc**: `AuctionModal`
- **Mô tả**: Nâng chiều cao container danh sách đại gia từ `sm:max-h-20` (80px) lên `sm:max-h-28 md:max-h-32` (112px - 128px) để 4 người chơi hiển thị trọn vẹn, không bị đường viền dưới cắt ngang thân chữ.

```tsx
<<<<
            <div className="space-y-0.5 sm:space-y-1 max-h-16 sm:max-h-20 overflow-y-auto pr-1 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
====
            <div className="space-y-0.5 sm:space-y-1 max-h-16 sm:max-h-28 md:max-h-32 overflow-y-auto pr-1 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
>>>>
```

---

### Task 3: Chống đè bẹp tên đối tác thành `Bot ...` trong giao dịch P2P (`trade_partner_strip.tsx`)
- **Target physical file**: `src/client/ui/modals/trade/trade_partner_strip.tsx`
- **Vị trí**: Dòng 73–91
- **Hàm bao bọc**: `TradePartnerStrip`
- **Mô tả**: Bổ sung `min-w-0` trên thẻ nút cha `button`, giữ nguyên `min-w-0` trên container tên đối tác (không gắn `shrink-0` để name span được phép shrink và truncate đúng ngữ nghĩa), và bổ sung `shrink-0` trên thẻ `needBadgeText` span (cùng với balance span đã có `shrink-0`). Bảo tồn 100% các lớp CSS cũ (`truncate max-w-[120px] sm:max-w-[180px] md:max-w-none` và `truncate max-w-[90px] md:max-w-none`) để không phá vỡ test `imp236`.

```tsx
<<<<
                className={`partner-selector-tab min-h-[44px] px-2 py-2 rounded-xl border-2 text-xs transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  isSelected
                    ? 'bg-amber-500 text-amber-950 border-amber-700 shadow-[0_3px_0_0_#b45309] active:shadow-[0_1px_0_0_#b45309] active:translate-y-[2px] font-black'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 shadow-sm active:translate-y-[1px]'
                }`}
              >
                <div className="flex items-center gap-1 min-w-0">
                  <span>{isBot ? (persBadge?.icon ?? '🤖') : '👤'}</span>
                  <span className="truncate max-w-[120px] sm:max-w-[180px] md:max-w-none font-bold">{formatShortPlayerName(partner.name)}</span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-mono px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded bg-black/10 font-bold shrink-0">
                  {formatCurrency(partner.balance)}
                </span>
                {needBadgeText && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold truncate max-w-[90px] md:max-w-none hidden sm:inline-block">
                    {needBadgeText}
                  </span>
                )}
====
                className={`partner-selector-tab min-w-0 min-h-[44px] px-2 py-2 rounded-xl border-2 text-xs transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  isSelected
                    ? 'bg-amber-500 text-amber-950 border-amber-700 shadow-[0_3px_0_0_#b45309] active:shadow-[0_1px_0_0_#b45309] active:translate-y-[2px] font-black'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 shadow-sm active:translate-y-[1px]'
                }`}
              >
                <div className="flex items-center gap-1 min-w-0">
                  <span>{isBot ? (persBadge?.icon ?? '🤖') : '👤'}</span>
                  <span className="truncate max-w-[120px] sm:max-w-[180px] md:max-w-none font-bold">{formatShortPlayerName(partner.name)}</span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-mono px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded bg-black/10 font-bold shrink-0">
                  {formatCurrency(partner.balance)}
                </span>
                {needBadgeText && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold truncate max-w-[90px] md:max-w-none hidden sm:inline-block shrink-0">
                    {needBadgeText}
                  </span>
                )}
>>>>
```

---

### Task 4: Khử trùng lặp tính cách & lồng ngoặc trong thước đo đồng thuận (`trade_sentiment_meter.tsx`)
- **Target physical file**: `src/client/ui/modals/trade_sentiment_meter.tsx`
- **Vị trí**: Dòng 2 và Dòng 71–72
- **Hàm bao bọc**: `TradeSentimentMeter`
- **Mô tả**: Import `formatShortPlayerName` và bọc tên đối tác để loại bỏ nhãn tính cách thừa trong tên, kết xuất sạch sẽ `Tâm Lý Đồng Thuận AI (Bot AI 1)` thay vì `Tâm Lý Đồng Thuận AI (Bot AI 1 (Táo Bạo))`.

#### Snippet 4.1 — Import (Dòng 2)
```tsx
<<<<
import React from 'react';
import type { BotTradeSentimentResult } from './trade_intelligence';
====
import React from 'react';
import type { BotTradeSentimentResult } from './trade_intelligence';
import { formatShortPlayerName } from '../ui_helpers';
>>>>
```

#### Snippet 4.2 — Tiêu đề (Dòng 71–73)
```tsx
<<<<
          <span className="text-slate-900 tracking-tight truncate min-w-0" title={`Tâm Lý Đồng Thuận AI (${partnerName})`}>
            Tâm Lý Đồng Thuận AI ({partnerName})
          </span>
====
          <span className="text-slate-900 tracking-tight truncate min-w-0" title={`Tâm Lý Đồng Thuận AI (${formatShortPlayerName(partnerName)})`}>
            Tâm Lý Đồng Thuận AI ({formatShortPlayerName(partnerName)})
          </span>
>>>>
```

---

### Task 5: Mở rộng không gian Sổ Đỏ Desktop chống cắt chữ C3 (`title_deed_modal.tsx`)
- **Target physical file**: `src/client/ui/modals/title_deed_modal.tsx`
- **Vị trí**: Dòng 153 và Dòng 264
- **Hàm bao bọc**: `TitleDeedModal`
- **Mô tả**: Mở rộng chiều rộng modal Desktop từ `md:max-w-2xl` (672px) lên `md:max-w-[730px]`, tinh chỉnh tỷ lệ 2 cột sang `md:grid-cols-[1fr_1.15fr]` để cấp C3 `Quần thể Resort/TTTM` không bị cắt cụt khi xuất hiện huy hiệu Độc Quyền.

#### Snippet 5.1 — Chiều rộng Modal (Dòng 152–154)
```tsx
<<<<
    <div
      className="relative w-full max-w-md md:max-w-2xl max-h-[90dvh] md:max-h-[85vh] bg-[#FFFDF8] border-2 border-slate-900 rounded-2xl shadow-[0_6px_0_0_#0f172a] ring-2 ring-slate-900/10 overflow-hidden flex flex-col pointer-events-auto animate-in zoom-in-90 fade-in duration-200 ease-out select-none p-2.5 sm:p-4 text-slate-900"
      data-testid="title-deed-modal"
    >
====
    <div
      className="relative w-full max-w-md md:max-w-[730px] max-h-[90dvh] md:max-h-[85vh] bg-[#FFFDF8] border-2 border-slate-900 rounded-2xl shadow-[0_6px_0_0_#0f172a] ring-2 ring-slate-900/10 overflow-hidden flex flex-col pointer-events-auto animate-in zoom-in-90 fade-in duration-200 ease-out select-none p-2.5 sm:p-4 text-slate-900"
      data-testid="title-deed-modal"
    >
>>>>
```

#### Snippet 5.2 — Tỷ lệ lưới 2 cột Desktop (Dòng 264)
```tsx
<<<<
        <div className="flex flex-col md:grid md:grid-cols-2 gap-2.5 sm:gap-3.5 items-start">
====
        <div className="flex flex-col md:grid md:grid-cols-[1fr_1.15fr] gap-2.5 sm:gap-3.5 items-start">
>>>>
```

---

### Task 6: Phòng vệ cảnh báo thiếu tiền Sổ Đỏ & Dọn dẹp dead fallback (`title_deed_action_footer.tsx`)
- **Target physical file**: `src/client/ui/modals/title_deed_action_footer.tsx`
- **Vị trí**: Dòng 150–157
- **Hàm bao bọc**: `TitleDeedActionFooter`
- **Mô tả**: Bổ sung điều kiện `shortfall !== undefined && shortfall > 0` để chỉ hiển thị dòng cảnh báo thiếu tiền khi người chơi thực sự thiếu tiền, triệt tiêu lỗi in chuỗi mâu thuẫn "Thiếu 0". Đồng thời dọn dẹp dead fallback `{formatCurrency(shortfall ?? 0)}` thành `{formatCurrency(shortfall)}` nhờ TypeScript type narrowing an toàn tuyệt đối.

```tsx
<<<<
          {/* Cảnh báo thiếu tiền (chỉ khi thiếu tiền và thị trường không đóng băng) */}
          {!canBuy && !isTradeFrozen && (
            <div
              className="col-span-2 w-full py-1.5 px-3 rounded-xl bg-amber-50 border border-amber-300/80 text-amber-900 text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-0.5 sm:gap-1"
              data-testid="insufficient-funds-notice"
            >
              <span>⚠️ Số dư không đủ (Thiếu {formatCurrency(shortfall ?? 0)})</span>
====
          {/* Cảnh báo thiếu tiền (chỉ khi thiếu tiền và thị trường không đóng băng) */}
          {!canBuy && !isTradeFrozen && shortfall !== undefined && shortfall > 0 && (
            <div
              className="col-span-2 w-full py-1.5 px-3 rounded-xl bg-amber-50 border border-amber-300/80 text-amber-900 text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-0.5 sm:gap-1"
              data-testid="insufficient-funds-notice"
            >
              <span>⚠️ Số dư không đủ (Thiếu {formatCurrency(shortfall)})</span>
>>>>
```

---

### Task 7: Chuẩn hóa `normalizedTargets` & Phòng vệ dữ liệu Mua Lại Cưỡng Chế (`compulsory_buyout_modal.tsx`)
- **Target physical file**: `src/client/ui/modals/compulsory_buyout_modal.tsx`
- **Vị trí**: Dòng 2, Dòng 16, Dòng 44–50, Dòng 135–141
- **Hàm bao bọc**: `CompulsoryBuyoutModal`
- **Mô tả**: Khắc phục triệt để khiếm khuyết P1: Import `useMemo`, cập nhật prop `eligibleTargets?: readonly (BuyoutTargetOption | number)[]`, chuẩn hóa `normalizedTargets` trước khi tìm `currentTarget`, và đồng bộ hóa biến trong selector. Đảm bảo khi bấm chọn ô khác, toàn bộ thông tin giá tiền, tên BĐS và đối thủ đều cập nhật chính xác.

#### Snippet 7.1 — Import `useMemo` (Dòng 2)
```tsx
<<<<
import React, { useEffect, useState } from 'react';
====
import React, { useEffect, useState, useMemo } from 'react';
>>>>
```

#### Snippet 7.2 — Cập nhật Prop Interface (Dòng 16)
```tsx
<<<<
  readonly eligibleTargets?: readonly BuyoutTargetOption[];
====
  readonly eligibleTargets?: readonly (BuyoutTargetOption | number)[];
>>>>
```

#### Snippet 7.3 — Chuẩn hóa `normalizedTargets` & Cập nhật `currentTarget` (Dòng 44–50)
```tsx
<<<<
  const currentTarget = eligibleTargets?.find((t) => t.cellIndex === selectedCell) ?? {
    cellIndex,
    sellerId,
    cost,
    basePrice,
  };
====
  const normalizedTargets: readonly BuyoutTargetOption[] | undefined = useMemo(() => {
    if (!eligibleTargets) return undefined;
    return eligibleTargets.map((t) =>
      typeof t === 'number'
        ? {
            cellIndex: t,
            sellerId: Object.values(playersInfo).find((p) => p.ownedProperties?.includes(t))?.id ?? sellerId,
            cost: Math.floor((BOARD_CONFIG[t]?.price ?? 1000) * 1.3),
            basePrice: BOARD_CONFIG[t]?.price ?? 1000,
          }
        : t
    );
  }, [eligibleTargets, playersInfo, sellerId]);

  const currentTarget = normalizedTargets?.find((t) => t.cellIndex === selectedCell) ?? {
    cellIndex,
    sellerId,
    cost,
    basePrice,
  };
>>>>
```

#### Snippet 7.4 — Đồng bộ hóa Selector với `normalizedTargets` (Dòng 135–141)
```tsx
<<<<
        {/* Selector nếu có nhiều hơn 1 ô đất C0 hợp lệ */}
        {eligibleTargets && eligibleTargets.length > 1 && (
          <div data-testid="buyout-cell-selector" className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Chọn Ô Đất Mục Tiêu ({eligibleTargets.length} ô C0):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {eligibleTargets.map((target) => {
====
        {/* Selector nếu có nhiều hơn 1 ô đất C0 hợp lệ */}
        {normalizedTargets && normalizedTargets.length > 1 && (
          <div data-testid="buyout-cell-selector" className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Chọn Ô Đất Mục Tiêu ({normalizedTargets.length} ô C0):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {normalizedTargets.map((target) => {
>>>>
```

---

## 5. HỢP ĐỒNG KIỂM THỬ TRẠM 1 (Station 1 - QA MANDATE - 16 ATOMIC TESTS)

Suite kiểm thử được thiết lập tại:  
`tests/contracts/imp239_desktop_spatial_ergonomics.test.ts` (Tệp mới cần tạo)

### Facet 1: Modal Centering & Spatial Symmetry on Desktop (TC-DSE-01..03)
- `TC-DSE-01`: [TC-DSE-01/MSS][UC-IMP239] ModalHost truyen center={true} cho GameOverModal, HoseModal, InsolvencyBanner, BotTradeOfferModal va CompulsoryBuyoutModal
- `TC-DSE-02`: [TC-DSE-02/MSS][UC-IMP239] ModalHost duy tri center={false} rieng cho TitleDeedModal de bao ton tam nhin o dat 3D tren Desktop
- `TC-DSE-03`: [TC-DSE-03/MSS][UC-IMP239] ModalBackdrop render backdrop-blur-xs va can giua items-center justify-center khi center={true}

### Facet 2: Auction Participant Clearance & Overflow Defense (TC-DSE-04..06)
- `TC-DSE-04`: [TC-DSE-04/MSS][UC-IMP239] AuctionModal ap dung sm:max-h-28 md:max-h-32 cho danh sach dai gia tham gia dau gia
- `TC-DSE-05`: [TC-DSE-05/MSS][UC-IMP239] AuctionModal ket xuat day du 4 phan tu dai gia trong DOM/VDOM voi line-through cho nguoi rut lui va nhan (Ban)
- `TC-DSE-06`: [TC-DSE-06/MSS][UC-IMP239] AuctionModal bao ton day du cac nut dat gia +100, +200, +500 va nut Rut Lui trong viewport

### Facet 3: Trade Partner Strip & Sentiment Hygiene (TC-DSE-07..10)
- `TC-DSE-07`: [TC-DSE-07/MSS][UC-IMP239] TradePartnerStrip ap dung min-w-0 tren button, giu min-w-0 tren container ten doi tac va shrink-0 tren badge nhu cau
- `TC-DSE-08`: [TC-DSE-08/MSS][UC-IMP239] TradePartnerStrip bao ton nguyen ven cac lop CSS truncate max-w-[120px] sm:max-w-[180px] md:max-w-none cua imp236
- `TC-DSE-09`: [TC-DSE-09/MSS][UC-IMP239] TradeSentimentMeter khu bo hau to tinh cach khoi partnerName bang formatShortPlayerName
- `TC-DSE-10`: [TC-DSE-10/MSS][UC-IMP239] TradeSentimentMeter khong chua long ngoac kep hoac lap lai tinh cach (Bot AI 1 (Tao Bao))

### Facet 4: Title Deed Desktop Dimensions & C3 Monopoly No-Truncation (TC-DSE-11..13)
- `TC-DSE-11`: [TC-DSE-11/MSS][UC-IMP239] TitleDeedModal mo rong chieu rong toi da tren Desktop thanh md:max-w-[730px]
- `TC-DSE-12`: [TC-DSE-12/MSS][UC-IMP239] TitleDeedModal ap dung luoi 2 cot md:grid-cols-[1fr_1.15fr] tang khong gian cho bang cuoc
- `TC-DSE-13`: [TC-DSE-13/MSS][UC-IMP239] TitleDeedModal hien thi day du nhan C3 Quan the Resort/TTTM khi co huy hieu Doc Quyen x1.5

### Facet 5: Defensive Data Resilience & Shortfall Notice Sanity (TC-DSE-14..16)
- `TC-DSE-14`: [TC-DSE-14/MSS][UC-IMP239] TitleDeedActionFooter an thong bao thieu tien khi shortfall <= 0 hoac undefined mac du canBuy = false
- `TC-DSE-15`: [TC-DSE-15/MSS][UC-IMP239] TitleDeedActionFooter van hien thi canh bao Thieu {shortfall} khi shortfall > 0 va canBuy = false
- `TC-DSE-16`: [TC-DSE-16/MSS][UC-IMP239] CompulsoryBuyoutModal ket xuat an toan ten o dat va gia tien khi eligibleTargets la mang so nguyen va cap nhat currentTarget khi click

---

## 6. DANH MỤC SUITE KIỂM THỬ HỒI QUY BẮT BUỘC (REGRESSION MATRIX)

Sau khi hoàn tất Trạm 2, các suite kiểm thử liên quan sau BẮT BUỘC phải vượt qua 100%:
1. `tests/contracts/imp236_desktop_uiux_viewport_harmonization.test.ts` (Bảo đảm không gãy contract Desktop của IMP-236)
2. `tests/contracts/imp238_mobile_typography_and_micro_ergonomics.test.ts` (Bảo đảm không gãy cải tiến Mobile của IMP-238)
3. `tests/contracts/imp209_clean_single_row_purchase_footer.test.ts` (Bảo đảm tính đúng đắn của Footer Sổ Đỏ)
4. `tests/contracts/imp204_property_purchase_affordance.test.ts` (Bảo đảm tính đúng đắn của cơ chế mua đất)
5. `tests/client/ui04_business_modals.test.ts` (Bảo đảm toàn bộ modal kinh doanh không bị lỗi giao diện)
