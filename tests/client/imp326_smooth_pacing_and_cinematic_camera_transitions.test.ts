// @vitest-environment happy-dom
// [UI-S02/MSS][UI-S04/MSS] IMP-326: Smooth Pacing & Cinematic Transition Easing Contract Suite
// Traceability: docs/domain/gotchas/3d_cinematics.md (Gotcha 13, 15, 17), PLAN_IMP_326
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ActiveSpringPawn } from '../../src/client/3d/pawn_animator';
import { initSoftReturn, sampleSoftReturn, shouldBreakOnTouch } from '../../src/client/3d/camera_soft_return';
import { createPlayer } from '../../src/domain/room';
import { useGameStore } from '../../src/client/store/game_store';
import type { PawnReactionState } from '../../src/client/store/vfx_store.js';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Mock R3F hooks for headless testing
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: () => ({
    camera: { position: { x: 10, y: 15, z: 10, set: vi.fn() }, isPerspectiveCamera: true, fov: 40 },
    scene: {},
    gl: { domElement: document.createElement('canvas') },
  }),
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  Billboard: ({ children }: { children: React.ReactNode }) => React.createElement('group', null, children),
}));

// Mock subcomponents of pawn_animator to observe props passed to them
vi.mock('../../src/client/3d/single_hop_pawn.js', () => ({
  SingleHopPawn: ({ onHopComplete }: { onHopComplete: () => void }) => {
    React.useEffect(() => {
      onHopComplete();
    }, [onHopComplete]);
    return React.createElement('div', { 'data-testid': 'single-hop-pawn' });
  },
  StaticPawnWithReaction: (props: { reaction?: PawnReactionState | null; currentPos?: number }) =>
    React.createElement('div', {
      'data-testid': 'static-pawn-reaction',
      'data-pos': props.currentPos,
      'data-reaction': props.reaction?.type,
    }),
  PawnHopTrajectory: () => null,
}));

