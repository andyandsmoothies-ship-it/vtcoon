# GAME-S03: Nâng Cấp Công Trình C1-C3, Đấu Giá & Tiện Ích Đặc Biệt

## Slice 03: UC-GAME-021/022/023/024/025/026/030/031/032/033/034/035/036/037 — Nâng Cấp, Đấu Giá & Phí Đặc Biệt

- **Use Case Ref:** UC-GAME-021 (Nâng cấp C1), UC-GAME-022 (Nâng cấp C2), UC-GAME-023 (Nâng cấp C3), UC-GAME-024 (Kiểm tra bộ màu), UC-GAME-025 (Nâng cấp ETC), UC-GAME-026 (Nâng cấp Utility Full), UC-GAME-030 (Đấu giá tự động), UC-GAME-031 (Phí lũy tiến Railroad), UC-GAME-032 (Phí biến thiên Utility), UC-GAME-033 (Thanh lý công trình), UC-GAME-034 (Tích hợp ACTION_PHASE), UC-GAME-035 (AUCTION_PHASE), UC-GAME-036 (PROPERTY_MANAGEMENT), UC-GAME-037 (Phí thuê theo cấp)
- **Traceability Chain:** Requirement → Epic Gameplay → Slice 03 → [TC-03.1/MSS], [TC-03.2/MSS], [TC-03.3/MSS], [TC-03.4/MSS], [TC-03.5/MSS]
- **Flow Paths:** Kịch bản Thành Công Chính (MSS) — 4 luồng:
  1. Sau TILE_RESOLUTION, FSM chuyển sang ACTION_PHASE → Người chơi gửi Intent mua hoặc từ chối → Nếu từ chối: AUCTION_PHASE tự động.
  2. Trong PROPERTY_MANAGEMENT → Người chơi gửi Intent nâng cấp BĐS (C1→C2→C3) khi sở hữu trọn bộ màu.
  3. Đối thủ dừng tại ô Railroad/Utility → Tính phí lũy tiến hoặc biến thiên theo 2D6.
  4. Thanh lý công trình về Cấp 0 trước khi chuyển nhượng.
- **Value Delivered:** Vòng đời tài sản chuyên sâu: nâng cấp khi đủ bộ màu, đấu giá khi từ chối mua, phí đặc biệt cho Hạ tầng/Tiện ích.
- **Lifecycle Status:** Prepared (Chờ Duyệt Phạm Vi)

---

## Nợ Kỹ Thuật Kế Thừa Từ Slice 02

> 3 hạng mục defer từ [biên bản nghiệm thu S02](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/audits/GAME-S02-property-rent_acceptance_report.md) L130-137:

| # | Vấn đề defer | Cách xử lý trong Slice 03 |
|---|-------------|---------------------------|
| 1 | `handleRollDice()` chuyển lượt ngay, không dừng ACTION_PHASE | Tái cấu trúc FSM: TILE_RESOLUTION → ACTION_PHASE (chờ Intent) → PROPERTY_MANAGEMENT → BANKRUPTCY_CHECK → TURN_END |
| 2 | Railroad phí cố định 500 (tạm thời 1 ô) | Triển khai phí lũy tiến: 1 ô=500, 2 ô=1.000, 3 ô=2.000, 4 ô=4.000. Nâng cấp ETC +50% |
| 3 | Utility phí cố định 280 (tạm thời) | Triển khai phí biến thiên: 1 ô=2D6×40, 2 ô=2D6×100. Nâng cấp Full=2D6×150 |

---

## Điều Kiện Tiên Quyết

- Slice 02 hoàn tất: `buyProperty()`, `handleLanding()`, `PropertyRegistry` hoạt động, 69 tests PASS.
- Dữ liệu `PROPERTY_DEEDS` đã có `price` và `rent0` cho 28 ô tài sản.
- Enum `TurnPhase` đã có `WaitingRoll`.
- Enum `CellType` đã có `Property`, `Railroad`, `Utility`.

## Cam Kết Đầu Ra

