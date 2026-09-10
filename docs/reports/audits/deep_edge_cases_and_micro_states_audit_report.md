# BÁO CÁO KIỂM TOÁN CHUYÊN SÂU TẦNG LOGIC NGHIỆP VỤ VI MÔ (MICRO-STATES & EDGE CASES)
**Dự án**: VTCOON — 3D Real Estate Board Game  
**Tài liệu quy chuẩn đối soát**: `C:\Users\HP\Downloads\Bản kiểm toán chi tiết.md`  
**Ngày thực hiện**: 10/09/2026  
**Phạm vi kiểm toán**: `src/domain/`, `src/server/`, `src/client/`, `tests/`  
**Quy tắc kiểm toán**: Kiểm toán tĩnh và đối soát chuỗi thực thi thực tế, nghiêm cấm sửa mã nguồn trong đợt kiểm toán này.

---

## I. TỔNG QUAN VÀ PHƯƠNG PHÁP KIỂM TOÁN

Bản kiểm toán này rà soát toàn diện hiện trạng mã nguồn thực tế của dự án VTCOON đối chiếu với tài liệu quy chuẩn phát hành thương mại (`Bản kiểm toán chi tiết.md`). Cuộc kiểm toán được thực hiện với thái độ phản biện nghiêm ngặt, bóc tách chuỗi thực thi thực tế ở cả 3 tầng (Domain Engine, Server Runtime / Netcode, Client UI / 3D Scene), đồng thời thẩm tra tính trung thực của bộ kiểm thử tự động (715 test cases đang màu xanh).

### Tóm tắt các phát hiện trọng yếu:
1. **FSM phân mảnh & thiếu dây nối nghiêm trọng**: Không có 11 vi trạng thái khép kín. Enum `TurnPhase` chỉ có 8 trạng thái, trong đó 2 trạng thái là dead enum (`BankruptcyCheck`, `TurnEnd`). Server và Client thiếu đồng bộ trạng thái FSM qua WebSocket.
2. **Turn Timeout Engine hoàn toàn vắng bóng**: Server không hề có bộ đếm thời gian cho các phase (15s Roll, 20s Buy, 15s Auction, 30s Management). Phòng chơi có nguy cơ treo vĩnh viễn nếu người chơi AFK.
3. **Phá sản 2 nhánh bị đứt gãy & tạo tiền ảo từ hư vô**: Khi con nợ thiếu tiền nộp phạt/tiền thuê, hệ thống tự động cộng đủ tiền cho chủ nợ (tiền tự sinh ra). Khi tuyên bố phá sản, đất đai bị xóa sạch thay vì bàn giao cho chủ nợ hoặc đưa vào đấu giá cưỡng chế 70%.
4. **Hệ thống Kho Bạc rò rỉ gần như toàn bộ**: Tiền thuế (`CellType.Tax`), thuế đất vượt GO, lãi vay thế chấp, phí giải chấp 10%, tiền bảo lãnh Ô 10, phạt PCCC đều bị trừ khỏi người chơi nhưng bốc hơi khỏi nền kinh tế thay vì nộp vào `room.treasury`.
5. **Hiện tượng "Gian Lận Kiểm Thử" (Test Cheating / Bug-Codification)**: 715 unit/integration tests xanh nhưng che giấu nhiều lỗi chí tử vì các test file chủ động gọi trực tiếp các hàm nội bộ không hề có Intent từ Client (như `mgr.handleLiquidate`, `mgr.handleEndTurn(..., true)`).

---

## II. BẢNG MA TRẬN ĐỐI SOÁT 25 TÌNH HUỐNG BIÊN (EC-01 ĐẾN EC-25)

