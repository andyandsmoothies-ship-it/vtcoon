// [IMP-454] Pure View-Model Calculation Seam for Thematic Transport Vehicles
import { cellPosition } from './board_coords.js';

export interface TransportVehicleTransform {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  sirenActive?: 'red' | 'blue';
}

export interface TransportCalcParams {
  progress: number;
  fromCell: number;
  toCell: number;
  flightType: 'audit' | 'transit' | 'event';
  timestampMs?: number;
}

export function resolveSirenPhase(timestampMs: number = 0): 'red' | 'blue' {
  const periodMs = 200; // 5 Hz
  const phase = Math.floor(Math.max(0, timestampMs) / (periodMs / 2)) % 2;
  return phase === 0 ? 'red' : 'blue';
}

export function calculateTransportVehicleTransform(
  params: TransportCalcParams
): TransportVehicleTransform {
  const t = Math.max(0, Math.min(1, params.progress));

  if (params.flightType === 'audit') {
    // Dynamic Police cruiser perimeter road pathing to Jail (Cell 10 [-9, 0, 9])
    const from = Number.isFinite(params.fromCell)
      ? ((Math.floor(params.fromCell as number) % 40) + 40) % 40
      : 30;
    const fromSide = Math.floor(from / 10);
    const R = 1.5;
    const groundY = 0.04;
    let x = 9.0;
    let z = 9.0;
    let yaw = 0.0;

    if (fromSide === 0) {
      // Side 0 (South edge, cells 0..9, e.g. Chance tile 7):
      // Direct single leg heading West to Cell 10 [-9, 0, 9] along z = 9.0
      const pStart = cellPosition(from);
      x = pStart[0] + t * (-9.0 - pStart[0]);
      z = 9.0;
      yaw = -Math.PI / 2;
    } else if (fromSide === 1) {
      // Side 1 (West edge, cells 10..19):
      // Direct single leg heading South to Cell 10 [-9, 0, 9] along x = -9.0
      const pStart = cellPosition(from);
      x = -9.0;
      z = pStart[2] + t * (9.0 - pStart[2]);
      yaw = 0.0;
    } else if (fromSide === 2) {
      // Side 2 (North edge, cells 20..29, e.g. Chance tile 22):
      // Leg 1 (West along z = -9.0 to Cell 20) -> Corner arc at Cell 20 [-9, -9] -> Leg 2 (South along x = -9.0 to Cell 10)
      const startX = cellPosition(from)[0];
      if (t <= 0.42) {
        const u = t / 0.42;
        x = startX + u * (-7.5 - startX);
        z = -9.0;
        yaw = -Math.PI / 2;
      } else if (t <= 0.58) {
        // Corner sweep around [-7.5, -7.5]
        const s = (t - 0.42) / 0.16;
        const angle = s * (Math.PI / 2);
        x = -7.5 - R * Math.sin(angle);
        z = -7.5 - R * Math.cos(angle);
        yaw = -Math.PI / 2 + angle;
      } else {
        const v = (t - 0.58) / 0.42;
        x = -9.0;
        z = -7.5 + v * 16.5;
        yaw = 0.0;
      }
    } else {
      // Side 3 (East edge, cells 30..39, e.g. Go to Jail 30, Chance tile 36):
      // Leg 1 (South along x = 9.0 to Cell 0) -> Corner arc at Cell 0 [9, 9] -> Leg 2 (West along z = 9.0 to Cell 10)
      const zStart = from === 30 ? -9.0 : cellPosition(from)[2];
      if (t <= 0.42) {
        const u = t / 0.42;
        x = 9.0;
        z = zStart + u * (7.5 - zStart);
        yaw = 0.0;
      } else if (t <= 0.58) {
        const s = (t - 0.42) / 0.16;
        const angle = s * (Math.PI / 2);
        x = 7.5 + R * Math.cos(angle);
        z = 7.5 + R * Math.sin(angle);
        yaw = -angle;
      } else {
        const v = (t - 0.58) / 0.42;
        x = 7.5 - v * 16.5;
        z = 9.0;
        yaw = -Math.PI / 2;
      }
    }

    return {
      position: [x, groundY, z],
      rotation: [0, yaw, 0],
      scale: [1, 1, 1],
      sirenActive: resolveSirenPhase(params.timestampMs ?? 0),
    };
  }

  // Civilian Airliner (transit / event) 3D parabolic flight
  const p1 = cellPosition(params.fromCell);
  const p2 = cellPosition(params.toCell);

  const x = p1[0] + t * (p2[0] - p1[0]);
  const z = p1[2] + t * (p2[2] - p1[2]);
  const peakHeight = 2.8;
  const y = p1[1] + 4 * peakHeight * t * (1 - t);

  const dx = p2[0] - p1[0];
  const dz = p2[2] - p1[2];
  const yaw = Math.atan2(dx, dz);

  // Pitch: nose-up on takeoff, nose-down on landing
  const pitch = 0.4 * (1 - 2 * t);
  // Roll: gentle banking into turn
  const roll = 0.12 * Math.sin(Math.PI * t);

  return {
    position: [x, y, z],
    rotation: [pitch, yaw, roll],
    scale: [1, 1, 1],
    // sirenActive is intentionally undefined for civilian airliner
  };
}
