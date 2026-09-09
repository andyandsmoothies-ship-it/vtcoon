// [UI-S05/MSS][TC-EMOTE02/MSS] SocialEmotesTray Component Markup & A11y Tests
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SocialEmotesTray } from '../../src/client/ui/social_emotes_tray';
import { SOCIAL_EMOTES } from '../../src/domain/emotes';

describe('[TC-EMOTE02.1/MSS] SocialEmotesTray Markup & Structure', () => {
  it('Render day du the nav toolbar voi aria-label dung tieu chuan', () => {
    const html = renderToStaticMarkup(React.createElement(SocialEmotesTray, {}));
    expect(html).toContain('role="toolbar"');
    expect(html).toContain('aria-label="Khay biểu cảm tương tác nhanh"');
  });

  it('Render dung 5 nut bieu cam tuong ung 5 SocialEmotes trong domain', () => {
    const html = renderToStaticMarkup(React.createElement(SocialEmotesTray, {}));
    for (const emote of SOCIAL_EMOTES) {
      expect(html).toContain(`title="${emote.label}"`);
      expect(html).toContain(`aria-label="${emote.label}"`);
      expect(html).toContain(emote.icon);
    }
  });

  it('Tat ca emoji icon deu duoc gan aria-hidden de ho tro tiep can a11y', () => {
    const html = renderToStaticMarkup(React.createElement(SocialEmotesTray, {}));
    const matches = html.match(/aria-hidden="true"/g);
    expect(matches).not.toBeNull();
    expect(matches?.length).toBe(5);
  });
});

describe('[TC-EMOTE02.2/MSS] SocialEmotesTray Disabled & Interactive States', () => {
  it('Khi disabled = false, cac nut khong co thuoc tinh disabled', () => {
    const html = renderToStaticMarkup(React.createElement(SocialEmotesTray, { disabled: false }));
    expect(html).not.toContain('disabled=""');
  });

  it('[Adversarial] Khi disabled = true, tat ca 5 nut deu bi khoa (disabled)', () => {
    const html = renderToStaticMarkup(React.createElement(SocialEmotesTray, { disabled: true }));
    const disabledMatches = html.match(/disabled=""/g);
    expect(disabledMatches).not.toBeNull();
    expect(disabledMatches?.length).toBe(5);
    expect(html).toContain('opacity-40');
    expect(html).toContain('cursor-not-allowed');
  });
});
