# Biên Bản Thẩm Định — Slice 00 Walking Skeleton
**VTCoOn · Kiểm toán 2026-09-07T20:43 +07:00**

---

## Tóm Tắt Điều Hành

| Hạng mục | Kết quả |
|:---|:---:|
| Test suite (20 tests) | ✅ 20/20 XANH |
| 4 Hợp đồng nghiệp vụ (TC-00.1→00.4) | ✅ ĐẠT |
| Zone 3 Leak | ✅ SẠCH |
| Failure Postconditions | ✅ ĐẠT |
| Slop #3-6 (LOC, hàm, CC, golf) | ✅ ĐẠT |
| TypeScript strict mode | ✅ 0 lỗi |
| **Lỗi BLOCKING cần sửa** | **3 lỗi** |
| **Lỗi WARN nên sửa** | **3 lỗi** |
| **Phán quyết** | **[CONDITIONAL REJECTED]** |

> [!IMPORTANT]
> Phán quyết là **CONDITIONAL REJECTED**. Logic nghiệp vụ cốt lõi và 4 hợp đồng kiểm thử đều đúng. Cần giải quyết 3 lỗi BLOCKING trước khi chuyển sang Slice 01.

---

## Phần I — Lỗi BLOCKING (Bắt Buộc Sửa)

### 🔴 BLOCKING #1 — Dependency Thừa (Slop #2)

**Nguồn:** Code Reviewer  
**Mức độ vi phạm:** GEMINI.md §3 — "Prune Dead Code · Zero unnecessary dependencies"

**Vấn đề:**  
`package.json` cài `ws` và `@types/ws` nhưng **không một file nào trong `src/` import chúng**. Slice 00 dùng in-memory `SessionManager` thuần túy — không có WebSocket thật.

**Bằng chứng:**

```json
// package.json (hiện tại)
"dependencies": {
  "ws": "^8.18.0",         // ← KHÔNG DÙNG
  "@types/ws": "^8.18.0"  // ← KHÔNG DÙNG
}
```

Grep toàn bộ `src/`: 0 kết quả cho `import.*ws` hoặc `require.*ws`.

**Giải pháp đề nghị:**  
→ Xóa 2 dòng khỏi `package.json`, chạy `npm install` lại.  
→ Khi Slice 01 cần WebSocket thật: thêm lại khi ấy.

**File cần sửa:** [`package.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/package.json)

---

### 🔴 BLOCKING #2 — Dead Enum Value (Slop #1)

**Nguồn:** Code Reviewer  
**Mức độ vi phạm:** GEMINI.md §3 — "Prune Dead Code · Aggressively delete unused code"

**Vấn đề:**  
`SessionState.Disconnected` được khai báo trong enum nhưng **không bao giờ được gán**. Khi phiên hết ân hạn, code gọi `this.sessions.delete(id)` — session bị xóa khỏi Map, không có đối tượng nào nhận state `Disconnected`.

**Bằng chứng:**

```typescript
// session_manager.ts (hiện tại)
export enum SessionState {
  Connected    = 'Connected',
  GracePeriod  = 'GracePeriod',
  Disconnected = 'Disconnected',  // ← KHÔNG BAO GIỜ ĐƯỢC GÁN
}

// checkHeartbeats — logic thực tế:
if (elapsed > GRACE_PERIOD_MS) {
  this.sessions.delete(id);  // ← Xóa thẳng, không gán Disconnected
}
```

**Hai lựa chọn — bạn quyết định:**

| Lựa chọn | Khi nào dùng | Hành động |
|:---|:---|:---|
| **A. Xóa enum value** | Slice 01+ không cần state Disconnected (session chỉ có: Connected, GracePeriod, hoặc không tồn tại) | Xóa dòng `Disconnected = 'Disconnected'` |
| **B. Giữ + gán trước khi xóa** | Slice 01+ cần biết lý do xóa (FSM audit log, WebSocket close event) | Thêm `session.state = SessionState.Disconnected` ngay trước `delete` |

> [!NOTE]
> Kiến trúc đã xác định (ADR-0001): FSM State Machine ở Slice 01 sẽ có nhiều state hơn. Nếu `Disconnected` là state hợp lệ trong FSM, hãy chọn **B** và thêm test cho nó.

**File cần sửa:** [`src/server/session_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts)

---

### 🔴 BLOCKING #3 — Epic Ledger Chưa Cập Nhật (DoD #4)

**Nguồn:** Spec Reviewer + Code Reviewer  
**Mức độ vi phạm:** GEMINI.md §2 — "Progress is updated in `docs/epics/[epic]/_epic_ledger.md`"

**Vấn đề:**  
Dòng 10 trong `_epic_ledger.md` vẫn ghi:
```
Lifecycle Status: Prepared (Chờ duyệt)
```
Trong khi Slice 00 đã hoàn thành 20/20 tests, thi công xong 5 Task, qua Inversion Gate ×3.

**Giải pháp đề nghị:**

```markdown
<!-- Thay dòng hiện tại: -->
- **Lifecycle Status:** Prepared (Chờ duyệt)

<!-- Thành: -->
- **Lifecycle Status:** Done (2026-09-07)
- **Deliverables:** board_config.ts (64L) · session_manager.ts (72L) · game_canvas.tsx (41L)
- **Test Coverage:** 20/20 tests · 6 files · Adversarial Inversion ×3 PASS
- **LOC Final:** 380/400
```

