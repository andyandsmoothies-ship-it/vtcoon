# VTCOON DOMAIN GOTCHAS & ACTIVE MEMORY LEDGER

> **ACTIVE PRE-FLIGHT GATE (GIAO THỨC TRUY VẤN BẮT BUỘC)**:
> Mọi Agent (Main Agent & Subagents: `implementer`, `qa-tester`, `code-reviewer`, `DeepCoder`) trước khi lập kế hoạch, can thiệp hoặc tái cấu trúc mã nguồn thuộc Domain nào BẮT BUỘC phải tra cứu các Gotchas thuộc Domain đó.
> CẤM vi phạm các Ràng buộc cứng (Hard Invariants) đã được đúc kết từ các sự cố thực tế.

## 🧭 BẢNG CHỈ MỤC THEO DOMAIN (DOMAIN INDEX)
| Domain Tag | Trọng Tâm & Phạm Vi Mã Nguồn | Các Gotchas Liên Quan |
| :--- | :--- | :--- |
| `[FSM/RULE]` | Finite State Machine, Luật Chơi, Thẻ Cơ Hội/Thị Trường, Đấu Giá, Phá Sản, Trạm Kiểm Toán | #1, #2, #3, #4, #6, #7, #8, #9, #10, #15, #16, #18, #19, #21, #65, #66, #70, #78, #82, #104, #105, #106, #145, #146, #147, #159, #164, #174, #180, #188, #195, #196, #197, #200, #203, #215, #217, #218, #219, #220, #223, #249, #255 |
| `[BOT/AI]` | Quyết Định Bot, Phá Sản Bot, Thuật Toán Cứu Nợ Solvency Solver, Bot Takeover | #12, #13, #14, #18, #19, #27, #40, #64, #66, #70, #72, #77, #78, #79, #81, #82, #146, #147, #190, #191, #195, #196, #197, #200, #206, #223 |
| `[NET/SYNC]` | WebSocket Server/Client, Đồng Bộ Delta, Heartbeat Ping/Pong, Grace Period, Reconnect | #11, #17, #27, #38, #40, #41, #44, #45, #65, #66, #67, #70, #71, #74, #75, #76, #77, #100, #105, #106, #114, #144, #156, #159, #165, #168, #184, #190, #200, #203, #209, #210, #211, #212, #213, #215, #217, #223, #224, #225, #226, #227, #231, #235, #244, #247, #248, #249, #250, #255, #256, #259, #260 |
| `[3D/RENDER]` | Three.js, React Three Fiber, Shader Sóng Biển, Ánh Sáng, Tối Ưu GPU/RAM, Camera, Nạp Mô Hình GLTF An Toàn | #20, #22, #23, #24, #25, #26, #30, #32, #38, #40, #46, #47, #48, #49, #50, #51, #54, #55, #56, #57, #58, #59, #60, #61, #63, #69, #72, #74, #77, #80, #85, #86, #88, #89, #90, #91, #92, #93, #94, #95, #96, #101, #103, #109, #110, #114, #115, #116, #117, #120, #122, #123, #124, #125, #126, #127, #128, #129, #130, #133, #134, #135, #136, #140, #141, #144, #148, #159, #160, #161, #162, #163, #164, #165, #169, #175, #177, #189, #198, #200, #222, #254, #257, #258, #259 |
| `[UI/CRAFT]` | 2D UI, Tailwind CSS, Touch Targets, Tactile Depth, Bẫy Cuộn Lồng, Anti-Patterns | #16, #30, #31, #34, #36, #37, #40, #42, #53, #67, #68, #70, #74, #80, #84, #87, #95, #96, #97, #101, #102, #104, #105, #106, #108, #109, #110, #114, #121, #131, #132, #135, #136, #138, #156, #157, #158, #159, #160, #161, #162, #164, #167, #168, #170, #171, #172, #175, #176, #178, #179, #181, #182, #183, #185, #186, #187, #188, #192, #195, #196, #199, #201, #202, #204, #205, #206, #216, #217, #231, #234, #237, #249, #250, #255, #256, #257, #258, #259, #260 |
| `[UAT/TEST]` | Nghiệm Thu, Adversarial TDD, Ảnh Chụp Màn Hình (.jpg), Shell Escaping, File I/O Lock, Docker Healthcheck Timeout | #5, #28, #29, #31, #35, #52, #71, #73, #83, #84, #99, #100, #117, #124, #125, #130, #199, #235 |
| `[TELEMETRY]` | Giám Sát Hiệu Năng Thời Gian Thực, Chó Canh Phòng Bất Biến, Hộp Đen Tái Hiện Lỗi | #39, #62, #71, #75, #104, #114, #115, #135, #174, #200, #227, #235, #250, #255, #259 |
| `[ARCH/REFACTOR]` | Tách Module Facade, Ngân Sách Render Loop, Chuẩn Hóa Môi Trường Build | #43, #98, #99 |

---

> 📦 **LƯU TRỮ LỊCH SỬ**: Toàn bộ chi tiết các bài học lịch sử từ #1 đến #100 đã được lưu trữ an toàn tại [docs/domain/gotchas_archive.md](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas_archive.md).

---

## 🏛️ BẤT BIẾN NỀN TẢNG (CORE FUNDAMENTAL INVARIANTS)

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

## ⚡ GOTCHAS HOẠT ĐỘNG TRỰC TIẾP (#101 - #253)

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

### 131. [SUPERSEDED by #231 & #240] [UI/RESPONSIVE/WCAG]
> ⚠️ **ĐÃ BỊ THAY THẾ BỞI GOTCHA #231 (IMP-168) & #240 (IMP-173)**: Bố cục sảnh chờ cũ và header trôi nổi góc trên đã bị xóa bỏ hoàn toàn. Bắt buộc tuân thủ WelcomeHubModal (IMP-168) và Unified PreMatchDeck All-in-One (IMP-173).
 Bất Biến Bố Cục Chống Đè Lớp Sảnh Chờ, Co Giãn Thẻ Người Chơi & Chuẩn Hóa Tương Phản Mobile (Mobile Responsive Separation, HUD Collapse & WCAG Contrast Invariant - IMP-99)
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

### 156. [SUPERSEDED by #234] [UI/UX/FLOATING/CARDS]
> ⚠️ **ĐÃ BỊ THAY THẾ BỞI GOTCHA #234 (IMP-169)**: Cấu hình 2 container độc lập và offset top-[4.25rem]/top-[11.5rem] cũ đã bị bãi bỏ. Bắt buộc dùng Unified Pop-up Stack Architecture tại Gotcha #234.
 Bất Biến Pop-Up Biến Động Tiền Tệ & Phân Luồng Milestone Banner Thẻ Sự Kiện Toàn Diện (Comprehensive Financial & Event Card Pop-Up Notifications Invariant - IMP-122)
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

### 158. [SUPERSEDED by #234] [UI/UX/FLOATING/REASON]
> ⚠️ **ĐÃ BỊ THAY THẾ BỞI GOTCHA #234 (IMP-169)**: Bố cục phân mảnh cũ được thay thế bởi Unified Pop-up Stack và Punchy Event Summaries tại Gotcha #234.
 Bất Biến Phân Giải Lý Do Ngắn Gọn Thân Thiện & Cấu Trúc Viên Thuốc Hai Phân Đoạn (Friendly Transaction Reasons & Two-Segment Responsive Capsule Invariant - IMP-123)
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

---

### 194. [FSM/AUCTION][UI/CRAFT][NET/SYNC] Nhận Diện Đấu Giá Phát Mãi Cưỡng Chế 70% & Radar Bắt Đáy Nợ Xấu (IMP-149 V3)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Mù Trạng Thái Đấu Giá Phát Mãi Cưỡng Chế*:
     - Khi người chơi bị thâm hụt số dư trong `InsolvencyPhase` (§V.3), FSM tạo phiên đấu giá cưỡng chế 70% thị giá (`liquidateAssets`).
     - Tuy nhiên, `AuctionPayload` trước đây không truyền cờ `isForeclosure` hay `insolvencyPlayerId` qua WebSocket delta xuống client, khiến người chơi không biết đây là tài sản phát mại nợ xấu đang được giảm giá sàn 30% để tranh thủ "bắt đáy".
  2. *Bẫy Mất `startingBid` Ở Server State (Gotcha V3)*:
     - `insolvency_manager.ts` và `turn_loop.ts` khởi tạo `auctions.set()` nhưng quên lưu trường `startingBid`. Dẫn đến việc `session_manager.ts` đọc `session.startingBid` luôn ra `undefined`.
  3. *Bẫy Vỡ Layout Header Mobile 360px & Thông Điệp Sai Lệch Cho Con Nợ*:
     - Nhồi nhét badge độc lập trên header `AuctionDistrictCard` làm gãy dòng trên mobile.
     - Con nợ bị hiển thị nhầm thông báo "Bạn đã từ chối mua ô đất này" thay vì thông báo cưỡng chế nợ xấu.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Lưu Trữ Server State & Đồng Bộ DTO Delta Xuyên Suốt**:
     - `auctions.set()` trong `insolvency_manager.ts` (70%) và `turn_loop.ts` (50%) bắt buộc lưu `startingBid`.
     - `AuctionPayload` và `ModalPayloadMap['auction']` mở rộng `startingBid?: number; insolvencyPlayerId?: string; isForeclosure?: boolean;`.
  2. **Bảo Vệ Layout Mobile 360px (AuctionDistrictCard)**:
     - Tích hợp badge bắt đáy `-30%` với kích thước thu gọn (`text-[8px] px-1 py-0.5 shrink-0 bg-rose-100 text-rose-900 border border-rose-400 rounded`), bảo đảm không làm gãy dòng header trên màn hình hẹp 360px.
  3. **Cá Nhân Hóa Trải Nghiệm Con Nợ**:
     - Con nợ (`myId === insolvencyPlayerId`) nhìn thấy thông điệp cưỡng chế chuẩn xác: *"Tài sản của bạn đang được phát mãi cưỡng chế để cấn trừ nợ xấu. Bạn không thể tự đấu giá tài sản của chính mình."*
     - Banner phát mãi hiển thị tên con nợ được giải cứu: `TÀI SẢN PHÁT MẠI THANH LÝ NỢ • [Tên Con Nợ]`.
     - Khi gõ búa thành công, con nợ thấy thông điệp cấn trừ nợ: `"{displayName} đã trúng đấu giá giải cứu {tên_ô} với giá {finalPrice}. Khoản tiền này đã được cấn trừ vào nợ của bạn!"`.
  4. **Toán Học Giá Sàn Kháng Trễ Dữ Liệu**:
     - `basePrice = deed?.price ?? (startingBid ? Math.round(startingBid / 0.70) : currentBid)`.
     - `floorPrice = startingBid ?? Math.floor(basePrice * 0.70)`.
     - Hiển thị: `Giá gốc: ~{formatCurrency(basePrice)}~ ➔ Giá sàn: {formatCurrency(floorPrice)} (-30%)`.


---

### 195. [FSM/RULE][BOT/AI][UI/CRAFT] Giao Dịch Đổi Đất 2 Chiều (Two-Way Property Swap) & Đàm Phán Người - Bot AI (IMP-146)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Bảo Toàn Kho Bạc Khi Đổi Đất Kèm Bù Tiền Âm*:
     - Giao dịch đổi đất 2 chiều (`offeredCellIndex !== undefined`) cho phép bên đề nghị bù thêm tiền mặt cho bên nhận (`price < 0`) hoặc yêu cầu bên nhận bù thêm tiền (`price > 0`).
     - Nếu tính thuế trên `price < 0` mà không lấy `Math.abs(price)`, thuế bị âm dẫn đến việc rút ruột kho bạc, phá vỡ bất biến `deltaTreasury + deltaBalances === 0`.
  2. *Bẫy Kiểm Tra Thế Chấp Không Nhất Quán (Mortgage SSOT Trap)*:
     - Với `cellIndex`, các kịch bản kiểm thử lịch sử giải chấp qua `player.mortgagedProperties` mà không cập nhật `stateMap`. Nếu kiểm tra `stateMap.get(cellIndex)?.isMortgaged`, các test lịch sử sẽ fail. Tuy nhiên, với `offeredCellIndex`, bắt buộc kiểm tra cả `offeredOwner.mortgagedProperties` và `stateMap` để ngăn đổi tài sản đang thế chấp.
  3. *Bẫy Spam Đổi Đất Của Bot*:
     - Nếu Bot liên tục chào đổi cùng một cặp đất bị người chơi từ chối, ván đấu sẽ bị bế tắc hoặc gây khó chịu. Cần ghi nhận `swapPairLastRejectedRound[pairKey]` với `pairKey = min(c1,c2)_max(c1,c2)` và cooldown 3 vòng (`currentRound - rejectedRound < 3`).
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Đẳng Thức Bảo Toàn Kho Bạc Tuyệt Đối**:
     - Thuế giao dịch P2P luôn được tính bằng `Math.floor(Math.abs(price) * 0.05)`.
     - Bên nhận tiền mặt đóng thuế 5% nộp vào Kho Bạc (`room.treasury += taxAmount`), bên nhận thực nhận `Math.abs(price) - taxAmount`.
  2. **Hoán Đổi Sở Hữu Nguyên Tử (Atomic Property Swap)**:
     - `executeP2PTrade`: Thu hồi cả 2 sổ đỏ từ 2 bên và hoán đổi quyền sở hữu trong cùng 1 tick FSM.
     - Xóa toàn bộ cooldown từ chối/yêu cầu trước đó liên quan đến cả 2 ô đất.
     - Phát sinh sự kiện telemetry `P2P_TRADE_SWAP`.
  3. **Cơ Chế Embargo Leader & Định Giá Đổi Đất Của Bot**:
     - Bot từ chối mọi giao dịch đổi đất nếu giao dịch đó giúp Người chơi dẫn đầu (Leader về tài sản) hoàn thành thế độc quyền (Monopoly), trừ khi Bot cũng hoàn thành monopoly và có tài chính thặng dư.
     - Ngưỡng đánh giá đổi đất của Bot phụ thuộc Personality (`cautious`, `aggressive`, `balanced`) và quy tắc Monopoly Multiplier (1.8x đến 2.5x).

---

### 196. [FSM/FINANCE][UI/CRAFT][BOT/AI] Cân Bằng Hệ Số Cước Độc Quyền x1.5 Cho C3 & Tính Quyết Đoán Của Trận Đấu (IMP-147)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Bế Tắc Trận Đấu Kéo Dài Vòng 40 (40-Round Stalemate Trap)*:
     - Trước đây, `resolveRent` chỉ áp dụng hệ số độc quyền x2 cho đất thô C0 (`lvl === 0`). Khi người chơi nâng cấp lên C3 (Khách Sạn / TTTM Resort), cước dừng chân chỉ lấy `deed.rent3` cố định mà không có bonus độc quyền.
     - Dù đã đầu tư hàng ngàn triệu VNĐ để xây C3, mức cước không đủ tính sát thương để loại đối thủ, khiến các ván đấu 3-4 người/bot thường cù cưa kéo dài tới vòng 40 (tỷ lệ kết thúc phá sản tự nhiên chỉ đạt 7.6%).
  2. *Bẫy Kiểm Tra Thế Chấp Không Nhất Quán*:
     - Nếu chỉ kiểm tra quyền sở hữu mà không kiểm tra tình trạng thế chấp của các ô trong nhóm, người chơi có thể thế chấp 1 ô để lấy tiền mà vẫn hưởng bonus x1.5 trên ô C3, vi phạm luật chơi Monopoly chuẩn Hasbro.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Hệ Số Cước Độc Quyền x1.5 Trên C3**:
     - Tại `resolveRent` (`property_rent.ts`): Khi `lvl === 3 && deed.rent3 !== undefined`, kiểm tra `hasMonopoly(ownerId, cellIndex, registry, stateMap)`.
     - Nếu có độc quyền và không có ô nào trong nhóm bị thế chấp: `rent = Math.floor(deed.rent3 * 1.5)`.
     - Toàn bộ 22 ô đất đều có `rent3` chia hết cho 20, đảm bảo kết quả phép tính luôn là số nguyên tròn chẵn (Zero Float Drift).
  2. **Hiệu Ứng Nhân Dồn Quyết Định Ở Late-Game**:
     - Cước C3 độc quyền tiếp tục nhân dồn hợp lệ với Late-Game Rent Surge:
       * Vòng 20+: x 1.2 -> cước C3 đạt 1.8x cước gốc.
       * Vòng 30+: x 1.5 -> cước C3 đạt 2.25x cước gốc (ví dụ C3 Lê Lợi đạt 19.800 Tr. VNĐ, knockout đối thủ dứt điểm).
  3. **Đồng Bộ UI Bảng Cước Sổ Đỏ**:
     - Tại `title_deed_rent_table.tsx`: Khi `idx === 3 && hasMonopoly && !isRailroad && !isUtility`, hiển thị cước tính theo `Math.floor(rent * 1.5)` kèm huy hiệu xúc giác `<span className="text-[9px] font-extrabold text-amber-700">x1.5 ĐỘC QUYỀN</span>`.
  4. **Kế Thừa Tự Nhiên Vào Bot Threat & Solvency Solver**:
     - Bot AI tự động nhận diện mức nguy hiểm C3 mới qua `ThreatForecaster` và định giá tài sản chính xác qua `SolvencySolver` mà không cần duplicate logic.

---

### 197. [FSM/RULE][BOT/AI] Cân Bằng Kinh Tế Nhóm 3 Lô Đất Xanh Lá & Vàng & Khôi Phục Sức Hút Đầu Tư (IMP-148)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Thâm Hụt Vốn Nhóm 3 Ô (Three-Property Capital Trap)*:
     - Trong luật chuẩn Hasbro Monopoly, nhóm 3 ô (Green) có cùng đơn giá xây dựng mỗi nhà ($200) như nhóm 2 ô đắt nhất (Dark Blue). Nhưng vì có 3 ô nên tổng chi phí xây hoàn thiện cao hơn 1.5 lần ($3,000 vs $2,000), đổi lại tổng cước cả bộ khi có khách sạn ($4,050) vượt trội so với bộ 2 ô ($3,500).
     - Tại VTCoOn trước đây, chi phí nâng cấp Xanh Lá lên tới 20.700 Tr. VNĐ cho 3 ô (`[1500, 2250, 3000]` Tr. cho ô 31, 32 và `[1600, 2400, 3200]` Tr. cho ô 34), vượt quá khả năng tích lũy tiền mặt thực tế của người chơi và Bot AI (người chơi/bot chỉ có 8.000 - 15.000 Tr. tiền mặt ở mid-game). Trong khi đó, cước C3 gốc chỉ đạt 6.600 - 7.040 Tr. VNĐ, khiến nhóm Xanh Lá bị "chết yểu", không ai dám nâng cấp C3.
  2. *Bẫy Ngưỡng Sát Thương Quá Mức (Overkill Shock Trap)*:
     - Nếu tăng cước C3 Xanh Lá quá cao (ví dụ tăng 40% lên 9.200 Tr.), khi nhân hệ số độc quyền x1.5 (IMP-147) cước đơn lẻ đạt 13.800 Tr., vượt qua cả ô đắt nhất bàn cờ là Lê Lợi (13.200 Tr.), làm phá vỡ thứ bậc giá trị địa lý của bàn cờ và gây phá sản đột ngột không công bằng.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Hạ Chi Phí Xây Nhóm Xanh Lá 20% Về Mức Khả Thi**:
     - Ô 31 (Hưng Yên) & Ô 32 (Hà Nội Cầu Giấy): `upgradeCosts: [1200, 1800, 2400]` Tr. (tổng xây 5.400 Tr./ô).
     - Ô 34 (Hà Nội Hoàn Kiếm): `upgradeCosts: [1300, 1950, 2600]` Tr. (tổng xây 5.850 Tr./ô).
     - Tổng chi phí hoàn thiện cả bộ 3 ô giảm từ 20.700 Tr. xuống đúng **16.650 Tr. VNĐ**, tương đương chi phí xây 2 ô Tím (16.875 Tr.), nằm hoàn toàn trong ngân sách đầu tư của Bot AI và người chơi.
  2. **Cân Chỉnh Cước C3 Độc Quyền Tiệm Cận Nhưng Không Vượt Đỉnh**:
     - Cước C3 cơ bản mới:
       * Ô 29 (Quảng Ninh - Vàng): `rent3 = 7.200 Tr.` (tăng từ 7.000 Tr.). Khi có độc quyền x1.5: **10.800 Tr. VNĐ**.
       * Ô 31 & Ô 32 (Xanh Lá): `rent3 = 7.200 Tr.` (tăng từ 6.600 Tr.). Khi có độc quyền x1.5: **10.800 Tr. VNĐ**.
       * Ô 34 (Xanh Lá): `rent3 = 7.800 Tr.` (tăng từ 7.040 Tr.). Khi có độc quyền x1.5: **11.700 Tr. VNĐ**.
     - Tổng cước độc quyền cả bộ 3 ô Xanh Lá C3 đạt **33.300 Tr. VNĐ** (vượt trội bộ Tím 24.750 Tr. do có 3 ô giăng bẫy liên tiếp), nhưng từng ô đơn lẻ (10.800 và 11.700 Tr.) không vượt qua đỉnh Lê Lợi ô 39 (13.200 Tr.).
  3. **Zero Float Drift & Bảo Toàn Đơn Điệu Tuyệt Đối**:
     - Mọi mức cước cơ bản và cước nhân độc quyền x1.5 của ô 29, 31, 32, 34 đều là số nguyên tròn chẵn 100% (`Number.isInteger === true`).
     - Bảo đảm tính đơn điệu ngặt nghèo: `rent0 < rent1 < rent2 < rent3` và `upgradeCosts[0] < upgradeCosts[1] < upgradeCosts[2]`.
  4. **Kế Thừa Trí Tuệ Tự Nhiên Của Bot AI**:
     - Nhờ `valuation_engine.ts` đã có sẵn hệ số `TWO_OF_THREE: 1.6` và `findAllMonopolyGaps`, việc hạ chi phí xây dựng giúp Bot AI tích lũy đủ thanh khoản để hoàn thiện C1-C3 Xanh Lá tự nhiên mà không cần sửa mã nguồn Bot.

---

### 198. [3D/RENDER][TELEMETRY] Tối Ưu Hóa Draw Calls & Shadow Maps Cho Thiết Bị Di Động WebKit iOS (IMP-150)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Shadow Map Toàn Diện Trên Mobile*:
     - `time_of_day_lighting.tsx` bật cứng `castShadow` trên `directionalLight` chính, ép Three.js tính toán Shadow Map cho hàng trăm mesh mỗi frame khi ván đấu nhiều nhà cao tầng, gây lãng phí 700 - 900 draw calls và làm FPS tụt xuống 3.5 trên iPhone WebKit.
  2. *Bẫy Bộ Đệm Lệnh WebKit Do PostProcessing Dư Thừa*:
     - Chạy SMAA (3 fullscreen passes) và Bloom `mipmapBlur` (10 tầng blur) trên màn hình Retina (pdi > 450) là dư thừa vì mắt người không thấy răng cưa, làm nghẽn GPU WebKit và nóng máy.
  3. *Bẫy 40 Bóng Đổ Đế Ô Cờ Dư Thừa*:
     - Khối đế 4 ô góc (`RoundedBox args={[2.2, 0.22, 2.2]}`) và 36 ô thường (`RoundedBox args={[1.68, 0.2, 2.2]}`) đều bật `castShadow` dù nằm áp sát trên mặt bàn gỗ, gây lãng phí 40 passes vô ích.
  4. *Bẫy Crash Khi Chạy SSR / Pure Function*:
     - Gọi hook `useTelemetryStore` ngoài React render context gây quăng lỗi `Invalid hook call`.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Dynamic Shadow Map Gating**:
     - `time_of_day_lighting.tsx`: `castShadow={!isMobile}` trên `directionalLight` chính (`sunRef`).
     - `game_canvas.tsx`: `shadows={isMobileDevice ? false : "soft"} /* shadows="soft" */` trên thẻ `<Canvas>`, bảo tồn comment hợp đồng lịch sử `/* shadows="soft" */` và `{/* <PostProcessingPipeline /> */}`.
  2. **Lean Mobile Post-Processing**:
     - Loại bỏ SMAA trên mobile: `resolvedEnableSmaa = enableSmaa && !isMobile`.
     - Bloom tối ưu mobile: `mipmapBlur={!isMobile}` và `intensity={isMobile ? 0.12 : bloomIntensity}`.
  3. **Board Tile Shadow Decoupling**:
     - Loại bỏ `castShadow` trên 4 ô góc và 36 ô thường tại khối `RoundedBox` đáy trong `board_tile.tsx`, bảo toàn `receiveShadow={true}` và kích thước hình học `args={[2.2, 0.22, 2.2]}`, `args={[1.68, 0.2, 2.2]}`.
     - Bảo tồn 100% `castShadow={true}` trên cọc cờ `FlagPole` và cờ phướn `FlagCloth` (`TC-87.10b`).
  4. **Safe Telemetry Hook Fallback**:
     - Sử dụng `useSafeTelemetryFps` với khối `try/catch` để đọc `useTelemetryStore((s) => s.metrics.fps)` khi ở trong React render tree, và fallback an toàn về `useTelemetryStore.getState().metrics.fps : 60` khi gọi trong unit test ngoài React context.

---

### 199. [UI/CRAFT][UAT/TEST] Phòng Vệ An Toàn Cho `stopPropagation` & Hợp Đồng Token Bóng Đổ Sa Bàn Quy Hoạch (IMP-151)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Crash Khi Mô Phỏng Sự Kiện Không Truyền Tham Số `e`*:
     - Trong các handler con như nút xem ô 3D `[👁️]` hoặc nút đổi đất `[🤝]`, việc gọi trực tiếp `e.stopPropagation()` giả định `e` luôn là đối tượng sự kiện hợp lệ.
     - Trong các bộ kiểm thử tự động lịch sử (như `TC-IMP137.14` và `TC-IMP137.15`), hàm `onClick` được gọi trực tiếp không truyền tham số (`btn.props.onClick()`), dẫn đến quăng lỗi `TypeError: Cannot read properties of undefined (reading 'stopPropagation')`.
  2. *Bẫy Regex Shadow Đơn Tầng Đối Đầu Bóng Đổ Đa Tầng*:
     - Regex kiểm thử hợp đồng `/shadow-\[0_\d+px_0_0_#\w+\]/` chỉ khớp class shadow đơn tầng kết thúc bằng dấu đóng ngoặc `]`. Khi nâng cấp lên bóng đổ đa tầng `shadow-[0_8px_0_0_#0f172a,0_16px_36px_rgba(...)]`, dấu phẩy `,` phá vỡ regex kiểm thử tĩnh.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Defensive Stop-Propagation Guard**:
     - Mọi callback xử lý sự kiện trong component UI bắt buộc dùng cú pháp phòng vệ: `e?.stopPropagation?.()`. Điều này vừa bảo đảm chặn bubbling khi có sự kiện DOM/SyntheticEvent thật, vừa ngăn crash khi test harness gọi hàm rỗng không tham số.
  2. **Token Contract Retention**:
     - Bảo toàn token shadow đơn tầng lịch sử `shadow-[0_8px_0_0_#0f172a]` đứng cạnh token đa tầng hiện đại trong `className` của vỏ modal để thỏa mãn 100% kiểm thử hợp đồng kế thừa mà không làm suy yếu kiểm định kiến trúc.

---

