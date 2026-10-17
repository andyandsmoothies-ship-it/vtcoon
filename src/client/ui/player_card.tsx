import React, { useMemo, useState, useEffect } from 'react';
import {
  useGameStore,
  type PlayerHudInfo,
  type ActiveModalType,
  type ModalPayloadMap,
} from '../store/game_store';
import { useLobbyStore } from '../store/lobby_store';
import { formatCurrency, calculatePlayerNetWorth, formatShortPlayerName } from './ui_helpers';
import { COLOR_GROUP_HEX } from '../../domain/theme';
import { getEmoteDef } from '../../domain/emotes';
import { getPawnConfigBySlot } from '../3d/luxury_pawn_models';
import { ChanceCardId } from '../../domain/event_card_engine';
import { PlayerNetWorthBadge } from './player_net_worth_badge';
import {
  UNOWNED_DOT_CLASS,
  PROPERTY_CLUSTERS,
  INFRASTRUCTURE_CLUSTERS,
  type PlayerTradingCellsTradeState,
  resolvePlayerTradingCells,
  getSlotFromPlayer,
  renderCardExpandChevron,
  renderEmptyPropertyBadge,
  renderPropertyRows,
} from './player_card_helpers';

export {
  UNOWNED_DOT_CLASS,
  PROPERTY_CLUSTERS,
  INFRASTRUCTURE_CLUSTERS,
  type PlayerTradingCellsTradeState,
  resolvePlayerTradingCells,
};

export interface PlayerCardProps {
  readonly player: PlayerHudInfo;
  readonly isCurrentTurn: boolean;
  readonly levelMap: Record<number, 0 | 1 | 2 | 3>;
  readonly slotIndex?: number;
  readonly tradingCells?: ReadonlySet<number>;
}

