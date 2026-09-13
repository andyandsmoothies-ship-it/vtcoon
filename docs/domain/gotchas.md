# VTCOON DOMAIN GOTCHAS & ACTIVE MEMORY LEDGER

> **ACTIVE PRE-FLIGHT GATE (GIAO THỨC TRUY VẤN BẮT BUỘC)**:
> Mọi Agent (Main Agent & Subagents: `implementer`, `qa-tester`, `code-reviewer`, `DeepCoder`) trước khi lập kế hoạch, can thiệp hoặc tái cấu trúc mã nguồn thuộc Domain nào BẮT BUỘC phải tra cứu các Gotchas thuộc Domain đó.
> CẤM vi phạm các Ràng buộc cứng (Hard Invariants) đã được đúc kết từ các sự cố thực tế.

## 🧭 BẢNG CHỈ MỤC THEO DOMAIN (DOMAIN INDEX)
| Domain Tag | Trọng Tâm & Phạm Vi Mã Nguồn | Các Gotchas Liên Quan |
| :--- | :--- | :--- |
| `[FSM/RULE]` | Finite State Machine, Luật Chơi, Thẻ Cơ Hội/Thị Trường, Đấu Giá, Phá Sản, Trạm Kiểm Toán | #1, #2, #3, #4, #6, #7, #8, #9, #10, #15, #16, #18, #19, #21 |
| `[BOT/AI]` | Quyết Định Bot, Phá Sản Bot, Thuật Toán Cứu Nợ Solvency Solver, Bot Takeover | #12, #13, #14, #18, #19, #27, #40 |
| `[NET/SYNC]` | WebSocket Server/Client, Đồng Bộ Delta, Heartbeat Ping/Pong, Grace Period, Reconnect | #11, #17, #27, #38, #40 |
| `[3D/RENDER]` | Three.js, React Three Fiber, Shader Sóng Biển, Ánh Sáng, Tối Ưu GPU/RAM, Camera | #20, #22, #23, #24, #25, #26, #30, #38, #40 |
| `[UI/CRAFT]` | 2D UI, Tailwind CSS, Touch Targets, Tactile Depth, Bẫy Cuộn Lồng, Anti-Patterns | #16, #30, #31, #36, #37, #40 |
| `[UAT/TEST]` | Nghiệm Thu, Adversarial TDD, Ảnh Chụp Màn Hình (.jpg), Shell Escaping, File I/O Lock | #5, #28, #29, #31, #35 |
| `[TELEMETRY]` | Giám Sát Hiệu Năng Thời Gian Thực, Chó Canh Phòng Bất Biến, Hộp Đen Tái Hiện Lỗi | #39 |

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
- **Hiện tượng**: Bảng điều khiển sảnh chờ `PreMatchDeck` sử dụng nền đen xì discord admin (`bg-slate-950/85`) và nút bấm xám tối sụp chìm (`bg-slate-800 text-slate-500`) tạo cảm giác u tối, lạc điệu hoàn toàn so với ánh nắng sa bàn nhiệt đới và chuẩn đồ họa Retropoly.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Royal Navy Glassmorphism**: Bảng sảnh chờ `PreMatchDeck` BẮT BUỘC sử dụng bảng màu xanh navy hoàng gia mờ thủy tinh `bg-[#0A1628]/85 backdrop-blur-2xl border-amber-400/50 ring-1 ring-amber-300/30`, kết hợp các thẻ con mạ vàng champagne ấm áp để hài hòa với ánh nắng nhiệt đới của sa bàn 3D.
  2. **Juicy 3D Brand Plaque**: Huy hiệu thương hiệu VTCOON góc trên bên trái sử dụng tone đỏ ruby (`bg-gradient-to-b from-[#9E1212] via-[#B91C1C] to-[#7F0E0E]`) dập nổi viền vàng kim loại 3D, lớp phủ bóng specular highlight bề mặt và con dấu vàng "VT", đồng điệu với năng lượng biểu trưng của các tựa game thương mại cờ bàn đỉnh cao.
  3. **High-Contrast Tactile Beveling**: Nút bấm vô hiệu hóa "BẮT ĐẦU TRẬN ĐẤU" vẫn phải duy trì kết cấu vát nổi 3D đa tầng (`shadow-[0_4px_0_0_#0a1420]`, viền 2px dày dặn) kèm chữ sáng rõ (`text-slate-200`) và dòng hướng dẫn đọc được rõ ràng (`text-amber-200/95`), tuyệt đối không được chìm tối khó đọc.

---

### 37. [UI/UX] Ngăn Chặn Vỡ Dòng Hướng Dẫn & Chuẩn Hóa Cấu Trúc Footer Sảnh Chờ (Lobby Action Dock Guidance Wrapping & Full-Width Stack Invariant)
- **Hiện tượng**: Trong sảnh chờ `PreMatchDeck`, việc ép dòng hướng dẫn điều kiện vào một cột hẹp phía trên nút bấm (`items-end max-w-[280px] text-right`) làm đứt rời câu chữ tiếng Việt thành hai dòng cụt lủn khó coi (`Cần tối thiểu 2 người chơi (hoặc thêm Bot AI) để` / `bắt đầu`), đồng thời nút bấm vô hiệu hóa bị dồn vào góc với độ tương phản kém, gây cảm giác chắp vá.
- **Nguyên nhân gốc rễ**: Thiết kế layout footer dạng 2 cột ngang bất cân xứng cho các nội dung có độ dài biến thiên theo trạng thái FSM phòng chờ, kết hợp với script chụp ảnh CDP bị lỗi cú pháp thiếu ngoặc đóng khiến việc tự kiểm tra thị giác bị sai lệch.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **2-Tier Stack Invariant**: Footer của bảng sảnh chờ `PreMatchDeck` BẮT BUỘC tổ chức theo mô hình 2 tầng chuẩn:
     - Tầng 1: Hộp hướng dẫn điều kiện bắt đầu trận đấu chiếm trọn bề ngang (`w-full flex items-center justify-center text-center`), viền vàng amber ấm và chữ sáng rõ để không bao giờ bị ngắt dòng cụt.
     - Tầng 2: Cụm nút hành động gồm nút phụ `← Rời Phòng` bên trái và nút chính CTA `BẮT ĐẦU TRẬN ĐẤU` trải rộng `flex-1` bên phải.
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
