# [IMP-123] BÁO CÁO NGHIỆM THU: MOBILE UI/UX TRI-PACKAGE POLISH

- **Mã Cải Tiến**: IMP-123
- **Tên Đầy Đủ**: Mobile UI/UX Tri-Package Polish (Server Toast, TopBar Sync, Property Portfolio & Action Dock Alignment)
- **Trọng Tâm**: Hoàn thiện toàn diện 3 gói giao diện người dùng (UI/UX) trên di động.
- **Ngày Hoàn Thành**: 2026-09-19
- **Trạng Thái**: 🟢 **100% GREEN VERIFIED (35/35 CONTRACT TESTS PASSED)**

---

## 1. TỔNG KẾT THAY ĐỔI & FILE Diffs

| Tệp Tin | Loại Can Thiệp | Chi Tiết Can Thiệp | Trạng Thái |
| :--- | :---: | :--- | :---: |
| `src/client/main.tsx` | MODIFY | Xuất khẩu `ServerToastProps`, `formatServerErrorMessage`, `ServerToast` với vị trí `top-18 sm:top-20 left-1/2 -translate-x-1/2` tránh che khuất TopBar. Thay thế khối inline error trong App bằng `<ServerToast message={errorMessage} />`. | Linter Clean |
| `src/client/ui/modals/event_card_modal.tsx` | MODIFY | Thêm `hidden sm:block` vào đoạn `<p>` miêu tả thẻ sự kiện để tránh lặp nội dung với khối tóm tắt tác động nhanh `event-impact-summary` trên mobile. | Linter Clean |
| `src/client/ui/top_bar.tsx` | MODIFY | Thêm `whitespace-nowrap` vào timer span chống gãy dòng khi bot tính toán. Đồng bộ trần vòng đấu `displayMaxRounds` (kẹp trần 40 vòng khi ván đấu kéo dài). | Linter Clean |
| `src/client/ui/modals/property_portfolio_modal.tsx` | MODIFY | Hiển thị thông tin Tiền Thuê (`data-testid="property-rent-val"`) và Giá BĐS. Nâng cấp nút Thế Chấp sang nút phụ tinh tế viền cảnh báo `bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-300`. Đảm bảo kích thước công thái học `min-w-[44px] min-h-[44px]` cho nút Sổ Đỏ và nút Đóng. | Linter Clean |
| `src/client/ui/modals/trade_modal.tsx` | MODIFY | Gắn `data-selected={checked ? 'true' : undefined}` và nhãn `✓ [ĐÃ CHỌN]` khi tick chọn BĐS trong đàm phán. Cải thiện độ tương phản nút Gửi Đề Xuất khi disabled sang `bg-slate-200 text-slate-600 border border-slate-300` đạt chuẩn WCAG AA. | Linter Clean |
| `src/client/ui/action_dock.tsx` | MODIFY | Chuyển đổi toàn bộ nút hành động sang bo góc Retropoly `rounded-2xl`, thống nhất đổ bóng xúc giác `shadow-[0_4px_0_0_#0f172a]`, tách chip tiến độ bot `bot-pacing-chip` nổi phía trên dock với `absolute -top-10` không xô lệch hàng nút. | Linter Clean |

---

## 2. KẾT QUẢ KIỂM THỬ & CHỨNG CỨ KỸ THUẬT

### A. Bộ kiểm thử hợp đồng IMP-123
- File: `tests/client/mobile_ui_ux_tri_package_polish.test.ts`
- Kết quả: **35/35 tests PASS (100%)**
  - Gói 1.1: Toast Lỗi Máy Chủ (`ServerToast`, `formatServerErrorMessage`): 5/5 PASS.
  - Gói 1.2: Khử Trùng Lặp Thẻ Sự Kiện (`EventCardModal`): 4/4 PASS.
  - Gói 1.3: Chống Gãy Dòng TopBar (`whitespace-nowrap`): 3/3 PASS.
  - Gói 1.4: Đồng Bộ Trần Vòng Đấu (`displayMaxRounds`): 4/4 PASS.
  - Gói 2.1: Modal Danh Mục Bất Động Sản (`PropertyPortfolioModal`): 6/6 PASS.
  - Gói 2.2: Modal Đàm Phán P2P (`TradeModal`): 5/5 PASS.
  - Gói 3.1: Đồng Bộ Hình Khối Nút Bấm (`ActionDock`): 5/5 PASS.
  - Gói 3.2: Tách Biệt Chip Lượt Bot (`bot-pacing-chip`): 3/3 PASS.

### B. Adversarial Inversion Check
- Đã thực hiện cố tình làm sai biểu thức tính `displayMaxRounds` trong `top_bar.tsx` (`roundNumber <= 40 ? 30 : roundNumber`).
- Kết quả: Test `TC-IMP123.14` và `TC-IMP123.16` lập tức đổi sang màu ĐỎ (RED).
- Đã hoàn nguyên chính xác, test suite quay về 100% XANH (GREEN).

### C. Bộ kiểm tra giao diện & kiểu dữ liệu
- `npm run lint:ui`: **0 Anti-patterns** trên 146 files.
- `npx tsc --noEmit`: **0 errors**.
- `npm run build`: Biên dịch thành công gói production `dist/`.
