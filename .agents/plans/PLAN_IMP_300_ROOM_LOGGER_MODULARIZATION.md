# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE: BÓC TÁCH ĐỒNG BỘ ĐÁM MÂY PERSISTENT ROOM LOGGER (IMP-300)
> **Phân hệ mục tiêu:** `server-network`
> **Phạm vi kỹ thuật:** Giải phóng nợ dòng mã (LOC Debt) của `src/server/logging/persistent_room_logger.ts` (hiện chạm mức báo động đỏ nguy cấp: 393/400 LOC, Tier 1, chỉ còn đúng 7 dòng mã trước trần cứng) bằng cách phân tách toàn bộ logic tương tác đám mây Supabase (upload .jsonl, download & merge cloud manifest, tải log từ xa và draining pending uploads) sang `RoomLoggerCloudSync` tại `src/server/logging/room_logger_cloud_sync.ts` (~172 LOC). `persistent_room_logger.ts` tinh gọn từ 393 LOC xuống 280 LOC.
> **Cam kết cốt lõi:**
> 1. **Pure Move 100% (Zero Semantic Mutation & Quarantine):** Bảo toàn 100% logic đồng bộ đám mây, cơ chế fail-safe HTTP status check (không ghi đè manifest khi mạng lỗi 5xx/timeout) và bảo toàn tính toàn vẹn của tệp manifest.
> 2. **Bảo Toàn Tương Thích Ngược Tuyệt Đối (Zero Interface Mutation):** Giữ nguyên 100% các trường công khai `public readonly pendingUploads` và `public readonly supabaseStorage` trên `PersistentRoomLogger` qua cơ chế tham chiếu trực tiếp, đảm bảo toàn bộ callers và test suites (`imp169`, `imp175`, `imp176`, `imp260`, `imp261`) hoạt động liền mạch không gãy đổ.
> 3. **Giải Phóng Triệt Để Cảnh Báo Vàng Tier 1:** Cả hai tệp `room_logger_cloud_sync.ts` (172 LOC) và `persistent_room_logger.ts` (280 LOC) đều nằm sâu trong vùng xanh an toàn (< 300 LOC, trần 400 LOC Tier 1).
> 4. **Scaffolding Protocol & Semantic Behavioral RED:** Khởi tạo stub type-safe cho `room_logger_cloud_sync.ts` trước khi chạy test, bảo đảm test suite thất bại do runtime assertions thay vì loader error.
> 5. **Chống Bội Nhiễm Phạm Vi (Scope Bleed Prevention):** Tách bạch phạm vi trực tiếp của vé IMP-300 với dòng phụ thuộc working tree của các vé tiền nhiệm.
> **Baseline Working Tree Dependencies (Predecessor IMP-294..299):** `src/client/3d/adaptive_cinematic_camera.tsx`, `src/client/3d/camera_state_machine.ts`, `src/client/3d/cinematic_chase_camera.ts`, `src/client/audio/sound_engine.ts`, `src/client/audio/sound_synth_recipes.ts`, `src/client/store/game_store_types.ts`, `src/client/ui/actionable_notification.ts`, `src/client/3d/camera_kinematic_helpers.ts`, `src/client/3d/camera_location_beacon.tsx`, `src/client/3d/camera_soft_return.ts`, `src/client/3d/cinematic_spline_flyby.ts`, `src/client/3d/use_camera_gestures.ts`, `src/client/audio/sound_engine_context.ts`, `src/client/audio/synth_recipes_ambient.ts`, `src/client/audio/synth_recipes_gameplay.ts`, `src/client/audio/synth_recipes_ui.ts`, `src/client/store/game_store_state_types.ts`, `src/client/store/game_store_subtypes.ts`, `src/client/ui/actionable_notification_gameplay.ts`, `src/client/ui/actionable_notification_map.ts`, `src/client/ui/actionable_notification_system.ts`, `tests/client/actionable_notification_modular.test.ts`, `tests/client/camera_gestures.test.ts`, `tests/client/camera_soft_return_and_beacon.test.ts`, `tests/client/cinematic_spline_flyby.test.ts`, `tests/client/dramatic_pacing_camera.test.ts`, `tests/client/game_store_types_modular.test.ts`, `tests/client/sound_engine_modular.test.ts`, `tests/client/sound_synth_recipes_modular.test.ts`, `tests/client/spatial_kinematics_camera.test.ts`
---
### Bảng 1: Phân bổ Ranh giới Phân hệ (Subsystem Boundary Alignment)
| Tệp Mã Nguồn | Phân Hệ | Vai Trò Kiến Trúc |
| :--- | :--- | :--- |
| `src/server/logging/room_logger_cloud_sync.ts` | `server-network` | **MỚI**: Quản lý Supabase cloud upload queue, manifest merge, remote fetch và drain pending uploads |
| `src/server/logging/persistent_room_logger.ts` | `server-network` | **SỬA**: Tinh gọn thành Bộ điều phối trung tâm ghi nhật ký đĩa cục bộ, ủy quyền cloud I/O sang RoomLoggerCloudSync |
| `tests/server/room_logger_cloud_sync.test.ts` | Living Test | **MỚI**: Living Contract Test kiểm tra độc lập các kịch bản mạng, fail-safe HTTP status và upload queue |
---
### Bảng 2: Ngân Sách Dòng Mã (LOC Accounting)
| Target physical file | Tier Classification | Baseline LOC | Expected LOC | Net Change | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/server/logging/room_logger_cloud_sync.ts` | Tier 1 (Domain/Server/Logic) | 0 | 172 | +172 | <= 400 | ✔️ Safe |
| `src/server/logging/persistent_room_logger.ts` | Tier 1 (Domain/Server/Logic) | 393 | 280 | -113 | <= 400 | ⚠️ Warning |
| `tests/server/room_logger_cloud_sync.test.ts` | Living Test | 0 | 165 | +165 | <= 600 | ✔️ Safe |
---
### Trạm 1: Hợp Đồng Kiểm Thử Độc Lập (RED Contract Tests)
**Target physical file**: `tests/server/room_logger_cloud_sync.test.ts` (Tệp mới)
> **Kỷ luật Seam Discipline (Iron Law):** Không monkey-patch framework internals. Kiểm thử trực tiếp qua mock `ISupabaseStorageService` và quan sát trạng thái đĩa / manifest.
> **Quy chuẩn Scaffolding Stub Type-Safe:** Tệp mới được scaffold trước với kiểu dữ liệu tường minh, tuyệt đối CẤM `as any` và `as unknown as T`.
> **Kỷ luật Zero Loops in it():** Cấm tuyệt đối vòng lặp trong `it()`. Mật độ duy trì nghiêm ngặt trong dải vàng 1-4 asserts/test.

1. **TC-RL-SYNC.01 [UC-RL-SYNC/MSS]**: Given đối tượng storage chưa cấu hình, When gọi isStorageConfigured(undefined), Then hàm trả về false an toàn.
2. **TC-RL-SYNC.02 [UC-RL-SYNC/MSS]**: Given đối tượng storage có phương thức isConfigured() trả về true, When gọi isStorageConfigured(storage), Then hàm trả về true.
3. **TC-RL-SYNC.03 [UC-RL-SYNC/MSS]**: Given RoomLoggerCloudSync với storage chưa cấu hình, When gọi finalizeRoomArchive, Then manifest cục bộ được cập nhật đầy đủ và không kích hoạt upload.
4. **TC-RL-SYNC.04 [UC-RL-SYNC/MSS]**: Given RoomLoggerCloudSync với storage đã cấu hình, When gọi finalizeRoomArchive, Then tệp .jsonl và _manifest/rooms_manifest.json được đẩy vào hàng đợi upload.
5. **TC-RL-SYNC.05 [UC-RL-SYNC/MSS]**: Given quá trình tải cloud manifest trả về mã HTTP 500 lỗi mạng, When finalizeRoomArchive thực thi, Then fail-safe kích hoạt và không ghi đè manifest đám mây.
6. **TC-RL-SYNC.06 [UC-RL-SYNC/MSS]**: Given quá trình tải cloud manifest trả về mã HTTP 404 chưa có manifest, When finalizeRoomArchive thực thi, Then manifest mới được tạo và tải lên bình thường.
7. **TC-RL-SYNC.07 [UC-RL-SYNC/MSS]**: Given quá trình tải cloud manifest trả về mã HTTP 200 có dữ liệu, When finalizeRoomArchive thực thi, Then manifest đám mây được merge vào manifest cục bộ.
8. **TC-RL-SYNC.08 [UC-RL-SYNC/MSS]**: Given storage chưa cấu hình, When gọi syncCloudManifest, Then hàm kết thúc ngay lập tức mà không gọi downloadFile.
9. **TC-RL-SYNC.09 [UC-RL-SYNC/MSS]**: Given storage đã cấu hình và tải cloud manifest thành công, When gọi syncCloudManifest, Then saveManifest được gọi và dữ liệu mới được merge.
10. **TC-RL-SYNC.10 [UC-RL-SYNC/MSS]**: Given log file đã tồn tại trên đĩa cục bộ, When gọi fetchRemoteLog, Then hàm ưu tiên trả về nội dung từ đĩa mà không tải từ đám mây.
11. **TC-RL-SYNC.11 [UC-RL-SYNC/MSS]**: Given log file không có trên đĩa cục bộ và storage tải về thành công, When gọi fetchRemoteLog, Then nội dung được ghi đệm vào đĩa và trả về chuỗi log.
12. **TC-RL-SYNC.12 [UC-RL-SYNC/MSS]**: Given storage không tìm thấy file từ xa, When gọi fetchRemoteLog, Then hàm trả về null an toàn mà không ném ngoại lệ.
13. **TC-RL-SYNC.13 [UC-RL-SYNC/MSS]**: Given RoomLoggerCloudSync đang có các tác vụ upload pendingUploads, When gọi stop(), Then toàn bộ upload được await hoàn tất và pendingUploads rỗng.
14. **TC-RL-SYNC.14 [UC-RL-SYNC/MSS]**: Given PersistentRoomLogger khởi tạo, When kiểm tra pendingUploads và cloudSync, Then mảng tham chiếu trỏ cùng địa chỉ reference với cloudSync.pendingUploads.
---
### Trạm 2: Kế Hoạch Triển Khai Chi Tiết (Implementation Tasks)

#### Task 1: Khởi Tạo Tệp Đồng Bộ Đám Mây `src/server/logging/room_logger_cloud_sync.ts`
**Target physical file**: `src/server/logging/room_logger_cloud_sync.ts` (Tệp mới)

```typescript
// [IMP-300] Room Logger Cloud Storage Sync & Remote Archive Manager
import fs from 'node:fs';
import path from 'node:path';
import type { AdminArchivedRoomSummary } from '../network/admin_types.js';
import {
  type ISupabaseStorageService,
} from '../storage/supabase_storage.js';
import {
  parseLogEntries,
  mergeCloudManifest,
  reindexLocalLogs,
  resolveLogFileName,
} from './room_logger_reindexer.js';
import type { RoomFinishSummary } from './persistent_room_logger.js';

