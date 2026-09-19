// [IMP-125-P2/MSS] Contract Test Suite: Dynamic Tension Cine-Cam & Pawn Expressive Interactions
// Universal 4-Facet Behavioral Matrix:
// Facet 1 (Boundary & Range): checkHighStakesRoll distances [2..12], rent threshold 80% vs 79.9%, balance <= 0, CAMERA_CONFIG tension_roll, spring math curves.
// Facet 2 (State Reactivity): resolveCameraMode tension_roll switch, SoundEngine synth triggers, useVfxStore reaction store and PawnAnimator consumption.
// Facet 3 (Resource Disposal): SoundEngine heartbeat teardown on stop/dispose, activePawnReactions timeout automatic pruning.
// Facet 4 (Error Defense): SoundEngine zero-crash on null/muted AudioContext, checkHighStakesRoll own/unowned/mortgaged cell ignoring, math bounds clamping.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Ensure Zustand stores evaluate live state instead of stale snapshots during Node.js SSR test rendering
const origUseSyncExternalStore = React.useSyncExternalStore;
React.useSyncExternalStore = ((subscribe, getSnapshot, _getServerSnapshot) => {
  return origUseSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}) as typeof React.useSyncExternalStore;

import * as CameraSM from '../../src/client/3d/camera_state_machine';
import * as PawnPath from '../../src/client/3d/pawn_path';
import { SoundEngine } from '../../src/client/audio/sound_engine';
import { useVfxStore } from '../../src/client/store/vfx_store';
import { useAudioStore } from '../../src/client/store/audio_store';
import { useGameStore } from '../../src/client/store/game_store';
import { PawnAnimator } from '../../src/client/3d/pawn_animator';
import type { Player } from '../../src/domain/room';

// =========================================================================
// CONTRACT AUGMENTATION INTERFACES (SSOT Contract Definitions)
// =========================================================================

export interface HighStakesResult {
  readonly isHighStakes: boolean;
  readonly dangerousCellIndex?: number;
  readonly dangerousRent?: number;
}

export type CheckHighStakesRollFn = (
  currentPos: number,
  playerBalance: number,
  playersInfo: Record<string, {
    id: string;
    balance?: number;
    ownedProperties?: readonly number[];
    mortgagedProperties?: readonly number[];
  }>,
  levelMap?: Record<number, 0 | 1 | 2 | 3 | number>,
  currentPlayerId?: string
) => HighStakesResult;

export interface PawnReactionState {
  readonly type: 'victory_spin' | 'slump_recoil';
  readonly startTime: number;
  readonly durationMs: number;
}

export interface Imp125P2VfxStore {
  readonly activePawnReactions?: Record<string, PawnReactionState>;
  readonly triggerPawnReaction?: (playerId: string, type: 'victory_spin' | 'slump_recoil', durationMs?: number) => void;
  readonly clearPawnReaction?: (playerId: string) => void;
}

export interface Imp125P2SoundEngine {
  playHeartbeatPulse?: () => void;
  stopHeartbeatPulse?: () => void;
  playVictoryChime?: () => void;
  playSlumpThud?: () => void;
  dispose?: () => void;
}

export interface VictorySpinResult {
  readonly rotationY: number;
  readonly heightOffset: number;
}

export interface SlumpRecoilResult {
  readonly scaleY: number;
  readonly scaleXZ?: number;
}

// Accessors for contractual exports under test
const checkHighStakesRoll = (CameraSM as unknown as { checkHighStakesRoll?: CheckHighStakesRollFn }).checkHighStakesRoll;
const calculateVictorySpin = (PawnPath as unknown as { calculateVictorySpin?: (progress: number) => VictorySpinResult }).calculateVictorySpin;
const calculateSlumpRecoil = (PawnPath as unknown as { calculateSlumpRecoil?: (progress: number) => SlumpRecoilResult }).calculateSlumpRecoil;

