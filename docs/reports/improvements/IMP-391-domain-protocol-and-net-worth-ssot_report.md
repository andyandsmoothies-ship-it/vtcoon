# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-391
## Plan IMP-391: Domain & Bot Cycle Breaker (`SCC-01..03`) & Authoritative Net Worth SSOT (Ticket IMP-391)

> **Mã Ticket:** `IMP-391`  
> **Phân hệ thực tế:** `domain-core`  
> **Ngày hoàn thành:** 2026-10-13  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

Trước `IMP-391`, phân hệ lõi `src/domain/**` tồn tại 2 điểm nghẽn kiến trúc lớn được phát hiện qua kiểm toán AST toàn cục:
1. **Chu trình phụ thuộc vòng tròn (Circular Dependency Cycles `SCC-2` & `SCC-3`)**: Cụm 8 tệp trong `src/domain/` (`chance_card_handlers.ts -> market_card_handlers.ts -> card_handlers.ts -> property_upgrade.ts -> property_rent.ts -> property_manager.ts -> event_card_engine.ts -> room.ts`) và cụm định giá Bot trong `src/domain/bot/` (`bot_softmax.ts <-> valuation_engine.ts`, `bot_trade.ts <-> bot_hybrid_trade.ts`) bị khóa chặt vào nhau chỉ vì import các hằng số/enum tĩnh (`MarketCardId`, `ChanceCardId`, `COASTAL_CELLS`, `SERVICE_CELLS`, `JITTER_BOUNDS`, `BotTradeDecision`) qua tệp điều phối trung gian thay vì leaf module.
2. **Độ lệch định giá Tài Sản Ròng (Net Worth Split-Brain Drift)**: Bảng hệ số `LEVEL_MULTIPLIER` và vòng lặp tính giá trị ròng từng ô đất bị nhân bản độc lập giữa Server ([`calculateNetWorth`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager_queries.ts#L23-L43)) và Bot AI ([`evaluatePlayerNetWorth`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_posture.ts#L41-L61)). Trong đó, Bot AI cố định định giá ô thế chấp ở mức 50% (`Math.floor(deed.price * 0.5)`) mà bỏ sót khoản vay thế chấp ưu đãi 60% theo thẻ Quy Hoạch Đô Thị (`MC_URBAN_PLANNING` lưu tại `player.mortgageLoans[cellIndex]`), còn Server chỉ xét `player.mortgagedProperties` mà bỏ sót cờ `stateMap.get(cellIndex)?.isMortgaged`.

**Giải pháp kỹ thuật cốt lõi trong `IMP-391`**:
- Thiết lập `LEVEL_MULTIPLIER` và hàm chuẩn [`calculateCellNetWorth(cellIndex, level, isMortgaged, customLoanAmount)`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_data.ts#L102-L118) làm Single Source of Truth (SSOT) tại [`src/domain/property_data.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_data.ts), tái sử dụng [`MORTGAGE_LOAN_RATE`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/mortgage_constants.ts#L4), khóa chặt bất biến `effectiveLevel = isMortgaged ? 0 : level` (`[CRITICAL-01]`), và kết nối đồng bộ cả `room_manager_queries.ts` lẫn `bot_posture.ts`.
- Định tuyến toàn bộ import hằng số/kiểu về các leaf modules (`event_card_types.ts`, `property_data.ts`, `bot_types.ts`), xóa sổ 100% chu trình phụ thuộc vòng tròn trong `src/domain/**` (0 SCCs).

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-391.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-391.md) | Thẩm định kế hoạch đạt 0 defects, 6 contract tests clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/domain/imp391_domain_protocol_and_net_worth_ssot.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/domain/imp391_domain_protocol_and_net_worth_ssot.test.ts) | 6 atomic tests, 22 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/chaos_sentinel_IMP-391.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-391.json) | 13 production files modified, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-391.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-391.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `domain-core` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-391.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-391.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 3.67 | **APPROVED** 🛡️ |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 17/17 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Thẩm định kế hoạch đạt 0 defects, 6 contract tests clean, độ dài Plan 126 dòng ($\le 250$ dòng).
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa**:
  - **[CRITICAL-01] Bất biến Thế Chấp + Cấp Công Trình trong `calculateCellNetWorth`**: Khóa chặt `const effectiveLevel = isMortgaged ? 0 : level;` để ngăn chặn rủi ro nhân hệ số cấp nhà trên ô đất đang thế chấp khi dữ liệu đầu vào bị bẩn.
  - **[HIGH-02] Hợp nhất `JITTER_BOUNDS` tại `valuation_engine.ts`**: Cập nhật `src/domain/bot/valuation_engine.ts` để import và re-export `JITTER_BOUNDS` từ `./bot_types`, xóa bỏ hoàn toàn khai báo trùng lặp cục bộ.
  - **[MEDIUM-03] Xóa sạch Type-Cycle trong `SCC-2` (8 files)**: Chuyển `import type { MarketCardId, ChanceCardId }` tại `src/domain/room.ts` sang `./event_card_types` và `import type { PropertyRegistry, PropertyStateMap }` tại `src/domain/event_card_engine.ts` sang `./property_data`.
  - **[ADV-03] Đồng bộ Khoản vay Thế chấp 60% (`MC_URBAN_PLANNING`) & Cờ `stateMap.isMortgaged`**: Kết nối cả `calculateNetWorth` (`room_manager_queries.ts`) và `evaluatePlayerNetWorth` (`bot_posture.ts`) vào SSOT `calculateCellNetWorth`, truyền đầy đủ `mortgageLoans?.[cellIndex]` và kiểm tra `stateMap.get(cellIndex)?.isMortgaged`.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/domain/imp391_domain_protocol_and_net_worth_ssot.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/domain/imp391_domain_protocol_and_net_worth_ssot.test.ts)
