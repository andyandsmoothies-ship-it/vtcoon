# KẾ HOẠCH TRIỂN KHAI: IMP-215 (CROSS-PLATFORM UI/UX & BROWSER HARDENING)
## BẢN GIA CỐ SAU PHẢN BIỆN ĐỐI KHÁNG (POST-GRILLING FORTIFIED PLAN)

> **Mã Ticket**: `IMP-215`  
> **Tên Ticket**: Chiến Dịch Gia Cố & Tối Ưu Hóa UI/UX Đa Nền Tảng & Trình Duyệt  
> **Phân Loại**: Tier 2 (Full Rigor — Áp dụng Quy Trình 3 Trạm: Station 1 RED -> Station 2 GREEN -> Station 2.5 Scout -> Station 3 Review)  
> **Mục Tiêu**: Giải quyết triệt để 8 khuyết tật phát hiện trong Báo Cáo Kiểm Toán (DEF-01 đến DEF-08), đảm bảo khả năng tương thích 100% trên Desktop (1920x1080, 1366x768, 1280x720) và Mobile (360px, 390px, 414px) cùng 4 trình duyệt chính (Chrome, Edge, Firefox, Safari).

---

## 1. PHẠM VI & MỤC TIÊU CỐT LÕI (SCOPE & OBJECTIVES)

