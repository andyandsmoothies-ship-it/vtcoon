import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createTicketMatcher } from './evidence_resolver.mjs';

const BANNED_BOILERPLATE_PATTERNS = [
  { pattern: /Đồng bộ và bảo toàn logic nghiệp vụ/i, name: 'Generic Spec Table Placeholder' },
  { pattern: /Thực hiện cập nhật logic tối thiểu, đồng bộ hóa dữ liệu/i, name: 'Generic Code Review Summary Placeholder' },
  { pattern: /Cập nhật logic và bảo toàn bất biến phân hệ/i, name: 'Generic Change Map Rationale Placeholder' },
  { pattern: /TODO_REVIEW_REQUIRED/i, name: 'Unfilled Review Todo' },
  { pattern: /Đảm bảo bao phủ 100% kiểm thử hành vi/i, name: 'Generic Test Coverage Placeholder' },
  { pattern: /Bảo toàn 100% logic nghiệp vụ cốt lõi và các ràng buộc/i, name: 'Generic Intro Policy Placeholder' },
  { pattern: /Phân bổ cấu trúc hiển thị tối ưu, bảo vệ trải nghiệm công thái học/i, name: 'Generic Ergonomics Placeholder' },
  { pattern: /Tuân thủ nghiêm ngặt các ranh giới kiểm thử, Zero Dirty Casts/i, name: 'Generic Boundary Linter Placeholder' },
];

/**
 * Audits review report persistence, final improvement acceptance report, and Knowledge Fold invariant.
 */
