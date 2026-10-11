# Plan IMP-360: Concise Causal Event Card Descriptions

## 0. Context & Prior In-Flight Scope (Uncommitted)
- **Prior In-Flight Scope (Uncommitted)**:
  - `scripts/check_evidence.mjs`
  - `scripts/visual_capture/scenario_evaluator.mjs`
  - `src/client/ui/player_card.tsx`
  - `src/client/ui/top_bar.tsx`
  - `.agents/plans/PLAN_IMP_359_PLAYER_CARD_TACTILE_POLISH.md`
  - `docs/reports/improvements/IMP-359-player-card-tactile-polish_report.md`
  - `scripts/sentinel_probes/IMP-359.json`
  - `src/client/ui/player_net_worth_badge.tsx`
  - `tests/client/imp359_player_card_tactile_polish.test.ts`

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-360`
- **Subsystem**: `domain-core`
- **Problem Statement**:
  1. In IMP-140 and IMP-322, event card `effectDetail` fields were expanded into lengthy legal descriptions (> 100-180 chars) to prevent misunderstanding.
  2. On mobile portrait viewports (360-390px), `MilestoneBanner` applies `line-clamp-2`, truncating 30 out of 36 cards (83.3%) mid-sentence (e.g. `MC_FUEL_SURGE` truncates right at the consequence: *"Trong 2 vòng tới, cướ..."*).
  3. Players lose critical information about the consequence/duration while reading redundant thematic verbiage.
- **Architectural Solution**:
  1. In `src/domain/event_card_metadata.ts`, streamline all overly long `effectDetail` entries across `CHANCE_CARD_DETAILS` and `MARKET_CARD_DETAILS` into high-clarity 2-part causal structures: `[Hành động/Nguyên nhân tức thì] + [Hiệu lực/Kết quả tương lai]`.
  2. Enforce character count ceiling `<= 78 characters` per card so 100% of event cards fit neatly inside 2 lines on mobile without truncation.
  3. Preserve 100% economic numbers, keywords, and backward compatibility with existing contract tests (e.g. `1.5x tiền thuê`, `60% thay vì 50%`, `20% chi phí xây dựng`, `10% khi vượt GO`, `1.500`, `3.000`, `1.000`).
- **Direct Scope (Physical Files)**:
  - `src/domain/event_card_metadata.ts`
  - `tests/domain/imp360_concise_causal_event_descriptions.test.ts`

## 2. Planned Changes & LOC Budget

| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/domain/event_card_metadata.ts` | Tier 1 (Domain/Server/Logic) | 322 | 322 | 0 | <= 400 | ⚠️ Warning (Near Ceiling) |
| `tests/domain/imp360_concise_causal_event_descriptions.test.ts` | Living Test | 0 | 58 | +58 | <= 600 | 🆕 Tệp mới (✔️ Safe) |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
**Target physical file**: `tests/domain/imp360_concise_causal_event_descriptions.test.ts`

Test Specifications:
- TC-360.01 [UC-META/MSS]: Given MARKET_CARD_DETAILS, When checking effectDetail length, Then all 16 market cards have length <= 78 characters.
- TC-360.02 [UC-META/MSS]: Given CHANCE_CARD_DETAILS, When checking effectDetail length, Then all 20 chance cards have length <= 78 characters.
- TC-360.03 [UC-META/A1]: Given MC_FUEL_SURGE, When inspecting effectDetail, Then specifies immediate surcharge 500 and 2-round transit hike.
- TC-360.04 [UC-META/A2]: Given MC_CASINO_PILOT, When inspecting effectDetail, Then retains tier rewards 1.500, 3.000, and lowest balance stimulus 1.000.
- TC-360.05 [UC-META/A3]: Given MC_RATE_HIKE, When inspecting effectDetail, Then preserves all statutory percentages.
- TC-360.06 [UC-META/A4]: Given MC_URBAN_PLANNING, When inspecting effectDetail, Then preserves all statutory percentages.
- TC-360.07 [UC-META/A5]: Given all 36 cards, When joined together, Then zero occurrences of forbidden unit "Tr.".

### Station 2: Minimal Production Implementation (GREEN)
**Target physical file**: `src/domain/event_card_metadata.ts`

```typescript
<<<<
// [UC-GAME-038..041/MSS] Metadata, descriptions and financial deltas for Chance & Market cards
====
// [UC-GAME-038..041/MSS][IMP-360] Metadata, descriptions and financial deltas for Chance & Market cards
>>>>
```

## 4. Verification & Mechanical Gates
- Gate 1 (Plan Audit): `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_360_CONCISE_CAUSAL_EVENT_DESCRIPTIONS.md --auto-sign`
- Gate 2 (Scope): `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_360_CONCISE_CAUSAL_EVENT_DESCRIPTIONS.md`
- Gate 3 (Prefilter): `npx vitest run tests/domain/imp360_concise_causal_event_descriptions.test.ts`
- Gate 4 (LOC Budget): `node scripts/check_loc.mjs src/domain/event_card_metadata.ts tests/domain/imp360_concise_causal_event_descriptions.test.ts`
