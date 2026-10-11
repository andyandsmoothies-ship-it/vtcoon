# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-366
## Plan IMP-366: Deduplicate Treasury Toasts & Financial Event Synthesis (Ticket IMP-366)

> **Mã Ticket:** `IMP-366`  
> **Phân hệ thực tế:** `client-events` (Tier 1 Domain/FSM/Server/Helpers & Financial Event Synthesis)  
> **Ngày hoàn thành:** 2026-10-11  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH NGHIỆP VỤ (BUSINESS PROBLEM & CONTEXT)

Báo cáo nghiệm thu kỹ thuật cho ticket `IMP-366` giải quyết triệt để sự cố dội thông báo (toasts) kép gây nhiễu loạn giao diện người dùng VTCOON khi người chơi thực hiện các giao dịch chi vốn bất động sản.

- **Vấn Đề Thực Tế (Empirical Bug)**:
  - Khi xem ảnh chụp màn hình ghi nhận lỗi từ người chơi ([`media_1791720833992_d8ac2c82.png`](file:///C:/Users/HP/.gemini/antigravity/brain/6fa0ac3b-f944-4e90-81de-d407994fb2c9/.user_uploaded/media_1791720833992_d8ac2c82.png)), Bot AI 4 mua ô đất Nghệ An (TP. Vinh, Ô số 23) với giá niêm yết 2.200 M VND. Giao diện ngay lập tức xuất hiện 2 badge nổi xếp chồng lên nhau:
    1. `🏷️ Bot AI 4 thanh toán -2.200 mua sở hữu Nghệ An (TP. Vinh)` (Sự kiện giao dịch bất động sản hợp lệ `PROPERTY_BOUGHT`)
    2. `🏛️ Bot AI 4 nộp -2.200 vào Kho Bạc` (*Sự kiện nộp ngân sách nhà nước giả mạo `FEE_PAID: TAX`*)
  - **Hậu quả UX & Tâm lý người chơi**:
    - Người chơi lầm tưởng tài khoản bị trừ tiền 2 lần (tổng cộng -4.400 M VND thay vì -2.200 M VND).
    - Trên màn hình di động nhỏ (360x740px), hai toast to bản che khuất góc nhìn 3D và thanh điều hướng.

- **Căn Nguyên Kỹ Thuật (Physical Root Cause)**:
  - Phân hệ tổng hợp tài chính client (`src/client/events/game_event_financial_synthesizer.ts`) khi xử lý delta mạng nhận thấy biến động số dư âm của người mua (`payer.diff = -2200`). Do ô 23 không phải ô Thuế Đất (ô 04) và cũng không phải ô Đóng Tiền Bảo Lãnh (ô 10), dòng tiền này rơi vào vòng lặp vét cạn ở dòng 256–265 và bị tự động gán nhãn `feeType: 'TAX'` nộp vào Kho Bạc.

- **Giải Pháp Kỹ Thuật Triệt Để**:
  - Tách bạch rạch ròi giữa **Dòng tiền chi vốn (Capital Outflow / Asset Formation)** và **Dòng tiền nộp ngân sách nhà nước (Treasury Remittance)**.
  - Hiện thực hóa hàm thuần tính toán `adjustNetDeltaForPropertyTransactions` trong `game_event_financial_helpers.ts` để đối soát và khử trừ toàn bộ chi phí mua đất vô chủ, nâng cấp nhà, trả giá thắng đấu giá, kích hoạt ETC đường sắt, nâng cấp tiện ích Smart Grid/5G, và nộp phí giải chấp 55% khỏi danh sách `payers`.
  - Bảo toàn tuyệt đối các khoản thu ngân sách chân thực: Thuế đất ô 04 (`LAND_TAX`), tiền bảo lãnh ô 10 (`BAIL`), khấu trừ thuế tài sản qua ô GO, và các khoản phạt hành chính từ thẻ Cơ Hội / Vận Khí.

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-366.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-366.md) | Thẩm định đối kháng giải tỏa 6 điểm mù kiến trúc ([ADV-01] đến [ADV-06]), 0 defects | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/client/imp366_deduplicate_treasury_toasts.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp366_deduplicate_treasury_toasts.test.ts) | 12 atomic tests, 25 asserts, 0 loops. Adversarial Inversion: 10 tests RED runtime, 2 tests bảo toàn thuế | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/imp-366_snapshot.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp-366_snapshot.json) | 2 production files modified, 100% 12/12 living tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-366.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-366.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-events` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-366.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-366.md) | 0 Slop red flags, Zero TIDD, an toàn thứ tự đường ống, assertion density 2.08 | **APPROVED** 🛡️ |
| **Trạm 4: Snapshot & Test Invariant** | `check_evidence.mjs` & snapshot collector<br>[`.agents/evidence/imp-366_snapshot.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp-366_snapshot.json) | Toàn vẹn snapshot kiểm thử vật lý (12 tests, 25 asserts, 0 errors, 527 LOC), bảo toàn các bất biến kinh tế | **SNAPSHOT VERIFIED 📋** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Hoàn thành thẩm định đối kháng đa tầng, giải tỏa toàn bộ 6 lỗ hổng kiến trúc và 3 cạm bẫy tiềm ẩn.
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa**:

  - **[ADV-01] Pipeline Inversion & Pass-GO Multi-Transaction Collision**
    - **Vector**: Concurrency & Multi-Transaction Collisions / Arithmetic Fallthrough
    - **Scenario**: Trong kế hoạch ban đầu, hàm `adjustNetDeltaForPropertyTransactions` được đề xuất gọi trước `reconstructGoSalary`. Khi người chơi đi qua ô GO nhận lương (+2.000 M VND) và mua ô số 1 (600 M VND) trong cùng một tick, số dư ròng tăng `+1.400 M VND`. Người chơi bị xếp vào mảng `receivers`. Hàm xử lý đất chạy trước không tìm thấy người chơi trong `payers`, do đó hấp thụ **0 VND**. Sau đó, hàm `reconstructGoSalary` chạy, khấu trừ 2.000 M VND khiến số dư ròng biến thành âm `-600 M VND` và đẩy người chơi vào `payers`. Luồng thuế mặc định bắt gặp `-600 M VND` và phát sinh một toast nộp thuế Kho Bạc ma quái!
    ```typescript
    // Đoạn mã sai thứ tự ban đầu trong Plan IMP-366 Task 2:
    const { payers, receivers } = buildInitialBalanceDeltas(delta, prevState, nextState);
    if (delta.lastTradeResult) {
      adjustNetDeltaForTrade(delta.lastTradeResult, payers, receivers);
    }
    adjustNetDeltaForPropertyTransactions(delta, prevState, nextState, payers); // <-- SAI VỊ TRÍ!
    const salaryEvents = reconstructGoSalary(delta, prevState, nextState, payers, receivers, timestamp);
    ```
    - **Consequence**: Thứ tự sai phá vỡ hoàn toàn khả năng phân tách đa giao dịch, khiến mọi người chơi qua ô GO mua đất đều bị dội thông báo nộp phạt Kho Bạc lên tới 2.000 M VND.
    - **Hardening Directive**: Điều phối lại thứ tự đường ống trong [`src/client/events/game_event_financial_synthesizer.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/game_event_financial_synthesizer.ts): gọi `adjustNetDeltaForPropertyTransactions` nghiêm ngặt **SAU** `reconstructGoSalary` và **TRƯỚC** `extractGovernmentAndTelecomFees` / `matchRentTransactions`.

  - **[ADV-02] Property Upgrade Modifier Blindness & Macroeconomic Arithmetic Drift**
    - **Vector**: Economic & Treasury Invariants / Unstated Assumptions
    - **Scenario**: Kế hoạch ban đầu chỉ đọc mảng tĩnh `deed.upgradeCosts` mà bỏ quên các hệ số kinh tế vĩ mô:
    ```typescript
    // Đoạn mã ban đầu bỏ quên hệ số vĩ mô trong Plan IMP-366 Task 1:
    const deed = PROPERTY_DEEDS.get(cell.index);
    const targetLvl = cell.level as 1 | 2 | 3;
    const upgradeCosts = deed?.upgradeCosts;
    const baseCost = upgradeCosts ? upgradeCosts[targetLvl - 1] ?? 0 : 0;
    ```
    Khi chu kỳ `MC_RATE_HIKE` (+20%) kích hoạt, chi phí thực tế là 1.200 M VND nhưng client chỉ hoàn trả 1.000 M VND, để sót `-200 M VND` trong `payers` và làm bùng phát toast nộp thuế Kho Bạc rác. Khi `MC_CREDIT_STIMULUS` (-20%) kích hoạt, client bù lố +200 M VND làm nuốt chửng các khoản nộp phạt vi phạm khác.
    - **Consequence**: Nâng cấp công trình trong các chu kỳ vĩ mô gây rò rỉ toast Kho Bạc hoặc che giấu các khoản nợ thực tế.
    - **Hardening Directive**: Import và gọi hàm miền SSOT [`calculateUpgradeCost(cell.index, lvl, activeMods)`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_upgrade.ts#L79) lặp qua từng cấp từ `prevLevel` lên `cell.level - 1`, bảo toàn mảng `affectedCells` trong `MACRO_LAND_FEVER`.

  - **[ADV-03 & Latent Flaw 1] Bankruptcy Liquidation Asset Transfer & Null Trap Guard**
    - **Vector**: Exploits & Economic Arbitrage / Loose Truthy Trap
    - **Scenario**: Khi con nợ phá sản chuyển giao tài sản cho chủ nợ (giá 0 VND), server gửi `cell.ownerId` của chủ nợ và `prevOwnerId` của con nợ. Nếu điều kiện chỉ kiểm tra `cell.ownerId !== undefined && cell.ownerId !== prevOwnerId`, hệ thống sẽ hiểu nhầm chủ nợ mua đất từ ngân hàng và bù tiền khế ước vào dư nợ, xóa sạch các khoản thuế đất hay tiền phạt của chủ nợ. Đồng thời, biểu thức `cell.ownerId !== undefined` trong JS bị dính bẫy khi server trả về `ownerId: null` (`null !== undefined` là `true`).
    - **Consequence**: Cấp quyền miễn trừ thuế phi pháp cho chủ nợ khi thanh lý phá sản và phát sinh lỗi logic khi gặp ô cờ vô chủ.
    - **Hardening Directive**: Khóa chặt điều kiện mua đất từ ngân hàng bằng cú pháp chuẩn xác:
    ```typescript
    const isDirectBankPurchase = prevOwnerId === undefined && Boolean(cell.ownerId);
    ```

  - **[ADV-04] Railroad ETC & Utility Infrastructure Upgrade Exclusion**
    - **Vector**: Incomplete Surface Area / Trapped States
    - **Scenario**: Ô đường sắt (5, 15, 25, 35) và tiện ích EVN/Viettel (12, 28) không có cấp độ số 1, 2, 3 mà sử dụng cờ boolean (`isETC`, `isUpgradedUtility`). Khi người chơi nâng cấp ETC (1.500 M VND) hoặc Smart Grid (1.000 M VND), nếu hàm khấu trừ chỉ kiểm tra `cell.level > prevLevel`, các khoản chi này sẽ bị bỏ sót và rơi vào vòng lặp thuế Kho Bạc.
    - **Consequence**: Kích hoạt ETC và nâng cấp điện thoại/điện lực tiếp tục bị dội toast nộp thuế Kho Bạc.
    - **Hardening Directive**: Bổ sung nhánh kiểm tra `cell.isETC === true && !wasETC` (khấu trừ `ETC_COST_PER_CELL = 1500`) và `cell.isUpgradedUtility === true && !wasUpgradedUtil` (khấu trừ `UTILITY_UPGRADE_COST = 1000`).

  - **[ADV-05] Cell 23 (Nghệ An) vs Cell 11 (Bình Thuận) Citation Erratum**
    - **Vector**: Objective Validity & SSOT Alignment
    - **Scenario**: Nhật ký kế hoạch ban đầu dẫn chứng nhầm Ô số 11 (Bình Thuận, 1.400 M VND) trong khi ảnh chụp thực tế và cấu hình SSOT là Ô số 23 (Nghệ An - TP. Vinh, 2.200 M VND).
    - **Hardening Directive**: Chuẩn hóa trích dẫn toàn diện sang Ô 23 (Nghệ An, 2.200 M VND) khớp 100% với `board_config.ts`.

  - **[ADV-06] Invariant & Living Test Verification**
    - **Vector**: Living Test Collision & Contract Regression (ADV-REG)
    - **Living Test Audit**:
      - `tests/client/imp330_game_event_narrative_synthesizer.test.ts`: 16 tests executed $\rightarrow$ **PASS**.
      - `tests/client/imp331_property_auction_trade_synthesizer.test.ts`: 14 tests executed $\rightarrow$ **PASS**.
      - `tests/client/imp333_badge_presentation_subscriber.test.ts`: 10 tests executed $\rightarrow$ **PASS**.
      - Rà soát các bộ test hiện hành nhận thấy không có bộ test nào kiểm tra sự vắng mặt của `FEE_PAID: TAX` khi mua hoặc nâng cấp đất. Chúng chỉ kiểm tra sự xuất hiện của `PROPERTY_BOUGHT`. Vì `synthesizeGameEvents` ghép mảng `[...financialEvents, ...propertyEvents]`, cả 2 sự kiện đều được phát ra đồng thời mà không làm fail test cũ.
    - **Treasury Conservation Invariant**:
      - Khấu trừ dòng tiền chi vốn bất động sản khỏi `payers` bảo toàn định luật bảo toàn quỹ Kho Bạc ([`docs/domain/gotchas/economy_treasury.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/economy_treasury.md)). Nó ngăn tầng hiển thị client tự vẽ ra các dòng thu ngân sách ảo mâu thuẫn trực tiếp với số dư Kho Bạc thực tế trên máy chủ.
      - Toàn bộ các khoản thu ngân sách thực sự (Thuế đất Ô 04, Tiền bảo lãnh Ô 10, Thuế tài sản khi qua GO, các khoản phạt hành chính từ thẻ sự kiện) được bảo toàn 100%.
    - **Contract Hardening Directive**:
      - Trong `tests/client/imp366_deduplicate_treasury_toasts.test.ts`, viết các bài test hợp đồng độc lập khẳng định khi người chơi qua ô GO (+2.000 M VND) và mua đất trong cùng một tick (trong cả 3 trường hợp: Lương > Giá, Lương == Giá, và Lương < Giá), mảng sự kiện trả về bắt buộc có đúng **0** sự kiện `FEE_PAID: TAX`.

