// [UC-ADM-MOD] Server Vitals Collector Module
import type { RoomManager } from '../room_manager.js';
import type { PersistentRoomLogger } from '../logging/persistent_room_logger.js';
import type { ServerVitals } from './admin_types.js';

export function collectServerVitals(
  rooms: RoomManager,
  roomLogger: PersistentRoomLogger,
): ServerVitals {
  const mem = process.memoryUsage();
  let totalRooms = 0;
  let liveRooms = 0;
  let lobbyRooms = 0;
  if (rooms?.roomMap) {
    for (const r of rooms.roomMap.values()) {
      totalRooms++;
      if (r.started) {
        liveRooms++;
      } else {
        lobbyRooms++;
      }
    }
  }

  const storage = roomLogger.supabaseStorage;
  const configured = Boolean(
    typeof storage?.isConfigured === 'function'
      ? storage.isConfigured()
      : storage?.isConfigured,
  );
  const bucket = storage?.defaultBucket ?? 'game-logs';
  const keyType: 'JWT' | 'OPAQUE' | 'NONE' = storage?.keyType ?? (configured ? 'JWT' : 'NONE');

  return {
    memoryRssMb: Math.round((mem.rss / (1024 * 1024)) * 100) / 100,
    memoryHeapUsedMb: Math.round((mem.heapUsed / (1024 * 1024)) * 100) / 100,
    uptimeSeconds: Math.floor(process.uptime()),
    totalRooms,
    liveRooms,
    lobbyRooms,
    storageStatus: {
      configured,
      provider: 'supabase',
      bucket,
      keyType,
    },
  };
}
