# [REPORT] IMP-221: Living Diorama Dynamics (Bước 3)

## 1. THÔNG TIN TỔNG QUAN
- **Mã Ticket**: IMP-221
- **Tiêu Đề**: Living Diorama Dynamics: Harbor Watercraft, Perching Birds & Lighthouse Sweep (Động Lực Học Sa Bàn: Du Thuyền Bến Cảng, Đàn Chim Hải Âu & Ngọn Hải Đăng Quét Sáng).
- **Phân Hạng**: **Tier 2 (Full Rigor)** — Living Diorama Simulation, Micro-FSM Animation, 3D Spatial Continuity ($C^1$), Time-of-Day Lighting Integration.
- **Trạng Thái**: ✅ **COMPLETE** (HOÀN TẤT 100% QUY TRÌNH 3 TRẠM).
- **Căn Cứ Kế Hoạch & Bằng Chứng**:
  - Kế hoạch phê duyệt v3: [`docs/plans/improvements/IMP-221-living-diorama-dynamics_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-221-living-diorama-dynamics_plan.md)
  - Kiểm toán đối kháng kế hoạch: [`.agents/audit/PLAN_AUDIT_IMP221.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP221.md)
  - Bằng chứng thực thi: [`.agents/evidence/imp221_execution.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp221_execution.json) (`executed: true`)
- **Hội Đồng Độc Lập Trạm 3**:
  - `spec-reviewer`: **APPROVED** (100% đối soát tam giác vật lý, triệt tiêu lỗi teleport snap bằng `landingFromRef`, tách biệt tương tác click chim/còi hải đăng).
  - `game-3d-visual-critic`: **APPROVED (9.2 / 10 — disposition: ship)** (Chuyển động nhấp nhô du thuyền lệch pha 1.6 rad tự nhiên, tia sáng hải đăng ban đêm quét $360^\circ$ huyền ảo, đàn chim sống động).
  - `scout` (Trạm 2.5): **PASS 100%** (Zero dirty cast, zero React re-render 60 FPS qua `useRef`, zero `castShadow`).

---

## 2. KIẾN TRÚC & BA THỰC THỂ SỐNG ĐỘNG

### 2.1. Động Lực Học Du Thuyền Bến Cảng (`DioramaMarina` & `DioramaHarborCruiser`)
- **Cặp du thuyền neo đậu**: Bobbing nhấp nhô pitch & roll lệch pha $\Delta\phi = 1.6$ rad trên mặt nước ngọc bích.
- **Thuyền tuần du bến Bạch Đằng**: Lướt theo quỹ đạo elip ven vịnh đảo, góc quay yaw tiếp tuyến mượt mà, vệt bọt nước rẽ sóng chữ V co giãn điều hòa $\pm 12\%$.

### 2.2. Micro-FSM Đàn Hải Âu Đậu Cọc Bến Tàu (`DioramaPerchingBirds`)
- FSM 4 trạng thái: `PERCHED` $\rightarrow$ `TAKE_OFF` $\rightarrow$ `CIRCLING` $\rightarrow$ `LANDING`.
- **Khử lỗi giật hình (Teleport Elimination)**: Lưu vị trí cuối cùng qua `landingFromRef` và `calculateCirclingExitPosition`, đảm bảo tính liên tục $C^1$ khi hạ cánh.
- **Zero React Re-render 60 FPS**: Quản lý toàn bộ state qua `useRef`, cập nhật trực tiếp Three.js Object3D trong `useSafeFrame`.

### 2.3. Ngọn Hải Đăng Cổ Điển Quét Tia Sáng $360^\circ$ (`DioramaMarina`)
- Cụm đèn đặt chính xác tại tâm thấu kính Fresnel $y = 0.72$.
- Thích ứng ánh sáng: Ban ngày ẩn nón sáng; Hoàng hôn ánh vàng hổ phách 0.8; Ban đêm quét tia sáng 2.2 rực rỡ với vận tốc góc $1.2$ rad/s.
- Tương tác âm thanh: Còi tàu khi click ngọn hải đăng có `e.stopPropagation()`.

---

## 3. MA TRẬN KIỂM THỬ HỢP ĐỒNG (16/16 TESTS PASS)
Tệp kiểm thử [`tests/client/living_diorama_dynamics.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/living_diorama_dynamics.test.ts) đạt 16/16 tests PASS 100% (Phủ trọn 5 Facets). Bảo toàn 100% các suite kiểm thử di sản (`miniature_city_diorama`, `imp107_streamlined_tabletop_diorama`).

---

## 4. BẤT BIẾN MIỀN GHI NHẬN (INVARIANT 14)
Ghi nhận tại `docs/domain/gotchas.md`: **Living Diorama Micro-FSM & 3D Spatial Continuity**.
