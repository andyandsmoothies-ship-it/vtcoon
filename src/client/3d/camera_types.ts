// [UI-S01/MSS][UI-S04/MSS][IMP-409] Camera Pure Contracts & Type Seams
export type CameraMode =
  | 'overview'
  | 'dice_roll'
  | 'tension_roll'
  | 'pawn_chase'
  | 'tile_focus'
  | 'auction_focus'
  | 'pre_match';

export interface TargetCameraState {
  readonly position: [number, number, number];
  readonly target: [number, number, number];
  readonly fov: number;
  readonly speed: number;
}

export interface TargetCameraStateOptions {
  readonly cinematicChase?: boolean;
  readonly cellIndex?: number;
  readonly aspect?: number;
  readonly isHighStakesRoll?: boolean;
  readonly isJailFlight?: boolean;
  readonly isTransientTurnCorner?: boolean;
  readonly enableNorthFraming?: boolean;
  readonly isRolling?: boolean;
  readonly isBotTurn?: boolean;
  readonly rollingPlayerPos?: number;
  readonly gamePhase?: 1 | 2 | 3;
}
