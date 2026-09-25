// [IMP-64] Extracted lifecycle & state management functions from RoomManager
// ZERO LOGIC CHANGE â code moved verbatim from room_manager.ts
import {
  createRoom as domainCreateRoom, createPlayer, TurnPhase,
  getInitialBalanceForPlayerCount,
} from '../domain/room.js';
import { BotPersonality } from '../domain/bot/bot_engine.js';
import { initRoomBots, addBotToRoom, removeBotFromRoom, type RoomBotSpec } from './room_bot_manager.js';
import {
  createMarketDeck, createChanceDeck,
} from '../domain/event_card_engine.js';
import { executeTurnEnd } from './turn_loop.js';
import type { Room, Player } from '../domain/room.js';
import type { PropertyRegistry, PropertyStateMap } from '../domain/property_manager.js';
import type { AuctionSession } from './auction_manager.js';
import { pendingTradeManager } from './pending_trade_manager.js';
import { generateRandomAnimalName } from '../domain/name_generator.js';

export function getActivePlayerFn(room: Room | undefined, playerId: string): Player | undefined {
  if (!room?.started) return undefined;
  const current = room.players[room.currentPlayerIndex];
  return current?.id === playerId ? current : undefined;
}

export function doCreateRoom(
  rooms: Map<string, Room>,
  registries: Map<string, PropertyRegistry>,
  propertyStates: Map<string, PropertyStateMap>,
  rolledThisTurn: Map<string, boolean>,
  auctions: Map<string, AuctionSession>,
  deckRng: () => number,
  hostId: string,
  customRoomCode: string | undefined,
  touchActivityFn: (rc: string) => void,
): Room {
  const upperCode = customRoomCode?.toUpperCase();
  const existing = upperCode ? rooms.get(upperCode) : undefined;
  const canUseCustom = upperCode && (!existing || existing.hostId === hostId);
  const code = canUseCustom ? upperCode : undefined;
  const room = domainCreateRoom(hostId, code);
  const hostPlayer = room.players.find((p) => p.id === hostId);
  if (hostPlayer && !hostPlayer.name) {
    hostPlayer.name = generateRandomAnimalName([], `${room.roomCode}_${hostId}`);
  }
  room.marketDeck = createMarketDeck(deckRng);
  room.chanceDeck = createChanceDeck(deckRng);
  rooms.set(room.roomCode, room);
  registries.set(room.roomCode, new Map());
  propertyStates.set(room.roomCode, new Map());
  rolledThisTurn.delete(room.roomCode);
  auctions.delete(room.roomCode);
  pendingTradeManager.clearSession(room.roomCode);
  touchActivityFn(room.roomCode);
  return room;
}

export function doJoinRoom(
  rooms: Map<string, Room>,
  roomCode: string,
  playerId: string,
  touchActivityFn: (rc: string) => void,
): Room | undefined {
  const room = rooms.get(roomCode) ?? rooms.get(roomCode.toUpperCase());
  if (!room || room.started) return undefined;
  if (room.players.length >= 4) return undefined;  // ROOM_FULL guard
  if (room.players.some((p) => p.id === playerId)) return undefined;  // duplicate guard
  const newPlayer = createPlayer(playerId);
  const existingNames = room.players.filter((p) => p.name).map((p) => p.name as string);
  newPlayer.name = generateRandomAnimalName(existingNames, `${room.roomCode}_${playerId}`);
  room.players.push(newPlayer);
  touchActivityFn(room.roomCode);
  return room;
}

export function doStartGame(
  rooms: Map<string, Room>,
  botPersonalities: Map<string, BotPersonality>,
  roomCode: string,
  bots: ReadonlyArray<RoomBotSpec> | undefined,
  touchActivityFn: (rc: string) => void,
): Room | undefined {
  const room = rooms.get(roomCode) ?? rooms.get(roomCode.toUpperCase());
  if (!room || room.started) return undefined;
  initRoomBots(room, bots, botPersonalities, room.roomCode);
  if (room.players.length < 2) return undefined;
  // Äáº£m báº£o Host cá»§a phÃ²ng luÃ´n luÃ´n cÃ³ isBot = false khi báº¯t Äáº§u vÃ¡n Äáº¥u (trá»« khi ÄÆ°á»£c cáº¥u hÃ¬nh rÃµ rÃ ng lÃ  Bot trong simulation)
  const hostPlayer = room.players.find((p) => p.id === room.hostId);
  if (hostPlayer && !botPersonalities.has(`${room.roomCode}:${room.hostId}`) && !botPersonalities.has(`${roomCode}:${room.hostId}`)) {
    hostPlayer.isBot = false;
  }
  room.started = true;
  room.roundCount = 1;
  const initialBalance = getInitialBalanceForPlayerCount(room.players.length);
  for (const player of room.players) {
    player.balance = initialBalance;
  }
  room.currentPlayerIndex = 0;
  const first = room.players[0];
  room.phase = first?.skipNextTurn ? TurnPhase.PropertyManagement : TurnPhase.WaitingRoll;
  if (first?.skipNextTurn) first.skipNextTurn = false;
  touchActivityFn(room.roomCode);
  return room;
}

