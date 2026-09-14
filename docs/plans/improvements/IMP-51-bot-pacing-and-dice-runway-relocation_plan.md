# Kế hoạch Cải tiến IMP-51: Nhịp Độ Bot AI Phân Bước Nhịp Nhàng & Di Dời Xúc Xắc 3D Trung Tâm Bàn Cờ

- **Mã cải tiến**: IMP-51
- **Phạm vi**: `src/server/network/turn_orchestrator.ts`, `src/server/network/wss_server.ts`, `src/client/3d/dice_tray.tsx`, `src/client/3d/camera_state_machine.ts`
- **Mục tiêu**:
  1. Triệt tiêu hiện tượng 2 Bot AI hành động dồn dập trong 1.6s sau khi người chơi kết thúc lượt; tách bạch các vi bước Roll -> Land -> Action -> EndTurn với khoảng nghỉ nhịp nhàng 1.500ms.
  2. Di dời 2 viên xúc xắc 3D từ Cầu Long Biên (Z = +3.8) về tâm điểm sông Sài Gòn (Z = 0.0), ẩn khay nỉ khi không quay, nâng cấp vật liệu đỏ Ruby đanh thép và chấm pips tương phản cao.

---

## 1. PHÂN TÍCH NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE)

1. **Bot Pacing**:
   - `TurnOrchestrator` thực thi `this.rooms.runBotTurn(roomCode)` gộp toàn bộ các intent trong một vòng lặp đồng bộ 0ms, sau đó broadcast duy nhất 1 delta chứa cả kết quả quay, di chuyển, mua đất và kết thúc lượt.
   - Khoảng cách giữa các lượt Bot chỉ là 800ms, ngắn hơn thời gian hoạt cảnh nhảy cờ của Client (~1.4s cho 7 bước), khiến hoạt cảnh bị dồn ứ hoặc chạy lướt qua mà người chơi không kịp nhận biết.
   - Việc gộp lệnh khiến `currentTurnPlayerId` trong Delta cuối cùng bị gán sang người tiếp theo, khiến Client Invariant Checker tính sai thu nhập qua ô Khởi Hành, gây ra 7 cảnh báo đỏ `TREASURY_INVARIANT_VIOLATED`.
2. **Dice Runway & Materials**:
   - Khay xúc xắc `DiceTray` được neo tĩnh tại `position={[0.0, 0.020, 3.8]}` đè trực tiếp lên thành Cầu Long Biên.
   - Các mesh khay nỉ nằm ngoài `<group visible={isVisible}>` nên tồn tại vĩnh viễn trên bàn cờ.
   - Vật liệu `meshPhysicalMaterial` bật `transparent={true}`, `opacity={0.88}` dưới nắng gắt `#FEF08A` 2.2 làm loãng màu thành hồng nhạt/trắng bợt; chấm pips bán kính 0.038 quá nhỏ.

---

## 2. KIẾN TRÚC GIẢI PHÁP

```
[Human Kết Thúc Lượt]
         │
         ▼ (Chờ 1.2s)
[Bot 1: INTENT_ROLL] ──(Broadcast Delta)──> [Client: Xúc xắc lăn & Cờ nhảy 1.4s]
         │
         ▼ (Chờ 1.5s để cờ dừng chân)
[Bot 1: INTENT_BUY/DECLINE] ──(Broadcast Delta)──> [Client: Âm thanh mua, trừ tiền, đổi cờ]
         │
         ▼ (Chờ 1.2s để người đọc)
[Bot 1: INTENT_END_TURN] ──(Broadcast Delta)──> [Chuyển lượt sang Bot 2]
         │
         ▼ (Chờ 1.2s)
[Bot 2: INTENT_ROLL] ──(Broadcast Delta)──> [Client: Xúc xắc lăn & Cờ nhảy]
```

- **Server**: Chuyển `TurnOrchestrator` sang gọi `stepBotTurn` từng bước. Sau mỗi bước tiến triển hợp lệ, phát sóng Delta và lên lịch bước kế tiếp theo `botTurnDelayMs` (1.500ms).
- **Client**:
  - `DiceTray`: Tọa độ `[0.0, 0.020, 0.0]`. Đưa toàn bộ cấu trúc khay vào `<group visible={isVisible}>`.
  - Vật liệu xúc xắc: Đỏ Ruby `#DC2626` không trong suốt khi dừng tĩnh, kích thước 0.58, pips trắng `#FFFFFF` bán kính 0.050 có emissive.
  - Camera: Cập nhật mục tiêu `dice_roll` về `[0.0, 0.25, 0.0]`.

---

## 3. TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE)
- [ ] Contract test `tests/contracts/bot_pacing_and_dice_runway_contract.test.ts` pass 100%.
- [ ] 0 lỗi TypeScript (`npx tsc --noEmit`).
- [ ] 0 vi phạm UI (`npm run lint:ui`).
- [ ] Toàn bộ test files pass 100%.
- [ ] Báo cáo nghiệm thu `docs/reports/improvements/IMP-51-bot-pacing-and-dice-runway-relocation_report.md` và cập nhật `gotchas.md`.
