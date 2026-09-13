// [IMP-25/MSS] Admin Forensic Helpers — Tải Hộp Đen JSON & Sinh Mã Test Repro
import type { AdminRoomDetail, AdminRoomLogEntry } from '../../../server/network/admin_manager';

export function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  return Promise.resolve(false);
}

export function downloadBlackBox(room: AdminRoomDetail, logs: AdminRoomLogEntry[]): void {
  const data = {
    exportedAt: Date.now(),
    roomCode: room.roomCode,
    status: room.status,
    warningReason: room.warningReason,
    metrics: {
      playerCount: room.playerCount,
      round: room.round,
      phase: room.phase,
      treasuryPool: room.treasuryPool,
    },
    players: room.players,
    propertyStates: room.propertyStates,
    auditLogs: logs,
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vtcoon_blackbox_${room.roomCode}_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function buildReproCode(room: AdminRoomDetail, logs: AdminRoomLogEntry[]): string {
  const safeRoom = room.roomCode.replace(/[^a-zA-Z0-9]/g, '_');
  const warningComment = room.warningReason ? `// Cảnh báo: ${room.warningReason}\n` : '';
  const rollLogs = logs.filter((l) => l.action === 'INTENT_ROLL');
  const otherPlayers = room.players.filter((p) => p.id !== room.hostId);
  const playerSetupCode = otherPlayers.length > 0
    ? otherPlayers.map((p) => p.isBot ? `    mgr.addBot(r.roomCode, '${p.id}');` : `    mgr.joinRoom(r.roomCode, '${p.id}');`).join('\n')
    : `    mgr.addBot(r.roomCode, 'bot_repro');`;

  return `// [TC-REPRO-${safeRoom}/ADMIN] Mã Test Tái Hiện Tự Động từ Hộp Đen Server
// Xuất lúc: ${new Date().toISOString()}
// Phòng: ${room.roomCode} | Host: ${room.hostId} | Vòng: ${room.round} | Pha: ${room.phase}
${warningComment}import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager.js';

describe('Admin Forensic Replay for Room ${safeRoom}', () => {
  it('tái hiện chính xác trạng thái phòng ${room.roomCode}', () => {
    const mgr = new RoomManager(12345);
    const r = mgr.createRoom('${room.hostId}', '${room.roomCode}');
    expect(mgr.hasRoom('${room.roomCode}')).toBe(true);
${playerSetupCode}

    // Số lần gieo xúc xắc ghi nhận: ${rollLogs.length}
    mgr.startGame(r.roomCode);
    expect(r.started).toBe(true);
  });
});
`;
}
