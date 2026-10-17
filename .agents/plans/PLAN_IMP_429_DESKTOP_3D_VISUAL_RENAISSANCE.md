# Lean Plan: IMP-429 Desktop 3D Visual Renaissance — Hero Landmarks & Imperial Emerald Dong Son Plaza

> **Ticket:** `IMP-429`  
> **Classification:** Tier 2 3D Scene Composition & Visual Craft Architecture  
> **Subsystem Boundaries:** `src/client/3d/`, `tests/client/`  
> **Roadmap Alignment (Cause-First 3D Overhaul):**
> - **`IMP-428` (Completed):** Desktop Diorama Lean Architecture & Dong Son Medallion Anti-Clipping (Rescued FPS from 4 to 59 FPS, 14ms).
> - **`IMP-429` (Current Slice):** Desktop 3D Visual Renaissance — Hero Landmarks & Imperial Emerald Dong Son Plaza (Restore Ba Son Bridge, Bitexco Tower, Moored Harbor Cruiser, Notre Dame Heritage District; upgrade Dong Son Medallion to Imperial Emerald & Balanced Gold Specular; fix Ghost Chain Reaction; elevate visual score to 8.0-8.5/10 while locking 58-60 FPS).
> - **`IMP-430` (Next Slice):** Desktop Glass & Brass Tycoon HUD Overhaul (Eliminate 112 empty dots, streamline PlayerHudList, adjust +2000 cashflow badge, completing the leap to 9.5/10).

---

## 1. Principles Applied

- **[Spatial AABB / Non-Occlusion]** -> Moor `DioramaHarborCruiser` at Marina Berth $Z = 2.2\text{m}$ ($|Z| = 2.2 > 1.58\text{m}$ plinth radius) with bobbing motion, eliminating all collision with the central Dong Son plinth and resting dice ($Z \in [-1.2, 1.2]$) while synchronizing 1:1 with Stage 0 chain reaction shockwave.
- **[100% DTO & Call-Site Wiring]** -> Wire physical hero landmark components into `landmarkGroupRefs.current[0..4]` (`[0]` cruiser, `[2]` Bitexco, `[3]` Ba Son bridge, `[4]` Notre Dame & Ben Thanh market), eliminating "Ghost Chain Reaction" detonations over empty grass.
- **[Specular Bloom & Lighting Guard]** -> Balance medallion material properties with `metalness: 0.85`, `roughness: 0.24` and dark emerald radial gradient (`#064E3B` to `#022C22`) to prevent specular glare whiteout under direct directional sunlight.
- **[Living Test Protection & Seam Discipline]** -> In `CentralMonumentPlaza`, retain SSR fallback `color={dongSonTexture ? '#FFFFFF' : '#8C6239'}` and ring color `#D4AF37`, preserving 100% assertions of TC-428.02 (`toContain('#8C6239')` and `not.toContain('#F59E0B')`).
- **[View-Model Seam Extraction]** -> Pure 2D canvas texture generation for the Imperial Emerald & Gold motif remains encapsulated in `tabletop_texture_generator.ts`, isolated from Three.js frame loops.

---

