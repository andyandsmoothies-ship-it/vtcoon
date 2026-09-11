// [UI-S04/MSS] TimeOfDay — Dynamic Time-of-Day & Neon Metropolis Night Contract Tests
import { describe, it, expect, beforeEach } from 'vitest';
import {
  useEnvironmentStore,
  calculatePhaseFromProgress,
  calculateAviationStrobe,
  calculateLaserRotation,
  getNextTimeOfDayMode,
  TIME_OF_DAY_PRESETS,
  AUTO_CYCLE_DURATION_SECONDS,
  type TimeOfDayPhase,
} from '../../src/client/store/environment_store';
import { TimeOfDayLighting } from '../../src/client/3d/time_of_day_lighting';
import fs from 'node:fs';
import path from 'node:path';

describe('[UI-S04/MSS] Environment Store — Time-of-Day State Machine & Presets', () => {
  beforeEach(() => {
    useEnvironmentStore.setState({
      mode: 'auto',
      phase: 'day',
      isAuto: true,
    });
  });

  it('Khoi tao mac dinh o che do auto va pha ban ngay (day)', () => {
    const state = useEnvironmentStore.getState();
    expect(state.mode).toBe('auto');
    expect(state.phase).toBe('day');
    expect(state.isAuto).toBe(true);
    expect(AUTO_CYCLE_DURATION_SECONDS).toBe(90);
  });

  it('calculatePhaseFromProgress phan doan chinh xac 3 pha dua tren moc thoi gian [0..1]', () => {
    // 0.0 .. <0.42 -> 'day'
    expect(calculatePhaseFromProgress(0.0)).toBe('day');
    expect(calculatePhaseFromProgress(0.20)).toBe('day');
    expect(calculatePhaseFromProgress(0.419)).toBe('day');

    // 0.42 .. <0.58 -> 'sunset'
    expect(calculatePhaseFromProgress(0.42)).toBe('sunset');
    expect(calculatePhaseFromProgress(0.50)).toBe('sunset');
    expect(calculatePhaseFromProgress(0.579)).toBe('sunset');

    // 0.58 .. <0.92 -> 'night'
    expect(calculatePhaseFromProgress(0.58)).toBe('night');
    expect(calculatePhaseFromProgress(0.75)).toBe('night');
    expect(calculatePhaseFromProgress(0.90)).toBe('night');
    expect(calculatePhaseFromProgress(0.919)).toBe('night');

    // >= 0.92 -> 'day' (Rang sang chuyen tiep ve ngay moi)
    expect(calculatePhaseFromProgress(0.92)).toBe('day');
    expect(calculatePhaseFromProgress(0.99)).toBe('day');

    // Xu ly gia tri ngoai le / chu ky tuan hoan am hoac > 1
    expect(calculatePhaseFromProgress(1.5)).toBe('sunset');
    expect(calculatePhaseFromProgress(Number.NaN)).toBe('day');
  });

  it('getNextTimeOfDayMode xoay vong che do tuan tu: auto -> day -> sunset -> night -> auto', () => {
    expect(getNextTimeOfDayMode('auto')).toBe('day');
    expect(getNextTimeOfDayMode('day')).toBe('sunset');
    expect(getNextTimeOfDayMode('sunset')).toBe('night');
    expect(getNextTimeOfDayMode('night')).toBe('auto');
  });

  it('toggleNextMode cap nhat store chinh xac khi nguoi choi nhan nut tren TopBar', () => {
    const store = useEnvironmentStore.getState();

    // auto -> day
    store.toggleNextMode();
    expect(useEnvironmentStore.getState().mode).toBe('day');
    expect(useEnvironmentStore.getState().phase).toBe('day');
    expect(useEnvironmentStore.getState().isAuto).toBe(false);

    // day -> sunset
    useEnvironmentStore.getState().toggleNextMode();
    expect(useEnvironmentStore.getState().mode).toBe('sunset');
    expect(useEnvironmentStore.getState().phase).toBe('sunset');
    expect(useEnvironmentStore.getState().isAuto).toBe(false);

    // sunset -> night
    useEnvironmentStore.getState().toggleNextMode();
    expect(useEnvironmentStore.getState().mode).toBe('night');
    expect(useEnvironmentStore.getState().phase).toBe('night');
    expect(useEnvironmentStore.getState().isAuto).toBe(false);

    // night -> auto
    useEnvironmentStore.getState().toggleNextMode();
    expect(useEnvironmentStore.getState().mode).toBe('auto');
    expect(useEnvironmentStore.getState().isAuto).toBe(true);
  });

  it('calculateAviationStrobe nhap nhay den canh bao hang khong theo chu ky xung', () => {
    // Voi freq = 1.0: cycle = time % 1. Bat khi cycle < 0.2
    expect(calculateAviationStrobe(0.0, 1.0)).toBe(true);
    expect(calculateAviationStrobe(0.1, 1.0)).toBe(true);
    expect(calculateAviationStrobe(0.19, 1.0)).toBe(true);
    expect(calculateAviationStrobe(0.21, 1.0)).toBe(false);
    expect(calculateAviationStrobe(0.85, 1.0)).toBe(false);
    expect(calculateAviationStrobe(Number.NaN)).toBe(false);
  });

  it('calculateLaserRotation quay deu theo toc do thoi gian', () => {
    const rot0 = calculateLaserRotation(0, 0.5);
    const rot1 = calculateLaserRotation(2, 0.5);
    expect(rot0).toBe(0);
    expect(rot1).toBeCloseTo(1.0, 4);
    expect(calculateLaserRotation(Number.NaN)).toBe(0);
  });

  it('TIME_OF_DAY_PRESETS chua day du thong so anh sang, bau troi va suong mu cho 3 pha', () => {
    const phases: TimeOfDayPhase[] = ['day', 'sunset', 'night'];
    for (const p of phases) {
      const preset = TIME_OF_DAY_PRESETS[p];
      expect(preset).toBeDefined();
      expect(preset.sunColor).toBeDefined();
      expect(preset.sunIntensity).toBeGreaterThan(0);
      expect(preset.ambientColor).toBeDefined();
      expect(preset.ambientIntensity).toBeGreaterThan(0);
      expect(preset.skyColor).toBeDefined();
      expect(preset.fogColor).toBeDefined();
      expect(preset.fogNear).toBeGreaterThan(0);
      expect(preset.fogFar).toBeGreaterThan(preset.fogNear);
      expect(preset.sunPosition).toHaveLength(3);
    }

    // Ban dem phai co anh sang moonlight xanh diu va suong mu dem toi dam
    expect(TIME_OF_DAY_PRESETS.night.sunColor).toBe('#60A5FA');
    expect(TIME_OF_DAY_PRESETS.night.fogColor).toBe('#090D1A');
    expect(TIME_OF_DAY_PRESETS.night.skyColor).toBe('#050814');
  });
});