export function PlayerCard({
  player,
  isCurrentTurn,
  levelMap,
  slotIndex,
  tradingCells: propTradingCells,
}: PlayerCardProps): React.ReactElement {
  const activeEmote = useGameStore((state) => state.activeEmotes[player.id]);
  const storeActiveModal = useGameStore((s) => s.activeModal);
  const storeModalPayload = useGameStore((s) => s.modalPayload);
  const storePendingTradeOffer = useGameStore((s) => s.pendingTradeOffer);
  const localPlayerId = useLobbyStore((s) => s.myPlayerId);

  const tradingCellSet = useMemo(() => {
    if (propTradingCells) return propTradingCells;
    return resolvePlayerTradingCells(
      { activeModal: storeActiveModal, modalPayload: storeModalPayload, pendingTradeOffer: storePendingTradeOffer },
      player.id,
      localPlayerId
    );
  }, [propTradingCells, storeActiveModal, storeModalPayload, storePendingTradeOffer, player.id, localPlayerId]);
  const resolvedSlot = getSlotFromPlayer(player, slotIndex);
  const pawnConfig = getPawnConfigBySlot(resolvedSlot);

  const netWorth = calculatePlayerNetWorth(
    player.balance,
    player.ownedProperties ?? [],
    levelMap,
    player.mortgagedProperties ?? [],
    player.mortgageLoans
  );

  const userExpandedState = useState(false);
  const isUserExpanded = userExpandedState[0];
  const setIsUserExpanded = userExpandedState[1];
  const currentTurnPlayerId = useGameStore((s) => s.currentTurnPlayerId);
  useEffect(() => {
    setIsUserExpanded(false);
  }, [currentTurnPlayerId]);

  const isTradingParty = Boolean(
    tradingCellSet.size > 0 ||
    (storePendingTradeOffer && (storePendingTradeOffer.buyerId === player.id || storePendingTradeOffer.sellerId === player.id))
  );
  const isExpandedOnMobile = isCurrentTurn || isTradingParty || isUserExpanded;

  const handleToggleExpand = () => {
    if (player.bankrupt || isCurrentTurn || isTradingParty) return;
    setIsUserExpanded((prev) => !prev);
  };

  const isNegativeBalance = player.balance < 0;
  const balanceColorClass = isNegativeBalance
    ? 'text-rose-700 font-black'
    : 'text-emerald-700 font-black';

  return (
    <div
      data-testid="player-ribbon"
      data-in-turn={isCurrentTurn ? 'true' : 'false'}
      onClick={handleToggleExpand}
      aria-expanded={isExpandedOnMobile}
      tabIndex={player.bankrupt ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggleExpand();
        }
      }}
      className={`pointer-events-auto relative flex flex-col gap-1.5 p-2.5 sm:p-3 rounded-xl border-2 transition-all duration-200 w-full select-none ${
        player.bankrupt
          ? 'opacity-50 grayscale cursor-default'
          : isCurrentTurn || isTradingParty
          ? 'cursor-default'
          : 'cursor-pointer sm:cursor-default'
      } ${
        isCurrentTurn
          ? 'border-amber-500 bg-[#FFFDF8] ring-2 ring-amber-400 shadow-[0_6px_0_0_#0f172a]'
          : 'border-slate-900 bg-[#FFFDF8] shadow-[0_4px_0_0_#0f172a]'
      } text-slate-900`}
      role="region"
      aria-label={`Thông tin ${player.name}`}
    >
      {/* Emote Bubble Popover trên Avatar (3 giây) */}
      {activeEmote && (
        <div
          className="absolute -top-6 -right-2 z-30 animate-emote-pop pointer-events-none flex items-center justify-center bg-[#FFFDF8] border-2 border-slate-900 rounded-2xl p-1 px-2.5 shadow-md text-slate-900"
          role="status"
          aria-label={`${player.name} gửi biểu cảm ${getEmoteDef(activeEmote.emoteId)?.label ?? activeEmote.emoteId}`}
        >
          <span className="text-2xl drop-shadow-md" aria-hidden="true">
            {getEmoteDef(activeEmote.emoteId)?.icon ?? '💬'}
          </span>
          <div className="absolute -bottom-1 left-4 w-2 h-2 bg-[#FFFDF8] border-r-2 border-b-2 border-slate-900 rotate-45" />
        </div>
      )}

      {/* Dòng 1 (Header siêu gọn): Chấm màu & Tên (Trái) | Số tiền & Trạng thái (Căn Phải) */}
      <div className="flex items-center justify-between gap-1.5 min-w-0 w-full">
        {/* Cột trái: Quân cờ & Tên người chơi */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {/* Chấm màu nhận diện quân cờ trên bàn 3D (thay thế avatar cồng kềnh) */}
          <div
            data-testid={`player-pawn-badge-${player.id}`}
            data-legacy-size="w-8 h-8"
            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-slate-900 shadow-2xs shrink-0 select-none relative"
            style={{ backgroundColor: player.tokenColor || '#38BDF8' }}
            title={`${player.name} (${pawnConfig.name})`}
            aria-label={`Màu quân cờ: ${pawnConfig.name}`}
          >
            <span className="sr-only" aria-hidden="true">
              {pawnConfig.icon}
            </span>
            {Boolean(player.hand?.includes(ChanceCardId.CC_DIPLOMATIC)) && (
              <span
                className="absolute -top-1.5 -right-2 text-[9px] leading-none select-none"
                title="Giữ Thẻ Miễn Trừ Ngoại Giao"
                aria-label="Giữ Thẻ Miễn Trừ Ngoại Giao"
              >
                🤝
              </span>
            )}
          </div>

          <span
            className="text-xs sm:text-sm font-bold text-slate-900 truncate"
            title={player.name}
          >
            {formatShortPlayerName(player.name)}
          </span>
          {!player.bankrupt && !isCurrentTurn && !isTradingParty && (
            <span className="ml-1 shrink-0">
              {renderCardExpandChevron(isExpandedOnMobile)}
            </span>
          )}
        </div>

        {/* Cột phải (Căn lề phải): Số tiền mặt, Cảnh báo thấu chi, Tài sản ròng & Badge Phá Sản */}
        <div className="flex items-center justify-end gap-1 shrink-0 text-right">
          {player.bankrupt ? (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-100 text-rose-900 border border-rose-300">
              Phá Sản
            </span>
          ) : (
            <>
              <span className={`tabular-nums text-xs ${balanceColorClass} shrink-0`}>{formatCurrency(player.balance)}</span>
              {isNegativeBalance && (
                <span
                  className="text-[9px] font-extrabold text-rose-700 bg-rose-100 border border-rose-300 px-1.5 py-0.2 rounded shrink-0 leading-tight"
                  title={`Thấu chi: còn ${player.overdraftRoundsLeft ?? 3} vòng`}
                >
                  <span className="inline sm:hidden">Nợ {player.overdraftRoundsLeft ?? 3}v</span>
                  <span className="hidden sm:inline">Thấu chi: còn {player.overdraftRoundsLeft ?? 3} vòng</span>
                </span>
              )}
              <PlayerNetWorthBadge netWorth={netWorth} />
            </>
          )}
        </div>
      </div>

      {/* Cụm 28 chấm BĐS chỉ render khi người chơi còn hoạt động, thu gọn khi Phá Sản */}
      {!player.bankrupt && (
        <>
          <span className="sr-only">BĐS:</span>
          <div
            className={`flex-col gap-1 w-full px-2 pt-1.5 pb-1 border-t border-slate-300 select-none ${!isExpandedOnMobile ? 'hidden sm:flex' : 'flex'}`}
            data-testid="player-property-clusters"
            onClick={(e) => e.stopPropagation()}
          >
            {(player.ownedProperties?.length ?? 0) > 0 ? (
              <div className="flex flex-col gap-1 w-full bg-amber-950/[0.03] border border-amber-900/10 rounded-lg p-1 shadow-inner">
                {renderPropertyRows(player, tradingCellSet)}
              </div>
            ) : (
              <>
                {renderEmptyPropertyBadge()}
                <div className="hidden" aria-hidden="true">
                  {renderPropertyRows(player, tradingCellSet)}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
