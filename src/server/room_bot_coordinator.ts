// [UC-GAME-005/MSS][UC-GAME-008/MSS] Room Bot Coordinator — Decoupled Bot AI loop & Auction bot resolution
import { TurnPhase, type Room, type Player } from '../domain/room.js';
import { decideBotIntent, type BotConfig } from '../domain/bot/bot_engine.js';
import { getBotConfig } from './room_bot_manager.js';
import type { PropertyRegistry, PropertyStateMap } from '../domain/property_manager.js';
import type { RoomManager, AuctionSession, PlayerIntent } from './room_manager.js';

const MAX_AUCTION_ITERATIONS = 30;
const MAX_BOT_INTENTS = 50;

function executeBotBid(
  roomManager: RoomManager,
  roomCode: string,
  botId: string,
  rawAmount: unknown,
): boolean {
  const amount = typeof rawAmount === 'number' ? rawAmount : 0;
  const res = roomManager.handleAuctionBid(roomCode, botId, amount);
  if (res.success) return true;
  roomManager.handleAuctionPass(roomCode, botId);
  return false;
}

function evaluateSingleBotBid(
  roomManager: RoomManager,
  roomCode: string,
  bot: Player,
  auction: AuctionSession,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): boolean {
  const config = getBotConfig(roomManager.getBotPersonality(roomCode, bot.id), roomManager.getRng());
  const inc = 50;
  const room = roomManager.getRoom(roomCode);
  if (!room) return false;
  const intent = decideBotIntent(bot, room, registry, stateMap, config, { ...auction, bidIncrement: inc });

  if (intent?.type === 'INTENT_BID') {
    return executeBotBid(roomManager, roomCode, bot.id, intent.amount);
  }
  if (intent?.type === 'INTENT_AUCTION_PASS') {
    roomManager.handleAuctionPass(roomCode, bot.id);
  }
  return false;
}

function runAuctionIteration(
  roomManager: RoomManager,
  roomCode: string,
  room: Room,
  auction: AuctionSession,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): boolean {
  const eligible = room.players.filter(
    (p) => p.isBot && !p.bankrupt && p.id !== auction.declinedPlayerId && !auction.passedPlayers?.has(p.id),
  );
  if (eligible.length === 0) return false;

  let changed = false;
  for (const bot of eligible) {
    if (room.phase !== TurnPhase.AuctionPhase) break;
    if (auction.passedPlayers?.has(bot.id) || auction.highestBidder === bot.id) continue;
    if (evaluateSingleBotBid(roomManager, roomCode, bot, auction, registry, stateMap)) {
      changed = true;
    }
  }
  return changed;
}

function finalizeAuctionIfFinished(
  roomManager: RoomManager,
  roomCode: string,
  room: Room,
  auction: AuctionSession,
): void {
  if (room.phase !== TurnPhase.AuctionPhase) return;
  const remainingContenders = room.players.filter(
    (p) => !p.bankrupt && p.id !== auction.declinedPlayerId && p.id !== auction.highestBidder,
  );
  if (remainingContenders.length === 0 || remainingContenders.every((p) => auction.passedPlayers?.has(p.id))) {
    roomManager.handleAuctionClose(roomCode);
  }
}

export function resolveAuctionBots(roomManager: RoomManager, roomCode: string): void {
  const room = roomManager.getRoom(roomCode);
  if (!room || room.phase !== TurnPhase.AuctionPhase) return;
  const auction = roomManager.getAuctionSession(roomCode);
  if (!auction) return;

  const registry = roomManager.getRegistry(roomCode) ?? new Map();
  const stateMap = roomManager.getPropertyStates(roomCode) ?? new Map();

  let auctionChanged = true;
  let iterations = 0;
  while (auctionChanged && iterations < MAX_AUCTION_ITERATIONS && room.phase === TurnPhase.AuctionPhase) {
    iterations++;
    auctionChanged = runAuctionIteration(roomManager, roomCode, room, auction, registry, stateMap);
  }
  finalizeAuctionIfFinished(roomManager, roomCode, room, auction);
}

