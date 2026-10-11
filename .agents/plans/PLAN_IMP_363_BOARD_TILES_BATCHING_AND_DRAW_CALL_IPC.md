# Plan IMP-363: Board Tiles Merged Batching & WebKit Draw Call IPC Optimization (Ticket IMP-363)

## 0. Context & Architectural Rationale
- **Prior In-Flight Scope**:
  - Ticket IMP-361 implemented iOS WebGL performance tuning: iOS Phone Retina DPR clamping (0.75–0.82) and WebGL context hints.
  - Ticket IMP-362 implemented Mobile Backdrop Blur Purge across CSS and HUD elements to eliminate WebKit compositor readback stalls.
- **Problem Statement (Hòn đá 1: WebKit Draw Call IPC Tax)**:
  - On iOS WKWebView / Safari, WebGL execution runs out-of-process in `com.apple.WebKit.GPU`. Every draw call must be serialized and dispatched via IPC Mach messages.
  - Currently, `GameBoard` renders 40 individual `<LayeredDioramaTile>` components. Each tile renders its own `RoundedBox` base and its own surface `mesh` with `tileGeometry` and `tileAtlas`.
  - These two layers alone produce **80 Draw Calls** per frame for static board terrain, consuming 5–7ms CPU time on WebKit IPC dispatch before the GPU can begin vertex shading.
- **Architectural Solution (Zero-Alloc Merged Geometry Batching)**:
  1. **Batched Surfaces Geometry (`src/client/3d/batched_board_tiles.tsx`)**:
     - Precompute and merge all 40 UV-mapped tile plane geometries (`getTileAtlasGeometry`) using Three.js `mergeGeometries` with baked world-space transforms (`cellPosition` + `tileRotation`).
     - Renders all 40 tile surfaces in **exactly 1 Draw Call** using the shared 2048x2048 `tileAtlas`.
  2. **Batched Base Plinths Geometry**:
     - Merge 36 standard rectangular base boxes ($1.68 \times 0.2 \times 2.2$) into 1 BufferGeometry (1 Draw Call).
     - Merge 4 corner square base boxes ($2.2 \times 0.22 \times 2.2$) into 1 BufferGeometry (1 Draw Call).
     - Reduces total static tile draw calls from **80 calls down to 3 calls (-96.25%)**.
  3. **High-Precision Raycast Cell Resolver**:
     - Export pure math helper `resolveCellFromBoardClick(x, z)` to map intersection coordinates back to cell index $[0..39]$ with $< 0.001\text{ms}$ latency.
  4. **Strict Backward Compatibility**:
     - Add `renderBasePlinth?: boolean = true` and `renderAtlasSurface?: boolean = true` to `LayeredDioramaTileProps`.
     - In `GameBoard`, set both to `false` so `<LayeredDioramaTile>` handles only dynamic overlays (event aura, owner trim, monopoly crest, price pill).
     - Standalone contract suites continue testing `LayeredDioramaTile` with 100% full markup retention.

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-363`
- **Subsystem**: `client-3d` (Tier 2 3D Presentation & Visual Batching)
- **Direct Scope (Physical Files)**:
  - **Target physical file**: `src/client/3d/board_tile.tsx` (Refactor)
  - **Target physical file**: `src/client/3d/board_layout.tsx` (Refactor)
  - **Target physical file**: `src/client/3d/batched_board_tiles.tsx` (Refactor)
  - **Target physical file**: `tests/client/imp363_batched_board_tiles.test.ts` (Tệp mới)
- **Referenced Contracts / Stable Boundaries**:
  - `src/client/3d/board_coords.ts` (`cellPosition`)
  - `src/client/3d/tile_texture_atlas.ts` (`getTileAtlasGeometry`, `getBoardTileAtlas`)

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/board_tile.tsx` | Tier 2 (UI/3D/Views) | 334 | 344 | +10 | <= 500 | Safe (< 360 LOC) |
| `src/client/3d/board_layout.tsx` | Tier 2 (UI/3D/Views) | 213 | 222 | +9 | <= 500 | Safe (< 250 LOC) |
| `src/client/3d/batched_board_tiles.tsx` | Tier 2 (UI/3D/Views) | 24 | 24 | 0 | <= 500 | Safe (< 200 LOC) |
| `tests/client/imp363_batched_board_tiles.test.ts` | Living Test | 0 | 125 | +125 | <= 600 | 🆕 Tệp mới |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- Write living contract test suite in `tests/client/imp363_batched_board_tiles.test.ts`:
  - TC-363.01 [UC-BATCHED-GEOM/MSS]: Given 40 board tiles, When calling createBatchedTileSurfacesGeometry, Then returns a valid merged BufferGeometry combining all 40 tiles with atlas UVs.
  - TC-363.02 [UC-BATCHED-BASES/MSS]: Given board layout, When calling createBatchedTileBasesGeometry, Then returns merged standard bases and merged corner bases geometries.
  - TC-363.03 [UC-CLICK-RAYCAST/MSS]: Given arbitrary world coordinates near cell positions, When calling resolveCellFromBoardClick, Then accurately maps to the nearest cell index [0..39].
  - TC-363.04 [UC-BATCHED-COMPONENT/MSS]: Given BatchedBoardTiles mounted, When evaluating rendered markup, Then renders batched tile surfaces and bases seamlessly.
  - TC-363.05 [UC-LAYERED-TILE-PROP-PARITY/MSS]: Given LayeredDioramaTile with renderBasePlinth=false and renderAtlasSurface=false, When rendering, Then omits static bases while preserving dynamic owner trims and price pills.
  - TC-363.06 [UC-RETRO-COMPATIBILITY/MSS]: Given LayeredDioramaTile with default props (unspecified), When rendering, Then preserves 100% legacy base and surface markup for existing contract suites.
  - TC-363.07 [UC-TIER-COLOR/MSS]: Given tierColor helper in board tile, When level is 3, Then returns gold #D4AF37, else teal #008080.

