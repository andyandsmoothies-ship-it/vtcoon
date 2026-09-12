# VTCOON DOMAIN GOTCHAS & EDGE CASES

Tài liệu lưu trữ các bẫy nghiệp vụ thực chiến rút ra qua từng lát cắt (Tầng 3 - Progressive Disclosure).

---

### 1. Market Modifiers Lifecycle & Scope (Slice 04)
- **Bẫy nghiệp vụ**: Khi duyệt `Room.activeModifiers` để tính tiền thuê (`handleLanding`), không được chỉ kiểm tra loại thẻ (`m.type`). Ngoài ra, không được suy giảm modifier (`decayModifiers`) ở mỗi lượt đơn lẻ.
- **Ràng buộc cứng**:
  1. `m.remainingRounds > 0`: Tránh áp dụng hiệu ứng khi bão/thẻ đã hết hạn.
  2. `m.affectedCells.includes(cellIndex)`: Không kiểm tra mảng hằng số tĩnh vì modifier có thể chỉ tác động cục bộ.
  3. Chu kỳ suy giảm: `decayModifiers()` chỉ được gọi khi hoàn thành trọn vẹn 1 vòng chơi (Round), tức khi lượt chuyển về người chơi đầu tiên (`currentPlayerIndex === 0`), bảo đảm mọi người chơi đều trải qua lượt chịu modifier.
- **Giải pháp**: Gọi hàm dùng chung `hasZeroRent()` / `calculateRent()` trong `property_manager.ts`; gọi `decayModifiers()` tại ranh giới round trong `room_manager.ts`.

---

### 2. Audit Bailout Lifecycle & FSM Phase Resolution (Slice 04)
- **Bẫy nghiệp vụ**: `handleBailOut()` không được vô điều kiện chuyển `room.phase` về `WaitingRoll`. Không có thẻ Cơ hội nào giải cứu Trạm Kiểm Toán.
- **Ràng buộc cứng**:
  1. Nếu người chơi bảo lãnh ở đầu lượt (chưa tung xúc xắc): chuyển về `WaitingRoll` để được tung xúc xắc di chuyển.
  2. Nếu người chơi bảo lãnh giữa lượt (sau khi dẫm ô 30 TaxOrder): phải chuyển về `PropertyManagement` để kết thúc lượt (`INTENT_END_TURN`), ngăn chặn vi phạm luật chơi (tung xúc xắc 2 lần trong 1 lượt).
  3. Thẻ thoát Trạm duy nhất là nộp tiền bảo lãnh 500 Tr. VNĐ (`INTENT_BAIL_OUT`). Thẻ `CC_DIPLOMATIC` KHÔNG dùng để thoát Trạm Kiểm Toán.
- **Giải pháp**: Quản lý trạng thái `rolledThisTurn` trong `RoomManager`.

---

### 3. Thẻ Ngoại Giao CC_DIPLOMATIC & Thẻ Thuế CC_TAX_AUDIT (Slice 04)
- **Bẫy nghiệp vụ**: Nhầm lẫn chức năng `CC_DIPLOMATIC` (thành thẻ ra tù) và `CC_TAX_AUDIT` (thành thẻ tống giam).
- **Ràng buộc cứng**:
  1. `CC_DIPLOMATIC`: Lưu vào `player.hand`. Khi dẫm BĐS đối thủ (`CellType.Property`), tự động tiêu thụ thẻ đưa vào `chanceDiscard` và đặt `rentAmount = 0` (miễn 100% chi phí tại mọi cấp công trình C0–C3 theo SSOT §V.2.4; không áp dụng cho Hạ tầng Giao thông hay Tiện ích).
  2. Thứ tự ưu tiên Zero-rent: Nếu ô đất chịu ảnh hưởng `MC_COASTAL_STORM` (Zero-rent), hiệu ứng bão miễn phí trước và bảo toàn `CC_DIPLOMATIC` trên tay (không tiêu thụ).
  3. `CC_TAX_AUDIT`: Phạt 200 Tr. VNĐ cho mỗi ô đất trống (Cấp 0) người chơi đang sở hữu nộp vào Kho bạc. Tuyệt đối không đưa người chơi vào Trạm Kiểm Toán (SSOT §I khẳng định không thẻ Cơ hội nào bắt vào Trạm). Chỉ đếm các ô BĐS (`CellType.Property`), bỏ qua Hạ tầng và Tiện ích.

