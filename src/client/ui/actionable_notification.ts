// [IMP-134] Actionable In-Game Guidance System & Contextual Notifications
// Universal notification model & error reason mapping

import { vi } from '../../domain/i18n/vi.js';

// Re-export Facade: Bảo đảm 100% tương thích ngược, zero caller breakage
export {
  type ActionableNotification,
  ACTIONABLE_NOTIFICATIONS_MAP,
  DEFAULT_FALLBACK_NOTIFICATION,
} from './actionable_notification_map.js';

import {
  type ActionableNotification,
  ACTIONABLE_NOTIFICATIONS_MAP,
  DEFAULT_FALLBACK_NOTIFICATION,
} from './actionable_notification_map.js';

export function resolveActionableNotification(reasonCode?: string | null): ActionableNotification {
  if (!reasonCode || typeof reasonCode !== 'string') {
    return DEFAULT_FALLBACK_NOTIFICATION;
  }
  const match = ACTIONABLE_NOTIFICATIONS_MAP[reasonCode];
  if (match) return match;

  const viText = (vi.rejectReasons as Record<string, string>)[reasonCode];
  if (viText) {
    return {
      icon: 'ℹ️',
      title: 'Hướng Dẫn Trò Chơi',
      description: viText,
      tone: 'info',
      actionHint: 'Vui lòng kiểm tra lại tình trạng lượt chơi trên thanh điều khiển.',
    };
  }
  return DEFAULT_FALLBACK_NOTIFICATION;
}

export function formatServerErrorMessage(reasonCode?: string | null): string {
  if (!reasonCode || typeof reasonCode !== 'string') {
    return 'Hướng dẫn trò chơi: Thao tác tạm thời chưa thể thực hiện. Vui lòng kiểm tra lại tình trạng lượt chơi!';
  }
  const notif = resolveActionableNotification(reasonCode);
  if (notif === DEFAULT_FALLBACK_NOTIFICATION) {
    return `Hướng dẫn trò chơi: Thao tác tạm thời chưa thể thực hiện (${reasonCode}). Vui lòng kiểm tra lại tình trạng lượt chơi!`;
  }
  if (notif.actionHint) {
    return `${notif.title}: ${notif.description} 👉 ${notif.actionHint}`;
  }
  return `${notif.title}: ${notif.description}`;
}

export default resolveActionableNotification;
