# [IMP-37] Tái Thiết Kế & Tích Hợp 28 Tranh Thẻ Bài Tả Thực Bản Địa Việt Nam

## 1. BỐI CẢNH & YÊU CẦU NGƯỜI DÙNG

- **Vấn đề tồn đọng**: Thẻ cờ cũ sử dụng mô hình 3D trên đế tròn (standee token), gây che khuất chữ, tạo cảm giác đồ chơi thô và thiếu tính bản địa thực tế.
- **Yêu cầu cốt lõi**:
  1. Loại bỏ toàn bộ biểu tượng 3D standee trên mặt thẻ cờ.
  2. Tạo mới toàn bộ 28 tranh minh họa cho 28 ô tài sản và hạ tầng theo phong cách tranh du lịch kiến trúc tả thực (Retro Travel Lithograph) tương tự mẫu TP. Hồ Chí Minh đã duyệt.
  3. Ràng buộc nghệ thuật khắt khe: Tỷ lệ kiến trúc và con người đúng đời thực, không hoạt hình/cartoon.
  4. Quy tắc cô đọng: Mỗi thẻ chỉ chọn đúng 1-2 điểm nhấn tiêu biểu nhất, tuyệt đối không nhồi nhét.
  5. Tách nền viền mờ (Soft Alpha Cutout) để hòa nhập tự nhiên vào nền giấy da ngà (#F8F5EE) và khay giá (#090D1A), không che chữ Tên, Phụ đề, Giá.

---

## 2. DANH MỤC 28 ĐIỂM NHẤN ĐẶC TRƯNG

| Ô Cờ | Tên Thẻ Bài | Phụ Đề | 1-2 Điểm Nhấn Thực Tế |
| :---: | :--- | :--- | :--- |
| **Ô 01** | CẦN THƠ | Cái Răng | 1 ghe gỗ chở trái cây miền Tây trên sông Cần Thơ |
| **Ô 03** | AN GIANG | Châu Đốc | Miếu Bà Chúa Xứ Núi Sam + rặng thốt nốt |
| **Ô 05** | LONG THÀNH | Cảng HKQT | Nhà ga hoa sen hiện đại + máy bay cất cánh |
| **Ô 06** | BÌNH DƯƠNG | Thể Thao & Golf | Thảm cỏ sân golf + Tháp đôi Trung tâm Hành chính |
| **Ô 08** | ĐỒNG NAI | Công Viên Safari | Đàn hươu cao cổ Cát Tiên Safari bên hồ nước |
| **Ô 09** | VŨNG TÀU | Bãi Sau | Hải đăng Núi Nhỏ + bãi cát Bãi Sau |
| **Ô 11** | BÌNH THUẬN | Mũi Né | Đồi cát đỏ Mũi Né + hàng dừa nghiêng ven biển |
| **Ô 12** | ĐIỆN LỰC | Tập Đoàn EVN | Trụ điện cao thế 500kV + tuabin gió trắng |
| **Ô 13** | LÂM ĐỒNG | Đà Lạt | Ga xe lửa Đà Lạt + đầu tàu hơi nước cổ |
| **Ô 14** | KHÁNH HÒA | Nha Trang | Tháp Trầm Hương duyên dáng + biển Nha Trang |
| **Ô 15** | CÁI MÉP | Cảng Biển Sâu | Cần cẩu giàn vàng STS + tàu container siêu trọng |
| **Ô 16** | BÌNH ĐỊNH | Quy Nhơn | Tháp Đôi Chăm Pa gạch nung đỏ Quy Nhơn |
| **Ô 18** | HUẾ | Cố Đô Di Sản | Cổng Ngọ Môn Đại Nội + hồ sen thơm ngát |
| **Ô 19** | ĐÀ NẴNG | Sơn Trà - Sông Hàn | Cầu Rồng phun lửa bắc qua sông Hàn |
| **Ô 21** | THANH HÓA | Sầm Sơn | Hòn Trống Mái núi Trường Lệ + sóng biển Sầm Sơn |
| **Ô 23** | NGHỆ AN | TP. Vinh | Quảng trường Hồ Chí Minh + hồ sen quê Bác |
| **Ô 24** | NINH BÌNH | Tràng An | Dãy núi đá vôi Tràng An + thuyền nan trên dòng sông |
| **Ô 25** | CAO TỐC | Bắc - Nam | Cầu cạn cao tốc uốn lượn qua hẻm núi rừng xanh |
| **Ô 26** | HẢI PHÒNG | Kinh Tế Đêm | Nhà hát Lớn Hải Phòng + hoa phượng vĩ đỏ rực |
| **Ô 27** | PHÚ QUỐC | Grand World | Tháp đồng hồ Venice + thuyền Gondola |
| **Ô 28** | VIỄN THÔNG | Viettel 5G | Trụ phát sóng Viettel 5G + sóng vệ tinh số |
| **Ô 29** | QUẢNG NINH | Vịnh Hạ Long | Hòn Gà Chọi kỳ vĩ + thuyền buồm nâu Hạ Long |
| **Ô 31** | HƯNG YÊN | Văn Giang | Đô thị sinh thái Ecopark + hồ thiên nga thanh bình |
| **Ô 32** | HÀ NỘI | Cầu Giấy | Tòa Keangnam Landmark 72 vươn cao hiện đại |
| **Ô 34** | HÀ NỘI | Hoàn Kiếm | Tháp Rùa Hồ Gươm + Cầu Thê Húc đỏ son |
| **Ô 35** | NỘI BÀI | Cảng HKQT | Đài không lưu hoa sen + máy bay Vietnam Airlines |
| **Ô 37** | TP. THỦ ĐỨC | Công Nghệ Cao | Cầu Ba Son dây văng bắc qua sông Sài Gòn |
| **Ô 39** | TP. HỒ CHÍ MINH | Quận 1 - Nguyễn Huệ | Nhà hát Thành phố cổ kính + Tòa tháp Bitexco |

---

## 3. KIẾN TRÚC & PHÂN TẦNG HIỂN THỊ (ANTI-OVERLAP ZONING)

- **Canvas 2D Texture Generator**:
  - `y = 70..150`: Tầng Tiêu Đề (Tên địa danh font 22px Bold tại y=108, Phụ đề font 12px Regular tại y=138).
  - `y = 150..270`: Tầng Tranh Minh Họa Bản Địa Tách Nền (Chiều cao tối đa 122px, clip an toàn `rect(8, 148, 240, 122)`).
  - `y = 274..326`: Tầng Khay Giá Niêm Yết (Viên nhộng đặc `#090D1A`, viền `#222D42`, chữ vàng `#F8FAFC` và `#F59E0B`).
- **Ngân sách tài nguyên (IMP-29)**: Dung lượng mỗi ảnh WebP <= 95KB (thực tế 20KB - 78.8KB).
