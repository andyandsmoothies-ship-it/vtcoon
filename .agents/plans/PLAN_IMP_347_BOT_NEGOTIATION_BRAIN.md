# Plan IMP-347: Bot Negotiation Brain Decoupling

## 0. Context & Prior In-Flight Scope (Uncommitted)
- **Prior In-Flight Scope (Uncommitted)**:
  - `docs/reports/uat/uat_game_2_players_step_by_step.md`
  - `src/client/events/subscribers/audio_event_subscriber.ts`
  - `src/client/events/subscribers/property_market_badge_handler.ts`
  - `src/client/network/apply_delta.ts`
  - `src/client/network/client_session_purger.ts`
  - `src/client/store/game_store.ts`
  - `src/client/ui/transaction_narrative.ts`
  - `tests/client/anti_aliasing_and_visual_crispness.test.ts`
  - `tests/client/imp330_game_event_narrative_synthesizer.test.ts`
  - `tests/client/imp346_delta_presentation_decoupling.test.ts`
  - `scripts/sentinel_probes/IMP-346.json`
  - `.agents/plans/PLAN_IMP_346_DELTA_PRESENTATION_DECOUPLING.md`
  - `docs/reports/improvements/IMP-346-delta-presentation-decoupling_report.md`

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-347`
- **Subsystem**: `bot-domain`
- **Problem Statement**:
  1. Cognitive AI heuristics and 1.60x Bot-to-Bot parity threshold reside inside `src/server/trade_coordinator_helper.ts` instead of the domain layer.
  2. Cooldown rejection memory tracking (`cellTradeRejections`, `cellLastRejectedRound`, `swapPairLastRejectedRound`) is fragmented across server files, creating memory drift on timeouts and liquidation leaks.
  3. `coordRespondTradeOffer` lacks a quiescence guard (`isRoomQuiescentForTrade`), risking trade execution during Auction or Insolvency phases upon late modal accepts.
  4. Predatory swap deals and low-cash distress fire-sales in `bot_trade.ts` allow human players or leading bots to exploit bots into surrendering high-tier monopoly assets.
  5. Blacklist approach in 1.60x parity override risks forcing acceptance when bots lack funds or breach safety buffers.
- **Architectural Solution**:
  1. **Pure Domain Deep Module**: Create `src/domain/bot/bot_negotiation_brain.ts` operating strictly on pure domain entities (`Room`, `Player`, `PropertyRegistry`, `PropertyStateMap`, `BotPersonality`) with zero server imports.
  2. **Unified Negotiation Evaluation**: Consolidate trade decision pipeline (`evaluateBotTradeDecision`) enforcing a Net Equity Floor on swap deals (ADV-01) and confining 1.60x parity override strictly via Whitelist to non-embargo cash-only trades with `PRICE_TOO_LOW` (ADV-02).
  3. **Root-Level Kingmaking Defense**: Patch `src/domain/bot/bot_trade.ts` to uphold `KINGMAKING_DEFENSE` unconditionally when dealing with dominant players, eliminating the `balance < 2000` distress bypass (ADV-03).
  4. **Centralized Cooldown Memory SSOT & Anti-TIDD**: Implement `recordTradeRejection` and `clearTradeRejectionForCell`, integrating real consumers into `room_trade_coordinator.ts` and `room_manager.ts` (ADV-05).
  5. **Server Quiescence Hardening**: Guard `coordRespondTradeOffer` with `isRoomQuiescentForTrade` to reject non-quiescent asynchronous acceptances with `INVALID_PHASE` (ADV-04).
- **Direct Scope (Physical Files)**:
  - `src/domain/bot/bot_negotiation_brain.ts`
  - `src/domain/bot/bot_trade.ts`
  - `src/server/trade_coordinator_helper.ts`
  - `src/server/room_trade_coordinator.ts`
  - `src/server/room_manager.ts`
  - `tests/domain/imp347_bot_negotiation_brain.test.ts` (New file)

## 2. Planned Changes & LOC Budget

| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/domain/bot/bot_negotiation_brain.ts` | Tier 1 (Domain/Server/Logic) | 48 | 82 | +34 | <= 400 | ✔️ Safe |
| `src/domain/bot/bot_trade.ts` | Tier 1 (Domain/Server/Logic) | 263 | 263 | 0 | <= 400 | ✔️ Safe |
| `src/server/trade_coordinator_helper.ts` | Tier 1 (Domain/Server/Logic) | 48 | 38 | -10 | <= 400 | ✔️ Safe |
| `src/server/room_trade_coordinator.ts` | Tier 1 (Domain/Server/Logic) | 219 | 223 | +4 | <= 400 | ✔️ Safe |
| `src/server/room_manager.ts` | Tier 1 (Domain/Server/Logic) | 351 | 349 | -2 | <= 400 | ⚠️ Warning (>= 300 LOC Tech Debt) |
| `tests/domain/imp347_bot_negotiation_brain.test.ts` | Living Test | 0 | 260 | +260 | <= 600 | 🆕 New file (✔️ Safe) |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
**Target physical file**: `tests/domain/imp347_bot_negotiation_brain.test.ts` (New file)

