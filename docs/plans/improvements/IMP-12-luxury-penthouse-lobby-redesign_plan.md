# KẾ HOẠCH CẢI TIẾN IMP-12: SẢNH CHỜ VIP PENTHOUSE (INTERIOR SCENE & LUXURY PAWNS - BƯỚC 2)

## 1. BỐI CẢNH & VẤN ĐỀ CỐT LÕI
- **Hiện trạng trước cải tiến:**
  1. **"Người que Lego" thô sơ:** 4 ghế da ngồi quanh bàn sử dụng hình nhân người que (đầu hình cầu cắm trên thân trụ cụt và tay chữ nhật), làm giảm trầm trọng tính sang trọng và đẳng cấp của một sảnh chờ VIP Penthouse tầng 80.
  2. **Không gian phòng bao dạng khối hộp phẳng:** Các bức tường và vách kính được dựng bằng các tấm phẳng (`PlaneGeometry`) và khối hộp thô sơ, thiếu đường cong Panorama chân thực nhìn ra bán đảo vịnh biển hoàng hôn.
  3. **"Tấm bảng vuông đen xì":** Tâm bàn tròn đặt một khối hộp chữ nhật phẳng đen kịt (`color: "#0F172A"`), hoàn toàn không toát lên được cảm giác sa bàn ba chiều (Hologram) lơ lửng bồng bềnh công nghệ cao.

- **Mục tiêu Bước 2 (Interior Scene & Luxury Pawns):**
  1. **Thay thế "Người que Lego" bằng 4 Linh Vật Cờ Thượng Lưu (Luxury Pawns):**
     * **Slot 0 (Đại Gia Sài Gòn / Host):** Tượng Tháp Landmark thu nhỏ mạ Vàng Hoàng Gia (`color: "#F59E0B"`, `metalness: 0.95`, `roughness: 0.12`).
     * **Slot 1 (Chú Sáu):** Tượng Du Thuyền Vịnh Biển mạ Bạc Bạch Kim (`color: "#E2E8F0"`, `metalness: 0.9`, `roughness: 0.15`).
     * **Slot 2 (Cô Tư):** Tượng Xe Cổ Cổ Điển mạ Đồng Đỏ (`color: "#B45309"`, `metalness: 0.85`, `roughness: 0.18`).
     * **Slot 3 (Bé Bo):** Tượng Ngựa Chiến / Kỳ Hạm mạ Titan Xanh Navy (`color: "#1E3A8A"`, `metalness: 0.9`, `roughness: 0.14`).
     * Ghế trống chưa có người ngồi hiển thị vòng phát quang và chữ "TRỐNG" mời kết nối. Bảng tên 3D phát quang nổi lơ lửng trên linh vật.
  2. **Kiến tạo Không gian Nội thất Penthouse Thực thụ (Architectural Enclosure):**
     * Dựng vách kính cong Panorama bán nguyệt 180 độ phía sau (`CylinderGeometry(20, 20, 14, 32, 1, true, 0, Math.PI)`), hiển thị nền trời hoàng hôn mật ong ấm áp và đường chân trời vịnh biển.
     * Nẹp khung nhôm xước mờ màu đen than chì (`#1E293B`, `roughness: 0.3`) chia vách kính thành các ô cửa sổ kịch trần sang trọng.
     * Trần thạch cao giật cấp với vòm trần chứa dải đèn hắt (Cove Light) vàng ấm `#FEF3C7` rọi xuống sàn đá cẩm thạch trắng Carrara (`MeshReflectorMaterial`), tạo độ bóng mềm mại và chiều sâu không gian.
  3. **Sa bàn Mini Hologram Đích Thực:**
     * Xóa bỏ tấm bảng vuông đen xì.
     * Thay bằng mô hình sa bàn thu nhỏ phát quang màu xanh Cyan Hologram (`color: "#06B6D4"`, `transparent: true`, `opacity: 0.8`, `emissive: "#06B6D4"`, `emissiveIntensity: 1.8`), lơ lửng bồng bềnh và tự động xoay chậm 360 độ trên bệ chiếu ba chiều giữa bàn.