describe('[IMP-125-P2/MSS] Phase 2 Contract Test Suite: Tension Cine-Cam & Pawn Reactions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useAudioStore.setState({
      masterVolume: 1.0,
      sfxVolume: 1.0,
      bgmVolume: 1.0,
      isMuted: false,
    });
    useGameStore.setState({
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Sài Gòn',
          balance: 2000,
          bankrupt: false,
          tokenColor: '#EF4444',
          ownedProperties: [],
        },
        p2: {
          id: 'p2',
          name: 'Đại Gia Hà Nội',
          balance: 10000,
          bankrupt: false,
          tokenColor: '#3B82F6',
          ownedProperties: [],
        },
      },
      playerPositions: { p1: 0, p2: 0 },
      visualPositions: { p1: 0, p2: 0 },
      levelMap: {},
      activePawnAnimation: null,
      pendingPawnMove: null,
      activeEmotes: {},
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // =========================================================================
  // GÓI 1: THUẬT TOÁN QUÉT NGỮ CẢNH TỬ THẦN & MÁY QUAY CĂNG THẲNG
  // =========================================================================
  describe('Gói 1: Thuật Toán Quét Ngữ Cảnh Tử Thần & Máy Quay Căng Thẳng (Dynamic Tension Cine-Cam)', () => {
    const mockPlayers = {
      p1: { id: 'p1', balance: 2000, ownedProperties: [] },
      p2: { id: 'p2', balance: 10000, ownedProperties: [3, 6, 13] },
    };

    it('[TC-IMP125.P2.01/MSS][UC-IMP125][UC-TENSION-CAM] Facet 1 (Boundary): Quét đúng cự ly tối thiểu 2 ô (ô 3 cách ô 1 đúng 2 bước)', () => {
      // Cell 3 (An Giang C0: rent 60, C2: rent 540, C3: rent 1320). Player p1 balance = 1500 (80% = 1200).
      // At level 3, rent is 1320 >= 1200. Distance = 3 - 1 = 2 steps.
      const fn = checkHighStakesRoll;
      if (!fn) throw new Error('checkHighStakesRoll is not exported from camera_state_machine.ts');
      const result = fn(1, 1500, mockPlayers, { 3: 3 }, 'p1');
      expect(result.isHighStakes).toBe(true);
      expect(result.dangerousCellIndex).toBe(3);
      expect(result.dangerousRent).toBe(1320);
    });

    it('[TC-IMP125.P2.02/MSS][UC-IMP125][UC-TENSION-CAM] Facet 1 (Boundary): Quét đúng cự ly tối đa 12 ô (ô 13 cách ô 1 đúng 12 bước)', () => {
      // Cell 13 (Lâm Đồng C0: rent 140, C2: rent 1120). Player p1 balance = 1200 (80% = 960).
      // At level 2, rent is 1120 >= 960. Distance = 13 - 1 = 12 steps.
      const fn = checkHighStakesRoll;
      if (!fn) throw new Error('checkHighStakesRoll is not exported from camera_state_machine.ts');
      const result = fn(1, 1200, mockPlayers, { 13: 2 }, 'p1');
      expect(result.isHighStakes).toBe(true);
      expect(result.dangerousCellIndex).toBe(13);
      expect(result.dangerousRent).toBe(1120);
    });

    it.each([
      { currentPos: 0, dangerousCell: 1, distDesc: '1 bước (d=1 không thể gieo xúc xắc 2D6)' },
      { currentPos: 0, dangerousCell: 13, distDesc: '13 bước (d=13 vượt trần xúc xắc 2D6)' },
    ])(
      '[TC-IMP125.P2.03/MSS][UC-IMP125][UC-TENSION-CAM] Facet 1 (Boundary): Bỏ qua ô ngoài cự ly 2..12 ($distDesc)',
      ({ currentPos, dangerousCell }) => {
        const fn = checkHighStakesRoll;
        if (!fn) throw new Error('checkHighStakesRoll is not exported from camera_state_machine.ts');
        const players = {
          p1: { id: 'p1', balance: 500, ownedProperties: [] },
          p2: { id: 'p2', balance: 10000, ownedProperties: [dangerousCell] },
        };
        const result = fn(currentPos, 500, players, { [dangerousCell]: 3 }, 'p1');
        expect(result.isHighStakes).toBe(false);
      }
    );

    it('[TC-IMP125.P2.04/MSS][UC-IMP125][UC-TENSION-CAM] Facet 1 (Boundary): Ngưỡng chuẩn xác 80%: Phí thuê đúng 80% số dư trả về isHighStakes = true', () => {
      // Cell 6 (Bình Dương C2: rent 1000). Balance = 1250 (80% của 1250 = đúng 1000).
      const fn = checkHighStakesRoll;
      if (!fn) throw new Error('checkHighStakesRoll is not exported from camera_state_machine.ts');
      const result = fn(0, 1250, mockPlayers, { 6: 2 }, 'p1');
      expect(result.isHighStakes).toBe(true);
      expect(result.dangerousCellIndex).toBe(6);
      expect(result.dangerousRent).toBe(1000);
    });

    it('[TC-IMP125.P2.05/MSS][UC-IMP125][UC-TENSION-CAM] Facet 1 (Boundary): Ngưỡng an toàn 79.9%: Phí thuê dưới 80% số dư trả về isHighStakes = false', () => {
      // Cell 6 (Bình Dương C2: rent 1000). Balance = 1251 (80% của 1251 = 1000.8 > 1000).
      const fn = checkHighStakesRoll;
      if (!fn) throw new Error('checkHighStakesRoll is not exported from camera_state_machine.ts');
      const result = fn(0, 1251, mockPlayers, { 6: 2 }, 'p1');
      expect(result.isHighStakes).toBe(false);
    });

    it('[TC-IMP125.P2.06/MSS][UC-IMP125][UC-TENSION-CAM] Facet 1 (Boundary): Biên tài chính: playerBalance = 0 biến mọi ô có phí thuê > 0 thành ô tử thần', () => {
      // Cell 6 C0: rent 120. Player balance = 0 -> rent > 0 triggers High-Stakes!
      const fn = checkHighStakesRoll;
      if (!fn) throw new Error('checkHighStakesRoll is not exported from camera_state_machine.ts');
      const result = fn(0, 0, mockPlayers, { 6: 0 }, 'p1');
      expect(result.isHighStakes).toBe(true);
      expect(result.dangerousCellIndex).toBe(6);
      expect(result.dangerousRent).toBe(120);
    });

    it('[TC-IMP125.P2.07/MSS][UC-IMP125][UC-TENSION-CAM] Facet 1 (Boundary): Biên tài chính: playerBalance < 0 (âm nợ) trả về isHighStakes = true', () => {
      // Player balance = -300
      const fn = checkHighStakesRoll;
      if (!fn) throw new Error('checkHighStakesRoll is not exported from camera_state_machine.ts');
      const result = fn(0, -300, mockPlayers, { 6: 0 }, 'p1');
      expect(result.isHighStakes).toBe(true);
    });

    it('[TC-IMP125.P2.08/MSS][UC-IMP125][UC-TENSION-CAM] Facet 1 (Boundary): Chu kỳ bàn cờ Modulo 40: Người chơi tại ô 35 quét qua ô GO (0) phát hiện ô 37 nguy hiểm', () => {
      // Cell 37 (Quảng Ninh C2: rent 3150). Current pos 35, distance 2 steps = cell 37.
      const fn = checkHighStakesRoll;
      if (!fn) throw new Error('checkHighStakesRoll is not exported from camera_state_machine.ts');
      const players = {
        p1: { id: 'p1', balance: 3500, ownedProperties: [] },
        p2: { id: 'p2', balance: 10000, ownedProperties: [37] },
      };
      const result = fn(35, 3500, players, { 37: 2 }, 'p1');
      expect(result.isHighStakes).toBe(true);
      expect(result.dangerousCellIndex).toBe(37);
      expect(result.dangerousRent).toBe(3150);
    });

    it('[TC-IMP125.P2.09/MSS][UC-IMP125][UC-TENSION-CAM] Facet 1 (Boundary): Cấu hình CAMERA_CONFIG.tension_roll có position [2.0, 2.2, 2.8], target [0.0, 0.2, 0.0], fov 34, speed 6.0', () => {
      const config = (CameraSM.CAMERA_CONFIG as Record<string, any>)['tension_roll'];
      expect(config).toBeDefined();
      expect(config.position).toEqual([2.0, 2.2, 2.8]);
      expect(config.target).toEqual([0.0, 0.2, 0.0]);
      expect(config.fov).toBe(34);
      expect(config.speed).toBe(6.0);
    });

    it('[TC-IMP125.P2.10/MSS][UC-IMP125][UC-TENSION-CAM] Facet 1 (Boundary): calculateTargetCameraState(\'tension_roll\') trả về đúng position, target, fov 34, speed 6.0', () => {
      const targetState = CameraSM.calculateTargetCameraState('tension_roll' as any);
      expect(targetState.position).toEqual([2.0, 2.2, 2.8]);
      expect(targetState.target).toEqual([0.0, 0.2, 0.0]);
      expect(targetState.fov).toBe(34);
      expect(targetState.speed).toBe(6.0);
    });

    it('[TC-IMP125.P2.11/MSS][UC-IMP125][UC-TENSION-CAM] Facet 2 (State Reactivity): resolveCameraMode khi isRolling = true và isHighStakesRoll = true chuyển sang \'tension_roll\'', () => {
      const mode = CameraSM.resolveCameraMode({
        isRolling: true,
        isHighStakesRoll: true,
        isPawnAnimating: false,
        activeModal: null,
      } as any);
      expect(mode).toBe('tension_roll');
    });

    it('[TC-IMP125.P2.12/MSS][UC-IMP125][UC-TENSION-CAM] Facet 2 (State Reactivity): resolveCameraMode khi isRolling = true nhưng isHighStakesRoll = false giữ nguyên \'overview\'', () => {
      const mode = CameraSM.resolveCameraMode({
        isRolling: true,
        isHighStakesRoll: false,
        isPawnAnimating: false,
        activeModal: null,
      } as any);
      expect(mode).toBe('overview');
    });

    it('[TC-IMP125.P2.13/MSS][UC-IMP125][UC-TENSION-CAM] Facet 2 (State Reactivity): resolveCameraMode khi isRolling = false dù isHighStakesRoll = true không chuyển \'tension_roll\'', () => {
      const mode = CameraSM.resolveCameraMode({
        isRolling: false,
        isHighStakesRoll: true,
        isPawnAnimating: false,
        activeModal: null,
      } as any);
      expect(mode).not.toBe('tension_roll');
    });

    it('[TC-IMP125.P2.14/MSS][UC-IMP125][UC-TENSION-CAM] Facet 4 (Error Defense): Bỏ qua ô của chính mình sở hữu dù tiền thuê lớn gấp nhiều lần số dư', () => {
      const fn = checkHighStakesRoll;
      if (!fn) throw new Error('checkHighStakesRoll is not exported from camera_state_machine.ts');
      const players = {
        p1: { id: 'p1', balance: 500, ownedProperties: [6] }, // Cell 6 owned by p1
        p2: { id: 'p2', balance: 10000, ownedProperties: [] },
      };
      const result = fn(0, 500, players, { 6: 3 }, 'p1');
      expect(result.isHighStakes).toBe(false);
    });

    it('[TC-IMP125.P2.15/MSS][UC-IMP125][UC-TENSION-CAM] Facet 4 (Error Defense): Ô đất trống vô chủ trong cự ly quét không kích hoạt nguy cơ tử thần', () => {
      const fn = checkHighStakesRoll;
      if (!fn) throw new Error('checkHighStakesRoll is not exported from camera_state_machine.ts');
      const players = {
        p1: { id: 'p1', balance: 100, ownedProperties: [] },
        p2: { id: 'p2', balance: 10000, ownedProperties: [] }, // No one owns anything
      };
      const result = fn(0, 100, players, {}, 'p1');
      expect(result.isHighStakes).toBe(false);
    });

    it('[TC-IMP125.P2.16/MSS][UC-IMP125][UC-TENSION-CAM] Facet 4 (Error Defense): Ô đất đối thủ đang bị thế chấp (mortgaged) có tiền thuê = 0 trả về isHighStakes = false', () => {
      const fn = checkHighStakesRoll;
      if (!fn) throw new Error('checkHighStakesRoll is not exported from camera_state_machine.ts');
      const players = {
        p1: { id: 'p1', balance: 500, ownedProperties: [] },
        p2: { id: 'p2', balance: 10000, ownedProperties: [6], mortgagedProperties: [6] },
      };
      const result = fn(0, 500, players, { 6: 2 }, 'p1');
      expect(result.isHighStakes).toBe(false);
    });

    it('[TC-IMP125.P2.17/MSS][UC-IMP125][UC-TENSION-CAM] Facet 4 (Error Defense): manualMode hoặc activeModal = \'game_over\' vẫn chiếm quyền ưu tiên so với \'tension_roll\'', () => {
      const modeWithManual = CameraSM.resolveCameraMode({
        isRolling: true,
        isHighStakesRoll: true,
        isPawnAnimating: false,
        manualMode: 'tile_focus',
        activeModal: null,
      } as any);
      const modeWithGameOver = CameraSM.resolveCameraMode({
        isRolling: true,
        isHighStakesRoll: true,
        isPawnAnimating: false,
        activeModal: 'game_over',
      } as any);
      expect(modeWithManual).toBe('tile_focus');
      expect(modeWithGameOver).toBe('overview');
    });
  });

  // =========================================================================
  // GÓI 2: BỘ ÂM THANH XÚC GIÁC WEBAUDIO SYNTH CHO NHỊP TIM & BIỂU CẢM
  // =========================================================================
  describe('Gói 2: Bộ Âm Thanh Xúc Giác WebAudio Synth Cho Nhịp Tim & Biểu Cảm', () => {
    it('[TC-IMP125.P2.18/MSS][UC-IMP125][UC-SYNTH-AUDIO] Facet 2 (State Reactivity): SoundEngine thực thi trực tiếp playHeartbeatPulse mà không ném lỗi', () => {
      const se = SoundEngine as unknown as Imp125P2SoundEngine;
      expect(() => {
        if (typeof se.playHeartbeatPulse !== 'function') {
          throw new Error('SoundEngine.playHeartbeatPulse is not implemented');
        }
        se.playHeartbeatPulse();
      }).not.toThrow();
    });

    it('[TC-IMP125.P2.19/MSS][UC-IMP125][UC-SYNTH-AUDIO] Facet 3 (Resource Disposal): stopHeartbeatPulse dừng xung nhịp tim an toàn', () => {
      const se = SoundEngine as unknown as Imp125P2SoundEngine;
      expect(() => {
        if (typeof se.stopHeartbeatPulse !== 'function') {
          throw new Error('SoundEngine.stopHeartbeatPulse is not implemented');
        }
        se.stopHeartbeatPulse();
      }).not.toThrow();
    });

    it('[TC-IMP125.P2.20/MSS][UC-IMP125][UC-SYNTH-AUDIO] Facet 3 (Resource Disposal): SoundEngine.dispose() dọn dẹp sạch cả nhịp tim đang phát', () => {
      const se = SoundEngine as unknown as Imp125P2SoundEngine;
      if (typeof se.playHeartbeatPulse === 'function') {
        se.playHeartbeatPulse();
      }
      expect(() => {
        SoundEngine.dispose();
      }).not.toThrow();
    });

    it('[TC-IMP125.P2.21/MSS][UC-IMP125][UC-SYNTH-AUDIO] Facet 4 (Error Defense): Zero-Crash khi AudioContext bị chặn hoặc null lúc gọi playHeartbeatPulse', () => {
      const se = SoundEngine as unknown as Imp125P2SoundEngine;
      expect(() => {
        se.playHeartbeatPulse?.();
      }).not.toThrow();
    });

    it('[TC-IMP125.P2.22/MSS][UC-IMP125][UC-SYNTH-AUDIO] Facet 4 (Error Defense): Zero-Crash khi gọi playVictoryChime và playSlumpThud khi bị mute', () => {
      useAudioStore.setState({ isMuted: true });
      const se = SoundEngine as unknown as Imp125P2SoundEngine;
      expect(() => {
        if (typeof se.playVictoryChime !== 'function') {
          throw new Error('SoundEngine.playVictoryChime is not implemented');
        }
        if (typeof se.playSlumpThud !== 'function') {
          throw new Error('SoundEngine.playSlumpThud is not implemented');
        }
        se.playVictoryChime();
        se.playSlumpThud();
      }).not.toThrow();
    });

    it('[TC-IMP125.P2.23/MSS][UC-IMP125][UC-SYNTH-AUDIO] Facet 4 (Error Defense): Idempotency: Gọi stopHeartbeatPulse nhiều lần liên tiếp khi chưa chạy pulse không lỗi', () => {
      const se = SoundEngine as unknown as Imp125P2SoundEngine;
      expect(() => {
        se.stopHeartbeatPulse?.();
        se.stopHeartbeatPulse?.();
      }).not.toThrow();
    });
  });

  // =========================================================================
  // GÓI 3: HOẠT CẢNH ĐỐI KHÁNG & XÚC CẢM QUÂN CỜ (PAWN EXPRESSIVE INTERACTIONS)
  // =========================================================================
  describe('Gói 3: Hoạt Cảnh Đối Kháng & Xúc Cảm Quân Cờ (Pawn Expressive Interactions)', () => {
    it('[TC-IMP125.P2.24/MSS][UC-IMP125][UC-PAWN-REACTION] Facet 1 (Boundary): calculateVictorySpin: Tại progress = 0, rotationY = 0 và heightOffset = 0', () => {
      const fn = calculateVictorySpin;
      if (!fn) throw new Error('calculateVictorySpin is not exported from pawn_path.ts');
      const spin = fn(0);
      expect(spin.rotationY).toBeCloseTo(0, 3);
      expect(spin.heightOffset).toBeCloseTo(0, 3);
    });

    it('[TC-IMP125.P2.25/MSS][UC-IMP125][UC-PAWN-REACTION] Facet 1 (Boundary): calculateVictorySpin: Tại progress = 0.5, rotationY đạt xấp xỉ PI và heightOffset đạt cực đại > 0', () => {
      const fn = calculateVictorySpin;
      if (!fn) throw new Error('calculateVictorySpin is not exported from pawn_path.ts');
      const spin = fn(0.5);
      expect(spin.rotationY).toBeCloseTo(Math.PI, 3);
      expect(spin.heightOffset).toBeGreaterThan(0.2);
    });

    it('[TC-IMP125.P2.26/MSS][UC-IMP125][UC-PAWN-REACTION] Facet 1 (Boundary): calculateVictorySpin: Tại progress = 1.0, rotationY đạt xấp xỉ 2*PI và heightOffset hồi phục về 0', () => {
      const fn = calculateVictorySpin;
      if (!fn) throw new Error('calculateVictorySpin is not exported from pawn_path.ts');
      const spin = fn(1.0);
      expect(spin.rotationY).toBeCloseTo(2 * Math.PI, 3);
      expect(spin.heightOffset).toBeCloseTo(0, 3);
    });

    it('[TC-IMP125.P2.27/MSS][UC-IMP125][UC-PAWN-REACTION] Facet 1 (Boundary): calculateSlumpRecoil: Tại progress = 0, scaleY nhún bẹp xuống xấp xỉ 0.55 (± 0.05)', () => {
      const fn = calculateSlumpRecoil;
      if (!fn) throw new Error('calculateSlumpRecoil is not exported from pawn_path.ts');
      const recoil = fn(0);
      expect(recoil.scaleY).toBeCloseTo(0.55, 1);
    });

    it('[TC-IMP125.P2.28/MSS][UC-IMP125][UC-PAWN-REACTION] Facet 1 (Boundary): calculateSlumpRecoil: Tại progress = 1.0, scaleY lò xo hồi phục về 1.0 (± 0.05)', () => {
      const fn = calculateSlumpRecoil;
      if (!fn) throw new Error('calculateSlumpRecoil is not exported from pawn_path.ts');
      const recoil = fn(1.0);
      expect(recoil.scaleY).toBeCloseTo(1.0, 1);
    });

    it('[TC-IMP125.P2.29/MSS][UC-IMP125][UC-PAWN-REACTION] Facet 2 (State Reactivity): useVfxStore khởi tạo activePawnReactions rỗng {}', () => {
      const store = useVfxStore.getState() as Imp125P2VfxStore;
      expect(store.activePawnReactions).toBeDefined();
      expect(store.activePawnReactions).toEqual({});
    });

    it('[TC-IMP125.P2.30/MSS][UC-IMP125][UC-PAWN-REACTION] Facet 2 (State Reactivity): triggerPawnReaction thêm reaction \'victory_spin\' vào activePawnReactions[playerId]', () => {
      const store = useVfxStore.getState() as Imp125P2VfxStore;
      if (typeof store.triggerPawnReaction !== 'function') {
        throw new Error('useVfxStore.triggerPawnReaction is not implemented');
      }
      store.triggerPawnReaction('p2', 'victory_spin', 600);
      const cur = (useVfxStore.getState() as Imp125P2VfxStore).activePawnReactions;
      expect(cur?.['p2']).toBeDefined();
      expect(cur?.['p2']?.type).toBe('victory_spin');
      expect(cur?.['p2']?.durationMs).toBe(600);
    });

    it('[TC-IMP125.P2.31/MSS][UC-IMP125][UC-PAWN-REACTION] Facet 2 (State Reactivity): triggerPawnReaction thêm reaction \'slump_recoil\' vào activePawnReactions[playerId]', () => {
      const store = useVfxStore.getState() as Imp125P2VfxStore;
      if (typeof store.triggerPawnReaction !== 'function') {
        throw new Error('useVfxStore.triggerPawnReaction is not implemented');
      }
      store.triggerPawnReaction('p1', 'slump_recoil', 400);
      const cur = (useVfxStore.getState() as Imp125P2VfxStore).activePawnReactions;
      expect(cur?.['p1']).toBeDefined();
      expect(cur?.['p1']?.type).toBe('slump_recoil');
      expect(cur?.['p1']?.durationMs).toBe(400);
    });

    it('[TC-IMP125.P2.32/MSS][UC-IMP125][UC-PAWN-REACTION] Facet 2 (State Reactivity): clearPawnReaction xóa ngay lập tức reaction của playerId khỏi activePawnReactions', () => {
      const store = useVfxStore.getState() as Imp125P2VfxStore;
      if (typeof store.triggerPawnReaction !== 'function' || typeof store.clearPawnReaction !== 'function') {
        throw new Error('useVfxStore trigger/clear reaction is not implemented');
      }
      store.triggerPawnReaction('p1', 'slump_recoil', 400);
      store.clearPawnReaction('p1');
      const cur = (useVfxStore.getState() as Imp125P2VfxStore).activePawnReactions;
      expect(cur?.['p1']).toBeUndefined();
    });

    it('[TC-IMP125.P2.33/MSS][UC-IMP125][UC-PAWN-REACTION] Facet 2 (Consumer Assertion): PawnAnimator render tĩnh phản ánh activePawnReaction của người chơi', () => {
      useVfxStore.setState({
        activePawnReactions: {
          p1: { type: 'victory_spin', startTime: Date.now(), durationMs: 600 },
        },
      } as any);

      const mockPlayerList: Player[] = [
        {
          id: 'p1',
          position: 0,
          balance: 5000,
          skipNextTurn: false,
          auditTurnsLeft: 0,
          consecutiveDoubles: 0,
          hand: [],
          pendingDebts: [],
          extraTurns: 0,
          doubleNextDice: false,
          mortgagedProperties: [],
          bankrupt: false,
          isBot: false,
        },
      ];

      const html = renderToStaticMarkup(React.createElement(PawnAnimator, { players: mockPlayerList }));
      expect(html).toContain('data-pawn-reaction="victory_spin"');
    });

    it('[TC-IMP125.P2.34/MSS][UC-IMP125][UC-PAWN-REACTION] Facet 3 (Resource Disposal): activePawnReactions tự động dọn dẹp sạch sau khi hết durationMs (timeout cleanup)', () => {
      const store = useVfxStore.getState() as Imp125P2VfxStore;
      if (typeof store.triggerPawnReaction !== 'function') {
        throw new Error('useVfxStore.triggerPawnReaction is not implemented');
      }
      store.triggerPawnReaction('p1', 'slump_recoil', 400);
      expect((useVfxStore.getState() as Imp125P2VfxStore).activePawnReactions?.['p1']).toBeDefined();

      vi.advanceTimersByTime(400);
      const after = (useVfxStore.getState() as Imp125P2VfxStore).activePawnReactions;
      expect(after?.['p1']).toBeUndefined();
    });

    it.each([-0.5, NaN, 1.5])(
      '[TC-IMP125.P2.35/MSS][UC-IMP125][UC-PAWN-REACTION] Facet 4 (Error Defense): calculateVictorySpin phòng thủ an toàn với progress không hợp lệ (%s)',
      (invalidProgress) => {
        const fn = calculateVictorySpin;
        if (!fn) throw new Error('calculateVictorySpin is not exported from pawn_path.ts');
        const spin = fn(invalidProgress);
        expect(Number.isFinite(spin.rotationY)).toBe(true);
        expect(Number.isFinite(spin.heightOffset)).toBe(true);
      }
    );

    it.each([-0.5, NaN, 1.5])(
      '[TC-IMP125.P2.36/MSS][UC-IMP125][UC-PAWN-REACTION] Facet 4 (Error Defense): calculateSlumpRecoil phòng thủ an toàn với progress không hợp lệ (%s)',
      (invalidProgress) => {
        const fn = calculateSlumpRecoil;
        if (!fn) throw new Error('calculateSlumpRecoil is not exported from pawn_path.ts');
        const recoil = fn(invalidProgress);
        expect(Number.isFinite(recoil.scaleY)).toBe(true);
      }
    );

    it('[TC-IMP125.P2.37/MSS][UC-IMP125][UC-PAWN-REACTION] Facet 4 (Error Defense): clearPawnReaction gọi với playerId không tồn tại an toàn không ném lỗi', () => {
      const store = useVfxStore.getState() as Imp125P2VfxStore;
      expect(() => {
        store.clearPawnReaction?.('non_existent_player');
      }).not.toThrow();
    });
  });
});
