import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const SRC_DIR = path.resolve('src');

function getDomainExports() {
  const dir = path.join(SRC_DIR, 'domain');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));
  let totalExports = 0;
  const fileExports = [];

  files.forEach(f => {
    const full = path.join(dir, f);
    const content = fs.readFileSync(full, 'utf-8');
    const sf = ts.createSourceFile(f, content, ts.ScriptTarget.Latest, true);
    let count = 0;
    const names = [];

    ts.forEachChild(sf, node => {
      const isExported = (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0;
      if (isExported) {
        if (ts.isFunctionDeclaration(node) && node.name) { names.push(node.name.text); count++; }
        else if (ts.isVariableStatement(node)) {
          node.declarationList.declarations.forEach(d => { if (d.name) { names.push(d.name.getText(sf)); count++; } });
        }
        else if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isEnumDeclaration(node)) {
          names.push(node.name.text); count++;
        }
      } else if (ts.isExportDeclaration(node)) {
        if (node.exportClause && ts.isNamedExports(node.exportClause)) {
          node.exportClause.elements.forEach(e => { names.push(e.name.text); count++; });
        }
      }
    });

    totalExports += count;
    fileExports.push({ file: f, count, names });
  });

  console.log(`Domain directory has ${files.length} files with a total of ${totalExports} public exports!`);
  fileExports.sort((a,b) => b.count - a.count).slice(0, 10).forEach(fe => {
    console.log(`  - ${fe.file}: ${fe.count} exports (e.g. ${fe.names.slice(0, 4).join(', ')})`);
  });
}

getDomainExports();
