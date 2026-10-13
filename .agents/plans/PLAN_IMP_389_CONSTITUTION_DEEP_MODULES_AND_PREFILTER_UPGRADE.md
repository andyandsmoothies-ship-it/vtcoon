# Plan IMP-389: Upgrading Agents Constitution - Deep Modules, Seam Discipline & Anti-Shallow Linters (Ticket IMP-389)

## 0. Auto-Slicing Roadmap & Context
- **Sprint 3 Roadmap**: Nâng cấp Hiến pháp Agents Constitution & Prefilter cơ học: (1) Bổ sung 2 quy tắc Linter cho **Deep Modules & Seam Discipline**: `zero-micro-splintering` (< 30 LOC logic) và `zero-passthrough-proxies` (Middle-man 1:1 delegation) trong module chuyên biệt `scripts/slop_linter/slop_seam_rules.mjs`; (2) Thừa nhận tính hợp pháp của **Pure Calculation & View-Model Test Seams** (test suite là consumer thứ 2 hợp pháp per Michael Feathers); (3) Tối ưu hóa I/O bộ đệm `sharedFileCache = new Map()` trong `scripts/lint_slop.mjs` đạt $O(N)$ đĩa.
- **SSOT & Invariants**: (1) *Deep Module*: Interface nhỏ gọn đóng gói logic phức tạp (Ousterhout); không cấm module 1 consumer nếu là pure calculation test seam; (2) *Micro-Splintering Guard*: Cấm chẻ nhỏ file logic (< 30 LOC) né trần LOC; miễn trừ types, constants, barrel re-exports, UI components; (3) *Passthrough Proxy Guard*: Cấm hàm 1-line ủy quyền 1:1; miễn trừ built-ins, Map methods, singleton facades, và hàm có comment `/* facade */` / `/* alias */`.

## 1. Physical Target Files & Honest LOC Accounting
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| `scripts/slop_linter/slop_constants.mjs` | Scripts Facade | 76 | 78 | +2 | <= 200 | Safe (< 200 LOC) |
| `scripts/slop_linter/slop_seam_rules.mjs` | Scripts Linter | 0 | 42 | +42 | <= 200 | New Dedicated Module |
| `scripts/slop_linter/slop_text_rules.mjs` | Scripts Linter | 104 | 104 | 0 | <= 400 | Safe (Cache Integration) |
| `scripts/lint_slop.mjs` | Scripts Facade | 76 | 71 | -5 | <= 200 | Safe (< 200 LOC) |
| `tests/scripts/lint_slop.test.ts` | Living Test | 174 | 200 | +26 | <= 600 | Living Test Suite |
| `GEMINI.md` | Constitution | 73 | 73 | 0 | <= 200 | Cập nhật Deep Modules & Seams |
| `docs/domain/gotchas/deep_modules.md` | SSOT Gotchas | 36 | 36 | 0 | <= 200 | Thêm Item 9 Pure Seam & Deletion Test |
| `.agents/agents/code-reviewer.md` | Review Protocol | 127 | 127 | 0 | <= 300 | Cập nhật Flag 7 & Passthrough Audit |
| `docs/FEATURE_MAP.md` | SSOT Matrix | 93 | 93 | 0 | N/A | Cập nhật Mục 3 Gotchas Directory |