- **Thành công:**
  - FSM dừng tại ACTION_PHASE sau TILE_RESOLUTION, chờ Intent từ người chơi.
  - Khi từ chối mua: AUCTION_PHASE mở phiên 15s, giá khởi điểm 50% niêm yết, bước giá 100 Tr, `bidAmount ≤ player.balance`.
  - Nâng cấp C1-C3: Chỉ khi sở hữu trọn bộ màu, trừ chi phí theo `entity_model.md`, cập nhật cấp độ và phí thuê.
  - Railroad: Phí lũy tiến theo số ô sở hữu. ETC: `baseFee × 1.5` khi sở hữu ≥2 ô và chi 1.500/ô.
  - Utility: Phí = điểm 2D6 × hệ số (40/100/150 tùy số ô và nâng cấp).
- **Thất bại:**
  - Nâng cấp khi thiếu bộ màu → từ chối, trạng thái không đổi.
  - Nâng cấp khi không đủ tiền → từ chối, trạng thái không đổi.
  - Đấu giá không ai tham gia → ô đất giữ nguyên vô chủ.
  - Nâng cấp ETC khi sở hữu <2 ô Railroad → từ chối.

---

## Bảng Ánh Xạ Intent → Action (Tuân thủ ADR-0001)

| Intent | Phase | Hành Động Server |
|--------|-------|-----------------|
| `INTENT_BUY` | ACTION_PHASE | Gọi `buyProperty()`, chuyển PROPERTY_MANAGEMENT |
| `INTENT_DECLINE` | ACTION_PHASE | Mở AUCTION_PHASE 15s |
| `INTENT_BID` | AUCTION_PHASE | Ghi nhận giá đặt, cập nhật highestBid |
| `INTENT_UPGRADE` | PROPERTY_MANAGEMENT | Kiểm tra bộ màu → `upgradeProperty()` |
| `INTENT_UPGRADE_ETC` | PROPERTY_MANAGEMENT | Kiểm tra ≥2 Railroad → `upgradeETC()` |
| `INTENT_UPGRADE_UTILITY` | PROPERTY_MANAGEMENT | `upgradeUtilityFull()` |
| `INTENT_END_TURN` | PROPERTY_MANAGEMENT | Chuyển BANKRUPTCY_CHECK → TURN_END |

---

## Phạm Vi Kiến Trúc (Tuân thủ FSM ADR-0001)

```
[handleRollDice()] ──MOVING──→ [TILE_RESOLUTION]
       │                              │
       │                    ┌─────────┼──────────┐
       │                    │ Ô trống │ Có chủ   │ Đất mình
       ▼                    ▼         ▼          ▼
[ACTION_PHASE]         Chờ Intent  collectRent  OwnProperty
       │               ┌────┴────┐  (tự động)   (bỏ qua)
       │         INTENT_BUY  INTENT_DECLINE          │
       │               │         │                   │
       │          buyProperty  [AUCTION_PHASE]        │
       │               │      ┌──┴──┐                │
       │               │    BID   Hết giờ            │
       ▼               ▼      ▼     ▼                │
[PROPERTY_MANAGEMENT] ◄──────┴─────┴────────────────┘
       │
       ├── INTENT_UPGRADE (C1-C3, cần đủ bộ màu)
       ├── INTENT_UPGRADE_ETC (Railroad ≥2 ô)
       ├── INTENT_UPGRADE_UTILITY (Utility Full)
       │
       ▼
[BANKRUPTCY_CHECK] ──(Dương)──→ [TURN_END] → Chuyển lượt kế tiếp
```

### Tệp bị ảnh hưởng

#### [MODIFY] [board_config.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/board_config.ts)
- Thêm thuộc tính `colorGroup` vào `BoardCell` cho các ô `CellType.Property`.
- Thêm enum `ColorGroup` (Nâu, XanhDaTroi, Hong, Cam, Do, Vang, XanhLa, Tim).

