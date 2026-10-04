# KẾ HOẠCH KỸ THUẬT: IMP-261 BẢO MẬT & TĂNG CƯỜNG ĐỘ BỀN VỮNG HỆ THỐNG QUẢN TRỊ (ADMIN SECURITY & RESILIENCE HARDENING)

> **Ticket:** IMP-261 (Tier 2 Full Rigor - Security & Hardening)  
> **Revision:** 4 (Reconciled from User Review & Adversarial Inversion)  
> **Use Case Ref:** `UC-ADM-SEC` (Admin Security, Concurrency & Resilience Hardening)  
> **Cổng Tuần Tự Bắt Buộc (Prerequisite Sequencing Gate - ADV-08):**  
> `IMP-260` (Bóc tách mô-đun thuần `admin_manager.ts` ➔ `admin_vitals.ts`, `admin_cloud_sync.ts`, `admin_event_store.ts`) **BẮT BUỘC PHẢI HOÀN TẤT VÀ MERGE VÀO MÃ NGUỒN VẬT LÝ** trước khi kích hoạt Trạm 1 của `IMP-261`. `IMP-261` chỉ thi công trên nền tảng các tệp đã được bóc tách từ `IMP-260`. Nghiêm cấm áp dụng `IMP-260` đè lên sau khi `IMP-261` đã hoàn tất để tránh ghi đè làm mất mã nguồn bảo mật.  
> **Trọng tâm bảo mật & cách ly:**
> 1. **Cách ly hoàn toàn Node.js Crypto khỏi Client Bundle:** Tạo tệp máy chủ chuyên biệt `src/server/network/admin_security.ts` chứa `timingSafeStringCompare` và `normalizeRoomCode`. Giữ `src/server/network/admin_types.ts` thuần túy là DTO/Types nhằm ngăn chặn việc gây độc bundle trình duyệt (poisoning Vite client bundle) của `admin_live_view.tsx` và `use_admin_portal.ts`.
> 2. **Chống rò rỉ bộ lắng nghe sự kiện WebSocket (Event Listener Leak Guard):** Bọc `socket.on('error', ...)` trong điều kiện `if (!this.authenticatedSockets.has(socket))` trong `authenticate`, ngăn chặn việc tích tụ listener vượt ngưỡng `MaxListenersExceededWarning` khi client xác thực lại.
> 3. **Bảo toàn thứ tự phản hồi ACK trong `handleTerminate`:** Gửi xác nhận `ADMIN_ACTION_SUCCESS` trước khi gọi `admin.terminateRoom`, loại bỏ triệt để cuộc đua thứ tự (race condition) nơi `handleRoomClosed` phát `ADMIN_ROOM_LIST` trước khi client gọi nhận được ACK.
> 4. **Bọc xử lý ngoại lệ có cấu trúc cho Cloud Sync:** Bắt lỗi I/O đĩa và mạng trong `syncAdminCloudLogs` trả về `SYNC_EXCEPTION` kèm chi tiết lỗi `error`.
> 5. **Giới hạn dung lượng vi phạm ring buffer & Bản sao phòng vệ:** Áp trần `MAX_ROOM_LOGS` lên `roomViolations` và trả về bản sao phòng vệ `[...all]`, `[...v]` trong `AdminEventStore`.
> 6. **Bảo vệ chu vi xác thực đồng nhất:** Thêm guard xác thực `isAuthenticated(socket)` cho `ADMIN_UNSUBSCRIBE_ROOM`.

---

## 0. BẢNG ĐỐI SOÁT CHỈ THỊ BẢO MẬT & PHẢN BIỆN ĐỐI KHÁNG (REVISION 4)

