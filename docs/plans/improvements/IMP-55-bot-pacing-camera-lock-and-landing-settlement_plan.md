# KẾ HOẠCH TRIỂN KHAI IMP-55: ĐỒNG BỘ NHỊP ĐỘ BOT, KHÓA GÓC QUAY MÁY ẢNH & CHU KỲ DỪNG CHÂN TRẢ PHÍ

## 1. Bối Cảnh & Vấn Đề Gốc
Người chơi phát hiện: Khi Bot gieo xúc xắc xong, quân cờ nhảy tới ô đất người chơi đã sở hữu, Bot nộp tiền thuê đồng thời xúc xắc bị "nhảy giật thêm một nhịp" gây hiểu nhầm nghiêm trọng về tính toàn vẹn của lượt chơi.

### 3 Nguyên Nhân Gốc (Root Causes)
1. **Lệch Nhịp Thời Gian Server vs Client (Timing Desync & Premature Turn Handover)**:
   - Trên Client: Hoạt cảnh xúc xắc mất 1.1s. Sau đó quân cờ Bot nhảy từng bước qua các ô với t = steps * 200ms (ví dụ 7 ô = 1.4s) + thời gian tiếp đất chấn động 0.8s -> Tổng thời gian cần thiết = 1.1s + 1.4s + 0.8s = 3.3s.
   - Trên Server: TurnOrchestrator chỉ áp dụng độ trễ cố định botTurnDelayMs = 1500ms. Ngay khi Bot vừa nhảy được một nửa quãng đường, Server đã phát Delta tiếp theo (chuyển sang TurnPhase.PropertyManagement hoặc INTENT_END_TURN), dẫn tới Bot tiếp theo gieo xúc xắc ở t = 3.0s làm xúc xắc 3D bật tung lên không trung ngay khoảnh khắc Bot 1 vừa chạm đất!
2. **Hiện Tượng Giật Góc Quay Máy Ảnh (Camera Mode Snapping)**:
   - Trong camera_state_machine.ts và game_canvas.tsx: Khi Server chuyển lượt khỏi Bot (isBotTurn trở thành false) trong khi quân cờ Bot vẫn đang nhảy (isPawnMoving: true), resolveCameraMode đột ngột chuyển từ 'overview' sang 'pawn_chase'.
   - Ngay khi Bot chạm đất (200ms sau), isPawnMoving trở về false, máy ảnh lại giật ngược về 'overview'.
   - Cú giật máy ảnh 200ms này làm thay đổi phối cảnh góc nhìn, khiến sàn diễn khay nỉ và xúc xắc ở trung tâm sông Sài Gòn bị trượt mạnh trên màn hình, tạo ảo giác xúc xắc "nhảy lên một cái".
3. **Quân Cờ Bot Nhảy Ngay Khi Xúc Xắc Còn Đang Lăn**:
   - Trong apply_delta.ts: dispatchPawnMove có điều kiện if (isRolling && state.setPendingPawnMove && !task.isBot).
   - Điều kiện !task.isBot khiến quân cờ Bot không chờ xúc xắc tiếp đất ở t = 1.1s mà nhảy ngay lập tức hoặc không được đồng bộ chặt chẽ với chu kỳ quay của khay xúc xắc.

---

## 2. Kiến Trúc & Thiết Kế Giải Pháp (Target Architecture)

```
[Server: stepBotTurn (INTENT_ROLL)]
       |
       v
[Broadcast Delta: dice=[4,3], seq=N, phase=PropertyManagement, players]
       |
       +-----------------------------------+
       | (Server-Side Dynamic Pacing)       | (Client-Side Visual Presentation)
       v                                   v
[calculateBotStepDelay(room)]       [DiceTray: Ruby Dice Rolls 1100ms]
= 1100ms (roll)                            | (Pending Pawn Move waits for onRest)
+ (7 * 200ms) (hop)                        v
+ 800ms (settle)                    [PawnAnimator: Bot hops smoothly 1400ms]
= 3300ms delay                             | (Camera locked to 'overview' via isAnimatingPawnBot)
       |                                   v
       |                            [Pawn Lands on Tile & Settles 800ms]
       |                                   | (Floating Text: Rent Paid)
       v                                   v
[Server Delay Expires at 3300ms]    [Visuals completely settled]
       |
       v
[Server: stepBotTurn (INTENT_END_TURN) or Human Turn]
```

### Các Trụ Cột Kỹ Thuật

#### Trụ Cột 1: Độ Trễ Bước Đi Động Phía Máy Chủ (calculateBotStepDelay)
- Tệp: src/server/network/turn_orchestrator.ts.
- Tính toán độ trễ bước tiếp theo dựa trên số ô quân cờ phải di chuyển:
  delayMs = max(baseDelayMs, 1100 + (steps * 200) + 800)
- Áp dụng khi phòng cờ đang ở pha PropertyManagement hoặc ActionPhase và có lastDice.
- Cho phép người chơi quan sát trọn vẹn cú nhảy và điểm tiếp đất của Bot trước khi Server thực hiện hành động tiếp theo.

#### Trụ Cột 2: Khóa Chặt Máy Ảnh Ở Phối Cảnh Bao Quát (isAnimatingPawnBot)
- Tệp: src/client/3d/camera_state_machine.ts và src/client/game_canvas.tsx.
- Thêm thuộc tính isAnimatingPawnBot?: boolean vào CameraResolveParams.
- Khi isBotTurn || isAnimatingPawnBot, resolveCameraMode LUÔN trả về 'overview'.
- Triệt tiêu hoàn toàn hiện tượng máy ảnh giật vào 'pawn_chase' khi lượt chơi chuyển giao trong lúc quân cờ Bot chưa hoàn tất bước nhảy.

#### Trụ Cột 3: Đồng Bộ Hoá Chu Trình Nhảy Của Bot Sau Khi Xúc Xắc Dừng
- Tệp: src/client/network/apply_delta.ts.
- Bỏ điều kiện phân biệt Bot !task.isBot trong dispatchPawnMove: Cả Bot và người chơi đều chờ xúc xắc tiếp đất (isRolling kết thúc) mới kích hoạt chu trình nhảy quân cờ.

---

## 3. Danh Sách Tệp Thay Đổi
1. src/server/network/turn_orchestrator.ts (Export calculateBotStepDelay, áp dụng dynamic pacing trong scheduleBotStep).
2. src/client/3d/camera_state_machine.ts (Bổ sung isAnimatingPawnBot, bảo vệ góc nhìn 'overview').
3. src/client/game_canvas.tsx (Truyền isAnimatingPawnBot từ activeAnimation.playerId vào resolveCameraMode).
4. src/client/network/apply_delta.ts (Đồng bộ dispatchPawnMove cho mọi người chơi khi xúc xắc đang quay).
5. tests/contracts/bot_pacing_and_camera_lock_contract.test.ts (Bộ kiểm thử hợp đồng mới >= 15 atomic tests, 4 Facets).

---

## 4. Kế Hoạch 3 Trạm & Kiểm Chứng
- Trạm 1: qa-tester viết contract test trong tests/contracts/bot_pacing_and_camera_lock_contract.test.ts và chứng minh RED.
- Trạm 2: implementer sửa mã nguồn trong src/** và đưa 100% tests sang GREEN.
- Trạm 3: spec-reviewer và code-reviewer kiểm tra độc lập trên đĩa vật lý.
- Rebuild: Rebuild Docker container, cập nhật docs/domain/gotchas.md (Gotcha #77) và docs/master_roadmap.md.
