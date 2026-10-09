// [UI-S05/MSS][IMP-252] NotificationDeduplicator — Pure financial toast and badge deduplication
import React from 'react';
import { FloatingTextType, type FloatingTextItem } from '../store/game_store.js';

/**
 * Collapses reciprocal P2P cards (same groupId) into one card from the local player's view.
 * Own card wins; between two other players the Penalty card wins. Ungrouped cards pass through.
 */
export function deduplicateFloatingTexts(
  items: readonly FloatingTextItem[],
  myPlayerId?: string | null,
): FloatingTextItem[] {
  const seenGroups = new Set<string>();
  const result: FloatingTextItem[] = [];

  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i]!;
    if (!item.groupId) {
      result.unshift(item);
      continue;
    }
    if (seenGroups.has(item.groupId)) continue;
    seenGroups.add(item.groupId);

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
      visibleItems: [...items],
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
  const newlySelected = availableSlots > 0 ? candidates.slice(-availableSlots) : [];

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

export function useVisibleFloatingTexts(
  regularTexts: readonly FloatingTextItem[],
  maxVisible: number,
  myPlayerId?: string | null,
  isSSR = false,
): readonly FloatingTextItem[] {
  const deduplicated = deduplicateFloatingTexts(regularTexts, myPlayerId);
  const firstShownMapRef = React.useRef<Map<string, number>>(new Map());
  const visibleIdsRef = React.useRef<string[]>([]);
  const [, setDwellTick] = React.useState(0);

  const selectionResult = React.useMemo(() => {
    return selectVisibleFloatingTexts(deduplicated, {
      maxVisible,
      now: Date.now(),
      currentlyVisibleIds: visibleIdsRef.current,
      firstShownTimestamps: firstShownMapRef.current,
      myPlayerId,
    });
  }, [deduplicated, maxVisible, myPlayerId]);

  firstShownMapRef.current = selectionResult.updatedFirstShownTimestamps;
  visibleIdsRef.current = selectionResult.visibleItems.map((i) => i.id);

  React.useEffect(() => {
    if (selectionResult.nextExpirationDelayMs === null || isSSR) return;
    const timer = setTimeout(() => {
      setDwellTick((t) => t + 1);
    }, Math.max(50, selectionResult.nextExpirationDelayMs));
    return () => clearTimeout(timer);
  }, [selectionResult.nextExpirationDelayMs, isSSR]);

  return selectionResult.visibleItems;
}
