# BÁO CÁO GIÁM ĐỊNH TẬP TRUNG HỘP ĐEN & PHÂN TÍCH NGUYÊN NHÂN SỰ CỐ TELEMETRY
## VTCOON TELEMETRY FORENSIC AUDIT REPORT

> **Mã Báo Cáo**: `AUDIT-FORENSIC-20260920-01`  
> **Phiên Bản Dự Án**: VTCOON 3D Board Game v1.0-RC  
> **Phòng Đấu (Room Code)**: `VTCOON` | **Seed PRNG**: `12345`  
> **Thời Gian Trích Xuất Hộp Đen**: Epoch `1789873310854` (Vòng 20 / Tick 246)  
> **Trạng Thái Giám Định**: 🔴 **CRITICAL DEFECTS IDENTIFIED & TRACED**  

---

## I. TỔNG QUAN ĐIỀU HÀNH (EXECUTIVE SUMMARY)

Dựa trên dữ liệu viễn trắc hộp đen (`VTCOON_room.json`) và 2 ảnh chụp thực tế màn hình (`media_1789873354368.png`, `media_1789873390686.png`), nhóm kiểm định độc lập đã rà soát toàn diện vòng đời trận đấu từ Tick 0 đến Tick 246. 

Kết quả xác định **2 lỗi logic nghiệp vụ cốt lõi** và **1 điểm nghẽn hiệu năng đồ họa**:

| Mã Sự Cố | Mức Độ | Lĩnh Vực | Hiện Tượng Quan Sát | Nguyên Nhân Cốt Lõi |
| :--- | :--- | :--- | :--- | :--- |
| **DEF-01** | 🔴 **CRITICAL** | `[FSM]`, `[UI]`, `[NET]` | Người chơi bị kẹt tại Ô 10 (Trạm Kiểm Toán). Nút "Đổ Xúc Xắc" bị khóa xám, bấm "Hết Lượt" bị máy chủ ném lỗi `INVALID_PHASE`. | Lệch pha thiết kế giữa Client UI (coi người trong tù phải bấm Hết Lượt) và Server FSM (vẫn đặt pha `WaitingRoll` và từ chối `INTENT_END_TURN` khi chưa đổ xúc xắc). |
| **DEF-02** | 🟠 **CRITICAL** | `[TELEMETRY]`, `[FSM]` | Hộp đen báo động 7 lần vi phạm bất biến liên tiếp (`NEGATIVE_BALANCE_OUTSIDE_INSOLVENCY`) tại Tick 177–183 với số dư -374 Tr. | P1 bị trừ tiền thụ động do Thẻ Thị Trường `MC_FUEL_SURGE` trong lượt của Bot 2. Server không bật `InsolvencyPhase` vì không phải lượt của P1; Telemetry Client bắt lỗi âm tiền ngoài trạng thái phá sản. |
| **PERF-01** | 🟡 **WARNING** | `[3D]`, `[PERF]` | FPS ghi nhận 31.3 FPS; Draw calls lên tới 2.639 lần; RTT Ping 140ms. | Quá nhiều draw calls trên sa bàn 3D (thiếu mesh instancing cho các khối nhà/cây cối/xe cộ đô thị). |

---

## II. CHI TIẾT SỰ CỐ 1: BẤM "HẾT LƯỢT" BÁO `Lỗi máy chủ: INVALID_PHASE` (DEF-01)

### 1. Dấu Vết Thực Tế Từ Hộp Đen (Forensic Evidence)

