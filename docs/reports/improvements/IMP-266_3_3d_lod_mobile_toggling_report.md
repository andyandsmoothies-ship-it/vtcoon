# BÁO CÁO NGHIỆM THU MICRO-SLICE: IMP-266.3
# BẬT TẮT LOD ĐỒ HỌA 3D TRÊN THIẾT BỊ DI ĐỘNG & LÀM SẠCH NGÂN SÁCH HIỆU NĂNG

> **Mã Lát Cắt:** IMP-266.3 (Micro-Slice 3 thuộc Epic IMP-266)  
> **Tiêu đề:** 3D LOD Mobile Toggling & Perf Budget Cleanliness  
> **Phân loại:** Tier 2 Micro-Slice (Lean Plan Specification, Delta <= 50 LOC, Single Subsystem)  
> **Phân hệ mục tiêu:** `client-3d` (3D Environment & Engine Subsystems)  
> **Trạng thái:** **HOÀN THÀNH - SẴN SÀNG TÍCH HỢP (PASS 4 TRẠM KHÉP KÍN)**  
> **Ngày thực hiện:** 2026-10-05  

---

### 1. BẢNG ĐỐI SOÁT TRACEABILITY & FLOW TAXONOMY

| Mã Bài Test | Phân Loại Flow | Mục Tiêu Kiểm Chứng Hợp Đồng | Trạng Thái Trạm 1 | Trạng Thái Trạm 2 |
| :--- | :---: | :--- | :---: | :---: |
| **TC-266.3.01** | `[UC-IMP266.3/MSS]` | `CoastalSeagulls` trả về `null` khi `isMobile: true` (unmount toàn bộ 35 meshes hải âu trên mobile, `captureTree` trả về `null`) | 🔴 RED (expected `<group>` to be null) | 🟢 GREEN (Passed) |
| **TC-266.3.02** | `[UC-IMP266.3/MSS]` | `CoastalSeagulls` render đầy đủ đàn hải âu 5 con khi `isMobile: false` trên desktop | 🔴 RED (Failed assertions) | 🟢 GREEN (Passed) |
| **TC-266.3.03** | `[UC-IMP266.3/MSS]` | `CoastalPatrolBoat` & `DioramaHarborCruiser` ẩn hoàn toàn bọt sóng rẽ nước khi `isMobile: true` trên mobile | 🔴 RED (expected 2 to be +0) | 🟢 GREEN (Passed) |
| **TC-266.3.04** | `[UC-IMP266.3/MSS]` | `CoastalPatrolBoat` & `DioramaHarborCruiser` render đầy đủ bọt sóng rẽ nước khi `isMobile: false` trên desktop | 🔴 RED (Failed assertions) | 🟢 GREEN (Passed) |
| **TC-266.3.05** | `[UC-IMP266.3/MSS]` | `perfBudget.getBudgetReport` đọc `degradedDurationMs` từ `deviceContext` và giữ nguyên DPR 1.5 khi chưa đủ 1500ms | 🔴 RED (expected 1.25 to be 1.5) | 🟢 GREEN (Passed) |
| **TC-266.3.06** | `[UC-IMP266.3/A1]` | `perfBudget.getBudgetReport` mặc định thời lượng suy giảm bằng 0 khi không truyền `deviceContext` | 🔴 RED (expected 1.25 to be 1.5) | 🟢 GREEN (Passed) |
| **TC-266.3.07** | `[UC-IMP266.3/A2]` | `perfBudget.calculateAdaptiveDpr` kích hoạt STEP_DOWN hạ DPR khi thời lượng suy giảm đạt ngưỡng 1500ms | 🔴 RED (Failed evaluation) | 🟢 GREEN (Passed) |
| **TC-266.3.08** | `[UC-IMP266.3/A3]` | `CoastalIslandEnvironment` truyền đồng bộ prop `isMobile` xuống cả `CoastalSeagulls` và `CoastalPatrolBoat` | 🔴 RED (Failed prop matching) | 🟢 GREEN (Passed) |

---

### 2. BẢNG ĐÁNH GIÁ TIÊU CHÍ NGHIỆM THU (DEFINITION OF DONE)

