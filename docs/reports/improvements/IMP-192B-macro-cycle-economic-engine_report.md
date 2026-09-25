# Báo Cáo Cải Tiến IMP-192B: Chu Kỳ Vĩ Mô (Sốt Đất & Đóng Băng Thanh Khoản - Macro Economic Engine)

## 1. Tổng Quan & Mục Tiêu Kỹ Thuật
- **Mã Ticket**: `IMP-192B` (Lát cắt 2 trong bộ 3 lát cắt cải tiến gameplay kinh tế đời thực IMP-192).
- **Mục tiêu**:
  - **Chu kỳ kinh tế vĩ mô 6 vòng**: Thiết lập chu kỳ thị trường xoay vòng 6 bước: Vòng 1-3 Sốt Đất (Land Fever), Vòng 4-5 Đóng Băng Thanh Khoản (Liquidity Freeze) trên đúng nhóm màu vừa sốt đất, Vòng 6 Hạ Nhiệt & Cân Bằng (Equilibrium/Cooldown).
  - **Cơ chế Sốt Đất (Land Fever - Vòng 1-3)**: Tăng doanh thu tiền thuê x2.5 (`multiplier = 2.5`), chiết khấu 25% chi phí xây dựng/nâng cấp (`calculateUpgradeCost` hệ số 0.75), chặn sàn tuyệt đối $\ge 50\%$ chi phí gốc (`MACRO_UPGRADE_COST_FLOOR = 0.50`) khi cộng hưởng với thẻ kích cầu tín dụng `MC_CREDIT_STIMULUS`.
  - **Cơ chế Đóng Băng Thanh Khoản (Liquidity Freeze - Vòng 4-5)**: Giảm 50% tiền thuê (`multiplier = 0.5`), cấm thế chấp vay nợ trên nhóm màu đóng băng với lý do từ chối `ActionRejectReason.LIQUIDITY_FROZEN`; bảo toàn quyền giải chấp (`redeemProperty`) để thanh toán nghĩa vụ nợ cũ.
  - **Điều phối Bot AI & Solvency Solver**: Cập nhật `solvency_solver.ts` và `bot_posture.ts` để Bot AI nhận diện chính xác các ô đóng băng, chủ động loại trừ khỏi danh sách ứng viên thế chấp cứu nợ.
  - **Khép kín toàn diện 5 trạm truyền dẫn**: Truyền dẫn mã `LIQUIDITY_FROZEN` qua Wire Protocol DTO, i18n tiếng Việt, Floating Text, Actionable Notification, vô hiệu hóa nút [Thế Chấp] trên Modal Sổ Đỏ / Action Footer và hiển thị biểu ngữ thị trường trên Ticker.
  - **Bảo lưu tuyệt đối trần LOC**: `src/server/room_manager.ts` giữ nguyên đúng **522 LOC (+0 LOC)**, cách ly rủi ro vượt ngưỡng 550 LOC.

---

## 2. Chi Tiết Thực Thi & Tệp Sửa Đổi
1. **[`src/domain/macro_cycle_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/macro_cycle_types.ts)** (Mới, 13 LOC, Tier 1 <= 400 LOC):
   - Định nghĩa enum `MacroCycleType` (`MACRO_LAND_FEVER`, `MACRO_LIQUIDITY_FREEZE`) tách biệt hoàn toàn khỏi `MarketCardId`.
   - Các hằng số: `MACRO_CYCLE_LENGTH = 6`, `MACRO_FEVER_ROUNDS = 3`, `MACRO_FREEZE_ROUNDS = 2`, `MACRO_FEVER_RENT_MULT = 2.5`, `MACRO_FREEZE_RENT_MULT = 0.5`, `MACRO_FEVER_UPGRADE_COST_MULT = 0.75`, `MACRO_UPGRADE_COST_FLOOR = 0.50`.
2. **[`src/domain/macro_cycle_engine.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/macro_cycle_engine.ts)** (Mới, 49 LOC, Tier 1 <= 400 LOC):
   - Hàm thuần `evaluateMacroCycle(room, rng)` xử lý chuyển tiếp 3 pha chu kỳ, kiểm tra tính lũy đẳng (idempotency), dọn dẹp modifier khi qua chu kỳ mới.
