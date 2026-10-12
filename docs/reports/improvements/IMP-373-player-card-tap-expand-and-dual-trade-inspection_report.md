# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-373
## Plan IMP-373: Player Card Tap-to-Expand & Dual-Party Trade Inspection (Ticket IMP-373)

> **Mã Ticket:** `IMP-373`  
> **Phân hệ thực tế:** `client-ui`  
> **Ngày hoàn thành:** 2026-10-12  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

Gói cải tiến `IMP-373` giải quyết trực tiếp 2 khiếm khuyết hiển thị và công thái học phát sinh sau khi triển khai `IMP-372`:

- **Bối cảnh & Điểm mù sau IMP-372**:
  - Tại vé `IMP-372`, để nén 46% chiều cao `PlayerHudList` trên mobile (tránh che lấp ô đất 10–20 và không gian xoay sa bàn 3D), thuộc tính `${!isCurrentTurn ? 'hidden sm:flex' : 'flex'}` đã được áp dụng, chỉ hiển thị cụm 28 chấm BĐS cho người chơi đang có lượt.
  - **Hệ quả 1 (Mù thông tin BĐS đối thủ khi đàm phán P2P Trade)**: Khi Bot AI gửi đề xuất đổi đất (`pendingTradeOffer`), chỉ thẻ của bot (bên gửi đề xuất) đang có lượt nên hiển thị 28 chấm, trong khi thẻ của người chơi chính (Peppy Panda - bên nhận) bị ẩn cụm 28 chấm. Người chơi bị mù hoàn toàn danh mục BĐS của chính mình, không thể đối chiếu xem ô đất bị đòi đổi có phá vỡ thế độc quyền hay không.
  - **Hệ quả 2 (Mất khả năng chủ động trinh sát tài sản đối thủ)**: Người chơi không có cách nào xem danh mục BĐS của các bot khác chưa tới lượt (Bot 2, Bot 3) do thẻ bị khóa thu gọn cứng nhắc.

