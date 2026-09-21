// [TC-150/MSS][UC-IMP150] Contract Test Suite: Mobile & iOS 60 FPS Performance Hardening (IMP-150)
// Universal 4-Facet Behavioral Matrix Verification:
// Facet 1: Boundary & Range (Shadow Map toggle on DirectionalLight & Canvas)
// Facet 2: State Reactivity & Pipeline Adaptivity (SMAA bypass, Bloom mipmapBlur, N8AO low-FPS cutoff)
// Facet 3: Resource Disposal & Tile Decoupling (Corner & Regular base tile castShadow removal, preservation of receiveShadow & flag shadows)
// Facet 4: Error Defense & Contract Integrity (String retention for legacy tests, pure execution resilience, RoundedBox geometry args retention)

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import { Canvas } from '@react-three/fiber';
import { Bloom, SMAA, N8AO } from '@react-three/postprocessing';

import { TimeOfDayLighting, type TimeOfDayLightingProps } from '../../src/client/3d/time_of_day_lighting';
import { GameCanvas, type GameCanvasProps } from '../../src/client/game_canvas';
import { PostProcessingPipeline } from '../../src/client/3d/post_processing_pipeline';
import {
  LayeredDioramaTile,
  OwnershipMarkerInstances,
  type LayeredDioramaTileProps,
  type OwnershipMarkerInstancesProps,
} from '../../src/client/3d/board_tile';
import { CellType, ColorGroup, type BoardCell } from '../../src/domain/board_config';

// ============================================================================
// REUSABLE TEST HARNESS HELPERS
// ============================================================================

function getNodeType(node: any): string {
  if (!node || !node.type) return '';
  if (typeof node.type === 'string') return node.type;
  if (typeof node.type === 'function') return node.type.name || '';
  if (typeof node.type === 'object' && node.type !== null) {
    return node.type.displayName || node.type.name || '';
  }
  return '';
}

function findFirstNode(
  node: any,
  predicate: (node: any) => boolean
): any | null {
  if (!node || typeof node !== 'object') return null;
  if (predicate(node)) return node;
  let found: any = null;
  if (node.props?.children) {
    React.Children.forEach(node.props.children, (child) => {
      if (found) return;
      if (React.isValidElement(child)) {
        found = findFirstNode(child, predicate);
      }
    });
  }
  return found;
}

/**
 * Executes Component inside a lightweight React render context without mounting Three.js DOM,
 * capturing the topmost returned ReactElement tree.
 */
function captureTree<P = any>(Component: React.ComponentType<P>, props?: P): any {
  let captured: any = null;
  function SpyComponent() {
    captured = (Component as any)(props ?? {});
    return React.createElement('div', null);
  }
  renderToStaticMarkup(React.createElement(SpyComponent));
  return captured;
}

function findSunDirectionalLight(tree: any): any | null {
  return findFirstNode(
    tree,
    (n) =>
      getNodeType(n) === 'directionalLight' &&
      (n.props?.['shadow-mapSize-width'] !== undefined ||
        n.props?.['shadow-camera-far'] !== undefined ||
        n.props?.['shadow-camera-left'] !== undefined)
  );
}

// Domain Test Fixtures
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

