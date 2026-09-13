# Kế Hoạch Kỹ Thuật IMP-33: Tích Hợp Nghệ Thuật Diorama 3D Bản Địa & Biểu Tượng Ô Hạ Tầng Cố Định

## I. TỔNG QUAN & BỐI CẢNH (CONTEXT & OBJECTIVES)

- **Vấn đề cốt lõi**:
  - Dự án hiện sở hữu 29 tác phẩm nghệ thuật 3D Diorama bản địa độc bản (`docs/assets/raw_tiles`) đã được cắt nền trong suốt và nén WebP chuẩn hóa (`public/assets/tiles/` gồm 146 tệp).
  - Trước đây, các ảnh này từng được dùng làm `StandeeBillboard` (biển phẳng 2.5D) cắm trên 36 ô cờ. Do cơ chế `Billboard follow={true}` luôn quay vuông góc với camera, chúng tạo thành bức tường che khuất quân cờ, công trình 3D, tên ô và giá tiền (Lỗi kiểm toán P1-02), dẫn đến việc bị tắt tạm thời (`false && READY_TILES.has(...)`).
  - Người dùng lo ngại về sự xung đột giữa việc dùng mô hình độc bản với cơ chế nâng cấp nhà 4 cấp độ (C0–C3).
- **Mục tiêu đạt được trong IMP-33**:
  1. **Tầng Trưng Bày Nghệ Thuật (Thẻ Sổ Đỏ / Modal Mua BĐS)**: Tích hợp trọn vẹn 28 tác phẩm Diorama 3D WebP vào làm Banner Nghệ Thuật trung tâm trong thẻ bài Sổ Đỏ (`TitleDeedModal`). Người chơi được ngắm trọn vẹn Chợ nổi Cái Răng, Tháp Bitexco Nguyễn Huệ, Ga Đà Lạt, Cầu Rồng Đà Nẵng ở độ phân giải cao và góc nhìn đẹp nhất.
  2. **Tầng Biểu Tượng Độc Bản Trên Bàn Cờ (6 Ô Hạ Tầng Cố Định)**: 6 ô hạ tầng không bao giờ nâng cấp nhà C1–C3 (Sân bay Long Thành - ô 5, Điện lực EVN - ô 12, Cảng Cái Mép - ô 15, Đường sắt Bắc Nam - ô 25, Cấp thoát nước - ô 28, Sân bay Nội Bài - ô 35) sẽ được bật lại biểu tượng Standee 3D thu nhỏ thanh thoát (`scale={[0.85, 0.85]}`), tạo điểm nhấn độc bản trên 4 cạnh bàn cờ mà không che khuất mặt cờ.
  3. **Tầng Trực Quan Cấp Độ (Mặt Bàn Cờ 3D)**: Thêm vạch chỉ thị cấp độ (Tier Level Indicators) trên Cọc cờ Sở hữu (`OwnershipMarkerInstances`) để người chơi dù quan sát từ góc máy camera nào cũng nhận biết tức thì cấp độ C0, C1, C2, C3 của bất động sản.

---

## II. SƠ ĐỒ KIẾN TRÚC TAM GIÁC TRẢI NGHIỆM

```
                     [TAM GIÁC TRẢI NGHIỆM ĐỒ HỌA VTCOON]
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│  MẶT BÀN CỜ 3D   │          │   THẺ SỔ ĐỎ 2D   │          │   6 Ô HẠ TẦNG    │
│  (Gameplay Core) │          │  (Art Showcase)  │          │ (Fixed Landmark) │
├──────────────────┤          ├──────────────────┤          ├──────────────────┤
│• C0: Đất + Cọc cờ│          │• Bung ảnh WebP   │          │• Ô 5: Long Thành │
│• C1: Nhà ngói đỏ │          │  Diorama 3D sắc  │          │• Ô 12: EVN       │
│• C2: Cao ốc kính │          │  nét từng địa    │          │• Ô 15: Cái Mép   │
│• C3: Landmark cao│          │  danh (Cái Răng, │          │• Ô 25: Đường Sắt │
│• Cọc cờ có mốc   │          │  Bitexco, v.v.)  │          │• Ô 28: Cấp Nước  │
│  vạch nhận diện  │          │• Hiệu ứng ánh hào│          │• Ô 35: Nội Bài   │
│  cấp độ từ xa    │          │  quang viền mềm  │          │• Standee thu nhỏ │
└──────────────────┘          └──────────────────┘          └──────────────────┘
```

---

## III. CHI TIẾT THAY ĐỔI MÃ NGUỒN (PROPOSED CHANGES)

### 1. Thành phần UI: Thẻ Sổ Đỏ (`TitleDeedModal`)

#### [MODIFY] [`src/client/ui/modals/title_deed_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/title_deed_modal.tsx)
- Bổ sung khu vực **Diorama Art Showcase Banner**:
  - Đặt ngay bên dưới Ruy-băng tiêu đề (Ribbon Header) và phía trên Bảng giá niêm yết.
  - Sử dụng hàm chuẩn `getTileAssetUrl(cellIndex)` từ `src/client/assets/tile_assets.ts` để nạp ảnh `/assets/tiles/tile_${paddedId}.webp`.
  - Khung ảnh thiết kế theo phong cách xúc giác: nền kính tối mờ `bg-slate-950/60`, viền kim loại mảnh `border-amber-400/25`, độ cao `h-32 sm:h-36`, ảnh hiển thị chính giữa với hiệu ứng nổi `drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]`.
  - Fallback an toàn: Nếu ảnh chưa tải hoặc không tồn tại, hiển thị icon văn hóa lớn cùng nền màu nhóm đất `ribbonColor`.