- **Chỉ số kiểm thử**: **6 atomic tests**, **22 asserts** (mật độ trung bình: 3.67 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (Thất bại do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.
  - **Bằng chứng thất bại (Failure Snippet)**:
```text
AssertionError: expected +0 to be 4000 // Object.is equality (6 failed: TC-391.01 0 vs 4000, TC-391.02 0 vs 16000, TC-391.03 0 vs 2000, TC-391.04 0 vs 1600, TC-391.05 15600 vs 15240, TC-391.06 5000 vs 4600)
```

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi**:
  - [`src/domain/bot/bot_hybrid_trade.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_hybrid_trade.ts)
  - [`src/domain/bot/bot_posture.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_posture.ts)
  - [`src/domain/bot/bot_softmax.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_softmax.ts)
  - [`src/domain/bot/bot_trade.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_trade.ts)
  - [`src/domain/bot/bot_types.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_types.ts)
  - [`src/domain/bot/valuation_engine.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/valuation_engine.ts)
  - [`src/domain/event_card_engine.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/event_card_engine.ts)
  - [`src/domain/property_data.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_data.ts)
  - [`src/domain/property_manager.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_manager.ts)
  - [`src/domain/property_rent.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_rent.ts)
  - [`src/domain/property_upgrade.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_upgrade.ts)
  - [`src/domain/room.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts)
  - [`src/server/room_manager_queries.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager_queries.ts)
- **Chuyển trạng thái**: Toàn bộ **6/6 contract tests chuyển sang GREEN**.
- **Living Test Suites**: Bảo toàn nguyên vẹn, zero hồi quy logic hiện hành.

### Trạm 2.5: Fast Pre-Filter Mechanical Sweep (`scout` / `fast_prefilter.mjs`)
- **TypeScript**: `tsc --noEmit` vượt qua với 0 lỗi (Exit Code 0).
- **Dirty Casts**: Tuyệt đối không sử dụng `as any` hoặc dirty type casting.
- **LOC Ceilings**: Tất cả các tệp đều nằm trong hạn mức trần của từng phân hệ (Tier 1 <= 400, Tier 2 <= 500, Tier 3 <= 800, Test <= 600).

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
1. **Spec & Scope Gatekeeper (`spec-reviewer`)**:
    - **Phán quyết**: **APPROVED** 📋
    - **Xác nhận phạm vi**: 100% các thay đổi nằm trong phân hệ mục tiêu (`domain-core`), zero scope creep.
2. **Deep Architecture & Anti-Slop Auditor (`code-reviewer`)**:
    - **Phán quyết**: **APPROVED** 🛡️
    - **Chỉ số Anti-Slop**: 0 violations trên 6 cờ cảnh báo (Deep modules, Zero pass-through wrappers, Zero TIDD).
    - **Bộ nhớ & Timer**: Không rò rỉ listener, không bỏ sót timer cleanup, an toàn đa luồng/bất đồng bộ.


### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: 17/17 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-391 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `bot_hybrid_trade.ts` | [`src/domain/bot/bot_hybrid_trade.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_hybrid_trade.ts) | Tier 1 (Domain/Server/Logic) | **254 SLOC** | 291 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `bot_posture.ts` | [`src/domain/bot/bot_posture.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_posture.ts) | Tier 1 (Domain/Server/Logic) | **174 SLOC** | 206 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `bot_softmax.ts` | [`src/domain/bot/bot_softmax.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_softmax.ts) | Tier 1 (Domain/Server/Logic) | **103 SLOC** | 112 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `bot_trade.ts` | [`src/domain/bot/bot_trade.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_trade.ts) | Tier 1 (Domain/Server/Logic) | **218 SLOC** | 246 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `bot_types.ts` | [`src/domain/bot/bot_types.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_types.ts) | Tier 1 (Domain/Server/Logic) | **144 SLOC** | 164 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `valuation_engine.ts` | [`src/domain/bot/valuation_engine.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/valuation_engine.ts) | Tier 1 (Domain/Server/Logic) | **219 SLOC** | 245 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `event_card_engine.ts` | [`src/domain/event_card_engine.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/event_card_engine.ts) | Tier 1 (Domain/Server/Logic) | **131 SLOC** | 146 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `property_data.ts` | [`src/domain/property_data.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_data.ts) | Tier 3 (Static Data/Config) | **102 SLOC** | 118 Lines | <= 800 LOC | ✅ Đạt chuẩn |
| `property_manager.ts` | [`src/domain/property_manager.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_manager.ts) | Tier 1 (Domain/Server/Logic) | **130 SLOC** | 149 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `property_rent.ts` | [`src/domain/property_rent.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_rent.ts) | Tier 1 (Domain/Server/Logic) | **189 SLOC** | 205 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `property_upgrade.ts` | [`src/domain/property_upgrade.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_upgrade.ts) | Tier 1 (Domain/Server/Logic) | **191 SLOC** | 212 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `room.ts` | [`src/domain/room.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts) | Tier 1 (Domain/Server/Logic) | **321 SLOC** | 346 Lines | <= 400 LOC | ⚠️ Warning (321 > 300) |
| `room_manager_queries.ts` | [`src/server/room_manager_queries.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager_queries.ts) | Tier 1 (Domain/Server/Logic) | **66 SLOC** | 74 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `imp391_domain_protocol_and_net_worth_ssot.test.ts` | [`tests/domain/imp391_domain_protocol_and_net_worth_ssot.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/domain/imp391_domain_protocol_and_net_worth_ssot.test.ts) | Living Test | **118 SLOC** | 133 Lines | <= 600 LOC | ✅ Đạt chuẩn |

---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

- **Tính toàn vẹn hệ thống**: Gói cải tiến hoàn thành theo đúng nguyên tắc Zero-Blindness, cung cấp đầy đủ bằng chứng vật lý từ mã nguồn, kiểm thử, hình ảnh trực quan đến biên bản kiểm toán độc lập.
- **Sẵn sàng triển khai**: Mã nguồn đã sẵn sàng đóng gói và triển khai lên môi trường sản phẩm.

### Sổ Theo Dõi Nợ Kỹ Thuật (Tech Debt Watch)
- ⚠️ **Cảnh báo trần LOC Tier 1 (Domain/Server/Logic)** [`DEBT-DOMAIN-01`]: Tệp [`src/domain/room.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts) hiện đạt **346/400 LOC** (khoảng cách an toàn còn 54 dòng trước trần tử thần). Các ticket kế tiếp nếu mở rộng chức năng bắt buộc phải thực hiện refactor trích xuất helper/domain validator độc lập trước khi thêm logic mới.


