// [TC-324.01/MSS..TC-324.06/MSS][IMP-324] Minimum Reading Dwell & Desktop Viewport Ceiling Contract Tests
import { describe, it, expect } from 'vitest';
import {
  selectVisibleFloatingTexts,
  MIN_NOTIFICATION_DWELL_MS,
  DESKTOP_MAX_FLOATING_TEXTS,
  MOBILE_MAX_FLOATING_TEXTS,
} from '../../src/client/ui/notification_deduplicator.js';
import { FloatingTextType, type FloatingTextItem, type FloatingActionType } from '../../src/client/store/game_store_subtypes.js';

function createMockItem(id: string, text: string, timestamp: number, actionType: FloatingActionType = 'salary'): FloatingTextItem {
  return {
    id,
    text,
    type: FloatingTextType.Reward,
    playerId: 'p1',
    actionType,
    title: `Title ${id}`,
    timestamp,
    durationMs: 3600,
  };
}

describe('[IMP-324] Minimum Reading Dwell & Desktop Viewport Ceiling Contracts', () => {
  it('TC-324.01 [UC-DWELL/MSS]: Given 3 rapid notifications within 500ms and maxVisible 2, When evaluated, Then protects visible items from eviction until minDwellMs has elapsed', () => {
    const t0 = 10000;
    const item1 = createMockItem('item_1', '+2.000', t0);
    const item2 = createMockItem('item_2', '-500', t0 + 200);
    const item3 = createMockItem('item_3', '+1.500', t0 + 400);

    // Initial evaluation at t0 + 200 with item1 & item2 visible
    const initialTimestamps = new Map([
      ['item_1', t0],
      ['item_2', t0 + 200],
    ]);

    // Now evaluated at t0 + 400 (400ms after item1 first shown, < MIN_NOTIFICATION_DWELL_MS)
    const result = selectVisibleFloatingTexts([item1, item2, item3], {
      maxVisible: MOBILE_MAX_FLOATING_TEXTS,
      minDwellMs: MIN_NOTIFICATION_DWELL_MS,
      now: t0 + 400,
      currentlyVisibleIds: ['item_1', 'item_2'],
      firstShownTimestamps: initialTimestamps,
    });

    expect(result.visibleItems.map((i) => i.id)).toEqual(['item_1', 'item_2']);
    expect(result.nextExpirationDelayMs).toBe(MIN_NOTIFICATION_DWELL_MS - 400);
  });

  it('TC-324.02 [UC-DWELL/MSS]: Given a protected notification reaches minDwellMs, When dwell time expires, Then next queued notification is promoted to the visible slot', () => {
    const t0 = 10000;
    const item1 = createMockItem('item_1', '+2.000', t0);
    const item2 = createMockItem('item_2', '-500', t0 + 500);
    const item3 = createMockItem('item_3', '+1.500', t0 + 800);

    // Evaluated at t0 + 2000 (item1 has dwelt 2000ms >= minDwellMs, item2 has dwelt 1500ms < minDwellMs)
    const timestamps = new Map([
      ['item_1', t0],
      ['item_2', t0 + 500],
    ]);

    const result = selectVisibleFloatingTexts([item1, item2, item3], {
      maxVisible: MOBILE_MAX_FLOATING_TEXTS,
      minDwellMs: MIN_NOTIFICATION_DWELL_MS,
      now: t0 + 2000,
      currentlyVisibleIds: ['item_1', 'item_2'],
      firstShownTimestamps: timestamps,
    });

    expect(result.visibleItems.map((i) => i.id)).toEqual(['item_2', 'item_3']);
    expect(result.updatedFirstShownTimestamps.get('item_3')).toBe(t0 + 2000);
  });

  it('TC-324.03 [UC-DWELL/MSS]: Given an active notification is dismissed or removed from store, When removed, Then queued notification immediately enters the vacated slot without waiting', () => {
    const t0 = 10000;
    const item2 = createMockItem('item_2', '-500', t0 + 200);
    const item3 = createMockItem('item_3', '+1.500', t0 + 400);

    // item1 was dismissed, so items array only contains [item2, item3]
    const timestamps = new Map([
      ['item_2', t0 + 200],
    ]);

    const result = selectVisibleFloatingTexts([item2, item3], {
      maxVisible: MOBILE_MAX_FLOATING_TEXTS,
      minDwellMs: MIN_NOTIFICATION_DWELL_MS,
      now: t0 + 600,
      currentlyVisibleIds: ['item_2'],
      firstShownTimestamps: timestamps,
    });

    expect(result.visibleItems.map((i) => i.id)).toEqual(['item_2', 'item_3']);
    expect(result.visibleItems).toHaveLength(2);
  });

  it('TC-324.04 [UC-CEIL/MSS]: Given Desktop environment with 3 notifications and no milestone, When rendered, Then all 3 notifications are displayed simultaneously', () => {
    const t0 = 10000;
    const item1 = createMockItem('item_1', '+2.000', t0);
    const item2 = createMockItem('item_2', '-500', t0 + 100);
    const item3 = createMockItem('item_3', '+1.500', t0 + 200);

    const result = selectVisibleFloatingTexts([item1, item2, item3], {
      maxVisible: DESKTOP_MAX_FLOATING_TEXTS,
      minDwellMs: MIN_NOTIFICATION_DWELL_MS,
      now: t0 + 300,
    });

    expect(result.visibleItems).toHaveLength(3);
    expect(result.visibleItems.map((i) => i.id)).toEqual(['item_1', 'item_2', 'item_3']);
  });

  it('TC-324.05 [UC-CEIL/MSS]: Given Desktop environment with a milestone banner, When rendered, Then displays up to 2 regular notifications alongside the milestone banner', () => {
    const t0 = 10000;
    const item1 = createMockItem('item_1', '+2.000', t0);
    const item2 = createMockItem('item_2', '-500', t0 + 100);
    const item3 = createMockItem('item_3', '+1.500', t0 + 200);

    // When milestone banner is present on desktop, regular maxVisible is 2
    const result = selectVisibleFloatingTexts([item1, item2, item3], {
      maxVisible: 2,
      minDwellMs: MIN_NOTIFICATION_DWELL_MS,
      now: t0 + 300,
    });

    expect(result.visibleItems).toHaveLength(2);
    expect(result.visibleItems.map((i) => i.id)).toEqual(['item_2', 'item_3']);
  });

  it('TC-324.06 [UC-MOB/MSS]: Given Mobile environment with a milestone banner, When rendered, Then restricts regular notifications to 1 preserving mobile viewport clarity', () => {
    const t0 = 10000;
    const item1 = createMockItem('item_1', '+2.000', t0);
    const item2 = createMockItem('item_2', '-500', t0 + 100);

    // On mobile with milestone, maxVisible for regular notifications is 1
    const result = selectVisibleFloatingTexts([item1, item2], {
      maxVisible: 1,
      minDwellMs: MIN_NOTIFICATION_DWELL_MS,
      now: t0 + 200,
    });

    expect(result.visibleItems).toHaveLength(1);
    expect(result.visibleItems[0]?.id).toBe('item_2');
  });
});
