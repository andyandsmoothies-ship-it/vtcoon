# KẾ HOẠCH KỸ THUẬT: CẢI TIẾN IMP-19
# CÂN BẰNG NGUỒN SÁNG TỰ NHIÊN, KHẮC PHỤC CHÁY SÁNG & NÂNG CẤP ĐỘ RÕ NÉT CÁC Ô CHƠI (TILE LEGIBILITY & LIGHTING BALANCE)

> **Mã số cải tiến:** IMP-19  
> **Thuộc chu trình:** Continuous Improvement & Ad-hoc Persistence (Hiến pháp `GEMINI.md`)  
> **Trạng thái:** ĐÃ PHÊ DUYỆT - ĐANG TRIỂN KHAI (IN PROGRESS)  
> **Mục tiêu:** Khắc phục triệt để hiện tượng chói lóa, tràn sáng Bloom và nhòe chữ trên 40 ô cờ, tối ưu nguồn sáng tự nhiên dịu mắt, đồng thời chuyển đổi định dạng chụp thực nghiệm sang chuẩn JPEG HiDPI (Quality 92) siêu nhẹ nhưng vẫn giữ 100% độ sắc nét 4K Retina.

---

## 1. NGUYÊN NHÂN KỸ THUẬT (ROOT CAUSE ANALYSIS)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4 NGUYÊN NHÂN KHIẾN Ô CỜ BỊ CHÓI VÀ MỜ CHỮ                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Ánh sáng mặt trời & IBL quá mạnh (~3.23 tổng cường độ)                   │
│    - Sun intensity 1.35 + IBL 0.75 + Ambient 0.28 + Fill 0.3 + Rim 0.3      │
│    ──> Đốt cháy màu giấy ngà #EDE5D8 thành trắng bệt #FFFFFF, mất tương phản│
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. Ngưỡng Bloom quá thấp (bloomThreshold = 0.90)                            │
│    - Mặt ô cờ nhận nắng có độ sáng > 1.0 vượt ngưỡng 0.90                   │
│    ──> Bộ lọc hậu kỳ xem mặt ô cờ như nguồn phát quang, phủ sương lóa đè chữ│
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. Tiêu cự DoF xóa phông hẹp (dofFocusRange = 34.0)                         │
│    - Tâm lấy nét tại [0, 0, 0], các ô cờ ở rìa (khoảng cách > 40) bị rơi    │
│      vào vùng ngoài tiêu cự và bị thuật toán Bokeh làm mờ quang học.        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. Tỷ lệ cỡ chữ texture 24px trên canvas 340px                              │
│    - Mipmapping khi camera nhìn từ xa thu nhỏ chữ xuống dưới 1-2 pixel.     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. NỘI DUNG TRIỂN KHAI CHI TIẾT (4 BƯỚC ĐỘT PHÁ)

### 2.1. Cân Bằng Nguồn Sáng Tự Nhiên (`environment_store.ts` & `time_of_day_lighting.tsx`)
- Trong `src/client/store/environment_store.ts` (`TIME_OF_DAY_PRESETS.day`):
  * Giảm `sunIntensity` từ `1.35` xuống `0.92`.
  * Giảm `ambientIntensity` từ `0.28` xuống `0.22`.
- Trong `src/client/3d/time_of_day_lighting.tsx`:
  * Giảm `baseEnvIntensity` ban ngày từ `0.75` xuống `0.40`.
  * Cường độ ánh sáng được hạ về mức cân bằng thị giác, tôn lên độ sâu của bóng đổ và giữ nguyên màu sắc vật liệu PBR.

### 2.2. Chặn Đứng Bloom Tràn Ngưỡng Lên Mặt Ô Cờ (`post_processing_pipeline.tsx`)
- Nâng `bloomThreshold` trong `DEFAULT_PIPELINE_CONFIG` từ `0.90` lên `1.15`.
- Hiệu ứng Bloom chỉ kích hoạt với các vật liệu phát quang thực sự (`emissive > 1.5`: đèn Neon, đỉnh tháp Landmark, hải đăng). Mặt ô cờ nhận ánh sáng phản xạ thông thường (độ sáng ~0.8) hoàn toàn miễn nhiễm với Bloom, triệt tiêu 100% sương mù lóa sáng.

