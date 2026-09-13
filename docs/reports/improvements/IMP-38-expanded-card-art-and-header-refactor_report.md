# [IMP-38] Báo Cáo Nghiệm Thu Tái Quy Hoạch Bố Cục Thẻ Bài: Triệt Tiêu Text Phân Loại, Nâng Tiêu Đề & Phóng Đại Tranh Di Sản +118%

## 1. TỔNG QUAN KẾT QUẢ THỰC HIỆN

| Chỉ số | Mục tiêu / Đặc tả | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :---: |
| **Loại bỏ text phân loại** | Xóa hoàn toàn `meta.category` trên đỉnh | Đã xóa 100%, dải màu thu gọn còn h = 28px | ✔️ ĐẠT |
| **Nâng tiêu đề tỉnh thành** | Dời từ y = 108 lên y = 56 | `y = 56`, font 26px `#090D1A`, căn giữa | ✔️ ĐẠT |
| **Nâng phụ đề chi tiết** | Dời từ y = 138 lên y = 80 | `y = 80`, font 16px `#334155`, căn giữa | ✔️ ĐẠT |
| **Khuôn tranh di sản** | Mở rộng từ 144x114 lên 216x166 px | `rect(10, 94, 236, 172)`, vẽ ảnh tại `dx=20, dy=97, w=216, h=166` | ✔️ ĐẠT |
| **Tăng trưởng diện tích tranh** | Tăng tối thiểu +80% | 35.856 px² vs 16.416 px² (+118.4% diện tích) | ✔️ ĐẠT |
| **Khay giá niêm yết** | Bảo tồn nguyên vẹn tại y = 274..324 | `roundRect(22, 274, 212, 50, 12)`, text y = 300 | ✔️ ĐẠT |
| **Đệm an toàn (Buffer)** | Không đè chữ và không đè khay giá | Đệm trên: 14px (>= 10px); Đệm dưới: 8px (>= 4px) | ✔️ ĐẠT |
| **Bộ kiểm thử hợp đồng** | >= 15 atomic tests | 44 atomic tests (`expanded_card_art_layout.test.ts`) | ✔️ ĐẠT |
| **Toàn bộ hệ thống test** | 135 test suites | 135 / 135 test suites PASS (1901 tests, 14.9s) | ✔️ ĐẠT |
| **Kiểm tra linter & kiểu** | `npm run gate:quick` 0 lỗi | 0 lỗi TypeScript, 0 lỗi UI anti-patterns | ✔️ ĐẠT |

---

## 2. ĐỐI CHIẾU THAY ĐỔI TỌA ĐỘ VẬT LÝ (CANVAS 256 x 340, HiDPI 4x = 1024 x 1360)

```text
[BỐ CỤC CŨ: ẢNH BỊ THU HẸP, CHỮ DÀY ĐẶC]
┌──────────────────────────────────────┐
│ [y=0..70] DẢI MÀU NHÓM ĐẤT           │
│   y=35: "HẠ TẦNG" / "BĐS NGHỈ DƯỠNG" │ <── LÃNG PHÍ 70PX CHO TEXT PHÂN LOẠI
├──────────────────────────────────────┤
│   y=108: "CAO TỐC" / "NINH BÌNH"     │
│   y=138: "Bắc - Nam" / "Tràng An"    │
├──────────────────────────────────────┤
│ [y=148..270] ẢNH ĐẠI DIỆN (144 x 114)│ <── DIỆN TÍCH: 16.416 px² (Nhỏ như tem)
├──────────────────────────────────────┤
│ [y=274..324] KHAY GIÁ: 2,000 TỶ      │
└──────────────────────────────────────┘

                    │
                    ▼
[BỐ CỤC MỚI IMP-38: ẢNH MỞ RỘNG +118%, THÔNG THOÁNG]
┌──────────────────────────────────────┐
│ [y=0..28] VIỀN MÀU NHÓM ĐẤT TINH TẾ  │ <── GỌN GÀNG, KHÔNG CHỨA TEXT RÁC
├──────────────────────────────────────┤
│   y=56: "CAO TỐC" / "NINH BÌNH"      │ <── NÂNG LÊN CAO (+52px)
│   y=80: "Bắc - Nam" / "Tràng An"     │ <── NÂNG LÊN CAO (+58px)
├──────────────────────────────────────┤
│                                      │
│ [y=94..266] ẢNH ĐẠI DIỆN MỞ RỘNG     │ <── PHÓNG ĐẠI TỐI ĐA (216 x 166 px)
│   (Target: 216 x 166 px)             │     (+50% chiều rộng, +45% chiều cao)
│   (Diện tích: 35.856 px²: +118.4%)   │     (Rõ nét mồn một từ camera gameplay ~38 độ)
│                                      │
├──────────────────────────────────────┤
│ [y=274..324] KHAY GIÁ: 2,000 TỶ      │ <── BẢO TỒN NGUYÊN VẸN BẤT BIẾN
└──────────────────────────────────────┘
```

---

## 3. BẰNG CHỨNG HÌNH ẢNH NGHIỆM THU TRỰC TIẾP TỪ RUNTIME (PORT 3000)

1. **Góc nhìn bao quát toàn bộ bàn cờ diorama (Tabletop Overview)**:
   - Tệp lưu trữ: `docs/reports/improvements/screenshots/imp38_01_tabletop_expanded_art.jpg`
   - Đánh giá: Toàn bộ 28 ô tài sản sở hữu viền màu mỏng tinh tế, không còn text phân loại rác. Cụm chữ tiêu đề và phụ đề nổi bật, các bức tranh di sản (ghe chợ nổi Cần Thơ, chùa An Giang, cầu Ba Son Thủ Đức, Bitexco TP.HCM) chiếm trọn trung tâm thẻ cờ với kích thước lớn gấp đôi.

2. **Góc nhìn cận cảnh trong trận đấu (In-game Turn Close Inspection)**:
   - Tệp lưu trữ: `docs/reports/improvements/screenshots/imp38_02_card_art_close_inspection.jpg`
   - Đánh giá: Các ô Ninh Bình, Cao Tốc, Nghệ An, Hải Phòng thể hiện rõ nét chi tiết từng nét vẽ di sản mà không hề bị chữ đè lên hay chạm vào khay giá phía dưới.

---

## 4. DANH SÁCH TỆP THAY ĐỔI & ĐỒNG BỘ

1. `src/client/3d/tile_texture_generator.ts`:
   - Dải màu `fillRect(0, 0, 256, 28)`.
   - Tiêu đề dời lên `y = 56`, phụ đề dời lên `y = 80`.
   - Triệt tiêu hoàn toàn lệnh vẽ `meta.category`.
   - Vùng clip mở rộng `rect(10, 94, 236, 172)`.
   - Khung vẽ ảnh mở rộng `targetW = 216, targetH = 166, dx = 20, dy = 97`.
   - Xuất khẩu `clearTileTextureCache()` phục vụ kiểm thử và dọn dẹp cache bộ nhớ.
2. `tests/client/expanded_card_art_layout.test.ts`:
   - Bộ kiểm thử hợp đồng mới gồm 44 atomic tests kiểm chứng 4 khía cạnh hành vi.
3. `tests/client/flat_tile_art_and_clean_c0.test.ts`:
   - Đồng bộ 4 assertions tọa độ theo bố cục mới của IMP-38.
4. `tests/client/realistic_card_art_assets.test.ts`:
   - Đồng bộ 5 assertions Facet 4 theo kích thước và tọa độ clip mới của IMP-38.
