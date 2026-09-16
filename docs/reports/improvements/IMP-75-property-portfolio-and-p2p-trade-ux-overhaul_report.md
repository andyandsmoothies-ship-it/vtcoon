# IMP-75 — Báo Cáo Hoàn Tất: Quản Lý Danh Mục BĐS, Carousel Sổ Đỏ, Đàm Phán P2P & Giám Sát Bất Biến Vỡ Nợ

**Ngày hoàn thành**: 2026-09-15  
**Trạng thái**: 🟢 HOÀN TẤT (COMPLETE)  
**Kế hoạch thực thi**: [`docs/plans/improvements/IMP-75-property-portfolio-and-p2p-trade-ux-overhaul_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-75-property-portfolio-and-p2p-trade-ux-overhaul_plan.md)  
**Hợp đồng kiểm thử**: [`tests/client/imp75_property_portfolio_and_trade_ux.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp75_property_portfolio_and_trade_ux.test.ts) (18/18 PASS)  

---

## 1. BỐI CẢNH & NGUYÊN NHÂN GỐC RỄ (ROOT CAUSES)

Từ nhật ký hộp đen (Flight Recorder telemetry) và báo cáo sự cố thực tế của người dùng:
1. **Bẫy Kẹt Đơn BĐS Khi Khủng Hoảng Nợ (`resolveManagePropertyTarget`)**:
   - Khi bị âm tiền (-3.022 Tr.) trong pha vỡ nợ (`InsolvencyPhase`), người chơi nhấn "Quản Lý BĐS". Hệ thống chỉ mở sổ đỏ của ô đầu tiên (`ownedProperties[0]`, ví dụ Ô 6 Cần Thơ). Sau khi thế chấp ô này lấy 300 Tr., người chơi vẫn thiếu nợ nhưng không thể nào chuyển sang xem hay thế chấp 5 ô đất còn lại (`[1, 13, 16, 19, 28]`). VTCOON trước đây hoàn toàn thiếu một màn hình tổng thể quản lý danh mục tài sản sở hữu.
2. **Lỗi Nuốt Âm Thầm Lệnh Đàm Phán P2P (`modal_host.tsx#onSubmitTrade`)**:
   - Khi mở "Đàm phán", giao diện chỉ cố định với 1 đối thủ, không có selector chuyển đối tác, giấu số dư tiền mặt của đối tác, giao diện tối sẫm và khó dùng.
   - Đặc biệt nghiêm trọng: Hàm `onSubmitTrade` trong `modal_host.tsx` không nhận tham số từ `TradeModal` mà đọc từ `modalPayload` rỗng ban đầu. Hậu quả là `tradeData` bị bỏ rơi, intent `INTENT_TRADE_OFFER` **bị nuốt âm thầm, không bao giờ được gửi lên server**, dù âm thanh thành công vẫn phát ra.
3. **Cảnh Báo Sai của Telemetry Invariant**:
   - `handleDeltaTelemetry` kiểm tra `isInInsolvency: postState.activeModal === 'insolvency'`. Khi người chơi đóng banner để xem Sổ đỏ hay Portfolio, cờ này thành `false` dù FSM server vẫn đang ở `InsolvencyPhase`, gây ra cảnh báo giả `NEGATIVE_BALANCE_OUTSIDE_INSOLVENCY`.
   - `checkIsTeleport` báo vi phạm `INVALID_POSITION_STEP` khi người chơi bị dịch chuyển thẳng vào Trạm Kiểm Toán (ô 10).

---

## 2. CÁC HẠNG MỤC THAY ĐỔI ĐÃ TRIỂN KHAI

