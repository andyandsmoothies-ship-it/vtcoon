# Plan IMP-379: MiniatureCityDiorama Mobile Purge & Skyline/Bridge LOD (Ticket IMP-379)

## 0. Auto-Slicing Roadmap (Micro-Slices Matrix)
- **Slice 1 (IMP-379 - THIS TICKET)**: MiniatureCityDiorama Mobile Purge, Skyline streetlamps culling & Bridges mobile cable/strut LOD.
- **Slice 2 (IMP-380)**: OwnerPricePill Instanced Frames & Texture Atlas Text for 28 property tiles.

## 0.1. Context & Architectural Rationale
- **Telemetry**: iOS Safari đo thực tế 530 Draw Calls ở đầu trận (levelMap = 0), FPS chỉ đạt 23–33 FPS (ngân sách <= 85 calls).
- **Nguyên nhân**: Sa bàn đô thị trung tâm `MiniatureCityDiorama` render hàng loạt sub-mesh riêng rạc: 10 cột đèn đường (`DioramaSkyline` = 30 calls), 12 dây văng Cầu Ba Son & 22 thanh giằng/dầm đỉnh Cầu Long Biên (`DioramaBridges` = 34 calls), đài phun nước 7 tầng.
- **Giải pháp**:
  1. Lan truyền `isMobile` từ `MiniatureCityDiorama` xuống cây con; các component con dùng prop `{ isMobile = false }` thuần túy, tuyệt đối không import `device_detect.ts`.
  2. Trên mobile culling 10 cột đèn đường riêng lẻ, giữ nguyên 100% tòa nhà di sản, bến Waterbus và tháp Bitexco bảo vệ `imp84`.
  3. Cầu Ba Son ẩn 12 dây văng, early-return `[]` trong `useMemo` của `basonCables`; Cầu Long Biên ẩn 20 thanh giằng chéo và 2 dầm ngang đỉnh lơ lửng (tiết kiệm 22 calls); `useSafeFrame` đặt `if (isMobile) return;` bên trong callback closure.
  4. `CentralMonumentPlaza` giữ nguyên node type, chuyển sang 2-mesh thể tích (bệ $0.04\text{m}$ `#0EA5E9` và tháp $0.52\text{m}$ `#F59E0B`, chân cắm ngập $0.02\text{m}$ chống Z-fighting Gotcha 24).
  5. Bảo toàn 100% đoàn tàu metro, du thuyền sông Sài Gòn và nền địa hình sa bàn.

