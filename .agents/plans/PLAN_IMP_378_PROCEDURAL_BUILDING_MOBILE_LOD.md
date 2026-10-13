# Plan IMP-378: Procedural Building Mobile LOD & Double-Render Elimination (Ticket IMP-378)
## 0. Auto-Slicing Roadmap (Micro-Slices Matrix)
- **Slice 1 (IMP-378 - THIS TICKET)**: Procedural Building Mobile LOD, SafeGLTF forceFallback, board_tile wiring & GameBoard double-render elimination.
- **Slice 2 (IMP-379)**: Bespoke Landmark Mobile LOD in `bespoke_landmark_fallback.tsx` & Price Pill Polish in `owner_property_markers.tsx`.
- **Slice 3 (IMP-380)**: Diorama Mobile Decluttering (streetlamps, secondary vehicles) in `miniature_city_diorama.tsx`.

## 0.1. Context & Architectural Rationale
- **Telemetry**: iOS Safari ghi nhận FPS 8–9.9, Frame Time 173–195ms, Draw Calls 477–479 (ngân sách 85).
- **Nguyên nhân**: `ProceduralBuilding` vẽ 10–13 mesh/nhà $\times$ 18 nhà $\approx$ 216 calls; cùng lúc `<InstancedBoardToyBuildings />` đè lên.
- **Giải pháp**: Mobile (`isMobile=true`) dùng 4 element LOD với `MeshStandardMaterial` nhẹ; GameBoard tắt toy buildings mặc định; nối `isMobile` từ `board_tile.tsx`; thêm `forceFallback={isMobile}` vào `SafeGLTFModel`.
## 1. Physical Target Files & Honest LOC Accounting
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/procedural_building.tsx` | Tier 2 (UI/3D/Views) | 292 | 335 | +43 | <= 500 | Safe (< 360 LOC) |
| `src/client/3d/board_tile.tsx` | Tier 2 (UI/3D/Views) | 353 | 353 | 0 | <= 500 | Safe (< 370 LOC) |
| `src/client/3d/board_layout.tsx` | Tier 2 (UI/3D/Views) | 223 | 226 | +3 | <= 500 | Safe (< 240 LOC) |
| `tests/contracts/imp_perf_threejs_instancing.test.ts` | Living Test | 193 | 193 | 0 | <= 600 | Cập nhật hợp đồng TC-INST-16 |
| `tests/client/imp378_procedural_building_mobile_lod.test.ts` | Living Test | 0 | 180 | +180 | <= 600 | 🆕 Tệp mới |

## 2. In-Action Visual Capture Registration
- Scenario: `board_ownership_monopoly` (`scripts/visual_scenarios/board_ownership_monopoly.js`)
- Verification Command: `node scripts/capture_visual_evidence.mjs --scenario board_ownership_monopoly`
- Viewport: Desktop HD (`1920x1080`) & Mobile WebKit (`390x844`)
- Target: Shophouse, Complex hiển thị rõ nét trên cả Desktop và Mobile; tắt render kép; draw calls giảm mạnh.

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- Viết bộ kiểm thử hợp đồng tại `tests/client/imp378_procedural_building_mobile_lod.test.ts`:
  - TC-378.01 [UC-SHOPHOUSE-MOBILE-LOD/MSS]: Given ProceduralBuilding with level=1 (Shophouse), When isMobile=true, Then renders streamlined 4-element structure with standard material, and when isMobile=false, renders full 10-mesh Indochine shophouse.
  - TC-378.02 [UC-COMPLEX-MOBILE-LOD/MSS]: Given ProceduralBuilding with level=2 (Complex), When isMobile=true, Then renders streamlined 4-element tower with standard material and night glow, avoiding heavy clearcoat physical materials.
  - TC-378.03 [UC-BOARD-LAYOUT-NO-DOUBLE-RENDER/MSS]: Given GameBoard in board_layout.tsx, When rendered with default props, Then suppresses generic toy buildings and mounts diverse procedural buildings without Z-fighting.
  - TC-378.04 [UC-WIRE-AND-FORCE-FALLBACK/MSS]: Given LayeredDioramaTile and ProceduralBuilding, When isMobile=true, Then wires isMobile to building and sets forceFallback on SafeGLTFModel.

### Station 2: Implementation (GREEN)

#### Task 1: Bổ sung prop `isMobile`, `forceFallback`, và Mobile LOD trong `src/client/3d/procedural_building.tsx`
**Target physical file**: `src/client/3d/procedural_building.tsx`
```tsx
<<<<
  readonly showEmptyPlotBoundary?: boolean;
}
====
  readonly showEmptyPlotBoundary?: boolean;
  readonly isMobile?: boolean;
}
>>>>
```
```tsx
<<<<
  readonly isSunset: boolean;
}
====
  readonly isSunset: boolean;
  readonly isMobile?: boolean;
}
>>>>
```
```tsx
<<<<
function ShophouseFallback({ groupColor, isNight, isSunset }: FallbackProps): React.ReactElement {
  const glow = isNight ? 0.45 : isSunset ? 0.25 : 0.0;
  return (
    <group>
      <mesh receiveShadow position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.62, 0.52]} />
        <meshBasicMaterial color="#0F172A" transparent opacity={0.35} />
      </mesh>
