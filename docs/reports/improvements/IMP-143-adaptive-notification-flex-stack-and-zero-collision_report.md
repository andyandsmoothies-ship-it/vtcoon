# Báo Cáo Nghiệm Thu IMP-143: Triệt Tiêu Chồng Đè Pop-up Bằng Hệ Thống Tọa Độ Đa Tầng Định Lượng Chính Xác Dưới MarketEventTicker (Popup De-Collision & Safe Vertical Offsets)

> **Mã cải tiến:** IMP-143 (Đồng bộ lộ trình: IMP-145)  
> **Ngày hoàn thành:** 2026-09-20  
> **Trạng thái:** 🟢 **HOÀN TẤT (PRODUCTION READY)**  
> **Căn cứ:** Ảnh chụp thực tế di động từ người dùng (`media_1789919154622.png`), Kế hoạch [`IMP-143_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-143-adaptive-notification-flex-stack-and-zero-collision_plan.md), Gotcha #192 trong [`gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md).  
> **Quy trình áp dụng:** 🚦 Quy trình 3 Trạm Tier 2 Full Rigor (Trạm 0: Plan Grilling $\rightarrow$ Trạm 1: RED Contract Test $\rightarrow$ Trạm 2: GREEN Implementation $\rightarrow$ Trạm 3: Independent Review & Disk Verification).

---

## 1. Tóm Tắt Vấn Đề & Nguyên Nhân Gốc Rễ Từ Thực Tế

Trong ảnh chụp người dùng cung cấp (`media_1789919154622.png`) trên thiết bị di động:
1. **Va chạm Tầng 2 & Tầng 3**: `MarketEventTicker` (khi hiển thị 1 thẻ sự kiện thị trường `activeMarketCount === 1` có 3 dòng mô tả `line-clamp-3`) kéo dài từ $Y \approx 54\text{px}$ đến $Y \approx 148 - 152\text{px}$. `MilestoneBanner` trước đây bị gán cứng `top-28` (112px). Do $112\text{px} < 148\text{px}$, đỉnh của thẻ sự kiện đặc biệt bị che khuất một phần dưới mép đáy của Ticker.
2. **Va chạm Tầng 3 & Tầng 4**: `MilestoneBanner` có chiều cao khoảng 80px, kéo dài đến $Y \approx 192\text{px}$. Toast biến động tài chính (`FloatingBadge`) bị gán cứng `top-[11rem]` (176px). Do $176\text{px} < 192\text{px}$, toast này đè trực tiếp lên nửa dưới của `MilestoneBanner`, che khuất toàn bộ nội dung mô tả thẻ sự kiện.

---

## 2. Giải Pháp Kỹ Thuật Đã Triển Khai (Bảng Tọa Độ SSOT)

