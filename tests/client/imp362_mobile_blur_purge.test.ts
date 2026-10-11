import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import { ModalBackdrop } from '../../src/client/ui/modals/modal_backdrop';
import { ActionDock } from '../../src/client/ui/action_dock';

describe('IMP-362: Mobile Backdrop Blur Purge & WebKit Compositor Stall Elimination', () => {
  it('TC-362.01 [UC-BLUR-PURGE-CSS/MSS] CSS index stylesheet purges backdrop-filter under max-width 767px', () => {
    const cssPath = path.resolve(process.cwd(), 'src/client/index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    expect(cssContent).toMatch(/@media\s*\(\s*max-width:\s*767px\s*\)/);
    expect(cssContent).toMatch(/-webkit-backdrop-filter:\s*none\s*!important/);
    expect(cssContent).toMatch(/backdrop-filter:\s*none\s*!important/);
  });

  it('TC-362.02 [UC-ACTION-DOCK-RESPONSIVE-BLUR/MSS] ActionDock applies backdrop-blur-none on mobile and md:backdrop-blur-sm on desktop', () => {
    const markup = renderToStaticMarkup(React.createElement(ActionDock, {}));

    expect(markup).toContain('backdrop-blur-none');
    expect(markup).toContain('md:backdrop-blur-sm');
  });

  it('TC-362.03 [UC-MODAL-BACKDROP-RESPONSIVE-BLUR/MSS] ModalBackdrop center orientation applies backdrop-blur-none and md:backdrop-blur-xs', () => {
    const markup = renderToStaticMarkup(
      React.createElement(ModalBackdrop, { center: true }, React.createElement('div', null, 'Dialog Body'))
    );

    expect(markup).toContain('backdrop-blur-none');
    expect(markup).toContain('md:backdrop-blur-xs');
  });

  it('TC-362.04 [UC-MODAL-BACKDROP-CONTRAST/MSS] ModalBackdrop provides high-contrast mobile background bg-slate-950/80 and desktop md:bg-slate-950/60', () => {
    const markup = renderToStaticMarkup(
      React.createElement(ModalBackdrop, { center: true }, React.createElement('div', null, 'Dialog Body'))
    );

    expect(markup).toContain('bg-slate-950/80');
    expect(markup).toContain('md:bg-slate-950/60');
  });

  it('TC-362.05 [UC-MODAL-BACKDROP-FULLSCREEN/MSS] ModalBackdrop in fullScreen mode does not apply any backdrop-blur', () => {
    const markup = renderToStaticMarkup(
      React.createElement(ModalBackdrop, { fullScreen: true }, React.createElement('div', null, 'Full Screen Modal'))
    );

    expect(markup).not.toContain('backdrop-blur');
    expect(markup).toContain('pointer-events-none');
  });
});