Test Specifications:
- TC-347.01 [UC-BRAIN/MSS]: Given standard cash-only trade offer exceeding 1.40x base price without monopoly or embargo risk, When evaluateBotTradeDecision executes, Then returns accept: true.
- TC-347.02 [UC-BRAIN/A1]: Given human offers low-tier Brown cell 1 ($600) + demands $500 cash for Bot high-tier Dark Blue cell 39 ($4,000) that gives Brown monopoly to Bot, When evaluateBotTradeDecision executes, Then rejects with UNFAVORABLE_VALUATION due to Net Equity Floor violation.
- TC-347.03 [UC-BRAIN/A2]: Given runaway leader Bot A offers 1.65x base price for monopoly key cell 32 to Bot B, When evaluateBotTradeDecision executes, Then upholds EMBARGO_LEADER and refuses 1.60x parity override.
- TC-347.04 [UC-BRAIN/A3]: Given impoverished seller Bot with balance < 2000 receiving monopoly key offer from wealthiest player, When evaluateBotTradeDecision executes, Then triggers KINGMAKING_DEFENSE and rejects fire-sale pricing.
- TC-347.05 [UC-BRAIN/A4]: Given pending trade offer modal active during PropertyManagement, When server phase transitions to AuctionPhase and player responds accept: true, Then coordRespondTradeOffer rejects with INVALID_PHASE without mutating assets.
- TC-347.06 [UC-BRAIN/A5]: Given pending hybrid trade offer times out in checkPendingTradeTimeout, When timeout handler runs, Then recordTradeRejection sets lastTradeOfferRound, cellTradeRejections, cellLastRejectedRound, and swapPairLastRejectedRound atomically.
- TC-347.07 [UC-BRAIN/A6]: Given property with prior bot rejections transferred via trade accept, When clearTradeRejectionForCell executes, Then cleanses stale rejection counts on all active players.
- TC-347.08 [UC-BRAIN/A7]: Given swap trade offer where bot lacks cash to pay difference (INSUFFICIENT_FUNDS), When evaluateBotTradeDecision executes, Then Whitelist parity prevents 1.60x override and upholds rejection.

### Station 2: Minimal Production Implementation (GREEN)

#### Task 1: Expand Pure Domain Bot Negotiation Brain
**Target physical file**: `src/domain/bot/bot_negotiation_brain.ts`

```typescript
<<<<
import { BotPersonality } from './bot_types.js';
====
import { BotPersonality } from './bot_types.js';
import { PROPERTY_DEEDS } from '../property_data.js';
import { evaluateBotTradeAcceptance } from './bot_trade.js';
import { evaluateBotSwapAcceptance } from './bot_hybrid_trade.js';
>>>>
```

