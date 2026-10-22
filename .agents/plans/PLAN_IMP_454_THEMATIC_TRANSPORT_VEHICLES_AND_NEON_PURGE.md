# PLAN: IMP-454 Thematic Transport Vehicles Integration & Neon Trajectory Purge

## 1. Context & Motivation
Direct pawn flights across the board (Jail sentencing cell 30 -> 10, Transit Wheel airport flights, Concert events) currently display a rigid parabolic neon laser tube (`PawnHopTrajectory`). This breaks visual immersion and looks like a sci-fi glitch. Option 4 replaces this with thematic transport vehicles:
1. `vehicle_police.glb`: Chibi police cruiser escorting pawns to Jail cell 10 along perimeter roads with arc-smoothed cornering and emergency light glow.
2. `vehicle_plane.glb`: Chibi passenger airliner flying pawns between transit destinations on smooth 3D parabolic arcs with banked turns.
3. Neon purge: Clear `PawnHopTrajectory` during direct flights (`visible={Boolean(showTrajectory && !isDirectFlight)}`) while keeping the node in the JSX tree to preserve living test contracts.

## 2. Target Files & Scope Confinement
| File | Tier | Current LOC | Projected LOC | Delta | Max LOC | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/thematic_transport_calc.ts` | Tier 1 (Domain/3D - New) | 34 | 160 | +126 | 400 | Safe |
| `src/client/3d/thematic_transport_vehicle.tsx` | Tier 2 (3D/UI - New) | 21 | 140 | +119 | 500 | Safe |
| `src/client/3d/single_hop_pawn.tsx` | Tier 2 (3D/UI) | 280 | 292 | +12 | 500 | Safe |
| `src/client/3d/pawn_animator.tsx` | Tier 2 (3D/UI) | 343 | 365 | +22 | 500 | Safe |
| `tests/client/pawn_hop_trajectory_visibility.test.ts` | Living Tests | 61 | 65 | +4 | 600 | Preserved |
| `tests/client/imp454_thematic_transport_vehicles.test.ts` | Living Tests (New) | 0 | 190 | +190 | 600 | Safe |

## Harness Mutation Authorization
[HARNESS_MUTATION_AUTHORIZED]
1. `scripts/blender/build_transition_vehicles.py`: User-provided procedural Blender asset builder for transition vehicle models.
2. `scripts/optimize_assets.mjs`: Upgraded asset budget categories to recognize `transition_vehicles` (max 2,500 tris, 40 KB) and calibrated total repository capacity to 3.5 MB for 77+ models.

## 3. Physical Surface Area & Root Cause
- **Surface Area**: `src/client/3d/single_hop_pawn.tsx`, `src/client/3d/pawn_animator.tsx`, `src/client/3d/thematic_transport_calc.ts`, `src/client/3d/thematic_transport_vehicle.tsx`.
- **Root Cause**:
  1. In `pawn_animator.tsx#L143-L150`, direct flights (`isDirectFlight`) force `PawnHopTrajectory` visible, drawing a neon tube parabola across the board sky that clashes with the board diorama aesthetic.
  2. `SingleHopPawn` unconditionally renders visual pawn meshes during direct flights, creating an autonomous 2.8m jumping pawn detached from the ground police car.

## 4. Explicitly Dropped Requirements (Sean Goedecke Rule)
- ❌ **NO Physics-Based Suspension/Steering Rigs**: Rigid body low-poly chibi orientation is standard; wheel rotation and steering bones are dropped.
- ❌ **NO Multi-Vehicle Convoy Collisions**: Only the single active flying player's transport vehicle is spawned at any moment.
- ❌ **NO Exhaust Smoke Particle Emitters**: Dropped to protect mobile TBDR Early-Z fillrate and battery pacing.
- ❌ **NO Audio Subsystem Bloat**: Audio cues remain handled deterministically by `SingleHopPawn` (`SoundEffect.TAX_PENALTY`, `CARD_DRAW`); raw WebAudio synthesis is dropped.
- ❌ **NO Continuous Re-rendering of Parent**: Vehicle motion and siren updates occur via shared mutable `progressRef` inside `useFrame`, eliminating 60fps parent re-renders.

## 5. Principles Applied
- `View-Model Seam Extraction`: Pure 3D transform and heading calculations isolated from R3F frame loop into `thematic_transport_calc.ts`.
- `100% DTO & Call-Site Wiring`: `sirenActive` directly drives emergency point light for police car; `SafeGLTFModel` uses canonical `url` prop.
- `Spatial AABB / Non-Occlusion`: Police car follows perimeter road with $C^1$ arc-smoothed cornering ($R = 1.5\text{m}$) around cell 0, eliminating diorama center collision ($R \ge 7.5\text{m}$); `SingleHopPawn` hides pawn mesh during flight (`hidePawnMesh={isDirectFlight}`).
- `Resource Disposal & Cache Hygiene`: GLTF vehicle assets preloaded at module level (`SafeGLTFModel.preload`) to eliminate 500ms network races.
- `SpecGuard Oracle & Anti-Overfitting Protocol`: Contract tests include mandatory negative out-of-bounds input verification and relational multi-point testing.