| Mã EC | Tên Kịch Bản | Trạng Thái Trong Code | Tọa Độ Code Thực Tế (File:Line) | Mức Độ Rủi Ro | Phân Tích Kỹ Thuật & Hành Vi Thực Tế Trong Mã Nguồn |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **EC-01** | **Double Chain Lock** | **CÓ NHƯNG BỊ LỖI** | [`src/server/audit_manager.ts:79-85`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/audit_manager.ts#L79-L85)<br>[`src/server/turn_loop.ts:89-91,151-155,168`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/turn_loop.ts#L89-L91)<br>[`src/server/intent_dispatcher.ts:59-62`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/intent_dispatcher.ts#L59-L62)<br>[`src/domain/bot/bot_engine.ts:57-60`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_engine.ts#L57-L60) | **Cao** | Đôi 1-2 tăng `consecutiveDoubles`. Khi Client gửi `INTENT_END_TURN`, dispatcher gọi `handleEndTurn(rc, p)` mà không truyền `continueDoubles: true`, FSM tự xóa `consecutiveDoubles = 0` và chuyển lượt, làm mất lượt phụ. Với Bot AI, `decideBotIntent` luôn trả về `INTENT_END_TURN` ở `PropertyManagement` nên Bot không bao giờ được hưởng lượt phụ. Khi Đôi 3, `sendToAudit` chuyển về ô 10 nhưng để `phase = PropertyManagement` thay vì chuyển ngay lượt; Client UI không khóa nút đổ. |
| **EC-02** | **Dice Roll Race** | **ĐÃ CÓ** | [`src/server/network/wss_server.ts:100-112,296-308`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_server.ts#L100-L112)<br>[`src/server/security/rate_limiter.ts:26-42`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/security/rate_limiter.ts#L26-L42)<br>[`src/server/turn_loop.ts:89-91`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/turn_loop.ts#L89-L91) | **Thấp** | RateLimiter giới hạn 10 msg/s (`RATE_LIMIT_EXCEEDED` / `ABUSE_DETECTED`). IntentMutex đảm bảo tuần tự hóa tuyệt đối. Lần đổ thứ 2 bị chặn tại `canRoll` và trả về `CANNOT_ROLL`. |
| **EC-03** | **Pawn Step Sync** | **CÓ NHƯNG BỊ LỖI** | [`src/client/main.tsx:198-235`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/main.tsx#L198-L235)<br>[`src/client/network/apply_delta.ts:111-150`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta.ts#L111-L150) | **Cao** | Client tự sinh xúc xắc ngẫu nhiên cục bộ `d1, d2` trong `handleRollDice`, tự tính tiền vượt GO (+2.000 Tr.) và sau 650ms tự dịch quân cờ, tự mở modal đáp đất. Khi mạng lag 500ms, Server phát `STATE_DELTA` với kết quả PRNG khác, Client giật/snap vị trí và mở trùng lặp modal của 2 ô khác nhau, hiển thị sai lệch tài chính. |
| **EC-04** | **Turn Timer Expiry** | **CHƯA CÓ** | [`src/client/main.tsx:110-113`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/main.tsx#L110-L113)<br>[`src/client/store/game_store.ts:258-261`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store.ts#L258-L261)<br>[`src/server/room_manager.ts:324-345`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts#L324-L345) | **Cao** | Phía Server hoàn toàn không có bộ đếm timeout cho các phase (15s Roll, 20s Buy, 15s Auction, 30s Management); `registerTimer` là dead code. Client chỉ có `setInterval` đếm lùi về 0 rồi dừng, không gửi intent hành động an toàn. Người chơi AFK làm phòng chơi bị đóng băng vô tận. |
| **EC-05** | **Multi-pawn Tile Stacking** | **ĐÃ CÓ** | [`src/client/3d/pawn_animator.tsx:18-20,207-235`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/pawn_animator.tsx#L18-L20) | **Thấp** | Đã định nghĩa mảng `PLAYER_OFFSETS` dạng hình vuông 4 góc `[±0.2, 0, ±0.2]`. Khi 4 quân cờ đứng cùng ô 00 (Khởi Hành), mỗi quân cờ định vị tại một góc riêng, không bị đè xuyên tâm vào nhau. |
| **EC-06** | **Cascade Rent Bankruptcy** | **CÓ NHƯNG BỊ LỖI** | [`src/domain/property_manager.ts:100-104`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_manager.ts#L100-L104)<br>[`src/server/insolvency_manager.ts:109-149`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/insolvency_manager.ts#L109-L149) | **Cao** | Khi trừ tiền thuê quá số dư, `handleLanding` trừ âm tiền người thuê và cộng đủ tiền cho chủ nợ (tiền tự sinh ra từ hư vô). Khi người thuê gọi `declareBankruptcy`, đất đai bị xóa sổ khỏi registry (`registry.delete`) thay vì sang tên cho chủ nợ; chủ nợ không nhận được tiền mặt còn lại và không có quyền chọn nộp 10%/110% phí thế chấp. |
| **EC-07** | **Treasury Conservation** | **CÓ NHƯNG BỊ LỖI** | [`src/server/special_cell_handler.ts:34-38`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/special_cell_handler.ts#L34-L38)<br>[`src/server/turn_loop.ts:109`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/turn_loop.ts#L109)<br>[`src/server/mortgage_manager.ts:207,229`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/mortgage_manager.ts#L207)<br>[`src/server/audit_manager.ts:43`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/audit_manager.ts#L43)<br>[`src/domain/market_card_handlers.ts:81`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/market_card_handlers.ts#L81) | **Cao** | Quỹ Kho Bạc (`room.treasury`) bị rò rỉ ở hầu hết các nghiệp vụ tài chính: (1) Thuế Ô Thuế, (2) Thuế đất vượt GO, (3) Lãi vay thế chấp định kỳ, (4) Phí giải chấp 10%, (5) Tiền bảo lãnh Ô 10, (6) Tiền phạt PCCC. Tất cả các khoản này đều trừ tiền người chơi nhưng biến mất vào hư không, phá vỡ định luật bảo toàn tài sản tiền tệ. |
| **EC-08** | **Zero-Rent Immunity** | **ĐÃ CÓ** | [`src/domain/property_rent.ts:15-18`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_rent.ts#L15-L18)<br>[`src/domain/property_manager.ts:69`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_manager.ts#L69)<br>[`src/domain/market_card_handlers.ts:95`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/market_card_handlers.ts#L95)<br>[`src/domain/event_card_types.ts:45`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/event_card_types.ts#L45) | **Thấp** | Ô 16 Quy Nhơn nằm trong `COASTAL_CELLS`. Khi thẻ `MC_COASTAL_STORM` kích hoạt, `hasZeroRent` trả về `true`, `handleLanding` trả về `rentAmount: 0`, người chơi không bị trừ tiền. |
| **EC-09** | **Entertainment Lockout** | **CÓ NHƯNG BỊ LỖI** | [`src/domain/property_rent.ts:56-66`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_rent.ts#L56-L66)<br>[`src/server/turn_loop.ts:87,187-193`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/turn_loop.ts#L87)<br>[`src/server/session_manager.ts:29-36`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts#L29-L36) | **Trung Bình** | Logic Server tước quyền gieo xúc xắc (`skipNextTurn = true`) khi dẫm vào ô 27 Cấp 3 hoạt động đúng. Tuy nhiên `PlayerDelta` không đồng bộ trường `skipNextTurn` về Client, Client không hiển thị thông báo/banner giam chân giải trí. |
| **EC-10** | **Foreclosure Auction Threshold** | **CÓ NHƯNG BỊ LỖI** | [`src/server/insolvency_manager.ts:68-90,124-129`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/insolvency_manager.ts#L68-L90)<br>[`src/server/room_manager.ts:209-214`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts#L209-L214)<br>[`src/server/intent_dispatcher.ts:1-75`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/intent_dispatcher.ts#L1-L75) | **Cao** | Hàm `liquidateAssets` đã cài đặt logic đấu giá cưỡng chế sàn 70% niêm yết. Tuy nhiên `declareBankruptcy` không gọi `liquidateAssets` mà xóa trắng đất đai; đồng thời không có Intent từ Client để gọi `handleLiquidate`. Các bài test chỉ pass do gọi trực tiếp API nội bộ (Test Mirroring). |
| **EC-11** | **Auction Bidder Self-Exclusion** | **ĐÃ CÓ** | [`src/server/auction_manager.ts:45,74`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/auction_manager.ts#L45) | **Thấp** | Người từ chối mua đất (`declinedPlayerId`) bị chặn tuyệt đối cả khi bid và pass với mã lỗi `DECLINED_PLAYER_CANNOT_BID`. |
| **EC-12** | **Auction Overbid Guard** | **ĐÃ CÓ** | [`src/server/auction_manager.ts:51`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/auction_manager.ts#L51) | **Thấp** | Kiểm tra `player.balance < amount`, trả về lỗi `INSUFFICIENT_FUNDS` ngay lập tức. |
| **EC-13** | **Auction Snipe Extension** | **CHƯA CÓ** | [`src/server/auction_manager.ts:7-14,35-63`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/auction_manager.ts#L7-L14) | **Trung Bình** | `AuctionSession` trên server hoàn toàn không có trường lưu thời gian và không có cơ chế cộng thêm +3 giây khi đặt giá ở 3 giây cuối. |
| **EC-14** | **Illegal P2P Trade** | **ĐÃ CÓ** | [`src/server/property_actions.ts:196-198,208`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/property_actions.ts#L196-L198) | **Thấp** | `hasBuildingOrUpgrade` kiểm tra `level > 0`, `isETC`, `isUpgradedUtility`. Nếu vi phạm trả về `PROPERTY_HAS_BUILDING` và chặn giao dịch. |
| **EC-15** | **P2P Tax Deduction** | **ĐÃ CÓ** | [`src/server/property_actions.ts:168-175,270-273`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/property_actions.ts#L168-L175) | **Thấp** | Khấu trừ đúng 5% thuế (hoặc 10%/20% nếu có thẻ `MC_ANTI_SPECULATE`). Người bán nhận 95%, 5% thuế nạp thẳng vào `room.treasury`. |
| **EC-16** | **HOSE Bankruptcy Prevention** | **ĐÃ CÓ** | [`src/server/hose_actions.ts:17`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/hose_actions.ts#L17)<br>[`src/domain/event_card_types.ts:52-54`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/event_card_types.ts#L52-L54) | **Thấp** | Mặt 1 có hệ số 0.50 (-50%). Cược 500 Tr. nhận lại 250 Tr., số dư còn 250 Tr., không bị âm tiền và không phá sản. |
| **EC-17** | **Double Card Immunity** | **ĐÃ CÓ** | [`src/domain/property_rent.ts:69-78`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_rent.ts#L69-L78)<br>[`src/domain/property_manager.ts:70-72`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_manager.ts#L70-L72) | **Thấp** | `tryUseDiplomaticCard` kiểm tra thẻ `CC_DIPLOMATIC`, tự động gỡ khỏi hand, đẩy vào discard deck và miễn toàn bộ tiền thuê (`rentAmount = 0`). Xử lý đúng thứ tự ưu tiên Zero-rent bão lũ trước để bảo toàn thẻ. |
| **EC-18** | **Warp Pass GO Cash** | **CHƯA CÓ** | [`src/domain/chance_card_handlers.ts:1-229`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/chance_card_handlers.ts#L1-L229)<br>[`src/domain/event_card_engine.ts:74-88`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/event_card_engine.ts#L74-L88) | **Trung Bình** | Bộ 19 thẻ Cơ Hội hiện tại không có thẻ dịch chuyển tức thời (Warp/Teleport) vượt ô GO; hàm `drawChanceCard` không hỗ trợ cập nhật vị trí kèm kiểm tra `checkPassedGo`. |
| **EC-19** | **Card Construction Penalty** | **ĐÃ CÓ** | [`src/domain/market_card_handlers.ts:19,72-83`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/market_card_handlers.ts#L19) | **Thấp** | `FIRE_PENALTIES` chuẩn xác: C1 = 200, C2 = 400, C3 = 800. Tổng khấu trừ cho 2xC1 + 1xC2 + 1xC3 = 1.600 Tr. VNĐ. (Tuy nhiên số tiền phạt bị rò rỉ, không nạp Kho Bạc). |
| **EC-20** | **Card Target Invalidation** | **CÓ NHƯNG BỊ LỖI** | [`src/domain/chance_card_handlers.ts:68-89`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/chance_card_handlers.ts#L68-L89) | **Thấp** | Thẻ `CC_MA_FORCE` duyệt danh sách đối thủ nghèo hơn, nếu không tìm thấy ô đất trống thỏa mãn thì kết thúc an toàn, không gây crash server. Tuy nhiên không phát ra thông báo hoặc reason code thông báo thẻ bị vô hiệu cho Client. |
| **EC-21** | **Mid-Auction Disconnect** | **CHƯA CÓ** | [`src/server/auction_manager.ts:7-14,100-129`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/auction_manager.ts#L7-L14) | **Trung Bình** | `AuctionSession` chỉ lưu `highestBidder`, không lưu người đặt giá cao thứ nhì (`secondHighestBidder`). Nếu người dẫn đầu mất mạng hoặc không đủ tiền, phiên đấu giá hủy bỏ chứ không trao cho người thứ nhì. |
| **EC-22** | **F5 Full Snapshot** | **CHƯA CÓ** | [`src/client/main.tsx:259`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/main.tsx#L259)<br>[`src/client/store/lobby_store.ts:17-25`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/lobby_store.ts#L17-L25)<br>[`src/server/session_manager.ts:38-42`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts#L38-L42) | **Cao** | Khi bấm F5, Zustand `lobby_store` reset `gameStarted = false` đẩy người chơi ra lại màn hình Lobby; `DeltaPayload` từ server không chứa thông tin modal hay quyết định đang chờ, Modal Sổ Đỏ bị mất hoàn toàn. |
| **EC-23** | **Ghost Socket Superseding** | **ĐÃ CÓ** | [`src/server/network/wss_server.ts:249-257`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_server.ts#L249-L257) | **Thấp** | Khi tab mới gửi `RECONNECT` với token hợp lệ, Server tìm thấy socket cũ, đóng socket cũ với mã đóng 1000 và lý do `SUPERSEDED_BY_RECONNECT`, cấp quyền độc quyền cho tab mới. |
| **EC-24** | **Mobile Touch Target** | **CÓ NHƯNG BỊ LỖI** | [`src/client/ui/action_dock.tsx:108,130,142,154`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/action_dock.tsx#L108)<br>[`src/client/3d/board_layout.tsx:64-73`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_layout.tsx#L64-L73) | **Trung Bình** | Các nút thanh điều khiển đặt `min-h-[44px]` (chưa đạt chuẩn tối thiểu 48x48dp của WCAG/Mobile); các ô cờ trên sa bàn 3D (`LayeredDioramaTile`) không có sự kiện `onClick` cảm ứng để mở xem chi tiết sổ đỏ. |
| **EC-25** | **Audio Unlock Resilience** | **ĐÃ CÓ** | [`src/client/audio/audio_engine.ts:24-43,80-86`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/audio/audio_engine.ts#L24-L43) | **Thấp** | `AudioEngine.init()` lắng nghe `pointerdown`, `keydown`, `touchstart` để mở khóa `Howler.ctx.resume()`. Nạp file âm thanh có bọc `playerror` và `loaderror` fallback im lặng, không gây lỗi console DOMException. |

---

## III. ĐỐI SOÁT CHUYÊN SÂU 5 TRỌNG TÂM KIẾN TRÚC VI MÔ

### 1. Phân Tách Vi Trạng Thái FSM (Micro-State Transitions) & Bí Ẩn Về Trạm Kiểm Toán (Ô 10)
- **Thực trạng enum FSM**:
  Tại [`src/domain/room.ts:10-19`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts#L10-L19), enum `TurnPhase` chỉ định nghĩa 8 trạng thái:
  ```ts
  export enum TurnPhase {
    WaitingRoll        = 'WaitingRoll',
    ActionPhase        = 'ActionPhase',
    AuctionPhase       = 'AuctionPhase',
    PropertyManagement = 'PropertyManagement',
    InsolvencyPhase    = 'InsolvencyPhase',
    BankruptcyCheck    = 'BankruptcyCheck',
    TurnEnd            = 'TurnEnd',
    HosePhase          = 'HosePhase',
  }
  ```
  Trong số này, `BankruptcyCheck` và `TurnEnd` là **Dead Enum** (chỉ xuất hiện trong từ điển i18n `vi.ts`, không bao giờ được gán trong runtime).
  Hệ thống hoàn toàn không có các vi trạng thái khép kín như tài liệu quy chuẩn: `TURN_INIT`, `ROLLING_DICE`, `MOVING_PAWN`, `TILE_RESOLVE` (với các nhánh con 6A-6F), `SOLVENCY_CHECK`, `TURN_TRANSITION`.
- **Trạng thái đồng bộ mạng**:
  Trong `DeltaPayload` ([`src/server/session_manager.ts:38-42`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts#L38-L42)), trường `phase` và `currentPlayerIndex` **hoàn toàn không được gửi về Client**. Client phải tự phán đoán lượt chơi và trạng thái nút bấm qua cờ cục bộ của Zustand (`isRolling`, `isPawnMoving`).
- **Cơ chế Đổ Đôi Chaining**:
  * Biến `consecutiveDoubles` được tăng tại [`src/server/audit_manager.ts:79`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/audit_manager.ts#L79).
  * Khi đổ đôi lần 1 hoặc 2: Code tại [`src/server/turn_loop.ts:89`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/turn_loop.ts#L89) cho phép roll tiếp nếu `current.consecutiveDoubles > 0 && room.phase === TurnPhase.PropertyManagement`. Tuy nhiên, khi Client gửi `INTENT_END_TURN`, hàm `dispatchPlayerIntent` ([`src/server/intent_dispatcher.ts:59`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/intent_dispatcher.ts#L59)) gọi `m.handleEndTurn(rc, p)` mà **không truyền tham số `continueDoubles`**. Điều này dẫn đến việc `executeTurnEnd` xóa trắng `current.consecutiveDoubles = 0` và chuyển lượt sang người kế tiếp, vô hiệu hóa lượt phụ.
  * Với Bot AI: `decideBotIntent` ([`src/domain/bot/bot_engine.ts:57-60`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_engine.ts#L57-L60)) khi ở `PropertyManagement` luôn trả về `{ type: 'INTENT_END_TURN' }`, khiến Bot không bao giờ được hưởng lượt phụ khi đổ đôi.
- **Trạm Kiểm Toán (Ô 10) — Sự Thật Về `handleTurnStart`**:
  * Hàm `handleTurnStart` ([`src/server/audit_manager.ts:17`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/audit_manager.ts#L17)) là **mã nguồn mồ côi (Orphan Code)**: Server runtime trong `wss_server.ts` và `turn_loop.ts` **không hề gọi hàm này**. Nó chỉ được gọi trong các file kiểm thử unit test!
  * Do đó, khi tới lượt người chơi đang thụ án (`auditTurnsLeft > 0`), hàm `executeTurnEnd` (`turn_loop.ts:192`) vẫn set `room.phase = TurnPhase.WaitingRoll`.
  * **Lỗi chí tử khi đổ không ra đôi**: Khi người chơi gửi `INTENT_ROLL` để tìm mặt đôi, hàm `processRollDoubles` (`audit_manager.ts:67`) chạy. Nếu không ra đôi, nó trả về `{ stopped: true }` (không có trường `result`). Khi đó `executeTurnRoll` trả về `undefined`, dẫn đến `wss_server.ts:308` coi đây là lỗi thất bại và gửi frame `{ type: 'ERROR', reasonCode: 'CANNOT_ROLL' }`, đồng thời **bỏ qua việc phát sóng `STATE_DELTA`**! Server tự đổi phase sang `PropertyManagement` nhưng Client không hề nhận được delta cập nhật.
  * **Thoát án miễn phí sau 3 vòng**: Trong `turn_loop.ts:169`, `auditTurnsLeft` chỉ bị trừ đơn thuần `-1`. Khi giảm về 0, không có logic cưỡng chế nộp 500 Tr. Người chơi được ra tù hoàn toàn miễn phí mà không tốn 1 xu bảo lãnh.

---

### 2. Cơ Chế Timeout Tự Hành Phân Đoạn (Turn Timeout Engine)
- **Phía Server**:
  * Hoàn toàn không có bất kỳ bộ đếm thời gian phân đoạn nào cho từng phase: 15s Roll, 20s Buy, 15s Auction, 30s Management.
  * Phương thức `registerTimer` tại [`src/server/room_manager.ts:324`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts#L324) là phương thức rỗng không được gọi ở bất kỳ đâu trong mã nguồn.
  * Server chỉ có duy nhất Grace Period đứt kết nối 60s tại [`src/server/network/reconnect_manager.ts:116`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/reconnect_manager.ts#L116).
  * Hậu quả: Nếu người chơi giữ kết nối WebSocket nhưng AFK không bấm nút, hoặc treo máy ở màn hình mua đất, Server không tự động từ chối mua hay tự kết thúc lượt. Phòng chơi sẽ bị treo vĩnh viễn.
- **Phía Client**:
  * Tại [`src/client/main.tsx:110-113`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/main.tsx#L110-L113), Client chạy một `setInterval` cục bộ trừ dần `turnTimeRemaining` từ 60 về 0.
  * Khi về 0, hàm `decrementTurnTimer` ([`src/client/store/game_store.ts:258-261`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store.ts#L258-L261)) dùng `Math.max(0, ...)` và dừng lại ở 0, không gửi intent hay kích hoạt bất kỳ sự kiện nào.

---

### 3. Cơ Chế Phá Sản Dây Chuyền 2 Nhánh (Cascading Bankruptcy)
Kiểm tra [`src/server/insolvency_manager.ts:109-149`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/insolvency_manager.ts#L109-L149) và [`src/domain/property_manager.ts:100-105`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_manager.ts#L100-L105):
- **Hiện tượng Tiền Tự Sinh Từ Hư Vô (Phantom Money Generation)**:
  * Trong `handleLanding` (`src/domain/property_manager.ts:100-101`), khi người chơi nợ tiền thuê vượt số dư:
    ```ts
    player.balance -= rentAmount;
    if (owner !== undefined) owner.balance += rentAmount;
    ```
    Nếu P1 có 1.000 Tr., dẫm ô thuê 8.800 Tr., P1 bị âm thành -7.800 Tr., còn chủ nợ P2 được cộng ngay lập tức +8.800 Tr. Đúng 7.800 Tr. đã được in khống ra từ hư vô trước khi con nợ giải quyết khủng hoảng tài chính!
- **Nhánh 1 (Nợ người chơi khác)**:
  * Hàm `declareBankruptcy(room, playerId, registry, stateMap)` không nhận tham số chủ nợ (`creditorId`).
  * Toàn bộ đất đai của con nợ bị xóa sạch khỏi bàn cờ bằng lệnh `registry.delete(cellIndex)` và `stateMap.delete(cellIndex)`.
  * Không có logic chuyển nhượng đất sang chủ nợ, không có quyền chọn cho chủ nợ nộp 10% giữ thế chấp hoặc 110% giải chấp.
- **Nhánh 2 (Nợ Kho bạc / Nhà nước) & Sự Đứt Gãy Của `liquidateAssets`**:
  * Khi phá sản do nợ nhà nước, đất đai cũng bị xóa khỏi bàn cờ thay vì đưa vào đấu giá cưỡng chế.
  * Logic tạo phiên đấu giá cưỡng chế 70% giá niêm yết đã được viết trong hàm `liquidateAssets` ([`src/server/insolvency_manager.ts:68-90`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/insolvency_manager.ts#L68-L90)), nhưng hàm này chỉ được gọi qua `handleLiquidate` trên `RoomManager` mà **không hề có Intent tương ứng trong `intent_dispatcher.ts`**, đồng thời `declareBankruptcy` không bao giờ gọi hàm này.

---

### 4. Quy Tắc Đấu Giá Chuyên Sâu & Anti-Sniping
Kiểm tra [`src/server/auction_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/auction_manager.ts):
- **Anti-Sniping (+3s khi đặt giá ở 3s cuối)**:
  * Hoàn toàn không tồn tại trong mã nguồn. Cấu trúc `AuctionSession` không hề lưu thời gian kết thúc hoặc thời gian bắt đầu.
- **Chặn người từ chối tham gia đấu giá**:
  * Đã cài đặt chuẩn xác tại dòng 45 và dòng 74: `if (playerId === session.declinedPlayerId) return { success: false, reason: ActionRejectReason.DECLINED_PLAYER_CANNOT_BID };`.
- **Chặn đặt giá vượt tiền mặt**:
  * Đã cài đặt chuẩn xác tại dòng 51: `if (player.balance < amount) return { success: false, reason: 'INSUFFICIENT_FUNDS' };`.
- **Người trả giá cao nhất mất kết nối**:
  * `AuctionSession` không lưu người trả giá cao thứ nhì. Nếu người dẫn đầu mất mạng, hệ thống hủy phiên đấu giá thay vì trao quyền mua cho người về nhì.

---

### 5. Động Lực Học Sa Bàn 3D & Tránh Chồng Lấn Quân Cờ
Kiểm tra [`src/client/3d/pawn_animator.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/pawn_animator.tsx):
- **Phân tán tọa độ tránh chồng lấn**:
  * Đã cài đặt mảng hằng số tại dòng 18-20:
    ```ts
    export const PLAYER_OFFSETS: readonly [number, number, number][] = [
      [-0.2, 0, -0.2], [0.2, 0, -0.2], [-0.2, 0, 0.2], [0.2, 0, 0.2],
    ] as const;
    ```
  * Mỗi người chơi được gán một offset cố định dựa trên chỉ số index (`PLAYER_OFFSETS[index % 4]`).
  * Khi cả 4 người chơi cùng đứng tại Ô 00 (Khởi Hành), 4 mô hình quân cờ đứng tại 4 góc của ô đất với khoảng cách phân tán `±0.2`, hoàn toàn không bị đè xuyên tâm tại `(0, 0, 0)`.

---

## IV. KHOẢNG TRỐNG KIẾN TRÚC & HÀNH VI GIAN LẬN KIỂM THỬ

### 1. Tính Năng Quy Chuẩn Hoàn Toàn Chưa Được Code (Ghost Features)
1. **11 Vi Trạng Thái FSM Khép Kín**: Chưa có state machine đầy đủ ở cả Server và Client; `DeltaPayload` không đồng bộ `phase` và `currentPlayerId`.
2. **Bộ Đếm Phân Đoạn Server (Turn Timeout Engine)**: Chưa có timer cho từng phase (15s Roll, 20s Buy, 15s Auction, 30s Management).
3. **Quy Tắc Anti-Sniping Đấu Giá**: Chưa có đồng hồ đếm ngược phiên đấu giá và logic gia hạn +3 giây khi có bid hợp lệ ở thời gian còn lại <= 3s.
4. **Phá Sản Chuyển Giao Chủ Nợ (Player-to-Player Bankruptcy)**: Chưa có cơ chế chuyển giao tài sản và quyền nộp 10%/110% cho đất thế chấp.
5. **Tự Động Nộp Phạt Sau 3 Vòng Ô 10**: Không có logic tự động trừ 500 Tr. khi hết 3 vòng thụ án.
6. **Thẻ Dịch Chuyển Vượt Ô GO (Warp Pass GO)**: Chưa có thẻ Cơ Hội dịch chuyển tức thời và cộng 2.000 Tr. vượt ô Khởi Hành.
7. **Đấu Giá Tiếp Quản Khi Disconnect**: Chưa lưu người đặt giá thứ nhì để giải quyết khi người dẫn đầu mất mạng.
8. **Khôi Phục Nguyên Trạng Sau F5 (Full Snapshot Restore)**: F5 làm mất trạng thái ván đấu đang chơi và làm biến mất Modal Sổ Đỏ.

### 2. Tính Năng Đã Code Nhưng Thiếu Dây Nối (Disconnected Wiring)
1. **Dây nối Đổ Đôi Lượt Phụ (`continueDoubles`)**:
   * *Vị trí*: [`src/server/intent_dispatcher.ts:59`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/intent_dispatcher.ts#L59) và [`src/domain/bot/bot_engine.ts:60`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_engine.ts#L60).
   * *Nguyên nhân*: Gọi `handleEndTurn(rc, p)` thiếu tham số `continueDoubles = true` khi `current.consecutiveDoubles > 0`.
2. **Dây nối Đấu Giá Cưỡng Chế 70% (`liquidateAssets`)**:
   * *Vị trí*: [`src/server/insolvency_manager.ts:68-90`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/insolvency_manager.ts#L68-L90) và [`src/server/room_manager.ts:209`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts#L209).
   * *Nguyên nhân*: Đã code đấu giá sàn 70% trong `liquidateAssets`, nhưng hàm `declareBankruptcy` không gọi hàm này mà xóa thẳng đất; `intent_dispatcher.ts` không có intent nào gọi `handleLiquidate`.
3. **Dây nối và Lỗi Xử Lý Xúc Xắc Không Đôi Tại Trạm Kiểm Toán**:
   * *Vị trí*: [`src/server/audit_manager.ts:17,67`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/audit_manager.ts#L17) và [`src/server/wss_server.ts:308`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/wss_server.ts#L308).
   * *Nguyên nhân*: `handleTurnStart` là code mồ côi; khi đổ không ra đôi tại Ô 10, server trả về lỗi `CANNOT_ROLL` và bỏ qua việc phát sóng `STATE_DELTA`.
4. **Dây nối Đồng Bộ Trạng Thái Giam Chân (`skipNextTurn`)**:
   * *Vị trí*: [`src/server/session_manager.ts:29-36`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts#L29-L36).
   * *Nguyên nhân*: Server tính toán cờ `skipNextTurn` của ô 27 C3, nhưng `PlayerDelta` bỏ quên không đưa `skipNextTurn` vào payload gửi về Client.
5. **Rò Rỉ Nghiêm Trọng Quỹ Kho Bạc (`room.treasury`)**:
   * *Vị trí*: [`special_cell_handler.ts:35`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/special_cell_handler.ts#L35), [`turn_loop.ts:109`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/turn_loop.ts#L109), [`mortgage_manager.ts:207,229`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/mortgage_manager.ts#L207), [`audit_manager.ts:43`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/audit_manager.ts#L43), [`market_card_handlers.ts:81`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/market_card_handlers.ts#L81).
   * *Nguyên nhân*: Trừ tiền người chơi nhưng không nạp vào `room.treasury`.
6. **Lỗi Xung Đột Xúc Xắc Client/Server (Optimistic Roll Desync)**:
   * *Vị trí*: [`src/client/main.tsx:198-235`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/main.tsx#L198-L235).
   * *Nguyên nhân*: Client tự sinh xúc xắc ngẫu nhiên cục bộ thay vì đợi kết quả xúc xắc có bản quyền từ Server qua `STATE_DELTA`.

### 3. Vạch Trần Hành Vi Gian Lận Trong Bộ Test (Test Bug-Codification Audit)
Đối soát với Global Rule 4 ("No Cheating", "Zero Bug-Codification"), chúng tôi phát hiện nhiều bài test đang che giấu lỗi thực tế bằng cách gọi tắt API:
1. **Gian lận Đấu giá Thanh lý**: Trong [`golden_gameplay_flow.test.ts:424`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/integration/golden_gameplay_flow.test.ts#L424) và [`debt_mechanics.test.ts:376`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/server/debt_mechanics.test.ts#L376), test gọi trực tiếp `mgr.handleLiquidate(...)` thay vì thông qua `dispatchPlayerIntent`. Mã nguồn thực tế không có Intent nào kích hoạt được hàm này!
2. **Gian lận Đổ Đôi Chaining**: Trong [`doubles_fsm.test.ts:179`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/domain/doubles_fsm.test.ts#L179), test gọi `mgr.handleEndTurn(room.roomCode, 'p1', true)`. Tham số thứ ba `true` được nhồi thủ công bằng tay; trong khi WebSocket client gửi `INTENT_END_TURN` chỉ đi qua `intent_dispatcher.ts` vốn hoàn toàn bỏ trống tham số này (mặc định là `false`)!

---

## V. KẾT LUẬN & ĐỀ XUẤT LỘ TRÌNH KHẮC PHỤC

1. **Ưu tiên 1 (Sửa lỗi nghiêm trọng & Dây nối FSM - P0)**:
   - Sửa `intent_dispatcher.ts` và `bot_engine.ts`: Tự động nhận diện `consecutiveDoubles > 0` để truyền `continueDoubles = true` sang `handleEndTurn`.
   - Sửa `main.tsx`: Loại bỏ xúc xắc ngẫu nhiên độc lập ở Client, chuyển sang nhận kết quả từ Server qua `STATE_DELTA` để triệt tiêu lỗi lệch ô khi mạng lag (EC-03).
   - Sửa `audit_manager.ts` & `turn_loop.ts`: Trả về kết quả hợp lệ khi đổ không ra đôi ở Ô 10 thay vì trả về `undefined` gây lỗi `CANNOT_ROLL`.
   - Nạp toàn bộ các khoản thuế, lãi phạt vào `room.treasury` (EC-07).
2. **Ưu tiên 2 (Hạ tầng Server & Đấu giá - P1)**:
   - Bổ sung Turn Timeout Engine trên Server: Đảm bảo phòng chơi tự động chuyển lượt hoặc từ chối mua đất khi hết thời gian, ngăn chặn treo phòng vĩnh viễn (EC-04).
   - Nối hàm `liquidateAssets` vào quy trình phá sản `declareBankruptcy` để đưa đất bị ngân hàng tịch thu vào đấu giá sàn 70% (EC-10).
   - Triển khai Anti-Sniping (+3s) cho phiên đấu giá trong `auction_manager.ts` (EC-13).
   - Bổ sung cơ chế phá sản dây chuyền nợ người chơi (sang tên đất và tiền cho chủ nợ, xử lý đất thế chấp 10%/110%) (EC-06).
3. **Ưu tiên 3 (Trải nghiệm người dùng & Thiết bị - P2)**:
   - Thêm trường `skipNextTurn` vào `PlayerDelta` và hiển thị banner thông báo bị giam chân trên Client UI (EC-09).
   - Mở rộng kích thước vùng chạm nút bấm lên tối thiểu 48x48dp và gắn sự kiện click cho các ô cờ 3D (EC-24).
   - Lưu trạng thái phòng vào localStorage hoặc phục hồi snapshot sau khi F5 (EC-22).

---

## VI. REMAINING QUESTIONS & GAPS

1. **Vấn đề chưa thể kiểm chứng thực tế trong phiên**:
   - Tương thích cảm ứng trên thiết bị vật lý thực tế (iPhone/Android Touch Target): Hiện chỉ kiểm tra qua mã CSS Tailwind (`min-h-[44px]`). Cần kiểm thử thực tế trên thiết bị di động để đo đạc chính xác kích thước pixel vật lý (dp).
2. **Khu vực có bằng chứng yếu hoặc chưa hoàn chỉnh**:
   - Trải nghiệm âm thanh Howler trên Safari iOS (Autoplay Policy): Code đã có hook resume trên `touchstart`, nhưng trên một số phiên bản iOS WebKit cũ có thể cần chạm trực tiếp vào element AudioContext cụ thể.
3. **Đầu mối đã xác định nhưng cần điều tra sâu hơn**:
   - Tác động hiệu năng của giải pháp Snapshot F5 lên băng thông mạng: Khi bổ sung toàn bộ danh mục 40 ô, danh sách modal đang mở, và token phiên vào `DeltaPayload`, cần đo đạc lại payload kích thước nén gzip để đảm bảo tuân thủ NFR Baseline (< 10KB/delta).
4. **Ưu tiên cho điều tra viên / kỹ sư tiếp theo**:
   - Tập trung viết lại các bài test bị dính "Test Bug-Codification" (`golden_gameplay_flow.test.ts`, `doubles_fsm.test.ts`) để assert trực tiếp qua pipeline `dispatchPlayerIntent` thay vì gọi tắt qua private/internal methods.
