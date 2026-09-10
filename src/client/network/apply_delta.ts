// [UC-GAME-009/MSS][TC-NET03.1/MSS][TC-NET03.2/MSS][UC-GAME-008/MSS]
// Đồng bộ hóa DeltaPayload (kể cả Sparse Diff) vào Zustand useGameStore
import { useGameStore, type PlayerHudInfo, FloatingTextType } from '../store/game_store.js';
import { BOARD_SIZE } from '../../domain/room.js';
import type { DeltaPayload } from '../../server/session_manager.js';
import { formatCurrency } from '../ui/ui_helpers.js';
import { AudioEngine } from '../audio/audio_engine.js';
import { SoundEffect } from '../audio/audio_types.js';

export function applyDeltaToStore(
  delta: DeltaPayload,
  store: typeof useGameStore = useGameStore,
): void {
  const state = store.getState();
  const isFullSync = Boolean(delta.cells && delta.cells.length === BOARD_SIZE);

  // 1. Cập nhật các ô biến động
  if (delta.cells && delta.cells.length > 0) {
    const nextLevelMap = { ...state.levelMap };
    let hasLevelChange = false;

    const nextPlayersInfo: Record<string, PlayerHudInfo> = {};
    for (const [id, info] of Object.entries(state.playersInfo)) {
      nextPlayersInfo[id] = {
        ...info,
        ownedProperties: [...info.ownedProperties],
        mortgagedProperties: info.mortgagedProperties ? [...info.mortgagedProperties] : [],
      };
    }
    let hasPlayerInfoChange = false;

    for (const cell of delta.cells) {
      if (cell.level !== undefined) {
        const oldLevel = state.levelMap[cell.index] ?? 0;
        const targetLevel = Math.max(0, Math.min(3, cell.level)) as 0 | 1 | 2 | 3;
        nextLevelMap[cell.index] = targetLevel;
        hasLevelChange = true;
        if (!isFullSync && targetLevel === 3 && oldLevel < 3) {
          try {
            AudioEngine.playSfx(SoundEffect.UPGRADE_C3);
          } catch {
            // Fallback im lặng trong môi trường test
          }
        }
      }

      if (cell.ownerId !== undefined) {
        for (const [id, pInfo] of Object.entries(nextPlayersInfo)) {
          if (id !== cell.ownerId) {
            const hasOwned = pInfo.ownedProperties.includes(cell.index);
            const hasMortgaged = Boolean(pInfo.mortgagedProperties?.includes(cell.index));
            if (hasOwned || hasMortgaged) {
              nextPlayersInfo[id] = {
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
        if (cell.ownerId && nextPlayersInfo[cell.ownerId]) {
          const owner = nextPlayersInfo[cell.ownerId]!;
          if (!owner.ownedProperties.includes(cell.index)) {
            nextPlayersInfo[cell.ownerId] = {
              ...owner,
              ownedProperties: [...owner.ownedProperties, cell.index],
            };
            hasPlayerInfoChange = true;
          }
        }
      }

      if (cell.isMortgaged === true) {
        const ownerId = cell.ownerId ?? Object.keys(nextPlayersInfo).find((id) =>
          nextPlayersInfo[id]?.ownedProperties.includes(cell.index),
        );
        if (ownerId && nextPlayersInfo[ownerId]) {
          const owner = nextPlayersInfo[ownerId]!;
          const mortgaged = owner.mortgagedProperties ?? [];
          if (!mortgaged.includes(cell.index)) {
            nextPlayersInfo[ownerId] = {
              ...owner,
              mortgagedProperties: [...mortgaged, cell.index],
            };
            hasPlayerInfoChange = true;
          }
        }
      } else if (cell.isMortgaged === false || isFullSync) {
        for (const [id, pInfo] of Object.entries(nextPlayersInfo)) {
          if (pInfo.mortgagedProperties?.includes(cell.index)) {
            nextPlayersInfo[id] = {
              ...pInfo,
              mortgagedProperties: pInfo.mortgagedProperties.filter((idx) => idx !== cell.index),
            };
            hasPlayerInfoChange = true;
          }
        }
      }
    }

    if (hasLevelChange) state.setLevelMap(nextLevelMap);
    if (hasPlayerInfoChange) state.setPlayersInfo(nextPlayersInfo);
  }

  // 2. Cập nhật xúc xắc từ server
  if (delta.dice) {
    state.triggerDiceRoll([delta.dice[0], delta.dice[1]]);
    try {
      AudioEngine.playSfx(SoundEffect.DICE_ROLL);
    } catch {}
  }

  // 3. Cập nhật lượt chơi hiện tại và đặt lại thời gian 60s
  if (delta.currentTurnPlayerId && state.currentTurnPlayerId !== delta.currentTurnPlayerId) {
    state.setCurrentTurnPlayerId(delta.currentTurnPlayerId);
    state.setTurnTimeRemaining(60);
  }

  // 4. Cập nhật vị trí, số dư và trạng thái Bot của người chơi [UC-GAME-008/MSS]
  if (delta.players && delta.players.length > 0) {
    const nextPositions = { ...state.playerPositions };
    let hasPositionChange = false;

    for (const p of delta.players) {
      if (nextPositions[p.id] !== p.position) {
        const fromCell = nextPositions[p.id];
        nextPositions[p.id] = p.position;
        hasPositionChange = true;
        if (!isFullSync && state.startPawnMove) {
          state.startPawnMove(p.id, p.position, fromCell);
          try {
            AudioEngine.playSfx(SoundEffect.PAWN_STEP);
            AudioEngine.handlePawnLanded(p.position);
          } catch {}
        }
      }

      if (state.playersInfo[p.id]) {
        const oldBalance = state.playersInfo[p.id]?.balance;
        if (!isFullSync && oldBalance !== undefined && oldBalance !== p.balance) {
          const diff = p.balance - oldBalance;
          if (diff > 0) {
            state.addFloatingText({
              text: `+${formatCurrency(diff)}`,
              type: FloatingTextType.Reward,
              playerId: p.id,
            });
          } else if (diff < 0) {
            state.addFloatingText({
              text: formatCurrency(diff),
              type: FloatingTextType.Penalty,
              playerId: p.id,
            });
          }
        }

        state.updatePlayerInfo(p.id, {
          balance: p.balance,
          ...(p.bankrupt !== undefined ? { bankrupt: p.bankrupt } : {}),
          ...(p.isBot !== undefined ? { isBot: p.isBot } : {}),
          ...(p.overdraftRoundsLeft !== undefined ? { overdraftRoundsLeft: p.overdraftRoundsLeft } : {}),
          ...(p.inAudit !== undefined ? { inAudit: p.inAudit } : {}),
          ...(p.auditTurnsLeft !== undefined ? { auditTurnsLeft: p.auditTurnsLeft } : {}),
          ...(p.skipNextTurn !== undefined ? { skipNextTurn: p.skipNextTurn } : {}),
          ...(p.consecutiveDoubles !== undefined ? { consecutiveDoubles: p.consecutiveDoubles } : {}),
        });
      }
    }

    if (hasPositionChange) state.setPlayerPositions(nextPositions);
  }

  // 5. Đồng bộ hóa sàn đấu giá tự động (Auction)
  if (delta.auction) {
    state.openModal('auction', delta.auction);
  } else if (delta.auction === null) {
    if (state.activeModal === 'auction') {
      state.closeModal();
    }
  }
}

