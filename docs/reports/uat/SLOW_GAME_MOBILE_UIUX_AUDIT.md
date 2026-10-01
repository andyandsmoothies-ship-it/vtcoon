# BÁO CÁO KIỂM TOÁN VẬT LÝ UI/UX MÀN HÌNH MOBILE (SLOW GAME SIMULATION)

> **Viewport mục tiêu**: Mobile Portrait (390 × 844 px — iPhone 12/13/14 Baseline)  
> **Cấu hình kiểm thử**: Chế độ chơi chậm 4 người (1 Human + 3 Bots), mở rộng quét 27 màn hình/modal vật lý qua Chrome Headless CDP.  
> **Thư mục ảnh chụp vật lý**: `docs/reports/uat/screenshots/slow_game_mobile/` (27 tệp JPG từ 01 đến 27)  
> **Quy chuẩn**: ASD-STE100, Impeccable 2D UI/UX Craft, WCAG 2.1 AA, Zero-Scroll Tabletop.

---

## 1. TỔNG QUAN KẾT QUẢ NGHIỆM THU THỊ GIÁC (27 MÀN HÌNH MỞ RỘNG)

| STT | Tên Màn Hình / Modal / Trạng Thái | File Ảnh Chụp Thực Tế | Đánh Giá Kỹ Thuật | Trạng Thái |
|:---:|:---|:---|:---|:---:|
| 1 | Bàn Cờ 3D & HUD Lượt 1 | `01_mobile_game_start.jpg` | TopBar, ActionDock sạch sẽ; HUD hiển thị góc phải | ĐẠT (Cần tỉa text) |
| 2 | Đổ Xúc Xắc (5+3=8) & Camera Pill | `02_mobile_dice_rolled.jpg` | CameraResetPill dời sang `left-3`, triệt tiêu va chạm | **XUẤT SẮC** |
| 3 | Sổ Đỏ Mua Đất (#6 Bình Dương) | `03_mobile_title_deed_buy.jpg` | Bảng 4 cấp C0-C3 gọn gàng, footer 1 hàng vừa vặn | **XUẤT SẮC** |
| 4 | Sàn Đấu Giá Trực Tiếp Thường | `04_mobile_auction_live.jpg` | Bục đấu giá đẩy lên đầu, nút tăng giá to bản | ĐẠT (Sai thuật ngữ C3) |
| 5 | Thẻ Sự Kiện Thị Trường | `05_mobile_market_event.jpg` | Nút CTA cố định chân modal (IMP-237), không bị cắt | **XUẤT SẮC** |
| 6 | Thẻ Cơ Hội (Kiểm Tra Thuế) | `06_mobile_chance_card.jpg` | Hero stat -1.000 Tr. rõ ràng, bố cục cân đối | **XUẤT SẮC** |
| 7 | Danh Mục BĐS & Cầm Cố | `07_mobile_property_portfolio.jpg` | Thẻ đơn cuộn mượt mà, nút Cầm Cố / Sổ Đỏ >44px | ĐẠT (Thiếu đơn vị Tr.) |
| 8 | Đàm Phán Giao Thương P2P | `08_mobile_trade_negotiation.jpg` | Cụm bù tiền mặt trực quan; dải đối tác bị co chữ | **CẦN SỬA (P1)** |
| 9 | Sàn Giao Dịch Chứng Khoán HOSE | `09_mobile_hose_stock_exchange.jpg` | Bảng tỷ lệ 1D6 chia 3 cột cân đối, hạn mức cược rõ | ĐẠT (Khoảng cách chữ) |
| 10 | Khủng Hoảng Thanh Khoản & Cưỡng Chế | `10_mobile_insolvency_crisis.jpg` | Cảnh báo thâm hụt đỏ đậm, 3 nút hành động cứu nguy | **XUẤT SẮC** |
| 11 | Danh Sách HUD Người Chơi Mở Rộng | `11_mobile_player_hud_expanded.jpg` | Thẻ phá sản co nhỏ 60%, có backdrop đóng chạm | **CẦN SỬA (P1)** |
| 12 | Bảng Xếp Hạng Chung Cuộc (Victory) | `12_mobile_game_over_victory.jpg` | Huy chương Vàng/Bạc/Đồng nổi bật, ROI tính chuẩn | **XUẤT SẮC** |
| 13 | Đề Xuất Giao Thương Từ Bot AI | `13_mobile_bot_trade_offer.jpg` | Bố cục 2 thẻ BĐS trao đổi song song, đếm ngược rõ | **XUẤT SẮC** |
| 14 | Quyền Ưu Tiên Mua Lại (Đền Bù 130%) | `14_mobile_compulsory_buyout.jpg` | Bảng giá đền bù rõ ràng; cột phụ bị ngắt dòng hẹp | ĐẠT (Cột giá gốc co cụt) |
| 15 | Phát Hành Trái Phiếu Doanh Nghiệp | `15_mobile_bond_issuance_tab.jpg` | 3 gói tín dụng, bảng điều kiện net worth chuẩn | **XUẤT SẮC** |
| 16 | Bộ Lọc Danh Mục "Có Thể Xây" | `16_mobile_portfolio_filter_upgradeable.jpg` | Chuyển tab mượt, thông báo hướng dẫn khi chưa đủ bộ | **XUẤT SẮC** |
| 17 | Bản Đồ Quy Hoạch Đô Thị (40 Ô) | `17_mobile_masterplan_modal.jpg` | Sa bàn vi mô 40 ô; tiêu đề bị rớt chữ đơn lẻ | ĐẠT (Ngắt từ tiêu đề) |
| 18 | Hướng Dẫn & Thể Lệ Trò Chơi | `18_mobile_game_rules_modal.jpg` | 3 tab Quy Tắc - Thẻ Ô - Cơ Chế cuộn mượt, thoáng | **XUẤT SẮC** |
| 19 | Báo Cáo FinTech Sau Trận | `19_mobile_game_over_fintech.jpg` | Đồ thị tài sản tăng trưởng mượt mà, 4 thẻ chỉ số | ĐẠT (Đơn vị k không đồng bộ) |
| 20 | Danh Mục Sổ Đỏ Sau Trận | `20_mobile_game_over_deeds.jpg` | Hiển thị tổng tài sản BĐS đã thâu tóm | **XUẤT SẮC** |
| 21 | Nhật Ký Ván Đấu (Drawer Sidebar) | `21_mobile_activity_feed_drawer.jpg` | Trượt từ mép phải 80% chiều rộng, lọc theo tab | **XUẤT SẮC** |
| 22 | Sổ Đỏ Tuyến Ga Xe Lửa (Long Thành) | `22_mobile_title_deed_railroad.jpg` | Biểu phí 1-4 Ga trực quan; nút sở hữu lặp ngoặc đơn | ĐẠT (Lặp ngoặc kép `))`) |
| 23 | Sổ Đỏ Tiện Ích Viễn Thông (Viettel) | `23_mobile_title_deed_utility.jpg` | Cước dịch vụ 1 Ô / 2 Ô / 5G; badge chưa phân quyền | ĐẠT (Lặp ngoặc kép `))`) |
| 24 | Sổ Đỏ Đối Thủ Sở Hữu (Bình Dương) | `24_mobile_title_deed_opponent_owned.jpg` | Thông tin cước dừng chân; badge "Sổ Đỏ Chính Chủ" | ĐẠT (Nhầm góc nhìn chủ sở hữu) |
| 25 | Đấu Giá Phát Mại Nợ (Cưỡng Chế) | `25_mobile_auction_foreclosure.jpg` | Banner đỏ phát mại -30%; tiêu đề phụ bị ép ellipsis | ĐẠT (Co chữ tiêu đề phụ) |
| 26 | Ô Tạm Giam Kiểm Toán & Nộp Phạt | `26_mobile_audit_jail_cell.jpg` | ActionDock hiển thị nút Nộp Phạt 500 Tr. cân đối | **XUẤT SẮC** (Xác nhận lỗi HUD) |
| 27 | Đổ Đôi Xúc Xắc (Được Lượt Tiếp) | `27_mobile_double_dice_roll.jpg` | Huy hiệu `🎲 1 + 1 = 2 (Đôi! 🎉)`, nút Đổ sáng lại | **XUẤT SẮC** |

---

## 2. CHI TIẾT CÁC ĐIỂM SÁNG ĐÃ XÁC NHẬN (VERIFIED STRENGTHS)

1. **Triệt tiêu hoàn toàn va chạm đáy màn hình (IMP-237)**:
   - Cụm `CameraResetPill` ("🧭 Góc Nhìn Chuẩn") được neo tại `left-3 bottom-[calc(5rem+env(safe-area-inset-bottom))]`, tách biệt hoàn toàn khỏi `DiceScoreBadge` và `ActionDock` ở trục giữa. Không còn hiện tượng đè chồng 3 tầng.
2. **Khắc phục triệt để lỗi mất nút CTA thẻ Sự Kiện / Cơ Hội (IMP-237)**:
   - Cả 2 modal Sự Kiện và Cơ Hội đều hiển thị nút `TIẾP TỤC (XÁC NHẬN)` cố định ngoài vùng cuộn (`shrink-0 mt-2`), loại bỏ hoàn toàn tình trạng người chơi bị kẹt không thể bấm tiếp tục trên màn hình mobile.
3. **Các modal tài chính chuyên sâu đạt chuẩn công thái học cao (Screens 13, 15, 18, 26, 27)**:
   - `BotTradeOfferModal` (Screen 13): Bố cục đàm phán 2 chiều trực quan, tỷ lệ chấp thuận rõ nét.
   - `BondIssuanceTab` (Screen 15): 3 gói tín dụng (20% / 40% / 60% NW) trình bày mạch lạc, kiểm tra điều kiện phát hành với checkbox động.
   - `GameRulesModal` (Screen 18): Hệ thống phân tab rõ ràng, thẻ tóm tắt luật chơi ngắn gọn, dễ tiếp cận trên màn hình nhỏ.
   - `Jail / Audit Cell` (Screen 26): Nút nộp tiền bảo lãnh/nộp phạt (⚖️ 500) tự động xuất hiện tại ActionDock cạnh nút xúc xắc, kích thước chuẩn ngón tay (>44px).
   - `Double Dice Roll` (Screen 27): Toast chúc mừng đổ đôi `(Đôi! 🎉)` nổi bật, tự động kích hoạt lượt tung kế tiếp mà không xung đột UI.

---

## 3. DANH MỤC KHUYẾT TẬT UI/UX PHÁT HIỆN TRÊN MOBILE (TỔNG HỢP 27 MÀN HÌNH)

### NHÓM P1 — LỖI TRẢI NGHIỆM NGHIÊM TRỌNG (HIGH SEVERITY)

#### 1. Cắt cụt cực đoan tên đối tác thành `B..` trong Modal Giao Thương P2P
- **Vị trí**: `src/client/ui/modals/trade/trade_partner_strip.tsx#L58-L89`
- **Hiện tượng thực tế** (Ảnh `08_mobile_trade_negotiation.jpg`):
  Dải chọn đối tác hiển thị: `🔥 B.. 14.000`, `⚖️ B.. 18.000`, `🛡️ B.. 12.000`. Người chơi hoàn toàn không biết mình đang đàm phán với Bot AI 1, Bot AI 2 hay Bot AI 3.
- **Nguyên nhân kỹ thuật**:
  Trên màn hình 390px, lưới 3 cột chia đều cho 3 bot mỗi nút chỉ rộng ~80px. Trong 80px này nhồi nhét cả `[Icon]` (16px) + `[Tên đối tác]` + `[Số dư]` (45px font-mono) trên cùng 1 hàng ngang, dẫn tới `partner.name` bị flex ép co lại chỉ còn ~10px, kích hoạt CSS `truncate` biến thành `B..`.
- **Giải pháp**:
  Bảo đảm `formatShortPlayerName` rút ngắn tên thành `Bot 1`, `Bot 2`, `Bot 3`, đồng thời trên `sm:hidden` tổ chức nút 2 tầng: tầng 1 hiển thị Icon + Tên, tầng 2 hiển thị số dư.

#### 2. Thẻ người chơi phá sản bị mất hoàn toàn tên trong Player HUD
- **Vị trí**: `src/client/ui/player_card.tsx#L233-L266`
- **Hiện tượng thực tế** (Ảnh `11_mobile_player_hud_expanded.jpg`):
  Khi người chơi phá sản, thẻ thu gọn chỉ hiển thị: `🔘 4.800 | Nợ 3v | Phá Sản`. Tên người chơi (ví dụ: `Bot AI 3`) bị biến mất hoàn toàn. Người dùng không biết ai vừa bị loại khỏi ván đấu.
- **Nguyên nhân kỹ thuật**:
  Cột trái bọc điều kiện `!player.bankrupt` cho tên người chơi, khiến tên bị ẩn đi khi phá sản.
- **Giải pháp**:
  Bảo tồn tên người chơi luôn hiển thị, chỉ ẩn phần thông tin tài sản/thấu chi không cần thiết khi phá sản.

---

### NHÓM P2 — LỖI NHẤT QUÁN THUẬT NGỮ, CẮT CHỮ & CÔNG THÁI HỌC VI MÔ

#### 3. Cắt chữ tên người chơi trong Player HUD do chưa khử nhãn tiếng Việt
- **Vị trí**: `src/client/ui/ui_helpers.ts#formatShortPlayerName`
- **Hiện tượng thực tế** (Ảnh `01`, `11`, `26`, `27`):
  Tất cả 4 người chơi đều bị cắt cụt tên trong HUD:
  - `Bạn (Chủ P... 15.000`
  - `Bot AI 1 (T... 14.000`
  - `Bot AI 2 (C... 18.000`
  - `Bot AI 3 (C... 12.000`
- **Nguyên nhân kỹ thuật**:
  Hàm `formatShortPlayerName` chỉ xử lý xóa các hậu tố tiếng Anh `(Aggressive|Cautious|Balanced|Passive|Bot)`, không nhận diện các hậu tố tiếng Việt như `(Chủ Phòng)`, `(Dẫn Đầu)`, `(Táo Bạo)`, `(Cẩn Trọng)`, `(Cân Bằng)`. Chuỗi quá dài (>18 ký tự) khiến CSS `truncate` cắt chữ thô bạo.
- **Giải pháp**:
  Mở rộng regex của `formatShortPlayerName` để khử sạch các nhãn tiếng Việt trong ngoặc.

#### 4. Lỗi lặp ngoặc kép `))` trong nút trạng thái Sổ Đỏ (Title Deed)
- **Vị trí**: `src/client/ui/modals/title_deed_modal.tsx`
- **Hiện tượng thực tế** (Ảnh `22_mobile_title_deed_railroad.jpg`, `23_mobile_title_deed_utility.jpg`, `24_mobile_title_deed_opponent_owned.jpg`):
  Nút trạng thái sở hữu hiển thị:
  - `✓ Đã Sở Hữu (Bạn (Chủ Phòng))` -> Double parentheses `))`
  - `✓ Đã Sở Hữu (Bot AI 2 (Cẩn Trọng))` -> Double parentheses `))`
  - `✓ Đã Sở Hữu (Bot AI 1 (Táo Bạo))` -> Double parentheses `))`
- **Nguyên nhân kỹ thuật**:
  Template string sử dụng `✓ Đã Sở Hữu (${ownerName})` trong khi `ownerName` đã chứa sẵn hậu tố trong ngoặc `(Chủ Phòng)` hoặc `(Cẩn Trọng)`.
- **Giải pháp**:
  Dùng `formatShortPlayerName(ownerName)` hoặc chỉ hiển thị `✓ Đã Thuộc Quyền Sở Hữu: ${ownerName}` không bọc thêm dấu ngoặc thừa.

#### 5. Nhầm lẫn ngữ cảnh huy hiệu "SỔ ĐỎ CHÍNH CHỦ" khi xem tài sản của đối thủ
- **Vị trí**: `src/client/ui/modals/title_deed_modal.tsx`
- **Hiện tượng thực tế** (Ảnh `23_mobile_title_deed_utility.jpg`, `24_mobile_title_deed_opponent_owned.jpg`):
  Khi người chơi (Bạn) bấm xem sổ đỏ thuộc sở hữu của `Bot AI 1` hoặc `Bot AI 2`, góc trên thẻ vẫn hiển thị badge màu xanh lá: `SỔ ĐỎ CHÍNH CHỦ`.
- **Nguyên nhân kỹ thuật**:
  Thành phần hiển thị badge tĩnh `SỔ ĐỎ CHÍNH CHỦ` khi ô đất đã có chủ, không phân biệt giữa `ownerId === currentUserId` (chính chủ người xem) và `ownerId !== currentUserId` (thuộc đối thủ).
- **Giải pháp**:
  Nếu `ownerId === currentUserId` hiển thị `SỔ ĐỎ CHÍNH CHỦ` (xanh lá). Nếu là đối thủ hiển thị `ĐÃ CÓ CHỦ` hoặc `TÀI SẢN ĐỐI THỦ` (xanh dương hoặc cam).

#### 6. Lỗi ngắt từ đơn lẻ (Orphan Word) tại tiêu đề Bản Đồ Quy Hoạch Đô Thị
- **Vị trí**: `src/client/ui/modals/masterplan_modal.tsx`
- **Hiện tượng thực tế** (Ảnh `17_mobile_masterplan_modal.jpg`):
  Tiêu đề bị ngắt dòng khó coi:
  `BẢN ĐỒ QUY HOẠCH ĐÔ`  
  `THỊ`  
  Từ "THỊ" bị cô lập một mình trên dòng 2, tạo cảm giác thiếu chuyên nghiệp.
- **Nguyên nhân kỹ thuật**:
  Cỡ chữ tiêu đề quá lớn hoặc padding header chiếm dụng chiều ngang trên màn hình 390px.
- **Giải pháp**:
  Tinh chỉnh cỡ chữ header thành `text-xs sm:text-sm` hoặc thêm `whitespace-nowrap sm:whitespace-normal` kết hợp cân bằng padding.

#### 7. Co cụt cột giá gốc thành 3 dòng trong Modal Mua Lại Dự Án (Compulsory Buyout)
- **Vị trí**: `src/client/ui/modals/compulsory_buyout_modal.tsx#L191-L195`
- **Hiện tượng thực tế** (Ảnh `14_mobile_compulsory_buyout.jpg`):
  Cột phụ góc phải hiển thị:
  `GIÁ`  
  `GỐC`  
  `1.000`  
  Bị ép co lại thành 3 hàng dọc vì tên dự án bên trái `Bình Dương (Tổ Hợp Thể Thao & Golf)` chiếm gần hết không gian `flex justify-between`.
- **Giải pháp**:
  Thêm `shrink-0 whitespace-nowrap text-right ml-2` vào khối Giá Gốc.

#### 8. Sai lệch thuật ngữ cấp công trình C3 trong Sàn Đấu Giá
- **Vị trí**: `src/client/ui/modals/auction_district_card.tsx#L184`
- **Hiện tượng thực tế** (Ảnh `04_mobile_auction_live.jpg`, `25_mobile_auction_foreclosure.jpg`):
  Thanh biểu phí thuê mini trong Sàn Đấu Giá hiển thị nhãn: `C3 (KHÁCH SẠN)`.
- **Giải pháp**:
  Sửa nhãn tại dòng 184 thành `C3 (RESORT/TTTM)` để đồng bộ 100% với Sổ Đỏ.

#### 9. Cắt chữ tên đối thủ trong danh sách người tham gia đấu giá
- **Vị trí**: `src/client/ui/modals/auction_modal.tsx#L313`
- **Hiện tượng thực tế** (Ảnh `04_mobile_auction_live.jpg`, `25_mobile_auction_foreclosure.jpg`):
  Dòng hiển thị đại gia tham gia hiển thị `Bot AI 2 (Cẩn Trọn...` do giới hạn `max-w-[100px]`.
- **Giải pháp**:
  Dùng `formatShortPlayerName` đã chuẩn hóa tiếng Việt để loại bỏ nhãn tính cách, hiển thị vừa vặn `Bot AI 2`.

---

### NHÓM P3 — HOÀN THIỆN THẨM MỸ (POLISH)

#### 10. Thiếu đơn vị tiền tệ "Tr." trong Danh Mục BĐS & Bản Đồ Quy Hoạch
- **Vị trí**: `src/client/ui/modals/property_portfolio_modal.tsx` & `masterplan_modal.tsx`
- **Hiện tượng thực tế** (Ảnh `07_mobile_property_portfolio.jpg`, `17_mobile_masterplan_modal.jpg`):
  Dòng thông số hiển thị `Tiền Thuê: 60`, `Giá: 600` (thiếu chữ `Tr.` trong khi các màn hình khác đều có `600 Tr.` hoặc `VNĐ`).
- **Giải pháp**:
  Bổ sung hậu tố `Tr.` vào giá trị hiển thị để đạt tính nhất quán 100% toàn bộ game.

#### 11. Bất nhất ký hiệu đơn vị `15.000k` trong Báo Cáo FinTech Sau Trận
- **Vị trí**: `src/client/ui/modals/game_over_modal.tsx` (Tab FinTech)
- **Hiện tượng thực tế** (Ảnh `19_mobile_game_over_fintech.jpg`):
  Xu hướng tăng trưởng hiển thị `15.000k -> 48.500`. Xuất hiện chữ `k` đơn độc không đúng hệ thống đơn vị triệu đồng (Tr.) của VTCOON.
- **Giải pháp**:
  Đồng bộ thành `15.000 Tr. -> 48.500 Tr.` hoặc `15.000 -> 48.500`.

#### 12. Khoảng cách chữ tiêu đề Sàn HOSE bị dãn rộng
- **Vị trí**: `src/client/ui/modals/hose_modal.tsx#L177`
- **Hiện tượng thực tế** (Ảnh `09_mobile_hose_stock_exchange.jpg`):
  Tiêu đề sử dụng `font-mono tracking-wide` khiến các từ bị cách xa nhau tạo cảm giác như có 2 dấu cách.
- **Giải pháp**:
  Bỏ `font-mono tracking-wide` ở tiêu đề chính, chuyển về font sans bold đồng bộ với các modal khác.

---

## 4. KẾT LUẬN & ĐỀ XUẤT LỘ TRÌNH THỰC HIỆN

Toàn bộ 27 màn hình vật lý cho thấy giao diện VTCOON trên Mobile hiện đã có nền tảng rất vững chắc (Zero game-breaking bugs, de-collision thành công, modal không bị kẹt nút CTA).

Để xử lý dứt điểm các vấn đề trên mà vẫn tuân thủ nghiêm ngặt **Scope Confinement** và **LOC Budgets**, có 2 phương án:

1. **Phương án 1 (Gộp vào IMP-238 Revision 3.0 — Khuyến nghị)**:
   - IMP-238 đã được cấu trúc cho vi mô công thái học và typography mobile.
   - Bổ sung thêm các drop-in snippets nhỏ cho:
     + Lặp ngoặc kép `))` trong `title_deed_modal.tsx`
     + Cột Giá Gốc co cụt trong `compulsory_buyout_modal.tsx`
     + Tiêu đề rớt từ "THỊ" trong `masterplan_modal.tsx`
     + Ký hiệu `15.000k` trong `game_over_modal.tsx`
   - Cập nhật Plan lên Revision 3.0, đưa qua `plan-griller` duyệt `HARDENED_APPROVED`, sau đó xin phê duyệt của User tại Human Review Gate.
2. **Phương án 2 (Tách làm 2 ticket song song)**:
   - Giữ nguyên IMP-238 (Revision 2.1) chỉ giải quyết 7 task cốt lõi đã được `plan-griller` duyệt `HARDENED_APPROVED`.
   - Tạo ticket tiếp theo IMP-239 (Modals & Deeds Micro-Typography Polish) để xử lý các phát hiện mới ở Screens 14, 17, 19, 22, 23, 24.
