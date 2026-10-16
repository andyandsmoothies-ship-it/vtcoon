// [UI-S03/MSS][UI-S04/MSS][IMP-410] Procedural Building & Construction Slam Seam Contracts
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  getBuildingLotTransform,
  STANDARD_LOT_TRANSFORM,
  CORNER_SPLAY_TRANSFORMS,
  type BuildingLotTransform,
} from '../../src/client/3d/building_lot_transform';
import {
  calculateImpactDrop,
  getBuildingWorldPosition,
  type ImpactDropResult,
} from '../../src/client/3d/construction_slam_math';
import * as ProceduralBuildingMod from '../../src/client/3d/procedural_building';
import * as ConstructionSlamVfxMod from '../../src/client/3d/construction_slam_vfx';
import { detectCycles } from '../../scripts/boundary_linter/boundary_rules.mjs';

describe('TC-410.01 [UC-BUILDING-LOT-TRANSFORM-CORNER-SPLAY/MSS]', () => {
  it('tra ve cau hinh STANDARD_LOT_TRANSFORM khi khong truyen cellIndex hoac cellIndex thong thuong', () => {
    const defaultLot = getBuildingLotTransform();
    const standardCellLot = getBuildingLotTransform(5);
    expect(defaultLot.position).toEqual([0, 0.16, -1.38]);
    expect(standardCellLot.position[0]).toBe(0);
  });

  it('tra ve toa do lech goc X = -0.24 cho o goc cell 1 va X = +0.24 cho o goc cell 9', () => {
    const lotCell1 = getBuildingLotTransform(1);
    const lotCell9 = getBuildingLotTransform(9);
    expect(lotCell1.position).toEqual([-0.24, 0.16, -1.38]);
    expect(lotCell9.position).toEqual([0.24, 0.16, -1.38]);
  });

  it('dam bao tinh hiep bien (relational covariance) giua o goc trai va o goc phai tren cung mat phang Z', () => {
    const lot1 = getBuildingLotTransform(1);
    const lot9 = getBuildingLotTransform(9);
    expect(lot1.position[0] !== lot9.position[0]).toBe(true);
    expect(lot1.position[2]).toBe(lot9.position[2]);
  });

  it('bao toan baseWidth cua de mong theo BUILDING_BASE_PLINTH_WIDTH tren tat ca 8 o goc splay', () => {
    const lot1 = getBuildingLotTransform(1);
    const lot39 = getBuildingLotTransform(39);
    expect(lot1.baseWidth).toBe(0.55);
    expect(lot39.baseWidth).toBe(0.55);
  });
});

describe('TC-410.02 [UC-CONSTRUCTION-SLAM-DROP-KINEMATICS/MSS]', () => {
  it('pha 0 (t <= 0): duy tri nguyen ven do cao ban dau va chua cham dat', () => {
    const resNegative = calculateImpactDrop(-10, 380, 3.6);
    const resZero = calculateImpactDrop(0, 380, 3.6);
    expect(resNegative.yOffset).toBe(3.6);
    expect(resZero.hasHitGround).toBe(false);
  });

  it('pha 1 (0 < t < 380): gia toc roi tu do bac hai voi do cao giam dan va chua cham dat', () => {
    const tHalf = calculateImpactDrop(190, 380, 3.6);
    const tNear = calculateImpactDrop(285, 380, 3.6);
    expect(tHalf.yOffset).toBeCloseTo(2.7, 1);
    expect(tHalf.yOffset > tNear.yOffset).toBe(true);
  });

  it('pha 2 (380 <= t <= 460): va dap mat dat bien dang nen squash voi peak tai t = 420', () => {
    const peakSquash = calculateImpactDrop(420, 380, 3.6);
    expect(peakSquash.hasHitGround).toBe(true);
    expect(peakSquash.yOffset).toBe(0);
    expect(peakSquash.scaleY).toBeCloseTo(0.78, 2);
    expect(peakSquash.scaleXZ).toBeCloseTo(1.18, 2);
  });

  it('pha 3 & 4 (t > 460): phuc hoi dan hoi rebound tai t = 520 va on dinh hoan toan sau 580ms', () => {
    const peakRebound = calculateImpactDrop(520, 380, 3.6);
    const settled = calculateImpactDrop(600, 380, 3.6);
    expect(peakRebound.scaleY).toBeCloseTo(1.08, 2);
    expect(peakRebound.scaleXZ).toBeCloseTo(0.96, 2);
    expect(settled.scaleY).toBe(1.0);
    expect(settled.scaleXZ).toBe(1.0);
  });
});

