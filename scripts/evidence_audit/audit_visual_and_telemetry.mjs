import fs from 'node:fs';
import path from 'node:path';
import { createTicketMatcher } from './evidence_resolver.mjs';

/**
 * Audits physical visual screenshot captures, topbar layout bounds, and action camera telemetry.
 */
export function auditVisualAndTelemetry(evidence, repoRoot, targetArg, evidencePath) {
  const errors = [];
  const evidenceDir = path.join(repoRoot, '.agents', 'evidence');
  const summary = evidence.testExecutionSummary || {};

  const isPureLogicWaiver = evidence.pureLogicWaiver === true;
  const targetFilesForVisual = evidence.targetFiles || evidence.modifiedFiles || [];
  const clientFiles = targetFilesForVisual.filter((f) => /^(?:src\/client|src\\client)/i.test(f));
  const hasClientVisualFiles = targetFilesForVisual.some((f) => /src[/\\]client[/\\](3d|ui)/i.test(f));

  const { ticketRaw, ticketClean, matchesTicket } = createTicketMatcher(evidence, targetArg);

  if (isPureLogicWaiver) {
    if (clientFiles.length > 0) {
      errors.push(
        `[ILLEGAL_PURE_LOGIC_WAIVER] pureLogicWaiver is FORBIDDEN when client/UI files are modified: ${clientFiles.join(', ')}`
      );
    } else {
      console.log(`ℹ️ [Pure Logic Waiver] Visual screenshot check waived: ${evidence.pureLogicWaiverReason || 'Non-visual logic/type slice'}`);
    }
  } else if (evidence.visualReview || hasClientVisualFiles || /3d|ui|viaduct|diorama|ballast|modal|hud/i.test(evidencePath) || /3d|ui/i.test(summary.contractSuite || '')) {
    const tmpFiles = fs.existsSync(path.join(repoRoot, '.agents', 'tmp')) ? fs.readdirSync(path.join(repoRoot, '.agents', 'tmp')) : [];
    const evFiles = fs.existsSync(evidenceDir) ? fs.readdirSync(evidenceDir) : [];
    const isSyntheticSmokeProbe = (f) => /^(chaos_sentinel_|webgl2_headless_smoke)/i.test(f);
    const allImages = [...tmpFiles, ...evFiles].filter((f) =>
      !isSyntheticSmokeProbe(f) &&
      /\.(png|jpe?g|webp)$/i.test(f) &&
      (!ticketClean || f.toLowerCase().includes(ticketClean) || f.toLowerCase().includes(ticketRaw))
    );

    if (allImages.length === 0) {
      errors.push(
        `[Zero-Blindness Violation] Visual/3D ticket requires physical screenshot in .agents/tmp/ or .agents/evidence/ from Phase 3.0 (e.g. ${evidence.ticketId || targetArg}_desktop.jpg). Run 'npm run capture:visual -- --ticket ${evidence.ticketId || targetArg}' before sign-off.`
      );
    } else if (hasClientVisualFiles) {
      const hasDesktop = allImages.some((f) => /desktop/i.test(f));
      const hasMobile = allImages.some((f) => /mobile/i.test(f));
      if (!hasDesktop || !hasMobile) {
        errors.push(
          `[Dual-Viewport Enforcement Violation] Physical UI modification detected in ${clientFiles.join(', ')}. Must provide BOTH desktop and mobile captures in .agents/tmp/! Missing: ${!hasDesktop ? 'desktop ' : ''}${!hasMobile ? 'mobile ' : ''}. Run 'npm run capture:visual -- --ticket ${evidence.ticketId || targetArg}'.`
        );
      }
    }

    // TopBar Overflow, Corner Clearance & Symmetry Gate
    const bbFiles = fs.existsSync(evidenceDir) ? fs.readdirSync(evidenceDir).filter((f) => f.startsWith('bounding_box_') && matchesTicket(f)) : [];
    for (const bbf of bbFiles) {
      try {
        const bbData = JSON.parse(fs.readFileSync(path.join(evidenceDir, bbf), 'utf8'));
        if (bbData.topbarCapsule && bbData.leaveBtn) {
          // A. Hard Overflow Check
          if (bbData.leaveBtn.right > bbData.topbarCapsule.right + 2) {
            errors.push(
              `[TopBar Leave Overflow Violation] ${bbf}: leave-room-button (right: ${bbData.leaveBtn.right}px) overflows outside topbar capsule (right: ${bbData.topbarCapsule.right}px) by ${bbData.leaveBtn.right - bbData.topbarCapsule.right}px!`
            );
          }

          const isDesktop = bbf.includes('desktop') || bbData.viewport === 'desktop';
          const rightMargin = bbData.topbarCapsule.right - bbData.leaveBtn.right;
          const minClearanceFloor = isDesktop ? 20 : 6;

          // B. Corner Arc Clearance Gate (Margin >= R + 4px)
          if (rightMargin < minClearanceFloor) {
            errors.push(
              `[TopBar Corner Clearance Violation] ${bbf}: leave-room-button right margin (${rightMargin}px) is below ergonomic floor (${minClearanceFloor}px) for rounded-2xl capsule!`
            );
          }

          // C. Symmetrical Margin Parity Gate (Desktop |left - right| <= 8px)
          if (isDesktop && bbData.matchInfo) {
            const leftMargin = bbData.matchInfo.left - bbData.topbarCapsule.left;
            const asymmetry = Math.abs(leftMargin - rightMargin);
            if (asymmetry > 8) {
              errors.push(
                `[TopBar Margin Symmetry Violation] ${bbf}: capsule horizontal padding is asymmetrical (Left: ${leftMargin}px, Right: ${rightMargin}px, Diff: ${asymmetry}px > 8px max allowed).`
              );
            }
          }
        }
      } catch {}
    }
  }

  // Physical Action Telemetry Gate (Gotcha #13 Enforcement)
  const isMotionTicket =
    !isPureLogicWaiver &&
    (/camera|chase|kinematics|pawn_hop|trajectory/i.test(evidencePath) || /camera|chase|kinematics/i.test(summary.contractSuite || ''));

  if (isMotionTicket && fs.existsSync(evidenceDir)) {
    const telemetryFiles = fs.readdirSync(evidenceDir).filter((f) => f.startsWith('camera_telemetry_') && matchesTicket(f));
    if (telemetryFiles.length === 0) {
      errors.push(
        `[Gotcha #13 Violation] Camera/kinematics ticket requires camera telemetry in .agents/evidence/camera_telemetry_${ticketRaw}_*.json`
      );
    } else {
      for (const tf of telemetryFiles) {
        try {
          const tel = JSON.parse(fs.readFileSync(path.join(evidenceDir, tf), 'utf8'));
          const isDicePanAction =
            Boolean(tel.gameState?.isRolling) || (typeof tel.elevationY === 'number' && tel.elevationY >= 18.0 && tel.elevationY <= 22.0);
          const maxAllowedElevation = isDicePanAction ? 22.0 : 20.0;
          if (typeof tel.elevationY === 'number' && tel.elevationY > maxAllowedElevation) {
            errors.push(
              `[Gotcha #13 Violation] ${tf}: elevationY (${tel.elevationY}m) represents an idle overview (> ${maxAllowedElevation}m). Must capture in-action telemetry (elevationY <= 6.0m for pawn chase, or <= 22.0m for active dice pan).`
            );
          }
        } catch (err) {
          errors.push(`[Gotcha #13 Error] Failed to parse ${tf}: ${err.message}`);
        }
      }
    }
  }

  return errors;
}
