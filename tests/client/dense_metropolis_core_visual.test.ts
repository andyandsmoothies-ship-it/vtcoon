// [TC-IMP31/MSS] [UC-IMP31] Test Suite: Dense Metropolis Core & Living Coastal Alignment Contract
// Refactored to Gold Standard: Universal 4-Facet Behavioral Matrix & Atomic Test Mandate
import { describe, it, expect } from 'vitest';
import { SHOPHOUSE_CONFIGS } from '../../src/client/3d/diorama/diorama_shophouse_blocks';
import { HIGHRISE_CONFIGS } from '../../src/client/3d/diorama/diorama_highrise_blocks';
import { PALM_TREES } from '../../src/client/3d/tropical_palms_cluster';
import {
  DEPTH_LAYER_STACK,
  WALNUT_TABLE_Y,
  OCEAN_Y,
  RIVER_BED_Y,
  TERRAIN_BASE_Y,
  TILE_BORDER_Y,
  TILE_SURFACE_Y,
  PAWN_HALO_Y,
  STANDEE_BASE_Y,
} from '../../src/client/3d/board_layout';

const choLonShophouses = SHOPHOUSE_CONFIGS.filter((sh) => sh.id.startsWith('sh-cl'));
const marinaShophouses = SHOPHOUSE_CONFIGS.filter((sh) => sh.id.startsWith('sh-marina'));