#### [MODIFY] [property_manager.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_manager.ts)
- Mở rộng `PropertyDeed`: Thêm thuộc tính `rent1`, `rent2`, `rent3`, `upgradeCost` (mảng 3 phần tử [C1, C2, C3]).
- Thêm `PropertyState` riêng biệt (Map lưu `level`, `isETC`, `isUpgradedUtility` — tách khỏi static deed data).
- Thêm hàm `hasMonopoly(playerId, cellIndex, registry)`: Kiểm tra sở hữu trọn bộ màu.
- Thêm hàm `upgradeProperty(player, cellIndex, registry, stateMap)`: Nâng cấp C0→C1→C2→C3.
- Thêm hàm `downgradeProperty(cellIndex, stateMap)`: Reset về C0, hoàn tiền 50% chi phí nâng cấp.
- Cập nhật `handleLanding()`: Tính phí theo `level` hiện tại (rent0/1/2/3).
- Thêm hàm `calcRailroadFee(ownerId, registry, stateMap)`: Phí lũy tiến × 1.5 nếu ETC.
- Thêm hàm `calcUtilityFee(ownerId, diceTotal, registry, stateMap)`: 2D6 × hệ số.

#### [MODIFY] [room.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts)
- Mở rộng enum `TurnPhase`: Thêm `ActionPhase`, `AuctionPhase`, `PropertyManagement`, `BankruptcyCheck`.

#### [MODIFY] [room_manager.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts)
- Tái cấu trúc `handleRollDice()`: Dừng tại `ActionPhase` thay vì chuyển lượt ngay.
- Thêm `handlePlayerIntent(roomCode, playerId, intent)`: Điều phối Intent tại ACTION_PHASE.
- Thêm `handleAuctionBid(roomCode, playerId, amount)`: Xử lý đặt giá trong AUCTION_PHASE.
- Thêm `handleUpgrade(roomCode, playerId, cellIndex)`: Xử lý nâng cấp trong PROPERTY_MANAGEMENT.
- Thêm `handleEndTurn(roomCode, playerId)`: BANKRUPTCY_CHECK → TURN_END.

#### [GIỮ NGUYÊN] Các tệp không sửa
- [dice.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/dice.ts) — chỉ đọc `rollDice()` cho Utility fee.
- [theme.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/theme.ts) — không liên quan.
- [session_manager.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts) — không liên quan.
- [game_canvas.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx) — không liên quan.

---

## Ngân Sách LOC

| Tệp | Dự tính |
|------|---------|
| `board_config.ts` (sửa) | +20 dòng (enum ColorGroup + thuộc tính colorGroup trên 22 ô BĐS) |
| `property_manager.ts` (sửa) | +55 dòng (mở rộng deed, upgrade/downgrade, monopoly check, calc fees) |
| `room.ts` (sửa) | +5 dòng (4 TurnPhase mới) |
| `room_manager.ts` (sửa) | +50 dòng (FSM refactor, intent handlers, auction, upgrade) |
| **Tổng delta** | **≤ 130 dòng** (trong ngân sách ≤ 150) |

---

## Bảng Nhóm Màu & Thông Số Nâng Cấp (Trích `entity_model.md`)

### Nhóm Màu (Monopoly Check)

| Nhóm Màu | Ô thuộc nhóm | Loại BĐS |
|-----------|---------------|-----------|
| Nâu | 1, 3 | Đô thị |
| Xanh Da Trời | 6, 8, 9 | Dịch vụ + Nghỉ dưỡng |
| Hồng | 11, 13, 14 | Nghỉ dưỡng |
| Cam | 16, 18, 19 | Nghỉ dưỡng + Đô thị |
| Đỏ | 21, 23, 24 | Nghỉ dưỡng + Đô thị |
| Vàng | 26, 27, 29 | Dịch vụ + Nghỉ dưỡng |
| Xanh Lá | 31, 32, 34 | Đô thị |
| Tím | 37, 39 | Đô thị |

### Biểu Phí Thuê Theo Cấp (% giá đất gốc)

| Loại BĐS | Cấp 0 | Cấp 1 | Cấp 2 | Cấp 3 | Chi phí C1 | Chi phí C2 | Chi phí C3 |
|-----------|-------|-------|-------|-------|------------|------------|------------|
| Đô thị | 10% | 35% | 90% | 220% | 50% giá đất | 75% giá đất | 100% giá đất |
| Dịch vụ & Giải trí | 12% | 40% | 100% | 250% | 50% giá đất | 70% giá đất | 100% giá đất |
| Nghỉ dưỡng | 10% | 30% | 80% | 250% | 45% giá đất | 70% giá đất | 120% giá đất |

### Hạ tầng Giao thông (4 ô: 5, 15, 25, 35)

