// [TC-IMP10.1/MSS] SoundEngine — WebAudio API Procedural Tactile Sound Synthesizer
// Lightweight (<50KB), zero MP3 dependency, real-time tactile acoustic feedback
import { useAudioStore } from '../store/audio_store';
import {
  synthesizeDiceRoll,
  synthesizeAuctionGavel,
  synthesizeConstructionSlam,
  synthesizeMoneyTransfer,
  synthesizePawnStep,
  createOceanAmbientGraph,
  synthesizeJazzLoungeChords,
  synthesizeCardFlip,
  synthesizeCoronationChime,
  synthesizeLighthouseFoghorn,
  synthesizeCarHorn,
  synthesizeWaterSplash,
} from './sound_synth_recipes';
import {
  synthesizeHeartbeatPulse,
  synthesizeVictoryChime,
  synthesizeSlumpThud,
  synthesizeMonopolyFanfare,
} from './pawn_tension_sound_recipes';

type AudioContextClass = typeof AudioContext;

function resolveAudioContext(): AudioContextClass | null {
  if (typeof window !== 'undefined') {
    const ctx = window.AudioContext || window.webkitAudioContext;
    if (ctx) return ctx;
  }
  if (typeof globalThis !== 'undefined' && 'AudioContext' in globalThis) {
    return globalThis.AudioContext;
  }
  return null;
}

export class SoundEngineImpl {
  private ctx: AudioContext | null = null;
  public masterGain: GainNode | null = null;
  public sfxBus: GainNode | null = null;
  public bgmBus: GainNode | null = null;
  private unsubscribeStore: (() => void) | null = null;
  private lastGavelTime = 0;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private oceanAmbientNodes: {
    source: AudioBufferSourceNode;
    filter: BiquadFilterNode;
    gain: GainNode;
    lfo?: OscillatorNode;
  } | null = null;

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

