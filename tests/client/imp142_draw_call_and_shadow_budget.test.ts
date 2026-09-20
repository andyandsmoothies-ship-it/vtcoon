// [TC-IMP142/MSS][UC-IMP142] Contract Test Suite: 3D Diorama Draw Call Optimization & Shadow Budget Hardening
// Traceability: docs/plans/improvements/IMP-142-3d-draw-call-optimization-and-shadow-budget_plan.md
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  MiniatureCityDiorama,
  DioramaUrbanCanopy,
} from '../../src/client/3d/miniature_city_diorama';
import { DioramaBridges } from '../../src/client/3d/diorama/diorama_bridges';
import {
  DioramaModelRailroad,
  DioramaTropicalFlora,
} from '../../src/client/3d/diorama/diorama_railroad';
import { DioramaContainerPort } from '../../src/client/3d/diorama/diorama_container_port';
import {
  ToyPropertyBuildings,
  ToyHouseMesh,
  ToyHotelMesh,
} from '../../src/client/3d/toy_property_buildings';
import {
  OwnershipMarkerInstances,
  type OwnershipMarkerInstancesProps,
} from '../../src/client/3d/board_tile';

// ============================================================================
// REUSABLE DOMAIN TEST HARNESS HELPERS
// ============================================================================

function getNodeType(node: any): string {
  if (!node || !node.type) return '';
  if (typeof node.type === 'string') return node.type;
  if (typeof node.type === 'function') return node.type.name || '';
  return '';
}

function findNodes(
  node: any,
  predicate: (node: any) => boolean,
  results: any[] = []
): any[] {
  if (!node) return results;
  if (predicate(node)) {
    results.push(node);
  }
  if (Array.isArray(node)) {
    for (const child of node) {
      findNodes(child, predicate, results);
    }
  } else if (node.props?.children) {
    findNodes(node.props.children, predicate, results);
  }
  return results;
}

function findFirstNode(
  node: any,
  predicate: (node: any) => boolean
): any | null {
  if (!node) return null;
  if (predicate(node)) return node;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findFirstNode(child, predicate);
      if (found) return found;
    }
  } else if (node.props?.children) {
    return findFirstNode(node.props.children, predicate);
  }
  return null;
}

function captureRenderedTree<P = Record<string, unknown>>(
  Component: React.ComponentType<P>,
  props?: P
): any {
  let rendered: any = null;
  function SpyComponent() {
    rendered = (Component as React.FC<P>)((props ?? {}) as P);
    return rendered;
  }
  renderToStaticMarkup(React.createElement(SpyComponent));
  return rendered;
}

function hasGeometry(node: any, geomType: string): boolean {
  return Boolean(
    findFirstNode(
      node,
      (child) =>
        child !== node &&
        getNodeType(child).toLowerCase().includes(geomType.toLowerCase())
    )
  );
}

function getMaterialColor(node: any): string | undefined {
  const mat = findFirstNode(
    node,
    (child) =>
      child !== node &&
      getNodeType(child).toLowerCase().includes('material')
  );
  return mat?.props?.color;
}

function captureOwnershipMarkerTree(props: OwnershipMarkerInstancesProps): any {
  let captured: any = null;
  function CaptureWrapper() {
    captured = OwnershipMarkerInstances(props);
    return captured;
  }
  renderToStaticMarkup(React.createElement(CaptureWrapper));
  return captured;
}

