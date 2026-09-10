# BÁO CÁO KIỂM TOÁN CHUYÊN SÂU TOÀN DIỆN HỆ THỐNG VTCOON
*(DEEP FORENSIC LOGIC & ARCHITECTURAL AUDIT REPORT — SECOND-STAGE PEER REVIEW & SYNTHESIS)*

- **Dự án**: VTCoOn 3D Board Game (Cờ Tỷ Phú Bất Động Sản Việt Nam)
- **Thời gian kiểm toán**: 2026-09-10
- **Phạm vi kiểm toán**: Toàn bộ chu trình luồng dữ liệu Client – Server, WebSocket Wire Protocol, FSM Turn Loop, Bot AI Orchestration, 3D Canvas Diorama, UI Modals, Zustand Stores và Đối soát Hợp đồng Kiến trúc (ADR-0001, ADR-0002, Epic Networking Ledger).
- **Phương pháp thực hiện**: Phân tích tĩnh tĩnh học (Static Forensic Code Tracing), phản biện độc lập báo cáo sơ bộ (Peer Review & Verification), đối soát hợp đồng giao thức (Contract Reconciliation), và phân tích kiểm thử động (Vitest Suite Execution).

---

## 1. TỔNG KẾT MỨC ĐỘ SỨT MẺ HỆ THỐNG

### 1.1. Đánh giá phần trăm hoàn thiện thực tế giữa Client và Server

| Phân hệ kiến trúc | Điểm Unit Tests | Tỷ lệ đấu nối thực tế (Runtime Wiring) | Đánh giá hiện trạng & Nguyên nhân gốc |
| :--- | :---: | :---: | :--- |
| **Giao thức Mạng & Bắt tay (Handshake)** | 100% (57 suites pass) | **10.0%** | **ĐỨT GÃY TOÀN DIỆN**: Client không bao giờ gửi `CREATE_ROOM` hoặc `JOIN_ROOM`. Sảnh chờ ký hiệu "đã hoàn tất" trong Ledger nhưng chưa viết hook mạng. |
| **Xử lý Intent FSM & Đồng bộ State** | 100% (715 tests pass) | **20.0%** | **VÁN ĐẤU GIẢ LẬP "MA"**: Client tự sinh `Math.random()`, Server trả về `ROOM_NOT_FOUND` và bị Client nuốt lỗi hoàn toàn. |
| **Điều phối Bot AI (Turn Orchestration)** | 100% (BotEngine pass) | **0.0%** | **ĐÓNG BĂNG HOÀN TOÀN**: Server chỉ gọi Bot khi Disconnect Timeout; vòng lặp Server tự hủy khi gặp multi-bot; Client không có Bot runner. |
| **Hệ thống Ô Tiếp Đất (Landing Router)** | 95% (Domain pass) | **15.0%** | **HÌNH THỨC CỤC BỘ**: Tiếp đất đất người khác chỉ hiện floating text `"-500 Tr."` mà **không hề trừ tiền**; Ô 30/10 bị bỏ qua; Thưởng GO bị nhân đôi (+4.000 Tr.). |
| **Đồng bộ Dữ liệu (Delta Payload & VSC)** | 100% (Contract pass) | **25.0%** | **VI PHẠM VERTICAL SLICE**: `DeltaPayload` thiếu `currentTurnPlayerId`, `turnPhase`, `dice`, `auction`; `PlayerDelta` thiếu `inAudit`, `skipNextTurn`. |
| **Giao diện 3D & Modals Tác Vụ** | 90% (R3F Canvas pass) | **35.0%** | **LỖI HIỂN THỊ CHẮN TẦM NHÌN**: 36 tấm biển trắng khổng lồ che bàn cờ 3D; Modal Sổ Đỏ tràn màn hình cắt cụt nút bấm và chữ đè nút đóng. |
| **Quản lý Tài nguyên Tĩnh (Assets)** | 100% (Audio files đủ) | **30.0%** | **36 LỖI 404 CONSOLE**: Code cố nạp ảnh WebP từ thư mục `public/assets/tiles/` không tồn tại; 112 URLs nạp trước ảo. |
| **Vòng đời Đồng hồ & Timer Lượt** | 100% (Timer test pass) | **10.0%** | **TIÊU HỦY ĐỒNG HỒ**: Hook `useEffect` trong `main.tsx` tiêu hủy vĩnh viễn `setInterval` ngay sau lần re-render đầu tiên. |
| **TỔNG THỂ TOÀN HỆ THỐNG** | **98.0% (Lý thuyết Test)** | **18.5% (Thực tế Runtime)** | **HỆ THỐNG Ở TRẠNG THÁI TIỀN ALPHA RỖNG (HOLLOW PRE-ALPHA SKELETON)** |

---

### 1.2. Giải mã nghịch lý: "715 Tests Xanh Tuyệt Đối nhưng Game Không Thể Chơi"
Kết quả chạy kiểm thử thực tế ghi nhận: **57 test files, 715 tests PASS 100%** trong `4.24 giây`. Tuy nhiên, sự "hoàn hảo" này là một tấm màn che ngụy trang (Phantom Coverage) do các nguyên nhân kiến trúc sau:
1. **Kiểm thử độc lập cô lập trong bộ nhớ (In-Memory Isolation)**:
   - Các bài test server (`tests/server/*.test.ts`) tự khởi tạo đối tượng `RoomManager` trong RAM và gọi trực tiếp method TypeScript: `mgr.startGame(rc)`, `mgr.handleRollDice(rc, p)`. Các luồng này bỏ qua hoàn toàn tầng chuyển vận mạng WebSocket (`wss_server.ts`).
   - Bài test `tests/integration/walking_skeleton.test.ts` chỉ kiểm tra các hàm thuần túy của `SessionManager`, không hề kích hoạt tiến trình mạng thật.
2. **Ký duyệt khống trong Sổ cái Tiến độ (False Sign-off in Epic Ledger)**:
   - Trong `docs/epics/networking/_epic_ledger.md`, Slice `NET-02` được đánh dấu `🟢 Hoàn tất (Sign-off 2026-09-09)`. Tuy nhiên, đối soát mã nguồn thực tế cho thấy hai tệp cốt lõi được liệt kê trong ngân sách thiết kế là `src/client/hooks/use_lobby_ws.ts` và `src/server/lobby_handler.ts` **chưa từng được khởi tạo**!
   - Test suite `tests/client/net02_lobby.test.ts` chỉ test store Zustand cục bộ `useLobbyStore` mà không hề có kết nối mạng.