3. **[`src/domain/room.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts)** (237 LOC, Tier 1 <= 400 LOC):
   - Mở rộng `MarketModifier`: thêm `readonly colorGroup?: ColorGroup;`.
   - Mở rộng `Room`: thêm `activeMacroGroup?: ColorGroup;`.
4. **[`src/domain/action_reasons.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/action_reasons.ts)**:
   - Bổ sung `LIQUIDITY_FROZEN: 'LIQUIDITY_FROZEN'`.
5. **[`src/server/network/network_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/network_types.ts)**:
   - Bổ sung `'LIQUIDITY_FROZEN'` vào `WsErrorMessageReason`.
6. **[`src/domain/i18n/vi.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/i18n/vi.ts)**:
   - Bản dịch tiếng Việt cho `ActionRejectReason.LIQUIDITY_FROZEN`, `MacroCycleType.MACRO_LAND_FEVER`, `MacroCycleType.MACRO_LIQUIDITY_FREEZE`.
7. **[`src/domain/property_upgrade.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_upgrade.ts)** (125 LOC, Tier 1 <= 400 LOC):
   - Xuất hàm helper `calculateUpgradeCost(cellIndex, currentLevel, modifiers)` có chiết khấu 25% sốt đất và chặn sàn 50% chi phí gốc.
8. **[`src/domain/bot/bot_engine.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_engine.ts)** (359 LOC, Tier 1 <= 400 LOC):
   - Hàm `getUpgradeCost` tái sử dụng trực tiếp `calculateUpgradeCost` của domain, loại bỏ trùng lặp mã nguồn (-6 LOC).
9. **[`src/domain/bot/solvency_solver.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/solvency_solver.ts)** (204 LOC, Tier 1 <= 400 LOC) & **[`src/domain/bot/bot_posture.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_posture.ts)** (233 LOC, Tier 1 <= 400 LOC):
   - Loại trừ các ô đất đang bị `MACRO_LIQUIDITY_FREEZE` khỏi danh sách ứng viên thế chấp cứu nợ hoặc huy động vốn.
10. **[`src/server/mortgage_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/mortgage_manager.ts)** (243 LOC, Tier 1 <= 400 LOC):
    - `validateMortgage`: Kiểm tra và từ chối thế chấp các ô đất đang đóng băng với `LIQUIDITY_FROZEN`.
    - Bảo toàn 100% quyền giải chấp `redeemProperty` không bị ảnh hưởng.
11. **[`src/server/turn_loop.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/turn_loop.ts)** (266 LOC, Tier 1 <= 400 LOC):
    - Xuất helper `advanceRoundBoundary(room, rng)` xử lý thống nhất thứ tự: phân rã modifier $\to$ đánh giá chu kỳ vĩ mô $\to$ bơm gói kích cầu kho bạc.
12. **[`src/server/insolvency_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/insolvency_manager.ts)** (270 LOC, Tier 1 <= 400 LOC):
    - Khi người chơi phá sản làm chuyển lượt vòng về 0 (`next === 0`), gọi `advanceRoundBoundary(room, rng)` để đảm bảo nhịp vĩ mô không bị đứt đoạn.
13. **[`src/server/room_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts)** (522 LOC, Tier 1 <= 550 LOC):
    - Giữ nguyên **chính xác 522 LOC (+0 LOC)**.
14. **Giao Diện & Mạng Client**:
    - [`src/client/network/ws_message_handler.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/ws_message_handler.ts): Hiển thị Floating Text cảnh báo khi máy chủ từ chối thế chấp với `LIQUIDITY_FROZEN`.
    - [`src/client/ui/actionable_notification.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/actionable_notification.ts): Bổ sung cảnh báo Actionable Notification với icon `🧊`.
    - [`src/client/ui/modals/title_deed_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/title_deed_modal.tsx) & [`src/client/ui/modals/title_deed_action_footer.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/title_deed_action_footer.tsx): Vô hiệu hóa nút [Thế Chấp] khi ô đất đang đóng băng, hiển thị tooltip giải thích.
    - [`src/client/ui/market_event_ticker.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/market_event_ticker.tsx): Tích hợp biểu ngữ vĩ mô với icon `🔥` (Sốt Đất) và `🧊` (Đóng Băng) có chuỗi tóm tắt $\le 85$ ký tự.
15. **[`tests/contracts/imp192b_macro_cycle_engine.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp192b_macro_cycle_engine.test.ts)** (541 LOC, <= 600 LOC Living Test):
    - 22 atomic tests độc lập mang tag `[TC-192B.01-22/MSS][UC-IMP192B]` bao phủ toàn diện 10 Failure Modes & hợp đồng kỹ thuật.

