# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-368
## Plan IMP-368: Go Salary Multi-Deduction Narrative Transparency (Ticket IMP-368)

> **Mã Ticket:** `IMP-368`  
> **Phân hệ thực tế:** `client-events` / `client-ui`  
> **Ngày hoàn thành:** 2026-10-11  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

Gói cải tiến **IMP-368** (`client-ui` / `client-events`) giải quyết trực tiếp điểm mù hiển thị dòng tiền gây hiểu lầm nghiêm trọng khi người chơi vượt qua hoặc dừng tại ô Khởi Hành (GO) (ghi nhận thực tế từ ảnh chụp UAT `media_1791734771492_2e88de2f.png`).

### 1.1. Hiện tượng thực tế & Nghịch lý số học trên giao diện
- **Tình huống UAT**: Tại **Vòng 21/40**, người chơi `Breezy Badger` sau khi gieo xúc xắc 4 + 3 = 7 đã đáp xuống đúng ô Khởi Hành (GO). Nhật ký ván đấu hiển thị:
  > `Breezy Badger nhận lương vượt GO 1.500 (khấu trừ thuế: 1.000)   +425`
- **Nghịch lý nhận thức**:
  - Người chơi thắc mắc tại sao $1.500 - 1.000 = 500$ mà tài khoản lại chỉ được cộng **+425 Tr.** (thiếu mất 75 Tr.).
  - Điều này tạo cảm giác hệ thống game bị lỗi tính toán số học cơ bản hoặc âm thầm trừ tiền người chơi không rõ lý do.

### 1.2. Bản chất kỹ thuật & Điểm mù hiển thị
- **Thực tế tính toán**:
  1. Lương Khởi Hành gốc ở Vòng 21 giảm từ 2.000 xuống **1.500 Tr.** theo chu kỳ điều tiết vĩ mô (`src/domain/room.ts#L19`).
  2. Thuế tài sản qua GO chạm trần **-1.000 Tr.** (`GO_PROPERTY_TAX_CAP`).
  3. Người chơi đang có dư nợ thế chấp 1.500 Tr. (thế chấp ô đất giá 3.000 Tr.), nên hệ thống tự động trích thu 5% lãi vay định kỳ nộp về Kho Bạc: $1.500 \times 5\% = \mathbf{75\text{ Tr.}}$ (`src/domain/mortgage_constants.ts`).
  4. Số tiền thực nhận: $1.500 - 1.000 - 75 = \mathbf{+425\text{ Tr.}}$ (hoàn toàn chính xác).
