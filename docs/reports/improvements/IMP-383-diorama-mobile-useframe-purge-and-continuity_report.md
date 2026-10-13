# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-383
## KẾ HOẠCH TRIỂN KHAI IMP-383: DIORAMA MOBILE USEFRAME PURGE & CONTINUITY (MICRO-VEHICLES & WATERCRAFT SLICE)

> **Mã Ticket:** `IMP-383`  
> **Phân hệ thực tế:** `client-3d`  
> **Ngày hoàn thành:** 2026-10-13  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

Trên các thiết bị di động (mobile) và khi góc nhìn camera/LOD ẩn sa bàn đô thị trung tâm (`isCityVisible = false`), việc R3F tiếp tục đăng ký và kích hoạt hàng loạt callback `useSafeFrame` mỗi 16ms gây lãng phí nghiêm trọng chu kỳ CPU, khiến thiết bị tỏa nhiệt và tụt pin không cần thiết. Đồng thời, việc tính toán hoạt họa bằng biến thời gian tuyệt đối `clock.elapsedTime` dễ gây hiện tượng giật nhảy vị trí (teleportation) khi sa bàn xuất hiện trở lại, trong khi việc hủy mount component Three.js (`<group>`) lại gây rác bộ nhớ WebGL và độ trễ compile lại shader.