- **Ảnh chụp màn hình**: [`media_1789873390686.png`](file:///c:/Users/HP/.gemini/antigravity/brain/9712aca6-8125-42ae-b3ce-05d065c3f4e0/.user_uploaded/media_1789873390686.png)
  - Badge lượt đấu: Đại Gia Chủ Sảnh (`p1`) đang giữ lượt (`LƯỢT`).
  - Tiền mặt: `3.522 Tr.`, Tài sản ròng: `20.622 Tr.`
  - Vị trí: Đang đứng tại **Ô 10 (Trạm Kiểm Toán)** với `auditTurnsLeft: 3`.
  - Thanh ActionDock:
    - Nút **"Đổ Xúc Xắc"**: Bị vô hiệu hóa hoàn toàn (màu xám nhạt `bg-slate-200 text-slate-600 cursor-not-allowed`).
    - Nút **"Bảo Lãnh (500 Tr.)"**: Hiển thị hợp lệ (`inAudit = true`, `balance >= 500`).
    - Nút **"Hết Lượt"**: Sáng xanh (`bg-emerald-600 text-white cursor-pointer`).
  - Toast thông báo lỗi máy chủ màu đỏ trên đỉnh màn hình: **`Lỗi máy chủ: INVALID_PHASE`**.
- **Nhật ký Intent (Recorded Intents)**:
  - `timestamp: 1789873287268` -> `INTENT_END_TURN`
  - `timestamp: 1789873291336` -> `INTENT_END_TURN`
  - `timestamp: 1789873292643` -> `INTENT_END_TURN`
  - `timestamp: 1789873293846` -> `INTENT_END_TURN`
  - `timestamp: 1789873305512` -> `INTENT_END_TURN`
  - Người chơi bấm liên tục 5 lần, toàn bộ đều bị máy chủ từ chối.

### 2. Sơ Đồ Xung Đột Luồng FSM (Flowchart)

```
[BƯỚC 1: SERVER CHUYỂN LƯỢT CHO P1]
Server: executeTurnEnd() chuyển sang nextPlayer = p1 (đang có auditTurnsLeft = 3)
   │
   ├── Thiếu logic kiểm tra nextPlayer.auditTurnsLeft > 0
   └── Gán mặc định: room.phase = TurnPhase.WaitingRoll, rolledThisTurn = false
   
[BƯỚC 2: CLIENT RENDER GIAO DIỆN THEO IMP-79]
Client nhận State Delta: p1.inAudit = true, turnPhase = 'WaitingRoll'
   │
   ├── isRollActionDisabled(): Boolean(params.inAudit) === true  ──> KHÓA NÚT "ĐỔ XÚC XẮC"
   └── isEndTurnDisabled(): if (params.inAudit) return false    ──> MỞ NÚT "HẾT LƯỢT"
   
[BƯỚC 3: NGƯỜI CHƠI THAO TÁC]
Người chơi không thể đổ xúc xắc (nút bị xám), thấy nút "Hết Lượt" màu xanh nên bấm "Hết Lượt".
Client dispatch: { type: 'INTENT_END_TURN' } lên WebSocket Server.

[BƯỚC 4: SERVER TỪ CHỐI INTENT VÀ NÉM LỖI]
Server intent_dispatcher.ts gọi m.handleEndTurn(rc, p):
   │
   ├── turn_loop.ts dòng 169: 
   │     if (!rolledThisTurn && room.phase === TurnPhase.WaitingRoll) return undefined;
   │
   └── intent_dispatcher.ts dòng 71:
         return { success: false, reason: 'INVALID_PHASE' };
         
[KẾT QUẢ]: Toast hiển thị "Lỗi máy chủ: INVALID_PHASE". Người chơi rơi vào bẫy Deadlock!
```

### 3. Tọa Độ Mã Nguồn Gây Lỗi (Code Coordinates)

1. **Điểm đứt gãy 1 (Server FSM Phase Assignment)**:
   - Tệp: [`src/server/turn_loop.ts:228-236`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/turn_loop.ts#L228-L236)
   - Hiện trạng:
     ```typescript
     const nextPlayer = room.players[room.currentPlayerIndex];
     if (nextPlayer?.skipNextTurn) {
       nextPlayer.skipNextTurn = false;
       room.phase = TurnPhase.PropertyManagement;
     } else {
       room.phase = TurnPhase.WaitingRoll; // <-- Bug: Bỏ quên trường hợp nextPlayer.auditTurnsLeft > 0
     }
     rolledThisTurnMap.set(roomCode, false);
     ```
2. **Điểm đứt gãy 2 (Server Turn End Guard)**:
   - Tệp: [`src/server/turn_loop.ts:169`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/turn_loop.ts#L169)
   - Hiện trạng:
     ```typescript
     if (!rolledThisTurn && room.phase === TurnPhase.WaitingRoll) return undefined;
     ```
   - Chặn tuyệt đối `INTENT_END_TURN` khi đang ở `WaitingRoll` mà chưa đổ xúc xắc, bất chấp người chơi đang bị giam giữ thụ án.
3. **Điểm đứt gãy 3 (Client UI Locking)**:
   - Tệp: [`src/client/ui/ui_helpers.ts:111,133`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/ui_helpers.ts#L111)
   - Hiện trạng: `isRollActionDisabled` khóa nút đổ xúc xắc dựa vào `Boolean(params.inAudit)`, trong khi Server gốc tại [`audit_manager.ts:66-77`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/audit_manager.ts#L66-L77) thiết kế cho phép gieo xúc xắc tìm mặt đôi.

---

## III. CHI TIẾT SỰ CỐ 2: VI PHẠM BẤT BIẾN `NEGATIVE_BALANCE_OUTSIDE_INSOLVENCY` (DEF-02)

### 1. Dấu Vết Thực Tế Từ Hộp Đen (Forensic Evidence)

- **Ảnh chụp màn hình**: [`media_1789873354368.png`](file:///c:/Users/HP/.gemini/antigravity/brain/9712aca6-8125-42ae-b3ce-05d065c3f4e0/.user_uploaded/media_1789873354368.png)
  - Tab "Bất Biến (7)" của Hộp Đen & Giám Sát Thời Gian Thực.
  - Danh sách vi phạm: 7 cảnh báo `CRITICAL` liên tiếp từ Tick 177 đến Tick 183.
  - Nội dung: *"Người chơi p1 có số dư âm (-374 Tr) ngoài trạng thái vỡ nợ."*
  - Payload chi tiết: `{"playerId": "p1", "balance": -374}`.
- **Tiến trình tài chính**:
  - `Tick 174`: `p1` nâng cấp Ô 9 -> số dư còn `2.166 Tr.`
  - `Tick 175`: `p1` nâng cấp Ô 6 -> số dư còn `1.326 Tr.`
  - `Tick 176`: `p1` kết thúc lượt với số dư `626 Tr.`
  - `Tick 177`: Thẻ Thị Trường `MC_FUEL_SURGE` kích hoạt (`lastEventCard.id = "MC_FUEL_SURGE"`: *"Phụ thu thêm 500 Tr. cước logistics... và tất cả người chơi lập tức nộp 500 Tr. phụ phí"*).
  - Khấu trừ toàn bàn khiến số dư của `p1` giảm xuống `-374 Tr.`

### 2. Nguyên Nhân Kỹ Thuật (Root Cause)

1. **Trừ tiền thụ động toàn bàn cờ (Passive Deduction)**:
   - Hàm [`distributeCellPool`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/market_card_handlers.ts#L147-L167) trong `market_card_handlers.ts` duyệt qua toàn bộ người chơi:
     ```typescript
     for (const p of players) p.balance -= perPlayerFee;
     ```
   - Lệnh này khấu trừ tiền của người chơi thụ động (không phải người đang giữ lượt xúc xắc) và hoàn toàn **không gọi `checkInsolvency(room)`**.
2. **FSM Server chỉ kiểm tra vỡ nợ cho Turn Player**:
   - Hàm [`checkInsolvency`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/insolvency_manager.ts#L11-L21):
     ```typescript
     export function checkInsolvency(room: Room): void {
       const player = room.players[room.currentPlayerIndex];
       if (!player || player.balance >= 0) return;
       room.phase = TurnPhase.InsolvencyPhase;
     }
     ```
   - Tại Tick 177, người giữ lượt là Bot 2 (`bot_2` có số dư dương). Do đó FSM Server **không chuyển sang `TurnPhase.InsolvencyPhase`**.
3. **Báo động giả từ Invariant Watchdog Client (False Positive)**:
   - Hàm [`verifyNonNegativeBalance`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/telemetry/invariant_checker.ts#L86-L115) kiểm tra:
     ```typescript
     const isExempt = Boolean(
       p.bankrupt || params.isInInsolvency || (p.overdraftRoundsLeft !== undefined && p.overdraftRoundsLeft > 0)
     );
     ```
   - Biến `isInInsolvency` chỉ đọc từ `delta.turnPhase === TurnPhase.InsolvencyPhase || postState.activeModal === 'insolvency'`.
   - Vì `p1` bị âm tiền thụ động trong lượt của Bot 2 nên `isInInsolvency` là `false`. Kết quả: Telemetry bắn liên tiếp 7 cảnh báo đỏ `NEGATIVE_BALANCE_OUTSIDE_INSOLVENCY` (Tick 177 đến 183) cho đến khi `p1` thu được tiền thuê từ người chơi khác kéo số dư dương trở lại ở Tick 184 (`balance: 2.354 Tr.`).

---

## IV. KIỂM TOÁN CHỈ SỐ ĐỒ HỌA & MẠNG (METRICS AUDIT - PERF-01)

| Chỉ Số Đo Đạc | Giá Trị Thực Tế | Ngưỡng Tiêu Chuẩn NFR | Đánh Giá Kỹ Thuật |
| :--- | :--- | :--- | :--- |
| **FPS** | **31.3 FPS** | $\ge$ 60 FPS | 🟡 Cận dưới mức chấp nhận được trên thiết bị di động / GPU onboard. |
| **Draw Calls** | **2.639 calls** | $\le$ 500 calls | 🔴 **Rất cao**. Sa bàn đang bị phân mảnh lệnh vẽ do các mô hình nhà, cây cối, xe cộ dựng độc lập chưa được gom Instanced Mesh. |
| **Triangles** | **316.773** | $\le$ 500.000 | 🟢 Nằm an toàn trong ngân sách hình học 3D. |
| **Ping RTT** | **140 ms** | $\le$ 200 ms | 🟢 Kết nối WebSocket duy trì ổn định. |
| **Sparse Delta** | **973 bytes** | $\le$ 10.240 bytes (10KB) | 🟢 Xuất sắc. Payload delta nén cực mỏng (<1KB/tick). |

---

## V. MA TRẬN GIẢI PHÁP & KẾ HOẠCH KHẮC PHỤC (REMEDIATION PLAN)

### 1. Khắc Phục Triệt Để Lỗi Kẹt `INVALID_PHASE` (DEF-01)

- **Nguyên tắc FSM**: Đảm bảo tính nhất quán tuyệt đối giữa Server và Client khi xử lý Trạm Kiểm Toán.
- **Giải pháp Server (`src/server/turn_loop.ts`)**:
  1. Trong `executeTurnEnd`, khi gán lượt cho `nextPlayer`: nếu `(nextPlayer.auditTurnsLeft ?? 0) > 0`, đặt `room.phase = TurnPhase.PropertyManagement;` (cho phép người thụ án quản lý tài sản, nộp bảo lãnh hoặc bấm hết lượt trừ vòng mà không cần gieo xúc xắc).
  2. Tại điều kiện kiểm tra kết thúc lượt dòng 169: Miễn trừ điều kiện `rolledThisTurn` nếu người chơi đang trong tình trạng kiểm toán:
     ```typescript
     if (!rolledThisTurn && room.phase === TurnPhase.WaitingRoll && (current.auditTurnsLeft ?? 0) <= 0) {
       return undefined;
     }
     ```
- **Giải pháp Client (`src/client/ui/ui_helpers.ts` & `action_dock.tsx`)**:
  - Đồng bộ nhãn nút: Khi `turnPhase === 'PropertyManagement'` và `inAudit === true`, nút Hết Lượt hiển thị nhãn `"Chấp Hành Án (Còn X lượt)"` để giải thích trực quan cho người chơi.

### 2. Khắc Phục Báo Động Giả `NEGATIVE_BALANCE_OUTSIDE_INSOLVENCY` (DEF-02)

- **Nguyên tắc Bất Biến**: Phân biệt rạch ròi giữa *Nợ Chủ Động (Active Debt)* và *Nợ Thụ Động (Passive Debt)*.
- **Giải pháp Telemetry Hook (`src/client/telemetry/telemetry_delta_hook.ts`)**:
  - Tại dòng 351, bổ sung cơ chế nhận diện người nợ ngoài lượt:
    ```typescript
    const isPassiveDebt = (p: PlayerHudInfo) => p.id !== delta.currentTurnPlayerId && p.balance < 0;
    ```
  - Miễn trừ vi phạm `NEGATIVE_BALANCE_OUTSIDE_INSOLVENCY` cho người chơi bị nợ thụ động khi chưa tới lượt của họ.
- **Giải pháp Server (`src/server/turn_loop.ts`)**:
  - Khi `executeTurnEnd` chuyển lượt sang `nextPlayer`: nếu `nextPlayer.balance < 0`, tự động đưa phòng vào `TurnPhase.InsolvencyPhase` để người chơi mở ngay modal Portfolio xử lý cứu nợ trước khi thực hiện bất kỳ hành động nào.

### 3. Kế Hoạch Kiểm Thử Tự Động (Universal 4-Facet Test Suite)

Tạo bộ test hợp đồng độc lập `tests/contracts/imp133_audit_phase_and_passive_debt_resilience.test.ts` gồm tối thiểu 16 atomic tests kiểm chứng 4 góc độ:
1. **Facet 1 (Boundary)**: Chuyển lượt sang người chơi có `auditTurnsLeft` từ 3 về 0; nộp phạt cưỡng chế 500 Tr. khi hết hạn.
2. **Facet 2 (Reactivity)**: Bấm `INTENT_END_TURN` thành công ngay lập tức khi đang ở Trạm Kiểm Toán mà không văng lỗi `INVALID_PHASE`.
3. **Facet 3 (Liquidity & Recovery)**: Người chơi nợ thụ động ngoài lượt không bị ném ngoại lệ; tự động kích hoạt `InsolvencyPhase` ngay khi bước vào lượt của mình.
4. **Facet 4 (Error Defense)**: Chặn người chơi âm tiền gieo xúc xắc hoặc mua đất; Telemetry Invariant không báo động giả.

---

*Báo cáo được khởi tạo tự động bởi Hệ Thống Giám Định VTCOON Telemetry Forensic Engine.*  
*Tài liệu đối soát kiến trúc: [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) (Gotcha #106).*
