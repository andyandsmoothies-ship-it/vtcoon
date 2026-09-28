# [REPORT] IMP-208P: Nâng Cấp Công Thái Học Giao Diện Giao Dịch BĐS Trên Mobile

## 1. THÔNG TIN TỔNG QUAN
- **Mã Ticket**: IMP-208P
- **Tiêu Đề**: Nâng Cấp Công Thái Học & Chuẩn Hóa Giao Diện Giao Dịch BĐS Trên Mobile (Sổ Đỏ, Mua BĐS, Sàn Đàm Phán P2P, Quản Lý Danh Mục & Thế Chấp).
- **Phân Hạng**: **Two-Way Door** / Full Rigor (8 tệp UI Modals, 1 test suite hợp đồng Detroit 16 tests, 1 test suite điều hòa tiến hóa).
- **Trạng Thái**: ✅ COMPLETE (HOÀN TẤT TRỌN VẸN QUY TRÌNH 3 TRẠM & NGHIỆM THU VÒNG 2).
- **Cổng Độc Lập**:
  - `plan-griller`: **AUDITED** (Khắc phục 4 điểm mù P1-P2: Test ID collision, bảo toàn TC-202.07 `2 BĐS`, quét sạch micro-text L60/L136, ngân sách LOC thực tế 450).
  - `spec-reviewer`: **SPEC_PASS (APPROVED)** (100% spec reconciliation, 16/16 atomic contract tests).
  - `ui-craft-reviewer`: **APPROVE (disposition: ship)** (Nghiệm thu vòng 2 sau Active Remediation: 0 font < 11px, 100% touch targets >= 44px, grid layout 2 cột, focus ring, tactile 3D shadow).
  - `scout`: **SWEEP_PASS** (Zero Defect trên cả 5 archetype lỗi phổ biến).

---

## 2. NGUYÊN NHÂN CỐT LÕI & GIẢI PHÁP VẬT LÝ

### 2.1. Hiện trạng trước cải tiến
1. **Micro-text < 11px khó đọc**: `purchase_decision_card.tsx`, `title_deed_rent_table.tsx`, và `property_portfolio_modal.tsx` còn tồn tại nhiều nhãn dùng `text-[9px]`, `text-[9.5px]`, `text-[10px]` gây mờ mắt và khó đọc trên màn hình điện thoại 360px - 414px.
2. **Nút chạm dưới chuẩn 44px**: Tab header trong `portfolio_tab_header.tsx` và nút mở rộng biểu phí trong `title_deed_rent_table.tsx` chỉ cao 32px - 36px, dễ bấm hụt khi dùng ngón tay cái.
3. **Tràn chữ và rớt dòng trên Mobile**:
   - `trade_sentiment_meter.tsx`: Tiêu đề tâm lý AI thiếu `min-w-0 flex-1 truncate`, tên đối tác dài đẩy vỡ layout header.
   - `trade_modal.tsx`: Tab Deal mang nhãn dài `Bạn Đưa (1 BĐS • 5.000 Tr.)` bị rớt dòng làm xấu thanh điều hướng tab.
4. **Thiếu cảm giác xúc giác (Tactile Feedback)**: Các phím gợi ý giá bán/mua 70%, 100%, 120% trong `trade_column.tsx` phẳng lỳ, không có độ sâu cơ học.
5. **Vỡ hàng nút hành động thẻ BĐS**: Khi BĐS đã xây nhà (`level > 0`), các nút Thế Chấp, Hạ Cấp, Sổ Đỏ dùng `flex flex-wrap` tạo ra các khối không đều nhau, gây lộn xộn giao diện.

### 2.2. Giải pháp hoàn chỉnh
1. **Nâng sàn cỡ chữ toàn diện**:
   - `src/client/ui/modals/purchase_decision_card.tsx` (155 LOC): Nâng toàn bộ font radar badge, cell chips, building level, freeze banner, cash buffer lên `text-[11px] sm:text-xs`.
   - `src/client/ui/modals/title_deed_rent_table.tsx` (263 LOC): Nâng nhãn `x2 ĐỘC QUYỀN`, `x1.5 ĐỘC QUYỀN`, các chip cấp bậc và mini-bar lên `text-[11px] font-black tracking-tight`; nâng nút đóng/mở biểu phí lên `min-h-[44px]`.
   - `src/client/ui/modals/property_portfolio_modal.tsx` (450 LOC): Nâng 6 vị trí text 10px (thiếu hụt, chip nhóm, mã ô, mảnh ghép còn thiếu, lý do khóa nâng cấp) lên `text-[11px]`.
2. **Mở rộng diện tích chạm chuẩn ngón tay (Touch Targets >= 44px)**:
   - `src/client/ui/modals/portfolio_tab_header.tsx` (34 LOC): Nâng tab BĐS và Trái Phiếu lên `min-h-[44px] px-3 py-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400`.
   - `src/client/ui/modals/title_deed_rent_table.tsx`: Nút `toggle-rent-tiers` và `collapse-rent-tiers` đạt `min-h-[44px]`.
