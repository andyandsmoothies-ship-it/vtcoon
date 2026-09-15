# [KẾ HOẠCH CẢI TIẾN IMP-68] Giải Phóng Không Gian Nhà Thờ Đức Bà (Quảng Trường Công Xã Paris & Bưu Điện Trung Tâm) & Đại Tu Cụm Cao Ốc Tài Chính Tây Bắc (Xóa Bỏ Khối Xanh Đậm)

> **Trạng thái**: 🟢 **ĐÃ PHÊ DUYỆT & THỰC THI HOÀN TẤT**
> **Mã cải tiến**: IMP-68
> **Mục tiêu**:
> 1. Giải phóng không gian xung quanh Nhà Thờ Đức Bà, xóa bỏ tình trạng bị bao vây ngột ngạt bởi nhà phố san sát; tái lập quần thể di sản thực tế: Quảng trường Công xã Paris, Tượng Đức Mẹ Hòa Bình, và Bưu điện Trung tâm Sài Gòn (vàng thuộc địa, cửa chớp xanh ngọc, đồng hồ lịch sử).
> 2. Đại tu cụm 16 tòa cao ốc Tây Bắc: Triệt tiêu hoàn toàn khối màu xanh đậm (#0284C7) thô cứng; thay bằng kiến trúc cao ốc văn phòng thương mại hiện đại với mặt đứng chia ô kính/đá xám ngọc trai, ban công vườn mây (sky terrace) và đỉnh tháp vát khối penthouse champagne.

---

## 1. BỐI CẢNH & PHÂN TÍCH KỸ THUẬT

1. **Nhà Thờ Đức Bà Bị Bao Vây Quá Nhiều Nhà**:
   - Phản hồi từ người dùng: *"riêng nhà thờ đức bà bị bao vây bởi quá nhiều tòa nhà, không giống thực tế."*
   - Hiện trạng trước cải tiến: 24 căn nhà ống Chợ Lớn (`CHO_LON_SHOPHOUSES`) xếp thành cụm dày đặc bao sát sàn sạt lưng và sườn Nhà thờ Đức Bà (khoảng cách chỉ ~0.2m - 0.5m), cùng căn biệt thự vườn cũ phía sau tại `[-4.5, 0.025, 4.2]` tạo cảm giác nhà thờ bị bóp nghẹt giữa khu dân cư lộn xộn.
   - Hiện thực đời sống tại TP.HCM: Nhà thờ Đức Bà nằm trên gò đất trung tâm độc lập, phía trước là Quảng trường Công xã Paris và Tượng Đức Mẹ Hòa Bình, bên phải là Bưu điện Trung tâm Sài Gòn, xung quanh là các trục đại lộ rộng lớn (Lê Duẩn, Đồng Khởi, Nguyễn Du) và rừng cây cổ thụ Công viên 30/4.
   - Giải pháp:
     * Dời 16 căn nhà ống Nam lùi sâu về phía nam (Z >= 5.35m, cách Nhà thờ Z = 3.65m tới >= 1.70m).
     * Dời 8 căn nhà ống Tây dạt hẳn sang đại lộ Tây (X = -5.6m, cách Nhà thờ X = -4.3m tới >= 1.30m).
     * Xóa bỏ căn biệt thự vườn cũ tại `[-4.5, 0.025, 4.2]` trong `diorama_skyline.tsx`.
     * Tích hợp `Bưu điện Trung tâm Sài Gòn` (`saigon-central-post-office`) với tông màu vàng hoàng yến (#FDE047/#FEF3C7), mái Mansard đất nung (#B45309), cửa chớp xanh (#065F46) và tháp đồng hồ lịch sử.
     * Tích hợp `Quảng trường Công xã Paris` (`cong-xa-paris-plaza`) với hoa viên thảm cỏ tròn (#166534/#15803D) và bệ đá cẩm thạch Tượng Đức Mẹ Hòa Bình (#CBD5E1/#F8FAFC).

2. **Chuỗi Tòa Nhà Cao Tầng Màu Xanh Đậm Nhìn Xấu, Không Tưởng Tượng Được Là Gì**:
   - Phản hồi từ người dùng: *"ngoài ra có 1 chuỗi các tòa nhà cao tầng màu xanh đậm nhìn rất xấu, không tưởng tượng được là gì"*
   - Hiện trạng trước cải tiến: Cụm 16 tòa tháp Tây Bắc (`DioramaHighriseBlocks`) bị tô phủ một màu xanh đơn sắc (#0284C7) đồng nhất, bề mặt phẳng lì, tạo thành một cụm khối hộp bí ẩn giống hệt đồ chơi nhựa chưa hoàn thiện.
   - Giải pháp:
     * Nâng cấp `drawHighriseCanvas` trong `facade_texture_generator.ts`: tạo hệ khung cột/dầm phân vị bằng đá xám/trắng thanh lịch (#F8FAFC, #E2E8F0, #CBD5E1, #94A3B8) xen kẽ lưới cửa sổ kính kiến trúc phản quang thiên thanh (#93C5FD, #BAE6FD, #E0F2FE).
     * Vật liệu thân tháp chuyển sang màu trung tính `#FFFFFF` để texture thể hiện trọn vẹn chi tiết kiến trúc chân thực.
     * Bổ sung vườn chân mây (sky terrace) xanh lá (#15803D) tại các tầng giật cấp và đỉnh tháp kim loại champagne (#F59E0B), gợi nhớ trung tâm tài chính hiện đại ven sông Sài Gòn.

---

## 2. KIẾN TRÚC MÃ NGUỒN & PHẠM VI TÁC ĐỘNG (BLAST RADIUS)

- `src/client/3d/diorama/diorama_shophouse_blocks.tsx`: Tái cấu trúc tọa độ 24 căn nhà ống Chợ Lớn lùi biên, giải phóng khoảng cách an toàn >= 1.30m quanh Nhà thờ Đức Bà.
- `src/client/3d/diorama/diorama_heritage_district.tsx`: Tích hợp Bưu điện Trung tâm Sài Gòn (`saigon-central-post-office`) và Quảng trường Công xã Paris (`cong-xa-paris-plaza`).
- `src/client/3d/diorama/diorama_skyline.tsx`: Xóa bỏ căn biệt thự vườn cũ tại `[-4.5, 0.025, 4.2]`.
- `src/client/3d/facade_texture_generator.ts`: Nâng cấp texture mặt dựng cao ốc sang hệ khung đá xám/trắng và kính thiên thanh.
- `src/client/3d/diorama/diorama_highrise_blocks.tsx`: Chuyển màu thân sang `#FFFFFF`, tích hợp vườn mây và đỉnh kim loại champagne.
- `docs/domain/gotchas.md`: Bổ sung Gotcha #91.

---

## 3. QUY TRÌNH 3 TRẠM (3-STATION PIPELINE)

1. **Trạm 1 (RED Contract Test)**:
   - `tests/contracts/imp68_cathedral_breathing_room_and_financial_skyline.test.ts` (78 atomic tests, 4 facets).
   - Chứng minh thất bại rõ ràng trước khi sửa mã nguồn (13 failed | 65 passed).
2. **Trạm 2 (GREEN Implementation)**:
   - Hoàn tất chỉnh sửa mã nguồn tại `src/**`.
   - Toàn bộ 78 tests hợp đồng PASS, 171/171 test suites toàn hệ thống PASS (2.850 tests passed, 0 failures).
   - `npm run gate:quick` PASS với 0 lỗi (TypeScript strict, ESLint, UI Lint, jscpd, 3D asset budget).
3. **Trạm 3 (Independent Review & Visual Audit)**:
   - `spec-reviewer`: Độc lập đối chiếu mã nguồn và đĩa vật lý, duyệt 100% khớp hợp đồng kiểm thử (VERDICT: APPROVED).
   - `game-3d-visual-critic`: Độc lập chấm điểm thị giác trên 3 góc ảnh chụp thực tế từ Edge CDP, đạt phán quyết SHIP (9.3/10 AAA standard).
