# [IMP-161 Report] Báo Cáo Nghiệm Thu: Chuẩn Hóa Xúc Giác, Touch Target 44px & Tương Thích Mobile 360px Cho Toàn Bộ 12 Hộp Thoại Doanh Nghiệp (Cross-Browser Chrome / Safari / Edge)

> **Mã Cải Tiến:** IMP-161  
> **Trạng Thái:** ĐÃ HOÀN THÀNH & NGHIỆM THU (SHIP)  
> **Kiểm Toán Viên:** Station 3 Spec Reviewer (VERDICT: APPROVED) & Station 3 UI Craft Reviewer (disposition: ship)  
> **Snapshot Bằng Chứng:** [`.agents/evidence/imp-161_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp-161_snapshot.json)  

---

## I. TỔNG KẾT KẾT QUẢ TRIỂN KHAI
1. **Giải Quyết Dứt Điểm 8/8 Điểm Vi Phạm UX Vật Lý (P1–P8)**:
   - **P1.1 Broken Sticky Context (`auction_modal.tsx`)**: Tách cụm hành động thành sticky footer độc lập ở đáy modal (`sticky bottom-0 -mx-3.5 -mb-3.5 sm:-mx-5 sm:-mb-5 p-3.5 sm:p-4 bg-[#FFFBEB] z-20`), ghim cố định trên mobile 360px và trải đều trên desktop.
   - **P1.3 Bankrupt Player Leak (`auction_modal.tsx`)**: Lọc sạch người chơi phá sản khỏi danh sách hiển thị với `!p.bankrupt && !p.isBankrupt`.
   - **P2 Missing Max-Height & Button Overflow (`hose_modal.tsx`, `game_over_modal.tsx`)**: Thêm `max-h-[90dvh] overflow-y-auto` đảm bảo nút cược và nút "Về Sảnh Chờ" không bao giờ bị đẩy khỏi màn hình.
   - **P2.1 Mobile 360px Title Squeeze & P4 Touch Target (`property_portfolio_modal.tsx`)**: Thu gọn nút `🤝 Đàm Phán` và `🔍 Xem Ô` thành icon nút chạm `min-h-[44px] min-w-[44px]` trên mobile, tiết kiệm 60px bề ngang, bảo vệ tên BĐS không bị co rút. Chuẩn hóa Thế Chấp / Giải Chấp thành `min-h-[44px]`.
   - **P2.2 Button Grid Asymmetry (`compulsory_buyout_modal.tsx`)**: Cả hai nút Từ chối và Xác nhận dùng chung `h-full min-h-[48px]`, đường đáy và chiều cao khớp 100%.
   - **P3, P5, P6 Touch Targets < 44px (`masterplan_components.tsx`, `trade_modal.tsx`, `game_rules_modal.tsx`)**: Nút "✕ Thu Gọn", "👁️", "🤝 Đổi Ô", 6 chip gợi ý giá mua/bán nhanh (`flex-wrap`) và nút "Đã Hiểu" nâng toàn bộ lên chuẩn tiếp xúc ngón tay `min-h-[44px]`.
   - **P7 Text Squeeze (`hose_modal.tsx`)**: Lưới chọn mức cược chuyển sang `grid-cols-2 sm:grid-cols-4`, nhãn hành động rút gọn thành `Cược [X] Tr.`.
   - **P8 Text Overflow (`bot_trade_offer_modal.tsx`, `title_deed_action_footer.tsx`)**: Dòng chênh lệch tiền mặt ngắt dòng `flex-col sm:flex-row min-w-0`, nút Mua/Nâng cấp căn giữa đa dòng `flex-col py-2 px-2 text-center leading-tight min-w-0`.
2. **Cross-Browser Hardening**:
   - Sử dụng `max-h-[90dvh]` bảo vệ trước thanh điều hướng động của iOS Safari.
   - Bổ sung `min-w-0` trên flex children để CSS `truncate` hoạt động chính xác trên Safari WebKit.
   - Bổ sung `touch-manipulation` loại bỏ 300ms tap delay trên thiết bị cảm ứng di động.
3. **Zero Dirty Casts & Slop Cleanliness**:
   - Mở rộng `PlayerHudInfo` trong `game_store_types.ts` với `readonly isBankrupt?: boolean;` và `readonly personality?: BotPersonality;`, xóa bỏ hoàn toàn `as any` trong `auction_modal.tsx` và `modal_host.tsx`.
   - Trích xuất hàm trợ giúp `buildAuctionDelta` trong `session_manager.ts`, giữ hàm cốt lõi dưới trần 120 SLOC.

---

## II. BẰNG CHỨNG KIỂM THỬ ĐỐI SOÁT
- **Hợp đồng kiểm thử mới**: `tests/client/imp161_modal_360px_ergonomics_and_cross_browser.test.ts`: **27/27 PASS (100%)** trong 56ms.
- **Hồi quy toàn dự án**: **286/286 suites, 5,853/5,853 tests PASS (100%)**.
- **UI Linter**: `npm run lint:ui` -> **0 vi phạm anti-patterns** qua 167 tệp.
- **Anti-Slop Linter**: `npm run lint:slop` -> **0 Hard Violations** qua 239 tệp.
- **Asset Linter**: `npm run lint:assets` -> **33/33 mô hình 3D đạt chuẩn ngân sách**.
- **TypeScript**: `npx tsc --noEmit` -> **0 lỗi type**.
- **Station 3 Sign-Off**:
  * `spec-reviewer`: **VERDICT: APPROVED** (100% Spec Reconciliation, 0 Scope Drift).
  * `ui-craft-reviewer`: **disposition: ship** (4/4 Anti-patterns Clean, P1-P8 Resolved).
