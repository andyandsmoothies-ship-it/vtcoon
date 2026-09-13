# [IMP-38] Kế Hoạch Tối Ưu Độ Sắc Nét & Khả Năng Đọc Text Thẻ Cờ Từ Góc Nhìn Tổng Thể (Tile Text Crispness & Overview Readability)

## 1. BỐI CẢNH & PHÂN TÍCH NGUYÊN NHÂN GỐC RỄ

Người dùng phản ánh: *"Text từng card khi nhìn từ trên xuống vẫn mờ ảo, chỉ khi zoom vào mới nhìn rõ."*

4 nguyên nhân kỹ thuật:
1. **Depth of Field (DoF) quang học**: Tiêu cự khóa tại `[0, 0, 0]`, thẻ cờ ở bán kính 13m–15m bị bokeh làm mờ quang học.
2. **Cự ly camera overview quá xa**: Khoảng cách 35.8m khiến bàn cờ chỉ chiếm 45% diện tích màn hình, text chỉ cao 7–8px trên màn hình 1080p.
3. **Nét chữ mỏng thiếu viền đanh**: Font 28px không có stroke khiến nét chữ bị nuốt điểm ảnh (sub-pixel dropout) khi nhìn xa.
4. **Vô hiệu hóa Mipmaps**: Tắt mipmaps khiến WebGL vô hiệu hóa Anisotropic Filtering 16x trên mặt phẳng thẻ nghiêng.

---

## 2. GIẢI PHÁP KỸ THUẬT

1. **Triệt tiêu DoF optical blur**: Cấu hình `enableDof: false` và `dofBokehScale: 0.0` trong `post_processing_pipeline.tsx`.
2. **Kỹ thuật Double Draw (Stroke + Fill)**:
   - Tên địa danh: Font `900 34px`, `lineWidth = 2.5`, `strokeStyle = '#090D1A'` kèm `fillText`.
   - Phụ đề: Font `bold 20px` với màu đen than đặc `#0F172A`.
   - Khay giá: Font `900 28px` màu vàng hổ phách `#FBBF24`, chiều cao khay 52px.
3. **Cân chỉnh cự ly camera**:
   - `CAMERA_CONFIG.overview.position`: `[15.5, 17.5, 15.5]` (khoảng cách 28.0m, phóng to bàn cờ ~35%).
   - `CAMERA_CONFIG.pre_match.position`: `[15.5, 17.5, 15.5]`.
   - Đồng bộ ref trong `game_canvas.tsx`.
4. **Kích hoạt Mipmap & Anisotropic Filtering 16x**:
   - `texture.generateMipmaps = true`, `texture.minFilter = LinearMipmapLinearFilter`, `texture.anisotropy = 16`.