### Station 2: Minimal Production Implementation (GREEN)

#### Task 1: LayeredDioramaTile Optional Static Mesh Gating in `src/client/3d/board_tile.tsx`
**Target physical file**: `src/client/3d/board_tile.tsx`
```typescript
<<<<
  readonly isMobile?: boolean;
  readonly renderToyBuildings?: boolean;
}

export function tierColor(level: number): string {
====
  readonly isMobile?: boolean;
  readonly renderToyBuildings?: boolean;
  readonly renderBasePlinth?: boolean;
  readonly renderAtlasSurface?: boolean;
}

export function tierColor(level: number): string {
>>>>
```

```typescript
<<<<
  isMobile: propIsMobile,
  renderToyBuildings = true,
}: LayeredDioramaTileProps): React.ReactElement {
====
  isMobile: propIsMobile,
  renderToyBuildings = true,
  renderBasePlinth = true,
  renderAtlasSurface = true,
}: LayeredDioramaTileProps): React.ReactElement {
>>>>
```

```typescript
<<<<
        {/* Corner tile — larger square base with polished stone PBR and rounded beveled edges */}
        <RoundedBox args={[2.2, 0.22, 2.2]} radius={0.08} smoothness={isMobile ? 1 : 4} receiveShadow>
          <meshStandardMaterial color="#1E293B" roughness={0.16} metalness={0.25} envMapIntensity={1.2} />
        </RoundedBox>
        {/* Inner corner accent badge with texture */}
        <mesh position={[0, 0.115, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={tileGeometry} receiveShadow>
          {tileAtlas ? (
            <meshStandardMaterial map={tileAtlas} roughness={0.98} metalness={0.0} envMapIntensity={0.0} />
          ) : (
            <meshStandardMaterial color="#1E293B" roughness={0.25} metalness={0.1} />
          )}
        </mesh>
      </group>
    );
  }
====
        {/* Corner tile — larger square base with polished stone PBR and rounded beveled edges */}
        {renderBasePlinth && (
          <RoundedBox args={[2.2, 0.22, 2.2]} radius={0.08} smoothness={isMobile ? 1 : 4} receiveShadow>
            <meshStandardMaterial color="#1E293B" roughness={0.16} metalness={0.25} envMapIntensity={1.2} />
          </RoundedBox>
        )}
        {/* Inner corner accent badge with texture */}
        {renderAtlasSurface && (
          <mesh position={[0, 0.115, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={tileGeometry} receiveShadow>
            {tileAtlas ? (
              <meshStandardMaterial map={tileAtlas} roughness={0.98} metalness={0.0} envMapIntensity={0.0} />
            ) : (
              <meshStandardMaterial color="#1E293B" roughness={0.25} metalness={0.1} />
            )}
          </mesh>
        )}
      </group>
    );
  }
>>>>
```

```typescript
<<<<
      {/* 1. Base tile — Polished ivory cream parchment PBR with rounded beveled edges */}
      <RoundedBox args={[1.68, 0.2, 2.2]} radius={0.08} smoothness={isMobile ? 1 : 4} receiveShadow>
        <meshStandardMaterial color="#EDE5D8" roughness={0.35} metalness={0.06} envMapIntensity={1.0} />
      </RoundedBox>
====
      {/* 1. Base tile — Polished ivory cream parchment PBR with rounded beveled edges */}
      {renderBasePlinth && (
        <RoundedBox args={[1.68, 0.2, 2.2]} radius={0.08} smoothness={isMobile ? 1 : 4} receiveShadow>
          <meshStandardMaterial color="#EDE5D8" roughness={0.35} metalness={0.06} envMapIntensity={1.0} />
        </RoundedBox>
      )}
>>>>
```

```typescript
<<<<
      {/* 2. Top surface information texture with subtle lacquer sheen */}
      {tileAtlas ? (
        <mesh position={[0, 0.103, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={tileGeometry} receiveShadow>
          <meshStandardMaterial map={tileAtlas} roughness={0.98} metalness={0.0} envMapIntensity={0.0} />
        </mesh>
      ) : (
====
      {/* 2. Top surface information texture with subtle lacquer sheen */}
      {renderAtlasSurface && tileAtlas ? (
        <mesh position={[0, 0.103, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={tileGeometry} receiveShadow>
          <meshStandardMaterial map={tileAtlas} roughness={0.98} metalness={0.0} envMapIntensity={0.0} />
        </mesh>
      ) : !renderAtlasSurface ? null : (
>>>>
```

