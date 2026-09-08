# GAME-S04: Biến Cố Thị Trường Vĩ Mô & Thẻ Cơ Hội Cá Nhân

## Slice 04: UC-GAME-038/039/040/041/042/043/044/045/046/047/048/049/050 — Event Cards, Market Modifiers, HOSE & Trạm Kiểm Toán

- **Use Case Ref:**
  - UC-GAME-038 (Rút Phiếu Thị Trường tại ô 02/17/33)
  - UC-GAME-039 (Áp dụng hiệu ứng vĩ mô toàn bàn)
  - UC-GAME-040 (Rút Phiếu Cơ Hội tại ô 07/22/36)
  - UC-GAME-041 (Áp dụng hiệu ứng cá nhân người rút)
  - UC-GAME-042 (Kích hoạt thẻ Mùa Cao Điểm Du Lịch — ×2 tiền thuê nhóm Nghỉ dưỡng)
  - UC-GAME-043 (Kích hoạt thẻ Thời Tiết Cực Đoan Duyên Hải — tiền thuê = 0 nhóm miền Trung)
  - UC-GAME-044 (Phụ phí 1D6 chẵn +200 tại BĐS Dịch vụ Cấp 2 — defer từ S03)
  - UC-GAME-045 (Hiệu ứng mất lượt tại BĐS Dịch vụ Cấp 3 — defer từ S03)
  - UC-GAME-046 (Đầu tư HOSE — đặt cược vốn 500–3.000, tung 1D6, xác định lời/lỗ)
  - UC-GAME-047 (Vào Trạm Kiểm Toán — cưỡng chế hoặc thăm viếng)
  - UC-GAME-048 (Thụ án tại Trạm Kiểm Toán — phong tỏa 3 lượt hoặc nộp bảo lãnh)
  - UC-GAME-049 (Điều hướng LỆNH THANH TRA THUẾ (Ô 30) → Trạm Kiểm Toán)
  - UC-GAME-050 (Kích hoạt thẻ Phiếu Cơ Hội có hiệu lực đa vòng — vay khẩn cấp, lãi suất dai dẳng)
- **Traceability Chain:** Requirement → Epic Gameplay → Slice 04 → [TC-04.1/MSS], [TC-04.2/MSS], [TC-04.3/MSS]
- **Flow Paths:** Kịch bản Thành Công Chính (MSS) — 5 luồng:
  1. Người chơi dừng tại ô Phiếu Thị Trường (02/17/33) → Lật thẻ từ deck → Áp dụng hiệu ứng vĩ mô.
  2. Người chơi dừng tại ô Phiếu Cơ Hội (07/22/36) → Lật thẻ từ deck → Áp dụng hiệu ứng cá nhân.
  3. Người chơi dừng tại ô HOSE (38) → Chọn vốn cược → Tung 1D6 → Cập nhật quỹ tiền mặt.
  4. Người chơi bị đưa vào Trạm Kiểm Toán (ô 10) → Thụ án hoặc trả bảo lãnh.
  5. Người chơi dừng tại BĐS Dịch vụ C2/C3 → Áp dụng phụ phí 1D6 chẵn +200 hoặc hiệu ứng mất lượt.
- **Value Delivered:** Kích hoạt hệ thống biến động tài chính toàn bàn (Phiếu Thị Trường), rủi ro cá nhân (Phiếu Cơ Hội), kênh đầu tư rủi ro ngắn hạn (HOSE) và cơ chế phong tỏa người chơi (Trạm Kiểm Toán).
- **Lifecycle Status:** Prepared (Chờ Duyệt Phạm Vi)

---

## Nợ Kỹ Thuật Kế Thừa Từ Slice 03

> 3 hạng mục defer từ biên bản nghiệm thu S03 (xem `issues/GAME-S03-property-upgrades-auction.md` L184-208):

| # | Vấn đề defer | Cách xử lý trong Slice 04 |
|---|-------------|--------------------------|
| 1 | BĐS Dịch vụ C2: Phụ phí 1D6 chẵn +200 | Tích hợp vào `handleLanding()` sau khi trừ phí thuê cơ sở C2 |
| 2 | BĐS Dịch vụ C3: Hiệu ứng mất lượt | Thêm flag `skipNextTurn` vào `PlayerState`, xử lý tại TURN_START |
| 3 | BĐS Nghỉ dưỡng: ×2 khi Mùa Du Lịch | Đọc `MarketModifier.RESORT_DOUBLE` trong `handleLanding()` |

