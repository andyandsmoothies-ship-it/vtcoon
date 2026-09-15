# [KẾ HOẠCH CẢI TIẾN IMP-70] Quy Hoạch Cảnh Quan Kiến Trúc TP.HCM Đời Thực: Xóa Tòa Nhà Trước Nhà Thờ, Triệt Tiêu Vệt Sáng Vàng, Đại Tu Tranh Nền Ô Cờ & Mở Toang Hành Lang Sông Bitexco

> **Trạng thái**: 🟢 **ĐÃ PHÊ DUYỆT & THỰC THI HOÀN TẤT**
> **Mã cải tiến**: IMP-70
> **Mục tiêu**:
> 1. Xóa bỏ hoàn toàn tòa nhà chắn tầm nhìn trước Nhà Thờ Đức Bà (Chợ Bến Thành cũ ở tọa độ `[0.2, 0, -0.7]`), mở rộng toàn diện Công viên Quảng trường Công xã Paris với Tượng Đức Mẹ Hòa Bình uy nghiêm.
> 2. Triệt tiêu hoàn toàn 2 vệt sáng vàng gây chói theo chỉ định của người dùng: tấm nóc vàng `#F59E0B` trên vòm cầu Nam và nón chiếu sáng spotlight vàng trên mặt đất ngọn hải đăng.
> 3. Đại tu toàn diện đồ họa nền 4 ô góc (GO, Kiểm Toán, Nghỉ Dưỡng, Lệnh Tòa Án) và các ô đặc biệt (Cơ Hội, Khí Vận, Thuế Đất, Sàn HOSE) thành tranh minh họa Canvas 2D nghệ thuật cao cấp thay thế các khối hộp đơn sắc phẳng.
> 4. Tái cấu trúc cụm cao ốc Bitexco mở toang hành lang hướng Đông ra sông Sài Gòn (`X >= -3.8`), đảm bảo cấu trúc đô thị TP.HCM thực tế, thoáng đãng và bề thế.

---

## 1. BỐI CẢNH & PHÂN TÍCH YÊU CẦU

1. **Xóa tòa nhà trước Nhà Thờ Đức Bà**:
   - Phản hồi từ người dùng kèm ảnh chụp 4 mũi tên đỏ: *"tôi không hiểu sao bạn nói đã xóa tòa nhà trước nhà thờ rồi mà tôi chụp ảnh kiểm tra vẫn thấy còn"*.
   - Phân tích: Ở lần cải tiến trước (IMP-69), ta đã xóa Bưu điện Trung tâm Sài Gòn ở góc đông. Tuy nhiên, khối nhà nằm trực diện trước mặt tiền Nhà Thờ Đức Bà tại `[0.2, 0, -0.7]` thực chất là Chợ Bến Thành (`BenThanhProceduralFallback` / `landmark_ben_thanh.glb`). Do đó người dùng nhìn thẳng từ góc chính diện vẫn thấy một công trình lớn chắn trước thánh đường.
   - Giải pháp: Xóa bỏ 100% công trình Chợ Bến Thành khỏi cụm di sản này. Mở rộng toàn diện Công viên Quảng trường Công xã Paris (`cong-xa-paris-plaza`) với thảm cỏ hoa viên tròn và Tượng Đức Mẹ Hòa Bình cẩm thạch trắng.

2. **Triệt tiêu 2 vệt sáng vàng rực**:
   - Phản hồi từ người dùng: *"và tôi cần bạn bỏ đi các hiệu ứng làm sáng vàng như tôi đã chỉ mũi tên đỏ"*.
   - Vệt 1: Mũi tên đỏ chỉ vào vòm cầu phía Nam. Trong `diorama_bridges.tsx`, vòm cầu này có một tấm nóc `boxGeometry args={[1.98, 0.01, 0.44]}` mang màu vàng chói lóa `#F59E0B`.
   - Vệt 2: Mũi tên đỏ chỉ vào vệt sáng hình quạt vàng trên bãi cỏ gần hải đăng. Trong `cinematic_effects.tsx`, ngọn hải đăng có nón đèn spotlight chiếu xuống đất (`coneGeometry args={[0.3, 1.4, 8, 1, true]}`) với màu `#FEF08A`.
   - Giải pháp: Gỡ bỏ dứt điểm cả 2 hình học và mã màu vàng này, trả lại vật liệu thép xám than thanh lịch cho cầu và ánh sáng tự nhiên ban ngày cho sa bàn.

