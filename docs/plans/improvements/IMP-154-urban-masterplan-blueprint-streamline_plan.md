# Kế Hoạch Cải Tiến IMP-154: Tinh Giản Bản Đồ Quy Hoạch Đô Thị — Loại Bỏ Tab 8 Phân Khu & Chuyên Biệt Sa Bàn 40 Ô

## 1. Bối Cảnh & Vấn Đề
- Người dùng yêu cầu: *"tại trang bản đồ quy hoạch đô thị, tôi muốn bỏ phần tab 8 phân khu ... chỉ giữ lại saa bàn 40 ô"*.
- Trước đây (từ IMP-132 đến IMP-152), hộp thoại `MasterplanModal` (Bản Đồ Quy Hoạch Đô Thị) được thiết kế tích hợp 2 tab:
  1. Tab 1: Sa Bàn 40 Ô (`data-testid="tab-blueprint"` / `masterplan-blueprint-grid`).
  2. Tab 2: 8 Phân Khu & Độc Quyền (`data-testid="tab-districts"` / `masterplan-districts-grid`).
- Sự tồn tại của Tab 2 dẫn đến các hạn chế:
  - Phân tán sự tập trung của người chơi: Khi người chơi bấm nút "🗺️ Quy Hoạch" từ ActionDock, họ kỳ vọng nhìn thấy sa bàn bàn cờ 40 ô thu nhỏ (minimap blueprint) trực quan.
  - Phình to kích thước code: `src/client/ui/modals/masterplan_modal.tsx` đạt tới 501 dòng code, vi phạm trần 500 LOC của Hiến pháp AGENTS (`tests/contracts/constitution_governance.test.ts`).
  - Dư thừa điều hướng: Việc có tab switcher trên header gây chật chội trên màn hình nhỏ.

## 2. Mục Tiêu & Giải Pháp Kỹ Thuật
1. **Tinh giản Header**:
   - Loại bỏ thanh `<nav>` chứa bộ chuyển tab giữa `tab-blueprint` và `tab-districts`.
   - Giữ nguyên tiêu đề "BẢN ĐỒ QUY HOẠCH ĐÔ THỊ", phụ đề số lượng BĐS đã bán, và nút đóng `[✕]` (`data-testid="masterplan-close-btn"`).
2. **Chuyên biệt hóa Body**:
   - Trực tiếp render Sa Bàn 40 Ô (`data-testid="masterplan-blueprint-grid"`) dưới dạng lưới 11x11 chu vi 40 ô.
   - Giữ nguyên khu vực trung tâm: Báo Cáo Đầu Tư Toàn Đô Thị hoặc Thẻ Tra Cứu Sổ Đỏ (`MasterplanInspectorCard`) khi nhấn vào bất kỳ ô nào.
   - Loại bỏ hoàn toàn khối JSX của Tab 2 (bộ lọc phân khu và lưới thẻ phân khu).
3. **Bảo tồn tính tương thích**:
   - Giữ nguyên các định nghĩa pure helper/constants trong `masterplan_constants.ts` và `masterplan_components.tsx`.
   - Giữ các props trong `MasterplanModalProps` dưới dạng optional.
4. **Chuẩn hóa kiểm thử & Hiến pháp**:
   - Cập nhật test suites `imp132`, `imp137`, `imp151`, `imp152` để hòa giải với hợp đồng mới (MasterplanModal chỉ render Sa Bàn 40 Ô).
   - Đảm bảo `masterplan_modal.tsx` hạ xuống < 250 LOC, vượt qua bài kiểm tra trần 500 LOC.
