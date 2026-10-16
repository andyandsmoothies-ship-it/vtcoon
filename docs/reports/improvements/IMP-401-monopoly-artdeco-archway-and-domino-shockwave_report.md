# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-401
## Plan IMP-401: Desktop Art Deco Monopoly Archways (.glb) & Domino Shockwave Ripple (Ticket IMP-401)

> **Mã Ticket:** `IMP-401`  
> **Phân hệ thực tế:** `client-3d`  
> **Ngày hoàn thành:** 2026-10-15  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

- **Bối cảnh nghiệp vụ & Mỹ thuật 3D AAA (Blender 5.2 LTS)**: Trước `IMP-401`, thành phần `MonopolyPlazaFusion` (`src/client/3d/monopoly_plaza_fusion.tsx`) chỉ kết xuất một khối hộp sơ khai `boxGeometry args={[0.2, 0.05, 0.2]}` đặt tại tâm bàn cờ `[0, 0.05, 0]`, không tạo được dấu ấn thị giác xứng tầm khi người chơi thâu tóm trọn bộ Độc quyền (Monopoly) trên màn hình Desktop.
- **Giải pháp Kỹ thuật & Hình học Không gian (`IMP-401`)**:
  1. **Điêu khắc Cổng Vòm Đại Lộ Độc Quyền Art Deco `.glb` bằng Blender 5.2.2 LTS (`scripts/blender/build_monopoly_archway.py`)**:
     - Lưu trữ vĩnh viễn kịch bản Python Blender 5.2 tại [`scripts/blender/build_monopoly_archway.py`](file:///c:/Users/HP/Documents/GitHub/vtcoon/scripts/blender/build_monopoly_archway.py) để đúc mô hình [`public/models/landmarks/monopoly_archway_artdeco.glb`](file:///c:/Users/HP/Documents/GitHub/vtcoon/public/models/landmarks/monopoly_archway_artdeco.glb) (`29,260 bytes <= 48KB`, `1,392 tris <= 1,500 tris`, `Pivot [0, 0, 0]` chính giữa mặt đáy chân cổng).
     - Khóa cứng kích thước cơ sở (unscaled bounding box) ở mức **rộng `0.72m` × cao `0.68m` × sâu `0.14m`**, sử dụng `bmesh` + `Boolean Modifier` khoét vòm cuốn bậc thang Art Deco + `Bevel Modifier (3 segments)` + `Weighted Normals` cùng 3 khe vật liệu PBR (`Mat_CarraraMarble` `#F8FAFC`, `Mat_BrushedBrass` `#D97706`, `Mat_EmissiveGold` `#F59E0B`).
  2. **Toán học Phân đoạn Liền kề (`splitContiguousMonopolySegments`) — 0% Đè Chữ Tiêu Đề & 0% Va Chạm Tòa Nhà (`[ADV-01]`)**:
     - Vì cả 8 nhóm màu trong `BOARD_CONFIG` đều có ô chức năng xen giữa (`Nau [1,3]`, `XanhDaTroi [6,8,9]`, `Hong [11,13,14]`, `Cam [16,18,19]`, `Do [21,23,24]`, `Vang [26,27,29]`, `XanhLa [31,32,34]`, `Tim [37,39]`), `splitContiguousMonopolySegments` và `getMonopolyBoulevardSegments` tách từng nhóm thành các phân đoạn liền kề trên cùng 1 cạnh bàn cờ (`|cellA - cellB| === 1`, không bắc cầu qua ô chức năng hay 4 góc `0, 10, 20, 30`).
     - Đặt Hành lang Đá Cẩm Thạch (`MarblePromenade`) hoàn toàn bên ngoài mép trên `-1.08m` của thẻ ô cờ (`localZ = -1.16m`, `promenadeDepth = 0.16m` trải từ `-1.24m` đến `-1.08m`, `promenadeHeight = 0.024m`), tuyệt đối không đè lên dải màu tiêu đề hay tên thành phố (`[-1.080m, -0.724m]`).
     - Đặt Cổng Vòm `.glb` tại `localZ = -1.24m`, `Y = 0.118m`: với các phân đoạn chính `>= 2` ô liền kề dùng `archwayScale = [1.25, 1.25, 1.25]` (`0.72m * 1.25 = 0.90m <= 1.05m` lọt gọn vào khe trống `1.22m` giữa 2 tòa nhà liền kề); đối với phân đoạn chính chỉ có 1 ô (`Nau [3]`, `Tim [39]`), dịch chuyển cổng vòm theo phương tiếp tuyến `localX = -0.56m` (`0.55m <= |localX| <= 0.65m`) kèm `archwayScale = [0.75, 1.15, 1.15]` (bán kính ngang `0.27m`), đảm bảo mép ngoài cổng `|-0.56| + 0.27 = 0.83m <= 0.84m` nằm trọn trên thảm đá `1.68m` (không tràn sang ô chức năng kế bên) và mép trong `-0.29m <= -0.283m` không chạm tòa nhà.
  3. **Sóng Chấn Động Domino Lò Xo Tắt Dần (`calculateDominoRippleTransform`) Khi Xây Nhà & Khi Hoàn Tất Bộ Độc Quyền Cấp 0 (`[ADV-03]`, `[ADV-04]`)**:
     - Khi hình thành nhóm Độc quyền mới trên Desktop (`hasNewMonopolyGroup` trong `MonopolyPlazaFusion`), tự động kích hoạt `useVfxStore.getState().triggerConstructionSlam(anchorCell, 1)`, đồng thời bật `showEmptyPlotBoundary={isMonopolyGroup && !isMobile}` tại `board_tile.tsx` và gắn `useSafeFrame` lên `MonopolyPlazaFusionGroup` để cả cọc ranh giới `SurveyorPlotBoundary` lẫn thảm đá/cổng chào đều nảy sóng Domino thật ở `level = 0`.
     - Trong `useSafeFrame` của `ProceduralBuilding`, đọc trực tiếp `resolveNeighborDominoSlam(cellIndex, liveSlams, isMobile)` (quét key trực tiếp 0 cấp phát mảng mỗi frame và bỏ toán tử fallback `?? neighborDomino`) để ngắt ngay sau `TTL = 900ms`, đồng thời cô lập 100% trên thiết bị di động (`isMobile === true`).
  4. **Khôi phục Kiến trúc 4 Vùng Địa lý (`riverine`, `resort`, `heritage`, `metropolis`) cho Cấp 1 & Cấp 2 (Desktop `.glb` & Mobile LOD Fallback)**:
     - Trong [`src/client/3d/building_typology.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/building_typology.ts), khôi phục `getBuildingModelUrl(cellIndex, level)` ở `level === 1` và `level === 2` trả về `/models/buildings/bld_${typology}_c${level}.glb` (kích hoạt toàn bộ 8 tệp `.glb` vùng miền trong `public/models/buildings/`) kèm bảng màu/kiến trúc `getRegionalFallbackPalette`.
     - Trong [`src/client/3d/procedural_building.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/procedural_building.tsx), truyền `resolvedTypology = getRegionalTypology(cellIndex ?? 0) ?? 'metropolis'` xuống `ShophouseFallback` (Cấp 1) và `ComplexFallback` (Cấp 2), tạo 4 biến thể hình khối/màu sắc đặc trưng theo 4 vùng địa lý (`riverine` nhà sàn/mái ngói Nam Bộ, `resort` biệt thự/tháp biển trắng-xanh, `heritage` nhà cổ/mái hoàng lưu ly, `metropolis` nhà phố/cao ốc kính hiện đại) và giữ nguyên kỷ luật hiệu năng Mobile (`forceFallback={isMobile ? true : undefined}`, `smoothness={1}`, `0` `castShadow` trên Mobile).

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-401.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-401.md) | Thẩm định kế hoạch đạt 0 defects, 4 core contract invariants clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/client/imp401_monopoly_artdeco_archway_and_domino_shockwave.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp401_monopoly_artdeco_archway_and_domino_shockwave.test.ts) | 13 atomic tests, 50 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/IMP-401_snapshot.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/IMP-401_snapshot.json) | 6 production files + Blender 5.2 `.glb` generator & asset, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.0: Dual-Viewport** | Puppeteer Headless Probe | Desktop (1280x800) [`imp-401_desktop.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-401_desktop.jpg) & Mobile (360x740) [`imp-401_mobile_360.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-401_mobile_360.jpg) | **CAPTURED** 📸 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-401.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-401.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-3d` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-401.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-401.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 3.85 | **APPROVED** 🛡️ |
| **Trạm 3.2: UI/UX Craft Review** | `game-3d-visual-critic`<br>[`.agents/audit/3D_VISUAL_REVIEW_IMP-401.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/3D_VISUAL_REVIEW_IMP-401.md) | Cổng vòm Art Deco `.glb`, hành lang cẩm thạch & 4 vùng kiến trúc C1/C2 sắc nét, 0 đè chữ | **APPROVED 🎨** |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 43/43 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Thẩm định kế hoạch đạt 0 defects, 4 nhóm bất biến hợp đồng cốt lõi được mở rộng thành 13 kịch bản kiểm thử nguyên tử.
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa**:
  - **[ADV-OBJ] Objective Validity**:
    - **Target reachable?**: Yes — `MonopolyPlazaFusion` được kết xuất trực tiếp tại [`src/client/3d/board_layout.tsx#L226`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_layout.tsx#L226) và `ProceduralBuilding` được kết xuất trên toàn bộ 22 ô tài sản tại [`src/client/3d/board_tile.tsx#L334`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_tile.tsx#L334).
    - **Baselines verified?**: Verified after hardening (`[ADV-01]`..`[ADV-05]` + 4 Spatial/Business locks).
    - **Verdict**: PASS (Hardened in `PLAN_IMP_401`)
  - **[ADV-01] Tile Header Banner, City Title & Building Non-Collision (`localZ = -1.16m` Promenade, `localZ = -1.24m` Archway)**:
    - **Vector**: Spatial Occlusion, Building AABB Collision & Z-Fighting (`ADV-OBJ`)
    - **Scenario**: Trong `BOARD_CONFIG`, cả 8 nhóm màu đều có ô chức năng xen giữa và dải màu tiêu đề ô cờ chiếm `localZ` từ `-1.080m` đến `-0.724m`, trong khi tòa nhà `ProceduralBuilding` đặt tại `localZ = -1.38m`. Nếu nối liền 1 thanh hành lang qua cả nhóm màu hoặc đặt tại `localZ = -0.92m` sẽ đè lên tên thành phố và ô chức năng; nếu đặt cổng vòm của phân đoạn 1 ô (`[3]`, `[39]`) tại `localX = 0` sẽ đâm vào tòa nhà, hoặc nếu đặt `|localX| > 0.65m` sẽ tràn ra ngoài thảm đá `1.68m` (`[-0.84m, +0.84m]`).
    - **Consequence**: Che khuất tên thành phố trên mặt bàn cờ, gây giao cắt hình học với tòa nhà hoặc lấn sang ô chức năng kế bên.
    - **Hardening Directive**: Tách phân đoạn liền kề bằng `splitContiguousMonopolySegments`, đặt `MarblePromenade` hoàn toàn ngoài mép thẻ ô cờ (`localZ = -1.16m`, `promenadeDepth = 0.16m`, mép trước `<= -1.08m`), khóa hộp bao cơ sở `.glb` ở `0.72m x 0.68m x 0.14m` với `archwayScale = [1.25, 1.25, 1.25]` cho cụm `>= 2` ô, và dịch chuyển tiếp tuyến `localX = -0.56m` (`0.55m <= |localX| <= 0.65m`) kèm `archwayScale = [0.75, 1.15, 1.15]` cho phân đoạn chính 1 ô (`[3]`, `[39]`) để giữ cổng nằm trọn trong biên thảm đá `0.84m`.
  - **[ADV-02] React Rules of Hooks Safety in `MonopolyPlazaFusion` on Dynamic Monopoly Acquisition**:
    - **Vector**: Partial Failure & Trapped States / Lifecycle Crash
    - **Scenario**: Khi ván đấu bắt đầu, `monopolyGroups` rỗng `{}`; khi người chơi hoàn tất bộ Độc quyền đầu tiên, `monopolyGroups` chuyển sang khác rỗng. Nếu đặt lệnh trả về sớm trước `useMemo`, `useEffect` hoặc `useSafeFrame` sẽ gây lỗi `React Error #310 (Rendered more hooks than during the previous render)`.
    - **Consequence**: Sập toàn bộ cây kết xuất `<Canvas>` ngay thời điểm người chơi đạt Độc quyền đầu tiên.
    - **Hardening Directive**: Gọi `useRef`, `useMemo`, `useEffect` và `useSafeFrame` vô điều kiện ở ngay đầu hàm `MonopolyPlazaFusion` trước mọi lệnh thoát sớm, và kiểm tra `isMobile` / `monopolyGroups` bên trong thân hook.
  - **[ADV-03] Permanent Tilt (`rotation.x`), Multi-Slam Shadowing & Level-0 Monopoly Domino Trigger**:
    - **Vector**: Concurrency & Re-entrancy / Full Branch Path Trace (`ADV-BRANCH`)
    - **Scenario**: Khi tòa nhà đang nghiêng theo sóng Domino (`rotation.x !== 0`) mà nhận tiếp một slam trực tiếp hoặc kết thúc chu kỳ `wasSlammingRef.current`, nếu không reset `rotation.x` thì tòa nhà sẽ bị nghiêng vĩnh viễn; ngoài ra khi vừa mua đủ bộ Độc quyền ở `level = 0`, nếu `board_tile.tsx` không bật `showEmptyPlotBoundary` và `MonopolyPlazaFusion` không chạy `useSafeFrame` thì chỉ có nhóm rỗng vô hình chuyển động.
    - **Consequence**: Tòa nhà bị lệch trục X vĩnh viễn hoặc hiệu ứng chấn động Domino ở `level = 0` không hiển thị vật lý.
    - **Hardening Directive**: Khôi phục `rootGroupRef.current.rotation.x = lotTransform.rotation[0]` ở cả hai nhánh cập nhật, bật `showEmptyPlotBoundary={isMonopolyGroup && !isMobile}` tại `board_tile.tsx`, gắn `useSafeFrame` cho `MonopolyPlazaFusionGroup`, và loại bỏ `?? neighborDomino` trong `useSafeFrame` của `ProceduralBuilding` để ngắt ngay khi vượt TTL `900ms`.
  - **[ADV-04] React 19 `useSyncExternalStore` Selector Stability, Zero-Allocation Frame Loop & Mobile Isolation**:
    - **Vector**: Cross-Subsystem State & Performance Regression (`ADV-STATE`)
    - **Scenario**: Nếu gọi `resolveNeighborDominoSlam` trả về object literal mới bên trong selector `useVfxStore` sẽ gây vòng lặp re-render vô tận trong React 19 `useSyncExternalStore`; đồng thời nếu dùng `Object.values(activeSlams)` bên trong `useSafeFrame` sẽ cấp phát mảng mới mỗi frame trên cả 22 ô đất.
    - **Consequence**: Crash `Maximum update depth exceeded` hoặc tăng áp lực GC mỗi giây.
    - **Hardening Directive**: Cổng hóa Zustand selector theo `isMobile` và duyệt trực tiếp qua các khóa của `activeSlams` với 0 cấp phát mảng trong `resolveNeighborDominoSlam`.
  - **[ADV-05] 100% DTO Property Wiring (`cells`, `boardSide`) & Single-Fingerprint Dynamic Cache Disposal**:
    - **Vector**: Universal Iron Law #9 (100% DTO Property Wiring) & Gotcha #26 (VRAM Leak)
    - **Scenario**: Nếu các trường `cells` và `boardSide` trong `MonopolySegmentDescriptor` không được tiêu thụ tại hàm dựng hình học / JSX hoặc cache `BufferGeometry` không giải phóng bộ cũ khi `monopolyGroups` thay đổi sẽ vi phạm quy tắc `100% DTO Property Wiring` và gây rò rỉ VRAM.
    - **Consequence**: Rò rỉ bộ nhớ GPU qua các lượt mua bán/thế chấp và dư thừa trường dữ liệu chết.
    - **Hardening Directive**: Dùng `seg.cells` tạo các vạch nối đồng thau (`brassParts`) giữa các ô liền kề trong `createBatchedMonopolyPromenadeGeometries`, gắn `data-board-side={seg.boardSide}` trên `InnerPlazaGarland`, và tự động gọi `disposeBatchedMonopolyPromenadeGeometries()` mỗi khi fingerprint độc quyền thay đổi.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/client/imp401_monopoly_artdeco_archway_and_domino_shockwave.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp401_monopoly_artdeco_archway_and_domino_shockwave.test.ts)
