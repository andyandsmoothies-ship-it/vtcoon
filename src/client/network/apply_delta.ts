// [UC-GAME-009/MSS][TC-NET03.1/MSS][TC-NET03.2/MSS][UC-GAME-008/MSS]
// Đồng bộ hóa DeltaPayload (kể cả Sparse Diff) vào Zustand useGameStore
import { useGameStore, type PlayerHudInfo, FloatingTextType } from '../store/game_store.js';
import { useLobbyStore } from '../store/lobby_store.js';
import { useVfxStore } from '../store/vfx_store.js';
import { BOARD_SIZE } from '../../domain/room.js';
import { BOARD_CONFIG } from '../../domain/board_config.js';
import { PLAYER_TOKEN_PALETTE } from '../../domain/theme.js';
import type { DeltaPayload } from '../../server/session_manager.js';
import { formatCurrency } from '../ui/ui_helpers.js';
import { AudioEngine } from '../audio/audio_engine.js';
import { SoundEffect } from '../audio/audio_types.js';
import { trackDeltaActivities } from './activity_tracker.js';

export function isGameRunningDelta(delta: DeltaPayload): boolean {
  if (delta.roomStarted !== undefined) {
    return delta.roomStarted;
  }
  return (
    delta.tick > 0 ||
    Boolean(delta.players?.some((p) => p.position > 0 || p.balance !== 15000)) ||
    Boolean(delta.cells?.some((c) => c.ownerId || (c.level !== undefined && c.level > 0)))
  );
}

