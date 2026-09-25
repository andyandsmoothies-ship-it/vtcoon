# Kế Hoạch Triển Khai (REV 2): IMP-192A - Cải Cách Trạm Kiểm Toán & Chống Camping (Anti-Camping Audit & Dynamic Bailout)

> **Mã Lát Cắt**: `IMP-192A` (Lát cắt 1 trong bộ 3 lát cắt phân rã từ IMP-192)  
> **Phạm Vi Kiến Trúc**: Domain Property Rent Settlement, Server Audit Manager, Server Turn Loop, Room Manager Delegation  
> **Mục Tiêu**: 
> 1. Miễn thu tiền thuê đất khi chủ sở hữu đang thụ án tại Trạm Kiểm Toán (`owner.auditTurnsLeft > 0`).
> 2. Phí bảo lãnh động 10% Net Worth nộp Kho Bạc cả khi bảo lãnh chủ động (`handleBailOut`) VÀ khi mãn hạn tù tự nhiên (`handleAuditTurnTransition`).  
> **Quy Trình Áp Dụng**: 🚦 [KÍCH HOẠT QUY TRÌNH 3 TRẠM] (Tier 2 Full Rigor)

---

## I. KIẾN TRÚC LUỒNG DỮ LIỆU & QUAN HỆ CÁC TỆP

```
[Người chơi dẫm vào ô đất]
   │
   ▼
[src/domain/property_manager.ts#handleLanding]
   ├──► Kiểm tra: (owner.auditTurnsLeft ?? 0) > 0 || owner.inAudit === true?
   │      ├── ĐÚNG ──► return { result: RentPaid, rentAmount: 0 } (Miễn 100% tiền thuê)
   │      └── SAI  ──► Tiếp tục tính toán tiền thuê bình thường (resolveRent)
   │
[TRƯỜNG HỢP 1: Bảo Lãnh Chủ Động - INTENT_BAIL_OUT]
   │
   ▼
[src/server/room_manager.ts#handleBailOut]
   │ Trích xuất từ RoomManager: this.registries.get(roomCode), this.propertyStates.get(roomCode)
   ▼
[src/server/audit_manager.ts#handleBailOut]
   ├──► netWorth = calculateNetWorth(playerId, registry, stateMap, room.players)
   ├──► bailAmount = Math.max(500, Math.floor(netWorth * 0.10))
   ├──► Đủ tiền: balance -= bailAmount; room.treasury += bailAmount; auditTurnsLeft = 0; inAudit = false;
   └──► Thiếu tiền: return { success: false, reason: INSUFFICIENT_FUNDS }

[TRƯỜNG HỢP 2: Mãn Hạn Tù Tự Nhiên - Hết 3 Lượt]
   │
   ▼
[src/server/turn_loop.ts#executeTurnEnd]
   │ (Đã có sẵn registry, stateMap trong scope executeTurnEnd)
   ▼
[src/server/audit_manager.ts#handleAuditTurnTransition]
   ├──► player.auditTurnsLeft -= 1
   └──► Khi auditTurnsLeft === 0:
        ├── netWorth = calculateNetWorth(playerId, registry, stateMap, room.players)
        ├── penaltyAmount = Math.max(500, Math.floor(netWorth * 0.10))
        ├── player.balance -= penaltyAmount; room.treasury += penaltyAmount;
        └── Nếu balance < 0: checkInsolvency(room) (đã có sẵn trong turn_loop.ts)
```

---

## II. ĐỐI SOÁT MÃ NGUỒN VẬT LÝ CHO 2 ĐIỂM PHẢN BIỆN (SCOUT AUDIT FINDINGS)

