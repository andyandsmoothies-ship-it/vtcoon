# Plan IMP-381: OwnerPricePill Instanced Labels & Canvas Texture Atlas (Ticket IMP-381)

## 0. Auto-Slicing Roadmap (Micro-Slices Matrix)
- **Slice 1 (IMP-379 - COMPLETED)**: MiniatureCityDiorama Mobile Purge & Skyline/Bridge LOD (-80 calls, down to ~450 calls).
- **Slice 2 (IMP-381 - THIS TICKET)**: OwnerPricePill Instanced Labels & POT 1024x512 Canvas Texture Atlas on 28 purchasable board cells (-27 calls, from ~450 down to ~423 calls).
- **Slice 3 (IMP-382 - NEXT SLICE)**: Diorama Marina & Container Port Mobile Batching / Procedural Building Shared Texture Atlas (draw calls <= 85).

## 0.1. Context & Architectural Rationale
- **Telemetry & Baseline**: Sau IMP-379, bàn cờ còn ~450 draw calls. 28 ô tài sản mount 28 mesh `owner-price-label` riêng lẻ với `CanvasTexture` độc lập = 28 draw calls.
- **Giải pháp kiến trúc IMP-381 (Gia cố phản biện Deep Modules & 3D Graphics Director)**:
  1. **POT 1024x512 Canvas Texture Atlas (`price_pill_texture_atlas.ts`)**: 4 cột x 8 hàng (slot 256x64), loại bỏ triệt để texel bleed 1/7 và lỗi mipmap TBDR. Tách độc lập màu chữ (`#FFFFFF` khi có chủ, `#FBBF24` khi chưa có chủ) khỏi icon linh vật.
  2. **Singleton Geometry 1.10m x 0.22m (`instanced_cell_markers_helpers.ts`)**: Pre-bake singleton `PRICE_PILL_LABELS_BATCHED_GEOM` ở module level (chống re-allocation và rò rỉ VRAM). Kích thước 1.10m x 0.22m ôm trọn khay vàng 1.38m với linh vật ($X \approx -0.38\text{m}$) và giá tiền ($X \approx +0.14\text{m}$) chuẩn AAA.
  3. **Tích hợp O(1) & Depth Sorting (`instanced_cell_borders_and_trays.tsx`)**: Render 28 nhãn qua 1 Draw Call với `PRICE_PILL_LABELS_BATCHED_GEOM`, `depthWrite={false}`, `alphaTest={0.05}`, bỏ `receiveShadow`. Di chuyển `clearPricePillAtlasCache()` sang unmount effect cô lập `[]`.
  4. **Bảo toàn Call-site (`board_layout.tsx` & `board_tile.tsx`)**: Truyền `renderPricePill={false}` trong bàn cờ tổng; giữ mặc định `true` cho living test contract.

