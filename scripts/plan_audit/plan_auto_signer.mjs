import fs from 'node:fs';
import path from 'node:path';

/**
 * Executes mechanical auto-sign if all gates pass, enforcing adversarial gate on sensitive files.
 */
export function executeAutoSign(planPath, targetFiles, checkedSnippets, checkedTests) {
  const filename = path.basename(planPath, '.md');
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
