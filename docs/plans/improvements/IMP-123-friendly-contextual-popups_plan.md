# [IMP-123] KẾ HOẠCH NÂNG CẤP: POP-UP GIAO DỊCH THÂN THIỆN & LÝ DO HÀNH ĐỘNG NGẮN GỌN

- **Mã Cải Tiến**: IMP-123
- **Tên Đầy Đủ**: Friendly Contextual Transaction Pop-Up Notifications & Clear Action Reasons
- **Trọng Tâm**: Nâng cấp trải nghiệm người dùng (UX) cho toàn bộ hệ thống Pop-up (Toasts & Milestone Banners), hiển thị lý do ngắn gọn, rõ nghĩa và bố cục trực quan 2 phân đoạn thay vì chỉ hiển thị số tiền khô khan.
- **Ngày Tạo**: 2026-09-19
- **Trạng Thái**: 🟡 **CHỜ NGƯỜI DÙNG DUYỆT (PLANNING)**

---

## 1. BỐI CẢNH & PHÂN TÍCH VẤN ĐỀ (PROBLEM STATEMENT)

### A. Hiện trạng quan sát
1. **Pop-up chỉ nổi bật số tiền, thiếu lý do hành động**:
   - Hiện tại, người chơi thường chỉ nhìn thấy huy hiệu tên và một con số tiền lớn (ví dụ: `[Hoàng Nam] -1.800 Tr.` hoặc `[Hoàng Nam] Tiền thuê -500 Tr.`).
   - Người chơi không nắm bắt được ngay lý do vì sao bị trừ/cộng tiền, xảy ra ở ô đất nào, hay giao dịch với ai.
2. **Ẩn đối tác giao dịch trên Mobile**:
   - Thuộc tính `hidden sm:inline` trên nhãn `targetPlayerName` khiến màn hình điện thoại chỉ hiển thị `Tiền thuê -500 Tr.` mà không hề biết trả tiền cho ai.
3. **Cắt cụt tiêu đề giao dịch**:
   - Lớp CSS `truncate max-w-[120px]` khiến các tiêu đề dài bị cắt cụt (ví dụ: `Nâng cấp C1 B...`).
4. **Milestone Banner thẻ bài bị lệch trọng tâm**:
   - Số tiền biến động được đặt làm tiêu đề lớn hàng 1, trong khi tên thẻ bài và hiệu lực thực tế bị thu nhỏ mờ nhạt ở hàng 2.

---

## 2. KIẾN TRÚC THIẾT KẾ UX MỚI (PROPOSED DESIGN)

### A. Sơ đồ luồng hiển thị (Flowchart)
```
[Giao Dịch / Biến Động Số Dư / Thẻ Sự Kiện]
                    │
                    ▼
       [resolveFriendlyReason(item)]
   Tự động sinh lý do ngắn gọn chuẩn hóa:
   • Trả thuê Ô 19 Bến Thành → Hoàng Nam
   • Thu thuê Ô 19 Bến Thành từ Huy
   • Mua sở hữu Ô 24 Đà Nẵng
   • Nâng cấp Nhà Phố (C1) Ba Đình
   • Lương qua ô Khởi Hành
   • Nộp Lệ Phí Đất Đai (Ô 04)
   • Thắng đấu giá Ô 39 Tràng Tiền
                    │
                    ▼
     [Bố Cục 2 Phân Đoạn Xúc Giác]
┌────────────────────────────────────────────────────────┐
│ [Icon] [PlayerBadge] Lý do hành động cụ thể  │ [Số tiền] │
└────────────────────────────────────────────────────────┘
                    │
     ┌──────────────┴──────────────┐
     ▼                             ▼
[Mobile (< 768px)]          [Desktop (>= 768px)]
• Luôn hiện đối tác        • Góc trên bên phải
• Không cắt cụt chữ        • Tối đa 2 toasts
• max-w-[94vw]             • max-w-md
```