describe('[IMP-326] Smooth Pacing & Cinematic Camera Transitions Contract Suite', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    vi.useRealTimers();
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it('[TC-326.01/MSS][UC-DWELL] ActiveSpringPawn hoan tat ngay lap tuc neu waypoints rong', () => {
    let completedPlayer = '';
    const mockPlayer = createPlayer('p1');
    const root = createRoot(container);

    act(() => {
      root.render(
        React.createElement(ActiveSpringPawn, {
          player: mockPlayer,
          color: '#10B981',
          offset: [0, 0, 0],
          animation: {
            playerId: 'p1',
            fromCell: 0,
            targetCell: 0,
            waypoints: [],
            isAnimating: true,
          },
          onComplete: (pId: string) => {
            completedPlayer = pId;
          },
        })
      );
    });

    expect(completedPlayer).toBe('p1');
    act(() => {
      root.unmount();
    });
  });

  it('[TC-326.02/MSS][UC-DWELL] ActiveSpringPawn duy tri trang thai tiep dat va truyen reaction day du', () => {
    let completedPlayer = '';
    const mockPlayer = createPlayer('p1');
    const mockReaction: PawnReactionState = {
      type: 'victory_spin',
      startTime: Date.now(),
      durationMs: 1500,
    };
    const root = createRoot(container);

    act(() => {
      root.render(
        React.createElement(ActiveSpringPawn, {
          player: mockPlayer,
          color: '#10B981',
          offset: [0, 0, 0],
          animation: {
            playerId: 'p1',
            fromCell: 0,
            targetCell: 5,
            waypoints: [5],
            isAnimating: true,
          },
          reaction: mockReaction,
          onComplete: (pId: string) => {
            completedPlayer = pId;
          },
        })
      );
    });

    // Lúc vừa đáp đất: SingleHopPawn đã hop xong, chuyển sang isLandedSettle
    const staticPawn = container.querySelector('[data-pawn-reaction]');
    expect(staticPawn).not.toBeNull();
    expect(staticPawn?.getAttribute('data-pawn-reaction')).toBe('victory_spin');

    // Sau 250ms: Vẫn đang trong thời gian dwell 600ms, chưa complete
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(completedPlayer).toBe('');

    // Sau 350ms tiếp theo (tổng 600ms): Hoàn tất settle dwell
    act(() => {
      vi.advanceTimersByTime(350);
    });
    expect(completedPlayer).toBe('p1');

    act(() => {
      root.unmount();
    });
  });

  it('[TC-326.03/MSS][UC-FLUSH] ActiveSpringPawn flush onComplete ngay lap tuc khi unmount trong luc dwell de chong deadlock', () => {
    let completedPlayer = '';
    const mockPlayer = createPlayer('p2');
    const root = createRoot(container);

    act(() => {
      root.render(
        React.createElement(ActiveSpringPawn, {
          player: mockPlayer,
          color: '#3B82F6',
          offset: [0, 0, 0],
          animation: {
            playerId: 'p2',
            fromCell: 10,
            targetCell: 12,
            waypoints: [12],
            isAnimating: true,
          },
          onComplete: (pId: string) => {
            completedPlayer = pId;
          },
        })
      );
    });

    // Chỉ mới trôi qua 100ms trong 600ms settle
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(completedPlayer).toBe('');

    // Bất ngờ bị unmount (do người chơi bấm Skip hoặc đổi tab)
    act(() => {
      root.unmount();
    });

    // Cơ chế Flush-on-Unmount giải phóng store ngay lập tức, không để lại activePawnAnimation treo
    expect(completedPlayer).toBe('p2');
  });

  it('[TC-326.04/MSS][UC-CAM] initSoftReturn va sampleSoftReturn noi suy quy dao cau slerp khong giat van toc', () => {
    const startCamPos: [number, number, number] = [10.2, 6.4, 10.2];
    const startTarget: [number, number, number] = [8.0, 0.15, 8.0];
    const destCamPos: [number, number, number] = [24.6, 25.3, 24.6];
    const destTarget: [number, number, number] = [2.2, 0.0, 2.2];

    const state = initSoftReturn(startCamPos, startTarget, destCamPos, destTarget, 1000, 1200);
    expect(state.durationMs).toBe(1200);

    // Tại t=1600 (50% thời gian): slerp chuyển động êm ái
    const midSample = sampleSoftReturn(state, 1600);
    expect(midSample.isFinished).toBe(false);
    expect(midSample.position[1]).toBeGreaterThan(startCamPos[1]);
  });

  it('[TC-326.05/MSS][UC-CAM] sampleSoftReturn hoan tat tai destCamPos khi ket thuc thoi luong 1200ms', () => {
    const startCamPos: [number, number, number] = [10.2, 6.4, 10.2];
    const startTarget: [number, number, number] = [8.0, 0.15, 8.0];
    const destCamPos: [number, number, number] = [24.6, 25.3, 24.6];
    const destTarget: [number, number, number] = [2.2, 0.0, 2.2];

    const state = initSoftReturn(startCamPos, startTarget, destCamPos, destTarget, 1000, 1200);
    const endSample = sampleSoftReturn(state, 2200);
    expect(endSample.isFinished).toBe(true);
    expect(endSample.position[0]).toBeCloseTo(destCamPos[0], 1);
  });

  it('[TC-326.06/MSS][UC-CAM] shouldBreakOnTouch ngat lap tuc chu ky soft return khi nguoi dung tuong tac', () => {
    const isInteracting = true;
    const isResetting = true;
    const shouldBreak = shouldBreakOnTouch(isInteracting, isResetting);

    expect(shouldBreak).toBe(true);
  });

  it('[TC-326.07/MSS][UC-STORE] completePawnMove trong store giai phong activePawnAnimation va day visualPositions', () => {
    useGameStore.setState({
      activePawnAnimation: {
        playerId: 'p3',
        fromCell: 0,
        targetCell: 4,
        waypoints: [4],
        isAnimating: true,
      },
      playerPositions: { p3: 0 },
      visualPositions: { p3: 0 },
    });

    useGameStore.getState().completePawnMove('p3');

    const state = useGameStore.getState();
    expect(state.activePawnAnimation).toBeNull();
    expect(state.visualPositions.p3).toBe(4);
    expect(state.playerPositions.p3).toBe(4);
  });
});
