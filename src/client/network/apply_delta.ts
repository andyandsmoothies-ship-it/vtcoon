// [UC-GAME-009/MSS][TC-NET03.1/MSS][TC-NET03.2/MSS][UC-GAME-008/MSS]
// Đồng bộ hóa DeltaPayload (kể cả Sparse Diff) vào Zustand useGameStore
import { useGameStore, type PlayerHudInfo } from '../store/game_store.js';
import { BOARD_SIZE } from '../../domain/room.js';
import type { DeltaPayload } from '../../server/session_manager.js';

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
        nextLevelMap[cell.index] = Math.max(0, Math.min(3, cell.level)) as 0 | 1 | 2 | 3;
        hasLevelChange = true;
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

  // 2. Cập nhật vị trí, số dư và trạng thái Bot của người chơi [UC-GAME-008/MSS]
  if (delta.players && delta.players.length > 0) {
    const nextPositions = { ...state.playerPositions };
    let hasPositionChange = false;

    for (const p of delta.players) {
      if (nextPositions[p.id] !== p.position) {
        nextPositions[p.id] = p.position;
        hasPositionChange = true;
      }

      if (state.playersInfo[p.id]) {
        state.updatePlayerInfo(p.id, {
          balance: p.balance,
          ...(p.bankrupt !== undefined ? { bankrupt: p.bankrupt } : {}),
          ...(p.isBot !== undefined ? { isBot: p.isBot } : {}),
          ...(p.overdraftRoundsLeft !== undefined ? { overdraftRoundsLeft: p.overdraftRoundsLeft } : {}),
        });
      }
    }

    if (hasPositionChange) state.setPlayerPositions(nextPositions);
  }
}
