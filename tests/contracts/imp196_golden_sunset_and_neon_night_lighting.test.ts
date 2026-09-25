// [TC-196.01/MSS..TC-196.18/MSS][UC-IMP196] Contract Test Suite: Golden Sunset & Vibrant Neon Night Lighting Refinement
// Universal 5-Facet Behavioral Matrix:
// Facet 1: [TC-196.01-04] Thông Số Sunset Golden Hour (Y=24, #FDE047, #FEF3C7, 80-250m)
// Facet 2: [TC-196.05-08] Thông Số Night Neon Metropolis (Y=32, #93C5FD, #38BDF8, #0C1527, 75-240m)
// Facet 3: [TC-196.09-11] Đèn Top-Down Fill Light Cả 3 Pha (Normal Gameplay: Day 0.25, Sunset 0.18, Night 0.14)
// Facet 4: [TC-196.12-14] Bảo Vệ Sàn Đấu Giá Kịch Tính (Theatrical Auction Dims Top-Down Fill to 0.05 across all phases)
// Facet 5: [TC-196.15-18] Khả Năng Điều Tiết Môi Trường IBL, Smooth Lerp qua topDownRef & Subtractive Refactoring

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  TIME_OF_DAY_PRESETS,
  type TimeOfDayPhase,
} from '../../src/client/store/environment_store';
import * as TimeOfDayLightingModule from '../../src/client/3d/time_of_day_lighting';

// Dynamic resolver harness for Station 1 RED: safely references functions to produce informative Business RED
const calculateTopDownFill = (TimeOfDayLightingModule as Record<string, unknown>).calculateTopDownFill as
  | ((phase: TimeOfDayPhase, isAuctionActive: boolean) => { intensity: number; color: string })
  | undefined;

const calculateBaseEnv = (TimeOfDayLightingModule as Record<string, unknown>).calculateBaseEnv as
  | ((phase: TimeOfDayPhase) => number)
  | undefined;

