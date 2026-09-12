# Kế Hoạch Cải Tiến Kỹ Thuật: IMP-07
## CINEMATIC ACTION CAM, CONSTRUCTION SLAM VFX & MỸ THUẬT THƯƠNG MẠI 9.0/10

- **Mã định danh:** `IMP-07`
- **Tên sáng kiến:** Hệ thống Camera Điện Ảnh Tương Tác, Hiệu Ứng Xây Dựng Va Đập & Chuẩn Hóa Mỹ Thuật Quốc Tế (Gói C & Phúc Khảo 9.0/10)
- **Căn cứ yêu cầu:** Lệnh người dùng về Gói C và Phán quyết Nghệ thuật Vòng Cuối của Giám đốc Nghệ thuật (`game-3d-visual-critic`).
- **Phạm vi tác động:** `src/client/3d/`, `src/client/game_canvas.tsx`, `src/client/ui/modals/`.

---

### I. MỤC TIÊU KỸ THUẬT

1. **Hệ Thống Camera State Machine Điện Ảnh:**
   - Xây dựng 4 trạng thái góc nhìn thích ứng:
     * `overview`: Phối cảnh bao quát toàn bán đảo nhiệt đới.
     * `dice_roll`: Hạ cự ly thấp cận cảnh khay xúc xắc trung tâm bàn cờ khi người chơi gieo xúc xắc.
     * `pawn_chase`: Bám sát sau gót quân cờ góc nhìn thứ ba (Third-Person Follow Cam) khi di chuyển.
     * `tile_focus`: Phóng cận cảnh vào ô đất khi người chơi dừng chân hoặc mở modal sổ đỏ.
   - Nội suy chuyển động mượt mà (Exponential Damping), tự động nhường quyền khi người chơi thao tác chuột qua OrbitControls.

2. **Hiệu Ứng Va Đập Xây Dựng (Construction Slam VFX):**
   - Hoạt cảnh công trình rơi tự do gia tốc từ cao độ Y = 3.6 xuống mặt đế ô cờ trong 380ms.
   - Hiệu ứng biến dạng đàn hồi nén bề ngang (Squash & Rebound) khi chạm đất.
   - Rung chấn màn hình (Screen Shake 42Hz) trong 350ms tạo cảm giác trọng lượng vật lý kim loại.
   - Sóng xung kích vành khăn (Shockwave Ring) và pháo hoa hoàng kim (Golden Confetti) ăn mừng khánh thành.

3. **Bản Sửa Đổi Mỹ Thuật 5 Điểm Then Chốt (Chuẩn 9.0/10):**
   - Bán đảo hữu cơ: Thay thế kết cấu bậc thang 90 độ bằng thềm bờ cát hữu cơ vát nghiêng tự nhiên ôm lấy mặt sóng biển.
   - Cứu rỗi chế độ đêm: Nâng ánh sáng môi trường ban đêm lên 0.38 màu xanh navy `#1E293B`, tăng độ phát quang cửa sổ emissive lên 3.2, xóa sạch hiện tượng black crush.
   - Xúc xắc Acrylic Đỏ Ruby: Vật liệu Acrylic tráng gương bóng bẩy, chấm số dập chìm mạ vàng kim loại Champagne.
   - Chase Cam cận gót: Thu hẹp offset xuống `[3.6, 4.2, 3.6]` bám sát gót quân cờ.
   - Thẻ Nổi Sổ Đỏ (Floating Side Drawer): Xóa bỏ backdrop đen che phủ toàn màn hình, giữ nguyên 75% không gian 3D khi tương tác modal.

---

### II. TIÊU CHÍ HOÀN THÀNH (DoD)

1. Kiểm thử tự động: 100% test suites liên quan đến Camera State Machine và VFX trigger PASS.
2. Kiểm tra kiểu tĩnh: `npx tsc --noEmit` đạt 0 lỗi.
3. Thẩm định độc lập: Giám đốc Nghệ thuật (`game-3d-visual-critic`) phê duyệt điểm số >= 8.8/10 (kết quả thực tế đạt 9.00/10).
4. Báo cáo nghiệm thu thực nghiệm được lập tại `docs/reports/improvements/IMP-07-cinematic-camera-and-vfx_report.md`.