export function isStorageConfigured(storage?: ISupabaseStorageService): boolean {
  if (!storage) return false;
  return typeof storage.isConfigured === 'function'
    ? storage.isConfigured()
    : Boolean(storage.isConfigured);
}

export interface FinalizeArchiveParams {
  logDir: string;
  fileName: string;
  manifest: Map<string, AdminArchivedRoomSummary>;
  summary?: RoomFinishSummary;
  saveManifest: () => void;
  getArchivedRoomsList: () => AdminArchivedRoomSummary[];
}

export interface FetchRemoteParams {
  roomCode: string;
  timestamp?: number;
  logDir: string;
  manifest: Map<string, AdminArchivedRoomSummary>;
  ensureDir: () => void;
  saveManifest: () => void;
}

export class RoomLoggerCloudSync {
  public readonly pendingUploads: Promise<unknown>[] = [];
  public readonly supabaseStorage?: ISupabaseStorageService;
  private manifestSyncQueue: Promise<void> = Promise.resolve();

  constructor(supabaseStorage?: ISupabaseStorageService) {
    this.supabaseStorage = supabaseStorage;
  }

  finalizeRoomArchive(params: FinalizeArchiveParams): void {
    const fullPath = path.join(params.logDir, params.fileName);
    let size = 0;
    let events = 0;
    try {
      if (fs.existsSync(fullPath)) {
        size = fs.statSync(fullPath).size;
        const content = fs.readFileSync(fullPath, 'utf8');
        events = parseLogEntries(content).length;
      }
    } catch {
      /* safe-ignore */
    }

    const existing = params.manifest.get(params.fileName);
    if (existing) {
      const updated: AdminArchivedRoomSummary = {
        ...existing,
        endTime: params.summary?.endTime ?? Date.now(),
        winner: params.summary?.winner ?? existing.winner,
        status: params.summary?.status ?? 'TERMINATED',
        playerCount: params.summary?.playerCount ?? existing.playerCount,
        fileSizeBytes: size,
        totalEvents: events,
      };
      params.manifest.set(params.fileName, updated);
      params.saveManifest();
    }

    if (!isStorageConfigured(this.supabaseStorage)) return;

    const bucket = this.supabaseStorage?.defaultBucket ?? 'game-logs';
    let logContent = '';
    try {
      if (fs.existsSync(fullPath)) {
        logContent = fs.readFileSync(fullPath, 'utf8');
      }
    } catch {
      /* safe-ignore */
    }

    const jsonlUploadPromise = this.supabaseStorage!.uploadFile(bucket, params.fileName, logContent, 'application/x-ndjson');

    const syncTask = async () => {
      await jsonlUploadPromise;

      let cloudData: string | null = null;
      let cloudStatus = 200;
      try {
        if (typeof this.supabaseStorage?.downloadFileWithStatus === 'function') {
          const res = await this.supabaseStorage.downloadFileWithStatus(bucket, '_manifest/rooms_manifest.json');
          cloudData = res.data;
          cloudStatus = res.status;
        } else {
          cloudData = await this.supabaseStorage!.downloadFile(bucket, '_manifest/rooms_manifest.json');
          cloudStatus = cloudData ? 200 : 404;
        }
      } catch {
        cloudStatus = 500;
      }

      if (cloudStatus !== 200 && cloudStatus !== 404) {
        return;
      }

      if (cloudData && mergeCloudManifest(params.manifest, cloudData)) {
        params.saveManifest();
      }

      const manifestList = params.getArchivedRoomsList();
      const manifestContent = JSON.stringify(manifestList, null, 2);
      await this.supabaseStorage!.uploadFile(bucket, '_manifest/rooms_manifest.json', manifestContent, 'application/json');
    };

    const chained = this.manifestSyncQueue.then(syncTask).catch(() => {});
    this.manifestSyncQueue = chained;
    this.pendingUploads.push(chained);
  }

