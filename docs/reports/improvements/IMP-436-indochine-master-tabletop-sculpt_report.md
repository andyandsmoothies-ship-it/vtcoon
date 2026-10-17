# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-436
## Implementation Plan: IMP-436 Indochine Master Tabletop Sculpt & VIP Atmosphere

> **Mã Ticket:** `IMP-436`  
> **Phân hệ thực tế:** `client-3d`  
> **Ngày hoàn thành:** 2026-10-17  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

> **Mô tả cốt lõi**: Nâng tầm toàn diện thẩm mỹ bàn cờ lên đẳng cấp Masterpiece: điêu khắc mô hình 3D nguyên khối `indochine_master_landscape.glb` chứa phù điêu Trống Đồng Đông Sơn nổi 3D, Chùa Vàng Nam Bộ bên sông, 4 chậu Bonsai Penjing hoàng gia; cách ly ngoại cảnh hoạt hình để phủ kín bệ bàn tiệc gỗ trắc thượng lưu 48m x 48m trên Desktop; và căn phẳng thảm cỏ trung tâm ở $Y = 0.005\text{m}$ để triệt tiêu hoàn toàn vệt hằn mép nối hình học.

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-436.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-436.md) | Thẩm định kế hoạch đạt 0 defects, 6 contract tests clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/client/imp436_indochine_master_tabletop_sculpt.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp436_indochine_master_tabletop_sculpt.test.ts) | 11 atomic tests, 27 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/chaos_sentinel_IMP-436.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-436.json) | 3 production files modified, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.0: Dual-Viewport** | Puppeteer Headless Probe | Desktop (1280x800) [`imp-436_desktop.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-436_desktop.jpg) & Mobile (360x740) [`imp-436_mobile_360.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-436_mobile_360.jpg) | **CAPTURED** 📸 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-436.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-436.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-3d` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-436.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-436.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 2.45 | **APPROVED** 🛡️ |
| **Trạm 3.2: 3D Visual & Spatial Review** | `game-3d-visual-critic`<br>[`.agents/audit/3D_VISUAL_REVIEW_IMP-436.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/3D_VISUAL_REVIEW_IMP-436.md) | Frustum camera, clearance an toàn, Polish tức thì P1 (phù điêu nổi 3D) & P3 (bonsai 1.35x) | **6.8 ➔ 8.8 / 10 (Post-Polish AAA Verified) 🎨** |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 29/29 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết chung cuộc**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Thẩm định kế hoạch ban đầu phát hiện 6 điểm mù kiến trúc, sau đó toàn bộ 6 chỉ thị tôi luyện (ADV-01 đến ADV-06) đã được tích hợp đầy đủ vào bản kế hoạch chính thức.
- **Tiến trình đối kháng & Giải tỏa điểm mù**:
  > *Ghi chú giải trình tiến trình:* Trong vòng kiểm toán mù sơ khởi (Blind Initial Audit), `adversarial-challenger` phát hiện bản nháp kế hoạch thiếu script sinh asset Blender và giả định sai số liệu GLB (kết luận sơ bộ: FAIL). Ngay sau đó, Kế hoạch đã trải qua chu kỳ tôi luyện chuyên sâu: bổ sung script `scripts/blender/build_indochine_master_landscape.py`, chuẩn hóa số liệu vật lý, giải quyết toàn diện 6 chỉ thị đối kháng (ADV-01..06) để đạt chứng nhận **HARDENED_APPROVED** tuyệt đối trước khi mở Trạm 1.
  - **[ADV-OBJ] Objective Validity (Thẩm Tra Mục Tiêu & Cơ Sở Thực Tế)**
    - **Target reachable?**: Yes — `GameBoard` được mount tại [`src/client/game_canvas.tsx#L215`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx#L215). `MiniatureCityDiorama` tại [`src/client/3d/board_layout.tsx#L204`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_layout.tsx#L204). `DioramaTerrain` tại [`src/client/3d/miniature_city_diorama.tsx#L352`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx#L352).
    - **Baselines verified?**: Sơ khởi: Chưa có file GLB và script Blender trên đĩa vật lý -> *Đã khắc phục hoàn toàn bằng việc bổ sung script Python Blender và tạo asset `indochine_master_landscape.glb` (68.9 KB).*
    - **Trạng thái đối kháng:** *Sơ bộ: FAIL ➔ ĐÃ TÔI LUYỆN THÀNH CÔNG (HARDENED_APPROVED)*.
  - **[ADV-01] Mathematical Impossibility: Self-Contradictory Arena Clearance Invariant in TC-436.01**
    - **Vector**: Unstated Assumption / Logic Fallthrough
    - **Scenario**: In Section 2, the plan defines `[INV-MASTER-LANDSCAPE-ASSET]`: `INDOCHINE_MASTER_LANDSCAPE_URL` contains *"5 unified sculpted sub-features: (1) Sunken Velvet Dong Son Arena with 3D relief 14-ray sun star and chim Lạc, (2) S-curve river..."*. In `[INV-ARENA-RELIEF-AND-CLEARANCE]`, the Dong Son drum medallion is centered at $(0, 0, 0)$ with inner disc $R \approx 1.4\text{m}$ and outer rim $R = 1.68\text{m}$. In Section 5, `TC-436.01` asserts: *"Given INDOCHINE_MASTER_LANDSCAPE_URL, When checking physical asset and GLB binary accessors, Then... contains 5 sub-features with 0 vertices penetrating R < 1.68m"*.
    - **Consequence**: Every single vertex of the Dong Son drum medallion, 14-ray sun star, chim Lạc birds, and velvet arena floor is located at radius $R \le 1.68\text{m}$. If the asset actually contains the arena, `TC-436.01` will encounter thousands of vertices at $R < 1.68\text{m}$ and fail 100% of the time. If the asset has 0 vertices at $R < 1.68\text{m}$, the arena is missing. The author blindly copied the non-penetration check from `TC-435.01c` (which proved that the *river* didn't penetrate the arena) without adapting it to a model that explicitly houses the arena.
    - **Hardening Directive**: Update `TC-436.01` to test clearance exclusively on the non-arena sub-features (e.g. river water mesh, organic boulders, Golden Pagoda, coconut palms) verifying that peripheral features do not penetrate the arena radius $R < 1.68\text{m}$, while testing the arena sub-mesh separately for its bounding radius $R \le 1.68\text{m}$.
  - **[ADV-02] Duplicate 3D Model Overlap & Severe Z-Fighting in MiniatureCityDiorama**
    - **Vector**: Concurrency & Trapped States / Visual Glitch
    - **Scenario**: Currently, [`src/client/3d/miniature_city_diorama.tsx#L352-357`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx#L352-L357) mounts: `DioramaTerrain` (which mounts `saigon_river_spline.glb`) `CentralMonumentPlaza` (which mounts `sunken_velvet_dice_arena.glb`) `DioramaUrbanCanopy` (which mounts `indochine_botanical_biome.glb`) `SafeGLTFModel(BRIDGE_PLAZAS_MODEL_URL)` The plan proposes adding: {isSerene && ( <SafeGLTFModel url={INDOCHINE_MASTER_LANDSCAPE_URL} position={[0, 0, 0]} receiveShadow fallback={null} /> )} The plan leaves `DioramaTerrain`, `CentralMonumentPlaza`, and `DioramaUrbanCanopy` completely unchanged.
    - **Consequence**: If `indochine_master_landscape.glb` is a monolithic model containing the arena, river, and flora, WebGL renders TWO arenas, TWO rivers, and TWO sets of palm trees simultaneously at the exact same coordinates ($[0, 0, 0]$). This creates catastrophic stroboscopic Z-fighting (flickering polygons), doubles the diorama triangle count ($8,500 + 1,984 + 960 + 1,994 + 216 = 13,654\text{ tris}$), doubles draw calls, and consumes $> 600\text{KB}$ in GLB assets, directly violating Principle 3 and the 8,500-triangle budget.
    - **Hardening Directive**: Adopt one of two clean architectural paths: **Path A (Additive Master Sculpt)**: Define `indochine_master_landscape.glb` to contain ONLY the new VIP features: Golden Pagoda, 4 corner bonsai planters, organic river boulders, and 3D relief overlay, without duplicating the base arena, riverbed, or palm trunks. **Path B (Clean Component Bypassing)**: In `miniature_city_diorama.tsx`, when `isSerene` is true, pass a prop (e.g. `suppressModel={true}`) to `CentralMonumentPlaza`, `DioramaTerrain`, and `DioramaUrbanCanopy` so their inner `SafeGLTFModel` loaders are skipped while retaining their testids and non-model JSX.
  - **[ADV-03] Syntax & Compilation Failure: Undeclared `isDesktopLean` in `board_layout.tsx`**
    - **Vector**: Partial Failure / Build Block
    - **Scenario**: The drop-in replacement snippet for [`src/client/3d/board_layout.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_layout.tsx) specifies: <group visible={isOceanVisible && !isDesktopLean}> <CoastalIslandEnvironment ... />
    - **Consequence**: TypeScript compilation (`npx tsc --noEmit`) and fast prefilter will immediately abort with `TS2304: Cannot find name 'isDesktopLean'`. Station 2.5 GREEN cannot build.
    - **Hardening Directive**: In `src/client/3d/board_layout.tsx`, declare `const isDesktopLean = !isMobile;` within `GameBoard` (around line 115) alongside `isMobile` and `isIOS`, or use `!isMobile` directly: `<group visible={isOceanVisible && !(!isMobile)}>`.
  - **[ADV-04] Spatial AABB Collision: Golden Pagoda Intersects Moored Harbor Cruiser**
    - **Vector**: Unstated Assumption / Spatial Non-Occlusion
    - **Scenario**: The plan specifies: `Golden Pagoda positioned at X ≈ 1.2m, Z ≈ 2.4m facing the river basin`. In [`src/client/3d/diorama/diorama_harbor_cruiser.tsx#L39-40`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_harbor_cruiser.tsx#L39-L40) and living test [`imp435#L419-470`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp435_saigon_river_and_indochine_biome.test.ts#L419-L470), when `isMoored = true` (which triggers on desktop lean), `DioramaHarborCruiser` docks at $X = 1.6\text{m}, Z = 2.2\text{m}$. The cruiser has length $0.92\text{m}$ ($Z \in [1.74, 2.66]$) and width $0.26\text{m}$ ($X \in [1.47, 1.73]$). The distance between the Golden Pagoda center $(1.2, 2.4)$ and the cruiser center $(1.6, 2.2)$ is only $\sqrt{0.4^2 + (-0.2)^2} \approx 0.447\text{m}$.
    - **Consequence**: Any pagoda structure with base or roof eaves exceeding radius $0.27\text{m}$ will physically intersect and clip through the wooden hull of the docked harbor cruiser in the river basin.
    - **Hardening Directive**: Reposition the Golden Pagoda to the northeast river terrace at $X \approx 2.8\text{m}, Z \approx -1.8\text{m}$ (where the river sweeps east and the bank is clear), OR constrain the pagoda center to $X \le 0.85\text{m}, Z \ge 2.85\text{m}$ with a strict maximum bounding radius of $0.35\text{m}$, proving $\ge 0.50\text{m}$ spatial clearance from the cruiser via `computeTransformedAABB2D`.
  - **[ADV-05] Mobile Hardware Ingestion: 8,500 Tri Model & 48m Plinth on Low-Tier Devices**
    - **Vector**: Logic Fallthrough / Platform DI Violation
    - **Scenario**: In `src/client/3d/miniature_city_diorama.tsx#L341`, `const isSerene = isDesktopLean || isMobile;`. The plan's drop-in snippet mounts the master landscape via `{isSerene && <SafeGLTFModel url={INDOCHINE_MASTER_LANDSCAPE_URL} ... />}`. In `src/client/3d/board_layout.tsx`, the 48m VIP table plinth is guarded only by `{isTableVisible && ...}` without checking `!isMobile`.
    - **Consequence**: Mobile devices (already restricted by `resolveRenderTierProfile` to `INSTANCED_POOL_VERTEX_AO` and stripped of outer bay sanctuaries) will unconditionally load and render this heavy 320KB, 8,500-triangle sculpt and the 48m shadow-receiving plinth. This violates mobile VRAM budgets and risks degrading framerate below the mandatory 30 FPS floor.
    - **Hardening Directive**: Gate `INDOCHINE_MASTER_LANDSCAPE_URL` behind `{isDesktopLean && ...}` in `MiniatureCityDiorama` (so mobile continues using lightweight instanced geometry), and gate the 48m VIP walnut plinth behind `{isTableVisible && !isMobile && ...}` in `board_layout.tsx`.
  - **[ADV-06] Missing Asset Build Script & Station 2 RED Crash**
    - **Vector**: Partial Failure / Test Infrastructure
    - **Scenario**: `public/models/board/indochine_master_landscape.glb` does not exist on disk. The plan's Target Files table lists only 3 TypeScript/TSX files and 1 test file. No build script (e.g. `scripts/blender/build_indochine_master_landscape.py`) is declared. In Station 2, `qa-tester` authors `TC-436.01` which invokes `readAssetBufferFromDisk('models/board/indochine_master_landscape.glb')`.
    - **Consequence**: `readAssetBufferFromDisk` will throw an unhandled Node.js `ENOENT` exception during `fs.readFileSync`. Station 2 RED requires tests to fail cleanly due to runtime semantic assertions (`expect().toBe()`), NOT unhandled filesystem crashes or missing module errors.
    - **Hardening Directive**: Add `scripts/blender/build_indochine_master_landscape.py` to the plan's Scope & Target Files table, and ensure `TC-436.01` provides a safe file existence check before invoking binary parsers.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/client/imp436_indochine_master_tabletop_sculpt.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp436_indochine_master_tabletop_sculpt.test.ts)
- **Chỉ số kiểm thử**: **11 atomic tests**, **27 asserts** (mật độ trung bình: 2.45 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (Thất bại do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.
  - **Bằng chứng thất bại (Failure Snippet)**:
```text
AssertionError: expected '' to be '/models/board/indochine_master_landscape.glb' | AssertionError: expected false to be true | AssertionError: expected desktopMarkup to contain args="48,0.19,48" | AssertionError: expected 0.004 to be close to 0.005 | AssertionError: expected +0 to be 1 SafeGLTFModel mounted
```

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi**:
  - [`src/client/3d/board_layout.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_layout.tsx)
  - [`src/client/3d/diorama/diorama_terrain.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_terrain.tsx)
  - [`src/client/3d/miniature_city_diorama.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx)
- **Chuyển trạng thái**: Toàn bộ **11/11 contract tests chuyển sang GREEN**.
- **Living Test Suites**: Bảo toàn nguyên vẹn, zero hồi quy logic hiện hành.

### Trạm 2.5: Fast Pre-Filter Mechanical Sweep (`scout` / `fast_prefilter.mjs`)
- **TypeScript**: `tsc --noEmit` vượt qua với 0 lỗi (Exit Code 0).
- **Dirty Casts**: Tuyệt đối không sử dụng `as any` hoặc dirty type casting.
- **LOC Ceilings**: Tất cả các tệp đều nằm trong hạn mức trần của từng phân hệ (Tier 1 <= 400, Tier 2 <= 500, Tier 3 <= 800, Test <= 600).

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
1. **Spec & Scope Gatekeeper (`spec-reviewer`)**:
    - **Phán quyết**: **APPROVED** 📋
    - **Xác nhận phạm vi**: 100% các thay đổi nằm trong phân hệ mục tiêu (`client-3d`), zero scope creep.
2. **Deep Architecture & Anti-Slop Auditor (`code-reviewer`)**:
    - **Phán quyết**: **APPROVED** 🛡️
    - **Chỉ số Anti-Slop**: 0 violations trên 6 cờ cảnh báo (Deep modules, Zero pass-through wrappers, Zero TIDD).
    - **Bộ nhớ & Timer**: Không rò rỉ listener, không bỏ sót timer cleanup, an toàn bất đồng bộ.
3. **3D Visual & Spatial Auditor (`game-3d-visual-critic`)**:
    - **Phán quyết ban đầu**: **6.8 / 10 (3D AAA Verified - Yêu cầu Polish tức thì P1 & P3) 🎨**
    - `top_down`: **VALID** (`imp-436_full_board.jpg` — Perspective FOV ~45°, độ cao Y ~16m, bao quát toàn cảnh bàn cờ, bệ gỗ trắc salon 48m x 48m và các kỳ quan diorama; telemetry: 58 FPS | 14ms | OK).
    - `lobby_vip`: **VALID** (`imp-436_desktop.jpg` — Khung nhìn 1280x800 desktop xác nhận đã cách ly hoàn toàn cụm bãi biển/dù đỏ/thông nón, thế chỗ bởi bệ salon gỗ trắc thượng lưu `#1C140D`; telemetry: 60 FPS | 14ms | OK).
    - `deed_modal`: **VALID** (40 ô đất đá cẩm thạch ngà `#FDFBF7`, chỉ đồng antique brass `#C5A059` và 4 góc gỗ trắc hoàng gia `#1C1612` giữ nguyên độ sắc nét và tương phản cao).
    - `dice_tray`: **ĐÃ KHẮC PHỤC TRIỆT ĐỂ QUA CHU KỲ POLISH P1** (Ban đầu đĩa trống đồng bị che khuất bởi thảm cỏ vá trung tâm; đã khoét rãnh tròn loại trừ $R \le 1.68\text{m}$ trong `diorama_terrain.tsx` và nâng cao độ phù điêu lên $Y \in [0.002, 0.005]\text{m}$ trong `build_indochine_master_landscape.py`, giúp mặt trời 14 tia và 8 chim Lạc ánh đồng cổ `#8C6239` nổi rõ trên nền nhung lục bảo).
    - `hud_dock`: **VALID** (Thanh Dock bo tròn mềm mại, huy hiệu đo kiểm 60 FPS / 14ms và các phím xúc giác hiển thị sắc nét, không bị clipping).
    - **Bảo lưu nguyên bản (Keep Directives)**:
      - **K1 (Chùa Vàng Nam Bộ)**: Giữ nguyên kiến trúc mái cong dát vàng, bảo tháp hoa sen tại $(2.7, 0.04, -1.6)$.
      - **K2 (Bệ bàn Salon VIP)**: Bảo lưu triệt để việc cách ly `CoastalIslandEnvironment` trên desktop để tôn vinh bệ gỗ trắc 48m x 48m (`#1C140D`, roughness 0.35).
      - **K3 (Khớp nối thảm cỏ $Y = 0.005\text{m}$)**: Giữ nguyên cao độ $Y = 0.005\text{m}$ để triệt tiêu vệt trắng mép nối hình học.
      - **K4 (Kỷ luật ngân sách & Draw Calls)**: Duy trì cấu trúc 1 GLB nguyên khối (`indochine_master_landscape.glb` 68.9 KB, 1,146 tris) đảm bảo 60 FPS / 14ms mượt mà.
    - **Kết quả xử lý chỉ thị Polish tức thì (Closed-Loop Resolution)**:
      - **P1 (Phù điêu Trống Đồng nổi 3D)**: Đã khoét rãnh trừ $R \le 1.68\text{m}$ trong `getSereneTerrainInfillGeometry()` và tái xuất GLB với $Y \in [0.002, 0.005]\text{m}$, metallic 0.90, roughness 0.18.
      - **P3 (4 Chậu Bonsai Penjing hoàng gia)**: Phóng to $1.35\times$ tại $(\pm 4.2\text{m}, \pm 4.2\text{m})$, tráng men gốm bóng (clearcoat 0.50, roughness 0.18) và đổi màu tán lá sang ngọc bích rực rỡ (`#16A34A`).
      - **Hình ảnh xác minh tái lập**: Ảnh chụp thực tế `imp-436_desktop.jpg` và `imp-436_full_board.jpg` sau khi build lại chứng minh đĩa Trống Đồng Đông Sơn và các chậu Bonsai đã ánh lên sắc sảo, kiệt tác bàn cờ đạt trọn vẹn tinh thần Kỳ Nghệ Đông Dương.

### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: 29/29 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-436 (Direct Scope)

| Tệp Mã Nguồn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Ngân Sách Trần | Trạng Thái |
| :--- | :---: | :---: | :---: | :---: |
| [`board_layout.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_layout.tsx) | Tier 2 (UI/3D/Views) | **249 SLOC** (278 L) | <= 500 LOC | ✅ Đạt chuẩn |
| [`diorama_terrain.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_terrain.tsx) | Tier 2 (UI/3D/Views) | **149 SLOC** (166 L) | <= 500 LOC | ✅ Đạt chuẩn |
| [`miniature_city_diorama.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx) | Tier 2 (UI/3D/Views) | **366 SLOC** (393 L) | <= 500 LOC | ✅ Đạt chuẩn |
| [`imp436_indochine_master_tabletop_sculpt.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp436_indochine_master_tabletop_sculpt.test.ts) | Living Test | **286 SLOC** (334 L) | <= 600 LOC | ✅ Đạt chuẩn |

### 4.2. Danh Mục Tệp Quy Trình & Bằng Chứng (Harness & Evidence Scope)
*(Giải trình 12 tệp siêu dữ liệu kiểm soát chất lượng, hợp nhất 100% với Git Summary)*

| Tệp Quy Trình / Bằng Chứng | Phân Loại / Vai Trò | Trạng Thái |
| :--- | :--- | :---: |
| [`3D_VISUAL_REVIEW_IMP-436.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/3D_VISUAL_REVIEW_IMP-436.md) | Biên bản kiểm toán độc lập | ✅ Đã xác minh |
| [`CODE_REVIEW_IMP-436.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-436.md) | Biên bản kiểm toán độc lập | ✅ Đã xác minh |
| [`PLAN_AUDIT_IMP-436.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-436.md) | Biên bản kiểm toán độc lập | ✅ Đã xác minh |
| [`PLAN_CHALLENGE_IMP-436.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_CHALLENGE_IMP-436.md) | Biên bản kiểm toán độc lập | ✅ Đã xác minh |
| [`SPEC_REVIEW_IMP-436.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-436.md) | Biên bản kiểm toán độc lập | ✅ Đã xác minh |
| [`IMP-436.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/sentinel_probes/IMP-436.json) | Đặc tả đột biến Chaos Sentinel | ✅ Đã xác minh |
| [`bounding_box_imp-436_desktop.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/bounding_box_imp-436_desktop.json) | Bằng chứng thực thi & snapshot | ✅ Đã xác minh |
| [`bounding_box_imp-436_mobile.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/bounding_box_imp-436_mobile.json) | Bằng chứng thực thi & snapshot | ✅ Đã xác minh |
| [`camera_telemetry_imp-436_desktop.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/camera_telemetry_imp-436_desktop.json) | Bằng chứng thực thi & snapshot | ✅ Đã xác minh |
| [`camera_telemetry_imp-436_mobile.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/camera_telemetry_imp-436_mobile.json) | Bằng chứng thực thi & snapshot | ✅ Đã xác minh |
| [`chaos_sentinel_IMP-436.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-436.json) | Bằng chứng thực thi & snapshot | ✅ Đã xác minh |
| [`station1_IMP-436.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/station1_IMP-436.json) | Bằng chứng thực thi & snapshot | ✅ Đã xác minh |

---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

- **Tính toàn vẹn hệ thống**: Gói cải tiến hoàn thành theo đúng nguyên tắc Zero-Blindness, cung cấp đầy đủ bằng chứng vật lý từ mã nguồn, kiểm thử, hình ảnh trực quan đến biên bản kiểm toán độc lập.
- **Sẵn sàng triển khai**: Mã nguồn đã sẵn sàng đóng gói và triển khai lên môi trường sản phẩm.
- **Định hướng quy hoạch tiếp theo (VIP Salon Atmosphere & Interior Lighting)**:
  Mặc dù bệ gỗ trắc 48m x 48m đã che phủ hoàn toàn cụm đảo ngọc đồ chơi ngoại vi, bầu trời xa xa hiện tại vẫn mang tông xanh ngoài trời ban ngày (`#38BDF8`). Đề xuất mở ticket tiếp nối để chuyển dịch scene clear color / fog sang tông than ấm/hổ phách khánh tiết (`#14100C` đến `#1C1714`, `scene.fog = new THREE.FogExp2('#14100C', 0.02)`) và bổ sung nguồn sáng nội thất vàng ấm 3200K tập trung vào bàn cờ, hoàn thiện trải nghiệm 10/10 tuyệt đối của một phòng trưng bày VIP penthouse/salon thượng lưu.