## 2. Target Files & Honest LOC Accounting

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/miniature_city_diorama.tsx` | Tier 2 3D Scene View | 371 | 390 | +19 | 500 | Safe (Restore 4 hero landmarks, expand plinth, wire anchors) |
| `src/client/3d/tabletop_texture_generator.ts` | Tier 1 Pure Texture Helper | 229 | 265 | +36 | 400 | Safe (Imperial emerald & balanced gold specular texture generator) |
| `src/client/3d/diorama/diorama_harbor_cruiser.tsx` | Tier 2 3D Sub-Scene | 106 | 120 | +14 | 500 | Safe (Moored berth mode at Z=2.2m for zero plinth clipping) |
| `tests/client/imp429_desktop_3d_visual_renaissance.test.ts` | Living Test (New) | 0 | 250 | +250 | 600 | Safe (Contract test suite) |

---

## 3. Core Contract Invariants & Architectural Seams

1. **[INV-429.01: Desktop Hero Landmarks Selective Rendering & Tight Draw Call Budget]**:
   - In `MiniatureCityDiorama`, when `isDesktopLean = true` and `!isMobile`:
     - Actively renders 4 iconic cultural landmarks:
       - `DioramaBridges` (Ba Son cable-stayed bridge spanning river at $Z = -3.8$, instanced cables).
       - `DioramaSkyline` (Bitexco tower with aviation strobe beacon, instanced trees & lamps).
       - `DioramaHarborCruiser` (Scenic wooden cruiser moored at marina dock $Z = 2.2\text{m}$).
       - `DioramaHeritageDistrict` (Notre Dame Cathedral & Ben Thanh market, ~14 draw calls).
     - Heavy procedural filler clusters remain culled: `DioramaModelRailroad`, `DioramaWaterfrontStation`, `DioramaLandmarkNorthStation`, `DioramaCivicCenter`, `DioramaWaterfrontPark`, `DioramaHighriseBlocks`, `DioramaResidentialPool`, `DioramaShophouseBlocks`, `DioramaTraffic`, `DioramaMicroLife`, `DioramaContainerPort`, `DioramaMarina`.
     - Realistic draw call impact: ~50-55 draw calls on Desktop Lean, safely within the remaining 2.6ms frame time budget to maintain 58-60 FPS.

2. **[INV-429.02: Imperial Emerald & Balanced Gold Specular Plaza]**:
   - In `tabletop_texture_generator.ts`: `drawDongSonMedallion` renders on a $1024 \times 1024$ canvas.
   - Canvas background uses Imperial Royal Emerald / Obsidian Marble (`#064E3B` radial blend to `#022C22`).
   - 14-ray Sunburst Star and flying Lạc birds drawn using gleaming metallic gold accents (`#D4AF37`, `#FDE047`, `#FEF08A`).
   - In `CentralMonumentPlaza` (`isDesktopLean = true` branch): sets `metalness={0.85}`, `roughness={0.24}` on `meshStandardMaterial` to avoid specular glare whiteout.
   - Backward-compatibility guard: When `dongSonTexture` is null (SSR/tests), retains fallback `color="#8C6239"`; ring geometry uses `color="#D4AF37"` (strictly avoiding `#F59E0B` in 3D tree to satisfy living test TC-428.02).

3. **[INV-429.03: Expanded Plinth & Anti-Clipping Clearance]**:
   - In `CentralMonumentPlaza`, slate plinth base expands to radius $R \in [1.50, 1.58]\text{m}$ ($Y = 0.008\text{m}$), smoothly connecting to promenade walkways ($X = \pm 1.8\text{m}$) and eliminating cut-off visual seams.
   - Total plaza element elevation remains strictly $< 0.06\text{m}$, preserving $\ge 0.20\text{m}$ vertical clearance below `DICE_REST_Y = 0.26\text{m}`.

4. **[INV-429.04: Moored Cruiser & Authentic Chain Reaction Alignment]**:
   - `DioramaHarborCruiser` accepts `isMoored?: boolean`. When `isDesktopLean = true` (or `isMoored = true`), the cruiser docks at Marina Berth $Z = 2.2\text{m}$, gently bobbing on the water ($Y = -0.032 + \sin(2.8t) \times 0.003$), zero lateral travel into $Z < 1.6\text{m}$.
   - `landmarkGroupRefs.current[0..4]` mount physical hero components: `[0]` cruiser (Stage 0, $Z = 2.2\text{m}$), `[2]` Bitexco, `[3]` Ba Son bridge, `[4]` Notre Dame & Ben Thanh market. Anchor `[1]` (metro line) retains dummy anchor, grounding 4/5 explosions on authentic physical structures.

5. **[INV-429.05: Default Props & Immutability]**:
   - `isDesktopLean` defaults to `false` in `MiniatureCityDiorama` and `CentralMonumentPlaza`.
   - `WALNUT_TABLE_Y = -0.350` and `DEPTH_LAYER_STACK.WALNUT_TABLE_Y = -0.350` remain strictly immutable.

---

## 4. Contract Test Scenarios (Station 2 Specification)