  async syncCloudManifest(
    manifest: Map<string, AdminArchivedRoomSummary>,
    saveManifest: () => void
  ): Promise<void> {
    if (!isStorageConfigured(this.supabaseStorage)) return;
    const bucket = this.supabaseStorage?.defaultBucket ?? 'game-logs';
    try {
      const raw = await this.supabaseStorage!.downloadFile(bucket, '_manifest/rooms_manifest.json');
      if (raw && mergeCloudManifest(manifest, raw)) {
        saveManifest();
      }
    } catch {
      /* safe-ignore */
    }
  }

  async fetchRemoteLog(params: FetchRemoteParams): Promise<string | null> {
    if (!isStorageConfigured(this.supabaseStorage)) {
      return null;
    }

    const norm = params.roomCode.trim().toUpperCase();
    const targetFile = resolveLogFileName(params.manifest, norm, params.timestamp);
    let fileName = targetFile;
    if (!fileName) {
      if (params.timestamp !== undefined) {
        fileName = `${norm}_${params.timestamp}.jsonl`;
      } else {
        fileName = `${norm}.jsonl`;
      }
    }

    const bucket = this.supabaseStorage?.defaultBucket ?? 'game-logs';
    const remoteContent = await this.supabaseStorage!.downloadFile(bucket, fileName);
    if (!remoteContent) {
      return null;
    }

    const cachedPath = path.join(params.logDir, fileName);
    try {
      params.ensureDir();
      fs.writeFileSync(cachedPath, remoteContent, 'utf8');
      if (!params.manifest.has(fileName)) {
        if (reindexLocalLogs(params.logDir, params.manifest)) {
          params.saveManifest();
        }
      }
    } catch {
      /* safe-ignore */
    }

    return remoteContent;
  }