| Tiêu Chí DoD | Rào Chắn / Yêu Cầu Cơ Học | Bằng Chứng Vật Lý Thực Tế | Kết Quả |
| :--- | :--- | :--- | :---: |
| **DoD #1: Flow Taxonomy** | 100% ca test mang nhãn `[UC-.../MSS]` hoặc `[UC-.../A#]` | 8 bài test mang chuẩn Flow Taxonomy (5 MSS + 3 Alternate flows) | ✔️ PASS |
| **DoD #2: Dynamic 3D LOD Toggling** | Unmount hoàn toàn chim hải âu và ẩn bọt sóng thuyền (`CoastalPatrolBoat` + `DioramaHarborCruiser`) trên mobile | 35 meshes hải âu và 3 planes bọt sóng (`CoastalPatrolBoat` + `DioramaHarborCruiser`) gỡ sạch trên mobile; giữ nguyên trên desktop | ✔️ PASS |
| **DoD #3: Zero Split-Brain Timer** | `perf_budget.ts` nhận thời lượng từ `deviceContext`, loại bỏ timer 1500ms hardcode | Caller truyền thời lượng thực tế, `perf_budget.ts:L142-L143` mặc định `?? 0` không tự ý hạ DPR | ✔️ PASS |
| **DoD #4: React Rules of Hooks Integrity** | 100% hook được gọi vô điều kiện trước mọi early return | `coastal_seagulls.tsx:L74` đặt `if (isMobile) return null;` sau 3 useRef, 1 useMemo, 1 useSafeFrame | ✔️ PASS |
| **DoD #5: Dual-Viewport Art Direction** | Chụp ảnh thực địa và chấm điểm mỹ thuật 3D | Desktop 1280x800 & Mobile 360x740 chụp tại `.agents/tmp/`; Game 3D Visual Critic chấm 8.2/10 | ✔️ PASS |
| **DoD #6: Scaled Test & Mutation Floors** | Đạt tối thiểu 8 ca test và 8 mutants cho Micro-Slice | 8 bài test hợp đồng (asserts/test = 1.75), 8/8 mutants KILLED (100% kill rate, 0 survived) | ✔️ PASS |
| **DoD #7: Pre-closing Mechanical Gate** | `npm run prefilter` & `node scripts/check_evidence.mjs` | Cả 2 script thoát mã 0 (PASS 7/7 cổng prefilter, 0 vi phạm chốt chặn) | ✔️ PASS |
| **DoD #8: Honest LOC & Tech Debt** | Quét LOC vật lý qua `check_loc.mjs`, cảnh báo Tier 1 > 300 dòng | `perf_budget.ts` đạt 301 LOC (⚠️ Warning > 300), đăng ký `DEBT-PERF-BUDGET-SUBMODULE` | ✔️ PASS |

---

### 3. TỔNG HỢP SỐ LIỆU TỪ CÁC FILE BẰNG CHỨNG MÁY ĐỌC (MACHINE EVIDENCE)

Toàn bộ số liệu được trích xuất trực tiếp từ các tệp bằng chứng số trong `.agents/evidence/` và `.agents/audit/`:

- **Trạm 1 Evidence ([`station1_IMP-266_3.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/station1_IMP-266_3.json))**:
  - `executed`: `true`
  - `redVerified`: `true` (Adversarial Inversion xác nhận lỗi hành vi thật tại L78, L94, L116, L124)
  - `testCount`: 8
  - `expectCount`: 14 (tỷ lệ assert trung bình 1.75 / test, trần <= 4 asserts/test)
  - `blastRadiusPassed`: `true`
- **Trạm 2 Evidence ([`IMP-266_3_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/IMP-266_3_snapshot.json))**:
  - `executed`: `true`
  - `greenVerified`: `true` (8/8 contract tests passed, 36 regression tests passed)
  - `modifiedFiles`: 
    - `src/client/3d/coastal_seagulls.tsx`
    - `src/client/3d/coastal_patrol_boat.tsx`
    - `src/client/3d/diorama/diorama_harbor_cruiser.tsx`
    - `src/client/3d/perf_budget.ts`
    - `tests/client/imp265_dual_platform_mobile_lod.test.ts`
