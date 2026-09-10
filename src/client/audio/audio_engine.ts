// [UI-S05/MSS] AudioEngine — Singleton sound coordinator using howler.js
import { Howl, Howler } from 'howler';
import {
  BGMTrack,
  SoundEffect,
  BGM_FILE_MAP,
  SFX_FILE_MAP,
  getBgmTrackForCell,
} from './audio_types';
import { useAudioStore } from '../store/audio_store';

class AudioEngineImpl {
  private bgmCache = new Map<BGMTrack, Howl>();
  private sfxCache = new Map<SoundEffect, Howl>();
  private currentTrack: BGMTrack | null = null;
  private fadeTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private isInitialized = false;

  public init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Tự động mở khóa AudioContext khi người dùng click/chạm tương tác đầu tiên
    if (typeof window !== 'undefined') {
      const unlock = () => {
        try {
          if (Howler.ctx && Howler.ctx.state === 'suspended') {
            Howler.ctx.resume().catch(() => {});
          }
          if (this.currentTrack) {
            const currentHowl = this.bgmCache.get(this.currentTrack);
            if (currentHowl && !currentHowl.playing()) {
              currentHowl.play();
            }
          }
        } catch {
          // Fallback im lặng khi truy cập AudioContext bị hạn chế
        }
      };
      window.addEventListener('pointerdown', unlock, { once: true, capture: true });
      window.addEventListener('keydown', unlock, { once: true, capture: true });
      window.addEventListener('touchstart', unlock, { once: true, capture: true });
    }

    // Lắng nghe thay đổi volume/mute từ Zustand store
    useAudioStore.subscribe((state) => {
      Howler.mute(state.isMuted);
      this.syncCurrentBgmVolume();
    });
  }

  private getEffectiveBgmVolume(): number {
    const { isMuted, masterVolume, bgmVolume } = useAudioStore.getState();
    return isMuted ? 0 : masterVolume * bgmVolume;
  }

  private getEffectiveSfxVolume(): number {
    const { isMuted, masterVolume, sfxVolume } = useAudioStore.getState();
    return isMuted ? 0 : masterVolume * sfxVolume;
  }

  private syncCurrentBgmVolume(): void {
    if (!this.currentTrack) return;
    const currentHowl = this.bgmCache.get(this.currentTrack);
    if (currentHowl && currentHowl.playing()) {
      currentHowl.volume(this.getEffectiveBgmVolume());
    }
  }

  public getOrCreateBgm(track: BGMTrack): Howl {
    let howl = this.bgmCache.get(track);
    if (!howl) {
      howl = new Howl({
        src: [BGM_FILE_MAP[track]],
        html5: true,
        loop: true,
        volume: 0,
      });
      // Fallback im lặng khi Autoplay bị chặn bởi chính sách trình duyệt
      howl.on('playerror', () => {
        // Tự động im lặng, đợi tương tác người dùng mở khóa
      });
      howl.on('loaderror', () => {
        // Fallback im lặng nếu tài nguyên chưa nạp kịp
      });
      this.bgmCache.set(track, howl);
    }
    return howl;
  }

  public getOrCreateSfx(sfx: SoundEffect): Howl {
    let howl = this.sfxCache.get(sfx);
    if (!howl) {
      howl = new Howl({
        src: [SFX_FILE_MAP[sfx]],
        html5: false,
        loop: false,
        volume: this.getEffectiveSfxVolume(),
      });
      howl.on('playerror', () => {
        // Fallback im lặng khi Autoplay bị chặn
      });
      howl.on('loaderror', () => {
        // Fallback an toàn không ném lỗi console
      });
      this.sfxCache.set(sfx, howl);
    }
    return howl;
  }

  public playBgm(track: BGMTrack, crossfade = true): void {
    if (this.currentTrack === track) {
      this.syncCurrentBgmVolume();
      return;
    }

    const targetVolume = this.getEffectiveBgmVolume();
    const oldTrack = this.currentTrack;
    this.currentTrack = track;
    useAudioStore.getState().setCurrentBgmTrack(track);

    if (this.fadeTimeoutId) {
      clearTimeout(this.fadeTimeoutId);
      this.fadeTimeoutId = null;
    }

    if (oldTrack) {
      const oldHowl = this.bgmCache.get(oldTrack);
      if (oldHowl && oldHowl.playing()) {
        if (crossfade) {
          oldHowl.fade(oldHowl.volume(), 0, 1500);
          this.fadeTimeoutId = setTimeout(() => {
            oldHowl.stop();
          }, 1550);
        } else {
          oldHowl.stop();
        }
      }
    }

    const newHowl = this.getOrCreateBgm(track);
    try {
      if (crossfade) {
        newHowl.volume(0);
        newHowl.play();
        newHowl.fade(0, targetVolume, 1500);
      } else {
        newHowl.volume(targetVolume);
        newHowl.play();
      }
    } catch {
      // Fallback im lặng khi trình duyệt chặn Autoplay
    }
  }

  public playSfx(sfx: SoundEffect, rate?: number): void {
    const volume = this.getEffectiveSfxVolume();
    if (volume <= 0) return;
    try {
      const howl = this.getOrCreateSfx(sfx);
      howl.volume(volume);
      const effectiveRate =
        rate ?? (sfx === SoundEffect.PAWN_STEP ? 0.95 + Math.random() * 0.15 : 1);
      if (typeof howl.rate === 'function') {
        howl.rate(effectiveRate);
      }
      howl.play();
    } catch {
      // Fallback an toàn khi audio buffer chưa nạp
    }
  }

  public handlePawnLanded(cellIndex: number): void {
    const track = getBgmTrackForCell(cellIndex);
    this.playBgm(track, true);
  }

  public stopAll(): void {
    if (this.fadeTimeoutId) {
      clearTimeout(this.fadeTimeoutId);
      this.fadeTimeoutId = null;
    }
    this.bgmCache.forEach((howl) => howl.stop());
    this.sfxCache.forEach((howl) => howl.stop());
    this.currentTrack = null;
    useAudioStore.getState().setCurrentBgmTrack(null);
  }

  public getCurrentTrack(): BGMTrack | null {
    return this.currentTrack;
  }
}

export const AudioEngine = new AudioEngineImpl();
