// [IMP-416] Living Contract Suite — Server Transitional Shims Decommission & Direct Protocol Wiring
// Traceability: [TC-416.01..TC-416.05], [UC-SERVER-SHIMS-STUB-AND-PRODUCTION-DECOUPLING],
//               [UC-WIRE-ENCODER-FACADE-PARITY], [UC-ADMIN-MANAGER-OPTIONS-AND-CONSTANTS-WIRING],
//               [UC-ZERO-CYCLIC-POLLUTION], [UC-BACKWARD-COMPAT-STUB-PARITY]
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import {
  encodeMsg,
  type WsServerMessage,
  type DeltaPayload,
} from '../../src/domain/protocol/index.js';
import { RoomManager } from '../../src/server/room_manager.js';
import { MAX_ROOM_LOGS as STORE_MAX_LOGS } from '../../src/server/network/admin_event_store.js';
import {
  MAX_ROOM_LOGS as MGR_MAX_LOGS,
  type AdminManagerOptions,
} from '../../src/server/network/admin_manager.js';
import { encodeMsg as shimEncodeMsg } from '../../src/server/network/network_types.js';
import { MAX_ROOM_LOGS as SHIM_MAX_LOGS } from '../../src/server/network/admin_types.js';
import { detectCycles } from '../../scripts/boundary_linter/boundary_rules.mjs';

const REPO_ROOT = process.cwd();

function parseImportSpecifiers(sourceText: string): string[] {
  const sf = ts.createSourceFile('temp.ts', sourceText, ts.ScriptTarget.Latest, true);
  const specifiers: string[] = [];
  for (const stmt of sf.statements) {
    if (
      (ts.isImportDeclaration(stmt) || ts.isExportDeclaration(stmt)) &&
      stmt.moduleSpecifier &&
      ts.isStringLiteral(stmt.moduleSpecifier)
    ) {
      specifiers.push(stmt.moduleSpecifier.text);
    }
  }
  return specifiers;
}

function collectTsFiles(dirPath: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dirPath)) return results;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectTsFiles(fullPath));
    } else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

function scanSrcForTransitionalShimImports(): string[] {
  const srcDir = path.resolve(REPO_ROOT, 'src');
  const allFiles = collectTsFiles(srcDir);
  const shimFiles = new Set([
    path.resolve(REPO_ROOT, 'src/server/delta_types.ts'),
    path.resolve(REPO_ROOT, 'src/server/network/network_types.ts'),
    path.resolve(REPO_ROOT, 'src/server/network/admin_types.ts'),
  ]);

  const violations: string[] = [];
  for (const file of allFiles) {
    if (shimFiles.has(path.resolve(file))) continue;
    const content = fs.readFileSync(file, 'utf8');
    const specifiers = parseImportSpecifiers(content);
    const hasShimImport = specifiers.some(
      (spec) =>
        spec.includes('delta_types') ||
        spec.includes('network_types') ||
        spec.includes('admin_types'),
    );
    if (hasShimImport) {
      violations.push(path.relative(REPO_ROOT, file).replace(/\\/g, '/'));
    }
  }
  return violations;
}

function getNonCommentLines(filePath: string): string[] {
  const fullPath = path.resolve(REPO_ROOT, filePath);
  if (!fs.existsSync(fullPath)) return [];
  return fs
    .readFileSync(fullPath, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('//') && !l.startsWith('/*') && !l.startsWith('*'));
}

