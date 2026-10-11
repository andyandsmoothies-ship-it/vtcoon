# Plan IMP-367: Financial Narrative Clarity & Disambiguation (Ticket IMP-367)

## 0. Context & Architectural Rationale
- **Prior In-Flight Scope (Committed / Verified)**:
  - Ticket `IMP-366`: Deduplicated treasury toasts and refined financial synthesizer, preventing duplicate fee badges on property acquisitions.
- **Problem Statement & Root Cause Discovery**:
  - In gameplay testing (`media_1791731347427_9386af63.png` and `media_1791731347328_be00d084.png`), when players land on Cell 04 (`LAND_TAX`), the UI displays: `🏛️ Bot AI 4 nộp -1.002 vào Kho Bạc` (*Nộp ngân sách nhà nước*). Users legitimately confused this valid tax deduction with the phantom treasury toast bug from `IMP-366`.
  - **Physical Root Cause**: In `transaction_narrative.ts`, `case 'tax'`, `case 'bail'`, and `case 'auction_win'` hardcoded `target = 'vào Kho Bạc'`, while `case 'mortgage'` hardcoded `target = 'từ Ngân Hàng'`. Because `floating_numbers.tsx` renders `{narrative.subject} {narrative.verb} {item.text} {narrative.target}`, sentences collapsed into an ambiguous `nộp ... vào Kho Bạc` without revealing the specific cell, property, or tax ordinance.
  - **Resolution**:
    1. Enrich `target` in `transaction_narrative.ts` so Cell 04 formats as `Lệ Phí Đất (Ô 04) ➔ Kho Bạc`, Cell 10 formats as `bảo lãnh Kiểm Toán (Ô 10) ➔ Kho Bạc`, auction win formats as `trúng đấu giá [Tên] ➔ Kho Bạc`, Pass-GO tax formats as `thuế tài sản qua GO ➔ Kho Bạc`, and mortgage formats as `thế chấp [Tên] từ Ngân Hàng`.
    2. Update `badge_event_subscriber.ts` to output authoritative formula `Lệ phí trước bạ: 10% tiền mặt (Tối đa 2.000 Tr.)` for Cell 04 Land Tax.
    3. Update `imp194_natural_narrative_floating_badges.test.ts` to assert the disambiguated targets and write contract suite `imp367_financial_narrative_clarity.test.ts`.

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-367`
- **Subsystem**: `client-ui` (Tier 2 UI/Views & Natural Narrative Presentation)
- **Direct Scope (Physical Files)**:
  - **Target physical file**: `src/client/ui/transaction_narrative.ts` (Refactor)
  - **Target physical file**: `src/client/events/subscribers/badge_event_subscriber.ts` (Refactor)
  - **Target physical file**: `tests/contracts/imp194_natural_narrative_floating_badges.test.ts` (Refactor)
  - **Target physical file**: `tests/contracts/imp367_financial_narrative_clarity.test.ts` (Refactor)
- **Referenced Contracts / Stable Boundaries**:
  - `src/client/ui/floating_numbers.tsx`
  - `src/client/store/game_store.ts`
  - `src/client/ui/transaction_formula.ts`
  - `tests/contracts/imp216_financial_notification_formula_and_badge.test.ts`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/ui/transaction_narrative.ts` | Tier 1 (Domain/FSM/Server) | 275 | 278 | +3 | <= 280 | Safe (Ceiling 280 in IMP194) |
| `src/client/events/subscribers/badge_event_subscriber.ts` | Tier 1 (Domain/FSM/Server) | 260 | 262 | +2 | <= 400 | In-place formula polish |
| `tests/contracts/imp194_natural_narrative_floating_badges.test.ts` | Living Test | 523 | 523 | 0 | <= 600 | Contract alignment |
| `tests/contracts/imp367_financial_narrative_clarity.test.ts` | Living Test | 7 | 7 | 0 | <= 600 | Scaffolded test suite |

## 3. Implementation Steps

