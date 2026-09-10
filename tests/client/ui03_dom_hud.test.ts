// [TC-UI03/MSS] Test Suite Slice UI-03: DOM HUD Tai Chinh & Bang Dieu Khien
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  formatCurrency,
  formatTimeRemaining,
  calculatePlayerNetWorth,
  getOwnedColorGroups,
  isRollActionDisabled,
  isEndTurnDisabled,
} from '../../src/client/ui/ui_helpers';
import { useGameStore } from '../../src/client/store/game_store';
import { ColorGroup } from '../../src/domain/board_config';
import { ActionDock } from '../../src/client/ui/action_dock';

describe('[TC-UI03.1/MSS] Format Tien Te Thuan Tuy (formatCurrency)', () => {
  it('Dinh dang dung so nguyen duong co phan tach hang nghin dau cham', () => {
    expect(formatCurrency(12500)).toBe('12.500 Tr.');
    expect(formatCurrency(500)).toBe('500 Tr.');
    expect(formatCurrency(1000000)).toBe('1.000.000 Tr.');
    expect(formatCurrency(0)).toBe('0 Tr.');
  });

  it('Dinh dang so am co dau tru chuan xac dai dien cho du no', () => {
    expect(formatCurrency(-1200)).toBe('-1.200 Tr.');
    expect(formatCurrency(-50)).toBe('-50 Tr.');
  });

  it('[Adversarial] Chan gia tri lam tron am ve 0 tranh hien thi -0 Tr.', () => {
    expect(formatCurrency(-0.2)).toBe('0 Tr.');
    expect(formatCurrency(-0)).toBe('0 Tr.');
  });

  it('[Adversarial] Chan gia tri phi so NaN hoac Vo Han ve 0 Tr.', () => {
    expect(formatCurrency(Number.NaN)).toBe('0 Tr.');
    expect(formatCurrency(Number.POSITIVE_INFINITY)).toBe('0 Tr.');
    expect(formatCurrency(Number.NEGATIVE_INFINITY)).toBe('0 Tr.');
  });
});

describe('[TC-UI03.2/MSS] Format Thoi Gian Dem Nguoc (formatTimeRemaining)', () => {
  it('Chuyen doi so giay hop le thanh chuoi MM:SS', () => {
    expect(formatTimeRemaining(45)).toBe('00:45');
    expect(formatTimeRemaining(5)).toBe('00:05');
    expect(formatTimeRemaining(75)).toBe('01:15');
    expect(formatTimeRemaining(120)).toBe('02:00');
  });

  it('Kep gia tri 0 hoac giay am ve 00:00', () => {
    expect(formatTimeRemaining(0)).toBe('00:00');
    expect(formatTimeRemaining(-15)).toBe('00:00');
  });

  it('[Adversarial] Chan gia tri NaN va vo han ve 00:00', () => {
    expect(formatTimeRemaining(Number.NaN)).toBe('00:00');
    expect(formatTimeRemaining(Number.POSITIVE_INFINITY)).toBe('00:00');
  });
});

describe('[TC-UI03.3/MSS] Tinh Toan Net Worth (calculatePlayerNetWorth)', () => {
  it('Chi co tien mat: Net Worth bang chinh xac tien mat', () => {
    expect(calculatePlayerNetWorth(10000, [])).toBe(10000);
  });

  it('Co BDS Cap 0 (he so 1.0): Cong don gia niem yet', () => {
    expect(calculatePlayerNetWorth(5000, [1], { 1: 0 })).toBe(5600);
  });

  it('Co BDS da nang cap: Ap dung he so Cap 1 (1.5x), Cap 2 (2.5x), Cap 3 (4.0x)', () => {
    const levelMap = { 1: 1 as const, 6: 3 as const, 9: 2 as const };
    expect(calculatePlayerNetWorth(10000, [1, 6, 9], levelMap)).toBe(17900);
  });

  it('BDS the chap chi dong gop 50% gia niem yet vao Net Worth theo mac dinh', () => {
    expect(calculatePlayerNetWorth(5000, [1], { 1: 0 }, [1])).toBe(5300);
  });

  it('[Adversarial] Khau tru chinh xac theo mortgageLoans neu duoc cung cap (VD: 60% urban planning)', () => {
    // Cell 31 price = 3000. 60% loan = 1800. Net worth = 5000 + 3000 - 1800 = 6200
    const worth = calculatePlayerNetWorth(5000, [31], { 31: 0 }, [31], { 31: 1800 });
    expect(worth).toBe(6200);
  });

  it('[Adversarial] Loai bo trung lap ownedCellIndices va phong thu an toan voi undefined/NaN', () => {
    expect(calculatePlayerNetWorth(5000, [1, 1], { 1: 0 })).toBe(5600);
    expect(calculatePlayerNetWorth(Number.NaN, [9999, -1])).toBe(0);
    expect(calculatePlayerNetWorth(1000, undefined as unknown as number[])).toBe(1000);
  });
});

