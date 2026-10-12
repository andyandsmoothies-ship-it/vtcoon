import React from 'react';
import type { PlayerHudInfo, ActiveModalType, ModalPayloadMap } from '../store/game_store';
import type { PendingTradeOfferDelta } from '../../server/session_manager';
import { BOARD_CONFIG, CellType, ColorGroup } from '../../domain/board_config';

export const UNOWNED_DOT_CLASS = 'border border-slate-300 bg-transparent';

export const PROPERTY_COLOR_GROUP_ORDER: readonly ColorGroup[] = [
  ColorGroup.Nau,
  ColorGroup.XanhDaTroi,
  ColorGroup.Hong,
  ColorGroup.Cam,
  ColorGroup.Do,
  ColorGroup.Vang,
  ColorGroup.XanhLa,
  ColorGroup.Tim,
];

export const PROPERTY_CLUSTERS: readonly {
  readonly group: ColorGroup;
  readonly cells: readonly { readonly index: number; readonly name: string }[];
}[] = PROPERTY_COLOR_GROUP_ORDER.map((group) => ({
  group,
  cells: BOARD_CONFIG.filter((c) => c.colorGroup === group).map((c) => ({
    index: c.index,
    name: c.name,
  })),
}));

export const INFRASTRUCTURE_CLUSTERS = {
  railroads: {
    color: '#475569',
    cells: BOARD_CONFIG.filter((c) => c.type === CellType.Railroad).map((c) => ({
      index: c.index,
      name: c.name,
    })),
  },
  utilities: {
    color: '#0284C7',
    cells: BOARD_CONFIG.filter((c) => c.type === CellType.Utility).map((c) => ({
      index: c.index,
      name: c.name,
    })),
  },
} as const;

export interface PlayerTradingCellsTradeState {
  readonly activeModal: ActiveModalType | string | null;
  readonly modalPayload: unknown;
  readonly pendingTradeOffer?: PendingTradeOfferDelta | {
    readonly offerId?: string;
    readonly cellIndex?: number;
    readonly price?: number;
    readonly buyerId?: string;
    readonly sellerId?: string;
    readonly expiresAt?: number;
    readonly offeredCellIndex?: number;
    readonly requesterId?: string;
    readonly targetPlayerId?: string;
  } | null;
}

export function resolvePlayerTradingCells(
  tradeState: PlayerTradingCellsTradeState | null | undefined,
  playerId: string,
  localPlayerId?: string
): Set<number> {
  const result = new Set<number>();
  if (!tradeState || !playerId) return result;

  // 1. Pending trade offer
  const pending = tradeState.pendingTradeOffer;
  if (pending) {
    if (pending.sellerId === playerId && typeof pending.cellIndex === 'number') {
      result.add(pending.cellIndex);
    }
    if (pending.buyerId === playerId && typeof pending.offeredCellIndex === 'number') {
      result.add(pending.offeredCellIndex);
    }
  }

  // 2. Active modal: bot_trade_offer
  if (tradeState.activeModal === 'bot_trade_offer' && tradeState.modalPayload) {
    const payload = tradeState.modalPayload as ModalPayloadMap['bot_trade_offer'];
    if (payload.sellerId === playerId && typeof payload.cellIndex === 'number') {
      result.add(payload.cellIndex);
    }
    if (payload.buyerId === playerId && typeof payload.offeredCellIndex === 'number') {
      result.add(payload.offeredCellIndex);
    }
  }

  // 3. Active modal: trade (P2P Trade)
  if (tradeState.activeModal === 'trade' && tradeState.modalPayload) {
    const payload = tradeState.modalPayload as ModalPayloadMap['trade'];
    // Khử magic string 'p1': CHỈ match khi localPlayerId có giá trị chuỗi hợp lệ
    if (typeof localPlayerId === 'string' && localPlayerId.length > 0 && playerId === localPlayerId) {
      if (Array.isArray(payload.offeredProperties)) {
        payload.offeredProperties.forEach((id) => result.add(id));
      }
    }
    if (payload.targetPlayerId && playerId === payload.targetPlayerId) {
      if (Array.isArray(payload.requestedProperties)) {
        payload.requestedProperties.forEach((id) => result.add(id));
      }
    }
  }

  return result;
}

export function getSlotFromPlayer(player: PlayerHudInfo, explicitSlot?: number): number {
  if (typeof explicitSlot === 'number') return explicitSlot;
  if (typeof player.pawnSlot === 'number') return player.pawnSlot;
  if (typeof player.ownerSlot === 'number') return player.ownerSlot;
  if (player.id === 'p1' || player.id.includes('p1')) return 0;
  if (player.id.includes('bot_3') || player.id === 'p4' || player.id.includes('player_4')) return 3;
  if (player.id.includes('bot_2') || player.id === 'p3' || player.id.includes('player_3')) return 2;
  if (player.id.includes('bot_1') || player.id === 'p2' || player.id.includes('player_2')) return 1;
  if (player.id.includes('4')) return 3;
  if (player.id.includes('3')) return 2;
  if (player.id.includes('2')) return 1;
  return 0;
}

export function renderCardExpandChevron(isExpanded: boolean): React.ReactElement {
  return React.createElement(
    'span',
    {
      'data-testid': 'player-card-expand-indicator',
      className: 'inline-block sm:hidden text-[10px] text-slate-400 select-none transition-transform duration-200 shrink-0',
      'aria-hidden': true,
    },
    isExpanded ? '▲' : '▼'
  );
}
