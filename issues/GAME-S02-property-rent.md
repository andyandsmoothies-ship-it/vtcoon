# GAME-S02: Bất Động Sản Đất Nền & Thu Tiền Thuê Cơ Bản

## Slice 02: UC-GAME-020/027/028 — Mua Đất Nền Cấp 0 & Thu Phí Dừng Chân

- **Use Case Ref:** UC-GAME-020 (Mua BĐS), UC-GAME-027 (Thu Phí Dừng Chân), UC-GAME-028 (Kiểm Tra Quyền Sở Hữu)
- **Traceability Chain:** Requirement → Epic Gameplay → Slice 02 → [TC-02.1/MSS], [TC-02.2/MSS]
- **Flow Paths:** Kịch bản Thành Công Chính (MSS) — chỉ 2 luồng:
  1. Người chơi dừng tại ô tài sản chưa có chủ → mua đất nền Cấp 0 với giá niêm yết.
  2. Đối thủ dừng tại ô đất đã có chủ → tự động thu phí Cấp 0 (% giá đất gốc).
- **Value Delivered:** Người chơi sở hữu tài sản và nhận dòng tiền thuê đều đặn từ đối thủ dẫm vào đất Cấp 0.
- **Lifecycle Status:** Prepared (Chờ Duyệt Phạm Vi)

---

## Điều Kiện Tiên Quyết

- Slice 01 hoàn tất: FSM Turn Loop hoạt động, `handleRollDice` di chuyển quân cờ chính xác.
- Người chơi có `balance` ≥ giá mua đất niêm yết.
- Quân cờ dừng tại ô có `CellType.Property`, `CellType.Railroad`, hoặc `CellType.Utility`.

## Cam Kết Đầu Ra

- **Thành công:**
  - Quyền sở hữu (`ownerId`) được gán cho người mua.
  - `balance` người mua giảm đúng bằng giá niêm yết từ `entity_model.md`.
  - Khi đối thủ dẫm vào: `balance` đối thủ giảm = phí Cấp 0; `balance` chủ tăng tương ứng.
- **Thất bại:**
  - Người chơi không đủ tiền → giao dịch bị hủy, trạng thái không đổi.
  - Người chơi dẫm vào đất của chính mình → không thu phí, bỏ qua.

---

## Phạm Vi Kiến Trúc (Tuân thủ FSM ADR-0001)

```
[room_manager.ts] ──handleRollDice()──→ [property_manager.ts (MỚI)]
       │                                        │
       │                                   handleLanding()
       │                                   ├── có chủ khác? → collectRent() (Tự động)
       │                                   └── ô trống?     → trả về UnownedLand (Chờ quyết định)
       │
       └──buyProperty(roomCode, playerId)──→ buyProperty() (Hành động trực tiếp của người chơi)
                                                │
  [board_config.ts] ← tra CellType         [PROPERTY_REGISTRY]
  [room.ts]         ← Player.balance        ← Map<cellIndex, ownerId>
```

### Tệp bị ảnh hưởng

#### [MỚI] [property_manager.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_manager.ts)
- Chứa `PropertyRegistry` (Map cellIndex → ownerId).
- Hàm `buyProperty(player, cellIndex, price)`: gán ownerId, trừ balance (Hành động người chơi).
- Hàm `collectRent(tenant, owner, rentAmount)`: trừ balance tenant, cộng balance owner (Tự động khi dừng chân).
- Hàm `handleLanding(player, cellIndex, registry, boardConfig)`: điều phối logic dừng chân (thu phí nếu có chủ khác, trả về trạng thái nếu là ô trống).

#### [MODIFY] [room_manager.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts)
- Tích hợp gọi `handleLanding()` trong `handleRollDice()`: tự động thu phí thuê nếu dừng vào đất có chủ khác (không tự động mua đất).
- Thêm phương thức `buyProperty(roomCode, playerId, cellIndex)`: xử lý ý định mua đất nền khi người chơi quyết định mua.
- Thêm `PropertyRegistry` vào trạng thái `Room` hoặc `RoomManager`.

#### [GIỮ NGUYÊN] Các tệp không sửa
- [board_config.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/board_config.ts) — chỉ đọc `CellType` và `BOARD_CONFIG`.
- [room.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts) — chỉ đọc `Player.balance`, `Player.position`.
- [dice.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/dice.ts) — không liên quan.
- [theme.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/theme.ts) — không liên quan.
- [session_manager.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts) — không liên quan.
- [game_canvas.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx) — không liên quan (UI sẽ thi công ở slice riêng nếu cần).

---

## Ngân Sách LOC

| Tệp | Dự tính |
|------|---------|
| `property_manager.ts` (MỚI) | ≤ 50 dòng |
| `room_manager.ts` (sửa) | +10–15 dòng |
| **Tổng delta** | **≤ 65 dòng** (trong ngân sách ≤ 80) |

---

## Bảng Giá Niêm Yết & Phí Cấp 0 (Trích `entity_model.md`)

> Dữ liệu này sẽ được mã hóa thành hằng số static trong `property_manager.ts`.

