// [UI-S05/MSS][IMP-252] NotificationDeduplicator — Pure financial toast and badge deduplication
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
