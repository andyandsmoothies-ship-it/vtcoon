import type { Room } from './room';
import { ColorGroup, BOARD_CONFIG } from './board_config';
import {
  MacroCycleType,
  MACRO_CYCLE_LENGTH,
  MACRO_FEVER_ROUNDS,
  MACRO_FREEZE_ROUNDS,
  MACRO_FEVER_RENT_MULT,
  MACRO_FREEZE_RENT_MULT,
} from './macro_cycle_types';

export function evaluateMacroCycle(
  room: Room,
  rng: () => number = Math.random,
): void {
  const round = room.roundCount ?? 1;
  const cycleStep = ((round - 1) % MACRO_CYCLE_LENGTH) + 1;

  if (cycleStep <= MACRO_FEVER_ROUNDS) {
    if (room.activeModifiers.some((m) => m.type === MacroCycleType.MACRO_LAND_FEVER)) return;
    if (cycleStep !== 1 && !room.activeMacroGroup) return;
    const groups = Object.values(ColorGroup);
    const selectedGroup = groups[Math.floor(rng() * groups.length)] ?? ColorGroup.Nau;
    room.activeMacroGroup = selectedGroup;
    const affectedCells = BOARD_CONFIG.filter((c) => c.colorGroup === selectedGroup).map((c) => c.index);
    room.activeModifiers.push({
      type: MacroCycleType.MACRO_LAND_FEVER,
      affectedCells,
      remainingRounds: MACRO_FEVER_ROUNDS - (cycleStep - 1),
      multiplier: MACRO_FEVER_RENT_MULT,
      colorGroup: selectedGroup,
    });
  } else if (cycleStep <= MACRO_FEVER_ROUNDS + MACRO_FREEZE_ROUNDS) {
    if (room.activeModifiers.some((m) => m.type === MacroCycleType.MACRO_LIQUIDITY_FREEZE)) return;
    if (!room.activeMacroGroup) return;
    const group = room.activeMacroGroup;
    const affectedCells = BOARD_CONFIG.filter((c) => c.colorGroup === group).map((c) => c.index);
    room.activeModifiers.push({
      type: MacroCycleType.MACRO_LIQUIDITY_FREEZE,
      affectedCells,
      remainingRounds: (MACRO_FEVER_ROUNDS + MACRO_FREEZE_ROUNDS + 1) - cycleStep,
      multiplier: MACRO_FREEZE_RENT_MULT,
      colorGroup: group,
    });
  } else {
    room.activeMacroGroup = undefined;
  }
}