| STT | Mã Chỉ Thị / Nguồn | Target Physical File & Function | Kịch Bản Rủi Ro & Lỗ Hổng Kỹ Thuật | Giải Pháp Kỹ Thuật Triển Khai Trong Revision 4 | Trạng Thái |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| **1** | **ARCH-ISOLATION** (Client Bundle Safety) | `src/server/network/admin_security.ts` (Mới) | `admin_types.ts` được import bởi client UI (`admin_live_view.tsx`, `use_admin_portal.ts`). Đưa `node:crypto` vào `admin_types.ts` làm vỡ Vite client build. | Task 1: Tạo mô-đun server chuyên biệt `admin_security.ts`. Giữ nguyên `admin_types.ts` làm pure DTO. | ✅ RESOLVED |
| **2** | **ADV-01** (UI Log Drop) | `admin_message_handler.ts#handleSubscribe` (L144) | `roomCode: rawRoomCode.toUpperCase()` không trim khiến UI client lọc theo `" ROOM1 "` và bỏ rơi toàn bộ live logs của `"ROOM1"`. | Task 5 (Snippet 5.3): Gán `roomCode: normalizeRoomCode(rawRoomCode)`. | ✅ RESOLVED |
| **3** | **ADV-02** (Unauth Bypass) | `admin_message_handler.ts#handleAdminClientMessage` (L24) | `ADMIN_UNSUBSCRIBE_ROOM` thiếu kiểm tra `isAuthenticated(socket)`, phá vỡ chu vi xác thực đồng nhất. | Task 5 (Snippet 5.2): Bổ sung guard `if (!admin.isAuthenticated(socket)) return UNAUTHORIZED`. | ✅ RESOLVED |
| **4** | **ADV-03** (Crash Hazard & Listener Leak) | `admin_manager.ts#sendAndPrune` & `authenticate` | Socket admin không có error callback làm crash tiến trình; gán listener lặp lại khi re-auth gây cảnh báo rò rỉ listener. | Task 2 (Snippet 2.1 & 2.3): Truyền error callback cho `sendAndPrune`, bọc `socket.on('error')` qua `if (!this.authenticatedSockets.has(socket))`. | ✅ RESOLVED |
| **5** | **ADV-04** (Zombie Sockets) | `admin_manager.ts#handleRoomClosed` & `handleDisconnect` | Socket đăng ký phòng không hoạt động bị kẹt trong `subscribedRooms` cho tới khi có broadcast toàn cục. | Task 2 (Snippet 2.5): `sendAndPrune` tự động cắt tỉa socket trạng thái CLOSING/CLOSED. | ✅ RESOLVED |
| **6** | **ADV-05** (Error Truncation) | `admin_message_handler.ts#handleSyncCloudStorage` (L188) | `result.reason ?? result.error` luôn chọn `'SYNC_EXCEPTION'` và nuốt mất `result.error` (e.g. `ENOSPC`, Timeout). | Task 5 (Snippet 5.5): Chuyển tiếp cả `reason`, `error`, và định dạng `message: result.error ? `${result.reason}: ${result.error}` : result.reason`. | ✅ RESOLVED |
| **7** | **ADV-06** (Action ACK Race) | `admin_message_handler.ts#handleTerminate` (L168) | Gọi `terminateRoom` trước khi gửi ACK làm `handleRoomClosed` broadcast `ADMIN_ROOM_LIST` trước khi caller nhận được `ADMIN_ACTION_SUCCESS`. | Task 5 (Snippet 5.4): Bảo toàn thứ tự gốc: gửi `ADMIN_ACTION_SUCCESS` trước, sau đó gọi `admin.terminateRoom`. | ✅ RESOLVED |
| **8** | **ADV-07** (Ingress Drift) | `admin_manager.ts#getRoomDetail` & `getDiagnosticDump` | Bỏ sót `normalizeRoomCode` trong `getRoomDetail`, `getDiagnosticDump`, `hasRoom` khiến input có khoảng trắng bị lỗi. | Task 2 (Snippet 2.4, 2.7, 2.8): Bổ sung chuẩn hóa `rawRoomCode` cho 100% điểm ingress. | ✅ RESOLVED |
| **9** | **ADV-08** (Sequencing Gate) | Header, Section 0, Section 5 (DoD), `_epic_ledger.md` | Chạy IMP-260 sau IMP-261 sẽ ghi đè các tệp chưa bảo vệ lên tệp đã bảo mật, làm tái phát lỗ hổng. | Khóa cứng Cổng Tuần Tự Bắt Buộc: `IMP-260 MERGED FIRST ➔ IMP-261 SECOND`. | ✅ RESOLVED |

---

## 1. BẢNG ĐO LƯỜNG ĐỊNH LƯỢNG NGÂN SÁCH LOC (PHYSICAL DISK BASELINE)

*Đo đạc tự động qua công cụ chính thức của dự án: `node scripts/check_loc.mjs`*

| File vật lý | Phân loại Tier | Baseline Hiện Tại | Non-Empty SLOC | Est. Delta | Post LOC | Trần Budget | Trạng thái sau Hardening |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `src/server/network/admin_security.ts` (Mới) | Tier 1 (Server Security) | **0** | 0 | +35 | **35** | <= 400 | ✔️ Safe (< 300 LOC Tier 1 Safe) |
| `src/server/network/admin_types.ts` | Tier 3 (Types & Config) | **94** | 83 | 0 | **94** | <= 800 | ✔️ Safe (< 650 LOC) |
| `src/server/network/admin_manager.ts` | Tier 1 (Server Coordinator) | **328** (hậu IMP-260) | 295 | +6 | **334** | <= 400 | ⚠️ Warning (> 300 LOC, trần <= 400 LOC) |
| `src/server/network/admin_cloud_sync.ts` | Tier 1 (Server IO) | **38** (hậu IMP-260) | 33 | +8 | **46** | <= 400 | ✔️ Safe (< 300 LOC Tier 1 Safe) |
| `src/server/network/admin_event_store.ts` | Tier 1 (Server Store) | **82** (hậu IMP-260) | 74 | +12 | **94** | <= 400 | ✔️ Safe (< 300 LOC Tier 1 Safe) |
| `src/server/network/admin_message_handler.ts` | Tier 1 (Message Router) | **197** | 185 | +6 | **203** | <= 400 | ✔️ Safe (< 300 LOC Tier 1 Safe) |
| `tests/contracts/imp261_admin_security_and_resilience.test.ts` (Mới) | Living Test Suite | **0** | 0 | +260 | **260** | <= 600 | ✔️ Safe (< 600 LOC) |

