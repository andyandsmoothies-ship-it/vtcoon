# [IMP-79] Kế Hoạch Đồng Bộ Trải Nghiệm & Xử Lý Tương Tác Đặc Thù (Experience Consistency & Edge-Case Polish)

- **ID**: IMP-79
- **Loại**: Cải tiến trải nghiệm (UX Polish) & Tính toàn vẹn tương tác (Interaction Integrity)
- **Mục tiêu**: Xử lý triệt để 4 điểm bẫy bất cập tương tự Sàn HOSE vừa phát hiện.

---

## 1. PHẠM VI CÔNG VIỆC

1. **Hoãn đóng `AuctionModal`**: Chuyển trạng thái `isConcluded: true` khi `delta.auction === null`, hiển thị màn hình chúc mừng người thắng cuộc trong 1.8s.
2. **Nhật ký thẻ bài sự kiện**: Bổ sung hàm `detectEventCardActivities` ghi log đầy đủ khi rút Phiếu Cơ Hội hoặc Phiếu Thị Trường.
3. **UI Nộp Bảo Lãnh Kiểm Toán (`INTENT_BAIL_OUT`)**:
   - Thêm nút `⚖️ Nộp Bảo Lãnh (500 Tr.)` trên `ActionDock`.
   - Cập nhật `isEndTurnDisabled` cho phép người chơi kết thúc lượt khi đang chấp hành kiểm toán.
4. **Bóc tách ngữ cảnh tài chính**: Phân loại chi tiết Lệ Phí Đất Đai (Ô 04), Tiền Bảo Lãnh (Ô 10) và Phạt sự kiện.

---

## 2. QUY TRÌNH 3 TRẠM (MANDATORY 3-STATION PIPELINE)

- **Trạm 1 (RED)**: Viết >= 15 atomic contract tests tại `tests/contracts/imp79_experience_consistency.test.ts`, chứng minh thất bại trước khi cài đặt.
- **Trạm 2 (GREEN)**: Thực hiện cài đặt tối thiểu tại `src/` để pass toàn bộ 15 tests.
- **Trạm 3 (REVIEW)**: Đánh giá độc lập kiểm tra tệp vật lý, xác nhận `gate:quick` 0 lỗi và 100% tests PASS.
