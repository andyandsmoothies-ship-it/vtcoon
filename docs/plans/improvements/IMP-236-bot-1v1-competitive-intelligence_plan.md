# KẾ HOẠCH NÂNG CẤP BOT AI ĐỐI KHÁNG 1v1 (COMPETITIVE DUEL AI PLAN) — REVISION 2

> **Mục tiêu**: Xóa bỏ hoàn toàn các điểm mù tự sát và nhường nhịn vô lý của Bot AI trong thế trận đối đầu 1v1 (hoặc khi đối đầu với người chơi dẫn đầu), đưa Bot về trạng thái tư duy đối kháng quyết liệt: **Cạnh tranh bằng mọi giá để giành chiến thắng**.
> **Ticket**: IMP-236
> **Trạng thái**: Revision 2 — Đã tiếp thu và khắc phục 100% 6 điểm phản biện đối kháng (P1–P6) từ đợt thẩm định cơ học và kiến trúc.

---

## BẢNG TIẾP THU CHỈ THỊ PHẢN BIỆN (REVISION DIRECTIVE COVERAGE TABLE)

| Mã Phản Biện | Mức Độ | Nội Dung Chỉ Thị | Vị Trí Khắc Phục Cụ Thể Trong Kế Hoạch | Trạng Thái |
| :--- | :---: | :--- | :--- | :---: |
| **P1** | 🔴 CRITICAL | Bảng LOC baseline sai lệch; thiếu phân biệt Total Lines vs Non-Empty SLOC | **Mục II**: Cập nhật bảng song song 2 chỉ số đo đạc vật lý từ `scripts/check_loc.mjs` (Total Lines và Non-Empty SLOC) cho cả 4 tệp. | ĐÃ XỬ LÝ |
| **P2** | 🔴 CRITICAL | Snippet `bot_engine.ts` không khớp đĩa; `hasAbundantCash` chưa tồn tại và thiếu anchor chính xác | **Mục IV, Task 1**: Khớp chính xác đoạn mã vật lý dòng 142–162 trong hàm `decideActionPhaseIntent`. Đoạn diff `<<<< ==== >>>>` chỉ rõ khai báo `hasAbundantCash` và inject đúng 2 vị trí bảo vệ định giá và softmax. | ĐÃ XỬ LÝ |
| **P3** | 🔴 CRITICAL | Snippet `valuation_engine.ts` rewrite toàn bộ function; thay đổi semantic guard từ `!cell?.colorGroup` sang `!cell` chưa được giải trình | **Mục IV, Task 2**: Giải trình rõ lý do mở rộng guard: ô Cảng/Tiện ích không có `colorGroup` (undefined), nếu giữ guard cũ sẽ bị early return chặn đứng. Cung cấp surgical diffs riêng cho `calculateMonopolyMultiplier` và `calculateDenialMultiplier`. | ĐÃ XỬ LÝ |
| **P4** | 🔴 CRITICAL | Snippet `calculateAuctionMaxBid` rewrite cả function dù chữ ký giống nhau | **Mục IV, Task 3**: Chỉ thay thế cục bộ dòng 64–68 tính toán `maxBid` và `adjustedValEstimated` thay vì viết lại toàn bộ hàm từ dòng 38. | ĐÃ XỬ LÝ |
| **P5** | 🔴 CRITICAL | Snippet `decideAuctionPhaseIntent` thiếu anchor bao đóng xác định | **Mục IV, Task 3**: Cung cấp anchor chính xác tuyệt đối dòng 177–195 trong hàm `decideAuctionPhaseIntent` cho nhánh `isOpponentMonopolyTarget`. | ĐÃ XỬ LÝ |
| **P6** | 🔴 CRITICAL | Nguy cơ loophole trong `isCompetitiveDuel` với test fixture `UC-IMP119/MSS-10` | **Mục IV, Task 4 & Mục V**: Khóa điều kiện `Boolean(room?.started && activePlayers.length === 2)`. Bảo toàn 100% fixture `imp119` (`room.started: undefined`) và `imp82` (3 người chơi). Bổ sung import `CellType` còn thiếu trong `bot_trade.ts`. | ĐÃ XỬ LÝ |

