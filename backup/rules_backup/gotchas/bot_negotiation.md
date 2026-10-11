# PILLAR III: BOT NEGOTIATION & VALUATION INVARIANTS

> **Scope**: `src/domain/bot/`, `src/domain/p2p_trade.ts`, `src/domain/property_valuation.ts`

---

1. **Multi-Agent Harassment Guard**: In P2P trades, trade proposal cooldowns MUST be scoped to Target / Room scope (`room.lastTargetTradeOfferRound`), not merely Actor scope, preventing $N$ bots from concurrently spamming trade offers to a single player within the same round.
2. **Surplus Property & Bilateral Valuation**: Bot trade proposals evaluate surplus properties (unimproved isolated tiles unable to complete monopolies due to opponent blocks) along 3 axes: (a) base price differential; (b) monopoly completion value for partner (`partnerGetsMonopoly`); (c) Bot personality (Aggressive, Balanced, Passive).
3. **Leader Embargo Invariant**: Strategic bots reject trading away tiles that grant color monopolies to the leading player (`isLeadingPlayer`), unless compensated with overwhelming asset value.
4. **Instant Bot Coordination**: When human players propose trades to bots, the server must evaluate valuation and respond synchronously in 0ms (`pending: false`), never opening a 15-second countdown modal.
5. **Bot Action Pacing & Visual Feedback Hardening Invariant [IMP-219]**:
   - **Building Upgrade Pacing**: Following bot improvements (`nextLevelSum > prevLevelSum`), the subsequent step MUST receive a delay of at least `BOT_UPGRADE_OBSERVATION_DELAY_MS = 1500ms`. The flag `botJustUpgraded` auto-cleans inside `scheduleBotStep` and MUST NOT be cleared inside `clearRoom` (which is invoked at the start of each step), persisting until `destroyRoom`.
   - **P2P Trade vs. Ghost Rent Disambiguation**: When transferring properties via P2P between players/bots, `detectCellTrade` must assign `type: 'trade'`, `targetPlayerId`, `targetPlayerName`. Financial activity tracker `detectFinancialAndStatusActivities` must queue `buyerId` and `prevOwnerId` into `handledPayerIds`/`handledReceiverIds` BEFORE calling `matchRentTransactions` to prevent misattributing purchase cash as rent (Ghost Rent).
   - **HOSE Deduplication SSOT**: HOSE events assign `type: 'hose'` and manage deduplication key `${hr.playerId}_${hr.timestamp}_${hr.roll}` via `lastProcessedHoseKey`, exporting `resetHoseActivityTracker` for test fixtures and new match sessions.
   - **Bot Declines Land ➔ Triggers Auction**: When a bot lands on an unowned property and declines purchase (`declinedPlayerId`), the system logs `decline_auction` unless foreclosed (`!isForeclosure && !insolvencyPlayerId`).
6. **1v1 Competitive Duel Asymmetry & Inviolable Monopoly Defense [IMP-236]**:
   - **Cash Abundance Late-Game Purchase Override**: In duel contexts (`room?.started && activePlayers <= 2`), when a bot holds abundant liquidity (`balance >= basePrice * 2.5 && balance - basePrice >= threat.safetyBuffer`) without `manualRoll` overrides, Balanced/Aggressive bots are freed from late-game pacing penalties `pacingFactor < 1.0` (`round > 20`), continuing acquisitions without breaking normal multi-player decline logic.
   - **Infrastructure Denial Parity**: Defensive valuation models recognize infrastructure threats across Railroads (`Railroad`: opponent holding $\ge 2$ ports escalates denial multiplier to 1.15x–1.5x) and Utilities (`Utility`: opponent holding 1 tile escalates denial for the 2nd), eliminating color-group-only blind spots.
   - **Dynamic Duel Denial Ceiling**: In 1v1 play (`activePlayers <= 2`), the auction monopoly denial ceiling elevates to 2.8x (Aggressive) and 2.2x (Balanced), relaxing late-game valuation multipliers to 1.2x. In P2P trades, bots are strictly forbidden from selling monopoly-completing tiles to opponents for cash (`PREVENT_MONOPOLY`).
7. **`formatLocalizedBotPersonality` vs. `formatShortPlayerName` [IMP-238]**:
   - **Deceptive Trap**: Both functions share signature `(name: string) => string`, allowing unchecked substitution in TypeScript. However, their output categories differ:
     - `formatLocalizedBotPersonality("Thanh (Aggressive)")` → `"Thanh (Aggressive)"` ← **localizes/preserves label**
     - `formatShortPlayerName("Thanh (Aggressive)")` → `"Thanh"` ← **strips label completely**
   - **Verified Invariant**: `formatLocalizedBotPersonality` is used in UI when **retaining localized personality badges** (display context). `formatShortPlayerName` is used when **stripping badges to avoid text truncation** (compact display context). Interchanging them without declaring design intent is prohibited. `[UI/FORMATTER]`
