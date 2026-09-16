# [REPORT] IMP-84: Tái Thiết Kế Phối Cảnh Bitexco Búp Sen Ven Sông & Quần Thể Cao Ốc Chân Thực

## 1. TỔNG QUAN KẾT QUẢ TRIỂN KHAI
- **Mã cải tiến**: IMP-84
- **Tiêu đề**: Bitexco Waterfront Realism & Surrounding Skyline Redesign
- **Yêu cầu gốc**: Thiết kế lại phối cảnh tháp Bitexco và các tòa nhà xung quanh theo ảnh thực tế bờ sông Sài Gòn Bến Bạch Đằng (`media_1789512514037.jpg`).
- **Phán quyết Trạm 3**:
  * `spec-reviewer`: **APPROVED (100% Spec Traceability & Test Architecture)**
  * `game-3d-visual-critic`: **APPROVED (9.6 / 10 - Chuẩn AAA Diorama)**
- **Bảo toàn hồi quy (Regression Retention)**:
  * 16/16 contract tests mới tại `imp84_bitexco_waterfront_skyline_realism.test.ts` PASS.
  * 47/47 contract tests tại `imp69_bitexco_skyline_and_cathedral_standout.test.ts` PASS.
  * 34/34 contract tests tại `imp71_lighting_skyline_traffic_and_special_tile_art.test.ts` PASS.
  * `npm run gate:quick` PASS (0 type errors, 0 lint/duplication issues).

---

## 2. CHI TIẾT CÁC THAY ĐỔI MỸ THUẬT & KIẾN TRÚC 3D

### A. Tháp Bitexco Financial Landmark Búp Sen Khí Động Học (`diorama_skyline.tsx`):
1. **Lớp vỏ sen cong kép (`bitexco-lotus-sheath`)**:
   - Triệt tiêu hoàn toàn hình trụ đơn sắc; thay thế bằng cấu trúc 2 lớp cánh sen cong khí động học lồng ghép.
   - Vỏ ngoài sử dụng kính cyan băng tuyết (`#7DD3FC` / `#38BDF8`), viền kim loại bạc chrome sang trọng (`#E2E8F0`), ôm lấy lõi kính sapphire phản quang (`#0284C7`).
2. **Sân đỗ trực thăng Cantilever & Trực thăng siêu vi mô (`bitexco-helipad`)**:
   - Vươn hẳn ra hướng sông tại cao độ $y = 1.68$ với dầm giàn xiên nón cụt chịu lực (`helipad-truss`).
   - Sàn đĩa tròn viền bạc, vòng tròn đỗ trực thăng phản quang vàng cam (`#F59E0B`).
   - Tích hợp mô hình trực thăng mini đỏ rực rỡ (`micro-helicopter`) đậu trên bãi đỗ với thân máy bay, cánh quạt chính 2 cánh và càng đáp.
3. **Đỉnh tháp cắt vát chéo cánh sen hé nở (`bitexco-crown`)**:
   - Cắt vát chéo vuốt nhọn tựa búp sen hé mở, vươn cao tới kim thu lôi mạ vàng `#F59E0B` tại $y = 2.85$ và đèn chớp tĩnh không đỏ nhấp nháy `#EF4444` tại $y = 2.95$.

### B. Tiền Cảnh Bờ Sông: Tòa Nhà Di Sản Pháp Cổ & Bến Tàu Buýt Sông (`diorama_skyline.tsx`):
1. **Tòa nhà Di sản Bờ sông (`colonial-waterfront-heritage`)**:
   - Đặt tại tiền cảnh hướng sông của Bitexco (`X: -3.7, Z: -3.7`), tái hiện kiến trúc Indochine / thuộc địa Pháp đặc trưng (Bến Nhà Rồng / Cục Hải Quan / Ngân Hàng Nhà Nước).
   - Mái dốc 4 phía ngói đỏ đất nung Terracotta (`#EA580C`), tường vàng kem Indochine (`#FEF08A`), hệ cửa vòm cuốn trắng cổ điển (`#F8FAFC`).
