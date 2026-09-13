# [IMP-40] Kế Hoạch Triệt Tiêu Chói Lóa Phản Quang & Cân Bằng Ánh Sáng Dịu Mắt (Anti-Glare Specular & Gentle Daylight)

## 1. Phân Tích Hiện Tượng Từ Ảnh Người Dùng Cung Cấp (`media_1789304900099.png`)

Từ ảnh người dùng gửi, 4 nguyên nhân vật lý gây chói lóa và quá sáng đã được xác định chính xác:

```text
[1. Phản Quang Gương Sông & Biển] 
    roughness: 0.08, metalness: 0.55 trên Sông Sài Gòn & Đại Dương
    ──> Phản xạ trực diện nguồn sáng mặt trời tạo thành đốm trắng chói lòa giữa bàn cờ.

[2. Quầng Sáng Bloom Lan Tỏa] 
    bloomThreshold: 1.25, bloomIntensity: 0.55
    ──> Đốm phản quang nước vượt ngưỡng 1.0, kích hoạt Bloom bốc hơi thành quầng sáng trắng đè lấn lên các ô Long Thành, Lệ Phí Đất.

[3. Nắng Chiếu & Phơi Sáng Quá Mức] 
    sunIntensity: 1.08 + fill: 0.3 + rim: 0.3 + ambient: 0.24 + IBL + exposure: 1.05
    ──> Tổng lượng quang thông chiếu lên mặt thẻ cờ quá cao, đẩy vùng sáng vào ngưỡng bão hòa trắng xóa (white clipping).

[4. Nền Thẻ Cờ Bị Bợt Trắng] 
    ctx.fillStyle = '#F8F5EE' (97.2% độ sáng trắng)
    ──> Dưới ánh sáng mạnh, nền giấy ngà bị hòa lẫn thành màu trắng tinh, làm giảm độ tương phản của chữ và tranh di sản.
```

---

## 2. Giải Pháp Kiến Trúc Cốt Lõi

1. **Chuyển Chất Liệu Nước Từ Gương Kim Loại Sang Sa Bàn Đồ Chơi (Toy Diorama Velvet Water)**:
   - Sông Sài Gòn và Biển chuyển từ `roughness: 0.08` và `metalness: 0.55` sang `roughness: 0.75 - 0.80` và `metalness: 0.02`. Nước sở hữu bề mặt nhung ngọc bích no màu, trầm tĩnh, sâu thẳm, triệt tiêu 100% đốm chói lóa chuẩn sa bàn đồ chơi cao cấp trong Retropoly và Monopoly Plus.

2. **Nâng Ngưỡng Bloom Để Triệt Tiêu Quầng Mờ Trắng**:
   - Nâng `bloomThreshold` từ `1.25` lên `2.5` và hạ `bloomIntensity` từ `0.55` xuống `0.20`.
   - Bloom chỉ phát huy tác dụng trên các nguồn sáng phát quang ban đêm (đèn hải đăng, đèn LED tháp Landmark, pháo hoa ăn mừng), tuyệt đối không làm nhòe lóa mặt thẻ cờ và mặt nước ban ngày.

3. **Hạ Nhẹ Cường Độ Ánh Sáng Ban Ngày & Tối Ưu Nền Thẻ Giấy Ngà Ấm**:
   - `sunIntensity`: Giảm từ `1.08` xuống `0.92`.
   - `fillLight` & `rimLight`: Giảm từ `0.30` xuống `0.12` (cố định trong `calculateBaseFill` và `calculateBaseRim`).
   - `toneMappingExposure`: Đặt về `0.94` để dải màu đằm chắc, có chiều sâu khối bóng đổ.
   - Nền thẻ cờ: Chuyển sang màu giấy ngà cổ điển `#F3EEDF` dịu mắt, chống lóa 100%.

---

## 3. Các Tệp Mã Nguồn Thay Đổi

### 1. Triệt Tiêu Phản Quang Mặt Nước (Water Specular Anti-Glare)
- `src/client/3d/diorama/diorama_terrain.tsx`: Sông Sài Gòn `roughness = 0.80`, `metalness = 0.02`.
- `src/client/3d/centerpiece_water.tsx`: `WATER_MATERIAL_PROPS` `roughness = 0.75`, `metalness = 0.02`.
- `src/client/3d/coastal_island_environment.tsx`: Đại dương viền đảo `roughness = 0.75`, `metalness = 0.02`.

### 2. Khống Chế Hậu Kỳ Bloom & Phơi Sáng (Anti-Bleach & Glare Suppression)
- `src/client/3d/post_processing_pipeline.tsx`: `bloomThreshold: 2.5`, `bloomIntensity: 0.20`.
- `src/client/game_canvas.tsx`: `toneMappingExposure: 0.94`.

### 3. Cân Bằng Ánh Sáng Ban Ngày Dịu Mắt (Balanced Daylight Lighting)
- `src/client/store/environment_store.ts`: Preset `day`: `sunIntensity: 0.92`, `ambientIntensity: 0.18`, `hemiIntensity: 0.14`.
- `src/client/3d/time_of_day_lighting.tsx`: Xuất bản và áp dụng `calculateBaseFill` và `calculateBaseRim` cố định `0.12` cho ban ngày.

### 4. Nền Thẻ Cờ Giấy Ngà Dịu Mắt (Warm Parchment Paper)
- `src/client/3d/tile_texture_generator.ts`: Đổi nền thẻ cờ thường từ `#F8F5EE` sang `#F3EEDF`.
- Bảo toàn 4 ô góc đặc biệt với theme sẫm tương phản cao chống lóa 100% (GO: `#0F172A`, Trạm Kiểm Toán: `#1E1B4B`, Nghỉ Dưỡng: `#064E3B`, Thanh Tra Thuế: `#450A0A`).

---

## 4. Kế Hoạch Kiểm Thử & Nghiệm Thu

1. **Automated Tests**:
   - Viết bộ kiểm thử hợp đồng `tests/client/imp40_anti_glare_and_gentle_daylight.test.ts` (17 atomic tests) theo Ma trận 4 khía cạnh: Boundary, State Reactivity, Resource Disposal, Error Defense.
   - Xác minh Inversion Gate (đảm bảo thất bại trên mã nguồn cũ).
2. **Reviewer Gates**:
   - `game-3d-visual-critic`: Thẩm định trực tiếp ảnh nghiệm thu vật lý.
   - `spec-reviewer`: Đối chiếu 100% yêu cầu kỹ thuật, không có assertion relaxation.
3. **Triển khai Live**:
   - Rebuild Docker container `vtcoon-vtcoon-1` và nghiệm thu tại `http://localhost:3000/`.
