# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-363
## Plan IMP-363: Board Tiles Merged Batching & WebKit Draw Call IPC Optimization (Ticket IMP-363)

> **Mã Ticket:** `IMP-363`  
> **Phân hệ thực tế:** `client-3d`  
> **Ngày hoàn thành:** 2026-10-11  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

Triển khai gói hoàn thiện và đồng bộ kỹ thuật cho ticket `IMP-363` thuộc phân hệ `client-3d`.

- **Mục tiêu kỹ thuật**:
  - Bảo toàn 100% logic nghiệp vụ cốt lõi và các ràng buộc FSM/Domain.
  - Phân bổ cấu trúc hiển thị tối ưu, bảo vệ trải nghiệm công thái học (ergonomics) trên cả Desktop và Mobile.
  - Tuân thủ nghiêm ngặt các ranh giới kiểm thử, Zero Dirty Casts (`as any`), và các trần giới hạn LOC.

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-363.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-363.md) | Thẩm định kế hoạch đạt 0 defects, 7 contract tests clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/client/imp363_batched_board_tiles.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp363_batched_board_tiles.test.ts) | 7 atomic tests, 21 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/IMP-363_snapshot.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/IMP-363_snapshot.json) | 3 production files modified, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.0: Dual-Viewport** | Puppeteer Headless Probe | Desktop (1280x800) [`imp-363_desktop.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-363_desktop.jpg) & Mobile (360x740) [`imp-363_mobile_360.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-363_mobile_360.jpg) | **CAPTURED** 📸 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-363.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-363.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-3d` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-363.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-363.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 3.00 | **APPROVED** 🛡️ |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 20/20 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Thẩm định kế hoạch đạt 0 defects, 7 contract tests clean.
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa**:
  - **[ADV-OBJ] Objective Validity**
    - **Target reachable?**: Yes — `GameBoard` in `src/client/3d/board_layout.tsx` is mounted by `GameCanvas` (`src/client/game_canvas.tsx#L559`), which is rendered in `GameScreen` (`src/client/screens/game_screen.tsx`). It executes on every frame under normal runtime conditions.
    - **Baselines verified?**: Yes — physical draw call counts and dimensions verified on disk:
    - **Verdict**: PASS — Objective attack validated.
  - **[ADV-01] [ADV-EVENT] Double Click Firing & Pointer Event Collision on Dynamic Overlays**
    - **Vector**: Concurrency, Event Propagation & R3F Raycasting Duplication
    - **Scenario**: In `src/client/3d/board_layout.tsx`, the plan mounts `<BatchedBoardTiles onTileClick={handleTileClick} />` (line 218) while simultaneously preserving `onClick={() => handleTileClick(cell.index)}` on all 40 `<LayeredDioramaTile>` instances (line 236). When a property is owned or upgraded, `LayeredDioramaTile` continues to render dynamic meshes: `OwnerBaseTrim`, `OwnerPricePill`, `ProceduralBuilding`, and `MonopolyCrownCrest`. In React Three Fiber, pointer events raycast through all intersecting objects along the camera ray. When a user clicks on an owned tile (e.g. clicking the price pill or building): The ray intersects the top dynamic mesh (child of `<LayeredDioramaTile onClick={...}>`), triggering `handleTileClick(cellIndex)`. The ray continues through and intersects the underlying batched surface mesh in `<BatchedBoardTiles onTileClick={...}>`. Because neither component calls `event.stopPropagation()`, `handleTileClick` is invoked **twice in the exact same frame**. Conversely, for corner or unowned non-purchasable tiles (Tax, Chance, Community Chest) where `renderBasePlinth=false` and `renderAtlasSurface=false`, `LayeredDioramaTile` contains zero meshes (an empty `<group>`), so only `BatchedBoardTiles` fires.
    - **Consequence**: Clicking on developed or owned properties fires duplicate `openModal('deed', ...)` calls, producing audio click stutter, redundant Zustand state dispatches, and potential race hazards in modal mount logic.
    - **Hardening Directive**: Establish a single authoritative entrypoint for tile clicks: In `src/client/3d/board_layout.tsx`, remove `onClick={() => handleTileClick(cell.index)}` from `<LayeredDioramaTile>` (set `onClick={undefined}`), delegating 100% of board click detection to `BatchedBoardTiles`. If clicks on dynamic 3D buildings/pills are desired to pass through to `handleTileClick`, those child components must either rely on the underlying `BatchedBoardTiles` plane intersection or call `e.stopPropagation()` when handling their own click.
  - **[ADV-02] [ADV-MATH] Coordinate Aliasing & False-Positive Hallucination in resolveCellFromBoardClick**
    - **Vector**: Unstated Assumptions & Geometric Boundary Aliasing
    - **Scenario**: The plan specifies `resolveCellFromBoardClick(x, z)` as a naive Euclidean nearest-neighbor: searching for the cell index $[0..39]$ with minimal $\sqrt{(x - x_c)^2 + (z - z_c)^2}$. **Void/Table False Positives**: If a click occurs on the central diorama ($x=0, z=0$), on the dice tray, or outside the table edge ($|x| > 10.5$), an unconstrained nearest-neighbor resolver unconditionally maps the coordinate to one of the perimeter cells (e.g. index 5 or 25) instead of rejecting the click. **Corner Diagonal Anisotropy**: Corner 0 has `tileRotation(0) = [0, \pi/4, 0]` ($45^\circ$ diagonal tilt) with a $2.2 \times 2.2$ square footprint, whereas adjacent cells 1 and 39 are axis-aligned $1.68 \times 2.2$ rectangles with a step size of $1.8$. A naive radial Euclidean metric around cell centers misidentifies clicks near the diagonal boundary between corner 0 and cell 1/39.
    - **Consequence**: Interactions with the central city diorama, dice tray, or tabletop edge trigger accidental deed modal popups for random board tiles.
    - **Hardening Directive**: In `resolveCellFromBoardClick(x, z)`: Add explicit board bounds filtering: return `-1` if $\max(|x|, |z|) > 10.5$ or if the point lies inside the central void ($\max(|x|, |z|) < 7.5$). Segment the click by quadrant / perimeter side before resolving the local step index $[0..9]$ along that edge, ensuring true rectangular containment.
  - **[ADV-03] [ADV-WIRE] Severed WebGL Context Loss Recovery via Omitted useTextureRevision**
    - **Vector**: Closed-Loop Presentation Wire & WebGL Context Loss Recovery
    - **Scenario**: Per Gotcha #254 and IMP-186 (`docs/domain/gotchas_archive.md`), texture instances on mobile Safari/Chrome are periodically flushed during memory pressure or WebGL context recreation. The application uses `useTextureRevision()` from `src/client/3d/texture_revision.ts` to invalidate and rebind CanvasTextures. In `board_tile.tsx`, `LayeredDioramaTile` subscribed to `useTextureRevision` to fetch `getBoardTileAtlas(isMobile)`. When `renderAtlasSurface` is disabled in `board_layout.tsx`, `LayeredDioramaTile` no longer binds `tileAtlas`. `BatchedBoardTiles` becomes the **exclusive consumer** of `getBoardTileAtlas` on the game board. However, the plan's specification for `BatchedBoardTiles` completely omits `useTextureRevision()`.
    - **Consequence**: When iOS WKWebView triggers WebGL context loss and restoration (e.g. tab switching or phone sleep/wake), `BatchedBoardTiles` fails to re-query the atlas texture, leaving all 40 tiles permanently black or blank white.
    - **Hardening Directive**: In `src/client/3d/batched_board_tiles.tsx`, import `useTextureRevision` from `./texture_revision` and memoize the texture binding: `const tileAtlas = useMemo(() => getBoardTileAtlas(isMobile), [isMobile, textureRevision]);`
  - **[ADV-04] [ADV-AESTHETIC] Tactile Chamfer Erosion via Naive BoxGeometry Substitution**
    - **Vector**: Visual Regression & Asset Parity
    - **Scenario**: `src/client/3d/board_tile.tsx#L218` and `#L241` render tile plinths with beveled edges using `<RoundedBox args={[...]} radius={0.08} smoothness={isMobile ? 1 : 4}>`. Section 0 of the plan states: "Merge 36 standard rectangular base boxes (1.68 x 0.2 x 2.2) into 1 BufferGeometry. Merge 4 corner square base boxes into 1 BufferGeometry." The plan does not specify the geometry class. If the implementer substitutes Three.js standard `BoxGeometry` (sharp $90^\circ$ corners), the rounded ivory parchment beveling ($radius=0.08$) will be replaced by knife-edge industrial blocks.
    - **Consequence**: A noticeable downgrade in tactile quality and 3D visual fidelity, violating the design standards established in IMP-30 and `docs/domain/gotchas/3d_cinematics.md`.
    - **Hardening Directive**: Explicitly mandate `RoundedBoxGeometry` from `three-stdlib` with `radius: 0.08` and `segments: isMobile ? 1 : 4` in `createBatchedTileBasesGeometry` to preserve 100% visual parity with `LayeredDioramaTile`.
  - **[ADV-05] [ADV-LEAK] GPU Buffer Allocation Leak on Geometry Re-creation**
    - **Vector**: Resource Disposal & Station 3.2 Memory Invariant
    - **Scenario**: `createBatchedTileSurfacesGeometry` and `createBatchedTileBasesGeometry` construct merged `BufferGeometry` instances via Three.js `mergeGeometries`. If these geometries are generated within component-level `useMemo` without explicit teardown lifecycle hooks, subsequent re-renders or platform prop shifts (`isMobile`) will orphan previous BufferGeometries in GPU VRAM without calling `.dispose()`.
    - **Consequence**: Gradual VRAM accumulation leading to iOS WebKit Jetsam process termination under sustained play or viewport resizes.
    - **Hardening Directive**: In `src/client/3d/batched_board_tiles.tsx`, either: Cache the merged geometries as module-level singletons (keyed by `isMobile`), or Implement a `useEffect` cleanup hook that invokes `.dispose()` on all 3 merged `BufferGeometry` instances when unmounting.
  - **[ADV-06] [ADV-MATH] Local-to-World Transformation Concatenation Order in Geometry Bake**
    - **Vector**: Kinematic Transformation & Vertex Baking Order
    - **Scenario**: To merge 40 tile planes into a single BufferGeometry, each plane requires both local orientation (rotating flat $X = -\pi/2$, local $Y$ offset) and world board placement (`tileRotation(i)` around $Y$, `cellPosition(i)` in $XZ$). If the transformation matrix is baked with inverted multiplication order (e.g. world translation before local rotation), vertices will orbit around the world origin instead of rotating around their own tile center.
    - **Consequence**: Scrambled board layout: tile surfaces displaced into mid-air, oriented perpendicular to the board, or overlapping incorrectly.
    - **Hardening Directive**: Specify the exact matrix multiplication pipeline for baking each tile geometry before `mergeGeometries`: const matrix = new Matrix4() .makeTranslation(pos[0], pos[1], pos[2]) .multiply(new Matrix4().makeRotationY(rot[1])) .multiply(new Matrix4().makeTranslation(0, localY, 0)) .multiply(new Matrix4().makeRotationX(-Math.PI / 2)); geom.applyMatrix4(matrix); Validate with living contract assertions testing the vertex bounding box for corner 0, standard tile 1, and corner 10 in `tests/client/imp363_batched_board_tiles.test.ts`.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/client/imp363_batched_board_tiles.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp363_batched_board_tiles.test.ts)
