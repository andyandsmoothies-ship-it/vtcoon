// [UI-S03/MSS][UI-S04/MSS] HudContainer — Root HUD DOM Overlay (Z-10, pointer-events-none root)
import React from 'react';
import { TopBar } from './top_bar';
import { PlayerHudList } from './player_hud_list';
import { ActionDock, type ActionDockProps } from './action_dock';
import { ModalHost } from './modals/modal_host';

export interface HudContainerProps extends ActionDockProps {
  readonly children?: React.ReactNode;
}

export function HudContainer({
  onRollDice,
  onOpenProperties,
  onOpenTrade,
  onEndTurn,
  localPlayerId,
  children,
}: HudContainerProps): React.ReactElement {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-10 select-none flex flex-col justify-between p-4 overflow-hidden"
      id="vtcoon-hud-overlay"
      role="presentation"
    >
      {/* Tầng đỉnh: Top Bar thông tin vòng đấu, timer, kho bạc */}
      <TopBar />

      {/* Tầng giữa: Danh sách thẻ người chơi bên trái & custom modal / overlays */}
      <div className="flex-1 flex justify-between items-start pointer-events-none my-2 overflow-hidden">
        <PlayerHudList />
        {children}
      </div>

      {/* Tầng đáy: Action Dock trung tâm điều khiển thao tác */}
      <footer className="w-full flex justify-center items-center pointer-events-none pb-2">
        <ActionDock
          onRollDice={onRollDice}
          onOpenProperties={onOpenProperties}
          onOpenTrade={onOpenTrade}
          onEndTurn={onEndTurn}
          localPlayerId={localPlayerId}
        />
      </footer>

      {/* Tầng Modals Tương Tác Nghiệp Vụ (Z-20 Host) */}
      <ModalHost />
    </div>
  );
}
