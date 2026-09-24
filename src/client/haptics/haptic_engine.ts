// [IMP-189] Hybrid Haptics Engine — Android Mechanical & iOS Safari WebAudio Acoustic-Tactile Illusion
import { useAudioStore } from '../store/audio_store.js';
import { SoundEngine } from '../audio/sound_engine.js';


export const SELECTION = 15;
export const DICE_ROLL: number[] = [25, 30, 25];
export const TURN_ALERT: number[] = [40, 50, 40];
export const HEAVY_IMPACT: number[] = [70, 40, 110];

export const HAPTIC_PATTERNS = {
  SELECTION,
  DICE_ROLL,
  TURN_ALERT,
  HEAVY_IMPACT,
};

export type HapticPattern = number | number[];

export interface IHapticEngine {
  trigger(pattern: HapticPattern): void;
  selection(): void;
  diceRoll(): void;
  turnAlert(): void;
  heavyImpact(): void;
  playTactileClick(ctx?: AudioContext | null): void;
}

export class HapticEngineImpl implements IHapticEngine {
  public trigger(pattern: HapticPattern): void {
    const { hapticsEnabled } = useAudioStore.getState();
    if (!hapticsEnabled) return;

    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Fallback an toàn khi dính SecurityError trong iframe
      }
      return;
    }

    // Fallback sang WebAudio Synth Click trên iOS Safari
    this.playTactileClick();
  }

  public selection(): void {
    this.trigger(SELECTION);
  }

  public diceRoll(): void {
    this.trigger(DICE_ROLL);
  }

  public turnAlert(): void {
    this.trigger(TURN_ALERT);
  }

  public heavyImpact(): void {
    this.trigger(HEAVY_IMPACT);
  }

  public playTactileClick(ctx?: AudioContext | null): void {
    const { hapticsEnabled, isMuted } = useAudioStore.getState();
    if (!hapticsEnabled || isMuted) return;

    try {
      const audioCtx = ctx ?? SoundEngine.getContext();
      if (!audioCtx || (audioCtx.state as string) === 'closed') return;

      if ((audioCtx.state as string) === 'suspended') {
        void audioCtx.resume().catch(() => {});
      }

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);

      gain.gain.setValueAtTime(0.1, now);
      // W3C WebAudio specification forbids ramping to 0; positive floor 0.0001 required
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.008);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {
          // Ignore an toàn khi dọn dẹp WebAudio node
        }
      };

      osc.start(now);
      osc.stop(now + 0.01);
    } catch {
      // Fallback an toàn khi WebAudio không khả dụng
    }
  }
}

export const HapticEngine = new HapticEngineImpl();
