# PLAN_IMP_406: Mobile Instanced Monopoly Archways, Auto-TTL Domino Shockwave & Diegetic Sanctuary Purity (Phase 5.3)

## 1. Context & Architectural Goal
- **Source Strategy Reports**: [`VTCOON_UNIFIED_BLENDER_MOBILE_AND_CROSSPLATFORM_REPORT.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/analysis/VTCOON_UNIFIED_BLENDER_MOBILE_AND_CROSSPLATFORM_REPORT.md) (Phase 5.3 — V4.0) & [`VTCOON_ARCHITECTURAL_REALISM_AND_MATURE_TONE_REPORT.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/analysis/VTCOON_ARCHITECTURAL_REALISM_AND_MATURE_TONE_REPORT.md).
- **Strict Execution Order Gate**: Executes strictly after `IMP-403`, `IMP-404`, and `IMP-405` complete Station 4 sign-off.
- **Problem**:
  1. [`src/client/3d/monopoly_plaza_visuals.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/monopoly_plaza_visuals.ts) was in the `>= 350 LOC` Buffer Zone (`396 LOC`), and [`src/client/3d/war_room_stage_visuals.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/war_room_stage_visuals.ts) used juvenile RPG slogans (`"👑 Bá Chủ Độc Quyền"`, `"📈 Mở Rộng Đế Chế"`, `"🛡️ Phòng Thủ Vốn"`, `"🚨 Cứu Thanh Khoản"`) on floating 3D billboards above the 4 ocean sanctuary statues—cluttering the 3D diorama with 2D-on-3D signboards.
  2. On Mobile (`isMobile === true`), `MonopolyPlazaFusion` previously returned `null`, depriving Mobile players of Art Deco Monopoly Archways, contiguous promenades, and the 900ms Domino Shockwave ripple. Calling `mergeGeometries` or loading async `.glb` files on Mobile during a match would cause CPU/GC stalls and violate `TC-401.04c`.
  3. Adversarial & Forensic audit identified key structural invariants: (a) recessed archway cavities must pierce window apertures through the outer pillar/lintel faces (`|zSurface - zInward| = 22mm >= 20mm`, `[ADV-02]`) so they are neither occluded nor Z-fighting on Android 16-bit depth buffers; (b) `MobileMonopolyPoolSlotMatrix.pitchX` must be wired into Mobile `InstancedMesh` rotation and Desktop `MonopolyPlazaFusion` must select minimum `distanceInCells` across segment cells (`[ADV-03]`, `[ADV-04]`); and (c) Option B (Diegetic 3D Sanctuary Purity) must hide floating 3D speech bubble billboards by default (`showSpeechBubbles = false`) and skip `CanvasTexture` allocation when hidden while keeping React test nodes for `TC-403.04a` (`[ADV-01]`, `[ADV-03]`).