**File cần sửa:** [`docs/epics/gameplay/_epic_ledger.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/epics/gameplay/_epic_ledger.md)

---

## Phần II — Lỗi WARN (Nên Sửa, Không Blocking)

### 🟡 WARN #4 — Thiếu Assert 3 Ô Đặc Biệt

**Nguồn:** Spec Reviewer  
**Spec yêu cầu:** "Ô đặc biệt đúng vị trí (index 0=Go, 10=Jail, 20=FreeParking, 30=GoToJail)"  
**Thực tế:** `board_config.test.ts` chỉ assert `BOARD_CONFIG[0].type === Go`. Ba ô còn lại chưa được test tự động — nếu ai sắp xếp lại data, sẽ không bị phát hiện.

**Bổ sung đề nghị vào `board_config.test.ts`:**

```typescript
it('[UC-GAME-009/MSS] các ô đặc biệt đúng vị trí', () => {
  expect(BOARD_CONFIG[0]?.type).toBe(CellType.Go);
  expect(BOARD_CONFIG[10]?.type).toBe(CellType.Jail);
  expect(BOARD_CONFIG[20]?.type).toBe(CellType.FreeParking);
  expect(BOARD_CONFIG[30]?.type).toBe(CellType.GoToJail);
});
```

**File cần sửa:** [`tests/domain/board_config.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/domain/board_config.test.ts)

---

### 🟡 WARN #5 — `game_canvas.test.ts` Thiếu Traceability Tags

**Nguồn:** Spec Reviewer  
**Vấn đề:** 4 test cases kiểm tra canvas layout và BOARD_CONFIG — trực tiếp liên quan đến `UC-GAME-009/MSS` — nhưng không có nhãn truy vết nào.

**Sửa đề nghị:** Thêm tag vào tên `describe`:

```typescript
// Trước:
describe('Game Canvas — Tiền điều kiện và Cấu trúc', () => {

// Sau:
describe('[UC-GAME-009/MSS] Game Canvas — Tiền điều kiện và Cấu trúc', () => {
```

**File cần sửa:** [`tests/client/game_canvas.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/game_canvas.test.ts)

---

### 🟡 WARN #6 — `session_manager.test.ts` Thiếu Tag 1 Test Case

**Nguồn:** Spec Reviewer  
**Vấn đề:** Test case cuối cùng (dòng ~31) dùng nhãn `[TC-00.1/MSS]` nhưng thiếu tag `[UC-GAME-004/MSS]` — không nhất quán với các test khác trong cùng file.

**Sửa đề nghị:**

```typescript
// Trước (dòng ~31):
it('[TC-00.1/MSS] nhan pong trong an han → phuc hoi Connected', ...

// Sau:
it('[TC-00.1/MSS] [UC-GAME-004/MSS] nhan pong trong an han → phuc hoi Connected', ...
```

**File cần sửa:** [`tests/server/session_manager.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/server/session_manager.test.ts)

---

## Phần III — Điểm Đã Được Chấp Nhận (Không Phải Lỗi)

| Điểm | Lý do chấp nhận |
|:---|:---|
| `BoardCellMesh` và `GameCanvas` không có test render | R3F dùng WebGL — không chạy được trong Node/Vitest. `cellPosition` (pure fn) đã được test đầy đủ. Quyết định kiến trúc đã ghi nhận. |
| `ws` được cài nhưng chưa dùng ở Slice 00 | Đây là **lỗi BLOCKING #1** — cần xóa. |

---

## Phần IV — Bảng LOC Kiểm Kho Chính Thức

| File | LOC | CC max | Trạng thái |
|:---|---:|:---:|:---:|
| `src/domain/board_config.ts` | 64 | 1 | ✅ |
| `src/server/session_manager.ts` | 72 | 3 | ✅ |
| `src/client/game_canvas.tsx` | 41 | 4 | ✅ |
| `tests/smoke.test.ts` | 8 | 1 | ✅ |
| `tests/domain/board_config.test.ts` | 22 | 1 | ✅ |
| `tests/server/session_manager.test.ts` | 39 | 2 | ✅ |
| `tests/server/delta_sync.test.ts` | 39 | 1 | ✅ |
| `tests/client/game_canvas.test.ts` | 33 | 2 | ✅ |
| `tests/integration/walking_skeleton.test.ts` | 69 | 2 | ✅ |
| **TỔNG (src/ only)** | **177 / 400** | **max 4** | ✅ |
| **TỔNG (toàn bộ)** | **387 / 400** | — | ✅ |

---

## Phần V — Phán Quyết & Lộ Trình Tiếp Theo

### 🏛️ PHÁN QUYẾT: **[CONDITIONAL REJECTED]**

```
Spec Reviewer:  CONDITIONALLY APPROVED
Code Reviewer:  REJECTED (2 Slop violations)
Tổng hợp:       CONDITIONAL REJECTED
```

### Lộ Trình Đạt APPROVED

```
Bước 1 (BLOCKING)
  ├── Xóa ws + @types/ws → npm install
  ├── Quyết định SessionState.Disconnected (xóa hoặc gán + test)
  └── Cập nhật _epic_ledger.md → Done

Bước 2 (WARN — tùy chọn nhưng khuyến nghị)
  ├── Thêm assert BOARD_CONFIG[10/20/30] vào board_config.test.ts
  ├── Thêm [UC-GAME-009/MSS] tag vào game_canvas.test.ts
  └── Thêm [UC-GAME-004/MSS] vào session_manager.test.ts#L31

Bước 3 (Nghiệm thu lại)
  └── Chạy npx vitest run → vẫn 20/20 XANH → [APPROVED]
```

> [!TIP]
> Với lỗi #2 (`SessionState.Disconnected`): nếu bạn dự định dùng state `Disconnected` trong FSM của Slice 01 (ví dụ: để log lý do ngắt kết nối trước khi xóa session), hãy chọn **Lựa chọn B** — gán state trước khi delete và thêm 1 test mới. Ngược lại, xóa thẳng cho gọn.