====
function ShophouseFallback({ groupColor, isNight, isSunset, isMobile }: FallbackProps): React.ReactElement {
  const glow = isNight ? 0.45 : isSunset ? 0.25 : 0.0;
  if (isMobile) {
    return (
      <group data-testid="shophouse-mobile-lod">
        <mesh receiveShadow position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.62, 0.52]} />
          <meshBasicMaterial color="#0F172A" transparent opacity={0.35} />
        </mesh>
        <RoundedBox args={[0.54, 0.30, 0.44]} radius={0.012} smoothness={1} position={[0, 0.16, 0]}>
          <meshStandardMaterial color="#FEF3C7" roughness={0.45} />
        </RoundedBox>
        <mesh position={[0, 0.44, 0]} rotation={[0, Math.PI / 4, 0]}>
          <cylinderGeometry args={[0, 0.46, 0.22, 4]} />
          <meshStandardMaterial color="#B91C1C" roughness={0.38} />
        </mesh>
        <RoundedBox args={[0.36, 0.045, 0.02]} radius={0.008} smoothness={1} position={[0, 0.3, 0.22]}>
          <meshStandardMaterial color={groupColor} roughness={0.3} emissive={groupColor} emissiveIntensity={glow} />
        </RoundedBox>
      </group>
    );
  }
  return (
    <group>
      <mesh receiveShadow position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.62, 0.52]} />
        <meshBasicMaterial color="#0F172A" transparent opacity={0.35} />
      </mesh>