describe('[IMP-416] Server Transitional Shims Decommission Living Contracts', () => {
  describe('[TC-416.01/MSS] [UC-SERVER-SHIMS-STUB-AND-PRODUCTION-DECOUPLING] Production Decoupling & Stub Line Limit', () => {
    it('[TC-416.01/MSS] verifies 0 production files outside the stubs import from transitional shims', () => {
      const violations = scanSrcForTransitionalShimImports();
      expect(violations).toEqual([]);
    });

    it('[TC-416.01/MSS] verifies transitional shims are minimal stubs <= 3 non-comment lines', () => {
      const deltaLines = getNonCommentLines('src/server/delta_types.ts');
      expect(deltaLines.length).toBeLessThanOrEqual(3);

      const networkLines = getNonCommentLines('src/server/network/network_types.ts');
      expect(networkLines.length).toBeLessThanOrEqual(3);

      const adminLines = getNonCommentLines('src/server/network/admin_types.ts');
      expect(adminLines.length).toBeLessThanOrEqual(3);
    });
  });

  describe('[TC-416.02/MSS] [UC-WIRE-ENCODER-FACADE-PARITY] Wire Message Serialization Facade Parity', () => {
    it('[TC-416.02/MSS] serializes ROOM_STARTED and ERROR messages deterministically with distinct outputs', () => {
      const msg1: WsServerMessage = { type: 'ROOM_STARTED', roomCode: 'ROOM416' };
      const msg2: WsServerMessage = { type: 'ERROR', reasonCode: 'ROOM_NOT_FOUND' };
      const str1 = encodeMsg(msg1);
      const str2 = encodeMsg(msg2);

      expect(str1).toBe('{"type":"ROOM_STARTED","roomCode":"ROOM416"}');
      expect(str2).toBe('{"type":"ERROR","reasonCode":"ROOM_NOT_FOUND"}');
      expect(str1).not.toBe(str2);
    });

    it('[TC-416.02/MSS] serializes SESSION_INIT and DELTA messages deterministically with distinct outputs', () => {
      const deltaPayload: DeltaPayload = { tick: 416, cells: [] };
      const msgSession: WsServerMessage = {
        type: 'SESSION_INIT',
        playerId: 'p1',
        reconnectToken: 'tok_abc',
        roomCode: 'R416',
      };
      const msgDelta: WsServerMessage = { type: 'DELTA', delta: deltaPayload };
      const strSession = encodeMsg(msgSession);
      const strDelta = encodeMsg(msgDelta);

      expect(strSession).toBe('{"type":"SESSION_INIT","playerId":"p1","reconnectToken":"tok_abc","roomCode":"R416"}');
      expect(strDelta).toBe('{"type":"DELTA","delta":{"tick":416,"cells":[]}}');
      expect(strSession).not.toBe(strDelta);
    });
  });

  describe('[TC-416.03/MSS] [UC-ADMIN-MANAGER-OPTIONS-AND-CONSTANTS-WIRING] Admin Manager Options & Constants Wiring', () => {
    it('[TC-416.03/MSS] verifies MAX_ROOM_LOGS constant is 100 in event store and admin manager', () => {
      expect(STORE_MAX_LOGS).toBe(100);
      expect(MGR_MAX_LOGS).toBe(100);
    });

    it('[TC-416.03/MSS] validates AdminManagerOptions contract typing and property preservation', () => {
      const roomManager = new RoomManager();
      const opts: AdminManagerOptions = {
        roomManager,
        secret: 'top_secret',
        loggerDir: './test_logs',
      };

      expect(opts.secret).toBe('top_secret');
      expect(opts.loggerDir).toBe('./test_logs');
      expect(opts.roomManager).toBe(roomManager);
    });
  });

  describe('[TC-416.04/MSS] [UC-ZERO-CYCLIC-POLLUTION] Tarjan Dependency Graph Cycle Verification', () => {
    it('[TC-416.04/MSS] verifies protocol facade has zero cycles in project dependency graph', () => {
      const files = collectTsFiles(path.resolve(REPO_ROOT, 'src'));
      const cycles = detectCycles(files, REPO_ROOT);
      const protocolCycle = cycles.find((c) => c.some((f) => f.includes('domain/protocol/index.ts')));

      expect(protocolCycle).toBeUndefined();
      expect(cycles.length).toBeLessThanOrEqual(8);
    });
  });

  describe('[TC-416.05/MSS] [UC-BACKWARD-COMPAT-STUB-PARITY] Backward Compatibility Stubs Parity', () => {
    it('[TC-416.05/MSS] validates backward compatibility of network_types and admin_types stubs', () => {
      const testMsg: WsServerMessage = { type: 'PING', roomCode: 'R_PING' };
      const canonicalEncoded = JSON.stringify(testMsg);

      expect(shimEncodeMsg(testMsg)).toBe(canonicalEncoded);
      expect(SHIM_MAX_LOGS).toBe(100);
    });
  });
});