### 1. Đồng bộ `handleAuditTurnTransition` (Triệt tiêu Perverse Incentive)
- **Mã nguồn thực tế ([`src/server/audit_manager.ts#L111-L119`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/audit_manager.ts#L111-L119))**:
  ```ts
  export function handleAuditTurnTransition(
    room: Room,
    player: Player,
    registry?: PropertyRegistry,
    stateMap?: PropertyStateMap,
  ): void {
    if (player.auditTurnsLeft > 0) {
      player.auditTurnsLeft -= 1;
      if (player.auditTurnsLeft === 0) {
        const netWorth = (registry && stateMap)
          ? calculateNetWorth(player.id, registry, stateMap, room.players)
          : player.balance;
        const penaltyAmount = Math.max(500, Math.floor(netWorth * 0.10));
        player.balance -= penaltyAmount;
        room.treasury = (room.treasury ?? 0) + penaltyAmount;
      }
    }
  }
  ```
- **Call-site tại `turn_loop.ts#L202`**:
  Hàm `executeTurnEnd` đã nhận sẵn `registry?: PropertyRegistry` và `stateMap?: PropertyStateMap` tại dòng 171-172. Ta chỉ cần truyền tiếp vào:
  ```ts
  handleAuditTurnTransition(room, current, registry, stateMap);
  ```
  *(Tương thích 100% với các test cũ nhờ tham số optional).*

### 2. Nguồn dữ liệu `registry` và `propertyStates` trong `RoomManager`
- **Mã nguồn thực tế ([`src/server/room_manager.ts#L61-L62`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts#L61-L62))**:
  ```ts
  private readonly registries = new Map<string, PropertyRegistry>();
  private readonly propertyStates = new Map<string, PropertyStateMap>();
  ```
- `registries` và `propertyStates` là các private member fields lưu trữ toàn bộ dữ liệu bàn cờ theo từng `roomCode`.
- Tại [`src/server/room_manager.ts#L122-124`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts#L122-124):
  ```ts
  handleBailOut(roomCode: string, playerId: string): { success: boolean; reason?: string } {
    return handleBailOut(
      this.rooms.get(roomCode),
      playerId,
      Boolean(this.rolledThisTurn.get(roomCode)),
      this.registries.get(roomCode),
      this.propertyStates.get(roomCode),
    );
  }
  ```
  -> **Xác nhận**: Thực sự chỉ thay đổi 1 dòng cuộc gọi nội bộ, KHÔNG thay đổi signature public của `RoomManager.handleBailOut(roomCode, playerId)`, 0 rủi ro cascade!

---

## III. DANH MỤC 6 CHẾ ĐỘ THẤT BẠI CẦN CÔNG PHÁ (FAILURE MODES ENUMERATION)

1. **Failure Mode 1 (Rò rỉ tiền thuê khi đang ngồi tù)**:
   - Chủ đất đang có `auditTurnsLeft > 0`, đối thủ dẫm vào ô đất của chủ đất vẫn bị trừ tiền thuê.
   - *Phòng thủ*: Guard tại `property_manager.ts#handleLanding` trả về `LandingResult.RentPaid` với `rentAmount: 0`.
2. **Failure Mode 2 (Không phục hồi tiền thuê khi đã ra tù)**:
   - Chủ đất đã hết án (`auditTurnsLeft = 0` và `inAudit = false`), nhưng hệ thống vẫn miễn tiền thuê.
   - *Phòng thủ*: Điều kiện kiểm tra tường minh `(owner.auditTurnsLeft ?? 0) > 0 || owner.inAudit`.
3. **Failure Mode 3 (Bảo lãnh chủ động giá bèo cho tài phiệt)**:
   - Người chơi có Net Worth 10.000 Tr. nhưng chỉ phải trả 500 Tr. khi gọi `handleBailOut`.
   - *Phòng thủ*: `calculateNetWorth` tính đúng 1.000 Tr., trừ đủ tiền của người chơi.
4. **Failure Mode 4 (Chờ hết hạn để trốn phí - Perverse Incentive)**:
   - Người chơi có Net Worth 20.000 Tr. không nộp bảo lãnh chủ động, đợi hết 3 vòng để chỉ bị trừ 500 Tr.
   - *Phòng thủ*: `handleAuditTurnTransition` tính đúng 2.000 Tr. (10% Net Worth) khi `auditTurnsLeft === 0`.
5. **Failure Mode 5 (Kho Bạc bị thất thoát tiền phạt/bảo lãnh)**:
   - Người chơi bị trừ tiền nhưng `room.treasury` không được cộng tương ứng.
   - *Phòng thủ*: Hạch toán `room.treasury = (room.treasury ?? 0) + amount` ở cả 2 luồng.
6. **Failure Mode 6 (Âm tiền khi mãn hạn tù tự nhiên)**:
   - Khi hết 3 vòng, số dư không đủ trả 10% Net Worth.
   - *Phòng thủ*: Số dư bị âm và `turn_loop.ts#L203-207` ngay lập tức kích hoạt `checkInsolvency(room)` giải quyết nợ.

---

## IV. NGÂN SÁCH DÒNG MÃ (LOC BUDGETS & ANTI-SLOP)

Theo quy định `GEMINI.md` mới nhất:
- **TIER 1 (Domain Logic / FSM / Server)**: Max 400 LOC (cảnh báo 300 LOC, hard error 550 LOC).
- **Hàm**: Max 30 LOC, Cyclomatic Complexity <= 5.

### Bảng tính Pre-Coding Delta LOC:
| Tệp Mục Tiêu | Tier | LOC Hiện Tại | Delta Dự Kiến | LOC Sau Chỉnh Sửa | Trạng Thái Ngân Sách |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/domain/property_manager.ts` | Tier 1 | 135 | +6 | **141** | An toàn (< 300 LOC) |
| `src/server/audit_manager.ts` | Tier 1 | 121 | +24 | **145** | An toàn (< 300 LOC) |
| `src/server/turn_loop.ts` | Tier 1 | 252 | 0 (sửa 1 dòng L202) | **252** | An toàn (< 300 LOC) |
| `src/server/room_manager.ts` | Tier 1 | 516 | 0 (sửa 1 dòng L123) | **516** | Giữ nguyên (< 550 LOC) |
| `tests/contracts/imp192a_anti_camping_audit.test.ts` | Test | 0 | +240 | **240** | An toàn (< 300 LOC) |

---

## V. SỔ NỢ KỸ THUẬT (TECH DEBT LEDGER)

- **DEBT-192A-01**: `calculateNetWorth` hiện tại chỉ tính tiền mặt + giá trị BĐS nâng cấp - khoản vay thế chấp. Khi `IMP-192C` đưa vào Trái Phiếu Doanh Nghiệp, `calculateNetWorth` cần được bổ sung đối ứng nợ trái phiếu để phản ánh chính xác Net Worth của người chơi. (Sẽ xử lý trong slice `IMP-192C`).

---

## VI. CÁC BƯỚC THỰC HIỆN TUẦN TỰ (STATION PIPELINE)

### Trạm 1: Station 1 (QA RED - Adversarial TDD)
- Viết tệp hợp đồng kiểm thử `tests/contracts/imp192a_anti_camping_audit.test.ts` (>= 15 atomic tests, 1-4 asserts/test, zero loops trong `it()`).
- Kiểm thử toàn diện 6 Failure Modes. Chạy test và chứng minh **RED (Inversion Gate)**.

### Trạm 2: Station 2 (GREEN - Minimum Implementation)
- Cập nhật `src/domain/property_manager.ts#handleLanding`: bổ sung guard miễn tiền thuê khi chủ đất đang ngồi tù.
- Cập nhật `src/server/audit_manager.ts`: 
  - `handleBailOut`: tính phí 10% Net Worth (sàn 500), nộp Kho Bạc.
  - `handleAuditTurnTransition`: tính phạt 10% Net Worth (sàn 500) khi `auditTurnsLeft === 0`, nộp Kho Bạc.
- Cập nhật `src/server/turn_loop.ts#L202`: truyền `registry, stateMap` vào `handleAuditTurnTransition`.
- Cập nhật `src/server/room_manager.ts#L123`: truyền `this.registries.get(roomCode), this.propertyStates.get(roomCode)` vào `handleBailOut`.
- Chạy test và chứng minh **100% GREEN**.

### Trạm 2.5: Station 2.5 (Sweeping Scout Audit)
- Quét toàn bộ tệp thay đổi xác thực không có rò rỉ state, không có dirty casts, tuân thủ LOC ceilings.

### Trạm 3: Station 3 (Independent Sign-off)
- `spec-reviewer` và `code-reviewer` thẩm định đối soát đĩa vật lý và ký duyệt hoàn tất.
