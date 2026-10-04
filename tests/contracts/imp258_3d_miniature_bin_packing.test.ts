// [TC-IMP258/MSS][UC-IMP258] Contract Test Suite: 3D Miniature Bin-Packing for Procedural Property Stacking
// Universal 5-Facet Behavioral Matrix:
// Facet 1: Single Item Volumetric Packing & Centering (TC-IMP258.01..04)
// Facet 2: Multi-Item Shelf Packing & Row X Wrapping (TC-IMP258.05..08)
// Facet 3: Depth Z Shelf & Height Y Floor Stacking (TC-IMP258.09..11)
// Facet 4: Lot Boundary Containment & Zero Sidewalk Bleed (TC-IMP258.12..14)
// Facet 5: Non-Overlapping Invariant, Determinism & Dual Rendering Parity (TC-IMP258.15..24)

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as THREE from 'three';
import {
  packBoxes,
  boxesOverlap,
  createBuildingBoxItems,
  computePackedBuildingSlots,
  type BoxItem,
  type PackedSlot,
} from '../../src/client/3d/building_packer.js';
import {
  ToyPropertyBuildings,
} from '../../src/client/3d/toy_property_buildings.js';
import {
  calculateHouseInstanceMatrix,
} from '../../src/client/3d/instanced_toy_buildings.js';
import { cellPosition } from '../../src/client/3d/board_coords.js';
import { tileRotation } from '../../src/client/3d/board_layout.js';

