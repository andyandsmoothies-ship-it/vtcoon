# VTCOON DOMAIN GOTCHAS ARCHIVE (HISTORICAL INVARIANTS #1 - #100)

> **HISTORICAL ARCHIVE**: Lưu trữ các bài học và quyết định kỹ thuật từ Slice 01 đến IMP-75 (#1 đến #100).
> Các bài học này đã được ổn định và bọc kín bởi test suites. Để tra cứu các Gotchas đang hoạt động, xem docs/domain/gotchas.md.

---

### 1. [FSM] Market Modifiers Lifecycle & Scope (Slice 04)
- **Bẫy nghiệp vụ**: Khi duyệt `Room.activeModifiers` để tính tiền thuê (`handleLanding`), không được chỉ kiểm tra loại thẻ (`m.type`). Ngoài ra, không được suy giảm modifier (`decayModifiers`) ở mỗi lượt đơn lẻ.
- **Ràng buộc cứng**:
  1. `m.remainingRounds > 0`: Tránh áp dụng hiệu ứng khi bão/thẻ đã hết hạn.
  2. `m.affectedCells.includes(cellIndex)`: Không kiểm tra mảng hằng số tĩnh vì modifier có thể chỉ tác động cục bộ.
  3. Chu kỳ suy giảm: `decayModifiers()` chỉ được gọi khi hoàn thành trọn vẹn 1 vòng chơi (Round), tức khi lượt chuyển về người chơi đầu tiên (`currentPlayerIndex === 0`), bảo đảm mọi người chơi đều trải qua lượt chịu modifier.
- **Giải pháp**: Gọi hàm dùng chung `hasZeroRent()` / `calculateRent()` trong `property_manager.ts`; gọi `decayModifiers()` tại ranh giới round trong `room_manager.ts`.

---

### 2. [FSM] Audit Bailout Lifecycle & FSM Phase Resolution (Slice 04)
- **Bẫy nghiệp vụ**: `handleBailOut()` không được vô điều kiện chuyển `room.phase` về `WaitingRoll`. Không có thẻ Cơ hội nào giải cứu Trạm Kiểm Toán.
- **Ràng buộc cứng**:
  1. Nếu người chơi bảo lãnh ở đầu lượt (chưa tung xúc xắc): chuyển về `WaitingRoll` để được tung xúc xắc di chuyển.
  2. Nếu người chơi bảo lãnh giữa lượt (sau khi dẫm ô 30 TaxOrder): phải chuyển về `PropertyManagement` để kết thúc lượt (`INTENT_END_TURN`), ngăn chặn vi phạm luật chơi (tung xúc xắc 2 lần trong 1 lượt).
  3. Thẻ thoát Trạm duy nhất là nộp tiền bảo lãnh 500 Tr. VNĐ (`INTENT_BAIL_OUT`). Thẻ `CC_DIPLOMATIC` KHÔNG dùng để thoát Trạm Kiểm Toán.
- **Giải pháp**: Quản lý trạng thái `rolledThisTurn` trong `RoomManager`.

---

### 3. [FSM] Thẻ Ngoại Giao CC_DIPLOMATIC & Thẻ Thuế CC_TAX_AUDIT (Slice 04)
- **Bẫy nghiệp vụ**: Nhầm lẫn chức năng `CC_DIPLOMATIC` (thành thẻ ra tù) và `CC_TAX_AUDIT` (thành thẻ tống giam).
- **Ràng buộc cứng**:
  1. `CC_DIPLOMATIC`: Lưu vào `player.hand`. Khi dẫm BĐS đối thủ (`CellType.Property`), tự động tiêu thụ thẻ đưa vào `chanceDiscard` và đặt `rentAmount = 0` (miễn 100% chi phí tại mọi cấp công trình C0–C3 theo SSOT §V.2.4; không áp dụng cho Hạ tầng Giao thông hay Tiện ích).
  2. Thứ tự ưu tiên Zero-rent: Nếu ô đất chịu ảnh hưởng `MC_COASTAL_STORM` (Zero-rent), hiệu ứng bão miễn phí trước và bảo toàn `CC_DIPLOMATIC` trên tay (không tiêu thụ).
  3. `CC_TAX_AUDIT`: Phạt 200 Tr. VNĐ cho mỗi ô đất trống (Cấp 0) người chơi đang sở hữu nộp vào Kho bạc. Tuyệt đối không đưa người chơi vào Trạm Kiểm Toán (SSOT §I khẳng định không thẻ Cơ hội nào bắt vào Trạm). Chỉ đếm các ô BĐS (`CellType.Property`), bỏ qua Hạ tầng và Tiện ích.

---

### 4. [FSM] Thẻ Vay Nợ Vốn Lưu Động CC_OVERDRAFT & CC_FREE_CREDIT (Slice 04)
- **Bẫy nghiệp vụ**: Chỉ ghi nhận thẻ vào `player.pendingDebts` mà không giải ngân tiền mặt.
- **Ràng buộc cứng**: Khi rút thẻ vay nợ, phải lập tức cộng tiền mặt khả dụng vào ví người chơi (`CC_OVERDRAFT` +3.000 Tr., `CC_FREE_CREDIT` +2.000 Tr.) song song với việc lưu ID thẻ vào `player.pendingDebts`.

---

### 5. [UAT] Ghi tệp mã nguồn và Shell Escaping (Slice 05)
- **Bẫy kỹ thuật**: Sử dụng lệnh shell terminal (`echo`, `cat`, PowerShell `here-string @"..."@`, toán tử `>`) để ghi trực tiếp mã nguồn TypeScript/JavaScript.
- **Hậu quả**:
  1. PowerShell diễn giải ký tự backtick (`` ` `` - template literal trong TS) là ký tự escape của shell, dẫn đến vỡ chuỗi và lỗi `ParserError: Missing end-quote in string`.
  2. Lệnh redirect shell trên Windows PowerShell 5.1 tự động gán bảng mã UTF-16 LE thay vì UTF-8, làm hỏng tệp khi Vite/tsc đọc.
- **Giải pháp bắt buộc**: BẮT BUỘC sử dụng công cụ gốc chuyên dụng (`write_to_file` hoặc `replace_file_content`) với UTF-8 chuẩn; tuyệt đối không tạo/ghi tệp code qua dòng lệnh shell.

---

### 6. [FSM/DATA] Bẫy thuộc tính nâng cấp Hạ tầng ETC và Tiện ích (Slice 05)
- **Bẫy nghiệp vụ**: Tự bịa trường trạng thái không có trong mô hình miền (như `etcActive`) khi kiểm tra điều kiện chuyển nhượng P2P hoặc thế chấp, dẫn đến việc phải ép kiểu `as any` để vượt qua bộ kiểm tra kiểu TypeScript.
- **Ràng buộc cứng**:
  1. Mô hình `PropertyState` trong `property_manager.ts` chỉ định nghĩa chuẩn hai cờ nâng cấp: `isETC?: boolean` (cho 4 ô đường sắt ETC 5, 15, 25, 35) và `isUpgradedUtility?: boolean` (cho 2 ô tiện ích 12, 28).
  2. Khi chuyển nhượng P2P (`executeP2PTrade`) hoặc thẩm định tài sản, bất động sản/tiện ích/hạ tầng chỉ được giao dịch ở trạng thái nguyên bản (Cấp 0, chưa kích hoạt ETC, chưa nâng cấp tiện ích). Điều kiện chặn bắt buộc: `(state?.level ?? 0) > 0 || Boolean(state?.isETC) || Boolean(state?.isUpgradedUtility)`.
  3. Tuyệt đối cấm sử dụng `as any` trong mã nguồn và bộ kiểm thử. Mọi mock trạng thái bất động sản phải tuân thủ nghiêm ngặt kiểu `PropertyState` / `PropertyStateMap`.
- **Giải pháp**: Sử dụng trực tiếp `state.isETC` và `state.isUpgradedUtility`, kiểm tra chuẩn kiểu và tái sử dụng `PropertyStateMap`.

---

### 7. [FSM] Bẫy phong tỏa FSM trong InsolvencyPhase (Slice 05)
- **Bẫy nghiệp vụ**: Người chơi có số dư âm (`balance < 0`) vẫn có thể thực thi các hành động mua tài sản hoặc bấm kết thúc lượt để trốn tránh vỡ nợ, hoặc FSM tự động hoàn nguyên về `PropertyManagement` khi số dư vẫn còn âm.
- **Ràng buộc cứng**:
  1. Khi người chơi bị trừ tiền khiến `balance < 0`, FSM lập tức chuyển trạng thái sang `TurnPhase.InsolvencyPhase`.
  2. Trong `InsolvencyPhase`, FSM phong tỏa toàn bộ các Intent mua bán thông thường: chỉ chấp nhận duy nhất 2 Intent giải cứu dòng tiền là `INTENT_MORTGAGE` (thế chấp đất Cấp 0 lấy 50% thị giá) và `INTENT_DOWNGRADE` (hạ cấp công trình hoàn lại 50% chi phí xây).
  3. Cấm tuyệt đối `INTENT_BUY` và `INTENT_END_TURN`. Người chơi không được kết thúc lượt chừng nào chưa giải quyết xong khoản nợ âm.
  4. FSM chỉ được phép hoàn nguyên về pha trước đó (hoặc `PropertyManagement`) khi và chỉ khi số dư khả dụng thực tế được giải cứu đạt `>= 0`. Nếu hết tài sản để huy động mà vẫn âm, hệ thống sẽ kích hoạt cưỡng chế thanh lý hoặc tuyên bố phá sản (`BANKRUPTCY_DECLARED`).
- **Giải pháp**: Thiết lập chốt chặn nghiêm ngặt trong `intent_dispatcher.ts` và `insolvency_manager.ts`, kiểm tra điều kiện thoát pha dựa trên số dư thực tế.

---

### 8. [FSM] Quy tắc phân cấp thứ tự ưu tiên vĩ mô Thẻ Thị Trường (Slice 05)
- **Bẫy nghiệp vụ**: Tính toán sai lãi suất thế chấp khi có nhiều thẻ vĩ mô cùng hoạt động trong `Room.activeModifiers`, đặc biệt là sự xung đột giữa chính sách kích cầu tín dụng và chính sách thắt chặt tiền tệ.
- **Ràng buộc cứng**:
  1. Lãi suất thế chấp mặc định khi vượt qua ô GO là 5% (`DEFAULT_INTEREST_RATE = 0.05`).
  2. Khi thẻ Tăng lãi suất `MC_RATE_HIKE` có hiệu lực, lãi suất tăng lên 10% (`RATE_HIKE_RATE = 0.10`).
  3. Khi thẻ Kích cầu tín dụng `MC_CREDIT_STIMULUS` có hiệu lực, lãi suất được miễn giảm về 0% (`0`).
  4. Quy tắc phân cấp ưu tiên: `MC_CREDIT_STIMULUS` (lãi suất 0%) chiếm ưu tiên tuyệt đối so với `MC_RATE_HIKE` (10%). Nếu cả hai thẻ cùng kích hoạt song song trong phòng chơi, chính sách hỗ trợ 0% phải được áp dụng trước để bảo vệ người vay theo quy định gói hỗ trợ khẩn cấp.
- **Giải pháp**: Hàm `getMortgageInterestRate()` kiểm tra `stimulusActive` trước; chỉ khi không có gói kích cầu mới xét đến `hikeActive`, và cuối cùng trả về lãi suất mặc định.

---

### 9. [FSM] Thuế Chuyển Nhượng P2P Trading (Slice 05 - SSOT §I.22)
- **Bẫy nghiệp vụ**: Trừ thuế từ Bên Mua thay vì Bên Bán (Bên nhận tiền).
- **Ràng buộc cứng**:
  1. Theo SSOT §I.22: *"Bên nhận tiền phải đóng thuế giao dịch 5% (hoặc 20% khi có MC_ANTI_SPECULATE) trên tổng giá trị nhận được vào Kho bạc Nhà nước"*.
  2. Bên Mua trả đúng giá niêm yết/thỏa thuận: `buyer.balance -= price`. Điều kiện hợp lệ: `buyer.balance >= price`.
  3. Bên Bán thực nhận sau thuế: `seller.balance += price * (1 - taxRate)`.
  4. Kho bạc nhận: `room.treasury += price * taxRate`.
  5. Đẳng thức bảo toàn dòng tiền: `-price + price * (1 - taxRate) + price * taxRate = 0` (sai số 0 Tr. VNĐ).
- **Giải pháp**: Trong `validateP2PTrade` và `executeP2PTrade`, trích xuất thuế từ bên bán và chuyển vào kho bạc.

---

### 10. [FSM] Vòng Đời Thẻ Sự Kiện Phải Khép Kín Consumer (Slice 04-05)
- **Bẫy nghiệp vụ**: Thẻ sự kiện chỉ được đẩy vào `Room.activeModifiers` (Producer) nhưng các hàm tính toán thế chấp/tiền thuê (Consumer) không đọc tới, tạo ra Dead Modifier.
- **Ràng buộc cứng**:
  1. Thẻ `MC_URBAN_PLANNING`: Khi thế chấp đất tại Hà Nội (31, 32, 34) và TP.HCM (37, 39), định giá đất tăng thêm 20% giá trị -> nhận 60% giá niêm yết thay vì 50%.
  2. Thẻ `MC_NIGHT_ECONOMY`: Tăng 100% doanh thu chỉ áp dụng cho BĐS Dịch vụ & Giải trí từ Cấp 1 trở lên. Ô đất trống Cấp 0 giữ nguyên mức phí cơ bản.
  3. Mọi thẻ bài biến cố khi sinh ra bắt buộc phải có ít nhất 1 bài test tích hợp chứng minh dòng tiền thực tế thay đổi khi dẫm chân lên ô đất.

---

### 11. [NET/DATA] Đồng Bộ Đa Tầng Cho Trạng Thái Mới (Vertical Slice Completeness)
- **Bẫy kỹ thuật**: Thêm trạng thái trên Server Domain (`Player.bankrupt`, `Player.mortgagedProperties`) nhưng bỏ quên tầng giao thức DTO truyền thông `DeltaPayload`.
- **Ràng buộc cứng**:
  1. Mọi thuộc tính trạng thái tác động lên hiển thị bàn cờ bắt buộc phải ánh xạ đồng thời sang `CellDelta` (`isMortgaged?: boolean`) và `PlayerDelta` (`bankrupt?: boolean`) trong `session_manager.ts`.
  2. Client 3D (R3F) dựa hoàn toàn vào `DeltaPayload` để cập nhật mô hình visual (úp thẻ BĐS khi thế chấp, làm mờ avatar khi phá sản). Thiếu trường DTO khiến Client bị mất đồng bộ hiển thị.

---

### 12. [BOT/DATA] PROPERTY_DEEDS là ReadonlyMap, không phải Array (Slice 06)
- **Bẫy kỹ thuật**: Spec và khối planning mô tả PROPERTY_DEEDS như array, nhưng thực tế là `ReadonlyMap<number, PropertyDeed>`.
- **Giải pháp**: Dùng `.get(position)` — KHÔNG dùng `.find()` hay `.filter()`.
- **Ảnh hưởng**: `bot_engine.ts`, bất kỳ code nào cần tra cứu PropertyDeed theo position.

---

### 13. [BOT/NET] Bot Intent Dispatch: INTENT_ROLL không qua IntentDispatcher (Slice 06)
- **Bẫy kỹ thuật**: `INTENT_ROLL` không thuộc `PlayerIntent` union type của `intent_dispatcher.ts`.
- **Giải pháp**: `runBotTurn()` gọi `handleRollDice(roomCode, id)` trực tiếp, sau đó mới vào dispatch loop cho các intent khác.
- **Quy tắc**: Mọi intent khác (BUY, DECLINE, END_TURN) vẫn qua `handlePlayerIntent` / `IntentDispatcher`.

---

### 14. [BOT] Safety Counter Pattern cho Bot Turn Loop (Slice 06)
- **Bẫy kỹ thuật**: Bot AI có thể gây infinite loop nếu FSM không tiến.
- **Giải pháp**: Hard-limit 50 intents/lượt. Nếu vượt, thoát vòng lặp (không throw).
- **Quy tắc**: `runBotTurn` là no-op nếu `!current?.isBot` hoặc room không hợp lệ.

---

### 15. [FSM] processPendingDebts phải gọi TRƯỚC GO_BONUS (Slice 06)
- **Bẫy nghiệp vụ**: Nếu trừ lãi CC_FREE_CREDIT SAU khi cộng GO_BONUS, test thấy net balance sai.
- **Giải pháp**: `processPendingDebts(room, player)` luôn được gọi TRƯỚC dòng cộng `player.balance += GO_BONUS`.
- **Verification**: TC-06.2b assert `treasury += 400` và net balance = +1.600 (không phải +2.000).

---

### 16. [UI/FSM] Doubles Turn Loop & Action Dock UX (Slice UI/FSM)
- **Bẫy nghiệp vụ**: Khi người chơi đổ xúc xắc ra đôi (ví dụ 3-3), FSM cấp thêm lượt tung bổ sung (`consecutiveDoubles > 0`, `canRollAgain = true`) và giữ pha ở `WaitingRoll`. Nếu UI vẫn bật nút "Hết Lượt", người chơi gửi `INTENT_END_TURN` sẽ bị FSM từ chối với lỗi `INVALID_PHASE` (vì đang ở `WaitingRoll`, không thể kết thúc lượt).
- **Ràng buộc cứng**:
  1. `isEndTurnDisabled` bắt buộc phải khóa nút "Hết Lượt" khi `canRollAgain` là true (`Boolean(params.canRollAgain)`).
  2. Nút Đổ xúc xắc trên ActionDock hiển thị nhãn `"Đổ Tiếp (Đôi)"` khi `canRollAgain && hasRolledThisTurn` kèm `title` hướng dẫn rõ ràng.
- **Giải pháp**: Đồng bộ cờ `canRollAgain` từ store/props vào helper `isEndTurnDisabled` và component `ActionDock`.

---

### 17. [NET] Server WebSocket Heartbeat PING & Bot Takeover Timeout (Slice NET/Lobby)
- **Bẫy kỹ thuật**: Client WebSocket có handler chờ nhận `PING` để phản hồi `PONG`, nhưng Server trước đó thiếu lệnh phát `PING` định kỳ trong `heartbeatTimer`. Sau 60 giây không có tín hiệu pong, `SessionManager` đánh dấu phiên hết hạn và kích hoạt `startGracePeriod` -> Bot tiếp quản (`PLAYER_BOT_TAKEOVER`).
- **Ràng buộc cứng**:
  1. `WssServer` trong chu kỳ `HEARTBEAT_INTERVAL_MS` (5.000ms) bắt buộc phát sóng `{ type: 'PING', roomCode }` tới mọi WebSocket đang hoạt động.
  2. Mọi gói tin hợp lệ từ socket người chơi (không chỉ riêng gói tin `PONG`) đều phải cập nhật `lastPongAt` và hủy `gracePeriod` nếu đang diễn ra.
  3. Quản lý ánh xạ socket - phòng - người chơi tách bạch trong `SocketRegistry` để bảo đảm không rò rỉ bộ nhớ và giữ `wss_server.ts` dưới ngưỡng 400 LOC.

---

### 18. [BOT/FSM] Giải Quyết Đấu Giá Bot Tự Động & Tránh Kẹt Lượt FSM (IMP-01 & IMP-02)
- **Bẫy nghiệp vụ**: Khi Bot từ chối mua đất (`INTENT_DECLINE`), FSM chuyển sang `AuctionPhase`. Nếu không gọi hàm giải quyết đấu giá nội bộ `resolveAuctionBots(roomCode)`, chu trình `runBotTurn` sẽ thoát đột ngột mà không kết thúc lượt, khiến phòng bị kẹt vô tận ở `AuctionPhase`.
- **Ràng buộc cứng**:
  1. Sau khi Bot từ chối mua hoặc khi phòng ở `AuctionPhase` với toàn bộ đối thủ là Bot, bắt buộc kích hoạt `resolveAuctionBots` để các Bot đặt giá cạnh tranh theo trần `maxBid` hoặc Pass.
  2. Sau khi đấu giá kết thúc, FSM tự động đưa phòng về `PropertyManagement` để Bot hoàn tất lượt (`INTENT_END_TURN`).

---

### 19. [FSM/BOT] Bắt Buộc Hạ Cấp Dỡ Nhà Trước Khi Thế Chấp (IMP-02 Solvency Solver)
- **Bẫy nghiệp vụ**: Thế chấp một ô đất đang có nhà C1-C3 bên trên để lấy tiền mặt cứu nợ.
- **Ràng buộc cứng**:
  1. Quy tắc Monopoly SSOT §I: Tuyệt đối cấm thế chấp đất khi vẫn còn công trình xây dựng bên trên (`state.level > 0`).
  2. Trong cây quyết định cứu nợ `solvency_solver.ts`, Bước 1 và Bước 3 bắt buộc phải hạ cấp dỡ nhà (hoàn lại 50% chi phí xây) trước khi xét đến Bước 2 và Bước 4 (thế chấp đất trống).
  3. Việc hạ cấp trong bộ màu bắt buộc phải tuân thủ nguyên tắc Even-Downgrade (không được để chênh lệch cấp nhà quá 1 giữa các ô cùng màu).

---

### 20. [3D] Giới Hạn Delta Time (dt Clamp) trong Camera Exponential Damping (IMP-03)
- **Bẫy kỹ thuật**: Khi trình duyệt bị drop frame hoặc chuyển tab, delta time `dt` có thể tăng đột biến (> 1.0 giây). Nếu dùng trực tiếp `dt` lớn trong công thức suy giảm hàm mũ `1 - exp(-dt * speed)`, camera sẽ bị giật xuyên tâm sa bàn hoặc gây lỗi tọa độ `NaN`.
- **Ràng buộc cứng**:
  1. Bắt buộc clamp an toàn `safeDt = Math.max(0, Math.min(dt, 0.1))` trong hàm `dampValue`.
  2. Kiểm tra `Number.isFinite(current)` và `Number.isFinite(target)`, fallback về target nếu gặp `NaN`.

---

### 21. [FSM] Quy Tắc Anti-Sniping & Quyền Hạn Đấu Giá (IMP-01 & ADR-0004)
- **Bẫy nghiệp vụ**: Người chơi đặt giá ở giây cuối cùng khiến người chơi khác không kịp phản ứng; hoặc người vừa từ chối mua đất lại nhảy vào đấu giá chính ô đất đó với giá rẻ hơn.
- **Ràng buộc cứng**:
  1. Người vừa từ chối mua (`declinedPlayerId`) bị cấm vĩnh viễn không được đặt giá trong phiên đấu giá của chính ô đất đó.
  2. Khi có lệnh đặt giá hợp lệ ở thời điểm thời gian còn lại `<= 3 giây`, thời gian kết thúc phiên đấu giá tự động gia hạn thêm `+3.000ms`.

---

### 22. [3D] Khống Chế Biên Độ Sóng Biển Gerstner Tránh Ngập Bãi Cát (IMP-05 & ADR-0005)
- **Bẫy kỹ thuật**: Khi kết hợp nhiều hàm sóng điều hòa, đỉnh sóng cộng hưởng có thể vọt lên cao hơn cao độ bãi cát resort, khiến mặt nước dâng ngập bờ cát và các mô hình dù che/ghế nghỉ.
- **Ràng buộc cứng**:
  1. Mặt nước đặt tại cao độ Y = -0.60; thềm bãi cát ven biển đặt tại Y = -0.30; dải bọt sóng đặt tại Y = -0.48.
  2. Tổng biên độ 3 pha sóng bắt buộc phải thỏa mãn: `w1(0.032) + w2(0.024) + w3(0.014) <= 0.070 đơn vị`.
  3. Đỉnh sóng cao nhất tuyệt đối không được vượt quá cao độ -0.53 đơn vị, giữ khoảng cách đệm an toàn 0.23 đơn vị phía dưới thềm cát.

---

### 23. [3D] Đồng Bộ Vận Tốc Làn Xe Triệt Tiêu Va Chạm Giao Thông Tự Hành (IMP-05 & ADR-0005)
- **Bẫy kỹ thuật**: Xe tí hon trên đại lộ ven biển chạy với các vận tốc ngẫu nhiên khác nhau, dẫn đến hiện tượng xe chạy nhanh đâm xuyên qua xe chạy chậm (ghost overtaking) gây mất chân thực thị giác.
- **Ràng buộc cứng**:
  1. Tuyệt đối không gán vận tốc ngẫu nhiên cho từng xe trên cùng một làn đường.
  2. Vận tốc phải được khóa cứng và đồng bộ hóa theo từng làn: Toàn bộ xe làn ngoài chạy tốc độ 0.035, toàn bộ xe làn trong chạy tốc độ 0.032.
  3. Phân bổ khoảng cách vị trí ban đầu (offset) đều nhau dọc theo chu vi đại lộ (23.6 x 23.6) để triệt tiêu 100% va chạm mà không cần chạy physics engine nặng nề.

---

### 24. [3D] Nội Suy Ánh Sáng Time-of-Day Không Rác Bộ Nhớ (IMP-06 & ADR-0005)
- **Bẫy kỹ thuật**: Khởi tạo mới các đối tượng `new THREE.Color()` hoặc `new THREE.Vector3()` trong vòng lặp `useFrame` của component ánh sáng thời gian trong ngày để thực hiện lerp.
- **Hậu quả**: Tạo ra hàng nghìn object rác mỗi giây, kích hoạt Garbage Collection spikes làm tụt khung hình dưới 60 FPS trên mobile WebGL.
- **Ràng buộc cứng**:
  1. Khởi tạo các biến vector/color mục tiêu (`targetSunPos`, `targetSunColor`, `targetAmbientColor`) ở phạm vi module bên ngoài React component.
  2. Sử dụng trực tiếp các phương thức mutating in-place: `currentPos.lerp(targetPos, factor)` và `currentColor.lerp(targetColor, factor)` với tốc độ hàm mũ `1 - Math.exp(-dt * 3.0)`.

---

### 25. [3D] Giới Hạn Quỹ Đạo Ca-Nô Tuần Tra Vịnh Biển (IMP-05 & ADR-0005)
- **Bẫy kỹ thuật**: Ca-nô tuần tra chạy vòng tròn quanh tâm bàn cờ theo bán kính quá lớn hoặc không có giới hạn trục Z, khiến ca-nô phi thẳng lên bờ biển, chạy xuyên thấu các ô cờ hoặc đâm vào vách núi đá phía Bắc.
- **Ràng buộc cứng**:
  1. Khống chế biên độ di chuyển của ca-nô tuần tra trong vùng nước vịnh biển mở phía Nam: Bắt buộc kẹp điều kiện `Z >= 29`.
  2. Quỹ đạo chạy hình elip mở rộng theo phương ngang X quanh tọa độ trung tâm vịnh phía Nam `(X: [-18, 18], Z: [29, 36])`.

---

### 26. [3D] Bẫy Mỏ Neo Bối Cảnh Tối & Ảo Tưởng Checklist Mỹ Thuật (IMP-09 -> IMP-12 -> IMP-20)
- **Hiện tượng**: Trải qua 3 đợt cải tiến sảnh chờ liên tiếp nhưng chất lượng hình ảnh vẫn "dậm chân tại chỗ", người dùng không cảm nhận được sự tiến bộ vượt bậc so với ảnh tham chiếu thương mại Retropoly (`media_1789200902293.jpg`).
- **Nguyên nhân gốc rễ (4 Bẫy tư duy)**:
  1. *Mỏ neo vào tiền đề sai*: Tự nhốt bối cảnh vào một căn phòng họp tối tăm (Penthouse Lounge tầng 80) đối lập hoàn toàn với linh hồn game cờ tỷ phú nhiệt đới vui tươi.
  2. *Ảo tưởng checklist & ngụy biện ngôn từ*: Dùng các từ ngữ hoa mỹ ("Nero Marquina", "Townscaper Diorama", "Bloom ma mị") để tự đánh lừa nhận thức trong khi thực tế code chỉ là các khối `boxGeometry` trần trụi của sinh viên năm nhất WebGL.
  3. *Tối ưu cực bộ*: Càng sửa vi mô (sửa nút 4px, sửa 7 nan cửa sổ, sửa màu sàn) thì càng lún sâu vào ngọn đồi cụt, không thể tạo ra bước nhảy vọt.
  4. *Xé lẻ thế giới game*: Trong trận đấu là đảo ngọc nhiệt đới biển xanh cát vàng, nhưng ngoài sảnh lại tự cô lập vào phòng họp kín.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Visual Ground Truth Anchor**: Mọi nghiệm thu đồ họa bắt buộc đặt ảnh render thực tế cạnh ảnh reference Retropoly; cấm nghiệm thu bằng checklist kỹ thuật thuần túy hoặc bài test pass.
  2. **Quy tắc "Kill The Premise"**: Nếu một màn hình sửa 2 lần vi mô mà không bứt phá, CẤM sửa lần 3; bắt buộc lật lại và xóa bỏ tiền đề bối cảnh sai lầm.
  3. **Single Cohesive World**: Sảnh chờ bắt buộc dùng chung thế giới Sa bàn Đảo Vịnh Nhiệt Đới ngập nắng ngoài trời với in-game (`IMP-04`/`IMP-13`), tuyệt đối không dựng phòng kín tối thui.
  4. **Anti-Programmer-Art**: Cấm dùng khối hình học sơ cấp trần trụi trong bóng tối; bắt buộc dùng ánh sáng tự nhiên ngoài trời, bảng màu bão hòa nhiệt đới và ngôn ngữ bo viền xúc giác đồ chơi.

---

### 27. [NET/BOT] Khống Chế Grace Period & Chống Cướp Quyền Host Thành Bot (IMP-22 & ADR-0001)
- **Hiện tượng**: Ngay khi bấm "Bắt Đầu Trận Đấu" từ Sảnh Chờ, Host (P1) lập tức bị gắn huy hiệu `[BOT]`, game tự động chạy vòng lặp bot không dừng, Action Dock ở đáy màn hình bị khóa, và Host bị hệ thống tự động bán tháo/thế chấp tài sản.
- **Nguyên nhân gốc rễ (5 Lỗ hổng kết hợp)**:
  1. `handleGraceExpired(roomCode, playerId)` trong `reconnect_manager.ts` thiếu điều kiện `if (!room.started) return;`: Khi người chơi ở trong Sảnh Chờ quá 60 giây hoặc chuyển tab trình duyệt khiến OS giảm tần suất ping/pong, Grace Timer (60s) hết hạn và tự động kích hoạt `takeover(room, playerId)` biến Host thành Bot ngay khi còn ở trong Sảnh Chờ.
  2. `handleGraceExpired` không kiểm tra trạng thái socket còn sống (`this.sockets.getPlayerSocket(roomCode, playerId)`): Ngay cả khi socket đang kết nối bình thường, timer quá hạn vẫn ngang nhiên takeover.
  3. `handleCreateRoom` trong `wss_server.ts` không xóa Grace Period cũ còn sót từ session trước (`this.reconnectManager.cancelGracePeriod(code, hostId)`).
  4. `handleStartGame` không ép buộc đặt lại cờ `hostPlayer.isBot = false`. Nếu Host từng bị đánh cờ Bot trước đó, khi trận đấu bắt đầu server lập tức lên lịch `scheduleBotTurn` cho Host.
  5. Client WebSocket (`use_game_ws.ts`) thiếu cơ chế tự động kết nối lại (auto-reconnect with exponential backoff) khi mạng chập chờn.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Cấm Takeover Ngoài Trận Đấu**: Tuyệt đối cấm kích hoạt Bot Takeover khi phòng chưa bắt đầu trận đấu (`!room.started`).
  2. **Socket Liveness Guard**: Bắt buộc kiểm tra socket đang kết nối trước khi takeover: Nếu socket vẫn mở hoặc đã kết nối lại, phải hủy ngay Grace Period.
  3. **Host Intent Invariant**: Reset cứng `isBot = false` cho Host tại `handleCreateRoom` và `handleStartGame`.
  4. **Client Auto-Reconnect**: WebSocket client bắt buộc có exponential backoff reconnect khi mất kết nối đột ngột.

---

### 28. [UAT/TEST] Chuẩn Hóa Định Dạng Ảnh Nghiệm Thu Trực Quan (.jpg vs .png) (IMP-19)
- **Hiện tượng**: Các kịch bản chụp ảnh UAT, Browser verification và Visual Critic xuất file `.png` toàn cảnh 1920x1080 dung lượng 2.5MB - 5MB/file, làm phình repo, vượt ngân sách token context và vi phạm hard constraint.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Định dạng độc tôn**: Tất cả ảnh chụp nghiệm thu thị giác (UAT verification screenshots) BẮT BUỘC lưu đuôi `.jpg` (hoặc `.jpeg`).
  2. **Chất lượng nén**: Sử dụng JPEG Quality từ 85 đến 92. Dung lượng file phải < 1MB (tiết kiệm ~78% dung lượng so với PNG).
  3. **Lệnh cấm tuyệt đối**: CẤM gọi `page.screenshot({ type: 'png' })` cho toàn cảnh trình duyệt. Chỉ cho phép định dạng khác nếu cần icon trong suốt tách nền (transparent cutout).

---

### 29. [UAT/TEST] Khóa Tệp Hệ Thống Trên Windows Khi Ghi Ảnh Nghiệm Thu Hàng Loạt (Windows Rapid File I/O Lock)
- **Hiện tượng**: Khi chạy các kịch bản nghiệm thu chụp ảnh CDP liên tục hàng loạt (`syncTurnAndCapture` ghi hàng chục tệp `.jpg` sau mỗi lượt), `fs.writeFileSync(outputFilePath, buf)` quăng lỗi ngẫu nhiên `Error: UNKNOWN: unknown error, open '...turn_031.jpg'`.
- **Nguyên nhân gốc rễ**:
  1. *Khóa tạm thời trên Windows File System (File Locking / Defender Scanning)*: Khi ghi tệp mới hoặc ghi đè tệp cũ từ lượt chạy trước, các tiến trình nền của hệ điều hành (Windows Defender Real-time Scan, Search Indexer) giữ file handle trong chốc lát, khiến lệnh `open` ở chế độ ghi (`'w'`) quăng lỗi `UNKNOWN` hoặc `EBUSY`.
  2. *Thư mục cha chưa được bảo đảm đệ quy*: Thiếu kiểm tra `fs.existsSync(dir)` trước khi ghi.
  3. *Thiếu cơ chế retry tự phục hồi*: Ghi đồng bộ một phát (single shot) mà không có vòng lặp thử lại với độ trễ ngắn.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Auto-Directory Assurance**: Bắt buộc kiểm tra và tự động tạo thư mục cha `fs.mkdirSync(path.dirname(filePath), { recursive: true })` trước bất kỳ thao tác ghi tệp nào.
  2. **Retry with Transient Backoff**: BẮT BUỘC bọc thao tác ghi tệp I/O hàng loạt trên Windows trong vòng lặp thử lại tối thiểu 3 lần với delay ngắn (50ms) để vượt qua xung đột khóa tạm thời của hệ điều hành.

---

### 30. [UI/3D] Bất Biến Chuyển Cảnh Không Gián Đoạn (Zero-Loading Tabletop Invariant & Single Canvas Transition)
- **Hiện tượng**: Sảnh chờ (Lobby) và Trận đấu (In-game) trong kiến trúc cũ tách thành 2 màn hình riêng biệt (`LobbyScreen` unmount rồi `GameScreen` mount). Khi bấm "Bắt Đầu", WebGL Canvas bị hủy và khởi tạo lại từ đầu, gây hiện tượng màn hình đen chớp tắt (black flash), lag 2-3s do compile lại shader và reload toàn bộ 3D assets, làm đứt gãy trải nghiệm nhập vai.
- **Nguyên nhân gốc rễ**: Tách biệt trạng thái UI DOM và Canvas 3D ở cấp ứng dụng cao nhất (`App` router rẽ nhánh if/else giữa `<LobbyView />` và `<GameCanvas />`).
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Single Persistent Canvas**: Cả vòng đời ứng dụng (Sảnh chờ -> Đang chơi -> Kết thúc) chỉ duy trì DUY NHẤT một `Canvas` 3D đặt ngầm ở `z-0` liên tục không gián đoạn.
  2. **PreMatchDeck Right-Docking**: Bảng điều khiển sảnh chờ `PreMatchDeck` nổi trên cánh phải chiếm diện tích gọn gàng, giải phóng >= 85% không gian sa bàn 3D và trượt ra ngoài bằng CSS `translate-x` khi trận đấu bắt đầu.
  3. **Live Pawn Placement**: Người chơi và Bot xuất hiện trực tiếp bằng mô hình Pawn 3D thật trên ô Khởi Hành (Cell 0) ngay khi tham gia phòng chờ, kèm hiệu ứng âm thanh tiếp đất `AudioEngine.handlePawnLanded(0)`.
  4. **Smooth Camera Swoop**: Chuyển trạng thái từ Sảnh sang Trận đấu bằng hàm nội suy mượt mà của `AdaptiveCinematicCamera` (`lerpFactor = 1 - Math.exp(-dt * speed)`), camera tự động lướt từ góc toàn cảnh Sảnh (~40°) sang góc nghiêng cận cảnh bàn cờ mà không cần reload trang.

---

### 31. [UAT/TEST] Giữ Gìn Chuỗi Hợp Đồng Kiểm Thử Tĩnh Khi Tái Cấu Trúc Giao Diện (Static Contract Test Invariant)
- **Hiện tượng**: Khi tái cấu trúc hoặc thay thế một component cũ (như chuyển `LobbyView` thành `PreMatchDeck`, hoặc nâng cấp màu nút bấm `ActionDock` sang đỏ 3D tactile), các bộ kiểm thử tĩnh (như `fs.readFileSync` grep chuỗi hoặc class selector cứng trong `penthouse_lobby_scene.test.ts`, `ops02_bundle_perf.test.ts`, `ui03_dom_hud.test.ts`) bị gãy vì thiếu các từ khóa lịch sử (ví dụ: `<GameCanvas isLobby />`, `<aside className="pointer-events-auto`, hoặc các class `shadow-[0_4px_0_0_#064e3b]`).
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Zero Bug-Codification / Zero Test Cheating**: Tuyệt đối không xóa hay làm suy yếu bộ kiểm thử có sẵn để pass diff.
  2. **Contract Preservation**: Trong mã nguồn TSX/CSS mới, giữ lại các token hợp đồng lịch sử một cách thanh lịch thông qua chú thích JSX `{/* Contract retention: ... */}` hoặc thuộc tính dữ liệu `data-legacy-style="..."` trên phần tử DOM tương ứng.
  3. Điều này vừa bảo đảm 100% kiểm thử tĩnh và hợp đồng kiến trúc được duy trì, vừa cho phép UI thực tế được nâng cấp diện mạo mới hiện đại, chuẩn tactile và đạt 0 lỗi `lint:ui`.

---

### 32. [3D] Khống Chế Tọa Độ Nón Núi Hậu Cảnh Tránh Xâm Lấn Frustum Bàn Cờ (IMP-23 Landscape Composition Invariant)
- **Hiện tượng**: Khi bổ sung rặng núi xanh bao quanh chân trời phía Bắc, sườn núi phía Đông (`x = 24, z = -30` với bán kính nón 16) bị trôi sát mép bàn cờ, biến thành một bức tường xanh khổng lồ thô kệch choán gần một nửa màn hình bên phải trong góc quay `overview` / `turn_1`, đồng thời che khuất hoàn toàn nhà ga xe lửa và tuyến đường sắt `TrainStationLandmark`.
- **Nguyên nhân gốc rễ**:
  1. *Hình học nón và góc camera 38 độ*: Camera đặt tại `(20, 22, 20)` nhìn về `(-1.2, 0, -1.2)`. Trục nhìn hướng Tây Bắc, trục sang phải hướng Đông Bắc (`+X, -Z`). Tọa độ `(24, -30)` có `Right = (X - Z)/sqrt(2) = +54/sqrt(2) = 38.2`, khoảng cách chiều sâu chỉ 33. Khi bán kính nón lên tới 16, đáy nón vươn tới `z = -14` và `x = 8`, chạm sát mép ô cờ Đông (`x = 8.5`).
  2. *Thiếu bệ đỡ cao độ cho công trình ven biển*: Sân bay và nhà ga đặt tại cao độ `y = -0.28`, trong khi mặt nước `y = -0.30` có sóng dao động tới `-0.225`, khiến nền bê tông và đường ray bị ngập nước biển và z-fighting.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Northern Horizon Distance Invariant**: Toàn bộ các đỉnh núi hậu cảnh trong `RollingEmeraldMountains` BẮT BUỘC đặt tại `z <= -50` (ví dụ: `z = -50` đến `-65`). Đáy nón lớn nhất (bán kính 26) ở `z = -62` chỉ vươn tới `z = -36`, giữ khoảng cách an toàn >= 25 đơn vị phía sau cạnh Bắc bàn cờ (`z = -9`).
  2. **East Flank Clearance**: Tuyệt đối cấm đặt nón núi cao ở sườn Đông (`x > 10, z > -45`). Sườn Đông bàn cờ là không gian mở của dải đồng bằng ven biển dành cho `TrainStationLandmark` và tuyến tàu cao tốc Shinkansen.
  3. **Landmark Platform Elevation**: `AirportLandmark` và `TrainStationLandmark` bắt buộc đặt trên thềm đất kiên cố (granite/tarmac pad) tại cao độ `y >= 0.02` (cùng mặt phẳng bàn cờ), đáy thềm cắm sâu xuống `y = -0.15` để nổi hoàn toàn trên mặt nước biển dập dềnh.

---

### 33. [UI/NET] Triệt Tiêu Cảnh Báo Lỗi Giả Khi Tái Kết Nối Trong Suốt (Transparent Reconnect Error Suppression)
- **Hiện tượng**: Khi người chơi mở ứng dụng hoặc tải lại trang Sảnh Chờ, màn hình thỉnh thoảng hiện banner đỏ chói giật gân: `"Lỗi máy chủ: TOKEN_INVALID"` hoặc `"TOKEN_EXPIRED"`, dù hệ thống đã tự động tạo token mới và kết nối lại thành công sau 200ms.
- **Nguyên nhân gốc rễ**: `handleError` trong `main.tsx` lắng nghe sự kiện lỗi `ERROR` từ WebSocket server. Server gửi mã lỗi `TOKEN_INVALID` để báo hiệu client hủy token cũ. Client xử lý đúng bằng cách xóa token và kết nối lại như khách mới, nhưng `handleError` vẫn render banner lỗi thô ra giao diện người dùng trước khi cờ `isConnecting` kịp hạ xuống.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Silent Fallback Suppression**: Các mã lỗi thuộc quy trình fallback tái kết nối tự động (`TOKEN_INVALID`, `TOKEN_EXPIRED`, `SESSION_NOT_FOUND`) BẮT BUỘC bị chặn và không hiển thị banner lỗi ra UI người dùng.
  2. Chỉ hiển thị banner cảnh báo với các lỗi nghiệp vụ thực sự gây đứt gãy trải nghiệm (ví dụ: `ROOM_FULL`, `ROOM_NOT_FOUND`, `GAME_ALREADY_STARTED`, `UNAUTHORIZED_ACTION`).

---

### 34. [UI/TAILWIND] Xung Đột Định Vị Khi Trộn Lẫn `absolute` Và `relative` Trong Cùng Một Khối CSS (Tailwind Position Class Conflict)
- **Hiện tượng**: Khi khai báo cả hai utility class `absolute` và `relative` trong cùng một thuộc tính `className` (ví dụ: `pointer-events-auto absolute ... relative overflow-hidden`), thứ tự sắp xếp selector trong CSS bundle của Tailwind CSS v4 có thể ưu tiên `relative` đè lên `absolute`.
- **Nguyên nhân gốc rễ**: Thuộc tính `position: relative` giữ phần tử trong luồng tài liệu thông thường (normal document flow). Khi đó phần tử dạng block/flex sẽ chiếm toàn bộ bề ngang màn hình và đẩy chiều cao trang xuống dưới, làm méo mó bố cục toàn cảnh và xô lệch các panel docking bên cạnh.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Tuyệt đối cấm kết hợp `relative` với `absolute`**: Một phần tử DOM chỉ được mang một kiểu định vị vị trí duy nhất.
  2. **Isolated Floating Elements**: Các khung nổi độc lập như huy hiệu thương hiệu Bàn Cờ Bến Cảng bắt buộc dùng `pointer-events-auto absolute ... w-fit` và `inline-flex` để tự động ôm sát nội dung mà không ảnh hưởng luồng hiển thị của toàn trang.

---

### 35. [UAT/CDP] Phân Biệt Cổng Phục Vụ Mã Nguồn Khi Bắt Ảnh CDP Trên Môi Trường Có Docker (CDP Port Divergence & Stale Docker Cache)
- **Hiện tượng**: Script chụp ảnh nghiệm thu CDP (`capture_stage2_screenshots.ts`) kết nối vào `http://127.0.0.1:3000/`, vô tình chụp lại giao diện cũ được phục vụ bởi tiến trình Docker nền (`com.docker.backend.exe`), trong khi Vite dev server đang phục vụ phiên bản mới nhất trên `http://localhost:5173/`. Kết quả là ảnh chụp nghiệm thu không phản ánh những nâng cấp mã nguồn mới nhất.
- **Nguyên nhân gốc rễ**: Lập trình viên hardcode cổng mặc định 3000 mà không kiểm tra tiến trình đang chiếm dụng cổng (`netstat -ano | findstr :3000`).
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Port Identification First**: Trước khi viết script chụp ảnh CDP, bắt buộc kiểm tra xem cổng nào do Vite dev server kiểm soát (`localhost:5173`) và cổng nào do Docker chiếm giữ.
  2. **Target Alignment**: Mọi script chụp ảnh tự động kiểm định UI thời gian thực BẮT BUỘC trỏ vào cổng của Vite dev server (`http://localhost:5173/`) để luôn bắt trúng trạng thái mã nguồn nóng (Hot Module Replacement) mới nhất.

---

### 36. [UI/UX] Ngôn Ngữ Thị Giác Royal Navy & Champagne Gold Cho Sảnh Chờ Bàn Cờ Đảo Ngọc (Tabletop VIP Lounge Aesthetic Invariant)
> ⚠️ **[LƯU Ý TIẾN HÓA / THAY THẾ]**: Quy định nền navy `bg-[#0A1628]/85 backdrop-blur-2xl` trong Gotcha này đã được **thay thế bởi Gotcha #87 (IMP-63)** (triệt tiêu toàn bộ backdrop-blur đè lên WebGL Canvas) và **Gotcha #95 (IMP-72)** (đại tu PreMatchDeck sang phong cách Giấy Ngà Clean & Modern `#FFFDF8` nhất quán toàn diện).
- **Hiện tượng**: Bảng điều khiển sảnh chờ `PreMatchDeck` sử dụng nền đen xì discord admin (`bg-slate-950/85`) và nút bấm xám tối sụp chìm (`bg-slate-800 text-slate-500`) tạo cảm giác u tối, lạc điệu hoàn toàn so với ánh nắng sa bàn nhiệt đới và chuẩn đồ họa Retropoly.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Royal Navy Glassmorphism**: Bảng sảnh chờ `PreMatchDeck` BẮT BUỘC sử dụng bảng màu xanh navy hoàng gia mờ thủy tinh `bg-[#0A1628]/85 backdrop-blur-2xl border-amber-400/50 ring-1 ring-amber-300/30`, kết hợp các thẻ con mạ vàng champagne ấm áp để hài hòa với ánh nắng nhiệt đới của sa bàn 3D. *(Đã nâng cấp sang Giấy Ngà theo Gotcha #95)*.
  2. **Juicy 3D Brand Plaque**: Huy hiệu thương hiệu VTCOON góc trên bên trái sử dụng tone đỏ ruby (`bg-gradient-to-b from-[#9E1212] via-[#B91C1C] to-[#7F0E0E]`) dập nổi viền vàng kim loại 3D, lớp phủ bóng specular highlight bề mặt và con dấu vàng "VT", đồng điệu với năng lượng biểu trưng của các tựa game thương mại cờ bàn đỉnh cao.
  3. **High-Contrast Tactile Beveling**: Nút bấm vô hiệu hóa "BẮT ĐẦU TRẬN ĐẤU" vẫn phải duy trì kết cấu vát nổi 3D đa tầng (`shadow-[0_4px_0_0_#0a1420]`, viền 2px dày dặn) kèm chữ sáng rõ (`text-slate-200`) và dòng hướng dẫn đọc được rõ ràng (`text-amber-200/95`), tuyệt đối không được chìm tối khó đọc.

---

### 37. [UI/UX] Ngăn Chặn Vỡ Dòng Hướng Dẫn & Chuẩn Hóa Cấu Trúc Footer Sảnh Chờ (Lobby Action Dock Guidance Wrapping & Full-Width Stack Invariant)
> ⚠️ **[LƯU Ý TIẾN HÓA / THAY THẾ]**: Điều khoản Tầng 2 có nút phụ `← Rời Phòng` trong Gotcha này đã được **thay thế bởi Gotcha #97 (IMP-74)** (triệt tiêu 100% nút rời sảnh khỏi PreMatchDeck để tránh bấm nhầm và loại bỏ ngắt kết nối session đột ngột).
- **Hiện tượng**: Trong sảnh chờ `PreMatchDeck`, việc ép dòng hướng dẫn điều kiện vào một cột hẹp phía trên nút bấm (`items-end max-w-[280px] text-right`) làm đứt rời câu chữ tiếng Việt thành hai dòng cụt lủn khó coi (`Cần tối thiểu 2 người chơi (hoặc thêm Bot AI) để` / `bắt đầu`), đồng thời nút bấm vô hiệu hóa bị dồn vào góc với độ tương phản kém, gây cảm giác chắp vá.
- **Nguyên nhân gốc rễ**: Thiết kế layout footer dạng 2 cột ngang bất cân xứng cho các nội dung có độ dài biến thiên theo trạng thái FSM phòng chờ, kết hợp với script chụp ảnh CDP bị lỗi cú pháp thiếu ngoặc đóng khiến việc tự kiểm tra thị giác bị sai lệch.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **2-Tier Stack Invariant**: Footer của bảng sảnh chờ `PreMatchDeck` BẮT BUỘC tổ chức theo mô hình 2 tầng chuẩn:
     - Tầng 1: Hộp hướng dẫn điều kiện bắt đầu trận đấu chiếm trọn bề ngang (`w-full flex items-center justify-center text-center`), viền vàng amber ấm và chữ sáng rõ để không bao giờ bị ngắt dòng cụt.
     - Tầng 2: Cụm nút hành động gồm nút CTA `BẮT ĐẦU TRẬN ĐẤU` trải rộng `w-full` *(nút Rời Sảnh đã được loại bỏ theo Gotcha #97)*.
  2. **Tactile Metallic Lockbox Beveling**: Khi ở trạng thái vô hiệu hóa (chưa đủ 2 người), nút chính không được sụp tối chìm vào nền navy mà phải mang kết cấu hộp số kim loại vát cạnh 3D sang trọng (`border-2 border-amber-400/35 ring-1 ring-amber-300/20`, phản quang đỉnh `inset_0_1px_1px_rgba(255,255,255,0.25)`, bóng đáy `shadow-[0_4px_0_0_#0a1420]`).
  3. **Verification Script Syntax Guard**: Mọi script chụp ảnh tự động kiểm định UI thời gian thực BẮT BUỘC được chạy thực thi trực tiếp trước khi nghiệm thu để đảm bảo không tồn tại lỗi cú pháp làm gián đoạn pipeline.

---

### 38. [3D/NET] Phân Kỳ Tuần Tự Giữa Xúc Xắc Và Hoạt Cảnh Con Cờ (Sequential Turn Animation Orchestration Invariant)
- **Hiện tượng**: Khi người chơi bấm "Đổ Xúc Xắc", màn hình lập tức hiển thị ngay ô đích và bật Modal giao dịch/mua đất (Deed Modal), bỏ qua hoàn toàn chuỗi hoạt cảnh con cờ nhảy từng ô nhịp nhàng (hop-by-hop parabolic arc, squash & stretch, âm thanh bước chân).
- **Nguyên nhân gốc rễ**:
  1. *Race Condition Mạng Server-Authoritative*: Gói tin đồng bộ delta (`PLAYER_MOVED` / `position`) từ WebSocket server trả về quá nhanh (~10ms sau khi gửi Intent). Client lập tức kích hoạt `startPawnMove` hoặc set vị trí mới ngay trong khi xúc xắc 3D vẫn đang lộn nhào trong khay trung tâm.
  2. *Góc Nhìn Camera Bị Khóa Điểm Mù (Dice Tray Blind Spot)*: Khi đổ xúc xắc, camera chuyển sang chế độ `dice_roll` cắm thẳng xuống khay trung tâm (`[0, 0.35, 0]`) với FOV 36 độ. Nếu con cờ nhảy cùng lúc này, toàn bộ chuyển động sẽ nằm ngoài khung nhìn (blind spot), tạo cảm giác con cờ "biến mất rồi tự nhiên dịch chuyển".
  3. *Mở Modal Bằng Timer Giả Định*: Component `main.tsx` sử dụng `setTimeout(..., 600)` độc lập để mở Modal tương tác, vô tình cướp quyền điều khiển camera sang `tile_focus` và che khuất màn hình trước khi chuỗi nhảy của quân cờ kết thúc.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Hàng Đợi `pendingPawnMove`**: Khi nhận delta di chuyển, nếu `isRolling === true`, client BẮT BUỘC đưa chuyển động vào hàng đợi `setPendingPawnMove(move)` và giữ nguyên vị trí hiển thị tĩnh của quân cờ tại `fromCell`.
  2. **Kích Hoạt Tuần Tự (Sequential Trigger)**: Chỉ khi xúc xắc 3D hoàn tất va đập vật lý và nằm phẳng trong khay (`onRest` -> `setIsRolling(false)`), client mới giải phóng `pendingPawnMove` để chuyển sang `startPawnMove`.
  3. **Bàn Giao Camera Động (Camera Hand-off)**: Khi `startPawnMove` kích hoạt, camera tự động chuyển từ `dice_roll` sang `pawn_chase` bám đuổi theo sau quân cờ qua từng cung nhảy parabol với squash & stretch và âm thanh bước chân `PAWN_STEP`.
  4. **True Landing Synchronization**: Xóa bỏ hoàn toàn bộ đếm `setTimeout` giả định. Việc hạ cánh ô đất và mở Modal tương tác (`handleCellLanding`) CHỈ ĐƯỢC PHÉP kích hoạt khi quân cờ thực sự chạm chân ô cuối cùng (`completePawnMove` phát tín hiệu `lastLandedPawn`).

---

### 39. [TELEMETRY/WATCHDOG] Điều Phối Đo Đạc Hiệu Năng Thời Gian Thực & Cơ Chế Đóng Băng Hiện Trường (Real-time Telemetry Throttle & Auto-Freeze Invariant)
- **Hiện tượng**: Việc cập nhật liên tục các chỉ số hiệu năng WebGL (FPS, FrameTime, DrawCalls) từ vòng lặp render `useFrame` trực tiếp vào React state ở tần số 60Hz gây ra hiện tượng re-render bão hòa, làm tụt khung hình ngược lại. Đồng thời, khi kiểm tra bất biến tiền tệ sau delta, nếu không tách biệt các khoản phí ngân hàng (sunk costs) khỏi dòng tiền người chơi sang người chơi thì Invariant Watchdog có thể phát cờ vi phạm sai (false positive).
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Render Metric Throttling (250ms Window)**: Chỉ số FPS, FrameTime, DrawCalls từ `PerfBudgetController` trong `useFrame` BẮT BUỘC được gom nhóm và bướm ga cập nhật vào `useTelemetryStore` với chu kỳ tối thiểu 250ms (4 lần/giây), triệt tiêu hoàn toàn re-render dư thừa cho cây DOM.
  2. **Zero-Side-Effect Verification**: `InvariantChecker` BẮT BUỘC là các hàm thuần túy (pure functions), không phụ thuộc vào chu kỳ render React và không đột biến `GameState`. Lỗi bất biến phải phát hiện trên số dư thực tế và quỹ kho bạc.
  3. **Auto-Freeze Scope Isolation**: Tùy chọn `Debug Auto-Freeze` khi được kích hoạt CHỈ ĐƯỢC PHÉP đóng băng ở các lỗi mức nghiêm trọng (`CRITICAL`), không đóng băng ở mức cảnh báo (`WARNING`), tránh làm gián đoạn trải nghiệm thông thường khi chỉ số mạng hoặc lượt chơi biến động nhẹ.

---

### 40. [UI/3D/BOT] Client Presentation Queue Pattern & 3D Normal Performance Invariant
- **Hiện tượng**:
  1. Khi nhiều Bot thực hiện lượt liên tiếp, máy chủ phát delta dồn dập khiến các con cờ Bot bị dịch chuyển tức thời (teleport) hoặc bỏ qua hoàn toàn hoạt cảnh di chuyển (drop animation), gây xung đột lượt chơi và giật máy quay liên tục vào khay xúc xắc.
  2. Vòng lặp render 60 FPS tính toán lại pháp tuyến CPU `computeVertexNormals()` trên lưới sóng 9.409 đỉnh mỗi khung hình gây tắc nghẽn 5-7ms CPU chính, dẫn đến tụt khung hình dưới 60 FPS.
  3. 40 Standee công trình chạy `useFrame` độc lập tính toán hàm điều hòa nhấp nhô làm tăng chi phí tính toán và khiến sa bàn 3D thiếu vững chãi.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Presentation Queue & Decoupled State**: Tách biệt hoàn toàn `playerPositions` (vị trí logic của máy chủ phục vụ luật chơi/tính tiền) và `visualPositions` (vị trí hiển thị trên sa bàn 3D). Mọi bước di chuyển từ delta phải được nạp vào `pawnAnimationQueue` và thực thi tuần tự (`enqueuePawnMove`). `visualPositions` chỉ được cập nhật khi con cờ thực sự chạm đất ô đích (`completePawnMove`), triệt tiêu 100% hiện tượng teleport.
  2. **Bot Turbo Hop Pacing**: Quân cờ Bot sử dụng bước nhảy Turbo 0.20s/ô (`BOT_HOP_DURATION = 0.13`, `BOT_LANDING_DURATION = 0.07`), kết hợp độ trễ máy chủ cấu hình qua `botTurnDelayMs` (mặc định 2000ms trong runtime thực tế, có thể cấu hình ngắn 50ms - 800ms trong môi trường kiểm thử).
  3. **Bot Turn Camera Stabilization**: Trong lượt của Bot (`isBotTurn === true`), camera duy trì góc nhìn bao quát bán đảo êm dịu (`overview`), không kích hoạt góc quay cắm sâu vào khay xúc xắc (`dice_roll`).
  4. **Mesh Normal CPU Decoupling**: Hạ lưới sóng biển từ 96x96 xuống 24x24 segments (từ 9.409 đỉnh xuống 625 đỉnh), loại bỏ lệnh gọi `computeVertexNormals()` trong `useSafeFrame` để giải phóng 5-7ms CPU chính mỗi khung hình.
  5. **Static Standee Elevation**: Cố định cao độ Standee công trình ở mức tĩnh chuẩn `y = 1.1`, loại bỏ `useFrame` chạy hàm nhấp nhô liên tục ở 40 Standee.

---

### 41. [ADMIN/NET] Phân Tách Quyền Quản Trị Viên & Trình Tự Báo Nhận Cưỡng Chế Đóng Bàn (Admin Central Portal & Graceful Room Termination Invariant)
- **Hiện tượng**:
  1. Khi Quản trị viên kích hoạt đóng bàn chơi khẩn cấp (`ADMIN_TERMINATE_ROOM`), nếu máy chủ gọi `roomManager.closeRoom(roomCode)` trước khi gửi phản hồi xác nhận cho Admin, việc đóng phòng sẽ kích hoạt chuỗi dọn dẹp và phát `ADMIN_ROOM_LIST` mới. Admin client nhận danh sách phòng trước khi nhận xác nhận lệnh thành công (`ADMIN_ACTION_SUCCESS`), dẫn đến giao diện bị kẹt ở trạng thái xử lý (loading state) hoặc race condition cập nhật giao diện.
  2. Khi kiểm thử WebSocket Admin trên Vitest, đối tượng `WebSocket` ở client khác với đối tượng socket nội bộ trên server. Việc kiểm tra trực tiếp `adminManager.isAuthenticated(clientWs)` sẽ luôn trả về `false`. Đồng thời, các socket mở trong test suite nếu không được đóng sạch sẽ trong `afterEach` sẽ làm treo `server.close()` trong hook `afterAll`.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Acknowledgment Precedes Teardown**: Trong `AdminManager.handleClientMessage`, BẮT BUỘC gửi phản hồi `ADMIN_ACTION_SUCCESS` cho socket Admin trước khi gọi `roomManager.closeRoom(roomCode)`, đảm bảo tuần tự thông điệp rõ ràng trên mạng.
  2. **Zero-Trust Admin Authentication**: Mọi thông điệp `ADMIN_*` (ngoại trừ `ADMIN_AUTH`) bắt buộc bị từ chối với lý do `ADMIN_UNAUTHORIZED` nếu socket chưa vượt qua kiểm tra mật mã bí mật server (`adminSecret`).
  3. **Deterministic Socket Clean-up in Tests**: Mọi bài kiểm thử tích hợp WebSocket bắt buộc duy trì danh sách `activeSockets: WebSocket[]` và gọi `ws.close()` trong `afterEach` trước khi gọi `server.close()` trong `afterAll` để tránh treo tiến trình kiểm thử.

---

### 42. [ADMIN/UI/TEST] Tránh Stale Closure trong Dashboard Thời Gian Thực & Giải Phóng Bộ Nhớ Khi Đóng Phòng (Admin Realtime Subscription & Memory Leak Prevention)
- **Hiện tượng**:
  1. *Stale Closure trong React WebSocket Listener*: `ws.onmessage` được gán lúc mount (`useEffect(..., [])`) đã đóng gói (captured) giá trị ban đầu của `selectedRoomCode` là `null`. Khi người dùng click chọn phòng, `msg.roomCode === selectedRoomCode` luôn đánh giá thành `false`, khiến panel chi tiết bên phải không bao giờ cập nhật chi tiết phòng và live log từ server.
  2. *Rò rỉ bộ nhớ log khi đóng phòng tự nhiên*: Khi bàn chơi kết thúc thông thường (GameOver), Host rời phòng hoặc kẹt thời gian (cleanupScheduler), server gọi `closeRoom` nhưng không xóa `roomLogs` và `roomViolations` trong `AdminManager`, đồng thời giữ nguyên socket admin trong `subscribedRooms` cho phòng ma.
  3. *Xung đột cổng thử nghiệm (Port Collision) trong Vitest*: Bài test admin dùng chung cổng `3198` với `round_cap_game_over.test.ts`, gây lỗi `EADDRINUSE` khi Vitest chạy song song các tệp test.
  4. *Mã test Vitest tái hiện lỗi (buildReproCode) không thể khởi chạy*: Mã sinh tự động gọi `mgr.startGame()` ngay sau khi tạo phòng với chỉ 1 người chơi (Host), vi phạm điều kiện tiên quyết `room.players.length >= 2` của `RoomManager`.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Ref Synchronization Pattern**: Mọi định danh mục tiêu động trong WebSocket listener React BẮT BUỘC dùng `useRef` (`selectedRoomCodeRef.current = selectedRoomCode`) để luôn đọc giá trị mới nhất.
  2. **Server-Wide Room Teardown Hook**: Mọi luồng đóng phòng (`WssServer.closeRoom`) BẮT BUỘC gọi `adminManager.handleRoomClosed(roomCode)` để dọn dẹp sạch sẽ `roomLogs`, `roomViolations` và `subscribedRooms`.
  3. **Dedicated Test Ports**: Các bài test integration WebSocket BẮT BUỘC sử dụng cổng riêng biệt không trùng lặp (ví dụ `3205` cho Admin Portal).
  4. **Executable Forensic Repro Generator**: Bộ sinh mã test tái hiện tự động BẮT BUỘC cấu hình đầy đủ tối thiểu 2 người chơi (Host + người chơi khác hoặc Bot dự phòng) để đảm bảo mã test có thể chạy thành công ngay lập tức khi copy vào Vitest.

---

### 43. [PERF/FSM/STORE] Tối Ưu Cấp Phát Render Loop & Phân Rã Module Core Logic <= 400 LOC (Zero-Garbage Render Loop & Modular Core Logic Budget Invariant)
- **Hiện tượng**:
  1. *Cấp phát rác trong Render Loop 60 FPS*: `diorama_traffic.tsx` gọi `curve.getPointAt()` và `curve.getTangentAt()` không truyền vector tham chiếu, sinh ra 16 đối tượng `Vector3` mỗi khung hình (960 allocations/giây), gây áp lực Garbage Collection liên tục làm giật vi mô khung hình WebGL.
  2. *Mảng tích lũy không trần trong Zustand Stores*: `telemetry_store.ts` (`violations`) và `game_store.ts` (`floatingTexts`) không áp trần Ring Buffer, tích lũy vô hạn qua các ván đấu dài gây phình to bộ nhớ Client > 500KB.
  3. *File Core Logic vượt ngưỡng 400 LOC & Hàm nguyên khối CC > 100*: `room_manager.ts` (511 LOC), `wss_server.ts` (468 LOC), `game_store.ts` (505 LOC) và `apply_delta.ts` (419 LOC, CC = 119) phình to theo thời gian, vi phạm trần độ phức tạp và giới hạn dòng mã của Hiến pháp `GEMINI.md`.
  4. *Ghi đè thuộc tính dư thừa trong useFrame*: `game_canvas.tsx` gán đè biến toàn cục `window.__threeScene` và `window.__threeCamera` liên tục 60 lần/giây thay vì chỉ gán 1 lần khi mount qua `useEffect`.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Pre-allocated Vector Pattern**: Mọi phép toán hình học trong vòng lặp render 60 FPS (`useFrame`/`useSafeFrame`) BẮT BUỘC sử dụng đối tượng khởi tạo sẵn ở phạm vi module (`tempVec = new Vector3()`), đột biến in-place thay vì khởi tạo instance mới mỗi frame.
  2. **Bounded Ring Buffer O(1)**: Mọi mảng nhật ký hoặc hiệu ứng trong Zustand BẮT BUỘC có trần kích thước cố định (`MAX_VIOLATIONS = 50`, `MAX_FLOATING_TEXTS = 15`) và áp dụng `slice(-MAX)` hoặc `slice(0, MAX)` khi thêm phần tử mới.
  3. **Strict 400 LOC Modular Decomposition**: Khi file Core Logic / FSM / Domain Services vượt 300 LOC (ngưỡng 75%), BẮT BUỘC phân rã thành các coordinator chuyên biệt (`room_bot_coordinator.ts`, `room_property_coordinator.ts`, `wss_lobby_handlers.ts`, `game_store_types.ts`). Tuyệt đối cấm "code golf" (gộp dòng) hoặc xóa chú thích để lách giới hạn.
  4. **Subroutine Decomposition with CC <= 5**: Mọi hàm biến đổi trạng thái phức tạp BẮT BUỘC phân rã thành các hàm con độc lập (`applyPlayerDeltas`, `applyCellDeltas`, `applyPhaseAndTimerDeltas`), mỗi hàm có độ dài <= 30 LOC và độ phức tạp Cyclomatic Complexity CC <= 5.

---

### 44. [ADMIN/LOG/NFR] Ghi Nhật Ký Thời Gian Thực Nối Dòng (Append-Only JSONL) & Bảo Tồn Lịch Sử Trận Đấu Khi Đóng Phòng (Persistent Real-Time Admin Logging Invariant)
- **Hiện tượng**:
  1. *Mất ngữ cảnh đầu trận do giới hạn RAM*: Cơ chế lưu trữ RAM giới hạn 100 log (`MAX_ROOM_LOGS = 100`) khiến các trận đấu dài qua nhiều vòng (10-30 vòng) bị đẩy mất các sự kiện tạo phòng, đấu giá, mua đất quan trọng ban đầu.
  2. *Mất toàn bộ lịch sử khi phòng đóng*: Khi trận kết thúc bình thường (`broadcastGameOver`) hoặc bị đóng (`closeRoom`), phương thức `handleRoomClosed` xóa sạch log trên RAM, khiến Quản trị viên vào sau không thể truy cứu lịch sử ván đấu.
  3. *Lỗi INVALID_ENVELOPE khi thêm thông điệp mạng*: Khi bổ sung các gói tin WebSocket mới (`ADMIN_GET_ARCHIVED_ROOMS`, `ADMIN_GET_ARCHIVED_LOGS`), nếu quên đăng ký vào `VALID_CLIENT_TYPES` và `validateFieldsByType` trong `EnvelopeValidator`, toàn bộ yêu cầu từ client sẽ bị tường lửa bảo mật chặn lại với mã lỗi `INVALID_ENVELOPE`.
  4. *Trùng lặp mã AST Token (JSCPD)*: Việc hiển thị danh sách dòng log ở cả màn hình Live Stream và Archive View dễ tạo ra bản sao token trùng lặp nếu render JSX trực tiếp trong 2 view.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Zero-Crash Append-Only Stream**: Mọi sự kiện phát sinh ghi trực tiếp 1 dòng JSON nối tiếp (`fs.appendFileSync` bọc trong `try/catch` có chú thích `/* safe-ignore */`) vào tệp `server_logs/rooms/<ROOM_CODE>_<TIMESTAMP>.jsonl`. Không bao giờ xóa tệp này khi phòng đóng hoặc kết thúc.
  2. **Manifest Sổ Cái Tập Trung**: Máy chủ duy trì tệp chỉ mục `server_logs/rooms/rooms_manifest.json` ghi nhận trạng thái (`ACTIVE`, `FINISHED`, `TERMINATED`), thời gian bắt đầu, kết thúc, số người chơi, người thắng và dung lượng tệp.
  3. **Envelope Validator Alignment**: Mọi loại thông điệp WebSocket mới từ client BẮT BUỘC được khai báo trong `VALID_CLIENT_TYPES` và ánh xạ trường trong `validateFieldsByType`.
  4. **UI Deduplication Pattern**: Tách riêng component hiển thị dòng log (`AdminLogRow`) để tái sử dụng giữa Live View và Archive View, triệt tiêu 100% mã trùng lặp AST token (JSCPD).

---

### 45. [ADMIN/PERF/CRASH] Bất Biến Chống Nghẽn Đĩa Khi Ghi Sự Kiện & Phục Hồi Dòng Nhật Ký Bị Vỡ Sau Sự Cố Sập Nguồn (Zero-Blocking Manifest & Per-Line Crash Resilience Invariant)
- **Hiện tượng**:
  1. *Nghẽn đĩa I/O nghiêm trọng do ghi đè toàn bộ Manifest trên từng sự kiện*: Trong triển khai ban đầu của Persistent Logger, mỗi lần gọi `appendEvent`, hệ thống lại gọi `fs.writeFileSync(manifestFile, JSON.stringify(list, null, 2))` đồng bộ để cập nhật `totalEvents`. Khi trận đấu có 1.000 sự kiện hoặc 10 phòng chạy song song, việc ghi đè liên tục tệp JSON làm nghẽn Event Loop của Node.js, phá vỡ ngân sách 60 FPS và độ trễ dưới 60ms.
  2. *Mất toàn bộ nhật ký ván đấu khi có 1 dòng bị vỡ (All-or-Nothing Crash)*: `getRoomFullLog` dùng `lines.map(l => JSON.parse(l))` bọc trong một khối `try/catch` duy nhất. Nếu máy chủ bị tắt nguồn đột ngột tạo ra 1 dòng JSON bị đứt đoạn ở cuối tệp, toàn bộ hàm quăng ngoại lệ và trả về mảng rỗng `[]`, khiến Quản trị viên nhìn thấy 0 dòng log dù 999 dòng trước đó hoàn toàn hợp lệ.
  3. *Sai lệch số lượng người chơi (Player Count) sau khi kết thúc ván*: `RoomFinishSummary` không lưu trữ `playerCount`, khiến tệp chỉ mục `rooms_manifest.json` luôn ghi nhận `playerCount: 1` của lúc tạo phòng ban đầu dù ván đấu thực tế có 4 người chơi.
  4. *Cắt gọt nhật ký Live Stream xuống 100 dòng*: Client hook `useAdminPortal` sử dụng `slice(-99)` trong luồng `ADMIN_ROOM_LOG`, tự ý cắt bỏ sự kiện từ vòng 1 đến vòng 15 khi trận đấu bước sang vòng 30.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Zero-Blocking Manifest Catalog**: CẤM gọi `saveManifest()` đồng bộ trong `appendEvent`. Số liệu thống kê `totalEvents` và `fileSizeBytes` phải được cập nhật tức thì trên RAM (`this.manifest`). Thao tác ghi đĩa `saveManifest()` chỉ được phép thực thi tại 2 ranh giới vòng đời: Khởi tạo phòng (`initRoomLog`) và Đóng/Kết thúc phòng (`finishRoomLog`).
  2. **Per-Line Safe Parse Recovery**: Đọc tệp `.jsonl` BẮT BUỘC bọc `JSON.parse` riêng lẻ cho từng dòng độc lập trong vòng lặp. Dòng lỗi/corrupted do ngắt nguồn phải được bỏ qua an toàn để bảo toàn 100% các bản ghi hợp lệ khác.
  3. **Accurate Player Count Invariant**: Khi phòng đóng (`closeRoom` / `finishRoomLog`), BẮT BUỘC truyền số lượng người chơi thực tế (`room.players.length`) vào `RoomFinishSummary` để cập nhật chính xác số người tham gia vào Manifest.
  4. **Extended Live Log Buffer**: Mảng log trực tiếp trên Client phải duy trì dung lượng tối thiểu 2.000 sự kiện để bảo đảm Quản trị viên xem trọn vẹn toàn bộ diễn biến từ vòng 1 đến vòng 30.

---

### 46. [3D/ASSET/LOADER] Bất Biến Nạp Mô Hình 3D An Toàn (SafeGLTFModel), Chặn Treo Headless Guard & Kiểm Soát Ngân Sách Asset (Zero-Crash GLTF & Asset Budget Invariant)
- **Hiện tượng & Bẫy thực tế**:
  1. *Gãy đổ toàn bộ Test Suites khi import Drei useGLTF*: Khi các component 3D gọi `useGLTF` từ `@react-three/drei` trực tiếp, môi trường kiểm thử Vitest / Node.js (vốn không có WebGL context thật) sẽ crash ngay lập tức hoặc treo vô tận ở trạng thái React Suspense Promise, làm tê liệt 122+ bộ test của dự án.
  2. *Cạn kiệt WebGL Context (Context Exhaustion) do kiểm tra lặp lại*: Hàm kiểm tra môi trường nếu tạo mới canvas (`document.createElement('canvas').getContext('webgl2')`) ở mỗi lần render component sẽ nhanh chóng chạm trần 8–16 contexts của trình duyệt, gây sập WebGL context và rớt FPS nghiêm trọng.
  3. *Vi phạm React Rules of Hooks*: Đặt các hook như `useRef` sau câu lệnh rẽ nhánh điều kiện `if (isHeadless) return <>{effectiveFallback}</>;` vi phạm quy tắc Hooks của React, dẫn đến crash ứng dụng khi render qua lại giữa các môi trường hoặc SSR.
  4. *Khóa cứng trạng thái lỗi vĩnh viễn (Error Boundary Lock)*: Khi tải mô hình thất bại (ví dụ lỗi mạng 404), `SafeModelErrorBoundary` bắt lỗi và chuyển `hasError = true`. Nếu component cha truyền vào một `url` mới đã sửa đúng, Error Boundary vẫn giữ `hasError = true` nếu không có cơ chế reset trạng thái theo vòng đời React.
  5. *Định dạng glTF không chuẩn & Primitive Strip/Fan*: Mô hình xuất từ Blockbench hoặc MagicaVoxel có thể dùng `TRIANGLE_STRIP` (mode 5) hoặc `TRIANGLE_FAN` (mode 6) thay vì chỉ `TRIANGLES` (mode 4), khiến các thuật toán đếm tam giác chia 3 bị sai lệch hoặc bỏ qua.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Headless Guard Tuyệt Đối (`isHeadlessOrTestEnv`)**: Mọi lệnh nạp tài nguyên ngoài qua Drei `useGLTF` BẮT BUỘC phải đi qua lớp bảo vệ `isHeadlessOrTestEnv()`. Trong môi trường Node / Vitest / SSR, component tự động trả về Procedural Fallback mà không bao giờ kích hoạt hook WebGL thật.
  2. **Bộ Đệm WebGL Context Caching (`cachedHasWebGL`)**: Kết quả kiểm tra WebGL context BẮT BUỘC được lưu cache ở cấp module (`cachedHasWebGL`) và chỉ được xóa khi gọi `setHeadlessGuardOverride(null)`.
  3. **Strict Rules of Hooks Invariant**: Mọi React Hooks (`useRef`, `useMemo`) BẮT BUỘC khai báo ở dòng đầu tiên của functional component trước bất kỳ câu lệnh rẽ nhánh `return` nào.
  4. **Dynamic Error Recovery via `getDerivedStateFromProps`**: `SafeModelErrorBoundary` BẮT BUỘC lưu trữ `prevUrl` trong state và triển khai `static getDerivedStateFromProps` để tự động dọn dẹp `{ hasError: false, error: undefined }` ngay khi prop `url` thay đổi.
  5. **Ngân Sách Kỹ Thuật Bắt Buộc (Asset Budget Invariant)**:
     - Tổng dung lượng tải ban đầu toàn bộ mô hình: `<= 2.5 MB`.
     - Quân cờ (Pawns): `<= 150 KB`, `<= 1.200 triangles`.
     - Công trình (Buildings): `<= 100 KB`, `<= 800 triangles`.
     - Vi giao thông (Vehicles): `<= 30 KB`, `<= 400 triangles`.
     - Danh thắng (Landmarks): `<= 200 KB`, `<= 1.500 triangles`.
     - Quy tắc đếm tam giác: Mode 4 (`count / 3`), Mode 5 & 6 (`Math.max(0, count - 2)`).
     - Kiểm soát tự động qua `npm run lint:assets` tích hợp trong `gate:quick` và `gate`.

---

### 47. [3D/VEHICLES/TRAFFIC] Bất Biến Phân Tách Chủng Loại Mô Hình Vi Giao Thông & Chống Xung Đột Chiều Sâu Đèn Chiếu Sáng (Discrete Vehicle Model Archetypes & Z-Fighting Immunity Invariant)
- **Hiện tượng & Bẫy thực tế**:
  1. *Ô nhiễm nhận diện thị giác (Sedan Roof Sign Glitch)*: Gắn cố định bảng hiệu nóc taxi vào mô hình sedan khiến toàn bộ xe cá nhân (sedan, SUV, coupe thể thao) khi tải mô hình `.glb` đều biến thành xe taxi, phá vỡ tính đa dạng thị giác của sa bàn đô thị.
  2. *Bỏ sót xe thùng và tàu container*: Quy định kỹ thuật yêu cầu đủ 3 cặp phương tiện (xe hơi sedan/taxi, xe bus/thùng, tàu thuyền tuần tra/container) nhưng việc chỉ xuất 3 mô hình cơ bản và bỏ qua xe thùng vận tải và tàu container hàng hải làm đứt gãy tính hoàn thiện của lát cắt dọc.
  3. *Xung đột chiều sâu đèn pha/hậu (Z-Fighting Light Fixture)*: Khi component cha `DioramaTraffic` điều khiển vệt sáng đèn pha LED và đèn hậu ban đêm kèm các khối bóng đèn, nếu tệp `.glb` nhị phân cũng chứa các khối đèn ở tọa độ tương đương, hai bề mặt sẽ tranh chấp buffer chiều sâu (Z-fighting) gây nhấp nháy khó chịu trên WebGL.
  4. *Gãy kiểm thử tĩnh nếu không đồng bộ Procedural Fallback*: Các test suite môi trường headless (`diorama_traffic.test.ts`, `coastal_dynamics.test.ts`) kiểm tra các chuỗi mã màu hex tĩnh (`#0284C7`, `#10B981`, `#EAB308`, `#DC2626`). Nếu xóa bỏ hoặc làm sai lệch `MicroVehicleProceduralFallback` hay `ContainerShipProceduralFallback`, test headless sẽ fail lập tức.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Tách biệt mô hình độc lập (Discrete GLTF Archetypes)**: Xuất đầy đủ 6 tệp mô hình `.glb` độc lập (`vehicle_sedan.glb` không biển taxi, `vehicle_taxi.glb` có biển nóc phát sáng, `vehicle_bus.glb`, `vehicle_van.glb` thùng xe hàng hóa, `vehicle_boat.glb`, `vehicle_container.glb`).
  2. **Hàm phân giải chuẩn loại (`getVehicleModelUrl`)**: Mọi xe vi mô trên đường nội bộ hoặc ngoài khơi đều được phân giải URL mô hình xác định theo `v.type` qua `getVehicleModelUrl`.
  3. **Zero Z-Fighting Light Separation**: Thân vỏ mô hình glTF giữ bề mặt tinh gọn; toàn bộ các nguồn sáng phát quang, vệt đèn pha rọi mặt đường và bọt rẽ sóng do component cha quản lý để dễ dàng điều khiển theo chu kỳ Ngày/Đêm (`useEnvironmentStore`) và hoạt cảnh sóng nước (`useSafeFrame`).
  4. **Preserved Procedural Fallback**: Mọi component tích hợp `SafeGLTFModel` cho phương tiện vi mô BẮT BUỘC giữ nguyên cấu trúc hình học và bảng mã màu trong procedural fallback để đảm bảo 100% tương thích ngược với môi trường kiểm thử không có WebGL.

---

### 48. [3D/TEXTURE/MOCK] Khả Năng Tương Thích Canvas 2D Mock Context & Bất Biến Hình Học Tọa Độ Trực Tiếp (Headless Canvas Context Resilience & Direct Coordinate Geometry Invariant - IMP-29.5)
- **Hiện tượng & Bẫy thực tế**:
  1. *Sập kiểm thử vì thiếu phương thức biến đổi Canvas trong môi trường mock*: Khi viết hàm sinh texture thủ tục (`createHeritageEncausticTileTexture`), các bộ mock context 2D trong kiểm thử headless (như Vitest) thường chỉ cung cấp các hàm vẽ cơ bản (`save`, `restore`, `beginPath`, `arc`, `stroke`, `fill`, `moveTo`, `lineTo`, `strokeRect`, `fillRect`) mà không mock `ctx.translate`, `ctx.rotate` hay `ctx.closePath`. Việc gọi trực tiếp các hàm này gây lỗi nghiêm trọng `TypeError: ctx.translate is not a function` làm gãy bộ kiểm thử tự động.
  2. *Tạo mới Texture lặp lại gây cạn kiệt tài nguyên*: Việc gọi lại hàm tạo CanvasTexture trong mỗi chu kỳ re-render của component 3D sinh ra nhiều đối tượng texture dư thừa trên GPU, vi phạm nguyên tắc Zero-Garbage Render Loop.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Direct Coordinate Geometry Invariant**: Mọi thuật toán vẽ hình học hoa văn thủ tục (như gạch bông Đông Dương đối xứng 4 cánh) BẮT BUỘC tính toán trực tiếp tọa độ đỉnh bằng công thức lượng giác (`Math.cos`, `Math.sin`) và các hàm vẽ cơ bản (`moveTo`, `lineTo`), hoặc kiểm tra `typeof ctx.method === 'function'` trước khi gọi các hàm biến đổi tọa độ tùy chọn.
---

### 49. [3D/DEPTH] Bất Biến Phân Tầng Cao Độ Bàn Cờ Hòa Tan Địa Hình (Terrain Flush & Depth Layer Stack Invariant - IMP-30)
- **Hiện tượng & Bẫy thực tế**:
  1. *Bàn cờ mâm nổi tách lìa hòn đảo*: Đặt bàn cờ trên mâm nổi cao 0.24m (`RoundedBox [21.4, 0.24, 21.4]`) nẹp viền kim loại vàng tạo gờ cắt sắc lạnh, biến sa bàn thành một chiếc đĩa bay lơ lửng ngắt kết nối với cảnh quan nhiệt đới.
  2. *Hố nước và khay gỗ rỗng ruột chiếm đất trung tâm*: Khay xúc xắc thành hộp gỗ gụ cao 0.24m kết hợp hồ nước vuông `CenterpieceWater` chiếm hơn 50% lõi bàn cờ, biến trung tâm thành hố trũng tối tăm, cản trở hoàn toàn việc quy hoạch đại đô thị nén.
  3. *Lệch tâm máy quay khi xúc xắc đổi vị trí*: Khi chuyển sàn diễn xúc xắc ra Đại Lộ Sài Gòn `[0.0, 0.020, 3.8]`, nếu không cập nhật `CAMERA_CONFIG.dice_roll`, camera sẽ ngắm vào khoảng không giữa bàn cờ `[0, 0.35, 0]`.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Depth Layer Stack Triệt Tiêu Z-Fighting**: Cố định 4 cao độ phân tầng: `TERRAIN_BASE_Y = 0.000` (Nền địa hình chính), `TILE_BORDER_Y = 0.015` (Viền móng ô cờ), `TILE_SURFACE_Y = 0.020` (Mặt 40 ô cờ & đại lộ), `STANDEE_BASE_Y = 0.025` (Thềm Standee/Shophouse).
  2. **Terrain Flush Invariant**: Bàn cờ phẳng hòa tan vào mặt đất; loại bỏ vĩnh viễn bệ kè hộp xám `args={[21.4, 0.24, 21.4]}`, nẹp kim loại cũ và `<CenterpieceWater />` khỏi bàn cờ.
  3. **Transient Ruby Dice Runway**: Xúc xắc đỏ ruby PBR (`roughness: 0.12`, `metalness: 0.10`, `transparent: true`, `opacity: 0.88`) nảy đàn hồi trên Đại Lộ Sài Gòn `[0.0, 0.020, 3.8]`, tự động mờ dần sau 1.5s khi dừng quay; camera `dice_roll` cập nhật `target: [0.0, 0.25, 3.8]`, `position: [2.5, 2.8, 7.2]`.
  4. **Modular Coastline Decomposition**: Tách rặng núi chân trời thành `horizon_mountain_range.tsx` (< 120 LOC) và rừng dừa 60 cây vào `tropical_palms_cluster.tsx` (< 100 LOC gom qua `InstancedMesh`), khống chế `coastal_island_environment.tsx` <= 300 LOC.

---

### 50. [3D/PERF] Triệt Tiêu Phụ Thuộc Vòng (Circular Dependency) & Bất Biến Giật Cấp Đô Thị Nén (Stepped Height Zoning & Decoupled Depth Stack - IMP-31)
- **Hiện tượng & Bẫy thực tế**:
  1. *Khóa treo tải động (Module Evaluation Deadlock/Timeout) do phụ thuộc vòng*: Khi component con sa bàn (`diorama_terrain.tsx`) import các hằng số cao độ từ component điều phối cha (`board_layout.tsx`), trong khi `board_layout.tsx` import `MiniatureCityDiorama` (vốn import ngược lại `diorama_terrain.tsx`). Khi chạy kiểm thử Vitest song song tải nặng, chu trình import vòng khiến trình nạp ESM bị nghẽn (stall) và quăng lỗi `Test timed out in 5000ms`.
  2. *Khối nhà đại trà làm phình Draw Calls GPU*: Render thủ công từng căn nhà phố hoặc tháp cao ốc bằng các thẻ `<mesh>` độc lập gây bùng nổ draw calls (> 100 draw calls), vi phạm ngân sách hiệu năng WebGL trên thiết bị di động.
  3. *Công trình tiền cảnh che khuất ô đất bàn cờ*: Đặt các tòa nhà cao tầng sát vành đai ô cờ khiến camera góc nghiêng 38 độ bị che khuất tầm nhìn vào ô đất, quân cờ và Standee.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Strict Hierarchy & Zero-Cycle Rule**: Các component con chuyên biệt (`diorama_terrain.tsx`, `diorama_shophouse_blocks.tsx`) tuyệt đối CẤM import ngược lại coordinator cấp cao (`board_layout.tsx`). Sử dụng hằng số cục bộ hoặc tách tệp contract độc lập.
  2. **Batching InstancedMesh Bắt Buộc (Draw Call Budget <= 75)**: Toàn bộ 32 căn Shophouse phố cổ Chợ Lớn / Bến du thuyền và 16 tháp cao ốc tài chính BẮT BUỘC gom qua `InstancedMesh` (2 meshes/component: tường & mái ngói; thân tháp & chóp kính), tiêu tốn tối đa 2 Draw Calls mỗi cụm.
  3. **Stepped Height Zoning Invariant**:
     - Nhà phố ven ô cờ (Shophouse): chiều cao `height <= 0.8` (dải tối ưu 0.35 - 0.75) bảo toàn 100% tầm nhìn ô đất.
     - Cao ốc trung tâm (Highrise): lùi sâu về phía Bắc (Z <= -2.4), chiều cao `height <= 3.2` (dải giật cấp 1.2 - 2.8) tạo đường chân trời đa tầng ngoạn mục mà không che chắn sàn diễn xúc xắc.

---

### 51. [3D/PBR/TABLETOP] Bất Biến Khay Gỗ Óc Chó Liền Khối, Giới Hạn Phát Quang & Sóng Biển GPU (Executive Tabletop Depth Stack, Emissive Capping & GPU Wave Invariant - IMP-32)
- **Hiện tượng & Bẫy thực tế**:
  1. *Ô nhiễm màu sắc thảm cỏ & mâm cờ trôi nổi*: Đặt mâm cỏ xanh nhân tạo `#22C55E` tách lìa không gian nội thất, làm mất đi tính sang trọng của một sa bàn thương gia cao cấp (Executive Tabletop Diorama).
  2. *Cháy sáng ngoại suy (Overblown Bloom/Emissive Glitch)*: Hiệu ứng phát sáng vàng nhân tạo (`GoldenGlowVFX`) và `emissiveIntensity` ban ngày không được kiểm soát gây cháy sáng (highlight clipping) loang lổ, phá vỡ môi trường ánh sáng tự nhiên.
  3. *Nghẽn CPU do biến dạng sóng nước bằng mảng Float32Array*: Lặp qua từng đỉnh mặt nước trên CPU bằng vòng lặp `for (let k = 0; k < pos.array.length; k += 3)` trong `useSafeFrame` gây nghẽn luồng xử lý chính của JavaScript và sụt giảm khung hình trên các thiết bị cấu hình trung bình.
  4. *Cột cờ ký hiệu vô định hình*: Sử dụng các khối tròn procedural mờ nhạt không định danh rõ quyền sở hữu và chất liệu tactile.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Executive Walnut Tabletop & 8-Layer Physical Depth Stack**:
     - Mặt bàn gỗ óc chó nguyên khối cao cấp (`WALNUT_TABLE_Y = -0.350`, màu nâu sẫm `#2B1D14`, `roughness: 0.28`, `metalness: 0.05`) ôm trọn toàn bộ quần đảo sa bàn.
     - Phân tầng cao độ vật lý không xung đột Z-fighting: `WALNUT_TABLE_Y = -0.350` -> `LAGOON_WATER_Y = -0.150` -> `SHORELINE_SAND_Y = -0.060` -> `TERRAIN_BASE_Y = 0.000` -> `TILE_BORDER_Y = 0.012` -> `TILE_SURFACE_Y = 0.018` -> `PAWN_HALO_Y = 0.020` -> `STANDEE_BASE_Y = 0.025`. Triệt tiêu hoàn toàn màu cỏ `#22C55E`.
  2. **Emissive Capping Invariant**:
     - Loại bỏ vĩnh viễn `GoldenGlowVFX`.
     - Khống chế trần phát quang: Ban đêm `emissiveIntensity <= 0.45`, hoàng hôn `<= 0.25`, ban ngày triệt tiêu tuyệt đối `= 0.0` trên toàn bộ công trình thủ tục (`procedural_building.tsx`).
  3. **AgX Tone Mapping & Half-Res Ambient Occlusion Pipeline**:
     - Cấu hình hậu kỳ chuyển sang `ToneMappingMode.AGX` để tái tạo màu sắc mượt mà ở dải sáng cao mà không bị bão hòa gắt.
     - Cấu hình N8AO với `halfRes={true}` (`aoHalfRes: true`) nhằm tối ưu băng thông fillrate trên GPU mà vẫn bảo toàn bóng tiếp xúc chân thực.
  4. **GPU-Only Gerstner Wave Invariant**:
     - Triệt tiêu 100% việc thao tác trực tiếp trên `Float32Array` ở luồng CPU. Đưa toàn bộ dao động sóng đa hướng vào vertex shader thông qua hook `onBeforeCompile` của Three.js, duy trì ngân sách mã nguồn `coastal_island_environment.tsx <= 300 LOC`.
  5. **Brass Flagpole & Cloth Flag Ownership System**:
     - Đánh dấu quyền sở hữu đất thông qua cụm cờ hợp kim đồng thau (`cylinderGeometry`, `roughness: 0.25`, `metalness: 0.85`) và lá cờ vải dệt (`boxGeometry`, `setColorAt` theo mã màu người chơi) gom toàn bộ qua `OwnershipMarkerInstances`.

---

### 52. [TEST/SDLC] Bệnh Monolithic Test & Bẫy Kiểm Tra Tồn Tại Tĩnh tại Trạm 1 (Anti-Patterns in QA Test Generation & The Universal 4-Facet Invariant)
- **Hiện tượng & Bẫy thực tế**:
  1. *Bệnh Monolithic Test (Nhồi nhét assertions)*: Gom toàn bộ 20-60 phần tử vào một vòng lặp `for` hoặc `forEach` bên trong 1 câu lệnh `it()`. Vitest/Jest chỉ đếm là 1 test pass, che giấu lỗi phía sau nếu phần tử đầu fail, và sinh ra số lượng test rất ít (3-8 tests) tạo cảm giác làm việc qua loa.
  2. *Bẫy Kiểm Tra Tồn Tại Tĩnh (Checklist Fallacy)*: Test chỉ assert `fs.existsSync`, `typeof fn === 'function'`, `toHaveLength(...)`, và đếm dòng file LOC. Đây là việc của Linter tĩnh/Compiler, không phải việc của Test Runner. Hệ quả: Bỏ rơi hoàn toàn các phản ứng trạng thái động, rò rỉ bộ nhớ và phòng thủ ngoại lệ.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Atomic Test Mandate & Parameterized Testing**: Mỗi `it()` chỉ kiểm tra 1 hành vi duy nhất (tối đa 1-4 `expect()`). CẤM vòng lặp `for`/`forEach` trong thân hàm `it()`. Bắt buộc dùng `it.each` / `test.each`.
  2. **Banned Static Checklist Tests**: Cấm dùng `it()` chỉ để kiểm tra `fs.existsSync`, `typeof fn === 'function'` hoặc LOC. Toàn bộ kiểm tra tĩnh chuyển giao sang `npm run lint:slop` và `tsc --noEmit`.
  3. **Universal 4-Facet Behavioral Matrix**: Mọi tệp test tại Trạm 1 bắt buộc phủ đủ 4 khía cạnh: (1) Boundary & Range, (2) State Reactivity, (3) Resource Disposal, (4) Error Defense.
  4. **Sàn Mật Độ Kiểm Thử**: Tối thiểu 15-30 atomic tests cho mỗi lát cắt tính năng. Tỷ lệ `expect()` / `it()` duy trì trong dải 1.0 đến 3.5.

---

### 53. [UI/MODAL/3D] Bất Biến Hoisting React Hooks Trong Modal Đa Năng & Cơ Chế Hiển Thị Diorama Nghệ Thuật (Rule of Hooks Hoisting & Indigenous Diorama Showcase Invariant - IMP-33)
- **Hiện tượng & Bẫy thực tế**:
  1. *Vi phạm React Rule of Hooks khi đặt Hooks dưới Early Return*: Trong modal đa năng như `TitleDeedModal`, việc đặt các hooks (`useState`, `useEffect`, `useMemo`) phía dưới câu lệnh rẽ nhánh bảo vệ `if (!deed) return (...)` dẫn đến lỗi nghiêm trọng `Rendered fewer hooks than expected. This may be caused by an accidental early return statement.` khi người chơi chuyển đổi giữa ô có sổ đỏ và ô không có sổ đỏ (như ô Khởi Hành 0).
  2. *Quăng ngoại lệ chưa bắt khi nạp ảnh cho ô không phải tài sản kinh tế*: Hàm `getTileAssetUrl(tileIndex)` quăng lỗi trực tiếp `Invalid tile index... Not a purchasable property tile` khi truyền vào chỉ số ô đặc biệt (ô 0, 2, 4, 7...). Nếu component 3D gọi mà không bọc `try...catch`, toàn bộ cây render của Canvas WebGL sẽ bị crash.
  3. *Tràn số lượng vòng đai cấp độ trên cọc cờ*: Thuộc tính `level` không được kẹp trần (clamped) chặt chẽ trong dải miền giá trị [0..3], dẫn đến việc render số lượng vòng đai tùy ý vượt quá luật game cờ tỷ phú.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Top-Level Hook Hoisting**: Tất cả các React Hooks (`useState`, `useEffect`, `useMemo`) BẮT BUỘC đặt ở tầng trên cùng của component trước bất kỳ câu lệnh `if (!deed)` hoặc early return nào.
  2. **Defensive Asset Loading**: Mọi lời gọi tới `getTileAssetUrl` trong môi trường 3D hoặc UI BẮT BUỘC bọc trong khối `try...catch` an toàn và cung cấp fallback về đường dẫn chuẩn `/assets/tiles/tile_${paddedId}.webp`.
  3. **Strict Domain Clamping Invariant**: Giá trị cấp độ `level` truyền vào `OwnershipMarkerInstances` bắt buộc chuẩn hóa qua `Math.min(3, Math.max(0, Math.floor(level ?? 0)))`.
  4. **Tam Giác Trải Nghiệm Đồ Họa Bất Biến**:
     - Mặt bàn cờ 3D: Giữ nguyên chuẩn hóa C0-C3 để nhận diện gameplay tức thì; hiển thị Standee thu nhỏ gọn gàng (`scale={[0.85, 0.85]}`) cho 6 ô hạ tầng cố định (ô 5, 12, 15, 25, 28, 35) vì không bao giờ nâng cấp nhà.
     - Thẻ Sổ Đỏ 2D: Tôn vinh trọn vẹn 28 tác phẩm Diorama 3D WebP độ nét cao với khung viền kim loại xúc giác và hiệu ứng nổi.

---

### 54. [3D/GRAPHICS/POSTPROCESSING] Bất Biến Khử Răng Cưa Subpixel SMAA, Tiêu Cự Sa Bàn Toàn Diện & Triệt Tiêu Double Tone Mapping (Subpixel SMAA, Panoramic DoF & Single-Source Tone Mapping Invariant - IMP-34)
- **Hiện tượng & Bẫy thực tế**:
  1. *Răng cưa gãy khúc đường chéo (Aliasing Jaggies)*: Khi đưa `EffectComposer` vào Three.js / R3F, cờ `antialias: true` của WebGL mặc định bị vô hiệu hóa trên các Framebuffer Object (FBO) trung gian. Nếu không có pass khử răng cưa hậu kỳ chuyên dụng, mép bàn cờ 45°, dây văng cầu Landmark, cọc cờ và viền công trình sẽ bị bậc thang răng cưa rõ rệt khi người dùng zoom cận cảnh.
  2. *Mờ nhòe diện rộng do DoF khóa cứng tâm (Macro Blur Fallacy)*: Cấu hình `DepthOfField` với `focusRange` hẹp (75.0) và `bokehScale` cao (1.3) khóa chết tiêu cự tại `[0, 0, 0]`. Khi camera quay góc nghiêng hoặc lia về các ô cờ ở rìa sa bàn (ô 1-9, ô 21-29), DoF phủ kernel mờ bokeh 480p lên các ô đất, làm nhòe chữ số tiền và đường nét công trình.
  3. *Hiện tượng Double Tone Mapping (Bợt màu & mất độ tương phản khối)*: Cấu hình `toneMapping: ACESFilmicToneMapping` ở tầng `<Canvas>` trong khi `EffectComposer` lại cấu hình `<ToneMapping mode={ToneMappingMode.AGX} />`, khiến dải tương phản bị nén 2 lần liên tiếp, làm mất chi tiết vùng sáng, đục màu trắng cẩm thạch và giảm độ đanh của bóng tiếp xúc.
  4. *Răng cưa bóng đổ (Hard Shadow Stepping)*: Thiết lập `shadows` dạng boolean mặc định dùng `PCFShadowMap` tạo bóng đổ răng cưa trên diện tích sa bàn rộng.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **SMAA Terminal Pass Invariant**: Toàn bộ pipeline hậu kỳ BẮT BUỘC đặt `<SMAA />` (Subpixel Morphological Anti-Aliasing) làm pass cuối cùng sau Tone Mapping để tái tạo đường nét vector subpixel mịn màng.
  2. **Panoramic DoF Focus Range**: `dofFocusRange` BẮT BUỘC `>= 150.0` (mặc định 160.0) và `dofBokehScale <= 0.5` (mặc định 0.45) để giữ trọn vẹn 100% 40 ô cờ nét căng ở mọi góc camera, chỉ làm mờ nhẹ các đỉnh núi xa xăm hậu cảnh.
  3. **Single-Source Tone Mapping Invariant**: Cấu hình `gl={{ toneMapping: NoToneMapping }}` trên Canvas R3F, nhường quyền kiểm soát duy nhất cho `ToneMappingMode.AGX` trong `EffectComposer` để bảo toàn độ no màu và tương phản khối.
  4. **PCFSoftShadow & Subpixel DPR Floor**: Canvas BẮT BUỘC cấu hình `shadows="soft"` (kích hoạt `PCFSoftShadowMap`). *(⚠️ **Lưu ý thay thế DPR**: Quy định sàn `dpr={[1.25, 2]}` tại đây đã được **thay thế bởi Gotcha #103 (IMP-77)** chuyển sang trần cân bằng `dpr={[1, 1.5]}` nhằm giải cứu GPU fillrate khỏi bẫy sụt 21 FPS trên màn hình Retina/4K)*.

---

### 55. [3D/GRAPHICS/LAYOUT] Bất Biến Bố Cục Thẻ Cờ Ngoại Biên, Giấy Bìa Mờ True Matte & Khóa Nét Mipmap (Outer Building Plot, True Matte Cardstock & Texture Sharpness Invariant - IMP-35)
- **Hiện tượng & Bẫy thực tế**:
  1. *Vật thể 3D che khuất tên thẻ bài*: Đặt mô hình công trình 3D (`ProceduralBuilding`) tại `Z = -0.42` hoặc `StandeeBillboard` tại `Z = 0.0`. Đây chính là tọa độ vẽ tên địa danh (`y = 108` trên canvas texture) và icon bản địa, khiến mô hình cắm thẳng lên chữ, che khuất hoàn toàn tên thẻ cờ.
  2. *Chói lóa quang học (Specular Glare Washout)*: Mặt thẻ bài dùng `roughness: 0.52` và `envMapIntensity: 0.5`, hoạt động như nhựa bóng phủ dầu. Dưới ánh nắng sa bàn ngoài trời và ánh sáng môi trường IBL, một lớp phản quang trắng loang lổ phủ lên mặt giấy, triệt tiêu độ tương phản và làm bợt màu mực đen.
  3. *Mờ nhòe chữ do cơ chế Mipmap Box Filter*: Thuộc tính `texture.generateMipmaps = true` và `minFilter = LinearMipmapLinearFilter` tự động nén thu nhỏ texture thành các mip level 128x170 khi camera ở khoảng cách quan sát cao (Y=22, distance ~35). Các nét chữ thanh mảnh và dấu thanh tiếng Việt bị nén thành vệt xám mờ đục.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Outer Building Plot Invariant (Z = +0.58)**: Toàn bộ công trình 3D C0–C3 (`ProceduralBuilding`) và `StandeeBillboard` ô hạ tầng BẮT BUỘC dịch chuyển về 1/3 mép ngoài của thẻ bài: `position={[0, Y, 0.58]}` (scale Standee `[0.78, 0.78]`). Tách biệt 100% không gian xây dựng khỏi khu vực tên thẻ bài và dải màu nhận diện hướng tâm (`Z = -0.82` đến `-0.35`).
  2. **True Matte Cardstock Shading Invariant**: Bề mặt giấy thẻ bài trên cả 40 ô cờ (ô góc và ô thường) BẮT BUỘC thiết lập chất liệu giấy mỹ thuật mờ: `roughness: 0.96`, `metalness: 0.0`, `envMapIntensity: 0.0`. Triệt tiêu hoàn toàn ánh chói lóa specular glare, bảo toàn độ đen than đậm đà `#020617` của nét mực in.
  3. **No-Mipmap Native Sampling Invariant**: Toàn bộ `CanvasTexture` sinh ra cho thẻ bài (`tile_texture_generator.ts`) BẮT BUỘC vô hiệu hóa Mipmap: `texture.generateMipmaps = false`, `texture.minFilter = LinearFilter`, `texture.magFilter = LinearFilter`, `texture.anisotropy = 16`. GPU luôn đọc trực tiếp từ ảnh gốc HiDPI 1024x1360 trên nền giấy da ngà sáng `#F8F5EE`, bảo toàn độ sắc nét tuyệt đối của từng dấu thanh tiếng Việt ở mọi cự ly camera.

---

### 56. [3D/TEXTURE/C0] Bất Biến Tranh Di Sản Bản Địa Tách Nền & Triệt Tiêu Hàng Rào Cọc Dây C0 (Flat Heritage Tile Art & Clean C0 Plot Invariant - IMP-36)
- **Hiện tượng & Bẫy thực tế**:
  1. *Đè lấn tranh di sản lên tiêu đề và giá*: Khi vẽ tranh bản địa trực tiếp lên CanvasTexture của thẻ bài, nếu không kẹp vùng cắt an toàn (safe clipping boundary), hình vẽ có thể chồm lên vùng chữ tiêu đề địa danh (`y < 150`) hoặc tràn xuống khay giá niêm yết (`y > 270`).
  2. *Ô nhiễm thị giác từ cọc dây ranh giới C0*: Hàng rào cọc gỗ và dây thừng trắc địa (`SurveyorPlotBoundary`) hiển thị mặc định trên tất cả các ô đất chưa mua (Cấp 0) làm bàn cờ bị rối rắm, che khuất tranh di sản bản địa in phẳng trên mặt thẻ cờ.
  3. *Tranh chấp thị giác giữa Standee 3D và Tranh phẳng trên mặt bàn*: Render song song cả Standee Billboard 3D đứng và tranh di sản 2D trên 6 ô hạ tầng cố định (5, 12, 15, 25, 28, 35) gây xung đột thị giác.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Heritage Art Safe Clipping Zone**: Vùng vẽ tranh di sản trung tâm thẻ cờ BẮT BUỘC giới hạn trong khung clip `rect(8, 148, 240, 122)`, khống chế chiều cao tranh tối đa 122 đơn vị (`y = 148..270`), triệt tiêu 100% việc đè lấn lên tiêu đề (`y = 108, 138`) và khay giá (`y = 274..324`).
  2. **Clean C0 Plot Invariant**: `ProceduralBuilding` cấp 0 mặc định triệt tiêu hoàn toàn hàng rào trắc địa (`showEmptyPlotBoundary = false`), trả lại mặt phẳng ô đất quang đãng, sạch sẽ để tôn vinh trọn vẹn tác phẩm mỹ thuật bản địa.
  3. **Standee Suppression Invariant**: `GameBoard` cấu hình `enableStandee={false}` cho các ô bàn cờ để chuyển giao quyền hiển thị di sản trọn vẹn sang tranh in phẳng trên thẻ cờ, trong khi vẫn duy trì `enableStandee = true` trong `LayeredDioramaTile` cho các view kiểm định độc lập.
  4. **Zero-Dirty-Casts Invariant**: Kiểm tra `hasTileArt(index)` qua `ALL_28_STAND_TILES.includes(index)` dùng kiểu số chuẩn, tuyệt đối cấm ép kiểu `as any` nhằm tuân thủ quy tắc linter anti-slop.

---

### 57. [3D/ART/ASSETS] Bất Biến 28 Tranh Thẻ Bài Tả Thực Bản Địa (1-2 Điểm Nhấn Tiêu Biểu & Alpha Tách Nền Thực Tế - IMP-37)
- **Hiện tượng & Bẫy thực tế**:
  1. *Cảm giác đồ chơi thô từ mô hình 3D Standee*: Dùng ảnh chụp mô hình 3D đặt trên đĩa tròn làm thẻ bài gây cảm giác mô hình nhựa rẻ tiền, không phản ánh chân thực các danh thắng, văn hóa và kiến trúc Việt Nam.
  2. *Bẫy nhồi nhét chi tiết (Visual Clutter Fallacy)*: Đưa quá nhiều cảnh vật, con người, phương tiện vào một khung tranh thẻ cờ nhỏ khiến tác phẩm bị vỡ vụn, rối mắt và mất tiêu cự nhận diện khi nhìn từ trên cao.
  3. *Tranh nền đục che khuất công năng đọc chữ*: Dùng nền trắng đục hoặc viền vuông đặc làm đè lấn lên tên địa danh, phụ đề và khay giá bên dưới.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Strict 1-2 Focal Points Rule**: Mỗi thẻ bài cờ BẮT BUỘC chỉ chọn đúng 1-2 điểm nhấn tiêu biểu nhất gắn liền với tên và phụ đề (Cái Răng: ghe trái cây; Cát Tiên: hươu cao cổ; Cái Mép: cẩu vàng STS; Cầu Ba Son: cầu dây văng; v.v.), tuyệt đối cấm nhồi nhét.
  2. **Realistic Proportions & Atmosphere**: Kiến trúc và tỷ lệ con người BẮT BUỘC tả thực, bài trừ phong cách hoạt hình cartoon hoặc phóng đại trẻ con.
  3. **Soft Alpha Cutout Invariant**: Toàn bộ tranh WebP BẮT BUỘC có kênh alpha tách nền viền mềm (VP8X/ALPH), hòa quyện tự nhiên vào nền giấy da ngà `#F8F5EE` và khay giá sẫm màu `#090D1A`, bảo đảm 100% khả năng đọc chữ tên, phụ đề và giá niêm yết.
  4. **Asset Budget & Safe Backward-Compatibility**: Toàn bộ tệp WebP trong `public/assets/tiles/` BẮT BUỘC `<= 95KB`. Khởi tạo `READY_TILES` nhận diện test suite thông minh, bảo đảm 100% tương thích ngược với các test suite cũ mà không sử dụng dirty cast (`as any`, `as unknown as`).

---

### 58. [3D/LAYOUT/TEXTURE] Bất Biến Bố Cục Thẻ Bài Mở Rộng: Triệt Tiêu Text Phân Loại, Nâng Tiêu Đề & Phóng Đại Tranh Di Sản +118% (Expanded Card Art & Header Refactor Invariant - IMP-38)
- **Hiện tượng & Bẫy thực tế**:
  1. *Lãng phí diện tích do text phân loại (Category Text Fallacy)*: Dải trên cùng chiếm 70px chỉ để hiển thị text phân loại nhóm đất ("HẠ TẦNG", "BĐS NGHỈ DƯỠNG", "BĐS DỊCH VỤ", "BĐS ĐÔ THỊ"), đẩy tên địa danh và phụ đề xuống quá thấp (y=108, y=138).
  2. *Ảnh tranh di sản bị thu nhỏ như con tem (Stamp Size Art Defect)*: Vùng clip tranh cũ (144 x 114 px, diện tích 16.416 px²) khiến tranh danh thắng khi nhìn từ góc máy nghiêng ~38 độ của camera gameplay bị bóp nghẹt, mờ nhỏ và không thể quan sát rõ chi tiết di sản.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Category Text Elimination**: Triệt tiêu 100% việc vẽ `meta.category` trên đỉnh thẻ cờ. Thu gọn dải màu nhận diện nhóm đất thành viền màu sang trọng `fillRect(0, 0, 256, 28)` dày 28px.
  2. **Elevated Typography Hierarchy**: Nâng tiêu đề tỉnh thành chính lên `y = 56` (font 26px `#090D1A`), nâng phụ đề chi tiết lên `y = 80` (font 16px `#334155`). Tách biệt hoàn toàn khỏi thân thẻ cờ.
  3. **Expanded Heritage Art Clip Zone**: Khung cắt an toàn tranh di sản BẮT BUỘC đặt tại `rect(10, 94, 236, 172)`, vẽ ảnh tại `dx = 20, dy = 97, w = 216, h = 166`. Diện tích tranh đạt 35.856 px² (+118.4% so với 16.416 px² cũ), bảo đảm đệm an toàn trên >= 14px (với phụ đề y=80) và đệm an toàn dưới >= 8px (với khay giá y=274).
  4. **Price Capsule Preservation**: Khay giá niêm yết ở đáy thẻ cờ BẮT BUỘC giữ nguyên tọa độ `roundRect(22, 274, 212, 50, 12)`, text căn giữa tại `y = 300`.

---

### 59. [3D/TEXTURE/CAMERA] Bất Biến Nét Chữ Thẻ Cờ, Mipmap Anisotropy 16x & Góc Nhìn Toàn Cảnh Sắc Nét (Tile Text Crispness, Mipmap Anisotropy 16x & Calibrated Overview Invariant - IMP-38.1)
> ℹ️ **[THAM CHIẾU]**: Xem phiên bản mở rộng toàn diện tại [Gotcha #60](#60-3dlightingclarity-bất-biến-độ-sắc-nét-thẻ-cờ-lọc-dị-hướng-anisotropy-16x--camera-isometric-vàng-retropoly--monopoly-plus-crispness-invariant---imp-39) (IMP-39).

- **Hiện tượng & Bẫy thực tế**:
  1. *Hiệu ứng DoF phủ mờ rìa bàn cờ (Macro Blur Edge Defect)*: Cấu hình mặc định của Depth of Field trong `DEFAULT_PIPELINE_CONFIG` với `enableDof = true` làm mờ ngoại vi theo hiệu ứng tilt-shift. Khi camera ở góc nhìn tổng thể (`overview`), các ô cờ ở rìa bàn cờ bị phủ mờ bokeh khiến người chơi không thể đọc được tên địa danh và giá niêm yết.
  2. *Góc camera overview quá xa và lệch tâm (Distant Viewport Fallacy)*: Vị trí camera `[20, 22, 20]` hướng về `[-1.2, 0, -1.2]` tạo cự ly nhìn ~35m quá xa, làm kích thước visual của các dòng chữ trên thẻ cờ bị thu nhỏ quá mức trên màn hình di động/tablet.
  3. *Mờ chữ do thiếu lọc dị hướng Hardware Anisotropy*: Thuộc tính CanvasTexture nếu không kích hoạt `texture.anisotropy = 16` và `texture.minFilter = LinearMipmapLinearFilter` khi bật mipmaps sẽ khiến GPU dùng bộ lọc trilinear thông thường, gây nhòe nét chữ tiếng Việt khi nhìn từ góc nghiêng 38°.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **DoF Overview Suppression**: Vô hiệu hóa DoF mặc định `enableDof = false`, mở rộng dải tiêu cự `dofFocusRange = 320.0` và triệt tiêu `dofBokehScale = 0.0`. Giữ cho toàn bộ 40 ô cờ nét căng ở mọi góc camera.
  2. **Calibrated Overview & PreMatch Viewport**: Khóa cứng tọa độ `overview` và `pre_match` tại `position: [15.5, 17.5, 15.5]`, `target: [-0.8, 0, -0.8]`, `fov: 40`. Giúp camera tiến gần hơn ~22%, căn chuẩn tâm sa bàn, phóng đại kích thước chữ tên ô cờ rõ nét.
  3. **Hardware Anisotropy 16x & Linear Mipmap Filtering**: Cấu hình `texture.anisotropy = 16`, `texture.generateMipmaps = true`, `texture.minFilter = LinearMipmapLinearFilter`, `texture.magFilter = LinearFilter` (đồng thời bảo toàn 100% tương thích ngược với các test suite cũ qua cờ nhận diện).
  4. **Title & Subtitle Typography Hierarchy**: Tên địa danh chính dùng font `900 34px`, nét viền `lineWidth = 2.5` và màu `#090D1A`, tọa độ `(128, 108)`. Phụ đề dùng font `bold 20px` màu `#0F172A`, tọa độ `(128, 138)`. Khay giá `roundRect(22, 274, 212, 52, 12)` với font giá `900 28px #FBBF24` tại `(128, 300)`.

---

### 60. [3D/LIGHTING/CLARITY] Bất Biến Độ Sắc Nét Thẻ Cờ, Lọc Dị Hướng Anisotropy 16x & Camera Isometric Vàng (Retropoly & Monopoly Plus Crispness Invariant - IMP-39)
- **Hiện tượng & Bẫy thực tế**:
  1. *Lọc dị hướng Anisotropy vô hiệu hóa khi thiếu Mipmap*: Chỉ set `texture.anisotropy = 16` nhưng để `generateMipmaps = false` hoặc `minFilter = LinearFilter` sẽ khiến WebGL GPU bỏ qua toàn bộ phần cứng lọc dị hướng. Hậu quả là ở góc nghiêng bàn cờ ~48°, toàn bộ chữ và viền ô cờ bị co giật, mờ nhòe răng cưa.
  2. *Chữ bị rụng nét khi nhìn từ xa trên nền giấy ngà*: Font chữ mảnh không có viền bao bọc khi chiếu phối cảnh từ xa sẽ bị hòa lẫn vào nền sáng của thẻ bài.
  3. *Camera quá xa và góc nghiêng quá bẹt*: Đặt camera quá xa (`[20, 22, 20]`) khiến bàn cờ chỉ chiếm diện tích nhỏ trên màn hình, người chơi bắt buộc phải zoom mới đọc được thông tin.
  4. *Bẫy Smuggling / Test-Sniffing trong mã nguồn production*: Sử dụng `new Error().stack` để kiểm tra tên file test nhằm trả về giá trị cũ cho test suite cũ. Đây là hành vi vi phạm nghiêm trọng nguyên tắc Single Source of Truth (SSOT).
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **WebGL Mipmap & Anisotropy Pairing**: BẮT BUỘC thiết lập đồng thời: `texture.generateMipmaps = true`, `texture.minFilter = THREE.LinearMipmapLinearFilter`, `texture.magFilter = THREE.LinearFilter`, và `texture.anisotropy = 16` trên mọi `CanvasTexture` của thẻ cờ.
  2. **Double-Draw Typography & Contrast Invariant**: Áp dụng kỹ thuật vẽ kép: `strokeText` với màu than đen `#090D1A` (`lineWidth = 2.5px`) trước khi `fillText` cho tiêu đề tỉnh thành font `900 28px`. Toàn bộ chu vi ô cờ được bao bởi `strokeRect` màu đen than `#0F172A` dày `5px`.
  3. **Golden Isometric Elevation Camera**: Camera tổng quan (`overview` và `pre_match`) BẮT BUỘC khóa cứng tại: `position: [11.2, 15.6, 11.2]`, `target: [-0.6, 0.0, -0.6]`, `fov: 40`. Góc nâng đạt ~48°-50° chuẩn Retropoly, bàn cờ bao phủ ~80% khung nhìn, triệt tiêu méo phối cảnh và cho phép đọc rõ 100% chữ không cần zoom.

---

### 61. [3D/MATERIAL/LIGHTING] Bất Biến Triệt Tiêu Phản Quang Mặt Nước, Bloom Lóa Mắt & Cân Bằng Nắng Dịu Dải Tương Phản Đầm (Toy Diorama Velvet Water & Anti-Glare Invariant - IMP-40)
- **Hiện tượng & Bẫy thực tế**:
  1. *Bẫy phản quang gương kim loại trên mặt nước*: Đặt `roughness: 0.08` và `metalness: 0.55` cho Sông Sài Gòn và Đại Dương biến mặt nước thành gương phẳng phản chiếu trực diện nguồn sáng mặt trời, tạo ra đốm trắng chói lòa (nuclear specular hotspot) ngay trung tâm sa bàn.
  2. *Bẫy Bloom lan tỏa phá hủy khả năng đọc chữ*: Cấu hình `bloomThreshold: 1.25` và `bloomIntensity: 0.55` khiến đốm phản quang nước vượt ngưỡng kích hoạt, bốc hơi thành quầng sáng trắng xóa đè lấn lên các ô cờ lân cận (Long Thành, Lệ Phí Đất...).
  3. *Cháy sáng highlight do quang thông quá tải & nền thẻ quá trắng*: Nắng 1.08 kết hợp 2 đèn phụ 0.30, ambient 0.24, IBL và phơi sáng `exposure: 1.05` chiếu lên nền giấy `#F8F5EE` (97% trắng) làm màu sắc bị bợt nhạt, mất chiều sâu khối và gây mỏi mắt người chơi.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Toy Diorama Velvet Water Invariant**: Toàn bộ bề mặt sông hồ và biển BẮT BUỘC thiết lập `roughness >= 0.70` (lý tưởng: 0.75 - 0.80) và `metalness <= 0.02`. Biến nước thành chất liệu nhung ngọc bích no màu, trầm tĩnh, triệt tiêu 100% đốm chói lóa chuẩn Retropoly và Monopoly Plus.
  2. **Bloom Restraint Invariant**: BẮT BUỘC duy trì `bloomThreshold >= 2.0` (lý tưởng: 2.5) và `bloomIntensity <= 0.30` (lý tưởng: 0.20). Bloom chỉ được phép kích hoạt trên các nguồn sáng phát quang ban đêm (đèn hải đăng, laser tháp Landmark, pháo hoa ăn mừng), tuyệt đối không làm lóa mặt bàn cờ ban ngày.
  3. **Gentle Daylight & Highlight Protection**: Ánh nắng ban ngày khóa ở `sunIntensity = 0.92`, `fill/rim = 0.12`, `ambient = 0.18`, `hemi = 0.14`, và `toneMappingExposure = 0.94`. Giữ dải tương phản sâu, khối bóng đổ đanh chắc và bảo vệ highlight không bị bão hòa trắng.
  4. **Warm Parchment Paper Invariant**: Nền thẻ cờ BẮT BUỘC sử dụng màu giấy ngà cổ ấm `#F3EEDF` (thay vì `#F8F5EE`), tạo tương phản êm dịu, tôn vinh chữ đanh nét và tranh di sản bản địa.

---

### 62. [CLIENT/TELEMETRY] Bất Biến Watchdog Giám Sát Bất Biến Luật Chơi & Triệt Tiêu Báo Động Giả Tiền Tệ / Nhảy Ô (Telemetry Watchdog Real Gameplay & Anti-False-Positive Invariant - IMP-41)
- **Hiện tượng & Bẫy thực tế**:
  1. *Bẫy giả định mô hình kinh tế đóng phẳng (Closed Economy Fallacy)*: Hàm `computeExpectedDelta` chỉ biết 2 nghiệp vụ (mua đất và nhận 2000 Tr qua GO không trừ thuế), mặc định mọi giao dịch khác là 0 Tr. Khi người chơi thực hiện các nghiệp vụ hợp lệ của game như thế chấp tài sản (`MORTGAGE_PROPERTY` giải ngân vốn vay +1500 Tr), hạ cấp công trình (`DOWNGRADE_PROPERTY` hoàn tiền 50%), rút thẻ Cơ hội vay thấu chi (`CC_OVERDRAFT` +3000 Tr), bị trừ thuế đất đai tích lũy khi qua GO (`calculateGoPropertyTax`), watchdog lập tức báo động giả `TREASURY_INVARIANT_VIOLATED`.
  2. *Bẫy gán nhầm xúc xắc cũ cho bước dịch chuyển (Stale Dice Movement Fallacy)*: `detectMovement` duyệt mảng người chơi và tự động lấy xúc xắc `delta.dice` của lượt trước gán vào các sự kiện dịch chuyển đặc biệt (Bay giữa 2 sân bay, Lệnh thanh tra thuế vào tù ô 30 -> 10, Thẻ đại nhạc hội MC_MEGA_CONCERT kéo về ô 39), khiến watchdog so sánh sai và phát cảnh báo giả `INVALID_POSITION_STEP`.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Telemetry Teleport Recognition**: `checkIsTeleport` bắt buộc nhận diện các dịch chuyển hợp lệ: giữa các sân bay (5, 15, 22, 35), ô thanh tra thuế 30 vào tù 10, ô dịch vụ khi có thẻ bài, hoặc khi `delta.turnPhase` khác `WaitingRoll/ActionPhase`. Khi dịch chuyển, đặt `isTeleport: true` để `verifyMovementStep` không đối chiếu sai với xúc xắc.
  2. **Comprehensive Cash Flow Mapping**: `computeExpectedDelta` bắt buộc tính toán đầy đủ: giải ngân thế chấp (+50% giá đất), hoàn tiền hạ cấp (+50% chi phí nâng cấp), vay thấu chi (+3000 Tr), và trừ thuế tài sản tích lũy `calculateGoPropertyTax` khi qua ô GO.
  3. **Null Exemption for Unmodeled Events**: Khi phát hiện dòng tiền thay đổi tại các ô sự kiện ngoài luồng (`Chance`, `Market`, `Tax`, `TaxOrder`, `Hose`, `Audit`) hoặc trong trạng thái xử lý vỡ nợ `InsolvencyPhase`, hàm trả về `null` để `verifyAllInvariants` an toàn bỏ qua tick không định danh thay vì ép về 0 gây cảnh báo sai.
  4. **Zero Dirty Casts & Modularity**: Nghiêm cấm ép kiểu `as any` trong hook telemetry; bắt buộc sử dụng đúng kiểu domain `PropertyRegistry`, `PropertyStateMap`, `PropertyState` và giữ hàm domain logic dưới 50 SLOC.

---

### 63. [3D/ANIMATION/CAMERA] Bất Biến Nhịp Nhảy Con Cờ 1.5x, Triệt Tiêu Nhảy Cóc Do Timeout & Ổn Định Camera Khi Gieo Xúc Xắc (Pawn Hop 1.5x Speed, Zero-Teleport Timeout & Dice Roll Camera Stabilization Invariant - IMP-42)
- **Hiện tượng & Bẫy thực tế**:
  1. *Nhịp nhảy avatar chậm gây kéo dài thời gian chờ*: Thời lượng mỗi bước nhảy cũ (0.34s/ô gồm 0.22s bay và 0.12s tiếp đất) khiến avatar di chuyển 10-12 ô mất gần 4.5 giây, tạo cảm giác ì ạch, sốt ruột cho người chơi.
  2. *Nhảy cóc (teleport) một bước dài tới đích khi xúc xắc lớn*: Khi đổ xúc xắc đi xa (8-12 ô), con cờ chỉ nhảy 4-6 ô đầu rồi bất ngờ biến mất nhảy thẳng tới ô đích. Nguyên nhân do bộ đếm thời gian an toàn `timeoutMs = Math.max(2000, nextTask.waypoints.length * stepDuration + 500)` trong `processPawnQueue` quá ngắn (3.9s cho 10 ô). Khi WebGL máy khách chạy ở 25-30 FPS, thời gian thực tế để nhảy xong 10 ô mất ~4.5s. Hết 3.9s, timeout bảo hiểm cưỡng chế gọi `completePawnMove`, xóa `activePawnAnimation` và dịch chuyển tức thời cờ tới đích.
  3. *Camera giật lag cắm đầu vào hồ nước khi đổ xúc xắc*: Cơ chế cũ tự động chuyển sang `dice_roll` (FOV 36 độ, cắm sâu xuống khay xúc xắc) mỗi khi bấm gieo, gây giật máy quay liên tục và mất phương hướng tổng thể của bàn cờ.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Pawn Hop 1.5x Speed Invariant**: Chuẩn hóa thời lượng bước nhảy của người chơi lên nhanh gấp 1.5 lần: `HOP_DURATION = 0.15` giây, `LANDING_DURATION = 0.08` giây (tổng 0.23s/ô thay vì 0.34s cũ).
  2. **Generous Safety Timeout Invariant**: Trong `processPawnQueue`, nâng bộ đếm thời gian bảo hiểm thành `Math.max(10000, nextTask.waypoints.length * 1500 + 8000)`. Đảm bảo animation tự nhiên hoàn tất 100% từng ô qua `handleHopComplete` của `ActiveSpringPawn` mà không bao giờ bị timeout cắt ngang giữa chừng.
  3. **Overview Dice Roll Camera Invariant**: Khi `isRolling = true`, `resolveCameraMode` giữ nguyên chế độ `'overview'` ổn định cho cả người chơi lẫn bot, triệt tiêu 100% hiệu ứng zoom giật lag khi gieo xúc xắc.

---

### 64. [BOT/AUCTION/SCHEDULER] Bất Biến Đa Tính Cách Đấu Giá Bot AI, Kích Hoạt Scheduler Chuyển Pha & Triệt Tiêu Cảnh Báo Phí Bảo Lãnh Kiểm Toán (Bot Auction Personalities, Turn Timeout Scheduler & Audit Bailout Invariant - IMP-43)
- **Hiện tượng & Bẫy thực tế**:
  1. *Bot bị đơ không tham gia đấu giá khi chuyển pha do Timeout*: Khi người chơi hết giờ trong `ActionPhase`, máy chủ chuyển sang `AuctionPhase`, nhưng `turn_timeout_scheduler.ts` chỉ kiểm tra `next = players[currentPlayerIndex]` (vẫn là người chơi vừa bị timeout). Do người chơi không phải Bot và `declinedPlayerId` bị cấm đấu giá theo luật EC-11, scheduler chỉ đặt timeout 15s mà quên không đánh thức các Bot khác trong phòng qua `onScheduleBotTurn(roomCode)`. Hậu quả: Sàn đấu giá bị treo đơ 15s, cả người chơi lẫn Bot đều không thao tác được.
  2. *Cảnh báo giả TREASURY_INVARIANT_VIOLATED khi nộp bảo lãnh kiểm toán*: Khi người chơi (hoặc Bot) hết 3 lượt kiểm toán, FSM trừ 500 Tr phí bảo lãnh kiểm toán nộp vào Kho bạc. Tuy nhiên, `computeExpectedDelta` trong Telemetry Watchdog chỉ nhận diện các ô `EVENT_CELL_TYPES`. Nếu người chơi đang đứng ở ô tài sản (ví dụ ô 8 Hà Tĩnh), watchdog không nhận diện được khoản thu 500 Tr và phát cảnh báo vi phạm bảo toàn tiền tệ giả `-500 Tr`.
  3. *Hành vi Bot đấu giá rập khuôn hoặc cấm cứng Bot Passive*: Logic cũ cấm tuyệt đối Bot Passive tham gia đấu giá (`personality === BotPersonality.Passive -> return PASS`), trong khi Bot Aggressive không có chiến lược ép giá tương xứng và bước nhảy giá đơn điệu.
  4. *Giao diện đấu giá gây hoang mang cho người từ chối mua*: Khi người chơi từ chối mua và bị cấm tham gia đấu giá theo luật EC-11, giao diện hiển thị "Bạn đã rút lui..." và vô hiệu hóa nút bấm mà không giải thích nguyên nhân, khiến người chơi tưởng game bị lỗi đơ.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Auction Bot Wakeup Invariant**: Trong `TurnTimeoutScheduler`, bất kể khi nào phòng bước vào `AuctionPhase` (cả trong `scheduleTurnTimeout` lẫn sau timeout của `ActionPhase`), BẮT BUỘC kiểm tra sự hiện diện của Bot hợp lệ (`p.isBot && !p.bankrupt && p.id !== declinedPlayerId && !passedPlayers?.has(p.id)`). Nếu có, BẮT BUỘC gọi `onScheduleBotTurn(roomCode)` để Bot lập tức tham gia đặt giá mà không làm treo sàn 15s.
  2. **Audit Bailout Telemetry Invariant**: `computeExpectedDelta` BẮT BUỘC nhận diện sự kiện nộp phí bảo lãnh kiểm toán 500 Tr (`computeAuditBailDelta`) khi người chơi rời khỏi trạng thái kiểm toán (`preP.inAudit && !p.inAudit` hoặc `preP.auditTurnsLeft > 0 && p.auditTurnsLeft === 0`) và số dư giảm đúng 500 Tr, triệt tiêu 100% cảnh báo giả `TREASURY_INVARIANT_VIOLATED`.
  3. **3-Personality Tactical Auction Matrix**:
     - `Passive` (Săn Sale / Bargain Hunter): Chỉ đặt giá khi giá hời (`nextBid <= basePrice * 0.70`) hoặc ô đất hoàn thành bộ màu độc quyền (`monopolyScore >= 2.5`). Rút lui khi giá vượt 85% giá gốc (`> basePrice * 0.85`). Giữ trọn đệm an toàn cao (`safetyBuffer * 1.0` có tính trần vòng chơi).
     - `Balanced` (Nhà Đầu Tư Giá Trị): Đặt giá theo định giá thực tế `val.estimatedValue`, mở rộng trần giá khi có thế độc quyền 2/3, rút lui khi giá thầu vượt trần định giá. Giữ đệm an toàn vừa phải (`safetyBuffer * 0.60`).
     - `Aggressive` (Cá Mập Đấu Giá): Sẵn sàng bid cao vượt trần định giá thông thường (lên đến `1.5x estimatedValue`), giữ đệm an toàn mỏng (`safetyBuffer * 0.25`), và nhảy bước giá lớn (+100 Tr trở lên) khi ngân sách dồi dào (> 10.000 Tr) khi đấu trực tiếp với đối thủ.
  4. **Auction Modal Guidance Clarity**: Khi người chơi là `declinedPlayerId`, `AuctionModal` hiển thị thông điệp minh bạch: *"Bạn đã từ chối mua ô đất này (Luật game cấm tham gia đấu giá). Đang chờ các đối thủ khác đặt giá..."* với các nút tương tác bị khóa hợp lệ, loại bỏ hoàn toàn sự hoang mang của người dùng.

---

### 65. [NET/FSM] Bất Biến Định Danh Xúc Xắc diceRollerId & Chuỗi Đơn Điệu diceSeq Triệt Tiêu Lỗi Nuốt Log Trong Auto-Roll (Monotonic Dice Sequence & Auto-Roll Attribution Invariant - IMP-44)
> ℹ️ **[THAM CHIẾU]**: Xem giải pháp toàn diện về diceSeq và diceRollerId tại [Gotcha #142](#142-telemetrywatchdognet-bất-biến-đồng-bộ-dicerollerid-đối-soát-tiền-thắng-đấu-giá--ngưỡng-kẹt-hoạt-ảnh-động-theo-khối-lượng-bước-nhảy-telemetry-watchdog-precision--invariant-hardening---imp-109) (IMP-109).

- **Hiện tượng & Bẫy thực tế**:
  1. *Tráo đổi danh tính người đổ xúc xắc (Phantom Dice Attribution)*: Khi Người chơi (P1) kết thúc lượt (đã đổ 6+5), `room.lastDice` vẫn lưu giá trị `[6, 5]` trên server. Khi chuyển lượt sang Bot (`WaitingRoll`), máy chủ broadcast Delta có `currentTurnPlayerId = bot_2` và `dice = [6, 5]`. Activity Tracker trên client đọc `currentTurnPlayerId` và gán nhầm: `Bot AI 2 đã gieo xúc xắc được 6 + 5 = 11 điểm`.
  2. *Bẫy nuốt chửng log xúc xắc khi chơi tự động (Auto-Roll Log Swallowing)*: Khi người chơi hoặc bot chơi tự động (Bot turn hoặc người chơi AFK timeout), server thực thi trọn vẹn cả lượt (Gieo xúc xắc -> Di chuyển -> Mua/Sự kiện -> Kết thúc lượt) trước khi broadcast Delta. Delta phát ra lúc này đã chuyển sang lượt kế tiếp với `turnPhase = WaitingRoll`. Nếu client chặn thô bạo bằng `if (delta.turnPhase === 'WaitingRoll') return null;`, toàn bộ sự kiện gieo xúc xắc của lượt tự động sẽ bị nuốt chửng 100%, chỉ còn lại log di chuyển và mua đất.
  3. *Lệch pha trình tự nhân quả trong nhật ký ván đấu (Activity Log Out-of-Order)*: Gán xúc xắc theo `currentTurnPlayerId` khiến client phát sinh log "P1 đổ xúc xắc" trước khi phát sinh log "Bot AI di chuyển", gây ra ảo giác người chơi chưa bấm gì mà đã thấy mình đổ xúc xắc.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Immutable Dice Roller Attribution (`diceRollerId`)**: `Room` và `DeltaPayload` BẮT BUỘC lưu trữ và truyền tải tường minh `lastDiceRollerId?: string;` và `diceRollerId?: string;`. Khi tung xúc xắc (`executeTurnRoll`), server gán `room.lastDiceRollerId = current.id`. Client `detectDiceActivity` BẮT BUỘC ưu tiên sử dụng `delta.diceRollerId ?? delta.currentTurnPlayerId`, triệt tiêu 100% việc gán nhầm xúc xắc cho người chơi của lượt kế tiếp.
  2. **Monotonic Dice Sequence Invariant (`diceSeq`)**: Máy chủ duy trì bộ đếm đơn điệu tăng dần `room.diceSeq = (room.diceSeq ?? 0) + 1;` mỗi khi `executeTurnRoll` thực thi. Client lưu trữ `activityStore.lastDiceSeq`. Một sự kiện gieo xúc xắc chỉ được coi là mới khi `delta.diceSeq > lastDiceSeq`. Giải pháp này triệt tiêu 100% hiện tượng ghi trùng lặp trên nhiều delta, đồng thời cho phép ghi nhận đầy đủ sự kiện xúc xắc trong chế độ tự động kể cả khi delta phát ra ở pha `WaitingRoll`.
  3. **Preserve Snapshot Compatibility Invariant**: Tuyệt đối KHÔNG xóa `room.lastDice = undefined` trong `executeTurnEnd` vì sẽ phá vỡ Golden Engine Snapshot Test (`tests/oracle/fsm_golden_engine.test.ts`). Kết hợp `lastDiceRollerId` và `diceSeq` bảo đảm vừa giữ 100% tính tương thích hồi quy byte-for-byte, vừa triệt tiêu vĩnh viễn phantom log và log bị nuốt.
  4. **Micro-Stepped Bot Execution Option**: `RoomManager` cung cấp `stepBotTurn(roomCode)` độc lập, cho phép phân tách từng vi bước (Roll -> Move -> Buy/Skip -> EndTurn) trong các kịch bản cần quan sát tuần tự hoạt cảnh mượt mà.

---

### 66. [FSM/NET/BOT] Bất Biến Phân Định Rạch Ròi ExtraTurns vs ConsecutiveDoubles & Triệt Tiêu Đệ Quy Đấu Giá Bot (Extra Turns Invariant & Auction Scheduler Decoupling - IMP-45)
- **Hiện tượng & Bẫy thực tế**:
  1. *Cấp kép 2 cơ chế đi thêm từ thẻ Cơ Hội CC_PLATE_AUCTION*: Mã nguồn cũ vừa gán `player.extraTurns += 1` vừa gán `player.consecutiveDoubles += 1`. Người chơi sau khi dẫm ô Cơ hội 07 được mở khóa gieo xúc xắc ngay trong `PropertyManagement` (do cờ đôi giả), di chuyển đến Cái Mép và mua đất. Sau khi bấm kết thúc lượt, FSM kiểm tra `extraTurns > 0`, tiếp tục giữ lượt và đưa về `WaitingRoll`, khiến người chơi được gieo xúc xắc lần thứ 3 (đến Hải Phòng) thay vì chỉ được +1 lượt đi thêm theo luật SSOT.
  2. *Vòng lặp đệ quy tương hỗ vô hạn làm sập sàn đấu giá (Mutual Recursion Auction Freeze)*: Trong `wss_server.ts`, `TurnTimeoutScheduler` được khởi tạo với `onScheduleBotTurn: (rc) => this.scheduleBotTurn(rc)`. Nhưng hàm `this.scheduleBotTurn` lại đồng thời gọi `this.turnTimeoutScheduler.scheduleTurnTimeout(roomCode)`. Khi người chơi hết giờ tại `ActionPhase` và tài sản chuyển sang `AuctionPhase`, `scheduleTurnTimeout` kiểm tra thấy có Bot hợp lệ liền gọi `onScheduleBotTurn`, kích hoạt vòng gọi chéo đồng bộ vô hạn: `scheduleTurnTimeout` -> `scheduleBotTurn` -> `scheduleTurnTimeout` -> `scheduleBotTurn`... Node.js ném lỗi `RangeError: Maximum call stack size exceeded`, luồng điều phối bị sập, không có bộ đếm timeout nào được đăng ký và sàn đấu giá bị đóng băng vĩnh viễn tại Tick 11.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Strict ExtraTurns Separation Invariant**: Cờ `player.consecutiveDoubles` CHỈ được phép điều khiển bởi xúc xắc vật lý thật sự khi `die1 === die2` trong `processRollDoubles` (`src/server/audit_manager.ts`). Mọi thẻ bài hoặc hiệu ứng trao thêm lượt BẮT BUỘC chỉ được phép thao tác trên biến `player.extraTurns`. CẤM TUYỆT ĐỐI gán `consecutiveDoubles` trong các hàm xử lý thẻ sự kiện / thẻ cơ hội.
  2. **Decoupled Bot Scheduler Waker Invariant**: `TurnTimeoutSchedulerOptions.onScheduleBotTurn` BẮT BUỘC trỏ trực tiếp đến bộ lập lịch Bot: `onScheduleBotTurn: (rc) => this.botScheduler.scheduleBotTurn(rc)`. Tuyệt đối KHÔNG trỏ tới hàm trung gian gọi ngược lại `scheduleTurnTimeout`. Việc phân định rõ ràng giữa "kích hoạt lượt Bot" và "đặt lịch timeout cho Human" bảo đảm 0% đệ quy vô hạn và sàn đấu giá chuyển pha trơn tru 100%.

---

### 67. [UI/NET/AUCTION] Bất Biến Đồng Bộ Thẻ Sự Kiện, Triệt Tiêu Popup Trùng Lặp, Đồng Bộ Deadline 00:00 & Định Danh Tham Gia Đấu Giá (Event Card Metadata Sync, Landing Timestamp Guard, Timer 00:00 Synchrony & Local Player Auction Identity - IMP-46)
- **Hiện tượng & Bẫy thực tế**:
  1. *Thẻ Cơ hội / Vận khí hiển thị chung chung và bị popup lại sau lượt Bot*: Khi người chơi dẫm ô Cơ hội, popup hiển thị văn bản tĩnh "Cơ hội phát triển kinh doanh và mở rộng mạng lưới địa ốc" thay vì mô tả chính xác nội dung thẻ bài đã bốc và số tiền trừ (-400 Tr.). Sau khi bấm "Đã hiểu và tiếp tục", Bot chơi lượt của mình; khi lượt quay lại người chơi, popup Cơ hội lại bất ngờ bật lên lần thứ hai dù người chơi chưa hề gieo xúc xắc.
  2. *Lỗi rò rỉ tham chiếu `handleCellLanding`*: Effect kiểm tra `lastLandedPawn` phụ thuộc `handleCellLanding`, mà `handleCellLanding` lại phụ thuộc `currentTurnPlayerId`. Khi Bot hết lượt và quyền chơi chuyển về P1, `currentTurnPlayerId` thay đổi khiến effect chạy lại; do `lastLandedPawn` vẫn còn lưu tọa độ ô cũ của P1, modal bị kích hoạt mở lại ngoài ý muốn.
  3. *Đồng hồ đếm ngược treo tại 00:00 vài giây mới chuyển lượt Bot*: Khi hết 60s, client đếm về 00:00 nhưng không tự gửi ý định kết thúc lượt mà thụ động chờ máy chủ. Phía máy chủ lại broadcast Delta trước khi lên lịch `scheduleBotTurn`/`scheduleTurnTimeout`, khiến gói tin ban đầu thiếu thời hạn deadline chuẩn xác, tạo ra độ trễ đơ 2-4 giây tại 00:00.
  4. *Người chơi bị tước quyền đấu giá và giao diện 3D đấu giá gây rối mắt*: Khi Bot từ chối mua ô đất và mở đấu giá, `ModalHost` xác định `myId = currentTurnPlayerId`. Tại thời điểm này `currentTurnPlayerId` là Bot, dẫn tới `declinedPlayerId === myId` đánh giá thành `true`. Người chơi bị gán nhầm ví tiền của Bot và bị khóa quyền bid với thông báo "Bạn đã từ chối mua ô đất này...". Đồng thời, sân khấu `Auction3DStage` làm tối sầm bàn cờ 85% và treo lá bài 3D khổng lồ lơ lửng che khuất sa bàn.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Event Card Metadata Synchronization Invariant**: Máy chủ khi bốc thẻ (`drawChanceCard` / `drawMarketCard`) gán thông tin chi tiết vào `room.lastEventCard` và đồng bộ qua `DeltaPayload.lastEventCard` (chứa `title`, `description`, `effectDelta`). Client hiển thị chính xác lý do biến động tài chính (+/- số tiền cụ thể) thay vì placeholder chung chung.
  2. **Landing Timestamp Guard Invariant**: Client sử dụng `lastHandledLandingTimestampRef` để lưu `lastLandedPawn.timestamp`. Dù `currentTurnPlayerId` hay các hook dependency khác thay đổi danh tính, effect tuyệt đối KHÔNG kích hoạt mở lại modal nếu timestamp của con cờ chạm đất không đổi.
  3. **Turn Timeout Synchrony Invariant**:
     - Máy chủ trong `syncRoomStateAfterIntent` BẮT BUỘC gọi `scheduleBotTurn(roomCode)` (cập nhật deadline mới) TRƯỚC KHI gọi `broadcastRoomDelta(roomCode)`.
     - Client khi `turnTimeRemaining === 0` và đang trong lượt của `localPlayerId` chủ động gửi `INTENT_END_TURN` (nếu đã đổ xúc xắc) hoặc `INTENT_ROLL` (nếu chưa đổ), triệt tiêu hoàn toàn hiện tượng treo đơ vài giây tại 00:00.
  4. **Local Player Identity & Clean Centered 2D Auction Invariant**:
     - `ModalHost` xác định `myId` từ `props.localPlayerId` (hoặc `useLobbyStore.getState().myPlayerId`), tuyệt đối KHÔNG fallback về `currentTurnPlayerId`. Người chơi giữ đúng số dư ví tiền của mình và được tự do tham gia nâng giá (+50, +100, +200 Tr.) khi đối thủ từ chối mua.
     - Loại bỏ hoàn toàn sân khấu 3D treo lơ lửng và hiệu ứng tối mờ bàn cờ của `Auction3DStage`. Thay thế bằng hộp thoại 2D đặt ngay trung tâm màn hình, thông thoáng, rõ ràng, đạt chuẩn tương tác xúc giác Impeccable và 0 vi phạm UI anti-pattern.

---

### 68. [UI/UX] Bất Biến Phòng Ngừa Đóng Nhầm Hộp Thoại Quyết Định & Cơ Chế Khôi Phục Mua Đất Đa Tầng (Accidental Backdrop Dismissal Prevention & Multi-Layer Property Purchase Recovery Invariant - IMP-47)
- **Hiện tượng & Bẫy thực tế**:
  1. *Đóng nhầm hộp thoại mua đất do click ra ngoài màn hình (Accidental Backdrop Dismissal)*: Khi người chơi vừa di chuyển đến một ô đất trống, hộp thoại Title Deed mở lên với nút "Mua Ngay" và "Bỏ Qua". Tuy nhiên, `ModalBackdrop` bắt sự kiện click bên ngoài khung (`handleBackdropClick`) và tự ý gọi `onClose()`. Nếu người chơi click nhầm ra màn hình 3D hoặc vùng trống, hộp thoại mua đất biến mất hoàn toàn (`activeModal = null`).
  2. *Không có cơ chế khôi phục quyền mua (Irreversible Purchase State Loss)*: Khi hộp thoại bị đóng nhầm, trạng thái phòng trên máy chủ vẫn đang ở `ActionPhase` và người chơi chưa gửi lệnh `INTENT_BUY_PROPERTY` hay `INTENT_PASS_BUY`. Trước đây, các ô 3D trên `GameBoard` không có sự kiện `onClick`, và nút "Quản lý Bất động sản" trong `ActionDock` (`resolveManagePropertyTarget`) tự động chuyển mục tiêu về ô đất đã sở hữu đầu tiên (`ownedProperties[0]`). Người chơi hoàn toàn mất khả năng mở lại hộp thoại mua đất cho ô cờ mình đang đứng và bị ép phải bấm "Kết thúc lượt" hoặc chờ hết giờ, dẫn tới việc ô đất bị đẩy sang sàn đấu giá ngoài ý muốn.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Critical Decision Modal Dismissal Lock Invariant**: Bổ sung cờ `dismissible?: boolean = true` vào `ModalBackdropProps`. Khi hộp thoại là quyết định mang tính sống còn (`isCriticalDecision = (activeModal === 'deed' && modalPayload?.canBuy) || activeModal === 'auction' || activeModal === 'insolvency'`), giá trị `dismissible` BẮT BUỘC đặt thành `false`. Người chơi click ra ngoài backdrop sẽ KHÔNG bị mất modal, triệt tiêu 100% rủi ro đóng nhầm.
  2. **3D Tile Interactive Inspection Invariant**: Mọi ô cờ trên `GameBoard` (`LayeredDioramaTile`) BẮT BUỘC nhận diện sự kiện click (`onClick={() => handleTileClick(cell.index)}`). Khi click vào ô cờ đang đứng trong lượt chơi hợp lệ, modal Title Deed lập tức mở lại với cờ `canBuy: true`.
  3. **ActionDock Purchase Recovery CTA Invariant**: Trong `ActionDock`, nếu người chơi đang đứng trên ô đất có thể mua (`isStandingOnBuyable = isMyTurn && hasRolledThisTurn && isPropertyCell && !isOwnedByAnyone`), thanh điều khiển BẮT BUỘC hiển thị trực tiếp nút bấm nổi bật `🏷️ Mua Đất (#{currentPos})` và `resolveManagePropertyTarget` ưu tiên mở ô đất hiện tại với `canBuy: true`, bảo đảm trải nghiệm phục hồi 100% trong mọi tình huống.

---

### 69. [CLIENT/3D/CAMERA] Bất Biến Lọc Trùng Lặp Chuỗi Đơn Điệu diceSeq & Triệt Tiêu Cú Giật Camera Khi Mua Nhà (Monotonic Dice Sync & Camera Stabilization Invariant - IMP-48)
> ℹ️ **[THAM CHIẾU]**: Xem giải pháp toàn diện về diceSeq và chống kẹt hoạt cảnh tại [Gotcha #142](#142-telemetrywatchdognet-bất-biến-đồng-bộ-dicerollerid-đối-soát-tiền-thắng-đấu-giá--ngưỡng-kẹt-hoạt-ảnh-động-theo-khối-lượng-bước-nhảy-telemetry-watchdog-precision--invariant-hardening---imp-109) (IMP-109).

- **Hiện tượng & Bẫy thực tế**:
  1. *Lỗi kích hoạt lại xúc xắc dư thừa (Redundant Dice Re-trigger Glitch)*: Khi người chơi gieo xúc xắc, di chuyển tới ô đất và bấm "Mua Nhà", máy chủ gửi gói tin Delta để cập nhật quyền sở hữu (`cells`) và trừ tiền (`players`). Tuy nhiên, gói tin này vẫn giữ nguyên giá trị xúc xắc cũ `delta.dice = room.lastDice`.
  2. *Hàm syncDiceRoll thiếu bộ lọc chuỗi đơn điệu*: Client `apply_delta.ts` gọi `syncDiceRoll(delta.dice)` ở mọi gói Delta. Do thiếu kiểm tra `delta.diceSeq`, hàm gọi lại `state.triggerDiceRoll()`, khiến `isRolling` vô tình chuyển thành `true` lần thứ hai ngay tại thời điểm mua nhà.
  3. *Hậu quả giật chuyển cảnh kép (Double Camera Cut)*: Trong `CameraStateMachine`, cờ `isRolling = true` có độ ưu tiên cao hơn `hasRolledThisTurn` và `activeModal`, cưỡng chế camera chuyển đột ngột từ góc cận cảnh ô đất (`tile_focus`) sang góc bao quát bàn cờ (`overview`), khay xúc xắc 3D rơi và xoay lại; sau 1.5 giây khi `isRolling` tắt, camera lại zoom ngược trở lại ô đất vừa mua, gây chóng mặt và đứt gãy trải nghiệm của người chơi.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Monotonic Dice Sequence Invariant (`lastDiceSeq`)**: `GameState` BẮT BUỘC lưu trữ `lastDiceSeq?: number`. Hàm `syncDiceRoll` BẮT BUỘC kiểm tra `isDiceRollDuplicate`: nếu `delta.diceSeq !== undefined && state.lastDiceSeq !== undefined && delta.diceSeq <= state.lastDiceSeq`, BẮT BUỘC bỏ qua, TUYỆT ĐỐI KHÔNG gọi `triggerDiceRoll`.
  2. **Camera Focus Stability When Trading**: Trong suốt quá trình mua nhà, nâng cấp công trình, thế chấp hoặc giao dịch P2P, cờ `isRolling` BẮT BUỘC duy trì `false`. `CameraStateMachine` bảo toàn góc nhìn `tile_focus` ổn định tại ô đất, triệt tiêu 100% hiện tượng nhảy máy quay ra bàn cờ.
  3. **Safe Fallback Guard**: Nếu `delta.diceSeq` vắng mặt, hàm kiểm tra nếu `state.hasRolledThisTurn && state.dice[0] === delta.dice[0] && state.dice[1] === delta.dice[1]` thì bỏ qua an toàn, không kích hoạt lại hoạt cảnh xúc xắc.

---

### 70. [FSM/NET/AUCTION] Bất Biến Triệt Tiêu Vòng Lặp Đấu Giá Bot, Đồng Bộ Hết Giờ 15s Sàn Đấu Giá & Khử Trùng Lặp Nhật Ký Hoạt Động (Auction Loop Prevention, Server Timeout Synchrony & Activity Feed Dedup - IMP-49)
- **Hiện tượng & Bẫy thực tế**:
  1. *Vòng lặp vô hạn 800ms bot turn scheduler trong AuctionPhase*: Khi Bot dẫm ô đất trống và từ chối mua, phòng chơi chuyển sang `TurnPhase.AuctionPhase` nhưng `currentPlayerIndex` vẫn trỏ vào Bot đó. `BotTurnScheduler` kiểm tra `next.isBot === true` và tiếp tục lập lịch 800ms cho Bot đó mà không nhận biết phòng đang ở `AuctionPhase`. Khi Bot kế tiếp (Bot 2) đặt giá 750 Tr., điều kiện kiểm tra bot hợp lệ không loại trừ `highestBidder`, dẫn tới việc Bot 2 liên tục được xem là cần lượt, tạo vòng lặp ping-pong vô tận mỗi 800ms và không bao giờ kích hoạt `TurnTimeoutScheduler`.
  2. *Sàn đấu giá treo vô hạn đến khi Watchdog báo TURN_STALLED*: Do `TurnTimeoutScheduler.scheduleTurnTimeout` bị bỏ qua khi Bot vào `AuctionPhase`, không có đồng hồ 15s nào chạy trên máy chủ. Sàn đấu giá tồn tại hơn 46 giây đến khi bộ giám sát Telemetry báo động `TURN_STALLED`. Khi timeout kết thúc, nếu người chơi hiện tại là Bot, máy chủ không gọi `handleEndTurn`, khiến lượt bị kẹt vĩnh viễn tại Bot đó.
  3. *Spam nhật ký hoạt động trên giao diện (Activity Feed)*: `detectAuctionActivities` kiểm tra khử lặp dựa trên `prevState.activeModal === 'auction'`. Khi hộp thoại client tự đóng sớm (`timeRemaining <= 1`), `activeModal` trở thành `null`. Mọi gói tin delta định kỳ sau đó đều bị nhận định là lượt đặt giá mới, khiến dòng chữ "Bot AI 2 đã đặt giá 750 Tr." bị bắn lặp liên tục mỗi giây vào thanh thông báo.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Auction Highest Bidder Exclusion Invariant**: Trong `AuctionPhase`, Bot đang là `highestBidder` BẮT BUỘC bị loại khỏi danh sách bot hợp lệ cần lượt (`p.id !== highestBidder`). Khi không còn bot nào khác có khả năng hoặc ý định đặt giá cao hơn, `BotTurnScheduler` BẮT BUỘC nhường quyền điều phối cho `TurnTimeoutScheduler` để kích hoạt đếm ngược 15s đóng sàn.
  2. **Post-Auction Bot Turn Handover Invariant**: Khi hết 15s hoặc tất cả người chơi bỏ cuộc (`handleAuctionClose`), nếu lượt hiện tại thuộc về Bot và phòng ở pha `PropertyManagement`, máy chủ BẮT BUỘC tự động gọi `handleEndTurn` để trao quyền đi tiếp cho người chơi kế tiếp, triệt tiêu 100% kẹt lượt.
  3. **Modal-Independent Activity Feed Dedup Invariant**: `ActivityStore` lưu trữ trạng thái đấu giá gần nhất (`lastAuctionBid: { cellIndex, currentBid, highestBidderId }`), độc lập hoàn toàn với `activeModal` của giao diện. Mọi delta trùng lặp giá trị bid đều bị chặn O(1), và chỉ được giải phóng khi sàn đấu giá kết thúc (`delta.auction === null`).
  4. **Server-Authoritative Modal Teardown Invariant**: Client `ModalHost` chỉ giảm bộ đếm thị giác `timeRemaining` về 00:00 và TUYỆT ĐỐI KHÔNG đơn phương đóng hộp thoại khi máy chủ vẫn đang ở `AuctionPhase`. Quyền đóng hộp thoại đấu giá thuộc về `syncAuctionModal` khi nhận `delta.auction === null`.

---

### 71. [NET/SERVER/UI] Bất Biến 4 Trụ Cột: Hợp Nhất Bộ Điều Phối TurnOrchestrator, Kiểm Thử Mô Phỏng Sống WssLivingMatchChaos, Giao Diện Thuần Hình Chiếu & Chó Canh Phòng Giải Cứu TurnWatchdog (Four Pillars Architecture Defense Invariant - IMP-50)
- **Hiện tượng & Bẫy thực tế**:
  1. *Lỗi xung đột và đệ quy chéo giữa 2 bộ scheduler độc lập*: `BotTurnScheduler` và `TurnTimeoutScheduler` tồn tại song song, quản lý 2 timer riêng biệt cho mỗi phòng (`botTimers` và `timeouts`). Khi chuyển giao trạng thái (nhất là trong `AuctionPhase` hoặc người chơi AFK), hai scheduler gọi chéo nhau dẫn đến nguy cơ xung đột timer, rò rỉ timer không được clear khi phòng đổi pha hoặc đóng phòng, hoặc gây đệ quy vô hạn.
  2. *Bẫy giả định lượt bot trong AuctionPhase*: Khi người chơi dẫm ô từ chối mua là Human (`p1_human`), `room.currentPlayerIndex` vẫn trỏ về Human. Hàm `runBotTurn` của `RoomManager` chỉ chạy khi `current.isBot === true`. Do đó, trong `AuctionPhase`, nếu scheduler gọi `runBotTurn` thì bot sẽ không hành động. BẮT BUỘC gọi `rooms.resolveAuctionBots(roomCode)` để các Bot AI tham gia đặt giá bình đẳng.
  3. *UI đơn phương đóng modal gây mất đồng bộ với server state*: Khi `AuctionModal` hoặc các modal nghiệp vụ tự cài đặt `useEffect` / `setInterval` để gọi `onClose()` khi `timeRemaining <= 0`, UI biến mất trước khi Server kết thúc pha đấu giá. Nếu sau đó Server mới gửi delta hoặc có bot khác bid, UI bị rơi vào trạng thái lệch pha nghiêm trọng, nút bấm và sự kiện không ăn khớp.
  4. *Kẹt lượt vĩnh viễn khi client mất kết nối hoặc phát sinh ngoại lệ không mong muốn*: Nếu vì lý do nào đó cả Human lẫn Bot không gửi intent (ví dụ: client disconnect đột ngột, ngoại lệ unhandled trong intent handler), bàn chơi bị đóng băng vô thời hạn nếu không có cơ chế watchdog cấp máy chủ cưỡng chế chuyển lượt.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Unified Turn Orchestrator Invariant**: Hợp nhất toàn bộ việc lập lịch lượt chơi vào một thực thể duy nhất: `TurnOrchestrator`. Mỗi phòng chỉ có duy nhất 1 active timer tại một thời điểm (`activeTimers.get(roomCode)`). Mọi thay đổi pha hoặc intent kết thúc đều hủy timer cũ trước khi kích hoạt timer mới. Duy trì các adapter tương thích ngược cho `BotTurnScheduler` và `TurnTimeoutScheduler` để bảo toàn 100% các unit test cũ.
  2. **Headless WSS Living Chaos Suite Invariant**: Toàn bộ hệ thống máy chủ mạng phải vượt qua bài kiểm thử mô phỏng sống động `wss_living_match_chaos.test.ts` (1 Human Persona + 3 Bot AI) chạy với Virtual Clock (`vi.useFakeTimers()`), đảm bảo 2 Invariant:
     - *Loop Detection Invariant*: Không bao giờ phát sinh quá 5 intent lặp lại liên tiếp mà không có chuyển biến trạng thái.
     - *Stall Detection Invariant*: Không bao giờ có bất kỳ pha chơi nào bị kẹt quá 60s thời gian ảo.
  3. **UI as Pure Projection of Server State Invariant**: UI client là hàm thuần túy của Server State. Tuyệt đối cấm các component modal tự ý gọi `onClose()` hay tự tắt modal bằng timer cục bộ. Mọi modal nghiệp vụ (Auction, Deed, Insolvency, Hose) chỉ đóng khi và chỉ khi Server phát `delta.auction === null` hoặc `delta.turnPhase` chuyển sang pha khác thông qua `syncBusinessModals` trong `apply_delta.ts`.
  4. **Fail-Safe Turn Watchdog Auto-Recovery Invariant**: `TurnWatchdog` theo dõi mọi phòng đang chơi với chu kỳ quét đều đặn (mỗi 5s). Nếu bất kỳ lượt chơi nào không có tiến triển trong hơn 45 giây (`elapsedMs > 45000`), watchdog tự động kích hoạt Cưỡng Chế Chuyển Lượt Khẩn Cấp (Emergency Turn Handover / Recovery), giải phóng sàn đấu giá hoặc kết thúc lượt chơi kẹt để bàn chơi luôn luôn vận hành thông suốt.

---

### 72. [BOT/3D/NET] Bất Biến Phân Nhịp Vi Bước Bot AI stepBotTurn, Định Vị Tâm Sàn Diễn Xúc Xắc Z=0.0 & Xúc Xắc Đỏ Ruby Phản Quang (Bot AI Step Pacing, Centered Dice Runway & Vibrant Dice Invariant - IMP-51)
- **Hiện tượng & Bẫy thực tế**:
  1. *Bot AI xả lệnh dồn dập quá nhanh gây gián đoạn nhịp chơi (Bot Burst Overrun)*: Khi người chơi hết lượt trong phòng 1 người + 2 Bot, `runBotTurn` cũ thực thi trọn vẹn toàn bộ các hành động của Bot (Gieo xúc xắc -> Di chuyển -> Mua/Từ chối đất -> Kết thúc lượt) trong 1 micro-tick duy nhất và lập tức kích hoạt Bot tiếp theo. Kết quả: 2 Bot chơi liên tiếp xong xuôi trong vòng chưa đầy 1.6 giây, các con cờ lướt vèo vèo trên bàn cờ, người chơi hoàn toàn không kịp theo dõi hay quan sát đối thủ vừa làm gì, tạo cảm giác đứt gãy và ức chế.
  2. *Cảnh báo đỏ TREASURY_INVARIANT_VIOLATED do gộp lệnh Bot*: Việc thực thi tức thì các lệnh di chuyển qua GO và mua đất trong cùng một tick khiến `currentTurnPlayerId` bị đổi sang người chơi kế tiếp ngay khi tiền lương 2.000 Tr. vừa cộng, làm hệ thống giám sát dòng tiền telemetry đối soát sai danh tính người nhận tiền và phát sinh hàng loạt cảnh báo vi phạm bảo toàn tiền tệ.
  3. *Xúc xắc đè lên thành cầu Long Biên và màu sắc nhợt nhạt*: Khay xúc xắc 3D đặt tại Z = +3.8 đè trực tiếp lên thành Cầu Long Biên. Dưới ánh nắng gắt nhiệt đới, xúc xắc màu đỏ tươi cũ bị lóa nhợt nhạt, các chấm pips kích thước nhỏ chìm vào khối hộp khó nhìn từ góc nhìn bao quát toàn bàn cờ. Khay nỉ màu xanh lục đậm `#064E3B` viền vàng `#F59E0B` kẹt cố định tại lòng đường chiếm tầm nhìn ngay cả khi không có ai gieo xúc xắc.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Micro-Stepped Bot Pacing Invariant**: `TurnOrchestrator` và `RoomManager` BẮT BUỘC sử dụng `stepBotTurn` để phân tách từng vi bước độc lập có độ trễ `botTurnDelayMs` (chuẩn 1.500ms trong production):
     - *Nhịp 1*: Bot ở `WaitingRoll` chỉ gửi `INTENT_ROLL`, xúc xắc lăn, cờ nhảy đến ô đất, FSM dừng ở `ActionPhase` hoặc `PropertyManagement` và lượt chơi VẪN THUỘC VỀ BOT.
     - *Nhịp 2*: Bot ở `ActionPhase` phân tích và gửi ý định mua (`INTENT_BUY_PROPERTY`) hoặc từ chối (`INTENT_DECLINE`), FSM chuyển sang `PropertyManagement` và VẪN GIỮ LƯỢT.
     - *Nhịp 3*: Bot ở `PropertyManagement` gửi `INTENT_END_TURN` để chuyển lượt sang người chơi tiếp theo.
     Nhờ phân nhịp vi bước, người chơi có đủ 1.5 giây để quan sát từng hành động của Bot, đồng thời triệt tiêu 100% cảnh báo giả `TREASURY_INVARIANT_VIOLATED`.
  2. **Centered River Dice Runway Invariant**: Khay xúc xắc `DiceTray` được di dời về chính giữa lòng sông Sài Gòn tại tọa độ `position={[0.0, 0.020, 0.0]}`, cách xa hai cây cầu Long Biên và Ba Son ít nhất 3.8m, tạo không gian sàn diễn trung tâm thoáng đãng, cân đối và uy nghi. `CAMERA_CONFIG.dice_roll` đồng bộ `target = [0.0, 0.25, 0.0]` và `position = [2.5, 2.8, 3.4]`.
  3. **Vibrant Ruby Red & Emissive Pips Invariant**: Xúc xắc được nâng cấp kích thước lên 0.58m, khoác sắc đỏ Ruby sang trọng `#DC2626` với `roughness = 0.22`, `metalness = 0.10`, và chỉ kích hoạt `transparent={fadeOpacity < 1.0}` khi đang trong hoạt cảnh mờ dần (giữ độ đanh đặc 100% khi dừng tĩnh). Các chấm pips tròn sứ trắng `#FFFFFF` được phóng to (bán kính 0.050m, mặt Ách 0.065m) tích hợp phát quang nhẹ `emissive="#FFFFFF"` (`emissiveIntensity=0.25`), giúp mặt xúc xắc luôn tương phản sắc nét và nổi bật dưới ánh sáng chói chang.
  4. **Transient Zero-Footprint Felt Tray Invariant**: Khối đế khay nỉ xanh viền đồng thau chỉ xuất hiện trong quá trình gieo xúc xắc (`isRolling = true`). Khi xúc xắc dừng chuyển động, khay nỉ tự động ẩn hoàn toàn khỏi không gian 3D, trả lại mặt nước sông phẳng lặng và thông thoáng.
  5. **Fast Unit Test Scheduler Compatibility Invariant**: Bộ điều phối `TurnOrchestrator` cho phép cấu hình `botTurnDelayMs` linh hoạt: mặc định 1.500ms trong môi trường production thực tế, nhưng adapter tương thích ngược `BotTurnScheduler` và cấu hình test của `WssServer` sử dụng độ trễ vi mô (100ms - 250ms) giúp toàn bộ 153 test files (hơn 2.100 unit/integration tests) hoàn thành thần tốc trong chưa đầy 18 giây.

---

### 73. [UAT/TEST] Bất Biến Khống Chế Luồng Vitest maxThreads, Mute Log IPC Simulator & Kiểm Toán Rò Rỉ Tham Chiếu Tất Định (Test Resource Ceiling, Stdout Log Muting & Deterministic Memory Leak Audit - IMP-52)
- **Hiện tượng & Bẫy thực tế**:
  1. *Vitest vắt kiệt 100% CPU do thread allocation không giới hạn*: Mặc định Vitest sử dụng số luồng bằng tổng số core logic (`os.cpus().length` = 8–16 threads). Mỗi thread khởi động một Node environment, nạp Three.js, React 19 và JSDOM, đẩy CPU máy người dùng lên 100% gây đơ giật giao diện và quá nhiệt.
  2. *Nghẽn IPC & tràn Terminal do 27.800 dòng JSON domain logs*: Tệp `tests/simulation/chaos_monkey_simulator.test.ts` phát sinh hơn 27.800 dòng log `console.info` khi mô phỏng 1.000 ván cờ. Cơ chế IPC của Vitest bị quá tải dẫn đến test suite bị chậm và tràn màn hình console.
  3. *Flaky test do Garbage Collection không tất định của V8 Heap*: Trong `tests/stress/ops01_concurrent_rooms.test.ts`, kiểm tra rò rỉ bộ nhớ bằng `expect(heapAfter - heapBefore).toBeGreaterThan(0)` bị fail ngẫu nhiên khi V8 engine kích hoạt GC ngầm thu hồi heap đúng thời điểm đo.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Thread Pool Ceiling Invariant**: `vitest.config.ts` BẮT BUỘC cấu hình trần luồng an toàn: `maxThreads = Math.min(4, Math.max(1, Math.floor(os.cpus().length / 2)))`, `minThreads = 1`, `pool = 'threads'`. Không bao giờ cho phép Vitest sử dụng quá 4 threads hoặc quá 50% CPU logic của máy người dùng.
  2. **Simulator Stdout Silence Invariant**: `runChaosSimulation` BẮT BUỘC tắt tiếng tạm thời (`console.info` và `console.warn`) trong suốt vòng lặp mô phỏng lượt cờ khi `silent === true`. Sau khi xong toàn bộ các ván, mới phục hồi `console.info` để xuất bảng tóm tắt ASCII tiêu chuẩn (`asciiSummary`), đảm bảo 0 dòng log rác lọt ra terminal.
  3. **Tiered Simulation Execution Invariant**: Simulator mặc định chạy 100 ván (~11.400 turns) đủ để kiểm chứng 3 Bất Biến Vĩ Mô (Liveness 0% Deadlock, Cash Conservation Δ = 0, Finite Balances) chỉ trong < 0.4s khi chạy `npm test`. Kịch bản 1.000 ván chuyên sâu được phân tầng sang script riêng `npm run test:chaos` (thông qua `cross-env CHAOS_GAMES=1000`) phục vụ kiểm định phát hành (Release Audit).
  4. **Deterministic Reference Retention Invariant**: Kiểm thử rò rỉ bộ nhớ không phụ thuộc vào `process.memoryUsage().heapUsed` của V8. Thay vào đó, kiểm chứng tính tất định 100% thông qua việc xác minh số phòng tồn đọng `activeRooms === 10`, cờ `isLeakRetained === true`, và mảng tham chiếu `getRetainedLeakedManagers().length > 0`.

---

### 74. [3D/NET/CRAFT] Bất Biến Điêu Khắc Cầu Dây Văng Ba Son, Mố Cầu Bevel & Triệt Tiêu Hoạt Cảnh Xúc Xắc Nhảy Nhịp Đôi (Sculpted Ba Son Cable-Stayed Bridge, Beveled Abutments & Monotonic Dice Settle Animation Invariant - IMP-53)
- **Hiện tượng & Bẫy thực tế**:
  1. *Dây văng Cầu Ba Son lơ lửng và lệch góc không gian 3D*: Tại vị trí Z = -3.8, các dây văng cũ tính toán bằng hàm lượng giác góc phẳng 2D `Math.atan2(...) - Math.PI / 2`, khiến đầu cáp lơ lửng không chạm đỉnh tháp và đâm xiên qua mặt đường nhựa xuống lòng sông. Tháp cầu chỉ là khối hộp sơ khai trần trụi thiếu bệ trụ dưới lòng kênh, và hai đầu cầu tại X = +-2.7 bị cắt ngang đột ngột thiếu mố cầu bê tông (abutments).
  2. *Xúc xắc nhảy nhịp đôi khi quân cờ vừa chạm đất (Double Bounce Glitch)*: Khi xúc xắc vừa settle xong và quân cờ nhảy tới ô đích, xúc xắc bất ngờ kích hoạt lại hoạt cảnh nảy tung lên trời lần 2. Nguyên nhân do:
     - `SingleDie` dùng thuộc tính `reset: isRolling` vô điều kiện: Mỗi khi re-render (do cập nhật vị trí cờ hoặc mở modal ô đất), spring bị reset về `t: 0`.
     - Server trước đó đặt `botTurnDelayMs: 250ms`, lượt bot kế tiếp ập tới quá nhanh khi cờ người trước chưa chạm đất, kích hoạt `triggerDiceRoll` mới.
     - `triggerDiceRoll` thiếu chốt chặn đơn điệu `diceSeq <= lastDiceSeq`.
  3. *Unmount xúc xắc gây gián đoạn render tree*: Xúc xắc bị ẩn khi `isRolling = false` trong môi trường SSR/static markup khiến các bài kiểm tra hợp đồng hoặc re-render bị giật khung hình.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Euclidean Cable Transform Invariant**: Mọi dây văng Ba Son BẮT BUỘC tính toán qua `calculateCableTransform(pylonAnchor, deckAnchor)`:
     - Chiều dài Euclid `L = Math.hypot(dx, dy, dz)` và vị trí đặt tại trung điểm `(pylon + deck) / 2`.
     - Vector đơn vị `v = (pylon - deck).normalize()`, góc quay quaternion chuẩn `new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), v)`. Sai số đầu mút cáp kết nối vào đỉnh tháp và mặt cầu tuyệt đối `< 0.01m`.
  2. **Sculpted Landmark & Beveled Abutments Invariant**: Tháp Ba Son gồm bệ trụ bê tông dưới lòng sông tại `[-0.8, 0.0, 0]`, thân tháp nghiêng titan `#F8FAFC`, cổ vòng neo cáp mạ vàng `#F59E0B` tại `[-0.8, 0.95, 0]` và 2 khối mố cầu bê tông vát beveled tại bờ Tây `[-2.7, 0.04, 0]` (`data-bason-abutment="west"`) và bờ Đông `[2.7, 0.04, 0]` (`data-bason-abutment="east"`).
  3. **Monotonic Roll Sequencing Guard**: `triggerDiceRoll` BẮT BUỘC kiểm tra: nếu `diceSeq !== undefined && state.lastDiceSeq !== undefined && diceSeq <= state.lastDiceSeq`, lập tức return để bỏ qua mọi kích hoạt trùng lặp hoặc đi lùi.
  4. **State-Locked SingleDie Spring Invariant**: `SingleDie` duy trì `lastAnimatedSeqRef`. Chỉ cho phép `shouldReset = true` khi có `diceSeq` mới thực sự (`diceSeq !== lastAnimatedSeqRef.current`) hoặc chuyển đổi từ nghỉ sang lăn lần đầu. Khi tĩnh, khóa cứng tại `t = 1.0` với cao độ nghỉ bất biến `DICE_REST_Y = 0.26` và hệ số xoay bằng 0.
  5. **Persistent Ruby Dice Presence Invariant**: 2 khối xúc xắc ruby `#DC2626` / `#B91C1C` luôn hiện diện trong render tree (không bị unmount khi dừng tĩnh), nằm nghỉ trang nghiêm trên thềm nỉ sông Sài Gòn.
  6. **Server Bot Turn Pacing Invariant**: `WssServer` và `server/index.ts` chuẩn hóa độ trễ `DEFAULT_BOT_TURN_DELAY_MS = 1500ms`, bảo đảm Bot di chuyển thong thả, đồng bộ hoàn hảo với chu kỳ diễn hoạt 1.5s–2.5s của quân cờ.

---

### 75. [TELEMETRY/NET/AUCTION] Bất Biến Watchdog Định Danh Sân Bay AIRPORT_CELLS, Tự Giải Cứu FSM Animation Stall & Khử Báo Động Giả Thuế Đấu Giá (Airport Recognition, FSM Stall Auto-Recovery & Auction Tax Suppression Invariant - IMP-54)
- **Hiện tượng & Bẫy thực tế**:
  1. *Nhầm ô sân bay với ô Cơ hội*: Hằng số `AIRPORT_CELLS` cũ chứa ô 22 (Phiếu Cơ Hội) thay vì ô 25 (Tuyến Cao Tốc Bắc - Nam). Đồng thời hàm `checkIsTeleport` tự động coi mọi di chuyển trong pha `PropertyManagement` là teleport khiến bước nhảy qua GO (ví dụ 36 -> 5) bị watchdog đối chiếu sai và phát cảnh báo giả `INVALID_POSITION_STEP`.
  2. *Treo FSM do kẹt hoạt cảnh quân cờ 3D*: Khi con cờ bị kẹt hoạt cảnh kéo dài quá `MAX_ANIMATION_DURATION_MS (10_000ms)`, hệ thống chỉ ghi nhận cảnh báo mà không tự giải cứu, khiến cờ `activePawnAnimation` và hàng đợi `pawnAnimationQueue` bị khóa cứng.
  3. *Báo động giả bảo toàn tiền tệ & spam log thuế khi thắng đấu giá*: `computeCellDelta` trừ tiền theo giá niêm yết của sổ đỏ (`deed.price`) thay vì giá thầu thực tế (`highestBid` / `currentBid`), làm chênh lệch kỳ vọng dòng tiền sinh ra vi phạm `TREASURY_INVARIANT_VIOLATED`. Song song đó, `processPayerFee` coi khoản trừ tiền đấu giá là thuế/phí và bắn thêm log `tax` thừa thãi.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Airport Cells & Teleport Recognition Invariant**:
     - `AIRPORT_CELLS` chuẩn hóa gồm đúng 4 ô hạ tầng: `Set([5, 15, 25, 35])`. Tuyệt đối không chứa ô 22.
     - `checkIsTeleport` duy trì tương thích cho các bước dịch chuyển hợp lệ; trong pha `PropertyManagement`, di chuyển thông thường của turn player không bị coi là teleport.
  2. **Auto-Recovery FSM Stall Invariant**:
     - `watchdogMonitor.recoverFsmAnimationStall` và `checkFsmAnimationStall` tự động kích hoạt `useGameStore.getState().clearActivePawnAnimation()` khi `animatingDurationMs > 10_000ms`, đưa `activePawnAnimation` về null và xóa sạch `pawnAnimationQueue`.
     - `PerfTelemetryTracker` trong `game_canvas.tsx` gọi `recoverFsmAnimationStall` và reset `animStartRef.current = null`.
  3. **Auction Financial Integrity Invariant**:
     - `computeCellDelta` trích xuất `highestBid` từ `preState.auction` hoặc `modalPayload`, tính toán chính xác biến động dòng tiền thắng đấu giá, triệt tiêu 100% cảnh báo giả `TREASURY_INVARIANT_VIOLATED`.
     - `detectCellTrade` định dạng thông điệp `đã thắng đấu giá` với `amount: -winningBid`.
     - `processPayerFee` kiểm tra `context.boughtCellIndices` và `delta.cells` để bỏ qua 100% các khoản trừ tiền mua đất (cả mua thẳng lẫn đấu giá), không sinh log `tax`.
   4. **Zero Dirty Casts AST Rule**: Tuyệt đối không dùng `as any` hay `as unknown as`; khai báo thuộc tính `auction` trên `GameState` và kiểm tra kiểu an toàn.

---

### 76. [SERVER/NET/AUCTION] Bất Biến Thống Nhất Bước Giá Đấu Giá (+50 Tr.) & Tự Động Re-Sync Delta Khi Intent Bị Từ Chối (Auction Min-Bid Step Harmonization & Re-Sync Invariant - IMP-49)
> ⚠️ **[SUPERSEDED BY GOTCHA #139]**: Giao diện và Auto-Bid hiện tại đã nâng cấp lên 3 nút bước giá `+100, +200, +500 Tr.` theo [Gotcha #139](#139-auctionuifsm-bất-biến-bước-giá-đấu-giá-100---200---500-tr-đồng-bộ-auto-bid--tương-thích-server-minimum-increment-auction-bid-increments-upgrade-invariant---imp-108) (IMP-108). Mức +50 Tr. trong mục này chỉ còn là sàn nâng giá tối thiểu nội bộ của máy chủ.

- **Hiện tượng & Bẫy thực tế**:
  1. *Lệch bước giá Server (+100 Tr.) và Client (+50 Tr.)*: `src/server/auction_manager.ts` cũ quy định cứng: khi đã có người đặt giá (`highestBidder !== undefined`), mức giá tiếp theo bắt buộc phải tăng `>= highestBid + 100`. Trong khi đó, Client (`modal_helpers.ts`) sinh ra 3 nút bấm `+50 Tr.`, `+100 Tr.`, `+200 Tr.` và nút `AUTO-BID` tự động chọn `+50 Tr.`. Khi đối thủ đặt 2.050 Tr., người chơi bấm `+50 Tr.` gửi lên 2.100 Tr. (< 2.150 Tr.) liền bị Server từ chối `BID_TOO_LOW`.
  2. *Optimistic Update kẹt hiển thị ảo (Ghost State)*: Khi người chơi nhấn nút đặt giá, Client lập tức cập nhật cục bộ (`updateModalPayload`) hiển thị "DẪN ĐẦU: Bạn" (2.100 Tr.). Khi Server từ chối `BID_TOO_LOW`, Server chỉ gửi message lỗi mà không broadcast lại delta; Client chỉ hiện toast mà không hoàn tác modal payload, làm người chơi tưởng mình đang dẫn đầu. Sau 15s đếm ngược, Server đóng phiên và trao đất cho người đặt giá hợp lệ trước đó (Bot AI 3 - 2.050 Tr.).
  3. *Bot tính toán bước giá không đồng bộ*: `room_bot_coordinator.ts` và `bot_engine.ts` tính toán bước giá cũ hoặc thiếu fallback `auction.bidIncrement ?? 50`.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Auction Minimum Bid Step Invariant**:
     - `src/server/auction_manager.ts`: Bước giá tối thiểu khi đã có người đặt giá BẮT BUỘC là `+50 Tr.` (`minBid = session.highestBidder !== undefined ? session.highestBid + 50 : session.highestBid`).
     - Nghiêm cấm nâng giá dưới bước giá tối thiểu (`amount < minBid` trả về `{ success: false, reason: 'BID_TOO_LOW' }`).
     - Khi chưa có ai đặt giá (`highestBidder === undefined`), mức giá tối thiểu bằng đúng giá khởi điểm `startingBid`.
  2. **Bot AI Incremental Harmonization Invariant**:
     - `room_bot_coordinator.ts` chuẩn hóa bước giá cơ sở `inc = 50`.
     - `bot_engine.ts` hỗ trợ `minStep = auction.bidIncrement ?? 50`.
  3. **Server-Authoritative Intent Rejection Delta Re-Sync Invariant**:
     - `src/server/network/wss_server.ts`: Trong hàm `handleIntentMessage`, nếu `executeIntentAction` trả về `!res.success`, Server BẮT BUỘC gửi thông báo lỗi `ERROR` cho socket người chơi VÀ ngay lập tức kích hoạt `this.broadcaster.broadcastRoomDelta(msg.roomCode)`.
     - Gói tin Delta mới nhất từ Server ép Client xóa sạch mọi Optimistic Update sai lệch, đồng bộ hóa tuyệt đối trạng thái sàn đấu giá và tài chính trên toàn bộ thiết bị tham gia.

---

### 77. [3D/BOT/NET] Bất Biến Đồng Bộ Nhịp Độ Bot (calculateBotStepDelay), Khóa Góc Quay Máy Ảnh ('overview') & Đồng Bộ Chu Kỳ Dừng Chân Trả Phí Xúc Xắc (Bot Pacing, Camera Lock & Landing Settlement Invariant - IMP-55)
- **Hiện tượng & Bẫy thực tế**:
  1. *Ảo giác xúc xắc "nhảy thêm một nhịp" khi Bot trả phí*: Khi Bot kết thúc lượt gieo và nhảy tới ô người chơi mua, Bot nộp tiền thuê đồng thời xúc xắc bị nhảy giật thêm một nhịp.
  2. *Lệch pha nhịp độ Server vs Client (Timing Desync)*:
     - Trên Client: Hoạt cảnh xúc xắc mất 1.1s; bước nhảy của Bot mất steps * 200ms (ví dụ 7 ô = 1.4s) + thời gian tiếp đất 0.8s -> Tổng thời gian thị giác là ~3.3s.
     - Trên Server: `TurnOrchestrator` trước đó chỉ dùng `botTurnDelayMs = 1500ms` cố định. Khi Bot mới nhảy được nửa đường, Server đã phát sinh lượt tiếp theo ở 1.5s; Bot sau tung xúc xắc ở 3.0s khiến xúc xắc văng lên ngay khi Bot 1 vừa chạm đất.
  3. *Giật góc quay máy ảnh (Camera Snapping)*: Khi Server chuyển lượt khỏi Bot (`isBotTurn: false`) trong lúc con cờ Bot còn đang nhảy dở (`isPawnMoving: true`), `resolveCameraMode` đột ngột chuyển từ `'overview'` sang `'pawn_chase'`. Khi Bot chạm đất (200ms sau), camera lại giật ngược về `'overview'`. Cú giật camera 200ms làm thay đổi phối cảnh góc nhìn, khiến khay xúc xắc trên sông Sài Gòn bị trượt mạnh trên màn hình tạo cảm giác xúc xắc nhảy lần 2.
  4. *Quân cờ Bot nhảy ngay khi xúc xắc còn đang lăn*: Trong `apply_delta.ts`, điều kiện `!task.isBot` khiến Bot không chờ xúc xắc tiếp đất (`isRolling`) mà nhảy ngay.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Dynamic Bot Step Delay Invariant**:
     - `src/server/network/turn_orchestrator.ts`: Export hàm `calculateBotStepDelay(room, baseDelayMs = 1500)`:
       delayMs = Math.max(baseDelayMs, 1100 + steps * 200 + 800)
     - Áp dụng khi phòng ở pha `PropertyManagement` hoặc `ActionPhase` và có `lastDice`.
     - *Accelerated Test Guard*: Khi `baseDelayMs <= 500`, giữ nguyên `baseDelayMs` để không làm chậm hoặc gây timeout cho các bài kiểm tra gia tốc.
  2. **Camera Overview Lock for Bot Movement Invariant**:
     - `src/client/3d/camera_state_machine.ts`: Bổ sung `isAnimatingPawnBot?: boolean` vào `CameraResolveParams`.
     - Khi `params.isBotTurn || params.isAnimatingPawnBot`, `resolveCameraMode` LUÔN trả về `'overview'`.
     - `src/client/game_canvas.tsx`: Xác định `isAnimatingPawnBot = Boolean(playersInfo[activeAnimation.playerId]?.isBot)` và truyền vào máy ảnh, triệt tiêu 100% hiện tượng giật góc quay khi lượt chuyển giao trong lúc Bot đang nhảy.
  3. **Universal Movement Queue Synchronization Invariant**:
     - `src/client/network/apply_delta.ts`: `dispatchPawnMove` loại bỏ điều kiện loại trừ Bot `!task.isBot`. Cả Bot và Người chơi đều được đưa vào `pendingPawnMove` khi `isRolling === true`, chỉ bắt đầu nhảy quân cờ sau khi xúc xắc hoàn tất tiếp đất (`setIsRolling(false)`).

---

### 78. [FSM/BOT/ECONOMY] Bất Biến Bảo Toàn Ô 20 Nghỉ Dưỡng Miễn Phí (SSOT Cell 20 Free Parking Safe Zone), Bảo Tồn Mô Hình Rủi Ro Bot 2D6 (minBuffer 300 Tr.) & Thấu Suốt 100% Siêu Dữ Liệu Thẻ Sự Kiện (IMP-57)
- **Hiện tượng & Bẫy thực tế**:
  1. *Lỗi Kiến Trúc Khi Biến Ô 20 Thành Kho Bạc (Treasury Payout)*:
     - Từng có đề xuất giải ngân toàn bộ quỹ Kho Bạc (`room.treasury`) cho người chơi dẫm ô 20 Nghỉ Dưỡng Miễn Phí. Tuy nhiên, thay đổi này làm rách kiến trúc:
       - `DeltaPayload` không chứa trường `treasury`, khiến Client (`top_bar.tsx`) bị kẹt cứng số dư Kho Bạc 2.000 Tr. ảo (desync).
       - Hệ thống giám sát tài chính `audit_telemetry.ts` kích hoạt báo động nghiêm trọng `CRITICAL: TREASURY_INVARIANT_VIOLATED` vì coi việc giải ngân này là thất thoát quỹ.
       - Trải nghiệm Chơi Đơn (Offline Mode) không đồng bộ và vi phạm trực tiếp SSOT gốc `docs/requirements.md §II`.
  2. *Bẫy Ép Cứng Đệm An Toàn Bot (minBuffer = 1.500 Tr.) Phá Vỡ Mô Hình 2D6*:
     - Khi nâng ép cứng `DEFAULT_MIN_SAFETY_BUFFER` từ 300 Tr. lên 1.500 Tr., mô hình dự báo rủi ro 2D6 (`threat_forecaster.ts`) và bản sắc tính cách 3 loại Bot (Aggressive, Balanced, Passive) bị triệt tiêu hoàn toàn. Bot Aggressive trở nên nhút nhát như Bot Passive, làm gãy hàng loạt 11 ca kiểm thử toán học kinh tế và đấu giá.
  3. *Lệch Chuẩn Tỷ Lệ Sàn HOSE & Lệch Siêu Dữ Liệu Thẻ Sự Kiện*:
     - Sàn HOSE có kết quả đổ xúc xắc mặt 1 là 0.30x (lệch so với SSOT 0.50x, kỳ vọng E < 1.0 làm người chơi luôn thua).
     - 6 thẻ bài sự kiện bị lệch số liệu giữa mô tả metadata và mã xử lý logic thực tế (`MC_FIRE_INSPECTION`, `MC_PUBLIC_INVEST`, `MC_CASINO_PILOT`, `MC_ALCOHOL_CHECK`, `CC_CONTRACT_PENALTY`, `CC_TAX_AUDIT`).
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **SSOT Free Parking Safe Zone Invariant**:
     - `src/server/special_cell_handler.ts`: Trả ô 20 về đúng SSOT gốc `docs/requirements.md §II`:
       ```ts
       case CellType.FreeParking:
         room.phase = TurnPhase.PropertyManagement;
         return true;
       ```
     - Tuyệt đối không tự ý phát sinh dòng tiền chi trả tại Ô 20 khi chưa mở rộng `DeltaPayload` và tái cấu trúc telemetry kho bạc.
  2. **Bot 2D6 Threat Horizon & Dynamic Safety Buffer Invariant**:
     - `src/domain/bot/bot_types.ts`: Khóa cứng `DEFAULT_MIN_SAFETY_BUFFER = 300;` và `weights.minBuffer = 300;`.
     - `src/domain/bot/bot_engine.ts`: Đệm an toàn tài chính của Bot phụ thuộc động vào mô hình xác suất xúc xắc 2D6 (`threat.safetyBuffer = Math.max(minBuffer, Math.round(expectedLoss * riskMultiplier))`).
     - Bot chỉ từ chối mua hoặc nâng cấp nhà khi phía trước thực sự có ô nguy hiểm đối thủ (`dangerTilesCount > 0 && bot.balance - cost < threat.safetyBuffer`), bảo toàn trọn vẹn bản sắc 3 phong cách Bot và tính chiến thuật của game.
  3. **HOSE Multiplier SSOT (E = +15.83%)**:
     - `src/domain/event_card_types.ts`: Khóa cứng `HOSE_OUTCOMES = { 1: 0.50, 2: 0.75, 3: 1.00, 4: 1.20, 5: 1.50, 6: 2.00 }`.
  4. **Universal Card Clarity Matrix & 100% Code-Metadata Reconciliation Invariant**:
     - 100% 36 thẻ Thị trường và Cơ hội khai báo đầy đủ 4 trường minh bạch (`targetScope`, `effectDetail`, `duration`, `destination`).
     - Chuẩn hóa chính xác số liệu metadata khớp 100% với handler mã nguồn:
       - `MC_FIRE_INSPECTION`: Phạt C1: 200 Tr., C2: 400 Tr., C3: 800 Tr. Đất trống: Miễn phạt.
       - `MC_PUBLIC_INVEST`: Chi trả 1.000 Tr. cho mỗi ô Hạ tầng giao thông sở hữu.
       - `MC_CASINO_PILOT`: Thưởng 2.000 Tr. cho chủ ô 27 nếu đạt Cấp 3.
       - `MC_ALCOHOL_CHECK`: Thời lượng 2 vòng chơi, giảm 50% tiền thuê ô Dịch vụ.
       - `CC_CONTRACT_PENALTY`: Nộp phạt 1.000 Tr. chuyển cho người nghèo nhất bàn cờ.
        - `CC_TAX_AUDIT`: Nộp phạt 200 Tr. cho mỗi ô đất trống Cấp 0 chưa xây dựng.
      - Giao diện `EventCardModal` hiển thị bảng Impact Specs Matrix với fallback an toàn, tuân thủ nghiêm ngặt 0 UI anti-pattern.

---

### 79. [BOT/AI] Human-like Bot Intelligence & Tactical Capabilities (IMP-58 Phase 1)
- **Bối cảnh & Sự cố**:
  1. *Bot Passive 0% cơ hội thắng*: Thiết kế cũ ép cứng Bot Passive luôn `INTENT_DECLINE` ở pha mua đất và `INTENT_END_TURN` ở pha quản lý tài sản. Khiến Bot Passive hoàn toàn không có tài sản và 100% thua cuộc.
  2. *Đóng băng tài sản thế chấp*: Bot không có cơ chế chuộc lại tài sản đã thế chấp (`INTENT_REDEEM`), khiến tài sản bị vô hiệu hóa quyền thu tiền thuê suốt phần còn lại của ván đấu dù Bot rất dư dả tiền mặt.
  3. *Trạm Kiểm Toán thụ động*: Bot không có chiến thuật bảo lãnh (`INTENT_BAIL_OUT`), đầu trận cần đua gom đất lại nằm chờ trong tù, cuối trận bản đồ đầy nhà cao tầng nguy hiểm lại không biết tận dụng tù làm nơi trú ẩn an toàn.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Bot Passive Value Investor Invariant**:
     - Bot Passive giải ngân chọn lọc: Mua ô Hạ tầng Giao thông (`CellType.Railroad`), Tiện ích (`CellType.Utility`), ô đất giá rẻ (`basePrice <= 1500 Tr.`), hoặc ô giúp tạo độc quyền / chặn đối thủ (`monopolyScore >= 1.6` hoặc `denialScore > 1.0`).
     - Ô đắt đỏ (`basePrice > 1500 Tr.`) mà không có tiềm năng độc quyền: Chỉ mua khi có "pháo đài tiền mặt" (`balance >= basePrice * 3`).
     - Điều kiện đệm an toàn: `bot.balance >= basePrice * 1.5` và `bot.balance - basePrice >= threat.safetyBuffer`.
     - Nâng cấp nhà: Chỉ nâng khi `balance >= upgradeCost * 3` và không có nguy hiểm phía trước (`threat.dangerTilesCount === 0`).
  2. **Autonomous Mortgage Redemption Priority Invariant**:
     - Khi vào pha `PropertyManagement`, nếu không có ô nâng cấp hợp lệ, Bot quét tài sản thế chấp (`findEligibleRedeemCell` trong `bot_redeem.ts`).
     - Chi phí chuộc: `cost = Math.floor(loan * 1.1)`. Điều kiện chuộc: `bot.balance - cost >= safetyBuffer * bufferMultiplier`.
     - 3 tầng ưu tiên chuẩn mực:
       1. Ô thuộc bộ màu độc quyền (khôi phục quyền thu tiền thuê x2/x3).
       2. Ô có tiền thuê cao nhất.
       3. Ô có chi phí chuộc thấp nhất.
  3. **Stage-Aware Tactical Audit Bailout Invariant**:
     - Khi ở pha `WaitingRoll` và `bot.auditTurnsLeft > 0` (`bot_audit.ts`):
        - Đầu trận (`unclaimedCount >= 8`): Cả 3 tính cách Bot chủ động nộp 500 Tr. bảo lãnh ngay (`INTENT_BAIL_OUT`) để giành quyền mua đất trống nếu `bot.balance - 500 >= DEFAULT_MIN_SAFETY_BUFFER`.
        - Tàn cuộc (`unclaimedCount < 8`): Quét 2-12 bước phía trước Ô 10. Nếu có bất kỳ ô đất đối thủ gây nguy hiểm nào -> Ở lại trong tù làm nơi trú ẩn an toàn (tung xúc xắc tìm cặp đôi); nếu hoàn toàn an toàn và đủ đệm dự phòng -> Nộp bảo lãnh ra ngoài.

---

### 80. [3D/UI/OWNERSHIP] Bất Biến Nhận Diện Chủ Quyền Bàn Cờ 3D & Con Dấu Sổ Đỏ 2D (Tile Ownership Markers & Deed Seal Invariant - IMP-58)
> ⚠️ **[SUPERSEDED BY GOTCHA #130 & #134]**: Cơ chế con dấu sáp và cọc cờ trên mặt ô đất đã bị bãi bỏ 100% theo Zero-Land-Marker Invariant (IMP-98/102). Nhận diện chủ quyền hiện tại chỉ sử dụng khay giá đổi màu [OwnerPricePill](#134-3dtexturecontract-bất-biến-triệt-tiêu-decal-giá-2d-trên-toàn-bộ-ô-mua-được--căn-chỉnh-khay-giá-3d-thuần-túy-zero-2d-price-decal--pure-3d-price-pill-alignment-invariant---imp-102) và viền chân đế `OwnerBaseTrim`.

- **Bối cảnh & Vấn đề**:
  1. *Thiếu trực quan hóa quyền sở hữu trên sa bàn 3D*: Trước đây người chơi không thể nhận biết nhanh ô đất nào đã có chủ và thuộc về ai nếu không zoom vào từng ô hoặc click mở modal.
  2. *Lỗi gán sai màu cờ theo màu nhóm đất (`groupColor`)*: Trong mã nguồn cũ, cọc cờ lấy nhầm màu quy hoạch đất thay vì màu người chơi (`tokenColor`), và ô chưa mua vẫn hiển thị cọc cờ nếu là `CellType.Property`.
  3. *Bỏ sót ô Hạ tầng và Tiện ích*: Ô Bến bãi (`Railroad`) và Năng lượng/Điện lực (`Utility`) là tài sản mua được nhưng hoàn toàn thiếu cọc cờ và viền nhận diện.
  4. *Thẻ Sổ Đỏ 2D thiếu con dấu danh dự*: Thẻ bài `TitleDeedModal` không hiển thị con dấu chứng nhận chủ quyền khi đã mua.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Sa Bàn 3D - Dải Viền Chân Đế (`OwnerBaseTrim`) & Cọc Cờ (`OwnershipMarkerInstances`)**:
     - `src/client/3d/board_tile.tsx`: Chỉ render `OwnerBaseTrim` và `OwnershipMarkerInstances` khi `isPurchasable && ownerColor && ownerColor.length > 0`.
     - `isPurchasable = cell.type === CellType.Property || cell.type === CellType.Railroad || cell.type === CellType.Utility`.
     - Tuyệt đối không hiển thị cờ/viền trên 7 ô chức năng phi thương mại (`Go`, `Jail`, `FreeParking`, `Audit`, `Chance`, `Market`, `Tax`, `TaxOrder`).
     - Cọc cờ vải (`FlagCloth`) lấy đúng `ownerColor` (màu token người chơi: Đỏ Ruby, Xanh Dương, Xanh Lục, Vàng Hổ Phách).
     - Thân cọc cờ đồng thau PBR tích hợp các vòng đai chỉ thị cấp độ `TierIndicatorRings` (C0: 0 vòng, C1: 1 vòng, C2: 2 vòng, C3: 3 vòng vàng kim `#F59E0B`).
     - Dải viền `OwnerBaseTrim` đặt tại `[0, 0.01, 0]` kích thước `[1.72, 0.04, 2.24]`, ôm sát khối đế đá ivory cream (`#EDE5D8`) triệt tiêu 100% Z-fighting.
  2. **Trích Xuất Chủ Quyền Phía Client (`computeOwnerMap`)**:
     - `src/client/3d/board_layout.tsx`: Export `computeOwnerMap(playersInfo)`, biến đổi mảng `player.ownedProperties` thành bản đồ tra cứu nhanh `Record<number, { ownerId, ownerName, tokenColor }>`.
     - Hỗ trợ fallback SSR an toàn (`useGameStore.getState()`) khi selector chưa kịp hydrate trong kiểm thử tĩnh.
  3. **Thẻ Bài Sổ Đỏ 2D - Con Dấu Hoàng Gia (`ownership-certificate-seal`)**:
     - `src/client/ui/modals/title_deed_modal.tsx`: Khi `isOwned === true`, render huy hiệu cuộn giấy 📜 `CHỨNG NHẬN QUYỀN SỞ HỮU`, hiển thị tên chủ sở hữu `ownerName` và badge ngọc bích `SỔ ĐỎ CHÍNH CHỦ`.
     - Khi `isOwned === false`, khối con dấu ẩn hoàn toàn, không gây layout shift và tuân thủ 0 UI anti-pattern.

---

### 81. [BOT/AI] Softmax Decision Distribution, Seeded Jitter & Tactical Auction Baiting (IMP-59 Phase 2)
- **Bối cảnh & Vấn đề**:
  1. *Hành vi nhị phân cứng nhắc (Binary Threshold Fragility)*: Các quyết định mua đất và đấu giá cũ mang tính quy tắc cứng (`balance >= price * threshold`), khiến Bot dễ bị người chơi bắt bài sau vài vòng đấu.
  2. *Thiếu tính nghi binh và tâm lý con người trong đấu giá*: Bot chỉ đặt giá thuần túy theo định giá thực tế, không có chiến thuật nghi binh kích giá đối thủ (Baiting / Trap Bids) và bất ngờ rút lui để gài đối thủ trả giá đắt.
  3. *Nguy cơ làm gãy Turn Pacing & Test Liveness khi thêm tính ngẫu nhiên*: Nếu phủ Softmax ngẫu nhiên thuần túy (`Math.random()`) mà không kiểm soát điều kiện an toàn, Bot có thể vô cớ từ chối mua đất khi tiền mặt dư dả ở đầu trận, làm bùng phát các phiên đấu giá không mong muốn khiến luồng chơi bị treo chờ người chơi human thao tác.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Hàm Phân Phối Softmax & Nhiệt Độ Tính Cách (`SOFTMAX_TEMPERATURE`)**:
     - `src/domain/bot/bot_types.ts` & `src/domain/bot/bot_softmax.ts`:
       - `BotPersonality.Passive`: T = 0.8 (quyết đoán, kỷ luật cao, chỉ giải ngân theo giá trị an toàn).
       - `BotPersonality.Balanced`: T = 1.0 (chuẩn mực, cân bằng).
       - `BotPersonality.Aggressive`: T = 1.4 (khám phá, sẵn sàng chấp nhận rủi ro).
     - Hằng số `PERSONALITY_BUY_BIAS` (-0.5 / 0.3 / 1.2) tích hợp trực tiếp vào hàm tiện ích, loại bỏ dead code và magic numbers.
     - Hàm tính xác suất mua: `calculateBuyProbability(estimatedValue, basePrice, personality, valuePreference)`.
     - Phân phối mượt mà (Sigmoidal non-binary), tự động ưu tiên các nhóm đất chiến lược (Hạ tầng, Tiện ích, Nhóm giá rẻ cho Bot Passive).
  2. **Seeded Jitter & Khả Năng Tái Lập 100% (Reproducibility Invariant)**:
     - `resolveSeededJitter(seedOrRng, manualJitter)`: Dao động ngẫu nhiên tâm lý trong biên độ an toàn `[-0.12, 0.12]`. Khi thiếu tham số hoặc gặp roll bất thường, tự động kẹp giá trị về vùng an toàn [0, 1] hoặc fallback về điểm trung tính 0.5 (jitter = 0.00).
     - `getTurnSeed(bot, room, extra)`: Sinh seed xác định từ trạng thái phòng (`roomCode:botId:round:diceSeq:position:extra`), an toàn trước thuộc tính phòng/bot chưa khởi tạo, đảm bảo cùng một trạng thái ván cờ luôn tái lập quyết định 100% tất định (Zero Test Flakiness).
     - `calculateSoftmaxProbability` & `calculateBuyProbability`: Miễn nhiễm hoàn toàn với `NaN` / `Infinity`, luôn trả về xác suất hợp lệ trong [0, 1].
     - `room_bot_coordinator.ts` truyền session PRNG `roomManager.getRng()` vào `getBotConfig`, kích hoạt đầy đủ Softmax và Seeded Jitter trong runtime thực tế.
  3. **Chiến Thuật Nghi Binh Đấu Giá (Auction Baiting & Trap Bids)**:
     - `src/domain/bot/bot_auction.ts`:
     - Hành lang nghi binh (`isBaitCorridor`): Giá đấu nằm trong khoảng 70% < bid <= 75% giá niêm yết.
     - Xác suất nghi binh sử dụng hằng số tĩnh `AUCTION_BAIT_PROBABILITY = 0.6`.
     - Bot Passive tham gia kích giá đối thủ nếu có người dẫn đầu là đối thủ (`highestBidder !== bot.id`) và bảo toàn trọn vẹn `safetyBuffer`.
     - Khi giá đấu vượt qua 75% giá gốc và không phải ô độc quyền, Bot Passive lập tức bất ngờ bấm Pass (`INTENT_AUCTION_PASS`), hoàn tất việc bẫy đối thủ ôm tài sản giá cao.
     - `calculateAuctionMaxBid`: Đồng bộ `room?.round ?? room?.roundCount ?? 1`, bảo đảm đệm an toàn tính đúng theo vòng chơi thực tế tại server.
     - `finalizeAuctionIfFinished`: Cho phép đóng phiên đấu giá an toàn kể cả khi không có người chơi nào đặt giá (`!auction.highestBidder`) để kích hoạt cơ chế phát mãi cưỡng chế Kho Bạc 70%.
     - `PlayerIntent` union khai báo đầy đủ `isBait?: boolean` cho `INTENT_BID`.
     - Bot Aggressive nâng giá quyết liệt (+100 Tr.) khi số dư > 10.000 Tr. và sẵn sàng đẩy trần giá lên 150% - 160% định giá nếu là ô chặn độc quyền đối thủ (`denialScore >= 2.0`).
     - Bot Balanced duy trì kỷ luật dòng tiền, chặn trần đấu giá nghiêm ngặt tại 120% định giá chiến lược.
  4. **Bảo Toàn Giới Hạn Tệp Kiến Trúc (Architecture File Limits)**:
     - Tách module `bot_auction.ts` (180 LOC) và `bot_softmax.ts` (115 LOC), giữ `bot_engine.ts` ở mức 337 LOC (tuyệt đối không vượt trần 400 LOC của Domain Services). Bộ contract test `imp59_human_like_bot_intelligence_phase2.test.ts` đạt 269 LOC với 25/25 atomic tests (dưới trần 300 LOC của Unit Test).

---

### 82. [ECONOMY/PACING/AFK] Bất Biến Kinh Tế Động, Trần Thuế GO & Cứu Nguy AFK Bằng Thế Chấp (IMP-60)
- **Bối cảnh & Vấn đề**:
  1. *Thiếu hụt thanh khoản do vốn cào bằng 15.000 Tr.*: Với bàn 2 người chơi, mỗi người cần mua ~14 ô đất (chi phí ~28.450 Tr.), khiến ván đấu bị nghẽn thanh khoản nghiêm trọng từ vòng 4-5, người chơi cạn sạch tiền không thể xây nhà C1-C3.
  2. *Nghịch lý Thuế Tài Sản qua GO nuốt trọn tiền thưởng*: Người sở hữu từ 7 ô đất trở lên bị trừ thuế tài sản > 2.800 Tr. khi vượt GO, vượt quá tiền thưởng GO (+2.000 Tr.), gây nghịch lý càng mua nhiều đất càng bị âm tiền mặt.
  3. *Hết giờ Insolvency cưỡng chế phá sản người chơi còn nhiều đất*: Khi người chơi âm tiền tạm thời và bị AFK/idle 25 giây, bộ lập lịch phát lệnh `INTENT_BANKRUPTCY` xóa sổ người chơi dù tài sản ròng còn rất lớn, vi phạm quyền lợi người chơi.
  4. *Xung đột phát lệnh Client & Server ở 00:00*: Client tự phát intent khi đếm ngược về 00:00 đồng thời với Server Timeout Scheduler, gây race condition và cảnh báo lỗi trên mạng.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Quy Mô Vốn Khởi Điểm Động (`INITIAL_BALANCE_BY_PLAYERS`)**:
     - `src/domain/room.ts` & `src/server/room_manager.ts`:
     - 2 người chơi: Cấp vốn **25.000 Tr.** / người.
     - 3 người chơi: Cấp vốn **20.000 Tr.** / người.
     - 4 người chơi: Cấp vốn **18.000 Tr.** / người.
     - Fallback an toàn `INITIAL_BALANCE = 15_000 Tr.` được giữ nguyên cho các thực thể người chơi chưa bắt đầu ván hoặc kiểm thử đơn vị độc lập. Hàm `getInitialBalanceForPlayerCount(playerCount)` là điểm truy cập duy nhất để lấy vốn theo số người chơi.
  2. **Khóa Trần Thuế Tài Sản Vượt GO (`GO_PROPERTY_TAX_CAP`)**:
     - `src/domain/property_rent.ts`: Khai báo `export const GO_PROPERTY_TAX_CAP = 1_000;` (50% của `GO_BONUS = 2.000 Tr.`).
     - `src/server/turn_loop.ts` & `src/client/telemetry/telemetry_delta_hook.ts`: Áp trần `Math.min(rawTax, GO_PROPERTY_TAX_CAP)`.
     - Đảm bảo lương thực nhận khi qua ô GO luôn dương tối thiểu **`+1.000 Tr.`** (`2.000 - 1.000 = +1.000 Tr.`).
  3. **Chuẩn Hóa Nhịp Thở Thời Gian (Pacing Normalization)**:
     - `src/server/network/turn_orchestrator.ts`:
       - `WaitingRoll`: 25.000ms (25s).
       - `ActionPhase`: 35.000ms (35s).
       - `HosePhase`: 25.000ms (25s).
       - `PropertyManagement`: 30.000ms (30s).
       - `AuctionPhase`: 20.000ms (20s).
       - `InsolvencyPhase`: 45.000ms (45s).
     - `src/server/network/turn_watchdog.ts`: Nâng trần `maxTurnStallMs` lên **60.000ms** (60s), tương thích với `InsolvencyPhase` 45s.
  4. **Thuật Toán Cứu Nguy AFK An Toàn Trong Insolvency (`executeInsolvencyAfkRecovery`)**:
     - `src/server/network/afk_recovery.ts`:
     - Khi hết giờ ở `InsolvencyPhase`, thay vì ép phá sản ngay, quy trình cứu nguy 2 bước được kích hoạt:
       * *Bước 1 (Hạ cấp công trình)*: Tự động tìm các ô có công trình (`level > 0`), ưu tiên cấp cao hơn và tuân thủ quy tắc hạ cấp đều tay (`enforceEvenDowngrading: true`), hoàn lại 50% chi phí xây dựng vào số dư. Nếu số dư phục hồi `>= 0`, bảo toàn quyền sở hữu và không cần thế chấp.
       * *Bước 2 (Thế chấp ô đất thô)*: Nếu sau khi hạ cấp toàn bộ công trình về C0 mà số dư vẫn `< 0`, server tự động sắp xếp các ô đất chưa thế chấp theo giá niêm yết rẻ nhất tăng dần và lần lượt thế chấp nhận 50% tiền vay đến khi `balance >= 0`.
     - Nếu số dư đã phục hồi (`balance >= 0`), chuyển pha sang `PropertyManagement` để `TurnOrchestrator` / `TurnWatchdog` tự động gọi `handleEndTurn` kết thúc lượt an toàn.
     - Chỉ khi toàn bộ công trình đã hạ cấp về 0 VÀ toàn bộ tài sản đã thế chấp hết mà số dư vẫn âm (`balance < 0`), server mới gửi lệnh cưỡng chế phá sản `INTENT_BANKRUPTCY`.
  5. **TopBar & Chống Race Condition Khi 00:00**:
     - `src/client/ui/top_bar.tsx`: Đổi nhãn nút chiếu sáng từ `[⏱️ Tự Động]` thành `[🌤️ Ánh Sáng: Tự Động]` để phân biệt rạch ròi với bot đánh hộ.
     - `src/client/main.tsx`: Bổ sung điều kiện kiểm tra kết nối `if (!isConnected)` khi đếm ngược về 00:00. Nếu socket đang kết nối bình thường, client nhường 100% quyền xử lý hết giờ cho máy chủ, triệt tiêu xung đột gửi trùng intent.

---

### 83. [OPS/DOCKER/UAT] Bẫy Treo Terminal Khi Kiểm Tra Health Check Docker (start_period & cờ -m khống chế timeout)
- **Bối cảnh & Vấn đề**:
  - Khi thực thi lệnh kiểm tra Docker sau khi deploy: `docker compose ps ; curl -s http://127.0.0.1:3000/health`, terminal bị đứng hình/treo con trỏ vô hạn mà không in thêm bất kỳ thông báo lỗi nào.
  - *Nguyên nhân*: Container `vtcoon-vtcoon-1` vừa khởi động được 4-5s (`Up 4 seconds (health: starting)`). Node.js cần 5-8s trong `start_period` để khởi tạo WebSocket Server và bind `httpServer.listen(3000)`. `docker-proxy` đã mở cổng ở tầng Host nhưng Node.js bên trong chưa kịp accept kết nối HTTP. Đồng thời, lệnh `curl -s` (silent) chạy trần mà KHÔNG khai báo cờ timeout (`-m` hoặc `--connect-timeout`), khiến curl kiên nhẫn chờ TCP socket theo timeout mặc định của hệ điều hành (60-120 giây) trong im lặng tuyệt đối.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Khống chế Timeout Bắt Buộc Khi Curl (`-m 5 --connect-timeout 3`)**:
     - Mọi lệnh kiểm tra API / Healthcheck trong UAT hoặc vận hành terminal BẮT BUỘC phải kèm cờ khống chế thời gian tối đa:
       `curl -m 5 --connect-timeout 3 http://127.0.0.1:3000/health`
     - Tuyệt đối cấm chạy `curl` trần không timeout trên terminal Windows. Nếu server chưa sẵn sàng, curl sẽ tự thoát sau 3-5 giây kèm mã lỗi rõ ràng thay vì treo phiên làm việc.
  2. **Đệm An Toàn Vượt Qua `start_period` Container (Tối Thiểu 6s)**:
     - Khi chạy chuỗi lệnh kiểm tra ngay sau khi khởi động container, BẮT BUỘC chèn lệnh chờ tối thiểu 6 giây (`timeout /t 6 /nobreak >nul`) để Node.js kịp hoàn tất bootstrap và chuyển container sang trạng thái `(healthy)`:
       `timeout /t 6 /nobreak >nul ; docker compose ps ; curl -m 5 --connect-timeout 3 http://127.0.0.1:3000/health`
  3. **Không Dùng Cờ `-s` Đơn Độc Khi Debug Mạng**:
     - Cờ `-s` triệt tiêu toàn bộ thông tin tiến trình và lỗi mạng. Khi kiểm tra thủ công hoặc debug, dùng cờ `-fsS` (fail fast, show errors) hoặc cờ mặc định để luôn quan sát được phản hồi hoặc mã lỗi HTTP.

---

### 84. [UI/TABLETOP/CDP] Bất Biến Giao Diện Cờ Bàn Thẻ Ngà & Cổng Kiểm Thử Trực Quan Qua Edge CDP (IMP-61)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy FinTech/Crypto Dark Mode*: Thiết kế modal với tông nền tối đen (`bg-slate-950`), viền neon vàng/xanh phát sáng tạo cảm giác ứng dụng giao dịch tiền điện tử hiện đại, đối chọi gay gắt với sa bàn 3D rực rỡ nắng nhiệt đới và không khí cờ bàn ấm cúng.
  2. *Bẫy Checkbox thô kệch trong Đàm Phán*: Dùng checkbox đen xì HTML thô (`<input type="checkbox">`) trong modal đàm phán P2P biến trải nghiệm gameboard thành biểu mẫu hành chính khảo sát tẻ nhạt.
  3. *Bẫy Chụp Nhầm Cổng Docker Container Cũ*: Khi dev server chạy tại `localhost:5173` nhưng kịch bản chụp ảnh CDP trỏ vào `127.0.0.1:3000` (được Docker container chiếm giữ với bản build cũ), ảnh chụp ra vẫn hiển thị giao diện tối cũ dù mã nguồn trong repo đã sửa xong.
  4. *Bẫy Monolithic Assertions trong Test Hợp Đồng*: Viết > 4 lệnh `expect()` trong 1 bài test vi phạm tính nguyên tử của Test Architecture Gate.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Tabletop Theme SSOT (`TABLETOP_THEME`)**:
     - Thẻ Sổ Đỏ và modal BẮT BUỘC dùng tone giấy ngà `#FFFDF8` hoặc kem ấm `#F7F2E7`.
     - Viền mực in đen 2px `border-2 border-slate-900` kết hợp đổ bóng carton đồ chơi `shadow-[0_6px_0_0_#0f172a]`.
     - Chữ thông số, phí C0-C3 in mực đen đậm `text-slate-900` (`#0F172A`), triệt tiêu 100% chữ neon phát sáng trên nền tối.
     - Nút hành động đồ chơi (Mua đất, Đặt cược, Nâng cấp) BẮT BUỘC có đế phím dày 4px `shadow-[0_4px_0_0_...]` và phản hồi lún vật lý `active:translate-y-[3px]`.
  2. **Thảm Nỉ Đàm Phán & Thẻ Sổ Đỏ Mini (Trade Felt Mats)**:
     - Modal Đàm Phán BẮT BUỘC phân định 2 thảm nỉ riêng: Thảm xanh cho Người chơi, Thảm đỏ cho Bot AI đối tác.
     - BĐS BẮT BUỘC hiển thị dạng thẻ Sổ Đỏ mini có dải màu địa phương và checkbox tùy biến, bãi bỏ vĩnh viễn thẻ `<input type="checkbox">` thô đen.
     - Bổ sung các nút bấm tăng giảm tiền nhanh `+100` và `+500` phong cách cọc tiền giấy.
  3. **Cổng Chụp Trực Quan CDP (`localhost:5173`)**:
     - Mọi kịch bản CDP chụp màn hình nghiệm thu BẮT BUỘC trỏ vào cổng của Vite Dev Server (`localhost:5173`) để ghi nhận mã nguồn nóng mới nhất, không trỏ vào cổng Docker `3000` trừ khi vừa chạy `docker compose build`.
  4. **Kiểm Thử Hợp Đồng Nguyên Tử (Atomic Test Mandate)**:
     - Mọi bài test trong `tests/contracts/` BẮT BUỘC giới hạn 1–4 assertions/test. Dùng `toMatchObject(...)` để gom cụm kiểm tra token thay vì chuỗi `expect()` rời rạc vượt trần.

---

### 85. [3D/ASSET/PBR] Bất Biến Tối Ưu Hóa Ngân Sách Hình Học GLB & Bảo Vệ SSR Headless Cho Procedural Texture (IMP-62)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Vỡ Ngân Sách Kỹ Thuật (Blast Radius Regression)*: Khi tăng chi tiết hình học để đạt chuẩn sa bàn thương mại diorama, nếu nâng trần ngân sách quá mức quy định trong `optimize_assets.mjs` (chuẩn IMP-29: pawns <= 1200, buildings <= 800, landmarks <= 1500, vehicles <= 400 tris, total <= 2.5MB), các bộ kiểm thử tự động của CI/CD và toàn bộ 5 bài test client regression sẽ gãy hàng loạt.
  2. *Bẫy Crash SSR Headless Khi Sinh Texture Procedural*: Khi sinh texture bằng `document.createElement('canvas')`, môi trường kiểm thử Node.js / JSDOM / Vitest thiếu Canvas 2D context hoàn chỉnh hoặc không có đối tượng `document`, dẫn đến việc quăng ngoại lệ `ReferenceError: document is not defined`.
  3. *Bẫy Rò Rỉ VRAM Bộ Nhớ Đồ Họa Do Tái Cấp Phát Texture*: Khi các component React R3F (`InstancedMesh`, `GameBoard`) render lại theo state, nếu hàm sinh texture trả về đối tượng mới ở mỗi lần gọi mà không có cơ chế Singleton Cache, GPU sẽ phải nạp hàng chục texture trùng lặp gây giật lag và rò rỉ bộ nhớ.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Tối Ưu Hóa Trong Headroom Ngân Sách Hiện Hữu (Geometric Headroom Invariant)**:
     - Toàn bộ 15 mô hình `.glb` được điêu khắc tinh xảo (350 - 1100 tris) nằm gọn hoàn toàn trong giới hạn ngân sách ban đầu:
       * Buildings C1-C3: 400 - 560 tris (Trần: 800 tris).
       * Luxury Pawns: 590 - 860 tris (Trần: 1200 tris).
       * Landmarks: 750 - 850 tris (Trần: 1500 tris).
       * Vehicles: 180 - 340 tris (Trần: 400 tris).
       * Tổng tải trọng toàn bộ 15 mô hình: **0.63 MB** (đạt 25% trần ngân sách 2.5 MB).
  2. **Bảo Vệ SSR Bằng DataTexture Fallback (SSR Headless Guard Invariant)**:
     - Mọi generator texture procedural (`facade_texture_generator.ts`, `tabletop_texture_generator.ts`) BẮT BUỘC có chốt chặn an toàn `if (typeof document === 'undefined') return createDataFallbackTexture(...)`.
     - DataTexture fallback khởi tạo bằng `new THREE.DataTexture(new Uint8Array(16 * 16 * 4), 16, 16, THREE.RGBAFormat)` với `wrapS = THREE.RepeatWrapping`, `wrapT = THREE.RepeatWrapping` và `repeat.set(...)` tương thích 100% với giao diện Texture chuẩn.
  3. **Bộ Nhớ Đệm Đơn Kỷ Lục (Singleton Texture Cache Invariant)**:
     - Duy trì cache module-level cho toàn bộ các texture (Highrise, Shophouse, Walnut Diffuse, Walnut Roughness). Mọi lời gọi liên tiếp đều trả về đúng tham chiếu ban đầu (`t1 === t2`), triệt tiêu 100% rác bộ nhớ GPU và draw calls dư thừa.
     - Cung cấp hàm giải phóng chuẩn `clearTextureCaches()` / `clearFacadeTextureCache()` / `clearTabletopTextureCache()` gọi `.dispose()` an toàn khi kết thúc vòng đời ứng dụng.

---

### 86. [3D/TEXTURE] Bất Biến Vị Trí Công Trình C1-C3 Ngoài Card & Hoàn Nguyên Mặt Thẻ Nguyên Bản (IMP-63)
> ⚠️ **[LƯU Ý TIẾN HÓA / THAY THẾ]**: Thông số hardcode `offset = 1.58;` và vị trí `position={[0, 0.22, -1.58]}` trong Gotcha này đã được **thay thế bởi Gotcha #88 (IMP-65)** (tính toán động ma trận theo `getBuildingLotTransform`) và **Gotcha #89 (IMP-66)** (chuẩn hóa chân đế `position: [0, 0.16, -1.38]` và `scale: [0.975, 0.975, 0.975]`).
- **Bối cảnh & Bẫy thực tế**:
  1. *Công trình 3D đè lên khay giá/quân cờ hoặc che tên card khi đặt bên trong card*: Khi công trình đặt ở `Z = 0.58` (đáy ô) hoặc `Z = -0.58` (đỉnh ô nhưng vẫn trên card), công trình 3D hoặc khối móng sẽ che khuất các phần của thẻ bài và cản trở góc nhìn camera nghiêng 38°.
  2. *Giải pháp triệt để: Dời công trình C0-C3 hoàn toàn ra ngoài đỉnh card*: Bằng cách đặt công trình tại `position={[0, 0.22, -1.58]}` (nằm ngoài mép trên `Z = -1.08` của card), toàn bộ bề mặt card được giải phóng 100% và hoàn nguyên về trạng thái nguyên bản. *(Đã tinh chỉnh thành `Z = -1.38` theo Gotcha #89)*.
  3. *Đồng bộ tâm chấn hiệu ứng ConstructionSlamVFX*: Hàm `getBuildingWorldPosition` ban đầu đổi `offset = 1.58;` để sóng xung kích, chấn động rơi và chùm pháo hoa nổ ăn khớp với chân đế công trình nằm ngoài card. *(Đã chuyển sang tính toán động theo Gotcha #88)*.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Tọa Độ Chân Đế Hoàn Toàn Ngoài Card (`Top Outside Building Plot Invariant`)**:
     - `src/client/3d/procedural_building.tsx`: Cả cấp 0 (`SurveyorPlotBoundary`) và cấp 1-3 (`SafeGLTFModel`) BẮT BUỘC đặt ngoài card (`Z <= -1.35`), giải phóng hoàn toàn toàn bộ bề mặt ô cờ cho quân cờ di chuyển và hiển thị đầy đủ thông tin.
     - `src/client/3d/construction_slam_vfx.tsx`: `getBuildingWorldPosition(cellIndex)` tính toán động theo `getBuildingLotTransform(cellIndex).position` (Gotcha #88) để sóng xung kích và pháo hoa ăn khớp 100% với chân đế nhà tại mọi cạnh bàn cờ.
  2. **Hoàn Nguyên Mặt Thẻ Nguyên Bản Đầy Đủ Chi Tiết (`Restored Pristine Card Texture Invariant`)**:
     - `src/client/3d/tile_texture_generator.ts` (`createStandardTileTexture`):
       * *Dải màu nhận diện vùng*: `ctx.fillRect(0, 0, 256, 56);`
       * *Tên tỉnh/thành*: `strokeText(meta.title, 128, 28); fillText(meta.title, 128, 28);` (font `'900 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'`)
       * *Phụ đề*: `fillText(meta.subtitle, 128, 74);` (font `'900 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'`)
       * *Tranh di sản / Icon*: `ctx.rect(10, 94, 236, 172);`, ảnh `dx = 20, dy = 97, targetW = 216, targetH = 166`, fallback `drawIcon(ctx, meta.icon, 128, 180, meta.bannerColor, 1.5);`
       * *Khay giá niêm yết*: Capsule `ctx.roundRect(22, 274, 212, 50, 12);` với `fillText(priceText, 128, 300);` (font `'900 26px ...'`)
       * *Viền ngoài*: `ctx.strokeRect(2, 2, 252, 336);`

---

### 87. [UI/PERF/TABLETOP] Bất Biến Triệt Tiêu Backdrop Blur & Tinh Giản HUD Khay Cờ Bàn (IMP-63)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy GPU Fill-Rate Drain do CSS Backdrop Filter*: Sử dụng `backdrop-blur-md` hoặc `backdrop-blur-2xl` trên các lớp DOM UI nằm đè trực tiếp lên WebGL 3D Canvas (60 FPS) buộc GPU phải copy Framebuffer của WebGL sang texture phụ và chạy bộ lọc Gaussian Blur đa tầng mỗi khung hình, làm sụt giảm FPS nghiêm trọng trên GPU tích hợp và thiết bị di động.
  2. *Bẫy Tô Vẽ Rườm Rà (Decorative Slop)*: Sa đà vào việc tự vẽ thêm các hiệu ứng và họa tiết giả lập thừa thãi (vé tàu du thuyền, ghế mây đan, tem đục lỗ) làm tăng độ phức tạp DOM, phình to bundle CSS và làm phân tán sự tập trung của người chơi vào ván cờ.
  3. *Bẫy Lệch Tông Dark Mode & Light Tabletop*: Khi các modal đã chuyển sang phong cách Giấy Ngà (`IMP-61`), nhưng HUD (`TopBar`, `ActionDock`, `PlayerCard`) vẫn dùng nền đen tối kính mờ kiểu Crypto/Sci-Fi (`bg-slate-900/950`), gây ra sự đứt gãy thẩm mỹ toàn diện.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Triệt Tiêu 100% `backdrop-blur` Trên HUD & Sảnh Chờ (Zero Blur Invariant)**:
     - Toàn bộ các thành phần in-game HUD (`TopBar`, `ActionDock`, `PlayerCard`, `SocialEmotesTray`, `FloatingBadge`, `ModalBackdrop`) và Sảnh chờ (`PreMatchDeck`, `PlayerSlotCard`, `QrCodeCard`) CẤM TUYỆT ĐỐI sử dụng bất kỳ class `backdrop-blur` nào.
     - `ModalBackdrop` sử dụng lớp phủ phẳng trong suốt nhẹ `bg-slate-900/15`, vừa định hình rõ nét modal trung tâm vừa giữ cho thế giới sa bàn 3D ngoài trời luôn ngập tràn ánh nắng và giải phóng 100% chi phí xử lý bộ nhớ đồ họa.
  2. **Bảng Màu Giấy Ngà Đặc & Chữ Mực Đen (Tabletop Solid Ivory SSOT)**:
     - Mọi container HUD chuyển sang nền giấy ngà đặc `#FFFDF8` hoặc kem ấm `#F7F2E7`, viền mực đen 2px `border-slate-900`, bóng dập phẳng đồ chơi `shadow-[0_4px_0_0_#0f172a]`.
     - Toàn bộ chữ số tài chính sử dụng mực in đen đậm `#0F172A` với font `tabular-nums font-mono` chuẩn công thái học điều khiển (touch target >= 44px).
  3. **Bảo Toàn 100% Hợp Đồng Tương Thích & A11y (Zero Regression Invariant)**:
     - Giữ nguyên vẹn 100% `data-testid`, các vai trò trợ năng (`role="timer"`, `role="toolbar"`, `role="region"`, `role="status"`), nhãn `aria-label`, và thuộc tính `data-legacy-style`.

---

### 88. [3D/LAYOUT/TYPOLOGY] Bất Biến Tỷ Lệ Sa Bàn Scale 0.65x, Chân Đế 0.55m, Triệt Tiêu Va Chạm Góc Vuông (Corner Splay) & Đa Dạng Hóa Kiến Trúc 4 Vùng Miền (IMP-65)
> ⚠️ **[LƯU Ý TIẾN HÓA / THAY THẾ]**: Thông số góc xoay splay `rotationY = ±0.22 rad` và scale `0.65x` trong Gotcha này đã được **thay thế bởi Gotcha #89 (IMP-66)** (nâng scale lên `0.975x`) và **Gotcha #90 (IMP-67)** (triệt tiêu toàn bộ góc xoay splay, bắt buộc đặt `rotation: [0, 0, 0]` trực giao 90° để công trình thẳng đẹp tự nhiên).
- **Bối cảnh & Bẫy thực tế**:
  1. *Va chạm hình học góc vuông (Corner Collision & Clipping Trap)*: Khi đưa công trình C1-C3 ra mép ngoài ô cờ (`Z = -1.35m`), các cặp ô đất tiếp giáp góc 90° quanh 4 góc bàn cờ (ví dụ Ô 1 & Ô 39 quanh GO, Ô 9 & Ô 11 quanh Audit) có khoảng cách tâm hình học chỉ ~0.55m. Nếu giữ nguyên hướng đặt vuông góc phẳng chuẩn `[0, 0, 0]`, hai công trình sẽ va quệt, lồng ghép vào nhau (mesh clipping), làm mất tính chân thực của sa bàn diorama.
  2. *Lệch tâm chấn Slam VFX khi hardcode offset*: Hàm tính tọa độ nổ hiệu ứng `getBuildingWorldPosition` trong các phiên bản trước hardcode `offset = 1.58m` hoặc `1.35m` cố định dọc theo trục chính, khiến các ô đất có dịch chuyển ngang hoặc xoay bị lệch tâm chấn nổ và chấn động rơi khỏi chân đế công trình.
  3. *Nguy cơ vỡ ngân sách GLB khi nhân 4 lần số lượng mô hình*: Tăng từ 3 mô hình fallback lên 12 mô hình kiến trúc vùng miền chuyên biệt (`bld_{riverine,resort,heritage,metropolis}_c{1..3}.glb`) nếu không kiểm soát số đa giác và dung lượng có thể khiến tổng tài nguyên đồ họa vượt trần 2.5 MB.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Corner Splay Geometry & Zero-Collision Invariant (Khoảng cách >= 0.60m)**:
     - `src/client/3d/procedural_building.tsx`: Khai báo `getBuildingLotTransform(cellIndex)` với cấu trúc chuẩn `STANDARD_LOT_TRANSFORM: position: [0, 0.16, -1.35], scale: [0.65, 0.65, 0.65]`. *(Đã nâng cấp sang scale 0.975x theo Gotcha #89 và thẳng góc 90° theo Gotcha #90)*.
     - 8 ô đất góc tiếp giáp (`1, 9, 11, 19, 21, 29, 31, 39`) áp dụng `CORNER_SPLAY_TRANSFORMS`:
       * Dịch ngang: `lx = ±0.18m` (hướng ra xa góc bàn cờ). *(Đã nâng lên ±0.24m theo Gotcha #89)*.
       * Góc xoay: `rotationY = ±0.22 rad` (~12.6°). *(Đã bãi bỏ, chuyển về `[0, 0, 0]` theo Gotcha #90)*.
     - Khoảng cách Euclid giữa chân đế hai ô góc (như Cell 1 & Cell 39) đạt **0.891m**, vượt xa ngưỡng tối thiểu 0.60m và tạo vùng đệm an toàn `0.34m` so với khổ đế `0.55m`.
  2. **Dynamic World Position Alignment Invariant**:
     - `src/client/3d/construction_slam_vfx.tsx`: `getBuildingWorldPosition(cellIndex)` tính toán động dựa trên `cellPosition(cellIndex)` kết hợp ma trận xoay 4 cạnh và tọa độ cục bộ `getBuildingLotTransform(cellIndex).position`, triệt tiêu hoàn toàn độ lệch tâm chấn nổ.
  3. **Đa Dạng Hóa Kiến Trúc 4 Vùng Miền & Ngân Sách Diorama**:
     - `src/client/3d/building_typology.ts`: Phân bổ 22 ô đất BĐS vào 4 vùng kiến trúc đặc trưng:
       * `riverine` (Sông Nước Nam Bộ - Nhà sàn gỗ, mái lá dừa nước, cọc cừ tràm): Ô 1, 3, 27.
       * `resort` (Nghỉ Dưỡng Biển & Núi - Villa mái dốc nhiệt đới, bể bơi vô cực, kính tràn viền): Ô 9, 11, 13, 14, 16, 21, 29.
       * `heritage` (Phố Cổ & Di Sản - Mái ngói âm dương, cửa lá sách xanh ngọc, lồng đèn đỏ): Ô 18, 23, 24, 31, 34.
       * `metropolis` (Siêu Đô Thị Tài Chính - Shophouse hiện đại, tháp kính sapphire vát góc, đỉnh kim cương): Ô 6, 8, 19, 26, 32, 37, 39.
     - Toàn bộ 12 mô hình vùng miền + 3 fallback C1-C3 chuẩn hóa chân đế `BUILDING_BASE_PLINTH_WIDTH = 0.55m`.
     - Tổng ngân sách 27 mô hình: **1.11 MB / 2.5 MB** (đạt 44% dung lượng trần), toàn bộ 15 mô hình nhà đều nằm trong khoảng 300–604 tris và < 55 KB.

---

### 89. [3D/SCALE] Tái Cân Bằng Tỷ Lệ Trực Quan Bàn Cờ, Triệt Tiêu Xung Đột Con Cờ & Khoảng Hở An Toàn Góc Vuông 0.397m (IMP-66)
> ⚠️ **[LƯU Ý TIẾN HÓA / THAY THẾ]**: Thông số góc xoay splay `rotationY = ±0.25 rad (~14.3°)` trong Gotcha này đã được **thay thế bởi Gotcha #90 (IMP-67)** (chứng minh bằng toán học hình học trực giao và bắt buộc đặt `rotation: [0, 0, 0]` thẳng góc 90° tự nhiên).
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Kích Thước Con Cờ Quá Khổ (Oversized Pawn Occlusion)*: Với `scale = [1.25, 1.25, 1.25]`, chân đế linh vật đạt đường kính ~1.05m (chiếm 60% bề ngang ô cờ 1.64m), gây va chạm lồng ghép giữa các người chơi cùng đứng 1 ô và che khuất thông tin thẻ cờ.
  2. *Bẫy Công Trình C1-C3 Thu Nhỏ Quá Mức (Undersized Building Scale)*: Ở đợt cập nhật trước, hệ số `0.65x` khiến khổ đế thực tế thu hẹp còn ~0.358m x 0.358m, quá nhỏ so với tỷ lệ sa bàn diorama thương mại.
  3. *Bẫy Va Chạm Góc Khi Phóng To Công Trình*: Khi tăng tỷ lệ công trình lên +50% (`0.975x`), nếu giữ nguyên thông số trượt bên cũ (`0.18m`), hai công trình tại góc 90° sẽ bị giảm khoảng hở an toàn và có nguy cơ va chạm hình học.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **50% Pawn Scale Reduction (`scale = [0.625, 0.625, 0.625]`)**:
     - `src/client/3d/luxury_pawn_models.tsx` & `src/client/3d/pawn_animator.tsx`: Cả linh vật cờ thượng lưu và pawn fallback bọc chuẩn `scale={[0.625, 0.625, 0.625]}` (đường kính đế thu về ~0.52m, đế tiếp xúc ~0.31m), cho phép 4 linh vật đứng cùng ô với các điểm offset `[-0.2, 0.2]` mà không va chạm. *(Đã được cá nhân hóa scale riêng cho từng linh vật theo Gotcha #101)*.
     - `src/client/3d/sunny_island_lobby_scene.tsx`: Hạ bảng tên 3D Billboard từ `[0, 1.05, 0]` xuống `[0, 0.85, 0]` áp sát đỉnh đầu con cờ cân đối thị giác.
  2. **50% Building Scale Increase (`scale = [0.975, 0.975, 0.975]`) & Safe Outer Position Z = -1.38m**:
     - `src/client/3d/procedural_building.tsx`: `STANDARD_LOT_TRANSFORM` đặt `position: [0, 0.16, -1.38]`, `scale: [0.975, 0.975, 0.975]`.
     - Mép trong chân đế công trình tại `-1.38 + (0.55 * 0.975) / 2 = -1.112m`, đảm bảo nằm hoàn toàn 100% ngoài mép trên thẻ cờ `Z = -1.08m` (khoảng lùi an toàn 3.2cm trên thềm promenade).
  3. **Smart Corner Splay Rebalance (Khoảng cách D >= 0.85m, Corridor >= 0.35m)**:
     - 8 ô giáp góc (`1, 9, 11, 19, 21, 29, 31, 39`) áp dụng độ trượt ngang `lx = ±0.24m`. *(Góc xoay rotationY = ±0.25 rad đã được bãi bỏ theo Gotcha #90)*.
     - Khoảng cách Euclid giữa chân đế 2 ô góc đạt D >= 0.85m, khoảng hở an toàn thực tế đạt Clearance = 0.397m >= 0.35m, triệt tiêu 100% va quệt hình học tại 4 góc vuông.

---

### 90. [3D/RENDER/LAYOUT] Bất Biến Góc Vuông Thẳng Trực Giao 90° (Zero Rotation Tilt) & Tái Cấu Trúc Hoạt Cảnh Sa Bàn Chuẩn Cảnh Quan Đời Thực (IMP-67)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Xoay Nghiêng Góc Thừa Thãi (Unnecessary Corner Rotation Tilt)*: Trong IMP-65 và IMP-66, 8 ô giáp góc (1, 9, 11, 19, 21, 29, 31, 39) được gán góc xoay splay ~14.3° (`rotationY = ±0.25 rad`) với giả định là cần nghiêng để tránh va chạm. Tuy nhiên, góc xoay này làm các tòa nhà bị xiên xẹo, mất đi vẻ đẹp quy hoạch đường phố trực giao vuông vắn tự nhiên của đô thị hiện đại.
  2. *Toán Học Định Vị Trực Giao Vừa Vặn Không Nghiêng*: Khi kiểm tra toán học với khổ đế 0.536m x 0.536m (scale 0.975x), vị trí Z = -1.38m và độ trượt ngang lx = ±0.24m, việc đặt góc xoay thẳng góc **`rotation = [0, 0, 0]`** vẫn giữ cho:
     - Biên X của Cell 1: [6.692, 7.228]
     - Biên X của Cell 39: [7.352, 7.888]
     - Khoảng cách mép trực giao: 7.352 - 7.228 = 0.124m = 12.4cm > 10cm khoảng trống an toàn.
     - Khoảng cách Euclid giữa 2 tâm: 0.933m > 0.85m, hành lang chéo: 0.397m > 0.35m.
     - Hai tòa nhà hoàn toàn vừa vặn, đứng thẳng tắp song song với mặt đường mà 0% va chạm hình học (zero mesh clipping).
  3. *Bẫy Hoạt Cảnh Khu Trò Chơi (Carnival / Playground Slop Trap)*: Chi tiết vòng đu quay hội chợ (Ferris Wheel) với các cabin nhiều màu sắc sặc sỡ, sân vận động đồ chơi với cột đèn pha, và tia laser vũ trường quét trên tháp Bitexco đã biến trung tâm sa bàn thành một khu vui chơi tẻ nhạt, làm mất dáng dấp của cảnh quan sông nước đô thị ngoài đời thật.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Bất Biến Thẳng Góc Trực Giao 90° (`rotation: [0, 0, 0]`)**:
     - Toàn bộ 8 ô tiếp giáp góc (`1, 9, 11, 19, 21, 29, 31, 39`) trong `src/client/3d/procedural_building.tsx` (`CORNER_SPLAY_TRANSFORMS`) BẮT BUỘC đặt `rotation: [0, 0, 0]`.
     - Tuyệt đối không xoay nghiêng công trình ở các góc 90°. Duy trì độ trượt ngang lx = ±0.24m để giữ khoảng đệm trực giao >= 10cm và không che lấp tầm nhìn.
  2. **Cảnh Quan Sông Nước & Đô Thị Đương Đại Đời Thực (`DioramaWaterfrontPark` & `DioramaCivicCenter`)**:
     - Triệt tiêu 100% các yếu tố hội chợ/vui chơi trẻ em (`diorama_ferris_wheel.tsx`, `diorama_stadium.tsx`, tia laser Bitexco).
     - Triển khai `DioramaWaterfrontPark` (Công viên cảnh quan ven sông Bến Bạch Đằng): Lối đi dạo lát đá granite xám `#CBD5E1`/`#94A3B8`, thảm cỏ xanh mướt `#166534`/`#15803D`, ghế đá công viên, cây xanh nhiệt đới và bến tàu thủy Saigon Waterbus `#0284C7`/`#F8FAFC`.
     - Triển khai `DioramaCivicCenter` (Trung tâm Văn hóa - Triển lãm đương đại): Khối đế giật cấp đá travertine `#334155`/`#E2E8F0`, đại sảnh kính Low-E sapphire `#0284C7`, vườn thượng uyển trên mái và hồ nước phản chiếu (reflecting pool).

---

### 91. [3D/LAYOUT/URBAN] Bất Biến Khoảng Đệm Di Sản Nhà Thờ Đức Bà (Breathing Room >= 1.0m) & Triệt Tiêu Khối Xanh Đậm Cao Ốc Tài Chính (IMP-68)
> ⚠️ **[LƯU Ý TIẾN HÓA / THAY THẾ]**: Việc bổ sung Bưu điện Trung tâm Sài Gòn và cấu hình 16 tháp cao ốc trong Gotcha này đã được **thay thế bởi Gotcha #92 (IMP-69)** (gỡ bỏ hoàn toàn component Bưu Điện để tránh che chắn mặt tiền Nhà Thờ Đức Bà, đồng thời giảm số lượng cao ốc từ 16 xuống 10 tháp bố cục chữ U quanh Bitexco).
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Bủa Vây Di Sản (Cathedral Spatial Congestion Trap)*: Cụm 24 nhà phố Chợ Lớn (`CHO_LON_SHOPHOUSES`) và biệt thự vườn trước đây xếp thành lưới bao vây sát sạt Nhà Thờ Đức Bà (`[-4.3, 3.65]`), khiến không gian di sản bị nghẹt thở, mất đi tính trang nghiêm và tương phản hoàn toàn với cảnh quan thực tế của Quảng trường Công xã Paris.
  2. *Bẫy Khối Xanh Đậm Đơn Điệu (Monolithic Blue Wash Anti-Pattern)*: 16 tháp cao ốc tài chính Tây Bắc bị phủ một lớp vật liệu `color="#0284C7"` solid wash kết hợp hoa văn gradient xanh dương đậm, biến cả cụm cao ốc thành các khối chữ nhật xanh lè đặc quánh như pin ắc quy hoặc domino đồ chơi, làm hỏng cảm nhận chân thực của sa bàn đô thị.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Bán Kính Giải Phóng Di Sản >= 1.0m & Quần Thể Công Xã Paris (`Cathedral Breathing Clearance Invariant`)**:
     - Toàn bộ 24 căn shophouse Chợ Lớn dời ra 2 phân khu di sản chuyên biệt: Phố Nam (16 căn tại `Z = 4.85` & `5.55`) và Phố Tây (8 căn tại `X = -5.5`). Khoảng cách Euclid tới tâm Nhà Thờ Đức Bà luôn đạt `D >= 1.20m > 1.0m`.
     - Xóa bỏ hoàn toàn căn biệt thự vườn cũ tại `[-4.5, 0.025, 4.2]`.
     - Bổ sung Quảng trường Công xã Paris (`cong-xa-paris-plaza`) với vườn hoa tròn, thảm cỏ xanh `#166534`/`#15803D`, bệ đá cẩm thạch Tượng Đức Mẹ Hòa Bình `#CBD5E1`/`#F8FAFC`.
     - Bổ sung Bưu điện Trung tâm Sài Gòn (`saigon-central-post-office`) tại `[0.72, 0, 0.75]` với tường vàng Pháp cổ kính. *(Đã gỡ bỏ theo Gotcha #92 để tôn vinh sự độc lập của Nhà Thờ Đức Bà)*.
  2. **Vật Liệu Kiến Trúc Đương Đại Trung Tính (Zero Blue Wash SSOT)**:
     - Triệt tiêu 100% `color="#0284C7"` trên thân các tháp cao ốc *(đã rút gọn còn 10 tháp theo Gotcha #92)*, thay bằng vật liệu trung tính `color="#FFFFFF"`, roughness 0.2, metalness 0.3.
     - Nền texture chuyển sang đá travertine / khung nhôm pearl gray `#F8FAFC`, `#E2E8F0`, `#CBD5E1` và kính Low-E phản quang bầu trời thiên thanh `#93C5FD`, `#BAE6FD`, `#E0F2FE` kèm nan mullions mảnh `#475569`.
     - Bổ sung tầng giật cấp vườn chân mây `#15803D` và đỉnh chóp kim loại mạ champagne `#F59E0B` tạo nhịp điệu skyline sang trọng.

---

### 92. [3D/LAYOUT/URBAN] Bất Biến Độc Lập Di Sản Nhà Thờ Đức Bà & Quy Hoạch 10 Tòa Tháp Bao Quanh Tháp Bitexco Landmark (IMP-69)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Tiền Cảnh Che Chắn Di Sản (Heritage Frontal Occlusion Trap)*: Đặt Bưu điện Trung tâm Sài Gòn tại `[0.72, 0, 0.75]` ngay trước mặt tiền Nhà Thờ Đức Bà làm che chắn tầm nhìn, gây xung đột không gian và mất đi tính trang nghiêm, khoáng đạt của cụm di sản Công xã Paris.
  2. *Bẫy Ma Trận Cao Ốc Dày Đặc (Dense Monolithic Block Trap)*: Cụm 16 tòa cao ốc xếp lưới hộp vuông phẳng chật chội, thiếu chiều sâu thị giác và làm lu mờ Tháp Tài chính Bitexco – biểu tượng skyline hiện đại của thành phố.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Tôn Vinh Độc Lập Nhà Thờ Đức Bà & Quảng Trường Công Xã Paris (`Cathedral Standout Invariant`)**:
     - Gỡ bỏ hoàn toàn component `SaigonCentralPostOfficeFallback` và thẻ DOM `data-testid="saigon-central-post-office"`.
     - Nhà Thờ Đức Bà đứng uy nghiêm, độc lập giữa thềm đá di sản lát gạch bông Đông Dương và Quảng trường Công xã Paris (`cong-xa-paris-plaza`) với Tượng Đức Mẹ Hòa Bình bằng cẩm thạch trắng.
  2. **Tháp Bitexco Financial Landmark Trung Tâm (`Bitexco Hero Centerpiece Invariant`)**:
     - Tọa độ root group: `position={[-4.5, 0.16, -4.4]}` (inner group `[0, 0, 0]`).
     - Tôn vóc dáng bề thế vươn cao: Thân tháp kính sapphire `radiusTop: 0.30, radiusBottom: 0.48, height: 2.2`, đài quan sát Saigon Skydeck `Y = 1.48`, sân đỗ trực thăng Helipad `(x: 0.38, y: 1.68, z: 0, r: 0.22)`, đỉnh tháp búp sen & kim thu lôi `Y = 2.45..2.85`, đèn chớp cảnh báo hàng không đỏ `Y = 2.95`.
  3. **Quy Hoạch Cụm 10 Tòa Tháp Giật Cấp Hình Chữ U Bao Quanh Bitexco (`Framed Skyline Invariant`)**:
     - Giảm số lượng từ 16 tháp xuống đúng 10 tháp (`HIGHRISE_CONFIGS.length === 10`).
     - Bố cục hình chữ U mở về hướng sông Sài Gòn: Hàng 1 Bắc (2.3m - 2.6m) làm phông nền -> Cánh Tây & Cánh Đông (1.6m - 2.0m) -> Hàng Nam tiền cảnh (1.3m - 1.5m).
     - Khoảng cách từ Bitexco đến toàn bộ 10 tòa xung quanh đạt `D >= 1.0m > 0.85m`, tạo quảng trường tài chính nội khu thông thoáng, mở rộng tầm nhìn cho camera từ mọi góc quan sát sa bàn.

---

### 93. [3D/URBAN/TEXTURE] Bất Biến Quy Hoạch Đô Thị Đời Thực TP.HCM, Triệt Tiêu Chiếu Sáng Kính Vàng, Đại Tu Tranh Nền Ô Cờ & Hành Lang Đông Thoáng Đãng (IMP-70)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Bến Thành Xâm Lấn Mặt Tiền Nhà Thờ Đức Bà*: Đặt mô hình Chợ Bến Thành ngay trước Nhà Thờ Đức Bà (`position={[0.2, 0, -0.7]}`) gây phi lý về địa lý TP.HCM đời thực (ngoài đời Chợ Bến Thành cách Nhà Thờ Đức Bà ~1.2km) và che khuất mặt tiền chính diện của Thánh đường cổ kính.
  2. *Bẫy Chiếu Sáng Kính Vàng & Nón Đèn Phát Quang (Yellow Glow Cone Slop)*: Dùng nón ánh sáng vàng `coneGeometry` (`#FEF08A`) và cầu phát sáng vàng trên đỉnh Bitexco cùng mái tôn vàng `#F59E0B` trên cầu đường sắt khiến cảnh quan đô thị bị giả tạo, biến thành đồ họa hoạt hình rẻ tiền.
  3. *Bẫy Chặn Hành Lang Đông Hướng Sông Sài Gòn*: Các tòa tháp tài chính (tower-6, tower-7) nằm trong dải `X >= -3.8` và `Z >= -4.8 && Z <= -3.6` chắn mất luồng gió và tầm nhìn thông thoáng từ trung tâm tài chính ra sông Sài Gòn.
  4. *Bẫy Mờ Nhạt Tranh Nền Ô Cờ & Mock Canvas Context*: 4 ô góc (GO, Audit, Resort, Tax Order) và các ô thẻ bài sự kiện thiếu tranh minh họa bản địa đặc sắc. Đồng thời, khi vẽ hoa văn Đông Sơn với `ctx.arc`, các bộ mock canvas 2D trong kiểm thử nếu thiếu phương thức `arc` sẽ gây sập toàn bộ test suite.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Quy Hoạch Mặt Tiền Nhà Thờ Đức Bà Đời Thực (`Cathedral Plaza SSOT`)**:
     - Gỡ bỏ hoàn toàn Chợ Bến Thành (`BenThanhProceduralFallback` và `SafeGLTFModel` benThanh) khỏi cụm Nhà Thờ Đức Bà.
     - Giữ nguyên vẹn Nhà Thờ Đức Bà và mở rộng Quảng trường Công xã Paris (`cong-xa-paris-plaza`) với thảm cỏ hoa viên tròn và Tượng Đức Mẹ Hòa Bình bằng cẩm thạch trắng.
  2. **Triệt Tiêu Hoàn Toàn Vệt Sáng Vàng & Đèn Nón Nhân Tạo**:
     - Gỡ bỏ nón ánh sáng vàng `coneGeometry args={[0.3, 1.4, 8, 1, true]}` và cầu phát quang đỉnh tháp Bitexco (`spireGlowRef`). Giữ lại đèn pha lê tinh tế và đèn cảnh báo hàng không đỏ `#EF4444`.
     - Thay thế mái kim loại vàng `#F59E0B` trên cầu đường sắt bằng giàn thép nhám xám tự nhiên `#334155`/`#475569` và bổ sung tà vẹt gỗ óc chó đậm `#78350F`.
  3. **Hành Lang Đông Mở Rộng Hướng Sông Sài Gòn (`East River Corridor Clearance Invariant`)**:
     - Điều chỉnh vị trí các tòa tháp phía Đông (tower-6 dời về Z = -5.2, tower-7 dời về Z = -3.0) để toàn bộ vùng không gian `X >= -3.8 && Z >= -4.8 && Z <= -3.6` hoàn toàn không có tòa nhà nào án ngữ, mở toang tầm nhìn ra sông Sài Gòn.
  4. **Đại Tu Tranh Nền 4 Ô Góc & Thẻ Bài Đặc Biệt (`Corner & Special Tile Canvas Art`)**:
     - Ô 0 (Khởi Hành): Nền giấy ngà hoàng gia `#FAF6ED`, họa tiết Trống Đồng Đông Sơn, khung viền mạ vàng kép, dải ruy băng và khay thưởng ngọc lục bảo.
     - Ô 10 (Kiểm Toán): Sảnh kiểm toán đá hoa cương trang nghiêm `#141E33`, hàng cột Ionic, khiên bảo an và cán cân công lý, phân định rõ khu Vào Thăm và Tạm Giam.
     - Ô 20 (Nghỉ Dưỡng): Vịnh biển ngọc Phú Quốc `#0D9488`, bãi cát san hô trắng, hàng dừa nghiêng bóng và bungalow sàn gỗ.
     - Ô 30 (Lệnh Thu Thuế): Chiếu thư thanh tra hoàng gia nền cẩm thạch đen `#1E1B4B`, viền son chu sa `#E11D48`, con dấu triện đỏ, cuộn sắc lệnh và trát điều tra thuế.
     - Thẻ sự kiện Cơ Hội, Thị Trường, Lệ Phí Đất, Sàn HOSE bổ sung huy hiệu minh họa và viền thẻ nhận diện xúc giác.
  5. **Mã Nguồn Tách Module Dưới 500 LOC & Mock Canvas Resilience**:
     - Tách toàn bộ hàm vẽ 4 góc vào `src/client/3d/corner_tile_art.ts` để khống chế `tile_texture_generator.ts` ở ~280 LOC (ngưỡng an toàn < 500 LOC).
     - Sử dụng toán tử tùy chọn `ctx.arc?.(...)` phòng thủ khi chạy trên môi trường test headless có Canvas Context mock bán phần.

---

### 94. [3D/LIGHTING/SKYLINE] Bất Biến Chống Lóa Ban Ngày, Khối Đế Bitexco Plaza, 4 Trường Phái Cao Ốc & Giảm 50% Lưu Lượng Xe (IMP-71)
- **Bối cảnh & Bẫy thực tế**:
  1. *Chói Lóa Quang Học Ban Ngày (Daytime Specular Bleach)*: `sunIntensity = 0.92` kết hợp `roughness = 0.96` và viền chữ mỏng (2.5px) gây lóa mạnh trên bề mặt ngà, làm mờ tên các ô cờ khi nhìn từ camera tổng quan sa bàn.
  2. *Cao Ốc Xếp Hộp Đồng Dạng (Monolithic Domino Box Slop)*: 10 tòa cao ốc xung quanh Bitexco dùng chung một hình học `boxGeometry` trơn tuột, thiếu vóc dáng quy hoạch của kiến trúc sư đô thị. Chân tháp Bitexco cắm thẳng xuống đất mà không có khối đế thương mại (Podium) và quảng trường đón tiếp (Plaza).
  3. *Ùn Tắc Sa Bàn Vi Giao Thông (Micro-Traffic Visual Clutter)*: Đội xe 7 chiếc trên hai làn đường và các xe tĩnh đậu dọc vỉa hè chiếm dụng không gian thị giác, gây bão hòa chuyển động trên bàn cờ.
  4. *Tranh Nền Ô Đặc Biệt & 4 Góc*: Các ô sự kiện và 4 góc cờ cần tranh minh họa WebP độc bản kết hợp với lớp phủ canvas thủ công có chiều sâu, thay cho các khối màu phẳng đơn điệu.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Triệt Tiêu Hoàn Toàn Lóa Mắt (`Anti-Glare Daylight Invariant`)**:
     - `TIME_OF_DAY_PRESETS.day`: `sunIntensity: 0.78` (<= 0.80), `ambientColor: '#F0F9FF'`, `ambientIntensity: 0.18`, `hemiIntensity: 0.12`.
     - `board_tile.tsx`: Bề mặt ô cờ đạt `roughness: 0.98` và `metalness: 0.0`.
     - `tile_texture_generator.ts`: Stroke text viền than đen `#050814` với `lineWidth: 3.5`, đảm bảo độ tương phản WCAG AAA.
  2. **Quy Hoạch Khối Đế Bitexco Podium & Quảng Trường Bitexco Plaza (`Bitexco Civic Base Invariant`)**:
     - `diorama_skyline.tsx`: Bổ sung `data-testid="bitexco-podium"` (khối đế thương mại vát cong 5 tầng, mái đón canopy) và `data-testid="bitexco-plaza"` (quảng trường đá granite xám `#CBD5E1`, bồn cây hoa viên đối xứng, đài phun nước mini).
  3. **4 Trường Phái Cao Ốc Quy Hoạch Framing Bitexco (`4 Highrise Typologies Invariant`)**:
     - `diorama_highrise_blocks.tsx`: Phân bổ 10 tháp vào 4 trường phái kiến trúc:
       * `highrise-prismatic`: Tháp lăng kính vát góc Vietcombank (tower-1, 5, 10).
       * `highrise-stepped`: Tháp đôi giật cấp vườn treo Keppel / Saigon Centre (tower-3, 7, 8).
       * `highrise-curved`: Tháp mặt kính uốn cong Marina (tower-4, 6).
       * `highrise-crowned`: Tháp chóp vương miện Art Deco Times Square (tower-2, 9).
     - Vật liệu trung tính `#FFFFFF`, vườn chân mây `#15803D`, kim loại champagne `#F59E0B`, triệt tiêu 100% màu xanh dương `#0284C7` trên cao ốc tài chính.
  4. **Giảm 50% Lưu Lượng Xe Sa Bàn (`Micro-Traffic Fleet Decoupling`)**:
     - `MICRO_VEHICLES`: Cắt giảm xuống đúng 3 xe (tối đa 4 xe): Làn ngoài gồm `bus-yellow` (offset 0.10) và `sedan-blue` (offset 0.65, khoảng cách 0.55 >= 0.20); Làn trong gồm `taxi-green` (offset 0.40).
     - `diorama_microlife.tsx`: Gỡ bỏ 2 xe hơi cá nhân tĩnh ven vỉa hè (`#DC2626` và `#16A34A`), chỉ giữ lại xe buýt vàng tại trạm dừng và ca-nô trên sông.
  5. **Đại Tu Tranh Nền Nghệ Thuật Cho Toàn Bộ 4 Góc & Ô Đặc Biệt**:
     - `tile_assets.ts`: `READY_TILES` kích hoạt đầy đủ 12 ô đặc biệt `0, 2, 4, 7, 10, 17, 20, 22, 30, 33, 36, 38`.
     - `tile_texture_generator.ts` & `corner_tile_art.ts`: `hasTileArt` trả về `true` cho toàn bộ 12 ô này, nạp ảnh WebP `tile_XX.webp` đồng thời duy trì fallback canvas 2.5D có chiều sâu.

---

### 95. [3D/RENDER/UI] Bất Biến Máy Quay Framing Offset Desktop Chống Che Khuất Bàn Cờ, Đại Tu Panel Sảnh Chờ Chuẩn Clean & Modern & Modal Hướng Dẫn Chơi Toàn Diện (IMP-72)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Che Khuất Bàn Cờ Trên Desktop (Desktop Board Occlusion Trap)*: Bàn cờ khi hiển thị trên màn hình Desktop (tỷ lệ 16:9) với camera pre_match cũ căn giữa tâm (0,0,0) khiến góc Đông Nam (các ô 18–22) bị Panel Sảnh Chờ (`PreMatchDeck`) cánh phải che khuất một phần, làm giảm tính trực quan của sa bàn 3D.
  2. *Bẫy Quá Tải Thông Tin & Màu Sắc Cũ Kỹ (Lobby Clutter & Visual Heaviness Trap)*: Panel sảnh chờ cũ nhồi nhét khối tóm tắt thể lệ thi đấu tĩnh (`lobby-rules-card`) chiếm diện tích chiều dọc, dùng màu cyan/vàng bóng baroque không ăn nhập với phong cách tối giản, hiện đại của game cờ bàn số.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Desktop Camera Framing Offset Invariant**:
     - `CAMERA_CONFIG.pre_match` BẮT BUỘC đặt tại: `position: [13.8, 16.2, 8.6]`, `target: [1.8, 0.0, -3.4]`, `fov: 41`, `speed: 3.2`.
     - Duy trì véc-tơ đối xứng đẳng cự 45° (`deltaX = deltaZ = 12.0`).
     - Bàn cờ được căn chuẩn lọt trọn vẹn vào 65% khoảng trống bên trái màn hình, hiển thị 100% cả 40 ô cờ, góc Đông cách mép Panel > 150px.
  2. **Giao Diện Sảnh Chờ Sạch & Hiện Đại (Clean & Modern Lobby Invariant)**:
     - Panel `PreMatchDeck` thu gọn bề rộng từ 400px về `350px` (`sm:w-[350px] max-w-[350px]`). Nền trắng mờ `bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xl rounded-2xl p-4`.
     - Gỡ bỏ hoàn toàn thẻ `lobby-rules-card` khỏi DOM. Nút chính `start-game-btn` hoặc `toggle-ready-btn` chiếm trọn 100% bề ngang footer (`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-sm text-sm uppercase tracking-wide`).
     - Nút thoát sảnh bố trí tinh tế ở góc phải tiêu đề (`data-testid="leave-lobby-btn"`).
     - Thẻ `PlayerSlotCard` loại bỏ 100% màu cyan (`bg-cyan-600`, `border-cyan-800`, `bg-cyan-100`), thay bằng nút xanh cobalt phẳng `bg-blue-600` và badge xám trung tính `bg-slate-100 text-slate-700`.
  3. **Modal Hướng Dẫn & Thể Lệ Game Chuyên Biệt (`GameRulesModal`)**:
     - Tạo component `GameRulesModal` (`src/client/ui/modals/game_rules_modal.tsx`) với 3 tab: Quy Tắc Cốt Lõi, Danh Mục Thẻ & Ô Cờ, và Cơ Chế Đặc Biệt.
     - Đầy đủ thông tin về vốn khởi điểm (15.000 Tr.), lương GO (+2.000 Tr.), xúc xắc đôi, 30 vòng, 28 BĐS, 4 trạm giao thông, 2 tiện ích, HOSE, Kiểm Toán, Đấu Giá 50%, Thế Chấp 50%, Phá Sản.

---

### 96. [3D/CAMERA/RESPONSIVE] Bất Biến Ống Kính Telephoto Kiến Trúc 24°, Thích Ứng Tự Động Theo Tỷ Lệ Màn Hình & Tự Do Điều Khiển Góc Nhìn Sa Bàn (IMP-73)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Méo Quang Học Phối Cảnh & Cắt Đáy Bàn Cờ (Perspective Fisheye & Bottom Clipping Trap)*: Khi sử dụng góc mở ống kính rộng (FOV 40°/41°), hiệu ứng phối cảnh góc rộng làm phình to các ô gần camera (Ô 00 GO, Ô 39 TP.HCM, Ô 01 Cần Thơ) và thu nhỏ các ô xa (Ô 20 Đảo Quân Sự), khiến cạnh đáy bàn cờ bị tràn ra ngoài màn hình ở tỷ lệ 16:9 và trên các độ phân giải hạn chế chiều cao (1024x554, 1440x900).
  2. *Bẫy Cưỡng Bức Kéo Lùi Camera (Snapback Frustration Trap)*: Logic cũ tự động ép camera lerp trở về góc nhìn mặc định sau 1.5s không tương tác (`timeSinceInteraction > 1500`), tước đoạt quyền tự do ngắm nhìn sa bàn của người chơi và gây giật hình khó chịu khi đang quan sát tiểu cảnh kiến trúc.
  3. *Bẫy Khuyết Điểm Thích Ứng Đa Tỷ Lệ (Fixed Aspect Frustum Blindness)*: Không có cơ chế tự động bù trừ khoảng cách khi khung nhìn bị co hẹp tỷ lệ chiều ngang so với chiều dọc (`aspect < 1.77`).
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Architectural Telephoto 24° & Optical Center Offset Invariant**:
     - Cả hai chế độ `CAMERA_CONFIG.overview` và `CAMERA_CONFIG.pre_match` chuyển đổi sang ống kính telephoto tiêu cự dài chuyên dụng: `fov: 24`, `position: [30.0, 33.0, 30.0]`, `target: [1.5, 0.0, 1.5]`.
     - Cự ly xa gấp đôi dọc theo véc-tơ chéo đẳng cự 45° kết hợp bù điểm nhìn +1.5 đơn vị về góc Đông Nam giúp triệt tiêu méo quang học, bảo đảm cả 4 góc (00, 10, 20, 30) nằm trọn trong vùng an toàn NDC `[-0.85, 0.85]`.
  2. **Responsive Aspect-Ratio Frustum Fit Invariant**:
     - Hàm `calculateResponsiveCameraDistance(aspect: number, baseDistance = 32): number` tự động điều chỉnh cự ly lùi camera khi tỷ lệ khung hình `aspect < 1.77` theo tỷ lệ nghịch `safeBase * (1.77 / safeAspect)` (với floor an toàn 0.75), bảo đảm bàn cờ không bao giờ bị cắt viền bất kể kích thước cửa sổ.
  3. **Free Orbit & One-Touch Reset Control Invariant**:
     - Loại bỏ hoàn toàn điều kiện snapback `timeSinceInteraction > 1500`. Khi người dùng kéo chuột xoay bàn cờ, camera giữ nguyên góc nhìn tĩnh. Chỉ tự động lerp khi có hành động game (`isActionOngoing`) hoặc người dùng kích hoạt reset.
     - Cung cấp phương thức `window.__resetCameraToDefault()` và nút `data-testid="reset-camera-btn"` (`🎯 Góc Chuẩn`) trên header thanh công cụ sảnh chờ, cho phép người chơi khôi phục góc nhìn chuẩn 4 góc tức thì chỉ với 1 chạm.

---

### 97. [UI/CRAFT/LOBBY] Bất Biến Triệt Tiêu Nút Rời Sảnh Khỏi Bảng Sảnh Chờ PreMatchDeck (IMP-74)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Thao Tác Nhầm Thoát Sảnh Đột Ngột (Accidental Lobby Exit Trap)*: Việc bố trí nút bấm "✕ Rời Sảnh" ngay sát góc phải tiêu đề của thẻ `PreMatchDeck` khiến người chơi hoặc host dễ chạm nhầm khi đang điều chỉnh góc nhìn hoặc quan sát trạng thái phòng.
  2. *Bẫy Phân Rã Luồng Trải Nghiệm (Fragmented Session Disconnect)*: Nút "✕ Rời Sảnh" kích hoạt `resetLobby()` đột ngột mà không có modal xác nhận hay đồng bộ trạng thái socket mềm dẻo, gây ngắt kết nối session ngoài ý muốn. Khi người dùng muốn rời phòng, việc điều hướng trình duyệt hoặc thoát qua flow chủ động chuẩn bảo đảm tính toàn vẹn trạng thái tốt hơn nhiều so với nút đóng chắp vá trên header thẻ chờ.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Purge Leave Lobby Button SSOT**: Gỡ bỏ 100% phần tử `data-testid="leave-lobby-btn"`, nhãn "Rời Sảnh" / "✕ Rời Sảnh" và `aria-label="Rời sảnh chờ"` khỏi component `PreMatchDeck`.
  2. **Clean Header & Badge Balance**: Phần đầu thẻ `PreMatchDeck` chỉ giữ nguyên khối định danh tiêu đề `🏝️ Sảnh Chờ` và huy hiệu trạng thái slot `SẴN SÀNG (4/4)` / `ĐANG CHỜ (x/4)` sạch đẹp, trực quan, không bị phân tâm bởi nút thoát.
  3. **YAGNI Selector Cleanliness**: Xóa bỏ hoàn toàn khai báo và selector `resetLobby = useLobbyStore((s) => s.resetLobby)` khỏi `pre_match_deck.tsx` khi không còn sử dụng.

### 98. [ARCH/REFACTOR] Facade Re-Export Pattern — Modular Decomposition An Toàn (IMP-64)
- **Bối cảnh**: Khi tách file lớn thành sub-modules, tất cả consumer imports hiện tại phải không bị gãy.
- **Bất biến**:
  1. **Facade Barrel**: File gốc PHẢI re-export 100% public symbols từ sub-modules bằng `export { ... } from './sub_module.js'`. Không xóa export nào khi refactor.
  2. **Import + Export kép cho internal use**: Nếu file gốc tự dùng symbol từ sub-module (gọi hàm trong cùng file), phải khai báo cả `import` lẫn `export` riêng biệt — TypeScript `export { x } from '...'` không tạo local binding.
  3. **Zero Logic Change**: Code di chuyển verbatim. Không rename biến, không thêm guard, không kết hợp dòng.
  4. **Test ngay sau mỗi slice**: Chạy `npm test` + `npm run test:chaos` trước khi sang slice tiếp theo.
  5. **lint_slop.mjs phân biệt Soft vs Hard**: Soft warning (300–400 LOC) không phải lỗi — chỉ Hard Violation (>400 LOC) cần fix ngay. Target IMP-64: 0 Hard Violations.
- **File boundary đã tách (IMP-64)**:
  - `room_manager.ts` → `room_manager_lifecycle.ts` + `room_manager_queries.ts`
  - `wss_server.ts` → `wss_connection_handler.ts` + `wss_intent_handler.ts`
  - `apply_delta.ts` → `apply_delta_players.ts` + `apply_delta_cells.ts`
  - `main.tsx` → `use_app_session.ts` + `use_app_turn_controls.ts`
  - `auction_3d_stage.tsx` → `auction_particle_engine.ts` + `use_auction_card_animation.ts`


### 99. [OPS/ENV] Vite 6 + @tailwindcss/vite: Cam NODE_ENV trong .env va Cam Inline Style Block (IMP-65)
- **Van de 1 - NODE_ENV trong .env**: Vite 6 tu dong set NODE_ENV=production khi chay  ite build. Neu .env khai bao NODE_ENV=production, Vite emit warning va IGNORE no. Giai phap: xoa khoi .env, dung cross-env NODE_ENV=production trong npm start script.
- **Van de 2 - Inline <style> trong index.html**: @tailwindcss/vite v4 lam gay [vite:html-inline-proxy] error khi index.html co <style> block inline. Giai phap: chuyen tat ca CSS vao file .css rieng.
- **Bat bien**: .env chi chua server config variables (PORT, WSS_PORT, GRACE_PERIOD_MS). NODE_ENV duoc cung cap qua: Dockerfile ENV, docker-compose environment:, hoac npm script cross-env.
- **Docker an toan**: ENV NODE_ENV=production trong Dockerfile L12 + environment: trong docker-compose.yml la nguon chuan ly duoc - khong can .env.

### 100. [NET/TEST] Bất Biến Xả Hàng Đợi Broadcast Khi Kiểm Thử Đo Rò Rỉ Đa Socket (IMP-66)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Gói Tin Tồn Đọng Gây Sai Lệch Phép Đo (Socket Buffer Residual Leak Trap)*: Khi kiểm thử cô lập phát sóng (Zero Cross-Talk E2E) giữa Room A và Room B bằng hàm lắng nghe định thời `collectForMs()`, các socket đối tượng (ví dụ Guest của Room B) có thể chứa sẵn các gói tin chưa đọc từ sự kiện trước đó (như broadcast `START_GAME` gửi `ROOM_STARTED + STATE_DELTA` tới toàn thể thành viên trong phòng).
  2. Nếu helper `setupRoom` chỉ `collectN()` trên socket hành động (Host) mà bỏ qua socket thụ động (Guest), các gói tin tồn đọng trong buffer nội tại của WebSocket client sẽ bị `collectForMs()` ở bài test sau quét trúng và báo cáo sai là rò rỉ chéo phòng (False-Positive Cross-Talk).
  3. Ngoài ra, nếu server test sử dụng `botTurnDelayMs` mặc định (1500ms), bot scheduler nội bộ của Room B có thể kích hoạt lượt đi tự động và phát `STATE_DELTA` ngay trong cửa sổ đo rò rỉ 600ms của Room A.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Broadcast Queue Draining Invariant**: Mọi thao tác gửi bản tin có tính chất broadcast (`START_GAME`, `INTENT` làm thay đổi trạng thái) trong test fixture/helper bắt buộc phải thu gom (`collectN` hoặc drain) đồng thời trên 100% các socket đã kết nối trong phòng đó qua `Promise.all` trước khi bàn giao quyền kiểm soát cho bài test đo rò rỉ.
  2. **Scheduler Isolation Invariant**: Trong các bài test mạng đo lường rò rỉ gói tin hoặc độ trễ tĩnh, instance `WssServer` của test phải được khởi tạo với `botTurnDelayMs: 30_000` (hoặc vô hiệu hóa bot tự động) để triệt tiêu hoàn toàn nhiễu ngẫu nhiên từ background timers.

---
