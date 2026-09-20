// [UI-S02/MSS][IMP-134] Diorama Model Train Kinematics, Rail Curve & Station Schedules
import { CatmullRomCurve3, Vector3 } from 'three';

export interface TrainKinematicState {
  readonly progress: number;
  readonly speed: number;
  readonly isStopped: boolean;
  readonly currentStation: string | null;
}

export const TRAIN_CONFIG = {
  CARRIAGE_OFFSETS: [0, 0.85, 1.70] as const,
  DWELL_DURATION: 3.5,
  STATION_DWELL_SECONDS: 3.5,
  SOUTH_STATION_PROGRESS: 0.12,
  NORTH_STATION_PROGRESS: 0.62,
  CRUISING_SPEED: 1.2,
  DECEL_ZONE: 0.035,
  ACCEL_ZONE: 0.035,
} as const;

export const TRAIN_CARRIAGE_OFFSETS = TRAIN_CONFIG.CARRIAGE_OFFSETS;
export const STATION_DWELL_SECONDS = TRAIN_CONFIG.STATION_DWELL_SECONDS;
export const STATION_STOP_DURATION = TRAIN_CONFIG.STATION_DWELL_SECONDS;
export const SOUTH_STATION_PROGRESS = TRAIN_CONFIG.SOUTH_STATION_PROGRESS;
export const NORTH_STATION_PROGRESS = TRAIN_CONFIG.NORTH_STATION_PROGRESS;

const TRACK_POINTS: readonly Vector3[] = [
  new Vector3(4.9, 0.032, 6.9),
  new Vector3(0, 0.032, 6.9),
  new Vector3(-1.6, 0.032, 6.9),
  new Vector3(-6.1, 0.032, 6.9),
  new Vector3(-6.8, 0.032, 6.8),
  new Vector3(-6.9, 0.032, 6.1),
  new Vector3(-6.9, 0.032, 0),
  new Vector3(-6.9, 0.032, -6.1),
  new Vector3(-6.8, 0.032, -6.8),
  new Vector3(-6.1, 0.032, -6.9),
  new Vector3(0, 0.032, -6.9),
  new Vector3(1.6, 0.032, -6.9),
  new Vector3(6.1, 0.032, -6.9),
  new Vector3(6.8, 0.032, -6.8),
  new Vector3(6.9, 0.032, -6.1),
  new Vector3(6.9, 0.032, 0),
  new Vector3(6.9, 0.032, 6.1),
  new Vector3(6.8, 0.032, 6.8),
  new Vector3(6.1, 0.032, 6.9),
];

let cachedCurve: CatmullRomCurve3 | null = null;
let cachedPerimeter: number | null = null;

export function getRailroadTrackCurve(): CatmullRomCurve3 {
  if (!cachedCurve) {
    cachedCurve = new CatmullRomCurve3(TRACK_POINTS.map((p) => p.clone()), true, 'catmullrom', 0.15);
  }
  return cachedCurve;
}

export const createRailroadTrackCurve = getRailroadTrackCurve;

export function getRailroadTrackPerimeter(): number {
  if (cachedPerimeter === null) {
    cachedPerimeter = getRailroadTrackCurve().getLength();
  }
  return cachedPerimeter;
}

export function computeTrainYaw(tangent: { x: number; y?: number; z: number }): number {
  return Math.atan2(-tangent.z, tangent.x);
}

export const calculateTrainYaw = computeTrainYaw;

export function computeCarriageProgress(
  leadProgress: number,
  carriageOffsetMeters: number,
  trackLengthMeters: number
): number {
  if (trackLengthMeters <= 0) return leadProgress;
  const offsetProgress = carriageOffsetMeters / trackLengthMeters;
  return ((leadProgress - offsetProgress) % 1 + 1) % 1;
}

export const calculateCarriageProgress = computeCarriageProgress;

interface KinematicPhase {
  readonly tStart: number;
  readonly tEnd: number;
  readonly compute: (tMod: number) => TrainKinematicState;
}

