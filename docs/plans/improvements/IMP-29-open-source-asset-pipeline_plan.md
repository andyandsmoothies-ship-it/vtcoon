# KẾ HOẠCH NÂNG CẤP TÀI NGUYÊN 3D NGUỒN MỞ & HÌNH ẢNH TẠO SINH (IMP-29: OPEN-SOURCE ASSET PIPELINE)

> **Mã số:** IMP-29  
> **Căn cứ:** Định hướng mỹ thuật `docs/domain/design.md`, Bất biến kiến trúc `GEMINI.md`.  
> **Phương châm:** Không dùng Blender. Sử dụng công cụ mã nguồn mở miễn phí (**Blockbench**, **MagicaVoxel**, **gltf-transform**), thư viện **`@react-three/drei`**, kết hợp hình ảnh/vân bề mặt PBR tạo sinh (AI-generated textures) để đạt chuẩn thương mại Retropoly mà vẫn giữ nguyên 100% cấu trúc Web/Zalo/Telegram hiện tại.

---

## I. NGUYÊN TẮC BẤT BIẾN CẦN BẢO TOÀN

1. **Giữ nguyên 100% Nền Tảng Kỹ Thuật (Tech Stack Invariant)**:
   - Render Engine: `React Three Fiber` + `Three.js` (Web-Native).
   - Bộ não nghiệp vụ: `Server-Authoritative FSM` (Node.js/TypeScript).
   - Mạng: `Native WebSockets` (Delta < 10KB/tick).
   - Giao diện 2D & Âm thanh: `Tailwind CSS` + `WebAudio API Synth`.
2. **Cơ Chế Dự Phòng Tuyệt Đối (Zero-Crash Fallback Invariant)**:
   - Toàn bộ component nạp mô hình `.glb` đều phải có cơ chế dự phòng (fallback) tự động quay về hình khối Three.js hiện tại nếu tệp 3D chưa tải xong hoặc bị thiếu. Game không bao giờ bị trắng màn hình.
3. **Kỷ Luật Ngân Sách Tài Nguyên (Asset Budget Invariant)**:
   - Tổng dung lượng tải ban đầu của toàn bộ mô hình 3D: `<= 2.5 MB`.
   - Mỗi quân cờ: `<= 150 KB` (<= 1.200 triangles).
   - Mỗi tòa nhà C1-C3: `<= 100 KB` (<= 800 triangles).
   - Mỗi phương tiện vi mô: `<= 30 KB` (<= 400 triangles).
   - Texture: Kích thước `512x512` hoặc tối đa `1024x1024` nén WebP/PNG.

---

## II. SƠ ĐỒ LUỒNG SẢN XUẤT VÀ TÍCH HỢP TÀI NGUYÊN

```
[BƯỚC 1: TẠO HÌNH NGUỒN MỞ]
Blockbench (web.blockbench.net) ──► Dựng Low-Poly / Stylized bo góc (nhẹ, nhanh)
Hoặc Voxel (MagicaVoxel)        ──► Xuất file .gltf / .glb chuẩn

[BƯỚC 2: VÂN BỀ MẶT TẠO SINH]
AI Image Generation             ──► Sinh tranh tường, phù điêu, gạch ngói Việt Nam
Photoshop / Photopea / GIMP     ──► Đóng gói Color / Normal / Roughness Map (512x512)

[BƯỚC 3: TỐI ƯU HÓA TỰ ĐỘNG]
scripts/optimize_assets.mjs     ──► Chạy gltf-transform (Nén Draco + Meshopt, giảm 80%)

[BƯỚC 4: TÍCH HỢP CLIENT R3F]
public/models/                  ──► useGLTF() + Suspense Fallback ──► 60 FPS trên Web/Zalo
```

---

## III. KẾ HOẠCH TRIỂN KHAI CHI TIẾT (5 GIAI ĐOẠN)

### Giai Đoạn 1: Xây Dựng Hạ Tầng Nạp Mô Hình & Cơ Chế Fallback
- [NEW] Tạo cấu trúc thư mục tài nguyên:
  - `public/models/pawns/` (4 quân cờ VIP)
  - `public/models/buildings/` (Nhà C1, C2, C3)
  - `public/models/vehicles/` (Xe buýt, taxi, xe con, du thuyền)
  - `public/models/landmarks/` (Bến Bến Thành, Sân bay, Cảng cẩu)
- [NEW] `src/client/3d/asset_loader/safe_gltf_model.tsx`:
  - Hook và component `SafeGLTFModel` bọc `useGLTF` với `Suspense`, tự động đo thời gian tải và hiển thị procedural mesh nếu lỗi mạng.
- [NEW] `scripts/optimize_assets.mjs`:
  - Script dòng lệnh Node.js kiểm tra kích thước file, tự động cảnh báo nếu file `.glb` vượt quá ngân sách kỹ thuật.

