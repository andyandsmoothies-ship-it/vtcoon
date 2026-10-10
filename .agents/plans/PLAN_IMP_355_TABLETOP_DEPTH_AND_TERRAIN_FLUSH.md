# Plan IMP-355: Tropical Water Shore Dampening & Tabletop Wave Clipping Prevention (Ticket IMP-355)

## 0. Context & Architectural Rationale
- **Prior In-Flight Scope (Uncommitted)**:
  - Clean working tree with IMP-354 shipped (`b8fc7f4`).
- **Problem Statement**:
  - In-game viewports experience continuous visual background flickering between cyan water (`#72D8EB` / `[114, 216, 235]`) and walnut brown (`#4E1F03` / `[78, 31, 3]`) across >5,000 pixels at 60 FPS.
  - Root cause: In `src/client/3d/board_layout.tsx`, Walnut Tabletop mesh has `args={[19.2, 0.2, 19.2]}` at `WALNUT_TABLE_Y = -0.350` (top face at $Y = -0.250$). `TropicalWater` has `position={[0, -0.30, 0]}` with GPU Gerstner wave displacement $\pm 0.052$ (range $[-0.352, -0.248]$). When waves crest above $-0.250$, pixels render cyan water; when waves trough below $-0.250$, the opaque walnut tabletop at $-0.250$ occludes the water in depth buffer. At 60 FPS, this produces severe continuous blue/brown strobing.
- **Adversarial Gate Decisions & Remediation**:
  - ADV-01 (Reject depthWrite={false} Anti-Pattern): Rejected material hack on Walnut Tabletop. Disabling depthWrite on an opaque mesh causes Three.js front-to-back sorting inversion where the deeper Abyss mesh ($260 \times 260$m) overwrites the tabletop, breaks shadow maps, and causes transparent water bleed-through. Walnut Tabletop retains standard `depthWrite={true}`.
  - ADV-02 (Reject Blind Terrain 16.2m Stretching): Rejected mechanical expansion of diorama terrain. Stretching terrain to 16.2m causes a 2.3m dead-end road cutoff on Grand West Boulevard, X/Z perimeter asymmetry, and potential mesh collision with Metro Line 1 piers.
  - ADV-03 (Chebyshev Metric Shore Dampening): Adopted Near-Plinth Wave Dampening in `tropical_water_material.ts`. Instead of a radial metric `length(xy)` which fails at the square board corners ($r_{corner} = 13.58$m), applied box metric `boxDist = max(abs(x), abs(y))` with `smoothstep(9.6, 12.0, boxDist)`.
  - When $\text{boxDist} \le 9.6$m, wave displacement is exactly $0.0$. Water surface remains static at $Y = -0.300$. Walnut Tabletop top face at $Y = -0.250$ sits reliably $5$cm ($0.050$m) above the calm water across all 4 edges and 4 diagonal corners without wave clipping.
  - Preserves 100% backward compatibility with `tests/client/imp107_streamlined_tabletop_diorama.test.ts` (`WALNUT_TABLE_Y = -0.350` and `args="19.2,0.2,19.2"`).

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-355`
- **Subsystem**: `client-3d` (Tier 1 Domain/Logic & Tier 2 Water Shader)
- **Direct Scope (Physical Files)**:
  - **Target physical file**: `src/client/3d/shaders/tropical_water_material.ts` (Refactor)
  - **Target physical file**: `tests/client/imp355_tropical_water_shore_dampening.test.ts` (Tệp mới)
- **Referenced Contracts / Stable Boundaries**:
  - `src/client/3d/board_layout.tsx`
  - `src/client/3d/tropical_water.tsx`
  - `src/client/3d/coastal_island_environment.tsx`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/shaders/tropical_water_material.ts` | Tier 1 (Domain/Server/Logic) | 117 | 132 | +15 | <= 400 | Safe |