3. **Ảo tưởng Authoritative Server**:
   - Kiến trúc ADR-0001 quy định Server là cơ quan quyền uy duy nhất (Authoritative Server). Nhưng do mạng đứt gãy, Client đã âm thầm cài cắm logic cục bộ tự tung xúc xắc `Math.random()`, tự dời quân cờ, tự cộng thưởng GO, tạo cảm giác game đang chạy nhưng thực chất là một "ván đấu ma" hoàn toàn mất đồng bộ.

```
                  ┌─────────────────────────────────────────────────────────────┐
                  │                 TRẠNG THÁI RUNTIME THỰC TẾ                  │
                  └─────────────────────────────────────────────────────────────┘

       [Trình duyệt Client]                                      [Máy chủ Node.js WSS]
  ┌─────────────────────────────┐                           ┌─────────────────────────────┐
  │ 1. Mở trang web (/?room=..) │                           │ Khởi động WSS (Port 3001)   │
  │    useGameWs kết nối WS ────┼── WebSocket OPEN ────────►│ Chấp nhận TCP Socket        │
  │    (KHÔNG gửi CREATE/JOIN)  │                           │ (Chưa gán socket vào phòng) │
  │                             │                           │                             │
  │ 2. Bấm "BẮT ĐẦU TRẬN ĐẤU"   │                           │                             │
  │    lobby_store: gameStarted │                           │                             │
  │    (KHÔNG gửi START_GAME) ──┼── (Im lặng hoàn toàn) ───►│ room.started vẫn là FALSE   │
  │                             │                           │                             │
  │ 3. Bấm "ĐỔ XÚC XẮC"         │                           │                             │
  │    Client gửi INTENT_ROLL ──┼── {"type":"INTENT",...} ─►│ getRoom('VT8888') == null   │
  │    Client tự tính Math.rand │◄─ {"type":"ERROR",        │ Trả về ROOM_NOT_FOUND       │
  │    và tự chạy animation     │    "reasonCode":"..."}    │                             │
  │                             │                           │                             │
  │ 4. Client nuốt trọn lỗi!    │                           │                             │
  │    (Không hiện thông báo)   │                           │                             │
  │                             │                           │                             │
  │ 5. Chuyển lượt sang Bot     │                           │                             │
  │    isMyTurn = false         │                           │ runBotTurn KHÔNG ĐƯỢC GỌI!  │
  │    (KHÓA TOÀN BỘ PHÍM)      │                           │                             │
  │           ▼                 │                           │              ▼              │
  │   [BÀN CỜ ĐÓNG BĂNG]        │                           │     [SERVER BỎ HOANG PHÒNG] │
  └─────────────────────────────┘                           └─────────────────────────────┘
```

---

## 2. DANH MỤC CÁC ĐỨT GÃY LOGIC NGHIÊM TRỌNG (PHÂN LOẠI P0, P1, P2)

### 2.1. CÁC LỖI MỨC ĐỘ P0 (SHOWSTOPPER / HỆ THỐNG TÊ LIỆT HOÀN TOÀN)

