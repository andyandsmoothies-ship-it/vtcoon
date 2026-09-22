# Kế Hoạch Cải Tiến IMP-161: Chuẩn Hóa Xúc Giác, Touch Target 44px & Tương Thích Mobile 360px Cho Toàn Bộ 12 Hộp Thoại Doanh Nghiệp (Cross-Browser Chrome / Safari / Edge)

> **Mã Cải Tiến:** IMP-161  
> **Tài Liệu Kế Hoạch Gốc:** [`implementation_plan.md`](file:///C:/Users/HP/.gemini/antigravity/brain/9712aca6-8125-42ae-b3ce-05d065c3f4e0/implementation_plan.md)  
> **Báo Cáo Phản Biện Zero-Trust:** [`.agents/audit/PLAN_AUDIT_IMP-161.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-161.md)  
> **Căn Cứ Phản Hồi:**  
> - "Sử dụng skill impeccable và ui-craft-reviewer. Rà soát tất cả các file modal trong src/client/ui/modals/. Kiểm tra trên kích thước 360px: (1) Có nút bấm nào bị đẩy tụt khỏi màn hình (vượt quá chiều cao màn hình) không? (2) Có dòng text mô tả nào bị tràn viền (overflow) không? (3) Nút bấm có đạt chuẩn min-height 44px (touch target) không? Xuất danh sách các điểm vi phạm UX."  
> - "lập plan cho các điểm trên, chú ý độ tương thích cả desktop và mobile, cả 3 trình duyệt chrome, safari và edge"  

---

## 1. MỤC TIÊU CỐT LÕI
1. **Giải Quyết Triệt Để 8 Điểm Vi Phạm UX Vật Lý (P1–P8) & 6 Điểm Mù Kiến Trúc**:
   - Khắc phục các lỗi broken sticky context, missing max-height, touch targets dưới chuẩn (< 44px), text truncate / layout overflow, bất đối xứng lưới nút và tràn ngang trên viewport 360px x 640px.
2. **Touch Target Chuẩn 44px (Apple HIG & WCAG AA)**:
   - Toàn bộ nút bấm, chip lựa chọn giá, nút thu gọn, nút xem ô và nút đàm phán đạt chuẩn kích thước chạm ngón tay tối thiểu `min-h-[44px] min-w-[44px]`.
3. **Cross-Browser Hardening (Chrome, Safari/WebKit, Edge)**:
   - Sử dụng `max-h-[90dvh]` bảo vệ trước thanh điều hướng động của iOS Safari.
   - Bổ sung `min-w-0` trên flex children để CSS `truncate` hoạt động chính xác trên Safari WebKit.
   - Bổ sung `touch-manipulation` loại bỏ 300ms tap delay trên thiết bị cảm ứng di động.
4. **Bảo Toàn Luật Trận Đấu (Bankrupt Isolation & Palette SSOT)**:
   - Lọc sạch người chơi phá sản khỏi danh sách hiển thị trên sàn đấu giá live.
   - Bảo toàn 100% bảng màu bàn cờ ngà `#FFFBEB` và bóng xúc giác `#b45309`.

---

## 2. DANH MỤC THAY ĐỔI THEO TỆP VẬT LÝ
1. `src/client/ui/modals/auction_modal.tsx`: Tách cụm hành động thành sticky footer độc lập ở đáy modal, lọc `!p.bankrupt && !p.isBankrupt`.
2. `src/client/ui/modals/hose_modal.tsx`: Thêm `max-h-[90dvh] overflow-y-auto`, lưới cược `grid-cols-2 sm:grid-cols-4`, rút gọn nhãn `Cược [X] Tr.`, sticky footer.
3. `src/client/ui/modals/game_over_modal.tsx`: Thêm `max-h-[90dvh] overflow-y-auto` chống tụt nút "Về Sảnh Chờ".
4. `src/client/ui/modals/property_portfolio_modal.tsx`: Thu gọn nút `🤝 Đàm Phán` và `🔍 Xem Ô` thành icon nút chạm `min-h-[44px] min-w-[44px]` trên mobile, chuẩn hóa `min-h-[44px]` cho Thế Chấp / Giải Chấp.
5. `src/client/ui/modals/masterplan_components.tsx`: Nâng cấp nút `✕ Thu Gọn`, `👁️`, `🤝 Đổi Ô` lên chuẩn `min-h-[44px] min-w-[44px]`.
6. `src/client/ui/modals/trade_modal.tsx`: Nâng cấp 6 chip gợi ý giá nhanh lên `min-h-[44px]` với container `flex-wrap`.
7. `src/client/ui/modals/game_rules_modal.tsx`: Nút "Đã Hiểu" đạt `min-h-[44px] px-6 py-2.5`.
8. `src/client/ui/modals/compulsory_buyout_modal.tsx`: Đồng bộ cả 2 nút hành động dùng `h-full min-h-[48px]`.
9. `src/client/ui/modals/bot_trade_offer_modal.tsx`: Dòng chênh lệch tiền mặt bọc `flex-col sm:flex-row` kèm `min-w-0`.
10. `src/client/ui/modals/title_deed_action_footer.tsx`: Nút Mua/Nâng cấp căn giữa đa dòng `flex-col py-2 px-2 text-center leading-tight min-w-0`.
