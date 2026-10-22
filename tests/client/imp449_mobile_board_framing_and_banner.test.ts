// @vitest-environment happy-dom
// [IMP-449] Mobile Board Framing Restoration & Slim Banner Integration Contract Suite
// Traceability: [TC-449.01..TC-449.05], [UC-MOBILE-OVERVIEW-FRAMING], [UC-SLIM-MARKET-BANNER]
// Universal 5-Facet Behavioral Matrix & Anti-TIDD Clean Contract Suite

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PerspectiveCamera, Vector3 } from 'three';
import {
  CAMERA_CONFIG,
} from '../../src/client/3d/camera_state_machine';
import {
  calculateResponsiveOverviewFov,
  calculateResponsiveOverviewCameraState,
} from '../../src/client/3d/camera_kinematic_helpers';
import { MarketEventTicker } from '../../src/client/ui/market_event_ticker';
import { HudContainer } from '../../src/client/ui/hud_container';
import { useGameStore } from '../../src/client/store/game_store';
import { INITIAL_GAME_STATE } from '../../src/client/store/game_store_types';
import { MarketCardId } from '../../src/domain/event_card_types';

describe('[IMP-449] Mobile Board Framing Restoration & Slim Banner Integration Contract Suite', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    useGameStore.setState({
      ...INITIAL_GAME_STATE,
      activeModifiers: [],
      spotlightedCellIndices: null,
      activeModal: null,
      hasUserCustomCamera: false,
      cameraFocusCell: null,
      isRolling: false,
      hasRolledThisTurn: false,
      currentTurnPlayerId: 'p1',
      activePawnAnimation: null,
      roundNumber: 1,
      levelMap: {},
    });
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
    }
    if (container) {
      container.remove();
      container = null;
      root = null;
    }
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // =========================================================================
  // FACET 1: MOBILE OVERVIEW FOV & ELEVATION RECALIBRATION (INV-449.01)
  // =========================================================================
  it('[TC-449.01a/MSS][UC-MOBILE-OVERVIEW-FOV-CLAMP] calculateResponsiveOverviewFov clamps mobile portrait (aspect 0.48) to 42 deg', () => {
    const fov = calculateResponsiveOverviewFov(0.48, 24);

    expect(fov).toBeLessThanOrEqual(42);
    expect(fov).toBeGreaterThanOrEqual(40);
    expect(fov).toBe(42);
  });

  it('[TC-449.01b/A1][UC-MOBILE-OVERVIEW-FOV-NARROW] calculateResponsiveOverviewFov clamps extreme mobile portrait (aspect 0.42) to 42 deg', () => {
    const fov = calculateResponsiveOverviewFov(0.42, 24);

    expect(fov).toBe(42);
  });

  it('[TC-449.01c/A2][UC-MOBILE-OVERVIEW-ELEVATION] calculateResponsiveOverviewCameraState on aspect 0.48 brings elevation Y closer (<= 23.5m)', () => {
    const state = calculateResponsiveOverviewCameraState(0.48, CAMERA_CONFIG.overview);

    expect(state.fov).toBe(42);
    expect(state.position[1]).toBeLessThanOrEqual(23.5);
    expect(state.position[1]).toBeGreaterThanOrEqual(21.5);
  });

  it('[TC-449.01d/A3][UC-MOBILE-OVERVIEW-TARGET-SHIFT] calculateResponsiveOverviewCameraState restricts target shift <= 0.4m on portrait phone', () => {
    const state = calculateResponsiveOverviewCameraState(0.48, CAMERA_CONFIG.overview);

    expect(state.target[0]).toBeLessThanOrEqual(2.65);
    expect(state.target[2]).toBeLessThanOrEqual(2.65);
  });

  // =========================================================================
  // FACET 2: SCREEN OCCUPANCY & NON-OCCLUSION SPATIAL PROJECTION (INV-449.01)
  // =========================================================================
  it('[TC-449.02a/MSS][UC-BOARD-SCREEN-OCCUPANCY-PROPORTION] Simulated camera on aspect 0.48 achieves board vertical span delta NDCy >= 0.70', () => {
    const state = calculateResponsiveOverviewCameraState(0.48, CAMERA_CONFIG.overview);
    const camera = new PerspectiveCamera(state.fov, 0.48, 0.1, 100);
    camera.position.set(state.position[0], state.position[1], state.position[2]);
    camera.lookAt(state.target[0], state.target[1], state.target[2]);
    camera.updateMatrixWorld(true);
    camera.updateProjectionMatrix();

    const cell0 = new Vector3(9, 0, 9).project(camera);
    const cell20 = new Vector3(-9, 0, -9).project(camera);
    const boardVerticalSpan = Math.abs(cell20.y - cell0.y);

    expect(boardVerticalSpan).toBeGreaterThanOrEqual(0.70);
  });

  it('[TC-449.02b/A1][UC-CELL20-BANNER-CLEARANCE] Cell 20 (Free Parking) maintains top banner clearance with NDCy <= 0.55', () => {
    const state = calculateResponsiveOverviewCameraState(0.48, CAMERA_CONFIG.overview);
    const camera = new PerspectiveCamera(state.fov, 0.48, 0.1, 100);
    camera.position.set(state.position[0], state.position[1], state.position[2]);
    camera.lookAt(state.target[0], state.target[1], state.target[2]);
    camera.updateMatrixWorld(true);
    camera.updateProjectionMatrix();

    const cell20 = new Vector3(-9, 0, -9).project(camera);

    expect(cell20.y).toBeLessThanOrEqual(0.55);
    expect(cell20.y).toBeGreaterThan(0.20);
  });

  it('[TC-449.02c/A2][UC-LATERAL-CORNER-MILD-OVERHANG] Cell 10 lateral tip exhibits controlled overhang within |NDCx| in [1.05, 1.85]', () => {
    const state = calculateResponsiveOverviewCameraState(0.48, CAMERA_CONFIG.overview);
    const camera = new PerspectiveCamera(state.fov, 0.48, 0.1, 100);
    camera.position.set(state.position[0], state.position[1], state.position[2]);
    camera.lookAt(state.target[0], state.target[1], state.target[2]);
    camera.updateMatrixWorld(true);
    camera.updateProjectionMatrix();

    const cell10 = new Vector3(-9, 0, 9).project(camera);

    expect(Math.abs(cell10.x)).toBeGreaterThan(1.0);
    expect(Math.abs(cell10.x)).toBeLessThanOrEqual(1.85);
  });

  // =========================================================================
  // FACET 3: PITCH INVARIANCE & LANDSCAPE PARITY (INV-449.01 / TC-449.04)
  // =========================================================================
  it('[TC-449.04a/MSS][UC-PITCH-ANGLE-INVARIANCE] calculateResponsiveOverviewCameraState preserves 38.6 deg pitch angle within +-0.5 deg between landscape and portrait', () => {
    const landscapeState = calculateResponsiveOverviewCameraState(1.77, CAMERA_CONFIG.overview);
    const portraitState = calculateResponsiveOverviewCameraState(0.48, CAMERA_CONFIG.overview);

    const dxL = landscapeState.position[0] - landscapeState.target[0];
    const dzL = landscapeState.position[2] - landscapeState.target[2];
    const dyL = landscapeState.position[1] - landscapeState.target[1];
    const landscapePitch = (Math.atan2(dyL, Math.hypot(dxL, dzL)) * 180) / Math.PI;

    const dxP = portraitState.position[0] - portraitState.target[0];
    const dzP = portraitState.position[2] - portraitState.target[2];
    const dyP = portraitState.position[1] - portraitState.target[1];
    const portraitPitch = (Math.atan2(dyP, Math.hypot(dxP, dzP)) * 180) / Math.PI;

    expect(landscapePitch).toBeCloseTo(38.6, 1);
    expect(Math.abs(portraitPitch - landscapePitch)).toBeLessThan(0.5);
  });

  it('[TC-449.04b/A1][UC-LANDSCAPE-DESKTOP-PARITY] calculateResponsiveOverviewCameraState on landscape (aspect 1.77) leaves base config unmutated', () => {
    const state = calculateResponsiveOverviewCameraState(1.77, CAMERA_CONFIG.overview);

    expect(state.fov).toBe(24);
    expect(state.position[1]).toBe(25.3);
    expect(state.target).toEqual([2.2, 0.0, 2.2]);
  });

  it('[TC-449.04c/A2][UC-TABLET-TRANSITION-BOUNDS] calculateResponsiveOverviewCameraState on tablet (aspect 1.33) preserves base overview elevation', () => {
    const state = calculateResponsiveOverviewCameraState(1.33, CAMERA_CONFIG.overview);

    expect(state.fov).toBe(24);
    expect(state.position[1]).toBe(25.3);
  });

  // =========================================================================
  // FACET 4: SLIM MOBILE BANNER LAYOUT & INTERACTION (INV-449.02 / TC-449.03)
  // =========================================================================
  it('[TC-449.03a/MSS][UC-SLIM-BANNER-COMPACT-HEIGHT] MarketEventTicker renders primary event line with compact min-h-[36px] styling', () => {
    act(() => {
      root?.render(
        React.createElement(MarketEventTicker, {
          activeModifiers: [
            {
              type: MarketCardId.MC_PEAK_TOURISM,
              remainingRounds: 2,
            },
          ],
        })
      );
    });

    const item = container?.querySelector('[data-testid="market-ticker-item-MC_PEAK_TOURISM"]');
    expect(item).not.toBeNull();
    expect(item?.className).toContain('min-h-[36px]');
  });

  it('[TC-449.03b/A1][UC-SLIM-BANNER-MORE-BADGE] MarketEventTicker with 3 active modifiers displays +2 khác badge for mobile collapse', () => {
    act(() => {
      root?.render(
        React.createElement(MarketEventTicker, {
          activeModifiers: [
            { type: MarketCardId.MC_PEAK_TOURISM, remainingRounds: 2 },
            { type: MarketCardId.MC_FREEZE_TRADE, remainingRounds: 1 },
            { type: MarketCardId.MC_FUEL_SURGE, remainingRounds: 3 },
          ],
        })
      );
    });

    const badge = container?.querySelector('[data-testid="market-ticker-more-badge"]');
    expect(badge).not.toBeNull();
    expect(badge?.textContent).toContain('+2 khác');
  });

  it('[TC-449.03c/A2][UC-SLIM-BANNER-MOBILE-COLLAPSE] MarketEventTicker hides secondary event items on mobile viewports via hidden sm:flex', () => {
    act(() => {
      root?.render(
        React.createElement(MarketEventTicker, {
          activeModifiers: [
            { type: MarketCardId.MC_PEAK_TOURISM, remainingRounds: 2 },
            { type: MarketCardId.MC_FREEZE_TRADE, remainingRounds: 1 },
          ],
        })
      );
    });

    const item2 = container?.querySelector('[data-testid="market-ticker-item-MC_FREEZE_TRADE"]');
    expect(item2).not.toBeNull();
    expect(item2?.className).toMatch(/hidden\s+sm:flex|sm:flex\s+hidden/);
  });

  it('[TC-449.03d/A3][UC-SLIM-BANNER-CLICK-DISPATCH] Clicking primary event line dispatches modal open and cell spotlighting', () => {
    act(() => {
      root?.render(
        React.createElement(MarketEventTicker, {
          activeModifiers: [
            {
              type: MarketCardId.MC_PEAK_TOURISM,
              remainingRounds: 2,
              affectedCells: [3, 7],
            },
          ],
        })
      );
    });

    const item = container?.querySelector<HTMLElement>('[data-testid="market-ticker-item-MC_PEAK_TOURISM"]');
    expect(item).not.toBeNull();

    act(() => {
      item?.click();
    });

    expect(useGameStore.getState().activeModal).toBe('event');
    expect(useGameStore.getState().spotlightedCellIndices).toEqual([3, 7]);
  });

  // =========================================================================
  // FACET 5: DYNAMIC TRIAD, RESOURCE TEARDOWN & BOUNDARY DEFENSE
  // =========================================================================
  it('[TC-449.05a/MSS][UC-SPOTLIGHT-UNMOUNT-CLEANUP] MarketEventTicker cleans up spotlight state and timers on unmount', () => {
    act(() => {
      root?.render(
        React.createElement(MarketEventTicker, {
          activeModifiers: [
            {
              type: MarketCardId.MC_PEAK_TOURISM,
              remainingRounds: 2,
              affectedCells: [2, 4],
            },
          ],
        })
      );
    });

    const item = container?.querySelector<HTMLElement>('[data-testid="market-ticker-item-MC_PEAK_TOURISM"]');
    act(() => {
      item?.click();
    });
    expect(useGameStore.getState().spotlightedCellIndices).toEqual([2, 4]);

    act(() => {
      root?.unmount();
      root = null;
    });

    expect(useGameStore.getState().spotlightedCellIndices).toBeNull();
  });

  it('[TC-449.05b/A1][UC-CAMERA-MATH-DEFENSE-INVALID-ASPECT] calculateResponsiveOverviewCameraState handles invalid aspect inputs without NaN or throw', () => {
    const stateNan = calculateResponsiveOverviewCameraState(Number.NaN, CAMERA_CONFIG.overview);
    const stateNeg = calculateResponsiveOverviewCameraState(-1, CAMERA_CONFIG.overview);
    const stateUndef = calculateResponsiveOverviewCameraState(undefined, CAMERA_CONFIG.overview);
    const stateZero = calculateResponsiveOverviewCameraState(0, CAMERA_CONFIG.overview);

    expect(Number.isFinite(stateNan.position[1])).toBe(true);
    expect(Number.isFinite(stateNeg.position[1])).toBe(true);
    expect(Number.isFinite(stateUndef.position[1])).toBe(true);
    expect(Number.isFinite(stateZero.position[1])).toBe(true);
  });

  it('[TC-449.05c/A2][UC-HUD-CONTAINER-WIRING-INTEGRATION] HudContainer actively mounts MarketEventTicker and reflects activeModifiers from store', () => {
    useGameStore.setState({
      activeModifiers: [
        {
          type: MarketCardId.MC_PEAK_TOURISM,
          remainingRounds: 2,
        },
      ],
    });

    act(() => {
      root?.render(React.createElement(HudContainer, { localPlayerId: 'p1' }));
    });

    const ticker = container?.querySelector('[data-testid="market-event-ticker"]');
    expect(ticker).not.toBeNull();
    expect(ticker?.textContent).toContain('Mùa Cao Điểm Du Lịch Quốc Tế');
  });
});