describe('[TC-IMP196/MSS][UC-IMP196] Golden Sunset & Neon Night Lighting Refinement Suite', () => {
  // =========================================================================
  // FACET 1: THÔNG SỐ SUNSET GOLDEN HOUR (ELIMINATE LONG SHADOWS & AMBER HARMONY)
  // =========================================================================
  describe('Facet 1: Sunset Golden Hour Optical Parameters', () => {
    it('[TC-196.01/MSS][UC-IMP196] Sunset sunPosition elevates Y coordinate to 24 [-28, 24, 18] to eliminate long shadows', () => {
      expect(TIME_OF_DAY_PRESETS.sunset.sunPosition[1]).toBe(24);
      expect(TIME_OF_DAY_PRESETS.sunset.sunPosition).toEqual([-28, 24, 18]);
    });

    it('[TC-196.02/MSS][UC-IMP196] Sunset sunColor uses royal golden amber #FDE047 and sunIntensity softens to 0.95', () => {
      expect(TIME_OF_DAY_PRESETS.sunset.sunColor).toBe('#FDE047');
      expect(TIME_OF_DAY_PRESETS.sunset.sunIntensity).toBe(0.95);
    });

    it('[TC-196.03/MSS][UC-IMP196] Sunset ambient and hemisphere lighting radiates warm terracotta #9A3412 without mud tone', () => {
      expect(TIME_OF_DAY_PRESETS.sunset.ambientColor).toBe('#FEF3C7');
      expect(TIME_OF_DAY_PRESETS.sunset.ambientIntensity).toBe(0.28);
      expect(TIME_OF_DAY_PRESETS.sunset.hemiGroundColor).toBe('#9A3412');
      expect(TIME_OF_DAY_PRESETS.sunset.hemiIntensity).toBe(0.24);
    });

    it('[TC-196.04/MSS][UC-IMP196] Sunset skyColor uses soothing sunset orange #EA580C with extended fog range [80, 250]', () => {
      expect(TIME_OF_DAY_PRESETS.sunset.skyColor).toBe('#EA580C');
      expect(TIME_OF_DAY_PRESETS.sunset.fogNear).toBe(80);
      expect(TIME_OF_DAY_PRESETS.sunset.fogFar).toBe(250);
    });
  });

  // =========================================================================
  // FACET 2: THÔNG SỐ NIGHT NEON METROPOLIS (VIBRANT METROPOLIS & MOONBEAM ELEVATION)
  // =========================================================================
  describe('Facet 2: Night Neon Metropolis Optical Parameters', () => {
    it('[TC-196.05/MSS][UC-IMP196] Night sunPosition elevates Y coordinate to 32 [18, 32, -20] for high-angle moonbeam', () => {
      expect(TIME_OF_DAY_PRESETS.night.sunPosition[1]).toBe(32);
      expect(TIME_OF_DAY_PRESETS.night.sunPosition).toEqual([18, 32, -20]);
    });

    it('[TC-196.06/MSS][UC-IMP196] Night sunColor uses silver moonbeam #93C5FD with intensity 0.65', () => {
      expect(TIME_OF_DAY_PRESETS.night.sunColor).toBe('#93C5FD');
      expect(TIME_OF_DAY_PRESETS.night.sunIntensity).toBe(0.65);
    });

    it('[TC-196.07/MSS][UC-IMP196] Night ambient and hemisphere lighting radiates luminescent cyan #38BDF8 and deep ocean #0369A1', () => {
      expect(TIME_OF_DAY_PRESETS.night.ambientColor).toBe('#38BDF8');
      expect(TIME_OF_DAY_PRESETS.night.ambientIntensity).toBe(0.40);
      expect(TIME_OF_DAY_PRESETS.night.hemiGroundColor).toBe('#0369A1');
      expect(TIME_OF_DAY_PRESETS.night.hemiIntensity).toBe(0.26);
    });

    it('[TC-196.08/MSS][UC-IMP196] Night sky uses cinematic deep indigo #0C1527 with atmospheric fog #0F172A [75, 240]', () => {
      expect(TIME_OF_DAY_PRESETS.night.skyColor).toBe('#0C1527');
      expect(TIME_OF_DAY_PRESETS.night.fogColor).toBe('#0F172A');
      expect(TIME_OF_DAY_PRESETS.night.fogNear).toBe(75);
      expect(TIME_OF_DAY_PRESETS.night.fogFar).toBe(240);
    });
  });

  // =========================================================================
  // FACET 3: ĐÈN TOP-DOWN FILL LIGHT CẢ 3 PHA (NORMAL GAMEPLAY ZOOM CLARITY)
  // =========================================================================
  describe('Facet 3: Top-Down Fill Light System Across All 3 Phases', () => {
    it('[TC-196.09/MSS][UC-IMP196] calculateTopDownFill for day phase returns crisp zenith fill 0.25 and #F8FAFC', () => {
      const fill = calculateTopDownFill ? calculateTopDownFill('day', false) : undefined;
      expect(fill).toEqual({ intensity: 0.25, color: '#F8FAFC' });
    });

    it('[TC-196.10/MSS][UC-IMP196] calculateTopDownFill for sunset phase returns warm golden fill 0.18 and #FEF3C7', () => {
      const fill = calculateTopDownFill ? calculateTopDownFill('sunset', false) : undefined;
      expect(fill).toEqual({ intensity: 0.18, color: '#FEF3C7' });
    });

    it('[TC-196.11/MSS][UC-IMP196] calculateTopDownFill for night phase returns soft neon fill 0.14 and #BAE6FD', () => {
      const fill = calculateTopDownFill ? calculateTopDownFill('night', false) : undefined;
      expect(fill).toEqual({ intensity: 0.14, color: '#BAE6FD' });
    });
  });

  // =========================================================================
  // FACET 4: BẢO VỆ SÀN ĐẤU GIÁ KỊCH TÍNH (THEATRICAL AUCTION LIGHTING DIMS FILL)
  // =========================================================================
  describe('Facet 4: Theatrical Auction Stage Fill Light Attenuation', () => {
    it('[TC-196.12/MSS][UC-IMP196] calculateTopDownFill dims day fill intensity to 0.05 during active auction', () => {
      const fill = calculateTopDownFill ? calculateTopDownFill('day', true) : undefined;
      expect(fill).toEqual({ intensity: 0.05, color: '#F8FAFC' });
    });

    it('[TC-196.13/MSS][UC-IMP196] calculateTopDownFill dims sunset fill intensity to 0.05 during active auction', () => {
      const fill = calculateTopDownFill ? calculateTopDownFill('sunset', true) : undefined;
      expect(fill).toEqual({ intensity: 0.05, color: '#FEF3C7' });
    });

    it('[TC-196.14/MSS][UC-IMP196] calculateTopDownFill dims night fill intensity to 0.05 during active auction', () => {
      const fill = calculateTopDownFill ? calculateTopDownFill('night', true) : undefined;
      expect(fill).toEqual({ intensity: 0.05, color: '#BAE6FD' });
    });
  });

  // =========================================================================
  // FACET 5: ĐIỀU TIẾT MÔI TRƯỜNG IBL, SMOOTH LERP QUA TOPDOWNREF & SUBTRACTIVE REFACTORING
  // =========================================================================
  describe('Facet 5: PBR Environment Regulation & Smooth Top-Down Lerp Architecture', () => {
    it('[TC-196.15/MSS][UC-IMP196] calculateBaseEnv returns calibrated PBR environment intensities across all 3 phases', () => {
      const dayEnv = calculateBaseEnv ? calculateBaseEnv('day') : undefined;
      const sunsetEnv = calculateBaseEnv ? calculateBaseEnv('sunset') : undefined;
      const nightEnv = calculateBaseEnv ? calculateBaseEnv('night') : undefined;

      expect(dayEnv).toBe(0.75);
      expect(sunsetEnv).toBe(0.38);
      expect(nightEnv).toBe(0.28);
    });

    it('[TC-196.16/MSS][UC-IMP196] TimeOfDayLighting declares topDownRef and mounts it to directionalLight for smooth lerp', () => {
      const filePath = path.resolve('src/client/3d/time_of_day_lighting.tsx');
      const content = fs.readFileSync(filePath, 'utf-8');

      expect(content).toContain('topDownRef');
      expect(content).toContain('ref={topDownRef}');
    });

    it('[TC-196.17/MSS][UC-IMP196] Subtractive Refactoring: Purges legacy direct JSX expression that caused brightness jumps', () => {
      const filePath = path.resolve('src/client/3d/time_of_day_lighting.tsx');
      const content = fs.readFileSync(filePath, 'utf-8');

      // Old buggy code lacked ref and calculated intensity dynamically inside JSX props
      expect(content).not.toContain("intensity={phase === 'day' ? (isAuctionActive ? 0.05 : 0.25) : 0}");
    });

    it('[TC-196.18/MSS][UC-IMP196] Preservation of IMP-80 Contract TC-80.15: Rim light color formula remains intact', () => {
      const filePath = path.resolve('src/client/3d/time_of_day_lighting.tsx');
      const content = fs.readFileSync(filePath, 'utf-8');

      expect(content).toContain("phase === 'night' ? '#38BDF8' : phase === 'sunset' ? '#EA580C' : '#F8FAFC'");
    });
  });
});
