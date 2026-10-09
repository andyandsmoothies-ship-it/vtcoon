// [IMP-299] SoundEngine Web Audio Context & Bus Graph Manager
import { useAudioStore } from '../store/audio_store.js';

export type AudioContextClass = typeof AudioContext;

export function resolveAudioContext(): AudioContextClass | null {
  if (typeof window !== 'undefined') {
    const ctx = window.AudioContext || window.webkitAudioContext;
    if (ctx) return ctx;
  }
  if (typeof globalThis !== 'undefined' && 'AudioContext' in globalThis && globalThis.AudioContext) {
    return globalThis.AudioContext;
  }
  return null;
}

export class SoundEngineContextManager {
  protected ctx: AudioContext | null = null;
  public masterGain: GainNode | null = null;
  public sfxBus: GainNode | null = null;
  public bgmBus: GainNode | null = null;
  private unsubscribeStore: (() => void) | null = null;

  public getContext(): AudioContext | null {
    if (!this.ctx) {
      const CtxClass = resolveAudioContext();
      if (CtxClass) {
        try {
          this.ctx = new CtxClass();
          this.initAudioGraph(this.ctx);
        } catch {
          this.ctx = null;
        }
      }
    }
    return this.ctx;
  }

  protected initAudioGraph(context: AudioContext): void {
    try {
      this.masterGain = context.createGain();
      this.sfxBus = context.createGain();
      this.bgmBus = context.createGain();

      this.sfxBus.connect(this.masterGain);
      this.bgmBus.connect(this.masterGain);
      this.masterGain.connect(context.destination);

      this.syncVolumesWithStore(context.currentTime);

      if (!this.unsubscribeStore) {
        this.unsubscribeStore = useAudioStore.subscribe(() => {
          if (this.ctx) {
            this.syncVolumesWithStore(this.ctx.currentTime);
          }
        });
      }
    } catch {
      // Safe fallback in restricted environments
    }
  }

  public syncVolumesWithStore(atTime?: number): void {
    const { isMuted, masterVolume, sfxVolume, bgmVolume } = useAudioStore.getState();
    const t = atTime ?? this.ctx?.currentTime ?? 0;

    if (this.masterGain) {
      const effectiveMaster = isMuted ? 0 : Math.max(0, Math.min(1, masterVolume));
      this.masterGain.gain.setValueAtTime(effectiveMaster, t);
    }
    if (this.sfxBus) {
      const effectiveSfx = Math.max(0, Math.min(1, sfxVolume));
      this.sfxBus.gain.setValueAtTime(effectiveSfx, t);
    }
    if (this.bgmBus) {
      const effectiveBgm = Math.max(0, Math.min(1, bgmVolume));
      this.bgmBus.gain.setValueAtTime(effectiveBgm, t);
    }
  }

  public async resumeAudioContext(): Promise<void> {
    const context = this.getContext();
    if (context && context.state === 'suspended') {
      try {
        await context.resume();
      } catch {
        // Fallback im lặng khi trình duyệt chặn tương tác
      }
    }
  }

  public getEffectiveSfxVolume(): number {
    const { isMuted, masterVolume, sfxVolume } = useAudioStore.getState();
    return isMuted ? 0 : Math.max(0, Math.min(1, masterVolume * sfxVolume));
  }

  public getEffectiveBgmVolume(): number {
    const { isMuted, masterVolume, bgmVolume } = useAudioStore.getState();
    return isMuted ? 0 : Math.max(0, Math.min(1, masterVolume * bgmVolume));
  }

  public disposeContext(): void {
    if (this.unsubscribeStore) {
      this.unsubscribeStore();
      this.unsubscribeStore = null;
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        void this.ctx.close();
      } catch {
        // Safe close
      }
    }
    this.ctx = null;
    this.masterGain = null;
    this.sfxBus = null;
    this.bgmBus = null;
  }
}
