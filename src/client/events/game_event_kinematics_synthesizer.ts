// [IMP-344] Kinematic & Chance Game Event Synthesizer
// Pure, deterministic domain module for synthesizing kinematic game events (Dice rolls, Pawn moves, Event cards, Transit wheel)
import type { GameState } from '../store/game_store.js';
import type { DeltaPayload } from '../../server/session_manager.js';
import {
  SynthesizedGameEventType,
  type SynthesizedGameEvent,
  type SynthesizerOptions,
} from './game_event_types.js';

export function synthesizeKinematicEvents(
  prevState: GameState,
  nextState: GameState,
  delta: DeltaPayload,
  options?: SynthesizerOptions,
): readonly SynthesizedGameEvent[] {
  const events: SynthesizedGameEvent[] = [];
  const timestamp = options?.baseTimestamp ?? Date.now();

  // 1. Dice Roll Synthesis
  const dice = delta.dice;
  if (dice && (dice[0] > 0 || dice[1] > 0)) {
    const isNewRoll = delta.diceSeq !== undefined
      ? delta.diceSeq > (prevState.lastDiceSeq ?? -1)
      : (!prevState.hasRolledThisTurn && nextState.hasRolledThisTurn);

    if (isNewRoll) {
      const [d1, d2] = dice;
      const playerId = delta.diceRollerId ?? delta.currentTurnPlayerId ?? nextState.currentTurnPlayerId ?? '';
      events.push({
        type: SynthesizedGameEventType.DICE_ROLLED,
        timestamp,
        playerId,
        dice: [d1, d2],
        total: d1 + d2,
        isDouble: d1 === d2,
      });
    }
  }

  // 2. Event Card Synthesis (Supports both cardId and id per EventCardInfo SSOT)
  if (delta.lastEventCard) {
    const card = delta.lastEventCard;
    const currentCardId = card.cardId || card.id;
    const prevCardId = prevState.lastEventCard
      ? (prevState.lastEventCard.cardId || prevState.lastEventCard.id)
      : undefined;

    if (currentCardId && currentCardId !== prevCardId) {
      const playerId = card.drawnBy ?? card.playerId ?? nextState.currentTurnPlayerId ?? '';
      const cardType = card.cardType ?? (card.type?.toLowerCase() === 'market' ? 'market' : 'chance');
      events.push({
        type: SynthesizedGameEventType.EVENT_CARD_DRAWN,
        timestamp,
        playerId,
        cardId: currentCardId,
        cardType,
        title: card.title,
        description: card.effectDetail || card.description || '',
        effectDelta: card.effectDelta,
      });
    }
  }

  // 3. Transit Wheel Synthesis
  if (delta.lastTransitResult && delta.lastTransitResult.playerId) {
    const tr = delta.lastTransitResult;
    const prevTr = prevState.lastTransitResult;
    const isNewTransit = !prevTr ||
      prevTr.playerId !== tr.playerId ||
      prevTr.outcome !== tr.outcome ||
      prevTr.cellIndex !== tr.cellIndex ||
      prevTr.targetCell !== tr.targetCell;
    if (isNewTransit) {
      events.push({
        type: SynthesizedGameEventType.TRANSIT_WHEEL_LANDED,
        timestamp,
        playerId: tr.playerId,
        cellIndex: tr.cellIndex,
        outcome: tr.outcome,
        targetCell: tr.targetCell,
        payout: tr.payout,
        boostSteps: tr.boostSteps,
      });
    }
  }

  // 4. Pawn Movement Synthesis
  if (delta.players && delta.players.length > 0) {
    for (const p of delta.players) {
      const prevPos = prevState.playerPositions?.[p.id];
      if (prevPos !== undefined && p.position !== undefined && prevPos !== p.position) {
        events.push({
          type: SynthesizedGameEventType.PAWN_MOVED,
          timestamp,
          playerId: p.id,
          fromCell: prevPos,
          toCell: p.position,
        });
      }
    }
  }

  return events;
}