---

## I. KIẾN TRÚC & PHÂN TẦNG 4 TRẠM (4-STATION CLOSED-LOOP PIPELINE)

```text
               ┌────────────────────────────────────────────────────────┐
               │    4 TRẠM THI CÔNG NÂNG CẤP TRÍ TUỆ ĐỐI KHÁNG BOT      │
               └──────────────────────────┬─────────────────────────────┘
                                          │
    ┌─────────────────────────────────────┴─────────────────────────────────────┐
    ▼                                                                           ▼
[TRẠM 1: QA CONTRACT TESTS (RED)]                           [TRẠM 2: TRIỂN KHAI MÃ NGUỒN (GREEN)]
 • Suite test cô lập: tests/domain/bot_duel_intelligence.test.ts  • bot_engine.ts: Abundant Cash Override (Dòng 142–162)
 • 16 atomic tests theo chuẩn Detroit (Observable behavior) • valuation_engine.ts: Railroad & Utility Support (Severity 1.5)
 • Khẳng định thất bại trước khi sửa code                     • bot_auction.ts: Dynamic Denial Cap & Duel MaxBid
                                                              • bot_trade.ts: 1v1 Zero-Cash-For-Monopoly Guard
    ┌───────────────────────────────────────────────────────────────────────────┘
    │
    ▼
[TRẠM 2.5: FAST PRE-FILTER SWEEP] ──► Typecheck (tsc), LOC Budget (< 400), Zero Dirty Casts, Zero toLocaleString
    │
    ▼
[TRẠM 3: ĐỘC LẬP AUDIT & REVIEW] ───► Phase 3.1 Spec Gate -> Phase 3.2 Deep Architecture Gate
    │
    ▼
[TRẠM 4: ADVERSARIAL CHAOS PROBES] ─► Parity Wire Probe -> Dynamic Boundary -> Mutation Probe (>= 5 mutants)
```

---

## II. DANH SÁCH FILE VÀ NGÂN SÁCH LOC (LOC BUDGET)

**Target physical file**: `src/domain/bot/bot_engine.ts`
**Target physical file**: `src/domain/bot/valuation_engine.ts`
**Target physical file**: `src/domain/bot/bot_auction.ts`
**Target physical file**: `src/domain/bot/bot_trade.ts`
**Target physical file**: `tests/domain/bot_duel_intelligence.test.ts` (mới)

Bảng đo đạc vật lý thực tế qua công cụ `scripts/check_loc.mjs`:

| Tệp vật lý | Phân tầng | Total Lines (Đĩa) | Non-Empty SLOC | Dự kiến thay đổi (Delta) | LOC sau khi sửa | Ngưỡng trần Tier | Trạng thái |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `src/domain/bot/bot_engine.ts` | Tier 1 | 385 | 338 | +23 / -21 (+2) | 387 | <= 400 | ✔️ An toàn |
| `src/domain/bot/valuation_engine.ts` | Tier 1 | 226 | 197 | +55 / -26 (+29) | 255 | <= 400 | ✔️ An toàn |
| `src/domain/bot/bot_auction.ts` | Tier 1 | 211 | 189 | +46 / -24 (+22) | 233 | <= 400 | ✔️ An toàn |
| `src/domain/bot/bot_trade.ts` | Tier 1 | 252 | 222 | +20 / -8 (+12) | 264 | <= 400 | ✔️ An toàn |
| `tests/domain/bot_duel_intelligence.test.ts` | Test Suite | 0 (File mới) | 0 | +280 | 280 | <= 300 | ✔️ Đạt chuẩn |

---

## III. BỘ KIỂM THỬ HỢP ĐỒNG STATION 1 (16 ATOMIC TESTS - MA TRẬN 4 FACET)

File test mục tiêu: `tests/domain/bot_duel_intelligence.test.ts` (Ngân sách: 280 LOC)