>>>>
```
```tsx
<<<<
function ComplexFallback({ groupColor, isNight, isSunset }: FallbackProps): React.ReactElement {
  const glow = isNight ? 0.45 : isSunset ? 0.25 : 0.0;
  return (
    <group>
      <mesh position={[0, 0.002, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.66, 0.56]} />
        <meshBasicMaterial color="#0F172A" transparent opacity={0.38} />
      </mesh>
====
function ComplexFallback({ groupColor, isNight, isSunset, isMobile }: FallbackProps): React.ReactElement {
  const glow = isNight ? 0.45 : isSunset ? 0.25 : 0.0;
  if (isMobile) {
    return (
      <group data-testid="complex-mobile-lod">
        <mesh position={[0, 0.002, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.66, 0.56]} />
          <meshBasicMaterial color="#0F172A" transparent opacity={0.38} />
        </mesh>
        <RoundedBox args={[0.6, 0.16, 0.5]} radius={0.02} smoothness={1} position={[0, 0.08, 0]}>
          <meshStandardMaterial color={groupColor} roughness={0.3} metalness={0.3} />
        </RoundedBox>
        <RoundedBox args={[0.52, 0.52, 0.42]} radius={0.025} smoothness={1} position={[0, 0.418, 0]}>
          <meshStandardMaterial color="#0284C7" roughness={0.15} metalness={0.7} envMapIntensity={1.4} emissive="#0284C7" emissiveIntensity={glow * 0.4} />
        </RoundedBox>
        <RoundedBox args={[0.2, 0.1, 0.2]} radius={0.01} smoothness={1} position={[-0.08, 0.72, 0]}>
          <meshStandardMaterial color="#475569" roughness={0.5} />
        </RoundedBox>
      </group>
    );
  }
  return (
    <group>
      <mesh position={[0, 0.002, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.66, 0.56]} />
        <meshBasicMaterial color="#0F172A" transparent opacity={0.38} />
      </mesh>
>>>>
```
```tsx
<<<<
export function ProceduralBuilding({
  level,
  groupColor = '#DC2626',
  cellIndex,
  showEmptyPlotBoundary = false,
}: ProceduralBuildingProps): React.ReactElement {
====
export function ProceduralBuilding({
  level,
  groupColor = '#DC2626',
  cellIndex,
  showEmptyPlotBoundary = false,
  isMobile = false,
}: ProceduralBuildingProps): React.ReactElement {
>>>>
```
```tsx
<<<<
      <SafeGLTFModel
        url={modelUrl}
        fallback={
          <>
            {level === 1 && <ShophouseFallback groupColor={groupColor} isNight={isNight} isSunset={isSunset} />}
            {level === 2 && <ComplexFallback groupColor={groupColor} isNight={isNight} isSunset={isSunset} />}
====
      <SafeGLTFModel
        url={modelUrl}
        forceFallback={isMobile ? true : undefined}
        fallback={
          <>
            {level === 1 && <ShophouseFallback groupColor={groupColor} isNight={isNight} isSunset={isSunset} isMobile={isMobile} />}
            {level === 2 && <ComplexFallback groupColor={groupColor} isNight={isNight} isSunset={isSunset} isMobile={isMobile} />}
>>>>
```

#### Task 2: Nối dây `isMobile` từ `board_tile.tsx` vào `ProceduralBuilding`
**Target physical file**: `src/client/3d/board_tile.tsx`
```tsx
<<<<
      {cell.type === CellType.Property ? (
        <>
          <ProceduralBuilding level={currentLevel} groupColor={groupColor} cellIndex={cell.index} />
          {renderToyBuildings && (
====
      {cell.type === CellType.Property ? (
        <>
          <ProceduralBuilding level={currentLevel} groupColor={groupColor} cellIndex={cell.index} isMobile={isMobile} />
          {renderToyBuildings && (
>>>>
```

#### Task 3: Thêm cờ opt-in `renderToyBuildings` trong `src/client/3d/board_layout.tsx`
**Target physical file**: `src/client/3d/board_layout.tsx`
```tsx
<<<<
export interface GameBoardProps {
  readonly isMobile?: boolean;
}

export function GameBoard({ isMobile: propIsMobile }: GameBoardProps = {}): React.ReactElement {
====
export interface GameBoardProps {
  readonly isMobile?: boolean;
  readonly renderToyBuildings?: boolean;
}

export function GameBoard({
  isMobile: propIsMobile,
  renderToyBuildings = false,
}: GameBoardProps = {}): React.ReactElement {
>>>>
```
```tsx
<<<<
        {/* 3.5. Cụm InstancedMesh nhà đất đồ chơi C1-C3 toàn bàn cờ (<8 draw calls) */}
        <InstancedBoardToyBuildings levelMap={levelMap} />
====
        {/* 3.5. Cụm InstancedMesh nhà đồ chơi chỉ render khi yêu cầu tường minh (mặc định tắt để nhường cho ProceduralBuilding) */}
        {renderToyBuildings && <InstancedBoardToyBuildings levelMap={levelMap} />}
>>>>
```

#### Task 4: Cập nhật hợp đồng kiểm thử TC-INST-16 trong `tests/contracts/imp_perf_threejs_instancing.test.ts`
**Target physical file**: `tests/contracts/imp_perf_threejs_instancing.test.ts`
```ts
<<<<
    it('[TC-INST-16/MSS][UC-IMP-INST] GameBoard render trơn tru trong môi trường headless SSR không crash và chứa cụm instanced', () => {
      const markup = renderToStaticMarkup(React.createElement(GameBoard));
      expect(markup).toContain('data-testid="instanced-board-toy-buildings"');
    });
====
    it('[TC-INST-16/MSS][UC-IMP-INST] GameBoard render trơn tru trong môi trường headless SSR không crash và chứa cụm instanced khi bật renderToyBuildings', () => {
      const markup = renderToStaticMarkup(React.createElement(GameBoard, { renderToyBuildings: true }));
      expect(markup).toContain('data-testid="instanced-board-toy-buildings"');
    });
>>>>
```

### Station 3: Mechanical Gates & Visual Verification
- `npm run prefilter -- src/client/3d/procedural_building.tsx src/client/3d/board_tile.tsx src/client/3d/board_layout.tsx tests/contracts/imp_perf_threejs_instancing.test.ts tests/client/imp378_procedural_building_mobile_lod.test.ts`
- `node scripts/capture_visual_evidence.mjs --scenario board_ownership_monopoly`
- `node scripts/check_evidence.mjs IMP-378`
## 4. Definition of Done (DoD) & Stopping Criteria
1. **Zero Regression**: 100% tests hiện hành (bao gồm cả test hợp đồng mới) chuyển sang GREEN (Exit 0).
2. **Architecture Preservation**: Toàn bộ phong cách kiến trúc đặc thù (Shophouse, Complex) được bảo toàn nguyên vẹn 100%.
3. **Double-Render Elimination**: Triệt tiêu hoàn toàn khối hộp nhà đồ chơi đè lên công trình thủ công (`renderToyBuildings=false` mặc định).
4. **Draw Call Reduction**: Giảm thiểu $\ge 150$ draw calls tiềm tàng trên di động khi các ô đất được nâng cấp.
5. **Clean Verification**: Đạt 100% kiểm toán cơ học `node scripts/check_evidence.mjs IMP-378` với 0 defects.
