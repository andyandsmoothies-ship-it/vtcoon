# BÁO CÁO HOÀN THÀNH CẢI TIẾN: IMP-246
# TALL CHESS GLTF ASSET PIPELINE MODERNIZATION
# (Hiện đại hóa Pipeline nạp mô hình GLTF cho 4 Quân cờ Cao)

> **Mã Ticket**: `IMP-246`  
> **Tiêu đề**: Tall Chess GLTF Asset Pipeline Modernization  
> **Phân loại**: Tier 2 (Full Rigor — 3D Asset Pipeline, WebGL R3F GLTF Material Injection & VRAM Lifecycle)  
> **Ngày hoàn thành**: 2026-10-02  
> **Trạng thái**: ✅ **HOÀN THÀNH TOÀN DIỆN (100% GATES APPROVED)**  
> **Tài liệu Kế hoạch**: [`PLAN_IMP_246_TALL_CHESS_GLTF_PIPELINE.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/plans/PLAN_IMP_246_TALL_CHESS_GLTF_PIPELINE.md) (Revision 5)  
> **Tài liệu SSOT**: [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) (Pillars I, II, III, IV), [`docs/domain/design.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/design.md)  

---

## 1. TỔNG QUAN & BỐI CẢNH CẢI TIẾN

Từ phân tích kiểm toán cơ học Asset Pipeline (Pillar 3) của hệ thống:
1. **Nợ kỹ thuật Dead Code & forceFallback**: Thành phần `luxury_pawn_models.tsx` trước đây bị khóa cứng với cờ `forceFallback={true}` bọc trong `SafeGLTFModel`. Mặc dù các tệp mô hình 3D thực tế (`/models/pawns/pawn_rook.glb`, `pawn_cannon.glb`, `pawn_horse.glb`, `pawn_queen.glb`) tồn tại trong `public/models/pawns`, chúng không bao giờ được đưa vào render pipeline thực tế của trò chơi, dẫn đến việc người chơi luôn phải nhìn thấy các khối hình thủ tục procedural mesh.
2. **Nguy cơ rò rỉ VRAM (GPU Memory Leaks)**: Khi nạp mô hình 3D phức tạp với nhiều instance cùng lúc, việc mutate hoặc khởi tạo vật liệu Material không đúng cách trong render loop dễ gây rò rỉ bộ nhớ VRAM nghiêm trọng.
3. **Mục tiêu đạt được**:
   - Gỡ bỏ hoàn toàn `SafeGLTFModel` và cờ `forceFallback={true}`.
   - Nạp mô hình GLTF chuẩn qua `useGLTF` và `@react-three/drei` `<Clone>` với cơ chế inject vật liệu động (`PBR MeshStandardMaterial`).
   - Phân tách 2 nhóm vật liệu độc lập: Thân cờ phản ánh màu người chơi (`playerColor`) kèm `needsUpdate = true`, và Vành viền Trim mạ vàng kim `#F59E0B` (`roughness: 0.1, metalness: 0.9`).
   - Bảo toàn vòng đời giải phóng tài nguyên WebGL: Gọi `.dispose()` dọn dẹp sạch sẽ khi component unmount.
   - Bảo tồn 100% hợp đồng Call-Site: Giữ nguyên `LuxuryPawnModel`, `PawnAuraPedestal`, và `EnamelRing`.

---

## 2. KẾT QUẢ THI CÔNG CHI TIẾT

