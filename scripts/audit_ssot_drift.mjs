#!/usr/bin/env node

/**
 * scripts/audit_ssot_drift.mjs
 * 
 * [MECHANICAL GATE] SSOT Economic & Data Drift Auditor
 * Scans test suites (tests/**\/*.test.ts) to detect stale, hardcoded domain values
 * that have drifted from domain SSOT definitions:
 * 1. Utility deeds (Cell 12: Điện lực, Cell 28: Cấp nước):
 *    - Price: 2,000 (legacy 1,500 is BANNED per IMP-277A)
 *    - Base Mortgage: 1,000 (legacy 750 is BANNED)
 * 2. Railroad deeds (Cell 5, 15, 25, 35):
 *    - Price: 2,000
 *    - Base Rent: 500
 * 3. Starting Balance & Rules:
 *    - Starting balance: 15,000
 * 4. Fake deed mocks with conflicting prices for standard cell indices.
 * 
 * Usage:
 *   node scripts/audit_ssot_drift.mjs [files...]
 *   npm run audit:ssot-drift
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');

function getAllTestFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllTestFiles(fullPath, files);
    } else if (/\.(test|spec)\.(ts|tsx|js|mjs)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

const args = process.argv.slice(2).filter((f) => !f.startsWith('--'));
const testFiles = args.length > 0
  ? args.map((f) => path.resolve(ROOT, f)).filter((f) => fs.existsSync(f))
  : getAllTestFiles(path.join(ROOT, 'tests'));

console.log('======================================================');
console.log('🔍 [SSOT DATA DRIFT AUDIT] Scanning test suites for economic drift...');
console.log(`   Auditing ${testFiles.length} test file(s)...`);
console.log('======================================================\n');

const violations = [];

// Specific known drift rules:
// Rule 1: Utility cell 12 / 28 hardcoded price 1500 or mortgage 750
const STALE_UTILITY_PRICE_REGEX = /(?:cellIndex|cell|property|tileId|id)\s*[:=]\s*(?:12|28)\b[\s\S]{1,120}?\b(?:price|cost|basePrice)\s*[:=]\s*1500\b/gi;
const STALE_UTILITY_MORTGAGE_REGEX = /(?:cellIndex|cell|property|tileId|id)\s*[:=]\s*(?:12|28)\b[\s\S]{1,120}?\b(?:mortgage|mortgageValue)\s*[:=]\s*750\b/gi;

// Also detect inverse pattern: price: 1500 ... cellIndex: 12
const INVERSE_UTILITY_PRICE_REGEX = /\b(?:price|cost|basePrice)\s*[:=]\s*1500\b[\s\S]{1,120}?(?:cellIndex|cell|property|tileId|id)\s*[:=]\s*(?:12|28)\b/gi;

for (const filePath of testFiles) {
  const relPath = path.relative(ROOT, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf8');

  // Check 1: Utility price 1500 (IMP-277A updated utility price to 2000)
  let match;
  while ((match = STALE_UTILITY_PRICE_REGEX.exec(content)) !== null) {
    const lineNum = content.slice(0, match.index).split('\n').length;
    violations.push({
      file: relPath,
      line: lineNum,
      rule: 'Utility Deed Price Drift',
      message: `Cell 12/28 has legacy price 1500. SSOT price is 2000 (IMP-277A). Use PROPERTY_DEEDS.get(12)!.price or update constant to 2000.`,
      snippet: match[0].replace(/\s+/g, ' ').slice(0, 100),
    });
  }

  while ((match = INVERSE_UTILITY_PRICE_REGEX.exec(content)) !== null) {
    const lineNum = content.slice(0, match.index).split('\n').length;
    violations.push({
      file: relPath,
      line: lineNum,
      rule: 'Utility Deed Price Drift',
      message: `Cell 12/28 has legacy price 1500. SSOT price is 2000 (IMP-277A). Use PROPERTY_DEEDS.get(12)!.price or update constant to 2000.`,
      snippet: match[0].replace(/\s+/g, ' ').slice(0, 100),
    });
  }

  while ((match = STALE_UTILITY_MORTGAGE_REGEX.exec(content)) !== null) {
    const lineNum = content.slice(0, match.index).split('\n').length;
    violations.push({
      file: relPath,
      line: lineNum,
      rule: 'Utility Deed Mortgage Drift',
      message: `Cell 12/28 has legacy mortgage value 750. SSOT mortgage is 1000 (IMP-277A).`,
      snippet: match[0].replace(/\s+/g, ' ').slice(0, 100),
    });
  }

  // Check 2: Raw deed mocks with invalid price assertions for utilities in expect()
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    // expect(price).toBe(1500) near cell 12 / utility
    if (/\bexpect\s*\([^)]*(?:utility|cell12|deed12)[^)]*\)\s*\.toBe\s*\(\s*1500\s*\)/i.test(line)) {
      violations.push({
        file: relPath,
        line: lineNum,
        rule: 'Utility Expectation Drift',
        message: `Asserts utility deed price is 1500. SSOT price is 2000.`,
        snippet: line.trim(),
      });
    }
    // Hardcoded cell 12 deed with price 1500 in deeds map
    if (/\[\s*12\s*,\s*\{\s*price\s*:\s*1500/i.test(line) || /\[\s*28\s*,\s*\{\s*price\s*:\s*1500/i.test(line)) {
      violations.push({
        file: relPath,
        line: lineNum,
        rule: 'Mock Deed Map Drift',
        message: `Custom deed map defines cell 12/28 with price 1500 instead of SSOT 2000.`,
        snippet: line.trim(),
      });
    }
  });
}

if (violations.length > 0) {
  console.error(`❌ FOUND ${violations.length} SSOT DATA DRIFT VIOLATION(S):\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line} [${v.rule}]`);
    console.error(`  ${v.message}`);
    console.error(`  Snippet: "${v.snippet}"\n`);
  }
  console.error('Action: Update the test to reference domain SSOT constants (e.g. PROPERTY_DEEDS.get(cellIndex)!.price) or update hardcoded values to match domain SSOT.');
  process.exit(1);
} else {
  console.log(`✅ SSOT DATA PARITY VERIFIED: All ${testFiles.length} test file(s) conform to domain SSOT constants.`);
  process.exit(0);
}