> ⚠️ **Ghi chú Nợ Kỹ Thuật (`DEBT-ADMIN-MANAGER`):**  
> `admin_manager.ts` ở mức **334 dòng** nằm trong vùng cảnh báo (`> 300 LOC Tier 1`, dưới trần cứng `400 LOC`). Mã nợ `DEBT-ADMIN-MANAGER` tiếp tục được duy trì (CARRIED OVER) với mục tiêu giải quyết tại **IMP-263**. Đăng ký thêm mã nợ `DEBT-ADMIN-AUTH-RATE-LIMIT` (Target: **IMP-262**) cho cơ chế giới hạn tần suất đăng nhập chống brute-force.

---

## 2. THIẾT KẾ BẢO MẬT & KIẾN TRÚC BỀN VỮNG (SECURITY & RESILIENCE ARCHITECTURE)

### 2.1. Cách Ly Trình Duyệt & So Sánh Mật Khẩu Hằng Thời Gian

```
[Browser Bundle: admin_live_view.tsx / use_admin_portal.ts]
               │
               ▼
[src/server/network/admin_types.ts] (Pure DTO/Types - 0 Node.js Built-in dependencies)

==================== BỨC TƯỜNG CÁCH LY CLIENT / SERVER ====================

[Server Network Runtime: admin_manager.ts / admin_message_handler.ts]
               │
               ▼
[admin_security module] (Server-Only: node:crypto)
               │
               ├─► normalizeRoomCode(raw) ──► (raw ?? '').trim().toUpperCase()
               │
               └─► timingSafeStringCompare(a, b)
                     ├─► SHA-256(a) ──► Buffer 32B
                     ├─► SHA-256(b) ──► Buffer 32B
                     └─► crypto.timingSafeEqual(hashA, hashB) [Thời gian so sánh không đổi!]
```

### 2.2. Luồng Bảo Vệ Socket & Cắt Tỉa Zombie (Opportunistic Dead Socket Pruning)

```
[Broadcast Event] ──► sendAndPrune(targetSockets, encoded)
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   sock.readyState === OPEN        sock.readyState in [CLOSING, CLOSED]
            │                                 │
   sock.send(encoded, callback)               ▼
            │                            dead.push(sock)
   (Nếu catch hoặc err trong callback)        │
            │                                 ▼
            └────────────────────────► handleDisconnect(sock)
                                              │
                         ┌────────────────────┴────────────────────┐
                         ▼                                         ▼
            authenticatedSockets.delete(sock)         subscribedRooms.delete(sock)
```

---

## 3. CÁC BƯỚC THI CÔNG & MÃ NGUỒN DROP-IN SNIPPETS (IMPLEMENTATION TASKS)

### Task 1: Tạo Module `src/server/network/admin_security.ts` (Server-Only Security)
- **Target physical file**: `src/server/network/admin_security.ts` (Tệp mới)
- **Mục tiêu**: Cung cấp `timingSafeStringCompare` và `normalizeRoomCode` làm SSOT phía server, tách biệt hoàn toàn khỏi `admin_types.ts` để bảo vệ client bundle.

```typescript
// [UC-ADM-SEC] Admin Security Utilities & Normalization
import crypto from 'node:crypto';

/**
 * Constant-time string comparison using SHA-256 and crypto.timingSafeEqual.
 * Mitigates timing side-channel attacks on secret comparison.
 */
export function timingSafeStringCompare(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

/**
 * Normalizes room code by trimming whitespace and converting to uppercase.
 * Single source of truth for admin ingress points.
 */
export function normalizeRoomCode(rawRoomCode: string): string {
  return (rawRoomCode ?? '').trim().toUpperCase();
}
```

---

### Task 2: Tăng Cường Bảo Mật & Độ Bền Vững Trong `src/server/network/admin_manager.ts`
- **Target physical file**: `src/server/network/admin_manager.ts`

#### Snippet 2.1: Nhập WebSocket và các tiện ích từ admin_security.ts
```typescript
<<<<
import type { WebSocket } from 'ws';
====
import { WebSocket } from 'ws';
import { normalizeRoomCode, timingSafeStringCompare } from './admin_security.js';
>>>>
```

