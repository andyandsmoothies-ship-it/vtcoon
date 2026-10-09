// [CONTRACT TEST] IMP-337: Mobile WebKit 3D Performance & Thermal Hardening
// Subsystem: Client 3D Miniature Diorama Subsystems (Slice 2: Autonomous SSOT Mobile Freezing)
// Traceability Tags: [TC-337.01/MSS..TC-337.20/A2] & [UC-PORT, UC-MARINA, UC-BIRDS, UC-CITY]
// Negative Constraints: Zero dirty casts, 1-4 asserts per test, zero loops in it(), living test <= 600 LOC

import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { DioramaContainerPort } from '../../src/client/3d/diorama/diorama_container_port';
import {
  DioramaMarina,
  calculateBeaconIntensity,
} from '../../src/client/3d/diorama/diorama_marina';
import {
  DioramaPerchingBirds,
  PERCH_SPOTS,
} from '../../src/client/3d/diorama/diorama_perching_birds';
import { MiniatureCityDiorama } from '../../src/client/3d/miniature_city_diorama';
import {
  useEnvironmentStore,
  type EnvironmentState,
  type TimeOfDayPhase,
} from '../../src/client/store/environment_store';

let currentPhase: TimeOfDayPhase = 'day';

vi.mock('../../src/client/store/environment_store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/client/store/environment_store')>();
  const useMockStore = <T>(selector: (s: EnvironmentState) => T): T => {
    const state: EnvironmentState = {
      ...actual.useEnvironmentStore.getState(),
      phase: currentPhase,
      mode: currentPhase === 'day' ? 'day' : currentPhase === 'night' ? 'night' : 'sunset',
    };
    return selector(state);
  };
  Object.assign(useMockStore, actual.useEnvironmentStore, {
    getState: (): EnvironmentState => ({
      ...actual.useEnvironmentStore.getState(),
      phase: currentPhase,
    }),
    setState: (partial: Partial<EnvironmentState>): void => {
      if (partial.phase) {
        currentPhase = partial.phase;
      }
    },
  });
  return {
    ...actual,
    useEnvironmentStore: useMockStore,
  };
});

// =============================================================================
// Type-safe VDOM Traversal and Tree Inspection Helpers (Zero Dirty Casts)
// =============================================================================

interface ElementWithProps extends React.ReactElement {
  readonly props: Record<string, unknown> & {
    readonly children?: unknown;
    readonly 'data-testid'?: string;
    readonly position?: readonly [number, number, number];
    readonly rotation?: readonly [number, number, number];
    readonly visible?: boolean;
    readonly intensity?: number;
    readonly isMobile?: boolean;
    readonly onPointerDown?: (e: unknown) => void;
  };
}

function isElementWithProps(node: unknown): node is ElementWithProps {
  return React.isValidElement(node) && typeof node.props === 'object' && node.props !== null;
}

function findNodesInVdom(
  node: unknown,
  predicate: (element: ElementWithProps) => boolean,
  accum: ElementWithProps[] = []
): ElementWithProps[] {
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
  }
  return accum;
}

function captureRenderedTree<P extends Record<string, unknown>>(
  Component: (props: P) => React.ReactElement | null,
  props: P
): ElementWithProps | null {
  let renderedTree: React.ReactElement | null = null;
  function TreeSpy() {
    renderedTree = Component(props);
    return renderedTree;
  }
  renderToStaticMarkup(React.createElement(TreeSpy));
  return isElementWithProps(renderedTree) ? renderedTree : null;
}

// =============================================================================
// FACET 1: DioramaContainerPort Mobile Freezing & Declarative Strobe Gating
// =============================================================================

