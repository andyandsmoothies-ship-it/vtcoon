# BÁO CÁO NGHIỆM THU KỸ THUẬT: PHÂN NHỊP BOT AI & DI DỜI SÀN DIỄN XÚC XẮC 3D (IMP-51)

> **Mã cải tiến**: IMP-51  
> **Tên gói**: Bot AI Step Pacing, Centered River Dice Runway & Vibrant Ruby Dice Overhaul  
> **Trạng thái**: 🟢 **Hoàn Tất & Nghiệm Thu 100% (Production Ready)**  
> **Căn cứ kế hoạch**: [`docs/plans/improvements/IMP-51-bot-pacing-and-dice-runway-relocation_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-51-bot-pacing-and-dice-runway-relocation_plan.md)  
> **Ngày nghiệm thu**: 2026-09-14  

---

## 1. BỐI CẢNH & PHẢN HỒI NGƯỜI DÙNG

Trong quá trình trải nghiệm thực tế với chế độ 1 Người chơi + 2 Bot AI, người dùng phản ánh 2 vấn đề trọng tâm:
1. **Nhịp độ Bot AI quá nhanh và dồn dập (Bot Burst Overrun)**: Khi người chơi hết lượt, 2 Bot phía sau thực thi mọi thao tác (Gieo xúc xắc -> Di chuyển -> Mua/Từ chối -> Hết lượt) tức thì trong vòng ~1.6 giây. Người chơi cảm thấy giật cục, không theo dõi kịp diễn biến ván đấu. Ngoài ra, việc gộp lệnh Bot đã gây ra 7 cảnh báo đỏ `TREASURY_INVARIANT_VIOLATED` trên telemetry do danh tính người nhận tiền qua GO bị lệch sang người chơi kế tiếp.
2. **Sàn diễn xúc xắc 3D kẹt trên cầu và nhợt nhạt (Dice Runway & Vibrancy)**: Hai viên xúc xắc rơi đè lên thành Cầu Long Biên (Z = +3.8), màu sắc nhợt nhạt dưới ánh nắng nhiệt đới, các chấm pips quá nhỏ và khay nỉ xanh viền vàng chiếm cố định một góc đường ngay cả khi không có ai gieo xúc xắc.

---

## 2. KẾT QUẢ TRIỂN KHAI THEO 3 TRẠM (PIPELINE SUMMARY)

```
[Trạm 1: RED Contract Test] ➔ [Trạm 2: GREEN Implementation] ➔ [Trạm 3: Independent Review]
  • 22 Atomic Contract Tests     • 6 Production & Test Files      • spec-reviewer: PASS 🟢
  • 4 Facet Behavioral Matrix    • 0 TypeScript / UI Lint Bugs    • code-reviewer: PASS 🟢
  • Adversarial Inversion OK     • 153/153 Suites PASS 100%       • Physical Disk Verified
```

### A. Phân Nhịp Vi Bước Bot AI (`stepBotTurn` & `botTurnDelayMs`)
- **Tệp tin**: [`src/server/network/turn_orchestrator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/turn_orchestrator.ts), [`src/server/room_bot_coordinator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_bot_coordinator.ts), [`src/server/index.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/index.ts).
- **Cơ chế**:
  1. Chuyển đổi từ gọi gộp `this.rooms.runBotTurn(roomCode)` sang phân nhịp vi bước `this.rooms.stepBotTurn(roomCode)`:
     - **Nhịp 1**: Bot ở `WaitingRoll` chỉ gieo xúc xắc (`INTENT_ROLL`), FSM chuyển sang `ActionPhase`/`PropertyManagement`, lượt chơi vẫn thuộc về Bot.
     - **Nhịp 2**: Bot ở `ActionPhase` phân tích chiến lược mua hoặc từ chối, FSM chuyển sang `PropertyManagement`, Bot vẫn giữ lượt.
     - **Nhịp 3**: Bot ở `PropertyManagement` gửi `INTENT_END_TURN` để chuyển lượt sang người tiếp theo.
  2. Thiết lập độ trễ `botTurnDelayMs = 1500` (1.5 giây) cho môi trường production, mang lại cảm giác nhịp nhàng, thư thái chuẩn casual board game thương mại.
  3. Duy trì adapter tương thích ngược `BotTurnScheduler` và cấu hình test vi mô (100ms - 250ms) giúp toàn bộ 153 bộ test chạy thần tốc trong ~17 giây.

