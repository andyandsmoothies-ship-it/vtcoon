#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {
  auditScopeAndSubsystems,
  auditHonestLocAccounting,
  auditPlanSnippetHygiene,
  auditTestSpecLine,
  auditScopeConservation,
  auditPureLogicWaiver,
  collectExportedSymbols,
  auditPhysicalVisualMandate,
  auditStateDependencyScope,
  auditFunctionToTestParity,
  auditFsmQueueCombinatorialCoverage,
} from './audit_plan_rules.mjs';

/**
 * Mechanical Pre-Flight Auditor for AI-Generated Implementation Plans.
 * Fast, 0-token physical verification against real disk files:
 * 1. Ghost file detection (Target files must physically exist).
 * 2. Snippet match verification (TargetContent must match uniquely in target file).
 * 3. Physical line count baseline audit.
 * 4. Zero Dirty Cast detection (`as any`, `as unknown as`).
 * 5. Banned & Unimplementable Test Pattern detection (GC churn, benchmark, typeof).
 * 6. Store State vs Action SRP Separation audit (no functions in State data shape).
 */

const args = process.argv.slice(2);
const autoSign = args.includes('--auto-sign');
const planPath = args.find((a) => !a.startsWith('--'));

if (!planPath) {
  console.error('Usage: node scripts/audit_plan.mjs <path-to-plan.md> [--auto-sign]');
  process.exit(1);
}

if (!fs.existsSync(planPath)) {
  console.error(`❌ Plan file not found: ${planPath}`);
  process.exit(1);
}

const planContent = fs.readFileSync(planPath, 'utf8');
const snippetRegex = /`{3,}(?:typescript|tsx|javascript|json|html|css)?\s*\n<<<<\s*\n([\s\S]*?)\n====\s*\n([\s\S]*?)\n>>>>\s*\n`{3,}/g;
const fileTargetRegex = /(?:\*\*Target physical file\*\*|\*\*Target File\*\*|Target physical file|Target file):\s*[`']?([^\n`']+\.[a-zA-Z0-9]+)[`']?([^\n]*)/gi;

function findSourceFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findSourceFiles(full));
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

let errors = 0;
let checkedSnippets = 0;
let checkedTests = 0;

console.log(`\n🔍 [AUDIT-PLAN] Pre-flight mechanical audit for: ${path.basename(planPath)}`);

// 0. Check for Ticket ID Collision in .agents/plans/
const planBasename = path.basename(planPath);
const plansDir = path.dirname(path.resolve(planPath));
const currentTicketMatch = planBasename.match(/PLAN_([A-Z0-9]+(?:[-_][A-Z0-9]+)?)/i);
if (currentTicketMatch && fs.existsSync(plansDir)) {
  const currentTicketId = currentTicketMatch[1].replace(/_/g, '-').toUpperCase();
  const collidingPlans = fs.readdirSync(plansDir).filter((f) => {
    if (f === planBasename || !f.startsWith('PLAN_') || !f.endsWith('.md')) return false;
    const match = f.match(/PLAN_([A-Z0-9]+(?:[-_][A-Z0-9]+)?)/i);
    if (!match) return false;
    const otherTicketId = match[1].replace(/_/g, '-').toUpperCase();
    return otherTicketId === currentTicketId;
  });

  if (collidingPlans.length > 0) {
    console.warn(`⚠️  [TICKET COLLISION WARNING] Ticket ID '${currentTicketId}' is already used by another plan in .agents/plans/:`);
    for (const cp of collidingPlans) {
      console.warn(`   - ${cp}`);
    }
    console.warn(`   Ensure this is intentional, or suffix the new ticket (e.g. ${currentTicketId}B) to avoid ambiguity.\n`);
  }
}

