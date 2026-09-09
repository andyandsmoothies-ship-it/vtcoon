// [UI-S05/MSS] Unit & Adversarial Tests — Regional Audio Engine & Volume Store
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MockHowl, mockHowler } from './mocks/howler_mock';

vi.mock('howler', () => ({
  Howl: MockHowl,
  Howler: mockHowler,
}));

import { getBgmTrackForCell, BGMTrack, SoundEffect } from '../../src/client/audio/audio_types';
import { useAudioStore } from '../../src/client/store/audio_store';
import { AudioEngine } from '../../src/client/audio/audio_engine';

describe('[TC-UI05.1/MSS] getBgmTrackForCell — 4 Regional Edges & Wrap-around', () => {
  it('maps cells 00-09 to TAY_NAM_BO (Cạnh 1)', () => {
    for (let i = 0; i <= 9; i++) {
      expect(getBgmTrackForCell(i)).toBe(BGMTrack.TAY_NAM_BO);
    }
  });

  it('maps cells 10-19 to DUYEN_HAI_MIEN_TRUNG (Cạnh 2)', () => {
    for (let i = 10; i <= 19; i++) {
      expect(getBgmTrackForCell(i)).toBe(BGMTrack.DUYEN_HAI_MIEN_TRUNG);
    }
  });

  it('maps cells 20-29 to BAC_TRUNG_BO (Cạnh 3)', () => {
    for (let i = 20; i <= 29; i++) {
      expect(getBgmTrackForCell(i)).toBe(BGMTrack.BAC_TRUNG_BO);
    }
  });

  it('maps cells 30-39 to DO_THI_LOI (Cạnh 4)', () => {
    for (let i = 30; i <= 39; i++) {
      expect(getBgmTrackForCell(i)).toBe(BGMTrack.DO_THI_LOI);
    }
  });

  it('[Adversarial Inversion] wraps around positive indices >= 40', () => {
    expect(getBgmTrackForCell(40)).toBe(BGMTrack.TAY_NAM_BO);
    expect(getBgmTrackForCell(55)).toBe(BGMTrack.DUYEN_HAI_MIEN_TRUNG);
    expect(getBgmTrackForCell(80)).toBe(BGMTrack.TAY_NAM_BO);
  });

  it('[Adversarial Inversion] wraps around negative indices safely', () => {
    expect(getBgmTrackForCell(-1)).toBe(BGMTrack.DO_THI_LOI); // cell 39
    expect(getBgmTrackForCell(-40)).toBe(BGMTrack.TAY_NAM_BO); // cell 0
    expect(getBgmTrackForCell(-25)).toBe(BGMTrack.DUYEN_HAI_MIEN_TRUNG); // cell 15
  });
});

describe('[TC-UI05.2/MSS] AudioEngine — 1.5s Crossfade Mechanics', () => {
  beforeEach(() => {
    AudioEngine.stopAll();
    useAudioStore.setState({ masterVolume: 1.0, bgmVolume: 0.8, isMuted: false });
  });

  it('plays new track with 1500ms fade-in from volume 0', () => {
    AudioEngine.playBgm(BGMTrack.TAY_NAM_BO, true);
    const howl = AudioEngine.getOrCreateBgm(BGMTrack.TAY_NAM_BO) as unknown as MockHowl;
    expect(howl.isPlaying).toBe(true);
    expect(howl.lastFade).toEqual({ from: 0, to: 0.8, duration: 1500 });
    expect(AudioEngine.getCurrentTrack()).toBe(BGMTrack.TAY_NAM_BO);
  });

  it('crossfades old track to 0 over 1500ms when transitioning regions', () => {
    AudioEngine.playBgm(BGMTrack.TAY_NAM_BO, true);
    const oldHowl = AudioEngine.getOrCreateBgm(BGMTrack.TAY_NAM_BO) as unknown as MockHowl;

    AudioEngine.playBgm(BGMTrack.DUYEN_HAI_MIEN_TRUNG, true);
    const newHowl = AudioEngine.getOrCreateBgm(BGMTrack.DUYEN_HAI_MIEN_TRUNG) as unknown as MockHowl;

    expect(oldHowl.lastFade).toEqual({ from: 0.8, to: 0, duration: 1500 });
    expect(newHowl.lastFade).toEqual({ from: 0, to: 0.8, duration: 1500 });
    expect(AudioEngine.getCurrentTrack()).toBe(BGMTrack.DUYEN_HAI_MIEN_TRUNG);
  });

  it('[Adversarial Inversion] does NOT trigger fade if landing on same region', () => {
    AudioEngine.handlePawnLanded(1); // Cạnh 1
    const howl = AudioEngine.getOrCreateBgm(BGMTrack.TAY_NAM_BO) as unknown as MockHowl;
    const initialPlayCount = howl.playCount;

    AudioEngine.handlePawnLanded(5); // Vẫn Cạnh 1
    expect(howl.playCount).toBe(initialPlayCount);
    expect(AudioEngine.getCurrentTrack()).toBe(BGMTrack.TAY_NAM_BO);
  });
});