describe('IMP-337 Facet 1: DioramaContainerPort Mobile Thermal Hardening', () => {
  beforeEach(() => {
    currentPhase = 'day';
  });

  it('[TC-337.01/MSS][UC-PORT/MSS] DioramaContainerPort nhận isMobile={true} kết xuất an toàn không ném ngoại lệ', () => {
    const tree = captureRenderedTree(DioramaContainerPort, { isMobile: true });
    expect(tree).not.toBeNull();
    expect(tree?.props['data-testid']).toBe('diorama-container-port');
  });

  it('[TC-337.02/A1][UC-PORT/A1] DioramaContainerPort trên mobile ẩn đèn chớp đỏ tĩnh không giữa ban ngày (visible={false})', () => {
    currentPhase = 'day';
    const tree = captureRenderedTree(DioramaContainerPort, { isMobile: true });
    const strobeMeshes = findNodesInVdom(tree, (el) => {
      const isRedStrobe = findNodesInVdom(el, (child) => child.props.color === '#EF4444').length > 0;
      return el.type === 'mesh' && isRedStrobe;
    });

    expect(strobeMeshes.length).toBe(2);
    expect(strobeMeshes[0]?.props.visible).toBe(false);
    expect(strobeMeshes[1]?.props.visible).toBe(false);
  });

  it('[TC-337.03/A2][UC-PORT/A2] DioramaContainerPort trên mobile kích hoạt đèn chớp tĩnh không ban đêm (visible={true})', () => {
    currentPhase = 'night';
    const tree = captureRenderedTree(DioramaContainerPort, { isMobile: true });
    const strobeMeshes = findNodesInVdom(tree, (el) => {
      const isRedStrobe = findNodesInVdom(el, (child) => child.props.color === '#EF4444').length > 0;
      return el.type === 'mesh' && isRedStrobe;
    });

    expect(strobeMeshes.length).toBe(2);
    expect(strobeMeshes[0]?.props.visible).toBe(true);
    expect(strobeMeshes[1]?.props.visible).toBe(true);
  });

  it('[TC-337.04/A3][UC-PORT/A3] DioramaContainerPort trên desktop kết xuất cấu trúc dầm cẩu và container xếp tầng đầy đủ', () => {
    const tree = captureRenderedTree(DioramaContainerPort, { isMobile: false });
    const gantryGroups = findNodesInVdom(tree, (el) => Array.isArray(el.props.children));
    expect(gantryGroups.length).toBeGreaterThanOrEqual(5);
  });

  it('[TC-337.05/A4][UC-PORT/A4] DioramaContainerPort gọi không tham số bảo toàn định danh hợp đồng SSR', () => {
    const tree = captureRenderedTree(DioramaContainerPort, {});
    expect(tree?.props['data-testid']).toBe('diorama-container-port');
  });
});

// =============================================================================
// FACET 2: DioramaMarina PointLight Attenuation & Beacon Cone Culling
// =============================================================================

