# Kế Hoạch Triển Khai IMP-117: Hệ Thống Toast Thông Báo Giao Dịch Theo Ngữ Cảnh & Banner Cột Mốc Đáp Ứng Đa Nền Tảng (Desktop & Mobile)

> **Mã cải tiến**: IMP-117 (Contextual Transaction Toast & Responsive Multi-Platform HUD Notifications)  
> **Căn cứ**: Yêu cầu người dùng kết hợp Phương án A (Ngữ cảnh chi tiết hành động) và Phương án B (Toast thông minh, bố cục công thái học Desktop & Mobile).  
> **Mục tiêu**: Thay thế popup số tiền cộc lốc che khuất sa bàn 3D bằng hệ thống thông báo hai tầng (Two-Tier Notification System) trực quan, giàu ngữ cảnh, chống dồn ứ (Anti-Stack Clutter) và thích ứng hoàn hảo giữa Desktop và Mobile.

---

## 1. TỔNG QUAN YÊU CẦU & THIẾT KẾ ĐA NỀN TẢNG

Hệ thống thông báo mới được chia thành 2 tầng rõ rệt:

1. **Tầng 1: Toast Giao Dịch Tài Chính Nổi (Contextual Financial Toast)**:
   - Thay thế badge số thô `-600 Tr.` thành viên thuốc ngữ cảnh (Capsule Pill):
     + Mua đất: `🏷️ Mua [Đà Nẵng] • -1.800 Tr.`
     + Nâng cấp: `🏗️ Nâng C1 [Cần Thơ] • -450 Tr.` (C1: Nhà Phố, C2: Biệt Thự, C3: Khách Sạn)
     + Trả tiền thuê: `🏠 Trả thuê [Hà Nội] cho [Linh] • -700 Tr.`
     + Nhận tiền thuê: `💰 Nhận thuê [Hà Nội] từ [Nam] • +700 Tr.`
     + Vượt GO: `🚩 Lương qua GO • +2.000 Tr.`
     + Lệ phí / Thuế: `🏛️ Thuế đăng ký đất • -500 Tr.`, `⚖️ Bảo lãnh kiểm toán • -500 Tr.`
   - **Desktop**: Nằm ở góc trên bên phải (bên dưới TopBar, ngay cạnh danh sách PlayerHudList), giới hạn tối đa **2 toasts** gần nhất, thời gian tồn tại 2.2s, hiệu ứng trượt êm ái (Slide-in right), **không bao giờ che các ô đất phía Bắc và sa bàn 3D**.
   - **Mobile**: Nằm ở Top Center ngay dưới TopBar (~68px), form factor siêu gọn (`h-8`, bo góc tròn, `max-w-[92vw]`), chỉ hiển thị **duy nhất 1 toast mới nhất** (toast mới đẩy toast cũ ra ngay lập tức) để tuyệt đối không che khuất màn hình cảm ứng.

2. **Tầng 2: Banner Cột Mốc Danh Dự (Milestone Celebration Banner)**:
   - Tách riêng các sự kiện bước ngoặt (Độc quyền bộ màu, Thoát nợ, Phá sản) ra khỏi toast tiền tệ thông thường.
   - Thiết kế dạng **Honor Banner** trang trọng với viền vàng kim `#F59E0B` và icon ăn mừng, xuất hiện trượt từ trên xuống ở Top Center và tự động mờ dần sau 2.5s.

---

## 2. KIẾN TRÚC LUỒNG DỮ LIỆU

```
[WebSocket STATE_DELTA (cells, players)]
                 │
                 ├──> [apply_delta_cells.ts]: Nhận diện Mua đất / Nâng cấp C1-C3 / Gom Độc quyền
                 │          │
                 │          ▼
                 │     Kích hoạt addFloatingText({
                 │        actionType: 'buy' | 'upgrade' | 'monopoly',
                 │        title: 'Mua Đà Nẵng' | 'Nâng C1 Cần Thơ',
                 │        amount: -1800,
                 │        cellIndex, playerId, ...
                 │     })
                 │
                 └──> [apply_delta_players.ts]: Nhận diện Thuê đất / Thuế / Bảo lãnh / Lương GO
                            │
                            ▼
                       Kích hoạt addFloatingText({
                          actionType: 'rent' | 'tax' | 'salary' | 'bail',
                          title: 'Trả thuê Hà Nội cho Linh',
                          amount: -700,
                          playerId, ...
                       })
                                    │
                                    ▼
                      [useGameStore.floatingTexts]
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
[Desktop Layout (>= 768px)]                           [Mobile Layout (< 768px)]
• Vị trí: Top-Right dưới TopBar                       • Vị trí: Top-Center dưới TopBar
• Tối đa 2 toasts xếp dọc                             • Duy nhất 1 toast mới nhất
• Hiệu ứng: SlideInRight                              • Hiệu ứng: PopInScale
• Không che sa bàn 3D                                 • Siêu gọn gàng (h-8, max-w-[92vw])
```

---

## 3. CÁC TỆP SẼ CHỈNH SỬA

1. `src/client/store/game_store_types.ts`: Mở rộng `FloatingTextItem` với `actionType`, `title`, `cellIndex`, `targetPlayerName`.
2. `src/client/store/game_store.ts`: Tối ưu thời lượng 2.2s và giới hạn bộ nhớ buffer.
3. `src/client/network/apply_delta_players.ts`: Gắn ngữ cảnh khi số dư biến động (Lương GO, Trả/Nhận tiền thuê, Thuế, Bảo lãnh).
4. `src/client/network/apply_delta_cells.ts`: Gắn ngữ cảnh khi mua đất, nâng cấp nhà C1-C3, gom độc quyền bộ màu.
5. `src/client/ui/floating_numbers.tsx`: Viết lại component responsive: tách `FinancialToast` (Desktop top-right, Mobile top-center gọn) và `MilestoneBanner` (top-center).
6. `src/client/index.css`: Bổ sung keyframes animation chuyển động nhẹ nhàng chuẩn Impeccable (0 bounce).
7. `tests/contracts/imp117_contextual_transaction_toast.test.ts`: Bộ kiểm thử hợp đồng Trạm 1.
8. `docs/reports/improvements/IMP-117-contextual_transaction_toast_and_responsive_hud_notifications_report.md`: Báo cáo nghiệm thu.
9. `docs/domain/gotchas.md`: Ghi nhận Gotcha #151.
10. `docs/master_roadmap.md`: Cập nhật roadmap.