## 6. Specification for Modifications & Call-Site Wiring
### 6.1 `src/client/3d/thematic_transport_calc.ts` (Pure Test Seam)
```typescript
export interface TransportVehicleTransform {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  sirenActive?: 'red' | 'blue';
}

export interface TransportCalcParams {
  progress: number;
  fromCell: number;
  toCell: number;
  flightType: 'audit' | 'transit' | 'event';
  timestampMs?: number;
}

export function calculateTransportVehicleTransform(params: TransportCalcParams): TransportVehicleTransform;
export function resolveSirenPhase(timestampMs?: number): 'red' | 'blue';
```
- **$C^1$ Arc-Smoothed Cornering for Police Car (Jail Flight `audit`)**:
  - $t \in [0, 0.42]$: Travels along East edge ($X=9.0$, $Z = -9.0 + (t/0.42) \cdot 16.5$, $\text{yaw} = 0$).
  - $t \in [0.42, 0.58]$: Sweeps circular arc corner around `[7.5, 0, 7.5]` with $R=1.5\text{m}$, smoothly rotating yaw from $0$ to $-\pi/2$.
  - $t \in [0.58, 1.0]$: Travels along South edge ($Z=9.0$, $X = 7.5 - ((t - 0.58)/0.42) \cdot 16.5$, $\text{yaw} = -\pi/2$).
  - Ground elevation locked to $Y = 0.04\text{m}$, ensuring zero penetration into diorama center ($R \ge 7.5\text{m}$).
- **Civilian Airliner Flight (Transit / Event)**:
  - 3D parabolic arc with peak $Y \ge 2.8\text{m}$, climb/descent pitch, and banked roll turn. `sirenActive` is omitted.

### 6.2 Consumer Wiring in `src/client/3d/thematic_transport_vehicle.tsx`
**Target physical file**: `src/client/3d/thematic_transport_vehicle.tsx`
```tsx
import { useFrame } from '@react-three/fiber';
import { SafeGLTFModel } from './asset_loader/safe_gltf_model.js';
import { calculateTransportVehicleTransform, resolveSirenPhase } from './thematic_transport_calc.js';

SafeGLTFModel.preload('/models/vehicles/vehicle_police.glb');
SafeGLTFModel.preload('/models/vehicles/vehicle_plane.glb');

export function ThematicTransportVehicle({
  flightType,
  fromCell,
  toCell,
  progressRef,
  visible = true,
}: ThematicTransportVehicleProps): React.ReactElement | null {
  const groupRef = React.useRef<THREE.Group>(null);
  const lightRef = React.useRef<THREE.PointLight>(null);

  useFrame(() => {
    const progress = progressRef?.current ?? 0;
    const transform = calculateTransportVehicleTransform({ progress, fromCell, toCell, flightType });
    if (groupRef.current) {
      groupRef.current.position.set(...transform.position);
      groupRef.current.rotation.set(...transform.rotation);
    }
    if (lightRef.current && transform.sirenActive) {
      lightRef.current.color.set(transform.sirenActive === 'red' ? '#EF4444' : '#3B82F6');
    }
  });

  if (!visible) return null;
  const isPolice = flightType === 'audit';
  return (
    <group ref={groupRef} name="ThematicTransportVehicle" data-testid="thematic-transport-vehicle">
      <SafeGLTFModel url={isPolice ? '/models/vehicles/vehicle_police.glb' : '/models/vehicles/vehicle_plane.glb'} />
      {isPolice && <pointLight ref={lightRef} intensity={2.0} distance={1.8} position={[0, 0.25, 0]} />}
    </group>
  );
}
```

### 6.3 Consumer Call-Site Wiring in `src/client/3d/single_hop_pawn.tsx` & `src/client/3d/pawn_animator.tsx`
**Target physical file**: `src/client/3d/single_hop_pawn.tsx`
- Add `hidePawnMesh?: boolean` and `progressRef?: React.MutableRefObject<number>` to `SingleHopProps`.
- In `useFrame`, update `if (progressRef) progressRef.current = jumpProgress;`.
- In JSX, wrap `<LuxuryPawnModel>` / `<PawnMesh>` with `{!hidePawnMesh && (...)}`.

