// [IMP-25/MSS] Admin Central Portal & Multi-Room Inspector UI
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type {
  AdminRoomSummary,
  AdminRoomDetail,
  AdminRoomLogEntry,
  RoomHealthStatus,
} from '../../../server/network/admin_manager';
import type { WsServerMessage, WsClientMessage } from '../../../server/network/network_types';
import { copyText, downloadBlackBox, buildReproCode } from './admin_repro';
import { AdminLockScreen } from './admin_lock_screen';

const STORAGE_KEY = 'vtcoon_admin_secret';
const DEFAULT_SECRET = 'vtcoon-admin-2026';

export function AdminPortal(): React.ReactElement {
  const [secret, setSecret] = useState<string>(() => {
    return (typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY) : null) ?? DEFAULT_SECRET;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<AdminRoomSummary[]>([]);
  const [selectedRoomCode, setSelectedRoomCode] = useState<string | null>(null);
  const [selectedRoomDetail, setSelectedRoomDetail] = useState<AdminRoomDetail | null>(null);
  const [logs, setLogs] = useState<AdminRoomLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | RoomHealthStatus>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const logTerminalRef = useRef<HTMLDivElement | null>(null);
  const selectedRoomCodeRef = useRef<string | null>(null);
  selectedRoomCodeRef.current = selectedRoomCode;

  const showToast = (msg: string): void => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const connectWs = (secretToAuth: string): void => {
    if (wsRef.current) {
      try { wsRef.current.close(); } catch { /* safe-ignore */ }
    }
    const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = typeof window !== 'undefined' ? (window.location.hostname || 'localhost') : 'localhost';
    const ws = new WebSocket(`${protocol}//${host}:3001`);
    wsRef.current = ws;

    ws.onopen = () => {
      const authMsg: WsClientMessage = { type: 'ADMIN_AUTH', secret: secretToAuth };
      ws.send(JSON.stringify(authMsg));
    };

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data.toString()) as WsServerMessage;
        if (msg.type === 'ADMIN_AUTH_SUCCESS') {
          setIsAuthenticated(true);
          setAuthError(null);
          sessionStorage.setItem(STORAGE_KEY, secretToAuth);
          showToast('Xác thực quản trị viên thành công');
        } else if (msg.type === 'ADMIN_AUTH_FAILED') {
          setIsAuthenticated(false);
          setAuthError(msg.reason);
        } else if (msg.type === 'ADMIN_ROOM_LIST') {
          const roomList = msg.rooms as AdminRoomSummary[];
          setRooms(roomList);
          const curCode = selectedRoomCodeRef.current;
          if (curCode) {
            const summary = roomList.find((r) => r.roomCode === curCode);
            if (!summary) {
              setSelectedRoomDetail(null);
              setSelectedRoomCode(null);
              setLogs([]);
              showToast(`Bàn chơi ${curCode} đã đóng`);
            } else {
              setSelectedRoomDetail((prev) => (prev && prev.roomCode === curCode ? {
                ...prev,
                phase: summary.phase,
                round: summary.round,
                playerCount: summary.playerCount,
                players: summary.players,
                treasuryPool: summary.treasuryPool,
                status: summary.status,
                warningReason: summary.warningReason,
                lastActivity: summary.lastActivity,
                activeTimersCount: summary.activeTimersCount,
                hasAuction: summary.hasAuction,
              } : prev));
            }
          }
        } else if (msg.type === 'ADMIN_ROOM_DETAIL') {
          if (msg.roomCode === selectedRoomCodeRef.current) {
            setSelectedRoomDetail(msg.detail);
            setLogs(msg.recentLogs as AdminRoomLogEntry[]);
          }
        } else if (msg.type === 'ADMIN_ROOM_LOG') {
          if (msg.roomCode === selectedRoomCodeRef.current) {
            setLogs((prev) => [...prev.slice(-99), msg.log as AdminRoomLogEntry]);
          }
        } else if (msg.type === 'ADMIN_ACTION_SUCCESS') {
          showToast(`Thao tác thành công: ${msg.action} (${msg.roomCode})`);
          if (msg.action === 'TERMINATE_ROOM' && msg.roomCode === selectedRoomCodeRef.current) {
            setSelectedRoomDetail(null);
            setSelectedRoomCode(null);
            setLogs([]);
          }
        } else if (msg.type === 'ADMIN_ERROR') {
          showToast(`Lỗi: ${msg.message}`);
          if (msg.reasonCode === 'ADMIN_ROOM_NOT_FOUND') {
            setSelectedRoomDetail(null);
            setSelectedRoomCode(null);
            setLogs([]);
          }
        }
      } catch (err) {
        console.error('[AdminPortal] Parse error:', err);
      }
    };

    ws.onerror = () => setAuthError('Không thể kết nối tới máy chủ WebSocket');
  };

  useEffect(() => {
    if (secret) connectWs(secret);
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ADMIN_GET_ROOMS' }));
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [isAuthenticated]);

  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSelectRoom = (code: string): void => {
    setSelectedRoomCode(code);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'ADMIN_SUBSCRIBE_ROOM', roomCode: code }));
    }
  };

  const handleRefresh = (): void => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'ADMIN_GET_ROOMS' }));
      if (selectedRoomCode) {
        wsRef.current.send(JSON.stringify({ type: 'ADMIN_SUBSCRIBE_ROOM', roomCode: selectedRoomCode }));
      }
      showToast('Đã làm mới dữ liệu máy chủ');
    }
  };

  const handleTerminate = (code: string): void => {
    const reason = window.prompt(`Nhập lý do cưỡng chế đóng bàn ${code}:`, 'Nghi vấn gian lận / kẹt bàn');
    if (reason === null) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'ADMIN_TERMINATE_ROOM', roomCode: code, reason }));
    }
  };

  const handleCopyRepro = async (): Promise<void> => {
    if (!selectedRoomDetail) return;
    const code = buildReproCode(selectedRoomDetail, logs);
    const ok = await copyText(code);
    showToast(ok ? 'Đã sao chép mã Test Vitest vào Clipboard' : 'Lỗi khi sao chép mã test');
  };

  const handleLogout = (): void => {
    sessionStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
    if (wsRef.current) wsRef.current.close();
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchQuery = r.roomCode.toLowerCase().includes(q) || r.hostId.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [rooms, searchQuery, statusFilter]);

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
            {rooms.length} Bàn Đang Chạy
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
          <div className="space-y-2 border-b border-slate-800 p-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mã phòng, host..."
              className="w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-amber-400 focus:outline-none"
            />
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
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredRooms.length === 0 ? (
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
            )}
          </div>
        </aside>

        <main className="flex flex-1 flex-col overflow-y-auto p-6">
          {!selectedRoomDetail ? (
            <div className="flex h-full items-center justify-center text-slate-500 text-sm">
              Chọn một bàn chơi từ danh sách bên trái để bắt đầu theo dõi
            </div>
          ) : (
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
                    onClick={() => handleTerminate(selectedRoomDetail.roomCode)}
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
                  <button onClick={() => setLogs([])} className="text-[11px] text-slate-400 hover:text-white">
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
                    logs.map((l) => (
                      <div key={l.id} className="flex gap-2">
                        <span className="text-slate-500">{new Date(l.timestamp).toLocaleTimeString()}</span>
                        <span className={`font-bold ${
                          l.source === 'SYSTEM' ? 'text-purple-400' : l.source === 'BOT' ? 'text-cyan-400' : 'text-amber-400'
                        }`}>
                          [{l.source}]
                        </span>
                        <span className="text-emerald-400 font-semibold">{l.action}</span>
                        <span className="text-slate-300 flex-1">{l.payloadSummary}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