3. **Đại tu tranh nền các ô không phải BĐS (4 góc & ô đặc biệt)**:
   - Phản hồi từ người dùng: *"ngoài ra các ô không phải nhà như bóc phiếu, 4 góc, ... cũng nên có ảnh nền phù hợp với nội dung, hiện tại tôi thấy không đẹp"*.
   - Hiện trạng: 4 ô góc và các ô đặc biệt đang dùng hàm vẽ canvas cũ với các khối bệt đơn sắc (`#1E1B4B`, `#450A0A`, `#166534`), thiếu chiều sâu thị giác.
   - Giải pháp: Tách module chuyên trách `src/client/3d/corner_tile_art.ts` với đầy đủ tranh minh họa thủ công Canvas 2D:
     * Ô 00 (GO - Xuất Phát): Cổng vòm chào Art Deco, mũi tên hướng tâm 3D, cúp vàng danh vọng và tia hào quang tài chính.
     * Ô 10 (Kiểm Toán / Nhà Tù): Đại sảnh tư pháp cột trụ đá cẩm thạch La Mã, khiên bảo an và cán cân công lý vàng đồng, phân vùng rõ "VÀO THĂM" và "TẠM GIAM".
     * Ô 20 (Nghỉ Dưỡng Vô Ưu): Bãi biển nhiệt đới cát vàng, rặng dừa, ghế dài tắm nắng và làn sóng biển ngọc bích.
     * Ô 30 (Lệnh Tòa Án Vào Tù): Lệnh trát thanh tra thuế tư pháp viền son, búa thẩm phán gỗ gõ đệm đồng uy quyền và mũi tên điều hướng về Ô 10.
     * Ô Đặc Biệt: Huy hiệu Dấu hỏi hoàng gia vàng ánh kim (Cơ Hội), Rương châu báu ngọc bích phát sáng (Khí Vận / Bóc Thẻ), Khế ước nộp thuế dấu triện đỏ (Lệ Phí Đất), Biểu đồ nến & Bò tót tài chính phố Wall (Sàn HOSE).

4. **Tái cấu trúc cụm cao ốc Bitexco theo chuẩn kiến trúc TP.HCM**:
   - Phản hồi từ người dùng: *"ngoài ra các tòa nhà bao xung quanh bitexco như vậy không đúng kiến trúc thành phố hồ chí minh... toàn bộ cảnh quan 3d trên bàn nên được review lại theo góc nhìn của một kiến trúc sư để có sự đẹp và hoành tráng hơn"*.
   - Giải pháp: Bố trí lại 10 tòa tháp trong `diorama_highrise_blocks.tsx` để hành lang hướng Đông ra sông Sài Gòn (`X >= -3.8`) hoàn toàn thông thoáng, tạo tầm nhìn triệu đô từ Bitexco hướng thẳng ra dòng sông uốn lượn và bến du thuyền, giật cấp cao dần về hướng Tây Bắc.

---

## 2. QUY TRÌNH 3 TRẠM (3-STATION IMPLEMENTATION PIPELINE)

```
[Trạm 1: RED Contract Test]
  └── imp70_architectural_masterplan_and_tile_art.test.ts (47 atomic tests, 4 facets)
  └── Độc lập chứng minh RED: 20 failed | 27 passed

[Trạm 2: GREEN Implementation]
  ├── diorama_heritage_district.tsx (Xóa Bến Thành, mở rộng Công xã Paris)
  ├── diorama_bridges.tsx (Xóa tấm vàng nóc cầu Nam)
  ├── cinematic_effects.tsx (Xóa nón sáng vàng hải đăng & hào quang chóp tháp)
  ├── corner_tile_art.ts [NEW, 354 LOC] (Đồ họa Canvas 2D cho 4 góc & ô đặc biệt)
  ├── tile_texture_generator.ts (Tích hợp, nén từ 630 LOC về 280 LOC)
  └── diorama_highrise_blocks.tsx (Mở toang hành lang Đông sông Sài Gòn)
  └── Kết quả: 173/173 test suites PASS (2.926 atomic tests), 0 error

[Trạm 3: Independent Review & Physical Disk Verification]
  ├── spec-reviewer: Kiểm tra 100% đĩa vật lý, đối chiếu hợp đồng kiểm thử (APPROVED)
  └── game-3d-visual-critic: Thẩm định 3 góc ảnh chụp Edge CDP thực tế (SHIP, 9.6/10)
```