export function doAddBot(
  rooms: Map<string, Room>,
  botPersonalities: Map<string, BotPersonality>,
  roomCode: string,
  botId: string | undefined,
  personality: BotPersonality | undefined,
  touchActivityFn: (rc: string) => void,
): Player | undefined {
  touchActivityFn(roomCode);
  return addBotToRoom(rooms.get(roomCode), roomCode, botId, personality, botPersonalities);
}

export function doRemoveBot(
  rooms: Map<string, Room>,
  botPersonalities: Map<string, BotPersonality>,
  roomCode: string,
  botId: string,
  touchActivityFn: (rc: string) => void,
): boolean {
  touchActivityFn(roomCode);
  return removeBotFromRoom(rooms.get(roomCode), roomCode, botId, botPersonalities);
}

export function doSetBotPersonality(
  botPersonalities: Map<string, BotPersonality>,
  roomCode: string,
  botId: string,
  personality: BotPersonality,
): void {
  botPersonalities.set(`${roomCode}:${botId}`, personality);
}

export function doGetBotPersonality(
  botPersonalities: Map<string, BotPersonality>,
  roomCode: string,
  botId: string,
): BotPersonality {
  return botPersonalities.get(`${roomCode}:${botId}`) ?? BotPersonality.Balanced;
}

export function doHandleEndTurn(
  rooms: Map<string, Room>,
  rolledThisTurn: Map<string, boolean>,
  registries: Map<string, PropertyRegistry>,
  propertyStates: Map<string, PropertyStateMap>,
  auctions: Map<string, AuctionSession>,
  touchActivityFn: (rc: string) => void,
  roomCode: string,
  playerId: string,
  continueDoubles?: boolean,
  rng: () => number = Math.random,
): Room | undefined {
  touchActivityFn(roomCode);
  const room = rooms.get(roomCode);
  const current = getActivePlayerFn(room, playerId);
  if (!current || !room) return undefined;
  return executeTurnEnd(
    room,
    current,
    rolledThisTurn.get(roomCode) ?? false,
    continueDoubles ?? false,
    roomCode,
    rolledThisTurn,
    registries.get(roomCode),
    propertyStates.get(roomCode),
    auctions,
    rng,
  );
}

export function doCloseRoom(
  rooms: Map<string, Room>,
  registries: Map<string, PropertyRegistry>,
  propertyStates: Map<string, PropertyStateMap>,
  auctions: Map<string, AuctionSession>,
  rolledThisTurn: Map<string, boolean>,
  activeTimersMap: Map<string, Set<NodeJS.Timeout>>,
  lastActivity: Map<string, number>,
  closeHooks: Array<(roomCode: string, room: Room) => void>,
  botPersonalities: Map<string, BotPersonality>,
  roomCode: string,
): boolean {
  const room = rooms.get(roomCode);
  if (!room) return false;
  rooms.delete(roomCode);
  doClearRoomTimers(activeTimersMap, roomCode);
  for (const hook of closeHooks) hook(roomCode, room);
  for (const k of Array.from(botPersonalities.keys())) {
    if (k.startsWith(`${roomCode}:`)) botPersonalities.delete(k);
  }
  registries.delete(roomCode);
  propertyStates.delete(roomCode);
  auctions.delete(roomCode);
  rolledThisTurn.delete(roomCode);
  lastActivity.delete(roomCode);
  pendingTradeManager.clearSession(roomCode);
  return true;
}

export function doOnCloseRoom(
  closeHooks: Array<(roomCode: string, room: Room) => void>,
  hook: (roomCode: string, room: Room) => void,
): () => void {
  closeHooks.push(hook);
  return () => {
    const idx = closeHooks.indexOf(hook);
    if (idx !== -1) closeHooks.splice(idx, 1);
  };
}

export function doRegisterTimer(
  activeTimersMap: Map<string, Set<NodeJS.Timeout>>,
  roomCode: string,
  timer: NodeJS.Timeout,
): void {
  let timers = activeTimersMap.get(roomCode);
  if (!timers) activeTimersMap.set(roomCode, (timers = new Set()));
  timers.add(timer);
}

export function doClearRoomTimers(
  activeTimersMap: Map<string, Set<NodeJS.Timeout>>,
  roomCode: string,
): void {
  const timers = activeTimersMap.get(roomCode);
  if (timers) {
    for (const t of timers) clearTimeout(t);
    activeTimersMap.delete(roomCode);
  }
}

export function doGetActiveTimers(
  activeTimersMap: Map<string, Set<NodeJS.Timeout>>,
  roomCode: string,
): Set<NodeJS.Timeout> | undefined {
  return activeTimersMap.get(roomCode);
}

export function doTouchActivity(
  rooms: Map<string, Room>,
  lastActivity: Map<string, number>,
  roomCode: string,
  timestamp: number,
): void {
  if (rooms.has(roomCode)) lastActivity.set(roomCode, timestamp);
}

export function doGetLastActivity(
  lastActivity: Map<string, number>,
  roomCode: string,
): number | undefined {
  return lastActivity.get(roomCode);
}

export function doGetAllRoomCodes(rooms: Map<string, Room>): string[] {
  return Array.from(rooms.keys());
}

export function doGetRoomCount(rooms: Map<string, Room>): number {
  return rooms.size;
}

export function doHasRoom(rooms: Map<string, Room>, roomCode: string): boolean {
  return rooms.has(roomCode);
}
