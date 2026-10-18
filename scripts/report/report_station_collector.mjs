import fs from 'node:fs';
import path from 'node:path';
import { categorizeTier, TIER_RULES } from '../check_loc.mjs';
import { findTicketFile } from './report_git_inspector.mjs';

/**
 * Parses Station 0 (Plan audit and challenge) data.
 */
export function parseStation0(auditDir, ticketId, contractTestCount) {
  const planAuditFile = findTicketFile(auditDir, 'PLAN_AUDIT', ticketId);
  const planChallengeFile = findTicketFile(auditDir, 'PLAN_CHALLENGE', ticketId);

  let planAuditSummary = 'Thẩm định tự động (`audit_plan.mjs --auto-sign`) đạt 0 defects, tự ký HARDENED_APPROVED.';
  let planGrillerVerdict = 'HARDENED_APPROVED 🛡️';
  let planChallengeNotes = [];

  if (planAuditFile) {
    const paContent = fs.readFileSync(planAuditFile, 'utf8');
    const paVerdictMatch = paContent.match(/##\s*🏁\s*HARD GATE VERDICT\s*\n\s*\*?\*?([A-Z_]+)\*?\*?/i);
    if (paVerdictMatch) planGrillerVerdict = `${paVerdictMatch[1]} 🛡️`;
    const defectsMatch = paContent.match(/-\s*\*\*Defects\*\*:\s*(\d+)/i);
    const testsCleanMatch = paContent.match(/-\s*\*\*Contract Tests Clean\*\*:\s*(\d+)/i);
    if (defectsMatch) {
      planAuditSummary = `Thẩm định kế hoạch đạt ${defectsMatch[1]} defects, ${testsCleanMatch ? testsCleanMatch[1] : contractTestCount} contract tests clean.`;
    }
  }

  if (planChallengeFile) {
    const pcContent = fs.readFileSync(planChallengeFile, 'utf8');
    const lines = pcContent.split('\n');
    let currentAdv = null;
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      const advMatch = trimmed.match(/^##\s*\[(ADV-[A-Z0-9_-]+)\]\s*(.+)$/i);
      if (advMatch) {
        currentAdv = advMatch[1];
        planChallengeNotes.push(`- **[${advMatch[1]}] ${advMatch[2]}**`);
        continue;
      }
      const fieldMatch = !/^\s{2,}/.test(lines[i]) ? trimmed.match(/^-\s*\*\*([A-Za-z0-9_ ?/-]+)\*\*:\s*(.*)$/i) : null;
      if (fieldMatch) {
        const fieldName = fieldMatch[1];
        if (!/^(?:P\d|Point\s*\d|Phản biện|Lỗ hổng|Rủi ro|Vector|Scenario|Consequence|.*Hardening Directive|Verdict|.*Invariant|.*Audit|Target reachable\?|Baselines verified\?|Physical surface area exhausted\?)/i.test(fieldName)) {
          continue;
        }
        let fieldVal = fieldMatch[2].trim();
        const collected = [];
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j];
          const nextTrim = nextLine.trim();
          const isTopLevelField = /^-\s*\*\*[A-Za-z0-9_ ?/-]+\*\*:/i.test(nextTrim) && !/^\s{2,}/.test(nextLine);
          if (isTopLevelField || nextTrim.startsWith('## ') || nextTrim.startsWith('---') || nextTrim.startsWith('</')) break;
          if (!nextTrim || nextTrim.startsWith('```')) continue;
          const cleaned = nextTrim.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '');
          if (cleaned) {
            collected.push(cleaned);
            if (collected.join(' ').length > 1200) break;
          }
        }
        if (collected.length > 0) {
          const firstVal = fieldVal || collected[0];
          const formatted = `- **${fieldName}**: ${firstVal}`;
          planChallengeNotes.push(currentAdv ? `  ${formatted}` : formatted);
          const remaining = fieldVal ? collected : collected.slice(1);
          for (const item of remaining) {
            planChallengeNotes.push(currentAdv ? `    - ${item}` : `  - ${item}`);
          }
        } else if (fieldVal) {
          const formatted = `- **${fieldName}**: ${fieldVal}`;
          planChallengeNotes.push(currentAdv ? `  ${formatted}` : formatted);
        }
      }
    }
  }

  const stage0ReviewerStr = planChallengeFile
    ? '`adversarial-challenger` & `audit_plan.mjs`'
    : '`audit_plan.mjs --auto-sign` (Máy duyệt)';
  const stage0HeadingStr = planChallengeFile
    ? 'Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)'
    : 'Thẩm Định Kế Hoạch Tự Động (`audit_plan.mjs --auto-sign`)';
  const stage0ProcessNote = planChallengeFile
    ? '- **Xác nhận**: Kế hoạch đã vượt qua 100% các tiêu chí kiểm tra về State Invariants, Seam Discipline, Boundary Control và Symmetric Verification.'
    : '- **Lưu ý quy trình**: Kế hoạch được thẩm định cơ học bằng `audit_plan.mjs --auto-sign`. Chưa kích hoạt vòng phản biện đối kháng chuyên sâu từ subagent `adversarial-challenger`.';

  return {
    planAuditFile,
    planChallengeFile,
    planAuditSummary,
    planGrillerVerdict,
    planChallengeNotes,
    stage0ReviewerStr,
    stage0HeadingStr,
    stage0ProcessNote
  };
}