export function auditReportsAndSSOT(evidence, repoRoot, targetArg, evidencePath) {
  const errors = [];
  const auditDir = path.join(repoRoot, '.agents', 'audit');
  const evidenceDir = path.join(repoRoot, '.agents', 'evidence');
  const summary = evidence.testExecutionSummary || {};
  const isPureLogicWaiver = evidence.pureLogicWaiver === true;

  const { ticketRaw, ticketClean, ticketNum, matchesTicket } = createTicketMatcher(evidence, targetArg);

  // 1. Physical Review Reports Persistence Gate
  if (fs.existsSync(auditDir) && ticketNum) {
    const auditFiles = fs.readdirSync(auditDir);

    const isWaivedReview = isPureLogicWaiver || evidence.tier === '1.5' || evidence.isStructuralRefactor === true || evidence.leanExecution === true || evidence.tier === '1';

    if (!isWaivedReview) {
      const hasSpecReview = auditFiles.some((f) => f.toLowerCase().startsWith('spec_review_') && matchesTicket(f));
      if (!hasSpecReview) {
        errors.push(`[Phase 3.3 Persistence Violation] Missing physical Spec Review report: .agents/audit/SPEC_REVIEW_${evidence.ticketId || targetArg}.md`);
      }

      const hasCodeReview = auditFiles.some((f) => f.toLowerCase().startsWith('code_review_') && matchesTicket(f));
      if (!hasCodeReview) {
        errors.push(`[Phase 3.3 Persistence Violation] Missing physical Code Review report: .agents/audit/CODE_REVIEW_${evidence.ticketId || targetArg}.md`);
      }
    }

    const isVisual = !isPureLogicWaiver && (evidence.visualReview || /3d|ui|viaduct|diorama|ballast|modal|hud/i.test(evidencePath) || /3d|ui/i.test(summary.contractSuite || ''));
    if (isVisual) {
      const hasVisualReview = auditFiles.some((f) => /^(ui_craft|game_3d|3d_visual)_review_/i.test(f) && matchesTicket(f));
      if (!hasVisualReview) {
        errors.push(`[Phase 3.3 Persistence Violation] Visual ticket missing UI/3D review report: .agents/audit/UI_CRAFT_REVIEW_${evidence.ticketId || targetArg}.md or 3D_VISUAL_REVIEW_${evidence.ticketId || targetArg}.md`);
      }
    }

    // Anti-Boilerplate Audit Gate
    for (const af of auditFiles.filter((f) => matchesTicket(f) && f.endsWith('.md'))) {
      try {
        const content = fs.readFileSync(path.join(auditDir, af), 'utf8');
        for (const { pattern, name } of BANNED_BOILERPLATE_PATTERNS) {
          if (pattern.test(content)) {
            errors.push(`[Zero-Boilerplate Violation] ${af} contains template placeholder "${name}". Must write concrete business rules, blast radius scenarios, and change rationales!`);
          }
        }
      } catch {}
    }
  }

  // 2. Comprehensive Improvement Final Acceptance Report Gate
  const improvementsDir = path.join(repoRoot, 'docs', 'reports', 'improvements');
  if (ticketNum && fs.existsSync(improvementsDir)) {
    const improvementFiles = fs.readdirSync(improvementsDir);
    const finalReport = improvementFiles.find((f) => f.endsWith('.md') && matchesTicket(f));
    if (!finalReport) {
      errors.push(
        `[Final Acceptance Report Missing] Missing final improvement report in docs/reports/improvements/ for ticket "${evidence.ticketId || targetArg}". Run 'npm run report -- ${evidence.ticketId || targetArg}' to synthesize.`
      );
    } else {
      const reportPath = path.join(improvementsDir, finalReport);
      const reportStat = fs.statSync(reportPath);
      if (reportStat.size < 200) {
        errors.push(
          `[Final Acceptance Report Truncated] Report ${finalReport} is too small (${reportStat.size} bytes). Run 'npm run report -- ${evidence.ticketId || targetArg} --force' to regenerate.`
        );
      }
      try {
        const repContent = fs.readFileSync(reportPath, 'utf8');
        for (const { pattern, name } of BANNED_BOILERPLATE_PATTERNS) {
          if (pattern.test(repContent)) {
            errors.push(`[Zero-Boilerplate Violation] Final report ${finalReport} contains template placeholder "${name}". Must customize with authentic technical findings.`);
          }
        }

        // Honest Station 4 Mutation Reporting Check
        const claimsMutants = /(?:zero mutant|mutants? (?:mục tiêu |đã )?bị tiêu diệt|tiêu diệt biến dị)/i.test(repContent);
        if (claimsMutants) {
          const hasRealMutationTesting =
            Boolean(evidence.mutationSensitivityProbe && (evidence.mutationSensitivityProbe.mutantsTested ?? 0) > 0) ||
            fs.existsSync(path.join(evidenceDir, `chaos_sentinel_${evidence.ticketId || targetArg}.json`)) ||
            fs.existsSync(path.join(evidenceDir, `chaos_sentinel_${(evidence.ticketId || targetArg || '').toLowerCase()}.json`));
          if (!hasRealMutationTesting) {
            errors.push(
              `[False Mutation Claim Violation] Final report ${finalReport} claims mutation testing results (e.g. "zero mutant / tiêu diệt biến dị"), but no physical mutation testing was executed (only snapshot verification was performed). Station 4 in the report must state "SNAPSHOT VERIFIED" honestly without claiming mutant destruction.`
            );
          }
        }

        // Anti-Truncation Check for Adversarial Vectors
        const advBlocks = repContent.split(/(?=- \*\*\[ADV-[A-Z0-9_-]+\])/i);
        for (const block of advBlocks) {
          const advMatch = block.match(/^- \*\*\[(ADV-[A-Z0-9_-]+)\]/i);
          if (advMatch) {
            const advId = advMatch[1];
            if (advId.toUpperCase() === 'ADV-OBJ') continue;
            const hasSubstance =
              /(?:Scenario|Consequence|Hardening Directive|Invariant|Audit|Lỗ hổng|Rủi ro)/i.test(block) &&
              block.split('\n').filter((l) => l.trim().startsWith('- **')).length >= 2;
            if (!hasSubstance) {
              errors.push(
                `[Report Truncation Violation] Section [${advId}] in ${finalReport} is truncated! Every adversarial finding must contain detailed Scenario and Hardening Directive.`
              );
            }
          }
        }

        // Anti-Unescaped Code Blob Check
        const repLines = repContent.split('\n');
        let inCodeBlock = false;
        for (let lineIdx = 0; lineIdx < repLines.length; lineIdx++) {
          const line = repLines[lineIdx];
          if (line.trim().startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            continue;
          }
          if (!inCodeBlock && line.length > 280) {
            const hasCodeBlob = /(?:const|let|function)\s+\w+[\s\S]*?(?:===|!==|=>|\.join\(|\.map\()/i.test(line);
            if (hasCodeBlob) {
              errors.push(
                `[Unescaped Code Blob Violation] Final report ${finalReport} line ${lineIdx + 1} contains a flattened, unescaped code blob (> 280 chars). Wrap code snippets in code blocks or inline backticks!`
              );
            }
          }
        }

        // Anti-Truncated Bullet / Dangling Colon Gate
        for (let lineIdx = 0; lineIdx < repLines.length; lineIdx++) {
          const line = repLines[lineIdx].trim();
          if (/^-\s*(?:💡|⚠️|🚨|\*)\s*\*\*\[[^\]]+\]\*\*:\s*$/.test(line)) {
            const nextLine = repLines[lineIdx + 1] ? repLines[lineIdx + 1].trim() : '';
            if (!nextLine || nextLine.startsWith('- ') || nextLine.startsWith('###') || nextLine.startsWith('---')) {
              errors.push(
                `[Template Truncation Violation] Final report ${finalReport} line ${lineIdx + 1} contains an empty dangling bullet without body text: "${line}". Must provide substantive findings or remove!`
              );
            }
          }
        }

        // Irrelevant Telemetry Table Gate (Anti-Contamination)
        const targetSrcFiles = evidence.targetFiles || evidence.modifiedFiles || [];
        const touchesMotion = targetSrcFiles.some((f) => /camera|cinematic|kinematics/i.test(f)) || /camera|cinematic|kinematics/i.test(evidence.ticketId || targetArg || '');
        if (!touchesMotion && /Bảng Thông Số Toạ Độ Camera Khảo Sát Thực Tế/i.test(repContent)) {
          errors.push(
            `[Artifact Contamination Violation] Final report ${finalReport} contains Camera Telemetry table (Gotcha #13), but ticket does NOT modify camera/motion files! Remove irrelevant telemetry table to uphold the Mandatory Shortening Pass Invariant.`
          );
        }
      } catch {}
    }
  }

  // 3. Mechanical Knowledge Fold Invariant Gate (GEMINI.md Invariant)
  try {
    const targetFilesToCheck = evidence.targetFiles || evidence.modifiedFiles || [];
    let gitModifiedFiles = [];
    try {
      const gitOutput = execSync('git status --porcelain', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
      gitModifiedFiles = gitOutput.split('\n').map((l) => l.slice(3).trim()).filter(Boolean);
    } catch {}

    const allRelevantFiles = [...new Set([...targetFilesToCheck, ...gitModifiedFiles])];
    const touchesDomainOrState = allRelevantFiles.some((f) =>
      /^(?:src[/\\])?(domain[/\\]|server[/\\]|client[/\\](?:events|store)[/\\])/i.test(f.replace(/^[AMDRCU?\s]+/, ''))
    );

    if (touchesDomainOrState) {
      const isFeatureMapModified =
        gitModifiedFiles.some((f) => /docs[/\\]FEATURE_MAP\.md/i.test(f)) ||
        (() => {
          try {
            const content = fs.readFileSync(path.join(repoRoot, 'docs', 'FEATURE_MAP.md'), 'utf8');
            if (ticketClean && content.includes(ticketClean)) return true;
            if (ticketNum && content.includes(`IMP-${ticketNum}`)) return true;
            const diff = execSync('git diff HEAD~1 HEAD --name-only docs/FEATURE_MAP.md', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
            return Boolean(diff.trim());
          } catch {
            return false;
          }
        })();

      if (!isFeatureMapModified) {
        errors.push(
          `[Knowledge Fold Invariant Violation] Ticket touches core domain/state/server files, but docs/FEATURE_MAP.md has NOT been updated! Per GEMINI.md Knowledge Fold Invariant, update docs/FEATURE_MAP.md to maintain SSOT before completing Station 4.`
        );
      }
    }
  } catch {}

  return errors;
}
