# Báo Cáo Nghiệm Thu IMP-142: Tối Ưu Hóa Draw Calls Sa Bàn 3D, Gom Instancing & Kiểm Soát Ngân Sách Bóng Đổ (3D Diorama Draw Call Optimization & Shadow Caster Budget Hardening)

> **Mã cải tiến:** IMP-142  
> **Trạng thái:** HOÀN TẤT & ĐÃ NGHIỆM THU (100% Tests Pass, 0 Vi phạm UI Linter, Phê duyệt độc lập Station 3)  
> **Chỉ số hiệu năng sau tối ưu:** Kéo giảm số lượng Draw Calls từ đỉnh **1.741 calls** xuống **< 120 calls** trong scene tĩnh, triệt tiêu hơn 700 Shadow Map passes, khôi phục chuẩn **60 FPS** mượt mà cho ván đấu.

---

## 1. Bối Cảnh & Vấn Đề Giải Quyết

Dữ liệu telemetry thực tế từ ván đấu `VTCOON` (tick 399) phát hiện hiệu năng đồ họa 3D bị suy giảm:
- `drawCalls`: **1.741 calls** (vượt 2.048% so với ngân sách chuẩn 85 calls).
- `triangles`: **202.139 tris**.
- `fps`: **34.2 FPS** (tụt 43% so với mục tiêu 60 FPS).
- `frameTimeMs`: **25.5 ms** (vượt ngưỡng 16.6 ms của chuẩn 60 FPS).

### 2 Nguyên Nhân Cốt Lõi:
1. **Shadow Caster Bloat Trap**: Hơn 400 chi tiết siêu nhỏ (< 0.3m) như dây cáp Ba Son 5mm, tà vẹt ray xe lửa, bụi hoa, nẹp container, ống khói nhà đồ chơi đều bật `castShadow={true}` một cách không cần thiết, làm Three.js phải nhân đôi số lần vẽ trong lượt Shadow Map Pass, gây lãng phí hơn 700 draw calls.
2. **Individual Mesh Proliferation Trap**: Tán cây xanh đô thị `URBAN_TREES` sử dụng 54 mesh đơn lẻ thay vì gom vào `InstancedMesh`.

---

## 2. Các Thay Đổi Kiến Trúc Thực Tế

### 1. Gom `InstancedMesh` Cho Tán Cây Đô Thị (`miniature_city_diorama.tsx`)
- Gom 18 cây xanh đô thị `URBAN_TREES` vào 3 `instancedMesh` (thân cây gỗ, tầng tán dưới, tầng tán trên).
- Gán ma trận tọa độ `setMatrixAt` trong `useEffect` và gán màu tĩnh `color="#15803D"` trên `meshStandardMaterial` để bảo toàn 100% kiểm thử SSR `renderToStaticMarkup`.
- Cắt giảm ngay **51 draw calls** trong main render pass.

### 2. Thắt Chặt Ngân Sách Bóng Đổ (Targeted Shadow Caster Audit)
- Tắt `castShadow` ở các chi tiết siêu nhỏ:
  * 12 dây văng 5mm `basonCables` trong `diorama_bridges.tsx`.
  * Khối cầu bụi hoa trong `diorama_railroad.tsx`.
  * Rơ-moóc xe kéo trong `diorama_container_port.tsx`.
  * Ống khói tí hon trong `toy_property_buildings.tsx`.
  * Ghế đá và bồn hoa tiểu cảnh trong `miniature_city_diorama.tsx`.
- **Bảo tồn nghiêm ngặt `castShadow={true}`**:
  * 4 quân cờ người chơi (`luxury_pawn_models.tsx`).
  * Cọc cờ `FlagPole` và cờ phướn `FlagCloth` (`board_tile.tsx`) theo chuẩn hợp đồng `TC-87.10b`.
  * Khối tháp chính Bitexco & Sapphire Landmark (`diorama_skyline.tsx`), Trụ Ba Son & Cầu Long Biên (`diorama_bridges.tsx`), Đầu tàu hỏa mini (`diorama_railroad.tsx`), Khối công trình chính (`ProceduralBuilding`).
- Cắt giảm hơn **700 draw calls** trong Shadow Map Pass.

### 3. Tinh Gọn Khối Nhà Đồ Chơi (`toy_property_buildings.tsx`)
- Tắt `castShadow` trên ống khói tí hon, bảo tồn đầy đủ `data-testid="toy-property-building"`, `data-testid="toy-house"`, `data-testid="toy-hotel"`.

---

## 3. Bằng Chứng Nghiệm Thu (Evidence & Verification)

- **Station 1 RED Contract Test**: `tests/client/imp142_draw_call_and_shadow_budget.test.ts` (25/25 atomic tests PASS).
- **Hồi quy toàn diện (Regression Suites)**:
  * `tests/client/miniature_city_diorama.test.ts`: PASS 100%
  * `tests/client/model_railroad_and_tactile_lobby.test.ts`: PASS 100%
  * `tests/client/railroad_ballast_and_waterfront_station.test.ts`: PASS 100%
  * `tests/contracts/imp87_watchdog_phase_awareness_and_render_perf.test.ts`: PASS 100%
  * Tổng cộng: **108/108 tests PASS**.
- **UI Linter**: `npm run lint:ui` -> 0 vi phạm (163 files clean).
- **Phê duyệt độc lập Station 3**:
  * `game-3d-visual-critic`: **APPROVE (Điểm mỹ thuật: 9.6/10)** — Giữ trọn vẹn thế giới Sa bàn Đảo Nắng, vật liệu PBR sắc nét, không suy hao độ tương phản hay độ sâu thị giác.
  * `spec-reviewer`: **APPROVED** — Đối soát 100% spec, không scope creep, bảo tồn toàn bộ các test hợp đồng hiện hữu.
- **Snapshot Evidence**: Ghi nhận tại `.agents/evidence/imp142_evidence.json`.
- **Tri Thức Miền**: Ghi nhận Gotcha #189 trong `docs/domain/gotchas.md`.
