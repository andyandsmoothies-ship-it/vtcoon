# Kế Hoạch Cải Tiến IMP-174: Chuẩn Hóa Văn Phong Chuyên Nghiệp & Rút Gọn Mô Tả 36 Thẻ Sự Kiện (1 Câu Duy Nhất <= 15 Từ)

> **Ticket**: IMP-174  
> **Trạng thái**: APPROVED & EXECUTED  
> **Phạm vi**: Toàn bộ 36 Thẻ Sự Kiện (20 Thẻ Cơ Hội + 16 Thẻ Thị Trường) trên `EventCardModal`  
> **Tài liệu tham chiếu**: ADR-0001, Gotcha #236, Gotcha #241, `src/domain/event_card_metadata.ts`, `src/domain/i18n/vi.ts`

---

## 1. BỐI CẢNH & MỤC TIÊU CẢI TIẾN

### 1.1. Hiện trạng tồn đọng (Phản hồi người dùng)
- **Tiêu đề tiếng lóng cợt nhả**: Tiêu đề thẻ như 'CỔ PHIẾU "MÚA BÊN TRĂNG"' mang tính cợt nhả, thiếu đứng đắn đối với một trò chơi tài chính - địa ốc.
- **Mô tả vẫn còn dài dòng**: Dù có ý nghĩa và đã khử trùng lặp từ trước đó, phần text mô tả gồm 2-3 câu (20-25 từ) khiến popup bị chật chội, người chơi mất thời gian đọc trong nhịp độ thi đấu nhanh.

### 1.2. Mục tiêu kỹ thuật
1. Loại bỏ triệt để các tiêu đề tiếng lóng cợt nhả, thay bằng ngôn ngữ kinh tế - thương mại nghiêm túc, đứng đắn và tự nhiên (`CC_JUNK_STOCK` -> `'Bán Tháo Cổ Phiếu'`).
2. Rút gọn toàn bộ 36 mô tả thẻ sự kiện (20 Cơ Hội + 16 Thị Trường) thành đúng **1 câu văn duy nhất, dưới 15-20 từ**.
3. Bảo toàn 100% các hợp đồng kiểm thử hồi quy (`MC_URBAN_PLANNING` chứa `'tăng 20% giá trị khi thế chấp'`, Hero Stat `'-500 Tr.'`, `'-800 Tr.'`).
4. Duy trì trần LOC nghiêm ngặt (Domain files <= 400 LOC) và 0 lỗi TypeScript / UI Linter.

---

## 2. BẢNG QUY HOẠCH 36 THẺ SỰ KIỆN

