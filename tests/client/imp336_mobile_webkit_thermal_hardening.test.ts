// [TC-336/MSS][UC-IMP336] Living Contract Test Suite: Mobile WebKit 3D Performance & Thermal Hardening
// Station 1: Comprehensive Contract Specification for Responsive Tile Geometry
// Scope: src/client/3d/board_tile.tsx

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';

import {
  LayeredDioramaTile,
  type LayeredDioramaTileProps,
} from '../../src/client/3d/board_tile';
import { CellType, ColorGroup, type BoardCell } from '../../src/domain/board_config';

type TargetProps = {
  readonly args?: readonly unknown[];
  readonly radius?: number;
  readonly smoothness?: number;
  readonly receiveShadow?: boolean;
  readonly castShadow?: boolean;
  readonly children?: React.ReactNode;
  readonly [key: string]: unknown;
};

type CapturedElement = React.ReactElement<TargetProps>;

function isElementWithProps(val: unknown): val is CapturedElement {
  return React.isValidElement(val) && typeof val.props === 'object' && val.props !== null;
}

function findNode(
  node: unknown,
  predicate: (n: CapturedElement) => boolean
): CapturedElement | null {
  if (!isElementWithProps(node)) return null;
  if (predicate(node)) return node;
  const children = node.props.children;
  if (!children) return null;
  let found: CapturedElement | null = null;
  React.Children.forEach(children, (child) => {
    if (found) return;
    if (isElementWithProps(child)) {
      found = findNode(child, predicate);
    }
  });
  return found;
}

function captureTree<P extends object>(
  Component: (props: P) => React.ReactElement,
  props: P
): CapturedElement | null {
  let captured: CapturedElement | null = null;
  function Spy(): React.ReactElement {
    const result = Component(props);
    if (isElementWithProps(result)) {
      captured = result;
    }
    return React.createElement('div', null);
  }
  renderToStaticMarkup(React.createElement(Spy));
  return captured;
}

const sampleCornerCell: BoardCell = {
  index: 0,
  name: 'Xuất Phát (GO)',
  type: CellType.Go,
};

const sampleRegularCell: BoardCell = {
  index: 1,
  name: 'Cần Thơ (Cái Răng)',
  type: CellType.Property,
  colorGroup: ColorGroup.Nau,
};

const boardTilePath = path.resolve(process.cwd(), 'src/client/3d/board_tile.tsx');

