# Plan IMP-337: Mobile WebKit 3D Performance & Thermal Hardening (Slice 2: Autonomous SSOT Mobile Freezing in Diorama Subsystems)

## 0. Auto-Slicing Protocol Roadmap (Mobile Thermal Optimization)
- **Slice 1 (`IMP-336`)**: Responsive board tile geometry (`smoothness={isMobile ? 1 : 4}` on 40 board tiles) in `src/client/3d/board_tile.tsx`, refactoring AST test suites (`tests/client/imp150_mobile_ios_3d_perf_hardening.test.ts`, `tests/client/imp336_mobile_webkit_thermal_hardening.test.ts`, `tests/client/phase1_pbr_beveled.test.ts`). [SHIPPED]
- **Slice 2 (`IMP-337`)**: Autonomous SSOT mobile freezing in diorama subsystems (`miniature_city_diorama.tsx`, `diorama_container_port.tsx`, `diorama_marina.tsx`, `diorama_perching_birds.tsx`). [CURRENT SLICE]
- **Slice 3 (`IMP-338`)**: Single-layer ocean color baking (`deepColor` in `tropical_water.tsx`), middle-water mesh overdraw removal, and proactive thermal pacing in `perf_budget.ts`.

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-337`
- **Subsystem**: `client-3d` (Tier 2 Client 3D Miniature Diorama & Thermal Load Freezing)
- **Problem Statement**:
  1. **IPC & Animation Overhead on Mobile WebKit**: On iOS WebKit (iPhone 11), diorama subsystems run multiple unconstrained `useSafeFrame` animation loops at 60 FPS. `DioramaContainerPort` calculates crane yaw and hoist elevations every frame; `DioramaMarina` calculates watercraft bobbing and sweeping beacon rotations; `DioramaPerchingBirds` runs an active flight FSM with wing flap math. In WebKit's multi-process architecture (`com.apple.WebKit.WebContent` vs `com.apple.WebKit.GPU`), continuous frame transformations saturate IPC command buffers, generating heat on the A13 die and triggering severe DVFS thermal throttling down to 1x FPS.
  2. **Expensive Dynamic Lighting in Forward Rendering**: `DioramaMarina` mounts an active `<pointLight>` for the lighthouse beacon. Under Three.js forward rendering, dynamic point lights force surrounding PBR materials to compute quadratic distance attenuation on every pixel, wasting mobile fragment shading bandwidth.
  3. **Adversarial Gate Findings & Hardened Directives (ADV-01..06)**:
     - **[ADV-01] JSX Reconciliation Race on Desktop**: In `DioramaPerchingBirds`, declaring unconditional static `position` and `rotation` in JSX causes R3F reconciler to snap flying birds back to perches during parent re-renders. Hardened solution: declare `position={isMobile ? [spot.x, spot.y, spot.z] : undefined}` and `rotation={isMobile ? [0, spot.baseRotY, 0] : undefined}`.
     - **[ADV-02] PointLight Shader Recompilation Stutter**: In `DioramaMarina`, hiding a group containing `<pointLight>` alters `numPointLights`, triggering 100-250ms shader recompilations across 30+ PBR materials. Hardened solution: keep `<pointLight visible={true}>` and modulate `intensity={isMobile ? 0 : (isNightOrSunset ? beaconIntensity : 0)}`, while hiding the rigid light cone mesh `<mesh visible={!isMobile && isNightOrSunset}>`.
     - **[ADV-03] Daytime Strobe Bug**: In `DioramaContainerPort`, crane strobe meshes default to `visible=true`. When `useSafeFrame` is frozen on mobile, strobes glow permanently in broad daylight. Hardened solution: declare explicit `visible={isNight}` on strobe meshes in JSX.
     - **[ADV-04] Pointer Trap Deadlock**: In `DioramaPerchingBirds`, tapping birds sets state to `'TAKE_OFF'`. With loop frozen, FSM never advances. Hardened solution: guard `handlePointerDown` with `if (isMobile) return;`.
     - **[ADV-05] The Lobby Leak & SSR Safety**: Lobby scene calls `<MiniatureCityDiorama />` with 0 props. Hardened solution: resolve `const isMobile = propIsMobile ?? isPhoneHardware();`. In Node.js SSR test environments, `isPhoneHardware()` safely returns `false`, preserving 100% of living test contracts.
     - **[ADV-06] Sentinel Mutation Killing Floor**: Expand test suite `imp337_diorama_mobile_freezing.test.ts` to 20 atomic test cases covering all mobile/desktop permutations.
- **Direct Scope (Physical Files)**:
  - Target physical file: src/client/3d/miniature_city_diorama.tsx
  - Target physical file: src/client/3d/diorama/diorama_container_port.tsx
  - Target physical file: src/client/3d/diorama/diorama_marina.tsx
  - Target physical file: src/client/3d/diorama/diorama_perching_birds.tsx
  - Target physical file: tests/client/imp337_diorama_mobile_freezing.test.ts (New file)

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/miniature_city_diorama.tsx` | Tier 2 (UI/3D/Views) | 321 | 323 | +2 | <= 500 | Refactor |
| `src/client/3d/diorama/diorama_container_port.tsx` | Tier 2 (UI/3D/Views) | 237 | 238 | +1 | <= 500 | Refactor |
| `src/client/3d/diorama/diorama_marina.tsx` | Tier 2 (UI/3D/Views) | 189 | 194 | +5 | <= 500 | Refactor |
| `src/client/3d/diorama/diorama_perching_birds.tsx` | Tier 2 (UI/3D/Views) | 263 | 267 | +4 | <= 500 | Refactor |
| `tests/client/imp337_diorama_mobile_freezing.test.ts` | Living Test | 0 | 320 | +320 | <= 600 | 🆕 Tệp mới |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- Write living contract test suite in `tests/client/imp337_diorama_mobile_freezing.test.ts`:
  - TC-337.01 [UC-PORT/MSS]: Given DioramaContainerPort rendered with isMobile true, When evaluating frame update, Then useSafeFrame early returns preserving static resting positions.
  - TC-337.02 [UC-PORT/A1]: Given DioramaContainerPort rendered with isMobile true, When inspecting crane aviation strobes in daytime, Then hides strobes via declarative JSX visible={isNight}.
  - TC-337.03 [UC-PORT/A2]: Given DioramaContainerPort rendered with isMobile true, When inspecting crane aviation strobes at night, Then enables strobes via declarative JSX visible={isNight}.
  - TC-337.04 [UC-PORT/A3]: Given DioramaContainerPort rendered with isMobile false, When evaluating frame update on desktop, Then executes dynamic boom yaw and hoist updates.
  - TC-337.05 [UC-PORT/A4]: Given DioramaContainerPort rendered with default props, When inspecting output markup, Then preserves data-testid="diorama-container-port" and finite coordinates.
  - TC-337.06 [UC-MARINA/MSS]: Given DioramaMarina rendered with isMobile true, When inspecting pointLight, Then sets intensity to zero while keeping light mounted in scenegraph.
  - TC-337.07 [UC-MARINA/A1]: Given DioramaMarina rendered with isMobile true, When inspecting sweeping beacon cone mesh, Then hides cone mesh to eliminate rigid frozen light beam.
  - TC-337.08 [UC-MARINA/A2]: Given DioramaMarina rendered with isMobile false, When inspecting sweeping beacon cone mesh at night/sunset, Then displays cone mesh with dynamic rotation.
  - TC-337.09 [UC-MARINA/A3]: Given DioramaMarina rendered with isMobile true, When evaluating frame update, Then useSafeFrame early returns preserving static yacht positions.
  - TC-337.10 [UC-MARINA/A4]: Given DioramaMarina rendered with isMobile true, When inspecting child DioramaPerchingBirds, Then forwards isMobile=true prop.
  - TC-337.11 [UC-MARINA/A5]: Given DioramaMarina rendered with default props, When inspecting output markup, Then preserves data-testid="diorama-marina" and lighthouse horn interaction.
  - TC-337.12 [UC-BIRDS/MSS]: Given DioramaPerchingBirds rendered with isMobile true, When inspecting bird group elements in JSX, Then declares explicit resting transforms matching PERCH_SPOTS.
  - TC-337.13 [UC-BIRDS/A1]: Given DioramaPerchingBirds rendered with isMobile true, When inspecting bird group rotations in JSX, Then declares explicit resting rotation matching PERCH_SPOTS.
  - TC-337.14 [UC-BIRDS/A2]: Given DioramaPerchingBirds rendered with isMobile false, When inspecting bird group JSX transforms, Then sets position and rotation to undefined to prevent R3F reconciliation mid-air snaps.
  - TC-337.15 [UC-BIRDS/A3]: Given DioramaPerchingBirds rendered with isMobile true, When pointer event triggers on bird group, Then suppresses flight FSM transition and keeps state perched.
  - TC-337.16 [UC-BIRDS/A4]: Given DioramaPerchingBirds rendered with isMobile false, When pointer event triggers on bird group, Then transitions FSM to TAKE_OFF.
  - TC-337.17 [UC-BIRDS/A5]: Given DioramaPerchingBirds rendered with isMobile true, When evaluating frame update, Then useSafeFrame early returns.
  - TC-337.18 [UC-CITY/MSS]: Given MiniatureCityDiorama rendered without props in SSR/desktop, When evaluating isMobile, Then resolves false via isPhoneHardware fallback preserving desktop diorama.
  - TC-337.19 [UC-CITY/A1]: Given MiniatureCityDiorama rendered with isMobile true, When inspecting children, Then forwards isMobile=true to DioramaContainerPort and DioramaMarina.
  - TC-337.20 [UC-CITY/A2]: Given MiniatureCityDiorama rendered with isMobile false, When inspecting children, Then forwards isMobile=false to DioramaContainerPort and DioramaMarina.

