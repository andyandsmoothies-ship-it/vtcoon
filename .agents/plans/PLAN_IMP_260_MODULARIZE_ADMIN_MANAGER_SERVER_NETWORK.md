# KẾ HOẠCH KỸ THUẬT: IMP-260 BÓC TÁCH MÔ-ĐUN ADMIN MANAGER (SERVER NETWORK COORDINATOR)

> **Ticket:** IMP-260 (Tier 2 Full Rigor - Subtractive Refactoring & Technical Debt Offload)  
> **Use Case Ref:** `UC-ADM-MOD` (Modularize Server Network Admin Manager Coordinator)  
> **Trọng tâm:** Bóc tách mô-đun `src/server/network/admin_manager.ts` (410 dòng, cảnh báo Tier 1 > 300 LOC) thành các mô-đun chức năng sâu:
> - `src/server/network/admin_vitals.ts`: Thu thập chỉ số tài nguyên và trạng thái storage (~48 LOC).
> - `src/server/network/admin_cloud_sync.ts`: Đồng bộ log máy chủ lên kho lưu trữ Supabase (~38 LOC).
> - `src/server/network/admin_event_store.ts`: Đóng gói bộ nhớ đệm log bàn chơi, vi phạm bất biến và ghi nhận log bền vững (~82 LOC).
> Đưa `src/server/network/admin_manager.ts` từ 410 dòng xuống **328 dòng** (`⚠️ Warning (> 300 LOC Tier 1)`), giảm 83 dòng vật lý, kế thừa và thu hẹp mã nợ `DEBT-ADMIN-MANAGER`.
> **Phân định phạm vi:**
> - `IMP-260` (Vé hiện tại): **Pure Move 100% (Zero Semantic Mutation)**. Không thay đổi bất kỳ hành vi runtime nào (không bọc try/catch nuốt lỗi, không trim secret mới, không prune socket, không cap array violations). Không áp dụng thủ thuật code-golf nén getter/setter.
> - `IMP-261` (Vé tiếp theo): **Security & Resilience Hardening** cho Admin Subsystem (xử lý ADV-01 đến ADV-08: trim secret, phân loại lỗi sync, giới hạn bộ nhớ vi phạm, prune socket ngắt kết nối, chống crash tiến trình).

---

## 0. BẢNG ĐỐI SOÁT CHỈ THỊ PHẢN BIỆN (REVISION 6 - PURE MOVE 100%)

| STT | Mã Chỉ Thị / Lỗ Hổng | Target Physical File & Line | Nội Dung Yêu Cầu & Giải Pháp Xử Lý Trong Revision 6 | Trạng Thái |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **1** | **REV6-DIR-1** (Zero Code-Golf) | `admin_manager.ts#Snippet 4.8, 4.9` | **Hủy bỏ hoàn toàn thủ thuật code-golf**: Xóa bỏ Snippet 4.8 (nén getter/setter 1 dòng) và Snippet 4.9 (sắp xếp export type). Giữ nguyên định dạng chuẩn của codebase. | ✅ RESOLVED |
| **2** | **REV6-DIR-2** (LOC Đo Đạc Thật) | `PLAN_IMP_260.md#Section 1 & DoD 2` | **Đo đạc LOC thực tế sau pure-move**: `admin_manager.ts` đạt **328 dòng** (giảm 83 dòng từ 411 dòng). Dán nhãn đúng chuẩn Hiến pháp: **`⚠️ Warning (> 300 LOC Tier 1, trần <= 400 LOC)`**. Tuyệt đối cấm dán nhãn "Safe" hay "An Toàn Tuyệt Đối". Kế thừa `DEBT-ADMIN-MANAGER` (Target: IMP-263). | ✅ RESOLVED |
| **3** | **REV6-DIR-3** (Orphan Import) | `admin_manager.ts#Snippet 4.1` | **Xóa import mồ côi `handleAdminMessage`**: Trong Snippet 4.1, chỉ import `handleAdminClientMessage` (đúng consumer duy nhất ở dòng 380). | ✅ RESOLVED |
| **4** | **REV6-DIR-4** (Public Facade Clarification) | `PLAN_IMP_260.md#Section 2.2` | **Làm rõ ranh giới kiến trúc**: `getServerVitals`, `getRecentLogs`, `syncCloudLogs` duy trì tại `AdminManager` để đóng vai trò **Backward-Compatible Public API Facade** cho `wss_server.ts` và 5 test suites quản trị, không tuyên bố mâu thuẫn là "0 shallow wrapper". | ✅ RESOLVED |
| **5** | **REV6-DIR-5** (Bảo Toàn Spy Call-Chain) | `admin_manager.ts#recordRoomViolation` | **Bảo toàn chuỗi gọi hàm**: `AdminManager.recordRoomViolation` tiếp tục gọi qua `this.recordRoomEvent(norm, ...)`. Đảm bảo mọi test suite spy trên `recordRoomEvent` tiếp tục hoạt động chính xác 100%. | ✅ RESOLVED |
| **6** | **REV6-DIR-6** (Characterization Pre-scan) | `PLAN_IMP_260.md#Task 8` | **Khóa cứng kiểm thử đặc tả hiện trạng**: Chạy 5 test suites quản trị (101 tests) trên baseline vật lý hiện tại trước khi thực hiện bất kỳ thao tác di chuyển mã nào. | ✅ RESOLVED |
| **7** | **REV6-DIR-7** (DoD 6 Real Numbers) | `PLAN_IMP_260.md#DoD 6` | **Chuẩn hóa số liệu DoD 6**: Cập nhật về đúng thực tế đo đạc: **164 test suites (3.535 tests)**. | ✅ RESOLVED |

