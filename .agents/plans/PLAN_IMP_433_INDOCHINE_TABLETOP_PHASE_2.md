# Lean Plan: IMP-433 Indochine Tabletop Phase 2: 40 Inlaid Ivory Marble Deeds & Brushed Brass Inlay

> **Ticket:** `IMP-433`  
> **Classification:** Tier 2 3D Graphics & Tactical Tabletop Material Refinement  
> **Subsystem Boundaries:** `src/client/3d/`, `tests/client/`, `tests/contracts/`  
> **Roadmap Alignment (Indochine Executive Tabletop Master Plan):**
> - **`Phase 0` (Completed):** Blender 5.2 Procedural Chassis Prototype (`board_chassis_walnut.glb`, 11.6 KB, 664 tris).
> - **`IMP-432` (Phase 1 - Completed):** Purge toy asphalt roads, zebra markings, wire serene diorama landscape (60 FPS, 14ms).
> - **`IMP-433` (Phase 2 - Current):** 40 Inlaid Ivory Marble deeds & Antique Brass Inlay on board perimeter.
> - **`IMP-434` (Phase 2.5 - Upcoming):** Sunken Velvet Dong Son Arena ($Y = -0.02$) & Bridge Landing Plazas.
> - **`Phase 3` (Upcoming):** Curving S-shaped Saigon River spline, stone embankments, and tropical botanical biome.

---

## 1. Principles Applied

- **[View-Model Seam Extraction & PBR Material Tuning]** -> Upgraded standard tile bases to tactile ivory marble (`#F5F3EF`, roughness 0.28, metalness 0.08) and corner bases to imperial dark walnut tone (`#1C1612`, roughness 0.22, metalness 0.20), updating null-atlas fallback surface to `#F5F3EF` for fallback parity.
- **[Poka-Yoke Domain Affordance & Graphic Craft]** -> Upgraded 2D canvas tile texture default background from flat `#F3EEDF` to warm ivory marble `#FDFBF7`, replacing harsh `#0F172A` / 5px border with antique burnished brass `#C5A059` (3.5px, contrast $> 4.5:1$ against `#FDFBF7` from 43m overview distance).
- **[Spatial AABB / Non-Occlusion & Raycast Invariant]** -> `resolveCellFromBoardClick` raycast guard ring $r \in [7.6, 10.5]$ and height $Y = 0.103$ (corner $0.115$) remain strictly unchanged, preventing deed click dead zones and pawn/house floating or sinking.
- **[Two-Stage Decoupling & Living Test Modernization]** -> Introduced `TileDrawerTheme` (`INDOCHINE_TILE_THEME` vs `LEGACY_TILE_THEME`). `tile_texture_generator.ts` retains `LEGACY_TILE_THEME` defaults to shield legacy living test callers (`imp40`, `pure_ivory_price_text`, `zero_2d_price_decal`, `outer_building_plot`), while production `getBoardTileAtlas` activates `INDOCHINE_TILE_THEME`.
- **[Resource Disposal & Texture Atlas Stability]** -> Preserved single 2048x2048 / 4096x4096 texture atlas pipeline in `tile_texture_atlas.ts` and merged geometry batching in `batched_board_tiles.tsx` (3 draw calls for all 40 tiles). `board_tile.tsx` remains strictly frozen.

---

## 2. Target Files & Honest LOC Accounting

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/batched_board_tiles.tsx` | Tier 2 3D Component | 179 | 192 | +13 | 500 | Safe (PBR material upgrades to ivory marble, imperial dark, & fallback parity) |
| `src/client/3d/tile_texture_drawers.ts` | Tier 2 Texture Drawer | 212 | 230 | +18 | 500 | Safe (Exports TileDrawerTheme; updates background to ivory marble & brass inlay border) |
| `src/client/3d/tile_texture_atlas.ts` | Tier 2 Texture Atlas | 330 | 344 | +14 | 500 | Safe (Syncs pre-fill & async WebP onload to #FDFBF7 with INDOCHINE_TILE_THEME) |
| `tests/client/imp433_indochine_tabletop_phase_2.test.ts` | New Living Test Suite | 0 | 195 | +195 | 600 | Safe (Station 2 contract suite) |
| `tests/contracts/imp245_board_tiles_and_standees_texture_atlas_consolidation.test.ts` | Living Contract Test | 534 | 536 | +2 | 600 | Safe (Modernizes TC-IMP245.10 to accept #FDFBF7 or #F3EEDF) |

---

## 3. Core Contract Invariants & Architectural Seams

1. **[INV-433.01: Inlaid Ivory Marble & Imperial Dark Tile Bases PBR & Fallback Parity]**:
   - In `src/client/3d/batched_board_tiles.tsx`:
     - Standard bases (`batched-standard-bases`): material uses ivory marble tone `#F5F3EF`, roughness `0.28`, metalness `0.08`, `envMapIntensity: 1.0`.
     - Corner bases (`batched-corner-bases`): material uses imperial dark walnut tone `#1C1612`, roughness `0.22`, metalness `0.20`, `envMapIntensity: 1.2`.
     - Null-atlas fallback surface: updated to `#F5F3EF`, roughness `0.28`, metalness `0.08` for headless/SSR parity.
     - Preserves raycast hit detection `resolveCellFromBoardClick` with guard ring $r \in [7.6, 10.5]$ and surface elevation $Y = 0.103$ (corner $0.115$).