#### Facet 1: Thu Mua Đất Tự Do & Trần Đấu Giá Khi Dư Dả Tiền Mặt (Case 1)
1. `TC-DUEL-BUY-01` Vòng 35 (Late game, pacingFactor = 0.7), Bot Balanced có 18000 tiền, dẫm vào ô đất 2600 không độc quyền -> Bỏ qua `pacingFactor < 1.0`, trả về `INTENT_BUY`.
2. `TC-DUEL-BUY-02` Bot có tiền mặt eo hẹp (`balance < basePrice * 2.5` hoặc không đủ đệm an toàn) -> Vẫn tuân thủ kỷ luật bảo toàn tiền mặt và trả về `INTENT_DECLINE`.
3. `TC-DUEL-AUC-01` Phiên đấu giá vòng > 20, Bot có 15000 tiền mặt và an toàn -> `calculateAuctionMaxBid` không bị bóp nghẹt dưới `basePrice * 0.85`, sẵn sàng trả >= 100% - 130% giá gốc.
4. `TC-DUEL-AUC-02` Đấu giá 1v1 khi đối thủ trả 1.1x giá gốc -> Bot dồi dào tiền tiếp tục nâng giá thay vì bỏ cuộc ngay lập tức.

### Facet 2: Chặn Độc Quyền Đối Thủ Bằng Mọi Giá (Case 2 - Observable Behavior)
5. `TC-DUEL-DENIAL-01` Đấu giá ô đất giúp đối thủ hoàn tất bộ màu độc quyền trong thế trận 1v1 -> Bot tiếp tục đặt giá khi giá thầu đã chạm 1.45x (không bỏ cuộc ở 1.40x).
6. `TC-DUEL-DENIAL-02` Bot Aggressive sẵn sàng đấu giá chặn độc quyền lên tới 2.5x - 2.8x giá gốc nếu còn đệm an toàn.
7. `TC-DUEL-DENIAL-03` Bot Balanced sẵn sàng đấu giá chặn độc quyền lên tới 2.0x - 2.2x giá gốc.
8. `TC-DUEL-DENIAL-04` Khi phiên đấu giá mới mở (`highestBidder === undefined`) và đối thủ đang giữ 2/3 ô trong nhóm -> Bot trả về `INTENT_BID` theo định giá phòng thủ chiến lược cao.

### Facet 3: Nhận Diện Đe Dọa Cảng (Railroads) & Tiện Ích (Utilities) (Case 3)
9. `TC-DUEL-RAIL-01` Đối thủ đã sở hữu 2 Cảng -> Ô Cảng thứ 3 được gán `denialMultiplier >= 1.7x`.
10. `TC-DUEL-RAIL-02` Đối thủ đã sở hữu 3 Cảng (chuẩn bị đạt mốc thu 4000 Tr/lượt) -> Với Bot Balanced (base 1.7), `denialMultiplier` đạt `1.7 * 1.5 = 2.55 >= 2.5x`.
11. `TC-DUEL-RAIL-03` Bot đã sở hữu 2 hoặc 3 Cảng -> Ô Cảng tiếp theo được tính `monopolyMultiplier >= 1.6x` đến 2.8x.
12. `TC-DUEL-UTIL-01` Đối thủ đã sở hữu 1 Tiện ích -> Ô Tiện ích thứ 2 được nhận diện là mục tiêu chặn độc quyền (`denialMultiplier > 1.0`).

