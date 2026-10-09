import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  isRollActionDisabled,
  isEndTurnDisabled,
  resolveEndTurnButtonLabel,
  shouldShowSkipTurnNotice,
  resolveActionDockNotice,
  type ActionDockButtonStateParams,
  type ActionDockNoticeParams,
} from '../../src/client/ui/ui_action_dock_helpers.js';

describe('ui_action_dock_helpers', () => {
  describe('formatCurrency', () => {
    it('formats positive numbers with vietnamese dot thousand separators', () => {
      expect(formatCurrency(12500)).toBe('12.500');
      expect(formatCurrency(1000000)).toBe('1.000.000');
    });

    it('formats negative numbers with leading minus sign', () => {
      expect(formatCurrency(-1200)).toBe('-1.200');
    });

    it('clamps negative rounding under threshold to zero without minus zero', () => {
      expect(formatCurrency(-0.2)).toBe('0');
    });

    it('returns zero string for non-finite values', () => {
      expect(formatCurrency(NaN)).toBe('0');
      expect(formatCurrency(Infinity)).toBe('0');
    });
  });

  describe('isRollActionDisabled', () => {
    it('disables roll during AuctionPhase', () => {
      const params: ActionDockButtonStateParams = {
        isMyTurn: true,
        isRolling: false,
        isPawnMoving: false,
        turnPhase: 'AuctionPhase',
      };
      expect(isRollActionDisabled(params)).toBe(true);
    });

    it('disables roll when pawn is animating movement or rolling', () => {
      const movingParams: ActionDockButtonStateParams = {
        isMyTurn: true,
        isRolling: false,
        isPawnMoving: true,
      };
      const rollingParams: ActionDockButtonStateParams = {
        isMyTurn: true,
        isRolling: true,
        isPawnMoving: false,
      };
      expect(isRollActionDisabled(movingParams)).toBe(true);
      expect(isRollActionDisabled(rollingParams)).toBe(true);
    });

    it('disables roll when not my turn or player is bankrupt', () => {
      const notMyTurn: ActionDockButtonStateParams = {
        isMyTurn: false,
        isRolling: false,
        isPawnMoving: false,
      };
      const bankrupt: ActionDockButtonStateParams = {
        isMyTurn: true,
        isRolling: false,
        isPawnMoving: false,
        isBankrupt: true,
      };
      expect(isRollActionDisabled(notMyTurn)).toBe(true);
      expect(isRollActionDisabled(bankrupt)).toBe(true);
    });

    it('enables roll when it is my turn and dice has not been rolled', () => {
      const params: ActionDockButtonStateParams = {
        isMyTurn: true,
        isRolling: false,
        isPawnMoving: false,
        hasRolledThisTurn: false,
      };
      expect(isRollActionDisabled(params)).toBe(false);
    });

    it('disables roll in PropertyManagement when player has not rolled yet even if canRollAgain is true', () => {
      const params: ActionDockButtonStateParams = {
        isMyTurn: true,
        isRolling: false,
        isPawnMoving: false,
        turnPhase: 'PropertyManagement',
        hasRolledThisTurn: false,
        canRollAgain: true,
      };
      expect(isRollActionDisabled(params)).toBe(true);
    });
  });

  describe('isEndTurnDisabled', () => {
    it('disables end turn when not my turn or player is insolvent', () => {
      const notMyTurn: ActionDockButtonStateParams = {
        isMyTurn: false,
        isRolling: false,
        isPawnMoving: false,
      };
      const insolvent: ActionDockButtonStateParams = {
        isMyTurn: true,
        isRolling: false,
        isPawnMoving: false,
        isInsolvent: true,
      };
      expect(isEndTurnDisabled(notMyTurn)).toBe(true);
      expect(isEndTurnDisabled(insolvent)).toBe(true);
    });

    it('disables end turn when player has not rolled yet in normal turn', () => {
      const params: ActionDockButtonStateParams = {
        isMyTurn: true,
        isRolling: false,
        isPawnMoving: false,
        hasRolledThisTurn: false,
      };
      expect(isEndTurnDisabled(params)).toBe(true);
    });

    it('enables end turn when player has completed roll and cannot roll again', () => {
      const params: ActionDockButtonStateParams = {
        isMyTurn: true,
        isRolling: false,
        isPawnMoving: false,
        hasRolledThisTurn: true,
        canRollAgain: false,
      };
      expect(isEndTurnDisabled(params)).toBe(false);
    });

    it('enables end turn when player is in audit and cannot roll again', () => {
      const params: ActionDockButtonStateParams = {
        isMyTurn: true,
        isRolling: false,
        isPawnMoving: false,
        inAudit: true,
        canRollAgain: false,
      };
      expect(isEndTurnDisabled(params)).toBe(false);
    });

    it('enables end turn when roll was skipped in PropertyManagement', () => {
      const params: ActionDockButtonStateParams = {
        isMyTurn: true,
        isRolling: false,
        isPawnMoving: false,
        turnPhase: 'PropertyManagement',
        hasRolledThisTurn: false,
        canRollAgain: false,
      };
      expect(isEndTurnDisabled(params)).toBe(false);
    });
  });

  describe('resolveEndTurnButtonLabel & shouldShowSkipTurnNotice', () => {
    it('returns spectator label for bankrupt player', () => {
      expect(resolveEndTurnButtonLabel(undefined, undefined, undefined, true)).toBe('👁️ Khán Giả (Đang Xem)');
    });

    it('returns skip turn label when skipped in PropertyManagement without prior roll', () => {
      expect(resolveEndTurnButtonLabel('PropertyManagement', false, false, false)).toBe('⏩ Mất Lượt (Hết Lượt)');
    });

    it('returns default end turn label for normal turn completion', () => {
      expect(resolveEndTurnButtonLabel('PropertyManagement', true, false, false)).toBe('Hết Lượt');
    });

    it('detects skip turn notice condition correctly and ignores bankrupt players', () => {
      expect(shouldShowSkipTurnNotice('PropertyManagement', false, false, true, false)).toBe(true);
      expect(shouldShowSkipTurnNotice('PropertyManagement', false, false, true, true)).toBe(false);
    });
  });

  describe('resolveActionDockNotice', () => {
    it('returns null when player is bankrupt', () => {
      const params: ActionDockNoticeParams = { isBankrupt: true, isInsolvent: true };
      expect(resolveActionDockNotice(params)).toBeNull();
    });

    it('prioritizes insolvent emergency over all other notices', () => {
      const params: ActionDockNoticeParams = {
        isInsolvent: true,
        balance: -500,
        inAudit: true,
        isStandingOnBuyable: true,
      };
      const notice = resolveActionDockNotice(params);
      expect(notice?.type).toBe('insolvent');
      expect(notice?.tone).toBe('error');
    });

    it('presents audit station instructions when player is in audit', () => {
      const params: ActionDockNoticeParams = {
        inAudit: true,
        auditTurnsLeft: 2,
        isMyTurn: true,
        hasRolledThisTurn: false,
      };
      const notice = resolveActionDockNotice(params);
      expect(notice?.type).toBe('audit');
      expect(notice?.tone).toBe('warning');
    });

    it('presents property purchase opportunity when standing on buyable cell', () => {
      const params: ActionDockNoticeParams = {
        isMyTurn: true,
        isStandingOnBuyable: true,
        buyableCellName: 'Hồ Gươm',
        buyableCellPrice: 2000,
      };
      const notice = resolveActionDockNotice(params);
      expect(notice?.type).toBe('buy_opportunity');
      expect(notice?.tone).toBe('warning');
    });

    it('triggers skip_turn notice when isSkippedTurn flag is explicitly set', () => {
      const notice = resolveActionDockNotice({ isSkippedTurn: true });
      expect(notice?.type).toBe('skip_turn');
      expect(notice?.tone).toBe('warning');
    });

    it('triggers bot_pacing notice when not my turn and botPacing is provided', () => {
      const notice = resolveActionDockNotice({
        isMyTurn: false,
        botPacing: { displayText: 'Bot đang tính toán...', isBotTurn: true },
      });
      expect(notice?.type).toBe('bot_pacing');
      expect(notice?.tone).toBe('info');
    });

    it('adheres to mobile 45-character ceiling across notice types', () => {
      const insolventNotice = resolveActionDockNotice({ isInsolvent: true, balance: -100 });
      const auditNotice = resolveActionDockNotice({ inAudit: true, isMyTurn: true, auditTurnsLeft: 3 });
      expect(insolventNotice?.mobileText.length).toBeLessThanOrEqual(45);
      expect(auditNotice?.mobileText.length).toBeLessThanOrEqual(45);
    });
  });
});
