import React from 'react';
import type { PlayerHudInfo, ActiveModalType, ModalPayloadMap } from '../store/game_store';
import type { PendingTradeOfferDelta } from '../../domain/protocol/index.js';
import { BOARD_CONFIG, CellType, ColorGroup } from '../../domain/board_config';
import { COLOR_GROUP_HEX } from '../../domain/theme';

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

export function renderEmptyPropertyBadge(): React.ReactElement {
  return React.createElement(
    'div',
    {
      'data-testid': 'player-empty-property-badge',
      className: 'flex items-center justify-between text-[10px] text-slate-500 font-semibold px-1 py-0.5 select-none',
    },
    React.createElement(
      'span',
      { className: 'flex items-center gap-1' },
      React.createElement('span', { className: 'text-[11px]', 'aria-hidden': true }, '🏛️'),
      React.createElement('span', null, 'Chưa có BĐS')
    ),
    React.createElement(
      'span',
      {
        className: 'text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950/[0.04] border border-amber-900/10 text-amber-900 font-bold',
      },
      '0/28'
    )
  );
}

export function resolvePropertyDotClasses(isOwned: boolean, isTrading: boolean): string {
  if (isTrading) {
    return 'relative z-10 scale-110 ring-2 ring-amber-400/90 ring-offset-1 shadow-xs animate-pulse';
  }
  if (isOwned) {
    return 'border border-amber-400/90 shadow-[0_0_6px_rgba(245,158,11,0.6)]';
  }
  return UNOWNED_DOT_CLASS;
}

export function renderPropertyRows(
  player: PlayerHudInfo,
  tradingCellSet: ReadonlySet<number>
): React.ReactElement {
  return React.createElement(
    React.Fragment,
    null,
    [PROPERTY_CLUSTERS.slice(0, 4), PROPERTY_CLUSTERS.slice(4, 8)].map((clusterRow, rowIdx) =>
      React.createElement(
        'div',
        {
          key: rowIdx,
          'data-testid': `property-clusters-row-${rowIdx + 1}`,
          className: 'flex items-center justify-between w-full',
        },
        clusterRow.map(({ group, cells }) =>
          React.createElement(
            'div',
            {
              key: group,
              className: 'flex items-center gap-1 sm:gap-1.5 shrink-0',
              'data-testid': `cluster-${group}`,
            },
            cells.map((cell) => {
              const isOwned = Boolean(player.ownedProperties?.includes(cell.index));
              const isTrading = tradingCellSet.has(cell.index);
              return React.createElement('span', {
                key: cell.index,
                'data-testid': `dot-cell-${cell.index}`,
                'data-owned': isOwned ? 'true' : 'false',
                'data-trading': isTrading ? 'true' : 'false',
                className: `w-2 h-2 sm:w-[9px] sm:h-[9px] md:w-2.5 md:h-2.5 rounded-full transition-all shrink-0 ${resolvePropertyDotClasses(
                  isOwned,
                  isTrading
                )}`,
                style: {
                  ...(isOwned ? { backgroundColor: COLOR_GROUP_HEX[group] } : {}),
                  ...(isTrading ? ({ '--tw-ring-offset-color': '#FFFDF8' } as React.CSSProperties) : {}),
                },
                title: `${cell.name}: ${isOwned ? 'Đã sở hữu' : 'Chưa sở hữu'}${isTrading ? ' (Đang trong giao dịch 🤝)' : ''}`,
              });
            })
          )
        )
      )
    ),
    React.createElement(
      'div',
      {
        'data-testid': 'property-clusters-row-3',
        className: 'flex items-center justify-center gap-2.5 sm:gap-3 w-full pt-0.5',
      },
      React.createElement(
        'div',
        {
          className: 'flex items-center gap-1 sm:gap-1.5 shrink-0',
          'data-testid': 'cluster-railroad',
        },
        INFRASTRUCTURE_CLUSTERS.railroads.cells.map((cell) => {
          const isOwned = Boolean(player.ownedProperties?.includes(cell.index));
          const isTrading = tradingCellSet.has(cell.index);
          return React.createElement('span', {
            key: cell.index,
            'data-testid': `dot-cell-${cell.index}`,
            'data-owned': isOwned ? 'true' : 'false',
            'data-trading': isTrading ? 'true' : 'false',
            className: `w-2 h-2 sm:w-[9px] sm:h-[9px] md:w-2.5 md:h-2.5 rounded-full transition-all shrink-0 ${resolvePropertyDotClasses(
              isOwned,
              isTrading
            )}`,
            style: {
              ...(isOwned ? { backgroundColor: INFRASTRUCTURE_CLUSTERS.railroads.color } : {}),
              ...(isTrading ? ({ '--tw-ring-offset-color': '#FFFDF8' } as React.CSSProperties) : {}),
            },
            title: `${cell.name}: ${isOwned ? 'Đã sở hữu' : 'Chưa sở hữu'}${isTrading ? ' (Đang trong giao dịch 🤝)' : ''}`,
          });
        })
      ),
      React.createElement('span', {
        className: 'w-px h-2 bg-slate-300 shrink-0',
        'aria-hidden': true,
      }),
      React.createElement(
        'div',
        {
          className: 'flex items-center gap-1 sm:gap-1.5 shrink-0',
          'data-testid': 'cluster-utility',
        },
        INFRASTRUCTURE_CLUSTERS.utilities.cells.map((cell) => {
          const isOwned = Boolean(player.ownedProperties?.includes(cell.index));
          const isTrading = tradingCellSet.has(cell.index);
          return React.createElement('span', {
            key: cell.index,
            'data-testid': `dot-cell-${cell.index}`,
            'data-owned': isOwned ? 'true' : 'false',
            'data-trading': isTrading ? 'true' : 'false',
            className: `w-2 h-2 sm:w-[9px] sm:h-[9px] md:w-2.5 md:h-2.5 rounded-full transition-all shrink-0 ${resolvePropertyDotClasses(
              isOwned,
              isTrading
            )}`,
            style: {
              ...(isOwned ? { backgroundColor: INFRASTRUCTURE_CLUSTERS.utilities.color } : {}),
              ...(isTrading ? ({ '--tw-ring-offset-color': '#FFFDF8' } as React.CSSProperties) : {}),
            },
            title: `${cell.name}: ${isOwned ? 'Đã sở hữu' : 'Chưa sở hữu'}${isTrading ? ' (Đang trong giao dịch 🤝)' : ''}`,
          });
        })
      )
    )
  );
}


