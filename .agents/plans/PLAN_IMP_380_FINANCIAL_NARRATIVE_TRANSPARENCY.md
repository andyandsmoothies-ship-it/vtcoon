# Plan IMP-380: Comprehensive Financial Narrative & Transaction Transparency (Ticket IMP-380)

## 0. Auto-Slicing Roadmap (Micro-Slices Matrix)
- **Slice 1 (IMP-380 - THIS TICKET)**: Financial Narrative Transparency for Corporate Bonds (Repayment & Issuance), M&A Compulsory Buyout, and HOSE Trading with Netting Collision Resolution and Modular Decomposition.
- **Slice 2 (IMP-381)**: [DEFERRED TO TICKET-IMP-381: Scope conservation - Lifecycle Event Transparency for Property Downgrades and Player Bankruptcy].

## 0.1. Context & Architectural Rationale
- **Sự cố thực tế**: Người chơi tại Ô 20 (Nghỉ Dưỡng Miễn Phí) sau khi kết thúc lượt bị trừ 3.689 và nhận thông báo gây hoang mang: *"Fluffy Otter đã nộp 3.689 thuế/phạt vào Kho Bạc Nhà Nước"* kèm icon Kho Bạc `🏛️`.
- **Nguyên nhân cốt lõi**:
  1. **Trái Phiếu Doanh Nghiệp**: Khi đáo hạn (`roundsLeft === 1`), server trừ tiền tất toán (`repayAmount`). Client thiếu sự kiện `BOND_REPAID`, số tiền âm rơi vào fallback `FEE_PAID: TAX`, biến trả nợ trái phiếu thành "nộp phạt Kho Bạc". Ngược lại, khi phát hành trái phiếu (`handleIssueBond`), tiền gốc (+3.416) vào tài khoản nhưng hoàn toàn im lặng (0 log, 0 badge).
  2. **Netting Collision**: Khi người chơi vừa đáo hạn trái phiếu (-3.689) vừa qua ô GO (+2.000 lương), balance delta ròng bị triệt tiêu thành -1.689. Thuật toán cũ kiểm tra `diff <= -repayAmount` bị thất bại và đẩy toàn bộ -1.689 vào fallback Kho Bạc!
  3. **Vấn đề phân loại nhầm danh mục**: Trước đây hệ thống gán tạm sang các danh mục không tương thích làm hiển thị nhầm icon và nhãn không đúng bản chất trên huy hiệu nổi 3D.
  4. **Thâu tóm M&A / Mua cưỡng bức**: Khi mua lại BĐS đối thủ (1.3x giá gốc theo `compulsory_buyout.ts` hoặc 1.2x theo thẻ `CC_MA_FORCE`), hàm `matchRentTransactions` ghép đối ứng 1-1 biến khoản tiền thâu tóm thành **`RENT_PAID`** (*"đã trả tiền thuê tại... cho đối thủ"*). Đồng thời `game_event_property_synthesizer.ts` nổ đúp `PROPERTY_BOUGHT`.
  5. **Chứng khoán HOSE**: Khi đầu tư thua lỗ trên Ô 38 (`profit < 0`), số tiền âm rơi vào fallback `FEE_PAID: TAX`; khi hòa vốn (`profit === 0`) thì bị nuốt chửng; khi có lãi thì tab Giao Dịch im lặng; và singleton `lastProcessedHoseKey` thiếu hàm reset vòng đời session.
- **Giải pháp kiến trúc**:
  - Chuẩn hóa loại sự kiện tài chính vào `SynthesizedGameEventType` (`BOND_REPAID`, `BOND_ISSUED`, `COMPULSORY_BUYOUT`, `HOSE_SETTLED`).
  - Thiết lập type `'bond'` chính danh hạng nhất trên `ActivityLogType`, `FloatingActionType`, `transaction_narrative.ts` (icon 📜, danh mục "TRÁI PHIẾU DOANH NGHIỆP"), loại bỏ hoàn toàn việc gán nhầm.
  - Phân rã cấu trúc (Modular Decomposition) tách `game_event_financial_helpers.ts` (giảm từ 379 xuống 213 dòng) thành `game_event_bond_helpers.ts` (93 dòng), `game_event_buyout_helpers.ts` (78 dòng), và `game_event_hose_helpers.ts` (56 dòng) cùng `badge_financial_helpers.ts` (105 dòng) giúp `badge_event_subscriber.ts` giảm xuống 293 dòng, duy trì vùng đệm an toàn > 100 dòng dưới trần 400 LOC.
  - Khắc phục Netting Collision: `extractBondEvents` hoàn trả `repayAmount` vào delta và luân chuyển thặng dư dương sang `receivers` để `reconstructGoSalary` ghi nhận đầy đủ cả lương GO lẫn tất toán nợ, triệt tiêu 100% fallback phạt thuế giả mạo.
  - Đóng gói hàm `resetHoseEventTracker()` kết nối trực tiếp vào `purgeClientMatchSession` trong `client_session_purger.ts`.