```typescript
<<<<
export function evaluateBotTradeDecision(
  _context: BotNegotiationContext,
  _seller: Player,
  _buyer: Player,
  _cellIndex: number,
  _price: number,
  _offeredCellIndex?: number,
): BotNegotiationDecision {
  return { accept: false, reason: 'NOT_IMPLEMENTED' };
}
====
export function evaluateBotTradeDecision(
  context: BotNegotiationContext,
  seller: Player,
  buyer: Player,
  cellIndex: number,
  price: number,
  offeredCellIndex?: number,
): BotNegotiationDecision {
  const botPers = context.botPersonalities?.get(`${context.room.roomCode}:${seller.id}`)
    ?? context.botPersonalities?.get(seller.id)
    ?? BotPersonality.Balanced;

  let decision = offeredCellIndex !== undefined
    ? evaluateBotSwapAcceptance(offeredCellIndex, cellIndex, -price, seller, buyer, context.room, context.registry, context.stateMap, botPers)
    : evaluateBotTradeAcceptance(cellIndex, price, seller, buyer, context.room, context.registry, context.stateMap, botPers);

  // [ADV-01 Net Equity Floor]: Chặn bẫy thâu tóm độc quyền bất cân xứng trong Swap trade
  if (offeredCellIndex !== undefined && decision.accept) {
    const deedOffered = PROPERTY_DEEDS.get(cellIndex);
    const baseOffered = deedOffered?.price ?? 1000;
    const deedReceived = PROPERTY_DEEDS.get(offeredCellIndex);
    const baseReceived = deedReceived?.price ?? 1000;
    const cashPaidByBot = -price;
    const totalValueReceived = baseReceived - cashPaidByBot;
    if (totalValueReceived < Math.round(baseOffered * 0.65)) {
      return { accept: false, reason: 'UNFAVORABLE_VALUATION' };
    }
  }

  // [ADV-02 Whitelist Parity 1.60x]: CHỈ áp dụng cho Cash-only trade và CHỈ KHI lý do từ chối là PRICE_TOO_LOW
  if (!decision.accept && buyer.isBot && offeredCellIndex === undefined) {
    if (decision.reason === 'PRICE_TOO_LOW') {
      const baseTarget = PROPERTY_DEEDS.get(cellIndex)?.price ?? 1000;
      if (price >= Math.round(1.60 * baseTarget)) {
        decision = { accept: true };
      }
    }
  }

  return decision;
}
>>>>
```

#### Task 2: Patch Kingmaking Defense in Bot Trade
**Target physical file**: `src/domain/bot/bot_trade.ts`

```typescript
<<<<
  const isCompetitiveDuel = Boolean(room?.started && activePlayers.length === 2 && activePlayers.some((p) => !p.isBot));

  if (givesMonopolyToBuyer && isCompetitiveDuel) {
    return { accept: false, reason: 'PREVENT_MONOPOLY' };
  }
====
  const isCompetitiveDuel = Boolean(room?.started && activePlayers.length === 2 && activePlayers.some((p) => !p.isBot));

  if (givesMonopolyToBuyer && isCompetitiveDuel) {
    return { accept: false, reason: 'PREVENT_MONOPOLY' };
  }

  if (givesMonopolyToBuyer && (buyer.balance >= 30_000 || buyer.balance > sellerBot.balance * 3)) {
    return { accept: false, reason: 'KINGMAKING_DEFENSE' };
  }
>>>>
```

```typescript
<<<<
  if (pers === BotPersonality.Balanced) {
    if (sellerBot.balance >= 2000 && (buyer.balance >= 30_000 || buyer.balance > sellerBot.balance * 3)) {
      return { accept: false, reason: 'KINGMAKING_DEFENSE' };
    }
    if (givesMonopolyToBuyer) {
====
  if (pers === BotPersonality.Balanced) {
    if (givesMonopolyToBuyer) {
>>>>
```

