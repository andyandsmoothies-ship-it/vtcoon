# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-447
## PLAN: IMP-447 Proportional Transit Wheel & Tactile Modal Polish

> **Mã Ticket:** `IMP-447`  
> **Phân hệ thực tế:** `client-ui` (100% Client UI & SVG Visuals, 0 LOC Domain Mutation)  
> **Ngày hoàn thành:** 2026-10-19  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

Trước đây, giao diện modal "Vòng Xoay Vận Tải" (`TransitWheelModal`) chia đều 5 nan quạt thành các cung tròn bằng nhau ($72^\circ$ mỗi nan), dù xác suất thực tế được cấu hình trong luật chơi phân bổ rất chênh lệch ($35\%$ Tốc Hành, $20\%$ Hồi Hương, $20\%$ Hoàn Tiền, $10\%$ Quá Cảnh, $15\%$ Hoãn Chuyến). Thiết kế này tạo ra cảm giác đánh lừa thị giác (Visual Deceit) khi ô xác suất thấp $10\%$ nhìn lớn tương đương ô $35\%$. Bên cạnh đó, modal tồn tại 4 khiếm khuyết đồ họa và công thái học:
1. Chữ trên nửa vòng xoay bị lộn ngược $180^\circ$ khi bánh xe dừng ở vị trí trúng thưởng tại đỉnh 12h.
2. Kim chỉ hướng lơ lửng bên ngoài vành bánh xe ($0.4\text{px}$ hở), thiếu tính liên kết cơ học.
3. Khi chia tỉ lệ, nan quạt $10\%$ chỉ rộng $36^\circ$ khiến chữ và icon có nguy cơ va chạm đè lên vạch phân cách.
4. Trục xoay bị rung lắc ($7.07\text{px}$ wobble) trên trình duyệt WebKit/Safari do cơ chế tính `transform-origin` rơi về `fill-box`.

Ticket IMP-447 đã giải quyết triệt để các vấn đề trên thông qua việc tách View-Model seam `transit_wheel_visuals.ts`, dựng nan quạt tỉ lệ chính xác $3.6^\circ$ cho mỗi $1\%$ xác suất, bố cục typography xuyên tâm kiểu Casino với nhánh xử lý nan quạt hẹp, neo trong suốt cố định trục xoay WebKit, và nâng cấp nút bấm quay đạt chuẩn xúc giác 48px.