## 1. Physical Target Files & Honest LOC Accounting
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| `src/client/events/game_event_types.ts` | Tier 1 (Domain/FSM/Server) | 247 | 247 | +0 | <= 400 | Safe (< 260 LOC) |
| `src/client/events/game_event_financial_helpers.ts` | Tier 1 (Domain/FSM/Server) | 213 | 213 | +0 | <= 400 | Safe (< 250 LOC, Decomposed) |
| `src/client/events/game_event_bond_helpers.ts` | Tier 1 (Domain/FSM/Server) | 93 | 93 | +0 | <= 400 | Safe (< 100 LOC) |
| `src/client/events/game_event_buyout_helpers.ts` | Tier 1 (Domain/FSM/Server) | 78 | 78 | +0 | <= 400 | Safe (< 100 LOC) |
| `src/client/events/game_event_hose_helpers.ts` | Tier 1 (Domain/FSM/Server) | 56 | 56 | +0 | <= 400 | Safe (< 100 LOC) |
| `src/client/events/game_event_financial_synthesizer.ts` | Tier 1 (Domain/FSM/Server) | 275 | 275 | +0 | <= 400 | Safe (< 300 LOC) |
| `src/client/events/game_event_property_synthesizer.ts` | Tier 1 (Domain/FSM/Server) | 208 | 208 | +0 | <= 400 | Safe (< 250 LOC) |
| `src/client/events/subscribers/activity_log_financial_formatter.ts` | Tier 1 (Domain/FSM/Server) | 115 | 115 | +0 | <= 400 | Safe (< 150 LOC) |
| `src/client/events/subscribers/badge_event_subscriber.ts` | Tier 1 (Domain/FSM/Server) | 293 | 293 | +0 | <= 400 | Safe (< 300 LOC, Decomposed) |
| `src/client/events/subscribers/badge_financial_helpers.ts` | Tier 1 (Domain/FSM/Server) | 105 | 105 | +0 | <= 400 | Safe (< 120 LOC) |
| `src/client/events/subscribers/activity_log_subscriber.ts` | Tier 1 (Domain/FSM/Server) | 342 | 342 | +0 | <= 400 | Warning (>= 300 LOC - Tech Debt: IMP-381) |
| `src/client/store/activity_store.ts` | Tier 1 (Domain/FSM/Server) | 144 | 144 | +0 | <= 400 | Safe (< 160 LOC) |
| `src/client/store/game_store_subtypes.ts` | Tier 1 (Domain/FSM/Server) | 230 | 230 | +0 | <= 400 | Safe (< 250 LOC) |
| `src/client/ui/transaction_narrative.ts` | Tier 2 (UI/3D/Views) | 286 | 286 | +0 | <= 500 | Safe (< 300 LOC) |
| `src/client/ui/activity_feed_sidebar.tsx` | Tier 2 (UI/3D/Views) | 350 | 350 | +0 | <= 500 | Safe (< 360 LOC) |
| `src/client/network/client_session_purger.ts` | Tier 1 (Domain/FSM/Server) | 59 | 59 | +0 | <= 400 | Safe (< 70 LOC) |
| `tests/client/imp380_financial_narrative_transparency.test.ts` | Living Test | 429 | 429 | +0 | <= 600 | Safe (< 450 LOC) |
| `docs/FEATURE_MAP.md` | SSOT Matrix | 91 | 91 | +0 | N/A | Cập nhật Pillar 10 & 14 |

