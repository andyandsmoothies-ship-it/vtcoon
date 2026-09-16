# Kế Hoạch Cải Tiến Kỹ Thuật (Improvement Plan)
## Mã Phiếu: IMP-82
## Tiêu Đề: Trực Quan Hóa Quyền Sở Hữu Bất Động Sản (3-Layer Ownership) & Đồng Bộ 4 Quân Cờ Thượng Lưu (Die-Cast Metal Tokens)

### 1. Bối Cảnh & Vấn Đề
- Người chơi phản ánh cọc cờ đánh dấu quyền sở hữu trên sa bàn 3D quá nhỏ, khó nhận biết ô nào đã mua hay chưa mua, và không rõ miếng đất thuộc về ai.
- 4 quân cờ đang bị lệch 2 phong cách: 2 quân (Tháp, Ngựa) là tượng đúc kim loại nguyên khối cờ vua trên bệ tròn giật cấp, trong khi 2 quân (Xe, Du thuyền) là mô hình đồ chơi nhiều chi tiết vụn tả thực (ghế da, lốp cao su, kính nhựa, sàn gỗ teak).

### 2. Mục Tiêu
1. Đồng bộ 4 quân cờ sang chuẩn đúc kim loại nguyên khối PBR (Die-Cast Metal Tokens).
2. Xây dựng hệ thống nhận diện chủ quyền BĐS 3 lớp (3-Layer Ownership Readability).
3. Đảm bảo toàn bộ test suites và hợp đồng kiểm thử 100% PASS.

### 3. Thiết Kế Chi Tiết
- **Tầng 1 (Owner Pedestal Collar)**: `OwnerBaseTrim` dày 0.10m phủ màu chủ sở hữu kèm khung viền than `#0F172A`.
- **Tầng 2 (Mascot Crest Totem Pillar)**: Cột mốc trụ đồng `FlagPole` cao 0.45m, đính kèm `MascotCrestShield` (🏰, ⛵, 🚗, 🐎) và cờ phướn `FlagCloth` lớn.
- **Tầng 3 (Die-Cast Pawns)**: Cả 4 quân cờ đứng trên bệ tròn giật cấp đồng bộ, đúc kim loại PBR (roughness <= 0.2, metalness >= 0.8), gắn vòng men sứ `EnamelRing` màu người chơi.