- **Trạm 3 Audit Reports**:
  - Phase 3.0: Dual-Viewport captures `.agents/tmp/imp-266_3_desktop.jpg` (1280x800) và `.agents/tmp/imp-266_3_mobile_360.jpg` (360x740) kèm bounding boxes và camera telemetry.
  - Phase 3.1 ([`SPEC_REVIEW_IMP-266_3.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-266_3.md)): `🟢 APPROVED (SPEC_SCOPE_APPROVED)` — 100% 4 Tasks hoàn tất, zero scope drift.
  - Phase 3.2 Visual Critic ([`3D_VISUAL_REVIEW_IMP-266_3.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/3D_VISUAL_REVIEW_IMP-266_3.md)): `🟢 APPROVED` — Điểm số **8.2/10**, bố cục đảo nhiệt đới và góc nghiêng 38.7° chuẩn thương mại; giải phóng GPU mobile sạch sẽ.
  - Phase 3.2 Code Reviewer / Re-Reviewer ([`CODE_REVIEW_IMP-266_3.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-266_3.md)): `🟢 APPROVED` — Khắc phục triệt để vị trí early return tuân thủ Rules of Hooks, xóa bỏ timer split-brain, zero dirty casts.
- **Trạm 4 Evidence ([`chaos_sentinel_IMP-266_3.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-266_3.json))**:
  - `executed`: `true`
  - `isMicroSlice`: `true`
  - `pureLogicWaiver`: `false` (Đã qua kiểm định trực quan Phase 3.0 & 3D Visual Critic)
  - `closedLoopParity`: `PASS` (Desktop: 35 meshes hải âu, 3 planes bọt sóng [`CoastalPatrolBoat` + `DioramaHarborCruiser`] / Mobile: 0 mesh hải âu, 0 plane bọt sóng)
  - `ephemeralBoundaryProbe`: `PASS` (50 chu kỳ toggle viewport liên tục an toàn tuyệt đối trong headless SSR)
  - `mutationSensitivityProbe`: `PASS` (8/8 semantic mutants tested, 8 KILLED, 0 survived, kill rate 100%)
  - `verdict`: `APPROVED`

---

### 4. ĐÁNH GIÁ VẬN HÀNH & ĐỀ XUẤT CẢI TIẾN SETTING SDLC (HARNESS RETRO)

#### Vòng 1: Kiểm Chứng Bằng Chứng Vật Lý (Physical Evidence Cross-Examination)
1. **React Rules of Hooks Lifecycle Integrity**:
   - *Phát hiện:* Ban đầu implementer đặt `if (isMobile) return null;` ở dòng 24 trước các hooks `useRef`, `useMemo`, `useSafeFrame`. `code-reviewer` đã phát hiện nguy cơ crash Fiber khi component re-render do đổi viewport hoặc xoay màn hình di động.
   - *Hành động khắc phục:* Implementer đã chuyển điều kiện unmount xuống dòng 74 (sau toàn bộ hooks, trước JSX return). Đồng thời, bài test hồi quy TC-265.09 được chuyển sang dùng `captureTree` thay vì gọi component như hàm thông thường.
   - *Đánh giá:* **Physical Evidence Found**. Việc phát hiện sớm tại Phase 3.2 và thẩm định lại bằng `re-reviewer` đã bảo vệ tính toàn vẹn của vòng đời React.
2. **Loại bỏ Split-Brain Timer trong Quản Lý Hiệu Năng**:
   - *Phát hiện:* Trước đây `perf_budget.ts` tự ý hardcode `degradedDurationMs: 1500`, dẫn đến tình trạng vừa có timer ngoài vòng lặp vừa có giá trị ngầm bên trong.
   - *Khắc phục:* `deviceContext` hiện là nguồn duy nhất cung cấp thời lượng suy giảm, đưa hệ thống về đúng nguyên tắc Single Source of Truth.
   - *Đánh giá:* **Physical Evidence Found**. Trạm 4 đã diệt 100% mutants hoán đổi biến hoặc tráo đổi thời lượng.
