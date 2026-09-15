# [BÁO CÁO CẢI TIẾN IMP-66] Tái Cân Bằng Tỷ Lệ Trực Quan Sa Bàn: Giảm 50% Kích Thước Con Cờ & Tăng 50% Kích Thước Công Trình C1-C3

> **Trạng thái**: 🟢 **HOÀN TẤT & XUẤT XƯỞNG (SHIPPED)**
> **Mã cải tiến**: IMP-66
> **Ngày hoàn thành**: 2026-09-14
> **Đánh giá Trạm 3**: `spec-reviewer` (APPROVED), `game-3d-visual-critic` (SHIP - 9.6/10 AAA Standard)

---

## 1. TỔNG QUAN KẾT QUẢ THỰC HIỆN

Theo yêu cầu trực tiếp của người dùng sau khi review phối cảnh thực tế:
> *"Tôi nghĩ con cờ nên nhỏ lại khoảng 1/2. Các căn c1 - 2 - 3 cần lớn hơn khoảng 50%"*

Dự án đã áp dụng nghiêm ngặt quy trình 3 Trạm (RED ➔ GREEN ➔ Independent Review & Physical Disk Verification):

| Hạng Mục Kỹ Thuật | Trước Cải Tiến (IMP-65) | Sau Cải Tiến (IMP-66) | Hiệu Quả Quan Sát |
| :--- | :---: | :---: | :--- |
| **Kích thước Con Cờ (Pawn Scale)** | `1.25x` (đường kính ~1.05m) | `0.625x` (đường kính ~0.52m) | Giảm đúng 50%, giải phóng 75% lòng ô, 4 linh vật đứng cùng ô không chạm nhau |
| **Kích thước Công Trình C1-C3** | `0.65x` (khổ đế ~0.358m) | `0.975x` (khổ đế ~0.536m) | Tăng đúng 50%, chân đế vững chãi chuẩn sa bàn Townscaper |
| **Tọa độ Mép Ngoài Ô Cờ (Z)** | `Z = -1.35m` | `Z = -1.38m` | Mép trong tại `-1.112m <= -1.08m`, cách biên thẻ 3.2cm an toàn trên thềm |
| **Trượt Ngang Góc (Corner Lateral)** | `lx = ±0.18m` | `lx = ±0.24m` | Trượt sâu hơn ra xa giao điểm 90° |
| **Góc Xoay Hướng Mặt Tiền** | `rotY = ±0.22 rad` (~12.6°) | `rotY = ±0.25 rad` (~14.3°) | Hướng mặt tiền mở rộng ra không gian thoáng |
| **Khoảng Cách Tâm Góc $D$** | `0.891m` | **`0.933m`** | Vượt xa ngưỡng an toàn $0.85\text{m}$ |
| **Hành Lang Cách Ly Thực Tế** | `0.341m` | **`0.397m`** | Gần 40cm khoảng hở thông thoáng giữa 2 công trình |
| **Billboard Bảng Tên Sảnh Chờ** | `position: [0, 1.05, 0]` | `position: [0, 0.85, 0]` | Hạ thấp bám sát đầu con cờ nhỏ gọn |

---

## 2. MINH CHỨNG KIỂM THỬ TỰ ĐỘNG

- **Hợp Đồng Kiểm Thử IMP-66**: `tests/contracts/imp66_visual_scale_rebalance_and_corner_safety.test.ts`
  * 61 atomic tests PASS (Facet 1: Pawn Scale, Facet 2: Building Scale & Z-Coord, Facet 3: Corner Clearance, Facet 4: Non-finite Defense).
  * Adversarial Inversion: Thử đổi scale về 0.7x lập tức đánh rớt 7 test cases, chứng minh tính đối kháng.
- **Toàn Bộ 169 Test Suites Hệ Thống**:
  * **169/169 suites PASS (2.721 tests passed, 0 failures, duration ~31s)**.
- **Quality Gate**: `npm run gate:quick` PASS (0 errors, 3D Asset Budget Controller 1.11 MB / 2.5 MB).

---

## 3. THẨM ĐỊNH ĐỘC LẬP TRẠM 3 (INDEPENDENT REVIEW)

1. **Specification Integrity Auditor (`spec-reviewer`)**:
   - **Verdict**: **APPROVED**
   - 100% tuân thủ đặc tả, 0 scope drift.
2. **Senior Adversarial 3D Game Art Director (`game-3d-visual-critic`)**:
   - **Verdict**: **SHIP**
   - **Điểm số**: **9.6/10 (AAA Standard)**
   - Đánh giá: Con cờ nhỏ nhắn, tinh tế như tượng kim loại sưu tầm. Công trình C1-C3 bề thế, màu sắc ngói đỏ và kính sapphire nổi bật. Nút thắt góc Cell 1 (Cần Thơ) và Cell 39 (TP.HCM) quang đãng tuyệt đối. Thẻ Sổ Đỏ và tên tỉnh thành hiển thị rõ 100%.

---

## 4. BẤT BIẾN TRI THỨC KẾ THỪA

- Ghi nhận Gotcha #89 vào `docs/domain/gotchas.md` (`[3D/SCALE]`).
