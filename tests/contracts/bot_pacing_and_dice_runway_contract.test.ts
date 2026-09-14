// [TC-IMP51/MSS][UC-IMP51] Contract Test Suite: Bot AI Step-by-Step Pacing & Dice Runway Relocation
// Universal 4-Facet Behavioral Matrix Verification:
// Facet 1: Boundary & Coords (DiceTray Z=0.0, Bridge clearance >= 3.0m, Camera target [0, 0.25, 0], Dice size >= 0.55m, Pip radius >= 0.048m)
// Facet 2: State Reactivity & Transient Lifecycle (Tray & felt hidden when isRolling=false, visible when rolling, 1.5s fade delay)
// Facet 3: Vibrancy & High Contrast (Ruby red dice #DC2626/#B91C1C, non-transparent static opacity, emissive pips #FFFFFF)
// Facet 4: Bot Step-by-Step Pacing - Server (Single step executes only INTENT_ROLL, holds bot turn, >= 2 distinct steps with botTurnDelayMs)

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DiceTray } from '../../src/client/3d/dice_tray.js';
import { CAMERA_CONFIG } from '../../src/client/3d/camera_state_machine.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { RoomManager } from '../../src/server/room_manager.js';
import { TurnOrchestrator } from '../../src/server/network/turn_orchestrator.js';
import { TurnPhase } from '../../src/domain/room.js';
import { BotPersonality } from '../../src/domain/bot/bot_types.js';