---

## Điều Kiện Tiên Quyết

- Slice 03 hoàn tất: 81/81 tests PASS, FSM có `ActionPhase`, `AuctionPhase`, `PropertyManagement`, `BankruptcyCheck`.
- `PROPERTY_DEEDS` đã có đầy đủ `rent0/1/2/3`, `level`, `colorGroup`.
- Enum `CellType` đã có `Property`, `Railroad`, `Utility`.
- Người chơi dẫm vào ô 02/07/10/17/22/30/33/36/38.

---

## Cam Kết Đầu Ra

- **Thành công:**
  - Deck thẻ được xáo trộn ngẫu nhiên khi khởi tạo ván đấu; rút lần lượt từ đầu deck; thẻ cuối cùng tái thiết lập deck.
  - Mỗi Phiếu Thị Trường áp hiệu ứng vĩ mô ngay lập tức (hoặc kéo dài N vòng), đúng danh sách 16 thẻ.
  - Mỗi Phiếu Cơ Hội áp hiệu ứng cá nhân ngay lập tức (hoặc giữ thẻ), đúng danh sách 20 thẻ.
  - Thẻ Mùa Du Lịch: 6 ô BĐS Nghỉ dưỡng được quy định (11,13,14,21,24,29 — §V.1.11) thu phí × 2.
  - Thẻ Thời Tiết Cực Đoan: 5 ô BĐS dải miền Trung (11,14,16,18,19 — §V.1.16) thu phí = 0 trong 1 vòng.
  - HOSE: Người chơi chọn vốn cược trong [500, 3.000], tung 1D6, áp bảng lời/lỗ từ `requirements.md` §IV.3.
  - BĐS Dịch vụ C2: Sau trừ phí thuê cơ sở, tung 1D6; số chẵn → khách trả thêm 200 Tr.
  - BĐS Dịch vụ C3: Sau trừ phí thuê, đặt `skipNextTurn = true` vào `PlayerState` của khách.
  - Trạm Kiểm Toán: 3 trường hợp vào (đổ đôi 3 lần, Ô 30, thẻ cơ hội) → giữ người chơi 3 lượt hoặc cho phép nộp bảo lãnh 500 Tr. (§I requirements.md).
- **Thất bại:**
  - Thẻ có hiệu ứng lỗi (không tìm được đối tượng đích) → vô hiệu hóa thẻ, ghi log, không phá vỡ state.
  - HOSE: Vốn cược ngoài khoảng [500, 3.000] → từ chối với lý do `INVALID_STAKE`.
  - HOSE: Vốn cược vượt tiền mặt → từ chối với lý do `INSUFFICIENT_FUNDS`.
  - Trạm Kiểm Toán: Nộp bảo lãnh khi không đủ 500 Tr. (§I requirements.md) → từ chối, người chơi tiếp tục thụ án.

---

## Phạm Vi Hệ Thống Nghiệp Vụ

### Hệ Thống 1: Event Card Engine

```
[Khởi tạo ván đấu]
    │
    ├── Xáo trộn 16 Phiếu Thị Trường → marketDeck[]
    └── Xáo trộn 20 Phiếu Cơ Hội → chanceDeck[]

[Người chơi dừng tại ô Phiếu Thị Trường 02/17/33]
    │
    ├── Lấy thẻ đầu marketDeck[] (draw)
    ├── Nếu deck rỗng → xáo trộn lại từ discardPile
    ├── Gọi applyMarketCard(card, gameState)
    └── Đẩy thẻ vào marketDiscardPile[]

[Người chơi dừng tại ô Phiếu Cơ Hội 07/22/36]
    │
    ├── Lấy thẻ đầu chanceDeck[] (draw)
    ├── Nếu deck rỗng → xáo trộn lại từ discardPile
    ├── Gọi applyChanceCard(card, playerId, gameState)
    │       ├── Hiệu lực tức thời → xử lý ngay, đẩy vào discard
    │       └── Thẻ giữ (CC_DIPLOMATIC) → thêm vào hand[playerId]
    └── FSM tiếp tục PROPERTY_MANAGEMENT → BANKRUPTCY_CHECK → TURN_END
```

**Hằng số thẻ (enum MarketCardId — 16 thẻ):**

