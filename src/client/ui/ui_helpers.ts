// [UI-S03/MSS] Pure UI helpers — Currency, countdown timer, net worth calculations & dock states
import { PROPERTY_DEEDS } from '../../domain/property_data';
import { BOARD_CONFIG, ColorGroup } from '../../domain/board_config';
import type { RecordedIntentContext } from '../telemetry/telemetry_types';
import { TurnPhase } from '../../domain/room';
import {
  formatCurrency,
  isRollActionDisabled,
  isEndTurnDisabled,
  resolveEndTurnButtonLabel,
  shouldShowSkipTurnNotice,
  resolveActionDockNotice,
  type ActionDockButtonStateParams,
  type ActionDockNotice,
  type ActionDockNoticeParams,
} from './ui_action_dock_helpers.js';

export {
  formatCurrency,
  isRollActionDisabled,
  isEndTurnDisabled,
  resolveEndTurnButtonLabel,
  shouldShowSkipTurnNotice,
  resolveActionDockNotice,
  type ActionDockButtonStateParams,
  type ActionDockNotice,
  type ActionDockNoticeParams,
};

const LEVEL_MULTIPLIER: Record<number, number> = { 0: 1, 1: 1.5, 2: 2.5, 3: 4 };

/**
 * Format remaining turn seconds to MM:SS string ("00:45", "01:15")
 * Automatically clamps negative or non-finite values to "00:00".
 */
export function formatTimeRemaining(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '00:00';
  }
  const totalSec = Math.floor(seconds);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  const mm = mins.toString().padStart(2, '0');
  const ss = secs.toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

/**
 * Calculate player Net Worth = Cash + Property values (with upgrades) - Mortgage loans
 * Mortgaged properties deduct loan amount (from mortgageLoans map or default 50% base price).
 * Safely deduplicates owned cells and handles undefined inputs.
 */
export function calculatePlayerNetWorth(
  cash: number,
  ownedCellIndices: readonly number[] = [],
  levelMap: Record<number, 0 | 1 | 2 | 3> = {},
  mortgagedCellIndices: readonly number[] = [],
  mortgageLoans?: Record<number, number>
): number {
  let worth = Number.isFinite(cash) ? Math.round(cash) : 0;
  const mortgagedSet = new Set(mortgagedCellIndices ?? []);
  const uniqueOwned = Array.from(new Set(ownedCellIndices ?? []));

  for (const cellIndex of uniqueOwned) {
    const deed = PROPERTY_DEEDS.get(cellIndex);
    if (!deed) continue;

    const level = (levelMap ?? {})[cellIndex] ?? 0;
    const mult = LEVEL_MULTIPLIER[level] ?? 1;
    worth += Math.floor(deed.price * mult);

    if (mortgagedSet.has(cellIndex)) {
      const loan = mortgageLoans?.[cellIndex] ?? Math.floor(deed.price * 0.5);
      worth -= loan;
    }
  }

  return worth;
}

/**
 * Get unique color groups owned by player for HUD visual dots
 */
export function getOwnedColorGroups(ownedCellIndices: readonly number[] = []): readonly ColorGroup[] {
  const groups = new Set<ColorGroup>();
  const list = ownedCellIndices ?? [];
  for (const idx of list) {
    const cell = BOARD_CONFIG[idx];
    if (cell?.colorGroup) {
      groups.add(cell.colorGroup);
    }
  }
  return Array.from(groups);
}


/**
 * Resolve target cell and purchase eligibility for Manage Property modal
 * Defaults to first owned property, or falls back to current board position if none owned.
 */
export function resolveManagePropertyTarget(
  ownedProperties?: readonly number[],
  currentPosition: number = 0,
  isStandingOnBuyable: boolean = false
): { cellIndex: number; canBuy: boolean } {
  if (isStandingOnBuyable) {
    return { cellIndex: currentPosition, canBuy: true };
  }
  const targetCell = ownedProperties?.[0] ?? currentPosition;
  const isOwned = Boolean(ownedProperties?.includes(targetCell));
  return { cellIndex: targetCell, canBuy: !isOwned };
}

/**
 * [IMP-121] Resolve DirectionalLight shadow map resolution based on device tier
 * 1024 on mobile devices saves 75% GPU memory and shadow fillrate over 2048
 */
export function resolveShadowMapSize(isMobile?: boolean): number {
  return isMobile ? 1024 : 2048;
}

export interface BotPacingStatus {
  readonly botId: string;
  readonly botName: string;
  readonly botOrder: number;
  readonly totalBots: number;
  readonly displayText: string;
  readonly isBotTurn?: boolean;
}

/**
 * [IMP-121] Resolve active bot pacing indicator status
 * Returns status info when an AI bot is taking their turn, or null otherwise
 */
