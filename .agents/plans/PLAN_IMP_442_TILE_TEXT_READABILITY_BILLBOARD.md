# Implementation Plan: IMP-442 Bilateral Tile Text Readability (In Chữ Hai Chiều Đối Xứng - KISS)

## 1. Physical Surface Area & Target Files
| Target File | Tier | Current LOC | Expected LOC | Net Delta | Subsystem | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/tile_texture_drawers.ts` | Tier 1 | 241 | 265 | +24 | client-3d | Safe |
| `tests/client/imp442_tile_text_readability_billboard.test.ts (New)` | Living Tests (New) | 0 | 120 | +120 | client-3d | New |

> **KISS Architecture Commitment**: Exactly 1 production file modified (`src/client/3d/tile_texture_drawers.ts`), ~20 lines net delta. Zero new 3D quads, zero frame-loop calculations, zero extra VRAM, and 100% 60 FPS preservation.

## 2. Core Contract Invariants
- **[INV-BILATERAL-PROPERTY-HEADER-TYPOGRAPHY]**: In `src/client/3d/tile_texture_drawers.ts`, `drawPropertyHeader(ctx, meta)` renders bilateral dual-direction typography:
  1. Primary forward title `meta.title` at $y = 28$ with font `900 28px` (preserving existing living tests and forward player readability).
  2. Secondary inverted micro-title `meta.title` at $y = 10$ rotated $\pi$ ($180^\circ$) via atomic transform (`ctx.save(); ctx.translate(128, 10); ctx.rotate(Math.PI); ctx.fillText(meta.title, 0, 0); ctx.restore()`) with font `bold 11px` and matching banner contrast fill (`getBannerTextColor(meta.bannerColor)`), enabling legibility from opposite camera angles.
- **[INV-BILATERAL-NON-PROPERTY-HEADER-TYPOGRAPHY]**: In `src/client/3d/tile_texture_drawers.ts`, `drawNonPropertyHeader(ctx, meta, index)` renders:
  1. Primary forward title `meta.title` at $y = 30$ with font `900 26px #0F172A` (preserving existing living tests).
  2. Secondary inverted micro-title `meta.title` at $y = 10$ rotated $\pi$ ($180^\circ$) via atomic transform (`ctx.save(); ctx.translate(128, 10); ctx.rotate(Math.PI); ctx.fillText(meta.title, 0, 0); ctx.restore()`) with font `bold 11px #64748B`.
- **[INV-ZERO-VRAM-AND-ZERO-DRAW-CALL-OVERHEAD]**: Bilateral typography is baked directly into the 2D canvas of existing tile textures. Exactly 0 new draw calls, 0 new meshes, 0 floating billboard quads, and 0 bytes of additional GPU VRAM.

## 3. Principles Applied
- **[View-Model Seam Extraction]**: Dual-direction typography calculations and canvas coordinate offsets are encapsulated as pure formatting logic inside `tile_texture_drawers.ts`.
- **[Spatial AABB / Non-Occlusion]**: Inverted headers ($y = 10$) stay strictly within the top banner boundary ($y \le 56$), maintaining 100% clearance from artwork and 3D buildings.
- **[Resource Disposal & Cache Hygiene]**: Strict `ctx.save()` / `ctx.restore()` pairing ensures zero matrix transform leakage across the 40-tile atlas rendering loop.

## 4. Call-Site Wiring & Contract Specifications

### 4.1 `src/client/3d/tile_texture_drawers.ts`
- In `drawPropertyHeader`:
  - After rendering primary title at $(128, 28)$, add atomic inverted micro-title:
    ```ts
    ctx.save();
    ctx.translate(128, 10);
    ctx.rotate(Math.PI);
    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = textColor;
    ctx.fillText(meta.title, 0, 0);
    ctx.restore();
    ```
- In `drawNonPropertyHeader`:
  - After rendering primary title at $(128, 30)$, add atomic inverted micro-title:
    ```ts
    ctx.save();
    ctx.translate(128, 10);
    ctx.rotate(Math.PI);
    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText(meta.title, 0, 0);
    ctx.restore();
    ```

## 5. Station 1 Test Specifications
- TC-442.01 [UC-BILATERAL-PROPERTY-HEADER/MSS]: Given `drawPropertyHeader` in `tile_texture_drawers.ts` with mock canvas context, When rendering property cell 11 (Bình Thuận), Then executes `ctx.translate(128, 10)`, `ctx.rotate(Math.PI)`, and `ctx.fillText('BÌNH THUẬN', 0, 0)` under a paired save/restore, while maintaining primary title at $y = 28$.
- TC-442.02 [UC-BILATERAL-NON-PROPERTY-HEADER/MSS]: Given `drawNonPropertyHeader` in `tile_texture_drawers.ts`, When rendering non-property cell 5, Then executes `ctx.translate(128, 10)`, `ctx.rotate(Math.PI)`, and `ctx.fillText(meta.title, 0, 0)`, while maintaining primary title at $y = 30$.
- TC-442.03 [UC-LIVING-REGRESSION-SAFETY/MSS]: Given full regression suite across `imp80`, `imp90`, and `imp38`, When executed, Then 100% of existing living contract tests pass without failure.

## 6. Definition of Done
- 100% test pass on `tests/client/imp442_tile_text_readability_billboard.test.ts`
- Zero regressions across living tests (`tests/contracts/imp80_daylight_illumination_and_unified_tile_art.test.ts`, `tests/contracts/imp90_non_property_tile_distinct_format.test.ts`, `tests/client/tile_text_crispness_and_overview_legibility.test.ts`)
- Full prefilter passes (`npm run prefilter`)
- Physical visual capture: `npm run capture:visual -- --ticket IMP-442 --scenario board_ownership_monopoly --dual-viewport`
- Sentinel passes with 100% mutant kill (`npm run sentinel -- --ticket IMP-442 --test tests/client/imp442_tile_text_readability_billboard.test.ts`)
- Comprehensive evidence audit: `node scripts/check_evidence.mjs IMP-442`

