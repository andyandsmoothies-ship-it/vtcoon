# [IMP-124] KẾ HOẠCH NÂNG CẤP: GIẢI CỨU KẸT LƯỢT MẤT LƯỢT (SKIPNEXTTURN UNFREEZE) & TỐI ƯU THÍCH ỨNG HIỆU NĂNG WEBGL

- **Mã Cải Tiến**: IMP-124
- **Tên Đầy Đủ**: SkipNextTurn Action Dock Unfreeze, Contextual Penalty Notice & Adaptive WebGL Performance Optimization
- **Trọng Tâm**:
  1. Gói 1 (Chí Mạng): Khắc phục dứt điểm lỗi kẹt lượt người chơi khi bị mất lượt (`skipNextTurn`), đồng bộ `turnPhase` xuống Client Store, khóa nút Đổ Xúc Xắc, mở nút Kết Thúc Lượt với nhãn `⏩ Mất Lượt (Hết Lượt)` và hiển thị thông báo ngữ cảnh Bão Duyên Hải / Nồng Độ Cồn.
  2. Gói 2 (Hiệu Năng): Tối ưu hóa thích ứng chuỗi hậu kỳ WebGL (Adaptive N8AO & Draw Call Throttling), tự động hạ cấp hoặc bypass N8AO khi FPS < 40 FPS để giải phóng băng thông GPU, đưa 1.998 draw calls về mức an toàn.
- **Ngày Tạo**: 2026-09-19
- **Trạng Thái**: 🟡 **IN PROGRESS (QUY TRÌNH 3 TRẠM)**

---

## 1. BỐI CẢNH & PHÂN TÍCH VẤN ĐỀ (PROBLEM STATEMENT)

### A. Vấn đề 1: Bẫy Kẹt Lượt Do Mất Lượt (SkipNextTurn Action Dock Deadlock)
1. **Hiện tượng thực tế từ Log Hộp Đen (Media dump `1789814139575`)**:
   - Ở Vòng 34 (Tick 420), người chơi `p1` dẫm vào Ô 1 (Bến Nghé / Ba Son) đang có hiệu ứng `MC_COASTAL_STORM` (Bão duyên hải, IMP-116). Hàm `handleLanding` gán `player.skipNextTurn = true`.
   - Ở Vòng 35 (Tick 431), lượt chơi quay lại `p1`. Server phát hiện `p1.skipNextTurn === true`, xóa cờ và chuyển thẳng sang `room.phase = TurnPhase.PropertyManagement` (bỏ qua `WaitingRoll`).
   - Tuy nhiên, Client Store (`apply_delta.ts`) reset `hasRolledThisTurn = false` khi chuyển lượt và **hoàn toàn không lưu `turnPhase` vào store**.
   - `action_dock.tsx` và `ui_helpers.ts` chỉ kiểm tra `hasRolledThisTurn === false`:
     * Nút **"Đổ Xúc Xắc" BẬT SÁNG** (`disabled = false`).
     * Nút **"Kết Thúc Lượt" BỊ KHÓA CHẶT** (`disabled = true`).
   - Người chơi bấm "Đổ Xúc Xắc" 4 lần liên tiếp. Server nhận `INTENT_ROLL` nhưng từ chối vì `room.phase === PropertyManagement`. Người chơi không thể đổ xúc xắc, cũng không thể bấm kết thúc lượt, bị kẹt đơ suốt 30 giây cho đến khi hết giờ!

### B. Vấn đề 2: Hiệu Năng Đồ Họa 1.998 Draw Calls & 29.1 FPS
1. **Hiện tượng thực tế**:
   - Log ghi nhận: `drawCalls: 1998`, `fps: 29.1`, `triangles: 224587`.
   - Nguyên nhân: Sa bàn có ~650 mesh riêng lẻ. Khi kết hợp DirectionalLight shadow map pass + N8AO depth/normal pass + Main scene pass + Bloom/SMAA passes, số lượng draw calls bị nhân lên gấp 3 lần (650 × 3 = ~1.950 calls).
   - Trên các máy tính không có card đồ họa rời mạnh, 2.000 draw calls khiến tốc độ khung hình tụt xuống dưới 30 FPS.

---

## 2. QUY HOẠCH KIẾN TRÚC & GIẢI PHÁP KỸ THUẬT