| Số ô sở hữu | Phí cơ sở | Phí sau ETC (×1.5) |
|-------------|-----------|-------------------|
| 1 ô | 500 | 750 |
| 2 ô | 1.000 | 1.500 |
| 3 ô | 2.000 | 3.000 |
| 4 ô | 4.000 | 6.000 |

- Điều kiện ETC: Sở hữu ≥2 ô. Chi phí: 1.500/ô.

### Tiện Ích Năng Lượng & Số Hóa (2 ô: 12, 28)

| Điều kiện | Công thức phí |
|-----------|--------------|
| 1 ô, chưa nâng cấp | 2D6 × 40 |
| 2 ô, chưa nâng cấp | 2D6 × 100 |
| Nâng cấp Full | 2D6 × 150 |

- Chi phí nâng cấp Full: 1.000/ô.

---

## NGOÀI PHẠM VI (Defer Slice 04+)

> [!CAUTION]
> Các luồng sau **TUYỆT ĐỐI KHÔNG** thi công trong Slice 03:

| Luồng | Lý do hoãn | Slice đích |
|-------|------------|------------|
| Thế chấp BĐS | Cần hệ thống tín dụng ngân hàng | Slice 05 |
| Event Card Engine / Thẻ Mùa Du Lịch | Cần Event Card Engine | Slice 04 |
| Sàn HOSE (Ô 38) | Cần cơ chế đầu tư riêng | Slice 04 |
| Phá sản / Thanh lý cưỡng chế | Cần Insolvency Engine | Slice 05 |
| P2P Trading — giao diện thương lượng 20s | Cần UI thương lượng phức tạp | Slice 04+ |
| BĐS Dịch vụ C2: Phụ phí 1D6 chẵn +200 | Cần cơ chế phụ phí sự kiện | Slice 04 |
| BĐS Dịch vụ C3: Hiệu ứng mất lượt | Cần FSM turn-skip logic | Slice 04 |
| BĐS Nghỉ dưỡng: x2 khi Mùa Du Lịch | Cần Event Card Engine | Slice 04 |

### Xử lý tạm thời BĐS Dịch vụ trong Slice 03

- **Cấp 2:** Áp dụng phí thuê 100% giá đất. Phụ phí 1D6 chẵn +200 sẽ bổ sung ở Slice 04.
- **Cấp 3:** Áp dụng phí thuê 250% giá đất. Hiệu ứng mất lượt sẽ bổ sung ở Slice 04.

### Xử lý tạm thời Thanh lý công trình

- Hàm `downgradeProperty()` sẽ được triển khai như validation function (hoàn tiền 50% chi phí nâng cấp đã đầu tư).
- Chức năng này là precondition cho P2P Trading ở Slice 04+, KHÔNG triển khai giao diện thương lượng P2P.

---

## Hợp Đồng Kiểm Thử

### `TC-03.1/MSS` — FSM ACTION_PHASE → Đấu Giá Tự Động

```
[Kích hoạt] Người chơi A (balance=15.000) đổ xúc xắc, dừng tại ô 03 (An Giang, giá=600, chưa chủ).
            FSM chuyển sang ACTION_PHASE. Người chơi A gửi INTENT_DECLINE.
            Phiên đấu giá mở: Giá khởi điểm=300 (50% × 600), bước giá=100.
            Người chơi B (balance=10.000) gửi INTENT_BID amount=400.
            Người chơi C (balance=500) gửi INTENT_BID amount=500.
            Hết 15s, người trả cao nhất là C (amount=500).
[Kỳ vọng]   → C.balance ≥ 500 (bid ≤ balance) → INTENT_BID của C bị từ chối (500 = balance, hợp lệ biên).
             → Nếu C.balance=500, C thắng → C.balance = 0, ownerId(ô 03) = C.id.
             → Nếu không ai đặt giá → ô 03 giữ nguyên vô chủ.
             → FSM chuyển về PROPERTY_MANAGEMENT → BANKRUPTCY_CHECK → TURN_END.
```

### `TC-03.2/MSS` — Nâng Cấp C1 Khi Đủ Bộ Màu

