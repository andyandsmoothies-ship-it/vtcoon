# Plan IMP-324: Minimum Notification Reading Dwell Time & Desktop Viewport Ceiling

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-324`
- **Subsystem**: `client-ui` (Tier 2 Client UI & Floating Notifications)
- **Problem Statement**:
  1. **Notification Flash Eviction**: When multiple events occur in quick succession, newer notifications immediately displace older ones due to the hardcoded `slice(-2)` window in `FloatingNumbersOverlay`, cutting off visible reading time to as low as 0.8s - 1.2s despite `TRANSACTION_POPUP_DURATION_MS = 3600ms`.
  2. **Rigid Desktop Capacity Ceiling**: Desktop screens currently share the exact same `slice(-2)` limit as mobile devices, despite having ample vertical and lateral margin space (`right-[18.5rem]`) capable of comfortably displaying 3 transaction cards.
  3. **Mobile Screen Crowding Risk**: On mobile, uncluttered visibility and touch safety must be strictly preserved: at most 2 regular cards (or 1 regular card if a milestone banner is active), with guaranteed minimum dwell time so mobile players can read every financial detail comfortably.
- **Architectural Solution**:
  1. In `src/client/ui/notification_deduplicator.ts`, introduce pure dwell-aware selection function `selectVisibleFloatingTexts` with configurable `maxVisible` and `minDwellMs = 2000ms`. A visible notification is protected from displacement until its display dwell time reaches at least `minDwellMs`. Queued notifications wait their turn and slide in as slots open.
  2. In `src/client/ui/floating_numbers.tsx`, wire `selectVisibleFloatingTexts`:
     - On Desktop: Raise ceiling to 3 regular items (or 2 when milestone banner is present).
     - On Mobile: Strictly limit to 2 regular items (or 1 when milestone banner is present), while ensuring 100% of notifications receive the guaranteed 2000ms dwell time.
     - Schedule next promotion timer using `nextExpirationDelayMs` so queued notifications promote automatically when dwell times finish.
- **Direct Scope**:
  - `src/client/ui/notification_deduplicator.ts`
  - `src/client/ui/floating_numbers.tsx`
  - `tests/client/imp324_minimum_dwell_and_desktop_ceiling.test.ts`
- **Baseline Working Tree Dependencies**:
  - `src/client/3d/luxury_pawn_models.tsx`
  - `src/domain/pawn_assignment.ts`
  - `src/domain/pawn_configs.ts`
  - `src/server/insolvency_manager.ts`
  - `src/server/room_manager_queries.ts`
  - `tests/client/imp128_desktop_ui_ticker_and_toast_sync.test.ts`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/ui/notification_deduplicator.ts` | Tier 2 (UI/3D/Views) | 31 | 110 | +79 | <= 500 | ✔️ Safe |
| `src/client/ui/floating_numbers.tsx` | Tier 2 (UI/3D/Views) | 361 | 392 | +31 | <= 500 | ✔️ Safe |
| `tests/client/imp324_minimum_dwell_and_desktop_ceiling.test.ts` | Living Test | 0 | 185 | +185 | <= 600 | ✔️ Safe |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
**Target physical file**: `tests/client/imp324_minimum_dwell_and_desktop_ceiling.test.ts` (Tệp mới)

Test Specifications:
- TC-324.01 [UC-DWELL/MSS]: Given selectVisibleFloatingTexts called with 3 rapid notifications within 500ms and maxVisible 2, When evaluated, Then protects visible items from eviction until minDwellMs (2000ms) has elapsed.
- TC-324.02 [UC-DWELL/MSS]: Given selectVisibleFloatingTexts evaluated when a protected notification reaches minDwellMs, When dwell time expires, Then next queued notification is promoted to the visible slot.
- TC-324.03 [UC-DWELL/MSS]: Given selectVisibleFloatingTexts evaluated when an active notification is dismissed or removed from store, When removed, Then queued notification immediately enters the vacated slot without waiting.
- TC-324.04 [UC-CEIL/MSS]: Given Desktop environment with 3 notifications and no milestone, When rendered, Then all 3 notifications are displayed simultaneously.
- TC-324.05 [UC-CEIL/MSS]: Given Desktop environment with a milestone banner, When rendered, Then displays up to 2 regular notifications alongside the milestone banner.
- TC-324.06 [UC-MOB/MSS]: Given Mobile environment with a milestone banner, When rendered, Then restricts regular notifications to 1 preserving mobile viewport clarity.

