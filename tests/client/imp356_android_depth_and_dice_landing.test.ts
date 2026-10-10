// @vitest-environment happy-dom
// [TC-356/MSS][UC-356] Contract Test Suite: Diorama Hollow Rim, Flat Dice Landing & Bot Action Camera
// Universal 5-Facet Behavioral Matrix Verification:
// Facet 1: Boundary & Scale (Rim outer dimensions >= 18.2m, perimeter extents within [-9.22, 9.22])
// Facet 2: State Reactivity & Cycle Teardown (Hollow interior without solid center slab, turn transition reset)
// Facet 3: Resource Disposal & Timer Isolation (Fade and hide timer cancellation on unmount and turn advance)
// Facet 4: Error Defense & Preservation Invariant (Zero ruby dice when idle, flat dice landing rotation [0, 0, 0])
// Facet 5: Cross-Coupling Blast Radius (Bot action camera pawn_chase, tile_focus, and dice_pan activation)

import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';

import { DioramaBoardRim } from '../../src/client/3d/miniature_city_diorama';
import { DiceTray } from '../../src/client/3d/dice_tray';
import {
  resolveCameraMode,
  calculateTargetCameraState,
} from '../../src/client/3d/camera_state_machine';
import { calculateDicePanCameraState } from '../../src/client/3d/cinematic_chase_camera';
import { useGameStore } from '../../src/client/store/game_store';
import { AudioEngine } from '../../src/client/audio/audio_engine';

vi.mock('@react-spring/three', () => ({
  a: {
    group: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) =>
      React.createElement('group', props, children),
  },
  useSpring: () => ({
    t: { to: (fn: (v: number) => unknown) => fn(1) },
    pos: [0, 0, 0],
    rot: [0, 0, 0],
  }),
}));

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

interface BoxMeshInfo {
  readonly position: [number, number, number];
  readonly size: [number, number, number];
}

/**
 * Helper: Extract all mesh blocks with box geometry from markup
 */
function parseBoardRimMeshes(markup: string): BoxMeshInfo[] {
  const meshBlocks = markup.match(/<mesh\b[\s\S]*?<\/mesh>/gi) ?? [];
  const meshes: BoxMeshInfo[] = [];
  for (const block of meshBlocks) {
    const posMatch = block.match(/position="([^"]+)"/i);
    const boxMatch = block.match(/<boxgeometry\b[^>]*args="([^"]+)"/i);
    if (boxMatch && boxMatch[1]) {
      const rawSize = boxMatch[1].split(',').map((s) => parseFloat(s.trim()));
      const size: [number, number, number] = [
        rawSize[0] ?? 0,
        rawSize[1] ?? 0,
        rawSize[2] ?? 0,
      ];
      let pos: [number, number, number] = [0, 0, 0];
      if (posMatch && posMatch[1]) {
        const rawPos = posMatch[1].split(',').map((s) => parseFloat(s.trim()));
        pos = [rawPos[0] ?? 0, rawPos[1] ?? 0, rawPos[2] ?? 0];
      }
      meshes.push({ position: pos, size });
    }
  }
  return meshes;
}

/**
 * Helper: Find solid slabs spanning across the center interior region [-halfSpan, +halfSpan]
 */
function findCenterSlabs(meshes: readonly BoxMeshInfo[], halfSpan: number): BoxMeshInfo[] {
  return meshes.filter((m) => {
    const minX = m.position[0] - m.size[0] / 2;
    const maxX = m.position[0] + m.size[0] / 2;
    const minZ = m.position[2] - m.size[2] / 2;
    const maxZ = m.position[2] + m.size[2] / 2;
    return minX <= -halfSpan && maxX >= halfSpan && minZ <= -halfSpan && maxZ >= halfSpan;
  });
}

