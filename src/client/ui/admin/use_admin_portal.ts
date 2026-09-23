// [IMP-25/MSS][IMP-28/MSS] useAdminPortal Custom Hook
import { useState, useEffect, useRef, useMemo } from 'react';
import type {
  AdminRoomSummary,
  AdminRoomDetail,
  AdminRoomLogEntry,
  AdminArchivedRoomSummary,
  RoomHealthStatus,
  ServerVitals,
} from '../../../server/network/admin_types';
import type { WsServerMessage, WsClientMessage } from '../../../server/network/network_types';

export const STORAGE_KEY = 'vtcoon_admin_secret';
export const DEFAULT_SECRET = '';

export type AdminTab = 'LIVE' | 'ARCHIVE';

export function useAdminPortal() {
  const [secret, setSecret] = useState<string>(() => {
    return (typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY) : null) ?? DEFAULT_SECRET;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('LIVE');
  const [rooms, setRooms] = useState<AdminRoomSummary[]>([]);
  const [archivedRooms, setArchivedRooms] = useState<AdminArchivedRoomSummary[]>([]);
  const [selectedRoomCode, setSelectedRoomCode] = useState<string | null>(null);
  const [selectedRoomDetail, setSelectedRoomDetail] = useState<AdminRoomDetail | null>(null);
  const [selectedArchivedRoom, setSelectedArchivedRoom] = useState<AdminArchivedRoomSummary | null>(null);
  const [logs, setLogs] = useState<AdminRoomLogEntry[]>([]);
  const [archivedLogs, setArchivedLogs] = useState<AdminRoomLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | RoomHealthStatus>('ALL');
  const [lifecycleFilter, setLifecycleFilter] = useState<'ALL' | 'LOBBY' | 'PLAYING'>('ALL');
  const [serverVitals, setServerVitals] = useState<ServerVitals | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);

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
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const isLocalDev =
      typeof window !== 'undefined' &&
      (window.location.host === 'localhost:3000' || window.location.host === '127.0.0.1:3000');
    const protocol = isHttps ? 'wss:' : 'ws:';
    const host = typeof window !== 'undefined'
      ? (isLocalDev ? `${window.location.hostname || 'localhost'}:3001` : window.location.host)
      : 'localhost:3001';
    const ws = new WebSocket(`${protocol}//${host}`);
    wsRef.current = ws;

    ws.onopen = () => {
      const authMsg: WsClientMessage = { type: 'ADMIN_AUTH', secret: secretToAuth };
      ws.send(JSON.stringify(authMsg));
    };

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data.toString()) as WsServerMessage;
        handleServerMessage(msg, secretToAuth);
      } catch (err) {
        console.error('[AdminPortal] Parse error:', err);
      }
    };

    ws.onerror = () => setAuthError('Không thể kết nối tới máy chủ WebSocket');
  };

  const handleServerMessage = (msg: WsServerMessage, secretToAuth: string): void => {
    if (msg.type === 'ADMIN_AUTH_SUCCESS') {
      setIsAuthenticated(true);
      setAuthError(null);
      sessionStorage.setItem(STORAGE_KEY, secretToAuth);
      showToast('Xác thực quản trị viên thành công');
      fetchArchivedRooms();
    } else if (msg.type === 'ADMIN_AUTH_FAILED') {
      setIsAuthenticated(false);
      setAuthError(msg.reason);
    } else if (msg.type === 'ADMIN_ROOM_LIST') {
      if (msg.vitals) {
        setServerVitals(msg.vitals);
      }
      handleRoomListUpdate(msg.rooms as AdminRoomSummary[]);
    } else if (msg.type === 'ADMIN_ARCHIVED_ROOM_LIST') {
      setArchivedRooms(msg.rooms as AdminArchivedRoomSummary[]);
    } else if (msg.type === 'ADMIN_ROOM_DETAIL') {
      if (msg.roomCode === selectedRoomCodeRef.current) {
        setSelectedRoomDetail(msg.detail);
        setLogs(msg.recentLogs as AdminRoomLogEntry[]);
      }
    } else if (msg.type === 'ADMIN_ARCHIVED_LOG_DATA') {
      setArchivedLogs(msg.logs as AdminRoomLogEntry[]);
    } else if (msg.type === 'ADMIN_ROOM_LOG') {
      if (msg.roomCode === selectedRoomCodeRef.current) {
        setLogs((prev) => [...prev.slice(-2000), msg.log as AdminRoomLogEntry]);
      }
    } else if (msg.type === 'ADMIN_ACTION_SUCCESS') {
      showToast(`Thao tác thành công: ${msg.action} (${msg.roomCode})`);
      if (msg.action === 'TERMINATE_ROOM' && msg.roomCode === selectedRoomCodeRef.current) {
        setSelectedRoomDetail(null);
        setSelectedRoomCode(null);
        setLogs([]);
      }
      fetchArchivedRooms();
    } else if (msg.type === 'ADMIN_ERROR') {
      showToast(`Lỗi: ${msg.message}`);
    } else if (msg.type === 'ADMIN_SYNC_CLOUD_RESULT') {
      setIsSyncingCloud(false);
      const toast = msg.success
        ? `Đồng bộ Cloud thành công (${msg.uploadedCount} tệp -> ${msg.bucket})`
        : `Đồng bộ Cloud thất bại: ${msg.message || 'Lỗi không xác định'}`;
      showToast(toast);
    }
  };

  const handleRoomListUpdate = (roomList: AdminRoomSummary[]): void => {
    setRooms(roomList);
    const curCode = selectedRoomCodeRef.current;
    if (curCode) {
      const summary = roomList.find((r) => r.roomCode === curCode);
      if (!summary) {
        setSelectedRoomDetail(null);
        setSelectedRoomCode(null);
        setLogs([]);
        showToast(`Bàn chơi ${curCode} đã đóng`);
        fetchArchivedRooms();
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
          currentTurnPlayerId: summary.currentTurnPlayerId,
          currentTurnStepName: summary.currentTurnStepName,
          turnSecondsLeft: summary.turnSecondsLeft,
        } : prev));
      }
    }
  };

  const fetchArchivedRooms = (): void => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'ADMIN_GET_ARCHIVED_ROOMS' }));
    }
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

  const handleSelectArchived = (summary: AdminArchivedRoomSummary): void => {
    setSelectedArchivedRoom(summary);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'ADMIN_GET_ARCHIVED_LOGS',
        roomCode: summary.roomCode,
        timestamp: summary.startTime,
      }));
    }
  };

  const handleRefresh = (): void => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'ADMIN_GET_ROOMS' }));
      wsRef.current.send(JSON.stringify({ type: 'ADMIN_GET_ARCHIVED_ROOMS' }));
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

  const handleLogout = (): void => {
    sessionStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
    if (wsRef.current) wsRef.current.close();
  };

  const handleSyncCloud = (): void => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setIsSyncingCloud(true);
      wsRef.current.send(JSON.stringify({ type: 'ADMIN_SYNC_CLOUD_STORAGE' }));
    }
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchQuery = r.roomCode.toLowerCase().includes(q) || r.hostId.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchLifecycle =
        lifecycleFilter === 'ALL' ||
        (lifecycleFilter === 'LOBBY' && !r.started) ||
        (lifecycleFilter === 'PLAYING' && r.started);
      return matchQuery && matchStatus && matchLifecycle;
    });
  }, [rooms, searchQuery, statusFilter, lifecycleFilter]);

  const filteredArchivedRooms = useMemo(() => {
    return archivedRooms.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchQuery = r.roomCode.toLowerCase().includes(q) || (r.winner && r.winner.toLowerCase().includes(q));
      return matchQuery;
    });
  }, [archivedRooms, searchQuery]);

  return {
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
    lifecycleFilter,
    setLifecycleFilter,
    serverVitals,
    toastMessage,
    isSyncingCloud,
    logTerminalRef,
    filteredRooms,
    filteredArchivedRooms,
    connectWs,
    showToast,
    handleSelectRoom,
    handleSelectArchived,
    handleRefresh,
    handleSyncCloud,
    handleTerminate,
    handleLogout,
    fetchArchivedRooms,
  };
}