#### Snippet 2.2: Cắt tỉa secret trước khi kiểm tra rỗng trong constructor
```typescript
<<<<
    const secret = options.secret ?? process.env['VTCOON_ADMIN_SECRET'] ?? process.env['ADMIN_SECRET'];
    if (!secret) {
      if (process.env['NODE_ENV'] === 'production') {
        throw new Error('FATAL: VTCOON_ADMIN_SECRET must be configured in production mode');
      }
      console.warn(JSON.stringify({
        event: 'WARN_ADMIN_SECRET_MISSING',
        timestamp: Date.now(),
        delta: { hint: 'Set VTCOON_ADMIN_SECRET env var. Admin panel disabled.' },
      }));
    }
    this.secret = secret ?? '';
====
    const rawSecret = options.secret ?? process.env['VTCOON_ADMIN_SECRET'] ?? process.env['ADMIN_SECRET'];
    const secret = typeof rawSecret === 'string' ? rawSecret.trim() : undefined;
    if (!secret) {
      if (process.env['NODE_ENV'] === 'production') {
        throw new Error('FATAL: VTCOON_ADMIN_SECRET must be configured in production mode');
      }
      console.warn(JSON.stringify({
        event: 'WARN_ADMIN_SECRET_MISSING',
        timestamp: Date.now(),
        delta: { hint: 'Set VTCOON_ADMIN_SECRET env var. Admin panel disabled.' },
      }));
    }
    this.secret = secret ?? '';
>>>>
```

#### Snippet 2.3: Xác thực Constant-Time & Đăng ký Lắng Nghe Lỗi Socket Không Rò Rỉ
```typescript
<<<<
  authenticate(socket: WebSocket, secret: string): boolean {
    if (!this.secret) return false;
    if (typeof secret === 'string' && secret.trim() === this.secret) {
      this.authenticatedSockets.add(socket);
      return true;
    }
    return false;
  }
====
  authenticate(socket: WebSocket, secret: string): boolean {
    if (!this.secret) return false;
    if (typeof secret === 'string' && timingSafeStringCompare(secret.trim(), this.secret)) {
      if (!this.authenticatedSockets.has(socket)) {
        this.authenticatedSockets.add(socket);
        try {
          socket.on('error', () => { this.handleDisconnect(socket); });
        } catch { /* safe-ignore */ }
      }
      return true;
    }
    return false;
  }
>>>>
```

#### Snippet 2.4: Chuẩn hóa roomCode trong hasRoom
```typescript
<<<<
  hasRoom(roomCode: string): boolean {
    return this.rooms.hasRoom(roomCode);
  }
====
  hasRoom(rawRoomCode: string): boolean {
    return this.rooms.hasRoom(normalizeRoomCode(rawRoomCode));
  }
>>>>
```

#### Snippet 2.5: Cắt tỉa socket chết an toàn qua sendAndPrune
```typescript
<<<<
  broadcastToAdmins(msg: WsServerMessage): void {
    const encoded = encodeMsg(msg);
    for (const sock of this.authenticatedSockets) {
      if (sock.readyState === 1 /* WebSocket.OPEN */) {
        try { sock.send(encoded); } catch { /* safe-ignore */ }
      }
    }
  }

  broadcastRoomListToAdmins(): void {
    this.broadcastToAdmins({
      type: 'ADMIN_ROOM_LIST',
      rooms: this.getRoomsSummary(),
      vitals: this.getServerVitals(),
    });
  }

  private broadcastToRoomSubscribers(roomCode: string, msg: WsServerMessage): void {
    const encoded = encodeMsg(msg);
    for (const [sock, targetCode] of this.subscribedRooms.entries()) {
      if (targetCode === roomCode && this.authenticatedSockets.has(sock)) {
        if (sock.readyState === 1 /* WebSocket.OPEN */) {
          try { sock.send(encoded); } catch { /* safe-ignore */ }
        }
      }
    }
  }
====
  private sendAndPrune(sockets: Iterable<WebSocket>, encoded: string): void {
    const dead: WebSocket[] = [];
    for (const sock of sockets) {
      if (sock.readyState === WebSocket.OPEN) {
        try {
          sock.send(encoded, (err) => {
            if (err) this.handleDisconnect(sock);
          });
        } catch {
          dead.push(sock);
        }
      } else if (sock.readyState === WebSocket.CLOSING || sock.readyState === WebSocket.CLOSED) {
        dead.push(sock);
      }
    }
    for (const s of dead) { this.handleDisconnect(s); }
  }

  broadcastToAdmins(msg: WsServerMessage): void {
    this.sendAndPrune(this.authenticatedSockets, encodeMsg(msg));
  }

  broadcastRoomListToAdmins(): void {
    this.broadcastToAdmins({
      type: 'ADMIN_ROOM_LIST',
      rooms: this.getRoomsSummary(),
      vitals: this.getServerVitals(),
    });
  }

  private broadcastToRoomSubscribers(rawRoomCode: string, msg: WsServerMessage): void {
    const norm = normalizeRoomCode(rawRoomCode);
    const encoded = encodeMsg(msg);
    const targetSockets: WebSocket[] = [];
    for (const [sock, target] of this.subscribedRooms.entries()) {
      if (target === norm && this.authenticatedSockets.has(sock)) {
        targetSockets.push(sock);
      }
    }
    this.sendAndPrune(targetSockets, encoded);
  }
>>>>
```

