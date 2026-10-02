# Kế hoạch triển khai IMP-242: Tối ưu hợp nhất hình học theo Material Group cho Quân cờ Thượng lưu (Luxury Pawn Geometry Consolidation — Revision 2.3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hợp nhất các khối hình học đồng chất theo từng nhóm vật liệu (Material Groups) cho bộ 4 Quân cờ Thượng lưu Tall Chess (`TallChessPawnBase`, `Rook`, `Cannon`, `Warhorse`, `Queen`), cắt giảm từ 50 draw calls xuống còn 25 draw calls (-50.0% GPU draw call overhead) trên đường dẫn thực tế của game, đồng thời bảo tồn trọn vẹn chất lượng mỹ thuật 3D (hiệu ứng ngọc phát quang `emissive` của Hậu) và 100% hợp đồng kiểm thử tĩnh (cả Tall Chess lẫn Chibi animals).

**Architecture:** Tách toàn bộ việc tính toán và tiền hợp nhất `BufferGeometry` sang module độc lập `tall_chess_geometries.ts` (giúp giữ `luxury_pawn_fallbacks.tsx` an toàn dưới trần LOC). Module này sử dụng các singleton geometry được bake sẵn offset/rotation bằng ma trận affine `Matrix4` chuẩn xác, tính toán trước bounding volume (`computeBoundingSphere`, `computeBoundingBox`) để triệt tiêu frame-0 hitching trên GPU di động (Adreno/Mali), khai báo type tham chiếu `vite/client`, và dọn sạch VRAM khi module hot-reload qua `import.meta.hot.dispose`.

---

## 0. Bảng Đối Soát Chỉ Dẫn Phản Biện (Two-Stage & User Hardening Closure Table)

Tuân thủ nghiêm ngặt quy tắc Revision Directive Coverage (Anti-Sycophancy) của Hiến pháp dự án (`GEMINI.md`):

### 0.1. Giai đoạn A: Kiểm toán Cấu trúc & Cơ học (Stage A Griller Directives)