1. **Khử Lỗi iOS Safari Auto-Zoom (DEF-01)**:
   - Nâng font size của các thẻ `<input>` trên thiết bị di động lên `text-base` (16px), chống việc Safari trên iPhone tự động phóng to trang web làm lệch tâm sa bàn 3D.
   - Áp dụng tại [`welcome_hub_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/lobby/welcome_hub_modal.tsx#L123) (`text-base sm:text-sm`) và [`trade_column.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/trade/trade_column.tsx#L179) (`text-base sm:text-xs`).
2. **Khắc Phục Tràn Đáy & Viewport MasterplanModal (DEF-02 & P2)**:
   - Thay thế `h-[88vh] max-h-[92vh]` bằng `h-[88dvh] max-h-[92dvh]` để thích ứng hoàn hảo với thanh địa chỉ động của Safari iOS.
   - Tháo dỡ ràng buộc cứng `min-h-[520px]`, thay bằng `min-h-0 sm:min-h-[480px]` để chống tràn đáy trên màn hình di động xoay ngang.
   - **(P2 Fix)**: Loại bỏ triệt để dead code `shadow-[0_8px_0_0_#0f172a]` đứng trước compound shadow `shadow-[0_8px_0_0_#0f172a,0_16px_36px_rgba(15,23,42,0.18)]` tại L113.
3. **Giới Hạn Bề Ngang Drawer Nhật Ký Trên Mobile (DEF-03)**:
   - Bổ sung `w-[85vw] max-w-xs sm:w-80 md:w-96` và `h-[100dvh]` cho [`activity_feed_sidebar.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/activity_feed_sidebar.tsx#L173), bảo đảm luôn chừa lại lớp nền mờ (backdrop) tối thiểu 15vw để người dùng chạm đóng dễ dàng.
4. **Hóa Giải Xung Đột CSS `truncate` & `line-clamp-2` (DEF-04)**:
   - Loại bỏ class `truncate` (`white-space: nowrap`) tại [`market_event_ticker.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/market_event_ticker.tsx#L248) và [`auction_district_card.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/auction_district_card.tsx#L67), khôi phục khả năng ngắt dòng 2 hàng tự nhiên của `line-clamp-2 break-words`.
5. **Tối Ưu Khoảng Đệm Ngang Cho GameOverModal Trên Mobile 360px (DEF-05)**:
   - Tinh chỉnh `p-6` thành `p-3.5 sm:p-6` tại [`game_over_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/game_over_modal.tsx#L157), mở rộng thêm 20px không gian hữu dụng cho Bảng Xếp Hạng và Báo Cáo FinTech trên màn hình nhỏ.
6. **Chống Cắt Cụt Subtitle Giá Sàn Đấu Giá (DEF-06)**:
   - Thay `truncate whitespace-nowrap` thành `line-clamp-1 sm:whitespace-nowrap` tại [`auction_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/auction_modal.tsx#L168).
7. **Làm Mỏng Thanh Cuộn Mặc Định Trên Firefox (DEF-07)**:
   - Thêm quy tắc toàn cục vào `@layer base` trong [`src/client/index.css`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/index.css#L4-L8):
     `* { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }`.
8. **Hòa Giải Test Suite Cũ Khớp Chuẩn Mở Rộng & Bảo Toàn Coverage (DEF-08 & P1)**:
   - Khắc phục 2 test fail trong [`tests/client/impeccable_tactile_modals.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/impeccable_tactile_modals.test.ts):
     - Test 1 (L21): Đồng bộ responsive bounds `max-w-md md:max-w-2xl lg:max-w-4xl`.
     - Test 2 (L43-47): Khử class không tồn tại `active:shadow-[0_1px_0_0_#065f46]` và matcher nút Hủy đã được refactor ở IMP-212.
     - **(P1 Fix)**: Bảo toàn 100% test coverage cho visual cue của disabled button (`cursor-not-allowed`, `shadow-none`, `text-slate-400`, `disabled=""`), cấm dùng static class check (`w-full min-h-[48px]`).

---

## 2. BẢNG ĐO LƯỜNG NGÂN SÁCH LOC (LOC BUDGET MATRIX — P3 CHUẨN HÓA)

*Đo lường tự động bởi `scripts/check_loc.mjs`:*

| Tệp Vật Lý | Phân Loại Tier | Total Lines | Non-Empty SLOC | Trần Ngân Sách | Dự Kiến Sau Sửa | Phán Quyết |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `src/client/ui/lobby/welcome_hub_modal.tsx` | Tier 2 (UI Component) | 177 | 158 | <= 500 | 177 (Delta: 0) | ✔️ AN TOÀN |
| `src/client/ui/modals/trade/trade_column.tsx` | Tier 2 (UI Component) | 246 | 215 | <= 500 | 246 (Delta: 0) | ✔️ AN TOÀN |
| `src/client/ui/modals/masterplan_modal.tsx` | Tier 2 (UI Component) | 275 | 246 | <= 500 | 275 (Delta: 0) | ✔️ AN TOÀN |
| `src/client/ui/activity_feed_sidebar.tsx` | Tier 2 (UI Component) | 332 | 301 | <= 500 | 332 (Delta: 0) | ✔️ AN TOÀN |
| `src/client/ui/market_event_ticker.tsx` | Tier 2 (UI Component) | 263 | 242 | <= 500 | 263 (Delta: 0) | ✔️ AN TOÀN |
| `src/client/ui/modals/auction_district_card.tsx` | Tier 2 (UI Component) | 223 | 201 | <= 500 | 223 (Delta: 0) | ✔️ AN TOÀN |
| `src/client/ui/modals/game_over_modal.tsx` | Tier 2 (UI Component) | 404 | 362 | <= 500 | 404 (Delta: 0) | ✔️ AN TOÀN |
| `src/client/ui/modals/auction_modal.tsx` | Tier 2 (UI Component) | 442 | 398 | <= 500 | 442 (Delta: 0) | ✔️ AN TOÀN |
| `src/client/index.css` | Tier 1 (Domain/Server/Logic) | **127** | 113 | <= 400 | 131 (Delta: +4) | ✔️ AN TOÀN |

---

## 3. CHI TIẾT ĐOẠN MÃ THAY THẾ CHÍNH XÁC (EXACT DROP-IN SNIPPETS)

### Snippet 3.1: WelcomeHubModal (`src/client/ui/lobby/welcome_hub_modal.tsx`)
**Enclosing Function**: `WelcomeHubModal`  
**Target Lines**: L122-126

```tsx
<<<<
              placeholder="VTxxxx"
              maxLength={6}
              className="flex-1 min-h-[44px] px-3.5 text-center uppercase font-mono font-black tracking-widest text-sm rounded-xl bg-slate-800 border border-amber-400/40 text-amber-200 placeholder:text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-label="Nhập mã phòng 6 ký tự"
====
              placeholder="VTxxxx"
              maxLength={6}
              className="flex-1 min-h-[44px] px-3.5 text-center uppercase font-mono font-black tracking-widest text-base sm:text-sm rounded-xl bg-slate-800 border border-amber-400/40 text-amber-200 placeholder:text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-label="Nhập mã phòng 6 ký tự"
>>>>
```

---

### Snippet 3.2: TradeColumn (`src/client/ui/modals/trade/trade_column.tsx`)
**Enclosing Function**: `TradeColumn`  
**Target Lines**: L178-181

```tsx
<<<<
                onCashChange(val);
              }}
              className="flex-1 min-w-0 min-h-[44px] bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 text-center"
            />
====
                onCashChange(val);
              }}
              className="flex-1 min-w-0 min-h-[44px] bg-white border border-slate-300 rounded-lg p-2 text-base sm:text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 text-center"
            />
>>>>
```

---

### Snippet 3.3: MasterplanModal (`src/client/ui/modals/masterplan_modal.tsx`) — P2 Fortified
**Enclosing Function**: `MasterplanModal`  
**Target Lines**: L112-114  
*(Khử hoàn toàn dead code `shadow-[0_8px_0_0_#0f172a]` đứng trước compound shadow)*

```tsx
<<<<
      data-testid="masterplan-modal"
      className="relative w-full max-w-4xl h-[88vh] max-h-[92vh] min-h-[520px] bg-[#FFFDF9] border-2 border-slate-900 rounded-3xl shadow-[0_8px_0_0_#0f172a] shadow-[0_8px_0_0_#0f172a,0_16px_36px_rgba(15,23,42,0.18)] flex flex-col overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto select-none"
    >
====
      data-testid="masterplan-modal"
      className="relative w-full max-w-4xl h-[88dvh] max-h-[92dvh] min-h-0 sm:min-h-[480px] bg-[#FFFDF9] border-2 border-slate-900 rounded-3xl shadow-[0_8px_0_0_#0f172a,0_16px_36px_rgba(15,23,42,0.18)] flex flex-col overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto select-none"
    >
>>>>
```

---

### Snippet 3.4: ActivityFeedSidebar (`src/client/ui/activity_feed_sidebar.tsx`)
**Enclosing Function**: `ActivityFeedSidebar`  
**Target Lines**: L172-177

```tsx
<<<<
        aria-hidden={!isActivityFeedOpen}
        className={`fixed top-0 right-0 h-full w-80 md:w-96 z-30 bg-[#FBF7EE] border-l-2 border-slate-900 shadow-2xl flex flex-col transition-transform duration-300 ease-out text-slate-900 select-none ${
          isActivityFeedOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
        } ${className}`}
        data-testid="activity-feed-sidebar"
====
        aria-hidden={!isActivityFeedOpen}
        className={`fixed top-0 right-0 h-[100dvh] w-[85vw] max-w-xs sm:w-80 md:w-96 z-30 bg-[#FBF7EE] border-l-2 border-slate-900 shadow-2xl flex flex-col transition-transform duration-300 ease-out text-slate-900 select-none ${
          isActivityFeedOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
        } ${className}`}
        data-testid="activity-feed-sidebar"
>>>>
```

---

### Snippet 3.5: MarketEventTicker (`src/client/ui/market_event_ticker.tsx`)
**Enclosing Function**: `MarketEventTicker`  
**Target Lines**: L246-252

```tsx
<<<<
              <span
                data-testid="market-ticker-effect-summary"
                className="font-semibold text-[11px] sm:text-xs text-slate-700 truncate min-w-0 line-clamp-2"
              >
                {formula}
              </span>
====
              <span
                data-testid="market-ticker-effect-summary"
                className="font-semibold text-[11px] sm:text-xs text-slate-700 min-w-0 line-clamp-2 break-words"
              >
                {formula}
              </span>
>>>>
```

---

### Snippet 3.6: AuctionDistrictCard (`src/client/ui/modals/auction_district_card.tsx`)
**Enclosing Function**: `AuctionDistrictCard`  
**Target Lines**: L66-69

```tsx
<<<<
      <div className="flex justify-between items-center gap-1 mb-0.5 min-w-0">
        <span className="font-bold text-slate-900 line-clamp-2 leading-tight text-[10px] sm:text-xs block min-w-0 truncate" title={cell.name}>
          {cell.name}
        </span>
====
      <div className="flex justify-between items-center gap-1 mb-0.5 min-w-0">
        <span className="font-bold text-slate-900 line-clamp-2 leading-tight text-[10px] sm:text-xs block min-w-0 break-words" title={cell.name}>
          {cell.name}
        </span>
>>>>
```

---

### Snippet 3.7: GameOverModal (`src/client/ui/modals/game_over_modal.tsx`)
**Enclosing Function**: `GameOverModal`  
**Target Lines**: L156-159

```tsx
<<<<
    <div
      className="w-full max-w-xl max-h-[90dvh] overflow-y-auto bg-[#FFFDF8] border-2 border-slate-900 rounded-2xl shadow-[0_6px_0_0_#0f172a] p-6 text-slate-900 flex flex-col relative animate-in fade-in zoom-in-95 duration-200 select-none"
      data-testid="game-over-modal"
    >
====
    <div
      className="w-full max-w-xl max-h-[90dvh] overflow-y-auto bg-[#FFFDF8] border-2 border-slate-900 rounded-2xl shadow-[0_6px_0_0_#0f172a] p-3.5 sm:p-6 text-slate-900 flex flex-col relative animate-in fade-in zoom-in-95 duration-200 select-none"
      data-testid="game-over-modal"
    >
>>>>
```

---

### Snippet 3.8: AuctionModal (`src/client/ui/modals/auction_modal.tsx`)
**Enclosing Function**: `AuctionModal`  
**Target Lines**: L167-170

```tsx
<<<<
            <h2 className="font-black text-slate-900 text-xs sm:text-sm md:text-base truncate whitespace-nowrap leading-tight">
              {deed?.name ?? `Ô #${cellIndex}`}
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-600 truncate whitespace-nowrap mt-0.5">
====
            <h2 className="font-black text-slate-900 text-xs sm:text-sm md:text-base truncate whitespace-nowrap leading-tight">
              {deed?.name ?? `Ô #${cellIndex}`}
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-600 line-clamp-1 sm:whitespace-nowrap mt-0.5">
>>>>
```

---

### Snippet 3.9: Stylesheet Index (`src/client/index.css`)
**Enclosing Scope**: `@layer base`  
**Target Lines**: L4-8

```css
<<<<
@layer base {
  * {
    box-sizing: border-box;
  }
}
====
@layer base {
  * {
    box-sizing: border-box;
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 transparent;
  }
}
>>>>
```

---

### Snippet 3.10: Reconcile Test Suite (`tests/client/impeccable_tactile_modals.test.ts`) — P1 Fortified
**Enclosing Function**: `it('P1: TradeModal has responsive fallback...')` & `it('P2: TradeModal action buttons...')`  
**Target Lines**: L21 & L28-48

```ts
<<<<
    expect(html).toContain('max-w-md lg:max-w-lg');
====
    expect(html).toContain('max-w-md md:max-w-2xl lg:max-w-4xl');
>>>>
```

Và bảo toàn 100% test coverage cho visual cue của disabled button (khử class ảo không tồn tại, cấm static class check):

```ts
<<<<
  it('P2: TradeModal action buttons use tactile shadows instead of active:scale-95', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'p2',
        myProperties: [1],
        targetProperties: [3],
        myBalance: 5000,
        initialOffered: [1],
        initialRequested: [3],
        onClose: () => {},
      })
    );
    const footerMatch = html.match(/<footer[^>]*>([\s\S]*?)<\/footer>/);
    const footerHtml = footerMatch ? footerMatch[1] : html;
    expect(footerHtml).not.toContain('active:scale-95');
    expect(footerHtml).toContain('shadow-[0_4px_0_0_#065f46]');
    expect(footerHtml).toContain('active:shadow-[0_1px_0_0_#065f46]');
    expect(footerHtml).toContain('active:translate-y-[3px]');
    expect(footerHtml).toMatch(/shadow-\[0_4px_0_0_#64748b\]|shadow-xs/);
  });
====
  it('P2: TradeModal action buttons use tactile shadows instead of active:scale-95 and preserve disabled visual cue', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'p2',
        myProperties: [1],
        targetProperties: [3],
        myBalance: 5000,
        initialOffered: [1],
        initialRequested: [3],
        onClose: () => {},
      })
    );
    const footerMatch = html.match(/<footer[^>]*>([\s\S]*?)<\/footer>/);
    const footerHtml = footerMatch ? footerMatch[1] : html;
    expect(footerHtml).not.toContain('active:scale-95');
    expect(footerHtml).toContain('shadow-[0_4px_0_0_#065f46]');
    expect(footerHtml).toContain('active:translate-y-[3px]');

    // Disabled visual cue coverage: Khẳng định trạng thái vô hiệu hóa có đầy đủ chỉ báo trực quan
    const disabledHtml = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'p2',
        myProperties: [],
        targetProperties: [],
        myBalance: 0,
        onClose: () => {},
      })
    );
    const disabledFooterMatch = disabledHtml.match(/<footer[^>]*>([\s\S]*?)<\/footer>/);
    const disabledFooterHtml = disabledFooterMatch ? disabledFooterMatch[1] : disabledHtml;
    expect(disabledFooterHtml).toContain('cursor-not-allowed');
    expect(disabledFooterHtml).toContain('shadow-none');
    expect(disabledFooterHtml).toContain('text-slate-400');
    expect(disabledFooterHtml).toContain('disabled=""');
  });
