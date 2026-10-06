// [CONTRACT TEST] IMP-283: Mobile 3D Dynamic LOD & Performance Throttling Suite
// Traceability Tags: [TC-283.01/MSS..TC-283.08/MSS] & [UC-IMP283]
// Scope: Verification of dynamic LOD throttling and geometry culling on mobile devices
// Negative Constraints: Zero dirty casts, 1-4 asserts per test, zero loops in it(), living test <= 600 LOC

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  perfBudget,
  LODLevel,
} from '../../src/client/3d/perf_budget';
import {
  DioramaPedestrianPromenades,
  DioramaUrbanCanopy,
  MiniatureCityDiorama,
  DioramaTropicalFlora,
} from '../../src/client/3d/miniature_city_diorama';

// Type-safe forward compatibility interfaces for Station 1 RED testing without dirty casts
interface MobileAwarePerfBudget {
  calculateAdaptiveLOD(averageFps?: number, isMobile?: boolean): LODLevel;
}

const mobilePerfBudget: MobileAwarePerfBudget = perfBudget;

type PedestrianPromenadesComponent = (props?: { readonly isMobile?: boolean }) => React.ReactElement;
const PedestrianPromenades: PedestrianPromenadesComponent = DioramaPedestrianPromenades;

type UrbanCanopyComponent = (props?: { readonly isMobile?: boolean }) => React.ReactElement;
const UrbanCanopy: UrbanCanopyComponent = DioramaUrbanCanopy;

// VDOM Traversal and Tree Inspection Helpers (Zero Dirty Casts)
function isElementWithProps(
  node: unknown
): node is React.ReactElement<Record<string, unknown>> {
  return React.isValidElement(node) && typeof node.props === 'object' && node.props !== null;
}

function findNodesInVdom(
  node: unknown,
  predicate: (element: React.ReactElement<Record<string, unknown>>) => boolean,
  accum: React.ReactElement<Record<string, unknown>>[] = []
): React.ReactElement<Record<string, unknown>>[] {
  if (isElementWithProps(node)) {
    if (predicate(node)) {
      accum.push(node);
    }
    const children = node.props.children;
    if (Array.isArray(children)) {
      for (let i = 0; i < children.length; i++) {
        findNodesInVdom(children[i], predicate, accum);
      }
    } else if (children) {
      findNodesInVdom(children, predicate, accum);
    }
  } else if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      findNodesInVdom(node[i], predicate, accum);
    }
  }
  return accum;
}

function hasIdentifier(
  element: React.ReactElement<Record<string, unknown>>,
  identifier: string
): boolean {
  if (typeof element.key === 'string' && element.key.includes(identifier)) {
    return true;
  }
  const testId = element.props['data-testid'];
  if (typeof testId === 'string' && testId.includes(identifier)) {
    return true;
  }
  return false;
}

function captureRenderedTree<P extends Record<string, unknown>>(
  Component: (props: P) => React.ReactElement | null,
  props: P
): React.ReactElement | null {
  let renderedTree: React.ReactElement | null = null;
  function TreeSpy() {
    renderedTree = Component(props);
    return renderedTree;
  }
  renderToStaticMarkup(React.createElement(TreeSpy));
  return renderedTree;
}

