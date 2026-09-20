# Kế Hoạch IMP-143: Triệt Tiêu Chồng Đè Pop-up Bằng Hệ Thống Tọa Độ Đa Tầng Định Lượng Chính Xác Dưới MarketEventTicker (Popup De-Collision & Safe Vertical Offsets)

> **Mục tiêu:** Xử lý triệt để 100% lỗi chồng đè pop-up do người dùng phản ánh từ ảnh thực tế (`media_1789919154622.png`):  
> 1. Triệt tiêu va chạm giữa `MarketEventTicker` ("Thời Tiết Cực Đoan Duyên Hải") và `MilestoneBanner` ("Đại Nhạc Hội Quốc Tế").  
> 2. Triệt tiêu va chạm giữa `MilestoneBanner` ("Đại Nhạc Hội Quốc Tế") và `FloatingBadge` ("Bot AI 2 -120 Tr. Nộp Thuế Đất Đai").  
> 3. Hiệu chỉnh toàn diện bảng tọa độ động `milestoneTopClass`, `mobileTopClass`, `desktopTopClass` bảo đảm khoảng đệm an toàn > 16px ở mọi trường hợp kết hợp (0, 1 hoặc $\ge 2$ sự kiện thị trường).  
> **Căn cứ:** Ảnh lỗi người dùng `media_1789919154622.png`, `docs/domain/gotchas.md` (Gotcha #185), `docs/master_roadmap.md`.  
> **Thẩm định độc lập:** ĐÃ THÔNG QUA PHẢN BIỆN ĐỐI KHÁNG (`plan-griller` VERDICT: REVISED & STABILIZED).

---

## 1. Phân Tích Thực Tế & Kết Quả Thẩm Định Điểm Mù (Plan Grilling)

Trong ảnh `media_1789919154622.png` của người dùng:
- **Tầng 1 (TopBar)**: Chiều cao ~54px.
- **Tầng 2 (`MarketEventTicker`)**: Đang hiển thị 1 thẻ sự kiện (`activeMarketCount === 1`), có tiêu đề + badge đếm vòng + 3 dòng mô tả (`line-clamp-3`), kết thúc tại **Y ~ 144-150px**.
- **Tầng 3 (`MilestoneBanner`)**: Bị gán cứng `top-28` (**112px**). Do $112\text{px} < 144\text{px}$, đỉnh thẻ ("Đại Gia Chủ Sảnh (P1)") bị thụt vào trong và che khuất dưới mép đáy của Ticker. Thẻ này cao ~80px, kéo dài đến **Y ~ 192px**.
- **Tầng 4 (`FloatingBadge`)**: Bị gán cứng `top-[11rem]` (**176px**). Do $176\text{px} < 192\text{px}$, toast trừ tiền đè trực tiếp lên nửa dưới của thông báo thẻ sự kiện, che lấp toàn bộ dòng chữ "Đại nhạc hội quốc tế...".

### 3 Điểm Mù Đã Được Nhận Diện & Sửa Đổi:
1. **[P1 - Va chạm mép Ticker 3 dòng trên mobile hẹp]**: Trên màn hình 360-390px, Ticker 1 thẻ chạm tới Y = 148-152px. Tọa độ cũ `top-28` (112px) hoặc `top-[9.75rem]` (156px) không đủ đệm an toàn.  
   $\rightarrow$ **Giải pháp**: Nâng `milestoneTopClass` khi có 1 market card lên **`top-[10.5rem]`** (168px), tạo khoảng đệm an toàn 18-20px dưới Ticker.
2. **[P2 - Khử trùng lặp DOM & Giữ nguyên cấu trúc Container]**: Tránh nhân bản DOM làm hỏng A11y (`aria-live="polite"`) và trùng lặp testids.  
   $\rightarrow$ **Giải pháp**: Giữ nguyên kiến trúc 1 container MilestoneBanner riêng (`data-testid="milestone-banner-container"`) và 2 container Toasts (Mobile & Desktop), nhưng hiệu chỉnh tọa độ `top` của chúng để không bao giờ có thể giao cắt nhau.
3. **[P3 - Bảo toàn Hợp Đồng Hồi Quy `imp128` & `imp139`]**: Đồng bộ test suite `imp128`, `imp129` và `imp139` để phản ánh đúng tọa độ an toàn chuẩn SSOT, loại bỏ hiện tượng codify bug cũ.

---

## 2. Bảng Tọa Độ Đa Tầng Chuẩn SSOT (Zero-Collision Offsets Matrix)

| Trạng Thái Thị Trường (`activeMarketCount`) | Tọa Độ MilestoneBanner (`milestoneTopClass`) | Tọa Độ Toast Mobile (`mobileTopClass`) Khi Có Milestone | Tọa Độ Toast Mobile Khi Không Có Milestone | Khoảng Đệm Thực Tế (Margin) |
| :--- | :---: | :---: | :---: | :---: |
| **0 Sự Kiện Thị Trường** | `top-20` (80px) | `top-[11.5rem]` (184px) | `top-[4.25rem]` (68px) | **+24px** (Không đè) |
| **1 Sự Kiện Thị Trường** (Như trong ảnh) | **`top-[10.5rem]`** (168px) *(Cũ: top-28)* | **`top-[16.5rem]`** (264px) *(Cũ: top-[11rem])* | **`top-[10.5rem]`** (168px) *(Cũ: top-28)* | **+16px ➔ +20px** (Triệt tiêu 100% va chạm) |
| **$\ge 2$ Sự Kiện Thị Trường** | **`top-[15.5rem]`** (248px) *(Cũ: top-40)* | **`top-[21.5rem]`** (344px) *(Cũ: top-[13.5rem])* | **`top-[15.5rem]`** (248px) *(Cũ: top-40)* | **+16px ➔ +20px** (Triệt tiêu 100% va chạm) |

### Tọa Độ Cho Desktop (`desktopTopClass`):
- **Khi có MilestoneBanner**:
  * 0 Market: `top-[12rem] md:top-[12rem]` (192px)
  * 1 Market: **`top-[17rem] md:top-[17rem]`** (272px)
  * $\ge 2$ Markets: **`top-[22rem] md:top-[22rem]`** (352px)
- **Khi không có MilestoneBanner**:
  * 0 Market: `top-28 md:top-32` (112px - 128px) — Bảo toàn hợp đồng `TC-IMP128.03`
  * 1 Market: `top-[11rem] md:top-[11.5rem]` (176px - 184px)
  * $\ge 2$ Markets: `top-[16rem] md:top-[16.5rem]` (256px - 264px)

---

## 3. Danh Sách Tệp Thay Đổi Cụ Thể

### Cụm Mã Nguồn Giao Diện
#### [MODIFY] [floating_numbers.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/floating_numbers.tsx)
- Cập nhật hàm tính toán `milestoneTopClass`, `mobileTopClass`, `desktopTopClass` theo bảng tọa độ đa tầng chuẩn SSOT ở trên.
- Bảo tồn toàn bộ testids: `data-testid="floating-numbers-overlay"`, `data-testid="milestone-celebration-banner"`, `data-testid="event-card-notification-banner"`, `data-testid="contextual-transaction-badge"`.

### Cụm Kiểm Thử Hợp Đồng
#### [MODIFY] [imp129_mobile_toast_ticker_decollision.test.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp129_mobile_toast_ticker_decollision.test.ts)
- Cập nhật các test case `TC-IMP129.02`, `TC-IMP129.03`, `TC-IMP129.04` phản ánh đúng tọa độ an toàn `top-[10.5rem]`, `top-[15.5rem]`, `top-[16.5rem]`.

#### [MODIFY] [imp139_popup_decollision_and_modal_zindex.test.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp139_popup_decollision_and_modal_zindex.test.ts)
- Cập nhật các test case `TC-139.05`, `TC-139.11`, `TC-139.12` phản ánh đúng tọa độ an toàn SSOT.

### Cụm Tri Thức Miền & Báo Cáo
#### [NEW] [IMP-143-adaptive-notification-flex-stack-and-zero-collision_plan.md](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-143-adaptive-notification-flex-stack-and-zero-collision_plan.md)
- Lưu trữ kế hoạch cải tiến theo chuẩn Continuous Improvement.

#### [MODIFY] [gotchas.md](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md)
- Thêm Gotcha #190: `[UI/POPUP-COLLISION] Triệt Tiêu Chồng Đè Pop-up Bằng Tọa Độ Đa Tầng An Toàn Dưới MarketEventTicker (IMP-143)`.

---

## 4. Kế Hoạch Kiểm Thử & Nghiệm Thu (Verification Plan)

### Automated Contract Tests
1. **Station 1 RED Contract Test**:
   - Tạo mới: `tests/client/imp143_notification_safe_offsets_decollision.test.ts` (18 atomic tests).
   - Kiểm thử 4 khía cạnh (Universal 4-Facet Behavioral Matrix):
     * *Facet 1 (Boundary & Offsets)*: Xác minh `milestoneTopClass` là `top-20` (0 market), `top-[10.5rem]` (1 market), `top-[15.5rem]` (>= 2 markets).
     * *Facet 2 (Reactivity & Toast Decollision)*: Xác minh `mobileTopClass` khi có milestone là `top-[11.5rem]` (0 market), `top-[16.5rem]` (1 market), `top-[21.5rem]` (>= 2 markets).
     * *Facet 3 (Desktop Offsets)*: Xác minh `desktopTopClass` tương ứng cho cả khi có và không có milestone.
     * *Facet 4 (SSR & Error Defense)*: Toàn bộ các component kết xuất hợp lệ qua `renderToStaticMarkup`, zero crash, zero NaN, Z-Index giữ nguyên `z-30`.
2. **Regression Testing**:
   - Chạy toàn bộ các suites liên quan: `imp139`, `imp129`, `imp128`, `imp123`, `imp122`, `imp117`.
   - `npm run lint:ui` -> 0 vi phạm.