### B. Di Dời Sàn Diễn Xúc Xắc 3D Về Trung Tâm Sông Sài Gòn
- **Tệp tin**: [`src/client/3d/dice_tray.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/dice_tray.tsx), [`src/client/3d/camera_state_machine.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/camera_state_machine.ts).
- **Cơ chế**:
  1. **Tọa độ trung tâm**: Di dời từ Z = +3.8 (trên cầu) về tâm lòng sông Sài Gòn `[0.0, 0.020, 0.0]`. Khoảng cách an toàn tới 2 cây cầu đạt 3.8m (vượt xa yêu cầu >= 3.0m).
  2. **Kích thước & Màu sắc Ruby**: Khối xúc xắc phóng to lên `0.58 x 0.58 x 0.58m`, khoác màu đỏ Ruby sang trọng `#DC2626` với `roughness = 0.22`, `metalness = 0.10`, giữ nguyên độ đanh đặc tĩnh (`transparent = false`).
  3. **Pips sứ phản quang**: Bán kính chấm pips tăng lên `0.050m` (mặt Ách `0.065m`), màu trắng sứ `#FFFFFF` tích hợp phát quang nhẹ `emissive="#FFFFFF"` (`emissiveIntensity = 0.25`), hiển thị sắc nét dưới nắng gắt.
  4. **Transient Felt Tray (Khay nỉ động)**: Khối khay nỉ xanh `#064E3B` viền đồng `#F59E0B` chỉ hiển thị trong khi xúc xắc lăn (`isRolling = true`). Khi dừng tĩnh, khay nỉ tự động ẩn hoàn toàn, trả lại mặt nước trong xanh của sông Sài Gòn.

---

## 3. BẢNG ĐỐI SOÁT KIỂM THỬ HỢP ĐỒNG 4 FACETS

Toàn bộ 22 atomic tests trong [`tests/contracts/bot_pacing_and_dice_runway_contract.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/bot_pacing_and_dice_runway_contract.test.ts) đều đạt **PASS 100%**:

| Facet | Nội dung kiểm thử | Kết quả | Trạng thái |
| :--- | :--- | :---: | :---: |
| **Facet 1: Boundary & Coords** | Tâm sàn diễn [0, 0.02, 0], clearance >= 3m, camera target [0, 0.25, 0], size >= 0.55m, pips >= 0.048m | 5/5 passed | ✔️ PASS |
| **Facet 2: State Reactivity** | Khay nỉ ẩn khi không quay, hiện khi `isRolling=true`, xúc xắc mờ dần sau 1.5s | 4/4 passed | ✔️ PASS |
| **Facet 3: Vibrancy & Contrast** | Màu đỏ Ruby `#DC2626`, opaque tĩnh, pips `#FFFFFF` emissive phát quang | 5/5 passed | ✔️ PASS |
| **Facet 4: Bot Step Pacing** | Nhịp 1 chỉ Roll, Nhịp 2 Buy/Decline, Nhịp 3 EndTurn, độ trễ 1.500ms, 3 tính cách Bot độc lập | 8/8 passed | ✔️ PASS |

---

## 4. PHÁN QUYẾT REVIEWER ĐỘC LẬP (TRẠM 3)

- **`spec-reviewer`**: **PASS 🟢** — Đối soát 100% đặc tả yêu cầu người dùng, không phát sinh Scope Drift.
- **`code-reviewer`**: **PASS 🟢** — Toàn bộ tệp mã nguồn tuân thủ ngân sách LOC/CC, 0 dirty cast, 0 silent error swallowing, pass toàn bộ `npm run gate:quick`.

---

## 5. BÀI HỌC VẬN HÀNH & BẤT BIẾN LƯU TRỮ

Đã ghi nhận **Gotcha #72** vào [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md):
- `[BOT/3D/NET] Bất Biến Phân Nhịp Vi Bước Bot AI stepBotTurn, Định Vị Tâm Sàn Diễn Xúc Xắc Z=0.0 & Xúc Xắc Đỏ Ruby Phản Quang`.
- Đảm bảo tính nhất quán giữa camera SSOT và di dời asset 3D, đồng thời duy trì adapter vi mô cho test runner.
