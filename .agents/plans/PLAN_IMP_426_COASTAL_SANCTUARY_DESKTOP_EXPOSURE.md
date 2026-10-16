# Lean Plan: IMP-426 Coastal Sanctuary Diorama Desktop Exposure & Placebo Elimination

> **Ticket:** `IMP-426`  
> **Classification:** Tier 2 3D Scene Composition  
> **Subsystem Boundaries:** `src/client/3d/coastal_island_environment.tsx`, `src/client/3d/board_layout.tsx`, `src/client/3d/coastal_island_landmarks.tsx`, `src/client/3d/sunny_island_lobby_scene.tsx`, `tests/client/`  
> **Primary Goals:** Eliminate the IMP-420 "Placebo Fix" by inferring `streamlined` from `isMobile` when omitted, explicitly wiring `streamlined={!tierProfile.enableOuterBaySanctuaries}` at `board_layout.tsx` call-site, exposing the 4-quadrant diorama on Desktop while preserving 100% Mobile TBDR efficiency and preventing living test collision.

---

## 1. Principles Applied

- **[Poka-Yoke Domain Affordance]** -> Eliminate misleading default state where `streamlined` unconditionally defaulted to `true`, hiding balanced diorama capes and shoreline in production runtime. Default now dynamically reflects device capability: `streamlined = propStreamlined ?? isMobile`.
- **[100% DTO & Call-Site Wiring]** -> In `board_layout.tsx#L173`, wire `<CoastalIslandEnvironment isMobile={isMobile} streamlined={!tierProfile.enableOuterBaySanctuaries} />`, keeping platform identity and diorama gating cleanly decoupled. In `sunny_island_lobby_scene.tsx#L298`, wire `<CoastalIslandEnvironment isMobile={isMobile} streamlined={isMobile} />`.
- **[Living Test Protection & Palette Hygiene]** -> Replace `#94A3B8` on train tracks in `coastal_island_landmarks.tsx#L188,L192` with canonical steel `#64748B`, preventing living contract collision with `TC-399.06b` (which prohibits `#94A3B8` in SSR markup).
- **[Platform DI Isolation]** -> Zero direct browser sniffing in leaf loops. Maintain pure prop dependency injection (`isMobile`, `streamlined`) with fallback to hardware detection, allowing deterministic test assertion.
- **[Spatial AABB / Non-Occlusion]** -> Expose the 4 balanced capes (`DEFAULT_BALANCED_ISLAND_DIORAMA`) across NW, NE, SW, SE quadrants on Desktop with 0 overlap with board tiles, preserving overview viewport frustum ($|NDC| \le 0.85$).
- **[Relational Multi-Point Assertion]** -> Contract tests verify both branches ($f(isMobile=true) \neq f(isMobile=false)$) and explicit prop overrides, proving diorama presence on Desktop and complete exclusion on Mobile.

---

## 2. Target Files & Honest LOC Accounting

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/coastal_island_environment.tsx` | Tier 2 3D Scene Composition | 309 | 311 | +2 | 500 | Safe (Default inference refactor) |
| `src/client/3d/board_layout.tsx` | Tier 2 3D Scene Composition | 253 | 255 | +2 | 500 | Safe (Call-site prop wiring) |
| `src/client/3d/coastal_island_landmarks.tsx` | Tier 2 3D Scene Composition | 246 | 246 | ~0 | 500 | Safe (Rail palette fix #64748B) |
| `src/client/3d/sunny_island_lobby_scene.tsx` | Tier 2 3D Scene Composition | 310 | 310 | ~0 | 500 | Safe (Lobby scene call-site wiring) |
| `tests/client/imp426_coastal_sanctuary_desktop_exposure.test.ts` | Living Test | 8 | 195 | +187 | 600 | Safe (New contract test suite) |

---

## 3. Core Contract Invariants & Architectural Seams

1. **[INV-426.01: Desktop Default Streamlined Inference & Outer Diorama Exposure]**:
   - In `coastal_island_environment.tsx`, `streamlined` defaults to `propStreamlined ?? isMobile`.
   - When rendered with `isMobile: false` and `streamlined: undefined` (Desktop environment), `streamlined` evaluates to `false`.
   - `!streamlined` renders:
     - 4 peninsula capes (`DEFAULT_BALANCED_ISLAND_DIORAMA.props`) across SW, SE, NW, NE quadrants.
     - Lush tropical lawn plateau `#22C55E` (`cylinderGeometry args={[15.6, 17.6, 0.26, 64]}`).
     - Sloped fine ivory shoreline `#EFE5D8` (`cylinderGeometry args={[17.4, 21.0, 0.24, 64]}`).
     - 15° bevel shoreline `#EFE5D8` (`cylinderGeometry args={[27.8, 28.85, 0.28, 64]}`).
     - Shoreline foam ring `ringGeometry args={[16.0, 17.2, 64]}`.