## 2. In-Action Visual Capture Registration
- Scenario: `notifications_financial` (`scripts/visual_scenarios/notifications_financial.js`)
- Verification Command: `node scripts/capture_visual_evidence.mjs --ticket IMP-380 --scenario notifications_financial`
- Viewport: Desktop HD (`1280x800`) & Mobile WebKit (`360x740`)
- Target: Nhật ký hoạt động và huy hiệu 3D hiển thị chuẩn xác tất toán trái phiếu (`📜`), phát hành trái phiếu (`📜`), thâu tóm M&A (`🤝`), và giao dịch HOSE (`📈`) không bị nhầm thành thuế/phạt hoặc tiền thuê.

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
Viết bộ kiểm thử tại `tests/client/imp380_financial_narrative_transparency.test.ts`:
- **TC-380.01 [UC-BOND-REPAYMENT-NARRATIVE/MSS]:** Given player with active bond contract at round 28, When calling `extractBondEvents` / `synthesizeFinancialEvents` and bond matures with balance decreasing by repayAmount (3.689), Then synthesizes BOND_REPAID event with principal 3.416 and interest 273, generating log "đã tất toán Trái Phiếu Doanh Nghiệp 3.689" instead of "nộp thuế/phạt vào Kho Bạc". Đồng thời kiểm chứng nếu vỡ nợ (EVENT_BOND_DEFAULT) thì không bị gắn nhãn tất toán thành công.
- **TC-380.02 [UC-BOND-ISSUANCE-NARRATIVE/MSS]:** Given player issuing WORKING_CAPITAL bond, When calling `extractBondEvents` for bond issuance where balance increases by principal (+3.416) and bondContract becomes active, Then synthesizes BOND_ISSUED event, generating activity log với type `'bond'` và floating badge với actionType `'bond'`.
- **TC-380.03 [UC-BUYOUT-NOT-RENT/MSS]:** Given player executing compulsory buyout transferring cell ownership from seller to buyer with buyout price, When calling `extractCompulsoryBuyoutEvents` for compulsory buyout, Then emits COMPULSORY_BUYOUT event, prevents matchRentTransactions from emitting spurious RENT_PAID, và triệt tiêu nổ đúp PROPERTY_BOUGHT trong property synthesizer.
- **TC-380.04 [UC-HOSE-TRANSACTION-DISAMBIGUATION/MSS]:** Given delta with lastHoseResult, When calling `extractHoseEvents` and `resetHoseEventTracker` where player suffers trading loss or breaks even (roll 3), Then emits HOSE_SETTLED event with loss/even narrative and prevents residual negative diff from falling into FEE_PAID: TAX; single-shot deduplication ngăn ngừa bắn lặp ở các delta phụ tiếp theo.
- **TC-380.05 [UC-BADGE-SUBSCRIBER/MSS]:** Given synthesized financial events (BOND_REPAID, HOSE_SETTLED), When calling `handleBondAndInvestmentBadges` via badge subscriber, Then schedules floating text badges with canonical actionType `'bond'` and `'hose'`, formatting titles and formulas correctly.
- **TC-380.06 [UC-COMPOSITE-CASHFLOW/MSS]:** Given player simultaneously crossing GO (+2.000 salary) and repaying maturing bond (-3.689), causing net cashflow of -1.689, When calling `extractBondEvents` in composite cashflow with passed GO salary, Then resolves Netting Collision, emits both BOND_REPAID and GO_SALARY events, and prevents false FEE_PAID: TAX fallback (0 tax events).

### Station 2: Implementation (GREEN)

#### Call-Site Wiring & Integration Anchors
- **Target physical file**: `src/client/events/game_event_financial_synthesizer.ts`
Integration of financial event sub-helpers into synthesizer pipeline:
```typescript
const bondEvents = extractBondEvents(delta, prevState, nextState, payers, receivers, timestamp);
const buyoutEvents = extractCompulsoryBuyoutEvents(delta, prevState, nextState, payers, receivers, timestamp);
const hoseEvents = extractHoseEvents(delta, payers, receivers, timestamp);
const salaryEvents = reconstructGoSalary(delta, prevState, nextState, payers, receivers, timestamp);
```
- **Target physical file**: `src/client/events/game_event_financial_helpers.ts`
Re-exporting sub-helpers cleanly:
```typescript
export { extractBondEvents } from './game_event_bond_helpers.js';
export { extractCompulsoryBuyoutEvents } from './game_event_buyout_helpers.js';
export { extractHoseEvents, resetHoseEventTracker } from './game_event_hose_helpers.js';
```
- **Target physical file**: `src/client/events/subscribers/badge_event_subscriber.ts`
Calling dedicated financial badge handler:
```typescript
handleSalaryAndFeeBadges(event, context, state, pacing);
handleBondAndInvestmentBadges(event, context, state, pacing);
```

