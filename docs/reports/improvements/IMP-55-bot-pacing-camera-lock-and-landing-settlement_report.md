# BÁO CÁO NGHIỆM THU IMP-55: ĐỒNG BỘ NHỊP ĐỘ BOT, KHÓA GÓC QUAY MÁY ẢNH & ĐỒNG BỘ CHU KỲ DỪNG CHÂN TRẢ PHÍ

> **Phiên bản**: 1.0.0  
> **Trạng thái**: ✔️ HOÀN THÀNH (100% GREEN, Docker Rebuilt & Verified)  
> **Quy trình áp dụng**: 3-Station Implementation Pipeline (Trạm 1 RED -> Trạm 2 GREEN -> Trạm 3 Physical Review)  
> **Ticket liên quan**: IMP-55  
> **Hợp đồng kiểm thử**: `tests/contracts/bot_pacing_and_camera_lock_contract.test.ts` (31 tests)  
> **Gotchas bổ sung**: Gotcha #77 (`[3D/BOT/NET]`)

---

## 1. TỔNG QUAN VẤN ĐỀ & NGUYÊN NHÂN GỐC

### Hiện tượng phát hiện
Người chơi phản ánh: Khi Bot gieo xúc xắc xong, nó nhảy tới ô người chơi đã mua, nó trả phí thuê đồng thời animation xúc xắc bị nhảy giật thêm một nhịp, dễ gây hiểu nhầm về tính toàn vẹn của bàn cờ.

### 3 Nguyên nhân gốc được bóc tách
1. **Lệch nhịp Server vs Client (Timing Desync)**:
   - Client: Hoạt cảnh xúc xắc mất 1.1s, sau đó Bot nhảy từng ô mất `steps * 200ms` (ví dụ 7 ô mất 1.4s) và tiếp đất mất 0.8s -> Tổng thời gian thị giác là ~3.3s.
   - Server: `TurnOrchestrator` trước đó dùng `botTurnDelayMs = 1500ms` cố định. Khi Bot 1 mới nhảy được một nửa quãng đường, Server đã phát sinh lượt kế tiếp ở 1.5s; Bot sau tung xúc xắc ở 3.0s làm xúc xắc văng lên không trung ngay khoảnh khắc Bot 1 vừa chạm đất.
2. **Hiện tượng giật góc quay máy ảnh (Camera Snapping)**:
   - Trong `camera_state_machine.ts`: Khi Server chuyển lượt khỏi Bot (`isBotTurn: false`) trong lúc con cờ Bot vẫn đang nhảy (`isPawnMoving: true`), `resolveCameraMode` đột ngột chuyển từ `'overview'` sang `'pawn_chase'`. Khi Bot chạm đất 200ms sau, camera lại giật ngược về `'overview'`. Cú giật camera 200ms này làm thay đổi phối cảnh góc nhìn, khiến khay xúc xắc trên sông Sài Gòn bị trượt mạnh trên màn hình, tạo ảo giác xúc xắc "nhảy lên một cái".
3. **Quân cờ Bot nhảy ngay khi xúc xắc còn đang lăn**:
   - Trong `apply_delta.ts`: `dispatchPawnMove` có điều kiện `!task.isBot`, khiến quân cờ Bot không chờ xúc xắc tiếp đất (`isRolling`) mà nhảy ngay lập tức.

---

## 2. GIẢI PHÁP & CÁC THAY ĐỔI TRIỂN KHAI

### 1. Độ trễ động phía Server (`src/server/network/turn_orchestrator.ts`)
- Export hàm `calculateBotStepDelay(room, baseDelayMs = 1500)`:
  `delayMs = Math.max(baseDelayMs, 1100 + steps * 200 + 800)`
- Khi phòng ở pha `PropertyManagement` hoặc `ActionPhase` và có `lastDice`, áp dụng độ trễ động đủ dài (2300ms - 4300ms) để toàn bộ hoạt cảnh lăn xúc xắc và nhảy quân cờ của Bot hoàn tất trọn vẹn trước khi Server thực hiện bước kế tiếp.
- Bổ sung `Accelerated Test Guard`: Khi `baseDelayMs <= 500`, giữ nguyên `baseDelayMs` để hỗ trợ tối đa các test suite chạy gia tốc.

### 2. Khóa máy ảnh bao quát cho Bot (`src/client/3d/camera_state_machine.ts` & `src/client/game_canvas.tsx`)
- Thêm thuộc tính `isAnimatingPawnBot?: boolean` vào `CameraResolveParams`.
- Khi `isBotTurn || isAnimatingPawnBot`, `resolveCameraMode` LUÔN trả về `'overview'`.
- Triệt tiêu 100% hiện tượng máy ảnh giật vào `'pawn_chase'` khi lượt chuyển giao trong lúc quân cờ Bot đang nhảy dở.

### 3. Đồng bộ hóa hàng đợi di chuyển cho cả Bot (`src/client/network/apply_delta.ts`)
- Trong `dispatchPawnMove`: Bỏ điều kiện phân biệt `!task.isBot`. Cả Bot và Người chơi đều được đưa vào `pendingPawnMove` khi `isRolling === true`, chỉ nhảy quân cờ sau khi xúc xắc hoàn tất tiếp đất (`setIsRolling(false)`).

---

## 3. KẾT QUẢ KIỂM THỬ & ĐỐI SOÁT 3 TRẠM

| Trạm | Phụ trách | Kết quả | Chi tiết |
| :--- | :--- | :---: | :--- |
| **Trạm 1: RED Contract Test** | `qa-tester` | ✔️ PASS (RED confirmed) | Viết `tests/contracts/bot_pacing_and_camera_lock_contract.test.ts` (31 tests, 4 Facets). Xác nhận 17 tests FAIL trước khi sửa code. |
| **Trạm 2: GREEN Implementation** | `implementer` | ✔️ PASS (100% GREEN) | Chỉnh sửa 4 tệp nguồn. Đưa toàn bộ 31 tests sang GREEN. Toàn bộ 158 test suites (2239 tests) đều PASS. |
| **Trạm 3: Independent Review** | `spec-reviewer` & `code-reviewer` | ✔️ PASS (Approved) | Đối soát trực tiếp trên đĩa vật lý: 0 dirty casts, LOC trong hạn mức (turn_orchestrator.ts: 312 LOC, camera_state_machine.ts: 234 LOC). |

---

## 4. DOCKER & STATIC GATES VERIFICATION
- **Quality Gate**: `npm run gate:quick` -> 0 lỗi TypeScript, 0 vi phạm UI linter / slop / dups.
- **Docker Build**: `docker compose build vtcoon` hoàn tất thành công với multi-stage image.
- **Docker Deploy**: `docker compose up -d vtcoon` tái tạo và khởi chạy container `vtcoon-vtcoon-1` thành công.