describe('IMP-337 Facet 2: DioramaMarina PointLight Freezing & Shader Protection', () => {
  beforeEach(() => {
    currentPhase = 'night';
  });

  it('[TC-337.06/MSS][UC-MARINA/MSS] DioramaMarina trên mobile triệt tiêu cường độ pointLight (intensity=0) chống tốn GPU fragment shading', () => {
    useEnvironmentStore.setState({ phase: 'night' });
    const tree = captureRenderedTree(DioramaMarina, { isMobile: true });
    const pointLights = findNodesInVdom(tree, (el) => el.type === 'pointLight');

    expect(pointLights.length).toBe(1);
    expect(pointLights[0]?.props.intensity).toBe(0);
  });

  it('[TC-337.07/A1][UC-MARINA/A1] DioramaMarina trên mobile ẩn chóp nón quét sáng (visible={false}) tránh thanh sáng bất động', () => {
    useEnvironmentStore.setState({ phase: 'night' });
    const tree = captureRenderedTree(DioramaMarina, { isMobile: true });
    const beaconConeMeshes = findNodesInVdom(tree, (el) => {
      return el.type === 'mesh' && findNodesInVdom(el, (c) => c.type === 'coneGeometry').length > 0;
    });

    const sweepingCone = beaconConeMeshes.find((m) => m.props.visible === false);
    expect(sweepingCone).toBeDefined();
    expect(sweepingCone?.props.visible).toBe(false);
  });

  it('[TC-337.08/A2][UC-MARINA/A2] DioramaMarina trên desktop hiển thị tia sáng quét ban đêm (visible={true})', () => {
    useEnvironmentStore.setState({ phase: 'night' });
    const tree = captureRenderedTree(DioramaMarina, { isMobile: false });
    const sweepingCone = findNodesInVdom(tree, (el) => {
      return el.type === 'mesh' && findNodesInVdom(el, (c) => c.type === 'coneGeometry').length > 0 && el.props.visible === true;
    });

    expect(sweepingCone.length).toBeGreaterThanOrEqual(1);
  });

  it('[TC-337.09/A3][UC-MARINA/A3] DioramaMarina trên desktop duy trì cường độ pointLight ban đêm lớn hơn 0', () => {
    useEnvironmentStore.setState({ phase: 'night' });
    const tree = captureRenderedTree(DioramaMarina, { isMobile: false });
    const pointLights = findNodesInVdom(tree, (el) => el.type === 'pointLight');

    expect(pointLights.length).toBe(1);
    expect(pointLights[0]?.props.intensity).toBe(calculateBeaconIntensity('night'));
  });

  it('[TC-337.10/A4][UC-MARINA/A4] DioramaMarina chuyển tiếp cờ isMobile={true} xuống phần tử DioramaPerchingBirds', () => {
    const tree = captureRenderedTree(DioramaMarina, { isMobile: true });
    const birdsNodes = findNodesInVdom(tree, (el) => el.type === DioramaPerchingBirds);

    expect(birdsNodes.length).toBe(1);
    expect(birdsNodes[0]?.props.isMobile).toBe(true);
  });

  it('[TC-337.11/A5][UC-MARINA/A5] DioramaMarina bảo toàn định danh heritage-lighthouse và còi hải đăng', () => {
    const tree = captureRenderedTree(DioramaMarina, {});
    const lighthouseNodes = findNodesInVdom(tree, (el) => el.props['data-testid'] === 'heritage-lighthouse');

    expect(lighthouseNodes.length).toBe(1);
    expect(typeof lighthouseNodes[0]?.props.onPointerDown).toBe('function');
  });
});

// =============================================================================
// FACET 3: DioramaPerchingBirds Resting Transforms & Anti-Reconciliation Snap
// =============================================================================

