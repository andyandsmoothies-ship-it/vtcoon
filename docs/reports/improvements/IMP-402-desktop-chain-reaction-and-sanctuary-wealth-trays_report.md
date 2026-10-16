# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-402
## Plan IMP-402: Desktop Chain-Reaction Diorama Awakening & Sanctuary Wealth Trays (Ticket IMP-402)

> **Mã Ticket:** `IMP-402`  
> **Phân hệ thực tế:** `client-3d`  
> **Ngày hoàn thành:** 2026-10-15  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

Trước Ticket `IMP-402`, 4 Bán Đảo Vinh Danh ngoài vịnh (`sanctuary-west-north`, `sanctuary-west-south`, `sanctuary-north-east`, `sanctuary-southwest` tạo dựng ở `IMP-399`) mới chỉ trưng bày tượng đài linh vật trung tâm (`.glb`) trên bệ đá cẩm thạch mà chưa phản ánh trực quan quy mô tài sản ròng (`Net Worth`: tiền mặt + bất động sản + công trình nâng cấp trừ nợ thế chấp) của từng tỷ phú ngay trên mặt bàn cờ 3D. Đồng thời, khu vực trung tâm đại đô thị (`MiniatureCityDiorama`) chưa có cơ chế phản ứng dây chuyền 5 nhịp (Chain-Reaction Awakening) làm nảy trực tiếp các công trình biểu tượng 3D khi người chơi click tương tác hoặc khi phát sinh biến động kinh tế lớn (mua đất, nâng cấp nhà/khách sạn, chốt lời sàn HOSE).

