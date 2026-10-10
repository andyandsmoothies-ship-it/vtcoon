# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-356
## Plan IMP-356: Diorama Hollow Rim, Physical Flat Dice Landing & Bot Action Camera Restoration (Ticket IMP-356)

> **Mã Ticket:** `IMP-356`  
> **Phân hệ thực tế:** `client-3d`  
> **Ngày hoàn thành:** 2026-10-10  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

Triển khai gói hoàn thiện và đồng bộ kỹ thuật cho ticket `IMP-356` thuộc phân hệ `client-3d`.

- **Mục tiêu kỹ thuật**:
  - Bảo toàn 100% logic nghiệp vụ cốt lõi và các ràng buộc FSM/Domain.
  - Phân bổ cấu trúc hiển thị tối ưu, bảo vệ trải nghiệm công thái học (ergonomics) trên cả Desktop và Mobile.
  - Tuân thủ nghiêm ngặt các ranh giới kiểm thử, Zero Dirty Casts (`as any`), và các trần giới hạn LOC.

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-356.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-356.md) | Thẩm định kế hoạch đạt 0 defects, 8 contract tests clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/client/imp356_android_depth_and_dice_landing.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp356_android_depth_and_dice_landing.test.ts) | 11 atomic tests, 21 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/chaos_sentinel_IMP-356.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-356.json) | 3 production files modified, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.0: Dual-Viewport** | Puppeteer Headless Probe | Desktop (1280x800) [`imp-356_desktop.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-356_desktop.jpg) & Mobile (360x740) [`imp-356_mobile_360.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-356_mobile_360.jpg) | **CAPTURED** 📸 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-356.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-356.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-3d` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-356.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-356.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 1.91 | **APPROVED** 🛡️ |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 29/29 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Thẩm định kế hoạch đạt 0 defects, 8 contract tests clean.
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa**:
  - **[ADV-OBJ] Objective Validity**
    - **Target reachable?**: Yes — `DioramaBoardRim` is rendered in `MiniatureCityDiorama` at [src/client/3d/miniature_city_diorama.tsx#L283](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx#L283), which is rendered unconditionally in production at [src/client/3d/board_layout.tsx#L162](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_layout.tsx#L162) and [src/client/3d/sunny_island_lobby_scene.tsx#L297](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/sunny_island_lobby_scene.tsx#L297). `DiceTray` is rendered unconditionally in production at [src/client/3d/board_layout.tsx#L165](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_layout.tsx#L165). Both fire under normal runtime conditions.
    - **Baselines verified?**: Yes — all physical measurements and claims verified against physical code:
    - **Verdict**: PASS — Objective attack validated.
  - **[ADV-01] Geometric Cross-Hair Overhang / Horns on Brass Rails**
    - **Vector**: Unstated Assumptions & 3D Geometry
    - **Scenario**: In `src/client/3d/miniature_city_diorama.tsx`, the plan proposes: <mesh receiveShadow position={[0, 0.032, -8.9]}> <boxGeometry args={[18.44, 0.01, 0.15]} /> ... <mesh receiveShadow position={[-8.9, 0.032, 0]}>
    - **Consequence**: Catastrophic visual glitch: the brass rim appears as a floating `#` tic-tac-toe cross pattern with $24.5\text{cm}$ spurs hanging off all 4 corners of the board, completely breaking the diorama tabletop aesthetic.
    - **Hardening Directive**: In [src/client/3d/miniature_city_diorama.tsx#L103-L118](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx#L103-L118), align the brass rail centerlines with the physical outer perimeter:
  - **[ADV-02] Invisible Roll on Fast Turn Advance / Concurrency Race Hazard**
    - **Vector**: Concurrency & Re-entrancy
    - **Scenario**: Player 1 rolls dice. In `useGameStore`, `isRolling` is set to `true`. Before the $1700\text{ms}$ roll/settle sequence finishes (e.g. timeout watchdog fires, player disconnects, or rapid turn transition in headless/bot fl
    - **Consequence**: Player 2's dice roll renders with `fadeOpacity: 0` (100% transparent/invisible). The player sees no dice falling, but their pawn suddenly moves without any visual rolling feedback.
    - **Hardening Directive**: In [src/client/3d/dice_tray.tsx#L149-L156](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/dice_tray.tsx#L149-L156), when `currentTurnPlayerId` changes: If `isRolling` is currently `true`, immediately call `set
  - **[ADV-03] Orphaned Fadeout Timers Mutating Next Turn's Presentation**
    - **Vector**: Partial Failure & Trapped States
    - **Scenario**: Player 1 completes a dice roll. `isRolling` becomes `false`. The `[isRolling]` effect schedules two uncoordinated local timeouts at [src/client/3d/dice_tray.tsx#L181-L186](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/
    - **Consequence**: Player 2's active rolling dice abruptly disappear in mid-air $200\text{ms}$ into their roll due to an uncollected timer leak from Player 1's previous turn.
    - **Hardening Directive**: Elevate timer handles to component-level refs: const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); In [src/client/3d/dice_tray
  - **[ADV-04] Doubles (Bốc Đôi) Spin Freeze & Monotonic Roll Stagnation**
    - **Vector**: Concurrency & Re-entrancy
    - **Scenario**: In Monopoly rules (verified in [src/server/turn_loop.ts#L203-L207](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/turn_loop.ts#L203-L207)), rolling doubles (`consecutiveDoubles > 0`) allows the same player to rol
    - **Consequence**: The second roll executes with the exact identical angular spin offsets as the first roll, causing the dice to replicate the exact same spin pattern and look frozen/robotic.
    - **Hardening Directive**: Track `lastDiceSeq` via a ref in `DiceTray`: const prevDiceSeqRef = useRef<number | undefined>(lastDiceSeq); const isNewRoll = isRolling && (!prevRollingRef.current || (lastDiceSeq !== undefined && lastDiceSeq !== prevDi
  - **[ADV-05] Living Test Parity & Depth Dimension Contract Guard (ADV-REG)**
    - **Vector**: Living Test Collision & Contract Regression
    - **Scenario**: In [tests/client/urban_density_and_craft.test.ts#L178-L200](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/urban_density_and_craft.test.ts#L178-L200), TC-UDC01.2a and TC-UDC01.2b assert: `dims.widthX >= 18.2`
    - **Consequence**: Unmitigated regression failure in existing living test suite `urban_density_and_craft.test.ts`.
    - **Hardening Directive**: Maintain at least one box geometry with depth dimension $d \ge 18.2$ (specifically the East/West rails with depth $18.4$ for wood and $18.44$ for brass). In `tests/client/imp356_android_depth_and_dice_landing.test.ts`, e

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/client/imp356_android_depth_and_dice_landing.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp356_android_depth_and_dice_landing.test.ts)
- **Chỉ số kiểm thử**: **11 atomic tests**, **21 asserts** (mật độ trung bình: 1.91 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (Thất bại do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.
  - **Bằng chứng thất bại (Failure Snippet)**:
```text
AssertionError: expected [ 0.35, 0, -0.35 ] to deeply equal [ 0, 0, 0 ]

- Expected
+ Received

  [
-   0,
+   0.35,
    0,
-   0,
+   -0.35,
  ]

 ❯ tests/client/imp356_android_depth_and_dice_landing.test.ts:192:28
    190|     expect(diceGroup).not.toBeNull();
    191|     expect(rotationValues).toEqual([0, 0, 0]);
       |                            ^
```

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi**:
  - [`src/client/3d/camera_state_machine.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/camera_state_machine.ts)
  - [`src/client/3d/dice_tray.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/dice_tray.tsx)
  - [`src/client/3d/miniature_city_diorama.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx)
- **Chuyển trạng thái**: Toàn bộ **11/11 contract tests chuyển sang GREEN**.
- **Living Test Suites**: Bảo toàn nguyên vẹn, zero hồi quy logic hiện hành.

### Trạm 2.5: Fast Pre-Filter Mechanical Sweep (`scout` / `fast_prefilter.mjs`)
- **TypeScript**: `tsc --noEmit` vượt qua với 0 lỗi (Exit Code 0).
- **Dirty Casts**: Tuyệt đối không sử dụng `as any` hoặc dirty type casting.
- **LOC Ceilings**: Tất cả các tệp đều nằm trong hạn mức trần của từng phân hệ (Tier 1 <= 400, Tier 2 <= 500, Tier 3 <= 800, Test <= 600).

### Trạm 3.0: Bằng Chứng Thị Giác Vật Lý & Đo Lường Camera Telemetry (Visual & Telemetry Evidence)
- **Hình ảnh ghi nhận từ WebGL Canvas thực tế (Dual-Viewport CDP Probe)**:
  - **Mobile Viewport (360x740) — Xúc Xắc Phẳng & Khung Viền Rỗng Mộng Chìm**:
    - Tệp hình ảnh: [`imp-356_mobile_360.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp-356_mobile_360.jpg)
    - Tọa độ Camera thực tế: [`camera_telemetry_imp-356_mobile.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/camera_telemetry_imp-356_mobile.json)
    - Độ cao máy ảnh ($Y$): **$6.399\text{m}$** | Góc chúc (Pitch): **$40.4^\circ$** | Trường nhìn (FOV): **$35.0^\circ$**
    - Đánh giá thị giác: Khung viền bàn cờ 4 cạnh sắc nét, lòng bàn cờ giải phóng $100\%$ không bị Z-fighting; hai viên xúc xắc đỏ Ruby tiếp đất phẳng phiu $[0, 0, 0]$ ngay cạnh đài phun nước trung tâm.
  - **Desktop Viewport (1280x800) — Tổng Thể Đô Thị Sa Bàn**:
    - Tệp hình ảnh: [`imp-356_desktop.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp-356_desktop.jpg)
    - Tọa độ Camera thực tế: [`camera_telemetry_imp-356_desktop.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/camera_telemetry_imp-356_desktop.json)
    - Độ cao máy ảnh ($Y$): **$25.348\text{m}$** | Góc chúc (Pitch): **$38.6^\circ$** | Trường nhìn (FOV): **$24.0^\circ$**

---

### Trạm 3.1 & 3.2: Thẩm Định Kiến Trúc Sâu & Giải Trình Khắc Phục (Deep Architecture Remediation)
1. **Triệt tiêu hoàn toàn Coplanar Overlap (Z-fighting) tại 4 góc bằng Mộng Chìm (Butt-Joint)**:
   - *Vấn đề phát hiện*: Trước đây 4 thanh viền đều dài $18.4\text{m}$, khiến 4 góc ($0.6\text{m} \times 0.6\text{m}$) bị chồng lấn đồng phẳng tại $Y=0$, gây nguy cơ Z-fighting trên GPU 16-bit depth buffer của Android.
   - *Khắc phục chuẩn xác*: Cắt ngắn 2 thanh gỗ Bắc-Nam về đúng $17.2\text{m}$ ($18.4 - 2 \times 0.6$), ép mộng chìm khít giữa 2 thanh Đông-Tây $18.4\text{m}$. Đồng thời cắt ngắn 2 thanh nẹp đồng Đông-Tây về $18.14\text{m}$ ($18.44 - 2 \times 0.15$), ghép mộng chìm vuông góc với 2 thanh Bắc-Nam $18.44\text{m}$.
   - *Kết quả*: Thể tích giao thoa tại cả 4 góc bàn cờ chính xác bằng $0\text{m}^3$, bảo toàn kích thước bao ngoài $\ge 18.2\text{m}$ và triệt tiêu $100\%$ nhấp nháy góc.
2. **Bảo toàn nguyên tắc Pure Component trong React 19 Concurrent Rendering (`DiceTray.tsx`)**:
   - *Vấn đề phát hiện*: Đột biến `spinOffsetsRef.current` và gọi `generateRandomDiceSpin()` ngay trong render phase vi phạm tính thuần khiết của React component.
   - *Khắc phục chuẩn xác*: Toàn bộ logic cập nhật góc xoay ngẫu nhiên và theo dõi lượt quay mới được chuyển sang hook `useEffect([isRolling, lastDiceSeq])`. Render body giờ đây hoàn toàn thuần khiết và an toàn dưới cơ chế Concurrent Mode.
3. **Hài hòa logic góc quay Bot giữa IMP-354 (Chống Say Xe) và IMP-356 (Khôi Phục Góc Quay Sống Động)**:
   - *Vấn đề phát hiện*: IMP-354 trước đây cố định Bot ở `overview` để tránh "Camera Whiplash" (say xe khi 3 bot đánh liên tiếp), nhưng khiến camera đơ cứng làm người chơi tưởng game bị đóng băng.
   - *Khắc phục chuẩn xác*: 
     - Khi Bot di chuyển: kích hoạt `pawn_chase` bám theo quân cờ, nhưng sử dụng tốc độ giảm chấn dịu hơn (`speed: 2.4` so với `3.6` thông thường) để camera lướt êm ái, loại bỏ hoàn toàn hiện tượng giật cục.
     - Khi Bot hạ cánh vào ô của người chơi hoặc mở modal: kích hoạt `tile_focus` rọi cận cảnh giao dịch.
     - Khi Bot hạ cánh vào ô không có chủ: camera chuyển về `overview` (bảo toàn hợp đồng `dramatic_pacing_camera.test.ts` và chống say xe khi bot đi vào ô không có sự kiện).
   - *Dọn dẹp code rác*: Đã loại bỏ hoàn toàn các khối `if` no-op và kết nối đầy đủ tham số `isTargetOwnedByHuman`, 0 cờ Slop.

---

### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: 29/29 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-356 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `camera_state_machine.ts` | [`src/client/3d/camera_state_machine.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/camera_state_machine.ts) | Tier 1 (Domain/Server/Logic) | **295 LOC** | 296 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `dice_tray.tsx` | [`src/client/3d/dice_tray.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/dice_tray.tsx) | Tier 2 (UI/3D/Views) | **278 LOC** | 279 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `miniature_city_diorama.tsx` | [`src/client/3d/miniature_city_diorama.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx) | Tier 2 (UI/3D/Views) | **348 LOC** | 349 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `imp354_bot_camera_stabilization.test.ts` | [`tests/client/imp354_bot_camera_stabilization.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp354_bot_camera_stabilization.test.ts) | Living Test | **214 LOC** | 215 Lines | <= 600 LOC | ✅ Đạt chuẩn |
| `dramatic_pacing_camera.test.ts` | [`tests/client/dramatic_pacing_camera.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/dramatic_pacing_camera.test.ts) | Living Test | **195 LOC** | 196 Lines | <= 600 LOC | ✅ Đạt chuẩn |
| `urban_density_and_craft.test.ts` | [`tests/client/urban_density_and_craft.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/urban_density_and_craft.test.ts) | Living Test | **378 LOC** | 379 Lines | <= 600 LOC | ✅ Đạt chuẩn |
| `imp356_android_depth_and_dice_landing.test.ts` | [`tests/client/imp356_android_depth_and_dice_landing.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp356_android_depth_and_dice_landing.test.ts) | Living Test | **334 LOC** | 335 Lines | <= 600 LOC | ✅ Đạt chuẩn |

---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

- **Tính toàn vẹn hệ thống**: Gói cải tiến hoàn thành theo đúng nguyên tắc Zero-Blindness, cung cấp đầy đủ bằng chứng vật lý từ mã nguồn, kiểm thử, hình ảnh trực quan đến biên bản kiểm toán độc lập.
- **Sẵn sàng triển khai**: Mã nguồn đã sẵn sàng đóng gói và triển khai lên môi trường sản phẩm.