describe('[TC-UI03.4/MSS] Trang Thai Store HUD (useGameStore)', () => {
  beforeEach(() => {
    useGameStore.setState({
      playersInfo: {},
      currentTurnPlayerId: null,
      turnTimeRemaining: 60,
      treasuryPool: 0,
      roundNumber: 1,
      maxRounds: 30,
      isRolling: false,
      activePawnAnimation: null,
    });
  });

  it('Cap nhat playersInfo, treasuryPool, roundInfo va turn timer', () => {
    const store = useGameStore.getState();
    store.setPlayersInfo({
      p1: { id: 'p1', name: 'Player 1', balance: 10000, tokenColor: '#c0392b', ownedProperties: [1] },
      p2: { id: 'p2', name: 'Player 2', balance: 5000, tokenColor: '#2980b9', ownedProperties: [] },
    });
    store.setTreasuryPool(1500);
    store.setRoundInfo(3, 30);
    store.setTurnTimeRemaining(45);

    const updated = useGameStore.getState();
    expect(Object.keys(updated.playersInfo)).toHaveLength(2);
    expect(updated.treasuryPool).toBe(1500);
    expect(updated.roundNumber).toBe(3);
    expect(updated.turnTimeRemaining).toBe(45);
  });

  it('decrementTurnTimer giam dung 1 giay va khong bao gio am', () => {
    const store = useGameStore.getState();
    store.setTurnTimeRemaining(1);
    store.decrementTurnTimer();
    expect(useGameStore.getState().turnTimeRemaining).toBe(0);
    store.decrementTurnTimer();
    expect(useGameStore.getState().turnTimeRemaining).toBe(0);
  });

  it('updatePlayerInfo cap nhat tung phan dung nguoi choi', () => {
    const store = useGameStore.getState();
    store.setPlayersInfo({
      p1: { id: 'p1', name: 'P1', balance: 10000, tokenColor: '#fff', ownedProperties: [] },
    });
    store.updatePlayerInfo('p1', { balance: 12000, inAudit: true });
    const p1 = useGameStore.getState().playersInfo['p1'];
    expect(p1?.balance).toBe(12000);
    expect(p1?.inAudit).toBe(true);
  });

  it('[Adversarial] setCurrentTurnPlayerId tu choi id khong co trong playersInfo', () => {
    const store = useGameStore.getState();
    store.setPlayersInfo({
      p1: { id: 'p1', name: 'P1', balance: 10000, tokenColor: '#fff', ownedProperties: [] },
    });
    store.setCurrentTurnPlayerId('non_existent_player');
    expect(useGameStore.getState().currentTurnPlayerId).toBeNull();

    store.setCurrentTurnPlayerId('p1');
    expect(useGameStore.getState().currentTurnPlayerId).toBe('p1');
  });
});