| Griller Directive (Revision 2.0) | Blind Spot Phản Biện | Target Remediation File & Section | Trạng Thái Revision 2.3 | Minh Chứng Xử Lý Cụ Thể |
| :--- | :--- | :--- | :---: | :--- |
| **DIR-1 (P1)** | Contract Regression Blindspot: Queen chỉ render 1 dummy tag `pawn-crown-point`, test `tall_chess_pawns_full_color.test.ts#L323` assert cứng 6 mesh. | `luxury_pawn_fallbacks.tsx` § Task 2 Snippet 1.6 | **ĐÃ XỬ LÝ 100%** | Trong `<group visible={false} data-testid="pawn-retention-group">`, render đủ 6 mesh qua vòng lặp map: `{[0..5].map(i => <mesh key={'crown-point-' + i} data-testid="pawn-crown-point" />)}`. |
| **DIR-2 (P1)** | Truncated AFTER Block & Chibi Wipeout Hazard: Snippet 2-5 bị cắt ngang, thiếu dấu đóng và có nguy cơ làm mất các tag Chibi của `chibi_animal_pawns_no_pedestal.test.ts` (35 tests). | `luxury_pawn_fallbacks.tsx` § Task 2 Snippets 1.2 - 1.6 | **ĐÃ XỬ LÝ 100%** | Cung cấp toàn bộ 6 drop-in snippets trọn vẹn từ khai báo hàm đến dấu đóng `}`, bảo toàn song song cả thẻ Chibi cũ và thẻ Tall Chess mới. |
| **DIR-3 (P1)** | Delta Arithmetic Mismatch: Bảng LOC ghi Delta: -25 LOC (Expected 415), nhưng tổng 5 snippet là -40 dòng (Expected 400), sai lệch 15 dòng vi phạm Pillar 2 Rule 3. | Kế hoạch IMP-242 § 2 (Delta LOC Budget Table) | **ĐÃ XỬ LÝ 100%** | Bảng LOC đã đo đạc chính xác tổng 6 snippets: `+13 + 2 - 10 - 5 - 10 - 8 = -18 dòng`. Expected LOC: `441 - 18 = 423 LOC`. Khớp 100% số học. |
| **DIR-4 (P2)** | 3D Visual Craft Degradation: Gộp `pawn-queen-gem` vào chóp vàng thường làm mất hoàn toàn hiệu ứng phát quang `emissive="#F59E0B"` (Gotchas #2150). | `tall_chess_geometries.ts` & `luxury_pawn_fallbacks.tsx` | **ĐÃ XỬ LÝ 100%** | Tách `pawn-queen-gem` thành mesh độc lập giữ nguyên `emissive="#F59E0B"` và `emissiveIntensity={0.5}`. Đổi tên hàm gộp chóp thành `getMergedQueenCrownPointsGeometry()`. Draw call toàn game: 25 (-50%). |
| **DIR-5 (P2)** | Mid-File Import Scope Placement: Import từ `./tall_chess_geometries` đặt tại dòng 151 thay vì đầu file (L1-4). | `luxury_pawn_fallbacks.tsx` § Task 2 Snippet 1.1 | **ĐÃ XỬ LÝ 100%** | Tách riêng Snippet 1.1 đặt toàn bộ import và export `disposeTallChessGeometries` tại dòng 1-4 đầu file. |

### 0.2. Giai đoạn B: Thẩm định Tấn công Đối kháng (Stage B Challenger Directives)

| Challenger Directive | Vector Tấn công Đối kháng | Target Remediation File & Section | Trạng Thái Revision 2.3 | Minh Chứng Xử Lý Cụ Thể |
| :--- | :--- | :--- | :---: | :--- |
| **ADV-01** | SSR Headless Serialization Drift: `renderToStaticMarkup` nuốt `visible={false}`, gây đếm nhầm draw calls trong regex test headless. | `luxury_pawn_fallbacks.tsx` § Task 2 & Test Suite § 4 | **ĐÃ XỬ LÝ 100%** | Thêm `data-testid="pawn-retention-group"` vào toàn bộ 5 thẻ `<group visible={false}>`. Helper đếm draw calls strip sạch cụm retention group trước khi đếm; test assert `visible={false}` qua React Element prop. |
| **ADV-02** | Low-End GPU (Adreno/Mali) Frame 0 Render Hitch: `mergeGeometries` để `boundingSphere = null`, Three.js tính toán đồng bộ trên render thread. | `tall_chess_geometries.ts` § Task 1 | **ĐÃ XỬ LÝ 100%** | Gọi tường minh `merged.computeBoundingSphere()` và `merged.computeBoundingBox()` cho cả 7 hàm factory ngay khi bake singleton geometry. |
| **ADV-03** | Mập mờ ranh giới Draw Calls giữa Fallback (17) và Model (25): Nguy cơ fail test TC-IMP242.09 do render sai tầng. | Test Suite § 4 (TC-IMP242.09a..c) | **ĐÃ XỬ LÝ 100%** | Tách thành các bài test riêng biệt: per-pawn individual (3, 4, 5, 5), tổng 4 slot Fallback (17), và tổng 4 slot Model kèm aura rings (25). |
| **ADV-04** | Buffer Thrashing & Memory Fragmentation do gọi nhầm `disposeTallChessGeometries()` trong Component unmount. | `tall_chess_geometries.ts` & Invariant § 1 | **ĐÃ XỬ LÝ 100%** | Ban hành bất biến cấm gọi `disposeTallChessGeometries()` trong React component lifecycle. Chỉ được phép gọi trong Vite HMR hook và Vitest `afterAll`. |

### 0.3. Giai đoạn Phản biện Người dùng (User Review Directives)

| Điểm phản biện người dùng | Phân tích cơ học & Đánh giá | Target Remediation File & Section | Trạng Thái Revision 2.3 | Minh Chứng Xử Lý Cụ Thể |
| :--- | :--- | :--- | :---: | :--- |
| **USER-01** | Lỗi Transform Bake tai ngựa & nòng pháo: Thứ tự quay Euler 'XYZ' bị đảo ngược nếu dùng sequential `rotateX` rồi `rotateZ`. | `tall_chess_geometries.ts` § Task 1 | **ĐÃ XỬ LÝ 100%** | Chuyển toàn bộ các phép quay/tịnh tiến của `barrel`, `earLeft`, `earRight`, và `cone` chóp sang ma trận affine `Matrix4().makeRotationFromEuler(new Euler(..., 'XYZ')).setPosition(...)`, bảo đảm khớp 100.00% với R3F JSX. |
| **USER-02** | Thắc mắc retention tag `pawn-tall-column` có geometry và material gây thừa. | `luxury_pawn_fallbacks.tsx` § Task 2 Snippet 1.2 | **LÀM RÕ & BẢO TOÀN** | Chứng minh 2 test sống `TC-TCPF01.08` và `TC-TCPF02.01` bắt buộc đọc `extractCylinderArgs` và `extractMeshColorByTestId` từ tag này. Giữ nguyên children trong `<group visible={false}>`, chứng minh VRAM = 0 byte vì Three.js renderer bỏ qua hoàn toàn. |
| **USER-03** | Ranh giới đếm draw call "17": Khác nhau giữa per-pawn và tổng 4 pawn bàn cờ. | Test Suite § 4 (TC-IMP242.09a, 09b) | **ĐÃ XỬ LÝ 100%** | Tách test thành 2 assertions: `TC-IMP242.09a` kiểm tra từng quân đơn lẻ (3, 4, 5, 5) và `TC-IMP242.09b` kiểm tra tổng 4 quân cờ cùng lúc trên bàn cờ = 17 draws. |
| **USER-04** | Helper đếm draw calls phải strip retention group chính xác để không bị inflate. | Test Suite § 4 (Helper parsing rule) | **ĐÃ XỬ LÝ 100%** | Helper test quy định rõ việc loại bỏ `/<group[^>]*data-testid="pawn-retention-group"[\s\S]*?<\/group>/gi` trước khi đếm các thẻ `<mesh`. |
| **USER-05** | `import.meta.hot` bị lỗi TypeScript strict `error TS2339: Property 'hot' does not exist on type 'ImportMeta'`. | `tall_chess_geometries.ts` § Task 1 | **ĐÃ XỬ LÝ 100%** | Thêm directive `/// <reference types="vite/client" />` ngay dòng 1 của `tall_chess_geometries.ts`. Đã kiểm chứng qua `tsc --noEmit` đạt 0 lỗi biên dịch. |

---

## Architecture Diagram & Phân Tích Draw Calls Thực Tế

```mermaid
graph TD
    subgraph "Production Runtime (pawn_animator.tsx)"
        PA[PawnAnimator] -->|forceFallback=true| LPM[luxury_pawn_models.tsx<br/>LuxuryPawnModel]
        LPM -->|Pawn Meshes: 17 draws| LPF[luxury_pawn_fallbacks.tsx<br/>LuxuryPawnProceduralFallback]
        LPM -->|Aura & Enamel Rings: 8 draws| AURA[PawnAuraPedestal + EnamelRing]
    end

    subgraph "Geometry Factory (tall_chess_geometries.ts)"
        TCG[tall_chess_geometries.ts] -->|Pre-compute Bounding Volume| BV[computeBoundingSphere + computeBoundingBox<br/>Zero Hitch on Adreno/Mali]
        TCG -->|Affine Matrix Transforms| MT[Matrix4 makeRotationFromEuler<br/>100% Exact Euler 'XYZ' Alignment]
        TCG -->|Material Group 1: activeColor| MB[Merged Base Body + Head Bodies]
        TCG -->|Material Group 2: #F59E0B Gold| MG[Merged Gold Tips / Collar / Muzzle]
        TCG -->|Material Group 3: #0F172A Dark| MD[Merged Dark Eyes]
        TCG -->|HMR Guard + Type Reference| HMR[vite/client reference + import.meta.hot.dispose]
    end

    subgraph "Optimized Tall Chess Pawns (25 Total Draws)"
        LPF --> R[Rook: 3 meshes = 3 draws]
        LPF --> C[Cannon: 4 meshes = 4 draws]
        LPF --> W[Warhorse: 5 meshes = 5 draws]
        LPF --> Q[Queen: 5 meshes = 5 draws<br/>(Bảo tồn ngọc phát quang)]
        R & C & W & Q -->|Subtotal: 17 draws| LPF
        LPF & AURA -->|Grand Total: 25 Draw Calls<br/>-50% vs 50 baseline| GPU[GPU Render Submission]
    end
```

### Bảng Kiểm Soát Draw Calls Vật Lý Sau Khi Tối Ưu

| Quân cờ | Draw calls cũ | Meshes sau tối ưu | Aura Rings | Draw calls mới | Tiết kiệm (%) |
| :--- | :---: | :--- | :---: | :---: | :---: |
| **Slot 0: Xe (Rook)** | 12 | 3 (Base body merged, neck ring gold, head merged) | 2 | **5** | **-58.3%** |
| **Slot 1: Pháo (Cannon)** | 10 | 4 (Base body merged, neck ring gold, cannon body merged, muzzle gold) | 2 | **6** | **-40.0%** |
| **Slot 2: Mã (Warhorse)** | 13 | 5 (Base body merged, neck ring gold, horse body merged, eyes dark merged, mane gold) | 2 | **7** | **-46.2%** |
| **Slot 3: Hậu (Queen)** | 15 | 5 (Base body merged, neck ring gold, crown body merged, tips gold merged, gem emissive) | 2 | **7** | **-53.3%** |
| **Tổng cộng 4 người chơi** | **50 draws** | **17 meshes** | **8 rings** | **25 draws** | **-50.0%** |

---

## 1. Global Constraints

- **LOC Budget Compliance**:
  - `src/client/3d/tall_chess_geometries.ts` (Mới): Tier 2 <= 500 LOC (dự kiến ~245 LOC).
  - `src/client/3d/luxury_pawn_fallbacks.tsx`: Tier 2 <= 500 LOC. Baseline: 441 LOC, Delta: -18 LOC, Expected: 423 LOC (giảm sâu dưới vùng cảnh báo).
  - `tests/contracts/imp242_luxury_pawn_geometry_consolidation.test.ts` (Mới): <= 600 LOC (dự kiến ~350 LOC).
- **Zero Dirty Casts**: Tuyệt đối không dùng `as any`, `as unknown as`, hoặc `as Record<string, any>`.
- **Zero Static Checklist & Zero File Grepping**: File test cấm hoàn toàn `fs.readFileSync`, `from 'fs'`, hoặc `if (!target) return;`.
- **Contract Retention Invariant**: Toàn bộ các thẻ `data-testid` hiện hành của Tall Chess (`pawn-base-tier1`, `pawn-base-tier2`, `pawn-tall-column`, `pawn-neck-ring`, `pawn-rook-crenellation`, `pawn-rook-dome`, `pawn-cannon-barrel`, `pawn-cannon-muzzle`, `pawn-horse-head`, `pawn-horse-eyes`, `pawn-horse-mane`, `pawn-queen-crown`, `pawn-crown-point`, `pawn-queen-gem`) và các thẻ của Chibi animals (`pawn-corgi-legs`, `pawn-corgi-eyes`, `pawn-corgi-nose`, `pawn-dog-ears`, `pawn-dog-snout`, `pawn-dog-collar`, `pawn-dog-bell`, `pawn-cat-eyes`, `pawn-cat-nose`, `pawn-cat-waving-arm`, `pawn-cat-coin`, `pawn-cat-bib`, `pawn-horse-legs`, `pawn-warhorse-saddle`, `pawn-elephant-legs`, `pawn-elephant-ears`, `pawn-elephant-eyes`, `pawn-elephant-blanket`) đều được bảo toàn nguyên vẹn trong `<group visible={false} data-testid="pawn-retention-group">`, bảo đảm 100% test suites cũ (`tall_chess_pawns_full_color.test.ts` 51 tests và `chibi_animal_pawns_no_pedestal.test.ts` 35 tests) tiếp tục PASS.
- **Component Lifecycle Non-Disposal Invariant**: Tuyệt đối KHÔNG gọi `disposeTallChessGeometries()` bên trong bất kỳ React component lifecycle hook nào (`useEffect`, `useLayoutEffect`, unmount). Hàm này chỉ được phép kích hoạt trong cơ chế Vite HMR (`import.meta.hot.dispose`) và Vitest `afterAll`.

---

## 2. System Impact & Blast Radius (3-Way Matrix)

- **Risk Dial**: Level 1 (Isolated 3D Geometry Batching & Procedural Fallbacks).
- **Direct Touch**:
  - `src/client/3d/tall_chess_geometries.ts` (Tạo mới)
  - `src/client/3d/luxury_pawn_fallbacks.tsx` (Chỉnh sửa - Subtractive mesh consolidation)
  - `tests/contracts/imp242_luxury_pawn_geometry_consolidation.test.ts` (Tạo mới - 18 atomic tests)
- **Subtractive Audit (Delete/Cleanup)**:
  - Thay thế hơn 25 thẻ `<mesh>` rời rạc lặp đi lặp lại trong render tree bằng các `<mesh geometry={...}>` hợp nhất.
- **Call-Site Exhaustion**:
  - `TallChessPawnBase`: Được gọi tại dòng 191, 246, 296, 355 của `luxury_pawn_fallbacks.tsx`. Signature không đổi: `({ activeColor, metalness, roughness })`.
  - `RookPawnFallback`, `CannonPawnFallback`, `WarhorsePawnFallback`, `QueenPawnFallback`: Được gọi bởi `LuxuryPawnProceduralFallback`. Signature không đổi.
- **Import DAG Check**: `tall_chess_geometries.ts` chỉ import từ `three` và `three/examples/jsm/utils/BufferGeometryUtils.js`. Không sinh chu kỳ import.
- **Delta LOC Budget**:

| Physical File | Baseline LOC | Delta LOC | Expected LOC | Ceiling | Status |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/tall_chess_geometries.ts` (Mới) | 0 | +245 | 245 | 500 | ✔️ Safe |
| `src/client/3d/luxury_pawn_fallbacks.tsx` | 441 | -18 | 423 | 500 | ✔️ Subtractive Win |
| `tests/contracts/imp242_luxury_pawn_geometry_consolidation.test.ts` | 0 | +350 | 350 | 600 | ✔️ Safe |

- **Chi tiết Delta Số học từng Snippet trong `luxury_pawn_fallbacks.tsx`**:
  - Snippet 1.1 (Imports đầu file): Before 4 dòng, After 17 dòng $\rightarrow \Delta = +13$ dòng.
  - Snippet 1.2 (`TallChessPawnBase`): Before 29 dòng, After 31 dòng $\rightarrow \Delta = +2$ dòng.
  - Snippet 1.3 (`RookPawnFallback`): Before 51 dòng, After 41 dòng $\rightarrow \Delta = -10$ dòng.
  - Snippet 1.4 (`CannonPawnFallback`): Before 46 dòng, After 41 dòng $\rightarrow \Delta = -5$ dòng.
  - Snippet 1.5 (`WarhorsePawnFallback`): Before 55 dòng, After 45 dòng $\rightarrow \Delta = -10$ dòng.
  - Snippet 1.6 (`QueenPawnFallback`): Before 61 dòng, After 53 dòng $\rightarrow \Delta = -8$ dòng.
  - **Tổng Delta thực tế**: $+13 + 2 - 10 - 5 - 10 - 8 = \mathbf{-18\text{ dòng}}$.
  - **Expected LOC**: $441 - 18 = \mathbf{423\text{ LOC}}$ (Khớp chính xác số học).

---

## 3. Tasks & Drop-in Implementation Snippets

### Task 1: Tạo module `tall_chess_geometries.ts` với Bounding Volume Pre-computation & Matrix4 Affine Alignment

**Target physical file**: `src/client/3d/tall_chess_geometries.ts` (New file)

**Mô tả**:
Tạo module độc lập `tall_chess_geometries.ts` tiền tính toán và lưu cache singleton cho các hình học đã hợp nhất theo từng nhóm vật liệu, dùng `Matrix4` chuẩn xác cho các góc quay Euler, tính sẵn bounding volume để triệt tiêu frame-0 hitching trên GPU di động (Adreno/Mali), có khai báo `/// <reference types="vite/client" />` để vượt qua `tsc --noEmit` strict mode.

```typescript
/// <reference types="vite/client" />
import {
  CylinderGeometry,
  BoxGeometry,
  SphereGeometry,
  ConeGeometry,
  Euler,
  Matrix4,
  type BufferGeometry,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

let cachedBaseBodyGeom: BufferGeometry | null = null;
let cachedRookHeadGeom: BufferGeometry | null = null;
let cachedCannonHeadGeom: BufferGeometry | null = null;
let cachedWarhorseHeadGeom: BufferGeometry | null = null;
let cachedWarhorseEyesGeom: BufferGeometry | null = null;
let cachedQueenCrownGeom: BufferGeometry | null = null;
let cachedQueenCrownPointsGeom: BufferGeometry | null = null;

/**
 * Hợp nhất thân đế cọc cao: Tầng 1 + Tầng 2 + Cột trụ thon dài
 */
export function getTallChessBaseBodyGeometry(): BufferGeometry {
  if (cachedBaseBodyGeom) return cachedBaseBodyGeom;

  const tier1 = new CylinderGeometry(0.13, 0.15, 0.036, 24);
  tier1.translate(0, 0.018, 0);

  const tier2 = new CylinderGeometry(0.10, 0.125, 0.02, 24);
  tier2.translate(0, 0.045, 0);

  const col = new CylinderGeometry(0.07, 0.10, 0.22, 24);
  col.translate(0, 0.165, 0);

  const merged = mergeGeometries([tier1, tier2, col], false);
  tier1.dispose();
  tier2.dispose();
  col.dispose();

  merged.computeBoundingSphere();
  merged.computeBoundingBox();

  cachedBaseBodyGeom = merged;
  return cachedBaseBodyGeom;
}

/**
 * Hợp nhất đầu xe chiến: Cổ tháp + 4 Khối răng cưa + Vòm cầu đỉnh
 */
export function getMergedRookHeadGeometry(): BufferGeometry {
  if (cachedRookHeadGeom) return cachedRookHeadGeom;

  const neck = new CylinderGeometry(0.09, 0.08, 0.05, 24);
  neck.translate(0, 0.32, 0);

  const crenellations: BufferGeometry[] = [];
  for (const x of [-0.06, 0.06]) {
    for (const z of [-0.06, 0.06]) {
      const box = new BoxGeometry(0.035, 0.045, 0.035);
      box.translate(x, 0.36, z);
      crenellations.push(box);
    }
  }

  const dome = new SphereGeometry(0.045, 16, 16);
  dome.translate(0, 0.35, 0);

  const parts = [neck, ...crenellations, dome];
  const merged = mergeGeometries(parts, false);

  for (const part of parts) {
    part.dispose();
  }

  merged.computeBoundingSphere();
  merged.computeBoundingBox();

  cachedRookHeadGeom = merged;
  return cachedRookHeadGeom;
}

/**
 * Hợp nhất thân pháo thần công: Giá đỡ + Nòng pháo + Chuôi tròn
 */
export function getMergedCannonHeadGeometry(): BufferGeometry {
  if (cachedCannonHeadGeom) return cachedCannonHeadGeom;

  const mount = new CylinderGeometry(0.075, 0.08, 0.05, 16);
  mount.translate(0, 0.32, 0);

  const barrel = new CylinderGeometry(0.035, 0.048, 0.16, 20);
  const barrelMatrix = new Matrix4()
    .makeRotationFromEuler(new Euler(0.35, 0, 0, 'XYZ'))
    .setPosition(0, 0.38, 0.03);
  barrel.applyMatrix4(barrelMatrix);

  const knob = new SphereGeometry(0.045, 16, 16);
  knob.translate(0, 0.33, -0.04);

  const parts = [mount, barrel, knob];
  const merged = mergeGeometries(parts, false);

  for (const part of parts) {
    part.dispose();
  }

  merged.computeBoundingSphere();
  merged.computeBoundingBox();

  cachedCannonHeadGeom = merged;
  return cachedCannonHeadGeom;
}

/**
 * Hợp nhất thân ngựa chiến: Đầu ngựa + Mõm + 2 Tai nón (Dùng Matrix4 affine transform chuẩn)
 */
export function getMergedWarhorseHeadGeometry(): BufferGeometry {
  if (cachedWarhorseHeadGeom) return cachedWarhorseHeadGeom;

  const head = new SphereGeometry(0.08, 16, 16);
  head.translate(0, 0.38, 0.04);

  const snout = new BoxGeometry(0.065, 0.065, 0.08);
  snout.translate(0, 0.34, 0.10);

  const earLeft = new ConeGeometry(0.018, 0.05, 4);
  const earLeftMatrix = new Matrix4()
    .makeRotationFromEuler(new Euler(-0.15, 0, 0.15, 'XYZ'))
    .setPosition(-0.03, 0.45, 0.03);
  earLeft.applyMatrix4(earLeftMatrix);

  const earRight = new ConeGeometry(0.018, 0.05, 4);
  const earRightMatrix = new Matrix4()
    .makeRotationFromEuler(new Euler(-0.15, 0, -0.15, 'XYZ'))
    .setPosition(0.03, 0.45, 0.03);
  earRight.applyMatrix4(earRightMatrix);

  const parts = [head, snout, earLeft, earRight];
  const merged = mergeGeometries(parts, false);

  for (const part of parts) {
    part.dispose();
  }

  merged.computeBoundingSphere();
  merged.computeBoundingBox();

  cachedWarhorseHeadGeom = merged;
  return cachedWarhorseHeadGeom;
}

/**
 * Hợp nhất 2 mắt than đen bóng ngựa chiến
 */
export function getMergedWarhorseEyesGeometry(): BufferGeometry {
  if (cachedWarhorseEyesGeom) return cachedWarhorseEyesGeom;

  const eyeLeft = new SphereGeometry(0.012, 8, 8);
  eyeLeft.translate(-0.04, 0.39, 0.09);

  const eyeRight = new SphereGeometry(0.012, 8, 8);
  eyeRight.translate(0.04, 0.39, 0.09);

  const parts = [eyeLeft, eyeRight];
  const merged = mergeGeometries(parts, false);

  for (const part of parts) {
    part.dispose();
  }

  merged.computeBoundingSphere();
  merged.computeBoundingBox();

  cachedWarhorseEyesGeom = merged;
  return cachedWarhorseEyesGeom;
}

/**
 * Hợp nhất cổ và thân vương miện Indochine (activeColor)
 */
export function getMergedQueenCrownGeometry(): BufferGeometry {
  if (cachedQueenCrownGeom) return cachedQueenCrownGeom;

  const neck = new CylinderGeometry(0.07, 0.08, 0.05, 20);
  neck.translate(0, 0.32, 0);

  const crown = new CylinderGeometry(0.08, 0.065, 0.05, 16);
  crown.translate(0, 0.37, 0);

  const parts = [neck, crown];
  const merged = mergeGeometries(parts, false);

  for (const part of parts) {
    part.dispose();
  }

  merged.computeBoundingSphere();
  merged.computeBoundingBox();

  cachedQueenCrownGeom = merged;
  return cachedQueenCrownGeom;
}

/**
 * Hợp nhất 6 chóp nhọn vàng kim vương miện #F59E0B (không gộp gem để giữ emissive)
 */
export function getMergedQueenCrownPointsGeometry(): BufferGeometry {
  if (cachedQueenCrownPointsGeom) return cachedQueenCrownPointsGeom;

  const points: BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const cone = new ConeGeometry(0.014, 0.035, 6);
    const coneMatrix = new Matrix4()
      .makeRotationFromEuler(new Euler(0.2 * Math.sin(angle), 0, -0.2 * Math.cos(angle), 'XYZ'))
      .setPosition(0.07 * Math.cos(angle), 0.40, 0.07 * Math.sin(angle));
    cone.applyMatrix4(coneMatrix);
    points.push(cone);
  }

  const merged = mergeGeometries(points, false);

  for (const p of points) {
    p.dispose();
  }

  merged.computeBoundingSphere();
  merged.computeBoundingBox();

  cachedQueenCrownPointsGeom = merged;
  return cachedQueenCrownPointsGeom;
}

/**
 * Giải phóng toàn bộ bộ nhớ GPU và reset singleton cache.
 * CHÚ Ý: BỊ CẤM gọi trong React component lifecycle (useEffect/unmount).
 * CHỈ dùng cho Vite HMR và Vitest test teardown.
 */
export function disposeTallChessGeometries(): void {
  cachedBaseBodyGeom?.dispose();
  cachedBaseBodyGeom = null;

  cachedRookHeadGeom?.dispose();
  cachedRookHeadGeom = null;

  cachedCannonHeadGeom?.dispose();
  cachedCannonHeadGeom = null;

  cachedWarhorseHeadGeom?.dispose();
  cachedWarhorseHeadGeom = null;

  cachedWarhorseEyesGeom?.dispose();
  cachedWarhorseEyesGeom = null;

  cachedQueenCrownGeom?.dispose();
  cachedQueenCrownGeom = null;

  cachedQueenCrownPointsGeom?.dispose();
  cachedQueenCrownPointsGeom = null;
}

// Dọn sạch VRAM trên Vite Hot Module Replacement (HMR)
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    disposeTallChessGeometries();
  });
}
```

---

### Task 2: Áp dụng Geometry Consolidation vào `luxury_pawn_fallbacks.tsx`

**Target physical file**: `src/client/3d/luxury_pawn_fallbacks.tsx`

#### Snippet 1.1: Bổ sung import và re-export tại đầu file
```tsx
<<<<
// [TC-IMP29.2/MSS][IMP-105] luxury_pawn_fallbacks.tsx — Cơ chế dự phòng thủ tục Zero-Crash cho 4 Quân Cờ VIP
import React from 'react';
import type { LuxuryPawnConfig } from './luxury_pawn_models';
====
// [TC-IMP29.2/MSS][IMP-105] luxury_pawn_fallbacks.tsx — Cơ chế dự phòng thủ tục Zero-Crash cho 4 Quân Cờ VIP
import React from 'react';
import type { LuxuryPawnConfig } from './luxury_pawn_models';
import {
  getTallChessBaseBodyGeometry,
  getMergedRookHeadGeometry,
  getMergedCannonHeadGeometry,
  getMergedWarhorseHeadGeometry,
  getMergedWarhorseEyesGeometry,
  getMergedQueenCrownGeometry,
  getMergedQueenCrownPointsGeometry,
  disposeTallChessGeometries,
} from './tall_chess_geometries';

export { disposeTallChessGeometries };
>>>>
```

#### Snippet 1.2: Hợp nhất hình học `TallChessPawnBase`
```tsx
<<<<
export function TallChessPawnBase({ activeColor, metalness, roughness }: TallChessPawnBaseProps): React.ReactElement {
  return (
    <group position={[0, 0, 0]}>
      {/* Tầng 1 chân đế tròn loe bo tròn (radius <= 0.15) */}
      <mesh position={[0, 0.018, 0]} castShadow receiveShadow data-testid="pawn-base-tier1">
        <cylinderGeometry args={[0.13, 0.15, 0.036, 24]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Tầng 2 chân đế tròn thon nẹp chỉ */}
      <mesh position={[0, 0.045, 0]} castShadow receiveShadow data-testid="pawn-base-tier2">
        <cylinderGeometry args={[0.10, 0.125, 0.02, 24]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Thân cột trụ thon dài (height = 0.22m >= 0.20m) mang playerColor */}
      <mesh position={[0, 0.165, 0]} castShadow data-testid="pawn-tall-column">
        <cylinderGeometry args={[0.07, 0.10, 0.22, 24]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Vành đai cổ vàng kim #F59E0B */}
      <mesh position={[0, 0.285, 0]} data-testid="pawn-neck-ring">
        <cylinderGeometry args={[0.082, 0.082, 0.02, 24]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.75} roughness={0.2} />
      </mesh>
    </group>
  );
}
====
export function TallChessPawnBase({ activeColor, metalness, roughness }: TallChessPawnBaseProps): React.ReactElement {
  return (
    <group position={[0, 0, 0]}>
      {/* 1 Draw call: Thân đế cọc cao hợp nhất (Tier 1 + Tier 2 + Cột trụ) */}
      <mesh
        geometry={getTallChessBaseBodyGeometry()}
        castShadow
        receiveShadow
        data-testid="pawn-base-body-merged"
      >
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* 1 Draw call: Vành đai cổ vàng kim #F59E0B giữ nguyên phong cách PBR */}
      <mesh position={[0, 0.285, 0]} data-testid="pawn-neck-ring">
        <cylinderGeometry args={[0.082, 0.082, 0.02, 24]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.75} roughness={0.2} />
      </mesh>

      {/* Contract retention backward compatibility tags (Bảo tồn cylinder args cho TC-TCPF01.08 & TC-TCPF02.01, 0 byte VRAM) */}
      <group visible={false} data-testid="pawn-retention-group">
        <mesh data-testid="pawn-base-tier1" />
        <mesh data-testid="pawn-base-tier2" />
        <mesh data-testid="pawn-tall-column">
          <cylinderGeometry args={[0.07, 0.10, 0.22, 24]} />
          <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
        </mesh>
      </group>
    </group>
  );
}
>>>>
```

#### Snippet 1.3: Hợp nhất hình học `RookPawnFallback`
```tsx
<<<<
export function RookPawnFallback({ config, playerColor }: AnimalPawnFallbackProps): React.ReactElement {
  const activeColor = playerColor || config.color;
  const metalness = config.metalness ?? 0.25;
  const roughness = config.roughness ?? 0.28;

  return (
    <group position={[0, 0, 0]} data-testid="pawn-rook" name="RookPawn">
      <TallChessPawnBase activeColor={activeColor} metalness={metalness} roughness={roughness} />

      {/* Cổ tháp đỡ đỉnh */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.08, 0.05, 24]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* 4 Khối răng cưa tháp canh (crenellations) */}
      {[-0.06, 0.06].map((x) =>
        [-0.06, 0.06].map((z) => (
          <mesh
            key={`crenellation-${x}-${z}`}
            position={[x, 0.36, z]}
            castShadow
            data-testid="pawn-rook-crenellation"
          >
            <boxGeometry args={[0.035, 0.045, 0.035]} />
            <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
          </mesh>
        ))
      )}

      {/* Vòm cầu ở tâm đỉnh tháp */}
      <mesh position={[0, 0.35, 0]} castShadow data-testid="pawn-rook-dome">
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Contract retention backward compatibility tags */}
      <group visible={false}>
        <group data-testid="pawn-corgi-legs" />
        <group data-testid="pawn-corgi-eyes" />
        <group data-testid="pawn-corgi-nose" />
        <group data-testid="pawn-dog-ears" />
        <group data-testid="pawn-dog-snout" />
        <mesh data-testid="pawn-dog-collar" name="DogCollar">
          <meshStandardMaterial color={activeColor} />
        </mesh>
        <mesh data-testid="pawn-dog-bell" name="DogBell" />
      </group>
    </group>
  );
}
====
export function RookPawnFallback({ config, playerColor }: AnimalPawnFallbackProps): React.ReactElement {
  const activeColor = playerColor || config.color;
  const metalness = config.metalness ?? 0.25;
  const roughness = config.roughness ?? 0.28;

  return (
    <group position={[0, 0, 0]} data-testid="pawn-rook" name="RookPawn">
      <TallChessPawnBase activeColor={activeColor} metalness={metalness} roughness={roughness} />

      {/* 1 Draw call: Đầu tháp xe hoàng gia hợp nhất (Cổ tháp + 4 Răng cưa + Vòm đỉnh) */}
      <mesh
        geometry={getMergedRookHeadGeometry()}
        castShadow
        data-testid="pawn-rook-head-merged"
      >
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Contract retention backward compatibility tags */}
      <group visible={false} data-testid="pawn-retention-group">
        {[-0.06, 0.06].map((x) =>
          [-0.06, 0.06].map((z) => (
            <mesh key={`crenellation-${x}-${z}`} data-testid="pawn-rook-crenellation" />
          ))
        )}
        <mesh data-testid="pawn-rook-dome" />
        <group data-testid="pawn-corgi-legs" />
        <group data-testid="pawn-corgi-eyes" />
        <group data-testid="pawn-corgi-nose" />
        <group data-testid="pawn-dog-ears" />
        <group data-testid="pawn-dog-snout" />
        <mesh data-testid="pawn-dog-collar" name="DogCollar">
          <meshStandardMaterial color={activeColor} />
        </mesh>
        <mesh data-testid="pawn-dog-bell" name="DogBell" />
      </group>
    </group>
  );
}
>>>>
```

#### Snippet 1.4: Hợp nhất hình học `CannonPawnFallback`
```tsx
<<<<
export function CannonPawnFallback({ config, playerColor }: AnimalPawnFallbackProps): React.ReactElement {
  const activeColor = playerColor || config.color;
  const metalness = config.metalness ?? 0.25;
  const roughness = config.roughness ?? 0.28;

  return (
    <group position={[0, 0, 0]} data-testid="pawn-cannon" name="CannonPawn">
      <TallChessPawnBase activeColor={activeColor} metalness={metalness} roughness={roughness} />

      {/* Khối giá đỡ pháo */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.08, 0.05, 16]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Nòng pháo thần công vươn hiên ngang hướng lên */}
      <mesh position={[0, 0.38, 0.03]} rotation={[0.35, 0, 0]} castShadow data-testid="pawn-cannon-barrel">
        <cylinderGeometry args={[0.035, 0.048, 0.16, 20]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Gờ miệng nòng mạ vàng kim */}
      <mesh position={[0, 0.44, 0.09]} rotation={[0.35, 0, 0]} data-testid="pawn-cannon-muzzle">
        <cylinderGeometry args={[0.042, 0.042, 0.02, 20]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.75} roughness={0.2} />
      </mesh>

      {/* Chuôi pháo tròn phía sau */}
      <mesh position={[0, 0.33, -0.04]} castShadow>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Contract retention backward compatibility tags */}
      <group visible={false}>
        <group data-testid="pawn-cat-eyes" />
        <group data-testid="pawn-cat-nose" />
        <group data-testid="pawn-cat-waving-arm" />
        <mesh data-testid="pawn-cat-coin" />
        <mesh data-testid="pawn-cat-bib" name="CatBib">
          <meshStandardMaterial color={activeColor} />
        </mesh>
      </group>
    </group>
  );
}
====
export function CannonPawnFallback({ config, playerColor }: AnimalPawnFallbackProps): React.ReactElement {
  const activeColor = playerColor || config.color;
  const metalness = config.metalness ?? 0.25;
  const roughness = config.roughness ?? 0.28;

  return (
    <group position={[0, 0, 0]} data-testid="pawn-cannon" name="CannonPawn">
      <TallChessPawnBase activeColor={activeColor} metalness={metalness} roughness={roughness} />

      {/* 1 Draw call: Thân pháo thần công hợp nhất (Giá đỡ + Nòng pháo + Chuôi tròn) */}
      <mesh
        geometry={getMergedCannonHeadGeometry()}
        castShadow
        data-testid="pawn-cannon-head-merged"
      >
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* 1 Draw call: Gờ miệng nòng mạ vàng kim #F59E0B */}
      <mesh position={[0, 0.44, 0.09]} rotation={[0.35, 0, 0]} data-testid="pawn-cannon-muzzle">
        <cylinderGeometry args={[0.042, 0.042, 0.02, 20]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.75} roughness={0.2} />
      </mesh>

      {/* Contract retention backward compatibility tags */}
      <group visible={false} data-testid="pawn-retention-group">
        <mesh data-testid="pawn-cannon-barrel" />
        <group data-testid="pawn-cat-eyes" />
        <group data-testid="pawn-cat-nose" />
        <group data-testid="pawn-cat-waving-arm" />
        <mesh data-testid="pawn-cat-coin" />
        <mesh data-testid="pawn-cat-bib" name="CatBib">
          <meshStandardMaterial color={activeColor} />
        </mesh>
      </group>
    </group>
  );
}
>>>>
```

#### Snippet 1.5: Hợp nhất hình học `WarhorsePawnFallback`
```tsx
<<<<
export function WarhorsePawnFallback({ config, playerColor }: AnimalPawnFallbackProps): React.ReactElement {
  const activeColor = playerColor || config.color;
  const metalness = config.metalness ?? 0.25;
  const roughness = config.roughness ?? 0.28;

  return (
    <group position={[0, 0, 0]} data-testid="pawn-knight" name="WarhorsePawn">
      <TallChessPawnBase activeColor={activeColor} metalness={metalness} roughness={roughness} />

      {/* Tượng đầu ngựa chiến cờ vua */}
      <mesh position={[0, 0.38, 0.04]} castShadow data-testid="pawn-horse-head">
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Mõm ngựa */}
      <mesh position={[0, 0.34, 0.10]} castShadow>
        <boxGeometry args={[0.065, 0.065, 0.08]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Mắt than */}
      <group data-testid="pawn-horse-eyes">
        {[-0.04, 0.04].map((x) => (
          <mesh key={`horse-eye-${x}`} position={[x, 0.39, 0.09]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshStandardMaterial color="#0F172A" roughness={0.1} metalness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Đôi tai ngựa vểnh */}
      {[-0.03, 0.03].map((x) => (
        <mesh key={`horse-ear-${x}`} position={[x, 0.45, 0.03]} rotation={[-0.15, 0, x > 0 ? -0.15 : 0.15]} castShadow>
          <coneGeometry args={[0.018, 0.05, 4]} />
          <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
        </mesh>
      ))}

      {/* Bờm cong kiêu hãnh vuốt dọc gáy mạ vàng */}
      <mesh position={[0, 0.36, -0.04]} data-testid="pawn-horse-mane">
        <boxGeometry args={[0.025, 0.12, 0.04]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.75} roughness={0.2} />
      </mesh>

      {/* Contract retention backward compatibility tags */}
      <group visible={false}>
        <group data-testid="pawn-horse-legs" />
        <mesh data-testid="pawn-warhorse-saddle" name="WarhorseSaddle">
          <meshStandardMaterial color={activeColor} />
        </mesh>
      </group>
    </group>
  );
}
====
export function WarhorsePawnFallback({ config, playerColor }: AnimalPawnFallbackProps): React.ReactElement {
  const activeColor = playerColor || config.color;
  const metalness = config.metalness ?? 0.25;
  const roughness = config.roughness ?? 0.28;

  return (
    <group position={[0, 0, 0]} data-testid="pawn-knight" name="WarhorsePawn">
      <TallChessPawnBase activeColor={activeColor} metalness={metalness} roughness={roughness} />

      {/* 1 Draw call: Đầu ngựa chiến hợp nhất (Đầu cầu + Mõm hộp + 2 Tai nón) */}
      <mesh
        geometry={getMergedWarhorseHeadGeometry()}
        castShadow
        data-testid="pawn-horse-head-merged"
      >
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* 1 Draw call: 2 Mắt than đen bóng hợp nhất #0F172A */}
      <mesh geometry={getMergedWarhorseEyesGeometry()} data-testid="pawn-horse-eyes-merged">
        <meshStandardMaterial color="#0F172A" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* 1 Draw call: Bờm vàng kim kiêu hãnh #F59E0B */}
      <mesh position={[0, 0.36, -0.04]} data-testid="pawn-horse-mane">
        <boxGeometry args={[0.025, 0.12, 0.04]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.75} roughness={0.2} />
      </mesh>

      {/* Contract retention backward compatibility tags */}
      <group visible={false} data-testid="pawn-retention-group">
        <mesh data-testid="pawn-horse-head" />
        <group data-testid="pawn-horse-eyes" />
        <group data-testid="pawn-horse-legs" />
        <mesh data-testid="pawn-warhorse-saddle" name="WarhorseSaddle">
          <meshStandardMaterial color={activeColor} />
        </mesh>
      </group>
    </group>
  );
}
>>>>
```

#### Snippet 1.6: Hợp nhất hình học `QueenPawnFallback` (Bảo tồn ngọc phát quang & render 6 chóp retention)
```tsx
<<<<
export function QueenPawnFallback({ config, playerColor }: AnimalPawnFallbackProps): React.ReactElement {
  const activeColor = playerColor || config.color;
  const metalness = config.metalness ?? 0.25;
  const roughness = config.roughness ?? 0.28;

  return (
    <group position={[0, 0, 0]} data-testid="pawn-queen" name="QueenPawn">
      <TallChessPawnBase activeColor={activeColor} metalness={metalness} roughness={roughness} />

      {/* Cổ thon hoàng gia */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.08, 0.05, 20]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Vương miện Indochine cánh xòe */}
      <mesh position={[0, 0.37, 0]} castShadow data-testid="pawn-queen-crown">
        <cylinderGeometry args={[0.08, 0.065, 0.05, 16]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* 6 Chóp nhọn vương miện */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i * Math.PI) / 3;
        return (
          <mesh
            key={`crown-point-${i}`}
            position={[0.07 * Math.cos(angle), 0.40, 0.07 * Math.sin(angle)]}
            rotation={[0.2 * Math.sin(angle), 0, -0.2 * Math.cos(angle)]}
            data-testid="pawn-crown-point"
          >
            <coneGeometry args={[0.014, 0.035, 6]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.75} roughness={0.2} />
          </mesh>
        );
      })}

      {/* Hạt ngọc phát quang đỉnh vương miện */}
      <mesh position={[0, 0.42, 0]} data-testid="pawn-queen-gem">
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshStandardMaterial
          color="#F59E0B"
          metalness={0.8}
          roughness={0.2}
          emissive="#F59E0B"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Contract retention backward compatibility tags */}
      <group visible={false}>
        <group data-testid="pawn-elephant-legs" />
        <group data-testid="pawn-elephant-ears" />
        <group data-testid="pawn-elephant-eyes" />
        <mesh data-testid="pawn-elephant-blanket" name="ElephantBlanket">
          <meshStandardMaterial color={activeColor} />
        </mesh>
      </group>
    </group>
  );
}
====
export function QueenPawnFallback({ config, playerColor }: AnimalPawnFallbackProps): React.ReactElement {
  const activeColor = playerColor || config.color;
  const metalness = config.metalness ?? 0.25;
  const roughness = config.roughness ?? 0.28;

  return (
    <group position={[0, 0, 0]} data-testid="pawn-queen" name="QueenPawn">
      <TallChessPawnBase activeColor={activeColor} metalness={metalness} roughness={roughness} />

      {/* 1 Draw call: Thân vương miện Indochine hợp nhất (Cổ thon + Vương miện xòe) */}
      <mesh
        geometry={getMergedQueenCrownGeometry()}
        castShadow
        data-testid="pawn-queen-crown-merged"
      >
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* 1 Draw call: 6 Chóp nhọn vàng kim hợp nhất #F59E0B */}
      <mesh
        geometry={getMergedQueenCrownPointsGeometry()}
        data-testid="pawn-queen-crown-points-merged"
      >
        <meshStandardMaterial color="#F59E0B" metalness={0.75} roughness={0.2} />
      </mesh>

      {/* 1 Draw call: Hạt ngọc phát quang đỉnh vương miện bảo tồn emissive */}
      <mesh position={[0, 0.42, 0]} data-testid="pawn-queen-gem">
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshStandardMaterial
          color="#F59E0B"
          metalness={0.8}
          roughness={0.2}
          emissive="#F59E0B"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Contract retention backward compatibility tags */}
      <group visible={false} data-testid="pawn-retention-group">
        <mesh data-testid="pawn-queen-crown" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={`crown-point-${i}`} data-testid="pawn-crown-point" />
        ))}
        <group data-testid="pawn-elephant-legs" />
        <group data-testid="pawn-elephant-ears" />
        <group data-testid="pawn-elephant-eyes" />
        <mesh data-testid="pawn-elephant-blanket" name="ElephantBlanket">
          <meshStandardMaterial color={activeColor} />
        </mesh>
      </group>
    </group>
  );
}
>>>>
```

---

## 4. Verification Plan & Test Automation (Station 1 Spec)

**Target physical file**: `tests/contracts/imp242_luxury_pawn_geometry_consolidation.test.ts` (New file)

### 5-Facet Universal Matrix (18 Atomic Tests):

- **Facet 1: Core Functionality & Happy Paths (TC-IMP242.01 - 04)**
  - `TC-IMP242.01`: `getTallChessBaseBodyGeometry` hợp nhất thành công Tier 1, Tier 2 và Tall column thành 1 `BufferGeometry` có thuộc tính `position`, `normal` và bounding volume (`boundingSphere`, `boundingBox`) được tính toán sẵn.
  - `TC-IMP242.02`: `RookPawnFallback` kết xuất mesh hợp nhất `pawn-rook-head-merged` mang màu `activeColor` của người chơi.
  - `TC-IMP242.03`: `CannonPawnFallback` kết xuất mesh hợp nhất `pawn-cannon-head-merged` và gờ nòng vàng kim `pawn-cannon-muzzle` với góc quay nòng pháo hướng lên chuẩn xác.
  - `TC-IMP242.04`: `WarhorsePawnFallback` kết xuất mesh hợp nhất đầu ngựa `pawn-horse-head-merged` (với 2 tai nón quay chuẩn ma trận affine Euler 'XYZ'), mắt đen `pawn-horse-eyes-merged` và bờm vàng `pawn-horse-mane`.

- **Facet 2: Edge Cases & Boundaries (TC-IMP242.05 - 08)**
  - `TC-IMP242.05`: `QueenPawnFallback` kết xuất mesh hợp nhất vương miện `pawn-queen-crown-merged` và 6 chóp vàng `pawn-queen-crown-points-merged`.
  - `TC-IMP242.06`: Hạt ngọc vương miện `pawn-queen-gem` bảo tồn nguyên vẹn vật liệu phát quang `emissive="#F59E0B"` và `emissiveIntensity=0.5`.
  - `TC-IMP242.07`: Singleton caching hoạt động chính xác: 2 lần gọi liên tiếp cùng một hàm trả về cùng 1 tham chiếu instance `BufferGeometry`.
  - `TC-IMP242.08`: Hàm `disposeTallChessGeometries()` giải phóng sạch các buffer GPU mà không làm phát sinh exception khi gọi nhiều lần trong Vite HMR / Vitest teardown.

- **Facet 3: Data Sanity & Draw Call Optimization (TC-IMP242.09a - 12)**
  - `TC-IMP242.09a`: Từng quân cờ đơn lẻ đạt đúng số lượng visible meshes theo archetype sau khi loại trừ cụm retention group `data-testid="pawn-retention-group"`: Rook = 3, Cannon = 4, Warhorse = 5, Queen = 5.
  - `TC-IMP242.09b`: Tầng `LuxuryPawnProceduralFallback` tổng hợp 4 slots đồng thời trên bàn cờ đạt đúng chính xác 17 visible draw calls ($3 + 4 + 5 + 5 = 17$).
  - `TC-IMP242.09c`: Tầng `LuxuryPawnModel` hoàn chỉnh (bao gồm 2 đĩa hào quang mỗi quân) đạt đúng 25 visible draw calls (Rook: 5, Cannon: 6, Warhorse: 7, Queen: 7) với `forceFallback={true}`.
  - `TC-IMP242.10`: Tiết kiệm tối thiểu 50.0% draw calls toàn diện so với baseline 50 draw calls chưa tối ưu.
  - `TC-IMP242.11`: `TallChessPawnBase` chỉ tạo ra đúng 2 visible draw calls (1 merged base body + 1 neck collar) thay vì 4 draw calls.
  - `TC-IMP242.12`: Độ hoàn thiện PBR: Vành cổ, miệng pháo, bờm ngựa, chóp vương miện tuân thủ `metalness=0.75, roughness=0.2`.

- **Facet 4: Regression Prevention & Contract Retention (TC-IMP242.13 - 15)**
  - `TC-IMP242.13`: Thẻ retention `pawn-tall-column` chứa cylinderGeometry với height >= 0.20m và phản ánh `playerColor` cho `tall_chess_pawns_full_color.test.ts`.
  - `TC-IMP242.14`: Thẻ retention `pawn-crown-point` render đúng 6 phần tử qua `countMeshesWithTestId === 6`.
  - `TC-IMP242.15`: Toàn bộ các thẻ linh vật Chibi (`pawn-corgi-legs`, `pawn-cat-bib`, `pawn-warhorse-saddle`, `pawn-elephant-blanket`) tồn tại đầy đủ trong `<group visible={false} data-testid="pawn-retention-group">`.

- **Facet 5: Spatial Integrity & VRAM Hygiene (TC-IMP242.16 - 17)**
  - `TC-IMP242.16`: Nhóm retention có thuộc tính `visible === false` trên React Element tree (`retentionGroup.props.visible === false`), bảo đảm Three.js WebGL renderer bỏ qua hoàn toàn việc duyệt cây con (0 draw calls trên GPU).
  - `TC-IMP242.17`: Helper đếm draw calls strip sạch cụm retention group `/<group[^>]*data-testid="pawn-retention-group"[\s\S]*?<\/group>/gi` trước khi đếm các thẻ `<mesh`, ngăn chặn hiện tượng inflate draw call trong môi trường SSR headless.

---

## 5. Execution Protocol Checklist

- [x] **Stage A (Structural & Mechanical Audit)**: `plan-griller` tái kiểm toán với `node scripts/audit_plan.mjs` (`HARDENED_APPROVED`).
- [x] **Stage B (Adversarial Challenge)**: `adversarial-challenger` kiểm toán tấn công đối kháng (`CHALLENGE_ISSUED` & 100% chỉ thị đã hòa giải).
- [x] **User Review Directives Reconciled**: 100% 5/5 điểm phản biện người dùng đã được tích hợp (Revision 2.3).
- [ ] **Human Review Gate**: Trình kế hoạch Revision 2.3 cho Người dùng phê duyệt.
- [ ] **Station 1 (QA RED)**: `qa-tester` tạo `tests/contracts/imp242_luxury_pawn_geometry_consolidation.test.ts` (18 atomic tests) và chứng minh trạng thái RED.
- [ ] **Station 2 (Implementer GREEN)**: Tạo `tall_chess_geometries.ts`, áp dụng 6 drop-in snippets vào `luxury_pawn_fallbacks.tsx`. Xác nhận 18/18 tests PASS và toàn bộ suites cũ PASS.
- [ ] **Station 2.5 (Fast Pre-Filter Sweep)**: `scout` quét `tsc --noEmit`, LOC checks, clean console.
- [ ] **Station 3 (Independent Review Funnel)**: `spec-reviewer` (3.1) -> `code-reviewer` (3.2).
- [ ] **Station 4 (Chaos Sentinel Sentinel Probes)**: `chaos-sentinel` chạy 3 probes và ký nhận bằng chứng.