## 1. Physical Target Files & Honest LOC Accounting
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/price_pill_texture_atlas.ts` | Tier 2 (UI/3D/Views) | 158 | 158 | +0 | <= 500 | Safe (< 200 LOC, POT Atlas) |
| `src/client/3d/instanced_cell_markers_helpers.ts` | Tier 2 (UI/3D/Views) | 114 | 114 | +0 | <= 500 | Safe (< 150 LOC) |
| `src/client/3d/instanced_cell_borders_and_trays.tsx` | Tier 2 (UI/3D/Views) | 215 | 215 | +0 | <= 500 | Safe (< 240 LOC) |
| `src/client/3d/board_tile.tsx` | Tier 2 (UI/3D/Views) | 363 | 363 | +0 | <= 500 | Safe (< 370 LOC) |
| `src/client/3d/board_layout.tsx` | Tier 2 (UI/3D/Views) | 229 | 229 | +0 | <= 500 | Safe (< 240 LOC) |
| `tests/client/imp381_instanced_price_pill_labels.test.ts` | Living Test | 158 | 158 | +0 | <= 600 | Safe (< 200 LOC, Contract Test) |
| `docs/FEATURE_MAP.md` | SSOT Matrix | 91 | 91 | +0 | N/A | Cập nhật Pillar 13 |

## 2. In-Action Visual Capture Registration
- Scenario: `board_ownership_monopoly` (`scripts/visual_scenarios/board_ownership_monopoly.js`)
- Verification Command: `node scripts/capture_visual_evidence.mjs --ticket IMP-381 --scenario board_ownership_monopoly --dual`
- Viewport: Desktop HD (`1280x800`) & Mobile WebKit (`360x740`)
- Target: 28 khay giá sở hữu hiển thị cân đối trên khay vàng 1.38m qua 1 Texture Atlas duy nhất; Draw Calls giảm 27 calls.

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
Tệp kiểm thử: `tests/client/imp381_instanced_price_pill_labels.test.ts`
- **TC-381.01a [UC-IMP381-ATLAS-GENERATION/MSS]:** Given 28 purchasable cells and an unowned board state, When getPricePillAtlasTexture is invoked, Then returns a valid singleton CanvasTexture containing 28 baked price slots with gold color #FBBF24 without throwing exceptions.
- **TC-381.01b [UC-IMP381-UV-MAPPING/MSS]:** Given cellIndex 1 on the board, When getPricePillAtlasUVs is called, Then returns non-zero UV coordinates uMin, uMax, vMin, vMax bounded within 0 to 1 based on POT 1024x512 grid.
- **TC-381.01c [UC-IMP381-CACHE-DISPOSAL/MSS]:** Given cachedPricePillAtlas in memory, When clearPricePillAtlasCache is executed, Then disposes the texture and resets internal cache references to null.
- **TC-381.02a [UC-IMP381-OWNERSHIP-WHITE-TEXT/MSS]:** Given cell 1 owned by player without mascot, When getPricePillAtlasTexture is evaluated, Then renders price text in white #FFFFFF rather than falling back to gold.
- **TC-381.02b [UC-IMP381-OWNERSHIP-MASCOT-REACTIVITY/MSS]:** Given cell 1 owned by player with mascot tiger and token color #DC2626, When getPricePillAtlasTexture is re-evaluated, Then marks texture for GPU upload and renders mascot icon alongside white price text.
- **TC-381.03 [UC-IMP381-BATCHED-GEOMETRY-SINGLETON/MSS]:** Given 28 purchasable cell markers, When createBatchedPricePillLabelsGeometry is resolved, Then returns pre-baked static BufferGeometry with dimensions 1.10m x 0.22m and exact world matrices.
- **TC-381.04 [UC-IMP381-INSTANCED-CELL-TRAYS-INTEGRATION/MSS]:** Given InstancedCellBordersAndTrays component, When rendered with ownerInfoMap and monopolyGroups, Then mounts data-testid="instanced-price-pill-labels" with depthWrite={false}, alphaTest={0.05} in exactly 1 draw call.
- **TC-381.05 [UC-IMP381-BOARD-LAYOUT-WIRING/MSS]:** Given GameBoard in board_layout.tsx, When rendering 40 LayeredDioramaTile instances, Then passes renderPricePill={false} to suppress unbatched individual price meshes and relies on InstancedCellBordersAndTrays.
- **TC-381.06 [UC-IMP381-STANDALONE-TILE-BACKWARD-COMPAT/MSS]:** Given LayeredDioramaTile rendered standalone without renderPricePill prop, When evaluated, Then defaults renderPricePill to true and preserves legacy OwnerPricePill markup for living regression suites.

### Station 2: Implementation (GREEN)

#### Call-Site Wiring & Integration Anchors
- **Target physical file**: `src/client/3d/price_pill_texture_atlas.ts`
Triển khai bộ sinh POT 1024x512 Texture Atlas và quản lý cache:
```typescript
export const PILL_ATLAS_WIDTH = 1024;
export const PILL_ATLAS_HEIGHT = 512;
export function getPricePillAtlasUVs(cellIndex: number): PricePillAtlasUVRect { ... }
export function getPricePillAtlasTexture(ownerInfoMap?: ...): CanvasTexture | null { ... }
export function clearPricePillAtlasCache(): void { ... }
```

- **Target physical file**: `src/client/3d/instanced_cell_markers_helpers.ts`
Khởi tạo và export singleton geometry batched cho 28 nhãn giá:
```typescript
export function createBatchedPricePillLabelsGeometry(): THREE.BufferGeometry { ... }
export const PRICE_PILL_LABELS_BATCHED_GEOM: THREE.BufferGeometry = createBatchedPricePillLabelsGeometry();
```

- **Target physical file**: `src/client/3d/instanced_cell_borders_and_trays.tsx`
Tích hợp mesh nhãn giá instanced và kết nối atlas texture:
```typescript
<mesh geometry={PRICE_PILL_LABELS_BATCHED_GEOM} data-testid="instanced-price-pill-labels">
  <meshBasicMaterial map={atlasTexture ?? undefined} transparent alphaTest={0.05} depthWrite={false} toneMapped={false} />
</mesh>
```

- **Target physical file**: `src/client/3d/board_layout.tsx`
Cấu hình triệt tiêu nhãn giá đơn lẻ trong bàn cờ tổng:
```typescript
renderPricePill={false}
```

- **Target physical file**: `src/client/3d/board_tile.tsx`
Bảo toàn fallback mặc định cho living tests khi không truyền cờ:
```typescript
const renderPricePill = propRenderPricePill !== undefined ? propRenderPricePill : (renderBasePlinth || renderAtlasSurface);
```

### Station 3: Pre-Filter & Machine Gates
- `npm run prefilter -- src/client/3d/price_pill_texture_atlas.ts src/client/3d/instanced_cell_markers_helpers.ts src/client/3d/instanced_cell_borders_and_trays.tsx src/client/3d/board_tile.tsx src/client/3d/board_layout.tsx tests/client/imp381_instanced_price_pill_labels.test.ts`
- `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_381_INSTANCED_PRICE_PILL_LABELS.md`
- `node scripts/capture_visual_evidence.mjs --ticket IMP-381 --scenario board_ownership_monopoly --dual`
- `node scripts/check_evidence.mjs IMP-381`

### Station 4: Chaos Sentinel & Invariant Verification
- Chạy Sentinel: `npm run sentinel -- --ticket IMP-381 --test tests/client/imp381_instanced_price_pill_labels.test.ts`.

## 4. Definition of Done (DoD) & Stopping Boundary
1. Toàn bộ 9/9 contract tests trong `imp381_instanced_price_pill_labels.test.ts` chuyển sang GREEN.
2. Giảm 27 draw calls của 28 nhãn giá xuống còn 1 draw call duy nhất.
3. Không hồi quy các living test suites 3D liên quan (`imp377`, `imp378`, `imp379`).
4. 100% Sentinel mutants bị tiêu diệt.
5. Cập nhật `docs/FEATURE_MAP.md` Pillar 13.
