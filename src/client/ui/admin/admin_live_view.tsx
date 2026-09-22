// [IMP-25/MSS][IMP-28/MSS][IMP-166/MSS] Admin Live Room Inspector & Terminal View
import React, { useState } from 'react';
import type { AdminRoomDetail, AdminRoomLogEntry, AdminPlayerSummary } from '../../../server/network/admin_types';
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

function renderPlayerBadge(p: AdminPlayerSummary): React.ReactElement {
  if (p.inGracePeriod) {
    return (
      <span
        title={`Người chơi mất kết nối! Thời gian ân hạn còn lại: ${p.graceSecondsLeft ?? 0}s trước khi Bot tiếp quản.`}
        className="rounded border border-amber-500/50 bg-amber-950 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 animate-pulse cursor-help shrink-0 whitespace-nowrap"
      >
        🟡 Ân hạn {p.graceSecondsLeft ?? 0}s
      </span>
    );
  }
  if (p.isBot) {
    return <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap">🤖 Bot</span>;
  }
  if (p.isConnected !== false) {
    return (
      <span className="rounded border border-emerald-500/30 bg-emerald-950 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 shrink-0 whitespace-nowrap">
        🟢 Online
      </span>
    );
  }
  return (
    <span className="rounded border border-red-500/30 bg-red-950 px-1.5 py-0.5 text-[10px] font-bold text-red-400 shrink-0 whitespace-nowrap">
      🔴 Offline
    </span>
  );
}

export function AdminLiveView({
  selectedRoomDetail,
  logs,
  logTerminalRef,
  onClearLogs,
  onTerminate,
  showToast,
}: AdminLiveViewProps): React.ReactElement {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

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

  const selectedPlayer = selectedPlayerId
    ? selectedRoomDetail.players.find((p) => p.id === selectedPlayerId)
    : null;

  const playerOwnedProperties = selectedPlayerId
    ? Object.entries(selectedRoomDetail.propertyStates)
        .filter(([, st]) => st.ownerId === selectedPlayerId)
        .map(([idx, st]) => ({ index: Number(idx), level: st.level, isMortgaged: st.isMortgaged }))
    : [];

  const playerRecentLogs = selectedPlayerId
    ? logs.filter((l) => l.playerId === selectedPlayerId).slice(-10)
    : [];

  return (
    <div className="space-y-4">
      {/* Header Panel */}
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

      {/* Banner Lượt Hiện Tại */}
      {!selectedRoomDetail.started ? (
        <div className="flex items-center justify-between rounded-lg border border-cyan-500/30 bg-cyan-950/20 px-4 py-2.5 text-xs">
          <span className="font-semibold text-cyan-300">🛋️ Sảnh Chờ Phòng Chơi</span>
          <span className="text-slate-400">
            Đang tập hợp người chơi ({selectedRoomDetail.players.length}/4) — Trận đấu chưa bắt đầu
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-amber-500/40 bg-amber-950/25 px-4 py-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-400">🎲 LƯỢT HIỆN TẠI:</span>
            <span className="rounded bg-amber-400/20 px-2 py-0.5 font-mono font-bold text-amber-300">
              {selectedRoomDetail.currentTurnPlayerId ?? 'Chưa xác định'}
            </span>
            <span className="text-slate-500">—</span>
            <span className="font-medium text-slate-200">
              {selectedRoomDetail.currentTurnStepName ?? 'Đang xử lý'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-slate-400">Thời gian còn lại:</span>
            <span className={`font-bold ${
              (selectedRoomDetail.turnSecondsLeft ?? 0) <= 5
                ? 'text-red-400 animate-pulse'
                : (selectedRoomDetail.turnSecondsLeft ?? 0) <= 15
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}>
              ⏱️ {selectedRoomDetail.turnSecondsLeft ?? 0}s
            </span>
          </div>
        </div>
      )}

      {/* Player Cards */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Thông Số Người Chơi Thực Tế (Click để soi kính lúp)
          </h3>
          {selectedPlayerId && (
            <button
              onClick={() => setSelectedPlayerId(null)}
              className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
            >
              ✕ Hủy chọn người chơi
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {selectedRoomDetail.players.map((p) => {
            const isSelected = selectedPlayerId === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPlayerId((prev) => (prev === p.id ? null : p.id))}
                className={`cursor-pointer rounded-lg border p-3 transition-all ${
                  isSelected
                    ? 'border-amber-400 bg-slate-800 ring-2 ring-amber-400/50'
                    : p.bankrupt
                    ? 'border-slate-800 bg-slate-950/60 opacity-60 hover:border-slate-700'
                    : 'border-slate-700 bg-slate-950 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between text-xs min-w-0 gap-1.5">
                  <span className="font-bold text-slate-200 truncate">{p.id}</span>
                  {renderPlayerBadge(p)}
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
            );
          })}
        </div>
      </div>

      {/* Kính Lúp Hỗ Trợ Người Chơi (Player Support Magnifier) */}
      {selectedPlayer && (
        <div className="rounded-xl border border-amber-500/40 bg-slate-900/90 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-base">🔍</span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Kính Lúp Hỗ Trợ: {selectedPlayer.id}
              </h4>
              {renderPlayerBadge(selectedPlayer)}
            </div>
            <button
              onClick={() => setSelectedPlayerId(null)}
              className="rounded px-2 py-0.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              ✕ Đóng
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5">
              <span className="text-[11px] text-slate-400">Tài Chính & Vị Trí</span>
              <div className="mt-1 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Số dư ví:</span>
                  <span className={selectedPlayer.balance < 0 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                    {selectedPlayer.balance.toLocaleString()} Tr
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tài sản ròng:</span>
                  <span className="text-amber-300 font-bold">{selectedPlayer.netWorth.toLocaleString()} Tr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ô hiện tại:</span>
                  <span className="text-slate-300">Ô số {selectedPlayer.position}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 md:col-span-2">
              <span className="text-[11px] text-slate-400">
                Bất Động Sản Sở Hữu ({playerOwnedProperties.length} ô)
              </span>
              <div className="mt-1 flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                {playerOwnedProperties.length === 0 ? (
                  <span className="text-slate-600 text-[11px]">Chưa sở hữu bất động sản nào</span>
                ) : (
                  playerOwnedProperties.map((prop) => (
                    <span
                      key={prop.index}
                      className={`rounded px-2 py-0.5 text-[11px] font-mono border ${
                        prop.isMortgaged
                          ? 'border-red-500/40 bg-red-950/30 text-red-300'
                          : 'border-slate-700 bg-slate-800 text-slate-200'
                      }`}
                    >
                      Ô {prop.index} (Cấp {prop.level}){prop.isMortgaged ? ' [Thế chấp]' : ''}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-1 text-[11px] font-semibold text-slate-400">
              10 Hành Động Gần Nhất Của Người Chơi {selectedPlayer.id}
            </div>
            <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-950 bg-slate-950 p-2 font-mono text-[11px] space-y-1 text-slate-300">
              {playerRecentLogs.length === 0 ? (
                <div className="py-2 text-center text-slate-600 text-[11px]">Chưa có hành động nào của người chơi này</div>
              ) : (
                playerRecentLogs.map((l) => <AdminLogRow key={l.id} log={l} />)
              )}
            </div>
          </div>
        </div>
      )}

      {/* Live Event Stream Terminal */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            🔴 Live Stream Toàn Bàn ({logs.length} sự kiện gần nhất)
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