describe('[TC-356/MSS] Diorama Hollow Rim, Flat Dice Landing & Bot Action Camera Suite', () => {
  let originalConsoleError: typeof console.error;
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;
  let playSfxSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (
        msg.includes('is using incorrect casing') ||
        msg.includes('does not recognize the') ||
        msg.includes('The tag <') ||
        msg.includes('non-boolean attribute') ||
        msg.includes('Received `false`')
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
    vi.useFakeTimers();
    playSfxSpy = vi.spyOn(AudioEngine, 'playSfx').mockImplementation(() => {});

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    useGameStore.setState({
      isRolling: false,
      currentTurnPlayerId: 'p1',
      dice: [3, 4],
      lastDiceSeq: 1,
    });
  });

  afterEach(() => {
    if (root) {
      try {
        act(() => {
          root?.unmount();
        });
      } catch {
        /* ignore unmount error */
      }
    }
    if (container?.parentNode) {
      container.parentNode.removeChild(container);
    }
    container = null;
    root = null;
    playSfxSpy.mockRestore();
    vi.useRealTimers();
  });

  // ===========================================================================
  // FACET 1: Boundary & Scale (Outer Dimensions & Perimeter Extents)
  // ===========================================================================

  it('[TC-356.01/MSS] [UC-RIM-PERIMETER]: Given DioramaBoardRim rendered in markup, When inspecting outer dimensions, Then widthX >= 18.2, depthZ >= 18.2, and heightY > 0, satisfying urban density contract', () => {
    const markup = renderToStaticMarkup(React.createElement(DioramaBoardRim));
    const meshes = parseBoardRimMeshes(markup);

    const northSouthRails = meshes.filter((m) => m.size[0] >= 17.0 && m.size[1] >= 0.05);
    const eastWestRails = meshes.filter((m) => m.size[2] >= 18.2 && m.size[1] >= 0.05);
    const maxOuterX = Math.max(...meshes.map((m) => m.size[0]));

    expect(northSouthRails.length).toBe(2);
    expect(eastWestRails.length).toBe(2);
    expect(maxOuterX).toBeGreaterThanOrEqual(18.2);
  });

  // ===========================================================================
  // FACET 2: State Reactivity & Cycle Teardown (Hollow Rim & Z-Fighting Defense)
  // ===========================================================================

  it('[TC-356.02/MSS] [UC-RIM-HOLLOW]: Given DioramaBoardRim rendered in markup, When inspecting interior region, Then no solid slab spans across the center (X in [-8, 8] and Z in [-8, 8]), preventing river burial and Z-fighting', () => {
    const markup = renderToStaticMarkup(React.createElement(DioramaBoardRim));
    const meshes = parseBoardRimMeshes(markup);
    const centerSlabs = findCenterSlabs(meshes, 8.0);

    expect(centerSlabs.length).toBe(0);
  });

  it('[TC-356.03/MSS] [UC-RIM-FLUSH-CORNERS]: Given DioramaBoardRim perimeter rails, When evaluating rail extents, Then no geometry extends beyond outer perimeter [-9.22, 9.22], preventing ADV-01 cross-hair overhangs', () => {
    const markup = renderToStaticMarkup(React.createElement(DioramaBoardRim));
    const meshes = parseBoardRimMeshes(markup);

    const maxAbsExtentX = Math.max(...meshes.map((m) => Math.abs(m.position[0]) + m.size[0] / 2));
    const maxAbsExtentZ = Math.max(...meshes.map((m) => Math.abs(m.position[2]) + m.size[2] / 2));

    expect(meshes.length).toBe(8);
    expect(maxAbsExtentX).toBeLessThanOrEqual(9.221);
    expect(maxAbsExtentZ).toBeLessThanOrEqual(9.221);
  });

  // ===========================================================================
  // FACET 3: Error Defense & Flat Landing Invariants (Dice Resting & Unmount)
  // ===========================================================================

  it('[TC-356.04/MSS] [UC-DICE-FLAT]: Given DiceTray rendered in rested state (isRolling = false), When inspecting dice group rotation, Then rotation is [0, 0, 0] without unnatural 20-degree tilt', () => {
    act(() => {
      useGameStore.setState({ isRolling: true, currentTurnPlayerId: 'p1' });
      root?.render(React.createElement(DiceTray));
    });

    act(() => {
      useGameStore.setState({ isRolling: false });
    });

    const diceGroup = container?.querySelector('group[rotation]');
    const rawRotation = diceGroup?.getAttribute('rotation') ?? '';
    const rotationValues = rawRotation.split(',').map((v) => parseFloat(v.trim()));

    expect(diceGroup).not.toBeNull();
    expect(rotationValues).toEqual([0, 0, 0]);
  });

  it('[TC-356.05/MSS] [UC-DICE-UNMOUNT]: Given DiceTray rendered after roll completion, When active turn advances to another player, Then cancels timers and unmounts dice cleanly without lingering into subsequent turns', () => {
    act(() => {
      useGameStore.setState({ isRolling: true, currentTurnPlayerId: 'p1' });
      root?.render(React.createElement(DiceTray));
    });

    act(() => {
      useGameStore.setState({ isRolling: false });
    });

    expect(container?.querySelector('group[rotation]')).not.toBeNull();

    act(() => {
      useGameStore.setState({ currentTurnPlayerId: 'bot1' });
    });

    expect(container?.querySelector('group[rotation]')).toBeNull();
  });

  it('[TC-356.06/MSS] [UC-DICE-PRESERVATION]: Given DiceTray idle state, When rendering static markup, Then preserves zero ruby dice when idle, satisfying TC-IMP53.10 contract', () => {
    useGameStore.setState({ isRolling: false, currentTurnPlayerId: 'p1' });
    const markup = renderToStaticMarkup(React.createElement(DiceTray));

    expect(markup).toContain('data-testid="dice-tray"');
    expect(markup.includes('#DC2626') || markup.includes('#EF4444')).toBe(false);
  });

  // ===========================================================================
  // FACET 4: Cross-Coupling Blast Radius (Bot Action Camera Restoration)
  // ===========================================================================

  it('[TC-356.07/MSS] [UC-CAM-BOT-ACTION]: Given Bot turn with pawn animating, When calling resolveCameraMode, Then returns pawn_chase following the bot across the board', () => {
    const mode = resolveCameraMode({
      isRolling: false,
      isPawnAnimating: true,
      hasTargetTile: false,
      hasRolledThisTurn: true,
      activeModal: null,
      isBotTurn: true,
      isAnimatingPawnBot: true,
      isTargetOwnedByHuman: false,
      isHighStakesRoll: false,
    });

    expect(mode).toBe('pawn_chase');
  });

  it('[TC-356.08/MSS] [UC-CAM-BOT-SPEED]: Given Bot turn in pawn_chase mode, When calling calculateTargetCameraState, Then uses catch-up speed 7.2 overcoming bot hop velocity', () => {
    const resultState = calculateTargetCameraState('pawn_chase', [0, 0, 0], [0, 0, 0], {
      isBotTurn: true,
    });

    expect(resultState.speed).toBe(7.2);
    expect(resultState.fov).toBe(38);
  });

  it('[TC-356.09/MSS] [UC-CAM-BOT-LANDING]: Given Bot turn when landed at destination tile owned by human player, When calling resolveCameraMode, Then returns tile_focus spotlighting the landed destination tile', () => {
    const humanPropertyMode = resolveCameraMode({
      isRolling: false,
      isPawnAnimating: false,
      hasTargetTile: true,
      hasRolledThisTurn: true,
      activeModal: null,
      isBotTurn: true,
      isAnimatingPawnBot: true,
      isTargetOwnedByHuman: true,
      isHighStakesRoll: false,
    });
    const unownedPropertyMode = resolveCameraMode({
      isRolling: false,
      isPawnAnimating: false,
      hasTargetTile: true,
      hasRolledThisTurn: true,
      activeModal: null,
      isBotTurn: true,
      isAnimatingPawnBot: true,
      isTargetOwnedByHuman: false,
      isHighStakesRoll: false,
    });

    expect(humanPropertyMode).toBe('tile_focus');
    expect(unownedPropertyMode).toBe('overview');
  });

  // ===========================================================================
  // FACET 5: Dynamic Triad (Re-entrant Turn Guard & Timer Teardown)
  // ===========================================================================

  it('[TC-356.10/MSS] [UC-DICE-TURN-ROLLING-GUARD]: Given DiceTray rolling when turn abruptly advances, When currentTurnPlayerId changes, Then dispatches setIsRolling(false) preventing orphaned rolling store state', () => {
    act(() => {
      useGameStore.setState({ isRolling: true, currentTurnPlayerId: 'p1' });
      root?.render(React.createElement(DiceTray));
    });

    expect(useGameStore.getState().isRolling).toBe(true);

    act(() => {
      useGameStore.setState({ currentTurnPlayerId: 'p2' });
    });

    expect(useGameStore.getState().isRolling).toBe(false);
  });

  it('[TC-356.11/MSS] [UC-DICE-TIMER-CLEANUP]: Given DiceTray unmounting while post-roll timers are pending, When unmounted, Then cancels timers without post-unmount state leakage', () => {
    act(() => {
      useGameStore.setState({ isRolling: true, currentTurnPlayerId: 'p1' });
      root?.render(React.createElement(DiceTray));
    });

    act(() => {
      useGameStore.setState({ isRolling: false });
    });

    expect(() => {
      act(() => {
        root?.unmount();
      });
      vi.advanceTimersByTime(2000);
    }).not.toThrow();
    expect(container?.innerHTML ?? '').toBe('');
  });
});
