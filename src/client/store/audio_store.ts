// [UI-S05/MSS] AudioStore — Zustand store for master, BGM, SFX volume & mute state
import { create } from 'zustand';
import { BGMTrack } from '../audio/audio_types';

function clampVolume(vol: number): number {
  if (Number.isNaN(vol)) return 0;
  return Math.max(0, Math.min(1, vol));
}

export interface AudioState {
  masterVolume: number;
  bgmVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  currentBgmTrack: BGMTrack | null;
  setMasterVolume: (volume: number) => void;
  setBgmVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  toggleMute: () => void;
  setIsMuted: (isMuted: boolean) => void;
  setCurrentBgmTrack: (track: BGMTrack | null) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  masterVolume: 0.8,
  bgmVolume: 0.6,
  sfxVolume: 0.8,
  isMuted: false,
  currentBgmTrack: null,
  setMasterVolume: (volume) => set({ masterVolume: clampVolume(volume) }),
  setBgmVolume: (volume) => set({ bgmVolume: clampVolume(volume) }),
  setSfxVolume: (volume) => set({ sfxVolume: clampVolume(volume) }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setIsMuted: (isMuted) => set({ isMuted }),
  setCurrentBgmTrack: (currentBgmTrack) => set({ currentBgmTrack }),
}));