describe('[TC-IMP31/MSS] [UC-IMP31] Dense Metropolis Core & Living Coastal Alignment Contract', () => {

  // =========================================================================
  // FACET 1: DATA BOUNDARY & RANGE CONSTRAINTS
  // =========================================================================
  describe('Facet 1: Data Boundary & Range Constraints', () => {
    it.each(SHOPHOUSE_CONFIGS.map((sh, idx) => [sh.id, sh.height, idx]))(
      'Shophouse %s (#%i) có chiều cao trong dải an toàn (0, 0.8]',
      (_id, height) => {
        expect(height).toBeGreaterThan(0);
        expect(height).toBeLessThanOrEqual(0.8);
      }
    );

    it.each(HIGHRISE_CONFIGS.map((tower, idx) => [tower.id, tower.height, idx]))(
      'Cao ốc %s (#%i) có chiều cao trong dải giật cấp (0, 3.2]',
      (_id, height) => {
        expect(height).toBeGreaterThan(0);
        expect(height).toBeLessThanOrEqual(3.2);
      }
    );

    it.each([
      ['Bờ Nam (mẫu đầu)', PALM_TREES[0]!],
      ['Bờ Nam (mẫu giữa)', PALM_TREES[19]!],
      ['Bờ Nam (mẫu cuối)', PALM_TREES[39]!],
    ])('Cây dừa %s nằm trên bãi cát phía Nam với z in [12.0, 14.5]', (_desc, palm) => {
      expect(palm.z).toBeGreaterThanOrEqual(12.0);
      expect(palm.z).toBeLessThanOrEqual(14.5);
      expect(palm.y).toBeGreaterThanOrEqual(0.02);
    });

    it.each([
      ['Vịnh Đông Nam (mẫu đầu)', PALM_TREES[40]!],
      ['Vịnh Đông Nam (mẫu giữa)', PALM_TREES[49]!],
      ['Vịnh Đông Nam (mẫu cuối)', PALM_TREES[59]!],
    ])('Cây dừa %s nằm dọc bờ vịnh Đông Nam với x in [12.0, 15.5]', (_desc, palm) => {
      expect(palm.x).toBeGreaterThanOrEqual(12.0);
      expect(palm.x).toBeLessThanOrEqual(15.5);
      expect(palm.y).toBeGreaterThanOrEqual(0.02);
    });
  });

  // =========================================================================
  // FACET 2: STATE REACTIVITY & DEPTH STACK ORDERING
  // =========================================================================
  describe('Facet 2: State Reactivity & Strict Monotonic Depth Ordering', () => {
    it('Mặt bàn gỗ óc chó thấp hơn mặt nước hồ / biển', () => {
      expect(WALNUT_TABLE_Y).toBeLessThan(OCEAN_Y);
    });

    it('Mặt biển bằng hoặc thấp hơn lòng kênh sông đào', () => {
      expect(OCEAN_Y).toBeLessThanOrEqual(RIVER_BED_Y);
    });

    it('Lòng kênh sông đào thấp hơn nền đất tự nhiên', () => {
      expect(RIVER_BED_Y).toBeLessThan(TERRAIN_BASE_Y);
    });

    it('Nền đất tự nhiên thấp hơn viền móng ô cờ', () => {
      expect(TERRAIN_BASE_Y).toBeLessThan(TILE_BORDER_Y);
    });

    it('Viền móng ô cờ thấp hơn mặt tương tác ô cờ', () => {
      expect(TILE_BORDER_Y).toBeLessThan(TILE_SURFACE_Y);
    });

    it('Mặt ô cờ thấp hơn đĩa hào quang quân cờ', () => {
      expect(TILE_SURFACE_Y).toBeLessThan(PAWN_HALO_Y);
    });

    it('Đĩa hào quang thấp hơn chân đế Standee 3D', () => {
      expect(PAWN_HALO_Y).toBeLessThan(STANDEE_BASE_Y);
    });

    it.each([
      ['Lòng kênh và Mặt biển', RIVER_BED_Y - OCEAN_Y, 0.050],
      ['Nền đất và Lòng sông', TERRAIN_BASE_Y - RIVER_BED_Y, 0.040],
      ['Viền móng và Nền đất', TILE_BORDER_Y - TERRAIN_BASE_Y, 0.010],
      ['Mặt ô cờ và Viền móng', TILE_SURFACE_Y - TILE_BORDER_Y, 0.005],
      ['Đĩa hào quang và Mặt ô cờ', PAWN_HALO_Y - TILE_SURFACE_Y, 0.001],
      ['Chân Standee và Đĩa hào quang', STANDEE_BASE_Y - PAWN_HALO_Y, 0.003],
    ])('Khoảng cách giữa %s (delta = %f) thỏa mãn dung sai triệt tiêu Z-fighting >= %f', (_desc, delta, minGap) => {
      expect(delta).toBeGreaterThanOrEqual(minGap);
    });
  });

  // =========================================================================
  // FACET 3: RESOURCE & MODEL CONFIGURATION COUNTS
  // =========================================================================
  describe('Facet 3: Resource & Model Configuration Counts', () => {
    it('Phố cổ Chợ Lớn có đúng 24 căn shophouse', () => {
      expect(choLonShophouses).toHaveLength(24);
    });

    it('Bến du thuyền Marina có đúng 8 căn shophouse ẩm thực', () => {
      expect(marinaShophouses).toHaveLength(8);
    });

    it('Tổng số shophouse batched qua InstancedMesh đạt đúng 32 căn', () => {
      expect(SHOPHOUSE_CONFIGS).toHaveLength(32);
    });

    it('Cụm cao ốc tài chính Tây Bắc có đúng 10 tháp', () => {
      expect(HIGHRISE_CONFIGS).toHaveLength(10);
    });

    it('Quần đảo nhiệt đới có đúng 60 cây dừa', () => {
      expect(PALM_TREES).toHaveLength(60);
    });

    it('DEPTH_LAYER_STACK chứa đúng 10 tầng cao độ vật lý', () => {
      expect(Object.keys(DEPTH_LAYER_STACK)).toHaveLength(10);
    });
  });

  // =========================================================================
  // FACET 4: SPATIAL CLEARANCE & CORRIDOR DEFENSE
  // =========================================================================
  describe('Facet 4: Spatial Clearance & Corridor Defense', () => {
    it.each(HIGHRISE_CONFIGS.map((t) => [t.id, t.z]))(
      'Tháp cao ốc %s có tọa độ z (%f) lùi sâu về phía Bắc (z <= -2.4) để không che khay xúc xắc',
      (_id, z) => {
        expect(z).toBeLessThanOrEqual(-2.4);
      }
    );

    it.each(choLonShophouses.map((sh) => [sh.id, sh.x, sh.z]))(
      'Shophouse Chợ Lớn %s (x: %f, z: %f) nằm hoàn toàn trong lõi Tây Nam bàn cờ',
      (_id, x, z) => {
        expect(x).toBeGreaterThanOrEqual(-6.0);
        expect(x).toBeLessThanOrEqual(-3.0);
        expect(z).toBeGreaterThanOrEqual(1.5);
        expect(z).toBeLessThanOrEqual(6.5);
      }
    );

    it.each(marinaShophouses.map((sh) => [sh.id, sh.x, sh.z]))(
      'Shophouse Marina %s (x: %f, z: %f) nằm hoàn toàn trong lõi Đông Nam bàn cờ',
      (_id, x, z) => {
        expect(x).toBeGreaterThanOrEqual(3.5);
        expect(x).toBeLessThanOrEqual(5.5);
        expect(z).toBeGreaterThanOrEqual(2.0);
        expect(z).toBeLessThanOrEqual(6.5);
      }
    );
  });
});
