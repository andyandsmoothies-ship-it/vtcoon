# Kế Hoạch Cải Tiến Kỹ Thuật: IMP-104 — Pure Ivory Price Typography & Zero Black Pill

## 1. BỐI CẢNH & PHẢN HỒI NGƯỜI DÙNG
- Người dùng yêu cầu: "Bỏ phần màu đen tại giá tiền các ô đất".
- Phê chuẩn thiết kế: "In chữ giá tiền trực tiếp lên nền giấy ngà (chữ than đen #0F172A sắc nét, không có khối hộp đen), khi có chủ mới hiện khay 3D đổi màu người chơi".
- Vấn đề trước cải tiến:
  - Khi chưa có người mua, component 3D `OwnerPricePill` hiển thị khối hộp than đen `#090D1A` và viền than sẫm `#1E293B`, khiến chân mọi ô đất có một dải khối đen cộm lên, tạo cảm giác nặng nề trên nền sa bàn diorama sáng trong.

## 2. GIẢI PHÁP THỰC THI (3-STATION PIPELINE)
1. **Trực Quan Hóa Trên Nền Giấy Ngà (Pure Ivory Price Typography)**:
   - Trong `src/client/3d/tile_texture_generator.ts`: Viết hàm `drawTilePriceText` in giá tiền trực tiếp lên canvas bằng chữ than đen `#0F172A`, font `900 24px`, căn giữa `(128, 300)` trên nền giấy ngà `#F3EEDF`.
   - Tuyệt đối không vẽ bất kỳ `roundRect` hay hình khối màu đen nào tại chân ô đất.
2. **Triệt Tiêu Khay Hộp Đen Khi Chưa Mua (Zero Black Pill Invariant)**:
   - Trong `src/client/3d/owner_property_markers.tsx`: `OwnerPricePill` kiểm tra `const hasOwner = Boolean(ownerColor && ownerColor.length > 0);`. Nếu `!hasOwner`, trả về `null` ngay lập tức.
   - Xóa sạch 100% mesh `#090D1A` và viền `#1E293B`.
3. **Bảo Tồn Khay 3D Khi Đã Có Chủ (Active Ownership 3D Recolor)**:
   - Khi đã có người mua (`hasOwner === true`), `OwnerPricePill` render bình thường với màu người chơi `ownerColor`, viền kim loại vàng hoàng gia `#F59E0B`, chữ giá trắng `#FFFFFF`.
4. **Bảo Tồn Các Ô Phi Tài Sản & Viền Chân Đế**:
   - Bảo tồn 100% Action Badges cho các ô Cơ hội, Thị trường, Lệ phí, HOSE.
   - Bảo tồn 100% `OwnerBaseTrim` và `ToyPropertyBuildings`.

## 3. TỆP CAN THIỆP
1. `src/client/3d/tile_texture_generator.ts`
2. `src/client/3d/owner_property_markers.tsx`
3. `tests/client/pure_ivory_price_text_and_zero_black_pill.test.ts`
4. `docs/domain/gotchas.md` (Gotcha #136)
