# Plan IMP-321: Causal Disclosure for Mortgage Interest on Passing GO (Revision 2)

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-321`
- **Subsystem**: `client-network` (Tier 1 Client Network Extractor & Transaction Formula)
- **Problem Statement**:
  1. **Undisclosed Financial Deduction**: In `turn_loop.ts`, `collectMortgageInterest(room, current.id)` automatically deducts 5% (or 10% under `MC_RATE_HIKE`) of total mortgaged debt when passing GO. However, `extractPassedGoActivities` in `src/client/network/activity_go_extractor.ts` completely omits mortgage interest from `salaryLogs` and `totalGoDeductions`.
  2. **Net Calculation & Log Drift**: The omitted deduction causes `netGoBonus` in the extractor to diverge from the player's true balance delta, and leaves the player with zero visual explanation in the activity drawer and floating numbers for why their money was deducted.
  3. **Severed Presentation Wire & Stimulus Exemption**: `handleTaxBadge` in `activity_badge_dispatcher.ts` currently assigns `'Nộp Thuế Nhà Nước ➔ Kho Bạc'` and delays until pawn landing for non-prop-tax items, severing the connection to `transaction_formula.ts`. Furthermore, `MC_CREDIT_STIMULUS` grants 0% mortgage interest in SSOT `getMortgageInterestRate`, which must be respected.
- **Architectural Solution**:
  1. In `src/client/network/activity_go_extractor.ts`, compute `mortDebt` from `prevP.mortgagedProperties` and `prevP.mortgageLoans` using SSOT `PROPERTY_DEEDS`.
  2. Determine effective interest rate matching server SSOT `getMortgageInterestRate`: 0% when `MC_CREDIT_STIMULUS` is active, 10% when `MC_RATE_HIKE` is active, otherwise 5%.
  3. If `mortInterest > 0`:
     - Push structured activity log of type `'tax'` with clear explanation: `🏦 ${pName} đã nộp ${formatCurrency(mortInterest)} lãi thế chấp qua GO (${isRateHike ? '10%' : '5%'} nợ)`.
     - Include `mortInterest` in `totalGoDeductions` so `netGoBonus` accurately reflects true cash flow.
  4. In `src/client/network/activity_badge_dispatcher.ts`, recognize `isMortgageInterest = act.message.includes('lãi thế chấp')`, assign title `Nộp Lãi Thế Chấp Qua GO ➔ Kho Bạc`, and use `getPawnPassGoDelay` for synchronization.
  5. In `src/client/ui/transaction_formula.ts`, add causal formula mapping for mortgage interest: `'Lãi vay thế chấp qua GO (5%-10% nợ)'` (35 chars, mobile-safe).
- **Direct Scope**:
  - `src/client/network/activity_go_extractor.ts`
  - `src/client/network/activity_badge_dispatcher.ts`
  - `src/client/ui/transaction_formula.ts`
  - `tests/client/imp321_mortgage_interest_go_disclosure.test.ts` (New)
- **Baseline Working Tree Dependencies**:
  - `src/client/network/activity_rent_matcher.ts`
  - `tests/client/activity_go_extractor.test.ts`
  - `tests/client/imp319_causal_notification_clarity.test.ts`
  - `src/server/insolvency_manager.ts`
  - `src/server/room_manager.ts`
  - `src/server/room_property_coordinator.ts`
  - `tests/server/imp318_off_turn_debtor_downgrade.test.ts`
  - `tests/server/imp320_fsm_restoration_and_deep_coordinator.test.ts`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/network/activity_go_extractor.ts` | Tier 1 (Domain/Server/Logic) | 154 | 175 | +21 | <= 400 | ✔️ Safe |
| `src/client/network/activity_badge_dispatcher.ts` | Tier 1 (Domain/Server/Logic) | 241 | 241 | +0 | <= 400 | ✔️ Safe |
| `src/client/ui/transaction_formula.ts` | Tier 2 (UI/3D/Views) | 102 | 105 | +3 | <= 500 | ✔️ Safe |
| `tests/client/imp321_mortgage_interest_go_disclosure.test.ts` | Living Test | 0 | ~160 | +160 | <= 600 | ✔️ Safe |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
**Target physical file**: `tests/client/imp321_mortgage_interest_go_disclosure.test.ts` (Tệp mới)

