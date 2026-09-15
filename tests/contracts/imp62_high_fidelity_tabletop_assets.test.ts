// [TC-62/MSS][IMP-62] High-Fidelity Miniature Diorama Tabletop 3D Assets & PBR Material Contract Tests
// Specification: IMP-62 Commercial AAA Photorealistic Miniature Diorama
// Reference Plan: Retropoly & Monopoly Plus Tabletop Standard
// Universal 4-Facet Behavioral Matrix Verification:
//   Facet 1: Model Asset Geometry & Budget Invariants (15 GLB models, tri thresholds, max budget 2.5 MB)
//   Facet 2: Procedural Facade Texture Architecture & Singleton Caching (RepeatWrapping, Singleton VRAM defense)
//   Facet 3: Tabletop Walnut Grain & PBR Materials (Walnut diffuse & roughness, SSR safety, Material integration)
//   Facet 4: Error Defense & Texture Disposal (Cache invalidation, safe disposal, boundary resilience)

import { describe, it, expect } from 'vitest';
import path from 'node:path';
import * as THREE from 'three';
import {
  ASSET_BUDGETS,
  analyzeModelFile,
  checkAssetBudgets,
} from '../../scripts/optimize_assets.mjs';

interface FacadeModuleInterface {
  createHighriseFacadeTexture: () => THREE.Texture;
  createShophouseFacadeTexture: () => THREE.Texture;
  clearFacadeTextureCache?: () => void;
  clearTextureCaches?: () => void;
}

interface TabletopModuleInterface {
  createWalnutTabletopTexture: () => THREE.Texture;
  createWalnutRoughnessTexture: () => THREE.Texture;
  clearTabletopTextureCache?: () => void;
  clearTextureCaches?: () => void;
}

async function getFacadeModule(): Promise<FacadeModuleInterface> {
  try {
    // @ts-ignore
    const mod = await import('../../src/client/3d/facade_texture_generator');
    return mod as FacadeModuleInterface;
  } catch (err: any) {
    return {
      createHighriseFacadeTexture: () => {
        throw new Error(`[IMP-62] Missing facade_texture_generator: ${err.message}`);
      },
      createShophouseFacadeTexture: () => {
        throw new Error(`[IMP-62] Missing facade_texture_generator: ${err.message}`);
      },
      clearFacadeTextureCache: () => {
        throw new Error(`[IMP-62] Missing facade_texture_generator: ${err.message}`);
      },
    };
  }
}

async function getTabletopModule(): Promise<TabletopModuleInterface> {
  try {
    // @ts-ignore
    const mod = await import('../../src/client/3d/tabletop_texture_generator');
    return mod as TabletopModuleInterface;
  } catch (err: any) {
    return {
      createWalnutTabletopTexture: () => {
        throw new Error(`[IMP-62] Missing tabletop_texture_generator: ${err.message}`);
      },
      createWalnutRoughnessTexture: () => {
        throw new Error(`[IMP-62] Missing tabletop_texture_generator: ${err.message}`);
      },
      clearTabletopTextureCache: () => {
        throw new Error(`[IMP-62] Missing tabletop_texture_generator: ${err.message}`);
      },
    };
  }
}