#### Snippet 2.6: Chuẩn hóa roomCode trong subscribeRoom và unsubscribeRoom
```typescript
<<<<
  subscribeRoom(socket: WebSocket, rawRoomCode: string): {
    success: boolean;
    detail?: AdminRoomDetail;
    recentLogs?: AdminRoomLogEntry[];
    reason?: string;
  } {
    if (!this.isAuthenticated(socket)) {
      return { success: false, reason: 'ADMIN_UNAUTHORIZED' };
    }
    const roomCode = rawRoomCode.trim().toUpperCase();
    if (!this.rooms.hasRoom(roomCode)) {
      return { success: false, reason: 'ADMIN_ROOM_NOT_FOUND' };
    }
    this.subscribedRooms.set(socket, roomCode);
    const detail = this.getRoomDetail(roomCode);
    const fullLogs = this.roomLogger.getRoomFullLog(roomCode);
    const recentLogs = fullLogs.length > 0 ? fullLogs : this.getRecentLogs(roomCode);
    return { success: true, detail, recentLogs };
  }

  unsubscribeRoom(socket: WebSocket, rawRoomCode?: string): void {
    if (rawRoomCode) {
      const roomCode = rawRoomCode.trim().toUpperCase();
      if (this.subscribedRooms.get(socket) === roomCode) this.subscribedRooms.delete(socket);
    } else {
      this.subscribedRooms.delete(socket);
    }
  }
====
  subscribeRoom(socket: WebSocket, rawRoomCode: string): {
    success: boolean;
    detail?: AdminRoomDetail;
    recentLogs?: AdminRoomLogEntry[];
    reason?: string;
  } {
    if (!this.isAuthenticated(socket)) {
      return { success: false, reason: 'ADMIN_UNAUTHORIZED' };
    }
    const roomCode = normalizeRoomCode(rawRoomCode);
    if (!this.rooms.hasRoom(roomCode)) {
      return { success: false, reason: 'ADMIN_ROOM_NOT_FOUND' };
    }
    this.subscribedRooms.set(socket, roomCode);
    const detail = this.getRoomDetail(roomCode);
    const fullLogs = this.roomLogger.getRoomFullLog(roomCode);
    const recentLogs = fullLogs.length > 0 ? fullLogs : this.getRecentLogs(roomCode);
    return { success: true, detail, recentLogs };
  }

  unsubscribeRoom(socket: WebSocket, rawRoomCode?: string): void {
    if (rawRoomCode) {
      const roomCode = normalizeRoomCode(rawRoomCode);
      if (this.subscribedRooms.get(socket) === roomCode) this.subscribedRooms.delete(socket);
    } else {
      this.subscribedRooms.delete(socket);
    }
  }
>>>>
```

#### Snippet 2.7: Chuẩn hóa roomCode trong getRoomDetail
```typescript
<<<<
  getRoomDetail(rawRoomCode: string): AdminRoomDetail | undefined {
    const norm = rawRoomCode.toUpperCase();
    const opts = {
      timeRemainingProvider: this.timeRemainingProvider,
      reconnectManager: this.reconnectManager,
    };
    return buildRoomDetail(rawRoomCode, this.rooms, this.roomViolations.get(norm), opts);
  }
====
  getRoomDetail(rawRoomCode: string): AdminRoomDetail | undefined {
    const norm = normalizeRoomCode(rawRoomCode);
    const opts = {
      timeRemainingProvider: this.timeRemainingProvider,
      reconnectManager: this.reconnectManager,
    };
    return buildRoomDetail(norm, this.rooms, this.roomViolations.get(norm), opts);
  }
>>>>
```

#### Snippet 2.8: Chuẩn hóa roomCode trong terminateRoom và getDiagnosticDump
```typescript
<<<<
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
  terminateRoom(rawRoomCode: string, reason: string = 'ADMIN_FORCE_TERMINATE'): boolean {
    const norm = normalizeRoomCode(rawRoomCode);
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
    const norm = normalizeRoomCode(rawRoomCode);
    return buildDiagnosticDump(
      norm,
      this.rooms,
      this.roomViolations.get(norm),
      this.getRecentLogs(norm),
    );
  }
>>>>
```

---

### Task 3: Bọc Xử Lý Ngoại Lệ Trong `src/server/network/admin_cloud_sync.ts`
- **Target physical file**: `src/server/network/admin_cloud_sync.ts` (Kế thừa từ mô-đun mới IMP-260)
- **Mục tiêu**: Bắt lỗi đĩa I/O hoặc lỗi mạng và trả về mã lỗi có cấu trúc `SYNC_EXCEPTION` (ADV-04).

#### Snippet 3.1: Bọc try/catch và trả về SYNC_EXCEPTION
```typescript
<<<<
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
====
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
>>>>
```

---

### Task 4: Giới Hạn Ring Buffer & Bản Sao Phòng Vệ Trong `src/server/network/admin_event_store.ts`
- **Target physical file**: `src/server/network/admin_event_store.ts` (Kế thừa từ mô-đun mới IMP-260)
- **Mục tiêu**: Áp trần `MAX_ROOM_LOGS` lên vi phạm bất biến và trả về bản sao phòng vệ `[...all]` và `[...v]` (ADV-02, ADV-05).

