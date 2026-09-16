# KẾ HOẠCH CẢI TIẾN LIÊN TỤC: IMP-83 — QUÂN CỜ BẠC 3D HÌNH CON VẬT RANDOM & CỜ CHỦ QUYỀN 2.5D BILLBOARD

**Mã cải tiến**: IMP-83  
**Ngày lập**: 2026-09-16  
**Trạng thái**: APPROVED  
**Tác giả**: VTCOON Core Architecture Team  
**Yêu cầu gốc**:
> "thiết kế lại các quân cờ, tôi muốn quân cờ màu bạc và random quân theo hình 3d các con vật, cùng kích thước màu sắc, đồng thời thiết kế lại cờ luôn, cờ có thể không cần 3d vì cờ 3d hiện tại đang rất khó nhận diện, có thể 2.5d hoặc 2d miễn là dễ nhận biết"

---

## 1. BỐI CẢNH & PHÂN TÍCH

### 1.1 Vấn Đề Hiện Tại
1. **Quân cờ thiếu đồng bộ**: Trước đây gồm 2 công trình/xe và 2 con vật (Tháp Landmark, Du thuyền, Xe cổ, Ngựa chiến), phân tán màu sắc (Vàng, Bạc, Đồng đỏ, Xanh navy) và scale cồng kềnh lệch lạc (Xe scale Y=2.6, Tháp scale Y=1.0).
2. **Cờ chủ quyền 3D tĩnh khó nhận diện**: Cờ 3D dạng cọc phướn nhỏ khi nhìn ở các góc máy chéo hoặc góc nhìn thẳng từ trên xuống (top-down) bị biến thành một vạch mỏng, khó phân biệt ô đất thuộc quyền sở hữu của ai.

### 1.2 Giải Pháp Kiến Trúc
1. **Chuẩn hóa 4 Quân Cờ Bạc Đúc Kim Loại (Die-Cast Silver Pawns)**:
   - 4 con vật: 🐕 **Chó Corgi / Scottie**, 🐈 **Mèo Thần Tài Maneki-Neko**, 🐎 **Ngựa Chiến Phong Vân**, 🐘 **Voi Hoàng Gia Thịnh Vượng**.
   - Vật liệu PBR kim loại bạc đồng bộ: `#E2E8F0`, `metalness >= 0.95`, `roughness <= 0.12`.
   - Kích thước scale chuẩn hóa đồng bộ `[1.0, 1.0, 1.0]`.
   - Bệ tròn tiện giật cấp đồng bộ có vòng men sứ màu người chơi (`EnamelRing`).
2. **Cơ chế Phân Bổ Ngẫu Nhiên Xác Định (`assignRandomPlayerPawns`)**:
   - Phân bổ 4 slots [0, 1, 2, 3] không trùng lặp cho 2–4 người chơi trong phòng.
   - Thuật toán xác định tuyệt đối (deterministic) theo `roomCodeOrSeed` dựa trên FNV-1a hash và Fisher-Yates shuffle với Mulberry32 PRNG.
3. **Cờ Chủ Quyền 2.5D Billboard (`OwnershipBillboardPin`)**:
   - Sử dụng `<SafeBillboard follow={true}>` luôn tự động xoay trực diện 100% về phía camera người chơi ở mọi góc nhìn.
   - Cấu trúc 4 lớp tương phản cao: viền ngoài than `#0F172A`, viền trong vàng `#F59E0B`, nền màu chủ sở hữu, icon linh vật to rõ.
   - Bảo tồn nguyên vẹn cấu trúc cọc cờ `FlagPole` (cao 0.45m), cờ phướn `FlagCloth`, khiên `MascotCrestShield` và vòng đai cấp độ `TierIndicatorRings`.
4. **An toàn kiểm thử & SSR (`SafeBillboard`)**:
   - `SafeBillboard` tự động kiểm tra `typeof window === 'undefined'` để render thẻ thay thế an toàn khi render trong môi trường Node.js / SSR không có Canvas, loại bỏ 100% lỗi crash `useFrame`.

---

## 2. MA TRẬN 4 DIỆN MẠO HÀNH VI (UNIVERSAL 4-FACET BEHAVIORAL MATRIX)
- **Facet 1 (PBR Silver Animal Pawns Synchronization)**: 4 slots chuẩn `#E2E8F0`, metalness >= 0.9, roughness <= 0.15, icons 🐕 🐈 🐎 🐘, scale [1.0, 1.0, 1.0].
- **Facet 2 (Deterministic Random Pawn Allocation)**: `assignRandomPlayerPawns` không trùng lặp, xác định theo roomCode/seed.
- **Facet 3 (2.5D Billboard Ownership Pin & Totem Preservation)**: `<SafeBillboard follow={true}>`, viền than, viền vàng, màu người chơi, icon con vật, bảo tồn FlagPole, FlagCloth, MascotCrestShield.
- **Facet 4 (Error Defense & Fallback Boundary)**: Xử lý an toàn slotIndex ngoài biên (<0, >3, NaN, Infinity), clamping level, undefined ownerColor.

---

## 3. TIÊU CHUẨN HOÀN THÀNH (DEFINITION OF DONE)
- 100% test suites PASS (190/190 test suites, 3,282 tests).
- Container Docker `vtcoon-vtcoon-1` healthy, HTTP 200 OK.
- Thẩm định Trạm 3 đạt phê duyệt độc lập từ `spec-reviewer`, `code-reviewer`, `game-3d-visual-critic`.
