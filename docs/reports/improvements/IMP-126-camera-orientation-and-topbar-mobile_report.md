# [IMP-126] BÁO CÁO NGHIỆM THU: KHẮC PHỤC GÓC MÁY LỘN NGƯỢC 180° Ô CỜ & TỐI ƯU BỀ NGANG TOPBAR MOBILE

- **Mã Cải Tiến**: IMP-126
- **Kế Hoạch Tham Chiếu**: Kiểm toán thực địa [`mobile_gameplay_ui_ux_live_audit_report.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/audits/mobile_gameplay_ui_ux_live_audit_report.md)
- **Tập Lệnh Kiểm Thử Hợp Đồng**: [`imp126_camera_orientation_and_topbar_mobile.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp126_camera_orientation_and_topbar_mobile.test.ts)
- **Trạng Thái Nghiệm Thu**: 🟢 **HOÀN TẤT & ĐẠT CHUẨN XUẤT XƯỞNG (SHIP)**
- **Ngày Hoàn Tất**: 2026-09-19

---

## 1. TỔNG QUAN KẾT QUẢ THỰC HIỆN

Dựa trên kết quả phản hồi từ 2 ảnh chụp thực tế trên thiết bị di động Android qua Ngrok tunnel:

1. **Khắc Phục 100% Lỗi Chữ Ô Cờ Lộn Ngược 180° (`camera_state_machine.ts`)**:
   - Hàm mới `resolveSideAwareCameraOffset(tileCoords, baseOffset)` tự động tính toán vị trí máy quay theo 4 cạnh bàn cờ dựa trên so sánh tọa độ cực đại hình vuông `|z| >= |x|`:
     + **Cạnh Bắc (Side 2, e.g. Lâm Đồng/Đà Lạt, Cao Tốc, Hải Phòng)**: Đặt offset `[-1.8, 6.4, -6.8]`, đưa máy quay ra phía Bắc ($Z < -9$) nhìn xuống phía Nam ($+Z$). Toàn bộ chữ tên địa danh và giá tiền niêm yết hiển thị xuôi mắt 100%.
     + **Cạnh Tây (Side 1, e.g. Điện Lực EVN)**: Đặt offset `[-6.8, 6.4, 1.8]`, đưa máy quay ra phía Tây ($X < -9$) nhìn sang phía Đông ($+X$). Chữ đọc xuôi mắt 100%.
     + **Cạnh Đông (Side 3, e.g. Hoàn Kiếm, Ba Đình)**: Đặt offset `[6.8, 6.4, -1.8]`, đưa máy quay ra phía Đông nhìn sang phía Tây.
     + **Cạnh Nam (Side 0, e.g. Cần Thơ, Bến Thành)**: Giữ nguyên `[5.2, 6.4, 5.2]` nhìn từ phía Nam lên Bắc.
   - Bảo toàn 100% phòng thủ tọa độ `NaN` (Gotcha #115 / IMP-86).

2. **Tối Ưu Bề Ngang TopBar Mobile & Chống Tràn Header (`top_bar.tsx`)**:
   - Tinh gọn chuỗi hiển thị khi Bot đang tính toán:
     + Trên Mobile (`< 640px`): Chỉ hiển thị icon robot thu gọn `<span className="sm:hidden">🤖</span>`, cắt giảm ngay **105px** chiều ngang thừa thãi.
     + Trên Desktop (`>= 640px`): Hiển thị đầy đủ `<span className="hidden sm:inline">🤖 Đang tính...</span>` kèm `whitespace-nowrap`.
   - Bổ sung đệm an toàn `px-1.5 sm:px-4` cho toàn bộ thanh header, chống cấn mép cong màn hình điện thoại.
   - Giải phóng hoàn toàn không gian cho cụm nút tiện ích bên phải: Nút Nhật ký `📜`, Âm thanh `🔊`, Thời tiết `☀️` không còn bị đẩy tràn hay xén cụt trên di động.

---

## 2. KẾT QUẢ ĐỐI SOÁT & KIỂM TOÁN VẬT LÝ TRÊN ĐĨA

* **Trạm 1 (RED Phase)**:
  - Tệp kiểm thử hợp đồng `tests/contracts/imp126_camera_orientation_and_topbar_mobile.test.ts` (16 atomic tests, 4 facets `[TC-IMP126.01] .. [TC-IMP126.16]`).
  - Chứng minh trạng thái thất bại đối kháng (9 failed / 7 passed) khi chưa áp dụng logic mới.
* **Trạm 2 (GREEN Phase)**:
  - Cập nhật mã nguồn tại `src/client/3d/camera_state_machine.ts` và `src/client/ui/top_bar.tsx`.
  - Toàn bộ 16/16 atomic tests của IMP-126 vượt qua thành công (100% PASS).
* **Trạm 3 (Independent Review - Subagent `spec-reviewer`)**:
  - Đối soát vật lý trên đĩa: **16/16 tests PASS**.
  - Kiểm tra hồi quy toàn diện các suite liên quan: **119/119 tests PASS** (gồm `camera_state_machine.test.ts`, `imp82_bot_trading_and_pacing.test.ts`, `imp86_camera_nan_defense.test.ts`, `mobile_ui_ux_tri_package_polish.test.ts`, `mobile_responsive_hud.test.ts`).
  - `npm run lint:ui`: **0 anti-patterns** trên 146 tệp.
  - `npx tsc --noEmit`: **0 lỗi biên dịch**.
  - Docker container `vtcoon-vtcoon-1` đã build lại và phục vụ tại port 3000 (HTTP 200 OK).
  - Phán quyết chính thức: **VERDICT: APPROVED 100%**.
