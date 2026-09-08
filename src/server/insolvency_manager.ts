// [UC-GAME-053/MSS][UC-GAME-054/MSS][UC-GAME-055/MSS] Insolvency Manager
import { TurnPhase, type Room, type Player } from '../domain/room';
import { PROPERTY_DEEDS, type PropertyRegistry, type PropertyStateMap } from '../domain/property_manager';
import { decayModifiers } from '../domain/event_card_engine';

const LEVEL_MULTIPLIER: Record<number, number> = { 0: 1, 1: 1.5, 2: 2.5, 3: 4 };

// --- UC-GAME-053: Kiểm tra & chuyển InsolvencyPhase ---

export function checkInsolvency(room: Room): void {
  const player = room.players[room.currentPlayerIndex];
  if (!player || player.balance >= 0) return;

  room.phase = TurnPhase.InsolvencyPhase;

  console.info(JSON.stringify({
    event: 'INSOLVENCY_TRIGGERED', correlationId: room.roomCode,
    timestamp: Date.now(), delta: { playerId: player.id, balance: player.balance },
  }));
}

function comparePropertiesForLiquidation(a: number, b: number, stateMap: PropertyStateMap): number {
  const levelA = stateMap.get(a)?.level ?? 0;
  const levelB = stateMap.get(b)?.level ?? 0;
  if (levelB !== levelA) return levelB - levelA;
  const priceA = PROPERTY_DEEDS.get(a)?.price ?? 0;
  const priceB = PROPERTY_DEEDS.get(b)?.price ?? 0;
  return priceB - priceA;
}

function liquidateCell(
  player: Player,
  cellIndex: number,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): void {
  const deed = PROPERTY_DEEDS.get(cellIndex);
  if (!deed) return;
  const level = stateMap.get(cellIndex)?.level ?? 0;
  const mult = LEVEL_MULTIPLIER[level] ?? 1;
  player.balance += Math.floor(deed.price * mult * 0.5);
  registry.delete(cellIndex);
  stateMap.delete(cellIndex);
  player.mortgagedProperties ??= [];
  const mortIdx = player.mortgagedProperties.indexOf(cellIndex);
  if (mortIdx !== -1) player.mortgagedProperties.splice(mortIdx, 1);
}

// --- Thanh lý cưỡng chế tài sản (ưu tiên cấp cao trước, dừng khi số dư >= 0) ---

export function liquidateAssets(
  room: Room,
  playerId: string,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): void {
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return;

  const ownedCells = Array.from(registry.entries())
    .filter(([, owner]) => owner === playerId)
    .sort(([a], [b]) => comparePropertiesForLiquidation(a, b, stateMap));

  for (const [cellIndex] of ownedCells) {
    if (player.balance >= 0) break;
    liquidateCell(player, cellIndex, registry, stateMap);
  }

  if (player.balance >= 0 && room.phase === TurnPhase.InsolvencyPhase) {
    room.phase = TurnPhase.PropertyManagement;
  }

  console.info(JSON.stringify({
    event: 'LIQUIDATE_ASSETS', correlationId: room.roomCode,
    timestamp: Date.now(), delta: { playerId, balance: player.balance },
  }));
}

// --- UC-GAME-054: Tuyên Bố Phá Sản ---
export function declareBankruptcy(
  room: Room,
  playerId: string,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): { gameOver: boolean; rankings?: Array<{ id: string; netWorth: number }> } {
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return { gameOver: false };
  if (player.bankrupt) {
    const isOver = room.players.filter((p) => !p.bankrupt).length <= 1;
    return { gameOver: isOver, rankings: isOver ? calculateRankings(room, registry, stateMap) : undefined };
  }

  player.bankrupt = true;

  for (const [cellIndex, owner] of Array.from(registry.entries())) {
    if (owner === playerId) {
      registry.delete(cellIndex);
      stateMap.delete(cellIndex);
    }
  }
  if (player.mortgagedProperties) player.mortgagedProperties.length = 0;

  console.info(JSON.stringify({
    event: 'BANKRUPTCY_DECLARED', correlationId: room.roomCode,
    timestamp: Date.now(), delta: { playerId },
  }));

  const alive = room.players.filter((p) => !p.bankrupt);
  if (alive.length <= 1) {
    const rankings = calculateRankings(room, registry, stateMap);
    return { gameOver: true, rankings };
  }

  // Chuyển lượt sang người chơi tiếp theo còn sống nếu người phá sản đang giữ lượt
  if (room.players[room.currentPlayerIndex]?.id === playerId) {
    advanceTurnAfterBankruptcy(room);
  }
  return { gameOver: false };
}

function advanceTurnAfterBankruptcy(room: Room): void {
  const total = room.players.length;
  let next    = (room.currentPlayerIndex + 1) % total;
  let steps   = 0;
  while (steps < total) {
    if (next === 0) room.activeModifiers = decayModifiers(room.activeModifiers);
    if (!room.players[next]?.bankrupt) break;
    next = (next + 1) % total;
    steps++;
  }
  room.currentPlayerIndex = next;
  const nextPlayer = room.players[next];
  if (nextPlayer?.skipNextTurn) {
    nextPlayer.skipNextTurn = false;
    room.phase = TurnPhase.PropertyManagement;
  } else {
    room.phase = TurnPhase.WaitingRoll;
  }
}

// --- UC-GAME-055: Quyết Toán Net Worth ---

export function calculateNetWorth(
  playerId: string,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  players: Room['players'],
): number {
  const player = players.find((p) => p.id === playerId);
  if (!player) return 0;

  let worth = player.balance;
  const MORTGAGE_RATE = 0.5;

  for (const [cellIndex, owner] of registry) {
    if (owner !== playerId) continue;
    const deed  = PROPERTY_DEEDS.get(cellIndex);
    if (!deed) continue;
    const level = stateMap.get(cellIndex)?.level ?? 0;
    const mult  = LEVEL_MULTIPLIER[level] ?? 1;
    worth += Math.floor(deed.price * mult);

    if (player.mortgagedProperties?.includes(cellIndex)) {
      worth -= Math.floor(deed.price * MORTGAGE_RATE);
    }
  }
  return worth;
}

export function calculateRankings(
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): Array<{ id: string; netWorth: number }> {
  return room.players
    .map((p) => ({ id: p.id, netWorth: calculateNetWorth(p.id, registry, stateMap, room.players), bankrupt: Boolean(p.bankrupt) }))
    .sort((a, b) => (b.netWorth !== a.netWorth ? b.netWorth - a.netWorth : (a.bankrupt ? 1 : 0) - (b.bankrupt ? 1 : 0)))
    .map(({ id, netWorth }) => ({ id, netWorth }));
}
