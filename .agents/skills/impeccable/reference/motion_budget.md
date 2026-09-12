# QUY CHUẨN PHÂN BỔ THỜI ĐỘNG (MOTION BUDGET & EASING)

Tài liệu tham chiếu chuyên sâu thuộc bộ kỹ năng `impeccable` của dự án `vtcoon`.

---

## 1. NGUYÊN TẮC PHÂN BỔ THỜI ĐỘNG (MOTION BUDGET)

Chuyển động trong game thương mại phục vụ chức năng phản hồi xúc giác và thông báo trạng thái, không phải để trình diễn kỹ xảo kéo dài thời gian chờ của người chơi. Mọi hoạt cảnh 2D phải tuân thủ nghiêm ngặt khung ngân sách:

| Loại Tương Tác / Cảnh | Ngân Sách Thời Gian | Mục Đích & Cảm Nhận |
| :--- | :--- | :--- |
| **Phản hồi tức thì (Micro-press)** | `100ms - 150ms` | Nút bấm bị nhấn (`active`), hiệu ứng nảy nhẹ khi bấm xúc xắc, chọn ô. Phải phản hồi ngay lập tức để người chơi cảm nhận được độ đàn hồi cơ học. |
| **Thành phần phụ (Tooltips, Badges, Tabs)** | `150ms - 250ms` | Bảng gợi ý xuất hiện, chuyển tab trong modal, hiệu ứng hover trên avatar người chơi. Nhanh gọn, không cản trở thao tác. |
| **Hộp thoại chính (Modals, Drawers, Sheets)** | `250ms - 350ms` | Mở/đóng thẻ Sổ Đỏ (Title Deed), Sàn Giao Dịch HOSE, Sàn Đấu Giá. Cần sự đĩnh đạc, vững chãi, không bay lượn lơ đãng. |
| **Màn hình vĩ mô (Victory, Game Over, Major Alert)** | `350ms - 500ms` | Màn hình trao vương miện tài phiệt, công bố phá sản toàn sàn. Đủ dài để tạo sự kịch tính nhưng không vượt quá 500ms. |

> **Cảnh báo vượt ngân sách**: Bất kỳ hiệu ứng giao diện 2D nào vượt quá 500ms đều bị coi là lỗi hiệu năng và gây ức chế cho người chơi khi thi đấu với nhịp độ nhanh.

---

## 2. QUY CHUẨN ĐƯỜNG CONG GIA TỐC (EASING CURVES)

### Cấm Tuyệt Đối: Hiệu Ứng Nảy Lò Xo Rẻ Tiền (`bounce-easing`)
- **Cấm**: `animate-bounce` của CSS.
- **Cấm**: Các hàm `cubic-bezier(p1, p2, p3, p4)` có hệ số overshoot `p2 > 1.0` hoặc `p4 > 1.0` (ví dụ: `cubic-bezier(0.34, 1.56, 0.64, 1)`).
- **Lý do**: Hiệu ứng nảy quá đà tạo cảm giác đồ họa đồ chơi thiếu nghiêm túc, làm chữ hoặc nút bấm bị nhòe và rung rinh khi đang đọc thông tin tài chính quan trọng.

### Bắt Buộc: Đường Cong Dứt Khoát Thương Mại (Crisp Luxury Easing)
- **Đường cong chuẩn mực của VTCOON**:
  ```css
  cubic-bezier(0.16, 1, 0.3, 1)
  ```
- **Đặc tính kỹ thuật**:
  - **Khởi đầu cực nhanh** (`0.16`): Phản hồi gần như lập tức trong 20ms đầu tiên.
  - **Hãm phanh tinh tế** (`1.0`): Tiến sát tọa độ mục tiêu mà hoàn toàn không bị trượt lố hay nảy ngược (zero overshoot).
  - **Dừng đanh thép** (`0.3, 1`): Cố định vị trí dứt khoát, mang lại cảm giác kim loại hoặc đá quý tiếp xúc mặt phẳng.

### Ví Dụ Cấu Hình Trong Tailwind / CSS:
```css
/* Animation hiển thị Modal mượt mà và đanh thép */
@keyframes popInSmooth {
  0% {
    opacity: 0;
    transform: scale(0.96) translateY(6px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-enter {
  animation: popInSmooth 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

---

## 3. TỐI ƯU HIỆU NĂNG CHO REACT THREE FIBER (R3F)

1. **Chỉ tác động lên các thuộc tính GPU-accelerated**:
   - Dùng `transform: translate(...) / scale(...)` và `opacity`.
   - Cấm animate `width`, `height`, `margin`, `padding`, `top`, `left` trên các HUD hoặc modal nổi vì sẽ ép trình duyệt recalculate style và reflow layout, kéo tụt FPS của Canvas 3D.
2. **Hỗ trợ chế độ giảm chuyển động (`prefers-reduced-motion`)**:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, ::before, ::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```