Test Specifications:
- TC-321.01 [UC-MORT-GO/MSS]: Given player p1 with mortgaged cell 1 passing GO, When extractPassedGoActivities runs, Then logs structured mortgage interest deduction of 5% debt and includes it in totalGoDeductions.
- TC-321.02 [UC-MORT-GO/MSS]: Given active MC_RATE_HIKE modifier, When player passes GO with mortgaged property, Then calculates 10% mortgage interest deduction with rate hike disclosure.
- TC-321.03 [UC-MORT-GO/A1]: Given player with 0 mortgaged properties, When passing GO, Then generates zero mortgage interest logs.
- TC-321.04 [UC-MORT-GO/A2]: Given player with custom mortgageLoan override, When passing GO, Then calculates interest strictly against recorded loan principal.
- TC-321.05 [UC-MORT-GO/MSS]: Given active MC_CREDIT_STIMULUS modifier, When player passes GO with mortgaged property, Then exempts interest to 0% matching server SSOT.
- TC-321.06 [UC-MORT-GO/MSS]: Given mortgage interest activity log, When handleTaxBadge dispatches and resolveFormulaText evaluates, Then floating text receives title 'Nộp Lãi Thế Chấp Qua GO ➔ Kho Bạc' and resolves formula 'Lãi vay thế chấp qua GO (5%-10% nợ)'.

### Station 2: Implementation (GREEN)

#### Task 2.1: Extract Mortgage Interest in `activity_go_extractor.ts`
**Target physical file**: `src/client/network/activity_go_extractor.ts`

```typescript
<<<<
      const { registry, stateMap } = buildPropertyRegistryAndStateMap(prevState.playersInfo, prevState.levelMap);
      const rawGoTax = calculateGoPropertyTax(p.id, registry, stateMap);
      const goTax = Math.min(rawGoTax, GO_PROPERTY_TAX_CAP);
      if (goTax > 0) {
        salaryLogs.push({
          id: `tax_prop_go_${Date.now()}_${p.id}`, timestamp: Date.now(), type: 'tax',
          message: `🏛️ ${pName} đã nộp thuế ${formatCurrency(goTax)} (Thuế Tài Sản Qua GO)`,
          amount: -goTax, cellIndex: 0, playerId: p.id, playerName: pName,
          ...(pInfo?.tokenColor ? { playerTokenColor: pInfo.tokenColor } : {}),
        });
      }

      const totalGoDeductions = (isOverdraftDue ? 3300 : 0) + (hasFreeCredit ? 400 : 0) + goTax;
      const netGoBonus = salary - totalGoDeductions;
====
      const { registry, stateMap } = buildPropertyRegistryAndStateMap(prevState.playersInfo, prevState.levelMap);
      const rawGoTax = calculateGoPropertyTax(p.id, registry, stateMap);
      const goTax = Math.min(rawGoTax, GO_PROPERTY_TAX_CAP);
      if (goTax > 0) {
        salaryLogs.push({
          id: `tax_prop_go_${Date.now()}_${p.id}`, timestamp: Date.now(), type: 'tax',
          message: `🏛️ ${pName} đã nộp thuế ${formatCurrency(goTax)} (Thuế Tài Sản Qua GO)`,
          amount: -goTax, cellIndex: 0, playerId: p.id, playerName: pName,
          ...(pInfo?.tokenColor ? { playerTokenColor: pInfo.tokenColor } : {}),
        });
      }

      const mortDebt = (prevP?.mortgagedProperties ?? []).reduce((sum, cell) => {
        const loan = prevP?.mortgageLoans?.[cell];
        if (loan !== undefined) return sum + loan;
        const deed = PROPERTY_DEEDS.get(cell);
        return sum + (deed ? Math.floor(deed.price * 0.5) : 0);
      }, 0);
      const activeMods = delta.activeModifiers ?? prevState.activeModifiers ?? [];
      const isStimulus = activeMods.some((m) => m.type === 'MC_CREDIT_STIMULUS' && m.remainingRounds > 0);
      const isRateHike = activeMods.some((m) => m.type === 'MC_RATE_HIKE' && m.remainingRounds > 0);
      const mortRate = isStimulus ? 0 : (isRateHike ? 0.10 : 0.05);
      const mortInterest = Math.floor(mortDebt * mortRate);
      if (mortInterest > 0) {
        salaryLogs.push({
          id: `mort_interest_${Date.now()}_${p.id}`, timestamp: Date.now(), type: 'tax',
          message: `🏦 ${pName} đã nộp ${formatCurrency(mortInterest)} lãi thế chấp qua GO (${isRateHike ? '10%' : '5%'} nợ)`,
          amount: -mortInterest, cellIndex: 0, playerId: p.id, playerName: pName,
          ...(pInfo?.tokenColor ? { playerTokenColor: pInfo.tokenColor } : {}),
        });
      }

      const totalGoDeductions = (isOverdraftDue ? 3300 : 0) + (hasFreeCredit ? 400 : 0) + goTax + mortInterest;
      const netGoBonus = salary - totalGoDeductions;
>>>>
```

