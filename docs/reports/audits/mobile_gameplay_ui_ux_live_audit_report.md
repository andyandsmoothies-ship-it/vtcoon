# BÁO CÁO KIỂM TOÁN THỰC ĐỊA UI/UX DI ĐỘNG (MOBILE LIVE GAMEPLAY AUDIT REPORT)

- **Mã Báo Cáo**: AUDIT-MOBILE-LIVE-01
- **Thiết Bị & Môi Trường**: Google Chrome trên Android, phân giải hiển thị dọc ~392 x 852 px, kết nối qua Ngrok WSS Tunnel.
- **Tệp Bằng Chứng Gốc**:
  - Ảnh 1: [`mobile_audit_screen_1.png`](file:///C:/Users/HP/.gemini/antigravity/brain/05327c8a-a4e5-42f2-bcfe-33c543b9ca7f/mobile_audit_screen_1.png)
  - Ảnh 2: [`mobile_audit_screen_2.png`](file:///C:/Users/HP/.gemini/antigravity/brain/05327c8a-a4e5-42f2-bcfe-33c543b9ca7f/mobile_audit_screen_2.png)
- **Ngày Thực Hiện**: 2026-09-19
- **Người Thực Hiện**: Antigravity UI/UX Quality Assurance & 3D Spatial Audit

---

## 1. HÌNH ẢNH HIỆN TRƯỜNG & BẰNG CHỨNG KIỂM TOÁN

### 1.1. Ảnh 1 — Lượt Bot AI & Pop-up Giao Dịch 2 Tầng
![Ảnh 1: Lượt Bot AI & Pop-up Giao Dịch](file:///C:/Users/HP/.gemini/antigravity/brain/05327c8a-a4e5-42f2-bcfe-33c543b9ca7f/mobile_audit_screen_1.png)
*Nội dung quan sát*: Lượt của `Bot AI 4 (Passive)`, Pop-up mua đất `Lâm Đồng (Đà Lạt)` giá `-1.400 Tr.`, chip tiến độ Bot `(3/3)`.

### 1.2. Ảnh 2 — Lượt Người Chơi & Cận Cảnh Ô Cao Tốc
![Ảnh 2: Lượt Người Chơi & Cận Cảnh Ô Cao Tốc](file:///C:/Users/HP/.gemini/antigravity/brain/05327c8a-a4e5-42f2-bcfe-33c543b9ca7f/mobile_audit_screen_2.png)
*Nội dung quan sát*: Đồng hồ lượt đi `00:27`, camera zoom cận cảnh ô `CAO TỐC (Bắc - Nam)`, nút Đổ xúc xắc bị disabled, TopBar có badge đỏ 37 sự kiện.

---

## 2. BẢNG TỔNG HỢP PHÁT HIỆN KIỂM TOÁN

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   MA TRẬN ĐÁNH GIÁ PHÁT HIỆN THỰC ĐỊA                       │
├────┬─────────────────────────────┬──────────┬─────────────┬─────────────────┤
│ STT│ Vấn Đề Giao Diện / Tương Tác│ Mức Độ   │ Vị Trí      │ Tác Động UX     │
├────┼─────────────────────────────┼──────────┼─────────────┼─────────────────┤
│ 1  │ Chữ và tranh ô cờ lộn ngược │ P1 (Khẩn)│ Sa bàn 3D   │ Không đọc được  │
│ 2  │ TopBar tràn mép phải mobile │ P1 (Khẩn)│ Header 2D   │ Mất nút nhật ký │
│ 3  │ Cấn mép trái thông tin vòng │ P2 (Cao) │ Header 2D   │ Dính sát viền   │
│ 4  │ Nút Đổ Xúc Xắc mờ bí ẩn     │ P2 (Cao) │ ActionDock  │ Gây bối rối     │
│ 5  │ Nút 👥 nổi lơ lửng cô lập   │ P2 (Cao) │ Mép phải 2D │ Dễ bấm nhầm     │
│ 6  │ Khoảng cách thẻ tên/tiền hẹp│ P3 (Nhẹ) │ Pop-up Pill │ Sát nhau        │
│ 7  │ Hậu cảnh 3D mảng xanh trơn  │ P3 (Nhẹ) │ Sky / Void  │ Thiếu chiều sâu │
└────┴─────────────────────────────┴──────────┴─────────────┴─────────────────┘
```

---

## 3. PHÂN TÍCH KỸ THUẬT CHI TIẾT TỪNG VẤN ĐỀ

### 🚨 VẤN ĐỀ 1 (P1 - Nghiêm Trọng): Chữ và Tranh Di Sản Trên Ô Cờ Bị Lộn Ngược 180°
- **Hiện tượng thực tế**:
  - Trong **Ảnh 1**: Ô cờ `LÂM ĐỒNG (Đà Lạt)` và `ĐIỆN LỰC (Tập Đoàn EVN)` có chữ quay ngược về phía sau (người chơi phải đọc ngược từ dưới lên hoặc xoay ngược điện thoại).
  - Trong **Ảnh 2**: Ô cờ `CAO TỐC (Bắc - Nam)` và `HẢI PHÒNG (Kinh Tế Đêm)` cũng bị lộn ngược 180°. Giá tiền niêm yết `2.000 Tr.` và `2.400 Tr.` chúc ngược đầu xuống.
- **Nguyên nhân cốt lõi**:
  - Bàn cờ 40 ô hình vuông gồm 4 cạnh (Cạnh Nam: 0..10, Cạnh Tây: 10..20, Cạnh Bắc: 20..30, Cạnh Đông: 30..39). Mặt texture của các ô được vẽ theo hướng đọc từ mép ngoài nhìn vào tâm bàn cờ.
  - Khi Camera chuyển trạng thái `tile_focus` hoặc `pawn_chase`, vector vị trí Camera đặt ở phía "trong tâm nhìn ra ngoài" (ngược 180° so với hướng đọc chuẩn), khiến toàn bộ chữ và hình ảnh bị đảo chiều đối với người chơi.
- **Giải pháp xử lý**:
  - Trong bộ điều khiển máy quay (`camera_controller.ts`), bổ sung hàm chuẩn hóa góc phương vị camera (`alignCameraOrientationWithTile(cellIndex)`):
    - Cạnh Nam (0..10): Camera đặt tại $Z > 0$ nhìn về hướng Bắc (Yaw $0^\circ$).
    - Cạnh Tây (10..20): Camera đặt tại $X < 0$ nhìn về hướng Đông (Yaw $90^\circ$).
    - Cạnh Bắc (20..30): Camera đặt tại $Z < 0$ nhìn về hướng Nam (Yaw $180^\circ$).
    - Cạnh Đông (30..39): Camera đặt tại $X > 0$ nhìn về hướng Tây (Yaw $270^\circ$).
  - Đảm bảo Camera luôn đứng từ phía đáy của ô cờ nhìn lên, chữ luôn thuận chiều đọc tự nhiên 100%.

---

### 🚨 VẤN ĐỀ 2 (P1 - Nghiêm Trọng): TopBar Bị Tràn Mép Phải & Cấn Mép Trái Trên Mobile
- **Hiện tượng thực tế**:
  - **Mép phải**: Ở Ảnh 1, nút loa bị cắt đôi, nút cuộn giấy (Nhật ký) biến mất hoàn toàn. Ở Ảnh 2, nút cuộn giấy hiện ra kèm badge đỏ 37 nhưng nút cạnh nó tiếp tục bị xén mép.
  - **Mép trái**: Số vòng đấu `1/30` và `3/30` dính sát vào mép màn hình cong của điện thoại, khoảng cách an toàn gần như bằng 0.
- **Nguyên nhân cốt lõi**:
  - Thanh `TopBar` có tổng chiều rộng cố định khoảng ~520px (gồm dải capsule trạng thái + 4 nút icon với `gap-2`). Chiều rộng màn hình di động chỉ có ~375px - 392px dẫn đến tràn container (`overflow-x`).
- **Giải pháp xử lý**:
  - Áp dụng kỹ thuật co giãn thích ứng cho Mobile (`max-w-full px-2`):
    1. *Rút gọn chỉ số FPS*: Ẩn chữ `60 FPS`, chỉ hiển thị chấm tròn màu xanh ngọc `w-2 h-2 rounded-full bg-emerald-400 animate-pulse` tiết kiệm 55px chiều ngang.
    2. *Thu nhỏ khoảng đệm icon*: Đổi `p-2` thành `p-1.5`, giảm `gap-2` thành `gap-1` cho cụm nút bên phải.
    3. *Bổ sung padding an toàn bên trái*: Thêm `pl-3` cho badge vòng đấu, tránh cấn viền bo góc của điện thoại.

---

### ⚠️ VẤN ĐỀ 3 (P2 - Trung Bình): Nút "Đổ Xúc Xắc" Bị Disabled Thiếu Nhãn Trạng Thái
- **Hiện tượng thực tế**:
  - Ở Ảnh 2, đồng hồ đếm ngược `00:27` màu xanh (lượt của người chơi), nhưng nút `🎲 Đổ Xúc Xắc` bị khóa mờ màu xám.
- **Tác động UX**:
  - Người chơi không biết hệ thống đang chờ thao tác gì: Đã gieo xúc xắc rồi và đang trong pha quyết định mua đất? Hay đang bị phạt hoãn lượt?
- **Giải pháp xử lý**:
  - Cập nhật nhãn động phản ánh đúng `turnPhase`:
    - Nếu đã gieo xúc xắc và đang đứng tại ô đất: Đổi nút chính thành `🏛️ Mua Đất / Quản Lý` hoặc `⏩ Kết Thúc Lượt`.
    - Nếu bị phạt mất lượt: Đổi nút thành `⏩ Bỏ Lượt (Hết Lượt)` kèm chip giải thích như đã thiết kế ở IMP-124.

---

### ⚠️ VẤN ĐỀ 4 (P2 - Trung Bình): Nút Bật/Tắt HUD `👥` Trôi Nổi Cô Lập
- **Hiện tượng thực tế**:
  - Nút tròn `👥` màu xanh dương nằm lơ lửng ngay dưới góc phải của TopBar.
- **Tác động UX**:
  - Gây cảm giác chắp vá layout, che mất góc nhìn sa bàn 3D và rất dễ bị bấm nhầm khi người dùng định bấm nút Cuộn giấy / Nhật ký.
- **Giải pháp xử lý**:
  - Tích hợp nút `👥` vào chung hàng với dải icon trên TopBar hoặc neo cố định dạng tab trượt ở mép phải màn hình.

---

### 💡 ĐIỂM SÁNG ĐÃ ĐẠT CHUẨN ĐÁNG GHI NHẬN (POSITIVES)

1. **Pop-up Giao Dịch 2 Tầng (Ảnh 1)**:
   - Dòng chữ `Mua sở hữu Lâm Đồng (Đà Lạt)` hiển thị đầy đủ 100%, **triệt tiêu hoàn toàn lỗi cụt chữ `...`**.
   - Huy hiệu `Bot AI 4 (Passive)` mang màu đỏ mận đặc trưng của con cờ, viên thuốc `-1.400 Tr.` đỏ đậm viền sắc nét, độ tương phản rất cao.
2. **Chỉ Báo Nhịp Độ Bot AI (Ảnh 1)**:
   - Dòng `🤖 ⏳ Lượt Bot AI 4 (Passive)... (3/3)` nổi bật phía trên Action Dock, nền đen than chì chữ vàng amber, giải thích minh bạch tiến trình tính toán của Bot.
3. **Hiệu Năng & Độ Nét Đồ Họa**:
   - Duy trì ổn định **60 FPS** ngay trên trình duyệt di động chạy qua đường hầm Ngrok.
   - Tranh di sản địa phương sắc nét, bo góc gạch thẻ cờ mềm mại, không có hiện tượng vỡ hình.

---

## 4. KẾ HOẠCH HÀNH ĐỘNG KHẮC PHỤC (ACTION PLAN)

| Ưu Tiên | Hạng Mục Công Việc | Tệp Cần Sửa | Thời Gian Dự Kiến |
|:---:|---|---|:---:|
| **P1** | Sửa góc quay Camera (Yaw) khớp chiều đọc ô cờ 4 cạnh | `src/client/components/3d/camera_controller.ts` | 30 phút |
| **P1** | Tối ưu co giãn TopBar trên Mobile (Ẩn text FPS, thu nhỏ gap) | `src/client/ui/top_bar.tsx` | 20 phút |
| **P2** | Cập nhật nhãn động trạng thái cho nút chính ActionDock | `src/client/ui/action_dock.tsx` | 15 phút |
| **P2** | Tích hợp nút `👥` vào TopBar hoặc tab trượt mép | `src/client/ui/hud_container.tsx` | 15 phút |