| MarketCardId | Tên Thẻ | Phạm vi hiệu lực |
|---|---|---|
| `MC_NIGHT_ECONOMY` | Chính Sách Kinh Tế Đêm | +100% phí BĐS Dịch vụ ≥C1, 1 vòng |
| `MC_MEGA_CONCERT` | Đại Nhạc Hội Quốc Tế | Di chuyển tất cả → ô Dịch vụ cấp cao nhất |
| `MC_ALCOHOL_CHECK` | Kiểm Tra Nồng Độ Cồn | −50% phí BĐS Dịch vụ, 2 vòng |
| `MC_CASINO_PILOT` | Casino Dành Cho Người Việt | Chủ Phú Quốc C3 nhận 2.000 từ Kho bạc |
| `MC_RATE_HIKE` | Tăng Lãi Suất | Lãi suất thế chấp → 10%/vòng; phí đất −20% |
| `MC_CREDIT_STIMULUS` | Gói Kích Cầu Tín Dụng | Miễn lãi 2 vòng; xây dựng −20% |
| `MC_LAND_FEVER` | Sốt Đất Quy Hoạch | ×2 phí thuê Hưng Yên/Bình Dương/Đồng Nai |
| `MC_FIRE_INSPECTION` | Thanh Tra PCCC | Tất cả nộp 200/C1, 400/C2, 800/C3 |
| `MC_PUBLIC_INVEST` | Đẩy Mạnh Vốn Đầu Tư Công | +1.000/ô Hạ tầng người chơi đang sở hữu |
| `MC_ANTI_SPECULATE` | Áp Thuế Chống Đầu Cơ | Thuế chuyển nhượng P2P → 20% |
| `MC_PEAK_TOURISM` | Mùa Cao Điểm Du Lịch | ×2 phí thuê 6 ô BĐS Nghỉ dưỡng được liệt kê (ô 11,13,14,21,24,29 — §V.1.11 requirements.md) |
| `MC_FREEZE_TRADE` | Đóng Băng Giao Dịch | Cấm mua bán/thế chấp đến thẻ kế tiếp |
| `MC_FUEL_SURGE` | Biến Động Tỷ Giá & Xăng Dầu | +500 phụ phí tại mỗi ô Hạ tầng Giao thông |
| `MC_URBAN_PLANNING` | Phê Duyệt Quy Hoạch | +20% giá thế chấp Xanh Lá (Hà Nội) & Tím (HCM) |
| `MC_UTILITY_DOUBLE` | Tăng Khung Giá Điện & Viễn Thông | ×2 phí thu của EVN + Viettel |
| `MC_COASTAL_STORM` | Thời Tiết Cực Đoan Duyên Hải | Phí thuê = 0 tại 5 ô miền Trung (11,14,16,18,19 — §V.1.16 requirements.md), 1 vòng |

**Hằng số thẻ (enum ChanceCardId — 20 thẻ):**

| ChanceCardId | Tên Thẻ | Hiệu ứng |
|---|---|---|
| `CC_PLATE_AUCTION` | Đấu Giá Biển Số Xe | Nộp 500; đi thêm 1 lượt ngay |
| `CC_TAX_AUDIT` | Thanh Tra Thuế Đột Xuất | Nộp 200/ô đất trống đang sở hữu |
| `CC_STOCK_PROFIT` | Chốt Lời Chứng Khoán | Nhận 2.500 từ Kho bạc |
| `CC_DIPLOMATIC` | Thẻ Miễn Trừ Ngoại Giao | Giữ thẻ; miễn 100% phí 1 lần dừng chân |
| `CC_CONTRACT_PENALTY` | Bồi Thường Hợp Đồng | Trả 1.000 cho người ít tiền nhất |
| `CC_LAND_CHANGE` | Chuyển Mục Đích Sử Dụng | Nộp 800; +50% phí 1 ô trống tùy chọn (vĩnh viễn) |
| `CC_BUILD_HALT` | Đình Chỉ Xây Dựng | 1 BĐS không thu phí 2 vòng |
| `CC_MA_FORCE` | Thương Vụ M&A Bắt Buộc | Mua 1 ô trống của đối thủ nghèo hơn với giá 120% |
| `CC_COPYRIGHT` | Vi Phạm Bản Quyền | Nộp phạt 400 vào Kho bạc |
| `CC_OVERDRAFT` | Hạn Mức Thấu Chi | Vay 3.000; hoàn trả 3.300 sau 3 vòng (ghi nợ) |
| `CC_JUNK_STOCK` | Kẹp Cổ Phiếu Rác | Nộp phạt 1.500 vào Kho bạc |
| `CC_FRANCHISE` | Nhượng Quyền Ẩm Thực | Thu 300/người từ tất cả đối thủ |
| `CC_LAND_RECLAIM` | Thu Hồi Đất Công Cộng | 1 ô trống bị thu hồi; nhận đền bù 150% giá niêm yết |
| `CC_VENUE_INCIDENT` | Sự Cố An Ninh Khu Giải Trí | Nộp 800 khắc phục; 1 cơ sở dịch vụ đóng băng 1 vòng |
| `CC_CONCERT_SPONSOR` | Tài Trợ Nhạc Hội | Chi 600; điểm xúc xắc lượt sau được ×2 |
| `CC_FREE_CREDIT` | Huy Động Vốn Tín Dụng | Nhận 2.000; nộp lãi 400 mỗi lần qua GO (đến cuối ván) |
| `CC_PORT_EXCLUSIVE` | Hợp Tác Độc Quyền Cảng | Nhận 50% phí thu của chủ Cảng/Sân bay 2 vòng |
| `CC_SLOW_BUILD` | Thu Hồi Do Chậm Triển Khai | Đất trống sở hữu >2 vòng → bị tịch thu đấu giá |
| `CC_MEDIA_CRISIS` | Khủng Hoảng Truyền Thông | 1 cơ sở dịch vụ không thu phí 1 vòng |
| `CC_SWAP_PROJECT` | Quyền Ưu Tiên Hoán Đổi | Hoán đổi 2 ô đất trống cùng nhóm màu |

