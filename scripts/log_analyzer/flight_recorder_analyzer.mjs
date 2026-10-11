import { getCellLabel } from './board_cell_names.mjs';

/**
 * Phân tích dữ liệu FlightRecorderDump từ Hộp Đen chẩn đoán của game.
 */
export function analyzeFlightRecorder(dump, options = {}) {
  const { verbose = false, timeline = false } = options;

  if (!dump || typeof dump !== 'object') {
    throw new Error('Dữ liệu log không hợp lệ hoặc rỗng.');
  }

  const roomCode = dump.roomCode || 'UNKNOWN';
  const seed = dump.seed ?? 'N/A';
  const exportedAt = dump.exportedAt ? new Date(dump.exportedAt).toLocaleString('vi-VN') : 'N/A';
  const metrics = dump.metrics || {};
  const violations = Array.isArray(dump.violations) ? dump.violations : [];
  const rawSnapshots = Array.isArray(dump.snapshots) ? dump.snapshots : [];
  const recordedIntents = Array.isArray(dump.recordedIntents) ? dump.recordedIntents : [];
  const auditLogs = Array.isArray(dump.auditLogs) ? dump.auditLogs : [];

  // Sắp xếp snapshots theo thứ tự thời gian tăng dần (cũ nhất -> mới nhất)
  const snapshots = [...rawSnapshots].sort((a, b) => (a.tick ?? 0) - (b.tick ?? 0));
  const minTick = snapshots[0]?.tick ?? (auditLogs[auditLogs.length - 1]?.tick ?? 0);
  const maxTick = snapshots[snapshots.length - 1]?.tick ?? (auditLogs[0]?.tick ?? 0);

  // 1. Phân tích người chơi và số dư
  const playerStats = {};
  const allPlayerIds = new Set();

  for (const s of snapshots) {
    const preBal = s.preStateSummary?.balances || {};
    const postBal = s.postStateSummary?.balances || {};
    const postPos = s.postStateSummary?.positions || {};

    for (const [pid, bal] of Object.entries(preBal)) {
      allPlayerIds.add(pid);
      if (!playerStats[pid]) playerStats[pid] = { id: pid, startBalance: bal, endBalance: bal, minBalance: bal, finalPos: 0 };
      playerStats[pid].minBalance = Math.min(playerStats[pid].minBalance, bal);
    }
    for (const [pid, bal] of Object.entries(postBal)) {
      allPlayerIds.add(pid);
      if (!playerStats[pid]) playerStats[pid] = { id: pid, startBalance: bal, endBalance: bal, minBalance: bal, finalPos: 0 };
      playerStats[pid].endBalance = bal;
      playerStats[pid].minBalance = Math.min(playerStats[pid].minBalance, bal);
      if (postPos[pid] !== undefined) playerStats[pid].finalPos = postPos[pid];
    }
  }

  for (const pid of allPlayerIds) {
    const stat = playerStats[pid];
    stat.netChange = stat.endBalance - stat.startBalance;
    if (stat.endBalance <= 0 && stat.minBalance <= 0 && stat.startBalance === 0) {
      stat.status = 'PHÁ SẢN (BANKRUPT)';
    } else if (stat.endBalance < 0) {
      stat.status = 'VỠ NỢ / ÂM VỐN (INSOLVENT)';
    } else {
      stat.status = 'BÌNH THƯỜNG (SOLVENT)';
    }
  }

  // 2. Phân tích sự kiện theo Tick (Dòng tiền thuê nhà, nâng cấp, giải chấp, vỡ nợ)
  const timelineEvents = [];
  const bankruptcyInvestigations = [];
  const propertyEvents = [];

  for (let i = 0; i < snapshots.length; i++) {
    const s = snapshots[i];
    const tick = s.tick;
    const pre = s.preStateSummary?.balances || {};
    const post = s.postStateSummary?.balances || {};
    const deltaPlayers = s.triggerDelta?.players || [];
    const deltaCells = s.triggerDelta?.cells || [];

    // Tìm biến động số dư lớn giữa người chơi (Thuê đất / Chuyển khoản)
    const payers = [];
    const receivers = [];

    for (const pid of allPlayerIds) {
      const b0 = pre[pid] ?? 0;
      const b1 = post[pid] ?? 0;
      const diff = b1 - b0;
      if (diff < -50) payers.push({ pid, diff, b0, b1 });
      else if (diff > 50) receivers.push({ pid, diff, b0, b1 });
    }

    if (payers.length > 0 && receivers.length > 0) {
      for (const payer of payers) {
        for (const receiver of receivers) {
          const amt = Math.min(Math.abs(payer.diff), receiver.diff);
          timelineEvents.push({
            tick,
            type: 'RENT_TRANSFER',
            message: `Tick #${tick}: [THUÊ ĐẤT / TRẢ TIỀN] ${payer.pid} trả ${amt.toLocaleString()} Tr. cho ${receiver.pid} (Số dư ${payer.pid}: ${payer.b0} -> ${payer.b1}, ${receiver.pid}: ${receiver.b0} -> ${receiver.b1})`,
          });
        }
      }
    }

    // Kiểm tra vỡ nợ
    for (const [pid, bal] of Object.entries(post)) {
      if (bal < 0 && (pre[pid] ?? 0) >= 0) {
        const debtMsg = `Tick #${tick}: [🚨 CẢNH BÁO VỠ NỢ] ${pid} rơi vào âm vốn (${bal.toLocaleString()} Tr.) do không đủ tiền trả!`;
        timelineEvents.push({ tick, type: 'INSOLVENCY_START', message: debtMsg });
        bankruptcyInvestigations.push({
          tick,
          debtor: pid,
          deficit: Math.abs(bal),
          creditor: receivers[0]?.pid || 'NGÂN HÀNG (BANK)',
          note: `Bị trừ tiền thuê vượt quá số dư hiện có. Cần hạ cấp/cầm cố tài sản để bù nợ.`,
        });
      } else if (bal >= 0 && (pre[pid] ?? 0) < 0) {
        timelineEvents.push({
          tick,
          type: 'INSOLVENCY_RECOVERED',
          message: `Tick #${tick}: [✅ THOÁT VỠ NỢ] ${pid} đã thanh lý/hạ cấp tài sản để hồi phục số dư dương (${bal.toLocaleString()} Tr.).`,
        });
      }
    }

    // Biến động công trình đất đai
    for (const c of deltaCells) {
      const label = getCellLabel(c.index);
      propertyEvents.push({
        tick,
        cellIndex: c.index,
        label,
        ownerId: c.ownerId,
        level: c.level,
      });
      timelineEvents.push({
        tick,
        type: 'CELL_UPDATE',
        message: `Tick #${tick}: [BẤT ĐỘNG SẢN] ${c.ownerId} cập nhật ${label} lên Cấp ${c.level}`,
      });
    }
  }

  // 3. Phân tích Intent của người chơi
  const userIntentsByType = {};
  for (const intentRec of recordedIntents) {
    const type = intentRec.intent?.type || 'UNKNOWN';
    userIntentsByType[type] = (userIntentsByType[type] || 0) + 1;
  }

  return {
    overview: {
      roomCode,
      seed,
      exportedAt,
      tickRange: `${minTick} -> ${maxTick} (${snapshots.length} snapshots)`,
      totalIntents: recordedIntents.length,
      totalAuditLogs: auditLogs.length,
      fps: metrics.fps ? Number(metrics.fps).toFixed(1) : 'N/A',
      drawCalls: metrics.drawCalls ?? 'N/A',
      triangles: metrics.triangles ? metrics.triangles.toLocaleString() : 'N/A',
      pingRttMs: metrics.pingRttMs ?? 'N/A',
    },
    violations,
    players: Object.values(playerStats),
    timelineEvents,
    bankruptcyInvestigations,
    propertyEvents,
    userIntentsByType,
  };
}

