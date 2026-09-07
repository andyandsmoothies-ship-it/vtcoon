# Ticket: GAME-S01 — Sảnh Đấu & Vòng Lặp Lượt Chơi Cơ Bản (MSS Only)

## 1. Thông Tin Định Danh & Phân Lập (Metadata)
- **Mã Ticket:** `issues/GAME-S01-lobby-turn-loop.md`
- **Epic Trực Thuộc:** Gameplay Core (`docs/epics/gameplay/_epic_ledger.md`)
- **Lát Cắt:** Slice 01 — Main Success Scenario (Nguyên tắc Vàng: CHỈ luồng thành công chính)
- **Use Cases Bao Phủ:**
  - `UC-GAME-001`: Tạo Phòng Đấu & Cấp Phát Mã Phòng 6 Ký Tự
  - `UC-GAME-002`: Gia Nhập Phòng Bằng Mã Phòng
  - `UC-GAME-003`: Khởi Động Ván Đấu & Khởi Tạo FSM
  - `UC-GAME-005`: Đổ Xúc Xắc 2D6 Bằng PRNG Máy Chủ
  - `UC-GAME-007`: Di Chuyển Quân Cờ Theo Điểm Xúc Xắc
  - `UC-GAME-008`: Xử Lý Vượt/Dừng Ô GO & Cộng Thưởng
- **Chuỗi Truy Vết (Traceability Chain):** FR-002 -> Epic Gameplay -> Slice 01 -> UC-GAME-001..003, UC-GAME-005, UC-GAME-007..008
- **Trạng Thái Vòng Đời:** Prepared (Chờ duyệt phạm vi trước khi thi công)
- **Ngân Sách Mã Nguồn (LOC Budget):** ≤ 400 dòng cho toàn bộ mã nguồn + bài test của lát cắt

## 2. Mục Tiêu & Giá Trị Nghiệp Vụ (Intent & Value Delivered)
- **Giá Trị Bàn Giao:** Hoàn thiện luồng chơi tối thiểu khép kín — từ tạo phòng đến xoay vòng lượt giữa 2-6 người chơi:
  1. Chủ phòng tạo phòng → Máy chủ trả về mã 6 ký tự.
  2. Người chơi khác gia nhập bằng mã phòng → Máy chủ xác nhận.
  3. Chủ phòng bấm bắt đầu → FSM chuyển sang `WAITING_ROLL` cho người chơi đầu tiên.
  4. Người chơi gửi ý định đổ xúc xắc → PRNG máy chủ sinh kết quả 2D6 → Di chuyển quân cờ đúng số ô.
  5. Nếu quân cờ vượt qua hoặc dừng tại ô GO (index 0) → Cộng +2.000 Tr. VNĐ.
  6. FSM chuyển `TURN_END` → Xoay lượt sang người chơi kế tiếp → Lặp lại từ bước 4.

```
[Tạo phòng] -> [Vào phòng] -> [Bắt đầu ván]
      |
      v
[WAITING_ROLL] -> [ROLLING/MOVING] -> [TILE_RESOLUTION]
      ^                                       |
      |                                       v
[TURN_END] <--------- [Cộng GO nếu vượt] <---+
```

