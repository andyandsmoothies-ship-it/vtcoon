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

import { SoundEngineContextManager, resolveAudioContext } from './sound_engine_context.js';

export { SoundEngineContextManager, resolveAudioContext };

export class SoundEngineImpl extends SoundEngineContextManager {
  private lastGavelTime = 0;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private oceanAmbientNodes: {
    source: AudioBufferSourceNode;
    filter: BiquadFilterNode;
    gain: GainNode;
    lfo?: OscillatorNode;
  } | null = null;

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
    this.disposeContext();
  }
}

export const SoundEngine = new SoundEngineImpl();
