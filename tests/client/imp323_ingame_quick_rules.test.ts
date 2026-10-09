// @vitest-environment happy-dom
// [IMP-323] In-Game Quick Rules on TopBar & Enriched Content Contract Suite
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TopBar } from '../../src/client/ui/top_bar.js';
import { GameRulesModal } from '../../src/client/ui/modals/game_rules_modal.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { useActivityStore } from '../../src/client/store/activity_store.js';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('Station 1 Contract Tests: In-Game Quick Rules on TopBar & Enriched Content', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    useGameStore.setState({
      roundNumber: 1,
      maxRounds: 30,
      turnTimeRemaining: 60,
      treasuryPool: 2000,
      activeModal: null,
      modalPayload: null,
    });
    useActivityStore.setState({
      activityLogs: [],
      isActivityFeedOpen: false,
      unreadCount: 0,
    });

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
    }
    if (container?.parentNode) {
      container.parentNode.removeChild(container);
    }
    container = null;
    root = null;
  });

  it('TC-323.01 [UC-QRULES/MSS] Given TopBar rendered on screen, When player clicks quick-rules-topbar-btn, Then calls openModal with rules and initialTab mechanics', () => {
    const openModalSpy = vi.fn();
    useGameStore.setState({ openModal: openModalSpy });

    act(() => {
      root?.render(React.createElement(TopBar, {}));
    });

    const quickRulesBtn = container?.querySelector<HTMLButtonElement>('[data-testid="quick-rules-topbar-btn"]');
    expect(quickRulesBtn).toBeInstanceOf(HTMLButtonElement);

    act(() => {
      quickRulesBtn?.click();
    });

    expect(openModalSpy).toHaveBeenCalledWith('rules', { initialTab: 'mechanics' });
  });

  it('TC-323.02 [UC-QRULES/MSS] Given TopBar rendered on mobile viewport, When rendered, Then quick-rules-topbar-btn preserves touch target size min-w-[36px] min-h-[36px]', () => {
    act(() => {
      root?.render(React.createElement(TopBar, {}));
    });

    const quickRulesBtn = container?.querySelector<HTMLButtonElement>('[data-testid="quick-rules-topbar-btn"]');
    expect(quickRulesBtn).toBeInstanceOf(HTMLButtonElement);
    expect(quickRulesBtn?.className).toContain('min-w-[36px]');
    expect(quickRulesBtn?.className).toContain('min-h-[36px]');
  });

  it('TC-323.03 [UC-QRULES/MSS] Given GameRulesModal opened with mechanics tab, When rendered, Then displays insolvency section detailing building downgrades and 50% refund', () => {
    act(() => {
      root?.render(React.createElement(GameRulesModal, { isOpen: true, initialTab: 'mechanics' }));
    });

    const headings = Array.from(container?.querySelectorAll('h3, h4') ?? []);
    const insolvencyHeading = headings.find(
      (h) => h.textContent?.includes('Phá Sản') || h.textContent?.includes('Thoát Nợ')
    );
    expect(insolvencyHeading).toBeDefined();

    const insolvencySection = insolvencyHeading?.parentElement;
    expect(insolvencySection?.textContent?.toLowerCase()).toContain('hạ cấp');
    expect(insolvencySection?.textContent).toContain('50%');
  });

  it('TC-323.04 [UC-QRULES/MSS] Given GameRulesModal opened with mechanics tab, When rendered, Then displays passing GO deductions covering 5% and 10% mortgage interest and treasury taxes', () => {
    act(() => {
      root?.render(React.createElement(GameRulesModal, { isOpen: true, initialTab: 'mechanics' }));
    });

    const headings = Array.from(container?.querySelectorAll('h3, h4') ?? []);
    const goSectionHeading = headings.find(
      (h) => h.textContent?.includes('Vượt GO') || h.textContent?.includes('Thế Chấp')
    );
    expect(goSectionHeading).toBeDefined();

    const goSection = goSectionHeading?.parentElement;
    expect(goSection?.textContent).toContain('5%');
    expect(goSection?.textContent).toMatch(/10%.*(?:siết|lãi suất|tăng lãi)/i);
    expect(goSection?.textContent?.toLowerCase()).toContain('thuế');
  });

  it('TC-323.05 [UC-QRULES/MSS] Given GameRulesModal opened with mechanics tab, When rendered, Then displays treasury stimulus explaining the >= 10,000 Tr. threshold and 20% aid to poorest player', () => {
    act(() => {
      root?.render(React.createElement(GameRulesModal, { isOpen: true, initialTab: 'mechanics' }));
    });

    const headings = Array.from(container?.querySelectorAll('h3, h4') ?? []);
    const treasuryHeading = headings.find(
      (h) => h.textContent?.includes('Cứu Trợ') || h.textContent?.includes('Kích Cầu')
    );
    expect(treasuryHeading).toBeDefined();

    const treasurySection = treasuryHeading?.parentElement;
    expect(treasurySection?.textContent).toContain('20%');
    expect(treasurySection?.textContent).toMatch(/(?:>=|≥)\s*10\.000\s*Tr/i);
  });

  it('TC-323.06 [UC-QRULES/A1] Given GameRulesModal close button clicked, When dismissed, Then invokes onClose callback without residual state', () => {
    const onClose = vi.fn();
    act(() => {
      root?.render(React.createElement(GameRulesModal, { isOpen: true, onClose, initialTab: 'mechanics' }));
    });

    const closeBtn = container?.querySelector<HTMLButtonElement>('[data-testid="close-rules-modal-btn"]');
    expect(closeBtn).toBeInstanceOf(HTMLButtonElement);

    act(() => {
      closeBtn?.click();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
