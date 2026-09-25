// [UI-S01/MSS][UI-S04/MSS] EnvironmentStore — Dynamic Time-of-Day System (Day, Sunset, Neon Night)
import { create } from 'zustand';

export type TimeOfDayPhase = 'day' | 'sunset' | 'night';
export type TimeOfDayMode = 'auto' | 'day' | 'sunset' | 'night';

export interface LightingPreset {
  readonly sunPosition: [number, number, number];
  readonly sunColor: string;
  readonly sunIntensity: number;
  readonly ambientColor: string;
  readonly ambientIntensity: number;
  readonly hemiSkyColor: string;
  readonly hemiGroundColor: string;
  readonly hemiIntensity: number;
  readonly skyColor: string;
  readonly fogColor: string;
  readonly fogNear: number;
  readonly fogFar: number;
}

export const TIME_OF_DAY_PRESETS: Record<TimeOfDayPhase, LightingPreset> = {
  day: {
    sunPosition: [-22, 36, 20],
    sunColor: '#FFFDF5',
    sunIntensity: 0.80,
    ambientColor: '#F0F9FF',
    ambientIntensity: 0.20,
    hemiSkyColor: '#BAE6FD',
    hemiGroundColor: '#DCFCE7',
    hemiIntensity: 0.14,

    skyColor: '#7DD3FC',
    fogColor: '#BAE6FD',
    fogNear: 85,
    fogFar: 260,
  },
  sunset: {
    sunPosition: [-28, 24, 18],
    sunColor: '#FDE047',
    sunIntensity: 0.95,
    ambientColor: '#FEF3C7',
    ambientIntensity: 0.28,
    hemiSkyColor: '#FB923C',
    hemiGroundColor: '#9A3412',
    hemiIntensity: 0.24,
    skyColor: '#EA580C',
    fogColor: '#FDBA74',
    fogNear: 80,
    fogFar: 250,
  },
  night: {
    sunPosition: [18, 32, -20],
    sunColor: '#93C5FD',
    sunIntensity: 0.65,
    ambientColor: '#38BDF8',
    ambientIntensity: 0.40,
    hemiSkyColor: '#1E293B',
    hemiGroundColor: '#0369A1',
    hemiIntensity: 0.26,
    skyColor: '#0C1527',
    fogColor: '#0F172A',
    fogNear: 75,
    fogFar: 240,
  },
};

export const AUTO_CYCLE_DURATION_SECONDS = 90;

export function calculatePhaseFromProgress(progress: number): TimeOfDayPhase {
  if (!Number.isFinite(progress)) return 'day';
  let normalized = progress % 1;
  if (normalized < 0) normalized += 1;
  normalized = Math.round(normalized * 1e6) / 1e6;
  if (normalized < 0.42) return 'day';
  if (normalized < 0.58) return 'sunset';
  if (normalized < 0.92) return 'night';
  return 'day'; // Dawn / Sunrise back to Day
}

export function getNextTimeOfDayMode(currentMode: TimeOfDayMode): TimeOfDayMode {
  switch (currentMode) {
    case 'auto': return 'day';
    case 'day': return 'sunset';
    case 'sunset': return 'night';
    case 'night': return 'auto';
    default: return 'auto';
  }
}

export function calculateAviationStrobe(time: number, freq: number = 1.2): boolean {
  if (!Number.isFinite(time)) return false;
  const cycle = ((time * freq) % 1 + 1) % 1;
  return cycle < 0.2;
}

export function calculateLaserRotation(time: number, speed: number = 0.5): number {
  if (!Number.isFinite(time)) return 0;
  return time * speed;
}

export interface EnvironmentState {
  readonly mode: TimeOfDayMode;
  readonly phase: TimeOfDayPhase;
  readonly isAuto: boolean;

  setMode: (mode: TimeOfDayMode) => void;
  setPhase: (phase: TimeOfDayPhase) => void;
  toggleNextMode: () => void;
}

export const useEnvironmentStore = create<EnvironmentState>((set, get) => ({
  mode: 'auto',
  phase: 'day',
  isAuto: true,

  setMode: (mode) => {
    if (mode === 'auto') {
      set({ mode: 'auto', isAuto: true });
    } else {
      set({ mode, phase: mode, isAuto: false });
    }
  },

  setPhase: (phase) => {
    set({ phase });
  },

  toggleNextMode: () => {
    const nextMode = getNextTimeOfDayMode(get().mode);
    get().setMode(nextMode);
  },
}));
