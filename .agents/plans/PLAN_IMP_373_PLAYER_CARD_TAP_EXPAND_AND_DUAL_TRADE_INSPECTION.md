# Plan IMP-373: Player Card Tap-to-Expand & Dual-Party Trade Inspection (Ticket IMP-373)

## 0. Context & Architectural Rationale
- **Prior In-Flight Scope & UAT Telemetry Baseline**:
  - Tại vé IMP-372, để nén 46% chiều cao `PlayerHudList` trên mobile (tránh che lấp bàn cờ 3D), thuộc tính `${!isCurrentTurn ? 'hidden sm:flex' : 'flex'}` đã được áp dụng, chỉ hiển thị cụm 28 chấm BĐS (Section 2) cho người chơi đang có lượt.
  - **Khiếm khuyết phát hiện qua thực tế UAT (Ảnh chụp người dùng)**:
    1. **Thiếu hiển thị song phương khi giao dịch (Dual-Trade Asymmetry)**: Khi Bot AI 4 gửi đề xuất đổi đất cho người chơi chính (Peppy Panda), thẻ Bot AI 4 hiển thị cả 2 section (Tên/Tiền + 28 chấm với chấm vàng nhấp nháy), nhưng thẻ Peppy Panda chỉ hiển thị 1 section (bị ẩn cụm chấm BĐS). Người chơi không thể đối chiếu BĐS của chính mình để biết ô đất bị đòi lấy nằm ở đâu, có phá vỡ độc quyền không.
    2. **Thiếu cơ chế chủ động trinh sát (No Tap-to-Expand)**: Khi người chơi muốn xem danh mục BĐS của các bot khác chưa tới lượt (Bot 2, Bot 3), thẻ bị thu gọn cứng nhắc mà không có cơ chế chạm mở rộng (Progressive Disclosure).
- **Hardened Architectural Solution (5 Adversarial Directives)**:
  1. **Dual-Party Trade Expansion**: Trong `src/client/ui/player_card.tsx`, mở rộng điều kiện hiển thị Section 2: tự động bung mở cụm 28 chấm khi là người chơi đang tới lượt (`isCurrentTurn`) HOẶC là một trong hai bên tham gia giao dịch (`isTradingParty`).
  2. **Tap-to-Expand Progressive Disclosure**: Bổ sung tương tác chạm (`onClick`, `onKeyDown` Enter/Space) trên thẻ `PlayerCard` kèm state `isUserExpanded` và icon chỉ báo `▲`/`▼` trên mobile (`sm:hidden`).
  3. **Global Turn Identity Reset (ADV-01)**: Gắn reset `isUserExpanded` theo `currentTurnPlayerId` toàn cục để đảm bảo 100% thẻ bot không bị kẹt mở qua các lượt tiếp theo.
  4. **Accessibility & Branch Guard (ADV-03 & ADV-04)**: Giới hạn `cursor-pointer` cho mobile, bỏ qua tap toggle khi thẻ đang trong lượt (`isCurrentTurn`) hoặc đang giao dịch (`isTradingParty`).
  5. **Cross-Suite Hygiene (ADV-05)**: Thiết lập `afterEach` dọn dẹp `pendingTradeOffer: null` trong test suite để bảo vệ các living test suite khác.

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-373`
- **Subsystem**: `client-ui` (Tier 2 UI Presentation & Ergonomics)
- **Direct Scope (Physical Files)**:
  - **Target physical file**: `src/client/ui/player_card.tsx` (Refactor)
  - **Target physical file**: `tests/client/imp373_player_card_tap_expand_and_trade_dual_inspection.test.ts` (Tệp mới)
- **Referenced Contracts / Stable Boundaries**:
  - `src/client/ui/player_hud_list.tsx`
  - `src/client/ui/modals/bot_trade_offer_strip.tsx`
  - `docs/reports/improvements/IMP-372-mobile-ergonomics-player-card-and-toast-deescalation_report.md`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/ui/player_card.tsx` | Tier 2 (UI/3D/Views) | 398 | 445 | +47 | <= 500 | Warning (>= 400 LOC) |
