/**
 * scripts/boundary_linter/boundary_rules.mjs
 * 
 * AST rules and Cycle Graph Analysis for Boundary Linter.
 */

import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import {
  BOUNDARY_RULES,
  KNOWN_LEGACY_CLIENT_SERVER_VIOLATIONS,
  normalizeRelPath
} from './boundary_constants.mjs';

export function resolveImport(containingFile, importSpecifier) {
  if (!importSpecifier.startsWith('.')) {
    return null;
  }
  const dir = path.dirname(containingFile);
  const cleanSpecifier = importSpecifier.replace(/\.(js|jsx)$/, '');
  const resolvedBase = path.resolve(dir, cleanSpecifier);
  
  const candidates = [
    resolvedBase + '.ts',
    resolvedBase + '.tsx',
    resolvedBase + '.d.ts',
    path.join(resolvedBase, 'index.ts'),
    path.join(resolvedBase, 'index.tsx'),
    resolvedBase,
    path.resolve(dir, importSpecifier)
  ];
  
  for (const cand of candidates) {
    if (fs.existsSync(cand) && fs.statSync(cand).isFile()) {
      return path.resolve(cand);
    }
  }
  return null;
}

export function lintFileBoundaries(filePath, content, repoRoot, isStrict = false) {
  const errors = [];
  const warnings = [];
  const relPath = normalizeRelPath(path.relative(repoRoot, filePath));
  const isClient = relPath.startsWith('src/client/');
  const isLegacy = KNOWN_LEGACY_CLIENT_SERVER_VIOLATIONS.has(relPath);

  const sf = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

  function visit(node) {
    let specifier = null;
    let nodeStart = 0;

    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        specifier = node.moduleSpecifier.text;
        nodeStart = node.getStart();
      }
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const arg = node.arguments[0];
      if (arg && ts.isStringLiteral(arg)) {
        specifier = arg.text;
        nodeStart = node.getStart();
      }
    }

    if (specifier) {
      const { line } = sf.getLineAndCharacterOfPosition(nodeStart);
      const lineNumber = line + 1;

      // 1. Check Deep Relative Import (>= 3 levels: ../../../)
      const isFacadeImport = specifier.endsWith('/index.js') || specifier.endsWith('/index') || specifier.endsWith('/index.ts');
      if (!isFacadeImport && (specifier.includes('../../../') || specifier.includes('../../../../'))) {
        warnings.push({
          rule: BOUNDARY_RULES.DEEP_RELATIVE_IMPORT,
          file: relPath,
          line: lineNumber,
          message: `Deep relative import "${specifier}" breaks modular encapsulation. Consider using facade or path alias.`
        });
      }

      // 2. Check Client -> Server boundary
      const resolved = resolveImport(filePath, specifier);
      if (resolved) {
        const resolvedRel = normalizeRelPath(path.relative(repoRoot, resolved));
        const toServer = resolvedRel.startsWith('src/server/');

        if (isClient && toServer) {
          const violation = {
            rule: BOUNDARY_RULES.CLIENT_IMPORTS_SERVER,
            file: relPath,
            line: lineNumber,
            target: resolvedRel,
            message: `Client module "${relPath}" imports directly from Server internal "${resolvedRel}".`
          };

          if (isLegacy && !isStrict) {
            warnings.push({
              ...violation,
              message: `[LEGACY DEBT] ${violation.message} (Tracked in Ratchet Baseline).`
            });
          } else {
            errors.push(violation);
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sf);

  return { errors, warnings };
}

export function detectCycles(files, repoRoot) {
  const adj = new Map();
  const fileSet = new Set(files.map(f => path.resolve(f)));

  for (const file of files) {
    const full = path.resolve(file);
    adj.set(full, new Set());
    const content = fs.readFileSync(full, 'utf8');
    const sf = ts.createSourceFile(full, content, ts.ScriptTarget.Latest, true);

    ts.forEachChild(sf, function visit(node) {
      let spec = null;
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        spec = node.moduleSpecifier.text;
      }
      if (spec) {
        const res = resolveImport(full, spec);
        if (res && fileSet.has(res) && res !== full) {
          adj.get(full).add(res);
        }
      }
      ts.forEachChild(node, visit);
    });
  }

  // Tarjan's SCC Algorithm
  let index = 0;
  const indices = new Map();
  const lowlink = new Map();
  const onStack = new Set();
  const stack = [];
  const sccs = [];

  function strongConnect(u) {
    indices.set(u, index);
    lowlink.set(u, index);
    index++;
    stack.push(u);
    onStack.add(u);

    const neighbors = adj.get(u) || new Set();
    for (const v of neighbors) {
      if (!indices.has(v)) {
        strongConnect(v);
        lowlink.set(u, Math.min(lowlink.get(u), lowlink.get(v)));
      } else if (onStack.has(v)) {
        lowlink.set(u, Math.min(lowlink.get(u), indices.get(v)));
      }
    }

    if (lowlink.get(u) === indices.get(u)) {
      const scc = [];
      let w = null;
      do {
        w = stack.pop();
        onStack.delete(w);
        scc.push(w);
      } while (w !== u);

      if (scc.length > 1) {
        sccs.push(scc.map(f => normalizeRelPath(path.relative(repoRoot, f))));
      }
    }
  }

  for (const file of adj.keys()) {
    if (!indices.has(file)) {
      strongConnect(file);
    }
  }

  return sccs;
}
