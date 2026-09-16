// [UI-S03/MSS][UI-S04/MSS][UI-S05/MSS] HudContainer — Root HUD DOM Overlay (Z-10, pointer-events-none root)
import React from 'react';
import { TopBar } from './top_bar';
import { PlayerHudList } from './player_hud_list';
import { ActionDock, type ActionDockProps } from './action_dock';
import { ModalHost } from './modals/modal_host';
import { FloatingNumbersOverlay } from './floating_numbers';
import { ActivityFeedSidebar } from './activity_feed_sidebar';
import { TelemetryBadge } from './telemetry/telemetry_badge';
import { TelemetryConsoleModal } from './telemetry/telemetry_console_modal';
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

  return (
    <div
      className="fixed inset-0 pointer-events-none flex flex-col justify-between p-3 md:p-6 z-10 select-none font-sans"
      data-testid="hud-container"
    >
      {/* Tầng đỉnh: Top Bar thông tin vòng đấu, timer, kho bạc */}
      <TopBar onLeaveRoom={onLeaveRoom} />

      {/* Tầng hiển thị số tiền bay (Floating Text / Numbers) */}
      <FloatingNumbersOverlay />

      {/* Tầng giữa: Trục giữa thông thoáng, PlayerHudList ở cạnh phải */}
      <div className="flex-1 flex justify-end items-start pointer-events-none my-2 overflow-hidden">
        {children}
        <PlayerHudList />
      </div>

      {/* Tầng đáy: Telemetry Badge ở góc dưới bên trái, Action Dock ở góc dưới bên phải */}
      <footer className="w-full flex flex-row justify-center sm:justify-between items-end gap-2 md:gap-3 pointer-events-none pb-2">
        {/* Huy hiệu Giám Sát Thời Gian Thực & Sức Khỏe Bất Biến (Bottom-Left, không che khuất ActionDock hay Player Cards) */}
        <div className="pointer-events-auto hidden sm:block">
          <TelemetryBadge />
        </div>

        {/* Thanh Điều Khiển Tác Vụ Cốt Lõi (Bottom-Right, thuận tay thao tác công thái học) */}
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
      </footer>

      {/* Tầng Modals Tương Tác Nghiệp Vụ (Z-20 Host) */}
      <ModalHost onIntent={onIntent} localPlayerId={localPlayerId} />

      {/* Tầng Bảng Nhật Ký Hoạt Động Trượt Cạnh Phải (Z-30 Sideboard Drawer) */}
      <ActivityFeedSidebar />

      {/* Tầng Bảng Điều Khiển Hộp Đen Giám Sát (Z-40 Modal) */}
      <TelemetryConsoleModal />
    </div>
  );
}
