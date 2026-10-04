import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ActiveSpringPawn } from '../../src/client/3d/pawn_animator';
import { createPlayer } from '../../src/domain/room';

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));
vi.mock('@react-three/drei', () => ({
  Billboard: ({ children }: { children?: React.ReactNode }) => children,
}));

describe('[TC-PAWN-TRAJ/MSS] Pawn Movement Animation Trajectory Visibility', () => {
  it('[TC-TRAJ-01/MSS] ActiveSpringPawn an vet line mau sac mac dinh khi di chuyen (showTrajectory = false)', () => {
    const player = createPlayer('p1');
    const markup = renderToStaticMarkup(
      React.createElement(ActiveSpringPawn, {
        player,
        color: '#38BDF8',
        offset: [0, 0, 0],
        animation: {
          playerId: 'p1',
          fromCell: 0,
          waypoints: [1, 2],
          currentIndex: 0,
          isAnimating: true,
        },
        onComplete: vi.fn(),
      })
    );

    expect(markup).toBeDefined();
    expect(markup).not.toContain('pawn-hop-trajectory');
    expect(markup).toContain('cylinderGeometry');
  });

  it('[TC-TRAJ-02/MSS] ActiveSpringPawn render vet quy dao khi duoc chi dinh showTrajectory: true', () => {
    const player = createPlayer('bot_1');
    const markup = renderToStaticMarkup(
      React.createElement(ActiveSpringPawn, {
        player,
        color: '#F59E0B',
        offset: [0, 0, 0],
        animation: {
          playerId: 'bot_1',
          fromCell: 0,
          waypoints: [1, 2],
          currentIndex: 0,
          isAnimating: true,
        },
        onComplete: vi.fn(),
        showTrajectory: true,
      })
    );

    expect(markup).toBeDefined();
    expect(markup).toContain('pawn-hop-trajectory');
    expect(markup).toContain('cylinderGeometry');
  });
});
