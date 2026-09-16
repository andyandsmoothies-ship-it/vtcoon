// [IMP-64] Extracted turn control handlers from App component (main.tsx)
// ZERO LOGIC CHANGE — code moved verbatim from main.tsx
import { useEffect, useCallback } from 'react';
import type React from 'react';
import { useGameStore } from '../store/game_store';
import { useLobbyStore } from '../store/lobby_store';
import { clearReconnectToken } from './use_game_ws';
import type { PlayerIntent } from '../../server/intent_dispatcher';
import type { WsClientMessage } from '../../server/network/network_types';

export interface TurnControlHandlers {
  handleRollDice: () => void;
  handleEndTurn: () => void;
  handleSendEmote: (emoteId: string) => void;
  handleLeaveRoom: () => void;
}

export function useAppTurnControls(
  isConnected: boolean,
  roomCode: string | null,
  localPlayerId: string,
  currentTurnPlayerId: string | null | undefined,
  gameStarted: boolean,
  setCurrentTurnPlayerId: (id: string) => void,
  triggerEmote: (pid: string, emoteId: string) => void,
  sendIntent: (intent: PlayerIntent) => boolean,
  sendEmote: (emoteId: string) => boolean,
  sendWsMessage: (msg: WsClientMessage) => boolean,
  landingTimerRef: React.RefObject<NodeJS.Timeout | null>,
): TurnControlHandlers {
  const turnTimeRemaining = useGameStore((state) => state.turnTimeRemaining);

  const handleRollDice = useCallback(() => {
    const store = useGameStore.getState();
    if (store.isRolling || store.activePawnAnimation?.isAnimating) return;
    store.setIsRolling(true);
    sendIntent({ type: 'INTENT_ROLL' });
  }, [sendIntent]);

  const handleEndTurn = useCallback(() => {
    if (isConnected) {
      sendIntent({ type: 'INTENT_END_TURN' });
    } else {
      const activeId = currentTurnPlayerId ?? 'p1';
      const activePlayers = Object.keys(useGameStore.getState().playersInfo);
      const currentIdx = activePlayers.indexOf(activeId);
      const nextId = activePlayers[(currentIdx + 1) % (activePlayers.length || 1)] ?? 'p1';
      setCurrentTurnPlayerId(nextId);
      useGameStore.getState().setTurnTimeRemaining(60);
    }
  }, [isConnected, currentTurnPlayerId, sendIntent, setCurrentTurnPlayerId]);

  // [UC-GAME-001] Tự động thực hiện hành động khi đồng hồ về 00:00 và đang trong lượt của người chơi
  useEffect(() => {
    if (!gameStarted || currentTurnPlayerId !== localPlayerId) return;
    // Khi kết nối WebSocket, TurnOrchestrator trên Server là nguồn chân lý duy nhất điều phối AFK; Client không gửi intent kép
    if (isConnected) return;
    if (turnTimeRemaining === 0) {
      const store = useGameStore.getState();
      if (store.hasRolledThisTurn) {
        handleEndTurn();
      } else if (!store.isRolling && !store.activePawnAnimation?.isAnimating) {
        handleRollDice();
      }
    }
  }, [gameStarted, currentTurnPlayerId, localPlayerId, turnTimeRemaining, isConnected, handleEndTurn, handleRollDice]);

  const handleSendEmote = useCallback(
    (emoteId: string) => {
      triggerEmote(localPlayerId, emoteId);
      if (isConnected) {
        sendEmote(emoteId);
      }
    },
    [localPlayerId, isConnected, sendEmote, triggerEmote]
  );

  const handleLeaveRoom = useCallback(() => {
    const confirmed = typeof window !== 'undefined'
      ? window.confirm('Bạn có chắc chắn muốn rời bàn và trở về sảnh chờ?')
      : true;
    if (!confirmed) return;

    if (landingTimerRef.current) {
      clearTimeout(landingTimerRef.current);
      (landingTimerRef as React.MutableRefObject<NodeJS.Timeout | null>).current = null;
    }

    if (isConnected && roomCode) {
      try {
        sendWsMessage({
          type: 'LEAVE_ROOM',
          playerId: localPlayerId,
          roomCode,
        });
      } catch {
        /* safe-ignore: socket may already be disconnected */
      }
    }

    if (roomCode) clearReconnectToken(roomCode);
    clearReconnectToken('VT8888');

    useGameStore.getState().closeModal();
    useGameStore.setState({
      activePawnAnimation: null,
      floatingTexts: [],
    });

    if (typeof window !== 'undefined' && window.history) {
      try {
        window.history.replaceState({}, '', window.location.pathname);
      } catch {
        /* safe-ignore: browser environment may restrict history manipulation */
      }
    }

    useLobbyStore.getState().setGameStarted(false);
  }, [isConnected, roomCode, localPlayerId, sendWsMessage, landingTimerRef]);

  return { handleRollDice, handleEndTurn, handleSendEmote, handleLeaveRoom };
}
