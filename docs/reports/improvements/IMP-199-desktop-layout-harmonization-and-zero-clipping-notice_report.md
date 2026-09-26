# BÁO CÁO NGHIỆM THU CẢI TIẾN KỸ THUẬT: IMP-199
**Mã số Ticket**: IMP-199  
**Tiêu đề**: Toàn Diện Hóa Bố Cục Desktop & Triệt Tiêu Lỗi Cắt Xén Chip Thông Báo (Comprehensive Desktop Layout Harmonization & Zero-Clipping Notice Architecture)  
**Thời gian hoàn thành**: 2026-09-26  
**Trạng thái**: **HOÀN THÀNH — PRODUCTION READY**  
**Evidence Snapshot**: `.agents/evidence/imp199_snapshot.json`  

---

## 1. TỔNG QUAN TICKET & MỤC TIÊU ĐẠT ĐƯỢC

Ticket IMP-199 tập trung giải quyết dứt điểm các lỗi layout trên Web Desktop và Mobile xuất phát từ các đợt tối ưu hóa trước đây:
1. **Triệt tiêu hoàn toàn lỗi cắt xén chip thông báo (Zero-Clipping Notice Architecture)**:
   - Dời các chip thông báo ngữ cảnh (`audit-notice-chip`, `bot-pacing-chip`, `skip-turn-notice-chip`) ra khỏi thẻ `<nav>` có `overflow-x-auto`, đặt vào wrapper cha `div.relative.flex.flex-col.items-center`.
   - Bảo toàn 100% khả năng cuộn ngang mượt mà `no-scrollbar` của ActionDock trên mobile mà không làm mất viền hoặc bóng của chip.
2. **Khử xung đột số tiền bay tài chính (Stepped Top Offsets Decollision)**:
   - Bổ sung nhánh độc lập `activeMarketCount === 2` với offset `top-36 sm:top-36` (144px > Ticker 140px), triệt tiêu hoàn toàn 44px đè lấn giữa Floating Numbers và Market Event Ticker.
3. **Phân tách cao độ cụm nút điều hướng camera (Camera Vertical Clearance)**:
   - Cập nhật cao độ cụm camera pills thành `bottom-28 sm:bottom-32`, loại bỏ lớp thừa `md:bottom-32`.
   - Tạo khoảng đệm an toàn 16px vượt qua Notice Chip (112px > 108px mobile) và vượt qua ActionDock + Strip (128px > 122px desktop).
4. **Chuẩn hóa Box-Sizing tiện ích TopBar & Phân tầng Z-Index (TopBar Box-Sizing & Layering)**:
   - Thay thế lớp `sm:min-h-[44px]` bằng `sm:h-8 sm:min-w-[36px]`, bảo vệ vùng chạm WCAG >= 44px qua lớp phủ ảo `after:absolute after:-inset-1.5`.
   - Bọc khối `TopBar` bằng `relative z-30 pointer-events-none` nổi trên Drawer Backdrop.
5. **Đồng bộ bộ ba công thái học khung nhìn (Universal Dynamic Viewport Triad)**:
   - Cập nhật chuẩn `max-h-[90dvh]` và `overflow-y-auto` trên cả 3 modal chính (`CompulsoryBuyoutModal`, `PropertyPortfolioModal`, `EventCardModal`), khai tử toàn bộ `max-h-[90vh]`.
6. **Chuẩn hóa Drawer Backdrop**:
   - Chuyển đổi backdrop ActivityFeedSidebar sang `z-20` và gỡ bỏ `md:hidden`, hỗ trợ click-outside để đóng ngăn kéo tự nhiên trên Desktop.

---

## 2. BẢNG ĐỐI SOÁT NGÂN SÁCH DÒNG MÃ (LOC TIERS)