describe('[TC-IMP258/MSS][UC-IMP258] 3D Miniature Bin-Packing Contract Suite', () => {
  // =========================================================================
  // Facet 1: Single Item Volumetric Packing & Centering (TC-IMP258.01..04)
  // =========================================================================

  it('[TC-IMP258.01/MSS][UC-IMP258/MSS] packBoxes with single Level 1 item centers slot at [0, y, 0]', () => {
    const items: readonly BoxItem[] = [{ id: 'house-1', size: [0.22, 0.10, 0.16] }];
    const result = packBoxes(items, { center: true, baseAnchoredY: true });
    const slot = result.slots.get('house-1');

    expect(slot?.position[0]).toBeCloseTo(0, 5);
    expect(slot?.position[2]).toBeCloseTo(0, 5);
  });

  it('[TC-IMP258.02/MSS][UC-IMP258/MSS] packBoxes preserves original size [0.22, 0.10, 0.16] and scale 1.0', () => {
    const items: readonly BoxItem[] = [{ id: 'house-1', size: [0.22, 0.10, 0.16] }];
    const result = packBoxes(items);
    const slot = result.slots.get('house-1');

    expect(result.scale).toBe(1.0);
    expect(slot?.size).toEqual([0.22, 0.10, 0.16]);
  });

  it('[TC-IMP258.03/MSS][UC-IMP258/MSS] packBoxes with baseAnchoredY: true anchors bottom ground at y = 0', () => {
    const items: readonly BoxItem[] = [{ id: 'house-1', size: [0.22, 0.10, 0.16] }];
    const result = packBoxes(items, { baseAnchoredY: true });
    const slot = result.slots.get('house-1');

    expect(slot?.position[1]).toBeCloseTo(0, 5);
  });

  it('[TC-IMP258.04/A1][UC-IMP258/A1] packBoxes with empty items safely returns empty slots and extent [0, 0, 0]', () => {
    const result = packBoxes([]);

    expect(result.slots.size).toBe(0);
    expect(result.extent).toEqual([0, 0, 0]);
    expect(result.scale).toBe(1.0);
  });

  // =========================================================================
  // Facet 2: Multi-Item Shelf Packing & Row X Wrapping (TC-IMP258.05..08)
  // =========================================================================

  it('[TC-IMP258.05/MSS][UC-IMP258/MSS] packBoxes arranges 2 Level 2 houses along X axis with gap buffer', () => {
    const items: readonly BoxItem[] = [
      { id: 'house-1', size: [0.22, 0.10, 0.16] },
      { id: 'house-2', size: [0.22, 0.10, 0.16] },
    ];
    const result = packBoxes(items, { gap: 0.05, maxLotBounds: [1.6, 0.35] });
    const slot1 = result.slots.get('house-1');
    const slot2 = result.slots.get('house-2');
    const deltaX = Math.abs((slot2?.position[0] ?? 0) - (slot1?.position[0] ?? 0));

    expect(deltaX).toBeCloseTo(0.27, 4);
  });

  it('[TC-IMP258.06/MSS][UC-IMP258/MSS] packBoxes centers 2 Level 2 houses symmetrically across X = 0', () => {
    const items: readonly BoxItem[] = [
      { id: 'house-1', size: [0.22, 0.10, 0.16] },
      { id: 'house-2', size: [0.22, 0.10, 0.16] },
    ];
    const result = packBoxes(items, { gap: 0.14, center: true, maxLotBounds: [1.6, 0.35] });
    const slot1 = result.slots.get('house-1');
    const slot2 = result.slots.get('house-2');

    expect(slot1?.position[0]).toBeCloseTo(-0.18, 4);
    expect(slot2?.position[0]).toBeCloseTo(0.18, 4);
  });

  it('[TC-IMP258.07/MSS][UC-IMP258/MSS] volumetric shelf packing accommodates both houses on a single row X', () => {
    const items: readonly BoxItem[] = [
      { id: 'house-1', size: [0.22, 0.10, 0.16] },
      { id: 'house-2', size: [0.22, 0.10, 0.16] },
    ];
    const result = packBoxes(items, { maxLotBounds: [1.6, 1.6] });
    const slot1 = result.slots.get('house-1');
    const slot2 = result.slots.get('house-2');

    expect(slot1?.position[2]).toBeCloseTo(slot2?.position[2] ?? 1, 5);
    expect(result.extent[2]).toBeCloseTo(0.16, 4);
  });

  it('[TC-IMP258.08/A2][UC-IMP258/A2] packBoxes wraps second item to next Z depth shelf when preferredWidth is constricted', () => {
    const items: readonly BoxItem[] = [
      { id: 'house-1', size: [0.22, 0.10, 0.16] },
      { id: 'house-2', size: [0.22, 0.10, 0.16] },
    ];
    const result = packBoxes(items, { preferredWidth: 0.30, gap: 0.05 });
    const slot1 = result.slots.get('house-1');
    const slot2 = result.slots.get('house-2');
    const deltaZ = Math.abs((slot2?.position[2] ?? 0) - (slot1?.position[2] ?? 0));

    expect(deltaZ).toBeCloseTo(0.21, 4);
  });

  // =========================================================================
  // Facet 3: Depth Z Shelf & Height Y Floor Stacking (TC-IMP258.09..11)
  // =========================================================================

  it('[TC-IMP258.09/MSS][UC-IMP258/MSS] packBoxes stacks items vertically along Y when lot depth is exceeded', () => {
    const items: readonly BoxItem[] = [
      { id: 'block-1', size: [0.20, 0.10, 0.20] },
      { id: 'block-2', size: [0.20, 0.10, 0.20] },
    ];
    const result = packBoxes(items, { preferredWidth: 0.25, maxLotBounds: [0.25, 0.25], gap: 0.05 });
    const slot2 = result.slots.get('block-2');

    expect(slot2?.position[1] ?? 0).toBeGreaterThan(0.05);
  });

  it('[TC-IMP258.10/MSS][UC-IMP258/MSS] vertical floor stacking maintains safety gap buffer along Y axis', () => {
    const items: readonly BoxItem[] = [
      { id: 'block-1', size: [0.20, 0.10, 0.20] },
      { id: 'block-2', size: [0.20, 0.10, 0.20] },
    ];
    const result = packBoxes(items, {
      preferredWidth: 0.25,
      maxLotBounds: [0.25, 0.25],
      gap: 0.05,
      baseAnchoredY: true,
    });
    const slot1 = result.slots.get('block-1');
    const slot2 = result.slots.get('block-2');
    const deltaY = (slot2?.position[1] ?? 0) - (slot1?.position[1] ?? 0);

    expect(deltaY).toBeCloseTo(0.15, 4);
  });

  it('[TC-IMP258.11/MSS][UC-IMP258/MSS] packing Level 3 Ruby hotel centers accurately at [0, 0, 0]', () => {
    const items: readonly BoxItem[] = [{ id: 'hotel-1', size: [0.46, 0.16, 0.20] }];
    const result = packBoxes(items, { maxLotBounds: [1.6, 0.35], center: true, baseAnchoredY: true });
    const slot = result.slots.get('hotel-1');

    expect(slot?.position).toEqual([0, 0, 0]);
    expect(slot?.size).toEqual([0.46, 0.16, 0.20]);
  });

  // =========================================================================
  // Facet 4: Lot Boundary Containment & Zero Sidewalk Bleed (TC-IMP258.12..14)
  // =========================================================================

  it('[TC-IMP258.12/MSS][UC-IMP258/MSS] oversized building clusters clamp scale below 1.0 to fit maxLotBounds', () => {
    const items: readonly BoxItem[] = [{ id: 'giant-tower', size: [2.0, 1.0, 2.0] }];
    const result = packBoxes(items, { maxLotBounds: [1.6, 1.6] });

    expect(result.scale).toBeLessThan(1.0);
    expect(result.scale).toBeCloseTo(0.8, 4);
  });

  it('[TC-IMP258.13/MSS][UC-IMP258/MSS] all boundary vertices remain strictly within [-0.8, +0.8] of 2x2 lot', () => {
    const items: readonly BoxItem[] = [
      { id: 'house-1', size: [0.60, 0.20, 0.60] },
      { id: 'house-2', size: [0.60, 0.20, 0.60] },
      { id: 'house-3', size: [0.60, 0.20, 0.60] },
    ];
    const result = packBoxes(items, { maxLotBounds: [1.6, 1.6], center: true });
    const slot1 = result.slots.get('house-1');
    const slot3 = result.slots.get('house-3');
    const halfWidth1 = (slot1?.size[0] ?? 0) / 2;
    const halfWidth3 = (slot3?.size[0] ?? 0) / 2;

    expect((slot1?.position[0] ?? 0) - halfWidth1).toBeGreaterThanOrEqual(-0.80001);
    expect((slot3?.position[0] ?? 0) + halfWidth3).toBeLessThanOrEqual(0.80001);
  });

  it('[TC-IMP258.14/A3][UC-IMP258/A3] maxLotBounds [1.6, 0.35] ensures Z extent never exceeds 0.35 units', () => {
    const items: readonly BoxItem[] = [
      { id: 'house-1', size: [0.40, 0.10, 0.30] },
      { id: 'house-2', size: [0.40, 0.10, 0.30] },
    ];
    const result = packBoxes(items, { preferredWidth: 0.35, maxLotBounds: [1.6, 0.35] });

    expect(result.extent[2]).toBeLessThanOrEqual(0.35001);
  });

  // =========================================================================
  // Facet 5: Non-Overlapping Invariant, Determinism & Dual Rendering Parity (TC-IMP258.15..24)
  // =========================================================================

  it('[TC-IMP258.15/MSS][UC-IMP258/MSS] every pair of packed building boxes satisfies boxesOverlap === false', () => {
    const items = createBuildingBoxItems(2);
    const result = packBoxes(items, { gap: 0.14, maxLotBounds: [1.6, 0.35] });
    const slot1 = result.slots.get(items[0]?.id ?? '');
    const slot2 = result.slots.get(items[1]?.id ?? '');

    expect(slot1 && slot2 ? boxesOverlap(slot1, slot2) : true).toBe(false);
  });

  it('[TC-IMP258.16/MSS][UC-IMP258/MSS] createBuildingBoxItems generates correct items per property level', () => {
    const items1 = createBuildingBoxItems(1);
    const items2 = createBuildingBoxItems(2);
    const items3 = createBuildingBoxItems(3);

    expect(items1[0]?.id).toBe('house-1');
    expect(items2[1]?.id).toBe('house-2');
    expect(items3[0]?.id).toBe('hotel-1');
  });

  it('[TC-IMP258.17/MSS][UC-IMP258/MSS] ToyPropertyBuildings renders exact count of toy-house meshes at Level 1 and 2', () => {
    const htmlLvl1 = renderToStaticMarkup(React.createElement(ToyPropertyBuildings, { level: 1 }));
    const htmlLvl2 = renderToStaticMarkup(React.createElement(ToyPropertyBuildings, { level: 2 }));
    const countLvl1 = (htmlLvl1.match(/data-testid="toy-house"/g) || []).length;
    const countLvl2 = (htmlLvl2.match(/data-testid="toy-house"/g) || []).length;

    expect(countLvl1).toBe(1);
    expect(countLvl2).toBe(2);
  });

  it('[TC-IMP258.18/MSS][UC-IMP258/MSS] ToyPropertyBuildings outputs toy-property-building group with packed positions', () => {
    const html = renderToStaticMarkup(React.createElement(ToyPropertyBuildings, { level: 1 }));

    expect(html).toContain('data-testid="toy-property-building"');
    expect(html).toContain('data-testid="toy-house"');
  });

  it('[TC-IMP258.19/MSS][UC-IMP258/MSS] [DIR-G2] packed buildings at Z ≈ -0.80 maintain deltaZ >= 1.0m from flagpole at Z = 0.72', () => {
    const slots = computePackedBuildingSlots(2);
    const slotZ = slots[0]?.position[2] ?? 0;
    const buildingZ = -0.80 + slotZ;
    const flagZ = 0.72;
    const deltaZ = flagZ - buildingZ;

    expect(deltaZ).toBeGreaterThanOrEqual(1.0);
  });

  it('[TC-IMP258.20/MSS][UC-IMP258/MSS] [DIR-G3] local Z coordinate for levels 1..3 stays within ±0.08m from Z = -0.80', () => {
    const slots1 = computePackedBuildingSlots(1);
    const slots2 = computePackedBuildingSlots(2);
    const slots3 = computePackedBuildingSlots(3);
    const maxAbsZ = Math.max(
      Math.abs(slots1[0]?.position[2] ?? 0),
      Math.abs(slots2[0]?.position[2] ?? 0),
      Math.abs(slots3[0]?.position[2] ?? 0)
    );

    expect(maxAbsZ).toBeLessThanOrEqual(0.08);
  });

  it('[TC-IMP258.21/MSS][UC-IMP258/MSS] [DIR-ADV-01] calculateHouseInstanceMatrix X position matches ToyPropertyBuildings', () => {
    const [tx, ty, tz] = cellPosition(1);
    const [rx, ry, rz] = tileRotation(1);
    const tileMat = new THREE.Matrix4();
    const euler = new THREE.Euler(rx, ry, rz, 'XYZ');
    tileMat.makeRotationFromEuler(euler);
    tileMat.setPosition(tx, ty, tz);
    const invTileMat = tileMat.clone().invert();

    const matLvl1 = calculateHouseInstanceMatrix(1, 0, 1);
    const localMat1 = invTileMat.clone().multiply(matLvl1);
    const localX_lvl1 = localMat1.elements[12];

    const matLvl2 = calculateHouseInstanceMatrix(1, 0, 2);
    const localMat2 = invTileMat.clone().multiply(matLvl2);
    const localX_lvl2 = localMat2.elements[12];

    const slots1 = computePackedBuildingSlots(1);
    const slots2 = computePackedBuildingSlots(2);

    expect(localX_lvl1).toBeCloseTo(slots1[0]?.position[0] ?? -999, 4);
    expect(localX_lvl2).toBeCloseTo(slots2[0]?.position[0] ?? -999, 4);
  });

  it('[TC-IMP258.22/A4][UC-IMP258/A4] [DIR-ADV-02] packBoxes sanitizes negative, zero, or NaN dimensions to 0.001', () => {
    const items: readonly BoxItem[] = [{ id: 'bad-dim', size: [-1, 0, Number.NaN] }];
    const result = packBoxes(items);
    const slot = result.slots.get('bad-dim');

    expect(Number.isNaN(result.extent[0])).toBe(false);
    expect(Number.isNaN(result.extent[1])).toBe(false);
    expect(Number.isNaN(result.extent[2])).toBe(false);
    expect(slot?.size).toEqual([0.001, 0.001, 0.001]);
  });

  it('[TC-IMP258.23/A5][UC-IMP258/A5] [DIR-ADV-03] packBoxes provides 100% deterministic slots regardless of item order', () => {
    const itemA: BoxItem = { id: 'building-a', size: [0.20, 0.10, 0.15] };
    const itemB: BoxItem = { id: 'building-b', size: [0.30, 0.12, 0.18] };
    const resForward = packBoxes([itemA, itemB]);
    const resReverse = packBoxes([itemB, itemA]);

    expect(resForward.slots.get('building-a')?.position).toEqual(
      resReverse.slots.get('building-a')?.position
    );
    expect(resForward.slots.get('building-b')?.position).toEqual(
      resReverse.slots.get('building-b')?.position
    );
  });

  it('[TC-IMP258.24/MSS][UC-IMP258/MSS] [DIR-G1] computePackedBuildingSlots returns cached reference on subsequent calls', () => {
    const firstCall = computePackedBuildingSlots(2);
    const secondCall = computePackedBuildingSlots(2);

    expect(firstCall).toBe(secondCall);
  });

  it('[TC-IMP258.25/MSS][UC-IMP258/MSS] boxesOverlap returns false for slots separated vertically along Y axis', () => {
    const slotBottom: PackedSlot = { position: [0, 0, 0], size: [0.5, 0.5, 0.5] };
    const slotTop: PackedSlot = { position: [0, 1.0, 0], size: [0.5, 0.5, 0.5] };

    expect(boxesOverlap(slotBottom, slotTop)).toBe(false);
  });

  it('[TC-IMP258.26/MSS][UC-IMP258/MSS] boxesOverlap returns true when two 3D boxes intersect in all 3 axes', () => {
    const slotA: PackedSlot = { position: [0, 0, 0], size: [0.5, 0.5, 0.5] };
    const slotB: PackedSlot = { position: [0.2, 0.2, 0.2], size: [0.5, 0.5, 0.5] };

    expect(boxesOverlap(slotA, slotB)).toBe(true);
  });

  it('[TC-IMP258.27/MSS][UC-IMP258/MSS] createBuildingBoxItems and computePackedBuildingSlots return empty arrays for level 0', () => {
    const items = createBuildingBoxItems(0);
    const slots = computePackedBuildingSlots(0);

    expect(items).toEqual([]);
    expect(items.length).toBe(0);
    expect(slots).toEqual([]);
    expect(slots.length).toBe(0);
  });

  it('[TC-IMP258.28/MSS][UC-IMP258/MSS] computePackedBuildingSlots respects explicit positive gap option', () => {
    const slots = computePackedBuildingSlots(2, { gap: 0.2 });
    const deltaX = Math.abs((slots[1]?.position[0] ?? 0) - (slots[0]?.position[0] ?? 0));

    expect(deltaX).toBeCloseTo(0.42, 4);
  });

  it('[TC-IMP258.29/A6][UC-IMP258/A6] packBoxes safely handles null and undefined items without unhandled exceptions', () => {
    const resultNull = packBoxes(null!);
    const resultUndefined = packBoxes(undefined!);

    expect(resultNull.slots.size).toBe(0);
    expect(resultNull.extent).toEqual([0, 0, 0]);
    expect(resultUndefined.slots.size).toBe(0);
    expect(resultUndefined.extent).toEqual([0, 0, 0]);
  });
});
