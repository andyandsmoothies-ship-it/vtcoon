# [KẾ HOẠCH CẢI TIẾN IMP-71] Tối Ưu Ánh Sáng Ban Ngày, Tái Cấu Trúc Skyline Bitexco Chuẩn Kiến Trúc Sư, Cắt Giảm 50% Xe Hơi & Đại Tu Tranh Nền 4 Góc Và Ô Đặc Biệt

> **Trạng thái**: 🟢 **ĐÃ PHÊ DUYỆT & THỰC THI HOÀN TẤT**
> **Mã cải tiến**: IMP-71
> **Mục tiêu**:
> 1. Tối ưu quang cảnh ban ngày: Hạ độ chói mặt trời `sunIntensity` từ 0.92 xuống 0.78, chuyển màu môi trường sang `#F0F9FF` dịu mắt, tăng độ tương phản viền chữ tên ô cờ (`lineWidth = 3.5` màu than đen `#050814`) giúp đọc rõ 100% tên các tỉnh thành ở mọi góc nhìn.
> 2. Quy hoạch kiến trúc cụm Bitexco & Cao ốc xung quanh: Bổ sung khối đế thương mại Podium vát cánh sen và Quảng trường Bitexco Plaza lát đá rẻ quạt với bồn cây xanh; nâng cấp 10 tháp cao ốc thành 4 trường phái kiến trúc thương mại Quận 1 (lăng kính vát góc, tháp đôi giật cấp vườn treo, tháp kính đường cong, tháp chóp vương miện) thay cho các khối hộp xám đơn điệu.
> 3. Cắt giảm đúng 50% lượng xe hơi: Giảm `MICRO_VEHICLES` từ 7 xe xuống 3 xe di chuyển giãn cách lớn trên đại lộ và cầu; loại bỏ xe đậu tĩnh dư thừa trên vỉa hè để cảnh quan thoáng đãng.
> 4. Đại tu toàn diện tranh nền minh họa nghệ thuật cho 4 góc và các ô đặc biệt: Bổ sung bộ tranh minh họa chuẩn cờ bàn thương mại AAA cho Ô 00 (Khởi Hành), Ô 02/17/33 (Phiếu Cơ Hội), Ô 04 (Lệ Phí Đăng Ký Đất Đai), Ô 07/22/36 (Thị Trường), Ô 10 (Trạm Kiểm Toán & Thanh Tra), Ô 20 (Nghỉ Dưỡng Vô Ưu), Ô 30 (Lệnh Thanh Tra Thuế), Ô 38 (Sàn HOSE).

---

## 1. BỐI CẢNH & PHÂN TÍCH YÊU CẦU

1. **Ánh sáng ban ngày gây chói làm mờ tên ô**:
   - Hiện trạng: `sunIntensity = 0.92` kết hợp ambient và specular highlight khiến bề mặt thẻ bị lóa trắng, làm các dải màu pastel và chữ tên ô bị giảm độ tương phản.
   - Giải pháp: Điều chỉnh `sunIntensity = 0.78`, `ambientColor = '#F0F9FF'`, mặt thẻ cờ bàn `roughness = 0.98`, viền chữ đúp than đen đanh nét.
2. **Cụm cao ốc Bitexco chưa chuẩn kiến trúc sư**:
   - Hiện trạng: 10 tòa tháp xung quanh Bitexco chỉ là các khối hộp chữ nhật màu xám giống hệt nhau có mái màu cam.
   - Giải pháp: Thiết kế theo 4 trường phái kiến trúc đặc trưng của CBD Sài Gòn với khối đế thương mại, vườn treo trên cao và quảng trường đi bộ.
3. **Mật độ xe hơi quá dày**:
   - Hiện trạng: 7 xe di chuyển trên 2 làn hẹp thường xuyên dồn cục trên mặt cầu.
   - Giải pháp: Cắt giảm xuống 3 xe với cự ly giãn cách pha lớn (offset gap >= 0.25).
4. **Các ô đặc biệt và 4 góc thiếu tranh nền minh họa**:
   - Hiện trạng: Chỉ có các ô tài sản tỉnh thành có tranh ảnh cảnh quan (`tile_xx.webp`), trong khi các ô 4 góc, Cơ Hội, Thị Trường, Đăng Ký Đất Đai chỉ vẽ khối bệt và icon bé tí.
   - Giải pháp: Triển khai 8 tác phẩm tranh nghệ thuật minh họa chất lượng cao nạp vào `public/assets/tiles/` và tích hợp vào Canvas texture của bàn cờ.

---

## 2. QUY TRÌNH 3 TRẠM (3-STATION PIPELINE)

- **Trạm 1 (RED Contract Test)**: `tests/contracts/imp71_lighting_skyline_traffic_and_special_tile_art.test.ts` (34 atomic tests, 4 facets). Chứng minh RED sạch sẽ (21 failed | 13 passed) trước khi sửa mã nguồn.
- **Trạm 2 (GREEN Implementation)**: Cập nhật toàn bộ các tệp mã nguồn và đồ họa. 34/34 tests PASS; 174/174 test suites toàn hệ thống PASS (2.966 tests); `npm run gate:quick` PASS 0 lỗi.
- **Trạm 3 (Thẩm Định Độc Lập)**: `spec-reviewer` và `game-3d-visual-critic` kiểm tra trên đĩa vật lý và hình ảnh chụp từ Edge CDP.