### 2.1. Tái cấu trúc Subtractive & Chuẩn Hóa Rules of Hooks trong `luxury_pawn_models.tsx`
- [`src/client/3d/luxury_pawn_models.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/luxury_pawn_models.tsx) (270 LOC, an toàn dưới trần Tier 2 <= 500 LOC):
  - **Imports**: Loại bỏ hoàn toàn `SafeGLTFModel`. Bổ sung `Suspense, useMemo, useEffect` từ `'react'`, `useGLTF, Clone` từ `'@react-three/drei'`, và `Mesh, MeshStandardMaterial, Group` từ `'three'`.
  - **Tuân thủ Tuyệt đối React Rules of Hooks**:
    + Triệt tiêu hoàn toàn anti-pattern bọc `useGLTF` trong `try/catch` (vốn làm vỡ cơ chế ném Promise của Suspense và phá vỡ hook call order).
    + Loại bỏ hoàn toàn các hàm shim giả lập `safeUseMemo` và `safeUseEffect`.
    + Component `DynamicGLTFPawn` gọi `const gltf = useGLTF(modelUrl)` tại top level tự nhiên.
    + Mô hình được bọc tự nhiên trong chuẩn React `<Suspense fallback={<LuxuryPawnProceduralFallback ... />}>`.
  - **Khởi tạo Vật liệu Chuẩn xác Ngay từ Mount**:
    + `bodyMaterial`: Khởi tạo qua `useMemo` với dependency `[playerColor]`, bảo đảm `bodyMaterial.color` phản ánh chính xác màu người chơi ngay tại first render (kể cả trong môi trường SSR/Static Markup). Đồng thời đồng bộ màu sắc và gán `needsUpdate = true` qua `useEffect([playerColor, bodyMaterial])` khi prop thay đổi giữa các renders.
    + `trimMaterial`: Khởi tạo qua `useMemo` với empty dependency `[]` (`color: '#F59E0B', roughness: 0.1, metalness: 0.9`).
  - **Thu hồi Tài nguyên GPU / VRAM**: Gọi `bodyMaterial.dispose()` và `trimMaterial.dispose()` trong `useEffect` unmount cleanup.
  - **Nhận diện Vành Trim Đa Tầng Từ Dữ liệu Đĩa Vật lý (`isTrimNode`)**:
    + Khảo sát thực tế các tệp `.glb` trong `public/models/pawns/` cho thấy các node con của mô hình Blender xuất khẩu không có `node.name` cụ thể (undefined), nhưng vật liệu đính kèm mang tên như `Mat_DarkBrass`, `Mat_ChromeCar`, v.v.
    + Hàm `isTrimNode(node: Mesh)` được thiết kế đa tầng vững chắc:
      ```typescript
      function isTrimNode(node: Mesh): boolean {
        if (node.name.includes('Trim') || Boolean(node.userData?.isTrim)) return true;
        const matName = Array.isArray(node.material) ? node.material[0]?.name : node.material?.name;
        if (matName && /trim|gold|accent|darkbrass/i.test(matName)) return true;
        return false;
      }
      ```
  - **Tương thích Ngược An toàn (Zero Dead Parameters)**:
    + Cờ `forceFallback?: boolean` được đánh dấu `@deprecated` nhưng được xử lý tường minh: nếu caller truyền `forceFallback === true`, component sẽ nạp `LuxuryPawnProceduralFallback` thay vì GLTF, tránh làm thay đổi ngữ nghĩa âm thầm của các call-site cũ.
  - **Preload Assets an toàn**: `useGLTF.preload` được bảo vệ bằng `'window' in globalThis` guard chống lỗi fetch SSR.

### 2.2. Nâng cấp Bộ Hợp đồng Kiểm thử `tall_chess_pawns_full_color.test.ts`
- [`tests/client/tall_chess_pawns_full_color.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/tall_chess_pawns_full_color.test.ts) (583 LOC, an toàn dưới trần <= 600 LOC):
  - **Trích xuất Component Hook An toàn trong React SSR (`renderDynamicComponentToClone`)**:
    + Không gọi component chứa hook như một hàm thông thường ngoài React.
    + Trích xuất `<Clone>` thông qua `renderToStaticMarkup(React.createElement(Wrapper))` để kích hoạt React Dispatcher hợp lệ, thu được cây phần tử Three.js thật mà không gây ra lỗi `Invalid hook call`.
  - Triệt tiêu hoàn toàn các change detectors cũ kiểm tra `forceFallback={true}` và `SafeGLTFModel`.
  - Bổ sung Facet 5 với 17 atomic contract tests đạt chuẩn Detroit Classical TDD:
    + `[TC-AP01.01..TC-AP01.04/MSS][UC-IMP246]`: Dynamic `playerColor` reactivity cho 4 màu văn hóa (Ruby Red, Emerald Green, Amber Orange, Ocean Cyan).
    + `[TC-AP02.01/MSS][UC-IMP246]`: Phân tách vật liệu Trim vàng kim `#F59E0B`.
    + `[TC-AP02.02/MSS][UC-IMP246]`: Non-Mesh filtering trong `inject`.
    + `[TC-AP02.03/MSS][UC-IMP246]`: Default color fallback khi `playerColor` omitted.
    + `[TC-AP03.01..TC-AP03.04/MSS][UC-IMP246]`: Slot model mapping cho cả 4 archetype [0, 1, 2, 3].
    + `[TC-AP04.01/MSS][UC-IMP246]`: Preserves Shadow (`castShadow` và `receiveShadow`).
    + `[TC-AP04.02/MSS][UC-IMP246]`: Zero SafeGLTFModel / Zero forceFallback verification.
    + `[TC-AP05.01..TC-AP05.04/MSS][UC-IMP246]`: Helper Adversarial Gate, PBR Material Parameters, và Material Disposal lifecycle.

