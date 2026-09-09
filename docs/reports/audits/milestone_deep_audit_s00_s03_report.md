# BÁO CÁO ĐỐI SOÁT VÉT CẠN MỐC ĐỊNH KỲ (MILESTONE DEEP AUDIT GAP REPORT)

- **Thời điểm kiểm toán:** 2026-09-08T17:48:00+07:00
- **Phạm vi đối soát:** Toàn bộ mã nguồn từ Slice 00 đến Slice 03 (kèm các tương tác giao thoa của Slice 04)
- **Nguồn Chân Lý Duy Nhất (SSOT):**
  - [`docs/requirements.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/requirements.md) (§I Luật cốt lõi, §II Danh mục 40 ô, §III Bất động sản & Công trình, §IV Khối tài chính, §V Thẻ bài)
  - [`docs/domain/entity_model.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/entity_model.md) (Mô hình thực thể 28 Title Deeds & Bảng tra cứu)
- **Hiện trạng kiểm thử kiểm chứng:** 20 tệp kiểm thử · 180/180 tests PASS (nhưng nhiều bài test chỉ kiểm chứng không crash thay vì bắt lỗi biên âm).

---

## I. SƠ ĐỒ DÒNG CHẢY NGHIỆP VỤ & CÁC LỖ HỔNG PHÁT HIỆN

```
[Người chơi tung xúc xắc & di chuyển]
  │
  ├──► Vượt qua hoặc dừng tại Ô 00 (GO)
  │      ├─ Cộng 2.000 Tr. VNĐ ──────────────► ĐÃ CÓ [PASS]
  │      └─ Thuế tài sản lũy tiến (§IV.1) ────► THIẾU HOÀN TOÀN ──────► [BLOCKER]
  │
  ├──► Dừng chân Ô 04 (Lệ phí đất đai)
  │      └─ handleSpecialCell ───────────────► KHÔNG CÓ CASE TAX ─────► [BLOCKER]
  │            └─ handleLanding ─────────────► Trả 0đ, giữ nguyên tiền
  │
  ├──► Dừng chân Ô 20 (Nghỉ dưỡng miễn phí)
  │      └─ handleLanding ───────────────────► NotPurchasable, 0đ ────► [PASS]
  │
  ├──► Từ chối mua ô đất (INTENT_DECLINE)
  │      ├─ Mở phiên đấu giá (50% giá gốc) ──► ĐÃ CÓ [PASS]
  │      ├─ Loại trừ người vừa từ chối ──────► BỎ SÓT RÀNG BUỘC ─────► [BLOCKER]
  │      └─ Đóng phiên đấu giá trên Runtime ──► THIẾU INTENT / TIMER ──► [BLOCKER]
  │
  ├──► Nâng cấp Công trình & Tiện ích
  │      ├─ Gói ETC Hạ tầng (+50% phí) ──────► Đầy đủ & chính xác ────► [PASS]
  │      ├─ Gói 5G / Điện thông minh (x150) ──► Đầy đủ & chính xác ────► [PASS]
  │      └─ Thẻ kích cầu MC_CREDIT_STIMULUS ──► Không nối upgrade ────► [BLOCKER]
  │
  └──► Giao dịch P2P & Thẻ sự kiện
         ├─ Giao dịch song phương (Thuế 5%) ──► Tráo hợp đồng TC-02.3 ► [NỢ KỸ THUẬT SLICE 05]
         ├─ Thẻ CC_PLATE_AUCTION (+1 lượt) ──► Reset mất lượt ngay ───► [BLOCKER]
         └─ Thẻ CC_CONCERT_SPONSOR (x2 xúc) ──► Trừ 600Tr, NO-OP x2 ──► [BLOCKER]
```

---

## II. ĐỐI SOÁT CHI TIẾT 3 TRỌNG TÂM KIỂM TOÁN

### 1. ĐỐI SOÁT CÁC Ô ĐẶC THÙ & LUẬT BÀN CỜ (§I & §II)

