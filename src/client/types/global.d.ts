import type { useGameStore } from '../store/game_store';
import type { useLobbyStore } from '../store/lobby_store';
import type { useEnvironmentStore } from '../store/environment_store';
import type { useVfxStore } from '../store/vfx_store';

declare global {
  interface Window {
    __gameStore?: typeof useGameStore;
    __lobbyStore?: typeof useLobbyStore;
    __environmentStore?: typeof useEnvironmentStore;
    __vfxStore?: typeof useVfxStore;
    __threeScene?: unknown;
    __threeCamera?: unknown;
    __orbitControls?: unknown;
    __debugCameraManual?: boolean;
    webkitAudioContext?: typeof AudioContext;
  }

  // eslint-disable-next-line no-var
  var webkitAudioContext: typeof AudioContext | undefined;
}

export {};
