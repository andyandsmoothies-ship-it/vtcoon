# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-385
## KẾ HOẠCH TRIỂN KHAI IMP-385: MINIATURE CITY INFRASTRUCTURE & SKYLINE USEFRAME PURGE & CONTINUITY (INFRASTRUCTURE SLICE)

> **Mã Ticket:** `IMP-385`  
> **Phân hệ thực tế:** `client-3d`  
> **Ngày hoàn thành:** 2026-10-13  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

Sau khi triển khai Slice 1 (IMP-383) triệt tiêu thành công các vòng lặp animation vi mô xe cộ và tàu bè trên mobile, kết quả đo kiểm thực tế trên iPhone ghi nhận FPS đạt mức ổn định cao (57–60 FPS), song vẫn còn hiện tượng lãng phí chu kỳ CPU/GPU do 6 cụm hạ tầng diorama còn lại trong `MiniatureCityDiorama` vẫn liên tục đăng ký callback `useSafeFrame` vào R3F Frame Loop Scheduler trên mobile. 

Ticket **IMP-385 (Slice 2: Miniature City Infrastructure & Skyline useFrame Purge & Continuity)** giải quyết triệt để 5 điểm nghẽn kỹ thuật:
1. **Triệt tiêu 100% Callback R3F Trên Mobile (Headless Child FrameLoop Pattern - ADV-01)**: Toàn bộ 6 hạ tầng (`DioramaModelRailroad`, `DioramaContainerPort`, `DioramaMarina`, `DioramaPerchingBirds`, `DioramaBridges`, `DioramaSkyline`) được chuyển đổi sang mô hình tách riêng frame loop thành component con không đầu (`*FrameLoop`) trả về `null` và chỉ mount khi `!isMobile`. Trên mobile, 0 callback được đăng ký, giải phóng 100% CPU Main Thread cho diorama trong khi vẫn bảo toàn nguyên vẹn cây AST phần tử Three.js của các bộ living test (`TC-228`, `TC-230`, `TC-337.14`, `TC-METRO.06`).
2. **Khắc Phục Điểm Mù Đồ Họa Cầu Ba Son (Bridge LED Daylight Restoration Invariant)**: Cầu Ba Son (`DioramaBridges`) và tháp Bitexco (`DioramaSkyline`) áp dụng cơ chế ngắt nhàn rỗi ban ngày (`!isMobile && isNight`). Khi trời sáng (`isNight = false`), frame loop tự động unmount và kích hoạt hook dọn dẹp `useEffect` hoàn nguyên màu khuếch tán (#06B6D4) và phát quang (#00F5FF) của dải LED cầu Ba Son, triệt tiêu hoàn toàn lỗi kẹt màu ngẫu nhiên của đêm trước.
3. **Bảo Vệ Tính Liên Tục Chuyển Động $C^0$ & Chống Teleportation (ADV-03)**: Thay thế toàn bộ `clock.elapsedTime` bằng biến tích lũy delta an toàn `timeAccumRef.current += clampedDelta` với chốt kẹp `Math.min(delta, 0.1)`. Đoàn tàu Metro Tuyến 1, cẩu cảng container, và thuyền buồm không bao giờ bị nhảy cóc tọa độ khi người dùng đổi tab trình duyệt hoặc khi layer xuất hiện trở lại.
4. **Bảo Vệ Bộ Nhớ WebGL Khi Ẩn/Hiện Camera (Transient Visibility Guard)**: Khi diorama bị ẩn (`isVisible = false`), các component `*FrameLoop` early return ngay đầu callback mà không unmount Three.js group, loại bỏ 100% rung giật (stutter/jank) do cấp phát lại bộ đệm WebGL.
5. **Kỷ Luật Thiết Luật Kiểm Thử Đồ Họa Chuẩn Hóa**: Tuân thủ nghiêm ngặt `Standardized Graphics Fixture Invariant`, cấm bespoke `vi.mock('@react-three/fiber')`, chuẩn hóa 100% việc điều khiển nhịp frame qua `tests/helpers/r3f_test_harness.ts`.

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-385.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-385.md) | Thẩm định kế hoạch đạt 0 defects, 11 contract tests clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/client/imp385_diorama_infrastructure_useframe_purge.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp385_diorama_infrastructure_useframe_purge.test.ts) | 12 atomic tests, 26 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/chaos_sentinel_IMP-385.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-385.json) | 7 production files modified, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.0: Dual-Viewport** | Puppeteer Headless Probe | Desktop (1280x800) [`imp-385_desktop.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-385_desktop.jpg) & Mobile (360x740) [`imp-385_mobile_360.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-385_mobile_360.jpg) | **CAPTURED** 📸 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-385.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-385.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-3d` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-385.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-385.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 2.17 | **APPROVED** 🛡️ |
| **Trạm 3.2: 3D Visual & LOD Review** | `3d-visual-auditor`<br>[`.agents/audit/3D_VISUAL_REVIEW_IMP-385.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/3D_VISUAL_REVIEW_IMP-385.md) | Triệt tiêu 100% useSafeFrame hạ tầng trên mobile, tối ưu nhàn rỗi ban ngày cầu Ba Son & Bitexco, bảo toàn C0 kinematics | **10/10 (3D AAA Verified) 🎨** |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 27/27 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Thẩm định kế hoạch đạt 0 defects, 11 contract tests clean.
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa**:
  - **[ADV-OBJ] Objective Validity**
    - **Target reachable?**: Yes — `MiniatureCityDiorama` is actively rendered in production inside `src/client/3d/board_layout.tsx#L174` under `<group visible={isCityVisible}>`, and in `src/client/3d/sunny_island_lobby_scene.tsx#L301`. Its child infrastructure components (`DioramaModelRailroad` #L330, `DioramaBridges` #L346, `DioramaContainerPort` #L351, `DioramaMarina` #L352, `DioramaPerchingBirds` inside marina #L191, `DioramaSkyline` #L356) are all mounted in production. All 6 files currently register `useSafeFrame` callbacks that execute every frame on mobile (`isMobile = true`), consuming frame budget and CPU cycles even when `isCityVisible = false`.
    - **Baselines verified?**: Yes — Physical baselines verified against disk:
    - **Physical surface area exhausted?**: Yes. Within `MiniatureCityDiorama`, all 8 dynamic frame-loop components are now accounted for (3 in IMP-383, 5 top-level + 1 nested in IMP-385). `DioramaFerrisWheel` is dead/unmounted code outside the diorama tree.
    - **Verdict**: FAIL — Plan has 4 critical adversarial hazards: (1) Bitexco red strobe beacon trapped permanently ON in daytime on mobile and desktop; (2) Tautological false-positive contract test probes inspecting `captureTree(MiniatureCityDiorama)` on shallow AST traversal; (3) Internal plan contradiction regarding kinematic accumulator vs wall clock time in Port & Marina; (4) Risk of R3F reconciler coordinate snap in `DioramaPerchingBirds` breaking living test `TC-337.14`.
  - **[ADV-01] Bitexco Aviation Strobe Trapped ON in Daytime on Mobile and Desktop (ADV-STATE / TRAPPED)**
    - **Vector**: Partial Failure & Trapped States (Vector 3) / Cross-Subsystem State Erasure (ADV-STATE)
    - **Scenario**: In `src/client/3d/diorama/diorama_skyline.tsx#L259`, the Bitexco warning strobe mesh is declared as: <mesh ref={beaconRef} position={[0, 2.95, 0]}> <sphereGeometry args={[0.03, 8, 8]} /> <meshBasicMaterial color="#EF4444" /> </mesh> Unlike `DioramaContainerPort` (`diorama_container_port.tsx#L97,L148`), it has **no declarative `visible` prop** in JSX. Previously, `DioramaSkyline` ran `useSafeFrame` every single frame on all platforms to imperatively set: `beaconRef.current.visible = isNight ? isStrobe : false;` Under the proposed plan: On mobile (`isMobile = true`): `DioramaSkylineFrameLoop` is never mounted. `beaconRef.current` is never touched. React and Three.js default mesh visibility to `true`. As a result, the red aviation strobe glows continuously in bright daylight (`phase === 'day'`) on all mobile devices! On desktop (`isMobile = false`): The plan proposes early returning inside `DioramaSkylineFrameLoop` when `!isVisible || !isNight`. If night transitions to day during a 0.2s strobe pulse (`isStrobe === true`), the loop immediately early returns. `beaconRef.current.visible` is never set to `false`, and because JSX lacks a `visible={isNight}` prop, React does not reconcile it. The strobe remains permanently trapped in the ON state throughout the daytime.
    - **Consequence**: Visual defect on mobile and desktop where the red rooftop strobe is permanently active during daytime, violating the day/night lighting realism established in IMP-337.
    - **Hardening Directive**: In `src/client/3d/diorama/diorama_skyline.tsx#L259`, add declarative visibility to the mesh in JSX: `<mesh ref={beaconRef} position={[0, 2.95, 0]} visible={isNight}>` In `DioramaSkyline`, conditionally mount the frame loop only when desktop AND night: `{!isMobile && isNight && <DioramaSkylineFrameLoop isVisible={isVisible} beaconRef={beaconRef} />}` When daytime arrives, `DioramaSkylineFrameLoop` unmounts, completely removing `useFrame` registration, and React reconciles `visible={false}` on the mesh without trapped states.
  - **[ADV-02] Tautological AST Probes on Shallow Component Traversal in Contract Tests (ADV-WIRE / Living Test Methodology)**
    - **Vector**: Unstated Assumptions & Subsystem Drift (Vector 4) / Severed Presentation Wire (ADV-WIRE)
    - **Scenario**: Plan specifications TC-385.01, TC-385.02, and TC-385.03 propose asserting that `DioramaModelRailroadFrameLoop`, `DioramaContainerPortFrameLoop`, `DioramaMarinaFrameLoop`, `DioramaBridgesFrameLoop`, and `DioramaSkylineFrameLoop` are NOT mounted by capturing `MiniatureCityDiorama` with `captureTree`: `Given MiniatureCityDiorama với isMobile=true, When render cây sa bàn đô thị, Then ...FrameLoop không được mount.` In `tests/helpers/threejs_test_utils.ts#L36-41`, `captureTree` executes `Component(props)` via `renderToStaticMarkup` without mounting or executing functional component children. `MiniatureCityDiorama` returns elements like `<DioramaModelRailroad isMobile={isMobile} isVisible={isVisible} />`. It **does not** return `<DioramaModelRailroadFrameLoop />`. The frame loops are children of the subcomponents, not of `MiniatureCityDiorama`. Consequently, `findReactNode(tree, (n) => n.type === DioramaModelRailroadFrameLoop)` on `captureTree(MiniatureCityDiorama)` will **always evaluate to `null`**, even on desktop (`isMobile: false`) or if the implementation is completely broken.
    - **Consequence**: TC-385.01..TC-385.03 are tautological false-positive probes that will pass unconditionally without proving the mobile frame loop purge.
    - **Hardening Directive**: Restructure the contract test suite to probe the subcomponents directly with both `isMobile: true` and `isMobile: false`: `captureTree(DioramaModelRailroad, { isMobile: true })` -> assert FrameLoop is `null`. `captureTree(DioramaModelRailroad, { isMobile: false })` -> assert FrameLoop is mounted. Repeat symmetrically for `DioramaContainerPort`, `DioramaMarina`, `DioramaPerchingBirds`, `DioramaBridges`, and `DioramaSkyline`. On `MiniatureCityDiorama`, test **Call-Site Prop Propagation**: Verify that `captureTree(MiniatureCityDiorama, { isMobile: true, isVisible: false })` propagates `isMobile={true}` and `isVisible={false}` to all 5 direct child nodes (`DioramaModelRailroad`, `DioramaBridges`, `DioramaContainerPort`, `DioramaMarina`, `DioramaSkyline`), mirroring the established pattern in `TC-383.09`.
  - **[ADV-03] Internal Plan Contradiction: Kinematic Accumulation vs Wall Clock Time (Vector 2 / Vector 4)**
    - **Vector**: Concurrency & Re-entrancy / Unstated Assumptions
    - **Scenario**: Section 1 Point 4 of the plan states: "Kẹp biên độ Delta Spike (ADV-03): Trong mọi callback tích lũy tiến trình (`DioramaModelRailroad`, `DioramaContainerPort`, `DioramaMarina`), bắt buộc kẹp `const clampedDelta = Math.min(delta, 0.1)`". And Section 1 Point 5 states: "Chuyển đổi tuyến đường sắt metro và các chuyển động cơ học từ `state.clock.elapsedTime` sang cơ chế tích lũy `timeAccumRef.current += clampedDelta`". However, physical inspection of disk reveals that `DioramaContainerPort` (`diorama_container_port.tsx#L47`) and `DioramaMarina` (`diorama_marina.tsx#L38`) currently do NOT accumulate delta at all; they evaluate trigonometric sine waves directly against `state.clock.elapsedTime`. Furthermore, Section 3 of the plan completely omits `timeAccumRef` for `DioramaContainerPort` and `DioramaMarina`, specifying it only for `DioramaModelRailroad`.
    - **Consequence**: Ambiguity for the implementer:
    - **Hardening Directive**: Harmonize Section 1 and Section 3 of the plan: In `DioramaModelRailroadFrameLoop`, `DioramaContainerPortFrameLoop`, and `DioramaMarinaFrameLoop`, use a local `timeAccumRef.current += Math.min(delta, 0.1)` inside the frame loop callback. Pass `timeAccumRef.current` as `t` to `computeTrainKinematics`, crane trigonometric equations, and `calculateWatercraftBobbing`. This guarantees that all three mechanical subsystems cleanly freeze when `isVisible = false` (or during background tabs) and resume from their exact paused pose without phase jumps or delta spikes.
  - **[ADV-04] R3F Reconciler Snap Hazard on `DioramaPerchingBirds` Desktop Coordinates (ADV-REG / Living Contract)**
    - **Vector**: Living Test Collision & Contract Regression (Vector 6 / ADV-REG)
    - **Scenario**: Living contract test `TC-337.14` in `tests/client/imp337_diorama_mobile_freezing.test.ts#L250-256` strictly asserts: `DioramaPerchingBirds trên desktop không gán position trong JSX tránh R3F reconciler snap` (`expect(group?.props.position).toBeUndefined()`). Living test `TC-337.15` and `TC-337.16` test pointer events on the root `<group>` of `DioramaPerchingBirds`. When refactoring `DioramaPerchingBirds` to extract `DioramaPerchingBirdsFrameLoop`, if the implementer standardizes JSX and sets static `position={[spot.x, spot.y, spot.z]}` on the bird groups on desktop, or moves `handlePointerDown` to the child frame loop component, `TC-337.14`, `TC-337.15`, and `TC-337.16` will fail immediately.
    - **Consequence**: Station 1 and Station 4 regression failures against living test suite `imp337_diorama_mobile_freezing.test.ts`.
    - **Hardening Directive**: In `src/client/3d/diorama/diorama_perching_birds.tsx`, keep the conditional JSX coordinate assignment: `position={isMobile ? [spot.x, spot.y, spot.z] : undefined}` `rotation={isMobile ? [0, spot.baseRotY, 0] : undefined}` Retain `handlePointerDown` directly on the root `<group data-testid="diorama-perching-birds" onPointerDown={handlePointerDown}>`. Pass `flightStateRef`, `stateTimeRef`, `idleTimeRef`, `landingFromRef`, `birdsRef`, and `wingsRef` as props to `DioramaPerchingBirdsFrameLoop`.
  - **[ADV-05] Daytime Wasted Frame Loop Callbacks in `DioramaBridges` (Efficiency / Mobile & Desktop Pacing)**
    - **Vector**: Concurrency & Re-entrancy (Vector 2) / Unstated Assumptions (Vector 4)
    - **Scenario**: In `src/client/3d/diorama/diorama_bridges.tsx#L113-123`, the frame loop only animates Bason Bridge LED color cycling when `isNight` is true (`if (isNight && basonLedRef1.current && basonLedRef2.current)`). During daytime (over 70% of typical gameplay time), `basonLedRef1` and `basonLedRef2` are disabled (`emissiveIntensity: 0.0`), and the frame loop does zero visual work. The plan proposes mounting `DioramaBridgesFrameLoop` whenever `!isMobile`. This means on desktop during daytime, R3F continuously schedules and invokes a callback 60 times per second just to execute `if (!isVisible || !isNight) return;`.
    - **Consequence**: Unnecessary CPU frame loop overhead on desktop during daytime.
    - **Hardening Directive**: In `src/client/3d/diorama/diorama_bridges.tsx`: Mount `DioramaBridgesFrameLoop` conditionally on `!isMobile && isNight`: `{!isMobile && isNight && <DioramaBridgesFrameLoop isVisible={isVisible} basonLedRef1={basonLedRef1} basonLedRef2={basonLedRef2} />}` Since `DioramaBridges` already subscribes to `phase`, when night begins the loop mounts automatically, and when day returns it unmounts, completely removing the callback from R3F's internal scheduler.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/client/imp385_diorama_infrastructure_useframe_purge.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp385_diorama_infrastructure_useframe_purge.test.ts)
- **Chỉ số kiểm thử**: **12 atomic tests**, **26 asserts** (mật độ trung bình: 2.17 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (Thất bại do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.


### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi**:
  - [`src/client/3d/diorama/diorama_bridges.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_bridges.tsx)
  - [`src/client/3d/diorama/diorama_container_port.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_container_port.tsx)
  - [`src/client/3d/diorama/diorama_marina.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_marina.tsx)
  - [`src/client/3d/diorama/diorama_perching_birds.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_perching_birds.tsx)
  - [`src/client/3d/diorama/diorama_railroad.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_railroad.tsx)
  - [`src/client/3d/diorama/diorama_skyline.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_skyline.tsx)
  - [`src/client/3d/miniature_city_diorama.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx)
- **Chuyển trạng thái**: Toàn bộ **12/12 contract tests chuyển sang GREEN**.
- **Living Test Suites**: Bảo toàn nguyên vẹn, zero hồi quy logic hiện hành.

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
3. **3D Visual & Architectural LOD Auditor (`game-3d-visual-critic`)**:
    - **Phán quyết**: **10/10 (3D AAA Verified) 🎨**
    - Triệt tiêu 100% callback `useSafeFrame` hạ tầng trên mobile qua Headless Child FrameLoop Pattern (0 loop dispatch); ngắt nhàn rỗi ban ngày cho cầu Ba Son & tháp Bitexco; dọn dẹp và hoàn nguyên màu LED cầu Ba Son ban ngày (#06B6D4, #00F5FF); bảo toàn tính liên tục $C^0$ và chốt kẹp delta 0.1s chống teleportation; bảo vệ bộ nhớ WebGL buffer không bị unmount/remount khi layer ẩn/hiện.



### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: 27/27 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-385 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `diorama_bridges.tsx` | [`src/client/3d/diorama/diorama_bridges.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_bridges.tsx) | Tier 2 (UI/3D/Views) | **347 SLOC** | 382 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `diorama_container_port.tsx` | [`src/client/3d/diorama/diorama_container_port.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_container_port.tsx) | Tier 2 (UI/3D/Views) | **262 SLOC** | 289 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `diorama_marina.tsx` | [`src/client/3d/diorama/diorama_marina.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_marina.tsx) | Tier 2 (UI/3D/Views) | **211 SLOC** | 233 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `diorama_perching_birds.tsx` | [`src/client/3d/diorama/diorama_perching_birds.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_perching_birds.tsx) | Tier 2 (UI/3D/Views) | **281 SLOC** | 310 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `diorama_railroad.tsx` | [`src/client/3d/diorama/diorama_railroad.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_railroad.tsx) | Tier 2 (UI/3D/Views) | **376 SLOC** | 423 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `diorama_skyline.tsx` | [`src/client/3d/diorama/diorama_skyline.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_skyline.tsx) | Tier 2 (UI/3D/Views) | **381 SLOC** | 411 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `miniature_city_diorama.tsx` | [`src/client/3d/miniature_city_diorama.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx) | Tier 2 (UI/3D/Views) | **337 SLOC** | 368 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `imp385_diorama_infrastructure_useframe_purge.test.ts` | [`tests/client/imp385_diorama_infrastructure_useframe_purge.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp385_diorama_infrastructure_useframe_purge.test.ts) | Living Test | **267 SLOC** | 315 Lines | <= 600 LOC | ✅ Đạt chuẩn |

---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

- **Tính toàn vẹn hệ thống**: Gói cải tiến hoàn thành theo đúng nguyên tắc Zero-Blindness, cung cấp đầy đủ bằng chứng vật lý từ mã nguồn, kiểm thử, hình ảnh trực quan đến biên bản kiểm toán độc lập.
- **Sẵn sàng triển khai**: Mã nguồn đã sẵn sàng đóng gói và triển khai lên môi trường sản phẩm.

### Sổ Theo Dõi Nợ Kỹ Thuật (Tech Debt Watch)
- ⚠️ **Cảnh báo trần LOC Tier 2 (UI/3D/Views)** [`DEBT-DIO-01`]: Tệp [`src/client/3d/diorama/diorama_railroad.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_railroad.tsx) hiện đạt **423/500 LOC** (khoảng cách an toàn còn 77 dòng trước trần Tier 2). Các ticket kế tiếp nếu mở rộng đường sắt hoặc nhà ga bổ sung bắt buộc phải trích xuất các helper tính toán spline/hình học ray sang tệp helper thuần túy trước khi thêm logic mới.
- ⚠️ **Cảnh báo trần LOC Tier 2 (UI/3D/Views)** [`DEBT-DIO-02`]: Tệp [`src/client/3d/diorama/diorama_skyline.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_skyline.tsx) hiện đạt **411/500 LOC** (khoảng cách an toàn còn 89 dòng trước trần Tier 2). Các ticket kế tiếp nếu mở rộng cao ốc skyline phải trích xuất geometry descriptors của các tòa tháp phụ sang tệp phụ trợ riêng.