### Facet 4: Luật Bất Khả Xâm Phạm Độc Quyền Trong Trade (Case 4)
13. `TC-DUEL-TRADE-01` Trong thế trận 1v1 (`room.started && activeNonBankrupt === 2`), đối thủ gửi đề nghị mua bằng tiền mặt ô đất giúp đối thủ độc quyền với giá 1.5x -> Bot Balanced từ chối thẳng (`accept: false`, reason: `'PREVENT_MONOPOLY'`).
14. `TC-DUEL-TRADE-02` Trong thế trận 1v1, đối thủ gửi đề nghị mua bằng tiền mặt với giá 2.0x hoặc 3.0x -> Bot Aggressive từ chối thẳng thừng (`accept: false`, reason: `'PREVENT_MONOPOLY'`).
15. `TC-DUEL-TRADE-03` Trong trận 3-4 người (`imp82` compat): Bot Aggressive kẹt tiền (< 2000) vẫn đồng ý bán nếu người mua trả giá cắt cổ >= 2.5x (bảo toàn TC-82.06).
16. `TC-DUEL-TRADE-04` Trong trận 1v1: Ô đất độc quyền Cảng thứ 4 cũng được bảo vệ nghiêm ngặt, Bot từ chối bán đứt Cảng thứ 4 cho đối thủ lấy tiền mặt.

---

## IV. CHI TIẾT TRIỂN KHAI MÃ NGUỒN CỤ THỂ (CONCRETE DROP-IN SNIPPETS)

### Task 1: Nâng cấp Trí tuệ Mua đất khi Thừa tiền trong `bot_engine.ts`
**Target physical file**: `src/domain/bot/bot_engine.ts`

- **Vị trí enclosing**: Hàm `decideActionPhaseIntent` (dòng 142–162).
- **Mục đích**: Giải thoát Bot Balanced và Aggressive khỏi bị khóa `pacingFactor < 1.0` ở late-game khi sở hữu lượng tiền mặt dồi dào (`balance >= basePrice * 2.5 && balance - basePrice >= safetyBuffer`).
- **Bảo toàn**: Nhánh `BotPersonality.Passive` tại dòng 134 hoàn toàn không bị ảnh hưởng.

```typescript
<<<<
  if (threat.dangerTilesCount > 0 && bot.balance - basePrice < threat.safetyBuffer) {
    return { type: 'INTENT_DECLINE' };
  }

  if (valuation.estimatedValue < valuation.basePrice) {
    if (valuation.pacingFactor !== undefined && valuation.pacingFactor < 1.0) {
      return { type: 'INTENT_DECLINE' };
    }
    if (balanceThresholdMultiplier === undefined || bot.balance < basePrice * balanceThresholdMultiplier) {
      return { type: 'INTENT_DECLINE' };
    }
  }

  if (config.manualRoll !== undefined || config.rng !== undefined || config.seed !== undefined) {
    const isMonopolyOrStrategic = (valuation.monopolyScore ?? 1.0) >= 1.6 || (valuation.denialScore ?? 1.0) > 1.0;
    const hasAbundantEarlyCash = config.manualRoll === undefined && bot.balance >= basePrice * 4 && (room?.round ?? room?.roundCount ?? 1) <= 2;
    if (!isMonopolyOrStrategic && !hasAbundantEarlyCash) {
      const buy = sampleDecision(valuation.buyProbability ?? 0.8, actionRng, config.manualRoll);
      return buy ? { type: 'INTENT_BUY' } : { type: 'INTENT_DECLINE' };
    }
  }
====
  if (threat.dangerTilesCount > 0 && bot.balance - basePrice < threat.safetyBuffer) {
    return { type: 'INTENT_DECLINE' };
  }

  const hasAbundantCash = bot.balance >= basePrice * 2.5 && bot.balance - basePrice >= threat.safetyBuffer;

  if (!hasAbundantCash && valuation.estimatedValue < valuation.basePrice) {
    if (valuation.pacingFactor !== undefined && valuation.pacingFactor < 1.0) {
      return { type: 'INTENT_DECLINE' };
    }
    if (balanceThresholdMultiplier === undefined || bot.balance < basePrice * balanceThresholdMultiplier) {
      return { type: 'INTENT_DECLINE' };
    }
  }

  if (config.manualRoll !== undefined || config.rng !== undefined || config.seed !== undefined) {
    const isMonopolyOrStrategic = (valuation.monopolyScore ?? 1.0) >= 1.6 || (valuation.denialScore ?? 1.0) > 1.0;
    const hasAbundantEarlyCash = config.manualRoll === undefined && bot.balance >= basePrice * 4 && (room?.round ?? room?.roundCount ?? 1) <= 2;
    if (!isMonopolyOrStrategic && !hasAbundantEarlyCash && !hasAbundantCash) {
      const buy = sampleDecision(valuation.buyProbability ?? 0.8, actionRng, config.manualRoll);
      return buy ? { type: 'INTENT_BUY' } : { type: 'INTENT_DECLINE' };
    }
  }
>>>>
```