- **Cơ Chế 2 Đòn Bẩy Cốt Lõi Triển Khai Trong IMP-373**:
  1. **Dual-Party Trade Inspection (Bung thẻ song phương tự động)**: Mở rộng điều kiện hiển thị Section 2 của `PlayerCard` trên mobile: tự động bung mở cụm 28 chấm khi thẻ thuộc về người chơi đang có lượt (`isCurrentTurn`) **HOẶC** là một trong hai bên tham gia giao dịch (`isTradingParty`).
  2. **Tap-to-Expand Progressive Disclosure (Chạm mở rộng linh hoạt)**: Cho phép người chơi chạm vào bất kỳ thẻ bot ngoài lượt nào để xem chi tiết 28 chấm BĐS, chạm lại để thu gọn; tích hợp chỉ báo thị giác chevron `▲`/`▼` (`renderCardExpandChevron`) trên mobile; tự động reset thu gọn khi đổi lượt toàn cục (`currentTurnPlayerId`).

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-373.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-373.md) | Thẩm định kế hoạch đạt 0 defects, 6 contract tests clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/client/imp373_player_card_tap_expand_and_trade_dual_inspection.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp373_player_card_tap_expand_and_trade_dual_inspection.test.ts) | 6 atomic tests, 18 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/chaos_sentinel_IMP-373.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-373.json) | 1 production files modified, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-373.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-373.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-ui` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-373.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-373.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 3.00 | **APPROVED** 🛡️ |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 16/16 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Thẩm định kế hoạch đạt 0 defects, 6 contract tests clean.
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa (100% 5/5 Directives Resolved)**:
  - **[ADV-01] Stale State Lock (Kẹt thẻ mở vĩnh viễn)**:
    - **Scenario / Rủi ro**: Dùng dependency `[isCurrentTurn]` khiến 75% số thẻ bot không đổi lượt bị kẹt mở qua các vòng tiếp theo.
    - **Hardening Directive / Khắc phục**: Thay thế bằng `[currentTurnPlayerId]` để 100% thẻ tự động thu gọn ngay khi đổi lượt chơi toàn cục.
  - **[ADV-02] Visual Affordance (Chỉ báo Chevron)**:
    - **Scenario / Rủi ro**: Người dùng mobile không biết thẻ có thể chạm mở nếu không có tín hiệu thị giác.
    - **Hardening Directive / Khắc phục**: Tích hợp `renderCardExpandChevron` hiển thị `▲`/`▼` (`data-testid="player-card-expand-indicator"`) kèm `sm:hidden` và tách ngoài span tên tránh bị ellipsis cắt cụt.
  - **[ADV-03] Accessibility & Mobile Cursor Guard**:
    - **Scenario / Rủi ro**: Con trỏ pointer trên desktop gây hiểu nhầm, thiếu điều hướng bàn phím cho người khuyết tật.
    - **Hardening Directive / Khắc phục**: Giới hạn con trỏ `cursor-pointer sm:cursor-default`, bổ sung `tabIndex={player.bankrupt ? -1 : 0}` và xử lý phím `Enter`/`Space`.
  - **[ADV-04] Branch Guard (Ngăn Tap Rỗng)**:
    - **Scenario / Rủi ro**: Thẻ đang trong lượt hoặc đang giao dịch đã luôn mở, nếu tap sẽ đổi state vô ích.
    - **Hardening Directive / Khắc phục**: Short-circuit `if (player.bankrupt || isCurrentTurn || isTradingParty) return;`.
  - **[ADV-05] Cross-Suite Teardown (Chống Rò Rỉ Test)**:
    - **Scenario / Rủi ro**: State `pendingTradeOffer` sót lại làm hỏng suite `imp372.test.ts`.
    - **Hardening Directive / Khắc phục**: Thêm `afterEach` hook dọn dẹp triệt để `pendingTradeOffer: null`, `activeModal: null`, `modalPayload: null`.
  - **Phán quyết thẩm tra kế hoạch cuối cùng**: **HARDENED_RESILIENT 🛡️** (Đã giải tỏa 5/5 phát hiện)

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/client/imp373_player_card_tap_expand_and_trade_dual_inspection.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp373_player_card_tap_expand_and_trade_dual_inspection.test.ts)
- **Chỉ số kiểm thử**: **6 atomic tests**, **18 asserts** (mật độ trung bình: 3.00 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (Thất bại do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.
  - **Bằng chứng thất bại (Failure Snippet)**:
```text
AssertionError: expected 'flex-col gap-1 w-full px-2 pt-1.5 pb-…' not to contain 'hidden sm:flex'
 ❯ tests/client/imp373_player_card_tap_expand_and_trade_dual_inspection.test.ts:129:37
```

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi**:
  - [`src/client/ui/player_card.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/player_card.tsx)
- **Chuyển trạng thái**: Toàn bộ **6/6 contract tests chuyển sang GREEN**.
- **Living Test Suites**: Bảo toàn nguyên vẹn, zero hồi quy logic hiện hành.

### Trạm 2.5: Fast Pre-Filter Mechanical Sweep (`scout` / `fast_prefilter.mjs`)
- **TypeScript**: `tsc --noEmit` vượt qua với 0 lỗi (Exit Code 0).
- **Dirty Casts**: Tuyệt đối không sử dụng `as any` hoặc dirty type casting.
- **LOC Ceilings**: Tất cả các tệp đều nằm trong hạn mức trần của từng phân hệ (Tier 1 <= 400, Tier 2 <= 500, Tier 3 <= 800, Test <= 600).

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
1. **Spec & Scope Gatekeeper (`spec-reviewer`)**:
    - **Phán quyết**: **APPROVED** 📋
    - **Xác nhận phạm vi**: 100% các thay đổi nằm trong phân hệ mục tiêu (`client-ui`), zero scope creep.