| `tests/client/imp373_player_card_tap_expand_and_trade_dual_inspection.test.ts` | Living Test | 0 | 180 | +180 | <= 600 | 🆕 Tệp mới |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- Viết bộ kiểm thử hợp đồng độc lập tại `tests/client/imp373_player_card_tap_expand_and_trade_dual_inspection.test.ts`:
  - TC-373.01 [UC-TAP-EXPAND/MSS]: Given non-turn PlayerCard on mobile, When user triggers tap/click interaction, Then toggles isUserExpanded and reveals player-property-clusters.
  - TC-373.02 [UC-CHEVRON-AFFORDANCE/MSS]: Given PlayerCard on mobile, When rendered, Then displays visual affordance indicator chevron down when collapsed and up when expanded.
  - TC-373.03 [UC-DUAL-TRADE-EXPAND/MSS]: Given pendingTradeOffer active where PlayerCard belongs to sellerId or buyerId, When rendered with isCurrentTurn false, Then automatically expands property clusters without manual tap.
  - TC-373.04 [UC-UNINVOLVED-COLLAPSED/MSS]: Given trade offer active between two players, When uninvolved third-party PlayerCard is rendered, Then maintains collapsed state on mobile.
  - TC-373.05 [UC-BANKRUPT-IMMUNE/MSS]: Given bankrupt PlayerCard, When tap is triggered, Then ignores expansion and retains opacity-50 collapsed styling.
  - TC-373.06 [UC-TURN-RESET/MSS]: Given manually expanded PlayerCard, When currentTurnPlayerId transitions, Then resets isUserExpanded to false to prevent visual clutter.

### Station 2: Implementation (GREEN)

#### Task 1: Tích hợp Tap-to-Expand & Dual-Party Trade trong `src/client/ui/player_card.tsx`
**Target physical file**: `src/client/ui/player_card.tsx`
```tsx
<<<<
import React, { useMemo } from 'react';
====
import React, { useMemo, useState, useEffect } from 'react';
>>>>
```

```tsx
<<<<
}

export function PlayerCard({
====
}

function renderCardExpandChevron(isExpanded: boolean): React.ReactElement {
  return React.createElement(
    'span',
    {
      'data-testid': 'player-card-expand-indicator',
      className: 'inline-block sm:hidden text-[10px] text-slate-400 select-none transition-transform duration-200 shrink-0',
      'aria-hidden': true,
    },
    isExpanded ? '▲' : '▼'
  );
}

export function PlayerCard({
>>>>
```

```tsx
<<<<
  const isNegativeBalance = player.balance < 0;
  const balanceColorClass = isNegativeBalance
    ? 'text-rose-700 font-black'
    : 'text-emerald-700 font-black';
====
  const userExpandedState = useState(false);
  const isUserExpanded = userExpandedState[0];
  const setIsUserExpanded = userExpandedState[1];
  const currentTurnPlayerId = useGameStore((s) => s.currentTurnPlayerId);
  useEffect(() => {
    setIsUserExpanded(false);
  }, [currentTurnPlayerId]);

  const isTradingParty = Boolean(
    tradingCellSet.size > 0 ||
    (storePendingTradeOffer && (storePendingTradeOffer.buyerId === player.id || storePendingTradeOffer.sellerId === player.id))
  );
  const isExpandedOnMobile = isCurrentTurn || isTradingParty || isUserExpanded;

  const handleToggleExpand = () => {
    if (player.bankrupt || isCurrentTurn || isTradingParty) return;
    setIsUserExpanded((prev) => !prev);
  };

  const isNegativeBalance = player.balance < 0;
  const balanceColorClass = isNegativeBalance
    ? 'text-rose-700 font-black'
    : 'text-emerald-700 font-black';
>>>>
```

