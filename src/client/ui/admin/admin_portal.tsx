// [IMP-25/MSS][IMP-28/MSS] Admin Central Portal & Multi-Room Historical Inspector UI
import React from 'react';
import { AdminLockScreen } from './admin_lock_screen';
import { useAdminPortal } from './use_admin_portal';
import { AdminLiveView } from './admin_live_view';
import { AdminArchiveView } from './admin_archive_view';

export function AdminPortal(): React.ReactElement {
  const {
    secret,
    setSecret,
    isAuthenticated,
    authError,
    activeTab,
    setActiveTab,
    rooms,
    archivedRooms,
    selectedRoomCode,
    selectedRoomDetail,
    selectedArchivedRoom,
    logs,
    setLogs,
    archivedLogs,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    toastMessage,
    logTerminalRef,
    filteredRooms,
    filteredArchivedRooms,
    connectWs,
    showToast,
    handleSelectRoom,
    handleSelectArchived,
    handleRefresh,
    handleTerminate,
    handleLogout,
  } = useAdminPortal();

  if (!isAuthenticated) {
    return (
      <AdminLockScreen
        secret={secret}
        authError={authError}
        onSecretChange={setSecret}
        onSubmit={() => connectWs(secret)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 font-sans text-slate-100">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-6">
        <div className="flex items-center gap-3">
          <span className="text-xl">🛡️</span>
          <span className="text-sm font-bold tracking-wider text-amber-400">VTCOON ADMIN PORTAL</span>
          <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-emerald-400">
            {rooms.length} Bàn Live
          </span>
          <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-cyan-400">
            {archivedRooms.length} Bàn Lịch Sử
          </span>
        </div>
        <div className="flex items-center gap-3">
          {toastMessage && (
            <span className="rounded bg-emerald-950 border border-emerald-500/40 px-3 py-1 text-xs text-emerald-300">
              {toastMessage}
            </span>
          )}
          <button
            onClick={handleRefresh}
            className="rounded border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold hover:bg-slate-700"
          >
            🔄 Làm Mới
          </button>
          <button
            onClick={handleLogout}
            className="rounded border border-red-500/40 bg-red-950/40 px-3 py-1 text-xs text-red-300 hover:bg-red-900/60"
          >
            Đăng Xuất
          </button>
          <a
            href="/"
            className="rounded border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300 hover:text-white"
          >
            Đến Game →
          </a>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-96 flex-col border-r border-slate-800 bg-slate-900/60">
          <div className="border-b border-slate-800 p-2 flex gap-1 bg-slate-950/50">
            <button
              onClick={() => setActiveTab('LIVE')}
              className={`flex-1 py-1.5 px-2 rounded text-xs font-bold transition-colors ${
                activeTab === 'LIVE'
                  ? 'bg-amber-400 text-amber-950'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              🟢 Đang Chơi ({rooms.length})
            </button>
            <button
              onClick={() => setActiveTab('ARCHIVE')}
              className={`flex-1 py-1.5 px-2 rounded text-xs font-bold transition-colors ${
                activeTab === 'ARCHIVE'
                  ? 'bg-cyan-500 text-cyan-950'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              📁 Lịch Sử ({archivedRooms.length})
            </button>
          </div>

          <div className="space-y-2 border-b border-slate-800 p-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'LIVE' ? 'Tìm mã phòng, host...' : 'Tìm mã phòng, người thắng...'}
              className="w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-amber-400 focus:outline-none"
            />
            {activeTab === 'LIVE' && (
              <div className="flex gap-1">
                {(['ALL', 'NORMAL', 'WARNING', 'CRITICAL'] as const).map((st) => {
                  const isCurrent = statusFilter === st;
                  const label = st === 'ALL' ? 'Tất Cả' : st === 'NORMAL' ? '🟢 Xanh' : st === 'WARNING' ? '🟡 Cảnh Báo' : '🔴 Lỗi';
                  const btnClass = isCurrent
                    ? 'flex-1 rounded py-1 text-[10px] font-bold bg-amber-400 text-amber-950'
                    : 'flex-1 rounded py-1 text-[10px] font-bold bg-slate-800 text-slate-400 hover:text-white';
                  return (
                    <button key={st} onClick={() => setStatusFilter(st)} className={btnClass}>
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {activeTab === 'LIVE' ? (
              filteredRooms.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">Không tìm thấy bàn chơi nào</div>
              ) : (
                filteredRooms.map((r) => {
                  const isSelected = r.roomCode === selectedRoomCode;
                  const borderBg = r.status === 'NORMAL'
                    ? 'border-emerald-500/40 bg-emerald-950/20'
                    : r.status === 'WARNING'
                    ? 'border-amber-500/40 bg-amber-950/20'
                    : 'border-red-500/40 bg-red-950/20';

                  const cardClass = isSelected
                    ? 'cursor-pointer rounded-lg border border-amber-400 bg-slate-800 p-3 transition-colors'
                    : `cursor-pointer rounded-lg border ${borderBg} p-3 transition-colors hover:border-slate-600`;

                  return (
                    <div key={r.roomCode} onClick={() => handleSelectRoom(r.roomCode)} className={cardClass}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-bold text-amber-300">{r.roomCode}</span>
                        <span className="text-xs">
                          {r.status === 'NORMAL' ? '🟢 Bình thường' : r.status === 'WARNING' ? '🟡 Cảnh báo' : '🔴 Vi phạm'}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Host: {r.hostId}</span>
                        <span>{r.playerCount} người | Vòng {r.round}</span>
                      </div>
                      {r.warningReason && (
                        <div className="mt-1 text-[11px] font-medium text-red-400 line-clamp-1">
                          ⚠️ {r.warningReason}
                        </div>
                      )}
                    </div>
                  );
                })
              )
            ) : (
              filteredArchivedRooms.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">Chưa có bản ghi lịch sử nào</div>
              ) : (
                filteredArchivedRooms.map((a) => {
                  const isSelected = selectedArchivedRoom?.logFilePath === a.logFilePath;
                  const cardClass = isSelected
                    ? 'cursor-pointer rounded-lg border border-cyan-400 bg-slate-800 p-3 transition-colors'
                    : 'cursor-pointer rounded-lg border border-slate-800 bg-slate-900/60 p-3 transition-colors hover:border-slate-700';

                  return (
                    <div key={a.logFilePath} onClick={() => handleSelectArchived(a)} className={cardClass}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-bold text-cyan-300">{a.roomCode}</span>
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          a.status === 'FINISHED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                            : a.status === 'TERMINATED'
                            ? 'bg-red-950 text-red-300 border border-red-500/30'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                        }`}>
                          {a.status}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Bắt đầu: {new Date(a.startTime).toLocaleTimeString()}</span>
                        <span>{a.playerCount} người | {a.totalEvents} sự kiện</span>
                      </div>
                      {a.winner && (
                        <div className="mt-1 text-[11px] text-amber-300 font-medium">
                          🏆 Người thắng: {a.winner}
                        </div>
                      )}
                    </div>
                  );
                })
              )
            )}
          </div>
        </aside>

        <main className="flex flex-1 flex-col overflow-y-auto p-6">
          {activeTab === 'LIVE' ? (
            <AdminLiveView
              selectedRoomDetail={selectedRoomDetail}
              logs={logs}
              logTerminalRef={logTerminalRef}
              onClearLogs={() => setLogs([])}
              onTerminate={handleTerminate}
              showToast={showToast}
            />
          ) : (
            <AdminArchiveView
              selectedArchivedRoom={selectedArchivedRoom}
              archivedLogs={archivedLogs}
            />
          )}
        </main>
      </div>
    </div>
  );
}