2. **Deep Architecture & Anti-Slop Auditor (`code-reviewer`)**:
    - **Phán quyết**: **APPROVED** 🛡️
    - **Chỉ số Anti-Slop**: 0 violations trên 6 cờ cảnh báo (Deep modules, Zero pass-through wrappers, Zero TIDD).
    - **Bộ nhớ & Timer**: Không rò rỉ listener, không bỏ sót timer cleanup, an toàn đa luồng/bất đồng bộ.


### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: 16/16 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-373 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `player_card.tsx` | [`src/client/ui/player_card.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/player_card.tsx) | Tier 2 (UI/3D/Views) | **422 SLOC** | 450 Lines | <= 500 LOC | ⚠️ Warning (450 > 400 lines) |
| `imp373_player_card_tap_expand_and_trade_dual_inspection.test.ts` | [`tests/client/imp373_player_card_tap_expand_and_trade_dual_inspection.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp373_player_card_tap_expand_and_trade_dual_inspection.test.ts) | Living Test | **214 SLOC** | 248 Lines | <= 600 LOC | ✅ Đạt chuẩn |

---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

- **Tính toàn vẹn hệ thống**: Gói cải tiến hoàn thành theo đúng nguyên tắc Zero-Blindness, cung cấp đầy đủ bằng chứng vật lý từ mã nguồn, kiểm thử, hình ảnh trực quan đến biên bản kiểm toán độc lập.
- **Sẵn sàng triển khai**: Mã nguồn đã sẵn sàng đóng gói và triển khai lên môi trường sản phẩm.

### Phân Tích Va Chạm Không Gian & Rủi Ro Accordion (Blast Radius)
- **Kịch bản va chạm cực đoan**: Mỗi thẻ `PlayerCard` hiện duy trì local state `isUserExpanded`. Khi người dùng mobile lần lượt tap vào cả 3 thẻ bot ngoài lượt, mỗi thẻ mở thêm $+55\text{px}$.
- **Tính toán chiều cao dồn tích**:
  $$\text{Chiều cao tổng} = 188\text{px} + (3 \times 55\text{px}) = 353\text{px}$$
- **Đánh giá rủi ro**: Con số $353\text{px}$ này chiếm $47.7\%$ chiều dọc viewport $360 \times 740\text{px}$, tiềm ẩn nguy cơ tái sinh lỗi `DEF-04` (che khuất một phần các ô đất 10–20 trên bàn cờ và chiếm không gian vuốt xoay camera của ngón cái bên phải). Mặc dù hook `useEffect` đã bảo đảm dọn dẹp sạch sẽ toàn bộ thẻ mở khi chuyển lượt (`currentTurnPlayerId`), trải nghiệm trong cùng một lượt vẫn có thể bị dày cộm nếu người dùng không chủ động đóng lại.
- **Cam kết giải pháp kiến trúc**: Thiết lập cơ chế **Single-Accordion Guard** (tối đa chỉ cho phép 1 thẻ ngoài lượt bung mở tại một thời điểm; khi mở Thẻ B thì Thẻ A tự động co lại) trong đợt refactor tách helper sắp tới.

### Sổ Theo Dõi Nợ Kỹ Thuật (Tech Debt Watch)
- ⚠️ **Cảnh báo trần LOC Tier 2 (UI/3D/Views)** [`DEBT-UI-01`]: Tệp [`src/client/ui/player_card.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/player_card.tsx) hiện đạt **450/500 Lines** (422 SLOC, khoảng cách an toàn còn 50 dòng trước trần tử thần). Các ticket kế tiếp nếu mở rộng chức năng bắt buộc phải thực hiện trích xuất Pure Data Derivation Logic (cụm 28 chấm, formatting, net worth) sang `player_card_visuals.ts` và cơ chế Single-Accordion lên cấp `player_hud_list.tsx` theo quy tắc Anti-Shallow UI Refactoring để kéo giảm LOC xuống $< 350$ dòng.