---

### Hệ Thống 2: Market Modifier System

**Luồng dữ liệu:**

```
[applyMarketCard()] → ghi vào gameState.activeModifiers[]
         │
         └── Mỗi modifier: { type, affectedCells[], multiplier, remainingRounds }

[handleLanding()] → đọc activeModifiers[] → điều chỉnh rent trước khi trừ tiền
         │
         ├── Bước 1 — Kiểm tra zero-rent modifier trước:
         │       nếu MC_COASTAL_STORM active VÀ ô ∈ COASTAL_CELLS → rent = 0, trả về ngay (bỏ qua multiplier)
         ├── Bước 2 — Chỉ áp multiplier khi không có zero-rent:
         │       nếu MC_PEAK_TOURISM active VÀ ô ∈ RESORT_CELLS → rent × 2
         └── Bước 3 — Không có modifier → rent = rentAtLevel (mặc định)

> **Quy tắc ưu tiên xung đột modifier:** Khi `MC_PEAK_TOURISM` và `MC_COASTAL_STORM` cùng active trên cùng một ô (ví dụ ô 11 — Bình Thuận thuộc cả RESORT_CELLS và COASTAL_CELLS): **zero-rent modifier thắng** — tiền thuê = 0, multiplier ×2 bị bỏ qua hoàn toàn. Nguyên tắc: bất lợi hơn cho chủ đất được ưu tiên áp dụng.

[Kết thúc mỗi lượt chơi] → decayModifiers(): giảm remainingRounds; xóa modifier khi = 0
```

**Định nghĩa nhóm ô bị ảnh hưởng (hằng số, không magic string):**

| Hằng Số | Ô thuộc nhóm | Ghi chú |
|---------|-------------|---------|
| `RESORT_CELLS` | [11, 13, 14, 21, 24, 29] | 6 ô BĐS Nghỉ dưỡng được quy định (§V.1.11 requirements.md) |
| `COASTAL_CELLS` | [11, 14, 16, 18, 19] | Mũi Né, Nha Trang, Quy Nhơn, Huế, Đà Nẵng (§V.1.16 requirements.md) |
| `SERVICE_CELLS` | [6, 8, 26, 27] | 4 ô BĐS Dịch vụ & Giải trí |
| `INFRA_CELLS` | [5, 15, 25, 35] | 4 ô Hạ tầng Giao thông |
| `UTILITY_CELLS` | [12, 28] | EVN + Viettel |
| `HANOI_HCMC_CELLS` | [31, 32, 34, 37, 39] | Xanh Lá + Tím |
| `LAND_FEVER_CELLS` | [6, 8, 31] | Hưng Yên, Bình Dương, Đồng Nai |

---

### Hệ Thống 3: Stock Market HOSE (Ô 38)

**Luồng nghiệp vụ:**

