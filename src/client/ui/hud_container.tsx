// [UI-S03/MSS][UI-S04/MSS][UI-S05/MSS] HudContainer — Root HUD DOM Overlay (Z-10, pointer-events-none root)
import React from 'react';
import { TopBar } from './top_bar';
import { InAppBrowserBanner } from './in_app_browser_banner';
import { PlayerHudList } from './player_hud_list';
import { ActionDock, type ActionDockProps } from './action_dock';
import { ModalHost } from './modals/modal_host';
import { MarketEventTicker } from './market_event_ticker';
import { FloatingNumbersOverlay } from './floating_numbers';
import { ActivityFeedSidebar } from './activity_feed_sidebar';
import { TelemetryBadge } from './telemetry/telemetry_badge';
import { TelemetryConsoleModal } from './telemetry/telemetry_console_modal';
import { RecenterPawnPill } from './recenter_pawn_pill';
import { CameraResetPill } from './camera_reset_pill';
import { InlineBotTradeStrip } from './modals/bot_trade_offer_strip';
import { MiniAuctionStrip } from './modals/mini_auction_strip.js';
import { DiceScoreBadge } from './dice_score_badge';
import { useGameStore } from '../store/game_store';
import { useLobbyStore } from '../store/lobby_store';
import type { PlayerIntent } from '../../server/intent_dispatcher';

export interface HudContainerProps extends ActionDockProps {
  readonly children?: React.ReactNode;
  readonly onIntent?: (intent: PlayerIntent) => void;
  readonly onSendEmote?: (emoteId: string) => void;
  readonly onLeaveRoom?: () => void;
}

export function HudContainer({
  onRollDice,
  onOpenProperties,
  onOpenTrade,
  onOpenUpgrade,
  onOpenManageProperty,
  onEndTurn,
  localPlayerId,
  onIntent,
  onSendEmote: _onSendEmote,
  onLeaveRoom,
  children,
  onBailOut: onBailOutProp,
}: HudContainerProps): React.ReactElement {
  const handleBailOut = onBailOutProp ?? (() => onIntent?.({ type: 'INTENT_BAIL_OUT' }));
  const activeModal = useGameStore((s) => s.activeModal);
  const cameraFocusCell = useGameStore((s) => s.cameraFocusCell);
  const setCameraFocusCell = useGameStore((s) => s.setCameraFocusCell);
  const playerPositions = useGameStore((s) => s.playerPositions);
  const currentTurnPlayerId = useGameStore((s) => s.currentTurnPlayerId);
  const dice = useGameStore((s) => s.dice);
  const isRolling = useGameStore((s) => s.isRolling);
  const lobbyPid = useLobbyStore((s) => s.myPlayerId);
  const myId = localPlayerId || (lobbyPid && lobbyPid.length > 0 ? lobbyPid : undefined) || currentTurnPlayerId || 'p1';
  const pawnPos = playerPositions[myId] ?? 0;

  return (
    <>
      <InAppBrowserBanner />
      <div
        className="fixed inset-0 pointer-events-none flex flex-col justify-between p-1.5 sm:p-3 md:p-6 z-10 select-none font-sans"
        data-testid="hud-container"
      >
        {/* Tầng đỉnh: Top Bar thông tin vòng đấu, timer, kho bạc - Nổi trên backdrop Z-20 */}
        <div className="relative z-30 pointer-events-none">
          <TopBar onLeaveRoom={onLeaveRoom} />
        </div>

        {/* Tầng hiển thị Sự kiện thị trường vĩ mô */}
        <MarketEventTicker />

        {/* Tầng hiển thị số tiền bay (Floating Text / Numbers) */}
        <FloatingNumbersOverlay />

        {/* Tầng giữa: Trục giữa thông thoáng, PlayerHudList ở cạnh phải */}
        <div className="flex-1 flex justify-end items-start pointer-events-none my-2 overflow-hidden">
          {children}
          <PlayerHudList />
        </div>

        {/* Cụm Nút Nổi Điều Hướng Camera (Recenter Pawn & Camera Snap Overview) */}
        <div className="pointer-events-none fixed bottom-28 sm:bottom-32 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-2 max-w-[95vw]">
        <RecenterPawnPill
          activeModal={activeModal}
          cameraFocusCell={cameraFocusCell}
          pawnPosition={pawnPos}
          onRecenter={() => setCameraFocusCell(null)}
        />
        <CameraResetPill />
      </div>

      {/* Tầng đáy: Telemetry Badge ở góc dưới bên trái, Action Dock ở góc dưới bên phải */}
      <footer className="w-full flex flex-row justify-center sm:justify-between items-end gap-2 md:gap-3 pointer-events-none pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-3">
        {/* Huy hiệu Giám Sát Thời Gian Thực & Sức Khỏe Bất Biến (Bottom-Left, không che khuất ActionDock hay Player Cards) */}
        <div className="pointer-events-auto hidden sm:block shrink-0">
          <TelemetryBadge />
        </div>

        {/* Thanh Điều Khiển Tác Vụ Cốt Lõi & Strip Giao Dịch Bot (Bottom-Right, thuận tay thao tác công thái học) */}
        <div className="flex flex-col items-center sm:items-end gap-1.5 w-full sm:w-auto max-w-[96vw] sm:max-w-none sm:min-w-0 pointer-events-none">
          <DiceScoreBadge dice={dice} isRolling={isRolling} />
          <MiniAuctionStrip />
          <InlineBotTradeStrip onIntent={onIntent} localPlayerId={localPlayerId} />
          <div className="pointer-events-auto">
            <ActionDock
              onRollDice={onRollDice}
              onOpenProperties={onOpenProperties}
              onOpenTrade={onOpenTrade}
              onOpenUpgrade={onOpenUpgrade}
              onOpenManageProperty={onOpenManageProperty}
              onEndTurn={onEndTurn}
              onBailOut={handleBailOut}
              localPlayerId={localPlayerId}
            />
          </div>
        </div>
      </footer>

      {/* Tầng Modals Tương Tác Nghiệp Vụ (Z-20 Host) */}
      <ModalHost onIntent={onIntent} localPlayerId={localPlayerId} />

      {/* Tầng Bảng Nhật Ký Hoạt Động Trượt Cạnh Phải (Z-30 Sideboard Drawer) */}
      <ActivityFeedSidebar />

      {/* Tầng Bảng Điều Khiển Hộp Đen Giám Sát (Z-40 Modal) */}
      <TelemetryConsoleModal />
    </div>
    </>
  );
}
