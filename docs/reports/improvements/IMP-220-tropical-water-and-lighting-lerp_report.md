# [REPORT] IMP-220: Tropical Island Water Shader & Atmospheric Lighting Lerp (Bước 2)

## 1. THÔNG TIN TỔNG QUAN
- **Mã Ticket**: IMP-220
- **Tiêu Đề**: Tropical Island Water Shader & Atmospheric Lighting Lerp (Shader Mặt Nước Đảo Nhiệt Đới & Nội Suy Ánh Sáng Khí Quyển).
- **Phân Hạng**: **Tier 2 (Full Rigor)** — GLSL Custom ShaderMaterial, Gerstner Wave GPU Displacement, Fresnel Reflection, Depth Stack Optics.
- **Trạng Thái**: ✅ **COMPLETE** (HOÀN TẤT 100% QUY TRÌNH 3 TRẠM).
- **Căn Cứ Kế Hoạch & Bằng Chứng**:
  - Kế hoạch phê duyệt v2: [`docs/plans/improvements/IMP-220-tropical-water-and-lighting-lerp_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-220-tropical-water-and-lighting-lerp_plan.md)
  - Bằng chứng thực thi: [`.agents/evidence/imp220_execution.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp220_execution.json) (`executed: true`)
- **Hội Đồng Độc Lập Trạm 3**:
  - `spec-reviewer`: **APPROVED** (100% đối soát tam giác vật lý, cấu trúc Depth Stack 5 tầng và biên độ sóng toán học).
  - `game-3d-visual-critic`: **APPROVED (8.8 / 10 — disposition: ship)** (Chất lượng nước biển ngọc bích vượt trội, Fresnel Schlick phản chiếu bầu trời chân thực).
  - `scout` (Trạm 2.5): **PASS 100%** (Zero dirty cast, zero GC allocation, dọn dẹp Three.js tài nguyên an toàn khi unmount).

---

## 2. KIẾN TRÚC & GIẢI PHÁP ĐỒ HỌA

### 2.1. Cấu Trúc Depth Stack 5 Tầng Quang Học (Triệt Tiêu 100% Z-Fighting)
- **Tầng 1 (Abyss Box)**: $Y = -0.420$ `#0C4A6E` — Đáy biển vực thẳm sâu thẳm.
- **Tầng 2 (Mid Ocean Plane)**: $Y = -0.310$ `#0369A1` — Tầng nước sâu trung gian.
- **Tầng 3 (TropicalWater Shader)**: $Y = -0.300$ — Lưới mặt nước chính tích hợp GLSL custom shader, sóng Gerstner GPU biên độ $\pm 0.052$.
- **Tầng 4 (Shallow Jade Buffer)**: $Y = -0.298$ `#06B6D4` — Dải nước nông ngọc bích ôm chân bàn cờ.
- **Tầng 5 (Macro Shoreline Foam)**: $Y = -0.292$ `#FFFFFF` — Bọt sóng ven bờ trắng xóa.

### 2.2. GLSL Water Shader & Thích Ứng Ánh Sáng
- **Fresnel Schlick**: $\text{pow}(1.0 - \max(\text{dot}(v, n), 0.0), 3.5)$ mô phỏng góc nhìn thẳng thấy đáy ngọc bích trong veo, góc nghiêng phản chiếu bầu trời và specular glint ánh nắng.
- **Bảng màu nước theo pha**: Day (shallow `#06B6D4`, deep `#0284C7`), Sunset (shallow `#F59E0B`, deep `#C2410C`), Night (shallow `#0284C7`, deep `#0B192C`).
- **Nội suy Zero-Alloc**: Tái sử dụng Color buffer trong render loop, không cấp phát rác GC.

---

## 3. MA TRẬN KIỂM THỬ HỢP ĐỒNG (16/16 TESTS PASS)
Tệp kiểm thử [`tests/client/tropical_water_and_lighting.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/tropical_water_and_lighting.test.ts) đạt 16/16 tests PASS 100% (Phủ trọn 5 Facets). Bảo toàn 100% các suite kiểm thử di sản (`coastal_island_environment`, `imp107_streamlined_tabletop_diorama`, `imp39_visual_crispness_and_lighting`).

---

## 4. BẤT BIẾN MIỀN GHI NHẬN (GOTCHA #13)
Ghi nhận tại `docs/domain/gotchas.md`: **5-Layer Ocean Depth Stack & Zero-Alloc Shader Uniforms**.
