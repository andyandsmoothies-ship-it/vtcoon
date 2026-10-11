# Plan IMP-368: Go Salary Multi-Deduction Narrative Transparency (Ticket IMP-368)

## 0. Context & Architectural Rationale
- **Prior In-Flight Scope (Committed / Verified)**:
  - Ticket `IMP-367`: Disambiguated operative transaction narratives for Cell 04 Land Tax, Cell 10 Audit Bail, and property deeds.
- **Problem Statement & Physical Root Cause**:
  - In actual gameplay testing (`media_1791734771492_2e88de2f.png`), at Round 21, player receives GO salary:
    `Breezy Badger nhận lương vượt GO 1.500 (khấu trừ thuế: 1.000)   +425`
  - The net amount is `+425`, but $1.500 - 1.000 = 500 \ne 425$. The remaining 75 Tr. is mortgage interest (5% on 1.500 loan debt), but both `activity_log_subscriber.ts` and `badge_event_subscriber.ts` hardcoded string templates checking ONLY `event.taxDeduction > 0`, silently dropping all other deductions present in `event.deductions` (`mortgageInterest`, `overdraft`, `creditFee`).
  - This creates cognitive dissonance and leads players to believe the game engine made a mathematical subtraction error.
- **Resolution**:
  1. In `activity_log_subscriber.ts`, build a comprehensive deduction string formatter reflecting all active deductions (`thuế: ...`, `lãi thế chấp: ...`, `thấu chi: ...`, `phí thẻ: ...`).
  2. In `badge_event_subscriber.ts`, format the floating badge formula to itemize all active deductions alongside gross salary.
  3. Write contract test `tests/contracts/imp368_go_salary_deductions_transparency.test.ts` verifying multi-deduction transparency across both subscribers.

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-368`
- **Subsystem**: `client-ui` (Tier 1 Client Events & Financial Presentation)
- **Direct Scope (Physical Files)**:
  - **Target physical file**: `src/client/events/subscribers/activity_log_subscriber.ts` (Refactor)
  - **Target physical file**: `src/client/events/subscribers/badge_event_subscriber.ts` (Refactor)
  - **Target physical file**: `tests/contracts/imp368_go_salary_deductions_transparency.test.ts` (Refactor)
- **Referenced Contracts / Stable Boundaries**:
  - `src/client/events/game_event_types.ts` (`GoSalaryEvent`, `GoSalaryDeductions`)
  - `src/client/events/game_event_financial_synthesizer.ts`
  - `tests/client/imp332_game_event_bus_and_activity_logs.test.ts`
  - `tests/client/imp333_badge_presentation_subscriber.test.ts`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/events/subscribers/activity_log_subscriber.ts` | Tier 1 (Domain/FSM/Server) | 346 | 354 | +8 | <= 400 | ⚠️ Warning (DEBT-ACTIVITY-LOG-SUBMODULE) |
| `src/client/events/subscribers/badge_event_subscriber.ts` | Tier 1 (Domain/FSM/Server) | 262 | 270 | +8 | <= 400 | Safe |
| `tests/contracts/imp368_go_salary_deductions_transparency.test.ts` | Living Test | 6 | 6 | 0 | <= 600 | Safe |

## 3. Implementation Steps

### Station 1: Red Contract Test Specifications
**Target physical file**: `tests/contracts/imp368_go_salary_deductions_transparency.test.ts`
- TC-368.01 [UC-IMP368/MSS]: Given GO_SALARY event with propertyTax (1000) and mortgageInterest (75), When activity log subscriber runs, Then formats message containing "(khấu trừ: thuế 1.000, lãi thế chấp 75)".
- TC-368.02 [UC-IMP368/MSS]: Given GO_SALARY event with only taxDeduction (1000), When activity log subscriber runs, Then formats message containing "(khấu trừ: thuế 1.000)".
- TC-368.03 [UC-IMP368/MSS]: Given GO_SALARY event with zero deductions, When activity log subscriber runs, Then formats message without deduction parenthesis.
- TC-368.04 [UC-IMP368/MSS]: Given GO_SALARY event with propertyTax (1000) and mortgageInterest (75), When badge subscriber runs, Then emits badge with formula containing "(thuế: -1.000, lãi thế chấp: -75)".
- TC-368.05 [UC-IMP368/MSS]: Given GO_SALARY event with overdraft (3300) and creditFee (400), When activity log subscriber runs, Then formats message containing "thấu chi 3.300, phí thẻ 400".

### Station 2: Implementation (GREEN)

