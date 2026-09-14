# Báo Cáo Cải Tiến IMP-53: Nâng Cấp Thẩm Mỹ Cầu Sa Bàn Ba Son / Long Biên & Triệt Tiêu Hoạt Cảnh Xúc Xắc Nhảy Nhịp Đôi

## 1. TỔNG QUAN KẾT QUẢ TRIỂN KHAI
- **Mã Cải Tiến**: IMP-53
- **Chủ đề**: Nâng cấp thẩm mỹ mô hình 3D Cầu Ba Son (Thủ Thiêm 2), tính toán chuẩn xác hình học vector dây văng không gian 3D, mố cầu bê tông hai bên bờ kênh và triệt tiêu lỗi xúc xắc nhảy thêm nhịp đôi khi quân cờ chạm đất.
- **Trạng thái**: ĐÃ HOÀN TẤT & ĐƯỢC PHÊ DUYỆT (100% 3 TRẠM PASS, DISPOSITION: SHIP).

---

## 2. CHI TIẾT CẢI TIẾN THEO 4 TRỤ CỘT

### Trụ cột 1: Thẩm Mỹ Cầu Ba Son & Hình Học Dây Văng Chuẩn Xác
- **Tệp nguồn**: `src/client/3d/diorama/diorama_bridges.tsx`
- **Thay đổi kỹ thuật**:
  1. *Toán học vector dây văng*: Xuất xưởng hàm `calculateCableTransform(pylonAnchor, deckAnchor)`:
     - Tính chiều dài Euclid chuẩn xác: $L = \|\vec{P}_{\text{deck}} - \vec{P}_{\text{pylon}}\|$.
     - Đặt tâm cylinder tại trung điểm: $\vec{P}_{\text{mid}} = \frac{\vec{P}_{\text{pylon}} + \vec{P}_{\text{deck}}}{2}$.
     - Định hướng góc xoay bằng `Quaternion.setFromUnitVectors(new Vector3(0, 1, 0), v)`.
     - Triệt tiêu 100% hiện tượng dây lơ lửng giữa trời hoặc cắm xuyên qua mặt đường xuống đáy kênh.
  2. *Tháp Ba Son điêu khắc*:
     - Bệ trụ bê tông bát giác vát côn (`cylinderGeometry args={[0.18, 0.22, 0.2, 8]}`) cắm sâu vào tầng đáy sông tại $Y = 0.0$.
     - Tháp nghiêng titan mạ bạc (`#F8FAFC`, metalness 0.6, roughness 0.25) nghiêng góc $\theta = -0.15\text{ rad}$ sang bờ Tây.
     - Cổ vòng neo cáp mạ vàng đồng (`#F59E0B`) tại $Y = 0.95$ và đỉnh chóp nón lục giác tại $Y = 1.02$.
  3. *Mố cầu bờ kênh (Abutments)*:
     - Bổ sung 2 khối mố cầu bê tông vững chắc tại $X = -2.7\text{m}$ (bờ Tây) và $X = +2.7\text{m}$ (bờ Đông) kết nối mặt cầu mượt mà vào bờ vịnh sa bàn.

### Trụ cột 2: Triệt Tiêu Hoạt Cảnh Xúc Xắc Nhảy Nhịp Đôi
- **Tệp nguồn**: `src/client/store/game_store.ts`, `src/client/3d/dice_tray.tsx`, `src/client/network/apply_delta.ts`
- **Thay đổi kỹ thuật**:
  1. *Khóa gieo xúc xắc đơn nhịp (Monotonic Dice Roll Trigger)*:
     - Trong `game_store.ts`, `triggerDiceRoll` kiểm tra `diceSeq <= lastDiceSeq` để bỏ qua kích hoạt nếu delta gửi lại diceSeq cũ.
  2. *Triệt tiêu useSpring Reset*:
     - Trong `dice_tray.tsx`, loại bỏ `reset: isRolling` vô điều kiện. Sử dụng `lastAnimatedSeqRef` chỉ kích hoạt khi thực sự có lượt gieo mới.
     - Khóa cứng cao độ nghỉ $y = 0.26$ và triệt tiêu góc xoay khi $t = 1.0$.
  3. *Duy trì hiện diện xúc xắc*:
     - Sàn diễn xúc xắc trên sông Sài Gòn luôn hiện diện trong render tree, xúc xắc ruby nằm nghỉ đĩnh đạc trên mặt thảm nỉ ngọc lục bảo.

### Trụ cột 3: Chuẩn Hóa Nhịp Độ Bot Phía Máy Chủ (Server Bot Turn Pacing)
- **Tệp nguồn**: `src/server/network/wss_server.ts`, `src/server/index.ts`
- **Thay đổi kỹ thuật**:
  1. Export `DEFAULT_BOT_TURN_DELAY_MS = 1500;` trong `src/server/index.ts`.
  2. Nâng `botTurnDelayMs` mặc định tại `src/server/network/wss_server.ts` từ `250ms` lên `1500ms`.
  3. Nhịp độ diễn hoạt của Bot đồng bộ hoàn hảo với thời gian di chuyển của quân cờ, triệt tiêu việc nổ lượt gieo mới dồn dập khi quân cờ người chơi vừa chạm đất.

---

## 3. KẾT QUẢ KIỂM THỬ & KIỂM ĐỊNH ĐỘC LẬP (3 TRẠM)

1. **Trạm 1 (RED Contract Test)**:
   - Tệp test: `tests/contracts/bridge_craft_and_dice_settle_contract.test.ts`
   - Đạt chứng minh Business RED (18 failed | 14 passed ban đầu).
2. **Trạm 2 (GREEN Implementation)**:
   - Đạt 32/32 tests contract PASS 100%.
   - Đạt 155/155 test suites toàn dự án (2165/2165 tests) PASS 100%.
   - `npm run gate:quick`: 0 lỗi TypeScript, 0 vi phạm UI/Asset lint.
3. **Trạm 3 (Independent Physical Disk Review)**:
   - `spec-reviewer`: Phê duyệt PASS (100% khớp đặc tả, 0 scope drift).
   - `code-reviewer`: Phê duyệt PASS (tuân thủ LOC limits, CC <= 4, zero dirty casts, zero silent errors).
   - `game-3d-visual-critic`: Phán quyết `disposition: ship` (Điểm 9.2/10, đạt chuẩn Toy Diorama Benchmark).

---

## 4. BẤT BIẾN KINH NGHIỆM ĐƯỢC GHI NHẬN
- **Gotcha #74** trong `docs/domain/gotchas.md`:
  * *[3D/RENDER]* Hình học dây văng phải luôn được định vị bằng vector 3D không gian (khoảng cách Euclid, tâm tại trung điểm, góc xoay quaternion trực giao).
  * *[NET/SYNC]* `botTurnDelayMs` phía server phải >= 1500ms để bảo toàn nhịp độ cờ client.
  * *[UI/CRAFT]* Thuộc tính `reset: boolean` trong `@react-spring` tuyệt đối không được gán vào cờ trạng thái re-render thường xuyên.
