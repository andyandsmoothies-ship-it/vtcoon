# PLAN_IMP_407: 3D Spatial Geometry SSOT, Overview Frustum Projection & WebGL Canvas Text Sanitizer (Harness V6.0)

## 1. Context & Architectural Goal
- **Source Strategy Reports**: [`VTCOON_SDLC_HARNESS_AND_SPATIAL_HARDENING_PROPOSAL_REPORT.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/analysis/VTCOON_SDLC_HARNESS_AND_SPATIAL_HARDENING_PROPOSAL_REPORT.md) & [`RETRO_2026-10-15_IMP399_IMP406_3D_BLENDER_AND_CROSSPLATFORM_SDLC.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/audits/RETRO_2026-10-15_IMP399_IMP406_3D_BLENDER_AND_CROSSPLATFORM_SDLC.md).
- **Subsystem Boundary Isolation**: Slices Group 1 into `client-3d` runtime core (IMP-407), keeping `scripts/` tooling isolated for a dedicated tooling ticket (IMP-408) to satisfy `rules_scope.mjs` mechanical gate (`[CROSS_SUBSYSTEM_CONTAMINATION]`).
- **Problems**:
  1. AABB spatial calculations across 3D board entities were previously implemented via ad-hoc unscaled box math (`halfW = width * 0.5`), ignoring `scale` and yaw `rotationY` (e.g., Wealth Trays at `yaw = -0.15rad` or Archways at `yaw = ±π/2`), causing rotated structures to clip neighboring pedestals.
  2. 3D elements calculate world positions without a centralized project-to-frustum utility, risking clipping outside the active camera frustum (`CAMERA_CONFIG.overview`). Local duplicate cameras existed in `war_room_stage_visuals.ts#L79-L89`. Hardcoding `aspect = 1.6` prevented responsive Mobile Portrait (aspect ~0.56) frustum safety calculations.
  3. In [`src/client/3d/war_room_stage_visuals.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/war_room_stage_visuals.ts) (currently at `381 LOC`, Buffer Zone $\ge 350$ LOC), `createDiplomacySpeechBubbleTexture` relied on an ad-hoc regex failing on emoji and unhandled Unicode, while caching on raw slogan keys instead of sanitized text.
- **Refactor-First Solution & Architecture**:
  1. **SSOT Spatial Geometry Deep Module ([`src/client/3d/spatial_geometry_helpers.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/spatial_geometry_helpers.ts))**:
     - `computeTransformedAABB2D`: Computes exact 2D bounding boxes on ground plane X-Z (`center[2]` depth for 3D tuples), handling `Math.abs` scales and yaw `rotationY`. Extents: $E_x = \frac{W \cdot |s_x|}{2}|\cos\theta| + \frac{D \cdot |s_z|}{2}|\sin\theta|$ and $E_z = \frac{W \cdot |s_x|}{2}|\sin\theta| + \frac{D \cdot |s_z|}{2}|\cos\theta|$.
     - `checkAABBCollision2D`: Deterministic intersection check with parameterized clearance margin `clearanceM`.
     - `projectToOverviewNdc` & `isOverviewFrustumSafe`: Accepts `pos: readonly [number, number, number]` and optional `aspect: number = 1.6` under `CAMERA_CONFIG.overview` (`pos: [24.6, 25.3, 24.6]`, `target: [2.2, 0, 2.2]`, `fov: 24`), evaluating safety thresholds (`|ndcX| <= 0.85`, `|ndcY| <= 0.80`).
  2. **WebGL Canvas Text Sanitizer ([`src/client/3d/canvas_text_sanitizer.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/canvas_text_sanitizer.ts))**:
     - `sanitizeCanvasText`: Normalizes via `rawText.normalize('NFC')`, strips emojis via `/\p{Extended_Pictographic}|\p{Emoji_Presentation}|[\uFE00-\uFE0F]/gu`, preserves letters (`\p{L}`), marks (`\p{M}`), numerals (`\p{N}`), currency (`\p{Sc}`: `₫`, `$`), math/percent (`+`, `%`), and safe punctuation (`.,!?'"()\-:;`). Fallbacks to default `'...'` if trimmed result is empty. Zero dead types (no unconsumed `SanitizedTextResult`).
     - `hasMissingGlyphEmoji`: Pure boolean detector identifying unrenderable emoji symbols.
  3. **Refactor-First Closed-Loop Integration in `war_room_stage_visuals.ts`**:
     - Excise local duplicate `projectToOverviewNdc` (-11 LOC) and delegate to `spatial_geometry_helpers.ts`, dropping file to ~`371 LOC`.
     - Wire `computeTransformedAABB2D` and `checkAABBCollision2D` into `getWarRoomStageDescriptor()`: checks Gavel (`[11.12, -0.08, 2.02]`) vs Scale (`[11.88, -0.08, 2.38]`) clearance non-collision (`clearanceM = 0.20m`), populating `readonly isEquipmentClearanceSafe: boolean` on `WarRoomStageDescriptor` (defeating Sentinel survivor).
     - Delegate text cleaning to `sanitizeCanvasText` and index texture cache using sanitized `renderedText`.
  4. **Technical Debt Scope Recording**:
     - `coastal_sanctuary_visuals.ts#L82-L89` and `toybox_wealth_tray_visuals.ts#L79-L105` duplicate overview camera logic. Due to the 3-production-file scope confinement limit, they are recorded as technical debt (`[TECH-DEBT-OVERVIEW-CAM-DEDUP]`) to be migrated in follow-up tickets.

### Principles Applied
- **View-Model Seam Extraction** -> Extracted pure spatial projection and canvas text sanitation into dedicated pure helpers without WebGL state.
- **Spatial AABB / Non-Occlusion** -> Standardized rotated/scaled AABB geometry with 3D X-Z ground plane indexing; verified Gavel vs Trade Scale non-collision.
- **100% DTO & Call-Site Wiring** -> Wired `isEquipmentClearanceSafe` into `WarRoomStageDescriptor` and `sanitizeCanvasText` into texture caching.
- **Equivalence-Partition Testing** -> Partitioned across unrotated vs rotated, unscaled vs scaled, landscape vs portrait aspect, NFC vs NFD, currencies (`₫`, `$`), and emojis.
- **Relational Multi-Point Assertion** -> Proves covariance across scales ($f(s_1) \neq f(s_2)$), rotations ($f(0) \neq f(\pi/4)$), and aspect ratios.
- **Resource Disposal & Cache Hygiene** -> Unified speech bubble texture cache keys using `renderedText` to prevent duplicate GPU texture allocations.

---

## 2. Target Files & Honest LOC Accounting

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/spatial_geometry_helpers.ts` | Tier 2 (3D) | 0 | 115 | ~+115 | 500 | Safe (New) |
| `src/client/3d/canvas_text_sanitizer.ts` | Tier 2 (3D) | 0 | 75 | ~+75 | 500 | Safe (New) |
| `src/client/3d/war_room_stage_visuals.ts` | Tier 2 (3D) | 381 | 373 | ~-8 | 500 | Safe (Refactored) |
| `src/client/3d/war_room_stage_layer.tsx` | Tier 2 (3D) | 294 | 294 | ~+0 | 500 | Safe |
| `docs/FEATURE_MAP.md` | Docs | 93 | 93 | ~+0 | N/A | Safe |
| `tests/client/imp407_spatial_geometry_and_canvas_text_sanitizer.test.ts` | Living Test | 0 | 280 | ~+280 | 600 | Safe (New) |

---

## 3. Lean Type & Exported Symbol Contracts

**Target physical file**: `src/client/3d/spatial_geometry_helpers.ts` (New)
```typescript
export interface Box2D {
  readonly minX: number;
  readonly maxX: number;
  readonly minZ: number;
  readonly maxZ: number;
  readonly width: number;
  readonly depth: number;
}

export interface TransformedAABBSpec {
  readonly center: readonly [number, number, number] | readonly [number, number];
  readonly baseSize: { readonly width: number; readonly depth: number };
  readonly scale?: readonly [number, number, number] | readonly [number, number];
  readonly rotationY?: number;
}

export function computeTransformedAABB2D(spec: TransformedAABBSpec): Box2D;
export function checkAABBCollision2D(boxA: Box2D, boxB: Box2D, clearanceM?: number): boolean;
export function projectToOverviewNdc(
  pos: readonly [number, number, number],
  aspect?: number
): readonly [ndcX: number, ndcY: number];
export function isOverviewFrustumSafe(
  pos: readonly [number, number, number],
  aspect?: number,
  maxNdcX?: number,
  maxNdcY?: number
): boolean;
```

**Target physical file**: `src/client/3d/canvas_text_sanitizer.ts` (New)
```typescript
export const DEFAULT_CANVAS_TEXT_FALLBACK = '...';

export function sanitizeCanvasText(rawText: string, fallback?: string): string;
export function hasMissingGlyphEmoji(rawText: string): boolean;
```

**Target physical file**: `src/client/3d/war_room_stage_visuals.ts`
- Remove local `cachedWarRoomCamera`, `OVERVIEW_ASPECT`, and `projectToOverviewNdc` (lines 79–89).
- Update `WarRoomStageDescriptor` interface: add `readonly isEquipmentClearanceSafe: boolean;`.
- Import `projectToOverviewNdc`, `computeTransformedAABB2D`, `checkAABBCollision2D` from `./spatial_geometry_helpers`.
- Import `sanitizeCanvasText` from `./canvas_text_sanitizer`.
- In `getWarRoomStageDescriptor()`: compute gavel and scale AABBs, evaluate non-collision with `clearanceM = 0.20`, and assign `isEquipmentClearanceSafe: !checkAABBCollision2D(gavelBox, scaleBox, 0.20)`.
- In `createDiplomacySpeechBubbleTexture()`: sanitize slogan first (`renderedText = sanitizeCanvasText(viSlogan)`), use `renderedText` for cache key `key = `${tacticalMode}:${accentColor}:${renderedText}``, and draw `renderedText`.

---

## 4. Station 1: Core Contract Invariants (`tests/client/imp407_spatial_geometry_and_canvas_text_sanitizer.test.ts`)

- **TC-407.01 [UC-TRANSFORMED-AABB-SCALING-AND-ROTATION-SSOT/MSS]**: Given box center `[cx, cy, cz]`, base size `{ width: 2.0, depth: 1.0 }`, scale `[-1.5, 1, 2.0]` (negative scale guard), and yaw rotation $\theta = \pi/4$, When `computeTransformedAABB2D` and `checkAABBCollision2D` are called, Then extents calculate $E_x = \frac{3.0}{2}|\cos\frac{\pi}{4}| + \frac{2.0}{2}|\sin\frac{\pi}{4}| \approx 1.7678\text{m}$, $E_z \approx 1.7678\text{m}$, asserts relational covariance across scales ($f(s_1) \neq f(s_2)$) and rotations ($f(0) \neq f(\pi/4)$), and returns true for overlapping boxes and false when separated by `clearanceM = 0.20m`.
- **TC-407.02 [UC-OVERVIEW-CAMERA-FRUSTUM-PROJECTION-AND-SAFETY-GUARD/MSS]**: Given world coordinates across board corners, sanctuary islands (`[-12.4, -0.28, 1.6]`), and distant points (`[-18.5, 0, 18.5]`), When calling `projectToOverviewNdc` and `isOverviewFrustumSafe` across desktop aspect (1.6) and mobile portrait (9/16 ≈ 0.5625), Then maps world points to normalized device coordinates `[ndcX, ndcY]` without `NaN`, returning `isOverviewFrustumSafe = true` for sanctuary points in landscape and `false` for off-screen bounds or narrow portrait bounds.
- **TC-407.03 [UC-CANVAS-TEXT-GLYPH-SANITATION-AND-EMOJI-PURGE/MSS]**: Given raw strings with leading/trailing emojis, mixed symbols (`⭐`, `⏰`, `🇻🇳`, `👑`, `🚨`), Vietnamese diacritics in NFC/NFD (`"👑 Bá Chủ Độc Quyền"`, `"🚨 Cứu Thanh Khoản! ⚠️"`), currency and financial symbols (`"Thưởng 500k ₫"`, `"+15% Thuế"`, `"Cứu trợ $10,000"`), and all-emoji strings (`"👑"`), When `sanitizeCanvasText` and `hasMissingGlyphEmoji` are invoked, Then strips 100% of emojis, preserves accented Vietnamese letters, currency (`₫`, `$`), math/percent (`+`, `%`), and punctuation (`"Bá Chủ Độc Quyền"`, `"Thưởng 500k ₫"`, `"+15% Thuế"`), fallbacks `"👑"` to `'...'`, with `hasMissingGlyphEmoji` returning true for emoji strings and false for sanitized output.
- **TC-407.04 [UC-WAR-ROOM-INTEGRATION-AND-CALLSITE-WIRING/MSS]**: Given `createDiplomacySpeechBubbleTexture` and `getWarRoomStageDescriptor` in `war_room_stage_visuals.ts`, When executing dais projection, stage equipment layout, and speech bubble generation, Then delegates to imported `projectToOverviewNdc`, validates Gavel vs Trade Scale non-collision clearance assigning `descriptor.isEquipmentClearanceSafe === true`, indexes texture cache by sanitized `renderedText` preventing duplicate allocations, and passes `TC-403.03a`, `TC-403.03b`, and `TC-403.04a` living contracts.

---

## 5. Station 3 & 4 Verification & Evidence Plan
- **Mechanical Gates**:
  1. `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_407_SPATIAL_GEOMETRY_AND_CANVAS_TEXT_SANITIZER.md --auto-sign`
  2. `npm run prefilter -- src/client/3d/spatial_geometry_helpers.ts src/client/3d/canvas_text_sanitizer.ts src/client/3d/war_room_stage_visuals.ts src/client/3d/war_room_stage_layer.tsx tests/client/imp407_spatial_geometry_and_canvas_text_sanitizer.test.ts`
  3. Verify 100% pass on living contracts: `npx --yes vitest run tests/client/imp403_war_room_gavel_scale_and_diplomacy_halos.test.ts tests/client/imp406_mobile_instanced_monopoly_archway.test.ts tests/client/imp407_spatial_geometry_and_canvas_text_sanitizer.test.ts`
  4. `node scripts/capture_visual_evidence.mjs --ticket imp-407 --scenario board_ownership_monopoly` -> `npm run sentinel -- --ticket imp-407 --test tests/client/imp407_spatial_geometry_and_canvas_text_sanitizer.test.ts` -> `npm run report -- imp-407` -> `node scripts/check_evidence.mjs imp-407`.

## 6. Definition of Done (DoD)
- [ ] `src/client/3d/spatial_geometry_helpers.ts` implements `computeTransformedAABB2D`, `checkAABBCollision2D`, `projectToOverviewNdc`, and `isOverviewFrustumSafe` with `<= 120 LOC`.
- [ ] `src/client/3d/canvas_text_sanitizer.ts` implements `sanitizeCanvasText` and `hasMissingGlyphEmoji` with `<= 80 LOC` (0 dead types).
- [ ] `war_room_stage_visuals.ts` removes duplicate camera, wires Gavel vs Scale clearance to `isEquipmentClearanceSafe`, imports text sanitizer, and drops to `<= 375 LOC`.
- [ ] Living test suite `tests/client/imp407_spatial_geometry_and_canvas_text_sanitizer.test.ts` passes 100% with 4 atomic tests, assertion density `<= 4.00`, and `<= 300 LOC`.
- [ ] Chaos Sentinel achieves 100% mutation kill rate and `check_evidence.mjs` exits `0`.
