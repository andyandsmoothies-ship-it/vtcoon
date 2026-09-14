# Kế Hoạch Cải Tiến IMP-53: Nâng Cấp Thẩm Mỹ Cầu Sa Bàn Ba Son / Long Biên & Triệt Tiêu Hoạt Cảnh Xúc Xắc Nhảy Nhịp Đôi

## 1. BỐI CẢNH & PHÂN TÍCH LỖI VẬT LÝ

### 1.1. Vấn đề 1: Chiếc cầu thiết kế quá sơ sài (Cầu Ba Son & Cầu Long Biên)
- **Hiện tượng**:
  * Tại vị trí Z = -3.8, Cầu Ba Son (Thủ Thiêm 2) có dây văng tính toán bằng công thức góc phẳng sai lệch (`Math.atan2(0.8, cx - (-0.8)) - Math.PI / 2`), khiến các dây văng lơ lửng giữa trời, không chạm vào đỉnh tháp và đâm xiên qua mặt đường nhựa xuống lòng sông.
  * Tháp cầu chỉ là một khối hộp trần trụi (`boxGeometry args={[0.12, 0.95, 0.16]}`) nghiêng góc, thiếu bệ trụ đỡ trong lòng sông và thiếu đỉnh tháp điêu khắc biểu tượng.
  * Hai đầu cầu tại X = +-2.7 bị cắt ngang đột ngột, lơ lửng trên mặt nước thiếu mố cầu bê tông (abutments) và dốc chuyển tiếp vào bờ đại lộ.
- **Giải pháp**:
  * Thiết kế tháp Ba Son điêu khắc với bệ trụ bê tông vững chãi trong lòng kênh và cổ neo cáp mạ vàng đồng tại đỉnh.
  * Tính toán vector không gian 3D chính xác cho từng sợi cáp: Chiều dài khoảng cách Euclid L = ||P_deck - P_anchor||, tâm đặt tại trung điểm, góc xoay quaternion từ vector đơn vị (0, 1, 0) hướng thẳng vào P_deck - P_anchor.
  * Bổ sung 2 khối mố cầu bê tông vát beveled tại bờ kênh X = -2.7 và X = +2.7 cùng lan can an toàn và gờ vỉa hè cho người đi bộ.

### 1.2. Vấn đề 2: Xúc xắc có animation nhảy thêm lần nữa khi quân cờ vừa chạm đất
- **Hiện tượng**:
  * Khi người chơi hoặc bot gieo xúc xắc, xúc xắc tung nảy xong (1.1s) và quân cờ bắt đầu di chuyển. Khi quân cờ vừa nhảy tới ô đích và chạm đất, xúc xắc bất ngờ kích hoạt lại hoạt cảnh nhảy tung lên không trung một lần nữa gây hiểu nhầm cho người chơi.
- **Nguyên nhân cốt lõi**:
  1. *Server Hyper-Pacing*: Trong `src/server/network/wss_server.ts`, `botTurnDelayMs` mặc định chỉ là 250ms. Khi một lượt kết thúc hoặc chuyển lượt, bot kế tiếp được kích hoạt chỉ sau 250ms trên server trong khi quân cờ trên client cần từ 1.5s - 2.5s để hoàn thành các bước nhảy. Delta lượt đổ của bot kế tiếp ập tới ngay khi quân cờ của người trước vừa chạm đất, kích hoạt `triggerDiceRoll` mới khiến xúc xắc nhảy tiếp.
  2. *useSpring Reset & Unmount*: Trong `dice_tray.tsx`, `SingleDie` sử dụng thuộc tính `reset: isRolling`. Mỗi khi component cha re-render (do `playerPositions` hoặc modal cập nhật khi chạm đất), nếu `isRolling` chưa dập tắt hoàn toàn hoặc bị mount/unmount qua `shouldShowTray`, spring sẽ bị reset về `from: { t: 0 }`, kích hoạt lại đường cong tung nảy lên độ cao y = 3.8.
  3. *Client Premature Roll Trigger*: Trong `main.tsx`, hàm `handleRollDice` gọi `store.setIsRolling(true)` ngay khi click chuột trước khi server trả về kết quả delta, dẫn đến chu kỳ gieo bị kích hoạt hai lần liên tiếp (1 lần tại client và 1 lần khi nhận delta).
- **Giải pháp**:
  * Nâng `botTurnDelayMs` mặc định tại `src/server/network/wss_server.ts` và `src/server/index.ts` lên 1500ms để nhịp điệu diễn hoạt bot nhịp nhàng, đồng bộ hoàn hảo với thời gian di chuyển của quân cờ.
  * Chuẩn hóa `SingleDie`: Lưu trữ `lastAnimatedSeqRef`. Chỉ kích hoạt hoạt ảnh gieo xúc xắc khi có lượt gieo mới thực sự (`diceSeq > lastAnimatedSeqRef.current`). Khóa chặt giá trị t = 1.0 (cao độ nghỉ y = 0.26) khi không trong trạng thái gieo.
  * Giữ sàn diễn xúc xắc và 2 khối xúc xắc ruby hiện diện ổn định trên sông Sài Gòn, triệt tiêu unmount đột ngột gây giật khung hình.

---

## 2. KẾ HOẠCH BẢO ĐẢM THEO QUY TRÌNH 3 TRẠM (MANDATORY 3-STATION PIPELINE)

- **Trạm 1: RED Contract Test (`qa-tester`)**
  * Tệp kiểm thử: `tests/contracts/bridge_craft_and_dice_settle_contract.test.ts`
  * Tuân thủ 4 Facet:
    - *Facet 1 (Boundary & Geometric Anchoring)*: Kiểm tra tọa độ neo dây văng Ba Son kết nối chuẩn xác với cổ tháp (khoảng cách vector sai số < 0.01m), 2 mố cầu bờ sông tồn tại tại X = +-2.7.
    - *Facet 2 (State Reactivity & Settle Stability)*: Khi quân cờ chạm đất (`completePawnMove`) hoặc mở modal ô đất, xúc xắc không được re-trigger nhảy lần 2 trong cùng một `diceSeq`.
    - *Facet 3 (Vibrancy & Resting Elevation)*: Khi ở trạng thái tĩnh, cao độ xúc xắc giữ bất biến tại y = 0.26.
    - *Facet 4 (Server Bot Turn Pacing Invariant)*: `botTurnDelayMs` tại WSS Server mặc định >= 1500ms.
  * Chạy test và chứng minh RED.

- **Trạm 2: GREEN Implementation (`implementer`)**
  * Sửa `src/client/3d/diorama/diorama_bridges.tsx` với toán học dây văng chuẩn, tháp Ba Son điêu khắc và mố cầu 2 đầu bờ.
  * Sửa `src/client/3d/dice_tray.tsx` và `src/client/main.tsx` để ổn định vòng đời xúc xắc, triệt tiêu double roll trigger.
  * Sửa `src/server/network/wss_server.ts` để đặt `botTurnDelayMs: config.botTurnDelayMs ?? 1500`.
  * Chạy test contract đạt GREEN 100%.

- **Trạm 3: Independent Physical Disk Review**
  * Chạy `npm run gate:quick` (0 vi phạm UI lint, 0 lỗi TypeScript).
  * `spec-reviewer`, `code-reviewer`, `game-3d-visual-critic` kiểm định độc lập trên đĩa vật lý.
  * Ghi nhận bất biến mới vào `docs/domain/gotchas.md`.
