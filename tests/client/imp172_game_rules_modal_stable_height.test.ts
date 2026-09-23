// [TC-172/MSS][IMP-172] Contract Test Suite: GameRulesModal Stable Height & Tab Layout Shift Prevention
// Verifies modal height stability across tabs and flex layout integrity (min-h-0, shrink-0)
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GameRulesModal } from '../../src/client/ui/modals/game_rules_modal';

describe('[TC-172/MSS][IMP-172] GameRulesModal Stable Height & Non-Jumping Tabs', () => {
  it('[TC-172.01/MSS][IMP-172] GameRulesModal main container has constant height classes h-[85dvh] and max-h-[640px]', () => {
    const html = renderToStaticMarkup(
      React.createElement(GameRulesModal, { isOpen: true, onClose: () => {} })
    );
    const modalMatch = html.match(/<div[^>]*data-testid="game-rules-modal"[^>]*>/);
    expect(modalMatch).not.toBeNull();
    expect(modalMatch![0]).toContain('h-[85dvh]');
    expect(modalMatch![0]).toContain('max-h-[640px]');
  });

  it.each(['core', 'cards', 'mechanics'] as const)(
    '[TC-172.02/MSS][IMP-172] GameRulesModal maintains identical outer container classes on tab %s to prevent jumping',
    (tab) => {
      const html = renderToStaticMarkup(
        React.createElement(GameRulesModal, { isOpen: true, initialTab: tab, onClose: () => {} })
      );
      const modalMatch = html.match(/<div[^>]*data-testid="game-rules-modal"[^>]*>/);
      expect(modalMatch).not.toBeNull();
      expect(modalMatch![0]).toContain('h-[85dvh]');
      expect(modalMatch![0]).toContain('max-h-[640px]');
    }
  );

  it('[TC-172.03/MSS][IMP-172] GameRulesModal header has shrink-0 to prevent flex compression', () => {
    const html = renderToStaticMarkup(
      React.createElement(GameRulesModal, { isOpen: true, onClose: () => {} })
    );
    const headerMatch = html.match(/<header[^>]*>[\s\S]*?<\/header>/);
    expect(headerMatch).not.toBeNull();
    expect(headerMatch![0]).toContain('shrink-0');
  });

  it('[TC-172.04/MSS][IMP-172] GameRulesModal nav has shrink-0 to keep tabs stably positioned', () => {
    const html = renderToStaticMarkup(
      React.createElement(GameRulesModal, { isOpen: true, onClose: () => {} })
    );
    const navMatch = html.match(/<nav[^>]*>[\s\S]*?<\/nav>/);
    expect(navMatch).not.toBeNull();
    expect(navMatch![0]).toContain('shrink-0');
  });

  it('[TC-172.05/MSS][IMP-172] GameRulesModal main content has flex-1, min-h-0, and overflow-y-auto to isolate scrolling', () => {
    const html = renderToStaticMarkup(
      React.createElement(GameRulesModal, { isOpen: true, onClose: () => {} })
    );
    const mainMatch = html.match(/<main[^>]*>/);
    expect(mainMatch).not.toBeNull();
    expect(mainMatch![0]).toContain('flex-1');
    expect(mainMatch![0]).toContain('min-h-0');
    expect(mainMatch![0]).toContain('overflow-y-auto');
  });

  it('[TC-172.06/MSS][IMP-172] GameRulesModal footer has shrink-0 so "Đã Hiểu" button is never clipped or pushed out', () => {
    const html = renderToStaticMarkup(
      React.createElement(GameRulesModal, { isOpen: true, onClose: () => {} })
    );
    const footerMatch = html.match(/<footer[^>]*>[\s\S]*?<\/footer>/);
    expect(footerMatch).not.toBeNull();
    expect(footerMatch![0]).toContain('shrink-0');
    expect(footerMatch![0]).toContain('Đã Hiểu');
  });
});