describe('[TC-62/MSS][IMP-62] Photorealistic Miniature Diorama Tabletop 3D Assets & PBR Material Overhaul', () => {
  const modelsRoot = path.resolve(process.cwd(), 'public/models');

  // =========================================================================================
  // FACET 1: MODEL ASSET GEOMETRY & BUDGET INVARIANTS
  // =========================================================================================
  describe('Facet 1: Model Asset Geometry & Budget Invariants', () => {
    it.each([
      ['building_c1.glb', 'public/models/buildings/building_c1.glb', 300, 800],
      ['building_c2.glb', 'public/models/buildings/building_c2.glb', 300, 800],
      ['building_c3.glb', 'public/models/buildings/building_c3.glb', 300, 800],
    ])(
      '[TC-62.01/MSS][IMP-62] Building model %s thỏa mãn ngưỡng độ chi tiết diorama (> %i tris, <= %i tris)',
      (_name, relPath, minTris, maxTris) => {
        const fullPath = path.resolve(process.cwd(), relPath);
        const info = analyzeModelFile(fullPath, modelsRoot);
        expect(info.triangles).toBeGreaterThan(minTris);
        expect(info.triangles).toBeLessThanOrEqual(maxTris);
        expect(info.passed).toBe(true);
      }
    );

    it.each([
      ['pawn_car.glb', 'public/models/pawns/pawn_car.glb', 500, 1200],
      ['pawn_horse.glb', 'public/models/pawns/pawn_horse.glb', 500, 1200],
      ['pawn_tower.glb', 'public/models/pawns/pawn_tower.glb', 500, 1200],
      ['pawn_yacht.glb', 'public/models/pawns/pawn_yacht.glb', 500, 1200],
    ])(
      '[TC-62.02/MSS][IMP-62] Luxury Pawn model %s thỏa mãn ngưỡng độ chi tiết die-cast (> %i tris, <= %i tris)',
      (_name, relPath, minTris, maxTris) => {
        const fullPath = path.resolve(process.cwd(), relPath);
        const info = analyzeModelFile(fullPath, modelsRoot);
        expect(info.triangles).toBeGreaterThan(minTris);
        expect(info.triangles).toBeLessThanOrEqual(maxTris);
        expect(info.passed).toBe(true);
      }
    );

    it.each([
      ['landmark_ben_thanh.glb', 'public/models/landmarks/landmark_ben_thanh.glb', 700, 1500],
      ['landmark_cathedral.glb', 'public/models/landmarks/landmark_cathedral.glb', 700, 1500],
    ])(
      '[TC-62.03/MSS][IMP-62] Landmark model %s thỏa mãn ngưỡng chi tiết di sản (> %i tris, <= %i tris)',
      (_name, relPath, minTris, maxTris) => {
        const fullPath = path.resolve(process.cwd(), relPath);
        const info = analyzeModelFile(fullPath, modelsRoot);
        expect(info.triangles).toBeGreaterThan(minTris);
        expect(info.triangles).toBeLessThanOrEqual(maxTris);
        expect(info.passed).toBe(true);
      }
    );

    it.each([
      ['vehicle_boat.glb', 'public/models/vehicles/vehicle_boat.glb', 400],
      ['vehicle_bus.glb', 'public/models/vehicles/vehicle_bus.glb', 400],
      ['vehicle_container.glb', 'public/models/vehicles/vehicle_container.glb', 400],
      ['vehicle_sedan.glb', 'public/models/vehicles/vehicle_sedan.glb', 400],
      ['vehicle_taxi.glb', 'public/models/vehicles/vehicle_taxi.glb', 400],
      ['vehicle_van.glb', 'public/models/vehicles/vehicle_van.glb', 400],
    ])(
      '[TC-62.04/MSS][IMP-62] Vehicle model %s thỏa mãn ngân sách vi giao thông (<= %i tris)',
      (_name, relPath, maxTris) => {
        const fullPath = path.resolve(process.cwd(), relPath);
        const info = analyzeModelFile(fullPath, modelsRoot);
        expect(info.triangles).toBeLessThanOrEqual(maxTris);
        expect(info.passed).toBe(true);
      }
    );

    it('[TC-62.05/MSS][IMP-62] Tổng dung lượng nhị phân 15 mô hình không vượt quá trần 2.5 MB', () => {
      const result = checkAssetBudgets(modelsRoot);
      expect(result.totalBytes).toBeLessThanOrEqual(ASSET_BUDGETS.TOTAL_MAX_BYTES);
    });
  });

  // =========================================================================================
  // FACET 2: PROCEDURAL FACADE TEXTURE ARCHITECTURE & SINGLETON CACHING
  // =========================================================================================
  describe('Facet 2: Procedural Facade Texture Architecture & Singleton Caching', () => {
    it('[TC-62.10/MSS][IMP-62] createHighriseFacadeTexture tạo texture mặt tiền kính với RepeatWrapping', async () => {
      const mod = await getFacadeModule();
      const texture = mod.createHighriseFacadeTexture();
      expect(texture.wrapS).toBe(THREE.RepeatWrapping);
      expect(texture.wrapT).toBe(THREE.RepeatWrapping);
    });

    it('[TC-62.11/MSS][IMP-62] createHighriseFacadeTexture cấu hình tỷ lệ lặp ô cửa sổ (repeat factor >= 1)', async () => {
      const mod = await getFacadeModule();
      const texture = mod.createHighriseFacadeTexture();
      expect(texture.repeat.x).toBeGreaterThanOrEqual(1);
      expect(texture.repeat.y).toBeGreaterThanOrEqual(1);
    });

    it('[TC-62.12/MSS][IMP-62] createHighriseFacadeTexture trả về Singleton reference tránh rò rỉ VRAM', async () => {
      const mod = await getFacadeModule();
      const t1 = mod.createHighriseFacadeTexture();
      const t2 = mod.createHighriseFacadeTexture();
      expect(t1).toBe(t2);
    });

    it('[TC-62.13/MSS][IMP-62] createShophouseFacadeTexture tạo texture mặt tiền phố cổ với RepeatWrapping', async () => {
      const mod = await getFacadeModule();
      const texture = mod.createShophouseFacadeTexture();
      expect(texture.wrapS).toBe(THREE.RepeatWrapping);
      expect(texture.wrapT).toBe(THREE.RepeatWrapping);
    });

    it('[TC-62.14/MSS][IMP-62] createShophouseFacadeTexture trả về Singleton reference tránh re-render rác', async () => {
      const mod = await getFacadeModule();
      const t1 = mod.createShophouseFacadeTexture();
      const t2 = mod.createShophouseFacadeTexture();
      expect(t1).toBe(t2);
    });

    it('[TC-62.15/MSS][IMP-62] Áp Facade Texture vào MeshStandardMaterial bảo toàn ánh xạ map của InstancedMesh', async () => {
      const mod = await getFacadeModule();
      const texture = mod.createHighriseFacadeTexture();
      const material = new THREE.MeshStandardMaterial({ map: texture });
      expect(material.map).toBe(texture);
      expect(material.map?.wrapS).toBe(THREE.RepeatWrapping);
    });
  });

  // =========================================================================================
  // FACET 3: TABLETOP WALNUT GRAIN & PBR MATERIALS
  // =========================================================================================
  describe('Facet 3: Tabletop Walnut Grain & PBR Materials', () => {
    it('[TC-62.20/MSS][IMP-62] createWalnutTabletopTexture tạo texture vân gỗ óc chó với RepeatWrapping', async () => {
      const mod = await getTabletopModule();
      const texture = mod.createWalnutTabletopTexture();
      expect(texture.wrapS).toBe(THREE.RepeatWrapping);
      expect(texture.wrapT).toBe(THREE.RepeatWrapping);
    });

    it('[TC-62.21/MSS][IMP-62] createWalnutTabletopTexture cấu hình hệ số lặp vân gỗ tự nhiên trên mặt bàn sa bàn', async () => {
      const mod = await getTabletopModule();
      const texture = mod.createWalnutTabletopTexture();
      expect(texture.repeat.x).toBeGreaterThan(1);
      expect(texture.repeat.y).toBeGreaterThan(1);
    });

    it('[TC-62.22/MSS][IMP-62] createWalnutTabletopTexture trả về Singleton reference chống rò rỉ GPU', async () => {
      const mod = await getTabletopModule();
      const t1 = mod.createWalnutTabletopTexture();
      const t2 = mod.createWalnutTabletopTexture();
      expect(t1).toBe(t2);
    });

    it('[TC-62.23/MSS][IMP-62] createWalnutRoughnessTexture tạo texture độ nhám PBR với RepeatWrapping', async () => {
      const mod = await getTabletopModule();
      const texture = mod.createWalnutRoughnessTexture();
      expect(texture.wrapS).toBe(THREE.RepeatWrapping);
      expect(texture.wrapT).toBe(THREE.RepeatWrapping);
    });

    it('[TC-62.24/MSS][IMP-62] createWalnutRoughnessTexture trả về Singleton reference chống cấp phát trùng', async () => {
      const mod = await getTabletopModule();
      const t1 = mod.createWalnutRoughnessTexture();
      const t2 = mod.createWalnutRoughnessTexture();
      expect(t1).toBe(t2);
    });

    it('[TC-62.25/MSS][IMP-62] SSR & Headless Resilience: Sinh texture an toàn trong môi trường Node không throw ngoại lệ', async () => {
      const mod = await getTabletopModule();
      expect(() => mod.createWalnutTabletopTexture()).not.toThrow();
      expect(() => mod.createWalnutRoughnessTexture()).not.toThrow();
    });

    it('[TC-62.26/MSS][IMP-62] Áp Walnut Diffuse và Roughness vào MeshStandardMaterial thiết lập đúng bản đồ PBR', async () => {
      const mod = await getTabletopModule();
      const diffuse = mod.createWalnutTabletopTexture();
      const roughness = mod.createWalnutRoughnessTexture();
      const material = new THREE.MeshStandardMaterial({
        map: diffuse,
        roughnessMap: roughness,
        roughness: 0.28,
        metalness: 0.05,
      });
      expect(material.map).toBe(diffuse);
      expect(material.roughnessMap).toBe(roughness);
    });
  });

  // =========================================================================================
  // FACET 4: ERROR DEFENSE & TEXTURE DISPOSAL
  // =========================================================================================
  describe('Facet 4: Error Defense & Texture Disposal', () => {
    it('[TC-62.30/MSS][IMP-62] clearFacadeTextureCache dọn dẹp cache giải phóng tài nguyên đồ họa', async () => {
      const mod = await getFacadeModule();
      const clearFn = mod.clearFacadeTextureCache ?? mod.clearTextureCaches;
      expect(clearFn).toBeDefined();
      expect(() => clearFn!()).not.toThrow();
    });

    it('[TC-62.31/MSS][IMP-62] clearTabletopTextureCache dọn dẹp cache mặt bàn sa bàn', async () => {
      const mod = await getTabletopModule();
      const clearFn = mod.clearTabletopTextureCache ?? mod.clearTextureCaches;
      expect(clearFn).toBeDefined();
      expect(() => clearFn!()).not.toThrow();
    });

    it('[TC-62.32/MSS][IMP-62] Gọi dispose trên texture khởi tạo không gây unhandled rejection hoặc crash', async () => {
      const mod = await getFacadeModule();
      const texture = mod.createHighriseFacadeTexture();
      expect(() => texture.dispose()).not.toThrow();
    });

    it('[TC-62.33/MSS][IMP-62] Xử lý phòng thủ khi gọi liên tiếp và tái khởi tạo sau dispose', async () => {
      const mod = await getTabletopModule();
      const t1 = mod.createWalnutTabletopTexture();
      t1.dispose();
      const clearFn = mod.clearTabletopTextureCache ?? mod.clearTextureCaches;
      if (clearFn) clearFn();
      const t2 = mod.createWalnutTabletopTexture();
      expect(t2).toBeDefined();
    });
  });
});
