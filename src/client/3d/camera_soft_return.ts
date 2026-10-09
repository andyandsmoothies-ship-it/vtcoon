// [IMP-294] Camera Soft Return — Spherical Orbit Slerp & Break-on-Touch Kinematics
export interface SoftReturnState {
  readonly startPos: readonly [number, number, number];
  readonly startTarget: readonly [number, number, number];
  readonly destPos: readonly [number, number, number];
  readonly destTarget: readonly [number, number, number];
  readonly startTime: number;
  readonly durationMs: number;
}

export interface SoftReturnSample {
  readonly position: [number, number, number];
  readonly target: [number, number, number];
  readonly isFinished: boolean;
}

export const DEFAULT_FALLBACK_POS: readonly [number, number, number] = [24.6, 25.3, 24.6];
export const DEFAULT_FALLBACK_TARGET: readonly [number, number, number] = [2.2, 0.0, 2.2];

export function initSoftReturn(
  startPos: readonly [number, number, number],
  startTarget: readonly [number, number, number],
  destPos: readonly [number, number, number],
  destTarget: readonly [number, number, number],
  startTime: number,
  durationMs: number = 1200
): SoftReturnState {
  return {
    startPos: [startPos[0], startPos[1], startPos[2]],
    startTarget: [startTarget[0], startTarget[1], startTarget[2]],
    destPos: [destPos[0], destPos[1], destPos[2]],
    destTarget: [destTarget[0], destTarget[1], destTarget[2]],
    startTime,
    durationMs: durationMs > 0 ? durationMs : 1200,
  };
}

export function shouldBreakOnTouch(isInteracting: boolean, isResetting: boolean): boolean {
  return isInteracting && isResetting;
}

export function sampleSoftReturn(state: SoftReturnState, now: number): SoftReturnSample {
  const safeDestPos: [number, number, number] = [
    Number.isFinite(state.destPos[0]) ? state.destPos[0] : DEFAULT_FALLBACK_POS[0],
    Number.isFinite(state.destPos[1]) ? state.destPos[1] : DEFAULT_FALLBACK_POS[1],
    Number.isFinite(state.destPos[2]) ? state.destPos[2] : DEFAULT_FALLBACK_POS[2],
  ];
  const safeDestTarget: [number, number, number] = [
    Number.isFinite(state.destTarget[0]) ? state.destTarget[0] : DEFAULT_FALLBACK_TARGET[0],
    Number.isFinite(state.destTarget[1]) ? state.destTarget[1] : DEFAULT_FALLBACK_TARGET[1],
    Number.isFinite(state.destTarget[2]) ? state.destTarget[2] : DEFAULT_FALLBACK_TARGET[2],
  ];

  const hasInvalidCoord =
    !Number.isFinite(state.startPos[0]) || !Number.isFinite(state.startPos[1]) || !Number.isFinite(state.startPos[2]) ||
    !Number.isFinite(state.startTarget[0]) || !Number.isFinite(state.startTarget[1]) || !Number.isFinite(state.startTarget[2]) ||
    !Number.isFinite(state.destPos[0]) || !Number.isFinite(state.destPos[1]) || !Number.isFinite(state.destPos[2]) ||
    !Number.isFinite(state.destTarget[0]) || !Number.isFinite(state.destTarget[1]) || !Number.isFinite(state.destTarget[2]) ||
    !Number.isFinite(state.startTime) || !Number.isFinite(now);

  if (hasInvalidCoord) {
    return {
      position: safeDestPos,
      target: safeDestTarget,
      isFinished: false,
    };
  }

  const safeStartPos: [number, number, number] = [state.startPos[0], state.startPos[1], state.startPos[2]];
  const safeStartTarget: [number, number, number] = [state.startTarget[0], state.startTarget[1], state.startTarget[2]];
  const duration = state.durationMs > 0 ? state.durationMs : 1200;
  const elapsed = Math.max(0, now - state.startTime);
  const tau = Math.min(1, elapsed / duration);

  if (tau >= 1.0) {
    return {
      position: safeDestPos,
      target: safeDestTarget,
      isFinished: true,
    };
  }

  const u = 1 - Math.pow(1 - tau, 3);
  const tx = safeStartTarget[0] + (safeDestTarget[0] - safeStartTarget[0]) * u;
  const ty = safeStartTarget[1] + (safeDestTarget[1] - safeStartTarget[1]) * u;
  const tz = safeStartTarget[2] + (safeDestTarget[2] - safeStartTarget[2]) * u;

  const vx0 = safeStartPos[0] - safeStartTarget[0];
  const vy0 = safeStartPos[1] - safeStartTarget[1];
  const vz0 = safeStartPos[2] - safeStartTarget[2];
  const vx1 = safeDestPos[0] - safeDestTarget[0];
  const vy1 = safeDestPos[1] - safeDestTarget[1];
  const vz1 = safeDestPos[2] - safeDestTarget[2];

  const r0 = Math.hypot(vx0, vy0, vz0);
  const r1 = Math.hypot(vx1, vy1, vz1);
  if (r0 < 0.1 || r1 < 0.1 || !Number.isFinite(r0) || !Number.isFinite(r1)) {
    return {
      position: [
        Number.isFinite(safeStartPos[0] + (safeDestPos[0] - safeStartPos[0]) * u) ? safeStartPos[0] + (safeDestPos[0] - safeStartPos[0]) * u : safeDestPos[0],
        Number.isFinite(safeStartPos[1] + (safeDestPos[1] - safeStartPos[1]) * u) ? safeStartPos[1] + (safeDestPos[1] - safeStartPos[1]) * u : safeDestPos[1],
        Number.isFinite(safeStartPos[2] + (safeDestPos[2] - safeStartPos[2]) * u) ? safeStartPos[2] + (safeDestPos[2] - safeStartPos[2]) * u : safeDestPos[2],
      ],
      target: [
        Number.isFinite(tx) ? tx : safeDestTarget[0],
        Number.isFinite(ty) ? ty : safeDestTarget[1],
        Number.isFinite(tz) ? tz : safeDestTarget[2],
      ],
      isFinished: false,
    };
  }

  const phi0 = Math.acos(Math.max(-1, Math.min(1, vy0 / r0)));
  const theta0 = Math.atan2(vz0, vx0);
  const phi1 = Math.acos(Math.max(-1, Math.min(1, vy1 / r1)));
  const theta1 = Math.atan2(vz1, vx1);

  let dTheta = theta1 - theta0;
  while (dTheta > Math.PI) dTheta -= 2 * Math.PI;
  while (dTheta < -Math.PI) dTheta += 2 * Math.PI;

  const currentR = r0 + (r1 - r0) * u;
  const currentPhi = Math.max(0.02, Math.min(Math.PI - 0.02, phi0 + (phi1 - phi0) * u));
  const currentTheta = theta0 + dTheta * u;

  const sinPhi = Math.sin(currentPhi);
  const cosPhi = Math.cos(currentPhi);
  const cx = tx + currentR * sinPhi * Math.cos(currentTheta);
  const cy = ty + currentR * cosPhi;
  const cz = tz + currentR * sinPhi * Math.sin(currentTheta);

  return {
    position: [
      Number.isFinite(cx) ? cx : safeDestPos[0],
      Number.isFinite(cy) ? cy : safeDestPos[1],
      Number.isFinite(cz) ? cz : safeDestPos[2],
    ],
    target: [
      Number.isFinite(tx) ? tx : safeDestTarget[0],
      Number.isFinite(ty) ? ty : safeDestTarget[1],
      Number.isFinite(tz) ? tz : safeDestTarget[2],
    ],
    isFinished: false,
  };
}
