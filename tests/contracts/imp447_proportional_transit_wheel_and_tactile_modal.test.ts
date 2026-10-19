// @vitest-environment happy-dom
// [CONTRACT TEST] IMP-447: Proportional Transit Wheel & Tactile Modal Polish
// SSOT References: docs/domain/gotchas/ui_ergonomics.md, docs/domain/gotchas/fsm_lifecycle.md
// Plan Reference: .agents/plans/PLAN_IMP_447_PROPORTIONAL_TRANSIT_WHEEL_AND_TACTILE_MODAL.md
// Audit Challenge Reference: .agents/audit/PLAN_CHALLENGE_IMP-447.md

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  TRANSIT_WHEEL_CONFIGS,
  TransitWheelOutcome,
  type TransitWheelConfig,
} from '../../src/domain/index.js';
import {
  getTransitWheelSectorAngles,
  getProportionalWheelTargetDeg,
} from '../../src/client/ui/modals/transit_wheel_visuals.js';
import {
  TransitWheelModal,
  getTransitWheelDismissText,
} from '../../src/client/ui/modals/transit_wheel_modal.js';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const TEST_SINGLE_100_CONFIG: readonly TransitWheelConfig[] = [
  {
    outcome: TransitWheelOutcome.SPEED_BOOST,
    weight: 100,
    labelVi: 'Tốc Hành',
    shortLabelVi: 'TỐC HÀNH',
    icon: '⚡',
    color: '#d97706',
    descriptionVi: 'Full circle 100% test',
  },
];

const TEST_ZERO_WEIGHT_CONFIGS: readonly TransitWheelConfig[] = [
  {
    outcome: TransitWheelOutcome.SPEED_BOOST,
    weight: 0,
    labelVi: 'Tốc Hành',
    shortLabelVi: 'TỐC HÀNH',
    icon: '⚡',
    color: '#d97706',
    descriptionVi: 'Zero weight sector',
  },
  {
    outcome: TransitWheelOutcome.SAFE_HAVEN,
    weight: 100,
    labelVi: 'Vé VIP Hồi Hương',
    shortLabelVi: 'HỒI HƯƠNG',
    icon: '🛡️',
    color: '#059669',
    descriptionVi: 'Remaining 100% sector',
  },
];

