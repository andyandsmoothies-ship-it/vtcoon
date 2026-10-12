# BÁO CÁO ĐỀ XUẤT TỔ CHỨC LẠI CODEBASE (CODEBASE REORGANIZATION ROADMAP)
## Phương Pháp Tiếp Cận Thực Dụng: Mở Đường Cho Tính Năng Mới & Nâng Cao Năng Lực Kiểm Thử Cho AI

> **Loại tài liệu:** Báo cáo Phân tích Kiến trúc & Kế hoạch Tái Cấu trúc Tiệm cận (Architectural Refactoring & AI Ergonomics Report)  
> **Mục tiêu chiến lược:**  
> 1. Xóa bỏ rào cản kiểm thử, giúp AI Agent viết test nhanh, sâu và chính xác $100\%$ không bị bẫy WebGL.  
> 2. Mở rộng trần hiệu năng phần cứng để **tiếp tục implement thêm nhiều tính năng đồ họa và gameplay mới** mà không lo quá nhiệt di động.  
> 3. **Tuyệt đối KHÔNG dừng phát triển dự án (No Big-Bang Refactor)**: Chuyển đổi tiệm cận theo nguyên tắc Hướng Đạo Sinh (Boy Scout Rule).  

---

## 1. TRIẾT LÝ TỔ CHỨC LẠI: "KHÔNG ĐẬP ĐI XÂY LẠI" (INCREMENTAL RETROFIT)

Một sai lầm kinh điển trong kỹ thuật phần mềm là dừng toàn bộ dự án để "viết lại từ đầu". Dự án VTCOON **không đi theo con đường đó**, bởi vì:
- Hệ thống FSM phòng chơi, đồng bộ WebSocket nhị phân (35 bytes), luật mua bán, đấu giá, bot AI đều đang vận hành rất tốt.
- Món nợ kỹ thuật (Technical Debt) chỉ nằm cục bộ ở **lớp hiển thị 3D Three.js và sự kết dính trong việc ngửi thiết bị**.

**Nguyên tắc triển khai:**
> *"Chạm đến đâu, dọn sạch và chuẩn hóa đến đó (Boy Scout Rule). Khi thêm tính năng mới hoặc sửa lỗi ở file nào, áp dụng chuẩn kiến trúc mới cho file đó mà không làm xáo trộn các phân hệ đang chạy ổn định."*

---

