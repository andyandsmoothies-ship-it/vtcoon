# Lean Plan: IMP-428 Desktop Diorama Lean Architecture & Dong Son Medallion Anti-Clipping

> **Ticket:** `IMP-428`  
> **Classification:** Tier 2 3D Scene Composition & Performance Architecture  
> **Subsystem Boundaries:** `src/client/3d/`, `tests/client/`  
> **Roadmap Alignment (Option 1: Cause-First Execution):**
> - **`IMP-428` (Current Slice):** Desktop Diorama Lean Architecture & Dong Son Medallion Anti-Clipping (Cắt 2,500 draw calls rác sa bàn, thay đài phun nước bằng đĩa Trống Đồng PBR phẳng lặng giải phóng xúc xắc, nâng thẩm mỹ từ 5/10 lên 7.8/10).
> - **`IMP-429` (Next Slice):** Desktop 60FPS Rescue & Hysteresis Cooling (PostProcessingPipeline, Mipmap Bloom, AGX ToneMapping, Hysteresis FSM bền vững khi FPS >= 55, xóa sạch cạm bẫy Permanent Low-Tier Lock).
> - **`IMP-430` (Final Slice):** Desktop Glass & Brass Tycoon HUD Overhaul (Đưa UI chạm mốc 9.5/10).

---

## 1. Principles Applied

- **[Spatial AABB / Non-Occlusion]** -> Replace high fountain/spire ($Y = 0.65\text{m}$, $R = 0.90\text{m}$) with flat Dong Son Medallion ($Y \in [0.02, 0.04]\text{m}$, $R = 1.25\text{m}$), providing $\ge 0.20\text{m}$ vertical clearance under resting dice at $Y = 0.26\text{m}$ and eliminating dice submersion/clipping bugs.
- **[Living Test Protection & Seam Discipline]** -> Default `isDesktopLean = false` in `MiniatureCityDiorama` and `CentralMonumentPlaza`, guaranteeing 100% PASS for existing living tests (`urban_density_and_craft.test.ts`, `urban_diorama_redesign.test.ts`). Strictly preserve `WALNUT_TABLE_Y = -0.350` and `DEPTH_LAYER_STACK.WALNUT_TABLE_Y = -0.350`.
- **[100% DTO & Call-Site Wiring]** -> Wire `isDesktopLean={!isMobile}` at `board_layout.tsx#L190`. Maintain empty `<group ref={...}>` dummy anchors for `landmarkGroupRefs.current[0..4]` when diorama clusters are skipped, preventing `TypeError` crashes in `DioramaChainReaction`.
- **[Resource Disposal & Cache Hygiene]** -> Implement `createDongSonPlazaTexture()` with strict SSR guard (`typeof document === 'undefined' ? null : ...`) and singleton texture cache to prevent WebGL context memory leaks.

---

## 2. Target Files & Honest LOC Accounting

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/miniature_city_diorama.tsx` | Tier 2 3D Scene View | 329 | 385 | +56 | 500 | Safe (Desktop lean culling, Dong Son medallion, dummy anchors) |
| `src/client/3d/tabletop_texture_generator.ts` | Tier 1 Pure Texture Helper | 139 | 215 | +76 | 400 | Safe (Dong Son PBR Canvas generator + SSR guard) |
| `src/client/3d/board_layout.tsx` | Tier 2 3D Scene Assembly | 257 | 260 | +3 | 500 | Safe (Wire isDesktopLean={!isMobile}; protect WALNUT_TABLE_Y) |
| `tests/client/imp428_desktop_diorama_lean_and_dong_son.test.ts` | Living Test (New) | 0 | 210 | +210 | 600 | Safe (Contract test suite) |

---

## 3. Core Contract Invariants & Architectural Seams

1. **[INV-428.01: Living Test Contract Seam & Default Props Discipline]**:
   - `MiniatureCityDioramaProps` and `CentralMonumentPlazaProps` expose `readonly isDesktopLean?: boolean`.
   - Default value is `false` (`isDesktopLean = false`). Living tests invoking without props continue to render full diorama and fountain/spire.
   - `WALNUT_TABLE_Y = -0.350` and `DEPTH_LAYER_STACK.WALNUT_TABLE_Y = -0.350` in `board_layout.tsx` remain immutable.

2. **[INV-428.02: Dong Son Bronze Medallion Anti-Clipping Geometry]**:
   - In `CentralMonumentPlaza`, when `isDesktopLean = true`:
     - Renders flat Dong Son Bronze Medallion plinth ($Y \in [0.02, 0.04]\text{m}$, radius $R \approx 1.25\text{m}$, metalness $0.85$, roughness $0.25$, antique bronze `#8C6239` & gold `#D4AF37` highlights).
     - Suppresses central fountain spire ($Y < 0.06\text{m}$ max vertical extent), leaving $\ge 0.20\text{m}$ clearance beneath `DICE_REST_Y = 0.26\text{m}` for `DiceTray` resting coordinates $[ \pm 0.55, 0.26, 0 ]$.

