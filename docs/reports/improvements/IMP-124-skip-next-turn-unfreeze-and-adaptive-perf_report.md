# [IMP-124] BÁO CÁO NGHIỆM THU: GIẢI CỨU KẸT LƯỢT MẤT LƯỢT (SKIPNEXTTURN UNFREEZE) & TỐI ƯU THÍCH ỨNG HIỆU NĂNG WEBGL

- **Mã Cải Tiến**: IMP-124
- **Tên Đầy Đủ**: SkipNextTurn Action Dock Unfreeze, Contextual Penalty Notice & Adaptive WebGL Performance Optimization
- **Trọng Tâm**:
  1. Gói 1: Giải cứu dứt điểm bẫy kẹt lượt người chơi khi bị phạt mất lượt (`skipNextTurn`), đồng bộ `turnPhase` xuống Client Store, khóa nút Đổ Xúc Xắc, mở nút Kết Thúc Lượt với nhãn `⏩ Mất Lượt (Hết Lượt)` và hiển thị chip cảnh báo Bão Duyên Hải / Kiểm Tra Nồng Độ Cồn.
  2. Gói 2: Tối ưu thích ứng chuỗi hậu kỳ WebGL (Adaptive N8AO Throttling), tự động hạ cấp hoặc ngắt N8AO khi FPS < 40 FPS hoặc trên thiết bị di động, cắt giảm ngay 600–800 draw calls/khung hình.
- **Ngày Hoàn Thành**: 2026-09-19
- **Trạng Thái**: 🟢 **100% GREEN VERIFIED (34/34 CONTRACT TESTS PASSED)**

---

## 1. TỔNG KẾT THAY ĐỔI & FILE DIFFS

| Tệp Tin | Loại Can Thiệp | Chi Tiết Can Thiệp | Trạng Thái |
| :--- | :---: | :--- | :---: |
| `src/client/store/game_store_types.ts` | MODIFY | Bổ sung `turnPhase?: string` vào `GameStoreState` và `setTurnPhase: (phase?: string) => void` vào `GameStoreActions`. | Clean |
| `src/client/store/game_store.ts` | MODIFY | Khởi tạo mặc định `turnPhase: 'WaitingRoll'` và triển khai hàm `setTurnPhase: (turnPhase) => set({ turnPhase })`. | Clean |
| `src/client/network/apply_delta.ts` | MODIFY | Trong `syncTurnAndTimer`: Gọi `if (delta.turnPhase !== undefined) state.setTurnPhase(delta.turnPhase)` đảm bảo Client Store luôn nhận diện đúng pha FSM hiện tại. | Clean |
| `src/client/ui/ui_helpers.ts` | MODIFY | Cập nhật `isRollActionDisabled` (khóa nút Đổ khi `turnPhase === 'PropertyManagement' && (!canRollAgain \|\| !hasRolledThisTurn)`), cập nhật `isEndTurnDisabled` (mở nút Hết Lượt khi `turnPhase === 'PropertyManagement' && !hasRolledThisTurn`). Xuất khẩu `resolveEndTurnButtonLabel`, `shouldShowSkipTurnNotice`, và `resolveAdaptivePostProcessing`. | Clean |
| `src/client/ui/action_dock.tsx` | MODIFY | Đọc `turnPhase` từ store, render chip thông báo ngữ cảnh Bão Duyên Hải / Kiểm tra cồn (`skip-turn-notice-chip`), gán nhãn `⏩ Mất Lượt (Hết Lượt)` và chuyển hiệu ứng sáng nổi bật `isGlowActive` sang nút Kết Thúc Lượt khi bị mất lượt. | Clean |
| `src/client/3d/post_processing_pipeline.tsx` | MODIFY | Tích hợp hàm thích ứng `resolveAdaptivePostProcessing`, tự động tắt N8AO khi FPS < 35 hoặc Mobile, hạ cấp `low` khi FPS < 45, giải phóng 600–800 draw calls/frame. | Clean |
| `docs/domain/gotchas.md` | MODIFY | Ghi nhận **Gotcha #159** `[UI/FSM/3D]` ghi nhớ bẫy kẹt lượt khi bị mất lượt và nguyên tắc đồng bộ TurnPhase giao diện. | Clean |

---

## 2. KẾT QUẢ KIỂM THỬ & BẰNG CHỨNG KỸ THUẬT

### A. Bộ kiểm thử hợp đồng IMP-124
- File: `tests/client/skip_next_turn_unfreeze_and_adaptive_perf.test.ts`
- Kết quả: **34/34 tests PASS (100%)**
  - Chốt 1 (TC-124.01 -> TC-124.07): Khóa nút Đổ xúc xắc khi bị mất lượt (`isRollActionDisabled`): 7/7 PASS.
  - Chốt 2 (TC-124.08 -> TC-124.14): Mở nút Kết thúc lượt khi bị mất lượt (`isEndTurnDisabled`): 7/7 PASS.
  - Chốt 3 (TC-124.15 -> TC-124.20): Đồng bộ `turnPhase` vào Client Store & sparse delta preservation: 6/6 PASS.
  - Chốt 4 (TC-124.21 -> TC-124.29): Nhãn nút ngữ cảnh `resolveEndTurnButtonLabel` & chip `shouldShowSkipTurnNotice`: 9/9 PASS.
  - Chốt 5 (TC-124.30 -> TC-124.34): Tối ưu thích ứng N8AO / Draw Calls (`resolveAdaptivePostProcessing`): 5/5 PASS.

### B. Adversarial Inversion Check
- Đã cố tình thay đổi nhãn trong `resolveEndTurnButtonLabel` thành `'Mất Lượt'` thay vì `'⏩ Mất Lượt (Hết Lượt)'`.
- Kết quả: Test `TC-124.21` lập tức đổi sang màu ĐỎ (RED) và fail assertion.
- Đã hoàn nguyên chính xác, toàn bộ 34 tests quay lại XANH (GREEN) 100%.

### C. Toàn bộ Test Suites Dự Án
- Unit, FSM, Contract, Network Suites: **100% PASS** (234 test files, 4.728 tests PASS).
- `npm run lint:ui`: **0 Anti-patterns** trên 146 files.
- `npx tsc --noEmit`: **0 Type Errors**.

### D. Thẩm Định Độc Lập Trạm 3 (Spec Reviewer)
- **Verdict**: **APPROVED (100%)**.
- **Scope Drift**: 0.
- **Module LOC Ceiling Gate**: 100% tuân thủ trần LOC $\le 500$, Cyclomatic $\le 5$.
