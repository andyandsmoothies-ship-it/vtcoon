# Báo Cáo Hoàn Thành Cải Tiến Kỹ Thuật IMP-156: Đại Tu Visual Thẻ Bài Sự Kiện, Triệt Tiêu Lặp Chữ & Đơn Nhất Hóa Mô Tả (Single-Truth UX Overhaul)

## 1. Kết Quả Thực Hiện
- **Mã Ticket**: IMP-156 (Thẻ Bài Sự Kiện UX)
- **Trạng thái**: COMPLETED & VERIFIED (Trạm 3 Physical Disk Verified)
- **Quy trình**: Tuân thủ nghiêm ngặt Quy Trình 3 Trạm kết hợp Zero-Trust Plan Grilling và Immutable Evidence Snapshot.

## 2. Bối Cảnh & Vấn Đề Người Dùng Báo Cáo
Người dùng phản ánh:
> *"rà soát lại các loại phiếu, tôi mở trên desktop thấy text vẫn quá nhiều dẫn tới khó hiểu nội dung, ux yếu"* kèm ảnh chụp màn hình thực tế modal thẻ bài sự kiện trên Desktop.

### Các khiếm khuyết cốt lõi đã phát hiện:
1. **Lỗi Double Paragraph trên Desktop**: `EventCardModal` cùng render `<p className="hidden sm:block">{resolvedDescription}</p>` và `<div data-testid="event-specs-table" className="hidden sm:flex"><p>{resolvedEffectDetail}</p>...</div>`. Cả 2 đoạn văn dài gần như trùng lặp 95% xuất hiện cùng lúc, đè nặng thị giác.
2. **Vòng lặp từ 5 tầng (5-Layer Word Loop)**: Với thẻ `MC_FREEZE_TRADE`, cụm từ "Đóng băng" xuất hiện 5 lần liên tiếp qua Tiêu đề, Hero Stat, Paragraph 1, Paragraph 2 và chip dưới cùng.
3. **Rò rỉ câu văn giả điểm đến (Pseudo-Destination)**: Câu văn dài 43 ký tự *"Đóng băng các kênh thanh khoản thị trường"* bị rò rỉ vào chip `🏛️` của thẻ phi tiền tệ.
4. **Bó hẹp khung thẻ Desktop**: Chiều rộng `370px` ép văn bản thành 4-5 dòng chen chúc, nút đóng `38px` dưới chuẩn 44px.

---

## 3. Chi Tiết Thay Đổi Kỹ Thuật

1. **Đơn Nhất Hóa Mô Tả (Single-Truth Description)**:
   - File: [`src/client/ui/modals/event_card_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/event_card_modal.tsx)
   - Thiết lập một nguồn mô tả duy nhất `singleTruthDescription = cleanEventDescription(rawDescription)`.
   - Hiển thị trên Desktop qua `<p className="relative z-10 text-xs text-slate-600 mb-3 leading-relaxed px-1 font-semibold hidden sm:block">`.
   - Hiển thị trên Mobile qua `data-testid="event-impact-summary"`.
   - Xóa bỏ hoàn toàn thẻ `<p>` thừa thãi trùng lặp bên trong `data-testid="event-specs-table"`.

2. **Bóc Tách Tiền Tố Trùng Lặp (`cleanEventDescription`)**:
   - File: [`src/client/ui/modals/event_card_visuals.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/event_card_visuals.ts)
   - Tự động tách bỏ tiền tố trước dấu hai chấm nếu có (vd: *"Đóng băng thị trường: Tạm ngưng mua bán..."* -> *"Tạm ngưng mua bán..."*).

3. **Bộ Lọc Đích Đến Tài Chính Thực Sự (`isFinancialDestination`)**:
   - File: [`src/client/ui/modals/event_card_visuals.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/event_card_visuals.ts)
   - Whitelist các thực thể luân chuyển tiền tệ có thực: Kho Bạc, Chủ Sở Hữu Ô, Đối Thủ, Người Nghèo Nhất, hoặc Tài Khoản khi `effectDelta !== 0`.
   - Blacklist triệt để các câu văn phi tiền tệ: *"Đóng băng"*, *"Thanh khoản"*, *"Bảo toàn"*, *"Toàn thị trường"*.

4. **Nâng Cấp Hero Stat & Công Thái Học Giao Diện**:
   - `MC_FREEZE_TRADE` đổi Hero Stat từ `"ĐÓNG BĂNG THỊ TRƯỜNG: CẤM THẾ CHẤP"` thành `{ label: 'HIỆU LỰC', value: 'CẤM THẾ CHẤP & ĐẤU GIÁ', variant: 'warning' }`.
   - Mở rộng container Desktop lên `sm:max-w-[420px]`, tăng độ thoáng của dòng chữ.
   - Nâng kích thước nút đóng ✕ lên `min-w-[44px] min-h-[44px]` đạt chuẩn WCAG AA / Apple HIG.
   - Mobile (<640px) giữ nghiêm ngặt ngân sách 2 badge (`🎯`, `⏳`).

5. **Ghi Nhận Invariant Gotcha #214**:
   - File: [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md)
   - Ghi nhận đầy đủ bẫy kỹ thuật và các bất biến kiến trúc bảo vệ hệ thống.

---

## 4. Bằng Chứng Nghiệm Thu (Verification Evidence)

- **Test Suite Hợp Đồng IMP-156**: [`tests/client/imp156_event_card_visual_declutter.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp156_event_card_visual_declutter.test.ts)
  - 16/16 atomic contract tests PASS 100% trong 22ms.
- **Bộ Kiểm Thử Hồi Quy 5 Suite**:
  - `imp134_event_card_hero_stat_visual_overhaul.test.ts`: 28/28 tests PASS.
  - `imp140_fuel_surge_and_auction_polish.test.ts`: 21/21 tests PASS.
  - `imp61_tabletop_visual_alignment.test.ts`: 40/40 tests PASS.
  - `imp132_declutter_ticker_and_friendly_event_modal.test.ts`: 23/23 tests PASS.
  - `imp57_economy_and_card_clarity.test.ts`: 63/63 tests PASS.
- **TypeScript Typecheck**: `npx tsc --noEmit` đạt 0 errors trên toàn dự án.
- **UI Linter**: `npm run lint:ui` đạt 0 violations trên 167 files.
- **Hình Ảnh Kết Quả Thực Tế**:
  - Đã xuất bản ảnh chụp kiểm chứng thực tế tại: `.agents/evidence/imp156_event_card_declutter_result.jpg`.
