// [TC-426/MSS][IMP-426] Contract Test Suite: Coastal Sanctuary Diorama Desktop Exposure & Placebo Elimination
import { describe, it, expect, beforeAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import '../helpers/r3f_test_harness';
import { findReactNode } from '../helpers/threejs_test_utils';
import {
  CoastalIslandEnvironment,
  DEFAULT_BALANCED_ISLAND_DIORAMA,
  type CoastalIslandEnvironmentProps,
} from '../../src/client/3d/coastal_island_environment';
import { GameBoard } from '../../src/client/3d/board_layout';
import { SunnyIslandLobbyScene } from '../../src/client/3d/sunny_island_lobby_scene';
import { TrainStationLandmark } from '../../src/client/3d/coastal_island_landmarks';
import {
  computeQuadrantCounts,
  validateSectorBalance,
} from '../../src/client/3d/spatial_geometry_helpers';

describe('IMP-426: Coastal Sanctuary Diorama Desktop Exposure & Placebo Elimination', () => {
  beforeAll(() => {
    const originalConsoleError = console.error;
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

  // =========================================================================
  // FACET 1: DESKTOP DEFAULT STREAMLINED INFERENCE (PLACEBO ELIMINATION)
  // =========================================================================
  it('TC-426.01 [UC-DESKTOP-DEFAULT-STREAMLINED-INFERENCE/MSS]: Given CoastalIslandEnvironment rendered with isMobile: false and streamlined omitted, When inspecting rendered output, Then streamlined resolves to false, exposing plateau and ring foam', () => {
    const html = renderToStaticMarkup(
      React.createElement(CoastalIslandEnvironment, { isMobile: false })
    );

    expect(html).toContain('color="#22C55E"');
    expect(html).toContain('color="#F3EBE1"');
    expect(html).toContain('16,17.2,64');
  });

  // =========================================================================
  // FACET 2: MOBILE TBDR STREAMLINED PRESERVATION & NARROW VIEWPORT GUARD
  // =========================================================================
  it('TC-426.02a [UC-MOBILE-STREAMLINED-PRESERVATION/MSS]: Given CoastalIslandEnvironment rendered with isMobile: true and streamlined omitted, When inspecting rendered output, Then streamlined resolves to true, strictly omitting peripheral diorama cylinders', () => {
    const html = renderToStaticMarkup(
      React.createElement(CoastalIslandEnvironment, { isMobile: true })
    );

    expect(html).not.toContain('15.6,17.6,0.26,64');
    expect(html).not.toContain('color="#EFE5D8"');
    expect(html).not.toContain('color="#F3EBE1"');
  });

  it('TC-426.02b [UC-MOBILE-STREAMLINED-PRESERVATION/A1]: Given CoastalIslandEnvironment rendered with isMobile: true and streamlined omitted, When inspecting water and foam, Then mounts compact box geometries', () => {
    const html = renderToStaticMarkup(
      React.createElement(CoastalIslandEnvironment, { isMobile: true })
    );

    expect(html).toContain('18.4,0.04,18.4');
    expect(html).toContain('18.45,0.02,18.45');
  });

  // =========================================================================
  // FACET 3: EXPLICIT STREAMLINED OVERRIDE (POKA-YOKE DOMAIN AFFORDANCE)
  // =========================================================================
  it('TC-426.03a [UC-EXPLICIT-STREAMLINED-OVERRIDE/MSS]: Given CoastalIslandEnvironment with isMobile: false and streamlined: true, When rendered, Then streamlined prop overrides desktop inference and omits diorama cylinders', () => {
    const html = renderToStaticMarkup(
      React.createElement(CoastalIslandEnvironment, { isMobile: false, streamlined: true })
    );

    expect(html).not.toContain('15.6,17.6,0.26,64');
    expect(html).not.toContain('color="#F3EBE1"');
    expect(html).toContain('18.45,0.02,18.45');
  });

  it('TC-426.03b [UC-EXPLICIT-STREAMLINED-OVERRIDE/A1]: Given CoastalIslandEnvironment with isMobile: true and streamlined: false, When rendered, Then streamlined prop overrides mobile inference and exposes diorama cylinders', () => {
    const html = renderToStaticMarkup(
      React.createElement(CoastalIslandEnvironment, { isMobile: true, streamlined: false })
    );

    expect(html).toContain('15.6,17.6,0.26,64');
    expect(html).toContain('color="#F3EBE1"');
    expect(html).toContain('16,17.2,64');
  });

  // =========================================================================
  // FACET 4: BOARD LAYOUT CALL-SITE WIRING (TIER PROFILE SYNCHRONIZATION)
  // =========================================================================
  it('TC-426.04a [UC-BOARD-LAYOUT-CALL-SITE-WIRING/MSS]: Given GameBoard rendered on Desktop tier, When inspecting CoastalIslandEnvironment call-site, Then wires isMobile={false} and streamlined={false}', () => {
    let desktopTree: React.ReactElement | null = null;
    function DesktopBoardSpy() {
      desktopTree = GameBoard({ isMobile: false });
      return null;
    }
    renderToStaticMarkup(React.createElement(DesktopBoardSpy));

    const coastal = findReactNode<CoastalIslandEnvironmentProps>(
      desktopTree,
      (n) => n.type === CoastalIslandEnvironment
    );
    expect(coastal).not.toBeNull();
    expect(coastal?.props?.isMobile).toBe(false);
    expect(coastal?.props?.streamlined).toBe(false);
  });

  it('TC-426.04b [UC-BOARD-LAYOUT-CALL-SITE-WIRING/A1]: Given GameBoard rendered on Mobile tier, When inspecting CoastalIslandEnvironment call-site, Then wires isMobile={true} and streamlined={true}', () => {
    let mobileTree: React.ReactElement | null = null;
    function MobileBoardSpy() {
      mobileTree = GameBoard({ isMobile: true });
      return null;
    }
    renderToStaticMarkup(React.createElement(MobileBoardSpy));

    const coastal = findReactNode<CoastalIslandEnvironmentProps>(
      mobileTree,
      (n) => n.type === CoastalIslandEnvironment
    );
    expect(coastal).not.toBeNull();
    expect(coastal?.props?.isMobile).toBe(true);
    expect(coastal?.props?.streamlined).toBe(true);
  });

  // =========================================================================
  // FACET 5: SUNNY ISLAND LOBBY SCENE CALL-SITE WIRING
  // =========================================================================
  it('TC-426.05a [UC-LOBBY-SCENE-CALL-SITE-WIRING/MSS]: Given SunnyIslandLobbyScene rendered with isMobile={true}, When inspecting CoastalIslandEnvironment call-site, Then wires isMobile={true} and streamlined={true}', () => {
    let mobileTree: React.ReactElement | null = null;
    function MobileLobbySpy() {
      mobileTree = SunnyIslandLobbyScene({ isMobile: true });
      return null;
    }
    renderToStaticMarkup(React.createElement(MobileLobbySpy));

    const coastal = findReactNode<CoastalIslandEnvironmentProps>(
      mobileTree,
      (n) => n.type === CoastalIslandEnvironment
    );
    expect(coastal).not.toBeNull();
    expect(coastal?.props?.isMobile).toBe(true);
    expect(coastal?.props?.streamlined).toBe(true);
  });

  it('TC-426.05b [UC-LOBBY-SCENE-CALL-SITE-WIRING/A1]: Given SunnyIslandLobbyScene rendered with isMobile={false}, When inspecting CoastalIslandEnvironment call-site, Then wires isMobile={false} and streamlined={false}', () => {
    let desktopTree: React.ReactElement | null = null;
    function DesktopLobbySpy() {
      desktopTree = SunnyIslandLobbyScene({ isMobile: false });
      return null;
    }
    renderToStaticMarkup(React.createElement(DesktopLobbySpy));

    const coastal = findReactNode<CoastalIslandEnvironmentProps>(
      desktopTree,
      (n) => n.type === CoastalIslandEnvironment
    );
    expect(coastal).not.toBeNull();
    expect(coastal?.props?.isMobile).toBe(false);
    expect(coastal?.props?.streamlined).toBe(false);
  });

  // =========================================================================
  // FACET 6: QUADRANT SECTOR EQUILIBRIUM ACTIVE VERIFICATION
  // =========================================================================
  it('TC-426.06 [UC-SECTOR-EQUILIBRIUM-IN-RENDERED-DIORAMA/MSS]: Given DEFAULT_BALANCED_ISLAND_DIORAMA.props rendered when !streamlined, When verifying spatial quadrant distribution, Then achieves perfect equilibrium Delta = 0 across 4 quadrants', () => {
    const capes = DEFAULT_BALANCED_ISLAND_DIORAMA.props;
    expect(capes.length).toBe(4);

    const positions = capes.map((c) => c.position);
    const counts = computeQuadrantCounts(positions);

    expect(counts).toEqual({ NW: 1, NE: 1, SW: 1, SE: 1 });
    expect(validateSectorBalance(counts)).toBe(true);
  });

  // =========================================================================
  // FACET 7: LIVING TEST TC-399.06B PRESERVATION & SSR PALETTE HYGIENE
  // =========================================================================
  it('TC-426.07 [UC-LIVING-TEST-TC399-PRESERVATION/MSS]: Given TrainStationLandmark and CoastalIslandEnvironment rendered on Desktop, When checking SSR markup, Then uses steel #64748B for rails and eliminates #94A3B8', () => {
    const stationHtml = renderToStaticMarkup(React.createElement(TrainStationLandmark));
    expect(stationHtml).toContain('color="#64748B"');
    expect(stationHtml).not.toContain('color="#94A3B8"');

    const envHtml = renderToStaticMarkup(
      React.createElement(CoastalIslandEnvironment, { isMobile: false })
    );
    expect(envHtml).not.toContain('#94A3B8');
  });
});
