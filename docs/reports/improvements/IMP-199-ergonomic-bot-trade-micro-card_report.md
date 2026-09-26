# 🏁 BÁO CÁO NGHIỆM THU KỸ THUẬT: IMP-199
> **Ticket**: IMP-199  
> **Chủ đề**: Tái Cấu Trúc Thanh Giao Dịch Bot Thành Thẻ Micro-Card 2 Tầng Công Thái Học Đạt Chuẩn Mobile 360px  
> **Trạng thái**: Hoàn Thành & Đã Nghiệm Thu (SHIP)  
> **Ngày thực hiện**: 2026-09-26  

---

## 1. Mục Tiêu & Bối Cảnh
Xuất phát từ phản hồi người dùng: *"kiểm tra lại giao diện chức năng bot đề xuất tôi bán đất, tôi thấy nút BÁN màu xanh hơi nhỏ nhưng vẫn click vào được, còn nút X hoặc V hủy không bán có vẻ hơi nhỏ, hãy review lại trước chức năng này"*, ticket **IMP-199** đã tái thiết toàn diện giao diện `InlineBotTradeStrip` nhằm giải quyết dứt điểm các khiếm khuyết công thái học trên thiết bị di động.

---

## 2. Các Thay Đổi Kiến Trúc Cốt Lõi
1. **Kiến Trúc Micro-Card 2 Tầng Xúc Giác (2-Tier Ergonomic Micro-Card)**:
   - **Tầng 1 (Metadata & Countdown)**: Avatar bot + Tên bot + Trạng thái (`muốn mua đất` / `đề xuất đổi đất`) + Badge đếm ngược `{secondsLeft}s` + Nút `[ℹ️ Chi tiết]` tách bạch.
   - **Tầng 2 (Deal Content & Tactile Action Buttons)**:
     - Tên BĐS (`truncate`) + Huy hiệu giá tiền độc lập (`shrink-0 font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200`) bảo đảm **số tiền không bao giờ bị cắt cụt** trên Mobile 360px.
     - Cặp nút hành động xúc giác lớn: `[✕ TỪ CHỐI]` (slate-200/slate-800 với border-2) và `[✓ BÁN]` / `[✓ ĐỔI]` (emerald-600 với border-2 và đổ bóng tactile `0_2px_0_0`). Cả 2 nút đều đạt chuẩn chiều cao `min-h-[38px] sm:min-h-[40px]`.
2. **Loại Bỏ Lỗi Đảo Vai Trong Chế Độ Hoán Đổi (Actor Inversion Defense)**:
   - Thay thế mũi tên 1 chiều gây hiểu nhầm bằng ký hiệu 2 chiều chuẩn xác: `Đổi: ${targetName} ⇄ ${offeredName}`.
3. **Bảo Vệ Người Chơi Âm Tiền & Phá Sản (Insolvency Guard Parity)**:
   - Đồng bộ hoàn hảo với logic kiểm soát giao dịch máy chủ (`room_property_coordinator.ts#L235`): Người chơi âm tiền (`balance < 0`) hoặc đã phá sản (`bankrupt === true`) không thể bấm chấp nhận deal có `price <= 0`. Nút chuyển sang trạng thái disabled và hiển thị nhãn `Thiếu tiền`.
4. **Triệt Tiêu Xung Đột Đua Lệnh Khi Mở Modal (Modal Synchronization)**:
   - Khi `activeModal === 'bot_trade_offer'`, thanh strip dưới nền trả về `null` và tạm dừng timer, tránh bắn intent từ chối kép khi hết giờ.
   - Trong `modal_host.tsx`, cả 3 callbacks (`onAccept`, `onReject`, `onClose`) đều chủ động giải phóng `pendingTradeOffer = null`.

---

## 3. Bằng Chứng Nghiệm Thu Thực Tế (Visual & Code Evidence)
- **Hợp Đồng Kiểm Thử**: `tests/contracts/imp199_bot_trade_strip_ergonomic_card.test.ts` (18/18 PASS - 100% kiểm thử hành vi thực tế qua `renderToStaticMarkup`).
- **Hồi Quy Hệ Thống**: 17/17 PASS (`imp198`), 8/8 PASS (`imp195`).
- **Anti-Slop & UI Linter**: 0 anti-patterns Impeccable qua `node scripts/lint_ui.mjs`.
- **Ngân Sách Dòng Mã (LOC Tiers)**:
  - `src/client/ui/modals/bot_trade_offer_strip.tsx`: 206 LOC (Hạn mức <= 300 LOC).
  - `src/client/ui/modals/modal_host.tsx`: 448 LOC (Hạn mức <= 480 LOC).
- **Ảnh Chụp Kiểm Chứng Thực Tế (Edge CDP Screenshot Inspection)**:
  - `imp199_bot_trade_mobile_360.jpg` (Mobile 360x740 Buy Offer - Không cắt cụt giá tiền, nút bấm to rõ).
  - `imp199_bot_trade_mobile_390.jpg` (Mobile 390x844 Buy Offer - Đạt chuẩn công thái học ngón tay cái).
  - `imp199_bot_trade_desktop.jpg` (Desktop 1280x800 Buy Offer - Bố cục hài hòa trên ActionDock).
  - `imp199_bot_trade_swap_mobile_360.jpg` (Mobile 360x740 Swap Offer - Ký hiệu ⇄ trực quan).
- **Phán Quyết Thẩm Định Độc Lập**: `ui-craft-reviewer` xác nhận: **VERDICT SHIP**.
- **Sổ Cái Bất Biến**: Ghi nhận chính thức **Gotcha #277** trong [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md).