Ticket **IMP-383** giải quyết trọn vẹn bài toán tối ưu hóa vòng lặp hoạt họa cho phân hệ xe cộ và phương tiện đường thủy vi mô (`DioramaTraffic`, `DioramaHarborCruiser`, `DioramaMicroLife`) thông qua 4 cơ chế then chốt:
1. **Headless Child FrameLoop Pattern (ADV-01)**: Tách việc đăng ký `useSafeFrame` vào component con không đầu (`*FrameLoop`), chỉ mount khi `!isMobile` và trả về `null`. Điều này loại bỏ 100% callback trên mobile mà vẫn bảo toàn cây phần tử JSX gốc (`<group>` và các mesh) để duy trì tính tương thích 100% với các bộ living test (`TC-265.07`, `TC-265.10`).
2. **Transient Visibility Early Return**: Đặt lệnh thoát sớm `if (!isVisible) return;` ngay trong closure của frame loop thay vì unmount `<group>`, triệt tiêu 100% chi phí re-upload GPU buffer và shader re-linking.
3. **C0 Kinematic Continuity & Safety Clamp (ADV-03)**: Chuyển đổi sang cơ chế tích lũy delta an toàn (`progressRef.current += clampedDelta * speed`) với chốt chặn `Math.min(delta, 0.1)`, ngăn chặn hiện tượng nhảy cóc khi người dùng chuyển tab trình duyệt hoặc background resume.
4. **Device Sniffing Dependency Injection Invariant**: Truyền khả năng thiết bị và trạng thái hiển thị (`isMobile`, `isVisible`) thuần túy qua props từ `GameBoard` qua `MiniatureCityDiorama` xuống các component lá, tuân thủ tuyệt đối thiết luật kiến trúc của dự án.

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-383.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-383.md) | Thẩm định kế hoạch đạt 0 defects, 9 contract tests clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/client/imp383_diorama_mobile_useframe_purge.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp383_diorama_mobile_useframe_purge.test.ts) | 9 atomic tests, 20 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/chaos_sentinel_IMP-383.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-383.json) | 5 production files modified, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.0: Dual-Viewport** | Puppeteer Headless Probe | Desktop (1280x800) [`imp-383_desktop.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-383_desktop.jpg) & Mobile (360x740) [`imp-383_mobile_360.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-383_mobile_360.jpg) | **CAPTURED** 📸 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-383.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-383.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-3d` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-383.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-383.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 2.22 | **APPROVED** 🛡️ |
| **Trạm 3.2: 3D Visual & LOD Review** | `3d-visual-auditor`<br>[`.agents/audit/3D_VISUAL_REVIEW_IMP-383.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/3D_VISUAL_REVIEW_IMP-383.md) | Triệt tiêu 100% vòng lặp useSafeFrame trên mobile, bảo toàn C0 kinematics và độ sắc nét 3D diorama trên màn hình 360px | **10/10 (3D AAA Verified) 🎨** |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 48/48 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️** (sau khi khắc phục toàn bộ 4 chỉ thị đối kháng ADV-01..ADV-04)
- **Nhật ký thẩm tra**: Thẩm định kế hoạch đạt 0 defects, 9 contract tests clean.
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa**:
  - **[ADV-OBJ] Objective Validity**
    - **Target reachable?**: Yes — `MiniatureCityDiorama` được render chủ động trong `board_layout.tsx#L174` và trong lobby `sunny_island_lobby_scene.tsx#L301`.
    - **Baselines verified?**: Yes — Đã kiểm chứng toàn bộ mã nguồn trên đĩa vật lý.
    - **Verdict (Round 1)**: VETO / AMEND REQUIRED (đã thu hẹp phạm vi vào phân hệ Micro-Vehicles & Watercraft và bổ sung Headless FrameLoop).
  - **[ADV-01] Component Branching Breaks Living AST Test Traversal (ADV-REG)**
    - **Vector**: Living Test Collision & Contract Regression (ADV-REG)
    - **Scenario**: Kế hoạch ban đầu định tách `{isMobile ? <Static /> : <Animated />}`, gây gãy `captureTree` trong `TC-265.07` và `TC-265.10`.
    - **Consequence**: Station 1 và Station 4 thất bại trên các bộ living test suites.
    - **Hardening Directive**: Áp dụng **Headless Child FrameLoop Pattern**: Giữ nguyên root `<group>` và mesh children trong component cha, chỉ mount component con `{!isMobile && <*FrameLoop />}` trả về `null`:
      ```tsx
      export function DioramaHarborCruiser({ isMobile = false, isVisible = true }: DioramaHarborCruiserProps = {}): React.ReactElement {
        const boatRef = useRef<Group>(null);
        const wakeRef = useRef<Mesh>(null);
        return (
          <group ref={boatRef} position={[0, -0.032, 5.2]} data-testid="diorama-harbor-cruiser">
            {!isMobile && (
              <DioramaHarborCruiserFrameLoop isVisible={isVisible} boatRef={boatRef} wakeRef={wakeRef} />
            )}
            {/* Boat meshes remain directly in JSX root */}
          </group>
        );
      }
      ```
  - **[ADV-02] Incomplete Surface Area — 6 Active Diorama Consumers Omitted (ADV-OBJ.4)**
    - **Vector**: Unstated Assumptions & Subsystem Drift (ADV-OBJ.4)
    - **Scenario**: `MiniatureCityDiorama` chứa thêm 6 component động khác; việc tuyên bố "loại bỏ triệt để" là chưa chính xác.
    - **Consequence**: Gây hiểu lầm về độ phủ tối ưu hóa.
    - **Hardening Directive**: Thu hẹp tiêu đề và phạm vi thành lát cắt **Micro-Vehicles & Watercraft Slice**, đồng thời hoãn 6 thành phần còn lại sang `[DEFERRED TO TICKET-IMP-385: Miniature City Infrastructure & Aviation useFrame Purge & Continuity]`.
  - **[ADV-03] Unclamped Delta Spike upon Window Un-hide or Tab Wake (ADV-CONCUR)**
    - **Vector**: Concurrency & Re-entrancy / Frame Loop Hazards
    - **Scenario**: Khi người chơi đổi tab hoặc tắt modal, clock Three.js phát sinh cú sốc delta từ 2s đến 10s khiến xe cộ/thuyền bè bị nhảy vọt vị trí.
    - **Consequence**: Giật hình và phá vỡ trải nghiệm nhập vai.
    - **Hardening Directive**: Áp dụng chốt kẹp delta an toàn:
      ```ts
      const clampedDelta = Math.min(delta, 0.1);
      progressRef.current += clampedDelta * speed;
      ```
  - **[ADV-04] SunnyIslandLobbyScene Secondary Caller Compatibility (ADV-WIRE)**
    - **Vector**: Closed-Loop Presentation Wire & Caller Drift
    - **Scenario**: Call-site tại lobby không truyền `isVisible`.
    - **Consequence**: Nguy cơ `isVisible = undefined` khiến hoạt họa bị đóng băng vĩnh viễn trong lobby.
    - **Hardening Directive**: Đặt giá trị mặc định rõ ràng `isVisible = true` ở cấp component.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/client/imp383_diorama_mobile_useframe_purge.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp383_diorama_mobile_useframe_purge.test.ts)