export function resolveBotPacingStatus(
  currentTurnPlayerId: string | null | undefined,
  localPlayerId: string,
  playersInfo: Record<string, { id: string; name?: string; isBot?: boolean }>,
  turnPhase?: TurnPhase | string,
): BotPacingStatus | null {
  if (turnPhase === TurnPhase.AuctionPhase) {
    const allBots = Object.values(playersInfo).filter((p) => p.isBot);
    if (allBots.length > 0) {
      const activeBot = (currentTurnPlayerId && playersInfo[currentTurnPlayerId]?.isBot)
        ? playersInfo[currentTurnPlayerId]
        : allBots[0];
      const rawBotName = activeBot?.name || 'Bot AI';
      const botName = formatShortPlayerName(rawBotName);
      return {
        botId: activeBot?.id ?? 'bot_auction',
        botName,
        botOrder: 1,
        totalBots: allBots.length,
        displayText: `🤖 Đang đấu giá... (${botName})`,
        isBotTurn: true,
      };
    }
    return {
      botId: 'bot_auction',
      botName: 'Bot AI',
      botOrder: 1,
      totalBots: 1,
      displayText: '🤖 Đang đấu giá...',
      isBotTurn: true,
    };
  }

  if (!currentTurnPlayerId || currentTurnPlayerId === localPlayerId) return null;
  const currentTurnPlayer = playersInfo[currentTurnPlayerId];
  if (!currentTurnPlayer || !currentTurnPlayer.isBot) return null;

  const allBots = Object.values(playersInfo).filter((p) => p.isBot);
  if (allBots.length === 0) return null;
  const botIndex = allBots.findIndex((b) => b.id === currentTurnPlayerId);
  const botOrder = botIndex >= 0 ? botIndex + 1 : 1;
  const totalBots = allBots.length;
  const rawBotName = currentTurnPlayer.name || `Bot ${botOrder}`;
  const botName = formatShortPlayerName(rawBotName);

  return {
    botId: currentTurnPlayerId,
    botName,
    botOrder,
    totalBots,
    displayText: `⏳ Lượt ${botName}... (${botOrder}/${totalBots})`,
    isBotTurn: true,
  };
}

export interface BuildIntentTelemetryContextParams {
  readonly intentType: string;
  readonly dice?: readonly [number, number];
  readonly consecutiveDoubles?: number;
  readonly balance?: number;
  readonly position?: number;
  readonly currentTurnPlayerId?: string | null;
  readonly localPlayerId?: string;
}

/**
 * [IMP-121] Build contextual snapshot for recorded player intents
 * Explicitly annotates follow-up rolls triggered by doubles
 */
export function buildIntentTelemetryContext(
  params: BuildIntentTelemetryContextParams
): RecordedIntentContext {
  const dice = params.dice ?? [0, 0];
  const consecutiveDoubles = params.consecutiveDoubles ?? 0;
  const hasDoublesChain = params.consecutiveDoubles !== undefined
    ? params.consecutiveDoubles > 0
    : (dice[0] === dice[1] && dice[0] > 0);
  const isDoublesRoll = params.intentType === 'INTENT_ROLL' && hasDoublesChain;

  return {
    buttonLabel: params.intentType === 'INTENT_ROLL'
      ? (isDoublesRoll ? 'Đổ Tiếp (Đôi)' : 'Đổ Xúc Xắc')
      : undefined,
    isDoublesRoll,
    consecutiveDoubles,
    currentTurnPlayerId: params.currentTurnPlayerId ?? undefined,
    dice,
    position: params.position,
    balance: params.balance,
    note: isDoublesRoll ? 'DOUBLES_FOLLOWUP_ROLL' : undefined,
  };
}


export interface AdaptivePostProcessingParams {
  readonly fps?: number;
  readonly isMobile?: boolean;
  readonly enableAo?: boolean;
}

export interface AdaptivePostProcessingResult {
  readonly enableAo: boolean;
  readonly aoQuality: 'low' | 'medium' | 'high';
  readonly aoHalfRes: boolean;
}

export function resolveAdaptivePostProcessing(
  params: AdaptivePostProcessingParams
): AdaptivePostProcessingResult {
  const fps = params.fps;
  const isMobile = Boolean(params.isMobile);
  const baseEnableAo = params.enableAo !== undefined ? params.enableAo : true;

  if (!Number.isFinite(fps) || (fps !== undefined && fps < 0) || isMobile || (fps !== undefined && fps < 35)) {
    return {
      enableAo: false,
      aoQuality: 'low',
      aoHalfRes: true,
    };
  }
  if (fps !== undefined && fps < 45) {
    return {
      enableAo: baseEnableAo,
      aoQuality: 'low',
      aoHalfRes: true,
    };
  }
  return {
    enableAo: baseEnableAo,
    aoQuality: 'medium',
    aoHalfRes: true,
  };
}


/**
 * Formats player names for compact displays, stripping bot personality tags like (Aggressive).
 * Optionally truncates with ellipsis if maxLength is provided.
 */
export function formatShortPlayerName(name?: string, maxLength?: number): string {
  if (!name) return '';
  const cleaned = name.replace(/\s*\((?:Aggressive|Cautious|Balanced|Passive|Bot|Chủ Phòng|Dẫn Đầu|Táo Bạo|Cẩn Trọng|Cân Bằng|Phòng Thủ|Tấn Công)\)/gi, '').trim();
  if (maxLength && cleaned.length > maxLength) {
    return `${cleaned.slice(0, maxLength > 3 ? maxLength - 2 : maxLength)}...`;
  }
  return cleaned;
}

export function formatLocalizedBotPersonality(name: string): string {
  return name
    .replace(/\(Passive\)/gi, '(Phòng Thủ)')
    .replace(/\(Aggressive\)/gi, '(Tấn Công)')
    .replace(/\(Balanced\)/gi, '(Cân Bằng)');
}
