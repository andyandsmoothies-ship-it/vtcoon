# Báo Cáo Nghiệm Thu Cải Tiến Kỹ Thuật (Improvement Report)
## Mã Phiếu: IMP-82
## Tiêu Đề: Trực Quan Hóa Quyền Sở Hữu Bất Động Sản (3-Layer Ownership) & Đồng Bộ 4 Quân Cờ Thượng Lưu (Die-Cast Metal Tokens)

### 1. Tóm Tắt Kết Quả
- Đã giải quyết triệt để 3 điểm nghẽn thị giác về nhận diện chủ quyền trên sa bàn 3D:
  1. **Nhìn vào biết ngay ô đã mua hay chưa mua (Binary State)**: `OwnerBaseTrim` dày dặn `0.10m` mang màu nhận diện người chơi, bo viền than `#0F172A` đanh thép, nổi bật từ góc máy telephoto kiến trúc. Ô chưa mua giữ nguyên chân đế đá ngà trung tính `#EDE5D8`.
  2. **Nhìn vào biết ngay ô đất của ai (Owner Legibility)**: Cột mốc trụ đồng `FlagPole` cao `0.45m`, gắn Huy Hiệu Khiên Tròn 3D (`MascotCrestShield`) mạ vàng chạm nổi icon linh vật đại diện (🏰, ⛵, 🚗, 🐎) khớp 100% với PlayerCard 2D, kèm cờ phướn `FlagCloth` lớn.
  3. **Đồng bộ 4 quân cờ cùng 1 ngôn ngữ (Die-Cast Metal Tokens)**: Cả 4 quân cờ Tháp, Du Thuyền, Xe Cổ, Ngựa Chiến đều đúc kim loại nguyên khối PBR sang trọng (metalness >= 0.8, roughness <= 0.2) trên cùng một khuôn bệ tròn tiện giật cấp tiêu chuẩn, gắn vòng men sứ `EnamelRing` màu thương hiệu cá nhân của người chơi.
- Đã xuất bản lại 4 tệp mô hình binary glTF `public/models/pawns/*.glb` đạt chuẩn ngân sách kỹ thuật (50KB–64KB, < 150KB và <= 852 tris).

### 2. Dẫn Chứng Đĩa Vật Lý & Kiểm Thử
- **187/187 test suites PASS 100% (3,208 tests passed)**.
- `tests/contracts/imp82_diecast_pawns_and_ownership_totem.test.ts`: 43/43 tests PASS.
- `tests/contracts/property_ownership_marker_contract.test.ts`: 37/37 tests PASS.
- `tests/client/luxury_pawn_models.test.ts`: 4/4 tests PASS.
- `tests/contracts/imp66_pawn_scale_and_log_scroll.test.ts`: 7/7 tests PASS.
- `npx tsc --noEmit`: 0 lỗi.
- `npm run lint:ui`: 0 violations trên 135 files.
- Docker container `vtcoon-vtcoon-1`: Rebuilt, healthy, `HTTP/1.1 200 OK`.
- **Trạm 3 Sign-Off**: `spec-reviewer` APPROVED (100% PASS), `code-reviewer` APPROVED (100% PASS).
- **Gotcha ghi nhận**: Gotcha #110 trong `docs/domain/gotchas.md`.
