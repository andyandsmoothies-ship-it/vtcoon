# [BÁO CÁO NGHIỆM THU IMP-70] Quy Hoạch Cảnh Quan Kiến Trúc TP.HCM Đời Thực: Xóa Tòa Nhà Trước Nhà Thờ, Triệt Tiêu Vệt Sáng Vàng, Đại Tu Tranh Nền Ô Cờ & Mở Toang Hành Lang Sông Bitexco

> **Mã cải tiến**: IMP-70
> **Ngày hoàn tất**: 2026-09-15
> **Trạng thái**: 🟢 **HOÀN TẤT & ĐƯỢC PHÊ DUYỆT BỞI TRẠM 3 (SHIP - 9.6/10 AAA)**

---

## 1. TỔNG QUAN KẾT QUẢ THỰC HIỆN

Cải tiến IMP-70 đã giải quyết triệt để 4 yêu cầu của bạn dựa trên phân tích hiện trạng trực quan:
1. **Xóa Tòa Nhà Trước Nhà Thờ Đức Bà**:
   - Dỡ bỏ hoàn toàn Chợ Bến Thành (`BenThanhProceduralFallback` / `landmark_ben_thanh.glb`) tại tọa độ `[0.2, 0, -0.7]` nằm ngay trên trục mặt tiền Nhà Thờ.
   - Mở rộng toàn diện Công viên Quảng trường Công xã Paris (`cong-xa-paris-plaza`) với hoa viên tròn rực rỡ và Tượng Đức Mẹ Hòa Bình cẩm thạch trắng uy nghiêm. Nhà Thờ Đức Bà hiện diện 100% thoáng đãng, tráng lệ.
2. **Triệt Tiêu 2 Vệt Sáng Vàng Gây Chói**:
   - Gỡ bỏ tấm nóc vàng rực `#F59E0B` trên vòm cầu Nam trong `diorama_bridges.tsx`; giàn cầu trở về thép xám than `#334155` đanh chắc, tiệp màu đô thị hiện đại.
   - Gỡ bỏ nón đèn vàng chiếu rọi thô (`coneGeometry args={[0.3, 1.4, 8, 1, true]}`) dưới chân ngọn hải đăng trong `cinematic_effects.tsx`, trả lại thảm cỏ tự nhiên đón nắng trời nhiệt đới.
3. **Đại Tu Tranh Nền Ô Cờ 4 Góc & Ô Đặc Biệt**:
   - Tách module độc lập `src/client/3d/corner_tile_art.ts` (354 LOC), thay thế toàn bộ các khối màu bệt cũ bằng tranh vẽ Canvas 2D có chiều sâu mỹ thuật cao:
     * Ô 00 (GO): Cổng vòm chào Art Deco, mũi tên hướng tâm 3D, cúp vàng danh vọng và tia hào quang tài chính.
     * Ô 10 (Kiểm Toán): Sảnh tư pháp cột trụ La Mã, khiên bảo an và cán cân công lý vàng đồng, phân định rõ vùng "VÀO THĂM" và "TẠM GIAM".
     * Ô 20 (Nghỉ Dưỡng): Vịnh biển nhiệt đới cát vàng, rặng dừa, ghế tắm nắng và sóng biển ngọc bích.
     * Ô 30 (Lệnh Tòa Án): Trát thanh tra thuế tư pháp viền son, búa thẩm phán gỗ gõ đệm đồng uy quyền và mũi tên điều hướng về Ô 10.
     * Ô Đặc Biệt: Dấu hỏi hoàng gia (Cơ Hội), Rương ngọc bích phát sáng (Khí Vận), Khế ước nộp thuế dấu triện đỏ (Lệ Phí Đất), Biểu đồ nến & Bò tót tài chính (Sàn HOSE).
4. **Tái Cấu Trúc Cụm Cao Ốc Bitexco Chuẩn Kiến Trúc TP.HCM**:
   - Tái định vị 10 tòa tháp trong `diorama_highrise_blocks.tsx` để hành lang hướng Đông ra sông Sài Gòn (`X >= -3.8`) hoàn toàn mở toang, không còn cảm giác bị quây kín bởi tường thành bê tông.
   - Tháp Bitexco vươn cao hùng vĩ làm điểm nhấn trung tâm, sân đỗ trực thăng chìa thẳng ra mặt sông lộng gió đón ánh bình minh.

---

## 2. KẾT QUẢ KIỂM ĐỊNH QUY TRÌNH 3 TRẠM

| Trạm | Phân Trọng Trách | Kết Quả | Chi Tiết |
| :--- | :--- | :---: | :--- |
| **Trạm 1** | `qa-tester` (Adversarial Contract) | ✔️ PASS | Viết 47 atomic tests trong `imp70_architectural_masterplan_and_tile_art.test.ts`. Chứng minh RED trung thực (20 failed \| 27 passed) trước khi sửa code. |
| **Trạm 2** | `implementer` (Green Implementation) | ✔️ PASS | Cập nhật mã nguồn; 47/47 tests contract PASS; 173/173 test suites toàn hệ thống PASS (2.926 atomic tests, 0 failures); `npm run gate:quick` PASS với 0 lỗi. |
| **Trạm 3A** | `spec-reviewer` (Spec & Disk Audit) | ✔️ APPROVED | Đối chiếu 5 tiêu chí trên đĩa vật lý, xác nhận 0 scope drift, 100% khớp đặc tả. |
| **Trạm 3B** | `game-3d-visual-critic` (Visual Critique) | ✔️ SHIP | Chấm 9.6/10 AAA; xác nhận dỡ sạch vật cản trước Nhà Thờ Đức Bà, triệt tiêu 2 vệt vàng, đại tu tranh nền ô cờ đẳng cấp và mở toang hành lang sông Bitexco. |

---

## 3. THƯ VIỆN HÌNH ẢNH MINH CHỨNG (PHYSICAL DISK EVIDENCE)

- Toàn cảnh sa bàn nghiêng Perspective: `perspective_1_tabletop_overview.jpg`
- Cận cảnh trục cao ốc tài chính & tháp Bitexco: `perspective_2_highrise_facade.jpg`
- Góc nhìn từ bến cảng qua cụm cầu Ba Son hướng về Bitexco: `perspective_3_shophouse_district.jpg`
