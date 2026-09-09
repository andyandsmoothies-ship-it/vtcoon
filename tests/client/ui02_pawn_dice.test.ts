import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculatePathWaypoints,
  getParabolicHeight,
  interpolatePawnPosition,
} from '../../src/client/3d/pawn_path';
import {
  getDiceFaceRotation,
  isValidDiceFace,
  clampDiceFace,
  DICE_FACES,
} from '../../src/client/3d/dice_math';
import { useGameStore } from '../../src/client/store/game_store';
import {
  getAllTileAssetUrls,
  getTileAssetUrl,
  preloadTileAssets,
  PURCHASABLE_TILE_INDICES,
} from '../../src/client/assets/tile_assets';

describe('[UC-GAME-016/MSS] Pawn Path Waypoints & Trajectory', () => {
  it('TC-UI02.1a: Tinh dung buoc nhay thong thuong (0 -> 4)', () => {
    expect(calculatePathWaypoints(0, 4)).toEqual([1, 2, 3, 4]);
  });

  it('TC-UI02.1b: Tinh dung buoc nhay wrap-around qua o GO (38 -> 2)', () => {
    expect(calculatePathWaypoints(38, 2)).toEqual([39, 0, 1, 2]);
  });

  it('TC-UI02.1c: Buoc nhay don qua o GO (39 -> 0)', () => {
    expect(calculatePathWaypoints(39, 0)).toEqual([0]);
  });

  it('TC-UI02.1d: from === to tra ve mang rong (khong co buoc di chuyen)', () => {
    expect(calculatePathWaypoints(10, 10)).toEqual([]);
  });

  it('TC-UI02.1e: getParabolicHeight doi xung va dat dinh tai progress=0.5', () => {
    expect(getParabolicHeight(0)).toBe(0);
    expect(getParabolicHeight(1)).toBe(0);
    expect(getParabolicHeight(0.5, 0.8)).toBeCloseTo(0.8, 5);
    expect(getParabolicHeight(0.25, 0.8)).toBeCloseTo(getParabolicHeight(0.75, 0.8), 5);
  });

  it('TC-UI02.1f: interpolatePawnPosition tra ve toa do hop le co tinh vung nhay Y', () => {
    const start = interpolatePawnPosition(0, 1, 0);
    const mid = interpolatePawnPosition(0, 1, 0.5, 0.8);
    const end = interpolatePawnPosition(0, 1, 1);
    expect(mid[1]).toBeGreaterThan(start[1]);
    expect(mid[1]).toBeGreaterThan(end[1]);
    expect(start[1]).toBeCloseTo(end[1], 5);
  });
});

describe('[TC-UI02.1/Adversarial] Pawn Path Inversion & Bounds Defense', () => {
  it('Tu choi chi so am hoac vuot qua 39', () => {
    expect(() => calculatePathWaypoints(-1, 5)).toThrow();
    expect(() => calculatePathWaypoints(5, 40)).toThrow();
    expect(() => calculatePathWaypoints(1.5, 3)).toThrow();
  });
});

describe('[UC-GAME-011/MSS] Dice Math Euler Rotations & Validation', () => {
  it('TC-UI02.2a: 6 mat xuc xac co goc Euler huu han va phan biet', () => {
    const rotations = DICE_FACES.map((face) => getDiceFaceRotation(face));
    for (const rot of rotations) {
      expect(rot).toHaveLength(3);
      rot.forEach((r) => expect(Number.isFinite(r)).toBe(true));
    }
    const serialized = rotations.map((r) => r.join(','));
    const unique = new Set(serialized);
    expect(unique.size).toBe(6);
  });

  it('TC-UI02.2b: Mat 1 va Mat 6 la 2 mat doi xung phan biet', () => {
    const r1 = getDiceFaceRotation(1);
    const r6 = getDiceFaceRotation(6);
    expect(r1).not.toEqual(r6);
  });

  it('TC-UI02.2c: isValidDiceFace va clampDiceFace xu ly dung nguong 1-6', () => {
    expect(isValidDiceFace(1)).toBe(true);
    expect(isValidDiceFace(6)).toBe(true);
    expect(isValidDiceFace(0)).toBe(false);
    expect(isValidDiceFace(7)).toBe(false);
    expect(isValidDiceFace(2.5)).toBe(false);
    expect(clampDiceFace(-2)).toBe(1);
    expect(clampDiceFace(9)).toBe(6);
  });

  it('TC-UI02.2d: getDiceFaceRotation nem loi khi mat khong hop le', () => {
    expect(() => getDiceFaceRotation(0)).toThrow();
    expect(() => getDiceFaceRotation(7)).toThrow();
  });
});

describe('[TC-UI02.3/MSS] Game Store Dice State Management', () => {
  beforeEach(() => {
    useGameStore.setState({
      dice: [1, 1],
      isRolling: false,
      playerPositions: {},
      activePawnAnimation: null,
    });
  });

  it('triggerDiceRoll cap nhat dice va isRolling=true', () => {
    useGameStore.getState().triggerDiceRoll([3, 5]);
    expect(useGameStore.getState().isRolling).toBe(true);
    expect(useGameStore.getState().dice).toEqual([3, 5]);
  });

  it('triggerDiceRoll kep gia tri bat hop le ve bien 1-6', () => {
    useGameStore.getState().triggerDiceRoll([0, 8]);
    expect(useGameStore.getState().dice).toEqual([1, 6]);
  });
});