#### Task 1: Comprehensive Deductions in `src/client/events/subscribers/activity_log_subscriber.ts`
**Target physical file**: `src/client/events/subscribers/activity_log_subscriber.ts`
```typescript
<<<<
    case SynthesizedGameEventType.GO_SALARY: {
      const playerName = resolvePlayerName(context, event.playerId);
      const taxStr = event.taxDeduction > 0 ? ` (khấu trừ thuế: ${formatCurrency(event.taxDeduction)})` : '';
      return {
        id,
        timestamp,
        type: 'salary',
        message: `${playerName} nhận lương vượt GO ${formatCurrency(event.grossSalary)}${taxStr}`,
        playerId: event.playerId,
        playerName,
        amount: event.netAmount,
        playerTokenColor: resolvePlayerTokenColor(context, event.playerId),
      };
    }
====
    case SynthesizedGameEventType.GO_SALARY: {
      const playerName = resolvePlayerName(context, event.playerId);
      const parts: string[] = [];
      const d = event.deductions;
      const tax = d?.propertyTax ?? event.taxDeduction;
      if (tax > 0) parts.push(`thuế ${formatCurrency(tax)}`);
      if (d?.mortgageInterest && d.mortgageInterest > 0) parts.push(`lãi thế chấp ${formatCurrency(d.mortgageInterest)}`);
      if (d?.overdraft && d.overdraft > 0) parts.push(`thấu chi ${formatCurrency(d.overdraft)}`);
      if (d?.creditFee && d.creditFee > 0) parts.push(`phí thẻ ${formatCurrency(d.creditFee)}`);
      const deductionStr = parts.length > 0 ? ` (khấu trừ: ${parts.join(', ')})` : '';
      return {
        id,
        timestamp,
        type: 'salary',
        message: `${playerName} nhận lương vượt GO ${formatCurrency(event.grossSalary)}${deductionStr}`,
        playerId: event.playerId,
        playerName,
        amount: event.netAmount,
        playerTokenColor: resolvePlayerTokenColor(context, event.playerId),
      };
    }
>>>>
```

#### Task 2: Itemized Formula in `src/client/events/subscribers/badge_event_subscriber.ts`
**Target physical file**: `src/client/events/subscribers/badge_event_subscriber.ts`
```typescript
<<<<
    case SynthesizedGameEventType.GO_SALARY: {
      const delay = pacing.getPawnPassGoDelay(event.playerId);
      const taxFormula = event.taxDeduction > 0 ? ` (thuế: -${formatCurrency(event.taxDeduction)})` : '';

      pacing.scheduleAction(() => {
        state.addFloatingText({
          text: `+${formatCurrency(event.netAmount)}`,
          type: FloatingTextType.Reward,
          playerId: event.playerId,
          actionType: 'salary',
          title: 'Lương Vượt Ô Bắt Đầu',
          formula: `Hoàn thành 1 vòng sa bàn (+${formatCurrency(event.grossSalary)} Tr.)${taxFormula}`,
        });
      }, delay);
      break;
    }
====
    case SynthesizedGameEventType.GO_SALARY: {
      const delay = pacing.getPawnPassGoDelay(event.playerId);
      const parts: string[] = [];
      const d = event.deductions;
      const tax = d?.propertyTax ?? event.taxDeduction;
      if (tax > 0) parts.push(`thuế: -${formatCurrency(tax)}`);
      if (d?.mortgageInterest && d.mortgageInterest > 0) parts.push(`lãi thế chấp: -${formatCurrency(d.mortgageInterest)}`);
      if (d?.overdraft && d.overdraft > 0) parts.push(`thấu chi: -${formatCurrency(d.overdraft)}`);
      if (d?.creditFee && d.creditFee > 0) parts.push(`phí thẻ: -${formatCurrency(d.creditFee)}`);
      const deductionFormula = parts.length > 0 ? ` (${parts.join(', ')})` : '';

      pacing.scheduleAction(() => {
        state.addFloatingText({
          text: `+${formatCurrency(event.netAmount)}`,
          type: FloatingTextType.Reward,
          playerId: event.playerId,
          actionType: 'salary',
          title: 'Lương Vượt Ô Bắt Đầu',
          formula: `Hoàn thành 1 vòng sa bàn (+${formatCurrency(event.grossSalary)} Tr.)${deductionFormula}`,
        });
      }, delay);
      break;
    }
>>>>
```

## 4. Definition of Done (DoD) & Stopping Criteria
1. **Contract Parity**: All 5 contract tests in `imp368_go_salary_deductions_transparency.test.ts` pass 100%.
2. **Zero Living Regression**: All existing suites in `tests/client/imp332*` and `tests/client/imp333*` pass with 0 regressions.
3. **Mechanical Pre-Filter**: `npm run prefilter` passes with 0 type errors, 0 dirty casts, LOC budgets respected.
4. **Knowledge Fold**: `docs/FEATURE_MAP.md` updated with multi-deduction salary narrative invariant.
5. **No Code Churn**: After Station 3 sign-off, no further exploratory edits permitted.
