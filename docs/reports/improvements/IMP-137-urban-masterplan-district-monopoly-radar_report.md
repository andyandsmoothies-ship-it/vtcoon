# [IMP-137] Báo Cáo Nghiệm Thu: Radar Phân Khu & Độc Quyền Trực Quan (Urban Masterplan District Monopoly Radar Overhaul)

> **Mã Cải Tiến**: `IMP-137`  
> **Trạng Thái**: 🟢 **Hoàn Tất & Phê Duyệt Xuất Xưởng (SHIP)**  
> **Phán Quyết Reviewer**:  
> - `spec-reviewer`: **APPROVED (100% SPEC RECONCILIATION)**  
> - `ui-craft-reviewer`: **DISPOSITION: SHIP (0 LỖI VẬT LÝ, WCAG AAA CONTRAST, TOUCH TARGET >= 36-44PX)**  
> **Traceability**: `[UC-GAME-009]`, `[TC-IMP137.01..TC-IMP137.18]`, Gotcha #181  

---

## 1. Tóm Tắt Kết Quả Triển Khai
Nhằm giải quyết triệt để phản hồi của người dùng về việc modal Bản Đồ Quy Hoạch Đô Thị khó hiểu, mặc định sa bàn 40 ô bị trống rỗng trung tâm và tab phân khu bị cắt cụt tên, gói IMP-137 đã tái thiết toàn diện qua Quy trình 3 Trạm:

1. **Mặc Định Mở Tab "8 Phân Khu & Độc Quyền"**:
   - Khi bấm nút `Quy Hoạch` từ ActionDock, modal mở ngay Tab Phân Khu thay vì Sa bàn 40 ô trống trơn.
   - Bảo toàn fallback thông minh: Nếu mở để xem chi tiết 1 ô (`selectedCellIndex`), modal tự động mở Tab Sa bàn để hiển thị Inspector Card (bảo tồn 100% hợp đồng `[TC-132.11]` & `[TC-132.12]`).
2. **Thanh Tiến Độ Phân Đoạn (Segmented Ownership Bar)**:
   - Mỗi phân khu có thanh tiến độ `data-testid="district-progress-bar-{id}"` bo cong tròn trịa `rounded-full` chia đều $1/N$.
   - Vạch màu thể hiện chủ sở hữu (`owner.tokenColor`), vạch xám `bg-slate-200` cho ô đất còn trống.
   - Huy hiệu trực quan tức thì: `⚡ Sắp Độc Quyền (2/3)` (nhấp nháy cảnh báo), `👑 Độc Quyền (Tên chủ)` hoặc `🌱 Đất Trống`.
3. **Phân Biệt Trạng Thái & Khắc Phục Cắt Cụt Tên**:
   - Ô có chủ: Phủ nhẹ màu nhận diện của chủ đất (`style={{ backgroundColor: `${owner.tokenColor}18`, borderColor: `${owner.tokenColor}50` }}`), nới rộng trần hiển thị tên `max-w-[80px] sm:max-w-[120px] truncate` không bao giờ bị cắt cụt.
   - Ô trống: Nền trắng sạch, viền nét đứt thanh lịch, giá tiền hiển thị nổi bật.
4. **Tương Tác 1 Chạm Thực Tế (Actionable)**:
   - Nút `[👁️]`: Lướt camera sa bàn 3D tới ô đất đó (`setCameraFocusCell`) và tự đóng modal (`onClose`) để người chơi chiêm ngưỡng vị trí.
   - Nút `[🤝]`: Nếu là ô đất của đối thủ, bấm vào sẽ mở thẳng hộp thoại Đàm Phán P2P (`TradeModal`) với đầy đủ 5 trường schema và pre-fill `requestedProperties: [cellIndex]`.
5. **Bộ Lọc Nhanh (Radar Filters)**:
   - Hỗ trợ lọc nhanh 4 trạng thái: `[Tất Cả]` • `[⚡ Sắp Độc Quyền]` • `[👑 Đã Độc Quyền]` • `[🌱 Còn Đất Trống]`.

---

## 2. Minh Chứng Đo Lường Vật Lý & Kiểm Thử
- **Unit & Contract Tests**:
  - `tests/client/imp137_masterplan_district_radar_overhaul.test.ts`: **18/18 atomic tests GREEN 100%**.
- **No-Regression Suite**:
  - `tests/client/imp132_urban_masterplan_minimap.test.ts`: **21/21 tests GREEN 100%**.
- **Static Quality & Type Safety**:
  - `npm run lint:ui`: **0 Anti-patterns detected across 157 files**.
  - `npx tsc --noEmit`: **0 errors**.
- **Active Memory**:
  - Đã đúc kết và ghi nhận Gotcha #181 vào `docs/domain/gotchas.md`.