```
[Kích hoạt] Người chơi A sở hữu toàn bộ nhóm Nâu (ô 01 + ô 03), cả hai ở Cấp 0.
            A.balance = 10.000. A gửi INTENT_UPGRADE cho ô 01 trong PROPERTY_MANAGEMENT.
            Chi phí C1 ô 01 = 300 (50% × 600, theo entity_model.md).
[Kỳ vọng]   → hasMonopoly('A', 1, registry) === true.
             → A.balance === 9.700 (10.000 − 300).
             → PropertyState(ô 01).level === 1.
             → handleLanding tại ô 01 → phí thuê = 210 (rent1 = 35% × 600).
```

### `TC-03.3/MSS` — Phí Lũy Tiến Railroad + ETC

```
[Kích hoạt] Người chơi A sở hữu 2 ô Railroad (ô 05 + ô 15).
            A đã nâng cấp ETC (chi phí = 1.500 × 2 = 3.000, điều kiện ≥2 ô thỏa mãn).
            Người chơi B (balance=8.000) đổ xúc xắc dừng tại ô 05.
[Kỳ vọng]   → Phí cơ sở = 1.000 (sở hữu 2 ô Railroad).
             → Phí sau ETC = 1.000 × 1.5 = 1.500 (KHÔNG PHẢI 1.000 + 500).
             → B.balance === 6.500 (8.000 − 1.500).
             → A.balance === A.balance_trước + 1.500.
```

### `TC-03.4/MSS` — Phí Biến Thiên Utility (2D6 × Hệ Số)

```
[Kích hoạt] Người chơi A sở hữu 1 ô Utility (ô 12 - EVN), chưa nâng cấp.
            Người chơi B (balance=5.000) dừng tại ô 12.
            Hệ thống tung 2D6 cho phí Utility, kết quả = 7.
[Kỳ vọng]   → Phí = 7 × 40 = 280.
             → B.balance === 4.720 (5.000 − 280).
             → A.balance === A.balance_trước + 280.
             
[Kích hoạt bổ sung] A nâng cấp Full (chi phí 1.000), cùng kịch bản dice=7.
[Kỳ vọng]   → Phí = 7 × 150 = 1.050.

[Kích hoạt bổ sung] A sở hữu cả 2 Utility (ô 12 + ô 28), chưa nâng cấp, dice=7.
[Kỳ vọng]   → Phí = 7 × 100 = 700.
```

### `TC-03.5/MSS` — Từ Chối Nâng Cấp Khi Thiếu Bộ Màu (Biên Phủ Định)

```
[Kích hoạt] Người chơi A sở hữu ô 01 (Nâu) nhưng KHÔNG sở hữu ô 03 (Nâu).
            A gửi INTENT_UPGRADE cho ô 01.
[Kỳ vọng]   → hasMonopoly('A', 1, registry) === false.
             → Hàm trả về kết quả thất bại ghi rõ lý do MISSING_MONOPOLY.
             → A.balance không đổi.
             → PropertyState(ô 01).level === 0 (không đổi).
```

---

## Kế Hoạch Kiểm Chứng

### Kiểm thử tự động
```bash
cmd /c "cd /d c:\Users\HP\Documents\GitHub\vtcoon && npx vitest run --reporter=verbose src/domain/property_manager.test.ts src/server/room_manager.test.ts"
```

### Kiểm chứng hồi quy (Regression)
```bash
cmd /c "cd /d c:\Users\HP\Documents\GitHub\vtcoon && npx vitest run --reporter=verbose"
```
- Toàn bộ 69 tests hiện có (Slice 00-02) phải PASS sau khi thi công Slice 03.

### Kiểm chứng đảo nghịch (Adversarial Inversion)
- Mỗi TC trên phải thất bại khi cố tình bỏ dòng code tương ứng:
  - Xóa `hasMonopoly()` check → TC-03.2 và TC-03.5 phải FAIL.
  - Xóa phép nhân `× 1.5` trong ETC → TC-03.3 phải FAIL.
  - Xóa logic `AUCTION_PHASE` → TC-03.1 phải FAIL.
- Chạy tối thiểu 4 lần đảo nghịch trước khi đánh dấu Verified.

### Kiểm chứng thủ công
- User duyệt phạm vi ticket này trước khi thi công.