### Station 2: Implementation (GREEN)

#### Step 1: Dwell-Aware Selection Engine in `notification_deduplicator.ts`
**Target physical file**: `src/client/ui/notification_deduplicator.ts`

```typescript
<<<<
    const group = items.filter((t) => t.groupId === item.groupId);
    const mine = myPlayerId ? group.find((t) => t.playerId === myPlayerId) : undefined;
    const penalty = group.find((t) => t.type === FloatingTextType.Penalty);
    result.unshift(mine ?? penalty ?? group[0]!);
  }

  return result;
}
====
    const group = items.filter((t) => t.groupId === item.groupId);
    const mine = myPlayerId ? group.find((t) => t.playerId === myPlayerId) : undefined;
    const penalty = group.find((t) => t.type === FloatingTextType.Penalty);
    result.unshift(mine ?? penalty ?? group[0]!);
  }

  return result;
}

export const MIN_NOTIFICATION_DWELL_MS = 2000;
export const DESKTOP_MAX_FLOATING_TEXTS = 3;
export const MOBILE_MAX_FLOATING_TEXTS = 2;

export interface VisibleSelectionOptions {
  readonly maxVisible: number;
  readonly minDwellMs?: number;
  readonly now?: number;
  readonly currentlyVisibleIds?: readonly string[];
  readonly firstShownTimestamps?: ReadonlyMap<string, number>;
  readonly myPlayerId?: string | null;
}

export interface VisibleSelectionResult {
  readonly visibleItems: readonly FloatingTextItem[];
  readonly nextExpirationDelayMs: number | null;
  readonly updatedFirstShownTimestamps: Map<string, number>;
}

export function selectVisibleFloatingTexts(
  items: readonly FloatingTextItem[],
  options: VisibleSelectionOptions,
): VisibleSelectionResult {
  const maxVisible = Math.max(1, options.maxVisible);
  const minDwell = options.minDwellMs ?? MIN_NOTIFICATION_DWELL_MS;
  const now = options.now ?? Date.now();
  const timestamps = new Map<string, number>(options.firstShownTimestamps ?? []);
  const currentVisible = options.currentlyVisibleIds ?? [];

  if (items.length <= maxVisible) {
    for (const item of items) {
      if (!timestamps.has(item.id)) timestamps.set(item.id, now);
    }
    return {
      visibleItems: items,
      nextExpirationDelayMs: null,
      updatedFirstShownTimestamps: timestamps,
    };
  }

  const itemMap = new Map(items.map((i) => [i.id, i]));
  const protectedItems: FloatingTextItem[] = [];
  let minRemainingDwell: number | null = null;

  for (const id of currentVisible) {
    const item = itemMap.get(id);
    if (!item) continue;
    const firstShown = timestamps.get(id) ?? now;
    const elapsed = now - firstShown;
    if (elapsed < minDwell) {
      protectedItems.push(item);
      const remaining = minDwell - elapsed;
      minRemainingDwell = minRemainingDwell === null ? remaining : Math.min(minRemainingDwell, remaining);
    }
  }

  const protectedIds = new Set(protectedItems.map((i) => i.id));
  const availableSlots = Math.max(0, maxVisible - protectedItems.length);
  const candidates = items.filter((i) => !protectedIds.has(i.id));
  const newlySelected = candidates.slice(-availableSlots);

  for (const item of newlySelected) {
    if (!timestamps.has(item.id)) {
      timestamps.set(item.id, now);
      minRemainingDwell = minRemainingDwell === null ? minDwell : Math.min(minRemainingDwell, minDwell);
    }
  }

  const combined = [...protectedItems, ...newlySelected];
  const itemOrderMap = new Map(items.map((item, idx) => [item.id, idx]));
  combined.sort((a, b) => (itemOrderMap.get(a.id) ?? 0) - (itemOrderMap.get(b.id) ?? 0));

  return {
    visibleItems: combined,
    nextExpirationDelayMs: minRemainingDwell,
    updatedFirstShownTimestamps: timestamps,
  };
}
>>>>
```

