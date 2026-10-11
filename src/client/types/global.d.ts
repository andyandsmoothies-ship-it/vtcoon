import type { useGameStore } from '../store/game_store';
import type { useLobbyStore } from '../store/lobby_store';
import type { useEnvironmentStore } from '../store/environment_store';
import type { useVfxStore } from '../store/vfx_store';
import type { useTelemetryStore } from '../telemetry/telemetry_store';
import type { useDiagnostic3DStore } from '../3d/diagnostic_3d_store';

export interface VtcoonDevFacade {
  readonly gameStore: typeof useGameStore;
  readonly lobbyStore: typeof useLobbyStore;
  readonly environmentStore: typeof useEnvironmentStore;
  readonly vfxStore: typeof useVfxStore;
  readonly diagnostic3DStore: typeof useDiagnostic3DStore;
  readonly telemetryStore: typeof useTelemetryStore;
  readonly exportFlightRecorder: () => unknown;
  readonly openTelemetryConsole: () => void;
  readonly open3DDiagnostics: () => void;
}

declare global {
  interface Window {
    __gameStore?: typeof useGameStore;
    __lobbyStore?: typeof useLobbyStore;
    __environmentStore?: typeof useEnvironmentStore;
    __vfxStore?: typeof useVfxStore;
    __vtcoon?: VtcoonDevFacade;
    __threeScene?: unknown;
    __threeCamera?: unknown;
    __orbitControls?: unknown;
    __debugCameraManual?: boolean;
    __resetCameraToDefault?: () => void;
    __setErrorMessage?: (msg: string | null) => void;
    webkitAudioContext?: typeof AudioContext;
  }

  // eslint-disable-next-line no-var
  var webkitAudioContext: typeof AudioContext | undefined;
}

declare module 'react' {

  namespace JSX {
    interface IntrinsicElements {
      instancedMesh: Record<string, unknown>;
    }
  }
}

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      instancedMesh: Record<string, unknown>;
    }
  }
}

export {};