### B. Quy tắc định dạng lý do ngắn gọn (`resolveFriendlyReason`)
| Loại Hành Động (`actionType`) | Lý Do Ngắn Gọn Hiển Thị | Ví Dụ Minh Họa |
| :--- | :--- | :--- |
| `rent_pay` | `Trả thuê [Tên Ô] cho [Đối Thủ]` | `Trả thuê Bến Thành cho Hoàng Nam` |
| `rent_receive` | `Thu thuê [Tên Ô] từ [Đối Thủ]` | `Thu thuê Bến Thành từ Huy` |
| `buy` | `Mua sở hữu [Tên Ô]` | `Mua sở hữu Đà Nẵng` |
| `upgrade` | `Xây [Cấp] [Tên Ô]` | `Xây Nhà Phố (C1) Ba Đình` |
| `salary` | `Lương qua ô Khởi Hành` | `Lương qua ô Khởi Hành` |
| `tax` | `Nộp Lệ Phí Đất Đai (Ô 04)` / `Nộp thuế` | `Nộp Lệ Phí Đất Đai (Ô 04)` |
| `bail` | `Phí bảo lãnh Trạm Kiểm Toán` | `Phí bảo lãnh Trạm Kiểm Toán` |
| `auction_win` | `Thắng đấu giá [Tên Ô]` | `Thắng đấu giá Tràng Tiền` |
| `stimulus` | `Nhận trợ cấp Quỹ Kho Bạc` | `Nhận trợ cấp Quỹ Kho Bạc` |
| `hose` | `Khớp lệnh sàn HOSE` | `Lãi cổ phiếu HOSE (Mặt 4)` |
| `chance` | `⚡ Cơ Hội: [Tên Thẻ]` | `⚡ Cơ Hội: Hoàn Thuế BĐS` |
| `market` | `🎴 Thị Trường: [Tên Thẻ]` | `🎴 Thị Trường: Sốt Đất Toàn Miền` |

### C. Nâng cấp thiết kế Pop-Up (`FloatingBadge` & `MilestoneBanner`)
1. **Phân đoạn số tiền riêng biệt (Financial Delta Capsule)**:
   - Dấu cộng (`+`): Nền xanh ngọc nhạt `bg-emerald-50 text-emerald-700 border border-emerald-300 font-extrabold px-2.5 py-0.5 rounded-xl text-xs sm:text-sm`.
   - Dấu trừ (`-`): Nền đỏ hồng nhạt `bg-rose-50 text-rose-700 border border-rose-300 font-extrabold px-2.5 py-0.5 rounded-xl text-xs sm:text-sm`.
2. **Không giấu thông tin trên Mobile**:
   - Xóa bỏ hoàn toàn lớp `hidden sm:inline` cho `targetPlayerName`.
   - Bỏ giới hạn độ rộng cứng `max-w-[120px]` của tiêu đề, dùng bố cục linh hoạt để người chơi đọc trọn vẹn ngữ cảnh.

---

## 3. KẾ HOẠCH THỰC THI 3 TRẠM (3-STATION PIPELINE)

### Trạm 1: RED Contract Test (`tests/contracts/imp123_friendly_popups.test.ts`)
- Facet 1 (Reason Generation): Kiểm tra hàm sinh lý do cho 100% các tình huống (thuê, mua, xây, thuế, lương, đấu giá, thẻ bài).
- Facet 2 (Mobile Parity): Kiểm tra `targetPlayerName` và lý do không bị ẩn trên mobile viewport.
- Facet 3 (Visual Delta Capsule): Kiểm tra thẻ số tiền được phân tách rõ ràng với badge màu tương ứng.
- Facet 4 (Event Clarity): Kiểm tra Milestone Banner hiển thị đúng cấu trúc [Loại Thẻ] + [Tên Thẻ] + [Hiệu Lực].

### Trạm 2: GREEN Implementation
- `src/client/ui/floating_numbers.tsx`: Triển khai `resolveFriendlyReason`, cấu trúc lại `FloatingBadge` và `MilestoneBanner`.
- `src/client/network/activity_tracker.ts`: Gắn tên ô đất và thông tin đối tác đầy đủ vào `title` của mọi badge handler.
- `src/client/network/apply_delta_players.ts`: Cung cấp `title` thân thiện cho salary, bail, debt_relief.

### Trạm 3: Independent Review & Verification
- Kiểm tra toàn bộ 232+ test suites, linter UI (0 anti-patterns), slop linter (0 hard violations).
- Báo cáo và ghi nhận Gotcha #157.
- Cập nhật Docker container.