```
[Người chơi dừng tại ô 38]
    │
    ├── FSM: TILE_RESOLUTION → ACTION_PHASE (chờ INTENT_INVEST hoặc INTENT_SKIP)
    │
    ├── INTENT_SKIP → FSM chuyển sang PROPERTY_MANAGEMENT
    │
    └── INTENT_INVEST { stake: number }
            │
            ├── Kiểm tra: 500 ≤ stake ≤ 3.000 → sai? → từ chối INVALID_STAKE
            ├── Kiểm tra: player.balance ≥ stake → sai? → từ chối INSUFFICIENT_FUNDS
            ├── Tung 1D6 → face (1–6)
            ├── Tra bảng: payout = stake × HOSE_OUTCOMES[face]
            │       face=1 → ×0.50 (lỗ 50%)
            │       face=2 → ×0.75 (lỗ 25%)
            │       face=3 → ×1.00 (hòa vốn)
            │       face=4 → ×1.20 (lời 20%)
            │       face=5 → ×1.50 (lời 50%)
            │       face=6 → ×2.00 (lời 100%)
            ├── player.balance = player.balance - stake + payout
            └── FSM → PROPERTY_MANAGEMENT → BANKRUPTCY_CHECK → TURN_END
```

**Hằng số bảng kết quả:**

| Mặt Xúc Xắc (1D6) | Hệ Số | Kết Quả |
|---|---|---|
| 1 | ×0.50 | Lỗ 50% vốn |
| 2 | ×0.75 | Lỗ 25% vốn |
| 3 | ×1.00 | Hòa vốn |
| 4 | ×1.20 | Lời 20% |
| 5 | ×1.50 | Lời 50% |
| 6 | ×2.00 | Lời 100% |

E[return] ≈ +15.83% (tham chiếu §IV.3 requirements.md)

---

### Hệ Thống 4: Trạm Kiểm Toán (Ô 10)

**Ba đường vào Trạm Kiểm Toán:**

```
Đường 1: Đổ đôi 3 lần liên tiếp (FSM đã xử lý Slice 01) → sendToAudit(playerId)
Đường 2: Dừng tại ô 30 (LỆNH THANH TRA THUẾ)           → sendToAudit(playerId)
Đường 3: Rút thẻ Phiếu Cơ Hội có hiệu lực đưa vào Trạm → sendToAudit(playerId)
```

**Luồng thụ án:**

```
[sendToAudit(playerId)]
    │
    ├── player.position = 10
    ├── player.auditTurnsLeft = 3
    └── emit sự kiện SENT_TO_AUDIT { correlationId, playerId, timestamp }

[Đầu mỗi lượt (TURN_START) khi auditTurnsLeft > 0]
    │
    ├── Tùy chọn A: INTENT_BAIL_OUT — Nộp bảo lãnh 500 Tr. (§I requirements.md)
    │       ├── balance ≥ 500 → trừ 500 → auditTurnsLeft = 0 → chơi tiếp
    │       └── balance < 500 → từ chối INSUFFICIENT_FUNDS, thụ án tiếp
    │
    ├── Tùy chọn B: Đổ đôi (tự chứng minh vô tội)
    │       ├── 2D6 ra đôi → auditTurnsLeft = 0, di chuyển đúng điểm
    │       └── Không ra đôi → auditTurnsLeft -= 1, mất lượt di chuyển
    │
    └── Tùy chọn C: Chờ (thụ án thụ động)
            ├── auditTurnsLeft -= 1
            └── auditTurnsLeft = 0 → tự động thoát, chơi bình thường lượt sau
```

> **Lưu ý phân biệt:** Thăm viếng (auditTurnsLeft = 0 khi dừng tại ô 10) → không có hiệu lực phong tỏa.

---

## Phạm Vi Kiến Trúc (Tuân thủ ADR-0001 & ADR-0002)

```
[TILE_RESOLUTION] → Xác định CellType
        │
        ├── CellType.Market (ô 02/17/33) → drawMarketCard() → applyMarketCard()
        │                                → FSM: PROPERTY_MANAGEMENT
        │
        ├── CellType.Chance (ô 07/22/36) → drawChanceCard() → applyChanceCard()
        │                                → FSM: PROPERTY_MANAGEMENT (hoặc SENT_TO_AUDIT)
        │
        ├── CellType.Hose (ô 38)         → FSM: ACTION_PHASE (chờ INTENT_INVEST/SKIP)
        │                                → resolveHoseInvestment() → PROPERTY_MANAGEMENT
        │
        ├── CellType.Audit (ô 10)        → sendToAudit() hoặc visiting check
        │
        ├── CellType.TaxOrder (ô 30)     → sendToAudit() ngay lập tức
        │
        └── CellType.Property (Service C2/C3) → collectRent() + applyServiceBonus()
                                              → C2: roll1D6; chẵn → +200 thêm
                                              → C3: visitor.skipNextTurn = true
```