  private initAudioGraph(context: AudioContext): void {
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

  private getEffectiveSfxVolume(): number {
    const { isMuted, masterVolume, sfxVolume } = useAudioStore.getState();
    return isMuted ? 0 : Math.max(0, Math.min(1, masterVolume * sfxVolume));
  }

  private getEffectiveBgmVolume(): number {
    const { isMuted, masterVolume, bgmVolume } = useAudioStore.getState();
    return isMuted ? 0 : Math.max(0, Math.min(1, masterVolume * bgmVolume));
  }

  public playDiceRoll(): void {
    const context = this.getContext();
    const volume = this.getEffectiveSfxVolume();
    if (!context || volume <= 0) return;
    void this.resumeAudioContext();
    const dest = this.sfxBus ?? context.destination;
    synthesizeDiceRoll(context, dest, volume);
  }

  public playAuctionGavel(): void {
    const context = this.getContext();
    const volume = this.getEffectiveSfxVolume();
    if (!context || volume <= 0) return;

    // Debounce 100ms tránh kích hoạt kép khi cả Modal và 3D Stage cùng bắt sự kiện đặt giá
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (now - this.lastGavelTime < 100) return;
    this.lastGavelTime = now;

    void this.resumeAudioContext();
    const dest = this.sfxBus ?? context.destination;
    synthesizeAuctionGavel(context, dest, volume);
  }

  public playConstructionSlam(): void {
    const context = this.getContext();
    const volume = this.getEffectiveSfxVolume();
    if (!context || volume <= 0) return;
    void this.resumeAudioContext();
    const dest = this.sfxBus ?? context.destination;
    synthesizeConstructionSlam(context, dest, volume);
  }

  public playMoneyTransfer(): void {
    const context = this.getContext();
    const volume = this.getEffectiveSfxVolume();
    if (!context || volume <= 0) return;
    void this.resumeAudioContext();
    const dest = this.sfxBus ?? context.destination;
    synthesizeMoneyTransfer(context, dest, volume);
  }

  public playPawnStep(pitchVariation = 1.0): void {
    const context = this.getContext();
    const volume = this.getEffectiveSfxVolume();
    if (!context || volume <= 0) return;
    void this.resumeAudioContext();
    const dest = this.sfxBus ?? context.destination;
    synthesizePawnStep(context, dest, volume, pitchVariation);
  }

  public playPenthouseOceanAmbient(): void {
    if (this.oceanAmbientNodes) return;
    const context = this.getContext();
    const volume = this.getEffectiveBgmVolume();
    if (!context) return;
    void this.resumeAudioContext();

    try {
      const dest = this.bgmBus ?? context.destination;
      this.oceanAmbientNodes = createOceanAmbientGraph(context, dest, volume);
    } catch {
      // Fallback an toàn khi WebAudio bị giới hạn
    }
  }

  public stopPenthouseOceanAmbient(): void {
    if (!this.oceanAmbientNodes) return;
    const context = this.getContext();
    const { source, gain, lfo } = this.oceanAmbientNodes;
    this.oceanAmbientNodes = null;

    if (context && gain) {
      try {
        const now = context.currentTime;
        const currentGainVal = gain.gain.value;
        gain.gain.setValueAtTime(Math.max(0.0001, currentGainVal), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
        setTimeout(() => {
          try {
            source.stop();
            lfo?.stop();
            source.disconnect();
            gain.disconnect();
          } catch {
            // Safe teardown
          }
        }, 1050);
      } catch {
        // Safe fallback
      }
    }
  }

  public playJazzLoungeChords(): void {
    const context = this.getContext();
    const volume = this.getEffectiveBgmVolume();
    if (!context || volume <= 0) return;
    void this.resumeAudioContext();
    const dest = this.bgmBus ?? context.destination;
    synthesizeJazzLoungeChords(context, dest, volume);
  }

  public playCardFlip(): void {
    const context = this.getContext();
    const volume = this.getEffectiveSfxVolume();
    if (!context || volume <= 0) return;
    void this.resumeAudioContext();
    const dest = this.sfxBus ?? context.destination;
    synthesizeCardFlip(context, dest, volume);
  }

  public playCoronationChime(): void {
    const context = this.getContext();
    const volume = this.getEffectiveSfxVolume();
    if (!context || volume <= 0) return;
    void this.resumeAudioContext();
    const dest = this.sfxBus ?? context.destination;
    synthesizeCoronationChime(context, dest, volume);
  }

  public playLighthouseHorn(): void {
    try {
      const context = this.getContext();
      const volume = this.getEffectiveSfxVolume();
      if (!context || volume <= 0) return;
      void this.resumeAudioContext();
      const dest = this.sfxBus ?? context.destination;
      synthesizeLighthouseFoghorn(context, dest, volume);
    } catch {
      // Safe fallback
    }
  }

  public playCarHorn(): void {
    try {
      const context = this.getContext();
      const volume = this.getEffectiveSfxVolume();
      if (!context || volume <= 0) return;
      void this.resumeAudioContext();
      const dest = this.sfxBus ?? context.destination;
      synthesizeCarHorn(context, dest, volume);
    } catch {
      // Safe fallback
    }
  }

  public playWaterRipple(): void {
    try {
      const context = this.getContext();
      const volume = this.getEffectiveSfxVolume();
      if (!context || volume <= 0) return;
      void this.resumeAudioContext();
      const dest = this.sfxBus ?? context.destination;
      synthesizeWaterSplash(context, dest, volume);
    } catch {
      // Safe fallback
    }
  }

  public playHeartbeatPulse(): void {
    try {
      const context = this.getContext();
      const volume = this.getEffectiveSfxVolume();
      if (!context || volume <= 0) return;
      void this.resumeAudioContext();
      const dest = this.sfxBus ?? context.destination;
      synthesizeHeartbeatPulse(context, dest, volume);

      if (this.heartbeatInterval) return;
      this.heartbeatInterval = setInterval(() => {
        try {
          const ctx = this.getContext();
          const curVol = this.getEffectiveSfxVolume();
          if (!ctx || curVol <= 0) {
            this.stopHeartbeatPulse();
            return;
          }
          const d = this.sfxBus ?? ctx.destination;
          synthesizeHeartbeatPulse(ctx, d, curVol);
        } catch {
          this.stopHeartbeatPulse();
        }
      }, 400);
    } catch {
      // Safe fallback
    }
  }

  public stopHeartbeatPulse(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  public playVictoryChime(): void {
    try {
      const context = this.getContext();
      const volume = this.getEffectiveSfxVolume();
      if (!context || volume <= 0) return;
      void this.resumeAudioContext();
      const dest = this.sfxBus ?? context.destination;
      synthesizeVictoryChime(context, dest, volume);
    } catch {
      // Safe fallback
    }
  }

  public playSlumpThud(): void {
    try {
      const context = this.getContext();
      const volume = this.getEffectiveSfxVolume();
      if (!context || volume <= 0) return;
      void this.resumeAudioContext();
      const dest = this.sfxBus ?? context.destination;
      synthesizeSlumpThud(context, dest, volume);
    } catch {
      // Safe fallback
    }
  }

  public playMonopolyFanfare(): void {
    try {
      if (useAudioStore.getState().isMuted) return;
      const context = this.getContext();
      if (!context) return;
      void this.resumeAudioContext();
      synthesizeMonopolyFanfare(context, this.masterGain ?? context.destination, 0.8);
    } catch {
      // Safe fallback
    }
  }

  public stopAll(): void {
    this.stopPenthouseOceanAmbient();
    this.stopHeartbeatPulse();
  }

  public dispose(): void {
    this.stopAll();
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

export const SoundEngine = new SoundEngineImpl();
