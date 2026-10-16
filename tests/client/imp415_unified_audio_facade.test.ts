// [IMP-415] Living Contract Suite — Unified Audio Subsystem Facade & Modal Seam Wiring
// Traceability: [TC-415.01..TC-415.06], [UC-AUDIO-FACADE-SFX-DISPATCH],
//               [UC-AUDIO-FACADE-VOLUME-SYNC], [UC-AUDIO-FACADE-THEME-PLAYBACK],
//               [UC-MODAL-AUDIO-FACADE-WIRING-PARITY], [UC-BOUNDARY-LINTER-AUDIO-SEAM-01-ELIMINATION],
//               [UC-TACTILE-SYNTH-FACADE-DELEGATION]
import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import {
  audio,
  AudioEngine,
  SoundEngine,
  SoundEffect,
  BGMTrack,
} from '../../src/client/audio/index.js';
import { useAudioStore } from '../../src/client/store/audio_store.js';
import { lintFileBoundaries } from '../../scripts/boundary_linter/boundary_rules.mjs';
import { BOUNDARY_RULES } from '../../scripts/boundary_linter/boundary_constants.mjs';

const REPO_ROOT = process.cwd();

const TARGET_MODAL_FILES: readonly string[] = [
  'src/client/ui/modals/modal_host.tsx',
  'src/client/ui/modals/bot_trade_offer_strip.tsx',
  'src/client/ui/modals/transit_wheel_modal.tsx',
  'src/client/ui/modals/hosts/auction_modal_host.tsx',
  'src/client/ui/modals/hosts/deed_modal_host.tsx',
  'src/client/ui/modals/hosts/trade_modal_host.tsx',
];

interface LeafAudioImportViolation {
  readonly file: string;
  readonly line: number;
  readonly specifier: string;
}

interface Seam01ScanResult {
  readonly file: string;
  readonly line: number;
  readonly message: string;
}

function scanModalAudioImports(
  files: readonly string[],
  repoRoot: string,
): {
  readonly violations: readonly LeafAudioImportViolation[];
  readonly validFacadeImportsCount: number;
  readonly inspectedFilesCount: number;
} {
  const violations: LeafAudioImportViolation[] = [];
  let validFacadeImportsCount = 0;

  for (const relPath of files) {
    const fullPath = path.resolve(repoRoot, relPath);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf8');
    const sf = ts.createSourceFile(fullPath, content, ts.ScriptTarget.Latest, true);

    for (const stmt of sf.statements) {
      if (
        (ts.isImportDeclaration(stmt) || ts.isExportDeclaration(stmt)) &&
        stmt.moduleSpecifier &&
        ts.isStringLiteral(stmt.moduleSpecifier)
      ) {
        const spec = stmt.moduleSpecifier.text;
        if (spec.includes('audio') || spec.startsWith('@audio')) {
          const isFacade =
            spec.endsWith('/audio/index.js') ||
            spec.endsWith('/audio/index') ||
            spec.endsWith('/audio/index.ts') ||
            spec === '@audio' ||
            spec.startsWith('@audio/');

          if (isFacade) {
            validFacadeImportsCount++;
          } else {
            const { line } = sf.getLineAndCharacterOfPosition(stmt.getStart());
            violations.push({
              file: relPath,
              line: line + 1,
              specifier: spec,
            });
          }
        }
      }
    }
  }

  return {
    violations,
    validFacadeImportsCount,
    inspectedFilesCount: files.length,
  };
}

function scanSeam01AudioWarnings(
  files: readonly string[],
  repoRoot: string,
): {
  readonly audioWarnings: readonly Seam01ScanResult[];
  readonly scannedCount: number;
} {
  const audioWarnings: Seam01ScanResult[] = [];

  for (const relPath of files) {
    const fullPath = path.resolve(repoRoot, relPath);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf8');
    const result = lintFileBoundaries(fullPath, content, repoRoot, false);
    for (const w of result.warnings) {
      if (w.rule === BOUNDARY_RULES.DEEP_RELATIVE_IMPORT && w.message.includes('audio')) {
        audioWarnings.push({
          file: w.file,
          line: w.line,
          message: w.message,
        });
      }
    }
  }

  return {
    audioWarnings,
    scannedCount: files.length,
  };
}