#### Sub-Module Decompositions & Integration Seams
- `src/client/events/game_event_bond_helpers.ts`: Triển khai `extractBondEvents` với cơ chế phục hồi số dư `repayAmount` vào delta và luân chuyển thặng dư dương sang `receivers` để khắc phục triệt để Netting Collision.
```typescript
// export function extractBondEvents definition
```
- `src/client/events/game_event_buyout_helpers.ts`: Triển khai `extractCompulsoryBuyoutEvents` xử lý M&A cưỡng chế đối ứng giữa bên mua và bên bán.
```typescript
// export function extractCompulsoryBuyoutEvents definition
```
- `src/client/events/game_event_hose_helpers.ts`: Triển khai `extractHoseEvents` và `resetHoseEventTracker()` chống trùng lặp phiên giao dịch HOSE.
```typescript
// export function extractHoseEvents and resetHoseEventTracker definition
```
- `src/client/events/subscribers/badge_financial_helpers.ts`: Triển khai `handleBondAndInvestmentBadges` xử lý badge nổi cho Trái phiếu, Buyout và HOSE.
```typescript
// export function handleBondAndInvestmentBadges definition
```
- `src/client/network/client_session_purger.ts`: Tích hợp `resetHoseEventTracker()` vào bước 2 của quy trình dọn dẹp phiên chơi `purgeClientMatchSession`.
- `src/client/store/activity_store.ts` & `src/client/store/game_store_subtypes.ts`: Mở rộng union types thêm `'bond'` vào `ActivityLogType` và `FloatingActionType`.
- `src/client/ui/transaction_narrative.ts` & `src/client/ui/activity_feed_sidebar.tsx`: Thêm `case 'bond'` hiển thị danh mục `TRÁI PHIẾU DOANH NGHIỆP`, biểu tượng `📜`, động từ tất toán/phát hành.
- `src/client/events/subscribers/activity_log_subscriber.ts`: Gán log `type: 'bond'` cho `BOND_REPAID` và `BOND_ISSUED`.
- `docs/FEATURE_MAP.md`: Cập nhật Pillar 10 và Pillar 14 ghi nhận các quy chuẩn thông báo tài chính minh bạch cho Trái phiếu, M&A và Sàn HOSE.

### Station 3: Pre-Filter & Machine Gates
- `npm run prefilter -- src/client/events/game_event_types.ts src/client/events/game_event_financial_helpers.ts src/client/events/game_event_financial_synthesizer.ts src/client/events/game_event_property_synthesizer.ts src/client/events/subscribers/activity_log_financial_formatter.ts src/client/events/subscribers/badge_event_subscriber.ts src/client/events/subscribers/activity_log_subscriber.ts src/client/events/game_event_bond_helpers.ts src/client/events/game_event_buyout_helpers.ts src/client/events/game_event_hose_helpers.ts src/client/events/subscribers/badge_financial_helpers.ts tests/client/imp380_financial_narrative_transparency.test.ts`
- `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_380_FINANCIAL_NARRATIVE_TRANSPARENCY.md`
- `node scripts/capture_visual_evidence.mjs --ticket IMP-380 --scenario notifications_financial`
- `node scripts/check_evidence.mjs IMP-380`

### Station 4: Chaos Sentinel & Invariant Verification
- Chạy Sentinel: `npm run sentinel -- --ticket IMP-380 --test tests/client/imp380_financial_narrative_transparency.test.ts`.

## 4. Definition of Done (DoD) & Stopping Boundary
1. Toàn bộ 7/7 contract tests trong `imp380_financial_narrative_transparency.test.ts` chuyển sang GREEN.
2. Không hồi quy các living test suites tài chính liên quan (`imp368_go_salary_deductions_transparency`, `imp366_deduplicate_treasury_toasts`, `imp370_auction_and_financial_notification_clarity`).
3. 100% Sentinel mutants bị tiêu diệt.
4. Cập nhật `docs/FEATURE_MAP.md` đầy đủ trước Station 3 sign-off.
