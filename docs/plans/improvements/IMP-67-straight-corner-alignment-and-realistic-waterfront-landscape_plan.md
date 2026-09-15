# [KẾ HOẠCH CẢI TIẾN IMP-67] Triệt Tiêu Góc Nghiêng 90° (Straight Corner Alignment) & Tái Cấu Trúc Hoạt Cảnh Lõi Sa Bàn Chuẩn Cảnh Quan Đời Thực (Realistic Waterfront Landscape)

> **Trạng thái**: 🟢 **ĐÃ PHÊ DUYỆT & THỰC THI HOÀN TẤT**
> **Mã cải tiến**: IMP-67
> **Mục tiêu**: Xóa bỏ góc xoay nghiêng tại 8 ô tiếp giáp 4 góc vuông 90° (giữ thẳng góc trực giao rotation = [0, 0, 0] không va chạm); triệt tiêu các chi tiết hoạt cảnh khu vui chơi hội chợ (vòng đu quay, sân vận động, tia laser); thay bằng cảnh quan ven sông Bến Bạch Đằng và trung tâm văn hóa đương đại chuẩn đời thực.

---

## 1. BỐI CẢNH & PHÂN TÍCH KỸ THUẬT

1. **Góc Vuông 90° (Straight Corner Orthogonal Alignment)**:
   - Người dùng phản hồi: *"Tôi thấy ngay góc 90 độ không cần nghiêng vì kích thước có vẻ vừa 2 tòa nhà kế bên, hãy kiểm tra lại nếu vừa thì không cần nghiêng"*
   - Kiểm tra toán học: Với khổ đế 0.536m x 0.536m (scale 0.975x), vị trí Z = -1.38m và độ trượt ngang lx = ±0.24m, khi đặt góc xoay thẳng góc `rotation = [0, 0, 0]`:
     * Biên X của Cell 1: [6.692, 7.228]
     * Biên X của Cell 39: [7.352, 7.888]
     * Khoảng hở trực giao giữa 2 mép ngoài: 7.352 - 7.228 = 0.124m = 12.4cm > 10cm an toàn.
     * Khoảng cách Euclid giữa 2 tâm: 0.933m > 0.85m, hành lang chéo: 0.397m > 0.35m.
     * Hai tòa nhà hoàn toàn vừa vặn, đứng thẳng tắp song song với mặt đường mà 0% va chạm hình học.

2. **Cảnh Quan Lõi Sa Bàn Đời Thực (Real-Life Waterfront Metropolis Landscape)**:
   - Người dùng phản hồi: *"Ngoài ra các hình ảnh tòa nhà, hoạt cảnh ở giữa bàn cờ, cần chỉnh sửa lại cho sát với cảnh thực tế ngoài đời nhất có thể, hiện tại nhìn giống khu trò chơi mà không có dáng vẻ của cảnh quan gì ngoài đời thật"*
   - Nguyên nhân: Vòng đu quay hội chợ 8 cabin màu mè (`diorama_ferris_wheel.tsx`), sân vận động đồ chơi với cột đèn pha (`diorama_stadium.tsx`), và tia laser vũ trường quét nóc Bitexco tạo cảm giác công viên giải trí trẻ em.
   - Giải pháp:
     * Triệt tiêu hoàn toàn vòng đu quay, sân vận động và tia laser.
     * Triển khai `DioramaWaterfrontPark`: Công viên ven sông Bến Bạch Đằng với đường dạo lát đá granite xám (#CBD5E1, #94A3B8), thảm cỏ xanh mướt (#166534, #15803D), ghế đá công viên (#475569, #78350F), cây xanh nhiệt đới và bến tàu thủy Saigon Waterbus (#0284C7, #F8FAFC).
     * Triển khai `DioramaCivicCenter`: Trung tâm Văn hóa đương đại với khối đế giật cấp đá travertine (#334155, #E2E8F0), sảnh kính Low-E sapphire (#0284C7), vườn thượng uyển trên mái và hồ nước phản chiếu.

---

## 2. KIẾN TRÚC MÃ NGUỒN & PHẠM VI TÁC ĐỘNG (BLAST RADIUS)

- `src/client/3d/procedural_building.tsx`: Cập nhật toàn bộ 8 ô giáp góc (1, 9, 11, 19, 21, 29, 31, 39) trong `CORNER_SPLAY_TRANSFORMS` về `rotation: [0, 0, 0]`.
- `src/client/3d/diorama/diorama_waterfront_park.tsx` [NEW]: Thành phần công viên cảnh quan ven sông Bến Bạch Đằng và bến tàu thủy Waterbus.
- `src/client/3d/diorama/diorama_civic_center.tsx` [NEW]: Thành phần trung tâm văn hóa triển lãm đương đại.
- `src/client/3d/diorama/diorama_skyline.tsx`: Triệt tiêu laser cone trên tháp Bitexco.
- `src/client/3d/miniature_city_diorama.tsx`: Thay thế FerrisWheel và Stadium bằng WaterfrontPark và CivicCenter.
- `docs/domain/gotchas.md`: Bổ sung Gotcha #90.

---

## 3. QUY TRÌNH 3 TRẠM (3-STATION PIPELINE)

1. **Trạm 1 (RED Contract Test)**: `tests/contracts/imp67_realistic_center_diorama_and_straight_corner.test.ts` (48 atomic tests, 4 facets).
2. **Trạm 2 (GREEN Implementation)**: Triển khai tối thiểu để toàn bộ 48 tests PASS và 170/170 test suites hệ thống PASS (2.772 tests passed).
3. **Trạm 3 (Independent Review & Visual Audit)**:
   - `spec-reviewer`: Độc lập đối chiếu mã nguồn và đĩa vật lý, duyệt 100% không scope drift (VERDICT: APPROVED).
   - `game-3d-visual-critic`: Độc lập chấm điểm thị giác trên ảnh chụp thực tế qua Edge CDP, đạt phán quyết SHIP (8.8/10).