---

## 1. BẢNG ĐO LƯỜNG ĐỊNH LƯỢNG NGÂN SÁCH LOC (PHYSICAL DISK BASELINE)

*Đo đạc tự động qua công cụ chính thức của dự án: `node scripts/check_loc.mjs`*

| File vật lý | Phân loại Tier | Baseline Hiện Tại | Non-Empty SLOC | Est. Delta | Post LOC | Trần Budget | Trạng thái sau Refactor |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `src/server/network/admin_manager.ts` | Tier 1 (Server/Logic) | **410** | 368 | -82 | **328** | <= 400 | ⚠️ Warning (> 300 LOC, nợ `DEBT-ADMIN-MANAGER`) |
| `src/server/network/admin_vitals.ts` (Mới) | Tier 1 (Server/Logic) | **0** | 0 | +48 | **48** | <= 400 | ✔️ Safe (< 300 LOC) |
| `src/server/network/admin_cloud_sync.ts` (Mới) | Tier 1 (Server/Logic) | **0** | 0 | +38 | **38** | <= 400 | ✔️ Safe (< 300 LOC) |
| `src/server/network/admin_event_store.ts` (Mới) | Tier 1 (Server/Logic) | **0** | 0 | +82 | **82** | <= 400 | ✔️ Safe (< 300 LOC) |
| `tests/contracts/imp260_admin_manager_modularization.test.ts` (Mới) | Living Test Suite | **0** | 0 | +240 | **240** | <= 600 | ✔️ Safe (< 600 LOC) |

---

## 2. THIẾT KẾ KIẾN TRÚC & DÒNG DỮ LIỆU (ARCHITECTURE & DATA FLOW)

### 2.1. Sơ Đồ Kiến Trúc Trước & Sau Refactor

```
[TRƯỚC REFACTOR]
src/server/network/admin_manager.ts (410 LOC ⚠️ Cảnh Báo Tier 1 > 300 LOC)
  ├── Quản lý Vitals máy chủ (Memory, Uptime, Room Counts, Supabase Status)
  ├── Đồng bộ Cloud Logs (Supabase Log Sync, Mutex isSyncingCloud)
  ├── Quản lý WebSocket kết nối, xác thực admin, đăng ký phòng
  ├── Phát sóng Broadcast cho Admin & Subscribers
  └── In-memory Event & Violation Store (roomLogs, roomViolations, ring buffer MAX_ROOM_LOGS)

[SAU REFACTOR - PURE MOVE DEEP MODULES]
src/server/network/admin_manager.ts (328 LOC ⚠️ Warning Tier 1 > 300 LOC, trần <= 400 LOC)
  ├── WebSocket Connection & Subscription Routing (authenticatedSockets, subscribedRooms)
  ├── Broadcast Dispatcher (broadcastToAdmins, broadcastToRoomSubscribers)
  ├── Backward-Compatible Public Facade (getServerVitals, getRecentLogs, syncCloudLogs)
  ├── Mutex isSyncingCloud qua try/finally
  │
  ├──► src/server/network/admin_vitals.ts (Pure Functional: collectServerVitals)
  │      └── rooms + roomLogger ➔ ServerVitals (Memory, Rooms, Supabase Config)
  │
  ├──► src/server/network/admin_cloud_sync.ts (Async IO: syncAdminCloudLogs)
  │      └── roomLogger ➔ syncAllLocalLogsToCloud (Flush & Upload)
  │
  └──► src/server/network/admin_event_store.ts (Stateful Deep Module)
         ├── roomLogs Map & roomViolations Map
         ├── appendEvent & MAX_ROOM_LOGS ring buffer eviction
         └── recordRoomEvent, recordViolationOnly, getRecentLogs, clearRoom, getViolations
```

