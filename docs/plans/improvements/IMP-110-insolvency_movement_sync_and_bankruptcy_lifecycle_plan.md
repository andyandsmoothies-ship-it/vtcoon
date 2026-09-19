# Kế Hoạch Cải Tiến IMP-110: Đồng Bộ Di Chuyển Pha Vỡ Nợ & Triệt Tiêu Popup Đúp Modal Phá Sản (Insolvency Movement Sync & Zero-Duplicate Bankruptcy Modal)

> **Mã kế hoạch:** IMP-110  
> **Trạng thái:** 🟢 **Hoàn Tất**  
> **Ngày thực hiện:** 2026-09-17  
> **Phạm vi tác động:** `src/client/telemetry/telemetry_delta_hook.ts`, `src/client/network/use_app_session.ts`, `src/client/network/apply_delta_players.ts`, `tests/contracts/imp110_insolvency_movement_sync_and_bankruptcy_lifecycle.test.ts`  

---

## 1. Bối Cảnh & Mục Tiêu

Trong ván đấu trực tiếp, người chơi phản ánh 2 vấn đề:
1. **Cảnh báo Telemetry duy nhất còn lại tại Tick 240**: P1 tại ô 35 đổ xúc xắc `[2, 2]` = 4 điểm, di chuyển đến ô 39 (Tràng Tiền của Bot 2). P1 bị âm tiền (-738 Tr) nên server phát delta với `turnPhase: "InsolvencyPhase"`, `dice: [2, 2]`. Tuy nhiên, `telemetry_delta_hook.ts` không coi `InsolvencyPhase` là pha di chuyển xúc xắc hợp lệ, làm trường `dice` bị gán `undefined`, dẫn đến cảnh báo sai `INVALID_POSITION_STEP` và `checkIsTeleport` hiểu nhầm là dịch chuyển.
2. **Lỗi Popup Đúp Modal Phá Sản**: Khi người chơi ở bước cuối cùng bị hết tiền và bấm nút "Tuyên Bố Phá Sản" trên `InsolvencyBanner`, modal bị đóng tạm thời và gửi intent phá sản lên server. Khi server gửi delta xác nhận phá sản (`bankrupt: true`, `balance: -738`), client trong `use_app_session.ts` thấy số dư âm và modal đang đóng nên đã tự động mở lại modal phá sản lần thứ hai.

---

## 2. Kế Hoạch Giải Pháp (Universal 4-Facet Behavioral Matrix)

- **Facet 1: Insolvency Phase Movement Synchronization**:
  - Bổ sung `TurnPhase.InsolvencyPhase` vào danh sách các pha di chuyển hợp lệ `isMovementPhase` trong `detectMovement` của `telemetry_delta_hook.ts`.
  - Bổ sung `phase !== TurnPhase.InsolvencyPhase` vào điều kiện kiểm tra của `checkIsTeleport`.
  - Đảm bảo xúc xắc `[d1, d2]` được giữ nguyên vẹn khi người chơi hạ cánh ô đối thủ và vỡ nợ, triệt tiêu hoàn toàn cảnh báo `INVALID_POSITION_STEP`.
- **Facet 2: Zero-Duplicate Bankruptcy Modal Lifecycle**:
  - Trong `use_app_session.ts`, bổ sung kiểm tra cờ `isBankrupt = Boolean(localP.bankrupt ?? useGameStore.getState().playersInfo[localPlayerId]?.bankrupt)`.
  - Chỉ mở modal vỡ nợ khi `localP.balance < 0 && !isBankrupt`.
- **Facet 3: Active Modal Disposal on Bankruptcy**:
  - Trong `apply_delta_players.ts`, khi nhận delta mang `p.bankrupt === true` mà `state.activeModal === 'insolvency'`, chủ động gọi `state.closeModal()` để giải phóng modal ngay lập tức.
- **Facet 4: Error Defense & Boundary Guard**:
  - Phòng thủ các trường hợp người chơi có số dư = 0, delta không có người chơi, hoặc modal `game_over` đang mở.

---

## 3. Kế Hoạch Kiểm Thử (Quy Trình 3 Trạm)

1. **Trạm 1 (RED Contract Test)**:
   - Viết 15 atomic tests trong `tests/contracts/imp110_insolvency_movement_sync_and_bankruptcy_lifecycle.test.ts`.
   - Chứng minh Adversarial Inversion: 4 tests liên quan đến pha Vỡ Nợ FAIL trên mã nguồn ban đầu.
2. **Trạm 2 (GREEN Implementation)**:
   - Cập nhật `telemetry_delta_hook.ts`, `use_app_session.ts`, `apply_delta_players.ts`.
   - Đạt 15/15 atomic tests PASS.
3. **Trạm 3 (Audit & Verification)**:
   - Chạy toàn bộ 224 test suites (`npm test`, 4.492 tests PASS).
   - Kiểm tra UI Linter (`npm run lint:ui`, 0 anti-patterns).
   - Kiểm tra Anti-Slop Linter (`node scripts/lint_slop.mjs`, 0 hard violations).
   - Kiểm tra đóng gói build (`npm run build`, thành công mã thoát 0).
   - Ghi nhận Gotcha #149 và cập nhật Master Roadmap.