#### Snippet 4.1: Nhập tiện ích normalizeRoomCode
```typescript
<<<<
import {
  MAX_ROOM_LOGS,
  type AdminRoomLogEntry,
} from './admin_types.js';
====
import {
  MAX_ROOM_LOGS,
  type AdminRoomLogEntry,
} from './admin_types.js';
import { normalizeRoomCode } from './admin_security.js';
>>>>
```

#### Snippet 4.2: Chuẩn hóa roomCode trong recordRoomEvent
```typescript
<<<<
  recordRoomEvent(
    roomCode: string,
    entry: Omit<AdminRoomLogEntry, 'id' | 'roomCode' | 'timestamp'> & { timestamp?: number; playerId?: string },
  ): AdminRoomLogEntry {
    const norm = roomCode.toUpperCase();
====
  recordRoomEvent(
    rawRoomCode: string,
    entry: Omit<AdminRoomLogEntry, 'id' | 'roomCode' | 'timestamp'> & { timestamp?: number; playerId?: string },
  ): AdminRoomLogEntry {
    const norm = normalizeRoomCode(rawRoomCode);
>>>>
```

#### Snippet 4.3: Áp trần MAX_ROOM_LOGS lên vi phạm bất biến
```typescript
<<<<
  recordRoomViolation(roomCode: string, type: string, message: string): void {
    const norm = roomCode.toUpperCase();
    const now = Date.now();
    this.recordRoomEvent(norm, {
      source: 'SYSTEM',
      action: 'INVARIANT_VIOLATION',
      payloadSummary: `[${type}] ${message}`,
    });

    let violations = this.roomViolations.get(norm);
    if (!violations) {
      violations = [];
      this.roomViolations.set(norm, violations);
    }
    violations.push({ type, message, timestamp: now });
  }
====
  recordRoomViolation(rawRoomCode: string, type: string, message: string): void {
    const norm = normalizeRoomCode(rawRoomCode);
    const now = Date.now();
    this.recordRoomEvent(norm, {
      source: 'SYSTEM',
      action: 'INVARIANT_VIOLATION',
      payloadSummary: `[${type}] ${message}`,
    });

    let violations = this.roomViolations.get(norm);
    if (!violations) {
      violations = [];
      this.roomViolations.set(norm, violations);
    }
    violations.push({ type, message, timestamp: now });
    if (violations.length > MAX_ROOM_LOGS) {
      violations.shift();
    }
  }
>>>>
```

#### Snippet 4.4: Trả về bản sao phòng vệ và chuẩn hóa mã phòng
```typescript
<<<<
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
====
  getRecentLogs(rawRoomCode: string, playerId?: string): AdminRoomLogEntry[] {
    const norm = normalizeRoomCode(rawRoomCode);
    const all = this.roomLogs.get(norm) ?? [];
    if (!playerId) return [...all];
    return all.filter((l) => l.playerId === playerId);
  }

  getViolations(rawRoomCode: string): Array<{ type: string; message: string; timestamp: number }> | undefined {
    const v = this.roomViolations.get(normalizeRoomCode(rawRoomCode));
    return v ? [...v] : undefined;
  }

  clearRoom(rawRoomCode: string): void {
    const norm = normalizeRoomCode(rawRoomCode);
    this.roomLogs.delete(norm);
    this.roomViolations.delete(norm);
  }
>>>>
```

---

### Task 5: Bảo Mật & Toàn Vẹn Trong `src/server/network/admin_message_handler.ts`
- **Target physical file**: `src/server/network/admin_message_handler.ts`
- **Mục tiêu**: Chuẩn hóa mã phòng ở 100% ingress, kiểm tra xác thực `ADMIN_UNSUBSCRIBE_ROOM`, bảo toàn chi tiết lỗi đồng bộ cloud, và giữ đúng thứ tự phản hồi ACK trước khi đóng phòng (ADV-01, ADV-02, ADV-05, ADV-06).

#### Snippet 5.1: Nhập tiện ích normalizeRoomCode từ admin_security.ts
```typescript
<<<<
import type { WebSocket } from 'ws';
import type { WsClientMessage, WsServerMessage, ReasonCode } from './network_types.js';
import type { AdminManager } from './admin_manager.js';
====
import type { WebSocket } from 'ws';
import type { WsClientMessage, WsServerMessage, ReasonCode } from './network_types.js';
import type { AdminManager } from './admin_manager.js';
import { normalizeRoomCode } from './admin_security.js';
>>>>
```