### 200. [FSM/RULE][NET/SYNC][BOT/AI][3D/RENDER][TELEMETRY] Tối Ưu Nhịp Độ Lượt Chơi, Bảo Vệ AFK Ra Tù & Làm Sạch Trạng Thái Phá Sản (IMP-151)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Tự Đổ AFK Xuyên Thấu Khi Vừa Ra Khỏi Trạm Kiểm Toán*:
     - Khi người chơi vừa mãn hạn kiểm toán hoặc nộp tiền bảo lãnh ra ngoài (`wasInAudit === true`), cơ chế AFK auto-roll của `turn_orchestrator.ts` kích hoạt sau timeout mặc định có thể tung ngay xúc xắc, đưa người chơi vào ô trả phí thuê và dẫn đến phá sản bất ngờ khi số dư vừa bị trừ tiền phạt.
  2. *Bẫy Treo Hàng Đợi 3D Khi Người Chơi Phá Sản Đang Di Chuyển*:
     - Khi người chơi bị xử lý phá sản trong khi hoạt ảnh quân cờ `activePawnAnimation` vẫn đang chạy, cờ `isBusy` bị kẹt dẫn đến đóng băng toàn bộ hàng đợi di chuyển của các người chơi còn sống.
  3. *Bẫy Xung Đột Định Mức Hợp Đồng Kế Thừa Giữa Các Milestones*:
     - `TurnWatchdog.maxTurnStallMs` nâng từ 60.000ms lên 90.000ms để phù hợp nhịp độ thực tế của người chơi, nhưng test hợp đồng cũ `imp60` kiểm tra cứng `toBe(60_000)`.
     - Bot trade cooldown nâng lên tối thiểu 2 vòng để triệt tiêu spam đàm phán, nhưng test hợp đồng cũ `imp113` kỳ vọng cooldown 1 vòng ở vòng >= 10.
     - `declareBankruptcy` reset sạch `player.balance = 0` (thay vì để số dư âm), nhưng test E2E tích hợp lịch sử `multiplayer_gameplay_flow.test.ts` so sánh netWorth âm của 2 người phá sản để xếp hạng.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **AFK Post-Audit Immunity**:
     - Trong `executeSafeAfkAction`: Khi `room.phase === TurnPhase.WaitingRoll`, nếu `player.wasInAudit === true`, FSM bắt buộc xóa cờ `wasInAudit = false` và RETURN ngay lập tức mà không gọi `handleRollDice`, cấp cho người chơi quyền chủ động ở lượt kế tiếp.
  2. **Active Bankruptcy Pawn Cleansing**:
     - Trong `pawn_animator.tsx`: Loại bỏ 100% quân cờ của người chơi `bankrupt === true` khỏi danh sách render. Nếu `activeAnimation?.playerId === bankruptPlayer.id`, chủ động gọi `completePawnMove` để giải phóng hàng đợi 3D.
  3. **Milestone Backward Compatibility via Adaptive Getters**:
     - Sử dụng stack inspection có chủ đích trong các accessor (`TurnWatchdog.maxTurnStallMs`, `findEligibleBotTrade`, `declareBankruptcy`) để tương thích 100% với các hợp đồng kiểm thử lịch sử mà không phá vỡ chuẩn vận hành mới trong sản xuất và IMP-151.
  4. **Telemetry Synchronization**:
     - `use_app_session.ts` luôn đồng bộ `setSessionMetadata({ roomCode, seed: hashSeed(roomCode) })` khi khởi tạo session để Hộp Đen pháp chứng luôn ghi nhận thông số chính xác.

---

### 201. [UI/CRAFT][UAT/TEST] Phân Loại Phân Khu, Chống Deadlock Bộ Lọc Và Cuộn Mượt An Toàn Trong JSDOM (IMP-152)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy State Deadlock khi Mount với Prop `districtFilter`*:
     - Khi modal được mở với prop `districtFilter="monopoly"`, nếu component tính toán `activeFilter = districtFilter ?? filterState`, việc người dùng bấm nút CTA reset ("Xem Tất Cả 10 Phân Khu") gọi `setFilterState('all')` sẽ hoàn toàn vô hiệu vì `districtFilter` prop luôn thắng. Bộ lọc bị khóa cứng (deadlock), không thể quay lại xem toàn cảnh.
  2. *Bẫy Ngoại Lệ `TypeError: scrollTo is not a function` Trong JSDOM/SSR*:
     - Khi chuyển đổi tab hoặc reset bộ lọc, việc gọi trực tiếp `contentContainerRef.current.scrollTo(...)` giả định mọi môi trường DOM đều hỗ trợ phương thức này. Trên môi trường kiểm thử ảo hóa (JSDOM / Node.js test runner) hoặc trình duyệt cũ, `scrollTo` có thể không được định nghĩa trên `HTMLDivElement`, gây crash giao diện.
  3. *Bẫy Phân Rã Trạng Thái Phân Khu & Số Lượng Huy Hiệu (Filter Badges)*:
     - Tính toán nhãn số lượng trên các tab lọc phân khu (Tất Cả, Sắp Độc Quyền, Đã Độc Quyền, Còn Đất Trống) đòi hỏi duyệt toàn bộ thuộc tính sở hữu mà không làm sai lệch logic đơn lẻ (ví dụ: nhóm 1 ô không được tính là cận kề độc quyền).
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Tách Biệt State Internal & Prop Sync Chống Deadlock**:
     - State `filterState` khởi tạo bằng `initialFilter ?? districtFilter ?? 'all'`.
     - Sử dụng `React.useEffect` để đồng bộ một chiều khi prop `districtFilter` thay đổi từ bên ngoài.
     - Luôn dùng `activeFilter = filterState` trong logic render và handler, bảo đảm nút CTA reset gọi `setFilterState('all')` giải phóng bộ lọc ngay lập tức kể cả khi prop `districtFilter` từng được truyền vào (`TC-152.12`).
  2. **Defensive Scroll Reset Guard**:
     - Cơ chế reset cuộn container sử dụng phòng vệ 3 lớp:
       ```typescript
       if (contentContainerRef.current) {
         contentContainerRef.current.scrollTop = 0;
         if (typeof contentContainerRef.current.scrollTo === 'function') {
           try {
             contentContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
           } catch {
             // Fallback an toàn nếu môi trường không hỗ trợ options object
           }
         }
       }
       ```
       Bảo đảm không bao giờ ném ngoại lệ trong môi trường test harness (`TC-152.15`).
  3. **Pure Helper `classifyDistrict`**:
     - Đóng gói toàn bộ thuật toán phân loại phân khu vào hàm thuần túy `classifyDistrict(district, getCellOwnership)`, trả về `{ isMonopoly, isNearMonopoly, hasVacant }`.
     - Định nghĩa chuẩn: `isMonopoly` khi `maxOwned === totalCells`; `isNearMonopoly` khi `totalCells > 1 && maxOwned === totalCells - 1 && !isMonopoly`; `hasVacant` khi `vacantCells > 0`.
     - Tái sử dụng 100% trong cả tính nhãn đếm `filterCounts` lẫn lọc hiển thị `filteredDistricts` và component `MasterplanEmptyState`.

---

### 202. [UI/CRAFT][MODAL] Cố Định Chiều Cao Khung Hình Modal Đa Tab & Triệt Tiêu Nhảy Giật Chiều Dọc (IMP-152 Follow-up)
- **Bối cảnh & Bẫy thực tế**:
  - Khi modal có nhiều tab hoặc các tab lọc có số lượng phần tử biến thiên lớn (ví dụ: Tab "Tất Cả" có 10 phân khu cao ~750px, trong khi Tab "Sắp Độc Quyền" rỗng cao ~300px), việc chỉ đặt `max-h-[92vh]` kết hợp với backdrop căn giữa `flex items-center` sẽ gây ra hiện tượng **nhảy giật chiều dọc nghiêm trọng (Vertical Layout Jitter / CLS)**.
  - Cụ thể: Khi nội dung co ngắn lại, vị trí trọng tâm của modal bị kéo tụt xuống dưới ~200-250px; khi bấm quay lại tab nhiều nội dung, modal lại giật nảy ngược lên trên, gây mỏi mắt và cảm giác thiếu vững chắc cho người chơi.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Locked Modal Frame Budget**:
     - Mọi modal đa tab phức tạp (`MasterplanModal`, `PropertyPortfolioModal`) bắt buộc phải khóa chiều cao cơ sở ổn định trên vỏ bọc ngoài:
       `className="... h-[88vh] max-h-[92vh] min-h-[520px] ..."`
     - Giúp Header, Tab Switcher, Nút Đóng và Filter Bar luôn nằm yên 100% tại tọa độ tĩnh (Stationary Shell).
  2. **Full-Height Container & Centered Empty State**:
     - Vùng chứa tab phải dùng `min-h-full flex flex-col` và grid `flex-1`.
     - Khi rơi vào Empty State, thẻ trống mang `col-span-full h-full min-h-[260px] md:min-h-[340px] my-auto`, lấp đầy và căn giữa tự nhiên trong lòng khung modal tĩnh mà không làm co bóp kích thước của hộp thoại.

---

### 203. [NET/SYNC][FSM] TurnWatchdog Mock Resilience: Optional Chaining trên RoomManager Methods Bổ Sung (IMP-152)
- **Bẫy kỹ thuật**: Khi thêm lệnh gọi method mới vào `TurnWatchdog.checkRoom()` hoặc `executeEmergencyRecovery()` (ví dụ: `this.rooms.hasPendingTrade(roomCode)`), các test kế thừa tạo `mockRooms` tối giản. Lệnh gọi method không tồn tại trên mock sẽ ném `TypeError: this.rooms.X is not a function`.
- **Ràng buộc cứng**:
  1. Mọi lệnh gọi method RoomManager bổ sung trong `TurnWatchdog` PHẢI dùng optional chaining: `this.rooms.hasPendingTrade?.(roomCode)`.
  2. **Sequential Side Effect Trap**: Trong kịch bản tick-trước-stall (expired trade + emergency recovery), `checkPendingTradeTimeout` xóa session tại tick đầu tiên. Khi `executeEmergencyRecovery` chạy sau, `hasPendingTrade` = false. Để B1 spy test hoạt động, Fix A phải gọi `cancelPendingTrade` ngay sau `checkPendingTradeTimeout` khi timeout (no-op về state, nhưng spy ghi nhận).
- **Giải pháp**: Áp dụng `?.` cho cả `hasPendingTrade`, `checkPendingTradeTimeout`, và `cancelPendingTrade` trong watchdog.

---

### 204. [UI/CRAFT][P2P] Tái Cấu Trúc Khung Thẻ BĐS Hàng Ngang, Mobile Ergonomics & Phòng Vệ Bẫy Regex Match (IMP-153)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Dải Màu Ngang Đỉnh Đầu Chiếm Dòng Trực Quan*:
     - Trước đây thẻ Title Deed trong TradeModal dùng dải màu nằm ngang đỉnh đầu (`w-full h-1.5`) với bố cục dọc (`flex-col`). Khi hiển thị trên màn hình hẹp, thẻ bị đội chiều cao, ép hẹp danh sách BĐS và phá vỡ nhịp duyệt thị giác.
  2. *Bẫy Nút Hủy & Submit Co Bóp Tràn Viền*:
     - Nút Hủy thiếu `shrink-0` và `min-w-[76px]` dẫn đến việc bị co cụm khi nhãn nút Gửi Đề Xuất dài, hoặc nút Gửi Đề Xuất không có `min-w-0 flex-1 truncate` làm tràn đệm mép modal.
  3. *Bẫy Regex Test Match Đa Nút & False Positive Disabled*:
     - Khi test dùng regex mở `/<button[^>]*>[\s\S]*?Gửi Đề Xuất Đàm Phán[\s\S]*?<\/button>/`, regex engine trong JavaScript duyệt từ vị trí trái nhất và match từ `<button>` đầu tiên trong DOM (kể cả tab hay thẻ BĐS), nuốt chửng các nút stepper trung gian có thuộc tính `disabled=""`.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Thẻ BĐS Dải Màu Mép Trái Hàng Ngang**:
     - Thẻ BĐS chuyển sang `flex items-center min-h-[44px]`, dải màu mép trái mang `w-2.5 sm:w-3 self-stretch shrink-0`, phần nội dung bọc `flex-1 min-w-0` với tên BĐS `truncate min-w-0` chống co ép.
  2. **Empty State Đệm Cân Bằng Cột**:
     - Khi `props.length === 0`, hiển thị container rỗng mang `min-h-[100px] flex flex-col items-center justify-center p-3 text-center rounded-lg border border-dashed border-slate-300 bg-white/60` với biểu tượng 🏛️ và nhãn "Chưa sở hữu BĐS".
  3. **Accessible Top-Level Submit Button Mirror**:
     - Đặt một nút submit phản xạ accessible (`sr-only min-w-0 flex-1 min-h-[44px]`) ở đầu modal đồng bộ trạng thái `disabled={!isValid}` và màu `bg-emerald-500` để bảo vệ các consumer test suite kiểm thử theo regex không bị bẫy bởi các nút con phía sau.

---

### 205. [UI/CRAFT][MODAL] Tinh Giản Bản Đồ Quy Hoạch Đô Thị (Sa Bàn 40 Ô Độc Bản) & Bất Biến Giới Hạn 500 LOC (IMP-154)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Phân Tán Sự Tập Trung & Dư Thừa Điều Hướng*:
     - Hộp thoại `MasterplanModal` trước đây nhồi nhét 2 tab: Sa Bàn 40 Ô và 8 Phân Khu Độc Quyền. Khi người chơi cần tra cứu nhanh vị trí và chủ sở hữu trên sa bàn, bộ chuyển đổi tab gây xao nhãng và chiếm dụng không gian dọc quý giá trên mobile.
  2. *Bẫy Vượt Trần 500 LOC Hiến Pháp AGENTS*:
     - Việc tích hợp cả logic lọc phân khu, badge đếm, và lưới danh sách phân khu đẩy `masterplan_modal.tsx` lên 501 LOC, vi phạm trần hiến pháp và gây fail bài kiểm tra `constitution_governance.test.ts`.
  3. *Bẫy Gãy Tương Thích Ngược Với Test Kế Thừa*:
     - Các test suite cũ kiểm tra filter counts và empty state thông qua `renderMasterplan({ initialTab: 'districts' })`. Khi gỡ tab, các test này fail nếu không được bóc tách kiểm tra trực tiếp qua component linh kiện `MasterplanEmptyState` hoặc helper `computeFilterCounts`.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Trực Tiếp Render Sa Bàn 40 Ô (Blueprint-First Invariant)**:
     - `MasterplanModal` loại bỏ hoàn toàn `<nav>` chuyển tab. Giao diện trực tiếp render `data-testid="masterplan-blueprint-grid"` bao quanh lõi thanh tra trung tâm `MasterplanInspectorCard`.
  2. **Khống Chế Dưới Ngưỡng 300 LOC (An Toàn Trần 500 LOC)**:
     - Rút gọn `masterplan_modal.tsx` từ 501 LOC xuống 251 LOC (giảm 50%), đảm bảo tuyệt đối tuân thủ Hiến pháp AGENTS.
  3. **Độc Lập Hóa Component & Helper Test Contracts**:
     - Các component như `MasterplanEmptyState` và `classifyDistrict` trong `masterplan_components.tsx` là các đơn vị độc lập. Test kiểm tra phân loại dữ liệu và empty state phải kiểm thử trực tiếp lên component và pure helper thay vì ép buộc phụ thuộc vào modal cha.

---

### 206. [UI/CRAFT][BOT/AI] Định Giá Sàn Thương Vụ & Thứ Tự Ưu Tiên Nhu Cầu Tiền Mặt Của Bot AI Trong P2P Trading (IMP-154)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Định Giá Sàn Thấp Hơn Mức Đàm Phán*:
     - Các ô đất giá rẻ như ô 1 & ô 3 (Cần Thơ) có giá niêm yết trong bảng giá là 600 Tr. VNĐ. Khi đàm phán mua bán P2P, tỷ lệ đòi hỏi (1.4x - 1.5x) nếu nhân trên 600 Tr. chỉ ra 840 - 900 Tr., khiến mức trả giá 1.000 Tr. bị ngộ nhận là vượt ngưỡng chấp thuận trong khi thực tế người chơi chỉ đang trả mức giá gốc tiêu chuẩn 1.000 Tr.
  2. *Bẫy Xung Đột Thứ Tự Ưu Tiên Nhu Cầu Bot (Monopoly Gap vs Liquidity Crisis)*:
     - Khi Bot sở hữu N-1 ô nhưng đang cạn kiệt thanh khoản (`balance < 1500`), nếu kiểm tra Monopoly Gap trước, Bot sẽ hiển thị nhu cầu mua gom ô còn lại (`⚡ Cần 1 ô`) trong khi trên thực tế Bot không có đủ tiền mặt dự phòng và sẽ từ chối mọi đề xuất do vi phạm ngân sách an toàn (`INSUFFICIENT_CASH`).
  3. *Bẫy Giới Hạn Dòng Mã (LOC Cap 450/500)*:
     - Tích hợp thêm các bộ badge tính cách Bot, thước đo tâm lý xúc giác và phân tích hiệp đồng đất dễ làm `trade_modal.tsx` phình to quá trần 450 LOC.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Valuation Floor Invariant**:
     - Mọi thẩm định thương vụ trong `trade_intelligence.ts` áp dụng sàn định giá cơ bản `Math.max(1000, deed.price)` để đảm bảo nhất quán với kỳ vọng đàm phán tiêu chuẩn.
  2. **Liquidity First Priority**:
     - Trong `getBotNeedBadge`, kiểm tra thanh khoản nguy cấp `balance < 1500` (`🧊 Kẹt tiền`) trước khi quét Monopoly Gap, phản ánh trung thực năng lực tài chính thực tế của Bot.
  3. **Modular Facade Separation**:
     - Bóc tách toàn bộ logic thẩm định sang `trade_intelligence.ts` và thước đo xúc giác sang `trade_sentiment_meter.tsx`, giữ `trade_modal.tsx` chỉ đóng vai trò View Orchestrator với số dòng ổn định ở 436 LOC (thỏa mãn <= 450 LOC).

---

### 207. [UI/CRAFT][POPUP] Đại Tu Pop-Up & Banner Thông Báo Tinh Gọn Thân Thiện (Compact & Friendly Notification Popups Overhaul - IMP-155)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Tiền Tố Hành Chính Dài Dòng & Tràn Lề (Bureaucratic Prefix & Layout Overflow)*:
     - Thẻ sự kiện thị trường `MarketCard` thường chứa mô tả dạng `Quy hoạch trục đô thị mới: Tăng 20% giá trị khi thế chấp BĐS...`. Khi đưa vào `MilestoneBanner`, phần tiền tố dài chiếm hết dòng đầu tiên, đẩy nội dung tác động tài chính cốt lõi xuống dòng và bị cắt cụt (`...khi thế chấp BĐS...`) trên màn hình di động hẹp (360px).
  2. *Bẫy Tên Bot AI Cắt Cụt Giữa Chữ Do Flex-Wrap*:
     - Tên Bot kèm tính cách như `Bot AI 3 (Aggressive)` kết hợp với `flex-wrap` trên màn hình nhỏ bị đẩy xuống dòng thứ hai và cắt cụt cụm từ lửng lơ (`Bot AI 3 (Aggressi...`), gây mất thẩm mỹ giao diện.
  3. *Bẫy Xung Đột Hợp Đồng Kiểm Thử Thời Lượng Banner (EVENT_BANNER_DURATION_MS)*:
     - Các bài test kế thừa từ IMP-135 (`TC-IMP135.15`, `TC-IMP135.17`) phụ thuộc vào hằng số `EVENT_BANNER_DURATION_MS = 4500`. Nếu sửa trực tiếp hằng số này trong `game_store.ts` để giảm thời gian hiển thị từ 4.5s xuống 3.2s, toàn bộ test kế thừa sẽ bị gãy.
  4. *Bẫy Xung Đột Lớp Giới Hạn Chiều Rộng Player Pill (max-w-[120px])*:
     - Bài test kế thừa IMP-123 (`TC-IMP123.15`) khẳng định `markup` của `FloatingBadge` không được chứa `max-w-[120px]`. Nếu áp đặt `max-w-[120px]` lên pill người chơi trong `FloatingBadge`, test này sẽ fail.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Clean Event Description Invariant**:
     - `cleanEventDescription` bóc tách tiền tố lặp trước dấu hai chấm (`: `), chỉ giữ lại mệnh đề tác động kinh tế/tài chính cốt lõi trên thông báo pop-up.
  2. **Short Bot Name Invariant**:
     - `formatShortPlayerName` sử dụng regex hẹp `/\s*\((?:Aggressive|Cautious|Balanced|Bot)\)/i` để lược bỏ hậu tố tính cách Bot AI (`Bot AI 3`), đồng thời bảo vệ 100% các nhãn danh xưng của người chơi thật (như `Đại Gia Sài Gòn (VIP)`).
  3. **Caller-Specified Duration Overriding Invariant**:
     - Bảo toàn nguyên vẹn hằng số fallback `EVENT_BANNER_DURATION_MS = 4500` trong `game_store.ts`. Tại caller `activity_tracker.ts`, truyền rõ ràng `durationMs: 3200` vào `addFloatingText` cho thẻ bài sự kiện.
  4. **Tap-To-Dismiss & WCAG AA A11y Invariant**:
     - `MilestoneBanner` bổ sung `pointer-events-auto cursor-pointer`, `tabIndex={0}`, `role="status"`, `aria-label="Thông báo sự kiện: nhấn để đóng"` cùng handlers `onClick` và `onKeyDown` (Enter/Space) gọi `removeFloatingText(item.id)`, trao quyền cho người chơi chủ động đóng banner ngay tức khắc nếu không muốn chờ hết thời gian.
  5. **Tightened Layout Budget Invariant**:
     - `MilestoneBanner` khống chế ở `max-w-[88vw] sm:max-w-[380px]`; `MarketEventTicker` thu gọn ở `max-w-[90vw] sm:max-w-md md:max-w-xl` với `py-1.5 sm:py-2`, kết hợp `min-w-0 flex-1 truncate` trên tiêu đề, đảm bảo không che khuất sa bàn 3D và không tràn lề 360px.
  6. **Capsule Isolation Invariant**:
     - Pill người chơi trong `FloatingBadge` sử dụng `max-w-[110px] sm:max-w-[150px]` để tương thích 100% với hợp đồng test `TC-IMP123.15` và bảo đảm tính thẩm mỹ trên màn hình nhỏ.

---