2. **[INV-433.02: Theme Architecture & High-Contrast Antique Brass Inlay]**:
   - In `src/client/3d/tile_texture_drawers.ts`:
     - Exports `TileDrawerTheme` with `INDOCHINE_TILE_THEME` (`background: '#FDFBF7'`, `borderColor: '#C5A059'`, `borderWidth: 3.5`) and `LEGACY_TILE_THEME` (`background: '#F3EEDF'`, `borderColor: '#0F172A'`, `borderWidth: 5`).
     - `drawTileHeader` and `drawFooter` accept optional `theme?: TileDrawerTheme = INDOCHINE_TILE_THEME`.
     - Antique brass `#C5A059` delivers $> 4.5:1$ contrast against `#FDFBF7`, maintaining crisp separation from overview camera distance ($\sim 43\text{m}$, FOV 24).

3. **[INV-433.03: Texture Atlas Synchronization & Async WebP Bleed Elimination]**:
   - In `src/client/3d/tile_texture_atlas.ts`:
     - Global atlas pre-fill (line 226) and async WebP `img.onload` (line 180) use `#FDFBF7`, eliminating two-tone beige box bleeding.
     - `drawAtlasTileArt` and `tile_texture_drawers.ts#L122` synchronize art background fill to `#FDFBF7`.
     - `getBoardTileAtlas` default generation passes `INDOCHINE_TILE_THEME`.

4. **[INV-433.04: Living Test Isolation & Freezing Guard]**:
   - `src/client/3d/board_tile.tsx` remains strictly FROZEN. Living contract tests `tests/client/imp363_batched_board_tiles.test.ts` and `tests/client/phase1_pbr_beveled.test.ts` remain 100% green.
   - `tile_texture_generator.ts` retains `LEGACY_TILE_THEME` for `getTileTexture`, preserving `imp40`, `pure_ivory_price_text`, `zero_2d_price_decal`, and `outer_building_plot`.

### 3.1 Call-Site Wiring across Subsystems

```typescript
// 1. In src/client/3d/batched_board_tiles.tsx
<meshStandardMaterial color="#F5F3EF" roughness={0.28} metalness={0.08} envMapIntensity={1.0} />
<meshStandardMaterial color="#1C1612" roughness={0.22} metalness={0.20} envMapIntensity={1.2} />

// 2. In src/client/3d/tile_texture_drawers.ts
export interface TileDrawerTheme {
  readonly background: string;
  readonly borderColor: string;
  readonly borderWidth: number;
}
export const INDOCHINE_TILE_THEME: TileDrawerTheme = {
  background: '#FDFBF7',
  borderColor: '#C5A059',
  borderWidth: 3.5,
};

// 3. In src/client/3d/tile_texture_atlas.ts
ctx.fillStyle = '#FDFBF7';
ctx.fillRect(0, 0, canvas.width, canvas.height);
drawTileHeader(ctx, meta, idx, INDOCHINE_TILE_THEME);
drawFooter(ctx, meta, idx, INDOCHINE_TILE_THEME);
```

---

## 4. Contract Test Scenarios (Station 2 Specification)

- **TC-433.01 [UC-IVORY-MARBLE-STANDARD-BASES-PBR/MSS]**: Given `BatchedBoardTiles` rendered in SSR static markup, When inspecting standard base material, Then color contains `#F5F3EF`, roughness is `0.28`, and metalness is `0.08`.
- **TC-433.02 [UC-IMPERIAL-DARK-CORNER-BASES-PBR/MSS]**: Given `BatchedBoardTiles` rendered in SSR static markup, When inspecting corner base material, Then color contains `#1C1612`, roughness is `0.22`, and metalness is `0.20`.
- **TC-433.03 [UC-IVORY-MARBLE-BACKGROUND-CANVAS/MSS]**: Given `drawTileHeader` in `tile_texture_drawers.ts` with `INDOCHINE_TILE_THEME`, When executing header drawing on canvas context, Then fills background with ivory marble tone `#FDFBF7`.
- **TC-433.04 [UC-ANTIQUE-BRASS-INLAY-BORDER-CANVAS/MSS]**: Given `drawFooter` in `tile_texture_drawers.ts` with `INDOCHINE_TILE_THEME`, When executing footer border drawing, Then strokes perimeter with antique brass `#C5A059` with lineWidth `3.5`.
- **TC-433.05 [UC-ATLAS-PREFILL-AND-FALLBACK-PARITY/MSS]**: Given `getBoardTileAtlas` and `BatchedBoardTiles` fallback surface, When checking initial canvas fill and fallback surface, Then atlas pre-fill is `#FDFBF7` and fallback surface color is `#F5F3EF`.

---

## 5. Definition of Done (DoD) & Stopping Criteria

- [x] Plan audited and signed via `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_433_INDOCHINE_TABLETOP_PHASE_2.md --auto-sign`.
- [x] Blind adversarial challenge addressed across all 5 directives in `.agents/audit/PLAN_CHALLENGE_IMP-433.md`.
- [ ] Station 1.8 Human approval gate passed ("đồng ý").
- [ ] Station 2: `tests/client/imp433_indochine_tabletop_phase_2.test.ts` authored with 5 atomic tests (Semantic Behavioral RED verified).
- [ ] Station 2.5: Implementation complete in `batched_board_tiles.tsx`, `tile_texture_drawers.ts`, `tile_texture_atlas.ts` (All tests GREEN).
- [ ] Station 3: Prefilter exit 0, Scope Check exit 0.
- [ ] Station 3: Physical visual capture executed via `node scripts/capture_visual_evidence.mjs --ticket IMP-433 --scenario board_ownership_monopoly`.
- [ ] Station 3.5: Chaos Sentinel kill rate 100%, Visual Critic review conducted.
- [ ] Station 4: Evidence verified via `check_evidence.mjs IMP-433`, final report synthesized.
