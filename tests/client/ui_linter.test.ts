import { describe, it, expect } from 'vitest';
import { lintContent, runLinter, RULES } from '../../scripts/lint_ui.mjs';

describe('UI Linter - Impeccable Anti-patterns [UC-UI-LINT/MSS]', () => {
  describe('Rule 1: border-accent-on-rounded', () => {
    it('detects directional border-b-4 on rounded element', () => {
      const snippet = `<button className="px-4 py-2 rounded-xl bg-amber-500 border-b-4 border-amber-700">Click</button>`;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(1);
      expect(violations[0]?.rule).toBe(RULES.BORDER_ACCENT_ON_ROUNDED);
    });

    it('detects border-t-4 on rounded-2xl element', () => {
      const snippet = `<div className="rounded-2xl border-t-4 border-rose-500 p-4">Content</div>`;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(1);
      expect(violations[0]?.rule).toBe(RULES.BORDER_ACCENT_ON_ROUNDED);
    });

    it('detects logical directional borders border-s-4, border-e-4, border-y-4, border-x-4', () => {
      expect(lintContent('<button className="rounded-xl border-s-4 border-amber-500">Click</button>', 'test.tsx')).toHaveLength(1);
      expect(lintContent('<button className="rounded-xl border-e-4 border-amber-500">Click</button>', 'test.tsx')).toHaveLength(1);
      expect(lintContent('<button className="rounded-xl border-y-4 border-amber-500">Click</button>', 'test.tsx')).toHaveLength(1);
      expect(lintContent('<button className="rounded-xl border-x-4 border-amber-500">Click</button>', 'test.tsx')).toHaveLength(1);
    });

    it('passes tactile shadow replacement without directional border', () => {
      const snippet = `<button className="px-4 py-2 rounded-xl bg-teal-500 border border-teal-800 shadow-[0_4px_0_0_#115e59] active:translate-y-[3px]">Click</button>`;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(0);
    });

    it('passes spinner with border-4 and border-t-transparent', () => {
      const snippet = `<div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />`;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(0);
    });

    it('passes unrounded tooltip arrow with directional borders', () => {
      const snippet = `<div className="w-2 h-2 bg-slate-800 border-r-2 border-b-2 border-amber-400 rotate-45" />`;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(0);
    });

    it('passes directional rounded when border is on flat unrounded side', () => {
      // Header has rounded top, but bottom is completely flat. border-b-4 causes no corner warping.
      const snippet = `<div className="rounded-t-2xl border-b-4 border-slate-700 p-4">Modal Header</div>`;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(0);
    });

    it('detects border-radius with border-bottom in css file', () => {
      const css = `.card { border-radius: 12px; border-bottom: 4px solid #f59e0b; }`;
      const violations = lintContent(css, 'style.css');
      expect(violations).toHaveLength(1);
      expect(violations[0]?.rule).toBe(RULES.BORDER_ACCENT_ON_ROUNDED);
    });

    it('detects double-digit border width (10px, 12px) in css file', () => {
      const css = `.badge { border-radius: 8px; border-bottom: 10px solid #f59e0b; }`;
      const violations = lintContent(css, 'style.css');
      expect(violations).toHaveLength(1);
      expect(violations[0]?.rule).toBe(RULES.BORDER_ACCENT_ON_ROUNDED);
    });
  });

  describe('Rule 2: bounce-easing', () => {
    it('detects animate-bounce class', () => {
      const snippet = `<div className="animate-bounce text-xl">Icon</div>`;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(1);
      expect(violations[0]?.rule).toBe(RULES.BOUNCE_EASING);
    });

    it('detects cubic-bezier with overshoot > 1.0', () => {
      const snippet = `const springEase = 'cubic-bezier(0.34, 1.56, 0.64, 1)';`;
      const violations = lintContent(snippet, 'test.ts');
      expect(violations).toHaveLength(1);
      expect(violations[0]?.rule).toBe(RULES.BOUNCE_EASING);
    });

    it('passes crisp cubic-bezier(0.16, 1, 0.3, 1)', () => {
      const snippet = `animation: popIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;`;
      const violations = lintContent(snippet, 'test.css');
      expect(violations).toHaveLength(0);
    });
  });

  describe('Rule 3: gray-on-color', () => {
    it('detects text-slate-950 on chromatic bg-amber-400', () => {
      const snippet = `<span className="px-3 py-1 rounded bg-amber-400 text-slate-950 font-bold">Gold</span>`;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(1);
      expect(violations[0]?.rule).toBe(RULES.GRAY_ON_COLOR);
    });

    it('detects text-zinc-950 on chromatic bg-emerald-500', () => {
      const snippet = `<div className="bg-emerald-500 text-zinc-950 p-2">Badge</div>`;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(1);
      expect(violations[0]?.rule).toBe(RULES.GRAY_ON_COLOR);
    });

    it('detects text-stone-950 on chromatic background', () => {
      const snippet = `<div className="bg-rose-500 text-stone-950 p-2">Badge</div>`;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(1);
      expect(violations[0]?.rule).toBe(RULES.GRAY_ON_COLOR);
    });

    it('detects chromatic backgrounds lime, pink, fuchsia with neutral-950', () => {
      expect(lintContent('<span className="bg-lime-400 text-slate-950 font-bold">Lime</span>', 'test.tsx')).toHaveLength(1);
      expect(lintContent('<span className="bg-pink-400 text-slate-950 font-bold">Pink</span>', 'test.tsx')).toHaveLength(1);
      expect(lintContent('<span className="bg-fuchsia-400 text-slate-950 font-bold">Fuchsia</span>', 'test.tsx')).toHaveLength(1);
    });

    it('passes text-amber-950 on bg-amber-400', () => {
      const snippet = `<span className="px-3 py-1 rounded bg-amber-400 text-amber-950 font-bold">Gold</span>`;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(0);
    });

    it('passes text-slate-950 on neutral bg-slate-300', () => {
      const snippet = `<span className="px-3 py-1 rounded bg-slate-300 text-slate-950 font-bold">Silver</span>`;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(0);
    });
  });

  describe('Rule 4: gradient-text', () => {
    it('detects bg-clip-text with text-transparent and bg-gradient', () => {
      const snippet = `<h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-yellow-500">VTCOON</h1>`;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(1);
      expect(violations[0]?.rule).toBe(RULES.GRADIENT_TEXT);
    });

    it('detects bg-clip-text with bg-linear-to-r in Tailwind v4', () => {
      const snippet = `<h2 className="bg-clip-text text-transparent bg-linear-to-r from-teal-400 to-emerald-400 font-black">Subheading</h2>`;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(1);
      expect(violations[0]?.rule).toBe(RULES.GRADIENT_TEXT);
    });

    it('detects arbitrary and radial gradients with bg-clip-text', () => {
      const arbitrary = `<h1 className="bg-clip-text text-transparent bg-[linear-gradient(to_right,#f59e0b,#d97706)]">Title</h1>`;
      expect(lintContent(arbitrary, 'test.tsx')).toHaveLength(1);

      const radial = `<h1 className="bg-clip-text text-transparent bg-radial from-amber-400 to-amber-600">Title</h1>`;
      expect(lintContent(radial, 'test.tsx')).toHaveLength(1);
    });

    it('passes solid luxury typography', () => {
      const snippet = `<h1 className="text-4xl font-black text-amber-400 tracking-tight drop-shadow">VTCOON</h1>`;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(0);
    });
  });

  describe('Rule 5: side-tab', () => {
    it('detects border-l-4 with chromatic border color', () => {
      const snippet = `<div className="rounded-xl p-4 bg-white border-l-4 border-amber-500">Notice</div>`;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(1);
      expect(violations[0]?.rule).toBe(RULES.SIDE_TAB);
    });

    it('detects thick directional border border-r-8 on card container', () => {
      const snippet = `<div className="shadow-md bg-slate-900 border-r-8 p-3">Alert</div>`;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(1);
      expect(violations[0]?.rule).toBe(RULES.SIDE_TAB);
    });

    it('detects thick side-tab border in css file', () => {
      const css = `.card { border-radius: 8px; border-left: 4px solid #f59e0b; }`;
      const violations = lintContent(css, 'style.css');
      expect(violations).toHaveLength(1);
      expect(violations[0]?.rule).toBe(RULES.SIDE_TAB);
    });

    it('passes thin 1px directional border', () => {
      const snippet = `<div className="rounded-xl p-4 bg-white border-l border-slate-200">Subtle</div>`;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(0);
    });

    it('passes uniform 4-sided border', () => {
      const snippet = `<div className="rounded-xl p-4 bg-white border-4 border-amber-500">Box</div>`;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(0);
    });
  });

  describe('Rule 6: clipped-overflow-container', () => {
    it('detects overflow-hidden wrapping escaping dropdown popup', () => {
      const snippet = `<div className="relative overflow-hidden"><button>Menu</button><div className="absolute top-full left-0 dropdown">Menu Content</div></div>`;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(1);
      expect(violations[0]?.rule).toBe(RULES.CLIPPED_OVERFLOW_CONTAINER);
    });

    it('detects overflow-clip wrapping tooltip with negative inset', () => {
      const snippet = `<div className="overflow-clip"><button>Info</button><span className="absolute -top-8 tooltip" role="tooltip">Tip</span></div>`;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(1);
      expect(violations[0]?.rule).toBe(RULES.CLIPPED_OVERFLOW_CONTAINER);
    });

    it('passes overflow-visible host wrapping popup', () => {
      const snippet = `<div className="relative overflow-visible"><button>Menu</button><div className="absolute top-full left-0 dropdown">Menu Content</div></div>`;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(0);
    });

    it('passes scroll container with overflow-y-auto', () => {
      const snippet = `<div className="overflow-y-auto max-h-60"><div className="dropdown absolute top-full">Content</div></div>`;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(0);
    });

    it('passes contained decorative element marked aria-hidden', () => {
      const snippet = `<div className="overflow-hidden relative"><span className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-amber-400/20 blur-xl pointer-events-none" aria-hidden="true" /></div>`;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(0);
    });
  });

  describe('Helper Functions & Advanced Syntaxes', () => {
    it('detects anti-patterns combined across cn arguments', () => {
      const snippet = `<button className={cn('rounded-xl', isPrimary && 'border-b-4 border-amber-600')}>Click</button>`;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(1);
      expect(violations[0]?.rule).toBe(RULES.BORDER_ACCENT_ON_ROUNDED);
    });

    it('handles nested function calls inside cn / clsx without truncation', () => {
      const snippet = `cn('base', getVariant(props), 'rounded-xl border-b-4 border-amber-600')`;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(1);
      expect(violations[0]?.rule).toBe(RULES.BORDER_ACCENT_ON_ROUNDED);
    });

    it('detects nested template literals inside className', () => {
      const snippet = `<button className={\`rounded-xl \${active ? \`border-b-4 border-amber-700\` : 'border-0'}\`}>Click</button>`;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(1);
      expect(violations[0]?.rule).toBe(RULES.BORDER_ACCENT_ON_ROUNDED);
    });

    it('deduplicates violations on the same element in template literals', () => {
      const snippet = `<button className={\`rounded-xl border-b-4 border-amber-600 \${active ? 'bg-amber-500' : 'bg-slate-700'}\`}>Click</button>`;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(1);
    });

    it('detects anti-patterns in standalone constants outside JSX', () => {
      const snippet = `
        export const BUTTON_STYLE = "px-4 py-2 rounded-xl bg-amber-500 border-b-4 border-amber-700";
        export const TITLE_STYLE = "text-4xl bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600";
      `;
      const violations = lintContent(snippet, 'constants.ts');
      expect(violations).toHaveLength(2);
    });
  });

  describe('Comment Filtering & Multi-branch Template Literals', () => {
    it('ignores rules mentioned inside comments', () => {
      const snippet = `
        // Anti-pattern: do not use animate-bounce or rounded-xl border-b-4
        /*
          bg-clip-text text-transparent bg-gradient-to-r
          text-slate-950 bg-amber-400
        */
        const x = 42;
      `;
      const violations = lintContent(snippet, 'test.ts');
      expect(violations).toHaveLength(0);
    });

    it('handles mutually exclusive ternary branches correctly', () => {
      const snippet = `
        <span
          className={\`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs \${
            isTopRank
              ? 'bg-amber-400 text-amber-950 font-black shadow'
              : rank === 2
              ? 'bg-slate-300 text-slate-950'
              : rank === 3
              ? 'bg-amber-700 text-white'
              : 'bg-slate-700 text-slate-300'
          }\`}
        >
          1
        </span>
      `;
      const violations = lintContent(snippet, 'test.tsx');
      expect(violations).toHaveLength(0);
    });
  });

  describe('Repository src/client Verification', () => {
    it('passes src/client with 0 Impeccable Anti-pattern violations', () => {
      const { totalViolations, fileCount, violations } = runLinter('src/client');
      expect(fileCount).toBeGreaterThanOrEqual(80);
      expect(totalViolations, JSON.stringify(violations, null, 2)).toBe(0);
    });
  });
});
