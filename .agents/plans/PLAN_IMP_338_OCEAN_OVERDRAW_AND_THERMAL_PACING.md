# Plan IMP-338: Mobile WebKit 3D Performance & Thermal Hardening (Slice 3: Ocean Overdraw Elimination & Proactive Thermal Pacing)

## 0. Auto-Slicing Protocol Roadmap (Mobile Thermal Optimization)
- **Slice 1 (`IMP-336`)**: Responsive board tile geometry (`smoothness={isMobile ? 1 : 4}` on 40 board tiles) in `src/client/3d/board_tile.tsx`, refactoring AST test suites (`tests/client/imp150_mobile_ios_3d_perf_hardening.test.ts`, `tests/client/imp336_mobile_webkit_thermal_hardening.test.ts`, `tests/client/phase1_pbr_beveled.test.ts`). [SHIPPED]
- **Slice 2 (`IMP-337`)**: Autonomous SSOT mobile freezing in diorama subsystems (`src/client/3d/miniature_city_diorama.tsx`, `src/client/3d/diorama/diorama_container_port.tsx`, `src/client/3d/diorama/diorama_marina.tsx`, `src/client/3d/diorama/diorama_perching_birds.tsx`, `tests/client/imp337_diorama_mobile_freezing.test.ts`). [SHIPPED]
- **Slice 3 (`IMP-338`)**: Single-layer ocean color baking (`deepColor` in `tropical_water.tsx`), middle-water mesh overdraw removal in `coastal_island_environment.tsx`, shader precision splitting (`uniform highp float uTime;` vertex shader + `mediump` fragment shader in `tropical_water.tsx`), and proactive thermal pacing (`DPR_BOUNDS.MOBILE_MIN = 0.75`) in `perf_budget.ts`. [CURRENT SLICE]

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-338`
- **Subsystem**: `client-3d` (Tier 2 Client 3D Ocean Overdraw Elimination & Proactive Thermal Pacing)
- **Problem Statement**:
  1. **TBDR Overdraw & Bandwidth Saturation on Mobile WebKit**: In `coastal_island_environment.tsx`, the ocean renders 4 stacked transparent planes: Abyss box ($Y = -0.420$), middle ocean plane $180 \times 180$ (`opacity: 0.88`, $Y = -0.310$), `TropicalWater` shader ($Y = -0.300$), shallow water ($Y = -0.298$, `opacity: 0.70`), and shoreline foam ($Y = -0.292$, `opacity: 0.40`). On Apple Silicon TBDR architecture, transparent primitives disable hardware Hidden Surface Removal (HSR), forcing multiple redundant alpha blending read-modify-write passes per on-screen tile, saturating memory bandwidth and driving the A13 die into thermal throttling down to 1x FPS.
  2. **Fragment Shader Precision & ALU Power Dissipation**: `TropicalWater` uses 32-bit floating point precision when default WebGL precision is `highp`. In water surface shading, declaring `precision: 'mediump'` on `ShaderMaterial` provides ample 16-bit half-float dynamic range while executing on mobile GPU's FP16 dual-rate ALUs (2x throughput, 50% power reduction), without compromising vertex depth or global scene z-buffer.
  3. **Conservative Mobile DPR Floor**: `perf_budget.ts` clamps `DPR_BOUNDS.MOBILE_MIN` at $0.85$. Lowering the emergency thermal floor to $0.75$ reduces fragment shading fillrate by $22.15\%$ ($(0.75 / 0.85)^2 = 0.7785$) during sustained low FPS, while leaving 2D DOM HUD text crisp at native resolution.
  4. **Adversarial Gate Findings & Hardened Directives (ADV-01..06)**:
     - **[ADV-01] Living Contract Boundary & Scope Invariant**: `TC-DPR01.01` in `adaptive_dpr_controller.test.ts` asserts `getRecommendedDpr(true) === [0.85, 1.0]`. `device_detect.ts` is the static initial canvas boot clamp and remains untouched. `tests/client/imp265_dual_platform_mobile_lod.test.ts#TC-265.18` is formally registered in Direct Scope and updated to assert the new emergency floor at `currentDpr: 0.75` (`floorResult.shouldUpdate === false`).
     - **[ADV-02] Anti-Flapping Multi-Step Hysteresis**: To prevent a 4.5s limit-cycle oscillation between 0.75 and 1.0, mobile step-down uses granular multi-step pacing (`1.0 -> 0.85 -> 0.75` on degradation; `0.75 -> 0.85 -> 1.0` on recovery) and double damping (`optimalDurationMs >= 6000ms` when recovering from <= 0.75).
     - **[ADV-03] Precision uTime & Vertex Displacement**: In `tropical_water.tsx`, `vertexShader` declares `uniform highp float uTime;` to prevent FP16 10-bit mantissa truncation/stutter ($t > 64$s), while fragment shader executes in `mediump` for 2x ALU throughput and 50% power reduction. `uTime` modulo wrapping `(Math.PI * 200.0)` acts as defense-in-depth.
     - **[ADV-04] Synchronous Initial Deep Color & Stable useMemo**: `uniforms` depends strictly on `[isMobile]`, initializing `uDeepColor` to `#0369A1` on mount when `isMobile` is true without recreating shader materials on day/sunset/night phase transitions.
     - **[ADV-05] Cross-Scene Mobile Fallback**: `CoastalIslandEnvironment` initializes `const isMobile = props.isMobile ?? isPhoneHardware();` for autonomous lobby & in-game optimization with full SSR safety.
     - **[ADV-06] Non-Invasive Element Inspection**: TC-338.04/05 use the canonical `captureTree` JSX pattern from `imp336` (zero `spyOn(React)` or monkey-patching).