describe('[TC-UI02.4/MSS] Game Store Pawn Movement & Animation Lock', () => {
  beforeEach(() => {
    useGameStore.setState({
      playerPositions: { p1: 0 },
      activePawnAnimation: null,
    });
  });

  it('startPawnMove tao dung danh sach waypoints cho player', () => {
    useGameStore.getState().startPawnMove('p1', 3);
    const anim = useGameStore.getState().activePawnAnimation;
    expect(anim).not.toBeNull();
    expect(anim?.playerId).toBe('p1');
    expect(anim?.waypoints).toEqual([1, 2, 3]);
    expect(anim?.isAnimating).toBe(true);
  });

  it('startPawnMove tu choi khi from === to hoac dang co animation chay', () => {
    useGameStore.getState().startPawnMove('p1', 0);
    expect(useGameStore.getState().activePawnAnimation).toBeNull();

    useGameStore.getState().startPawnMove('p1', 3);
    expect(useGameStore.getState().activePawnAnimation?.waypoints).toEqual([1, 2, 3]);

    // Khong the ghi de khi dang animation
    useGameStore.getState().startPawnMove('p2', 10);
    expect(useGameStore.getState().activePawnAnimation?.playerId).toBe('p1');
  });

  it('completePawnMove cap nhat vi tri cuoi va xoa animation', () => {
    useGameStore.getState().startPawnMove('p1', 3);
    useGameStore.getState().completePawnMove('p1');
    expect(useGameStore.getState().activePawnAnimation).toBeNull();
    expect(useGameStore.getState().playerPositions['p1']).toBe(3);
  });
  it('startPawnMove ho tro fromCell tuy bien de tranh lech toa do khi chua dong bo', () => {
    useGameStore.getState().startPawnMove('p1', 14, 10);
    const anim = useGameStore.getState().activePawnAnimation;
    expect(anim?.fromCell).toBe(10);
    expect(anim?.waypoints).toEqual([11, 12, 13, 14]);
  });

  it('startPawnMove bo qua targetCell bat hop le (< 0, >= 40, non-integer)', () => {
    useGameStore.getState().startPawnMove('p1', -1);
    expect(useGameStore.getState().activePawnAnimation).toBeNull();

    useGameStore.getState().startPawnMove('p1', 40);
    expect(useGameStore.getState().activePawnAnimation).toBeNull();

    useGameStore.getState().startPawnMove('p1', 3.5);
    expect(useGameStore.getState().activePawnAnimation).toBeNull();
  });

  it('ADVERSARIAL: completePawnMove khac playerId khong xoa animation cua player dang chay', () => {
    useGameStore.getState().startPawnMove('p1', 5);
    expect(useGameStore.getState().activePawnAnimation?.playerId).toBe('p1');

    // p2 goi completePawnMove trong khi p1 dang chay -> khong duoc xoa animation cua p1
    useGameStore.getState().completePawnMove('p2');
    expect(useGameStore.getState().activePawnAnimation?.playerId).toBe('p1');

    // Chi p1 goi moi hoan tat va xoa animation
    useGameStore.getState().completePawnMove('p1');
    expect(useGameStore.getState().activePawnAnimation).toBeNull();
    expect(useGameStore.getState().playerPositions['p1']).toBe(5);
  });
});

describe('[TC-UI02.5/MSS] Tile Assets Manifest & DEBT-UI01-01 Payoff', () => {
  it('Sinh du 112 URLs cho 28 o tai san x 4 cap do', () => {
    const urls = getAllTileAssetUrls();
    expect(urls).toHaveLength(112);
    expect(PURCHASABLE_TILE_INDICES).toHaveLength(28);
    for (const url of urls) {
      expect(url).toMatch(/^\/assets\/tiles\/tile_\d{2}_lvl[0-3]\.webp$/);
    }
  });

  it('preloadTileAssets chay an toan va tra ve du 112 URLs', () => {
    const urls = preloadTileAssets();
    expect(urls).toHaveLength(112);
  });

  it('getTileAssetUrl nem loi khi chi so o hoac level bat hop le', () => {
    expect(() => getTileAssetUrl(0, 0)).toThrow(); // O 0 (GO) khong phai o tai san
    expect(() => getTileAssetUrl(1, 4)).toThrow(); // Level 4 vuot qua max 3
    expect(() => getTileAssetUrl(1, -1)).toThrow();
  });
});

describe('[TC-UI02.6/MSS] Multi-Player Slot Offsets Defense', () => {
  it('PLAYER_OFFSETS co du 4 vi tri rieng biet tranh Z-fighting', async () => {
    const { PLAYER_OFFSETS } = await import('../../src/client/3d/pawn_animator');
    expect(PLAYER_OFFSETS).toHaveLength(4);
    const serialized = PLAYER_OFFSETS.map((o) => `${o[0]},${o[2]}`);
    const unique = new Set(serialized);
    expect(unique.size).toBe(4);
    for (const offset of PLAYER_OFFSETS) {
      expect(Math.abs(offset[0])).toBeLessThanOrEqual(0.5);
      expect(Math.abs(offset[2])).toBeLessThanOrEqual(0.5);
      expect(offset[1]).toBe(0);
    }
  });
});
