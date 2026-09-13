// [UC-GAME-016/MSS][UI-S02/MSS] Pawn Animation Lifecycle & Bot AI Movement Verification
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useGameStore } from '../../src/client/store/game_store';
import { applyDeltaToStore } from '../../src/client/network/apply_delta';
import { ActionDock } from '../../src/client/ui/action_dock';
import { calculatePathWaypoints, BOT_HOP_DURATION, BOT_LANDING_DURATION, BOT_STEP_DURATION } from '../../src/client/3d/pawn_path';
import { resolveCameraMode } from '../../src/client/3d/camera_state_machine';
import { SingleHopPawn, ActiveSpringPawn, PawnAnimator } from '../../src/client/3d/pawn_animator';
import type { DeltaPayload } from '../../src/server/session_manager';
import { createPlayer } from '../../src/domain/room';

// Mock R3F hook và drei component để kiểm thử SSR/Node an toàn
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));
vi.mock('@react-three/drei', () => ({
  Billboard: ({ children }: { children?: React.ReactNode }) => children,
}));

describe('[TC-PAWN-LIFECYCLE/MSS] Pawn Animation Lifecycle & Clear Mechanism', () => {
  beforeEach(() => {
    useGameStore.setState({
      playerPositions: { p1: 0, bot_2: 0, bot_3: 0 },
      playersInfo: {
        p1: { id: 'p1', name: 'Human P1', balance: 15000, tokenColor: '#38BDF8', ownedProperties: [] },
        bot_2: { id: 'bot_2', name: 'Bot AI 2', balance: 15000, tokenColor: '#F59E0B', ownedProperties: [], isBot: true },
        bot_3: { id: 'bot_3', name: 'Bot AI 3', balance: 15000, tokenColor: '#10B981', ownedProperties: [], isBot: true },
      },
      currentTurnPlayerId: 'p1',
      isRolling: false,
      hasRolledThisTurn: false,
      activePawnAnimation: null,
    });
  });

  it('TC-PAWN-01: clearActivePawnAnimation xoa sach hoat anh chu dong', () => {
    useGameStore.getState().startPawnMove('bot_2', 5, 0);
    expect(useGameStore.getState().activePawnAnimation).not.toBeNull();
    expect(useGameStore.getState().activePawnAnimation?.isAnimating).toBe(true);

    useGameStore.getState().clearActivePawnAnimation();
    expect(useGameStore.getState().activePawnAnimation).toBeNull();
  });

  it('TC-PAWN-02: ActionDock mo khoa tu "Dang Di..." sang "Do Xuc Xac" dong bo trang thai tu store', () => {
    // 1. Khi bot dang di chuyen, ActionDock nhan isPawnMoving tu store va hien thi "Dang Di...", bi disable
    useGameStore.getState().startPawnMove('bot_2', 4, 0);
    const isMoving = Boolean(useGameStore.getState().activePawnAnimation?.isAnimating);
    const movingHtml = renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p1', isPawnMoving: isMoving }));
    expect(movingHtml).toContain('Đang Đi...');
    expect(movingHtml).toContain('disabled');

    // 2. Khi hoat anh ket thuc va completePawnMove duoc goi
    useGameStore.getState().completePawnMove('bot_2');
    expect(useGameStore.getState().activePawnAnimation).toBeNull();

    const isAfterMoving = Boolean(useGameStore.getState().activePawnAnimation?.isAnimating);
    const readyHtml = renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p1', isPawnMoving: isAfterMoving }));
    expect(readyHtml).toContain('Đổ Xúc Xắc');
    expect(readyHtml).not.toContain('Đang Đi...');
  });

  it('TC-PAWN-03: completePawnMove cap nhat vi tri cuoi va giai phong activePawnAnimation', () => {
    useGameStore.getState().startPawnMove('bot_2', 7, 0);
    expect(useGameStore.getState().activePawnAnimation?.waypoints).toEqual([1, 2, 3, 4, 5, 6, 7]);

    useGameStore.getState().completePawnMove('bot_2');
    expect(useGameStore.getState().activePawnAnimation).toBeNull();
    expect(useGameStore.getState().playerPositions['bot_2']).toBe(7);
  });

  it('TC-PAWN-04: startPawnMove tu choi khi from === to (khong tao hoat anh dậm chân)', () => {
    useGameStore.getState().startPawnMove('bot_2', 0, 0);
    expect(useGameStore.getState().activePawnAnimation).toBeNull();

    useGameStore.getState().startPawnMove('p1', 5, 5);
    expect(useGameStore.getState().activePawnAnimation).toBeNull();
  });

  it('TC-PAWN-05: Buoc nhay qua o GO (39 -> 0) chi co duy nhat 1 buoc [0] va hoan tat ngay', () => {
    const waypoints = calculatePathWaypoints(39, 0);
    expect(waypoints).toEqual([0]);

    useGameStore.getState().startPawnMove('bot_2', 0, 39);
    const anim = useGameStore.getState().activePawnAnimation;
    expect(anim).not.toBeNull();
    expect(anim?.waypoints).toEqual([0]);

    useGameStore.getState().completePawnMove('bot_2');
    expect(useGameStore.getState().activePawnAnimation).toBeNull();
    expect(useGameStore.getState().playerPositions['bot_2']).toBe(0);
  });

  it('TC-PAWN-06: startPawnMove khong drop hoat anh ma tu dong nap vao hang doi khi co quan co khac dang di chuyen', () => {
    // Bot 2 dang di chuyen tu 0 -> 5
    useGameStore.getState().startPawnMove('bot_2', 5, 0);
    expect(useGameStore.getState().activePawnAnimation?.playerId).toBe('bot_2');

    // Bot 3 goi startPawnMove khi Bot 2 dang di chuyen -> khong bi drop ma duoc nap vao hang doi
    useGameStore.getState().startPawnMove('bot_3', 4, 0);
    expect(useGameStore.getState().activePawnAnimation?.playerId).toBe('bot_2');
    expect(useGameStore.getState().pawnAnimationQueue.length).toBe(1);
    expect(useGameStore.getState().pawnAnimationQueue[0]?.playerId).toBe('bot_3');

    // Bot 2 hoan tat di chuyen -> Bot 3 tu dong duoc lay tu hang doi va bat dau hoat anh
    useGameStore.getState().completePawnMove('bot_2');
    expect(useGameStore.getState().playerPositions['bot_2']).toBe(5);
    expect(useGameStore.getState().activePawnAnimation?.playerId).toBe('bot_3');
    expect(useGameStore.getState().activePawnAnimation?.waypoints).toEqual([1, 2, 3, 4]);

    // Bot 3 hoan tat di chuyen
    useGameStore.getState().completePawnMove('bot_3');
    expect(useGameStore.getState().playerPositions['bot_3']).toBe(4);
    expect(useGameStore.getState().activePawnAnimation).toBeNull();
  });

  it('TC-PAWN-07: Delta Full Sync (dong bo toan phan) xoa sach hoat anh do dang', () => {
    useGameStore.getState().startPawnMove('bot_2', 6, 0);
    expect(useGameStore.getState().activePawnAnimation).not.toBeNull();

    // Gui delta Full Sync co day du 40 o
    const fullSyncCells = Array.from({ length: 40 }, (_, idx) => ({ index: idx }));
    const fullSyncDelta: DeltaPayload = {
      tick: 20,
      cells: fullSyncCells,
      players: [{ id: 'bot_2', position: 6, balance: 15000 }],
    };

    applyDeltaToStore(fullSyncDelta, useGameStore);
    expect(useGameStore.getState().activePawnAnimation).toBeNull();
  });

  it('TC-PAWN-08: SingleHopPawn xu ly fromCell === toCell khong gay loop vo han', () => {
    let callCount = 0;
    const markup = renderToStaticMarkup(
      React.createElement(SingleHopPawn, {
        fromCell: 0,
        toCell: 0,
        offset: [0, 0, 0],
        color: '#38BDF8',
        onHopComplete: () => { callCount++; },
      })
    );
    expect(markup).toBeDefined();
    // Khong gay crash va render hop le
    expect(markup).toContain('cylinderGeometry');
  });

  it('TC-PAWN-09: ActiveSpringPawn xu ly an toan khi waypoints rong', () => {
    const mockPlayer = createPlayer('bot_2');

    let completedPlayer = '';
    const markup = renderToStaticMarkup(
      React.createElement(ActiveSpringPawn, {
        player: mockPlayer,
        color: '#F59E0B',
        offset: [0, 0, 0],
        animation: {
          playerId: 'bot_2',
          fromCell: 0,
          waypoints: [],
          currentIndex: 0,
          isAnimating: true,
        },
        onComplete: (pid) => { completedPlayer = pid; },
      })
    );

    // Render tra ve null do waypoints rong
    expect(markup).toBe('');
  });

  it('TC-PAWN-10: PawnAnimator tu dong don dep hoat anh co waypoints rong', () => {
    const mockPlayers = [createPlayer('bot_2')];

    useGameStore.setState({
      activePawnAnimation: {
        playerId: 'bot_2',
        fromCell: 0,
        waypoints: [],
        currentIndex: 0,
        isAnimating: true,
      },
    });

    const markup = renderToStaticMarkup(
      React.createElement(PawnAnimator, { players: mockPlayers })
    );

    expect(markup).toBeDefined();
    expect(markup).toContain('cylinderGeometry');
  });

  it('TC-PAWN-11: ActiveSpringPawn render buoc dau tien tu fromCell sang waypoints[0]', () => {
    const mockPlayer = createPlayer('bot_2');

    useGameStore.setState({
      activePawnAnimation: {
        playerId: 'bot_2',
        fromCell: 0,
        waypoints: [1, 2, 3],
        currentIndex: 0,
        isAnimating: true,
      },
    });

    const markup = renderToStaticMarkup(
      React.createElement(ActiveSpringPawn, {
        player: mockPlayer,
        color: '#F59E0B',
        offset: [0, 0, 0],
        animation: useGameStore.getState().activePawnAnimation!,
        onComplete: (pid) => { useGameStore.getState().completePawnMove(pid); },
      })
    );

    expect(markup).toBeDefined();
    expect(markup).toContain('cylinderGeometry');
  });
});

