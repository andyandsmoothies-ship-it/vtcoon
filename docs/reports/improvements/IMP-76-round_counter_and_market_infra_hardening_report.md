# BÁO CÁO CẢI TIẾN: IMP-76 — ĐỒNG BỘ VÒNG ĐẤU TOÀN MẠNG, BẢO TOÀN KHO BẠC ĐẦU TƯ CÔNG & PHỤ THU THẺ THỊ TRƯỜNG

> **Mã cải tiến**: IMP-76  
> **Lĩnh vực**: `[NET]`, `[ECONOMY]`, `[UI]`, `[CRAFT]`  
> **Trạng thái**: 🟢 Hoàn Tất  
> **Ngày hoàn tất**: 15/09/2026  

---

## 1. TỔNG QUAN KẾT QUẢ
Đã giải quyết triệt để 3 vấn đề cốt lõi do người dùng phản ánh:
1. **Khắc phục dứt điểm lỗi Bộ đếm Vòng chơi đứng im tại `VÒNG 1/30`**:
   - Mở rộng `DeltaPayload` với `roundNumber?: number`.
   - Cập nhật cả Full Delta (`session_manager.ts`) và Sparse Delta (`delta_broadcaster.ts` -> `buildSparseDelta`), bảo đảm từ vòng 2 trở đi, mọi gói tin vi sai qua WebSocket đều mang `roundNumber`.
   - `apply_delta.ts` đồng bộ trực tiếp vào `useGameStore.setRoundNumber()`, giúp TopBar phản ánh đúng vòng đấu hiện tại (1..30) và kích hoạt Game Over an toàn ở vòng 31.
2. **Bảo toàn 100% dòng tiền Kho Bạc khi Giải Ngân Đầu Tư Công (`MC_PUBLIC_INVEST`)**:
   - Thẻ Đầu Tư Công chi trả thưởng 1.000 Tr./ô Hạ tầng Giao thông sở hữu.
   - `handlePublicInvest` khấu trừ chuẩn xác từ `room.treasury` (`room.treasury = Math.max(0, (room.treasury ?? 0) - totalDisbursed)`).
   - Tổng tiền tệ toàn bàn cờ (Tổng số dư người chơi + Kho Bạc) bảo toàn nguyên vẹn 100%, triệt tiêu lỗi `TREASURY_INVARIANT_VIOLATED`.
3. **Minh bạch hóa Thẻ Thị Trường trên Sổ Đỏ (Title Deed)**:
   - Đồng bộ `activeModifiers` qua WebSocket Delta vào Zustand Store.
   - Khi có thẻ kích hoạt (ví dụ: `MC_FUEL_SURGE` phụ thu +500 Tr. cước vận tải tại các ô 5, 15, 25, 35), `resolveRent` tự động tính thêm 500 Tr. cước vận tải.
   - `TitleDeedModal` hiển thị các huy hiệu xúc giác Đông Sơn (`data-testid="market-modifier-badge"`) giải thích chi tiết lý do tăng giá thuê và tự động biến mất khi thẻ decay sau 1 vòng đấu.

---

## 2. KẾT QUẢ KIỂM ĐỊNH 3 TRẠM (PHYSICAL DISK VERIFICATION)
- **Trạm 1 (RED Contract Test)**:
  - Tệp: `tests/contracts/imp76_round_counter_and_treasury_conservation.test.ts`.
  - 22 atomic contract tests theo Ma trận 4 diện mạo (Universal 4-Facet Matrix: Boundary, State Reactivity, Treasury Conservation, Error Defense & Modifiers).
  - Chứng minh thất bại trước khi can thiệp mã nguồn (Adversarial Inversion).
- **Trạm 2 (GREEN Implementation)**:
  - Vượt qua 100% các bài kiểm thử, 0 dirty casts, độ phức tạp Cyclomatic Complexity <= 4.
- **Trạm 3 (Independent Reviewers Gate)**:
  - **`spec-reviewer`**: 🎯 **APPROVED** (100% spec reconciliation, Anti-Smuggling Gate passed trên `buildSparseDelta`).
  - **`code-reviewer`**: ✅ **APPROVED** (0 raw `any`, CC <= 5, observability warning logging restored, test fidelity verified).
  - **`ui-craft-reviewer`**: 🎨 **DISPOSITION: SHIP** (0 lỗi vật lý P1-P8, 0 vi phạm UI Linter, tỷ lệ tương phản 13.5:1 đạt chuẩn WCAG AAA).
  - **Chất lượng toàn diện**:
    - `npm test`: **184/184 test files PASS (3.125/3.125 tests PASS 100%)**.
    - `npm run lint:ui`: **Clean! 0 Anti-patterns detected across 135 files**.
    - `npm run gate:quick`: **0 compilation errors, 0 asset budget violations**.
    - `npm run build`: **Client + SSR Server build thành công 100% trong 10.78s**.

---

## 3. MÃ NGUỒN THAY ĐỔI
1. [`src/server/session_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts): Bổ sung `roundNumber`, `treasury`, `activeModifiers` vào `DeltaPayload`, `buildDeltaFromRoom` và `broadcastDelta`.
2. [`src/server/network/delta_broadcaster.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/delta_broadcaster.ts): Chuyển tiếp `roundNumber`, `treasury`, `activeModifiers`, `lastHoseResult` trong `buildSparseDelta`.
3. [`src/domain/market_card_handlers.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/market_card_handlers.ts): Bổ sung `handlePublicInvest` khấu trừ Kho Bạc, tách helper `countPlayerInfra` giữ CC = 3.
4. [`src/domain/event_card_engine.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/event_card_engine.ts): Chuyển tiếp đối tượng `room` vào `applyMarketCard`.
5. [`src/domain/property_rent.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_rent.ts): Mở rộng `resolveRent` hỗ trợ tham số `modifiers?: readonly MarketModifier[]`.
6. [`src/client/store/game_store_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store_types.ts) & [`src/client/store/game_store.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store.ts): Bổ sung `activeModifiers`, `setRoundNumber`, `setActiveModifiers`.
7. [`src/client/network/apply_delta.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta.ts): Đồng bộ vòng đấu và modifiers, bổ sung log cảnh báo có cấu trúc thay vì nuốt lỗi.
8. [`src/client/ui/modals/title_deed_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/title_deed_modal.tsx): Hiển thị huy hiệu `market-modifier-badge` xúc giác Đông Sơn khi có biến động giá.
9. [`tests/contracts/imp76_round_counter_and_treasury_conservation.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp76_round_counter_and_treasury_conservation.test.ts): Bộ 22 bài kiểm thử hợp đồng chuẩn mực 4 diện mạo.
10. [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md): Ghi nhận Gotcha #107.
