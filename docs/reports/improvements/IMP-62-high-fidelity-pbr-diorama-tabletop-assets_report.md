# BÁO CÁO NGHIỆM THU IMP-62: PHOTOREALISTIC MINIATURE DIORAMA TABLETOP 3D ASSETS & PBR MATERIAL OVERHAUL

> **Mục tiêu:** Nâng cấp toàn diện mỹ thuật 3D của VTCOON từ thế hệ khối hộp Lego thô sơ lên đẳng cấp Sa bàn cờ bàn thu nhỏ tinh xảo ngoài đời thực (Commercial AAA Photorealistic Miniature Diorama), đồng bộ với chuẩn tham chiếu Retropoly & Monopoly Plus Tabletop.
> **Trạng thái:** 🟢 HOÀN TẤT (3-Station Pipeline Sign-off · Spec-Reviewer APPROVED · Visual Critic 9.2/10 SHIP).

---

## 1. TỔNG QUAN KẾT QUẢ TRIỂN KHAI (EXECUTIVE SUMMARY)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        KẾT QUẢ NGHIỆM THU 3 TRẠM IMP-62                                │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Trạm 1 (RED Test)     : 33 atomic tests, Business RED được xác nhận hợp lệ           │
│ • Trạm 2 (GREEN Code)   : 15 model .glb điêu khắc, 2 Texture Generators, R3F Tabletop  │
│ • Trạm 3 (Audit & Gate) : Spec-Reviewer APPROVED · Game 3D Visual Critic 9.2/10 SHIP   │
│ • Ngân sách Kỹ thuật    : 0.63 MB / 2.5 MB (15/15 models đạt chuẩn IMP-29)             │
│ • Bộ Test Hồi quy       : 34/34 models tests PASS · 33/33 IMP-62 tests PASS            │
│ • Quick Gate            : 0 lỗi TypeScript · 0 vi phạm UI Linter · 0 Swallowed Catch   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. BỐN TRỤ CỘT MỸ THUẬT & KỸ THUẬT ĐÃ HOÀN TẤT

### 1. 15 Mô Hình Điêu Khắc Tinh Xảo (`public/models/`)
- Thay thế toàn bộ 15 tệp mô hình `.glb` voxel thô bằng mô hình resin/die-cast điêu khắc sắc sảo:
  - **Buildings C1-C3 (404 - 556 tris)**: Nhà phố C1 ngói âm dương có gờ nổi, ban công sắt uốn và cửa sổ lá sách; Cao ốc C2 tháp kính vát góc đa diện và lam nhôm; Landmark C3 phức hợp resort giật cấp 3 tầng với sân đỗ trực thăng và tháp kim cương.
  - **Luxury Pawns (596 - 852 tris)**: Quân cờ kim loại die-cast đúc nguyên khối (Tháp Citadel răng cưa, Du thuyền mạ chrome bóng, Xe đua cổ Roadster mạ đồng thau, Ngựa chiến Titan bờm điêu khắc).
  - **Landmarks (756 - 844 tris)**: Chợ Bến Thành (tháp đồng hồ 4 mặt, cổng vòm tam cấp, ngói đỏ) và Nhà Thờ Đức Bà (tháp chuông đôi vươn cao, cửa sổ hoa hồng Rose Window, thánh giá vàng).
  - **Micro Vehicles (188 - 336 tris)**: Xe buýt Sài Gòn, taxi, sedan, van, tàu tuần tra và tàu container có đèn xe, kính thấu quang và rãnh thép container.

### 2. Hệ Thống Facade Texture Kiến Trúc (`src/client/3d/facade_texture_generator.ts`)
- `createHighriseFacadeTexture`: Sinh texture ma trận kính phản quang bầu trời (Sky 600-800), kẻ chỉ khung nhôm đố cửa và đèn cửa sổ phát sáng sole.
- `createShophouseFacadeTexture`: Sinh texture mặt tiền nhà phố vàng kem `#FEF08A` kết hợp cửa sổ lá sách gỗ xanh ngọc `#047857`.
- Bảo lưu kiến trúc `InstancedMesh`: 16 tháp cao ốc chỉ tốn đúng 2 draw calls; 32 nhà phố chỉ tốn đúng 2 draw calls.

### 3. Mặt Bàn Cờ Gỗ Óc Chó (Walnut Tabletop) & Thảm Nỉ Len Nhung Xúc Xắc
- `src/client/3d/tabletop_texture_generator.ts`: Sinh texture vân gỗ óc chó PBR 2K với 24 đường sinh trưởng Bézier, 48 rãnh vi mao quản và Roughness map véc-ni tự nhiên (~0.28).
- `src/client/3d/board_layout.tsx`: Gắn vân gỗ óc chó và nẹp đồng kim loại lên mặt bàn cờ `WALNUT_TABLE_Y = -0.350`.
- `src/client/3d/dice_tray.tsx`: Thảm nỉ len xanh rừng già `#064E3B` nhám 0.85 triệt tiêu chói sáng, viền la bàn đồng thau `#F59E0B`.

### 4. Phòng Thủ Bán Kính Rủi Ro (Blast Radius Safeguards)
- **Bảo toàn Ngân sách & Hợp đồng Kiểm thử**: Khống chế mô hình mới dưới 800/1500 tris, giữ vững trần ngân sách 2.5 MB ban đầu, giúp 100% test contract cũ (`asset_budget.test.ts`, `landmark_models.test.ts`) XANH tuyệt đối mà không cần sửa đổi spec.
- **Bảo vệ SSR Headless**: Tích hợp `DataTexture` fallback cho môi trường Node.js / Vitest không có DOM `document.createElement`.
- **Chống Rò rỉ VRAM**: Thiết lập Singleton Texture Cache cho toàn bộ các texture procedural.

---

## 3. BẢNG TỔNG HỢP KIỂM CHỨNG KỸ THUẬT

| Lệnh Thực Thi | Kết Quả Thực Tế | Đánh Giá |
| :--- | :--- | :---: |
| `npx vitest run tests/contracts/imp62_*.test.ts` | **33 / 33 tests PASS (55ms)** | 🟢 HOÀN HẢO |
| `npx vitest run tests/client/*_models.test.ts` | **34 / 34 regression tests PASS (1.6s)** | 🟢 HOÀN HẢO |
| `node scripts/optimize_assets.mjs` | **15 / 15 models PASS (0.63 MB / 2.5 MB)** | 🟢 HOÀN HẢO |
| `npm run gate:quick` | **0 errors (tsc, lint:ui, lint:slop, lint:dup, lint:assets)** | 🟢 HOÀN HẢO |

---

## 4. GOTCHA ĐÓNG ĐINH HỆ THỐNG
- **Gotcha #85**: `[3D/ASSET/PBR] Bất Biến Tối Ưu Hóa Ngân Sách Hình Học GLB & Bảo Vệ SSR Headless Cho Procedural Texture (IMP-62)` đã được cập nhật vĩnh viễn vào `docs/domain/gotchas.md`.