| Thành phần | Tệp mã nguồn | Nội dung triển khai chi tiết |
| :--- | :--- | :--- |
| **PropertyPortfolioModal** (MỚI) | [`src/client/ui/modals/property_portfolio_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/property_portfolio_modal.tsx) | Modal dạng lưới (223 LOC, <= 500 cap): hiển thị 100% BĐS sở hữu, phân nhóm màu sắc, cấp công trình C0-C3, trạng thái thế chấp, thanh tiến trình bù nợ khẩn cấp khi thâm hụt, nút nhanh 1 chạm: `[Thế Chấp]`, `[Giải Chấp]`, `[Hạ Cấp]`, `[Sổ Đỏ ↗]`. |
| **TitleDeedModal Carousel** | [`src/client/ui/modals/title_deed_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/title_deed_modal.tsx) | Bổ sung thanh điều hướng carousel `[◀ Trước] (i / N) [Sau ▶]` khi người sở hữu có >1 BĐS, cho phép duyệt vòng tròn qua toàn bộ danh mục tài sản mà không cần đóng modal. |
| **Đại tu TradeModal P2P** | [`src/client/ui/modals/trade_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/trade_modal.tsx) | Thanh chọn đối tác đa người chơi (Partner Selector Tabs) hiển thị avatar, tên, số dư tiền mặt thời gian thực; giao diện thảm kem diorama cao cấp (`#FFFDF8`, `#F7F2E7`); gợi ý giá 1 chạm: `70% Sàn`, `100% Gốc`, `120%`; kiểm tra đối tác đủ tiền mặt trước khi cho phép gửi đề xuất. |
| **Khắc phục Lỗi ModalHost** | [`src/client/ui/modals/modal_host.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/modal_host.tsx) | Tiếp nhận chuẩn xác `tradeData` từ `TradeModal`: `onSubmitTrade={(tradeData) => onIntent?.({ type: 'INTENT_TRADE_OFFER', ... })}`. Hỗ trợ mở `activeModal === 'portfolio'` và liên kết InsolvencyBanner với Portfolio. |
| **Điều hướng ActionDock** | [`src/client/ui/action_dock.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/action_dock.tsx) | Nút "Quản Lý BĐS" mặc định mở `portfolio` modal thay vì mở 1 ô cố định. Nút mua đất tại vị trí hiện tại vẫn giữ nguyên cho cơ chế phục hồi giao dịch. |
| **Chuẩn hóa Telemetry Hook** | [`src/client/telemetry/telemetry_delta_hook.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/telemetry/telemetry_delta_hook.ts) | `isInInsolvency` kiểm tra `delta.turnPhase === TurnPhase.InsolvencyPhase \|\| postState.activeModal === 'insolvency'`; `checkIsTeleport` xử lý miễn trừ di chuyển vào Trạm Kiểm Toán ô 10 và dịch chuyển rút thẻ trong `ActionPhase`. |

---

## 3. KẾT QUẢ THẨM ĐỊNH QUY TRÌNH 3 TRẠM (3-STATION PIPELINE)

### Trạm 1: RED Contract Tests
- Tệp kiểm thử: `tests/client/imp75_property_portfolio_and_trade_ux.test.ts`.
- Mật độ kiểm thử: 18 atomic tests (vượt sàn 15 tests/slice).
- Adversarial Inversion: Đã chứng minh thất bại trước khi bổ sung component mới.

### Trạm 2: GREEN Implementation
- Toàn bộ 18 bài test của IMP-75 chuyển sang trạng thái PASS (54ms).
- Tất cả các test hồi quy liên quan (`impeccable_tactile_modals`, `telemetry_watchdog_and_auction_activity_contract`, `telemetry_gameplay_invariants`) đều đạt 100% PASS.

### Trạm 3: Đánh Giá Độc Lập & Kiểm Tra Ổ Đĩa Vật Lý
1. **Spec Reviewer Subagent**:
   - **Kết quả**: **APPROVED** (14/14 tiêu chí đạt chuẩn, 0 sai lệch phạm vi Scope Drift).
2. **UI Craft Reviewer Subagent**:
   - **Kết quả**: Nghiệm thu sạch 0 lỗi anti-pattern (`npm run lint:ui`). Đã tích hợp trọn vẹn 7 cải tiến xúc giác (P1–P7) nâng cấp độ nảy phím 3D, bóng đổ cơ học `shadow-[0_3px_0_0_#...]`, chiều cao chuẩn min-h-[44px] và độ tương phản chữ đậm.

---

## 4. KẾT QUẢ BỘ KIỂM TRA TOÀN CỤC (GLOBAL VERIFICATION GATES)

| Cổng kiểm định | Lệnh kiểm tra | Kết quả ghi nhận | Trạng thái |
| :--- | :--- | :--- | :---: |
| **Hợp đồng IMP-75** | `npx vitest run tests/client/imp75_*.test.ts` | 18/18 tests PASS (54ms) | 🟢 PASS |
| **Kiểm thử Modal Xúc Giác** | `npx vitest run tests/client/impeccable_*.test.ts` | 11/11 tests PASS (30ms) | 🟢 PASS |
| **Kiểm tra Linter UI 2D** | `npm run lint:ui` | 0 Anti-patterns trên 135 files | 🟢 PASS |
| **Kiểm tra Nhanh Dự Án** | `npm run gate:quick` | 0 lỗi TypeScript, 0 lỗi linter, 27/27 3D assets PASS | 🟢 PASS |
| **Bộ Kiểm Thử Toàn Cục** | `npm test` | **180/180 test files PASS (3.074 tests)** (32.57s) | 🟢 PASS |
| **Chaos Monkey Simulator** | `npm run test:chaos` | **1.000 ván hoàn tất, 0.00% deadlock, Δ kho bạc = 0** | 🟢 PASS |
| **Đóng Gói Sản Phẩm** | `npm run build` | Bundle client (797 modules) + SSR server thành công, 0 cảnh báo | 🟢 PASS |

---

## 5. BẤT BIẾN KỸ THUẬT ĐƯỢC GHI NHẬN
- Bổ sung **Gotcha #103**: `[UI/FSM] Bất Biến Quản Lý Danh Mục Bất Động Sản Đa Sở Hữu, Khớp Nối Intent Đàm Phán P2P & Giám Sát Vỡ Nợ (IMP-75)` vào `docs/domain/gotchas.md`.
