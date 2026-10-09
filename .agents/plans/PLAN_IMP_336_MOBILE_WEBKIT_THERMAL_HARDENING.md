# Plan IMP-336: Mobile WebKit 3D Performance & Thermal Hardening (Slice 1: Responsive Tile Geometry)

## 0. Auto-Slicing Protocol Roadmap (Mobile Thermal Optimization)
- **Slice 1 (`IMP-336`)**: Responsive board tile geometry (`smoothness={isMobile ? 1 : 4}` on 40 board tiles) in `client-3d`, refactoring AST test suites (`imp150`, `phase1_pbr_beveled`).
- **Slice 2 (`IMP-337`)**: Autonomous SSOT mobile freezing in diorama subsystems (`miniature_city_diorama.tsx`, `diorama_container_port.tsx`, `diorama_marina.tsx`, `diorama_perching_birds.tsx`).
- **Slice 3 (`IMP-338`)**: Single-layer ocean color baking (`deepColor` in `tropical_water.tsx`), middle-water mesh overdraw removal, and proactive thermal pacing in `perf_budget.ts`.

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-336`
- **Subsystem**: `client-3d` (Tier 2 Client 3D Board Tiles & Geometry Optimization)
- **Problem Statement**:
  1. **Mobile Thermal Throttling & Vertex Overhead**: On mobile WebGL devices, unconstrained 40-tile geometry with `smoothness={4}` creates 38,880 triangles across 40 tiles (972 triangles per tile base), saturating GPU vertex processing and triggering hardware thermal downclocking (DVFS). Lowering to `smoothness={1}` eliminates 34,560 triangles (-88.89% tile base vertex load) down to 4,320 triangles (108 triangles per tile base), eliminating vertex pressure while maintaining sub-pixel bevel tolerance at board overview distance.
  2. **Adversarial Gate Decoupling (ADV-01 & ADV-OBJ)**: Per adversarial challenge findings, WebKit on iOS runs on Unified Memory Architecture where context `powerPreference` is ignored by the single GPU pipeline. The physical bottleneck and true causal root of thermal downclocking is tile vertex over-subdivision in `client-3d`. To preserve strict single-subsystem boundary and prevent cross-subsystem contamination with `client-state`, `game_canvas.tsx` is decoupled from this micro-slice.
  3. **Zero AST Deception Mandate**: Test suites `imp150` and `phase1_pbr_beveled` asserted static string `<RoundedBox args={[2.2, 0.22, 2.2]} radius={0.08} smoothness={4}'. In accordance with Anti-TIDD and Causal Root Scope Invariant, these tests are refactored to support dynamic `smoothness={isMobile ? 1 : 4}` instead of introducing dummy retention comments into production code.
- **Architectural Solution & Hardening Directives (ADV-01..06)**:
  1. In `src/client/3d/board_tile.tsx`, configure `smoothness={isMobile ? 1 : 4}` for both corner tiles and standard tiles, eliminating 34,560 triangles (-88.89% tile base vertex load) on mobile with sub-pixel texture plane tolerance (0.028 units at overview elevation).
  2. Refactor `imp150` and `phase1_pbr_beveled` living tests to validate atomic regex binding args, radius={0.08}, and dynamic smoothness branching.
  3. Register mutation sensitivity probes for IMP-336 in `scripts/sentinel_runner.mjs`.
  4. Mandate dual-viewport physical visual screenshots (`npm run capture:visual -- --ticket IMP-336`) in Station 4 before handoff.
- **Direct Scope (Physical Files)**:
  - Target physical file: src/client/3d/board_tile.tsx
  - Target physical file: tests/client/imp336_mobile_webkit_thermal_hardening.test.ts (New file)
  - Target physical file: tests/client/imp150_mobile_ios_3d_perf_hardening.test.ts
  - Target physical file: tests/client/phase1_pbr_beveled.test.ts

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/board_tile.tsx` | Tier 2 (UI/3D/Views) | 334 | 334 | 0 | <= 500 | Refactor |
| `tests/client/imp336_mobile_webkit_thermal_hardening.test.ts` | Living Test | 0 | 348 | +348 | <= 600 | 🆕 Tệp mới |
| `tests/client/imp150_mobile_ios_3d_perf_hardening.test.ts` | Living Test | 308 | 308 | 0 | <= 600 | Refactor |
| `tests/client/phase1_pbr_beveled.test.ts` | Living Test | 136 | 136 | 0 | <= 600 | Refactor |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- Write living contract test suite in `tests/client/imp336_mobile_webkit_thermal_hardening.test.ts`:
  - TC-336.01 [UC-TILE/MSS]: Given LayeredDioramaTile rendered with isMobile true, When base tile RoundedBox is evaluated via captureTree, Then configures smoothness equals 1 reducing vertex count.
  - TC-336.02 [UC-TILE/A1]: Given LayeredDioramaTile rendered with isMobile false, When base tile RoundedBox is evaluated via captureTree, Then configures smoothness equals 4 for full fidelity.
  - TC-336.03 [UC-CORNER/MSS]: Given corner tile rendered with isMobile true, When corner RoundedBox is evaluated via captureTree, Then configures smoothness equals 1.
  - TC-336.04 [UC-CORNER/A1]: Given corner tile rendered with isMobile false, When corner RoundedBox is evaluated via captureTree, Then configures smoothness equals 4.
  - TC-336.05 [UC-REGRESS/A1]: Given physical source code of board_tile.tsx, When evaluated against atomic regex patterns, Then matches dynamic smoothness branching without dummy comments.

Contract suites must verify Semantic Behavioral RED where runtime assertions fail prior to production changes.

### Station 2: Minimal Implementation (GREEN)
- **Task 1**: In `src/client/3d/board_tile.tsx`, update corner tile `<RoundedBox>` to `smoothness={isMobile ? 1 : 4}` and standard tile `<RoundedBox>` to `smoothness={isMobile ? 1 : 4}`.
- **Task 2**: In `tests/client/imp150_mobile_ios_3d_perf_hardening.test.ts` and `tests/client/phase1_pbr_beveled.test.ts`, update static string checks to atomic regexes binding args, radius, and dynamic smoothness.
- Verify 100% tests turn GREEN.

### Station 3: Pre-Filter & Mechanical Gates
- Run `npm run prefilter -- src/client/3d/board_tile.tsx tests/client/imp336_mobile_webkit_thermal_hardening.test.ts tests/client/imp150_mobile_ios_3d_perf_hardening.test.ts tests/client/phase1_pbr_beveled.test.ts`.
- Run `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_336_MOBILE_WEBKIT_THERMAL_HARDENING.md`.

### Station 4: Evidence & Sentinel Verification
- Add mutation sensitivity probes in `scripts/sentinel_runner.mjs`.
- Run visual evidence capture: `npm run capture:visual -- --ticket IMP-336`.
- Run sentinel: `npm run sentinel -- --ticket IMP-336 --test tests/client/imp336_mobile_webkit_thermal_hardening.test.ts --src src/client/3d/board_tile.tsx`.
- Run evidence checker: `node scripts/check_evidence.mjs IMP-336`.
- Generate acceptance delivery report: `npm run report -- IMP-336`.