### Station 1: Red Contract Test Specifications
**Target physical file**: `tests/contracts/imp367_financial_narrative_clarity.test.ts`
- TC-367.01 [UC-IMP367/MSS]: Given floating text item with actionType tax at Cell 04, When resolveTransactionNarrative is executed, Then returns target containing "Lệ Phí Đất (Ô 04) ➔ Kho Bạc".
- TC-367.02 [UC-IMP367/MSS]: Given floating text item with actionType bail at Cell 10, When resolveTransactionNarrative is executed, Then returns target containing "bảo lãnh Kiểm Toán (Ô 10) ➔ Kho Bạc".
- TC-367.03 [UC-IMP367/MSS]: Given floating text item with actionType auction_win, When resolveTransactionNarrative is executed, Then returns target containing "trúng đấu giá".
- TC-367.04 [UC-IMP367/MSS]: Given floating text item with actionType mortgage, When resolveTransactionNarrative is executed, Then returns target containing "thế chấp".
- TC-367.05 [UC-IMP367/MSS]: Given floating text item with actionType tax for property tax qua GO, When resolveTransactionNarrative is executed, Then returns target containing "thuế tài sản qua GO ➔ Kho Bạc".
- TC-367.06 [UC-IMP367/MSS]: Given badge event subscriber handles FEE_PAID with LAND_TAX, When formatting badge, Then emits formula "Lệ phí trước bạ: 10% tiền mặt (Tối đa 2.000 Tr.)".

### Station 2: Implementation (GREEN)

#### Task 1: Disambiguate Targets in `src/client/ui/transaction_narrative.ts`
**Target physical file**: `src/client/ui/transaction_narrative.ts`
```typescript
<<<<
    case 'auction_win': {
      category = 'ĐẤU GIÁ BẤT ĐỘNG SẢN'; verb = 'nộp'; target = 'vào Kho Bạc';
      const m = item.title?.match(/Thắng\s+đấu\s+giá\s+(.+?)(?:\s*➔|$)/i);
      const aucProp = (m && m[1]) ? m[1].trim() : cellName;
      detail = aucProp ? `(Trúng đấu giá ${aucProp})` : '(Trúng đấu giá)';
      break;
    }
    case 'tax': {
      category = 'KHO BẠC NHÀ NƯỚC'; verb = 'nộp'; target = 'vào Kho Bạc';
      const cleanTax = item.title ? item.title.replace(/^Nộp\s+/i, '').replace(/\s*➔\s*(?:Vào\s+)?Kho\s+Bạc/i, '').trim() : '';
      detail = cleanTax ? `(${cleanTax})` : '(Nộp thuế)';
      break;
    }
    case 'bail': category = 'BẢO LÃNH KIỂM TOÁN'; verb = 'nộp'; target = 'vào Kho Bạc'; detail = '(Rời Trạm Kiểm Toán)'; break;
    case 'audit_jail': category = 'TRẠM KIỂM TOÁN'; verb = 'vào'; target = 'Trạm Kiểm Toán'; detail = '(Bị kiểm toán thuế)'; break;
    case 'mortgage': category = 'TÍN DỤNG NGÂN HÀNG'; verb = 'vay'; target = 'từ Ngân Hàng'; detail = cellName ? `(Thế chấp ${cellName})` : '(Thế chấp BĐS)'; break;
====
    case 'auction_win': {
      category = 'ĐẤU GIÁ BẤT ĐỘNG SẢN'; verb = 'nộp';
      const m = item.title?.match(/Thắng\s+đấu\s+giá\s+(.+?)(?:\s*➔|$)/i);
      const aucProp = (m && m[1]) ? m[1].trim() : cellName;
      target = `tiền trúng đấu giá ${aucProp || 'BĐS'} ➔ Kho Bạc`;
      detail = aucProp ? `(Trúng đấu giá ${aucProp})` : '(Trúng đấu giá)';
      break;
    }
    case 'tax': {
      category = 'KHO BẠC NHÀ NƯỚC'; verb = 'nộp';
      const cleanTax = item.title ? item.title.replace(/^Nộp\s+/i, '').replace(/\s*➔\s*(?:Vào\s+)?Kho\s+Bạc/i, '').trim() : '';
      const isLandTax = item.cellIndex === 4 || cleanTax.includes('Đất Đai');
      const isGoTax = cleanTax.includes('Tài Sản') || cleanTax.includes('GO');
      target = isLandTax ? 'Lệ Phí Đất (Ô 04) ➔ Kho Bạc' : isGoTax ? 'thuế tài sản qua GO ➔ Kho Bạc' : cleanTax ? `${cleanTax} ➔ Kho Bạc` : 'vào Kho Bạc';
      detail = isLandTax ? '(Lệ Phí Đất Ô 04)' : isGoTax ? '(Thuế tài sản qua GO)' : cleanTax ? `(${cleanTax})` : '(Nộp thuế)';
      break;
    }
    case 'bail': category = 'BẢO LÃNH KIỂM TOÁN'; verb = 'nộp'; target = 'bảo lãnh Kiểm Toán (Ô 10) ➔ Kho Bạc'; detail = '(Bảo lãnh Kiểm Toán - Ô 10)'; break;
    case 'audit_jail': category = 'TRẠM KIỂM TOÁN'; verb = 'vào'; target = 'Trạm Kiểm Toán'; detail = '(Bị kiểm toán thuế)'; break;
    case 'mortgage': category = 'TÍN DỤNG NGÂN HÀNG'; verb = 'vay'; target = cellName ? `thế chấp ${cellName} từ Ngân Hàng` : 'từ Ngân Hàng'; detail = cellName ? `(Thế chấp ${cellName})` : '(Thế chấp BĐS)'; break;
>>>>
```

