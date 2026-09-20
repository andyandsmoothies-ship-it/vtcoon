// [IMP-64] Extracted session & WS event handlers from App component (main.tsx)
// ZERO LOGIC CHANGE — code moved verbatim from main.tsx
import React, { useEffect, useCallback, useRef } from 'react';
import { useGameStore, type PlayerHudInfo } from '../store/game_store';
import { useLobbyStore } from '../store/lobby_store';
import { useGameWs, isGameRunningDelta, clearReconnectToken } from './use_game_ws';
import { AudioEngine } from '../audio/audio_engine';
import { getInitialBalanceForPlayerCount } from '../../domain/room';
import { PLAYER_TOKEN_PALETTE } from '../../domain/theme';
import { getInitialLobbyConfig, executeCellLanding } from '../offline_landing';
import type { ReasonCode } from '../../server/network/network_types';
import type { DeltaPayload } from '../../server/session_manager';
import { formatServerErrorMessage } from '../ui/actionable_notification';
import { preloadBaseTileImages } from '../assets/tile_assets';

export const SERVER_ERROR_TOAST_TIMEOUT_MS = 6000;

export interface AppSessionHandlers {
  isConnected: boolean;
  sendIntent: ReturnType<typeof useGameWs>['sendIntent'];
  sendEmote: ReturnType<typeof useGameWs>['sendEmote'];
  sendWsMessage: ReturnType<typeof useGameWs>['sendWsMessage'];
  isConnectedRef: React.RefObject<boolean>;
  landingTimerRef: React.RefObject<NodeJS.Timeout | null>;
  prevTurnPlayerRef: React.RefObject<string | null>;
  prevPlayerIndexRef: React.RefObject<number | null>;
  prevPositionRef: React.RefObject<number | null>;
  lastHandledLandingTimestampRef: React.RefObject<number | null>;
}

