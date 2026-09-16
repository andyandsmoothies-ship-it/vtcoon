# Kế Hoạch Rà Soát Toàn Diện & Chuẩn Hóa UI/UX Đa Nền Tảng Vòng 2 (IMP-106)

Báo cáo chi tiết sau khi rà soát lần 2 toàn bộ 24 thành phần giao diện, áp dụng bộ kỹ năng **Impeccable** và khung thẩm định đối kháng **UI-Craft-Reviewer** (chuẩn Antigravity 2.0).

---

## 🎨 BÁO CÁO THẨM ĐỊNH UI/UX CRAFT REVIEW (VÒNG 2)

**Phán quyết**: `disposition: fix`

---

## 1. Mục Nét Tinh Hoa Bảo Lưu (`keep`)

1. **Hoa văn dập chìm Trống Đồng Đông Sơn cổ truyền** trên `TitleDeedModal` và `EventCardModal`: Chi tiết nhận diện văn hóa Việt Nam độc bản với các vòng đồng tâm và chim Lạc tinh xảo, cấm làm mờ hay thay đổi.
2. **Hệ nút bấm nổi 3D xúc giác (Tactile Luxury)**: Kỹ thuật bóng viền dập phẳng `shadow-[0_4px_0_0_#...] active:translate-y-[3px]` trên `ActionDock`, `AuctionModal`, `HoseModal` tạo cảm giác bấm đanh chắc như bàn cờ vật lý cao cấp.
3. **Thanh Ticker LED VN-INDEX trực tuyến**: Nhịp thở thị trường chứng khoán trên `HoseModal` với giá trị nhảy số sống động.
4. **Báo cáo FinTech với đồ thị SVG động**: Phân tích ROI và cơ cấu tài sản trên `GameOverModal` sắc nét, co giãn linh hoạt qua `viewBox`.
5. **Cơ chế thu gọn HUD `✕ 👥` và `🏙️ Ngắm 3D`**: Cho phép người chơi giải phóng hơn 85% tầm nhìn để chiêm ngưỡng trọn vẹn sa bàn diorama 3D trên màn hình di động.

---

## 2. Danh Sách 8 Lỗi Vật Lý Cần Xử Lý (P1 - P8)

