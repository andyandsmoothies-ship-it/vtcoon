// [IMP-316] Action Dock Helpers & Contextual Notification Logic
// [UI-S03/MSS] Pure UI helpers — Currency & Dock States
import { calculateBailAmount } from '../../domain/property_rent.js';
import { BOARD_CONFIG, CellType } from '../../domain/board_config.js';
import { TurnPhase } from '../../domain/room.js';

/**
 * Format currency to Vietnamese standard format ("12.500" or "-1.200")
 * Clamps negative rounding to zero (e.g. -0.2 -> "0") to prevent "-0"
 */
export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) {
    return '0';
  }
  const absVal = Math.abs(Math.round(amount));
  const isNegative = amount < 0 && absVal > 0;
  const formatted = absVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${isNegative ? '-' : ''}${formatted}`;
}

export interface ActionDockButtonStateParams {
  readonly isRolling: boolean;
  readonly isPawnMoving: boolean;
  readonly isMyTurn: boolean;
  readonly isBankrupt?: boolean;
  readonly hasRolledThisTurn?: boolean;
  readonly canRollAgain?: boolean;
  readonly isRollPending?: boolean;
  readonly isInsolvent?: boolean;
  readonly inAudit?: boolean;
  readonly turnPhase?: string;
}

/**
 * TC-UI03.5: Pure logic checking whether roll dice action is disabled
 */
export function isRollActionDisabled(params: ActionDockButtonStateParams): boolean {
  if (params.turnPhase === 'AuctionPhase') {
    return true;
  }
  if (
    !params.inAudit &&
    params.turnPhase === 'PropertyManagement' &&
    (!params.canRollAgain || !params.hasRolledThisTurn)
  ) {
    return true;
  }
  return (
    Boolean(params.isRollPending) ||
    Boolean(params.inAudit && params.hasRolledThisTurn && !params.canRollAgain) ||
    Boolean(params.isRolling) ||
    Boolean(params.isPawnMoving) ||
    !params.isMyTurn ||
    Boolean(params.isBankrupt) ||
    (Boolean(params.hasRolledThisTurn) && !params.canRollAgain)
  );
}

/**
 * Pure logic checking whether end turn action is disabled
 */
export function isEndTurnDisabled(params: ActionDockButtonStateParams): boolean {
  if (
    !params.isMyTurn ||
    params.isRolling ||
    params.isPawnMoving ||
    Boolean(params.isBankrupt) ||
    Boolean(params.isInsolvent)
  ) {
    return true;
  }
  if (!params.canRollAgain && (params.inAudit || (params.turnPhase === 'PropertyManagement' && !params.hasRolledThisTurn))) {
    return false;
  }
  return (
    (params.hasRolledThisTurn !== undefined ? !params.hasRolledThisTurn : false) ||
    Boolean(params.canRollAgain)
  );
}

export function resolveEndTurnButtonLabel(
  turnPhase?: string,
  hasRolledThisTurn?: boolean,
  inAudit?: boolean,
  isBankrupt?: boolean
): string {
  if (isBankrupt) return '👁️ Khán Giả (Đang Xem)';
  if (turnPhase === 'PropertyManagement' && !hasRolledThisTurn && !inAudit) {
    return '⏩ Mất Lượt (Hết Lượt)';
  }
  return 'Hết Lượt';
}

export function shouldShowSkipTurnNotice(
  turnPhase?: string,
  hasRolledThisTurn?: boolean,
  inAudit?: boolean,
  isMyTurn?: boolean,
  isBankrupt?: boolean
): boolean {
  if (isBankrupt) return false;
  return Boolean(isMyTurn && turnPhase === 'PropertyManagement' && !hasRolledThisTurn && !inAudit);
}

export interface ActionDockNotice {
  readonly type: 'insolvent' | 'audit' | 'skip_turn' | 'bot_pacing' | 'buy_opportunity';
  readonly icon: string;
  readonly desktopText: string;
  readonly mobileText: string;
  readonly tone: 'error' | 'warning' | 'info';
}

export interface ActionDockNoticeParams {
  readonly isMyTurn?: boolean;
  readonly isInsolvent?: boolean;
  readonly inAudit?: boolean;
  readonly auditTurnsLeft?: number;
  readonly balance?: number;
  readonly turnPhase?: string;
  readonly hasRolledThisTurn?: boolean;
  readonly isSkippedTurn?: boolean;
  readonly botPacing?: { readonly displayText: string; readonly isBotTurn?: boolean } | null;
  readonly isStandingOnBuyable?: boolean;
  readonly buyableCellName?: string;
  readonly buyableCellPrice?: number;
  readonly isBankrupt?: boolean;
}

export function resolveActionDockNotice(params: ActionDockNoticeParams): ActionDockNotice | null {
  if (params.isBankrupt) return null;

  if (params.isInsolvent) {
    const bal = params.balance ?? 0;
    return {
      type: 'insolvent',
      icon: '🚨',
      desktopText: `Ngân sách âm (${bal}): Hãy thế chấp hoặc thanh lý tài sản để cứu nợ!`,
      mobileText: `Âm vốn (${bal}): Cần thế chấp cứu nợ`,
      tone: 'error',
    };
  }

  const isActorTurn = params.isMyTurn ?? true;
  if (params.inAudit && (isActorTurn || !params.botPacing?.isBotTurn)) {
    const turns = params.auditTurnsLeft ?? 0;
    if (params.hasRolledThisTurn) {
      return {
        type: 'audit',
        icon: '⚖️',
        desktopText: `Gieo không ra đôi (còn ${turns} lượt): Nộp tiền bảo lãnh hoặc kết thúc lượt.`,
        mobileText: 'Không ra đôi: Nộp bảo lãnh hoặc Xong lượt',
        tone: 'warning',
      };
    }
    return {
      type: 'audit',
      icon: '⚖️',
      desktopText: `Đang thụ án kiểm toán (còn ${turns} lượt): Gieo đôi để tự do, nộp bảo lãnh hoặc chấp hành án.`,
      mobileText: `Ô 10 (còn ${turns} lượt): Gieo đôi hoặc bảo lãnh`,
      tone: 'warning',
    };
  }

  const isSkipped = Boolean(
    params.isSkippedTurn ||
      (params.isMyTurn &&
        params.turnPhase === 'PropertyManagement' &&
        !params.hasRolledThisTurn &&
        !params.inAudit)
  );
  if (isSkipped) {
    return {
      type: 'skip_turn',
      icon: '🌪️',
      desktopText: 'Bạn bị hoãn gieo xúc xắc lượt này (Bão duyên hải / Kiểm tra cồn)',
      mobileText: 'Hoãn gieo xúc xắc lượt này',
      tone: 'warning',
    };
  }

  if (params.isStandingOnBuyable && params.isMyTurn) {
    const priceText = params.buyableCellPrice ? ` (${formatCurrency(params.buyableCellPrice)})` : '';
    return {
      type: 'buy_opportunity',
      icon: '🏷️',
      desktopText: `Bạn đang ở ${params.buyableCellName ?? 'ô đất'}${priceText}: Bấm Mua Đất hoặc Cầm Cố để sở hữu!`,
      mobileText: `Đứng tại ${params.buyableCellName ?? 'ô đất'}: Bấm Mua Đất để chốt`,
      tone: 'warning',
    };
  }

  if (!params.isMyTurn && params.botPacing) {
    const text = params.botPacing.displayText;
    return {
      type: 'bot_pacing',
      icon: '🤖',
      desktopText: text,
      mobileText: text.slice(0, 45),
      tone: 'info',
    };
  }

  return null;
}

export interface BailInfo {
  readonly cost: number;
  readonly canAfford: boolean;
  readonly label: string;
  readonly title: string;
}

export function resolveBailInfo(auditCount: number, balance = 0): BailInfo {
  const cost = calculateBailAmount(auditCount);
  const canAfford = balance >= cost;
  const label = auditCount > 1
    ? (auditCount === 2 ? `Bảo Lãnh - Lần 2 (${formatCurrency(cost)})` : `Bảo Lãnh - Tái Phạm (${formatCurrency(cost)})`)
    : `Bảo Lãnh (${formatCurrency(cost)})`;
  const title = !canAfford
    ? `Bạn cần ít nhất ${formatCurrency(cost)} để nộp tiền bảo lãnh`
    : (auditCount > 1
        ? `Nộp ${formatCurrency(cost)} bảo lãnh tái phạm (Lần ${auditCount}) để rời trạm ngay`
        : `Nộp ${formatCurrency(cost)} bảo lãnh kiểm toán để rời trạm ngay`);
  return { cost, canAfford, label, title };
}

export function isStandingOnBuyableCell(params: {
  readonly isMyTurn: boolean;
  readonly isBankrupt: boolean;
  readonly isInsolvent: boolean;
  readonly isPawnBusyMoving: boolean;
  readonly turnPhase?: TurnPhase;
  readonly hasRolledThisTurn?: boolean;
  readonly currentPos: number;
  readonly isOwnedByAnyone: boolean;
  readonly isTradeFrozen?: boolean;
}): boolean {
  const currentCell = BOARD_CONFIG[params.currentPos];
  const isPropertyCell = Boolean(
    currentCell &&
    (currentCell.type === CellType.Property || currentCell.type === CellType.Railroad || currentCell.type === CellType.Utility)
  );
  return Boolean(
    params.isMyTurn &&
    !params.isBankrupt &&
    !params.isInsolvent &&
    !params.isPawnBusyMoving &&
    (params.turnPhase === TurnPhase.ActionPhase || (params.hasRolledThisTurn && params.turnPhase !== TurnPhase.PropertyManagement && params.turnPhase !== TurnPhase.AuctionPhase && params.turnPhase !== TurnPhase.InsolvencyPhase)) &&
    isPropertyCell &&
    !params.isOwnedByAnyone &&
    !params.isTradeFrozen
  );
}
