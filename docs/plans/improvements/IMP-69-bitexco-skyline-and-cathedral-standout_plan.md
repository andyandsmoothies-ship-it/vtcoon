# [KẾ HOẠCH CẢI TIẾN IMP-69] Xóa Bưu Điện Trung Tâm Trước Nhà Thờ & Tái Thiết Kế Cụm Tài Chính 10 Tòa Nhà Bao Quanh Tháp Bitexco Landmark

> **Trạng thái**: 🟢 **ĐÃ PHÊ DUYỆT & THỰC THI HOÀN TẤT**
> **Mã cải tiến**: IMP-69
> **Mục tiêu**:
> 1. Gỡ bỏ hoàn toàn Bưu điện Trung tâm trước Nhà Thờ Đức Bà, để Nhà Thờ đứng độc lập, thoáng đãng giữa Quảng trường Công xã Paris và Tượng Đức Mẹ Hòa Bình.
> 2. Giảm từ 16 tòa tháp đặc nghẽn xuống đúng 10 tòa cao ốc thương mại giật cấp bao bọc quanh Tháp Tài chính Bitexco (Hero Landmark trung tâm) với sân đỗ trực thăng chìa ra hướng sông Sài Gòn.

---

## 1. BỐI CẢNH & PHÂN TÍCH KỸ THUẬT

1. **Xóa Bưu Điện Trung Tâm Trước Nhà Thờ**:
   - Phản hồi từ người dùng: *"xóa cái bưu điện trung tâm trước nhà thờ"*
   - Giải pháp: Gỡ bỏ toàn bộ component `SaigonCentralPostOfficeFallback` và `saigon-central-post-office` khỏi `diorama_heritage_district.tsx`.
   - Kết quả: Nhà Thờ Đức Bà đứng độc lập, uy nghiêm ở trung tâm khu di sản. Mặt tiền hướng thẳng ra Quảng trường Công xã Paris với bồn hoa tròn và Tượng Đức Mẹ Hòa Bình cẩm thạch trắng.

2. **Cụm 10 Tòa Nhà Bao Quanh Tháp Bitexco Landmark**:
   - Phản hồi từ người dùng: *"khu 16 tòa nhà nên thiết kế lại khoảng 10 tòa nhà, nếu được hãy thiết kế tòa nhà bitexco cùng các tòa xung quanh"*
   - Hiện trạng trước cải tiến: Cụm 16 tòa nhà cao ốc vuông vức xếp thành lưới 4x4 dày đặc, chiều cao 2.3m - 2.8m, che lấp hoàn toàn tháp Bitexco (cao 1.2m nằm thụt vào trong).
   - Giải pháp:
     * Nâng cấp Tháp Bitexco: Đặt tại trung tâm phân khu tài chính `[-4.5, 0.16, -4.4]`, nâng chiều cao lên ~2.95m (tháp cao nhất phân khu), thân tháp búp sen sapphire, đài quan sát Saigon Skydeck, sân đỗ trực thăng Helipad `(0.38, 1.68, 0)` chìa ra hướng sông Sài Gòn, kim thu lôi và đèn chớp đỏ 1.3Hz.
     * Tinh gọn thành đúng 10 tòa cao ốc (`HIGHRISE_CONFIGS.length === 10`): Bố trí theo hình chữ U mở về hướng sông, chiều cao giật cấp giảm dần từ sau ra trước (Hàng Bắc: 2.3m - 2.6m -> Cánh Tây/Đông: 1.6m - 2.0m -> Hàng Nam: 1.3m - 1.5m).
     * Khoảng hở giữa Bitexco và các tòa xung quanh đạt >= 1.0m, tạo quảng trường tài chính nội khu rộng mở.

---

## 2. KIẾN TRÚC MÃ NGUỒN & PHẠM VI TÁC ĐỘNG

- `src/client/3d/diorama/diorama_heritage_district.tsx`: Gỡ bỏ hoàn toàn `SaigonCentralPostOfficeFallback`.
- `src/client/3d/diorama/diorama_highrise_blocks.tsx`: Cập nhật `HIGHRISE_CONFIGS` thành đúng 10 tòa nhà giật cấp hình chữ U.
- `src/client/3d/diorama/diorama_skyline.tsx`: Nâng cấp Tháp Bitexco Landmark tại `[-4.5, 0.16, -4.4]` với helipad chìa hướng sông và vóc dáng vươn cao.
- `docs/domain/gotchas.md`: Bổ sung Gotcha #92.

---

## 3. QUY TRÌNH 3 TRẠM (3-STATION PIPELINE)

1. **Trạm 1 (RED Contract Test)**:
   - `tests/contracts/imp69_bitexco_skyline_and_cathedral_standout.test.ts` (47 atomic tests, 4 facets).
   - Chứng minh thất bại rõ ràng trước khi sửa mã nguồn (7 failed | 58 passed).
2. **Trạm 2 (GREEN Implementation)**:
   - Hoàn tất cập nhật mã nguồn tại `src/**`.
   - 47/47 tests contract IMP-69 PASS; 172/172 test suites toàn hệ thống PASS (2.879 tests, 0 failures).
   - `npm run gate:quick` PASS với 0 lỗi (TypeScript strict, ESLint, asset budget 1.11MB/2.5MB).
3. **Trạm 3 (Independent Review & Visual Audit)**:
   - `spec-reviewer`: Độc lập đối chiếu mã nguồn và đĩa vật lý, duyệt 100% khớp hợp đồng kiểm thử (VERDICT: APPROVED).
   - `game-3d-visual-critic`: Độc lập chấm điểm thị giác trên 3 góc ảnh chụp thực tế từ Edge CDP, đạt phán quyết SHIP (8.8/10 AAA standard).
