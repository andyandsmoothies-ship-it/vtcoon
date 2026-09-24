// [UI-S05/MSS] AudioEngine — Singleton sound coordinator using howler.js
import { Howl, Howler } from 'howler';
import { BGMTrack, SoundEffect, BGM_FILE_MAP, SFX_FILE_MAP, getBgmTrackForCell } from './audio_types';
import { useAudioStore } from '../store/audio_store';
import { SoundEngine } from './sound_engine';

class AudioEngineImpl {
  private bgmCache = new Map<BGMTrack, Howl>();
  private sfxCache = new Map<SoundEffect, Howl>();
  private currentTrack: BGMTrack | null = null;
  private fadeTimeoutId: ReturnType<typeof setTimeout> | null = null;
  public isInitialized = false;
  public isRecoveryArmed = false;
  private isHowlerListenerBound = false;
  private visibilityHandler: (() => void) | null = null;
  private unsubAudioStore: (() => void) | null = null;

  private ensureHowlerListener(): void {
    if (this.isHowlerListenerBound || typeof Howler === 'undefined' || !Howler.ctx?.addEventListener) return;
    try {
      Howler.ctx.addEventListener('statechange', this.handleStateChange);
      this.isHowlerListenerBound = true;
    } catch {
      // Ignore statechange listener error
    }
  }

  private onEmergencyTouch = (): void => {
    this.isRecoveryArmed = false;
    if (typeof window !== 'undefined') {
      window.removeEventListener('pointerdown', this.onEmergencyTouch, { capture: true });
      window.removeEventListener('touchstart', this.onEmergencyTouch, { capture: true });
    }
    this.resumeAudioContext();
  };

  private handleStateChange = (event?: Event): void => {
    const target = event?.target as { state?: string } | undefined;
    const targetState = target?.state ?? Howler?.ctx?.state ?? SoundEngine.getContext()?.state;
    if (targetState === 'interrupted' || targetState === 'suspended') {
      this.armInterruptionRecovery();
    }
  };

  public armInterruptionRecovery(): void {
    if (this.isRecoveryArmed || typeof window === 'undefined') return;
    this.isRecoveryArmed = true;

    window.addEventListener('pointerdown', this.onEmergencyTouch, { once: true, capture: true });
    window.addEventListener('touchstart', this.onEmergencyTouch, { once: true, capture: true });
  }

