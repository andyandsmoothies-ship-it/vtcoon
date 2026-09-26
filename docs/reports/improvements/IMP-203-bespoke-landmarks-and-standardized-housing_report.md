# [REPORT] IMP-203: Chuẩn Hóa Nhà Cấp 1-2 & Kiến Trúc Tòa Nhà Landmark Độc Bản Cấp 3 Cho 22 Ô Đất

## 1. THÔNG TIN TỔNG QUAN
- **Mã Ticket**: IMP-203
- **Tiêu Đề**: Chuẩn Hóa Nhà Cấp 1-2 & Kiến Trúc Tòa Nhà Landmark Độc Bản Cấp 3 Cho 22 Ô Đất
- **Phân Hạng**: Tier 2 (Full Rigor) — Đã hoàn thành 3 Trạm (Station 1 RED $\rightarrow$ Station 2 GREEN $\rightarrow$ Station 2.5 Scout $\rightarrow$ Station 3 Independent Review).
- **Trạng Thái**: COMPLETE (HOÀN TẤT 100%)

---

## 2. NGUYÊN NHÂN CỐT LÕI & GIẢI PHÁP
- **Bối cảnh & Vấn đề**:
  1. Mô hình Cấp 1 và Cấp 2 trước đây bị phân mảnh theo từng typology vùng miền gây khó khăn trong nhận diện cấp độ đô thị tổng thể.
  2. Cấp 3 (tối thượng) dùng lại mô hình procedural chung chung, thiếu bản sắc độc bản của 22 địa danh Việt Nam trên bàn cờ.
  3. Cần đảm bảo chân đế tiêu chuẩn 0.55m x 0.55m không va chạm hình học với Cột Cờ chủ quyền (`X=0.62m`, clearance >= 0.15m) và Khách Sạn Đồ Chơi trên dải màu (`Z=-0.80m`, clearance >= 0.25m).
- **Giải pháp triển khai**:
  - **Chuẩn Hóa Nhà Cấp 1-2**:
    * Level 1: `/models/buildings/building_c1.glb` dùng chung cho toàn bộ 22 ô đất.
    * Level 2: `/models/buildings/building_c2.glb` dùng chung cho toàn bộ 22 ô đất.
  - **22 Tòa Nhà Landmark Độc Bản Cấp 3**:
    * Định tuyến `/models/landmarks/bld_c3_cell_${cellIndex}.glb` cho 22 ô đất mua được.
    * Tạo [`src/client/3d/landmark_registry.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/landmark_registry.ts) làm SSOT cho 22 địa danh văn hóa/kinh tế (Bitexco Q1, Keangnam Cầu Giấy, Lầu Ngũ Phụng Huế, Ga Đà Lạt, Dinh Bình Thủy...).
    * Tích hợp GLB generator trong [`scripts/generate_high_fidelity_models.mjs`](file:///c:/Users/HP/Documents/GitHub/vtcoon/scripts/generate_high_fidelity_models.mjs) sinh đủ 22 tệp GLB tối ưu (350–750 tris).
  - **Bộ 3 Mỏ Neo Nhận Diện Bất Biến (3 Persistent Anchors)**:
    1. *Đai bệ chân đế hoàng kim:* `RoundedBox [0.57, 0.02, 0.57]` mạ vàng hoàng kim `#F59E0B` (metalness 0.95, roughness 0.15).
    2. *Vương miện bảo ngọc tự xoay:* `crownRef` tại `Y=1.05m` với vật liệu `#F59E0B` phát quang emissive ban đêm/hoàng hôn.
    3. *Khách sạn đồ chơi đỏ Ruby:* `ToyHotelMesh` đỏ `#DC2626` trên dải màu ô cờ nhận diện từ camera chim bay.
  - **Kiến Trúc Fallback Không Crash & Bóc Tách Anti-Slop**:
    * Bóc tách [`src/client/3d/bespoke_landmark_fallback.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/bespoke_landmark_fallback.tsx) (244 LOC) hỗ trợ 4 phong cách procedural và cờ emissive ngày/hoàng hôn/đêm.
    * Giảm LOC của [`src/client/3d/procedural_building.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/procedural_building.tsx) từ 402 dòng xuống 296 dòng (nằm dưới trần nghiêm ngặt 300 LOC).

---

## 3. FILE MUTATION & LOC COMPLIANCE (ĐĨA VẬT LÝ)
| File | Hành Động | LOC Thực Tế | Ngân Sách Trần | Kết Quả |
| :--- | :---: | :---: | :---: | :---: |
| `src/client/3d/building_typology.ts` | SỬA ĐỔI | 46 | <= 400 | ĐẠT |
| `src/client/3d/landmark_registry.ts` | TẠO MỚI | 174 | <= 400 | ĐẠT |
| `src/client/3d/bespoke_landmark_fallback.tsx` | TẠO MỚI | 244 | <= 500 | ĐẠT |
| `src/client/3d/procedural_building.tsx` | TÁCH SUBMODULE | 296 | <= 300 | ĐẠT |
| `src/client/ui/action_dock.tsx` | SỬA ĐỔI | 382 | <= 400 | ĐẠT |
| `src/client/network/apply_delta_players.ts` | TỐI ƯU HÓA | 267 | <= 270 | ĐẠT |
| `src/client/ui/modals/title_deed_action_footer.tsx` | SỬA ĐỔI | 212 | <= 300 | ĐẠT |
| `scripts/generate_high_fidelity_models.mjs` | MỞ RỘNG | 2642 | Tool Generator | ĐẠT (22 GLB) |
| `tests/contracts/imp203_bespoke_landmarks_and_housing.test.ts` | TẠO MỚI | 525 | <= 600 | ĐẠT (55 tests) |
| `tests/contracts/imp65_building_scale_corner_clearance_and_regional_typologies.test.ts` | TIẾN HÓA SPEC | 237 | <= 300 | ĐẠT (98 tests) |

---

## 4. KẾT QUẢ KIỂM THỬ & CHỨNG NHẬN TRẠM (STATION AUDIT)
- **Station 1 (RED Contract Test)**: `qa-tester` tạo 55 atomic tests trên 5 facet, chứng minh thất bại baseline (54 failed | 1 passed, Exit code 1).
- **Station 2 (GREEN Implementation)**: `implementer` sinh 22 GLB và viết mã nguồn trong `src/client/3d/`, lật thành công 55/55 tests PASS.
- **Station 2.5 (Sweeping Scout Audit)**: `scout` quét sạch 5 archetypes khuyết tật trên 5 file vật lý $\rightarrow$ remediated 4 findings $\rightarrow$ PASS.
- **Station 3 (Independent Review)**:
  * `spec-reviewer`: **SPEC_PASS** (100% đối chiếu đặc tả: URL models C1-C3, registry 22 ô đất, 3 mỏ neo, fallback, evidence snapshot).
  * `game-3d-visual-critic`: **VISUAL_PASS** (Đạt chuẩn mỹ thuật sa bàn thương mại diorama ngoài trời: Zero-blank-material PBR, spatial clearance an toàn, bộ 3 mỏ neo uy quyền).
- **Toàn bộ hệ thống**:
  * Vitest Suite: **345/345 test files PASS (6.908 tests)**.
  * UI Linter: **0 anti-patterns across 195 files**.
  * TypeScript compiler (`tsc --noEmit`): **0 errors, 0 warnings**.
  * Automated Evidence Snapshot: `.agents/evidence/imp203_snapshot.json` (`executed: true`).