- **Direct Scope (Physical Files)**:
  - Target physical file: src/client/3d/coastal_island_environment.tsx
  - Target physical file: src/client/3d/tropical_water.tsx
  - Target physical file: src/client/3d/perf_budget.ts
  - Target physical file: tests/client/adaptive_dpr_controller.test.ts
  - Target physical file: tests/client/imp265_dual_platform_mobile_lod.test.ts
  - Target physical file: tests/client/imp338_ocean_overdraw_and_thermal_pacing.test.ts (New file)

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/coastal_island_environment.tsx` | Tier 2 (UI/3D/Views) | 231 | 231 | 0 | <= 500 | Refactor |
| `src/client/3d/tropical_water.tsx` | Tier 2 (UI/3D/Views) | 99 | 99 | 0 | <= 500 | Refactor |
| `src/client/3d/perf_budget.ts` | Tier 1 (Domain 3D Engine) | 310 | 310 | 0 | <= 400 | Refactor (Warning) |
| `tests/client/adaptive_dpr_controller.test.ts` | Living Test | 321 | 321 | 0 | <= 600 | Refactor |
| `tests/client/imp265_dual_platform_mobile_lod.test.ts` | Living Test | 380 | 380 | 0 | <= 600 | Refactor |
| `tests/client/imp338_ocean_overdraw_and_thermal_pacing.test.ts` | Living Test | 0 | 280 | +280 | <= 600 | 🆕 Tệp mới |

## 3. Implementation Steps

## Station 1: Contract Testing (RED)
- Write living contract test suite in `tests/client/imp338_ocean_overdraw_and_thermal_pacing.test.ts`:
  - TC-338.01 [UC-OCEAN/MSS]: Given CoastalIslandEnvironment rendered with isMobile true, When inspecting rendered child meshes, Then omits the middle ocean plane planeGeometry args={[180, 180, 32, 32]} to eliminate TBDR overdraw.
  - TC-338.02 [UC-OCEAN/A1]: Given CoastalIslandEnvironment rendered with isMobile false, When inspecting rendered child meshes, Then mounts the middle ocean plane planeGeometry args={[180, 180, 32, 32]} with color #0369A1 to preserve desktop visual fidelity.
  - TC-338.03 [UC-OCEAN/A2]: Given CoastalIslandEnvironment rendered with default props, When inspecting rendered output, Then preserves Abyss box #0C4A6E and TropicalWater mesh.
  - TC-338.04 [UC-WATER/MSS]: Given TropicalWater rendered with isMobile true, When inspecting material properties via captureTree, Then configures precision mediump on ShaderMaterial for FP16 mobile ALU efficiency.
  - TC-338.05 [UC-WATER/A1]: Given TropicalWater rendered with isMobile false, When inspecting material properties via captureTree, Then configures precision highp on ShaderMaterial for desktop fidelity.
  - TC-338.06 [UC-WATER/A2]: Given TropicalWater rendered with isMobile true in daytime phase, When evaluating initial deep ocean color, Then resolves #0369A1 synchronously on mount to eliminate color pop.
  - TC-338.07 [UC-WATER/A3]: Given TropicalWater rendered with isMobile false in daytime phase, When evaluating target deep ocean color, Then resolves preset waterDeepColor #0284C7.
  - TC-338.08 [UC-PACING/MSS]: Given DPR_BOUNDS constant exported from perf_budget.ts, When inspecting MOBILE_MIN value, Then equals 0.75 for proactive thermal relief.
  - TC-338.09 [UC-PACING/A1]: Given PerfBudgetController evaluated with isMobile true and prolonged degraded FPS from 1.0, When evaluating adaptive DPR calculation, Then steps down target DPR first to 0.85 and then to 0.75.
  - TC-338.10 [UC-PACING/A2]: Given PerfBudgetController evaluated with isMobile true and current DPR at 0.75, When evaluating adaptive DPR calculation, Then clamps at 0.75 without dropping below mobile floor.
  - TC-338.11 [UC-PACING/A3]: Given living test suite adaptive_dpr_controller.test.ts, When evaluating dynamic controller assertions, Then harmonizes minimum target bound to 0.75 while strictly preserving initial canvas clamp at [0.85, 1.0].
  - TC-338.12 [UC-PACING/A4]: Given living test suite imp265_dual_platform_mobile_lod.test.ts, When evaluating floorResult assertion, Then verifies floor clamping at currentDpr 0.75.
- Contract suites must verify Semantic Behavioral RED where runtime assertions fail prior to production changes.

## Station 2: Minimal Implementation (GREEN)
- **Task 1**: In `src/client/3d/coastal_island_environment.tsx`:
  - Import `isPhoneHardware` from `./device_detect`.
  - Initialize `const isMobile = props.isMobile ?? isPhoneHardware();`.
  - Wrap the middle ocean plane with `{!isMobile && (<mesh receiveShadow position={[0, -0.31, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[180, 180, 32, 32]} /><meshStandardMaterial color="#0369A1" roughness={0.75} metalness={0.02} transparent opacity={0.88} /></mesh>)}`.
- **Task 2**: In `src/client/3d/tropical_water.tsx`:
  - Pass `precision: isMobile ? 'mediump' : 'highp'` into `new ShaderMaterial(...)`.
  - Ensure vertex shader declares `uniform highp float uTime;` to prevent FP16 vertex wave stepping.
  - In `useMemo` for `uniforms`, depend strictly on `[isMobile]`, and initialize `(u.uDeepColor.value as Color).set('#0369A1')` when `isMobile` is true.
  - In `useSafeFrame`, wrap `uTime` modulo `(Math.PI * 200.0)` and bake deep ocean color: `const targetDeep = isMobile && phase === 'day' ? '#0369A1' : preset.waterDeepColor; tempColor.set(targetDeep);`.
- **Task 3**: In `src/client/3d/perf_budget.ts`:
  - Update `DPR_BOUNDS.MOBILE_MIN = 0.75`.
  - In `calculateAdaptiveDpr`: apply multi-step pacing (`1.0 -> 0.85 -> 0.75` on step-down; `0.75 -> 0.85 -> 1.0` on step-up) and 6000ms double damping for recovery from 0.75.
- **Task 4**: In `tests/client/adaptive_dpr_controller.test.ts` and `tests/client/imp265_dual_platform_mobile_lod.test.ts`:
  - In `adaptive_dpr_controller.test.ts`, harmonize dynamic controller floor assertions to 0.75 while strictly preserving initial boot clamp at [0.85, 1.0].
  - In `imp265_dual_platform_mobile_lod.test.ts`, harmonize floor result assertion to test currentDpr 0.75.
- Verify 100% tests turn GREEN across new and living test suites.

## Station 3: Pre-Filter & Mechanical Gates
- Run `npm run prefilter -- src/client/3d/coastal_island_environment.tsx src/client/3d/tropical_water.tsx src/client/3d/perf_budget.ts tests/client/adaptive_dpr_controller.test.ts tests/client/imp265_dual_platform_mobile_lod.test.ts tests/client/imp338_ocean_overdraw_and_thermal_pacing.test.ts`.
- Run `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_338_OCEAN_OVERDRAW_AND_THERMAL_PACING.md`.

## Station 4: Evidence & Sentinel Verification
- Add mutation sensitivity probes in `scripts/sentinel_runner.mjs` for IMP-338.
- Run visual evidence capture: `npm run capture:visual -- --ticket IMP-338 --dual-viewport`.
- Run sentinel: `npm run sentinel -- --ticket IMP-338 --3d --test tests/client/imp338_ocean_overdraw_and_thermal_pacing.test.ts --src src/client/3d/coastal_island_environment.tsx`.
- Run evidence checker: `node scripts/check_evidence.mjs IMP-338`.
- Generate acceptance delivery report: `npm run report -- IMP-338`.