---

## 3. Kết Quả Kiểm Thử Vật Lý & Linter
- **Contract Tests**:
  - `tests/contracts/imp192b_macro_cycle_engine.test.ts`: **22/22 PASS** (100%).
- **Full Test Suite Regression Check**:
  - `npm test`: **319/319 test files PASS**, **6,413/6,413 tests PASS** (0 regressions).
- **TypeScript Compiler Check**:
  - `npx tsc --noEmit`: **0 lỗi** (Exit code 0).
- **UI Craft Linter Check**:
  - `npm run lint:ui`: **0 vi phạm** trên 179 tệp UI.
- **LOC Tiers & Anti-Slop Check**:
  - `npm run lint:slop`: **0 hard violations**.
  - `room_manager.ts` đạt đúng 522 LOC (bảo lưu nguyên vẹn).
- **Evidence Snapshot**:
  - Đã lưu tại `.agents/evidence/imp192b_snapshot.json`.

---

## 4. Kiểm Toán Độc Lập Trạm 3 (Station 3 Sign-Off)
- **`code-reviewer`**: **APPROVED 🟢**
  - Xác nhận sạch mã nguồn, không còn dead imports, zero dirty casts (`as any`, `as unknown as`).
  - Các hàm tuân thủ ngân sách LOC Tier 1 & 2.
- **`spec-reviewer`**: **APPROVED 🟢**
  - Đối soát 11 tiêu chí nghiệp vụ SSOT đạt 100% khớp nối.
  - Không xảy ra hiện tượng "Smuggled Contract Fraud" hay "Monolithic Test Anti-pattern".

---

## 5. Kiến Thức Ghi Nhận Thực Nghiệm (Gotchas)
- **Gotcha #263 [FSM/MACRO]**:
  - **Bẫy ban đầu**: Gọi `evaluateMacroCycle` ngay trong `doStartGame` để kích hoạt sốt đất ngay Vòng 1 làm sai lệch trạng thái xuất phát sạch (`activeModifiers: []`) của bàn cờ trong các bài test cơ sở (`golden_gameplay_flow.test.ts`, `room_manager.test.ts`). Ngoài ra việc dùng chung luồng xúc xắc `this.rng` cho việc bốc màu ngẫu nhiên làm xáo trộn chuỗi số ngẫu nhiên của các ca kiểm thử hành vi định trước.
  - **Phát hiện Scout**: Chu kỳ kinh tế vĩ mô là một tiến trình diễn tiến theo thời gian được đánh giá tại biên chuyển vòng (`advanceRoundBoundary`). Tại ván mới (`roundCount = 1`), bàn cờ ban đầu luôn cần được giữ trạng thái cân bằng nguyên bản để người chơi tích lũy tài sản trước khi chịu tác động sốt đất.
  - **Bất biến xác thực**:
    1. `RoomManager` phải định tuyến toàn bộ điều phối vĩ mô qua `this.deckRng` (hoặc `rng` phụ), tuyệt đối không dùng `this.rng` của xúc xắc để chống desync luồng PRNG.
    2. Hàm `evaluateMacroCycle` phải có guard `if (cycleStep !== 1 && !room.activeMacroGroup) return;` chống kích hoạt giữa chừng ngoài ý muốn khi chưa qua pha sốt đất.
    3. Chuỗi tóm tắt trên `MarketEventTicker` bắt buộc $\le 85$ ký tự để không làm tràn vỡ layout responsive 360px mobile.