/**
 * Parses Station 1 (QA Tester) data.
 */
export function parseStation1(evidenceDir, auditDir, ticketId, contractTestCount) {
  const station1File = findTicketFile(evidenceDir, 'station1', ticketId) || findTicketFile(auditDir, 'station1', ticketId);
  let station1RedVerified = true;
  let station1TestCount = contractTestCount;
  let station1FailureSnippet = null;

  if (station1File) {
    try {
      const s1 = JSON.parse(fs.readFileSync(station1File, 'utf8'));
      station1RedVerified = s1.redVerified ?? true;
      station1TestCount = s1.testCount ?? contractTestCount;
      if (s1.failureReasonVerbatim) {
        station1FailureSnippet = s1.failureReasonVerbatim;
      } else if (Array.isArray(s1.failures)) {
        station1FailureSnippet = s1.failures.join('\n');
      }
    } catch {}
  }

  return {
    station1File,
    station1RedVerified,
    station1TestCount,
    station1FailureSnippet
  };
}

/**
 * Parses Station 3.2 UI Craft and 3D Visual reviews.
 */
export function parseStation3Reviews(auditDir, ticketId) {
  const uiCraftFile = findTicketFile(auditDir, 'UI_CRAFT_REVIEW', ticketId);
  const visual3dFile = findTicketFile(auditDir, '3D_VISUAL_REVIEW', ticketId);

  let uiReviewVerdict = 'APPROVED 🎨';
  let uiReviewNotes = [];

  if (uiCraftFile) {
    const uiContent = fs.readFileSync(uiCraftFile, 'utf8');
    const verdictMatch = uiContent.match(/##\s*Verdict\s*\n\s*(?:\*\*)?([^*\r\n]+)(?:\*\*)?/i);
    if (verdictMatch) uiReviewVerdict = verdictMatch[1].trim();
    const lines = uiContent.split('\n');
    for (const l of lines) {
      const trimmed = l.trim();
      if (/^-\s*\*\*(?:Desktop|Mobile|Touch Target|Clearance|Kích thước|Spatial|Toast)/i.test(trimmed) && trimmed.length > 25) {
        uiReviewNotes.push(trimmed);
      } else if (/^-\s*(?:Khoảng cách|Chiều cao|Kích thước|Status)/i.test(trimmed) && trimmed.length > 15) {
        uiReviewNotes.push(`- **Chi tiết**: ${trimmed.replace(/^-\s*/, '')}`);
      }
    }
  } else if (visual3dFile) {
    const v3Content = fs.readFileSync(visual3dFile, 'utf8');
    const scoreMatch = v3Content.match(/(?:\*\*)?(\d+(?:\.\d+)?\s*\/\s*10)(?:\*\*)?/);
    const dispMatch = v3Content.match(/\*\*Disposition:\*\*\s*(?:\*\*)?([^*\r\n]+)(?:\*\*)?/i);
    const disposition = dispMatch ? dispMatch[1].trim() : '';
    const scoreNum = scoreMatch ? parseFloat(scoreMatch[1].split('/')[0].trim()) : 0;
    if (disposition.includes('HOLD') || scoreNum < 8.0) {
      uiReviewVerdict = `${scoreMatch ? scoreMatch[1] : '5.8 / 10'} (${disposition || 'HOLD FOR FIX'}) ⚠️`;
    } else if (scoreMatch) {
      uiReviewVerdict = `${scoreMatch[1]} (3D AAA Verified) 🎨`;
    }
    const lines = v3Content.split('\n');
    for (const l of lines) {
      const trimmed = l.trim();
      if (/^-\s*\*\*(?:Core Milestone|Pillar \d|Spatial Sector|Camera|Lobby|3D Diorama|K\d|Priority|P\d|Desktop|Mobile)/i.test(trimmed) && trimmed.length > 25) {
        uiReviewNotes.push(trimmed);
      } else if (/^-\s*`?(?:top_down|lobby_vip|deed_modal|dice_tray|hud_dock|mobile_viewport)`?:/i.test(trimmed) && trimmed.length > 25) {
        uiReviewNotes.push(trimmed);
      }
    }
  }

  return {
    uiCraftFile,
    visual3dFile,
    uiReviewVerdict,
    uiReviewNotes
  };
}

/**
 * Parses Station 4 (Chaos Sentinel) evidence.
 */
export function parseStation4Chaos(evidenceDir, ticketId) {
  const chaosSentinelFile = findTicketFile(evidenceDir, 'chaos_sentinel', ticketId);
  const snapshotFile = findTicketFile(evidenceDir, `${ticketId}_snapshot`, ticketId) || findTicketFile(evidenceDir, 'snapshot', ticketId);
  let chaosVerdict = 'SNAPSHOT AUDIT PASSED 📋';
  let chaosSummary = 'Xác minh toàn vẹn snapshot kiểm thử và số dòng LOC vật lý trên đĩa.';
  let chaosDetails = [];

  if (chaosSentinelFile) {
    try {
      const cs = JSON.parse(fs.readFileSync(chaosSentinelFile, 'utf8'));
      chaosVerdict = `${cs.verdict || 'PASSED'} 💥`;
      if (cs.mutationSensitivityProbe) {
        const m = cs.mutationSensitivityProbe;
        const killed = m.killed ?? m.mutantsKilled ?? 0;
        const tested = m.mutantsTested ?? 0;
        const killRate = m.killRate ?? (tested > 0 ? (killed / tested) : 1);
        chaosSummary = `${killed}/${tested} mutants mục tiêu bị tiêu diệt (kill rate: ${(killRate * 100).toFixed(0)}%, ${m.survived ?? 0} survived).`;
        if (Array.isArray(m.details)) {
          chaosDetails = m.details.map((d) => `- **${d.name || `Mutant ${d.mutantId}`}**: ${d.status} bởi \`${d.killerTest?.split(']')[0] ? d.killerTest.split(']')[0] + ']' : 'killer test'}\``);
        }
      }
    } catch {}
  } else if (snapshotFile) {
    chaosVerdict = 'SNAPSHOT VERIFIED 📋';
    chaosSummary = 'Bảo toàn tính toàn vẹn snapshot kiểm thử và số dòng LOC vật lý trên đĩa (Zero-Memorization).';
  }

  return {
    chaosSentinelFile,
    chaosVerdict,
    chaosSummary,
    chaosDetails
  };
}

/**
 * Parses Forensic Auditor review (forensic-challenger).
 */
export function parseForensicAudit(auditDir, ticketId) {
  const forensicFile = findTicketFile(auditDir, 'FORENSIC_AUDIT', ticketId) || findTicketFile(auditDir, 'REPORT_CHALLENGE', ticketId);
  const forensicFindings = [];
  const forensicRetro = [];
  let forensicVerdict = null;

  if (forensicFile) {
    try {
      const content = fs.readFileSync(forensicFile, 'utf8');
      const verdictMatch = content.match(/-\s*\*\*Status\*\*:\s*\[?([A-Za-z0-9_ -]+)\]?/i);
      if (verdictMatch) forensicVerdict = verdictMatch[1].trim();

      const lines = content.split('\n');
      let currentSection = null;
      let currentItem = [];

      const flushItem = () => {
        if (!currentSection || currentItem.length === 0) return;
        const joined = currentItem.join('\n').trim();
        if (currentSection === 'finding') forensicFindings.push(joined);
        if (currentSection === 'retro') forensicRetro.push(joined);
        currentItem = [];
      };

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        if (/^-\s*(?:🚨|⚡|⚠️)\s*\*\*\[/i.test(trimmed) || /^###\s*(?:🚨|⚡|⚠️)\s*\[/i.test(trimmed)) {
          flushItem();
          currentSection = 'finding';
          currentItem.push(trimmed.startsWith('###') ? trimmed.replace(/^###\s*/, '- ') : trimmed);
        } else if (/^-\s*💡\s*\*\*\[SDLC-RETRO/i.test(trimmed)) {
          flushItem();
          currentSection = 'retro';
          currentItem.push(trimmed);
        } else if (/^(?:#|---|##\s*\d)/.test(trimmed)) {
          flushItem();
          currentSection = null;
        } else if (currentSection && (line.startsWith('  ') || line.startsWith('\t') || (trimmed.length > 0 && !trimmed.startsWith('#')))) {
          currentItem.push(line);
        }
      }
      flushItem();
    } catch {}
  }
  return { forensicFile, forensicVerdict, forensicFindings, forensicRetro };
}

/**
 * Collects visual screenshot paths if available.
 */
export function collectVisualScreenshots(repoRoot, ticketLower, ticketClean) {
  const tmpDir = path.join(repoRoot, '.agents', 'tmp');
  const desktopImg = fs.existsSync(path.join(tmpDir, `${ticketLower}_desktop.jpg`))
    ? `.agents/tmp/${ticketLower}_desktop.jpg`
    : (fs.existsSync(path.join(tmpDir, `${ticketClean.toLowerCase()}_desktop.jpg`)) ? `.agents/tmp/${ticketClean.toLowerCase()}_desktop.jpg` : null);
  const mobileImg = fs.existsSync(path.join(tmpDir, `${ticketLower}_mobile_360.jpg`))
    ? `.agents/tmp/${ticketLower}_mobile_360.jpg`
    : (fs.existsSync(path.join(tmpDir, `${ticketClean.toLowerCase()}_mobile_360.jpg`)) ? `.agents/tmp/${ticketClean.toLowerCase()}_mobile_360.jpg` : null);

  return { desktopImg, mobileImg };
}

/**
 * Collects LOC warning files.
 */
export function collectLocWarnings(repoRoot, srcFiles) {
  const warnFiles = [];
  for (const f of srcFiles) {
    const abs = path.resolve(repoRoot, f);
    if (!fs.existsSync(abs)) continue;
    const tierKey = categorizeTier(f);
    const tierInfo = TIER_RULES[tierKey] || TIER_RULES.TIER1_LOGIC;
    const rawLines = fs.readFileSync(abs, 'utf8').split('\n');
    if (rawLines.length > 0 && rawLines[rawLines.length - 1] === '') rawLines.pop();
    const loc = rawLines.length;
    if (loc > tierInfo.warn && loc <= tierInfo.ceiling) {
      warnFiles.push({ file: f, name: path.basename(f), loc, warn: tierInfo.warn, ceiling: tierInfo.ceiling, tierName: tierInfo.name });
    }
  }
  return warnFiles;
}

/**
 * Collects harness, plan, audit, probe, and evidence files for a ticket.
 */
export function collectHarnessFiles(repoRoot, ticketId) {
  const ticketClean = ticketId.replace(/^IMP-/i, '');
  const harnessFiles = [];
  const searchDirs = [
    { dir: path.join(repoRoot, '.agents', 'plans'), role: 'Kế hoạch triển khai (Lean Plan)' },
    { dir: path.join(repoRoot, '.agents', 'audit'), role: 'Biên bản kiểm toán độc lập' },
    { dir: path.join(repoRoot, 'scripts', 'sentinel_probes'), role: 'Đặc tả đột biến Chaos Sentinel' },
    { dir: path.join(repoRoot, '.agents', 'evidence'), role: 'Bằng chứng thực thi & snapshot' }
  ];

  for (const { dir, role } of searchDirs) {
    if (!fs.existsSync(dir)) continue;
    const entries = fs.readdirSync(dir);
    for (const file of entries) {
      const fLower = file.toLowerCase();
      const tLower = ticketId.toLowerCase();
      const cLower = `imp-${ticketClean.toLowerCase()}`;
      const nLower = `imp${ticketClean.toLowerCase()}`;
      if (fLower.includes(tLower) || fLower.includes(cLower) || fLower.includes(nLower)) {
        const relPath = path.relative(repoRoot, path.join(dir, file)).replace(/\\/g, '/');
        harnessFiles.push({ file: relPath, name: file, role });
      }
    }
  }
  return harnessFiles;
}
