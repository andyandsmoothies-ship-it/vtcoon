import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const sccFiles = [
  'src/server/turn_loop_maintenance.ts',
  'src/server/session_proxy_facade.ts',
  'src/server/delta_mapper.ts',
  'src/server/session_manager.ts',
  'src/server/room_manager_queries.ts',
  'src/server/transit_wheel_handler.ts',
  'src/server/network/afk_recovery.ts',
  'src/server/intent_dispatcher.ts',
  'src/server/trade_coordinator_helper.ts',
  'src/server/room_trade_coordinator.ts',
  'src/server/room_property_coordinator.ts',
  'src/server/game_room_session.ts',
  'src/server/room_manager_lifecycle.ts',
  'src/server/room_auction_coordinator.ts',
  'src/server/room_bot_coordinator.ts',
  'src/server/room_manager.ts',
  'src/server/mortgage_manager.ts',
  'src/server/turn_loop.ts',
  'src/server/insolvency_manager.ts',
  'src/server/bond_manager.ts',
  'src/server/auction_manager.ts'
].map(f => path.resolve(f));

const fileSet = new Set(sccFiles);

for (const file of sccFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);
  const relFrom = path.relative(process.cwd(), file).replace(/\\/g, '/');
  ts.forEachChild(sf, function visit(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const spec = node.moduleSpecifier.text;
      if (spec.startsWith('.')) {
        let target = path.resolve(path.dirname(file), spec);
        target = target.replace(/\.jsx?$/, '');
        for (const ext of ['.ts', '.tsx', '/index.ts']) {
          const candidate = path.resolve(target + ext);
          if (fileSet.has(candidate)) {
            const relTo = path.relative(process.cwd(), candidate).replace(/\\/g, '/');
            // Check if it's type only or value import
            const isTypeOnly = ts.isImportDeclaration(node) && node.importClause && node.importClause.isTypeOnly;
            console.log(`${relFrom} -> ${relTo} (typeOnly: ${Boolean(isTypeOnly)})`);
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  });
}
