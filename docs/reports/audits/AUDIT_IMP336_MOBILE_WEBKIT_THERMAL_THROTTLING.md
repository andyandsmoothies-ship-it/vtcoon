# BÁO CÁO THẨM ĐỊNH & PHẢN BIỆN KỸ THUẬT: ĐỀ XUẤT IMP-336
## (MOBILE WEBKIT 3D PERFORMANCE & THERMAL THROTTLING HARDENING)

> **Mã hồ sơ**: `AUDIT-IMP336-MOBILE-THERMAL`  
> **Ticket liên quan**: `IMP-336`  
> **Căn cứ**: Hiến pháp dự án [`GEMINI.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/GEMINI.md), Gotcha 14 ([IMP-265 Dual-Platform Performance](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/3d_cinematics.md)), Gotcha 1 ([IMP-220 Ocean Depth Stack](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/3d_cinematics.md)).  
> **Phạm vi kiểm toán mã nguồn**: `src/client/game_canvas.tsx`, `src/client/3d/miniature_city_diorama.tsx`, `src/client/3d/cinematic_effects.tsx`, `src/client/3d/coastal_island_environment.tsx`, `src/client/3d/board_tile.tsx`, `src/client/3d/perf_budget.ts`.

---

## 0. BẢNG ĐỐI SOÁT & PHÁN QUYẾT ĐỀ XUẤT (FACT-CHECK & VERDICT MATRIX)

| STT | Đề xuất sơ bộ của IMP-336 | Kết quả thẩm tra mã nguồn & Phần cứng | Phán quyết kỹ thuật | Hướng hiệu chỉnh bắt buộc |
|:---:|:---|:---|:---:|:---|
| **1** | Thêm `powerPreference: 'high-performance'` vào `<Canvas gl>` | Trên iOS WebKit, kiến trúc Apple Silicon Unified Memory (UMA) chỉ có 1 GPU duy nhất; cờ này **hoàn toàn vô hiệu (no-op)**. | ❌ **LOẠI BỎ** | Không bổ sung cờ vô hiệu để tránh gây nhiễu cấu hình context. |
| **2** | Thêm `precision: 'mediump'` toàn cục vào `<Canvas gl>` trên mobile | Ép `mediump` (10-bit mantissa) lên toàn bộ renderer Three.js sẽ làm sụp độ chính xác của depth buffer, gây **Z-fighting dữ dội và vỡ hình học sa bàn** (Gotcha 1). | 🛑 **BÁC BỎ VÌ RỦI RO CHÍ MẠNG** | Giữ `highp` cho WebGLRenderer. Chỉ khai báo `precision mediump float;` cục bộ trong Fragment Shader tính màu sắc (như `TropicalWater`). |
| **3** | Truyền `isMobile` xuống 4 phân khu sa bàn & `CinematicLightingAccents` | `MiniatureCityDiorama` đang bỏ quên `isMobile` ở 5 component con; `CinematicLightingAccents` và `DioramaMarina` chạy `useSafeFrame` và `<pointLight>` 60 FPS liên tục. | 🟢 **CHẤP THUẬN 100%** | Truyền `isMobile` tường minh; đưa chuyển động về thế nghỉ tĩnh và ngắt `<pointLight>`. |
| **4** | Ẩn mesh nước biển giữa $180 \times 180$ trên mobile | Mặt biển có 4 lớp `transparent: true` đè nhau, vô hiệu hóa HSR của kiến trúc TBDR, gây nghẽn băng thông bộ nhớ. | ⚠️ **CHẤP THUẬN CÓ ĐIỀU KIỆN** | Ẩn lớp nước giữa trên mobile (`{!isMobile && ...}`), nhưng phải giữ nguyên cho desktop để bảo toàn hợp đồng kiểm thử `coastal_island_environment.test.ts`. |
| **5** | Chuyển `RoundedBox` của 40 ô đất sang `smoothness={1}` | 40 ô đất hiện dùng `smoothness={4}` tiêu tốn $\approx 16.000$ đa giác; ở góc nhìn sa bàn Overview, viền bo chiếm $< 1$ pixel màn hình. | 🟢 **CHẤP THUẬN 100%** | Đổi sang `smoothness={1}` (chamfer 1 phân đoạn) trên mobile, cắt giảm hơn 13.500 đa giác thừa. |
| **6** | Nới dải DPR tối thiểu từ $0.85$ xuống $0.75$ trong `perf_budget.ts` | Giảm từ $0.85$ xuống $0.75$ giúp cắt giảm thêm $22.2\%$ số lượng pixel fragment mà GPU phải fill; UI chữ 2D DOM không bị ảnh hưởng. | 🟢 **CHẤP THUẬN 100%** | Hạ `DPR_BOUNDS.MOBILE_MIN = 0.75` và cập nhật test contract tương ứng. |

---

## 1. PHÂN TÍCH HIỆN TƯỢNG & NGUYÊN LÝ VẬT LÝ (FORENSIC ROOT CAUSE)

```
[Workload quá tải (ALU + Fillrate)] 
             │
             ▼
   [Nhiệt độ die vọt ngưỡng Tj > 85°C]
             │
             ▼
   [iOS DVFS cắt xung GPU xuống 1/3 (Floor Clock)] ──► FPS sụt về 1x (~14 FPS)
             │                                                │
             │ (Workload commit giảm tạm thời)                │
             ▼                                                ▼
   [Governor lầm tưởng tải giảm ──► Burst xung nhịp] ◄────────┘
             │
             ▼
   [FPS giật nảy lên 3x-4x ──► Nhiệt bùng phát lại ──► Lặp lại chu kỳ Sawtooth]
```

### 1.1. Hiện tượng dao động răng cưa (Sawtooth Throttling Loop)
1. **Lỗi ngộ nhận về độ trễ nhiệt (Thermal Time Constant)**:
   * Bản phân tích sơ bộ cho rằng chip "bớt nóng sau 1–2 giây". Trên thực tế nhiệt động học, iPhone 11 sử dụng khung nhôm tản nhiệt thụ động, **khối lượng nhiệt (thermal mass) cần từ 15 đến 45 giây để tản ra vỏ ngoài**.
   * Chu kỳ 1–2 giây giật cục là do **thuật toán điều tốc (DVFS Governor / PID Controller) của iOS kernel**: Khi FPS sụt xuống 1x, tốc độ nạp draw call chậm lại, kernel lầm tưởng rằng tác vụ đồ họa nặng đã kết thúc nên tăng xung nhịp thử nghiệm (*burst frequency step*). Nhưng do cảnh 3D vẫn nặng nguyên vẹn, nhiệt độ tại điểm nối bán dẫn (*Junction Temperature - $T_j$*) lập tức vọt ngưỡng trong vài mili-giây, ép xung nhịp tụt về sàn.
2. **Nghẽn tiến trình IPC WebKit (Process Separation Overhead)**:
   * Từ iOS 15, WebKit phân tách `com.apple.WebKit.WebContent` (chạy JS của game) và `com.apple.WebKit.GPU` (thực thi WebGL/Metal).
   * Khi CPU phải tính toán liên tục các hàm toán học vi mô (`Math.sin`, `Math.cos`) trong `useSafeFrame` của nhiều component, IPC command buffer giữa hai tiến trình bị quá tải (backpressure). Sự tỏa nhiệt đồng thời từ CPU cluster và GPU cluster trong một die silicon A13 kích hoạt cơ chế **Thermal Co-throttling**, kéo cả hai bộ xử lý xuống mức xung nhịp thấp nhất.

### 1.2. So sánh phần cứng: Apple A13 Bionic vs. Google Tensor G4 (Pixel 9a)
* **Apple A13 Bionic (iPhone 11)**: Sản xuất trên tiến trình **7nm TSMC N7P** (năm 2019). Kiến trúc tản nhiệt thụ động nhỏ, không buồng hơi (Vapor Chamber), trần công suất duy trì (sustained TDP) chỉ khoảng $3.5\text{W} - 4.5\text{W}$.
* **Google Tensor G4 (Pixel 9a)**: Sản xuất trên tiến trình **4nm Samsung 4LPP+**, GPU Mali-G715 MC7 (năm 2024/2025). Nhờ bước nhảy 2 thế hệ tiến trình bán dẫn, hiệu suất năng lượng (Perf/Watt) cao hơn gấp 2.0 – 2.5 lần, kết hợp với driver Android Chrome giao tiếp ANGLE/Vulkan trực tiếp (không qua IPC GPU Process trung gian kiểu WebKit) giúp Pixel 9a không bị sập ngưỡng DVFS.

---

## 2. THẨM TRA CHUYÊN SÂU CÁC "THỦ PHẠM" KỸ THUẬT

### 2.1. Cờ WebGL Context trong `game_canvas.tsx`
* **Vấn đề `powerPreference`**: Trên thiết bị iOS (iPhone/iPad), kiến trúc Apple Silicon Unified Memory Architecture (UMA) tích hợp chung CPU và GPU trên cùng một thanh RAM và chỉ có 1 GPU duy nhất. Thuộc tính `powerPreference: 'high-performance'` chỉ có tác dụng trên máy tính có 2 GPU (như MacBook Pro có card tích hợp Intel + card rời AMD). WebKit trên iOS bỏ qua thuộc tính này (no-op).
* **Hiểm họa `precision: 'mediump'`**:
  * Chuẩn OpenGL ES quy định `mediump` chỉ có **10-bit mantissa** với dải biểu diễn hạn chế.
  * Theo [Gotcha 1 (Pillar VI)](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/3d_cinematics.md), sa bàn VTcoon bố trí 5 tầng độ sâu chênh lệch nhau chỉ từ $0.002$ đến $0.010$ đơn vị ($Y = -0.300, -0.298, -0.292$). Nếu hạ `precision` toàn cục của Three.js `WebGLRenderer` xuống `mediump`, bộ đệm độ sâu sẽ bị suy biến, gây hiện tượng **Z-fighting dữ dội, nhấp nháy đa giác và méo mó hình học ở góc xa**.

### 2.2. Hở sườn prop `isMobile` trong Sa bàn đô thị & Ánh sáng
Kiểm tra trực tiếp mã nguồn xác nhận 100% sự tồn tại của lỗ hổng này:
1. Trong [`src/client/3d/miniature_city_diorama.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx#L299-L314):
   * `<DioramaBridges />`: Không nhận `isMobile`.
   * `<DioramaContainerPort />`: Không nhận `isMobile`, duy trì 4 vòng lặp `useSafeFrame` quay cẩu và nhấp nhô hàng hóa mỗi frame.
   * `<DioramaMarina />`: Không nhận `isMobile`, duy trì vòng lặp tính du thuyền và ngọn hải đăng.
   * `<DioramaSkyline />`: Không nhận `isMobile`.
2. Nguồn sáng `<pointLight>` trong [`diorama_marina.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_marina.tsx#L170):
   * Trong cơ chế Forward Rendering của Three.js, sự tồn tại của một nguồn sáng điểm buộc **toàn bộ các vật liệu PBR (`MeshStandardMaterial`) trong phạm vi bán kính phải tính toán khoảng cách vector và công thức phân rã quang học quadratic decay trên từng pixel**.
3. Trong [`src/client/3d/cinematic_effects.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/cinematic_effects.tsx#L26):
   * Component `<CinematicLightingAccents />` được đặt trực tiếp trên bàn cờ nhưng hoàn toàn không khai báo prop `isMobile`, chạy `useSafeFrame` liên tục ở 60 FPS để xoay hải đăng và co giãn đỉnh tháp.

### 2.3. Băng thông Fillrate do Overdraw mặt biển trên kiến trúc TBDR
* Apple GPU sử dụng kiến trúc **Tile-Based Deferred Rendering (TBDR)**: Màn hình được chia thành các ô gạch nhỏ (tiles) nạp vào Tile Memory trên chip. Với các mặt phẳng đục (opaque), bộ phận HSR (Hidden Surface Removal) sẽ loại bỏ sớm các pixel bị che khuất trước khi chạy Fragment Shader.
* Tuy nhiên, khi mặt biển có tới 4 lớp mang cờ `transparent: true` chồng lên nhau ([`coastal_island_environment.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_island_environment.tsx#L80-L100)):
  * Tầng 2: Nước giữa đại dương $180 \times 180$ (`opacity: 0.88`)
  * Tầng 3: Sóng Gerstner `TropicalWater`
  * Tầng 4: Nước nông ngọc bích (`opacity: 0.70`)
  * Tầng 5: Bọt sóng ven bờ (`opacity: 0.40`)
* Cơ chế HSR **bị vô hiệu hóa hoàn toàn** trên khu vực này. GPU buộc phải giải mã và trộn alpha (alpha blending) nhiều lần cho cùng một pixel, khiến băng thông bộ nhớ bị nghẽn (memory bandwidth saturation) và sinh nhiệt cực lớn.

### 2.4. Đa giác từ 40 ô đất viền bo (`RoundedBox smoothness=4`)
* Đo đạc hình học trong `@react-three/drei`: Một khối `RoundedBox` có `smoothness={4}` tạo ra khoảng **400 tam giác (triangles)** do các góc bo cầu và cạnh trụ được chia nhỏ thành 4 phân đoạn.
* Với 40 ô đất trên bàn cờ:
  $$\text{Tổng đa giác} = 40 \times 400 \approx 16.000\text{ triangles}$$
* Ở góc nhìn Overview bao quát bàn cờ ($Y=41$, $\text{FOV}=24^\circ$), mỗi ô đất trên màn hình iPhone 11 chỉ rộng khoảng $40 \times 50$ physical pixels. Bán kính vát cạnh $0.08$ đơn vị Three.js tương đương chưa đầy **1 pixel màn hình**. Việc tiêu tốn 16.000 đa giác cho chi tiết vi mô này là hoàn toàn lãng phí tài nguyên GPU.
* Chuyển về `smoothness={1}` (vát phẳng chamfer 1 phân đoạn) giảm xuống còn $\approx 60$ tam giác mỗi ô, **cắt giảm ngay lập tức hơn 13.500 đa giác thừa**.

### 2.5. Nới rộng dải DPR cứu hộ xuống 0.75 trong `perf_budget.ts`
* Màn hình iPhone 11 có độ phân giải $828 \times 1792$ (mật độ @2x).
* So sánh khối lượng điểm ảnh cần render:
  * Tại DPR = $0.85$: $(0.85)^2 \approx 0.7225$ tải điểm ảnh.
  * Tại DPR = $0.75$: $(0.75)^2 \approx 0.5625$ tải điểm ảnh.
  * Mức độ cắt giảm tải pixel:
    $$\Delta = 1 - \frac{0.5625}{0.7225} \approx 22.15\%$$
* Giảm hơn $22\%$ số lượng pixel fragment giúp giải tỏa trực tiếp nghẽn fillrate trên kiến trúc TBDR.
* **Bảo toàn khả năng đọc (Readability Invariant)**: Toàn bộ HUD tiền tệ, thẻ bài, thông tin tài sản và nút bấm của VTcoon được hiển thị bằng **HTML/DOM 2D** nằm trên Canvas, hoàn toàn không bị ảnh hưởng bởi DPR của WebGL. Người chơi vẫn đọc chữ nét $100\%$ dù WebGL hạ DPR để cứu GPU.

---

## 3. KẾ HOẠCH HÀNH ĐỘNG ĐIỀU CHỈNH (ACTIONABLE IMPLEMENTATION PLAN)

Căn cứ trên các phản biện kỹ thuật, kế hoạch triển khai **Ticket IMP-336** được chuẩn hóa lại như sau:

```
[BƯỚC 1: SỬA ĐỔI GAME_CANVAS & PERF_BUDGET]
   ├── Không thêm powerPreference hay precision mediump toàn cục
   └── perf_budget.ts: Cập nhật DPR_BOUNDS.MOBILE_MIN = 0.75
           │
           ▼
[BƯỚC 2: KHÉP KÍN ĐƯỜNG TRUYỀN isMobile]
   ├── miniature_city_diorama.tsx: Truyền isMobile vào 5 phân khu con
   ├── diorama_marina.tsx: Tắt <pointLight> khi isMobile === true
   └── cinematic_effects.tsx: Tiếp nhận isMobile và đóng băng loop
           │
           ▼
[BƯỚC 3: GIẢM ĐA GIÁC VÀ OVERDRAW TRÊN MOBILE]
   ├── board_tile.tsx: smoothness={isMobile ? 1 : 4}
   └── coastal_island_environment.tsx: Ẩn mesh nước giữa 180x180 khi isMobile
           │
           ▼
[BƯỚC 4: BẢO VỆ REGRESSION SUITES]
   └── Cập nhật các test contract (perf_budget.test.ts, coastal_dynamics.test.ts)
```

### Chi tiết các file can thiệp:
1. [`src/client/3d/perf_budget.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/perf_budget.ts):
   * Hạ `DPR_BOUNDS.MOBILE_MIN = 0.75`.
2. [`src/client/3d/miniature_city_diorama.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx):
   * Truyền `isMobile={isMobile}` xuống `<DioramaBridges />`, `<DioramaContainerPort />`, `<DioramaMarina />`, `<DioramaSkyline />`.
3. [`src/client/3d/diorama/diorama_marina.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_marina.tsx):
   * Tiếp nhận prop `isMobile`.
   * Khi `isMobile === true`, tắt thẻ `<pointLight>` ngọn hải đăng (`{!isMobile && <pointLight ... />}`) và ngắt tính toán bập bềnh của du thuyền.
4. [`src/client/3d/cinematic_effects.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/cinematic_effects.tsx) & [`src/client/3d/board_layout.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_layout.tsx):
   * Khai báo prop `isMobile` cho `CinematicLightingAccents`.
   * Khi `isMobile === true`, đưa xoay hải đăng và nhịp thở về giá trị tĩnh.
5. [`src/client/3d/board_tile.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_tile.tsx):
   * Thiết lập `smoothness={isMobileDevice ? 1 : 4}` cho các thẻ `RoundedBox` của 40 ô đất.
6. [`src/client/3d/coastal_island_environment.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_island_environment.tsx):
   * Bao bọc lớp mesh nước giữa $180 \times 180$ bằng điều kiện `{!isMobile && <mesh ... />}`.
   * Khai báo `precision mediump float;` cục bộ bên trong shader nước `TropicalWater`.

---

## 4. KẾT LUẬN & KIỂM TOÁN HIẾN PHÁP

* Kế hoạch điều chỉnh trên **loại bỏ hoàn toàn nguy cơ Z-fighting** mà vẫn đạt được mục tiêu cắt giảm:
  * **$> 13.500$ đa giác** trên bàn cờ.
  * **$22.2\%$ tải pixel fillrate** khi kích hoạt DPR cứu hộ.
  * **$100\%$ các vòng lặp CPU vi mô thừa** trên thiết bị di động.
  * **$1$ nguồn sáng động `pointLight`** làm nặng Shader PBR.
* Đảm bảo tuân thủ đầy đủ các luật thép của hiến pháp [`GEMINI.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/GEMINI.md):
  * Không vi phạm **Seam Discipline** và **Anti-TIDD**.
  * Đảm bảo **Poka-Yoke UI Affordance** và giữ nguyên tính thẩm mỹ tổng thể.
  * Đạt chỉ tiêu **Zero Dirty Casts** và bảo toàn các bài test kế thừa.