| Ô | Nhóm | Giá Mua | Phí Cấp 0 |
|---|-------|---------|-----------|
| 01, 03 | Đô thị Nâu | 600 | 60 |
| 06, 08 | Dịch vụ Xanh Da Trời | 1.000 | 120 |
| 09 | Nghỉ dưỡng Xanh Da Trời | 1.200 | 120 |
| 11, 13 | Nghỉ dưỡng Hồng | 1.400 | 140 |
| 14 | Nghỉ dưỡng Hồng | 1.600 | 160 |
| 16, 18 | Nghỉ dưỡng Cam | 1.800 | 180 |
| 19 | Đô thị Cam | 2.000 | 200 |
| 21 | Nghỉ dưỡng Đỏ | 2.200 | 220 |
| 23 | Đô thị Đỏ | 2.200 | 220 |
| 24 | Nghỉ dưỡng Đỏ | 2.400 | 240 |
| 26, 27 | Dịch vụ Vàng | 2.600 | 312 |
| 29 | Nghỉ dưỡng Vàng | 2.800 | 280 |
| 31, 32 | Đô thị Xanh Lá | 3.000 | 300 |
| 34 | Đô thị Xanh Lá | 3.200 | 320 |
| 37 | Đô thị Tím | 3.500 | 350 |
| 39 | Đô thị Tím | 4.000 | 400 |
| 05, 15, 25, 35 | Hạ tầng GT | 2.000 | 500 (cố định, 1 ô) |
| 12, 28 | Tiện ích | 1.500 | 2D6 × 40 |

---

## NGOÀI PHẠM VI (Defer Slice 03+)

> [!CAUTION]
> Các luồng sau **TUYỆT ĐỐI KHÔNG** thi công trong Slice 02:

| Luồng | Lý do hoãn | Slice đích |
|-------|------------|------------|
| Nâng cấp C1-C3 | Cần gom bộ màu, logic phức tạp | Slice 03 |
| Đấu giá khi từ chối mua | Cần hệ thống đấu giá đa người | Slice 03 |
| Phí lũy tiến Railroad (2-4 ô) | Cần đếm tổng hạ tầng sở hữu | Slice 03 |
| Phí biến thiên Utility (2D6 × hệ số) | Cần tung xúc xắc riêng cho phí | Slice 03 |
| Chuyển nhượng P2P (TC-02.3 trong Sổ Cái) | Cần giao diện thương lượng | Slice 03+ |
| Thế chấp BĐS | Cần hệ thống tín dụng | Slice 05 |
| Hiệu ứng thẻ Mùa Du Lịch | Cần Event Card Engine | Slice 04 |

### Xử lý tạm thời Railroad & Utility trong Slice 02

- **Railroad:** Phí cố định **500 Tr. VNĐ** (mặc định sở hữu 1 ô). Lũy tiến sẽ bổ sung ở Slice 03.
- **Utility:** Phí cố định **280 Tr. VNĐ** (giả lập trung bình 2D6=7 × 40). Cơ chế tung xúc xắc sẽ bổ sung ở Slice 03.

---

## Hợp Đồng Kiểm Thử

### `TC-02.1/MSS` — Mua Đất Nền Cấp 0

```
[Kích hoạt] Người chơi A (balance=15.000) dừng tại ô 01 (Cần Thơ, giá=600, chưa có chủ)
            và gửi hành động buyProperty(roomCode, 'A', 1).
[Kỳ vọng]   → ownerId(ô 01) === A.id
             → A.balance === 14.400  (15.000 − 600)
             → Hàm trả về kết quả thành công chứa cellIndex và newBalance.
```

### `TC-02.2/MSS` — Thu Tiền Thuê Cấp 0

```
[Kích hoạt] Ô 01 thuộc sở hữu của A. Người chơi B (balance=15.000) dừng tại ô 01.
[Kỳ vọng]   → B.balance === 14.940  (15.000 − 60)
             → A.balance === A.balance_trước + 60
             → Hàm trả về kết quả chứa rentAmount=60, landlordId=A.id.
```

### `TC-02.3/MSS` — Không Đủ Tiền Mua (Biên Phủ Định)

```
[Kích hoạt] Người chơi C (balance=500) dừng tại ô 01 (giá=600, chưa có chủ)
            và gửi hành động buyProperty(roomCode, 'C', 1).
[Kỳ vọng]   → ownerId(ô 01) === undefined (đất vẫn trống)
             → C.balance === 500  (không đổi)
             → Hàm trả về kết quả thất bại ghi rõ lý do INSUFFICIENT_FUNDS.
```

### `TC-02.4/MSS` — Dẫm Vào Đất Của Chính Mình

```
[Kích hoạt] Ô 01 thuộc sở hữu của A. Người chơi A dừng tại ô 01.
[Kỳ vọng]   → A.balance không đổi.
             → Hàm trả về kết quả OWN_PROPERTY, không trừ/cộng tiền.
```

### `TC-02.5/MSS` — Ô Không Phải Tài Sản (Biên Phủ Định)

```
[Kích hoạt] Người chơi A dừng tại ô 00 (Go) hoặc ô 10 (Jail) — CellType không nằm trong
            {Property, Railroad, Utility}.
[Kỳ vọng]   → Không kích hoạt mua hoặc thu thuê.
             → Hàm trả về NOT_PURCHASABLE.
```

---

## Kế Hoạch Kiểm Chứng

### Kiểm thử tự động
```bash
cmd /c "cd /d c:\Users\HP\Documents\GitHub\vtcoon && npx vitest run --reporter=verbose src/domain/property_manager.test.ts"
```

### Kiểm chứng đảo nghịch (Adversarial Inversion)
- Mỗi TC trên phải thất bại khi cố tình bỏ dòng code tương ứng (xóa `balance -= price` → TC-02.1 FAIL).
- Chạy 3 lần đảo nghịch tối thiểu trước khi đánh dấu Verified.

### Kiểm chứng thủ công
- User duyệt phạm vi ticket này trước khi thi công.
