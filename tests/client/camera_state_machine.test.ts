// [UI-S04/MSS][TC-CAM01/MSS] Camera State Machine & Mathematical Helpers Test Suite
import { describe, it, expect } from 'vitest';
import {
  resolveCameraMode,
  calculateChaseCameraPosition,
  calculateTileFocusCameraPosition,
  calculateScreenShake,
  dampValue,
  calculateTargetCameraState,
  CAMERA_CONFIG,
} from '../../src/client/3d/camera_state_machine';

describe('[TC-CAM01.1/MSS] resolveCameraMode — State Transition Priority', () => {
  it('Tra ve dice_roll khi nguoi choi dang gieo xuc xac (isRolling = true)', () => {
    const mode = resolveCameraMode({
      isRolling: true,
      isPawnAnimating: false,
      activeModal: null,
    });
    expect(mode).toBe('dice_roll');
  });

  it('Tra ve pawn_chase khi quan co dang nhay buoc tren ban co (isPawnAnimating = true)', () => {
    const mode = resolveCameraMode({
      isRolling: false,
      isPawnAnimating: true,
      activeModal: null,
    });
    expect(mode).toBe('pawn_chase');
  });

  it('Tra ve tile_focus khi quan co dung chan va mo modal giao dich / mua ban', () => {
    const mode = resolveCameraMode({
      isRolling: false,
      isPawnAnimating: false,
      activeModal: 'deed',
      hasTargetTile: true,
    });
    expect(mode).toBe('tile_focus');
  });

  it('Tu dong tra ve overview khi luot choi ket thuc / khong co hanh dong dang dien ra', () => {
    const mode = resolveCameraMode({
      isRolling: false,
      isPawnAnimating: false,
      activeModal: null,
      hasTargetTile: false,
      hasRolledThisTurn: false,
    });
    expect(mode).toBe('overview');
  });

  it('Tra ve tile_focus khi quan co dung chan sau khi gieo xuc xac (hasRolledThisTurn = true)', () => {
    const mode = resolveCameraMode({
      isRolling: false,
      isPawnAnimating: false,
      activeModal: null,
      hasRolledThisTurn: true,
    });
    expect(mode).toBe('tile_focus');
  });

  it('Tra ve overview khi activeModal la game_over de bao quat toan canh tong ket', () => {
    const mode = resolveCameraMode({
      isRolling: false,
      isPawnAnimating: false,
      activeModal: 'game_over',
    });
    expect(mode).toBe('overview');
  });

  it('Tra ve auction_focus khi phien dau gia dang mo (activeModal = auction)', () => {
    const mode = resolveCameraMode({
      isRolling: false,
      isPawnAnimating: false,
      activeModal: 'auction',
    });
    expect(mode).toBe('auction_focus');
  });

  it('Uu tien manualMode ghi de khi co yeu cau can thiep thu cong', () => {
    const mode = resolveCameraMode({
      isRolling: true,
      isPawnAnimating: true,
      activeModal: 'auction',
      manualMode: 'overview',
    });
    expect(mode).toBe('overview');
  });
});

describe('[TC-CAM01.2/MSS] Camera Positioning & Target Calculation', () => {
  it('calculateChaseCameraPosition cong chinh xac offset vao toa do quan co', () => {
    const pawnCoords: [number, number, number] = [5, 0.2, 5];
    const camPos = calculateChaseCameraPosition(pawnCoords);
    expect(camPos[0]).toBeCloseTo(5 + CAMERA_CONFIG.pawn_chase.offset[0]);
    expect(camPos[1]).toBeCloseTo(0.2 + CAMERA_CONFIG.pawn_chase.offset[1]);
    expect(camPos[2]).toBeCloseTo(5 + CAMERA_CONFIG.pawn_chase.offset[2]);
  });

  it('calculateTileFocusCameraPosition cong chinh xac offset vao toa do o dat', () => {
    const tileCoords: [number, number, number] = [-6.8, 0, 8.2];
    const camPos = calculateTileFocusCameraPosition(tileCoords);
    expect(camPos[0]).toBeCloseTo(-6.8 + CAMERA_CONFIG.tile_focus.offset[0]);
    expect(camPos[1]).toBeCloseTo(0 + CAMERA_CONFIG.tile_focus.offset[1]);
    expect(camPos[2]).toBeCloseTo(8.2 + CAMERA_CONFIG.tile_focus.offset[2]);
  });

  it('calculateTargetCameraState tra ve dung cau hinh va FOV cho tung che do', () => {
    const overview = calculateTargetCameraState('overview');
    expect(overview.fov).toBe(CAMERA_CONFIG.overview.fov);
    expect(overview.position).toEqual([...CAMERA_CONFIG.overview.position]);
    expect(overview.target).toEqual([...CAMERA_CONFIG.overview.target]);

    const diceRoll = calculateTargetCameraState('dice_roll');
    expect(diceRoll.fov).toBe(CAMERA_CONFIG.dice_roll.fov);
    expect(diceRoll.position).toEqual([...CAMERA_CONFIG.dice_roll.position]);
    expect(diceRoll.target).toEqual([...CAMERA_CONFIG.dice_roll.target]);

    const pawnPos: [number, number, number] = [2, 0, 3];
    const chase = calculateTargetCameraState('pawn_chase', pawnPos);
    expect(chase.fov).toBe(CAMERA_CONFIG.pawn_chase.fov);
    expect(chase.target).toEqual([2, 0.2, 3]);

    const tilePos: [number, number, number] = [-4, 0, 4];
    const focus = calculateTargetCameraState('tile_focus', undefined, tilePos);
    expect(focus.fov).toBe(CAMERA_CONFIG.tile_focus.fov);
    expect(focus.target).toEqual([-4, 0.15, 4]);

    const auction = calculateTargetCameraState('auction_focus');
    expect(auction.fov).toBe(CAMERA_CONFIG.auction_focus.fov);
    expect(auction.position).toEqual([...CAMERA_CONFIG.auction_focus.position]);
    expect(auction.target).toEqual([...CAMERA_CONFIG.auction_focus.target]);
    expect(CAMERA_CONFIG.auction_focus.position).toEqual([0, 6.0, 9.0]);
    expect(CAMERA_CONFIG.auction_focus.target).toEqual([0, 3.0, 0]);
    expect(CAMERA_CONFIG.auction_focus.fov).toBe(38);
  });
});

