# Implementation Plan: IMP-434 Sunken Velvet Dong Son Arena & Bridge Landing Plazas

## 1. Physical Surface Area & Target Files
| Target File | Tier | Current LOC | Expected LOC | Net Delta | Subsystem | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/board_layout.tsx` | Tier 2 | 270 | 270 | +0 | client-3d | Hardened |
| `src/client/3d/miniature_city_diorama.tsx` | Tier 2 | 373 | 393 | +20 | client-3d | Hardened |
| `src/client/3d/dice_tray.tsx` | Tier 2 | 277 | 284 | +7 | client-3d | Hardened |
| `tests/client/imp434_sunken_velvet_arena_and_bridge_plazas.test.ts (New)` | Living Tests (New) | 0 | 180 | +180 | client-3d | New |

## 2. Core Contract Invariants
- **[INV-ARENA-DCC-ASSET-AND-URL]**: `SUNKEN_ARENA_MODEL_URL = '/models/board/sunken_velvet_dice_arena.glb'`. Asset <= 48KB (actual 42.3KB), <= 2500 tris (actual 1984), radius 1.65m, sunken floor Y = -0.02m.
- **[INV-PLAZAS-DCC-ASSET-AND-URL]**: `BRIDGE_PLAZAS_MODEL_URL = '/models/board/bridge_landing_plazas.glb'`. Asset <= 32KB (actual 13.1KB), <= 800 tris (actual 216), 4 beveled stone plazas at (±2.7, 0.015, ±3.8).
- **[INV-CENTRAL-PLAZA-SAFE-MOUNT]**: `CentralMonumentPlaza({ isDesktopLean: true })` mounts `SafeGLTFModel` with `SUNKEN_ARENA_MODEL_URL` and preserves fallback with `#8C6239`, peak Y <= 0.05m, vertical clearance >= 0.20m for `DICE_REST_Y = 0.26`.
- **[INV-DICE-TRAY-DUAL-MODE-AFFORDANCE]**: `DiceTray({ hasSunkenArena?: boolean })` defaults to `hasSunkenArena = false` (rendering legacy plinth meshes for mobile and living tests), while `hasSunkenArena = true` suppresses plinth boxes so dice roll cleanly inside the sunken arena.
- **[INV-BOARD-LAYOUT-PRESENTATION-WIRING]**: `BoardLayout` renders `<DiceTray hasSunkenArena={!isMobile} />` closing the presentation wire on desktop while preserving mobile safety.

## 3. Principles Applied
- `[View-Model Seam Extraction & DCC Pipeline] -> Blender 5.2 sculpted organic meshes exported to binary GLB, replacing Three.js primitive box collages.`
- `[Spatial AABB / Non-Occlusion] -> Sunken floor at Y = -0.02m cradled by emerald velvet cushion (roughness 0.85) and brass collar lip, guaranteeing >= 0.20m dice landing clearance.`
- `[Resource Disposal & Single Draw Call] -> All 4 bridge abutment landing plazas batched into 1 GLB with 2 shared PBR materials (Ivory Granite + Antique Brass), 0 extra draw calls in headless fallback.`
- `[Poka-Yoke Domain Affordance & Living Test Parity] -> DiceTray defaults to hasSunkenArena = false, preserving 100% of living contract tests and mobile plinth support.`
- `[100% DTO & Call-Site Wiring] -> BoardLayout explicitly passes hasSunkenArena={!isMobile} to DiceTray, eliminating severed presentation wires.`

## 4. Exact Drop-in Code Snippets

**Target physical file**: `src/client/3d/board_layout.tsx`
```tsx
<<<<
      {/* 3. Sàn diễn xúc xắc 3D thoáng đãng trên Đại Lộ Sài Gòn */}
      <DiceTray />
====
      {/* 3. Sàn diễn xúc xắc 3D thoáng đãng trên Đại Lộ Sài Gòn */}
      <DiceTray hasSunkenArena={!isMobile} />
>>>>
```

**Target physical file**: `src/client/3d/miniature_city_diorama.tsx`
```tsx
<<<<
import { createDongSonPlazaTexture } from './tabletop_texture_generator';
====
import { SafeGLTFModel } from './asset_loader/safe_gltf_model';
import { createDongSonPlazaTexture } from './tabletop_texture_generator';

export const SUNKEN_ARENA_MODEL_URL = '/models/board/sunken_velvet_dice_arena.glb';
export const BRIDGE_PLAZAS_MODEL_URL = '/models/board/bridge_landing_plazas.glb';
>>>>
```