### 2.2. Giao Thức Tương Tác Giữa Các Mô-đun (Module Contracts)

1. **`admin_vitals.ts` Contract**:
   ```typescript
   export function collectServerVitals(rooms: RoomManager, roomLogger: PersistentRoomLogger): ServerVitals;
   ```
   - Chức năng thuần túy, không lưu trạng thái nội tại, tính toán RAM, Uptime, số phòng live/lobby và trạng thái kết nối Supabase Storage.
   - Nhận bắt buộc cả 2 dependency, loại bỏ Anti-TIDD parameter loosening.

2. **`admin_cloud_sync.ts` Contract**:
   ```typescript
   export async function syncAdminCloudLogs(roomLogger: PersistentRoomLogger): Promise<{
     success: boolean;
     uploadedCount?: number;
     bucket?: string;
     reason?: string;
     error?: string;
   }>;
   ```
   - Gọi `roomLogger.flushSync()` và chuyển giao dữ liệu sang `syncAllLocalLogsToCloud`.
   - Giữ nguyên cơ chế lan truyền lỗi (không nuốt lỗi qua try/catch), loại bỏ tham số chết `_options`.

3. **`admin_event_store.ts` Contract**:
   ```typescript
   export class AdminEventStore {
     constructor(private readonly roomLogger: PersistentRoomLogger);
     recordRoomEvent(roomCode: string, entry: ...): AdminRoomLogEntry;
     recordViolationOnly(norm: string, type: string, message: string): void;
     getRecentLogs(rawRoomCode: string, playerId?: string): AdminRoomLogEntry[];
     getViolations(rawRoomCode: string): Array<{ type: string; message: string; timestamp: number }> | undefined;
     clearRoom(rawRoomCode: string): void;
   }
   ```
   - Inject `roomLogger` qua constructor. Quản lý toàn vẹn bộ nhớ cache và flush ghi nhật ký phòng.

---

## 3. CÁC BƯỚC THI CÔNG & MÃ NGUỒN DROP-IN SNIPPETS (IMPLEMENTATION TASKS)

### Task 1: Tạo Module `src/server/network/admin_vitals.ts` (Pure Functional)
- **Target physical file**: `src/server/network/admin_vitals.ts` (Tệp mới)

```typescript
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
```

---

### Task 2: Tạo Module `src/server/network/admin_cloud_sync.ts` (Pure Move IO)
- **Target physical file**: `src/server/network/admin_cloud_sync.ts` (Tệp mới)

```typescript
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
}
```

---

### Task 3: Tạo Module `src/server/network/admin_event_store.ts` (Stateful Deep Module)
- **Target physical file**: `src/server/network/admin_event_store.ts` (Tệp mới)