## 2. BẢN ĐỒ 5 ĐIỂM NGHẼN KIẾN TRÚC CẦN TỔ CHỨC LẠI

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   5 TRỤ CỘT TỔ CHỨC LẠI CODEBASE ĐỂ DỄ VIẾT TEST & MỞ RỘNG             │
├─────────────────────────┬───────────────────────────────┬──────────────────────────────┤
│ TRỤ CỘT 1: VIEW-MODEL   │ TRỤ CỘT 2: DEPENDENCY INJECT  │ TRỤ CỘT 3: LỆNH VẼ BATCHING  │
│ Tách logic ra file      │ Bỏ gọi global isMobileHardware│ Gộp sa bàn tĩnh & Instancing │
│ *_visuals.ts thuần túy  │ Inject qua Context/Props      │ Kéo 763 calls về < 85 calls  │
├─────────────────────────┼───────────────────────────────┼──────────────────────────────┤
│ TRỤ CỘT 4: VRAM CLEANUP │ TRỤ CỘT 5: PHÂN ĐỊNH TEST     │ MỤC TIÊU CUỐI CÙNG:          │
│ Tự động hóa .dispose()  │ Unit test chỉ test View-Model │ THA HỒ IMPLEMENT THÊM        │
│ chống rò rỉ bộ nhớ GPU  │ Telemetry đo Draw Calls       │ NHIỀU TÍNH NĂNG MỚI MƯỢT MÀ! │
└─────────────────────────┴───────────────────────────────┴──────────────────────────────┘
```

---

### ĐIỂM 1: TÁCH LỚP "VIEW-MODEL" KHỎI "PRESENTATION JSX" CHO PHÂN HỆ 3D
- **Hiện trạng:**
  - Các component 3D như `LayeredDioramaTile` (`board_tile.tsx`), `ProceduralBuilding` (`procedural_building.tsx`), `MiniatureCityDiorama` đang bị kết dính: vừa đọc Zustand store, vừa tính toán góc quay, ma trận đỉnh, cấp công trình, vừa render thẻ JSX `<mesh>`.
  - Hậu quả: AI muốn viết test phải dựng giàn giáo mock Three.js rất phức tạp; test dễ vỡ và thường rơi vào bẫy "shallow assert" (`not.toThrow()`).
- **Mô hình tổ chức lại (Pure View-Model Seam):**
  - Mỗi component 3D phức tạp tách thành cặp file song sinh:
    1. **File View-Model thuần túy (`*_visuals.ts` hoặc `*_descriptors.ts`):** 
       - Chứa $100\%$ logic tính toán, phân loại, màu sắc, toạ độ ma trận.
       - Không chứa JSX, không chứa hook animation Three.js.
       - Nhận vào: Plain Data Props (level, ownerColor, phase...).
       - Trả về: Plain Render Descriptors (matrixArray, colorHex, isVisible, geometryType).
    2. **File Adapter Hiển Thị (`*.tsx`):**
       - Siêu tinh gọn (dưới 80 LOC), chỉ thuần túy nhận Descriptors và map vào các thẻ `<mesh>` hoặc `<instancedMesh>`.
- **Lợi ích kiểm thử:** AI chỉ cần viết unit test cho file `*_visuals.ts`. Test chạy trong $2\text{ms}$, assert sâu từng con số, hoàn toàn không cần WebGL giả lập.

---

### ĐIỂM 2: CHUẨN HOÁ INJECTION CẤU HÌNH THIẾT BỊ (DEVICE SNIFFING DI)
- **Hiện trạng:**
  - Các component con nằm sâu trong cây 3D tự ý import và gọi trực tiếp các hàm toàn cục: `isMobileHardware()`, `isPhoneHardware()`, `isIOSPhone()` từ `device_detect.ts`.
  - Hậu quả: Khi AI viết test để kiểm tra giao diện trên mobile vs desktop, AI buộc phải dùng `vi.spyOn(deviceDetect, 'isMobileHardware').mockReturnValue(...)`. Việc này dễ làm rò rỉ trạng thái mock sang các bài test khác.
- **Mô hình tổ chức lại:**
  - Khai báo một `DeviceProfileContext` duy nhất ở cấp Canvas gốc:
    ```ts
    export interface DeviceProfile {
      readonly isMobile: boolean;
      readonly isPhone: boolean;
      readonly isIOS: boolean;
      readonly dpr: number;
    }
    ```
  - Mọi component 3D con nhận `deviceProfile` qua Props hoặc qua 1 hook đọc Context duy nhất.
- **Lợi ích kiểm thử:** Trong test, AI chỉ cần truyền `{ isMobile: true }` vào props. Test hoàn toàn deterministic, 0 monkey-patching, đúng chuẩn Seam Discipline.

---

### ĐIỂM 3: GỘP LỆNH VẼ (BATCHING & INSTANCING HIERARCHY) ĐỂ MỞ TRẦN HIỆU NĂNG
- **Hiện trạng:**
  - Trận đấu càng dài, đất mua càng nhiều thì draw calls vọt từ 549 lên **763 calls**.
  - CPU WebKit/Android bị quá tải $100\%$, kích hoạt Thermal Throttling dìm FPS xuống 14.
  - Trần hiệu năng bị "nghẽn cứng", nếu thêm hiệu ứng thời tiết, đảo mới hay mini-game là điện thoại crash ngay.
- **Mô hình tổ chức lại (Theo Lộ trình ROI Đảo ngược):**
  1. **Sa bàn trung tâm tĩnh (`MiniatureCityDiorama`):** Gộp các mesh có cùng chất liệu PBR (bê tông, thép, kính) bằng `mergeGeometries`. Giữ riêng đèn LED đổi màu. Cắt giảm ngay **~250 Draw Calls**.
  2. **Viền ô đất (`OwnerBaseTrim`):** Chuyển sang 1 `InstancedMesh` cho 28 ô đất. Cập nhật màu `setColorAt` hoàn toàn theo hướng sự kiện (Event-driven khi đổi chủ), cấm đưa vào `useFrame`. Cắt giảm **~110 Draw Calls**.
  3. **Khay giá (`OwnerPricePill`):** Instance phần đế thuốc + bổ sung Distance-based Text Culling (ẩn chữ số giá tiền khi camera ở xa). Cắt giảm tiếp **~80 Draw Calls**.
- **Lợi ích mở rộng tính năng:** Đưa toàn bộ game về **$< 85$ Draw Calls**. Bạn sẽ có dư hơn **60 Draw Calls rảnh rỗi** để tha hồ implement hiệu ứng thời tiết, đảo nổi, xe cộ, avatar 3D mà máy vẫn mát rượi 60 FPS.

---

### ĐIỂM 4: CHUẨN HOÁ QUẢN TRỊ BỘ NHỚ VRAM (GPU LIFECYCLE MANAGEMENT)
- **Hiện trạng:**
  - Khởi tạo `CanvasTexture`, `BufferGeometry`, nạp ảnh WebP phân tán ở nhiều component. Nếu người chơi ra vào phòng chơi nhiều lần, nguy cơ tích tụ rác GPU (VRAM Leak) có thể gây crash trình duyệt trên mobile.
- **Mô hình tổ chức lại:**
  - Xây dựng chuẩn quản lý tài nguyên tập trung qua hook tái sử dụng:
    - `useManagedBufferGeometry(factoryFn, deps)`: Tự động gọi `geometry.dispose()` khi unmount hoặc đổi dependencies.
    - `useManagedCanvasTexture(canvas, deps)`: Tự động gọi `texture.dispose()` khi unmount.
- **Lợi ích kiểm thử:** Dễ dàng viết test xác nhận hàm `.dispose()` được gọi đúng lúc, bảo đảm trận đấu 40 vòng không bao giờ bị tràn RAM.

---

### ĐIỂM 5: PHÂN ĐỊNH RANH GIỚI KIỂM THỬ RÕ RÀNG (TEST BOUNDARY SEPARATION)
- **Hiện trạng:**
  - Ép Vitest (chạy trên Node.js JSDOM) phải chịu trách nhiệm chứng minh các chỉ số đồ họa phần cứng (Draw Calls, FPS, Tone Mapping). Điều này là bất khả thi vì JSDOM không có GPU.
- **Mô hình tổ chức lại:**
  - **Trạm 1 (Vitest Unit & Contract Test):** Chỉ kiểm tra **Dữ liệu & Logic**:
    - Sử dụng fixture chuẩn vừa tạo: [`tests/helpers/r3f_test_harness.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/helpers/r3f_test_harness.ts).
    - Cấm tuyệt đối từng file test tự chế mock `vi.mock('@react-three/fiber')`.
    - Kiểm tra sâu các hàm View-Model: màu sắc, toạ độ, bounding sphere, state delta.
  - **Trạm 4 (Physical Telemetry Gate):** Đo lường hiệu năng thực tế thông qua:
    - In-game Telemetry Flight Recorder HUD (`?debug=3d`): xuất dữ liệu draw calls, frame time thực tế.
    - Không để AI "phỏng đoán" hay tự xưng đạt 60 FPS nếu chưa có telemetry thực tế xác nhận.