#### P0-01: Client Không Bao Giờ Gửi `CREATE_ROOM` Hoặc `JOIN_ROOM` Khi Bắt Đầu
- **Tệp & Dòng mã vi phạm**: [`src/client/network/use_game_ws.ts:148-160`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/use_game_ws.ts#L148-L160) & [`src/client/main.tsx:51-71`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/main.tsx#L51-L71).
- **Bằng chứng mã nguồn**:
  ```typescript
  // src/client/network/use_game_ws.ts:148-160
  socket.onopen = (ev) => {
    setIsConnected(true);
    setErrorReason(null);
    const savedToken = getReconnectToken(roomCode);
    if (savedToken) {
      const reconnectMsg: WsClientMessage = {
        type: 'RECONNECT',
        reconnectToken: savedToken,
        roomCode,
      };
      socket.send(JSON.stringify(reconnectMsg));
    }
    // NẾU KHÔNG CÓ savedToken -> TUYỆT ĐỐI KHÔNG GỬI GÓI TIN NÀO!
  };
  ```
  Quét toàn bộ thư mục `src/client/`: Chuỗi `'CREATE_ROOM'` và `'JOIN_ROOM'` hoàn toàn vắng bóng.
- **Hậu quả thực tế**:
  Khi người chơi mở trang web, WebSocket kết nối thành công nhưng Server không hề biết Client này thuộc phòng nào. `this.rooms.getRoom(roomCode)` trên server không tìm thấy phòng. Bất kỳ Intent nào gửi lên sau đó đều bị đánh sập với lỗi `ROOM_NOT_FOUND`.

---

#### P0-02: Nút "Bắt Đầu Trận Đấu" Ở Sảnh Chỉ Đổi Biến Cục Bộ, Server Không Hề Hay Biết
- **Tệp & Dòng mã vi phạm**: [`src/client/ui/lobby/lobby_view.tsx:56-61`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/lobby/lobby_view.tsx#L56-L61), [`src/client/store/lobby_store.ts:180-185`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/lobby_store.ts#L180-L185), [`src/server/network/network_types.ts:30-51`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/network_types.ts#L30-L51), [`src/server/network/wss_server.ts:161-209`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_server.ts#L161-L209).
- **Bằng chứng mã nguồn**:
  ```typescript
  // src/client/store/lobby_store.ts:180-185
  startGame: () => {
    const check = get().canStartGame();
    if (!check.canStart) return { success: false, reasonCode: check.reasonCode };
    set({ gameStarted: true }); // CHỈ THAY ĐỔI BIẾN LOCAL TRONG ZUSTAND!
    return { success: true };
  },
  ```
  Định nghĩa giao thức `WsClientMessage` trong `src/server/network/network_types.ts:30-51` **không có tin nhắn `START_GAME`**. Bộ lọc bảo mật `EnvelopeValidator` ([`src/server/security/envelope_validator.ts:10-12`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/security/envelope_validator.ts#L10-L12)) cũng sẽ lập tức chặn đứng với mã lỗi `INVALID_ENVELOPE` nếu Client gửi tin nhắn không nằm trong whitelist `VALID_CLIENT_TYPES`.
- **Hậu quả thực tế**:
  Chủ phòng bấm bắt đầu, màn hình chuyển sang 3D Sa bàn, nhưng Server không kích hoạt `roomManager.startGame(roomCode)`. Thuộc tính `room.started` trên Server mãi mãi là `false`. Mọi Intent gửi lên đều bị `IntentGuard` từ chối với lý do `OUT_OF_TURN` ([`src/server/security/intent_guard.ts:23-26`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/security/intent_guard.ts#L23-L26)). Khách mời trong phòng không nhận được tín hiệu bắt đầu và bị kẹt lại ở Sảnh vĩnh viễn.

---

#### P0-03: Nuốt Lỗi Mạng Toàn Diện (`ROOM_NOT_FOUND`) & Giả Lập Bàn Cờ "Ma" Bằng `Math.random()`
- **Tệp & Dòng mã vi phạm**: [`src/client/main.tsx:51-57`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/main.tsx#L51-L57), [`src/client/main.tsx:198-235`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/main.tsx#L198-L235).
- **Bằng chứng mã nguồn**:
  ```typescript
  // src/client/main.tsx:51-57
  const { isConnected, sendIntent, sendEmote } = useGameWs({
    roomCode: roomCode || 'VT8888',
    playerId: localPlayerId,
    autoConnect: true,
    onGameOver: handleGameOver,
    onEmote: handleEmote,
    // onError BỊ BỎ QUA HOÀN TOÀN, BIẾN errorReason KHÔNG HỀ ĐƯỢC DESTRUCTURE!
  });
  ```
  ```typescript
  // src/client/main.tsx:198-212
  const handleRollDice = () => {
    const d1 = Math.floor(Math.random() * 6) + 1; // Client tự sinh xúc xắc
    const d2 = Math.floor(Math.random() * 6) + 1;
    triggerDiceRoll([d1, d2]);
    AudioEngine.playSfx(SoundEffect.DICE_ROLL);

    if (isConnected) {
      sendIntent({ type: 'INTENT_ROLL' }); // Bị Server reject ROOM_NOT_FOUND
    }
    // Client vẫn thản nhiên tính toán vị trí mới và kích hoạt animation sau 650ms:
    const targetCell = (currentPos + d1 + d2) % 40;
    setTimeout(() => {
      startPawnMove(activeId, targetCell);
      handleCellLanding(activeId, targetCell);
    }, 650);
  };
  ```
- **Hậu quả thực tế**:
  Game đánh lừa người chơi bằng cách mô phỏng di chuyển quân cờ và cộng tiền thưởng cục bộ. Người chơi tưởng game đang hoạt động bình thường, nhưng thực tế Server đã từ chối mọi yêu cầu từ gói tin đầu tiên. Trạng thái giữa 2 người chơi khác nhau bị phân rã hoàn toàn (Desync 100%).

---

#### P0-04: Bàn Cờ Đóng Băng Vĩnh Viễn Khi Chuyển Lượt Sang Bot AI (Bot AI Orchestration Void)
- **Tệp & Dòng mã vi phạm**: [`src/server/room_manager.ts:258-296`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts#L258-L296), [`src/server/turn_loop.ts:185-196`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/turn_loop.ts#L185-L196), [`src/client/main.tsx:237-248`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/main.tsx#L237-L248), [`src/client/ui/action_dock.tsx:30-47`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/action_dock.tsx#L30-L47).
- **Bằng chứng mã nguồn**:
  1. **Ở phía Server**: `runBotTurn` chỉ được gọi duy nhất tại [`src/server/network/reconnect_manager.ts:162`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/reconnect_manager.ts#L162). Khi kết thúc lượt bình thường (`executeTurnEnd`), Server chỉ tăng `currentPlayerIndex` mà **không hề gọi `runBotTurn`**.
  2. **Lỗi ngắt chuỗi nhiều Bot (Multi-Bot Chain Break)**:
     ```typescript
     // src/server/room_manager.ts:272-275
     while (safetyCounter < MAX_INTENTS) {
       const active = room.players[room.currentPlayerIndex];
       if (!active || !active.isBot || active.id !== current.id) break;
       ...
     ```
     Biến `current` được cố định ở đầu hàm (`current = room.players[room.currentPlayerIndex]`). Khi Bot 1 kết thúc lượt, `currentPlayerIndex` chuyển sang Bot 2. Ở vòng lặp kế tiếp, `active.id` (Bot 2) khác `current.id` (Bot 1) -> **Vòng lặp `while` lập tức bị `break`!** Do đó, kể cả khi được gọi, Server cũng không thể xử lý chuỗi nhiều Bot liên tiếp (Human -> Bot 1 -> Bot 2).
  3. **Ở phía Client**:
     Trong `main.tsx:244-245`, `handleEndTurn` tự tăng lượt sang người kế tiếp (ví dụ `bot_2`).
     Trong `action_dock.tsx:31`:
     `const isMyTurn = !localPlayerId || currentTurnPlayerId === localPlayerId;`
     Với `localPlayerId = 'p1'` và `currentTurnPlayerId = 'bot_2'`, `isMyTurn` nhận giá trị `false`. Cả 2 nút "Đổ Xúc Xắc" và "Hết Lượt" đều bị vô hiệu hóa (`disabled`).
- **Hậu quả thực tế**:
  Khi chuyển lượt sang Bot, Server không chạy Bot, Client không có mã chạy Bot, còn Human bị khóa toàn bộ nút bấm vì không phải lượt của mình. Bàn cờ đứng im bất động, ván đấu bị đóng băng vĩnh viễn.

---

#### P0-05: Tiêu Hủy Vĩnh Viễn Đồng Hồ Đếm Ngược Lượt Chơi Do Lỗi Lifecycle React
- **Tệp & Dòng mã vi phạm**: [`src/client/main.tsx:76-114`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/main.tsx#L76-L114).
- **Bằng chứng mã nguồn**:
  ```typescript
  // src/client/main.tsx:76-114
  useEffect(() => {
    if (!gameStarted) {
      gameInitializedRef.current = false;
      return;
    }

    if (gameInitializedRef.current) {
      return; // <-- NẾU ĐÃ KHỞI TẠO, LẬP TỨC THOÁT KHÔNG LÀM GÌ CẢ!
    }
    gameInitializedRef.current = true;
    ...
    const timer = setInterval(() => {
      useGameStore.getState().decrementTurnTimer();
    }, 1000);
    return () => clearInterval(timer);
  }, [gameStarted, lobbySlots, setPlayersInfo, setPlayerPositions, setCurrentTurnPlayerId, setTreasuryPool]);
  ```
- **Phân tích cơ chế gãy vỡ (Forensic Lifecycle Tracing)**:
  `useEffect` khai báo danh sách dependency bao gồm `setCurrentTurnPlayerId` và các hàm store. Khi bất kỳ state nào thay đổi hoặc người chơi kết thúc lượt, React thực thi hàm cleanup của effect trước đó (`clearInterval(timer)`). Ngay sau đó, effect chạy lại. Tuy nhiên, lúc này cờ `gameInitializedRef.current` đã là `true`, khiến hàm lập tức `return` tại dòng 83 mà **KHÔNG HỀ TẠO LẠI `setInterval` MỚI**!
- **Hậu quả thực tế**:
  Đồng hồ đếm ngược 60 giây bị xóa sổ hoàn toàn khỏi bộ nhớ ngay sau lần đổi lượt hoặc cập nhật state đầu tiên. Bộ đếm thời gian lượt chơi bị đóng băng, không bao giờ đếm lùi nữa trong suốt phần còn lại của ván đấu.

---

### 2.2. CÁC LỖI MỨC ĐỘ P1 (SAI LỆCH NGHIỆP VỤ & ĐỨT DÂY ĐẤU NỐI TÍNH NĂNG)

#### P1-01: Cho Phép Đổ Xúc Xắc Vô Tội Vạ Nhiều Lần & Bỏ Qua Đổ Xúc Xắc Vẫn Hết Lượt
- **Tệp & Dòng mã vi phạm**: [`src/client/ui/ui_helpers.ts:95-114`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/ui_helpers.ts#L95-L114), [`src/client/store/game_store.ts:91-142`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store.ts#L91-L142).
- **Bằng chứng mã nguồn**:
  ```typescript
  // src/client/ui/ui_helpers.ts:95-114
  export function isRollActionDisabled(params: ActionDockButtonStateParams): boolean {
    return params.isRolling || params.isPawnMoving || !params.isMyTurn || Boolean(params.isBankrupt);
  }
  export function isEndTurnDisabled(params: ActionDockButtonStateParams): boolean {
    return !params.isMyTurn || params.isRolling || params.isPawnMoving || Boolean(params.isBankrupt);
  }
  ```
  `game_store.ts` hoàn toàn không có thuộc tính `hasRolledThisTurn: boolean`.
- **Hậu quả thực tế**:
  Ngay khi quân cờ tiếp đất (`isRolling = false`, `isPawnMoving = false`), nút "Đổ Xúc Xắc" lập tức sáng xanh trở lại. Người chơi có thể bấm đổ liên tục 5–10 lần trong 1 lượt, đi vòng quanh bàn cờ tích lũy tiền thưởng GO và mua sạch đất. Đồng thời, người chơi cũng có thể bấm "Hết Lượt" ngay khi vừa bắt đầu lượt mà không cần đổ xúc xắc.

---

#### P1-02: Bàn Cờ 3D Bị 36 Tấm Biển Trắng Khổng Lồ Che Khuất Toàn Bộ Tầm Nhìn
- **Tệp & Dòng mã vi phạm**: [`src/client/3d/board_tile.tsx:126-143`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_tile.tsx#L126-L143), [`src/client/3d/board_tile.tsx:217`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_tile.tsx#L217).
- **Bằng chứng mã nguồn**:
  ```tsx
  // src/client/3d/board_tile.tsx:126-131
  <Billboard follow={true}>
    {/* Standee background plate màu trắng đục kích thước lớn 1.0 x 1.05 */}
    <mesh castShadow>
      <planeGeometry args={[1.0, 1.05]} />
      <meshBasicMaterial color="#FFFFFF" />
    </mesh>
    ...
  </Billboard>
  ```
- **Hậu quả thực tế**:
  36 ô không phải góc đều render `StandeeBillboard`. Do `follow={true}`, 36 tấm nền màu trắng đục luôn tự động xoay hướng thẳng về phía camera, lơ lửng trên mặt đất và che kín toàn bộ thông tin ô cờ, quân cờ, công trình 3D và giá tiền bên dưới.

---

#### P1-03: Modal Sổ Đỏ (Title Deed) Bị Tràn Màn Hình Cắt Cụt Nút Bấm & Đè Lên Nút Đóng
- **Tệp & Dòng mã vi phạm**: [`src/client/ui/modals/title_deed_modal.tsx:70-89`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/title_deed_modal.tsx#L70-L89), [`src/client/ui/modals/title_deed_modal.tsx:165-212`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/title_deed_modal.tsx#L165-L212).
- **Bằng chứng mã nguồn**:
  1. Thẻ bao ngoài dòng 70 thiếu `max-h-[90vh]` và `overflow-y-auto`. Tổng chiều cao của Header + Bảng giá niêm yết + Biểu phí 4 cấp (C0–C3) vượt quá chiều cao màn hình trình duyệt chuẩn (đặc biệt là 768p hoặc mobile). Footer chứa các nút "Mua BĐS", "Bỏ Qua", "Thế Chấp" bị đẩy ra ngoài mép dưới và bị cắt cụt.
  2. Nút đóng `✕` được đặt `absolute top-2 right-2` trong khi tiêu đề địa danh có cỡ chữ `text-xl font-black`. Với các địa danh có tên dài (ví dụ "CẢNG HKQT LONG THÀNH", "HẢI PHÒNG (PHỐ ẨM THỰC)"), văn bản tiêu đề tràn sang đè trực tiếp lên nút đóng `✕`, gây lỗi chồng lấn tap target.

---

#### P1-04: Tính Năng Đấu Giá (Auction) Bị Cô Lập Thành Mã Chết 100%
- **Tệp & Dòng mã vi phạm**: [`src/client/ui/modals/modal_host.tsx:93`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/modal_host.tsx#L93), [`src/server/session_manager.ts:38-42`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts#L38-L42).
- **Bằng chứng mã nguồn**:
  1. Tại `modal_host.tsx:93`: Nút "Bỏ Qua" mua đất chỉ gọi `onPass={closeModal}`, **không hề gửi `INTENT_DECLINE` lên Server**.
  2. Tìm kiếm trên toàn Client: Lệnh `openModal('auction', ...)` **không bao giờ được gọi ở bất kỳ vị trí nào**.
  3. Cấu trúc `DeltaPayload` trên Server ([`src/server/session_manager.ts:38-42`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts#L38-L42)) hoàn toàn không có trường dữ liệu nào về `auctionSession` để Client biết phiên đấu giá đã mở.
- **Hậu quả thực tế**:
  Tính năng Đấu giá bất động sản (UC-GAME-028) dù đã được lập trình giao diện (`auction_modal.tsx`) và FSM Server (`auction_manager.ts`) nhưng hoàn toàn bị cô lập, không bao giờ được kích hoạt trong thực tế.

---

#### P1-05: Nút "Xây Dựng" Không Thể Nâng Cấp BĐS (`INTENT_UPGRADE` & `INTENT_DOWNGRADE` Thiếu Giao Diện)
- **Tệp & Dòng mã vi phạm**: [`src/client/ui/action_dock.tsx:86-94`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/action_dock.tsx#L86-L94), [`src/client/ui/modals/title_deed_modal.tsx:166-187`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/title_deed_modal.tsx#L166-L187).
- **Bằng chứng mã nguồn**:
  `action_dock.tsx:92` mở `openModal('deed', { cellIndex: firstProp, canBuy: false })`. Nhưng khi mở ra, nếu tài sản đã sở hữu (`isOwned === true`), `TitleDeedModal` chỉ hiển thị nút "Thế Chấp" / "Giải Chấp" và "Đóng", **hoàn toàn không có nút "Nâng Cấp" hay "Hạ Cấp"**. Chuỗi `'INTENT_UPGRADE'` và `'INTENT_DOWNGRADE'` hoàn toàn không tồn tại trong thư mục `src/client/`.
- **Hậu quả thực tế**:
  Người chơi dù sở hữu trọn bộ màu độc quyền vẫn không thể xây dựng nhà phố C1, biệt thự C2 hay khách sạn C3. Tính năng cốt lõi của dòng game cờ tỷ phú bị tê liệt hoàn toàn.

---

#### P1-06: Lỗ Hổng Bảo Mật Giao Dịch P2P & Cắt Xén Dữ Liệu Trao Đổi
- **Tệp & Dòng mã vi phạm**: [`src/client/ui/modals/modal_host.tsx:135-148`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/modal_host.tsx#L135-L148), [`src/server/property_actions.ts:258-280`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/property_actions.ts#L258-L280).
- **Bằng chứng mã nguồn**:
  1. Giao diện `TradeModal` cho phép chọn danh sách nhiều BĐS và đề nghị tiền mặt hai chiều. Tuy nhiên tại `modal_host.tsx:138-146`, code cắt xén chỉ lấy `offeredProperties[0]`, gán cứng giá `price = tradePayload.cashRequest || 1000`, vứt bỏ toàn bộ danh sách BĐS yêu cầu và tiền mặt đối ứng.
  2. Tại Server (`property_actions.ts:258-280`), hàm `executeP2PTrade` lập tức trừ tiền của người mua và chuyển quyền sở hữu ô đất cho người bán ngay khi nhận được `INTENT_TRADE_OFFER` mà **không hề có bước xác nhận đồng thuận (Handshake) từ phía đối tác**.
- **Hậu quả thực tế**:
  Một người chơi có thể đơn phương ép buộc người chơi khác mua ô đất của mình với giá tùy ý mà nạn nhân không có quyền từ chối. Đây là một lỗ hổng nghiêm trọng cả về mặt trải nghiệm lẫn bảo mật luồng chơi.

---

#### P1-07: Cho Phép Người Chơi Âm Tiền Bỏ Qua Thấu Chi & Trốn Tránh Phá Sản
- **Tệp & Dòng mã vi phạm**: [`src/client/main.tsx:191-193`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/main.tsx#L191-L193), [`src/client/ui/ui_helpers.ts:107-114`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/ui_helpers.ts#L107-L114).
- **Bằng chứng mã nguồn**:
  Khi số dư âm, `main.tsx:192` mở `InsolvencyBanner`. Tuy nhiên nếu người chơi bấm nút "Đóng", banner biến mất. Do hàm `isEndTurnDisabled` chỉ kiểm tra cờ `isBankrupt` (chưa phá sản thì `isBankrupt = false`) mà không kiểm tra `balance < 0`, người chơi vẫn bấm được nút "Hết Lượt" bình thường để trốn tránh nghĩa vụ thanh lý tài sản hoặc tuyên bố phá sản.

---

### 2.3. CÁC LỖI MỨC ĐỘ P2 (SAI LỆCH LUẬT CHƠI, VI PHẠM VSC & RÒ RỈ BỘ NHỚ)

#### P2-01: Báo Đỏ 36 Lỗi 404 Console Do Cố Nạp Ảnh `.webp` Ảo
- **Tệp & Dòng mã vi phạm**: [`src/client/3d/board_tile.tsx:36-38, 64`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_tile.tsx#L36-L38), [`src/client/assets/tile_assets.ts:20, 33-42`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/assets/tile_assets.ts#L20).
- **Bằng chứng mã nguồn**:
  Code gọi `new Image()` tới `/assets/tiles/tile_${cellIndex}.webp`. Thư mục `public/assets/tiles/` hoàn toàn không tồn tại trên ổ cứng. Ngoài ra, `tile_assets.ts` còn định nghĩa 112 URLs nạp trước ảo (`tile_${paddedId}_lvl${level}.webp`).
- **Hậu quả thực tế**:
  Console trình duyệt báo đỏ rực 36 lỗi `404 Not Found` trên mỗi lượt tải trang, làm chậm thời gian dựng hình ban đầu. Trong khi đó, hệ thống đã có sẵn bộ sinh texture vector Canvas cực đẹp trong `tile_icons.ts` và `tile_texture_generator.ts`.

---

#### P2-02: Tiếp Đất Đất Đối Thủ Không Bị Trừ Tiền & Thưởng GO Bị Nhân Đôi (+4.000 Tr.)
- **Tệp & Dòng mã vi phạm**: [`src/client/main.tsx:134-188`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/main.tsx#L134-L188), [`src/client/main.tsx:210-231`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/main.tsx#L210-L231).
- **Bằng chứng mã nguồn**:
  1. Tại `main.tsx:136-143`: Khi người chơi đáp vào đất của đối thủ, code chỉ gọi `addFloatingText({ text: '-500 Tr.' })` mà **hoàn toàn không gọi `updatePlayerInfo` để trừ số dư của người chơi, cũng không cộng tiền cho chủ đất**. Tiền thuê thực tế bị triệt tiêu về 0!
  2. Tại `main.tsx:175-188` & `218-231`: Khi người chơi đáp trúng đích Ô 00 (GO), code vừa kích hoạt thưởng vượt qua GO (+2.000 Tr.) vừa kích hoạt tiếp đất Ô GO (+2.000 Tr.), khiến người chơi được cộng kép +4.000 Tr. sai luật cờ tỷ phú.

---

#### P2-03: Vi Phạm Nguyên Tắc Toàn Vẹn Lát Cắt Dọc (Vertical Slice Completeness - VSC)
- **Tệp & Dòng mã vi phạm**: [`src/server/session_manager.ts:29-36`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts#L29-L36), [`src/client/network/apply_delta.ts:111-150`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta.ts#L111-L150), [`src/client/store/game_store.ts:17-29`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store.ts#L17-L29).
- **Bằng chứng mã nguồn**:
  Trong `PlayerHudInfo` của client có khai báo thuộc tính `inAudit?: boolean`. Tuy nhiên trong `PlayerDelta` của server:
  ```typescript
  export interface PlayerDelta {
    readonly id: string;
    readonly position: number;
    readonly balance: number;
    readonly bankrupt?: boolean;
    readonly isBot?: boolean;
    readonly overdraftRoundsLeft?: number;
    // THIẾU inAudit, auditTurnsLeft, consecutiveDoubles, skipNextTurn!
  }
  ```
- **Hậu quả thực tế**:
  Khi Server phạt người chơi vào Trạm Kiểm Toán (`player.auditTurnsLeft = 3`), thông tin này bị rớt lại trên Server, không được đóng gói vào `PlayerDelta`, khiến HUD giao diện Client không thể hiển thị trạng thái bị tạm giam/kiểm toán.

---

#### P2-04: Đóng Modal HOSE Ngay Lập Tức, Không Hiển Thị Kết Quả Thắng / Thua
- **Tệp & Dòng mã vi phạm**: [`src/client/ui/modals/modal_host.tsx:171-175`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/modal_host.tsx#L171-L175).
- **Bằng chứng mã nguồn**:
  ```typescript
  // src/client/ui/modals/modal_host.tsx:171-175
  onInvest={(stake) => {
    AudioEngine.playSfx(SoundEffect.DICE_ROLL);
    onIntent?.({ type: 'INTENT_INVEST', stake: stake ?? 500 });
    closeModal(); // ĐÓNG MODAL NGAY LẬP TỨC!
  }}
  ```
- **Hậu quả thực tế**:
  `HoseModal` có sẵn các props `lastDiceRoll` và `lastPayout` để hiển thị điểm xúc xắc và số tiền thắng/thua. Tuy nhiên việc gọi `closeModal()` đồng bộ ngay khi bấm nút khiến modal biến mất lập tức, người chơi không thể quan sát được kết quả đầu tư chứng khoán HOSE.

---

## 3. MA TRẬN ĐỐI CHIẾU INTENT & SỰ KIỆN

Bảng đối soát chu trình 3 chặng của 12 Intent nghiệp vụ:
`[Giao Diện UI phát ra] ──► [WebSocket chuyển đi] ──► [Server tiếp nhận & xử lý]`

| STT | Mã Intent | Giao diện UI (Trigger) | Client WS (`use_game_ws`) | Server Xử lý (`intent_dispatcher`) | Đồng bộ Delta (`apply_delta`) | Tình trạng kiểm toán kỹ thuật |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| **1** | `INTENT_ROLL` | Có (Nút "Đổ Xúc Xắc") | Có | Có (`handleRollDice`) | **LỖI**: Delta thiếu xúc xắc; Client tự tung `Math.random()` | **P0: Desync toàn diện** |
| **2** | `INTENT_BUY_PROPERTY` | Có (Nút "Mua BĐS") | Có | Có (`handleBuyProperty`) | Có (`applyDeltaToStore` cells) | **P0: Bị từ chối ROOM_NOT_FOUND** |
| **3** | `INTENT_AUCTION_PASS` | Có (Trong `AuctionModal`) | Có | Có (`handleAuctionPass`) | **LỖI**: Delta thiếu trạng thái Đấu giá | **P1: Modal Đấu giá không bao giờ mở** |
| **4** | `INTENT_BID` | Có (Trong `AuctionModal`) | Có | Có (`handleAuctionBid`) | **LỖI**: Delta thiếu trạng thái Đấu giá | **P1: Modal Đấu giá không bao giờ mở** |
| **5** | `INTENT_MORTGAGE` | Có (Nút "Thế Chấp") | Có | Có (`mortgageProperty`) | Có (`cell.isMortgaged: true`) | **P0: Bị từ chối ROOM_NOT_FOUND** |
| **6** | `INTENT_REDEEM` | Có (Nút "Giải Chấp") | Có | Có (`redeemProperty`) | Có (`cell.isMortgaged: false`) | **P0: Bị từ chối ROOM_NOT_FOUND** |
| **7** | `INTENT_UPGRADE` | **KHÔNG** (Nút Xây Dựng mở sai) | **KHÔNG GỬI** | Có (`handleUpgrade`) | Có (`cell.level` mapping) | **P1: Đứt dây từ UI Client** |
| **8** | `INTENT_DOWNGRADE` | **KHÔNG** (Không có nút bấm) | **KHÔNG GỬI** | Có (`handleDowngrade`) | Có (`cell.level` mapping) | **P1: Đứt dây từ UI Client** |
| **9** | `INTENT_TRADE_OFFER` | Có (Nút "Gửi Đề Nghị") | Có | Có (`executeP2PTrade`) | Có (`cell.ownerId` transfer) | **P1: Cắt xén dữ liệu & Thiếu Handshake** |
| **10**| `INTENT_BANKRUPTCY` | Có (Nút "Tuyên Bố Phá Sản")| Có | Có (`declareBankruptcy`) | Có (`player.bankrupt: true`) | Hoạt động được nếu có kết nối Server |
| **11**| `INTENT_INVEST` | Có (Nút "Đầu Tư HOSE") | Có | Có (`handleHoseInvest`) | **LỖI**: Không trả về kết quả thắng/thua | **P2: Modal đóng ngay tức khắc** |
| **12**| `INTENT_END_TURN` | Có (Nút "Hết Lượt") | Có | Có (`executeTurnEnd`) | **LỖI**: Delta thiếu lượt người kế tiếp | **P0: Freeze bàn cờ khi gặp Bot** |

---

## 4. DANH SÁCH TÀI NGUYÊN 404 HOẶC THIẾU HỤT

### 4.1. Thư mục ảnh Standee 2.5D: `public/assets/tiles/` (THIẾU 36 FILES)
Trình duyệt gọi từ [`src/client/3d/board_tile.tsx:37`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_tile.tsx#L37):
Gây ra **đúng 36 lỗi 404 đỏ rực Console** trên mỗi lượt tải bàn cờ:
- Ô 01: `/assets/tiles/tile_1.webp` (Cần Thơ) - 404 Not Found
- Ô 02: `/assets/tiles/tile_2.webp` (Phiếu Thị Trường) - 404 Not Found
- Ô 03: `/assets/tiles/tile_3.webp` (An Giang) - 404 Not Found
- Ô 04: `/assets/tiles/tile_4.webp` (Lệ Phí Đăng Ký Đất Đai) - 404 Not Found
- Ô 05: `/assets/tiles/tile_5.webp` (Cảng HKQT Long Thành) - 404 Not Found
- Ô 06: `/assets/tiles/tile_6.webp` (Bình Dương) - 404 Not Found
- Ô 07: `/assets/tiles/tile_7.webp` (Phiếu Cơ Hội) - 404 Not Found
- Ô 08: `/assets/tiles/tile_8.webp` (Đồng Nai) - 404 Not Found
- Ô 09: `/assets/tiles/tile_9.webp` (Bà Rịa - Vũng Tàu) - 404 Not Found
- Ô 11: `/assets/tiles/tile_11.webp` (Bình Thuận) - 404 Not Found
- Ô 12: `/assets/tiles/tile_12.webp` (EVN) - 404 Not Found
- Ô 13: `/assets/tiles/tile_13.webp` (Lâm Đồng) - 404 Not Found
- Ô 14: `/assets/tiles/tile_14.webp` (Khánh Hòa) - 404 Not Found
- Ô 15: `/assets/tiles/tile_15.webp` (Cảng Cái Mép) - 404 Not Found
- Ô 16: `/assets/tiles/tile_16.webp` (Bình Định) - 404 Not Found
- Ô 17: `/assets/tiles/tile_17.webp` (Phiếu Thị Trường) - 404 Not Found
- Ô 18: `/assets/tiles/tile_18.webp` (Thừa Thiên Huế) - 404 Not Found
- Ô 19: `/assets/tiles/tile_19.webp` (Đà Nẵng) - 404 Not Found
- Ô 21: `/assets/tiles/tile_21.webp` (Thanh Hóa) - 404 Not Found
- Ô 22: `/assets/tiles/tile_22.webp` (Phiếu Cơ Hội) - 404 Not Found
- Ô 23: `/assets/tiles/tile_23.webp` (Nghệ An) - 404 Not Found
- Ô 24: `/assets/tiles/tile_24.webp` (Ninh Bình) - 404 Not Found
- Ô 25: `/assets/tiles/tile_25.webp` (Cao Tốc Bắc - Nam) - 404 Not Found
- Ô 26: `/assets/tiles/tile_26.webp` (Hải Phòng) - 404 Not Found
- Ô 27: `/assets/tiles/tile_27.webp` (Kiên Giang) - 404 Not Found
- Ô 28: `/assets/tiles/tile_28.webp` (Viettel) - 404 Not Found
- Ô 29: `/assets/tiles/tile_29.webp` (Quảng Ninh) - 404 Not Found
- Ô 31: `/assets/tiles/tile_31.webp` (Hưng Yên) - 404 Not Found
- Ô 32: `/assets/tiles/tile_32.webp` (Hà Nội - Cầu Giấy) - 404 Not Found
- Ô 33: `/assets/tiles/tile_33.webp` (Phiếu Thị Trường) - 404 Not Found
- Ô 34: `/assets/tiles/tile_34.webp` (Hà Nội - Hoàn Kiếm) - 404 Not Found
- Ô 35: `/assets/tiles/tile_35.webp` (Cảng HKQT Nội Bài) - 404 Not Found
- Ô 36: `/assets/tiles/tile_36.webp` (Phiếu Cơ Hội) - 404 Not Found
- Ô 37: `/assets/tiles/tile_37.webp` (TP.HCM - Thủ Đức) - 404 Not Found
- Ô 38: `/assets/tiles/tile_38.webp` (HOSE) - 404 Not Found
- Ô 39: `/assets/tiles/tile_39.webp` (TP.HCM - Quận 1) - 404 Not Found

### 4.2. Danh sách ảnh nạp trước ảo từ `tile_assets.ts` (112 URLs THIẾU)
Tệp [`src/client/assets/tile_assets.ts:20`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/assets/tile_assets.ts#L20) định nghĩa 112 URLs dạng `/assets/tiles/tile_${paddedId}_lvl${level}.webp` (28 ô mua x 4 cấp C0–C3). Toàn bộ 112 tệp này đều chưa hề tồn tại trong thư mục `public/`.

### 4.3. Kiểm toán tệp Âm thanh (Audio Assets)
Thư mục `public/assets/audio/` đã có đủ **13/13 tệp mp3** hợp lệ, không phát sinh lỗi 404:
- 4 tracks BGM: `bgm_tay_nam_bo.mp3`, `bgm_duyen_hai_mien_trung.mp3`, `bgm_bac_trung_bo.mp3`, `bgm_do_thi_loi.mp3`.
- 9 tracks SFX: `sfx_dice_roll.mp3`, `sfx_pawn_step.mp3`, `sfx_buy_property.mp3`, `sfx_upgrade_c3.mp3`, `sfx_auction_bid.mp3`, `sfx_trade_success.mp3`, `sfx_card_draw.mp3`, `sfx_bankrupt.mp3`, `sfx_tax_penalty.mp3`.

---

## 5. KẾT LUẬN & ĐỀ XUẤT LỘ TRÌNH SỬA CHỮA (4 GÓI CÔNG VIỆC)

### GÓI 1: BẮT TAY MẠNG & KHÔI PHỤC VÒNG ĐỜI PHÒNG (ƯU TIÊN CAO NHẤT — P0)
1. **Tự động gửi gói tin Handshake**:
   - Khi socket mở (`onopen`), nếu là Host thì gửi `CREATE_ROOM`, nếu là Guest (có URL `?room=...`) thì gửi `JOIN_ROOM`.
   - Lưu trữ `reconnectToken` ngay khi nhận `SESSION_INIT`.
2. **Khai báo & Đấu nối tin nhắn `START_GAME`**:
   - Thêm `type: 'START_GAME'` vào union `WsClientMessage` ([`network_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/network_types.ts)) và cập nhật `VALID_CLIENT_TYPES` trong [`envelope_validator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/security/envelope_validator.ts).
   - Khi Host bấm "Bắt Đầu Trận Đấu" tại Sảnh, gửi `START_GAME` lên Server. Server gọi `roomManager.startGame(roomCode)` và broadcast tín hiệu vào trận cho toàn bộ Client.
3. **Chấm dứt việc nuốt lỗi & Loại bỏ xúc xắc "ma"**:
   - Truyền callback `onError` vào `useGameWs` trong `main.tsx`, hiển thị Toast cảnh báo khi bị reject.
   - Loại bỏ hoàn toàn `Math.random()` trong `main.tsx:199-200`; xúc xắc và vị trí mới phải hoàn toàn nhận từ `STATE_DELTA` của Server.

---

### GÓI 2: ĐIỀU PHỐI BOT AI & KHẮC PHỤC VÒNG ĐỜI TIMER (ƯU TIÊN CAO NHẤT — P0)
1. **Thiết lập Bộ kích hoạt Bot tự động (Auto Bot Trigger)**:
   - Trong `wss_server.ts` sau khi kết thúc một lượt chơi: Nếu người chơi kế tiếp là Bot (`isBot === true`), Server tự động gọi `rooms.runBotTurn(roomCode)` (trễ 800ms để tạo nhịp tự nhiên).
   - Sửa vòng lặp `while` trong `runBotTurn` ([`room_manager.ts:272`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts#L272)) để tiếp tục xử lý chuỗi nhiều Bot liên tiếp (`Bot 1 -> Bot 2`) cho đến khi chuyển sang người thật.
2. **Sửa lỗi Lifecycle Timer trong `main.tsx`**:
   - Tách riêng việc quản lý `setInterval` đếm ngược 60s ra khỏi `useEffect` khởi tạo game để không bị `clearInterval` vô cớ khi đổi lượt.
3. **Khóa kiểm soát lượt đổ xúc xắc (Turn Lock Integrity)**:
   - Bổ sung cờ `hasRolledThisTurn: boolean` vào `game_store.ts`.
   - Vô hiệu hóa nút "Đổ Xúc Xắc" ngay sau khi đã đổ; cấm bấm "Hết Lượt" nếu chưa đổ xúc xắc.

---

### GÓI 3: DỌN DẸP 3D CANVASES & SỬA LỖI MODAL (ƯU TIÊN P1)
1. **Gỡ bỏ 36 tấm biển trắng che khuất bàn cờ**:
   - Trong `board_tile.tsx`: Loại bỏ tấm `<meshBasicMaterial color="#FFFFFF" />` của `StandeeBillboard`. Chuyển sang dùng trực tiếp Procedural Vector Texture của `tile_icons.ts`.
2. **Triệt tiêu 36 lỗi 404 Console**:
   - Vô hiệu hóa hàm tải ảnh `.webp` không tồn tại trong `loadStandeeWebp`.
3. **Khắc phục Modal Sổ Đỏ (`title_deed_modal.tsx`)**:
   - Thêm `max-h-[85vh] overflow-y-auto` vào container modal để không bao giờ bị cắt cụt nút bấm trên mọi kích thước màn hình.
   - Bố trí lại vị trí nút đóng `✕` để không bị tiêu đề dài đè lên.

---

### GÓI 4: ĐẤU NỐI CÁC INTENT CÒN THIẾU & BẢO ĐẢM TOÀN VẸN VSC (ƯU TIÊN P1/P2)
1. **Đấu nối `INTENT_DECLINE` & Kích hoạt `AuctionModal`**:
   - Nút "Bỏ Qua" mua đất gửi `INTENT_DECLINE` lên Server.
   - Bổ sung thông tin phiên đấu giá vào `DeltaPayload` để Client tự động mở `AuctionModal`.
2. **Thêm nút Nâng Cấp / Hạ Cấp vào Modal Sổ Đỏ**:
   - Cho phép người chơi phát `INTENT_UPGRADE` và `INTENT_DOWNGRADE`.
3. **Chuẩn hóa Giao dịch P2P (Handshake)**:
   - Chuyển `executeP2PTrade` thành luồng 2 bước: Người bán gửi đề nghị -> Người mua nhận thông báo và bấm Chấp thuận/Từ chối.
4. **Bảo đảm tính toàn vẹn lát cắt dọc (Vertical Slice Completeness)**:
   - Bổ sung `inAudit`, `auditTurnsLeft`, `skipNextTurn` vào `PlayerDelta` và ánh xạ đầy đủ trong `apply_delta.ts`.
5. **Chuẩn hóa Router Ô Tiếp Đất (`handleCellLanding`)**:
   - Xóa bỏ logic giả lập cục bộ `-500 Tr.` và thưởng kép Ô GO; để Server tính toán quyền uy và đồng bộ qua `STATE_DELTA`.

---

## 6. REMAINING QUESTIONS & GAPS (CÁC KHOẢNG TRỐNG CẦN LÀM RÕ TIẾP THEO)

1. **Phương án Đồng Bộ Sảnh Chờ (Lobby Sync Protocol)**:
   - *Phát hiện*: Mặc dù Slice NET-02 đã sign-off trên giấy tờ, thực tế Client và Server chưa hề có giao thức đồng bộ danh sách người chơi trong sảnh chờ.
   - *Câu hỏi còn lại*: Server sẽ định nghĩa gói tin `LOBBY_STATE` đẩy định kỳ hay mỗi khi có người vào/ra sảnh? Cần thiết kế cấu trúc DTO cho `LOBBY_STATE` bao gồm: danh sách slots (tên, avatar, màu cờ, isReady, isBot, botPersonality).
2. **Cơ Chế Trả Kết QuẢ Của Sàn Chứng Khoán HOSE**:
   - *Phát hiện*: `handleHoseInvest` tại [`src/server/hose_actions.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/hose_actions.ts) có tính toán lãi/lỗ theo điểm xúc xắc, nhưng Server chỉ phát delta số dư mà không phát thông điệp chi tiết kết quả quay (`HOSE_RESULT`).
   - *Câu hỏi còn lại*: Cần bổ sung kiểu tin nhắn `HOSE_RESULT` trong `WsServerMessage` để Client hiển thị animation xúc xắc và bảng tổng kết lãi/lỗ trên `HoseModal` trước khi đóng.
3. **Quy Trình Handshake Xác Nhận Đôi Bên Của Giao Dịch P2P (P2P Trade Protocol)**:
   - *Phát hiện*: Server hiện tại (`executeP2PTrade`) trừ tiền người mua ngay lập tức mà không hỏi ý kiến người mua.
   - *Câu hỏi còn lại*: Cần thiết kế thêm 2 Intent: `INTENT_TRADE_ACCEPT` và `INTENT_TRADE_REJECT`, đồng thời lưu trữ phiên giao dịch tạm thời (`tradeSession`) trên Server tương tự như `auctionSession`.
4. **Tập Trung Ưu Tiên Tiếp Theo Của Đội Ngũ Phát Triển**:
   - Bước đi đầu tiên bắt buộc phải là **Gói 1** (Khôi phục bắt tay mạng `CREATE_ROOM` / `JOIN_ROOM` / `START_GAME`), vì nếu không có phòng đấu thật trên Server, mọi nỗ lực sửa chữa FSM hay đồ họa ở các gói sau đều không thể kiểm chứng được qua runtime.