describe('[UI-S04/MSS] TimeOfDay Components & Visual Contract', () => {
  it('TimeOfDayLighting duoc export duoi dang React Component', () => {
    expect(typeof TimeOfDayLighting).toBe('function');
  });

  it('TopBar tich hop nut Time-of-Day Toggle voi day du accessibility', () => {
    const topBarPath = path.resolve(process.cwd(), 'src', 'client', 'ui', 'top_bar.tsx');
    const topBarSource = fs.readFileSync(topBarPath, 'utf-8');
    expect(topBarSource).toContain('data-testid="time-of-day-toggle-button"');
    expect(topBarSource).toContain('useEnvironmentStore');
    expect(topBarSource).toContain('toggleNextMode');
  });

  it('ProceduralBuilding ho tro hien thi phat sang cua so va bien hieu khi dem xuong', () => {
    const bldPath = path.resolve(process.cwd(), 'src', 'client', '3d', 'procedural_building.tsx');
    const bldSource = fs.readFileSync(bldPath, 'utf-8');
    expect(bldSource).toContain('useEnvironmentStore');
    expect(bldSource).toContain('emissive');
    expect(bldSource).toContain('emissiveIntensity');
  });

  it('Diorama Skyline co den chop hang khong Bitexco va den chieu laser', () => {
    const skylinePath = path.resolve(process.cwd(), 'src', 'client', '3d', 'diorama', 'diorama_skyline.tsx');
    const skylineSource = fs.readFileSync(skylinePath, 'utf-8');
    expect(skylineSource).toContain('useEnvironmentStore');
    expect(skylineSource).toContain('#EF4444'); // Red strobe
    expect(skylineSource).toContain('cylinderGeometry'); // Laser beam cone
    expect(skylineSource).toContain('calculateAviationStrobe');
    expect(skylineSource).toContain('calculateLaserRotation');
  });
});