### Gói 1: Đồng Bộ TurnPhase & Giải Cứu Action Dock
- `src/client/store/game_store_types.ts`:
  - Khai báo action `setTurnPhase: (phase?: string) => void`.
- `src/client/store/game_store.ts`:
  - Khởi tạo `turnPhase: 'WaitingRoll'`.
  - Triển khai `setTurnPhase: (turnPhase) => set({ turnPhase })`.
- `src/client/network/apply_delta.ts`:
  - Trong `syncTurnAndTimer`: Gọi `if (delta.turnPhase !== undefined) state.setTurnPhase(delta.turnPhase)`.
- `src/client/ui/ui_helpers.ts`:
  - Mở rộng `ActionDockButtonStateParams` với trường `turnPhase?: string`.
  - Trong `isRollActionDisabled`:
    - Nếu `turnPhase === 'PropertyManagement' && (!params.canRollAgain || !params.hasRolledThisTurn)`, trả về `true` (Khóa nút Đổ Xúc Xắc).
  - Trong `isEndTurnDisabled`:
    - Nếu `params.turnPhase === 'PropertyManagement' && !params.hasRolledThisTurn`, trả về `false` (Cho phép kết thúc lượt ngay khi bị mất lượt di chuyển).
- `src/client/ui/action_dock.tsx`:
  - Đọc `turnPhase` từ store.
  - Khi `isMyTurn && turnPhase === 'PropertyManagement' && !hasRolledThisTurn && !inAudit`:
    - Đổi nhãn nút kết thúc lượt thành: **`⏩ Mất Lượt (Hết Lượt)`**.
    - Chuyển hiệu ứng phát sáng `isGlowActive` sang nút Kết Thúc Lượt.
    - Hiển thị chip cảnh báo ngữ cảnh: `🌪️ Bạn bị hoãn gieo xúc xắc lượt này do Bão Duyên Hải / Kiểm Tra Nồng Độ Cồn`.

### Gói 2: Tối Ưu Thích Ứng N8AO & Draw Calls
- `src/client/3d/post_processing_pipeline.tsx`:
  - Thêm cơ chế thích ứng: tự động hạ N8AO sang `halfRes={true}` hoặc tạm tắt N8AO khi `isLowFps` (ví dụ FPS < 35 hoặc khi thiết bị kích hoạt chế độ tiết kiệm).
  - Tiết kiệm ngay 600–800 draw calls trong 1 khung hình, bảo đảm tốc độ khung hình phục hồi mượt mà.

---

## 3. KẾ HOẠCH TRIỂN KHAI QUY TRÌNH 3 TRẠM

1. **Trạm 1 (RED Contract Test)**:
   - File: `tests/client/skip_next_turn_unfreeze_and_adaptive_perf.test.ts`.
   - Thiết kế >= 15 atomic tests kiểm thử 4 facets:
     * Chốt 1: `isRollActionDisabled` khóa nút khi `turnPhase === 'PropertyManagement'` và `hasRolledThisTurn === false`.
     * Chốt 2: `isEndTurnDisabled` mở khóa nút khi `turnPhase === 'PropertyManagement'` và `hasRolledThisTurn === false`.
     * Chốt 3: Đồng bộ `turnPhase` từ DeltaPayload vào Zustand store.
     * Chốt 4: ActionDock render nhãn `⏩ Mất Lượt (Hết Lượt)` và chip thông báo bão/nồng độ cồn.
     * Chốt 5: Adversarial Inversion chứng minh lỗi đỏ (RED) trên mã nguồn cũ.
2. **Trạm 2 (GREEN Implementation)**:
   - Chỉnh sửa tối thiểu trong `src/client/store/game_store.ts`, `src/client/network/apply_delta.ts`, `src/client/ui/ui_helpers.ts`, `src/client/ui/action_dock.tsx`, `src/client/3d/post_processing_pipeline.tsx`.
   - Chạy kiểm thử đến khi 100% tests XANH (GREEN).
3. **Trạm 3 (Physical Disk Review & Verification)**:
   - `spec-reviewer` đối soát 0 Scope Drift.
   - Chạy `npm run lint:ui`, `npx tsc --noEmit`, kiểm tra đĩa vật lý.