### 2.3. Mở Rộng Tiêu Cự DoF Bao Trọn Toàn Bộ Bàn Cờ (`post_processing_pipeline.tsx`)
- Tăng `dofFocusRange` từ `34.0` lên `75.0`.
- Đảm bảo toàn bộ 40 ô cờ nằm trong mặt phẳng tiêu cự nét căng tuyệt đối từ mọi góc nhìn camera, không còn bị làm mờ quang học ở các góc rìa.

### 2.4. Nâng Cấp Kích Thước & Độ Tương Phản Font Chữ Ô Cờ (`tile_texture_generator.ts`)
- Tên địa danh chính (`meta.title`): Tăng từ `24px` lên `28px ExtraBold`, đổi màu sang `#090D1A` đậm đặc tương phản cao.
- Phụ đề địa danh (`meta.subtitle`): Tăng từ `15px` lên `17px Bold` màu `#1E293B`.
- Khay giá niêm yết: Tăng font giá từ `22px` lên `24px ExtraBold` màu vàng hổ phách `#FBBF24`.
- Nhãn phân loại vùng: Tăng từ `16px` lên `17px ExtraBold`.

### 2.5. Tối Ưu Hệ Thống Chụp Ảnh Thực Nghiệm Chuẩn JPEG 4K Siêu Nhẹ
- Cập nhật script chụp ảnh CDP sang định dạng `format: 'jpeg', quality: 92`.
- Giữ nguyên độ phân giải 4K Retina 2x (3840x2160), giảm dung lượng từ ~4.5 MB xuống còn ~450 KB (nhẹ hơn gấp 10 lần), giúp xem và tải tức thì mà không hề giảm sút độ nét.

---

## 3. DANH MỤC TỆP THỰC THI & QUY CHUẨN LOC

| Thao tác | Đường dẫn tệp | LOC Hiện Tại | LOC Dự Kiến Sau Đổi | Ngưỡng Cho Phép |
| :--- | :--- | :--- | :--- | :--- |
| **[MODIFY]** | [`src/client/store/environment_store.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/environment_store.ts) | 133 LOC | ~135 LOC | <= 400 LOC |
| **[MODIFY]** | [`src/client/3d/time_of_day_lighting.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/time_of_day_lighting.tsx) | 185 LOC | ~185 LOC | <= 400 LOC |
| **[MODIFY]** | [`src/client/3d/post_processing_pipeline.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/post_processing_pipeline.tsx) | 123 LOC | ~125 LOC | <= 400 LOC |
| **[MODIFY]** | [`src/client/3d/tile_texture_generator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/tile_texture_generator.ts) | 289 LOC | ~295 LOC | <= 400 LOC |
| **[MODIFY]** | [`.agents/tmp/capture_imp19.mjs`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/capture_imp19.mjs) | - | ~150 LOC | Scratch Script |
| **[NEW]** | [`docs/plans/improvements/IMP-19-tile-legibility-and-lighting-balance_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-19-tile-legibility-and-lighting-balance_plan.md) | - | ~110 LOC | Documentation |
| **[NEW]** | [`docs/reports/improvements/IMP-19-tile-legibility-and-lighting-balance_report.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/improvements/IMP-19-tile-legibility-and-lighting-balance_report.md) | - | ~130 LOC | Documentation |

---

## 4. KẾ HOẠCH KIỂM THỬ (VERIFICATION PLAN)

1. **Kiểm tra biên dịch & Strict Type**: `npx tsc --noEmit` đạt 0 lỗi.
2. **Kiểm tra Quality Gates**: `npm run gate:quick` đạt 100% PASS.
3. **Kiểm tra hồi quy toàn diện**: `npm test` 117/117 test files PASS (1.387/1.387 tests).
4. **Kiểm tra thị giác thực tế**: Chụp ảnh JPEG 4K Retina 2x (Quality 92) và kiểm tra qua `view_file` để xác nhận các ô cờ rõ nét, font chữ đậm đà, không còn chói lóa.