  public init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Tự động mở khóa AudioContext khi người dùng click/chạm tương tác đầu tiên
    if (typeof window !== 'undefined') {
      const unlock = () => {
        try {
          this.resumeAudioContext();
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
      window.addEventListener('click', unlock, { once: true, capture: true });
    }

    // Tự động khôi phục AudioContext khi người dùng quay lại tab (Safari iOS / Background freeze)
    if (typeof document !== 'undefined') {
      this.visibilityHandler = () => {
        if (document.visibilityState === 'visible') {
          this.resumeAudioContext();
        }
      };
      document.addEventListener('visibilitychange', this.visibilityHandler);
    }

    // Lắng nghe statechange trên Howler.ctx và SoundEngine.getContext() (iOS Safari 'interrupted' sau cuộc gọi/Siri)
    this.ensureHowlerListener();
    const soundCtx = SoundEngine.getContext();
    if (soundCtx?.addEventListener) {
      try { soundCtx.addEventListener('statechange', this.handleStateChange); } catch { /* Ignore statechange listener error */ }
    }

    // Lắng nghe thay đổi volume/mute từ Zustand store
    this.unsubAudioStore = useAudioStore.subscribe((state) => {
      Howler.mute(state.isMuted);
      this.syncCurrentBgmVolume();
      SoundEngine.syncVolumesWithStore();
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
          this.fadeTimeoutId = setTimeout(() => oldHowl.stop(), 1550);
        } else {
          oldHowl.stop();
        }
      }
    }

    const newHowl = this.getOrCreateBgm(track);
    try {
      this.resumeAudioContext();
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

  public resumeAudioContext(): void {
    try {
      this.ensureHowlerListener();
      if (typeof Howler !== 'undefined' && Howler.ctx) {
        const hState = Howler.ctx.state as string;
        if (hState === 'suspended' || hState === 'interrupted') {
          void Howler.ctx.resume().catch(() => {});
        }
      }
      const soundCtx = SoundEngine.getContext();
      if (soundCtx) {
        const sState = soundCtx.state as string;
        if (sState === 'suspended' || sState === 'interrupted') {
          void soundCtx.resume().catch(() => {});
        }
      }
    } catch {
      // Fallback an toàn khi truy cập AudioContext bị hạn chế
    }
  }

  public playSfx(sfx: SoundEffect, rate?: number): void {
    const volume = this.getEffectiveSfxVolume();
    if (volume <= 0) return;
    try {
      this.resumeAudioContext();
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

    // Tích hợp phản hồi xúc giác thời gian thực từ SoundEngine
    try {
      if (sfx === SoundEffect.DICE_ROLL) {
        SoundEngine.playDiceRoll();
      } else if (sfx === SoundEffect.PAWN_STEP) {
        SoundEngine.playPawnStep(rate);
      } else if (sfx === SoundEffect.AUCTION_BID) {
        SoundEngine.playAuctionGavel();
      } else if (sfx === SoundEffect.BUY_PROPERTY) {
        SoundEngine.playMoneyTransfer();
      } else if (sfx === SoundEffect.UPGRADE_C3) {
        SoundEngine.playConstructionSlam();
      } else if (sfx === SoundEffect.CARD_FLIP) {
        SoundEngine.playCardFlip();
      } else if (sfx === SoundEffect.VICTORY_CHIME) {
        SoundEngine.playCoronationChime();
      }
    } catch {
      // An toàn khi WebAudio không khả dụng
    }
  }

  public playTactileDiceRoll(): void {
    SoundEngine.playDiceRoll();
  }

  public playTactileAuctionGavel(): void {
    SoundEngine.playAuctionGavel();
  }

  public playTactileConstructionSlam(): void {
    SoundEngine.playConstructionSlam();
  }

  public playTactileMoneyTransfer(): void {
    SoundEngine.playMoneyTransfer();
  }

  public playTactilePawnStep(rate?: number): void {
    SoundEngine.playPawnStep(rate);
  }

  public startPenthouseOceanAmbient(): void {
    SoundEngine.playPenthouseOceanAmbient();
  }

  public stopPenthouseOceanAmbient(): void {
    SoundEngine.stopPenthouseOceanAmbient();
  }

  public playJazzLoungeChords(): void {
    SoundEngine.playJazzLoungeChords();
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
    SoundEngine.stopAll();
    this.currentTrack = null;
    useAudioStore.getState().setCurrentBgmTrack(null);
  }

  public getCurrentTrack(): BGMTrack | null {
    return this.currentTrack;
  }

  public dispose(): void {
    this.isInitialized = false;
    this.isRecoveryArmed = false;
    this.isHowlerListenerBound = false;
    if (this.fadeTimeoutId) {
      clearTimeout(this.fadeTimeoutId);
      this.fadeTimeoutId = null;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('pointerdown', this.onEmergencyTouch, { capture: true });
      window.removeEventListener('touchstart', this.onEmergencyTouch, { capture: true });
    }
    if (this.visibilityHandler && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
    if (this.unsubAudioStore) {
      this.unsubAudioStore();
      this.unsubAudioStore = null;
    }
    if (typeof Howler !== 'undefined' && Howler.ctx?.removeEventListener) {
      try { Howler.ctx.removeEventListener('statechange', this.handleStateChange); } catch { /* Ignore cleanup error */ }
    }
    const soundCtx = SoundEngine.getContext();
    if (soundCtx?.removeEventListener) {
      try { soundCtx.removeEventListener('statechange', this.handleStateChange); } catch { /* Ignore cleanup error */ }
    }
  }
}

export const AudioEngine = new AudioEngineImpl();