/**
 * Xuất báo cáo text định dạng bảng console tiếng Việt.
 */
export function formatConsoleReport(analysis, options = {}) {
  const { overview, violations, players, timelineEvents, bankruptcyInvestigations, propertyEvents, userIntentsByType } = analysis;
  const lines = [];

  const sep = '='.repeat(70);
  const subSep = '-'.repeat(70);

  lines.push('');
  lines.push(sep);
  lines.push(`  🎮 BÁO CÁO PHÂN TÍCH NHẬT KÝ TRẬN ĐẤU VTCOON (FLIGHT RECORDER)`);
  lines.push(sep);
  lines.push(`📍 Mã Phòng (Room): ${overview.roomCode.padEnd(10)} | Hạt Giống (Seed): ${overview.seed}`);
  lines.push(`⏰ Thời Điểm Xuất : ${overview.exportedAt}`);
  lines.push(`⏱️ Dải Tick       : ${overview.tickRange}`);
  lines.push(`📊 Hiệu Năng 3D   : FPS: ${overview.fps} | DrawCalls: ${overview.drawCalls} | Triangles: ${overview.triangles} | Ping: ${overview.pingRttMs}ms`);
  lines.push(`📝 Tổng Lượt Ý Định (Intents): ${overview.totalIntents} | Bản Ghi Audit: ${overview.totalAuditLogs}`);

  if (violations.length > 0) {
    lines.push('');
    lines.push(`⚠️ PHÁT HIỆN ${violations.length} VI PHẠM INVARIANT:`);
    for (const v of violations) {
      lines.push(`  - [${v.severity}] Tick #${v.tick} (${v.type}): ${v.message}`);
    }
  } else {
    lines.push(`🛡️ Kiểm Toán Bất Biến (Invariant Guard): 100% TOÀN VẸN (0 VI PHẠM)`);
  }

  lines.push('');
  lines.push(subSep);
  lines.push(`  💰 1. BẢNG TỔNG KẾT TÀI CHÍNH & VỊ TRÍ NGƯỜI CHƠI`);
  lines.push(subSep);
  lines.push('Người Chơi'.padEnd(12) + 'Đầu Ván'.padStart(10) + 'Cuối Ván'.padStart(10) + 'Biến Động'.padStart(12) + 'Vị Trí Cuối'.padStart(20) + '  Trạng Thái');
  lines.push('-'.repeat(70));

  for (const p of players) {
    const diffStr = (p.netChange >= 0 ? `+${p.netChange}` : `${p.netChange}`) + ' Tr.';
    const posLabel = getCellLabel(p.finalPos);
    lines.push(
      p.id.padEnd(12) +
      `${p.startBalance} Tr.`.padStart(10) +
      `${p.endBalance} Tr.`.padStart(10) +
      diffStr.padStart(12) +
      `Ô #${String(p.finalPos).padStart(2, '0')}`.padStart(12) +
      `  ${p.status}`
    );
  }

  lines.push('');
  lines.push(subSep);
  lines.push(`  🚨 2. PHÂN TÍCH VỠ NỢ & CHUYỂN GIAO TÀI SẢN (BANKRUPTCY & INSOLVENCY)`);
  lines.push(subSep);

  if (bankruptcyInvestigations.length === 0) {
    const bankrupts = players.filter(p => p.status.includes('PHÁ SẢN'));
    if (bankrupts.length > 0) {
      for (const b of bankrupts) {
        lines.push(`📌 ${b.id}: Đã phá sản từ trước dải snapshot ghi nhận (Số dư = 0 Tr.).`);
      }
      lines.push(`ℹ️ Lưu ý: Theo Luật Cờ Tỷ Phú & Server (insolvency_manager.ts), khi bot phá sản vì nợ tiền thuê đất của bạn, toàn bộ đất đai và tiền dư của bot được chuyển giao 100% sang quyền sở hữu của bạn!`);
    } else {
      lines.push(`Không có người chơi nào rơi vào trạng thái vỡ nợ hoặc phá sản trong các tick này.`);
    }
  } else {
    for (const inv of bankruptcyInvestigations) {
      lines.push(`⚡ Tick #${inv.tick}: Con nợ ${inv.debtor} thiếu ${inv.deficit.toLocaleString()} Tr. với Chủ nợ [${inv.creditor}].`);
      lines.push(`   -> Diễn biến: ${inv.note}`);
    }
  }

  lines.push('');
  lines.push(subSep);
  lines.push(`  📈 3. BIẾN ĐỘNG DÒNG TIỀN THUÊ NHÀ & CÔNG TRÌNH NỔI BẬT`);
  lines.push(subSep);

  const rentEvents = timelineEvents.filter(e => e.type === 'RENT_TRANSFER' || e.type.startsWith('INSOLVENCY'));
  if (rentEvents.length === 0) {
    lines.push(`Không phát hiện giao dịch nợ/thuê lớn trong các snapshot.`);
  } else {
    for (const ev of rentEvents) {
      lines.push(`• ${ev.message}`);
    }
  }

  if (propertyEvents.length > 0) {
    lines.push('');
    lines.push(`🏗️ Các Lần Cập Nhật Công Trình (Gần Nhất):`);
    for (const pe of propertyEvents.slice(-8)) {
      lines.push(`  - Tick #${pe.tick}: ${pe.ownerId} đặt ${pe.label} -> Cấp ${pe.level}`);
    }
  }

  if (Object.keys(userIntentsByType).length > 0) {
    lines.push('');
    lines.push(subSep);
    lines.push(`  🕹️ 4. THỐNG KÊ Ý ĐỊNH NGƯỜI CHƠI (INTENTS SUMMARY)`);
    lines.push(subSep);
    const intentList = Object.entries(userIntentsByType).map(([k, v]) => `${k}: ${v}`).join(' | ');
    lines.push(intentList);
  }

  if (options.timeline && timelineEvents.length > 0) {
    lines.push('');
    lines.push(subSep);
    lines.push(`  📜 5. TOÀN BỘ DÒNG THỜI GIAN THEO TICK (CHRONOLOGICAL TIMELINE)`);
    lines.push(subSep);
    for (const ev of timelineEvents) {
      lines.push(`[${ev.type.padEnd(18)}] ${ev.message}`);
    }
  }

  lines.push(sep);
  lines.push('');
  return lines.join('\n');
}