#### Task 2.2: Dispatch Mortgage Interest Badge in `activity_badge_dispatcher.ts`
**Target physical file**: `src/client/network/activity_badge_dispatcher.ts`

```typescript
<<<<
  const isCell4 = act.cellIndex === 4, isPropTax = act.message.includes('Tài Sản');
  const baseTitle = isCell4 ? 'Lệ Phí Đất Đai' : (isPropTax ? 'Thuế Tài Sản Qua GO' : 'Thuế Nhà Nước');
  const cellIndex = isCell4 ? 4 : (isPropTax ? 0 : act.cellIndex);
  const delay = isPropTax ? getPawnPassGoDelay(act.playerId) : getPawnLandingDelay(act.playerId);
====
  const isCell4 = act.cellIndex === 4, isPropTax = act.message.includes('Tài Sản'), isMortInterest = act.message.includes('lãi thế chấp');
  const baseTitle = isCell4 ? 'Lệ Phí Đất Đai' : (isMortInterest ? 'Lãi Thế Chấp Qua GO' : (isPropTax ? 'Thuế Tài Sản Qua GO' : 'Thuế Nhà Nước'));
  const cellIndex = isCell4 ? 4 : ((isPropTax || isMortInterest) ? 0 : act.cellIndex);
  const delay = (isPropTax || isMortInterest) ? getPawnPassGoDelay(act.playerId) : getPawnLandingDelay(act.playerId);
>>>>
```

#### Task 2.3: Add Causal Formula in `transaction_formula.ts`
**Target physical file**: `src/client/ui/transaction_formula.ts`

```typescript
<<<<
      if (item.cellIndex === 4 || item.title?.includes('Đất Đai')) {
        return 'Lệ phí trước bạ: 10% tiền mặt (Tối đa 2.000 Tr.)';
      }
      if (item.title?.includes('vượt GO') || item.title?.includes('tài sản')) {
        return `Thuế tài sản qua GO (Tối đa ${(GO_PROPERTY_TAX_CAP ?? 1000).toLocaleString('vi-VN')} Tr.)`;
      }
====
      if (item.cellIndex === 4 || item.title?.includes('Đất Đai')) {
        return 'Lệ phí trước bạ: 10% tiền mặt (Tối đa 2.000 Tr.)';
      }
      if (item.title?.includes('thế chấp') || item.title?.includes('lãi vay') || item.title?.includes('lãi thế chấp') || item.title?.includes('Lãi Thế Chấp')) {
        return 'Lãi vay thế chấp qua GO (5%-10% nợ)';
      }
      if (item.title?.includes('vượt GO') || item.title?.includes('tài sản')) {
        return `Thuế tài sản qua GO (Tối đa ${(GO_PROPERTY_TAX_CAP ?? 1000).toLocaleString('vi-VN')} Tr.)`;
      }
>>>>
```

### Station 3: Verification & Mechanical Gates
- Fast Pre-Filter: `npm run prefilter -- src/client/network/activity_go_extractor.ts src/client/network/activity_badge_dispatcher.ts src/client/ui/transaction_formula.ts tests/client/imp321_mortgage_interest_go_disclosure.test.ts`
- Live Sentinel & Mutation Gate: `npm run sentinel -- --ticket IMP-321 --test tests/client/imp321_mortgage_interest_go_disclosure.test.ts`
- Scope Auditor: `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_321_MORTGAGE_INTEREST_GO_DISCLOSURE.md`
- Comprehensive Evidence Audit: `node scripts/check_evidence.mjs IMP-321`