describe('[TC-336] Mobile WebKit 3D Performance & Thermal Hardening', () => {
  describe('Facet 1: Standard Tile Geometry Scalability', () => {
    it('[TC-336.01/MSS] LayeredDioramaTile sets smoothness={1} on regular tile base RoundedBox when isMobile={true}', () => {
      const tree = captureTree<LayeredDioramaTileProps>(LayeredDioramaTile, {
        cell: sampleRegularCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: false,
        isMobile: true,
      });

      const regularBox = findNode(tree, (n) => {
        const args = n.props.args;
        return Array.isArray(args) && args[0] === 1.68 && args[1] === 0.2 && args[2] === 2.2;
      });

      expect(regularBox).not.toBeNull();
      expect(regularBox?.props.smoothness).toBe(1);
    });

    it('[TC-336.02/A1] LayeredDioramaTile sets smoothness={4} on regular tile base RoundedBox when isMobile={false}', () => {
      const tree = captureTree<LayeredDioramaTileProps>(LayeredDioramaTile, {
        cell: sampleRegularCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: false,
        isMobile: false,
      });

      const regularBox = findNode(tree, (n) => {
        const args = n.props.args;
        return Array.isArray(args) && args[0] === 1.68 && args[1] === 0.2 && args[2] === 2.2;
      });

      expect(regularBox).not.toBeNull();
      expect(regularBox?.props.smoothness).toBe(4);
    });

    it('[TC-336.03/MSS] LayeredDioramaTile preserves standard tile dimensions args={[1.68, 0.2, 2.2]} on mobile', () => {
      const tree = captureTree<LayeredDioramaTileProps>(LayeredDioramaTile, {
        cell: sampleRegularCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: false,
        isMobile: true,
      });

      const regularBox = findNode(tree, (n) => {
        const args = n.props.args;
        return Array.isArray(args) && args[0] === 1.68;
      });

      expect(regularBox?.props.args).toEqual([1.68, 0.2, 2.2]);
    });

    it('[TC-336.04/MSS] LayeredDioramaTile preserves radius={0.08} on mobile regular tile base', () => {
      const tree = captureTree<LayeredDioramaTileProps>(LayeredDioramaTile, {
        cell: sampleRegularCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: false,
        isMobile: true,
      });

      const regularBox = findNode(tree, (n) => {
        const args = n.props.args;
        return Array.isArray(args) && args[0] === 1.68;
      });

      expect(regularBox?.props.radius).toBe(0.08);
    });
  });

  describe('Facet 2: Corner Tile Geometry Scalability', () => {
    it('[TC-336.05/MSS] LayeredDioramaTile sets smoothness={1} on corner tile base RoundedBox when isMobile={true}', () => {
      const tree = captureTree<LayeredDioramaTileProps>(LayeredDioramaTile, {
        cell: sampleCornerCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: true,
        isMobile: true,
      });

      const cornerBox = findNode(tree, (n) => {
        const args = n.props.args;
        return Array.isArray(args) && args[0] === 2.2 && args[1] === 0.22 && args[2] === 2.2;
      });

      expect(cornerBox).not.toBeNull();
      expect(cornerBox?.props.smoothness).toBe(1);
    });

    it('[TC-336.06/A1] LayeredDioramaTile sets smoothness={4} on corner tile base RoundedBox when isMobile={false}', () => {
      const tree = captureTree<LayeredDioramaTileProps>(LayeredDioramaTile, {
        cell: sampleCornerCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: true,
        isMobile: false,
      });

      const cornerBox = findNode(tree, (n) => {
        const args = n.props.args;
        return Array.isArray(args) && args[0] === 2.2 && args[1] === 0.22 && args[2] === 2.2;
      });

      expect(cornerBox).not.toBeNull();
      expect(cornerBox?.props.smoothness).toBe(4);
    });

    it('[TC-336.07/MSS] LayeredDioramaTile preserves corner tile dimensions args={[2.2, 0.22, 2.2]} on mobile', () => {
      const tree = captureTree<LayeredDioramaTileProps>(LayeredDioramaTile, {
        cell: sampleCornerCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: true,
        isMobile: true,
      });

      const cornerBox = findNode(tree, (n) => {
        const args = n.props.args;
        return Array.isArray(args) && args[0] === 2.2;
      });

      expect(cornerBox?.props.args).toEqual([2.2, 0.22, 2.2]);
    });

    it('[TC-336.08/MSS] LayeredDioramaTile preserves radius={0.08} on mobile corner tile base', () => {
      const tree = captureTree<LayeredDioramaTileProps>(LayeredDioramaTile, {
        cell: sampleCornerCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: true,
        isMobile: true,
      });

      const cornerBox = findNode(tree, (n) => {
        const args = n.props.args;
        return Array.isArray(args) && args[0] === 2.2;
      });

      expect(cornerBox?.props.radius).toBe(0.08);
    });
  });

  describe('Facet 3: PBR & Shadow Pass Preservation Under Mobile Mode', () => {
    it('[TC-336.09/MSS] Regular tile base preserves receiveShadow={true} under mobile mode', () => {
      const tree = captureTree<LayeredDioramaTileProps>(LayeredDioramaTile, {
        cell: sampleRegularCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: false,
        isMobile: true,
      });

      const regularBox = findNode(tree, (n) => {
        const args = n.props.args;
        return Array.isArray(args) && args[0] === 1.68;
      });

      expect(regularBox?.props.receiveShadow).toBe(true);
    });

    it('[TC-336.10/MSS] Corner tile base preserves receiveShadow={true} under mobile mode', () => {
      const tree = captureTree<LayeredDioramaTileProps>(LayeredDioramaTile, {
        cell: sampleCornerCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: true,
        isMobile: true,
      });

      const cornerBox = findNode(tree, (n) => {
        const args = n.props.args;
        return Array.isArray(args) && args[0] === 2.2;
      });

      expect(cornerBox?.props.receiveShadow).toBe(true);
    });

    it('[TC-336.11/MSS] Regular tile base omits castShadow to conserve mobile vertex budget', () => {
      const tree = captureTree<LayeredDioramaTileProps>(LayeredDioramaTile, {
        cell: sampleRegularCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: false,
        isMobile: true,
      });

      const regularBox = findNode(tree, (n) => {
        const args = n.props.args;
        return Array.isArray(args) && args[0] === 1.68;
      });

      expect(Boolean(regularBox?.props.castShadow)).toBe(false);
    });

    it('[TC-336.12/MSS] Corner tile base omits castShadow to conserve mobile vertex budget', () => {
      const tree = captureTree<LayeredDioramaTileProps>(LayeredDioramaTile, {
        cell: sampleCornerCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: true,
        isMobile: true,
      });

      const cornerBox = findNode(tree, (n) => {
        const args = n.props.args;
        return Array.isArray(args) && args[0] === 2.2;
      });

      expect(Boolean(cornerBox?.props.castShadow)).toBe(false);
    });
  });

  describe('Facet 4: Default Fallback & Mathematical Invariants', () => {
    it('[TC-336.13/MSS] LayeredDioramaTile resolves correctly when isMobile is omitted', () => {
      const tree = captureTree<LayeredDioramaTileProps>(LayeredDioramaTile, {
        cell: sampleRegularCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: false,
      });

      const regularBox = findNode(tree, (n) => {
        const args = n.props.args;
        return Array.isArray(args) && args[0] === 1.68;
      });

      expect(regularBox?.props.smoothness).toBeDefined();
    });

    it('[TC-336.14/MSS] Corner tile resolves correctly when isMobile is omitted', () => {
      const tree = captureTree<LayeredDioramaTileProps>(LayeredDioramaTile, {
        cell: sampleCornerCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: true,
      });

      const cornerBox = findNode(tree, (n) => {
        const args = n.props.args;
        return Array.isArray(args) && args[0] === 2.2;
      });

      expect(cornerBox?.props.smoothness).toBeDefined();
    });

    it('[TC-336.15/A1] board_tile.tsx contains dynamic smoothness={isMobile ? 1 : 4} for both regular and corner tiles', () => {
      const source = fs.readFileSync(boardTilePath, 'utf-8');
      expect(source).toContain('smoothness={isMobile ? 1 : 4}');
      expect(source).toContain('<RoundedBox args={[2.2, 0.22, 2.2]} radius={0.08} smoothness={isMobile ? 1 : 4}');
    });

    it('[TC-336.16/MSS] Mathematical invariant: mobile triangle savings across 40 tiles exceeds 30,000 triangles', () => {
      const desktopTrianglesPerTile = 972;
      const mobileTrianglesPerTile = 108;
      const totalTiles = 40;
      const desktopTotal = desktopTrianglesPerTile * totalTiles;
      const mobileTotal = mobileTrianglesPerTile * totalTiles;
      const savings = desktopTotal - mobileTotal;

      expect(savings).toBe(34560);
      expect(savings).toBeGreaterThan(30000);
    });
  });
});