| Tệp Mã Nguồn / Test | Phân Tầng LOC | Ngân Sách | Thực Tế (Raw) | Thực Tế (SLOC) | Tình Trạng |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/ui/action_dock.tsx` | Tier 1 (Core Action) | $\le 400$ | **397** | 376 | **ĐẠT (Delta = 0)** |
| `src/client/ui/modals/property_portfolio_modal.tsx` | Tier 2 (Complex Modal) | $\le 500$ | **494** | 470 | **ĐẠT (Delta = 0)** |
| `src/client/ui/floating_numbers.tsx` | Tier 2 (Visual Overlay) | $\le 500$ | **253** | 240 | **ĐẠT** |
| `src/client/ui/hud_container.tsx` | Tier 2 (Layout Host) | $\le 500$ | **123** | 114 | **ĐẠT** |
| `src/client/ui/top_bar.tsx` | Tier 2 (Navigation Header)| $\le 500$ | **212** | 201 | **ĐẠT** |
| `src/client/ui/activity_feed_sidebar.tsx` | Tier 2 (Drawer Widget) | $\le 500$ | **333** | 318 | **ĐẠT** |
| `src/client/ui/modals/compulsory_buyout_modal.tsx` | Tier 2 (Modal) | $\le 500$ | **181** | 168 | **ĐẠT** |
| `src/client/ui/modals/event_card_modal.tsx` | Tier 2 (Modal) | $\le 500$ | **227** | 211 | **ĐẠT** |
| `tests/contracts/imp199_desktop_layout_harmonization.test.ts` | Contract Test Suite | $\le 600$ | **365** | 342 | **ĐẠT** |

---

## 3. KẾT QUẢ KIỂM THỬ & XÁC THỰC KỸ THUẬT

1. **Hợp đồng kiểm thử (Contract Tests)**:
   - `tests/contracts/imp199_desktop_layout_harmonization.test.ts`: **18/18 atomic tests PASS (100%)**.
   - Phủ đủ 5 facets: Zero-Clipping, Decollision, Camera Clearance, TopBar Box-Sizing, Viewport Ergonomics Triad.
2. **Hồi quy toàn bộ kho mã nguồn**:
   - `npm test`: **136/136 test files PASSED, 2228/2228 tests PASSED (100% GREEN)**.
3. **Bộ linter chất lượng**:
   - `npm run lint:ui`: **0 anti-patterns** across 186 files.
   - `npm run lint:dup`: PASS (1.60% duplicated lines < ngưỡng 3.0%).
   - `npx tsc --noEmit`: **0 type errors**.

---

## 4. NGHIỆM THU THỊ GIÁC ĐA ĐỘ PHÂN GIẢI (CDP SPOT-INSPECTION)

Đã chụp và thẩm định 6 ảnh chụp thực tế màn hình qua Microsoft Edge CDP:
1. `docs/reports/uat/screenshots/imp199/imp199_01_desktop_1920_notice_chip.jpg`: ActionDock và Notice Chip trọn vẹn, không clipping.
2. `docs/reports/uat/screenshots/imp199/imp199_02_desktop_1920_bot_pacing_chip.jpg`: Bot Pacing Chip hiển thị sắc nét, chữ và icon đồng trục.
3. `docs/reports/uat/screenshots/imp199/imp199_03_desktop_1920_activity_drawer.jpg`: Backdrop `z-20` mờ mềm mại, TopBar `z-30` nổi bật không bị chìm.
4. `docs/reports/uat/screenshots/imp199/imp199_04_desktop_1280_floating_and_ticker.jpg`: Floating Numbers neo tại `top-36` thông thoáng dưới Ticker 140px.
5. `docs/reports/uat/screenshots/imp199/imp199_05_mobile_390_notice_chip.jpg`: Mobile 390x844 cuộn ngang ActionDock mượt mà, chip nổi nguyên vẹn.
6. `docs/reports/uat/screenshots/imp199/imp199_06_mobile_360_camera_clearance.jpg`: Camera clearance tại `bottom-28` (112px) cách biệt ActionDock trên màn hình nhỏ 360px.

---

## 5. PHÁN QUYẾT TRẠM 3 (STATION 3 VERDICT)
- **Code Quality Reviewer**: **APPROVED**
- **Specification Compliance Reviewer**: **APPROVED**
- **2D UI Craft Reviewer**: **APPROVED** (disposition: `ship`)

Ticket IMP-199 chính thức được đóng và chuyển giao sang trạng thái sẵn sàng phát hành.