describe('[TC-BOT-MOVE-DELTA/MSS] Bot Turn Sync via applyDeltaToStore', () => {
  beforeEach(() => {
    useGameStore.setState({
      playerPositions: { p1: 9, bot_2: 0 },
      playersInfo: {
        p1: { id: 'p1', name: 'Human P1', balance: 13800, tokenColor: '#38BDF8', ownedProperties: [9] },
        bot_2: { id: 'bot_2', name: 'Bot AI 2', balance: 15000, tokenColor: '#F59E0B', ownedProperties: [], isBot: true },
      },
      currentTurnPlayerId: 'p1',
      isRolling: false,
      hasRolledThisTurn: false,
      activePawnAnimation: null,
    });
  });

  it('TC-BOT-01: Nhan delta Bot di chuyen tu 0 den 5 kich hoat startPawnMove voi 5 waypoints', () => {
    const botMoveDelta: DeltaPayload = {
      tick: 3,
      cells: [],
      dice: [2, 3],
      currentPlayerIndex: 0,
      currentTurnPlayerId: 'p1',
      players: [
        { id: 'bot_2', position: 5, balance: 15000, isBot: true },
      ],
    };

    applyDeltaToStore(botMoveDelta, useGameStore);

    const anim = useGameStore.getState().activePawnAnimation;
    expect(anim).not.toBeNull();
    expect(anim?.playerId).toBe('bot_2');
    expect(anim?.fromCell).toBe(0);
    expect(anim?.waypoints).toEqual([1, 2, 3, 4, 5]);
    expect(anim?.isAnimating).toBe(true);

    // Xac nhan trang thai dang di chuyen tren store
    expect(useGameStore.getState().playerPositions['bot_2']).toBe(5);
  });

  it('TC-BOT-02: Delta co vi tri trung voi vi tri cu khong kich hoat lai hoat anh', () => {
    useGameStore.setState({
      playerPositions: { p1: 9, bot_2: 5 },
      activePawnAnimation: null,
    });

    const noMoveDelta: DeltaPayload = {
      tick: 4,
      cells: [],
      players: [
        { id: 'bot_2', position: 5, balance: 13800, isBot: true },
      ],
    };

    applyDeltaToStore(noMoveDelta, useGameStore);
    expect(useGameStore.getState().activePawnAnimation).toBeNull();
  });

  it('TC-BOT-03: Tien trinh buoc nhay cap nhat currentIndex khong bi reset ve 0', () => {
    useGameStore.getState().startPawnMove('bot_2', 4, 0);
    let anim = useGameStore.getState().activePawnAnimation!;
    expect(anim.currentIndex).toBe(0);
    expect(anim.waypoints).toEqual([1, 2, 3, 4]);

    // Mo phong tien trinh tung buoc nhay
    for (let step = 1; step < anim.waypoints.length; step++) {
      useGameStore.setState({
        activePawnAnimation: { ...anim, currentIndex: step },
      });
      const updated = useGameStore.getState().activePawnAnimation!;
      expect(updated.currentIndex).toBe(step);
    }

    // Buoc cuoi hoan tat
    useGameStore.getState().completePawnMove('bot_2');
    expect(useGameStore.getState().activePawnAnimation).toBeNull();
    expect(useGameStore.getState().playerPositions['bot_2']).toBe(4);
  });
});