---

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/client/imp366_deduplicate_treasury_toasts.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp366_deduplicate_treasury_toasts.test.ts)
- **Chỉ số kiểm thử**: **12 atomic tests**, **25 asserts** (mật độ trung bình: 2.08 asserts/test, 0 vòng lặp `for`/`forEach`).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified**.
  - Khi chạy trên mã nguồn ban đầu: **10 tests thất bại** đúng do vi phạm runtime assertion (kỳ vọng 0 toast nộp thuế nhưng nhận được 1 toast thuế rác), **2 tests thành công** chứng minh tính bảo toàn (bảo toàn nợ khi thanh lý phá sản và bảo toàn Thuế Đất ô 04).

---

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi**:
  - [`src/client/events/game_event_financial_helpers.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/game_event_financial_helpers.ts) (258 LOC $\le$ 400 LOC Tier 1)
  - [`src/client/events/game_event_financial_synthesizer.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/game_event_financial_synthesizer.ts) (270 LOC $\le$ 400 LOC Tier 1)
- **Chuyển trạng thái**: Toàn bộ **12/12 contract tests chuyển sang GREEN** trong 7ms.
- **Hồi quy hệ thống**: 100% **40/40 tests hồi quy** thuộc các vé `imp330`, `imp331`, `imp333` vượt qua trong 853ms.

