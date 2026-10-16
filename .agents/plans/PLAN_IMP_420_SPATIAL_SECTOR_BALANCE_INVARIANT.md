# PLAN_IMP_420: Spatial Sector Balance Invariant & Quadrant Guard

## 1. Context & Architectural Goal
- **Source Strategy**: SDLC Hardening V6.0 Proposal 5 — Spatial Sector Balance Invariant & Quadrant Guard.
- **Classification**: Tier 2 Domain & Graphics Math.
- **Subsystem Boundary Isolation**: Strictly confined to `src/client/3d/` (`client-3d` subsystem).
- **Problems**:
  1. 3D diorama island capes and outer props currently lack programmatic sector balance verification.
  2. Unchecked props accumulation can skew spatial weight unevenly toward one board flank, causing visual center-of-mass drift.
- **Architectural Solution & Seam Discipline**:
  1. Build mathematical validation function `validateSectorBalance(quadrantCounts: Record<'NW' | 'NE' | 'SW' | 'SE', number>): boolean` in `src/client/3d/spatial_geometry_helpers.ts`.
  2. Enforce invariant: `max(count_i) - min(count_i) <= 2` across 4 quadrants ('NW', 'NE', 'SW', 'SE') with finite non-negative integer validation.
  3. Provide `computeQuadrantCounts` helper mapping 2D/3D coordinates to sector partitions with IEEE-754 `-0` normalization and NaN guards.
  4. Wire into `src/client/3d/coastal_island_environment.tsx` via `resolveBalancedIslandDioramaProps` and precomputed `DEFAULT_BALANCED_ISLAND_DIORAMA`, enforcing active fallback to default layout on imbalance.
  5. Satisfy Wiring Parity Invariant: Contract test directly verifies both isolated mathematical thresholds and the physical call-site consumer.

### Principles Applied
- **Spatial AABB / Non-Occlusion** -> Prevents spatial cluster congestion and maintains visual equilibrium across 4 board quadrants.
- **Wiring Parity Invariant** -> Verifies both pure math helper and physical production call-site consumer in `coastal_island_environment.tsx`.
- **View-Model Seam Extraction** -> Pure quadrant classification and sector balancing decoupled from Three.js scene graphs.
- **Equivalence-Partition Testing** -> Partitioned across delta 0, delta 1, delta 2, delta >= 3, invalid inputs, and consumer call-site matrix.
- **Relational Multi-Point Assertion** -> Verifies multi-point non-equality across sectors to defeat constant-return hardcoding.
- **Resource Disposal & Cache Hygiene** -> Precomputes diorama layout to eliminate per-render allocations in R3F.
- **Poka-Yoke Domain Affordance** -> Enforces active fallback to safe default diorama props when input layout is unbalanced.

---

## 2. Target Files & Honest LOC Accounting

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/spatial_geometry_helpers.ts` | Tier 1 (Pure Math Seam) | 103 | 151 | +48 | 400 | Safe (Pure Math Functions) |
| `src/client/3d/coastal_island_environment.tsx` | Tier 2 (3D Visuals) | 275 | 311 | +36 | 500 | Safe (Balanced Props Layout) |
| `tests/client/imp420_spatial_sector_balance.test.ts` | Living Test | 0 | 180 | +180 | 600 | Safe (New Contract Suite) |

---

## 3. Drop-In Replacement Snippets & New Code Specifications

- **Target physical file**: `src/client/3d/spatial_geometry_helpers.ts`
```typescript
<<<<
export function isOverviewFrustumSafe(
  pos: readonly [number, number, number],
  aspect = 1.6,
  maxNdcX = 0.85,
  maxNdcY = 0.80
): boolean {
  const [ndcX, ndcY] = projectToOverviewNdc(pos, aspect);
  return Math.abs(ndcX) <= maxNdcX && Math.abs(ndcY) <= maxNdcY;
}
====
export function isOverviewFrustumSafe(
  pos: readonly [number, number, number],
  aspect = 1.6,
  maxNdcX = 0.85,
  maxNdcY = 0.80
): boolean {
  const [ndcX, ndcY] = projectToOverviewNdc(pos, aspect);
  return Math.abs(ndcX) <= maxNdcX && Math.abs(ndcY) <= maxNdcY;
}

export type SpatialQuadrant = 'NW' | 'NE' | 'SW' | 'SE';