  async stop(): Promise<void> {
    if (this.pendingUploads.length > 0) {
      await Promise.allSettled(this.pendingUploads);
      this.pendingUploads.length = 0;
    }
  }
}
```

#### Task 2: Ủy Quyền Đồng Bộ Đám Mây Cho `src/server/logging/persistent_room_logger.ts`
**Target physical file**: `src/server/logging/persistent_room_logger.ts` (Sửa đổi)

```typescript
<<<<
import {
  reindexLocalLogs,
  parseLogEntries,
  mergeCloudManifest,
  resolveLogFileName,
  resolveLogDir,
} from './room_logger_reindexer.js';

function isStorageConfigured(storage?: ISupabaseStorageService): boolean {
  if (!storage) return false;
  return typeof storage.isConfigured === 'function'
    ? storage.isConfigured()
    : Boolean(storage.isConfigured);
}
====
import {
  reindexLocalLogs,
  parseLogEntries,
  resolveLogFileName,
  resolveLogDir,
} from './room_logger_reindexer.js';
import { RoomLoggerCloudSync } from './room_logger_cloud_sync.js';
>>>>
```

```typescript
<<<<
  public readonly pendingUploads: Promise<unknown>[] = [];
  public readonly supabaseStorage?: ISupabaseStorageService;
  private manifestSyncQueue: Promise<void> = Promise.resolve();
  private flushTimer?: NodeJS.Timeout;

  constructor(options?: PersistentRoomLoggerOptions) {
    this.logDir = resolveLogDir(options?.logDir);
    this.manifestFile = path.join(this.logDir, 'rooms_manifest.json');
    this.flushIntervalMs = options?.flushIntervalMs ?? (process.env['NODE_ENV'] === 'test' ? 0 : 500);
    this.supabaseStorage = options?.supabaseStorage ?? new SupabaseStorageService();
    this.ensureDir();
    this.loadManifest();
  }
