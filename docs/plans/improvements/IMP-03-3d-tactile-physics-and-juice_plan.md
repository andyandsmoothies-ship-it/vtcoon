# [KẾ HOẠCH CẢI TIẾN IMP-03] ĐỘNG LỰC HỌC SA BÀN 3D, VẬT LÝ QUÂN CỜ & TRẢI NGHIỆM XÚC GIÁC (GAME JUICE)

## 1. BỐI CẢNH & MỤC TIÊU KỸ THUẬT

Bàn cờ 3D ban đầu có các chuyển động cơ học thô ráp: quân cờ lướt tuyến tính không có trọng lực; xúc xắc rơi tĩnh không có độ nảy va đập; camera đổi góc bị giật cục khi drop frame; hiệu ứng khánh thành công trình chưa đủ độ sống động (thiếu wow-factor).

Mục tiêu của IMP-03 là đưa nguyên lý hoạt hình đàn hồi (Squash & Stretch), vật lý va đập chân thực và cảm giác xúc giác (Tactile Juice) vào sa bàn 3D ở tốc độ 60 FPS mượt mà.

---

## 2. PHÂN RÃ CÁC HẠNG MỤC CẢI TIẾN

```text
[Quân Cờ Squash & Stretch] ──► [Âm Thanh Biến Thiên Cao Độ (Pitch 0.95 - 1.05)]
           │
           ▼
[Xúc Xắc 3D Nảy Vật Lý]    ──► [Tung cao ➔ Nảy đàn hồi ➔ Khóa góc số đích]
           │
           ▼
[Camera Exponential Decay] ──► [Nội suy hàm mũ chống giật, chống NaN / Lag]
           │
           ▼
[Construction Slam VFX]    ──► [Va đập công trình, Sóng xung kích & Pháo hoa]
```

### 1. Nguyên Lý Squash & Stretch Cho Quân Cờ
- **Tệp can thiệp**: `src/client/3d/pawn_animator.tsx`.
- **Nghiệp vụ**:
  * Dựa trên tiến trình bước nhảy nội suy `t` [0 ➔ 1]:
    - [0% - 15%]: Co nén lấy đà (Squash) ➔ scaleY: 0.85, scaleXZ: 1.08.
    - [15% - 70%]: Kéo dài thân trên không trung theo hướng bay (Stretch) ➔ scaleY: 1.25, scaleXZ: 0.90.
    - [70% - 90%]: Rơi gia tốc trọng trường.
    - [90% - 100%]: Tiếp đất nhún giảm chấn (Impact Squash) ➔ scaleY: 0.80, scaleXZ: 1.15.
    - Sau tiếp đất 0.1s: Hồi phục hình dạng tự nhiên [1, 1, 1].
  * Âm thanh bước chân: Phát âm thanh tiếp đất kèm biến thiên ngẫu nhiên cao độ (Pitch Variation 0.95 - 1.05) nhằm triệt tiêu cảm giác máy móc đều đặn.

### 2. Chu Trình Tung Nảy 3 Giai Đoạn Cho Xúc Xắc 3D
- **Tệp can thiệp**: `src/client/3d/dice_tray.tsx`.
- **Nghiệp vụ**:
  * Giai đoạn 1 (Tung lên): Phóng vút lên cao (posY: 3.8) và xoay ngẫu nhiên 3-4 vòng quanh 3 trục X, Y, Z trong 0.8s.
  * Giai đoạn 2 (Rơi & Nảy va đập): Rơi chạm mặt sàn khay nỉ, nảy đàn hồi 2 nhịp giảm dần (posY nảy lên 0.8 rồi rơi lại).
  * Giai đoạn 3 (Khóa kết quả): Dừng khít tại góc xoay của mặt số đích đã được tính toán chính xác từ Server (`getDiceFaceRotation(face)`).

### 3. Camera State Machine với Exponential Damping
- **Tệp can thiệp**: `src/client/3d/camera_state_machine.ts`.
- **Nghiệp vụ**:
  * Thay thế hàm Lerp phụ thuộc khung hình bằng hàm suy giảm hàm mũ không phụ thuộc tốc độ khung hình (Frame-rate independent exponential damping):
    `dampValue(current, target, speed, dt) = current + (target - current) * (1 - exp(-dt * speed))`.
  * Cơ chế phòng thủ: Giới hạn an toàn `dt = min(dt, 0.1s)` để chống giật vượt ngưỡng khi lag khung hình; xử lý an toàn giá trị `NaN`.

### 4. Hiệu Ứng Va Đập Xây Dựng (Construction Slam VFX)
- **Tệp can thiệp**: `src/client/3d/construction_slam_vfx.tsx`, `src/client/store/vfx_store.ts`.
- **Nghiệp vụ**:
  * Khi nâng cấp nhà C1-C3, kích hoạt công trình rơi tự do từ trên cao cắm xuống mặt đế.
  * Khi chạm đất: Kích hoạt sóng xung kích vành khăn phát sáng (Shockwave Ring), chùm pháo hoa hoàng kim / bụi vàng bung tỏa (Octahedron confetti), và rung màn hình vi mô (Screen Shake).

---

## 3. RÀNG BUỘC KỸ THUẬT & NGHIỆM THU

- Tốc độ khung hình: Duy trì 60 FPS trên WebGL Canvas.
- File LOC: `pawn_animator.tsx` <= 300 LOC, `camera_state_machine.ts` <= 200 LOC, `construction_slam_vfx.tsx` <= 300 LOC.
- Test coverage: Kiểm thử toàn bộ hàm toán học quỹ đạo và render tĩnh ngoài Canvas.