---

### Task 2: Hỗ trợ Chặn Độc quyền Cảng và Tiện ích trong `valuation_engine.ts`
**Target physical file**: `src/domain/bot/valuation_engine.ts`

- **Giải trình thay đổi Semantic Guard**: Hiện tại đĩa dòng 90 ghi `if (!cell?.colorGroup || !room?.players) return DENIAL_MULTIPLIER_NONE;`. Vì ô Cảng (`Railroad`) và Tiện ích (`Utility`) có `cell.colorGroup === undefined`, nên điều kiện này đã loại bỏ hoàn toàn Cảng và Tiện ích khỏi hệ thống định giá phòng thủ. Do đó, guard phải được mở rộng thành `if (!cell || !room?.players) return DENIAL_MULTIPLIER_NONE;` và phân nhánh theo `cell.colorGroup`, `cell.type === CellType.Railroad`, `cell.type === CellType.Utility`.
- **Snippet 2.1**: Nâng cấp `calculateMonopolyMultiplier` (dòng 59–79).

```typescript
<<<<
  const cell = BOARD_CONFIG[cellIndex];
  if (!cell?.colorGroup) return MONOPOLY_MULTIPLIERS.DEFAULT;

  const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cell.colorGroup);
  const totalInGroup = groupCells.length;

  const botOwned = groupCells.filter(
    (c) => c.index !== cellIndex && registry?.get(c.index) === botId,
  ).length;

  if (botOwned + 1 === totalInGroup) {
    return personality === BotPersonality.Aggressive
      ? MONOPOLY_MULTIPLIERS.COMPLETE_AGGRESSIVE
      : MONOPOLY_MULTIPLIERS.COMPLETE_STANDARD;
  }

  if (totalInGroup === 3 && botOwned === 1) {
    return MONOPOLY_MULTIPLIERS.TWO_OF_THREE;
  }

  return MONOPOLY_MULTIPLIERS.DEFAULT;
====
  const cell = BOARD_CONFIG[cellIndex];
  if (!cell) return MONOPOLY_MULTIPLIERS.DEFAULT;

  if (cell.colorGroup) {
    const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cell.colorGroup);
    const totalInGroup = groupCells.length;

    const botOwned = groupCells.filter(
      (c) => c.index !== cellIndex && registry?.get(c.index) === botId,
    ).length;

    if (botOwned + 1 === totalInGroup) {
      return personality === BotPersonality.Aggressive
        ? MONOPOLY_MULTIPLIERS.COMPLETE_AGGRESSIVE
        : MONOPOLY_MULTIPLIERS.COMPLETE_STANDARD;
    }

    if (totalInGroup === 3 && botOwned === 1) {
      return MONOPOLY_MULTIPLIERS.TWO_OF_THREE;
    }
  } else if (cell.type === CellType.Railroad) {
    const allRailroads = BOARD_CONFIG.filter((c) => c.type === CellType.Railroad);
    const botRails = allRailroads.filter((c) => c.index !== cellIndex && registry?.get(c.index) === botId).length;
    if (botRails === 3) return MONOPOLY_MULTIPLIERS.COMPLETE_STANDARD;
    if (botRails === 2) return MONOPOLY_MULTIPLIERS.TWO_OF_THREE;
    if (botRails === 1) return 1.3;
  } else if (cell.type === CellType.Utility) {
    const allUtils = BOARD_CONFIG.filter((c) => c.type === CellType.Utility);
    const botUtils = allUtils.filter((c) => c.index !== cellIndex && registry?.get(c.index) === botId).length;
    if (botUtils === 1) return MONOPOLY_MULTIPLIERS.COMPLETE_STANDARD;
  }

  return MONOPOLY_MULTIPLIERS.DEFAULT;
>>>>
```