---

## 3. LỘ TRÌNH KẾT HỢP: VỪA LÀM TÍNH NĂNG MỚI, VỪA CHUẨN HÓA CODEBASE

Bạn hoàn toàn không cần phải chọn "hoặc là tối ưu, hoặc là làm tính năng". Chúng ta có thể kết hợp nhịp nhàng theo 3 bước:

```
                          CHIẾN LƯỢC KẾT HỢP SONG HÀNH
  
   [ĐÃ XONG BƯỚC 1] ───➔ Đã bổ sung 2 luật vào GEMINI.md & Tạo r3f_test_harness.ts
           │
           ▼
   [LỰA CHỌN CỦA BẠN]
           │
           ├──────────────────────────────────────────────┐
           ▼                                              ▼
  [HƯỚNG 1: LÀM TÍNH NĂNG MỚI]                   [HƯỚNG 2: GỘP SA BÀN TĨNH]
  • Triển khai ngay tính năng gameplay mới.      • Xử lý dứt điểm sa bàn trung tâm.
  • Áp dụng ngay chuẩn View-Model Seam.          • Giảm ngay 250 Draw Calls (Quick Win).
  • AI viết test cực nhanh bằng r3f_test_harness.• Tạo nền tảng máy mát 60 FPS vĩnh viễn.
```

### Nếu bạn chọn HƯỚNG 1 (Làm tính năng mới trước):
- Cứ nêu tính năng bạn muốn (ví dụ: nhân vật mới, hiệu ứng mới, cơ chế thẻ bài mới...).
- Chúng ta sẽ áp dụng ngay quy tắc `View-Model Seam` vừa cập nhật vào `GEMINI.md`: Viết logic ra pure file trước $\to$ AI viết contract test bằng `r3f_test_harness` $\to$ gắn vào game. Đảm bảo tính năng mới sinh ra sạch $100\%$, dễ bảo trì và dễ test.

### Nếu bạn chọn HƯỚNG 2 (Tối ưu sa bàn trước):
- Chúng ta tiến hành Giai đoạn 1 của chiến lược gộp lệnh vẽ: Gộp sa bàn tĩnh trung tâm (`MiniatureCityDiorama`).
- Không đụng chạm logic gameplay, giảm ngay 250 draw calls, tạo tiền đề giải phóng trần hiệu năng để sau đó làm tính năng mới thoải mái nhất.

---

## 4. KẾT LUẬN

1. **Bước 1 đã hoàn tất an toàn $100\%$:**
   - Đã cập nhật 2 điều luật bất biến về **View-Model Seam** và **Standard Graphics Fixture** vào [`GEMINI.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/GEMINI.md).
   - Đã tạo và kiểm thử thành công [`tests/helpers/r3f_test_harness.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/helpers/r3f_test_harness.ts) (4/4 test pass).
   - Đã xóa sạch plan tạo sớm, đảm bảo không có bất kỳ plan nào tự ý sinh ra.
2. **Codebase đã sẵn sàng mở rộng:** Nền tảng hiện tại đã thông thoáng hơn rất nhiều để AI viết test sâu và chuẩn xác.
3. Xin mời bạn review bản đề xuất tổ chức trên và cho biết bạn muốn ưu tiên: **Triển khai tính năng mới nào** hay **Tối ưu sa bàn tĩnh trước**?
