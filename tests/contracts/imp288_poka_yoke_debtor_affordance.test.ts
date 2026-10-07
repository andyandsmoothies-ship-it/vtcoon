// @vitest-environment happy-dom
// [CONTRACT TEST] IMP-288: Poka-Yoke Debtor Insolvency Banner & Out-of-Turn Action Dock Affordance
// Traceability Tags: [TC-288.01/MSS..TC-288.08/MSS] & [UC-IMP288]
// SSOT: .agents/plans/PLAN_IMP_288_POKA_YOKE_DEBTOR_AFFORDANCE.md
// Constraints: Zero dirty casts, 1-4 asserts per test, zero loops in it(), living test <= 600 LOC

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { ActionDock } from '../../src/client/ui/action_dock.js';
import { applyDeltaToStore } from '../../src/client/network/apply_delta.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import { TurnPhase } from '../../src/domain/room.js';
import type { PlayerHudInfo } from '../../src/client/store/game_store_types.js';
import { shouldAutoOpenInsolvencyModal } from '../../src/client/network/use_app_session.js';

declare global {
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

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

function createPlayerHud(id: string, overrides?: Partial<PlayerHudInfo>): PlayerHudInfo {
  return {
    id,
    name: `Player_${id}`,
    balance: 15000,
    tokenColor: '#3b82f6',
    ownedProperties: [],
    bankrupt: false,
    isBankrupt: false,
    isBot: false,
    ...overrides,
  };
}

describe('[CONTRACT-TEST][TC-288/MSS][UC-IMP288] Poka-Yoke Debtor Affordance Suite', () => {
  beforeEach(() => {
    useLobbyStore.setState({
      myPlayerId: 'p1',
      roomCode: 'TEST01',
      gameStarted: true,
    });

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
      playerPositions: { p1: 0, p2: 0 },
      playersInfo: {
        p1: createPlayerHud('p1', { balance: -500 }),
        p2: createPlayerHud('p2', { balance: 2000, isBot: true }),
      },
    });
  });

  afterEach(() => {
    activeMounts.forEach((m) => m.unmount());
    activeMounts.length = 0;
  });

  it('[TC-288.01/MSS][UC-IMP288] Given người chơi cục bộ có số dư âm và activeModal === insolvency, When applyDeltaToStore nhận delta có turnPhase = WaitingRoll, Then activeModal vẫn giữ nguyên là insolvency', () => {
    useGameStore.setState({
      activeModal: 'insolvency',
      modalPayload: { playerId: 'p1', deficit: 500 },
      playersInfo: {
        p1: createPlayerHud('p1', { balance: -500 }),
      },
    });

    applyDeltaToStore({ tick: 2, cells: [], turnPhase: TurnPhase.WaitingRoll }, useGameStore);

    expect(useGameStore.getState().activeModal).toBe('insolvency');
  });

  it('[TC-288.02/MSS][UC-IMP288] Given người chơi cục bộ có số dư dương và activeModal === insolvency, When applyDeltaToStore nhận delta có turnPhase = PropertyManagement, Then activeModal được đóng', () => {
    useGameStore.setState({
      activeModal: 'insolvency',
      modalPayload: { playerId: 'p1', deficit: 0 },
      playersInfo: {
        p1: createPlayerHud('p1', { balance: 200 }),
      },
    });

    applyDeltaToStore({ tick: 2, cells: [], turnPhase: TurnPhase.PropertyManagement }, useGameStore);

    expect(useGameStore.getState().activeModal).toBeNull();
  });

  it('[TC-288.03/MSS][UC-IMP288] Given người chơi có balance = -300 và isBankrupt = false, When render ActionDock, Then nút có data-testid="resolve-debt-primary-btn" xuất hiện với nhãn Cứu Nợ Khẩn Cấp', () => {
    useGameStore.setState({
      playersInfo: {
        p1: createPlayerHud('p1', { balance: -300 }),
      },
    });

    const { container } = mountComponent(
      React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true })
    );

    const btn = container.querySelector('[data-testid="resolve-debt-primary-btn"]');
    expect(btn).not.toBeNull();
    expect(btn?.textContent).toContain('Cứu Nợ Khẩn Cấp');
  });

  it('[TC-288.04/MSS][UC-IMP288] Given người chơi có balance = -300, When click nút resolve-debt-primary-btn, Then modal insolvency hiển thị với deficit là 300', () => {
    useGameStore.setState({
      activeModal: null,
      playersInfo: {
        p1: createPlayerHud('p1', { balance: -300 }),
      },
    });

    const { container } = mountComponent(
      React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true })
    );

    const btn = container.querySelector('[data-testid="resolve-debt-primary-btn"]');
    act(() => {
      const htmlBtn = btn as HTMLButtonElement | null;
      htmlBtn?.click();
    });

    expect(useGameStore.getState().activeModal).toBe('insolvency');
    const payload = useGameStore.getState().modalPayload as { deficit?: number } | null;
    expect(payload?.deficit).toBe(300);
  });

  it('[TC-288.05/MSS][UC-IMP288] Given người chơi có balance = -300 và đứng ở ô đất chưa có chủ, When render ActionDock, Then không hiển thị nút Mua Đất', () => {
    useGameStore.setState({
      turnPhase: TurnPhase.ActionPhase,
      playerPositions: { p1: 1 },
      playersInfo: {
        p1: createPlayerHud('p1', { balance: -300 }),
      },
    });

    const { container } = mountComponent(
      React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true })
    );

    const buyBtn = container.querySelector('button[aria-label^="Mua ô đất"]');
    expect(buyBtn).toBeNull();
  });

  it('[TC-288.06/MSS][UC-IMP288] Given người chơi có balance = -300 và isMyTurn = false, When render ActionDock, Then nút resolve-debt-primary-btn vẫn hiển thị cho phép cứu nợ ngoài lượt', () => {
    useGameStore.setState({
      currentTurnPlayerId: 'p2',
      playersInfo: {
        p1: createPlayerHud('p1', { balance: -300 }),
        p2: createPlayerHud('p2', { balance: 5000, isBot: true }),
      },
    });

    const { container } = mountComponent(
      React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: false })
    );

    const btn = container.querySelector('[data-testid="resolve-debt-primary-btn"]');
    expect(btn).not.toBeNull();
  });

  it('[TC-288.07/MSS][UC-IMP288] Given người chơi âm tiền là Bot, When render ActionDock, Then không hiển thị nút resolve-debt-primary-btn', () => {
    useGameStore.setState({
      currentTurnPlayerId: 'p2',
      playersInfo: {
        p1: createPlayerHud('p1', { balance: 1000 }),
        p2: createPlayerHud('p2', { balance: -500, isBot: true }),
      },
    });

    const { container } = mountComponent(
      React.createElement(ActionDock, { localPlayerId: 'p2', isMyTurn: false })
    );

    const btn = container.querySelector('[data-testid="resolve-debt-primary-btn"]');
    expect(btn).toBeNull();
  });

  it('[TC-288.08/MSS][UC-IMP288] Given người chơi đang mở modal portfolio và bị âm tiền, When kiểm tra shouldAutoOpenInsolvencyModal, Then trả về false', () => {
    const shouldOpen = shouldAutoOpenInsolvencyModal('portfolio', -500, false);
    expect(shouldOpen).toBe(false);
  });

  it('[TC-288.09/MSS][UC-IMP288] Given người chơi đã ở trong modal insolvency và bị âm tiền, When kiểm tra shouldAutoOpenInsolvencyModal, Then trả về false', () => {
    const shouldOpen = shouldAutoOpenInsolvencyModal('insolvency', -500, false);
    expect(shouldOpen).toBe(false);
  });

  it('[TC-288.10/MSS][UC-IMP288] Given ván đấu kết thúc game_over và người chơi bị âm tiền, When kiểm tra shouldAutoOpenInsolvencyModal, Then trả về false', () => {
    const shouldOpen = shouldAutoOpenInsolvencyModal('game_over', -500, false);
    expect(shouldOpen).toBe(false);
  });

  it('[TC-288.11/MSS][UC-IMP288] Given người chơi đã phá sản và bị âm tiền, When kiểm tra shouldAutoOpenInsolvencyModal, Then trả về false', () => {
    const shouldOpen = shouldAutoOpenInsolvencyModal(null, -500, true);
    expect(shouldOpen).toBe(false);
  });

  it('[TC-288.12/MSS][UC-IMP288] Given người chơi không mở modal nào và bị âm tiền không phá sản, When kiểm tra shouldAutoOpenInsolvencyModal, Then trả về true', () => {
    const shouldOpen = shouldAutoOpenInsolvencyModal(null, -500, false);
    expect(shouldOpen).toBe(true);
  });
});