#### Step 2: Viewport Ceiling & Paced Queue Wiring in `floating_numbers.tsx`
**Target physical file**: `src/client/ui/floating_numbers.tsx`

```typescript
<<<<
  const deduplicated = deduplicateFloatingTexts(regularTexts, myPlayerId);
  const recentTwo = deduplicated.slice(-2);
  let displayItems = activeModal !== null ? [] : [...recentTwo];
  if (
    displayItems.length === 2 &&
    myPlayerId &&
    displayItems[0]?.playerId === myPlayerId &&
    displayItems[1]?.playerId !== myPlayerId
  ) {
    displayItems = [displayItems[1]!, displayItems[0]!];
  }
====
  const storeIsMobile = useIsMobile();
  const isMobile = isSSR ? false : storeIsMobile;

  const maxRegularVisible = isMobile
    ? (latestMilestone ? 1 : 2)
    : (latestMilestone ? 2 : 3);

  const deduplicated = deduplicateFloatingTexts(regularTexts, myPlayerId);
  const firstShownMapRef = React.useRef<Map<string, number>>(new Map());
  const visibleIdsRef = React.useRef<string[]>([]);
  const [, setDwellTick] = React.useState(0);

  const selectionResult = React.useMemo(() => {
    return selectVisibleFloatingTexts(deduplicated, {
      maxVisible: maxRegularVisible,
      now: Date.now(),
      currentlyVisibleIds: visibleIdsRef.current,
      firstShownTimestamps: firstShownMapRef.current,
      myPlayerId,
    });
  }, [deduplicated, maxRegularVisible, myPlayerId]);

  firstShownMapRef.current = selectionResult.updatedFirstShownTimestamps;
  visibleIdsRef.current = selectionResult.visibleItems.map((i) => i.id);

  React.useEffect(() => {
    if (selectionResult.nextExpirationDelayMs === null || isSSR) return;
    const timer = setTimeout(() => {
      setDwellTick((t) => t + 1);
    }, Math.max(50, selectionResult.nextExpirationDelayMs));
    return () => clearTimeout(timer);
  }, [selectionResult.nextExpirationDelayMs, isSSR]);

  let displayItems = activeModal !== null ? [] : [...selectionResult.visibleItems];
  if (
    displayItems.length === 2 &&
    myPlayerId &&
    displayItems[0]?.playerId === myPlayerId &&
    displayItems[1]?.playerId !== myPlayerId
  ) {
    displayItems = [displayItems[1]!, displayItems[0]!];
  }
>>>>
```

## 4. Mechanical Pre-Filter & Regression Verification
1. `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_324_MINIMUM_DWELL_AND_DESKTOP_CEILING.md --auto-sign`
2. `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_324_MINIMUM_DWELL_AND_DESKTOP_CEILING.md`
3. `npm run prefilter -- src/client/ui/notification_deduplicator.ts src/client/ui/floating_numbers.tsx tests/client/imp324_minimum_dwell_and_desktop_ceiling.test.ts`
4. `npx vitest run tests/client/imp324_minimum_dwell_and_desktop_ceiling.test.ts`
5. `npm run capture:visual -- --ticket IMP-324`
6. `node scripts/check_evidence.mjs IMP-324`
7. Full regression test run: `npm test`
