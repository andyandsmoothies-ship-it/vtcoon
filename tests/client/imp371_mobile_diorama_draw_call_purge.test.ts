// [TC-371/MSS][UC-IMP371] WebGL Mobile TBDR Draw Call Purge & Living Contract Preservation Suite
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { captureTree, findReactNode } from '../helpers/threejs_test_utils';

// Mock Drei components for headless AST and SSR traversal without WebGL context
vi.mock('@react-three/drei', () => ({
  ContactShadows: (props: { readonly frames?: number; [key: string]: unknown }) =>
    React.createElement('contact-shadows', props),
  OrbitControls: () => null,
  Environment: () => null,
  RoundedBox: (props: { readonly children?: React.ReactNode; [key: string]: unknown }) =>
    React.createElement('rounded-box', props, props.children),
}));

// Mock Fiber components
vi.mock('@react-three/fiber', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/fiber')>();
  return {
    ...actual,
    useFrame: () => {},
    useThree: () => ({
      camera: { position: { set: () => {} } },
      scene: {},
      gl: {
        info: {
          render: { calls: 40, triangles: 50000 },
          reset: () => {},
        },
      },
    }),
  };
});

import {
  MiniatureCityDiorama,
  CentralMonumentPlaza,
  type MiniatureCityDioramaProps,
} from '../../src/client/3d/miniature_city_diorama';
import { DioramaShophouseBlocks } from '../../src/client/3d/diorama/diorama_shophouse_blocks';
import { DioramaHighriseBlocks } from '../../src/client/3d/diorama/diorama_highrise_blocks';
import { DioramaCivicCenter } from '../../src/client/3d/diorama/diorama_civic_center';
import {
  DioramaModelRailroad,
  DioramaWaterfrontStation,
  DioramaLandmarkNorthStation,
} from '../../src/client/3d/diorama/diorama_railroad';
import { DioramaWaterfrontPark } from '../../src/client/3d/diorama/diorama_waterfront_park';
import { DioramaTraffic } from '../../src/client/3d/diorama/diorama_traffic';
import { DioramaMicroLife } from '../../src/client/3d/diorama/diorama_microlife';
import { DioramaHarborCruiser } from '../../src/client/3d/diorama/diorama_harbor_cruiser';
import { DioramaTerrain } from '../../src/client/3d/diorama/diorama_terrain';
import { DioramaBridges } from '../../src/client/3d/diorama/diorama_bridges';
import { DioramaSkyline } from '../../src/client/3d/diorama/diorama_skyline';
import { DioramaHeritageDistrict } from '../../src/client/3d/diorama/diorama_heritage_district';

describe('IMP-371: WebGL Mobile TBDR Draw Call Purge & Living Contract Preservation', () => {
  beforeEach(() => {
    vi.stubGlobal('window', globalThis);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('TC-371.01 [UC-DIORAMA-MOBILE-CULL/MSS]: Given isMobile=true, When inspecting MiniatureCityDiorama, Then elides unbatched background components', () => {
    const tree = captureTree<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isMobile: true });
    const shophouseNode = findReactNode(tree, (n) => n.type === DioramaShophouseBlocks);
    const highriseNode = findReactNode(tree, (n) => n.type === DioramaHighriseBlocks);
    const civicNode = findReactNode(tree, (n) => n.type === DioramaCivicCenter);
    const stationNode = findReactNode(tree, (n) => n.type === DioramaWaterfrontStation);
    expect(shophouseNode).toBeNull();
    expect(highriseNode).toBeNull();
    expect(civicNode).toBeNull();
    expect(stationNode).toBeNull();
  });

  it('TC-371.02 [UC-DIORAMA-TC265-PRESERVATION/MSS]: Given isMobile=true, When inspecting MiniatureCityDiorama, Then strictly preserves DioramaTraffic, DioramaModelRailroad, DioramaMicroLife, and DioramaHarborCruiser with isMobile=true', () => {
    const tree = captureTree<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isMobile: true });
    const trafficNode = findReactNode(tree, (n) => n.type === DioramaTraffic);
    const railroadNode = findReactNode(tree, (n) => n.type === DioramaModelRailroad);
    const microLifeNode = findReactNode(tree, (n) => n.type === DioramaMicroLife);
    const cruiserNode = findReactNode(tree, (n) => n.type === DioramaHarborCruiser);
    expect(trafficNode?.props?.isMobile).toBe(true);
    expect(railroadNode?.props?.isMobile).toBe(true);
    expect(microLifeNode?.props?.isMobile).toBe(true);
    expect(cruiserNode?.props?.isMobile).toBe(true);
  });

  it('TC-371.03 [UC-DIORAMA-CORE-LANDMARKS/MSS]: Given isMobile=true, When inspecting MiniatureCityDiorama, Then strictly preserves core landmarks', () => {
    const tree = captureTree<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isMobile: true });
    const terrainNode = findReactNode(tree, (n) => n.type === DioramaTerrain);
    const monumentNode = findReactNode(tree, (n) => n.type === CentralMonumentPlaza);
    const bridgesNode = findReactNode(tree, (n) => n.type === DioramaBridges);
    const skylineNode = findReactNode(tree, (n) => n.type === DioramaSkyline);
    expect(terrainNode).not.toBeNull();
    expect(monumentNode).not.toBeNull();
    expect(bridgesNode).not.toBeNull();
    expect(skylineNode).not.toBeNull();
  });

  it('TC-371.04 [UC-DIORAMA-DESKTOP-PARITY/MSS]: Given isMobile=false, When inspecting MiniatureCityDiorama, Then renders 100% full desktop fidelity', () => {
    const tree = captureTree<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isMobile: false });
    const shophouseNode = findReactNode(tree, (n) => n.type === DioramaShophouseBlocks);
    const highriseNode = findReactNode(tree, (n) => n.type === DioramaHighriseBlocks);
    const civicNode = findReactNode(tree, (n) => n.type === DioramaCivicCenter);
    const stationNode = findReactNode(tree, (n) => n.type === DioramaWaterfrontStation);
    expect(shophouseNode).not.toBeNull();
    expect(highriseNode).not.toBeNull();
    expect(civicNode).not.toBeNull();
    expect(stationNode).not.toBeNull();
  });

  it('TC-371.05 [UC-DIORAMA-SSR-DISPOSAL/MSS]: Given MiniatureCityDiorama mounted under SSR, When rendering and unmounting static markup, Then executes safely without throwing exceptions', () => {
    const mobileMarkup = renderToStaticMarkup(React.createElement(() => MiniatureCityDiorama({ isMobile: true })));
    const desktopMarkup = renderToStaticMarkup(React.createElement(() => MiniatureCityDiorama({ isMobile: false })));
    expect(mobileMarkup).toContain('miniature-city-diorama');
    expect(desktopMarkup).toContain('miniature-city-diorama');
  });

  it('TC-371.06 [UC-DIORAMA-MOBILE-DISTRICTS-CULL/MSS]: Given isMobile=true, When inspecting MiniatureCityDiorama, Then elides DioramaHeritageDistrict, DioramaWaterfrontPark, and DioramaLandmarkNorthStation', () => {
    const tree = captureTree<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isMobile: true });
    const heritageNode = findReactNode(tree, (n) => n.type === DioramaHeritageDistrict);
    const waterfrontParkNode = findReactNode(tree, (n) => n.type === DioramaWaterfrontPark);
    const landmarkNorthNode = findReactNode(tree, (n) => n.type === DioramaLandmarkNorthStation);
    expect(heritageNode).toBeNull();
    expect(waterfrontParkNode).toBeNull();
    expect(landmarkNorthNode).toBeNull();
  });
});