---

### 4. Thẻ Vay Nợ Vốn Lưu Động CC_OVERDRAFT & CC_FREE_CREDIT (Slice 04)
- **Bẫy nghiệp vụ**: Chỉ ghi nhận thẻ vào `player.pendingDebts` mà không giải ngân tiền mặt.
- **Ràng buộc cứng**: Khi rút thẻ vay nợ, phải lập tức cộng tiền mặt khả dụng vào ví người chơi (`CC_OVERDRAFT` +3.000 Tr., `CC_FREE_CREDIT` +2.000 Tr.) song song với việc lưu ID thẻ vào `player.pendingDebts`.

---

### 5. Ghi tệp mã nguồn và Shell Escaping (Slice 05)
- **Bẫy kỹ thuật**: Sử dụng lệnh shell terminal (`echo`, `cat`, PowerShell `here-string @"..."@`, toán tử `>`) để ghi trực tiếp mã nguồn TypeScript/JavaScript.
- **Hậu quả**:
  1. PowerShell diễn giải ký tự backtick (`` ` `` - template literal trong TS) là ký tự escape của shell, dẫn đến vỡ chuỗi và lỗi `ParserError: Missing end-quote in string`.
  2. Lệnh redirect shell trên Windows PowerShell 5.1 tự động gán bảng mã UTF-16 LE thay vì UTF-8, làm hỏng tệp khi Vite/tsc đọc.
- **Giải pháp bắt buộc**: BẮT BUỘC sử dụng công cụ gốc chuyên dụng (`write_to_file` hoặc `replace_file_content`) với UTF-8 chuẩn; tuyệt đối không tạo/ghi tệp code qua dòng lệnh shell.

---

### 6. Bẫy thuộc tính nâng cấp Hạ tầng ETC và Tiện ích (Slice 05)
- **Bẫy nghiệp vụ**: Tự bịa trường trạng thái không có trong mô hình miền (như `etcActive`) khi kiểm tra điều kiện chuyển nhượng P2P hoặc thế chấp, dẫn đến việc phải ép kiểu `as any` để vượt qua bộ kiểm tra kiểu TypeScript.
- **Ràng buộc cứng**:
  1. Mô hình `PropertyState` trong `property_manager.ts` chỉ định nghĩa chuẩn hai cờ nâng cấp: `isETC?: boolean` (cho 4 ô đường sắt ETC 5, 15, 25, 35) và `isUpgradedUtility?: boolean` (cho 2 ô tiện ích 12, 28).
  2. Khi chuyển nhượng P2P (`executeP2PTrade`) hoặc thẩm định tài sản, bất động sản/tiện ích/hạ tầng chỉ được giao dịch ở trạng thái nguyên bản (Cấp 0, chưa kích hoạt ETC, chưa nâng cấp tiện ích). Điều kiện chặn bắt buộc: `(state?.level ?? 0) > 0 || Boolean(state?.isETC) || Boolean(state?.isUpgradedUtility)`.
  3. Tuyệt đối cấm sử dụng `as any` trong mã nguồn và bộ kiểm thử. Mọi mock trạng thái bất động sản phải tuân thủ nghiêm ngặt kiểu `PropertyState` / `PropertyStateMap`.
- **Giải pháp**: Sử dụng trực tiếp `state.isETC` và `state.isUpgradedUtility`, kiểm tra chuẩn kiểu và tái sử dụng `PropertyStateMap`.

---

### 7. Bẫy phong tỏa FSM trong InsolvencyPhase (Slice 05)
- **Bẫy nghiệp vụ**: Người chơi có số dư âm (`balance < 0`) vẫn có thể thực thi các hành động mua tài sản hoặc bấm kết thúc lượt để trốn tránh vỡ nợ, hoặc FSM tự động hoàn nguyên về `PropertyManagement` khi số dư vẫn còn âm.
- **Ràng buộc cứng**:
  1. Khi người chơi bị trừ tiền khiến `balance < 0`, FSM lập tức chuyển trạng thái sang `TurnPhase.InsolvencyPhase`.
  2. Trong `InsolvencyPhase`, FSM phong tỏa toàn bộ các Intent mua bán thông thường: chỉ chấp nhận duy nhất 2 Intent giải cứu dòng tiền là `INTENT_MORTGAGE` (thế chấp đất Cấp 0 lấy 50% thị giá) và `INTENT_DOWNGRADE` (hạ cấp công trình hoàn lại 50% chi phí xây).
  3. Cấm tuyệt đối `INTENT_BUY` và `INTENT_END_TURN`. Người chơi không được kết thúc lượt chừng nào chưa giải quyết xong khoản nợ âm.
  4. FSM chỉ được phép hoàn nguyên về pha trước đó (hoặc `PropertyManagement`) khi và chỉ khi số dư khả dụng thực tế được giải cứu đạt `>= 0`. Nếu hết tài sản để huy động mà vẫn âm, hệ thống sẽ kích hoạt cưỡng chế thanh lý hoặc tuyên bố phá sản (`BANKRUPTCY_DECLARED`).
- **Giải pháp**: Thiết lập chốt chặn nghiêm ngặt trong `intent_dispatcher.ts` và `insolvency_manager.ts`, kiểm tra điều kiện thoát pha dựa trên số dư thực tế.

---

### 8. Quy tắc phân cấp thứ tự ưu tiên vĩ mô Thẻ Thị Trường (Slice 05)
- **Bẫy nghiệp vụ**: Tính toán sai lãi suất thế chấp khi có nhiều thẻ vĩ mô cùng hoạt động trong `Room.activeModifiers`, đặc biệt là sự xung đột giữa chính sách kích cầu tín dụng và chính sách thắt chặt tiền tệ.
- **Ràng buộc cứng**:
  1. Lãi suất thế chấp mặc định khi vượt qua ô GO là 5% (`DEFAULT_INTEREST_RATE = 0.05`).
  2. Khi thẻ Tăng lãi suất `MC_RATE_HIKE` có hiệu lực, lãi suất tăng lên 10% (`RATE_HIKE_RATE = 0.10`).
  3. Khi thẻ Kích cầu tín dụng `MC_CREDIT_STIMULUS` có hiệu lực, lãi suất được miễn giảm về 0% (`0`).
  4. Quy tắc phân cấp ưu tiên: `MC_CREDIT_STIMULUS` (lãi suất 0%) chiếm ưu tiên tuyệt đối so với `MC_RATE_HIKE` (10%). Nếu cả hai thẻ cùng kích hoạt song song trong phòng chơi, chính sách hỗ trợ 0% phải được áp dụng trước để bảo vệ người vay theo quy định gói hỗ trợ khẩn cấp.
- **Giải pháp**: Hàm `getMortgageInterestRate()` kiểm tra `stimulusActive` trước; chỉ khi không có gói kích cầu mới xét đến `hikeActive`, và cuối cùng trả về lãi suất mặc định.

---

### 9. Thuế Chuyển Nhượng P2P Trading (Slice 05 - SSOT §I.22)
- **Bẫy nghiệp vụ**: Trừ thuế từ Bên Mua thay vì Bên Bán (Bên nhận tiền).
- **Ràng buộc cứng**:
  1. Theo SSOT §I.22: *"Bên nhận tiền phải đóng thuế giao dịch 5% (hoặc 20% khi có MC_ANTI_SPECULATE) trên tổng giá trị nhận được vào Kho bạc Nhà nước"*.
  2. Bên Mua trả đúng giá niêm yết/thỏa thuận: `buyer.balance -= price`. Điều kiện hợp lệ: `buyer.balance >= price`.
  3. Bên Bán thực nhận sau thuế: `seller.balance += price * (1 - taxRate)`.
  4. Kho bạc nhận: `room.treasury += price * taxRate`.
  5. Đẳng thức bảo toàn dòng tiền: `-price + price * (1 - taxRate) + price * taxRate = 0` (sai số 0 Tr. VNĐ).
- **Giải pháp**: Trong `validateP2PTrade` và `executeP2PTrade`, trích xuất thuế từ bên bán và chuyển vào kho bạc.

---

### 10. Vòng Đời Thẻ Sự Kiện Phải Khép Kín Consumer (Slice 04-05)
- **Bẫy nghiệp vụ**: Thẻ sự kiện chỉ được đẩy vào `Room.activeModifiers` (Producer) nhưng các hàm tính toán thế chấp/tiền thuê (Consumer) không đọc tới, tạo ra Dead Modifier.
- **Ràng buộc cứng**:
  1. Thẻ `MC_URBAN_PLANNING`: Khi thế chấp đất tại Hà Nội (31, 32, 34) và TP.HCM (37, 39), định giá đất tăng thêm 20% giá trị -> nhận 60% giá niêm yết thay vì 50%.
  2. Thẻ `MC_NIGHT_ECONOMY`: Tăng 100% doanh thu chỉ áp dụng cho BĐS Dịch vụ & Giải trí từ Cấp 1 trở lên. Ô đất trống Cấp 0 giữ nguyên mức phí cơ bản.
  3. Mọi thẻ bài biến cố khi sinh ra bắt buộc phải có ít nhất 1 bài test tích hợp chứng minh dòng tiền thực tế thay đổi khi dẫm chân lên ô đất.

---

### 11. Đồng Bộ Đa Tầng Cho Trạng Thái Mới (Vertical Slice Completeness)
- **Bẫy kỹ thuật**: Thêm trạng thái trên Server Domain (`Player.bankrupt`, `Player.mortgagedProperties`) nhưng bỏ quên tầng giao thức DTO truyền thông `DeltaPayload`.
- **Ràng buộc cứng**:
  1. Mọi thuộc tính trạng thái tác động lên hiển thị bàn cờ bắt buộc phải ánh xạ đồng thời sang `CellDelta` (`isMortgaged?: boolean`) và `PlayerDelta` (`bankrupt?: boolean`) trong `session_manager.ts`.
  2. Client 3D (R3F) dựa hoàn toàn vào `DeltaPayload` để cập nhật mô hình visual (úp thẻ BĐS khi thế chấp, làm mờ avatar khi phá sản). Thiếu trường DTO khiến Client bị mất đồng bộ hiển thị.

---

## Slice 06 — Bot AI Engine & Debt Mechanics (2026-09-09)

### PROPERTY_DEEDS là ReadonlyMap, không phải Array
- **Vấn đề**: Spec và khối planning mô tả PROPERTY_DEEDS như array, nhưng thực tế là `ReadonlyMap<number, PropertyDeed>`.
- **Giải pháp**: Dùng `.get(position)` — KHÔNG dùng `.find()` hay `.filter()`.
- **Ảnh hưởng**: `bot_engine.ts`, bất kỳ code nào cần tra cứu PropertyDeed theo position.

### Bot Intent Dispatch: INTENT_ROLL không qua IntentDispatcher
- **Vấn đề**: `INTENT_ROLL` không thuộc `PlayerIntent` union type của `intent_dispatcher.ts`.
- **Giải pháp**: `runBotTurn()` gọi `handleRollDice(roomCode, id)` trực tiếp, sau đó mới vào dispatch loop cho các intent khác.
- **Quy tắc**: Mọi intent khác (BUY, DECLINE, END_TURN) vẫn qua `handlePlayerIntent` / `IntentDispatcher`.

### Safety Counter Pattern cho Bot Turn Loop
- **Vấn đề**: Bot AI có thể gây infinite loop nếu FSM không tiến.
- **Giải pháp**: Hard-limit 50 intents/lượt. Nếu vượt, thoát vòng lặp (không throw).
- **Quy tắc**: `runBotTurn` là no-op nếu `!current?.isBot` hoặc room không hợp lệ.

### processPendingDebts phải gọi TRƯỚC GO_BONUS
- **Vấn đề**: Nếu trừ lãi CC_FREE_CREDIT SAU khi cộng GO_BONUS, test thấy net balance sai.
- **Giải pháp**: `processPendingDebts(room, player)` luôn được gọi TRƯỚC dòng cộng `player.balance += GO_BONUS`.
- **Verification**: TC-06.2b assert `treasury += 400` và net balance = +1.600 (không phải +2.000).

---

### 12. Doubles Turn Loop & Action Dock UX (Slice UI/FSM)
- **Bẫy nghiệp vụ**: Khi người chơi đổ xúc xắc ra đôi (ví dụ 3-3), FSM cấp thêm lượt tung bổ sung (`consecutiveDoubles > 0`, `canRollAgain = true`) và giữ pha ở `WaitingRoll`. Nếu UI vẫn bật nút "Hết Lượt", người chơi gửi `INTENT_END_TURN` sẽ bị FSM từ chối với lỗi `INVALID_PHASE` (vì đang ở `WaitingRoll`, không thể kết thúc lượt).
- **Ràng buộc cứng**:
  1. `isEndTurnDisabled` bắt buộc phải khóa nút "Hết Lượt" khi `canRollAgain` là true (`Boolean(params.canRollAgain)`).
  2. Nút Đổ xúc xắc trên ActionDock hiển thị nhãn `"Đổ Tiếp (Đôi)"` khi `canRollAgain && hasRolledThisTurn` kèm `title` hướng dẫn rõ ràng.
- **Giải pháp**: Đồng bộ cờ `canRollAgain` từ store/props vào helper `isEndTurnDisabled` và component `ActionDock`.

---

### 13. Server WebSocket Heartbeat PING & Bot Takeover Timeout (Slice NET/Lobby)
- **Bẫy kỹ thuật**: Client WebSocket có handler chờ nhận `PING` để phản hồi `PONG`, nhưng Server trước đó thiếu lệnh phát `PING` định kỳ trong `heartbeatTimer`. Sau 60 giây không có tín hiệu pong, `SessionManager` đánh dấu phiên hết hạn và kích hoạt `startGracePeriod` -> Bot tiếp quản (`PLAYER_BOT_TAKEOVER`).
- **Ràng buộc cứng**:
  1. `WssServer` trong chu kỳ `HEARTBEAT_INTERVAL_MS` (5.000ms) bắt buộc phát sóng `{ type: 'PING', roomCode }` tới mọi WebSocket đang hoạt động.
  2. Mọi gói tin hợp lệ từ socket người chơi (không chỉ riêng gói tin `PONG`) đều phải cập nhật `lastPongAt` và hủy `gracePeriod` nếu đang diễn ra.
  3. Quản lý ánh xạ socket - phòng - người chơi tách bạch trong `SocketRegistry` để bảo đảm không rò rỉ bộ nhớ và giữ `wss_server.ts` dưới ngưỡng 400 LOC.

---

### 14. Giải Quyết Đấu Giá Bot Tự Động & Tránh Kẹt Lượt FSM (IMP-01 & IMP-02)
- **Bẫy nghiệp vụ**: Khi Bot từ chối mua đất (`INTENT_DECLINE`), FSM chuyển sang `AuctionPhase`. Nếu không gọi hàm giải quyết đấu giá nội bộ `resolveAuctionBots(roomCode)`, chu trình `runBotTurn` sẽ thoát đột ngột mà không kết thúc lượt, khiến phòng bị kẹt vô tận ở `AuctionPhase`.
- **Ràng buộc cứng**:
  1. Sau khi Bot từ chối mua hoặc khi phòng ở `AuctionPhase` với toàn bộ đối thủ là Bot, bắt buộc kích hoạt `resolveAuctionBots` để các Bot đặt giá cạnh tranh theo trần `maxBid` hoặc Pass.
  2. Sau khi đấu giá kết thúc, FSM tự động đưa phòng về `PropertyManagement` để Bot hoàn tất lượt (`INTENT_END_TURN`).

---

### 15. Bắt Buộc Hạ Cấp Dỡ Nhà Trước Khi Thế Chấp (IMP-02 Solvency Solver)
- **Bẫy nghiệp vụ**: Thế chấp một ô đất đang có nhà C1-C3 bên trên để lấy tiền mặt cứu nợ.
- **Ràng buộc cứng**:
  1. Quy tắc Monopoly SSOT §I: Tuyệt đối cấm thế chấp đất khi vẫn còn công trình xây dựng bên trên (`state.level > 0`).
  2. Trong cây quyết định cứu nợ `solvency_solver.ts`, Bước 1 và Bước 3 bắt buộc phải hạ cấp dỡ nhà (hoàn lại 50% chi phí xây) trước khi xét đến Bước 2 và Bước 4 (thế chấp đất trống).
  3. Việc hạ cấp trong bộ màu bắt buộc phải tuân thủ nguyên tắc Even-Downgrade (không được để chênh lệch cấp nhà quá 1 giữa các ô cùng màu).

---

### 16. Giới Hạn Delta Time (dt Clamp) trong Camera Exponential Damping (IMP-03)
- **Bẫy kỹ thuật**: Khi trình duyệt bị drop frame hoặc chuyển tab, delta time `dt` có thể tăng đột biến (> 1.0 giây). Nếu dùng trực tiếp `dt` lớn trong công thức suy giảm hàm mũ `1 - exp(-dt * speed)`, camera sẽ bị giật xuyên tâm sa bàn hoặc gây lỗi tọa độ `NaN`.
- **Ràng buộc cứng**:
  1. Bắt buộc clamp an toàn `safeDt = Math.max(0, Math.min(dt, 0.1))` trong hàm `dampValue`.
  2. Kiểm tra `Number.isFinite(current)` và `Number.isFinite(target)`, fallback về target nếu gặp `NaN`.

---

### 17. Quy Tắc Anti-Sniping & Quyền Hạn Đấu Giá (IMP-01 & ADR-0004)
- **Bẫy nghiệp vụ**: Người chơi đặt giá ở giây cuối cùng khiến người chơi khác không kịp phản ứng; hoặc người vừa từ chối mua đất lại nhảy vào đấu giá chính ô đất đó với giá rẻ hơn.
- **Ràng buộc cứng**:
  1. Người vừa từ chối mua (`declinedPlayerId`) bị cấm vĩnh viễn không được đặt giá trong phiên đấu giá của chính ô đất đó.
  2. Khi có lệnh đặt giá hợp lệ ở thời điểm thời gian còn lại `<= 3 giây`, thời gian kết thúc phiên đấu giá tự động gia hạn thêm `+3.000ms`.

---

### 18. Khống Chế Biên Độ Sóng Biển Gerstner Tránh Ngập Bãi Cát (IMP-05 & ADR-0005)
- **Bẫy kỹ thuật**: Khi kết hợp nhiều hàm sóng điều hòa, đỉnh sóng cộng hưởng có thể vọt lên cao hơn cao độ bãi cát resort, khiến mặt nước dâng ngập bờ cát và các mô hình dù che/ghế nghỉ.
- **Ràng buộc cứng**:
  1. Mặt nước đặt tại cao độ Y = -0.60; thềm bãi cát ven biển đặt tại Y = -0.30; dải bọt sóng đặt tại Y = -0.48.
  2. Tổng biên độ 3 pha sóng bắt buộc phải thỏa mãn: `w1(0.032) + w2(0.024) + w3(0.014) <= 0.070 đơn vị`.
  3. Đỉnh sóng cao nhất tuyệt đối không được vượt quá cao độ -0.53 đơn vị, giữ khoảng cách đệm an toàn 0.23 đơn vị phía dưới thềm cát.

---

### 19. Đồng Bộ Vận Tốc Làn Xe Triệt Tiêu Va Chạm Giao Thông Tự Hành (IMP-05 & ADR-0005)
- **Bẫy kỹ thuật**: Xe tí hon trên đại lộ ven biển chạy với các vận tốc ngẫu nhiên khác nhau, dẫn đến hiện tượng xe chạy nhanh đâm xuyên qua xe chạy chậm (ghost overtaking) gây mất chân thực thị giác.
- **Ràng buộc cứng**:
  1. Tuyệt đối không gán vận tốc ngẫu nhiên cho từng xe trên cùng một làn đường.
  2. Vận tốc phải được khóa cứng và đồng bộ hóa theo từng làn: Toàn bộ xe làn ngoài chạy tốc độ 0.035, toàn bộ xe làn trong chạy tốc độ 0.032.
  3. Phân bổ khoảng cách vị trí ban đầu (offset) đều nhau dọc theo chu vi đại lộ (23.6 x 23.6) để triệt tiêu 100% va chạm mà không cần chạy physics engine nặng nề.

---

### 20. Nội Suy Ánh Sáng Time-of-Day Không Rác Bộ Nhớ (IMP-06 & ADR-0005)
- **Bẫy kỹ thuật**: Khởi tạo mới các đối tượng `new THREE.Color()` hoặc `new THREE.Vector3()` trong vòng lặp `useFrame` của component ánh sáng thời gian trong ngày để thực hiện lerp.
- **Hậu quả**: Tạo ra hàng nghìn object rác mỗi giây, kích hoạt Garbage Collection spikes làm tụt khung hình dưới 60 FPS trên mobile WebGL.
- **Ràng buộc cứng**:
  1. Khởi tạo các biến vector/color mục tiêu (`targetSunPos`, `targetSunColor`, `targetAmbientColor`) ở phạm vi module bên ngoài React component.
  2. Sử dụng trực tiếp các phương thức mutating in-place: `currentPos.lerp(targetPos, factor)` và `currentColor.lerp(targetColor, factor)` với tốc độ hàm mũ `1 - Math.exp(-dt * 3.0)`.

---

### 21. Giới Hạn Quỹ Đạo Ca-Nô Tuần Tra Vịnh Biển (IMP-05 & ADR-0005)
- **Bẫy kỹ thuật**: Ca-nô tuần tra chạy vòng tròn quanh tâm bàn cờ theo bán kính quá lớn hoặc không có giới hạn trục Z, khiến ca-nô phi thẳng lên bờ biển, chạy xuyên thấu các ô cờ hoặc đâm vào vách núi đá phía Bắc.
- **Ràng buộc cứng**:
  1. Khống chế biên độ di chuyển của ca-nô tuần tra trong vùng nước vịnh biển mở phía Nam: Bắt buộc kẹp điều kiện `Z >= 29`.
  2. Quỹ đạo chạy hình elip mở rộng theo phương ngang X quanh tọa độ trung tâm vịnh phía Nam `(X: [-18, 18], Z: [29, 36])`.

---

### 22. Bẫy Mỏ Neo Bối Cảnh Tối & Ảo Tưởng Checklist Mỹ Thuật (IMP-09 -> IMP-12 -> IMP-20)
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