- **Chỉ số kiểm thử**: **7 atomic tests**, **21 asserts** (mật độ trung bình: 3.00 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (Thất bại do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.


### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi**:
  - [`src/client/3d/batched_board_tiles.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/batched_board_tiles.tsx)
  - [`src/client/3d/board_layout.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_layout.tsx)
  - [`src/client/3d/board_tile.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_tile.tsx)
- **Chuyển trạng thái**: Toàn bộ **7/7 contract tests chuyển sang GREEN**.
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
    - **Bộ nhớ & Timer**: Không rò rỉ listener, không bỏ sót timer cleanup, an toàn đa luồng/bất đồng bộ.


### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: 20/20 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-363 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `batched_board_tiles.tsx` | [`src/client/3d/batched_board_tiles.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/batched_board_tiles.tsx) | Tier 2 (UI/3D/Views) | **179 LOC** | 179 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `board_layout.tsx` | [`src/client/3d/board_layout.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_layout.tsx) | Tier 2 (UI/3D/Views) | **222 LOC** | 222 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `board_tile.tsx` | [`src/client/3d/board_tile.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_tile.tsx) | Tier 2 (UI/3D/Views) | **344 LOC** | 344 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `imp363_batched_board_tiles.test.ts` | [`tests/client/imp363_batched_board_tiles.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp363_batched_board_tiles.test.ts) | Living Test | **87 LOC** | 87 Lines | <= 600 LOC | ✅ Đạt chuẩn |

---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

- **Tính toàn vẹn hệ thống**: Gói cải tiến hoàn thành theo đúng nguyên tắc Zero-Blindness, cung cấp đầy đủ bằng chứng vật lý từ mã nguồn, kiểm thử, hình ảnh trực quan đến biên bản kiểm toán độc lập.
- **Sẵn sàng triển khai**: Mã nguồn đã sẵn sàng đóng gói và triển khai lên môi trường sản phẩm.