describe('[TC-PRESENTATION-QUEUE/MSS] Client Presentation Queue & Bot Turbo Pacing Verification', () => {
  beforeEach(() => {
    useGameStore.setState({
      playerPositions: { p1: 0, bot_2: 0, bot_3: 0 },
      visualPositions: { p1: 0, bot_2: 0, bot_3: 0 },
      pawnAnimationQueue: [],
      playersInfo: {
        p1: { id: 'p1', name: 'Human P1', balance: 15000, tokenColor: '#38BDF8', ownedProperties: [] },
        bot_2: { id: 'bot_2', name: 'Bot AI 2', balance: 15000, tokenColor: '#F59E0B', ownedProperties: [], isBot: true },
        bot_3: { id: 'bot_3', name: 'Bot AI 3', balance: 15000, tokenColor: '#10B981', ownedProperties: [], isBot: true },
      },
      currentTurnPlayerId: 'p1',
      isRolling: false,
      hasRolledThisTurn: false,
      activePawnAnimation: null,
    });
  });

  it('TC-QUEUE-01: enqueuePawnMove hoat dong tuan tu giua cac quan co Bot va tranh teleport', () => {
    // 1. Enqueue buoc di dau tien cua Bot 2 (0 -> 5)
    useGameStore.getState().enqueuePawnMove({
      playerId: 'bot_2',
      fromCell: 0,
      targetCell: 5,
      waypoints: [1, 2, 3, 4, 5],
      isBot: true,
    });

    expect(useGameStore.getState().activePawnAnimation?.playerId).toBe('bot_2');
    expect(useGameStore.getState().pawnAnimationQueue.length).toBe(0);
    expect(useGameStore.getState().visualPositions['bot_2']).toBe(0);

    // 2. Enqueue buoc di tiep theo cua Bot 3 (0 -> 4) khi Bot 2 dang nhay
    useGameStore.getState().enqueuePawnMove({
      playerId: 'bot_3',
      fromCell: 0,
      targetCell: 4,
      waypoints: [1, 2, 3, 4],
      isBot: true,
    });

    // Bot 3 nam trong hang doi, khong cuop hoat anh cua Bot 2
    expect(useGameStore.getState().activePawnAnimation?.playerId).toBe('bot_2');
    expect(useGameStore.getState().pawnAnimationQueue.length).toBe(1);
    expect(useGameStore.getState().visualPositions['bot_3']).toBe(0);

    // 3. Bot 2 cham dat: completePawnMove cap nhat visualPositions[bot_2] = 5 va tu dong chay Bot 3
    useGameStore.getState().completePawnMove('bot_2');
    expect(useGameStore.getState().visualPositions['bot_2']).toBe(5);
    expect(useGameStore.getState().activePawnAnimation?.playerId).toBe('bot_3');
    expect(useGameStore.getState().pawnAnimationQueue.length).toBe(0);

    // 4. Bot 3 cham dat: completePawnMove cap nhat visualPositions[bot_3] = 4 va giai phong hoat anh
    useGameStore.getState().completePawnMove('bot_3');
    expect(useGameStore.getState().visualPositions['bot_3']).toBe(4);
    expect(useGameStore.getState().activePawnAnimation).toBeNull();
  });

  it('TC-QUEUE-02: ActionDock disabled khi pawnAnimationQueue con task cho du activePawnAnimation tam thoi null', () => {
    // Nạp task vào hàng đợi nhưng không kích hoạt ngay
    useGameStore.setState({
      pawnAnimationQueue: [{
        playerId: 'bot_2',
        fromCell: 0,
        targetCell: 3,
        waypoints: [1, 2, 3],
        isBot: true,
      }],
      activePawnAnimation: null,
    });

    const markup = renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p1' }));
    expect(markup).toContain('disabled');
    expect(markup).toContain('Đang Đi...');
  });

  it('TC-QUEUE-03: completePawnMove chuyen tiep hoat anh ke tiep ma khong lam mat state trong queue', () => {
    useGameStore.getState().enqueuePawnMove({
      playerId: 'bot_2',
      fromCell: 0,
      targetCell: 3,
      waypoints: [1, 2, 3],
      isBot: true,
    });
    useGameStore.getState().enqueuePawnMove({
      playerId: 'bot_3',
      fromCell: 0,
      targetCell: 2,
      waypoints: [1, 2],
      isBot: true,
    });

    expect(useGameStore.getState().activePawnAnimation?.playerId).toBe('bot_2');
    expect(useGameStore.getState().pawnAnimationQueue.length).toBe(1);

    // Bot 2 hoan tat -> Bot 3 tu dong duoc kich hoat
    useGameStore.getState().completePawnMove('bot_2');
    expect(useGameStore.getState().visualPositions['bot_2']).toBe(3);
    expect(useGameStore.getState().activePawnAnimation?.playerId).toBe('bot_3');
    expect(useGameStore.getState().activePawnAnimation?.waypoints).toEqual([1, 2]);
    expect(useGameStore.getState().pawnAnimationQueue.length).toBe(0);

    // Bot 3 hoan tat -> khong con task nao trong queue
    useGameStore.getState().completePawnMove('bot_3');
    expect(useGameStore.getState().visualPositions['bot_3']).toBe(2);
    expect(useGameStore.getState().activePawnAnimation).toBeNull();
  });

  it('TC-QUEUE-04: Nhan lien tiep 2 delta di chuyen cho cung mot bot noi chuoi tu diem den truoc do', () => {
    // Delta 1: Bot 2 di tu 0 -> 5
    const delta1: DeltaPayload = {
      tick: 1,
      cells: [],
      players: [{ id: 'bot_2', position: 5, balance: 15000, isBot: true }],
    };
    applyDeltaToStore(delta1, useGameStore);
    expect(useGameStore.getState().activePawnAnimation?.playerId).toBe('bot_2');
    expect(useGameStore.getState().activePawnAnimation?.fromCell).toBe(0);
    expect(useGameStore.getState().activePawnAnimation?.waypoints).toEqual([1, 2, 3, 4, 5]);

    // Delta 2 den ngay sau do (khi hoat anh delta 1 dang chay): Bot 2 di tiep den 8
    const delta2: DeltaPayload = {
      tick: 2,
      cells: [],
      players: [{ id: 'bot_2', position: 8, balance: 15000, isBot: true }],
    };
    applyDeltaToStore(delta2, useGameStore);

    // Task 2 duoc dua vao queue voi fromCell = 5 (chu khong phai 0)
    expect(useGameStore.getState().pawnAnimationQueue.length).toBe(1);
    const queuedTask = useGameStore.getState().pawnAnimationQueue[0];
    expect(queuedTask?.playerId).toBe('bot_2');
    expect(queuedTask?.fromCell).toBe(5);
    expect(queuedTask?.targetCell).toBe(8);
    expect(queuedTask?.waypoints).toEqual([6, 7, 8]);
  });

  it('TC-TURBO-01: Toc do buoc nhay Turbo cho Bot dat 0.20s/step', () => {
    expect(BOT_STEP_DURATION).toBe(0.20);
    expect(Number((BOT_HOP_DURATION + BOT_LANDING_DURATION).toFixed(2))).toBe(0.20);
  });

  it('TC-CAM-01: resolveCameraMode tra ve overview khi isBotTurn = true ke ca khi isRolling = true', () => {
    const botRollMode = resolveCameraMode({
      isRolling: true,
      isPawnAnimating: false,
      activeModal: null,
      isBotTurn: true,
    });
    expect(botRollMode).toBe('overview');

    const humanRollMode = resolveCameraMode({
      isRolling: true,
      isPawnAnimating: false,
      activeModal: null,
      isBotTurn: false,
    });
    expect(humanRollMode).toBe('dice_roll');
  });
});

