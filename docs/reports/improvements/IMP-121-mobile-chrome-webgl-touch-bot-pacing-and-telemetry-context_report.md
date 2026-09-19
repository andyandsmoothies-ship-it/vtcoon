# [IMP-121] BÁO CÁO THẨM ĐỊNH & NGHIỆM THU: TỐI ƯU WEBGL MOBILE, CSS CẢM ỨNG, CHỈ BÁO BOT PACING & NGỮ CẢNH TELEMETRY

- **Mã Cải Tiến**: IMP-121
- **Kế Hoạch Tham Chiếu**: [`IMP-121_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-121-mobile-chrome-webgl-touch-bot-pacing-and-telemetry-context_plan.md)
- **Tập Lệnh Kiểm Thử**: [`imp121_mobile_opt_and_telemetry_context.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp121_mobile_opt_and_telemetry_context.test.ts)
- **Trạng Thái Nghiệm Thu**: 🟢 **HOÀN TẤT & ĐẠT CHUẨN XUẤT XƯỞNG (SHIP)**
- **Ngày Hoàn Tất**: 2026-09-19

---

## 1. TỔNG QUAN KẾT QUẢ THỰC HIỆN

Dựa trên kết quả phân tích pháp chứng từ phiên chơi thực tế trên Mobile Chrome (`VTCOON`, seed 12345):
1. **Tối Ưu WebGL Mobile (Draw Calls & Tải GPU)**:
   - Module `time_of_day_lighting.tsx` đã tiếp nhận prop `isMobile`.
   - Hàm `resolveShadowMapSize(isMobile)` tự động hạ độ phân giải bản đồ bóng của DirectionalLight từ `2048x2048` xuống `1024x1024` khi chơi trên điện thoại.
   - Giảm 75% chi phí bộ nhớ VRAM và fillrate đổ bóng trong shadow pass, bảo toàn 60 FPS mượt mà và chống nóng máy khi chơi ván dài.
   - Bảo lưu 100% thuộc tính `shadows="soft"` trên `<Canvas>` nhằm tương thích tuyệt đối với các hợp đồng visual crispness của dự án.
2. **CSS Cảm Ứng Mobile Chrome (Zero Tap-Delay & Zero Highlight Box)**:
   - Cấu hình `touch-action: manipulation` và `-webkit-tap-highlight-color: transparent` được áp dụng triệt để cho `html, body, #root` cùng toàn bộ các thẻ tương tác (`button, a, input, select`).
   - Loại bỏ độ trễ phản hồi chạm 300ms do cử chỉ double-tap zoom và xóa sạch vệt màu xám/xanh che lấp nút bấm 3D nổi.
3. **Chỉ Báo Tiến Độ Bot (Bot Pacing Indicator)**:
   - Hàm `resolveBotPacingStatus` tính toán chuẩn xác danh tính Bot đang hành động, thứ tự trong lượt (`(1/3)`), tổng số Bot và văn bản hiển thị.
   - Component `ActionDock` bổ sung Chip trạng thái `bot-pacing-chip` (`🤖 ⏳ Lượt [Tên Bot]... ([thứ tự]/[tổng])`) phong cách `bg-slate-850 text-amber-300 border-amber-500/40 animate-pulse`.
   - Nút Roll Dice bảo toàn 100% thuộc tính `aria-label="Đổ xúc xắc"`, `data-testid="roll-dice-btn"` và độ tương phản WCAG AA `text-slate-600` khi disabled.
4. **Ngữ Cảnh Telemetry Pháp Chứng (Forensic Intent Context)**:
   - Mở rộng giao diện `RecordedIntentContext` và kiểu dữ liệu `RecordedIntent`.
   - Hàm `buildIntentTelemetryContext` tự động trích xuất ngữ cảnh snapshot (`buttonLabel`, `isDoublesRoll`, `consecutiveDoubles`, `dice`, `position`, `balance`, `note`) khi gửi intent qua WebSocket.
   - Ghi nhận rõ ràng cờ `isDoublesRoll: true` và `note: 'DOUBLES_FOLLOWUP_ROLL'` khi người chơi gieo lượt đôi, triệt tiêu hoàn toàn sự suy diễn sai lệch trong tương lai.

---

## 2. KẾT QUẢ ĐỐI SOÁT KIỂM THỬ (TEST RESULTS)

* **Trạm 1 (RED Phase)**: 15/15 tests tại `imp121_mobile_opt_and_telemetry_context.test.ts` đã chứng minh trạng thái thất bại trước khi có mã nguồn thực thi.
* **Trạm 2 (GREEN Phase)**: Mã nguồn tối thiểu vượt qua toàn bộ 15 atomic contract tests (100% PASS trong 6ms).
* **Trạm 3 (Full Regression & Disk Verification)**:
  - **231/231 test suites PASS** (100%).
  - **4.613/4.613 tests PASS** (100%).
  - Thời gian chạy bộ test toàn dự án: 30,79 giây.
  - **UI Linter**: `npm run lint:ui` đạt 0 vi phạm Anti-pattern trên 146 tệp.
  - **Bảo toàn Gotchas**: Ghi nhận Gotcha #155 vào `docs/domain/gotchas.md`.
  - **Cập nhật Lộ Trình**: Bổ sung IMP-121 vào `docs/master_roadmap.md`.