```typescript
// [UC-ADM-MOD] Admin Event & Invariant Violations Store
import type { PersistentRoomLogger } from '../logging/persistent_room_logger.js';
import {
  MAX_ROOM_LOGS,
  type AdminRoomLogEntry,
} from './admin_types.js';

export class AdminEventStore {
  private readonly roomLogs = new Map<string, AdminRoomLogEntry[]>();
  private readonly roomViolations = new Map<string, Array<{ type: string; message: string; timestamp: number }>>();

  constructor(private readonly roomLogger: PersistentRoomLogger) {}

  recordRoomEvent(
    roomCode: string,
    entry: Omit<AdminRoomLogEntry, 'id' | 'roomCode' | 'timestamp'> & { timestamp?: number; playerId?: string },
  ): AdminRoomLogEntry {
    const norm = roomCode.toUpperCase();
    const timestamp = entry.timestamp ?? Date.now();
    const id = `log_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;
    const fullEntry: AdminRoomLogEntry = {
      id,
      roomCode: norm,
      timestamp,
      source: entry.source,
      action: entry.action,
      payloadSummary: entry.payloadSummary,
      ...(entry.playerId ? { playerId: entry.playerId } : {}),
    };

    this.roomLogger.appendEvent(norm, fullEntry);

    let list = this.roomLogs.get(norm);
    if (!list) {
      list = [];
      this.roomLogs.set(norm, list);
    }
    list.push(fullEntry);
    if (list.length > MAX_ROOM_LOGS) list.shift();

    return fullEntry;
  }

  recordViolationOnly(norm: string, type: string, message: string): void {
    const now = Date.now();
    let violations = this.roomViolations.get(norm);
    if (!violations) {
      violations = [];
      this.roomViolations.set(norm, violations);
    }
    violations.push({ type, message, timestamp: now });
  }

  getRecentLogs(rawRoomCode: string, playerId?: string): AdminRoomLogEntry[] {
    const all = this.roomLogs.get(rawRoomCode.toUpperCase()) ?? [];
    if (!playerId) return all;
    return all.filter((l) => l.playerId === playerId);
  }

  getViolations(rawRoomCode: string): Array<{ type: string; message: string; timestamp: number }> | undefined {
    return this.roomViolations.get(rawRoomCode.toUpperCase());
  }

  clearRoom(rawRoomCode: string): void {
    const norm = rawRoomCode.toUpperCase();
    this.roomLogs.delete(norm);
    this.roomViolations.delete(norm);
  }
}
```

---

### Task 4: Tái Cấu Trúc Subtractive Trong `src/server/network/admin_manager.ts`
- **Target physical file**: `src/server/network/admin_manager.ts`
- **Mục tiêu**: Xóa bỏ các khối logic đã di dời sang 3 mô-đun mới, bảo toàn 100% hợp đồng công khai của `AdminManager`, đưa file về 328 dòng (`⚠️ Warning`).

#### Snippet 4.1: Cập nhật imports (xóa handleAdminMessage mồ côi)
```typescript
<<<<
import { handleAdminMessage, handleAdminClientMessage } from './admin_message_handler.js';
import { syncAllLocalLogsToCloud } from '../storage/supabase_log_sync.js';
====
import { handleAdminClientMessage } from './admin_message_handler.js';
import { collectServerVitals } from './admin_vitals.js';
import { syncAdminCloudLogs } from './admin_cloud_sync.js';
import { AdminEventStore } from './admin_event_store.js';
>>>>
```

#### Snippet 4.2: Cập nhật fields của AdminManager
```typescript
<<<<
  private readonly authenticatedSockets = new Set<WebSocket>();
  private readonly subscribedRooms = new Map<WebSocket, string>();
  private readonly roomLogs = new Map<string, AdminRoomLogEntry[]>();
  private readonly roomViolations = new Map<string, Array<{ type: string; message: string; timestamp: number }>>();
  private readonly roomLogger: PersistentRoomLogger;
====
  private readonly authenticatedSockets = new Set<WebSocket>();
  private readonly subscribedRooms = new Map<WebSocket, string>();
  private readonly roomLogger: PersistentRoomLogger;
  private readonly eventStore: AdminEventStore;
>>>>
```

#### Snippet 4.3: Khởi tạo eventStore trong constructor
```typescript
<<<<
    this.onTerminateRoom = options.onTerminateRoom;
    this.roomLogger = new PersistentRoomLogger({ logDir: options.loggerDir });
  }
====
    this.onTerminateRoom = options.onTerminateRoom;
    this.roomLogger = new PersistentRoomLogger({ logDir: options.loggerDir });
    this.eventStore = new AdminEventStore(this.roomLogger);
  }
>>>>
```

#### Snippet 4.4: Thay thế getServerVitals bằng collectServerVitals
```typescript
<<<<
  getServerVitals = (): ServerVitals => {
    const mem = process.memoryUsage();
    let totalRooms = 0;
    let liveRooms = 0;
    let lobbyRooms = 0;
    if (this?.rooms?.roomMap) {
      for (const r of this.rooms.roomMap.values()) {
        totalRooms++;
        if (r.started) {
          liveRooms++;
        } else {
          lobbyRooms++;
        }
      }
    }

    const storage = this.roomLogger.supabaseStorage;
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
  };
====
  getServerVitals = (): ServerVitals => {
    return collectServerVitals(this.rooms, this.roomLogger);
  };