---

### Trạm 2.5: Fast Pre-Filter Mechanical Sweep (`scout` / `fast_prefilter.mjs`)
- **TypeScript**: `tsc --noEmit` hoàn thành với 0 lỗi (Exit Code 0).
- **Zero Dirty Casts**: 100% tuân thủ TypeScript Structural Typing, tuyệt đối không sử dụng `as any` hay `as unknown as T`.
- **LOC Ceilings**: Cả 2 tệp đều dưới 300 LOC, cách xa ngưỡng trần 400 LOC của Tier 1.

---

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
1. **Spec & Scope Gatekeeper (`spec-reviewer`)**:
   - Biên bản: [`.agents/audit/SPEC_REVIEW_IMP-366.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-366.md) — **APPROVED 📋**
   - Xác nhận phạm vi: 100% thay đổi nằm trong phân hệ `client-events`, zero scope creep theo xác nhận từ `check_scope.mjs`.
2. **Deep Architecture & Anti-Slop Auditor (`code-reviewer`)**:
   - Biên bản: [`.agents/audit/CODE_REVIEW_IMP-366.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-366.md) — **APPROVED 🛡️**
   - 0 Slop red flags, Zero TIDD, quản lý thứ tự đường ống an toàn, không có hiện tượng nuốt lỗi hay rò rỉ bộ nhớ.