2. **Bến tàu thủy buýt Saigon Waterbus (`waterfront-waterbus`)**:
   - Bờ kè đá dẫn ra cầu tàu nổi đón khách, tích hợp thuyền buýt đường sông Saigon Waterbus vỏ trắng viền xanh đại dương (`#0284C7`) cập mạn đón khách.

### C. Quần Thể Cao Ốc Bao Quanh Bám Sát Ảnh Thực Tế (`diorama_highrise_blocks.tsx`):
1. **Cánh phải (Northeast)**: Tích hợp cao ốc phong cách Bitraco với mặt kính xanh ngọc bích ô vuông (`#0D9488`) và khung bê tông trắng sắc nét (`#FFFFFF`), kết hợp tháp cao kính sapphire sâu thẳm phía sau.
2. **Cánh trái (Southwest)**: Tích hợp tháp cao ốc hiện đại với hệ lam nhôm đứng chắn nắng màu xám trung tính (`#64748B` / `#94A3B8`).
3. **Quy chuẩn kỹ thuật**: Duy trì đúng 10 tháp giật cấp, giữ nguyên hành lang thông thoáng $\ge 0.85\text{m}$ so với tâm Bitexco, $z \le -2.4$, $0 < \text{height} \le 2.8$.

---

## 3. MA TRẬN KIỂM ĐỊNH HỢP ĐỒNG (16 ATOMIC TESTS)
| Mã Test | Mô tả nghiệp vụ / Mỹ thuật | Kết quả |
| :--- | :--- | :---: |
| `TC-84.01` | Bitexco tọa độ `[-4.5, 0.16, -4.4]`, đỉnh tháp $y \ge 2.85$ | PASS |
| `TC-84.02` | Thân tháp có dáng búp sen cong khí động học `bitexco-lotus-sheath` | PASS |
| `TC-84.03` | Kính cyan băng tuyết (`#7DD3FC`) và viền bạc `#E2E8F0` | PASS |
| `TC-84.04` | Đỉnh tháp vát chéo `bitexco-crown`, kim thu lôi và đèn tĩnh không đỏ | PASS |
| `TC-84.05` | Sân trực thăng `bitexco-helipad` vươn sông tại $y \in [1.60, 1.75]$ | PASS |
| `TC-84.06` | Khung dầm giàn xiên đỡ dưới sân trực thăng `helipad-truss` | PASS |
| `TC-84.07` | Vòng tròn đỗ trực thăng phản quang `#F59E0B` | PASS |
| `TC-84.08` | Trực thăng siêu vi mô `micro-helicopter` đậu trên bãi đỗ | PASS |
| `TC-84.09` | Hiện diện tòa nhà di sản ven sông `colonial-waterfront-heritage` | PASS |
| `TC-84.10` | Mái ngói terracotta `#EA580C` & tường vàng kem `#FEF08A` | PASS |
| `TC-84.11` | Dãy cửa vòm cuốn cổ điển màu trắng sáng `#F8FAFC` | PASS |
| `TC-84.12` | Bờ kè tiền cảnh có bến buýt sông `waterfront-waterbus` | PASS |
| `TC-84.13` | Đúng 10 tháp cao ốc xung quanh, khoảng cách $\ge 0.85\text{m}$ | PASS |
| `TC-84.14` | Cánh phải tháp phong cách Bitraco kính ngọc bích ô vuông & khung trắng | PASS |
| `TC-84.15` | Cánh trái tháp phong cách lam đứng chắn nắng xám trung tính | PASS |
| `TC-84.16` | Render an toàn trong SSR headless | PASS |

---

## 4. KỶ LUẬT ĐỘ PHỨC TẠP & BẢO TOÀN KIẾN TRÚC
- `diorama_skyline.tsx`: 384 LOC (<= 500 LOC).
- `diorama_highrise_blocks.tsx`: 231 LOC (<= 400 LOC).
- Bổ sung **Gotcha #112** vào `docs/domain/gotchas.md`.
