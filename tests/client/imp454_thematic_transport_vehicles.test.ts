// [TC-IMP454/MSS] Thematic Transport Vehicles & Neon Trajectory Purge Contract Suite
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  calculateTransportVehicleTransform,
  resolveSirenPhase,
} from '../../src/client/3d/thematic_transport_calc';
import { ActiveSpringPawn } from '../../src/client/3d/pawn_animator';
import { createPlayer } from '../../src/domain/room';

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

vi.mock('@react-three/drei', () => ({
  Billboard: ({ children }: { children?: React.ReactNode }) => children,
}));

describe('[IMP-454] Thematic Transport Vehicles & Neon Trajectory Purge Contract Suite', () => {
  describe('[TC-454.01/MSS] Police Perimeter Cornering & Clearance (Jail Flight)', () => {
    it('[TC-454.01a/MSS][UC-VEHICLE-POLICE-PERIMETER-SMOOTH/MSS] vehicle position stays along perimeter roads (R >= 7.5m, never penetrating central diorama R < 6.5m)', () => {
      const t0 = calculateTransportVehicleTransform({ progress: 0.0, fromCell: 30, toCell: 10, flightType: 'audit' });
      const tMid = calculateTransportVehicleTransform({ progress: 0.5, fromCell: 30, toCell: 10, flightType: 'audit' });

      const rMid = Math.hypot(tMid.position[0], tMid.position[2]);

      expect(t0.position[0]).toBeCloseTo(9.0, 1);
      expect(tMid.position[0]).toBeCloseTo(8.56, 1);
      expect(tMid.position[2]).toBeCloseTo(8.56, 1);
      expect(rMid).toBeGreaterThanOrEqual(7.5);
    });

    it('[TC-454.01b/MSS][UC-VEHICLE-POLICE-PERIMETER-SMOOTH/MSS] vehicle executes C1 smooth yaw transition between t=0.42 and t=0.58 without angular snap', () => {
      const tStart = calculateTransportVehicleTransform({ progress: 0.42, fromCell: 30, toCell: 10, flightType: 'audit' });
      const tMid = calculateTransportVehicleTransform({ progress: 0.50, fromCell: 30, toCell: 10, flightType: 'audit' });
      const tEnd = calculateTransportVehicleTransform({ progress: 0.58, fromCell: 30, toCell: 10, flightType: 'audit' });

      expect(tStart.rotation[1]).toBeCloseTo(0.0, 2);
      expect(tEnd.rotation[1]).toBeCloseTo(-Math.PI / 2, 2);
      expect(tMid.rotation[1]).toBeLessThan(tStart.rotation[1]);
    });

    it('[TC-454.01c/MSS][UC-VEHICLE-POLICE-PERIMETER-SMOOTH/MSS] vehicle locks ground elevation strictly to road surface without flying', () => {
      const t0 = calculateTransportVehicleTransform({ progress: 0.0, fromCell: 30, toCell: 10, flightType: 'audit' });
      const tMid = calculateTransportVehicleTransform({ progress: 0.5, fromCell: 30, toCell: 10, flightType: 'audit' });
      const t1 = calculateTransportVehicleTransform({ progress: 1.0, fromCell: 30, toCell: 10, flightType: 'audit' });

      expect(t0.position[1]).toBeCloseTo(0.04, 2);
      expect(tMid.position[1]).toBeCloseTo(0.04, 2);
      expect(t1.position[1]).toBeCloseTo(0.04, 2);
    });

    it('[TC-454.01d/MSS][UC-VEHICLE-POLICE-PERIMETER-SMOOTH/MSS] advances northward along East edge on Leg 1 with precise coordinate tracking', () => {
      const tLeg1 = calculateTransportVehicleTransform({ progress: 0.21, fromCell: 30, toCell: 10, flightType: 'audit' });

      expect(tLeg1.position[0]).toBeCloseTo(9.0, 1);
      expect(tLeg1.position[2]).toBeCloseTo(-0.75, 1);
    });

    it('[TC-454.01e/MSS][UC-VEHICLE-POLICE-PERIMETER-SMOOTH/MSS] dynamically routes from South edge (Cell 7) straight to Cell 10 without teleporting to Cell 30', () => {
      const tStart = calculateTransportVehicleTransform({ progress: 0.0, fromCell: 7, toCell: 10, flightType: 'audit' });
      const tEnd = calculateTransportVehicleTransform({ progress: 1.0, fromCell: 7, toCell: 10, flightType: 'audit' });

      expect(tStart.position[0]).toBeCloseTo(-3.6, 1);
      expect(tStart.position[2]).toBeCloseTo(9.0, 1);
      expect(tEnd.position[0]).toBeCloseTo(-9.0, 1);
      expect(tEnd.position[2]).toBeCloseTo(9.0, 1);
    });

    it('[TC-454.01f/MSS][UC-VEHICLE-POLICE-PERIMETER-SMOOTH/MSS] dynamically routes from North edge (Cell 22) through Cell 20 corner to Cell 10', () => {
      const tStart = calculateTransportVehicleTransform({ progress: 0.0, fromCell: 22, toCell: 10, flightType: 'audit' });
      const tEnd = calculateTransportVehicleTransform({ progress: 1.0, fromCell: 22, toCell: 10, flightType: 'audit' });

      expect(tStart.position[0]).toBeCloseTo(-5.4, 1);
      expect(tStart.position[2]).toBeCloseTo(-9.0, 1);
      expect(tEnd.position[0]).toBeCloseTo(-9.0, 1);
      expect(tEnd.position[2]).toBeCloseTo(9.0, 1);
    });

    it('[TC-454.01g/MSS][UC-VEHICLE-POLICE-PERIMETER-SMOOTH/MSS] guarantees C0 entry and mid-arc coordinates through Cell 20 corner sweep', () => {
      const tEntry = calculateTransportVehicleTransform({ progress: 0.42, fromCell: 22, toCell: 10, flightType: 'audit' });
      const tMid = calculateTransportVehicleTransform({ progress: 0.50, fromCell: 22, toCell: 10, flightType: 'audit' });

      // Entry at [-7.5, -9.0] and mid-arc at [-8.56, -8.56]
      expect(tEntry.position[0]).toBeCloseTo(-7.5, 2);
      expect(tEntry.position[2]).toBeCloseTo(-9.0, 2);
      expect(tMid.position[0]).toBeCloseTo(-7.5 - 1.5 * Math.SQRT1_2, 2);
      expect(tMid.position[2]).toBeCloseTo(-7.5 - 1.5 * Math.SQRT1_2, 2);
    });

    it('[TC-454.01h/MSS][UC-VEHICLE-POLICE-PERIMETER-SMOOTH/MSS] guarantees C0 exit coordinates and perimeter non-penetration (R >= 7.5m)', () => {
      const tMid = calculateTransportVehicleTransform({ progress: 0.50, fromCell: 22, toCell: 10, flightType: 'audit' });
      const tExit = calculateTransportVehicleTransform({ progress: 0.58, fromCell: 22, toCell: 10, flightType: 'audit' });

      expect(tExit.position[0]).toBeCloseTo(-9.0, 2);
      expect(tExit.position[2]).toBeCloseTo(-7.5, 2);
      const midRadius = Math.hypot(tMid.position[0], tMid.position[2]);
      expect(midRadius).toBeGreaterThanOrEqual(7.5);
    });

    it('[TC-454.01i/MSS][UC-VEHICLE-POLICE-PERIMETER-SMOOTH/MSS] rotates yaw continuously from West (-PI/2) through mid-arc to South (0.0)', () => {
      const tEntry = calculateTransportVehicleTransform({ progress: 0.42, fromCell: 22, toCell: 10, flightType: 'audit' });
      const tMid = calculateTransportVehicleTransform({ progress: 0.50, fromCell: 22, toCell: 10, flightType: 'audit' });
      const tExit = calculateTransportVehicleTransform({ progress: 0.58, fromCell: 22, toCell: 10, flightType: 'audit' });

      expect(tEntry.rotation[1]).toBeCloseTo(-Math.PI / 2, 2);
      expect(tMid.rotation[1]).toBeCloseTo(-Math.PI / 4, 2);
      expect(tExit.rotation[1]).toBeCloseTo(0.0, 2);
    });
  });

  describe('[TC-454.02/MSS] Civilian Airliner 3D Parabolic Arc & Siren Exclusion', () => {
    it('[TC-454.02a/MSS][UC-VEHICLE-AIRLINER-PARABOLIC/MSS] returns peak altitude Y >= 2.5m at progress 0.5 during transit flight', () => {
      const transform = calculateTransportVehicleTransform({ progress: 0.5, fromCell: 5, toCell: 15, flightType: 'transit' });

      expect(transform.position[1]).toBeGreaterThanOrEqual(2.5);
      expect(Number.isFinite(transform.position[1])).toBe(true);
    });

    it('[TC-454.02b/MSS][UC-VEHICLE-AIRLINER-PARABOLIC/MSS] pitches nose-up during climb (t=0.2) and nose-down during descent (t=0.8)', () => {
      const climb = calculateTransportVehicleTransform({ progress: 0.2, fromCell: 5, toCell: 15, flightType: 'transit' });
      const descent = calculateTransportVehicleTransform({ progress: 0.8, fromCell: 5, toCell: 15, flightType: 'transit' });

      expect(climb.rotation[0]).toBeGreaterThan(0);
      expect(descent.rotation[0]).toBeLessThan(0);
    });

    it('[TC-454.02c/MSS][UC-VEHICLE-AIRLINER-PARABOLIC/MSS] civilian airliner flight does not declare police sirenActive property', () => {
      const transform = calculateTransportVehicleTransform({ progress: 0.5, fromCell: 5, toCell: 15, flightType: 'transit' });

      expect(Reflect.get(transform, 'sirenActive')).toBeUndefined();
    });
  });

  describe('[TC-454.03/MSS] Police Siren Lightbar Frequency & Alternation', () => {
    it('[TC-454.03a/MSS][UC-VEHICLE-SIREN-ALTERNATION/MSS] alternates strictly between red and blue phases across advancing timestamps', () => {
      const phase0 = resolveSirenPhase(0);
      const phase100 = resolveSirenPhase(100);

      expect(phase0).toBe('red');
      expect(phase100).toBe('blue');
    });

    it('[TC-454.03b/MSS][UC-VEHICLE-SIREN-ALTERNATION/MSS] maintains alternation frequency >= 4 Hz completing full cycle within 250ms', () => {
      const phase200 = resolveSirenPhase(200);
      const auditTransform = calculateTransportVehicleTransform({
        progress: 0.5,
        fromCell: 30,
        toCell: 10,
        flightType: 'audit',
        timestampMs: 100,
      });

      expect(phase200).toBe('red');
      expect(auditTransform.sirenActive).toBe('blue');
    });
  });

  describe('[TC-454.04/A1] Out-of-Bounds Progress Safety Clamping', () => {
    it('[TC-454.04a/A1][UC-VEHICLE-OUT-OF-BOUNDS-SAFETY/A1] clamps negative progress (t < 0.0) safely to initial perimeter position without NaN', () => {
      const clamped = calculateTransportVehicleTransform({ progress: -0.5, fromCell: 30, toCell: 10, flightType: 'audit' });
      const t0 = calculateTransportVehicleTransform({ progress: 0.0, fromCell: 30, toCell: 10, flightType: 'audit' });

      expect(Number.isFinite(clamped.position[0])).toBe(true);
      expect(clamped.position[0]).toBeCloseTo(9.0, 1);
      expect(clamped.position).toEqual(t0.position);
    });

    it('[TC-454.04b/A1][UC-VEHICLE-OUT-OF-BOUNDS-SAFETY/A1] clamps overflow progress (t > 1.0) safely to destination position without throwing', () => {
      const clamped = calculateTransportVehicleTransform({ progress: 1.5, fromCell: 30, toCell: 10, flightType: 'audit' });
      const t1 = calculateTransportVehicleTransform({ progress: 1.0, fromCell: 30, toCell: 10, flightType: 'audit' });

      expect(Number.isFinite(clamped.position[2])).toBe(true);
      expect(clamped.position[2]).toBeCloseTo(9.0, 1);
      expect(clamped.position).toEqual(t1.position);
    });
  });

  describe('[TC-454.05/MSS] Neon Trajectory Purge & Transport Vehicle Integration on Flight', () => {
    it('[TC-454.05a/MSS][UC-ANIMATOR-NEON-PURGE-ON-FLIGHT/MSS] purges PawnHopTrajectory from DOM when direct flight animation is active', () => {
      const player = createPlayer('p1');
      const markup = renderToStaticMarkup(
        React.createElement(ActiveSpringPawn, {
          player,
          color: '#EF4444',
          offset: [0, 0, 0],
          animation: {
            playerId: 'p1',
            fromCell: 30,
            waypoints: [10],
            currentIndex: 0,
            isAnimating: true,
            isJailFlight: true,
            flightType: 'audit',
          },
          onComplete: vi.fn(),
          showTrajectory: true,
        })
      );

      expect(markup).toBeDefined();
      expect(markup).not.toContain('pawn-hop-trajectory');
    });

    it('[TC-454.05b/MSS][UC-ANIMATOR-NEON-PURGE-ON-FLIGHT/MSS] mounts ThematicTransportVehicle in tree when direct flight animation is active', () => {
      const player = createPlayer('p1');
      const markup = renderToStaticMarkup(
        React.createElement(ActiveSpringPawn, {
          player,
          color: '#EF4444',
          offset: [0, 0, 0],
          animation: {
            playerId: 'p1',
            fromCell: 30,
            waypoints: [10],
            currentIndex: 0,
            isAnimating: true,
            isJailFlight: true,
            flightType: 'audit',
          },
          onComplete: vi.fn(),
        })
      );

      expect(markup).toBeDefined();
      expect(markup).toContain('thematic-transport-vehicle');
    });

    it('[TC-454.05c/MSS][UC-ANIMATOR-NEON-PURGE-ON-FLIGHT/MSS] hides SingleHopPawn visual mesh geometry during direct transport flight', () => {
      const player = createPlayer('p1');
      const markup = renderToStaticMarkup(
        React.createElement(ActiveSpringPawn, {
          player,
          color: '#EF4444',
          offset: [0, 0, 0],
          animation: {
            playerId: 'p1',
            fromCell: 30,
            waypoints: [10],
            currentIndex: 0,
            isAnimating: true,
            isJailFlight: true,
            flightType: 'audit',
          },
          onComplete: vi.fn(),
        })
      );

      expect(markup).toBeDefined();
      expect(markup).not.toContain('cylinderGeometry');
    });
  });

  describe('[TC-454.06/MSS] Relational Multi-Point Covariance Along Spatial Path', () => {
    it('[TC-454.06/MSS][UC-VEHICLE-RELATIONAL-COVARIANCE/MSS] distinct progress points produce spatially distinct positions with road distance >= 8.0m', () => {
      const p1 = calculateTransportVehicleTransform({ progress: 0.2, fromCell: 30, toCell: 10, flightType: 'audit' });
      const p2 = calculateTransportVehicleTransform({ progress: 0.8, fromCell: 30, toCell: 10, flightType: 'audit' });

      const dx = p1.position[0] - p2.position[0];
      const dz = p1.position[2] - p2.position[2];
      const horizontalDistance = Math.hypot(dx, dz);

      expect(p1.position).not.toEqual(p2.position);
      expect(horizontalDistance).toBeGreaterThanOrEqual(8.0);
    });
  });
});
