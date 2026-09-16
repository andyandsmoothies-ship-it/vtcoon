# BÁO CÁO CẢI TIẾN LIÊN TỤC: IMP-83 — QUÂN CỜ BẠC 3D HÌNH CON VẬT RANDOM & CỜ CHỦ QUYỀN 2.5D BILLBOARD

**Mã cải tiến**: IMP-83  
**Ngày hoàn thành**: 2026-09-16  
**Trạng thái**: HOÀN TẤT (SHIPPED)  
**Tác giả**: VTCOON Core Architecture Team  
**Kế hoạch**: [`docs/plans/improvements/IMP-83-silver_animal_pawns_and_billboard_flag_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-83-silver_animal_pawns_and_billboard_flag_plan.md)  
**Tệp kiểm thử hợp đồng**: [`tests/contracts/imp83_silver_animal_pawns_and_billboard_flag.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp83_silver_animal_pawns_and_billboard_flag.test.ts)

---

## 1. TỔNG QUAN KẾT QUẢ THỰC HIỆN

### 1.1 Đồng Bộ 4 Quân Cờ Bạc Đúc Kim Loại (Die-Cast Silver Pawns)
- Chuẩn hóa 4 linh vật con vật đúc bạc kim loại:
  - Slot 0: 🐕 **Tượng Chó Bạc Phú Quý** (`pawn_dog.glb`: 46.2KB, 572 tris)
  - Slot 1: 🐈 **Tượng Mèo Bạc May Mắn** (`pawn_cat.glb`: 45.8KB, 824 tris)
  - Slot 2: 🐎 **Tượng Ngựa Bạc Phong Vân** (`pawn_horse.glb`: 49.7KB, 696 tris)
  - Slot 3: 🐘 **Tượng Voi Bạc Thịnh Vượng** (`pawn_elephant.glb`: 53.8KB, 812 tris)
- Quy chuẩn vật liệu PBR đồng bộ: màu bạc ánh kim `#E2E8F0`, `metalness: 0.95`, `roughness: 0.12`.
- Quy chuẩn kích thước đồng nhất: `scale: [1.0, 1.0, 1.0]`.
- Bệ tròn tiện giật cấp mạ kim loại có vòng men sứ màu người chơi `EnamelRing` (`name="EnamelRing"`).
- Hệ thống thủ tục dự phòng 3D procedural zero-crash (`DogPawnFallback`, `CatPawnFallback`, `WarhorsePawnFallback`, `ElephantPawnFallback`) sẵn sàng trong `luxury_pawn_fallbacks.tsx`.

### 1.2 Phân Bổ Ngẫu Nhiên Quân Cờ Xác Định (`assignRandomPlayerPawns`)
- Triển khai thuật toán xáo trộn Fisher-Yates kết hợp Mulberry32 PRNG có seed từ chuỗi FNV-1a hash của `roomCodeOrSeed`.
- Phân bổ 4 slots [0, 1, 2, 3] ngẫu nhiên không trùng lặp cho 2–4 người chơi trong phòng.
- Đảm bảo tính xác định tuyệt đối (deterministic) khi cùng mã phòng.

### 1.3 Cờ Chủ Quyền 2.5D Billboard (`OwnershipBillboardPin`)
- Chuyển đổi cờ chủ quyền sang **Huy Hiệu Ghim 2.5D Billboard** (`<SafeBillboard follow={true}>`) luôn tự động xoay 100% trực diện camera người chơi ở mọi góc nhìn (Isometric, Top-down, Zoom-in).
- Cấu trúc 4 lớp tương phản cao:
  - Viền ngoài than đanh thép `#0F172A` (0.26m)
  - Viền trong kim loại vàng `#F59E0B` (0.23m)
  - Nền mang màu người chơi (0.20m)
  - Icon linh vật con vật to rõ (0.15m)
- Bảo tồn 100% các node hợp đồng cũ: `FlagPole` (cao 0.45m), cờ phướn `FlagCloth`, khiên `MascotCrestShield` và vòng đai cấp độ `TierIndicatorRings`.
- Triệt tiêu lỗi crash `useFrame` trong môi trường SSR/Node test bằng component `SafeBillboard` an toàn.

---

## 2. KẾT QUẢ KIỂM TOÁN 3 TRẠM (3-STATION PIPELINE AUDIT)

### Trạm 1: RED Contract Test
- Tệp: `tests/contracts/imp83_silver_animal_pawns_and_billboard_flag.test.ts` (412 LOC, 42 atomic tests).
- Đã chứng minh trạng thái RED thực sự: 30 failed | 12 passed trước khi viết code.

### Trạm 2: GREEN Implementation
- Hoàn thành toàn bộ 42/42 tests thành GREEN.
- Cập nhật đồng bộ các bài test liên đới (`imp66`, `imp82`, `luxury_pawn_models`, `penthouse_lobby_scene`).
- Kết quả toàn bộ test suite: **190/190 test suites PASS, 3,282 tests PASS (100%)**.
- TypeScript strict compilation: `npx tsc --noEmit` -> 0 lỗi.
- UI Linter: `npm run lint:ui` -> 0 vi phạm trên 135 tệp.

### Trạm 3: Thẩm Định Độc Lập
- **Game 3D Visual Critic**: Phán quyết **SHIP**, điểm số **9.2 / 10** (chuẩn AAA Tabletop Benchmark).
- **Spec Reviewer**: Phán quyết **APPROVED** (100% khớp đặc tả, zero scope drift).
- **Code Reviewer**: Phán quyết **APPROVED** (file LOC, complexity, zero dirty casts, SafeBillboard isolation đạt chuẩn).

---

## 3. TÀI NGUYÊN & DEPLOYMENT
- Docker container `vtcoon-vtcoon-1` đã được rebuild và kích hoạt: `Up (healthy)`.
- Các mô hình 3D GLB nạp qua HTTP port 3000: `HTTP 200 OK` (kích thước 45–55KB, < 1,200 tris).
- Ghi nhận Gotcha #113 vào [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md).