- **Điểm mù**: Cả `activity_log_subscriber.ts` và `badge_event_subscriber.ts` trước đây đều hardcode mẫu chuỗi chỉ kiểm tra `event.taxDeduction > 0`, hoàn toàn bỏ quên mảng `event.deductions` vốn đã chứa đầy đủ `mortgageInterest`, `overdraft`, `creditFee`.
- **Giải pháp**: Bóc tách toàn diện `event.deductions` để biểu diễn tường minh mọi khoản trích trừ trung gian trên cả Activity Log (`(khấu trừ: thuế 1.000, lãi thế chấp 75)`) và Floating Badge Formula (`Hoàn thành 1 vòng sa bàn (+1.500 Tr.) (thuế: -1.000, lãi thế chấp: -75)`), bảo đảm tính nhất quán toán học trực quan (Visual Arithmetic Consistency).

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `audit_plan.mjs --auto-sign` (Máy duyệt)<br>[`.agents/audit/PLAN_AUDIT_IMP-368.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-368.md) | Thẩm định kế hoạch đạt 0 defects, 5 contract tests clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/contracts/imp368_go_salary_deductions_transparency.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp368_go_salary_deductions_transparency.test.ts) | 5 atomic tests, 16 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/imp-368_snapshot.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp-368_snapshot.json) | 2 production files modified, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-368.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-368.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-events` / `client-ui` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-368.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-368.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 3.20 | **APPROVED** 🛡️ |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | Bảo toàn tính toàn vẹn snapshot kiểm thử và số dòng LOC vật lý trên đĩa (Zero-Memorization). | **SNAPSHOT VERIFIED 📋** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Kế Hoạch Tự Động (`audit_plan.mjs --auto-sign`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Thẩm định kế hoạch đạt 0 defects, 5 contract tests clean.
- **Lưu ý quy trình**: Kế hoạch được thẩm định cơ học bằng `audit_plan.mjs --auto-sign`. Chưa kích hoạt vòng phản biện đối kháng chuyên sâu từ subagent `adversarial-challenger`.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/contracts/imp368_go_salary_deductions_transparency.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp368_go_salary_deductions_transparency.test.ts)
- **Chỉ số kiểm thử**: **5 atomic tests**, **16 asserts** (mật độ trung bình: 3.20 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (Thất bại do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.


### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi**:
  - [`src/client/events/subscribers/activity_log_subscriber.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/activity_log_subscriber.ts)
  - [`src/client/events/subscribers/badge_event_subscriber.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/badge_event_subscriber.ts)
- **Chuyển trạng thái**: Toàn bộ **5/5 contract tests chuyển sang GREEN**.
- **Living Test Suites**: Bảo toàn nguyên vẹn, zero hồi quy logic hiện hành.

### Trạm 2.5: Fast Pre-Filter Mechanical Sweep (`scout` / `fast_prefilter.mjs`)
- **TypeScript**: `tsc --noEmit` vượt qua với 0 lỗi (Exit Code 0).
- **Dirty Casts**: Tuyệt đối không sử dụng `as any` hoặc dirty type casting.
- **LOC Ceilings**: Tất cả các tệp đều nằm trong hạn mức trần của từng phân hệ (Tier 1 <= 400, Tier 2 <= 500, Tier 3 <= 800, Test <= 600).

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
1. **Spec & Scope Gatekeeper (`spec-reviewer`)**:
    - **Phán quyết**: **APPROVED** 📋
    - **Xác nhận phạm vi**: 100% các thay đổi nằm trong phân hệ mục tiêu (`client-events` / `client-ui`), zero scope creep.
2. **Deep Architecture & Anti-Slop Auditor (`code-reviewer`)**:
    - **Phán quyết**: **APPROVED** 🛡️
    - **Chỉ số Anti-Slop**: 0 violations trên 6 cờ cảnh báo (Deep modules, Zero pass-through wrappers, Zero TIDD).
    - **Bộ nhớ & Timer**: Không rò rỉ listener, không bỏ sót timer cleanup, an toàn đa luồng/bất đồng bộ.


### Trạm 4: Kiểm Soát Tính Toàn Vẹn & Snapshot Bất Biến (`chaos-sentinel`)
- **Phán quyết**: **SNAPSHOT VERIFIED 📋**
- **Hiệu quả kiểm soát**: Bảo toàn tính toàn vẹn snapshot kiểm thử và số dòng LOC vật lý trên đĩa (Zero-Memorization).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-368 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `activity_log_subscriber.ts` | [`src/client/events/subscribers/activity_log_subscriber.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/activity_log_subscriber.ts) | Tier 1 (Domain/Server/Logic) | **353 LOC** | 384 Lines | <= 400 LOC | ⚠️ Warning (384 > 300) |
| `badge_event_subscriber.ts` | [`src/client/events/subscribers/badge_event_subscriber.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/badge_event_subscriber.ts) | Tier 1 (Domain/Server/Logic) | **244 LOC** | 270 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `imp368_go_salary_deductions_transparency.test.ts` | [`tests/contracts/imp368_go_salary_deductions_transparency.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp368_go_salary_deductions_transparency.test.ts) | Living Test | **172 LOC** | 173 Lines | <= 600 LOC | ✅ Đạt chuẩn |

---

## 5. ĐÁNH GIÁ VẬN HÀNH & HIỆU QUẢ TRẢI NGHIỆM NGƯỜI CHƠI

- **Minh bạch hóa dòng tiền thực tế**: Loại bỏ triệt để hiểu lầm "mất tiền vô cớ" hoặc "phép trừ sai số học" tại ô Khởi Hành (GO). Người chơi nhận diện rõ ràng vì sao số tiền thực nhận là +425 Tr. qua công thức trực quan: Lương điều tiết Vòng 21 (+1.500) trừ Thuế tài sản (-1.000) và trừ Lãi vay thế chấp (-75).
- **Nhất quán đa kênh hiển thị (Dual-Channel Consistency)**: Cả nhật ký ván đấu (Activity Log) và huy hiệu nổi (Floating Badge) đều bóc tách đầy đủ 4 danh mục khấu trừ (`thuế`, `lãi thế chấp`, `thấu chi`, `phí thẻ`), đồng thời bảo vệ ngữ nghĩa ngữ pháp (tự động ẩn ngoặc đơn khi không phát sinh khấu trừ).
- **Bảo toàn hiệu năng hiển thị**: Các hàm format mảng cục bộ sử dụng phép kiểm tra số học thuần túy (`> 0`), không tạo closure thừa, không sinh rác bộ nhớ trên mỗi tick sự kiện.

### 5.1. Giới Hạn Biên Kiểm Thử & Rủi Ro Hiển Thị Mobile (Edge-Case Boundary Limitation)
- **Kịch bản 4 khoản khấu trừ đồng thời**: Bộ test hợp đồng hiện tại bao phủ các kịch bản 0, 1, và 2 khoản khấu trừ đồng thời (TC-368.01 đến TC-368.05). Trong tình huống cực hạn khi người chơi đồng thời chịu cả 4 nghĩa vụ tài chính (thuế tài sản, lãi vay thế chấp, phí thấu chi, phí thẻ tín dụng), chuỗi công thức nổi có thể dài tới 97 ký tự (`Hoàn thành 1 vòng sa bàn (+2.000 Tr.) (thuế: -1.000, lãi thế chấp: -150, thấu chi: -3.300, phí thẻ: -400)`).
- **Thích ứng màn hình nhỏ (Mobile 360px)**: Floating text container đã kích hoạt `break-words` và `max-w-[85vw]` để tự động co dãn, tuy nhiên chuỗi sẽ chiếm 3-4 dòng hiển thị. Cần tiếp tục theo dõi thực tế trên thiết bị di động để tối ưu rút gọn tên nhãn nếu có phản hồi che khuất bàn cờ 3D.

### 5.2. Sổ Theo Dõi Nợ Kỹ Thuật (Tech Debt Watch)
- ⚠️ **Cảnh báo trần LOC Tier 1 (Domain/Server/Logic)** [`DEBT-ACTIVITY-LOG-SUBMODULE`]: Tệp [`src/client/events/subscribers/activity_log_subscriber.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/activity_log_subscriber.ts) hiện đạt **353 SLOC / 384 dòng vật lý** (khoảng cách an toàn chỉ còn 16 dòng trước trần 400 LOC). Các ticket tiếp theo nếu bổ sung narrative sự kiện mới bắt buộc phải trích xuất helper định dạng chuỗi thành module vệ tinh độc lập (`activity_log_formatters.ts`) trước khi viết thêm code.
- ⚠️ **Cảnh báo trùng lặp logic định dạng khấu trừ** [`DEBT-GO-DEDUCTION-HELPER`]: Logic bóc tách 4 trường `propertyTax`, `mortgageInterest`, `overdraft`, `creditFee` hiện đang phân tách độc lập giữa `activity_log_subscriber.ts` và `badge_event_subscriber.ts` (gây chênh lệch nhẹ về quy ước dấu âm và dấu hai chấm giữa văn bản nhật ký và công thức toán học). Cần trích xuất thành helper dùng chung (`go_salary_deductions_formatter.ts`) trong đợt refactor kế tiếp để tiết kiệm ~20 dòng mã và đồng bộ triệt để kiểu trình bày.



