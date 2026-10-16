import { AudioEngine } from './audio_engine.js';
import { SoundEngine } from './sound_engine.js';
import { BGMTrack, SoundEffect } from './audio_types.js';
import { useAudioStore } from '../store/audio_store.js';

export interface AudioFacade {
  playSfx(sfx: SoundEffect, rate?: number): void;
  playTheme(track: BGMTrack, crossfade?: boolean): void;
  playBgm(track: BGMTrack, crossfade?: boolean): void;
  handlePawnLanded(cellIndex: number): void;
  setThemeVolume(volume: number): void;
  setBgmVolume(volume: number): void;
  setSfxVolume(volume: number): void;
  setMasterVolume(volume: number): void;
  setMuted(isMuted: boolean): void;
  toggleMute(): void;
  init(): void;
  resumeAudioContext(): void;
  armInterruptionRecovery(): void;
  stopAll(): void;
  dispose(): void;
  getCurrentTrack(): BGMTrack | null;
  playTactileDiceRoll(): void;
  playTactileAuctionGavel(): void;
  playTactileConstructionSlam(): void;
  playTactileMoneyTransfer(): void;
  playTactilePawnStep(rate?: number): void;
  startPenthouseOceanAmbient(): void;
  stopPenthouseOceanAmbient(): void;
  playJazzLoungeChords(): void;
  playLighthouseHorn(): void;
  playCarHorn(): void;
  playWaterRipple(): void;
  playHeartbeatPulse(): void;
  stopHeartbeatPulse(): void;
  playVictoryChime(): void;
  playSlumpThud(): void;
  playMonopolyFanfare(): void;
}

export class AudioFacadeImpl implements AudioFacade {
  public playSfx(sfx: SoundEffect, rate?: number): void {
    if (rate !== undefined) {
      AudioEngine.playSfx(sfx, rate);
    } else {
      AudioEngine.playSfx(sfx);
    }
  }

  public playTheme(track: BGMTrack, crossfade = true): void {
    AudioEngine.playBgm(track, crossfade);
  }

  public playBgm(track: BGMTrack, crossfade = true): void {
    AudioEngine.playBgm(track, crossfade);
  }

  public handlePawnLanded(cellIndex: number): void {
    AudioEngine.handlePawnLanded(cellIndex);
  }

  public setThemeVolume(volume: number): void {
    useAudioStore.getState().setBgmVolume(volume);
  }

  public setBgmVolume(volume: number): void {
    useAudioStore.getState().setBgmVolume(volume);
  }

  public setSfxVolume(volume: number): void {
    useAudioStore.getState().setSfxVolume(volume);
  }

  public setMasterVolume(volume: number): void {
    useAudioStore.getState().setMasterVolume(volume);
  }

  public setMuted(isMuted: boolean): void {
    useAudioStore.getState().setIsMuted(isMuted);
  }

  public toggleMute(): void {
    useAudioStore.getState().toggleMute();
  }

  public init(): void {
    AudioEngine.init();
  }

  public resumeAudioContext(): void {
    AudioEngine.resumeAudioContext();
  }

  public armInterruptionRecovery(): void {
    AudioEngine.armInterruptionRecovery();
  }

  public stopAll(): void {
    AudioEngine.stopAll();
  }

  public dispose(): void {
    AudioEngine.dispose();
    SoundEngine.dispose();
  }

  public getCurrentTrack(): BGMTrack | null {
    return AudioEngine.getCurrentTrack();
  }

  public playTactileDiceRoll(): void {
    AudioEngine.playTactileDiceRoll();
  }

  public playTactileAuctionGavel(): void {
    AudioEngine.playTactileAuctionGavel();
  }

  public playTactileConstructionSlam(): void {
    AudioEngine.playTactileConstructionSlam();
  }

  public playTactileMoneyTransfer(): void {
    AudioEngine.playTactileMoneyTransfer();
  }

  public playTactilePawnStep(rate?: number): void {
    AudioEngine.playTactilePawnStep(rate);
  }

  public startPenthouseOceanAmbient(): void {
    AudioEngine.startPenthouseOceanAmbient();
  }

  public stopPenthouseOceanAmbient(): void {
    AudioEngine.stopPenthouseOceanAmbient();
  }

  public playJazzLoungeChords(): void {
    AudioEngine.playJazzLoungeChords();
  }

  public playLighthouseHorn(): void {
    SoundEngine.playLighthouseHorn();
  }

  public playCarHorn(): void {
    SoundEngine.playCarHorn();
  }

  public playWaterRipple(): void {
    SoundEngine.playWaterRipple();
  }

  public playHeartbeatPulse(): void {
    SoundEngine.playHeartbeatPulse();
  }

  public stopHeartbeatPulse(): void {
    SoundEngine.stopHeartbeatPulse();
  }

  public playVictoryChime(): void {
    SoundEngine.playVictoryChime();
  }

  public playSlumpThud(): void {
    SoundEngine.playSlumpThud();
  }

  public playMonopolyFanfare(): void {
    SoundEngine.playMonopolyFanfare();
  }
}

export const audio: AudioFacade = new AudioFacadeImpl();
