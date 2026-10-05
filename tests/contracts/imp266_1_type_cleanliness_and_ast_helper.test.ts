// [TC-266.1/MSS][UC-IMP266.1] Global Type Cleanliness & React 19 AST Helper Contract Suite
// Verifies captureTree, findReactNode, findReactNodes, getNodeType, getNodeProps
// and ensures global object types are clean without prototype pollution.

import { describe, it, expect, vi } from 'vitest';
import React from 'react';

// Mock Drei components for headless AST inspection without WebGL context
vi.mock('@react-three/drei', () => ({
  ContactShadows: (props: { readonly frames?: number; [key: string]: unknown }) =>
    React.createElement('contact-shadows', props),
  OrbitControls: () => null,
  Environment: () => null,
}));

// Mock Fiber hooks and components
vi.mock('@react-three/fiber', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/fiber')>();
  return {
    ...actual,
    useFrame: () => {},
    useThree: () => ({
      camera: { position: { set: () => {} } },
      scene: {},
      gl: {
        info: { render: { calls: 0, triangles: 0 }, reset: () => {} },
      },
    }),
    Canvas: ({ children }: { readonly children?: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'r3f-canvas' }, children),
  };
});

import { CoastalPatrolBoat } from '../../src/client/3d/coastal_patrol_boat';
import { CoastalIslandEnvironment } from '../../src/client/3d/coastal_island_environment';
import { CoastalSeagulls } from '../../src/client/3d/coastal_seagulls';
import {
  captureTree,
  findReactNode,
  findReactNodes,
  getNodeProps,
  getNodeType,
} from '../helpers/threejs_test_utils';

describe('IMP-266.1: Global Type Cleanliness & Standalone React 19 AST Test Helper', () => {
  it('TC-266.1.01 [UC-IMP266.1/MSS]: captureTree renders component in static render phase without mounting real DOM', () => {
    const tree = captureTree(CoastalPatrolBoat, { isMobile: true });
    expect(tree).not.toBeNull();
    expect(tree?.type).toBe(CoastalPatrolBoat);
  });

  it('TC-266.1.02 [UC-IMP266.1/MSS]: findReactNode locates direct child matching predicate', () => {
    const tree = captureTree(CoastalPatrolBoat, { isMobile: true });
    const groupNode = findReactNode(tree, (n) => getNodeType(n) === 'group');
    expect(groupNode).not.toBeNull();
    expect(getNodeType(groupNode)).toBe('group');
  });

  it('TC-266.1.03 [UC-IMP266.1/MSS]: findReactNode recursively traverses nested components and Fragments', () => {
    const tree = captureTree(CoastalIslandEnvironment, { isMobile: true });
    const patrolBoatNode = findReactNode(tree, (n) => n.type === CoastalPatrolBoat);
    expect(patrolBoatNode).not.toBeNull();
    expect(patrolBoatNode?.type).toBe(CoastalPatrolBoat);
  });

  it('TC-266.1.04 [UC-IMP266.1/MSS]: findReactNodes collects all nodes satisfying filter predicate', () => {
    const tree = captureTree(CoastalIslandEnvironment, { isMobile: true });
    const allGroups = findReactNodes(tree, (n) => getNodeType(n) === 'group');
    expect(allGroups.length).toBeGreaterThan(0);
  });

  it('TC-266.1.05 [UC-IMP266.1/MSS]: getNodeType returns intrinsic tag string or fallback component name', () => {
    const tree = captureTree(CoastalPatrolBoat, { isMobile: false });
    const divNode = React.createElement('div', { id: 'test-node' });
    const AnonComponent = () => React.createElement('span');
    expect(getNodeType(tree)).toBe('CoastalPatrolBoat');
    expect(getNodeType(divNode)).toBe('div');
    expect(getNodeType(React.createElement(AnonComponent))).toBe('AnonComponent');
  });

  it('TC-266.1.06 [UC-IMP266.1/A1]: findReactNode returns null when target node is not found in tree', () => {
    const tree = captureTree(CoastalPatrolBoat, { isMobile: true });
    const missing = findReactNode(tree, (n) => getNodeType(n) === 'nonExistentCustomTag');
    expect(tree).not.toBeNull();
    expect(missing).toBeNull();
  });

  it('TC-266.1.07 [UC-IMP266.1/A2]: findReactNode safely handles null, undefined, boolean, and text children', () => {
    const mixedRoot = React.createElement(
      React.Fragment,
      null,
      null,
      undefined,
      false,
      'text-node',
      React.createElement<{ readonly isMobile?: boolean }>(CoastalPatrolBoat, { isMobile: true })
    );
    const found = findReactNode(mixedRoot, (n) => n.type === CoastalPatrolBoat);
    expect(found).not.toBeNull();
    expect(found?.type).toBe(CoastalPatrolBoat);
  });

  it('TC-266.1.08 [UC-IMP266.1/A3]: findReactNode recursively traverses array root fragments', () => {
    const arrayRoot = [
      React.createElement<{ readonly key?: string; readonly isMobile?: boolean }>(CoastalPatrolBoat, {
        key: 'boat',
        isMobile: false,
      }),
      React.createElement<{ readonly key?: string; readonly isMobile?: boolean }>(CoastalSeagulls, {
        key: 'seagulls',
        isMobile: false,
      }),
    ];
    const foundSeagulls = findReactNode(arrayRoot, (n) => n.type === CoastalSeagulls);
    expect(foundSeagulls).not.toBeNull();
    expect(foundSeagulls?.type).toBe(CoastalSeagulls);
  });

  it('TC-266.1.09 [UC-IMP266.1/A4]: getNodeProps safely extracts props or returns empty object for null node', () => {
    const tree = captureTree(CoastalPatrolBoat, { isMobile: true });
    const nullProps = getNodeProps(null);
    const validProps = getNodeProps<{ readonly isMobile?: boolean }>(tree);
    expect(nullProps).toEqual({});
    expect(validProps.isMobile).toBe(true);
  });

  it('TC-266.1.10 [UC-IMP266.1/MSS]: plain empty object in TypeScript does not have polluted Object test properties', () => {
    const tree = captureTree(CoastalSeagulls, { isMobile: false });
    const props = getNodeProps<{ readonly isMobile?: boolean }>(tree);
    expect(tree).not.toBeNull();
    expect(props.isMobile).toBe(false);
    expect('frames' in props).toBe(false);
    expect('scale' in props).toBe(false);
  });
});