function createKinematicSchedule(): {
  readonly phases: readonly KinematicPhase[];
  readonly totalCycle: number;
} {
  const L = getRailroadTrackPerimeter();
  const vProg = TRAIN_CONFIG.CRUISING_SPEED / L;
  const tDec = (TRAIN_CONFIG.DECEL_ZONE / vProg) * 2;
  const tAcc = (TRAIN_CONFIG.ACCEL_ZONE / vProg) * 2;
  const tDwell = TRAIN_CONFIG.STATION_DWELL_SECONDS;

  const t1 = (TRAIN_CONFIG.SOUTH_STATION_PROGRESS - TRAIN_CONFIG.DECEL_ZONE) / vProg;
  const t2 = t1 + tDec;
  const t3 = t2 + tDwell;
  const t4 = t3 + tAcc;

  const southAccEnd = TRAIN_CONFIG.SOUTH_STATION_PROGRESS + TRAIN_CONFIG.ACCEL_ZONE;
  const northDecStart = TRAIN_CONFIG.NORTH_STATION_PROGRESS - TRAIN_CONFIG.DECEL_ZONE;
  const t5 = t4 + (northDecStart - southAccEnd) / vProg;
  const t6 = t5 + tDec;
  const t7 = t6 + tDwell;
  const t8 = t7 + tAcc;

  const northAccEnd = TRAIN_CONFIG.NORTH_STATION_PROGRESS + TRAIN_CONFIG.ACCEL_ZONE;
  const t9 = t8 + (1.0 - northAccEnd) / vProg;

  const phases: readonly KinematicPhase[] = [
    {
      tStart: 0,
      tEnd: t1,
      compute: (t) => ({
        progress: t * vProg,
        speed: TRAIN_CONFIG.CRUISING_SPEED,
        isStopped: false,
        currentStation: null,
      }),
    },
    {
      tStart: t1,
      tEnd: t2,
      compute: (t) => {
        const u = (t - t1) / tDec;
        return {
          progress: northDecStart > 0 ? (TRAIN_CONFIG.SOUTH_STATION_PROGRESS - TRAIN_CONFIG.DECEL_ZONE) + TRAIN_CONFIG.DECEL_ZONE * (2 * u - u * u) : 0,
          speed: TRAIN_CONFIG.CRUISING_SPEED * (1 - u),
          isStopped: false,
          currentStation: null,
        };
      },
    },
    {
      tStart: t2,
      tEnd: t3,
      compute: () => ({
        progress: TRAIN_CONFIG.SOUTH_STATION_PROGRESS,
        speed: 0,
        isStopped: true,
        currentStation: 'Waterfront Central',
      }),
    },
    {
      tStart: t3,
      tEnd: t4,
      compute: (t) => {
        const u = (t - t3) / tAcc;
        return {
          progress: TRAIN_CONFIG.SOUTH_STATION_PROGRESS + TRAIN_CONFIG.ACCEL_ZONE * (u * u),
          speed: TRAIN_CONFIG.CRUISING_SPEED * u,
          isStopped: false,
          currentStation: null,
        };
      },
    },
    {
      tStart: t4,
      tEnd: t5,
      compute: (t) => ({
        progress: southAccEnd + (t - t4) * vProg,
        speed: TRAIN_CONFIG.CRUISING_SPEED,
        isStopped: false,
        currentStation: null,
      }),
    },
    {
      tStart: t5,
      tEnd: t6,
      compute: (t) => {
        const u = (t - t5) / tDec;
        return {
          progress: northDecStart + TRAIN_CONFIG.DECEL_ZONE * (2 * u - u * u),
          speed: TRAIN_CONFIG.CRUISING_SPEED * (1 - u),
          isStopped: false,
          currentStation: null,
        };
      },
    },
    {
      tStart: t6,
      tEnd: t7,
      compute: () => ({
        progress: TRAIN_CONFIG.NORTH_STATION_PROGRESS,
        speed: 0,
        isStopped: true,
        currentStation: 'Landmark Metro',
      }),
    },
    {
      tStart: t7,
      tEnd: t8,
      compute: (t) => {
        const u = (t - t7) / tAcc;
        return {
          progress: TRAIN_CONFIG.NORTH_STATION_PROGRESS + TRAIN_CONFIG.ACCEL_ZONE * (u * u),
          speed: TRAIN_CONFIG.CRUISING_SPEED * u,
          isStopped: false,
          currentStation: null,
        };
      },
    },
    {
      tStart: t8,
      tEnd: t9,
      compute: (t) => ({
        progress: (northAccEnd + (t - t8) * vProg) % 1,
        speed: TRAIN_CONFIG.CRUISING_SPEED,
        isStopped: false,
        currentStation: null,
      }),
    },
  ];

  return { phases, totalCycle: t9 };
}

let cachedSchedule: ReturnType<typeof createKinematicSchedule> | null = null;

function getKinematicSchedule() {
  if (!cachedSchedule) {
    cachedSchedule = createKinematicSchedule();
  }
  return cachedSchedule;
}

export function computeTrainKinematics(elapsedTime: number): TrainKinematicState {
  const { phases, totalCycle } = getKinematicSchedule();
  const tMod = ((elapsedTime % totalCycle) + totalCycle) % totalCycle;
  const fallbackPhase = phases[phases.length - 1] ?? phases[0];
  const activePhase = phases.find((p) => tMod >= p.tStart && tMod < p.tEnd) ?? fallbackPhase;
  if (!activePhase) {
    return {
      progress: 0,
      speed: TRAIN_CONFIG.CRUISING_SPEED,
      isStopped: false,
      currentStation: null,
    };
  }
  return activePhase.compute(tMod);
}

export const calculateTrainKinematics = computeTrainKinematics;