describe('[CONTRACT] IMP-283: Mobile 3D Dynamic LOD & Performance Throttling Suite', () => {
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

  // ===========================================================================
  // FACET 1: Mobile LOD Calculation & Throttling Ceiling
  // ===========================================================================
  it('[TC-283.01/MSS][UC-IMP283] calculateAdaptiveLOD(58, true) trả về LODLevel.MEDIUM trên môi trường mobile', () => {
    const lod = mobilePerfBudget.calculateAdaptiveLOD(58, true);
    expect(lod).toBe(LODLevel.MEDIUM);
  });

  it('[TC-283.02/MSS][UC-IMP283] calculateAdaptiveLOD(35, true) và calculateAdaptiveLOD(45, true) trả về LODLevel.LOW khi FPS dưới 50 trên mobile', () => {
    const lod35 = mobilePerfBudget.calculateAdaptiveLOD(35, true);
    expect(lod35).toBe(LODLevel.LOW);

    const lod45 = mobilePerfBudget.calculateAdaptiveLOD(45, true);
    expect(lod45).toBe(LODLevel.LOW);
  });

  it('[TC-283.03/MSS][UC-IMP283] calculateAdaptiveLOD(58, false) bảo toàn LODLevel.HIGH trên môi trường desktop', () => {
    const lod58 = mobilePerfBudget.calculateAdaptiveLOD(58, false);
    expect(lod58).toBe(LODLevel.HIGH);
  });

  // ===========================================================================
  // FACET 2: Micro-Geometry Culling on Pedestrian Promenades
  // ===========================================================================
  it('[TC-283.04/MSS][UC-IMP283] DioramaPedestrianPromenades({ isMobile: true }) loại bỏ hoàn toàn bồn hoa (park-planter) và ghế đá (promenade-bench)', () => {
    const treeMobile = captureRenderedTree(PedestrianPromenades, { isMobile: true });
    const planters = findNodesInVdom(treeMobile, (el) => hasIdentifier(el, 'park-planter'));
    const benches = findNodesInVdom(treeMobile, (el) => hasIdentifier(el, 'promenade-bench'));

    expect(planters.length).toBe(0);
    expect(benches.length).toBe(0);
  });

  it('[TC-283.05/MSS][UC-IMP283] DioramaPedestrianPromenades({ isMobile: false }) bảo toàn đầy đủ bồn hoa và ghế đá cho môi trường desktop', () => {
    const treeDesktop = captureRenderedTree(PedestrianPromenades, { isMobile: false });
    const planters = findNodesInVdom(treeDesktop, (el) => hasIdentifier(el, 'park-planter'));
    const benches = findNodesInVdom(treeDesktop, (el) => hasIdentifier(el, 'promenade-bench'));

    expect(planters.length).toBe(2);
    expect(benches.length).toBe(3);
  });

  // ===========================================================================
  // FACET 3: Shadow Map Pass Reduction on Urban Canopy
  // ===========================================================================
  it('[TC-283.06/MSS][UC-IMP283] DioramaUrbanCanopy({ isMobile: true }) vô hiệu hóa castShadow={false} trên toàn bộ các instancedMesh tán cây', () => {
    const treeMobile = captureRenderedTree(UrbanCanopy, { isMobile: true });
    const instancedMeshes = findNodesInVdom(treeMobile, (el) => el.type === 'instancedMesh');

    expect(instancedMeshes.length).toBe(3);
    expect(instancedMeshes.every((node) => node.props.castShadow === false)).toBe(true);
  });

  // ===========================================================================
  // FACET 4: Diorama Sub-component Culling on Tabletop Root
  // ===========================================================================
  it('[TC-283.07/MSS][UC-IMP283] MiniatureCityDiorama({ isMobile: true }) không render DioramaTropicalFlora', () => {
    const treeMobile = captureRenderedTree(MiniatureCityDiorama, { isMobile: true });
    const floraNodes = findNodesInVdom(treeMobile, (el) => el.type === DioramaTropicalFlora);

    expect(floraNodes.length).toBe(0);
  });

  it('[TC-283.08/MSS][UC-IMP283] MiniatureCityDiorama({ isMobile: false }) render đầy đủ DioramaTropicalFlora trên desktop', () => {
    const treeDesktop = captureRenderedTree(MiniatureCityDiorama, { isMobile: false });
    const floraNodes = findNodesInVdom(treeDesktop, (el) => el.type === DioramaTropicalFlora);

    expect(floraNodes.length).toBe(1);
    expect(floraNodes[0]?.type).toBe(DioramaTropicalFlora);
  });
});