#### Task 3: Decouple Trade Coordinator Helper
**Target physical file**: `src/server/trade_coordinator_helper.ts`

```typescript
<<<<
import { BotPersonality } from '../domain/bot/bot_types.js';
import { PROPERTY_DEEDS } from '../domain/property_data.js';
import { evaluateBotTradeAcceptance } from '../domain/bot/bot_trade.js';
import { evaluateBotSwapAcceptance } from '../domain/bot/bot_hybrid_trade.js';
====
import {
  evaluateBotTradeDecision,
  recordTradeRejection,
} from '../domain/bot/bot_negotiation_brain.js';
>>>>
```

```typescript
<<<<
  // Khi buyer trả price cho seller Bot, số tiền Bot phải trả là -price
  let decision = offeredCellIndex !== undefined
    ? evaluateBotSwapAcceptance(offeredCellIndex, cellIndex, -price, seller, buyer, ctx.room, ctx.reg, ctx.sm, botPers)
    : evaluateBotTradeAcceptance(cellIndex, price, seller, buyer, ctx.room, ctx.reg, ctx.sm, botPers);

  // Bot-to-Bot parity threshold (>= 1.60x)
  if (!decision.accept && buyer.isBot) {
    const totalOffered = (offeredCellIndex !== undefined ? (PROPERTY_DEEDS.get(offeredCellIndex)?.price ?? 0) : 0) + price;
    const baseTarget = PROPERTY_DEEDS.get(cellIndex)?.price ?? 1000;
    if (totalOffered >= Math.round(1.60 * baseTarget)) {
      decision = { accept: true };
    }
  }

  if (!decision.accept) {
    if (buyer.isBot) {
      const round = ctx.room.roundCount ?? ctx.room.round ?? 1;
      buyer.lastTradeOfferRound = round;
      (buyer.cellTradeRejections ??= {})[cellIndex] = ((buyer.cellTradeRejections ??= {})[cellIndex] ?? 0) + 1;
      (buyer.cellLastRejectedRound ??= {})[cellIndex] = round;
      if (offeredCellIndex !== undefined) {
        (buyer.swapPairLastRejectedRound ??= {})[`${cellIndex}_${offeredCellIndex}`] = round;
      }
    }
    return { success: false, reason: ActionRejectReason.TRADE_REJECTED };
  }
  return { success: true };
====
  const decision = evaluateBotTradeDecision(
    { room: ctx.room, registry: ctx.reg, stateMap: ctx.sm, botPersonalities: ctx.botPersonalities },
    seller,
    buyer,
    cellIndex,
    price,
    offeredCellIndex,
  );

  if (!decision.accept) {
    if (buyer.isBot) {
      const round = ctx.room.roundCount ?? ctx.room.round ?? 1;
      recordTradeRejection(buyer, cellIndex, round, offeredCellIndex);
    }
    return { success: false, reason: ActionRejectReason.TRADE_REJECTED };
  }
  return { success: true };
>>>>
```

#### Task 4: Decouple Room Trade Coordinator and Wire Quiescence Guard & Memory Purge
**Target physical file**: `src/server/room_trade_coordinator.ts`

```typescript
<<<<
import { handleBotRecipientTrade } from './trade_coordinator_helper.js';
====
import { handleBotRecipientTrade } from './trade_coordinator_helper.js';
import {
  recordTradeRejection,
  clearTradeRejectionForCell,
} from '../domain/bot/bot_negotiation_brain.js';
>>>>
```

```typescript
<<<<
  if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };

  const session = pendingTradeManager.getSessionByOfferId(offerId);
====
  if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
  if (!isRoomQuiescentForTrade(ctx.room)) {
    return { success: false, reason: ActionRejectReason.INVALID_PHASE };
  }

  const session = pendingTradeManager.getSessionByOfferId(offerId);
>>>>
```