#### Task 2: Create `BatchedBoardTiles` Component in `src/client/3d/batched_board_tiles.tsx`
**Target physical file**: `src/client/3d/batched_board_tiles.tsx`
- Implement `createBatchedTileSurfacesGeometry` merging all 40 tile planes.
- Implement `createBatchedTileBasesGeometry` merging standard and corner plinth boxes.
- Implement `resolveCellFromBoardClick(x, z)` Euclidean nearest-neighbor cell detector.
- Render 3 consolidated meshes for surfaces, standard bases, and corner bases.

#### Task 3: Integrate `BatchedBoardTiles` in `src/client/3d/board_layout.tsx`
**Target physical file**: `src/client/3d/board_layout.tsx`
```typescript
<<<<
import { InstancedBoardToyBuildings } from './instanced_toy_buildings';
import { MiniatureCityDiorama } from './miniature_city_diorama';
====
import { InstancedBoardToyBuildings } from './instanced_toy_buildings';
import { BatchedBoardTiles } from './batched_board_tiles';
import { MiniatureCityDiorama } from './miniature_city_diorama';
>>>>
```

```typescript
<<<<
      {/* 3.5. Cụm InstancedMesh nhà đất đồ chơi C1-C3 toàn bàn cờ (<8 draw calls) */}
      <InstancedBoardToyBuildings levelMap={levelMap} />

      {/* 4. 40 ô đất liền mạch khép kín tiếp giáp mặt nền phẳng */}
      {BOARD_CONFIG.map((cell) => (
        <LayeredDioramaTile
          key={cell.index}
          cell={cell}
          position={cellPosition(cell.index)}
          rotation={tileRotation(cell.index)}
          currentLevel={(levelMap[cell.index] ?? 0) as 0 | 1 | 2 | 3}
          isCornerTile={CORNER_INDICES.has(cell.index)}
          enableStandee={false}
          ownerColor={ownerInfoMap[cell.index]?.tokenColor}
          ownerSlot={ownerInfoMap[cell.index]?.ownerSlot}
          mascotIcon={ownerInfoMap[cell.index]?.mascotIcon}
          onClick={() => handleTileClick(cell.index)}
          isHeatmapActive={isHeatmapActive}
          isMonopolyGroup={isCellInMonopolyGroup(cell.index, monopolyGroups)}
          isMobile={isMobile}
          renderToyBuildings={false}
        />
      ))}
====
      {/* 3.5. Cụm InstancedMesh nhà đất đồ chơi C1-C3 toàn bàn cờ (<8 draw calls) */}
      <InstancedBoardToyBuildings levelMap={levelMap} />

      {/* 3.8. Cụm BatchedBoardTiles gộp 40 bề mặt và đế ô cờ vào 3 draw calls (IMP-363) */}
      <BatchedBoardTiles
        isMobile={isMobile}
        onTileClick={handleTileClick}
      />

      {/* 4. 40 ô đất liền mạch khép kín tiếp giáp mặt nền phẳng (render động các lớp trang trí) */}
      {BOARD_CONFIG.map((cell) => (
        <LayeredDioramaTile
          key={cell.index}
          cell={cell}
          position={cellPosition(cell.index)}
          rotation={tileRotation(cell.index)}
          currentLevel={(levelMap[cell.index] ?? 0) as 0 | 1 | 2 | 3}
          isCornerTile={CORNER_INDICES.has(cell.index)}
          enableStandee={false}
          ownerColor={ownerInfoMap[cell.index]?.tokenColor}
          ownerSlot={ownerInfoMap[cell.index]?.ownerSlot}
          mascotIcon={ownerInfoMap[cell.index]?.mascotIcon}
          onClick={() => handleTileClick(cell.index)}
          isHeatmapActive={isHeatmapActive}
          isMonopolyGroup={isCellInMonopolyGroup(cell.index, monopolyGroups)}
          isMobile={isMobile}
          renderToyBuildings={false}
          renderBasePlinth={false}
          renderAtlasSurface={false}
        />
      ))}
>>>>
```

## 4. Definition of Done (DoD) & Stopping Criteria
1. **Mechanical Automated Gates**:
   - `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_363_BOARD_TILES_BATCHING_AND_DRAW_CALL_IPC.md --auto-sign` passes with 0 defects.
   - `npm run prefilter -- src/client/3d/board_tile.tsx src/client/3d/board_layout.tsx src/client/3d/batched_board_tiles.tsx tests/client/imp363_batched_board_tiles.test.ts` passes with 0 errors.
   - All Station 1 contract tests pass green.
   - Physical visual verification via `npm run capture:visual -- --ticket IMP-363` and evidence check `node scripts/check_evidence.mjs IMP-363`.
2. **Stopping Boundary**:
   - Once all contract assertions turn green, visual evidence is captured, and pre-filters succeed, Station 2 concludes with zero exploratory side refactoring.