#### Snippet 5.2: Kiểm tra xác thực trong ADMIN_UNSUBSCRIBE_ROOM
```typescript
<<<<
    case 'ADMIN_UNSUBSCRIBE_ROOM':
      admin.unsubscribeRoom(socket, msg.roomCode);
      return true;
====
    case 'ADMIN_UNSUBSCRIBE_ROOM':
      if (!admin.isAuthenticated(socket)) {
        sendSafe(socket, { type: 'ERROR', reasonCode: 'ADMIN_UNAUTHORIZED' });
        return true;
      }
      admin.unsubscribeRoom(socket, msg.roomCode);
      return true;
>>>>
```

#### Snippet 5.3: Chuẩn hóa mã phòng trong handleSubscribe
```typescript
<<<<
  } else if (res.detail) {
    sendSafe(socket, {
      type: 'ADMIN_ROOM_DETAIL',
      roomCode: rawRoomCode.toUpperCase(),
      detail: res.detail,
      recentLogs: res.recentLogs ?? [],
    });
  }
====
  } else if (res.detail) {
    sendSafe(socket, {
      type: 'ADMIN_ROOM_DETAIL',
      roomCode: normalizeRoomCode(rawRoomCode),
      detail: res.detail,
      recentLogs: res.recentLogs ?? [],
    });
  }
>>>>
```

#### Snippet 5.4: Chuẩn hóa mã phòng và bảo toàn thứ tự ACK trong handleTerminate
```typescript
<<<<
  const norm = rawRoomCode.toUpperCase();
  if (!admin.hasRoom(norm)) {
    sendSafe(socket, { type: 'ADMIN_ERROR', reasonCode: 'ADMIN_ROOM_NOT_FOUND', message: 'Phòng không tồn tại' });
    return true;
  }
  sendSafe(socket, { type: 'ADMIN_ACTION_SUCCESS', action: 'TERMINATE_ROOM', roomCode: norm });
  admin.terminateRoom(norm, reason);
  return true;
====
  const norm = normalizeRoomCode(rawRoomCode);
  if (!admin.hasRoom(norm)) {
    sendSafe(socket, { type: 'ADMIN_ERROR', reasonCode: 'ADMIN_ROOM_NOT_FOUND', message: 'Phòng không tồn tại' });
    return true;
  }
  sendSafe(socket, { type: 'ADMIN_ACTION_SUCCESS', action: 'TERMINATE_ROOM', roomCode: norm });
  admin.terminateRoom(norm, reason);
  return true;
>>>>
```

#### Snippet 5.5: Bảo toàn chi tiết lỗi đồng bộ cloud trong handleSyncCloudStorage
```typescript
<<<<
  const result = await admin.syncCloudLogs();
  sendSafe(socket, {
    type: 'ADMIN_SYNC_CLOUD_RESULT',
    success: result.success,
    uploadedCount: result.uploadedCount ?? 0,
    bucket: result.bucket ?? 'game-logs',
    message: result.reason ?? result.error,
  });
====
  const result = await admin.syncCloudLogs();
  const detailMsg = result.error ? `${result.reason ?? 'SYNC_FAILED'}: ${result.error}` : (result.reason ?? 'SYNC_COMPLETED');
  sendSafe(socket, {
    type: 'ADMIN_SYNC_CLOUD_RESULT',
    success: result.success,
    uploadedCount: result.uploadedCount ?? 0,
    bucket: result.bucket ?? 'game-logs',
    message: detailMsg,
    reason: result.reason,
    error: result.error,
  });
>>>>
```

---

## 4. MA TRẬN 16 BÀI KIỂM THỬ HỢP ĐỒNG (STATION 1 TEST SPECIFICATIONS - DOD #1)

*Toàn bộ 16 ca kiểm thử tuân thủ nghiêm ngặt chuẩn Flow Taxonomy (`[UC-ADM-SEC/MSS]` và `[UC-ADM-SEC/A#]`), 1–4 asserts/test, 0 loops trong `it()`*:

1. TC-261.01 [UC-ADM-SEC/MSS]: normalizeRoomCode chuẩn hóa chuỗi thường và cắt tỉa khoảng trắng đầu cuối thành chữ hoa chuẩn.
2. TC-261.02 [UC-ADM-SEC/MSS]: timingSafeStringCompare so sánh hằng thời gian trả về true cho hai secret trùng khớp và false an toàn không ném RangeError khi độ dài lệch.
3. TC-261.03 [UC-ADM-SEC/MSS]: AdminManager constructor cắt tỉa secret trước khi qua guard rỗng, ném FATAL trong production nếu secret chỉ chứa khoảng trắng.
4. TC-261.04 [UC-ADM-SEC/MSS]: AdminManager.authenticate xác thực thành công qua timingSafeStringCompare và chỉ đăng ký listener socket error một lần duy nhất chống rò rỉ listener.
5. TC-261.05 [UC-ADM-SEC/MSS]: AdminEventStore.getRecentLogs trả về bản sao phòng vệ, bảo vệ mảng log gốc khỏi đột biến bên ngoài.
6. TC-261.06 [UC-ADM-SEC/MSS]: AdminEventStore.getViolations trả về bản sao phòng vệ của danh sách vi phạm, chống đột biến ring buffer.
7. TC-261.07 [UC-ADM-SEC/MSS]: AdminEventStore.recordRoomViolation áp dụng trần MAX_ROOM_LOGS loại bỏ vi phạm cũ nhất theo thứ tự FIFO khi bị spam vi phạm.
8. TC-261.08 [UC-ADM-SEC/MSS]: admin_message_handler.handleSubscribe trả về ADMIN_ROOM_DETAIL mang roomCode đã qua normalizeRoomCode, ngăn chặn UI client bỏ rơi live log.
9. TC-261.09 [UC-ADM-SEC/MSS]: AdminManager.broadcastToAdmins cắt tỉa socket CLOSING hoặc CLOSED khỏi authenticatedSockets qua sendAndPrune.
10. TC-261.10 [UC-ADM-SEC/MSS]: AdminManager.sendAndPrune truyền error callback cho sock.send, tự động dọn dẹp socket khi ghi TCP bất đồng bộ thất bại mà không crash tiến trình.
11. TC-261.11 [UC-ADM-SEC/MSS]: AdminManager.broadcastToRoomSubscribers dọn dẹp socket chết khỏi danh sách đăng ký phòng.
12. TC-261.12 [UC-ADM-SEC/MSS]: syncAdminCloudLogs bắt ngoại lệ I/O hoặc lỗi mạng và trả về đối tượng có cấu trúc với reason SYNC_EXCEPTION và chi tiết error.
13. TC-261.13 [UC-ADM-SEC/MSS]: admin_message_handler.handleSyncCloudStorage bảo toàn cả reason và error message trong ADMIN_SYNC_CLOUD_RESULT.
14. TC-261.14 [UC-ADM-SEC/A1]: Ngoại lệ A1: admin_message_handler từ chối ADMIN_UNSUBSCRIBE_ROOM từ socket chưa xác thực bằng mã lỗi ADMIN_UNAUTHORIZED.
15. TC-261.15 [UC-ADM-SEC/A2]: Ngoại lệ A2: admin_message_handler.handleTerminate gửi ADMIN_ACTION_SUCCESS trước khi gọi terminateRoom và trả về ADMIN_ROOM_NOT_FOUND nếu phòng không tồn tại.
16. TC-261.16 [UC-ADM-SEC/A3]: Ngoại lệ A3: AdminManager getRoomDetail, getDiagnosticDump, hasRoom chuẩn hóa mã phòng có khoảng trắng và truy xuất chính xác dữ liệu phòng.

---

## 5. ĐỊNH NGHĨA HOÀN THÀNH (DEFINITION OF DONE - DOD)

1. **DoD 1: TDD & Adversarial Inversion:** Bộ kiểm thử `tests/contracts/imp261_admin_security_and_resilience.test.ts` gồm 16 test cases đạt chuẩn Flow Taxonomy `[UC-ADM-SEC/MSS]` và `[UC-ADM-SEC/A#]`.
2. **DoD 2: Ngân Sách LOC & Anti-Slop:**
   - `admin_manager.ts` đạt mức **334 dòng** (`⚠️ Warning`, trần <= 400 LOC). Duy trì mã nợ `DEBT-ADMIN-MANAGER` (Target: IMP-263).
   - `admin_security.ts` (35 LOC), `admin_cloud_sync.ts` (46 LOC), `admin_event_store.ts` (94 LOC), `admin_message_handler.ts` (203 LOC) đều nằm trong vùng an toàn (< 300 LOC Tier 1 Safe).
   - `admin_types.ts` giữ nguyên 94 LOC (Tier 3 Safe, 0 Node.js crypto imports, hoàn toàn an toàn cho client UI bundle).
   - Vượt qua `npm run lint:slop` và `node scripts/check_loc.mjs`.
3. **DoD 3: Zero Magic Numbers & Zero Dirty Casts:**
   - 100% so sánh trạng thái socket sử dụng `WebSocket.OPEN`, `WebSocket.CLOSING`, `WebSocket.CLOSED`. Không có `as any`.
4. **DoD 4: Bảo Toàn Tương Thích & Không Hồi Quy:**
   - 100% 5 test suites quản trị hiện có (90 test cases) tiếp tục pass không lỗi.
   - Toàn bộ 164 test suites (3.535 tests) trong repo tiếp tục pass 100%.
5. **DoD 5: Quản Lý Nợ Kỹ Thuật (Tech Debt Ledger):**
   - Đóng dứt điểm mã nợ `DEBT-ADMIN-SECURITY` trong `docs/epics/networking/_epic_ledger.md`.
   - Ghi nhận `DEBT-ADMIN-MANAGER` (CARRIED OVER, Target: IMP-263).
   - Đăng ký mới `DEBT-ADMIN-AUTH-RATE-LIMIT` (Target: IMP-262).
6. **DoD 6: Khóa Cứng Cổng Tuần Tự (Sequencing Lock):**
   - Chỉ kích hoạt Station 1 của IMP-261 sau khi IMP-260 đã được merge vào physical disk.