3. **Chống tràn và tinh giản nhãn**:
   - `src/client/ui/modals/trade_sentiment_meter.tsx` (104 LOC): Bọc `min-w-0 flex-1`, thêm `truncate min-w-0` và tooltip `title`.
   - `src/client/ui/modals/trade/trade_partner_strip.tsx` (74 LOC): Bổ sung `focus-visible:ring-2 focus-visible:ring-amber-400`.
   - `src/client/ui/modals/trade_modal.tsx` (279 LOC): Tinh giản compound deal ` (1 • 5.000)` và thuần tiền mặt ` (5.000)` (triệt tiêu hoàn toàn hậu tố `Tr.` theo bất biến IMP-197), đồng thời bảo toàn nguyên vẹn ` (2 BĐS)` khi thuần tài sản (bảo toàn TC-202.07 100%); thêm thẻ `span.truncate` và focus ring.
   - `src/client/ui/modals/title_deed_rent_table.tsx` & `src/client/ui/modals/auction_district_card.tsx`: Dọn sạch các hậu tố `Tr.` còn sót trong biểu phí tiện ích để nhất quán 100% với IMP-197.
   - `src/client/ui/modals/property_portfolio_modal.tsx` (475 LOC — Tier 2 $\le$ 500 LOC):
     * **Zero-Scroll Filter Grid**: Chuyển thanh lọc từ dạng cuộn ngang tràn mép sang lưới 4 cột cố định `grid grid-cols-4 gap-1`, triệt tiêu hoàn toàn hiện tượng xén chữ `Đang T...`, vừa khít 100% màn hình 360px - 414px với nhãn responsive (`Sắp Đủ 🔥`, `Thế Chấp` trên mobile; `Sắp Đủ Bộ 🔥`, `Đang Thế Chấp` trên desktop).
     * **Rich Empty State & Recovery CTA**: Thay thế dòng text cụt hứng bằng khung giải thích trực quan (icon 🏗️, nêu rõ điều kiện độc quyền/lượt đi/tiền mặt) kèm nút cứu vãn 1-chạm `[Xem Tất Cả (N BĐS)]`.
     * **Chiều cao co giãn tự nhiên (`h-auto`)**: Khi danh sách rỗng, container tự ôm sát nội dung thay vì nuốt trọn 90dvh che khuất bàn cờ.
     * **Gọn hóa hàng mảnh ghép còn thiếu**: Thu gọn chip giá và nút `🔍` (icon-only trên mobile) giúp tên địa danh (Đồng Nai, Bà Rịa - Vũng Tàu) không bị cắt cụt ba chấm.
4. **Đổ bóng xúc giác 3D (Tactile Depth)**:
   - `src/client/ui/modals/trade/trade_column.tsx` (246 LOC): Phím gợi ý giá bán mang `border-2 border-amber-300 shadow-[0_2px_0_0_#fcd34d] active:shadow-none active:translate-y-[2px]`; phím gợi ý giá mua mang `border-2 border-blue-300 shadow-[0_2px_0_0_#93c5fd] active:shadow-none active:translate-y-[2px]`.
5. **Hệ lưới Grid 2 cột vuông vức**:
   - `src/client/ui/modals/property_portfolio_modal.tsx`: Thay thế flex-wrap bằng `grid grid-cols-2 gap-1.5 text-xs`. Nút Thế Chấp / Giải Chấp chiếm `col-span-2 min-h-[44px]`, nút Hạ Cấp chiếm `col-span-1 min-h-[44px]`, nút Sổ Đỏ chiếm `col-span-1 min-h-[44px]` (hoặc `col-span-2` khi không có hạ cấp). Bổ sung focus ring cho thanh lọc danh mục.

---

## 3. KIỂM THỬ & CHỈ SỐ HOÀN TẤT
- **Contract Test Suite**: `tests/contracts/imp208_mobile_real_estate_ui_polish.test.ts` — **18/18 atomic tests PASS 100%**.
- **Specification Evolution Reconcile**: `tests/client/imp202_trade_modal_ergonomics_overhaul.test.ts` & `tests/client/imp136_portfolio_monopoly_insights.test.ts` — **PASS 100%**.
- **Tổng ca kiểm thử liên quan**: **179/179 tests PASS** trên cả 9 suites liên quan (`imp208`, `imp208p`, `imp202`, `imp161`, `imp133`, `imp136`, `imp106`, `imp75`, `imp212`).
- **Linter & Typecheck**:
  - `npm run lint:ui`: **0 Anti-patterns** trên toàn bộ 195 tệp client.
  - `npx tsc --noEmit`: **0 lỗi compile**.
- **Ngân sách LOC vật lý**:
  - `src/client/ui/modals/property_portfolio_modal.tsx`: 475 LOC ($\le$ 500 LOC Tier 2).
  - `tests/contracts/imp208_mobile_real_estate_ui_polish.test.ts`: 442 LOC ($\le$ 600 LOC Test Tier).
- **Evidence Snapshot**: `.agents/evidence/imp208p_snapshot.json` (`executed: true`).
- **Sổ cái Epic**: Đã ghi nhận tại `docs/epics/client_ui/_epic_ledger.md`.
