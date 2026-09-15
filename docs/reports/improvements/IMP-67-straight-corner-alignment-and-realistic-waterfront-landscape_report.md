# [BÁO CÁO CẢI TIẾN IMP-67] Triệt Tiêu Góc Nghiêng 90° (Straight Corner Alignment) & Tái Cấu Trúc Hoạt Cảnh Lõi Sa Bàn Chuẩn Cảnh Quan Đời Thực (Realistic Waterfront Landscape)

> **Trạng thái**: 🟢 **HOÀN TẤT & XUẤT XƯỞNG (SHIPPED)**
> **Mã cải tiến**: IMP-67
> **Ngày hoàn thành**: 2026-09-14
> **Đánh giá Trạm 3**: `spec-reviewer` (APPROVED), `game-3d-visual-critic` (SHIP - 8.8/10 AAA Standard)

---

## 1. TỔNG QUAN KẾT QUẢ THỰC HIỆN

Theo phản hồi trực tiếp của người dùng sau khi đánh giá hình ảnh thực tế:
1. > *"Tôi thấy ngay góc 90 độ không cần nghiêng vì kích thước có vẻ vừa 2 tòa nhà kế bên, hãy kiểm tra lại nếu vừa thì không cần nghiêng"*
2. > *"Ngoài ra các hình ảnh tòa nhà, hoạt cảnh ở giữa bàn cờ, cần chỉnh sửa lại cho sát với cảnh thực tế ngoài đời nhất có thể, hiện tại nhìn giống khu trò chơi mà không có dáng vẻ của cảnh quan gì ngoài đời thật"*

Dự án đã áp dụng nghiêm ngặt quy trình 3 Trạm (RED -> GREEN -> Independent Review & Physical Disk Verification):

| Hạng Mục Kỹ Thuật | Trước Cải Tiến (IMP-66) | Sau Cải Tiến (IMP-67) | Hiệu Quả Quan Sát |
| :--- | :---: | :---: | :--- |
| **Góc Xoay 8 Ô Giáp Góc (1, 9, 11, 19, 21, 29, 31, 39)** | `rotY = ±0.25 rad` (~14.3°) | **`rotation: [0, 0, 0]`** | Trực giao vuông vắn, song song mặt đường tự nhiên, không xiên vẹo |
| **Khoảng Cách Trực Giao Mép Ngoài (Cell 1 & 39)** | Nghiêng splay | **12.4cm (> 10cm an toàn)** | Hai khối công trình đứng thẳng tắp mà 0% va chạm hình học |
| **Khoảng Cách Tâm Euclid Giữa 2 Ô Góc** | 0.933m | **0.933m (> 0.85m)** | Đạt chuẩn an toàn diorama |
| **Hành Lang Chéo Giữa 2 Mép Công Trình** | 0.397m | **0.397m (> 0.35m)** | Thông thoáng, không che khuất góc nhìn |
| **Vòng Đu Quay Hội Chợ (Ferris Wheel)** | Hiện diện với 8 cabin màu mè | **TRIỆT TIÊU 100%** | Xóa bỏ hoàn toàn cảm giác khu vui chơi giải trí trẻ em |
| **Sân Vận Động Đồ Chơi (Toy Stadium)** | Cột đèn pha, khán đài giả lập | **TRIỆT TIÊU 100%** | Thay thế bằng cụm cảnh quan sông nước cao cấp |
| **Tia Laser Vũ Trường Nóc Bitexco** | Quét nón ánh sáng vũ trường | **TRIỆT TIÊU 100%** | Giữ đèn chớp tĩnh không hàng không và đài hoa sen thanh lịch |
| **Công Viên Bến Bạch Đằng (`DioramaWaterfrontPark`)** | Chưa có | **MỚI (185 LOC)** | Lối đi dạo granite, thảm cỏ xanh mát, ghế công viên, bến Waterbus |
| **Trung Tâm Văn Hóa Triển Lãm (`DioramaCivicCenter`)** | Chưa có | **MỚI (137 LOC)** | Khối đế travertine giật cấp, kính Low-E sapphire, hồ nước phản chiếu |

---

## 2. MINH CHỨNG KIỂM THỬ TỰ ĐỘNG

- **Hợp Đồng Kiểm Thử IMP-67**: `tests/contracts/imp67_realistic_center_diorama_and_straight_corner.test.ts`
  * 48 atomic tests PASS (Facet 1: Straight Corner Invariant, Facet 2: Elimination of Carnival Elements, Facet 3: Realistic Waterfront & Civic Center, Facet 4: Error Defense & Fallbacks).
  * Adversarial Inversion: Đã kiểm chứng trắc nghiệm fail trước khi code (RED) - 21 failed khi còn nghiêng và thiếu component.
- **Toàn Bộ 170 Test Suites Hệ Thống**:
  * **170/170 suites PASS (2.772 tests passed, 0 failures, duration ~30s)**.
- **Quality Gate**: `npm run gate:quick` PASS (0 errors, 3D Asset Budget Controller 1.11 MB / 2.5 MB, UI Lint 0 violations).

---

## 3. THẨM ĐỊNH ĐỘC LẬP TRẠM 3 (INDEPENDENT REVIEW)

1. **Specification Integrity Auditor (`spec-reviewer`)**:
   - **Verdict**: **APPROVED**
   - 100% tuân thủ đặc tả, 0 scope drift, 100% xác minh trên đĩa vật lý.
2. **Senior Adversarial 3D Game Art Director (`game-3d-visual-critic`)**:
   - **Verdict**: **SHIP**
   - **Điểm số**: **8.8/10 (AAA Commercial Benchmark)**
   - Đánh giá:
     * *Góc 90 độ*: Hoàn toàn trực giao, ngay ngắn, tạo cảm giác một ngã tư đô thị hiện đại thực thụ.
     * *Cảnh quan đời thực*: Loại bỏ hoàn toàn vòng đu quay và sân vận động đồ chơi. Công viên ven sông Bến Bạch Đằng cùng Trung tâm Văn hóa Triển lãm đã đưa sa bàn đạt tới đẳng cấp diorama cảnh quan sống động của các game thương mại đỉnh cao như Townscaper và Monopoly Plus.

---

## 4. BẤT BIẾN TRI THỨC KẾ THỪA

- Ghi nhận Gotcha #90 vào `docs/domain/gotchas.md` (`[3D/RENDER/LAYOUT]`).
