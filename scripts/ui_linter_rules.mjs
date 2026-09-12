/**
 * scripts/ui_linter_rules.mjs
 * 
 * Rules, tokens, and classification definitions for VTCOON UI Anti-pattern Linter.
 */

export const RULES = {
  BORDER_ACCENT_ON_ROUNDED: 'border-accent-on-rounded',
  BOUNCE_EASING: 'bounce-easing',
  GRAY_ON_COLOR: 'gray-on-color',
  GRADIENT_TEXT: 'gradient-text',
};

export const RULE_MESSAGES = {
  [RULES.BORDER_ACCENT_ON_ROUNDED]: {
    title: 'border-accent-on-rounded',
    advice: 'Directional border on rounded element causes corner warping in CSS. Use layered box-shadow (e.g. shadow-[0_4px_0_0_#...]) instead.',
  },
  [RULES.BOUNCE_EASING]: {
    title: 'bounce-easing',
    advice: 'Overshooting or bouncy animation detected. Use crisp easing cubic-bezier(0.16, 1, 0.3, 1) and motion budget (100-500ms).',
  },
  [RULES.GRAY_ON_COLOR]: {
    title: 'gray-on-color',
    advice: 'Neutral dark text (text-slate-950, text-stone-950, etc.) on chromatic background produces muddy contrast. Use white, high-contrast tinted tones, or theme tokens.',
  },
  [RULES.GRADIENT_TEXT]: {
    title: 'gradient-text',
    advice: 'Gradient-clipped text reduces legibility and clashes with tactile luxury. Use solid high-contrast typography instead.',
  },
};

export const CHROMATIC_COLORS = '(?:amber|emerald|rose|blue|red|green|yellow|indigo|violet|purple|cyan|sky|teal|orange|lime|pink|fuchsia)';
export const CHROMATIC_BG_REGEX = new RegExp(`\\bbg-${CHROMATIC_COLORS}(?:-[0-9]+)?(?:\\/[0-9]+)?\\b`);
export const NEUTRAL_950_TEXT_REGEX = /\btext-(?:slate|zinc|gray|neutral|stone)-950\b/;

export const DIR_CORNERS = {
  b: ['b', 'bl', 'br'],
  t: ['t', 'tl', 'tr'],
  l: ['l', 'tl', 'bl', 's'],
  r: ['r', 'tr', 'br', 'e'],
  s: ['s', 'l', 'tl', 'bl'],
  e: ['e', 'r', 'tr', 'br'],
  y: ['t', 'b', 'tl', 'tr', 'bl', 'br'],
  x: ['l', 'r', 's', 'e', 'tl', 'tr', 'bl', 'br'],
};

const DIR_BORDER_REGEX = /^border-(b|t|l|r|s|e|y|x)-(?:[2-9]|\d{2,}|\[(?:[2-9]|\d{2,})px\]|\[(?:0\.[2-9]|[1-9]\d*\.?\d*)rem\])$/;

/**
 * Evaluates whether a set of class tokens exhibits border-accent-on-rounded anti-pattern.
 */
export function checkBorderAccentOnRounded(classString) {
  const tokens = classString.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;

  const dirBorders = [];
  for (const t of tokens) {
    const m = DIR_BORDER_REGEX.exec(t);
    if (m && m[1]) dirBorders.push(m[1]);
  }
  if (dirBorders.length === 0) return false;

  let hasAllRounded = false;
  let hasNone = false;
  const roundedSides = new Set();
  const noneSides = new Set();

  for (const t of tokens) {
    if (t === 'rounded-none' || t === 'rounded-0') {
      hasNone = true;
      continue;
    }
    if (/^rounded-(?:t|b|l|r|s|e|tl|tr|bl|br)-none$/.test(t)) {
      const side = t.split('-')[1];
      if (side) noneSides.add(side);
      continue;
    }
    if (/^rounded(?:-(?:sm|md|lg|xl|2xl|3xl|full|\[(?!0\b)[^\]]+\]))?$/.test(t)) {
      hasAllRounded = true;
      continue;
    }
    const sideMatch = /^rounded-(t|b|l|r|s|e|tl|tr|bl|br)(?:-(?:sm|md|lg|xl|2xl|3xl|full|\[(?!0\b)[^\]]+\]))?$/.exec(t);
    if (sideMatch && sideMatch[1]) {
      roundedSides.add(sideMatch[1]);
    }
  }

  if (hasNone && !hasAllRounded && roundedSides.size === 0) return false;

  for (const dir of dirBorders) {
    const corners = DIR_CORNERS[dir] || [];
    if (hasAllRounded) {
      if (corners.some(c => noneSides.has(c))) continue;
      return true;
    }
    if (corners.some(c => roundedSides.has(c))) return true;
  }

  return false;
}
