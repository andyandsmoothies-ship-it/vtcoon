# [IMP-137] Kế Hoạch Cải Tiến: Bản Đồ Quy Hoạch — Radar Phân Khu & Độc Quyền Trực Quan

> **Mã Cải Tiến**: `IMP-137`  
> **Mức Độ**: 🟡 Client UI/UX & Tactical Monopoly Radar (0 Schema, 0 FSM, 0 Network Protocol)  
> **Traceability**: `[UC-GAME-009]`, `[TC-IMP137.01..TC-IMP137.18]`, Gotcha #181  
> **Trạng Thái**: 🟢 Hoàn Tất (Trạm 1 RED -> Trạm 2 GREEN -> Trạm 3 SHIP)

---

## 1. Mục Tiêu & Vấn Đề Người Dùng
- **Hiện trạng trước cải tiến**:
  - Mặc định mở Tab "Sa Bàn 40 Ô" trên Desktop: 40 ô chỉ có con số giá tiền cộc lốc, không có tên tỉnh thành; vùng trung tâm chiếm 70% diện tích bị bỏ trống trắng trơn gây hiểu lầm là lỗi render.
  - Tab "8 Phân Khu":
    - Tên người chơi trong badge bị cắt cụt cụt lủn (`Bot AI ...`, `Đại Gia...`) do bị kẹp cứng `max-w-[50px]`.
    - Ô đã mua và ô trống có màu nền xám nhờ nhạt như nhau, không tạo được "bản đồ nhiệt" thể hiện ai đang chiếm giữ khu vực nào.
    - Tiến độ độc quyền hiển thị bằng chữ số khô khan (`1/3`), thiếu thanh tiến độ trực quan.
    - Ngõ cụt tương tác: Người chơi không thể nhấp vào để tương tác (xem vị trí trên sa bàn 3D hoặc kích hoạt đàm phán P2P đổi đất).
- **Mục tiêu đạt được**:
  1. Đưa tab **`🏛️ 8 Phân Khu & Độc Quyền`** thành màn hình mặc định khi mở tự do từ ActionDock.
  2. Bổ sung **Thanh tiến độ phân đoạn (Segmented Progress Bar)** cho từng phân khu, hiển thị rõ màu sắc từng ô đất thuộc về ai, gắn nhãn cảnh báo `⚡ Sắp Độc Quyền` khi có người nắm $N-1$ ô.
  3. **Phân biệt màu sắc nền sở hữu trực quan**: Ô có chủ được phủ nhẹ dải màu nhận diện của chủ sở hữu; nới rộng trần hiển thị tên `max-w-[80px] sm:max-w-[120px] truncate`, hiển thị trọn vẹn avatar + tên người chơi.
  4. **Tương tác 1 chạm (Actionable)**:
     - Nút `[👁️]` lướt camera sa bàn 3D tới ô đất (`setCameraFocusCell`) và tự đóng modal (`onClose`) để lộ sa bàn 3D.
     - Ô đất của đối thủ: Nút `[🤝]` mở nhanh hộp thoại Đàm Phán P2P (`TradeModal`) với đầy đủ 5 trường schema bắt buộc và pre-fill `requestedProperties: [cellIndex]`.
  5. **Thanh lọc thông minh (Radar Filters)**: `[Tất Cả]` • `[⚡ Sắp Độc Quyền]` • `[👑 Đã Độc Quyền]` • `[🌱 Còn Đất Trống]`.
  6. Bảo toàn 100% các hợp đồng kiểm thử kế thừa trong `tests/client/imp132_urban_masterplan_minimap.test.ts`.

---

## 2. Thiết Kế Kỹ Thuật
- `masterplan_modal.tsx`:
  - `defaultTab = initialTab ?? (initialSelectedCellIndex !== undefined ? 'blueprint' : 'districts')`.
  - Filter state với 4 chế độ: `all`, `near-monopoly`, `monopoly`, `vacant`.
  - Bộ lọc thông minh phân loại phân khu theo trạng thái độc quyền và quỹ đất trống.
  - Bridge liên kết P2P trade và camera focus cell.
- `masterplan_components.tsx`:
  - `MasterplanDistrictCard`: Thêm `district-progress-bar-{id}` dạng vạch chia đều $1/N$.
  - Huy hiệu trạng thái `⚡ Sắp Độc Quyền`, `👑 Độc Quyền`, `🌱 Đất Trống`.
  - Phủ tint màu chủ sở hữu `owner.tokenColor` (18% alpha) và viền 50% alpha.
  - Nút vi thao tác xúc giác `[👁️]` và `[🤝]` chuẩn touch target $\ge 36$px.
