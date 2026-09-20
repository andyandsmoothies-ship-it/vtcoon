# [IMP-132] Kế Hoạch Cải Tiến: Bản Đồ Quy Hoạch Đô Thị (Urban Masterplan Minimap)

> **Mã số:** IMP-132 (Part 2)  
> **Trạng thái:** HOÀN TẤT (Passed Trạm 1 RED, Trạm 2 GREEN, Trạm 3 Review)  
> **Phạm vi:** Client UI / Business Modals / Mini Board Map  

---

## 1. Bối Cảnh & Mục Tiêu Kỹ Thuật
- **Vấn đề thực tế**: Người chơi trong không gian 3D sa bàn diorama chỉ nhìn thấy một góc bàn cờ theo góc quay camera. Rất khó nắm bắt tổng thể:
  1. Những ô nào trên bàn cờ chưa ai mua?
  2. Ai đang sở hữu ô nào (màu sắc, cấp công trình C0-C3, tình trạng thế chấp)?
  3. Nhóm màu nào đang chuẩn bị hình thành thế độc quyền (Monopoly) để lên chiến lược P2P Trade?
- **Giải pháp**: Tái cấu trúc nút `🗺️ Quy Hoạch` trên `ActionDock` (`data-testid="heatmap-toggle-btn"`) để mở modal `MasterplanModal`:
  - **Tab 1: Sa Bàn 40 Ô (Square Blueprint Grid)**: Lưới 11x11 khép kín 40 ô chu vi bàn cờ, trung tâm hiển thị Báo Cáo Đầu Tư Toàn Đô Thị và Inspector Card nội bộ.
  - **Tab 2: 8 Phân Khu Độc Quyền (District Monopoly Matrix)**: 8 thẻ nhóm màu BĐS + Hạ Tầng Giao Thông (4 Ga) + Tiện Ích Quốc Gia (2 Nhà máy) với touch targets $\ge 44$px.

---

## 2. Thiết Kế Bất Biến & Chống Lỗi (Anti-Flaw Architecture)
1. **Khử Bẫy Văng Modal (Inspector Card Containment)**:
   - Thay vì gọi `openModal('deed')` làm unmount modal cha, tích hợp `MasterplanInspectorCard` nội bộ sử dụng hàm thuần `getDeedDisplayInfo`.
2. **Khắc Phục Trùng Lặp Ô Góc Lưới 11x11 (Boundary Coordinate Invariant)**:
   - Bảng ánh xạ tọa độ tĩnh `GRID_TILE_COORDS` khép kín 40 ô chu vi duy nhất ($11 + 9 + 11 + 9 = 40$), 4 góc xuất hiện đúng 1 lần.
3. **Tuân Thủ Trần Độ Phức Tạp Mã Nguồn (LOC Ceiling)**:
   - Tách constants sang `masterplan_constants.ts` (73 LOC).
   - Tách sub-components sang `masterplan_components.tsx` (189 LOC).
   - Giữ `masterplan_modal.tsx` ở mức 279 LOC (dưới trần 500 LOC).

---

## 3. Danh Sách Tệp Thay Đổi
- `src/client/store/game_store_types.ts`: Thêm `'masterplan'` vào `ActiveModalType` và `ModalPayloadMap`.
- `src/client/ui/modals/masterplan_constants.ts`: Định nghĩa `GRID_TILE_COORDS`, `DISTRICT_GROUPS`, `resolveSpecialIcon`.
- `src/client/ui/modals/masterplan_components.tsx`: Sub-components `MasterplanInspectorCard`, `MasterplanDistrictCard`.
- `src/client/ui/modals/masterplan_modal.tsx`: Component giao diện chính của Bản Đồ Quy Hoạch Đô Thị.
- `src/client/ui/modals/modal_host.tsx`: Đăng ký render `MasterplanModal`.
- `src/client/ui/action_dock.tsx`: Nút `🗺️ Quy Hoạch` kích hoạt modal `masterplan`.
- `tests/client/imp132_urban_masterplan_minimap.test.ts`: 21 bài kiểm thử hợp đồng chuẩn 4-Facet.
