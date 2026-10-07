// [IMP-64] Extracted session & WS event handlers from App component (main.tsx)
// ZERO LOGIC CHANGE — code moved verbatim from main.tsx
import React, { useEffect, useCallback, useRef } from 'react';
import { useGameStore, type PlayerHudInfo } from '../store/game_store';
import { useLobbyStore } from '../store/lobby_store';
import { useGameWs, isGameRunningDelta, clearReconnectToken } from './use_game_ws';
import { AudioEngine } from '../audio/audio_engine';
import { getInitialBalanceForPlayerCount } from '../../domain/room';
import { PLAYER_TOKEN_PALETTE } from '../../domain/theme';
import { executeCellLanding } from '../offline_landing';
import { consumeStagedTransitWheel } from './apply_delta.js';
import type { ReasonCode } from '../../server/network/network_types';
import type { DeltaPayload } from '../../server/session_manager';
import { formatServerErrorMessage } from '../ui/actionable_notification';
import { preloadBaseTileImages } from '../assets/tile_assets';
import { useTelemetryStore } from '../telemetry/telemetry_store';
import { hashSeed } from '../../domain/pawn_assignment';
import { purgeClientMatchSession } from './client_session_purger.js';

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

export function handleSessionServerError(
  reasonCode: ReasonCode,
  setErrorMessage: (msg: string | null) => void
): (() => void) | undefined {
  if (reasonCode === 'TOKEN_INVALID' || reasonCode === 'TOKEN_EXPIRED') {
    // Phục hồi trong suốt phiên kết nối cũ/hết hạn qua cơ chế tự động CREATE_ROOM / JOIN_ROOM của useGameWs
    return () => {};
  }
  const formatted = formatServerErrorMessage(reasonCode as string);
  setErrorMessage(formatted);
  if (reasonCode === 'NOT_ENOUGH_PLAYERS' || reasonCode === 'NOT_HOST' || reasonCode === 'ROOM_NOT_FOUND') {
    useLobbyStore.getState().setGameStarted(false);
  }
  if (reasonCode === 'ROOM_NOT_FOUND' || reasonCode === 'ROOM_FULL') {
    useLobbyStore.getState().resetLobby();
    if (typeof window !== 'undefined' && window.history) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }
  const timer = setTimeout(() => setErrorMessage(null), SERVER_ERROR_TOAST_TIMEOUT_MS);
  return () => clearTimeout(timer);
}

export function shouldAutoOpenInsolvencyModal(
  currentModal: string | null,
  localBalance: number,
  isBankrupt: boolean,
): boolean {
  if (localBalance >= 0 || isBankrupt) return false;
  return currentModal !== 'insolvency' && currentModal !== 'game_over' && currentModal !== 'portfolio';
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
      purgeClientMatchSession({ clearGameStore: true });
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
    if (lastHandledLandingTimestampRef.current === lastLandedPawn.timestamp) {
      return;
    }
    lastHandledLandingTimestampRef.current = lastLandedPawn.timestamp;
    const stagedWheel = consumeStagedTransitWheel(lastLandedPawn.cellIndex, lastLandedPawn.playerId);
    if (stagedWheel && stagedWheel.cellIndex === lastLandedPawn.cellIndex && stagedWheel.playerId === lastLandedPawn.playerId) {
      useGameStore.getState().openModal('transit_wheel', stagedWheel);
    }
    handleCellLanding(lastLandedPawn.playerId, lastLandedPawn.cellIndex);
  }, [lastLandedPawn, handleCellLanding]);

  const handleError = useCallback((reasonCode: ReasonCode) => {
    return handleSessionServerError(reasonCode, setErrorMessage);
  }, [setErrorMessage]);

  const handleDelta = useCallback((delta: DeltaPayload) => {
    if (isGameRunningDelta(delta)) {
      useLobbyStore.getState().setGameStarted(true);
    }

    // [IMP-207] SSOT: Timer synchronization is exclusively handled by apply_delta.ts (syncTurnAndTimer)
    if (delta.currentPlayerIndex !== undefined) {
      prevPlayerIndexRef.current = delta.currentPlayerIndex;
    }
    if (delta.currentTurnPlayerId) {
      prevTurnPlayerRef.current = delta.currentTurnPlayerId;
    }

    if (delta.players && delta.tick > 0) {
      const localP = delta.players.find((p) => p.id === localPlayerId);
      if (localP) {
        const isBankrupt = Boolean(localP.bankrupt ?? useGameStore.getState().playersInfo[localPlayerId]?.bankrupt);
        const currentModal = useGameStore.getState().activeModal;
        if (shouldAutoOpenInsolvencyModal(currentModal, localP.balance, isBankrupt)) {
          openModal('insolvency', { playerId: localPlayerId, deficit: -localP.balance });
        } else if (useGameStore.getState().activeModal === 'insolvency') {
          useGameStore.getState().closeModal();
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
    if (activeRoomCode) {
      useTelemetryStore.getState().setSessionMetadata({
        roomCode: activeRoomCode,
        seed: hashSeed(activeRoomCode),
      });
    }
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
    roomCode: roomCode || '',
    playerId: localPlayerId,
    isHost,
    autoConnect: Boolean(roomCode),
    onDelta: handleDelta,
    onError: handleError,
    onRoomStarted: handleRoomStarted,
    onReconnected: handleReconnected,
    onGameOver: handleGameOver,
    onEmote: handleEmote,
    onSessionInit: handleSessionInit,
    // [IMP-165] Cắm dây onLobbyUpdate để syncLobbySlots được gọi từ WS layer
    onLobbyUpdate: (players) => useLobbyStore.getState().syncLobbySlots?.(players),
  });
  isConnectedRef.current = isConnected;

  useEffect(() => {
    AudioEngine.init();

    if (roomCode) {
      useTelemetryStore.getState().setSessionMetadata({
        roomCode,
        seed: hashSeed(roomCode),
      });
    }
  }, [roomCode]);

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