export function stepAuctionBot(
  roomManager: RoomManager,
  roomCode: string,
): { changed: boolean; finished: boolean } {
  const room = roomManager.getRoom(roomCode);
  if (!room || (room.phase as TurnPhase) !== TurnPhase.AuctionPhase) {
    return { changed: false, finished: true };
  }
  const auction = roomManager.getAuctionSession(roomCode);
  if (!auction) {
    return { changed: false, finished: true };
  }

  const eligibleBots = room.players.filter(
    (p) => p.isBot && !p.bankrupt && p.id !== auction.declinedPlayerId && !auction.passedPlayers?.has(p.id),
  );
  if (eligibleBots.length === 0) {
    return { changed: false, finished: true };
  }

  const candidateBot = eligibleBots.find((b) => auction.highestBidder !== b.id);
  if (!candidateBot) {
    const otherContenders = room.players.filter(
      (p) => !p.bankrupt && p.id !== auction.declinedPlayerId && p.id !== auction.highestBidder,
    );
    if (otherContenders.length === 0 || otherContenders.every((p) => auction.passedPlayers?.has(p.id))) {
      roomManager.handleAuctionClose(roomCode);
      return { changed: false, finished: true };
    }
    return { changed: false, finished: true };
  }

  const registry = roomManager.getRegistry(roomCode) ?? new Map();
  const stateMap = roomManager.getPropertyStates(roomCode) ?? new Map();
  const changed = evaluateSingleBotBid(roomManager, roomCode, candidateBot, auction, registry, stateMap);

  finalizeAuctionIfFinished(roomManager, roomCode, room, auction);
  const isFinished = (roomManager.getRoom(roomCode)?.phase as TurnPhase) !== TurnPhase.AuctionPhase || !roomManager.getAuctionSession(roomCode);

  return { changed, finished: isFinished };
}

function handleFailedBotIntent(
  roomManager: RoomManager,
  roomCode: string,
  botId: string,
  intentType: string,
): boolean {
  if (intentType === 'INTENT_BUY' || intentType === 'INTENT_BUY_PROPERTY') {
    roomManager.handleDecline(roomCode, botId);
    return (roomManager.getRoom(roomCode)?.phase as TurnPhase) !== TurnPhase.AuctionPhase;
  }
  if (intentType === 'INTENT_BAIL_OUT') {
    roomManager.handleRollDice(roomCode, botId);
    return true;
  }
  if (intentType === 'INTENT_UPGRADE' || intentType === 'INTENT_REDEEM') {
    roomManager.handleEndTurn(roomCode, botId);
    return true;
  }
  return false;
}

function handleDeclineIntent(_roomManager: RoomManager, _roomCode: string): boolean {
  return true;
}

function executeSingleBotIntent(
  roomManager: RoomManager,
  roomCode: string,
  active: Player,
  currentRoom: Room,
  config: BotConfig,
): boolean {
  const reg = roomManager.getRegistry(roomCode) ?? new Map();
  const sm = roomManager.getPropertyStates(roomCode) ?? new Map();
  const intent = decideBotIntent(active, currentRoom, reg, sm, config);
  if (!intent) return false;
  if (intent.type === 'INTENT_ROLL') {
    roomManager.handleRollDice(roomCode, active.id);
    return true;
  }
  const result = roomManager.handlePlayerIntent(roomCode, active.id, intent as PlayerIntent);
  if (!result.success) {
    return handleFailedBotIntent(roomManager, roomCode, active.id, intent.type);
  }
  if (intent.type === 'INTENT_DECLINE') {
    return handleDeclineIntent(roomManager, roomCode);
  }
  return true;
}

function isAuctionPhaseStuck(roomManager: RoomManager, roomCode: string): boolean {
  if ((roomManager.getRoom(roomCode)?.phase as TurnPhase) !== TurnPhase.AuctionPhase) {
    return false;
  }
  while ((roomManager.getRoom(roomCode)?.phase as TurnPhase) === TurnPhase.AuctionPhase) {
    const step = stepAuctionBot(roomManager, roomCode);
    if (step.finished) break;
  }
  return (roomManager.getRoom(roomCode)?.phase as TurnPhase) === TurnPhase.AuctionPhase;
}

