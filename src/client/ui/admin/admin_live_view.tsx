// [IMP-25/MSS][IMP-28/MSS] Admin Live Room Inspector & Terminal View
import React from 'react';
import type { AdminRoomDetail, AdminRoomLogEntry } from '../../../server/network/admin_manager';
import { copyText, downloadBlackBox, downloadLogFile, buildReproCode } from './admin_repro';
import { AdminLogRow } from './admin_log_row';

export interface AdminLiveViewProps {
  readonly selectedRoomDetail: AdminRoomDetail | null;
  readonly logs: AdminRoomLogEntry[];
  readonly logTerminalRef: React.RefObject<HTMLDivElement | null>;
  readonly onClearLogs: () => void;
  readonly onTerminate: (roomCode: string) => void;
  readonly showToast: (msg: string) => void;
}

export function AdminLiveView({
  selectedRoomDetail,
  logs,
  logTerminalRef,
  onClearLogs,
  onTerminate,
  showToast,
}: AdminLiveViewProps): React.ReactElement {
  if (!selectedRoomDetail) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500 text-sm">
        Chọn một bàn chơi từ danh sách bên trái để bắt đầu theo dõi
      </div>
    );
  }

  const handleCopyRepro = async (): Promise<void> => {
    const code = buildReproCode(selectedRoomDetail, logs);
    const ok = await copyText(code);
    showToast(ok ? 'Đã sao chép mã Test Vitest vào Clipboard' : 'Lỗi khi sao chép mã test');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-mono text-2xl font-bold text-amber-400">{selectedRoomDetail.roomCode}</h2>
            <span className={`rounded px-2 py-0.5 text-xs font-bold ${
              selectedRoomDetail.status === 'NORMAL'
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-950 text-red-400 border border-red-500/30'
            }`}>
              {selectedRoomDetail.status}
            </span>
            {selectedRoomDetail.warningReason && (
              <span className="text-xs text-red-400 font-medium">{selectedRoomDetail.warningReason}</span>
            )}
          </div>
          <div className="mt-2 flex gap-4 text-xs text-slate-400">
            <span>Host: <b className="text-slate-200">{selectedRoomDetail.hostId}</b></span>
            <span>Pha FSM: <b className="text-slate-200">{selectedRoomDetail.phase}</b></span>
            <span>Vòng: <b className="text-slate-200">{selectedRoomDetail.round}</b></span>
            <span>Quỹ Kho Bạc: <b className="text-amber-300">{selectedRoomDetail.treasuryPool.toLocaleString()} Tr</b></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadLogFile(selectedRoomDetail.roomCode, logs, 'jsonl')}
            className="rounded border border-cyan-500/40 bg-cyan-950/30 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/50"
          >
            📥 Tải Log (.jsonl)
          </button>
          <button
            onClick={() => downloadLogFile(selectedRoomDetail.roomCode, logs, 'json')}
            className="rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold hover:bg-slate-700"
          >
            📄 Tải Log (.json)
          </button>
          <button
            onClick={() => downloadBlackBox(selectedRoomDetail, logs)}
            className="rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold hover:bg-slate-700"
          >
            💾 Tải Hộp Đen JSON
          </button>
          <button
            onClick={handleCopyRepro}
            className="rounded border border-amber-500/40 bg-amber-950/30 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-900/50"
          >
            📋 Sao Chép Test Repro
          </button>
          <button
            onClick={() => onTerminate(selectedRoomDetail.roomCode)}
            className="rounded border border-red-500/40 bg-red-950 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-900"
          >
            ⛔ Đóng Bàn Khẩn Cấp
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
          Thông Số Người Chơi Thực Tế
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {selectedRoomDetail.players.map((p) => (
            <div
              key={p.id}
              className={`rounded-lg border p-3 ${
                p.bankrupt ? 'border-slate-800 bg-slate-950/60 opacity-60' : 'border-slate-700 bg-slate-950'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">{p.id}</span>
                <span className="text-[10px] text-slate-400">{p.isBot ? '🤖 BOT' : '👤 Người'}</span>
              </div>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Số Dư:</span>
                  <span className={`font-mono font-bold ${p.balance < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {p.balance.toLocaleString()} Tr
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tài Sản Ròng:</span>
                  <span className="font-mono text-amber-300">{p.netWorth.toLocaleString()} Tr</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Ô: {p.position}</span>
                  <span>BĐS: {p.propertyCount} ô</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            🔴 Live Stream Nhật Ký Sự Kiện ({logs.length} sự kiện gần nhất)
          </h3>
          <button onClick={onClearLogs} className="text-[11px] text-slate-400 hover:text-white">
            Xóa log
          </button>
        </div>
        <div
          ref={logTerminalRef}
          className="h-64 overflow-y-auto rounded-lg border border-slate-950 bg-slate-950 p-3 font-mono text-[11px] space-y-1 text-slate-300"
        >
          {logs.length === 0 ? (
            <div className="py-12 text-center text-slate-600">Đang chờ sự kiện mới từ phòng...</div>
          ) : (
            logs.map((l) => <AdminLogRow key={l.id} log={l} />)
          )}
        </div>
      </div>
    </div>
  );
}