### Tệp bị ảnh hưởng

#### [MODIFY] [room.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts)
- Mở rộng `CellType`: Thêm `Market`, `Chance`, `Hose`, `TaxOrder`.
- Mở rộng `TurnPhase`: Thêm `HosePhase`.
- Thêm interface `MarketModifier`: `{ type: MarketCardId; affectedCells: number[]; remainingRounds: number; multiplier?: number }`.
- Thêm `skipNextTurn: boolean` vào `PlayerState`.
- Thêm `auditTurnsLeft: number` vào `PlayerState`.
- Thêm `activeModifiers: MarketModifier[]` vào `GameState`.
- Thêm `hand: ChanceCardId[]` vào `PlayerState` (cho CC_DIPLOMATIC).

#### [NEW] [event_card_engine.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/event_card_engine.ts) ≤ 130 dòng
- Định nghĩa enum `MarketCardId` (16 thẻ) và `ChanceCardId` (20 thẻ).
- Định nghĩa `HOSE_OUTCOMES`, `RESORT_CELLS`, `COASTAL_CELLS`, `SERVICE_CELLS`, `INFRA_CELLS`, `UTILITY_CELLS`, `LAND_FEVER_CELLS`, `HANOI_HCMC_CELLS`.
- Hàm `createMarketDeck()`: Trả về mảng 16 thẻ đã xáo trộn (Fisher-Yates dùng PRNG hiện có).
- Hàm `createChanceDeck()`: Trả về mảng 20 thẻ đã xáo trộn.
- Hàm `applyMarketCard(card, gameState)`: Áp hiệu ứng vĩ mô, cập nhật `activeModifiers`.
- Hàm `applyChanceCard(card, playerId, gameState)`: Áp hiệu ứng cá nhân.
- Hàm `resolveHoseInvestment(stake, diceResult)`: Trả về `payout` theo `HOSE_OUTCOMES`.
- Hàm `decayModifiers(gameState)`: Giảm `remainingRounds`; xóa modifier hết hạn.

#### [MODIFY] [property_manager.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_manager.ts)
- Cập nhật `handleLanding()`: Đọc `activeModifiers` để điều chỉnh rent trước khi trừ tiền.
- Thêm logic Service C2: Sau trừ phí cơ sở, `rollDice(1)` → chẵn → trừ thêm 200.
- Thêm logic Service C3: Sau trừ phí cơ sở, đặt `visitor.skipNextTurn = true`.

#### [MODIFY] [room_manager.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts)
- `handleTileLanding()`: Phân nhánh theo `CellType.Market`, `Chance`, `Hose`, `TaxOrder`, `Audit`.
- Mở rộng `handlePlayerIntent()`: Bổ sung `INTENT_INVEST`, `INTENT_SKIP` (HOSE), `INTENT_BAIL_OUT` (Trạm).
- Thêm `sendToAudit(roomCode, playerId)`: Đặt `auditTurnsLeft = 3`, di chuyển về ô 10.
- Thêm `handleTurnStart()`: Kiểm tra `skipNextTurn` và `auditTurnsLeft` trước khi cho phép đổ xúc xắc.
- Gọi `decayModifiers()` vào cuối vòng đấu (sau `TURN_END` tất cả người chơi).

#### [MODIFY] [board_config.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/board_config.ts)
- Cập nhật các ô 02, 07, 10, 17, 22, 30, 33, 36, 38 với đúng `CellType`.

#### [GIỮ NGUYÊN] Các tệp không sửa
- [dice.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/dice.ts) — tái sử dụng `rollDice(n)` cho 1D6 (phụ phí C2) và 1D6 (HOSE).
- [session_manager.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts) — không liên quan.
- [game_canvas.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx) — không liên quan.

---

## Ngân Sách LOC