// ==========================================
// 1. Scan target files for existence and LOC
// ==========================================
const targetFiles = new Map();
let fileMatch;
while ((fileMatch = fileTargetRegex.exec(planContent)) !== null) {
  const filePath = fileMatch[1].trim().replace(/^[`'\s]+|[`'\s]+$/g, '');
  const trailingText = (fileMatch[2] || '').toLowerCase();
  const isNew = trailingText.includes('new') || trailingText.includes('create') || trailingText.includes('mới');
  targetFiles.set(filePath, isNew);
}

console.log(`\n📁 Checking ${targetFiles.size} target files for existence and line count:`);
for (const [relPath, isNew] of targetFiles.entries()) {
  const absPath = path.resolve(process.cwd(), relPath);
  if (!fs.existsSync(absPath)) {
    if (isNew) {
      console.log(`  ✔️ ${relPath} (New file to be created in Station 1/2)`);
    } else {
      console.error(`  ❌ GHOST FILE: ${relPath} does not exist on disk!`);
      errors++;
    }
  } else {
    const linesArr = fs.readFileSync(absPath, 'utf8').split('\n');
    if (linesArr.length > 0 && linesArr[linesArr.length - 1] === '') {
      linesArr.pop();
    }
    const lines = linesArr.length;
    console.log(`  ✔️ ${relPath} (Physical lines: ${lines})`);
  }
}

// Pre-scan all snippets per file to compute physical LOC deltas
const fileSnippetsMap = new Map();
const snippetDeltaByFile = new Map();
const preSections = planContent.split(/(?=#{2,4}\s+Task|\*\*Target physical file\*\*|\*\*Target File\*\*)/i);
for (const sec of preSections) {
  const fMatch = fileTargetRegex.exec(sec);
  fileTargetRegex.lastIndex = 0;
  if (!fMatch) continue;
  const relPath = fMatch[1].trim().replace(/^[`'\s]+|[`'\s]+$/g, '');
  if (!fileSnippetsMap.has(relPath)) fileSnippetsMap.set(relPath, []);
  let snipMatch;
  while ((snipMatch = snippetRegex.exec(sec)) !== null) {
    const targetChunk = snipMatch[1];
    const replacementChunk = snipMatch[2];
    fileSnippetsMap.get(relPath).push(replacementChunk);
    const targetLines = targetChunk.replace(/\r\n/g, '\n').split('\n').length;
    const repLines = replacementChunk.replace(/\r\n/g, '\n').split('\n').length;
    const delta = repLines - targetLines;
    snippetDeltaByFile.set(relPath, (snippetDeltaByFile.get(relPath) || 0) + delta);
  }
  snippetRegex.lastIndex = 0;
}

// ==========================================
// 1.0.1 Auto-Slicing, Scope & LOC Accounting
// ==========================================
console.log(`\n📐 Checking Auto-Slicing Protocol & Scope Confinement:`);
errors += auditScopeAndSubsystems(targetFiles);
errors += auditHonestLocAccounting(targetFiles, planContent, snippetDeltaByFile);
errors += auditScopeConservation(planContent);
errors += auditPureLogicWaiver(targetFiles, planContent);
errors += auditPhysicalVisualMandate(targetFiles, planContent);
errors += auditStateDependencyScope(targetFiles, planContent);
errors += auditFsmQueueCombinatorialCoverage(planContent);

// ==========================================
// 1.1 Verify new production file code specification
// ==========================================
console.log(`\n📄 Checking code specifications for newly declared files:`);
for (const [relPath, isNew] of targetFiles.entries()) {
  const isProd = /^(?:src|lib|app)[\\/]/.test(relPath);
  if (isNew && isProd) {
    const escapedRel = relPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedName = path.basename(relPath).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const newFileCodeRegex = new RegExp(
      `(?:${escapedRel}|${escapedName})[\\s\\S]{0,500}?\`\`\`(?:typescript|tsx|javascript|json|html|css)?\\s*\\n([\\s\\S]+?)\\n\`\`\``,
      'i'
    );
    const codeMatch = planContent.match(newFileCodeRegex);
    if (!codeMatch || codeMatch[1].trim().split('\n').length < 3) {
      console.error(`  ❌ MISSING CODE SPEC: New production file '${relPath}' has no code snippet or interface specification in plan!`);
      errors++;
    } else {
      console.log(`  ✔️ Verified code specification for new file: ${relPath}`);
      const newCode = codeMatch[1];
      if (/\breadystate\s*[!=]==?\s*[0-3]\b/i.test(newCode)) {
        console.error(`  ❌ MAGIC NUMBER READYSTATE in new file ${relPath}: Direct comparison to raw number (0/1/2/3). Use WebSocket.OPEN / CONNECTING / CLOSING / CLOSED.`);
        errors++;
      }
      const newShallowWrapperRegex = /(?:async\s+)?(?:public\s+|private\s+|protected\s+)?(?:static\s+)?\w+\s*\([^)]*\)\s*(?::\s*[^{\n]+)?\s*\{\s*(?:return\s+)?this\.[a-zA-Z0-9_$]+\.[a-zA-Z0-9_$]+\([^)]*\);\s*\}/g;
      let sMatch;
      while ((sMatch = newShallowWrapperRegex.exec(newCode)) !== null) {
        console.error(`  ❌ SHALLOW PASS-THROUGH WRAPPER in new file ${relPath}:`);
        console.error(`     ${sMatch[0].replace(/\s+/g, ' ')}`);
        console.error(`     1-line delegation violates deep module principles. Keep logic in parent or let callers consume module directly.`);
        errors++;
      }
      if (/\b(?:from\s+['"]node:|(?:import|require)\s*\(\s*['"]node:)/.test(newCode)) {
        const baseName = path.basename(relPath).replace(/\.[^.]+$/, '');
        const clientFiles = fs.existsSync('src/client') ? findSourceFiles('src/client') : [];
        for (const cPath of clientFiles) {
          const cContent = fs.readFileSync(cPath, 'utf8');
          if (new RegExp(`from\\s+['"][^'"]*\\b${baseName}(?:\\.js)?['"]`).test(cContent)) {
            console.error(`  ❌ CLIENT BUNDLE POISONING: New file '${relPath}' imports Node built-in, but is imported by client file '${path.relative(process.cwd(), cPath)}'!`);
            errors++;
            break;
          }
        }
      }
      // 1.2 Anti-TIDD Consumer Check for public methods, exported functions & components in new files
      const declaredEntities = new Set();
      const ignoredNames = new Set(['constructor', 'init', 'destroy', 'dispose', 'cleanup', 'render', 'toString', 'valueOf', 'default']);

      // 1.2.1 Class methods on classes (e.g. "class Foo { ... method() { ... } }")
      const classBlockRegex = /class\s+[A-Za-z0-9_$]+[^{]*\{([\s\S]*?)\n\s*\}/g;
      let clMatch;
      while ((clMatch = classBlockRegex.exec(newCode)) !== null) {
        const classBody = clMatch[1];
        const methodRegex = /(?:public\s+)?([a-zA-Z0-9_$]+)\s*\([^)]*\)\s*(?::\s*[^{\n]+)?\s*\{/g;
        let mMatch;
        while ((mMatch = methodRegex.exec(classBody)) !== null) {
          declaredEntities.add({ name: mMatch[1], kind: 'Class Method' });
        }
      }

      // 1.2.2 Standalone exported functions (only EXPORTED functions)
      const exportFuncRegex = /export\s+(?:async\s+)?function\s+([a-zA-Z0-9_$]+)\s*[\(<]/g;
      let fMatch;
      while ((fMatch = exportFuncRegex.exec(newCode)) !== null) {
        declaredEntities.add({ name: fMatch[1], kind: 'Exported Function' });
      }

      // 1.2.3 Exported components / arrow functions
      const exportConstRegex = /export\s+const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:React\.memo\()?(?:React\.forwardRef\()?(?:async\s+)?(?:\([^)]*\)|[a-zA-Z0-9_$]+)\s*=>/g;
      let cMatch;
      while ((cMatch = exportConstRegex.exec(newCode)) !== null) {
        declaredEntities.add({ name: cMatch[1], kind: 'Exported Component/Function' });
      }

      // Collect all production code in plan (replacement snippets in other files + other new files)
      const otherProductionCodeChunks = [];
      const tempSections = planContent.split(/(?=#{2,4}\s+Task|\*\*Target physical file\*\*|\*\*Target File\*\*)/i);
      for (const tSec of tempSections) {
        const tfMatch = fileTargetRegex.exec(tSec);
        fileTargetRegex.lastIndex = 0;
        if (!tfMatch) continue;
        const targetRel = tfMatch[1].trim().replace(/^[`'\s]+|[`'\s]+$/g, '');
        if (targetRel !== relPath && /^(?:src|lib|app)[\\/]/.test(targetRel)) {
          let sMatch;
          while ((sMatch = snippetRegex.exec(tSec)) !== null) {
            otherProductionCodeChunks.push(sMatch[2]);
          }
          snippetRegex.lastIndex = 0;
          // Also grab any full code block for other new files
          const otherCodeBlockRegex = /```(?:typescript|tsx|javascript|json|html|css)?\s*\n([\s\S]+?)\n```/g;
          let ocMatch;
          while ((ocMatch = otherCodeBlockRegex.exec(tSec)) !== null) {
            otherProductionCodeChunks.push(ocMatch[1]);
          }
          // Also include the task section text itself (supports Lean Contract Specifications without forced snippets)
          otherProductionCodeChunks.push(tSec);
        }
      }

      const srcFiles = fs.existsSync('src') ? findSourceFiles('src') : [];

      for (const { name: entityName, kind } of declaredEntities) {
        if (ignoredNames.has(entityName) || entityName.startsWith('_')) continue;
        const entityBoundaryRegex = new RegExp(`\\b${entityName}\\b`);

        // Check 1: Referenced in any replacement snippet or code block of other files in plan
        let calledInOtherPlanFiles = false;
        for (const chunk of otherProductionCodeChunks) {
          if (entityBoundaryRegex.test(chunk)) {
            calledInOtherPlanFiles = true;
            break;
          }
        }

        // Check 2: Referenced in any existing file on physical disk in src/ (excluding this file)
        let foundInExistingSrc = false;
        if (!calledInOtherPlanFiles) {
          for (const sPath of srcFiles) {
            if (sPath.endsWith(path.basename(relPath))) continue;
            if (entityBoundaryRegex.test(fs.readFileSync(sPath, 'utf8'))) {
              foundInExistingSrc = true;
              break;
            }
          }
        }

        // Check 0: Called internally by another function in the same file
        const internalOccurrences = (newCode.match(new RegExp(`\\b${entityName}\\b`, 'g')) || []).length;
        const calledInternally = internalOccurrences > 1;

        if (!calledInOtherPlanFiles && !foundInExistingSrc && !calledInternally) {
          console.error(`  ❌ DEAD CODE / ZERO PRODUCTION CONSUMER: ${kind} '${entityName}' in '${relPath}' has no callers in any other production file, plan replacement snippets, or within the module! (Anti-TIDD Rule 8)`);
          errors++;
        }
      }
    }
  }
}

// ==========================================
// 2. Scan drop-in snippets for verbatim match,
//    dirty casts, and State/Action SRP
// ==========================================
console.log(`\n🧩 Checking drop-in snippets and replacement integrity:`);
const sections = planContent.split(/(?=#{2,4}\s+Task|\*\*Target physical file\*\*|\*\*Target File\*\*)/i);
for (const sec of sections) {
  const fMatch = fileTargetRegex.exec(sec);
  fileTargetRegex.lastIndex = 0;
  if (!fMatch) continue;
  const relPath = fMatch[1].trim().replace(/^[`'\s]+|[`'\s]+$/g, '');
  const absPath = path.resolve(process.cwd(), relPath);
  if (!fs.existsSync(absPath)) continue;

  const fileContent = fs.readFileSync(absPath, 'utf8');
  let snipMatch;
  while ((snipMatch = snippetRegex.exec(sec)) !== null) {
    checkedSnippets++;
    const targetChunk = snipMatch[1];
    const replacementChunk = snipMatch[2];
    const normalizedTarget = targetChunk.replace(/\r\n/g, '\n').trim();
    const normalizedFile = fileContent.replace(/\r\n/g, '\n');

    // 2.1 Verbatim match
    if (!normalizedFile.includes(normalizedTarget)) {
      console.error(`  ❌ SNIPPET MISMATCH in ${relPath}:`);
      console.error(`     TargetContent not found verbatim in disk file!`);
      errors++;
    } else {
      const matchCount = normalizedFile.split(normalizedTarget).length - 1;
      if (matchCount > 1) {
        console.warn(`  ⚠️ AMBIGUOUS MATCH in ${relPath}: TargetContent matches ${matchCount} times!`);
      } else {
        console.log(`  ✔️ Verified drop-in snippet for: ${relPath} (Unique match)`);
      }
    }

    // 2.2 Dirty cast check: as any / as unknown as
    if (/\bas\s+any\b|\bas\s+unknown\s+as\b/.test(replacementChunk)) {
      console.error(`  ❌ DIRTY CAST VIOLATION in ${relPath}: Proposed snippet contains forbidden 'as any' or 'as unknown as'!`);
      errors++;
    }

    // 2.3 Magic Number readyState check (use WebSocket.OPEN / CONNECTING / CLOSING / CLOSED)
    if (/\breadystate\s*[!=]==?\s*[0-3]\b/i.test(replacementChunk)) {
      console.error(`  ❌ MAGIC NUMBER READYSTATE in ${relPath}: Direct comparison to raw number (0/1/2/3). Use WebSocket.OPEN / CONNECTING / CLOSING / CLOSED.`);
      errors++;
    }

    // 2.4 Shallow 1-line pass-through wrapper check
    const shallowWrapperRegex = /(?:async\s+)?(?:public\s+|private\s+|protected\s+)?(?:static\s+)?\w+\s*\([^)]*\)\s*(?::\s*[^{\n]+)?\s*\{\s*(?:return\s+)?this\.[a-zA-Z0-9_$]+\.[a-zA-Z0-9_$]+\([^)]*\);\s*\}/g;
    let shallowMatch;
    while ((shallowMatch = shallowWrapperRegex.exec(replacementChunk)) !== null) {
      console.error(`  ❌ SHALLOW PASS-THROUGH WRAPPER in ${relPath}:`);
      console.error(`     ${shallowMatch[0].replace(/\s+/g, ' ')}`);
      console.error(`     1-line delegation violates deep module principles. Keep logic in parent or let callers consume module directly.`);
      errors++;
    }

    // 2.5 Store State vs Action SRP Separation Guard
    if (/store.*types?\.ts|state.*types?\.ts/i.test(relPath)) {
      // Check if function added into INITIAL_GAME_STATE plain data object
      if (/INITIAL_GAME_STATE[\s\S]*?(?:set|toggle|dispatch)[A-Z]\w*\s*:/i.test(replacementChunk)) {
        console.error(`  ❌ STATE/ACTION SRP VIOLATION in ${relPath}: Action creator found in INITIAL_GAME_STATE! Plain state data objects must not store actions.`);
        errors++;
      }
      // Check if action creator picked in InitialGameState data type
      if (/InitialGameState\s*=\s*Pick<[\s\S]*?['"](?:set|toggle|dispatch)[A-Z]\w*['"]/i.test(replacementChunk)) {
        console.error(`  ❌ STATE/ACTION SRP VIOLATION in ${relPath}: Action creator picked in InitialGameState! InitialGameState must only pick serializable data.`);
        errors++;
      }
      // Check if action function added directly inside data properties section of GameState
      if (/(?:activeModifiers|isHeatmapActive|turnTimeRemaining|roundNumber)[\s\S]*?(?:readonly\s+)?(?:set|toggle|dispatch)[A-Z]\w*\s*:\s*\([^)]*\)\s*=>/i.test(replacementChunk)) {
        console.error(`  ❌ STATE/ACTION SRP VIOLATION in ${relPath}: Action creator signature added directly into data properties section of GameState interface! Action creators belong in store actions.`);
        errors++;
      }
    }

    // 2.6 Project-specific spatial baseline guard (floating_numbers / HUD)
    if (/floating_numbers\.tsx/i.test(relPath)) {
      if (/(?:60\.\.275|y\s*=\s*60)/i.test(sec)) {
        console.error(`  ❌ INVALID_HUD_SPATIAL_BASELINE in ${relPath}: Mobile PlayerHudList height is y = 73..461px (4 cards ~376px + TopBar ~66px). Mental math (60..275px) banned.`);
        errors++;
      }
    }

    // 2.7 Anti-Code-Golf & Line Squishing Guard
    if (/(?:get|set)\s+\w+\s*\([^)]*\)\s*\{\s*return\s+[^;]+;\s*\}\s*(?:get|set)\s+\w+/.test(replacementChunk)) {
      console.error(`  ❌ CODE-GOLF VIOLATION in ${relPath}: Multiple getter/setter methods squished onto single line to game LOC budget!`);
      errors++;
    }

    // 2.8 Client Bundle Poisoning Guard
    if (/\b(?:from\s+['"]node:|(?:import|require)\s*\(\s*['"]node:)/.test(replacementChunk)) {
      const baseName = path.basename(relPath).replace(/\.[^.]+$/, '');
      const clientFiles = fs.existsSync('src/client') ? findSourceFiles('src/client') : [];
      for (const cPath of clientFiles) {
        const cContent = fs.readFileSync(cPath, 'utf8');
        if (new RegExp(`from\\s+['"][^'"]*\\b${baseName}(?:\\.js)?['"]`).test(cContent)) {
          console.error(`  ❌ CLIENT BUNDLE POISONING: '${relPath}' imports Node built-in, but is imported by client file '${path.relative(process.cwd(), cPath)}'!`);
          errors++;
          break;
        }
      }
    }

    // 2.9 Snippet Hygiene (Zero No-Op + Ban UI/DOM code dumps + Undeclared Refs + Aspect ratio)
    errors += auditPlanSnippetHygiene(relPath, targetChunk, replacementChunk, fileSnippetsMap.get(relPath) || []);
  }
}

// ==========================================
// 3. Scan Station 1 test specifications for
//    banned and unimplementable test patterns
// ==========================================
console.log(`\n🧪 Checking Station 1 test specifications for banned/unimplementable patterns:`);
const testSectionHeaderRegex = /(?:^|\n)#{1,4}\s+[^\n]*?(?:Station 1|QA|KIỂM THỬ|CONTRACT TEST|TEST SPEC)[^\n]*\n([\s\S]*?)(?=\n#{1,2}\s+[^\n]+|\n===\s+|$)/gi;

let testLines = [];
let tMatch;
while ((tMatch = testSectionHeaderRegex.exec(planContent)) !== null) {
  const secLines = tMatch[1].split('\n').filter((l) => /^\s*(?:[-*]|\d+\.)\s*.*?\bTC-[0-9A-Z_.]+/i.test(l));
  testLines.push(...secLines);
}

// Fallback: if no test lines found via headings, search whole document for list items starting with TC-
if (testLines.length === 0) {
  testLines = planContent.split('\n').filter((l) => /^\s*(?:[-*]|\d+\.)\s*.*?\bTC-[0-9A-Z_.]+/i.test(l));
}

if (testLines.length > 0) {
  const exportedSymbols = collectExportedSymbols('src', planContent);
  for (const line of testLines) {
    checkedTests++;
    errors += auditTestSpecLine(line, exportedSymbols);
  }
  console.log(`  ✔️ Scanned ${checkedTests} contract test specifications.`);
  errors += auditFunctionToTestParity(targetFiles, planContent);
} else {
  console.log(`  ℹ️ No Station 1 test specifications block detected in plan.`);
}

// ==========================================
// Summary & Plan Size Hygiene
// ==========================================
console.log(`\n========================================`);
const planLines = planContent.split('\n').length;
if (planLines > 600) {
  console.warn(`⚠️  PLAN SIZE WARNING: Plan has ${planLines} lines (> 600 lines).`);
  console.warn(`   Consider using Lean Contract Specifications (Type signatures & DTOs instead of full code implementations) to conserve tokens and speed up review.`);
} else {
  console.log(`📄 Plan length: ${planLines} lines (Lean Specification).`);
}

if (errors > 0) {
  console.error(`❌ AUDIT FAILED: ${errors} defect(s) detected. Fix plan before proceeding.`);
  process.exit(1);
} else {
  console.log(`✅ AUDIT PASSED: ${targetFiles.size} files verified, ${checkedSnippets} snippets match physical disk, ${checkedTests} test specs clean.`);

  if (autoSign) {
    const filename = path.basename(planPath, '.md');
    // Extract ticket ID e.g. PLAN_IMP_276B_EVENT_CARD_SYNC -> IMP-276B
    const ticketMatch = filename.match(/PLAN_([A-Z0-9]+(?:[-_][A-Z0-9]+)?)/i);
    const rawTicket = ticketMatch ? ticketMatch[1].replace(/_/g, '-') : filename.replace('PLAN_', '');
    const ticketId = rawTicket.toUpperCase();

    // [STATION 0 ADVERSARIAL GATE] Mechanical check for State/FSM/Lifecycle/Coordinator files
    const SENSITIVE_PATTERNS = /(?:fsm|state|store|pawn_animator|adaptive_cinematic_camera|turn_loop|turn_flow|insolvency|room_manager|treasury|economy|dice_tray)/i;
    const sensitiveFiles = Array.from(targetFiles.keys()).filter((f) => SENSITIVE_PATTERNS.test(f));

    if (sensitiveFiles.length > 0) {
      const challengeFile = path.resolve(process.cwd(), `.agents/audit/PLAN_CHALLENGE_${ticketId}.md`);
      const hasChallenge = fs.existsSync(challengeFile) && fs.readFileSync(challengeFile, 'utf8').trim().length > 100;
      if (!hasChallenge) {
        console.error(`\n🚨 [ADVERSARIAL GATE ENFORCED] Auto-sign is strictly FORBIDDEN!`);
        console.error(`   Ticket touches sensitive State/FSM/Lifecycle/Coordinator files:`);
        for (const sf of sensitiveFiles) console.error(`     - ${sf}`);
        console.error(`   Constitution mandates running 1 adversarial round with subagent 'adversarial-challenger'`);
        console.error(`   generating: .agents/audit/PLAN_CHALLENGE_${ticketId}.md (>= 100 bytes) before plan signoff.\n`);
        process.exit(1);
      }
    }

    const auditDir = path.resolve(process.cwd(), '.agents/audit');
    if (!fs.existsSync(auditDir)) fs.mkdirSync(auditDir, { recursive: true });

    const auditFilePath = path.join(auditDir, `PLAN_AUDIT_${ticketId}.md`);
    const auditContent = `# PLAN AUDIT REPORT: ${ticketId}

- **Auditor**: Mechanical Plan Auditor (\`scripts/audit_plan.mjs --auto-sign\`)
- **Date**: ${new Date().toISOString()}
- **Plan File**: \`${planPath}\`
- **Target Files Verified**: ${targetFiles.size}
- **Snippets Verified**: ${checkedSnippets}
- **Contract Tests Clean**: ${checkedTests}
- **Flow Taxonomy**: Compliant ([UC-.../MSS] and [UC-.../A#])
- **Anti-TIDD**: 0 orphaned production exports
- **Defects**: 0

## 🏁 HARD GATE VERDICT
**HARDENED_APPROVED**
`;
    fs.writeFileSync(auditFilePath, auditContent, 'utf8');
    console.log(`\n✍️ [AUTO-SIGN] Phán quyết HARDENED_APPROVED đã được tự động ký tại:\n   ${auditFilePath}`);
  }

  process.exit(0);
}
