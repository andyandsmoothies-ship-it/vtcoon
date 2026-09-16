// [TC-IMP86/MSS][UC-86] Universal 4-Facet Behavioral Contract: Camera NaN Defense, Position Sync & AppErrorBoundary
import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { cellPosition, GRID } from '../../src/client/3d/board_coords';
import { calculateTargetCameraState } from '../../src/client/3d/camera_state_machine';
import { calculatePathWaypoints } from '../../src/client/3d/pawn_path';
import { resolveCameraTargetCell } from '../../src/client/game_canvas';
import { useGameStore } from '../../src/client/store/game_store';
import { checkIsTeleport } from '../../src/client/telemetry/telemetry_delta_hook';
import * as telemetryDeltaHook from '../../src/client/telemetry/telemetry_delta_hook';
import { verifyMovementStep } from '../../src/client/telemetry/invariant_checker';
import { SERVICE_CELLS as SSOT_SERVICE_CELLS } from '../../src/domain/event_card_types';
import { TurnPhase } from '../../src/domain/room';

describe('[IMP-86][CONTRACT] Camera NaN Defense & Position Sync & AppErrorBoundary', () => {
  let AppErrorBoundary: any = null;

  beforeAll(async () => {
    const candidatePaths = [
      '../../src/client/ui/app_error_boundary',
      '../../src/client/app_error_boundary',
      '../../src/client/main',
    ];
    for (const p of candidatePaths) {
      try {
        const mod = await import(/* @vite-ignore */ p);
        if (mod?.AppErrorBoundary) {
          AppErrorBoundary = mod.AppErrorBoundary;
          break;
        }
      } catch {
        // Module not found or export missing during RED phase
      }
    }
  });

  beforeEach(() => {
    useGameStore.getState().clearActivePawnAnimation();
    useGameStore.setState({
      playerPositions: {},
      visualPositions: {},
      pawnAnimationQueue: [],
      activePawnAnimation: null,
      isRolling: false,
      hasRolledThisTurn: false,
    });
  });

  // =========================================================================
  // FACET 1: BOUNDARY & MATH ARMOR FACET (9 TESTS)
  // =========================================================================
  describe('Facet 1: Boundary & Math Armor Facet', () => {
    it('[TC-86.01/MSS][UC-86] cellPosition(undefined as any) khong tra ve NaN, tra ve toa do huu han hop le [x, y, z]', () => {
      const pos = cellPosition(undefined as any);
      expect(Number.isFinite(pos[0])).toBe(true);
      expect(Number.isFinite(pos[1])).toBe(true);
      expect(Number.isFinite(pos[2])).toBe(true);
      expect(pos).toEqual([GRID, 0, GRID]);
    });

    it('[TC-86.02a/MSS][UC-86] cellPosition(NaN as any) tra ve toa do huu han khong co NaN', () => {
      const pos = cellPosition(NaN as any);
      expect(Number.isFinite(pos[0])).toBe(true);
      expect(Number.isFinite(pos[1])).toBe(true);
      expect(Number.isFinite(pos[2])).toBe(true);
      expect(pos).toEqual([GRID, 0, GRID]);
    });

    it('[TC-86.02b/MSS][UC-86] cellPosition(Infinity as any) tra ve toa do huu han khong co NaN', () => {
      const pos = cellPosition(Infinity as any);
      expect(Number.isFinite(pos[0])).toBe(true);
      expect(Number.isFinite(pos[1])).toBe(true);
      expect(Number.isFinite(pos[2])).toBe(true);
      expect(pos).toEqual([GRID, 0, GRID]);
    });

    it('[TC-86.03a/MSS][UC-86] cellPosition(-5) duoc clamp an toan ve toa do o 0', () => {
      const posNeg = cellPosition(-5);
      const expectedZero = cellPosition(0);
      expect(posNeg).toEqual(expectedZero);
    });

    it('[TC-86.03b/MSS][UC-86] cellPosition(99) duoc clamp an toan ve toa do o 39', () => {
      const posOverflow = cellPosition(99);
      const expectedThirtyNine = cellPosition(39);
      expect(posOverflow).toEqual(expectedThirtyNine);
    });

    it('[TC-86.04/MSS][UC-86] calculateTargetCameraState("tile_focus", [NaN, 0, NaN], [NaN, 0, NaN]) tra ve target va position 100% huu han', () => {
      const state = calculateTargetCameraState('tile_focus', [NaN, 0, NaN], [NaN, 0, NaN]);
      expect(state.position.every((v) => Number.isFinite(v))).toBe(true);
      expect(state.target.every((v) => Number.isFinite(v))).toBe(true);
    });

    it('[TC-86.05/MSS][UC-86] calculateTargetCameraState("pawn_chase", [NaN, 0, NaN], [NaN, 0, NaN]) tra ve target va position 100% huu han', () => {
      const state = calculateTargetCameraState('pawn_chase', [NaN, 0, NaN], [NaN, 0, NaN]);
      expect(state.position.every((v) => Number.isFinite(v))).toBe(true);
      expect(state.target.every((v) => Number.isFinite(v))).toBe(true);
    });

    it('[TC-86.06/MSS][UC-86] calculatePathWaypoints(-1, 45) khong nem Error, tra ve mang hop le', () => {
      expect(() => calculatePathWaypoints(-1, 45)).not.toThrow();
      const waypoints = calculatePathWaypoints(-1, 45);
      expect(Array.isArray(waypoints)).toBe(true);
    });

    it('[TC-86.07/MSS][UC-86] resolveCameraTargetCell voi activeAnimation currentIndex ngoai bien khong tra ve undefined', () => {
      const result = resolveCameraTargetCell(
        {
          isAnimating: true,
          waypoints: [1, 2, 3],
          currentIndex: 99,
          playerId: 'p1',
        } as any,
        null,
        {}
      );
      expect(result).not.toBeUndefined();
      expect(result === null || Number.isInteger(result)).toBe(true);
    });
  });

  // =========================================================================
  // FACET 2: STATE REACTIVITY & RACE CONDITION DEFENSE FACET (3 TESTS)
  // =========================================================================
  describe('Facet 2: State Reactivity & Race Condition Defense Facet', () => {
    it('[TC-86.08/MSS][UC-86] completePawnMove khong ghi de lui vi tri playerId trong playerPositions khi store da co vi tri lon hon', () => {
      useGameStore.setState({
        playerPositions: { bot_4: 12 },
        visualPositions: { bot_4: 0 },
        activePawnAnimation: {
          playerId: 'bot_4',
          fromCell: 0,
          targetCell: 6,
          waypoints: [1, 2, 3, 4, 5, 6],
          currentIndex: 5,
          isAnimating: true,
        } as any,
      });

      useGameStore.getState().completePawnMove('bot_4');

      expect(useGameStore.getState().playerPositions['bot_4']).toBe(12);
    });

    it('[TC-86.09/MSS][UC-86] completePawnMove cap nhat visualPositions ve dung vi tri dich cua tac vu vua hoan thanh', () => {
      useGameStore.setState({
        playerPositions: { bot_4: 12 },
        visualPositions: { bot_4: 0 },
        activePawnAnimation: {
          playerId: 'bot_4',
          fromCell: 0,
          targetCell: 6,
          waypoints: [1, 2, 3, 4, 5, 6],
          currentIndex: 5,
          isAnimating: true,
        } as any,
      });

      useGameStore.getState().completePawnMove('bot_4');

      expect(useGameStore.getState().visualPositions['bot_4']).toBe(6);
    });

    it('[TC-86.10/MSS][UC-86] completePawnMove tu dong kich hoat tac vu tiep theo trong hang doi processPawnQueue', () => {
      useGameStore.setState({
        isRolling: false,
        activePawnAnimation: {
          playerId: 'bot_1',
          fromCell: 0,
          targetCell: 3,
          waypoints: [1, 2, 3],
          currentIndex: 2,
          isAnimating: true,
        } as any,
        pawnAnimationQueue: [
          {
            playerId: 'bot_2',
            fromCell: 0,
            targetCell: 5,
            waypoints: [1, 2, 3, 4, 5],
            isBot: true,
          },
        ],
      });

      useGameStore.getState().completePawnMove('bot_1');

      expect(useGameStore.getState().activePawnAnimation?.playerId).toBe('bot_2');
    });
  });

  // =========================================================================
  // FACET 3: TELEMETRY & INVARIANT FIDELITY FACET (5 TESTS)
  // =========================================================================
  describe('Facet 3: Telemetry & Invariant Fidelity Facet', () => {
    it('[TC-86.11/MSS][UC-86] SERVICE_CELLS trong Telemetry Hook khop 100% voi SSOT [6, 8, 26, 27]', () => {
      const hookServiceCells = (telemetryDeltaHook as any).SERVICE_CELLS;
      expect(hookServiceCells).toBeDefined();
      const cellsArray =
        hookServiceCells instanceof Set
          ? Array.from(hookServiceCells)
          : Array.from(hookServiceCells ?? []);
      expect(cellsArray.sort()).toEqual([...SSOT_SERVICE_CELLS].sort());
    });

    it('[TC-86.12/MSS][UC-86] checkIsTeleport(fromPos, 6, true, TurnPhase.PropertyManagement) tra ve true khi dich den la o Dich vu MC_MEGA_CONCERT', () => {
      const isTeleport = checkIsTeleport(0, 6, true, TurnPhase.PropertyManagement);
      expect(isTeleport).toBe(true);
    });

    it('[TC-86.13/MSS][UC-86] verifyMovementStep khong tra ve violation INVALID_POSITION_STEP khi isTeleport la true', () => {
      const violation = verifyMovementStep({
        fromPosition: 0,
        toPosition: 6,
        tick: 10,
        isTeleport: true,
        dice: [1, 2],
      });
      expect(violation).toBeNull();
    });

    it('[TC-86.14a/MSS][UC-86] verifyMovementStep tra ve violation INVALID_POSITION_STEP khi quan co nhay o khong co xuc xac', () => {
      const violationNoDice = verifyMovementStep({
        fromPosition: 0,
        toPosition: 6,
        tick: 11,
        isTeleport: false,
      });
      expect(violationNoDice).not.toBeNull();
      expect(violationNoDice?.type).toBe('INVALID_POSITION_STEP');
    });

    it('[TC-86.14b/MSS][UC-86] verifyMovementStep tra ve violation INVALID_POSITION_STEP khi quan co nhay sai o voi xuc xac khong khop', () => {
      const violationMismatch = verifyMovementStep({
        fromPosition: 0,
        toPosition: 5,
        tick: 12,
        isTeleport: false,
        dice: [1, 2],
      });
      expect(violationMismatch).not.toBeNull();
      expect(violationMismatch?.type).toBe('INVALID_POSITION_STEP');
    });
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE & REACT BOUNDARY FACET (2 TESTS)
  // =========================================================================
  describe('Facet 4: Error Defense & React Boundary Facet', () => {
    it('[TC-86.15/MSS][UC-86] AppErrorBoundary render fallback UI voi role="alert" va chua thong bao loi', () => {
      expect(AppErrorBoundary).not.toBeNull();
      const testError = new Error('Lỗi render 3D WebGL đột ngột');
      let markup = '';
      if (AppErrorBoundary.prototype?.render) {
        const boundary = new AppErrorBoundary({
          children: React.createElement('div', null, 'Normal UI'),
        });
        if (typeof AppErrorBoundary.getDerivedStateFromError === 'function') {
          const derived = AppErrorBoundary.getDerivedStateFromError(testError);
          boundary.state = { ...boundary.state, ...derived, hasError: true, error: testError };
        } else {
          boundary.state = { hasError: true, error: testError };
        }
        markup = renderToStaticMarkup(boundary.render());
      } else {
        markup = renderToStaticMarkup(
          React.createElement(AppErrorBoundary, { error: testError, hasError: true })
        );
      }
      expect(markup).toContain('role="alert"');
      expect(markup).toContain('Lỗi render 3D WebGL đột ngột');
    });

    it('[TC-86.16/MSS][UC-86] AppErrorBoundary co nut khoi phuc "Thu Lai" hoac "Tai lai trang"', () => {
      expect(AppErrorBoundary).not.toBeNull();
      const testError = new Error('Sự cố kết xuất giao diện');
      let markup = '';
      if (AppErrorBoundary.prototype?.render) {
        const boundary = new AppErrorBoundary({
          children: React.createElement('div', null, 'Normal UI'),
        });
        if (typeof AppErrorBoundary.getDerivedStateFromError === 'function') {
          const derived = AppErrorBoundary.getDerivedStateFromError(testError);
          boundary.state = { ...boundary.state, ...derived, hasError: true, error: testError };
        } else {
          boundary.state = { hasError: true, error: testError };
        }
        markup = renderToStaticMarkup(boundary.render());
      } else {
        markup = renderToStaticMarkup(
          React.createElement(AppErrorBoundary, { error: testError, hasError: true })
        );
      }
      expect(markup).toMatch(/Thử Lại|Tải lại trang/i);
    });
  });
});