| Tệp | Dự tính |
|------|---------|
| `room.ts` (sửa) | +25 dòng (enum mới, interface Modifier, trường PlayerState) |
| `event_card_engine.ts` (mới) | ≤ 130 dòng (enum, hằng số, 6 hàm thuần) |
| `property_manager.ts` (sửa) | +20 dòng (modifier lookup, C2 phụ phí, C3 skip) |
| `room_manager.ts` (sửa) | +55 dòng (landing branches, intents, sendToAudit, turnStart) |
| `board_config.ts` (sửa) | +5 dòng (cập nhật CellType 9 ô sự kiện) |
| **Tổng delta** | **≤ 235 dòng** |

> Nếu `room_manager.ts` vượt ngưỡng 400 dòng tổng sau chỉnh sửa, tách `audit_manager.ts` ra.

---

## Bảng Ánh Xạ Intent → Action (Tuân thủ ADR-0001)

| Intent | Phase | Hành Động Server |
|--------|-------|-----------------|
| `INTENT_INVEST { stake }` | HosePhase | Kiểm tra stake → `resolveHoseInvestment()` → PROPERTY_MANAGEMENT |
| `INTENT_SKIP` | HosePhase | Bỏ qua HOSE → PROPERTY_MANAGEMENT |
| `INTENT_BAIL_OUT` | TURN_START (Audit) | Kiểm tra balance ≥ 500 (§I requirements.md) → `auditTurnsLeft = 0` |
| `INTENT_USE_DIPLOMATIC` | ACTION_PHASE | Hủy CC_DIPLOMATIC trong hand → miễn 100% phí lần này |
| `INTENT_END_TURN` | PROPERTY_MANAGEMENT | Gọi `decayModifiers()` → BANKRUPTCY_CHECK → TURN_END |

---

## NGOÀI PHẠM VI (Defer Slice 05+)

> [!CAUTION]
> Các luồng sau **TUYỆT ĐỐI KHÔNG** thi công trong Slice 04:

| Luồng | Lý do hoãn | Slice đích |
|-------|------------|------------|
| Thế chấp BĐS | Cần hệ thống tín dụng ngân hàng | Slice 05 |
| Phá sản / Thanh lý cưỡng chế | Cần Insolvency Engine | Slice 05 |
| P2P Trading UI — thương lượng 20s | Cần UI thương lượng | Slice 05+ |
| Giao diện 3D hiển thị thẻ bài (R3F) | Cần ADR-0002 UI layer | Tương lai |
| CC_OVERDRAFT: enforce thu hồi sau 3 vòng | Cần Credit Ledger | Slice 05 |
| CC_FREE_CREDIT: enforce lãi 400/vòng | Cần Credit Ledger | Slice 05 |

### Xử lý tạm thời thẻ có hiệu lực đa vòng (CC_OVERDRAFT, CC_FREE_CREDIT)

- Slice 04 **chỉ ghi nhận** khoản nợ vào `player.pendingDebts[]` (mảng tạm thời, không enforce).
- Slice 05 tích hợp vào Credit Ledger chính thức và enforce tự động.

---

## Hợp Đồng Kiểm Thử

### `TC-04.1/MSS` — Rút Phiếu Thị Trường Vĩ Mô & Áp Hiệu Ứng Toàn Bàn

```
[Kích hoạt] Khởi tạo gameState với marketDeck đã xáo trộn (16 thẻ).
            Người chơi A dừng tại ô 02 (Phiếu Thị Trường).
            Thẻ đầu deck được cố định là MC_FIRE_INSPECTION (test deterministic).
            Người chơi B sở hữu 2 công trình C1 và 1 công trình C2.
            Người chơi C không có công trình nào.
[Kỳ vọng]  → Thẻ được rút: deck.length giảm từ 16 xuống 15.
             → B.balance -= (2 × 200 + 1 × 400) = B.balance_trước - 800.
             → C.balance không đổi (không có công trình nào).
             → Thẻ được đẩy vào marketDiscardPile[].
             → FSM: PROPERTY_MANAGEMENT → BANKRUPTCY_CHECK → TURN_END.
```

### `TC-04.2/MSS` — Kích Hoạt Modifier Mùa Du Lịch & Thời Tiết Cực Đoan

