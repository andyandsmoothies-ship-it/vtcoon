// [IMP-201/MSS][IMP-332] Client Session Lifecycle Purge & Cross-Match State Isolation
import { useActivityStore } from '../store/activity_store.js';
import { useTelemetryStore } from '../telemetry/telemetry_store.js';
import { useGameStore } from '../store/game_store.js';
import { useVfxStore } from '../store/vfx_store.js';
import { resetEventCardActivityTracker, resetAuctionActivityTracker, resetTransitActivityTracker } from './activity_tracker.js';
import { resetTradeOfferResolutions } from '../ui/modals/bot_trade_offer_strip.js';
import { clearGameEventListeners, registerDefaultSubscribers } from '../events/game_event_bus.js';
import { clearPendingPacingTimers } from '../events/pacing_context.js';
import { clearPendingBadgeTimers } from './activity_badge_dispatcher.js';

export interface PurgeSessionOptions {
  /**
   * Có reset useGameStore về INITIAL_GAME_STATE hay không.
   * Mặc định: true (khi rời phòng hoặc reset sảnh).
   * false khi full-sync tick <= 1 đang nạp dữ liệu bàn cờ mới vào useGameStore.
   */
  readonly clearGameStore?: boolean;
}

/**
 * Xóa sạch toàn bộ trạng thái, logs, telemetry, và VFX của ván chơi cũ.
 * Ngăn chặn hiện tượng rò rỉ hoặc append nhật ký ván cũ sang ván mới.
 */
export function purgeClientMatchSession(options: PurgeSessionOptions = { clearGameStore: true }): void {
  // 1. Dọn dẹp nhật ký hoạt động, sequence xúc xắc/đấu giá, reset bộ lọc về 'all' và đóng feed
  useActivityStore.getState().clearLogs();

  // 2. Reset deduplication key của thẻ cơ hội / sự kiện thị trường, phiên đấu giá, và bot trade offers
  resetEventCardActivityTracker();
  resetAuctionActivityTracker();
  resetTransitActivityTracker();
  resetTradeOfferResolutions();

  // 3. Reset flight recorder, audit logs, violations trong telemetry
  useTelemetryStore.getState().reset();

  // 4. Xóa sạch hiệu ứng rung lắc camera và nện búa VFX còn dang dở
  useVfxStore.getState().clearAllSlams();
  useVfxStore.getState().clearScreenShake();
  useVfxStore.setState({ activePawnReactions: {} });

  // 5. Reset toàn bộ GameStore (modal, BĐS, người chơi, xúc xắc, turn) nếu được yêu cầu
  if (options.clearGameStore) {
    useGameStore.getState().resetGameState();
    useGameStore.getState().closeModal();
  }

  // 6. [IMP-332] Dọn dẹp listeners của GameEventBus và khôi phục default presentation subscribers
  clearGameEventListeners();
  registerDefaultSubscribers();

  // 7. [IMP-333] Xóa sạch các bộ đếm thời gian pacing và badge còn đang hẹn giờ
  clearPendingPacingTimers();
  clearPendingBadgeTimers();
}

