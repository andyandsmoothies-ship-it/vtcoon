// [UI-S04/MSS][UI-S05/MSS] VFXStore — Construction Slam, Camera Screen Shake & Celebration Particle Triggers
import { create } from 'zustand';

export interface ActiveSlam {
  readonly id: string;
  readonly cellIndex: number;
  readonly level: 1 | 2 | 3;
  readonly startTime: number;
  readonly durationMs: number;
  readonly impactTimeMs: number;
}

export interface ScreenShakeState {
  readonly startTime: number;
  readonly durationMs: number;
  readonly intensity: number;
}

export interface VfxState {
  readonly activeSlams: Record<number, ActiveSlam>;
  readonly activeScreenShake: ScreenShakeState | null;

  triggerConstructionSlam: (cellIndex: number, level?: 1 | 2 | 3) => void;
  removeSlam: (cellIndex: number) => void;
  clearAllSlams: () => void;
  triggerScreenShake: (intensity?: number, durationMs?: number) => void;
  clearScreenShake: () => void;
}

export const SLAM_DEFAULT_DURATION_MS = 1500;
export const SLAM_IMPACT_DELAY_MS = 380;

export const useVfxStore = create<VfxState>((set, get) => ({
  activeSlams: {},
  activeScreenShake: null,

  triggerConstructionSlam: (cellIndex, level = 3) => {
    const now = Date.now();
    const id = `slam_${cellIndex}_${now}`;
    const newSlam: ActiveSlam = {
      id,
      cellIndex,
      level,
      startTime: now,
      durationMs: SLAM_DEFAULT_DURATION_MS,
      impactTimeMs: SLAM_IMPACT_DELAY_MS,
    };

    set((state) => ({
      activeSlams: {
        ...state.activeSlams,
        [cellIndex]: newSlam,
      },
    }));

    // Tự động kích hoạt rung chấn màn hình vi mô tại thời điểm công trình va đập mặt đất
    const intensity = level === 3 ? 0.32 : level === 2 ? 0.18 : 0.12;
    const shakeDuration = level === 3 ? 380 : level === 2 ? 280 : 220;

    if (typeof setTimeout !== 'undefined') {
      setTimeout(() => {
        const cur = get().activeSlams[cellIndex];
        if (cur && cur.id === id) {
          get().triggerScreenShake(intensity, shakeDuration);
        }
      }, SLAM_IMPACT_DELAY_MS);

      // Tự động dọn dẹp sau khi chu kỳ hiệu ứng kết thúc
      setTimeout(() => {
        const cur = get().activeSlams[cellIndex];
        if (cur && cur.id === id) {
          get().removeSlam(cellIndex);
        }
      }, SLAM_DEFAULT_DURATION_MS);
    }
  },

  removeSlam: (cellIndex) =>
    set((state) => {
      if (!state.activeSlams[cellIndex]) return state;
      const next = { ...state.activeSlams };
      delete next[cellIndex];
      return { activeSlams: next };
    }),

  clearAllSlams: () => set({ activeSlams: {} }),

  triggerScreenShake: (intensity = 0.28, durationMs = 350) => {
    const startTime = Date.now();
    set({
      activeScreenShake: {
        startTime,
        durationMs,
        intensity,
      },
    });

    if (typeof setTimeout !== 'undefined') {
      setTimeout(() => {
        const cur = get().activeScreenShake;
        if (cur && cur.startTime === startTime) {
          get().clearScreenShake();
        }
      }, durationMs);
    }
  },

  clearScreenShake: () => set({ activeScreenShake: null }),
}));

declare global {
  interface Window {
    __vfxStore?: typeof useVfxStore;
  }
}

if (typeof window !== 'undefined') {
  window.__vfxStore = useVfxStore;
}