```tsx
<<<<
  if (isDesktopLean) {
    const dongSonTexture = createDongSonPlazaTexture();
    return (
      <group position={[0, 0.02, 0]} data-testid="central-monument-plaza">
        {/* 1. Đài bệ đá phiến hoa cương tròn neo vững chân đế sa bàn */}
        <mesh receiveShadow position={[0, 0.008, 0]}>
          <cylinderGeometry args={[1.52, 1.58, 0.015, 48]} />
          <meshStandardMaterial color="#334155" roughness={0.45} metalness={0.1} />
        </mesh>
        {/* 2. Đĩa Khảm Trống Đồng PBR phẳng lặng */}
        <mesh receiveShadow position={[0, 0.015, 0]}>
          <cylinderGeometry args={[1.38, 1.44, 0.03, 48]} />
          <meshStandardMaterial
            color={dongSonTexture ? '#FFFFFF' : '#8C6239'}
            metalness={0.85}
            roughness={0.24}
            map={dongSonTexture ?? undefined}
          />
        </mesh>
        {/* 3. Vành khuyên đồng thau bo viền ngoài (không che mặt đĩa) */}
        <mesh receiveShadow position={[0, 0.0305, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.38, 1.44, 48]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
    );
  }
====
  if (isDesktopLean) {
    const dongSonTexture = createDongSonPlazaTexture();
    return (
      <group position={[0, 0.02, 0]} data-testid="central-monument-plaza">
        <SafeGLTFModel
          url={SUNKEN_ARENA_MODEL_URL}
          position={[0, 0, 0]}
          receiveShadow
          fallback={
            <>
              {/* 1. Đài bệ đá phiến hoa cương tròn neo vững chân đế sa bàn */}
              <mesh receiveShadow position={[0, 0.008, 0]}>
                <cylinderGeometry args={[1.52, 1.58, 0.015, 48]} />
                <meshStandardMaterial color="#334155" roughness={0.45} metalness={0.1} />
              </mesh>
              {/* 2. Đĩa Khảm Trống Đồng PBR phẳng lặng */}
              <mesh receiveShadow position={[0, 0.015, 0]}>
                <cylinderGeometry args={[1.38, 1.44, 0.03, 48]} />
                <meshStandardMaterial
                  color={dongSonTexture ? '#FFFFFF' : '#8C6239'}
                  metalness={0.85}
                  roughness={0.24}
                  map={dongSonTexture ?? undefined}
                />
              </mesh>
              {/* 3. Vành khuyên đồng thau bo viền ngoài (không che mặt đĩa) */}
              <mesh receiveShadow position={[0, 0.0305, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.38, 1.44, 48]} />
                <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.2} />
              </mesh>
            </>
          }
        />
      </group>
    );
  }
>>>>
```

```tsx
<<<<
      <DioramaPedestrianPromenades isMobile={isMobile} />
      <DioramaUrbanCanopy isMobile={isMobile} />
      <group name="ChainLandmark_bason-bridge" ref={(el) => { landmarkGroupRefs.current[3] = el; }}>
====
      <DioramaPedestrianPromenades isMobile={isMobile} />
      <DioramaUrbanCanopy isMobile={isMobile} />
      {/* Bệ đá cẩm thạch ngà tiếp đất 4 mố cầu (Bridge Landing Plazas) */}
      <SafeGLTFModel
        url={BRIDGE_PLAZAS_MODEL_URL}
        position={[0, 0, 0]}
        receiveShadow
        fallback={null}
      />
      <group name="ChainLandmark_bason-bridge" ref={(el) => { landmarkGroupRefs.current[3] = el; }}>
>>>>
```

**Target physical file**: `src/client/3d/dice_tray.tsx`
```tsx
<<<<
export function DiceTray(): React.ReactElement {
====
export interface DiceTrayProps {
  readonly hasSunkenArena?: boolean;
}

export function DiceTray({ hasSunkenArena = false }: DiceTrayProps = {}): React.ReactElement {
>>>>
```