describe('IMP-337 Facet 3: DioramaPerchingBirds Resting Coordinate Freezing', () => {
  it('[TC-337.12/MSS][UC-BIRDS/MSS] DioramaPerchingBirds trên mobile khai báo vị trí tĩnh position khớp PERCH_SPOTS', () => {
    const tree = captureRenderedTree(DioramaPerchingBirds, { isMobile: true });
    const birdGroups = findNodesInVdom(tree, (el) => Array.isArray(el.props.scale) && el.props.scale[0] === 0.22);

    expect(birdGroups.length).toBe(3);
    expect(birdGroups[0]?.props.position).toEqual([PERCH_SPOTS[0]?.x, PERCH_SPOTS[0]?.y, PERCH_SPOTS[0]?.z]);
  });

  it('[TC-337.13/A1][UC-BIRDS/A1] DioramaPerchingBirds trên mobile khai báo góc quay tĩnh rotation khớp baseRotY', () => {
    const tree = captureRenderedTree(DioramaPerchingBirds, { isMobile: true });
    const birdGroups = findNodesInVdom(tree, (el) => Array.isArray(el.props.scale) && el.props.scale[0] === 0.22);

    expect(birdGroups.length).toBe(3);
    expect(birdGroups[0]?.props.rotation).toEqual([0, PERCH_SPOTS[0]?.baseRotY, 0]);
  });

  it('[TC-337.14/A2][UC-BIRDS/A2] DioramaPerchingBirds trên desktop không gán position trong JSX tránh R3F reconciler snap', () => {
    const tree = captureRenderedTree(DioramaPerchingBirds, { isMobile: false });
    const birdGroups = findNodesInVdom(tree, (el) => Array.isArray(el.props.scale) && el.props.scale[0] === 0.22);

    expect(birdGroups.length).toBe(3);
    expect(birdGroups[0]?.props.position).toBeUndefined();
  });

  it('[TC-337.15/A3][UC-BIRDS/A3] DioramaPerchingBirds trên mobile ngăn chặn sự kiện chạm (handlePointerDown) giữ nguyên FSM', () => {
    const tree = captureRenderedTree(DioramaPerchingBirds, { isMobile: true });
    let propagationStopped = false;
    const mockEvent = {
      stopPropagation: () => {
        propagationStopped = true;
      },
    };

    tree?.props.onPointerDown?.(mockEvent);
    expect(propagationStopped).toBe(false);
  });

  it('[TC-337.16/A4][UC-BIRDS/A4] DioramaPerchingBirds trên desktop xử lý tương tác chạm bình thường', () => {
    const tree = captureRenderedTree(DioramaPerchingBirds, { isMobile: false });
    let propagationStopped = false;
    const mockEvent = {
      stopPropagation: () => {
        propagationStopped = true;
      },
    };

    tree?.props.onPointerDown?.(mockEvent);
    expect(propagationStopped).toBe(true);
  });

  it('[TC-337.17/A5][UC-BIRDS/A5] DioramaPerchingBirds bảo toàn định danh data-testid diorama-perching-birds', () => {
    const tree = captureRenderedTree(DioramaPerchingBirds, {});
    expect(tree?.props['data-testid']).toBe('diorama-perching-birds');
  });
});

// =============================================================================
// FACET 4: MiniatureCityDiorama Prop Resolution & Downstream Dispatching
// =============================================================================

describe('IMP-337 Facet 4: MiniatureCityDiorama Subsystem Dispatching & SSR Integrity', () => {
  it('[TC-337.18/MSS][UC-CITY/MSS] MiniatureCityDiorama không tham số tự động suy luận isMobile=false trong Node SSR', () => {
    const tree = captureRenderedTree(MiniatureCityDiorama, {});
    const portNodes = findNodesInVdom(tree, (el) => el.type === DioramaContainerPort);

    expect(portNodes.length).toBe(1);
    expect(portNodes[0]?.props.isMobile).toBe(false);
  });

  it('[TC-337.19/A1][UC-CITY/A1] MiniatureCityDiorama truyền isMobile={true} đồng bộ xuống DioramaContainerPort và DioramaMarina', () => {
    const tree = captureRenderedTree(MiniatureCityDiorama, { isMobile: true });
    const portNodes = findNodesInVdom(tree, (el) => el.type === DioramaContainerPort);
    const marinaNodes = findNodesInVdom(tree, (el) => el.type === DioramaMarina);

    expect(portNodes[0]?.props.isMobile).toBe(true);
    expect(marinaNodes[0]?.props.isMobile).toBe(true);
  });

  it('[TC-337.20/A2][UC-CITY/A2] MiniatureCityDiorama truyền isMobile={false} bảo toàn đầy đủ hoạt ảnh desktop', () => {
    const tree = captureRenderedTree(MiniatureCityDiorama, { isMobile: false });
    const portNodes = findNodesInVdom(tree, (el) => el.type === DioramaContainerPort);
    const marinaNodes = findNodesInVdom(tree, (el) => el.type === DioramaMarina);

    expect(portNodes[0]?.props.isMobile).toBe(false);
    expect(marinaNodes[0]?.props.isMobile).toBe(false);
  });
});