- **Snippet 2.2**: Nâng cấp `calculateDenialMultiplier` (dòng 89–113) bổ sung tính toán Cảng và Tiện ích.

```typescript
<<<<
  const cell = BOARD_CONFIG[cellIndex];
  if (!cell?.colorGroup || !room?.players) return DENIAL_MULTIPLIER_NONE;

  const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cell.colorGroup);
  const totalInGroup = groupCells.length;

  let isDenialTarget = false;
  for (const opponent of room.players) {
    if (!opponent || opponent.id === botId || opponent.bankrupt) continue;
    if (registry?.get(cellIndex) === opponent.id) continue;

    const opponentOwned = groupCells.filter((c) => registry?.get(c.index) === opponent.id).length;
    if (opponentOwned === totalInGroup - 1) {
      isDenialTarget = true;
      break;
    }
  }

  if (!isDenialTarget) {
    return DENIAL_MULTIPLIER_NONE;
  }

  const resolvedPersonality = personality ?? BotPersonality.Balanced;
  return DENIAL_MULTIPLIERS[resolvedPersonality] ?? DENIAL_MULTIPLIERS[BotPersonality.Balanced];
====
  const cell = BOARD_CONFIG[cellIndex];
  if (!cell || !room?.players) return DENIAL_MULTIPLIER_NONE;

  let isDenialTarget = false;
  let denialSeverity = 1.0;

  if (cell.colorGroup) {
    const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cell.colorGroup);
    const totalInGroup = groupCells.length;

    for (const opponent of room.players) {
      if (!opponent || opponent.id === botId || opponent.bankrupt) continue;
      if (registry?.get(cellIndex) === opponent.id) continue;

      const opponentOwned = groupCells.filter((c) => registry?.get(c.index) === opponent.id).length;
      if (opponentOwned === totalInGroup - 1) {
        isDenialTarget = true;
        denialSeverity = 1.0;
        break;
      }
    }
  } else if (cell.type === CellType.Railroad) {
    const allRailroads = BOARD_CONFIG.filter((c) => c.type === CellType.Railroad);
    for (const opponent of room.players) {
      if (!opponent || opponent.id === botId || opponent.bankrupt) continue;
      const opponentRails = allRailroads.filter((c) => c.index !== cellIndex && registry?.get(c.index) === opponent.id).length;
      if (opponentRails >= 2) {
        isDenialTarget = true;
        denialSeverity = opponentRails === 3 ? 1.5 : 1.15;
        break;
      }
    }
  } else if (cell.type === CellType.Utility) {
    const allUtils = BOARD_CONFIG.filter((c) => c.type === CellType.Utility);
    for (const opponent of room.players) {
      if (!opponent || opponent.id === botId || opponent.bankrupt) continue;
      const opponentUtils = allUtils.filter((c) => c.index !== cellIndex && registry?.get(c.index) === opponent.id).length;
      if (opponentUtils >= 1) {
        isDenialTarget = true;
        denialSeverity = 1.0;
        break;
      }
    }
  }

  if (!isDenialTarget) {
    return DENIAL_MULTIPLIER_NONE;
  }

  const resolvedPersonality = personality ?? BotPersonality.Balanced;
  const baseDenial = DENIAL_MULTIPLIERS[resolvedPersonality] ?? DENIAL_MULTIPLIERS[BotPersonality.Balanced];
  return Number((baseDenial * denialSeverity).toFixed(2));
>>>>
```

---

### Task 3: Nâng cấp Định giá Đấu giá và Trần Chặn Độc quyền trong `bot_auction.ts`
**Target physical file**: `src/domain/bot/bot_auction.ts`