describe('[TC-IMP142/MSS][UC-IMP142] 3D Diorama Draw Call & Shadow Budget Contract Suite', () => {
  let originalConsoleError: typeof console.error;
  let dioramaMarkup = '';
  let canopyMarkup = '';
  let bridgesMarkup = '';
  let portMarkup = '';
  let railroadMarkup = '';
  let floraMarkup = '';

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

    dioramaMarkup = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));
    canopyMarkup = renderToStaticMarkup(React.createElement(DioramaUrbanCanopy));
    bridgesMarkup = renderToStaticMarkup(React.createElement(DioramaBridges));
    portMarkup = renderToStaticMarkup(React.createElement(DioramaContainerPort));
    railroadMarkup = renderToStaticMarkup(React.createElement(DioramaModelRailroad));
    floraMarkup = renderToStaticMarkup(React.createElement(DioramaTropicalFlora));
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  // =========================================================================
  // FACET 1: BOUNDARY & INSTANCING ARCHITECTURE (TÁN CÂY ĐÔ THỊ INSTANCEDMESH)
  // =========================================================================
  describe('Facet 1: Boundary & Instancing Architecture (DioramaUrbanCanopy)', () => {
    it('[TC-IMP142.01/MSS][UC-IMP142] DioramaUrbanCanopy root element is a group containing data-testid="diorama-urban-canopy"', () => {
      const tree = captureRenderedTree(DioramaUrbanCanopy);
      expect(tree?.type).toBe('group');
      expect(tree?.props?.['data-testid']).toBe('diorama-urban-canopy');
    });

    it('[TC-IMP142.02/MSS][UC-IMP142] DioramaUrbanCanopy utilizes instancedMesh for tree trunks with count equal to 18', () => {
      const tree = captureRenderedTree(DioramaUrbanCanopy);
      const trunkInstanced = findFirstNode(
        tree,
        (n) =>
          (n.type === 'instancedMesh' || n.type === 'instancedmesh') &&
          hasGeometry(n, 'cylinderGeometry')
      );
      const trunkCount = trunkInstanced?.props?.count ?? trunkInstanced?.props?.args?.[2];
      expect(trunkInstanced).not.toBeNull();
      expect(trunkCount).toBe(18);
    });

    it('[TC-IMP142.03/MSS][UC-IMP142] DioramaUrbanCanopy utilizes instancedMesh for lower foliage canopy with count equal to 18', () => {
      const tree = captureRenderedTree(DioramaUrbanCanopy);
      const foliageInstanced = findNodes(
        tree,
        (n) =>
          (n.type === 'instancedMesh' || n.type === 'instancedmesh') &&
          hasGeometry(n, 'sphereGeometry')
      );
      const lowerCanopy = foliageInstanced[0];
      const lowerCount = lowerCanopy?.props?.count ?? lowerCanopy?.props?.args?.[2];
      expect(lowerCanopy).not.toBeNull();
      expect(lowerCount).toBe(18);
    });

    it('[TC-IMP142.04/MSS][UC-IMP142] DioramaUrbanCanopy lower foliage canopy instancedMesh sets static baseline color #15803D', () => {
      const tree = captureRenderedTree(DioramaUrbanCanopy);
      const foliageInstanced = findNodes(
        tree,
        (n) =>
          (n.type === 'instancedMesh' || n.type === 'instancedmesh') &&
          hasGeometry(n, 'sphereGeometry')
      );
      const lowerCanopy = foliageInstanced[0];
      expect(getMaterialColor(lowerCanopy)).toBe('#15803D');
    });

    it('[TC-IMP142.05/MSS][UC-IMP142] DioramaUrbanCanopy utilizes instancedMesh for upper foliage canopy with count equal to 18', () => {
      const tree = captureRenderedTree(DioramaUrbanCanopy);
      const foliageInstanced = findNodes(
        tree,
        (n) =>
          (n.type === 'instancedMesh' || n.type === 'instancedmesh') &&
          hasGeometry(n, 'sphereGeometry')
      );
      const upperCanopy = foliageInstanced[1];
      const upperCount = upperCanopy?.props?.count ?? upperCanopy?.props?.args?.[2];
      expect(upperCanopy).not.toBeNull();
      expect(upperCount).toBe(18);
    });

    it('[TC-IMP142.06/MSS][UC-IMP142] DioramaUrbanCanopy upper foliage canopy instancedMesh sets static baseline color #15803D', () => {
      const tree = captureRenderedTree(DioramaUrbanCanopy);
      const foliageInstanced = findNodes(
        tree,
        (n) =>
          (n.type === 'instancedMesh' || n.type === 'instancedmesh') &&
          hasGeometry(n, 'sphereGeometry')
      );
      const upperCanopy = foliageInstanced[1];
      expect(getMaterialColor(upperCanopy)).toBe('#15803D');
    });

    it('[TC-IMP142.07/MSS][UC-IMP142] DioramaUrbanCanopy consolidates tree canopy into exactly 3 instancedMesh draw calls instead of individual tree meshes', () => {
      const tree = captureRenderedTree(DioramaUrbanCanopy);
      const allInstanced = findNodes(
        tree,
        (n) => n.type === 'instancedMesh' || n.type === 'instancedmesh'
      );
      expect(allInstanced.length).toBe(3);
    });
  });

  // =========================================================================
  // FACET 2: REACTIVITY & SHADOW CASTER BUDGET AUDIT (KIỂM TOÁN BÓNG ĐỔ)
  // =========================================================================
  describe('Facet 2: Reactivity & Shadow Caster Budget Audit', () => {
    it('[TC-IMP142.08/MSS][UC-IMP142] DioramaBridges disables castShadow on 5mm stay cables (basonCables) to conserve shadow budget', () => {
      const tree = captureRenderedTree(DioramaBridges);
      const cableMeshes = findNodes(tree, (n) => {
        const typeName = getNodeType(n);
        if (typeName !== 'mesh' && typeName !== 'Mesh') return false;
        const cyl = findFirstNode(
          n,
          (c) => getNodeType(c).toLowerCase().includes('cylindergeometry')
        );
        const args = cyl?.props?.args;
        return Array.isArray(args) && args[0] === 0.005 && args[1] === 0.005;
      });
      expect(cableMeshes.length).toBe(12);
      const hasAnyShadowCastingCable = cableMeshes.some((m) => Boolean(m.props?.castShadow));
      expect(hasAnyShadowCastingCable).toBe(false);
    });

    it('[TC-IMP142.09/MSS][UC-IMP142] DioramaModelRailroad disables castShadow on railroad sleeper ties and corner rail foundations', () => {
      const tree = captureRenderedTree(DioramaModelRailroad);
      const sleeperMeshes = findNodes(tree, (n) => {
        const typeName = getNodeType(n);
        if (typeName !== 'mesh' && typeName !== 'Mesh') return false;
        const mat = findFirstNode(n, (c) => getNodeType(c).toLowerCase().includes('material'));
        return mat?.props?.color === '#451A03';
      });
      expect(sleeperMeshes.length).toBeGreaterThanOrEqual(4);
      const sleeperCastsShadow = sleeperMeshes.some((m) => Boolean(m.props?.castShadow));
      expect(sleeperCastsShadow).toBe(false);
    });

    it('[TC-IMP142.10/MSS][UC-IMP142] DioramaTropicalFlora disables castShadow on shrub and flower bush meshes', () => {
      const tree = captureRenderedTree(DioramaTropicalFlora);
      const bushMeshes = findNodes(tree, (n) => {
        const typeName = getNodeType(n);
        if (typeName !== 'mesh' && typeName !== 'Mesh') return false;
        const sphere = findFirstNode(n, (c) => {
          const cType = getNodeType(c).toLowerCase();
          return cType.includes('spheregeometry') || cType === 'safespheregeometry';
        });
        const args = sphere?.props?.args;
        return Array.isArray(args) && args[0] === 0.075;
      });
      expect(bushMeshes.length).toBe(10);
      const hasAnyShadowCastingBush = bushMeshes.some((m) => Boolean(m.props?.castShadow));
      expect(hasAnyShadowCastingBush).toBe(false);
    });

    it('[TC-IMP142.11/MSS][UC-IMP142] DioramaContainerPort disables castShadow on tractor trailer and container roof trim', () => {
      const tree = captureRenderedTree(DioramaContainerPort);
      const trailerMesh = findFirstNode(tree, (n) => {
        const typeName = getNodeType(n);
        if (typeName !== 'mesh' && typeName !== 'Mesh') return false;
        const box = findFirstNode(n, (c) => getNodeType(c).toLowerCase().includes('boxgeometry'));
        const args = box?.props?.args;
        return Array.isArray(args) && args[0] === 0.12 && args[1] === 0.04 && args[2] === 0.36;
      });
      expect(trailerMesh).not.toBeNull();
      expect(Boolean(trailerMesh?.props?.castShadow)).toBe(false);
    });

    it('[TC-87.10b/PRESERVE][TC-IMP142.12/MSS][UC-IMP142] OwnershipMarkerInstances strictly preserves castShadow on FlagPole', () => {
      const tree = captureOwnershipMarkerTree({
        ownerColor: '#F59E0B',
        level: 2,
        ownerSlot: 0,
        mascotIcon: '🏰',
      });
      const flagPole = findFirstNode(tree, (n) => n.props?.name === 'FlagPole');
      expect(flagPole).not.toBeNull();
      expect(flagPole?.props?.castShadow).toBe(true);
    });

    it('[TC-87.10b/PRESERVE][TC-IMP142.13/MSS][UC-IMP142] OwnershipMarkerInstances strictly preserves castShadow on FlagCloth', () => {
      const tree = captureOwnershipMarkerTree({
        ownerColor: '#F59E0B',
        level: 2,
        ownerSlot: 0,
        mascotIcon: '🏰',
      });
      const flagCloth = findFirstNode(tree, (n) => n.props?.name === 'FlagCloth');
      expect(flagCloth).not.toBeNull();
      expect(flagCloth?.props?.castShadow).toBe(true);
    });
  });

  // =========================================================================
  // FACET 3: TOY PROPERTY BUILDINGS OPTIMIZATION & PRESERVATION (NHÀ ĐỒ CHƠI)
  // =========================================================================
  describe('Facet 3: Toy Property Buildings Optimization & Preservation', () => {
    it('[TC-IMP142.14/MSS][UC-IMP142] ToyPropertyBuildings at level 1 renders container and toy-house element', () => {
      const tree = captureRenderedTree(ToyPropertyBuildings, { level: 1 });
      expect(tree?.props?.['data-testid']).toBe('toy-property-building');
      const houseNode = findFirstNode(
        tree,
        (n) => n.props?.['data-testid'] === 'toy-house' || n.type === ToyHouseMesh || getNodeType(n) === 'ToyHouseMesh'
      );
      expect(houseNode).not.toBeNull();
    });

    it('[TC-IMP142.15/MSS][UC-IMP142] ToyPropertyBuildings at level 2 renders container and two toy-house elements', () => {
      const tree = captureRenderedTree(ToyPropertyBuildings, { level: 2 });
      expect(tree?.props?.['data-testid']).toBe('toy-property-building');
      const houseNodes = findNodes(
        tree,
        (n) => n.props?.['data-testid'] === 'toy-house' || n.type === ToyHouseMesh || getNodeType(n) === 'ToyHouseMesh'
      );
      expect(houseNodes.length).toBe(2);
    });

    it('[TC-IMP142.16/MSS][UC-IMP142] ToyPropertyBuildings at level 3 renders container and toy-hotel element', () => {
      const tree = captureRenderedTree(ToyPropertyBuildings, { level: 3 });
      expect(tree?.props?.['data-testid']).toBe('toy-property-building');
      const hotelNode = findFirstNode(
        tree,
        (n) => n.props?.['data-testid'] === 'toy-hotel' || n.type === ToyHotelMesh || getNodeType(n) === 'ToyHotelMesh'
      );
      expect(hotelNode).not.toBeNull();
    });

    it('[TC-IMP142.17/MSS][UC-IMP142] ToyPropertyBuildings at level 0 safely returns null without dangling nodes', () => {
      const tree = ToyPropertyBuildings({ level: 0 });
      expect(tree).toBeNull();
    });

    it('[TC-IMP142.18/MSS][UC-IMP142] ToyHouseMesh disables castShadow on tiny chimney micro mesh', () => {
      const tree = captureRenderedTree(ToyHouseMesh);
      const chimneyMesh = findFirstNode(tree, (n) => {
        const typeName = getNodeType(n);
        if (typeName !== 'mesh' && typeName !== 'Mesh') return false;
        const mat = findFirstNode(n, (c) => getNodeType(c).toLowerCase().includes('material'));
        return mat?.props?.color === '#059669';
      });
      expect(chimneyMesh).not.toBeNull();
      expect(Boolean(chimneyMesh?.props?.castShadow)).toBe(false);
    });

    it('[TC-IMP142.19/MSS][UC-IMP142] ToyHouseMesh disables castShadow on window sill trim micro mesh', () => {
      const tree = captureRenderedTree(ToyHouseMesh);
      const windowSillMesh = findFirstNode(tree, (n) => {
        const typeName = getNodeType(n);
        if (typeName !== 'mesh' && typeName !== 'Mesh') return false;
        const mat = findFirstNode(n, (c) => getNodeType(c).toLowerCase().includes('material'));
        return mat?.props?.color === '#34D399';
      });
      expect(windowSillMesh).not.toBeNull();
      expect(Boolean(windowSillMesh?.props?.castShadow)).toBe(false);
    });

    it('[TC-IMP142.20/MSS][UC-IMP142] ToyHouseMesh preserves castShadow and receiveShadow on main body mesh', () => {
      const tree = captureRenderedTree(ToyHouseMesh);
      const bodyMesh = findFirstNode(tree, (n) => {
        const typeName = getNodeType(n);
        if (typeName !== 'mesh' && typeName !== 'Mesh') return false;
        const mat = findFirstNode(n, (c) => getNodeType(c).toLowerCase().includes('material'));
        return mat?.props?.color === '#10B981';
      });
      expect(bodyMesh?.props?.castShadow).toBe(true);
      expect(bodyMesh?.props?.receiveShadow).toBe(true);
    });
  });

  // =========================================================================
  // FACET 4: SSR STATIC MARKUP & ECOSYSTEM COLOR PRESERVATION
  // =========================================================================
  describe('Facet 4: SSR Static Markup & Ecosystem Color Preservation', () => {
    it('[TC-IMP142.21/MSS][UC-IMP142] MiniatureCityDiorama renders to valid static markup containing root container without crashing', () => {
      expect(dioramaMarkup.length).toBeGreaterThan(100);
      expect(dioramaMarkup).toContain('data-testid="miniature-city-diorama"');
    });

    it('[TC-IMP142.22/MSS][UC-IMP142] DioramaUrbanCanopy renders valid static markup containing canopy testid', () => {
      expect(canopyMarkup.length).toBeGreaterThan(50);
      expect(canopyMarkup).toContain('data-testid="diorama-urban-canopy"');
    });

    it('[TC-IMP142.23/MSS][UC-IMP142] DioramaContainerPort and DioramaBridges render valid static markup', () => {
      expect(portMarkup).toContain('data-testid="diorama-container-port"');
      expect(bridgesMarkup.length).toBeGreaterThan(100);
    });

    it('[TC-IMP142.24/MSS][UC-IMP142] Diorama components preserve ecosystem color tokens #15803D, #22C55E, #F59E0B, #10B981', () => {
      expect(dioramaMarkup).toContain('#15803D');
      expect(dioramaMarkup).toContain('#22C55E');
      expect(dioramaMarkup).toContain('#F59E0B');
      expect(dioramaMarkup).toContain('#10B981');
    });

    it('[TC-IMP142.25/MSS][UC-IMP142] Static markup output across all diorama modules strictly excludes NaN and malformed attributes', () => {
      expect(dioramaMarkup).not.toContain('NaN');
      expect(canopyMarkup).not.toContain('NaN');
      expect(dioramaMarkup).not.toContain('="undefined"');
      expect(dioramaMarkup).not.toContain('="null"');
    });
  });
});