describe('[TC-UI05.3/MSS] AudioEngine — One-Shot SFX Specs', () => {
  beforeEach(() => {
    AudioEngine.stopAll();
    useAudioStore.setState({ masterVolume: 1.0, sfxVolume: 0.75, isMuted: false });
  });

  it('UPGRADE_C3 plays once with loop=false and target volume', () => {
    AudioEngine.playSfx(SoundEffect.UPGRADE_C3);
    const howl = AudioEngine.getOrCreateSfx(SoundEffect.UPGRADE_C3) as unknown as MockHowl;
    expect(howl.isPlaying).toBe(true);
    expect(howl.options.loop).toBe(false);
    expect(howl.currentVolume).toBe(0.75);
  });

  it('DICE_ROLL and BUY_PROPERTY play independently', () => {
    AudioEngine.playSfx(SoundEffect.DICE_ROLL);
    AudioEngine.playSfx(SoundEffect.BUY_PROPERTY);
    const diceHowl = AudioEngine.getOrCreateSfx(SoundEffect.DICE_ROLL) as unknown as MockHowl;
    const buyHowl = AudioEngine.getOrCreateSfx(SoundEffect.BUY_PROPERTY) as unknown as MockHowl;
    expect(diceHowl.isPlaying).toBe(true);
    expect(buyHowl.isPlaying).toBe(true);
  });

  it('PAWN_STEP plays with variable playbackRate pitch', () => {
    AudioEngine.playSfx(SoundEffect.PAWN_STEP, 1.04);
    const howl = AudioEngine.getOrCreateSfx(SoundEffect.PAWN_STEP) as unknown as MockHowl;
    expect(howl.isPlaying).toBe(true);
    expect(howl.currentRate).toBe(1.04);

    AudioEngine.playSfx(SoundEffect.PAWN_STEP, 0.96);
    expect(howl.currentRate).toBe(0.96);
  });
});

describe('[TC-UI05.4/MSS] AudioStore — Volume Clamping & Mute Toggle', () => {
  beforeEach(() => {
    useAudioStore.setState({ masterVolume: 0.8, bgmVolume: 0.6, sfxVolume: 0.8, isMuted: false });
  });

  it('toggleMute switches isMuted between true and false', () => {
    expect(useAudioStore.getState().isMuted).toBe(false);
    useAudioStore.getState().toggleMute();
    expect(useAudioStore.getState().isMuted).toBe(true);
    useAudioStore.getState().toggleMute();
    expect(useAudioStore.getState().isMuted).toBe(false);
  });

  it('[Adversarial Inversion] clamps volume outside [0, 1] range safely', () => {
    useAudioStore.getState().setMasterVolume(1.5);
    expect(useAudioStore.getState().masterVolume).toBe(1);

    useAudioStore.getState().setBgmVolume(-0.5);
    expect(useAudioStore.getState().bgmVolume).toBe(0);

    useAudioStore.getState().setSfxVolume(NaN);
    expect(useAudioStore.getState().sfxVolume).toBe(0);
  });

  it('when isMuted=true, SFX does not play or plays at 0 volume', () => {
    useAudioStore.getState().setIsMuted(true);
    const initialHowl = AudioEngine.getOrCreateSfx(SoundEffect.TAX_PENALTY) as unknown as MockHowl;
    const initialPlayCount = initialHowl.playCount;
    AudioEngine.playSfx(SoundEffect.TAX_PENALTY);
    expect(initialHowl.playCount).toBe(initialPlayCount);
  });
});