## 1. Physical Target Files & Honest LOC Accounting
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/miniature_city_diorama.tsx` | Tier 2 (UI/3D/Views) | 347 | 365 | +18 | <= 500 | Safe (< 390 LOC) |
| `src/client/3d/diorama/diorama_skyline.tsx` | Tier 2 (UI/3D/Views) | 383 | 387 | +4 | <= 500 | Safe (< 400 LOC) |
| `src/client/3d/diorama/diorama_bridges.tsx` | Tier 2 (UI/3D/Views) | 275 | 335 | +60 | <= 500 | Safe (< 380 LOC) |
| `src/client/3d/diorama/diorama_lod_helpers.ts` | Tier 2 (UI/3D/Views) | 0 | 90 | +90 | <= 500 | 🆕 Tệp mới (LOD helpers) |
| `src/client/3d/sunny_island_lobby_scene.tsx` | Tier 2 (UI/3D/Views) | 307 | 315 | +8 | <= 500 | Safe (Lobby DI Call-site) |
| `tests/client/imp379_miniature_city_diorama_mobile_lod.test.ts` | Living Test | 0 | 170 | +170 | <= 600 | 🆕 Tệp mới |
| `docs/FEATURE_MAP.md` | SSOT Matrix | 91 | 94 | +3 | N/A | Cập nhật Pillar 13 |

## 2. In-Action Visual Capture Registration
- Scenario: `board_ownership_monopoly` (`scripts/visual_scenarios/board_ownership_monopoly.js`)
- Verification Command: `npm run capture:visual -- --ticket IMP-379 --scenario board_ownership_monopoly`
- Viewport: Desktop HD (`1280x800`) & Mobile WebKit (`360x740`)
- Target: Sa bàn trung tâm tinh gọn trên mobile; giữ nguyên đoàn tàu, du thuyền, tháp Bitexco; draw calls giảm mạnh.

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
Tệp kiểm thử: `tests/client/imp379_miniature_city_diorama_mobile_lod.test.ts`
- **TC-379.01 [UC-DIORAMA-MOBILE-PROP-WIRING/MSS]:** Given `MiniatureCityDiorama`, When rendered with `isMobile={true}`, Then propagates `isMobile` to `DioramaSkyline`, `DioramaBridges`, and renders `CentralMonumentPlaza` with exactly 2 volumetric meshes embedded $0.02\text{m}$ without depth flickering.
- **TC-379.02 [UC-SKYLINE-STREETLAMP-CULLING/MSS]:** Given `DioramaSkyline`, When `isMobile={true}`, Then culls 10 individual streetlamp groups (`STREETLAMP_LOCATIONS`) while preserving `bitexco-tower` and `colonial-waterfront-heritage`.
- **TC-379.03 [UC-BRIDGES-MOBILE-LOD/MSS]:** Given `DioramaBridges`, When `isMobile={true}`, Then suppresses 12 Ba Son stay cables, 20 Long Biên diagonal truss struts, 2 top dangling crossbeams, and bypasses `useSafeFrame` LED animation inside callback closure.
- **TC-379.04 [UC-DYNAMIC-ELEMENTS-PRESERVED/MSS]:** Given `MiniatureCityDiorama`, When `isMobile={true}`, Then preserves `DioramaModelRailroad`, `DioramaHarborCruiser`, and `DioramaTerrain`.

### Station 2: Implementation (GREEN)

#### Task 1: Bổ sung prop `isMobile` và tinh giản `CentralMonumentPlaza` 2-mesh
**Target physical file**: `src/client/3d/miniature_city_diorama.tsx`
```tsx
<<<<
export function CentralMonumentPlaza(): React.ReactElement {
  return (
    <group position={[0, 0.02, 0]} data-testid="central-monument-plaza">
====
export function CentralMonumentPlaza({ isMobile = false }: { readonly isMobile?: boolean } = {}): React.ReactElement {
  if (isMobile) {
    return (
      <group position={[0, 0.02, 0]} data-testid="central-monument-plaza">
        <mesh receiveShadow position={[0, 0.02, 0]}>
          <cylinderGeometry args={[1.15, 1.25, 0.04, 24]} />
          <meshStandardMaterial color="#0EA5E9" roughness={0.3} metalness={0.1} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.30, 0]}>
          <cylinderGeometry args={[0.06, 0.18, 0.52, 16]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.85} roughness={0.18} />
        </mesh>
      </group>
    );
  }
  return (
    <group position={[0, 0.02, 0]} data-testid="central-monument-plaza">
>>>>
```
```tsx
<<<<
      {/* 1.1. Quảng trường Tượng đài Biểu tượng Trung tâm */}
      <CentralMonumentPlaza />
      {/* 1.2. Tuyến hành lang đi bộ lát đá hoa cương & tiểu cảnh công viên */}
      <DioramaPedestrianPromenades isMobile={isMobile} />
      {/* 1.3. Tán cây xanh cảnh quan đô thị nhiệt đới đa tầng */}
      <DioramaUrbanCanopy isMobile={isMobile} />
      {/* 2. Cầu Ba Son (Bắc) và Cầu Long Biên (Nam) nối liền hai bờ sông */}
      <DioramaBridges />
      {/* 3. Trung tâm Văn hóa Triển lãm & Công viên Cảnh quan Bờ sông */}
      {!isMobile && <DioramaCivicCenter />}
      {!isMobile && <DioramaWaterfrontPark />}
      {/* 4. Cảng Container Cát Lái & Bến du thuyền (Đông Nam) */}
      <DioramaContainerPort isMobile={isMobile} />
      <DioramaMarina isMobile={isMobile} />
      {/* 4.1. Thuyền du ngoạn lòng sông Sài Gòn (Bảo tồn hợp đồng TC-265.07) */}
      <DioramaHarborCruiser isMobile={isMobile} />
      {/* 5. Cụm cao ốc tài chính Landmark Skyline & Tháp cao ốc nén */}
      <DioramaSkyline />
====
      {/* 1.1. Quảng trường Tượng đài Biểu tượng Trung tâm */}
      <CentralMonumentPlaza isMobile={isMobile} />
      {/* 1.2. Tuyến hành lang đi bộ lát đá hoa cương & tiểu cảnh công viên */}
      <DioramaPedestrianPromenades isMobile={isMobile} />
      {/* 1.3. Tán cây xanh cảnh quan đô thị nhiệt đới đa tầng */}
      <DioramaUrbanCanopy isMobile={isMobile} />
      {/* 2. Cầu Ba Son (Bắc) và Cầu Long Biên (Nam) nối liền hai bờ sông */}
      <DioramaBridges isMobile={isMobile} />
      {/* 3. Trung tâm Văn hóa Triển lãm & Công viên Cảnh quan Bờ sông */}
      {!isMobile && <DioramaCivicCenter />}
      {!isMobile && <DioramaWaterfrontPark />}
      {/* 4. Cảng Container Cát Lái & Bến du thuyền (Đông Nam) */}
      <DioramaContainerPort isMobile={isMobile} />
      <DioramaMarina isMobile={isMobile} />
      {/* 4.1. Thuyền du ngoạn lòng sông Sài Gòn (Bảo tồn hợp đồng TC-265.07) */}
      <DioramaHarborCruiser isMobile={isMobile} />
      {/* 5. Cụm cao ốc tài chính Landmark Skyline & Tháp cao ốc nén */}
      <DioramaSkyline isMobile={isMobile} />
>>>>
```

#### Task 2: Culling 10 cột đèn đường trong `DioramaSkyline`
**Target physical file**: `src/client/3d/diorama/diorama_skyline.tsx`
```tsx
<<<<
export function DioramaSkyline(): React.ReactElement {
====
export function DioramaSkyline({ isMobile = false }: { readonly isMobile?: boolean } = {}): React.ReactElement {
>>>>
```
```tsx
<<<<
      {/* 4. Cột đèn đường đô thị vi mô (Micro Streetlamps) */}
      {STREETLAMP_LOCATIONS.map(([lx, lz], i) => (
====
      {/* 4. Cột đèn đường đô thị vi mô (Micro Streetlamps) */}
      {!isMobile && STREETLAMP_LOCATIONS.map(([lx, lz], i) => (
>>>>
```

#### Task 3: Culling dây văng Ba Son, thanh giằng Long Biên và tuân thủ Rules of Hooks
**Target physical file**: `src/client/3d/diorama/diorama_bridges.tsx`
```tsx
<<<<
export function DioramaBridges(): React.ReactElement {
====
export function DioramaBridges({ isMobile = false }: { readonly isMobile?: boolean } = {}): React.ReactElement {
>>>>
```
```tsx
<<<<
  useSafeFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (isNight && basonLedRef1.current && basonLedRef2.current) {
====
  useSafeFrame((state) => {
    if (isMobile) return;
    const t = state.clock.getElapsedTime();
    if (isNight && basonLedRef1.current && basonLedRef2.current) {
>>>>
```
```tsx
<<<<
  const basonCables = useMemo(() => {
    const pylonAnchor: [number, number, number] = [-0.8, 0.95, 0];
====
  const basonCables = useMemo(() => {
    if (isMobile) return [];
    const pylonAnchor: [number, number, number] = [-0.8, 0.95, 0];
>>>>
```
```tsx
<<<<
        {/* 6 cặp Dây văng rẻ quạt (Stay Cables) đan từ đỉnh tháp xuống mặt cầu */}
        {basonCables.map((cable, i) => (
====
        {/* 6 cặp Dây văng rẻ quạt (Stay Cables) đan từ đỉnh tháp xuống mặt cầu */}
        {!isMobile && basonCables.map((cable, i) => (
>>>>
```
```tsx
<<<<
            {/* Các thanh chéo giàn thép */}
            {[-0.8, -0.4, 0, 0.4, 0.8].map((tx, ti) => (
              <mesh key={`truss-strut-f-${ti}`} position={[tx, 0.04, 0.23]} rotation={[0, 0, (ti % 2 === 0 ? 1 : -1) * 0.45]} castShadow>
                <boxGeometry args={[0.02, 0.16, 0.02]} />
                <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.6} />
              </mesh>
            ))}

            {/* Giàn thép vòm cong phía sau màu thép than tự nhiên */}
            <mesh position={[0, 0.08, -0.23]} castShadow>
              <boxGeometry args={[2.2, 0.03, 0.02]} />
              <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.6} />
            </mesh>
            {[-0.8, -0.4, 0, 0.4, 0.8].map((tx, ti) => (
              <mesh key={`truss-strut-b-${ti}`} position={[tx, 0.04, -0.23]} rotation={[0, 0, (ti % 2 === 0 ? 1 : -1) * 0.45]} castShadow>
                <boxGeometry args={[0.02, 0.16, 0.02]} />
                <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.6} />
              </mesh>
            ))}

            {/* Giàn thanh ngang kết nối đỉnh vòm */}
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[2.0, 0.02, 0.46]} />
              <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.6} />
            </mesh>
====
            {/* Các thanh chéo giàn thép */}
            {!isMobile && [-0.8, -0.4, 0, 0.4, 0.8].map((tx, ti) => (
              <mesh key={`truss-strut-f-${ti}`} position={[tx, 0.04, 0.23]} rotation={[0, 0, (ti % 2 === 0 ? 1 : -1) * 0.45]} castShadow>
                <boxGeometry args={[0.02, 0.16, 0.02]} />
                <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.6} />
              </mesh>
            ))}

            {/* Giàn thép vòm cong phía sau màu thép than tự nhiên */}
            <mesh position={[0, 0.08, -0.23]} castShadow>
              <boxGeometry args={[2.2, 0.03, 0.02]} />
              <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.6} />
            </mesh>
            {!isMobile && [-0.8, -0.4, 0, 0.4, 0.8].map((tx, ti) => (
              <mesh key={`truss-strut-b-${ti}`} position={[tx, 0.04, -0.23]} rotation={[0, 0, (ti % 2 === 0 ? 1 : -1) * 0.45]} castShadow>
                <boxGeometry args={[0.02, 0.16, 0.02]} />
                <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.6} />
              </mesh>
            ))}

            {/* Giàn thanh ngang kết nối đỉnh vòm */}
            {!isMobile && (
              <mesh position={[0, 0.15, 0]}>
                <boxGeometry args={[2.0, 0.02, 0.46]} />
                <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.6} />
              </mesh>
            )}
>>>>
```

#### Task 4: Cập nhật Ma Trận Chân Lý Duy Nhất
**Target physical file**: `docs/FEATURE_MAP.md`
- Cập nhật Pillar 13 ghi nhận chuẩn Mobile Purge & Skyline/Bridge LOD cho Sa bàn đô thị trung tâm.

### Station 3: Pre-Filter & Machine Gates
- Chạy sweep cơ học: `npm run prefilter -- src/client/3d/miniature_city_diorama.tsx src/client/3d/diorama/diorama_skyline.tsx src/client/3d/diorama/diorama_bridges.tsx tests/client/imp379_miniature_city_diorama_mobile_lod.test.ts`
- Chạy kiểm toán bằng chứng thị giác: `npm run capture:visual -- --ticket IMP-379 --scenario board_ownership_monopoly`
- Chạy kiểm toán bằng chứng và phạm vi: `node scripts/check_evidence.mjs IMP-379` và `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_379_MINIATURE_CITY_DIORAMA_MOBILE_LOD.md`

### Station 4: Chaos Sentinel & Invariant Verification
- Cấu hình 16 mutants (đảo ngược cờ `isMobile`, loại bỏ culling đèn đường, phá vỡ dây văng LOD) trong `scripts/sentinel_probes/IMP-379.json`.
- Chạy Sentinel: `npm run sentinel -- --ticket IMP-379 --test tests/client/imp379_miniature_city_diorama_mobile_lod.test.ts`.

## 4. Definition of Done (DoD) & Stopping Boundary
1. Toàn bộ 4/4 contract tests trong `imp379_miniature_city_diorama_mobile_lod.test.ts` chuyển sang GREEN.
2. Không hồi quy living test suites liên quan (`imp_perf_threejs_instancing`, `imp378_procedural_building_mobile_lod`, `imp84_bitexco_waterfront_skyline_realism`, `imp142_draw_call_and_shadow_budget`).
3. 100% Sentinel mutants bị tiêu diệt (16/16 mutants killed).
4. Dual-viewport visual capture chứng minh sa bàn vẫn sống động trên cả Desktop và Mobile.
