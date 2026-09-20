# Báo Cáo Hoàn Thành Cải Tiến Kỹ Thuật IMP-132: Tinh Giản Giao Diện Desktop, Streamline Market Event Ticker 1 Dòng & Thẻ Bài Sự Kiện Thân Thiện

## 1. Kết Quả Thực Hiện
- **Mã Ticket**: IMP-132
- **Trạng thái**: COMPLETED & APPROVED (Trạm 3 Verified)
- **Quy trình**: Tuân thủ nghiêm ngặt Quy Trình 3 Trạm kết hợp Zero-Trust Plan Grilling và Immutable Evidence Snapshot.

## 2. Chi Tiết Thay Đổi Kỹ Thuật

1. **Khử Mâu Thuẫn Dữ Liệu `MC_URBAN_PLANNING` (`src/domain/event_card_metadata.ts`)**:
   - Xóa bỏ hoàn toàn câu mâu thuẫn tiêu cực `"Cấm thế chấp đất..."`.
   - Khẳng định quyền lợi gia tăng: `"Quy hoạch trục đô thị mới: Tăng 20% giá trị khi thế chấp BĐS trung tâm Hà Nội & TP.HCM."`.
   - Phạm vi đất nhận diện thân thiện: `"Bất động sản trung tâm Hà Nội và TP.HCM (Nhóm Xanh Lá & Tím)"` (loại bỏ danh sách số ô khô khan).
   - Quy chuẩn `destination: 'Ngân sách người chơi'` bảo đảm 100% hợp đồng SSOT của `imp57`.

2. **Streamline `MarketEventTicker` Thành Thanh Capsule 1 Dòng (`src/client/ui/market_event_ticker.tsx`)**:
   - Bố cục 1 dòng phẳng gọn (`items-center justify-between`), loại bỏ thẻ `<span>` mô tả phụ chia 2 dòng chữ chồng chéo.
   - Tiêu đề gọn gàng: `<span className="font-black text-xs sm:text-sm truncate text-slate-900 leading-none">{title}</span>`.
   - Countdown pill màu hổ phách tương phản cao: `<span className="px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold border bg-amber-100 text-amber-900 border-amber-400 shrink-0">Còn {modifier.remainingRounds} vòng</span>`.
   - Tối ưu diện tích chiếm dụng trên sa bàn 3D desktop, giải phóng tầm nhìn thông thoáng.

3. **Tinh Giản Thẻ Bài Sự Kiện & Triệt Tiêu Cắt Cụt Chữ (`src/client/ui/modals/event_card_modal.tsx`)**:
   - Bộ lọc `shouldShowDestination` loại bỏ các chip điểm đến nội bộ người chơi ("Ngân sách người chơi thực hiện thế chấp..."), triệt tiêu 100% hiện tượng cắt cụt chữ `t...`.
   - Chip điểm đến sử dụng `whitespace-nowrap`, không gò ép `truncate max-w-[140px]`.
   - Bảo tồn 100% các wrapper responsive: `hidden sm:block` cho paragraph description, `data-testid="event-impact-summary"` (`sm:hidden`), `data-testid="event-specs-table"` (`hidden sm:flex`).

4. **Sửa Cấn Mép Bo Góc Trái TopBar (`src/client/ui/top_bar.tsx`)**:
   - Nâng cấp đệm lề trái từ `px-2 sm:px-4` thành `px-3 sm:px-4` trên `match-info-capsule`.
   - Chữ "VÒNG" có khoảng cách an toàn tối thiểu 12px với mép bo cong `rounded-xl`, không còn hiện tượng cấn mép viền.

5. **Ghi Nhận Invariant Kiến Trúc**:
   - Ghi nhận Gotcha #172 trong `docs/domain/gotchas.md`.
   - Snapshot pháp chứng đĩa vật lý: `.agents/evidence/imp132_evidence_snapshot.json`.

## 3. Bằng Chứng Nghiệm Thu (Verification Evidence)
- **Suite Test Hợp Đồng IMP-132**: `tests/client/imp132_declutter_ticker_and_friendly_event_modal.test.ts` (23/23 tests PASS 100%).
- **Các Test Suites Liên Quan**:
  - `imp128_desktop_ui_ticker_and_toast_sync.test.ts`: 28/28 tests PASS.
  - `imp57_economy_and_card_clarity.test.ts`: 63/63 tests PASS.
  - `mobile_ui_ux_tri_package_polish.test.ts`: 35/35 tests PASS.
- **TypeScript Typecheck**: `npx tsc --noEmit` đạt 0 errors.
- **UI Linter**: `npm run lint:ui` đạt 0 violations trên 151 tệp UI.
- **Production Build**: `npm run build` thành công cho cả Client bundle và SSR server bundle.
- **Docker Production Sync**: Container `vtcoon-vtcoon-1` đã được đồng bộ bundle mới và restart healthy.
- **Trạm 3 Review**: Subagent `spec-reviewer` phê duyệt VERDICT: APPROVED.