3. **Triệt tiêu Visual Glitch bọt sóng neo đậu (`diorama_harbor_cruiser.tsx`)**:
   - *Phát hiện:* Trong khi `CoastalPatrolBoat` đã được che chắn bằng `{!isMobile}`, `DioramaHarborCruiser` bị bỏ sót khiến thuyền đứng yên nhưng vệt bọt sóng vẫn render.
   - *Khắc phục:* Đã bổ sung `{!isMobile && (...) }` quanh `mesh ref={wakeRef}` tại dòng 60-65.
   - *Đánh giá:* **Physical Evidence Found**. Kiểm thử TC-266.3.03 và TC-266.3.04 đã assert trên cả 2 tàu.
4. **Sửa Leaky Abstraction của `captureTree` (`threejs_test_utils.ts`)**:
   - *Phát hiện:* Khi component trả về `null`, `captureTree` nhét `null` vào children của element mới, khiến tree là truthy object.
   - *Khắc phục:* Trả về trực tiếp `null` khi `capturedNode === null`.
   - *Đánh giá:* **Physical Evidence Found**. Các test case TC-266.3.01 và TC-265.09 đã assert trực tiếp `expect(tree).toBeNull()`.

#### Vòng 2: Phản Biện Đối Kháng & Đăng Ký Nợ Kỹ Thuật (Honest LOC & Tech Debt)
- **Kiểm toán LOC vật lý (`check_loc.mjs`)**:
  - `src/client/3d/perf_budget.ts` có 301 dòng vật lý (265 SLOC), thuộc phân loại **Tier 1 (Domain/Server/Logic)**.
  - Vượt ngưỡng cảnh báo 300 dòng (301 > 300 LOC).
  - **Đăng ký Nợ Kỹ Thuật SSOT**:
    - **Mã định danh**: `DEBT-PERF-BUDGET-SUBMODULE`
    - **Mức độ**: Warning (Tier 1 > 300 LOC, trần tối đa 400 LOC).
    - **Kế hoạch tương lai**: Trích xuất thuật toán điều phối `calculateAdaptiveDpr` và các bảng hằng số ngưỡng FPS/DPR sang submodule sâu con `perf_dpr_policy.ts`.
- **Đánh giá hiệu quả lộ trình Micro-Slices**:
  Toàn bộ Epic IMP-266 được phân tách thành 3 lát cắt vi mô:
  - Slice 1 (`IMP-266.1`): Làm sạch kiểu dữ liệu & AST Test Utils (+42 LOC, 0 visual)
  - Slice 2 (`IMP-266.2`): Hook phản ứng viewport `useIsMobile` & truyền prop từ App root (+29 LOC, 0 visual)
  - Slice 3 (`IMP-266.3`): LOD 3D bật tắt hải âu, bọt sóng và chuẩn hóa `perf_budget.ts` (+22 LOC, visual review 8.2/10)
- **Kết luận quy trình:** Không có bất kỳ ticket nào vượt trần 50 LOC, không có ô nhiễm chéo giữa các tầng, và việc ráp nối 3 lát cắt diễn ra hoàn toàn mượt mà, đạt 100% GREEN trên toàn bộ 44 bài test (0 lỗi hồi quy).

---

### 5. TỔNG KẾT PULL REQUEST & NGUY CƠ HÒA NHẬP (MERGE DANGER)

- **Tóm tắt thay đổi**: Tắt hoàn toàn đàn chim hải âu (35 meshes) và 2 dải bọt sóng rẽ nước trên thiết bị di động; mở rộng `perfBudget.getBudgetReport` để đọc thời lượng suy giảm từ caller; đồng bộ prop `isMobile` từ môi trường đảo xuống các phần tử con.
- **Nguy cơ hòa nhập (Merge Danger)**: **ZERO (0/10)**. 
  - Toàn bộ 4 test suites liên quan (44 tests) đều 100% GREEN.
  - Cả 7 cổng tiền lọc cơ học `fast_prefilter.mjs` đều PASS.
  - Bằng chứng số đạt chuẩn 100% qua `check_evidence.mjs`.
  - Không có dirty casts (`as any`, `as unknown as T`), không có monkey-patch prototype.
- **Trạng thái Epic IMP-266**: **HOÀN TẤT 100% CẢ 3 MICRO-SLICES**.