#### 1.1. Ô 04 — Lệ Phí Đăng Ký Đất Đai
- **Vị trí mã nguồn:** [`src/domain/board_config.ts:45`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/board_config.ts#L45) và [`src/server/room_manager.ts:102-111`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts#L102-L111).
- **Thực trạng kiểm toán:**
  - Ô 04 được cấu hình `{ index: 4, name: 'Lệ Phí Đăng Ký Đất Đai', type: CellType.Tax }`.
  - Hàm `handleSpecialCell` của `RoomManager` chỉ duyệt các case: `Market`, `Chance`, `Hose`, `TaxOrder`, `Audit`. Hoàn toàn không có nhánh `CellType.Tax`.
  - Lệnh xử lý rơi xuống `handleLanding()` tại [`src/domain/property_manager.ts:169`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_manager.ts#L169). Do Ô 04 không thuộc danh mục đất mua bán, hàm trả về `LandingResult.NotPurchasable` với `rentAmount = 0`.
  - Số dư tài khoản người chơi không bị khấu trừ bất kỳ đồng nào.
- **Quy chuẩn SSOT vi phạm:** `docs/requirements.md` §II (Bảng 40 ô Cạnh 1 - Ô 04: *"Nộp 2.000 Tr. VNĐ hoặc 10% tổng tiền mặt hiện có"*).
- **Xếp loại:** **`[BLOCKER]`**.

#### 1.2. Ô 20 — Nghỉ Dưỡng Miễn Phí
- **Vị trí mã nguồn:** [`src/domain/board_config.ts:63`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/board_config.ts#L63) và [`src/server/room_manager.ts:156-160`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts#L156-L160).
- **Thực trạng kiểm toán:**
  - Cấu hình `{ index: 20, name: 'Nghỉ Dưỡng Miễn Phí', type: CellType.FreeParking }`.
  - Khi dừng chân, `handleLanding` trả về `NotPurchasable`, `rentAmount = 0`.
  - FSM chuyển sang `TurnPhase.PropertyManagement`. Không giam giữ, không trừ tiền, không cưỡng chế di chuyển.
- **Đối chiếu SSOT:** `docs/requirements.md` §II (Cạnh 2 - Ô 20: *"Khu vực an toàn — Dừng chân tự do, không phát sinh dòng tiền"*).
- **Xếp loại:** **`[PASS]`**.

#### 1.3. Thuế Chuyển Nhượng P2P (5%) & Bê Bối Tráo Hợp Đồng TC-02.3
- **Vị trí mã nguồn:** [`src/server/intent_dispatcher.ts:5-14`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/intent_dispatcher.ts#L5-L14) và [`tests/domain/property_manager.test.ts:48-61`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/domain/property_manager.test.ts#L48-L61).
- **Thực trạng kiểm toán:**
  - Toàn bộ codebase chưa có bất kỳ cấu trúc hay hàm nào phục vụ thương lượng P2P giữa hai người chơi.
  - Sổ cái tiến độ [`docs/epics/gameplay/_epic_ledger.md:64`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/epics/gameplay/_epic_ledger.md#L64) cam kết:  
    `TC-02.3: [Thỏa thuận mua bán P2P đất nền] -> [Chuyển nhượng thành công, trừ 5% thuế chuyển nhượng vào Kho bạc]`.
  - Tuy nhiên, tệp test thực tế [`tests/domain/property_manager.test.ts:48`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/domain/property_manager.test.ts#L48) đã tráo nhãn `[TC-02.3/MSS]` sang ca thử `buyProperty khi balance < gia -> InsufficientFunds` để hợp thức hóa 69/69 PASS.
- **Quy chuẩn SSOT vi phạm:** `docs/requirements.md` §I (P2P Trading Rule: *"Bên nhận tiền phải đóng thuế giao dịch 5% trên tổng giá trị nhận được vào Kho bạc Nhà nước"*).
- **Xếp loại:** **`[NỢ KỸ THUẬT SLICE 05]`** (Cần đăng ký chính thức vào Backlog Slice 05 kèm khôi phục hợp đồng kiểm thử).

---

### 2. ĐỐI SOÁT QUY CHUẨN CÔNG TRÌNH & TIỆN ÍCH (§III)

#### 2.1. Gói ETC Hạ Tầng Giao Thông (+50% phí)
- **Vị trí mã nguồn:** [`src/domain/property_manager.ts:259-272, 287-292`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_manager.ts#L259) và [`src/server/property_actions.ts:20-29`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/property_actions.ts#L20-L29).
- **Thực trạng kiểm toán:**
  - 4 ô hạ tầng: `[5, 15, 25, 35]`. Biểu phí gốc: `500, 1000, 2000, 4000` Tr. VNĐ.
  - `upgradeETC()`: Kiểm tra chặt chẽ điều kiện `owned.length >= 2`, thu đúng `1.500 Tr. VNĐ × số ô sở hữu`, gắn cờ `isETC = true`.
  - `calcRailroadFee()`: Tính chuẩn xác `hasETC ? Math.floor(base * 1.5) : base`.
  - Được điều phối qua `INTENT_UPGRADE_ETC` và kiểm chứng qua [`tests/domain/property_manager_upgrades.test.ts:68`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/domain/property_manager_upgrades.test.ts#L68).
- **Xếp loại:** **`[PASS]`**.

#### 2.2. Gói 5G / Lưới Điện Thông Minh EVN & Viettel (x150 điểm xúc xắc)
- **Vị trí mã nguồn:** [`src/domain/property_manager.ts:274-285, 294-301`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_manager.ts#L274) và [`src/server/property_actions.ts:31-41`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/property_actions.ts#L31-L41).
- **Thực trạng kiểm toán:**
  - Chi phí nâng cấp: `1.000 Tr. VNĐ`.
  - `upgradeUtilityFull()`: Xác thực quyền sở hữu ô 12 hoặc 28, kiểm tra số dư >= 1.000, kích hoạt `isUpgradedUtility = true`.
  - `calcUtilityFee()`: Khi dẫm vào ô đã nâng cấp, trả về đúng `diceTotal * 150`.
  - Được điều phối qua `INTENT_UPGRADE_UTILITY` và kiểm chứng qua [`tests/domain/property_manager_upgrades.test.ts:94`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/domain/property_manager_upgrades.test.ts#L94).
- **Xếp loại:** **`[PASS]`**.

#### 2.3. Quy Tắc Auto-Auction (Đấu Giá Tự Động)
- **Vị trí mã nguồn:** [`src/server/auction_manager.ts:1-68`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/auction_manager.ts#L1-L68) và [`src/server/intent_dispatcher.ts:18-35`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/intent_dispatcher.ts#L18-L35).
- **Thực trạng kiểm toán & Phát hiện 2 Lỗ hổng nghiêm trọng:**
  1. *Khởi tạo phiên*: Nhận lệnh `INTENT_DECLINE`, tự động mở phiên đấu giá khởi điểm 50% giá niêm yết, chuyển `TurnPhase.AuctionPhase` -> **`[PASS]`**.
  2. *Lỗ hổng 1 — Vi phạm luật loại trừ người từ chối*:  
     `docs/requirements.md` §I quy định: *"Mọi người chơi khác (ngoại trừ người vừa bỏ qua) đều có quyền đặt giá."* Cấu trúc `AuctionSession` (L6-10) không lưu `declinedPlayerId`. Người vừa từ chối vẫn được phép đặt giá để mua rẻ 50% -> **`[BLOCKER]`**.
  3. *Lỗ hổng 2 — Bế tắc Runtime (Runtime Deadlock)*:  
     Hàm `handleAuctionClose()` (L45) không hề được đấu nối vào `intent_dispatcher.ts`. Không có Intent kết thúc đấu giá, không có Intent bỏ quyền (Pass Bid), không có timer tự động. Game bị treo vĩnh viễn ở `TurnPhase.AuctionPhase` -> **`[BLOCKER]`**.

---

### 3. TRUY TÌM HÀM NO-OP, LOGIC KHUYẾT TẬT & NỢ KỸ THUẬT MỒ CÔI

| STT | Vị trí (File:Dòng) | Tên Thành Phần | Quy định SSOT | Thực trạng mã nguồn thực tế | Xếp loại |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | [`src/server/room_manager.ts:149`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts#L149) | `checkPassedGo` | §IV.1: Nộp Thuế tài sản lũy tiến (4-6 ô: 150 Tr/ô; >= 7 ô: 400 Tr/ô + 300 Tr/công trình C2-C3) | **NO-OP THUẾ**: Chỉ có dòng `current.balance += GO_BONUS`. Thuế tài sản bị bỏ sót 100%. | **`[BLOCKER]`** |
| 2 | [`src/domain/card_handlers.ts:116-118`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/card_handlers.ts#L116-L118) | `MC_CREDIT_STIMULUS` | §V.1.6: Giảm 20% chi phí xây dựng công trình toàn bàn cờ | **NO-OP EFFECT**: Đẩy modifier rỗng (`affectedCells: []`). Hàm `upgradeProperty()` không nhận modifiers nên chi phí không hề giảm. | **`[BLOCKER]`** |
| 3 | [`src/domain/card_handlers.ts:122-124`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/card_handlers.ts#L122-L124) | `MC_FREEZE_TRADE` | §V.1.12: Đóng băng giao dịch, cấm mua bán tài sản | **NO-OP EFFECT**: Đẩy modifier rỗng. Cả `buyProperty()` và `handleBuyProperty()` không kiểm tra cờ này, người chơi vẫn mua đất bình thường. | **`[BLOCKER]`** |
| 4 | [`src/domain/card_handlers.ts:269-272`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/card_handlers.ts#L269-L272) | `CC_PLATE_AUCTION` | §V.2.1: Nộp 500 Tr nhận đặc quyền tung xúc xắc đi thêm một lượt ngay lập tức | **LOGIC KHUYẾT TẬT**: Gán `player.consecutiveDoubles += 1`. Khi người chơi gửi `INTENT_END_TURN`, hàm `handleEndTurn` xóa sạch biến này về 0. Mất toi 500 Tr mà không được đi tiếp. | **`[BLOCKER]`** |
| 5 | [`src/domain/card_handlers.ts:308-310`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/card_handlers.ts#L308-L310) | `CC_CONCERT_SPONSOR` | §V.2.15: Nộp 600 Tr, điểm xúc xắc lượt tiếp theo được nhân đôi | **NO-OP BÁN PHẦN**: Chỉ trừ 600 Tr (`player.balance -= 600`), không có trường nào trong `Player` để nhân đôi điểm xúc xắc ở lượt tiếp theo. | **`[BLOCKER]`** |
| 6 | [`src/domain/property_manager.ts:180-184`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_manager.ts#L180-L184) | `applyServiceBonus` | §III.2: Khách dẫm vào BĐS Dịch vụ C2 đổ số chẵn bị phụ thu 200 Tr | **LỆCH KHUNG KẾT QUẢ**: `player.balance` bị trừ thêm 200 Tr và chủ đất được cộng 200 Tr, nhưng `rentAmount` trả về trong `RollResult` vẫn chỉ là tiền thuê gốc, gây lệch log sự kiện. | **`[BLOCKER]`** |
| 7 | [`src/domain/property_manager.ts:247-257`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_manager.ts#L247-L257) | `downgradeProperty()` | §IV.2: Thanh lý hạ cấp công trình về C0 hoàn 50% tiền | **HÀM MỒ CÔI**: Hàm thuần domain có test nhưng chưa có hàm bọc tại `property_actions.ts` và không có Intent trong `intent_dispatcher.ts`. | **`[NỢ KỸ THUẬT SLICE 05]`** |
| 8 | [`src/server/audit_manager.ts:58-81`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/audit_manager.ts#L58-L81) | `class AuditManager` | Lớp quản trị Trạm Kiểm Toán | **DEAD CODE**: Không được khởi tạo ở bất kỳ đâu trong toàn bộ codebase; vi phạm quy tắc GEMINI.md Anti-Slop. | **`[NỢ KỸ THUẬT SLICE 05]`** |
| 9 | [`src/domain/card_handlers.ts:311-313`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/card_handlers.ts#L311-L313) | `CC_PORT_EXCLUSIVE` | §V.2.17: Chia sẻ 50% tiền phí cảng/sân bay thu được trong 2 vòng cho người giữ thẻ | **LOGIC KHUYẾT TẬT**: Giảm 50% tiền thu của chủ hạ tầng nhưng không cộng 50% này vào tài khoản người sở hữu thẻ. | **`[NỢ KỸ THUẬT SLICE 05]`** |
| 10 | [`src/domain/card_handlers.ts:276-278`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/card_handlers.ts#L276-L278) | `CC_LAND_CHANGE` | §V.2.6: Nộp 800 Tr tăng vĩnh viễn 50% tiền thuê 1 ô đất trống | **NO-OP BÁN PHẦN**: Chỉ trừ 800 Tr, không hề cập nhật biểu phí hay lưu trữ trạng thái tăng tiền thuê vĩnh viễn. | **`[NỢ KỸ THUẬT SLICE 05]`** |
| 11 | [`src/server/session_manager.ts:18-21`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts#L18-L21) | `DeltaPayload` Interface | Đồng bộ vi sai trạng thái sang Client (VSC Layer 5) | **ĐỨT GÃY LÁT CẮT DỌC**: `DeltaPayload` chỉ chứa `{ index, ownerId }`, hoàn toàn rơi rụng cấp công trình (`level`), cờ `isETC`, `isUpgradedUtility`, số dư ví và vị trí người chơi sang sa bàn 3D. | **`[NỢ KỸ THUẬT SLICE 05]`** |

---

## IV. BẢNG MA TRẬN TỔNG HỢP XẾP LOẠI TOÀN DIỆN

| Hạng Mục Đối Soát | Căn Cứ Điều Khoản | Vị Trí File & Line | Hiện Trạng Thực Tế | Xếp Loại |
| :--- | :--- | :--- | :--- | :--- |
| **Ô 04 (Lệ phí đất đai)** | Requirements §II Ô 04 | `board_config.ts:45`, `room_manager.ts:102` | Không trừ tiền khi dẫm vào (No-Op hoàn toàn) | **`[BLOCKER]`** |
| **Ô 20 (Nghỉ dưỡng)** | Requirements §II Ô 20 | `board_config.ts:63`, `room_manager.ts:156` | Dừng chân an toàn, không phát sinh dòng tiền | **`[PASS]`** |
| **Thuế chuyển nhượng P2P 5%** | Requirements §I P2P | `intent_dispatcher.ts:5-14`, `_epic_ledger.md:64` | Tráo mã kiểm thử `TC-02.3`, hoãn sang Slice 05 | **`[NỢ KỸ THUẬT SLICE 05]`** |
| **Gói ETC Giao thông (+50%)** | Requirements §III.4 | `property_manager.ts:259, 287` | Đủ điều kiện >= 2 ô, tăng đúng 50% biểu phí | **`[PASS]`** |
| **Gói 5G / Điện EVN (x150)** | Requirements §III.5 | `property_manager.ts:274, 294` | Tốn 1.000 Tr, nhân chuẩn 150× điểm xúc xắc | **`[PASS]`** |
| **Auto-Auction: Khởi tạo** | Requirements §I Auto-Auction | `auction_manager.ts:12-24` | Kích hoạt phiên với giá khởi điểm 50% | **`[PASS]`** |
| **Auto-Auction: Loại trừ người bỏ** | Requirements §I Auto-Auction | `auction_manager.ts:26-43` | Người từ chối vẫn được tham gia đặt giá | **`[BLOCKER]`** |
| **Auto-Auction: Đóng phiên Runtime** | ADR-0001 Turn Integrity | `auction_manager.ts:45-67` | Thiếu Intent/Timer đóng phiên, gây treo game | **`[BLOCKER]`** |
| **Thuế tài sản lũy tiến qua GO** | Requirements §IV.1 | `room_manager.ts:149` | Bỏ qua hoàn toàn, chỉ cộng 2.000 Tr | **`[BLOCKER]`** |
| **Thẻ MC_CREDIT_STIMULUS (-20% XD)** | Requirements §V.1.6 | `card_handlers.ts:116` | Không nối vào hàm `upgradeProperty` | **`[BLOCKER]`** |
| **Thẻ MC_FREEZE_TRADE (Cấm mua)** | Requirements §V.1.12 | `card_handlers.ts:122` | Không nối vào hàm `buyProperty` | **`[BLOCKER]`** |
| **Thẻ CC_PLATE_AUCTION (+1 lượt)** | Requirements §V.2.1 | `card_handlers.ts:269` | Gán doubles giả bị `handleEndTurn` xóa sạch | **`[BLOCKER]`** |
| **Thẻ CC_CONCERT_SPONSOR (x2 xúc)** | Requirements §V.2.15 | `card_handlers.ts:308` | Trừ 600 Tr nhưng không nhân đôi xúc xắc | **`[BLOCKER]`** |
| **Lệch phí phụ thu Dịch vụ C2** | Requirements §III.2 | `property_manager.ts:180` | `rentAmount` trả về thiếu 200 Tr phụ thu | **`[BLOCKER]`** |
| **Hạ cấp công trình downgradeProperty** | Requirements §IV.2 | `property_manager.ts:247` | Hàm mồ côi, chưa nối Intent | **`[NỢ KỸ THUẬT SLICE 05]`** |
| **Dead Code class AuditManager** | GEMINI.md Anti-Slop | `audit_manager.ts:58-81` | Lớp thừa không bao giờ được khởi tạo | **`[NỢ KỸ THUẬT SLICE 05]`** |
| **Thẻ CC_PORT_EXCLUSIVE** | Requirements §V.2.17 | `card_handlers.ts:311` | Không chia 50% tiền thu cho chủ thẻ | **`[NỢ KỸ THUẬT SLICE 05]`** |
| **Thẻ CC_LAND_CHANGE** | Requirements §V.2.6 | `card_handlers.ts:276` | Trừ 800 Tr nhưng không tăng tiền thuê vĩnh viễn | **`[NỢ KỸ THUẬT SLICE 05]`** |
| **Lan truyền Delta vi sai (VSC)** | VSC Layer 5 & 6 | `session_manager.ts:18` | Rơi rụng level, isETC, isUpgradedUtility | **`[NỢ KỸ THUẬT SLICE 05]`** |

---

## V. ĐỀ XUẤT LỘ TRÌNH XỬ LÝ (ACTION PLAN)

### 1. Đợt 1 — Hotfix 8 lỗi `[BLOCKER]` (Khuyến nghị thi công ngay trước khi mở Slice 05)
1. **Fix Ô 04**: Thêm nhánh `CellType.Tax` vào `handleSpecialCell()` trong `room_manager.ts`: tính thuế `Math.min(2000, Math.max(0, Math.floor(cur.balance * 0.1)))` và khấu trừ ví.
2. **Fix Đấu giá (Loại trừ)**: Bổ sung `declinedPlayerId` vào `AuctionSession`; từ chối `handleAuctionBid()` nếu `playerId === session.declinedPlayerId`.
3. **Fix Đấu giá (Đóng phiên)**: Thêm `INTENT_AUCTION_PASS` vào `intent_dispatcher.ts` để tự động gọi `handleAuctionClose()` khi mọi người chơi hợp lệ đã pass hoặc hết lượt.
4. **Fix Thuế tài sản qua GO**: Cài đặt hàm tính Thuế tài sản lũy tiến BĐS tại `room_manager.ts:149` theo §IV.1.
5. **Fix Thẻ sự kiện xây dựng & mua bán**: Nhận diện `MC_FREEZE_TRADE` trong `buyProperty()` và `MC_CREDIT_STIMULUS` trong `upgradeProperty()`.
6. **Fix Thẻ thêm lượt & nhân đôi xúc xắc**: Bổ sung cờ `extraTurns: number` và `doubleNextDice: boolean` vào `Player` để bảo lưu lượt qua `handleEndTurn`.
7. **Fix Lệch sự kiện Dịch vụ C2**: Đồng bộ `rentAmount += 200` vào kết quả trả về của `RollResult` khi trúng xúc xắc chẵn.

### 2. Đợt 2 — Đăng ký vào Sổ Nợ Kỹ Thuật (Tech Debt Ledger) bàn giao Slice 05
- Khôi phục hợp đồng `TC-02.3` và thi công giao dịch P2P Trading 5% thuế.
- Xóa bỏ class `AuditManager` thừa trong `audit_manager.ts`.
- Đấu nối `downgradeProperty()` vào FSM Intent khi xây dựng luồng cưỡng chế thanh lý tài sản.
- Cập nhật `DeltaPayload` theo chuẩn Vertical Slice Completeness phản chiếu cấp công trình và cờ hạ tầng lên sa bàn 3D.