### Giai Đoạn 2: Nâng Cấp 4 Quân Cờ VIP (Luxury Pawns Overhaul)
- Thay thế việc ghép hàng trăm khối hộp trong `src/client/3d/luxury_pawn_models.tsx`:
  1. **Tháp Vàng Sài Gòn (Host P1)**: Mô hình tháp chọc trời bo viền vát cạnh vàng champagne óng ánh.
  2. **Du Thuyền Bạc Vịnh Ngọc (P2)**: Thân tàu du lịch hạng sang mạ bạc PBR.
  3. **Xe Cổ Đồng Cổ Điển (P3)**: Xe mui trần cổ điển Sài Gòn xưa màu đồng sáng bóng.
  4. **Ngựa Chiến Sapphire (P4)**: Tượng mã đáo thành công màu xanh sapphire ánh kim.
- Kết quả: Giảm từ hơn 300 LOC trong `luxury_pawn_models.tsx` xuống còn ~60 LOC nạp component sạch.

### Giai Đoạn 3: Nâng Cấp Công Trình Nhà Đất 3 Cấp (C1, C2, C3)
- Thay thế 429 LOC phức tạp trong `src/client/3d/procedural_building.tsx`:
  1. **Cấp 1 (Nhà Phố Mini)**: Shophouse phố cổ mái ngói đỏ, lam chắn nắng, ban công hoa.
  2. **Cấp 2 (Cao Ốc Thương Mại)**: Khối tháp kính sapphire bo góc, sảnh đón canopy.
  3. **Cấp 3 (Biểu Tượng Đô Thị)**: Tòa tháp vương miện Landmark lấp lánh đèn LED đỉnh tháp.
- Giữ nguyên hiệu ứng khánh thành rung chấn `Construction Slam VFX` và Contact Shadows.

### Giai Đoạn 4: Nâng Cấp Hệ Thống Vi Giao Thông Đô Thị (Micro-Traffic)
- Nâng cấp `src/client/3d/diorama/diorama_traffic.tsx` & `coastal_island_environment.tsx`:
  1. **Xe buýt vàng Sài Gòn**: Mô hình bo cong retro có kính trong suốt.
  2. **Taxi xanh / Xe sedan**: Đèn pha LED rọi sáng mặt đường.
  3. **Tàu container & Tàu tuần tra vịnh biển**: Thân tàu hàng hải chân thực rẽ sóng bọt trắng.
- Tận dụng `InstancedMesh` của Three.js để 8 xe chạy trên đường chỉ tốn đúng 2 Draw Calls.

### Giai Đoạn 5: Nâng Cấp Vân Bề Mặt Tạo Sinh & Danh Thắng Di Sản (Vietnamese Heritage)
- Tích hợp các ảnh texture người dùng tạo sinh vào bàn cờ:
  1. **Mặt lưng Thẻ Khí Vận & Cơ Hội**: Vân Trống đồng Đông Sơn mạ vàng sắc nét.
  2. **Bề mặt Ô Đất Trung Tâm**: Họa tiết lát gạch men cổ Bến Thành / Chợ Lớn.
  3. **Danh thắng 4 góc**: Biểu tượng Nhà thờ Đức Bà, Bến Nhà Rồng, Sân bay Tân Sơn Nhất.

---

## IV. QUY CHUẨN THIẾT KẾ CHO NGƯỜI DÙNG (USER CHEATSHEET)

Khi bạn dựng mô hình trên **Blockbench** (hoặc công cụ tương đương) và tạo ảnh:

1. **Phần mềm khuyên dùng**: [Blockbench Web (web.blockbench.net)](https://web.blockbench.net) -> Chọn loại dự án `Generic Model`.
2. **Quy cách trục**:
   - Trục **Y hướng lên (Y-Up)**.
   - Điểm trọng tâm (Pivot): Đặt tại **chân đế `[0, 0, 0]`** để quân cờ và nhà đặt đúng mặt sàn.
   - Kích thước chuẩn: Quân cờ cao khoảng `1.0` - `1.4` đơn vị bàn cờ. Nhà C1 cao `0.6`, C2 cao `1.0`, C3 cao `1.6`.
3. **Quy cách xuất file**:
   - Menu `File` ➔ `Export` ➔ `Export glTF Model...` (chọn đuôi `.glb`).
4. **Quy cách ảnh tạo sinh (AI Images)**:
   - Tỷ lệ 1:1, kích thước `512x512` pixel (hoặc `1024x1024`).
   - Định dạng `.png` hoặc `.webp`.

---

## V. KẾ HOẠCH KIỂM THỬ & NGHIỆM THU

1. **Tự động hóa**:
   - Chạy `npx tsc --noEmit` đạt 0 lỗi.
   - Chạy `npm run gate:quick` đạt 0 anti-patterns và 0 vi phạm anti-slop.
   - Toàn bộ 125/125 test files (1.475/1.475 tests) PASS 100%.
2. **Kiểm thử hiệu năng (NFR Profile)**:
   - Kiểm tra bộ nhớ WebGL trên Chrome DevTools: Giữ vững 60 FPS, Draw Calls < 65, RAM < 200MB.
   - Đo thời gian tải tài nguyên trên đường truyền 3G/4G mô phỏng: Dưới 1.5 giây.
3. **Kiểm tra Fallback khi mất mạng (Offline/Missing Asset Resilience)**:
   - Đổi tên tệp `.glb` xem component có tự động chuyển về hình khối procedural mà không báo lỗi hay crash app không.