#### Task 2: Polish Formula in `src/client/events/subscribers/badge_event_subscriber.ts`
**Target physical file**: `src/client/events/subscribers/badge_event_subscriber.ts`
```typescript
<<<<
      const formula = isBail
        ? `Bảo lãnh chuẩn: Khung ${formatCurrency(event.amount)} Tr. ➔ Kho Bạc`
        : 'Nộp ngân sách nhà nước';
====
      const formula = isBail
        ? `Bảo lãnh chuẩn: Khung ${formatCurrency(event.amount)} Tr. ➔ Kho Bạc`
        : isLandTax
        ? 'Lệ phí trước bạ: 10% tiền mặt (Tối đa 2.000 Tr.)'
        : 'Nộp ngân sách nhà nước';
>>>>
```

#### Task 3: Align Target in `tests/contracts/imp194_natural_narrative_floating_badges.test.ts`
**Target physical file**: `tests/contracts/imp194_natural_narrative_floating_badges.test.ts`
```typescript
<<<<
      expect(narrative.category).toBe('ĐẤU GIÁ BẤT ĐỘNG SẢN');
      expect(narrative.icon).toBe('🔨');
      expect(narrative.verb).toBe('nộp');
      expect(narrative.target).toBe('vào Kho Bạc');
    });

    it('[TC-194.05/MSS][UC-IMP194] Tax: resolveTransactionNarrative actionType tax sinh category KHO BẠC NHÀ NƯỚC, icon tòa nhà, verb nộp vào Kho Bạc', () => {
      const item: FloatingTextItem = {
        id: 'badge-tax-1',
        text: '-500 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'tax',
        cellIndex: 4,
        title: 'Nộp Lệ Phí Đất Đai (Ô 04) ➔ Kho Bạc',
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerPayer);
      expect(narrative.category).toBe('KHO BẠC NHÀ NƯỚC');
      expect(narrative.icon).toBe('🏛️');
      expect(narrative.verb).toBe('nộp');
      expect(narrative.target).toBe('vào Kho Bạc');
    });

    it('[TC-194.06/MSS][UC-IMP194] Bail: resolveTransactionNarrative actionType bail sinh category BẢO LÃNH KIỂM TOÁN, icon còi báo, verb nộp vào Kho Bạc', () => {
      const item: FloatingTextItem = {
        id: 'badge-bail-1',
        text: '-500 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'bail',
        title: 'Bảo lãnh kiểm toán (Ô 10) ➔ Nộp Kho Bạc',
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerPayer);
      expect(narrative.category).toBe('BẢO LÃNH KIỂM TOÁN');
      expect(narrative.icon).toBe('🚨');
      expect(narrative.verb).toBe('nộp');
      expect(narrative.target).toBe('vào Kho Bạc');
====
      expect(narrative.category).toBe('ĐẤU GIÁ BẤT ĐỘNG SẢN');
      expect(narrative.icon).toBe('🔨');
      expect(narrative.verb).toBe('nộp');
      expect(narrative.target).toBe('tiền trúng đấu giá Cần Thơ ➔ Kho Bạc');
    });

    it('[TC-194.05/MSS][UC-IMP194] Tax: resolveTransactionNarrative actionType tax sinh category KHO BẠC NHÀ NƯỚC, icon tòa nhà, verb nộp vào Kho Bạc', () => {
      const item: FloatingTextItem = {
        id: 'badge-tax-1',
        text: '-500 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'tax',
        cellIndex: 4,
        title: 'Nộp Lệ Phí Đất Đai (Ô 04) ➔ Kho Bạc',
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerPayer);
      expect(narrative.category).toBe('KHO BẠC NHÀ NƯỚC');
      expect(narrative.icon).toBe('🏛️');
      expect(narrative.verb).toBe('nộp');
      expect(narrative.target).toBe('Lệ Phí Đất (Ô 04) ➔ Kho Bạc');
    });

    it('[TC-194.06/MSS][UC-IMP194] Bail: resolveTransactionNarrative actionType bail sinh category BẢO LÃNH KIỂM TOÁN, icon còi báo, verb nộp vào Kho Bạc', () => {
      const item: FloatingTextItem = {
        id: 'badge-bail-1',
        text: '-500 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'bail',
        title: 'Bảo lãnh kiểm toán (Ô 10) ➔ Nộp Kho Bạc',
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerPayer);
      expect(narrative.category).toBe('BẢO LÃNH KIỂM TOÁN');
      expect(narrative.icon).toBe('🚨');
      expect(narrative.verb).toBe('nộp');
      expect(narrative.target).toBe('bảo lãnh Kiểm Toán (Ô 10) ➔ Kho Bạc');
>>>>
```