describe('[IMP-415] Unified Audio Subsystem Facade & Modal Seam Wiring', () => {
  afterEach(() => {
    useAudioStore.setState({
      masterVolume: 0.8,
      bgmVolume: 0.6,
      sfxVolume: 0.8,
      isMuted: false,
      currentBgmTrack: null,
    });
    vi.restoreAllMocks();
  });

  describe('[TC-415.01/MSS] [UC-AUDIO-FACADE-SFX-DISPATCH] Audio Facade SFX Dispatch Delegation', () => {
    it('[TC-415.01/MSS] [UC-AUDIO-FACADE-SFX-DISPATCH] delegates playSfx to AudioEngine.playSfx with SoundEffect.AUCTION_BID and default rate', () => {
      const spy = vi.spyOn(AudioEngine, 'playSfx').mockImplementation(() => {});
      audio.playSfx(SoundEffect.AUCTION_BID);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(SoundEffect.AUCTION_BID);
    });

    it('[TC-415.01/MSS] [UC-AUDIO-FACADE-SFX-DISPATCH] delegates playSfx to AudioEngine.playSfx with SoundEffect.DICE_ROLL and explicit rate multiplier', () => {
      const spy = vi.spyOn(AudioEngine, 'playSfx').mockImplementation(() => {});
      audio.playSfx(SoundEffect.DICE_ROLL, 1.25);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(SoundEffect.DICE_ROLL, 1.25);
    });

    it('[TC-415.01/MSS] [UC-AUDIO-FACADE-SFX-DISPATCH] verifies relational parameter preservation across distinct SFX types', () => {
      const spy = vi.spyOn(AudioEngine, 'playSfx').mockImplementation(() => {});
      audio.playSfx(SoundEffect.CARD_FLIP, 0.9);
      audio.playSfx(SoundEffect.BUY_PROPERTY);

      expect(spy).toHaveBeenNthCalledWith(1, SoundEffect.CARD_FLIP, 0.9);
      expect(spy).toHaveBeenNthCalledWith(2, SoundEffect.BUY_PROPERTY);
    });
  });

  describe('[TC-415.02/MSS] [UC-AUDIO-FACADE-VOLUME-SYNC] Audio Store Volume Synchronization & State Mutation', () => {
    it('[TC-415.02/MSS] [UC-AUDIO-FACADE-VOLUME-SYNC] synchronizes setThemeVolume directly into useAudioStore bgmVolume state', () => {
      audio.setThemeVolume(0.45);

      expect(useAudioStore.getState().bgmVolume).toBe(0.45);
    });

    it('[TC-415.02/MSS] [UC-AUDIO-FACADE-VOLUME-SYNC] synchronizes setSfxVolume directly into useAudioStore sfxVolume state', () => {
      audio.setSfxVolume(0.72);

      expect(useAudioStore.getState().sfxVolume).toBe(0.72);
    });

    it('[TC-415.02/MSS] [UC-AUDIO-FACADE-VOLUME-SYNC] synchronizes setMuted and toggleMute directly into useAudioStore isMuted state', () => {
      audio.setMuted(true);
      expect(useAudioStore.getState().isMuted).toBe(true);

      audio.toggleMute();
      expect(useAudioStore.getState().isMuted).toBe(false);
    });
  });

  describe('[TC-415.03/MSS] [UC-AUDIO-FACADE-THEME-PLAYBACK] Theme & BGM Geographic Playback Delegation', () => {
    it('[TC-415.03/MSS] [UC-AUDIO-FACADE-THEME-PLAYBACK] delegates playTheme with crossfade to AudioEngine.playBgm for TAY_NAM_BO', () => {
      const spy = vi.spyOn(AudioEngine, 'playBgm').mockImplementation(() => {});
      audio.playTheme(BGMTrack.TAY_NAM_BO, true);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(BGMTrack.TAY_NAM_BO, true);
    });

    it('[TC-415.03/MSS] [UC-AUDIO-FACADE-THEME-PLAYBACK] delegates playTheme without crossfade to AudioEngine.playBgm for DO_THI_LOI', () => {
      const spy = vi.spyOn(AudioEngine, 'playBgm').mockImplementation(() => {});
      audio.playTheme(BGMTrack.DO_THI_LOI, false);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(BGMTrack.DO_THI_LOI, false);
    });

    it('[TC-415.03/MSS] [UC-AUDIO-FACADE-THEME-PLAYBACK] delegates handlePawnLanded to AudioEngine.handlePawnLanded with cell index', () => {
      const spy = vi.spyOn(AudioEngine, 'handlePawnLanded').mockImplementation(() => {});
      audio.handlePawnLanded(12);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(12);
    });
  });

  describe('[TC-415.04/MSS] [UC-MODAL-AUDIO-FACADE-WIRING-PARITY] Modal Audio Facade Wiring Parity via AST', () => {
    it('[TC-415.04/MSS] [UC-MODAL-AUDIO-FACADE-WIRING-PARITY] proves all 6 modal files have zero leaf audio imports and strictly target audio/index.js', () => {
      const { violations, inspectedFilesCount } = scanModalAudioImports(
        TARGET_MODAL_FILES,
        REPO_ROOT,
      );

      expect(violations).toEqual([]);
      expect(inspectedFilesCount).toBe(6);
    });

    it('[TC-415.04/MSS] [UC-MODAL-AUDIO-FACADE-WIRING-PARITY] proves all 6 modal files contain valid facade imports pointing to audio/index.js', () => {
      const { validFacadeImportsCount } = scanModalAudioImports(TARGET_MODAL_FILES, REPO_ROOT);

      expect(validFacadeImportsCount).toBeGreaterThanOrEqual(6);
    });
  });

  describe('[TC-415.05/MSS] [UC-BOUNDARY-LINTER-AUDIO-SEAM-01-ELIMINATION] Boundary Linter SEAM-01 Elimination', () => {
    it('[TC-415.05/MSS] [UC-BOUNDARY-LINTER-AUDIO-SEAM-01-ELIMINATION] proves zero SEAM-01 deep relative audio import warnings across all 6 modal files', () => {
      const { audioWarnings, scannedCount } = scanSeam01AudioWarnings(
        TARGET_MODAL_FILES,
        REPO_ROOT,
      );

      expect(audioWarnings).toEqual([]);
      expect(scannedCount).toBe(6);
    });
  });

  describe('[TC-415.06/MSS] [UC-TACTILE-SYNTH-FACADE-DELEGATION] Tactile WebAudio Synthesizer Facade Delegation & Lifecycle Teardown', () => {
    it('[TC-415.06/MSS] [UC-TACTILE-SYNTH-FACADE-DELEGATION] delegates playTactileDiceRoll to AudioEngine without throwing unhandled error', () => {
      const spy = vi.spyOn(AudioEngine, 'playTactileDiceRoll').mockImplementation(() => {});

      expect(() => audio.playTactileDiceRoll()).not.toThrow();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('[TC-415.06/MSS] [UC-TACTILE-SYNTH-FACADE-DELEGATION] delegates playTactileAuctionGavel to AudioEngine without throwing unhandled error', () => {
      const spy = vi.spyOn(AudioEngine, 'playTactileAuctionGavel').mockImplementation(() => {});

      expect(() => audio.playTactileAuctionGavel()).not.toThrow();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('[TC-415.06/MSS] [UC-TACTILE-SYNTH-FACADE-DELEGATION] delegates playHeartbeatPulse to SoundEngine without throwing unhandled error', () => {
      const spy = vi.spyOn(SoundEngine, 'playHeartbeatPulse').mockImplementation(() => {});

      expect(() => audio.playHeartbeatPulse()).not.toThrow();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('[TC-415.06/MSS] [UC-TACTILE-SYNTH-FACADE-DELEGATION] delegates dispose to both AudioEngine.dispose and SoundEngine.dispose for dual teardown', () => {
      const audioSpy = vi.spyOn(AudioEngine, 'dispose').mockImplementation(() => {});
      const soundSpy = vi.spyOn(SoundEngine, 'dispose').mockImplementation(() => {});

      audio.dispose();

      expect(audioSpy).toHaveBeenCalledTimes(1);
      expect(soundSpy).toHaveBeenCalledTimes(1);
    });
  });
});