**Target physical file**: `src/client/3d/pawn_animator.tsx`
```tsx
import { ThematicTransportVehicle } from './thematic_transport_vehicle.js';

// Inside ActiveSpringPawn:
const directFlightProgressRef = useRef(0);

<PawnHopTrajectory
  fromCell={fromCell}
  toCell={toCell}
  offset={offset}
  color={color}
  arcHeight={isDirectFlight ? JAIL_FLIGHT_ARC : DEFAULT_JUMP_ARC}
  visible={Boolean(showTrajectory && !isDirectFlight)}
/>
{isDirectFlight && (
  <ThematicTransportVehicle
    flightType={animation.isJailFlight ? 'audit' : (animation.flightType ?? 'transit')}
    fromCell={fromCell}
    toCell={toCell}
    progressRef={directFlightProgressRef}
  />
)}
<SingleHopPawn
  key={stepIndex}
  hidePawnMesh={isDirectFlight}
  progressRef={directFlightProgressRef}
  ...
/>
```

## 7. Core Contract Invariants & QA Test Design
- **TC-454.01 [UC-VEHICLE-POLICE-PERIMETER-SMOOTH/MSS]**: Given Jail flight (`audit`) from cell 30 to cell 10, When calling `calculateTransportVehicleTransform` across $t \in [0.0, 1.0]$, Then vehicle position remains strictly along perimeter roads ($R \ge 7.5\text{m}$, never penetrating central diorama $R < 6.5\text{m}$), with $C^1$ smooth yaw transition between $t=0.42$ and $t=0.58$ without angular snap.
- **TC-454.02 [UC-VEHICLE-AIRLINER-PARABOLIC/MSS]**: Given Transit flight (`transit`) between airports, When calling `calculateTransportVehicleTransform` at progress `0.5`, Then returns peak altitude $Y \ge 2.5$, with positive pitch during climb ($t = 0.2$), negative pitch during descent ($t = 0.8$), and no police siren property.
- **TC-454.03 [UC-VEHICLE-SIREN-ALTERNATION/MSS]**: Given advancing timestamp and audit flight, When calling `resolveSirenPhase`, Then alternates strictly between `'red'` and `'blue'` with frequency $\ge 4\text{ Hz}$.
- **TC-454.04 [UC-VEHICLE-OUT-OF-BOUNDS-SAFETY/A1]**: Given invalid or negative progress ($t < 0.0$ or $t > 1.0$), When calling `calculateTransportVehicleTransform`, Then clamps progress safely to $[0.0, 1.0]$ without NaN or throwing.
- **TC-454.05 [UC-ANIMATOR-NEON-PURGE-ON-FLIGHT/MSS]**: Given `ActiveSpringPawn` with direct flight animation, When inspecting rendered markup, Then `PawnHopTrajectory` is rendered with `visible={false}`, `SingleHopPawn` receives `hidePawnMesh={true}`, and `ThematicTransportVehicle` is present.
- **TC-454.06 [UC-VEHICLE-RELATIONAL-COVARIANCE/MSS]**: Given two distinct flight progress points $t_1 = 0.2$ and $t_2 = 0.8$, When calling `calculateTransportVehicleTransform`, Then positions are distinct ($P(t_1) \neq P(t_2)$).

## 8. Mechanical Verification Commands
- `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_454_THEMATIC_TRANSPORT_VEHICLES_AND_NEON_PURGE.md --auto-sign`
- `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_454_THEMATIC_TRANSPORT_VEHICLES_AND_NEON_PURGE.md`
- `npm run prefilter -- src/client/3d/thematic_transport_calc.ts src/client/3d/thematic_transport_vehicle.tsx src/client/3d/single_hop_pawn.tsx src/client/3d/pawn_animator.tsx tests/client/imp454_thematic_transport_vehicles.test.ts tests/client/pawn_hop_trajectory_visibility.test.ts`
- `node scripts/capture_visual_evidence.mjs --ticket IMP-454 --scenario camera_chase_normal`
- `npm test -- tests/client/imp454_thematic_transport_vehicles.test.ts tests/client/pawn_hop_trajectory_visibility.test.ts`
- `npm run sentinel -- --ticket IMP-454 --test tests/client/imp454_thematic_transport_vehicles.test.ts`
- `node scripts/check_evidence.mjs IMP-454`

## 9. Definition of Done (DoD)
1. **Station 1**: 6/6 contract tests authored by `qa-tester` fail initially with Semantic RED assertions.
2. **Station 2**: Minimal implementation in production files satisfies 100% contract tests (GREEN).
3. **Station 2.5**: `fast_prefilter.mjs` exits 0 (0 type errors, 0 dirty casts, LOC budgets maintained).
4. **Station 3**: Both police car and airplane models render safely in R3F with fallback and active siren lightbar.
5. **Station 4**: Chaos Sentinel achieves 100% mutant kill rate, live WebSocket port 0 passes, and `check_evidence.mjs` verifies physical disk artifacts.