```
[Kịch bản A — Mùa Cao Điểm Du Lịch]
            gameState.activeModifiers = [{ type: MC_PEAK_TOURISM, remainingRounds: 1 }]
            Người chơi B (balance=10.000) dừng tại ô 11 (Bình Thuận).
            Chủ sở hữu ô 11 nâng Cấp 1. rent1 = 420 (theo entity_model.md).
[Kỳ vọng]  → Phí thu = 420 × 2 = 840.
             → B.balance === 9.160.
             → Sau INTENT_END_TURN: modifier.remainingRounds giảm về 0 → bị xóa khỏi activeModifiers[].

[Kịch bản B — Thời Tiết Cực Đoan Duyên Hải]
            gameState.activeModifiers = [{ type: MC_COASTAL_STORM, remainingRounds: 1 }]
            Người chơi C (balance=8.000) dừng tại ô 14 (Khánh Hòa).
            Chủ sở hữu ô 14 nâng Cấp 2. rent2 = 1.280.
[Kỳ vọng]  → Phí thu = 0 (ô 14 ∈ COASTAL_CELLS).
             → C.balance === 8.000 (không đổi).
             → Chủ ô 14 không nhận tiền.
```

### `TC-04.3/MSS` — Đầu Tư HOSE với Biên Độ Lời/Lỗ Xác Định

```
[Kịch bản A — Giảm sàn (face=1)]
            Người chơi A (balance=5.000) dừng tại ô 38.
            A gửi INTENT_INVEST { stake: 2.000 }.
            PRNG inject trả về 1D6 = 1.
[Kỳ vọng]  → payout = 2.000 × 0.5 = 1.000.
             → A.balance === 4.000 (5.000 − 2.000 + 1.000).

[Kịch bản B — Tăng trần (face=6)]
            Người chơi A (balance=5.000) dừng tại ô 38.
            A gửi INTENT_INVEST { stake: 2.000 }.
            PRNG inject trả về 1D6 = 6.
[Kỳ vọng]  → payout = 2.000 × 2.0 = 4.000.
             → A.balance === 7.000 (5.000 − 2.000 + 4.000).

[Kịch bản C — Vốn không hợp lệ]
            A gửi INTENT_INVEST { stake: 400 } (dưới ngưỡng 500).
[Kỳ vọng]  → Từ chối với lý do INVALID_STAKE.
             → A.balance không đổi.
             → FSM vẫn ở HosePhase, chờ input hợp lệ hoặc INTENT_SKIP.
```

---

## Kế Hoạch Kiểm Chứng

### Kiểm thử tự động

```bash
cmd /c "cd /d c:\Users\HP\Documents\GitHub\vtcoon && npx vitest run --reporter=verbose src/domain/event_card_engine.test.ts src/server/room_manager.test.ts"
```

### Kiểm chứng hồi quy (Regression)

```bash
cmd /c "cd /d c:\Users\HP\Documents\GitHub\vtcoon && npx vitest run --reporter=verbose"
```

- Toàn bộ 81 tests hiện có (Slice 00-03) phải PASS sau khi thi công Slice 04.

### Kiểm chứng đảo nghịch (Adversarial Inversion)

- Xóa xử lý `MC_FIRE_INSPECTION` → TC-04.1 phải FAIL.
- Xóa điều kiện `RESORT_CELLS.includes(cell)` → TC-04.2 (Mùa Du Lịch) phải FAIL.
- Xóa điều kiện `COASTAL_CELLS.includes(cell)` → TC-04.2 (Bão lũ) phải FAIL.
- Xóa `HOSE_OUTCOMES[face]` lookup → TC-04.3 phải FAIL.
- Chạy tối thiểu 4 lần đảo nghịch trước khi đánh dấu Verified.

### Kiểm chứng thủ công

- User duyệt phạm vi ticket này trước khi thi công.

---

## Điểm Mở — ĐÃ CHỐT

> [!NOTE]
> **Tất cả 3 Open Questions của Slice 04 đã được User xác nhận và chốt. Không còn blocking item nào trước khi thi công.**

| # | Vấn đề | Quyết định | SSOT |
|---|--------|------------|------|
| Q1 | **Mức bảo lãnh Trạm Kiểm Toán** | 500 Tr. VNĐ | §I requirements.md (đã bổ sung) |
| Q2 | **Xung đột modifier đồng thời** | Zero-rent thắng: tiền thuê = 0 khi MC_COASTAL_STORM active, bỏ qua multiplier ×2 | Hệ Thống 2 (đã mô tả quy tắc ưu tiên) |
| Q3 | **Phạm vi Thẻ Mùa Du Lịch** | Đúng 6 ô [11,13,14,21,24,29] theo §V.1.11 | RESORT_CELLS (đã cập nhật) |