- **Refactor-First Solution, Diegetic 3D Sanctuary Purity (Option B) & Adversarial Hardening**:
  1. **Refactor-First Deep Module Extraction, Mature Institutional Lexicon & Option B (Diegetic 3D Sanctuary Purity)**:
     - Extract Domino Shockwave kinematics (`getCircularCellDistance`, `calculateDominoRippleTransform`, `resolveNeighborDominoSlam`, `resolveMobilePoolDominoSlam`) and the Mobile Pre-Allocated 8-Slot Archway & 16-Slot Promenade Pool View-Model into [`src/client/3d/monopoly_mobile_archway_visuals.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/monopoly_mobile_archway_visuals.ts), keeping [`src/client/3d/monopoly_plaza_visuals.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/monopoly_plaza_visuals.ts) at `315 LOC` (`< 350 LOC`).
     - In [`src/client/3d/war_room_stage_visuals.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/war_room_stage_visuals.ts), replace all juvenile slogans in `resolveTycoonDiplomacyPosture` and `getTycoonDiplomacyHaloDescriptors` with institutional macroeconomic terminology: **`"Vị Thế Chi Phối"`** (`MONOPOLY_OVERLORD`), **`"Tích Lũy Tài Sản"`** (`EXPANSION`), **`"Bảo Toàn Thanh Khoản"`** (`DEFENSIVE`), and **`"Tái Cơ Cấu Vốn"`** (`RESCUE`), with `#0F172A` obsidian-slate canvas styling and frustum-safe `bubbleWorldPosition` offsets (`'sanctuary-west-north': [cx + 1.55, 1.48, cz + 0.95]`, `'sanctuary-west-south': [cx + 1.95, 1.48, cz - 0.65]`, `'sanctuary-north-east': [cx + 0.35, 1.48, cz + 3.35]`, `'sanctuary-southwest': [cx + 0.85, 1.48, cz - 0.65]`) satisfying `TC-403.03c` (`[ADV-01]`).
     - **Option B (Hide Floating 3D Speech Bubble Billboards & Skip Canvas Allocation by Default, `[ADV-03]`)**: In [`src/client/3d/war_room_stage_layer.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/war_room_stage_layer.tsx), add `readonly showSpeechBubbles?: boolean;` (default `false`) to `WarRoomStageLayerProps`, set `visible={Boolean(props?.showSpeechBubbles)}` on the floating billboard `<group>`, and guard `createDiplomacySpeechBubbleTexture` so it is only invoked when `Boolean(props?.showSpeechBubbles)` is `true`. In production (`showSpeechBubbles = false`), Three.js skips rendering all 8 billboard meshes (`0` draw calls, `0` `CanvasTexture` allocations, `0` floating text clutter over statues/ocean), leaving only the glowing pedestal Halo rings (`innerRadius = 0.36m, outerRadius = 0.46m` at `Y = 0.086m`) and 3D Wealth Trays (`wealth_tray_tier1..4.glb`), while keeping `data-testid="diplomacy-speech-bubble-p1..p4"` in the React tree so `TC-403.04a` passes 100% untouched.
  2. **Zero-GC Pre-Allocated `InstancedMesh` Pool (`8` Archway Slots + `16` Promenade Slots) with Pierced 22mm Recessed Cavities (`[ADV-02]`)**:
     - `getMobileMonopolyArchwayGeometry()` builds a Frame-0 synchronous Quantized Blender 5.2 Art Deco Archway `BufferGeometry` (`COLOR_0` Vertex-Color + Baked AO for Carrara marble & brushed brass, stepped archway base dimensions $0.72\text{m} \times 0.68\text{m} \times 0.14\text{m}$ matching `MONOPOLY_ARCHWAY_BASE_DIMENSIONS`, piercing 4-quad window apertures in the outer pillar/lintel faces to expose 6 inward-recessed cavities with `|zSurface - zInward| = 22mm >= 20mm` for Android 16-bit depth stability).
     - `getMobileMonopolyPromenadeSlotGeometry()` builds a unit-width (`1.0m x 0.024m x 0.16m`) promenade slab (`height = 0.024m >= 20mm`).
     - `computeMobileMonopolyArchwayPoolSlots` (`8` slots) and `computeMobileMonopolyPromenadePoolSlots` (`16` slots) always return fixed-length arrays (`scale: [0, 0, 0]`, `pitchX: 0` when inactive).
  3. **100% `pitchX` & Minimum `distanceInCells` Kinematic Wiring + Dual-Seam Preservation of `TC-401` (`[ADV-03]`, `[ADV-04]`)**:
     - `MobileMonopolyPoolSlotMatrix` includes `readonly pitchX: number;` (populated from `ripple.isSettled ? 0 : ripple.pitchRad`, `0` when inactive).
     - `MonopolyPlazaFusion` wires `_euler.set(slot.pitchX, slot.rotationY, 0, 'YXZ')` in `applySlotsToInstancedMesh`, checks `liveSlots.some((s) => s.active && (s.position[1] > 0.118 || s.pitchX !== 0))` in Mobile `useSafeFrame` so negative half-cycles (`waveSin < 0`, where `yOffset === 0` but `pitchX !== 0`) do not prematurely trigger `wasRipplingRef` settlement, and on Desktop selects the minimum `distanceInCells` across all segment cells (`!activeDomino || hit.distanceInCells < activeDomino.distanceInCells`, `[ADV-04]`) and applies `fusionGroupRef.current.rotation.x = ripple.pitchRad` (resetting to `0` when settled).
     - `MonopolyPlazaFusionProps` exposes `readonly enableMobileInstancedPool?: boolean;` (default `false`) for `TC-401.04c` standalone parity while `GameBoard` passes `enableMobileInstancedPool={isMobile}`.

### Principles Applied
- **View-Model Seam Extraction** -> Extracted `computeMobileMonopolyArchwayPoolSlots`, `computeMobileMonopolyPromenadePoolSlots`, and `resolveMobilePoolDominoSlam` into `monopoly_mobile_archway_visuals.ts`.
- **Ephemeral TTL / Dead Man's Switch** -> Mobile & Desktop Domino Shockwave enforces a strict `900ms` Auto-TTL window with a `wasRipplingRef` settlement pass across both positive and negative wave half-cycles.
- **Resource Disposal & Cache Hygiene** -> Pre-allocated 8-slot and 16-slot `InstancedMesh` pools update via `setMatrixAt`/`setColorAt` with `0` runtime `mergeGeometries` allocations; Option B skips `CanvasTexture` allocation when `showSpeechBubbles` is `false` (`[ADV-03]`); `disposeMobileMonopolyArchwayGeometries` releases GPU buffers.
- **Spatial AABB / Non-Occlusion** -> Pierced 4-quad window apertures expose 6 inward-recessed cavities (`22mm >= 20mm` depth step, exact `0.72m x 0.68m x 0.14m` bounds, `[ADV-02]`), inter-building archway gap (`localZ = -1.24m`), `frustumCulled={false}`, and Option B hidden 3D speech billboards (`visible={Boolean(props?.showSpeechBubbles)}`) eliminating 3D text occlusion over sanctuary statues.
- **100% DTO & Call-Site Wiring** -> Every field of `MobileMonopolyPoolSlotMatrix` (including `pitchX`) and minimum `activeDomino.distanceInCells` (`[ADV-04]`) is actively wired into `MonopolyPlazaFusion`, `WarRoomStageLayer`, and `GameBoard`.
- **Equivalence-Partition Testing** -> Partitioned across 0, 1, 2, and 8 monopolies (`16` promenade segments), active `< 900ms` (positive and negative half-cycles) vs `>= 900ms` settled TTL, standalone vs `GameBoard` Dual-Seam rendering, and Option B `showSpeechBubbles` default `false` vs `true`.
- **Relational Multi-Point Assertion** -> Verifies wave attenuation (`yOffset`, `scaleY`, `pitchRad`) across circular cell distances (`d = 1` vs `d = 2` vs `d = 4`), promenade width scaling (`1.68m` vs `3.48m`), and distinct mature Vietnamese financial slogans across net-worth brackets (`>= 30000`, `>= 12000`, `>= 6000`, `< 6000`).

---

## 2. Target Files & Honest LOC Accounting

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/monopoly_mobile_archway_visuals.ts` | Tier 2 (3D) | 0 | 286 | +286 | 500 | Safe (New) |
| `src/client/3d/monopoly_plaza_visuals.ts` | Tier 2 (3D) | 315 | 315 | +0 | 500 | Safe (Refactored) |
| `src/client/3d/monopoly_plaza_fusion.tsx` | Tier 2 (3D) | 228 | 228 | +0 | 500 | Safe |
| `src/client/3d/war_room_stage_visuals.ts` | Tier 2 (3D) | 381 | 381 | +0 | 500 | Safe (Refactored) |
| `src/client/3d/war_room_stage_layer.tsx` | Tier 2 (3D) | 293 | 293 | +0 | 500 | Safe |
| `src/client/3d/board_layout.tsx` | Tier 2 (3D) | 252 | 252 | +0 | 500 | Safe |
| `docs/FEATURE_MAP.md` | Docs | 92 | 92 | +0 | N/A | Safe |
| `tests/client/imp406_mobile_instanced_monopoly_archway.test.ts` | Living Test | 0 | 423 | +423 | 600 | Safe (New) |

---

## 3. Lean Type & Exported Symbol Contracts

**Target physical file**: `src/client/3d/monopoly_mobile_archway_visuals.ts`
```typescript
import type { BufferGeometry } from 'three';
import type { ActiveSlam } from '../store/vfx_store';
import type { MonopolyGroupInfo } from './monopoly_plaza_math';
import type { DominoRippleOptions, DominoRippleTransform } from './monopoly_plaza_visuals';

export const MAX_MONOPOLY_ARCHWAY_SLOTS = 8 as const;
export const MAX_MONOPOLY_PROMENADE_SLOTS = 16 as const;

export interface MobileMonopolyPoolSlotMatrix {
  readonly slotIndex: number;
  readonly active: boolean;
  readonly colorGroup: string;
  readonly ownerColor: string;
  readonly position: readonly [number, number, number];
  readonly rotationY: number;
  readonly pitchX: number;
  readonly scale: readonly [number, number, number];
}

export function getCircularCellDistance(cellA: number, cellB: number): number;
export function calculateDominoRippleTransform(
  distanceInCells: number,
  elapsedMs: number,
  options?: DominoRippleOptions
): DominoRippleTransform;
export function resolveNeighborDominoSlam(
  cellIndex: number | undefined,
  activeSlams: Readonly<Record<number, ActiveSlam>> | null | undefined,
  isMobile?: boolean,
  nowMs?: number
): { readonly slam: ActiveSlam; readonly distanceInCells: number } | null;
export function resolveMobilePoolDominoSlam(
  cellIndex: number | undefined,
  activeSlams: Readonly<Record<number, ActiveSlam>> | null | undefined,
  nowMs?: number
): { readonly slam: ActiveSlam; readonly distanceInCells: number } | null;
export function getMobileMonopolyArchwayGeometry(): BufferGeometry;
export function getMobileMonopolyPromenadeSlotGeometry(): BufferGeometry;
export function computeMobileMonopolyArchwayPoolSlots(
  monopolyGroups?: Record<string, MonopolyGroupInfo> | null,
  activeSlams?: Readonly<Record<number, ActiveSlam>> | null,
  nowMs?: number
): ReadonlyArray<MobileMonopolyPoolSlotMatrix>;
export function computeMobileMonopolyPromenadePoolSlots(
  monopolyGroups?: Record<string, MonopolyGroupInfo> | null
): ReadonlyArray<MobileMonopolyPoolSlotMatrix>;
export function disposeMobileMonopolyArchwayGeometries(): void;
```

**Target physical file**: `src/client/3d/monopoly_plaza_visuals.ts`
- Re-export `getCircularCellDistance`, `calculateDominoRippleTransform`, and `resolveNeighborDominoSlam` from `./monopoly_mobile_archway_visuals` keeping `monopoly_plaza_visuals.ts` at `315 LOC` (`< 350 LOC`).

**Target physical file**: `src/client/3d/war_room_stage_visuals.ts` & `src/client/3d/war_room_stage_layer.tsx`
- `war_room_stage_visuals.ts`: Map tactical postures to institutional financial terms (`'Vị Thế Chi Phối'`, `'Tích Lũy Tài Sản'`, `'Bảo Toàn Thanh Khoản'`, `'Tái Cơ Cấu Vốn'`), `#0F172A` obsidian-slate canvas fill, and frustum-safe `bubbleWorldPosition` offsets (`'sanctuary-west-north': [cx + 1.55, 1.48, cz + 0.95]`, `[ADV-01]`).
- `war_room_stage_layer.tsx` (Option B, `[ADV-03]`): Add `readonly showSpeechBubbles?: boolean;` (default `false`) to `WarRoomStageLayerProps`, set `visible={Boolean(props?.showSpeechBubbles)}` on each diplomacy speech bubble `<group>`, and guard `createDiplomacySpeechBubbleTexture` behind `Boolean(props?.showSpeechBubbles)` so `0` `CanvasTexture` instances are allocated when hidden in production while preserving `data-testid="diplomacy-speech-bubble-p1..p4"` in the React tree for `TC-403.04a`.

**Target physical file**: `src/client/3d/monopoly_plaza_fusion.tsx` & `src/client/3d/board_layout.tsx`
- Wire `slot.pitchX` into `_euler.set(slot.pitchX, slot.rotationY, 0, 'YXZ')` in `applySlotsToInstancedMesh`, check `s.position[1] > 0.118 || s.pitchX !== 0` in Mobile `useSafeFrame`, and on Desktop select the minimum `distanceInCells` across segment cells (`!activeDomino || hit.distanceInCells < activeDomino.distanceInCells`, `[ADV-04]`) and apply `fusionGroupRef.current.rotation.x = ripple.pitchRad`.
- `board_layout.tsx`: Pass `enableMobileInstancedPool={isMobile}` to `<MonopolyPlazaFusion />`.

---

## 4. Station 1: Core Contract Invariants (`tests/client/imp406_mobile_instanced_monopoly_archway.test.ts`)

- **TC-406.01 [UC-MOBILE-ARCHWAY-AND-16SLOT-PROMENADE-POOL-MATRICES/MSS]**: Given `monopolyGroups` across 0, 1 (`Do [21,23,24]`), 2 (`Nau [1,3]` + `Tim [37,39]`), and all 8 color groups simultaneously (`16` contiguous sub-spans), When calling `computeMobileMonopolyArchwayPoolSlots` and `computeMobileMonopolyPromenadePoolSlots`, Then always returns fixed-size arrays (`8` archway slots and `16` promenade slots) where active archway slots match boulevard coordinates (`localZ = -1.24m`, 1-cell tangent `localX = -0.56m`), active promenade slots scale X by `seg.promenadeWidth` (`1.68m` vs `3.48m`), and inactive slots collapse to `scale: [0, 0, 0]` and `pitchX: 0` with `0` `mergeGeometries` calls.
- **TC-406.02 [UC-FRAME0-PIERCED-ARCHWAY-GEOMETRY-AND-OPTION-B-SANCTUARY-PURITY/MSS]**: Given `getMobileMonopolyArchwayGeometry()`, `getMobileMonopolyPromenadeSlotGeometry()`, `resolveTycoonDiplomacyPosture`, and `WarRoomStageLayer`, When called synchronously at Frame 0, Then returns cached `BufferGeometry` instances with pierced window apertures exposing 6 inward-recessed cavities (`|zSurface - zInward| = 22mm >= 20mm`, exact base dimensions `0.72m x 0.68m x 0.14m`, promenade thickness `0.024m >= 20mm`, `[ADV-02]`), maps the 4 tactical modes to institutional financial slogans (`'Vị Thế Chi Phối'`, `'Tích Lũy Tài Sản'`, `'Bảo Toàn Thanh Khoản'`, `'Tái Cơ Cấu Vốn'`), and enforces Option B by hiding the floating 3D speech bubble `<group>` by default (`visible === false` and `map === null` when `showSpeechBubbles` is omitted; `visible === true` with `CanvasTexture` when `showSpeechBubbles={true}`, `[ADV-03]`) while preserving `TC-403.04a`.
- **TC-406.03 [UC-MOBILE-AND-DESKTOP-DOMINO-SHOCKWAVE-PITCH-AND-SETTLEMENT/MSS]**: Given an active slam in `activeSlams` at cell 23, When calling `resolveMobilePoolDominoSlam` and advancing `useSafeFrame` on `MonopolyPlazaFusion` (both Mobile `enableMobileInstancedPool: true` and Desktop `isMobile: false`) across positive and negative wave half-cycles (`t < 900ms`) and post-TTL (`t >= 900ms`), Then modulates active archway slot `position[1]`, `scale[1]`, and `pitchX` (rotational X pitch in `instanceMatrix` on Mobile and `fusionGroupRef.current.rotation.x` attenuated by minimum `activeDomino.distanceInCells = 1` on Desktop, `[ADV-04]`) during `< 900ms`, executes the `wasRipplingRef` settlement pass at `>= 900ms`, and preserves `resolveNeighborDominoSlam(..., true) === null` for `TC-401.03c`.
- **TC-406.04 [UC-MOBILE-FUSION-CALLSITE-AND-TC401-PARITY/MSS]**: Given `GameBoard` and `MonopolyPlazaFusion` rendered on Mobile (`isMobile: true`), When `enableMobileInstancedPool` is `false` vs `true`, Then standalone `MonopolyPlazaFusion({ monopolyGroups, isMobile: true })` returns `null` (`TC-401.04c` parity), whereas `enableMobileInstancedPool={true}` mounts `data-testid="mobile-instanced-monopoly-archways"` (`frustumCulled={false}`) and `data-testid="mobile-instanced-monopoly-promenades"` (`16` slots, `frustumCulled={false}`, `instanceColor` in `useLayoutEffect`), triggers `triggerConstructionSlam` on new monopoly acquisition, and calls `0` `SafeGLTFModel.preload`.

---

## 5. Station 3 & 4 Verification & Evidence Plan
- **Mechanical Gates**:
  1. `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_406_MOBILE_INSTANCED_MONOPOLY_ARCHWAY_AND_DOMINO_SHOCKWAVE.md --auto-sign`
  2. `npm run prefilter -- src/client/3d/monopoly_mobile_archway_visuals.ts src/client/3d/monopoly_plaza_visuals.ts src/client/3d/monopoly_plaza_fusion.tsx src/client/3d/war_room_stage_visuals.ts src/client/3d/war_room_stage_layer.tsx src/client/3d/board_layout.tsx tests/client/imp406_mobile_instanced_monopoly_archway.test.ts`
  3. Verify 100% pass on living contracts: `npx --yes vitest run tests/client/imp401_monopoly_artdeco_archway_and_domino_shockwave.test.ts tests/client/imp403_war_room_gavel_scale_and_diplomacy_halos.test.ts tests/client/imp406_mobile_instanced_monopoly_archway.test.ts`
  4. `node scripts/capture_visual_evidence.mjs --ticket imp-406 --dual-viewport --scenario board_ownership_monopoly` -> `npm run sentinel -- --ticket imp-406 --test tests/client/imp406_mobile_instanced_monopoly_archway.test.ts` || `game-3d-visual-critic` -> `npm run report -- imp-406` -> `node scripts/check_evidence.mjs imp-406`.

## 6. Definition of Done (DoD)
- [ ] `monopoly_plaza_visuals.ts` stays at `<= 320 LOC` (`< 350 LOC` Buffer Zone), `war_room_stage_visuals.ts` uses institutional financial lexicon (`'Vị Thế Chi Phối'`, `'Tích Lũy Tài Sản'`, `'Bảo Toàn Thanh Khoản'`, `'Tái Cơ Cấu Vốn'`), and `war_room_stage_layer.tsx` enforces Option B (`showSpeechBubbles` default `false`, hiding floating 3D billboards and skipping `CanvasTexture` allocation in production while keeping pedestal Halo rings + Wealth Trays and passing `TC-403.04a`, `[ADV-01]`, `[ADV-03]`).
- [ ] `getMobileMonopolyArchwayGeometry()` renders pierced window apertures exposing 6 inward-recessed cavities (`|zSurface - zInward| = 22mm >= 20mm`, `[ADV-02]`) within `8` archway slots and `16` promenade slots (`frustumCulled={false}`, `0` runtime `mergeGeometries`, `0` `SafeGLTFModel.preload`).
- [ ] Both Mobile (`MobileMonopolyPoolSlotMatrix.pitchX`) and Desktop (minimum `activeDomino.distanceInCells` + `rotation.x = ripple.pitchRad`, `[ADV-04]`) wire 100% of `calculateDominoRippleTransform` fields and auto-settle at `>= 900ms`.
- [ ] Chaos Sentinel achieves 100% mutation kill rate and `check_evidence.mjs` exits `0`.