function executeBotIntentStep(
  roomManager: RoomManager,
  roomCode: string,
  botId: string,
  config: BotConfig,
): boolean {
  const room = roomManager.getRoom(roomCode);
  if (!room) return false;
  const active = room.players[room.currentPlayerIndex];
  if (!active || !active.isBot || active.id !== botId) return false;
  if ((room.phase as TurnPhase) === TurnPhase.AuctionPhase) {
    return false;
  }
  return executeSingleBotIntent(roomManager, roomCode, active, room, config);
}

function runBotIntentLoop(
  roomManager: RoomManager,
  roomCode: string,
  botId: string,
  config: BotConfig,
): void {
  let counter = 0;
  while (counter < MAX_BOT_INTENTS) {
    if (roomManager.hasPendingTrade?.(roomCode) || roomManager.hasPendingBuyout?.(roomCode)) break;
    if (!executeBotIntentStep(roomManager, roomCode, botId, config)) break;
    counter++;
  }
}

export function runBotTurn(roomManager: RoomManager, roomCode: string): void {
  const room = roomManager.getRoom(roomCode);
  if (!room) return;
  if (isAuctionPhaseStuck(roomManager, roomCode)) return;
  if (roomManager.hasPendingTrade?.(roomCode) || roomManager.hasPendingBuyout?.(roomCode)) return;

  const current = room.players[room.currentPlayerIndex];
  if (!current?.isBot || current.bankrupt) return;

  const config = getBotConfig(roomManager.getBotPersonality(roomCode, current.id), roomManager.getRng());
  runBotIntentLoop(roomManager, roomCode, current.id, config);
  while ((roomManager.getRoom(roomCode)?.phase as TurnPhase) === TurnPhase.AuctionPhase) {
    const step = stepAuctionBot(roomManager, roomCode);
    if (step.finished) break;
  }
  if (roomManager.hasPendingTrade?.(roomCode) || roomManager.hasPendingBuyout?.(roomCode)) return;
  releaseStuckBotTurn(roomManager, roomCode, current.id);
}

export function stepBotTurn(roomManager: RoomManager, roomCode: string): boolean {
  const room = roomManager.getRoom(roomCode);
  if (!room || !room.started) return false;
  if (isAuctionPhaseStuck(roomManager, roomCode)) return false;
  if (roomManager.hasPendingTrade?.(roomCode) || roomManager.hasPendingBuyout?.(roomCode)) return false;

  const current = room.players[room.currentPlayerIndex];
  if (!current?.isBot || current.bankrupt) return false;

  const config = getBotConfig(roomManager.getBotPersonality(roomCode, current.id), roomManager.getRng());
  const progressed = executeBotIntentStep(roomManager, roomCode, current.id, config);
  if (roomManager.hasPendingTrade?.(roomCode) || roomManager.hasPendingBuyout?.(roomCode)) return false;
  if (!progressed) {
    releaseStuckBotTurn(roomManager, roomCode, current.id);
  }
  return progressed;
}

function releaseStuckBotTurn(roomManager: RoomManager, roomCode: string, botPlayerId: string): void {
  if (roomManager.hasPendingTrade?.(roomCode) || roomManager.hasPendingBuyout?.(roomCode)) return;
  const roomEnd = roomManager.getRoom(roomCode);
  if (!roomEnd) return;
  if ((roomEnd.phase as TurnPhase) === TurnPhase.ActionPhase) {
    roomManager.handleDecline(roomCode, botPlayerId);
    if ((roomManager.getRoom(roomCode)?.phase as TurnPhase) !== TurnPhase.AuctionPhase) {
      roomManager.handleEndTurn(roomCode, botPlayerId);
    }
  } else if ((roomEnd.phase as TurnPhase) === TurnPhase.PropertyManagement) {
    roomManager.handleEndTurn(roomCode, botPlayerId);
  }
}