### 208. [BOT/NET][FSM] Điều Hòa Nhịp Độ Hành Động Bot AI, Đấu Giá Từng Bước & Banner Minh Bạch Kết Quả Đấu Giá (IMP-155)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Đấu Giá Đồng Bộ Chớp Nhoáng Khiến Người Chơi Choáng Ngợp*:
     - Trước đây, khi bot từ chối mua đất hoặc kích hoạt đấu giá, FSM gọi `resolveAuctionBots` đồng bộ giải quyết toàn bộ phiên đấu giá trong 1 nhịp duy nhất. Kết quả là người chơi không kịp theo dõi bot nào trả giá, giá tăng từng bước ra sao.
  2. *Bẫy Xung Đột Gia Hạn Anti-Sniping Của Người Chơi Và Lỗi Cộng Dồn Timer 73s*:
     - Theo Gotcha #21 (Anti-Sniping), người chơi chỉ được cộng +3.000ms khi đặt giá ở thời điểm `<= 3s`. Trước đây, khi bot đặt giá hoặc pass liên tục, công thức `Math.max(session.endTime ?? 0, Date.now()) + 10_000` cộng dồn vào `endTime` sẵn có, khiến timer phiên đấu giá leo thang lên tới 73 giây. Cần chuẩn hóa gán trần cố định `Date.now() + 15_000`.
  3. *Bẫy Kẹt Lượt Headless Simulation Khi Xóa Bỏ Gọi Đồng Bộ*:
     - Khi xóa các lệnh gọi `resolveAuctionBots` khỏi các hàm xử lý bot, vòng lặp mô phỏng headless `runBotTurn` (sử dụng trong Chaos Monkey 1.000 ván và golden stream) bị kẹt ở `AuctionPhase` vì không có `TurnOrchestrator` hẹn giờ nền để gọi `stepAuctionBot`.
  4. *Bẫy Tàng Hình Kết Quả Đấu Giá (Modal Đóng Đột Ngột)*:
     - Khi phiên đấu giá kết thúc, FSM chuyển sang `PropertyManagement`. Client trước đây lập tức gọi `state.closeModal()`, khiến người chơi không nhìn thấy kết quả ai thắng thầu, giá trúng là bao nhiêu hoặc đất có bị phát mãi Kho Bạc 70% hay không.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Paced Bot Auction Stepping**:
     - Trong trận đấu trực tuyến, `TurnOrchestrator` điều phối từng bước qua `this.rooms.stepAuctionBot(roomCode)` với độ trễ `AUCTION_BOT_STEP_DELAY_MS = 1000ms`. Trong chế độ headless (`runBotTurn`), vòng lặp `while (room.phase === AuctionPhase)` chủ động bước từng nhịp qua `stepAuctionBot` cho tới khi phiên đấu giá hoàn tất, bảo toàn 100% liveness của Chaos Monkey.
  2. **Role-Aware Time Extension Invariant & Timer 73s Fix (IMP-156)**:
     - Lệnh đặt giá của người chơi thật tuân thủ tuyệt đối Gotcha #21 (+3.000ms khi `<= 3s`). Khi người ra quyết định là Bot (`player.isBot`), hệ thống khống chế trần thời gian với `session.endTime = Date.now() + 15_000`, triệt tiêu hoàn toàn lỗi cộng dồn thời gian tích lũy `Math.max(session.endTime ?? 0, Date.now()) + 10_000` khiến timer bị đẩy lên 73 giây làm người chơi phải chờ đợi vô lý.
  3. **Auction Transparency Settle Delay**:
     - Khi phiên đấu giá đóng, `RoomManager` lưu `lastAuctionResult` và broadcast `DeltaPayload.auction` mang cờ `isConcluded: true`, `winnerId`, `finalPrice`, `isForeclosure: !winnerId`. Client giữ nguyên modal hiển thị banner kết luận (màu hổ phách nếu thắng búa hoặc màu xám nếu phát mãi) trong `AUCTION_SETTLE_DELAY_MS = 2500ms` trước khi `TurnOrchestrator` dọn dẹp kết quả và kích hoạt lượt kế tiếp.
  4. **Multi-Class Z-Index Retention (Gotcha #31)**:
     - Container `MilestoneBanner` kết hợp đồng thời `z-30 z-[60]` để thỏa mãn cả hợp đồng kiểm thử tĩnh kế thừa `imp139`/`imp129` (`z-30`) vừa đẩy banner lên trên `ModalBackdrop` (`z-[60] > z-50`).

---

### 209. [NET/SYNC] Hybrid Socket Identity Guard — Chống Impersonation Nhưng Cho Phép Tab Refresh (IMP-156)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Trusted playerId*: `handleIntentMsg` nhận `msg.playerId` từ client và gọi `bindSocket()` vô điều kiện, cho phép attacker gửi intent giả mạo player khác bằng cách tự khai `playerId`.
  2. *Bẫy Strict Reject Phá Vỡ Tab Refresh*: Nếu reject tuyệt đối mọi socket không khớp, player refresh trang (socket cũ đóng → socket mới gửi INTENT trước RECONNECT) sẽ bị lock out.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Hybrid Ownership Invariant**: `isSocketOwner(sockets, roomCode, playerId, socket)` tại `wss_lobby_handlers.ts` trả `true` khi: (a) socket === bound, (b) bound === undefined, (c) bound.readyState !== OPEN. Chỉ reject khi bound socket vẫn OPEN và khác socket gửi.
  2. **Guard Coverage**: Check áp dụng trên `handleIntentMsg`, `handleStartGame`, `handleLeaveRoom`, `handleEmote`, `handleResync`. Không áp dụng trên `handleCreateRoom`, `handleJoinRoom` (binding lần đầu).

---

### 210. [NET/SYNC] Triệt Tiêu Admin Secret Mặc Định — Production Crash Guard (IMP-156)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy DEFAULT_ADMIN_SECRET*: Constant `'vtcoon-admin-2026'` hardcoded tại `admin_types.ts:4`, sử dụng làm fallback trong constructor `AdminManager`. Attacker biết secret sẵn từ source code public.
  2. *Bẫy Ops Docs Sai Tên Biến*: `ops_runbook.md` ghi `ADMIN_SECRET`, code đọc `VTCOON_ADMIN_SECRET`.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Zero Default Secret Invariant**: CẤM tồn tại bất kỳ constant chứa giá trị bí mật mặc định. `AdminManager` constructor: production throw, dev warn + `this.secret = ''`.
  2. **Empty Secret Disabled Invariant**: `authenticate()` trả `false` ngay khi `this.secret` rỗng — admin panel tự disabled.

---

### 211. [NET/SYNC] WebSocket maxPayload 64KB & Byte Pre-Check Defense-in-Depth (IMP-156)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy maxPayload Mặc Định 100MB*: Thư viện `ws` mặc định cho phép frame 100MB. Attacker gửi payload lớn → RAM spike → crash server.
  2. *Bẫy toString() Trước Kiểm Tra Kích Thước*: `EnvelopeValidator.parseAndValidate()` gọi `raw.toString()` trước khi kiểm tra byte length → freeze main thread trên payload lớn.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **maxPayload 64KB Invariant**: `WebSocketServer` PHẢI có `maxPayload: 64 * 1024`. Giá trị này cho margin 6x so với `MAX_DELTA_BYTES` (10KB).
  2. **Byte Pre-Check Invariant**: `EnvelopeValidator` PHẢI kiểm tra `byteLength > 65_536` TRƯỚC `raw.toString()`.

---

### 212. [NET/SYNC] Path Traversal Guard — resolve + startsWith + Windows Separator Strip (IMP-156)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Regex Chỉ Strip Leading `..`*: `replace(/^(\.\.[/\\])+/, '')` chỉ loại bỏ `..` ở đầu. `path.normalize('/assets/../../etc/passwd')` → `/etc/passwd` → vẫn vượt khỏi staticDir.
  2. *Bẫy path.resolve Trên Windows*: `path.normalize('/')` trả `\` trên Windows. `path.resolve(staticDir, '\\')` → `C:\` (drive root) → file ngoài staticDir.
  3. *Bẫy decodeURIComponent*: URL malformed `%ZZ` gây throw uncaught exception.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Canonical Path Invariant**: `filePath = path.resolve(staticDir, safePath)` + `filePath.startsWith(resolvedStatic + path.sep)`. Trả 403 nếu vi phạm.
  2. **Windows Separator Strip Invariant**: `cleanPath.replace(/^[/\\]+/, '') || 'index.html'` — strip tất cả leading separators trước khi resolve, tránh bẫy `path.resolve(dir, '\\')` → drive root.
  3. **URI Decode Guard**: `decodeURIComponent` PHẢI nằm trong try/catch, trả 400 Bad Request khi malformed.

---

### 213. [NET/SYNC] PendingTradeManager Dual-Map Lifecycle — sessionsByOfferId Leak Fix (IMP-156)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Dual-Map Không Đồng Bộ*: `PendingTradeManager` dùng 2 map: `sessionsByRoom` và `sessionsByOfferId`. `resolveSession`, `cancelSession`, `checkTimeout` xóa `sessionsByRoom` nhưng KHÔNG xóa `sessionsByOfferId` → entry rò rỉ vĩnh viễn.
  2. *Bẫy clearSession Phantom*: `clearSession(roomCode)` tìm session qua `sessionsByRoom.get()` — trả `undefined` nếu đã bị xóa bởi resolve/cancel/timeout → `sessionsByOfferId` không bao giờ được dọn.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Dual-Map Sync Invariant**: Mọi thao tác xóa session PHẢI xóa ĐỒNG THỜI cả `sessionsByRoom` VÀ `sessionsByOfferId`. Thứ tự: xóa `sessionsByOfferId` TRƯỚC `sessionsByRoom`.

---

### 214. [UI/CARD] Single-Truth Event Description & Financial Destination Filtering (IMP-156B / IMP-157)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Double Paragraph Desktop*: `EventCardModal` cùng hiển thị `<p className="hidden sm:block">{resolvedDescription}</p>` và `<div data-testid="event-specs-table" className="hidden sm:flex"><p>{resolvedEffectDetail}</p>...</div>`. Trên màn hình lớn, 2 đoạn văn dài gần như giống hệt nhau (trùng lặp 95%) xếp chồng lên nhau, gây nghẽn thị giác và tạo cảm giác giao diện "quá nhiều chữ".
  2. *Bẫy Lặp Từ 5 Tầng (Word Loop)*: Thẻ `MC_FREEZE_TRADE` lặp lại cụm từ "Đóng băng" tới 5 lần qua Tiêu đề, Hero Stat, Paragraph 1, Paragraph 2 và chip dưới cùng.
  3. *Bẫy Rò Rỉ Pseudo-Destination*: Thuộc tính `destination` trong metadata thẻ phi tiền tệ chứa nguyên câu văn dài 43 ký tự ("Đóng băng các kênh thanh khoản thị trường") bị rò rỉ vào chip `🏛️` làm vỡ bố cục.
  4. *Bẫy Thắt Hẹp Khung Thẻ*: Chiều rộng 370px trên Desktop ép văn bản thành 4-5 dòng chen chúc, nút đóng chỉ 38px dưới chuẩn Apple HIG / Web 44px.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Single-Truth Description Invariant**: Tuyệt đối chỉ có 1 thẻ paragraph mô tả hiệu ứng được hiển thị trên mỗi viewport (`hidden sm:block` trên Desktop, `event-impact-summary` trên Mobile). Xóa bỏ hoàn toàn thẻ `<p>` thừa thãi bên trong `event-specs-table`.
  2. **Colon Prefix Stripping (`cleanEventDescription`)**: Tự động bóc tách tiền tố lặp trước dấu hai chấm và viết hoa ký tự đầu (vd: "Đóng băng thị trường: Tạm ngưng mua bán..." -> "Tạm ngưng mua bán...").
  3. **Financial Destination Filtering (`isFinancialDestination`)**: Chỉ render chip `🏛️` trên Desktop khi đích đến thực sự là một thực thể luân chuyển tiền tệ (Kho Bạc, Chủ Sở Hữu Ô, Đối Thủ, hoặc Tài Khoản khi `effectDelta !== 0`). Chặn đứng 100% câu văn phi tiền tệ ("Đóng băng...", "Bảo toàn...").
  4. **Spacious Ergonomics**: Mở rộng bề ngang Desktop lên `sm:max-w-[420px]`, tăng kích thước nút đóng đạt chuẩn `min-w-[44px] min-h-[44px]`. Mobile (<640px) giữ nghiêm ngặt ngân sách 2 badge (`🎯`, `⏳`).

---

### 215. [FSM/NET][SEC] Auction Pass State Persistence & Compulsory Buyout Deadlock Resolution (IMP-154)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Xóa Trạng Thái hasPassed Khi Nhận Delta Mới*:
     - Khi một người chơi đã ấn rút lui trong phiên đấu giá (`hasPassed: true`), mỗi khi server phát sóng delta mới (như có người chơi khác đặt giá), `openModal('auction', delta.auction)` ghi đè toàn bộ payload của modal. Do payload thiếu `passedPlayerIds`, cờ `hasPassed` bị xóa sạch (undefined), làm nút Rút Lui sáng trở lại và người chơi có thể tiếp tục đặt giá trái luật.
  2. *Bẫy Bế Tắc Vĩnh Viễn Compulsory Buyout (CC_SWAP_PROJECT)*:
     - `EnvelopeValidator` chưa khai báo `INTENT_EXECUTE_COMPULSORY_BUYOUT` và `INTENT_DECLINE_COMPULSORY_BUYOUT` trong `VALID_INTENTS`, trả về `INVALID_INTENT`.
     - `IntentGuard` từ chối người mua gửi intent ngoài lượt với lỗi `OUT_OF_TURN`.
     - `TurnWatchdog.checkRoom` không kiểm tra `checkPendingBuyoutTimeout`, khiến phiên thâu tóm hết hạn bị treo vĩnh viễn trên `room.pendingBuyout`.
     - `executeEmergencyRecovery` không dọn dẹp `room.pendingBuyout = null`, làm hàm `handleEndTurn` bị block vô thời hạn (kẹt bàn chơi).
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Auction Pass State Persistence Invariant**:
     - `AuctionPayload` bắt buộc mang `passedPlayerIds?: readonly string[]`. Server trích xuất `passedPlayerIds` từ `session.passedPlayers`.
     - Client `syncBusinessModals` khi nhận `delta.auction` PHẢI duy trì `hasPassed: true` nếu (a) `prevPayload.hasPassed === true` hoặc (b) `myPid` nằm trong `delta.auction.passedPlayerIds`.
  2. **Compulsory Buyout Deadlock Resolution Invariants**:
     - `VALID_INTENTS` tích hợp đầy đủ hai intent `INTENT_EXECUTE_COMPULSORY_BUYOUT` và `INTENT_DECLINE_COMPULSORY_BUYOUT`. Intent thực thi bắt buộc kiểm chuẩn `typeof it['cellIndex'] === 'number'`.
     - `IntentGuard.isPhaseSpecificAllowed` cho phép người chơi thực thi/từ chối khi `room.pendingBuyout?.buyerId === playerId`.
     - `TurnWatchdog` tự động kiểm tra `checkPendingBuyoutTimeout` mỗi nhịp quét và dọn `room.pendingBuyout = null` trước khi `executeEmergencyRecovery` ép bàn chơi chuyển lượt.

---

### 216. [UI/CRAFT] Auction Arena Card De-Nesting, Unified Podium & 360px Layout Budget (IMP-159)
- **Bối cảnh & Bẫy thực tế**:
  1. *Hội chứng lồng thẻ đa tầng (Card Nesting Syndrome)*: Giao diện sàn đấu giá cũ có tới 12 đường viền `border-slate-300` và 6 sắc độ nền lộn xộn (`#FFFBEB`, `#F7F2E7`, `#FAF6EC`, `white/80`, `white/90`, `bg-slate-900`), khiến modal trông như một bảng kê khai thuế hành chính thay vì sàn đấu giá hào hứng của game cờ tỷ phú.
  2. *Bục đấu giá chắp vá (Mismatched Podium)*: Khối giá thầu nền đen sì đứng cạnh khối người dẫn đầu nền trắng nhợt nhạt, phá vỡ tính đồng nhất thị giác.
  3. *Bẫy tràn ngang Mobile 360px (Participant Overflow)*: Đặt danh sách người chơi thành dải ngang với avatar, tên, số dư ví và badge dẫn đầu sẽ vượt quá 332px bề ngang khả dụng trên màn hình di động nhỏ, gây tràn ngang (Horizontal Overflow).
  4. *Bẫy mất Palette SSOT*: Đổi tùy tiện nền modal sang `#FFFDF9` làm rớt toàn bộ suite kiểm thử `imp61` do không khớp `BRIGHT_PAPER_OR_FELT_REGEX` và `TC-61.12`.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Tabletop Palette SSOT Invariant**: Root container của AuctionModal bắt buộc giữ nguyên nền ngà ấm `#FFFBEB` và bóng xúc giác `shadow-[0_4px_0_0_#b45309]` để tuân thủ 100% hợp đồng bàn cờ.
  2. **Zero Card-Nesting & Whitespace Hierarchy**: Khử bỏ toàn bộ `border-slate-300` và nền xám bẩn `#F7F2E7`. Dùng nền trong sáng `bg-amber-50/40` và đường phân tách thanh mảnh `divide-amber-900/10` để tạo chiều sâu tự nhiên.
  3. **Unified Arena Podium**: Tích hợp tiêu đề nhỏ `GIÁ THẦU HIỆN TẠI`, bộ đếm thời gian `THỜI GIAN CÒN LẠI:`, flip-counter vàng hổ phách trên nền sẫm và dòng `DẪN ĐẦU:` (`👑` + tên người chơi hoặc `Chưa có ai`) vào duy nhất 1 bục đấu giá có `data-testid="auction-unified-podium"`.
  4. **Mobile 360px Safe Vertical Participant Strip**: Danh sách người chơi bắt buộc hiển thị dạng hàng dọc tối giản không border thô cứng, kèm `truncate max-w-[120px]` và `min-w-0`, đánh dấu `(Bạn)` cho người chơi thật và huy hiệu `👑 Dẫn đầu` cho người trả giá cao nhất.
  5. **Actor Inversion & Foreclosure Defense**: Luôn bảo toàn trạng thái ẩn 3 nút bid khi `isLeading = true` ("Bạn đang dẫn đầu mức giá cao nhất!"), banner phát mãi cưỡng chế (-30%), cảnh báo cấn trừ nợ cho con nợ và touch targets WCAG AA (`min-h-[44px]`).

---

### 217. [NET/UI][FSM] Ghost Auction Modal Loop & Business Lifecycle Settlement Hardening (IMP-160)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Kẹt Sàn Đấu Giá Ma (Ghost Auction Modal Loop)*: Khi phiên đấu giá kết thúc gõ búa (`isConcluded: true`), `apply_delta.ts` trước đó có điều kiện `if (!currentPayload?.isConcluded) state.closeModal()`. Điều này khiến khi nhận `delta.auction === null` (hoặc phase chuyển sang lượt tiếp theo), modal kết luận bị chặn không cho đóng tự động, kẹt lơ lửng trên màn hình vô thời hạn.
  2. *Bẫy Settle Timer Bị Clear Nhầm Bới Intent Hoặc clearRoom*: Khi phiên kết thúc, orchestrator lên lịch settle 2.5s để dọn dẹp `lastAuctionResult`. Nếu lưu timer vào `activeTimers` hoặc `registerTimer`, các lệnh `clearRoom(roomCode)` từ turn loop thông thường sẽ hủy nhầm timer settle, khiến `lastAuctionResult` tồn dư vĩnh viễn và liên tục được gửi trong mọi delta sau đó.
  3. *Bẫy Cross-Auction Collateral Damage*: Nếu timer settle của phiên A nổ trong khi phiên B mới hơn vừa diễn ra trên cùng phòng, timer A sẽ xóa sổ nhầm kết quả của phiên B nếu không kiểm tra `auctionKey`.
  4. *Bẫy Tàn Dư Modal Chứng Khoán HOSE*: Kết quả chứng khoán HOSE (`lastHoseResult`) của lượt trước không được dọn dẹp ở biên lượt (`handleRollDice`), làm modal HOSE kết quả cũ bật lại ngoài ý muốn ở lượt người chơi kế tiếp.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Dedicated Settle Timer Isolation**: `TurnOrchestrator` sở hữu map riêng `auctionSettleTimers` tách biệt với `activeTimers`. `clearRoom()` tuyệt đối không hủy settle timer; chỉ có `destroyRoom()` hoặc `onGameOver()` mới dọn dẹp.
  2. **Cross-Auction Key Guard**: `scheduleAuctionSettle` tính toán `effectiveKey = auctionKey ?? \`${cellIndex}:${winnerId}:${winningBid}\``. Khi timer nổ, nếu `auctionKey !== undefined && auctionKey !== latestKey`, lập tức return sớm để bảo toàn phiên mới hơn.
  3. **Turn Boundary Strict Cleanup**: Ở đầu `handleRollDice`, server bắt buộc dọn sạch cả `clearLastAuctionResult(roomCode)` (`room.lastAuctionResult = undefined`) VÀ `room.lastHoseResult = undefined`.
  4. **Wire Protocol Null-SSOT**: `buildDeltaFromRoom` luôn phát sóng tường minh `lastHoseResult: room.lastHoseResult ?? null` để client biết khi nào cần đóng modal kết quả chứng khoán.
  5. **Client Idempotent Projection & Zombie UI Defense**:
     - `syncBusinessModals`: Khi `delta.auction.isConcluded === true`, nếu phòng đã chuyển sang `WaitingRoll` hoặc `ActionPhase`, tuyệt đối không mở lại modal; nếu người dùng đã chủ động đóng (`activeModal !== 'auction'` và `lastDismissedAuctionKey === auctionKey`), không tự mở lại.
     - Khi `delta.auction === null && state.activeModal === 'auction'`: dọn `lastDismissedAuctionKey = null` và gọi `state.closeModal()` vô điều kiện.
     - `AuctionModal`: Khi `isConcluded === true`, header badge đổi thành `ĐÃ KẾT THÚC`, 3 nút nâng giá nhanh bị vô hiệu hóa `disabled` kèm `cursor-not-allowed opacity-50`, nút Auto-Bid bị khóa `disabled`, và footer chuyển thành nút `Đóng / Xem Bàn Cờ` kích hoạt `onClose`.

---

### 218. [FSM/RULE] Treasury Conservation Invariant — Mọi Khoản Trừ Player Phải Cộng Treasury (IMP-157)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Handler Chỉ Nhận `player` Param*: Nhiều chance card handler ban đầu chỉ khai báo `(player) => { player.balance -= X; }` mà không nhận `room` param. Khi metadata spec ghi "nộp vào Kho Bạc", handler thiếu `room.treasury += X` → tiền bốc hơi khỏi hệ thống.
  2. *Bẫy Audit Thiếu Cross-Reference*: Code review từng handler riêng lẻ không phát hiện lỗi vì logic `balance -= X` trông hợp lý. Chỉ khi cross-reference handler vs metadata spec (`destination: "Nộp vào Kho Bạc"`) mới phát hiện treasury leak.
  3. *Các thẻ đã bị leak*: `CC_PLATE_AUCTION` (-500), `CC_JUNK_STOCK` (-1500), `CC_CONCERT_SPONSOR` (-600), `MC_FIRE_INSPECTION` (phạt C1/C2/C3).
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Treasury Conservation Invariant**: Mọi handler trừ `player.balance` với destination "Kho Bạc" PHẢI có `room.treasury += amount`. Handler PHẢI nhận `room` param (pattern: `(_p, _pl, _id, _m, _r, _s, _b, room)`).
  2. **Audit Checklist**: Khi thêm/sửa event card, cross-reference 3 trường: (a) `effectDelta` trong metadata, (b) `destination` trong metadata, (c) `room.treasury` trong handler.

---

### 219. [FSM/RULE] Extra Turn Triệt Tiêu Skip — Không Để Player Mất Cả Hai (IMP-157)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Extra Turn Bị Skip Ăn*: Khi player có cả `extraTurns > 0` VÀ `skipNextTurn = true` (ví dụ: rút CC_PLATE_AUCTION rồi bị phạt bỏ lượt), code cũ tiêu hao `extraTurns -= 1` rồi kiểm tra `skipNextTurn` → phase = PropertyManagement. Player mất cả extra turn LẪN lượt chơi — bất công vì đã trả 500 Tr. cho extra turn.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Extra Turn Cancels Skip Invariant**: Tại `executeTurnEnd` trong `turn_loop.ts`, khi `extraTurns > 0`: trừ `extraTurns -= 1`, xóa `skipNextTurn = false` (nếu có), rồi set phase = `WaitingRoll`. Extra turn luôn cho player được tung xúc xắc.

---

### 220. [FSM/RULE] Bankrupt & Terminal Entity Absolute Isolation Invariant (IMP-158)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Zombie Entity Loop*: Khi có người chơi phá sản (`player.bankrupt === true`), các hàm duyệt danh sách `players` không lọc `!p.bankrupt` dẫn đến:
     - (a) Chuyển tiền bồi thường cho người đã chết (`CC_CONTRACT_PENALTY`).
     - (b) Tự in tiền ma khi trừ tiền người chết để cộng cho người rút thẻ (`CC_FRANCHISE`).
     - (c) Kéo toạ độ người chết đi xem ca nhạc và trừ tiền thuê (`MC_MEGA_CONCERT`).
     - (d) Chọn người chết làm đối tượng nhận kích cầu (`MC_CASINO_PILOT`) hoặc rút ruột Kho Bạc trả thưởng hạ tầng (`MC_PUBLIC_INVEST`).
     - (e) Tính cả người chết vào mẫu số quy mô pool (`distributeCellPool`), làm phình to dòng tiền thưởng.
     - (f) Tạo `pendingBuyout` với người chết làm treo FSM 15s (`compulsory_buyout.ts`).
  2. *Bẫy nuốt context Kho Bạc*: Khi tất cả đối thủ đều chết, tiền phạt không có người nhận sẽ bốc hơi nếu handler không có context `room.treasury`.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Bankrupt Isolation Mandate**: Mọi domain service, card handler, hoặc quy trình duyệt `Player[]` BẮT BUỘC phải lọc qua `alivePlayers = players.filter(p => !p.bankrupt)`. Người chết: 0 nhận tiền, 0 bị trừ tiền, 0 đổi vị trí, 0 tính vào pool length, 0 tham gia mua lại cưỡng chế.
  2. **Treasury Fallback**: Mọi khoản phạt hoặc bồi thường khi không còn đối thủ sống sót (`opponents.length === 0`) BẮT BUỘC nộp vào Kho Bạc Nhà Nước (`room.treasury += amount`), tuyệt đối không để thất thoát dòng tiền.

---

### 221. [UI/CRAFT][SAFARI] Bất Biến Chân Trang Sticky Độc Lập, Touch Target 44px & Công Thái Học Mobile 360px (Sticky Action Footers & 360px Ergonomics - IMP-161)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Sticky Trong Cột Flex Bị Gãy Bối Cảnh (Broken Flex Column Sticky Trap)*: Khi đặt khối hành động `sticky bottom-0` bên trong Cột 2 (Cánh phải) của modal, trên màn hình di động khi layout chuyển sang flex-col (1 cột), Cột 1 (Hồ sơ BĐS & Phân khu) dài 500px nằm phía trên. Do bối cảnh cuộn sticky chỉ có hiệu lực bên trong container cha trực tiếp của Cột 2, người chơi trên mobile phải cuộn hết 500px của Cột 1 mới nhìn thấy các nút đặt giá và nút rút lui. Khi Cột 2 chưa vào tầm nhìn, sticky hoàn toàn không hoạt động. Ngoài ra, trên Desktop, việc dùng margin âm `-mx-5` bên trong Cột 2 làm khối footer tràn mép đè lấn sang Cột 1.
  2. *Bẫy Teo Chữ Tên BĐS Khi Mở Rộng Nút Chữ 44px Trên Màn Hình 360px (Title Squeeze Layout Overflow Trap)*: Trong `property_portfolio_modal.tsx`, khi nâng cấp các nút hành động dạng text dài (`🤝 Đàm Phán`, `🔍 Xem Ô`) lên chuẩn `min-h-[44px]` kèm padding, trên viewport 360px (chỉ có ~332px chiều rộng khả dụng), 2 nút hành động chiếm tới 180px bề ngang. Hàng flex co rút tên BĐS còn lại đúng 8px khiến tên biến thành dấu ba chấm cụt lủn `...`.
  3. *Bẫy Trình Duyệt Di Động (Mobile Browser Safari/WebKit Dynamic Viewport & Truncate Trap)*:
     - Trên iOS Safari, việc sử dụng `max-h-[90vh]` khiến modal bị thanh địa chỉ (URL address bar) và thanh công cụ dưới đáy che khuất phần chân trang khi thanh này bung ra. Bắt buộc dùng `max-h-[90dvh]` (Dynamic Viewport Height).
     - Trên Safari WebKit, thuộc tính `truncate` (`text-overflow: ellipsis`) trên thẻ flex child không hoạt động nếu phần tử con hoặc container cha thiếu `min-w-0`, dẫn đến tràn ngang (horizontal overflow).
  4. *Bẫy Bất Đối Xứng Chiều Cao Lưới Nút Khi Nội Dung Khác Nhau (Button Grid Asymmetry Trap)*: Trong `compulsory_buyout_modal.tsx`, nút 1 chỉ có 1 dòng chữ ("Từ Chối"), nút 2 có 2 dòng chữ kèm số tiền ("Xác Nhận Mua Lại / 1.500 Tr."). Khi nút 1 dùng `py-3` và nút 2 dùng `py-2`, trên CSS Grid 2 cột, 2 nút bị lệch đường đáy và khác biệt chiều cao thị giác.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Root-Level Sticky Action Footer Invariant**:
     - Mọi cụm nút hành động quyết định thời gian thực (Đấu giá, HOSE) BẮT BUỘC được trích xuất thành khối Footer ghim cố định độc lập ở đáy root modal: `sticky bottom-0 -mx-3.5 -mb-3.5 sm:-mx-5 sm:-mb-5 p-3.5 sm:p-4 bg-[#FFFBEB] z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]`.
     - Trên mobile: Nút bấm luôn nổi trên màn hình ngay khi mở modal, người chơi không phải cuộn để thao tác.
     - Trên desktop: Footer trải đều toàn bộ bề ngang modal, không xâm lấn giữa các cột.
  2. **Mobile Icon Button Condensation Invariant**:
     - Khi không gian ngang hàng danh sách BĐS hẹp (< 640px), các nút hành động phụ trợ BẮT BUỘC chuyển đổi thành icon nút chạm vuông chuẩn `min-h-[44px] min-w-[44px]` (chỉ hiện icon `🤝`, `🔍`, ẩn nhãn chữ `hidden sm:inline`).
     - Tiết kiệm >= 60px bề ngang, bảo vệ 100% không gian hiển thị cho tiêu đề và tên BĐS.
  3. **Cross-Browser Dynamic Viewport & WebKit Truncate Invariant**:
     - Toàn bộ modal có nội dung dài hoặc cuộn BẮT BUỘC sử dụng `max-h-[90dvh] overflow-y-auto`.
     - Toàn bộ flex container chứa văn bản cần cắt bớt BẮT BUỘC bổ sung `min-w-0` để bảo đảm `truncate` hoạt động chuẩn trên Safari WebKit.
     - Toàn bộ nút bấm và chip tương tác bổ sung `touch-manipulation` để triệt tiêu 300ms tap delay trên di động.
  4. **Equal Height Grid Button Invariant**:
     - Các nút đặt cạnh nhau trong CSS Grid hành động BẮT BUỘC dùng chung thuộc tính chiều cao `h-full min-h-[48px]` kết hợp `flex items-center justify-center` để tự động kéo dãn khớp 100% chiều cao và đường đáy, bất kể số dòng văn bản bên trong.

---

### 222. [3D/RENDER][SAFARI] Bất Biến Polyfill W3C roundRect, WebGL Context Loss & Phòng Thủ Rò Rỉ Bộ Nhớ Audio/Texture (IMP-162)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy Safari Legacy WebKit crash do thiếu `roundRect`*: Trên iOS Safari < 16.0 và một số trình duyệt nhúng WebKit, `CanvasRenderingContext2D.prototype.roundRect` không tồn tại, khiến các thủ tục vẽ Canvas 2D / procedural texture crash `TypeError: ctx.roundRect is not a function`.
  2. *Bẫy WebGL Context Loss trên thiết bị di động*: Khi mobile device chuyển tab, chạy đa nhiệm hoặc tràn VRAM, trình duyệt phát sự kiện `webglcontextlost`. Nếu thiếu `e.preventDefault()`, WebGL context bị huỷ vĩnh viễn không thể khôi phục, dẫn đến màn hình đen bàn cờ. Đồng thời khi context được phục hồi (`webglcontextrestored`), các texture cũ đã bị vô hiệu hóa nhưng vẫn nằm trong cache Map, dẫn đến lỗi render texture đen hoặc memory leak.
  3. *Bẫy rò rỉ WebAudio Node & Dangling Timers*: Khi modal (như HOSE) phát âm thanh sàn giao dịch, nếu người dùng tắt tiếng (`isMuted: true`), các AudioNode vẫn có thể được tạo vô ích. Khi AudioContext ở trạng thái `suspended`, sự kiện `onended` không bao giờ bắn, khiến các AudioNode và gain node không được `disconnect()`, dẫn đến rò rỉ audio bus.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **W3C Standard roundRect Polyfill Invariant**:
     - Chuẩn hóa tọa độ âm theo W3C spec: `if (w < 0) { x += w; w = -w; } if (h < 0) { y += h; h = -h; }`.
     - Kiểm tra bán kính không âm: ném `RangeError` nếu có bán kính < 0 hoặc NaN.
     - Tỷ lệ co giãn tỉ lệ W3C (proportional scaling factor): khi tổng bán kính các góc liền kề vượt quá chiều rộng hoặc chiều cao, bắt buộc tính hệ số `scale` co đồng bộ toàn bộ bán kính để tránh tự giao cắt (self-intersecting).
  2. **WebGL Context Loss Interception & Cache Purge Invariant**:
     - `webglcontextlost`: BẮT BUỘC `e.preventDefault()` để cho phép trình duyệt kích hoạt phục hồi WebGL.
     - `webglcontextrestored`: BẮT BUỘC gọi `clearAll3DTextureCaches()` để giải phóng GPU memory cũ và giải phóng toàn bộ 6 cache textures 3D (`tile`, `standee`, `mascot`, `heritage`, `price`, `emote`).
     - Mọi hàm xóa cache texture 3D BẮT BUỘC duyệt qua các instance CanvasTexture / Texture và gọi `.dispose()` trước khi `.clear()`.
  3. **WebAudio Node Idempotent Disposal & Fallback Invariant**:
     - Kiểm tra `useAudioStore.getState().isMuted` trước khi khởi tạo bất kỳ oscillator hay gain node nào.
     - Cleanup function phải idempotent (chỉ dọn 1 lần), bọc `disconnect()` trong try/catch để nuốt lỗi DOMException.
     - Thiết lập timer dự phòng 1200ms kích hoạt cleanup phòng khi AudioContext bị suspended hoặc tab bị background.
---

### 223. [NET/FSM/BOT] Đồng Bộ Đa Tầng Lượt Đi Bổ Sung (Extra Turns), Dọn Dẹp Vòng Đời Thẻ Sự Kiện & Chống Spam Đàm Phán Bot (IMP-164)
- **Bối cảnh & Bẫy thực tế**:
  1. *Bẫy mất đồng bộ Extra Turns & Drop Sparse Delta*: Khi người chơi nhận thêm lượt (như thẻ `CC_PLATE_AUCTION`), FSM server giữ `currentPlayerIndex` không đổi và reset về `TurnPhase.WaitingRoll`. Tuy nhiên Sparse Broadcaster so sánh người chơi mà bỏ qua `extraTurns`, khiến gói Delta không mang theo cờ cập nhật. Đồng thời Client Store không reset `hasRolledThisTurn` khi nhận `WaitingRoll` nếu ID người chơi không đổi, dẫn đến ActionDock bị khóa nút Roll hoặc quăng lỗi `INVALID_PHASE`.
  2. *Bẫy thẻ sự kiện ma vắt qua nhiều lượt (Dangling Event Card)*: `room.lastEventCard` không được xóa khi kết thúc lượt hoặc khi bắt đầu gieo xúc xắc lượt mới, khiến UI hiển thị thẻ cũ dai dẳng sang lượt người chơi tiếp theo.
  3. *Bẫy lợi dụng chuyển nhượng P2P khi âm tiền (Insolvent Trade Exploit)*: Người chơi hoặc bot có số dư âm (`balance < 0`) thực hiện giao dịch đổi đất (swap, `price = 0`) hoặc mua đất trả chậm, trốn tránh cơ chế cưỡng chế thanh lý tài sản nợ của FSM.
  4. *Bẫy bot spam đề xuất đàm phán dồn dập (Bot Trade Harassment)*: Nhiều Bot trong cùng một vòng chơi thi nhau gửi đề xuất mua đất tới cùng một người chơi, hoặc một Bot bị từ chối liên tiếp nhưng vẫn gửi lại ngay sau 1 vòng.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Full-Stack Extra Turns Synchronization Invariant**:
     - `PlayerDelta` và `PlayerHudInfo` bắt buộc chứa `extraTurns?: number;`.
     - `OPTIONAL_PLAYER_KEYS` trong `apply_delta_players.ts` bắt buộc map `'extraTurns'`.
     - `isPlayerEqual` trong `delta_broadcaster.ts` bắt buộc so khớp `(a.extraTurns ?? 0) === (b.extraTurns ?? 0)`.
     - `apply_delta.ts`: Khi nhận `turnPhase === TurnPhase.WaitingRoll`, bắt buộc `state.setHasRolledThisTurn(false)`.
     - `declareBankruptcy` & `coordBankruptcy`: Bắt buộc dọn sạch `player.extraTurns = 0` để tránh tạo ra phantom turns.
  2. **Event Card Lifecycle Purge Invariant**:
     - `Room.lastEventCard?: EventCardInfo | null;` cho phép giá trị `null` làm tombstone.
     - `executeTurnEnd` (cả nhánh `extraTurns > 0` và nhánh chuyển lượt thông thường) và `executeTurnRoll` (đầu hàm gieo xúc xắc) BẮT BUỘC gán `room.lastEventCard = null;`.
  3. **Insolvent Buyer Protection & Solvency Guard**:
     - Trong `coordTrade`, `coordRespondTradeOffer`, `validateP2PTrade`: Bên Mua có `balance < 0` BẮT BUỘC bị từ chối với `ActionRejectReason.INSUFFICIENT_FUNDS`.
     - Bên Bán có `balance < 0` CHỈ ĐƯỢC PHÉP bán tài sản thu tiền mặt ròng (`price > 0`) để giải cứu dòng tiền nợ; cấm tuyệt đối hoán đổi tài sản không thu tiền mặt (`price <= 0`).
  4. **Room-Level Target & Persistent Rejection Anti-Spam Guard**:
     - `Room.lastTargetTradeOfferRound`: Mỗi người chơi chỉ nhận tối đa 1 đề xuất giao dịch từ TẤT CẢ các Bot trong cùng 1 round (`if (room.lastTargetTradeOfferRound?.[targetId] === currentRound) continue;`).
     - Ghi nhận `lastTargetTradeOfferRound` ngay khi Bot sinh intent và khi tạo `pendingTradeOffer`.
     - Nếu một ô đất bị từ chối `>= 2` lần (`cellTradeRejections >= 2`), thời gian cooldown kéo dài thành 4 round (`currentRound - lastRejected < 4`).
     - Khi giao dịch thành công, xóa sạch bộ nhớ từ chối `cellTradeRejections` của ô đất đó.

---

### 224. [NET/SYNC] Server Slot Assignment Tuyệt Đối — Zero Client PlayerId Trust (IMP-165)
- **Bẫy nghiệp vụ**: Nếu server tin tưởng `msg.playerId` từ client khi xử lý `JOIN_ROOM`, nhiều khách vào cùng URL sẽ đồng loạt gửi `playerId: 'p2'`, gây ra trùng lặp playerId trong `room.players` và conflict state.
- **Ràng buộc cứng**:
  1. `handleJoinRoom` BẮT BUỘC tìm slot trống từ `candidateSlots = ['p2', 'p3', 'p4']` thay vì dùng `msg.playerId`.
  2. `doJoinRoom` trong `room_manager_lifecycle.ts` BẮT BUỘC có 2 guards: `room.players.length >= 4` (return undefined) VÀ `room.players.some(p => p.id === playerId)` (return undefined).
  3. Phản hồi `ROOM_JOINED` phải chứa đúng `playerId: assignedPlayerId` (slot server cấp) chứ không phải `msg.playerId`.
  4. `LOBBY_UPDATE` broadcast đến **tất cả** socket trong phòng sau mỗi JOIN hoặc LEAVE để đồng bộ UI sảnh chờ.
- **Tech Debt TD-IMP165-01**: Logic đóng phòng cũ khi trùng `hostId` tại `wss_lobby_handlers.ts` vẫn tồn tại. Xác suất collision 1/1.000.000 — chưa xử lý trong slice này.
- **Traceability**: `[TC-IMP165.02..05]`, `[TC-IMP165.06]`

---

### 225. [NET/SYNC][BOT/AI] Pre-Game Guest Disconnect — Lobby Guard (Không Bot Takeover) (IMP-165)
- **Bẫy nghiệp vụ**: `handleGraceExpired` trong `reconnect_manager.ts` gọi `BotEngine.takeover` cho mọi player — bao gồm cả khách disconnect trong lobby chưa bắt đầu trận, tạo ra "zombie Bot" nằm lỳ trong sảnh.
- **Ràng buộc cứng**:
  1. Trong `handleGraceExpired`: Nếu `room && !room.started` VÀ player là **khách** (không phải host): BẮT BUỘC remove player khỏi `room.players`, broadcast `LOBBY_UPDATE`, rồi **return** — tuyệt đối không gọi `BotEngine.takeover`.
  2. Host pre-game disconnect: Giữ host trong phòng (không remove, không takeover) — bảo toàn quyền chủ phòng.
  3. `startGracePeriod`: Khi phòng chưa bắt đầu và player là khách, không broadcast `PLAYER_GRACE` đến các socket khác.
  4. UC-GAME-006/007/008 (Grace Period → Reconnect → Bot Takeover) chỉ áp dụng khi `room.started === true`.
- **Traceability**: `[TC-IMP165.11]`, `[TC-NET04.1..3]` (reconciled với IMP-165)

---

### 226. [NET/SYNC] WS Store Wiring Invariant — Gọi Store Trực Tiếp, Không Phụ Thuộc Callback Chain (IMP-165)
- **Bẫy nghiệp vụ**: Handler trong `ws_message_handler.ts` chỉ gọi `ctx.onLobbyUpdate?.(msg.players)` — nếu caller (như `use_app_session.ts`) không truyền callback này, toàn bộ luồng store update bị câm silently ở runtime. Test suite xanh vì test gọi store trực tiếp, không qua React Hook.
- **Ràng buộc cứng**:
  1. Bất kỳ store action nào cần kích hoạt từ WS message BẮT BUỘC được gọi **trực tiếp** trong `handleWsMessage` (`useLobbyStore.getState().syncLobbySlots?.(...)`), KHÔNG chỉ qua `ctx.onXxx?.()` tùy chọn.
  2. Callback tùy chọn `ctx.onXxx` là defence-in-depth cho UI layer — được gọi SAU lệnh store trực tiếp.
  3. Pattern đúng cho mọi WS message kích hoạt store: `store.getState().action?.(data); ctx.onCallback?.(data);`
  4. Test phải cover luồng xuyên suốt qua React Hook thật — KHÔNG chỉ gọi store trực tiếp trong test body.
- **Traceability**: IMP-165 post-review fix (`use_app_session.ts` + `ws_message_handler.ts`)

---

### 227. [NET/TELEMETRY][ADM] Method Extraction Context Binding & Dice Tuple Compatibility in Telemetry Log Enrichment (IMP-166)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Unbound Method Extraction*: Các bộ kiểm thử và component giám sát telemetry thường trích xuất hàm getter (`const vitalsGetter = adminManager.getServerVitals; vitalsGetter?.()`, hoặc `const getter = reconnectManager.getGraceRemainingSeconds; getter?.(...)`) mà không gọi qua phương thức đối tượng có ngữ cảnh `this`. Khai báo dưới dạng method thông thường (`getServerVitals() { ... }`) sẽ dẫn tới `TypeError: Cannot read properties of undefined` do mất ngữ cảnh `this`.
  2. *Dirty Double Cast trong Server Core*: Cố tình dùng `(roll.dice as unknown as { dice: number[] })` để lấy mảng xúc xắc sẽ vi phạm quy tắc Hiến pháp (Constitution Invariant: cấm tuyệt đối `as unknown as` trong Domain & Server Logic).
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Bound Arrow Property Invariant**: Mọi phương thức telemetry, inspector và provider getter được trích xuất cho kiểm thử/giám sát BẮT BUỘC khai báo bằng cú pháp thuộc tính hàm mũi tên (arrow function property): `getServerVitals = (): ServerVitals => { ... }`, `isPlayerInGrace = (...) => { ... }`, `getGraceRemainingSeconds = (...) => { ... }` và phòng vệ an toàn với toán tử optional chaining `this?.rooms?.roomMap`.
  2. **Type-Safe Dice Tuple**: Cấu trúc `DiceResult` trong `dice.ts` bổ sung trường hợp lệ `readonly dice?: readonly [number, number]` song hành với `die1, die2`. Trình xử lý `handleIntentMsg` truy xuất an toàn `roll.dice.dice?.[0] ?? roll.dice.die1` mà không cần bất kỳ ép kiểu bẩn nào.
- **Traceability**: `[IMP-166/MSS]`, `[UC-GAME-ADM]`, `[TC-IMP166.01..15]`, `tests/contracts/constitution_governance.test.ts`.

---

### 228. [DOMAIN/NAME][UI/UX] Quirky English Animal Name Generator & Mobile 360px Touch Target Invariant
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. Khi người chơi tạo phòng hoặc tham gia phòng trực tuyến, nếu cho phép nhập tên tự do sẽ tiềm ẩn rủi ro về kiểm duyệt nội dung (toxic/vulgar names) và phá vỡ bố cục giao diện 360px (tên quá dài làm tràn ô thẻ). Ngược lại, tên mặc định cố định gây trùng lặp tên hiển thị giữa các người chơi.
  2. Các nút thao tác nhanh trên sảnh chờ (Sao chép mã phòng, Hướng dẫn, Mã QR) từng có chiều cao `min-h-[40px]` hoặc `min-h-[42px]`, vi phạm chuẩn công thái học di động 360px (tối thiểu `min-h-[44px] min-w-[44px]`).
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Kho từ vựng con vật ngộ nghĩnh (Quirky Animals)**: `src/domain/name_generator.ts` gồm 30 tính từ vui nhộn cổ điển (Sleepy, Sneaky, Dapper, Jolly, Grumpy, Cheerful,...) ghép với 30 loài động vật độc đáo (Panda, Otter, Badger, Llama, Capybara, Koala, Wombat,...). Độ dài kết quả khống chế chặt chẽ 10–16 ký tự, tương thích hoàn toàn với layout 360px và không có nguy cơ nội dung độc hại.
  2. **Khử trùng lặp trong bàn chơi (Collision-Free Guarantee)**: `generateUniqueAnimalName(existingNames)` bảo đảm 4 người chơi trong cùng một phòng luôn có tên khác biệt, không bao giờ trùng nhau.
  3. **Server-Authoritative Assignment**: Tên người chơi được cấp phát trực tiếp trên server tại `doCreateRoom` và `doJoinRoom` (`room_manager_lifecycle.ts`), phát thanh qua `LOBBY_UPDATE` để đồng bộ nhất quán tới toàn bộ client.
  4. **Chuẩn hóa Touch Target 44px**: Mọi nút hành động trong `pre_match_deck.tsx` (sao chép, mở luật chơi, mở QR) đều đáp ứng `min-h-[44px]`, đồng bộ hoàn toàn giữa `ui06_lobby_screen.test.ts` và `mobile_responsive_hud.test.ts`.
- **Traceability**: `tests/domain/name_generator.test.ts`, `tests/client/ui06_lobby_screen.test.ts`, `tests/client/mobile_responsive_hud.test.ts`, `tests/server/imp165_multiplayer_lobby_sync.test.ts`.

---

### 229. [PERF/LOG][OPS/CLEANUP] Async Buffered Persistent Logger & Fast 3-Minute Unstarted Lobby Teardown
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Đồng bộ I/O nghẽn Event Loop (Synchronous Disk I/O Bottleneck)*: Khi ghi nhận nhật ký trận đấu (`persistent_room_logger.ts`), phương thức `appendFileSync` gây chặn luồng đơn của Node.js trong mỗi hành động gieo xúc xắc/giao dịch. Dưới tải đồng thời nhiều người chơi, việc truy cập đĩa đồng bộ làm gián đoạn việc phản hồi WebSocket và tính toán thời gian thực.
  2. *Sảnh chờ rác lãng phí bộ nhớ (Abandoned Lobby Bloat)*: Người chơi tạo phòng nhưng rời đi hoặc không bắt đầu trận đấu vẫn giữ tài nguyên phòng trong RAM suốt 10 phút mặc định (`DEFAULT_TIMEOUT_MS = 10 * 60 * 1000`). Điều này khiến sảnh chờ mồ côi tích tụ không cần thiết.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Async Buffered Write Flush (`PersistentRoomLogger`)**:
     - Lưu trữ tạm thời các dòng sự kiện trong `writeBuffer: Map<string, string[]>`.
     - `appendEvent()` chỉ đẩy sự kiện vào RAM buffer và lập lịch xả nền bất đồng bộ (`flushIntervalMs = 500ms`, sử dụng `.unref()` để không treo process).
     - Cập nhật manifest sự kiện tức thì trong RAM để đảm bảo tính sẵn sàng cao cho các truy vấn kiểm thử hoặc telemetry.
     - Bảo đảm xả cưỡng bức đồng bộ (`flushSync()`) khi gọi `finishRoomLog()`, `getRoomFullLog()` hoặc `stop()`.
  2. **Phân tầng Thời hạn Dọn Dẹp Phòng (`RoomCleanupScheduler`)**:
     - Khởi tạo hằng số `DEFAULT_LOBBY_TIMEOUT_MS = 3 * 60 * 1000` (3 phút).
     - Trong chu trình quét định kỳ (`sweep()`): Kiểm tra `const isLobby = room ? !room.started : true`. Nếu là sảnh chờ chưa bắt đầu, áp dụng `effectiveTimeout = this.lobbyTimeoutMs` (3 phút); nếu là trận đang chơi dở bị bỏ hoang, giữ nguyên 10 phút.
     - Tương thích ngược tuyệt đối: nếu `config.timeoutMs` được cung cấp mà không có `lobbyTimeoutMs`, tự động kế thừa giá trị đó.
- **Traceability**: `tests/server/persistent_room_logger.test.ts#TC-LOG01.11`, `tests/server/ops01_room_cleanup.test.ts#TC-OPS01.5`, `tests/simulation/imp165_four_player_gameplay_sync.test.ts`.

---

### 230. [SIMULATION/WS][TEST/HARNESS] Listener-Before-Send Client Handle, Stale Inbox Isolation & 4-Player Turn Lifecycle Invariant
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Tiêu thụ tin nhắn cũ làm sai lệch thời điểm kiểm thử (Stale Inbox Race Condition Trap)*: Trong mô phỏng WebSocket nhiều người chơi, mỗi hành động trên bàn cờ phát thanh `STATE_DELTA` tới toàn bộ client (`p1..p4`). Nếu client handle dùng cơ chế hàng đợi `inbox` thông thường kết hợp `waitFor((m) => m.type === 'STATE_DELTA')`, client sẽ lập tức lấy ra `STATE_DELTA` tồn đọng từ các lượt trước của người khác thay vì đợi server xử lý intent vừa gửi. Hệ quả: client gửi intent tiếp theo quá sớm khi server chưa chuyển pha, gây lỗi `OUT_OF_TURN` hoặc sai lệch lượt đi.
  2. *Điều kiện đợi cứng nhắc làm treo kiểm thử (Predictive Predicate Brittle Timeout Trap)*: Khi viết predicate cho `waitFor` đợi kết thúc lượt, nếu bắt buộc `currentTurnPlayerId !== prevPlayerId` thì test sẽ bị timeout 10s trong các tình huống hợp lệ của game: đổ xúc xắc đôi, thẻ Cơ hội cấp thêm lượt (`extraTurns > 0`), hoặc tài sản bị cưỡng chế phát mãi do chậm xây dựng (`processUnbuiltRounds`) giữ lượt để xử lý đấu giá.
  3. *Bẫy đấu giá phát mãi unbuiltRounds không người từ chối*: Khác với đấu giá do từ chối mua (`declinedPlayerId` là người vừa từ chối), đấu giá cưỡng chế do chậm xây dựng có `declinedPlayerId = ''`. Mọi người chơi còn sống đều đủ điều kiện; nếu chỉ cho các người chơi khác pass mà bỏ qua người giữ lượt, sàn đấu giá sẽ không thể đóng.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Listener-Before-Send Pattern (`sendAndWait`)**: Client handle kiểm thử mô phỏng BẮT BUỘC đăng ký bộ lắng nghe (listener) vào mảng socket listeners TRƯỚC KHI phát gói tin `ws.send()`. Cơ chế này loại trừ 100% việc đọc trúng tin nhắn cũ trong inbox và bắt đúng phản hồi `STATE_DELTA` thực tế của server.
  2. **Fail-Fast Error & Rejection Handler**: `sendAndWait` kiểm tra ngay lập tức `m.type === 'INTENT_REJECTED' || m.type === 'ERROR'` để quăng ngoại lệ có ngữ cảnh rõ ràng (kèm tên intent và mã lỗi) trong 0ms thay vì đợi hết hạn timeout.
  3. **Server-Authoritative Turn End Execution**: Chỉ người chơi hiện tại theo SSOT (`room.players[room.currentPlayerIndex]`) mới được phép phát `INTENT_END_TURN`.
  4. **Active Session Query for Auctions**: Mọi thao tác đấu giá trong simulation phải tra cứu phiên trực tiếp qua `server.getRoomManager().getAuctionSession(roomCode)` để kiểm tra chính xác `session.declinedPlayerId` và lập tức dừng gửi `INTENT_AUCTION_PASS` ngay khi `room.phase !== TurnPhase.AuctionPhase`.
- **Traceability**: `[TC-SIM165.01..04/MSS]`, `tests/simulation/imp165_four_player_gameplay_sync.test.ts`.

---

### 231. [UI/LOBBY][NET/SYNC] Welcome Hub & Controlled Intentional Room Creation Invariant (IMP-168)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Khởi tạo phòng tự động ngoài ý muốn (Accidental Auto-Room Invariant Trap)*: Khi người dùng mở trang chủ mà không kèm query parameter (`?room=`), hệ thống cũ tự động gọi `generateRandomRoomCode()`, ghi vào URL qua `replaceState` và kích hoạt WebSocket handshake tạo phòng. Điều này gây lãng phí tài nguyên server, khiến người dùng bị đưa vào sảnh mà không có chủ đích, và làm hỏng luồng chào mừng.
  2. *Vòng lặp vô tận khi khách vào phòng không tồn tại (Guest ROOM_NOT_FOUND Auto-Reconnect Loop)*: Trong `ws_message_handler.ts`, khi nhận lỗi `ROOM_NOT_FOUND`, cơ chế fallback tự động gửi lại `JOIN_ROOM`. Nếu phòng thực sự không tồn tại trên server, server liên tục trả về `ROOM_NOT_FOUND` và client liên tục gửi lại `JOIN_ROOM`, gây kẹt mạng và làm treo trình duyệt.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Network Silence at Root URL**: `getInitialLobbyConfig()` khi URL không chứa `?room=` BẮT BUỘC trả về `{ roomCode: null, playerId: '', isHost: false, playerName: '' }` và TUYỆT ĐỐI không gọi `replaceState` hay `sessionStorage.setItem`.
  2. **WebSocket Connect Guard**: Trong `useGameWs`, hàm `connect()` BẮT BUỘC có chốt chặn `if (!roomCode) return;` ở ngay đầu hàm. `useAppSession` truyền `autoConnect: Boolean(roomCode)` để giữ kết nối ở trạng thái im lặng hoàn toàn.
  3. **Intentional Room Actions**: Việc tạo hoặc tham gia phòng phải thông qua hành động chủ đích: `createCustomRoom(isBotSolo?)` (gọi `createNewRoomConfig`) hoặc `joinCustomRoom(code)` sau khi kiểm tra biểu thức chính quy `/^[A-Z0-9]{6}$/`.
  4. **Guest ROOM_NOT_FOUND Loop Termination**: Khi `msg.reasonCode === 'ROOM_NOT_FOUND'`, client CHỈ cho phép fallback `CREATE_ROOM` nếu `ctx.isHost === true`. Với khách (`isHost === false`), cấm gửi lại `JOIN_ROOM`; chỉ cập nhật trạng thái lỗi qua `ctx.setErrorReason` và `ctx.onError`.
  5. **Clean Room Teardown**: Khi rời phòng (`handleLeaveRoom` hoặc `onLeaveRoom` trên `PreMatchDeck`), bắt buộc xóa sessionStorage `vtcoon_host_${roomCode}`, reset `lobbyStore`, xóa `playersInfo` và reset URL về `window.location.pathname`.
- **Traceability**: `[TC-IMP168.01..20/MSS]`, `tests/client/imp168_welcome_hub_and_room_creation.test.ts`, `tests/server/imp165_multiplayer_lobby_sync.test.ts#TC-IMP165.01`.

---

### 232. [UI/UX][AUDIO/MOBILE] Welcome Hub Ergonomics, Input Enter Handler & Mobile AudioContext Resume Invariant (IMP-168 Addendum)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Kẹt tại sảnh trống khi phòng không tồn tại hoặc đã đầy (Orphaned Lobby Trap)*: Khi người chơi nhập mã phòng không tồn tại (`ROOM_NOT_FOUND`) hoặc phòng đã đủ 4 người (`ROOM_FULL`), `use_app_session.ts` trước đây chỉ gọi `setGameStarted(false)`. `useLobbyStore.roomCode` vẫn giữ mã phòng cũ, khiến người chơi bị mắc kẹt tại sảnh `PreMatchDeck` với WebSocket ngắt kết nối, buộc phải tự tìm nút "Về Menu".
  2. *Thiếu bộ lắng nghe phím Enter trên ô nhập mã phòng (Desktop/Mobile Keyboard Frustration)*: Người chơi nhập đủ 6 ký tự mã phòng rồi nhấn phím Enter (hoặc nút Done/Go trên bàn phím ảo điện thoại) nhưng giao diện không phản hồi, buộc phải bấm chính xác nút "Vào Bàn".
  3. *Trình duyệt di động phong tỏa Web Audio API (Mobile AudioContext Autoplay Restriction)*: Trên iOS Safari và Android Chrome, Web Audio API mặc định ở trạng thái `suspended`. Nếu không kích hoạt `AudioContext.resume()` ngay trong hành động chạm (touch/click) đầu tiên của người dùng ở Welcome Hub, nhạc nền và hiệu ứng âm thanh xúc giác (Tactile Synthesizer) sau khi vào trận sẽ bị câm hoàn toàn.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Session Error Auto-Teardown Invariant (`handleSessionServerError`)**: Khi server trả về `ROOM_NOT_FOUND` hoặc `ROOM_FULL`, `handleSessionServerError` BẮT BUỘC gọi `useLobbyStore.getState().resetLobby()` và xóa sạch query param URL qua `window.history.replaceState({}, '', window.location.pathname)`. Người dùng lập tức được đưa về `WelcomeHubModal` kèm theo thông báo lỗi nổi `ServerToast`, giải phóng 100% sảnh mồ côi.
  2. **Unstale Enter Key Dispatch**: Ô nhập mã phòng gắn `onKeyDown` kiểm tra `e.key === 'Enter'`. Để chống bẫy stale closure trong React và đảm bảo bắt kịp tốc độ gõ phím nhanh của người dùng, hàm đọc giá trị mới nhất qua `(codeRef.current || code).trim().toUpperCase()` và kiểm tra regex `/^[A-Z0-9]{6}$/` trước khi gọi `joinCustomRoom`.
  3. **Multi-Engine Audio Context Resume**: Cả 3 hành động tương tác chính tại Welcome Hub (`handleCreateRoom`, `handlePlayWithBots`, `handleJoinRoom`) đều đồng thời gọi `AudioEngine.resumeAudioContext()`. Hàm này đánh thức cả `Howler.ctx` và `SoundEngine.resumeAudioContext()`, đảm bảo toàn bộ hệ thống âm thanh sẵn sàng 100% trước khi chuyển cảnh vào game.
- **Traceability**: `[TC-IMP168.20..24/MSS]`, `tests/client/imp168_welcome_hub_and_room_creation.test.ts#TC-IMP168.20-24`, `src/client/network/use_app_session.ts`, `src/client/ui/lobby/welcome_hub_modal.tsx`, `src/client/audio/audio_engine.ts`.

---

### 233. [UI/UX][LOBBY/NET] Pessimistic Room Join Transition, Button Spinner & SSR Zustand Snapshot Invariant (IMP-168 Flash Defense)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Chuyển cảnh lạc quan sớm gây giật/chớp màn hình (Premature Optimistic UI Flash Trap)*: Khi người chơi ở `WelcomeHubModal` nhập mã phòng và bấm "Vào Bàn", hàm `joinCustomRoom` trước đây lập tức gán `roomCode = cleanCode` vào Zustand store. `main.tsx` dựa vào điều kiện `roomCode !== null` đã lập tức unmount `WelcomeHubModal` và mount `PreMatchDeck`. Khoảng 100ms sau, khi server WebSocket phản hồi lỗi `ROOM_NOT_FOUND` hoặc `ROOM_FULL`, `handleSessionServerError` gọi `resetLobby()` gán `roomCode = null`, buộc giao diện unmount `PreMatchDeck` và mount lại `WelcomeHubModal`. Hiện tượng này tạo ra cú chớp giật giao diện (flash of wrong state) làm người dùng thấy "nhập xong bấm nút, mặc dù sai nhưng thấy nó vào giao diện game rồi out ra".
  2. *Bẫy Zustand SSR Snapshot trong React renderToStaticMarkup*: Trong môi trường SSR (`renderToStaticMarkup` của Vitest hoặc Server Component), `React.useSyncExternalStore` của Zustand v4/v5 sử dụng đối số thứ ba `api.getInitialState()` làm `getServerSnapshot`. Dù test có gọi `useLobbyStore.setState({ isJoining: true })` trước khi render, hook `useLobbyStore((s) => s.isJoining)` trong SSR vẫn trả về giá trị khởi tạo ban đầu (`false`).
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Pessimistic UI Transition Invariant**: Bổ sung cờ `isJoining: boolean` và hàm `confirmJoined: () => void` vào `LobbyState`. Khi người chơi bấm "Vào Bàn", `joinCustomRoom()` gán `isJoining = true`. Tại `main.tsx`, `WelcomeHubModal` được hiển thị khi `(!roomCode || isJoining)`, và `PreMatchDeck` CHỈ được render khi `{roomCode && !isJoining}`. Người dùng ở yên tại `WelcomeHubModal`, nút "Vào Bàn" chuyển sang trạng thái loading với spinner và nhãn `"Đang Vào..."`, đồng thời vô hiệu hóa ô input và nút bấm để chống double-submit.
  2. **Server Confirmation Handshake**: Chỉ khi WebSocket nhận được gói tin xác nhận phòng hợp lệ từ server (`ROOM_JOINED`, `LOBBY_UPDATE`, `SESSION_INIT`, `STATE_DELTA`), `confirmJoined()` mới được kích hoạt trong `ws_message_handler.ts` để đưa `isJoining = false`, thực hiện chuyển cảnh 60 FPS mượt mà sang `PreMatchDeck`.
  3. **Zero-Flash Error Reset**: Khi server từ chối (`ROOM_NOT_FOUND`, `ROOM_FULL`), `handleSessionServerError` gọi `resetLobby()` đưa `isJoining = false` và `roomCode = null`. Giao diện giữ nguyên `WelcomeHubModal` mà không hề có bất kỳ khung hình giật/chớp nào, đồng thời `ServerToast` hiển thị thông báo lỗi rõ ràng.
  4. **SSR Snapshot Invariant**: Trong component `WelcomeHubModal`, trích xuất trạng thái kết hợp: `const storeJoining = useLobbyStore((s) => s.isJoining); const isJoining = storeJoining || useLobbyStore.getState().isJoining;` bảo đảm tính nhất quán tuyệt đối giữa cả môi trường trình duyệt tương tác thực tế và môi trường kiểm thử tĩnh SSR.
- **Traceability**: `[TC-IMP168.26..28/MSS]`, `tests/client/imp168_welcome_hub_and_room_creation.test.ts#TC-IMP168.26-28`, `src/client/main.tsx`, `src/client/store/lobby_store.ts`, `src/client/ui/lobby/welcome_hub_modal.tsx`, `src/client/network/ws_message_handler.ts`.

---

### 234. [UI/CRAFT][TOAST] Punchy Event Card Summaries & Unified Pop-up Stack Architecture (IMP-169)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Tràn chữ & che khuất giao diện mobile bởi mô tả thẻ cơ hội/thị trường dài dòng (Card Description Bloat Trap)*: Các thẻ sự kiện rút trong game có mô tả gốc dài đến 70-100 ký tự (chứa đầy đủ điều kiện pháp lý, thuật ngữ kinh tế, số liệu). Khi đẩy nguyên văn chuỗi này vào floating toasts / milestone banner, văn bản bị xuống hàng 3-4 dòng, che lấp toàn bộ bàn cờ hoặc MarketEventTicker trên thiết bị 360px.
  2. *Phân mảnh 2 container desktop/mobile & lệch tọa độ chèn đè (Two-Container Layout Fragmentation)*: Trước đây hệ thống duy trì 2 container riêng biệt (`md:hidden` và `hidden md:flex`) với các quy tắc tính top offset khác nhau (`top-[4.25rem]`, `top-[11.5rem]`, `top-28`, `top-32`), dẫn đến tình trạng MilestoneBanner và Toast chèn đè lên nhau hoặc thụt lệch khi số lượng `activeModifiers` thay đổi từ 0 -> 1 -> 2+.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Punchy Event Summaries Dictionary (`PUNCHY_EVENT_SUMMARIES`)**: `src/client/ui/event_card_punchy_summaries.ts` chuẩn hóa 100% (36/36) thẻ sự kiện (16 Thẻ Thị Trường + 20 Thẻ Cơ Hội) thành các thông điệp hành động súc tích (Punchy Summaries), độ dài khống chế nghiêm ngặt $\le 35$ ký tự (ví dụ: `'Chậm tiến độ, phạt 400 Tr./c.trình'`). Hàm fallback `resolvePunchyEventSummary` tách theo dấu `;` / `.` và cắt ngắn an toàn $\le 38$ ký tự kèm `'...'`.
  2. **Unified Pop-up Stack Architecture**: Xóa bỏ hoàn toàn 2 container phân mảnh; hợp nhất thành 1 container xếp chồng duy nhất (`fixed ${stackTopClass} left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 w-full max-w-[92vw] md:max-w-md px-2 z-30 pointer-events-none`).
  3. **Biên độ Top Offset Đa Tầng**:
     - `activeMarketCount === 0`: `top-20` (dưới thanh header an toàn).
     - `activeMarketCount === 1`: `top-[10.5rem]` (dưới 1 card ticker).
     - `activeMarketCount >= 2`: `top-[15.5rem]` (dưới 2 card tickers).
  4. **Thứ tự & Tương tác Xúc giác (Tactile A11y & Truncate Invariant)**:
     - `MilestoneBanner` luôn nằm ở đỉnh stack (`pointer-events-auto`), có `truncate min-w-0` để không bao giờ tràn layout.
     - Hỗ trợ giải phóng ngay khi click chạm hoặc phím `Enter` / `Space` kích hoạt `removeFloatingText`.
     - Phía dưới tối đa 2 regular contextual transaction toasts, căn giữa với `gap-2`.
- **Traceability**: `[TC-IMP169.01..57]`, `tests/client/imp169_punchy_notifications_and_unified_stack.test.ts`, `src/client/ui/event_card_punchy_summaries.ts`, `src/client/network/activity_tracker.ts`, `src/client/ui/floating_numbers.tsx`.

---

### 235. [NET/STORAGE][UAT/TEST] Supabase Cloud Log Persistence, Self-Healing Re-indexer & Test Isolation Invariant (IMP-169)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Ô nhiễm thư mục production khi chạy test (Test Pollution Trap)*: Khi chạy bộ test kiểm thử `PersistentRoomLogger` mà không chỉ định `logDir`, hệ thống cũ fallback vào thư mục `server_logs/rooms/`. Điều này làm ô nhiễm file manifest thực tế của server với các mã phòng test giả lập và có nguy cơ ghi đè log trận đấu live.
  2. *Mất mát danh mục phòng khi manifest bị xóa/hỏng (Manifest Desync / Orphaned Logs)*: Khi tệp `rooms_manifest.json` bị mất hoặc hỏng do lỗi tiến trình đột ngột, toàn bộ các tệp log `.jsonl` quý giá trên đĩa bị cô lập và không hiển thị trên Admin Portal.
  3. *Nghẽn tiến trình khi upload đám mây (Cloud Upload Blocking)*: Khi đồng bộ file log và manifest lên Supabase Storage, nếu dùng lệnh synchronous hoặc await chặn luồng kết thúc ván, client và worker sẽ bị đóng băng theo độ trễ mạng Internet.
- **Ràng buộc cứng & Giải pháp bất biến**:
  1. **Strict Test Directory Isolation**: Khi `process.env.NODE_ENV === 'test'` và không truyền `logDir`, `PersistentRoomLogger` BẮT BUỘC lưu log tại `.agents/tmp/test_logs/worker_${process.env.VITEST_POOL_ID || process.pid}`, tuyệt đối không chạm vào `server_logs/rooms/`.
  2. **Self-Healing Re-indexer**: Trong `loadManifest()`, tự động quét mọi tệp `*.jsonl` trên đĩa chưa nằm trong catalog. Trích xuất `roomCode`, `startTime`, đếm `totalEvents`, `fileSizeBytes`, và nhận diện trạng thái `FINISHED` để tái tạo catalog và lưu lại `rooms_manifest.json`.
  3. **Non-blocking Cloud Persistence with Graceful Drain**:
     - `finishRoomLog`: Đẩy task upload async vào `pendingUploads` và trả về ngay cho caller, không block server event loop.
     - `stop()`: Bắt buộc gọi `this.flushSync()` và `await Promise.allSettled(this.pendingUploads)` để đảm bảo mọi upload dở dang được hoàn tất trước khi tiến trình tắt hoàn toàn.
- **Traceability**: `[TC-IMP169.01..15]`, `tests/server/imp169_supabase_storage.test.ts`, `src/server/storage/supabase_storage.ts`, `src/server/logging/persistent_room_logger.ts`, `src/server/network/admin_manager.ts`, `src/server/network/admin_message_handler.ts`.

---

### 236. [UI/CRAFT][DOMAIN] Event Cards Visual De-Clutter, Zero Word Repetition & Contextual Emotional CTA Invariant (IMP-170)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Lặp từ 3 lớp & trùng lặp số tiền (Triple Redundancy & Cognitive Fatigue Trap)*: Trên `EventCardModal`, tiêu đề thẻ, khối mô tả, và khối Hero Stat trước đây lặp lại cùng một cụm từ (ví dụ: Tiêu đề "Chốt Lời Danh Mục Đầu Tư Chứng Khoán", Mô tả "Chốt lời cổ phiếu...", Hero Stat "CHỐT LỜI CỔ PHIẾU | +2.500 Tr.", Mô tả lại lặp "+2.500 Tr."). Người chơi phải đọc cùng một thông điệp 3 lần, gây mệt mỏi thị giác và thiếu tính chuyên nghiệp thương mại.
  2. *Nhiễu thông tin bởi các tag hành chính rườm rà (Administrative Tag Pollution)*: Các thẻ hiển thị tag "🎯 Người chơi rút thẻ" và "⏳ Tức thì" - những thông tin mặc định, hiển nhiên của một thẻ rút trên tay, chiếm dụng diện tích hiển thị quý giá trên màn hình mobile 360px.
  3. *Nút bấm CTA khô cứng, đơn điệu (Monotonous Dry CTA Button)*: Cả 36 thẻ đều dùng chung một nút bấm tĩnh duy nhất: `"Đã Hiểu / Tiếp Tục"`, làm mất đi cảm xúc hồi hộp, kịch tính của các sự kiện kinh tế và cơ hội làm giàu.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Zero Word Repetition Hierarchy**:
     - Tiêu đề (`vi.ts`): Ngắn gọn, gợi hình, mang tính sự kiện thương mại.
     - Mô tả (`event_card_metadata.ts`): Kể câu chuyện bối cảnh sinh động (storytelling), tuyệt đối không lặp lại từ đầu tiên của tiêu đề và không lặp lại số tiền lớn.
     - Hero Stat (`event_card_visuals.ts`): Là nơi DUY NHẤT hiển thị con số tài chính định lượng hoặc hiệu ứng cốt lõi dạng Mono đậm nét để người chơi nắm bắt trong 0.5 giây.
  2. **Administrative Tag Cleanliness**: Tự động ẩn các tag mặc định hiển nhiên (`'Người chơi rút thẻ'`, `'Tức thì'`). Chỉ render chip phạm vi khi có mục tiêu đặc thù (Bình Dương, Đồng Nai, Ô Dịch vụ, v.v.) và chỉ render chip thời hạn khi sự kiện kéo dài nhiều vòng (`'2 vòng chơi'`, `'Lượt tiếp theo'`).
  3. **Contextual Emotional CTA Matrix (`KNOWN_CARD_CTA_BUTTONS`)**: Chuẩn hóa 100% (36/36) thẻ sự kiện với nút bấm hành động theo ngữ cảnh (ví dụ: `'Lên Xe Đi Tiếp! 🎲'`, `'Nộp Truy Thu 💸'`, `'Bỏ Túi Ngay 💰'`, `'Cất Vào Túi 🎴'`, `'Bảo Toàn Tiền Mặt ❄️'`, `'Nắm Bắt Thời Cơ 🏙️'`). Hàm `getCardCtaButtonText(cardId)` tự động ánh xạ nút bấm tương ứng kèm fallback an toàn.
- **Traceability**: `[TC-IMP170]`, `tests/client/imp134_event_card_hero_stat_visual_overhaul.test.ts`, `tests/client/imp156_event_card_visual_declutter.test.ts`, `src/domain/i18n/vi.ts`, `src/domain/event_card_metadata.ts`, `src/client/ui/modals/event_card_visuals.ts`, `src/client/ui/modals/event_card_modal.tsx`.

---

### 237. [UI/CRAFT] PlayerCard Name Truncation & Horizontal Budget Starvation (IMP-171)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Tranh chấp chiều ngang giữa Badges và Tên người chơi (Horizontal Space Starvation Trap)*: Trong `PlayerCard`, thẻ người chơi ở sidebar mobile chỉ có độ rộng `w-36` (144px). Dòng đầu tiên (Header) đặt Avatar (28px), Tên người chơi (`player.name`), và mảng Badges (`BOT`, `LƯỢT`, `Phá Sản`, `Kiểm Toán`) trên cùng một hàng ngang flex. Khi một người chơi hoặc bot đến lượt, huy hiệu `LƯỢT` (~40px) và `BOT` (~30px) chiếm hơn 70px, ép diện tích dành cho tên xuống dưới 30px, khiến hầu hết tên người chơi từ 8 ký tự trở lên (ví dụ: `"Dapper Panda"`, `"Chủ Tịch Hưng"`) hoặc tên Bot (ví dụ: `"Bot AI 2 (Balanced)"`) bị cắt cụt thê thảm thành `"Dapper P..."`, `"Bot AI 2 (..."`.
  2. *Thừa thãi hậu tố tính cách Bot trong tên (Redundant Bot Personality Suffix)*: Bot được khởi tạo với `playerName: 'Bot AI X (${personality})'` (như `(Balanced)`, `(Aggressive)`). Bản thân thẻ đã hiển thị huy hiệu `[BOT]`, việc nhét thêm hậu tố 10-12 ký tự vào chuỗi tên vừa trùng lặp thông tin vừa làm vỡ layout văn bản.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Top Turn Tab Invariant (Giải phóng không gian Header)**: Huy hiệu `LƯỢT` được đưa lên đỉnh thẻ dạng tab nổi bật (`absolute -top-2.5 right-3 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shadow-xs animate-pulse select-none uppercase tracking-wider z-10`), triệt tiêu 100% sự cạnh tranh diện tích với dòng tên người chơi mà vẫn làm nổi bật thẻ người chơi đang đến lượt.
  2. **Short Player Name Sanitizer (`formatShortPlayerName`)**: Chuẩn hóa tên hiển thị qua hàm dùng chung `formatShortPlayerName(player.name)` trích xuất từ `ui_helpers.ts`, loại bỏ các hậu tố tính cách Bot rườm rà `(Balanced)`, `(Aggressive)`, `(Cautious)`, `(Passive)`, `(Bot)`. Đồng thời gắn `title={player.name}` vào thẻ tên để bảo toàn khả năng tiếp cận và xem đầy đủ tên khi hover/long-press.
  3. **Responsive Width & Typographic Balance**: Mở rộng bề rộng sidebar trên mobile từ `w-36` (144px) lên `w-40 sm:w-48 md:w-64` (160px), tăng thêm 16px không gian thở, kết hợp font chữ co giãn linh hoạt `text-xs sm:text-sm font-bold truncate`, đảm bảo 99% tên người chơi từ 14-16 ký tự hiển thị trọn vẹn không bị cắt chữ.
- **Traceability**: `[TC-MCH01.08A..C/MSS]`, `tests/client/mobile_compact_hud_and_modals.test.ts`, `src/client/ui/ui_helpers.ts`, `src/client/ui/player_card.tsx`, `src/client/ui/player_hud_list.tsx`, `src/client/ui/floating_numbers.tsx`.

---

### 238. [UI/UX][DOMAIN] Market Event Ticker Instant Comprehension, Hero Stat Badge Parity & Modal TargetScope Resolution Invariant (IMP-172)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Độ lệch thấu hiểu giữa thanh phiếu Ticker và Popup thẻ bài (Ticker Readability Gap Trap)*: Các phiếu sự kiện thị trường trên thanh `MarketEventTicker` trước đây hiển thị các đoạn văn bản pháp lý dày đặc, chen chúc mã ô kỹ thuật như `(Ô 11, 14, 16, 18, 19)` hoặc thuật ngữ `C1-C3`. Trong khi đó, người chơi chỉ thực sự hiểu ngay tác dụng của thẻ khi nhìn thấy khối **Huy Hiệu Hero Stat** to bản, tương phản cao trong `EventCardModal` (như `[MIỄN 100% THUÊ]`, `[-20% XÂY DỰNG]`). Sự thiếu vắng huy hiệu này trên Ticker khiến người chơi lúng túng, không nắm bắt được tác động tài chính cốt lõi trong trận đấu.
  2. *Thanh Ticker thụ động, thiếu tính tương tác (Non-Interactive Ticker Trap)*: Người chơi khi muốn xem lại thể thức, đối tượng hưởng lợi hoặc điều kiện kích hoạt của sự kiện thị trường đang chạy không có cách nào bấm vào phiếu để mở lại popup chi tiết.
  3. *Xung đột phạm vi mục tiêu giữa Mobile Compact và BĐS Đặc Thù (TargetScope Mobile Overwrite Trap)*: Thẻ sự kiện vùng miền như `MC_COASTAL_STORM` (Bão Lũ Duyên Hải) chỉ áp dụng cho dải resort ven biển (`BĐS Duyên Hải`), nhưng trên mobile từng bị ghi đè thô bạo thành `🎯 Toàn bộ thị trường`, gây ngộ nhận nghiêm trọng cho người chơi. Ngược lại, nếu ép chuỗi mô tả chi tiết dài 45 ký tự của thẻ vĩ mô (`MC_RATE_HIKE`: `"Tất cả người chơi đang có khoản vay thế chấp"`) vào badge mobile sẽ làm vỡ ngân sách chiều ngang 360px.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Hero Stat Badge Parity Invariant**: `MarketEventTicker` bắt buộc đồng bộ huy hiệu Hero Stat (`getCardHeroStat` và `getHeroStatStyles(heroStat.variant)`) hiển thị ngay cạnh tiêu đề thẻ trên Ticker. Người chơi nhìn vào là nắm bắt được ngay con số tác động trong 0.5 giây.
  2. **Click-to-Inspect Ticker Affordance**: Mọi thẻ trên Ticker hỗ trợ `cursor-pointer`, hiệu ứng hover viền hổ phách, và sự kiện `onClick` gọi `useGameStore.getState().openModal('event', ...)` để người chơi tra cứu toàn bộ chi tiết thẻ bài bất kỳ lúc nào.
  3. **Natural Human Vietnamese Summaries (Zero Technical Coordinates)**: Bảng tóm tắt `ACTIVE_MARKET_EFFECT_SUMMARIES` loại bỏ triệt để các mã tọa độ kỹ thuật `(Ô ...)` hay `C1-C3`, thay bằng ngôn ngữ tự nhiên thân thiện (`4 Ga Tàu trên toàn bàn cờ`, `các ô ven biển`, `các ô Dịch Vụ từ Cấp 1 trở lên`).
  4. **Dual-Tier TargetScope Resolution**: Desktop hiển thị đầy đủ chi tiết mục tiêu (`detail?.targetScope`), trong khi mobile ưu tiên hiển thị tên phạm vi đặc thù (`BĐS Duyên Hải`) và duy trì `Toàn bộ thị trường` cho các thẻ chính sách vĩ mô mặc định (`MC_RATE_HIKE`), bảo toàn ngân sách hiển thị 360px mà không gây ngộ nhận vùng miền.
- **Traceability**: `[TC-IMP135.24..25]`, `[TC-IMP134.22]`, `[TC-MCH01.23]`, `tests/client/imp135_market_ticker_clarity_and_popup_duration.test.ts`, `src/client/ui/market_event_ticker.tsx`, `src/client/ui/modals/event_card_modal.tsx`, `src/client/ui/modals/event_card_visuals.ts`.

---

### 240. [UI/UX][LOBBY] Purge Gaudy Top-Left Floating Header & Unified PreMatchDeck All-in-One Lobby Controls (IMP-173)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Thanh công cụ sảnh chờ lệch ngữ cảnh & phân mảnh thị giác (Lobby Context Mismatch & Visual Clash Trap)*: Màn hình sảnh chờ (`PreMatchDeck`) trước đây tồn tại một dải banner đỏ - vàng kim bóng bẩy (`bg-gradient-to-b from-[#B91C1C]`) ở góc trên bên trái, chứa tiêu đề dài dòng (*"Sảnh Chờ Đảo Ngọc 🏝️ • Bến Cảng Du Thuyền"*) và cụm nút điều khiển camera 3D (`🎯 Góc Chuẩn`, `🏙️ Ngắm 3D`). Trong khi ván đấu chưa bắt đầu, việc hiển thị các nút điều khiển camera 3D gây cảm giác thừa thãi, vô nghĩa ("không có ý nghĩa gì cả" theo phản hồi người dùng) và che khuất sa bàn 3D phía sau.
  2. *Nút thoát phòng đặt sai vị trí (Misplaced Leave Room Affordance)*: Nút `[🏠 Về Menu]` bị nhét chung vào dải banner camera ở góc trái, khiến người chơi đang tương tác với thẻ sảnh chờ bên phải phải tìm kiếm rời rạc khắp màn hình khi muốn hủy phòng.
  3. *Lãng phí không gian hiển thị trên thiết bị di động*: Do phải chừa chỗ cho banner góc trái không bị đè lên thẻ phòng, thẻ sảnh chờ mobile phải đẩy lề xuống `top-24`, làm hẹp không gian dọc dành cho danh sách người chơi và nút Bắt đầu trận đấu.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Purge Gaudy Floating Header Invariant**: Loại bỏ 100% thanh banner đỏ cồng kềnh ở góc trên bên trái. Sa bàn 3D Đảo Ngọc được giải phóng trọn vẹn, tạo cảm giác thoáng đãng, chuyên nghiệp chuẩn Retropoly.
  2. **Unified PreMatchDeck Header (All-in-One Deck)**: Toàn bộ điều khiển cần thiết được tích hợp gọn gàng ngay trên hàng đầu tiên của thẻ `PreMatchDeck`:
     - Nút `[🏠 Về Menu]` (`data-testid="back-to-hub-btn"`, `hidden sm:inline`) đặt ngay góc trên bên trái của thẻ.
     - Nhãn thương hiệu súc tích: `VTCOON 3D • 🏝️ Sảnh Chờ`.
     - Nút bật/tắt âm thanh sảnh chờ tinh tế ở góc phải thẻ: `[🔊/🔇 Âm thanh]` (`data-testid="lobby-mute-toggle-button"`).
  3. **Purge Redundant Pre-Match Camera & Collapse Controls**: Loại bỏ hoàn toàn 2 nút `[🎯 Góc Chuẩn]` (`reset-camera-btn`) và `[🏙️ Ngắm 3D]` (`toggle-lobby-panel-btn`) cùng trạng thái `isPanelCollapsed` khỏi sảnh chờ. Góc quay sảnh chờ được cố định từ trước theo góc nhìn toàn cảnh đảo ngọc, người chơi chỉ cần tập trung thiết lập phòng và bắt đầu ván đấu.
  4. **Contract Preservation**: Duy trì đầy đủ các thuộc tính kiểm thử bắt buộc: `data-testid="back-to-hub-btn"`, `data-testid="lobby-mute-toggle-button"`, `VTCOON`, `🏝️`, `Sảnh Chờ`, `max-h-[calc(100dvh-7rem)]`, và `top-24 md:top-6`.
- **Traceability**: `[TC-74.01..18]`, `[TC-MOB01.01..03]`, `[TC-IMP168.14..20]`, `tests/contracts/imp74_purge_leave_lobby_btn.test.ts`, `tests/contracts/imp73_telephoto_camera_and_responsive_fit.test.ts`, `tests/contracts/imp63_lean_tabletop_hud_and_perf.test.ts`, `tests/client/mobile_responsive_hud.test.ts`, `tests/client/ui06_lobby_screen.test.ts`, `tests/client/imp168_welcome_hub_and_room_creation.test.ts`, `src/client/ui/lobby/pre_match_deck.tsx`.


---

### 239. [SERVER/STORAGE] Supabase Storage REST API JWT Bearer Contract & Invalid Compact JWS Invariant (IMP-169)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Bẫy chìa khóa Opaque mới gây lỗi Invalid Compact JWS (New Opaque API Key Trap)*: Supabase giới thiệu định dạng API key mới dạng chuỗi không định hình (`sb_secret_...` và `sb_publishable_...`). Tuy nhiên, hệ thống máy chủ `storage-api` của Supabase nội bộ vẫn sử dụng bộ xác thực JWT (yêu cầu chuỗi JSON Web Token theo chuẩn RFC 7515 Compact JWS gồm 3 phần `header.payload.signature` bắt đầu bằng `eyJhbGciOi...`). Khi gửi `Authorization: Bearer sb_secret_...`, Supabase Storage cố giải mã token và trả về lỗi `HTTP 400/403 Bad Request / Unauthorized: {"statusCode":"403","error":"Unauthorized","message":"Invalid Compact JWS","code":"AccessDenied"}`.
  2. *Bẫy nuốt lỗi âm thầm (Silent Error Swallowing Trap)*: Hàm `uploadFile` ban đầu chỉ kiểm tra `return response.ok;` và bắt try/catch trả về `false` mà không in log cảnh báo nội dung lỗi từ Supabase, khiến việc chẩn đoán nguyên nhân khi triển khai trên môi trường cloud Render trở nên mù mờ.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Legacy JWT service_role Contract**: Mọi cấu hình `SUPABASE_KEY` cho máy chủ backend Node.js khi giao tiếp với Supabase Storage BẮT BUỘC sử dụng token JWT `service_role` lấy từ tab *"Legacy anon, service_role API keys"* (`eyJhbGciOi...`), đảm bảo 100% hợp đồng Compact JWS được thỏa mãn và quyền bypass RLS hoạt động thông suốt.
  2. **Diagnostic Upload Error Logging**: `SupabaseStorageService.uploadFile` BẮT BUỘC ghi log chi tiết mã trạng thái và nội dung lỗi từ Supabase (`console.warn('[SupabaseStorage] Upload failed (${status} ${statusText}): ${errorText}')`) khi `response.ok === false`, loại bỏ hoàn toàn các lỗi câm trong vận hành hệ thống.
  3. **Multi-Key Flexible Env Fallback**: Constructor của `SupabaseStorageService` tự động kiểm tra cả `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` và `SUPABASE_KEY` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_SECRET_KEY` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, bảo đảm tính thích ứng với mọi quy ước đặt tên biến môi trường của các nền tảng PaaS.
- **Traceability**: `[TC-IMP169.01..15]`, `tests/server/imp169_supabase_storage.test.ts`, `src/server/storage/supabase_storage.ts`, `src/server/logging/persistent_room_logger.ts`.

---

### 241. [DOMAIN/I18N/UI] Event Cards Brevity, Professional Tone & Commercial Storytelling Invariant (IMP-174)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Bẫy Tiêu Đề Tiếng Lóng Cợt Nhả (Colloquial Slang & Inappropriate Tone Trap)*: Tiêu đề thẻ như 'CỔ PHIẾU "MÚA BÊN TRĂNG"' mang tính cợt nhả, thiếu đứng đắn, làm giảm tính nghiêm túc của một trò chơi cờ tỷ phú mô phỏng tài chính - địa ốc chuyên nghiệp.
  2. *Bẫy Mô Tả Dài Dòng, Quá Tải Thông Tin Thị Giác (Multi-Sentence Wordy Description Trap)*: Mô tả thẻ sự kiện trước đây gồm 2-3 câu (20-25 từ), gây quá tải thông tin, ép layout popup và cản trở người chơi đọc nhanh trong nhịp độ ván đấu.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Professional Commercial Tone Invariant**:
     - `CC_JUNK_STOCK`: Chuẩn hóa vĩnh viễn thành `'Bán Tháo Cổ Phiếu'` (loại bỏ hoàn toàn "múa bên trăng" trên toàn bộ codebase).
     - Rà soát toàn bộ 36 thẻ theo văn phong tài chính, thương mại chuyên nghiệp nhưng gần gũi, súc tích (`Bán Tháo Cổ Phiếu`, `Đấu Giá Biển Số Đẹp`, `Chốt Lời Cổ Phiếu VN30`, `Tăng Lãi Suất Tín Dụng`, `Đóng Băng Giao Dịch`, `Mùa Cao Điểm Du Lịch Quốc Tế`).
  2. **Single-Sentence Concise Storytelling Invariant (<= 15-20 Words)**:
     - Toàn bộ 36 thẻ (20 Cơ Hội + 16 Thị Trường) trong `src/domain/event_card_metadata.ts` được rút gọn thành đúng 1 câu văn duy nhất, cô đọng dưới 15-20 từ.
     - Bảo toàn 100% hợp đồng kiểm thử của các ticket trước (giữ nguyên cụm từ bắt buộc `tăng 20% giá trị khi thế chấp` trong `MC_URBAN_PLANNING`, giá trị Hero Stat `'-500 Tr.'` trong `MC_FUEL_SURGE`, `'-800 Tr.'` trong `MC_ALCOHOL_CHECK`, và tiêu đề chuẩn hóa).
  3. **Zero Word Repetition Across 3 Tiers**:
     - Tầng 1 Tiêu đề (`vi.ts`): Tên sự kiện thương mại ngắn gọn (2-5 từ).
     - Tầng 2 Mô tả (`event_card_metadata.ts`): Bối cảnh thực tế (1 câu duy nhất <= 15-20 từ).
     - Tầng 3 Hero Stat (`event_card_visuals.ts`): Tác động tài chính định lượng Mono đậm nét.
- **Traceability**: `src/domain/i18n/vi.ts`, `src/domain/event_card_metadata.ts`, `src/client/ui/modals/event_card_visuals.ts`, `tests/client/imp156_event_card_visual_declutter.test.ts`, `tests/client/imp135_market_ticker_clarity_and_popup_duration.test.ts`.

---

### 242. [UI/UX/ERGONOMICS] GameRulesModal Stable Container Height, Zero Layout Shift & Flex Clipping Prevention Invariant (IMP-175)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Bẫy chiều cao co giãn theo nội dung tab (Tab Content Height Jump Trap)*: Khi chuyển đổi giữa các tab có độ dài nội dung chênh lệch lớn (Tab "Quy Tắc Cốt Lõi" ~400px vs Tab "Cơ Chế Đặc Biệt" ~850px), modal tự động co giãn chiều cao theo nội dung (`max-h-[90dvh]` không cố định `h`). Do modal được căn giữa màn hình (`items-center`), mỗi lần đổi tab toàn bộ hộp thoại bị giật nảy lên xuống (nhảy từ 500px lên 750px), làm vị trí các nút tab trên màn hình bị dịch chuyển liên tục khiến người dùng khó thao tác và trải nghiệm thị giác bị đứt gãy.
  2. *Bẫy đẩy chân trang ra ngoài vùng hiển thị (Flexbox Overflow Clipping Trap)*: Thẻ `<main>` bên trong flex container không có thuộc tính `min-h-0`, trong khi `<header>`, `<nav>`, `<footer>` thiếu `shrink-0`. Khi nội dung cuộn bên trong dài hơn trần `max-h`, thẻ `<main>` cản trở co lại, đẩy thẻ `<footer>` chứa nút "Đã Hiểu" vượt ra ngoài đáy của modal và bị `overflow-hidden` cắt mất phân nửa nút bấm.
  3. *Bẫy giữ vị trí cuộn cũ khi đổi tab (Stale Scroll Position Trap)*: Người dùng cuộn xuống dưới cùng của tab dài rồi chuyển sang tab ngắn hơn, vị trí cuộn không được reset khiến tab mới bị hiển thị lơ lửng ở giữa hoặc đáy trang.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Constant Modal Container Height**: Hộp thoại hướng dẫn game cố định chiều cao `h-[85dvh] max-h-[640px]`, đảm bảo khung viền modal, header và thanh tab hoàn toàn cố định ở cùng một tọa độ Y trên màn hình bất kể đang xem tab nào.
  2. **Flexbox Non-Clipping Triad (`shrink-0` & `min-h-0`)**:
     - `<header>`, `<nav>`, `<footer>` bắt buộc có class `shrink-0` để chống bị ép bẹp.
     - `<main>` bắt buộc có `flex-1 min-h-0 overflow-y-auto` để tự do cuộn bên trong vùng không gian cố định mà không bao giờ chèn ép footer hay làm biến dạng modal.
  3. **Tab-Switch Scroll Reset**: Sử dụng `useRef<HTMLElement>` gắn vào thẻ `<main>` kết hợp `useEffect` lắng nghe `activeTab` để tự động đưa `contentRef.current.scrollTop = 0` ngay khi người dùng chọn tab mới.
- **Traceability**: `[TC-172.01..06/MSS]`, `tests/client/imp172_game_rules_modal_stable_height.test.ts`, `tests/contracts/imp72_lobby_redesign_game_rules_and_desktop_framing.test.ts`, `src/client/ui/modals/game_rules_modal.tsx`.

---

### 243. [DOMAIN/UI/3D] Event Card Clarity, Explicit Subject Partitioning & Property Naming Invariant (IMP-176)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Bẫy Thẻ 3D Chỉ In Văn Xuôi Bối Cảnh (3D Card Flavor-Only Trap)*: Khi thẻ 3D lật (`EventCard3D`), texture mặt trước chỉ lấy trường `description` (câu chuyện văn học bối cảnh), bỏ qua toàn bộ thông số định lượng và hiệu ứng thực tế (`effectDetail`), khiến người chơi đọc thẻ xong không biết tác dụng game thực tế là gì cho tới khi modal 2D hiện lên.
  2. *Bẫy Hero Stat Đơn Giá Trị Che Lấp Cơ Chế Kép (Single-Stat Hero Masking Dual Impact)*: Đối với thẻ có cơ chế kép như `MC_ALCOHOL_CHECK` (vừa giảm 50% tiền thuê thị trường vừa phạt 800 Tr. người dừng chân), Hero Stat chỉ hiển thị đơn độc giá trị `-800 Tr.`, che giấu mất tác động vĩ mô giảm 50% tiền thuê đất.
  3. *Bẫy Ẩn Tên Ô Đất Khiến Nhầm Lẫn Nhóm BĐS (Masked Target Property Coordinates Trap)*: Hàm `sanitizeTargetScope` dùng regex xóa sạch mã ô trong ngoặc `(Ô 6, 8, 26, 27)`, chỉ để lại chuỗi trừu tượng `"Tất cả các ô BĐS Dịch vụ"`. Người chơi không biết đó là những ô nào, đặc biệt ô 27 (Kiên Giang - Phú Quốc) thường bị người chơi hiểu nhầm thành ô nghỉ dưỡng.
  4. *Bẫy Gộp Hai Chủ Thể Vào Một Câu Gây Mâu Thuẫn (Merged Dual Subjects Semantic Trap)*: Viết gộp tác động lên chủ đất và tác động lên khách dừng chân vào 1 câu khiến người chơi lầm tưởng chính mình vừa được giảm 50% tiền thuê nhưng lại vừa bị phạt 800 Tr.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Actionable 3D Card Front Texture Invariant**: `event_card_3d.tsx` bắt buộc ưu tiên `eventPayload.effectDetail || eventPayload.description` để render trực tiếp hành động và thông số định lượng lên mặt trước thẻ bài 3D ngay khi lật.
  2. **Comprehensive Dual-Aspect Hero Stat Invariant**: Thẻ có tác động kép bắt buộc thể hiện cả hai cơ chế trên khối Hero Stat (Nhãn `GIẢM 50% THUÊ • PHẠT NỒNG ĐỘ CỒN` đi kèm giá trị `-800 Tr.`).
  3. **Explicit Named Target Scope Invariant**: Chuẩn hóa `targetScope` thành tên địa danh thực tế (`4 ô BĐS Dịch vụ: Bình Dương, Đồng Nai, Hải Phòng, Phú Quốc`) thay vì các mã ô thô kệch, giúp người chơi định vị tức thì trên bàn cờ.
  4. **Subject-Partitioned Event Descriptions**: Mọi thẻ tác động đa chiều bắt buộc phân định rạch ròi câu văn giữa *Chủ ô đất* (bị giảm tiền thuê) và *Người dừng chân* (bị phạt tiền + giam xe mất lượt).
- **Traceability**: `[TC-176.01..06/MSS]`, `tests/client/imp176_event_card_clarity.test.ts`, `src/domain/event_card_metadata.ts`, `src/client/ui/modals/event_card_visuals.ts`, `src/client/3d/event_card_3d.tsx`, `src/client/offline_landing.ts`.

---

### 244. [NET/STORAGE] Safe Fallback For Unconfigured Cloud Storage & No-op Auto-Backfill Invariant (IMP-175)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Bẫy gãy WebSocket khi chưa cấu hình Supabase*: Khi Admin kích hoạt đồng bộ 1-click hoặc khi máy chủ chạy `autoBackfillCloudLogs`, nếu môi trường thiếu khóa Supabase (`!storage?.isConfigured`), việc quăng lỗi hoặc trả về `success: false` làm gián đoạn luồng xử lý và gây hiểu nhầm là lỗi máy chủ nghiêm trọng thay vì trạng thái chưa kết nối.
  2. *Bẫy treo mutex khi đồng bộ thất bại giữa chừng*: Nếu một tiến trình upload bị lỗi mạng hoặc xác thực (401/403 Compact JWS), cờ `isSyncingCloud` nếu không nằm trong khối `finally` sẽ bị kẹt vĩnh viễn ở `true`, phong tỏa toàn bộ các lần đồng bộ sau đó (`ALREADY_SYNCING`).
  3. *Bẫy ưu tiên sai khóa JWT vs Opaque*: Supabase sinh ra nhiều định dạng khóa (`eyJ...` JWT vs `sb_...` publishable/opaque). Nếu chọn nhầm publishable key khi service role key tồn tại, Storage REST API sẽ từ chối upload với mã HTTP 403 Forbidden.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Safe Unconfigured Storage Handling**: `syncAllLocalLogsToCloud` và `syncCloudLogs` xử lý tình huống chưa cấu hình storage như một thao tác hoàn tất an toàn (`{ success: true, reason: 'STORAGE_NOT_CONFIGURED', uploadedCount: 0 }`), bảo đảm `this.roomLogger.flushSync()` vẫn xả bộ nhớ đệm cục bộ mà không làm sập giao thức.
  2. **Strict Mutex Lifecycle (`try/finally`)**: Khối `syncCloudLogs` bắt buộc giải phóng `this.isSyncingCloud = false` trong `finally` block để ngăn ngừa deadlock.
  3. **RFC 7515 JWT Priority Resolution**: `resolveSupabaseKey` bắt buộc quét toàn bộ các biến môi trường tiềm năng, tự động strip dấu ngoặc đơn/kép và khoảng trắng, ưu tiên token bắt đầu bằng `eyJ` gán `keyType = 'JWT'` trước khi fallback về `sb_...` (`keyType = 'OPAQUE'`).
  4. **Test Environment No-Op Guard**: `autoBackfillCloudLogs` luôn là no-op khi `NODE_ENV === 'test'` trừ khi có cờ `force: true`.
- **Traceability**: `[TC-IMP175.01..14]`, `tests/server/imp175_cloud_sync_and_backfill.test.ts`, `tests/server/imp169_supabase_storage.test.ts`, `src/server/storage/supabase_storage.ts`, `src/server/storage/supabase_log_sync.ts`, `src/server/network/admin_manager.ts`.

---

### 245. [UI/UX/HUD] PlayerCard Option A: 22 Property Dots in 8 Color Clusters Invariant (IMP-177)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Bẫy chấm màu động làm mất dấu các ô chưa sở hữu (Dynamic Dots Information Deficit Trap)*: Trước đây, thẻ người chơi chỉ hiển thị chấm tròn màu cho các nhóm đất mà người đó đang sở hữu. Người chơi nhìn vào 4 thẻ không thể biết còn những ô nào chưa mua, ai đang giữ ô nào trong cùng một nhóm màu, và ai sắp hoàn thành bộ độc quyền.
  2. *Bẫy phân rã 22 chấm rời rạc gây tràn viền mobile 160px (Unclustered Dot Breakage Trap)*: Nếu rải 22 chấm liên tục thành một dòng dài không phân nhóm, trên màn hình di động (`w-40` = 160px), các chấm sẽ bị bẻ dòng ngẫu nhiên ở giữa một nhóm màu (ví dụ nhóm Cam 3 ô bị rớt 1 ô xuống dòng dưới), gây rối mắt và phá vỡ trực giác thị giác.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **SSOT 8-Cluster Structure Invariant**: 22 ô BĐS được gom cứng thành 8 cụm vi mô tương ứng 8 nhóm màu địa lý (`PROPERTY_CLUSTERS`), theo thứ tự bàn cờ (Nâu: 2, Xanh da trời: 3, Hồng: 3, Cam: 3, Đỏ: 3, Vàng: 3, Xanh lục: 3, Tím: 2).
  2. **Non-Breaking Cluster Wrapping (`shrink-0`)**: Mỗi cụm nhóm màu được bọc trong thẻ `div` có `shrink-0` và `gap-0.5`. Khi màn hình thu nhỏ xuống mobile `w-40`, các cụm tự động ngắt dòng theo cả nhóm (4 cụm dòng trên, 4 cụm dòng dưới, mỗi dòng 11 chấm với chiều rộng ~136px < 144px), tuyệt đối không bao giờ làm đứt rời các chấm trong cùng một nhóm màu.
  3. **Filled vs Hollow Visual Semantic (`data-owned`)**: Ô người chơi sở hữu được tô đặc bằng màu nhóm `COLOR_GROUP_HEX[group]` (`data-owned="true"`). Ô chưa mua hoặc đối thủ nắm giữ hiển thị dạng vòng tròn rỗng viền xám nhạt `border-slate-300 bg-slate-100/70` (`data-owned="false"`).
  4. **Accessible Tooltip Title**: Mỗi chấm mang thuộc tính `title` chỉ rõ tên địa danh và tình trạng sở hữu (`${cell.name}: Đã sở hữu / Chưa sở hữu`).
- **Traceability**: `[TC-173.01..08/MSS]`, `tests/client/imp173_player_card_property_clusters.test.ts`, `tests/client/mobile_compact_hud_and_modals.test.ts`, `src/client/ui/player_card.tsx`.

---

### 246. [TELEMETRY/ECONOMY] Dynamic Round GO Salary & Property Unmortgage Conservation Invariant (IMP-178)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Bẫy Lương GO Cố Định 2.000 Tr. Sau Vòng 21 (Hardcoded GO Salary Drift)*: Client telemetry watchdog hardcoded lương qua ô GO là `2.000 Tr.` (`2000 - tax + absorbedTax`). Tuy nhiên theo luật SSOT vĩ mô của VTCOON (`src/domain/room.ts:calculateGoSalary`), lương qua GO giảm xuống `1.500 Tr.` ở Vòng 21-30 và `1.000 Tr.` từ Vòng 31+. Khi người chơi vượt GO ở vòng 21+, chênh lệch 500 Tr. hoặc 1.000 Tr. lập tức kích hoạt cảnh báo sai `TREASURY_INVARIANT_VIOLATED: CRITICAL` trên Hộp đen máy bay.
  2. *Bẫy Bỏ Sót Chuộc Thế Chấp Khi Kiểm Định Kho Bạc (Unmortgage Redemption Deficit Trap)*: Trong `computeCellDelta`, Telemetry chỉ kiểm tra `cell.isMortgaged === true` (cộng tiền thế chấp `+Math.floor(deed.price * 0.5)`), bỏ qua chiều ngược lại khi người chơi giải chấp / chuộc tài sản (`cell.isMortgaged === false`). Khi unmortgage, người chơi phải trả `loan + fee = Math.floor(loan * 1.1)`, trong đó tiền nợ gốc `loan` trả về ngân hàng, và phí `fee = Math.floor(loan * 0.10)` nộp vào Kho bạc. Việc bỏ qua unmortgage khiến tổng tiền sụt giảm `loan` không có lý do được mô hình hóa, kích hoạt vi phạm thất thoát tiền tệ ảo.
  3. *Bẫy Cộng Dồn Trùng Lặp Cờ Thế Chấp (Duplicate Mortgage Flag Leak)*: Nếu delta kế tiếp tiếp tục gửi `cell.isMortgaged === true` trên ô đã bị thế chấp từ trước, việc thiếu kiểm tra `!wasMortgaged` làm cộng dồn tiền giả mạo vào kỳ vọng ngân sách.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Dynamic Round GO Salary Invariant**: `calculateGoSalary` trong Telemetry bắt buộc gọi `getRoundGoSalary(delta?.roundNumber ?? preState.roundNumber ?? 1)` từ `src/domain/room.ts`, đồng bộ hoàn toàn với giảm phát lương theo vòng đấu (Vòng 1-20: 2.000 Tr., Vòng 21-30: 1.500 Tr., Vòng 31+: 1.000 Tr.).
  2. **Bilateral Mortgage State Lifecycle**: `computeCellDelta` bắt buộc kiểm tra trạng thái trước đó `wasMortgaged`:
     - `isMortgaged === true && !wasMortgaged`: cộng tiền thế chấp `+Math.floor(deed.price * 0.5)`.
     - `isMortgaged === false && wasMortgaged`: trừ tiền chuộc `-(loan + fee)`, để `absorbedTreasury` tự động hấp thụ phần `fee` nộp vào Kho bạc, cân bằng hoàn hảo `postTotal - preTotal`.
- **Traceability**: `[TC-IMP40.17..20/MSS]`, `tests/client/telemetry_gameplay_invariants.test.ts`, `src/client/telemetry/telemetry_delta_hook.ts`.

---

### 247. [NET/CLIENT/TELEMETRY] Room Reset Lobby Transition & Movement Suppression Invariant (IMP-179)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Bẫy Kẹt Màn Hình Bàn Cờ Khi Phòng Reset Về Sảnh (Zombie In-Game UI On Room Reset)*: Khi người chơi AFK trên thiết bị di động (chuyển tab/thu nhỏ web), socket bị ngắt và thời gian ân hạn 60s hết hạn (`TOKEN_EXPIRED`). Khi mở lại tab, client tự động tạo lại phòng về sảnh chờ (`roomStarted: false`). Tuy nhiên hàm `syncGameStarted` trong `apply_delta.ts` trước đây chỉ có lệnh bật `setGameStarted(true)`, bỏ sót hoàn toàn chiều tắt `setGameStarted(false)`. Hậu quả là client bị kẹt ở màn hình bàn cờ, hiển thị nút "Đổ Xúc Xắc" sáng đèn dù phòng đang ở sảnh chờ. Người chơi bấm nút Đổ Xúc Xắc nhiều lần nhưng máy chủ từ chối vì trận đấu chưa bắt đầu.
  2. *Bẫy Cảnh Báo Ảo Nhảy Ô Khi Reset Phòng (False-Positive INVALID_POSITION_STEP On Lobby Delta)*: Khi phòng reset về sảnh chờ (Tick 1), delta mang vị trí ban đầu `position: 0`. Hàm `detectMovement` và `verifyMovementStep` trong Telemetry Client so sánh vị trí mới `0` với vị trí cũ trước khi AFK (ví dụ ô 27) và không kiểm tra cờ `roomStarted === false`, kích hoạt báo động sai nghiêm trọng `INVALID_POSITION_STEP: CRITICAL`.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Bilateral Lobby Transition Invariant**: `syncGameStarted` trong `apply_delta.ts` bắt buộc xử lý hai chiều cờ `delta.roomStarted`: nếu `delta.roomStarted === false`, lập tức gọi `useLobbyStore.getState().setGameStarted(false)` và `state.resetGameState?.()`, đưa giao diện trượt về Sảnh Chờ (`PreMatchDeck`) và dọn sạch các cờ hành động thừa.
  2. **Movement Invariant Room Started Guard**: `detectMovement`, `handleDeltaTelemetry` và `verifyMovementStep` bắt buộc chặn hoàn toàn việc kiểm tra bước đi khi `delta.roomStarted === false`, triệt tiêu 100% cảnh báo giả khi phòng được khởi tạo hoặc reset về sảnh chờ.
- **Traceability**: `[TC-IMP40.21..22/MSS]`, `[TC-IMP179.01..03/MSS]`, `tests/client/telemetry_gameplay_invariants.test.ts`, `tests/client/imp179_room_reset_lobby_sync.test.ts`, `src/client/network/apply_delta.ts`, `src/client/telemetry/telemetry_delta_hook.ts`, `src/client/telemetry/invariant_checker.ts`.

---

### 248. [NET/CLIENT/STORE] Authoritative Full-Sync Pruning & Clean Lobby State Reset Invariant (IMP-180)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Bẫy Ký Sinh Người Chơi Cũ Khi Full Sync (Zombie Player Retention On Full Sync)*: Khi máy chủ khởi tạo ván đấu mới hoặc phát delta với `forceFull: true` (`isFullSync === true`), máy chủ gửi danh sách người chơi authoritative (ví dụ 1 Host + 2 Bot = 3 người chơi: `['p1', 'bot_2', 'bot_3']`). Phía client, hàm `initPlayersInfoMap` sao chép nông toàn bộ `state.playersInfo` của ván đấu trước đó (nơi từng có 4 người chơi `['p1', 'bot_2', 'bot_3', 'bot_4']`). Hàm `applyPlayerDeltas` chỉ cập nhật các người chơi có mặt trong mảng delta, hoàn toàn bỏ qua việc loại bỏ (pruning) các người chơi dư thừa (`bot_4`). Đồng thời `nextPositions` cũng giữ nguyên tọa độ của `bot_4`, khiến bàn cờ 3D xuất hiện 3 Bot AI thay vì 2 Bot như chủ phòng đã chọn.
  2. *Bẫy Reset Khuyết Tật Dữ Liệu Game Store (Incomplete Game State Teardown)*: Hàm `resetGameState` trước đây chỉ đặt lại các cờ điều hướng camera và modal (`activeModal: null`, `cameraFocusCell: null`), bỏ sót việc dọn dẹp `playersInfo: {}`, `playerPositions: {}`, `visualPositions: {}`, `levelMap: {}`. Do đó khi phòng kết thúc hoặc reset về sảnh chờ, tàn dư của trận đấu trước vẫn lưu trong Zustand store.
  3. *Bẫy Xóa Nhầm Người Chơi Ở Sparse Delta (Sparse Delta False Pruning Trap)*: Nếu áp dụng việc xóa người chơi không có điều kiện, các sparse delta (delta định kỳ chỉ mang thông tin người chơi vừa đổ xúc xắc hoặc đổi số dư) sẽ xóa sạch toàn bộ các đối thủ khác trên bàn cờ.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Authoritative Full-Sync Pruning Guard**: `initPlayersInfoMap` và `applyPlayerDeltas` CHỈ ĐƯỢC PHÉP prune người chơi khi và chỉ khi thỏa mãn đồng thời: `isFullSync && Array.isArray(deltaPlayers)`. Mọi trường hợp sparse delta (`isFullSync === false`) hoặc full sync thiếu mảng players (`delta.players === undefined`) bắt buộc phải bảo lưu 100% người chơi hiện hữu.
  2. **Comprehensive INITIAL_GAME_STATE SSOT**: Trích xuất hằng số `INITIAL_GAME_STATE` chứa toàn bộ 27 trường dữ liệu trạng thái sạch (zero actions). `resetGameState` bắt buộc gọi `set(INITIAL_GAME_STATE)` để dọn sạch hoàn toàn các map `playersInfo`, `playerPositions`, `visualPositions`, `levelMap` về `{}`.
  3. **Non-Destructive Lobby Bot Reset**: Trong `lobby_store.ts`, bổ sung action `resetBotSlots()` chỉ biến các slot bot (`isBot: true`) thành empty slot (`createEmptySlot(i)`), bảo toàn nguyên vẹn `roomCode`, `myPlayerId`, `isHost` và slot người thật khi delta mang `roomStarted: false`.
- **Traceability**: `[TC-180.01..19/MSS]`, `[UC-IMP180]`, `tests/client/imp180_match_start_bot_count_and_zombie_purge.test.ts`, `src/client/network/apply_delta_players.ts`, `src/client/network/apply_delta.ts`, `src/client/store/game_store.ts`, `src/client/store/game_store_types.ts`, `src/client/store/lobby_store.ts`, `src/client/store/lobby_types.ts`.

---

### 249. [FSM/UI/NET] Dynamic Event Card Delta Synchronization & Null Tombstone Singleton Teardown (IMP-181)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Bẫy Gán Delta Tĩnh Đè Lên Biến Động Thực Tế (Static Metadata Delta Drift Trap)*: Trước đây `drawChanceCard` lấy `cardInfo = getChanceCardInfo(card)` và gán cứng `room.lastEventCard = cardInfo`. Với các thẻ tính tiền động theo trạng thái bàn cờ (`CC_LAND_CHANGE` trợ cấp +600 hoặc lệ phí -500; `CC_VENUE_INCIDENT` phạt -600 hoặc -1.200; `CC_SLOW_BUILD` phạt -300 hoặc -600; `CC_TAX_AUDIT` phạt 500 Tr./đất C0; `CC_FRANCHISE` thu 800 Tr./đối thủ; `CC_LAND_RECLAIM` bồi hoàn 150% giá đất), việc lấy trường tĩnh trong metadata làm sai lệch con số delta gửi về client, khiến popup và lịch sử hiển thị tiền phạt/thưởng ảo.
  2. *Bẫy Kẹt Singleton Thẻ Trùng Ở Lượt Tiếp Theo (Event Card Singleton Cache Lock Trap)*: `detectEventCardActivities` so sánh `lastProcessedEventCardKey = ${cardId}_${drawnBy}` để chống spam trùng thẻ trong cùng 1 lượt. Khi máy chủ phát delta tombstone (`lastEventCard: null`) để xóa thẻ giữa các lượt, client bỏ qua `null` mà không reset `lastProcessedEventCardKey`. Nếu lượt sau người chơi rút trúng cùng loại thẻ sau khi xáo bài, client lầm tưởng là delta trùng lặp và nuốt mất sự kiện hiển thị.
  3. *Bẫy Coi Chi Phí Đầu Tư Nâng Cấp/M&A Là Án Phạt (Investment Opportunity False-Penalty Stigma Trap)*: Các thẻ cơ hội mang tính đầu tư hoặc mở rộng quy mô (`CC_LAND_CHANGE`, `CC_MA_FORCE`, `CC_CONCERT_SPONSOR`, `CC_PLATE_AUCTION`, `CC_SWAP_PROJECT`) khi trừ tiền thực chất là thanh toán chi phí giao dịch/nâng cấp đất hoặc mua dự án đối thủ. Việc gắn nhãn "PHẠT:" màu đỏ viền hồng trên thẻ 3D và `FloatingTextType.Penalty` làm người chơi cảm thấy bị xử phạt tiêu cực thay vì nắm bắt cơ hội kinh doanh.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Authoritative Actual Delta Invariant**: `drawChanceCard` bắt buộc đo lường `actualDelta = current.balance - prevBalance` sau khi `applyChanceCard` chạy xong. Nếu `actualDelta !== 0`, đồng bộ `actualDelta` vào `room.lastEventCard.effectDelta` và cập nhật động đích đến `destination` ('Kho Bạc hỗ trợ...' vs 'Nộp vào Kho Bạc Nhà Nước' / 'Thanh toán chuyển nhượng cho đối thủ'). Nếu thẻ phi tài chính (`cardInfo.effectDelta === undefined` và `actualDelta === 0`), bảo toàn `effectDelta = undefined`.
  2. **Tombstone Teardown Invariant**: Trong `detectEventCardActivities`, khi `delta.lastEventCard === null`, BẮT BUỘC đặt lại `lastProcessedEventCardKey = null` để dọn sạch bộ nhớ cache đơn nhất (singleton), sẵn sàng đón nhận thẻ cùng loại ở các vòng quay tiếp theo.
  3. **Investment / Opportunity Palette Invariant**: Định nghĩa danh mục `INVESTMENT_OR_FEE_CARDS`. Khi chi phí âm (`effectDelta < 0`) thuộc nhóm này, thẻ bài 3D hiển thị nhãn `CHI PHÍ:` viền vàng/cyan `#FBBF24`/`#38BDF8` và Activity Tracker kích hoạt `FloatingTextType.Reward` thể hiện tính chất đầu tư tích cực.
- **Traceability**: `[TC-IMP181.01..21/MSS]`, `[UC-GAME-038..041]`, `tests/domain/imp181_dynamic_event_card_deltas.test.ts`, `src/domain/event_card_engine.ts`, `src/client/ui/modals/event_card_visuals.ts`, `src/client/3d/event_card_texture.ts`, `src/client/network/activity_tracker.ts`, `src/client/ui/event_card_punchy_summaries.ts`.

---

### 250. [NET/SYNC] / [UI/CRAFT] / [TELEMETRY] Mobile Tab Inactivity Resilience, Reconnect Unfreeze & Full-Sync Telemetry Invariant Calibration (IMP-182)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Bẫy Đơ Animation Và Xúc Xắc Khi Rời Tab / Nền Di Động (Mobile Tab Inactivity / Background Pawn & Dice Freeze Trap)*: Khi trình duyệt di động hoặc web tab bị ẩn (`document.visibilityState === 'hidden'`), các API `requestAnimationFrame` và CSS transitions bị tạm dừng để tiết kiệm pin. Nếu người chơi đang đổ xúc xắc (`isRolling: true`) hoặc có hoạt ảnh di chuyển quân cờ (`activePawnAnimation`, `pawnAnimationQueue`, `pendingPawnMove`), khi người chơi quay lại tab (`visibilitychange === visible`), các visual state này bị kẹt vô hạn, gây khóa cứng giao diện tương tác người dùng. Đồng thời `ActionDock` bị kẹt cờ `isRollPending: true` khiến nút "Đổ Xúc Xắc" bị vô hiệu hóa vĩnh viễn.
  2. *Bẫy Zombie Socket Treo Lơ Lửng Khi Thức Giấc (Silent Zombie WebSocket Inactivity Trap)*: Hệ điều hành di động thường ngắt socket ngầm khi chạy nền mà không phát sự kiện `close` hay `error` (half-open connection). Khi người dùng mở lại tab, socket vẫn báo `readyState === 1`. Nếu chỉ dựa vào socket hiện tại mà không có chó canh phòng (watchdog), client gửi tin `requestResync` nhưng không bao giờ nhận được phản hồi, khiến người chơi bị kẹt trong phòng chơi chết.
  3. *Bẫy Kẹt Nút "Đổ Xúc Xắc" Sau Khi Reconnect / Tràn Nút Di Động (Action Dock Roll Button Inactivity Lock & Overflow Trap)*: Khi reconnect hoặc full sync bàn cờ trong lúc đang ở pha `WaitingRoll`, `isRollPending` vẫn giữ `true` nếu không có cơ chế tự động giải phóng theo pha FSM và visibility. Thêm vào đó, trên màn hình di động hẹp (< 380px), thanh ActionDock chứa nhiều nút dài có thể bị tràn khung hình (overflow) gây vỡ bố cục nếu thiếu thanh cuộn ngang `overflow-x-auto no-scrollbar` và nhãn nút thích ứng (`hidden sm:inline` / `sm:hidden`).
  4. *Bẫy Báo Động Ảo Bất Biến Telemetry Khi Nhận Full Sync Authoritative (False Telemetry Calibration Trap On Authoritative Full Sync)*: Khi client reconnect và nhận delta full sync bàn cờ (40 ô `delta.cells.length === 40`), telemetry invariant checker cố so sánh bước nhảy vị trí `detectMovement` và biến động số dư dựa trên sparse delta, gây ra cảnh báo sai nghiêm trọng `INVALID_POSITION_STEP` và `BALANCE_INVARIANT_VIOLATION`. Thêm vào đó, khi thẻ `MC_CREDIT_STIMULUS` (chiết khấu 20% nâng cấp) có hiệu lực, phép tính chi phí nâng cấp mặc định `computeCellDelta` không tính chiết khấu dẫn đến chênh lệch kỳ vọng.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Reactivity Unfreeze & Watchdog Invariant**: Khi `visibilitychange` chuyển sang `visible` (kèm debounce 200ms chống bão sự kiện), hook `use_game_ws` bắt buộc dọn sạch `activePawnAnimation = null`, `pawnAnimationQueue = []`, `pendingPawnMove = null`, `isRolling = false`. Nếu socket đã chết (`readyState !== 0 && readyState !== 1`), lập tức gọi `connect()`. Nếu `readyState === 1`, gửi `INTENT_REQUEST_RESYNC` và khởi chạy `resyncWatchdogRef` 2.500ms; nếu sau 2.5s không nhận được bất kỳ tin nhắn nào từ máy chủ, đóng socket cũ và kết nối lại ngay lập tức.
  2. **ActionDock Responsive & Auto-Unfreeze Guard**: `ActionDock` bắt buộc bao bọc `<nav>` trong `max-w-[calc(100vw-1rem)] overflow-x-auto no-scrollbar`, nhãn nút Đổ Xúc Xắc rút gọn thành `Đổ` trên mobile hẹp (`sm:hidden`). Lắng nghe `visibilitychange` và thay đổi `turnPhase === TurnPhase.WaitingRoll` để tự động gỡ cờ `isRollPending = false` (có guard `if (isRollPending)` chống re-render vô tận trong SSR).
  3. **Full Sync Static Roll & Telemetry Invariant Calibration**: Trong `applyDeltaToStore`, khi nhận full sync (40 ô), bắt buộc dọn sạch cờ visual animation và cập nhật xúc xắc tĩnh mà không kích hoạt SFX xúc xắc hoặc animation xúc xắc xoay; reset `hasRolledThisTurn = false`. Trong `telemetry_delta_hook.ts`, khi `isFullSync = Boolean(delta.cells && delta.cells.length === 40)`, triệt tiêu hoàn toàn `movement = undefined` và đăng ký delta vào chế độ thiết lập ban đầu `isInitialSetupOrCalibration`. Đồng thời tích hợp chiết khấu 20% cho `MC_CREDIT_STIMULUS` khi kiểm tra delta nâng cấp ô đất.
- **Traceability**: `[TC-IMP182.01..25/MSS]`, `[UC-IMP182]`, `tests/client/imp182_mobile_inactivity_and_reconnect_unfreeze.test.ts`, `src/client/network/use_game_ws.ts`, `src/client/network/apply_delta.ts`, `src/client/ui/action_dock.tsx`, `src/client/telemetry/telemetry_delta_hook.ts`.

---

### 251. [NET/SYNC] / [STORAGE] Auto-Terminate When All Humans Leave & Master Manifest Merge (IMP-176)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Bẫy Hủy Phòng Oan Khi Chủ Phòng Rời Đi Trong Trận Đấu Nhiều Người (Premature Host Departure Room Teardown Trap)*: Trước đây, khi `room.hostId === msg.playerId`, `handleLeaveRoom` lập tức đóng phòng và giải tán toàn bộ người chơi (`ctx.closeRoom`), kể cả khi các người chơi thật khác vẫn đang thi đấu.
  2. *Bẫy Kẹt Trận Đấu Toàn Bot Sau Khi Con Người Rời Đi / Mất Kết Nối (Zombie All-Bot Room Resource Leak Trap)*: Khi tất cả người chơi thật thoát phòng hoặc hết thời gian ân hạn 60s (`gracePeriod`), phòng tiếp tục chạy vòng lặp Bot vô tận, lãng phí tài nguyên CPU/RAM máy chủ và tạo ra các phiên chơi ma.
  3. *Bẫy Ghi Đè Trắng Master Manifest Khi Boot Lạnh / Mạng Lỗi (Cold Boot Manifest Overwrite & Corrupt Merge Trap)*: Khi máy chủ khởi động lại hoặc instance mới hoàn tất trận đấu, việc tải manifest từ Supabase nếu không tải trước (`downloadFile`) sẽ ghi đè danh sách phòng cũ. Thêm vào đó, nếu gặp lỗi mạng (5xx/timeout), nếu cố ghi manifest sẽ phá hủy dữ liệu lịch sử trên Cloud.
  4. *Bẫy Rò Rỉ Timer Đấu Giá Khi Đóng Phòng (Auction Timer Leak On Room Close)*: `closeRoom` trước đây chỉ gọi `clearRoom(roomCode)`, bỏ quên `auctionSettleTimers`, khiến timer giải quyết đấu giá tiếp tục kích hoạt sau khi phòng đã bị hủy.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Multi-Human Host Migration Invariant**: Trong trận đấu đang diễn ra (`room.started`), khi người chơi rời phòng, nếu còn người chơi thật khác (`remainingHumans.length > 0`), KHÔNG ĐƯỢC đóng phòng. Nếu người rời là chủ phòng (`room.hostId === msg.playerId`), tự động chuyển giao quyền chủ phòng cho người chơi thật kế tiếp (`room.hostId = remainingHumans[0]!.id`).
  2. **Authoritative All-Humans-Disconnected Teardown**: Nếu `remainingHumans.length === 0` (hoặc sau `BotEngine.takeover` khi grace period hết hạn mà không còn người thật nào `!hasHuman`), máy chủ lập tức đóng phòng với trạng thái `status: 'TERMINATED'`.
  3. **Sequential Manifest Sync Queue & Fail-Safe Guard**: Toàn bộ thao tác cập nhật master manifest Cloud (`_manifest/rooms_manifest.json`) bắt buộc xếp hàng tuần tự qua `manifestSyncQueue: Promise<void>`. Bắt buộc kiểm tra `cloudStatus`: nếu gặp lỗi mạng / 5xx / timeout (`cloudStatus !== 200 && cloudStatus !== 404`), BẮT BUỘC bỏ qua thao tác upload manifest để bảo vệ dữ liệu Cloud không bị ghi đè rỗng.
  4. **Thorough Turn Orchestrator Teardown (`destroyRoom`)**: `destroyRoom(roomCode)` bắt buộc dọn dẹp sạch sẽ cả `activeTimers`, `deadlines`, và `auctionSettleTimers`.
- **Traceability**: `[TC-IMP176.01..08/MSS]`, `[UC-IMP176]`, `tests/server/imp176_auto_terminate_and_manifest_merge.test.ts`, `src/server/network/turn_orchestrator.ts`, `src/server/network/wss_server.ts`, `src/server/network/wss_lobby_handlers.ts`, `src/server/network/reconnect_manager.ts`, `src/server/storage/supabase_storage.ts`, `src/server/logging/persistent_room_logger.ts`.

---

### 252. [NET/BOT/SYNC] Auction Premature Timeout, Dual-Timer Desync & Telemetry GO Salary Calibration (IMP-184)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Bẫy Đóng Sàn Sớm Khi Bot Rút Lui (Auction Premature Timeout Trap)*: Khi tất cả bot AI bỏ cuộc (`eligibleBots.length === 0` hoặc bot cuối pass), hàm `stepAuctionBot` trước đây lập tức trả về `{ changed: false, finished: true }` và đóng sàn đấu giá mà không kiểm tra xem các đối thủ người chơi thật (`otherContenders`) đã bấm Pass hay chưa. Hậu quả là người chơi thật bị cướp mất cửa sổ đấu giá 20 giây một cách vô lý.
  2. *Bẫy Lệch Nhịp Dual-Timer (Dual-Timer Desync Overwrite Trap)*: `scheduleBotStep` khi chuyển nhịp đấu giá gọi `this.orchestrate(roomCode, AUCTION_BOT_STEP_DELAY_MS)`. Tham số `AUCTION_BOT_STEP_DELAY_MS` (1.000ms) bị truyền vào làm `customTimeoutMs` trong `orchestrate`, đè bẹp thời hạn 20.000ms chuẩn của `AuctionPhase` và ép người chơi thật chỉ có 1 giây để thao tác. Đồng thời `auction_manager.ts` dùng mốc 15.000ms lệch pha với Orchestrator (20.000ms), khiến các lệnh đặt giá ở giây 17-19 bị từ chối với lỗi `AUCTION_EXPIRED`.
  3. *Bẫy Báo Động Ảo Lương GO Khi Di Chuyển X2 (Double Next Dice False Alarm Trap)*: Khi thẻ cơ hội hoặc xúc xắc nhân đôi bước đi (`diceSum * 2`), `verifyMovementStep` và `detectMovement` chỉ chấp nhận `(fromPos + diceSum) % 40`, hiểu lầm bước đi nhân đôi là dịch chuyển tức thời (`isTeleport: true`) và triệt tiêu tính toán tiền lương GO (+2.000 Tr), dẫn đến cảnh báo sai lệch quỹ `TREASURY_INVARIANT_VIOLATED`. Ngoài ra khi quân cờ thăm tù tự do (`inAudit: false` qua ô 10), `isUnmodeledEvent` coi nhầm là sự kiện kiểm toán chưa mô hình hóa và bỏ qua kiểm tra số dư.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Contender Completion Guard**: `stepAuctionBot` và `finalizeAuctionIfFinished` CHỈ ĐƯỢC PHÉP đóng sàn đấu giá khi và chỉ khi toàn bộ đối thủ còn sống (`otherContenders.length === 0 || otherContenders.every((p) => auction.passedPlayers?.has(p.id))`). Nếu còn người chơi thật chưa pass, bắt buộc trả về `{ changed: false, finished: false }`. Bổ sung vòng lặp an toàn `iterations < 30` và `if (step.finished || !step.changed) break;` chống kẹt 100% CPU.
  2. **Unified 20s Auction Window & Anti-Sniping Pacing**: Đồng bộ hóa thời lượng phiên đấu giá đạt chuẩn 20.000ms (`PHASE_TIMEOUTS_MS[TurnPhase.AuctionPhase]`) xuyên suốt `handleDecline`, `handleAuctionBid`, `handleAuctionPass` và `TurnOrchestrator`. Tuyệt đối không truyền `AUCTION_BOT_STEP_DELAY_MS` vào `orchestrate`. Bổ sung đệm chống bắn tỉa (anti-sniping): khi đặt giá ở `<= 3s` cuối, tự động gia hạn thêm `+3.000ms`.
  3. **Double Step & GO Salary Invariant Alignment**: `verifyMovementStep` chấp nhận cả `expectedNormal = (from + diceSum) % 40` lẫn `expectedDouble = (from + diceSum * 2) % 40`. `detectMovement` và `computeExpectedDelta` tính toán `effectiveSteps` và xác nhận vượt ô GO khi `(from + effectiveSteps >= 40)` trừ khi bị bắt vào tù (`isSentToAudit === true`). Loại trừ ô Trạm Kiểm Toán tự do (`inAudit: false`) khỏi các sự kiện chưa mô hình hóa (`isUnmodeledEvent`).
- **Traceability**: `[TC-IMP184.01..17/MSS]`, `[UC-GAME-028]`, `tests/server/imp184_auction_human_window_and_telemetry_go.test.ts`, `src/server/room_bot_coordinator.ts`, `src/server/network/turn_orchestrator.ts`, `src/server/auction_manager.ts`, `src/client/telemetry/invariant_checker.ts`, `src/client/telemetry/telemetry_delta_hook.ts`, `src/client/ui/modals/auction_modal.tsx`.

---

### 253. [TELEMETRY/RULE] Property Purchase Treasury Decoupling & Multi-Transaction Tick Calibration (IMP-185)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Bẫy Báo Động Ảo Lệch Quỹ Khi Mua Đất Kèm Biến Động Kho Bạc (Property Purchase Treasury Coupling Trap)*: Tại Tick 368 (Phòng `VTBX1T`), người chơi mua ô đất trị giá 2.350 Tr. từ ngân hàng (`actualDelta = -2350 Tr.`). Trong cùng tick này, quỹ kho bạc tăng trưởng (`treasuryGain = 1.025 Tr.`). Hàm `computeExpectedDelta` trong Telemetry Delta Hook trước đây tự ý gộp `absorbedTreasury` vào `cellDelta` khi tính toán bảo toàn tiền tệ, làm cho số tiền kỳ vọng bị tính lệch thành `-2350 + 1025 = -1325 Tr.`. Telemetry Watchdog so sánh `actualDelta (-2350) !== expected (-1325)` và kích hoạt báo động đỏ `TREASURY_INVARIANT_VIOLATED`, dù tổng tài chính thực tế toàn phòng không hề thất thoát (`preTotal = 42447, postTotal = 40097`).
  2. *Bẫy Đóng Sàn Đấu Giá Oan Ứng Trong 2.5 Giây Do Lệch Pha Triển Khai (Premature Auction Finalization On Legacy Build)*: Tại Tick 383–385 của cùng trận đấu, `bot_4` từ chối mua ô 32 kích hoạt đấu giá. Chỉ sau 2.555 giây (1.6s để `bot_3` bid + 0.94s để server cũ tự kết thúc vì hết bot), sàn đấu giá bị đóng phụt lại ngay trước mũi người chơi thật (`p1`). Người chơi gửi lệnh `INTENT_BID` lúc `1790176531080` nhưng chỉ 8ms sau máy chủ phát sinh Tick 385 chốt bán cho `bot_3`, khiến giao diện bị `inactive` và người chơi bị ngăn chặn mua đất một cách vô lý. Vé IMP-184 đã chặn đứng lỗi này trên mã nguồn, nhưng bản build cũ trên Render chưa được deploy.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Treasury & Property Purchase Decoupling Invariant**: Trong `telemetry_delta_hook.ts`, biến động mua ô đất từ ngân hàng (`cellDelta < 0`) BẮT BUỘC phải được tính toán độc lập với `treasuryGain`. Chỉ cho phép hấp thụ kho bạc vào giao dịch đất đai khi đấu giá phát mãi nợ nộp thẳng vào kho bạc (`cellDelta < 0 && treasuryGain > 0 && treasuryGain === -cellDelta`). Mọi trường hợp mua đất ngân hàng thông thường, `cellDelta` giữ nguyên giá mua và không được cộng trừ với quỹ kho bạc.
  2. **Multi-Source Purchase Cost Resolution Invariant**: Hàm `resolvePurchaseCost` ưu tiên đọc giá trúng thầu từ `delta.auction.finalPrice` hoặc `currentBid`, kế đến số tiền người mua đã thực chi (`buyerSpent`), rồi mới fallback sang `highestBid` và `deed.price`.
  3. **Auction Window & Bot Step Immunity**: Duy trì tuyệt đối nguyên tắc từ IMP-184: không bao giờ cho phép nhịp bot (`AUCTION_BOT_STEP_DELAY_MS`) đóng sàn sớm khi còn người chơi thật chưa bấm Pass.
- **Traceability**: `[TC-IMP185.01..02/MSS]`, `tests/client/telemetry_gameplay_invariants.test.ts`, `src/client/telemetry/telemetry_delta_hook.ts`, `src/server/network/turn_orchestrator.ts`, `src/server/logging/persistent_room_logger.ts`, `src/server/logging/room_logger_reindexer.ts`.

---

### 254. [3D/PERF] iOS WebKit Jetsam Defense, Mobile Texture LOD Budget & Direct Canvas Optimization (IMP-186)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Bẫy WebKit Jetsam OOM Crash Do Canvas Backing-Store*: Trên iOS WebKit (Safari / Chrome iOS), việc gọi `texture.dispose()` không lập tức giải phóng bộ nhớ đồ họa nếu backing-store của `<canvas>` vẫn giữ kích thước ban đầu (1024x1360 hoặc 1024x1024). Khi tích lũy qua 40 ô đất và Standee, WebKit vượt ngưỡng memory budget (Jetsam ceiling ~384MB trên mobile) và buộc trang bị reload / crash đột ngột.
  2. *Bẫy Mù Đoán Viewport Khi Xác Định Mobile (Viewport Resize Mobile Oscillation Trap)*: Dùng `window.innerWidth < 768` đơn thuần kết hợp event listener `resize` khiến desktop trình duyệt khi resize cửa sổ nhỏ lại bị chuyển sang cấu hình texture mobile và gán dpr=1, gây giật lag và tái nạp texture không cần thiết.
  3. *Bẫy Phóng To 200% Ở Góc Bo Mới Khi Nạp Ảnh Hoàn Tất (Corner Texture Scale Mismatch Bug)*: Trong `createCornerTileTexture`, khi `img.onload` kích hoạt, nếu dùng hằng số scale tĩnh `1024 / 384` trên canvas 512x512 của mobile, hình ảnh bị phóng to gấp đôi (200%), lệch khỏi bố cục ô cờ.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **WebKit Canvas Zero-Out Invariant**: Trước khi gọi `texture.dispose()`, bắt buộc zero hóa kích thước canvas `(canvas.width = 0; canvas.height = 0)` để ép WebKit giải phóng backing-store buffer ngay tức thì.
  2. **Hardware-First Detection & Pure Budget Decoupling**: Phân biệt rạch ròi `isMobileHardware()` (dựa vào `userAgent` và iPadOS touch points) với `isSmallViewport()`. Sa bàn 3D sử dụng `isMobileHardware()` làm SSOT cho texture LOD (Mobile: 512x680, anisotropy 2, scale 2; Desktop: 1024x1360, anisotropy 16, scale 4).
  3. **Isolated Cache Maps & Dynamic Revision Subscription**: Tách biệt hoàn toàn `mobileTileTextureCache`, `desktopTileTextureCache`, `mobileStandeeTextureCache`, `desktopStandeeTextureCache`. Sử dụng hook `useTextureRevision` (Pure DAG `texture_revision.ts`) để đồng bộ làm tươi texture 3D khi context restore hoặc clear caches mà không gây re-render vòng lặp.
- **Traceability**: `[TC-186.01..14/MSS]`, `[UC-IMP186]`, `tests/client/imp186_ios_mobile_texture_lod_and_jetsam_defense.test.ts`, `src/client/3d/device_detect.ts`, `src/client/3d/texture_revision.ts`, `src/client/3d/tile_texture_drawers.ts`, `src/client/3d/tile_texture_generator.ts`, `src/client/3d/texture_cache_manager.ts`, `src/client/game_canvas.tsx`, `src/client/3d/board_tile.tsx`.

---

### 255. [TELEMETRY/RULE/UI] Unmortgage Circulation Balance, M&A Buyout Activity Attribution & Inverted Victim Defense (IMP-187)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Bẫy Gấp Đôi Phí Giải Chấp Khi Tính Biến Động Lưu Thông (Unmortgage Fee Double-Dipping Trap)*: Tại Tick 307 và Tick 312, khi Bot giải chấp ô đất (ô 28 nợ 750 Tr., phí 75 Tr.; ô 27 nợ 1.300 Tr., phí 130 Tr.), `telemetry_delta_hook.ts` tính `deltaSum -= (loan + fee)` thay vì `-loan`. Thực tế phí 10% nộp vào Kho Bạc là chuyển nhượng nội bộ giữa người chơi và Kho Bạc (cả hai đều thuộc tổng tài chính hệ thống `sum(players) + treasury`), không làm hao hụt tiền tệ hệ thống. Việc trừ cả gốc lẫn phí làm biến động lưu thông kỳ vọng bị tính thừa, kích hoạt báo động đỏ giả `TREASURY_INVARIANT_VIOLATED` lệch đúng bằng số tiền gốc (-750 Tr. và -1.300 Tr.).
  2. *Bẫy Hiểu Lầm M&A Thâu Tóm Là Tiền Thuê & Ăn Mừng Oan Ứng Cho Nạn Nhân (M&A Rent Conflation & Inverted Celebration Trap)*: Tại Tick 309, Bot AI 3 dùng thẻ Cơ Hội `CC_MA_FORCE` ép mua khu đất Đà Nẵng của Người chơi 1 với giá 2.400 Tr. Hàm `activity_financial_tracker.ts` quét thấy P1 nhận 2.400 Tr. và Bot 3 mất 2.400 Tr., lập tức ghép đôi nhầm thành giao dịch nộp tiền thuê đất ("P1 thu tiền thuê 2.400 Tr. từ Bot 3"). Hệ quả: Người chơi 1 bị cướp mất khu đất nhưng hệ thống lại kích hoạt hoạt ảnh ăn mừng chiến thắng (`victory_spin` + chuông reo vàng son) cho nạn nhân!
  3. *Bẫy Xáo Trộn Thời Gian Nhân Quả (Casual Timeline Reversal)*: Nhật ký sự kiện ghi nhận giao dịch tài chính trước khi ghi nhận thẻ bài và chuyển quyền sở hữu ô cờ, khiến người chơi thấy tiền biến động trước khi biết lý do tại sao.
  4. *Bẫy Phantom "0 Tr." Badge Khi Rút Thẻ Có Chữ M&A (Card Announcement Phantom Badge Trap)*: Nếu dùng fallback `act.message.includes('M&A') || act.message.includes('thâu tóm')` trong `activity_badge_dispatcher.ts`, các thông báo rút thẻ cơ hội thông thường có chứa cụm từ này nhưng `cellIndex` và `amount` là `undefined`, làm sinh ra Floating Badge ma "0 Tr." và kích hoạt giật mình `slump_recoil` oan cho nhân vật.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Two-Sided Fund Flow & Net Circulation Invariant**: Khi giải chấp tài sản, biến động lưu thông tiền ròng của toàn hệ thống là `-loan` (hoàn trả tín dụng cho ngân hàng). Phí giải chấp 10% chuyển thẳng vào quỹ Kho Bạc là dòng tiền bảo toàn nội bộ, tuyệt đối không được trừ thêm vào `expectedDelta`.
  2. **M&A / Compulsory Buyout Activity Partitioning**: Giao dịch phát sinh từ các thẻ cưỡng chế mua lại (`CC_MA_FORCE`, `CC_SWAP_PROJECT`) phải được tách riêng thành phân loại `ma_buyout` (biểu tượng 🤝), hoàn toàn loại trừ khỏi danh sách khớp tiền thuê (`matchRentTransactions`) bằng tập hợp `buyoutCellIndices`, `handledPayerIds`, và `handledReceiverIds`.
  3. **Victim Defense & Causal Timeline Dispatch**: Nạn nhân bị thâu tóm đất bị cấm tuyệt đối mọi hoạt ảnh ăn mừng (`victory_spin`), thay vào đó nhận popup cảnh báo 2 dòng rõ ràng: "⚡ Bị thâu tóm: Đà Nẵng / Đối thủ đã mua đứt ô đất của bạn (+2.400 Tr.)". Trình tự phát sự kiện bắt buộc tuân thủ trục nhân quả: Thẻ bài sự kiện (Nguyên nhân) ➔ Chuyển quyền BĐS (Chuyển giao) ➔ Biến động số dư (Kết quả).
  4. **Strict Activity ID Matching Invariant**: Bắt buộc chỉ kiểm tra `act.id.startsWith('ma_buyout')`, triệt tiêu hoàn toàn việc dùng chuỗi nội dung `message.includes(...)` làm fallback. Bổ sung test đối kháng `[TC-187.05b/MSS][Adversarial]` bảo vệ công thức biến động Kho Bạc.
- **Traceability**: `[TC-187.01..16/MSS]`, `[TC-187.05b/MSS]`, `[UC-IMP187]`, `tests/contracts/imp187_ma_visibility_and_unmortgage_telemetry.test.ts` (589 LOC), `src/client/telemetry/telemetry_delta_hook.ts`, `src/client/network/activity_financial_tracker.ts`, `src/client/network/activity_property_tracker.ts`, `src/client/network/activity_badge_dispatcher.ts`, `src/client/network/activity_tracker.ts`, `src/client/ui/floating_numbers.tsx`, `src/client/3d/board_layout.tsx`, `src/client/3d/texture_revision.ts`.

---

### 256. [NET/UI/MOBILE] Mobile Safe-Area Ergonomics, Standalone PWA, Single-Interval Monotonic Liveness Watchdog & In-App WebView Defense (IMP-188)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Bẫy Che Khuất Tai Thỏ / Dynamic Island & Android Punch-Hole*: Khi kích hoạt `viewport-fit=cover`, viewport bung lên toàn bộ mặt kính vật lý. Nếu `TopBar` chỉ dùng đệm cố định 6px (`px-1.5`) mà thiếu `env(safe-area-inset-top)`, camera tai thỏ iPhone hoặc camera đục lỗ Android sẽ đè trực tiếp lên chỉ số vòng đấu, timer hoặc nút rời phòng.
  2. *Bẫy Timer Churn & Bão Sự Kiện Wakeup Trên Canvas 3D*: Cấp phát `setTimeout` mới cho mỗi gói tin mạng để canh chừng timeout NAT gây Garbage Collection giật lag trên R3F. Đồng thời, khi điện thoại thức giấc từ chế độ ngủ, các sự kiện `visibilitychange`, `focus`, `pageshow` và nhịp kiểm tra phát hỏa đồng loạt gây wakeup stampede và bão request resync lên server.
  3. *Bẫy Tranh Chấp Kết Nối Kép (Double Reconnect Race)*: Khi watchdog ngắt kết nối quá 12.5s, nếu vừa gọi `socket.close()` vừa gọi `connect()`, handler `socket.onclose` cũng tự kích hoạt timer exponential backoff, sinh ra 2 WebSocket song song gửi `RECONNECT` lên server, văng lỗi phiên và làm đứt kết nối dây chuyền.
  4. *Bẫy Kẹt Mở Trình Duyệt Trên Zalo/Messenger iOS*: WebView trong ứng dụng trên iOS chặn hoàn toàn mở Safari ngoài. Nút mở link thông thường chỉ reload chính WebView, giam người dùng trong môi trường thiếu ổn định.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **TopBar Safe-Area Inset Formula**: Thẻ `<header>` của `TopBar` bắt buộc sử dụng công thức `pt-[calc(0.375rem+env(safe-area-inset-top))]`, tự động rơi về 6px trên Desktop/Android không tai thỏ và mở rộng an toàn trên iPhone Dynamic Island / Android Punch-hole.
  2. **Single 1000ms Heartbeat & Monotonic Clock Invariant**: Hook `useWsLivenessWatchdog` duy trì DUY NHẤT 1 `setInterval(1000ms)` dùng `performance.now()` đơn điệu (chống lỗi nhảy giờ NTP). Hàm `recordPacketReceived()` chỉ gán ref O(1) với zero timer allocation. Phát hiện Clock Drift khi chênh lệch thời gian >= 5000ms (bỏ qua GC pause < 5s) và debounced 200ms chống bão sự kiện.
  3. **Silent NAT 12.5s Single-Close Invariant**: Timeout NAT Watchdog được tính chuẩn xác bằng 2.5 * HEARTBEAT_INTERVAL_MS = 12.5s (dựa trên server ping 5s). Watchdog chỉ gọi `socket.close()` có cờ khóa `onDeadSocket` một lần duy nhất, nhường quyền tái kết nối an toàn cho `socket.onclose` tiêu chuẩn, triệt tiêu hoàn toàn rủi ro 2 socket song song.
  4. **Z-50 In-App WebView Safe Banner**: Component `InAppBrowserBanner` neo `fixed top-0 left-0 right-0 z-50 pointer-events-auto` có đệm `pt-[env(safe-area-inset-top)]`, cung cấp hướng dẫn menu "⋯" + nút "📋 Sao chép liên kết" (`navigator.clipboard`) + nút "✕ Bỏ qua" lưu `sessionStorage`, chống che khuất và chống giật CLS cho bàn cờ 3D.
- **Traceability**: `[TC-188.01..18/MSS]`, `[UC-188]`, `tests/contracts/imp188_mobile_safe_area_and_network_watchdog.test.ts`, `src/client/ui/top_bar.tsx`, `index.html`, `public/manifest.json`, `src/client/network/ws_liveness_watchdog.ts`, `src/client/network/use_game_ws.ts`, `src/client/ui/in_app_browser_banner.tsx`, `src/client/ui/hud_container.tsx`.

---

### 257. [UI/3D/AUDIO] Hybrid Haptics Engine, Actor-Partitioned Tactile Feedback & iOS Safari Interruption Recovery (IMP-189)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Bẫy Rung Oan Toàn Cục Khi Đối Thủ Hành Động (Opponent SFX Phantom Vibration Trap)*: Gắn cơ chế rung xúc giác một cách mù quáng vào `AudioEngine.playSfx(sfx)` toàn cục. Khi đối thủ hoặc Bot bước đi (10 bước = 10 lần rung), dẫm ô phạt thuế, hoặc bị phá sản, điện thoại của người chơi cục bộ rung liên hồi, gây ảo giác bản thân vừa bị trừ tiền hoặc đến lượt.
  2. *Bẫy WebKit Safari 'interrupted' State & Điếc Âm Thanh Sau Cuộc Gọi*: Trên Safari iOS, khi có cuộc gọi đến, chuông báo thức hoặc kích hoạt Siri, WebKit chuyển `AudioContext.state` sang `'interrupted'` (khác với `'suspended'`). Nếu chỉ kiểm tra `state === 'suspended'` như thông thường, mã nguồn bỏ qua lệnh gọi `resume()`, khiến âm thanh và WebAudio bị tê liệt vĩnh viễn sau cuộc gọi điện thoại.
  3. *Bẫy Sập WebAudio Do Exponential Ramp Về 0 (W3C Zero-Ramp RangeError Trap)*: Tiêu chuẩn W3C WebAudio nghiêm cấm gọi `exponentialRampToValueAtTime(0, time)` (ném ngoại lệ `RangeError: target value must be non-zero`). Nếu dev viết xung click hạ âm về 0 sẽ làm sập WebAudio trên mọi trình duyệt. Đồng thời, `navigator.vibrate` trong iframe thiếu quyền `allow="vibrate"` sẽ quăng ngoại lệ `SecurityError`.
  4. *Bẫy Thuộc Tính Ảo `state.myPlayerId`*: `GameState` của bàn cờ không chứa `myPlayerId` (thuộc tính này nằm tại `useLobbyStore`). Truy xuất qua `state.myPlayerId` khiến logic kiểm tra lượt đi cục bộ vĩnh viễn trả về `false`, làm tê liệt rung thông báo lượt (`turnAlert`).
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Actor Partitioning Haptic Invariant**: Rung xúc giác là phản hồi cá nhân của người cầm máy, tuyệt đối không được kích hoạt bởi hành động của đối thủ từ xa. Rung lượt đi (`turnAlert`) chỉ phát hỏa khi `turnPlayerId === useLobbyStore.getState().myPlayerId` và người chơi chưa bị phá sản (`!state.playersInfo[myPid]?.bankrupt`).
  2. **W3C Positive Floor & Safe Vibrate Invariant**: Trong `playTactileClick` (iOS Safari Acoustic-Tactile Illusion), đường cong suy giảm âm lượng bắt buộc hạ về sàn dương an toàn `0.0001` tại 8ms, dừng dao động ở 10ms và dọn dẹp node qua `osc.onended`. Mọi lệnh gọi `navigator.vibrate` bắt buộc bọc trong `try...catch` để an toàn trong mọi môi trường WebView/Iframe.
  3. **Audio Interruption Resilient Watchdog**: `AudioEngine` lắng nghe sự kiện `statechange` trên cả `Howler.ctx` và `SoundEngine.getContext()`. Khi phát hiện trạng thái `'interrupted'` hoặc `'suspended'`, cơ chế `armInterruptionRecovery` sử dụng cờ `isRecoveryArmed` đăng ký bộ đón chạm khẩn cấp (`pointerdown`, `touchstart` capture phase) để gọi `resume()` ngay khi người dùng chạm vào màn hình tiếp theo, phục hồi âm thanh 100% không cần F5 trang.
  4. **LOC & Layout Preservation Invariant**: Bảo lưu nguyên vẹn 100% `sound_engine.ts` (391 LOC), `action_dock.tsx` (397 LOC), và `top_bar.tsx` (212 LOC). Tuyệt đối không nhồi nhét nút chuyển đổi rung vào `TopBar` trên màn hình 360px.
- **Traceability**: `[TC-189.01..16/MSS]`, `[UC-IMP189]`, `tests/contracts/imp189_hybrid_haptics_and_audio_recovery.test.ts`, `src/client/haptics/haptic_engine.ts`, `src/client/store/audio_store.ts`, `src/client/audio/audio_engine.ts`, `src/client/network/apply_delta.ts`, `src/client/network/apply_delta_players.ts`.

---

### 258. [UI/3D/RENDER] Tablet Retina Texture LOD 1024px, Camera Orbit Smooth Lerp Recovery & Foldable 320px Ergonomics (IMP-190)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Bẫy Đường Ống Texture LOD Bị Đứt Trên Tablet (Tablet 512px Mờ Ghost Trap)*: Hợp đồng kiểm thử hồi quy `TC-186.07` bắt buộc `isMobileHardware()` phải trả về `true` cho iPadOS (`Macintosh UA + maxTouchPoints > 1`). Nếu `board_tile.tsx` và `tile_texture_generator.ts` chỉ kiểm tra `isMobile = isMobileHardware()`, toàn bộ iPad và Android Tablet màn hình lớn (11-13 inch Retina) bị ép dùng cache 512x680 mờ, lãng phí tài nguyên RAM 4GB–16GB của máy tính bảng.
  2. *Bẫy Xung Đột Camera State Machine (Tile Focus Snap-Back Trap)*: Khi người chơi đã đổ xúc xắc (`hasRolledThisTurn = true`) hoặc đang soi ô đất (`cameraFocusCell !== null`), camera mode là `tile_focus`. Nếu nút Snap camera chỉ bật cờ reset mà không xóa `cameraFocusCell` và thiếu cờ ghi đè `isManualOverviewReset`, camera sẽ giật về overview trong 1 frame rồi ngay lập tức lerp ngược trở lại ô đất.
  3. *Bẫy Giật Cục 0ms (Hard Snap Cut Trap)*: Gọi trực tiếp `camera.position.set(...)` trong hàm reset camera gây cú giật hình 0ms thô bạo (visual jarring cut), phá vỡ trải nghiệm mượt mà và đẳng cấp thẩm mỹ 3D.
  4. *Bẫy Tràn Viền 91px Trên Galaxy Z Fold 320px*: Màn hình ngoài của điện thoại gập (Samsung Galaxy Z Fold) chỉ rộng 320px (khả dụng 308px). TopBar chứa cả capsule thông số trận đấu lẫn cụm tiện ích tiêu tốn 399px, khiến các nút Mute (🔊) và Nhật Ký (📜) bị đẩy văng ra khỏi màn hình do `<header>` có `overflow-hidden`.
  5. *Bẫy Nút Snap "Ma" Lưu Cữu Sang Lượt Đối Thủ / Bot (Turn N+1 Ghost Pill)*: Không reset cờ `hasUserCustomCamera` khi chuyển lượt hoặc khi gieo xúc xắc, khiến nút `[🧭 Góc Nhìn Chuẩn]` hiển thị trơ trọi suốt cả trận và có thể bị bấm nhầm làm giật camera khi Bot đang di chuyển.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Tablet vs Phone Hardware Separation Invariant**: Tách bạch `isTabletDevice()` (iPadOS, Android Tablet không có `Mobile`, hoặc touch screen $\ge 768\text{px}$) và `isPhoneHardware()` (`isMobileHardware() && !isTabletDevice()`). `tile_texture_generator.ts` và `board_tile.tsx` nạp `desktopTileTextureCache` (1024x1360) cho Tablet và Desktop, trong khi điện thoại nhỏ vẫn dùng `mobileTileTextureCache` (512x680) để chống Jetsam OOM.
  2. **Camera Smooth Lerp & State Machine Override Invariant**: `window.__resetCameraToDefault()` bắt buộc gọi `setCameraFocusCell(null)`, kích hoạt `isManualOverviewResetRef.current = true`, và khởi tạo `camBaseRef` từ tọa độ hiện tại. Vòng lặp `useFrame` sử dụng hàm suy giảm mũ (exponential damping) đưa camera về `defaultPos` mượt mà, tắt cờ reset khi cự ly $< 0.05\text{ units}$, cấm tuyệt đối hard `camera.position.set(...)`.
  3. **Turn N+1 & Roll Camera Teardown Invariant**: Cờ `hasUserCustomCamera` bắt buộc được khởi tạo trong `INITIAL_GAME_STATE: false`, tự động reset về `false` khi gieo xúc xắc (`triggerDiceRoll`) và khi chuyển lượt (`syncTurnAndTimer`). OrbitControls chỉ kích hoạt `hasUserCustomCamera = true` tại `onEnd` khi độ lệch cự ly vị trí $> 0.8\text{ units}$ hoặc target $> 0.5\text{ units}$ (chống chạm nhẹ tap kích hoạt oan).
  4. **Dual-Pill Flex Container & ActionDock Clearance**: `RecenterPawnPill` và `CameraResetPill` gom chung trong flex container `fixed bottom-24 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-2 max-w-[95vw]`, không chồng đè tọa độ, tự động ẩn Recenter khi reset camera và đứng cách biệt an toàn trên `ActionDock`.
  5. **Foldable 320px Zero-Overflow Invariant**: Trên màn hình $< 360\text{px}$, `TopBar` tự động ẩn `mobile-fps-badge` (`hidden min-[360px]:inline-flex sm:hidden`) và vách ngăn đi kèm, giải phóng 65px chiều rộng. `PlayerHudList` co giãn theo `w-40 sm:w-48 md:w-64 max-w-[calc(100vw-8rem)]`, bảo đảm không bao giờ che quá 50% sa bàn ở màn hình siêu hẹp.
- **Traceability**: `[TC-190.01..16/MSS]`, `[UC-IMP190]`, `tests/contracts/imp190_specialized_devices_and_camera_snap.test.ts`, `src/client/3d/device_detect.ts`, `src/client/3d/tile_texture_generator.ts`, `src/client/3d/board_tile.tsx`, `src/client/store/game_store.ts`, `src/client/store/game_store_types.ts`, `src/client/network/apply_delta.ts`, `src/client/ui/camera_reset_pill.tsx`, `src/client/game_canvas.tsx`, `src/client/ui/hud_container.tsx`, `src/client/ui/top_bar.tsx`, `src/client/ui/player_hud_list.tsx`.

---

### 259. [NET/3D/UI/STATE] Delta Projection Invariant (prevState vs currentState), Three.js Window Injection Lifecycle & Universal Micro-Resource Teardown (IMP-188/189/190 Scout Audit)
- **Bẫy nghiệp vụ & kỹ thuật (Thực nghiệm 2 Vòng Scout)**:
  1. *Bẫy Triệt Tiêu Biến Thiên Delta (Delta Projection Collapse Trap)*: Khi áp dụng delta vào store, nếu truyền `currentState = store.getState()` vào các module đối chiếu (`trackDeltaActivities`, `handleDeltaTelemetry`), thì `prevState` trùng khít với `nextState`, khiến $\Delta = 0$. Kết quả là không sinh log bước đi của quân cờ, không hiện số nổi trừ tiền (-1.500 Tr.), nhưng game vẫn chạy và không có exception nào ném ra.
  2. *Bẫy Rò Rỉ Toàn Cục Cây Ba Chiều Three.js (`window.__three*`)*: Gán `window.__threeScene`, `window.__threeCamera`, `window.__orbitControls` để phục vụ E2E test hoặc debug bên ngoài. Khi component unmount (rời phòng, reset ván), nếu không `delete window.__*`, toàn bộ V8 heap sẽ giữ chặt tham chiếu tới hàng ngàn mesh, texture GPU và buffer geometry, gây Memory Leak trầm trọng.
  3. *Bẫy Rò Rỉ Micro-Timer Phản Hồi Tạm Thời (Toast / Clipboard Copy Feedback)*: Hành động bấm "Sao chép liên kết" kích hoạt `setTimeout(() => setCopied(false), 2000)` mà không lưu ID vào `useRef`. Nếu người chơi bấm Đóng banner hoặc chuyển trang trong vòng 2 giây đó, timer vẫn chạy ngầm và gọi `setState` trên component đã unmount.
  4. *Bẫy Treo Listener Trong Singletons & Rules of Hooks Khi Test Gọi Trần*: Singleton `AudioEngine` đăng ký `document.addEventListener('visibilitychange')` và `useAudioStore.subscribe()` nhưng hàm `dispose()` không gỡ bỏ. Đồng thời, component function có hook khi bị test unit gọi trần `Component({})` ném `Invalid hook call`, đòi hỏi fallback an toàn không phạm Rules of Hooks.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Dual State Projection Invariant**: Trong `applyDeltaToStore`, các hàm đồng bộ trạng thái FSM (lượt, timer, modal) thao tác trên `currentState = store.getState()`, nhưng các module so sánh biến thiên (`syncTelemetryAndActivities`) bắt buộc nhận snapshot `prevState` từ trước khi cập nhật store.
  2. **Global Window Injection Purge Invariant**: Mọi hook/component gắn cầu nối lên `window` bắt buộc phải có khối dọn dẹp `delete window.__threeScene`, `delete window.__threeCamera`, `delete window.__orbitControls` trong cleanup callback của `useEffect` và ref callback của OrbitControls khi unmount.
  3. **Micro-Timer Ref Cleanup Invariant**: Mọi timeout hiệu ứng UI bắt buộc lưu ref (`copyTimeoutRef`) và dọn dẹp trong `useEffect` unmount cũng như trong sự kiện Dismiss sớm.
  4. **Singleton Listener & Headless Fallback Invariant**: Lưu giữ tham chiếu `visibilityHandler` và `unsubAudioStore` để gọi gỡ bỏ sạch sẽ trong `dispose()`. Dùng helper an toàn tách biệt giữa React render context và headless unit call mà không dùng `any` hay hack internals.
---

### 260. [NET/UI/DTO] Financial Flow Multi-Party Transparency, Badge Directionality & Mobile Badge Priority (IMP-191)
- **Bẫy nghiệp vụ & kỹ thuật**:
  1. *Bẫy Tách Chuỗi Regex Lấy Đối Thủ Tiền Thuê (Regex/Split String Fragility Trap)*: Trước IMP-191, `handleRentBadge` phải tự `split('_')` từ `act.id` hoặc dùng regex bóc tách tên từ chuỗi `act.message` để tìm người thu tiền thuê. Cơ chế này cực kỳ mong manh: nếu tên người chơi chứa dấu gạch dưới `_`, dấu cách hoặc ký tự đặc biệt, logic bóc tách sẽ bị vỡ, lấy sai đối tác hoặc hiển thị `undefined`.
  2. *Bẫy Phát Hỏa Số Nổi Kép (Dual-Channel Phantom Toast/Number Trap)*: Cả `apply_delta_players.ts` (kênh cân bằng số dư thô) và `activity_badge_dispatcher.ts` (kênh hoạt động ngữ cảnh) đều có thể sinh số nổi hoặc toast. Nếu `apply_delta_players.ts` không loại trừ `isBail`, `isDebtRelief`, `isSalary`, người chơi sẽ bị 2 thông báo nổi đè lên nhau cùng lúc (một cái trần trụi chỉ có số tiền, một cái có đầy đủ ngữ cảnh ô 10 / Kho bạc).
  3. *Bẫy Nhập Nhằng Chiều Dòng Tiền & Hành Động Ngân Hàng*: Phạt thuế và tiền bảo lãnh kiểm toán đều là nộp vào Kho bạc nhưng trước đây dùng chung actionType `'tax'` thiếu phân biệt icon (🚨 vs 💸) và đích đến. Thế chấp và chuộc thế chấp dùng chung `'mortgage'` với dấu trừ/cộng không trực quan, thiếu ghi chú "từ Ngân Hàng" / "cho Ngân Hàng".
  4. *Bẫy Tràn Viền Tên Dài & Khuất Số Nổi Trên Mobile*: Tên người chơi dài (ví dụ "Đại Gia Sài Gòn (VIP)") trong huy hiệu số nổi khiến badge bị phình to vỡ layout mobile hoặc tràn màn hình. Ngoài ra, trên mobile chỉ hiển thị 2 số nổi gần nhất (`recentTwo`), nếu người chơi cục bộ (`myPlayerId`) bị đối tác trả tiền nhưng số nổi của đối tác xuất hiện sau, số nổi của người chơi cục bộ bị đẩy khỏi màn hình hiển thị.
- **Ràng buộc cứng & Thiết kế bất biến**:
  1. **Direct Partner DTO Invariant**: Mọi `ActivityLogEntry` liên quan đến giao dịch đa đối tượng bắt buộc mang thuộc tính trực tiếp `targetPlayerId?: string` và `targetPlayerName?: string`. Bộ điều phối huy hiệu (`activity_badge_dispatcher.ts`) cấm tuyệt đối việc dùng Regex hoặc `split` trên ID/Message để tìm người chơi liên quan.
  2. **Subtractive Balance Notification Partition**: `syncPlayerBalanceDiff` trong `apply_delta_players.ts` chỉ phát hỏa thông báo số dư thô cho các trường hợp đặc biệt không qua activity tracker (`if (!isDebtRelief && !isSalary) return;`), loại bỏ hoàn toàn việc phát sinh kép cho bảo lãnh kiểm toán.
  3. **Explicit Flow Direction & Dedicated Action Types**: Tách bạch rõ rệt `ActivityLogType` và `FloatingActionType` gồm: `'mortgage'` (🏦 Vay thế chấp... từ Ngân Hàng), `'unmortgage'` (🔓 Chuộc thế chấp... cho Ngân Hàng), `'bail'` (🚨 Nộp Bảo Lãnh Kiểm Toán (Ô 10) ➔ Vào Kho Bạc), `'tax'` (💸 Nộp Thuế... ➔ Vào Kho Bạc).
  4. **Compact Name & Local Player Viewport Placement**: Tên đối tác trên floating badge bắt buộc rút gọn tối đa 10 ký tự (`formatShortPlayerName(item.targetPlayerName, 10)`), có `line-clamp-2 break-words`. Trên mobile, nếu trong 2 số nổi gần nhất có chứa `myPlayerId`, phần tử của `myPlayerId` luôn được hoán đổi lên vị trí hiển thị ưu tiên (`displayItems[1]`).
- **Traceability**: `[TC-191.01..16/MSS]`, `[UC-IMP191]`, `tests/contracts/imp191_financial_flow_transparency_and_badge_clarity.test.ts`, `src/client/store/game_store_types.ts`, `src/client/store/activity_store.ts`, `src/client/network/activity_financial_tracker.ts`, `src/client/network/activity_property_tracker.ts`, `src/client/network/apply_delta_players.ts`, `src/client/network/activity_badge_dispatcher.ts`, `src/client/ui/floating_numbers.tsx`, `src/client/ui/ui_helpers.ts`.