export function applyDeltaToStore(
  delta: DeltaPayload,
  store: typeof useGameStore = useGameStore,
): void {
  const state = store.getState();
  const isFullSync = Boolean(delta.cells && delta.cells.length === BOARD_SIZE);

  if (isFullSync && state.activePawnAnimation) {
    state.clearActivePawnAnimation();
  }

  const playersInfoMap: Record<string, PlayerHudInfo> = {};
  for (const [id, info] of Object.entries(state.playersInfo)) {
    playersInfoMap[id] = {
      ...info,
      ownedProperties: isFullSync ? [] : [...info.ownedProperties],
      mortgagedProperties: isFullSync ? [] : (info.mortgagedProperties ? [...info.mortgagedProperties] : []),
    };
  }
  let hasPlayerInfoChange = isFullSync && Object.keys(playersInfoMap).length > 0;

  // 1. Cập nhật vị trí, số dư và trạng thái người chơi từ delta.players TRƯỚC
  // Để khi duyệt delta.cells, playersInfoMap đã có đầy đủ hồ sơ người chơi để nạp quyền sở hữu tài sản
  if (delta.players && delta.players.length > 0) {
    const nextPositions = { ...state.playerPositions };
    let hasPositionChange = false;

    for (const p of delta.players) {
      if (nextPositions[p.id] !== p.position) {
        const fromCell = nextPositions[p.id];
        nextPositions[p.id] = p.position;
        hasPositionChange = true;
        if (!isFullSync && state.startPawnMove && fromCell !== undefined && fromCell !== p.position) {
          state.startPawnMove(p.id, p.position, fromCell);
          try {
            AudioEngine.playSfx(SoundEffect.PAWN_STEP);
          } catch {
            /* safe-ignore: audio uninitialized in unit test environment */
          }
        }
      }

      const existing = playersInfoMap[p.id];
      if (existing) {
        const oldBalance = existing.balance;
        if (!isFullSync && oldBalance !== undefined && oldBalance !== p.balance) {
          const diff = p.balance - oldBalance;
          if (diff > 0) {
            state.addFloatingText({
              text: `+${formatCurrency(diff)}`,
              type: FloatingTextType.Reward,
              playerId: p.id,
            });
            if (oldBalance < 0 && p.balance >= 0) {
              if (state.activeModal === 'insolvency') {
                state.closeModal();
              }
              state.addFloatingText({
                text: '🎉 Thoát vỡ nợ thành công! Hãy bấm Hết Lượt.',
                type: FloatingTextType.Reward,
                playerId: p.id,
              });
            }
          } else if (diff < 0) {
            state.addFloatingText({
              text: formatCurrency(diff),
              type: FloatingTextType.Penalty,
              playerId: p.id,
            });
          }
        }

        playersInfoMap[p.id] = {
          ...existing,
          balance: p.balance,
          ...(p.bankrupt !== undefined ? { bankrupt: p.bankrupt } : {}),
          ...(p.isBot !== undefined ? { isBot: p.isBot } : {}),
          ...(p.overdraftRoundsLeft !== undefined ? { overdraftRoundsLeft: p.overdraftRoundsLeft } : {}),
          ...(p.inAudit !== undefined ? { inAudit: p.inAudit } : {}),
          ...(p.auditTurnsLeft !== undefined ? { auditTurnsLeft: p.auditTurnsLeft } : {}),
          ...(p.skipNextTurn !== undefined ? { skipNextTurn: p.skipNextTurn } : {}),
          ...(p.consecutiveDoubles !== undefined ? { consecutiveDoubles: p.consecutiveDoubles } : {}),
        };
        hasPlayerInfoChange = true;
      } else {
        const pIdx = delta.players.indexOf(p);
        let lobbySlot: { playerName?: string; tokenColor?: string } | undefined;
        try {
          lobbySlot = useLobbyStore.getState().slots?.find((s) => s.playerId === p.id);
        } catch {
          /* safe-ignore: lobbyStore uninitialized in isolated test environment */
        }

        const tokenColor = lobbySlot?.tokenColor ?? (PLAYER_TOKEN_PALETTE[pIdx % PLAYER_TOKEN_PALETTE.length] ?? '#38BDF8');
        const playerName = lobbySlot?.playerName || (p.isBot ? `Bot AI ${p.id.replace(/\D/g, '') || pIdx + 1}` : `Người Chơi (${p.id.toUpperCase()})`);

        playersInfoMap[p.id] = {
          id: p.id,
          name: playerName,
          balance: p.balance,
          tokenColor,
          ownedProperties: [],
          mortgagedProperties: [],
          isBot: Boolean(p.isBot),
          ...(p.bankrupt !== undefined ? { bankrupt: p.bankrupt } : {}),
          ...(p.overdraftRoundsLeft !== undefined ? { overdraftRoundsLeft: p.overdraftRoundsLeft } : {}),
          ...(p.inAudit !== undefined ? { inAudit: p.inAudit } : {}),
          ...(p.auditTurnsLeft !== undefined ? { auditTurnsLeft: p.auditTurnsLeft } : {}),
          ...(p.skipNextTurn !== undefined ? { skipNextTurn: p.skipNextTurn } : {}),
          ...(p.consecutiveDoubles !== undefined ? { consecutiveDoubles: p.consecutiveDoubles } : {}),
        };
        hasPlayerInfoChange = true;
      }
    }

    if (hasPositionChange) state.setPlayerPositions(nextPositions);
  }

  // 2. Cập nhật các ô biến động và gán quyền sở hữu, thế chấp vào playersInfoMap
  if (delta.cells && delta.cells.length > 0) {
    const nextLevelMap = { ...state.levelMap };
    let hasLevelChange = false;

    for (const cell of delta.cells) {
      if (cell.level !== undefined) {
        const oldLevel = state.levelMap[cell.index] ?? 0;
        const targetLevel = Math.max(0, Math.min(3, cell.level)) as 0 | 1 | 2 | 3;
        nextLevelMap[cell.index] = targetLevel;
        hasLevelChange = true;
        if (!isFullSync && targetLevel > oldLevel && targetLevel >= 1) {
          try {
            useVfxStore.getState().triggerConstructionSlam(cell.index, targetLevel as 1 | 2 | 3);
          } catch {
            // Fallback im lặng trong môi trường test
          }
        }
        if (!isFullSync && targetLevel === 3 && oldLevel < 3) {
          try {
            AudioEngine.playSfx(SoundEffect.UPGRADE_C3);
          } catch {
            // Fallback im lặng trong môi trường test
          }
        }
      }

      if (cell.ownerId !== undefined) {
        for (const [id, pInfo] of Object.entries(playersInfoMap)) {
          if (id !== cell.ownerId) {
            const hasOwned = pInfo.ownedProperties.includes(cell.index);
            const hasMortgaged = Boolean(pInfo.mortgagedProperties?.includes(cell.index));
            if (hasOwned || hasMortgaged) {
              playersInfoMap[id] = {
                ...pInfo,
                ownedProperties: hasOwned
                  ? pInfo.ownedProperties.filter((idx) => idx !== cell.index)
                  : pInfo.ownedProperties,
                mortgagedProperties: hasMortgaged
                  ? (pInfo.mortgagedProperties ?? []).filter((idx) => idx !== cell.index)
                  : pInfo.mortgagedProperties,
              };
              hasPlayerInfoChange = true;
            }
          }
        }
        if (cell.ownerId) {
          if (!playersInfoMap[cell.ownerId]) {
            playersInfoMap[cell.ownerId] = {
              id: cell.ownerId,
              name: `Người Chơi (${cell.ownerId.toUpperCase()})`,
              balance: 15000,
              tokenColor: '#38BDF8',
              ownedProperties: [],
              mortgagedProperties: [],
              isBot: false,
            };
            hasPlayerInfoChange = true;
          }
          const owner = playersInfoMap[cell.ownerId]!;
          if (!owner.ownedProperties.includes(cell.index)) {
            const nextOwned = [...owner.ownedProperties, cell.index];
            playersInfoMap[cell.ownerId] = {
              ...owner,
              ownedProperties: nextOwned,
            };
            hasPlayerInfoChange = true;
            if (!isFullSync) {
              const bCell = BOARD_CONFIG[cell.index];
              if (bCell?.colorGroup) {
                const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === bCell.colorGroup).map((c) => c.index);
                const hadAllBefore = groupCells.every((idx) => owner.ownedProperties.includes(idx));
                const hasAllNow = groupCells.every((idx) => nextOwned.includes(idx));
                if (!hadAllBefore && hasAllNow) {
                  state.addFloatingText({
                    text: `🎉 ĐỘC QUYỀN ${bCell.colorGroup.toUpperCase()}! Phí thuê cơ bản x2!`,
                    type: FloatingTextType.Reward,
                    playerId: cell.ownerId,
                  });
                }
              }
            }
          }
        }
      }

      if (cell.isMortgaged === true) {
        const ownerId = cell.ownerId ?? Object.keys(playersInfoMap).find((id) =>
          playersInfoMap[id]?.ownedProperties.includes(cell.index),
        );
        if (ownerId && playersInfoMap[ownerId]) {
          const owner = playersInfoMap[ownerId]!;
          const mortgaged = owner.mortgagedProperties ?? [];
          if (!mortgaged.includes(cell.index)) {
            playersInfoMap[ownerId] = {
              ...owner,
              mortgagedProperties: [...mortgaged, cell.index],
            };
            hasPlayerInfoChange = true;
          }
        }
      } else if (cell.isMortgaged === false || isFullSync) {
        for (const [id, pInfo] of Object.entries(playersInfoMap)) {
          if (pInfo.mortgagedProperties?.includes(cell.index)) {
            playersInfoMap[id] = {
              ...pInfo,
              mortgagedProperties: pInfo.mortgagedProperties.filter((idx) => idx !== cell.index),
            };
            hasPlayerInfoChange = true;
          }
        }
      }
    }

    if (hasLevelChange) state.setLevelMap(nextLevelMap);
  }

  if (hasPlayerInfoChange) state.setPlayersInfo(playersInfoMap);

  // 3. Cập nhật xúc xắc từ server
  if (delta.dice) {
    state.triggerDiceRoll([delta.dice[0], delta.dice[1]]);
    try {
      AudioEngine.playSfx(SoundEffect.DICE_ROLL);
    } catch {
      /* safe-ignore: audio uninitialized in unit test environment */
    }
  }

  // 4. Cập nhật lượt chơi hiện tại và thời gian từ Server
  const turnPlayerId = delta.currentTurnPlayerId ?? (delta.currentPlayerIndex !== undefined && delta.players ? delta.players[delta.currentPlayerIndex]?.id : undefined);
  if (turnPlayerId && state.currentTurnPlayerId !== turnPlayerId) {
    state.setCurrentTurnPlayerId(turnPlayerId);
    state.setTurnTimeRemaining(delta.timeRemaining ?? 60);
  } else if (delta.timeRemaining !== undefined) {
    state.setTurnTimeRemaining(delta.timeRemaining);
  }

  // 5. Đảm bảo quỹ kho bạc ban đầu nếu đang ở mức 0
  if (state.treasuryPool === 0) {
    state.setTreasuryPool(2000);
  }

  // 6. Đồng bộ hóa sàn đấu giá tự động (Auction)
  if (delta.auction) {
    state.openModal('auction', delta.auction);
  } else if (delta.auction === null) {
    if (state.activeModal === 'auction') {
      state.closeModal();
    }
  }

  // 7. Kích hoạt chuyển sang Sa Bàn 3D khi ván đấu đang diễn ra sau khi đã nạp đầy đủ dữ liệu vào useGameStore
  if (isGameRunningDelta(delta)) {
    try {
      useLobbyStore.getState().setGameStarted(true);
    } catch {
      /* safe-ignore: lobbyStore uninitialized in isolated test environment */
    }
  }

  // 8. Trích xuất và ghi nhận nhật ký hoạt động (Activity Feed)
  try {
    trackDeltaActivities(delta, state, store.getState());
  } catch {
    /* safe-ignore: activity tracker failure should not break game store state sync */
  }
}