Đã cấu trúc lại toàn diện logic tính toán tọa độ động trong [`src/client/ui/floating_numbers.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/floating_numbers.tsx):

| Trạng Thái Thị Trường (`activeMarketCount`) | Tọa Độ MilestoneBanner (`milestoneTopClass`) | Tọa Độ Toast Mobile (`mobileTopClass`) Khi Có Milestone | Tọa Độ Toast Mobile Khi Không Có Milestone | Khoảng Đệm An Toàn Thực Tế |
| :--- | :---: | :---: | :---: | :---: |
| **0 Sự Kiện Thị Trường** | `top-20` (80px) | `top-[11.5rem]` (184px) | `top-[4.25rem]` (68px) | **+24px** (> 16px) |
| **1 Sự Kiện Thị Trường** (Trường hợp trong ảnh) | **`top-[10.5rem]`** (168px) *(Cũ: top-28)* | **`top-[16.5rem]`** (264px) *(Cũ: top-[11rem])* | **`top-[10.5rem]`** (168px) *(Cũ: top-28)* | **+16px $\rightarrow$ +20px** (Triệt tiêu 100% va chạm) |
| **$\ge 2$ Sự Kiện Thị Trường** | **`top-[15.5rem]`** (248px) *(Cũ: top-40)* | **`top-[21.5rem]`** (344px) *(Cũ: top-[13.5rem])* | **`top-[15.5rem]`** (248px) *(Cũ: top-40)* | **+16px $\rightarrow$ +20px** (Triệt tiêu 100% va chạm) |

### Tọa Độ Trên Desktop (`desktopTopClass`):
- **Khi có MilestoneBanner**:
  * 0 Market: `top-[12rem] md:top-[12rem]` (192px)
  * 1 Market: **`top-[17rem] md:top-[17rem]`** (272px)
  * $\ge 2$ Markets: **`top-[22rem] md:top-[22rem]`** (352px)
- **Khi không có MilestoneBanner**:
  * 0 Market: `top-28 md:top-32` (112px - 128px) — Bảo toàn 100% hợp đồng `TC-IMP128.03`
  * 1 Market: `top-[11rem] md:top-[11.5rem]` (176px - 184px)
  * $\ge 2$ Markets: `top-[16rem] md:top-[16.5rem]` (256px - 264px)

---

## 3. Nhật Ký Nghiệm Thu 3 Trạm (3-Station Pipeline Execution)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (Plan Grilling)
- Subagent `plan-griller` đã nhận diện 3 điểm mù kiến trúc (P1: Ticker 3 dòng chạm Y=152px trên mobile hẹp; P2: Khử trùng lặp DOM tránh hỏng `aria-live`; P3: Bảo toàn hợp đồng hồi quy `imp128`).
- Toàn bộ 3 điểm mù đã được cập nhật vào kế hoạch trước khi người dùng phê duyệt.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (RED Contract Test)
- Kỹ sư kiểm thử `qa-tester` tạo tệp [`tests/client/imp143_notification_safe_offsets_decollision.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp143_notification_safe_offsets_decollision.test.ts) gồm 24 atomic tests (`[TC-IMP143.01/MSS]` $\rightarrow$ `[TC-IMP143.24/MSS]`) theo ma trận Universal 4-Facet.
- **Xác nhận Business RED**: 10 tests thất bại trên các tọa độ cũ (`top-28`, `top-[11rem]`, `top-[13.5rem]`).

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (GREEN Implementation)
- Kỹ sư `implementer` cập nhật [`src/client/ui/floating_numbers.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/floating_numbers.tsx), đồng bộ các bộ test cũ (`imp129`, `imp139`), ghi nhận Gotcha #192 vào `gotchas.md`.
- Kết quả: **75/75 tests liên quan PASS 100%**, `npm run lint:ui` sạch 0 vi phạm trên 164 tệp.
- Snapshot bằng chứng lưu tại [`.agents/evidence/imp-143_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp-143_snapshot.json).

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Reviews)
- **`spec-reviewer`**: **VERDICT: APPROVED** (100% Spec reconciliation, bảo toàn toàn bộ TestIDs và cấu trúc A11y, zero scope creep).
- **`ui-craft-reviewer`**: **DISPOSITION: SHIP** (Phân tích khoảng đệm vi mô triệt tiêu 100% va chạm, giữ nét tinh hoa tactile shadows trên nền giấy `#FFFDF8`, 0 lỗi vật lý P1-P8, UI linter 0 vi phạm).

---

## 4. Bằng Chứng Kiểm Thử Tự Động Toàn Hệ Thống

- **Bộ test hợp đồng IMP-143 & liên quan**:
  * `tests/client/imp143_notification_safe_offsets_decollision.test.ts`: 24/24 tests PASS.
  * `tests/client/imp129_mobile_toast_ticker_decollision.test.ts`: 5/5 tests PASS.
  * `tests/client/imp139_popup_decollision_and_modal_zindex.test.ts`: 18/18 tests PASS.
  * `tests/client/imp128_desktop_ui_ticker_and_toast_sync.test.ts`: 28/28 tests PASS.
- **Toàn bộ Test Suite Dự Án**: **265/265 test suites PASS (5.462/5.462 tests PASS 100%, 0 regressions)**.
- **UI Linter**: `npm run lint:ui` $\rightarrow$ Clean! 0 Anti-patterns detected across 164 files.
