// [TC-IMP42/MSS] Pawn Jump 1.5x Speed & Anti-Jerk Camera Invariants Test Suite
import { describe, it, expect, beforeEach } from 'vitest';
import { HOP_DURATION, LANDING_DURATION } from '../../src/client/3d/pawn_path.js';
import { resolveCameraMode } from '../../src/client/3d/camera_state_machine.js';
import { useGameStore } from '../../src/client/store/game_store.js';

describe('[TC-IMP42/MSS] Pawn Jump Speed & Smooth Camera Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      playerPositions: { p1: 0 },
      visualPositions: { p1: 0 },
      activePawnAnimation: null,
      pawnAnimationQueue: [],
      isRolling: false,
    });
  });

  // === 1. Tốc độ nhảy tăng 1.5 lần (0.34s -> 0.23s) ===

  it('[TC-IMP42.1/MSS] HOP_DURATION phải đạt 0.15s (tăng tốc 1.5 lần từ 0.22s)', () => {
    expect(HOP_DURATION).toBe(0.15);
  });

  it('[TC-IMP42.2/MSS] LANDING_DURATION phải đạt 0.08s (tăng tốc 1.5 lần từ 0.12s)', () => {
    expect(LANDING_DURATION).toBe(0.08);
  });

  it('[TC-IMP42.3/MSS] Tổng thời gian mỗi bước nhảy người chơi phải là 0.23s', () => {
    expect(Number((HOP_DURATION + LANDING_DURATION).toFixed(2))).toBe(0.23);
  });

  // === 2. Bỏ hiệu ứng zoom vào xúc xắc gây giật lag ===

  it('[TC-IMP42.4/MSS] Khi isRolling = true, camera phải giữ overview, không chuyển sang dice_roll', () => {
    const mode = resolveCameraMode({
      isRolling: true,
      isPawnAnimating: false,
      activeModal: null,
      isBotTurn: false,
    });
    expect(mode).toBe('overview');
  });

  it('[TC-IMP42.5/MSS] Khi isRolling = true trong lượt Bot, camera vẫn giữ overview', () => {
    const mode = resolveCameraMode({
      isRolling: true,
      isPawnAnimating: false,
      activeModal: null,
      isBotTurn: true,
    });
    expect(mode).toBe('overview');
  });

  // === 3. Sửa lỗi nhảy cóc khi đi xa (Failsafe timeout không được cắt ngang animation) ===

  it('[TC-IMP42.6/MSS] startPawnMove cho bước nhảy xa 10 ô tạo đủ 10 waypoints liên tục', () => {
    useGameStore.getState().startPawnMove('p1', 10, 0, false);
    const anim = useGameStore.getState().activePawnAnimation;
    expect(anim).not.toBeNull();
    expect(anim?.waypoints.length).toBe(10);
    expect(anim?.waypoints).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('[TC-IMP42.7/MSS] startPawnMove cho bước nhảy vòng qua GO (35 -> 5) tạo đủ 10 waypoints', () => {
    useGameStore.getState().startPawnMove('p1', 5, 35, false);
    const anim = useGameStore.getState().activePawnAnimation;
    expect(anim).not.toBeNull();
    expect(anim?.waypoints.length).toBe(10);
    expect(anim?.waypoints).toEqual([36, 37, 38, 39, 0, 1, 2, 3, 4, 5]);
  });
});
