# PILLAR II: ECONOMY & TREASURY INVARIANTS

> **Scope**: `src/domain/property_*`, `src/domain/treasury_*`, `src/domain/bond_*`, `src/domain/insolvency_*`  
> **Gotchas SSOT Rule**: Concise architectural invariant rulebook. Anti-Changelog: Keep technical formulas, limits, and negative constraints; omit narrative stories. Size ceiling: <= 15 KB.

---

1. **Treasury Conservation Invariant**:
   - Total game currency is conserved: $\Delta \text{System} = \Delta \text{Players} + \Delta \text{Treasury}$. All penalties (repairs, taxes, bailouts) not paid to another player MUST flow into `Treasury`. Currency destruction or leaks are strictly forbidden.

2. **Insolvent Entity Role Guard**:
   - Entities with negative balance (`balance < 0` in `InsolvencyPhase`) are FORBIDDEN from acting as `buyer` in P2P trades or trading with negative net cash (`price <= 0`). Insolvent entities may only act as `seller` with positive proceeds (`price > 0`).

3. **Dynamic Pricing SSOT**:
   - Hardcoding property prices in client/UI logic is prohibited. Property values must be retrieved from `PROPERTY_DEEDS.get(cellIndex)?.price`.

4. **Pre-Consumption Valuation Invariant**:
   - When activating fee exemptions or card waivers (`CC_DIPLOMATIC`), compute base gross rent (`calculateRent`) prior to card consumption to record actual saved amounts in narrative logs.

5. **Mortgaged Property P2P Debt Migration SSOT**:
   - When mortgaged properties are traded via P2P (floor price 35% instead of 70%), principal loan liability (`mortgageLoans[cell]`) and portfolio membership (`mortgagedProperties`) must migrate atomically from seller to buyer in `executeP2PTrade`.

6. **Auction Clean Title & Senior Treasury Payoff SSOT**:
   - Winning bidders receive clean unencumbered titles (`isMortgaged = false`, removing `unbuiltRounds`). For foreclosed assets, Treasury is senior lienholder: winning bid pays mortgage loan balances first (`Math.min(winningBid, loan)` to `room.treasury`), returning surplus to debtor. Unowned sales remit 100% to Treasury.

7. **Utility Revenue & Anti-Camping SSOT**:
   - Utility tiles (12 EVN & 28 Viettel) use flat landing fees (1 owned: 1,000, 2 owned: 2,500, Smart Grid/5G: 3,500 M VND). Network tolls (EVN GO pass: C1=100, C2=200, C3=300 M; Viettel card draw: 150 M) enforce 4 guards: (1) Locked while owner is in Audit; (2) Locked while mortgaged; (3) Self-Billing Exemption; (4) Non-inflationary Sink during debtor insolvency (owner collects only available liquid cash).

8. **Auction Invariant Conservation & Off-Turn Actor Parity**:
   - Real estate auctions transfer cash from bidder into Treasury or clear debt ($\Delta \text{System} = 0$). Watchdogs must not flag bot bids as spurious out-of-turn anomalies.

9. **Corporate Bond Tranches & Collateral Selection**:
   - 3 Tranches: `WORKING_CAPITAL` (20% NW), `EXPANSION` (40% NW), `ALL_IN` (60% NW). Collateral selection sorts ascending by property price, locking only minimum cheapest properties to satisfy collateral ratio and $\ge 2$ properties. On repayment, Treasury collects ONLY actual interest differential (`Math.max(0, repayAmount - principal)`).

10. **Land Registration Fee SSOT & Visual Parity**:
    - Tile 04 (`CellType.Tax`) applies progressive tax: 10% of player liquid cash (capped at 2,000 M VND, remitted to Treasury). Textures, action dock, and specs must state `10% LIQUID CASH`.

11. **Financial Activity Log Collision & Pure Delta Disambiguation**:
    - Passing GO is verified by comparing `prevPos` with `newPos`. If `prevPos === newPos`, player did not traverse the board.
    - Net zero balance changes (e.g. +2,000 salary and -2,000 rent) emit synthetic `diff: 0` entries so both events generate distinct activity logs. Tag `(insolvent)` only when `payerBalance < 0` actually holds.

12. **Escalating Audit Bailout SSOT**:
    - Bailout penalties scale by violation count (`auditCount`): 1st: 500 M, 2nd: 1,000 M, 3rd+: 2,000 M VND (`calculateBailAmount(auditCount)`). `auditCount` increments solely upon entering audit in `sendToAudit`.

13. **Zero-Delta Event Suppression & Audit Teleportation Immunity**:
    - In `collectPayersAndReceivers`, `hasPassedGo` must explicitly exclude being sent to audit (`!isSentToAudit`).
    - Handlers `processPayerFee` and `processReceiverReward` MUST exit early if `Math.abs(amount) <= 0`. Zero-value changes must never emit logs or badges.

14. **Utility Monopoly Upgrade Requirement**:
    - Upgrading to Smart Grid/5G requires owning both Utilities with neither mortgaged. If either is mortgaged or transferred, landing fees automatically de-escalate to 1,000 M VND.

15. **Macroeconomic Policy Polarity & Opposing Modifiers**:
    - Opposing cards (`MC_CREDIT_STIMULUS` vs `MC_RATE_HIKE`): Stimulus takes absolute precedence on mortgage interest rate (rate remains 0%). Upgrade cost multipliers compound sequentially: `Math.floor(Math.floor(base * 0.8) * 1.2)`. UI evaluators invoke authoritative `calculateUpgradeCost`.

16. **Pass-GO Multi-Transaction Sequential Accounting**:
    - Financial obligations arising from crossing GO MUST be decomposed sequentially in `extractPassedGoActivities` (Salary, Overdraft, Credit Interest, Property Taxes, Mortgage Interest). Netting in `processPayerFee` is prohibited. Numeric fields check `!== undefined`.

17. **40-Cell Characterization Baseline Invariant**:
    - Modifications to rent curves, auctions, mortgages, or taxes MUST execute or establish a 40-cell characterization snapshot test prior to edits as an authoritative baseline. Neutral conditions must match 100% of baseline values.
