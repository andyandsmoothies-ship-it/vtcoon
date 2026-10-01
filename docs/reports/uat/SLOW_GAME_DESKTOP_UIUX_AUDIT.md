# BÁO CÁO KIỂM TOÁN VẬT LÝ UI/UX MÀN HÌNH DESKTOP (SLOW GAME SIMULATION)

> **Viewport mục tiêu**: Desktop Landscape (1920 × 1080 px — 1080p Full HD Baseline)  
> **Cấu hình kiểm thử**: Chế độ chơi chậm 4 người (1 Human + 3 Bots), chạy qua Chrome Headless CDP với 27 màn hình/modal vật lý thực tế.  
> **Thư mục ảnh chụp vật lý**: `docs/reports/uat/screenshots/slow_game_desktop/` (27 tệp JPG từ 01 đến 27)  
> **Quy chuẩn đối chiếu**: ASD-STE100, Dual-Viewport Parity, Impeccable 2D UI/UX Craft, WCAG 2.1 AA, 6 Trụ Cột Bất Biến Miền VTCOON.

---

## 1. TỔNG QUAN KẾT QUẢ NGHIỆM THU THỊ GIÁC (27 MÀN HÌNH DESKTOP)

| STT | Tên Màn Hình / Modal / Trạng Thái | File Ảnh Chụp Thực Tế | Đánh Giá Kỹ Thuật | Trạng Thái |
|:---:|:---|:---|:---|:---:|
| 1 | Bàn Cờ 3D & Toàn Cảnh Giao Diện | `01_desktop_board_overview.jpg` | Sa bàn 3D 1080p sắc nét, TopBar và ActionDock cân đối | **XUẤT SẮC** |
| 2 | Biểu Ngữ Sự Kiện Vĩ Mô Đang Hoạt Động | `02_desktop_active_market_events.jpg` | Xếp chồng 3 tầng cân đối dưới TopBar, thời gian đếm ngược rõ | **XUẤT SẮC** |
| 3 | Quyết Định Mua BĐS (#1 Cần Thơ) | `03_desktop_purchase_decision_unowned.jpg` | Bố cục 2 cột thoáng; C3 bị cắt cụt do huy hiệu Độc Quyền | **CẦN SỬA (P2)** |
| 4 | Cảnh Báo Thiếu Tiền Khi Mua BĐS | `04_desktop_purchase_decision_shortfall.jpg` | Nút Mua vô hiệu hóa chuẩn; thông báo mâu thuẫn "Thiếu 0" | **CẦN SỬA (P2)** |
| 5 | Sổ Đỏ Chính Chủ (#1 Cần Thơ - Đã Mua) | `05_desktop_title_deed_own_property.jpg` | Con dấu ngọc lục bảo đẹp mắt; C3 bị cắt cụt do huy hiệu Độc Quyền | **CẦN SỬA (P2)** |
| 6 | Sàn Đấu Giá Trực Tiếp (Đặt Giá) | `06_desktop_auction_modal_bidding.jpg` | Bảng thầu nổi bật; danh sách đại gia bị cắt ngang người thứ 4 | **CẦN SỬA (P1)** |
| 7 | Thẻ Sự Kiện Thị Trường Mở Rộng | `07_desktop_event_card_modal.jpg` | Căn giữa màn hình hoàn hảo, nút CTA cố định dễ bấm | **XUẤT SẮC** |
| 8 | Đàm Phán Giao Thương P2P Toàn Cảnh | `08_desktop_trade_modal_overview.jpg` | Bố cục 2 cột cân đối; dải đối tác co thành "Bot...", lặp ngoặc đồng thuận | **CẦN SỬA (P1)** |
| 9 | Sàn Giao Dịch Chứng Khoán HOSE | `09_desktop_hose_stock_exchange.jpg` | Bảng xúc xắc 1D6 chi tiết; modal bị đẩy lệch hoàn toàn sang mép phải | **CẦN SỬA (P1)** |
| 10 | Khủng Hoảng Thanh Khoản & Cưỡng Chế | `10_desktop_insolvency_crisis.jpg` | Cảnh báo nợ đỏ rõ; modal bị ép lệch phải thay vì căn giữa nguy cấp | **CẦN SỬA (P1)** |
| 11 | Danh Sách HUD Người Chơi Mở Rộng | `11_desktop_player_hud_expanded.jpg` | Cột dọc 4 người chơi gọn gàng, hiển thị cụm ô đất trực quan | **XUẤT SẮC** |
| 12 | Bảng Xếp Hạng Chung Cuộc (Victory) | `12_desktop_game_over_victory.jpg` | Vinh danh vô địch; modal bị đẩy dạt sang mép phải cực đoan | **CẦN SỬA (P1)** |
| 13 | Đề Xuất Giao Thương Từ Bot AI | `13_desktop_bot_trade_offer.jpg` | Thẻ trao đổi 2 chiều; modal bị đẩy lệch phải thiếu trọng tâm | **CẦN SỬA (P1)** |
| 14 | Quyền Ưu Tiên Mua Lại (Đền Bù 130%) | `14_desktop_compulsory_buyout.jpg` | Nút giá gốc 1 dòng (IMP-238); modal lệch phải, selector dính "Ô #undefined" | **CẦN SỬA (P1)** |
| 15 | Phát Hành Trái Phiếu Doanh Nghiệp | `15_desktop_bond_issuance_tab.jpg` | 3 gói tỷ lệ Net Worth trình bày thoáng, căn giữa cân đối | **XUẤT SẮC** |
| 16 | Bộ Lọc Danh Mục "Có Thể Xây" | `16_desktop_portfolio_filter_upgradeable.jpg` | Tab quản lý tài chính hoạt động mượt mà | **XUẤT SẮC** |
| 17 | Bản Đồ Quy Hoạch Đô Thị (40 Ô Sa Bàn) | `17_desktop_masterplan_modal.jpg` | Sa bàn vi mô căn giữa hoàn hảo, tiêu đề giữ trên 1 dòng | **XUẤT SẮC** |
| 18 | Hướng Dẫn & Thể Lệ Trò Chơi | `18_desktop_game_rules_modal.jpg` | Bố cục căn giữa, 3 tab luật hiển thị trang trọng, dễ tra cứu | **XUẤT SẮC** |
| 19 | Báo Cáo FinTech Sau Trận | `19_desktop_game_over_fintech.jpg` | Biểu đồ tăng trưởng tài sản mượt; modal bị đẩy dạt sang mép phải | **CẦN SỬA (P1)** |
| 20 | Danh Mục Sổ Đỏ Sau Trận | `20_desktop_game_over_deeds.jpg` | Tổng kết danh mục BĐS thâu tóm; modal lệch phải | **CẦN SỬA (P1)** |
| 21 | Nhật Ký Ván Đấu (Drawer Sidebar) | `21_desktop_activity_feed_drawer.jpg` | Drawer trượt mép phải; khoảng trắng lớn khi danh sách trống | ĐẠT (Cần tối ưu) |
| 22 | Sổ Đỏ Tuyến Ga Xe Lửa (Long Thành) | `22_desktop_title_deed_railroad.jpg` | Bảng 4 trạm vận tải rõ, dock phải nhường không gian cho ô 3D | **XUẤT SẮC** |
| 23 | Sổ Đỏ Tiện Ích Viễn Thông (Viettel) | `23_desktop_title_deed_utility.jpg` | Cước 1 Ô / 2 Ô / 5G chuẩn, dock phải nhường không gian cho ô 3D | **XUẤT SẮC** |
| 24 | Sổ Đỏ Đối Thủ Sở Hữu (Bình Dương) | `24_desktop_title_deed_opponent_owned.jpg` | Phân quyền chuẩn "✓ Đã Có Chủ: Bot AI 1"; C3 bị cắt do Độc Quyền | **CẦN SỬA (P2)** |
| 25 | Đấu Giá Phát Mại Nợ (Cưỡng Chế) | `25_desktop_auction_foreclosure.jpg` | Banner đỏ phát mại -30%; danh sách đại gia bị cắt ngang người thứ 4 | **CẦN SỬA (P1)** |
| 26 | Ô Tạm Giam Kiểm Toán & Nộp Phạt | `26_desktop_audit_jail_cell.jpg` | Nút Bảo Lãnh (500) tại ActionDock hiển thị cân xứng | **XUẤT SẮC** |
| 27 | Đổ Đôi Xúc Xắc (Được Lượt Tiếp) | `27_desktop_double_dice_roll.jpg` | Toast chúc mừng `🎲 5 + 5 = 10 (Đôi! 🎉)` góc phải dưới tinh tế | **XUẤT SẮC** |

---

## 2. CÁC ĐIỂM SÁNG VẬT LÝ ĐÃ XÁC MINH TRÊN DESKTOP (VERIFIED STRENGTHS)

1. **Hiển thị không gian 3D đạt chuẩn AAA Tabletop (Screens 01, 02, 11, 26, 27)**:
   - Trên độ phân giải 1920×1080, góc nhìn isometric bao quát toàn cảnh 40 ô đất, sa bàn đài phun nước trung tâm và đường sắt vành đai hiển thị rõ ràng, không giật lag.
   - Khung điều khiển đáy (`ActionDock`) nằm cân xứng ở trục giữa đáy màn hình với 5 nút hành động phân màu rõ ràng (Đổ Xúc Xắc: Đỏ, Quản Lý: Xanh, Đàm Phán: Vàng cam, Quy Hoạch: Xanh biển, Hết Lượt: Xám nhạt).
2. **Cơ chế neo Sổ Đỏ sang mép phải nhường tầm nhìn 3D (Screens 22, 23)**:
   - Khi xem Sổ Đỏ các ô đặc thù (Ga Xe Lửa Long Thành, Viễn Thông Viettel), việc modal được neo ở mép phải (`md:justify-end md:pr-10`) giúp người chơi vừa quan sát chi tiết biểu phí trên giấy tờ, vừa nhìn thấy rõ mô hình 3D ô đất đang được camera soi cận cảnh ở nửa trái màn hình. Đây là một quyết định công thái học đúng đắn cho riêng Sổ Đỏ.
3. **Các modal căn giữa chuẩn mực (Screens 07, 15, 17, 18)**:
   - `EventCardModal` (Screen 07), `BondIssuanceTab` (Screen 15), `MasterplanModal` (Screen 17), và `GameRulesModal` (Screen 18) hiển thị ngay chính giữa khung hình, tỷ lệ khung viền vàng ngọc/slate chuẩn mực, tôn vinh cảm giác cao cấp của một tựa game tài chính.

---

## 3. DANH MỤC KHUYẾT TẬT UI/UX PHÁT HIỆN TRÊN DESKTOP

### NHÓM P1 — LỖI BỐ CỤC & KHÔNG GIAN TRỌNG YẾU (HIGH SEVERITY)

#### 1. Lệch phải cực đoan các Modal quyết định trọng yếu (`GameOverModal`, `HoseModal`, `InsolvencyBanner`, `BotTradeOfferModal`, `CompulsoryBuyoutModal`)
- **Vị trí**: `src/client/ui/modals/modal_host.tsx#L127-L131` & `modal_backdrop.tsx#L89`
- **Hiện tượng thực tế** (Ảnh `09`, `10`, `12`, `13`, `14`, `19`, `20`):
  Trên màn hình 1920×1080, các modal quan trọng nhất của ván đấu bị dạt hoàn toàn sang mép phải sát viền màn hình (`md:justify-end md:pr-10`), bỏ trống hơn 70% diện tích không gian bên trái:
  - `GameOverModal` (Màn hình 12, 19, 20): Bục vinh danh vô địch, biểu đồ tài sản và bảng vàng bị ép lệch về bên phải, tạo cảm giác như một sidebar phụ thay vì màn kết thúc ván đấu long trọng.
  - `HoseModal` (Màn hình 09): Sàn chứng khoán HOSE bị đẩy sang góc phải, xa rời trọng tâm thị giác.
  - `InsolvencyBanner` (Màn hình 10): Màn hình báo động đỏ phá sản bị dạt góc, giảm tính khẩn cấp của quyết định sinh tử.
  - `BotTradeOfferModal` (Màn hình 13) & `CompulsoryBuyoutModal` (Màn hình 14): Màn hình đàm phán bị lệch trục.
- **Nguyên nhân kỹ thuật**:
  Tại `modal_host.tsx:129`:
  ```tsx
  <ModalBackdrop
    onClose={handleBackdropClose}
    center={activeModal === 'auction' || activeModal === 'event' || activeModal === 'portfolio'}
    dismissible={!isCriticalDecision}
  >
  ```
  `ModalBackdrop` mặc định `center = false`, kích hoạt lớp CSS:
  `fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center md:justify-end p-2.5 sm:p-4 md:pr-10`
  Điều này khiến toàn bộ các modal không nằm trong danh sách 3 modal trên bị đẩy lệch sang mép phải trên màn hình Desktop (`md:`).
- **Giải pháp**:
  Đảo ngược logic mặc định hoặc chỉ định rõ ràng: ngoại trừ modal xem Sổ Đỏ (`deed`) cần neo phải để quan sát ô 3D, TẤT CẢ các modal khác (`auction`, `event`, `portfolio`, `game_over`, `hose`, `insolvency`, `bot_trade_offer`, `compulsory_buyout`) PHẢI được căn giữa màn hình (`center={activeModal !== 'deed'}`).

---

#### 2. Cắt ngang người chơi thứ 4 trong danh sách đại gia đấu giá (`AuctionModal`)
- **Vị trí**: `src/client/ui/modals/auction_modal.tsx#L296`
- **Hiện tượng thực tế** (Ảnh `06_desktop_auction_modal_bidding.jpg`, `25_desktop_auction_foreclosure.jpg`):
  Trong khối `ĐẠI GIA THAM GIA (3/4)` và `(4/4)`, 3 người chơi đầu hiển thị rõ, nhưng người chơi thứ 4 (`Bot AI 3 [Đã rút lui]`) bị đường viền dưới cắt ngang đúng nửa thân chữ.
- **Nguyên nhân kỹ thuật**:
  Container danh sách người chơi bị giới hạn cứng chiều cao:
  `max-h-16 sm:max-h-20 overflow-y-auto pr-1 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`
  Trên màn hình Desktop (`sm:max-h-20`), chiều cao tối đa chỉ là 80px (5rem). Với 4 người chơi (mỗi dòng ~24-26px, tổng 4 dòng cần ~96-104px), việc kẹp trần 80px kết hợp ẩn thanh cuộn khiến dòng thứ 4 bị xén đứt ngang mà người dùng không thể cuộn xem trọn vẹn.
- **Giải pháp**:
  Nâng giới hạn chiều cao trên desktop lên `sm:max-h-28 md:max-h-32` hoặc `max-h-none sm:max-h-28` để 4 người chơi hiển thị nguyên vẹn 100% mà không bị cắt cụt.

---

#### 3. Tên đối tác bị đè bẹp thành `Bot ...` trong dải chọn giao dịch P2P (`TradePartnerStrip`)
- **Vị trí**: `src/client/ui/modals/trade/trade_partner_strip.tsx#L81-L89`
- **Hiện tượng thực tế** (Ảnh `08_desktop_trade_modal_overview.jpg`):
  Nút chọn đối tác hiển thị: `Bot ... 18.000 ⚡ Cần 1 ô Nam Tru...` và `Bot ... 12.000 ⚡ Cần 1 ô Bắc Duy...`. Tên của đối thủ bị co cụt thành `Bot ...` ngay trên màn hình Full HD 1920×1080.
- **Nguyên nhân kỹ thuật**:
  Tại dòng 87: Huy hiệu nhu cầu `needBadgeText` có lớp `md:max-w-none`. Trên desktop, chuỗi nhu cầu dài `⚡ Cần 1 ô Nam Trung Bộ` bung toàn bộ kích thước (~150px), kết hợp cùng số dư 50px và padding 16px, chiếm trọn 216px trong ô nút 260px. Vùng chứa tên người chơi (`min-w-0`) chỉ còn vẻn vẹn ~24px, kích hoạt CSS `truncate` cắt nát tên `Bot AI 2` thành `Bot ...`.
- **Giải pháp**:
  - Gán giới hạn chiều rộng hợp lý cho huy hiệu nhu cầu trên desktop: `md:max-w-[130px] truncate`.
  - Đặt `shrink-0` hoặc `min-w-[60px]` cho vùng tên người chơi để bảo đảm tên đối tác luôn hiển thị đầy đủ (`Bot AI 1`, `Bot AI 2`, `Bot AI 3`).

---

### NHÓM P2 — LỖI CÔNG THÁI HỌC VI MÔ & DỮ LIỆU HIỂN THỊ (MEDIUM SEVERITY)

#### 4. Cắt cụt cấp C3 `Quần thể Resort/TTTM` thành `Quần thể Resort...` khi có Độc Quyền trong Sổ Đỏ
- **Vị trí**: `src/client/ui/modals/title_deed_rent_table.tsx#L223-L246` & `title_deed_modal.tsx#L153`
- **Hiện tượng thực tế** (Ảnh `03`, `05`, `24`):
  Khi ô đất thuộc nhóm màu độc quyền (`hasMonopoly === true`), cột bên phải xuất hiện thêm huy hiệu `x1.5 ĐỘC QUYỀN`. Huy hiệu này phình rộng ~90px, khiến nhãn cấp nâng cấp C3 ở cột trái bị chèn ép và cắt cụt thành `Quần thể Resort...`.
  (Trong Màn hình 04 khi chưa có Độc Quyền, không có huy hiệu này nên nhãn `Quần thể Resort/TTTM` hiển thị đầy đủ).
- **Nguyên nhân kỹ thuật**:
  `title_deed_modal.tsx` khống chế chiều rộng tối đa ở `md:max-w-2xl` (672px). Khi chia đôi 2 cột (`md:grid-cols-2`), mỗi cột chỉ có ~310px. Khoảng không gian dành cho text nhãn C3 chỉ còn ~140px, trong khi cụm từ `Quần thể Resort/TTTM` cần ~160px.
- **Giải pháp**:
  - Mở rộng chiều rộng modal Sổ Đỏ trên Desktop từ `md:max-w-2xl` lên `md:max-w-[720px]` hoặc `md:max-w-3xl`.
  - Tinh chỉnh phân chia cột `md:grid-cols-[1fr_1.15fr]` để bảng biểu phí có đủ không gian thở cho cả nhãn C3 lẫn huy hiệu Độc Quyền.

---

#### 5. Trùng lặp tính cách & Lặp ngoặc kép trong thước đo đồng thuận giao thương (`TradeSentimentMeter`)
- **Vị trí**: `src/client/ui/modals/trade_sentiment_meter.tsx#L71-L72`
- **Hiện tượng thực tế** (Ảnh `08_desktop_trade_modal_overview.jpg`):
  Tiêu đề hiển thị: `Tâm Lý Đồng Thuận AI (Bot AI 1 (Táo Bạo)) 75% [🔥 Táo Bạo]`.
  Có 2 lỗi trực quan:
  1. Lồng 2 cặp ngoặc đơn xấu xí: `(Bot AI 1 (Táo Bạo))`.
  2. Từ `Táo Bạo` bị lặp lại 2 lần liên tiếp ngay sát nhau (trong ngoặc tên và trong badge tính cách bên cạnh).
- **Nguyên nhân kỹ thuật**:
  `trade_sentiment_meter.tsx` nhận chuỗi `partnerName` thô chưa qua lọc và tự động bọc thêm cặp ngoặc: `Tâm Lý Đồng Thuận AI ({partnerName})`.
- **Giải pháp**:
  Bọc `formatShortPlayerName(partnerName)` tại `trade_sentiment_meter.tsx:71-72` để loại bỏ nhãn tính cách thừa trong tên, kết xuất sạch sẽ: `Tâm Lý Đồng Thuận AI (Bot AI 1)`.

---

#### 6. Thông báo mâu thuẫn "Số dư không đủ (Thiếu 0)" khi người chơi có thừa tiền mặt
- **Vị trí**: `src/client/ui/modals/title_deed_action_footer.tsx#L151-L156`
- **Hiện tượng thực tế** (Ảnh `04_desktop_purchase_decision_shortfall.jpg`):
  Người chơi có 15.000 tiền mặt, ô đất giá 4.000. Nút Mua bị vô hiệu hóa vì không đủ điều kiện (hoặc hết lượt), nhưng thanh thông báo lại ghi:
  `⚠️ Số dư không đủ (Thiếu 0) Bấm [X] ở trên để xoay vốn`
- **Nguyên nhân kỹ thuật**:
  Điều kiện hiển thị chỉ kiểm tra `!canBuy && !isTradeFrozen`, không kiểm tra `shortfall > 0`. Khi `shortfall` bằng 0 hoặc không xác định, UI vẫn in ra chuỗi `Thiếu 0`.
- **Giải pháp**:
  Bổ sung điều kiện phòng vệ: chỉ hiển thị cảnh báo thiếu tiền khi `shortfall !== undefined && shortfall > 0`.

---

### NHÓM P3 — CẢI THIỆN ĐỘ BỀN VỮNG & PHÒNG VỆ DỮ LIỆU (DEFENSIVE POLISH)

#### 7. Phòng vệ hiển thị "Ô #undefined" trong bộ chọn ô đất mua lại cưỡng chế (`CompulsoryBuyoutModal`)
- **Vị trí**: `src/client/ui/modals/compulsory_buyout_modal.tsx#L141-L163`
- **Hiện tượng thực tế** (Ảnh `14_desktop_compulsory_buyout.jpg`):
  Các nút chọn ô đất hiển thị `Ô #undefined` kèm giá `0` khi payload truyền mảng số nguyên thay vì mảng đối tượng `{ cellIndex, cost, basePrice }`.
- **Giải pháp**:
  Chuẩn hóa phòng vệ dữ liệu trong `CompulsoryBuyoutModal`: tự động trích xuất `cellIndex` dù phần tử trong `eligibleTargets` là `number` hay object.

---

## 4. ĐỀ XUẤT LỘ TRÌNH TRIỂN KHAI (TICKET IMP-239)

Để giải quyết triệt để 7 khuyết tật trên, đề xuất lập kế hoạch triển khai ticket tiếp theo:  
**`IMP-239: Desktop Full-Spectrum UI/UX & Spatial Ergonomics Harmonization`**

### Phạm vi gói công việc (Scope):
1. **Trụ cột 1 (Căn giữa đối xứng Desktop)**:
   - Sửa `modal_host.tsx`: Chuyển `center={activeModal !== 'deed'}` để đưa `game_over`, `hose`, `insolvency`, `bot_trade_offer`, `compulsory_buyout` về chính tâm màn hình Desktop.
2. **Trụ cột 2 (Chống cắt cụt danh sách đấu giá)**:
   - Sửa `auction_modal.tsx`: Nâng chiều cao container đại gia lên `sm:max-h-28 md:max-h-32`.
3. **Trụ cột 3 (Chống đè bẹp tên đối tác P2P)**:
   - Sửa `trade_partner_strip.tsx`: Kẹp trần `md:max-w-[130px]` cho `needBadgeText` và gán `shrink-0` cho tên đối tác.
   - Sửa `trade_sentiment_meter.tsx`: Bọc `formatShortPlayerName` cho `partnerName`.
4. **Trụ cột 4 (Không gian Sổ Đỏ & Khử lỗi Thiếu 0)**:
   - Sửa `title_deed_modal.tsx`: Mở rộng modal desktop lên `md:max-w-[720px]`, chia cột `md:grid-cols-[1fr_1.15fr]`.
   - Sửa `title_deed_action_footer.tsx`: Bọc điều kiện `shortfall !== undefined && shortfall > 0`.
   - Sửa `compulsory_buyout_modal.tsx`: Phòng vệ dữ liệu cho `eligibleTargets`.