> [!NOTE] **Thừa Nhận Đánh Đổi Thị Giác (Intentional Visual Trade-off)**  
> Việc loại bỏ hoàn toàn cờ `isFlipped` để áp dụng chuẩn Casino Roulette Radial Typography đảm bảo ô chiến thắng khi dừng ở đỉnh 12h luôn luôn thẳng đứng, dễ đọc $100\%$. Đổi lại, ở trạng thái tĩnh ban đầu (trước khi quay), các nan ở nửa dưới bánh xe (như ô Hoàn Tiền $234^\circ$, Bay Quá Cảnh $288^\circ$) sẽ có hướng chữ xoay ngược theo nan quạt so với mắt người đọc tĩnh. Đây là sự đánh đổi có chủ đích theo chuẩn Casino quốc tế, ưu tiên tuyệt đối trải nghiệm đọc kết quả chiến thắng khi dừng quay.

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-447.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-447.md) | Thẩm định kế hoạch đạt 0 defects, 7 contract tests clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/contracts/imp447_proportional_transit_wheel_and_tactile_modal.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp447_proportional_transit_wheel_and_tactile_modal.test.ts) | 18 atomic tests, 48 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/imp-447_snapshot.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp-447_snapshot.json) | 2 production files modified (`src/domain/transit_wheel.ts` cách ly 0 dòng sửa), 100% tests GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.0: Dual-Viewport** | Puppeteer Headless Probe | Desktop (1280x800) [`imp-447_desktop.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-447_desktop.jpg) & Mobile (360x740) [`imp-447_mobile_360.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-447_mobile_360.jpg) | **CAPTURED** 📸 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-447.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-447.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-ui` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-447.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-447.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 2.67 | **APPROVED** 🛡️ |
| **Trạm 3.2: 2D Modal & Tactile Craft** | `game-3d-visual-critic`<br>[`.agents/audit/3D_VISUAL_REVIEW_IMP-447.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/3D_VISUAL_REVIEW_IMP-447.md) | Đo đạc hình học nan SVG, chống rung WebKit, kim chỉ hướng cắm vành, nút bấm 48px | **8.9 / 10 (Tactile Craft AAA) 🎨** |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 26/26 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Thẩm định kế hoạch đạt 0 defects, 7 contract tests clean.
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa**:
  - **[ADV-OBJ] Objective Validity**
    - **Target reachable?**: Yes — `TransitWheelModal` is mounted in [modal_host.tsx#L136](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/modal_host.tsx#L136) when `activeModal === 'transit_wheel'`. It actively renders upon arrival of `pendingTransitWheel` when pawns land on infrastructure transit stations (cells 5, 15, 25, 35) as verified in [imp279_presentation_staging_and_transit_wheel_sync.test.ts#L130-L220](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp279_presentation_staging_and_transit_wheel_sync.test.ts#L130-L220).
    - **Baselines verified?**: Yes — All physical facts and numbers are verified against physical disk:
      - Outcome probabilities ($35\%, 20\%, 20\%, 10\%, 15\%$) sum to $100\%$: [transit_wheel.ts#L20-L66](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/transit_wheel.ts#L20-L66).
      - Baseline equal-arc division ($72^\circ$ each, $360^\circ / 5$): [transit_wheel_modal.tsx#L116,L124](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/transit_wheel_modal.tsx#L116-L124).
      - Static inversion bug on half-wheel (`midDeg > 90 && midDeg < 270` causing upside-down winning halt): [transit_wheel_modal.tsx#L125,L138,L153](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/transit_wheel_modal.tsx#L125-L153).
      - Needle tip floating outside wheel rim: container is `w-64 h-64` ($256\text{px}$), SVG `viewBox="0 0 200 200"`. Disk top is at SVG $Y=5$ ($6.4\text{px}$ container). Baseline needle `-top-3` ($-12\text{px}$) with $18\text{px}$ height ends at $+6.0\text{px}$, leaving a $0.4\text{px}$ gap before touching the rim: [transit_wheel_modal.tsx#L102](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/transit_wheel_modal.tsx#L102).
      - Narrow sector collision ($10\% = 36^\circ$): chord length at $r=36\text{px}$ is $2 \times 36 \times \sin(18^\circ) = 22.25\text{px}$. Baseline font size $12$ for `"10%"` ($21.6\text{px}$) collided directly with $2\text{px}$ border strokes: [transit_wheel_modal.tsx#L123,L148](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/transit_wheel_modal.tsx#L123-L148).
    - **Verdict**: PASS.
  - **[ADV-01] WebKit / Safari Transform-Origin Wobble in Fill-Box Fallback**
    - **Scenario**: Khi SVG xoay trên WebKit/Safari rơi về `fill-box`, `transform-origin: 100px 100px` bị tính lệch từ biên `(5, 5)`, dẫn đến tâm xoay bị dời về `(105, 105)` tạo ra độ đảo trục $7.07\text{px}$.
    - **Hardening Directive**: Thêm neo tròn vô hình `<circle cx="100" cy="100" r="95" fill="transparent" stroke="transparent" strokeWidth="1" pointerEvents="none" />` và đặt `transformOrigin: 'center'` (hoặc `50% 50%`) để triệt tiêu hoàn toàn rung lắc trục xoay trên mọi trình duyệt.
  - **[ADV-02] Degenerate Collapsed Sector Ghost Text Collision**
    - **Scenario**: Khi nan quạt có trọng số $0\%$ hoặc underflow ($\text{spanDeg} \le 0.01^\circ$), nếu component JSX duyệt qua mảng sectors mà không kiểm tra cờ thu gọn thì icon và chữ $0\%$ sẽ bị in đè trực tiếp lên vạch ngăn cách giữa các nan bên cạnh.
    - **Hardening Directive**: Trong `transit_wheel_visuals.ts`, đánh dấu `isCollapsed = spanDeg <= 0.01` và `pathData = ''`. Tại JSX `transit_wheel_modal.tsx`, thêm guard `{sectors.map((s) => s.isCollapsed || !s.pathData ? null : (...))}` để loại bỏ hoàn toàn text rác khỏi DOM.
  - **[ADV-03] Living Contract Regression on getTransitWheelDismissText**
    - **Scenario**: Tệp `transit_wheel_modal.tsx` xuất khẩu hàm thuần túy `getTransitWheelDismissText`, đang được bài kiểm thử sống `imp249` trực tiếp import và assert. Nếu vô tình xóa hoặc đổi tên hàm này, bài kiểm thử sống sẽ bị gãy vỡ.
    - **Hardening Directive**: Cách ly tuyệt đối `src/domain/transit_wheel.ts` (0 LOC changed trên Git), đồng thời bảo toàn nguyên vẹn hàm xuất khẩu `getTransitWheelDismissText` trong `transit_wheel_modal.tsx` để bảo đảm 100% kiểm thử tiền nhiệm xanh.
  - **[ADV-04] View-Model DTO Property Pass-Through Omission**
    - **Scenario**: Giao diện DTO ban đầu thiếu `color` và `icon`, buộc JSX phải tra cứu ngược mảng `TRANSIT_WHEEL_CONFIGS` song song, gây phụ thuộc lỏng lẻo và vi phạm View-Model Seam.
    - **Hardening Directive**: Đưa trực tiếp `color: string` và `icon: string` vào giao diện `TransitWheelSectorAngle` trong `transit_wheel_visuals.ts`, giúp JSX tiêu thụ trực tiếp không cần tra cứu mảng kép.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/contracts/imp447_proportional_transit_wheel_and_tactile_modal.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp447_proportional_transit_wheel_and_tactile_modal.test.ts)
- **Chỉ số kiểm thử**: **18 atomic tests**, **48 asserts** (mật độ trung bình: 2.67 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (Thất bại do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.
  - **Bằng chứng thất bại**:
```text
AssertionError: expected 'transform: rotate(2124deg); transform-origin: 100px 100px; transform-box: view-box;' to contain 'rotate(2097deg)'
at tests/contracts/imp447_proportional_transit_wheel_and_tactile_modal.test.ts:184:25
```

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi thực tế trên Git (Physical Git Scope)**:
  - [`src/client/ui/modals/transit_wheel_visuals.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/transit_wheel_visuals.ts) *(Tạo mới: 113 LOC)*
  - [`src/client/ui/modals/transit_wheel_modal.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/transit_wheel_modal.tsx) *(Chỉnh sửa: 232 LOC)*
- **Tệp cách ly bảo toàn (Quarantined - 0 LOC modified)**:
  - [`src/domain/transit_wheel.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/transit_wheel.ts) *(Giữ nguyên vẹn 134 LOC, 0 dòng thay đổi)*
- **Chuyển trạng thái**: Toàn bộ **18/18 contract tests chuyển sang GREEN**.
- **Living Test Suites**: Bảo toàn nguyên vẹn 136/136 living tests xanh, zero hồi quy.

### Trạm 2.5: Fast Pre-Filter Mechanical Sweep (`scout` / `fast_prefilter.mjs`)
- **TypeScript**: `tsc --noEmit` vượt qua với 0 lỗi (Exit Code 0).
- **Dirty Casts**: Tuyệt đối không sử dụng `as any` hoặc dirty type casting.
- **LOC Ceilings**: Tất cả các tệp đều nằm trong hạn mức trần của từng phân hệ (Tier 2 <= 500, Test <= 600).

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
1. **Spec & Scope Gatekeeper (`spec-reviewer`)**:
   - **Phán quyết**: **APPROVED** 📋
   - **Xác nhận phạm vi**: 100% các thay đổi nằm trong phân hệ mục tiêu (`client-ui`), zero scope creep.
2. **Deep Architecture & Anti-Slop Auditor (`code-reviewer`)**:
   - **Phán quyết**: **APPROVED** 🛡️
   - **Chỉ số Anti-Slop**: 0 violations trên 6 cờ cảnh báo (Deep modules, Zero pass-through wrappers, Zero TIDD).
   - **Bộ nhớ & Timer**: Không rò rỉ listener, không bỏ sót timer cleanup, an toàn bất đồng bộ.
3. **Thẩm Định Độ Tinh Xảo Modal 2D & Công Thái Học (`game-3d-visual-critic`)**:
   - **Phán quyết**: **8.9 / 10 (Tactile Craft AAA Verified) 🎨**
   - **Hình học nan quạt lượng giác**: Phân bổ góc quạt chính xác 1:1 theo trọng số ($126^\circ, 72^\circ, 72^\circ, 36^\circ, 54^\circ$). Ô $35\%$ chiếm ưu thế trực quan rõ rệt.
   - **Trục xoay & Neo WebKit**: Neo trong suốt $190 \times 190\text{px}$ và `transformOrigin: 'center'` triệt tiêu hoàn toàn rung lắc trên cả Desktop và Mobile.
   - **Kim chỉ hướng (Needle)**: Tam giác vàng kim cắm sâu $5.6\text{px}$ vào vành ngoài, định vị chính xác góc $12\text{h}$ chiến thắng.
   - **Nút bấm xúc giác**: Đạt chuẩn chiều cao $48\text{px}$ (vượt sàn $44\text{px}$), đổ bóng nổi $4\text{px}$ và hiệu ứng lún khi bấm.
   - **Tương thích Mobile 360px**: Vừa vặn hoàn hảo trong khung hình $360 \times 740\text{px}$, khoảng đệm lề trái/phải đối xứng $\approx 16\text{px}$, không phát sinh thanh cuộn.

### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: 26/26 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Sửa Đổi Trực Tiếp Của Ticket IMP-447 (Direct Git Scope)

| Tệp Mã Nguồn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Ngân Sách Trần | Trạng Thái |
| :--- | :---: | :---: | :---: | :---: |
| [`transit_wheel_visuals.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/transit_wheel_visuals.ts) | Tier 2 (UI/3D/Views) | **102 SLOC** (113 L) | <= 500 LOC | ✅ Đạt chuẩn |
| [`transit_wheel_modal.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/transit_wheel_modal.tsx) | Tier 2 (UI/3D/Views) | **215 SLOC** (232 L) | <= 500 LOC | ✅ Đạt chuẩn |
| [`imp447_proportional_transit_wheel_and_tactile_modal.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp447_proportional_transit_wheel_and_tactile_modal.test.ts) | Living Test | **238 SLOC** (266 L) | <= 600 LOC | ✅ Đạt chuẩn |
| **Tổng Cộng (Production Code)** | `client-ui` | **317 SLOC** (345 L) | <= 500 LOC | ✅ Đạt chuẩn |

> [!NOTE] **Ghi Chú Về Tệp Phân Hệ Domain**  
> Tệp `src/domain/transit_wheel.ts` **hoàn toàn không bị sửa đổi** (0 LOC changed trên Git diff). Tệp này được cách ly có chủ đích theo chỉ thị ADV-05 để bảo toàn các bài kiểm thử hồi quy tiền nhiệm.

### 4.2. Danh Mục Tệp Quy Trình & Bằng Chứng (Harness & Evidence Scope)

| Tệp Quy Trình / Bằng Chứng | Phân Loại / Vai Trò | Trạng Thái |
| :--- | :--- | :---: |
| [`3D_VISUAL_REVIEW_IMP-447.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/3D_VISUAL_REVIEW_IMP-447.md) | Biên bản kiểm toán thị giác độc lập | ✅ Đã xác minh |
| [`CODE_REVIEW_IMP-447.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-447.md) | Biên bản kiểm toán kiến trúc & anti-slop | ✅ Đã xác minh |
| [`PLAN_AUDIT_IMP-447.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-447.md) | Biên bản kiểm toán kế hoạch kỹ thuật | ✅ Đã xác minh |
| [`PLAN_CHALLENGE_IMP-447.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_CHALLENGE_IMP-447.md) | Biên bản phản biện đối kháng (Hardened) | ✅ Đã xác minh |
| [`SPEC_REVIEW_IMP-447.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-447.md) | Biên bản kiểm soát phạm vi & đặc tả | ✅ Đã xác minh |
| [`IMP-447.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/sentinel_probes/IMP-447.json) | Đặc tả 8 đột biến Chaos Sentinel | ✅ Đã xác minh |
| [`bounding_box_imp-447_desktop.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/bounding_box_imp-447_desktop.json) | Bằng chứng telemetry layout Desktop | ✅ Đã xác minh |
| [`bounding_box_imp-447_mobile.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/bounding_box_imp-447_mobile.json) | Bằng chứng telemetry layout Mobile | ✅ Đã xác minh |
| [`camera_telemetry_imp-447_desktop.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/camera_telemetry_imp-447_desktop.json) | Bằng chứng camera Desktop | ✅ Đã xác minh |
| [`camera_telemetry_imp-447_mobile.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/camera_telemetry_imp-447_mobile.json) | Bằng chứng camera Mobile | ✅ Đã xác minh |
| [`chaos_sentinel_IMP-447.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-447.json) | Bằng chứng tiêu diệt 26 mutants | ✅ Đã xác minh |
| [`imp-447_snapshot.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp-447_snapshot.json) | Snapshot mã nguồn & kiểm thử vật lý | ✅ Đã xác minh |
| [`station1_IMP-447.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/station1_IMP-447.json) | Khóa SHA-256 chống can thiệp kiểm thử | ✅ Đã xác minh |

---

## 5. LƯU Ý KỸ THUẬT & HƯỚNG DẪN KẾ THỪA (TECHNICAL GOTCHAS)

1. **Ranh Giới Phỏng Đoán Nan Hẹp (`isNarrow = spanDeg < 45`)**:
   - Hiện tại, ngưỡng $45^\circ$ khớp hoàn hảo với bộ số kinh tế hiện hành: ô $10\%$ ($36^\circ < 45^\circ$) được thu gọn nhãn (font 10px, icon 16px), trong khi ô $15\%$ ($54^\circ \ge 45^\circ$) nhận cỡ chuẩn (font 12px, icon 22px).
   - Tại cung $54^\circ$, bề rộng dây cung ở bán kính đặt chữ ($r=44\text{px}$) là $\approx 41.4\text{px}$, chỉ còn khoảng trống đệm an toàn $< 6\text{px}$ cho tổ hợp icon $22\text{px}$ + chữ $22.5\text{px}$.
   - **Chỉ thị cho các kỹ sư tương lai**: Nếu cấu hình kinh tế của game bổ sung các cung thưởng trong khoảng $12\% - 14\%$ ($43^\circ - 50^\circ$), cần nâng cấp hàm bố cục sang công thức nội suy động theo độ rộng cung dây cung: $\text{chordWidth} = 2 \cdot r \cdot \sin(\text{spanDeg} \cdot \pi / 360)$ thay vì dựa vào hằng số ngưỡng cứng $45^\circ$.

2. **Quy Tắc Quản Trị Modal 2D Khỏi Phân Hệ 3D**:
   - Các vé cải tiến giao diện 2D HTML/SVG Modal không được tính điểm dựa trên các tiêu chí PBR hay camera 3D diorama để tránh bóp méo phạm vi kiểm toán. Tiêu chuẩn đánh giá phải tập trung vào: độ chuẩn xác hình học SVG, khả năng co giãn viewport, độ nhạy xúc giác, và tính tương thích trình duyệt (WebKit/Safari).