export function getSpatialQuadrant(x: number, z: number): SpatialQuadrant {
  const normX = Object.is(x, -0) ? 0 : x;
  const normZ = Object.is(z, -0) ? 0 : z;
  if (normX < 0) {
    return normZ < 0 ? 'NW' : 'SW';
  }
  return normZ < 0 ? 'NE' : 'SE';
}

export function computeQuadrantCounts(
  positions: ReadonlyArray<readonly [number, number, number] | readonly [number, number]>
): Record<SpatialQuadrant, number> {
  const counts: Record<SpatialQuadrant, number> = { NW: 0, NE: 0, SW: 0, SE: 0 };
  for (const pos of positions) {
    if (!pos || pos.length < 2) continue;
    const x = pos[0];
    const z = pos.length === 3 ? pos[2] : pos[1];
    if (typeof x !== 'number' || typeof z !== 'number' || x !== x || z !== z || x === Infinity || x === -Infinity || z === Infinity || z === -Infinity) {
      continue;
    }
    counts[getSpatialQuadrant(x, z)]++;
  }
  return counts;
}

export function validateSectorBalance(
  quadrantCounts: Record<'NW' | 'NE' | 'SW' | 'SE', number>
): boolean {
  if (!quadrantCounts || typeof quadrantCounts !== 'object') {
    return false;
  }
  const nw = quadrantCounts.NW;
  const ne = quadrantCounts.NE;
  const sw = quadrantCounts.SW;
  const se = quadrantCounts.SE;
  const vals = [nw, ne, sw, se];
  for (const v of vals) {
    if (typeof v !== 'number' || v !== v || v === Infinity || v === -Infinity || v < 0 || Math.floor(v) !== v) {
      return false;
    }
  }
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  return max - min <= 2;
}
>>>>
```

- **Target physical file**: `src/client/3d/coastal_island_environment.tsx`
```typescript
<<<<
import { ToyboxWealthTrayLayer } from './toybox_wealth_tray_layer';
import { WarRoomStageLayer } from './war_room_stage_layer';
====
import { ToyboxWealthTrayLayer } from './toybox_wealth_tray_layer';
import { WarRoomStageLayer } from './war_room_stage_layer';
import { computeQuadrantCounts, validateSectorBalance } from './spatial_geometry_helpers';
>>>>
```

- **Target physical file**: `src/client/3d/coastal_island_environment.tsx`
```typescript
<<<<
export interface CoastalIslandEnvironmentProps {
  streamlined?: boolean;
  isMobile?: boolean;
  readonly deviceMemoryGb?: number;
}
====
export interface CoastalIslandPropDescriptor {
  readonly id: string;
  readonly position: readonly [number, number, number];
  readonly topRadius: number;
  readonly bottomRadius: number;
  readonly height: number;
  readonly segments: number;
  readonly color?: string;
  readonly roughness?: number;
  readonly metalness?: number;
}

export const DEFAULT_COASTAL_ISLAND_PROPS: ReadonlyArray<CoastalIslandPropDescriptor> = [
  { id: 'cape-southwest', position: [-11.5, -0.35, 8.5], topRadius: 2.5, bottomRadius: 3.5, height: 0.18, segments: 32 },
  { id: 'cape-southeast', position: [15.0, -0.55, 15.0], topRadius: 4.0, bottomRadius: 5.8, height: 0.20, segments: 32 },
  { id: 'cape-northwest', position: [-18.0, -0.40, -14.0], topRadius: 8.0, bottomRadius: 10.5, height: 0.22, segments: 32 },
  { id: 'cape-northeast', position: [16.5, -0.45, -14.0], topRadius: 4.2, bottomRadius: 6.0, height: 0.20, segments: 32 },
];

export function resolveBalancedIslandDioramaProps(
  propsList: ReadonlyArray<CoastalIslandPropDescriptor> = DEFAULT_COASTAL_ISLAND_PROPS
): {
  readonly props: ReadonlyArray<CoastalIslandPropDescriptor>;
  readonly quadrantCounts: Record<'NW' | 'NE' | 'SW' | 'SE', number>;
  readonly isBalanced: boolean;
} {
  const quadrantCounts = computeQuadrantCounts(propsList.map((p) => p.position));
  const isBalanced = validateSectorBalance(quadrantCounts);
  return {
    props: isBalanced ? propsList : DEFAULT_COASTAL_ISLAND_PROPS,
    quadrantCounts,
    isBalanced,
  };
}

export const DEFAULT_BALANCED_ISLAND_DIORAMA = resolveBalancedIslandDioramaProps(DEFAULT_COASTAL_ISLAND_PROPS);