Contract suites must verify Semantic Behavioral RED where runtime assertions fail prior to production changes.

### Station 2: Minimal Implementation (GREEN)
- **Task 1**: In `src/client/3d/miniature_city_diorama.tsx`, resolve `const isMobile = propIsMobile ?? isPhoneHardware();` and forward `isMobile={isMobile}` to `<DioramaContainerPort isMobile={isMobile} />` and `<DioramaMarina isMobile={isMobile} />`.
- **Task 2**: In `src/client/3d/diorama/diorama_container_port.tsx`, accept `isMobile?: boolean;`, early-return in `useSafeFrame` (`if (isMobile) return;`), and declare `visible={isNight}` on strobe meshes in JSX.
- **Task 3**: In `src/client/3d/diorama/diorama_marina.tsx`, accept `isMobile?: boolean;`, early-return in `useSafeFrame`, hide sweeping cone `<mesh visible={!isMobile && isNightOrSunset}>`, set `<pointLight intensity={isMobile ? 0 : (isNightOrSunset ? beaconIntensity : 0)}>`, and forward `isMobile={isMobile}` to `<DioramaPerchingBirds isMobile={isMobile} />`.
- **Task 4**: In `src/client/3d/diorama/diorama_perching_birds.tsx`, accept `isMobile?: boolean;`, early-return in `useSafeFrame`, declare `position={isMobile ? [spot.x, spot.y, spot.z] : undefined}` and `rotation={isMobile ? [0, spot.baseRotY, 0] : undefined}`, and guard `handlePointerDown` with `if (isMobile) return;`.
- Verify 100% tests turn GREEN across new and living test suites.

### Station 3: Pre-Filter & Mechanical Gates
- Run `npm run prefilter -- src/client/3d/miniature_city_diorama.tsx src/client/3d/diorama/diorama_container_port.tsx src/client/3d/diorama/diorama_marina.tsx src/client/3d/diorama/diorama_perching_birds.tsx tests/client/imp337_diorama_mobile_freezing.test.ts`.
- Run `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_337_DIORAMA_MOBILE_FREEZING.md`.

### Station 4: Evidence & Sentinel Verification
- Add mutation sensitivity probes in `scripts/sentinel_runner.mjs` for IMP-337.
- Run visual evidence capture: `npm run capture:visual -- --ticket IMP-337 --dual-viewport`.
- Run sentinel: `npm run sentinel -- --ticket IMP-337 --test tests/client/imp337_diorama_mobile_freezing.test.ts`.
- Run evidence checker: `node scripts/check_evidence.mjs IMP-337`.
- Generate acceptance delivery report: `npm run report -- IMP-337`.
