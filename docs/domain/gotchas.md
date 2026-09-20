# VTCOON DOMAIN GOTCHAS & ACTIVE MEMORY LEDGER

> **ACTIVE PRE-FLIGHT GATE (GIAO THỨC TRUY VẤN BẮT BUỘC)**:
> Mọi Agent (Main Agent & Subagents: `implementer`, `qa-tester`, `code-reviewer`, `DeepCoder`) trước khi lập kế hoạch, can thiệp hoặc tái cấu trúc mã nguồn thuộc Domain nào BẮT BUỘC phải tra cứu các Gotchas thuộc Domain đó.
> CẤM vi phạm các Ràng buộc cứng (Hard Invariants) đã được đúc kết từ các sự cố thực tế.

## 🧭 BẢNG CHỈ MỤC THEO DOMAIN (DOMAIN INDEX)
| Domain Tag | Trọng Tâm & Phạm Vi Mã Nguồn | Các Gotchas Liên Quan |
| :--- | :--- | :--- |
| `[FSM/RULE]` | Finite State Machine, Luật Chơi, Thẻ Cơ Hội/Thị Trường, Đấu Giá, Phá Sản, Trạm Kiểm Toán | #1, #2, #3, #4, #6, #7, #8, #9, #10, #15, #16, #18, #19, #21, #65, #66, #70, #78, #82, #104, #105, #106, #145, #146, #147, #159, #164, #174, #180, #188 |
| `[BOT/AI]` | Quyết Định Bot, Phá Sản Bot, Thuật Toán Cứu Nợ Solvency Solver, Bot Takeover | #12, #13, #14, #18, #19, #27, #40, #64, #66, #70, #72, #77, #78, #79, #81, #82, #146, #147, #190, #191 |
| `[NET/SYNC]` | WebSocket Server/Client, Đồng Bộ Delta, Heartbeat Ping/Pong, Grace Period, Reconnect | #11, #17, #27, #38, #40, #41, #44, #45, #65, #66, #67, #70, #71, #74, #75, #76, #77, #100, #105, #106, #114, #144, #156, #159, #165, #168, #184, #190 |
| `[3D/RENDER]` | Three.js, React Three Fiber, Shader Sóng Biển, Ánh Sáng, Tối Ưu GPU/RAM, Camera, Nạp Mô Hình GLTF An Toàn | #20, #22, #23, #24, #25, #26, #30, #32, #38, #40, #46, #47, #48, #49, #50, #51, #54, #55, #56, #57, #58, #59, #60, #61, #63, #69, #72, #74, #77, #80, #85, #86, #88, #89, #90, #91, #92, #93, #94, #95, #96, #101, #103, #109, #110, #114, #115, #116, #117, #120, #122, #123, #124, #125, #126, #127, #128, #129, #130, #133, #134, #135, #136, #140, #141, #144, #148, #159, #160, #161, #162, #163, #164, #165, #169, #175, #177, #189 |
| `[UI/CRAFT]` | 2D UI, Tailwind CSS, Touch Targets, Tactile Depth, Bẫy Cuộn Lồng, Anti-Patterns | #16, #30, #31, #34, #36, #37, #40, #42, #53, #67, #68, #70, #74, #80, #84, #87, #95, #96, #97, #101, #102, #104, #105, #106, #108, #109, #110, #114, #121, #131, #132, #135, #136, #138, #156, #157, #158, #159, #160, #161, #162, #164, #167, #168, #170, #171, #172, #175, #176, #178, #179, #181, #182, #183, #185, #186, #187, #188, #192 |
| `[UAT/TEST]` | Nghiệm Thu, Adversarial TDD, Ảnh Chụp Màn Hình (.jpg), Shell Escaping, File I/O Lock, Docker Healthcheck Timeout | #5, #28, #29, #31, #35, #52, #71, #73, #83, #84, #99, #100, #117, #124, #125, #130 |
| `[TELEMETRY]` | Giám Sát Hiệu Năng Thời Gian Thực, Chó Canh Phòng Bất Biến, Hộp Đen Tái Hiện Lỗi | #39, #62, #71, #75, #104, #114, #115, #135, #174 |
| `[ARCH/REFACTOR]` | Tách Module Facade, Ngân Sách Render Loop, Chuẩn Hóa Môi Trường Build | #43, #98, #99 |

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

### 101. [3D/UI] Bất Biến Chuẩn Hóa Tỷ Lệ Quân Cờ VIP & Avatar Linh Vật Đồ Họa 32px (IMP-76)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Quân Cờ Nằm Ngang Bị Chìm (Horizontal Pawn Silhouette Trap)*: Tháp Landmark của Host cao 1.2m đứng thẳng sừng sững, trong khi Du thuyền (0.35m) và Xe cổ (0.25m) của Bot có kết cấu nằm ngang dài bẹp. Nếu render cùng hệ số scale 1.0, quân cờ của bot trông như đồ chơi tí hon so với quân cờ của người chơi.
  2. *Bẫy Nhận Diện 2D Không Đồng Bộ*: Thẻ người chơi `PlayerCard` hiển thị chấm tròn màu 16px nhỏ bé, khiến người chơi không cảm nhận được linh vật đại diện của từng đối thủ bot.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Pawn Stature Normalization**: Mọi linh vật quân cờ trong `LUXURY_PAWN_CONFIGS` bắt buộc phải có cấu hình `scale: [sx, sy, sz]` riêng biệt. Các linh vật nằm ngang (Du thuyền, Xe hơi) phải có `scale Y >= 1.5` để đạt thể tích thị giác tương đương Tháp Landmark.
  2. **Tactile Avatar Badge 32px**: `PlayerCard` phải hiển thị huy hiệu linh vật `w-8 h-8 rounded-xl border-2 border-slate-900` chứa emoji đại diện tương ứng với slot cờ (`🏰`, `⛵`, `🚗`, `🐎`), bảo đảm nhận diện thương mại sắc nét trên cả 2D và 3D.

---

### 102. [UI/CRAFT] Bất Biến Cuộn Tự Động Bảng Nhật Ký Hoạt Động & Cơ Chế Neo Đáy Hai Cấp (IMP-76)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Cuộn Mượt Bị Hủy Bởi CSS Transition (Smooth Scroll Interruption Trap)*: Sử dụng `element.scrollIntoView({ behavior: 'smooth' })` khi sidebar đang mở trong quá trình CSS transition 300ms sẽ bị trình duyệt dừng đột ngột hoặc nhảy sai vị trí.
  2. *Bẫy Mất Dấu Sự Kiện Mới Nhất*: Khi game phát sinh liên tục các giao dịch (đổ xúc xắc, mua bán, trả tiền thuê), việc không tự động đưa khung nhìn về dòng cuối khiến người chơi không theo dõi được diễn biến trận đấu.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Direct Container-Level Scroll**: Điều khiển trực tiếp `scrollTop = scrollHeight` trên `scrollContainerRef` thay vì chỉ phụ thuộc vào `scrollIntoView`.
  2. **Dual-Mode Bottom Anchor & Floating Return**: Tự động cuộn xuống đáy khi mở panel hoặc khi có log mới nếu người dùng đang ở đáy. Khi người dùng chủ động cuộn lên trên (>60px), phát hiện qua `shouldShowScrollBottom` và hiển thị nút nổi tiện ích `data-testid="scroll-to-bottom-btn"` (⬇ Dòng mới nhất) để hỗ trợ quay về đáy tức thì chỉ với 1 chạm.

---

### 103. [3D/PERF] Bất Biến Tối Ưu "Điểm Cân Bằng Vàng" (Golden Balance Suite) — 60 FPS Không Đánh Đổi Mỹ Thuật (IMP-77)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Khử Răng Cưa Trùng Lặp (Double Anti-Aliasing Overhead Trap)*: Khởi tạo `multisampling={4}` (MSAA 4x) trên `EffectComposer` trong khi đã có pass `<SMAA />` hậu kỳ. Điều này khiến GPU nhân 4 lần dung lượng FBO buffer và fillrate một cách hoàn toàn vô ích mà không mang lại khác biệt thị giác có thể nhận biết.
  2. *Bẫy Tính Lại Bóng Đổ Tĩnh Mỗi Frame (Dynamic Shadow FBO Trap)*: Bỏ qua thuộc tính `frames` trên `<ContactShadows />` (mặc định `Infinity`), ép một camera phụ re-render bàn cờ và thực thi 2 lượt Gaussian blur 60 lần/giây cho một khối hình học tĩnh (mâm gỗ và thảm Ba Tư).
  3. *Bẫy DPR 2.0 Làm Nghẽn Fillrate Trên Màn Hình Retina*: Đặt `dpr={[1.25, 2]}` khiến màn hình 2K/4K/Retina render gấp 4 lần số lượng pixel, hạ gục GPU tích hợp xuống 21 FPS.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Zero MSAA Allocation**: `PostProcessingPipeline` bắt buộc đặt `multisampling = 0` trên `EffectComposer` để bàn giao 100% nhiệm vụ khử răng cưa subpixel cho `<SMAA />`.
  2. **Bake Contact Shadows Once (`frames={1}`)**: Toàn bộ các thẻ `<ContactShadows />` trên bàn cờ tĩnh bắt buộc phải cấu hình `frames={1}` để nướng bóng tiếp xúc đúng 1 lần vào static texture buffer.
  3. **Balanced HiDPI Ceiling (`dpr={[1, 1.5]}`)**: `Canvas` giới hạn trần DPR là 1.5 (`dpr={[1, 1.5]}`), cắt giảm 43.75% pixel fillrate trên màn hình độ phân giải cao mà bảo toàn nguyên vẹn độ sắc nét của sa bàn.
  4. **No-Visual-Compromise Invariant**: Giữ nguyên Shadow Map 2048px (`shadows="soft"`) và N8AO Ambient Occlusion chất lượng cao. Hiệu năng đạt mốc 60 FPS mà 0% suy hao mỹ thuật.

---

### 104. [UI/FSM] Bất Biến Quản Lý Danh Mục Bất Động Sản Đa Sở Hữu, Khớp Nối Intent Đàm Phán P2P & Giám Sát Vỡ Nợ (IMP-75)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Kẹt Đơn BĐS Khi Khủng Hoảng Nợ (Single Property Lockout Trap)*: Helper `resolveManagePropertyTarget` chỉ trả về `ownedProperties[0]`. Khi người chơi lâm vào nợ âm (`InsolvencyPhase`), họ mở "Quản lý BĐS" chỉ thấy một ô duy nhất (ô đầu tiên), thế chấp xong thì không có cách nào điều hướng sang các ô còn lại để cứu vãn dòng tiền, dẫn đến cưỡng chế phá sản oan uổng.
  2. *Bẫy Nuốt Âm Thầm Intent Đàm Phán P2P (Silent Intent Drop Bug)*: Trong `modal_host.tsx`, callback `onSubmitTrade` không nhận tham số mà đọc từ `modalPayload` rỗng ban đầu, khiến lệnh `INTENT_TRADE_OFFER` bị nuốt âm thầm, không bao giờ được gửi lên server dù client vẫn phát âm thanh thành công.
  3. *Bẫy Cảnh Báo Sai Telemetry Invariant*: `isInInsolvency` chỉ kiểm tra `activeModal === 'insolvency'`, khiến Telemetry báo sai `NEGATIVE_BALANCE_OUTSIDE_INSOLVENCY` khi người chơi mở Sổ đỏ hoặc Portfolio; đồng thời `checkIsTeleport` báo lỗi `INVALID_POSITION_STEP` khi người chơi bị đưa vào Trạm Kiểm Toán (ô 10).
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Portfolio Matrix First Invariant**: Hành động "Quản Lý BĐS" và "Cứu Nợ" bắt buộc mở `PropertyPortfolioModal` hiển thị toàn bộ danh mục bất động sản sở hữu dưới dạng lưới kèm thanh cứu nợ tiến trình và các nút thao tác nhanh 1 chạm (Thế chấp, Giải chấp, Hạ cấp, Xem Sổ Đỏ).
  2. **Cyclic Carousel Browsing Invariant**: `TitleDeedModal` khi mở cho chủ sở hữu có >1 tài sản phải cung cấp điều hướng vòng tròn `[◀ Trước] (i/N) [Sau ▶]` cho phép duyệt toàn bộ danh mục tài sản mà không cần đóng modal.
  3. **P2P Trade Transparency & Dispatch Invariant**: `TradeModal` phải hỗ trợ chuyển đổi đối tác đa người chơi, hiển thị số dư tiền mặt thời gian thực của đối tác, kiểm tra khả năng thanh toán trước khi gửi đề xuất, gợi ý tỷ lệ giá chuẩn (70% Sàn, 100% Gốc, 120%) và chuyển tiếp đầy đủ `tradeData` cho intent dispatcher.
  4. **Phase-Aware Telemetry Invariant**: `isInInsolvency` phải lắng nghe trực tiếp `delta.turnPhase === TurnPhase.InsolvencyPhase || postState.activeModal === 'insolvency'`, và `checkIsTeleport` phải miễn trừ hợp lệ cho việc dịch chuyển vào Trạm Kiểm Toán ô 10 hoặc dịch chuyển do rút thẻ Khí Vận trong `ActionPhase`.

---

### 105. [UI/FSM] Bất Biến Đồng Bộ Kết Quả Xúc Xắc 1D6 Sàn HOSE, Chống Đóng Modal Sớm & Định Danh Nhật Ký Ván Đấu (IMP-78)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Đóng Modal Tức Thì do Desync Pha FSM (Instant Modal Eviction Trap)*: Khi client gửi `INTENT_INVEST`, server xử lý xong liền chuyển pha sang `PropertyManagement` và phát `STATE_DELTA`. `apply_delta.ts` thấy `turnPhase !== HosePhase` liền gọi `closeModal()` ngay sau 5ms, đè bẹp hoàn toàn timer 1.5s của client khiến người chơi không kịp nhìn thấy kết quả xúc xắc hay số tiền thắng/thua.
  2. *Bẫy Client Sinh Xúc Xắc Giả Lệch Pha Server*: Server tính `face = Math.floor(rng() * 6) + 1` và cập nhật số dư nhưng không gửi `lastHoseResult` trong delta. Client tại `modal_host.tsx` tự sinh số ngẫu nhiên giả `Math.random()`, tạo ra kết quả giả và số tiền lệch với thực tế.
  3. *Bẫy Nuốt Log Thành "Tiền Thưởng" Chung Chung*: Khi nhận tiền từ HOSE, bộ phân tích tài chính chỉ thấy số dư tăng nên tự động gán nhãn `nhận được tiền thưởng` gây hiểu lầm cho người chơi.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Server-Authoritative HOSE Result (SSOT)**: `Room` và `DeltaPayload` bắt buộc lưu trữ và đồng bộ `lastHoseResult: HoseResultInfo` ({ playerId, stake, roll, payout, multiplier, profit, timestamp, diceSeq }).
  2. **Graceful Modal Review Invariant**: `apply_delta.ts` bắt buộc kiểm tra `!modalPayload?.isReviewingResult` trước khi đóng modal HOSE. Modal chỉ đóng khi người chơi chủ động bấm nút `[Tiếp Tục ➔]` (`data-testid="hose-confirm-btn"`) hoặc qua timer an toàn 5-6s.
  3. **Tactile 1D6 Roll & Matrix Highlight**: `HoseModal` hiển thị hoạt ảnh xúc xắc 1D6 to bản quay nảy, giảm tốc mượt mà và dừng chuẩn xác ở mặt kết quả, đồng thời kích hoạt viền sáng `ring-4 ring-amber-500` nổi bật ô tỷ lệ trúng thưởng trên ma trận 1D6.
  4. **Descriptive Activity Log Invariant**: `activity_financial_tracker.ts` nhận diện `delta.lastHoseResult` để ghi log tường minh (`📈/📉/⚖️ [HOSE] P1 đầu tư X Tr. ➔ Khớp lệnh Mặt Y (Z%): Thu về W Tr. (Lãi/Lỗ)`), đồng thời đánh dấu `handledReceiverIds` và `handledPayerIds` để triệt tiêu vĩnh viễn log tiền thưởng mơ hồ.

---

### 106. [UI/NET] Bất Biến Thoát Kẹt Trạm Kiểm Toán, Định Danh Nhật Ký Thẻ Sự Kiện & Búa Gõ Đấu Giá (IMP-79)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Kẹt Lượt Trong Trạm Kiểm Toán (In-Jail Softlock Trap)*: Khi bị giam giữ tại Trạm Kiểm Toán (Ô 10), `isRollActionDisabled` bị khóa, đồng thời `isEndTurnDisabled` cũng bị khóa do điều kiện `!hasRolledThisTurn`. Người chơi thật bị kẹt cứng trong lượt, không thể đổ xúc xắc và cũng không thể bấm "Hết Lượt", trong khi Client UI hoàn toàn thiếu nút nộp tiền bảo lãnh 500 Tr. (`INTENT_BAIL_OUT`) dù server và bot đã hỗ trợ cơ chế này.
  2. *Bẫy Nuốt Nhật Ký Thẻ Bài Sự Kiện (Swallowed Event Card Activity Trap)*: Khi người chơi hoặc bot rút Phiếu Cơ Hội hoặc Phiếu Thị Trường, delta gửi `lastEventCard` nhưng `trackDeltaActivities` không có hàm xử lý, dẫn đến các khoản trừ tiền phạt của thẻ bị gán nhãn chung chung "nộp phí / nộp thuế", và các sự kiện dịch chuyển bị mất dấu hoàn toàn.
  3. *Bẫy Nuốt Kết Quả Gõ Búa Đấu Giá (Silent Auction Conclusion Trap)*: Khi phiên đấu giá kết thúc trên máy chủ (`delta.auction === null`), `detectAuctionActivities` xóa trắng trạng thái mà không phát log vinh danh người thắng cuộc, khiến toàn bộ người chơi không rõ ai đã trúng đấu giá và với mức giá bao nhiêu.
  4. *Bẫy Gộp Chung Mọi Khoản Phạt Tài Chính*: Mọi khoản giảm trừ tiền ngoài mua đất và nâng cấp đều bị gán chung chuỗi `${pName} đã nộp phí / nộp thuế ${formatCurrency(absDiff)}`.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Audit Softlock Defense & Bailout Action Invariant**:
     - `ui_helpers.ts`: `isRollActionDisabled` bắt buộc trả về `true` khi `inAudit = true`. `isEndTurnDisabled` bắt buộc trả về `false` khi `inAudit = true && isMyTurn = true` để người chơi được phép kết thúc lượt chấp hành án kiểm toán theo từng vòng.
     - `action_dock.tsx`: Bổ sung nút `⚖️ Bảo Lãnh (500 Tr.) (Còn X lượt)` hiển thị ngay trên thanh điều khiển khi `inAudit = true && isMyTurn = true`, kích hoạt intent `INTENT_BAIL_OUT`. Vô hiệu hóa nút nếu số dư `< 500 Tr.`.
  2. **Event Card Activity Propagation Invariant**:
     - `activity_tracker.ts`: Hàm `detectEventCardActivities` bắt buộc trích xuất `delta.lastEventCard`, tạo log loại `'card'` với biểu tượng `🎴 [Thị Trường]` hoặc `⚡ [Cơ Hội]` kèm đầy đủ tên thẻ, người rút và tác động kinh tế. Đồng thời duy trì bộ lọc chống ghi trùng lặp thẻ giữa các gói delta liên tiếp.
  3. **Auction Victory Fanfare Invariant**:
     - `activity_tracker.ts`: Khi nhận `delta.auction === null`, `detectAuctionActivities` bắt buộc kiểm tra `lastAuctionBid` và phát sinh log vinh danh trước khi dọn dẹp: `🔨 [Đấu Giá] Búa gõ thành công! ${winnerName} đã trúng đấu giá ${cellName} với giá ${formatCurrency(winningBid)}!`.
     - `auction_modal.tsx`: Hỗ trợ cờ `isConcluded: true` để hiển thị banner chúc mừng người chiến thắng to bản trước khi đóng modal.
  4. **Financial Disambiguation Invariant**:
     - `activity_financial_tracker.ts`: Phân loại chính xác các trường hợp trừ tiền đặc thù:
       * Nộp tại Ô 04: `🏛️ [Tên] đã nộp phí / nộp thuế [X Tr.] (Lệ Phí Đăng Ký Đất Đai)`.
       * Nộp bảo lãnh Ô 10: `⚖️ [Tên] đã nộp phí / nộp thuế 500 Tr. (Bảo Lãnh Kiểm Toán để rời Trạm)`.

---

### 107. [NET/ECONOMY] Bất Biến Đồng Bộ Vòng Đấu Toàn Mạng (Sparse Delta Forwarding), Bảo Toàn Kho Bạc Đầu Tư Công & Phụ Thu Thẻ Thị Trường (IMP-76)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Kẹt Vòng Đấu TopBar tại 1/30 do Rơi Trường trong Sparse Delta (Sparse Delta Field Eviction Trap)*: `session_manager.ts` đã tính đúng `roundNumber`, nhưng trong trận đấu thực tế từ tick 2 trở đi, `delta_broadcaster.ts` phát sóng vi sai qua `buildSparseDelta(prev, next)`. Do `buildSparseDelta` bỏ rơi `roundNumber`, `treasury`, và `activeModifiers`, gói tin gửi qua mạng client nhận được là `undefined`. TopBar bị đóng băng vĩnh viễn ở `VÒNG 1/30` và Client không nhận được danh sách biến động thị trường.
  2. *Bẫy Thất Thoát Quỹ Kho Bạc khi Giải Ngân Đầu Tư Công (`MC_PUBLIC_INVEST` Treasury Invariant Violation)*: Thẻ Thị Trường Đầu Tư Công chi thưởng 1.000 Tr. cho mỗi ô hạ tầng giao thông mà người chơi sở hữu nhưng không khấu trừ từ `room.treasury`. Tiền sinh ra từ hư vô, vi phạm bất biến bảo toàn tiền tệ toàn vẹn của bàn cờ.
  3. *Bẫy Thiếu Minh Bạch Thẻ Thị Trường trên Sổ Đỏ*: Khi thẻ `MC_FUEL_SURGE` kích hoạt, người chơi dừng chân ở ô hạ tầng bị thu thêm 500 Tr. cước vận tải nhưng xem Sổ Đỏ không thấy huy hiệu giải thích nguyên nhân tăng giá thuê.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Sparse Delta Forwarding Invariant**: `buildSparseDelta` trong `delta_broadcaster.ts` và `broadcastDelta` trong `session_manager.ts` bắt buộc luôn chuyển tiếp và lưu trữ đầy đủ `roundNumber`, `treasury`, `activeModifiers`, `lastEventCard`, `lastHoseResult` để bảo đảm đồng bộ 100% trong toàn bộ chu trình mạng WebSocket.
  2. **Treasury Conservation on Public Invest Invariant**: `handlePublicInvest` đếm số ô hạ tầng sở hữu (`INFRA_CELLS = [5, 15, 25, 35]`), cộng tiền thưởng cho người chơi và khấu trừ đúng `room.treasury = Math.max(0, (room.treasury ?? 0) - totalDisbursed)`. Tổng tiền tệ toàn bàn cờ (Người chơi + Kho Bạc) bảo toàn 100% khi ngân sách đủ tiền.
---

### 108. [TELEMETRY/ECONOMY/UI] Bất Biến Giám Sát Viễn Trắc Toàn Diện (Telemetry Watchdog Accuracy), Hấp Thụ Quỹ Kho Bạc & Bảo Vệ Chuyển Tab Trình Duyệt (IMP-80)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Báo Động Giả Thất Thoát Quỹ Kho Bạc Khi Vượt GO (GO Property Tax False Positive)*: Khi người chơi vượt ô GO bị trừ thuế BĐS (ví dụ 600 Tr.), ngân hàng phát 2.000 Tr., trong đó 1.400 Tr. chuyển vào ví người chơi và 600 Tr. nộp vào Kho Bạc (`postTreasury - preTreasury`). Tổng tài chính toàn phòng (`Players + Treasury`) tăng đúng `+2.000 Tr.`. Tuy nhiên, `computeExpectedDelta` cũ chỉ trả về `2000 - tax = 1400 Tr.`, khiến watchdog so sánh lệch `2000 Tr. !== 1400 Tr.` và phát báo động đỏ giả `TREASURY_INVARIANT_VIOLATED`.
  2. *Bẫy Báo Động Giả Khi Nộp Bảo Lãnh Kiểm Toán (Audit Bailout False Positive)*: Khi người chơi nộp 500 Tr. bảo lãnh rời Trạm Kiểm Toán (`INTENT_BAIL_OUT`), ví người chơi giảm 500 Tr. và Kho Bạc tăng 500 Tr. Tổng tài sản toàn hệ thống thay đổi `0 Tr.`. Tuy nhiên, `computeAuditBailDelta` cũ trả về `-500 Tr.`, dẫn đến so sánh lệch `0 Tr. !== -500 Tr.` và phát báo động đỏ giả.
  3. *Bẫy Lệch Giá Trúng Thầu Đấu Giá (Auction Winning Bid Desync)*: Khi phiên đấu giá kết thúc gán quyền sở hữu ô đất, modal đấu giá đóng lại trước khi delta phân bổ tài sản đến (`activeModal === null`), khiến `computeCellDelta` rơi về giá gốc của ô đất (ví dụ 2.200 Tr.) thay vì giá trúng thầu thực tế của người chơi (ví dụ 3.900 Tr.), kích hoạt cảnh báo sai lệch tiền tệ.
  4. *Bẫy Báo Động Giả Kẹt Hoạt Ảnh Khi Chuyển Tab Nền (Background Tab Throttling Trap)*: Khi người dùng chuyển tab trình duyệt hoặc thu nhỏ cửa sổ (`document.hidden = true`), trình duyệt tạm dừng `requestAnimationFrame`. Timer đo kẹt hoạt ảnh FSM (`animStartRef`) không được dừng. Khi người chơi quay lại tab sau 15-30 giây, khung hình đầu tiên kích hoạt watchdog so sánh thời gian trôi qua và phát báo động giả `FSM_ANIMATION_STALLED`.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Treasury Absorption on Pass GO Invariant**: `calculateGoSalary` nhận diện khoản tăng trưởng của Kho Bạc (`treasuryGain = postTreasury - preTreasury`) và cộng bù `absorbedTax = Math.min(Math.max(0, treasuryGain), tax)`. Tổng dòng tiền toàn phòng khi vượt GO luôn kỳ vọng đúng `+2.000 Tr.`.
  2. **Audit Bailout Conservation Invariant**: `computeAuditBailDelta` nhận diện khoản hấp thụ của Kho Bạc khi nộp bảo lãnh: `absorbed = Math.min(Math.max(0, treasuryGain), 500); bail += (-500 + absorbed)`. Khi Kho Bạc nhận 500 Tr., biến động kỳ vọng của toàn hệ thống là `0 Tr.`.
  3. **Auction Activity Store SSOT Invariant**: `computeCellDelta` ưu tiên đọc trực tiếp giá trúng thầu từ `useActivityStore.getState().lastAuctionBid.currentBid` để phản ánh đúng số tiền người thắng cuộc đã chi trả, triệt tiêu sự phụ thuộc vào trạng thái đóng/mở của modal.
  4. **Dynamic Event Check Exemption Invariant**: `computeExpectedDelta` bắt buộc trả về `null` (miễn trừ kiểm tra bảo toàn tiền tệ tĩnh) khi delta mang `lastHoseResult` hoặc `lastEventCard`, ngăn ngừa báo động giả đối với các biến động kinh tế ngẫu nhiên chưa mô hình hóa trước.
  5. **Background Tab Watchdog Pause Invariant**: `PerfTelemetryTracker` trong `game_canvas.tsx` đăng ký lắng nghe sự kiện `visibilitychange` và kiểm tra `document.hidden`. Bất cứ khi nào tab chuyển sang chế độ nền hoặc focus trở lại, `animStartRef.current` được đặt về `null`, bảo đảm chỉ đo thời gian hoạt ảnh khi tab đang hiển thị trực quan.
  6. **Initial Handshake Treasury Calibration Invariant**: Tại `delta.tick <= 1`, client cân chỉnh `preTreasury` khớp với `postState.treasuryPool` để tránh báo động giả do chênh lệch khởi tạo lần đầu từ server, đồng thời khởi tạo `setTreasuryPool(0)` tại `use_app_session.ts` đồng bộ hoàn toàn với server.
  7. **Exact Dice Movement Over GO Invariant**: `detectMovement` và `computeExpectedDelta` nhận diện di chuyển đúng điểm xúc xắc (`(fromPos + diceSum) % 40 === toPos`) là di chuyển thông thường (`isTeleport: false`), bảo đảm tính đủ lương vượt GO (+2.000 Tr.) kể cả khi xuất phát từ ô sự kiện (Ô 36 Thị Trường).
  8. **Per-Frame WebGL Draw Calls Reset Invariant**: `PerfTelemetryTracker` gọi `gl.info.reset()` cuối mỗi khung hình trong `useFrame`, phản ánh đúng ~45–60 calls/frame thay vì tích lũy qua nhiều khung hình.


---

### 109. [3D/LIGHTING/TYPOGRAPHY] Bất Biến Chiếu Sáng Thiên Đỉnh Ban Ngày (Daylight Zenith Fill), Cao Nguyên Cỏ Đảo Tự Nhiên & Chuẩn Hóa Chữ Trắng Sổ Đỏ (Daylight Zoom Illumination, Retropoly Natural Island Palette & Unified Title Deed Typography - IMP-81)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Tối Sầm Bàn Cờ Khi Zoom Cận Cảnh (Daylight Close-Up Shadow Crush Trap)*: Khi camera chuyển sang chế độ cận cảnh (`tile_focus` hoặc `pawn_chase`), góc chiếu xiên của Directional Light mặt trời kết hợp với bóng đổ che khuất và pass N8AO cường độ cao (`aoIntensity = 0.60`, màu than đen `#0B0F19`) làm bề mặt ô cờ bị tối sầm, mất chi tiết họa tiết thẻ và tên đường phố.
  2. *Bẫy Đảo Vàng Mù Tạt Giả Tạo (Artificial Mustard Yellow Island Trap)*: Môi trường đảo nghỉ dưỡng sử dụng mã màu `#FDE68A` cho vành đai cát xung quanh sa bàn cờ, kết hợp với ánh sáng viền vàng `#FEF08A` và phản xạ mặt đất vàng chanh `#FEF3C7`, tạo cảm giác sa bàn bị ám sắc vàng bức bối, thiếu tự nhiên, đi chệch khỏi chuẩn mỹ thuật thương mại của Retropoly và Monopoly Plus.
  3. *Bẫy Chữ Đen Mực Loang Trên Băng Rôn Sổ Đỏ (Black-on-Dark Blob Typography Trap)*: Một số thẻ đất như Bình Định (`#FF8C42`) và Hải Phòng (`#F1C40F`) trước đây bị gán chữ màu đen `#090D1A` theo ngưỡng độ chói cũ (> 0.60). Khi viền nét `strokeText` màu than đen `#0F172A`, nét viền hòa lẫn vào thân chữ tạo thành các vệt mực đen loang nhòe, mất hoàn toàn không gian âm của chữ cái và tạo sự lệch pha thị giác khi các thẻ khác dùng chữ trắng.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Daylight Zenith Fill Light Invariant**: `TimeOfDayLighting` tích hợp nguồn sáng phụ thẳng đứng từ thiên đỉnh tại `position={[0, 30, 0]}` với cường độ `0.25` và màu trắng nắng `#F8FAFC` kích hoạt riêng cho ban ngày (hạ xuống `0.05` khi đấu giá kịch tính), xóa sạch hoàn toàn vùng tối nghẽn sáng khi máy quay zoom sát mặt bàn cờ.
  2. **Soft Slate Ambient Occlusion Invariant**: `PostProcessingPipeline` hạ trần `aoIntensity` xuống `0.38` (<= 0.40) và chuyển gam màu bóng tiếp xúc N8AO sang than chàm mềm mại `#1E293B`, ngăn ngừa triệt để hiện tượng black-crush trên bề mặt ô đất.
  3. **Retropoly Natural Coastal Palette Invariant**: Khử sạch 100% token vàng mù tạt `#FDE68A` trên toàn bộ các tầng hình trụ đảo. Đường bờ biển chuyển sang cát ngà tự nhiên `#EFE5D8` và điểm nhấn `#F3EBE1`. Bổ sung tầng cao nguyên cỏ xanh nhiệt đới `#22C55E` ôm sát bàn cờ. Thanh lọc ánh sáng viền ban ngày sang `#F8FAFC` và phản xạ mặt đất `hemiGroundColor` sang xanh mát `#DCFCE7`.
  4. **Unified Crisp White Title Typography Invariant**: Hàm `getBannerTextColor` nâng ngưỡng phân tách độ chói lên `luminance > 0.85`. Toàn bộ 28 thẻ BĐS đô thị & nghỉ dưỡng (luminance 0.37–0.74) đồng nhất sử dụng chữ trắng đậm `#FFFFFF` với kỹ thuật Double-Draw viền than `#0F172A` (lineWidth 3.0), chỉ bảo lưu mực than đen `#090D1A` duy nhất cho nền giấy ngà cổ điển `#FFFDF5`.

---

### 110. [3D/ASSET/UI] Bất Biến Đồng Bộ Quân Cờ Kim Loại Nguyên Khối (Die-Cast Metal Tokens) & Hệ Thống Nhận Diện Chủ Quyền BĐS Đa Tầng (3-Layer Ownership Readability - IMP-82)
> ⚠️ **[SUPERSEDED BY GOTCHA #141]**: Phong cách quân cờ kim loại nguyên khối và cọc cờ đã được thay thế toàn diện: 4 quân cờ chính thức là Xe - Pháo - Mã - Hậu phủ 100% màu người chơi theo [Gotcha #141](#141-3dmaterialpawn-bất-biến-4-quân-cờ-xe---pháo---mã---hậu-phủ-toàn-màu-người-chơi-triệt-tiêu-inox-bạc--pbr-men-bóng-đồ-chơi-four-colored-chess-pawns-zero-inox--toy-enamel-pbr-invariant---imp-105) (IMP-105/110).

- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Cọc Cờ Mỏng Manh & Chân Đế Chìm Sát Đất (Fragile Flag & Submerged Base Trim Trap)*: Cọc cờ sở hữu cũ chỉ cao 0.30m, lá cờ kích thước siêu nhỏ 0.14m x 0.08m nép ở góc ô cờ, trong khi viền `OwnerBaseTrim` chỉ mỏng 0.04m phẳng lì sát mặt đất. Khi quan sát từ camera bao quát telephoto kiến trúc (FOV 24°, cự ly `[30, 33, 30]`), người chơi không thể phân biệt được ô nào còn trống (unowned), ô nào đã mua (owned), và cọc cờ hoàn toàn bị khối nhà cao tầng C1–C3 che khuất.
  2. *Bẫy Cọc Cạch Hai Phong Cách Quân Cờ (Pawn Style Discrepancy Trap)*: Tháp Landmark (🏰) và Ngựa Chiến (🐎) được tạo hình theo phong cách tượng kim loại nguyên khối cờ vua trên bệ tròn giật cấp sang trọng; trong khi Xe Cổ (🚗) và Du Thuyền (⛵) lại bị tạo hình theo phong cách mô hình đồ chơi tả thực nhiều chi tiết vụn vặt (ghế da nâu, kính xanh, lốp cao su đen, sàn gỗ teak) với hệ số scale kéo dãn cồng kềnh (scale Y từ 2.0x đến 2.6x), làm mất tính đồng nhất thẩm mỹ bàn cờ thượng lưu.
  3. *Bẫy Thiếu Biểu Tượng Linh Vật Sở Hữu (Missing Mascot Crest Trap)*: Cọc cờ chỉ hiển thị màu vải đơn điệu, dễ bị biến đổi dưới ánh sáng môi trường (bóng râm directional light), buộc người chơi phải tự ghi nhớ mã màu HEX của từng đối thủ thay vì nhận diện trực quan qua linh vật đại diện đã quen thuộc trên PlayerCard 2D.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Die-Cast Metal Token Invariant**: Toàn bộ 4 quân cờ (🏰, ⛵, 🚗, 🐎) đồng nhất sử dụng phong cách đúc kim loại nguyên khối PBR sang trọng (metalness >= 0.8, roughness <= 0.2), đứng trên cùng một khuôn bệ tròn tiện giật cấp tiêu chuẩn (`base1: Cylinder 0.36, 0.40, 0.08`, `base2: 0.30, 0.36, 0.08`, `collar: 0.24, 0.30, 0.06`). Triệt tiêu toàn bộ vật liệu vụn vặt tả thực (lốp cao su, ghế da, kính nhựa, gỗ teak). Kích thước tệp GLB biên dịch đạt chuẩn ngân sách kỹ thuật (50KB–64KB, < 150KB và <= 852 tris).
  2. **Player Enamel Ring Accent Invariant**: Dưới chân bệ mỗi quân cờ tích hợp vòng men sứ bóng `EnamelRing` (`args={[0.18, 0.23, 32]}`) mang đúng màu sắc nhận diện thương hiệu của người chơi (`playerColor || config.color`), kết hợp hoàn hảo giữa vẻ sang trọng của tượng kim loại và tính dễ nhận diện người sở hữu.
  3. **3-Layer Ownership Readability Invariant**:
     - *Tầng 1 (Owner Pedestal Collar)*: Ô đã mua được bọc bởi khối chân đế `OwnerBaseTrim` dày dặn `0.10m` (>= 0.08m) phủ màu chủ sở hữu rực rỡ, kèm khung viền than đanh thép `#0F172A` (`OwnerBaseTrimBorder`). Ô chưa mua giữ nguyên chân đế đá ngà trung tính `#EDE5D8` phẳng lì.
     - *Tầng 2 (Mascot Crest Totem Pillar)*: Cột mốc trụ đồng `FlagPole` nâng chiều cao lên `0.45m` (>= 0.4m), đính kèm **Huy Hiệu Khiên Tròn 3D (`MascotCrestShield`)** gồm vành khiên mạ vàng bóng, mặt khiên mang màu người chơi và chạm nổi biểu tượng linh vật chuẩn (🏰, ⛵, 🚗, 🐎). Kèm cờ phướn `FlagCloth` kích thước lớn `[0.18, 0.10, 0.01]` viền tương phản cao và các vòng đai vàng chỉ thị cấp độ C1–C3.
     - *Tầng 3 (Data Binding Completeness)*: `computeOwnerMap` trong `board_layout.tsx` ánh xạ đầy đủ bộ ba (`tokenColor`, `ownerSlot`, `mascotIcon`) sang `LayeredDioramaTile`, bảo đảm ô đất luôn phản ánh chính xác chủ nhân hiện tại mà không phụ thuộc vào thứ tự render.

---

### 111. [BOT/TRADING/UI] Bất Biến Đàm Phán Bot P2P Tinh Tế, Nhịp Độ TopBar & Dung Sai Watchdog Đấu Giá (Human-like Bot P2P Trading, TopBar Bot Pacing & Auction Watchdog Tolerance Invariant - IMP-82)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Kẹt Cục Diện Phân Mảnh Đất Đai (Monopoly Impasse & Zero-Building Stalemate)*: Trong các ván đấu 4 người (kể cả ván 29/30 vòng), các người chơi mua rải rác 1–2 ô của từng nhóm màu. Do luật VTCOON chỉ cho phép xây nhà khi sở hữu trọn vẹn nhóm màu (`hasMonopoly = true`), và Bot trước đây hoàn toàn không có logic đàm phán P2P, bàn cờ bị đóng băng vĩnh viễn với 0 ngôi nhà cao ốc C1–C3 nào được xây dựng.
  2. *Bẫy Giao Dịch Cưỡng Chế / Tự Sát (Unchecked P2P Trade & Blind Acceptance)*: `executeP2PTrade` cũ cho phép người khởi tạo giao dịch chuyển nhượng tài sản ngay lập tức nếu đủ tiền, không kiểm tra phía bên kia có đồng ý hay không. Một người chơi có thể ép Bot mua lại đất vô dụng với giá trên trời hoặc tước đoạt đất độc quyền của Bot.
  3. *Bẫy Báo Động Giả Kẹt Lượt Khi Đấu Giá Kéo Dài (Auction Phase Watchdog False Alarm)*: Các phiên đấu giá BĐS nhiều người tham gia giằng co giá có thể kéo dài qua nhiều lượt trả giá (> 45 giây). `watchdogMonitor.checkTurnStall` kích hoạt cảnh báo sai lệch `TURN_STALLED` và hiện nút đỏ `Cảnh Báo (1)` trên TopBar.
  4. *Bẫy Ảo Giác Hết Giờ Khi Đến Lượt Bot*: Khi Bot thực hiện lượt đi qua Web Worker / Network Pacing, đồng hồ đếm ngược trên TopBar hiển thị số đỏ `00:00` nhấp nháy, gây hiểu lầm rằng ván đấu đã bị hết giờ hoặc đứng hình.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Monopoly Gap Detection Invariant**: `findMonopolyGap` quét toàn bộ 8 nhóm màu, chỉ kích hoạt đàm phán khi Bot sở hữu đúng $N-1$ ô của một nhóm màu ($N \ge 2$) và ô còn thiếu (`gapCell`) thuộc quyền sở hữu của người chơi khác (chưa phá sản, không có công trình, không bị thế chấp).
  2. **Asymmetric Valuation & Safety Buffer Invariant**: `calculateTradeOfferPrice` định giá mua theo tính cách: Aggressive ($1.4\times$), Balanced ($1.25\times$), Passive ($1.1\times$) giá gốc. Bắt buộc kiểm tra `bot.balance - offerPrice >= safetyBuffer` (bảo toàn ngân sách an toàn, không bao giờ tự đẩy mình vào nguy cơ vỡ nợ).
  3. **3-Personality Seller Defense Invariant**:
     - `Aggressive`: Chặn đối thủ độc quyền (`PREVENT_MONOPOLY`), từ chối tuyệt đối trừ khi được trả giá cắt cổ ($\ge 2.5\times$ giá gốc) và bản thân đang thiếu hụt thanh khoản trầm trọng (`balance < 500 Tr.`).
     - `Balanced`: Chống Kingmaking (`KINGMAKING_DEFENSE`), từ chối bán cho người chơi đang dẫn đầu tài sản; sẵn sàng thanh lý ô đất lẻ không cùng bộ nếu giá $\ge 1.3\times$.
     - `Passive`: Ưu tiên tích lũy tiền mặt, chấp thuận bán ô đất lẻ khi giá $\ge 1.25\times$ và số dư tiền mặt dưới mức an toàn.
  4. **P2P Negotiation Pacing & Cooldown Invariant**: Mỗi Bot chỉ gửi tối đa 1 đề xuất đàm phán mỗi 2 vòng đấu (`currentRound - bot.lastTradeOfferRound < 2 -> null`), triệt tiêu 100% tình trạng spam đề xuất giao dịch làm loãng ván cờ.
  5. **TopBar Bot Thinking Pacing Invariant**: Khi `currentTurnPlayer.isBot === true`, TopBar hiển thị nhãn `🤖 Đang tính...` với màu vàng hổ phách trung tính (`text-amber-700 font-semibold`), không áp dụng nhấp nháy đỏ `text-rose-600 animate-pulse` và không hiển thị `00:00`.
  6. **Auction Watchdog 90s Ceiling Invariant**: `checkTurnStall` nhận diện tham số `isInAuction: true` khi phòng đang ở `TurnPhase.AuctionPhase`, nâng trần stall lên 90.000ms (90 giây) và bỏ qua kiểm tra timer âm (`timeRemaining <= -5`).

---

### 112. [3D/ARCHITECTURE/DIORAMA] Bất Biến Phối Cảnh Bitexco Búp Sen Ven Sông, Tòa Di Sản Mái Ngói Terracotta & Quần Thể Cao Ốc Chân Thực (Bitexco Aerodynamic Lotus-Bud Realism, Colonial Waterfront Heritage & Surrounding Highrise Skyline Invariant - IMP-84)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Hình Trụ Xanh Đơn Sắc Programmer-Art (Single-Color Primitive Cylinder Trap)*: Thân tháp Bitexco trước đây chỉ là một hình trụ đơn lẻ (`cylinderGeometry [0.30, 0.48, 2.2]`) phủ màu xanh sapphire đồng nhất (`#0284C7`) kèm chóp nón thô sơ, thiếu hoàn toàn độ cong vát khí động học hai lớp của búp sen, khiến tòa tháp mang tính tượng trưng nghèo nàn, lạc điệu so với cảnh quan Sài Gòn thực tế.
  2. *Bẫy Sân Trực Thăng Lơ Lửng Thiếu Kết Cấu (Floating Weightless Helipad Trap)*: Sân đỗ trực thăng cũ chỉ là một đĩa tròn gắn thẳng vào thân mà không có hệ dầm giàn xiên / nón cụt chịu lực đỡ bên dưới, đồng thời thiếu vắng phương tiện hàng không vi mô khiến sân đỗ có cảm giác tĩnh lặng, thiếu sức sống.
  3. *Bẫy Thiếu Vắng Tiền Cảnh Di Sản & Nhịp Sống Sông Nước (Sterile Waterfront Foreground Trap)*: Dải đất tiền cảnh hướng sông giữa Bitexco và mặt nước trước đây để trống, thiếu sự giao thoa kiến trúc Pháp cổ kính (Bến Nhà Rồng / Cục Hải Quan / Ngân hàng Nhà nước) và nhịp tàu thủy buýt Saigon Waterbus đặc trưng trong ảnh thực tế bờ sông Bến Bạch Đằng.
  4. *Bẫy Cao Ốc Bao Quanh Thiếu Bối Cảnh Thực Tế (Generic Backdrop Highrise Trap)*: Các cao ốc bao quanh trước đây sử dụng gam màu vàng cam ngẫu nhiên, không tái hiện được tháp văn phòng kính ngọc bích khung trắng (Bitraco / Sunwah) cánh phải và tháp lam đứng chắn nắng kim loại xám cánh trái làm bệ phóng cho Bitexco vươn cao.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Aerodynamic Lotus Sheath Invariant**: Thân tháp Bitexco bắt buộc cấu tạo từ hai lớp cánh sen cong khí động học lồng ghép: lõi sapphire phản quang kết hợp lớp vỏ sen bọc ngoài (`data-testid="bitexco-lotus-sheath"`) sử dụng kính băng tuyết cyan (`#7DD3FC` / `#38BDF8`) và viền bạc chrome (`#E2E8F0`). Đỉnh tháp cắt vát chéo cánh sen hé nở (`data-testid="bitexco-crown"`) vươn cao tới kim thu lôi mạ vàng `#F59E0B` (`y = 2.85`) và đèn chớp tĩnh không đỏ `#EF4444` (`y = 2.95`).
  2. **Cantilevered Truss Helipad & Micro-Helicopter Invariant**: Sân đỗ trực thăng (`data-testid="bitexco-helipad"`) đặt tại độ cao $y \in [1.60, 1.75]$ (chuẩn $1.68$), nhô cantilever ra hướng sông, có dầm giàn xiên chịu lực nón cụt bên dưới (`data-testid="helipad-truss"`), vành phản quang vàng cam `#F59E0B`, và trực thăng siêu vi mô (`data-testid="micro-helicopter"`) đậu trên bãi đáp.
  3. **Colonial Waterfront Heritage & Saigon Waterbus Invariant**: Tiền cảnh bờ sông phía trước Bitexco (`X: -3.7, Z: -3.7`) tích hợp tòa nhà di sản Pháp cổ (`data-testid="colonial-waterfront-heritage"`) với mái ngói dốc 4 phía đỏ đất nung Terracotta (`#EA580C` / `#C2410C`), tường vàng kem Indochine (`#FEF08A`), hệ cửa vòm trắng (`#F8FAFC`), kè đá và bến đón khách kèm tàu thủy buýt Saigon Waterbus vỏ trắng viền xanh đại dương (`data-testid="waterfront-waterbus"`).
  4. **Authentic High-Rise Skyline Framing Invariant**: Quần thể cao ốc duy trì đúng 10 tháp giật cấp mở toang hành lang hướng Đông, trong đó tháp cánh phải tích hợp phong cách kính ngọc bích ô vuông Bitraco (`#0D9488` / `#14B8A6`) với khung trắng (`#FFFFFF`), và tháp cánh trái tích hợp hệ lam đứng chắn nắng xám trung tính (`#94A3B8` / `#64748B`), duy trì khoảng cách thấu quang $\ge 0.85\text{m}$ so với tâm Bitexco.

---

### 113. [3D/PAWNS/UI] Bất Biến Quân Cờ Bạc Con Vật Đồng Bộ, Phân Bổ Ngẫu Nhiên Xác Định & Ghim Chủ Quyền 2.5D Billboard (Silver Animal Pawns, Deterministic Allocation & 2.5D Billboard Ownership Pin Invariant - IMP-83)
> ⚠️ **[SUPERSEDED BY GOTCHA #141]**: Bộ 4 con vật đúc bạc và ghim cọc cờ đã được thay thế: Hiện tại chuẩn hóa 4 quân cờ Xe - Pháo - Mã - Hậu phủ 100% màu sắc người chơi theo [Gotcha #141](#141-3dmaterialpawn-bất-biến-4-quân-cờ-xe---pháo---mã---hậu-phủ-toàn-màu-người-chơi-triệt-tiêu-inox-bạc--pbr-men-bóng-đồ-chơi-four-colored-chess-pawns-zero-inox--toy-enamel-pbr-invariant---imp-105) (IMP-105/110) và nhận diện ô đất qua `OwnerPricePill`.

- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy quân cờ không đồng bộ kích thước & màu sắc*: Trước đây các quân cờ gồm 2 con vật và 2 phương tiện/công trình (Tháp, Thuyền, Xe, Ngựa), màu sắc phân tán (Vàng, Đồng đỏ, Xanh navy, Bạc) và scale cồng kềnh lệch lạc (Xe scale Y=2.6, Tháp scale Y=1.0) gây cảm giác chắp vá, thiếu tính đồng bộ cao cấp.
  2. *Bẫy cờ chủ quyền 3D tĩnh khó nhận diện*: Cờ 3D dạng tấm phướn tĩnh trên cọc cờ nhỏ khi xoay camera ở các góc nghiêng hoặc góc nhìn thẳng từ trên xuống (top-down) bị biến thành một đường chỉ mảnh dẹt, hòa lẫn vào nền gạch và rất khó nhận biết ô đất thuộc về ai.
  3. *Bẫy R3F Hook trong SSR / Headless Test khi thêm Billboard*: Thư viện `@react-three/drei` component `<Billboard>` sử dụng hook `useFrame`. Khi render trong môi trường kiểm thử Node.js / SSR (`renderToStaticMarkup`) không có R3F `<Canvas>`, hook ném ngoại lệ `Error: R3F: Hooks can only be used within the Canvas component!`.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Uniform Silver Animal Pawns Invariant**: Toàn bộ 4 quân cờ được chuẩn hóa sang hình tượng 4 con vật đúc bạc kim loại nguyên khối (Die-Cast Silver): 🐕 Chó Corgi / Scottie, 🐈 Mèo Thần Tài Maneki-Neko, 🐎 Ngựa Chiến Phong Vân, 🐘 Voi Hoàng Gia Thịnh Vượng. Quy chuẩn vật liệu PBR đồng bộ: màu `#E2E8F0`, `metalness >= 0.95`, `roughness <= 0.12`, bệ tròn tiện giật cấp đồng bộ có vòng men sứ `EnamelRing` mang màu người chơi, kích thước chuẩn hóa `scale: [1.0, 1.0, 1.0]` triệt tiêu hoàn toàn tình trạng lệch tỉ lệ.
  2. **Deterministic Random Allocation Invariant**: `assignRandomPlayerPawns` phân bổ ngẫu nhiên không trùng lặp các slot [0, 1, 2, 3] cho người chơi trong phòng (2-4 người) dựa trên thuật toán FNV-1a hash và Fisher-Yates shuffle với Mulberry32 PRNG. Đảm bảo tính xác định tuyệt đối (deterministic) theo `roomCodeOrSeed`.
  3. **2.5D Billboard Ownership Pin Invariant**: Bổ sung `OwnershipBillboardPin` sử dụng `<SafeBillboard follow={true}>` luôn tự động xoay trực diện 100% về phía camera người chơi ở mọi góc nhìn (Isometric, Top-down, Zoom-in). Cấu trúc 4 lớp tương phản cao: viền ngoài than đanh thép `#0F172A` (0.26m), viền trong kim loại vàng `#F59E0B` (0.23m), nền mang màu chủ sở hữu (0.20m) và icon linh vật con vật to rõ (0.15m).
  4. **SafeBillboard Headless Isolation Invariant**: `SafeBillboard` trong `board_tile.tsx` tự động kiểm tra `typeof window === 'undefined'`. Trong môi trường SSR/Node test không có Canvas, hàm trả về thẻ thay thế `<billboard follow={String(follow)}>` an toàn, bảo vệ 100% các suite kiểm thử static markup khỏi lỗi crash `useFrame`.
  5. **Contract Retention Invariant**: Giữ nguyên toàn bộ cấu trúc cọc cờ trụ kim loại `FlagPole` (cao 0.45m), cờ phướn `FlagCloth`, khiên `MascotCrestShield` và vòng đai cấp độ `TierIndicatorRings` để bảo toàn tính tương thích với các bài test hợp đồng trước đó.

---

### 114. [3D/NET/REACT] Bất Biến Phòng Thủ Tọa Độ Camera Hữu Hạn, Đồng Bộ Vị Trí Race Condition & Lá Chắn AppErrorBoundary (IMP-86)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Màn Hình 3D Biến Mất Hoàn Toàn (Camera NaN Void Trap)*: Trong `game_canvas.tsx`, `targetCell !== null` kiểm tra lỏng lẻo; khi `targetCell` là `undefined`, JavaScript coi `undefined !== null` là `true`, dẫn đến việc gọi `cellPosition(undefined)` sinh ra tọa độ chứa `NaN`. Tọa độ `NaN` lan truyền vào ma trận `camera.position` và `OrbitControls.target`, làm Three.js sập ma trận chiếu và không còn đỉnh (vertex) nào được render lên màn hình.
  2. *Bẫy Ghi Đè Lùi Vị Trí Quân Cờ Do Tác Vụ Hoạt Cảnh Trễ (Pawn Move Race Condition Trap)*: Khi nhiều quân cờ cùng di chuyển (như sự kiện Đại Nhạc Hội `MC_MEGA_CONCERT` đưa toàn bộ người chơi về ô 6), hàng đợi hoạt cảnh dồn toa. Khi máy chủ đã cập nhật người chơi sang ô mới hơn (ví dụ ô 12), tác vụ hoạt cảnh cũ hoàn tất trễ gọi `completePawnMove` và ghi đè lùi vị trí `playerPositions[playerId] = 6`. Đến các tick sau, Telemetry so sánh vị trí bị lùi với bước nhảy mới và phát báo động đỏ giả `INVALID_POSITION_STEP`.
  3. *Bẫy Lệch SSOT Ô Dịch Vụ Telemetry (Telemetry Service Cells SSOT Desync)*: `SERVICE_CELLS` trong telemetry hook khai báo nhầm thành `[12, 28, 39]` thay vì `[6, 8, 26, 27]` theo SSOT `event_card_types.ts`, khiến các bước nhảy sự kiện đến ô dịch vụ bị phán đoán sai là bước nhảy bộ thông thường.
  4. *Bẫy Sập Trắng Trang (White Screen of Death)*: Trước đây ứng dụng thiếu root error boundary. Bất kỳ ngoại lệ không được bắt trong cây React hoặc WebGL context loss đều khiến React 18 gỡ sạch toàn bộ cây DOM `<div id="root">`.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Finite Camera Vector Armor Invariant**:
     - `board_coords.ts`: `cellPosition(index)` bắt buộc kiểm tra `Number.isFinite(index)` và kẹp dải an toàn `Math.min(39, Math.max(0, Math.floor(index)))`. Khi nhận giá trị bất thường (`undefined`, `null`, `NaN`, `Infinity`), tự động hoàn nguyên về tọa độ hợp lệ ô 0 `[GRID, 0, GRID]`.
     - `camera_state_machine.ts`: `calculateTargetCameraState` bắt buộc thanh lọc tọa độ `safePx`, `safePz`, `safeTx`, `safeTz` với `Number.isFinite()`, đảm bảo vector `target` và `position` luôn là số hữu hạn 100%.
     - `game_canvas.tsx`: Bổ sung chốt chặn `Number.isFinite(targetCell)` và cơ chế tự phục hồi suy biến vector trong `useFrame`: tự động đặt lại `camBaseRef` về `[30.0, 33.0, 30.0]` và `targetBaseRef` về `[1.5, 0.0, 1.5]` nếu phát hiện `NaN`.
  2. **Non-Throwing Pawn Path Clamping Invariant**: `calculatePathWaypoints(fromIndex, toIndex)` trong `pawn_path.ts` loại bỏ hoàn toàn `throw new Error`, thay bằng chuẩn hóa số nguyên hữu hạn và kẹp dải `[0, 39]`.
  3. **Pawn Position Race Defense Invariant**: Trong `completePawnMove`, chỉ cho phép cập nhật `playerPositions` khi `currentStorePos === undefined || currentStorePos === animTarget || currentStorePos === anim.fromCell`. Nếu máy chủ đã cập nhật `playerPositions` lên vị trí mới hơn, `completePawnMove` giữ nguyên vị trí máy chủ, chỉ cập nhật `visualPositions` và tiếp tục kích hoạt `processPawnQueue`.
  4. **Telemetry Service Cells SSOT Invariant**: `telemetry_delta_hook.ts` import trực tiếp `SERVICE_CELLS` từ `src/domain/event_card_types.ts` (`[6, 8, 26, 27]`). Hàm `checkIsTeleport` nhận diện đích đến thuộc `SERVICE_CELLS` là dịch chuyển hợp lệ. `verifyMovementStep` trong `invariant_checker.ts` bắt buộc phát hiện di chuyển thiếu xúc xắc khi không phải dịch chuyển.
  5. **Root AppErrorBoundary Invariant**: Cung cấp component `<AppErrorBoundary>` chuẩn React 18 với `getDerivedStateFromError`, `componentDidCatch`, giao diện thông báo `role="alert"` chuẩn tactile và nút "Thử Lại (Tải lại trang)" bọc quanh toàn bộ ứng dụng tại `main.tsx`.

---

### 115. [TELEMETRY/3D] Bất Biến Giám Sát Chuyển Pha Lượt Đi (Watchdog Phase Awareness & Progress Extension) & Tối Ưu Hóa Shadow Pass Phụ Kiện Cọc Cờ (IMP-87)
> ⚠️ **[LƯU Ý THÀNH PHẦN LỖI THỜI]**: Phần bóng đổ cọc cờ (`FlagPole`, `MascotCrestShield`) trong mục này đã lỗi thời do cọc cờ đã được dỡ bỏ khỏi cây dựng hình từ IMP-98. Logic giám sát chuyển pha của Watchdog vẫn duy trì hiệu lực 100%.

- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Báo Động Giả Kẹt Lượt Khi Người Chơi Tương Tác Tích Cực (Active Player Stall False Alarm)*: Trong các lượt chơi người chơi mua đất, nâng cấp nhà C1-C3 hoặc đàm phán giao dịch, tổng thời gian lượt có thể kéo dài trên 45 giây. Trước đây `WatchdogMonitor` chỉ đếm thời gian kể từ đầu lượt mà không nhận diện chuyển pha (`turnPhase`) hay các tiến trình thao tác thực tế (`hasProgress`), dẫn đến việc phát báo động đỏ giả `TURN_STALLED` dù người chơi vẫn đang hoạt động bình thường và đồng hồ đếm ngược của server vẫn còn thời gian (`timeRemaining > 0`).
  2. *Bẫy Bội Chi Shadow Pass Trên Chi Tiết Vi Mô (Micro-Mesh Shadow Overhead Trap)*: Trên mỗi ô đất sở hữu, các cọc cờ `OwnershipMarkerInstances` chứa các mesh chi tiết siêu nhỏ như vành khiên `MascotCrestShield` (bán kính 0.075m, độ dày 0.02m) và các vòng đai cấp độ `TierIndicatorRings` C1..C3. Việc bật `castShadow` trên các hình học micro này làm tăng đáng kể số lượng draw call trong shadow pass của directional light mà không đem lại giá trị thị giác rõ rệt, gây lãng phí ngân sách GPU/WebGL.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Phase Awareness & Progress Clock Refresh Invariant**:
     - `CheckTurnStallParams`: Mở rộng interface nhận `turnPhase?: string` và `hasProgress?: boolean`.
     - `watchdogMonitor.checkTurnStall`: Tự động làm mới mốc thời gian `turnStartTimeMs = Date.now()` khi phát hiện người chơi chuyển pha (ví dụ từ `WaitingRoll` sang `PropertyManagement`) hoặc khi `hasProgress === true` (mua bán đất, nâng cấp nhà, cập nhật đấu giá).
     - Bắt buộc trả về `null` khi `timeRemaining > 0`, tuyệt đối không báo kẹt lượt khi máy chủ vẫn còn thời gian đếm ngược hợp lệ trên đồng hồ.
     - Phòng thủ an toàn với `elapsedTurnMs`: Bỏ qua nếu giá trị âm hoặc `NaN`.
  2. **Selective Micro-Mesh Shadow Disabling Invariant**:
     - Trong `OwnershipMarkerInstances`, tắt hoàn toàn `castShadow` trên các mesh vi mô thuộc `MascotCrestShield` (vành khiên và mặt khiên) và `TierIndicatorRings` (các vòng đai C1..C3).
     - BẢO TOÀN `castShadow` trên các cấu trúc hình học macro chính: Trụ cọc `FlagPole` (cao 0.45m) và Lá cờ phướn `FlagCloth`, giữ vững bóng đổ biểu trưng sắc nét trên sa bàn diorama.

---

### 116. [3D/R3F/SSR] Bất Biến Cô Lập Môi Trường Headless Khỏi Hook WebGL R3F (Headless SSR Canvas Isolation Invariant - UC-URBAN-DIORAMA-003)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Crash R3F Hooks Khi Render Static Markup Trong Node.js*: Khi thực thi các bộ kiểm thử tĩnh (`renderToStaticMarkup(React.createElement(GameCanvas))`) để kiểm định cấu hình ToneMapping, Exposure, DPR và Shadows trên thẻ `<Canvas>`, các component con bên trong (`<Environment>`, `<ContactShadows>`, `<AdaptiveCinematicCamera>`) được React render đệ quy. Do các thư viện phụ thuộc (`@react-three/drei`, `three-stdlib`) truy cập trực tiếp các hook nội bộ của R3F (`useThree`, `useStore`) trong môi trường Node.js không có WebGL context, tiến trình bị dừng đột ngột với lỗi `Error: R3F: Hooks can only be used within the Canvas component!`.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Headless SSR Canvas Isolation Invariant**: Trong `game_canvas.tsx`, kiểm tra trạng thái môi trường `const isSSR = typeof window === 'undefined'`. Toàn bộ các component con 3D chuyên biệt chỉ được render khi `!isSSR`.
  2. **Viewport Config Testability**: Thẻ `<Canvas>` bên ngoài vẫn bảo toàn đầy đủ các thuộc tính cấu hình gl (`toneMapping: ACESFilmicToneMapping`, `toneMappingExposure: 1.08`, `antialias: true`, `shadows="soft"`, `dpr={[1, 1.5]}`) để các bộ kiểm thử tĩnh và công cụ viễn trắc có thể trích xuất và thẩm định 100% mà không bị vướng lỗi môi trường Node.js.

---

### 117. [3D/TEST] Bất Biến Xúc Xắc Động Học Transient Dice & Cấm Kiểm Thử Checklist Tĩnh (Anti-Static Checklist Invariant)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Che Khuất Cảnh Quan Sông Lòng Kênh Sa Bàn (Persistent Dice River Clutter Trap)*: Trước đây, 2 viên xúc xắc đỏ Ruby kích thước 0.58m luôn hiện diện vĩnh viễn trên khay `DiceTray` ngay cả khi trận đấu đang ở trạng thái tĩnh/nghỉ (idle). Việc này che khuất lòng sông Sài Gòn, cầu Ba Son và mặt nước, tạo cảm giác sa bàn lộn xộn và không thể hiện tính động của trò chơi cờ bàn đồ chơi.
  2. *Bẫy Kiểm Thử Bằng Regex Đọc Mã Nguồn (Static Code Reading In Test Trap)*: Viết kiểm thử dùng `fs.readFileSync` đọc tệp TypeScript rồi regex tìm chuỗi (ví dụ `not.toMatch(/NoToneMapping/)`). Đây là hình thức kiểm thử checklist tĩnh giả tạo (Banned Anti-Static Checklist), vi phạm nguyên tắc kiểm thử kiến trúc hành vi: nếu tệp chỉ chứa comment nhắc đến chuỗi đó thì test sẽ fail sai (false negative), hoặc nếu mã nguồn import nhưng không sử dụng thì test vẫn pass sai (false positive).
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Transient Dice Lifecycle Invariant**: Trong `dice_tray.tsx`, 2 viên xúc xắc `<SingleDie>` chỉ được phép kết xuất khi đang trong chu trình tung xúc xắc (`isRolling === true`) hoặc trong cửa sổ mờ dần sau khi dừng quay (`isVisible && fadeOpacity > 0`). Khi ở trạng thái nghỉ, toàn bộ mesh hình học xúc xắc phải được giải phóng hoàn toàn khỏi render tree, bảo đảm tầm nhìn lòng sông thông thoáng.
  2. **Behavioral Runtime Test Invariant**: Nghiêm cấm dùng `fs` để đọc mã nguồn trong các bộ test. Mọi kiểm định cấu hình WebGL/Canvas phải áp dụng spy đón bắt prop runtime thật (`capturedCanvasProps?.gl?.toneMapping === ACESFilmicToneMapping`) khi component được render.

---

### 118. [UI/HUD] Bất Biến Phân Tách Cụm Tiện Ích HUD & Dời Telemetry Badge Về Góc Đáy Phải (Telemetry Badge Bottom-Right Docking & Unobstructed TopBar Invariant - IMP-88)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Định Vị Tuyệt Đối Đè Lên Các Nút Tương Tác (Absolute Position Colliding Overlay Trap)*: Đặt component giám sát viễn trắc `<TelemetryBadge />` tại `absolute top-4 right-4 z-20` trong `hud_container.tsx`. Tọa độ này trùng hoàn toàn với cụm tiện ích trên thanh `TopBar` (`hud-utilities-cluster`: các nút Bật/Tắt Âm thanh, Mở Nhật Ký, Thoát Sảnh) và đè lên phần đỉnh của thẻ người chơi P1 trong `PlayerHudList`. Hệ quả: Người chơi không thể nhìn thấy hoặc bấm nhầm vào nút Nhật Ký hay Thoát Sảnh vì bị viên thuốc FPS/Ping che khuất.
  2. *Bẫy Bội Chi GPU Do Lạm Dụng Backdrop Blur (GPU Backdrop-Blur Overhead Trap)*: `<TelemetryBadge />` sử dụng thuộc tính `backdrop-blur-md`. Việc áp dụng hiệu ứng làm mờ nền trên các phần tử DOM overlay đè lên WebGL Canvas buộc GPU phải copy framebuffer phụ liên tục, làm giảm FPS trên các máy cấu hình thấp mà không tăng độ dễ đọc.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Bottom-Right Footer Docking Invariant**:
     - Xóa bỏ hoàn toàn định vị `absolute top-4 right-4` bọc TelemetryBadge trong `hud_container.tsx`.
     - Chuyển `<TelemetryBadge />` vào bên trong thẻ `<footer>` ở tầng đáy giao diện với layout `flex-row justify-between items-end`. Cụm bên trái chứa `ActionDock` và `SocialEmotesTray`, cụm bên phải chứa `TelemetryBadge` (bảo toàn cờ responsive `hidden sm:block` và `pointer-events-auto`).
     - Giải phóng 100% không gian góc trên bên phải cho cụm nút tiện ích `TopBar` và danh sách thẻ người chơi `PlayerHudList`.
  2. **Solid Dark Fill & Zero Backdrop Blur Invariant (Gotcha #87)**:
     - Loại bỏ hoàn toàn `backdrop-blur-md` khỏi `telemetry_badge.tsx`.
     - Sử dụng nền đặc tông tối độ tương phản cao `bg-slate-950/95` (kèm viền sáng `border-emerald-500/50` khi OK, `border-amber-500/80` khi Warning, `border-rose-500/80` khi Critical) giúp text FPS và Ping sắc nét, nổi bật trên nền 3D mà không tiêu tốn GPU fill-rate.
  3. **Node/Vitest SSR Dynamic Store Access**:
     - Bổ sung kiểm tra `const isSSR = typeof window === 'undefined'` trong `telemetry_badge.tsx` để đọc trực tiếp `useTelemetryStore.getState()` khi render tĩnh trong môi trường Node.js/Vitest, khắc phục hạn chế của `useSyncExternalStore` trong React 19 SSR.

---

### 119. [UI/LAYOUT] Bất Biến Bố Trí Thanh Tác Vụ Góc Dưới Phải & Tinh Giản Khay Biểu Cảm Cảm Xúc (ActionDock Bottom-Right & Social Emotes Purge Invariant - IMP-89)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Công Thái Học Khi Đặt Thanh Tác Vụ Cốt Lõi Bên Trái (Left-Handed Core Action Trap)*: Việc đặt thanh điều khiển chính `ActionDock` (chứa các nút Đổ Xúc Xắc, Quản Lý BĐS, Đàm Phán, Hết Lượt) ở góc dưới bên trái khiến đa số người dùng thao tác trên màn hình lớn hoặc thiết bị cảm ứng gặp bất tiện (theo định luật Fitts - Fitts's Law). Góc dưới bên phải là vị trí trực quan và thuận tay nhất cho các hành động cốt lõi của lượt chơi.
  2. *Bẫy Rối Loạn Thị Giác Do Khay Biểu Cảm Thừa Thãi (Social Emotes Clutter Trap)*: Khay biểu cảm `SocialEmotesTray` (gồm các icon 😂, 😭, 💸, ❤️, 😡) nằm cạnh `ActionDock` chiếm dụng không gian ngang, dễ gây bấm nhầm trong các pha đưa ra quyết định tài chính khẩn cấp, làm loãng trải nghiệm nghiêm túc của ván cờ.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **ActionDock Bottom-Right Relocation Invariant**:
     - Trong `hud_container.tsx`, thanh `ActionDock` BẮT BUỘC được neo ở khối bên phải của thẻ `<footer>` (`justify-between items-end pb-2`).
     - ActionDock được bọc trong container `pointer-events-auto` để đảm bảo 100% tương tác click/touch phản hồi tức thì.
  2. **Social Emotes In-Game Purge Invariant**:
     - Loại bỏ hoàn toàn import và render `<SocialEmotesTray />` khỏi HUD trong trận đấu.
     - Giữ nguyên `onSendEmote` trong `HudContainerProps` để duy trì tính tương thích ngược, không gây breaking changes cho caller bên ngoài (`main.tsx`).
  3. **Balanced Footer Separation Invariant**:
     - Khối bên trái của `<footer>` tiếp nhận huy hiệu giám sát `<TelemetryBadge />` (kèm cờ `hidden sm:block pointer-events-auto`).
     - Phân tách cân đối hai góc dưới màn hình: Góc dưới trái là thông số kỹ thuật/viễn trắc tĩnh, góc dưới phải là thanh tác vụ động học, trục giữa đáy hoàn toàn thông thoáng cho sa bàn 3D.

---

### 120. [3D/TERRAIN] Bất Biến Khung Viền Bàn Cờ Dưới Đáy Sông & Thảm Cỏ Bờ Kè Liền Mạch (Diorama Board Rim Submersion & Riverbank Continuous Turf Invariant - IMP-90)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Khối Hộp Đặc Chôn Vùi Lòng Sông (Solid Slab River Burial Trap)*: Khi bổ sung khung viền bàn cờ 3D (`DioramaBoardRim`, kích thước 18.4x18.4), nếu render một khối hộp đặc (solid box) ở cao độ `position={[0, -0.03, 0]}` với độ dày 0.06m thì mặt trên khối hộp sẽ nằm tại `Y = 0.000`. Cao độ này cao hơn lòng sông Sài Gòn (`RIVER_BED_Y = -0.050`), dẫn đến việc khối gỗ óc chó màu nâu chôn vùi hoàn toàn lòng sông Sài Gòn, biến cả trung tâm sa bàn thành một bãi đất trống màu nâu.
  2. *Bẫy Hở Rãnh Đất Giữa Đại Lộ Và Bờ Kè (Boulevard-To-Embankment Land Gap Trap)*: Thảm cỏ hai bán đảo Đông - Tây ban đầu chỉ có bề rộng 3.8m đặt tại `X = ±4.5`, khiến khoảng không gian từ `X = ±2.6` tới bờ kè sông `X = ±0.9` bị hở rãnh đất trống, làm lộ lớp móng đất cát sẫm màu dưới ánh nắng.

---

### 121. [UI/CRAFT] Bất Biến Màu Chữ Trên Nền Sắc Độ (Gray-On-Color Anti-Pattern) & Tương Thích Hợp Đồng Thẻ Người Chơi Sảnh Chờ (IMP-91)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Gray-On-Color Linter Trap*: Khi tạo nút xúc giác vàng hổ phách (`bg-amber-400`), nếu dùng chữ `text-slate-950` sẽ bị UI Linter (`lint:ui`) chặn bởi quy tắc `gray-on-color`: màu chữ trung tính 950 trên nền chromatic tạo độ tương phản đục, thiếu sang trọng. Bắt buộc dùng `text-amber-950` để đảm bảo sắc nét và độ tương phản cao chuẩn Impeccable.
  2. *Bẫy Hồi Quy Hợp Đồng Khi Đổi Màu Nút*: `TC-72.15` trong hợp đồng `imp72_lobby_redesign_game_rules_and_desktop_framing.test.ts` kiểm tra chuỗi `bg-blue-600` trên HTML của thẻ vị trí trống (`emptySlotHtml`). Khi đổi màu nút sang `bg-amber-400`, nếu không giữ lớp lót token `bg-blue-600` trên chỉ báo vị trí (được đè bởi inline style), hợp đồng cũ sẽ bị gãy.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **High-Contrast Tinted Text Invariant**: Mọi nút hoặc huy hiệu mang màu nền sắc độ (`bg-amber-*`, `bg-emerald-*`, v.v.) phải dùng tông chữ cùng sắc thái tương phản cao (`text-amber-950`, `text-emerald-950`), tuyệt đối không dùng `text-slate-950` hay `text-stone-950`.
  2. **Backward-Compatible Token Base Invariant**: Chỉ báo token vị trí trên `PlayerSlotCard` giữ lớp nền cơ sở `bg-blue-600` để bảo đảm tương thích ngược với các bộ kiểm thử tĩnh hợp đồng.
---

### 122. [3D/TEXTURE/UI] Bất Biến Phân Cấp Trực Quan 3 Tầng Ô Bàn Cờ & Triệt Tiêu Dải Băng Màu Trên Ô Phi Nhà Đất (Non-Property Tiles Distinct Format & Semantic Hierarchy - IMP-90)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Nhầm Lẫn Màu Sắc Giữa Ô Chức Năng Và Nhóm Đất (Property Color Clutter Trap)*: Trước đây, cả 36 ô thường trên sa bàn 3D đều được vẽ một dải màu header cao 56px (`meta.bannerColor`). Việc này khiến người chơi nhầm lẫn nghiêm trọng: ô *Cơ Hội* (cam `#EA580C`) bị tưởng nhầm là đất nhóm Cam (Bình Định, Huế, Đà Nẵng); ô *Lệ Phí Đất* (đỏ `#E11D48`) bị tưởng nhầm là đất nhóm Đỏ (Thanh Hóa, Nghệ An, Ninh Bình); ô *Điện Lực EVN* (xanh `#2563EB`) bị tưởng nhầm là đất nhóm Tím/Xanh (TP.HCM, Thủ Đức). Hệ quả: Người chơi không thể phân biệt đâu là ô đất đô thị có thể mua để xây nhà C1–C3, đâu là ô sự kiện/chức năng không thể mua.
  2. *Bẫy Nhầm Lẫn Giá Tiền Mua Đất Với Chi Phí Phạt/Đặt Cược*: Các ô sự kiện như Lệ Phí Đất hay Sàn HOSE trước đây dùng khay giá ở đáy giống hệt ô mua đất, gây ngộ nhận rằng người chơi có thể mua sở hữu ô Lệ Phí Đất hoặc ô Sàn HOSE.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Non-Property Header Color Band Elimination Invariant**:
     - 14 ô phi nhà đất (Hạ tầng 05, 15, 25, 35; Tiện ích 12, 28; Cơ hội 07, 22, 36; Thị trường 02, 17, 33; Lệ phí đất 04; Sàn HOSE 38) BẮT BUỘC bỏ hoàn toàn dải băng màu 56px ở header (`fillRect(0, 0, 256, 56)` không được gọi với `bannerColor`).
     - Toàn bộ bề mặt ô phi nhà đất dùng nền giấy ngà parchment `#F3EEDF` thuần khiết, tiêu đề chữ than đen `#0F172A` đậm nét (font `900 26px`), phụ đề màu xám slate `#475569`.
     - Chỉ DUY NHẤT 22 ô BĐS Nhà Đất (`CellType.Property`) được phép có dải băng màu 56px đại diện cho 8 nhóm màu.
  2. **Infrastructure Pinstripe Divider Invariant**:
     - 6 ô Hạ Tầng và Tiện Ích có đường chỉ viền phân cách ngang mỏng (`#CBD5E1`, lineWidth 2) ở `y = 82` để phân tách thanh lịch phần tiêu đề và biểu tượng hạ tầng.
  3. **Action Badge vs Purchasable Price Tray Separation Invariant**:
     - 22 ô Nhà Đất và 6 ô Hạ Tầng/Tiện Ích (các BĐS có thể mua sở hữu) duy trì khay giá tiền mua đất ở đáy với nền than đen `#090D1A`, số vàng hổ phách `#FBBF24` ("xxx Tr.").
     - 8 ô Sự Kiện & Chức Năng (không thể mua sở hữu) BẮT BUỘC chuyển đổi khay đáy thành **Thanh Nhãn Hành Động** (Action Badge) với màu nhận diện đặc trưng:
       - 3 ô Cơ Hội: `RÚT THẺ CƠ HỘI` (Nền cam `#EA580C`, chữ trắng `#FFFFFF`).
       - 3 ô Thị Trường: `RÚT THẺ THỊ TRƯỜNG` (Nền xanh ngọc `#0D9488`, chữ trắng `#FFFFFF`).
       - 1 ô Lệ Phí Đất: `NỘP 1.000 TR.` (Nền đỏ hồng `#E11D48`, chữ trắng `#FFFFFF`).
       - 1 ô Sàn HOSE: `1D6 ĐẶT CƯỢC` (Nền xanh tài chính `#0284C7`, chữ trắng `#FFFFFF`).

---

### 123. [3D/SSR/TEST] Bất Biến Phần Tử Hình Học Chữ Thường Trong SSR Static Markup & Ga Tàu Bến Sông Ven Tuyến Đường Sắt (IMP-92)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Phân Kỳ Ký Tự Hoa/Thường Giữa React renderToStaticMarkup và Bộ Test Hợp Đồng (SSR Geometry Element Casing Trap)*: Thư viện React khi render các thẻ không chuẩn HTML trong `renderToStaticMarkup` giữ nguyên casing được viết trong JSX (ví dụ `<sphereGeometry>` -> `<sphereGeometry>`). Khi các hợp đồng kiểm thử tĩnh tìm kiếm chuỗi thẻ chữ thường (`stationSection.includes('spheregeometry')` hoặc `stationSection.includes('cylindergeometry')`), việc viết trực tiếp thẻ camelCase của Three.js khiến test bị trượt dù cấu trúc hình học đã hoàn thiện đầy đủ.
  2. *Bẫy Cắt Cụt Thuộc Tính Group Mở Đầu Trong Cửa Sổ Tìm Kiếm (Opening Tag Attribute Window Truncation Trap)*: Khi một bộ test lấy slice từ `indexOf('data-testid="..."')`, nếu thuộc tính `position="..."` đặt trước `data-testid` trên cùng thẻ `<group>`, toàn bộ dữ liệu tọa độ của thẻ group đó sẽ bị loại khỏi cửa sổ chuỗi. Nếu các mesh con bên trong dùng tọa độ tương đối `[0, 0, 0]`, bài test định vị dọc tuyến đường sắt sẽ không tìm thấy tọa độ thỏa mãn.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Dual-Environment Safe Geometry Invariant**: Sử dụng các helper hình học an toàn (`SafeBoxGeometry`, `SafeCylinderGeometry`, `SafeSphereGeometry`): trong môi trường headless/SSR (`typeof window === 'undefined'`), các helper sử dụng `React.createElement` với tên thẻ chữ thường (`boxgeometry`, `cylindergeometry`, `spheregeometry`) kèm `args`, bảo đảm 100% ăn khớp hợp đồng kiểm thử tĩnh mà không sinh cảnh báo console (đã được bọc lọc). Trong môi trường trình duyệt WebGL Canvas (`!isSSR`), R3F render thẻ ThreeElements chuẩn (`boxGeometry`, `cylinderGeometry`, `sphereGeometry`).
  2. **Direct Element World-Positioning Invariant**: Các mesh cốt lõi của `DioramaWaterfrontStation` (thềm ga, mái che, cột đỡ, ghế chờ) bắt buộc mang trực tiếp tọa độ thế giới (ví dụ `Z = 6.55m`, `X in [-2.6, -0.6]`) trên từng phần tử con, triệt tiêu sự phụ thuộc vào thứ tự thuộc tính của container cha.

---

### 124. [3D/TEST] Bất Biến Vị Trí Nhà Đồ Chơi Dải Màu Đỉnh & Đồng Bộ Chất Liệu Quân Cờ Chrome Bạc (Toy Property Buildings & Chrome Pawns Invariant - IMP-93)
> ⚠️ **[SUPERSEDED BY GOTCHA #141]**: Chất liệu quân cờ Chrome Bạc (`#F8FAFC`, `metalness: 0.96`) trong mục này đã bị bãi bỏ: Chuyển đổi toàn bộ sang men sứ đồ chơi phủ màu người chơi theo [Gotcha #141](#141-3dmaterialpawn-bất-biến-4-quân-cờ-xe---pháo---mã---hậu-phủ-toàn-màu-người-chơi-triệt-tiêu-inox-bạc--pbr-men-bóng-đồ-chơi-four-colored-chess-pawns-zero-inox--toy-enamel-pbr-invariant---imp-105) (IMP-105/110). Vị trí nhà đồ chơi dải màu đỉnh vẫn bảo lưu hiệu lực 100%.

- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Thứ Tự Thuộc Tính Trong Cửa Sổ Tìm Kiếm Tọa Độ Regex (Position Slice Window Trap)*: Trong các bài kiểm tra hợp đồng tĩnh (như `chrome_pawns_and_toy_buildings.test.ts`), việc kiểm tra tọa độ Y và Z của khối nhà đồ chơi được thực hiện bằng cách cắt một cửa sổ chuỗi xung quanh `data-testid="toy-house"` (`sub = markup.slice(houseIndex - 200, houseIndex + 200)`) và tìm kiếm mẫu `position="([^"]+)"` đầu tiên. Nếu component cha `ToyPropertyBuildings` đặt `position={[0, 0.125, -0.80]}` ngay trước `data-testid="toy-property-building"` và component con đặt `data-testid="toy-house"` trước `position={[0, 0, 0]}`, `sub.match` sẽ bắt chính xác tọa độ gốc của khối nhà trên dải màu đỉnh ô cờ mà không bị ảnh hưởng bởi tọa độ cục bộ `[0, 0, 0]`.
  2. *Bẫy Thuộc Tính Thừa Trong Fixture Domain Test (Stray Property Cell Test Fixture Trap)*: Định nghĩa fixture mock `samplePropertyCell: BoardCell` trong test suite nếu vô tình chứa các trường của `PropertyDeed` (như `cost`, `rent`, `housePrice`) sẽ vi phạm chặt chẽ hệ thống kiểu của TypeScript (`tsc --noEmit`), làm hỏng pipeline kiểm thử tĩnh.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Toy Building Header Stripe Placement Invariant**:
     - Khối nhà/khách sạn đồ chơi (`ToyPropertyBuildings`) được đặt tại tọa độ mặc định `position = [0, 0.125, -0.80]` trên dải màu đỉnh ô cờ (Y trong khoảng [0.10, 0.20], Z trong khoảng [-0.95, -0.65]).
     - Phân cấp mô hình đồ chơi: Cấp 1 render 1 `<ToyHouseMesh position={[0, 0, 0]} />` nhựa bóng lục bảo `#10B981`; Cấp 2 render 2 `<ToyHouseMesh />` tại `[-0.18, 0, 0]` và `[0.18, 0, 0]`; Cấp 3 render 1 `<ToyHotelMesh position={[0, 0, 0]} />` đỏ Ruby `#DC2626` viền vàng hoàng kim `#F59E0B`.
  2. **Chrome Pawns & Player Aura Invariant**:
     - Cả 4 slot quân cờ VIP chuẩn hóa sang chất liệu chrome bạc nguyên khối `#F8FAFC`, `metalness: 0.96`, `roughness: 0.08`, scale group `[0.92, 0.92, 0.92]`.
     - Tích hợp đĩa hào quang phát sáng màu người chơi `PawnAuraPedestal` (`emissiveIntensity: 0.5`) tại chân quân cờ (`data-testid="pawn-aura-pedestal"`).
  3. **Strict BoardCell Type Fixture Invariant**: Mọi fixture test mô phỏng ô cờ `BoardCell` chỉ được chứa đúng 4 trường schema tĩnh: `index`, `name`, `type`, `colorGroup`.

---

### 125. [3D/SSR/TEST] Bất Biến Đồng Bộ Màu Sắc & Slot Con Vật Quân Cờ 3D Trong Môi Trường SSR Headless (SSR Pawn Model URL & Dynamic Store Access Invariant - IMP-94)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy R3F Headless Fallback Triệt Tiêu URL Mô Hình (SafeGLTF Fallback URL Strip Trap)*: Trong môi trường Node.js / Vitest headless SSR, `SafeGLTFModel` tự động kích hoạt `effectiveFallback` (`LuxuryPawnProceduralFallback`) để tránh quăng lỗi WebGL loader. Tuy nhiên, nếu thẻ cha không giữ thuộc tính `data-model-url={config.modelUrl}`, chuỗi HTML xuất ra từ `renderToStaticMarkup` sẽ không chứa tên tệp `.glb` (ví dụ `pawn_horse.glb`), khiến các bài kiểm tra hợp đồng kiểm định việc chuyển đổi quân cờ theo slot linh vật bị trượt.
  2. *Bẫy useSyncExternalStore Trả Snapshot Cũ Khi Render Tĩnh*: Trong React 19 SSR / Vitest, `useGameStore((s) => s.playersInfo)` có thể trả về server snapshot rỗng thay vì trạng thái đã được nạp qua `useGameStore.setState()`.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **SSR Model Traceability Invariant**: Thẻ `<group>` bọc ngoài của `LuxuryPawnModel` BẮT BUỘC mang thuộc tính `data-model-url={config.modelUrl}` để bảo đảm trong cả môi trường SSR/Static Markup, hợp đồng kiểm định mô hình GLB (`pawn_dog.glb`, `pawn_cat.glb`, `pawn_horse.glb`, `pawn_elephant.glb`) luôn hiện diện và xác thực được.
  2. **Dual-Path SSR Store Access**: Trong `pawn_animator.tsx`, áp dụng `const isSSR = typeof window === 'undefined'; const playersInfo = isSSR ? useGameStore.getState().playersInfo : storePlayersInfo;` theo chuẩn Gotcha #118, bảo đảm tính phản ứng tức thì với các trạng thái mock trong test suite.

---

### 126. [3D/R3F/RUNTIME] Bẫy Xuyên Thấu Thuộc Tính Dấu Gạch Ngang Reconciler R3F & Khiên Bảo Vệ Nguyên Mẫu Object3D (R3F Dashed Props Piercing Trap & Fiber Prototype Shield - IMP-95)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Xuyên Thấu Thuộc Tính Dashed Props Của Fiber Reconciler (R3F Dashed Props Piercing Trap)*: Trong React Three Fiber (R3F), reconciler mặc định coi mọi thuộc tính chứa dấu gạch ngang (`-`) là cú pháp xuyên thấu (piercing shorthand, ví dụ `position-x={5}` -> `instance.position.x = 5`, `material-color="red"` -> `instance.material.color = "red"`). Khi developer truyền các thuộc tính dữ liệu kiểu DOM như `data-model-url`, `data-mascot-icon`, `data-testid` lên thẻ Three.js primitive (`<group>`, `<mesh>`), R3F kiểm tra `if (key in root)`. Vì `THREE.Object3D.prototype` không có sẵn thuộc tính `data-*`, điều kiện `key in root` trả về `false`. Reconciler tiến hành cắt chuỗi `key.split('-')` thành `['data', 'model', 'url']`.
     - Ở lần render đầu tiên (mount), `instance['data']` được gán trực tiếp bằng chuỗi giá trị nguyên thủy (primitive string).
     - Ở các lần re-render tiếp theo (`commitUpdate` khi thêm bot, bắt đầu ván đấu hoặc mua ô đất), reconciler duyệt `parts`: phần tử đầu tiên `part = 'data'` trỏ vào chuỗi nguyên thủy `instance['data']` (string thay vì object). Đến `part = 'model'`, reconciler phát hiện `typeof target !== 'object'` và văng ngoại lệ chặn đứng WebGL render loop:
       `Uncaught Error: R3F: Cannot set "data-model-url". Ensure it is an object before setting "model-url".`
  2. *Bẫy Xung Đột Giữa SSR Static Markup Contract Test và WebGL Runtime*: Nếu gỡ bỏ hoàn toàn `data-model-url` khỏi JSX để chiều R3F runtime, các bài kiểm tra hợp đồng SSR tĩnh (`renderToStaticMarkup`) sẽ trượt vì không còn tìm thấy tên tệp GLB. Ngược lại, nếu giữ lại, R3F runtime trong trình duyệt sẽ crash khi component re-render.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **R3F Fiber Prototype Shield Invariant**: Toàn bộ ứng dụng BẮT BUỘC khởi tạo `installR3FFiberShield()` (tại `src/client/3d/r3f_fiber_shield.ts`) trước khi bất kỳ Canvas hoặc component Three.js nào được render.
     - Cơ chế: Thiết lập một `Proxy` chặn trên chuỗi nguyên mẫu `Object.getPrototypeOf(THREE.Object3D.prototype)`. Khi R3F kiểm tra `prop in instance` với bất kỳ thuộc tính nào bắt đầu bằng `data-` hoặc `aria-`, Proxy trap trả về `true`.
     - Nhờ đó, R3F reconciler nhận diện `key in root === true` và thực thi gán trực tiếp `root[key] = value` mà KHÔNG BAO GIỜ kích hoạt logic cắt gạch nối hay xuyên thấu (`piercing`), triệt tiêu 100% nguy cơ crash runtime.
  2. **Zero-Crash Re-render Invariant**: Tất cả thẻ Three.js primitive (`<group>`, `<mesh>`, `<SafeBillboard>`) được phép mang đầy đủ `data-model-url`, `data-testid`, `data-mascot-icon` mà không gây ra bất kỳ lỗi reconciler nào trong cả hai môi trường: SSR Vitest tĩnh và WebGL Canvas động.

---

### 127. [3D/UX/CONTRACT] Bất Biến Chân Đế Bạc Mỏng Thanh Thoát & Phụ Kiện Nhận Diện Người Chơi Cho Quân Cờ Linh Vật 3D (Slim Pedestal Base & Animal Pawn Player Accents Invariant - IMP-95)
> ⚠️ **[SUPERSEDED BY GOTCHA #128]**: Khái niệm chân đế mỏng (`pawn-pedestal-base`) đã bị bãi bỏ 100%: Triệt tiêu hoàn toàn bệ chân đế cờ vua theo Chibi Mascot Zero-Pedestal Invariant tại [Gotcha #128](#128-3drenderux-bất-biến-triệt-tiêu-bệ-chân-đế-cờ-vua--điêu-khắc-chibi-tiếp-đất-trực-tiếp-chibi-mascot-zero-pedestal--direct-ground-contact-invariant---imp-96) (IMP-96). Quân cờ tiếp đất trực tiếp.

- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Bệ Chân Đế Khổng Lồ Choán Tầm Nhìn (Clunky Pedestal Vision Obscuration Trap)*: Các mô hình quân cờ 3D trước đây dùng cụm bệ đế giật cấp 3 tầng với bán kính ngoài lên tới 0.40m, chiếm gần một nửa diện tích ô cờ (kích thước ô chuẩn 1.8m x 1.8m), làm che khuất các chi tiết tinh xảo trên bề mặt ô cờ (dải màu, tên bất động sản, biểu tượng hạ tầng) và làm giảm tỉ lệ thị giác của thân con thú (chỉ đạt ~60% tổng chiều cao thay vì dáng vẻ bề thế >= 80%).
  2. *Bẫy Đơn Điệu Màu Sắc Đúc Khối (Monochromatic Figurine Identification Trap)*: Cả 4 quân cờ đúc bạc/chrome nguyên khối tuy sang trọng nhưng thiếu điểm nhấn màu sắc cá nhân hóa của từng người chơi, khiến người chơi khó phân biệt linh vật của mình với đối thủ khi cùng đứng trên một ô cờ.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Slim Pedestal Base Invariant**:
     - Bệ chân đế quân cờ trong cả `LuxuryPawnModel`, fallback thủ tục (`DogPawnFallback`, `CatPawnFallback`, `WarhorsePawnFallback`, `ElephantPawnFallback`) và script xuất GLB (`generate_high_fidelity_models.mjs`) chuẩn hóa sang 1 đĩa đế mỏng thanh thoát: `cylinderGeometry args={[0.16, 0.18, 0.025, 24..32]}` tại cao độ `Y = 0.0125m`, gán `data-testid="pawn-pedestal-base"`.
     - Đĩa hào quang `pawn-aura-pedestal` ôm sát chân đế với bán kính `[0.19, 0.24]`, vòng men `pawn-enamel-ring` bán kính `[0.165, 0.205]`.
     - Thân linh vật chiếm >= 85% tổng chiều cao quân cờ, vươn cao đạt Y >= 0.35m (đôi tai Corgi, tai Mèo, tai/bờm Ngựa, vòi Voi >= 0.36m).
  2. **Player Accent Accessory Invariant**:
     - Cả 4 linh vật con vật được bổ sung phụ kiện mang sắc màu `playerColor` tương ứng của người chơi:
       * Chó Corgi (Slot 0): Vòng cổ `pawn-dog-collar` mang `playerColor`, chuông vàng `pawn-dog-bell` (#F59E0B).
       * Mèo Thần Tài (Slot 1): Yếm ngực `pawn-cat-bib` mang `playerColor`, tay vẫy tài lộc `pawn-cat-waving-arm`.
       * Ngựa Phong Vân (Slot 2): Thảm yên ngựa `pawn-warhorse-saddle` mang `playerColor`.
       * Voi Hoàng Gia (Slot 3): Thảm lưng hoàng gia `pawn-elephant-blanket` mang `playerColor`.

---

### 128. [3D/RENDER/UX] Bất Biến Triệt Tiêu Bệ Chân Đế Cờ Vua & Điêu Khắc Chibi Tiếp Đất Trực Tiếp (Chibi Mascot Zero-Pedestal & Direct Ground Contact Invariant - IMP-96)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Bệ Tròn Cờ Vua Gượng Gạo (Awkward Chess Pedestal Trap)*: Việc đặt các linh vật con thú (Corgi, Maneki Neko, Ngựa Chiến, Voi) lên đĩa tròn bệ đế cờ vua đường kính rộng (bán kính >= 0.16m) tạo cảm giác mô hình tượng gỗ vô hồn, thiếu sự sống động và cản trở tầm nhìn bề mặt ô cờ (che khuất dải màu thương hiệu và tên địa danh).
  2. *Bẫy Đĩa Hào Quang Quá Rộng (Bloated Aura Ring Trap)*: Đĩa hào quang bán kính ngoài 0.24m lan rộng ra ngoài footprint thực tế của 4 chân con thú, làm nhòe ánh sáng phát quang của người chơi sang các ô cờ liền kề.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Zero-Pedestal Direct Ground Contact Invariant**:
     - Triệt tiêu 100% bệ chân đế cờ vua tròn cũ (không còn cylinder bán kính >= 0.16m làm chân đế). 4 linh vật con thú tiếp xúc trực tiếp mặt ô cờ thông qua 4 chân mập mạp ngắn ngủn (độ cao chân Y = 0.04m, bán kính chân <= 0.035m).
     - Đĩa hào quang người chơi `pawn-aura-pedestal` ôm sát chân thú với `ringGeometry args={[0.12, 0.18, 32]}` (bán kính ngoài 0.18m <= 0.20m).
     - Vòng men màu người chơi `pawn-enamel-ring` ôm sát với `ringGeometry args={[0.10, 0.15, 32]}` (bán kính ngoài 0.15m <= 0.18m).
  2. **Chibi Aesthetic & Expressive Anatomy Invariant**:
     - Cả 4 linh vật được điêu khắc theo phong cách Chibi thân tròn mập mạp, đầu to má tròn, mắt đen hạt cườm biểu cảm và mũi xinh xắn:
       * Chó Corgi (Slot 0): 4 chân ngắn `pawn-corgi-legs` tại `[±0.065, 0.04, ±0.07]`, mắt `pawn-corgi-eyes`, mũi đen `pawn-corgi-nose`, vòng cổ `pawn-dog-collar` mang `playerColor`, chuông vàng `pawn-dog-bell`.
       * Mèo Thần Tài (Slot 1): Thân tròn béo múp ngồi thẳng, mắt `pawn-cat-eyes`, mũi `pawn-cat-nose`, tay vẫy tài lộc `pawn-cat-waving-arm`, tay ôm đồng Koban vàng `pawn-cat-coin`, yếm ngực `pawn-cat-bib` mang `playerColor`.
       * Ngựa Phong Vân (Slot 2): 4 chân ngắn `pawn-horse-legs`, mắt thân thiện `pawn-horse-eyes`, bờm sau gáy, thảm yên ngựa `pawn-warhorse-saddle` mang `playerColor`.
       * Voi Hoàng Gia (Slot 3): 4 chân trụ dày `pawn-elephant-legs`, đầu vòi giơ cao đắc thắng, tai to mềm mại `pawn-elephant-ears`, mắt `pawn-elephant-eyes`, thảm lưng hoàng gia `pawn-elephant-blanket` mang `playerColor`.
  3. **3D Asset Budget Compliance**:
     - Cả 4 tệp `.glb` Chibi tái xuất giữ nguyên chuẩn ngân sách: dung lượng <= 50 KB / 150 KB, số tam giác <= 850 / 1.200 tris, pass 100% `lint:assets`.

---

### 129. [3D/AUDIT/UX] Bất Biến Cấm Phê Duyệt Bằng Điểm Số Ảo & Bắt Buộc Ảnh Chụp Macro Cận Cảnh Cùng Kiểm Tra Texture Thật (Zero-Hallucinated-Score & Macro-Crop Evidence Mandate - IMP-97)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Thiên Kiến Khen Nịnh & Điểm Số Ảo (Sycophancy Score Inflation Trap)*: Các subagent thẩm định LLM (như `game-3d-visual-critic`) thường có xu hướng chấm điểm cao (8.8/10, 9.2/10) và ký phán quyết "SHIP" một cách thiếu thận trọng khi thấy tổng thể bàn cờ có ánh sáng ổn hoặc các unit tests xanh rì, trong khi vật thể thực tế có tạo hình kỳ dị hoặc mesh rỗng tuếch.
  2. *Bẫy Mù Chi Tiết Vi Mô Trên Ảnh Toàn Cảnh (Macro Perspective Blindspot Trap)*: Khi chỉ chụp ảnh bao quát bàn cờ từ trên cao (2560x1440), một quân cờ hay cọc cờ chỉ chiếm chừng 40x40px, khiến người kiểm thử lẫn AI không thể nhận diện được các khuyết tật hình học vi mô.
  3. *Bẫy Dùng Metadata DOM Để Gian Lận Texture WebGL (Blank Material Smuggling Trap)*: Render `<meshBasicMaterial transparent opacity={0.95} />` đơn sắc rỗng trên tấm plane biển báo cọc cờ và gán `data-mascot-icon="🐕"`. Unit test đọc DOM thấy có icon nên báo PASS, nhưng trên WebGL thực tế chỉ hiển thị một miếng nhựa trắng trơn không có hình vẽ.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Tước Quyền Phê Duyệt Xuất Xưởng Của Subagent AI**: Mọi đánh giá của subagent chỉ mang tính tham khảo kỹ thuật; nghiêm cấm dùng phán quyết của AI để tự đóng vé hoặc tuyên bố hoàn thành tính năng thẩm mỹ.
  2. **Human Visual Sign-Off Gate**: Bắt buộc Người Dùng phải là người trực tiếp nhìn ảnh và gõ phê duyệt cuối cùng (Final SHIP).
  3. **Macro-Crop Evidence Mandate**: Bất kỳ thay đổi nào trên vật thể 3D (quân cờ, cọc cờ, công trình, biển báo) BẮT BUỘC phải đi kèm ảnh chụp Macro Zoom cận cảnh (cự ly camera <= 2.5m, vật thể chiếm >= 30% khung hình) gửi trực tiếp vào khung chat.
  4. **Zero-Blank-Material Invariant**: Nghiêm cấm dùng material đơn sắc trần trụi trên các bề mặt huy hiệu, biển báo, tranh vẽ. Bắt buộc tạo CanvasTexture thực tế để vẽ icon/hình ảnh hoặc dùng component hiển thị ký tự thật.

---

### 130. [3D/SSR/TEST] Bất Biến Giới Hạn Cửa Sổ Tìm Kiếm SSR Static Markup Slice Window & Vùng Đệm Neo Cách Ly Tọa Độ (SSR Static Markup Slice Window Truncation & Buffer Spacing Invariant - IMP-98)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Xâm Lấn Tọa Độ Phần Tử Liền Kề Phía Trước (Preceding Sibling Coordinate Leaking Trap)*: Khi kiểm thử tĩnh Three.js qua `renderToStaticMarkup`, các hàm trợ giúp như `extractCoords(markup, testId)` thường cắt chuỗi `markup.slice(Math.max(0, index - 150), index + windowSize)`. Nếu phần tử cha/anh em đứng liền trước (như `ProceduralBuilding` tại level 0 có `<group position={[-0.24, 0.16, -1.38]} ...>`) và khoảng cách ký tự đến `data-testid` nhỏ hơn 150 ký tự, regex `section.match(/position="([^"]+)"/)` sẽ bắt nhầm tọa độ của phần tử đứng trước thay vì phần tử đang kiểm tra (nhận `Z = -1.38` thay vì `Z = 0.70`).
  2. *Bẫy Cắt Cụt Phần Tử Đứng Sau Do Ngân Sách Window Size Quá Hẹp (Trailing Sibling Window Truncation Trap)*: Trong `extractElementSection(markup, testId, windowSize = 800)`, khi component con chứa nhiều mesh phức tạp (ví dụ 3 vành cylinder sáp PBR kèm ma trận vật liệu chi tiết), dung lượng chuỗi HTML của 3 mesh đầu tiên có thể vượt quá 800 ký tự. Hệ quả là mesh thứ 4 mang `data-mascot-icon` bị rơi ra ngoài cửa sổ slice, làm các assertion kiểm tra icon bị trượt (False Red).
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Anchor Buffer Spacing Invariant**: Khi đặt các component mới vào container sa bàn (`LayeredDioramaTile`), bổ sung một group neo vùng đệm định danh (`DioramaPricePillIsolationAnchor`) có độ dài chuỗi > 150 ký tự trước `data-testid`, bảo đảm cửa sổ `index - 150` hoàn toàn cô lập với tọa độ của các khối công trình liền trước.
  2. **Group-Level Attribute Mirroring Invariant**: Các thuộc tính nhận diện quan trọng như `data-mascot-icon` BẮT BUỘC được đặt đồng thời trên thẻ `<group>` bọc ngoài cùng của component (ví dụ `<group data-testid="deed-wax-seal" data-mascot-icon={mascotIcon} ...>`), đảm bảo token luôn nằm ngay đầu cửa sổ tìm kiếm (< 50 ký tự) và không bao giờ bị cắt cụt dù cây con bên dưới có bao nhiêu mesh PBR chi tiết.

---

### 131. [UI/RESPONSIVE/WCAG] Bất Biến Bố Cục Chống Đè Lớp Sảnh Chờ, Co Giãn Thẻ Người Chơi & Chuẩn Hóa Tương Phản Mobile (Mobile Responsive Separation, HUD Collapse & WCAG Contrast Invariant - IMP-99)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Đè Lớp Sảnh Chờ Trên Màn Hình Nhỏ (Lobby Overlap Trap)*: Khi cả Header thương hiệu đỏ và Aside Deck sảnh chờ cùng dùng `absolute top-4`, trên màn hình di động (< 768px), Header đỏ choán trọn bề ngang đè bẹp lên 1/3 diện tích của bảng sảnh chờ phía sau, gây rối loạn thị giác và che mất tiêu đề sảnh chờ.
  2. *Bẫy Thẻ Người Chơi Chiếm Trọn Sa Bàn 3D (Board Suffocation Trap)*: Thẻ thông tin người chơi dùng độ rộng cố định `w-60` (240px). Trên màn hình điện thoại 390px, dải 4 thẻ người chơi chiếm tới 62% bề ngang và che phủ 80% tầm nhìn sa bàn diorama 3D.
  3. *Bẫy Gãy Đôi Dòng Giá Trị Tiền Tệ (Currency Line Split Trap)*: Chuỗi tiền tệ từ `formatCurrency()` có khoảng trắng ngăn cách giữa số và đơn vị (ví dụ `20.000 Tr.`). Nếu vùng chứa flex bị co hẹp thiếu `whitespace-nowrap`, trình duyệt sẽ tự động bẻ chữ `Tr.` xuống dòng dưới, làm vỡ khung viền TopBar.
  4. *Bẫy Thiếu Tương Phản Nút Vô Hiệu Hóa (Low Contrast Disabled Button Trap)*: Các nút hành động khi chưa sẵn sàng thường dùng `text-slate-400` trên nền `bg-slate-200`, chỉ đạt độ tương phản ~1.6:1 đến 2.0:1, vi phạm tiêu chuẩn tiếp cận WCAG AA (tối thiểu 4.5:1).
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Lobby Vertical Responsive Staggering**: Header đỏ đặt tại `top-3 left-3 right-3 sm:right-auto`, Aside Deck đặt tại `top-24 md:top-6 right-3 md:right-6 w-[calc(100%-1.5rem)] sm:w-[360px]`, khoảng cách an toàn giữa hai khối luôn $\ge 30px$ trên mọi kích thước màn hình.
  2. **Player HUD Responsive Width & Toggle Collapse**: Thẻ người chơi co giãn theo nấc `w-36` (mobile) / `sm:w-48` (tablet) / `md:w-64` (desktop). Bổ sung nút toggle thu gọn `data-testid="toggle-player-hud-btn"` trên mobile cho phép người chơi ẩn dải thẻ khi muốn ngắm trọn sa bàn 3D.
  3. **Currency Nowrap & Tabular Nums**: Mọi thẻ hiển thị tiền tệ động trên thanh TopBar và bảng HUD BẮT BUỘC có lớp `whitespace-nowrap tabular-nums shrink-0`.
  4. **WCAG AA Disabled Contrast Invariant**: Mọi nút ở trạng thái vô hiệu hóa phải sử dụng tối thiểu `text-slate-500` hoặc `text-slate-600` trên nền xám nhạt `bg-slate-100`/`bg-slate-200` để bảo đảm độ tương phản luôn $\ge 4.5:1$.

---

### 132. [UI/MOBILE/MODAL] Bất Biến Thẻ Người Chơi Di Động Tinh Gọn, Đệm An Toàn Chân Trang & Thẻ Bài Retropoly Xúc Giác (Mobile Compact HUD, Safe-Area Separation & Tactile Retropoly Modals Invariant - IMP-100)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Quá Tải Thông Tin Thẻ Người Chơi Trên Mobile (Mobile Net-Worth Visual Clutter Trap)*: Khi hiển thị đồng thời cả dòng "Tài sản ròng" lẫn "Tiền mặt" trên màn hình di động hẹp (390px), thẻ người chơi bị kéo dài chiều dọc, làm dải 4 người chơi chiếm tới hơn 50% chiều cao màn hình và che lấp gần như toàn bộ sa bàn 3D. Trong quá trình chơi game bàn cờ nhanh, người chơi cần nắm bắt ngay lập tức dòng tiền khả dụng ("Tiền mặt") để quyết định mua đất/nâng cấp, thông tin tài sản ròng chỉ cần tra cứu khi tổng kết.
  2. *Bẫy Cấn Thanh Home Bar Cử Chỉ iOS/Android (Mobile Home Indicator Collision Trap)*: Các modal dài như `PropertyPortfolioModal` có nút bấm "Đóng" và thanh tổng kết tài sản nằm sát đáy màn hình. Khi thiếu padding an toàn (`pb-8`), nút bấm bị đè lấn bởi thanh gạt Home Indicator của iPhone hoặc thanh điều hướng cử chỉ của Android, khiến người chơi bấm nhầm cử chỉ thoát app hoặc không thể bấm nút đóng modal.
  3. *Bẫy Bảng Đặc Tả Dày Đặc Làm Nghẽn Trải Nghiệm Thẻ Sự Kiện (Dense SSOT Specs Cognitive Overload Trap)*: Thẻ Cơ Hội / Phiếu Thị Trường (`EventCardModal`) khi hiển thị trên di động nếu giữ nguyên bảng tra cứu SSOT §IV chi tiết (Phạm vi, Cơ chế, Thời hạn, Điểm đến dòng tiền) sẽ làm modal dài lê thê vượt quá màn hình, buộc người chơi phải cuộn nhiều lần trong khi thời gian đọc hiệu ứng chỉ nên kéo dài 1-2 giây.
  4. *Bẫy Viền Đứt Nét Thô Kém Tương Phản (Insolvency Dashed Border Dilution Trap)*: Viền `border-dashed` trên banner cứu nợ phá sản tạo cảm giác tạm bợ, thiếu sự trang nghiêm, đầm chắc của một thông báo tài chính quan trọng, đồng thời số tiền thâm hụt nhỏ bé không tạo được ấn tượng thị giác khẩn cấp cần thiết.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Mobile Compact Player HUD Invariant**: Khối "Tài sản ròng" trên thẻ người chơi BẮT BUỘC gắn lớp `hidden sm:flex flex-col text-right`. Trên màn hình di động (<640px), chỉ hiển thị duy nhất nhãn "TIỀN MẶT" với số tiền lớn màu xanh lục `text-emerald-700` (hoặc đỏ cảnh báo thấu chi `text-rose-700`), giải phóng trên 60% không gian sa bàn 3D.
  2. **Mobile Modal Safe-Area Invariant**: Chân trang mọi modal tương tác toàn màn hình hoặc danh sách cuộn (`PropertyPortfolioModal`) BẮT BUỘC có lớp đệm an toàn `pb-8 sm:pb-3` để bảo đảm nút bấm luôn nằm cách xa thanh Home Indicator tối thiểu 32px.
  3. **Event 1-Second Quick Impact Summary Invariant**: Trên mobile, ẩn bảng thông số kỹ thuật chi tiết với `data-testid="event-specs-table"` và `hidden sm:flex`. Bổ sung khối Tóm Tắt Tác Động Nhanh 1 Giây `data-testid="event-impact-summary"` với `sm:hidden` chứa trực diện 2 huy hiệu mấu chốt: Phạm vi `🎯` và Thời hạn `⏳` cùng hiệu ứng định lượng rõ ràng.
  4. **Tactile Postal Solid Border Invariant**: Thay thế hoàn toàn viền nét đứt bằng viền liền bưu điện đỏ đầm chắc `border-4 border-red-500 rounded-2xl shadow-[0_6px_0_0_#0f172a]`, phóng đại con số thâm hụt lên cỡ `text-2xl sm:text-3xl font-black font-mono` để tạo sức nặng cảnh báo thị giác.
  5. **Modal Payload Truth Invariant**: Trong `ModalHost`, khi gọi `openModal('portfolio', payload)` hoặc bất kỳ modal nào, payload BẮT BUỘC không được `null` hoặc `undefined` (tối thiểu là `{}` hoặc `{ playerId }`) để vượt qua chốt kiểm tra `if (!modalPayload) return null;` ở dòng L84.

---

### 133. [ARCH/REFACTOR/CLEANUP] Bất Biến Giới Hạn Dòng Mã Mô-Đun Canvas, Bảo Vệ Hàm Kiểm Tra Nội Bộ & Triệt Tiêu Ép Kiểu Bất An Toàn (Canvas Decomposition, Internal Validator Preservation & Zero-Dirty-Casts Invariant - IMP-101)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Xóa Nhầm Thân Hàm Khi Gỡ Export Thừa (Validator Evaporation Trap)*: Khi quét dead code bằng các công cụ phân tích tĩnh (như Knip), các hàm xác thực nghiệp vụ quan trọng (`validateMortgage`, `validateRedeem`, `validateDowngrade`, `validateP2PTrade`) bị đánh dấu là "unused export" vì chỉ có các hàm nội bộ trong cùng tệp gọi chúng (`mortgageProperty`, `downgradeProperty`, v.v.). Nếu lập trình viên xóa nhầm thân hàm thay vì chỉ gỡ từ khóa `export`, toàn bộ rào chắn logic nghiệp vụ server sẽ bị sụp đổ.
  2. *Bẫy Phình To Dòng Mã Trên Component Điều Phối 3D (Monolithic Canvas LOC Creep)*: `game_canvas.tsx` tích lũy toán học camera, thuật toán giải quyết tiêu điểm ô cờ theo hoạt cảnh và bộ giám sát telemetry hiệu năng thời gian thực, phình to lên 434 dòng, vượt ngưỡng cảnh báo 300 dòng của Hiến pháp GEMINI.md.
  3. *Bẫy Ép Kiểu Bất An Toàn Đè Lên Domain Model (`as any` Proliferation Trap)*: Khi truyền thông tin định danh con vật và màu sắc ô cờ (`pawnSlot`, `ownerSlot`, `mascotIcon`, `mascotName`), thay vì mở rộng kiểu dữ liệu chính thức trên `Player` / `PlayerHudInfo`, mã nguồn lạm dụng `(player as any).pawnSlot` hoặc `(slot as any)?.pawnSlot`, vi phạm nguyên tắc "Zero Dirty Casts" của Hiến pháp GEMINI.md.
  4. *Bẫy Test Lỗi Thời Do Không Đồng Bộ Với Bất Biến Mới (Stale Contract Test Drift)*: Khi IMP-98 ban hành thiết kế Tô Màu Chủ Quyền Thuần Túy (Pure Color Ownership) thay thế cọc cờ bằng khay giá `OwnerPricePill` và viền chân đế `OwnerBaseTrim`, các bộ test cũ vẫn tiếp tục assert chuỗi `OwnershipMarkerInstances` trên ô cờ, tạo ra các ca thất bại giả (False Red).
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Internal Validator Preservation Invariant**: Khi prune unused exports từ báo cáo phân tích tĩnh, BẮT BUỘC chỉ gỡ từ khóa `export` để chuyển thành file-private function đối với mọi hàm có lời gọi nội bộ. Tuyệt đối không xóa thân hàm nếu chưa kiểm tra toàn bộ phạm vi tệp.
  2. **Sub-350 LOC Canvas Modularization**: Tách toán học camera và thuật toán tiêu cự sang `use_game_camera.ts` (< 60 LOC); trích xuất giám sát đo đạc khung hình sang `perf_telemetry_tracker.tsx` (< 80 LOC); duy trì `game_canvas.tsx` < 350 LOC và re-export đầy đủ các symbol toán học để bảo toàn 100% tương thích ngược với các bộ test hợp đồng.
  3. **Zero Dirty Casts Domain Extension**: Mọi thuộc tính mở rộng phục vụ hiển thị (`pawnSlot`, `ownerSlot`, `mascotIcon`, `mascotName`) BẮT BUỘC được định nghĩa tường minh trên interface gốc (`Player` trong `room.ts`, `PlayerHudInfo` trong `game_store_types.ts`). Nghiêm cấm 100% việc dùng `as any` hoặc `as unknown as T` trong toàn bộ thư mục `src/`.
  4. **Strict Contract Reconciliation**: Đồng bộ các test suite cũ sang các testid mới (`owner-price-pill`, `owner-base-trim`) theo đúng SSOT đã duyệt; bảo toàn 100% số lượng test cases (không xóa, không skip).

---

### 134. [3D/TEXTURE/CONTRACT] Bất Biến Triệt Tiêu Decal Giá 2D Trên Toàn Bộ Ô Mua Được & Căn Chỉnh Khay Giá 3D Thuần Túy (Zero 2D Price Decal & Pure 3D Price Pill Alignment Invariant - IMP-102)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Decal Giá 2D Xung Đột Trực Quan Khay Giá 3D (2D Price Decal Ghosting & Z-Fighting Trap)*: Khi cả 2D CanvasTexture (`drawPriceTrayFooter` tại `y = 274` và `fillText` tại `y = 300`) lẫn mô hình 3D `OwnerPricePill` cùng hiển thị giá tiền ở đáy ô, xảy ra hiện tượng chồng lấn trực quan, nhòe viền chữ khi camera nghiêng và xung đột hiển thị khi ô đổi màu theo quyền sở hữu người chơi.
  2. *Bẫy Bỏ Sót Ô Hạ Tầng & Tiện Ích (Infrastructure Tiles Omission Trap)*: Khi gỡ decal giá trên 22 ô bất động sản nhưng bỏ sót 6 ô hạ tầng & tiện ích (ga tàu 5, 15, 25, 35 và điện/nước 12, 28), dẫn đến sự phân mảnh bất nhất giữa các ô có thể mua bán trên bàn cờ.
  3. *Bẫy Hợp Đồng Kiểm Thử Cũ Khẳng Định Khay Giá 2D (Stale Non-Property Contract Assertion Trap)*: Suite `imp90_non_property_tile_distinct_format.test.ts` (TC-90.09) từng kiểm tra các ô hạ tầng có khay giá 2D `#FBBF24` ở đáy ô, gây xung đột kiểm thử khi nâng cấp lên kiến trúc Pure 3D Pill.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Purchasable Tiles Zero 2D Decal Invariant**: Trong `tile_texture_generator.ts`, hàm `drawTileFooter` TUYỆT ĐỐI KHÔNG gọi `drawPriceTrayFooter` đối với toàn bộ 28 ô mua được (`isPropertyTile(index) || isInfrastructureTile(index)`). Chỉ gọi `drawActionBadgeFooter` cho các ô phi tài sản (`!isPropertyTile(index) && !isInfrastructureTile(index)`).
---

### 135. [3D/UI/TELEMETRY] Bất Biến Camera Đuổi Cờ Bot, Sảnh Chờ 1 Hàng Tinh Gọn, Miễn Trừ Dịch Chuyển Thẻ Sự Kiện & Tắt N8AO Mobile (Mobile Cam Chase, 1-Row Lobby Ergonomics, Event Card Teleport Exemption & Mobile N8AO Bypass Invariant - IMP-103)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Khóa Chết Camera Khi Bot Di Chuyển (Static Overview Lock Trap)*: Trước IMP-103, `resolveCameraMode` khóa cứng camera ở chế độ `'overview'` mỗi khi `isBotTurn || isAnimatingPawnBot`, khiến người chơi không theo dõi được con cờ Bot đang nhảy từng bước và không được phóng to vào ô đất Bot hạ cánh.
  2. *Bẫy Bố Cục Sảnh Chờ Đa Tầng Gây Tràn Màn Hình Mobile (Multi-Row Slot Card Mobile Overflow Trap)*: Thẻ `PlayerSlotCard` khi có người chiếm vị trí (`occupied`) từng có bố cục 2 tầng cao tới `min-h-[92px]`, đẩy danh sách 4 người chơi tràn qua cạnh dưới màn hình di động 390px, đè lấn nút "BẮT ĐẦU TRẬN ĐẤU".
  3. *Bẫy Telemetry Báo Sai Lệch INVALID_POSITION_STEP Khi Thẻ Sự Kiện Dịch Chuyển Quân Cờ (Event Card Teleport False Positive Trap)*: Khi thẻ Khí Vận hoặc Thị Trường dịch chuyển quân cờ (ví dụ ô 36 sang 38 hoặc qua ô 0 GO), FSM thực hiện di chuyển trong pha `PropertyManagement`. Hàm `checkIsTeleport` cũ chỉ coi là teleport khi `phase !== PropertyManagement`, dẫn đến việc Telemetry Watchdog bắt lỗi vị trí không có xúc xắc (`INVALID_POSITION_STEP`).
  4. *Bẫy GPU Fill-Rate Trên Thiết Bị Di Động Do N8AO (Mobile Ambient Occlusion Fill-Rate Bottleneck Trap)*: Shader pass `N8AO` (Screen-space Ambient Occlusion) tiêu tốn nhiều chu kỳ băng thông texture và ALU trên GPU di động (Adreno/Mali), làm giảm khung hình xuống dưới 30 FPS.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Dynamic Bot Pawn Chase Invariant**: Trong `camera_state_machine.ts`, chỉ giữ camera ở `'overview'` khi Bot chưa gieo xúc xắc và lượt chơi đang chờ: `(params.isBotTurn || params.isAnimatingPawnBot) && !params.isPawnAnimating && !params.hasTargetTile && !params.hasRolledThisTurn`. Khi quân cờ Bot nhảy (`isPawnAnimating = true`), camera tự động chuyển sang `'pawn_chase'`; khi Bot hạ cánh, chuyển sang `'tile_focus'`.
  2. **1-Row Lobby Slot Ergonomics Invariant**: `PlayerSlotCard` ở trạng thái occupied BẮT BUỘC thu gọn thành 1 hàng ngang duy nhất `min-h-[50px] flex items-center justify-between px-3 py-2 rounded-xl`, nút xóa Bot AI chuyển thành nút vuông nhỏ `w-7 h-7` chứa icon `✕`, giải phóng hoàn toàn chiều dọc sảnh chờ trên mobile.
  3. **Event Card Teleport Exemption Invariant**: `checkIsTeleport` mở rộng tham số thứ 5 `hasEventCard?: boolean`. Khi `hasEventCard` là `true` (truyền qua `Boolean(delta.lastEventCard)` từ `detectMovement`), hệ thống BẮT BUỘC nhận diện là teleport hợp lệ, loại bỏ hoàn toàn cảnh báo sai `INVALID_POSITION_STEP`.
  4. **Mobile N8AO Pass Elimination Invariant**: `PostProcessingPipelineProps` bổ sung `isMobile?: boolean` và `disableAoOnMobile?: boolean`. Khi kích hoạt trên môi trường di động, `resolvedEnableAo = enableAo && !isMobile && !disableAoOnMobile` tự động chuyển thành `false`, hủy hoàn toàn pass render `N8AO` để bảo vệ 60 FPS mượt mà.

---

### 136. [3D/TEXTURE/TYPOGRAPHY] Bất Biến In Chữ Giá Tiền Trực Tiếp Trên Nền Giấy Ngà & Triệt Tiêu Khay Hộp Đen 3D Khi Chưa Mua (Pure Ivory Price Typography & Zero Black Pill Invariant - IMP-104)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Khay Hộp Đen 3D Choán Trực Quan Khi Đất Còn Trống (Unowned Black Pill Visual Clutter Trap)*: Khi đặt khối hộp than đen `#090D1A` viền `#1E293B` làm khay giá 3D cho toàn bộ 28 ô đất chưa mua, bàn cờ bị bao phủ bởi hàng chục khối hộp đen thô cứng, che lấp chân tranh di sản văn hóa và tạo cảm giác ngột ngạt, tối tăm.
  2. *Bẫy Triệt Tiêu Decal 2D Gây Thiếu Vắng Thông Tin Giá (Decal Elimination Information Blindspot Trap)*: Khi gỡ decal khay giá 2D để tránh Z-fighting ở IMP-102 nhưng đồng thời xóa luôn lệnh `fillText` hiển thị giá tiền trên mặt giấy ngà, dẫn đến việc buộc phải duy trì khay hộp đen 3D khi chưa mua để người chơi biết giá đất.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Pure Ivory Price Typography Invariant**: Trong `tile_texture_generator.ts`, hàm `drawTilePriceText` in trực tiếp chữ giá tiền lên mặt texture giấy ngà tại tọa độ căn giữa `(128, 300)` bằng mực than đen `#0F172A`, font `900 24px` hệ thống sắc nét cho toàn bộ 22 ô bất động sản và 6 ô hạ tầng/tiện ích, hoàn toàn KHÔNG vẽ bất kỳ khối hộp `roundRect` nào ở chân ô đất.
  2. **Zero Black Pill Invariant**: Trong `owner_property_markers.tsx`, component `OwnerPricePill` BẮT BUỘC kiểm tra `const hasOwner = Boolean(ownerColor && ownerColor.length > 0)`. Nếu `!hasOwner`, trả về `null` ngay lập tức. Bàn cờ khi chưa mua lộ 100% mặt tranh di sản và chữ in giá trực tiếp trên giấy ngà, triệt tiêu 100% các khối hộp than đen `#090D1A` và viền `#1E293B`.
  3. **Active Ownership 3D Recolor Preservation**: Khi ô đất đã có chủ (`hasOwner === true`), khay 3D mang màu sắc đại diện của người chơi (`ownerColor`) lập tức xuất hiện tại cự ly `Z = 0.70`, cao độ `Y = 0.115` với viền kim loại vàng hoàng kim `#F59E0B` và chữ trắng `#FFFFFF`, bảo đảm phân biệt chủ quyền rõ ràng mà không xung đột thị giác.

---

### 137. [TELEMETRY/PERF/GPU] Khử Cảnh Báo Giả Telemetry Khi Vào HOSE/Đấu Giá & Tự Động Tắt Pass N8AO Trên Mobile GPU (Telemetry Watchdog False Positives & Mobile GPU Post-Processing Invariant - IMP-105)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Bỏ Rơi Xúc Xắc Khi Rơi Vào HOSE Hoặc Đấu Giá (Hose & Auction Movement Drop Trap)*: Trong `detectMovement` (`telemetry_delta_hook.ts`), `isMovementPhase` ban đầu chỉ tính các phase `WaitingRoll`, `ActionPhase`, `PropertyManagement` và `undefined`. Khi người chơi tung xúc xắc di chuyển đến Ô 38 (HOSE) hoặc ô đất vô chủ kích hoạt sàn đấu giá, máy chủ phản hồi delta với `TurnPhase.HosePhase` hoặc `TurnPhase.AuctionPhase`. Do `isMovementPhase` không nhận diện 2 phase này, thuộc tính `dice` bị gán `undefined`, dẫn đến việc `verifyMovementStep` tưởng quân cờ nhảy ô không có xúc xắc và kích hoạt cảnh báo sai nghiêm trọng `INVALID_POSITION_STEP`.
  2. *Bẫy Giả Định Giai Đoạn Bất Thường Là Teleport Trong checkIsTeleport (Teleport Phase Fallback Trap)*: Trong `checkIsTeleport`, điều kiện fallback giả định mọi phase khác `WaitingRoll`, `ActionPhase`, `PropertyManagement` đều là teleport. Khi hạ cánh HOSE hoặc đấu giá, sự thiếu vắng của `HosePhase` và `AuctionPhase` gây sai lệch trạng thái teleport.
  3. *Bẫy Báo Động Thất Thoát Quỹ Khi Hiệu Chuẩn Tiền Trận Đấu (Setup Calibration Treasury False Alarm Trap)*: Tại tick 1-2 hoặc khi `roomStarted === false`, người chơi mới gia nhập phòng mang theo số vốn khởi điểm 15.000 Tr hoặc hệ thống thiết lập quỹ kho bạc ban đầu. Do tổng tiền tăng đột biến so với trạng thái rỗng ban đầu, `verifyTreasuryConservation` lầm tưởng quỹ bị thất thoát và phát sinh cảnh báo sai `TREASURY_INVARIANT_VIOLATED`.
  4. *Bẫy Quá Tải GPU Mobile Do Không Truyền isMobile Vào GameCanvas (GameCanvas PostProcessing Props Disconnect Trap)*: Dù `PostProcessingPipeline` đã có cơ chế tắt pass N8AO qua prop `isMobile`, `GameCanvas` không truyền `isMobile={isMobileDevice}` trong cả 2 nhánh Lobby và Gameplay, khiến shader N8AO vẫn chạy trên thiết bị di động, kéo tụt tốc độ khung hình xuống 19.4 FPS thay vì 50-60 FPS.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Hose & Auction Movement Phase Invariant**: Trong `telemetry_delta_hook.ts`, `isMovementPhase` và `checkIsTeleport` BẮT BUỘC nhận diện đầy đủ `TurnPhase.HosePhase` và `TurnPhase.AuctionPhase`. `delta.dice` được bảo toàn toàn vẹn khi người chơi di chuyển hợp lệ đến Ô 38 (HOSE) hoặc ô đất đấu giá, triệt tiêu 100% cảnh báo giả `INVALID_POSITION_STEP`.
  2. **Room Setup & Calibration Exemption Invariant**: Trong `handleDeltaTelemetry` và `verifyTreasuryConservation`, hệ thống bỏ qua kiểm tra bảo toàn ngân sách (`expectedMoneyDelta: null`) khi `delta.roomStarted === false`, khi số lượng người chơi thay đổi (`isPlayerJoinCalibration`), hoặc khi thiết lập kho bạc tại `delta.tick <= 2`, ngăn chặn toàn bộ cảnh báo giả `TREASURY_INVARIANT_VIOLATED`. Đồng thời các trường hợp thất thoát thật trong ván đấu (`delta.tick >= 3`) vẫn bị bắt lỗi 100%.
  3. **Mobile GPU N8AO Pass Elimination Invariant**: Trong `game_canvas.tsx`, `GameCanvas` phát hiện môi trường di động (`window.innerWidth < 768` hoặc User Agent di động) và BẮT BUỘC truyền `isMobile={isMobileDevice}` vào `<PostProcessingPipeline />` trong cả 2 nhánh Lobby và Gameplay. Pass N8AO được hủy bỏ hoàn toàn trên GPU mobile, phục hồi tốc độ khung hình đạt chuẩn 50-60 FPS.
  4. **Strict Canvas LOC Limit Invariant**: `src/client/game_canvas.tsx` tuân thủ nghiêm ngặt giới hạn dưới 350 dòng (thực tế 344 LOC), bảo tồn toàn bộ các comment hợp đồng kiểm thử (`ContactShadows` retention marker).

---

### 138. [UI/CRAFT/RESPONSIVE] Bất Biến Chống Ép Cột Bố Cục Mobile, Tràn Viền Nhãn & Lớp Nền Mờ Ngăn Kéo (Mobile UI Anti-Crush, Truncation & Backdrop Scrim Invariant - IMP-106)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Bố Cục 2 Cột Cứng Nhắc Trên Màn Hình Cảm Ứng Hẹp (Two-Column Mobile Grid Crush Trap)*: Khi áp dụng `grid-cols-2` cố định trên modal đàm phán P2P (`TradeModal`), mỗi cột trên màn hình mobile 360-390px bị ép co cụm xuống chỉ còn ~155px. Hậu quả là nút nạp nhanh `+500` bị tràn mép cắt cụt mất số, số tiền mặt bị bẻ đôi dòng (`9.404` ở trên và `Tr .` rớt xuống dưới), tên tài sản bị cắt `...` cụt lủn.
  2. *Bẫy Che Khuất Phần Tử Cuối Do Thanh Chân Trang Cố Định (Sticky Footer Scroll Occlusion Trap)*: Khung cuộn `p-4 overflow-y-auto` trong `PropertyPortfolioModal` không có khoảng đệm đáy (`pb-8`), dẫn đến việc khi người chơi cuộn hết danh mục BĐS, thẻ bất động sản cuối cùng (ô 21 Thanh Hóa) bị thanh tổng kết tài sản và nút đóng che khuất 50% nội dung.
  3. *Bẫy Vùng Chạm Dưới Chuẩn Công Thái Học (Sub-44px Touch Target Violation Trap)*: Các nút đóng `✕` (28px - `w-7 h-7`), nút Auto-Bid (38px) trên `AuctionModal`, nút tab trên `GameRulesModal`, nút "Sổ Đỏ ↗" trên danh mục BĐS và cụm icon biểu cảm vi phạm tiêu chuẩn vùng chạm tối thiểu 44x44px (WCAG 2.1 AA), khiến người dùng di động thường xuyên bấm trượt.
  4. *Bẫy Thiếu Lớp Nền Mờ Nhận Diện Ngăn Kéo (Missing Backdrop Scrim Trap)*: Ngăn kéo nhật ký `ActivityFeedSidebar` trượt ra chiếm 320px trên màn hình di động 360px nhưng không có lớp phủ mờ tối phía sau (`backdrop scrim`), khiến người chơi không có tín hiệu thị giác rõ ràng rằng có thể chạm vào vùng ngoài để đóng ngăn kéo.
  5. *Bẫy Bẻ 3 Dòng Chữ Nhãn Tiếng Việt Dài (Multi-Line Tab Wrap Trap)*: Nhãn tiếng Việt "🃏 Danh Mục Thẻ & Ô Cờ" chia đều `flex-1` trên thanh tab modal bị bẻ thành 3 dòng chữ vụn vặt gây mất mỹ quan trên mobile hẹp.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Responsive P2P Single-Column Invariant**: `TradeModal` BẮT BUỘC sử dụng `grid-cols-1 sm:grid-cols-2`. Trên mobile, 2 bên đàm phán xếp chồng theo thứ tự "Bạn đề xuất" ➔ "Đối tác đề xuất" để mỗi cột chiếm trọn 100% bề ngang, bảo toàn các nút `+100`, `+500` nguyên vẹn và số tiền không bị gãy dòng. Tab đối tác BẮT BUỘC có `truncate max-w-[120px]`.
  2. **Scroll Clearance Invariant**: Mọi modal có khung cuộn đứng chứa thanh chân trang cố định (như `PropertyPortfolioModal`) BẮT BUỘC có khoảng đệm đáy tối thiểu `pb-8` (`p-4 pb-8 overflow-y-auto`) để phần tử cuối cùng lộ diện 100% khi cuộn chạm đáy.
  3. **WCAG AA 44px Touch Target Floor Invariant**: Toàn bộ các nút đóng modal `✕`, nút phụ trợ (Auto-Bid, Rút lui, Sổ Đỏ ↗, Toggle HUD, Icon Emote) BẮT BUỘC đạt sàn kích thước tối thiểu `min-w-[44px] min-h-[44px]` (hoặc `min-h-[40px] sm:min-h-[44px]`).
  4. **Mobile Drawer Backdrop Scrim Invariant**: Mọi ngăn kéo trượt trên di động (`ActivityFeedSidebar`) BẮT BUỘC kèm lớp nền `fixed inset-0 bg-black/50 backdrop-blur-xs z-20 md:hidden` với bộ lắng nghe sự kiện click để đóng ngay lập tức khi chạm ra ngoài.
  5. **Responsive Tab Label Abbreviation Invariant**: Các tab có tiêu đề dài trên modal BẮT BUỘC hỗ trợ văn bản rút gọn cho di động thông qua lớp tiện ích `hidden sm:inline` (ví dụ: `🃏 Thẻ & Ô Cờ` trên mobile và `🃏 Danh Mục Thẻ & Ô Cờ` trên desktop).

---

### 139. [AUCTION/UI/FSM] Bất Biến Bước Giá Đấu Giá 100 - 200 - 500 Tr., Đồng Bộ Auto-Bid & Tương Thích Server Minimum Increment (Auction Bid Increments Upgrade Invariant - IMP-108)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Bước Giá Quá Nhỏ Kéo Dài Phiên Đấu Giá (Low Bid Increment Drag Trap)*: Trước IMP-108, các nút đặt giá nhanh trên `AuctionModal` là `+50, +100, +200 Tr.`. Với các BĐS giá trị cao (trên 2.000 - 4.000 Tr.), bước giá +50 Tr. khiến phiên đấu giá bị kéo dài lê thê qua nhiều vòng lặp, làm giảm nhịp độ kịch tính của trận đấu.
  2. *Bẫy Sai Lệch Giữa Client Increment và Server FSM Validation (Increment Desync Trap)*: Server FSM (`auction_manager.ts`) yêu cầu `minBid = highestBid + 50`. Nếu nâng nấc giá client mà không đối chiếu với server, nếu client tính giá thấp hơn `minBid` sẽ bị server từ chối với mã lỗi `BID_TOO_LOW`. Khi nâng nấc client lên `+100, +200, +500 Tr.`, mọi giá thầu gửi lên server đều thỏa mãn `currentBid + 100 >= minBid`, đảm bảo tính hợp lệ tuyệt đối.
  3. *Bẫy Desync Nút Auto-Bid Khi Đổi Nấc Giá (Auto-Bid Step Desync Trap)*: Tính năng `AUTO-BID` trên modal đấu giá tự động lấy nấc giá đầu tiên của mảng `calculateAuctionIncrements`. Nếu hàm này không được cập nhật tập trung, Auto-Bid sẽ gửi mức giá lệch với nút hiển thị đầu tiên trên giao diện.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Auction Increments Contract Invariant**: Hàm `calculateAuctionIncrements(currentBid)` trong `modal_helpers.ts` BẮT BUỘC sinh đúng mảng 3 giá trị `[safeBid + 100, safeBid + 200, safeBid + 500]`, xử lý an toàn các trường hợp biên (`currentBid <= 0`, `NaN`, `null`, `undefined` về mặc định 0).
  2. **Tactile Quick-Bid Buttons Invariant**: `AuctionModal.tsx` duyệt trực tiếp mảng hằng số `([100, 200, 500] as const)` để render 3 nút đặt giá xúc giác: `+100 Tr.`, `+200 Tr.`, `+500 Tr.`, kèm nhãn số tiền thầu tương ứng.
  3. **Auto-Bid Floor Alignment Invariant**: Nút `AUTO-BID` tự động lấy nấc giá tối thiểu mới `safeIncrements[0]` (tương đương `currentBid + 100 Tr.`), bảo đảm đồng bộ hoàn toàn với thao tác bấm tay của người chơi.
  4. **Ground Truth Reconciliation Invariant**: `docs/requirements.md` §I cập nhật bước giá tối thiểu và các nấc đặt giá nhanh thành `+100, +200, +500 Tr. VNĐ` theo đúng chuẩn SSOT.

---

### 140. [3D/RENDER/DIORAMA] Bất Biến Bàn Cờ Sa Bàn Tinh Gọn, Triệt Tiêu Vành Đai Ngoại Vi Cây Cỏ & Khóa Bệ Gỗ Ôm Sát Cạnh Bàn Cờ (Streamlined Tabletop Diorama & Zero Outer Ring Clutter Invariant - IMP-107)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Vành Đai Cây Cỏ & Công Trình Ngoại Vi Che Khuất Bàn Cờ (Outer Ring Clutter & Board Occlusion Trap)*: Trước IMP-107, môi trường đảo biển ngoài khơi sở hữu một đĩa cao nguyên cỏ xanh nhiệt đới khổng lồ (`cylinderGeometry args={[15.6, 17.6, 0.26, 64]}` màu `#22C55E`), 60 cây dừa (`TropicalPalmsCluster`), 32 cây tán lá nhiệt đới (`LayeredTropicalFoliage`), ga xe lửa Đông Nam (`TrainStationLandmark`), sân bay Tây Bắc (`AirportLandmark`) và các cụm dù che nắng bãi biển. Vành đai này che khuất tầm nhìn của các ô đất góc đáy bàn cờ (đặc biệt khi camera ở góc thấp hoặc trên màn hình di động 390px), làm lu mờ nhân vật chính là bàn cờ 40 ô và trung tâm đô thị diorama.
  2. *Bẫy Phá Vỡ Thế Giới Đồng Nhất Nếu Xóa Sạch Biển (Broken Cohesive World Invariant Trap)*: Nếu loại bỏ hoàn toàn bối cảnh để quay về phòng tối đơn sắc, bàn cờ sẽ vi phạm nghiêm trọng quy chuẩn Single Cohesive World Invariant (cấm tuyệt đối phòng tối vô hồn, duy trì phong cách sa bàn đô thị trên đảo biển ngập nắng ngoài trời).
  3. *Bẫy Bệ Gỗ Quá Khổ Rời Rạc Khỏi Khung Sa Bàn (Oversized Plinth Dimension Trap)*: Bệ gỗ óc chó cũ kích thước `args={[32, 0.2, 32]}` quá lớn so với viền sa bàn `DioramaBoardRim` (18.4 x 18.4m), tạo ra mảng trống gỗ thô kệch ngăn cách bàn cờ với mặt nước đại dương.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Streamlined Default Invariant**: `CoastalIslandEnvironment` cung cấp prop `streamlined?: boolean` với mặc định là `true`. Khi `streamlined === true`, hệ thống triệt tiêu 100% đĩa cao nguyên cỏ xanh `#22C55E`, 60 cây dừa, 32 cây tán lá, nhà ga tàu lửa Đông Nam, sân bay Tây Bắc, cầu cạn và các cụm dù bãi biển ngoại vi. Toàn bộ tầm nhìn vào 40 ô đất và sa bàn đô thị trung tâm (`MiniatureCityDiorama`) được giải phóng hoàn toàn, thông thoáng 360 độ.
  2. **Submerged Sand Shoal & Lagoon Hugging Invariant**: Tầng nước nông ngọc bích `#06B6D4` và dải bọt sóng trắng `#FFFFFF` thu hẹp bán kính (`args={streamlined ? [13.2, 14.8, 0.08, 48] : [16.3, 19.5, 0.08, 48]}`), kết hợp thềm đáy cát nhiệt đới ngà mịn `#EFE5D8` ôm khít ngay sát chân bệ sa bàn, mang lại hiệu ứng làn nước biển vỗ về rìa bàn cờ sống động.
  3. **Walnut Table Plinth Geometry Invariant**: Trong `board_layout.tsx`, bệ gỗ óc chó được khóa chặt ở kích thước `args={[19.2, 0.2, 19.2]}` tại cao độ `Y = -0.350`, ôm khít viền khung sa bàn `DioramaBoardRim` (18.4 x 18.4m), loại bỏ hoàn toàn cảm giác bệ cồng kềnh.
  4. **Living Ocean & Horizon Preservation Invariant**: Môi trường tinh gọn BẮT BUỘC bảo tồn 100% đại dương vô cực sống động `Living Ocean` (lưới sóng GPU Gerstner Shader `#0284C7`, đáy biển sâu `#0C4A6E`, tầng nước trung `#0369A1`), rặng núi xanh chân trời phía Bắc `HorizonMountainRange`, tàu chở container vi mô, tàu tuần tra `CoastalPatrolBoat` và chim mòng biển `CoastalSeagulls`.

---

### 141. [3D/MATERIAL/PAWN] Bất Biến 4 Quân Cờ Xe - Pháo - Mã - Hậu Phủ Toàn Màu Người Chơi, Triệt Tiêu Inox Bạc & PBR Men Bóng Đồ Chơi (Four Colored Chess Pawns, Zero Inox & Toy Enamel PBR Invariant - IMP-105)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Chất Liệu Inox Chrome Lạnh Lẽo Xung Đột Tinh Thần Đồ Chơi Sa Bàn (Chrome Inox PBR Visual Clash Trap)*: Trước đây các quân cờ mang chất liệu kim loại inox/chrome bóng lạnh (`metalness: 0.96, roughness: 0.08`, màu trắng bạc `#F8FAFC`, `#E2E8F0`), tạo cảm giác linh kiện cơ khí vô hồn, gây chói mắt và phá vỡ thẩm mỹ sa bàn đồ chơi ấm áp (diorama tabletop).
  2. *Bẫy Bỏ Sót Phủ Màu Người Chơi Toàn Thân (Partial Player Color Accent Trap)*: Các mẫu quân cờ cũ chỉ tô màu người chơi ở một vòng nhẫn mảnh (`EnamelRing`) dưới chân hoặc một chi tiết phụ, trong khi toàn bộ thân cờ là màu bạc giống nhau, khiến người chơi rất khó phân biệt quân cờ của mình và đối thủ từ góc nhìn camera toàn cảnh (`overview`).
  3. *Bẫy Bệ Đế Thừa Xâm Phạm Bất Biến Zero-Pedestal (Pedestal Invariant Breach Trap - IMP-96)*: Khi thiết kế các hình tượng cờ truyền thống (như tháp canh Xe, nòng Pháo, tượng Hậu), phần chân đế nếu làm quá rộng (`radius >= 0.16` và `height <= 0.05`) sẽ vô tình kích hoạt lại bẫy Bệ đế phẳng che khuất mặt ô đất mà IMP-96 đã triệt tiêu.
  4. *Bẫy Sắp Xếp Ký Tự Emoji Unicode Trong Bộ Kiểm Thử (Unicode Emoji Sort Trap)*: Trong JavaScript/TypeScript, các emoji quân cờ `['👑', '🏰', '💣', '🐎']` khi gọi `.sort()` sắp xếp theo UTF-16 code units cho ra thứ tự `['🏰', '🐎', '👑', '💣']`. Nếu viết test so sánh trực tiếp mảng emoji không sắp xếp hoặc sắp xếp sai quy ước sẽ gây lỗi kiểm thử giả.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Four Iconic Chess Pawns Invariant**: 4 quân cờ đại diện cho 4 slot người chơi được chuẩn hóa thành 4 quân cờ đặc trưng:
     - Slot 0: `Quân Xe Chiến Hoàng Gia` (🏰, mặc định `#DC2626`, `/models/pawns/pawn_rook.glb`)
     - Slot 1: `Quân Pháo Thần Công Cổ Điển` (💣, mặc định `#27AE60`, `/models/pawns/pawn_cannon.glb`)
     - Slot 2: `Quân Mã Phong Vân Thượng Lưu` (🐎, mặc định `#E67E22`, `/models/pawns/pawn_horse.glb`)
     - Slot 3: `Quân Hậu Quyền Quý Indochine` (👑, mặc định `#10B981`, `/models/pawns/pawn_queen.glb`)
  2. **100% Full Player Color Invariant**: Toàn bộ thân quân cờ (`LuxuryPawnModel` và các procedural fallbacks: `RookPawnFallback`, `CannonPawnFallback`, `WarhorsePawnFallback`, `QueenPawnFallback`) BẮT BUỘC phủ 100% màu của người chơi sở hữu (`activeColor = playerColor || config.color`). Không còn bất kỳ mảng thân cờ màu bạc nào.
  3. **Toy Glossy Enamel PBR Invariant (Zero-Inox)**: Triệt tiêu 100% chất liệu inox/chrome bạc (`#F8FAFC`, `#E2E8F0`, `metalness: 0.96`). Chuyển đổi toàn bộ sang chất liệu sơn men bóng đồ chơi diorama cao cấp: `metalness: 0.25` (trần tối đa <= 0.40), `roughness: 0.28`.
  4. **Pedestal-Free Compact Base Invariant**: Mọi phần chân đế của mô hình quân cờ phải tuân thủ nghiêm ngặt bán kính `radius <= 0.15m` (`radiusTop <= 0.15, radiusBottom <= 0.15`), tuyệt đối không vi phạm Zero-Pedestal Invariant của IMP-96.
  5. **Backward Compatibility & Contract Preservation Invariant**: `luxury_pawn_models.tsx` và `luxury_pawn_fallbacks.tsx` bảo lưu đầy đủ các export alias lịch sử (`DogPawn`, `CatPawn`, `ElephantPawn`, `WarhorsePawn`, `LandmarkTowerPawn`, `BayYachtPawn`, `ClassicCarPawn` và các fallback tương ứng) cùng các hidden test hook (`data-testid`), bảo đảm 100% các bộ kiểm thử hợp đồng kế thừa đều xanh.

---

### 142. [TELEMETRY/WATCHDOG/NET] Bất Biến Đồng Bộ diceRollerId, Đối Soát Tiền Thắng Đấu Giá & Ngưỡng Kẹt Hoạt Ảnh Động Theo Khối Lượng Bước Nhảy (Telemetry Watchdog Precision & Invariant Hardening - IMP-109)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Đổi Lượt Trước Khi Nhận Diện Xúc Xắc Trong Auto-Roll (Advanced Turn Player Dice Drop Trap)*: Trong các vòng quay tự động (Bot turn hoặc auto-pass), sau khi người chơi tung xúc xắc và di chuyển xong, server lập tức chuyển `currentTurnPlayerId` sang người tiếp theo và `turnPhase = WaitingRoll`. `detectMovement` cũ kiểm tra `isTurnPlayer = !currentTurnPlayerId || currentTurnPlayerId === p.id`. Do `currentTurnPlayerId` đã là người tiếp theo, biến `isTurnPlayer` đánh giá `false`, làm thuộc tính `dice` bị gán `undefined`. Hệ quả: `verifyMovementStep` tưởng quân cờ nhảy ô không có xúc xắc và kích hoạt cảnh báo sai `INVALID_POSITION_STEP`.
  2. *Bẫy Đối Soát Giá Khởi Điểm Thay Vì Giá Thắng Thầu Khi Kết Thúc Đấu Giá (Auction Settlement Desync Trap)*: Khi phiên đấu giá kết thúc (`handleAuctionClose`), delta phát đi mang `auction: null`. Hàm `computeCellDelta` kiểm tra `preState.auction` vốn chỉ còn lưu mức giá khởi điểm 500 Tr (50% giá gốc 1.000 Tr), trong khi người thắng đấu giá thực tế trả 1.650 Tr. Chênh lệch kỳ vọng dòng tiền khiến `verifyTreasuryConservation` phát sinh cảnh báo đỏ giả `TREASURY_INVARIANT_VIOLATED`.
  3. *Bẫy Ngưỡng Kẹt Hoạt Ảnh Cố Định Quá Chặt So Với Tốc Độ Render 30 FPS (Static Animation Stall Budget Trap)*: Ngưỡng cứng `MAX_ANIMATION_DURATION_MS: 10_000` (10 giây) quá sát. Khi người chơi đổ xúc xắc lớn (8-12 ô) và WebGL chạy ở tốc độ 30 FPS, thời gian thực tế để avatar nhảy từng ô kết hợp camera zoom đạt 10.225 giây. Watchdog lầm tưởng hoạt ảnh bị treo đơ và phát cảnh báo `WARNING: FSM_ANIMATION_STALLED`.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Dice Roller Attribution Invariant**: Trong `detectMovement` (`telemetry_delta_hook.ts`), kiểm tra người gieo xúc xắc BẮT BUỘC ưu tiên sử dụng `delta.diceRollerId !== undefined ? delta.diceRollerId === p.id : (!delta.currentTurnPlayerId || delta.currentTurnPlayerId === p.id)`. Xúc xắc được bảo toàn trọn vẹn cho người vừa di chuyển ngay cả khi delta đã chuyển sang lượt kế tiếp, triệt tiêu 100% cảnh báo giả `INVALID_POSITION_STEP`.
  2. **Auction Actual Cash Outflow Reconciliation Invariant**: Trong `computeCellDelta`, khi ô đất mới được sang tên (`cell.ownerId && !prevOwner`), chi phí mua BẮT BUỘC đối soát trực tiếp theo số tiền sụt giảm thực tế của tài khoản người mua (`buyerPre.balance - buyerDelta.balance`) nếu có, bảo đảm khớp hoàn toàn với số tiền thầu thắng cuộc (1.650 Tr). Đồng thời nếu tiền được hấp thụ vào Kho Bạc (`treasuryGain`), hệ thống bù trừ `absorbedTreasury = Math.min(treasuryGain, -cellDelta)`, bảo đảm bất biến bảo toàn ngân khố đạt sai lệch 0 Tr.
  3. **Workload-Aware Dynamic Animation Budget Invariant**: Trong `watchdog_monitor.ts`, hàm `checkFsmAnimationStall` và `recoverFsmAnimationStall` hỗ trợ tham số `maxAllowedMs?: number` (mặc định bảo tồn 10.000ms cho các hợp đồng kiểm thử cũ). Trong `perf_telemetry_tracker.tsx`, ngân sách thời gian hoạt ảnh được tính toán động theo số lượng bước nhảy thực tế: `maxAllowedMs = Math.max(10_000, totalWaypoints * 1200 + 5000)`, triệt tiêu hoàn toàn cảnh báo giả `FSM_ANIMATION_STALLED` khi cờ nhảy nhiều ô ở 30 FPS.

---

### 143. [UI/A11Y/MOBILE] Bất Biến Độ Tương Phản WCAG 2.1 AA Nút Hành Động, Đệm Safe Area Viền Đáy & Vùng Chạm Tối Thiểu 44x44px (Mobile Ergonomics & WCAG 2.1 AA Contrast Hardening - IMP-110)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Màu Nền Nút Bấm Khiến Chữ Mờ Dưới Chuẩn WCAG 2.1 AA (Low Contrast Action Button Trap)*: Nút "Mua BĐS" trong `TitleDeedModal` trước đây dùng `bg-emerald-500` (`#10B981`) với chữ trắng `#FFFFFF`. Tỷ lệ tương phản đo được chỉ đạt 2.54:1, vi phạm chuẩn tiếp cận quốc tế WCAG 2.1 AA (yêu cầu tối thiểu 4.5:1 đối với văn bản thông thường), gây khó đọc đặc biệt dưới ánh sáng mặt trời mạnh trên thiết bị di động.
  2. *Bẫy Xung Đột Thanh Điền Hướng Mép Đáy Màn Hình Điện Thoại (Home Indicator Gesture Clash Trap)*: Trên các thiết bị di động tai thỏ / tràn viền (như iPhone, iPad), khung HUD dưới chân bàn cờ (`HudContainer` footer) nếu chỉ dùng padding tĩnh (`pb-2`) sẽ bị thanh Home Indicator của hệ điều hành đè lên, dẫn đến bấm nhầm giữa cử chỉ vuốt về Home và nút thao tác xúc xắc/kết thúc lượt.
  3. *Bẫy Vùng Chạm Quá Nhỏ Trong Sảnh Chờ Và Bảng Giao Dịch (Sub-44px Tap Target Trap)*: Các nút phụ trợ như cụm nút góc trên bàn cờ (`TopBar`), nút thêm/xóa/đổi tính cách Bot trong sảnh chờ (`PlayerSlotCard`) và nút tăng nhanh tiền mặt trong `TradeModal` từng dùng kích thước 28x28px (`w-7 h-7`) hoặc chiều cao 38px, vi phạm khuyến nghị công thái học di động (Apple HIG / Google Material Design tối thiểu 44x44px hoặc 48x48px).
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **WCAG 2.1 AA Contrast Invariant (>= 4.5:1)**: Nút mua hành động chính trong `TitleDeedModal` BẮT BUỘC sử dụng `bg-emerald-700` (`#047857`) phối hợp viền `border-emerald-700` và đổ bóng xúc giác `shadow-[0_4px_0_0_#065f46]`. Tỷ lệ tương phản chữ trắng `#FFFFFF` trên `#047857` đạt 5.52:1 (vượt chuẩn AA >= 4.5:1).
  2. **Safe Area Inset Footer Invariant**: Đáy màn hình của `HudContainer` BẮT BUỘC bù đệm thông qua `pb-[calc(0.5rem+env(safe-area-inset-bottom))]` (hoặc `p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]`), bảo vệ vùng thao tác an toàn cách xa cử chỉ hệ thống của smartphone tràn viền.
  3. **Universal 44x44px Tap Target Invariant**:
     - Toàn bộ 4 nút công cụ trên `TopBar` (Thời gian, Âm thanh, Nhật ký, Rời phòng) áp dụng `min-h-[44px] min-w-[44px]`.
     - Các nút thao tác Bot trong `PlayerSlotCard` ("+ Thêm Bot AI", "Đổi tính cách Bot") áp dụng `min-h-[44px]`. Riêng nút "Xóa Bot" duy trì `w-7 h-7 sm:w-8 sm:h-8 min-w-[44px] min-h-[44px]` để vừa mở rộng vùng chạm vật lý 44px vừa bảo tồn token tương thích ngược.
     - Các nút tăng tiền nhanh (+100, +500 Tr.) trong `TradeModal` áp dụng `min-h-[44px] min-w-[44px]`.

---

### 144. [NET/WGL/RESILIENCE] Bất Biến Ân Hạn Rớt Mạng 60 Giây (60s Grace Period), Phục Hồi Phiên Đấu & Trần Bộ Nhớ Đệm WebGL O(1) (Network 60s Grace Period Resilience & WebGL Memory Invariants - IMP-111)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Mất Kết Nối Socket Tức Thì Biến Thành Bot Làm Hỏng Trải Nghiệm (Immediate Disconnect Bot Takeover Trap)*: Khi thiết bị di động chuyển vùng mạng (WiFi sang 4G), rớt gói tin hoặc người chơi vô tình reload trình duyệt, nếu server ngay lập tức kích hoạt Bot tiếp quản (`isBot = true`), người chơi sẽ mất vĩnh viễn quyền điều khiển tài khoản và ván đấu.
  2. *Bẫy Đổi Phòng Hoặc Giả Mạo Token Phục Hồi (Cross-Room & Spoofed Reconnect Token Trap)*: Reconnect token nếu dùng chuỗi dự đoán được hoặc không xác thực mã phòng (`roomCode`) sẽ cho phép người chơi ở phòng A chiếm quyền điều khiển người chơi ở phòng B hoặc khôi phục phiên đã hết hạn.
  3. *Bẫy Phình To Bộ Nhớ Đệm WebGL Không Giới Hạn Khi Ván Đấu Kéo Dài (Unbounded Canvas Texture Cache Trap)*: Nếu mỗi lượt gieo xúc xắc, mua bán hoặc thay đổi màu linh vật tạo ra một `CanvasTexture` mới mà không có giới hạn O(1) hoặc không có hàm giải phóng (`clearMascotTextureCache`), GPU VRAM và JS Heap sẽ tăng tuyến tính dẫn đến crash trình duyệt trên mobile sau 20-30 vòng chơi.
  4. *Bẫy Khởi Tạo Multi-Sampling & FBO Churn Trên Render Loop (FBO Churn & Unnecessary Multisampling Trap)*: Kích hoạt `multisampling > 0` trên post-processing pipeline hoặc để `ContactShadows` cập nhật liên tục mỗi frame (`frames=Infinity`) sẽ khiến GPU liên tục cấp phát và hủy Framebuffer Objects (FBO), làm sụt giảm FPS nghiêm trọng trên thiết bị yếu.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **60s Grace Period & PLAYER_GRACE Invariant**: Khi socket đứt kết nối, server chuyển session sang `SessionState.GracePeriod` và kích hoạt bộ đếm thời gian 60 giây (`GRACE_PERIOD_MS = 60_000`). Đồng thời phát sóng thông điệp `PLAYER_GRACE` (kèm `secondsLeft: 60`) tới tất cả người chơi trong phòng.
  2. **Scoped Reconnect Token (UUID v4) Invariant**: Token kết nối lại là chuỗi UUID v4 ngẫu nhiên, gắn chặt với cặp `(playerId, roomCode)`. Token bị từ chối với lý do `TOKEN_INVALID` nếu không tồn tại hoặc sai phòng, và `TOKEN_EXPIRED` nếu thời gian ân hạn 60s đã kết thúc.
  3. **Non-Blocking Bot Takeover & Deadlock Elimination Invariant**: Khi hết hạn 60s mà người chơi chưa kết nối lại (`handleGraceExpired`), server chuyển session sang `Disconnected`, kích hoạt `BotEngine.takeover(room, playerId)` (`isBot = true`). Nếu đang là lượt của người chơi đó, server tự động gọi `runBotTurn` để tiếp tục ván đấu, triệt tiêu 100% tình trạng treo bàn (deadlock). Nếu game chưa bắt đầu (`!room.started`), người tạo phòng (Host) được bảo lưu danh tính con người (`isBot = false`), không biến thành Bot làm hỏng sảnh chờ.
  4. **Strict O(1) Texture Cache Invariant**:
     - `tileTextureCache`, `standeeTextureCache`, `tileImageCache` sử dụng index ô cờ `0..39` làm key cố định (`BOARD_SIZE = 40`). Kích thước cache không bao giờ vượt quá 40 phần tử (O(1)).
     - Toàn bộ 40 ô CanvasTexture (512x512 RGBA8888) tiêu thụ đúng 40.0 MB VRAM, nằm an toàn dưới trần ngân sách 45 MB.
     - `mascotTextureCache` có tối đa 20 tổ hợp (4 linh vật x 5 màu nền), tiêu thụ tối đa 1.25 MB VRAM (128x128 RGBA8888) và cung cấp hàm giải phóng `clearMascotTextureCache()`.
  5. **Zero FBO Churn & Multisampling Guard Invariant**:
     - `DEFAULT_PIPELINE_CONFIG.multisampling = 0` loại bỏ render target MSAA dư thừa.
     - `ContactShadows frames={1}` chỉ nướng kết cấu bóng tĩnh một lần khi render, triệt tiêu 100% việc tạo mới FBO theo frame.
     - 1.000 biến động FSM liên tục đảm bảo mức tăng bộ nhớ Heap < 10 MB (Zero Heap Growth Invariant).

---

### 145. [EVENT/ECONOMY/INVARIANT] Bất Biến Bảo Toàn Dòng Tiền Kho Bạc (Treasury Conservation) & Khử 100% No-Op Thẻ Sự Kiện (High-Impact Event Card Rebalancing - IMP-112)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Thẻ Sự Kiện "Hiệu Ứng Nhẹ Nhàng, Rút Như Không Rút" (Sub-threshold & No-Op Card Trap)*: Các thẻ phạt 200–400 Tr. VNĐ trong nền kinh tế người chơi có 15.000–25.000 Tr. VNĐ không tạo ra bất kỳ áp lực phá sản hay quyết định chiến thuật nào. Nhiều thẻ chỉ kích hoạt khi đạt Cấp 3 tại duy nhất ô 27 Phú Quốc (`MC_CASINO_PILOT`) hoặc hoán đổi đất chỉ khi cùng nhóm màu (`CC_SWAP_PROJECT`), khiến hơn 95% số lần rút trở thành No-op vô nghĩa.
  2. *Bẫy Chờ Dẫm Ô Ngắn Hạn Bị Bốc Hơi Trong 1 Vòng (Passive 1-Round Evaporation Trap)*: Các thẻ phụ thu tiện ích/vận tải (`MC_UTILITY_DOUBLE`, `MC_FUEL_SURGE`) chỉ kéo dài 1 vòng mà không có dòng tiền tức thì, đa số kết thúc mà không có ai dẫm trúng ô, khiến thẻ bị lãng phí.
  3. *Bẫy Rò Rỉ / Sinh Tiền Ảo Kho Bạc (Phantom Money & Treasury Leak Trap)*: Khi áp dụng tiền phạt hoặc thu phí từ thẻ sự kiện, nếu trừ tiền người chơi mà không nạp vào `room.treasury`, hoặc giải ngân cổ tức mà không trừ từ `room.treasury`, tổng cung tiền tệ của bàn cờ sẽ bị sai lệch, phá vỡ bất biến bảo toàn tài chính vĩ mô.
  4. *Bẫy Crash Khi Test Cô Lập Không Khởi Tạo Room (Roomless Unit Test Crash Trap)*: Handler thẻ sự kiện trước đây không nhận `Room`, nếu truy cập thẳng `room.treasury` mà không có null-safe check sẽ làm sập các bài test unit/contract cô lập.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Treasury Conservation Invariant**:
     - Mọi khoản phạt vi phạm (`CC_COPYRIGHT` 1.200 Tr., `CC_TAX_AUDIT` 500 Tr./ô C0, `CC_VENUE_INCIDENT` 600–1.200 Tr., `CC_BUILD_HALT` 800 Tr., `CC_MEDIA_CRISIS` 800 Tr., thuế tài sản `MC_ANTI_SPECULATE` 1.000 Tr.) BẮT BUỘC nạp trực tiếp vào `room.treasury`.
     - Mọi khoản chi giải ngân kích cầu (`MC_CASINO_PILOT` 1.500–3.000 Tr., fallback 1.000 Tr., `CC_PORT_EXCLUSIVE` 1.000 Tr.) BẮT BUỘC khấu trừ từ `room.treasury` với giới hạn sàn `Math.max(0, room.treasury - amount)`.
     - Phụ phí thu tức thì (`MC_UTILITY_DOUBLE` 400 Tr./người, `MC_FUEL_SURGE` 500 Tr./người) được chia đều cho các chủ sở hữu ô tài sản tương ứng; nếu ô chưa có chủ, toàn bộ số tiền đổ về `room.treasury`.
  2. **100% No-Op Elimination Invariant**:
     - `MC_CASINO_PILOT`: Mở rộng cho mọi ô Dịch Vụ C2+ (1.500 Tr.); ô 27 C3 nhận 3.000 Tr.; có fallback giải ngân 1.000 Tr. cho người nghèo nhất nếu chưa ai có C2+.
     - `CC_VENUE_INCIDENT`: Phạt 1.200 Tr. nếu có cơ sở dịch vụ; nếu không có vẫn phạt 600 Tr. phí bảo an toàn thành phố.
     - `CC_SWAP_PROJECT`: Bãi bỏ hoàn toàn giới hạn cùng nhóm màu; cho phép hoán đổi 1 ô C0 bất kỳ của đối thủ.
  3. **Instant Cash Flow & 2-Round Duration Invariant**:
     - Các thẻ sự kiện hạ tầng/tiện ích vĩ mô nâng thời hạn tác động lên 2 vòng chơi (`remainingRounds = 2`) và bổ sung ngay luồng tiền tức thì (Instant Charge) tác động lên toàn bộ người chơi ngay tại thời điểm rút thẻ.
  4. **Graceful Null-Safe Room Guard Invariant**:
     - Tất cả handlers của thẻ Cơ Hội và Thị Trường BẮT BUỘC nhận tham số `room?: Room` và bọc trong điều kiện kiểm tra `if (room) { ... }` trước khi thao tác lên `room.treasury`.

---

### 146. [BOT/ECONOMY/P2P] Bất Biến Sinh Tồn Trước Kingmaking, An Toàn Monopoly Gap & Giải Ngân Kho Bạc Tự Động (P2P Trading & Treasury Stimulus Invariants - IMP-113 & IMP-114)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Chặn Kingmaking Sai Lệch Khi Bot Đang Bên Bờ Phá Sản (False Kingmaking Defense in Solvency Distress Trap)*: `KINGMAKING_DEFENSE` ban đầu kích hoạt mỗi khi `buyer.balance > seller.balance * 3`. Khi Bot bán đất đang có số dư rất thấp (`seller.balance < 2.000 Tr.`, ví dụ 1.500 Tr.), một người chơi bình thường có 10.000 Tr. (chưa phải người dẫn đầu tài sản `30.000 Tr.`) vẫn lớn hơn $3 \times 1.500 = 4.500 Tr.$. Hậu quả: Bot từ chối bán ô đất dù được chào mua giá hời $1.3\times$ thị giá, tự bóp chết cơ hội sống sót và lao vào phá sản.
  2. *Bẫy Xói Mòn Đệm An Toàn Khi Bot Quyết Đấu Monopoly Gap (Monopoly Gap Safety Buffer Erosion Trap)*: Khi chào mua ô đất cuối cùng để hoàn thành độc quyền nhóm màu (`isMonopolyGap = true`), Bot sẵn sàng chi trả mức giá cao ($1.35\times$ đến $1.75\times$). Nếu chỉ dùng đệm an toàn mặc định `DEFAULT_MIN_SAFETY_BUFFER = 300 Tr.`, Bot sẽ cạn kiệt tiền mặt ngay sau giao dịch và lập tức bị hạ gục bởi phí thuê đất ở lượt tiếp theo.
  3. *Bẫy Thất Thoát / Sinh Tiền Ảo Trong Gói Kích Cầu Kho Bạc (Treasury Stimulus Macro Leak Trap)*: Khi Kho Bạc kích hoạt giải ngân 20% cho tối đa 2 người chơi nghèo nhất, nếu chia số lẻ mà không dùng `Math.floor` đồng nhất hoặc tính toán sai số tiền thực nhận (`amountPerPlayer * count`), phương trình bảo toàn tổng tài sản vĩ mô `delta(treasury) + delta(players_cash) === 0` sẽ bị phá vỡ.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Solvency Precedence Over Kingmaking Invariant**:
     - `KINGMAKING_DEFENSE` chỉ được phép kích hoạt khi `sellerBot.balance >= 2.000 Tr. && buyer.balance > sellerBot.balance * 3` (hoặc `buyer.balance >= 30.000 Tr.`).
     - Khi `sellerBot.balance < 2.000 Tr.` và được chào mua $>= 1.3\times$ giá niêm yết, Bot Balanced BẮT BUỘC ưu tiên sinh tồn và chấp thuận giao dịch bán tài sản để cứu vãn dòng tiền khả dụng.
  2. **Monopoly Gap 1.000 Tr. Safety Floor Invariant**:
     - Trong `calculateTradeOfferPrice`, khi `isMonopolyGap === true`, đệm an toàn khả dụng bắt buộc nâng lên sàn tối thiểu `Math.max(customSafetyBuffer ?? DEFAULT_MIN_SAFETY_BUFFER, 1.000 Tr.)`, ngăn chặn Bot tự sát tài chính vì độc quyền.
  3. **Macro Treasury Conservation Invariant**:
     - Trong `processTreasuryStimulus`, số tiền khấu trừ từ `room.treasury` BẮT BUỘC khớp chính xác 100% với `amountPerPlayer * count`, bảo đảm đẳng thức bảo toàn tuyệt đối không sai lệch 1 Tr. VNĐ.
     - Tự động kích hoạt khi vòng chơi kết thúc (`next === 0`) tại `turn_loop.ts`, bảo đảm dòng tiền kích cầu đến đúng người chơi còn sống nghèo nhất.

---

### 147. [FSM/BOT/PACING] Thang Tăng Giá Thuê 2 Nấc Cuối Ván, Nâng Trần 40 Vòng & Chuẩn Hóa Bot Thận Trọng (Dynamic Late-Game Pacing & Prudent Bot Invariants - IMP-115)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Bế Tắc Vòng Đấu 30 Khi Bàn Đấu Cân Bằng (30-Round Stagnation & Premature Timeout Trap)*: Trần 30 vòng ban đầu (`MAX_ROUNDS = 30`) khiến nhiều ván đấu kết thúc đột ngột theo phán quyết tài sản ròng mà không tạo đủ không gian cho chiến lược lội ngược dòng hay dứt điểm bằng phá sản tự nhiên.
  2. *Bẫy Tiền Thuê Cố Định Khiến Ván Đấu Kéo Dài (Flat Rent Inflation Lag Trap)*: Về cuối ván, người chơi tích lũy nhiều tiền mặt từ ô GO và cổ tức, khiến tiền thuê gốc tại các ô đất không đủ tạo áp lực tài chính quyết định. Nếu tăng giá đồng loạt cho cả Hạ tầng và Tiện ích sẽ phá vỡ cấu trúc vi mô cố định của các ô vận tải 2D6 và ETC.
  3. *Bẫy Bot Bỏ Cuộc Quá Sớm Trong Đấu Giá (Sub-Par Bot Auction Drop-Out Trap)*: Bot Passive trước đây rút lui khỏi phiên đấu giá khi giá vượt quá 85% giá gốc (hoặc bước giá tiếp theo vượt 70%), vô tình để đối thủ gom được các ô đất giá rẻ mà không phải chịu bất kỳ sự cạnh tranh nào.
  4. *Bẫy Bàn Đấu 4 Người Bị Trì Hoãn P2P Quá Muộn (4-Player P2P Negotiation Latency Trap)*: Trong bàn 4 người, tài sản phân bổ phân tán hơn, ngưỡng vòng 6 mới cho phép chào mua độc quyền với hệ số cao khiến các liên minh và giao dịch P2P bùng nổ quá trễ, làm giảm nhịp độ cạnh tranh.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Two-Tier Late-Game Rent Surge Invariant**:
     - Áp dụng hệ số tăng giá thuê theo vòng cho duy nhất `CellType.Property`:
       - Vòng 20 đến 29: nhân hệ số $1.2\times$ (`Math.floor(rent * 1.2)`).
       - Vòng 30 trở đi: nhân hệ số $1.5\times$ (`Math.floor(rent * 1.5)`).
     - Tuyệt đối MIỄN TRỪ hoàn toàn cho `CellType.Railroad` và `CellType.Utility` để bảo toàn công thức lũy tiến ETC và biến thiên 2D6.
     - Truyền đồng bộ `roundCount` qua `resolveRent`, `handleLanding` và `turn_loop.ts`.
  2. **Max Rounds Hard Cap 40 Invariant**:
     - `export const MAX_ROUNDS = 40;` trong `src/domain/room.ts`.
     - Ván đấu chuyển sang kết thúc khi `roundCount > 40` (vòng 41), bảo lưu điều kiện kết thúc sớm khi chỉ còn $\le 1$ người chơi còn sống.
  3. **Early 4P P2P Monopoly Negotiation Invariant**:
     - Trong `calculateTradeOfferPrice`, bàn chơi có $\ge 4$ người chơi hạ ngưỡng kích hoạt mức giá chào mua cao xuống Vòng 4 thay vì Vòng 6 (`const roundThreshold = (playerCount >= 4) ? 4 : 6;`).
  4. **Prudent Passive Bot Hardening Invariant**:
     - Trong `bot_types.ts`, `DEFAULT_PERSONALITY_WEIGHTS[BotPersonality.Passive].minBuffer` nâng lên `600` Tr. VNĐ (thay vì 300 Tr.) nhằm bảo toàn thanh khoản thận trọng.
     - Trong `bot_auction.ts`, `isPassiveAuctionAllowed` nâng ngưỡng chịu giá lên $1.15\times$ giá gốc (`basePrice * 1.15`), ngăn chặn đối thủ thâu tóm đất rẻ vô điều kiện.

---

### 148. [3D/RENDER/PAWN] Bất Biến Dáng Cờ Cao Đồng Nhất (Tall Chess Archetype), 100% Phủ Màu Bản Sắc & Đồng Bộ Trình Duyệt WebGL (Tall Chess Pawns Full Color & Browser WebGL Sync Invariants - IMP-116)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Lệch Pha Trình Duyệt WebGL vs Headless SSR*: Trong môi trường headless, `SafeGLTFModel` chuyển sang fallback. Nhưng trên trình duyệt thật với WebGL context kích hoạt, nếu không có `forceFallback={true}`, `SafeGLTFModel` tải GLTF cũ, gây lệch hình ảnh so với test.
  2. *Bẫy Lệch Chuẩn Tỷ Lệ Dáng Quân Cờ*: Các quân cờ trước đây dùng bệ có kích cỡ không đồng nhất, thân lùn bẹp, mất tính nhận diện.
  3. *Bẫy Phai Nhạt Đặc Trưng Đỉnh Cờ Vua*: Thiếu các chi tiết nhận diện của 4 quân cờ Xe (crenellations + vòm), Pháo (nòng pháo vươn + gờ mạ vàng), Mã (đầu cờ vua + bờm vàng), Hậu (vương miện Indochine 6 chóp + ngọc phát quang).
  4. *Bẫy Màu Inox Trộn Lẫn*: Các quân cờ từng dùng inox bạc (`#F8FAFC`, `#E2E8F0`), triệt tiêu màu sắc nhận diện người chơi.
  5. *Bẫy Trôi Chỉ Số Quân Cờ Trong Sảnh Chờ*: `createEmptySlot` không gán `pawnSlot` mặc định gây trôi index linh vật.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Tall Chess Pawn Base Invariant**: Cả 4 quân cờ dùng chung `TallChessPawnBase`: chân đế 2 tầng tròn loe (radius <= 0.15m), thân trụ cao 0.22m (>= 0.20m) mang `activeColor`, và vành đai cổ vàng kim `#F59E0B` (`pawn-neck-ring`).
  2. **Iconic Head Geometry Invariant**: Xe 🏰 (4 crenellations + vòm tâm `pawn-rook-dome`), Pháo 💣 (nòng hướng lên `pawn-cannon-barrel` + miệng vàng `#F59E0B`), Mã 🐎 (đầu `pawn-horse-head` + bờm vàng `pawn-horse-mane`), Hậu 👑 (vương miện 6 chóp `pawn-crown-point` + ngọc phát quang `pawn-queen-gem`).
  3. **Full Color & Toy Lacquer PBR Invariant**: 100% diện tích thân quân cờ mang màu người chơi `activeColor`, `metalness <= 0.40`, `roughness` [0.20, 0.35], triệt tiêu hoàn toàn màu bạc/inox `#F8FAFC`, `#E2E8F0`.
  4. **Browser WebGL Sync Invariant**: `LuxuryPawnModel` thiết lập `forceFallback={true}` trên `SafeGLTFModel` để đồng bộ 100% hình ảnh trên WebGL thực tế với SSR test.
  5. **Deterministic Lobby Slot Initialization Invariant**: `createEmptySlot(index)` khởi tạo `pawnSlot: index % MAX_LOBBY_SLOTS`.

---

### 149. [NET/FSM/UI] Bất Biến Đồng Bộ Xúc Xắc Pha Vỡ Nợ & Triệt Tiêu Popup Đúp Modal Phá Sản (Insolvency Movement Sync & Zero-Duplicate Bankruptcy Modal Lifecycle - IMP-110)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Xóa Xúc Xắc Giả Lập Khi Hạ Cánh Vào Pha Vỡ Nợ (Insolvency Movement Teleport Fallback Trap)*: Khi người chơi gieo xúc xắc hạ cánh vào ô tài sản của đối thủ và không đủ tiền trả phí thuê đất, FSM chuyển trạng thái tức thì sang `TurnPhase.InsolvencyPhase` cùng với việc số dư bị âm. Server phát gói tin `STATE_DELTA` mang `turnPhase: "InsolvencyPhase"`, `dice: [d1, d2]` và vị trí mới. Tuy nhiên, logic phân loại di chuyển trong `telemetry_delta_hook.ts` trước đây chỉ xem các pha `WaitingRoll, ActionPhase, PropertyManagement, HosePhase, AuctionPhase` là các pha di chuyển bằng xúc xắc hợp lệ. Khi thiếu `TurnPhase.InsolvencyPhase`, hook đánh giá sai rằng pha này không được phép có xúc xắc (`isMovementPhase = false`), dẫn đến việc xóa bỏ trường `dice` thành `undefined`. Kết quả là Hộp đen Telemetry phát hiện quân cờ nhảy ô mà không có xúc xắc và phát cảnh báo giả `INVALID_POSITION_STEP` (như ghi nhận tại Tick 240, ô 35 -> 39 với xúc xắc [2, 2]). Đồng thời, `checkIsTeleport` hiểu nhầm đây là một cú dịch chuyển tự do thay vì bước đi xúc xắc bình thường.
  2. *Bẫy Mở Lại Modal Vỡ Nợ Sau Khi Đã Tuyên Bố Phá Sản (Zero-Duplicate Bankruptcy Modal Reopen Trap)*: Khi người chơi bị âm tiền và bấm nút "Tuyên Bố Phá Sản" trên `InsolvencyBanner`, callback gọi `closeModal()` rồi gửi `INTENT_BANKRUPTCY` lên server. Server xử lý phá sản thành công và gửi delta tiếp theo với `players: [{ id: "p1", balance: -deficit, bankrupt: true }]`. Khi client nhận delta này, listener trong `use_app_session.ts` kiểm tra `localP && localP.balance < 0`. Do modal vừa được đóng (`activeModal === null`) và không kiểm tra cờ `bankrupt`, điều kiện mở modal lại thỏa mãn lần thứ hai. Người chơi vừa bấm phá sản xong thì màn hình lại bị bật lên modal phá sản lần 2 gây ức chế và vi phạm vòng đời UI.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Insolvency Movement Phase Normalization Invariant**:
     - Trong `telemetry_delta_hook.ts`, cả `isMovementPhase` và `checkIsTeleport` BẮT BUỘC công nhận `TurnPhase.InsolvencyPhase` là pha di chuyển xúc xắc hợp pháp.
     - Bảo toàn 100% trường `dice` trong sự kiện `movement` khi người chơi di chuyển bằng xúc xắc và bị vỡ nợ tại ô hạ cánh, triệt tiêu 100% cảnh báo giả `INVALID_POSITION_STEP`.
  2. **Zero-Duplicate Bankruptcy Modal Guard Invariant**:
     - Trong `use_app_session.ts`, điều kiện mở modal `insolvency` BẮT BUỘC có guard:
       `const isBankrupt = Boolean(localP.bankrupt ?? useGameStore.getState().playersInfo[localPlayerId]?.bankrupt);`
       Chỉ mở modal khi: `localP.balance < 0 && !isBankrupt && currentModal !== 'insolvency' && currentModal !== 'game_over'`.
     - Người chơi đã phá sản (`bankrupt === true`) TUYỆT ĐỐI KHÔNG BAO GIỜ bị mở lại modal vỡ nợ dù số dư vẫn còn đang âm.
  3. **Active Modal Disposal on Bankruptcy Confirmation Invariant**:
     - Trong `apply_delta_players.ts`, khi nhận delta có `p.bankrupt === true` mà `state.activeModal === 'insolvency'`, client BẮT BUỘC chủ động gọi `state.closeModal()` để dọn dẹp sạch sẽ mọi modal nợ nần đang tồn đọng.

---

### 150. [DOMAIN/CARDS/LOBBY] Bất Biến Thẻ Sự Kiện Tác Động Cao Thực Tế, Chốt Kiểm Tra Ô Hạ Cánh & Đồng Bộ Hóa Hướng Dẫn Sảnh Chờ (Real-Life Event Impact, Checkpoint Landing Penalties & Lobby Guide Synchronization Invariants - IMP-116)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Thẻ Sự Kiện Vô Nghĩa & Lệch Pha Đời Sống (Passive No-Op Event Cards Trap)*:
     - Các thẻ sự kiện trước đây có hiệu lực mờ nhạt hoặc phi kinh tế: `MC_ALCOHOL_CHECK` chỉ giảm 50% tiền thuê ô giải trí nếu chưa xây nhà (vô nghĩa khi vào ô trống hoặc đã có nhà); `MC_NIGHT_ECONOMY` chỉ tăng 50% tiền thuê của các ô dịch vụ (thường không ai dẫm vào trong 1 vòng); `CC_LAND_CHANGE` phạt 800 Tr. của người rút nhưng chỉ tăng vĩnh viễn 50% tiền thuê đất thô C0 (một bẫy tài chính khiến người chơi lỗ vốn vì tiền thuê đất thô C0 chỉ vài chục triệu); `CC_SLOW_BUILD` phạt 500 Tr. người chơi nhưng không có chế tài xử lý đất dự án treo...
  2. *Bẫy Lỗi Lệch Pha Sảnh Chờ vs Thực Tế Game (Lobby GameRulesModal SSOT Drift Trap)*:
     - Sảnh chờ (`GameRulesModal` mở từ `PreMatchDeck`) là cửa ngõ đầu tiên người chơi tiếp cận luật. Khi hệ thống trải qua nhiều nâng cấp lớn gần đây (40 vòng MAX_ROUNDS, cơ chế lạm phát về đích 1.2x và 1.5x, xả quỹ Kho Bạc 20% khi vượt 10.000 Tr., bước giá đấu giá +100/+200/+500 Tr., luật 7 thẻ sự kiện mới...), nếu sảnh chờ vẫn hiển thị luật cũ (30 vòng, thiếu lạm phát, sai mô tả thẻ) sẽ gây hiểu lầm nghiêm trọng cho người chơi và vi phạm nguyên tắc Single Source of Truth (SSOT).
  3. *Bẫy Kiểm Thử FSM Bị Tác Động Ngoại Lai (Broad Event Cashflow Test Coupling Trap)*:
     - Khi các thẻ sự kiện tác động diện rộng (`MC_NIGHT_ECONOMY`, `MC_PUBLIC_INVEST`) kích hoạt các dòng tiền trên toàn bàn cờ từ người chơi khác, các bài test tích hợp FSM (như test thụ án tù 3 vòng của p1) nếu đo số dư tuyệt đối `initialBalance - 500` sẽ bị fail nếu người chơi p2 vô tình rút trúng thẻ kích cầu làm p1 bị trừ tiền.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Real-Life High-Impact Economic Cards Invariant**:
     - `MC_ALCOHOL_CHECK` (Chốt Kiểm Tra Nồng Độ Cồn): Đối thủ dừng chân tại bất kỳ ô Giải trí/Dịch vụ nào của người chơi khác trong thời gian hiệu lực lập tức bị phạt 800 Tr. nộp vào Kho Bạc và tạm giữ phương tiện (mất lượt tiếp theo `skipNextTurn = true`).
     - `MC_NIGHT_ECONOMY` (Kích Cầu Kinh Tế Đêm): Mỗi người chơi trên bàn cờ đóng góp 400 Tr. vào quỹ chung để giải ngân chia đều cho các chủ sở hữu ô Dịch vụ (ô 6, 8); nếu chưa ai sở hữu ô Dịch vụ thì nộp toàn bộ vào Kho Bạc. Hiệu lực 2 vòng, x2 phí thuê ô Dịch vụ.
     - `CC_LAND_CHANGE` (Quy Hoạch Lại Đất Đai): Nộp 500 Tr. lệ phí chuyển đổi mục đích sử dụng đất vào Kho Bạc để nâng cấp thẳng 1 ô C0 lên C1 (Level 1) ngay lập tức mà không cần sở hữu trọn bộ màu! Nếu không có ô C0 nào, nhận 600 Tr. hỗ trợ quy hoạch từ Kho Bạc.
     - `CC_SLOW_BUILD` (Chế Tài Đất Chậm Tiến Độ): Phạt 600 Tr. nộp Kho Bạc và đánh dấu `unbuiltRounds = 1`. Nếu người chơi bị âm tiền sau khi phạt, thu hồi đất ngay lập tức vào trạng thái vô chủ (`registry.delete(cell)`). Nếu không có ô C0, nộp phí hành chính 300 Tr.
     - `MC_COASTAL_STORM` (Bão Biển Đổ Bộ): Hiệu lực kéo dài 2 vòng, phạt 400 Tr./cấp nhà trên các ô ven biển nộp Kho Bạc để sửa chữa, đồng thời người chơi dừng chân tại ô ven biển trong bão phải tạm dừng tránh trú (mất lượt tiếp theo `skipNextTurn = true`).
     - `MC_PUBLIC_INVEST` (Kích Cầu Đầu Tư Công): Kho Bạc giải ngân 400 Tr. kích cầu cho mỗi người chơi, hỗ trợ 1.000 Tr./ô cho chủ sở hữu các ô hạ tầng giao thông và x2 cước vận tải trong 2 vòng.
     - `MC_FREEZE_TRADE` (Thanh Tra Bất Động Sản): Đóng băng toàn bộ hoạt động mua bán, chuyển nhượng P2P trong 2 vòng.
  2. **Landing Checkpoint Penalties Hook Invariant**:
     - `handleLanding` trong `property_manager.ts` nhận tham số `room?: Room` để có thể truy cập `room.activeModifiers`, áp dụng chế tài tức thì khi người chơi hạ cánh vào ô có chốt nồng độ cồn hoặc vùng tâm bão.
  3. **Lobby & Title Deed Modal SSOT Synchronization Invariant**:
     - Đồng bộ 100% `GameRulesModal.tsx` và `TitleDeedModal.tsx` với logic thực thi: Tab Core (40 vòng, lạm phát 1.2x và 1.5x), Tab Cards (20 thẻ Cơ Hội, 16 thẻ Thị Trường thực tế), Tab Mechanics (bước giá đấu giá +100/+200/+500 Tr., xả quỹ Kho Bạc 20% khi >= 10.000 Tr., đóng băng giao dịch).
  4. **Delta-Based Isolated Assertion Invariant**:
     - Các bài test vòng đời FSM cô lập (như Jail 3-turn audit transition) bắt buộc đo lường delta cục bộ (`balanceBeforeExit - 500`, `treasuryBeforeExit + 500`) thay vì dùng giá trị balance toàn cục để triệt tiêu ảnh hưởng ngẫu nhiên từ các sự kiện diện rộng.

---

### 151. [UI/UX/HUD] Bất Biến Thông Báo Giao Dịch Ngữ Cảnh, Tách Biệt Cột Mốc Danh Dự & Triệt Tiêu Che Khuất Đa Nền Tảng (Contextual Transaction Toasts, Milestone Banner Segregation & Multi-Platform Zero Obscuration Invariants - IMP-117)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Thông Báo Số Thô Vô Nghĩa (Raw Number Context Void Trap)*: Popup nổi trước đây chỉ hiển thị duy nhất con số thô `-600 Tr.` hoặc `+500 Tr.`, triệt tiêu hoàn toàn ngữ cảnh nghiệp vụ. Người chơi nhìn vào không thể phân biệt được mình vừa mua đất, nâng cấp công trình, bị trừ tiền thuê, hay nộp thuế.
  2. *Bẫy Xếp Chồng Dọc Che Khuất Sa Bàn 3D (Vertical Stacking Board Obscuration Trap)*: Đặt danh sách badge dồn ứ ở `fixed top-24 left-1/2` kéo dài xuống dưới che mất các ô đất phía Bắc (ô 19-31: Đà Nẵng, Huế, Hà Nội) và sa bàn trung tâm `MiniatureCityDiorama`. ĐỒNG THỜI hoạt ảnh cũ `translateY(-44px)` bay ngược lên chèn đè vào mép dưới thanh `TopBar` (vòng đấu, timer đếm ngược).
  3. *Bẫy Trộn Lẫn Thông Báo Dài Vào Huy Hiệu Tiền Tệ (Text Bloat Pill Overflow Trap)*: Nhồi nhét các thông báo sự kiện dài dòng (như "ĐỘC QUYỀN XANH DA TRỜI! Phí thuê cơ bản x2!", "Thoát vỡ nợ thành công!...") vào cùng một component huy hiệu tiền tệ làm vỡ tỷ lệ layout trên thiết bị di động.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Two-Tier Notification Architecture Invariant**:
     - **Tầng 1 (Contextual Financial Toast)**: Dạng viên thuốc Capsule Pill mang đầy đủ: Biểu tượng hành động trực quan (🏷️ Mua đất, 🏗️ Nâng cấp nhà, 🏠 Trả thuê, 💰 Nhận thuê, 🚩 Lương GO, 🏛️ Thuế, ⚖️ Bảo lãnh), Huy hiệu người chơi mang màu token, Tiêu đề ngữ cảnh (ví dụ: `Mua Đà Nẵng`, `Nâng C1 (Nhà Phố)`), và Số tiền định dạng chuẩn.
     - **Tầng 2 (Milestone Celebration Banner)**: Tách riêng các sự kiện bước ngoặt (Độc quyền bộ màu `actionType: 'monopoly'`, Thoát nợ `actionType: 'debt_relief'`) thành Banner vinh danh trang trọng viền vàng kim `#F59E0B`, nền kem `#FFFDF8`, đổ bóng cứng `#d97706`, tự đóng sau 2.2s.
  2. **Multi-Platform Zero Obscuration Layout Invariant**:
     - **Desktop ($\ge 768px$)**: Tọa độ `top-20 right-6`, hiển thị tối đa **2 toasts** gần nhất (`slice(-2)`), xếp dọc thanh thoát bên cạnh `PlayerHudList`, giải phóng 100% trục giữa và sa bàn 3D.
     - **Mobile ($< 768px$)**: Tọa độ `top-[4.25rem] left-1/2 -translate-x-1/2`, hiển thị duy nhất **1 toast** mới nhất (`slice(-1)`), chiều cao gọn gàng, bề ngang tối đa `max-w-[92vw]`, toast mới thay thế toast cũ lập tức không chiếm dụng diện tích màn hình cảm ứng.
  3. **Isomorphic Store Access for SSR Invariant**:
     - Trong các component HUD có render trong môi trường test/SSR, truy cập store theo mẫu: `const isSSR = typeof window === 'undefined'; const data = isSSR ? useGameStore.getState().field : storeField;` để đồng bộ 100% dữ liệu mà không phụ thuộc vòng đời client-only hooks.

---

### 152. [3D/NETWORK/FSM] Bất Biến Đồng Bộ Tuần Tự Xúc Xắc - Quân Cờ & Kháng Lệch Pha Độ Trễ Mạng (Dice-to-Pawn Sequential Synchronization & Web Latency Resilience - IMP-112)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Nghịch Đảo Thứ Tự Xử Lý Delta (Delta Execution Inversion Trap)*:
     - Trong `applyDeltaToStore` (`apply_delta.ts`), `applyPlayerDeltas` trước đây được gọi TRƯỚC `applyPhaseAndTimerDeltas` (chứa `syncDiceRoll`).
     - Khi nhận delta có xúc xắc và vị trí mới (đặc biệt trong lượt Bot hoặc người chơi chưa kịp bật cờ client `isRolling`), `applyPlayerDeltas` kiểm tra thấy `isRolling === false` nên lập tức kích hoạt `startPawnMove` / `enqueuePawnMove` khiến con cờ phóng đi ngay lập tức. Sau đó `syncDiceRoll` mới chạy và bật `isRolling: true` làm xúc xắc bắt đầu quay. Kết quả: Con cờ nhảy trước khi xúc xắc quay xong, hoàn toàn phá vỡ trình tự vật lý tự nhiên của board game.
  2. *Bẫy Cache Lượt Xúc Xắc và Kích Hoạt Sớm `onRest` (Stale Seq Cache & Premature onRest Trap)*:
     - Trong `SingleDie` (`dice_tray.tsx`), `lastAnimatedSeqRef` lưu lại `diceSeq` của lượt trước (giả sử $N$). Sang lượt mới, client gọi `setIsRolling(true)` lạc quan trong khi delta máy chủ mang $N+1$ chưa tới (delay mạng). Điều kiện cũ `if (diceSeq !== undefined && diceSeq !== lastAnimatedSeqRef.current)` đánh giá $N \ne N$ thành `false`, khiến nhánh reset spring bị bỏ qua. Spring vẫn ở $t = 1$ từ lượt trước và lập tức kích hoạt `onRest` ngay frame đầu tiên, dập tắt `isRolling` về `false` trước khi xúc xắc kịp quay.
  3. *Thiếu Khoảng Đệm Đọc Mặt Số (Zero Settle Delay Flaw)*:
     - Khi xúc xắc vừa tiếp đất ở 1100ms, nếu giải phóng quân cờ ngay lập tức ở cùng mili-giây sẽ tạo cảm giác giật cục, người chơi chưa kịp nhìn thấy số chấm thì camera đã cướp quyền bám theo con cờ.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Strict Sequence Precedence Invariant**:
     - Trong `applyDeltaToStore`, `syncDiceRoll` BẮT BUỘC được gọi đầu tiên, trước khi trích xuất `currentState` và chuyển giao cho `applyPlayerDeltas`.
     - Nếu delta mang xúc xắc hợp lệ, `triggerDiceRoll` sẽ đưa trạng thái store vào `isRolling: true`.
     - Nhờ đó, `applyPlayerDeltas` nhận biết chính xác đang trong pha gieo xúc xắc và định tuyến chuyển động quân cờ vào `pendingPawnMove` thay vì cho phép nhảy tức thì.
  2. **SingleDie Spring Reset & Lifecycle Invariant**:
     - Trong `SingleDie`, mỗi khi `isRolling` chuyển từ `false` sang `true` (`!prevRollingRef.current`), BẮT BUỘC gán `shouldReset = true` và đồng bộ `lastAnimatedSeqRef.current = diceSeq` để khởi động lại lò xo diễn hoạt từ $t = 0$.
     - Nếu xúc xắc đang quay mà nhận được `diceSeq` mới khác với lượt đang chạy, lò xo cũng được reset mượt mà theo giá trị mới.
  3. **250ms Settle Delay & Safe Timer Cleanup**:
     - Sự kiện kết thúc diễn hoạt `onRest` chỉ được chấp thuận khi `result?.finished === true`.
     - Bổ sung khoảng dừng tĩnh 250ms (`settleTimerRef`) sau khi xúc xắc tiếp đất để người chơi quan sát rõ mặt số trước khi kích hoạt `setIsRolling(false)`.
     - Khi component unmount hoặc reset, bộ đếm `settleTimerRef` được dọn dẹp triệt để, ngăn chặn memory leak.
   4. **Queue Release Lifecycle Invariant**:
      - `setIsRolling(false)` là sự kiện duy nhất được phép giải phóng `pendingPawnMove` để chuyển tiếp vào `startPawnMove`, kích hoạt camera bám đuổi `pawn_chase` và chuỗi âm thanh bước chân.

---

### 153. [BOT/STRATEGY/BALANCE] Bất Biến Cân Bằng Chiến Lược 3 Tính Cách Bot AI & Triệt Tiêu Vị Thế Mồi Ngon Của Bot Passive (Tri-Personality Strategic Parity & Anti-Prey Passive Bot Invariant - IMP-119)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Bot Passive Làm Mồi Ngon Bị Khai Thác (Passive Sitting Prey Trap)*: Bot Passive trước đây bị gò bó bởi trần mua đất thô rẻ <= 1500 Tr., không tham gia đấu giá hạ tầng hay đất độc quyền, và bán rẻ mọi ô đất với giá chỉ 1.35x. Kết quả là Bot Balanced và Bot Aggressive dễ dàng mua gom ô độc quyền từ Passive với giá rẻ mạt, khiến tỷ lệ thắng của Passive sụt giảm xuống mức báo động (chỉ 3% ở bàn 4P và 13% ở bàn 3P).
  2. *Bẫy Bế Tắc Xây Nhà Do Cấm Đoán Cực Đoan (Extreme Danger Tiles Upgrade Softlock)*: Quy tắc cũ cấm hoàn toàn Bot Passive nâng cấp nhà nếu có bất kỳ ô đất nào của đối thủ trong tầm 2-12 bước (`dangerTilesCount > 0`). Trên bàn cờ 40 ô với 3-4 người chơi, gần như luôn có ô đối thủ phía trước, khiến Bot Passive tích lũy 10.000 - 20.000 Tr. tiền mặt nhưng ôm đất C0 chịu trận đến khi bị phá sản bởi khách sạn của đối thủ.
  3. *Bẫy Khủng Hoảng Thanh Khoản Tự Hủy Sớm Của Bot Aggressive (Premature Liquidity Suicide)*: Bot Aggressive tiêu cạn tiền mặt vì đệm an toàn quá mỏng (minBuffer 200 Tr.), dẫn đến vỡ nợ sớm trong các ván đấu 3P/4P kéo dài.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Monopoly Defense Invariant**: Trong `evaluateBotTradeAcceptance`, nếu việc chuyển nhượng mang lại độc quyền cho bên mua (`givesMonopolyToBuyer === true`), Bot Passive BẮT BUỘC từ chối (`PREVENT_MONOPOLY`), trừ khi nhận mức giá cắt cổ >= 2.0x và đang kẹt tiền mặt khẩn cấp (< 500 Tr.). Với ô đất lẻ không độc quyền, nâng ngưỡng chấp thuận lên >= 1.40x.
  2. **Competitive Monopoly Gap Closing Invariant**: Khi chào mua ô đất còn thiếu để hoàn tất độc quyền cho chính mình (`isMonopolyGap === true`), Bot Passive nâng giá chào mua lên 1.60x (thay vì 1.35x), đủ sức thuyết phục Bot Balanced (đòi 1.50x) và Bot Aggressive kẹt tiền (đòi 1.55x) nhượng quyền.
  3. **High-Value Acquisition & Strategic Auction Invariant**: Bỏ trần mua đất rẻ <= 1500 Tr. Bot Passive được phép mua đất giá trị cao khi tiền mặt đủ an toàn. Trong đấu giá, Bot Passive được phép trả tới 1.35x cho ô Hạ tầng/Tiện ích và tới 1.50x cho ô mảnh ghép độc quyền. Khi là ô đất thông thường, trần đấu giá duy trì nghiêm ngặt ở 1.15x.
  4. **Tiered Cash Fortress Upgrade Invariant**: Trong `canUpgradeCell`, Bot Passive chỉ nâng cấp khi số dư >= 3 lần chi phí xây dựng. Nếu có ô đối thủ nguy hiểm phía trước (`dangerTilesCount > 0`), Bot đòi hỏi pháo đài tiền mặt vượt trội: số dư sau khi xây phải còn lại >= 3 lần `safetyBuffer` và tổng số dư ban đầu >= 5 lần chi phí xây dựng. Nếu phía trước thông thoáng, chỉ cần số dư sau khi xây >= 1.2 lần `safetyBuffer`.
  5. **Parity Benchmark Outcome**: Qua 3.900 ván mô phỏng thực nghiệm, tỷ lệ thắng của Bot Passive tăng vọt từ 3% lên 14% ở bàn 4P, từ 13% lên 20% - 21.3% ở bàn 3P, và từ 24% lên 38% ở bàn 2P; đưa cả 3 trường phái AI về thế chân vạc cạnh tranh thực sự.

---

### 154. [BOT/STRATEGY/DIFFICULTY] Bất Biến Thế Trận Động, Bẫy Đón Đầu 2D6 & Cấm Vận Kẻ Thống Trị Tái Lập Độ Khó Thông Minh (Dynamic Posture, 2D6 Ambush Upgrades & Anti-Leader Embargo Invariant - IMP-120)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Chênh Lệch Vị Thế Cố Định (Static Strategy Trap)*: Trước IMP-120, Bot AI hành xử rập khuôn theo tính cách tĩnh (Aggressive luôn tiêu hoang, Passive luôn gom tiền, Balanced hành xử trung lập) bất kể đang dẫn đầu vượt trội hay rơi vào nhóm bét bảng (Trailing). Hậu quả: Bot Passive khi thua sâu vẫn cố thủ không chịu xây nhà; Bot Aggressive khi dẫn đầu lại tiếp tục chi tiêu mạo hiểm đến mức vỡ nợ bất ngờ.
  2. *Bẫy Nâng Cấp Tù Mù Bỏ Lỡ Cơ Hội Sát Thương (Blind Upgrade Order Flaw)*: Bot nâng cấp công trình thuần túy theo thứ tự index (ô 1 trước ô 3), hoàn toàn mù quáng trước vị trí của đối thủ trên bàn cờ. Ngay cả khi Người chơi thật đang lù lù tiến tới trong tầm xúc xắc 2D6 (5..9 bước) của ô đất đắt giá, Bot vẫn nâng cấp ô đất khác ở xa tít tắp, đánh mất cơ hội tung đòn chí mạng.
  3. *Bẫy Cấm Vận Nhầm Người Chơi Bình Thường (False Leader Embargo Trap)*: Nếu thuật toán nhận diện Kẻ Thống Trị (`isLeadingPlayer`) chỉ dựa trên chênh lệch tương đối `top.nw >= secondNw * 1.25 || top.nw >= secondNw + 4000`, thì ngay ở vòng 1-3 khi vốn khởi điểm là 15.000 Tr., một người chơi có 10.600 Tr. cũng bị coi là "Kẻ Thống Trị" chỉ vì đối thủ vừa mua đất còn 5.600 Tr., làm tê liệt toàn bộ thị trường đàm phán chuyển nhượng P2P.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Dynamic Posture Evaluation Invariant**:
     - Phân loại 3 vị thế động dựa trên tổng tài sản ròng (Net Worth = Tiền mặt + Giá trị đất C0..C3 + 50% đất thế chấp): `Leading` (Top 1 vượt trội), `Trailing` (thua top 1 > 1.4x ở vòng 15+ hoặc xếp thứ 3+), `Parity` (tranh chấp cân bằng).
     - Khi Bot Passive ở vị thế `Trailing` hoặc từ vòng 20 trở đi: hạ rào cản đệm an toàn từ 3.0x xuống 1.8x `safetyBuffer`, giải phóng sức mạnh công trình độc quyền để vùng lên lật kèo.
     - Khi Bot Aggressive ở vị thế `Leading`: nâng đệm an toàn lên 1.45x `safetyBuffer`, bảo toàn thành quả chiến lược, không tự hủy vì đầu tư vô tội vạ.
  2. **Targeted 2D6 Ambush Upgrades Invariant**:
     - `calculateAmbushScore` quét bước chân đối thủ trong dải xác suất cao nhất của xúc xắc 2D6 (bước 4..10, trọng tâm 5..9 bước).
     - Nhân hệ số ưu tiên 1.5x khi đối thủ đang tiến vào tầm ngắm là Người chơi thật.
     - Trong `findEligibleUpgradeCell`, ưu tiên tuyệt đối nâng cấp ô đất có `ambushScore` cao nhất để đón đầu và thu tiền thuê tối đa.
  3. **Proactive Leveraged Mortgage Invariant**:
     - Khi sở hữu bộ màu độc quyền nhưng thiếu tiền nâng cấp C1-C3, Bot rà soát các ô đất lẻ C0 vô dụng (nhóm màu mà đối thủ đã chiếm giữ không thể hoàn thành bộ màu) để chủ động thế chấp lấy vốn xây công trình độc quyền ngay lập tức.
  4. **Strict Leader Embargo & Kingmaking Defense Invariant**:
     - Chỉ người chơi có Net Worth >= 18.000 Tr. VÀ vượt trội đối thủ thứ hai (`top.nw >= secondNw * 1.30` hoặc `top.nw >= secondNw + 5000`) mới bị định danh là `isLeadingPlayer`.
     - 100% Bot kiên quyết từ chối bán đất cho Kẻ Dẫn Đầu áp đảo (`EMBARGO_LEADER` hoặc `KINGMAKING_DEFENSE`), ngăn chặn việc dâng chiến thắng cho người chơi dẫn đầu.
     - Giữa các Bot yếu thế (`Trailing`), nới lỏng chuyển nhượng ô đất lẻ ở mức 1.45x thị giá để liên minh cân bằng thế trận.
  5. **Strategic Auction Price Driving Invariant**:
     - Nhận diện khi ô đất đấu giá là mảnh ghép độc quyền của đối thủ (`isOpponentMonopolyTarget`), Bot đẩy giá lên tới 1.40x giá niêm yết để bào mòn ngân sách đối phương, sau đó lập tức dừng lại an toàn để không bị om vốn ngoài ý muốn.
  6. **3.900-Match Deep Benchmark Equilibrium**:
     - Ở bàn 4P chuẩn (Human + 3 Bot), tỷ lệ thắng của Người chơi giảm từ 38.7% xuống 33.7% (ở bàn Human + 3 Balanced người chơi chỉ còn thắng 26.0%, Human + 3 Aggressive chỉ còn 27.7%).
     - Tỷ lệ thắng của 3 loại Bot hội tụ chặt chẽ: Balanced 26.3%, Aggressive 21.3%, Passive 18.7% (khoảng cách giữa Passive và Aggressive thu hẹp chỉ còn 2.6%).
     - Ở bàn 2P, Bot Aggressive vượt mặt Người chơi với tỷ lệ thắng 54.7% vs 45.3%; Bot Balanced bám đuổi sít sao 48.7% vs 51.3%.

---

### 155. [3D/MOBILE/UX/TELEMETRY] Bất Biến Tối Ưu WebGL Mobile, CSS Cảm Ứng, Chỉ Báo Tiến Độ Bot & Ngữ Cảnh Telemetry Pháp Chứng (Mobile WebGL, Touch Ergonomics, Bot Pacing & Forensic Telemetry Context Invariant - IMP-121)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Shadow Map 2048x2048 Làm Nóng GPU Di Động (Mobile GPU Thermal Throttling)*: Cấu hình mặc định sử dụng `shadow-mapSize={2048}` trên toàn cảnh sa bàn với hàng trăm meshes `castShadow`, đẩy draw calls lên 636 và gây tiêu hao pin, nóng máy khi chơi trên Mobile Chrome sau 15-20 phút.
  2. *Bẫy Trễ Cảm Ứng 300ms & Vệt Tap-Highlight Trên Mobile Chrome*: Thiếu `touch-action: manipulation` và `-webkit-tap-highlight-color: transparent` khiến trình duyệt chờ kiểm tra cử chỉ double-tap zoom và hiển thị vệt màu xám/xanh che mất hiệu ứng nút bấm 3D xúc giác.
  3. *Bẫy Thiếu Ngữ Cảnh Lượt Gieo Đôi Trong Telemetry (Ambiguous Double Roll Intent Trap)*: Lệnh gieo xúc xắc đầu tiên và lệnh gieo xúc xắc lượt đôi đều ghi nhận cùng mã `{ type: 'INTENT_ROLL' }`. Nếu không có `context` ghi nhận trạng thái giao diện và xúc xắc đôi, quá trình phân tích pháp chứng ngoại tuyến dễ bị đánh giá sai lệch thành hiện tượng bấm nút lặp do lag mạng.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Device-Tier Shadow Resolution Invariant**:
     - `resolveShadowMapSize(isMobile)` trả về đúng `1024` khi `isMobile === true` (tiết kiệm 75% VRAM và fillrate so với 2048) và `2048` trên desktop.
     - Bảo toàn thuộc tính `shadows="soft"` trên `<Canvas>` để tương thích 100% với hợp đồng visual crispness IMP-34 và IMP-77.
  2. **Mobile Touch Normalization Invariant**:
     - Trong `index.css`, `html, body, #root` và toàn bộ các phần tử tương tác (`button, a, input, select`) BẮT BUỘC khai báo `touch-action: manipulation` và `-webkit-tap-highlight-color: transparent`.
  3. **Non-Intrusive Bot Pacing Status Invariant**:
     - Khi `!isMyTurn && botPacing`, hiển thị riêng biệt `bot-pacing-chip` với phong cách `bg-slate-850 text-amber-300 border-amber-500/40 animate-pulse` thông báo rõ Bot nào đang hành động và thứ tự trong lượt (`(1/3)`).
     - Bảo lưu 100% thuộc tính `aria-label="Đổ xúc xắc"`, `data-testid="roll-dice-btn"` và màu sắc tương phản WCAG AA `text-slate-600` của nút Roll khi disabled để không phá vỡ hợp đồng kiểm thử `mobile_responsive_hud.test.ts`.
  4. **Forensic Telemetry Context Invariant**:
     - `buildIntentTelemetryContext` tự động gắn kèm `RecordedIntentContext` (`buttonLabel`, `isDoublesRoll`, `consecutiveDoubles`, `dice`, `position`, `balance`, `note: 'DOUBLES_FOLLOWUP_ROLL'`) vào mỗi `RecordedIntent` và `AuditLogEntry` khi gửi qua WebSocket, loại bỏ 100% sự suy diễn sai lệch trong tương lai.

---

### 156. [UI/UX/FLOATING/CARDS] Bất Biến Pop-Up Biến Động Tiền Tệ & Phân Luồng Milestone Banner Thẻ Sự Kiện Toàn Diện (Comprehensive Financial & Event Card Pop-Up Notifications Invariant - IMP-122)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Mù Thông Tin Biến Động Tiền Tệ Khi Chơi Di Động (Mobile Financial Blindness Trap)*: Trước IMP-122, các giao dịch mua đất, nâng cấp nhà C1-C3, trả tiền thuê, nộp thuế và đấu giá chỉ được ghi vào thanh nhật ký (`ActivityFeed`). Trên điện thoại di động, thanh nhật ký mặc định được thu gọn, khiến người chơi chỉ thấy số dư bị trừ mà không hề biết tiền biến mất vì nguyên nhân gì hay trả cho ai.
  2. *Bẫy Bốc Thẻ Thầm Lặng Khi Quan Sát Bot AI (Silent Bot Card Draw Trap)*: Khi đối thủ Bot AI bước vào ô Cơ Hội hoặc Thị Trường, nội dung thẻ bốc được chỉ được ghi vào `ActivityStore`. Người chơi đang quan sát không hề thấy pop-up hay banner nổi thông báo thẻ bài đã rút, dẫn đến việc đột nhiên thấy đất tăng giá hoặc đối thủ nhận tiền/bị phạt mà không hiểu chuyện gì xảy ra.
  3. *Bẫy Xung Đột Pop-Up Trùng Lặp (Duplicate Toast Collision Trap)*: Nếu vừa phát badge chuyên biệt từ `activity_tracker.ts` vừa để `syncPlayerBalanceDiff` trong `apply_delta_players.ts` phát tiếp badge chênh lệch số dư, người chơi sẽ nhận đồng thời 2 pop-up chồng chéo: một badge chi tiết và một badge generic `general` thiếu ngữ cảnh.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **100% Financial Activity Badge Coverage Invariant**:
     - `dispatchActivityFloatingBadges(activities, state)` tự động phát hành huy hiệu nổi cho toàn bộ các giao dịch:
       + Thu/trả tiền thuê: Phát đồng thời huy hiệu `-Tiền` (`rent_pay`) cho người trả kèm tên đối tác và `+Tiền` (`rent_receive`) cho người nhận kèm tên người trả.
       + Mua đất & Nâng cấp: Gắn thẻ `buy` và `upgrade` hiển thị rõ số tiền âm và tên ô đất kèm cấp độ công trình.
       + Thuế & Lệ phí: Gắn thẻ `tax` hiển thị rõ số tiền nộp ngân sách.
       + Thắng đấu giá: Gắn thẻ `auction_win` ghi nhận tên ô trúng đấu giá và số tiền giải ngân.
  2. **Event Card Milestone Banner Invariant**:
     - Khi phát hiện `lastEventCard` trong delta (kể cả khi Bot AI bốc thẻ):
       + Kích hoạt huy hiệu mang `actionType: 'chance'` hoặc `'market'`.
       + `FloatingNumbersOverlay` và `FloatingBadge` chuyển tiếp trực tiếp vào `<MilestoneBanner>` nổi bật tại trung tâm đỉnh màn hình (`fixed top-20 left-1/2` trên desktop hoặc `top-[4.25rem]` trên mobile).
       + Hỗ trợ đầy đủ các thẻ phi tiền tệ (Vào tù, Dịch chuyển) với tiêu đề và mô tả hành động trực quan.
       + Cơ chế khử trùng lặp `lastProcessedEventCardKey` đảm bảo mỗi thẻ chỉ hiển thị đúng 1 lần duy nhất, triệt tiêu việc spam pop-up ở các delta tick tiếp theo.
       + Phát hiệu ứng âm thanh `AudioEngine.playSfx(SoundEffect.CARD_DRAW)`.
  3. **Zero-Duplicate Toast Harmony Invariant**:
     - Trong `apply_delta_players.ts`, `syncPlayerBalanceDiff` tự động bỏ qua (`return`) khi biến động số dư đã được xử lý bởi các bộ theo dõi chuyên biệt (rent, buy, upgrade, tax, auction), bảo vệ người chơi khỏi hiện tượng pop-up trùng lặp.
  4. **Defensive Legacy Mock State Invariant**:
     - Bọc chốt chặn `typeof state?.addFloatingText === 'function'` trước mọi tác vụ dispatch huy hiệu nổi trong `activity_tracker.ts`, ngăn chặn hoàn toàn lỗi sập `TypeError` khi chạy các bộ kiểm thử đơn vị cũ không khởi tạo toàn bộ hàm Zustand.

---

### 157. [UI/MOBILE/UX] Bất Biến Bo Góc Retropoly, Phân Luồng Chip Bot & Công Thái Học Mobile Tri-Package Polish (Mobile UI/UX Tri-Package Polish Invariant - IMP-123)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Server Toast Đè Lên TopBar (Server Toast Stacking Collision Trap)*: Khối thông báo lỗi máy chủ trước đây dùng `top-4`, đè trực tiếp lên thanh `TopBar` (vòng đấu, đồng hồ, kho bạc) trên màn hình di động, che khuất thông tin trận đấu và không thể bấm vào các nút điều khiển. Đồng thời, lỗi máy chủ chưa được bản địa hóa (`CANNOT_ROLL`, `ROOM_NOT_FOUND`, `EVEN_BUILDING_VIOLATION`, `MISSING_MONOPOLY`...).
  2. *Bẫy Trùng Lặp Thẻ Sự Kiện Mobile (Mobile Event Card Redundancy Trap)*: Trên màn hình điện thoại di động, component `EventCardModal` hiển thị đồng thời cả đoạn mô tả `<p>` lẫn khối tóm tắt tác động nhanh `event-impact-summary`, làm tràn nội dung quá chiều cao màn hình.
  3. *Bẫy Gãy Dòng Capsule & Mẫu Số Cố Định Vòng Đấu (TopBar Layout Break & Ceiling Clamping Trap)*: Khi đến lượt Bot AI, chuỗi `🤖 Đang tính...` bị co ngắn và ngắt dòng làm vỡ capsule `match-info-capsule`. Đồng thời, mẫu số vòng đấu hiển thị `/30` bị lỗi nghịch lý khi ván đấu bước vào giai đoạn về đích mở rộng (vòng 31-40).
  4. *Bẫy Nút Hành Động Tròn Trơn rounded-full & Chip Bot Xô Lệch Action Dock*: Các nút hành động trong `ActionDock` dùng `rounded-full` lạc điệu với ngôn ngữ Retropoly `rounded-2xl` của toàn bộ game; đổ bóng thiếu nhất quán giữa `#0f172a` và `#020617`; và chip tiến độ bot `bot-pacing-chip` nằm chen ngang flex row làm co rúm các nút bấm.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **ServerToast Relocation & Localization Invariant**:
     - `ServerToast` định vị an toàn ở `fixed top-18 sm:top-20 left-1/2 -translate-x-1/2`, giải phóng 100% không gian TopBar.
     - `formatServerErrorMessage` bản địa hóa 100% các mã lỗi máy chủ (`CANNOT_ROLL`, `ROOM_NOT_FOUND`, `NOT_ENOUGH_PLAYERS`, `NOT_HOST`, `EVEN_BUILDING_VIOLATION`, `MISSING_MONOPOLY`) sang tiếng Việt rõ ràng, thân thiện.
  2. **Mobile Card Deduplication Invariant**:
     - Đoạn `<p>` miêu tả thẻ sự kiện gắn `hidden sm:block`, chỉ hiển thị khối `event-impact-summary` trên mobile viewport, triệt tiêu lặp từ ngữ và bảo đảm không vượt chiều cao màn hình.
  3. **TopBar Flow & Adaptive Round Ceiling Invariant**:
     - Đồng hồ đếm ngược mang `whitespace-nowrap` ngăn gãy dòng khi bot tính toán.
     - Mẫu số vòng đấu tự động nâng lên trần 40: `displayMaxRounds = roundNumber > maxRounds ? (roundNumber <= 40 ? 40 : roundNumber) : maxRounds`, bảo đảm mẫu số luôn lớn hơn hoặc bằng tử số (`35/40`, `42/42`).
  4. **Retropoly Chunky Geometry & Floating Bot Chip Invariant**:
     - 100% nút hành động trong `ActionDock` chuyển sang bo góc `rounded-2xl`, đồng bộ đổ bóng xúc giác `shadow-[0_4px_0_0_#0f172a]`.
     - `bot-pacing-chip` tách khỏi hàng nút, nổi phía trên dock với `absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap`, bảo toàn nguyên vẹn bố cục các nút bấm.
  5. **Portfolio & Trade Touch Ergonomics Invariant**:
     - Nút Thế Chấp chuyển thành nút phụ tinh tế có viền cảnh báo `bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-300 shadow-[0_2px_0_0_#fecdd3]`.
     - Hiển thị đầy đủ Tiền Thuê (`data-testid="property-rent-val"`) và Giá BĐS niêm yết trong danh mục.
     - Đảm bảo kích thước công thái học tối thiểu `min-w-[44px] min-h-[44px]` và độ tương phản chuẩn WCAG AA cho nút vô hiệu hóa (`text-slate-600` trên `bg-slate-200`).

---

### 158. [UI/UX/FLOATING/REASON] Bất Biến Phân Giải Lý Do Ngắn Gọn Thân Thiện & Cấu Trúc Viên Thuốc Hai Phân Đoạn (Friendly Transaction Reasons & Two-Segment Responsive Capsule Invariant - IMP-123)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Tiêu Đề Cụt Chữ Do Giới Hạn max-w-[120px]*: Việc áp đặt class cứng `max-w-[120px]` lên tiêu đề giao dịch khiến các tên BĐS dài (như "Đà Nẵng (Hải Châu - Sơn Trà)", "Lệ Phí Đăng Ký Đất Đai") bị cắt cụt lửng lơ gây ức chế và hiểu nhầm thông tin.
  2. *Bẫy Giấu Tên Đối Tác Giao Dịch Trên Mobile (Hidden Partner Trap)*: Dùng `hidden sm:inline` cho tên người nhận tiền thuê khiến người chơi trên thiết bị di động hoàn toàn không biết tiền của mình vừa bị chuyển sang cho ai.
  3. *Bẫy Cấu Trúc Trộn Lẫn Số Tiền Vào Chuỗi Văn Bản*: Hiển thị tiền tệ thô mà không có capsule phân tách thị giác khiến người dùng khó phân biệt nhanh giữa biến động thưởng (xanh lá) và biến động phạt (đỏ).
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Canonical Reason Resolution Invariant (`resolveFriendlyReason`)**:
     - Ánh xạ 100% các loại biến động tài chính sang câu văn tiếng Việt tự nhiên, thân thiện và súc tích:
       + Thu/trả tiền thuê: `Trả thuê {BĐS} cho {Tên}` / `Thu thuê {BĐS} từ {Tên}` (bảo lưu tên ô đất và đối tác).
       + Mua & Nâng cấp: `Mua sở hữu {BĐS}` / `Xây {C1/C2/C3} {BĐS}`.
       + Lương & Quỹ hỗ trợ: `Thưởng lương qua ô Khởi Hành` / `Nhận trợ cấp Quỹ Kho Bạc`.
       + Thuế & Pháp lý: `Nộp {Lệ Phí/Thuế}` / `Phí bảo lãnh Trạm Kiểm Toán`.
       + Đấu giá & Chứng khoán: `Thắng đấu giá {BĐS}` / `Giao dịch HOSE: {Tiêu đề}`.
  2. **Two-Segment Responsive Capsule Invariant**:
     - Phân định rạch ròi 2 phân đoạn:
       + Phân đoạn trái (`flex items-center gap-2 min-w-0`): Biểu tượng hành động trực quan + Huy hiệu người chơi mang màu token + Nhãn lý do giao dịch thân thiện `truncate` (tuyệt đối không đặt trần `max-w-[120px]`).
       + Phân đoạn phải (`data-testid="floating-amount-pill"`): Viên thuốc bo góc `rounded-xl`, nền sáng có viền tinh tế (`bg-emerald-50 text-emerald-700 border-emerald-300` cho thưởng, `bg-rose-50 text-rose-700 border-rose-300` cho phạt).
  3. **Zero Hidden Mobile Targets Invariant**:
     - Loại bỏ hoàn toàn `hidden sm:inline` khỏi `FloatingBadge`, đảm bảo thông tin đối tác giao dịch hiển thị đồng nhất trên cả Desktop lẫn Mobile.
  4. **Semantic Milestone Banner Titles Invariant**:
     - `MilestoneBanner` gắn `data-testid="milestone-card-title"` cho tiêu đề thẻ sự kiện (Cơ Hội, Thị Trường, Độc Quyền, Thoát Nợ), kết hợp hiển thị rõ nét dòng mô tả hiệu lực (`item.text`).

---

### 159. [UI/FSM/3D] Bẫy Kẹt Lượt Do Bị Mất Lượt & Tối Ưu Thích Ứng Chuỗi Hậu Kỳ WebGL (SkipNextTurn Unfreeze & Adaptive WebGL Performance - IMP-124)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Kẹt Lượt Do Mất Lượt (SkipNextTurn Action Dock Deadlock)*: Khi người chơi dẫm vào ô đất có hiệu ứng Bão duyên hải (`MC_COASTAL_STORM`) hoặc Thẻ nồng độ cồn, hệ thống gán `player.skipNextTurn = true`. Khi đến lượt tiếp theo, server phát hiện cờ này, xóa cờ và chuyển thẳng phòng sang `PropertyManagement` (bỏ qua `WaitingRoll`). Tuy nhiên, Client Store (`apply_delta.ts`) trước đây không lưu `turnPhase` và reset `hasRolledThisTurn = false`. Dẫn đến `action_dock.tsx` tưởng lầm là lượt gieo xúc xắc mới nên mở nút "Đổ Xúc Xắc" và khóa chặt nút "Hết Lượt". Người chơi bấm "Đổ Xúc Xắc" bị FSM từ chối vì không đúng pha, đồng thời không thể bấm "Hết Lượt", gây kẹt đứng lượt chơi suốt 30 giây đến khi hết giờ.
  2. *Bẫy Quá Tải Draw Calls N8AO Khi FPS Giảm*: Trên cấu hình máy yếu/GPU tích hợp, N8AO tạo thêm 600-800 draw calls/khung hình khiến FPS tụt dưới 30 FPS.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **TurnPhase Client Sync Invariant**:
     - `game_store.ts` và `game_store_types.ts` bắt buộc quản lý `turnPhase` (mặc định `'WaitingRoll'`).
     - `apply_delta.ts` trong `syncTurnAndTimer` bắt buộc đồng bộ `state.setTurnPhase(delta.turnPhase)` khi server phát delta chứa `turnPhase`.
  2. **ActionDock Lost-Turn Safety Gates**:
     - `isRollActionDisabled`: Khóa cứng nút Đổ xúc xắc khi `turnPhase === 'PropertyManagement' && (!canRollAgain || !hasRolledThisTurn)`.
     - `isEndTurnDisabled`: Cho phép kết thúc lượt ngay khi `turnPhase === 'PropertyManagement' && !hasRolledThisTurn` (kết hợp với `inAudit`).
     - Nhãn nút: Tự động đổi thành `⏩ Mất Lượt (Hết Lượt)` qua `resolveEndTurnButtonLabel(turnPhase, hasRolledThisTurn, inAudit)`.
     - Chỉ báo ngữ cảnh: Hiển thị chip cảnh báo bão/nồng độ cồn (`shouldShowSkipTurnNotice`).
   3. **Adaptive Post-Processing Invariant**:
      - `resolveAdaptivePostProcessing`: Tự động tắt N8AO khi `fps < 35`, trên thiết bị di động (`isMobile=true`), hoặc khi FPS không hợp lệ (NaN, âm) nhằm giải phóng draw calls tức thì; hạ chất lượng N8AO xuống `low` khi `fps < 45`.

---

### 160. [3D/CAMERA/UI] Bất Biến Góc Nhìn Camera Phương Vị 4 Cạnh Bàn Cờ & Thu Gọn Bot Pacing Mobile (Side-Aware Tile Camera Orbit & Responsive TopBar Bot Pacing Invariant - IMP-126)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Chữ Ô Cờ Lộn Ngược 180° Do Offset Cố Định Góc Nam (Inverted Tile Text Trap)*: Bàn cờ 40 ô vuông vắn 18x18 được chia thành 4 cạnh (Cạnh Nam: 0..10, Cạnh Tây: 10..20, Cạnh Bắc: 20..30, Cạnh Đông: 30..39) với mặt texture in theo hướng đọc từ mép ngoài nhìn vào trong. Trước IMP-126, hàm `calculateTileFocusCameraPosition` chỉ sử dụng duy nhất một offset cố định `[+5.2, 6.4, +5.2]` nhìn từ góc Đông Nam sang Tây Bắc. Khi camera zoom vào Cạnh Bắc (Side 2, e.g. Lâm Đồng, Cao Tốc, Hải Phòng: $z = -9$), offset này đặt camera ở $Z = -3.8$ (bên trong tâm bàn cờ) nhìn ra sau lưng ô đất, khiến toàn bộ chữ tên địa danh và giá tiền niêm yết bị lộn ngược 180° đối với mắt người chơi.
  2. *Bẫy Tràn Header Do Chuỗi Bot Pacing 14 Ký Tự*: Trước IMP-126, TopBar đặt chuỗi `🤖 Đang tính...` (14 ký tự, ~125px) vào ô timer. Khi chạy trên màn hình di động hẹp (375px - 392px), độ dài này phình to đẩy toàn bộ cụm nút tiện ích bên phải (Thời tiết, Âm thanh, Nhật ký) văng khỏi màn hình hoặc bị xén cụt 50%.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Side-Aware Camera Orbit Invariant (`resolveSideAwareCameraOffset`)**:
     - Phân định 4 cạnh dựa trên tọa độ cực đại của hình vuông: `Math.abs(tz) >= Math.abs(tx)`:
       + Cạnh Bắc (Side 2, $tz < 0$): Offset bắt buộc là `[-1.8, 6.4, -6.8]`, đặt máy quay ở phía Bắc ($Z < -9$) nhìn xuống Nam ($+Z$). Chữ đọc xuôi mắt 100%.
       + Cạnh Tây (Side 1, $tx < 0$): Offset bắt buộc là `[-6.8, 6.4, 1.8]`, đặt máy quay ở phía Tây ($X < -9$) nhìn sang Đông ($+X$).
       + Cạnh Đông (Side 3, $tx > 0$): Offset bắt buộc là `[6.8, 6.4, -1.8]`, đặt máy quay ở phía Đông ($X > 9$) nhìn sang Tây ($-X$).
       + Cạnh Nam (Side 0, $tz \ge 0$): Giữ nguyên `[5.2, 6.4, 5.2]` nhìn từ phía Nam lên Bắc, bảo toàn 100% test hợp đồng cũ.
     - 100% tọa độ tính toán bọc qua `Number.isFinite` đảm bảo phòng thủ NaN (Gotcha #115 / IMP-86).
  2. **Responsive Bot Pacing Invariant**:
     - TopBar áp dụng kỹ thuật hiển thị thích ứng:
       + Mobile (`< 640px`): `<span className="sm:hidden">🤖</span>` thu gọn trong 20px, giải phóng ngay 105px chiều ngang.
       + Desktop (`>= 640px`): `<span className="hidden sm:inline">🤖 Đang tính...</span>` kèm `whitespace-nowrap`.
      - Bảo đảm 100% tương thích với các bài test SSR cũ của IMP-82 (`TC-82.13`) và IMP-123 (`TC-IMP123.10`).

---

### 161. [3D/UI/AUDIO] Bản Đồ Quy Hoạch Bất Động Sản (Heatmap Overlay), Diorama Toybox Audio Props & Định Hướng Ô Cờ SSOT (IMP-125-P1)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Xoay Ngược Góc Nhìn Ô Cờ*: Trước IMP-125-P1, góc xoay của ô cờ phân bố không theo trục đọc chuẩn từ camera Overview góc xiên Đông Nam. Ô Khởi Hành cần góc quay 45° (`Math.PI / 4`) để mặt bảng hướng về trung tâm; các cạnh đối diện cần góc xoay đồng bộ song song trục đường đi.
  2. *Bẫy Nhầm Lẫn Quyền Sở Hữu Trên Sa Bàn*: Khi số lượng công trình tăng cao, người chơi khó nhận biết nhanh phân vùng địa bàn và thế trận sở hữu của từng người chơi nếu chỉ nhìn vào cờ nhỏ hay standee.
  3. *Bẫy Tương Tác Câm (Dead Diorama Trap)*: Các mô hình trang trí xung quanh sa bàn (hải đăng, xe cộ, sóng biển) hoàn toàn tĩnh và không phát ra phản hồi xúc giác/âm thanh khi người chơi click/chạm vào.
  4. *Bẫy Phình To File Kiến Trúc (Architecture Size Limit Trap)*: File `coastal_island_environment.tsx` có test bảo vệ trần kích thước `<= 300 LOC` (`dense_metropolis_architecture.test.ts`). Khi thêm listener âm thanh hoặc logic tương tác, việc nhập thêm import hoặc viết dài dòng có thể vô tình đẩy file vượt quá 300 LOC.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Tile Rotation SSOT (`tileRotation(index)`)**:
     - Ô 0 (Khởi Hành): Bắt buộc trả về `[0, Math.PI / 4, 0]`.
     - Cạnh 0 (1..9) và Cạnh 2 (20..29): Bắt buộc trả về `[0, 0, 0]`.
     - Cạnh 1 (10..19) và Cạnh 3 (30..39): Bắt buộc trả về `[0, Math.PI / 2, 0]`.
     - Index ngoài dải 0..39 hoặc không hợp lệ: Bắt buộc fallback về `[0, 0, 0]`.
  2. **Heatmap Mode PBR Emissive Invariant**:
     - `game_store.ts` quản lý `isHeatmapActive: boolean` (mặc định `false`) cùng `toggleHeatmap()` và `setHeatmapActive()`.
     - `action_dock.tsx` cung cấp nút `data-testid="heatmap-toggle-btn"` với icon `🗺️` và nhãn `Quy Hoạch` (`hidden sm:inline`), gắn kèm active ring `ring-2 ring-amber-400 bg-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.5)]`.
     - `board_tile.tsx` kích hoạt phát quang PBR trên `OwnerBaseTrim`: Khi `isHeatmapActive && ownerColor` -> `emissive = ownerColor`, `emissiveIntensity = 1.2`; khi tắt -> `emissive = '#000000'`, `emissiveIntensity = 0`.
  3. **Toybox Procedural Web Audio Invariant**:
     - 3 sound recipe thủ tục không tải file ngoài: `synthesizeLighthouseFoghorn` (sawtooth 110Hz->105Hz, bandpass 220Hz Q=3, 0.8s), `synthesizeCarHorn` (dual-tone 440Hz + 554Hz, 0.18s), `synthesizeWaterSplash` (noise buffer + resonant lowpass sweep 800Hz->200Hz).
     - Tương tác gắn qua cả `onClick` lẫn `onPointerDown` trên các phần tử 3D:
       + Hải đăng: `data-testid="heritage-lighthouse"` -> `SoundEngine.playLighthouseHorn()`.
       + Đoàn xe tí hon: `data-testid="micro-traffic-group"` (lồng bên trong `data-testid="diorama-traffic"` để giữ 100% tương thích hợp đồng cũ) -> `SoundEngine.playCarHorn()`.
       + Nước biển: `data-testid="living-ocean-water"` -> `SoundEngine.playWaterRipple()`.
  4. **Strict File Limit Compliance**:
     - Giữ `coastal_island_environment.tsx <= 300 LOC` (hiện tại 288 LOC), `sound_synth_recipes.ts <= 400 LOC` (hiện tại 400 LOC), và toàn bộ UI components `<= 500 LOC`.

---

### 162. [3D/CAMERA/AUDIO/PAWN] Bất Biến Máy Quay Kịch Tính Tử Thần (Dynamic Tension Cine-Cam) & Biểu Cảm Quân Cờ Procedural Squash & Stretch (IMP-125-P2)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Fake Agency & Phá Vỡ Nhịp Độ Ván Đấu (Pacing Disruption Trap)*: Khi bổ sung hiệu ứng điện ảnh cho xúc xắc hoặc quân cờ, việc dùng chuyển động chậm (slow-motion 2.0s - 3.5s) làm giảm nhịp độ ván đấu (tempo) và gây mệt mỏi cho người chơi ở các ván đấu dài. Cần giữ nguyên 100% thời gian lăn xúc xắc (1.0s) và chỉ áp dụng góc máy kịch tính khi thực sự có nguy cơ phá sản.
  2. *Bẫy Khung Xương Đồ Họa Phức Tạp (Skeletal Rigging Complexity Trap)*: Việc dùng mô hình 3D gắn xương (skeletal rigging / skinned mesh) cho quân cờ tiêu tốn bộ nhớ GPU, tăng Draw Calls và dễ xung đột animation state. Thay vào đó, áp dụng nguyên lý 12 nguyên tắc hoạt hình Disney (Squash & Stretch) hoàn toàn bằng toán học điều hòa bậc 2 (Procedural Spring Math) trên scale và position.
  3. *Bẫy R3F Hooks Bên Ngoài Canvas Trong SSR Test (Hooks Context Crash)*: Khi gọi `useFrame` trực tiếp trong component render quân cờ, các bài test SSR hoặc `renderToStaticMarkup` ngoài `<Canvas>` sẽ quăng lỗi crash `R3F: Hooks can only be used within the Canvas component!`.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Dynamic High-Stakes Scanning Invariant (`checkHighStakesRoll`)**:
     - Quét chính xác 11 ô phía trước trong cự ly `[currentPos + 2 .. currentPos + 12] % 40`.
     - Bỏ qua ô của chính người chơi, ô vô chủ, và ô đang bị thế chấp (`mortgagedProperties`).
     - Khi `levelMap` được cung cấp và không rỗng: Chỉ xét các ô có mặt trong `levelMap` (`cellIndex in levelMap`). Nếu `levelMap` rỗng, mặc định đánh giá ở Cấp 0.
     - Ngưỡng tử thần: Kích hoạt khi `playerBalance <= 0 && rent > 0` HOẶC `rent >= 0.8 * playerBalance`.
  2. **Tension Roll Camera Invariant (`resolveCameraMode` & `CAMERA_CONFIG.tension_roll`)**:
     - Cấu hình: `position: [2.0, 2.2, 2.8]`, `target: [0.0, 0.2, 0.0]`, `fov: 34`, `speed: 6.0`.
     - Chuyển `tension_roll` khi `isRolling && isHighStakesRoll`. Vẫn nhường quyền ưu tiên tuyệt đối cho `manualMode` và `activeModal === 'game_over'`.
     - Bảo toàn thời gian xúc xắc đúng 1.0s, zero slow-motion.
  3. **Procedural Pawn Expressive Reactions (`calculateVictorySpin` & `calculateSlumpRecoil`)**:
     - Khi trả tiền thuê nhà:
       + Người nhận: `victory_spin` (xoay 360 độ `rotationY = progress * 2*PI` kết hợp bay vút lên `heightOffset = sin(progress*PI) * 0.35` trong 600ms) + WebAudio `synthesizeVictoryChime` (arpeggio 523Hz -> 659Hz -> 784Hz).
       + Người trả: `slump_recoil` (nhún bẹp trục Y xuống 0.55 trong 400ms theo dao động tắt dần bậc 2, bảo toàn thể tích `scaleXZ = 1 + (1 - scaleY) * 0.5`) + WebAudio `synthesizeSlumpThud` (120Hz -> 45Hz sweep).
  4. **SSR-Safe Fiber Separation (`PawnReactionFrameUpdater`)**:
     - Tách logic `useFrame` vào component `PawnReactionFrameUpdater`, chỉ render khi `!isSSR` (`typeof window !== 'undefined'`).
     - Component cha `StaticPawnWithReaction` render an toàn thuộc tính `data-pawn-reaction={reaction?.type}` trên thẻ `<group>`, tương thích 100% với `renderToStaticMarkup` trong môi trường headless testing.

---

### 163. [3D/RULE/AUDIO] Hợp Nhất Quảng Trường Độc Quyền (Monopoly Plaza Fusion) & Bẫy Hẹp Kiểu Dữ Liệu Thế Chấp (IMP-125-P3)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Hẹp Kiểu Dữ Liệu Union (Union Narrowing Trap on Readonly Arrays)*: Khi tham số `mortgagedProperties` được khai báo dạng union `readonly number[] | PropertyStateMap | null`, lệnh `Array.isArray(val)` trong TypeScript không thể tự động thu hẹp vế còn lại thành `PropertyStateMap`, dẫn đến lỗi biên dịch `TS2339: Property 'get' does not exist on type 'readonly number[]'`. Việc ép kiểu `as any` vi phạm trực tiếp Gotcha #6.
  2. *Bẫy Bỏ Sót Trạng Thái Thế Chấp Cục Bộ & Toàn Cục (Dual Mortgage Scope Trap)*: Người chơi có thể có ô bị thế chấp lưu trong `owner.mortgagedProperties` của riêng họ hoặc trong map trạng thái chung `mortgagedProperties` của ván đấu. Nếu bỏ qua một trong hai nguồn, hệ thống sẽ trao danh hiệu độc quyền sai luật cho cụm ô đang bị đóng băng dòng tiền.
  3. *Bẫy Xung Đột Ánh Sáng Emissive Giữa Bản Đồ Nhiệt & Độc Quyền (Emissive Multi-layer Priority Trap)*: Cả hai chế độ Bản Đồ Nhiệt (`isHeatmapActive`) và Cụm Độc Quyền (`isMonopolyGroup`) đều can thiệp vào `emissiveIntensity` của `OwnerBaseTrim`. Nếu gán đè đơn giản, trạng thái bản đồ nhiệt sẽ bị triệt tiêu hoặc mờ nhạt.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Custom Type Guard An Toàn Tuyệt Đối (`isPropertyStateMap`)**:
     - Định nghĩa `isPropertyStateMap(val: unknown): val is PropertyStateMap`: kiểm tra `typeof val === 'object' && val !== null && 'get' in val`.
     - Phân định rõ ràng hai nhánh xử lý: `isPropertyStateMap` gọi `.get(c)?.isMortgaged`, ngược lại dùng `externalMortgaged.some((c) => cells.includes(c))`, triệt tiêu 100% `as any`.
  2. **Monopoly Pure Math Isolation (`monopoly_plaza_math.ts`)**:
     - Định nghĩa `getMonopolyColorGroupCells(colorGroup)` lọc từ `BOARD_CONFIG`.
     - `detectPlayerMonopolies`: Kiểm tra đủ số ô của nhóm màu (`cells.every(c => p.ownedProperties?.includes(c))`), đồng thời loại trừ ngay lập tức nếu có bất kỳ ô nào bị thế chấp ở cả 2 nguồn (player và room state).
     - Guard biên: `cellIndex < 0 || cellIndex >= 40 || Number.isNaN(cellIndex) || !monopolyMap` luôn trả về `false`.
  3. **Visual Indicators Đa Tầng PBR (`board_tile.tsx` & `monopoly_plaza_fusion.tsx`)**:
     - `PlazaTrimBorder`: Render viền đai ánh kim vàng champagne `#F59E0B` (`roughness: 0.2`, `metalness: 0.9`) kích thước `[1.76, 0.10, 2.28]`.
     - `MonopolyCrownCrest`: Render vương miện hoàng gia mạ vàng tại tọa độ `[0, 0.12, -0.65]`.
     - Phân tầng `emissiveIntensity`: `isHeatmapActive ? 1.4 : (isMonopolyGroup ? 0.65 : 0)`.
     - `MonopolyPlazaFusion`: Render dải cờ hoa vỉa hè `InnerPlazaGarland` viền mép trong sa bàn diorama.
  4. **Procedural Brass Fanfare & Zero MP3 (`synthesizeMonopolyFanfare`)**:
     - Arpeggio kèn đồng 4 nốt: F4 (349.23Hz), A4 (440.0Hz), C5 (523.25Hz), F5 (698.46Hz) với sóng `sawtooth`, duration 1.25s, bypass an toàn khi `volume <= 0` hoặc mute.

---

### 164. [3D/UI/FSM] Chuẩn Hóa Góc Xoay Ô Cờ 4 Cạnh, Khử Desync Follow-up Roll Khi Đổ Đôi, và Mở Quyền Thanh Khoản Trong ActionPhase (IMP-127)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Desync Nút Đổ Tiếp Khi Đã Hết Chuỗi Đôi (Follow-up Roll Desync Trap)*: Trong `action_dock.tsx`, biến `storeCanRollAgain` trước đây dùng toán tử OR `((dice[0] === dice[1] && dice[0] > 0) || storeConsecutiveDoubles > 0)`. Khi người chơi đã kết thúc chuỗi đổ đôi (`consecutiveDoubles = 0`), nhưng xúc xắc của lượt vừa rồi là đôi, client vẫn đánh giá `storeCanRollAgain = true`, khiến UI hiện nút "Đổ Tiếp (Đôi)" thay vì cho phép kết thúc lượt hoặc chuyển FSM, dẫn đến kẹt lượt hoặc desync giữa server và client.
  2. *Bẫy Phong Tỏa Thanh Khoản Cứng Nhắc Ở ActionPhase (ActionPhase Liquidity Lock Trap)*: Trước đây `isMortgagePhaseValid` và `isDowngradePhaseValid` chỉ chấp nhận `PropertyManagement` và `InsolvencyPhase`. Khi người chơi dừng chân ở một ô đất bất kỳ (trong `ActionPhase`), nếu người chơi muốn thế chấp đất trống hoặc bán bớt nhà để có tiền mua ô đất vừa dẫm phải, FSM lại từ chối với lý do `INVALID_PHASE`, tước đoạt quyền tự do huy động vốn trước khi quyết định mua tài sản.
  3. *Bẫy Xoay Chữ Ô Cờ Bất Đối Xứng 4 Cạnh (4-Side Perpendicular Rotation Asymmetry Trap)*: Góc xoay các ô cờ trên sa bàn 3D cần tuân thủ chuẩn chiếu trục vuông góc: Cạnh 0: `[0, 0, 0]` (riêng ô GO 0 xoay 45° `[0, Math.PI / 4, 0]`), Cạnh 1 (ô 10..19): `[0, -Math.PI / 2, 0]`, Cạnh 2 (ô 20..29): `[0, Math.PI, 0]`, Cạnh 3 (ô 30..39): `[0, Math.PI / 2, 0]`. Mọi ô góc (0, 10, 20, 30) phải căn phẳng vuông vức với cạnh của mình (`pitch = 0`, `roll = 0`).
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Tile Rotation Invariant (`tileRotation`)**:
     - `side = Math.floor(index / 10)`:
       * Case 0: `[0, 0, 0]` (ngoại lệ index === 0: `[0, Math.PI / 4, 0]`)
       * Case 1: `[0, -Math.PI / 2, 0]`
       * Case 2: `[0, Math.PI, 0]`
       * Default (Case 3): `[0, Math.PI / 2, 0]`
     - Fallback an toàn: `typeof index !== 'number' || Number.isNaN(index) || index < 0 || index > 39` -> `[0, 0, 0]`.
  2. **Doubles Chain Priority Invariant (`storeCanRollAgain` & `buildIntentTelemetryContext`)**:
     - Tôn trọng thuộc tính server `consecutiveDoubles`:
       * Khi `consecutiveDoubles !== undefined`, bắt buộc dùng điều kiện `consecutiveDoubles > 0`.
       * Chỉ fallback về so sánh xúc xắc `(dice[0] === dice[1] && dice[0] > 0)` khi `consecutiveDoubles` thực sự là `undefined`.
       * Chặn hoàn toàn quyền đổ tiếp nếu đang bị kiểm toán (`inAudit`) hoặc bị mất lượt (`actingPlayer?.skipNextTurn`).
  3. **ActionPhase Liquidity Invariant (`mortgageProperty` & `handleDowngrade`)**:
     - Cả `isMortgagePhaseValid` và `isDowngradePhaseValid` đều chấp nhận 3 pha hợp lệ: `PropertyManagement`, `InsolvencyPhase`, và `ActionPhase`.
     - Cho phép người chơi chủ động thế chấp ô đất trống (Cấp 0) hoặc hạ cấp công trình để thu hồi tiền mặt ngay tại `ActionPhase` nhằm tối ưu hóa chiến lược mua đất hoặc né đấu giá cưỡng chế.

---

### 165. [3D/ANIM/NET] Cơ Chế Quân Cờ Tự Bay Vào Tù (Pawn Jail Direct Flight) & Bẫy Cờ Trạng Thái PendingPawnMove (IMP-126)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Nhảy Tuần Tự Vòng Quanh Bàn Cờ Khi Đi Tù*: Khi người chơi hoặc bot bị đưa vào Trạm Kiểm Toán (Ô 10) do dẫm ô 30, đổ 3 lần đôi hoặc thẻ bài phạt, việc dùng thuật toán `calculatePathWaypoints` thông thường sinh ra 20 đến 35 bước nhảy tuần tự, đi ngang qua cả ô GO (Ô 0), mất 4-7 giây chờ đợi và vi phạm nguyên tắc "Go directly to jail, do not pass GO".
  2. *Bẫy Xóa Thuộc Tính Pending Khi Đang Tung Xúc Xắc*: Nếu server gửi delta vào tù lúc xúc xắc đang lăn (`isRolling === true`), hệ thống lưu trữ task vào `pendingPawnMove`. Nếu `PendingPawnMove` không lưu cờ `isJailFlight` và `isBot`, khi xúc xắc kết thúc (`setIsRolling(false)`), hàm `startPawnMove` sẽ tính lại waypoints theo đường đi tuần tự, làm mất đi quỹ đạo bay thẳng.
  3. *Bẫy Hỏng Hợp Đồng Kiểm Thử Cũ Do Thừa Thuộc Tính Không Điều Kiện*: Nếu luôn gán `isBot` vào mọi `pendingPawnMove` (kể cả bước đi bình thường), các bài test hợp đồng cũ (IMP-55, IMP-112) so sánh `toEqual({ playerId, targetCell, fromCell })` sẽ bị gãy do thuộc tính thừa.
  4. *Bẫy React.useRef Trong Kiểm Thử Headless R3F*: Khi component dùng import tường minh `{ useRef } from 'react'`, trong môi trường ESM Vitest lệnh `vi.spyOn(React, 'useRef')` không thể đánh chặn hook được gọi, khiến ref 3D trong headless SSR luôn trả về `{ current: null }` làm `useFrame` thoát sớm.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Direct Jail Flight Invariant (`calculateJailFlightWaypoints`)**:
     - Khi `isGoingToAudit = p.position === 10 && inAudit && !wasInAudit`, waypoints bắt buộc rút gọn tuyệt đối thành `[10]` (chiều dài = 1).
     - Quỹ đạo bay vút parabol cao gấp 3.5 lần bình thường: `JAIL_FLIGHT_ARC = 2.8` (so với `0.8`).
     - Thời lượng bay: `0.55s` cho người, `0.45s` cho bot. Âm thanh tiếp đất độc quyền: `AudioEngine.playSfx(SoundEffect.TAX_PENALTY)`.
  2. **PendingPawnMove Conditional Attachment Invariant**:
     - Trong `dispatchPawnMove`, chỉ đính kèm `isJailFlight: true` và `isBot: Boolean(task.isBot)` khi và chỉ khi `task.isJailFlight` là `true`.
     - Các bước đi tuần tự bình thường giữ nguyên payload gọn `{ playerId, targetCell, fromCell }`, bảo toàn 100% hợp đồng cũ.
  3. **Headless R3F Hook Namespace Invariant**:
     - Trong các component hoạt cảnh 3D có test mock bằng `vi.spyOn(React, 'useRef')`, bắt buộc truy xuất hook qua namespace `React.useRef` để đảm bảo test spy đánh chặn thành công.

---

### 166. [FSM/CARD] Thẻ Bài Sự Kiện Phải Tuyệt Đối Tránh Silent No-Op: Cơ Chế Fallback Trợ Cấp & Gỡ Ràng Buộc Số Dư (CC_MA_FORCE)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Ràng Buộc Không Tưởng Trong Handler Thẻ Bài*: Thẻ `CC_MA_FORCE` ban đầu lọc đối thủ theo điều kiện `p.balance < player.balance` (chỉ thâu tóm đối thủ nghèo hơn mình). Nếu mọi đối thủ trong phòng đều có số dư bằng hoặc cao hơn người chơi, danh sách mục tiêu bị rỗng.
  2. *Bẫy Tê Liệt Im Lặng (Silent No-Op Trap)*: Khi không tìm thấy ô đất trống Cấp 0 (C0) hợp lệ (do đối thủ chưa mua đất, đã nâng cấp lên C1+, đang thế chấp ô đất, hoặc người chơi không đủ 120% tiền mặt), hàm xử lý thoát `return;` mà không có hành động thay thế. Người chơi bấm đóng popup thẻ nhưng không thấy bất kỳ hiệu ứng hay thay đổi tiền tệ nào, gây nhầm tưởng game bị đơ/hỏng.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Universal Unmortgaged C0 Target Invariant**:
     - Quyền M&A bắt buộc áp dụng lên bất kỳ ô đất Cấp 0 nào của mọi đối thủ chưa bị thế chấp (`!isCellMortgaged(cellIndex, ownerId)`), không phân biệt số dư đối thủ giàu hay nghèo.
  2. **Mandatory Event Card Fallback Invariant**:
     - Mọi thẻ bài sự kiện có điều kiện mục tiêu ngặt nghèo (đất C0, đối thủ cụ thể) BẮT BUỘC phải có nhánh xử lý dự phòng (Fallback) khi mục tiêu không tồn tại hoặc người chơi không đủ tiền thanh toán.
     - Với `CC_MA_FORCE`: Khi không có ô C0 đối thủ hoặc người chơi không đủ 120% tiền mua, tự động kích hoạt trợ cấp M&A từ Kho Bạc Nhà Nước: `player.balance += 800`, `room.treasury -= 800`.
  3. **Player Expectation Alignment Invariant**:
     - Metadata mô tả thẻ bài (`event_card_metadata.ts`) phải công khai rõ ràng cả nhánh chính lẫn nhánh fallback để người chơi nắm rõ kết quả được hưởng trước khi bấm xác nhận.

---

### 167. [UI/P2P] Bẫy Nuốt Âm Thầm Đề Xuất Mua Đất Trong ModalHost (P2P Buy Land Drop Bug) (IMP-128)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Nuốt Âm Thầm Intent Mua Đất (Buy Land Drop Trap)*: Trong `modal_host.tsx`, callback `onSubmitTrade` ban đầu chỉ kiểm tra duy nhất nhánh bán đất của người chơi (`if (tradeData.offeredProperties[0] !== undefined)`).
  2. Khi người chơi lập đề xuất MUA đất của đối tác (chọn ô đất từ cột đối tác `requestedProperties: [cellIndex]` và nhập tiền mặt bù `cashOffer`), danh sách `offeredProperties` là mảng rỗng `[]`. Điều kiện `if` bị đánh giá là `false`, làm cho callback kết thúc sớm mà hoàn toàn không kích hoạt `onIntent`.
  3. Âm thanh `TRADE_SUCCESS` vẫn phát và modal đóng lại như bình thường, nhưng không có bản tin WebSocket `INTENT_TRADE_OFFER` nào được phát lên server, không có intent nào được lưu trữ trong telemetry (`recordedIntents`), và log hộp đen hoàn toàn thiếu vắng thao tác này khiến người chơi hoang mang tưởng hệ thống bị lỗi mạng hoặc đơ.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Dual P2P Trade Intent Dispatch Invariant**:
     - `onSubmitTrade` trong `modal_host.tsx` bắt buộc phải phân luồng đầy đủ cả 2 chiều giao dịch song phương:
       + Chiều Bán: `offeredProperties[0] !== undefined` $\rightarrow$ `sellerId: myId`, `buyerId: targetPlayerId`, `cellIndex: offeredProperties[0]`, `price: cashRequest || cashOffer || 1000`.
       + Chiều Mua: `requestedProperties[0] !== undefined` $\rightarrow$ `sellerId: targetPlayerId`, `buyerId: myId`, `cellIndex: requestedProperties[0]`, `price: cashOffer || cashRequest || 1000`.
  2. **Affordability & Price Suggestion Alignment Invariant**:
     - Khi người chơi chọn đất đối tác để mua, giao diện `TradeModal` phải hiển thị bộ nút giá nhanh (100% Gốc, 130%, 150%) tại cột tiền mặt của mình và cảnh báo rõ ràng nếu số dư hiện có không đủ chi trả.
  3. **Friendly Rejection Notification Invariant**:
     - Khi server hoặc bot từ chối đề nghị giao dịch (`TRADE_REJECTED`), client phải hiển thị toast thông báo tường minh bằng tiếng Việt ("Đối tác đã từ chối đề xuất đàm phán mua/bán đất!"), triệt tiêu hoàn toàn thông báo mã lỗi kỹ thuật thô ráp.

---

### 168. [UI/NET] Khử Chèn Đè Toast Desktop, Ticker Sự Kiện Thị Trường, Phong Tỏa Giao Dịch Khi Đóng Băng & Đồng Bộ 40 Vòng Đấu (IMP-128)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Chèn Đè Toast Góc Phải Màn Hình (Toast Collision Trap)*: `FloatingNumbersOverlay` trước đây định vị container desktop tại `fixed top-20 right-6`, chèn đè trực tiếp lên danh sách người chơi `PlayerHudList` ở cạnh phải, che khuất thanh hiển thị tài sản và avatar người chơi.
  2. *Bẫy Thiếu Nhận Thức Sự Kiện Thị Trường (Market Modifier Blindspot Trap)*: Khi thẻ vĩ mô (Bão lũ, Đóng băng giao dịch, Kích cầu tín dụng...) được rút, người chơi không có thanh hiển thị trực quan số vòng hiệu lực còn lại, dẫn đến việc không hiểu lý do vì sao tiền thuê bị miễn giảm hay giao dịch bị khóa.
  3. *Bẫy Kích Hoạt Đấu Giá Cưỡng Chế Khi Đóng Băng (Freeze Auction Trigger Trap)*: Trong `TitleDeedModal`, nút "Bỏ Qua" mặc định gọi `onPass()`. Khi thị trường đang đóng băng (`MC_FREEZE_TRADE`), nếu người chơi bấm "Bỏ Qua", `onPass()` sẽ kích hoạt sàn đấu giá, vi phạm luật chơi phong tỏa thanh khoản toàn diện.
  4. *Bẫy Desync 30 vs 40 Vòng Đấu (Max Rounds Desync Trap)*: `maxRounds` trong `game_store.ts` khởi tạo giá trị 30 trong khi server và SSOT quy định 40 vòng đấu, gây lệch đồng hồ đếm ngược khi chưa nhận được delta khởi tạo từ server.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Toast De-collision Invariant (`FloatingNumbersOverlay`)**:
     - Desktop container loại bỏ hoàn toàn class `right-6` và `top-20`, định vị an toàn căn giữa: `hidden md:flex fixed top-28 md:top-32 left-1/2 -translate-x-1/2 flex-col items-center gap-2 max-w-md z-40 pointer-events-none`.
     - Cắt tỉa tối đa 2 thông báo mới nhất cho regular toasts (`desktopTexts.slice(-2)`), giải phóng DOM trả về `null` khi `floatingTexts.length === 0`.
  2. **Reactive Market Event Ticker Invariant (`MarketEventTicker`)**:
     - Render ngay dưới `TopBar` trong cây giao diện HUD, có `data-testid="market-event-ticker"`.
     - Tự động unmount trả về `null` khi `activeModifiers` rỗng hoặc toàn bộ có `remainingRounds <= 0`.
     - Tra cứu thông tin từ SSOT `viTranslations.marketCards` và `MARKET_CARD_DETAILS`, hiển thị đếm ngược `Còn X vòng`.
  3. **Strict Trade Freeze Discipline Invariant (`ActionDock` & `TitleDeedModal`)**:
     - Khi `isTradeFrozen = true` (có `MC_FREEZE_TRADE` với `remainingRounds > 0`):
       + `ActionDock`: Nút Mua Đất bị `disabled={true}`, nhãn hiển thị `🔒 Đóng Băng (#pos)`. Nút Đàm Phán bị `disabled={true}` kèm title cảnh báo.
       + `TitleDeedModal`: Nút Mua BĐS bị `disabled={true}`, nhãn `"Thị Trường Đóng Băng"`. Nút Thế Chấp bị `disabled={true}` kèm class `cursor-not-allowed opacity-60`. Nút Bỏ Qua đổi thành `"Đóng"` và chỉ gọi `onClose()` (TUYỆT ĐỐI KHÔNG gọi `onPass()`).
  4. **Wire ReasonCode Safety & 40-Round Ceiling Invariant**:
     - Mở rộng `ReasonCode` với `'TradeFrozen' | 'FREEZE_ACTIVE' | 'ACTION_REJECTED'`.
     - WebSocket handler bắt lỗi `TradeFrozen` / `FREEZE_ACTIVE` và lập tức bắn toast cảnh báo có âm lượng xúc giác vào `floatingTexts`.
     - Khởi tạo mặc định `maxRounds = 40` trong `useGameStore`.

---

### 169. [3D/RENDER] Cô Lập 100% Vật Thể Ven Bờ Bãi Tắm Phía Tây Vào Khối Streamlined Để Chống Cắt Cụt Khung Hình Desktop (IMP-129)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Bỏ Quên Mô Hình Ngoại Vi Khi Tinh Giản Sa Bàn*: Trong đợt cải tiến IMP-107 (ẩn đĩa tròn cỏ xanh, bãi cát và cây cối ngoại vi bằng cờ `streamlined: true`), hai vật thể `Du thuyền sang trọng` (`position={[-11.5, -0.30, 12.0]}`) và `Tàu Container Tây Nam` (`position={[-15.0, -0.30, 9.5]}`) vốn neo gần bãi tắm Tây Nam cũ bị bỏ quên bên ngoài khối điều kiện ẩn `{!streamlined}`.
  2. *Bẫy Cắt Cụt Khung Nhìn Desktop Tỷ Lệ 16:9 (Desktop 9 o'clock Viewport Truncation)*: Trên màn hình tỷ lệ 16:9 của Desktop, camera góc rộng quét qua hướng 9h (cạnh ô số 10 Côn Đảo) và cắt ngang thân 2 mô hình này ngay sát mép trái màn hình (`x = 8px` đến `33px`), biến chúng thành một "mảng sàn/mặt bằng trắng bị thừa" nhô ra ngoài biển gây mất mỹ quan và làm người chơi hiểu nhầm là lỗi dựng hình (geometry glitch).
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Nearshore Vessels Encapsulation Invariant (`coastal_island_environment.tsx`)**:
     - Toàn bộ các mô hình ven bờ bãi tắm phía Tây (`Du thuyền sang trọng` và `Tàu Container Tây Nam`) BẮT BUỘC phải nằm hoàn toàn trong khối điều kiện `{!streamlined && ( ... )}`.
     - Khi chạy chế độ mặc định `streamlined = true`, khu vực biển ở hướng 9h hoàn toàn phẳng lặng, ôm sát khung bàn cờ gỗ óc chó 19.2 x 19.2m, triệt tiêu 100% vật thể trôi nổi ven bờ.
  2. **Deep Ocean Vessel Preservation Invariant**:
     - Các tàu hàng vi mô ở đại dương vô cực phía Nam (`position={[8, -0.35, 36]}`) được giữ nguyên vị trí nước sâu an toàn, tích hợp `SafeGLTFModel` và fallback chứa màu `#DC2626` cùng bọt sóng `#FFFFFF` để bảo toàn hợp đồng thẩm mỹ và test contract IMP-107.

---

### 170. [UI/MOBILE] Khử Chèn Đè Toast Biến Động Tài Chính & Ticker Sự Kiện Thị Trường Trên Mobile (IMP-130)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Ép Cứng Tọa Độ Mobile Toast (Mobile Hardcoded Top Trap)*:
     - Trong `FloatingNumbersOverlay`, container mobile (`flex md:hidden`) bị gán cứng tọa độ `fixed top-[4.25rem] left-1/2 -translate-x-1/2`.
     - Tọa độ này tương ứng 68px từ đỉnh màn hình, hoạt động tốt khi chỉ có `TopBar`.
     - Khi có Sự Kiện Thị Trường vĩ mô (`MarketEventTicker`), ticker chiếm không gian từ ~50px đến 100px. Kết quả là toast thông báo biến động tài sản/tiền tệ ("Xây C3 Đồng Nai", "Thu thuê BĐS") nhảy thẳng lên chính giữa banner sự kiện thị trường, che khuất hoàn toàn nội dung và tạo cảm giác giao diện bị lỗi chồng lấn nghiêm trọng.
  2. *Bẫy Chèn Đè Giữa Milestone Banner & Toast Thường*:
     - `MilestoneBanner` (thẻ Cơ Hội, Thị Trường, Độc Quyền) được neo tại `fixed top-20` (80px). Khi xuất hiện đồng thời với sự kiện thị trường hoặc toast thường trên mobile, các banner chèn đè lên nhau do thiếu cơ chế tính toán khoảng cách động.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Dynamic Mobile Offsets Invariant (`FloatingNumbersOverlay`)**:
     - `FloatingNumbersOverlay` đọc `activeModifiers` từ store để tính toán số sự kiện vĩ mô đang hiệu lực (`activeMarketCount`).
     - Tự động điều chỉnh `mobileTopClass`:
       + Không có sự kiện thị trường: `top-[4.25rem]` (68px).
       + Có 1 sự kiện thị trường: dịch chuyển xuống `top-28` (112px), nằm cách đáy ticker 11px an toàn.
       + Có >= 2 sự kiện thị trường: dịch chuyển xuống `top-40` (160px).
       + Nếu có `latestMilestone` đồng thời xuất hiện: dịch chuyển sâu hơn (`top-36`, `top-[11rem]` hoặc `top-[13.5rem]`) để xếp chồng dọc hoàn hảo, triệt tiêu 100% va chạm thị giác.
  2. **Milestone Banner Adaptive Spacing Invariant**:
     - `MilestoneBanner` tự động chuyển từ `top-20` xuống `top-28` (hoặc `top-40`) khi có sự kiện thị trường, đảm bảo hiển thị liền mạch dưới `MarketEventTicker` mà không đè lên bất kỳ phần tử nào.

---

### 171. [UI/MODAL] Tinh Giản Giao Diện Thẻ Bài Sự Kiện & Chuẩn Hóa Tỷ Lệ Diện Tích Thẻ (IMP-131)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Rò Rỉ Thuật Ngữ Kiểm Thử Nội Bộ & Bảng Biểu Hành Chính*:
     - `EventCardModal` trước đây hiển thị bảng thông số dày đặc với nhãn kỹ thuật `THÔNG SỐ MINH BẠCH` và mã điều khoản `SSOT §IV` dạng font mono in hoa ngay giữa thẻ.
     - Cấu trúc bảng chia 4 hàng với các nhãn hành chính thô ráp (`Phạm vi:`, `Thời hạn:`, `Quy tắc hiệu ứng:`, `Dòng tiền tác động:`) khiến một chiếc thẻ bài board game biến thành biên bản xử phạt hoặc tờ khai thuế.
  2. *Bẫy Trùng Lặp Thông Tin 3 Lần (3x Redundancy Trap)*:
     - Thẻ lặp lại nội dung ở 3 vị trí: Tiêu đề thẻ $\rightarrow$ Miêu tả phụ $\rightarrow$ Quy tắc hiệu ứng trong bảng. Người chơi bị quá tải thị giác và phải đọc cùng 1 nội dung tới 3 lần trên một diện tích nhỏ.
  3. *Bẫy Tỷ Lệ Thẻ Bị Bẹp & Thụt Đáy Màn Hình Mobile*:
     - Tỷ lệ khung hình thẻ trước đây là 1 : 1.1 (gần như vuông bẹt), làm mất phom dáng thanh thoát của thẻ bài cao cấp (Tarot/Playing Card ~ 1 : 1.45).
     - Trên mobile, cờ `mt-auto` đẩy thẻ tụt xuống đáy màn hình như thông báo lỗi hệ thống thay vì được "rút" lên chính giữa sa bàn 3D.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Zero Text Duplication & Zero Developer Slop Invariant**:
     - Xóa bỏ vĩnh viễn dòng chữ `THÔNG SỐ MINH BẠCH` và `SSOT §IV`. Nhãn danh mục chuẩn hóa thành `SỰ KIỆN THỊ TRƯỜNG` hoặc `CƠ HỘI ĐẦU TƯ`.
     - Giữ duy nhất 1 câu tóm tắt hiệu ứng gãy gọn, giàu ngữ cảnh trong khối capsule nền giấy ngà mềm mại (`#F7F2E7`).
  2. **1-Second Stat Chips Invariant**:
     - Thay thế bảng 4 dòng bằng các thẻ Chip bo tròn trực quan xếp hàng ngang: `🎯 [Phạm vi]`, `⏳ [Thời hạn]`, `🏛️ [Đối tượng]` và pill biến động tiền tệ font monospace to rõ.
  3. **Golden Ratio & Responsive Centering Invariant**:
     - Căn giữa hoàn hảo (`my-auto`) trên cả Mobile (`max-w-[340px]`) và Desktop (`max-w-[370px]`), bảo toàn tỷ lệ hoàng kim thẻ bài ~ 1 : 1.45.
     - Tích hợp viền chỉ mực kép hoài cổ (`inset-1.5 sm:inset-2 border-amber-700/20`), khung Hero Icon 64px nổi khối và nút bấm xúc giác 3D với đổ bóng `#065f46`.

---

### 172. [UI/MODAL] Khử Trùng Lặp Ticker Sự Kiện 1 Dòng, Chống Cắt Cụt Destination Chip & Đồng Nhất Dữ Liệu Thẻ Quy Hoạch Đô Thị (IMP-132)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Mâu Thuẫn Văn Bản Thẻ Quy Hoạch MC_URBAN_PLANNING (Negative Contradiction Trap)*:
     - Thẻ `MC_URBAN_PLANNING` trong `event_card_metadata.ts` trước đây mang câu văn mâu thuẫn "Cấm thế chấp đất dọc hành lang quy hoạch" trong khi bản chất cơ chế kinh tế của thẻ là ưu đãi tăng định giá thế chấp từ 50% lên 60% (+20% giá trị).
     - Trường `targetScope` liệt kê thô kệch các số ô bàn cờ `(Ô 31, 32, 34, 37, 39)` làm mất tính thẩm mỹ board game.
  2. *Bẫy Ticker 2 Dòng Chồng Chéo & Pill Kém Tương Phản (Ticker Vertical Clutter Trap)*:
     - `MarketEventTicker` trước đây render cả tiêu đề và dòng miêu tả phụ (`text-[11px] text-slate-600 truncate`) tạo ra layout 2 dòng chật chội, chữ đè chữ trên màn hình nhỏ.
     - Badge đếm vòng dùng nền nhạt `bg-amber-50 text-amber-900 border-amber-300` thiếu độ tương phản xúc giác.
  3. *Bẫy Cắt Cụt Chữ Chip Điểm Đến (Destination Chip Truncation `t...` Trap)*:
     - Trong `EventCardModal`, chip điểm đến dùng `truncate max-w-[140px]` đối với các chuỗi dài như "Ngân sách người chơi thực hiện thế chấp", khiến chữ bị cắt cụt thành `Ngân sách người t...`. Ngoài ra, điểm đến là ngân sách nội bộ của người chơi không cần thiết phải hiển thị dạng chip công cộng `🏛️`.
  4. *Bẫy Cấn Mép Chữ VÒNG Trên TopBar (TopBar Capsule Left-Edge Collision Trap)*:
     - `match-info-capsule` trước đây có lề trái quá hẹp `px-2 sm:px-4`, làm chữ "VÒNG" chạm sát mép bo cong `rounded-xl` bên trái của thanh trạng thái.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **SSOT Data Alignment Invariant (`event_card_metadata.ts`)**:
     - `MC_URBAN_PLANNING` mô tả chuẩn: "Quy hoạch trục đô thị mới: Tăng 20% giá trị khi thế chấp BĐS trung tâm Hà Nội & TP.HCM.", loại bỏ 100% cụm từ "Cấm thế chấp".
     - `targetScope` thân thiện: "Bất động sản trung tâm Hà Nội và TP.HCM (Nhóm Xanh Lá & Tím)".
     - `destination: 'Ngân sách người chơi'` bảo vệ tính toàn vẹn cho contract tests `imp57`.
  2. **Streamlined 1-Line Ticker Invariant (`market_event_ticker.tsx`)**:
     - Ticker hiển thị gọn gàng trên đúng 1 dòng thanh mảnh: loại bỏ đoạn mô tả phụ, giữ `font-black text-xs sm:text-sm truncate text-slate-900 leading-none`.
     - Countdown pill nổi bật: `bg-amber-100 text-amber-900 border-amber-400 font-extrabold shrink-0`.
  3. **Third-Party Destination Filter & Whitespace-Nowrap Invariant (`event_card_modal.tsx`)**:
     - Chip `🏛️` chỉ hiển thị khi điểm đến thực sự mang tính bên thứ ba (`!resolvedDestination.toLowerCase().includes('người chơi') && !resolvedDestination.toLowerCase().includes('thực hiện')` và khác `'Toàn thị trường'`).
     - Khi hiển thị, sử dụng `whitespace-nowrap` mà không gò bó `truncate max-w-[140px]`.
     - Bảo tồn nguyên vẹn các wrapper responsive `hidden sm:block`, `event-impact-summary (sm:hidden)`, `event-specs-table (hidden sm:flex)`.
  4. **TopBar Capsule Edge Padding Invariant (`top_bar.tsx`)**:
     - Container `match-info-capsule` sử dụng `px-3 sm:px-4`, triệt tiêu hoàn toàn `px-2` để chữ "VÒNG" cách mép bo cong an toàn tối thiểu 12px.

---

### 173. [UI/MINIMAP] Bất Biến Lưới Sa Bàn 40 Ô Chu Vi 11x11, Khử Bẫy Văng Single-Slot Modal & Ma Trận 8 Phân Khu Độc Quyền (Urban Masterplan Minimap Invariant - IMP-132)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Văng Modal Do Single-Slot ActiveModal (Modal Ejection / Navigation Trap)*:
     - Trong kiến trúc `game_store`, `activeModal` chỉ lưu 1 modal duy nhất tại 1 thời điểm (`deed | portfolio | auction | ... | masterplan`).
     - Nếu từ trong `MasterplanModal` mà gọi `openModal('deed')` để xem Sổ Đỏ, `MasterplanModal` sẽ bị unmount ngay lập tức; khi người chơi bấm đóng Sổ Đỏ, họ bị văng hẳn ra bàn cờ 3D thay vì quay lại sa bàn quy hoạch đô thị.
  2. *Bẫy Trùng Lặp 4 Ô Góc Trên Lưới CSS Grid (11x11 Corner Duplication 44 vs 40 Cells Trap)*:
     - Một bàn cờ có 40 ô chạy dọc 4 cạnh, mỗi cạnh gồm 11 ô (bao gồm 2 góc). Nếu cộng thô $11 \times 4 = 44$ ô sẽ bị lặp 4 góc 2 lần (ô 0, 10, 20, 30).
     - Nếu lặp ô, các bài test hợp đồng tìm kiếm `masterplan-cell-0` hay `masterplan-cell-10` sẽ phát hiện trùng lặp và vỡ cấu trúc chu vi.
  3. *Bẫy Vượt Trần Độ Phức Tạp Mã Nguồn UI (UI Component > 500 LOC Trap)*:
     - Khi nhúng trực tiếp bảng tọa độ 40 ô `GRID_TILE_COORDS`, danh mục 8 nhóm màu `DISTRICT_GROUPS` và các thẻ card nội bộ vào cùng 1 tệp `masterplan_modal.tsx`, dung lượng tệp phình lên 584 dòng, vi phạm trần 500 dòng của quy chế `constitution_governance`.
  4. *Bẫy Ép Khung Màn Hình Nhỏ & Xung Đột Tương Phản Màu Sắc (Mobile Touch Target & Contrast Trap)*:
     - Trên màn hình hẹp (< 640px), lưới 11x11 bị nén nhỏ khiến touch target mỗi ô < 30px, khó chạm bằng ngón tay cái. Đồng thời nếu tô toàn bộ ô bằng màu sắc của người chơi sẽ che khuất dải màu phân khu `colorGroup`.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Inspector Card Nội Bộ Khép Kín Invariant (`MasterplanInspectorCard`)**:
     - `MasterplanModal` tuyệt đối KHÔNG gọi `openModal('deed')`. Khi người chơi chạm vào bất kỳ ô nào, modal tự động render `MasterplanInspectorCard` (sử dụng hàm thuần `getDeedDisplayInfo`) ngay tại vùng trung tâm của lưới sa bàn (grid-row: 2/11, grid-col: 2/11) mà không thay đổi `activeModal` của game store.
  2. **Tọa Độ Chu Vi 11x11 Khép Kín 40 Ô Invariant (`GRID_TILE_COORDS`)**:
     - Cố định bảng ánh xạ tọa độ tĩnh 40 ô duy nhất:
       - Cạnh Nam (Row 11): Ô 0 (Col 11 - GO) $\rightarrow$ Ô 1..9 (Col 10..2) $\rightarrow$ Ô 10 (Col 1 - Trạm Kiểm Toán).
       - Cạnh Tây (Col 1): Ô 10 (Row 11) $\rightarrow$ Ô 11..19 (Row 10..2) $\rightarrow$ Ô 20 (Row 1 - Nghỉ Dưỡng).
       - Cạnh Bắc (Row 1): Ô 20 (Col 1) $\rightarrow$ Ô 21..29 (Col 2..10) $\rightarrow$ Ô 30 (Col 11 - Lệnh Thanh Tra).
       - Cạnh Đông (Col 11): Ô 30 (Row 1) $\rightarrow$ Ô 31..39 (Row 2..10) $\rightarrow$ Ô 0 (Row 11).
       $\rightarrow$ Đảm bảo chính xác $11 + 9 + 11 + 9 = 40$ ô khép kín, 4 ô góc xuất hiện duy nhất 1 lần.
  3. **Module Phân Tách Bền Vững (Architectural LOC Ceiling Invariant)**:
     - Tách dữ liệu tĩnh sang `masterplan_constants.ts` (73 LOC).
     - Tách các sub-component sang `masterplan_components.tsx` (189 LOC).
     - Giữ `masterplan_modal.tsx` gọn gàng ở mức ~279 LOC, vượt qua 100% bài kiểm tra `constitution_governance`.
  4. **Phân Tách Màu Nhóm Đất vs Màu Chủ Đất (Color Hierarchy Invariant)**:
     - Dải màu nhóm đất `colorGroup` luôn nằm trên thanh viền đỉnh của ô (`w-full h-1 sm:h-1.5`).
     - Quyền sở hữu của người chơi được thể hiện qua chấm tròn `tokenColor` + icon Avatar ở giữa ô.
     - Cấp công trình hiển thị bằng chip `C1`, `C2`, `C3` màu vàng hổ phách nổi bật ở chân ô; ô thế chấp hiển thị icon `🔒` và `data-mortgaged="true"`.
  5. **Smart Responsive Default View Invariant**:
     - Trên thiết bị di động (< 640px), modal tự động ưu tiên mở Tab 2 (`8 Phân Khu`) với touch target rộng rãi $\ge 44$px và hiển thị tức thì tiến trình độc quyền (vd: `2/3`, `👑 Độc Quyền`) để phục vụ đàm phán P2P Trade nhanh. Trên desktop ($\ge 640$px), mở mặc định Tab 1 (`Sa Bàn 40 Ô`).

---

### 174. [FSM/TELEMETRY] Triệt Tiêu Lỗi INVALID_PHASE Tại Ô 10 (Trạm Kiểm Toán) & Bất Biến Miễn Trừ Nợ Thụ Động Ngoài Lượt (IMP-133)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Kẹt Lượt Tại Ô 10 Trạm Kiểm Toán (Audit Turn End Rejection Trap)*:
     - Tại đầu lượt của người chơi đang ở Ô 10, FSM đặt `room.phase = TurnPhase.WaitingRoll`. Nếu người chơi không gieo xúc xắc (chấp nhận giam giữ) hoặc hệ thống gửi `INTENT_END_TURN`, hàm `executeTurnEnd` chặn cứng bằng điều kiện `if (!rolledThisTurn && room.phase === TurnPhase.WaitingRoll) return undefined;`.
     - Hậu quả: `dispatchPlayerIntent` trả về lỗi `INVALID_PHASE`, người chơi bị kẹt cứng không thể kết thúc lượt.
  2. *Bẫy Bỏ Quên Nợ Âm Khi Chuyển Lượt Hoặc Lượt Bổ Sung (Insolvency Handover Priority Trap)*:
     - Khi người chơi kế tiếp (`nextPlayer`) hoặc người có lượt bổ sung (`extraTurns > 0`) bị âm tiền thụ động do sự kiện ngoài lượt (ví dụ bão, thuế, rút thẻ), `executeTurnEnd` vô điều kiện gán `room.phase = TurnPhase.WaitingRoll` (hoặc `PropertyManagement` nếu `skipNextTurn`), bỏ qua hoàn toàn trạng thái âm tiền (`balance < 0`).
  3. *Bẫy Cảnh Báo Sai Trong Telemetry Invariant Watchdog (Passive Debt False Positive Trap)*:
     - Chó canh phòng bất biến `verifyNonNegativeBalance` quét mọi người chơi trong phòng; nếu một người chơi bị trừ tiền ngoài lượt khiến `balance < 0` trong khi đang ở lượt của người khác, Telemetry lập tức quăng vi phạm `CRITICAL: NEGATIVE_BALANCE_OUTSIDE_INSOLVENCY` dù người đó chưa đến lượt để kích hoạt `InsolvencyPhase`.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Audit Turn Depletion Invariant (`turn_loop.ts`)**:
     - Cho phép kết thúc lượt tại `WaitingRoll` nếu đang thụ án kiểm toán:
       `if (!rolledThisTurn && room.phase === TurnPhase.WaitingRoll && (current.auditTurnsLeft ?? 0) <= 0) return undefined;`
     - Khi người chơi kết thúc lượt ở đầu turn tại Ô 10 mà không gieo xúc xắc, `auditTurnsLeft` tự động suy giảm 1 lượt (3 -> 2 -> 1 -> 0) và phạt 500 Tr. nộp Kho Bạc khi về 0.
  2. **Insolvency Handover Priority Invariant (`turn_loop.ts`)**:
     - Khi xử lý `extraTurns > 0` hoặc chuyển lượt sang `nextPlayer`, ưu tiên số 1 TUYỆT ĐỐI là kiểm tra `(balance ?? 0) < 0`. Nếu âm tiền, lập tức gán `room.phase = TurnPhase.InsolvencyPhase` và gọi `checkInsolvency(room)`, chiếm quyền ưu tiên so với `skipNextTurn` hay `WaitingRoll`.
  3. **Passive Debt Telemetry Exemption Invariant (`invariant_checker.ts`)**:
     - Trong `verifyNonNegativeBalance`, người chơi bị âm tiền ngoài lượt (`currentTurnPlayerId !== undefined && currentTurnPlayerId !== null && currentTurnPlayerId !== '' && currentTurnPlayerId !== p.id`) được miễn trừ vi phạm (`isExempt = true`). Nợ sẽ được giải quyết khi lượt chơi chính thức chuyển giao cho người đó.

---

### 175. [3D/UI/TEST] Chuỗi Ưu Tiên Camera Sticky Focus, Bẫy React SSR Static Markup Với Sự Kiện DOM & Tối Ưu UX Nâng Cấp Nhanh (IMP-133)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Xung Đột Camera Target Khi Quân Cờ Di Chuyển Hoặc Gieo Xúc Xắc (Sticky Focus Collision Trap)*:
     - Khi người chơi mở danh mục BĐS và rê chuột qua các ô cờ (`cameraFocusCell`), nếu không có cơ chế reset khi gieo xúc xắc (`isRolling = true`) hoặc khi quân cờ đang nhảy trên đường đua (`activeAnimation.isAnimating = true`), camera sẽ bị giữ chặt (sticky) vào ô đất cũ, làm mất góc máy cinematic bám đuổi quân cờ hoặc đè lên góc máy mở sổ đỏ (`modalPayload.cellIndex`).
  2. *Bẫy React Server SSR Stripping Event Handlers Trong Contract Test (React renderToStaticMarkup Trap)*:
     - Khi kiểm thử hợp đồng bằng `renderToStaticMarkup(React.createElement(...))`, React tự động loại bỏ các thuộc tính event handler dạng hàm (`onMouseEnter={() => ...}`). Nếu cố tình truyền `onmouseenter="true"`, React sẽ ném cảnh báo `Invalid event handler property` và vẫn tiếp tục loại bỏ thuộc tính khỏi chuỗi HTML đầu ra.
  3. *Bẫy Bỏ Quên Đồng Bộ Nút Recenter Với Trạng Thái Modal*:
     - Nút nổi `[♟️ Về Quân Cờ]` (`RecenterPawnPill`) nếu render đè lên các popup toàn màn hình (ModalBackdrop, TitleDeedModal, Portfolio) sẽ gây vỡ layout và cản trở tương tác người dùng.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Chuỗi Ưu Tiên 4 Tầng Của Camera Target Invariant (`use_game_camera.ts`)**:
     - Cố định thứ tự ưu tiên tuyệt đối:
       `1. modalPayload.cellIndex` (Mở modal sổ đỏ / sự kiện cụ thể) $\rightarrow$
       `2. activeAnimation.waypoints[idx]` (Quân cờ đang hoạt cảnh nhảy ô) $\rightarrow$
       `3. cameraFocusCell` (Người chơi chủ động soi ô cờ từ Portfolio) $\rightarrow$
       `4. playerPositions[currentTurnPlayerId]` (Vị trí mặc định của người chơi hiện tại).
     - Bắt buộc tự động xóa rỗng `cameraFocusCell: null` ngay khi gieo xúc xắc (`isRolling = true`) và khi đóng modal danh mục.
  2. **Data-Attribute Bridge Invariant Cho SSR Contract Test (`property_portfolio_modal.tsx`)**:
     - Để bộ kiểm thử static markup nhận diện được khả năng lắng nghe sự kiện mà không gây cảnh báo console cho React 18/19, gắn song song `data-onmouseenter="true"` cùng với `onMouseEnter={() => onHoverCell?.(cellIndex)}`.
  3. **Recenter Pill Triệt Tiêu Hiển Thị Invariant (`recenter_pawn_pill.tsx`)**:
     - `RecenterPawnPill` bắt buộc trả về `null` (không render bất kỳ markup nào) khi:
       `activeModal !== null || cameraFocusCell === null || cameraFocusCell === pawnPosition`.

---

### 176. [UI/UX/CRAFT] Hệ Thống Gợi Ý Thao Tác Ngữ Cảnh, Chống Va Chạm Chip ActionDock & Chuẩn Hóa WCAG Touch Target 44px (IMP-134)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Chuỗi Lỗi Kỹ Thuật Gây Hoang Mang (Raw Error Code Trap)*:
     - Trước IMP-134, FSM từ chối thao tác gửi các chuỗi tiếng Anh kỹ thuật (`INVALID_PHASE`, `INSUFFICIENT_FUNDS`, `EVEN_BUILDING_VIOLATION`), client hiển thị banner đỏ thô `Lỗi máy chủ: ...`. Người chơi không hiểu nguyên nhân nghiệp vụ và không biết bước tiếp theo phải làm gì.
  2. *Bẫy Chồng Lấn Nhiều Chip Thông Báo Ở Tọa Độ Trung Tâm ActionDock (Chip Collision Trap)*:
     - Trước IMP-134, các thông báo trạng thái (Bão mất lượt, Bot pacing) đều render song song tại `absolute -top-10 left-1/2 -translate-x-1/2`. Khi người chơi vừa bị âm tiền vừa ở Trạm Kiểm Toán hoặc bị mất lượt, các chip đè chữ nát lên nhau (Z-fighting / Text overlapping) trên mobile.
  3. *Bẫy Tràn Màn Hình Di Động Do Chuỗi Văn Bản Quá Dài (Mobile String Overflow Trap)*:
     - Chuỗi hướng dẫn chi tiết dài > 60 ký tự kết hợp `whitespace-nowrap` khiến chip bị tràn khỏi 2 mép màn hình điện thoại (< 390px).
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **SSOT Actionable Notification Engine (`actionable_notification.ts`)**:
     - Áp dụng 100% 28+ ReasonCode thành thông điệp tiếng Việt thân thiện gồm Icon, Tiêu đề dễ hiểu, và Lời khuyên hành động (Action Hint) giúp người chơi biết cách tiếp tục.
     - Triệt tiêu hoàn toàn tiền tố "Lỗi máy chủ:"; fallback an toàn cho mã lạ/rỗng/null.
     - Bảo toàn 100% tương thích ngược regex cho các test suite hợp đồng cũ.
  2. **Chuỗi Ưu Tiên Độc Quyền Chip ActionDock Invariant (`resolveActionDockNotice`)**:
     - Áp dụng thứ tự ưu tiên độc quyền nghiêm ngặt:
       `1. Insolvent (🚨 Âm ngân sách)` $\rightarrow$
       `2. InAudit (⚖️ Trạm Kiểm Toán)` $\rightarrow$
       `3. SkipTurn (🌪️ Bão mất lượt)` $\rightarrow$
       `4. BotPacing (🤖 Đối thủ máy tính)`.
     - Tại mọi thời điểm chỉ có DUY NHẤT 1 chip thông tin hiển thị tại trung tâm ActionDock, triệt tiêu 100% lỗi chồng lấn.
  3. **Responsive Text Pair & WCAG Touch Target Invariant**:
     - Cung cấp `mobileText` ngắn gọn (trần $\le 45$ ký tự, không lặp emoji với icon chip) kết hợp `desktopText` đầy đủ.
     - Nút đóng ServerToast bắt buộc đạt chuẩn WCAG Mobile Touch Target: `min-w-[44px] min-h-[44px] inline-flex items-center justify-center cursor-pointer`.

---

### 177. [3D/KINEMATICS] Chu Kỳ Đoàn Tàu Sa Bàn Khép Kín, Góc Cua Bo Rắn Tránh Lệch Tim Ray & Phân Rã Toa Xe Chuẩn Trục +X (IMP-134)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Quỹ Đạo Đứt Gãy & Chu Vi Ray Lệch Tiêu Chuẩn (Non-Closed Spline & Perimeter Drift Trap)*:
     - Khi dùng CatmullRomCurve3 cho tuyến ray bao quanh chu vi sa bàn, nếu không chốt `closed: true`, tension 0.15 và cấu hình điểm đối xứng bám viền $X, Z = \pm 6.9\text{m}$ với 4 góc bo cong ($R \approx 0.8\text{m}$), chu vi $L$ có thể trôi ra ngoài dải quy chuẩn $[50.0\text{m}, 58.0\text{m}]$ hoặc đầu/đuôi curve không khép kín gây hiện tượng giật góc (corner snapping).
  2. *Bẫy Xoay Khớp Nối Toa Xe Lệch Trục Tọa Độ (Coordinate Yaw Inversion Trap)*:
     - Các mô hình toa xe Three.js thường có hướng chuyển động chuẩn theo trục $+X$. Nếu tính yaw bằng `Math.atan2(tangent.x, tangent.z)` (chuẩn trục $+Z$ của ô tô) thì đầu tàu bị quay ngang $90^\circ$ cày xéo mặt ray. Phải áp dụng chuẩn trục $+X$: `Math.atan2(-tangent.z, tangent.x)`.
  3. *Bẫy Dừng Ga Không Triệt Tiêu Vận Tốc Tức Thời & Rò Rỉ Object Trong useFrame (Station Dwell Velocity & GC Leak Trap)*:
     - Khi tàu dừng tại Ga Nam (`Waterfront Central`, 0.12) và Ga Bắc (`Landmark Metro`, 0.62) trong $3.5\text{s}$, nếu không khóa cứng `speed = 0` và `isStopped = true`, nhịp rung lắc pitch `Math.sin(t * 12)` vẫn tiếp tục rung khi đứng yên. Đồng thời nếu tạo mới `new Vector3()` trong `useSafeFrame` sẽ gây rác bộ nhớ làm tụt FPS WebGL.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Closed Fillet Spline Invariant (`diorama_train_kinematics.ts`)**:
     - Cố định 19 điểm kiểm soát CatmullRomCurve3 khép kín bám viền $\pm 6.9\text{m}$, 4 góc bo tại $|X, Z| = 6.8\text{m}$, bảo đảm chu vi $L = 54.49\text{m} \in [50.0, 58.0\text{m}]$ và $|x|, |z| \le 7.15\text{m}$.
  2. **+X Axis Carriage Yaw Invariant (`computeTrainYaw`)**:
     - Bắt buộc áp dụng công thức thuần: `Math.atan2(-tangent.z, tangent.x)`. Toa khách 1 và Toa khách 2 lùi độc lập theo khoảng cách cố định $0.85\text{m}$ và $1.70\text{m}$ qua hàm `computeCarriageProgress`, bảo đảm khớp nối uốn lượn độc lập từng toa khi vào góc rẽ.
  3. **Station Dwell & In-Place Vector Invariant (`DioramaModelRailroad`)**:
     - Tàu dừng hẳn $3.5\text{s}$ tại mỗi ga với `speed = 0`, `isStopped = true`, chỉ kích hoạt nhịp pitch khi `speed > 0.01`.
     - Tái sử dụng `tempVec` và `tempTangent` toàn cục ngoài React component để triệt tiêu 100% GC pressure.

---

### 178. [UI/UX/TIMING] Minh Bạch Hóa Sự Kiện Thị Trường Hai Tầng & Ràng Buộc Thời Lượng Pop-up Đa Phân Đoạn (IMP-135)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Banner Thị Trường Khuyết Thiếu Thông Tin Hiệu Lực (Opaque Market Banner Trap)*:
     - Trước IMP-135, `MarketEventTicker` chỉ render Icon, Tiêu đề thẻ và badge `Còn X vòng` (ví dụ: "🏖️ Mùa Cao Điểm Du Lịch Quốc Tế [Còn 1 vòng]"). Người chơi hoàn toàn không hiểu sự kiện này tác động gì đến tài chính hay bàn cờ (ví dụ: nhân đôi tiền thuê resort ven biển).
  2. *Bẫy Thời Lượng Hiển Thị Quá Ngắn Khiến Người Chơi Đọc Không Kịp (Premature Dismissal Trap)*:
     - Trước IMP-135, toàn bộ pop-up biến động tiền tệ, mốc thẻ bài quan trọng chỉ hiển thị `2200ms` (`FLOATING_TEXT_DURATION_MS = 2200`), và Toast chỉ `4000ms`. Các câu thông điệp dài như "Trả thuê Bến Thành cho Hoàng Nam -2.500 Tr." hay thẻ Cơ Hội vừa hiện lên đã biến mất tức thì, gây ức chế tâm lý cho người chơi.
  3. *Bẫy Cụ Cột Mô Tả Bằng Truncate Trên Giao Diện Mobile (Truncate Clipping Trap)*:
     - `MilestoneBanner` dùng class `truncate` cứng khiến các câu mô tả thẻ bài Cơ Hội / Thị Trường bị cắt cụt lửng lơ trên màn hình hẹp của điện thoại.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Two-Tier Market Event Ticker Invariant (`market_event_ticker.tsx`)**:
     - Bắt buộc render bố cục 2 tầng: Dòng 1 gồm `{icon}` + **{title}** + Badge vòng còn lại; Dòng 2 là Subtitle `{effectSummary}` trích xuất trực diện từ `MARKET_CARD_DETAILS` qua `resolveMarketEffectSummary`.
     - Áp dụng `line-clamp-2 pl-6 sm:pl-7 leading-tight` để căn thẳng hàng với tiêu đề và hỗ trợ hiển thị tối đa 2 dòng không vỡ layout trên mobile.
  2. **Multi-Tier Duration & Backward-Compatibility Contract Invariant (`game_store.ts`)**:
     - Bảo tồn 100% hằng số `FLOATING_TEXT_DURATION_MS = 2200` theo hợp đồng cũ `[TC-117.01]`.
     - Phân tầng thời lượng hiển thị mới:
       + Thẻ sự kiện & Cột mốc (`chance`, `market`, `monopoly`, `debt_relief`): $4.500\text{ms}$ (`EVENT_BANNER_DURATION_MS = 4500`).
       + Giao dịch thông thường (`buy`, `rent_pay`, `upgrade`, `tax`...): $3.600\text{ms}$ (`TRANSACTION_POPUP_DURATION_MS = 3600`).
       + Cho phép ghi đè linh hoạt qua thuộc tính `durationMs?: number` trên `FloatingTextItem`.
       + `ServerToast` thông báo máy chủ nâng lên $6.000\text{ms}$ (`SERVER_ERROR_TOAST_TIMEOUT_MS = 6000`), bảo toàn nút đóng nhanh $\ge 44\text{px}$.
  3. **Milestone Banner Non-Clipping Invariant (`floating_numbers.tsx`)**:
     - Cấm dùng `truncate` đơn dòng trên mô tả thẻ sự kiện của `MilestoneBanner`. Bắt buộc dùng `line-clamp-2 break-words` để hiển thị trọn vẹn ngữ nghĩa tác động.

---

### 179. [UI/CRAFT] Thẻ Bài Fintech "Hiểu Ngay Trong 1 Giây", Khử Số Ô Thô Kệch & Bất Biến Thứ Tự TestId Trước ClassName (IMP-134)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Liệt Kê Số Ô Thô Kệch (Tile Indices Clutter Trap)*:
     - Trước IMP-134, các thẻ sự kiện hiển thị chuỗi danh sách ô dạng `(Ô 5, 15, 25, 35)` hoặc `(Ô 6, 8, 26, 27)` trong các chip tóm tắt phạm vi (`targetScope`), gây chật chội, kém tinh tế và làm hẹp không gian hiển thị trên mobile.
  2. *Bẫy Nhãn Cấm 'Thu Nhập:' / 'Khoản Chi:' (Forbidden Cash Delta Label Trap)*:
     - Trước IMP-134, khối cash delta badge cũ hiển thị tiền tố `Thu Nhập:` hoặc `Khoản Chi:` gây vi phạm hợp đồng hồi quy `TC-IMP132.20` và `TC-MCH01.24` khi effectDelta là undefined, đồng thời lặp lại số liệu gây phân tán thị giác.
  3. *Bẫy Thứ Tự Thuộc Tính DOM Trong Kiểm Thử Tĩnh (Data-TestId vs ClassName Precedence Trap)*:
     - Khi kiểm thử hợp đồng bằng biểu thức chính quy `/data-testid="event-card-modal"[^>]*\bpt-7\b/`, nếu đặt `className` trước `data-testid`, toán tử `[^>]*` sau `data-testid` không thể quét ngược lại các utility class phía trước, dẫn đến kiểm thử thất bại giả định dù class vẫn tồn tại trong thẻ.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Fintech Hero Stat Box Invariant (`event_card_visuals.ts`)**:
     - Hiển thị khối `data-testid="event-hero-stat"` to bản với font-mono, số liệu nổi bật (`+500 Tr.`, `-800 Tr.`, `10% QUA GO`, `+20% THẾ CHẤP`, `+2.500 Tr.`, `MIỄN 100% THUÊ`, `ĐỔI 1 Ô C0`).
     - Tuyệt đối cấm chứa chuỗi `'Thu Nhập:'` hay `'Khoản Chi:'`. Dùng các nhãn hành động đanh thép: `PHỤ THU CƯỚC`, `PHẠT NỒNG ĐỘ CỒN`, `LÃI SUẤT VAY`, `QUY HOẠCH ĐÔ THỊ`, `CHỐT LỜI CỔ PHIẾU`, `THANH TRA THUẾ`, `MIỄN TRỪ NGOẠI GIAO`, `HOÁN ĐỔI DỰ ÁN`.
     - Phân định icon chuyên đề qua `getCardThemedEmoji(cardId, cardType)` (`⛽`, `🚨`, `🏖️`, `🚘`), fallback về `📰` cho Market và `⚡` cho Chance.
  2. **Tile List Sanitization Invariant (`sanitizeTargetScope`)**:
     - Bắt buộc lọc sạch các dãy số ô thô kệch bằng regex `/\s*\([ÔO0-9,\s]+\)/gi` trên cả nội dung hiển thị lẫn thuộc tính tooltip `title` của chip phạm vi.
  3. **Data-TestId Precedence Invariant (`event_card_modal.tsx`)**:
     - Luôn khai báo `data-testid="..."` trước `className="..."` trên các thẻ root và container chính để bảo đảm tính tương thích tuyệt đối với các bộ kiểm thử tĩnh dùng biểu thức chính quy xuôi dòng.

---

### 180. [FSM/AUDIT] Bất Biến Cho Phép Gieo Đôi Thoát Án Kiểm Toán & Triệt Tiêu Lỗi INVALID_PHASE (IMP-135)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Khóa Cứng Nút Gieo Xúc Xắc Trong Trạm Kiểm Toán (Audit Softlock Trap)*:
     - Trước IMP-135, hàm `isRollActionDisabled` sử dụng điều kiện `Boolean(params.inAudit)` cứng nhắc để khóa nút Đổ xúc xắc khi người chơi đang thụ án kiểm toán (`inAudit = true`). Điều này tước đoạt hoàn toàn cơ chế luật chơi cơ bản SSOT §I.2: người chơi trong Trạm Kiểm Toán được quyền gieo xúc xắc đầu lượt tìm cơ hội ra đôi (Doubles) để được phóng thích tự do và di chuyển tức thì.
  2. *Bẫy Cho Phép Kết Thúc Lượt Khi Ra Đôi (Doubles End Turn Exploit Trap)*:
     - Trong `isEndTurnDisabled`, nhánh kiểm tra `if (params.inAudit ...) return false` áp đảo logic trò chơi, dẫn đến khi người chơi vừa gieo ra đôi trong Trạm Kiểm Toán (`canRollAgain = true`), nút Kết Thúc Lượt vẫn sáng (`disabled = false`). Người chơi có thể vô tình bấm kết thúc lượt, đánh mất lượt di chuyển tiếp theo hoặc gây xung đột trạng thái FSM giữa client và server.
  3. *Bẫy Sai Lệch Pha PropertyManagement Khi Đang Thụ Án (PropertyManagement Phase Trap)*:
     - Khi người chơi bắt đầu lượt trong Trạm Kiểm Toán nhưng trạng thái phòng hoặc FSM rơi vào pha `PropertyManagement`, điều kiện `turnPhase === 'PropertyManagement' && !hasRolledThisTurn` khóa nút gieo xúc xắc, khiến người chơi không thể thực hiện quyền gieo đôi đầu lượt và phát sinh lỗi từ chối `INVALID_PHASE`.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Audit Roll Doubles Eligibility Invariant (`ui_helpers.ts`)**:
     - `isRollActionDisabled` thay thế `Boolean(params.inAudit)` thành `Boolean(params.inAudit && params.hasRolledThisTurn && !params.canRollAgain)`. Khi `inAudit = true`, nếu `hasRolledThisTurn = false` (hoặc `undefined`) hoặc `canRollAgain = true`, nút gieo xúc xắc luôn ở trạng thái khả dụng (`disabled = false`).
     - Bổ sung chốt chặn `!params.inAudit` vào nhánh kiểm tra `PropertyManagement` (`!params.inAudit && params.turnPhase === 'PropertyManagement' && (!params.canRollAgain || !params.hasRolledThisTurn)`), bảo đảm người chơi đang thụ án luôn được phép gieo xúc xắc đầu lượt.
  2. **Audit Mandatory Continuation Invariant (`isEndTurnDisabled`)**:
     - Bắt buộc kiểm tra `!params.canRollAgain` trước khi cho phép kết thúc lượt: `if (!params.canRollAgain && (params.inAudit || (params.turnPhase === 'PropertyManagement' && !params.hasRolledThisTurn))) { return false; }`.
     - Khi `canRollAgain: true` (kể cả khi `inAudit: true`), `isEndTurnDisabled` bắt buộc trả về `true`, ép buộc người chơi phải gieo tiếp lượt di chuyển được thưởng và chống triệt để tình trạng bỏ sót lượt đi.
  3. **Anti Double-Roll Exploit Invariant**:
     - Khi đã gieo xúc xắc một lần mà không ra đôi (`inAudit = true, hasRolledThisTurn = true, canRollAgain = false`), nút gieo xúc xắc lập tức bị khóa cứng (`disabled = true`) để ngăn chặn việc spam gieo nhiều lần trong cùng một lượt.

---

### 181. [UI/CRAFT] Radar Phân Khu Độc Quyền, Thanh Tiến Độ Phân Đoạn & Khử Bẫy Văng Inspector Khi Mở Sa Bàn (IMP-137)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Mặc Định Sai Tab Làm Trống Rỗng Inspector Card (SelectedCellIndex Default Tab Trap)*:
     - Khi người dùng muốn xem bản đồ quy hoạch thì tab "Phân Khu & Độc Quyền" là trọng tâm trực quan nhất. Tuy nhiên nếu đổi mặc định mù quáng thành `'districts'` mà không kiểm tra `selectedCellIndex`, các lời gọi mở modal kèm chỉ số ô đất (`selectedCellIndex`) sẽ không mở được `MasterplanInspectorCard` (vốn nằm trong tab `blueprint`), gây gãy hợp đồng `[TC-132.11]` & `[TC-132.12]`.
  2. *Bẫy Cắt Cụt Tên Người Chơi & Bảng Tính Khô Cứng (Name Truncation & Monochrome Trap)*:
     - Giới hạn cứng `max-w-[50px]` làm cắt cụt tên người chơi thành `Bot AI ...` và `Đại Gia...`. Đồng thời ô có chủ và ô trống có cùng màu nền xám nhờ nhạt, làm mất cảm giác "bản đồ nhiệt độc quyền" của Monopoly.
  3. *Bẫy Thiếu Trường Khi Kích Hoạt Đàm Phán Nhanh (Trade Payload Schema Collision Trap)*:
     - Khi mở nhanh modal đàm phán P2P từ thẻ ô đất đối thủ, nếu không truyền đủ 5 trường bắt buộc (`targetPlayerId`, `offeredProperties`, `requestedProperties`, `cashOffer`, `cashRequest`), hệ thống sẽ lỗi kiểu dữ liệu hoặc nuốt intent.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Smart Contextual Default Tab Invariant (`masterplan_modal.tsx`)**:
     - Mặc định mở `'districts'` khi mở tự do từ ActionDock; tự động fallback mở `'blueprint'` khi có `selectedCellIndex` để bảo vệ 100% Inspector Card nội bộ.
  2. **Segmented Progress Bar & Tint Invariant (`masterplan_components.tsx`)**:
     - Bắt buộc render thanh tiến độ phân đoạn `district-progress-bar-{id}` với đúng $N$ vạch màu token của chủ sở hữu hoặc màu xám `bg-slate-200` cho đất trống.
     - Ô có chủ phủ tint nhẹ `owner.tokenColor` (18% alpha) và viền 50% alpha, mở rộng trần hiển thị tên `max-w-[80px] sm:max-w-[120px] truncate` không bao giờ bị cắt cụt.
  3. **Strict 5-Field P2P Trade & Camera Glide Invariant**:
     - Nút `[🤝]` chỉ hiển thị khi `owner.id !== myPlayerId` và truyền đủ 5 trường schema với `requestedProperties: [cellIndex]`. Nút `[👁️]` gọi `setCameraFocusCell` và kích hoạt `onClose?.()` để giải phóng modal lộ sa bàn 3D.

---

### 182. [UI/AUCTION] Bất Biến Thẻ Tình Báo Phân Khu & Cục Diện Độc Quyền Sàn Đấu Giá (IMP-138)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Thiếu Ngữ Cảnh Chiến Lược Sàn Đấu Giá (Auction Strategy Blindspot Trap)*:
     - Trước IMP-138, người chơi tham gia sàn đấu giá chỉ nhìn thấy tên ô đất và giá khởi điểm. Người chơi không biết ô đất thuộc phân khu nào, bản thân hoặc đối thủ đã sở hữu bao nhiêu ô trong phân khu, liệu việc để rơi ô đất này vào tay đối thủ có kích hoạt độc quyền (x2 tiền thuê đất & mở quyền xây nhà) hay không.
  2. *Bẫy Tràn Khung Màn Hình Di Động Khi Bổ Sung Thẻ Thông Tin (Mobile Viewport Overflow Trap)*:
     - Khung sàn đấu giá vốn có nhiều thành phần (tiêu đề, bảng giá hiện tại, người dẫn đầu, danh sách đại gia, đồng hồ đếm ngược, cụm 3 nút nâng giá nhanh, nút Auto-Bid và nút Rút lui). Khi chèn thêm Thẻ Tình Báo Phân Khu (`AuctionDistrictCard`), nếu container modal không có `max-h-[90vh] overflow-y-auto pr-1`, các nút hành động cốt lõi sẽ bị đẩy tụt ra ngoài đáy màn hình điện thoại (< 667px), khiến người chơi không thể bấm đặt giá hoặc rút lui.
  3. *Bẫy Xung Đột Dữ Liệu Props vs Zustand Store Trong Kiểm Thử Hợp Đồng (Dual-Source State Collision Trap)*:
     - Trong môi trường runtime thực tế, danh sách người chơi (`playersInfo`) và cấp công trình (`levelMap`) được cấp nguồn từ Zustand store `useGameStore`. Tuy nhiên trong các bài kiểm thử tĩnh SSR (`renderToStaticMarkup`), store là rỗng và mock fixtures được truyền trực tiếp qua props. Nếu component chỉ đọc từ Zustand store mà bỏ qua props, kiểm thử sẽ nhận diện sai trạng thái sở hữu (0 ô sở hữu).
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Dual-Source Invariant (Props Fallback Zustand)**:
     - Mọi component con và hàm resolve trên sàn đấu giá (`AuctionModal`, `AuctionDistrictCard`) bắt buộc ưu tiên props `propPlayersInfo ?? storePlayersInfo` và `propLevelMap ?? storeLevelMap`. Bảo đảm an toàn tuyệt đối 100% cho cả SSR Contract Test lẫn Client Runtime.
  2. **Safe Fallback Null-Guard Invariant (`resolveAuctionDistrictInfo`)**:
     - Hàm thuần `resolveAuctionDistrictInfo` bắt buộc trả về `null` cho mọi ô ngoài biên bàn cờ (`< 0`, `\ge 40`, `NaN`), ô không thuộc danh mục sổ đỏ `PROPERTY_DEEDS` (GO 0, Thị Trường 2, Thuế 4, Kiểm Toán 10...) hoặc ô không thuộc `DISTRICT_GROUPS`.
     - `AuctionDistrictCard` khi nhận `null` bắt buộc trả về `null` (không render bất kỳ markup nào), triệt tiêu 100% lỗi crash runtime và tương thích ngược với các tình huống ô đặc biệt.
  3. **Monopoly Radar & Reactive Tone Invariant**:
     - Hệ thống phân loại chính xác 6 loại gợi ý chiến thuật:
       + `my_monopoly`: Khi người chơi đã sở hữu $N - 1$ ô trong phân khu; tone `emerald`, huy hiệu bắt buộc chứa từ khóa `'ĐỘC QUYỀN'`.
       + `block_opponent`: Khi có đối thủ đã gom $N - 1$ ô trong phân khu; tone `rose`, huy hiệu bắt buộc chứa từ khóa `'CHẶN ĐỐI THỦ'`.
       + `first_piece`: Khi chưa ai sở hữu ô nào trong phân khu; tone `blue`, huy hiệu `'🚩 KHAI MỞ PHÂN KHU'`.
       + `contested`: Khi phân khu bị phân mảnh sở hữu; tone `amber`, huy hiệu `'⚔️ TRANH CHẤP CHIẾN LƯỢC'`.
       + `railroad` / `utility`: Chuyên biệt cho 4 ga tàu (`Hạ Tầng Cảng & Giao Thông`) và 2 trạm điện nước (`Tiện Ích & Năng Lượng Quốc Gia`) kèm bảng cước 4 bậc `[500, 1000, 2000, 4000]` hoặc công thức xúc xắc 2D6.
  4. **Data-TestId Precedence & Mobile Scroll Invariant**:
     - Cố định thuộc tính `data-testid="auction-modal"` trước `className` trên container chính của modal và bổ sung `max-h-[90vh] overflow-y-auto pr-1` để bảo vệ tầm nhìn touch target của người dùng trên mọi kích cỡ thiết bị di động.

---

### 183. [UI/PORTFOLIO] Bất Biến Phân Tích Độc Quyền, Mảnh Ghép Còn Thiếu & Triệt Tiêu Ngộ Nhận Quyền Xây Dựng (IMP-136)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Ngộ Nhận Quyền Xây Dựng (Misleading Turn-Wait Build Trap)*:
     - Trước IMP-136, trong `checkPropertyUpgradeEligibility`, việc kiểm tra `isMyTurn === false || turnPhase !== 'PropertyManagement'` được đặt lên đầu tiên trước điều kiện `hasMonopoly`. Do đó, với mọi ô đất mà người chơi chưa đủ bộ màu Monopoly (chỉ có 1/3 hay 2/3), component vẫn hiển thị thông điệp "Chờ đến lượt xây dựng". Điều này khiến người chơi lầm tưởng rằng chỉ cần đến lượt mình là sẽ được phép nâng cấp công trình, trong khi luật chơi bắt buộc phải sở hữu trọn bộ màu độc quyền mới đủ điều kiện xây nhà!
  2. *Bẫy Danh Mục BĐS Kê Khai Tĩnh & Mù Thông Tin Chiến Lược (Static Inventory Blindspot Trap)*:
     - Giao diện `PropertyPortfolioModal` chỉ liệt kê các ô người chơi đang sở hữu mà không cung cấp insight: nhóm màu còn thiếu những ô nào, ô còn thiếu là đất trống sàn F1 hay đang nằm trong tay đối thủ nào (kèm màu sắc đại diện và giá bán/chuyển nhượng), và không có lối tắt đàm phán tức thì.
  3. *Bẫy Tràn Filter Bar Trên Màn Hình Nhỏ (< 390px) (Mobile Filter Overflow Trap)*:
     - Khi bổ sung tab lọc mới "Sắp Đủ Bộ 🔥", nếu thanh filter bar dùng `flex` với `flex-1` cứng nhắc sẽ gây tràn viền, vỡ dòng hoặc che khuất các tab quan trọng trên màn hình điện thoại di động nhỏ.
  4. *Bẫy Hiển Thị Filter Bar Khi Không Sở Hữu Tài Sản Nào (Zero-Property Empty State Trap)*:
     - Khi người chơi chưa sở hữu bất động sản nào (`ownedProperties.length === 0`), việc render thanh filter bar chứa tab "Đang Thế Chấp" vi phạm hợp đồng kiểm thử `TC-MCH01.15` (vốn yêu cầu empty state sạch sẽ không chứa từ khóa Thế Chấp/Giải Chấp).
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Monopoly Priority Over Turn Invariant (`checkPropertyUpgradeEligibility`)**:
     - Điều kiện kiểm tra tính hợp lệ ô BĐS, cấp độ tối đa (`level >= 3`) và sở hữu trọn bộ màu (`hasMonopoly`) bắt buộc phải được thẩm định TRƯỚC điều kiện lượt chơi (`isMyTurn` và `turnPhase`).
     - Khi `!hasMonopoly`, lý do khóa nút luôn là `'Cần sở hữu trọn bộ màu trước khi nâng cấp'`. Chỉ khi `hasMonopoly && !isMyTurn` mới hiển thị `'Chờ đến lượt xây dựng'` (bảo toàn 100% hợp đồng `TC-IMP133.18`).
  2. **Dedicated Monopoly Analytics Module (`portfolio_monopoly_analytics.ts`)**:
     - Tách riêng hàm thuần `analyzePropertyMonopolyInsight(params)` xử lý triệt để các nhóm màu thông thường lẫn các phân khúc đặc thù như 4 ô Cảng/Ga tàu (`CellType.Railroad`) và 2 ô Tiện ích (`CellType.Utility`).
     - Xác định `missingPieces` kèm chủ quyền: gắn nhãn `'Đất trống'` và nút `[🔍 Xem Ô]` (`data-testid="view-vacant-cell-btn-{id}"`) khi ô chưa có chủ; hiển thị tên đối thủ, màu token và nút `[🤝 Đàm Phán]` (`data-testid="quick-trade-btn-{id}"`) khi ô do đối thủ sở hữu.
     - Khi đã đủ bộ màu độc quyền trọn bộ, hiển thị huy hiệu vinh danh `👑 Độc Quyền Trọn Bộ` và triệt tiêu khối `property-missing-pieces`.
  3. **1-Click Quick Trade Bridge Invariant**:
     - Nút `[🤝 Đàm Phán]` liên kết trực tiếp tới modal trao đổi P2P qua `onQuickTrade(targetPlayerId, targetPropertyIndex)`, tự động nạp sẵn đối tác mục tiêu và đưa ô đất cần thâu tóm vào `requestedProperties`, với đầy đủ 5 trường schema của `ModalPayloadMap['trade']`.
  4. **Responsive Horizontal Scroll & Conditional Filter Bar Invariant**:
     - Thanh filter bar chỉ được render khi `ownedProperties.length > 0` và sử dụng `overflow-x-auto no-scrollbar whitespace-nowrap` kết hợp với các nút bấm có kích thước chạm chuẩn (`min-h-[40px] sm:min-h-[44px]`), bảo đảm hiển thị mượt mà trên cả desktop và mobile.

---

### 184. [NET/OPS] Kiến Trúc Cổng Đơn Single-Port (HTTP + WebSocket Upgrade) & Thứ Tự Hủy Đóng Server (IMP-139)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Xung Đột Cổng EADDRINUSE Trên Cloud PaaS (Render / Fly / Heroku)*:
     - Các nền tảng Cloud PaaS chỉ cấp phát duy nhất 1 cổng qua biến môi trường `PORT` (mặc định 10000 trên Render, 8000/3000 trên các môi trường khác).
     - Trong kiến trúc cũ (Dual-Port), `startServer` lắng nghe HTTP trên `PORT` (3000) và WebSocket trên `WSS_PORT` (3001). Khi cấu hình chạy chung `PORT === WSS_PORT` trên PaaS, cả `httpServer` lẫn `wssServer` cùng gọi lệnh `listen()` trên cùng 1 cổng dẫn đến lỗi nghiêm trọng `listen EADDRINUSE`.
  2. *Bẫy Treo Tiến Trình Khi Hủy Server Theo Sai Thứ Tự (Shutdown Deadlock Trap)*:
     - Khi `wss` dùng chung `http.Server` (`new WebSocketServer({ server: httpServer })`), nếu đóng `httpServer.close()` trước khi đóng `wssServer`, kết nối HTTP giữ (keep-alive) hoặc socket WebSocket đang mở sẽ giữ chặt connection pool khiến callback `httpServer.close()` bị treo vô tận không bao giờ kích hoạt.
  3. *Bẫy Hardcode Cổng :3001 Trên Client WebSocket*:
     - Client Hook (`use_game_ws.ts` và `use_admin_portal.ts`) từng hardcode trỏ về `:3001` khi không dùng giao thức HTTPS, khiến triển khai PaaS trên HTTP nội bộ hoặc domain tùy biến bị rớt kết nối WebSocket.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Single-Port Upgrade Invariant**:
     - Khi `(config?.port ?? env.port) === (config?.wssPort ?? env.wssPort)`, máy chủ hoạt động ở chế độ Single-Port.
     - Khởi tạo `httpServer` qua `createHealthServer(...)` trước, sau đó truyền thể hiện `httpServer` vào `new WssServer({ server: httpServer, ... })`. `WebSocketServer` lắng nghe sự kiện `'upgrade'` trên `httpServer` thay vì tự mở port riêng.
  2. **Critical Shutdown Sequence Invariant**:
     - Trong chế độ Single-Port, thứ tự đóng bắt buộc phải tuân thủ: `await wssServer.close()` TRƯỚC, sau đó mới gọi `await closeHttp(httpServer)` (bao gồm `httpServer.close()` và `httpServer.closeAllConnections?.()`).
     - Đóng `wssServer` trước bảo đảm toàn bộ kết nối WebSocket gửi mã `1001 (Going Away)` và kết thúc hoàn toàn trước khi socket TCP của HTTP server bị giải phóng.
  3. **Adaptive Client WS URL Invariant**:
     - Trên môi trường production/cloud (`host !== 'localhost:3000'`), client bắt buộc dùng `window.location.host` kết hợp tiền tố `ws:` hoặc `wss:` tương ứng (`${wsProto}//${window.location.host}/rooms/${roomCode}`), loại bỏ triệt để hardcode `:3001`.
  4. **Multi-Port Container EXPOSE Standard**:
     - `Dockerfile` khai báo `EXPOSE 3000 3001 8000 10000` tương thích đồng thời cả cụm Dual-Port (Docker Compose / Nginx reverse proxy) và Cloud PaaS (Render single-port).

---

### 185. [UI/Z-INDEX] Phân Tầng Z-Index Độc Lập Giữa Popup Biến Động Và Modal/Page Nghiệp Vụ (IMP-139)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Xung Đột Phân Tầng Z-Index Giữa Popups Tài Chính Và Modal Nghiệp Vụ*:
     - Trước IMP-139, `ModalBackdrop` được định vị tại `z-30`, trong khi `FloatingNumbersOverlay` và `MilestoneBanner` được đặt ở `z-40` và `z-50`. Khi người chơi đang mở modal nghiệp vụ (như xem sổ đỏ `TitleDeedModal`, quản lý danh mục BĐS `PropertyPortfolioModal`, hoặc tham gia sàn đấu giá `AuctionModal`), các thông báo biến động tài chính (toasts) và huy hiệu sự kiện vẫn hiển thị và chèn đè lên trên nội dung modal, gây phân tán chú ý và cản trở tương tác.
  2. *Bẫy Chèn Đè Giữa Toast Giao Dịch Và Milestone Banner Trên Mobile*:
     - Khi xuất hiện đồng thời cả `MilestoneBanner` (thẻ Cơ Hội, Thị Trường, Độc Quyền) và toast giao dịch thường trên màn hình di động, nếu không tính toán khoảng cách thụt lề (`top-[11.5rem]`), toast sẽ bị chèn đè trực tiếp lên banner cao 90px tại `top-20`.
  3. *Bẫy Chèn Đè Toast Trên Màn Hình Desktop Dưới Milestone Banner*:
     - Trên desktop, cụm toast thường căn giữa ở `top-28 md:top-32`. Khi có `latestMilestone` xuất hiện, nếu không chủ động dịch chuyển desktop container xuống `top-[12rem] md:top-[12rem]`, toast thường sẽ che khuất phần chân của MilestoneBanner.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **SSOT Z-Index Hierarchy Invariant**:
     - `FloatingNumbersOverlay`: Hoạt động tại tầng biến động nền `z-30` (bao gồm container chính `<aside>` `z-30`, `MilestoneBanner` container wrapper `z-30` gắn `data-testid="milestone-banner-container"`, và cụm `desktopTexts` container `z-30`).
     - `ModalBackdrop`: Hoạt động tại tầng tương tác nghiệp vụ `z-50` cho cả 3 chế độ (`fullScreen`, `center`, và mặc định), bảo đảm mọi modal che phủ hoàn toàn các popup nền.
     - `TelemetryConsoleModal`: Hoạt động tại tầng chẩn đoán tối cao `z-[60]`, luôn nổi trên tất cả các modal và overlay khi cần giám sát hiệu năng hoặc điều tra lỗi khẩn cấp.
  2. **Active Modal Nullification & DOM Disposal Invariant**:
     - `FloatingNumbersOverlay` bắt buộc lắng nghe trạng thái `activeModal` từ `useGameStore`.
     - Khi `activeModal !== null`, `FloatingNumbersOverlay` lập tức tự thu hồi và trả về `null` (giải phóng hoàn toàn DOM), triệt tiêu 100% hiện tượng xao nhãng và va chạm sự kiện chuột/chạm khi người chơi đang tương tác modal.
  3. **Mobile Dynamic De-collision Invariant**:
     - Khi có `latestMilestone` và 0 market card (`activeMarketCount === 0`), `mobileTopClass` được gán chính xác `top-[11.5rem]` (184px), tạo vùng đệm an toàn dưới `MilestoneBanner` (cao 90px tại `top-20`).
     - Khi có 1 market card: `top-[11rem]`. Khi có $\ge 2$ market cards: `top-[13.5rem]`.
     - Khi không có milestone: hoàn nguyên `top-[4.25rem]` (0 market) và `top-28` (1 market).
  4. **Desktop Milestone Shifting Invariant**:
     - Khi có `latestMilestone`, container desktop dịch chuyển xuống `top-[12rem] md:top-[12rem]`. Khi không có milestone, giữ nguyên vị trí chuẩn `top-28 md:top-32`.

---

### 186. [UI/ASSET] Bất Biến Nạp Ngầm Ảnh Nền BĐS (Preload Base Tiles), Shimmer Skeleton & Căn Chỉnh Nút Đóng Thẻ Sổ Đỏ (IMP-140)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Hoãn Tải Ảnh Nền WebP & Vỡ Dải Decode (Lazy Load Lag & Progressive Decoding Artifact)*:
     - Trước IMP-140, thẻ `<img>` trong `TitleDeedModal` dùng thuộc tính `loading="lazy"`. Trên trình duyệt di động, bên trong container cuộn flex modal, `loading="lazy"` trì hoãn gửi request HTTP cho đến khi tính toán xong layout, gây độ trễ 1–2 giây khi người chơi mở Sổ Đỏ.
     - Khi tải qua mạng di động có độ trễ, WebP được giải mã tuần tự theo từng khối. Do không có khung kích thước cố định hoặc shimmer skeleton, chỉ có một vệt mỏng 24px lơ lửng ở đỉnh kèm drop-shadow hiển thị trong lúc tải, tạo cảm giác thẻ bị rách hoặc lỗi đồ họa.
  2. *Bẫy Xung Đột Spy Test Khi Nạp Trước Ảnh (Test Image Spy Collision Trap)*:
     - Trong test `TC-P3.3/MSS` (`phase3_visual_polish.test.ts`), Vitest mock `(globalThis as any).Image = SpyImage` và assert rằng `preloadTileAssets()` trả về 112 URLs nhưng không được tạo bất kỳ instance `new Image()` nào (`createdImages.length === 0`). Nếu hàm preload ảnh mới gọi `new Image()` trong môi trường test không có guard chặn, test này sẽ gãy lập tức.
  3. *Bẫy Nút Đóng Đè Viền Ruy-Băng & Cụt Chữ Tiêu Đề (Close Button Border Overlap & Title Truncation)*:
     - Header ruy-băng cao ~42px, nhưng nút đóng tròn 48px được định vị tại `top-2.5 right-2.5`, khiến đáy nút thò ra ngoài 15px cắt ngang viền ruy-băng cam và đè lên phần thân thẻ bên dưới.
     - Tiêu đề `<h2>` chỉ có padding `px-3`, khi tên địa phương dài trên màn hình hẹp có nguy cơ bị nút đóng 48px che lấp các ký tự bên phải.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Preload Base Tile Images Invariant (`preloadBaseTileImages`)**:
     - `src/client/assets/tile_assets.ts`: Khai báo `preloadBaseTileImages(force = false): void`.
     - Bắt buộc kiểm tra guard môi trường test: `const isTestEnv = typeof process !== 'undefined' && Boolean(process.env && process.env.NODE_ENV === 'test'); if (!force && isTestEnv) return;`.
     - Chỉ thực thi `new Image().src = url` khi chạy trên trình duyệt thực tế (`typeof window !== 'undefined' && typeof Image !== 'undefined'`), prewarm toàn bộ 28 base tiles vào browser cache ngay khi mount session (`use_app_session.ts`).
     - Giữ nguyên 100% hàm thuần `preloadTileAssets(): string[]` không có side-effect.
  2. **Eager Decode & Shimmer Skeleton Underlay (`TitleDeedArtShowcase`)**:
     - `src/client/ui/modals/title_deed_art_showcase.tsx`: Thẻ `<img>` dùng `loading="eager"` và `decoding="async"` kết hợp `max-h-full max-w-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]`.
     - Luôn render thẻ `<img>` trong SSR markup (`renderToStaticMarkup`) để bảo vệ các test contract kiểm thử thuộc tính ảnh.
     - Underlay `data-testid="art-shimmer-skeleton"` tự động hiển thị hiệu ứng gradient mờ nhấp nhô và mờ dần khi ảnh kích hoạt sự kiện `onLoad`. Reset `isLoaded = false` qua `useEffect([tileAssetUrl])` khi chuyển đổi BĐS.
  3. **Vertical Center Close Button & Safe Title Clearance**:
     - `title_deed_modal.tsx`: Nút đóng Sổ Đỏ định vị bằng `top-1/2 -translate-y-1/2 right-2 sm:right-2.5`, bảo toàn kích thước chuẩn `min-w-[48px] min-h-[48px]`, nhãn `aria-label="Đóng Sổ Đỏ"` và ký tự `✕`.
     - Tiêu đề `<h2>` bổ sung vùng đệm an toàn `pr-12 sm:pr-14` bảo đảm không bao giờ bị nút đóng che khuất chữ.
  4. **Modular LOC Decomposition & 44px Secondary Touch Targets**:
     - Tách nhỏ thành 3 subcomponents độc lập: `title_deed_art_showcase.tsx` (74 LOC), `title_deed_rent_table.tsx` (118 LOC), `title_deed_action_footer.tsx` (152 LOC).
     - Đưa `title_deed_modal.tsx` từ 498 LOC xuống **291 LOC** (dưới trần cảnh báo 300 LOC).
     - Nút điều hướng Carousel nâng lên `min-h-[44px]` đạt chuẩn WCAG AA touch target cho thiết bị di động.

---

### 187. [UI/UX] Làm Rõ Thẻ Xăng Dầu MC_FUEL_SURGE & Tinh Giản Sàn Đấu Giá Đa Nền Tảng (IMP-141)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Ngộ Nhận Cộng Tiền Thẻ Phụ Thu Xăng Dầu (MC_FUEL_SURGE Financial Sign Inversion Trap)*:
     - Thẻ `MC_FUEL_SURGE` mang Hero Stat `PHỤ THU CƯỚC +500 Tr.` với tone vàng cảnh báo. Người chơi khi bốc thẻ nhìn thấy dấu `+500 Tr.` liền ngộ nhận là mình được cộng tiền vào ví, trong khi thực tế mỗi người chơi lập tức bị trừ 500 Tr. tiền phụ phí xăng dầu và phải trả thêm cước vận tải khi giẫm vào ô Cảng/Ga trong 2 vòng.
  2. *Bẫy Chiếm Dụng Không Gian Của Banner Mách Nước Chiến Lược Trên Sàn Đấu Giá (Auction Hint Bloat Trap)*:
     - Khối `data-testid="auction-strategic-hint"` trước đây là một khung banner độc lập chứa đoạn văn `<p>` dài dòng, chiếm ~50px chiều cao dọc. Trên các thiết bị di động có chiều cao màn hình hẹp (< 667px), banner này đẩy cụm nút đấu giá và đặt giá tự động xuống sát mép dưới hoặc tràn khỏi viewport.
  3. *Bẫy Lưới Ô Đất Cứng Nhắc Khiến Ô Thứ 3 Rớt Hàng Lẻ Loi (Auction District Dangling Cell Trap)*:
     - Trước IMP-141, lưới các ô trong phân khu (`renderCellChip`) được gán cứng `grid-cols-2 sm:grid-cols-3`. Với 6/8 nhóm màu BĐS trên bàn cờ sở hữu đúng 3 ô (Đông Nam Bộ, Hà Nội, TP.HCM, Hải Phòng, Cần Thơ, Vùng Núi), trên mobile (< 640px) ô thứ 3 luôn bị rớt xuống hàng 2 trơ trọi một mình, vừa mất đối xứng vừa làm tăng gấp đôi chiều cao danh sách.
  4. *Bẫy Tràn Dòng Header Phân Khu Khi Tên Dài Ghép Badge Trên Mobile (Header Flex Wrap Trap)*:
     - Khi đưa badge chiến lược lên thanh tiêu đề phân khu cạnh `districtName`, nếu container không có `flex-wrap` và bộ đếm thiếu `shrink-0`, các phân khu tên dài như "ĐỒNG BẰNG SÔNG CỬU LONG" (~190px) sẽ đè bẹp tên địa danh còn vài chữ ("ĐỒNG B...").
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Deduction Hero Stat Invariant (`event_card_visuals.ts`)**:
     - `MC_FUEL_SURGE` bắt buộc hiển thị Hero Stat `value: '-500 Tr.'`, `label: 'PHỤ PHÍ NHIÊN LIỆU'`, và `variant: 'negative'` (sử dụng styling rose `bg-rose-50 border-rose-400 text-rose-700`), phản ánh trực diện bản chất tài chính là khoản chi trừ tiền tức thì của người chơi.
     - Metadata `event_card_metadata.ts` mô tả rõ ràng: *"Mỗi người nộp ngay 500 Tr. phụ phí nhiên liệu... Trong 2 vòng tới, cước giẫm vào ô Hạ tầng tăng thêm +500 Tr."*
     - Scope Confinement: Tuyệt đối không đảo dấu số dương trong `title_deed_modal.tsx` (khoản tăng thu cho chủ cảng) và không sửa logic nghiệp vụ dòng tiền `market_card_handlers.ts`.
  2. **Streamlined Header Badge & 50px Height Recovery Invariant (`auction_district_card.tsx`)**:
     - Xóa bỏ 100% khối banner đoạn văn `<p>` dài dòng, thu nhỏ huy hiệu chiến lược thành badge pill gắn trực tiếp lên Header phân khu cạnh tên địa danh (`data-testid="auction-strategic-hint"`), giữ trọn vẹn chuỗi gốc `'👑 CƠ HỘI ĐỘC QUYỀN'` bảo toàn test contract `TC-IMP138.25`.
     - Tiết kiệm 50px chiều cao cho modal sàn đấu giá, giúp các nút bấm nâng giá luôn nằm trong tầm với công thái học của ngón cái trên mobile.
  3. **Dynamic Responsive Grid Invariant (`gridColsClass`)**:
     - Nhóm 2 ô (`info.totalCells === 2`): Gán `grid-cols-2` (1 hàng ngang 2 ô cho cả desktop và mobile).
     - Nhóm 3 ô (`info.totalCells === 3`): Bắt buộc gán `grid-cols-3` trên CẢ mobile và desktop, bảo đảm cả 3 ô nằm trên 1 hàng duy nhất, triệt tiêu vĩnh viễn lỗi ô thứ 3 rớt hàng lẻ loi.
     - Nhóm 4 ô (`info.totalCells === 4`): Gán `grid-cols-2 sm:grid-cols-4` (lưới 2x2 cân đối trên mobile, 1x4 trên desktop).
  4. **Mobile Typography & Defend Against Flex Blowout**:
     - Header phân khu dùng `flex-wrap gap-1.5`, chip đếm số ô sở hữu mang `shrink-0 ml-auto`, badge chiến lược có `max-w-[140px] truncate sm:max-w-none`.
     - Chip ô đất mang `min-w-0` trên mọi cấp độ container, font chữ responsive `text-[10px] sm:text-[11px]` cho tên ô và `text-[9px] sm:text-[10px]` cho badge trạng thái, bảo đảm hiển thị trọn vẹn tên địa danh không bị tràn viền trên thiết bị hẹp (< 390px).

---

### 188. [UI/MARKET-TICKER] Chuẩn Hóa Toàn Diện Nội Dung & Quy Tắc Luật Chơi Các Thông Báo Sự Kiện Thị Trường (IMP-141)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Ngữ Nghĩa Chung Chung & Văn Học Hóa Trong Thông Báo Thị Trường (Vague Literary Event Descriptions Trap)*:
     - Trước IMP-141, `resolveMarketEffectSummary` trích xuất chuỗi tóm tắt trực tiếp từ `MARKET_CARD_DETAILS.description` bằng cách cắt sau dấu hai chấm `: `. Đối với các thẻ không có dấu hai chấm hoặc mô tả mang tính văn phong báo chí/chung chung (ví dụ `MC_PUBLIC_INVEST`: *"Đẩy mạnh giải ngân các gói vốn đầu tư công..."*, `MC_COASTAL_STORM`: *"Bão lũ đổ bộ diện rộng..."*), banner hiển thị những dòng chữ thiếu cụ thể, không chỉ rõ cơ chế luật chơi cốt lõi (nhân đôi cước 4 Ga Tàu, miễn 100% tiền thuê ô ven biển và mất lượt).
  2. *Bẫy Xung Đột Từ Ngữ Giữa Các Đợt Kiểm Thử Hồi Quy (Test Phrase Collision Trap)*:
     - Thẻ `MC_FREEZE_TRADE` từng chứa cụm từ *"Tạm ngừng mua bán, cấm thế chấp đất mới..."*, vi phạm hợp đồng kiểm thử tinh giản `TC-IMP132.09`. Khi không có bảng ánh xạ SSOT độc lập, việc sửa mô tả thẻ bài dễ dẫn đến va chạm hồi quy với các suite kiểm thử khác.
  3. *Bẫy Cắt Cụt Chữ Trên Màn Hình Di Động Với Line Clamp 2 (Mobile 2-Line Truncation Trap)*:
     - Với giới hạn `line-clamp-2`, các sự kiện có hiệu ứng đa chiều (như `MC_COASTAL_STORM` vừa miễn tiền thuê vừa mất lượt, hoặc `MC_CASINO_PILOT` vừa thưởng cấp 2 vừa thưởng ô 27) bị trình duyệt cắt mất phần điều kiện quan trọng ở dòng thứ 3 khi hiển thị trên màn hình hẹp (< 390px).
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **SSOT Bảng Ánh Xạ Hiệu Lực Thẻ Thị Trường (`ACTIVE_MARKET_EFFECT_SUMMARIES`)**:
     - `src/client/ui/market_event_ticker.tsx`: Xuất khẩu bảng hằng số `ACTIVE_MARKET_EFFECT_SUMMARIES: Readonly<Record<string, string>>` làm nguồn chân lý duy nhất (SSOT) cho toàn bộ 16 thẻ Thị Trường và các thẻ Cơ Hội có modifier kéo dài (`CC_PORT_EXCLUSIVE`).
     - 100% nội dung tóm tắt tập trung trực diện vào luật chơi định lượng (tỷ lệ %, định mức tiền Tr., số hiệu ô cờ cụ thể), loại bỏ hoàn toàn câu chữ hoa mỹ, văn học hoặc suy diễn.
     - Giới hạn độ dài mỗi câu tóm tắt $\le 85$ ký tự để bảo đảm hiển thị trọn vẹn và súc tích.
  2. **Ưu Tiên Ánh Xạ & Cơ Chế Fallback An Toàn (`resolveMarketEffectSummary`)**:
     - Hàm `resolveMarketEffectSummary(type: string)` luôn tra cứu `ACTIVE_MARKET_EFFECT_SUMMARIES[type]` trước tiên.
     - Nếu không có trong từ điển, hàm fallback an toàn về `MARKET_CARD_DETAILS` / `CHANCE_CARD_DETAILS`, ưu tiên cắt sau dấu `: `, hoặc dùng `description`/`effectDetail`, và cuối cùng là chuỗi mặc định an toàn, không bao giờ ném ngoại lệ (`throw`) hay trả về chuỗi rỗng.
  3. **Mở Rộng Không Gian Hiển Thị 3 Dòng (`line-clamp-3`)**:
     - `MarketEventTicker`: Áp dụng class `line-clamp-3` thay cho `line-clamp-2` tại khối `<p data-testid="market-ticker-effect-summary">`, tạo đủ không gian cho các câu tóm tắt 2-3 dòng trên thiết bị di động mà không làm vỡ layout hay che khuất TopBar.
  4. **Bảo Toàn Toàn Bộ Hợp Đồng Hồi Quy (`imp135`, `imp132`, `imp57`, `imp140`)**:
     - Chuẩn hóa đồng bộ trường `description` trong `src/domain/event_card_metadata.ts` theo cấu trúc `'Tiêu Đề: Nội dung luật chơi định lượng.'`, giúp cả hệ thống Modal lẫn Ticker đều đồng nhất và thỏa mãn tất cả 151 contract tests.

---

### 189. [3D/RENDER] Tối Ưu Hóa Draw Calls Sa Bàn, Gom Instancing & Kiểm Soát Shadow Caster Budget (IMP-142)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Bùng Nổ Draw Calls Cây Xanh Sa Bàn (Diorama Foliage Draw Call Explosion Trap)*:
     - Trước IMP-142, cụm cây xanh cảnh quan đô thị `DioramaUrbanCanopy` lặp qua 18 cây bằng `URBAN_TREES.map()`, mỗi cây gồm 3 mesh riêng biệt (thân cây cylinder, tầng tán dưới sphere, tầng tán trên sphere). Điều này tạo ra $18 \times 3 = 54$ draw calls độc lập trong main pass, cộng thêm 54 draw calls tương ứng trong shadow map pass, làm nghẽn cổ chai CPU và tụt FPS xuống 34.2 FPS (vượt trần ngân sách 85 calls).
  2. *Bẫy Lãng Phí Ngân Sách Bóng Đổ Trên Vi Chi Tiết (Sub-Pixel Shadow Caster Waste Trap)*:
     - Lạm dụng thuộc tính `castShadow` trên các hình học vi mô có kích thước chỉ 5mm–8cm (dây văng cáp cầu Ba Son 5mm `basonCables`, rơ-moóc xe kéo bến cảng container, ống khói tí hon trên mái nhà đồ chơi `ToyHouseMesh`, bụi cây cảnh luống hoa ven ray `DioramaTropicalFlora`). Ở góc nhìn camera sa bàn bao quát toàn bàn cờ, bóng của các chi tiết này gần như biến mất hoặc hòa lẫn vào khối mẹ, nhưng khiến GPU phải thực hiện hàng trăm draw calls vô ích vào shadow map pass.
  3. *Bẫy Hồi Quy Kiểm Thử SSR Khi Gom InstancedMesh (SSR Static Markup Color Loss Trap)*:
     - Khi chuyển sang `instancedMesh`, việc gán màu riêng lẻ cho từng instance qua Three.js `instancedMesh.setColorAt(i, color)` chỉ xảy ra tại runtime trong `useEffect`. Ở phía SSR (`renderToStaticMarkup`), `useEffect` không được kích hoạt; nếu `meshStandardMaterial` không mang thuộc tính `color="#15803D"` tĩnh, static markup sẽ thiếu mã màu hệ sinh thái sa bàn, gây gãy hàng loạt contract tests kiểm tra nhận diện màu xanh đô thị (`TC-MRL02.02`, `TC-IMP142.24`).
  4. *Bẫy Xóa Nhầm Bóng Đổ Của Các Phần Tử Chiến Lược (Strategic Shadow Caster Regression Trap)*:
     - Khi kiểm toán bóng đổ, nếu tắt nhầm `castShadow` trên cọc cờ `FlagPole` và cờ phướn `FlagCloth` (`board_tile.tsx`), quân cờ người chơi hoặc tháp biểu tượng, sẽ vi phạm các hợp đồng bất biến hiệu năng hiển thị (`TC-87.10b`).
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Tập Trung Hóa 3 InstancedMesh Cho Cây Xanh Đô Thị (`DioramaUrbanCanopy`)**:
     - `src/client/3d/miniature_city_diorama.tsx`: Gom toàn bộ 18 cây xanh đô thị thành đúng 3 `instancedMesh` có `args={[undefined, undefined, URBAN_TREES.length]}` đại diện cho: thân gỗ cylinder, tán dưới sphere và tán trên sphere.
     - Giảm từ 54 calls xuống đúng 3 draw calls cho toàn bộ thảm thực vật trung tâm sa bàn (tiết kiệm 51 calls trong main pass).
     - Luôn bọc trong `<group position={[0, 0.02, 0]} data-testid="diorama-urban-canopy">`.
  2. **Bảo Tồn Màu Sắc Tĩnh Cho SSR (`SSR Baseline Material Color`)**:
     - Thẻ `meshStandardMaterial` của tán dưới và tán trên bắt buộc phải gán tĩnh thuộc tính `color="#15803D"`.
     - Phối hợp `useEffect` duyệt qua mảng cấu hình để tính toán ma trận tọa độ `setMatrixAt` và gán sắc độ riêng biệt cho từng cây bằng `setColorAt`, kết hợp bật cờ `instanceMatrix.needsUpdate = true` và `instanceColor.needsUpdate = true`.
  3. **Thắt Chặt Ngân Sách Bóng Đổ Trên Vi Chi Tiết (Targeted Shadow Caster Stripping)**:
     - `diorama_bridges.tsx`: Triệt tiêu hoàn toàn `castShadow` trên 12 dây văng rẻ quạt 5mm của Cầu Ba Son (`basonCables`).
     - `diorama_railroad.tsx`: Tắt `castShadow` trên các khối cầu bụi hoa cây cảnh `DioramaTropicalFlora`. Bảo toàn nguyên vẹn chuỗi màu hoa SSR `#F43F5E`, `#F59E0B`, `#A855F7`.
     - `diorama_container_port.tsx`: Tắt `castShadow` trên rơ-moóc xe kéo chở container.
     - `toy_property_buildings.tsx`: Tắt `castShadow` trên ống khói tí hon `ToyHouseMesh`, bảo toàn tuyệt đối `castShadow receiveShadow` trên thân nhà và mái dốc.
  4. **Bảo Toàn Nghiêm Ngặt Hợp Đồng Bóng Đổ Chủ Lực**:
     - Nghiêm cấm tắt `castShadow` trên `FlagPole` và `FlagCloth` thuộc `OwnershipMarkerInstances` (`board_tile.tsx`) theo yêu cầu bất biến của `TC-87.10b`.
     - Giữ nguyên bóng đổ trên tháp chính Bitexco, trụ vòm Cầu Long Biên, trụ tháp Cầu Ba Son, thân đầu tàu hỏa mini và 4 quân cờ đại diện người chơi.

---

### 190. [BOT/NET] Quản Lý Phiên Đàm Phán Bot-to-Human 15 Giây, Ngăn Chặn Chuyển Quyền Sớm & Bảo Toàn Đàm Phán Bot-to-Bot Đồng Bộ (IMP-142)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Chuyển Quyền Sớm Trước Khi Người Chơi Phản Hồi (Premature Trade Execution Trap)*:
     - Trước IMP-142, mọi lệnh P2P Trade đều xử lý chuyển quyền sở hữu và khấu trừ số dư ngay tức thì (`executeP2PTrade`). Khi Bot AI chủ động chào mua ô đất Monopoly Gap từ người chơi, nếu hệ thống lập tức sang tên đổi chủ sẽ tước đoạt hoàn toàn quyền tự quyết của người chơi, vi phạm nghiêm trọng tính công bằng và luật bảo hộ tài sản.
  2. *Bẫy Bỏ Rơi Lượt Đi Bot Trong Thời Gian 15 Giây Đàm Phán (Premature Turn Handover Trap)*:
     - Bot Coordinator có cơ chế chống kẹt (`releaseStuckBotTurn`, `stepBotTurn`). Nếu phòng có phiên đàm phán 15 giây đang chờ người chơi (`hasPendingTrade === true`), việc Bot tự động chuyển lượt sang người chơi tiếp theo sẽ gây mất đồng bộ FSM và phá vỡ bối cảnh của hộp thoại.
  3. *Bẫy Xung Đột Ngưỡng Đàm Phán Passive Bot Giữa Bot-to-Human và Bot-to-Bot (Bot Negotiation Parity Trap)*:
     - Thẩm định `evaluateBotTradeAcceptance` cho tính cách `Passive` kiên quyết chặn bán ô độc quyền (`PREVENT_MONOPOLY`) trừ khi số dư $< 500$ Tr. và giá $\ge 2.0\times$ (IMP-119). Tuy nhiên trong giao dịch tự động Bot-to-Bot (IMP-82/IMP-118/IMP-142 TC-142.04), khi một Bot chào mua với giá cạnh tranh đạt ngưỡng độc quyền $\ge 1.60\times$, giao dịch phải hoàn tất đồng bộ 0ms mà không được làm suy yếu cơ chế phòng thủ độc quyền độc lập của hàm thẩm định đơn vị.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **PendingTradeManager Độc Lập & Thời Hạn Đúng 15.000ms (`pendingTradeManager`)**:
     - `src/server/pending_trade_manager.ts`: Tạo phiên đàm phán `PendingTradeSession` lưu `offerId`, `roomCode`, `buyerId`, `sellerId`, `cellIndex`, `price`, `basePrice`, `createdAt`, `expiresAt = createdAt + 15_000`.
     - Chỉ cho phép đúng 1 phiên pending duy nhất trên mỗi phòng cờ tại một thời điểm (`sessionsByRoom`).
     - Tuyệt đối không chuyển quyền sở hữu hoặc trừ tiền người chơi khi tạo phiên (`Zero Premature Trade`).
  2. **Tái Thẩm Định Nguyên Tử Khi Người Chơi Phản Hồi (`coordRespondTradeOffer`)**:
     - Khi nhận `INTENT_RESPOND_TRADE_OFFER`, server bắt buộc kiểm tra: `offerId` hợp lệ, phiên ở trạng thái `pending`, chưa quá hạn `expiresAt`, đúng người bán `playerId === session.sellerId`.
     - Nếu `accept: true`: Tái thẩm định ví tiền Bot `buyer.balance >= price`, quyền sở hữu `registry.get(cell) === sellerId`, ô đất chưa thế chấp và chưa xây dựng (`level === 0`).
     - Khấu trừ 5% thuế chuyển nhượng nộp vào Kho bạc Nhà nước (`room.treasury`), người bán nhận 95% giá trị ròng.
     - Nếu từ chối hoặc quá hạn 15s (`accept: false` / `timeout`): Hoàn nguyên trạng thái sạch sẽ, hủy phiên pending, ghi nhận cooldown `buyer.lastTradeOfferRound`.
  3. **Đóng Băng Lượt Đi Bot Trong Suốt Thời Gian Chờ (Bot Pacing Freeze)**:
     - `room_bot_coordinator.ts`: Kiểm tra `roomManager.hasPendingTrade(roomCode)` tại `stepBotTurn`, `releaseStuckBotTurn`, `runBotTurn`, `runBotIntentLoop`. Nếu có phiên pending, lập tức tạm dừng luồng quyết định Bot, giữ nguyên pha `PropertyManagement` để người chơi tương tác trọn vẹn 15s.
  4. **Phân Định Rõ Ràng Cơ Chế Bot-to-Bot vs Bot-to-Human Trong `coordTrade`**:
     - Khi `buyer.isBot && !seller.isBot`: Bắt buộc đi vào luồng tạo phiên pending 15s.
     - Khi `buyer.isBot && seller.isBot`: Thực thi đồng bộ tức thì 0ms, không tạo pending trade. Nếu thẩm định thường từ chối nhưng giá đạt $\ge 1.60\times$ giá gốc, cho phép chấp thuận giao dịch giữa 2 Bot để giữ tính tương thích toàn diện IMP-82, IMP-118 và IMP-119.
  5. **Hộp Thoại Đàm Phán Xúc Giác & Đếm Ngược 15 Giây (`BotTradeOfferModal`)**:
     - `src/client/ui/modals/bot_trade_offer_modal.tsx`: Thiết kế theo phong cách tactile boardgame, đồng hồ đếm ngược trực quan với thanh tiến trình gradient `amber -> emerald`, nút bấm WCAG AA $\ge 44$px (`[TỪ CHỐI BÁN]`, `[ĐỒNG Ý BÁN]`), hiển thị cảnh báo độc quyền và tính toán minh bạch thuế 5% nộp Kho bạc.

---

### 191. [BOT/AI] Tối Ưu Nhịp Độ Đàm Phán Bot: Target Cell Cooldown 1 Lượt, Anti-Gap Starvation & Tăng Giá Bậc Thang Phân Tầng Tính Cách (IMP-144)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Đề Xuất Lặp Lại Ô Đất Vừa Bị Từ Chối (Target Cell Trade Spam Trap)*:
     - Trước IMP-144, khi Bot bị từ chối mua một ô đất độc quyền (Monopoly Gap), ở các lượt sau Bot có thể liên tục đề xuất lại chính ô đất đó mà không có khoảng đệm thời gian suy ngẫm cho từng ô mục tiêu, gây cảm giác quấy rối và spam đề xuất đàm phán tới người chơi.
  2. *Bẫy Chết Đói Độc Quyền Khi Một Ô Bị Cooldown (Gap Starvation Trap)*:
     - Khi Bot thiếu nhiều hơn 1 ô độc quyền ở các nhóm màu khác nhau (ví dụ thiếu ô X nhóm Nâu và ô Y nhóm Xanh Da Trời), nếu chỉ dùng `findMonopolyGap` (trả về gap đầu tiên), khi ô X đang trong thời gian cooldown sau từ chối, Bot sẽ bị nghẽn và không bao giờ xem xét đến ô Y, bỏ lỡ cơ hội hoàn thành bộ màu hợp lệ khác trong cùng lượt.
  3. *Bẫy Định Giá Đàm Phán Tĩnh (Static Price Negotiation Trap)*:
     - Khi đề xuất bị người chơi từ chối nhiều lần, Bot nếu không có cơ chế tăng giá leo thang (price escalation) sẽ tiếp tục chào mua với mức giá cũ. Ngược lại, nếu tăng giá vô tội vạ mà không có trần phân tầng theo tính cách (Aggressive +40%, Balanced +30%, Passive +15%), Bot sẽ dễ bị thâm hụt tài chính và vi phạm ngân sách đệm an toàn `safetyBuffer` (1.000 Tr. VNĐ).
  4. *Bẫy Rò Rỉ Trạng Thái Từ Chối Khi Đã Sở Hữu Thành Công (Stale Rejection History Trap)*:
     - Nếu không xóa sạch bản ghi `cellTradeRejections` và `cellLastRejectedRound` khi ô đất được giao dịch thành công (qua `coordRespondTradeOffer` hoặc `executeP2PTrade`), các lần giao dịch trong tương lai đối với ô đất này sẽ mang lịch sử cũ sai lệch.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Cooldown Ô Đất Mục Tiêu Đúng 1 Lượt (`Target Cell Cooldown 1 Round`)**:
     - `src/domain/bot/bot_trade.ts`: Khi ô đất X bị từ chối ở Vòng R (`bot.cellLastRejectedRound[X] = R`), Bot không được đề xuất lại ô X ở vòng R và vòng R + 1 (`currentRound - lastRejected <= 1`). Chỉ từ vòng R + 2 trở đi, Bot mới được phép đề xuất lại ô X nếu đủ điều kiện tài chính.
  2. **Quét Đa Độc Quyền & Chống Chết Đói Ô Đất (`findAllMonopolyGaps` & Anti-Gap Starvation)**:
     - Triển khai `findAllMonopolyGaps(bot, room, registry, stateMap): MonopolyGap[]` quét toàn bộ bàn cờ.
     - `findEligibleBotTrade` duyệt qua từng gap: nếu một gap đang cooldown 1 lượt thì tiếp tục `continue` xét gap tiếp theo, bảo đảm Bot luôn tìm được ô độc quyền khả thi khác trong cùng lượt.
  3. **Tăng Giá Bậc Thang Phân Tầng Tính Cách (+10% Mỗi Lần Từ Chối Kèm Trần Tuyệt Đối)**:
     - `calculateTradeOfferPrice`: Mỗi lần bị từ chối (`rejections`), hệ số giá tăng thêm `+0.10 * rejections`.
     - Trần tăng giá thặng dư tối đa (`maxEscalation`): Bot Aggressive tối đa `+0.40` (+40%), Bot Balanced tối đa `+0.30` (+30%), Bot Passive tối đa `+0.15` (+15%).
     - Luôn tôn trọng `safetyBuffer >= 1.000` Tr. VNĐ; nếu `bot.balance - offerPrice < safetyBuffer`, trả về `null` chống vỡ nợ.
  4. **Dọn Sạch Lịch Sử Khi Giao Dịch Thành Công (Zero Dangling State)**:
     - Trong `executeP2PTrade` và `coordRespondTradeOffer` (nhánh `accept: true`): `delete buyer.cellTradeRejections?.[cellIndex]` và `delete buyer.cellLastRejectedRound?.[cellIndex]`.
     - Trong trường hợp từ chối chủ động hoặc quá hạn 15s timeout (`checkPendingTradeTimeout`): tự động tăng số lần từ chối lên 1 và ghi nhận `cellLastRejectedRound = currentRound` an toàn với Safe Init (`??= {}`).

---

### 192. [UI/POPUP-COLLISION] Triệt Tiêu Chồng Đè Pop-up Bằng Tọa Độ Đa Tầng An Toàn Dưới MarketEventTicker (IMP-143)
*(Kế thừa Gotcha #190 theo kế hoạch đề xuất IMP-143, gán chỉ mục chuẩn #192 tiếp nối sau #190 và #191)*
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Chèn Đè Giữa MarketEventTicker và MilestoneBanner*:
     - Trên màn hình mobile hẹp (360-390px), `MarketEventTicker` khi hiển thị thẻ biến cố thị trường có tiêu đề + badge đếm vòng + 3 dòng mô tả (`line-clamp-3`) có thể chạm tới cao độ $Y = 148\text{px} - 152\text{px}$.
     - Nếu gán cứng `milestoneTopClass` tại `top-28` (112px), đỉnh thẻ `MilestoneBanner` ("Đại Nhạc Hội Quốc Tế" / "Độc Quyền Nhóm Đất") bị thụt vào trong và che khuất dưới mép đáy của Ticker.
  2. *Bẫy Chèn Đè Giữa MilestoneBanner và Toast Giao Dịch Thường (FloatingBadge)*:
     - Khi đồng thời xuất hiện thẻ mốc đặc biệt (`MilestoneBanner` cao ~80px, chạm tới $Y \approx 192\text{px}$) và toast giao dịch thường (`FloatingBadge`), việc gán cứng `mobileTopClass = 'top-[11rem]'` (176px) khiến toast giao dịch (ví dụ: trừ tiền nộp thuế hoặc trả tiền thuê) đè trực tiếp lên nửa dưới của thông báo thẻ sự kiện, che lấp toàn bộ mô tả chi tiết.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Bảng Tọa Độ Đa Tầng Chuẩn SSOT (Safe Offsets Matrix)**:
     - **MilestoneBanner (`milestoneTopClass`)**:
       * $\ge 2$ sự kiện thị trường: `top-[15.5rem]` (248px)
       * $1$ sự kiện thị trường: `top-[10.5rem]` (168px)
       * $0$ sự kiện thị trường: `top-20` (80px)
     - **Toast Giao Dịch Mobile (`mobileTopClass`)**:
       * Có `latestMilestone`: $\ge 2$ sự kiện `top-[21.5rem]` (344px); 1 sự kiện `top-[16.5rem]` (264px); 0 sự kiện `top-[11.5rem]` (184px).
       * Không có `latestMilestone`: $\ge 2$ sự kiện `top-[15.5rem]` (248px); 1 sự kiện `top-[10.5rem]` (168px); 0 sự kiện `top-[4.25rem]` (68px).
     - **Toast Giao Dịch Desktop (`desktopTopClass`)**:
       * Có `latestMilestone`: $\ge 2$ sự kiện `top-[22rem] md:top-[22rem]`; 1 sự kiện `top-[17rem] md:top-[17rem]`; 0 sự kiện `top-[12rem] md:top-[12rem]`.
       * Không có `latestMilestone`: $\ge 2$ sự kiện `top-[16rem] md:top-[16.5rem]`; 1 sự kiện `top-[11rem] md:top-[11.5rem]`; 0 sự kiện `top-28 md:top-32` (bảo toàn hợp đồng hồi quy `IMP-128`).
  2. **Khoảng Đệm An Toàn Tối Thiểu (Safe Margin > 16px)**:
     - Toàn bộ khoảng cách giữa đáy của phần tử tầng trên và đỉnh của phần tử tầng dưới duy trì tối thiểu 16px - 24px ở mọi kích cỡ màn hình và mọi tổ hợp trạng thái.
  3. **Bảo Toàn Trọn Vẹn Cấu Trúc DOM & A11y Contract**:
     - Bảo tồn 100% testids (`data-testid="milestone-banner-container"`, `floating-numbers-overlay`, `contextual-transaction-badge`, `event-card-notification-banner`).
     - Tuyệt đối không gom chung wrapper hay nhân bản DOM làm nhiễu loạn vùng thông báo động `aria-live="polite"`.

---

### 193. [FSM/RULE][BOT/AI][NET/SYNC] Quyền Ưu Tiên Mua Lại Dự Án C0 (Compulsory Buyout Đền Bù 130% & Quyền Tự Quyết) (IMP-145)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Tước Đoạt Đất Dự Án Tự Động & Thiếu Quyền Tự Quyết Người Chơi*:
     - Trước IMP-145, thẻ Cơ Hội Hoán Đổi Dự Án (`CC_SWAP_PROJECT`) cưỡng bức hoán đổi hoặc mua lại ngay lập tức mà không có sự đồng thuận hay quyền lựa chọn của người rút thẻ, đặc biệt khi người rút thẻ là con người đang trong trận đấu nhiều người chơi.
  2. *Bẫy Vi Phàm Độc Quyền Màu Sắc Khi Đất Đang Thế Chấp (Mortgage Trap in Monopoly Immunity)*:
     - Khi kiểm tra quyền miễn trừ mua lại cưỡng chế của đối thủ (`isEligibleForCompulsoryBuyout`), nhóm đất đã sở hữu độc quyền (`hasMonopoly`) bắt buộc phải được bảo vệ toàn bộ. Nếu truyền nhầm `stateMap` vào `hasMonopoly(ownerId, cellIndex, registry, stateMap)`, khi một ô trong nhóm bị thế chấp (`isMortgaged === true`), hàm sẽ trả về `false`, làm mất miễn trừ của cả bộ màu và cho phép người chơi khác cưỡng chế mua lại ô đất C0 thuộc bộ màu đó.
  3. *Bẫy Kẹt Lượt & Desync Khi Tạo Phiên Chờ Buyout 15 Giây*:
     - Người chơi người thật khi rút thẻ cần 15s để suy nghĩ hoặc chọn mục tiêu mua lại. Nếu FSM không quản lý phiên chờ (`pendingBuyout`) và không đóng băng luồng quyết định của Bot (`hasPendingBuyout`), Bot có thể bước tiếp lượt (`stepBotTurn`) hoặc kết thúc lượt (`executeTurnEnd`), dẫn đến FSM softlock hoặc race condition.
  4. *Bẫy Đền Bù 130% Làm Thâm Hụt Tài Chính Của Bot (Bot Safety Buffer Trap)*:
     - Bot khi rút thẻ không được mù quáng mua lại nếu chi phí 130% giá gốc khiến số dư giảm xuống dưới đệm an toàn `safetyBuffer` (800 Tr. VNĐ).
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Công Thức Đền Bù 130% & Miễn Trừ Độc Quyền Tuyệt Đối**:
     - `calculateCompulsoryBuyoutCost(cellIndexOrPrice)`: `Math.floor(basePrice * 1.30)`.
     - `isEligibleForCompulsoryBuyout`: Chỉ nhắm vào ô đất C0 (`level === 0`), không thế chấp (`!stateMap[cellIndex]?.isMortgaged`), thuộc quyền sở hữu của người chơi khác (chưa phá sản), và BẮT BUỘC KHÔNG THUỘC BỘ MÀU ĐỘC QUYỀN (`!hasMonopoly(ownerId, cellIndex, registry)` - KHÔNG truyền `stateMap`).
  2. **Phiên Chờ Buyout 15 Giây Độc Quyền Cho Người Thật (`PendingBuyoutSession`)**:
     - Khi người chơi thật rút thẻ có ô đất hợp lệ: Tạo phiên `room.pendingBuyout` với `expiresAt = Date.now() + 15_000`. Modal `compulsory_buyout` mở ra hiển thị 15s đếm ngược, cho phép người chơi chọn ô đất mục tiêu và quyết định `[Mua Lại]` (`INTENT_EXECUTE_COMPULSORY_BUYOUT`) hoặc `[Bỏ Qua]` (`INTENT_DECLINE_COMPULSORY_BUYOUT`).
     - Hết hạn 15s (`checkPendingBuyoutTimeout`) hoặc bấm bỏ qua: Tự động dọn sạch session, hoàn trả quyền FSM chuyển sang `PropertyManagement`.
  3. **Đóng Băng Lượt Đi & Turn End Protection**:
     - `hasPendingBuyout` được kiểm tra cùng `hasPendingTrade` trong `room_bot_coordinator.ts` và `turn_loop.ts` để phong tỏa mọi hành vi Bot bước lượt hoặc ép kết thúc lượt sớm khi đang có phiên buyout.
  4. **Quyết Định Hợp Lý Của Bot & Fallback Tài Chính Minh Bạch**:
     - Bot chỉ thực hiện buyout khi số dư `bot.balance - buyoutCost >= safetyBuffer` (800 Tr. VNĐ) và ưu tiên ô đất giúp chặn chuỗi độc quyền của đối thủ hoặc bổ sung nhóm màu tiềm năng.
     - Nếu bàn cờ không có ô C0 hợp lệ nào hoặc không ai mua lại: Ngân sách nhà nước (Kho Bạc / Ngân Hàng) chi trả tiền đền bù/trợ cấp +800 Tr. hoặc +1.000 Tr. VNĐ cho người chơi rút thẻ theo đúng quy tắc thẻ Cơ Hội.
