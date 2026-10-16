// [UI-S01/MSS][IMP-407] WebGL Canvas Text Sanitizer & Emoji Purge SSOT

export const DEFAULT_CANVAS_TEXT_FALLBACK = '...';

const EMOJI_PATTERN = /\p{Extended_Pictographic}|\p{Emoji_Presentation}|[\uFE00-\uFE0F]/u;
const EMOJI_REPLACE_PATTERN = /\p{Extended_Pictographic}|\p{Emoji_Presentation}|[\uFE00-\uFE0F]/gu;
const ALLOWED_GLYPHS_PATTERN = /[^\p{L}\p{M}\p{N}\p{Sc}+%.,!?'"()\-:;\s]/gu;

export function hasMissingGlyphEmoji(rawText: string): boolean {
  return EMOJI_PATTERN.test(rawText);
}

export function sanitizeCanvasText(rawText: string, fallback = DEFAULT_CANVAS_TEXT_FALLBACK): string {
  const normalized = rawText.normalize('NFC');
  const stripped = normalized.replace(EMOJI_REPLACE_PATTERN, '');
  const cleaned = stripped.replace(ALLOWED_GLYPHS_PATTERN, '').replace(/\s+/g, ' ').trim();
  return cleaned.length > 0 ? cleaned : fallback;
}