- **Ranh Giới Lát Cắt (Slice Scope Confinement — Chống Slop):**
  - ✅ CHỈ thi công: Sảnh tạo/vào phòng, FSM turn loop cơ bản, đổ xúc xắc 2D6, di chuyển, thưởng ô GO.
  - ❌ TUYỆT ĐỐI CHƯA cài đặt (thuộc Slice 02+):
    - Đổ đôi liên tiếp 3 lần → vào Trạm Kiểm Toán (A#)
    - Đếm ngược thời gian lượt → hết giờ chuyển Bot (A#)
    - Mất kết nối giữa ván → Bot tiếp quản (A#)
    - Mua/bán đất, đấu giá, thu tiền thuê (Slice 02)
    - Nâng cấp công trình, thẻ bài, chứng khoán (Slice 03-04)
    - Thế chấp, phá sản, kết thúc ván (Slice 05)
    - Thuế tài sản lũy tiến tại ô GO (Slice 02+ khi có sở hữu đất)

## 3. Điều Kiện Tiên Quyết & Đảm Bảo Trạng Thái (Preconditions & Guarantees)
- **Điều Kiện Tiên Quyết (Preconditions):**
  - Slice 00 hoàn tất: WebSocket hoạt động, `SessionManager` quản lý phiên, sa bàn 40 ô hiển thị trên `GameCanvas`.
  - Các kiểu dữ liệu hiện hữu được kế thừa nguyên trạng: `BoardCell`, `CellType`, `Session`, `DeltaPayload`.
- **Đảm Bảo Khi Thành Công (Success Guarantees):**
  - Chủ phòng tạo phòng và nhận mã 6 ký tự hợp lệ.
  - Người chơi khác gia nhập bằng mã phòng thành công.
  - Vòng lặp FSM xoay lượt ổn định giữa N người chơi (2 ≤ N ≤ 6).
  - Kết quả 2D6 nằm trong [2..12], quân cờ dịch chuyển đúng số ô trên bàn 40 ô (modulo 40).
  - Tiền thưởng +2.000 Tr. VNĐ được cộng chính xác khi vượt/dừng ô GO.
- **Đảm Bảo Khi Thất Bại (Failure Postconditions):**
  - Mã phòng không hợp lệ → Máy chủ từ chối với mã lỗi rõ ràng, không tạo trạng thái treo.
  - Ý định đổ xúc xắc gửi ngoài lượt → Máy chủ bỏ qua, không thay đổi trạng thái FSM.

## 4. Hợp Đồng Kiểm Thử Nghiệm Thu (Acceptance Test Contracts)

Mỗi hợp đồng ≤ 80 dòng, gắn nhãn truy vết tới Use Case gốc.

| Mã       | Truy Vết          | Kích Hoạt (Trigger)                                                                    | Kết Quả Kỳ Vọng (Observable Outcome)                                                                       |
|----------|--------------------|-----------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| `TC-01.1/MSS` | `UC-GAME-001/MSS`  | Gửi ý định `CREATE_ROOM` qua WebSocket                                                  | Máy chủ trả về đối tượng phòng chứa `roomCode` dài 6 ký tự chữ-số và `hostId` trùng `sessionId` của người gửi |
| `TC-01.2/MSS` | `UC-GAME-002/MSS`  | Gửi ý định `JOIN_ROOM` với `roomCode` hợp lệ từ phiên khác                             | Máy chủ thêm người chơi vào danh sách phòng, phát sự kiện `PLAYER_JOINED` tới tất cả thành viên              |
| `TC-01.3/MSS` | `UC-GAME-005,007/MSS` | Gửi ý định `ROLL_DICE` trong trạng thái FSM `WAITING_ROLL` đúng lượt                   | Máy chủ trả về `diceResult` (2 giá trị, tổng ∈ [2..12]), vị trí mới = `(vị trí cũ + tổng) % 40`            |
| `TC-01.4/MSS` | `UC-GAME-008/MSS`  | Quân cờ ở ô 38, đổ xúc xắc tổng = 4 → vị trí mới = `(38+4) % 40 = 2`                  | Tiền người chơi tăng đúng +2.000 Tr. VNĐ do vượt qua ô GO (index 0)                                        |
| `TC-01.5/MSS` | `UC-GAME-003/MSS`  | Người chơi A kết thúc lượt (FSM → `TURN_END`)                                           | FSM chuyển `currentPlayerIndex` sang người chơi B, trạng thái quay về `WAITING_ROLL`                         |

## 5. Ranh Giới Kiến Trúc & Cấu Trúc Đề Xuất (Architectural Scope)

Kế thừa cấu trúc thư mục và kiểu dữ liệu Slice 00. Không tạo thư mục mới.

| Tầng    | Tệp Đề Xuất                          | Trách Nhiệm                                                       | Phụ Thuộc Hiện Hữu                  |
|---------|---------------------------------------|--------------------------------------------------------------------|--------------------------------------|
| Domain  | `src/domain/room.ts` [MỚI]           | Kiểu `Room`, `Player`, hằng số `GO_BONUS`, enum `TurnPhase`       | `board_config.ts` (kế thừa `BOARD_CONFIG`) |
| Domain  | `src/domain/dice.ts` [MỚI]           | Hàm `rollDice(seed)` → 2D6, PRNG xác định (deterministic seeded)  | Không                                |
| Server  | `src/server/room_manager.ts` [MỚI]   | `createRoom()`, `joinRoom()`, `startGame()`, xoay lượt FSM        | `session_manager.ts`, `room.ts`, `dice.ts` |
| Client  | `src/client/game_canvas.tsx` [SỬA]   | Hiển thị vị trí quân cờ trên sa bàn dựa theo `DeltaPayload` mở rộng | `board_config.ts`                    |

### WebSocket Intent/Event mới (mở rộng giao thức hiện hữu):

| Hướng         | Tên Thông Điệp   | Payload                                      |
|---------------|-------------------|----------------------------------------------|
| Client → Server | `CREATE_ROOM`    | `{}`                                          |
| Server → Client | `ROOM_CREATED`   | `{ roomCode: string, hostId: string }`        |
| Client → Server | `JOIN_ROOM`      | `{ roomCode: string }`                        |
| Server → All    | `PLAYER_JOINED`  | `{ playerId: string, playerCount: number }`   |
| Client → Server | `START_GAME`     | `{}`                                          |
| Server → All    | `GAME_STARTED`   | `{ players: Player[], currentTurn: string }`  |
| Client → Server | `ROLL_DICE`      | `{}`                                          |
| Server → All    | `DICE_ROLLED`    | `{ playerId, dice: [d1, d2], newPosition, passedGo: boolean, balance }` |
| Server → All    | `TURN_CHANGED`   | `{ currentTurn: string, phase: TurnPhase }`   |

## 6. Tiêu Chuẩn Xuất Xưởng (Definition of Done)
1. 100% Test Contracts `[TC-01.1..TC-01.5/MSS]` được kiểm chứng bằng bài test tự động có gắn nhãn truy vết tương ứng.
2. Vượt qua Thử thách Đối nghịch (Adversarial Inversion): Cố tình sửa sai logic GO bonus, sai modulo vị trí, sai xoay lượt → bài test chuyển đỏ.
3. Không vi phạm 6 Cờ Đỏ Slop: Không tạo cấu trúc trừu tượng dùng một lần, không thêm thư viện ngoài không cần thiết.
4. Mỗi tệp mới ≤ 100 dòng. Tổng LOC delta (mã nguồn + test) ≤ 400 dòng.
5. Được thẩm định và thông qua bởi hai cổng kiểm duyệt (`spec-reviewer` và `code-reviewer`) trước khi chuyển giao nghiệm thu.
