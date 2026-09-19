# [IMP-123] KẾ HOẠCH NÂNG CẤP: MOBILE UI/UX TRI-PACKAGE POLISH

- **Mã Cải Tiến**: IMP-123
- **Tên Đầy Đủ**: Mobile UI/UX Tri-Package Polish (Server Toast, TopBar Sync, Property Portfolio & Action Dock Alignment)
- **Trọng Tâm**: Hoàn thiện toàn diện 3 gói giao diện người dùng (UI/UX) trên di động:
  1. Gói 1: Sửa lỗi hiển thị & layout (ServerToast định vị dưới TopBar, bản địa hóa lỗi tiếng Việt, chống gãy dòng timer Bot, đồng bộ trần 40 vòng đấu).
  2. Gói 2: Tái cấu trúc trực quan BĐS & Đàm phán (Nút thế chấp tinh tế viền cảnh báo, hiển thị tiền thuê & giá, kích thước công thái học min-44px, nhãn [ĐÃ CHỌN] rõ ràng).
  3. Gói 3: Đồng bộ thẩm mỹ Action Dock (Bo góc Retropoly rounded-2xl, thống nhất đổ bóng `#0f172a`, tách chip lượt bot nổi phía trên dock không xô lệch hàng nút).
- **Ngày Thực Hiện**: 2026-09-19
- **Trạng Thái**: 🟢 **GREEN IMPLEMENTATION**

---

## 1. BỐI CẢNH & PHÂN TÍCH VẤN ĐỀ

1. **ServerToast che khuất TopBar**:
   - Khối thông báo lỗi máy chủ trước đây dùng `top-4`, đè trực tiếp lên thanh `TopBar` (vòng đấu, đồng hồ, kho bạc) trên màn hình di động.
   - Chưa bản địa hóa các mã lỗi kỹ thuật (`CANNOT_ROLL`, `ROOM_NOT_FOUND`, `EVEN_BUILDING_VIOLATION`, `MISSING_MONOPOLY`...).
2. **Trùng lặp mô tả thẻ sự kiện trên Mobile**:
   - Cả đoạn mô tả chi tiết và khối tóm tắt tác động nhanh đều render đồng thời trên mobile trong `EventCardModal`.
3. **Gãy dòng TopBar & Lệch trần vòng đấu**:
   - Khi chuyển sang lượt Bot AI, chuỗi `🤖 Đang tính...` bị gãy dòng làm biến dạng viên thuốc capsule.
   - Vòng đấu hiển thị mẫu số cố định `/30` khi ván đấu bước vào giai đoạn về đích mở rộng (vòng 31-40).
4. **Trực quan hóa BĐS và tương phản WCAG AA**:
   - Nút Thế Chấp dùng màu cam vàng đậm (`bg-amber-500`) lấn át nút chính và thiếu thông tin Tiền thuê/Giá niêm yết.
   - Nút gửi đàm phán khi bị vô hiệu hóa có độ tương phản quá thấp (`text-slate-400` trên nền xám nhạt).
5. **Thanh điều khiển đáy Action Dock**:
   - Các nút hành động sử dụng bo tròn hoàn toàn `rounded-full` thiếu đồng bộ với phong cách Retropoly `rounded-2xl` của HUD.
   - Đổ bóng thiếu nhất quán giữa `#0f172a` và `#020617`.
   - Chip tiến độ bot chen ngang hàng làm co rúm các nút bấm.

---

## 2. QUY HOẠCH KIẾN TRÚC & GIẢI PHÁP KỸ THUẬT

### Gói 1: Sửa Lỗi Hiển Thị & Layout
- `src/client/main.tsx`:
  - Xuất khẩu `ServerToastProps`, `formatServerErrorMessage`, `ServerToast` với lớp định vị `fixed top-18 sm:top-20 left-1/2 -translate-x-1/2`.
  - Thay thế khối inline error bằng `<ServerToast message={errorMessage} />`.
- `src/client/ui/modals/event_card_modal.tsx`:
  - Ẩn đoạn `<p>` mô tả trên mobile với `hidden sm:block`, chỉ hiển thị khối `event-impact-summary` trên mobile.
- `src/client/ui/top_bar.tsx`:
  - Thêm `whitespace-nowrap` vào timer span.
  - Tính toán `displayMaxRounds = roundNumber > maxRounds ? (roundNumber <= 40 ? 40 : roundNumber) : maxRounds` và hiển thị `/{displayMaxRounds}`.

### Gói 2: Tái Cấu Trúc Trực Quan BĐS & Đàm Phán
- `src/client/ui/modals/property_portfolio_modal.tsx`:
  - Hiển thị Tiền Thuê (`data-testid="property-rent-val"`) và Giá BĐS niêm yết cho từng ô tài sản.
  - Cải tiến nút Thế Chấp sang nút phụ nền hồng nhạt viền đỏ cảnh báo `bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-300 shadow-[0_2px_0_0_#fecdd3]`.
  - Bảo đảm kích thước công thái học `min-w-[44px] min-h-[44px]` cho nút Sổ Đỏ và nút Đóng.
- `src/client/ui/modals/trade_modal.tsx`:
  - Gắn `data-selected={checked ? 'true' : undefined}` và nhãn `✓ [ĐÃ CHỌN]` khi BĐS được tick chọn.
  - Cải thiện độ tương phản WCAG AA cho nút gửi đề xuất bị vô hiệu hóa: `bg-slate-200 text-slate-600 border border-slate-300`.

### Gói 3: Đồng Bộ Thẩm Mỹ Action Dock
- `src/client/ui/action_dock.tsx`:
  - Đồng bộ bo góc Retropoly `rounded-2xl` cho tất cả các nút: Đổ xúc xắc, Quản lý BĐS, Đàm phán, Hết lượt, Bảo lãnh, Mua đất.
  - Thống nhất đổ bóng xúc giác `shadow-[0_4px_0_0_#0f172a]`.
  - Tách chip bot `bot-pacing-chip` ra khỏi flex row bằng `absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap`, giữ thanh dock `relative` thông thoáng.

---

## 3. KẾ HOẠCH KIỂM THỬ & CHẤT LƯỢNG (TEST MATRIX)
- Bộ kiểm thử hợp đồng: `tests/client/mobile_ui_ux_tri_package_polish.test.ts` (35 test cases).
- Hồi quy toàn diện: >230 test suites trong dự án.
- Linter UI: `npm run lint:ui` đạt 0 anti-patterns.
- Typecheck: `npx tsc --noEmit` đạt 0 errors.
- Build production: `npm run build` thành công.
- Xác thực Docker container HTTP 200 OK.
