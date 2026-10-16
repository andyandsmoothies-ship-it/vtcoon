/**
 * Unified Audio Subsystem Facade
 * Single authoritative public gateway for game audio, sound effects, BGM, and tactile WebAudio synthesizers.
 */
export { audio, AudioFacadeImpl, type AudioFacade } from './audio_facade.js';
export { AudioEngine } from './audio_engine.js';
export { SoundEngine, type SoundEngineImpl } from './sound_engine.js';
export {
  BGMTrack,
  SoundEffect,
  BGM_FILE_MAP,
  SFX_FILE_MAP,
  getBgmTrackForCell,
  BGMTrack as MusicTrack,
} from './audio_types.js';