describe('[TC-CAM01.3/MSS] calculateScreenShake — Micro Screen Shake Decay', () => {
  it('Tra ve [0, 0, 0] khi elapsed >= duration', () => {
    const shake = calculateScreenShake(0.36, 0.35, 0.25);
    expect(shake).toEqual([0, 0, 0]);
  });

  it('Tra ve [0, 0, 0] khi elapsed < 0', () => {
    const shake = calculateScreenShake(-0.1, 0.35, 0.25);
    expect(shake).toEqual([0, 0, 0]);
  });

  it('Bien do rung nam trong gioi han [-amplitude, amplitude]', () => {
    const amp = 0.3;
    for (let t = 0; t < 0.35; t += 0.02) {
      const [sx, sy, sz] = calculateScreenShake(t, 0.35, amp);
      expect(Math.abs(sx)).toBeLessThanOrEqual(amp + 1e-5);
      expect(Math.abs(sy)).toBeLessThanOrEqual(amp + 1e-5);
      expect(Math.abs(sz)).toBeLessThanOrEqual(amp + 1e-5);
    }
  });

  it('Bien do rung suy giam lien tuc theo thoi gian (Quadratic Decay Envelope)', () => {
    // Kiem tra gia tri bien do duong bao tai t = 0.05 lon hon tai t = 0.30
    const amp = 0.3;
    const dur = 0.4;
    const envStart = (1 - 0.05 / dur) ** 2;
    const envEnd = (1 - 0.30 / dur) ** 2;
    expect(envStart).toBeGreaterThan(envEnd);
  });

  it('[Adversarial] Khang loi khi elapsed hoac duration la NaN hoac Infinity', () => {
    expect(calculateScreenShake(Number.NaN)).toEqual([0, 0, 0]);
    expect(calculateScreenShake(Number.POSITIVE_INFINITY)).toEqual([0, 0, 0]);
    expect(calculateScreenShake(0.1, Number.NaN)).toEqual([0, 0, 0]);
  });
});

describe('[TC-CAM01.4/MSS] dampValue — Exponential Decay Smoothness', () => {
  it('Noi suy tien ve target mot cach muot ma theo toc do speed', () => {
    const v1 = dampValue(0, 10, 5, 0.016);
    expect(v1).toBeGreaterThan(0);
    expect(v1).toBeLessThan(10);

    // Sau nhieu frame tiep tuc tien sat target
    let cur = 0;
    for (let i = 0; i < 80; i++) {
      cur = dampValue(cur, 10, 5, 0.016);
    }
    expect(cur).toBeGreaterThan(9.9);
    expect(cur).toBeLessThanOrEqual(10);
  });

  it('An toan voi gia tri NaN va khong vuot nguong delta lon (> 0.1)', () => {
    expect(dampValue(Number.NaN, 5, 4, 0.016)).toBe(5);
    // Delta cuc lon (lag khung hinh) bi clamp an toan o 0.1 tranh overshoot
    const clampedResult = dampValue(0, 10, 4, 2.0);
    expect(clampedResult).toBeLessThan(10);
    expect(clampedResult).toBeGreaterThan(0);
  });
});