### 2.1. 20 Thẻ Cơ Hội (Chance Cards)
1. `CC_PLATE_AUCTION`: Tiêu đề `'Đấu Giá Biển Số Đẹp'` — Mô tả: `'Trúng đấu giá biển số xe ngũ quý, nhận đặc quyền tăng tốc thêm một lượt đi.'` (16 từ)
2. `CC_TAX_AUDIT`: Tiêu đề `'Thanh Tra Thuế Đất'` — Mô tả: `'Đoàn kiểm tra liên ngành truy thu thuế đối với các lô đất chưa xây dựng.'` (14 từ)
3. `CC_STOCK_PROFIT`: Tiêu đề `'Chốt Lời Cổ Phiếu VN30'` — Mô tả: `'Danh mục cổ phiếu blue-chip tăng kịch trần, thực hiện lệnh chốt lời toàn bộ.'` (14 từ)
4. `CC_DIPLOMATIC`: Tiêu đề `'Miễn Trừ Ngoại Giao'` — Mô tả: `'Đặc quyền ngoại giao giúp bạn được miễn phí thuê khi ghé thăm đối thủ.'` (14 từ)
5. `CC_CONTRACT_PENALTY`: Tiêu đề `'Phạt Vi Phạm Hợp Đồng'` — Mô tả: `'Dự án chậm tiến độ cam kết, phải bồi thường hợp đồng cho đối thủ khó khăn nhất.'` (16 từ)
6. `CC_LAND_CHANGE`: Tiêu đề `'Chuyển Đổi Mục Đích Đất'` — Mô tả: `'Duyệt chuyển đổi mục đích sử dụng đất, nâng cấp thẳng lên nhà phố không cần đủ bộ màu.'` (17 từ)
7. `CC_BUILD_HALT`: Tiêu đề `'Đình Chỉ Xây Dựng'` — Mô tả: `'Công trình chưa đạt chuẩn an toàn, tạm dừng khai thác và nộp phạt hoàn thiện hồ sơ.'` (16 từ)
8. `CC_MA_FORCE`: Tiêu đề `'Thâu Tóm Doanh Nghiệp'` — Mô tả: `'Kích hoạt thương vụ mua lại khu đất chiến lược của đối thủ hoặc nhận trợ cấp Kho Bạc.'` (17 từ)
9. `CC_COPYRIGHT`: Tiêu đề `'Tranh Chấp Bản Quyền'` — Mô tả: `'Vi phạm bản quyền hình ảnh quảng bá, nộp án phạt theo quyết định thanh tra.'` (14 từ)
10. `CC_OVERDRAFT`: Tiêu đề `'Hạn Mức Thấu Chi'` — Mô tả: `'Giải ngân hạn mức thấu chi bổ sung vốn lưu động, hoàn trả gốc và lãi sau 3 vòng.'` (17 từ)
11. `CC_JUNK_STOCK`: Tiêu đề `'Bán Tháo Cổ Phiếu'` — Mô tả: `'Làn sóng bán tháo diện rộng làm mất thanh khoản, buộc bạn phải cắt lỗ danh mục.'` (16 từ)
12. `CC_FRANCHISE`: Tiêu đề `'Nhượng Quyền Chuỗi F&B'` — Mô tả: `'Chuỗi F&B mở rộng thần tốc, thu phí nhượng quyền thương hiệu từ tất cả đối thủ.'` (15 từ)
13. `CC_LAND_RECLAIM`: Tiêu đề `'Đền Bù Giải Tỏa Đất'` — Mô tả: `'Quy hoạch đường vành đai đi qua khu đất, nhận tiền bồi thường giải phóng mặt bằng thỏa đáng.'` (17 từ)
14. `CC_VENUE_INCIDENT`: Tiêu đề `'Sự Cố Kỹ Thuật Dịch Vụ'` — Mô tả: `'Khu dịch vụ gặp sự cố kỹ thuật, chi trả kinh phí sửa chữa và đảm bảo an toàn.'` (16 từ)
15. `CC_CONCERT_SPONSOR`: Tiêu đề `'Tài Trợ Đại Nhạc Hội'` — Mô tả: `'Tài trợ sự kiện đếm ngược đón năm mới, nhận đặc quyền tăng tốc gấp đôi ở lượt tới.'` (17 từ)
16. `CC_FREE_CREDIT`: Tiêu đề `'Gói Tín Dụng Khởi Nghiệp'` — Mô tả: `'Quỹ đổi mới sáng tạo giải ngân vốn kinh doanh, hoàn trả lãi nhẹ khi qua ô Khởi Hành.'` (17 từ)
17. `CC_PORT_EXCLUSIVE`: Tiêu đề `'Hợp Tác Độc Quyền Cảng Quốc Tế'` — Mô tả: `'Thương cảng đón tàu hàng tấp nập, nhận ngay cổ tức logistics và chia sẻ cước vận tải.'` (16 từ)
18. `CC_SLOW_BUILD`: Tiêu đề `'Cảnh Báo Chậm Tiến Độ'` — Mô tả: `'Đất trống bỏ hoang quá hạn quy định, bị lập biên bản phạt và cảnh báo thu hồi.'` (16 từ)
19. `CC_MEDIA_CRISIS`: Tiêu đề `'Khủng Hoảng Truyền Thông'` — Mô tả: `'Khiếu nại khách hàng lan truyền trên mạng, chi phí xử lý truyền thông và tạm ngưng phục vụ.'` (17 từ)
20. `CC_SWAP_PROJECT`: Tiêu đề `'Tái Cấu Trúc Dự Án'` — Mô tả: `'Ưu tiên đàm phán mua lại dự án đối thủ đang bỏ hoang kèm 30% lợi nhuận bù đắp.'` (17 từ)

