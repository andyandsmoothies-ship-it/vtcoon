# VTCOON DOMAIN GOTCHAS & ACTIVE MEMORY LEDGER

> **ACTIVE PRE-FLIGHT GATE (GIAO THỨC TRUY VẤN BẮT BUỘC)**:
> Mọi Agent (Main Agent & Subagents: `implementer`, `qa-tester`, `code-reviewer`, `DeepCoder`) trước khi lập kế hoạch, can thiệp hoặc tái cấu trúc mã nguồn thuộc Domain nào BẮT BUỘC phải tra cứu các Gotchas thuộc Domain đó.
> CẤM vi phạm các Ràng buộc cứng (Hard Invariants) đã được đúc kết từ các sự cố thực tế.

## 🧭 BẢNG CHỈ MỤC THEO DOMAIN (DOMAIN INDEX)
| Domain Tag | Trọng Tâm & Phạm Vi Mã Nguồn | Các Gotchas Liên Quan |
| :--- | :--- | :--- |
| `[FSM/RULE]` | Finite State Machine, Luật Chơi, Thẻ Cơ Hội/Thị Trường, Đấu Giá, Phá Sản, Trạm Kiểm Toán | #1, #2, #3, #4, #6, #7, #8, #9, #10, #15, #16, #18, #19, #21, #65, #66 |
| `[BOT/AI]` | Quyết Định Bot, Phá Sản Bot, Thuật Toán Cứu Nợ Solvency Solver, Bot Takeover | #12, #13, #14, #18, #19, #27, #40, #66 |
| `[NET/SYNC]` | WebSocket Server/Client, Đồng Bộ Delta, Heartbeat Ping/Pong, Grace Period, Reconnect | #11, #17, #27, #38, #40, #65, #66 |
| `[3D/RENDER]` | Three.js, React Three Fiber, Shader Sóng Biển, Ánh Sáng, Tối Ưu GPU/RAM, Camera, Nạp Mô Hình GLTF An Toàn | #20, #22, #23, #24, #25, #26, #30, #38, #40, #46, #47, #48, #49, #50, #51, #54, #55, #56, #57, #58, #59 |
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
  4. **PCFSoftShadow & Subpixel DPR Floor**: Canvas BẮT BUỘC cấu hình `shadows="soft"` (kích hoạt `PCFSoftShadowMap`) và sàn `dpr={[1.25, 2]}` để loại bỏ hoàn toàn răng cưa bóng đổ và hiện tượng vỡ hạt điểm ảnh trên màn hình Full HD.

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