3. **[INV-428.03: Desktop Lean Cluster Freezing & Dummy Anchor Protection]**:
   - In `MiniatureCityDiorama`, when `isDesktopLean = true`:
     - Skips rendering heavy clusters: `DioramaModelRailroad`, `DioramaWaterfrontStation`, `DioramaLandmarkNorthStation`, `DioramaCivicCenter`, `DioramaWaterfrontPark`, `DioramaHighriseBlocks`, `DioramaResidentialPool`, `DioramaShophouseBlocks`, `DioramaTraffic`, `DioramaMicroLife`.
     - Mounts empty dummy `<group name="..." ref={(el) => { landmarkGroupRefs.current[idx] = el; }} />` anchors for indices $0, 1, 2, 3, 4$ so `DioramaChainReaction` accesses valid non-null coordinates.

4. **[INV-428.04: Dong Son Texture Generation & SSR Guard]**:
   - Target physical file: `src/client/3d/tabletop_texture_generator.ts`
   ```typescript
   export function createDongSonPlazaTexture(): THREE.CanvasTexture | null {
     if (typeof document === 'undefined') return null;
     if (cachedDongSonTexture) return cachedDongSonTexture;
     // Canvas 2D Sunburst (14 rays), concentric rings & bird motifs
     // return cached THREE.CanvasTexture
   }
   ```

### Call-Site Wiring in `src/client/3d/board_layout.tsx`
`board_layout.tsx#L190` passes `<MiniatureCityDiorama isMobile={isMobile} isDesktopLean={!isMobile} isVisible={isCityVisible} />`.

---

## 4. Contract Test Scenarios (Station 2 Specification)

- **TC-428.01 [UC-DIORAMA-DEFAULT-PROPS-PRESERVATION/MSS]**: Given MiniatureCityDiorama and CentralMonumentPlaza rendered with default props, When verifying tree structure, Then renders legacy fountain, spire, and all diorama clusters without regressions.
- **TC-428.02 [UC-DONG-SON-MEDALLION-DESKTOP-ACTIVATION/MSS]**: Given CentralMonumentPlaza rendered with isDesktopLean = true, When inspecting children, Then mounts Dong Son bronze disc at Y in [0.02, 0.04] and suppresses fountain spire (height < 0.06).
- **TC-428.03 [UC-DICE-LANDING-VERTICAL-CLEARANCE/MSS]**: Given DiceTray resting height at DICE_REST_Y = 0.26 and CentralMonumentPlaza at isDesktopLean = true, When evaluating vertical clearance, Then clearance is >= 0.20m with zero AABB intersection.
- **TC-428.04 [UC-CHAIN-REACTION-DUMMY-ANCHORS-INTEGRITY/MSS]**: Given MiniatureCityDiorama rendered with isDesktopLean = true, When inspecting landmarkGroupRefs, Then mounts non-null group anchors for indices 0 through 4.
- **TC-428.05 [UC-TEXTURE-GENERATOR-SSR-SAFETY/MSS]**: Given createDongSonPlazaTexture invoked in headless/SSR environment where document is undefined, When evaluating return, Then returns null safely without throwing exceptions.
- **TC-428.06 [UC-TEXTURE-GENERATOR-SINGLETON-CACHE/MSS]**: Given createDongSonPlazaTexture invoked repeatedly with mock document, When evaluating instances, Then returns the identical cached CanvasTexture singleton instance.
- **TC-428.07 [UC-BOARD-LAYOUT-CALL-SITE-WIRING/MSS]**: Given BoardLayout rendered with isMobile = false, When inspecting MiniatureCityDiorama props, Then passes isDesktopLean = true.
- **TC-428.08 [UC-WALNUT-TABLE-DEPTH-IMMUTABILITY/MSS]**: Given board_layout.tsx constants, When inspecting WALNUT_TABLE_Y and DEPTH_LAYER_STACK.WALNUT_TABLE_Y, Then values remain strictly equal to -0.350.

---

## 5. Definition of Done (DoD)

- [ ] Plan audited and signed via `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_428_DESKTOP_DIORAMA_LEAN_AND_DONG_SON.md --auto-sign`.
- [ ] Adversarial challenge brief filed and signed in `.agents/audit/PLAN_CHALLENGE_IMP-428.md`.
- [ ] Station 2: `tests/client/imp428_desktop_diorama_lean_and_dong_son.test.ts` authored (Semantic RED).
- [ ] Station 2.5: Implementation complete in `src/client/3d/miniature_city_diorama.tsx`, `src/client/3d/tabletop_texture_generator.ts`, `src/client/3d/board_layout.tsx` (All tests GREEN).
- [ ] Mechanical prefilter passes: `npm run prefilter -- src/client/3d/miniature_city_diorama.tsx src/client/3d/tabletop_texture_generator.ts src/client/3d/board_layout.tsx tests/client/imp428_desktop_diorama_lean_and_dong_son.test.ts`.
- [ ] Living test suites pass 100% without regression (`urban_density_and_craft.test.ts`, `urban_diorama_redesign.test.ts`, `executive_tabletop_coastal_diorama.test.ts`, `imp356_android_depth_and_dice_landing.test.ts`).
- [ ] Visual capture executed via `node scripts/capture_visual_evidence.mjs --ticket IMP-428`.
- [ ] Chaos sentinel passes: `npm run sentinel -- --ticket IMP-428 --test tests/client/imp428_desktop_diorama_lean_and_dong_son.test.ts`.
- [ ] Comprehensive evidence verified via `node scripts/check_evidence.mjs IMP-428`.