- **Chỉ số kiểm thử**: **9 atomic tests**, **20 asserts** (mật độ trung bình: 2.22 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (Thất bại do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.


### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi**:
  - [`src/client/3d/board_layout.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_layout.tsx)
  - [`src/client/3d/diorama/diorama_harbor_cruiser.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_harbor_cruiser.tsx)
  - [`src/client/3d/diorama/diorama_microlife.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_microlife.tsx)
  - [`src/client/3d/diorama/diorama_traffic.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_traffic.tsx)
  - [`src/client/3d/miniature_city_diorama.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx)
- **Chuyển trạng thái**: Toàn bộ **9/9 contract tests mới (cùng với 26/26 tests thuộc các bộ living regression test IMP-265 và IMP-266.3) đều chuyển sang GREEN**.
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
3. **3D Visual & Architectural LOD Auditor (`3d-visual-auditor` / `game-3d-visual-critic`)**:
    - **Phán quyết**: **10/10 (3D AAA Verified) 🎨**
    - Xác nhận triệt tiêu 100% vòng lặp useSafeFrame trên mobile, bảo toàn tính liên tục C0 kinematics và độ sắc nét 3D diorama trên màn hình 360px.



### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: 48/48 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-383 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `board_layout.tsx` | [`src/client/3d/board_layout.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_layout.tsx) | Tier 2 (UI/3D/Views) | **203 SLOC** | 230 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `diorama_harbor_cruiser.tsx` | [`src/client/3d/diorama/diorama_harbor_cruiser.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_harbor_cruiser.tsx) | Tier 2 (UI/3D/Views) | **90 SLOC** | 105 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `diorama_microlife.tsx` | [`src/client/3d/diorama/diorama_microlife.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_microlife.tsx) | Tier 2 (UI/3D/Views) | **85 SLOC** | 96 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `diorama_traffic.tsx` | [`src/client/3d/diorama/diorama_traffic.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_traffic.tsx) | Tier 2 (UI/3D/Views) | **269 SLOC** | 303 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `miniature_city_diorama.tsx` | [`src/client/3d/miniature_city_diorama.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx) | Tier 2 (UI/3D/Views) | **337 SLOC** | 368 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `imp265_dual_platform_mobile_lod.test.ts` | [`tests/client/imp265_dual_platform_mobile_lod.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp265_dual_platform_mobile_lod.test.ts) | Living Test | **326 SLOC** | 380 Lines | <= 600 LOC | ✅ Đạt chuẩn |
| `imp383_diorama_mobile_useframe_purge.test.ts` | [`tests/client/imp383_diorama_mobile_useframe_purge.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp383_diorama_mobile_useframe_purge.test.ts) | Living Test | **145 SLOC** | 178 Lines | <= 600 LOC | ✅ Đạt chuẩn |

---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

- **Tính toàn vẹn hệ thống**: Gói cải tiến hoàn thành theo đúng nguyên tắc Zero-Blindness, cung cấp đầy đủ bằng chứng vật lý từ mã nguồn, kiểm thử, hình ảnh trực quan đến biên bản kiểm toán độc lập.
- **Sẵn sàng triển khai**: Mã nguồn đã sẵn sàng đóng gói và triển khai lên môi trường sản phẩm.