====
  public readonly pendingUploads: Promise<unknown>[];
  public readonly supabaseStorage?: ISupabaseStorageService;
  private readonly cloudSync: RoomLoggerCloudSync;
  private flushTimer?: NodeJS.Timeout;

  constructor(options?: PersistentRoomLoggerOptions) {
    this.logDir = resolveLogDir(options?.logDir);
    this.manifestFile = path.join(this.logDir, 'rooms_manifest.json');
    this.flushIntervalMs = options?.flushIntervalMs ?? (process.env['NODE_ENV'] === 'test' ? 0 : 500);
    this.supabaseStorage = options?.supabaseStorage ?? new SupabaseStorageService();
    this.cloudSync = new RoomLoggerCloudSync(this.supabaseStorage);
    this.pendingUploads = this.cloudSync.pendingUploads;
    this.ensureDir();
    this.loadManifest();
  }
>>>>
```

```typescript
<<<<
  async stop(): Promise<void> {
    this.flushSync();
    if (this.pendingUploads.length > 0) {
      await Promise.allSettled(this.pendingUploads);
      this.pendingUploads.length = 0;
    }
  }
====
  async stop(): Promise<void> {
    this.flushSync();
    await this.cloudSync.stop();
  }
>>>>
```

```typescript
<<<<
  finishRoomLog(roomCode: string, summary?: RoomFinishSummary): void {
    this.flushSync();
    const norm = roomCode.trim().toUpperCase();
    const fileName = this.activeRoomFiles.get(norm) ?? resolveLogFileName(this.manifest, norm);
    if (!fileName) return;

    const fullPath = path.join(this.logDir, fileName);
    let size = 0;
    let events = 0;
    try {
      if (fs.existsSync(fullPath)) {
        size = fs.statSync(fullPath).size;
        const content = fs.readFileSync(fullPath, 'utf8');
        events = parseLogEntries(content).length;
      }
    } catch {
      /* safe-ignore */
    }

    const existing = this.manifest.get(fileName);
    if (existing) {
      const updated: AdminArchivedRoomSummary = {
        ...existing,
        endTime: summary?.endTime ?? Date.now(),
        winner: summary?.winner ?? existing.winner,
        status: summary?.status ?? 'TERMINATED',
        playerCount: summary?.playerCount ?? existing.playerCount,
        fileSizeBytes: size,
        totalEvents: events,
      };
      this.manifest.set(fileName, updated);
      this.saveManifest();
    }
    this.activeRoomFiles.delete(norm);

    if (isStorageConfigured(this.supabaseStorage)) {
      const bucket = this.supabaseStorage?.defaultBucket ?? 'game-logs';
      let logContent = '';
      try {
        if (fs.existsSync(fullPath)) {
          logContent = fs.readFileSync(fullPath, 'utf8');
        }
      } catch {
        /* safe-ignore */
      }

      // 1. Kick off .jsonl upload synchronously
      const jsonlUploadPromise = this.supabaseStorage!.uploadFile(bucket, fileName, logContent, 'application/x-ndjson');

      const syncTask = async () => {
        await jsonlUploadPromise;

        // 2. Download cloud manifest with status check
        let cloudData: string | null = null;
        let cloudStatus = 200;
        try {
          if (typeof this.supabaseStorage?.downloadFileWithStatus === 'function') {
            const res = await this.supabaseStorage.downloadFileWithStatus(bucket, '_manifest/rooms_manifest.json');
            cloudData = res.data;
            cloudStatus = res.status;
          } else {
            cloudData = await this.supabaseStorage!.downloadFile(bucket, '_manifest/rooms_manifest.json');
            cloudStatus = cloudData ? 200 : 404;
          }
        } catch {
          cloudStatus = 500;
        }

        // Fail-safe: Nếu gặp lỗi mạng / 5xx / timeout (không phải 404), KHÔNG ghi đè manifest
        if (cloudStatus !== 200 && cloudStatus !== 404) {
          return;
        }

        // Merge cloud manifest:
        if (cloudData && mergeCloudManifest(this.manifest, cloudData)) {
          this.saveManifest();
        }

        // 3. Upload merged master manifest
        const manifestList = this.getArchivedRoomsList();
        const manifestContent = JSON.stringify(manifestList, null, 2);
        await this.supabaseStorage!.uploadFile(bucket, '_manifest/rooms_manifest.json', manifestContent, 'application/json');
      };

      const chained = this.manifestSyncQueue.then(syncTask).catch(() => {});
      this.manifestSyncQueue = chained;
      this.pendingUploads.push(chained);
    }
  }