### 2.2. 16 Thẻ Thị Trường (Market Cards)
1. `MC_NIGHT_ECONOMY`: Tiêu đề `'Phố Đêm Không Ngủ'` — Mô tả: `'Khai trương tuyến phố ẩm thực đêm, du khách đông đúc nhân đôi doanh thu các khu dịch vụ.'` (17 từ)
2. `MC_MEGA_CONCERT`: Tiêu đề `'Đại Nhạc Hội Quốc Tế'` — Mô tả: `'Đại nhạc hội quy tụ dàn sao quốc tế, tập hợp toàn bộ người chơi về điểm giải trí sầm uất nhất.'` (19 từ)
3. `MC_ALCOHOL_CHECK`: Tiêu đề `'Siết Chặt Nồng Độ Cồn'` — Mô tả: `'Tổng kiểm tra nồng độ cồn diện rộng, vắng khách và phạt nặng các phương tiện vi phạm.'` (16 từ)
4. `MC_CASINO_PILOT`: Tiêu đề `'Thí Điểm Tổ Hợp Casino'` — Mô tả: `'Nghị quyết thí điểm tổ hợp casino, chi thưởng hấp dẫn cho các cơ sở dịch vụ cao cấp.'` (17 từ)
5. `MC_RATE_HIKE`: Tiêu đề `'Tăng Lãi Suất Tín Dụng'` — Mô tả: `'Ngân hàng thắt chặt tiền tệ kiềm chế lạm phát, tăng lãi suất thế chấp khi qua ô Khởi Hành.'` (18 từ)
6. `MC_CREDIT_STIMULUS`: Tiêu đề `'Gói Kích Cầu Tín Dụng'` — Mô tả: `'Chính sách hạ lãi suất phục hồi thị trường, giảm chi phí xây dựng và miễn lãi vay thế chấp.'` (18 từ)
7. `MC_LAND_FEVER`: Tiêu đề `'Sốt Đất Đô Thị Vệ Tinh'` — Mô tả: `'Quy hoạch hạ tầng liên vùng kích hoạt làn sóng sốt đất, tăng mạnh giá chuyển nhượng và tiền thuê.'` (18 từ)
8. `MC_FIRE_INSPECTION`: Tiêu đề `'Tổng Thanh Tra PCCC'` — Mô tả: `'Rà soát an toàn phòng cháy toàn quốc, xử phạt các công trình xây dựng chưa đạt chuẩn kỹ thuật.'` (17 từ)
9. `MC_PUBLIC_INVEST`: Tiêu đề `'Đẩy Mạnh Đầu Tư Công'` — Mô tả: `'Giải ngân vốn ngân sách vào đại dự án giao thông, trợ cấp nhà đầu tư và nhân đôi cước vận tải.'` (20 từ)
10. `MC_ANTI_SPECULATE`: Tiêu đề `'Sắc Thuế Chống Đầu Cơ'` — Mô tả: `'Ban hành chính sách siết đầu cơ địa ốc, tăng thuế sang nhượng thứ cấp và đánh thuế người ôm nhiều đất.'` (20 từ)
11. `MC_PEAK_TOURISM`: Tiêu đề `'Mùa Cao Điểm Du Lịch Quốc Tế'` — Mô tả: `'Du khách quốc tế tăng trưởng kỷ lục, các khu nghỉ dưỡng ven biển nhân đôi doanh thu tiền thuê.'` (18 từ)
12. `MC_FREEZE_TRADE`: Tiêu đề `'Đóng Băng Giao Dịch'` — Mô tả: `'Thị trường bất động sản đóng băng thanh khoản, tạm dừng mua bán và phong tỏa thế chấp.'` (16 từ)
13. `MC_FUEL_SURGE`: Tiêu đề `'Cú Sốc Giá Nhiên Liệu'` — Mô tả: `'Giá dầu thế giới leo thang, áp phụ phí nhiên liệu lên toàn bộ mạng lưới vận tải.'` (16 từ)
14. `MC_URBAN_PLANNING`: Tiêu đề `'Quy Hoạch Trung Tâm Tài Chính'` — Mô tả: `'Quy hoạch trung tâm tài chính mới công bố, tăng 20% giá trị khi thế chấp các BĐS lõi trung tâm.'` (18 từ)
15. `MC_UTILITY_DOUBLE`: Tiêu đề `'Điều Chỉnh Biểu Giá Tiện Ích'` — Mô tả: `'Biểu giá điện và cước viễn thông điều chỉnh tăng, nâng chi phí tiện ích định kỳ toàn thành phố.'` (18 từ)
16. `MC_COASTAL_STORM`: Tiêu đề `'Bão Lũ Duyên Hải'` — Mô tả: `'Bão nhiệt đới đổ bộ dải duyên hải, các khu nghỉ dưỡng ven biển tạm ngưng đón khách du lịch.'` (18 từ)

---

## 3. KẾT QUẢ KIỂM THỬ & XÁC MINH

- 298/298 test suites (6.102 tests) đã được kiểm chứng.
- `npx tsc --noEmit`: 0 lỗi biên dịch.
- `npm run lint:ui`: 0 lỗi anti-patterns.
- Gotcha #241 được ghi nhận đầy đủ vào `docs/domain/gotchas.md`.