describe('[TC-UI03.5/MSS] Action Button States & Contract Gates', () => {
  it('Nut Do Xuc Xac bi disable khi isRolling = true hoac khong phai luot minh', () => {
    expect(isRollActionDisabled({ isRolling: true, isPawnMoving: false, isMyTurn: true })).toBe(true);
    expect(isRollActionDisabled({ isRolling: false, isPawnMoving: false, isMyTurn: false })).toBe(true);
  });

  it('[Adversarial Inversion] Khong the gieo xuc xac khi quan co dang trong hoat anh di chuyen', () => {
    expect(isRollActionDisabled({ isRolling: false, isPawnMoving: true, isMyTurn: true })).toBe(true);
  });

  it('[Adversarial Inversion] Nguoi choi pha san bi vo hieu hoa toan bo thao tac', () => {
    expect(isRollActionDisabled({ isRolling: false, isPawnMoving: false, isMyTurn: true, isBankrupt: true })).toBe(true);
    expect(isEndTurnDisabled({ isRolling: false, isPawnMoving: false, isMyTurn: true, isBankrupt: true })).toBe(true);
  });

  it('Cho phep thao tac binh thuong khi den luot va khong co animation', () => {
    expect(isRollActionDisabled({ isRolling: false, isPawnMoving: false, isMyTurn: true, isBankrupt: false })).toBe(false);
    expect(isEndTurnDisabled({ isRolling: false, isPawnMoving: false, isMyTurn: true, isBankrupt: false })).toBe(false);
  });

  it('[Doubles Rule] Nut Het Luot bi disable khi co the do tiep (canRollAgain = true)', () => {
    expect(
      isEndTurnDisabled({
        isRolling: false,
        isPawnMoving: false,
        isMyTurn: true,
        hasRolledThisTurn: true,
        canRollAgain: true,
      })
    ).toBe(true);
  });

  it('[Anti-Spam] Nut Do Xuc Xac bi disable ngay lap tuc khi isRollPending = true', () => {
    expect(
      isRollActionDisabled({
        isRolling: false,
        isPawnMoving: false,
        isMyTurn: true,
        isRollPending: true,
      })
    ).toBe(true);
  });
});

describe('[TC-UI03.6/MSS] Visual Helpers & Owned Color Groups', () => {
  it('getOwnedColorGroups tra ve danh sach nhom mau doc nhat cua cac o so huu', () => {
    const groups = getOwnedColorGroups([1, 3, 6]);
    expect(groups).toHaveLength(2);
    expect(groups).toContain(ColorGroup.Nau);
    expect(groups).toContain(ColorGroup.XanhDaTroi);
  });

  it('getOwnedColorGroups bo qua o dac biet, out of bounds, hoac undefined', () => {
    expect(getOwnedColorGroups([0, 999])).toHaveLength(0);
    expect(getOwnedColorGroups(undefined as unknown as number[])).toHaveLength(0);
  });
});

describe('[TC-UI03.7/MSS] ActionDock DOM Markup & Tactile 3D Buttons', () => {
  beforeEach(() => {
    useGameStore.setState({
      playersInfo: {
        p1: { id: 'p1', name: 'P1', balance: 10000, tokenColor: '#fff', ownedProperties: [1] },
      },
      currentTurnPlayerId: 'p1',
      isRolling: false,
      activePawnAnimation: null,
    });
  });

  it('Hien thi hao quang vang kim animate-pulse khi den luot nguoi choi', () => {
    const html = renderToStaticMarkup(React.createElement(ActionDock));
    expect(html).toContain('aria-label="Thanh điều khiển tác vụ"');
    expect(html).toContain('aria-label="Đổ xúc xắc"');
    expect(html).toContain('ring-amber-400/60');
    expect(html).toContain('animate-pulse');
    expect(html).toContain('border-emerald-800');
  });

  it('Hien thi cac nut 3D tactile cho Tai San, Xay Dung, Dam Phan va Het Luot', () => {
    const html = renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p1' }));
    expect(html).toContain('Tài Sản');
    expect(html).toContain('Xây Dựng');
    expect(html).toContain('Đàm Phán');
    expect(html).toContain('Hết Lượt');
    expect(html).toContain('border-b-2');
    expect(html).toContain('active:translate-y-0.5');
  });

  it('Vo hieu hoa hao quang vang kim khi khong phai luot cua minh', () => {
    useGameStore.setState({ currentTurnPlayerId: 'p2' });
    const html = renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p1' }));
    expect(html).not.toContain('animate-pulse');
    expect(html).toContain('cursor-not-allowed');
  });

  it('[Doubles UX] Hien thi Do Tiep (Doi) va vo hieu hoa nut Het Luot khi do doi', () => {
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      dice: [3, 3],
      hasRolledThisTurn: true,
      playersInfo: {
        p1: { id: 'p1', name: 'P1', balance: 10000, tokenColor: '#fff', ownedProperties: [] },
      },
    });
    const html = renderToStaticMarkup(
      React.createElement(ActionDock, {
        localPlayerId: 'p1',
        isMyTurn: true,
        canRollAgain: true,
        hasRolledThisTurn: true,
      })
    );
    expect(html).toContain('Đổ Tiếp (Đôi)');
    expect(html).toContain('title="Bạn vừa đổ đôi, hãy tung xúc xắc tiếp để hoàn thành lượt"');
  });
});

