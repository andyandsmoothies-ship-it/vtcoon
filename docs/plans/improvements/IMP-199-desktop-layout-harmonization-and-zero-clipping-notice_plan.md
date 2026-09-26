# KẾ HOẠCH KỸ THUẬT: IMP-199 (ĐÃ TIẾP THU REVIEW TOÀN DIỆN)
# TOÀN DIỆN HÓA BỐ CỤC DESKTOP & TRIỆT TIÊU LỖI CẮT XÉN CHIP THÔNG BÁO
## (Comprehensive Desktop Layout Harmonization & Zero-Clipping Notice Architecture)

> **Mã số**: IMP-199  
> **Mức độ ưu tiên**: P1 (Critical Polish & Layout Decollision)  
> **Trạng thái kiểm toán**: ✅ **HARDENED_APPROVED** (Đã tiếp thu phán quyết review chính thức [CB-1 đến CB-5] & audit từ `plan-griller`)  
> **Phạm vi tác động**: `src/client/ui/action_dock.tsx`, `src/client/ui/hud_container.tsx`, `src/client/ui/floating_numbers.tsx`, `src/client/ui/top_bar.tsx`, `src/client/ui/activity_feed_sidebar.tsx`, `src/client/ui/modals/compulsory_buyout_modal.tsx`, `src/client/ui/modals/property_portfolio_modal.tsx`, `src/client/ui/modals/event_card_modal.tsx`.  
> **Quy trình thực thi**: Quy trình 3 trạm (Station 1: RED -> Station 2: GREEN -> Station 2.5: Scout -> Station 3: Review).

---

## I. BỐI CẢNH & HIỆN TRẠNG VẬT LÝ (6 BẪY BỐ CỤC DESKTOP)

Qua rà soát hệ thống và kiểm thử thực địa qua Edge CDP (`.agents/tmp/test_overflow_chip.ts` và ảnh thực tế `docs/reports/uat/screenshots/imp198/test_audit_chip.jpg`), phát hiện 6 bẫy vật lý nghiêm trọng:

1. **[P1 - NGHIÊM TRỌNG] Bẫy Tàng Hình Chip Thông Báo ActionDock (`overflow-x-auto` Clips `-top-10` Notice Chip)**:
   - *Vị trí*: [`src/client/ui/action_dock.tsx#L211-L231`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/action_dock.tsx#L211-L231).
   - *Cơ chế lỗi*: `<nav>` mang class `overflow-x-auto`. Theo quy chuẩn CSS W3C (Overflow Module Level 3), khi một trục được gán `overflow-x: auto/scroll`, trục `overflow-y` tự động chuyển thành `auto` (thay vì `visible`). Chip thông báo (`actionDockNotice`: `audit-notice-chip`, `bot-pacing-chip`, `skip-turn-notice-chip`) mang class `absolute -top-10` nằm bên trong `<nav>`, nên toàn bộ phần nhô lên trên đỉnh 40px bị trình duyệt cắt bỏ (clip) 100%!
   - *Bằng chứng*: Ảnh `test_audit_chip.jpg` chứng minh khi `inAudit: true`, nút `Bảo Lãnh (500) 2 lượt` hiển thị bình thường nhưng `audit-notice-chip` hoàn toàn biến mất trên màn hình.

2. **[P2 - BỐ CỤC ĐÈ LẤN] Bẫy Nhảy Nấc Đếm Sự Kiện Gây Đè Lấn 44px Giữa Floating Numbers & Ticker (`activeMarketCount === 2`)**:
   - *Vị trí*: [`src/client/ui/floating_numbers.tsx#L206-L211`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/floating_numbers.tsx#L206-L211).
   - *Cơ chế lỗi*: Biểu thức ternary nhảy cóc từ `>= 3` xuống thẳng `>= 1`, bỏ qua hoàn toàn trường hợp `activeMarketCount === 2`. Khi có 2 sự kiện thị trường cùng kích hoạt, chiều cao của `MarketEventTicker` là ~68px, cộng với `TopBar` (44px) và padding màn hình (24px) khiến đáy của Ticker xuống tới `24 + 44 + 4 + 68 = 140px`. Nhưng `FloatingNumbers` lại nhận `sm:top-24` (96px), dẫn đến thông báo số tiền bay đè lấn 44px trực tiếp lên thẻ sự kiện thứ 2 trên Desktop!

3. **[P3 - XUNG ĐỘT VIEWPORT ĐÁY] Bẫy Va Chạm Cụm Nút Camera & ActionDock/BotTradeStrip (Cả Mobile & Laptop/Tablet 1024px - 1280px) [CB-3]**:
   - *Vị trí*: [`src/client/ui/hud_container.tsx#L74-L82`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/hud_container.tsx#L74-L82).
   - *Breakdown công thức định lượng (Empirical & Computed)*:
     - **Mốc 122px (Desktop Laptop ActionDock + BotTradeStrip)**:
       + Padding đáy footer: `12px` (`sm:pb-3`).
       + Chiều cao ActionDock: `~56px`. Đỉnh ActionDock = `12 + 56 = 68px`.
       + Chiều cao BotTradeStrip: `~48px`.
       + Khoảng cách gap giữa strip và dock: `6px` (`gap-1.5`).
       + Tổng cao độ đỉnh BotTradeStrip: `68 + 48 + 6 = 122px` (Xác thực thực nghiệm qua CDP bounding box).
       + Khi camera pill ở `bottom-24` (96px), nút camera bị ActionDock/Strip đè lấn 26px!
     - **Mốc 108px (Mobile ActionDock + Notice Chip)**:
       + Padding đáy footer mobile: `~12px`.
       + Chiều cao ActionDock mobile: `~56px`. Đỉnh ActionDock = `68px`.
       + Notice Chip offset: `absolute -top-10` (-40px) có chiều cao 32px.
       + Tọa độ đỉnh cao nhất của Notice Chip: `68 + 40 = 108px` (Xác thực thực nghiệm qua CDP bounding box).
       + Khi camera pill ở `bottom-24` (96px), nút camera đè lấn 12px lên đỉnh chip thông báo khi xoay bàn cờ trên di động!

4. **[P4 - CHUẨN MỰC THẨM MỸ & WCAG] Xung Đột Chiều Cao Khối Tiện Ích TopBar (`sm:h-8 sm:min-h-[44px]` bên trong `h-10 sm:h-11`) [CB-4]**:
   - *Vị trí*: [`src/client/ui/top_bar.tsx#L142, L148, L161, L174, L198`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/top_bar.tsx#L142).
   - *Cơ chế lỗi*: Khối bọc ngoài `hud-utilities-cluster` có class `h-10 sm:h-11` (44px) kèm viền `border-2` (lòng trong chỉ còn 40px). Các nút con bên trong vừa có `sm:h-8` (32px) vừa có `sm:min-h-[44px]` (44px) + viền + đổ bóng `shadow-[0_2px_0_0_#0f172a]`. Vì `min-height` ghi đè `height`, nút con bị ép tối thiểu 44px + 2px shadow = 46px, khiến đổ bóng đáy nút chạm sát hoặc lem ra ngoài viền đáy của thanh TopBar trên Desktop.
   - *Xác nhận Overflow [CB-4]*: Đã kiểm tra trực tiếp mã nguồn `top_bar.tsx#L142`: container `hud-utilities-cluster` **HOÀN TOÀN KHÔNG CÓ `overflow-hidden`**. Do đó, lớp phủ ảo `after:absolute after:-inset-1.5` mở rộng hit area tự do ra ngoài nút bấm mà không bị clip, bảo toàn 100% vùng chạm công thái học WCAG 44px.

5. **[P5 - CÔNG THÁI HỌC MODAL] Thiếu Ngăn Chặn Tràn Viewport Trên `CompulsoryBuyoutModal` & Sử Dụng `vh` Cũ**:
   - *Vị trí*: [`src/client/ui/modals/compulsory_buyout_modal.tsx#L61`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/compulsory_buyout_modal.tsx#L61), [`property_portfolio_modal.tsx#L103`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/property_portfolio_modal.tsx#L103), [`event_card_modal.tsx#L89`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/event_card_modal.tsx#L89).
   - *Cơ chế lỗi*: `CompulsoryBuyoutModal` thiếu `max-h-[90dvh]` và `overflow-y-auto`, không thể cuộn trên màn hình laptop thấp (768px). Đồng thời, `PropertyPortfolioModal` và `EventCardModal` vẫn sử dụng `max-h-[90vh]` cũ.

6. **[P6 - TRẢI NGHIỆM ĐA TÁC VỤ DESKTOP] ActivityFeedSidebar Mất Tương Tác Bấm Đóng Ra Ngoài Màn Hình (`md:hidden` trên backdrop)**:
   - *Vị trí*: [`src/client/ui/activity_feed_sidebar.tsx#L166`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/activity_feed_sidebar.tsx#L166).
   - *Cơ chế lỗi*: Backdrop bị ẩn trên `md:` (`md:hidden`), trong khi sidebar rộng tới 384px che khuất `PlayerHudList` và các nút TopBar bên phải. Không có backdrop và không có click-outside handler khiến người chơi không thể click ra bàn cờ bên trái để đóng drawer.

---

## II. GIẢI PHÁP KIẾN TRÚC & KỸ THUẬT (TIẾP THU ĐẦY ĐỦ PHẢN BIỆN)

### 1. Kiến Trúc Zero-Clipping Notice Chip (Giải quyết P1 & CB-2)
- **Chỉ dẫn kiến trúc [CB-2]**: Lưu ý thẻ `<nav>` **ĐÃ CÓ SẴN CLASS `relative`**. Giải pháp là **DI CHUYỂN** chip thông báo ra khỏi thẻ `<nav>` và đặt vào thẻ wrapper `div.relative.flex.flex-col.items-center`, **TUYỆT ĐỐI KHÔNG PHẢI thêm relative vào nav**:
  ```tsx
  return (
    <div className="relative flex flex-col items-center">
      {/* Chip Thông Báo Ngữ Cảnh Độc Quyền - DI CHUYỂN ra ngoài nav overflow để không bị clip */}
      {actionDockNotice && !isTradeStripActive && (
        <div
          data-testid={actionDockNotice.type === 'bot_pacing' ? 'bot-pacing-chip' : `${actionDockNotice.type === 'skip_turn' ? 'skip-turn-notice-chip' : `${actionDockNotice.type}-notice-chip`}`}
          className={`absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold shadow-md animate-pulse select-none ${
            actionDockNotice.tone === 'error'
              ? 'bg-rose-950 text-rose-300 border border-rose-500/60'
              : actionDockNotice.tone === 'warning'
              ? 'bg-amber-950 text-amber-300 border border-amber-500/60'
              : 'bg-slate-850 text-amber-300 border border-amber-500/40'
          }`}
        >
          <span aria-hidden="true">{actionDockNotice.icon}</span>
          <span className="sm:hidden">{actionDockNotice.mobileText}</span>
          <span className="hidden sm:inline">{actionDockNotice.desktopText}</span>
        </div>
      )}

      {/* Nav giữ nguyên relative và overflow-x-auto cho thanh nút cuộn ngang */}
      <nav
        className="relative pointer-events-auto flex items-center gap-1.5 min-[360px]:gap-2 md:gap-3 bg-[#FFFDF8] border-2 border-slate-900 shadow-[0_4px_0_0_#0f172a] rounded-2xl p-1.5 sm:p-2.5 px-2.5 min-[360px]:px-3.5 sm:px-5 max-w-[calc(100vw-1rem)] overflow-x-auto no-scrollbar"
        aria-label="Thanh điều khiển tác vụ"
      >
        ...
      </nav>
    </div>
  );
  ```
- **Bảo toàn LOC Tier 1**: Lược bỏ 2 dòng trống thừa trong `action_dock.tsx`, bảo đảm Delta LOC = 0 (giữ vững chính xác 376 SLOC / 397 raw lines <= trần 400 LOC).

### 2. Định Lượng Tọa Độ Floating Numbers Decollision Chuẩn Xác (Giải quyết P2)
- Ma trận tính toán cao độ đáy Ticker trên Desktop (`md:p-6` = 24px + `TopBar` 44px + `mt-1` 4px = 72px đỉnh):
  - 0 thẻ sự kiện: Đáy TopBar = 68px. Offset an toàn: `80px` (`top-20 sm:top-20`).
  - 1 thẻ sự kiện (32px): Đáy Ticker = `72 + 32 = 104px`. Offset an toàn: `112px` (`top-28 sm:top-28`).
  - 2 thẻ sự kiện (68px): Đáy Ticker = `72 + 68 = 140px`. Offset an toàn: `144px` (`top-36 sm:top-36`).
  - >= 3 thẻ sự kiện (104px): Đáy Ticker = `72 + 104 = 176px`. Offset an toàn: `176px` (`top-44 sm:top-44`).
- Cập nhật biểu thức phân nấc trong `src/client/ui/floating_numbers.tsx`:
  ```ts
  const stackTopClass =
    activeMarketCount >= 3
      ? 'top-44 sm:top-44'
      : activeMarketCount === 2
      ? 'top-36 sm:top-36'
      : activeMarketCount >= 1
      ? 'top-28 sm:top-28'
      : 'top-20 sm:top-20';
  ```

### 3. Tách Biệt Cao Độ Cụm Nút Camera Cả Hai Môi Trường (Giải quyết P3 & CB-3)
- Trong `src/client/ui/hud_container.tsx#L74`:
  Cập nhật class định vị:
  ```tsx
  <div className="pointer-events-none fixed bottom-28 sm:bottom-32 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-2 max-w-[95vw]">
  ```
  - **Trên Mobile (<640px)**: Đưa lên `bottom-28` (112px), vượt qua đỉnh Notice Chip (108px), triệt tiêu 100% va chạm với nút camera khi xoay bàn cờ trên di động.
  - **Trên Desktop/Laptop (sm: >=640px)**: Đưa lên `sm:bottom-32` (128px), vượt cao hơn đỉnh ActionDock + BotTradeStrip (122px), loại bỏ hoàn toàn va chạm trên laptop 1024px - 1280px.
  - Loại bỏ tiền tố `md:bottom-32` dư thừa.

### 4. Chuẩn Hóa Box-Sizing & Padding Thở TopBar Utilities (Giải quyết P4 & CB-4)
- Trong `src/client/ui/top_bar.tsx`:
  Tại các nút L148 (TimeOfDay), L161 (Mute), L174 (ActivityFeed), L198 (LeaveRoom):
  - Bỏ `sm:min-h-[44px]`.
  - Đổi thành: `sm:h-8 sm:min-w-[36px]`.
  - Container không có `overflow-hidden` nên `after:absolute after:-inset-1.5` hit area mở rộng 44px đầy đủ không bị cản trở.
  - Nút cao 32px nằm gọn gàng bên trong lòng 40px của container `sm:h-11`, tạo khoảng đệm trên 4px và dưới 4px, đổ bóng `shadow-[0_2px_0_0_#0f172a]` có breathing room 2px hoàn hảo.

### 5. Chuẩn Hóa Viewport Ergonomics Triad Cho Modals (Giải quyết P5)
- `src/client/ui/modals/compulsory_buyout_modal.tsx`:
  Thêm `max-h-[90dvh] overflow-y-auto` vào container chính ở L61.
- `src/client/ui/modals/property_portfolio_modal.tsx`:
  Thay thế in-place `max-h-[90vh]` -> `max-h-[90dvh]` tại L103 (Delta LOC = 0, giữ 470 SLOC <= 500 LOC).
- `src/client/ui/modals/event_card_modal.tsx`:
  Thay thế in-place `max-h-[90vh]` -> `max-h-[90dvh]` tại L89.

### 6. Cải Tiến Công Thái Học Đóng Drawer & Chuẩn Hóa Tailwind z-20 (Giải quyết P6 & CB-5)
- **Chuẩn hóa Tailwind z-index [CB-5]**: Thay thế toàn bộ dự kiến `z-25` bằng `z-20` (chuẩn token Tailwind CSS, không thêm token rác):
  - `TopBar` trong `HudContainer` bọc `relative z-30` để các nút Mute và Toggle không bị backdrop che:
    ```tsx
    {/* Tầng đỉnh: Top Bar thông tin vòng đấu, timer, kho bạc - Nổi trên backdrop Z-20 */}
    <div className="relative z-30 pointer-events-none">
      <TopBar onLeaveRoom={onLeaveRoom} />
    </div>
    ```
  - Trong `src/client/ui/activity_feed_sidebar.tsx`:
    Gỡ bỏ `md:hidden`, đặt backdrop `z-20` (nằm dưới Sidebar z-30 và TopBar z-30):
    ```tsx
    {isActivityFeedOpen && (
      <div
        data-testid="activity-feed-backdrop"
        onClick={() => setOpen(false)}
        className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-20 pointer-events-auto"
        aria-hidden="true"
      />
    )}
    ```

---

## III. PRE-FLIGHT BLAST RADIUS AUDIT (3-WAY MATRIX)

| Trục Đánh Giá | Đối Tượng Ảnh Hưởng | Kịch Bản Rủi Ro | Biện Pháp Phòng Vệ & Kiểm Thử |
| :--- | :--- | :--- | :--- |
| **1. Downstream Consumers** | `HudContainer`, `ActionDock`, `FloatingNumbersOverlay`, `TopBar`, `ActivityFeedSidebar`, Modals | Thay đổi cấu trúc wrapper ActionDock làm lệch vị trí render nút hoặc vỡ các selector test cũ | Test hợp đồng kiểm tra React DOM render thực tế qua `renderToStaticMarkup`, kiểm tra đầy đủ các `data-testid` (`bot-pacing-chip`, `audit-notice-chip`, `skip-turn-notice-chip`). |
| **2. Upstream Modifiers** | `activeModifiers` (Thẻ thị trường MC_*, Sốt đất, Đóng băng) | Khi có 1, 2, 3 thẻ kích hoạt cùng lúc, FloatingNumbers tính sai vị trí | Phân nhánh ternary đầy đủ cho 0, 1, 2, >= 3 thẻ. Reconcile các test sống (`imp143`, `imp106`, `imp122`, `imp72`) theo chuẩn mới. |
| **3. Exceptional Lifecycle Modes** | Màn hình hẹp 1024px-1280px, BotTradeOffer kích hoạt đồng thời kiểm toán, Viewport dọc thấp (768px), Mở Drawer trên Desktop | Nút camera che nút trade; modal tràn màn hình; TopBar bị nuốt click khi mở Drawer | Nâng camera lên `bottom-28 sm:bottom-32`; bổ sung `max-h-[90dvh] overflow-y-auto`; bọc `TopBar` bằng `z-30`. |

---

## IV. BẢNG DỰ TOÁN NGÂN SÁCH DÒNG MÃ (LOC BASELINE ĐÃ HIỆU CHỈNH CHUẨN XÁC) [CB-1]

> *Ghi chú chuẩn hóa*: Cột **SLOC** biểu thị số dòng mã thực tế (Non-empty Lines theo kết quả rà soát đĩa vật lý của người dùng). Cột **Raw Lines** biểu thị tổng số dòng file bao gồm dòng trắng (dùng cho `lint:slop` và test contract).

| Tệp Mục Tiêu | Phân Hạng Tier | SLOC Hiện Tại [CB-1] | Raw Lines Hiện Tại | Delta SLOC Dự Kiến | SLOC Sau Sửa | Trần Giới Hạn | Trạng Thái Tuân Thủ |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `src/client/ui/action_dock.tsx` | Tier 1 | **376** | 397 | 0 | 376 (397 raw) | **400** | ✅ An Toàn (Delta = 0) |
| `src/client/ui/floating_numbers.tsx` | Tier 2 | **226** | 251 | +2 | 228 (253 raw) | **500** | ✅ An Toàn |
| `src/client/ui/hud_container.tsx` | Tier 2 | **108** | 121 | 0 | 108 (121 raw) | **500** | ✅ An Toàn |
| `src/client/ui/top_bar.tsx` | Tier 2 | **191** | 212 | 0 | 191 (212 raw) | **500** | ✅ An Toàn |
| `src/client/ui/activity_feed_sidebar.tsx` | Tier 2 | **314** | 333 | -1 | 313 (332 raw) | **500** | ✅ An Toàn |
| `src/client/ui/modals/compulsory_buyout_modal.tsx` | Tier 2 | **167** | 181 | 0 | 167 (181 raw) | **500** | ✅ An Toàn |
| `src/client/ui/modals/property_portfolio_modal.tsx` | Tier 2 | **470** | 494 | 0 | 470 (494 raw) | **500** | ✅ An Toàn (Thiết quân luật) |
| `src/client/ui/modals/event_card_modal.tsx` | Tier 2 | **206** | 227 | 0 | 206 (227 raw) | **500** | ✅ An Toàn |
| `tests/contracts/imp199_desktop_layout_harmonization.test.ts` | Test Suite | **0** | 0 | +260 | ~260 | **600** | ✅ Tạo Mới (Station 1) |

---

## V. CÁC BƯỚC TRIỂN KHAI THEO QUY TRÌNH 3 TRẠM

### Trạm 1: Station 1 (RED Contract Test)
- Tạo tệp kiểm thử hợp đồng: `tests/contracts/imp199_desktop_layout_harmonization.test.ts`.
- Bao phủ tối thiểu **17 atomic tests** chia thành 5 Facets theo chuẩn GEMINI.md:
  - **Facet 1: Zero-Clipping Notice Architecture (TC-199.01 - 04)**:
    - Chip thông báo render bên ngoài thẻ `<nav>` có `overflow-x-auto`.
    - Container cha của chip thông báo có class `relative flex flex-col items-center` và không chứa `overflow-x-auto`.
    - Thẻ `<nav>` vẫn giữ nguyên `overflow-x-auto no-scrollbar` cho thanh nút cuộn ngang.
    - Render đầy đủ các biến thể chip: `bot-pacing-chip`, `audit-notice-chip`, `skip-turn-notice-chip`.
  - **Facet 2: Floating Numbers Decollision & Stepped Top Offsets (TC-199.05 - 08)**:
    - `activeMarketCount === 0` -> `top-20 sm:top-20`.
    - `activeMarketCount === 1` -> `top-28 sm:top-28`.
    - `activeMarketCount === 2` -> `top-36 sm:top-36` (triệt tiêu đè lấn 44px trên desktop).
    - `activeMarketCount >= 3` -> `top-44 sm:top-44`.
  - **Facet 3: Camera Pills Vertical Clearance (TC-199.09 - 11)**:
    - Cụm nút camera trong `HudContainer` có class `bottom-28 sm:bottom-32` (không chứa `md:bottom-32`).
    - Cao độ 112px trên mobile dẹp bỏ va chạm với Notice Chip (108px); cao độ 128px trên desktop vượt qua ActionDock + BotTradeStrip (122px).
  - **Facet 4: TopBar Utilities Box-Sizing & Z-30 Layering (TC-199.12 - 14)**:
    - Các nút trong `hud-utilities-cluster` không chứa `sm:min-h-[44px]`.
    - Nút có `sm:h-8` cho phép đệm thở 4px trên dưới trong container `sm:h-11`.
    - `TopBar` được bọc bởi container có `relative z-30` trong `HudContainer`.
  - **Facet 5: Viewport Ergonomics Triad & Drawer Backdrop (TC-199.15 - 17)**:
    - `CompulsoryBuyoutModal` chứa `max-h-[90dvh]` và `overflow-y-auto`.
    - `PropertyPortfolioModal` và `EventCardModal` sử dụng `dvh` thay vì `vh`.
    - `ActivityFeedSidebar` có backdrop `z-20` không bị ẩn bởi `md:hidden`.
    - `action_dock.tsx` tuân thủ nghiêm ngặt trần `<= 400 LOC` (376 SLOC / 397 raw lines).
- Chứng minh **Inversion Gate (RED)**: Chạy vitest xác nhận các test fail đúng do code sản xuất chưa cập nhật.

### Trạm 2: Station 2 (GREEN Implementation)
- Viết mã nguồn tối thiểu để 100% tests trong `imp199_desktop_layout_harmonization.test.ts` PASS.
- **Reconcile Test Preconditions (Quy tắc Rule 4 Specification Evolution)**:
  - `tests/client/imp106_cross_platform_ui_ux_polish.test.ts`: Cập nhật test case P7.1 để khớp với backdrop mở toàn diện (bỏ `md:hidden`, gán `z-20`).
  - `tests/client/imp143_notification_safe_offsets_decollision.test.ts`: Cập nhật regex helper `gap-(?:1\.5|2)` và assertion tọa độ nấc 2 `top-36 sm:top-36`.
  - `tests/contracts/imp72_lobby_redesign_game_rules_and_desktop_framing.test.ts`: Khớp kỳ vọng số tiền sạch `15.000` và `2.000` (không còn `Tr.`).
  - `tests/contracts/imp122_comprehensive_popups.test.ts`: Khớp chuỗi class container `FloatingNumbers`.
  - Chụp ảnh CDP kiểm chứng trên 1920x1080, 1280x800, 1024x768.

### Trạm 2.5: Station 2.5 (Sweeping Scout Audit)
- Subagent `scout` quét 100% tệp sửa đổi trên đĩa để kiểm toán 5 nhóm lỗi vật lý toàn cầu.

### Trạm 3: Station 3 (Independent Reviews & Verification)
- `spec-reviewer`: Đối soát 100% diff vật lý với bản đặc tả.
- `code-reviewer`: Thẩm định chất lượng mã nguồn, anti-slop, ngân sách LOC.
- `ui-craft-reviewer`: Thẩm định thủ công ảnh chụp màn hình CDP qua `view_file`.

---

## VI. BẰNG CHỨNG HOÀN THÀNH & ĐIỀU KIỆN NGHIỆM THU (DEFINITION OF DONE)

1. `tests/contracts/imp199_desktop_layout_harmonization.test.ts` PASS 100% (17 atomic tests).
2. Toàn bộ living test suites repo PASS 100% (`npm test`).
3. `npm run lint:ui` báo 0 vi phạm (0 anti-patterns).
4. `npm run lint:slop` báo 0 vi phạm; `action_dock.tsx` <= 400 LOC; `property_portfolio_modal.tsx` <= 500 LOC.
5. Ảnh chụp màn hình CDP chứng minh:
   - Chip thông báo `audit-notice-chip` và `bot-pacing-chip` hiển thị 100% không bị cắt xén.
   - Cụm nút camera tách biệt an toàn với ActionDock trên laptop 1280x800 và 1024x768, và không đè chip trên mobile 390x844.
   - TopBar utilities nút bấm cách đều viền trên dưới 4px hoàn hảo.
6. Cập nhật `docs/domain/gotchas.md` ghi nhận bài học CSS Overflow Clipping & Desktop Decollision.
7. Viết báo cáo hoàn thành tại `docs/reports/improvements/IMP-199-desktop-layout-harmonization-and-zero-clipping-notice_report.md`.