====
  finishRoomLog(roomCode: string, summary?: RoomFinishSummary): void {
    this.flushSync();
    const norm = roomCode.trim().toUpperCase();
    const fileName = this.activeRoomFiles.get(norm) ?? resolveLogFileName(this.manifest, norm);
    if (!fileName) return;

    this.cloudSync.finalizeRoomArchive({
      logDir: this.logDir,
      fileName,
      manifest: this.manifest,
      summary,
      saveManifest: () => this.saveManifest(),
      getArchivedRoomsList: () => this.getArchivedRoomsList(),
    });
    this.activeRoomFiles.delete(norm);
  }
>>>>
```

```typescript
<<<<
  async syncCloudManifest(): Promise<void> {
    if (!isStorageConfigured(this.supabaseStorage)) return;
    const bucket = this.supabaseStorage?.defaultBucket ?? 'game-logs';
    try {
      const raw = await this.supabaseStorage!.downloadFile(bucket, '_manifest/rooms_manifest.json');
      if (raw && mergeCloudManifest(this.manifest, raw)) {
        this.saveManifest();
      }
    } catch {
      /* safe-ignore */
    }
  }
====
  async syncCloudManifest(): Promise<void> {
    await this.cloudSync.syncCloudManifest(this.manifest, () => this.saveManifest());
  }
