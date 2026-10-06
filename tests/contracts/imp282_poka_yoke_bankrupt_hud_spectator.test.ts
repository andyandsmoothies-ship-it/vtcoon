// @vitest-environment happy-dom
// [CONTRACT TEST] IMP-282: Poka-Yoke Bankrupt Action Dock & Spectator Mode UI Hardening
// Traceability Tags: [TC-282.01/MSS..TC-282.08/MSS] & [UC-IMP282]
// Scope: Hardening ActionDock UI affordances for bankrupt players (Poka-Yoke disabled buttons, spectator labels, no phantom notices/buttons)
// Constraints: Zero dirty casts, 1-4 asserts per test, zero loops in it(), living test <= 600 LOC

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { ActionDock } from '../../src/client/ui/action_dock';
import {
  resolveEndTurnButtonLabel,
  resolveActionDockNotice,
} from '../../src/client/ui/ui_helpers';
import { useGameStore } from '../../src/client/store/game_store';
import type { PlayerHudInfo } from '../../src/client/store/game_store_types';
import { TurnPhase } from '../../src/domain/room';

declare global {
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Type-safe forward compatibility wrappers for Station 1 RED testing without dirty casts
type EndTurnLabelResolver = (
  turnPhase?: string,
  hasRolledThisTurn?: boolean,
  inAudit?: boolean,
  isBankrupt?: boolean
) => string;

const resolveEndTurn: EndTurnLabelResolver = resolveEndTurnButtonLabel;

interface ExtendedActionDockNoticeParams {
  readonly isMyTurn?: boolean;
  readonly isInsolvent?: boolean;
  readonly inAudit?: boolean;
  readonly auditTurnsLeft?: number;
  readonly balance?: number;
  readonly turnPhase?: string;
  readonly hasRolledThisTurn?: boolean;
  readonly isSkippedTurn?: boolean;
  readonly isBankrupt?: boolean;
}

type ActionDockNoticeResolver = (
  params: ExtendedActionDockNoticeParams
) => ReturnType<typeof resolveActionDockNotice>;

const resolveNotice: ActionDockNoticeResolver = resolveActionDockNotice;

interface MountResult {
  readonly container: HTMLDivElement;
  readonly unmount: () => void;
}

const activeMounts: MountResult[] = [];

function mountComponent(element: React.ReactElement): MountResult {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root: Root = createRoot(container);
  act(() => {
    root.render(element);
  });
  const res: MountResult = {
    container,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
  activeMounts.push(res);
  return res;
}

function createBankruptPlayer(id: string): PlayerHudInfo {
  return {
    id,
    name: `Player_${id}`,
    balance: 0,
    tokenColor: '#ef4444',
    ownedProperties: [],
    bankrupt: true,
    isBankrupt: true,
  };
}

describe('[CONTRACT-TEST][TC-282/MSS][UC-IMP282] Poka-Yoke Bankrupt HUD Spectator Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      activeModal: null,
      modalPayload: null,
      currentTurnPlayerId: 'p1',
      hasRolledThisTurn: false,
      isRolling: false,
      activePawnAnimation: null,
      pawnAnimationQueue: [],
      dice: [1, 2],
      turnPhase: TurnPhase.WaitingRoll,
      playerPositions: { p1: 0 },
      playersInfo: {},
    });
  });

  afterEach(() => {
    while (activeMounts.length > 0) {
      const mount = activeMounts.pop();
      mount?.unmount();
    }
  });

  it('[TC-282.01/MSS][UC-IMP282] resolveEndTurnButtonLabel với isBankrupt: true trả về chính xác "👁️ Khán Giả (Đang Xem)"', () => {
    const label = resolveEndTurn(TurnPhase.WaitingRoll, false, false, true);
    expect(label).toBe('👁️ Khán Giả (Đang Xem)');
  });

  it('[TC-282.02/MSS][UC-IMP282] resolveEndTurnButtonLabel ở PropertyManagement chưa gieo với isBankrupt: true không chứa "Mất Lượt"', () => {
    const label = resolveEndTurn(TurnPhase.PropertyManagement, false, false, true);
    expect(label).not.toContain('Mất Lượt');
    expect(label).toBe('👁️ Khán Giả (Đang Xem)');
  });

  it('[TC-282.03/MSS][UC-IMP282] resolveActionDockNotice cho người chơi phá sản ở PropertyManagement không trả về notice skip_turn', () => {
    const notice = resolveNotice({
      isMyTurn: true,
      turnPhase: TurnPhase.PropertyManagement,
      hasRolledThisTurn: false,
      inAudit: false,
      isBankrupt: true,
    });
    expect(notice?.type).not.toBe('skip_turn');
  });

  it('[TC-282.04/MSS][UC-IMP282] ActionDock render với isBankrupt: true, nút Quản Lý BĐS có disabled và class bg-slate-200', () => {
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      playersInfo: {
        p1: createBankruptPlayer('p1'),
      },
    });

    const { container } = mountComponent(
      React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true })
    );

    const btn = container.querySelector<HTMLButtonElement>('button[aria-label="Quản lý và nâng cấp bất động sản"]');
    expect(btn).not.toBeNull();
    expect(btn?.disabled).toBe(true);
    expect(btn?.className).toContain('bg-slate-200');
  });

  it('[TC-282.05/MSS][UC-IMP282] ActionDock render với isBankrupt: true, nút Quản Lý BĐS không chứa class bg-blue-600', () => {
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      playersInfo: {
        p1: createBankruptPlayer('p1'),
      },
    });

    const { container } = mountComponent(
      React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true })
    );

    const btn = container.querySelector<HTMLButtonElement>('button[aria-label="Quản lý và nâng cấp bất động sản"]');
    expect(btn).not.toBeNull();
    expect(btn?.className).not.toContain('bg-blue-600');
  });

  it('[TC-282.06/MSS][UC-IMP282] Khi isBankrupt: true, nút Quản Lý BĐS có title "Người chơi đã phá sản" và không kích hoạt callback onOpenManageProperty', () => {
    const onOpenManageProperty = vi.fn();
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      playersInfo: {
        p1: createBankruptPlayer('p1'),
      },
    });

    const { container } = mountComponent(
      React.createElement(ActionDock, {
        localPlayerId: 'p1',
        isMyTurn: true,
        onOpenManageProperty,
      })
    );

    const btn = container.querySelector<HTMLButtonElement>('button[aria-label="Quản lý và nâng cấp bất động sản"]');
    expect(btn).not.toBeNull();
    expect(btn?.title).toBe('Người chơi đã phá sản');
    btn?.click();
    expect(onOpenManageProperty).not.toHaveBeenCalled();
  });

  it('[TC-282.07/MSS][UC-IMP282] Render ActionDock với isBankrupt: true khi đứng trên ô đất chưa sở hữu thì nút Mua Đất không xuất hiện', () => {
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      turnPhase: TurnPhase.ActionPhase,
      playerPositions: { p1: 1 },
      playersInfo: {
        p1: createBankruptPlayer('p1'),
      },
    });

    const { container } = mountComponent(
      React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true })
    );

    const buyBtn = container.querySelector<HTMLButtonElement>('button[aria-label="Mua ô đất số 1"]');
    const rollBtn = container.querySelector<HTMLButtonElement>('[data-testid="roll-dice-btn"]');
    expect(buyBtn).toBeNull();
    expect(rollBtn).not.toBeNull();
  });

  it('[TC-282.08/MSS][UC-IMP282] Render ActionDock với isBankrupt: true, nút kết thúc lượt hiển thị nhãn "👁️ Khán Giả (Đang Xem)"', () => {
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      turnPhase: TurnPhase.WaitingRoll,
      playersInfo: {
        p1: createBankruptPlayer('p1'),
      },
    });

    const { container } = mountComponent(
      React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true })
    );

    const endTurnBtn = container.querySelector<HTMLButtonElement>('button[aria-label="Kết thúc lượt"]');
    expect(endTurnBtn).not.toBeNull();
    expect(endTurnBtn?.textContent).toContain('👁️ Khán Giả (Đang Xem)');
  });
});