| Mã | Tệp & Dòng Lệnh | Phân Loại Lỗi | Hiện Tượng Người Chơi Thấy | Giải Pháp Kỹ Thuật Chuẩn Hóa |
| :--- | :--- | :--- | :--- | :--- |
| **P1** | [`src/client/ui/modals/trade_modal.tsx#L311`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/trade_modal.tsx#L311) | `responsive-layout-crush` | Bố cục `grid-cols-2` ép cột xuống ~155px trên mobile, khiến nút `+500` bị tràn viền cắt mất, tiền mặt bị bẻ dòng (`9.404` và `Tr .`), tên BĐS bị cắt ngắn `...`. | Chuyển thành `grid-cols-1 sm:grid-cols-2`. Trên mobile hiển thị 1 cột xếp chồng (Bạn đề xuất ➔ Đối tác) đạt 100% độ rộng thoải mái. |
| **P2** | [`src/client/ui/modals/trade_modal.tsx#L293`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/trade_modal.tsx#L293) | `text-overflow-clip` | Tab chọn đối tác đàm phán không giới hạn độ rộng tên, khiến tên đối tác dài như `Bot AI 2 (Aggressive)` bị cắt chữ méo mó. | Thêm `truncate max-w-[120px]` vào thẻ tên đối tác. |
| **P3** | [`src/client/ui/modals/property_portfolio_modal.tsx#L96`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/property_portfolio_modal.tsx#L96) | `scroll-boundary-occlusion` | Khung cuộn `p-4 overflow-y-auto` thiếu padding đáy (`pb-8`), khiến thẻ BĐS cuối cùng (Thanh Hóa #21) bị sticky footer che khuất 50% nội dung. | Thêm `pb-8` vào khung cuộn danh sách BĐS. |
| **P4** | [`src/client/ui/modals/property_portfolio_modal.tsx#L160-L197`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/property_portfolio_modal.tsx#L160-L197) | `touch-target-size` | Nút "Sổ Đỏ ↗" chỉ cao 40px và hẹp, đứng cạnh nút "Thế Chấp" dạng `flex-1`, gây mất cân bằng thị giác và khó bấm trên mobile. | Nâng toàn bộ nút thao tác BĐS lên chuẩn `min-h-[44px]` với độ rộng phân bổ cân đối. |
| **P5** | [`src/client/ui/modals/auction_modal.tsx#L117,L267,L281`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/auction_modal.tsx#L117) | `touch-target-size` | Nút đóng `✕` kích thước `w-7 h-7` (28px), nút Auto-Bid (L267) và Rút lui (L281: cao 38px) vi phạm tiêu chuẩn vùng chạm tối thiểu 44px (WCAG AA). | Nâng nút đóng lên `min-w-[44px] min-h-[44px]`, nâng nút Auto-Bid và Rút lui lên `min-h-[44px]`. |
| **P6** | [`src/client/ui/modals/game_rules_modal.tsx#L49,L58-L95`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/game_rules_modal.tsx#L58) | `tab-label-wrapping` | Thanh 3 tab chia đều dòng bằng `flex-1` khiến nhãn tiếng Việt dài "🃏 Danh Mục Thẻ & Ô Cờ" bị bẻ thành 3 dòng chữ gãy vụn trên mobile 360px; nút đóng `w-9 h-9` (36px) dưới chuẩn 44px. | Dùng nhãn rút gọn trên mobile (`hidden sm:inline`), nâng nút đóng lên `min-w-[44px] min-h-[44px]`. |
| **P7** | [`src/client/ui/activity_feed_sidebar.tsx#L164`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/activity_feed_sidebar.tsx#L164) | `missing-backdrop-scrim` | Ngăn kéo rộng 320px trên màn hình mobile 360px che gần hết sa bàn nhưng thiếu lớp nền mờ tối (backdrop scrim) để báo hiệu có thể chạm ra ngoài để đóng. | Bổ sung backdrop scrim `fixed inset-0 bg-slate-950/50 backdrop-blur-xs md:hidden` khi mở trên mobile. |
| **P8** | [`src/client/ui/top_bar.tsx#L82,L133`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/top_bar.tsx#L82) & [`src/client/ui/social_emotes_tray.tsx#L57`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/social_emotes_tray.tsx#L57) | `touch-target-size` | Khoảng cách gap cụm điều khiển và kích thước nút icon (40px) cần được khóa chặt sàn công thái học `min-w-[44px] min-h-[44px]` và đệm responsive chống đụng độ trên thiết bị cực hẹp (< 380px). | Chuẩn hóa `min-w-[44px] min-h-[44px]`, tinh chỉnh gap/padding an toàn trên màn hình nhỏ. |

---

## 3. Sơ Đồ Bố Cục Logic Trước Khi Code

```
[Màn Hình Nhỏ Mobile: < 640px]
       │
       ├─► P1 & P2: TradeModal ➔ grid-cols-1 sm:grid-cols-2 + truncate max-w-[120px]
       ├─► P3 & P4: PropertyPortfolioModal ➔ pb-8 khung cuộn + nút hành động min-h-[44px]
       ├─► P5: AuctionModal ➔ Nút đóng ✕ min-w-[44px] min-h-[44px] + nút Auto-Bid/Rút lui min-h-[44px]
       ├─► P6: GameRulesModal ➔ Tab rút gọn trên mobile + nút đóng min-w-[44px] min-h-[44px]
       ├─► P7: ActivityFeedSidebar ➔ Thêm lớp phủ mờ Backdrop Scrim trên mobile
       └─► P8: TopBar & Emotes ➔ Sàn touch target >= 44px + đệm chống đụng độ màn hình < 380px

[Màn Hình Lớn Desktop: >= 640px]
       │
       └─► Giữ nguyên 100% bố cục 2 cột song song (Grid-cols-2) và căn lề phải để ngắm sa bàn diorama 3D
```

---

## 4. Kế Hoạch Xác Minh (Verification Plan)

### Kiểm Thử Tự Động
- `npm test`: Đảm bảo 4.145 atomic tests tiếp tục PASS 100%.
- `npx tsc --noEmit`: Đảm bảo 0 lỗi TypeScript strict mode.
- `npm run lint:ui`: Đảm bảo 0 vi phạm 4 anti-patterns.

### Xác Minh Thủ Công
- Mô phỏng Viewport di động (360x640px, 390x844px, 412x915px) và Desktop (1920x1080px).
- Xác minh container Docker hoạt động bình thường trên các cổng kết nối.