describe('[CONTRACT-TEST][TC-IMP51/MSS][UC-IMP51] Bot Pacing & Dice Runway Relocation Suite', () => {
  let originalConsoleError: typeof console.error;

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (
        msg.includes('is using incorrect casing') ||
        msg.includes('does not recognize the') ||
        msg.includes('non-boolean attribute')
      ) {
        return;
      }
      originalConsoleError(...args);
    };
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    useGameStore.setState({
      dice: [1, 2],
      isRolling: false,
      hasRolledThisTurn: false,
      currentTurnPlayerId: 'p1',
    });
  });

  // ===========================================================================
  // FACET 1: Boundary & Coords (Sa Bàn Runway & Camera Action Cam Target)
  // ===========================================================================

  it('[TC-IMP51.01/MSS][Facet1-Coords] Tọa độ khay xúc xắc DiceTray nằm tại Z = 0.0 (di dời khỏi Cầu Long Biên)', () => {
    useGameStore.setState({ isRolling: true });
    const markup = renderToStaticMarkup(React.createElement(DiceTray));
    const match = markup.match(/data-testid="dice-tray"[^>]*position="([^"]+)"|position="([^"]+)"[^>]*data-testid="dice-tray"/);
    const posStr = match ? (match[1] ?? match[2] ?? '') : '';
    const coords = posStr.split(',').map(Number);

    expect(coords).toHaveLength(3);
    expect(coords[2]).toBe(0.0);
  });

  it('[TC-IMP51.02/MSS][Facet1-Coords] Khoảng cách từ tâm DiceTray tới Cầu Long Biên (Z = 3.8) đạt khoảng đệm an toàn >= 3.0m', () => {
    useGameStore.setState({ isRolling: true });
    const markup = renderToStaticMarkup(React.createElement(DiceTray));
    const match = markup.match(/data-testid="dice-tray"[^>]*position="([^"]+)"|position="([^"]+)"[^>]*data-testid="dice-tray"/);
    const posStr = match ? (match[1] ?? match[2] ?? '') : '';
    const coords = posStr.split(',').map(Number);
    const LONG_BIEN_BRIDGE_Z = 3.8;
    const clearance = Math.abs(LONG_BIEN_BRIDGE_Z - (coords[2] ?? 0));

    expect(clearance).toBeGreaterThanOrEqual(3.0);
  });

  it('[TC-IMP51.03/MSS][Facet1-Coords] CAMERA_CONFIG.dice_roll.target nhắm chuẩn xác vào tâm sàn diễn [0.0, 0.25, 0.0]', () => {
    expect(CAMERA_CONFIG.dice_roll.target).toEqual([0.0, 0.25, 0.0]);
  });

  it('[TC-IMP51.04/MSS][Facet1-Coords] Kích thước hình học khối xúc xắc 3D đạt chuẩn >= 0.55m để nhìn rõ từ camera bao quát', () => {
    useGameStore.setState({ isRolling: true });
    const markup = renderToStaticMarkup(React.createElement(DiceTray));
    const cubeMatch = markup.match(/boxGeometry args="([\d.]+),\1,\1"/);
    const size = cubeMatch ? parseFloat(cubeMatch[1] ?? '0') : 0;

    expect(size).toBeGreaterThanOrEqual(0.55);
  });

  it('[TC-IMP51.05/MSS][Facet1-Coords] Bán kính chấm pips xúc xắc đạt chuẩn >= 0.048m bảo đảm độ phân giải thị giác', () => {
    useGameStore.setState({ isRolling: true });
    const markup = renderToStaticMarkup(React.createElement(DiceTray));
    const sphereMatch = markup.match(/sphereGeometry args="([\d.]+),/);
    const radius = sphereMatch ? parseFloat(sphereMatch[1] ?? '0') : 0;

    expect(radius).toBeGreaterThanOrEqual(0.048);
  });

  // ===========================================================================
  // FACET 2: State Reactivity & Transient Lifecycle (Ẩn khay nỉ khi không quay)
  // ===========================================================================

  it('[TC-IMP51.06/MSS][Facet2-Reactivity] Khi isRolling = false ban đầu, thảm nỉ xanh (#064E3B) ẩn khỏi render tree', () => {
    useGameStore.setState({ isRolling: false });
    const markup = renderToStaticMarkup(React.createElement(DiceTray));

    expect(markup).not.toContain('#064E3B');
  });

  it('[TC-IMP51.07/MSS][Facet2-Reactivity] Khi isRolling = false ban đầu, hoa văn la bàn hoàng kim (#F59E0B) ẩn khỏi render tree', () => {
    useGameStore.setState({ isRolling: false });
    const markup = renderToStaticMarkup(React.createElement(DiceTray));

    expect(markup).not.toContain('#F59E0B');
  });

  it('[TC-IMP51.08/MSS][Facet2-Reactivity] Khi isRolling = true, cụm khay nỉ và xúc xắc cùng xuất hiện trong render tree', () => {
    useGameStore.setState({ isRolling: true });
    const markup = renderToStaticMarkup(React.createElement(DiceTray));

    expect(markup).toContain('data-testid="dice-tray"');
    expect(markup).toContain('#064E3B');
  });

  it('[TC-IMP51.09/MSS][Facet2-Reactivity] useGameStore triggerDiceRoll kích hoạt trạng thái gieo xúc xắc phản ứng tức thì', () => {
    useGameStore.getState().triggerDiceRoll([4, 5]);

    expect(useGameStore.getState().isRolling).toBe(true);
    expect(useGameStore.getState().dice).toEqual([4, 5]);
  });

  it('[TC-IMP51.10/MSS][Facet2-Reactivity] setIsRolling false đưa trạng thái gieo về trạng thái dừng nghỉ tĩnh', () => {
    useGameStore.getState().triggerDiceRoll([3, 3]);
    useGameStore.getState().setIsRolling(false);

    expect(useGameStore.getState().isRolling).toBe(false);
  });

  // ===========================================================================
  // FACET 3: Vibrancy & High Contrast (Đỏ Ruby & Chấm Pips Tương Phản)
  // ===========================================================================

  it('[TC-IMP51.11/MSS][Facet3-Vibrancy] Xúc xắc sử dụng tone màu đỏ Ruby chuẩn thương mại (#DC2626 hoặc #B91C1C)', () => {
    useGameStore.setState({ isRolling: true, dice: [2, 4] });
    const markup = renderToStaticMarkup(React.createElement(DiceTray));
    const hasRubyColor = markup.includes('#DC2626') || markup.includes('#B91C1C');

    expect(hasRubyColor).toBe(true);
  });

  it('[TC-IMP51.12/MSS][Facet3-Vibrancy] Xúc xắc ở trạng thái dừng tĩnh không bật độ mờ loãng (opacity không cố định ở 0.88)', () => {
    useGameStore.setState({ isRolling: true });
    const markup = renderToStaticMarkup(React.createElement(DiceTray));

    // Không còn dùng opacity mờ loãng 0.88 làm mất tương phản màu ruby dưới nắng gắt
    expect(markup).not.toContain('opacity="0.88"');
  });

  it('[TC-IMP51.13/MSS][Facet3-Vibrancy] Chấm pips màu trắng #FFFFFF có thuộc tính emissive để phát quang nhẹ chống lóa nắng', () => {
    useGameStore.setState({ isRolling: true });
    const markup = renderToStaticMarkup(React.createElement(DiceTray));

    expect(markup).toContain('emissive');
  });

  it('[TC-IMP51.14/MSS][Facet3-Vibrancy] Chấm pips tương phản cao với màu trắng sứ #FFFFFF', () => {
    useGameStore.setState({ isRolling: true });
    const markup = renderToStaticMarkup(React.createElement(DiceTray));

    expect(markup).toContain('#FFFFFF');
  });

  // ===========================================================================
  // FACET 4: Bot Step-by-Step Pacing - Server (Phân Nhịp Độc Lập & Nhịp Nhàng)
  // ===========================================================================

  it('[TC-IMP51.15/MSS][Facet4-Pacing] TurnOrchestrator có độ trễ botTurnDelayMs mặc định >= 1.200ms (chuẩn 1.500ms)', () => {
    const rooms = new RoomManager(1234);
    const intentMutex: any = { runExclusive: async (_rc: any, fn: any) => await fn() };
    const broadcaster: any = { broadcastRoomDelta: vi.fn(), setTimeRemainingProvider: vi.fn() };

    const orchestrator = new TurnOrchestrator({
      rooms,
      intentMutex,
      broadcaster,
      onGameOver: vi.fn(),
    });

    expect((orchestrator as any).botTurnDelayMs).toBeGreaterThanOrEqual(1200);
  });

  it('[TC-IMP51.16/MSS][Facet4-Pacing] Nhịp 1: Khi Bot ở WaitingRoll, 1 nhịp step chỉ thực thi INTENT_ROLL và currentTurnPlayerId vẫn là Bot', async () => {
    vi.useFakeTimers();
    try {
      const rooms = new RoomManager(1234);
      const room = rooms.createRoom('p1');
      rooms.addBot(room.roomCode, 'bot_2');
      rooms.startGame(room.roomCode);

      // Chuyển lượt sang Bot 2 đang ở WaitingRoll
      room.currentPlayerIndex = 1;
      room.phase = TurnPhase.WaitingRoll;

      const intentMutex: any = { runExclusive: async (_rc: any, fn: any) => await fn() };
      const broadcaster: any = { broadcastRoomDelta: vi.fn(), setTimeRemainingProvider: vi.fn() };

      const orchestrator = new TurnOrchestrator({
        rooms,
        intentMutex,
        broadcaster,
        onGameOver: vi.fn(),
        botTurnDelayMs: 1500,
      });

      orchestrator.scheduleBotTurn(room.roomCode);
      await vi.advanceTimersByTimeAsync(1500);

      // Sau nhịp 1: Bot chỉ mới tung xúc xắc và di chuyển, lượt chơi vẫn thuộc về Bot 2
      expect(room.players[room.currentPlayerIndex]?.id).toBe('bot_2');
      orchestrator.clearRoom(room.roomCode);
    } finally {
      vi.useRealTimers();
    }
  });

  it('[TC-IMP51.17/MSS][Facet4-Pacing] Nhịp 1: Sau khi tung xúc xắc và di chuyển, FSM dừng ở ActionPhase hoặc PropertyManagement chứ chưa kết thúc lượt', async () => {
    vi.useFakeTimers();
    try {
      const rooms = new RoomManager(1234);
      const room = rooms.createRoom('p1');
      rooms.addBot(room.roomCode, 'bot_2');
      rooms.startGame(room.roomCode);

      room.currentPlayerIndex = 1;
      room.phase = TurnPhase.WaitingRoll;

      const intentMutex: any = { runExclusive: async (_rc: any, fn: any) => await fn() };
      const broadcaster: any = { broadcastRoomDelta: vi.fn(), setTimeRemainingProvider: vi.fn() };

      const orchestrator = new TurnOrchestrator({
        rooms,
        intentMutex,
        broadcaster,
        onGameOver: vi.fn(),
        botTurnDelayMs: 1500,
      });

      orchestrator.scheduleBotTurn(room.roomCode);
      await vi.advanceTimersByTimeAsync(1500);

      // FSM không được nhảy thẳng sang người tiếp theo (WaitingRoll của P1)
      expect([TurnPhase.ActionPhase, TurnPhase.PropertyManagement]).toContain(room.phase);
      orchestrator.clearRoom(room.roomCode);
    } finally {
      vi.useRealTimers();
    }
  });

  it('[TC-IMP51.18/MSS][Facet4-Pacing] Nhịp 2: Bot ở ActionPhase thực thi quyết định (Mua/Từ chối), FSM chuyển sang PropertyManagement và vẫn giữ lượt', async () => {
    vi.useFakeTimers();
    try {
      const rooms = new RoomManager(1234);
      const room = rooms.createRoom('p1');
      rooms.addBot(room.roomCode, 'bot_2');
      rooms.startGame(room.roomCode);

      // Đặt bot_2 ở ActionPhase trên ô đất mua được
      room.currentPlayerIndex = 1;
      room.players[1]!.position = 1;
      room.phase = TurnPhase.ActionPhase;

      const intentMutex: any = { runExclusive: async (_rc: any, fn: any) => await fn() };
      const broadcaster: any = { broadcastRoomDelta: vi.fn(), setTimeRemainingProvider: vi.fn() };

      const orchestrator = new TurnOrchestrator({
        rooms,
        intentMutex,
        broadcaster,
        onGameOver: vi.fn(),
        botTurnDelayMs: 1500,
      });

      orchestrator.scheduleBotTurn(room.roomCode);
      await vi.advanceTimersByTimeAsync(1500);

      // Sau nhịp hành động: chuyển sang PropertyManagement để bot chuẩn bị kết thúc lượt
      expect(room.phase).toBe(TurnPhase.PropertyManagement);
      expect(room.players[room.currentPlayerIndex]?.id).toBe('bot_2');
      orchestrator.clearRoom(room.roomCode);
    } finally {
      vi.useRealTimers();
    }
  });

  it('[TC-IMP51.19/MSS][Facet4-Pacing] Nhịp 3: Bot ở PropertyManagement thực thi INTENT_END_TURN chuyển lượt sang người chơi tiếp theo', async () => {
    vi.useFakeTimers();
    try {
      const rooms = new RoomManager(1234);
      const room = rooms.createRoom('p1');
      rooms.addBot(room.roomCode, 'bot_2');
      rooms.startGame(room.roomCode);

      // Đặt bot_2 ở PropertyManagement
      room.currentPlayerIndex = 1;
      room.phase = TurnPhase.PropertyManagement;

      const intentMutex: any = { runExclusive: async (_rc: any, fn: any) => await fn() };
      const broadcaster: any = { broadcastRoomDelta: vi.fn(), setTimeRemainingProvider: vi.fn() };

      const orchestrator = new TurnOrchestrator({
        rooms,
        intentMutex,
        broadcaster,
        onGameOver: vi.fn(),
        botTurnDelayMs: 1500,
      });

      orchestrator.scheduleBotTurn(room.roomCode);
      await vi.advanceTimersByTimeAsync(1500);

      // Kết thúc lượt: chuyển sang P1 (index 0)
      expect(room.currentPlayerIndex).toBe(0);
      expect(room.players[0]?.id).toBe('p1');
      orchestrator.clearRoom(room.roomCode);
    } finally {
      vi.useRealTimers();
    }
  });

  it.each([
    [BotPersonality.Aggressive],
    [BotPersonality.Passive],
    [BotPersonality.Balanced],
  ] as const)('[TC-IMP51.20/MSS][Facet4-Pacing] Bot tính cách %s phân nhịp độc lập không hoàn tất toàn bộ lượt trong 1 bước duy nhất', async (personality) => {
    vi.useFakeTimers();
    try {
      const rooms = new RoomManager(9999);
      const room = rooms.createRoom('p1');
      rooms.addBot(room.roomCode, 'bot_2');
      rooms.setBotPersonality(room.roomCode, 'bot_2', personality);
      rooms.startGame(room.roomCode);

      room.currentPlayerIndex = 1;
      room.phase = TurnPhase.WaitingRoll;

      const intentMutex: any = { runExclusive: async (_rc: any, fn: any) => await fn() };
      const broadcaster: any = { broadcastRoomDelta: vi.fn(), setTimeRemainingProvider: vi.fn() };

      const orchestrator = new TurnOrchestrator({
        rooms,
        intentMutex,
        broadcaster,
        onGameOver: vi.fn(),
        botTurnDelayMs: 1500,
      });

      orchestrator.scheduleBotTurn(room.roomCode);
      await vi.advanceTimersByTimeAsync(1500);

      // Nhịp 1 chỉ lăn xúc xắc, bot vẫn đang là người chơi hiện tại
      expect(room.players[room.currentPlayerIndex]?.id).toBe('bot_2');
      orchestrator.clearRoom(room.roomCode);
    } finally {
      vi.useRealTimers();
    }
  });
});