---

## 3. BẢNG ĐỐI CHIẾU TIÊU CHÍ NGHIỆM THU & NGÂN SÁCH LOC

### 3.1. Bảng Cân đối Ngân sách Dòng Mã (LOC Reconciliation Table)

| Tệp Vật lý | Phân loại Tier | Baseline Ban đầu | Dòng Thêm (+) | Dòng Xóa (-) | LOC Thực tế Hiện tại | Ngưỡng Trần (Ceiling) | Trạng thái |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `src/client/3d/luxury_pawn_models.tsx` | Tier 2 (UI/3D/Views) | 177 | +134 | -41 | **270** | <= 500 LOC | ✅ An toàn (Dư 230 LOC) |
| `tests/client/tall_chess_pawns_full_color.test.ts` | Living Contract Test Suite | 425 | +231 | -73 | **583** | <= 600 LOC | ✅ Đạt chuẩn (Dư 17 LOC) |

### 3.2. Bảng Đối chiếu Tiêu chí Nghiệm thu (Acceptance Matrix)

| Tiêu chí Kiểm định | Công cụ / Thẩm quyền | Ngưỡng Yêu cầu | Kết quả Thực tế | Phán quyết |
| :--- | :--- | :---: | :---: | :---: |
| **Plan Grilling Audit** | `plan-griller` | Hardened Approval (P1-P5) | `HARDENED_APPROVED` (Rev 5) | ✅ APPROVED |
| **Adversarial Inversion (Station 1)** | `qa-tester` | 100% Business RED trước khi code | 15 RED tests confirmed | ✅ APPROVED |
| **Implementation (Station 2)** | `implementer` | 100% GREEN, zero dirty casts | 66/66 tests PASS, 0 `as any` | ✅ APPROVED |
| **Pre-Filter Sweeper (Station 2.5)** | `scout` (flash) | 0 type errors, LOC <= 500 | `tsc --noEmit` 0 errors, 270 LOC | ✅ APPROVED |
| **Visual Evidence Gate (Phase 3.0)** | `capture_visual_evidence.mjs` | Physical capture in `.agents/tmp/` | `imp-246_full_board.jpg` | ✅ APPROVED |
| **Spec & Scope Gate (Phase 3.1)** | `spec-reviewer` | 100% spec fidelity, 0 drift | 5/5 SSOT items PASS | ✅ APPROVED |
| **Deep Architecture (Phase 3.2)** | `code-reviewer` | Anti-slop, zero VRAM leak, Rules of Hooks | 0 flags, clean `.dispose()`, 0 try/catch hook | ✅ APPROVED |
| **3D Art Direction (Phase 3.2)** | `game-3d-visual-critic` | Benchmark Monopoly Tycoon >= 7.0 | **8.6 / 10 (Wow-Factor)** | ✅ APPROVED |
| **System Invariant Parity (Probe 1)** | `chaos-sentinel` | Size(Edge) === Size(Core) | 24/24 Intent parity, 0 gaps | ✅ APPROVED |
| **System Wire Boundary (Probe 2)** | `chaos-sentinel` | Dynamic port 0 TCP WebSocket | Live wire port 64277, survived drop | ✅ APPROVED |
| **Mutation Sensitivity (Probe 3)** | `chaos-sentinel` | 0 mutants survived (>= 5 mutants) | 10/10 mutants killed (0 survived) | ✅ APPROVED |
| **Evidence Check Gate** | `check_evidence.mjs` | Physical evidence JSON validated | Exit code 0, 100% verified | ✅ APPROVED |