- **Snippet 3.1**: Trong `calculateAuctionMaxBid` (dòng 64–68), thay thế cục bộ dòng return tính giá thầu, nới lỏng hình phạt pacing khi đấu giá 1v1 hoặc có lượng tiền dồi dào.

```typescript
<<<<
  return Math.min(
    Math.round(valEstimated * valMultiplier),
    Math.max(0, bot.balance - Math.round(effectiveBuffer * safeRatio)),
  );
====
  const round = room?.round ?? room?.roundCount ?? 1;
  const activePlayers = room?.players?.filter((p) => !p.bankrupt).length ?? 4;
  const isCompetitiveDuel = activePlayers <= 2;
  const maxSolventBid = Math.max(0, bot.balance - Math.round(effectiveBuffer * safeRatio));

  const pacingPenaltyRelaxed = (round > 20 && maxSolventBid >= valEstimated * 2) ? 1.0 / 0.7 : 1.0;
  const adjustedValEstimated = Math.round(valEstimated * (isCompetitiveDuel ? Math.max(1.0, pacingPenaltyRelaxed) : pacingPenaltyRelaxed));

  return Math.min(
    Math.round(adjustedValEstimated * valMultiplier),
    maxSolventBid,
  );
>>>>
```

- **Snippet 3.2**: Trong `decideAuctionPhaseIntent` (dòng 177–195), mở rộng phát hiện đối thủ sắp hoàn tất độc quyền (bất kể `highestBidder` đã đặt hay chưa) và nâng trần đấu giá chặn độc quyền trong thế trận 1v1 lên tới 2.2x - 2.8x giá gốc.

```typescript
<<<<
  const cellConfig = BOARD_CONFIG[cur.cellIndex];
  let isOpponentMonopolyTarget = false;
  if (cellConfig?.colorGroup && highestBidder && highestBidder !== bot.id) {
    const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cellConfig.colorGroup);
    const otherCells = groupCells.filter((c) => c.index !== cur.cellIndex);
    if (otherCells.length > 0 && otherCells.every((c) => registry.get(c.index) === highestBidder)) {
      isOpponentMonopolyTarget = true;
    }
  }

  if (isOpponentMonopolyTarget) {
    if ((cur.highestBid ?? 0) >= Math.round(basePrice * 1.40)) {
      return { type: 'INTENT_AUCTION_PASS' };
    }
    if (bot.balance >= nextBid + Math.round(threat.safetyBuffer * 0.5) && nextBid <= Math.round(basePrice * 1.40)) {
      return { type: 'INTENT_BID', amount: nextBid };
    }
    return { type: 'INTENT_AUCTION_PASS' };
  }
====
  const cellConfig = BOARD_CONFIG[cur.cellIndex];
  let isOpponentMonopolyTarget = false;
  if (cellConfig && room.players) {
    if (cellConfig.colorGroup) {
      const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cellConfig.colorGroup);
      const otherCells = groupCells.filter((c) => c.index !== cur.cellIndex);
      for (const opp of room.players) {
        if (!opp || opp.id === bot.id || opp.bankrupt) continue;
        if (otherCells.length > 0 && otherCells.every((c) => registry.get(c.index) === opp.id)) {
          isOpponentMonopolyTarget = true;
          break;
        }
      }
    } else if (cellConfig.type === CellType.Railroad) {
      const allRails = BOARD_CONFIG.filter((c) => c.type === CellType.Railroad && c.index !== cur.cellIndex);
      for (const opp of room.players) {
        if (!opp || opp.id === bot.id || opp.bankrupt) continue;
        if (allRails.filter((c) => registry.get(c.index) === opp.id).length >= 2) {
          isOpponentMonopolyTarget = true;
          break;
        }
      }
    }
  }

  if (isOpponentMonopolyTarget) {
    const isCompetitiveDuel = (room.players.filter((p) => !p.bankrupt).length) <= 2;
    const denialCapMultiplier = isCompetitiveDuel
      ? (personality === BotPersonality.Aggressive ? 2.8 : personality === BotPersonality.Balanced ? 2.2 : 1.7)
      : (personality === BotPersonality.Aggressive ? 2.0 : personality === BotPersonality.Balanced ? 1.6 : 1.4);

    const maxDenialBid = Math.round(basePrice * denialCapMultiplier);
    if ((cur.highestBid ?? 0) >= maxDenialBid) {
      return { type: 'INTENT_AUCTION_PASS' };
    }
    if (bot.balance >= nextBid + Math.round(threat.safetyBuffer * 0.4) && nextBid <= maxDenialBid) {
      return { type: 'INTENT_BID', amount: nextBid };
    }
    return { type: 'INTENT_AUCTION_PASS' };
  }
>>>>
```

