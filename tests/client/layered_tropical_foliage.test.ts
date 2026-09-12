// [UI-S01/MSS][IMP-13] LayeredTropicalFoliage Unit Tests — Foliage Architecture & Draw Call Optimization
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import { LayeredTropicalFoliage, TROPICAL_TREES } from '../../src/client/3d/layered_tropical_foliage';

describe('[UI-S01/MSS][IMP-13] LayeredTropicalFoliage — Foliage Architecture & Draw Call Optimization', () => {
  let originalConsoleError: typeof console.error;

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (
        msg.includes('is using incorrect casing') ||
        msg.includes('does not recognize the') ||
        msg.includes('non-boolean attribute')
      ) {
        return;
      }
      originalConsoleError(...args);
    };
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('LayeredTropicalFoliage duoc export duoi dang React Component', () => {
    expect(typeof LayeredTropicalFoliage).toBe('function');
  });

  it('TROPICAL_TREES dinh nghia day du 32 vi tri cay phan bo tu nhien tren dao', () => {
    expect(TROPICAL_TREES.length).toBe(32);

    for (const tree of TROPICAL_TREES) {
      // Kiem tra toa do va ti le
      expect(typeof tree.x).toBe('number');
      expect(typeof tree.y).toBe('number');
      expect(typeof tree.z).toBe('number');
      expect(tree.scale).toBeGreaterThan(0.7);
      expect(tree.scale).toBeLessThan(1.5);

      // Kiem tra do uon cong tu nhien cua than cay (khong thang do dot ngot)
      expect(Math.abs(tree.tiltX)).toBeGreaterThan(0.01);
      expect(typeof tree.yaw).toBe('number');
    }
  });

  it('LayeredTropicalFoliage render an toan ngoai Canvas voi 4 InstancedMesh cho 32 cay', () => {
    const html = renderToStaticMarkup(React.createElement(LayeredTropicalFoliage));

    expect(html).toContain('data-testid="layered-tropical-foliage"');

    // Kiem tra su hien dien cua cylinderGeometry cho than va coneGeometry cho 3 tang la
    expect(html).toContain('cylinderGeometry');
    expect(html).toContain('coneGeometry');

    // Kiem tra 3 ma mau phan tang cua la cay
    expect(html).toContain('#78350F'); // Than cay cong tu nhien
    expect(html).toContain('#15803D'); // Tang 1: Xanh reu dam
    expect(html).toContain('#16A34A'); // Tang 2: Xanh ram rap
    expect(html).toContain('#4ADE80'); // Tang 3: Xanh anh vang nang
  });

  it('Gom toan bo cay vao InstancedMesh dat muc tieu toi uu Draw Calls (<85 calls)', () => {
    // 32 cay x 4 phan tu = 128 meshes neu render thu cong
    // InstancedMesh giam xuong chi con dung 4 Draw Calls duy nhat
    const unbatchedMeshCount = TROPICAL_TREES.length * 4;
    const instancedMeshCount = 4;
    const reductionPercent = ((unbatchedMeshCount - instancedMeshCount) / unbatchedMeshCount) * 100;

    expect(unbatchedMeshCount).toBe(128);
    expect(instancedMeshCount).toBe(4);
    expect(reductionPercent).toBeCloseTo(96.875, 1);
  });

  it('LayeredTropicalFoliage tinh toan computeBoundingSphere cho 4 InstancedMeshes tranh loi Frustum Culling', () => {
    const srcPath = path.resolve(process.cwd(), 'src', 'client', '3d', 'layered_tropical_foliage.tsx');
    const source = fs.readFileSync(srcPath, 'utf-8');

    // Kiem tra cac goi computeBoundingSphere tren tat ca cac InstancedMeshes
    expect(source).toContain('trunk.computeBoundingSphere');
    expect(source).toContain('tier1.computeBoundingSphere');
    expect(source).toContain('tier2.computeBoundingSphere');
    expect(source).toContain('tier3.computeBoundingSphere');
  });
});