export interface CoastalIslandEnvironmentProps {
  streamlined?: boolean;
  isMobile?: boolean;
  readonly deviceMemoryGb?: number;
}
>>>>
```

- **Target physical file**: `src/client/3d/coastal_island_environment.tsx`
```typescript
<<<<
          {/* Mũi bãi tắm cong Tây Nam & Đông Nam */}
          <mesh receiveShadow position={[-11.5, -0.35, 8.5]}>
            <cylinderGeometry args={[2.5, 3.5, 0.18, 32]} />
            <meshStandardMaterial color="#EFE5D8" roughness={0.85} metalness={0.02} />
          </mesh>
          <mesh receiveShadow position={[15.0, -0.55, 15.0]}>
            <cylinderGeometry args={[4.0, 5.8, 0.20, 32]} />
            <meshStandardMaterial color="#EFE5D8" roughness={0.85} metalness={0.02} />
          </mesh>
          <mesh receiveShadow position={[-18, -0.40, -14]}>
            <cylinderGeometry args={[8.0, 10.5, 0.22, 32]} />
            <meshStandardMaterial color="#EFE5D8" roughness={0.85} metalness={0.02} />
          </mesh>
====
          {/* Mũi bãi tắm & đảo ngoại vi 4 góc phần tư rải đều (IMP-420 Quadrant Guard) */}
          {DEFAULT_BALANCED_ISLAND_DIORAMA.props.map((p) => (
            <mesh key={p.id} receiveShadow position={[...p.position]}>
              <cylinderGeometry args={[p.topRadius, p.bottomRadius, p.height, p.segments]} />
              <meshStandardMaterial
                color={p.color ?? '#EFE5D8'}
                roughness={p.roughness ?? 0.85}
                metalness={p.metalness ?? 0.02}
              />
            </mesh>
          ))}
>>>>
```

---

## 4. Station 1 Contract Test Specifications (Lean Invariants)

- **TC-420.01 [UC-SECTOR-BALANCE-ZERO-DELTA/MSS]**: Given quadrant counts with zero delta between sectors, When calling `validateSectorBalance`, Then returns true indicating ideal equilibrium across all 4 quadrants.
- **TC-420.02 [UC-SECTOR-BALANCE-PERMITTED-DRIFT/MSS]**: Given quadrant counts with non-zero delta within the tolerance threshold, When calling `validateSectorBalance`, Then returns true confirming natural spatial variation is allowed.
- **TC-420.03 [UC-SECTOR-BALANCE-IMBALANCE-GUARD/A1]**: Given quadrant counts with sector delta strictly exceeding threshold or invalid counts, When calling `validateSectorBalance`, Then returns false blocking clustered props accumulation.
- **TC-420.04 [UC-SECTOR-QUADRANT-PROJECTION/MSS]**: Given coordinate points across distinct spatial sectors, When calling `computeQuadrantCounts`, Then correctly tallies items into NW, NE, SW, and SE sectors.
- **TC-420.05 [UC-SECTOR-CONSUMER-COASTAL-WIRING/MSS]**: Given `coastal_island_environment` consumer, When `resolveBalancedIslandDioramaProps` is invoked with default props, Then executes sector balance validation returning `isBalanced === true` and balanced quadrant counts.

---

## 5. Regression Verification Plan

Execute the contract test alongside living coastal environment suites:
```bash
npx --yes vitest run tests/client/imp420_spatial_sector_balance.test.ts tests/client/coastal_island_environment.test.ts tests/client/imp399_bay_archipelago_and_mobile_city_silhouette.test.ts tests/client/imp407_spatial_geometry_and_canvas_text_sanitizer.test.ts
```

Execute evidence audit:
```bash
node scripts/check_evidence.mjs imp-420
```

---

## 6. Definition of Done (DoD) & Stopping Criteria

1. `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_420_SPATIAL_SECTOR_BALANCE_INVARIANT.md --auto-sign` passes with 0 defects.
2. `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_420_SPATIAL_SECTOR_BALANCE_INVARIANT.md` passes with 0 scope leaks.
3. `npm run prefilter -- src/client/3d/spatial_geometry_helpers.ts src/client/3d/coastal_island_environment.tsx tests/client/imp420_spatial_sector_balance.test.ts` passes with 0 warnings/errors.
4. All living coastal island environment test suites pass 100% green.
5. `node scripts/check_evidence.mjs imp-420` passes with 0 failures.