>>>>
```

---

## 4. MA TRẬN 16 ATOMIC CONTRACT TESTS (UNIVERSAL 5-FACET MATRIX — P4 & P5 FORTIFIED)

Tệp kiểm thử hợp đồng mới: `tests/contracts/imp215_cross_platform_and_browser_hardening.test.ts` (1-4 asserts/test, zero loops trong `it()`, không dùng checklist tĩnh `fs.existsSync`, 100% component render assertions).

### Facet 1: iOS Safari Auto-Zoom Immunity (Input Font-Size >= 16px)
- **TC-215.01**: `WelcomeHubModal`: Ô nhập mã phòng (`placeholder="VTxxxx"`) chứa class `text-base` trên thiết bị di động.
- **TC-215.02**: `WelcomeHubModal`: Ô nhập mã phòng chứa class `sm:text-sm` để giữ kích thước hài hòa trên màn hình lớn.
- **TC-215.03**: `TradeColumn`: Ô nhập số tiền mặt chuyển nhượng chứa class `text-base` chống auto-zoom trên mobile.
- **TC-215.04**: `TradeColumn`: Ô nhập số tiền mặt chứa class `sm:text-xs` để bảo toàn kích thước nhỏ gọn trên Desktop.

### Facet 2: Dynamic Viewport & Screen Bounds Protection (dvh & Clamping)
- **TC-215.05**: `MasterplanModal`: Sử dụng `h-[88dvh]` và `max-h-[92dvh]`, không chứa `88vh` đơn lẻ.
- **TC-215.06**: `MasterplanModal`: Chứa `min-h-0 sm:min-h-[480px]`, khẳng định không còn chứa `min-h-[520px]` gây tràn đáy di động.
- **TC-215.07**: `ActivityFeedSidebar`: Chứa class `w-[85vw] max-w-xs`, đảm bảo chừa tối thiểu 15vw cho backdrop trên mobile 360px.
- **TC-215.08**: `ActivityFeedSidebar`: Chứa class `h-[100dvh]`, đồng bộ chuẩn xác với thanh địa chỉ động của Safari iOS.

### Facet 3: Typography & Multi-Line Clamping Integrity (Zero Truncate Conflicts)
- **TC-215.09**: `MarketEventTicker`: Thẻ tóm tắt tác động (`market-ticker-effect-summary`) KHÔNG còn chứa class `truncate`.
- **TC-215.10**: `MarketEventTicker`: Thẻ tóm tắt tác động chứa `line-clamp-2 break-words` cho phép ngắt 2 dòng tự nhiên.
- **TC-215.11**: `AuctionDistrictCard`: Tiêu đề ô đất KHÔNG còn chứa thuộc tính `truncate` đi kèm với `line-clamp-2`, chứa `break-words`.
- **TC-215.12**: `AuctionModal`: Dòng phụ thông tin giá sàn đấu giá chứa `line-clamp-1 sm:whitespace-nowrap`, không bị ép cứng `truncate whitespace-nowrap`.

### Facet 4: Mobile Ergonomics & Cross-Browser Scrollbar Preservation (P4 Fortified)
- **TC-215.13**: `GameOverModal`: Chứa padding đáp ứng `p-3.5 sm:p-6`, giải phóng thêm 20px không gian trên mobile 360px.
- **TC-215.14**: `TitleDeedModal`: Vùng nội dung cuộn (`title-deed-modal`) bảo toàn trọn vẹn bộ 4 utility class khử thanh cuộn đa trình duyệt: `scrollbar-none`, `[scrollbar-width:none]`, `[-ms-overflow-style:none]`, và `[&::-webkit-scrollbar]:hidden`.
- **TC-215.15**: `GameOverModal`: Toàn bộ các nút tab chuyển đổi (`Bảng Xếp Hạng`, `Báo Cáo FinTech`, `Tài Sản & Danh Mục`) đều đạt touch target tối thiểu `min-h-[44px]` trong vùng đệm co giãn `p-3.5 sm:p-6`.

### Facet 5: Specification Evolution & Direct Component Bounds Verification (P5 Fortified)
- **TC-215.16**: `TradeModal`: Render HTML trực tiếp chứa class kích thước mở rộng đáp ứng `max-w-md md:max-w-2xl lg:max-w-4xl` (Khẳng định trực tiếp trên DOM, triệt tiêu hoàn toàn banned indirect assertions).

---

## 5. QUY TRÌNH THỰC HIỆN 3 TRẠM (AUTONOMOUS 3-STATION EXECUTION)

```
[Main Agent] ── Tiếp thu P1-P5 ──> Cập nhật Kế hoạch Hoàn Hảo (Fortified Plan)
                                          │
                                          ▼
[Station 1: QA RED] ─────────────────> `qa-tester` tạo tests/contracts/imp215_*.test.ts (Chứng minh RED 16/16)
                                          │
                                          ▼
[Station 2: GREEN] ──────────────────> `implementer` áp dụng 10 exact drop-in snippets vào src/** và tests/client/ (Chứng minh 16/16 PASS)
                                          │
                                          ▼
[Station 2.5: Scout Sweep] ──────────> `scout` quét 5 mẫu khuyết tật phổ quát trên các file đã sửa
                                          │
                                          ▼
[Station 3: Reviewers Gate] ─────────> `spec-reviewer`, `ui-craft-reviewer`, `code-reviewer` audit vật lý trên đĩa
                                          │
                                          ▼
[Evidence & Sign-off] ───────────────> Cập nhật snapshot evidence (.agents/evidence/imp215_snapshot.json) và ledger hoàn tất
```