## 2. In-Action Visual Capture Registration
- Scenario: Non-UI (Toolchain Mechanical Linter & Architectural Governance). Visual capture bypassed per Gotcha 13; mechanical verification via check_evidence.mjs & prefilter.
## 3. Implementation Steps
### Station 1: Contract Testing (RED)
- **TC-389.01 [UC-PREFILTER-MICRO-SPLINTERING-BLOCK/MSS]:** Given an extracted logic helper file `src/domain/tiny_calc.ts` with < 30 non-comment LOC, When `lintMicroSplintering` executes, Then flags `SLOP_RULES.ZERO_MICRO_SPLINTERING`.
- **TC-389.02 [UC-PREFILTER-MICRO-SPLINTERING-WHITELIST/MSS]:** Given small files with < 30 LOC that are pure types (`types.ts`), constants (`constants.ts`), or barrel re-exports (`export * from`), When `lintMicroSplintering` executes, Then passes with 0 errors.
- **TC-389.03 [UC-PREFILTER-PASSTHROUGH-PROXY-BLOCK/MSS]:** Given a 1-line middle-man passthrough function `function delegate(a, b) { return target(a, b); }`, When `lintPassthroughProxies` executes, Then flags `SLOP_RULES.ZERO_PASSTHROUGH_PROXIES`.
- **TC-389.04 [UC-PREFILTER-PASSTHROUGH-PROXY-ALLOW/MSS]:** Given a function with data transformation, default parameters, Map getter (`.get`), or `/* facade */` comment, When `lintPassthroughProxies` executes, Then passes with 0 errors.
### Station 2: Implementation (GREEN)
#### Task 1: Bổ sung ZERO_MICRO_SPLINTERING và ZERO_PASSTHROUGH_PROXIES
**Target physical file**: `scripts/slop_linter/slop_constants.mjs`
```javascript
<<<<
  KINEMATICS_FINITE_DEFENSE: 'kinematics-finite-defense',
};

export const TIER_BUDGETS = {
====
  KINEMATICS_FINITE_DEFENSE: 'kinematics-finite-defense',
  ZERO_MICRO_SPLINTERING: 'zero-micro-splintering',
  ZERO_PASSTHROUGH_PROXIES: 'zero-passthrough-proxies',
};

export const TIER_BUDGETS = {
>>>>
```
#### Task 2: Tạo mới module chuyên biệt slop_seam_rules.mjs
**Target physical file**: `scripts/slop_linter/slop_seam_rules.mjs` (New)
```javascript
import ts from 'typescript';
import { SLOP_RULES } from './slop_constants.mjs';

const LOGIC_FILE_REGEX = /_(?:helpers?|utils?|calc|math|ops|logic)\.(?:ts|tsx)$/;

export function isWhitelistedMicroFile(content, filePath) {
  const norm = filePath.replace(/\\/g, '/');
  if (/(?:_types|_constants|\/types|\/constants)\.ts$|\.tsx$|\/hooks\//.test(norm)) return true;
  const lines = content.split('\n').map((l) => l.trim()).filter((l) => l.length > 0 && !/^\/\/|^\/\*|^\*/.test(l));
  return lines.every((l) => /^(?:export\s+)?(?:type|interface)\b|^import\s+type\b|^export\s+type\b|^export\s*\{/.test(l)) ||
         lines.every((l) => /^export\s+(?:\*|\{[^}]+\})\s+from\b|^import\b/.test(l));
}

export function lintMicroSplintering(content, filePath, errors) {
  if (!filePath.replace(/\\/g, '/').startsWith('src/') || !LOGIC_FILE_REGEX.test(filePath) || isWhitelistedMicroFile(content, filePath)) return;
  const nonBlank = content.split('\n').map((l) => l.trim()).filter((l) => l.length > 0 && !/^\/\/|^\/\*|^\*/.test(l));
  if (nonBlank.length < 30) {
    errors.push({ rule: SLOP_RULES.ZERO_MICRO_SPLINTERING, file: filePath, line: 1, message: `Micro-Splintering: "${filePath}" has only ${nonBlank.length} SLOC (< 30). Co-locate or inline.` });
  }
}

export function lintPassthroughProxies(sf, content, filePath, errors) {
  if (!filePath.replace(/\\/g, '/').startsWith('src/')) return;
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.body && !/^[A-Z]/.test(node.name?.getText(sf) ?? '')) {
      const fnName = node.name ? node.name.getText(sf) : '', stmts = node.body.statements;
      if (stmts.length === 1 && ts.isReturnStatement(stmts[0]) && stmts[0].expression && ts.isCallExpression(stmts[0].expression)) {
        const call = stmts[0].expression, callExprText = call.expression.getText(sf);
        const isBuiltin = /\.(?:get|has|set|delete|toISOString|stringify|parse)$/.test(callExprText) || /^(?:JSON|Math|Date)\./.test(callExprText) || /\b(?:globalBus|bus)\./.test(callExprText);
        const hasJustification = /\/\*\s*(?:facade|alias|shim|safe)\b|\/\/\s*(?:facade|alias|shim|safe)\b/i.test(node.getText(sf));
        if (!isBuiltin && !hasJustification) {
          const params = node.parameters.map((p) => p.name.getText(sf)), args = call.arguments.map((a) => a.getText(sf));
          if (params.length > 0 && params.length === args.length && params.every((p, i) => p === args[i])) {
            const line = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
            errors.push({ rule: SLOP_RULES.ZERO_PASSTHROUGH_PROXIES, file: filePath, line, message: `Middle-Man Passthrough: "${fnName}" is a 1-line exact proxy to "${callExprText}".` });
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
}

export function lintSeamRules(sf, content, filePath, errors) {
  lintMicroSplintering(content, filePath, errors);
  lintPassthroughProxies(sf, content, filePath, errors);
}
```
#### Task 3: Tối ưu hóa I/O bộ đệm trong slop_text_rules.mjs
**Target physical file**: `scripts/slop_linter/slop_text_rules.mjs`
```javascript
<<<<
export function lintOrphanProductionFiles(targetDir, files, errors) {
  if (targetDir !== 'src' && !targetDir.startsWith('src')) return;

  const srcFiles = files.filter(f => f.replace(/\\/g, '/').startsWith('src/'));
  if (srcFiles.length === 0) return;
  const testFiles = fs.existsSync('tests') ? getSourceFiles('tests') : [];
  const allSrcFiles = fs.existsSync('src') ? getSourceFiles('src') : srcFiles;
  const allSrcContent = allSrcFiles.map((f) => ({ file: f, content: fs.readFileSync(f, 'utf8') }));
  const allTestContent = testFiles.map((f) => ({ file: f, content: fs.readFileSync(f, 'utf8') }));
====
export function lintOrphanProductionFiles(targetDir, files, errors, fileCache = null) {
  if (targetDir !== 'src' && !targetDir.startsWith('src')) return;

  const srcFiles = files.filter(f => f.replace(/\\/g, '/').startsWith('src/'));
  if (srcFiles.length === 0) return;
  const testFiles = fs.existsSync('tests') ? getSourceFiles('tests') : [];
  const allSrcFiles = fs.existsSync('src') ? getSourceFiles('src') : srcFiles;
  const allSrcContent = allSrcFiles.map((f) => ({ file: f, content: fileCache?.get(f) ?? fs.readFileSync(f, 'utf8') }));
  const allTestContent = testFiles.map((f) => ({ file: f, content: fileCache?.get(f) ?? fs.readFileSync(f, 'utf8') }));
>>>>
```
#### Task 4: Tích hợp lintSeamRules và sharedFileCache vào lint_slop.mjs
**Target physical file**: `scripts/lint_slop.mjs`
```javascript
<<<<
import { lintAstRules } from './slop_linter/slop_ast_rules.mjs';
import { formatSlopResults } from './slop_linter/slop_reporter.mjs';

// Re-exports for downstream consumers and test suites
export { SLOP_RULES, TIER_BUDGETS, categorizeFile, getSourceFiles };

/**
 * Inspects a source code string and returns errors and warnings.
 */
export function lintSlopContent(content, filePath = 'anonymous.ts') {
  const errors = [];
  const warnings = [];

  // 1. Text-based rules (LOC, comments)
  lintTextRules(content, filePath, errors, warnings);

  // 2. AST-based traversal rules
  const sf = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  lintAstRules(sf, content, filePath, errors, warnings);

  return { errors, warnings };
}
====
import { lintAstRules } from './slop_linter/slop_ast_rules.mjs';
import { lintSeamRules } from './slop_linter/slop_seam_rules.mjs';
import { formatSlopResults } from './slop_linter/slop_reporter.mjs';

export { SLOP_RULES, TIER_BUDGETS, categorizeFile, getSourceFiles, lintSeamRules };

export function lintSlopContent(content, filePath = 'anonymous.ts') {
  const errors = [];
  const warnings = [];
  lintTextRules(content, filePath, errors, warnings);
  const sf = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  lintAstRules(sf, content, filePath, errors, warnings);
  lintSeamRules(sf, content, filePath, errors);
  return { errors, warnings };
}
>>>>
```
```javascript
<<<<
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const { errors, warnings } = lintSlopContent(content, file);
    allErrors.push(...errors);
    allWarnings.push(...warnings);
  }

  // Multi-file Rule: zero-orphan-production-files (Anti-TIDD Check)
  lintOrphanProductionFiles(targetDir, files, allErrors);
====
  const sharedFileCache = new Map();
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    sharedFileCache.set(file, content);
    const { errors, warnings } = lintSlopContent(content, file);
    allErrors.push(...errors);
    allWarnings.push(...warnings);
  }

  // Multi-file Rule: zero-orphan-production-files (Anti-TIDD Check with shared cache)
  lintOrphanProductionFiles(targetDir, files, allErrors, sharedFileCache);
>>>>
```
#### Task 5: Bổ sung Living Test Specs trong lint_slop.test.ts
**Target physical file**: `tests/scripts/lint_slop.test.ts`
```typescript
<<<<
      const { errors } = lintSlopContent(code, 'src/domain/sample.ts');
      expect(errors.some((e) => e.rule === SLOP_RULES.ZERO_WORKAROUND_COMMENTS)).toBe(false);
    });
  });
});
====
      const { errors } = lintSlopContent(code, 'src/domain/sample.ts');
      expect(errors.some((e) => e.rule === SLOP_RULES.ZERO_WORKAROUND_COMMENTS)).toBe(false);
    });
  });

  describe('Rule 12 & 13: Deep Modules & Seam Rules (IMP-389)', () => {
    it('catches micro-splintered logic file with < 30 LOC', () => {
      const code = 'export function calc(x: number) { return x * 2; }';
      const { errors } = lintSlopContent(code, 'src/domain/tiny_calc.ts');
      expect(errors.some((e) => e.rule === SLOP_RULES.ZERO_MICRO_SPLINTERING)).toBe(true);
    });

    it('whitelists pure types, constants, and barrel files with < 30 LOC', () => {
      const typeCode = 'export interface Config { timeout: number; }';
      const { errors } = lintSlopContent(typeCode, 'src/domain/sample_types.ts');
      expect(errors.some((e) => e.rule === SLOP_RULES.ZERO_MICRO_SPLINTERING)).toBe(false);
    });

    it('catches 1-line exact middle-man passthrough proxies', () => {
      const code = 'function compute(a: number, b: number) { return innerCompute(a, b); }';
      const { errors } = lintSlopContent(code, 'src/domain/service.ts');
      expect(errors.some((e) => e.rule === SLOP_RULES.ZERO_PASSTHROUGH_PROXIES)).toBe(true);
    });

    it('allows passthrough with transforms or facade comments', () => {
      const code = 'function compute(a: number, b: number) { /* facade */ return innerCompute(a, b); }';
      const { errors } = lintSlopContent(code, 'src/domain/service.ts');
      expect(errors.some((e) => e.rule === SLOP_RULES.ZERO_PASSTHROUGH_PROXIES)).toBe(false);
    });
  });
});
>>>>
```
#### Task 6: Bổ sung Điều luật Deep Modules & Seam Discipline vào GEMINI.md
- Bổ sung Iron Law: `Deep Modules & Seam Discipline (Anti-Micro-Splintering & Middle-Man Ban)`. Khẳng định pure calculation/view-model test seams là hoàn toàn hợp pháp và được khuyến khích cho Station 1 TDD. Cấm chẻ nhỏ micro-files (< 30 LOC) và cấm tạo hàm passthrough proxy 1-line.
#### Task 7: Bổ sung Hướng dẫn Kiến trúc Pillar VIII vào deep_modules.md
- Thêm Item 9 vào Pillar VIII: `Deep Modules, Seam Discipline, Whitelist for Pure Seams & The Deletion Test [IMP-389]`.
#### Task 8: Nâng cấp Flag 7 trong code-reviewer.md
- Cập nhật Flag 7 trong quy trình review Station 3.2 để kiểm tra Deletion Test, micro-splintering, và middle-man proxies.
#### Task 9: Cập nhật SSOT FEATURE_MAP.md Section 3 Gotchas Directory
- Cập nhật dòng tham chiếu gotchas Mục 3 (`deep_modules.md`) phản ánh quy chuẩn Deep Modules & Seam Discipline.

## 4. Definition of Done & Verification
1. `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_389_CONSTITUTION_DEEP_MODULES_AND_PREFILTER_UPGRADE.md --auto-sign` -> Exit 0.
2. `npx vitest run tests/scripts/lint_slop.test.ts` -> All tests pass.
3. `npm run prefilter` -> Exit 0 across the entire repository.
4. `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_389_CONSTITUTION_DEEP_MODULES_AND_PREFILTER_UPGRADE.md` -> Exit 0.
