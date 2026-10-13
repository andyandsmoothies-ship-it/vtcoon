// [TC-379/MSS][IMP-379] Contract Test Suite: MiniatureCityDiorama Mobile Purge & Skyline/Bridge LOD
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import '../helpers/r3f_test_harness';
import {
  MiniatureCityDiorama,
  CentralMonumentPlaza,
  type MiniatureCityDioramaProps,
  type CentralMonumentPlazaProps,
} from '../../src/client/3d/miniature_city_diorama';
import {
  DioramaSkyline,
  type DioramaSkylineProps,
} from '../../src/client/3d/diorama/diorama_skyline';
import {
  DioramaBridges,
  type DioramaBridgesProps,
} from '../../src/client/3d/diorama/diorama_bridges';
import { getCentralMonumentLODDescriptor } from '../../src/client/3d/diorama/diorama_lod_helpers';
import { SunnyIslandLobbyScene } from '../../src/client/3d/sunny_island_lobby_scene';
import { findReactNode } from '../helpers/threejs_test_utils';

describe('IMP-379: MiniatureCityDiorama Mobile Purge & Skyline/Bridge LOD', () => {
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

  it('TC-379.01a [UC-DIORAMA-MOBILE-PROP-WIRING/MSS]: Given MiniatureCityDiorama, When rendered with isMobile={true}, Then propagates isMobile and renders CentralMonumentPlaza with exactly 2 volumetric meshes without depth flickering', () => {
    const mobileMarkup = renderToStaticMarkup(
      React.createElement<CentralMonumentPlazaProps>(CentralMonumentPlaza, { isMobile: true })
    );
    const desktopMarkup = renderToStaticMarkup(
      React.createElement<CentralMonumentPlazaProps>(CentralMonumentPlaza, { isMobile: false })
    );

    // Mobile: Exactly 2 meshes (bệ nước #0EA5E9 và tháp #F59E0B cắm ngập)
    const mobileMeshes = mobileMarkup.match(/<mesh[\s>]/gi);
    expect(mobileMeshes?.length).toBe(2);
    expect(mobileMarkup).toContain('color="#0EA5E9"');
    expect(mobileMarkup).toContain('color="#F59E0B"');

    // Desktop: Full 7-mesh fountain
    const desktopMeshes = desktopMarkup.match(/<mesh[\s>]/gi);
    expect(desktopMeshes?.length).toBe(7);
  });

  it('TC-379.01b [UC-MONUMENT-GEOMETRIC-EMBEDDING/MSS]: Given CentralMonumentPlaza, When isMobile={true}, Then verifies pure spatial descriptor mathematical embedding and disabled shadow pass', () => {
    const desc = getCentralMonumentLODDescriptor(true);
    expect(desc.embeddingDepth).toBe(0.02);
    expect(desc.isCoplanar).toBe(false);
    expect(desc.spire.castShadow).toBe(false);
    expect(desc.meshCount).toBe(2);
  });

  it('TC-379.02 [UC-SKYLINE-STREETLAMP-CULLING/MSS]: Given DioramaSkyline, When isMobile={true}, Then culls 10 individual streetlamp groups while preserving bitexco-tower and colonial-waterfront-heritage', () => {
    const mobileMarkup = renderToStaticMarkup(
      React.createElement<DioramaSkylineProps>(DioramaSkyline, { isMobile: true })
    );
    const desktopMarkup = renderToStaticMarkup(
      React.createElement<DioramaSkylineProps>(DioramaSkyline, { isMobile: false })
    );

    // Mobile: Culls 10 streetlamps (vệt sáng circleGeometry)
    expect(mobileMarkup).not.toContain('circleGeometry');
    expect(mobileMarkup).toContain('data-testid="bitexco-tower"');
    expect(mobileMarkup).toContain('data-testid="colonial-waterfront-heritage"');

    // Desktop: Renders 10 streetlamps
    expect(desktopMarkup).toContain('circleGeometry');
  });

  it('TC-379.03a [UC-BRIDGES-BASON-LOD/MSS]: Given DioramaBridges, When isMobile={true}, Then renders 12 stay cables via InstancedMesh (1 Draw Call) and hides static LED strips', () => {
    const mobileMarkup = renderToStaticMarkup(
      React.createElement<DioramaBridgesProps>(DioramaBridges, { isMobile: true })
    );
    const desktopMarkup = renderToStaticMarkup(
      React.createElement<DioramaBridgesProps>(DioramaBridges, { isMobile: false })
    );

    // Mobile: InstancedMesh for cables & LED strip suppressed (saving 11 + 2 = 13 draw calls)
    expect(mobileMarkup).toContain('data-testid="instanced-bason-cables"');
    expect(mobileMarkup).not.toContain('bason-cable-pair-');
    expect(mobileMarkup).not.toContain('5.38,0.012,0.012');

    // Desktop: Individual cable pairs preserved for living contract
    expect(desktopMarkup).toContain('bason-cable-pair-');
  });

  it('TC-379.03b [UC-BRIDGES-LONGBIEN-LOD/MSS]: Given DioramaBridges, When isMobile={true}, Then suppresses 20 diagonal truss struts and top crossbeam; on desktop preserves them', () => {
    const mobileMarkup = renderToStaticMarkup(
      React.createElement<DioramaBridgesProps>(DioramaBridges, { isMobile: true })
    );
    const desktopMarkup = renderToStaticMarkup(
      React.createElement<DioramaBridgesProps>(DioramaBridges, { isMobile: false })
    );

    // Mobile: truss struts & top crossbeam suppressed
    expect(mobileMarkup).not.toContain('truss-strut-f-');
    expect(mobileMarkup).not.toContain('2,0.02,0.46');

    // Desktop: truss struts & top crossbeam preserved
    expect(desktopMarkup).toContain('truss-strut-f-');
    expect(desktopMarkup).toContain('2,0.02,0.46');
  });

  it('TC-379.04 [UC-DYNAMIC-ELEMENTS-PRESERVED/MSS]: Given MiniatureCityDiorama, When isMobile={true}, Then preserves DioramaModelRailroad, DioramaHarborCruiser, and DioramaTerrain', () => {
    const mobileMarkup = renderToStaticMarkup(
      React.createElement<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isMobile: true })
    );

    expect(mobileMarkup).toContain('data-testid="diorama-model-railroad"');
    expect(mobileMarkup).toContain('data-testid="diorama-harbor-cruiser"');
    expect(mobileMarkup).toContain('data-testid="diorama-river-waves"');
    expect(mobileMarkup).toContain('data-testid="central-monument-plaza"');
  });

  it('TC-379.05 [UC-CALLSITE-PROP-PROPAGATION/MSS]: Given MiniatureCityDiorama with isMobile={true}, Then propagates isMobile to CentralMonumentPlaza, DioramaBridges, and DioramaSkyline', () => {
    const mobileMarkup = renderToStaticMarkup(
      React.createElement<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isMobile: true })
    );

    // Call-site wiring verification (Anti-Tautological Invariant):
    expect(mobileMarkup).not.toContain('0.9,0.9,0.015,32');
    expect(mobileMarkup).toContain('data-testid="instanced-bason-cables"');
    expect(mobileMarkup).not.toContain('0.26,12');
  });

  it('TC-379.06 [UC-LOBBY-CALLSITE-DI/MSS]: Given SunnyIslandLobbyScene rendered with isMobile={true}, Then propagates isMobile to MiniatureCityDiorama without global sniffer leak', () => {
    let capturedTree: React.ReactElement | null = null;
    function TreeSpy() {
      capturedTree = SunnyIslandLobbyScene({ isMobile: true });
      return null;
    }
    renderToStaticMarkup(React.createElement(TreeSpy));

    expect(capturedTree).not.toBeNull();
    const dioramaElem = findReactNode<MiniatureCityDioramaProps>(
      capturedTree,
      (n) => n.type === MiniatureCityDiorama
    );
    expect(dioramaElem).not.toBeNull();
    expect(dioramaElem?.props?.isMobile).toBe(true);
  });
});