- Tuân thủ nghiêm ngặt 4 quy tắc `lint:ui`: Không dùng viền accent trên bo tròn, không bounce easing, không text xám trên màu nền, không gradient text.
- Đảm bảo giới hạn LOC: File giữ trần <= 500 LOC cho UI.

---

### 2. Thành phần Đồ Họa 3D: Mặt Bàn Cờ & Ô Cờ (`board_tile.tsx`)

#### [MODIFY] [`src/client/3d/board_tile.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_tile.tsx)
- **Kích hoạt Biểu tượng cho 6 ô Hạ tầng cố định**:
  - Định nghĩa điều kiện hạ tầng cố định:
    ```tsx
    const isFixedInfrastructure = cell.type === CellType.Railroad || cell.type === CellType.Utility;
    ```
  - Cập nhật nhánh render cho `StandeeBillboard`.
- **Thu nhỏ và hạ thấp `StandeeBillboard`**:
  - Đưa `position={[0, 0.45, 0]}` và `scale={[0.85, 0.85]}` để biểu tượng đứng gọn gàng trên ô hạ tầng, không che khuất chữ tên ô hay viền bàn cờ.
- **Tối ưu nhận diện cấp độ trên `OwnershipMarkerInstances`**:
  - Thêm thuộc tính `level?: 0 | 1 | 2 | 3` vào `OwnershipMarkerInstances`.
  - Hiển thị các vòng đai kim loại mạ vàng (Tier Level Indicator Rings) tương ứng số cấp độ đã xây (C0: 0 vạch, C1: 1 vạch, C2: 2 vạch, C3: 3 vạch hoàng kim).
- Đảm bảo giới hạn LOC: File giữ trần <= 400 LOC cho 3D Logic.

---

### 3. Tập Kiểm Thử Hợp Đồng (Contract Tests)

#### [NEW] [`tests/client/indigenous_diorama_and_infrastructure.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/indigenous_diorama_and_infrastructure.test.ts)
- Gồm tối thiểu 15 atomic assertions bảo vệ 3 cam kết:
  - **Nhóm 1 (Thẻ Sổ Đỏ)**: Render `TitleDeedModal` kiểm tra sự hiện diện của ảnh WebP từ `/assets/tiles/` với fallback an toàn.
  - **Nhóm 2 (Ô Hạ Tầng 3D)**: Kiểm tra mã nguồn `board_tile.tsx` kích hoạt `StandeeBillboard` cho `CellType.Railroad` và `CellType.Utility`, xác nhận kích thước scale nhỏ gọn (`0.85`) và cao độ hạ thấp.
  - **Nhóm 3 (Chỉ Dấu Cấp Độ Cọc Cờ)**: Kiểm tra `OwnershipMarkerInstances` nhận prop `level` và render các vòng đai phân cấp C0..C3.

---

## IV. QUY TRÌNH THI CÔNG 3 TRẠM (MANDATORY 3-STATION PIPELINE)

1. **Trạm 1 (RED Contract Test)**: `qa-tester` viết tệp kiểm thử `tests/client/indigenous_diorama_and_infrastructure.test.ts` và chứng minh test báo đỏ (Adversarial Inversion).
2. **Trạm 2 (GREEN Implementation)**: `implementer` cập nhật mã nguồn trong `title_deed_modal.tsx` và `board_tile.tsx` để chuyển toàn bộ test sang màu xanh (GREEN).
3. **Trạm 3 (Independent Review & Disk Verification)**: 
   - `spec-reviewer`: Kiểm toán đĩa vật lý, đối chiếu 100% đặc tả và giới hạn LOC.
   - `ui-craft-reviewer`: Thẩm định chất lượng 2D xúc giác của thẻ Sổ Đỏ mới, chạy `npm run lint:ui` đạt 0 vi phạm.

---

## V. KẾ HOẠCH XÁC MINH & HÌNH ẢNH KIỂM CHỨNG (VERIFICATION PLAN)

### 1. Kiểm thử tự động (Automated Verification)
```bash
cmd /c npx vitest run tests/client/indigenous_diorama_and_infrastructure.test.ts
cmd /c npx vitest run tests/client/impeccable_tactile_modals.test.ts
cmd /c npx vitest run tests/client/phase3_visual_polish.test.ts
cmd /c npx tsc --noEmit
cmd /c npm run gate:quick
```

### 2. Kiểm chứng hình ảnh thực tế (Visual Verification Screenshots)
- Chụp ảnh màn hình Modal Sổ Đỏ mở ô 01 (Chợ nổi Cái Răng) và ô 39 (Tháp Bitexco Sài Gòn) hiển thị ảnh diorama rực rỡ.
- Chụp ảnh màn hình góc nhìn bàn cờ tại ô số 5 (Cảng HKQT Long Thành) hiển thị Standee thu nhỏ gọn gàng và cọc cờ cấp độ.