- **TC-429.01 [UC-HERO-LANDMARKS-DESKTOP-RESTORE/MSS]**: Given MiniatureCityDiorama rendered with isDesktopLean = true and isMobile = false, When inspecting mounted elements, Then mounts DioramaBridges, DioramaSkyline, DioramaHarborCruiser, and DioramaHeritageDistrict, while omitting DioramaShophouseBlocks and DioramaHighriseBlocks.
- **TC-429.02 [UC-PROCEDURAL-FILLER-CULLING/MSS]**: Given MiniatureCityDiorama rendered with isDesktopLean = true, When inspecting children, Then omits diorama-micro-life, diorama-traffic, and diorama-container-port.
- **TC-429.03 [UC-EMERALD-DONG-SON-CANVAS-PALETTE/MSS]**: Given drawDongSonMedallion rendered on 2D canvas, When inspecting canvas drawing operations, Then uses emerald marble tones (#064E3B / #022C22) and gold accents (#D4AF37 / #FDE047).
- **TC-429.04 [UC-GOLD-SPECULAR-PBR-AND-SSR-FALLBACK/MSS]**: Given CentralMonumentPlaza rendered with isDesktopLean = true, When inspecting meshStandardMaterial in SSR static markup, Then asserts fallback color="#8C6239" and not.toContain('#F59E0B') to protect TC-428.02, while metalness is in [0.80, 0.90] and roughness is in [0.20, 0.28].
- **TC-429.05 [UC-PLINTH-EXPANSION-AND-CLEARANCE/MSS]**: Given CentralMonumentPlaza rendered with isDesktopLean = true, When evaluating geometry extents, Then plinth radius is >= 1.50m and maximum height is < 0.06m, maintaining vertical clearance >= 0.20m below DICE_REST_Y = 0.26m.
- **TC-429.06 [UC-MOORED-CRUISER-AND-CHAIN-REACTION-SYNC/MSS]**: Given DioramaHarborCruiser with isMoored = true, When evaluating position and landmarkGroupRefs[0], Then boat remains anchored at Z = 2.2m (+/- 0.1m) without penetrating plinth radius R = 1.58m, perfectly matching Stage 0 shockwave coordinate.
- **TC-429.07 [UC-DEFAULT-PROPS-PRESERVATION/MSS]**: Given MiniatureCityDiorama rendered without props, When evaluating rendered output, Then preserves legacy diorama clusters and fountain spire without regression.
- **TC-429.08 [UC-WALNUT-TABLE-DEPTH-IMMUTABILITY/MSS]**: Given board_layout.tsx constants, When inspecting WALNUT_TABLE_Y and DEPTH_LAYER_STACK.WALNUT_TABLE_Y, Then values remain strictly equal to -0.350.

---

## 5. Definition of Done (DoD)

- [ ] Plan audited and signed via `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_429_DESKTOP_3D_VISUAL_RENAISSANCE.md --auto-sign`.
- [ ] Adversarial challenge brief filed and approved in `.agents/audit/PLAN_CHALLENGE_IMP-429.md`.
- [ ] Station 2: `tests/client/imp429_desktop_3d_visual_renaissance.test.ts` authored with 8+ atomic tests (Semantic RED verified).
- [ ] Station 2.5: Implementation complete in `src/client/3d/miniature_city_diorama.tsx`, `src/client/3d/tabletop_texture_generator.ts`, and `src/client/3d/diorama/diorama_harbor_cruiser.tsx` (All tests GREEN).
- [ ] Mechanical prefilter passes: `npm run prefilter -- src/client/3d/miniature_city_diorama.tsx src/client/3d/tabletop_texture_generator.ts src/client/3d/diorama/diorama_harbor_cruiser.tsx tests/client/imp429_desktop_3d_visual_renaissance.test.ts`.
- [ ] Living test suites pass 100% without regression (`imp428_desktop_diorama_lean_and_dong_son.test.ts`, `urban_density_and_craft.test.ts`, `executive_tabletop_coastal_diorama.test.ts`).
- [ ] Visual capture executed via `node scripts/capture_visual_evidence.mjs --ticket IMP-429`.
- [ ] Visual critique executed by `game-3d-visual-critic` achieving target visual score $\ge 8.5/10$.
- [ ] Chaos Sentinel AST mutation probe passes with 100% kill rate.
- [ ] Comprehensive evidence verified via `node scripts/check_evidence.mjs IMP-429`.