```typescript
<<<<
    buyer.lastTradeOfferRound = ctx.room.roundCount ?? ctx.room.round ?? 1;
    delete buyer.cellTradeRejections?.[session.cellIndex];
    delete buyer.cellLastRejectedRound?.[session.cellIndex];
    pendingTradeManager.resolveSession(ctx.room.roomCode, offerId, true, playerId);
====
    buyer.lastTradeOfferRound = ctx.room.roundCount ?? ctx.room.round ?? 1;
    clearTradeRejectionForCell(ctx.room.players, session.cellIndex);
    if (session.offeredCellIndex !== undefined) {
      clearTradeRejectionForCell(ctx.room.players, session.offeredCellIndex);
    }
    pendingTradeManager.resolveSession(ctx.room.roomCode, offerId, true, playerId);
>>>>
```

```typescript
<<<<
    const round = ctx.room.roundCount ?? ctx.room.round ?? 1;
    buyer.lastTradeOfferRound = round;
    (buyer.cellTradeRejections ??= {})[session.cellIndex] = ((buyer.cellTradeRejections ??= {})[session.cellIndex] ?? 0) + 1;
    (buyer.cellLastRejectedRound ??= {})[session.cellIndex] = round;
    if (buyer.isBot && session.offeredCellIndex !== undefined) {
      (buyer.swapPairLastRejectedRound ??= {})[`${session.cellIndex}_${session.offeredCellIndex}`] = round;
    }
    pendingTradeManager.resolveSession(ctx.room.roomCode, offerId, false, playerId);
====
    const round = ctx.room.roundCount ?? ctx.room.round ?? 1;
    recordTradeRejection(buyer, session.cellIndex, round, session.offeredCellIndex);
    pendingTradeManager.resolveSession(ctx.room.roomCode, offerId, false, playerId);
>>>>
```

#### Task 5: Eliminate Timeout Memory Drift in Room Manager
**Target physical file**: `src/server/room_manager.ts`

```typescript
<<<<
import { pendingTradeManager, type PendingTradeSession } from './pending_trade_manager.js';
====
import { pendingTradeManager, type PendingTradeSession } from './pending_trade_manager.js';
import { recordTradeRejection } from '../domain/bot/bot_negotiation_brain.js';
>>>>
```

```typescript
<<<<
        const buyer = room.players.find((p) => p.id === res.session?.buyerId);
        if (buyer) {
          const round = room.roundCount ?? room.round ?? 1;
          buyer.lastTradeOfferRound = round;
          (buyer.cellTradeRejections ??= {})[res.session.cellIndex] = ((buyer.cellTradeRejections ??= {})[res.session.cellIndex] ?? 0) + 1;
          (buyer.cellLastRejectedRound ??= {})[res.session.cellIndex] = round;
        }
====
        const buyer = room.players.find((p) => p.id === res.session?.buyerId);
        if (buyer) {
          const round = room.roundCount ?? room.round ?? 1;
          recordTradeRejection(buyer, res.session.cellIndex, round, res.session.offeredCellIndex);
        }
>>>>
```

## 4. Machine Verification Gates
- Plan Audit: `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_347_BOT_NEGOTIATION_BRAIN.md --auto-sign`
- Scope Confinement: `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_347_BOT_NEGOTIATION_BRAIN.md`
- Fast Pre-Filter: `npm run prefilter -- src/domain/bot/bot_negotiation_brain.ts src/domain/bot/bot_trade.ts src/server/trade_coordinator_helper.ts src/server/room_trade_coordinator.ts src/server/room_manager.ts tests/domain/imp347_bot_negotiation_brain.test.ts`
- Sentinel Mutation: `npm run sentinel -- --ticket IMP-347 --test tests/domain/imp347_bot_negotiation_brain.test.ts`
- Evidence Audit: `node scripts/check_evidence.mjs IMP-347`