```typescript
<<<<
      expect(narrative.category).toBe('TÍN DỤNG NGÂN HÀNG');
      expect(narrative.icon).toBe('🏦');
      expect(narrative.verb).toBe('vay');
      expect(narrative.target).toBe('từ Ngân Hàng');
====
      expect(narrative.category).toBe('TÍN DỤNG NGÂN HÀNG');
      expect(narrative.icon).toBe('🏦');
      expect(narrative.verb).toBe('vay');
      expect(narrative.target).toBe('thế chấp Bến Bạch Đằng từ Ngân Hàng');
>>>>
```

### Station 3: Pre-Filter & Architecture Review
- Run mechanical pre-filter: `npm run prefilter -- src/client/ui/transaction_narrative.ts src/client/events/subscribers/badge_event_subscriber.ts tests/contracts/imp194_natural_narrative_floating_badges.test.ts tests/contracts/imp367_financial_narrative_clarity.test.ts`.
- Verify strict LOC ceilings (`transaction_narrative.ts <= 280`, `badge_event_subscriber.ts <= 400`, `tests/** <= 600`).
- Update `docs/FEATURE_MAP.md` row for IMP-367.
- Visual and evidence audit: `node scripts/check_evidence.mjs IMP-367`.

### Station 4: Evidence & Verification
- Execute regression sweep:
  - `npx vitest run tests/contracts/imp367_financial_narrative_clarity.test.ts tests/contracts/imp194_natural_narrative_floating_badges.test.ts tests/contracts/imp216_financial_notification_formula_and_badge.test.ts tests/contracts/imp229_lean_flow_financial_notification.test.ts tests/contracts/imp290_diplomatic_notification_synchronization.test.ts`.
- Run sentinel and immutable evidence audit:
  - `node scripts/collect_evidence.mjs IMP-367`.
  - `node scripts/check_evidence.mjs IMP-367`.

## 4. Definition of Done (DoD) & Stopping Boundary
- **Hard Stopping Boundary (Anti-Churn Invariant)**:
  1. Station 1 (RED): 6 atomic tests in `imp367_financial_narrative_clarity.test.ts` fail strictly due to runtime assertions.
  2. Station 2 (GREEN): Minimal implementation in `transaction_narrative.ts` and `badge_event_subscriber.ts` turns all contract tests GREEN.
  3. Station 3 (Pre-Filter): `npm run prefilter` passes exit code 0; `check_scope.mjs` reports 0 scope creep.
  4. Station 4 (Evidence): Regression suites pass and `node scripts/check_evidence.mjs IMP-367` passes.
  5. Once all checks pass, execution MUST CEASE immediately. Zero speculative refactoring.
