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
    errors.push({
      rule: SLOP_RULES.ZERO_MICRO_SPLINTERING,
      file: filePath,
      line: 1,
      message: `Micro-Splintering: "${filePath}" has only ${nonBlank.length} SLOC (< 30). Co-locate or inline.`,
    });
  }
}

export function lintPassthroughProxies(sf, content, filePath, errors) {
  if (!filePath.replace(/\\/g, '/').startsWith('src/')) return;
  const isHelperFile = LOGIC_FILE_REGEX.test(filePath);

  function checkProxy(fnName, paramsNode, callExpr, nodeForTrivia, isExported, errNode) {
    if (!fnName || /^[A-Z]/.test(fnName)) return;
    if (!callExpr || !ts.isCallExpression(callExpr)) return;

    const callExprText = callExpr.expression.getText(sf);
    const isBuiltin = /\.(?:get|has|set|delete|toISOString|stringify|parse)$/.test(callExprText) ||
      /^(?:JSON|Math|Date)\./.test(callExprText) ||
      /\b(?:globalBus|bus)\./.test(callExprText);
    const hasJustification = /\/\*\s*(?:facade|alias|shim|safe)\b|\/\/\s*(?:facade|alias|shim|safe)\b/i.test(nodeForTrivia.getFullText(sf));
    const hasDefaultParams = paramsNode.some((p) => p.initializer !== undefined);
    const isApiFacade = isExported && !isHelperFile;

    if (!isBuiltin && !hasJustification && !hasDefaultParams && !isApiFacade) {
      const params = paramsNode.map((p) => p.name.getText(sf));
      const args = callExpr.arguments.map((a) => a.getText(sf));
      if (params.length > 0 && params.length === args.length && params.every((p, i) => p === args[i])) {
        const line = sf.getLineAndCharacterOfPosition(errNode.getStart(sf)).line + 1;
        errors.push({
          rule: SLOP_RULES.ZERO_PASSTHROUGH_PROXIES,
          file: filePath,
          line,
          message: `Middle-Man Passthrough: "${fnName}" is a 1-line exact proxy to "${callExprText}".`,
        });
      }
    }
  }

  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.body) {
      const fnName = node.name ? node.name.getText(sf) : '';
      const stmts = node.body.statements;
      if (stmts.length === 1 && ts.isReturnStatement(stmts[0]) && stmts[0].expression) {
        const isExported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
        checkProxy(fnName, node.parameters, stmts[0].expression, node, isExported, node);
      }
    } else if (ts.isVariableDeclaration(node) && node.initializer && ts.isArrowFunction(node.initializer)) {
      const fnName = node.name.getText(sf);
      const arrow = node.initializer;
      const isExported = node.parent?.parent && ts.isVariableStatement(node.parent.parent) &&
        node.parent.parent.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      const nodeForTrivia = node.parent?.parent && ts.isVariableStatement(node.parent.parent) ? node.parent.parent : node;

      if (ts.isBlock(arrow.body)) {
        const stmts = arrow.body.statements;
        if (stmts.length === 1 && ts.isReturnStatement(stmts[0]) && stmts[0].expression) {
          checkProxy(fnName, arrow.parameters, stmts[0].expression, nodeForTrivia, isExported, node);
        }
      } else if (ts.isCallExpression(arrow.body)) {
        checkProxy(fnName, arrow.parameters, arrow.body, nodeForTrivia, isExported, node);
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
