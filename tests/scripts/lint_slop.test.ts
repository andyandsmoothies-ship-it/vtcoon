import { describe, it, expect } from 'vitest';
import { lintSlopContent, SLOP_RULES, categorizeFile } from '../../scripts/lint_slop.mjs';

describe('Local Anti-Slop AST Linter (lint_slop.mjs)', () => {
  describe('Rule 1: zero-swallowed-catch', () => {
    it('catches empty catch block with no statements and no comment', () => {
      const code = `
        function test() {
          try {
            doSomething();
          } catch {}
        }
      `;
      const { errors } = lintSlopContent(code, 'src/domain/sample.ts');
      expect(errors.some((e) => e.rule === SLOP_RULES.ZERO_SWALLOWED_CATCH)).toBe(true);
    });

    it('passes when catch block has explanatory comment', () => {
      const code = `
        function test() {
          try {
            doSomething();
          } catch {
            /* safe: environment mock */
          }
        }
      `;
      const { errors } = lintSlopContent(code, 'src/domain/sample.ts');
      expect(errors.some((e) => e.rule === SLOP_RULES.ZERO_SWALLOWED_CATCH)).toBe(false);
    });

    it('passes when catch block has Vietnamese explanatory comment', () => {
      const code = `
        function test() {
          try {
            doSomething();
          } catch {
            // An toàn khi WebAudio không khả dụng
          }
        }
      `;
      const { errors } = lintSlopContent(code, 'src/domain/sample.ts');
      expect(errors.some((e) => e.rule === SLOP_RULES.ZERO_SWALLOWED_CATCH)).toBe(false);
    });

    it('passes when catch block handles the error', () => {
      const code = `
        function test() {
          try {
            doSomething();
          } catch (err) {
            console.error('Error occurred:', err);
          }
        }
      `;
      const { errors } = lintSlopContent(code, 'src/domain/sample.ts');
      expect(errors.some((e) => e.rule === SLOP_RULES.ZERO_SWALLOWED_CATCH)).toBe(false);
    });
  });

  describe('Rule 2: zero-dirty-casts', () => {
    it('catches "as any" cast', () => {
      const code = `
        const data = getValue() as any;
      `;
      const { errors } = lintSlopContent(code, 'src/domain/sample.ts');
      expect(errors.some((e) => e.rule === SLOP_RULES.ZERO_DIRTY_CASTS)).toBe(true);
    });

    it('catches double casting "as unknown as T"', () => {
      const code = `
        const data = (window as unknown as { foo: string }).foo;
      `;
      const { errors } = lintSlopContent(code, 'src/domain/sample.ts');
      expect(errors.some((e) => e.rule === SLOP_RULES.ZERO_DIRTY_CASTS)).toBe(true);
    });

    it('passes single clean cast', () => {
      const code = `
        const data = getValue() as string;
      `;
      const { errors } = lintSlopContent(code, 'src/domain/sample.ts');
      expect(errors.some((e) => e.rule === SLOP_RULES.ZERO_DIRTY_CASTS)).toBe(false);
    });
  });

  describe('Rule 3: file-loc-budget & categorization', () => {
    it('categorizes paths into proper tiers', () => {
      expect(categorizeFile('src/domain/room.ts')).toBe('TIER1_LOGIC');
      expect(categorizeFile('src/server/turn_loop.ts')).toBe('TIER1_LOGIC');
      expect(categorizeFile('src/client/ui/top_bar.tsx')).toBe('TIER2_UI');
      expect(categorizeFile('src/client/3d/board.tsx')).toBe('TIER2_UI');
      expect(categorizeFile('src/client/3d/tile_icons.ts')).toBe('TIER3_STATIC');
    });

    it('triggers error when file exceeds tier maxError budget', () => {
      const code = new Array(600).fill('const x = 1;').join('\n');
      const { errors } = lintSlopContent(code, 'src/domain/giant_service.ts');
      expect(errors.some((e) => e.rule === SLOP_RULES.FILE_LOC_BUDGET)).toBe(true);
    });

    it('triggers warning when file exceeds tier maxWarn budget', () => {
      const code = new Array(350).fill('const x = 1;').join('\n');
      const { warnings } = lintSlopContent(code, 'src/domain/large_service.ts');
      expect(warnings.some((w) => w.rule === SLOP_RULES.FILE_LOC_BUDGET)).toBe(true);
    });
  });

  describe('Rule 4: function-loc-budget', () => {
    it('triggers error when domain logic function exceeds 120 lines', () => {
      const funcLines = [
        'function giantLogic() {',
        ...new Array(125).fill('  const y = 2;'),
        '}',
      ].join('\n');
      const { errors } = lintSlopContent(funcLines, 'src/domain/algorithm.ts');
      expect(errors.some((e) => e.rule === SLOP_RULES.FUNCTION_LOC_BUDGET)).toBe(true);
    });

    it('allows declarative UI component or texture generator to exceed 120 lines without error', () => {
      const funcLines = [
        'export function generateCustomTexture() {',
        ...new Array(130).fill('  ctx.fillRect(0, 0, 10, 10);'),
        '}',
      ].join('\n');
      const { errors } = lintSlopContent(funcLines, 'src/client/3d/custom_texture.ts');
      expect(errors.some((e) => e.rule === SLOP_RULES.FUNCTION_LOC_BUDGET)).toBe(false);
    });
  });
});
