import type { Room } from '../domain/room.js';
import type { PropertyRegistry, PropertyStateMap } from '../domain/property_manager.js';
import type { BotPersonality } from '../domain/bot/index.js';

export interface RoomContext {
  readonly room: Room;
  readonly reg: PropertyRegistry;
  readonly sm: PropertyStateMap;
  readonly botPersonalities?: Map<string, BotPersonality>;
}