describe('TC-410.03 [UC-ZERO-CYCLIC-DEPENDENCY-VERIFICATION/MSS]', () => {
  const repoRoot = path.resolve(__dirname, '../..');

  it('xac nhan building_typology da triet tieu hoan toan pseudo-barrel re-export LANDMARK_REGISTRY', () => {
    const typologyFile = path.resolve(repoRoot, 'src/client/3d/building_typology.ts');
    const content = fs.readFileSync(typologyFile, 'utf8');
    expect(content.includes("from './landmark_registry'")).toBe(false);
    expect(content.includes('LANDMARK_REGISTRY')).toBe(false);
  });

  it('xac nhan procedural_building khong con import tu construction_slam_vfx', () => {
    const procFile = path.resolve(repoRoot, 'src/client/3d/procedural_building.tsx');
    const content = fs.readFileSync(procFile, 'utf8');
    expect(content.includes("from './construction_slam_vfx'")).toBe(false);
  });

  it('xac nhan construction_slam_vfx khong con import tu procedural_building', () => {
    const vfxFile = path.resolve(repoRoot, 'src/client/3d/construction_slam_vfx.tsx');
    const content = fs.readFileSync(vfxFile, 'utf8');
    expect(content.includes("from './procedural_building'")).toBe(false);
  });

  it('thuat toan Tarjan xac nhan 0 chu trinh vong tron giua 6 tep kien truc client-3d', () => {
    const targetFiles = [
      path.resolve(repoRoot, 'src/client/3d/landmark_registry.ts'),
      path.resolve(repoRoot, 'src/client/3d/building_typology.ts'),
      path.resolve(repoRoot, 'src/client/3d/building_lot_transform.ts'),
      path.resolve(repoRoot, 'src/client/3d/construction_slam_math.ts'),
      path.resolve(repoRoot, 'src/client/3d/procedural_building.tsx'),
      path.resolve(repoRoot, 'src/client/3d/construction_slam_vfx.tsx'),
    ];
    const cycles = detectCycles(targetFiles, repoRoot);
    expect(cycles.length).toBe(0);
  });
});

describe('TC-410.04 [UC-BACKWARD-COMPATIBILITY-CALL-SITE-PARITY/MSS]', () => {
  it('dong nhat tham chieu getBuildingLotTransform giua seam moi va re-export tu procedural_building', () => {
    expect(ProceduralBuildingMod.getBuildingLotTransform).toBe(getBuildingLotTransform);
  });

  it('dong nhat tham chieu calculateImpactDrop giua seam moi va re-export tu construction_slam_vfx', () => {
    expect(ConstructionSlamVfxMod.calculateImpactDrop).toBe(calculateImpactDrop);
  });

  it('dong nhat tham chieu getBuildingWorldPosition giua seam moi va re-export tu construction_slam_vfx', () => {
    expect(ConstructionSlamVfxMod.getBuildingWorldPosition).toBe(getBuildingWorldPosition);
  });

  it('toa do khong gian the gioi dong nhat 100% tren cell 15 (Canh 1) qua 2 cong ket noi', () => {
    const posSeam = getBuildingWorldPosition(15);
    const posReExport = ConstructionSlamVfxMod.getBuildingWorldPosition(15);
    expect(posSeam).toEqual(posReExport);
    expect(posSeam[0]).toBeCloseTo(-9 + 1.38);
  });
});