Ticket **IMP-402** giải quyết triệt để bài toán trên thông qua 4 cơ chế kỹ thuật và thị giác cốt lõi:
1. **Điêu khắc 4 Cấp độ Khay Tài Sản Vàng 999.9 & Sổ Đỏ bằng Blender 5.2 LTS (`public/models/landmarks/wealth_tray_tier1..4.glb`) & Khóa Hộp Bao Va Chạm Thực (True Scaled & Rotated AABB)**:
   - Xây dựng script [`scripts/blender/build_wealth_trays.py`](file:///c:/Users/HP/Documents/GitHub/vtcoon/scripts/blender/build_wealth_trays.py) chạy headless qua Blender 5.2.2 LTS (`bmesh` + `Boolean Modifier` khoét lòng khay + `Bevel Modifier` 3 phân đoạn + `Weighted Normals` + 8 vật liệu PBR: đá cẩm thạch Carrara `#F8FAFC`, gỗ óc chó `#2B1D14`, đồng thau `#F59E0B`, nhung đỏ thẫm `#BE123C`, vàng 999.9 `#FBBF24`, bìa Sổ Đỏ Đông Dương `#DC2626`, tiền polymer `#0EA5E9` và vương miện phát sáng `#FDE047`).
   - Thiết kế cấu trúc 2 tầng (`WEALTH_TRAY_BASE_DIMENSIONS = { width: 0.36, height: 0.44, depth: 0.48 }`) đặt tại thềm trước `apronOffset = [0.88, 0.23]` (`worldPosition = [cx + 0.88, -0.24, cz + 0.23]`) với `trayScale = [1.10, 1.35, 1.10]` và góc xoay `rotationY = -0.15 rad`. Hộp bao va chạm thực sau khi nhân `trayScale` và xoay góc (`scaledHalfW = 0.198m`, `scaledHalfD = 0.264m` $\rightarrow$ `halfW = 0.2352m`, `halfD = 0.2906m`, `topY = -0.24 + 0.44 * 1.35 = +0.354m`) bảo đảm khay cao vượt mặt sàn gỗ (`-0.11m`) và mặt bệ tượng (`+0.08m`), đồng thời tách rời hoàn toàn khỏi bệ đá cẩm thạch trung tâm (`aabbMinX = cx + 0.6448m >= cx + 0.64m > pedestalMaxX = cx + 0.62m`), cách toàn bộ 20 cây dừa `>= 0.559m >= 0.55m` và nằm gọn trong bán kính đảo cát (`maxRadialExtent = 1.2307m < 1.24m`).
2. **Liên kết Poka-Yoke Tài Sản Ròng (`resolvePlayerWealthTier` & `getSanctuaryWealthTrayDescriptors`)**:
   - Dẫn xuất 100% từ hàm chuẩn [`calculatePlayerNetWorth`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/ui_helpers.ts#L52-L69) với ngưỡng phân tầng `WEALTH_TRAY_TIER_THRESHOLDS = { tier2: 10000, tier3: 12000, tier4: 30000 }`. Trong kịch bản `board_ownership_monopoly.js`, 4 tỷ phú `p1..p4` (`netWorth = 4400, 10800, 12000, 91750`) ánh xạ tự nhiên sang đủ 4 cấp độ `Tier 1, 2, 3, 4` mà không cần bất kỳ nhánh rẽ nhân tạo nào. Khi người chơi phá sản (`bankrupt` hoặc `isBankrupt`), khay tài sản tự động thu hồi (`tier = 0, modelUrl = null`).
3. **Chuỗi Đánh Thức Đô Thị 5 Nhịp Nối Trực Tiếp Công Trình 3D & Zero-Allocation In-Place (`evaluateDioramaChainReaction` & `DioramaChainReactionFrameLoop`)**:
   - Kích hoạt tuần tự 5 điểm nhấn trung tâm bàn cờ cách nhau `180ms` (`saigon-river-cruiser` `0ms` $\rightarrow$ `metro-line-station` `180ms` $\rightarrow$ `bitexco-tower` `360ms` $\rightarrow$ `bason-bridge` `540ms` $\rightarrow$ `notre-dame-cathedral` `720ms`) khi click mặt phẳng `UnifiedToyboxHitPlane` (`14.4m × 14.4m`, chặn xuyên thấu sự kiện bằng `e.stopPropagation()`) hoặc khi chữ ký `computeEconomicAwakeningSignature` thay đổi.
   - Sử dụng bộ đệm `createScratchChainReactionSnapshot()` cập nhật tại chỗ (`0` cấp phát mảng/object mỗi frame trong `useSafeFrame`), nối trực tiếp vào 5 nhóm công trình 3D trung tâm (`ChainLandmark_*` trong `src/client/3d/miniature_city_diorama.tsx`) để làm nảy thực tế cả công trình (`position.y = st.yOffset`, `scale.y = 1 + st.yOffset * 0.75`) lẫn vòng sóng, và tự động thu hồi qua Dead Man's Switch (`CHAIN_REACTION_TTL_MS = 2800ms <= 3000ms`, đặt `ring.visible = false`, `landmark.position.y = 0`, `landmark.scale = [1, 1, 1]`).
4. **Cô lập Tuyệt đối Hiệu năng Mobile (`isMobile === true`)**:
   - Trên thiết bị di động (`360x740`), cả `ToyboxWealthTrayLayer` và `DioramaChainReaction` đều ngắt mạch sớm (`0` lượt tải `.glb`, `0` mesh mặt phẳng raycast, `0` đăng ký `useSafeFrame` nhờ tách `DioramaChainReactionFrameLoop` thành component con chỉ mount khi `!isMobile`).

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-402.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-402.md) | Thẩm định kế hoạch đạt 0 defects, 4 contract tests clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/client/imp402_desktop_chain_reaction_and_wealth_trays.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp402_desktop_chain_reaction_and_wealth_trays.test.ts) | 12 atomic tests, 48 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/IMP-402_snapshot.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/IMP-402_snapshot.json) | 5 production files modified, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.0: Dual-Viewport** | Puppeteer Headless Probe | Desktop (1280x800) [`imp-402_desktop.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-402_desktop.jpg) & Mobile (360x740) [`imp-402_mobile_360.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-402_mobile_360.jpg) | **CAPTURED** 📸 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-402.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-402.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-3d` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-402.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-402.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 4.00 | **APPROVED** 🛡️ |
| **Trạm 3.2: UI/UX Craft Review** | `ui-craft-reviewer`<br>[`.agents/audit/3D_VISUAL_REVIEW_IMP-402.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/3D_VISUAL_REVIEW_IMP-402.md) | Công thái học touch target, khoảng cách an toàn (clearance), không tràn viền màn hình 360px | **9.5 / 10 (3D AAA Verified) 🎨** |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 34/34 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Thẩm định kế hoạch đạt 0 defects, 4 cụm hợp đồng cốt lõi (`TC-402.01..04`) khóa chặt toán học không gian 3D và hiệu năng.
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa**:
  - **[ADV-OBJ] Objective Validity**
    - **Target reachable?**: Yes — `CoastalIslandEnvironment` (`CornerTycoonSanctuaries`) is mounted in `src/client/3d/board_layout.tsx#L160` (`src/client/3d/coastal_island_environment.tsx#L259`), and `MiniatureCityDiorama` is mounted in `src/client/3d/board_layout.tsx#L174` (`src/client/3d/miniature_city_diorama.tsx#L318`). Both execute on Desktop (`isMobile === false`).
    - **Baselines verified?**: `src/client/3d/coastal_island_environment.tsx`: 277 lines — verified. `src/client/3d/miniature_city_diorama.tsx`: 366 lines (living test ceiling `<= 400` in `tests/contracts/imp197_diorama_ground_modernization.test.ts#L214-L218`) — verified. Sanctuary coordinates (`[-12.4, -0.28, 1.6]`, `[-12.3, -0.28, 6.2]`, `[-0.5, -0.28, -12.0]`, `[-1.2, -0.28, 12.6]`), `baseRadius = 1.24`, `pedestalWidth = 1.24` (`pedestalRadius = 0.62`), `baseTopY = -0.22`, `rimTopY = -0.17`, and `PALM_OFFSETS` (`[0.98, -0.32]`, `[0.28, -0.98]`, `[-0.32, 0.98]`, `[-0.98, 0.28]`) — verified against `src/client/3d/coastal_sanctuary_visuals.ts#L142-L193`. Authoritative net worth helper `calculatePlayerNetWorth` — verified against `src/client/ui/ui_helpers.ts#L52-L69`.
    - **Verdict**: PASS (Objective target is live and spatial baselines are grounded).
  - **[ADV-01] [ADV-REG] Unconditional `SafeGLTFModel.preload` in `ToyboxWealthTrayLayer` Breaks Living Contract `TC-399.06b`**
    - **Vector**: Living Test Collision & Contract Regression (`ADV-REG`)
    - **Scenario**: In `tests/client/imp399_bay_archipelago_and_mobile_city_silhouette.test.ts#L244-L249` (`TC-399.06b`), `CoastalIslandEnvironment` renders with `playersInfo: {}` and asserts `preloadedUrls` equals the 4 sanctuary pawn `.glb` URLs.
    - **Consequence**: Unconditionally preloading `/models/landmarks/wealth_tray_tier1..4.glb` when `playersInfo` is `{}` pollutes `preloadedUrls` with 8 URLs instead of 4 and breaks `TC-399.06b`.
    - **Hardening Directive**: In `src/client/3d/toybox_wealth_tray_layer.tsx`, short-circuit `useMemo` to `null` when `isMobile` is `true` or `effectivePlayers` has `0` keys before calling `SafeGLTFModel.preload`, while keeping `getSanctuaryWealthTrayDescriptors()` returning 4 default `tier = 1` descriptors.
  - **[ADV-02] [ADV-WIRE] Non-Existent `s.lastHoseResult` on `GameState` Causes `tsc --noEmit` Failure & Dead HOSE Awakening Wire**
    - **Vector**: Closed-Loop Presentation Wire (`ADV-WIRE`)
    - **Scenario**: Physical inspection of `src/client/store/game_store_state_types.ts#L18-L120` confirms `lastHoseResult` does not exist directly on `GameState`; HOSE payouts are stored in `state.modalPayload` (`activeModal === 'hose'`) and `state.floatingTexts` (`actionType: 'hose'`).
    - **Consequence**: Selecting `s.lastHoseResult` fails `tsc --noEmit` in `npm run prefilter` with `TS2339` and leaves the HOSE awakening wire permanently `undefined` at runtime.
    - **Hardening Directive**: In `src/client/3d/diorama_chain_reaction.tsx`, derive the HOSE awakening tuple from `s.activeModal === 'hose'` + `s.modalPayload` and the latest `s.floatingTexts` entry with `actionType === 'hose'`, plus optional `lastHoseTuple` prop injection.
  - **[ADV-03] [ADV-STATE] `DioramaChainReaction` Must Mutate In-Place, Bounce 5 Central Landmarks, and Auto-Hide (`ring.visible = false`) on `2800ms` TTL Expiry**
    - **Vector**: Partial Failure / Trapped States & Frame-Loop Allocation Guard (`ADV-STATE`)
    - **Scenario**: During `capture_visual_evidence.mjs --wait 8000`, `DioramaChainReaction` triggers at $t = 0\text{ms}$ and expires at $t = 2800\text{ms}$ (`CHAIN_REACTION_TTL_MS = 2800`). Allocating arrays via `.map()` in `useSafeFrame` creates GC churn, and leaving `ring.visible = true` or decoupling the 5 landmark meshes degrades visual craft.
    - **Consequence**: Floating primitive rings at `--wait 8000` visually pollute the central city diorama, while uncoupled landmarks remain static during chain-reaction triggers.
    - **Hardening Directive**: Provide `createScratchChainReactionSnapshot()` for zero-allocation in-place `evaluateDioramaChainReaction(elapsedMs, 2800, outSnapshot)` updates, couple `landmarkGroupRefs` (`ChainLandmark_*`) to bounce `position.y` and `scale.y`, and reset `ring.visible = false` and landmark transforms on `2800ms` expiry.
  - **[ADV-04] Mobile `useSafeFrame` Registration in `DioramaChainReaction` Violates `IMP-383`/`IMP-385` Headless Child FrameLoop Invariant**
    - **Vector**: Unstated Assumptions & Subsystem Drift
    - **Scenario**: Calling `useSafeFrame` directly inside `DioramaChainReaction` before `if (isMobile) return null;` still registers a frame-loop subscriber in `sharedR3FHarness` when rendered with `isMobile: true`.
    - **Consequence**: Violates the `IMP-383`/`IMP-385` Headless Child FrameLoop Invariant in `docs/FEATURE_MAP.md` Pillar 13 requiring `0` `useSafeFrame` registrations on Mobile.
    - **Hardening Directive**: In `src/client/3d/diorama_chain_reaction.tsx`, isolate `useSafeFrame` inside a headless child component `DioramaChainReactionFrameLoop` mounted exclusively inside the `!isMobile` branch so Mobile registers `0` subscribers.
  - **[ADV-05] [ADV-BRANCH] True Scaled & Rotated AABB Math, Poka-Yoke Net Worth Thresholds (`10000 / 12000 / 30000`), Dual Bankruptcy Flags & Raycast Isolation**
    - **Vector**: Full Branch Path Trace (`ADV-BRANCH`) & Spatial AABB Integrity
    - **Scenario**: Computing `halfW` and `halfD` without multiplying `trayScale` and applying `rotationY` causes the physical 3D mesh to overlap the `0.62m` marble pedestal; uncalibrated net worth thresholds or single-field bankruptcy checks misrepresent `board_ownership_monopoly.js` players.
    - **Consequence**: Unscaled AABB math allows physical mesh clipping into the central marble pedestal, while unstopped click events on `UnifiedToyboxHitPlane` double-fire `SoundEngine.playWaterRipple()`.
    - **Hardening Directive**: Set `apronOffset = [0.88, 0.23]`, `trayScale = [1.10, 1.35, 1.10]`, `rotationY = -0.15`, compute true scaled/rotated `halfW = 0.2352m` and `halfD = 0.2906m` (`aabbMinX = cx + 0.6448m > cx + 0.62m`), export `WEALTH_TRAY_TIER_THRESHOLDS = { tier2: 10000, tier3: 12000, tier4: 30000 }`, check `Boolean(player.bankrupt || player.isBankrupt)`, and call `e?.stopPropagation?.()`.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/client/imp402_desktop_chain_reaction_and_wealth_trays.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp402_desktop_chain_reaction_and_wealth_trays.test.ts)