- **Chỉ số kiểm thử**: **13 atomic tests**, **50 asserts** (mật độ trung bình: 3.85 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (Thất bại do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.
  - **Bằng chứng thất bại (Failure Snippet)**:
```text
AssertionError: expected [] to deeply equal [ [ 1 ], [ 3 ] ]
at tests/client/imp401_monopoly_artdeco_archway_and_domino_shockwave.test.ts:168:24
```

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn & tài sản 3D thay đổi**:
  - [`scripts/blender/build_monopoly_archway.py`](file:///c:/Users/HP/Documents/GitHub/vtcoon/scripts/blender/build_monopoly_archway.py) & [`public/models/landmarks/monopoly_archway_artdeco.glb`](file:///c:/Users/HP/Documents/GitHub/vtcoon/public/models/landmarks/monopoly_archway_artdeco.glb)
  - [`src/client/3d/monopoly_plaza_visuals.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/monopoly_plaza_visuals.ts)
  - [`src/client/3d/building_typology.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/building_typology.ts)
  - [`src/client/3d/procedural_building.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/procedural_building.tsx)
  - [`src/client/3d/board_tile.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_tile.tsx)
  - [`src/client/3d/monopoly_plaza_fusion.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/monopoly_plaza_fusion.tsx)
  - [`src/client/3d/board_layout.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_layout.tsx)
- **Chuyển trạng thái**: Toàn bộ **13/13 contract tests chuyển sang GREEN**.
- **Living Test Suites**: Bảo toàn nguyên vẹn (`imp65_building_scale_corner_clearance_and_regional_typologies`, `imp203_bespoke_landmarks_and_housing`, `imp378_procedural_building_mobile_lod`, `procedural_building`, `phase1_pbr_beveled`, `imp125_phase3_monopoly_plaza_fusion`, `imp374_ios_webkit_60fps_hardening`, `imp63_top_building_and_unobscured_card_title`), zero hồi quy logic hiện hành.

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
    - **Chỉ số Anti-Slop**: 0 violations trên 6 cờ cảnh báo (Deep modules, Zero pass-through wrappers, Zero TIDD, 100% DTO Property Wiring).
    - **Bộ nhớ & Timer**: Cache 1-fingerprint tự động giải phóng `.dispose()` toàn bộ `BufferGeometry` cũ khi danh sách độc quyền thay đổi hoặc khi component unmount; vòng lặp `useSafeFrame` ngắt tức thì sau `900ms` với 0 cấp phát mảng.
3. **3D Art & Spatial Critic (`game-3d-visual-critic`)**:
    - **Phán quyết**: **APPROVED 🎨**
    - Trên ảnh chụp thực tế [`imp-401_desktop.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-401_desktop.jpg) (`1280x800`, kịch bản `board_ownership_monopoly`), các cụm Hành lang Đá Cẩm Thạch phân đoạn liền kề, Cổng Vòm Art Deco `.glb` và 8 mô hình `.glb` Cấp 1 & Cấp 2 của 4 vùng địa lý (`riverine`, `resort`, `heritage`, `metropolis`) hiện diện sắc nét, đứng trọn trên thảm đá của từng cụm (kể cả cụm 1 ô `AN GIANG` và `TP. THỦ ĐỨC`); trên [`imp-401_mobile_360.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-401_mobile_360.jpg) (`360x740`), 4 biến thể Mobile LOD vùng miền hiển thị rõ nét ở 60 FPS và cô lập 100% tải `.glb`.

### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: 43/43 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived, gồm 18 AST source mutants).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs IMP-401` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-401 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `monopoly_plaza_visuals.ts` | [`src/client/3d/monopoly_plaza_visuals.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/monopoly_plaza_visuals.ts) | Tier 2 (UI/3D/Views) | **346 SLOC** | 396 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `procedural_building.tsx` | [`src/client/3d/procedural_building.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/procedural_building.tsx) | Tier 2 (UI/3D/Views) | **352 SLOC** | 382 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `building_typology.ts` | [`src/client/3d/building_typology.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/building_typology.ts) | Tier 2 (UI/3D/Views) | **96 SLOC** | 112 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `board_tile.tsx` | [`src/client/3d/board_tile.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_tile.tsx) | Tier 2 (UI/3D/Views) | **316 SLOC** | 363 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `monopoly_plaza_fusion.tsx` | [`src/client/3d/monopoly_plaza_fusion.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/monopoly_plaza_fusion.tsx) | Tier 2 (UI/3D/Views) | **153 SLOC** | 165 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `board_layout.tsx` | [`src/client/3d/board_layout.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_layout.tsx) | Tier 2 (UI/3D/Views) | **201 SLOC** | 230 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `imp401_monopoly_artdeco_archway_and_domino_shockwave.test.ts` | [`tests/client/imp401_monopoly_artdeco_archway_and_domino_shockwave.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp401_monopoly_artdeco_archway_and_domino_shockwave.test.ts) | Living Test | **441 SLOC** | 486 Lines | <= 600 LOC | ✅ Đạt chuẩn |

---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

- **Tính toàn vẹn hệ thống**: Gói cải tiến hoàn thành theo đúng nguyên tắc Zero-Blindness, cung cấp đầy đủ bằng chứng vật lý từ kịch bản nguồn Blender 5.2 LTS (`scripts/blender/build_monopoly_archway.py`), mô hình `.glb` (`public/models/landmarks/monopoly_archway_artdeco.glb` và 8 mô hình vùng miền `public/models/buildings/bld_*_c1/c2.glb`), mã nguồn `client-3d`, kiểm thử hợp đồng 13 kịch bản nguyên tử, hình ảnh trực quan 2 khung nhìn đến biên bản kiểm toán độc lập.
- **Sẵn sàng triển khai**: Mã nguồn đã sẵn sàng đóng gói và triển khai lên môi trường sản phẩm.
