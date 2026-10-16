// [UI-S01/MSS][IMP-402] ToyboxWealthTrayLayer — Desktop Sanctuary Wealth Trays (.glb Tiers 1..4)
import React, { useMemo } from 'react';
import { useGameStore, type PlayerHudInfo } from '../store/game_store';
import { SafeGLTFModel } from './asset_loader/safe_gltf_model';
import { isPhoneHardware } from './device_detect';
import {
  WEALTH_TRAY_MODEL_URLS,
  getSanctuaryWealthTrayDescriptors,
} from './toybox_wealth_tray_visuals';

export interface ToyboxWealthTrayLayerProps {
  readonly isMobile?: boolean;
  readonly playersInfo?: Readonly<Record<string, PlayerHudInfo>> | null;
  readonly levelMap?: Record<number, 0 | 1 | 2 | 3>;
}

export function ToyboxWealthTrayLayer(props?: ToyboxWealthTrayLayerProps): React.ReactElement | null {
  const isMobile = props?.isMobile ?? isPhoneHardware();
  const hookPlayersInfo = useGameStore((s) => s.playersInfo);
  const hookLevelMap = useGameStore((s) => s.levelMap);
  const liveState = useGameStore.getState();
  const storePlayersInfo =
    Object.keys(hookPlayersInfo).length > 0 ? hookPlayersInfo : liveState.playersInfo;
  const storeLevelMap =
    Object.keys(hookLevelMap).length > 0 ? hookLevelMap : liveState.levelMap;
  const effectivePlayers = props?.playersInfo ?? storePlayersInfo;
  const effectiveLevelMap = props?.levelMap ?? storeLevelMap;

  const trays = useMemo(() => {
    if (isMobile || !effectivePlayers || Object.keys(effectivePlayers).length === 0) {
      return null;
    }
    for (const url of Object.values(WEALTH_TRAY_MODEL_URLS)) {
      SafeGLTFModel.preload(url);
    }
    return getSanctuaryWealthTrayDescriptors(effectivePlayers, effectiveLevelMap);
  }, [isMobile, effectivePlayers, effectiveLevelMap]);

  if (!trays) return null;

  return (
    <group name="ToyboxWealthTrayLayer" data-testid="toybox-wealth-tray-layer">
      {trays.map((desc) => {
        if (!desc.modelUrl) return null;
        return (
          <SafeGLTFModel
            key={desc.id}
            url={desc.modelUrl}
            position={[...desc.worldPosition]}
            rotation={[0, desc.rotationY, 0]}
            scale={[...desc.trayScale]}
            castShadow
            receiveShadow
            fallback={<group />}
          />
        );
      })}
    </group>
  );
}