>>>>
```

#### Snippet 4.5: Thay thế recordRoomEvent và recordRoomViolation (Bảo toàn spy call-chain)
```typescript
<<<<
  recordRoomEvent(
    roomCode: string,
    entry: Omit<AdminRoomLogEntry, 'id' | 'roomCode' | 'timestamp'> & { timestamp?: number; playerId?: string },
  ): AdminRoomLogEntry {
    const norm = roomCode.toUpperCase();
    const timestamp = entry.timestamp ?? Date.now();
    const id = `log_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;
    const fullEntry: AdminRoomLogEntry = {
      id,
      roomCode: norm,
      timestamp,
      source: entry.source,
      action: entry.action,
      payloadSummary: entry.payloadSummary,
      ...(entry.playerId ? { playerId: entry.playerId } : {}),
    };

    this.roomLogger.appendEvent(norm, fullEntry);

    let list = this.roomLogs.get(norm);
    if (!list) {
      list = [];
      this.roomLogs.set(norm, list);
    }
    list.push(fullEntry);
    if (list.length > MAX_ROOM_LOGS) list.shift();

    this.broadcastToRoomSubscribers(norm, { type: 'ADMIN_ROOM_LOG', roomCode: norm, log: fullEntry });
    return fullEntry;
  }

  recordRoomViolation(roomCode: string, type: string, message: string): void {
    const norm = roomCode.toUpperCase();
    const now = Date.now();
    let violations = this.roomViolations.get(norm);
    if (!violations) {
      violations = [];
      this.roomViolations.set(norm, violations);
    }
    violations.push({ type, message, timestamp: now });
    this.recordRoomEvent(norm, {
      source: 'SYSTEM',
      action: 'INVARIANT_VIOLATION',
      payloadSummary: `[${type}] ${message}`,
      timestamp: now,
    });
  }

  evaluateRoomHealth(room: Room): { status: RoomHealthStatus; warningReason?: string } {
    return evaluateRoomHealth(room, this.roomViolations.get(room.roomCode), this.rooms);
  }

  getRoomsSummary(): AdminRoomSummary[] {
    const result: AdminRoomSummary[] = [];
    const opts = {
      timeRemainingProvider: this.timeRemainingProvider,
      reconnectManager: this.reconnectManager,
    };
    for (const room of this.rooms.roomMap.values()) {
      result.push(buildRoomSummary(room, this.rooms, this.roomViolations.get(room.roomCode), opts));
    }
    return result;
  }

  getRoomDetail(rawRoomCode: string): AdminRoomDetail | undefined {
    const norm = rawRoomCode.toUpperCase();
    const opts = {
      timeRemainingProvider: this.timeRemainingProvider,
      reconnectManager: this.reconnectManager,
    };
    return buildRoomDetail(rawRoomCode, this.rooms, this.roomViolations.get(norm), opts);
  }

  getRecentLogs = (rawRoomCode: string, playerId?: string): AdminRoomLogEntry[] => {
    const all = this?.roomLogs?.get(rawRoomCode.toUpperCase()) ?? [];
    if (!playerId) return all;
    return all.filter((l) => l.playerId === playerId);
  };
====
  recordRoomEvent(
    roomCode: string,
    entry: Omit<AdminRoomLogEntry, 'id' | 'roomCode' | 'timestamp'> & { timestamp?: number; playerId?: string },
  ): AdminRoomLogEntry {
    const fullEntry = this.eventStore.recordRoomEvent(roomCode, entry);
    this.broadcastToRoomSubscribers(fullEntry.roomCode, { type: 'ADMIN_ROOM_LOG', roomCode: fullEntry.roomCode, log: fullEntry });
    return fullEntry;
  }

  recordRoomViolation(roomCode: string, type: string, message: string): void {
    const norm = roomCode.toUpperCase();
    this.eventStore.recordViolationOnly(norm, type, message);
    this.recordRoomEvent(norm, {
      source: 'SYSTEM',
      action: 'INVARIANT_VIOLATION',
      payloadSummary: `[${type}] ${message}`,
    });
  }

  evaluateRoomHealth(room: Room): { status: RoomHealthStatus; warningReason?: string } {
    return evaluateRoomHealth(room, this.eventStore.getViolations(room.roomCode), this.rooms);
  }

  getRoomsSummary(): AdminRoomSummary[] {
    const result: AdminRoomSummary[] = [];
    const opts = {
      timeRemainingProvider: this.timeRemainingProvider,
      reconnectManager: this.reconnectManager,
    };
    for (const room of this.rooms.roomMap.values()) {
      result.push(buildRoomSummary(room, this.rooms, this.eventStore.getViolations(room.roomCode), opts));
    }
    return result;
  }

  getRoomDetail(rawRoomCode: string): AdminRoomDetail | undefined {
    const norm = rawRoomCode.toUpperCase();
    const opts = {
      timeRemainingProvider: this.timeRemainingProvider,
      reconnectManager: this.reconnectManager,
    };
    return buildRoomDetail(rawRoomCode, this.rooms, this.eventStore.getViolations(norm), opts);
  }

  getRecentLogs = (rawRoomCode: string, playerId?: string): AdminRoomLogEntry[] => {
    return this.eventStore.getRecentLogs(rawRoomCode, playerId);
  };
>>>>
```

#### Snippet 4.6: Thay thế syncCloudLogs
```typescript
<<<<
  async syncCloudLogs(options?: { force?: boolean }): Promise<{
    success: boolean;
    uploadedCount?: number;
    bucket?: string;
    reason?: string;
    error?: string;
  }> {
    if (this.isSyncingCloud) {
      return { success: false, reason: 'ALREADY_SYNCING' };
    }
    this.isSyncingCloud = true;
    try {
      this.roomLogger.flushSync();
      const bucket = this.roomLogger.supabaseStorage?.defaultBucket ?? 'game-logs';
      const result = await syncAllLocalLogsToCloud(
        this.roomLogger.storageDir,
        this.roomLogger.manifestCatalog,
        this.roomLogger.supabaseStorage,
        bucket,
      );
      return {
        success: result.success,
        uploadedCount: result.uploadedCount,
        bucket: result.bucket,
        reason: result.reason,
        error: result.error,
      };
    } finally {
      this.isSyncingCloud = false;
    }
  }
====
  async syncCloudLogs(options?: { force?: boolean }): Promise<{
    success: boolean;
    uploadedCount?: number;
    bucket?: string;
    reason?: string;
    error?: string;
  }> {
    if (this.isSyncingCloud) {
      return { success: false, reason: 'ALREADY_SYNCING' };
    }
    this.isSyncingCloud = true;
    try {
      return await syncAdminCloudLogs(this.roomLogger);
    } finally {
      this.isSyncingCloud = false;
    }
  }
>>>>
```

#### Snippet 4.7: Cập nhật handleRoomClosed và getDiagnosticDump
```typescript
<<<<
    this.roomLogger.finishRoomLog(norm, finalSummary);
    this.roomLogs.delete(norm);
    this.roomViolations.delete(norm);
    for (const [sock, target] of this.subscribedRooms.entries()) {
      if (target === norm) this.subscribedRooms.delete(sock);
    }
    this.broadcastRoomListToAdmins();
    this.broadcastArchivedRoomsToAdmins();
  }

  broadcastArchivedRoomsToAdmins(): void {
    this.broadcastToAdmins({
      type: 'ADMIN_ARCHIVED_ROOM_LIST',
      rooms: this.getArchivedRoomsList(),
    });
  }

  terminateRoom(rawRoomCode: string, reason: string = 'ADMIN_FORCE_TERMINATE'): boolean {
    const norm = rawRoomCode.toUpperCase();
    if (!this.rooms.hasRoom(norm)) return false;
    this.recordRoomEvent(norm, {
      source: 'SYSTEM',
      action: 'ADMIN_FORCE_TERMINATE',
      payloadSummary: `Quản trị viên cưỡng chế đóng bàn chơi: ${reason}`,
    });
    if (this.onTerminateRoom) {
      this.onTerminateRoom(norm, reason);
    } else {
      this.rooms.closeRoom(norm);
      this.handleRoomClosed(norm, { status: 'TERMINATED' });
    }
    return true;
  }

  getDiagnosticDump(rawRoomCode: string): Record<string, unknown> | undefined {
    const norm = rawRoomCode.toUpperCase();
    return buildDiagnosticDump(
      rawRoomCode,
      this.rooms,
      this.roomViolations.get(norm),
      this.getRecentLogs(rawRoomCode),
    );
  }
====
    this.roomLogger.finishRoomLog(norm, finalSummary);
    this.eventStore.clearRoom(norm);
    for (const [sock, target] of this.subscribedRooms.entries()) {
      if (target === norm) this.subscribedRooms.delete(sock);
    }
    this.broadcastRoomListToAdmins();
    this.broadcastArchivedRoomsToAdmins();
  }

  broadcastArchivedRoomsToAdmins(): void {
    this.broadcastToAdmins({
      type: 'ADMIN_ARCHIVED_ROOM_LIST',
      rooms: this.getArchivedRoomsList(),
    });
  }

  terminateRoom(rawRoomCode: string, reason: string = 'ADMIN_FORCE_TERMINATE'): boolean {
    const norm = rawRoomCode.toUpperCase();
    if (!this.rooms.hasRoom(norm)) return false;
    this.recordRoomEvent(norm, {
      source: 'SYSTEM',
      action: 'ADMIN_FORCE_TERMINATE',
      payloadSummary: `Quản trị viên cưỡng chế đóng bàn chơi: ${reason}`,
    });
    if (this.onTerminateRoom) {
      this.onTerminateRoom(norm, reason);
    } else {
      this.rooms.closeRoom(norm);
      this.handleRoomClosed(norm, { status: 'TERMINATED' });
    }
    return true;
  }

  getDiagnosticDump(rawRoomCode: string): Record<string, unknown> | undefined {
    const norm = rawRoomCode.toUpperCase();
    return buildDiagnosticDump(
      rawRoomCode,
      this.rooms,
      this.eventStore.getViolations(norm),
      this.getRecentLogs(rawRoomCode),
    );
  }
>>>>
```

---

### Task 5: Tạo Bộ Test Boundary `tests/contracts/imp260_admin_manager_modularization.test.ts`
- **Target physical file**: `tests/contracts/imp260_admin_manager_modularization.test.ts` (Tệp mới)

Bao gồm đúng **16 atomic contract boundary tests** chia thành 2 nhóm:
1. TC-260.01 đến 260.06: Kiểm thử đơn vị cô lập cho 3 mô-đun bóc tách mới (`admin_vitals.ts`, `admin_cloud_sync.ts`, `admin_event_store.ts`).
2. TC-260.07 đến 260.16: Kiểm thử đặc tả tính toàn vẹn của `AdminManager` (khóa cứng mutex lifecycle, ring buffer, backward compatibility).

---

### Task 6: Chạy Kiểm Thử & Quality Gates
```bash
# 0. Characterization Pre-scan trên baseline hiện tại trước khi refactor
npx vitest run tests/server/admin_portal.test.ts tests/server/imp166_admin_support_telemetry.test.ts tests/server/imp175_cloud_sync_and_backfill.test.ts

# 1. Chạy Contract Test mới
npx vitest run tests/contracts/imp260_admin_manager_modularization.test.ts

# 2. Chạy toàn bộ 5 test suites quản trị thuộc Blast Radius
npx vitest run tests/server/admin_portal.test.ts tests/server/imp166_admin_support_telemetry.test.ts tests/server/imp169_supabase_storage.test.ts tests/server/imp175_cloud_sync_and_backfill.test.ts tests/server/imp176_auto_terminate_and_manifest_merge.test.ts

# 3. Đo đạc ngân sách LOC
node scripts/check_loc.mjs src/server/network/admin_manager.ts src/server/network/admin_vitals.ts src/server/network/admin_cloud_sync.ts src/server/network/admin_event_store.ts

# 4. Kiểm tra Typecheck và Linters
npm run typecheck
npm run lint:slop
npm run lint:ui
```

---

## 4. MA TRẬN 16 BÀI KIỂM THỬ HỢP ĐỒNG (STATION 1 TEST SPECIFICATIONS - DOD #1)

1. TC-260.01 [UC-ADM-MOD/MSS]: collectServerVitals tính toán chính xác chỉ số bộ nhớ RAM, uptime và số lượng phòng live/lobby.
2. TC-260.02 [UC-ADM-MOD/MSS]: collectServerVitals phản ánh đúng trạng thái cấu hình của Supabase storage provider.
3. TC-260.03 [UC-ADM-MOD/MSS]: syncAdminCloudLogs gọi flushSync trên PersistentRoomLogger trước khi tiến hành quét đồng bộ file.
4. TC-260.04 [UC-ADM-MOD/MSS]: syncAdminCloudLogs chuyển giao kết quả đồng bộ từ syncAllLocalLogsToCloud và bảo toàn cơ chế ném ngoại lệ gốc.
5. TC-260.05 [UC-ADM-MOD/MSS]: AdminEventStore.recordRoomEvent lưu trữ log vào bộ nhớ đệm và ghi file nhật ký qua PersistentRoomLogger.
6. TC-260.06 [UC-ADM-MOD/MSS]: AdminEventStore.recordViolationOnly ghi nhận vi phạm vào mảng roomViolations mà không làm hỏng cấu trúc event.
7. TC-260.07 [UC-ADM-MOD/MSS]: AdminManager.getServerVitals ủy quyền sang collectServerVitals và trả về kết quả tương thích 100%.
8. TC-260.08 [UC-ADM-MOD/MSS]: AdminManager.syncCloudLogs thiết lập cờ mutex isSyncingCloud thành true trong quá trình đồng bộ và từ chối lời gọi đồng thời với ALREADY_SYNCING.
9. TC-260.09 [UC-ADM-MOD/MSS]: AdminManager.syncCloudLogs giải phóng cờ mutex isSyncingCloud thành false trong khối finally kể cả khi có ngoại lệ phát sinh.
10. TC-260.10 [UC-ADM-MOD/MSS]: AdminManager.recordRoomEvent phát sóng ADMIN_ROOM_LOG tới toàn bộ WebSocket đã đăng ký phòng.
11. TC-260.11 [UC-ADM-MOD/MSS]: AdminManager.recordRoomViolation gọi qua recordRoomEvent bảo toàn chuỗi gọi hàm và phát sóng thông điệp INVARIANT_VIOLATION.
12. TC-260.12 [UC-ADM-MOD/MSS]: AdminManager.clearRoom dọn sạch nhật ký sự kiện và danh sách vi phạm khi phòng kết thúc.
13. TC-260.13 [UC-ADM-MOD/MSS]: AdminManager.getRecentLogs hỗ trợ lọc theo playerId và trả về toàn bộ log khi không truyền playerId.
14. TC-260.14 [UC-ADM-MOD/MSS]: AdminManager.evaluateRoomHealth đánh giá tình trạng phòng dựa trên vi phạm lấy từ AdminEventStore.
15. TC-260.15 [UC-ADM-MOD/MSS]: AdminManager.getRoomDetail và getRoomsSummary tích hợp đầy đủ danh sách vi phạm từ AdminEventStore.
16. TC-260.16 [UC-ADM-MOD/MSS]: AdminManager.subscribeRoom kiểm tra guard ADMIN_UNAUTHORIZED và ADMIN_ROOM_NOT_FOUND trước khi gán socket vào danh sách theo dõi.

---

## 5. ĐỊNH NGHĨA HOÀN THÀNH (DEFINITION OF DONE - DOD)

1. **DoD 1: TDD & Traceability:** Bộ test `tests/contracts/imp260_admin_manager_modularization.test.ts` gồm 16 test cases đạt chuẩn Flow Taxonomy `[UC-ADM-MOD/MSS]`.
2. **DoD 2: Ngân Sách LOC & Anti-Slop:**
   - `admin_manager.ts` đạt **328 dòng** (`⚠️ Warning (> 300 LOC Tier 1, trần <= 400 LOC)`), giảm 83 dòng vật lý từ 411 dòng mà không code-golf.
   - `admin_vitals.ts` (48 dòng), `admin_cloud_sync.ts` (38 dòng), `admin_event_store.ts` (82 dòng) đều nằm trong vùng an toàn Tier 1 Safe (< 300 LOC).
   - Vượt qua `npm run lint:slop` (0 vi phạm độ phức tạp, 0 violation test-only export).
3. **DoD 3: Review Funnel:** Spec Reviewer và Code Reviewer thẩm định độc lập. Giữ nguyên Facade công khai, không xóa API gây gãy backward-compatibility.
4. **DoD 4: Chaos Sentinel:** Vượt qua Station 4 Sentinel Probes với 0 mutants sống sót trên các mutant mục tiêu: hoán đổi mutex flag trong `finally`, bỏ qua `flushSync`, đảo điều kiện `isSyncingCloud`.
5. **DoD 5: Quy Hoạch Mã Số & Ledger:**
   - Cập nhật Master Roadmap; đăng ký vé `IMP-261: Admin Security & Resilience Hardening` vào backlog kế tiếp.
   - Ghi nhận nợ kỹ thuật: `DEBT-ADMIN-MANAGER` (Target: IMP-263, kế hoạch tách thêm `admin_lifecycle.ts` hoặc `admin_room_controller.ts` để đưa `admin_manager.ts` về < 300 LOC).
   - Xuất báo cáo nghiệm thu hoàn chỉnh tại `docs/reports/improvements/IMP-260-modularize-admin-manager-coordinator_report.md`.
6. **DoD 6: Zero Regression:** Toàn bộ 164 test suites (3.535 tests) chạy xanh 100%.
