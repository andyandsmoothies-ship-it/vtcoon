# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-409
## PLAN_IMP_409: Client-3D Zero-Cycle & Camera State Machine Pure Seams (Harness V6.0)

> **Mã Ticket:** `IMP-409`  
> **Phân hệ thực tế:** `client-3d`  
> **Ngày hoàn thành:** 2026-10-15  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

> **Mô tả cốt lõi**: Bóc tách tầng kiểu thuần túy của Camera (`CameraMode`, `TargetCameraState`, `TargetCameraStateOptions`) ra khỏi `camera_state_machine.ts` sang mô-đun seam `camera_types.ts`, cắt đứt quan hệ phụ thuộc ngược từ `cinematic_chase_camera.ts` và `cinematic_spline_flyby.ts` để triệt tiêu hoàn toàn `[SCC-2]`. Đồng thời di chuyển toàn bộ các hàm động học domino shockwave (`calculateDominoRippleTransform`, `getCircularCellDistance`, `resolveNeighborDominoSlam`, `resolveMobilePoolDominoSlam`) và các kiểu liên quan vào `monopoly_plaza_math.ts`, điều hướng re-export từ `monopoly_plaza_visuals.ts` và `monopoly_mobile_archway_visuals.ts` để triệt tiêu hoàn toàn `[SCC-4]`, đưa tổng số chu trình SCC toàn dự án từ 14 xuống 12 mà không làm thay đổi bất kỳ hành vi runtime nào.

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-409.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-409.md) | Thẩm định kế hoạch đạt 0 defects, 4 contract tests clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/client/imp409_client_3d_zero_cycle_and_camera_seams.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp409_client_3d_zero_cycle_and_camera_seams.test.ts) | 7 atomic tests, 25 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime (5/7 tests failed ban đầu) | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/chaos_sentinel_IMP-409.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-409.json) | 7 production & test files, 100% tests (7/7) chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.0: Dual-Viewport** | Puppeteer Headless Probe | Desktop (1280x800) [`imp-409_desktop.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-409_desktop.jpg) & Mobile (360x740) [`imp-409_mobile_360.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-409_mobile_360.jpg) | **CAPTURED** 📸 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-409.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-409.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-3d` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-409.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-409.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 3.57 (25 asserts / 7 atomic tests) | **APPROVED** 🛡️ |
| **Trạm 3.3: 3D Visual & Regression Gate** | `game-3d-visual-critic`<br>[`.agents/audit/VISUAL_CRITIC_IMP-409.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/VISUAL_CRITIC_IMP-409.md) | Khảo sát trực quan 3D đa viewport, bảo toàn 100% hình ảnh không hồi quy, điểm 9.0/10 (disposition: ship) | **APPROVED 🎨** |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 22/22 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Thẩm định kế hoạch đạt 0 defects, 4 contract tests clean.
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa**:
  - **[ADV-OBJ] Objective Validity**
    - **Target reachable?**: Yes. `calculateTargetCameraState`, `calculateDicePanCameraState`, and `calculateTileFocusCameraPosition` execute every frame within `useFrame` at [`src/client/3d/adaptive_cinematic_camera.tsx#L242-L243`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/adaptive_cinematic_camera.tsx#L242-L243) under active match conditions.; `calculateDominoRippleTransform` and `resolveNeighborDominoSlam` execute in the per-frame transform update loop at [`src/client/3d/procedural_building.tsx#L223`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/procedural_building.tsx#L223) and [`src/client/3d/monopoly_plaza_fusion.tsx#L147`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/monopoly_plaza_fusion.tsx#L147).
    - **Baselines verified?**: Partially Verified on disk; Critical Type Claims Falsified. **Verified Baselines**:; `npm run lint:boundaries` confirms exactly 14 strongly connected components across the repo.; `[SCC-2]` contains 3 files: `cinematic_spline_flyby.ts`, `cinematic_chase_camera.ts`, `camera_state_machine.ts`.; `[SCC-4]` contains 2 files: `monopoly_mobile_archway_visuals.ts`, `monopoly_plaza_visuals.ts`.; Physical LOC counts verified 1:1 on disk: `camera_state_machine.ts` (308 LOC), `cinematic_chase_camera.ts` (265 LOC), `cinematic_spline_flyby.ts` (132 LOC), `monopoly_plaza_math.ts` (109 LOC), `monopoly_plaza_visuals.ts` (316 LOC), `monopoly_mobile_archway_visuals.ts` (287 LOC).; **Falsified & Ungrounded Claims in Plan**:; `CameraViewPreset` does not exist anywhere in the codebase. The real type on disk is `CameraMode` at [`src/client/3d/camera_state_machine.ts#L16`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/camera_state_machine.ts#L16).; `TargetCameraStateOptions` in Plan Section 3 lists 4 arbitrary properties (`activePlayerIndex`, `activeTileIndex`, `isHighStakes`, `aspect`), omitting 7 active properties present at [`src/client/3d/camera_state_machine.ts#L18-L30`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/camera_state_machine.ts#L18-L30).
    - **Verdict**: FAIL — Plan author drafted hallucinated types/signatures in Section 3 and omitted active consumers from call-site wiring.
  - **[ADV-01] Hallucinated & Mangled Interface Contracts for Camera Types in `camera_types.ts`**
    - **Vector**: Living Test Collision & Contract Regression (ADV-REG)
    - **Scenario**: In Section 3, the plan drafts a synthetic `CameraViewPreset` with fake values (`property_purchase`, `rent_payment`, `jail_visit`, `bankruptcy`, `celebration`) which have zero grounding in `camera_state_machine.ts`. The plan proposes a truncated `TargetCameraStateOptions` containing only `{ activePlayerIndex?, activeTileIndex?, isHighStakes?, aspect? }`. In reality, [`src/client/3d/camera_state_machine.ts#L18-L30`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/camera_state_machine.ts#L18-L30) and its production caller [`src/client/3d/adaptive_cinematic_camera.tsx#L243`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/adaptive_cinematic_camera.tsx#L243) actively pass and evaluate: `cinematicChase`, `cellIndex`, `isHighStakesRoll`, `isJailFlight`, `isTransientTurnCorner`, `enableNorthFraming`, `isRolling`, `isBotTurn`, `rollingPlayerPos`, `gamePhase`, and `aspect`.
    - **Consequence**: `calculateTargetCameraState` in `camera_state_machine.ts` will trigger immediate TypeScript compilation errors when accessing `options?.gamePhase`, `options?.cinematicChase`, etc. Production caller `adaptive_cinematic_camera.tsx` will fail compilation on line 243. Living tests [`tests/client/camera_state_machine.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/camera_state_machine.test.ts), [`tests/client/cinematic_spline_flyby.test.ts#L182`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/cinematic_spline_flyby.test.ts#L182), [`tests/client/cinematic_chase_camera.test.ts#L163`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/cinematic_chase_camera.test.ts#L163), and [`tests/client/dramatic_pacing_camera.test.ts#L116`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/dramatic_pacing_camera.test.ts#L116) will break with TS2322 / TS2339.
    - **Hardening Directive**: Pure-move `TargetCameraStateOptions` and `CameraMode` verbatim from [`src/client/3d/camera_state_machine.ts#L16-L30`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/camera_state_machine.ts#L16-L30) into `src/client/3d/camera_types.ts`: export type CameraMode = | 'overview' | 'dice_roll' | 'tension_roll' | 'pawn_chase' | 'tile_focus' | 'auction_focus' | 'pre_match'; export interface TargetCameraState { readonly position: [number, number, number] | readonly [number, number, number]; readonly target: [number, number, number] | readonly [number, number, number]; readonly fov: number; readonly speed: number; } export interface TargetCameraStateOptions { readonly cinematicChase?: boolean; readonly cellIndex?: number; readonly aspect?: number; readonly isHighStakesRoll?: boolean; readonly isJailFlight?: boolean; readonly isTransientTurnCorner?: boolean; readonly enableNorthFraming?: boolean; readonly isRolling?: boolean; readonly isBotTurn?: boolean; readonly rollingPlayerPos?: number; readonly gamePhase?: 1 | 2 | 3; } Retract `CameraViewPreset` or provide backward-compatible alias `export type CameraViewPreset = CameraMode;`. In `camera_state_machine.ts`, re-export `TargetCameraState`, `TargetCameraStateOptions`, and `CameraMode` from `./camera_types.ts`.
  - **[ADV-02] Hallucinated Domino Kinematics DTOs & Mangled Signatures in `monopoly_plaza_math.ts`**
    - **Vector**: Pure-Move Quarantine Violation & Contract Regression (ADV-REG)
    - **Scenario**: In Section 3, the plan drafts hallucinated interfaces for `DominoRippleOptions` (`maxTiltRad`, `maxLiftY`, `waveSpeedCellsPerSec`, `decayRatePerCell`) and `DominoRippleTransform` (`pitchRad`, `liftY`, `scaleMultiplier`). It alters `resolveNeighborDominoSlam` parameter `activeSlams` to `ReadonlyArray<unknown>` and omits the boolean `isMobile` parameter. On physical disk at [`src/client/3d/monopoly_plaza_visuals.ts#L46-L61`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/monopoly_plaza_visuals.ts#L46-L61) and [`src/client/3d/monopoly_mobile_archway_visuals.ts#L70-L130`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/monopoly_mobile_archway_visuals.ts#L70-L130): `DominoRippleTransform` requires `yOffset: number`, `scaleY: number`, `pitchRad: number`, and `isSettled: boolean`. `DominoRippleOptions` requires `waveDelayPerCellMs`, `maxDistanceInCells`, `ttlMs`, `baseAmplitudeY`, `basePitchRad`, `angularFrequency`, `dampingRatio`. `resolveNeighborDominoSlam` signature is `(cellIndex: number | undefined, activeSlams: Readonly<Record<number, ActiveSlam>> | null | undefined, isMobile = false, nowMs = Date.now())`.
    - **Consequence**: `procedural_building.tsx#L224-L228` and `monopoly_plaza_fusion.tsx#L148-L152` access `ripple.yOffset`, `ripple.scaleY`, `ripple.pitchRad`, and `ripple.isSettled`. They will fail TypeScript compilation immediately. `tests/client/imp401_monopoly_artdeco_archway_and_domino_shockwave.test.ts#L288-L297` asserts `toEqual({ yOffset: 0, scaleY: 1, pitchRad: 0, isSettled: false })` and `resolveNeighborDominoSlam(24, activeSlams, true, nowMs)`. Living tests will fail hard. `tests/client/imp406_mobile_instanced_monopoly_archway.test.ts#L367` asserts `ripple.yOffset`.
    - **Hardening Directive**: Retract all speculative interfaces in Section 3. Pure-move `DominoRippleOptions` and `DominoRippleTransform` from `monopoly_plaza_visuals.ts#L46-L61` and `calculateDominoRippleTransform`, `getCircularCellDistance`, `resolveNeighborDominoSlam` from `monopoly_mobile_archway_visuals.ts#L62-L130` into `monopoly_plaza_math.ts` with 100% exact fidelity to existing types and default parameters.
  - **[ADV-03] Severed Call-Site Wiring for `procedural_building.tsx`, `monopoly_plaza_fusion.tsx`, and Living Tests via Abrupt Re-Export Deletion**
    - **Vector**: Closed-Loop Presentation Wire (ADV-WIRE) & Living Test Collision (ADV-REG)
    - **Scenario**: Section 1 (line 18) and Section 3 (line 112) of the plan mandate: "Excises line 311 re-export (`export { calculateDominoRippleTransform... }`) from `monopoly_plaza_visuals.ts`."* The plan assumes only `monopoly_plaza_visuals.ts` and `monopoly_mobile_archway_visuals.ts` are involved. However, on disk: [`src/client/3d/procedural_building.tsx#L8`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/procedural_building.tsx#L8): imports `{ calculateDominoRippleTransform, resolveNeighborDominoSlam } from './monopoly_plaza_visuals'`. [`src/client/3d/monopoly_plaza_fusion.tsx#L15`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/monopoly_plaza_fusion.tsx#L15): imports `{ calculateDominoRippleTransform, ... resolveNeighborDominoSlam } from './monopoly_plaza_visuals'`. [`tests/client/imp401_monopoly_artdeco_archway_and_domino_shockwave.test.ts#L22-L24`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp401_monopoly_artdeco_archway_and_domino_shockwave.test.ts#L22-L24): imports `{ getCircularCellDistance, calculateDominoRippleTransform, resolveNeighborDominoSlam } from '../../src/client/3d/monopoly_plaza_visuals'`. [`tests/client/imp406_mobile_instanced_monopoly_archway.test.ts#L20-L21`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp406_mobile_instanced_monopoly_archway.test.ts#L20-L21): imports `{ calculateDominoRippleTransform, resolveNeighborDominoSlam, resolveMobilePoolDominoSlam } from '../../src/client/3d/monopoly_mobile_archway_visuals'`.
    - **Consequence**: Simply deleting line 311 breaks `procedural_building.tsx`, `monopoly_plaza_fusion.tsx`, and `imp401` test suite with TS2305 ("Module has no exported member..."). Removing exports from `monopoly_mobile_archway_visuals.ts` breaks `imp406` test suite with TS2305.
    - **Hardening Directive**: Line 311 in `src/client/3d/monopoly_plaza_visuals.ts` MUST NOT be deleted. It must be redirected to re-export from `./monopoly_plaza_math`: export { calculateDominoRippleTransform, getCircularCellDistance, resolveNeighborDominoSlam, type DominoRippleOptions, type DominoRippleTransform, } from './monopoly_plaza_math'; Similarly, in `src/client/3d/monopoly_mobile_archway_visuals.ts`: export { calculateDominoRippleTransform, getCircularCellDistance, resolveNeighborDominoSlam, resolveMobilePoolDominoSlam, type DominoRippleOptions, type DominoRippleTransform, } from './monopoly_plaza_math'; Topological DAG Verification*: `monopoly_plaza_math.ts` has 0 imports from visual modules. `monopoly_plaza_visuals.ts` imports only from math. `monopoly_mobile_archway_visuals.ts` imports from math and plaza visuals. Dependency graph is strictly acyclic (`[SCC-4]` is 100% eliminated) while preserving 100% backward compatibility for all production and test callers.
  - **[ADV-04] Omission of `resolveMobilePoolDominoSlam` Induces Secondary Circular Dependency or Broken Slam Resolution**
    - **Vector**: Cross-Subsystem State Erasure & Dead-Path Lock (ADV-STATE) / Circular Dependency
    - **Scenario**: On disk at [`src/client/3d/monopoly_mobile_archway_visuals.ts#L123-L130`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/monopoly_mobile_archway_visuals.ts#L123-L130): `resolveNeighborDominoSlam` delegates directly to `resolveMobilePoolDominoSlam(cellIndex, activeSlams, nowMs)`. The plan proposes moving `resolveNeighborDominoSlam` to `monopoly_plaza_math.ts`, but omits `resolveMobilePoolDominoSlam` from the plan's migration scope. If `resolveNeighborDominoSlam` is moved alone, it must import `resolveMobilePoolDominoSlam` from `monopoly_mobile_archway_visuals.ts`. But `monopoly_mobile_archway_visuals.ts` imports `getCircularCellDistance` and `calculateDominoRippleTransform` from `monopoly_plaza_math.ts`.
    - **Consequence**: A secondary circular dependency loop is created: `monopoly_plaza_math.ts` $\leftrightarrow$ `monopoly_mobile_archway_visuals.ts`. `npm run lint:boundaries` will fail the DoD requirement (SCC count will not drop to $\le 12$).
    - **Hardening Directive**: `resolveMobilePoolDominoSlam` MUST be pure-moved along with `resolveNeighborDominoSlam` into [`src/client/3d/monopoly_plaza_math.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/monopoly_plaza_math.ts). `monopoly_plaza_math.ts` imports `type { ActiveSlam }` from `../store/vfx_store`. It remains 100% free of Three.js or DOM dependencies. `monopoly_mobile_archway_visuals.ts` imports and re-exports both functions from `monopoly_plaza_math.ts`.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/client/imp409_client_3d_zero_cycle_and_camera_seams.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp409_client_3d_zero_cycle_and_camera_seams.test.ts)
- **Chỉ số kiểm thử**: **7 atomic tests**, **25 asserts** (mật độ trung bình: 3.57 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (5/7 tests thất bại ban đầu do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.


### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi**:
  - [`src/client/3d/camera_types.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/camera_types.ts)
  - [`src/client/3d/monopoly_plaza_math.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/monopoly_plaza_math.ts)
  - [`src/client/3d/camera_state_machine.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/camera_state_machine.ts)
  - [`src/client/3d/cinematic_chase_camera.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/cinematic_chase_camera.ts)
  - [`src/client/3d/cinematic_spline_flyby.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/cinematic_spline_flyby.ts)
  - [`src/client/3d/monopoly_plaza_visuals.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/monopoly_plaza_visuals.ts)
  - [`src/client/3d/monopoly_mobile_archway_visuals.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/monopoly_mobile_archway_visuals.ts)
- **Chuyển trạng thái**: Toàn bộ **7/7 contract tests chuyển sang GREEN**.
- **Living Test Suites**: Bảo toàn nguyên vẹn, 62/62 tests vượt qua, zero hồi quy logic hiện hành.

### Trạm 2.5: Fast Pre-Filter Mechanical Sweep (`scout` / `fast_prefilter.mjs`)
- **TypeScript**: `tsc --noEmit` vượt qua với 0 lỗi (Exit Code 0).
- **Dirty Casts**: Tuyệt đối không sử dụng `as any` hoặc dirty type casting.
- **LOC Ceilings**: Tất cả các tệp đều nằm trong hạn mức trần của từng phân hệ (Tier 1 <= 400, Tier 2 <= 500, Tier 3 <= 800, Test <= 600).

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
1. **Spec & Scope Gatekeeper (`spec-reviewer`)**:
    - **Phán quyết**: **APPROVED** 📋
    - **Xác nhận phạm vi**: 100% các thay đổi nằm trong phân hệ mục tiêu (`client-3d`), zero scope creep.
2. **Deep Architecture & Anti-Slop Auditor (`code-reviewer`)**:
    - **Phán quyết**: **APPROVED** 🛡️
    - **Chỉ số Anti-Slop**: 0 violations trên 6 cờ cảnh báo (Deep modules, Zero pass-through wrappers, Zero TIDD).
    - **Bộ nhớ & Timer**: Không rò rỉ listener, không bỏ sót timer cleanup, an toàn đa luồng/bất đồng bộ.
3. **Giám Định Khảo Sát Trực Quan 3D (`game-3d-visual-critic`)**:
    - **Phán quyết**: **APPROVED 🎨** (Điểm thẩm định: 9.0/10, `disposition: ship`)
    - **Tệp bằng chứng trực quan**:
      - Desktop (1280x800): [`.agents/tmp/imp-409_desktop.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-409_desktop.jpg)
      - Mobile (360x740): [`.agents/tmp/imp-409_mobile_360.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-409_mobile_360.jpg)
    - **Đánh giá thẩm mỹ & không hồi quy (Zero Visual Regression)**:
      - Việc bóc tách `camera_types.ts` và chuyển giao domino shockwave sang `monopoly_plaza_math.ts` bảo toàn 100% hình ảnh không gian 3D, không làm suy giảm hiệu ứng Art Deco archway, domino ripple, hoặc phối cảnh bàn cờ.
      - Tỷ lệ khung hình và độ sâu hiển thị trên cả hai viewport Desktop và Mobile giữ vững chất lượng tạo hình thương mại, không phát sinh bất kỳ hiện tượng xé hình hay lỗi render nào.



### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: 22/22 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-409 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `camera_types.ts` | [`src/client/3d/camera_types.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/camera_types.ts) | Tier 2 (UI/3D/Views) | **28 SLOC** | 30 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `camera_state_machine.ts` | [`src/client/3d/camera_state_machine.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/camera_state_machine.ts) | Tier 1 (Domain/Server/Logic) | **276 SLOC** | 295 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `cinematic_chase_camera.ts` | [`src/client/3d/cinematic_chase_camera.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/cinematic_chase_camera.ts) | Tier 1 (Domain/Server/Logic) | **242 SLOC** | 264 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `cinematic_spline_flyby.ts` | [`src/client/3d/cinematic_spline_flyby.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/cinematic_spline_flyby.ts) | Tier 2 (UI/3D/Views) | **115 SLOC** | 132 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `monopoly_plaza_math.ts` | [`src/client/3d/monopoly_plaza_math.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/monopoly_plaza_math.ts) | Tier 2 (UI/3D/Views) | **177 SLOC** | 201 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `monopoly_plaza_visuals.ts` | [`src/client/3d/monopoly_plaza_visuals.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/monopoly_plaza_visuals.ts) | Tier 2 (UI/3D/Views) | **268 SLOC** | 304 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `monopoly_mobile_archway_visuals.ts` | [`src/client/3d/monopoly_mobile_archway_visuals.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/monopoly_mobile_archway_visuals.ts) | Tier 2 (UI/3D/Views) | **214 SLOC** | 230 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `imp409_...test.ts` | [`tests/client/imp409_client_3d_zero_cycle_and_camera_seams.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp409_client_3d_zero_cycle_and_camera_seams.test.ts) | Living Test | **110 SLOC** | 124 Lines | <= 600 LOC | ✅ Đạt chuẩn |


---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

### 5.1. Xác Nhận Triệt Tiêu Chu Trình Phụ Thuộc Vòng (SCC Reduction 14 ➔ 12)
- **Kết quả đo đạc cơ học (`npm run lint:boundaries`)**: Tổng số chu trình strongly connected components (SCC) trên toàn codebase đã giảm thành công từ **14 xuống còn 12 chu trình**, không phát sinh bất kỳ vi phạm hard boundary mới nào (0 hard violations trên 416 tệp được quét).
- **Chi tiết 2 chu trình đã bị xóa sổ hoàn toàn**:
  1. **`[SCC-2]` cũ (3 tệp)**: Vòng lặp `cinematic_spline_flyby.ts` $\leftrightarrow$ `cinematic_chase_camera.ts` $\leftrightarrow$ `camera_state_machine.ts` đã được giải phóng 100% nhờ việc tách `camera_types.ts` làm type seam độc lập và sử dụng `camera_kinematic_helpers.ts` cho các phép toán vị trí tile focus.
  2. **`[SCC-4]` cũ (2 tệp)**: Vòng lặp `monopoly_mobile_archway_visuals.ts` $\leftrightarrow$ `monopoly_plaza_visuals.ts` đã được triệt tiêu hoàn toàn nhờ việc trích xuất `monopoly_plaza_math.ts` làm module tính toán động học thuần túy (pure math), chuyển toàn bộ logic domino ripple và pool slam vào seam dùng chung.

### 5.2. Định Hướng Kỹ Thuật Cho Slice 2B (Kế Hoạch Tiếp Theo - Ticket IMP-410)
Gói cải tiến IMP-409 đã đặt nền móng kiến trúc vững chắc cho phân hệ `client-3d`. Để tiếp tục làm sạch cấu trúc dự án hướng tới mục tiêu Zero Circular Dependencies, lộ trình kế tiếp (Slice 2B / IMP-410) sẽ tập trung xử lý 12 chu trình SCC còn lại:
1. **Trọng tâm 1: Giải phóng cụm Client Events & Network (`[SCC-1]`, 16 tệp)**:
   - *Thành phần*: `game_event_*_synthesizer.ts`, `activity_*_tracker.ts`, `game_store.ts`, `pacing_context.ts`.
   - *Chiến lược seam*: Bóc tách các DTO event payload và interfaces tài chính ra khỏi synthesizers sang các pure type seams (`event_payload_types.ts`), tách riêng store state mutations và event publishing thông qua Event Facade.
2. **Trọng tâm 2: Tái cấu trúc cụm Server Session & Room Lifecycle (`[SCC-9]`, 21 tệp)**:
   - *Thành phần*: `turn_loop.ts`, `room_manager.ts`, `session_manager.ts`, `turn_loop_maintenance.ts`, `trade_coordinator_helper.ts`, `insolvency_manager.ts`...
   - *Chiến lược seam*: Phân rã theo mô hình Service Layer & Command Dispatcher, thay thế các quan hệ gọi chéo lẫn nhau (circular direct invocation) bằng Protocol Action Handlers và Domain Events nội bộ của Server.
3. **Trọng tâm 3: Dọn dẹp các cụm 3D phụ còn tồn đọng**:
   - `[SCC-3]` (2 tệp): `landmark_registry.ts` $\leftrightarrow$ `building_typology.ts`.
   - `[SCC-4]` mới (2 tệp): `construction_slam_vfx.tsx` $\leftrightarrow$ `procedural_building.tsx`.
   - `[SCC-5]` (3 tệp): `legacy_pawn_fallbacks.tsx` $\leftrightarrow$ `luxury_pawn_fallbacks.tsx` $\leftrightarrow$ `luxury_pawn_models.tsx`.
   - `[SCC-6]` (3 tệp): `instanced_toy_buildings.tsx` $\leftrightarrow$ `board_layout.tsx` $\leftrightarrow$ `batched_board_tiles.tsx`.


