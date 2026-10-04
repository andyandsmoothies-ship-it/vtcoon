// [UC-ADM-MOD] Admin Cloud Log Sync Module
import type { PersistentRoomLogger } from '../logging/persistent_room_logger.js';
import { syncAllLocalLogsToCloud } from '../storage/supabase_log_sync.js';

export async function syncAdminCloudLogs(roomLogger: PersistentRoomLogger): Promise<{
  success: boolean;
  uploadedCount?: number;
  bucket?: string;
  reason?: string;
  error?: string;
}> {
  try {
    roomLogger.flushSync();
    const bucket = roomLogger.supabaseStorage?.defaultBucket ?? 'game-logs';
    const result = await syncAllLocalLogsToCloud(
      roomLogger.storageDir,
      roomLogger.manifestCatalog,
      roomLogger.supabaseStorage,
      bucket,
    );
    return {
      success: result.success,
      uploadedCount: result.uploadedCount,
      bucket: result.bucket,
      reason: result.reason,
      error: result.error,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      reason: 'SYNC_EXCEPTION',
      error: errorMsg,
    };
  }
}