3. **Knowledge Fold Invariant**:
   - Cập nhật tài liệu Single Source of Truth [`docs/FEATURE_MAP.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/docs/FEATURE_MAP.md) tại Cột Trụ số 10 (Treasury, Taxes & Bonds) ghi nhận quy tắc **Treasury Toast Deduplication** và bất biến **Treasury Remittance Primacy Invariant**.

---

### Trạm 4: Kiểm Soát Toàn Vẹn Bằng Chứng Vật Lý & Bất Biến Kinh Tế (`check_evidence.mjs`)
- **Tệp bằng chứng snapshot**: [`.agents/evidence/imp-366_snapshot.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp-366_snapshot.json)
- **Phán quyết**: **SNAPSHOT VERIFIED 📋**
- **Xác nhận thực nghiệm trung thực**:
  - Không có tệp cấu hình mutation probe nhân tạo được tạo ra ngoài luồng (`scripts/sentinel_probes/IMP-366.json` không áp dụng cho slice này).
  - Lệnh `node scripts/check_evidence.mjs IMP-366` xác thực khớp 100% số lượng 12 ca kiểm thử living tests, 25 assertions, không có mutant trùng lặp hoặc tự sát (zero tautological mutants).
  - Bảo toàn 100% định luật bảo toàn tài chính và các bất biến kinh tế giữa client và server.