*Ghi chú về Station 4 Sentinel Probes*: Bộ công cụ `scripts/station4_sentinel.ts` thực thi 3 probes đồng bộ: Probe 1 & 2 đóng vai trò kiểm chứng bất biến hệ thống toàn cục (system invariant regression guard), và Probe 3 là đầu đạn đột biến mục tiêu (Targeted Mutation Sensitivity) trực tiếp tấn công logic của `luxury_pawn_models.tsx` (kiểm tra `slotIndex === 0`, `isTrimNode`, `modelUrl` mapping), tiêu diệt 10/10 mutants.

---

## 4. BẰNG CHỨNG HÌNH ẢNH & THẨM MỸ 3D

- **Ảnh chụp vật lý hiện trường**: `.agents/tmp/imp-246_full_board.jpg`
- **Nhận xét Giám đốc Nghệ thuật 3D (`game-3d-visual-critic`)**:
  > *"Quân Xe Chiến Hoàng Gia màu đỏ Ruby tại ô Khởi Hành hiển thị rõ ràng, đổ bóng chuẩn xác, hòa nhập hoàn hảo vào sa bàn. Tỷ lệ Tall Chess thon cao, thanh thoát, đứng sừng sững trên ô Khởi Hành nhưng tỷ lệ chân đế và chiều cao được kiềm chế tinh tế, không hề che lấp chữ 'KHỞI HÀNH'. Chất liệu PBR Toy Lacquer với roughness: 0.15, metalness: 0.2 tạo độ bóng men gốm/sơn mài sang trọng, viền kim loại Trim mạ vàng kim sắc nét. Đĩa hào quang và vòng men ôm khít chân cờ, triệt tiêu hoàn toàn cảm giác bay lơ lửng."*  
  > **Điểm tổng quan**: **8.6 / 10** — Phê duyệt xuất xưởng (**DISPOSITION: SHIP**).

---

## 5. SỔ NỢ KỸ THUẬT & KẾT LUẬN

### 5.1. Sổ Nợ Kỹ Thuật (Tech Debt Ledger)
- **Mã Nợ**: `DEBT-IMP246-01`
- **Nội dung**: Thuộc tính `forceFallback?: boolean` trên `LuxuryPawnModelProps` được giữ lại và đánh dấu `@deprecated` để duy trì tính tương thích ngược cho call-sites cũ (với xử lý redirect an toàn sang `LuxuryPawnProceduralFallback`). Cần dọn sạch prop này tại tất cả các call-sites và gỡ bỏ hoàn toàn interface trong đợt refactor UI kế tiếp.
- **Slice Nhận**: `3D Clean-up Sprint`.
- **Trạng thái**: ⏳ **ĐÃ GHI NHẬN VÀO `docs/epics/client_ui/_epic_ledger.md`**.

### 5.2. Kết luận
Ticket **IMP-246** đã được tái cấu trúc và làm cứng toàn diện:
1. Tuân thủ 100% React Rules of Hooks (không try/catch quanh useGLTF, không safeUseMemo/safeUseEffect).
2. Tích hợp React `<Suspense>` chuẩn hóa cho quá trình nạp tài nguyên WebGL.
3. Giải quyết dứt điểm nhận diện Trim từ đặc điểm tệp vật lý `.glb` thực tế.
4. Đạt 100% các tiêu chuẩn về LOC (270 LOC <= 500 LOC, 583 LOC <= 600 LOC), linter, typecheck, và tiêu diệt 10/10 mutants tại Station 4 Sentinel.
5. Sẵn sàng tích hợp vào nhánh chính.

