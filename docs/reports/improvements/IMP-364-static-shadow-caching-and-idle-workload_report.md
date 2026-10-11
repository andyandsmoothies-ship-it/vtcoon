# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-364
## Plan IMP-364: Static Shadow Map Caching & Idle Workload Thermal Hardening (Ticket IMP-364)

> **Mã Ticket:** `IMP-364`  
> **Phân hệ thực tế:** `client-3d`  
> **Ngày hoàn thành:** 2026-10-11  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

Trong các ván đấu cờ tỷ phú VTCOON, thời gian người chơi suy nghĩ chiến lược, đọc thông tin thẻ bài, hoặc chờ đợi đối thủ chiếm đến **70%–80% tổng thời lượng ván đấu**. Tuy nhiên, vòng lặp đồ họa 3D trước đây vẫn liên tục thực hiện Render Shadow Map Pass của mặt trời (`directionalLight`) ở tốc độ 60 FPS ngay cả khi bàn cờ hoàn toàn đứng yên (idle). Shadow Map Pass yêu cầu GPU phải duyệt lại toàn bộ các đối tượng hình học đổ bóng trên bàn cờ để ghi độ sâu (depth map), gây tiêu hao GPU và tỏa nhiệt không cần thiết.

Ticket **IMP-364** giải quyết triệt để vấn đề này qua giải pháp đóng băng bóng đổ thích ứng (Adaptive Static Shadow Map Caching):
- **Đóng băng Shadow Depth Pass khi đứng yên**: Tự động chuyển `sunRef.current.shadow.autoUpdate = false` khi không có bất kỳ chuyển động nào của xúc xắc, quân cờ, xây nhà hoặc mặt trời.
- **Tái kích hoạt tức thì khi có biến động**: Tự động chuyển `autoUpdate = true` và `needsUpdate = true` khi:
  - Xúc xắc lăn (`isRolling = true`).
  - Quân cờ đang nhảy trên các ô đất (`isPawnMoving = true`).
  - Có công trình xây dựng / nâng cấp nhà mới (`levelMap` thay đổi tham chiếu).
  - Mặt trời đang di chuyển vị trí (`isSunPositionMoving` với khoảng cách vector $> 10^{-4}$).
- **Triệt tiêu bóng ma đứt đoạn trên Diorama (Zero-Shadow Budget)**: Gỡ bỏ `castShadow` trên mô hình xe cộ và tàu hỏa diorama trung tâm, loại bỏ hoàn toàn hiện tượng bóng ma bị đóng băng đứng yên giữa đường khi xe vẫn đang chạy, đồng thời dọn sạch draw calls đổ bóng vi mô thừa thãi.
- **Nới rộng Grace Window lên 800ms**: Đồng bộ chuẩn xác với chu kỳ rơi, nén và bật nảy của hoạt ảnh `construction_slam_vfx` (580ms).

---

## 2. GIẢI TRÌNH & MINH BẠCH HÓA 3 ĐIỂM PHẢN BIỆN ĐANH THÉP (THE 3 HARD CHALLENGES)

Nhằm đảm bảo tính trung thực kỹ thuật tuyệt đối và xóa bỏ mọi góc khuất tự huyễn hoặc, phiên bản nghiệm thu này đã giải quyết triệt để 3 điểm phản biện đanh thép:

### 🔴 Phản biện 1: Giải tỏa triệt để bẫy Tautological Testing & Xác minh đường dây nối vật lý (Component Wiring)
- **Vấn đề đã cảnh báo**: Trước đây, 13 test case chỉ kiểm thử hàm thuần túy trong `shadow_cache_helpers.ts`. Nếu đoạn code đóng băng bóng trong `time_of_day_lighting.tsx` bị xóa hoặc comment, toàn bộ test vẫn xanh rờn (False Security Gate).
- **Giải pháp xử lý trên đĩa**:
  1. Đã trích xuất và xuất khẩu hàm điều phối cấp component: [`updateLightingShadowCache`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/time_of_day_lighting.tsx#L270-L315) ngay tại `time_of_day_lighting.tsx`. Hàm này được gọi trực tiếp mỗi frame trong vòng lặp `useSafeFrame`.
  2. Bổ sung 4 ca kiểm thử tích hợp (integration tests) trực tiếp trong [`tests/client/imp364_static_shadow_caching.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp364_static_shadow_caching.test.ts#L140-L192):
     - `TC-364.14` [UC-LIGHTING-WIRING-IDLE]: Xác minh `updateLightingShadowCache` đóng băng `autoUpdate = false` khi trạng thái tĩnh sau khi hết grace window.
     - `TC-364.15a` [UC-LIGHTING-WIRING-MOTION-WAKE]: Xác minh khi có cờ chuyển động hoặc nhà mới xây, `autoUpdate` thức giấc thành `true` và `needsUpdate = true`.
     - `TC-364.15b` [UC-LIGHTING-WIRING-TIMESTAMP-REFRESH]: Xác minh mốc thời gian chuyển động `lastMotionTime` được làm mới chính xác khi phát hiện thay đổi mốc nhà.
     - `TC-364.16` [UC-TIME-OF-DAY-LIGHTING-MARKUP]: Xác minh tính toàn vẹn của thẻ `directionalLight` trong JSX của `TimeOfDayLighting`.
  3. Bổ sung **Mutant 8** vào Chaos Sentinel (`scripts/sentinel_probes/IMP-364.json`): Nếu bất kỳ ai can thiệp hoặc xóa khối logic gọi `updateLightingShadowCache` trong `time_of_day_lighting.tsx`, Chaos Sentinel sẽ phát hiện và tiêu diệt ngay lập tức.

### 🟡 Phản biện 2: Minh bạch hóa ranh giới hiệu năng Mobile vs Desktop (`castShadow={!isMobile}`)
- **Bản chất kỹ thuật trên đĩa**:
  Tại [`src/client/3d/time_of_day_lighting.tsx#L320`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/time_of_day_lighting.tsx#L320):
  ```tsx
  <directionalLight
    ref={sunRef}
    ...
    castShadow={!isMobile}
  />
  ```
  Trên thiết bị di động (`isMobile = true`), thẻ `directionalLight` vốn dĩ đã bị tắt hoàn toàn đổ bóng (`castShadow = false`) để bảo vệ ngân sách FPS cơ bản. Do đó, WebGL trên mobile chưa bao giờ phải render shadow depth pass của mặt trời.
- **Minh bạch hóa hiệu năng**:
  - **Desktop / Tablet ($\ge 768\text{px}$)**: Là đối tượng thụ hưởng trực tiếp và toàn diện của cơ chế Static Shadow Map Caching. Cắt giảm 100% Shadow Map Pass trong thời gian bàn cờ idle, giảm đáng kể tải GPU và nhiệt độ quạt tản nhiệt của laptop/desktop.
  - **Mobile (< 768px)**: Lợi ích thực tế đến từ việc **gỡ bỏ hoàn toàn `castShadow` ở các mô hình xe cộ và tàu hỏa diorama** ([`diorama_traffic.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_traffic.tsx), [`diorama_railroad.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_railroad.tsx)), dọn dẹp các cờ bóng đổ thừa thãi trong scene graph Three.js, giúp mobile đạt độ mượt ổn định tối đa mà không gây rủi ro lệch pha đồ họa.

### 🟡 Phản biện 3: Đồng bộ chính xác nhịp độ rơi Building Slam VFX (580ms vs 800ms Grace Window)
- **Phương trình chuyển động thực tế trên đĩa**:
  Tại [`src/client/3d/construction_slam_vfx.tsx#L55-L65`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/construction_slam_vfx.tsx#L55-L65), hàm `calculateImpactDrop` định nghĩa 3 pha chuyển động vật lý rõ rệt:
  $$\text{Tổng thời gian} = t_{\text{fall}} (380\text{ms}) + t_{\text{squash}} (80\text{ms}) + t_{\text{rebound}} (120\text{ms}) = 580\text{ms}$$
- **Nguy cơ của con số 500ms cũ**: Nếu giữ Grace Window 500ms, bóng đổ sẽ bị khóa cứng khi nhà đang ở mốc 500ms (đang trong pha nảy rung chấn $120\text{ms}$ cuối cùng), khiến bóng bị lệch khỏi chân móng nhà khi nhà đáp đất hoàn toàn.
- **Giải pháp**: Nâng mặc định `gracePeriodMs` trong [`shadow_cache_helpers.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/shadow_cache_helpers.ts#L35) và [`time_of_day_lighting.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/time_of_day_lighting.tsx#L273) lên **800ms**.
  - Bao phủ trọn vẹn $580\text{ms}$ của VFX.
  - Dành thêm $+220\text{ms}$ biên độ an toàn (safety margin) để bảo đảm mô hình nhà đã tiếp đất vững chắc ở tọa độ $y = 0$ và bụi khói tan hết trước khi đóng băng bóng đổ.

---

## 3. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-364.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-364.md) | Thẩm định kế hoạch đạt 0 defects, giải tỏa 6 điểm mù kiến trúc. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/client/imp364_static_shadow_caching.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp364_static_shadow_caching.test.ts) | 17 atomic tests, 33 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/chaos_sentinel_IMP-364.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-364.json) | 4 production files modified, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.0: Dual-Viewport** | Puppeteer Headless Probe | Desktop (1280x800) [`imp-364_desktop.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-364_desktop.jpg) & Mobile (360x740) [`imp-364_mobile_360.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-364_mobile_360.jpg) | **CAPTURED** 📸 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-364.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-364.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-3d` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-364.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-364.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 1.94 | **APPROVED** 🛡️ |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 20/20 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 4. CHI TIẾT BẰNG CHỨNG TRẠM 1 ĐẾN TRẠM 4

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/client/imp364_static_shadow_caching.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp364_static_shadow_caching.test.ts)
- **Chỉ số kiểm thử**: **17 atomic tests**, **33 asserts** (mật độ trung bình: 1.94 asserts/test, 0 vòng lặp).
- **Phân loại kiểm thử**:
  - `TC-364.01 - TC-364.05`: Kiểm tra các cờ chuyển động xúc xắc, quân cờ, nhà xây, mặt trời.
  - `TC-364.06 - TC-364.07`: Kiểm tra khoảng cách vector chuyển động của mặt trời (ngưỡng $10^{-4}$).
  - `TC-364.08 - TC-364.10`: Kiểm tra cửa sổ gia hạn (Grace Period) 800ms và bảo vệ biên không âm / NaN.
  - `TC-364.11 - TC-364.13`: Kiểm tra đóng/bật cờ `autoUpdate` và `needsUpdate` trên Three.js DirectionalLight.
  - `TC-364.14 - TC-364.16`: Kiểm tra tích hợp trực tiếp component `updateLightingShadowCache` và JSX markup.

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi**:
  - [`src/client/3d/diorama/diorama_railroad.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_railroad.tsx)
  - [`src/client/3d/diorama/diorama_traffic.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_traffic.tsx)
  - [`src/client/3d/time_of_day_lighting.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/time_of_day_lighting.tsx)
  - [`src/client/3d/shadow_cache_helpers.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/shadow_cache_helpers.ts)
- **Chuyển trạng thái**: Toàn bộ **17/17 contract tests chuyển sang GREEN**.
- **Living Test Suites**: Bảo toàn nguyên vẹn, zero hồi quy logic hiện hành.

### Trạm 2.5: Fast Pre-Filter Mechanical Sweep (`scout` / `fast_prefilter.mjs`)
- **TypeScript**: `tsc --noEmit` vượt qua với 0 lỗi (Exit Code 0).
- **Dirty Casts**: Tuyệt đối không sử dụng `as any` hoặc dirty type casting.
- **LOC Ceilings**: Tất cả các tệp đều nằm trong hạn mức trần của từng phân hệ (Tier 1 <= 400, Tier 2 <= 500, Tier 3 <= 800, Test <= 600).

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
1. **Spec & Scope Gatekeeper (`spec-reviewer`)**:
    - **Phán quyết**: **APPROVED** 📋 ([`.agents/audit/SPEC_REVIEW_IMP-364.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-364.md))
    - **Xác nhận phạm vi**: 100% các thay đổi nằm trong phân hệ mục tiêu (`client-3d`), zero scope creep.
2. **Deep Architecture & Anti-Slop Auditor (`code-reviewer`)**:
    - **Phán quyết**: **APPROVED** 🛡️ ([`.agents/audit/CODE_REVIEW_IMP-364.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-364.md))
    - **Chỉ số Anti-Slop**: 0 violations trên 6 cờ cảnh báo (Deep modules, Zero pass-through wrappers, Zero TIDD).
    - **Bộ nhớ & Timer**: Không rò rỉ listener, không bỏ sót timer cleanup, an toàn đa luồng/bất đồng bộ.

### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: **20/20 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived)**:
  - 8 mutants mức AST mã nguồn (bao gồm mutant bảo vệ hàm nối component `updateLightingShadowCache` trong `time_of_day_lighting.tsx`).
  - 12 mutants đảo ngược hợp đồng (Contract inversion probes).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs` với 0 defects.

---

## 5. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### Phạm Vi Trực Tiếp Của Ticket IMP-364 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `diorama_railroad.tsx` | [`src/client/3d/diorama/diorama_railroad.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_railroad.tsx) | Tier 2 (UI/3D/Views) | **377 LOC** | 377 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `diorama_traffic.tsx` | [`src/client/3d/diorama/diorama_traffic.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_traffic.tsx) | Tier 2 (UI/3D/Views) | **264 LOC** | 264 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `time_of_day_lighting.tsx` | [`src/client/3d/time_of_day_lighting.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/time_of_day_lighting.tsx) | Tier 2 (UI/3D/Views) | **400 LOC** | 400 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `shadow_cache_helpers.ts` | [`src/client/3d/shadow_cache_helpers.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/shadow_cache_helpers.ts) | Tier 1 (Domain/Helper) | **61 LOC** | 61 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `imp364_static_shadow_caching.test.ts` | [`tests/client/imp364_static_shadow_caching.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp364_static_shadow_caching.test.ts) | Living Test | **192 LOC** | 192 Lines | <= 600 LOC | ✅ Đạt chuẩn |

---

## 6. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

- **Tính toàn vẹn hệ thống**: Gói cải tiến hoàn thành theo đúng nguyên tắc Zero-Blindness, cung cấp đầy đủ bằng chứng vật lý từ mã nguồn, kiểm thử tích hợp, kiểm toán đột biến Chaos Sentinel, hình ảnh trực quan Dual-Viewport đến biên bản kiểm toán độc lập không có bản mẫu rập khuôn (0 boilerplate).
- **Sẵn sàng triển khai**: Mã nguồn đã sẵn sàng đóng gói và triển khai lên môi trường sản phẩm.