---

### Task 4: Cấm Tuyệt đối Bán Độc quyền Lấy Tiền Mặt trong Thế trận 1v1 tại `bot_trade.ts`
**Target physical file**: `src/domain/bot/bot_trade.ts`

- **Snippet 4.1**: Thêm import `CellType` tại dòng 2.

```typescript
<<<<
import { BOARD_CONFIG, ColorGroup } from '../board_config.js';
====
import { BOARD_CONFIG, CellType, ColorGroup } from '../board_config.js';
>>>>
```

- **Snippet 4.2**: Trong hàm `evaluateBotTradeAcceptance` (dòng 125–132), mở rộng phát hiện độc quyền ô Cảng và kích hoạt quy tắc Bất khả xâm phạm độc quyền khi `room.started === true && activePlayers.length === 2`.

```typescript
<<<<
  let givesMonopolyToBuyer = false;
  if (cellConfig?.colorGroup) {
    const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cellConfig.colorGroup);
    const otherCells = groupCells.filter((c) => c.index !== cellIndex);
    if (otherCells.length > 0 && otherCells.every((c) => registry.get(c.index) === buyer.id)) {
      givesMonopolyToBuyer = true;
    }
  }
====
  let givesMonopolyToBuyer = false;
  if (cellConfig?.colorGroup) {
    const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cellConfig.colorGroup);
    const otherCells = groupCells.filter((c) => c.index !== cellIndex);
    if (otherCells.length > 0 && otherCells.every((c) => registry.get(c.index) === buyer.id)) {
      givesMonopolyToBuyer = true;
    }
  } else if (cellConfig?.type === CellType.Railroad) {
    const allRails = BOARD_CONFIG.filter((c) => c.type === CellType.Railroad && c.index !== cellIndex);
    if (allRails.filter((c) => registry.get(c.index) === buyer.id).length >= 2) {
      givesMonopolyToBuyer = true;
    }
  }

  const activePlayers = room?.players?.filter((p) => !p.bankrupt) ?? [];
  const isCompetitiveDuel = Boolean(room?.started && activePlayers.length === 2);

  if (givesMonopolyToBuyer && isCompetitiveDuel) {
    return { accept: false, reason: 'PREVENT_MONOPOLY' };
  }
>>>>
```

---

## V. ĐÁNH GIÁ RỦI RO & BẢO TOÀN HỢP ĐỒNG (REGRESSION MATRIX)

1. **Test `TC-82.06` (Bot Aggressive bán 2.5x khi kẹt tiền)**:
   - Trong `imp82_bot_trading_and_pacing.test.ts`, fixture có 3 players (`botAlpha, opponentBeta, thirdPlayer`). Do `activePlayers.length === 3 !== 2`, nhánh `isCompetitiveDuel` không kích hoạt -> Test tiếp tục PASS 100%.
2. **Test `UC-IMP119/MSS-10` & `MSS-11` (Bot Balanced/Aggressive chấp thuận bán 1.6x)**:
   - Trong `imp119_bot_strategic_parity.test.ts`, fixture có `room.started` là undefined và `players: []`. Do đó `isCompetitiveDuel` là false -> Test tiếp tục PASS 100%.
3. **Test `TC-06.8a-*` (Bot Passive các phase)**:
   - Nhánh `decidePassiveActionIntent` không bị sửa đổi -> Test tiếp tục PASS 100%.
