# Báo Cáo Nghiệm Thu IMP-153: Đại Tu UI/UX Đàm Phán Thương Lượng P2P & Công Thái Học Cảm Ứng Di Động (P2P Trade Modal Tactile UI/UX Overhaul & Mobile Ergonomics)

> **Mã cải tiến:** IMP-153  
> **Căn cứ phản hồi người dùng:** Ảnh chụp thực tế iPhone (`media_1789985412922.png`) phản ánh dải màu sắc không cùng dòng gây hiểu nhầm gạch chân, nhiều khoảng trống dư thừa, khó bấm chọn trên điện thoại, và nút Hủy bị xén cụt mép.  
> **Trạng thái:** 🟢 **Hoàn Tất & Đã Nghiệm Thu Trạm 3** (Station 3 Reviewers APPROVED / SHIP).  
> **Ảnh chụp thực tế nghiệm thu:**
> - Mobile iPhone (390x844): [`docs/reports/improvements/screenshots/imp153_mobile_trade_modal.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/improvements/screenshots/imp153_mobile_trade_modal.jpg)
> - Desktop (1280x850): [`docs/reports/improvements/screenshots/imp153_desktop_trade_modal.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/improvements/screenshots/imp153_desktop_trade_modal.jpg)

---

## 1. TỔNG QUAN CẢI TIẾN & CHUYỂN HÓA CẢM XÚC

1. **Dải màu cùng dòng mép trái (Inline Left Stripe)**:
   - Thay thế dải màu nằm ngang trên đỉnh bằng dải màu dọc `w-2.5 sm:w-3 self-stretch shrink-0` ở mép trái thẻ BĐS.
   - Triệt tiêu 100% ảo giác dải màu của thẻ dưới bị mắt nhìn nhầm là gạch chân của dòng chữ phía trên.
2. **Chuẩn hóa Touch Target 44px (Apple HIG & WCAG AA)**:
   - Nâng chiều cao mỗi thẻ BĐS từ 26px lên `min-h-[44px]`, padding thoải mái `px-2.5 py-1.5`.
   - Người chơi chạm bất kỳ đâu trên hàng BĐS đều kích hoạt chọn/bỏ chọn dễ dàng.
   - Bảo tồn nguyên vẹn chuỗi `✓ [ĐÃ CHỌN]` trong capsule `text-[9px] font-black`.
3. **Mở rộng danh sách BĐS (Chống bẫy cuộn 2 tầng)**:
   - Điều chỉnh chiều cao danh sách từ `max-h-44` (176px) sang `max-h-52 sm:max-h-72`.
   - Hiển thị cùng lúc 5-6 BĐS mà không đẩy tổng chiều cao modal vượt quá 90vh của màn hình di động.
4. **Sửa dứt điểm lỗi nút [Hủy] bị xén mép**:
   - Nút `[ Gửi Đề Xuất Đàm Phán ]` bổ sung `min-w-0 flex-1 truncate`.
   - Nút `[ Hủy ]` cố định `shrink-0 min-w-[76px]`.
   - Footer siết lề `p-3 pt-2 sm:p-4 gap-2`, đảm bảo 100% không bao giờ bị cắt chữ trên màn hình hẹp 360px.
5. **Cân bằng trục khi cột không có BĐS**:
   - Khi `props.length === 0`, hiển thị thẻ đệm `min-h-[100px]` với icon `🏛️ Chưa sở hữu BĐS` viền đứt, giữ hai cột thăng bằng trên desktop.

---

## 2. MINH CHỨNG KIỂM THỬ ĐỐI KHÁNG & LINTER (3-STATION PIPELINE)

### Trạm 1: RED Contract Tests
- File: `tests/client/imp153_trade_modal_mobile_ergonomics.test.ts`
- 16 atomic tests bao quát 4 diện (Boundary, Reactivity, Safety/Disposal, Error Defense).
- Kết quả: 8 tests Business RED thất bại xác nhận thiếu hụt tính năng trên mã nguồn gốc.

### Trạm 2: GREEN Implementation
- File sửa đổi: [`src/client/ui/modals/trade_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/trade_modal.tsx) (464 LOC — dưới trần 485 LOC).
- Kết quả: **16/16 tests mới PASS 100%**.
- Kiểm tra hồi quy: **104/104 tests cũ liên quan PASS 100%**. Tổng cộng 120/120 tests xanh tuyệt đối.
- UI Linter: `npm run lint:ui` đạt **0 vi phạm** trên toàn bộ 165 files.

### Trạm 3: Independent Reviews & Physical Evidence
- **Spec Reviewer**: VERDICT: SIGN-OFF (APPROVED 100%).
- **UI Craft Reviewer**: DISPOSITION: SHIP (0 lỗi vật lý P1-P8).
- **Docker Production Rebuild**: Container `vtcoon-vtcoon-1` rebuilt và healthy, phục vụ trực tiếp trên `http://localhost:3000/`.
- **Evidence Snapshot**: Ghi nhận tại `.agents/evidence/imp-153_snapshot.json`.

---

## 3. REFLEXION & INVARIANT RECORDING

Đã ghi nhận vào `docs/domain/gotchas.md`:
- **Gotcha #204**: `[UI/CRAFT][P2P] Dải Màu Cùng Dòng Mép Trái, Vùng Chạm 44px & Chống Tràn Nút Footer Đàm Phán (IMP-153)`.
  * Ràng buộc 1: Danh sách lựa chọn BĐS trong modal giao dịch bắt buộc sử dụng dải màu phân khu dọc ở mép trái `self-stretch shrink-0`, cấm đặt dải màu ngang trên đỉnh thẻ gây ảo giác gạch chân dòng trên.
  * Ràng buộc 2: Thẻ BĐS và các nút bấm tương tác bắt buộc đạt `min-h-[44px]` theo chuẩn WCAG AA và Apple HIG.
  * Ràng buộc 3: Cụm nút footer kết hợp nút chính dài và nút phụ ngắn bắt buộc gắn `min-w-0 flex-1 truncate` cho nút chính và `shrink-0 min-w-[76px]` cho nút phụ để tránh tràn viền hoặc co ép mép phải trên màn hình di động 360px.
