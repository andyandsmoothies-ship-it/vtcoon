// [UC-GAME-002/MSS][UC-GAME-005/MSS][UC-GAME-008/MSS] Room Bot Manager
// Quản lý bot AI trong phòng: khởi tạo, thêm/xóa bot và cấu hình tính cách
import { createPlayer, type Player, type Room } from '../domain/room.js';
import { BotPersonality, type BotConfig } from '../domain/bot/bot_engine.js';

export interface RoomBotSpec {
  readonly id: string;
  readonly name?: string;
  readonly personality?: string;
}

export function initRoomBots(
  room: Room,
  bots?: ReadonlyArray<RoomBotSpec>,
  botPersonalities?: Map<string, BotPersonality>,
  roomCode?: string,
): void {
  if (!bots || bots.length === 0) return;
  for (const b of bots) {
    if (room.players.length >= 4) break;
    const cleanId = b.id?.trim();
    if (!cleanId || cleanId === room.hostId) continue;
    if (!room.players.some((p) => p.id === cleanId)) {
      const botPlayer = createPlayer(cleanId);
      botPlayer.isBot = true;
      room.players.push(botPlayer);
    }
    if (b.personality && botPersonalities && roomCode) {
      const pEnum = Object.values(BotPersonality).includes(b.personality as BotPersonality)
        ? (b.personality as BotPersonality)
        : BotPersonality.Balanced;
      botPersonalities.set(`${roomCode}:${cleanId}`, pEnum);
    }
  }
}

export function addBotToRoom(
  room: Room | undefined,
  roomCode: string,
  botId?: string,
  personality?: BotPersonality,
  botPersonalities?: Map<string, BotPersonality>,
): Player | undefined {
  if (!room || room.started || room.players.length >= 4) return undefined;
  const nextIdx = room.players.length + 1;
  const id = botId || `bot_${nextIdx}`;
  if (room.players.some((p) => p.id === id)) return undefined;

  const botPlayer = createPlayer(id);
  botPlayer.isBot = true;
  room.players.push(botPlayer);
  if (personality && botPersonalities) {
    botPersonalities.set(`${roomCode}:${id}`, personality);
  }
  return botPlayer;
}

export function removeBotFromRoom(
  room: Room | undefined,
  roomCode: string,
  botId: string,
  botPersonalities?: Map<string, BotPersonality>,
): boolean {
  if (!room || room.started) return false;
  const idx = room.players.findIndex((p) => p.id === botId && p.isBot);
  if (idx === -1) return false;
  room.players.splice(idx, 1);
  botPersonalities?.delete(`${roomCode}:${botId}`);
  return true;
}

export function getBotConfig(personality: BotPersonality): BotConfig {
  return {
    personality,
    balanceThresholdMultiplier:
      personality === BotPersonality.Aggressive
        ? 1.0
        : personality === BotPersonality.Passive
          ? 1.5
          : 1.20,
  };
}