- **Chỉ số kiểm thử**: **12 atomic tests**, **48 asserts** (mật độ trung bình: 4.00 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (Thất bại do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.
  - **Bằng chứng thất bại (Failure Snippet)**:
```text
AssertionError: expected [ +0, +0 ] to deeply equal [ 3300, 2 ]
at tests/client/imp402_desktop_chain_reaction_and_wealth_trays.test.ts:144:48
```

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn & tài nguyên 3D thay đổi**:
  - [`scripts/blender/build_wealth_trays.py`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/blender/build_wealth_trays.py) & 4 tệp `.glb` điêu khắc bằng Blender 5.2.2 LTS (`public/models/landmarks/wealth_tray_tier1..4.glb`, dung lượng `20.6KB..31.9KB`, `784..1,304 tris`)
  - [`src/client/3d/toybox_wealth_tray_visuals.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/toybox_wealth_tray_visuals.ts)
  - [`src/client/3d/toybox_wealth_tray_layer.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/toybox_wealth_tray_layer.tsx)
  - [`src/client/3d/diorama_chain_reaction.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama_chain_reaction.tsx)
  - [`src/client/3d/coastal_island_environment.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_island_environment.tsx)
  - [`src/client/3d/miniature_city_diorama.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx)
- **Chuyển trạng thái**: Toàn bộ **12/12 contract tests chuyển sang GREEN**.
- **Living Test Suites**: Bảo toàn nguyên vẹn `imp399`, `dense_metropolis_architecture`, `imp197`, zero hồi quy logic hiện hành.

### Trạm 2.5: Fast Pre-Filter Mechanical Sweep (`scout` / `fast_prefilter.mjs`)
- **TypeScript**: `tsc --noEmit` vượt qua với 0 lỗi (Exit Code 0).
- **Dirty Casts**: Tuyệt đối không sử dụng `as any` hoặc dirty type casting.
- **LOC Ceilings**: Tất cả các tệp đều nằm trong hạn mức trần của từng phân hệ (`coastal_island_environment.tsx`: 277 dòng <= 278; `miniature_city_diorama.tsx`: 366 dòng <= 371; Tier 2 <= 500; Living Test <= 600).

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
1. **Spec & Scope Gatekeeper (`spec-reviewer`)**:
    - **Phán quyết**: **APPROVED** 📋 ([`.agents/audit/SPEC_REVIEW_IMP-402.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-402.md))
    - **Xác nhận phạm vi**: 100% các thay đổi nằm trong danh sách tệp của kế hoạch (`check_scope.mjs` Exit 0), cập nhật đầy đủ `docs/FEATURE_MAP.md`.
2. **Deep Architecture & Anti-Slop Auditor (`code-reviewer`)**:
    - **Phán quyết**: **APPROVED** 🛡️ ([`.agents/audit/CODE_REVIEW_IMP-402.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-402.md))
    - **Chỉ số Anti-Slop**: 0 vi phạm trên 6 cờ cảnh báo; tách biệt hoàn toàn toán học thuần túy (`toybox_wealth_tray_visuals.ts`) khỏi tầng R3F JSX (`toybox_wealth_tray_layer.tsx`, `diorama_chain_reaction.tsx`).
    - **Bộ nhớ & Timer**: Cơ chế ghi tại chỗ `createScratchChainReactionSnapshot()` đảm bảo `0` cấp phát mảng/object mỗi frame trong `useSafeFrame`, và Dead Man's Switch `2800ms` tự động giải phóng vòng sóng lẫn trả 5 công trình 3D về vị trí cân bằng sau khi hết chu kỳ.
3. **UI/UX Craft & 3D Visual Critic (`game-3d-visual-critic`)**:
    - **Phán quyết**: **9.5 / 10 (3D AAA Verified) 🎨** ([`.agents/audit/3D_VISUAL_REVIEW_IMP-402.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/3D_VISUAL_REVIEW_IMP-402.md))
    - **Kiểm chứng thị giác**: Trên ảnh [`imp-402_desktop.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-402_desktop.jpg), cả 4 khay tài sản cấp độ 1..4 nổi bật rõ nét với bệ đá trắng Carrara, viền đồng thau, đệm nhung đỏ, thỏi vàng 999.9 và Sổ Đỏ trên thềm trước `[cx + 0.88, -0.24, cz + 0.23]` của 4 bán đảo, có khoảng hở sàn gỗ óc chó tách biệt rõ ràng với trụ đá cẩm thạch trung tâm (`aabbMinX = cx + 0.6448m > cx + 0.62m`), không va chạm hàng dừa (`>= 0.559m`), không bị che khuất bởi `ActionDock`, và lòng bàn cờ trung tâm hoàn toàn sạch sẽ. Trên [`imp-402_mobile_360.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-402_mobile_360.jpg), khung hình di động bảo toàn 100% hiệu năng.

### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: **34/34 mutants mục tiêu bị tiêu diệt** (`17/17` AST source mutants trong `scripts/sentinel_probes/IMP-402.json` + `17/17` runtime harnesses, kill rate: **100%**, `0` survived).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs IMP-402` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-402 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `toybox_wealth_tray_visuals.ts` | [`src/client/3d/toybox_wealth_tray_visuals.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/toybox_wealth_tray_visuals.ts) | Tier 2 (UI/3D/Views) | **285 SLOC** | 305 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `toybox_wealth_tray_layer.tsx` | [`src/client/3d/toybox_wealth_tray_layer.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/toybox_wealth_tray_layer.tsx) | Tier 2 (UI/3D/Views) | **55 SLOC** | 60 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `diorama_chain_reaction.tsx` | [`src/client/3d/diorama_chain_reaction.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama_chain_reaction.tsx) | Tier 2 (UI/3D/Views) | **174 SLOC** | 189 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `coastal_island_environment.tsx` | [`src/client/3d/coastal_island_environment.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_island_environment.tsx) | Tier 2 (UI/3D/Views) | **254 SLOC** | 277 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `miniature_city_diorama.tsx` | [`src/client/3d/miniature_city_diorama.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx) | Tier 2 (UI/3D/Views) | **337 SLOC** | 366 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `imp402_desktop_chain_reaction_and_wealth_trays.test.ts` | [`tests/client/imp402_desktop_chain_reaction_and_wealth_trays.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp402_desktop_chain_reaction_and_wealth_trays.test.ts) | Living Test | **444 SLOC** | 484 Lines | <= 600 LOC | ✅ Đạt chuẩn |

---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

- **Tính toàn vẹn hệ thống**: Ticket `IMP-402` đã hoàn tất trọn vẹn quy trình 4 trạm khép kín, khóa chặt toàn bộ toán học AABB thực sau khi nhân `trayScale = [1.10, 1.35, 1.10]` và xoay `rotationY = -0.15 rad` tại `[cx + 0.88, -0.24, cz + 0.23]` (`topY = +0.354m`, `aabbMinX = cx + 0.6448m > cx + 0.62m`), cơ chế ghi tại chỗ không cấp phát bộ nhớ `createScratchChainReactionSnapshot()`, kết nối trực tiếp làm nảy 5 nhóm công trình 3D trung tâm (`ChainLandmark_*`) và tự động ẩn vòng sóng sau `2800ms`.
- **Sẵn sàng triển khai**: Toàn bộ mã nguồn, tài nguyên `.glb` điêu khắc từ Blender 5.2.2 LTS, bộ kiểm thử hợp đồng và biên bản kiểm toán đã sẵn sàng trên nhánh sản phẩm.