---

## 2. KIẾN TRÚC & PHẠM VI TRIỂN KHAI

```text
[PenthouseLobbyScene] (Main Viewport Scene Orchestrator)
  ├── [PenthouseCameraController] (OrbitControls cự ly [3.8, 3.2, 5.2], FOV mượt mà)
  ├── [PenthouseEnclosure] (src/client/3d/penthouse_enclosure.tsx)
  │     ├── Sàn đá cẩm thạch Carrara (MeshReflectorMaterial mirror=0.45 mixBlur=0.8)
  │     ├── Thảm nhung tròn & viền nẹp kim loại vàng Champagne
  │     ├── Vách kính cong bán nguyệt 180 độ (CylinderGeometry R=20 H=14)
  │     ├── 9 nẹp khung nhôm xước than chì (#1E293B, roughness=0.3)
  │     ├── Hậu cảnh hoàng hôn vịnh biển uốn cong tự nhiên theo vách kính
  │     └── Trần thạch cao giật cấp & vòm dải đèn hắt Cove Light (#FEF3C7)
  ├── [PenthouseTable]: Bàn tròn trụ đồng mạ bóng, vành gỗ óc chó & bệ máy chiếu ba chiều
  ├── [CentralHologram]:
  │     ├── Chùm tia nón phát quang AdditiveBlending
  │     ├── Sa bàn mini Cyan Hologram (#06B6D4, opacity=0.8, emissive=1.8)
  │     ├── 4 khối tháp góc vàng Amber & Landmark mini trung tâm
  │     └── Màn hình HUD Holographic nghiêng hiển thị thông số phòng
  └── [PenthouseChairsAndPlayers]:
        ├── 4 ghế da bọc cao cấp quanh bàn
        └── 4 Linh vật cờ thượng lưu PBR (src/client/3d/luxury_pawn_models.tsx):
              ├── Slot 0: Tháp Landmark thu nhỏ mạ Vàng Hoàng Gia (#F59E0B)
              ├── Slot 1: Du Thuyền Vịnh Biển mạ Bạc Bạch Kim (#E2E8F0)
              ├── Slot 2: Xe Cổ Cổ Điển mạ Đồng Đỏ (#B45309)
              ├── Slot 3: Ngựa Chiến Kỳ Hạm mạ Titan Xanh Navy (#1E3A8A)
              └── Ghế trống: Vòng phát quang & chữ "TRỐNG"
```

- `src/client/3d/luxury_pawn_models.tsx` (NEW): Mô hình 4 linh vật cờ mạ kim loại PBR tinh xảo.
- `src/client/3d/penthouse_enclosure.tsx` (NEW): Kiến trúc nội thất Penthouse với vách kính cong 180 độ, nẹp than chì và trần thạch cao giật cấp đèn cove.
- `src/client/3d/penthouse_lobby_scene.tsx`: Tích hợp `PenthouseEnclosure`, `LuxuryPawnModel`, sa bàn mini phát quang Cyan Hologram và tối ưu kích thước file.
- `tests/client/penthouse_lobby_scene.test.ts`: Bổ sung các suite kiểm chứng TC-P3.9, TC-P3.10, TC-P3.11.

---

## 3. TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE)
1. 100% kiểm tra TypeScript biên dịch sạch sẽ (`npx tsc --noEmit` = 0 lỗi).
2. Toàn bộ 104 test suites của dự án tiếp tục PASS 100% (Zero Regression).
3. Tuân thủ Categorized File Limits (UI Components <= 500 LOC; Unit Tests <= 300 LOC).
4. Zero Dirty Casts (`strict: true`, không dùng `as any` hay `as unknown as T`).
5. Có ảnh screenshot kiểm chứng thực tế tại `docs/reports/improvements/screenshots/step2_luxury_penthouse_lounge.jpg`.