| `tests/client/imp355_tropical_water_shore_dampening.test.ts` | Living Test | 0 | 180 | +180 | <= 600 | 🆕 Tệp mới |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- Write living contract test suite in `tests/client/imp355_tropical_water_shore_dampening.test.ts`:
  - TC-355.01 [UC-DAMP/MSS]: Given coordinate at board origin 0 0, When evaluating calculateShoreDampening, Then returns exactly 0.0 dampening waves.
  - TC-355.02 [UC-DAMP/A1]: Given coordinate at table edge 9.6 0, When evaluating calculateShoreDampening, Then returns exactly 0.0 preserving calm shoreline.
  - TC-355.03 [UC-DAMP/A2]: Given coordinate at square table diagonal corner 9.6 9.6, When evaluating calculateShoreDampening, Then returns exactly 0.0 via Chebyshev box metric.
  - TC-355.04 [UC-DAMP/A3]: Given coordinate in open ocean at 15.0 15.0, When evaluating calculateShoreDampening, Then returns exactly 1.0 full wave amplitude.
  - TC-355.05 [UC-DAMP/A4]: Given intermediate coordinate at 10.8 0, When evaluating calculateShoreDampening, Then returns smoothstep transition between 0.0 and 1.0.
  - TC-355.06 [UC-SHADER/MSS]: Given TROPICAL_WATER_VERTEX_SHADER definition, When inspecting shader source, Then contains boxDist Chebyshev metric and smoothstep shore dampening.
  - TC-355.07 [UC-INTEGRITY/MSS]: Given GameBoard rendered in 3D viewport, When inspecting Walnut Tabletop meshStandardMaterial, Then preserves depthWrite true and WALNUT_TABLE_Y -0.350.
  - TC-355.08 [UC-DEPTH-BLEND/MSS]: Given inner and outer distances, When evaluating calculateDepthBlend, Then returns normalized gradient between 0.0 and 1.0.
  - TC-355.09 [UC-WAVE/MSS]: Given x y coordinates and elapsed time, When evaluating calculateWaterWaveOffset, Then returns harmonic wave displacement within amplitude bounds.
  - TC-355.10 [UC-UNIFORMS/MSS]: Given default environment initialization, When calling createTropicalWaterUniforms, Then instantiates valid uniform map.
  - TC-355.11 [UC-FRESNEL/MSS]: Given view direction and normal vectors, When evaluating calculateFresnelFactor, Then returns valid optical reflectivity.
  - TC-355.12 [UC-COLOR-LERP/MSS]: Given source and target ocean colors, When calling lerpWaterColor, Then smoothly interpolates color channels.

### Station 2: Implementation (GREEN)

#### Task 1: Export `calculateShoreDampening` in `src/client/3d/shaders/tropical_water_material.ts`
**Target physical file**: `src/client/3d/shaders/tropical_water_material.ts` (Refactor)
```typescript
<<<<
export function calculateDepthBlend(
====
export function calculateShoreDampening(
  x: number,
  y: number,
  innerDist: number = 9.6,
  outerDist: number = 12.0
): number {
  const boxDist = Math.max(Math.abs(x), Math.abs(y));
  if (boxDist <= innerDist) return 0.0;
  if (boxDist >= outerDist) return 1.0;
  const t = (boxDist - innerDist) / (outerDist - innerDist);
  return t * t * (3.0 - 2.0 * t);
}

export function calculateDepthBlend(
>>>>
```

#### Task 2: Apply Chebyshev Shore Dampening in `TROPICAL_WATER_VERTEX_SHADER`
**Target physical file**: `src/client/3d/shaders/tropical_water_material.ts` (Refactor)
```typescript
<<<<
    // Sóng Gerstner GPU đa tần (biên độ tối đa 0.052)
    float w1 = sin(transformed.x * 0.055 + uTime * 1.4) * 0.024;
    float w2 = cos(transformed.y * 0.065 + uTime * 1.1) * 0.018;
    float w3 = sin((transformed.x + transformed.y) * 0.038 + uTime * 1.8) * 0.010;
    transformed.z += w1 + w2 + w3;
====
    // Sóng Gerstner GPU đa tần triệt tiêu tại chân bàn cờ 19.2x19.2m (nửa cạnh 9.6m)
    float w1 = sin(transformed.x * 0.055 + uTime * 1.4) * 0.024;
    float w2 = cos(transformed.y * 0.065 + uTime * 1.1) * 0.018;
    float w3 = sin((transformed.x + transformed.y) * 0.038 + uTime * 1.8) * 0.010;
    float boxDist = max(abs(transformed.x), abs(transformed.y));
    float shoreDamp = smoothstep(9.6, 12.0, boxDist);
    transformed.z += (w1 + w2 + w3) * shoreDamp;
>>>>
```

### Station 3: Pre-Filter & Mechanical Gates
- Execute Fast Pre-Filter:
  `npm run prefilter -- src/client/3d/shaders/tropical_water_material.ts tests/client/imp355_tropical_water_shore_dampening.test.ts`
- Execute Scope Confinement:
  `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_355_TABLETOP_DEPTH_AND_TERRAIN_FLUSH.md`
- Collect Physical Visual Evidence:
  `npm run capture:visual -- IMP-355`
- Audit Visual Evidence:
  `node scripts/check_evidence.mjs IMP-355`

### Station 4: Acceptance Report & Verification
- Synthesize physical delivery report:
  `npm run report -- IMP-355`
- Verify 100% pass rate across regression test suites.