>>>>
```

```typescript
<<<<
  async getRoomFullLogAsync(roomCode: string, timestamp?: number): Promise<AdminRoomLogEntry[]> {
    this.flushSync();
    const norm = roomCode.trim().toUpperCase();
    let targetFile = resolveLogFileName(this.manifest, norm, timestamp);

    if (targetFile) {
      const fullPath = path.join(this.logDir, path.basename(targetFile));
      if (fs.existsSync(fullPath)) {
        return this.getRoomFullLog(norm, timestamp);
      }
    }

    if (!isStorageConfigured(this.supabaseStorage)) {
      return [];
    }

    let fileName = targetFile;
    if (!fileName) {
      if (timestamp !== undefined) {
        fileName = `${norm}_${timestamp}.jsonl`;
      } else {
        fileName = `${norm}.jsonl`;
      }
    }

    const bucket = this.supabaseStorage?.defaultBucket ?? 'game-logs';
    const remoteContent = await this.supabaseStorage!.downloadFile(bucket, fileName);
    if (!remoteContent) {
      return [];
    }

    const cachedPath = path.join(this.logDir, fileName);
    try {
      this.ensureDir();
      fs.writeFileSync(cachedPath, remoteContent, 'utf8');
      if (!this.manifest.has(fileName)) {
        if (reindexLocalLogs(this.logDir, this.manifest)) {
          this.saveManifest();
        }
      }
    } catch {
      /* safe-ignore */
    }

    return parseLogEntries(remoteContent);
  }
====
  async getRoomFullLogAsync(roomCode: string, timestamp?: number): Promise<AdminRoomLogEntry[]> {
    this.flushSync();
    const norm = roomCode.trim().toUpperCase();
    const targetFile = resolveLogFileName(this.manifest, norm, timestamp);

    if (targetFile) {
      const fullPath = path.join(this.logDir, path.basename(targetFile));
      if (fs.existsSync(fullPath)) {
        return this.getRoomFullLog(norm, timestamp);
      }
    }

    const remoteContent = await this.cloudSync.fetchRemoteLog({
      roomCode: norm,
      timestamp,
      logDir: this.logDir,
      manifest: this.manifest,
      ensureDir: () => this.ensureDir(),
      saveManifest: () => this.saveManifest(),
    });

    return remoteContent ? parseLogEntries(remoteContent) : [];
  }
>>>>
```

---
### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
* **Trạm 3.1 (Spec & Scope Gatekeeper)**: Rà soát 100% độ trung thực của Plan, không phát sinh file ngoài phân hệ `server-network`, bảo đảm Zero Scope Creep.
* **Trạm 3.2 (Architecture & Anti-Slop Auditor)**: Rà soát Anti-Slop, an toàn luồng upload bất đồng bộ, assertion density trong dải vàng 1-4 asserts/test, không vòng lặp trong `it()`, và kiểm tra delegate reference identity của `pendingUploads`.

---
### Trạm 4: Kiểm Thử Biến Dị & Cơ Chế Biên (Chaos & Mutation Sentinel)
Lệnh kích hoạt kiểm thử đột biến:
```bash
npm run sentinel -- --ticket IMP-300 --test tests/server/room_logger_cloud_sync.test.ts --src src/server/logging/room_logger_cloud_sync.ts
```
* **Mục tiêu**: Vượt qua tối thiểu 10 mutants bị tiêu diệt (kill rate: 100%, 0 survived).
* **Đối tượng đột biến trọng yếu**:
  - Đột biến kiểm tra cấu hình storage `!storage` -> `false`.
  - Đột biến fail-safe status check `cloudStatus !== 200 && cloudStatus !== 404` -> `||`.
  - Đột biến `pendingUploads.length = 0` sau khi `stop()`.

---
### Trạm 5: Kiểm Toán Bằng Chứng Vật Lý Toàn Diện (Evidence Audit & Reporting)
* **Lệnh xác thực vật lý**: `node scripts/check_evidence.mjs IMP-300`
* **Lệnh xuất bản báo cáo**: `npm run report -- IMP-300`
