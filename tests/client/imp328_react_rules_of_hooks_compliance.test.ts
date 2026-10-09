// @vitest-environment happy-dom
// [IMP-328] React Rules of Hooks Compliance & Lifecycle Re-render Contract Suite
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OwnerPricePill } from '../../src/client/3d/owner_property_markers.js';
import { PostProcessingPipeline } from '../../src/client/3d/post_processing_pipeline.js';
import { FloatingNumbersOverlay, FloatingBadge } from '../../src/client/ui/floating_numbers.js';
import { useGameStore, type FloatingTextItem, FloatingTextType } from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';

vi.mock('@react-three/postprocessing', () => ({
  EffectComposer: ({ children }: { children?: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'mock-effect-composer' }, children),
  Bloom: () => React.createElement('div', { 'data-testid': 'mock-bloom' }),
  SelectiveBloom: () => React.createElement('div', { 'data-testid': 'mock-selective-bloom' }),
  DepthOfField: () => React.createElement('div', { 'data-testid': 'mock-dof' }),
  N8AO: () => React.createElement('div', { 'data-testid': 'mock-n8ao' }),
  Vignette: () => React.createElement('div', { 'data-testid': 'mock-vignette' }),
  ToneMapping: () => React.createElement('div', { 'data-testid': 'mock-tonemapping' }),
  SMAA: () => React.createElement('div', { 'data-testid': 'mock-smaa' }),
}));

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('Station 1 Contract Tests: React Rules of Hooks Compliance (IMP-328)', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    useGameStore.setState({
      floatingTexts: [],
      activeModal: null,
      activeModifiers: [],
    });
    useLobbyStore.setState({
      myPlayerId: 'p1',
    });
  });

  afterEach(() => {
    if (root) {
      try {
        act(() => {
          root?.unmount();
        });
      } catch {
        /* ignore unmount error */
      }
    }
    if (container?.parentNode) {
      container.parentNode.removeChild(container);
    }
    container = null;
    root = null;
    vi.restoreAllMocks();
  });

  it('TC-328.01 [UC-HOOKS/MSS]: Given OwnerPricePill rendered with unowned property, When component re-renders with ownerColor prop, Then component updates without hook mismatch exception', () => {
    expect(() => {
      act(() => {
        root?.render(
          React.createElement(OwnerPricePill, {
            cellIndex: 1,
            ownerColor: undefined,
            price: 60,
          })
        );
      });
      act(() => {
        root?.render(
          React.createElement(OwnerPricePill, {
            cellIndex: 1,
            ownerColor: '#EF4444',
            price: 60,
          })
        );
      });
    }).not.toThrow();
    expect(container !== null).toBe(true);
    expect((container?.innerHTML.length ?? 0) > 0).toBe(true);
  });

  it('TC-328.02 [UC-HOOKS/A1]: Given OwnerPricePill rendered with ownerColor prop, When component re-renders without ownerColor prop, Then component returns null without hook mismatch exception', () => {
    expect(() => {
      act(() => {
        root?.render(
          React.createElement(OwnerPricePill, {
            cellIndex: 3,
            ownerColor: '#3B82F6',
            price: 120,
          })
        );
      });
      act(() => {
        root?.render(
          React.createElement(OwnerPricePill, {
            cellIndex: 3,
            ownerColor: undefined,
            price: 120,
          })
        );
      });
    }).not.toThrow();
    expect(container?.innerHTML === '').toBe(true);
    expect(container?.firstElementChild).toBeNull();
  });

  it('TC-328.03 [UC-HOOKS/MSS]: Given PostProcessingPipeline rendered with enabled false, When component re-renders with enabled true, Then pipeline renders without hook mismatch exception', () => {
    expect(() => {
      act(() => {
        root?.render(
          React.createElement(PostProcessingPipeline, {
            enabled: false,
            isMobile: false,
          })
        );
      });
      act(() => {
        root?.render(
          React.createElement(PostProcessingPipeline, {
            enabled: true,
            isMobile: false,
          })
        );
      });
    }).not.toThrow();
    expect(container !== null).toBe(true);
    expect(container?.querySelector('[data-testid="mock-effect-composer"]')).not.toBeNull();
  });

  it('TC-328.04 [UC-HOOKS/A1]: Given PostProcessingPipeline rendered with isMobile true, When component re-renders with isMobile false, Then pipeline adapts bloom without hook count discrepancy', () => {
    expect(() => {
      act(() => {
        root?.render(
          React.createElement(PostProcessingPipeline, {
            enabled: true,
            isMobile: true,
          })
        );
      });
      act(() => {
        root?.render(
          React.createElement(PostProcessingPipeline, {
            enabled: true,
            isMobile: false,
          })
        );
      });
    }).not.toThrow();
    expect(container?.querySelector('[data-testid="mock-effect-composer"]')).not.toBeNull();
    expect(container?.querySelector('[data-testid="mock-bloom"]')).not.toBeNull();
  });

  it('TC-328.05 [UC-HOOKS/MSS]: Given FloatingNumbersOverlay rendered with empty floating texts, When component re-renders with a newly added transaction item, Then overlay mounts active container without hook count discrepancy', () => {
    expect(() => {
      act(() => {
        root?.render(React.createElement(FloatingNumbersOverlay, {}));
      });

      const newItem: FloatingTextItem = {
        id: 'test_item_1',
        text: '+500k',
        type: FloatingTextType.Reward,
        timestamp: Date.now(),
        playerId: 'p1',
        actionType: 'rent',
      };

      act(() => {
        useGameStore.setState({
          floatingTexts: [newItem],
        });
        root?.render(React.createElement(FloatingNumbersOverlay, {}));
      });
    }).not.toThrow();
    expect(container?.querySelector('.pointer-events-none')).not.toBeNull();
    expect(container?.textContent).toContain('+500k');
  });

  it('TC-328.06 [UC-HOOKS/A1]: Given FloatingBadge rendered with monopoly action type, When component re-renders with rent action type, Then badge transitions smoothly without hook count discrepancy', () => {
    const monopolyItem: FloatingTextItem = {
      id: 'badge_1',
      text: 'ĐỘC QUYỀN',
      type: FloatingTextType.Bonus,
      timestamp: Date.now(),
      playerId: 'p1',
      actionType: 'monopoly',
    };

    const rentItem: FloatingTextItem = {
      id: 'badge_2',
      text: '-200k',
      type: FloatingTextType.Penalty,
      timestamp: Date.now(),
      playerId: 'p1',
      actionType: 'rent',
    };

    expect(() => {
      act(() => {
        root?.render(
          React.createElement(FloatingBadge, {
            item: monopolyItem,
          })
        );
      });
      act(() => {
        root?.render(
          React.createElement(FloatingBadge, {
            item: rentItem,
          })
        );
      });
    }).not.toThrow();
    expect(container !== null).toBe(true);
    expect(container?.textContent).toContain('-200k');
  });
});