2. **[INV-426.02: Mobile TBDR Streamlined Preservation & Narrow Viewport Guard]**:
   - When rendered with `isMobile: true` and `streamlined: undefined` (Mobile environment), `streamlined` evaluates to `true`.
   - `streamlined === true` strictly omits all outer diorama cylinder geometries, capes, and parasols.
   - Uses compact `boxGeometry args={[18.4, 0.04, 18.4]}` for shallow water and `boxGeometry args={[18.45, 0.02, 18.45]}` for shoreline foam.
   - Guarantees 0 mobile overdraw regression on TBDR mobile GPUs and preserves narrow portrait viewport framing.

3. **[INV-426.03: Decoupled BoardLayout & Lobby Scene Call-Site Synchronization]**:
   - In `board_layout.tsx#L173`, `<CoastalIslandEnvironment />` is wired with:
     `isMobile={isMobile}`
     `streamlined={!tierProfile.enableOuterBaySanctuaries}`
   - On Desktop (`tierProfile.enableOuterBaySanctuaries === true`), `streamlined` evaluates to `false`.
   - On Mobile (`tierProfile.enableOuterBaySanctuaries === false`), `streamlined` evaluates to `true`.
   - In `sunny_island_lobby_scene.tsx#L298`, `<CoastalIslandEnvironment />` receives `isMobile={isMobile} streamlined={isMobile}`.
   - Platform capability and diorama feature gating remain strictly orthogonal.

4. **[INV-426.04: Universal SSR Palette Safety & Quadrant Sector Equilibrium]**:
   - Train rails in `TrainStationLandmark` use `#64748B`, ensuring zero `#94A3B8` tokens exist in desktop SSR markup, preserving living test `TC-399.06b`.
   - When exposed on Desktop, rendered 4-cape positions maintain perfect spatial sector equilibrium ($\Delta = 0$, exactly 1 cape per quadrant: NW=1, NE=1, SW=1, SE=1).

---

## 4. Contract Test Scenarios (Station 2 Specification)

- **TC-426.01 [UC-DESKTOP-DEFAULT-STREAMLINED-INFERENCE/MSS]**: Given CoastalIslandEnvironment rendered with isMobile: false and streamlined omitted, When inspecting rendered tree, Then streamlined resolves to false and mounts 4 cape descriptors and diorama cylinder geometries.
- **TC-426.02 [UC-MOBILE-STREAMLINED-PRESERVATION/A1]**: Given CoastalIslandEnvironment rendered with isMobile: true and streamlined omitted, When inspecting rendered tree, Then streamlined resolves to true, completely omitting outer capes, plateau, and diorama cylinder meshes.
- **TC-426.03 [UC-EXPLICIT-STREAMLINED-OVERRIDE/A2]**: Given CoastalIslandEnvironment rendered with explicit streamlined: true on desktop or explicit streamlined: false on mobile, When evaluating output, Then explicit prop strictly overrides isMobile inference.
- **TC-426.04 [UC-BOARD-LAYOUT-CALL-SITE-WIRING/MSS]**: Given GameBoard rendering on Desktop tier vs Mobile tier, When inspecting CoastalIslandEnvironment call-site, Then passes streamlined={!tierProfile.enableOuterBaySanctuaries} and isMobile={isMobile}.
- **TC-426.05 [UC-LOBBY-SCENE-CALL-SITE-WIRING/MSS]**: Given SunnyIslandLobbyScene rendered with isMobile prop, When inspecting CoastalIslandEnvironment call-site, Then passes isMobile and streamlined without fallback leaks.
- **TC-426.06 [UC-SECTOR-EQUILIBRIUM-IN-RENDERED-DIORAMA/MSS]**: Given CoastalIslandEnvironment rendered on Desktop, When extracting rendered cape positions from diorama, Then validates sector balance with max delta <= 2 (Delta = 0).
- **TC-426.07 [UC-LIVING-TEST-TC399-PRESERVATION/MSS]**: Given CoastalIslandEnvironment and TrainStationLandmark rendered on Desktop, When verifying SSR markup, Then zero #94A3B8 is rendered and TC-399.06b passes cleanly.

---

## 5. Definition of Done (DoD)

- [x] Plan audited and signed via `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_426_COASTAL_SANCTUARY_DESKTOP_EXPOSURE.md --auto-sign`.
- [x] Adversarial challenge resolved and signed in `.agents/audit/PLAN_CHALLENGE_IMP-426.md`.
- [x] Station 2: `tests/client/imp426_coastal_sanctuary_desktop_exposure.test.ts` authored (Semantic RED verified).
- [x] Station 2.5: Implementation complete in `src/client/3d/coastal_island_environment.tsx`, `src/client/3d/board_layout.tsx`, `src/client/3d/coastal_island_landmarks.tsx`, `src/client/3d/sunny_island_lobby_scene.tsx` (All tests GREEN).
- [x] `npm run prefilter -- src/client/3d/coastal_island_environment.tsx src/client/3d/board_layout.tsx src/client/3d/coastal_island_landmarks.tsx src/client/3d/sunny_island_lobby_scene.tsx tests/client/imp426_coastal_sanctuary_desktop_exposure.test.ts` passes exit 0.
- [x] Living test suites pass 100% with zero regressions (including `imp399_bay_archipelago_and_mobile_city_silhouette.test.ts`).
- [x] Comprehensive evidence recorded and verified via `node scripts/check_evidence.mjs IMP-426`.