```tsx
<<<<
      className={`pointer-events-auto relative flex flex-col gap-1.5 p-2.5 sm:p-3 rounded-xl border-2 transition-all duration-200 w-full ${
        isCurrentTurn
          ? 'border-amber-500 bg-[#FFFDF8] ring-2 ring-amber-400 shadow-[0_6px_0_0_#0f172a]'
          : 'border-slate-900 bg-[#FFFDF8] shadow-[0_4px_0_0_#0f172a]'
      } text-slate-900 ${player.bankrupt ? 'opacity-50 grayscale' : ''}`}
====
      onClick={handleToggleExpand}
      aria-expanded={isExpandedOnMobile}
      tabIndex={player.bankrupt ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggleExpand();
        }
      }}
      className={`pointer-events-auto relative flex flex-col gap-1.5 p-2.5 sm:p-3 rounded-xl border-2 transition-all duration-200 w-full select-none ${
        player.bankrupt
          ? 'opacity-50 grayscale cursor-default'
          : isCurrentTurn || isTradingParty
          ? 'cursor-default'
          : 'cursor-pointer sm:cursor-default'
      } ${
        isCurrentTurn
          ? 'border-amber-500 bg-[#FFFDF8] ring-2 ring-amber-400 shadow-[0_6px_0_0_#0f172a]'
          : 'border-slate-900 bg-[#FFFDF8] shadow-[0_4px_0_0_#0f172a]'
      } text-slate-900`}
>>>>
```

```tsx
<<<<
            {formatShortPlayerName(player.name)}
====
            {formatShortPlayerName(player.name)}
            {!player.bankrupt && !isCurrentTurn && !isTradingParty && renderCardExpandChevron(isExpandedOnMobile)}
>>>>
```

```tsx
<<<<
            className={`flex-col gap-1 w-full px-2 pt-1.5 pb-1 border-t border-slate-300 select-none ${!isCurrentTurn ? 'hidden sm:flex' : 'flex'}`}
====
            className={`flex-col gap-1 w-full px-2 pt-1.5 pb-1 border-t border-slate-300 select-none ${!isExpandedOnMobile ? 'hidden sm:flex' : 'flex'}`}
>>>>
```

### Station 3: Pre-Filter & Visual Evidence Verification
- Chạy mechanical pre-filter: `npm run prefilter -- src/client/ui/player_card.tsx`
- Bằng chứng thị giác Dual-Viewport: Chạy `npm run capture:visual -- --ticket IMP-373 --scenario camera_chase_cinematic`
- Kiểm toán bằng chứng vật lý: `node scripts/check_evidence.mjs IMP-373`

## 4. Risks & Mitigations
| Rủi ro kỹ thuật | Mức độ | Biện pháp giảm thiểu |
| :--- | :---: | :--- |
| **Tràn màn hình khi người dùng chạm mở nhiều thẻ cùng lúc** | Thấp | Tự động reset `isUserExpanded` về `false` mỗi khi đổi `currentTurnPlayerId`. |
| **Chạm vào thẻ kích hoạt ngoài ý muốn khi người chơi bị phá sản** | Thấp | Bỏ qua sự kiện tap khi `player.bankrupt === true` và gán `tabIndex={-1}`. |
| **Phá vỡ selector kiểm thử của living test suites** | Thấp | Giữ nguyên 100% `data-testid="player-property-clusters"` và `data-testid="player-ribbon"`. |

## 5. Blast Radius & Regressions
- **Không thay đổi Desktop**: Trên desktop (`sm:`), cụm 28 chấm vẫn luôn hiển thị qua `sm:flex`, chevron ẩn qua `sm:hidden`.
- **Ranh giới phân hệ**: Giới hạn nghiêm ngặt trong `src/client/ui/player_card.tsx`, bảo toàn trần LOC <= 500 (dự kiến 445 dòng).

## 6. Definition of Done (DoD)
- [ ] 6/6 Contract tests trong `tests/client/imp373_player_card_tap_expand_and_trade_dual_inspection.test.ts` chuyển sang GREEN.
- [ ] TypeScript `tsc --noEmit` đạt 0 lỗi (Exit Code 0).
- [ ] Prefilter `npm run prefilter` vượt qua 100% (Zero dirty casts, LOC trong hạn mức).
- [ ] Toàn bộ living test suites của `client-ui` (`imp187`, `imp237`, `imp372`) đều PASS.
- [ ] Ký duyệt kế hoạch tự động qua `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_373_PLAYER_CARD_TAP_EXPAND_AND_DUAL_TRADE_INSPECTION.md --auto-sign`.