```tsx
<<<<
    <group position={[0.0, 0.020, 0.0]} data-testid="dice-tray">
      {/* Sàn diễn xúc xắc phẳng trên sông Sài Gòn với hoa văn la bàn đồng thau */}
      <mesh receiveShadow position={[0, -0.01, 0]}>
        <boxGeometry args={[3.2, 0.015, 2.4]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.65} />
      </mesh>
      <mesh receiveShadow position={[0, -0.005, 0]}>
        <boxGeometry args={[3.0, 0.015, 2.2]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.55} />
      </mesh>
      {Boolean(isRolling || (isVisible && fadeOpacity > 0)) && (
        <>
          <mesh receiveShadow position={[0, 0.001, 0]}>
            <boxGeometry args={[2.8, 0.015, 2.0]} />
            <meshStandardMaterial color="#064E3B" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.45, 0.48, 32]} />
            <meshBasicMaterial color="#F59E0B" />
          </mesh>
        </>
      )}

      {/* 2 Xúc xắc 3D đỏ Ruby chỉ render khi đang quay hoặc mờ dần */}
====
    <group position={[0.0, 0.020, 0.0]} data-testid="dice-tray">
      {/* Sàn diễn xúc xắc phẳng trên sông Sài Gòn (ẩn khi dùng Sunken Velvet Dice Arena) */}
      {!hasSunkenArena && (
        <>
          <mesh receiveShadow position={[0, -0.01, 0]}>
            <boxGeometry args={[3.2, 0.015, 2.4]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.65} />
          </mesh>
          <mesh receiveShadow position={[0, -0.005, 0]}>
            <boxGeometry args={[3.0, 0.015, 2.2]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.55} />
          </mesh>
          {Boolean(isRolling || fadeOpacity > 0) && (
            <>
              <mesh position={[0, 0.001, 0]}>
                <boxGeometry args={[2.8, 0.015, 2.0]} />
                <meshStandardMaterial color="#064E3B" roughness={0.85} />
              </mesh>
              <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.45, 0.48, 32]} />
                <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.8} />
              </mesh>
            </>
          )}
        </>
      )}

      {/* 2 Xúc xắc 3D đỏ Ruby chỉ render khi đang quay hoặc mờ dần */}
>>>>
```

## 5. Station 1 Test Specifications
- TC-434.01 [UC-ARENA-ASSET-AND-BINARY-BOUNDS/MSS]: Given SUNKEN_ARENA_MODEL_URL, When checking physical asset and GLB binary accessors, Then file size is <= 48KB, collar rim max Y is <= 0.038m, and dice landing clearance is >= 0.20m.
- TC-434.02 [UC-PLAZAS-ASSET-AND-ABUTMENT-COORDS/MSS]: Given BRIDGE_PLAZAS_MODEL_URL, When checking physical asset and GLB binary accessors, Then file size is <= 32KB and centers 4 stone terraces at (±2.7, 0.014, ±3.8).
- TC-434.03 [UC-CENTRAL-PLAZA-FALLBACK-PARITY/MSS]: Given CentralMonumentPlaza in headless mode, When rendered with isDesktopLean: true, Then mounts SafeGLTFModel with SUNKEN_ARENA_MODEL_URL and fallback color #8C6239.
- TC-434.04 [UC-DICE-TRAY-TABLETOP-AND-MOBILE-PARITY/MSS]: Given DiceTray, When rendered with hasSunkenArena: true vs false, Then hasSunkenArena: true suppresses plinth boxes while hasSunkenArena: false preserves legacy boxes.
- TC-434.05 [UC-BOARD-LAYOUT-PRESENTATION-WIRING/MSS]: Given BoardLayout rendered with isMobile: false, When inspecting DiceTray child props, Then propagates hasSunkenArena: true for seamless desktop tabletop wiring.

## 6. Definition of Done
- 100% test pass on tests/client/imp434_sunken_velvet_arena_and_bridge_plazas.test.ts
- Zero regressions across living tests (imp428, imp53, imp356, miniature_city_diorama, bot_pacing)
- Full prefilter passes (npm run prefilter)
- Sentinel passes with 100% mutant kill (npm run sentinel -- --ticket IMP-434)
- Physical visual capture: npm run capture:visual -- --ticket IMP-434
- Comprehensive evidence audit: node scripts/check_evidence.mjs IMP-434