export function useAppSession(
  roomCode: string | null,
  localPlayerId: string,
  isHost: boolean,
  lobbySlots: ReturnType<typeof useLobbyStore.getState>['slots'],
  gameStarted: boolean,
  openModal: ReturnType<typeof useGameStore.getState>['openModal'],
  triggerEmote: ReturnType<typeof useGameStore.getState>['triggerEmote'],
  currentTurnPlayerId: string | null | undefined,
  setPlayersInfo: ReturnType<typeof useGameStore.getState>['setPlayersInfo'],
  setCurrentTurnPlayerId: ReturnType<typeof useGameStore.getState>['setCurrentTurnPlayerId'],
  setTreasuryPool: ReturnType<typeof useGameStore.getState>['setTreasuryPool'],
  setPlayerPositions: ReturnType<typeof useGameStore.getState>['setPlayerPositions'],
  initLobby: ReturnType<typeof useLobbyStore.getState>['initLobby'],
  setErrorMessage: (msg: string | null) => void,
): AppSessionHandlers {
  const prevTurnPlayerRef = useRef<string | null>(null);
  const prevPlayerIndexRef = useRef<number | null>(null);
  const prevPositionRef = useRef<number | null>(null);
  const landingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectedRef = useRef(false);
  const lastHandledLandingTimestampRef = useRef<number | null>(null);

  useEffect(() => {
    preloadBaseTileImages();
    return () => {
      if (landingTimerRef.current) clearTimeout(landingTimerRef.current);
    };
  }, []);

  const handleCellLanding = useCallback(
    (activeId: string, targetCell: number) => {
      executeCellLanding(activeId, targetCell, currentTurnPlayerId ?? null, isConnectedRef.current);
    },
    [currentTurnPlayerId]
  );

  const lastLandedPawn = useGameStore((state) => state.lastLandedPawn);

  // [UI-S02/MSS] Mở modal và tương tác ô đất CHÍNH XÁC khi con cờ chạm đất tại ô đích
  useEffect(() => {
    if (!lastLandedPawn) return;
    if (lastLandedPawn.playerId === localPlayerId) {
      if (lastHandledLandingTimestampRef.current === lastLandedPawn.timestamp) {
        return;
      }
      lastHandledLandingTimestampRef.current = lastLandedPawn.timestamp;
      handleCellLanding(localPlayerId, lastLandedPawn.cellIndex);
    }
  }, [lastLandedPawn, localPlayerId, handleCellLanding]);

  const handleError = useCallback((reasonCode: ReasonCode) => {
    if (reasonCode === 'TOKEN_INVALID' || reasonCode === 'TOKEN_EXPIRED') {
      // Phục hồi trong suốt phiên kết nối cũ/hết hạn qua cơ chế tự động CREATE_ROOM / JOIN_ROOM của useGameWs
      return () => {};
    }
    const formatted = formatServerErrorMessage(reasonCode as string);
    setErrorMessage(formatted);
    if (reasonCode === 'NOT_ENOUGH_PLAYERS' || reasonCode === 'NOT_HOST' || reasonCode === 'ROOM_NOT_FOUND') {
      useLobbyStore.getState().setGameStarted(false);
    }
    const timer = setTimeout(() => setErrorMessage(null), SERVER_ERROR_TOAST_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [setErrorMessage]);

  const handleDelta = useCallback((delta: DeltaPayload) => {
    if (isGameRunningDelta(delta)) {
      useLobbyStore.getState().setGameStarted(true);
    }

    if (delta.timeRemaining !== undefined) {
      useGameStore.getState().setTurnTimeRemaining(delta.timeRemaining);
    } else if (delta.currentPlayerIndex !== undefined && delta.currentPlayerIndex !== prevPlayerIndexRef.current) {
      prevPlayerIndexRef.current = delta.currentPlayerIndex;
      useGameStore.getState().setTurnTimeRemaining(60);
    } else if (delta.currentTurnPlayerId && delta.currentTurnPlayerId !== prevTurnPlayerRef.current) {
      prevTurnPlayerRef.current = delta.currentTurnPlayerId;
      useGameStore.getState().setTurnTimeRemaining(60);
    }

    if (delta.players && delta.tick > 0) {
      const localP = delta.players.find((p) => p.id === localPlayerId);
      if (localP && localP.balance < 0) {
        const isBankrupt = Boolean(localP.bankrupt ?? useGameStore.getState().playersInfo[localPlayerId]?.bankrupt);
        if (!isBankrupt) {
          const currentModal = useGameStore.getState().activeModal;
          if (currentModal !== 'insolvency' && currentModal !== 'game_over') {
            openModal('insolvency', { playerId: localPlayerId, deficit: -localP.balance });
          }
        }
      }
    }
  }, [localPlayerId, openModal]);

  const handleRoomStarted = useCallback(() => {
    useLobbyStore.getState().setGameStarted(true);
  }, []);

  const handleReconnected = useCallback((_pid: string) => {
    // PLAYER_RECONNECTED thông báo người chơi đã kết nối lại.
    // Trạng thái gameStarted sẽ được quyết định chuẩn xác từ STATE_DELTA đầy đủ của server
    // nhằm tránh race condition ghi đè store trước khi nạp dữ liệu ván đấu.
  }, []);

  const handleGameOver = useCallback(
    (leaderboard: ReadonlyArray<{ readonly id: string; readonly netWorth: number }>) => {
      openModal('game_over', { leaderboard });
    },
    [openModal]
  );

  const handleEmote = useCallback(
    (pid: string, emoteId: string) => {
      triggerEmote(pid, emoteId);
    },
    [triggerEmote]
  );

  const handleSessionInit = useCallback((_token: string, activeRoomCode: string) => {
    if (activeRoomCode && activeRoomCode !== useLobbyStore.getState().roomCode) {
      useLobbyStore.getState().setRoomCode(activeRoomCode);
      if (typeof window !== 'undefined' && window.history) {
        try {
          const url = new URL(window.location.href);
          url.searchParams.set('room', activeRoomCode);
          window.history.replaceState({}, '', url.toString());
        } catch {
          /* safe-ignore: browser environment may restrict history manipulation */
        }
      }
    }
  }, []);

  const { isConnected, sendIntent, sendEmote, sendWsMessage } = useGameWs({
    roomCode: roomCode || 'VT8888',
    playerId: localPlayerId,
    isHost,
    autoConnect: true,
    onDelta: handleDelta,
    onError: handleError,
    onRoomStarted: handleRoomStarted,
    onReconnected: handleReconnected,
    onGameOver: handleGameOver,
    onEmote: handleEmote,
    onSessionInit: handleSessionInit,
  });
  isConnectedRef.current = isConnected;

  useEffect(() => {
    AudioEngine.init();

    if (!roomCode) {
      const initCfg = getInitialLobbyConfig();
      initLobby(initCfg.roomCode, initCfg.playerId, initCfg.isHost, initCfg.playerName);
    }
  }, [roomCode, initLobby]);

  const gameInitializedRef = React.useRef(false);

  // Đồng bộ người chơi từ Sảnh Chờ sang Bàn Cờ một lần duy nhất khi trận đấu bắt đầu
  useEffect(() => {
    if (!gameStarted) {
      gameInitializedRef.current = false;
      return;
    }

    if (gameInitializedRef.current) {
      return;
    }
    gameInitializedRef.current = true;

    // Không ghi đè nếu store đã nhận thông tin người chơi từ server (ví dụ: Reconnect khi ván đấu đang diễn ra)
    const existingPlayers = useGameStore.getState().playersInfo;
    if (Object.keys(existingPlayers).length > 0) {
      return;
    }

    AudioEngine.handlePawnLanded(0);
    const occupied = lobbySlots.filter((s) => s.isOccupied);
    const initialBalance = getInitialBalanceForPlayerCount(occupied.length || 2);
    const playersInfoInit: Record<string, PlayerHudInfo> = {};
    const positions: Record<string, number> = {};

    occupied.forEach((s, idx) => {
      const pid = s.playerId ?? `p${idx + 1}`;
      playersInfoInit[pid] = {
        id: pid,
        name: s.playerName,
        balance: initialBalance,
        tokenColor: s.tokenColor ?? (PLAYER_TOKEN_PALETTE[idx] ?? '#38BDF8'),
        ownedProperties: [],
        isBot: s.isBot,
        pawnSlot: s.pawnSlot,
        mascotIcon: s.mascotIcon,
      };
      positions[pid] = 0;
    });

    setPlayersInfo(playersInfoInit);
    setPlayerPositions(positions);
    setCurrentTurnPlayerId(occupied[0]?.playerId ?? 'p1');
    setTreasuryPool(0);
  }, [gameStarted, lobbySlots, setPlayersInfo, setPlayerPositions, setCurrentTurnPlayerId, setTreasuryPool]);

  return {
    isConnected,
    sendIntent,
    sendEmote,
    sendWsMessage,
    isConnectedRef,
    landingTimerRef,
    prevTurnPlayerRef,
    prevPlayerIndexRef,
    prevPositionRef,
    lastHandledLandingTimestampRef,
  };
}
