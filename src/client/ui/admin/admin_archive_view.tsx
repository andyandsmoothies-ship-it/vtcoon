// [IMP-28/MSS] Admin Historical Match Viewer & Downloader View
import React from 'react';
import type { AdminArchivedRoomSummary, AdminRoomLogEntry } from '../../../server/network/admin_manager';
import { downloadLogFile } from './admin_repro';
import { AdminLogRow } from './admin_log_row';

export interface AdminArchiveViewProps {
  readonly selectedArchivedRoom: AdminArchivedRoomSummary | null;
  readonly archivedLogs: AdminRoomLogEntry[];
}

export function AdminArchiveView({
  selectedArchivedRoom,
  archivedLogs,
}: AdminArchiveViewProps): React.ReactElement {
  if (!selectedArchivedRoom) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500 text-sm">
        Chọn một ván đấu từ danh sách lịch sử bên trái để xem lại toàn bộ nhật ký
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-mono text-2xl font-bold text-cyan-300">{selectedArchivedRoom.roomCode}</h2>
            <span className={`rounded px-2 py-0.5 text-xs font-bold ${
              selectedArchivedRoom.status === 'FINISHED'
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-950 text-red-400 border border-red-500/30'
            }`}>
              {selectedArchivedRoom.status}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
            <span>Bắt đầu: <b className="text-slate-200">{new Date(selectedArchivedRoom.startTime).toLocaleString()}</b></span>
            {selectedArchivedRoom.endTime && (
              <span>Kết thúc: <b className="text-slate-200">{new Date(selectedArchivedRoom.endTime).toLocaleString()}</b></span>
            )}
            <span>Người chơi: <b className="text-slate-200">{selectedArchivedRoom.playerCount}</b></span>
            {selectedArchivedRoom.winner && (
              <span>Người thắng: <b className="text-amber-300">{selectedArchivedRoom.winner}</b></span>
            )}
            <span>Dung lượng: <b className="text-slate-200">{Math.round((selectedArchivedRoom.fileSizeBytes ?? 0) / 1024 * 10) / 10} KB</b></span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => downloadLogFile(selectedArchivedRoom.roomCode, archivedLogs, 'jsonl')}
            className="rounded border border-cyan-500/40 bg-cyan-950/40 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/60"
          >
            📥 Tải File Log (.jsonl)
          </button>
          <button
            onClick={() => downloadLogFile(selectedArchivedRoom.roomCode, archivedLogs, 'json')}
            className="rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold hover:bg-slate-700"
          >
            📄 Tải File Log (.json)
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div className="mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            📁 Nhật Ký Toàn Bộ Ván Đấu ({archivedLogs.length} sự kiện lưu trên đĩa)
          </h3>
          <span className="text-[11px] font-mono text-slate-400 truncate max-w-full sm:max-w-xs" title={selectedArchivedRoom.logFilePath}>
            {selectedArchivedRoom.logFilePath}
          </span>
        </div>
        <div className="h-[480px] overflow-auto rounded-lg border border-slate-950 bg-slate-950 p-3 font-mono text-[11px] space-y-1 text-slate-300">
          {archivedLogs.length === 0 ? (
            <div className="py-20 text-center text-slate-600">Đang đọc dữ liệu từ tệp log trên máy chủ...</div>
          ) : (
            archivedLogs.map((l) => <AdminLogRow key={l.id} log={l} />)
          )}
        </div>
      </div>
    </div>
  );
}