describe('[TC-150/MSS][UC-IMP150] Mobile & iOS 60 FPS Performance Hardening Contract Suite', () => {
  const rootDir = process.cwd();
  const gameCanvasPath = path.resolve(rootDir, 'src', 'client', 'game_canvas.tsx');
  const boardTilePath = path.resolve(rootDir, 'src', 'client', '3d', 'board_tile.tsx');

  // =========================================================================
  // FACET 1: BOUNDARY & RANGE (SHADOW MAP CONDITIONAL TOGGLES)
  // =========================================================================
  describe('Facet 1: Boundary & Range — Dynamic Shadow Map Gating', () => {
    it('[TC-150.01/MSS] TimeOfDayLighting directionalLight configures castShadow={false} when isMobile === true', () => {
      const tree = captureTree<TimeOfDayLightingProps>(TimeOfDayLighting, { isMobile: true });
      const sunLight = findSunDirectionalLight(tree);
      expect(sunLight).not.toBeNull();
      expect(Boolean(sunLight?.props?.castShadow)).toBe(false);
    });

    it('[TC-150.02/MSS] TimeOfDayLighting directionalLight configures castShadow={true} when isMobile === false or undefined', () => {
      const desktopTree = captureTree<TimeOfDayLightingProps>(TimeOfDayLighting, { isMobile: false });
      const desktopSun = findSunDirectionalLight(desktopTree);
      expect(desktopSun).not.toBeNull();
      expect(Boolean(desktopSun?.props?.castShadow)).toBe(true);

      const defaultTree = captureTree<TimeOfDayLightingProps>(TimeOfDayLighting);
      const defaultSun = findSunDirectionalLight(defaultTree);
      expect(defaultSun).not.toBeNull();
      expect(Boolean(defaultSun?.props?.castShadow)).toBe(true);
    });

    it('[TC-150.03/MSS] GameCanvas passes shadows={false} to Canvas when isMobile === true', () => {
      const tree = captureTree<GameCanvasProps>(GameCanvas, { isMobile: true });
      const canvas = findFirstNode(tree, (n) => getNodeType(n) === 'Canvas' || n?.type === Canvas);
      expect(canvas).not.toBeNull();
      expect(canvas?.props?.shadows).toBe(false);
    });

    it('[TC-150.04/MSS] GameCanvas passes shadows="soft" to Canvas when isMobile === false', () => {
      const tree = captureTree<GameCanvasProps>(GameCanvas, { isMobile: false });
      const canvas = findFirstNode(tree, (n) => getNodeType(n) === 'Canvas' || n?.type === Canvas);
      expect(canvas).not.toBeNull();
      expect(canvas?.props?.shadows).toBe('soft');
    });
  });

  // =========================================================================
  // FACET 2: STATE REACTIVITY & PIPELINE ADAPTIVITY (POST-PROCESSING)
  // =========================================================================
  describe('Facet 2: State Reactivity & Pipeline Adaptivity — Post-Processing Optimization', () => {
    it('[TC-150.05/MSS] PostProcessingPipeline excludes SMAA pass when isMobile === true', () => {
      const pipeline = PostProcessingPipeline({ isMobile: true });
      expect(pipeline).not.toBeNull();
      const smaa = findFirstNode(pipeline, (n) => getNodeType(n) === 'SMAA' || n?.type === SMAA);
      expect(smaa).toBeNull();
    });

    it('[TC-150.06/MSS] PostProcessingPipeline preserves SMAA pass when isMobile === false', () => {
      const pipeline = PostProcessingPipeline({ isMobile: false });
      expect(pipeline).not.toBeNull();
      const smaa = findFirstNode(pipeline, (n) => getNodeType(n) === 'SMAA' || n?.type === SMAA);
      expect(smaa).not.toBeNull();
    });

    it('[TC-150.07/MSS] PostProcessingPipeline disables mipmapBlur on Bloom when isMobile === true', () => {
      const pipeline = PostProcessingPipeline({ isMobile: true });
      expect(pipeline).not.toBeNull();
      const bloom = findFirstNode(pipeline, (n) => getNodeType(n) === 'Bloom' || n?.type === Bloom);
      expect(bloom).not.toBeNull();
      expect(bloom?.props?.mipmapBlur).toBe(false);
    });

    it('[TC-150.08/MSS] PostProcessingPipeline enables mipmapBlur on Bloom when isMobile === false', () => {
      const pipeline = PostProcessingPipeline({ isMobile: false });
      expect(pipeline).not.toBeNull();
      const bloom = findFirstNode(pipeline, (n) => getNodeType(n) === 'Bloom' || n?.type === Bloom);
      expect(bloom).not.toBeNull();
      expect(bloom?.props?.mipmapBlur).toBe(true);
    });

    it('[TC-150.09/MSS] PostProcessingPipeline automatically disables N8AO when fps < 35 even if enableAo === true', () => {
      const pipeline = PostProcessingPipeline({ enableAo: true, fps: 30, isMobile: false });
      expect(pipeline).not.toBeNull();
      const n8ao = findFirstNode(pipeline, (n) => getNodeType(n) === 'N8AO' || n?.type === N8AO);
      expect(n8ao).toBeNull();
    });

    it('[TC-150.10/MSS] PostProcessingPipeline retains N8AO when isMobile === false and fps >= 45', () => {
      const pipeline = PostProcessingPipeline({ enableAo: true, fps: 50, isMobile: false });
      expect(pipeline).not.toBeNull();
      const n8ao = findFirstNode(pipeline, (n) => getNodeType(n) === 'N8AO' || n?.type === N8AO);
      expect(n8ao).not.toBeNull();
    });
  });

  // =========================================================================
  // FACET 3: RESOURCE DISPOSAL & TILE DECOUPLING (BOARD TILE SHADOW BUDGET)
  // =========================================================================
  describe('Facet 3: Resource Disposal & Tile Decoupling — Board Tile Shadow Decoupling', () => {
    it('[TC-150.11/MSS] board_tile.tsx corner tile base RoundedBox does NOT cast shadow', () => {
      const cornerTile = captureTree<LayeredDioramaTileProps>(LayeredDioramaTile, {
        cell: sampleCornerCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: true,
      });
      const cornerBase = findFirstNode(cornerTile, (n) => {
        const args = n?.props?.args;
        return Array.isArray(args) && args[0] === 2.2 && args[1] === 0.22 && args[2] === 2.2;
      });
      expect(cornerBase).not.toBeNull();
      expect(Boolean(cornerBase?.props?.castShadow)).toBe(false);

      // Verify static code invariant
      const source = fs.readFileSync(boardTilePath, 'utf-8');
      const cornerBoxMatch = source.match(/<RoundedBox[^>]*args=\{\[2\.2,\s*0\.22,\s*2\.2\]\}[^>]*>/);
      expect(cornerBoxMatch).not.toBeNull();
      expect(cornerBoxMatch?.[0]).not.toContain('castShadow');
    });

    it('[TC-150.12/MSS] board_tile.tsx regular tile base RoundedBox does NOT cast shadow', () => {
      const regularTile = captureTree<LayeredDioramaTileProps>(LayeredDioramaTile, {
        cell: sampleRegularCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: false,
      });
      const regularBase = findFirstNode(regularTile, (n) => {
        const args = n?.props?.args;
        return Array.isArray(args) && args[0] === 1.68 && args[1] === 0.2 && args[2] === 2.2;
      });
      expect(regularBase).not.toBeNull();
      expect(Boolean(regularBase?.props?.castShadow)).toBe(false);

      // Verify static code invariant
      const source = fs.readFileSync(boardTilePath, 'utf-8');
      const regularBoxMatch = source.match(/<RoundedBox[^>]*args=\{\[1\.68,\s*0\.2,\s*2\.2\]\}[^>]*>/);
      expect(regularBoxMatch).not.toBeNull();
      expect(regularBoxMatch?.[0]).not.toContain('castShadow');
    });

    it('[TC-150.13/MSS] board_tile.tsx preserves receiveShadow={true} on both corner and regular base blocks', () => {
      const cornerTile = captureTree<LayeredDioramaTileProps>(LayeredDioramaTile, {
        cell: sampleCornerCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: true,
      });
      const cornerBase = findFirstNode(cornerTile, (n) => {
        const args = n?.props?.args;
        return Array.isArray(args) && args[0] === 2.2 && args[1] === 0.22 && args[2] === 2.2;
      });
      expect(cornerBase).not.toBeNull();
      expect(cornerBase?.props?.receiveShadow).toBe(true);

      const regularTile = captureTree<LayeredDioramaTileProps>(LayeredDioramaTile, {
        cell: sampleRegularCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: false,
      });
      const regularBase = findFirstNode(regularTile, (n) => {
        const args = n?.props?.args;
        return Array.isArray(args) && args[0] === 1.68 && args[1] === 0.2 && args[2] === 2.2;
      });
      expect(regularBase).not.toBeNull();
      expect(regularBase?.props?.receiveShadow).toBe(true);
    });

    it('[TC-150.14/MSS][TC-87.10b] OwnershipMarkerInstances strictly preserves castShadow={true} on FlagPole and FlagCloth', () => {
      const ownershipTree = captureTree<OwnershipMarkerInstancesProps>(OwnershipMarkerInstances, {
        ownerColor: '#DC2626',
        level: 1,
        ownerSlot: 0,
        mascotIcon: '🏰',
      });
      const flagPole = findFirstNode(ownershipTree, (n) => n?.props?.name === 'FlagPole');
      expect(flagPole).not.toBeNull();
      expect(flagPole?.props?.castShadow).toBe(true);

      const flagCloth = findFirstNode(ownershipTree, (n) => n?.props?.name === 'FlagCloth');
      expect(flagCloth).not.toBeNull();
      expect(flagCloth?.props?.castShadow).toBe(true);
    });
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE & CONTRACT INTEGRITY (BACKWARDS COMPATIBILITY)
  // =========================================================================
  describe('Facet 4: Error Defense & Contract Integrity — Backwards Compatibility Guarantees', () => {
    it('[TC-150.15/MSS] game_canvas.tsx preserves shadows="soft" substring for backwards compatibility with imp77/TC-IMP34.10', () => {
      const source = fs.readFileSync(gameCanvasPath, 'utf-8');
      expect(source).toContain('shadows="soft"');
    });

    it('[TC-150.16/MSS] game_canvas.tsx preserves <PostProcessingPipeline /> substring for post_processing_pipeline test contract', () => {
      const source = fs.readFileSync(gameCanvasPath, 'utf-8');
      expect(source).toContain('<PostProcessingPipeline />');
    });

    it('[TC-150.17/MSS] PostProcessingPipeline is callable as a pure function outside React context without Invalid hook call', () => {
      expect(() => PostProcessingPipeline({})).not.toThrow();
      const element = PostProcessingPipeline({});
      expect(React.isValidElement(element)).toBe(true);
    });

    it('[TC-150.18/MSS] board_tile.tsx preserves exact RoundedBox geometry arguments for TC-P1.2 compatibility', () => {
      const source = fs.readFileSync(boardTilePath, 'utf-8');
      expect(source).toContain('<RoundedBox args={[2.2, 0.22, 2.2]} radius={0.08} smoothness={4}');
      expect(source).toContain('<RoundedBox args={[1.68, 0.2, 2.2]} radius={0.08} smoothness={4}');
    });
  });
});
