# Kế Hoạch Cải Tiến IMP-156: Đại Tu UI/UX Sàn Đấu Giá Trực Tuyến (Desktop Dual-Wing Arena & Mobile Ergonomics)

> **Mã Cải Tiến:** IMP-156  
> **Tài Liệu Kế Hoạch Gốc:** [`implementation_plan.md`](file:///C:/Users/HP/.gemini/antigravity/brain/9712aca6-8125-42ae-b3ce-05d065c3f4e0/implementation_plan.md)  
> **Báo Cáo Thẩm Định Đối Kháng:** [`.agents/audit/PLAN_AUDIT_IMP-156.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-156.md)  
> **Căn Cứ Phản Hồi:**  
> - "kiểm tra giao diện này, tôi mở trên desktop thấy vẫn còn rườm rà, text li ti , ux kém"  
> - "đồng ý, tôi cần giao diện sạch, đơn giản nhưng vẫn đủ thông tin, thân thiện người dùng; kiểm tra thêm giao diện mobile"  

---

## 1. MỤC TIÊU CỐT LÕI
1. **Bố Cục 2 Cánh Desktop (Dual-Wing Arena)**:
   - Mở rộng container trên Desktop: `w-full max-w-lg md:max-w-3xl lg:max-w-4xl`.
   - Cánh Trái (Hồ Sơ Tài Sản & Phân Khu): Tên BĐS to rõ, dải màu phân khu, giá khởi điểm / chiết khấu phát mãi, và thẻ phân khu với các ô BĐS hiển thị đầy đủ không bị cắt cụt.
   - Cánh Phải (Đấu Giá Thời Gian Thực & Hành Động): Khối Giá Thầu Hiện Tại (`flip-counter`) và Người Dẫn Đầu cân xứng thị giác; danh sách người tham gia; đồng hồ đếm ngược; cụm nút đặt giá tactile to rõ và Auto-Bid / Bỏ cuộc.
2. **Triệt Tiêu Text Li Ti**:
   - Loại bỏ 100% class font `text-[9px]` và `text-[10px]`, nâng font nhỏ nhất lên `text-xs` (12px).
   - Chip BĐS hiển thị 2 dòng thông minh, đồng bộ chiều cao hàng `min-h-[3.75rem]`, hỗ trợ các tên dài 43 ký tự (Hải Phòng).
3. **Sửa Dứt Điểm Lỗi Tích Lũy Timer 73s**:
   - Khống chế `session.endTime = Date.now() + 15_000` trên máy chủ trong `auction_manager.ts`.
4. **Bảo Toàn Công Thái Học Mobile**:
   - Trên Mobile (`< md`), giao diện co dọc tự nhiên với padding tinh gọn `p-3.5 sm:p-5`, đảm bảo toàn bộ cụm hành động đếm ngược và nút bấm nằm trọn trong viewport 90vh mà không bị đẩy trôi xuống dưới.