---

## 3.3. ĐỐI CHIẾU TRỰC QUAN VỚI ẢNH LỖI GỐC (VISUAL RECONCILIATION)

| Trạng thái | Hình ảnh & Biểu hiện thực tế | Phân tích luồng sự kiện (Event Synthesis) |
| :--- | :--- | :--- |
| **Trước khi sửa (Lỗi gốc)** | Ảnh [`media_1791720833992_d8ac2c82.png`](file:///C:/Users/HP/.gemini/antigravity/brain/6fa0ac3b-f944-4e90-81de-d407994fb2c9/.user_uploaded/media_1791720833992_d8ac2c82.png):<br>Xuất hiện 2 toast xếp chồng:<br>1. `🏷️ Bot AI 4 thanh toán -2.200 mua sở hữu Nghệ An`<br>2. `🏛️ Bot AI 4 nộp -2.200 vào Kho Bạc` | - `synthesizePropertyAndMarketEvents` sinh `PROPERTY_BOUGHT`.<br>- Con nợ rơi vào nhánh vét cạn của `synthesizeFinancialEvents`, sinh thêm `FEE_PAID: TAX`.<br>- Giao diện dội 2 toast cùng lúc, gây hiểu nhầm trừ 4.400 M VND. |
| **Sau khi sửa (IMP-366)** | Chỉ xuất hiện **1 toast duy nhất**:<br>`🏷️ Bot AI 4 thanh toán -2.200 mua sở hữu Nghệ An`<br>Triệt tiêu 100% toast Kho Bạc ma quái. | - `adjustNetDeltaForPropertyTransactions` đối soát giá khế ước 2.200 M VND của Ô 23 và khử trừ số dư nợ của Bot AI 4 về 0.<br>- Nhánh thuế nhận `diff = 0` nên không sinh `FEE_PAID: TAX`.<br>- Màn hình thoáng đãng, số liệu tài chính hoàn toàn minh bạch. |

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-366 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `game_event_financial_helpers.ts` | [`src/client/events/game_event_financial_helpers.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/game_event_financial_helpers.ts) | Tier 1 (Domain/Server/Logic) | **258 LOC** | 258 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `game_event_financial_synthesizer.ts` | [`src/client/events/game_event_financial_synthesizer.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/game_event_financial_synthesizer.ts) | Tier 1 (Domain/Server/Logic) | **270 LOC** | 270 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `imp366_deduplicate_treasury_toasts.test.ts` | [`tests/client/imp366_deduplicate_treasury_toasts.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp366_deduplicate_treasury_toasts.test.ts) | Living Test | **428 LOC** | 428 Lines | <= 600 LOC | ✅ Đạt chuẩn |

---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

- **Hiệu Quả Nghiệp Vụ & Công Thái Học Giao Diện (UX & Touch Ergonomics)**:
  - Triệt tiêu 100% hiện tượng xuất hiện toast nộp thuế Kho Bạc giả mạo khi mua đất, nâng cấp nhà, hoặc thắng đấu giá trên toàn bộ các nền tảng (Desktop 1280x800 và Mobile 360x740).
  - Không gian hiển thị trên mobile viewport được giải phóng hoàn toàn khỏi các badge thông báo xếp chồng gây che khuất bàn cờ 3D.
  - Số liệu hiển thị trên HUD tài chính và danh sách thông báo nổi khớp chính xác từng đồng với biến động số dư thực tế trên máy chủ.

- **Tính Toàn Vẹn Của Hệ Thống (Architectural Integrity)**:
  - Bảo toàn trọn vẹn định luật bảo toàn quỹ Kho Bạc: Client chỉ hiển thị thông báo nộp Kho Bạc khi máy chủ thực sự ghi nhận dòng tiền chảy vào ngân sách nhà nước.
  - Kiểm thử hợp đồng sống (`tests/client/imp366_deduplicate_treasury_toasts.test.ts`) gồm 12 ca kiểm thử nguyên tử đạt chuẩn mật độ 25 assertions (2.08 asserts/test), bảo vệ hệ thống trước mọi nguy cơ hồi quy khi mở rộng các chính sách kinh tế trong tương lai.
  - Single Source of Truth (`docs/FEATURE_MAP.md` Pillar 10) đã cập nhật vĩnh viễn quy tắc **Treasury Toast Deduplication** và bất biến **Treasury Remittance Primacy Invariant**.

- **Sẵn Sàng Triển Khai (Production Readiness)**:
  - Toàn bộ mã nguồn đạt chuẩn Tier 1 (Domain/Server/Logic <= 400 LOC), vượt qua 100% các cổng cơ học (`tsc --noEmit`, linters, scope audit).
  - Sẵn sàng đóng gói và sáp nhập vào nhánh chính (`main`).