describe('[CONTRACT] IMP-447: Proportional Transit Wheel & Tactile Modal Polish', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.useRealTimers();
  });

  describe('Facet 1: Proportional Angles & Degenerate Guards (Visual Seam)', () => {
    it('[TC-447.01a/MSS] [UC-PROPORTIONAL-ANGLES] getTransitWheelSectorAngles returns 5 sectors with full 0-360 deg span and zero gap', () => {
      const sectors = getTransitWheelSectorAngles();
      expect(sectors).toHaveLength(5);
      expect(sectors[0]?.startDeg).toBe(0);
      expect(sectors[4]?.endDeg).toBe(360);
      expect(sectors.reduce((sum, s) => sum + s.spanDeg, 0)).toBe(360);
    });

    it('[TC-447.01b/MSS] [UC-PROPORTIONAL-ANGLES] getTransitWheelSectorAngles computes proportional spans [126, 72, 72, 36, 54] matching weights', () => {
      const sectors = getTransitWheelSectorAngles();
      const spans = sectors.map((s) => s.spanDeg);
      expect(spans).toEqual([126, 72, 72, 36, 54]);
      expect(sectors[0]?.midDeg).toBe(63);
      expect(sectors[3]?.midDeg).toBe(288);
      expect(sectors[4]?.midDeg).toBe(333);
    });

    it('[TC-447.02a/MSS] [UC-DEGENERATE-AND-UNDERFLOW-GUARDS] 100% weight produces dual-arc path full circle without SVG collapse', () => {
      const sectors = getTransitWheelSectorAngles(TEST_SINGLE_100_CONFIG);
      expect(sectors[0]?.spanDeg).toBe(360);
      expect(sectors[0]?.isCollapsed).toBe(false);
      expect(sectors[0]?.pathData).toContain('A 95 95 0 1 1');
    });

    it('[TC-447.02b/MSS] [UC-DEGENERATE-AND-UNDERFLOW-GUARDS] 0% weight underflow produces empty pathData and isCollapsed true', () => {
      const sectors = getTransitWheelSectorAngles(TEST_ZERO_WEIGHT_CONFIGS);
      expect(sectors[0]?.spanDeg).toBe(0);
      expect(sectors[0]?.isCollapsed).toBe(true);
      expect(sectors[0]?.pathData).toBe('');
    });
  });

  describe('Facet 2: Target Landing & Relational Covariance', () => {
    it.each([
      [0, TransitWheelOutcome.SPEED_BOOST, 63, 2097],
      [1, TransitWheelOutcome.SAFE_HAVEN, 162, 1998],
      [2, TransitWheelOutcome.CASH_BACK, 234, 1926],
      [3, TransitWheelOutcome.PASS_GO_FLIGHT, 288, 1872],
      [4, TransitWheelOutcome.FLIGHT_DELAY, 333, 1827],
    ])(
      '[TC-447.03_%d/MSS] [UC-TARGET-LANDING-DEG] Sector %s (midDeg %d) aligns under needle with target %d deg',
      (idx, outcome, expectedMid, expectedTarget) => {
        const targetDeg = getProportionalWheelTargetDeg(idx);
        expect(targetDeg).toBe(expectedTarget);
        expect((expectedMid + targetDeg) % 360).toBe(0);
      },
    );

    it('[TC-447.04a/MSS] [UC-RELATIONAL-COVARIANCE] verifies relational covariance f(0) !== f(1) and minimum 5 full spins >= 1800deg', () => {
      const deg0 = getProportionalWheelTargetDeg(0);
      const deg1 = getProportionalWheelTargetDeg(1);
      expect(deg0).not.toBe(deg1);
      expect(deg0).toBeGreaterThanOrEqual(1800);
      expect(deg1).toBeGreaterThanOrEqual(1800);
    });

    it('[TC-447.04b/MSS] [UC-RELATIONAL-COVARIANCE] handles empty configs array gracefully with safe fallback without throwing', () => {
      const deg = getProportionalWheelTargetDeg(0, []);
      expect(deg).toBe(2160);
      expect(deg % 360).toBe(0);
    });
  });

  describe('Facet 3: Narrow Sector Layout & Presentation DTO Seam', () => {
    it('[TC-447.05a/MSS] [UC-NARROW-SECTOR-LAYOUT-SEAM] 10% narrow sector (36 deg) scales typography and icon to prevent border clipping', () => {
      const sectors = getTransitWheelSectorAngles();
      const sector10 = sectors[3];
      expect(sector10?.isNarrow).toBe(true);
      expect(sector10?.fontSize).toBe(10);
      expect(sector10?.iconSize).toBe(16);
    });

    it('[TC-447.05b/MSS] [UC-NARROW-SECTOR-LAYOUT-SEAM] 10% sector offsets iconY to 32 and textY to 54, while 35% sector uses standard layout', () => {
      const sectors = getTransitWheelSectorAngles();
      const sector10 = sectors[3];
      const sector35 = sectors[0];
      expect(sector10?.iconY).toBe(32);
      expect(sector10?.textY).toBe(54);
      expect(sector35?.isNarrow).toBe(false);
      expect(sector35?.fontSize).toBe(12);
    });
  });

  describe('Facet 4: Call-Site Wiring, Tactile Affordance & Accessibility', () => {
    it('[TC-447.06/MSS] [UC-CALL-SITE-WIRING-ROTATION] Mounted TransitWheelModal with SPEED_BOOST outcome renders wheel group with transform: rotate(2097deg)', () => {
      act(() => {
        root.render(
          React.createElement(TransitWheelModal, {
            cellIndex: 5,
            payload: {
              cellIndex: 5,
              outcome: TransitWheelOutcome.SPEED_BOOST,
              targetCell: 8,
            },
            onSpin: () => {},
            onClose: () => {},
          }),
        );
      });

      const wheelGroup = container.querySelector('svg g.transition-transform');
      const styleAttr = wheelGroup?.getAttribute('style') ?? '';
      expect(styleAttr).toContain('rotate(2097deg)');
      expect(styleAttr).toContain('transform-origin: center');
    });

    it('[TC-447.07a/MSS] [UC-TACTILE-CTA-AND-A11Y] Primary action button satisfies touch target min-height >= 44px with tactile styling', () => {
      act(() => {
        root.render(
          React.createElement(TransitWheelModal, {
            cellIndex: 5,
            payload: { cellIndex: 5 },
            onSpin: () => {},
            onClose: () => {},
          }),
        );
      });

      const spinBtn = container.querySelector('button');
      expect(spinBtn?.className).toContain('min-h-[48px]');
      expect(spinBtn?.className).toContain('from-amber-500');
      expect(spinBtn?.className).toContain('shadow-[0_4px_0_0_#b45309]');
    });

    it('[TC-447.07b/MSS] [UC-TACTILE-CTA-AND-A11Y] Needle indicator penetrates rim with -top-1.5 centering and wheel has transparent bounding anchor', () => {
      act(() => {
        root.render(
          React.createElement(TransitWheelModal, {
            cellIndex: 5,
            payload: { cellIndex: 5 },
            onSpin: () => {},
            onClose: () => {},
          }),
        );
      });

      const needleEl = container.querySelector('.border-t-\\[18px\\]');
      expect(needleEl?.className).toContain('left-1/2');
      expect(needleEl?.className).toContain('-translate-x-1/2');
      expect(needleEl?.className).toContain('-top-1.5');
      const anchorCircle = container.querySelector('circle[fill="transparent"]');
      expect(anchorCircle?.getAttribute('stroke')).toBe('transparent');
    });

    it('[TC-447.08/MSS] [UC-LIVING-CONTRACT-DISMISS-TEXT] getTransitWheelDismissText preserves canonical text mapping for stationary and moving outcomes', () => {
      expect(getTransitWheelDismissText(TransitWheelOutcome.CASH_BACK, 5, 5)).toBe('Xác Nhận & Ở Lại Trạm');
      expect(getTransitWheelDismissText(TransitWheelOutcome.FLIGHT_DELAY, 5, 5)).toBe('Xác Nhận & Ở Lại Trạm');
      expect(getTransitWheelDismissText(TransitWheelOutcome.SPEED_BOOST, 8, 5)).toBe('Tiếp Tục Di Chuyển Đến Ô Mới');
      expect(getTransitWheelDismissText(TransitWheelOutcome.SAFE_HAVEN, 5, 5)).toBe('Xác Nhận & Ở Lại Trạm');
    });

    it('[TC-447.09/MSS] [UC-LIFECYCLE-UNMOUNT-CLEANUP] Unmounting TransitWheelModal during active spin cleans up timers without leaks or errors', () => {
      const localContainer = document.createElement('div');
      document.body.appendChild(localContainer);
      const localRoot = createRoot(localContainer);

      try {
        act(() => {
          localRoot.render(
            React.createElement(TransitWheelModal, {
              cellIndex: 5,
              payload: { cellIndex: 5 },
              onSpin: () => {},
              onClose: () => {},
            }),
          );
        });

        const spinBtn = localContainer.querySelector('button');
        act(() => {
          spinBtn?.click();
        });

        act(() => {
          localRoot.unmount();
        });

        expect(localContainer.innerHTML).toBe('');
        expect(() => vi.advanceTimersByTime(5000)).not.toThrow();
      } finally {
        localContainer.remove();
      }
    });
  });
});
